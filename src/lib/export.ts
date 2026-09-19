import JSZip from 'jszip';
import type { Project } from '../types';

/** Generate a README.md for a generated project */
function generateReadme(project: Project): string {
  const typeLabel: Record<string, string> = {
    website: 'Website', webapp: 'Web App', game: 'Browser Game',
    fullstack: 'Full-Stack App', other: 'Project',
  };
  return `# ${project.name}

${project.description}

**Type:** ${typeLabel[project.type] || 'Project'}
**Created with:** [Trev 67](https://github.com/your-username/trev-67) — local AI builder

## Getting Started

Open \`index.html\` in your browser — no build step required.

For projects using npm dependencies, run:

\`\`\`bash
npm install
npm run dev
\`\`\`

## Files

${Object.keys(project.files).map(f => `- \`${f}\``).join('\n')}

---

*Built with Trev 67 — powered by Groq AI*
`;
}

/** Generate a .gitignore for a generated project */
function generateGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# Editor
.DS_Store
Thumbs.db
.vscode/
.idea/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
*.tsbuildinfo
`;
}

/** Download the project as a ZIP file */
export async function exportProjectAsZip(project: Project): Promise<void> {
  const zip = new JSZip();

  // Add all project files
  for (const [path, file] of Object.entries(project.files)) {
    zip.file(path, file.content);
  }

  // Add README and .gitignore if not present
  if (!project.files['README.md']) {
    zip.file('README.md', generateReadme(project));
  }
  if (!project.files['.gitignore']) {
    zip.file('.gitignore', generateGitignore());
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Check project files for potential secrets before export */
export function scanForSecrets(project: Project): { file: string; match: string }[] {
  const patterns = [
    { re: /sk-[a-zA-Z0-9]{32,}/g, label: 'OpenAI key' },
    { re: /gsk_[a-zA-Z0-9]{32,}/g, label: 'Groq key' },
    { re: /ghp_[a-zA-Z0-9]{36,}/g, label: 'GitHub token' },
    { re: /AKIA[0-9A-Z]{16}/g, label: 'AWS access key' },
    { re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, label: 'Private key' },
    { re: /password\s*=\s*["'][^"']{8,}/gi, label: 'Hardcoded password' },
  ];

  const findings: { file: string; match: string }[] = [];
  for (const [path, file] of Object.entries(project.files)) {
    for (const { re, label } of patterns) {
      if (re.test(file.content)) {
        findings.push({ file: path, match: label });
        re.lastIndex = 0;
      }
    }
  }
  return findings;
}
