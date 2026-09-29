import type { StreamEvent } from '../types/api';

// Parses a text/event-stream body into StreamEvents. Each SSE `data:` line carries one JSON event.
export async function* parseSSE(body: ReadableStream<Uint8Array>, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      if (signal?.aborted) return;
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const chunk = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const data = chunk
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trimStart())
          .join('\n');
        if (data) yield JSON.parse(data) as StreamEvent;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  });

const TOOL_RE = /\[\[tool:(breathing|grounding)\]\]/g;

export function extractTools(text: string): { clean: string; tools: ('breathing' | 'grounding')[] } {
  const tools = Array.from(text.matchAll(TOOL_RE)).map((m) => m[1] as 'breathing' | 'grounding');
  const clean = text.replace(TOOL_RE, '').replace(/\[\[[^\]]*$/, '').trimEnd();
  return { clean, tools: Array.from(new Set(tools)) };
}
