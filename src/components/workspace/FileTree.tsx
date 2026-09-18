import { useState } from 'react';
import type { Project } from '../../types';

interface Props {
  project: Project;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onDeleteFile?: (path: string) => void;
}

function getIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    html: '🌐', css: '🎨', js: '⚡', ts: '🔷', tsx: '⚛️', jsx: '⚛️',
    json: '{}', md: '📝', png: '🖼', jpg: '🖼', svg: '🖼', txt: '📄',
  };
  return icons[ext ?? ''] ?? '📄';
}

function buildTree(paths: string[]): Record<string, string[]> {
  const tree: Record<string, string[]> = { '': [] };
  for (const path of paths) {
    const parts = path.split('/');
    if (parts.length === 1) {
      tree[''].push(path);
    } else {
      const dir = parts.slice(0, -1).join('/');
      if (!tree[dir]) tree[dir] = [];
      tree[dir].push(path);
    }
  }
  return tree;
}

export default function FileTree({ project, activeFile, onSelectFile, onDeleteFile }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['src']));
  const [hovered, setHovered] = useState<string | null>(null);

  const paths = Object.keys(project.files).sort();
  const dirs = Array.from(new Set(paths.filter(p => p.includes('/')).map(p => p.split('/')[0])));

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 flex items-center justify-between border-b border-[#1e1e2e]">
        <span className="text-xs font-semibold text-[#888899] uppercase tracking-widest">Files</span>
        <span className="text-xs text-[#555568]">{paths.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {paths.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-[#555568]">No files yet</div>
        ) : (
          <FileList paths={paths} dirs={dirs} expanded={expanded} setExpanded={setExpanded} activeFile={activeFile} onSelectFile={onSelectFile} onDeleteFile={onDeleteFile} hovered={hovered} setHovered={setHovered} />
        )}
      </div>
    </div>
  );
}

interface FileListProps {
  paths: string[];
  dirs: string[];
  expanded: Set<string>;
  setExpanded: (s: Set<string>) => void;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onDeleteFile?: (path: string) => void;
  hovered: string | null;
  setHovered: (s: string | null) => void;
}

function FileList({ paths, dirs, expanded, setExpanded, activeFile, onSelectFile, onDeleteFile, hovered, setHovered }: FileListProps) {
  const rootFiles = paths.filter(p => !p.includes('/'));

  function toggleDir(dir: string) {
    const next = new Set(expanded);
    if (next.has(dir)) next.delete(dir); else next.add(dir);
    setExpanded(next);
  }

  return (
    <div>
      {/* Root files */}
      {rootFiles.map(path => (
        <FileRow
          key={path} path={path} depth={0}
          isActive={activeFile === path}
          isHovered={hovered === path}
          onSelect={() => onSelectFile(path)}
          onHover={setHovered}
          onDelete={onDeleteFile}
        />
      ))}

      {/* Directories */}
      {dirs.map(dir => {
        const dirPaths = paths.filter(p => p.startsWith(dir + '/'));
        const isOpen = expanded.has(dir);
        return (
          <div key={dir}>
            <button
              onClick={() => toggleDir(dir)}
              className="w-full flex items-center gap-1.5 px-3 py-1 text-xs text-[#888899] hover:text-[#e8e8f4] hover:bg-[#1a1a24] transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              <span>📁</span>
              <span>{dir}</span>
            </button>
            {isOpen && dirPaths.map(path => (
              <FileRow
                key={path} path={path} displayName={path.split('/').slice(1).join('/')} depth={1}
                isActive={activeFile === path}
                isHovered={hovered === path}
                onSelect={() => onSelectFile(path)}
                onHover={setHovered}
                onDelete={onDeleteFile}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function FileRow({ path, displayName, depth, isActive, isHovered, onSelect, onHover, onDelete }: {
  path: string; displayName?: string; depth: number;
  isActive: boolean; isHovered: boolean;
  onSelect: () => void; onHover: (p: string | null) => void; onDelete?: (p: string) => void;
}) {
  const name = displayName ?? path;
  return (
    <div
      className={`group flex items-center justify-between px-3 py-1 cursor-pointer transition-colors ${isActive ? 'bg-[#f97316]/15 text-[#f97316]' : 'text-[#888899] hover:bg-[#1a1a24] hover:text-[#e8e8f4]'}`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      onMouseEnter={() => onHover(path)}
      onMouseLeave={() => onHover(null)}
      onClick={onSelect}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-xs flex-shrink-0">{getIcon(name)}</span>
        <span className="text-xs truncate font-mono">{name}</span>
      </div>
      {onDelete && (isHovered || isActive) && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(path); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-[#555568] hover:text-red-400 transition-all flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      )}
    </div>
  );
}
