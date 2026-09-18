import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { Project } from '../../types';

interface Props {
  project: Project;
  activeFile: string | null;
  onFileChange: (path: string, content: string) => void;
  onSelectFile: (path: string) => void;
}

export default function CodeEditor({ project, activeFile, onFileChange, onSelectFile }: Props) {
  const files = Object.keys(project.files);

  return (
    <div className="h-full flex flex-col bg-[#0e0e16]">
      {/* Tabs */}
      <div className="flex items-end gap-0 border-b border-[#1e1e2e] overflow-x-auto scrollbar-none">
        {files.map(path => {
          const name = path.split('/').pop() ?? path;
          const isActive = path === activeFile;
          return (
            <button
              key={path}
              onClick={() => onSelectFile(path)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono whitespace-nowrap border-r border-[#1e1e2e] transition-colors ${isActive ? 'bg-[#0e0e16] text-[#e8e8f4] border-t border-t-[#f97316]' : 'bg-[#111118] text-[#555568] hover:text-[#888899]'}`}
            >
              {name}
            </button>
          );
        })}
        {files.length === 0 && (
          <div className="px-4 py-2 text-xs text-[#555568]">No files</div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        {activeFile && project.files[activeFile] ? (
          <MonacoEditor
            height="100%"
            language={project.files[activeFile].language}
            value={project.files[activeFile].content}
            onChange={value => value !== undefined && onFileChange(activeFile, value)}
            theme="vs-dark"
            options={{
              fontSize: 13,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              padding: { top: 12, bottom: 12 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              bracketPairColorization: { enabled: true },
              renderLineHighlight: 'gutter',
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm text-[#555568]">
              {files.length === 0 ? 'No files yet. Ask the AI to build something.' : 'Select a file to edit.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
