import { useEffect, useRef, useState } from 'react';
import type { Project } from '../../types';
import { compilePreview } from '../../lib/preview';

interface ViewportConfig {
  w: number;
  h: number;
  label: string;
}

interface Props {
  project: Project;
  refreshKey: number;
  viewport?: ViewportConfig;
}

export default function PreviewPanel({ project, refreshKey, viewport }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const hasFiles = Object.keys(project.files).length > 0;

  useEffect(() => {
    if (!iframeRef.current) return;
    const html = compilePreview(project);
    setLoading(true);
    setRuntimeError(null);
    iframeRef.current.srcdoc = html;
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [project.id, refreshKey]);

  // Listen for runtime errors from iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'trev67-runtime-error') {
        setRuntimeError(e.data.message);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function refresh() {
    if (!iframeRef.current) return;
    iframeRef.current.srcdoc = compilePreview(project);
    setRuntimeError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }

  const isConstrained = viewport && viewport.label !== 'Desktop';

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e1e2e] bg-[#111118] flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-2 px-2.5 py-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded text-xs text-[#555568] font-mono truncate">
          {hasFiles ? `${project.name.toLowerCase().replace(/\s+/g, '-')}/index.html` : 'no preview'}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="w-3 h-3 rounded-full border-2 border-[#f97316] border-t-transparent animate-spin flex-shrink-0" />
        )}

        <button onClick={refresh} className="p-1.5 text-[#555568] hover:text-[#e8e8f4] transition-colors" title="Refresh">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 relative overflow-hidden">
        {!hasFiles && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="text-4xl mb-3 opacity-30">👁</div>
            <p className="text-sm text-[#555568]">Preview will appear here once the AI builds your project.</p>
          </div>
        )}

        {runtimeError && (
          <div className="absolute top-0 left-0 right-0 z-10 flex items-start gap-2 px-3 py-2.5 bg-red-950/80 border-b border-red-800/50 backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="#f87171" className="flex-shrink-0 mt-0.5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            <span className="text-xs text-red-300 font-mono flex-1 break-all">{runtimeError}</span>
            <button onClick={() => setRuntimeError(null)} className="text-red-500 hover:text-red-300 flex-shrink-0">✕</button>
          </div>
        )}

        {isConstrained ? (
          /* Viewport-constrained preview with frame */
          <div className="h-full overflow-auto flex items-start justify-center p-4 bg-[#060608]">
            <div
              className="bg-white shadow-2xl flex-shrink-0 overflow-hidden"
              style={{ width: viewport.w, maxWidth: '100%' }}
            >
              <iframe
                ref={iframeRef}
                className="w-full border-0"
                style={{ height: viewport.h }}
                sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                title="Preview"
              />
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            title="Preview"
          />
        )}
      </div>
    </div>
  );
}
