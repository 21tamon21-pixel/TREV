export type ProjectType = 'website' | 'webapp' | 'game' | 'fullstack' | 'other';

export interface VirtualFile {
  content: string;
  language: string;
  lastModified: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  files: Record<string, VirtualFile>;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface TerminalEntry {
  type: 'command' | 'output' | 'error' | 'info' | 'success';
  text: string;
  timestamp: number;
}

export interface Settings {
  groqApiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  autoPreview: boolean;
  autoFix: boolean;
  theme: 'dark' | 'light';
}
