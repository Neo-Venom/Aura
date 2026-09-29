import { apiFetch } from './http';
import { env } from '../lib/env';

export type SttErrorCode = 'unsupported' | 'denied' | 'other';
export interface SttCallbacks {
  onInterim(text: string): void;
  onFinal(text: string): void;
  onEnd(): void;
  onError(code: SttErrorCode): void;
}
export interface SttService {
  mode: 'browser' | 'server';
  isSupported(): boolean;
  start(cb: SttCallbacks): Promise<void>;
  stop(): void;
}

const Ctor = (): SpeechRecognitionCtor | undefined =>
  typeof window === 'undefined' ? undefined : window.SpeechRecognition ?? window.webkitSpeechRecognition;

function createBrowserStt(): SttService {
  let rec: SpeechRecognitionLike | null = null;
  return {
    mode: 'browser',
    isSupported: () => !!Ctor(),
    async start(cb) {
      const C = Ctor();
      if (!C) { cb.onError('unsupported'); return; }
      rec = new C();
      rec.lang = navigator.language || 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) cb.onFinal(r[0].transcript.trim());
          else interim += r[0].transcript;
        }
        cb.onInterim(interim.trim());
      };
      rec.onerror = (e) => cb.onError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : 'other');
      rec.onend = () => { rec = null; cb.onEnd(); };
      try { rec.start(); } catch { cb.onError('other'); }
    },
    stop() { rec?.stop(); },
  };
}

function createServerStt(): SttService {
  let recorder: MediaRecorder | null = null;
  return {
    mode: 'server',
    isSupported: () => typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices,
    async start(cb) {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        cb.onError('denied');
        return;
      }
      const chunks: Blob[] = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        try {
          const fd = new FormData();
          fd.append('audio', new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' }), 'speech.webm');
          fd.append('language', navigator.language || 'en-US');
          // TODO(Antigravity): POST /v1/stt/transcribe (multipart: audio, language) -> { text }
          const res = await apiFetch<{ text: string }>('/v1/stt/transcribe', { method: 'POST', body: fd });
          if (res.text) cb.onFinal(res.text);
        } catch {
          cb.onError('other');
        } finally {
          recorder = null;
          cb.onEnd();
        }
      };
      recorder.start();
    },
    stop() { if (recorder?.state === 'recording') recorder.stop(); },
  };
}

export const createSttService = (): SttService =>
  env.sttMode === 'server' ? createServerStt() : createBrowserStt();
