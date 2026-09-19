import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, TerminalEntry, Attachment } from '../../types';
import { readFileAsAttachment } from '../../lib/attachments';

interface Props {
  messages: ChatMessage[];
  terminalLog: TerminalEntry[];
  isStreaming: boolean;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  onClear: () => void;
  activeTab: 'chat' | 'terminal';
  onTabChange: (tab: 'chat' | 'terminal') => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognitionAPI: any =
  typeof window !== 'undefined'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
    : undefined;

export default function ChatPanel({ messages, terminalLog, isStreaming, onSendMessage, onStop, onClear, activeTab, onTabChange }: Props) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, terminalLog]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  function handleSend() {
    const text = input.trim();
    if ((!text && !attachments.length) || isStreaming) return;
    onSendMessage(text || '(See attached files)', attachments);
    setInput('');
    setAttachments([]);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).slice(0, 5); // max 5 files
    const results = await Promise.all(arr.map(readFileAsAttachment));
    setAttachments(prev => [...prev, ...results]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.kind === 'file' && item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) handleFiles([file]);
    }
  }

  // Voice input
  function toggleVoice() {
    if (!SpeechRecognitionAPI) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome or Edge.');
      setTimeout(() => setVoiceError(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim = event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceError('Voice recognition failed. Please try again.');
      setTimeout(() => setVoiceError(null), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setVoiceError(null);
  }

  function removeAttachment(i: number) {
    setAttachments(prev => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div
      className="h-full flex flex-col bg-[#0a0a0f]"
      onDragOver={handleDragOver}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0f]/90 border-2 border-dashed border-[#f97316] rounded-lg pointer-events-none">
          <div className="text-center">
            <div className="text-3xl mb-2">📎</div>
            <p className="text-sm font-medium text-[#f97316]">Drop files to attach</p>
            <p className="text-xs text-[#888899] mt-1">Images, screenshots, text files</p>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center border-b border-[#1e1e2e] px-2 flex-shrink-0">
        {(['chat', 'terminal'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors capitalize border-b-2 ${activeTab === tab ? 'text-[#f97316] border-[#f97316]' : 'text-[#555568] border-transparent hover:text-[#888899]'}`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onClear} className="p-1.5 text-[#555568] hover:text-[#888899] transition-colors" title="Clear">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'chat' ? (
          <ChatMessages messages={messages} isStreaming={isStreaming} bottomRef={bottomRef} />
        ) : (
          <TerminalView log={terminalLog} bottomRef={bottomRef} />
        )}
      </div>

      {/* Input area */}
      {activeTab === 'chat' && (
        <div className="border-t border-[#1e1e2e] p-3 flex-shrink-0">
          {/* Attached files preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att, i) => (
                <div key={i} className="group flex items-center gap-1.5 px-2 py-1 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg">
                  {att.type === 'image'
                    ? <img src={att.content} alt={att.name} className="w-5 h-5 object-cover rounded" />
                    : <span className="text-xs">📄</span>
                  }
                  <span className="text-xs text-[#888899] max-w-[80px] truncate">{att.name}</span>
                  <button onClick={() => removeAttachment(i)} className="text-[#555568] hover:text-red-400 transition-colors ml-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 2l6 6M8 2l-6 6"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Voice error */}
          {voiceError && (
            <div className="mb-2 px-3 py-2 bg-red-900/30 border border-red-800/40 rounded-lg text-xs text-red-300">{voiceError}</div>
          )}

          <div className="relative rounded-xl border border-[#2a2a3a] bg-[#111118] focus-within:border-[#f97316]/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onPaste={handlePaste}
              placeholder={isListening ? '🎤 Listening…' : 'Describe a change, paste a screenshot, or ask for help…'}
              disabled={isStreaming}
              className={`w-full bg-transparent px-3 pt-3 pb-12 text-sm text-[#e8e8f4] placeholder-[#555568] resize-none focus:outline-none disabled:opacity-50 transition-colors ${isListening ? 'placeholder-[#f97316]' : ''}`}
              style={{ minHeight: '72px', maxHeight: '160px' }}
            />

            {/* Bottom toolbar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
              {/* File attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-[#555568] hover:text-[#888899] transition-colors rounded"
                title="Attach file or image"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd"/>
                </svg>
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden"
                accept="image/*,.txt,.md,.json,.csv,.html,.css,.js,.ts"
                onChange={e => e.target.files && handleFiles(e.target.files)} />

              {/* Folder import */}
              <button
                onClick={() => folderInputRef.current?.click()}
                className="p-1.5 text-[#555568] hover:text-[#888899] transition-colors rounded"
                title="Import folder"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
              </button>
              <input
                ref={folderInputRef} type="file" className="hidden"
                {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />

              {/* Voice input */}
              <button
                onClick={toggleVoice}
                className={`p-1.5 transition-colors rounded ${isListening ? 'text-[#f97316] animate-pulse' : 'text-[#555568] hover:text-[#888899]'}`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                </svg>
              </button>

              <div className="flex-1" />

              <span className="text-xs text-[#555568]">⇧↵ newline</span>

              {isStreaming ? (
                <button
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#e8e8f4] bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-lg transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="2" y="2" width="6" height="6" rx="1"/></svg>
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && !attachments.length}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#f97316] hover:bg-[#ea6c0f] disabled:opacity-40 text-white rounded-lg transition-colors"
                >
                  Send
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {['Fix errors', 'Improve UI', 'Add feature', 'Explain code'].map(action => (
              <button
                key={action}
                onClick={() => setInput(action + ': ')}
                className="px-2.5 py-1 text-xs text-[#555568] border border-[#1e1e2e] rounded-full hover:border-[#2a2a3a] hover:text-[#888899] transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessages({ messages, isStreaming, bottomRef }: {
  messages: ChatMessage[];
  isStreaming: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center py-16">
        <div className="w-10 h-10 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#f97316" strokeWidth="1.5"/>
            <circle cx="7" cy="7" r="2" fill="#f97316"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-[#e8e8f4]">Ready to build</p>
        <p className="text-xs text-[#555568] mt-1 max-w-[200px]">Describe a change, attach a reference image, or use your voice.</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 space-y-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold ${msg.role === 'user' ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#1a1a24] border border-[#2a2a3a] text-[#888899]'}`}>
            {msg.role === 'user' ? 'U' : '✦'}
          </div>
          <div className={`max-w-[88%] flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {/* Attachments */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {msg.attachments.map((att, i) => (
                  att.type === 'image' ? (
                    <img key={i} src={att.content} alt={att.name} className="max-w-[140px] max-h-[100px] object-cover rounded-lg border border-[#2a2a3a]" />
                  ) : (
                    <div key={i} className="px-2.5 py-1.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-xs text-[#888899]">
                      📄 {att.name}
                    </div>
                  )
                ))}
              </div>
            )}
            {/* Build steps */}
            {msg.buildSteps && msg.buildSteps.length > 0 && (
              <BuildStepsList steps={msg.buildSteps} />
            )}
            {/* Message bubble */}
            {msg.content && (
              <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#f97316]/15 text-[#e8e8f4] rounded-tr-sm' : 'bg-[#111118] text-[#c8c8d8] rounded-tl-sm border border-[#1e1e2e]'}`}>
                <MessageContent content={msg.content} isStreaming={msg.isStreaming} />
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function BuildStepsList({ steps }: { steps: { id: string; label: string; status: string }[] }) {
  return (
    <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5 space-y-1.5 min-w-[200px]">
      {steps.map(step => (
        <div key={step.id} className="flex items-center gap-2 text-xs">
          {step.status === 'done' && <span className="text-[#34d399]">✓</span>}
          {step.status === 'running' && <span className="text-[#f97316] animate-spin inline-block">◌</span>}
          {step.status === 'pending' && <span className="text-[#2a2a3a]">○</span>}
          {step.status === 'error' && <span className="text-red-400">✗</span>}
          <span className={step.status === 'done' ? 'text-[#888899]' : step.status === 'running' ? 'text-[#e8e8f4]' : 'text-[#555568]'}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  // Remove file blocks from display
  const cleaned = content.replace(/<file path="[^"]+">[\s\S]*?<\/file>/g, '').replace(/<steps>[\s\S]*?<\/steps>/g, '').replace(/<clarify>[\s\S]*?<\/clarify>/g, '').trim();
  const parts = cleaned.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.slice(3, -3).split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n');
          return (
            <pre key={i} className="rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] px-3 py-2.5 text-xs font-mono text-[#e8e8f4] overflow-x-auto whitespace-pre-wrap">
              {lang && <div className="text-[#555568] mb-1.5 text-[10px] uppercase tracking-wider">{lang}</div>}
              {code}
            </pre>
          );
        }
        if (!part.trim()) return null;
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      })}
      {isStreaming && <span className="inline-block w-1.5 h-4 bg-[#f97316] animate-pulse ml-0.5 rounded-sm align-bottom" />}
    </div>
  );
}

function TerminalView({ log, bottomRef }: { log: TerminalEntry[]; bottomRef: React.RefObject<HTMLDivElement | null> }) {
  const colorMap: Record<string, string> = {
    command: '#f97316', output: '#888899', error: '#f87171', info: '#60a5fa', success: '#34d399',
  };
  return (
    <div className="px-4 py-4 font-mono text-xs space-y-0.5">
      {log.length === 0 ? (
        <div className="text-[#555568] py-8 text-center">Terminal output will appear here</div>
      ) : (
        log.map((entry, i) => (
          <div key={i} style={{ color: colorMap[entry.type] }}>{entry.text}</div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
