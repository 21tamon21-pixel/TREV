import type { Project, VirtualFile, ChatMessage, TerminalEntry, Settings, Attachment, BuildStep } from '../types';
import { streamGroq, type GroqMessage } from './groq';

const SYSTEM_PROMPT = `You are Trev 67's AI coding agent — a powerful local-first builder for websites, web apps, and browser games.

You generate complete, runnable browser projects. All projects must work in an iframe (no server required).

## Output format

After your explanation, output files using this exact format:
<file path="index.html">
file content here
</file>

<file path="style.css">
css content here
</file>

Output as many files as needed. Always include an index.html as the entry point.

## Build steps format (use this to show progress)

At the start of a build, output a plan:
<steps>
Analyzing request
Designing project structure
Creating HTML/CSS/JS files
Adding interactivity
Finalizing
</steps>

## Clarification detection

If a request is too vague to build properly (e.g. "make an app", "build something"), respond with:
<clarify>
What type of app are you building? For example:
- Task manager with categories and due dates
- Social dashboard with charts
- 2D platformer game with enemies
</clarify>

If the user attached a reference image, acknowledge it in your response and use it to inform the design.

## Rules

- Generate COMPLETE, working code — not snippets or placeholders
- Make projects self-contained and runnable in a browser iframe
- For React apps: use CDN imports + Babel standalone
- For games: use HTML5 Canvas or WebGL with vanilla JS
- For complex apps: split into multiple files (index.html, style.css, script.js, etc.)
- Use modern CSS (flexbox, grid, custom properties)
- Make UIs beautiful — dark themes by default, attention to detail
- Add real interactivity — games must be playable, apps must work
- Use localStorage for data persistence
- NEVER say "I'll create this" without outputting the actual <file> blocks

## When modifying existing projects

1. Inspect the current files carefully
2. Make surgical edits — only change what needs changing
3. Output ONLY the files that changed
4. Explain briefly what changed and why`;

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    html: 'html', css: 'css', js: 'javascript', ts: 'typescript',
    tsx: 'typescriptreact', jsx: 'javascriptreact', json: 'json',
    md: 'markdown', py: 'python', txt: 'plaintext', svg: 'xml',
    yaml: 'yaml', yml: 'yaml', toml: 'ini', sh: 'shell',
  };
  return map[ext ?? ''] ?? 'plaintext';
}

export function parseFiles(response: string): Record<string, VirtualFile> {
  const files: Record<string, VirtualFile> = {};
  const regex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  let match;
  while ((match = regex.exec(response)) !== null) {
    const [, path, content] = match;
    files[path] = {
      content: content.replace(/^\n/, '').replace(/\n$/, ''),
      language: detectLanguage(path),
      lastModified: Date.now(),
      aiModified: true,
    };
  }
  return files;
}

export function parseBuildSteps(response: string): BuildStep[] {
  const match = /<steps>([\s\S]*?)<\/steps>/.exec(response);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map((label, i) => ({ id: String(i), label, status: 'pending' as const }));
}

export function parseClarification(response: string): string | null {
  const match = /<clarify>([\s\S]*?)<\/clarify>/.exec(response);
  return match ? match[1].trim() : null;
}

/** Detect if a user prompt is too vague to build without clarification */
export function isVaguePrompt(prompt: string): boolean {
  const lower = prompt.toLowerCase().trim();
  if (lower.length < 15) return true;
  const vaguePatterns = [
    /^(make|build|create|do)\s+(an?\s+)?(app|website|thing|project|it|something)$/i,
    /^(help|test|demo|example|sample)$/i,
    /^(cool|nice|good|great)\s+(app|website|thing)$/i,
  ];
  return vaguePatterns.some(p => p.test(lower));
}

function buildContext(project: Project | null): string {
  if (!project || Object.keys(project.files).length === 0) return '';
  const MAX_CHARS = 14000;
  let context = '\n\n## Current project files\n';
  let chars = 0;
  const entries = Object.entries(project.files);
  for (const [path, file] of entries) {
    // Skip large generated files that don't help the AI
    if (file.content.length > 4000 && !['index.html', 'App.tsx', 'main.ts', 'game.js'].includes(path.split('/').pop() ?? '')) {
      context += `\n### ${path} (${file.content.length} chars — truncated)\n`;
      continue;
    }
    const entry = `\n### ${path}\n\`\`\`${file.language}\n${file.content.slice(0, 3000)}\n\`\`\`\n`;
    if (chars + entry.length > MAX_CHARS) {
      context += `\n(${entries.length - entries.indexOf([path, file])} more files not shown)`;
      break;
    }
    context += entry;
    chars += entry.length;
  }
  return context;
}

function buildAttachmentContext(attachments: Attachment[]): string {
  if (!attachments.length) return '';
  let ctx = '\n\n## User-provided attachments\n';
  for (const att of attachments) {
    if (att.type === 'image') {
      ctx += `\n- **Reference image**: "${att.name}" (${att.mimeType}, ${Math.round(att.size / 1024)}KB)\n  Use this image as a visual reference for the design — match its layout, color palette, and component structure.\n`;
    } else {
      ctx += `\n### Attached file: ${att.name}\n\`\`\`\n${att.content.slice(0, 3000)}\n\`\`\`\n`;
    }
  }
  return ctx;
}

export interface AgentResult {
  responseText: string;
  newFiles: Record<string, VirtualFile>;
  terminalEntries: TerminalEntry[];
  buildSteps: BuildStep[];
  clarification: string | null;
}

export async function runAgent(
  userMessage: string,
  project: Project | null,
  conversationHistory: ChatMessage[],
  settings: Settings,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  attachments?: Attachment[]
): Promise<AgentResult> {
  const systemContent = SYSTEM_PROMPT
    + buildContext(project)
    + (attachments?.length ? buildAttachmentContext(attachments) : '');

  const messages: GroqMessage[] = [
    { role: 'system', content: systemContent },
    ...conversationHistory.slice(-12).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const terminalEntries: TerminalEntry[] = [
    { type: 'command', text: '$ trev67 agent run', timestamp: Date.now() },
    { type: 'info', text: `Model: ${settings.model}`, timestamp: Date.now() },
  ];

  const responseText = await streamGroq(messages, settings, onChunk, signal);
  const newFiles = parseFiles(responseText);
  const buildSteps = parseBuildSteps(responseText);
  const clarification = parseClarification(responseText);

  if (Object.keys(newFiles).length > 0) {
    terminalEntries.push({ type: 'success', text: `✓ ${Object.keys(newFiles).length} file(s) written`, timestamp: Date.now() });
    for (const path of Object.keys(newFiles)) {
      terminalEntries.push({ type: 'output', text: `  write  ${path}`, timestamp: Date.now() });
    }
  }

  return { responseText, newFiles, terminalEntries, buildSteps, clarification };
}
