import type { Project, Settings } from '../types';

const PROJECTS_KEY = 'trev67_projects';
const SETTINGS_KEY = 'trev67_settings';

export const defaultSettings: Settings = {
  groqApiKey: '',
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 8192,
  autoPreview: true,
  autoFix: true,
  theme: 'dark',
};

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProject(p: Project) {
  const projects = getProjects().filter(x => x.id !== p.id);
  projects.unshift({ ...p, updatedAt: Date.now() });
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string) {
  const projects = getProjects().filter(x => x.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function newProject(name: string, description: string, type: Project['type'], files: Project['files']): Project {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    type,
    files,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
