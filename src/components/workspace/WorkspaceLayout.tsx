import { useState, useCallback, useRef } from 'react';
import type { Project, ChatMessage, TerminalEntry, Settings, VirtualFile } from '../../types';
import { runAgent } from '../../lib/agent';
import { saveProject } from '../../lib/storage';
import FileTree from './FileTree';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import CodeEditor from './CodeEditor';

type PanelMode = 'preview' | 'code';

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
  const [activeFile, setActiveFile] = useState<string | null>(
    Object.keys(project.files)[0] ?? null
  );
  const [panelMode, setPanelMode] = useState<PanelMode>('preview');
  const [chatTab, setChatTab] = useState<'chat' | 'terminal'>('chat');
  const [refreshKey, setRefreshKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const projectRef = useRef(project);
  projectRef.current = project;

  async function handleSendMessage(text: string) {
    if (!settings.groqApiKey) {
      onOpenSettings();
      return;
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);
    setChatTab('chat');

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulatedContent = '';

    try {
      const result = await runAgent(
        text,
        projectRef.current,
        [...messages, userMsg],
        settings,
        (chunk) => {
          accumulatedContent += chunk;
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: accumulatedContent } : m
          ));
        },
        controller.signal
      );

      // Finalize message
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: result.responseText, isStreaming: false } : m
      ));

      // Apply file changes
      if (Object.keys(result.newFiles).length > 0) {
        const updated: Project = {
          ...projectRef.current,
          files: { ...projectRef.current.files, ...result.newFiles },
          updatedAt: Date.now(),
        };
        onUpdateProject(updated);
        saveProject(updated);

        // Select first changed file if none active
        const newPaths = Object.keys(result.newFiles);
        if (!activeFile || !updated.files[activeFile]) {
          setActiveFile(newPaths[0]);
        }

        if (settings.autoPreview) {
          setRefreshKey(k => k + 1);
        }
      }

      setTerminalLog(prev => [...prev, ...result.terminalEntries]);

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: accumulatedContent || '*(stopped)*', isStreaming: false } : m
        ));
      } else {
        const errMsg = err instanceof Error ? err.message : String(err);
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: `Error: ${errMsg}`, isStreaming: false } : m
        ));
        setTerminalLog(prev => [...prev, { type: 'error', text: `Error: ${errMsg}`, timestamp: Date.now() }]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  function handleFileChange(path: string, content: string) {
    const updated: Project = {
      ...project,
      files: {
        ...project.files,
        [path]: { ...project.files[path], content, lastModified: Date.now() },
      },
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

  const typeColors: Record<string, string> = { game: '#f97316', website: '#3b82f6', webapp: '#8b5cf6', fullstack: '#10b981', other: '#888899' };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-[#e8e8f4] overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-2.5 border-b border-[#1e1e2e] bg-[#111118] flex-shrink-0">
        <button onClick={onGoHome} className="flex items-center gap-1.5 text-[#888899] hover:text-[#e8e8f4] transition-colors">
          <div className="w-5 h-5 bg-[#f97316] rounded flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="white">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="text-xs font-semibold">Trev <span className="text-[#f97316]">67</span></span>
        </button>

        <div className="w-px h-4 bg-[#2a2a3a]" />

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ color: typeColors[project.type], background: `${typeColors[project.type]}15` }}
          >
            {project.type}
          </span>
          <span className="text-sm font-medium text-[#e8e8f4] truncate">{project.name}</span>
        </div>

        <div className="flex-1" />

        {/* Panel toggles */}
        <div className="flex items-center gap-1 bg-[#0a0a0f] rounded-lg p-1 border border-[#1e1e2e]">
          {(['preview', 'code'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setPanelMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors capitalize ${panelMode === mode ? 'bg-[#1a1a24] text-[#e8e8f4]' : 'text-[#555568] hover:text-[#888899]'}`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="px-3 py-1.5 text-xs font-medium text-[#e8e8f4] bg-[#1a1a24] hover:bg-[#2a2a3a] border border-[#2a2a3a] rounded-lg transition-colors"
        >
          ↺ Refresh
        </button>

        <button onClick={onOpenSettings} className="p-1.5 text-[#555568] hover:text-[#e8e8f4] transition-colors">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
          </svg>
        </button>
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: File tree */}
        <div className="w-48 flex-shrink-0 border-r border-[#1e1e2e] overflow-hidden">
          <FileTree
            project={project}
            activeFile={activeFile}
            onSelectFile={path => { setActiveFile(path); if (panelMode !== 'code') setPanelMode('code'); }}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        {/* Center: Chat */}
        <div className="flex-1 min-w-0 border-r border-[#1e1e2e]">
          <ChatPanel
            messages={messages}
            terminalLog={terminalLog}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            onStop={handleStop}
            onClear={() => setMessages([])}
            activeTab={chatTab}
            onTabChange={setChatTab}
          />
        </div>

        {/* Right: Preview or Code */}
        <div className="flex-1 min-w-0">
          {panelMode === 'preview' ? (
            <PreviewPanel project={project} refreshKey={refreshKey} />
          ) : (
            <CodeEditor
              project={project}
              activeFile={activeFile}
              onFileChange={handleFileChange}
              onSelectFile={setActiveFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
