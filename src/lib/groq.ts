import type { Settings } from '../types';

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamGroq(
  messages: GroqMessage[],
  settings: Settings,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const text: string = json.choices?.[0]?.delta?.content ?? '';
        if (text) {
          full += text;
          onChunk(text);
        }
      } catch {
        // malformed chunk, skip
      }
    }
  }

  return full;
}
