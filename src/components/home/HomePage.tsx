import { useState, useRef, useEffect } from 'react';
import type { Project, Settings } from '../../types';
import { getProjects, deleteProject } from '../../lib/storage';

const SUGGESTIONS = [
  'Build me a multiplayer browser game with zombies',
  'Create a modern task management app',
  'Build a 2D platformer with a knight',
  'Make a real-time chat application',
  'Create a social media dashboard',
  'Build an online store with cart',
];

const TYPE_COLORS: Record<string, string> = {
  website: '#3b82f6',
  webapp: '#8b5cf6',
  game: '#f97316',
  fullstack: '#10b981',
  other: '#888899',
};

const TYPE_LABELS: Record<string, string> = {
  website: 'Website',
  webapp: 'Web App',
  game: 'Game',
  fullstack: 'Full-stack',
  other: 'Other',
};

interface Props {
  onCreateProject: (prompt: string) => void;
  onOpenProject: (project: Project) => void;
  onOpenSettings: () => void;
  settings: Settings;
}

export default function HomePage({ onCreateProject, onOpenProject, onOpenSettings, settings }: Props) {
  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  function handleSubmit() {
    if (!prompt.trim()) return;
    onCreateProject(prompt.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  }

  function handleDelete(id: string) {
    deleteProject(id);
    setProjects(getProjects());
    setActiveMenu(null);
  }

  const hasKey = !!settings.groqApiKey;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8f4]">
      {/* Header */}
      <header className="border-b border-[#1e1e2e] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#f97316] rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="7" cy="7" r="2" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-[#e8e8f4] tracking-tight">Trev <span className="text-[#f97316]">67</span></span>
          </div>
          <div className="flex items-center gap-2">
            {!hasKey && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#f97316] border border-[#f97316]/30 rounded-lg hover:bg-[#f97316]/10 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Add API Key
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2 text-[#888899] hover:text-[#e8e8f4] hover:bg-[#1a1a24] rounded-lg transition-colors"
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <div className="pt-16 pb-12 text-center">
          <h1 className="font-display text-5xl font-bold text-[#e8e8f4] mb-3 tracking-tight leading-tight">
            What do you want to <span className="text-[#f97316]">build?</span>
          </h1>
          <p className="text-[#888899] text-lg mb-10">
            Describe your website, app, or game — Trev 67 will build it with AI.
          </p>

          {/* Prompt box */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative rounded-xl border border-[#2a2a3a] bg-[#111118] focus-within:border-[#f97316]/60 transition-colors shadow-xl">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your website, app, or game…"
                rows={3}
                className="w-full bg-transparent px-4 pt-4 pb-12 text-[#e8e8f4] placeholder-[#888899] resize-none focus:outline-none text-base leading-relaxed"
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="text-xs text-[#555568]">⌘↵ to build</span>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea6c0f] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Build
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-5 max-w-2xl mx-auto">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setPrompt(s); textareaRef.current?.focus(); }}
                className="px-3 py-1.5 text-xs text-[#888899] border border-[#2a2a3a] rounded-full hover:border-[#f97316]/50 hover:text-[#e8e8f4] hover:bg-[#f97316]/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-[#888899] uppercase tracking-widest">Recent Projects</h2>
            <span className="text-xs text-[#555568]">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New project card */}
            <button
              onClick={() => textareaRef.current?.focus()}
              className="group flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-[#2a2a3a] hover:border-[#f97316]/50 hover:bg-[#f97316]/5 transition-all"
            >
              <div className="w-10 h-10 rounded-full border-2 border-[#2a2a3a] group-hover:border-[#f97316]/50 flex items-center justify-center mb-3 transition-colors">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="text-[#555568] group-hover:text-[#f97316] transition-colors">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-[#555568] group-hover:text-[#f97316] transition-colors">New Project</span>
            </button>

            {/* Project cards */}
            {projects.map(project => (
              <div key={project.id} className="relative group rounded-xl border border-[#1e1e2e] bg-[#111118] hover:border-[#2a2a3a] transition-all overflow-hidden">
                {/* Thumbnail */}
                <div
                  className="h-28 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${TYPE_COLORS[project.type]}15, ${TYPE_COLORS[project.type]}30)` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${TYPE_COLORS[project.type]}20`, border: `1px solid ${TYPE_COLORS[project.type]}40` }}
                  >
                    {project.type === 'game' ? '🎮' : project.type === 'website' ? '🌐' : project.type === 'webapp' ? '⚡' : project.type === 'fullstack' ? '🔧' : '📁'}
                  </div>
                </div>

                {/* Info */}
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-[#e8e8f4] truncate">{project.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ color: TYPE_COLORS[project.type], background: `${TYPE_COLORS[project.type]}15` }}
                        >
                          {TYPE_LABELS[project.type]}
                        </span>
                        <span className="text-xs text-[#555568]">
                          {timeAgo(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                    {/* Menu */}
                    <div className="relative ml-2">
                      <button
                        onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === project.id ? null : project.id); }}
                        className="p-1 text-[#555568] hover:text-[#888899] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                        </svg>
                      </button>
                      {activeMenu === project.id && (
                        <div className="absolute right-0 top-6 z-20 w-36 rounded-lg border border-[#2a2a3a] bg-[#1a1a24] shadow-xl py-1">
                          <button onClick={() => { onOpenProject(project); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left text-xs text-[#e8e8f4] hover:bg-[#2a2a3a] transition-colors">Open</button>
                          <button onClick={() => handleDelete(project.id)} className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-[#2a2a3a] transition-colors">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs text-[#555568] mt-1.5 line-clamp-1">{project.description}</p>
                  )}
                </div>

                {/* Open button */}
                <button
                  onClick={() => onOpenProject(project)}
                  className="absolute inset-0 w-full h-full opacity-0"
                  aria-label={`Open ${project.name}`}
                />
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="col-span-3 mt-8 text-center py-12">
              <div className="text-4xl mb-3">✦</div>
              <p className="text-[#555568] text-sm">No projects yet. Describe what you want to build above.</p>
            </div>
          )}
        </div>
      </main>

      {/* Click outside to close menus */}
      {activeMenu && <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />}
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
