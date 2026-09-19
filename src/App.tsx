import { useEffect, useState } from 'react';
import type { Project, Settings, Attachment } from './types';
import { getSettings, saveProject, newProject } from './lib/storage';
import { runAgent, isVaguePrompt } from './lib/agent';
import HomePage from './components/home/HomePage';
import WorkspaceLayout from './components/workspace/WorkspaceLayout';
import SettingsModal from './components/settings/SettingsModal';
import ClarificationModal from './components/ClarificationModal';

type View = 'home' | 'workspace';

interface PendingBuild {
  prompt: string;
  clarificationText?: string;
}

const ACCENT_PRESETS: Record<string, string> = {
  orange: '#f97316',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  red: '#ef4444',
};

function applySettings(settings: Settings) {
  const root = document.documentElement;
  const accent = settings.accentColor === 'custom'
    ? settings.customAccent
    : ACCENT_PRESETS[settings.accentColor] ?? ACCENT_PRESETS.orange;

  root.style.setProperty('--trev-accent', accent);
  root.style.setProperty('--trev-ui-scale', String(settings.uiScale / 100));
  root.dataset.theme = settings.theme;

  document.body.dataset.theme = settings.theme;
  document.body.dataset.compact = settings.compactMode ? 'true' : 'false';
  document.body.dataset.font = settings.fontFamily;
  document.body.dataset.chatDensity = settings.chatDensity;
  document.body.dataset.sidebarPosition = settings.sidebarPosition;
}

function detectProjectType(prompt: string): Project['type'] {
  const lower = prompt.toLowerCase();
  if (/game|platformer|shooter|rpg|puzzle|zombie|survival|minecraft|phaser|canvas|arcade/.test(lower)) return 'game';
  if (/fullstack|backend|api|database|server|node|express/.test(lower)) return 'fullstack';
  if (/website|landing|portfolio|blog|docs|documentation/.test(lower)) return 'website';
  if (/app|dashboard|tool|manager|tracker|crm|chat|social|booking/.test(lower)) return 'webapp';
  return 'other';
}

function extractProjectName(prompt: string): string {
  const cleaned = prompt
    .replace(/^(build|create|make|design|generate)\s+(me\s+)?(a\s+|an\s+)?/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.split(' ').slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 42);
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingStatus, setCreatingStatus] = useState('');
  const [creatingProgress, setCreatingProgress] = useState(0);
  const [pendingBuild, setPendingBuild] = useState<PendingBuild | null>(null);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  async function handleCreateProject(prompt: string, attachments?: Attachment[]) {
    if (!settings.groqApiKey) {
      setShowSettings(true);
      return;
    }

    setIsCreating(true);
    setCreatingProgress(10);
    setCreatingStatus('Planning your project…');

    const type = detectProjectType(prompt);
    const name = extractProjectName(prompt);
    const skeleton = newProject(name, prompt, type, {});

    try {
      setCreatingProgress(30);
      setCreatingStatus('Generating files with AI…');

      const result = await runAgent(
        `Create this project from scratch: ${prompt}\n\nGenerate all necessary files. Make it complete and working. Start with index.html and add all required files.`,
        skeleton,
        [],
        settings,
        (_chunk) => {
          setCreatingProgress(p => Math.min(90, p + 1));
        },
        undefined,
        attachments
      );

      setCreatingProgress(95);
      setCreatingStatus('Setting up workspace…');

      const finalProject: Project = {
        ...skeleton,
        files: result.newFiles,
        updatedAt: Date.now(),
      };

      saveProject(finalProject);
      setActiveProject(finalProject);
      setCreatingProgress(100);

      setTimeout(() => {
        setIsCreating(false);
        setCreatingProgress(0);
        setView('workspace');
      }, 300);

    } catch (err) {
      setIsCreating(false);
      setCreatingProgress(0);
      alert(`Build failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function handlePromptSubmit(prompt: string) {
    if (!settings.groqApiKey) {
      setShowSettings(true);
      return;
    }
    if (isVaguePrompt(prompt)) {
      setPendingBuild({ prompt });
      return;
    }
    handleCreateProject(prompt);
  }

  function handleClarificationConfirm(extra: string, attachments: Attachment[]) {
    if (!pendingBuild) return;
    const fullPrompt = extra ? `${pendingBuild.prompt}\n\nAdditional context: ${extra}` : pendingBuild.prompt;
    setPendingBuild(null);
    handleCreateProject(fullPrompt, attachments);
  }

  function handleSettingsClose() {
    setSettings(getSettings());
    setShowSettings(false);
  }

  return (
    <div className="font-body min-h-full">
      {view === 'home' ? (
        <HomePage
          onCreateProject={handlePromptSubmit}
          onOpenProject={project => { setActiveProject(project); setView('workspace'); }}
          onOpenSettings={() => setShowSettings(true)}
          settings={settings}
        />
      ) : activeProject ? (
        <WorkspaceLayout
          project={activeProject}
          settings={settings}
          onUpdateProject={setActiveProject}
          onGoHome={() => setView('home')}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : null}

      {showSettings && <SettingsModal onClose={handleSettingsClose} />}

      {pendingBuild && (
        <ClarificationModal
          prompt={pendingBuild.prompt}
          clarificationText={pendingBuild.clarificationText}
          onConfirm={handleClarificationConfirm}
          onSkip={() => {
            const p = pendingBuild;
            setPendingBuild(null);
            handleCreateProject(p.prompt);
          }}
          onCancel={() => setPendingBuild(null)}
        />
      )}

      {isCreating && <CreatingOverlay status={creatingStatus} progress={creatingProgress} />}
    </div>
  );
}

function CreatingOverlay({ status, progress }: { status: string; progress: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="text-center max-w-xs px-4">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--trev-accent)]/20 border border-[var(--trev-accent)]/30 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="var(--trev-accent)" strokeWidth="1.5"/>
            <circle cx="7" cy="7" r="2" fill="var(--trev-accent)" className="animate-ping" style={{ transformOrigin: '7px 7px' }}/>
          </svg>
        </div>
        <h2 className="text-xl font-display font-bold text-[#e8e8f4] mb-1.5">Building your project</h2>
        <p className="text-sm text-[#888899] mb-6">{status}</p>
        <div className="w-full h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--trev-accent)] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#555568] mt-2">{progress}%</p>
      </div>
    </div>
  );
}
