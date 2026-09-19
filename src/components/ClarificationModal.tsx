import { useState, useRef } from 'react';
import type { Attachment } from '../types';
import { readFileAsAttachment } from '../lib/attachments';

interface Props {
  prompt: string;
  clarificationText?: string;
  onConfirm: (additionalContext: string, attachments: Attachment[]) => void;
  onSkip: () => void;
  onCancel: () => void;
}

export default function ClarificationModal({ prompt, clarificationText, onConfirm, onSkip, onCancel }: Props) {
  const [extra, setExtra] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const results = await Promise.all(arr.map(readFileAsAttachment));
    setAttachments(prev => [...prev, ...results]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function removeAttachment(i: number) {
    setAttachments(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleConfirm() {
    onConfirm(extra.trim(), attachments);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-[#2a2a3a] bg-[#111118] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f97316]/20 border border-[#f97316]/30 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="#f97316">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[#e8e8f4]">Add more details?</h2>
              <p className="text-sm text-[#888899] mt-1">Your prompt is ready to build, but a reference or more detail will produce a better result.</p>
            </div>
          </div>

          {/* Original prompt */}
          <div className="mt-4 px-3 py-2.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-sm text-[#888899] italic">
            "{prompt}"
          </div>

          {/* Clarification question from AI */}
          {clarificationText && (
            <div className="mt-3 text-sm text-[#c8c8d8] leading-relaxed whitespace-pre-wrap">
              {clarificationText}
            </div>
          )}
        </div>

        {/* Additional context input */}
        <div className="px-6 pb-4 space-y-3">
          <textarea
            value={extra}
            onChange={e => setExtra(e.target.value)}
            placeholder="Add more details, requirements, or describe the style you want…"
            rows={3}
            className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f4] placeholder-[#555568] resize-none focus:outline-none focus:border-[#f97316]/50 transition-colors"
          />

          {/* Drag-and-drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragging ? 'border-[#f97316] bg-[#f97316]/10' : 'border-[#2a2a3a] hover:border-[#3a3a4a] hover:bg-[#1a1a24]'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888899" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M12 8v8M8 12l4-4 4 4"/>
            </svg>
            <div className="text-center">
              <p className="text-sm text-[#888899]">Drop an image or file here</p>
              <p className="text-xs text-[#555568] mt-0.5">Screenshots, mockups, designs, or text files</p>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,.txt,.md,.json,.csv"
              onChange={e => e.target.files && handleFiles(e.target.files)} />
          </div>

          {/* Attached files */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg">
                  {att.type === 'image' ? (
                    <img src={att.content} alt={att.name} className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <span className="text-xs">📄</span>
                  )}
                  <span className="text-xs text-[#e8e8f4] max-w-[120px] truncate">{att.name}</span>
                  <button onClick={() => removeAttachment(i)} className="text-[#555568] hover:text-red-400 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center justify-between gap-3">
          <button onClick={onCancel} className="text-sm text-[#555568] hover:text-[#888899] transition-colors">
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm text-[#888899] hover:text-[#e8e8f4] border border-[#2a2a3a] hover:border-[#3a3a4a] rounded-lg transition-colors"
            >
              Build anyway
            </button>
            <button
              onClick={handleConfirm}
              disabled={!extra.trim() && !attachments.length}
              className="px-5 py-2 bg-[#f97316] hover:bg-[#ea6c0f] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Build with context
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
