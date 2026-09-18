import type { Project } from '../types';

export function compilePreview(project: Project): string {
  const files = project.files;
  let html = files['index.html']?.content ?? '';
  if (!html) return '<html><body style="background:#0a0a0f;color:#888;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p>No index.html found</p></body></html>';

  // Inline CSS files referenced by <link> tags
  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const normalized = href.replace(/^\.\//, '');
    const cssFile = files[normalized];
    if (!cssFile) return match;
    return `<style>${cssFile.content}</style>`;
  });

  // Inline JS files referenced by <script src="..."> (local only)
  html = html.replace(/<script([^>]+)src=["'](?!https?:\/\/)([^"']+)["']([^>]*)><\/script>/gi, (match, before, src, after) => {
    const normalized = src.replace(/^\.\//, '');
    const jsFile = files[normalized];
    if (!jsFile) return match;
    return `<script${before}${after}>${jsFile.content}</script>`;
  });

  return html;
}
