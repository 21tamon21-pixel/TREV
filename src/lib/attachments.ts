import type { Attachment } from '../types';

export async function readFileAsAttachment(file: File): Promise<Attachment> {
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    const content = await readAsDataURL(file);
    return { type: 'image', name: file.name, content, mimeType: file.type, size: file.size };
  }

  const content = await readAsText(file);
  return { type: 'text', name: file.name, content, mimeType: file.type || 'text/plain', size: file.size };
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/** Read a directory via webkitdirectory input and return all file attachments */
export async function readDirectoryFiles(files: FileList): Promise<{ path: string; content: string }[]> {
  const results: { path: string; content: string }[] = [];
  const textExtensions = new Set(['html', 'css', 'js', 'ts', 'tsx', 'jsx', 'json', 'md', 'txt', 'yaml', 'yml', 'toml', 'sh', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'svg']);

  for (const file of Array.from(files)) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!textExtensions.has(ext)) continue;
    if (file.size > 200000) continue; // skip large files

    const content = await readAsText(file);
    // Use webkitRelativePath for the full path
    const path = (file as { webkitRelativePath?: string }).webkitRelativePath || file.name;
    results.push({ path, content });
  }
  return results;
}
