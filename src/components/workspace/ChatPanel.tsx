import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, TerminalEntry } from '../../types';

interface Props {
  messages: ChatMessage[];
  terminalLog: TerminalEntry[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onStop: () => void;
  onClear: () => void;
  activeTab: 'chat' | 'terminal';
  onTabChange: (tab: 'chat' | 'terminal') => void;
}

export default function ChatPanel({ messages, terminalLog, isStreaming, onSendMessage, onStop, onClear, activeTab, onTabChange }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, terminalLog]);

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    onSendMessage(text);
    setInput('');
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Tab bar */}
      <div className="flex items-center border-b border-[#1e1e2e] px-2">
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
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' ? (
          <ChatMessages messages={messages} isStreaming={isStreaming} bottomRef={bottomRef} />
        ) : (
          <TerminalView log={terminalLog} bottomRef={bottomRef} />
        )}
      </div>

      {/* Input */}
      {activeTab === 'chat' && (
        <div className="border-t border-[#1e1e2e] p-3">
          <div className="relative rounded-lg border border-[#2a2a3a] bg-[#111118] focus-within:border-[#f97316]/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe a change or ask for help…"
              rows={2}
              disabled={isStreaming}
              className="w-full bg-transparent px-3 pt-3 pb-10 text-sm text-[#e8e8f4] placeholder-[#555568] resize-none focus:outline-none disabled:opacity-50"
            />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
              <span className="text-xs text-[#555568]">↵ to send</span>
              {isStreaming ? (
                <button onClick={onStop} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#e8e8f4] bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-md transition-colors">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="2" y="2" width="6" height="6" rx="1"/></svg>
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#f97316] hover:bg-[#ea6c0f] disabled:opacity-40 text-white rounded-md transition-colors"
                >
                  Send
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessages({ messages, isStreaming, bottomRef }: { messages: ChatMessage[]; isStreaming: boolean; bottomRef: React.RefObject<HTMLDivElement | null> }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center py-16">
        <div className="text-3xl mb-3">✦</div>
        <p className="text-sm text-[#555568] max-w-xs">Tell the AI what to build or change. It has access to all your project files.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#1a1a24] text-[#888899]'}`}>
            {msg.role === 'user' ? 'U' : '✦'}
          </div>
          <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
            <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#f97316]/15 text-[#e8e8f4] rounded-tr-sm' : 'bg-[#111118] text-[#c8c8d8] rounded-tl-sm border border-[#1e1e2e]'}`}>
              <MessageContent content={msg.content} isStreaming={msg.isStreaming} />
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.slice(3, -3).split('\n');
          const lang = lines[0];
          const code = lines.slice(1).join('\n');
          return (
            <pre key={i} className="mt-2 mb-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] px-4 py-3 text-xs font-mono text-[#e8e8f4] overflow-x-auto">
              {lang && <div className="text-[#555568] mb-2 text-[10px] uppercase">{lang}</div>}
              {code}
            </pre>
          );
        }
        const text = part
          .replace(/<file path="[^"]+">[\s\S]*?<\/file>/g, '')
          .replace(/\*\*(.*?)\*\*/g, '**$1**')
          .trim();
        if (!text) return null;
        return <span key={i} className="whitespace-pre-wrap">{text}</span>;
      })}
      {isStreaming && <span className="inline-block w-1.5 h-4 bg-[#f97316] animate-pulse ml-0.5 rounded-sm" />}
    </>
  );
}

function TerminalView({ log, bottomRef }: { log: TerminalEntry[]; bottomRef: React.RefObject<HTMLDivElement | null> }) {
  const colorMap: Record<string, string> = {
    command: '#f97316',
    output: '#888899',
    error: '#f87171',
    info: '#60a5fa',
    success: '#34d399',
  };

  return (
    <div className="px-4 py-4 font-mono text-xs space-y-0.5">
      {log.length === 0 ? (
        <div className="text-[#555568] py-8 text-center">Terminal output will appear here</div>
      ) : (
        log.map((entry, i) => (
          <div key={i} style={{ color: colorMap[entry.type] }}>
            {entry.text}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
