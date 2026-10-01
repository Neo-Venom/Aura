import { useEffect, useRef, useState } from 'react';
import { CloudRain, Volume2, VolumeX, Waves } from 'lucide-react';
import { en } from '../../copy/en';
import { cn } from '../../lib/cn';

export type CalmSoundType = 'off' | 'rain' | 'waves';

export function CalmSoundPlayer() {
  const [sound, setSound] = useState<CalmSoundType>('off');
  const [volume, setVolume] = useState<number>(0.5);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const stopCurrentSound = () => {
    try {
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch {
      // Ignore cleanup error
    }
  };

  useEffect(() => {
    return () => {
      stopCurrentSound();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume * 0.4, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume]);

  const startSound = async (type: CalmSoundType) => {
    stopCurrentSound();
    if (type === 'off') {
      setSound('off');
      return;
    }

    try {
      // Ensure AudioContext is initialized or resumed
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 2; // 2 seconds looped
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'rain') {
        // Pink-like noise for soft rain
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1100;
        bandpass.Q.value = 0.8;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 3500;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);

        whiteNoise.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        sourceNodeRef.current = whiteNoise;
        gainNodeRef.current = gainNode;
        setSound('rain');
      } else if (type === 'waves') {
        // Brown noise for deep ocean waves
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;
        filter.Q.value = 3.0;

        // Wave swell LFO (8-second cycle)
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.125;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 250; // Sweeps filter frequency between 100Hz and 600Hz
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume * 0.45, ctx.currentTime);

        brownNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        brownNoise.start();
        lfo.start();

        sourceNodeRef.current = brownNoise;
        lfoRef.current = lfo;
        gainNodeRef.current = gainNode;
        setSound('waves');
      }
    } catch {
      setSound('off');
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-3xl bg-soft/60 px-4 py-2.5 text-xs text-muted shadow-xs transition-colors sm:flex-row sm:gap-4"
      data-testid="calm-sound-controller"
      role="region"
      aria-label={en.calm.sounds.label}
    >
      <span className="font-semibold text-ink/80 flex items-center gap-1.5">
        <Volume2 className="h-3.5 w-3.5 text-apricot" aria-hidden="true" />
        {en.calm.sounds.label}
      </span>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={en.calm.sounds.label}>
        <button
          type="button"
          onClick={() => startSound('off')}
          aria-label={en.calm.sounds.off}
          aria-checked={sound === 'off'}
          role="radio"
          data-testid="calm-sound-off"
          className={cn(
            'inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1 font-semibold transition-all',
            sound === 'off' ? 'bg-surface font-bold text-ink shadow-xs' : 'hover:text-ink'
          )}
        >
          <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{en.calm.sounds.off}</span>
        </button>
        <button
          type="button"
          onClick={() => startSound('rain')}
          aria-label={en.calm.sounds.rain}
          aria-checked={sound === 'rain'}
          role="radio"
          data-testid="calm-sound-rain"
          className={cn(
            'inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1 font-semibold transition-all',
            sound === 'rain' ? 'bg-surface font-bold text-ink shadow-xs ring-1 ring-sage/40' : 'hover:text-ink'
          )}
        >
          <CloudRain className="h-3.5 w-3.5 text-sky" aria-hidden="true" />
          <span>{en.calm.sounds.rain}</span>
        </button>
        <button
          type="button"
          onClick={() => startSound('waves')}
          aria-label={en.calm.sounds.waves}
          aria-checked={sound === 'waves'}
          role="radio"
          data-testid="calm-sound-waves"
          className={cn(
            'inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1 font-semibold transition-all',
            sound === 'waves' ? 'bg-surface font-bold text-ink shadow-xs ring-1 ring-lavender/40' : 'hover:text-ink'
          )}
        >
          <Waves className="h-3.5 w-3.5 text-lavender" aria-hidden="true" />
          <span>{en.calm.sounds.waves}</span>
        </button>
      </div>
      {sound !== 'off' && (
        <div className="flex items-center gap-2 pl-2">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label={en.calm.sounds.volume}
            data-testid="calm-sound-volume"
            className="h-1.5 w-16 cursor-pointer accent-ink"
          />
        </div>
      )}
    </div>
  );
}
