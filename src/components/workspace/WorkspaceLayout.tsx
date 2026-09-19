import { useState, useRef, useCallback, useEffect } from 'react';
import type { Project, ChatMessage, TerminalEntry, Settings, VirtualFile, Attachment, BuildStep } from '../../types';
import { runAgent, parseBuildSteps } from '../../lib/agent';
import { saveProject } from '../../lib/storage';
import { exportProjectAsZip, scanForSecrets } from '../../lib/export';
import FileTree from './FileTree';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import CodeEditor from './CodeEditor';

type MainPanelMode = 'preview' | 'code' | 'split';
type ViewportSize = 'desktop' | 'tablet' | 'mobile' | 'custom';

const VIEWPORT_SIZES: Record<ViewportSize, { w: number; h: number; label: string }> = {
  desktop: { w: 1440, h: 900, label: 'Desktop' },
  tablet: { w: 768, h: 1024, label: 'Tablet' },
  mobile: { w: 390, h: 844, label: 'Mobile' },
  custom: { w: 800, h: 600, label: 'Custom' },
};

interface Props {
  project: Project;
  settings: Settings;
  onUpdateProject: (p: Project) => void;
  onGoHome: () => void;
  onOpenSettings: () => void;
}

export default function WorkspaceLayout({ project, settings, onUpdateProject, onGoHome, onOpenSettings }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [terminalLog, setTerminalLog] = useState<TerminalEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>(Object.keys(project.files)[0] ?? null);
  const [mainMode, setMainMode] = useState<MainPanelMode>('preview');
  const [chatTab, setChatTab] = useState<'chat' | 'terminal'>('chat');
  const [refreshKey, setRefreshKey] = useState(0);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [chatWidth, setChatWidth] = useState(340);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [secretWarning, setSecretWarning] = useState<{ file: string; match: string }[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const projectRef = useRef(project);
  projectRef.current = project;
  const draggingDivider = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Resizable chat sidebar
  function handleDividerMouseDown(e: React.MouseEvent) {
    draggingDivider.current = true;
    startX.current = e.clientX;
    startWidth.current = chatWidth;
    const onMove = (ev: MouseEvent) => {
      if (!draggingDivider.current) return;
      const delta = startX.current - ev.clientX;
      setChatWidth(Math.max(240, Math.min(600, startWidth.current + delta)));
    };
    const onUp = () => { draggingDivider.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp, { once: true });
  }

  async function handleSendMessage(text: string, attachments: Attachment[]) {
    if (!settings.groqApiKey) { onOpenSettings(); return; }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now(),
      attachments: attachments.length ? attachments : undefined,
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true,
      buildSteps: [],
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);
    setChatTab('chat');

    const controller = new AbortController();
    abortRef.current = controller;
    let accumulated = '';

    try {
      const result = await runAgent(
        text,
        projectRef.current,
        [...messages, userMsg],
        settings,
        (chunk) => {
          accumulated += chunk;
          // Parse build steps from accumulated response
          const steps = parseBuildSteps(accumulated);
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: accumulated, buildSteps: steps } : m
          ));
        },
        controller.signal,
        attachments
      );

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: result.responseText, isStreaming: false, buildSteps: result.buildSteps } : m
      ));

      if (Object.keys(result.newFiles).length > 0) {
        const updated: Project = {
          ...projectRef.current,
          files: {
            ...projectRef.current.files,
            ...result.newFiles,
          },
          updatedAt: Date.now(),
        };
        onUpdateProject(updated);
        saveProject(updated);

        // Auto-select first new file
        const newPaths = Object.keys(result.newFiles);
        if (!activeFile || !updated.files[activeFile]) setActiveFile(newPaths[0]);

        if (settings.autoPreview) setRefreshKey(k => k + 1);
      }

      setTerminalLog(prev => [...prev, ...result.terminalEntries]);

    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? {
          ...m,
          content: isAbort ? (accumulated || '*(stopped)*') : `Error: ${err instanceof Error ? err.message : String(err)}`,
          isStreaming: false,
        } : m
      ));
      if (!isAbort) {
        setTerminalLog(prev => [...prev, { type: 'error', text: `Error: ${err instanceof Error ? err.message : String(err)}`, timestamp: Date.now() }]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleFileChange(path: string, content: string) {
    const updated: Project = {
      ...project,
      files: { ...project.files, [path]: { ...project.files[path], content, lastModified: Date.now() } },
      updatedAt: Date.now(),
    };
    onUpdateProject(updated);
    saveProject(updated);
    if (settings.autoPreview) setRefreshKey(k => k + 1);
  }

  function handleDeleteFile(path: string) {
    const { [path]: _, ...rest } = project.files;
    const updated: Project = { ...project, files: rest, updatedAt: Date.now() };
    onUpdateProject(updated);
    saveProject(updated);
    if (activeFile === path) setActiveFile(Object.keys(rest)[0] ?? null);
  }

  async function handleExport() {
    const secrets = scanForSecrets(project);
    if (secrets.length > 0) {
      setSecretWarning(secrets);
      return;
    }
    setExportStatus('Zipping…');
    try {
      await exportProjectAsZip(project);
      setExportStatus('Downloaded!');
    } catch (e) {
      setExportStatus('Export failed');
    } finally {
      setTimeout(() => setExportStatus(null), 2500);
    }
  }

  const typeColors: Record<string, string> = {
    game: '#f97316', website: '#3b82f6', webapp: '#8b5cf6', fullstack: '#10b981', other: '#888899',
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-[#e8e8f4] overflow-hidden">
      {/* Secret warning banner */}
      {secretWarning.length > 0 && (
        <div className="bg-yellow-900/40 border-b border-yellow-700/50 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="#fbbf24"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          <span className="text-sm text-yellow-300 flex-1">
            Possible secret in: {secretWarning.map(s => `${s.file} (${s.match})`).join(', ')}. Review before exporting.
          </span>
          <button onClick={() => { setSecretWarning([]); exportProjectAsZip(project); }} className="text-xs text-yellow-300 hover:text-white border border-yellow-700/50 px-2 py-1 rounded">Export anyway</button>
          <button onClick={() => setSecretWarning([])} className="text-yellow-500 hover:text-yellow-300">✕</button>
        </div>
      )}

      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1e1e2e] bg-[#111118] flex-shrink-0">
        <button onClick={onGoHome} className="flex items-center gap-1.5 text-[#888899] hover:text-[#e8e8f4] transition-colors flex-shrink-0">
          <div className="w-5 h-5 bg-[#f97316] rounded flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="white"><path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="7" cy="7" r="2" fill="white"/></svg>
          </div>
          <span className="text-xs font-semibold hidden sm:inline">Trev <span className="text-[#f97316]">67</span></span>
        </button>

        <div className="w-px h-4 bg-[#2a2a3a]" />

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
            style={{ color: typeColors[project.type], background: `${typeColors[project.type]}15` }}>
            {project.type}
          </span>
          <span className="text-sm font-medium text-[#e8e8f4] truncate">{project.name}</span>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
            <span className="text-xs text-[#f97316]">Building</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Panel toggle */}
        <div className="flex items-center gap-1 bg-[#0a0a0f] rounded-lg p-1 border border-[#1e1e2e] flex-shrink-0">
          {(['preview', 'code', 'split'] as const).map(mode => (
            <button key={mode} onClick={() => setMainMode(mode)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors capitalize ${mainMode === mode ? 'bg-[#1a1a24] text-[#e8e8f4]' : 'text-[#555568] hover:text-[#888899]'}`}>
              {mode}
            </button>
          ))}
        </div>

        {/* Viewport selector */}
        <select
          value={viewport}
          onChange={e => setViewport(e.target.value as ViewportSize)}
          className="text-xs bg-[#0a0a0f] border border-[#1e1e2e] text-[#888899] rounded px-2 py-1 focus:outline-none"
        >
          {(Object.entries(VIEWPORT_SIZES) as [ViewportSize, { label: string }][]).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#888899] hover:text-[#e8e8f4] border border-[#2a2a3a] hover:border-[#3a3a4a] rounded-lg transition-colors flex-shrink-0"
        >
          {exportStatus ?? (
            <>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              Export
            </>
          )}
        </button>

        <button onClick={onOpenSettings} className="p-1.5 text-[#555568] hover:text-[#e8e8f4] transition-colors flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
        </button>
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: File tree */}
        <div className="w-44 flex-shrink-0 border-r border-[#1e1e2e] overflow-hidden">
          <FileTree
            project={project}
            activeFile={activeFile}
            onSelectFile={path => { setActiveFile(path); if (mainMode !== 'code' && mainMode !== 'split') setMainMode('code'); }}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        {/* Center: main panel (preview / code / split) */}
        <div className="flex-1 min-w-0">
          {mainMode === 'preview' && (
            <PreviewPanel project={project} refreshKey={refreshKey} viewport={VIEWPORT_SIZES[viewport]} />
          )}
          {mainMode === 'code' && (
            <CodeEditor project={project} activeFile={activeFile} onFileChange={handleFileChange} onSelectFile={setActiveFile} />
          )}
          {mainMode === 'split' && (
            <div className="h-full flex">
              <div className="flex-1 min-w-0 border-r border-[#1e1e2e]">
                <CodeEditor project={project} activeFile={activeFile} onFileChange={handleFileChange} onSelectFile={setActiveFile} />
              </div>
              <div className="flex-1 min-w-0">
                <PreviewPanel project={project} refreshKey={refreshKey} viewport={VIEWPORT_SIZES[viewport]} />
              </div>
            </div>
          )}
        </div>

        {/* Drag divider */}
        {!chatCollapsed && (
          <div
            className="w-1 flex-shrink-0 cursor-col-resize bg-[#1e1e2e] hover:bg-[#f97316]/40 transition-colors active:bg-[#f97316]/60"
            onMouseDown={handleDividerMouseDown}
          />
        )}

        {/* Right: Chat sidebar */}
        <div
          className="flex-shrink-0 border-l border-[#1e1e2e] flex overflow-hidden transition-all duration-200"
          style={{ width: chatCollapsed ? '40px' : `${chatWidth}px` }}
        >
          {chatCollapsed ? (
            /* Collapsed state — just a slim expand button */
            <div className="w-full flex flex-col items-center justify-center">
              <button
                onClick={() => setChatCollapsed(false)}
                className="p-2 text-[#555568] hover:text-[#f97316] transition-colors"
                title="Show chat"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              </button>
              {isStreaming && <div className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse mt-2" />}
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0 relative">
              {/* Collapse button */}
              <button
                onClick={() => setChatCollapsed(true)}
                className="absolute top-2 right-2 z-10 p-1.5 text-[#555568] hover:text-[#888899] bg-[#111118] border border-[#1e1e2e] rounded transition-colors"
                title="Hide chat"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
              </button>
              <ChatPanel
                messages={messages}
                terminalLog={terminalLog}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStop={() => abortRef.current?.abort()}
                onClear={() => setMessages([])}
                activeTab={chatTab}
                onTabChange={setChatTab}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
