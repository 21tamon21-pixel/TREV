import { useEffect, useState } from 'react';
import { getSettings, saveSettings, defaultSettings } from '../../lib/storage';
import type { Settings } from '../../types';

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

const ACCENTS: { key: Settings['accentColor']; label: string; value: string }[] = [
  { key: 'orange', label: 'Orange', value: '#f97316' },
  { key: 'blue', label: 'Blue', value: '#3b82f6' },
  { key: 'purple', label: 'Purple', value: '#8b5cf6' },
  { key: 'green', label: 'Green', value: '#22c55e' },
  { key: 'red', label: 'Red', value: '#ef4444' },
];

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(current => ({ ...current, [key]: value }));
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  }

  function handleReset() {
    const reset = { ...defaultSettings, groqApiKey: settings.groqApiKey };
    setSettings(reset);
  }

  const fieldClass = 'w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f4] placeholder-[#666678] focus:outline-none focus:border-[var(--trev-accent)] transition-colors';
  const labelClass = 'block text-sm font-medium text-[#e8e8f4] mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2a2a3a] bg-[#111118] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a3a]">
          <div>
            <h2 className="text-xl font-semibold text-[#e8e8f4]">Settings</h2>
            <p className="text-xs text-[#777789] mt-1">Trev workspace preferences</p>
          </div>
          <button onClick={onClose} aria-label="Close settings" className="text-[#888899] hover:text-[#e8e8f4] transition-colors text-xl">×</button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-145px)] px-6 py-6 space-y-8">
          <section>
            <h3 className="text-xs font-semibold text-[var(--trev-accent)] uppercase tracking-widest mb-4">General</h3>
            <div className="space-y-4">
              <Toggle
                checked={settings.autoSave}
                onChange={v => update('autoSave', v)}
                label="Auto-save changes"
                description="Persist project changes automatically while you work."
              />
              <Toggle
                checked={settings.restoreWorkspace}
                onChange={v => update('restoreWorkspace', v)}
                label="Restore workspace"
                description="Remember the last workspace and project between sessions."
              />
              <Toggle
                checked={settings.confirmBeforeDelete}
                onChange={v => update('confirmBeforeDelete', v)}
                label="Confirm before deleting"
                description="Ask for confirmation before removing a project."
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-[var(--trev-accent)] uppercase tracking-widest mb-4">Appearance</h3>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as const).map(theme => (
                    <button
                      key={theme}
                      onClick={() => update('theme', theme)}
                      className={`rounded-lg border px-3 py-2.5 text-sm capitalize transition-colors ${
                        settings.theme === theme
                          ? 'border-[var(--trev-accent)] bg-[var(--trev-accent)]/10 text-[var(--trev-accent)]'
                          : 'border-[#2a2a3a] text-[#9999aa] hover:border-[#444456] hover:text-[#e8e8f4]'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Accent color</label>
                <div className="flex flex-wrap gap-2">
                  {ACCENTS.map(accent => (
                    <button
                      key={accent.key}
                      title={accent.label}
                      aria-label={accent.label}
                      onClick={() => {
                        update('accentColor', accent.key);
                        update('customAccent', accent.value);
                      }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-105 ${
                        settings.accentColor === accent.key ? 'border-white scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: accent.value }}
                    />
                  ))}
                  <label
                    title="Custom accent"
                    className={`relative w-9 h-9 rounded-full border-2 cursor-pointer overflow-hidden ${
                      settings.accentColor === 'custom' ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <input
                      type="color"
                      value={settings.customAccent}
                      onChange={e => {
                        update('customAccent', e.target.value);
                        update('accentColor', 'custom');
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="absolute inset-0" style={{ background: settings.customAccent }} />
                  </label>
                </div>
                <p className="text-xs text-[#777789] mt-2">Choose a preset or pick any custom accent.</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass}>UI scale</label>
                  <span className="text-xs text-[#777789]">{settings.uiScale}%</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="115"
                  step="5"
                  value={settings.uiScale}
                  onChange={e => update('uiScale', Number(e.target.value))}
                  className="w-full accent-[var(--trev-accent)]"
                />
              </div>

              <div>
                <label className={labelClass}>Font</label>
                <select value={settings.fontFamily} onChange={e => update('fontFamily', e.target.value as Settings['fontFamily'])} className={fieldClass}>
                  <option value="inter">Inter</option>
                  <option value="outfit">Outfit</option>
                  <option value="system">System</option>
                </select>
              </div>

              <Toggle
                checked={settings.compactMode}
                onChange={v => update('compactMode', v)}
                label="Compact mode"
                description="Reduce spacing across the interface."
              />

              <div>
                <label className={labelClass}>Chat density</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['comfortable', 'compact'] as const).map(density => (
                    <button
                      key={density}
                      onClick={() => update('chatDensity', density)}
                      className={`rounded-lg border px-3 py-2.5 text-sm capitalize transition-colors ${
                        settings.chatDensity === density
                          ? 'border-[var(--trev-accent)] bg-[var(--trev-accent)]/10 text-[var(--trev-accent)]'
                          : 'border-[#2a2a3a] text-[#9999aa] hover:border-[#444456] hover:text-[#e8e8f4]'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Sidebar position</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['left', 'right'] as const).map(position => (
                    <button
                      key={position}
                      onClick={() => update('sidebarPosition', position)}
                      className={`rounded-lg border px-3 py-2.5 text-sm capitalize transition-colors ${
                        settings.sidebarPosition === position
                          ? 'border-[var(--trev-accent)] bg-[var(--trev-accent)]/10 text-[var(--trev-accent)]'
                          : 'border-[#2a2a3a] text-[#9999aa] hover:border-[#444456] hover:text-[#e8e8f4]'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#777789] mt-2">The workspace layout will consume this preference in the workspace settings pass.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-[var(--trev-accent)] uppercase tracking-widest mb-4">AI & Builder</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Groq API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.groqApiKey}
                    onChange={e => update('groqApiKey', e.target.value)}
                    placeholder="gsk_..."
                    className={fieldClass + ' pr-10'}
                  />
                  <button onClick={() => setShowKey(v => !v)} aria-label={showKey ? 'Hide API key' : 'Show API key'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888899] hover:text-[#e8e8f4]">
                    {showKey ? '◉' : '◌'}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[#777789]">Your key is stored locally in this browser.</p>
              </div>

              <div>
                <label className={labelClass}>Model</label>
                <select value={settings.model} onChange={e => update('model', e.target.value)} className={fieldClass}>
                  {GROQ_MODELS.map(model => <option key={model} value={model}>{model}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Temperature</label>
                  <span className="text-xs text-[#777789]">{settings.temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={e => update('temperature', Number(e.target.value))}
                  className="w-full accent-[var(--trev-accent)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Max output tokens</label>
                  <span className="text-xs text-[#777789]">{settings.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="16384"
                  step="1024"
                  value={settings.maxTokens}
                  onChange={e => update('maxTokens', Number(e.target.value))}
                  className="w-full accent-[var(--trev-accent)]"
                />
              </div>

              <Toggle
                checked={settings.autoPreview}
                onChange={v => update('autoPreview', v)}
                label="Auto-refresh preview"
                description="Refresh the preview after generated project changes."
              />
              <Toggle
                checked={settings.autoFix}
                onChange={v => update('autoFix', v)}
                label="Automatically fix build errors"
                description="Allow the builder to use its repair flow when supported."
              />
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-[#2a2a3a] flex items-center justify-between gap-3">
          <button onClick={handleReset} className="px-3 py-2 text-sm text-[#888899] hover:text-[#e8e8f4] transition-colors">
            Reset section
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[#888899] hover:text-[#e8e8f4] transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 bg-[var(--trev-accent)] hover:brightness-110 text-white text-sm font-medium rounded-lg transition-colors">
              {saved ? '✓ Saved' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 text-left group"
      aria-pressed={checked}
    >
      <span>
        <span className="block text-sm text-[#e8e8f4] group-hover:text-white">{label}</span>
        <span className="block text-xs text-[#777789] mt-0.5">{description}</span>
      </span>
      <span className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${
        checked ? 'bg-[var(--trev-accent)]' : 'bg-[#2a2a3a]'
      }`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : ''
        }`} />
      </span>
    </button>
  );
}
