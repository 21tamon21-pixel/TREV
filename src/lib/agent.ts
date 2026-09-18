import type { Project, VirtualFile, ChatMessage, TerminalEntry, Settings } from '../types';
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

You can output as many files as needed. Always include an index.html.

## Rules

- Generate COMPLETE, working code — not snippets or placeholders
- Make projects self-contained and runnable in a browser iframe
- For React apps: use CDN imports (<script src="https://unpkg.com/react@18/umd/react.development.js"></script> and Babel standalone)
- For games: use HTML5 Canvas or WebGL with vanilla JS
- For complex apps: split into multiple files (index.html, style.css, script.js, etc.)
- Use modern CSS (flexbox, grid, custom properties)
- Make UIs beautiful with dark themes and attention to detail
- Add interactivity — games must be actually playable
- Use localStorage for data persistence where appropriate
- NEVER say "I'll create this" without actually creating the files

## When modifying existing projects

1. Read the current files carefully
2. Make surgical edits — don't rewrite everything
3. Output only the files that changed
4. Explain briefly what you changed and why

## Project type detection

Detect from the prompt:
- "game", "platformer", "shooter", "survival", "puzzle" → game
- "app", "tool", "dashboard", "tracker", "manager" → webapp
- "website", "landing", "portfolio", "blog" → website
- "fullstack", "api", "backend" → fullstack`;

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    html: 'html', css: 'css', js: 'javascript', ts: 'typescript',
    tsx: 'typescriptreact', jsx: 'javascriptreact', json: 'json',
    md: 'markdown', py: 'python', txt: 'plaintext',
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
      content: content.trim(),
      language: detectLanguage(path),
      lastModified: Date.now(),
    };
  }
  return files;
}

function buildContext(project: Project | null): string {
  if (!project || Object.keys(project.files).length === 0) return '';
  const MAX_CHARS = 12000;
  let context = '\n\n## Current project files\n';
  let chars = 0;
  for (const [path, file] of Object.entries(project.files)) {
    const entry = `\n### ${path}\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n`;
    if (chars + entry.length > MAX_CHARS) {
      context += `\n(${Object.keys(project.files).length - Object.keys(project.files).indexOf(path)} more files truncated)`;
      break;
    }
    context += entry;
    chars += entry.length;
  }
  return context;
}

export interface AgentResult {
  responseText: string;
  newFiles: Record<string, VirtualFile>;
  terminalEntries: TerminalEntry[];
}

export async function runAgent(
  userMessage: string,
  project: Project | null,
  conversationHistory: ChatMessage[],
  settings: Settings,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<AgentResult> {
  const systemContent = SYSTEM_PROMPT + buildContext(project);

  const messages: GroqMessage[] = [
    { role: 'system', content: systemContent },
    ...conversationHistory.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const terminalEntries: TerminalEntry[] = [
    { type: 'command', text: '$ trev67 run-agent', timestamp: Date.now() },
    { type: 'info', text: `Model: ${settings.model}`, timestamp: Date.now() },
    { type: 'info', text: 'Sending request to Groq...', timestamp: Date.now() },
  ];

  const responseText = await streamGroq(messages, settings, onChunk, signal);
  const newFiles = parseFiles(responseText);

  if (Object.keys(newFiles).length > 0) {
    terminalEntries.push({ type: 'success', text: `✓ Generated ${Object.keys(newFiles).length} file(s)`, timestamp: Date.now() });
    for (const path of Object.keys(newFiles)) {
      terminalEntries.push({ type: 'output', text: `  write ${path}`, timestamp: Date.now() });
    }
  }

  return { responseText, newFiles, terminalEntries };
}
