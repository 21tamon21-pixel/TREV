import { useState, useCallback } from 'react';
import type { Project, ChatMessage, Settings } from './types';
import { getSettings, saveProject, newProject, getProjects } from './lib/storage';
import { runAgent } from './lib/agent';
import HomePage from './components/home/HomePage';
import WorkspaceLayout from './components/workspace/WorkspaceLayout';
import SettingsModal from './components/settings/SettingsModal';

type View = 'home' | 'workspace';

function detectProjectType(prompt: string): Project['type'] {
  const lower = prompt.toLowerCase();
  if (/game|platformer|shooter|rpg|puzzle|zombie|survival|minecraft|phaser|canvas/.test(lower)) return 'game';
  if (/fullstack|backend|api|database|server|node/.test(lower)) return 'fullstack';
  if (/website|landing|portfolio|blog|docs/.test(lower)) return 'website';
  if (/app|dashboard|tool|manager|tracker|crm|chat/.test(lower)) return 'webapp';
  return 'other';
}

function extractProjectName(prompt: string): string {
  // Try to pull out a name from the prompt
  const cleaned = prompt
    .replace(/^(build|create|make|design)\s+(me\s+)?(a\s+|an\s+)?/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Title-case, max 30 chars
  const words = cleaned.split(' ').slice(0, 4);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 40);
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingStatus, setCreatingStatus] = useState('');

  async function handleCreateProject(prompt: string) {
    if (!settings.groqApiKey) {
      setShowSettings(true);
      return;
    }

    setIsCreating(true);
    setCreatingStatus('Planning your project…');

    const type = detectProjectType(prompt);
    const name = extractProjectName(prompt);
    const project = newProject(name, prompt, type, {});

    try {
      setCreatingStatus('Generating files with AI…');
      let responseText = '';
      const result = await runAgent(
        `Create this project: ${prompt}\n\nGenerate all necessary files to make this fully functional. Start building immediately.`,
        project,
        [],
        settings,
        (chunk) => { responseText += chunk; },
      );

      const finalProject: Project = {
        ...project,
        files: result.newFiles,
        updatedAt: Date.now(),
      };

      saveProject(finalProject);
      setActiveProject(finalProject);
      setView('workspace');
    } catch (err) {
      console.error(err);
      alert(`Failed to create project: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsCreating(false);
      setCreatingStatus('');
    }
  }

  function handleOpenProject(project: Project) {
    setActiveProject(project);
    setView('workspace');
  }

  function handleUpdateProject(updated: Project) {
    setActiveProject(updated);
  }

  function handleSettingsClose() {
    setSettings(getSettings());
    setShowSettings(false);
  }

  return (
    <div className="font-body">
      {isCreating && <CreatingOverlay status={creatingStatus} />}

      {view === 'home' ? (
        <HomePage
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
          onOpenSettings={() => setShowSettings(true)}
          settings={settings}
        />
      ) : activeProject ? (
        <WorkspaceLayout
          project={activeProject}
          settings={settings}
          onUpdateProject={handleUpdateProject}
          onGoHome={() => setView('home')}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : null}

      {showSettings && <SettingsModal onClose={handleSettingsClose} />}
    </div>
  );
}

function CreatingOverlay({ status }: { status: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#f97316]/20 border border-[#f97316]/30 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 14 14" fill="none" className="animate-spin">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#f97316" strokeWidth="1.5"/>
            <circle cx="7" cy="7" r="2" fill="#f97316"/>
          </svg>
        </div>
        <h2 className="text-xl font-display font-bold text-[#e8e8f4] mb-2">Building your project</h2>
        <p className="text-sm text-[#888899]">{status}</p>
        <div className="mt-6 w-48 mx-auto h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div className="h-full bg-[#f97316] rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
