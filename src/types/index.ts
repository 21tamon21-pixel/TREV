export type ProjectType = 'website' | 'webapp' | 'game' | 'fullstack' | 'other';

export interface VirtualFile {
  content: string;
  language: string;
  lastModified: number;
  aiModified?: boolean;
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

export interface Attachment {
  type: 'image' | 'text' | 'file';
  name: string;
  /** base64 data URI for images, raw text for text files */
  content: string;
  mimeType: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  attachments?: Attachment[];
  buildSteps?: BuildStep[];
}

export interface BuildStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

export interface TerminalEntry {
  type: 'command' | 'output' | 'error' | 'info' | 'success';
  text: string;
  timestamp: number;
}

export type Theme = 'dark' | 'light' | 'system';
export type AccentColor = 'orange' | 'blue' | 'purple' | 'green' | 'red' | 'custom';
export type FontFamily = 'inter' | 'outfit' | 'system';
export type ChatDensity = 'comfortable' | 'compact';
export type SidebarPosition = 'left' | 'right';

export interface Settings {
  groqApiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  autoPreview: boolean;
  autoFix: boolean;
  theme: Theme;
  accentColor: AccentColor;
  customAccent: string;
  uiScale: number;
  compactMode: boolean;
  fontFamily: FontFamily;
  chatDensity: ChatDensity;
  sidebarPosition: SidebarPosition;
  autoSave: boolean;
  restoreWorkspace: boolean;
  confirmBeforeDelete: boolean;
}
