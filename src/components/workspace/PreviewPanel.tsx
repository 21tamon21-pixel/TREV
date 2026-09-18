import { useEffect, useRef, useState } from 'react';
import type { Project } from '../../types';
import { compilePreview } from '../../lib/preview';

interface Props {
  project: Project;
  refreshKey: number;
}

export default function PreviewPanel({ project, refreshKey }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!iframeRef.current) return;
    const html = compilePreview(project);
    setLoading(true);
    setError(null);
    try {
      iframeRef.current.srcdoc = html;
    } catch (e) {
      setError(String(e));
    }
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [project.id, refreshKey]);

  const hasFiles = Object.keys(project.files).length > 0;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e1e2e] bg-[#111118]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-2 px-3 py-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded text-xs text-[#555568] font-mono truncate">
          {project.name.toLowerCase().replace(/\s+/g, '-')}/index.html
        </div>
        <button
          onClick={() => {
            if (iframeRef.current) {
              const html = compilePreview(project);
              iframeRef.current.srcdoc = html;
            }
          }}
          className="p-1.5 text-[#555568] hover:text-[#e8e8f4] transition-colors"
          title="Refresh"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 relative">
        {!hasFiles && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="text-4xl mb-3">👁</div>
            <p className="text-sm text-[#555568]">Preview will appear here once your project is built.</p>
          </div>
        )}
        {error && (
          <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-red-900/30 border-b border-red-800/50 text-xs text-red-400 font-mono">
            {error}
          </div>
        )}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#f97316]/20">
            <div className="h-full bg-[#f97316] animate-[progress_0.3s_ease-out_forwards]" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
          title="Preview"
        />
      </div>
    </div>
  );
}
