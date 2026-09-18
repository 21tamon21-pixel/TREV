import { useState, useEffect } from 'react';
import { getSettings, saveSettings, defaultSettings } from '../../lib/storage';
import type { Settings } from '../../types';

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
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

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-[#2a2a3a] bg-[#111118] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a3a]">
          <h2 className="text-lg font-semibold text-[#e8e8f4]">Settings</h2>
          <button onClick={onClose} className="text-[#888899] hover:text-[#e8e8f4] transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* AI Section */}
          <div>
            <h3 className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mb-4">AI</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#e8e8f4] mb-1.5">Groq API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.groqApiKey}
                    onChange={e => setSettings(s => ({ ...s, groqApiKey: e.target.value }))}
                    placeholder="gsk_..."
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f4] placeholder-[#888899] focus:outline-none focus:border-[#f97316] transition-colors pr-10"
                  />
                  <button
                    onClick={() => setShowKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888899] hover:text-[#e8e8f4] transition-colors"
                  >
                    {showKey ? (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[#888899]">
                  Get your free key at{' '}
                  <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-[#f97316] hover:underline">
                    console.groq.com
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e8e8f4] mb-1.5">Model</label>
                <select
                  value={settings.model}
                  onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f4] focus:outline-none focus:border-[#f97316] transition-colors"
                >
                  {GROQ_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e8e8f4] mb-1.5">
                  Temperature <span className="text-[#888899]">{settings.temperature}</span>
                </label>
                <input
                  type="range" min="0" max="1" step="0.1"
                  value={settings.temperature}
                  onChange={e => setSettings(s => ({ ...s, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-[#f97316]"
                />
              </div>
            </div>
          </div>

          {/* Builder Section */}
          <div>
            <h3 className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mb-4">Builder</h3>
            <div className="space-y-3">
              {[
                { key: 'autoPreview', label: 'Auto-refresh preview after changes' },
                { key: 'autoFix', label: 'Automatically fix build errors' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setSettings(s => ({ ...s, [key]: !s[key as keyof Settings] }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${settings[key as keyof Settings] ? 'bg-[#f97316]' : 'bg-[#2a2a3a]'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[key as keyof Settings] ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-[#e8e8f4] group-hover:text-white transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2a3a] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888899] hover:text-[#e8e8f4] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#f97316] hover:bg-[#ea6c0f] text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
