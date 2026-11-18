import { store } from './store';

/**
 * Sound effects synthesised with the Web Audio API — no files to load.
 * Nothing plays unless the visitor switched sound on (store.soundOn), and the
 * AudioContext is only created after a user gesture.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, start: number, dur: number, vol = 0.2, type: OscillatorType = 'sine') {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export type Sfx = 'chime' | 'pop' | 'sparkle' | 'whoosh' | 'success' | 'soft' | 'paper' | 'bloop';

export function sfx(kind: Sfx, force = false) {
  if (!store.get().soundOn && !force) return;
  const c = audio();
  if (!c) return;
  switch (kind) {
    case 'chime':
      [1318.5, 1760, 2349.3].forEach((f, i) => tone(f, i * 0.09, 1.4, 0.12));
      break;
    case 'pop':
      tone(520 + Math.random() * 200, 0, 0.12, 0.18, 'triangle');
      break;
    case 'bloop': {
      const o = c.createOscillator();
      const g = c.createGain();
      const t = c.currentTime;
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(900, t + 0.12);
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(master!);
      o.start(t);
      o.stop(t + 0.2);
      break;
    }
    case 'sparkle':
      for (let i = 0; i < 4; i++) tone(1800 + Math.random() * 1600, i * 0.04, 0.35, 0.05);
      break;
    case 'soft':
      tone(880, 0, 0.6, 0.08);
      tone(1320, 0.05, 0.6, 0.05);
      break;
    case 'success':
      [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.9, 0.11));
      break;
    case 'whoosh':
    case 'paper': {
      const len = kind === 'whoosh' ? 0.7 : 0.35;
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / d.length) * Math.PI);
      const src = c.createBufferSource();
      src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = kind === 'whoosh' ? 900 : 2600;
      f.Q.value = 0.8;
      const g = c.createGain();
      g.gain.value = kind === 'whoosh' ? 0.25 : 0.12;
      src.connect(f).connect(g).connect(master!);
      src.start();
      break;
    }
  }
}

/* ---------- Ambient soundscape (soft wind + airy pad), generated live ---------- */
let ambient: { stop: () => void; gain: GainNode } | null = null;

export function startAmbient(volume = 0.35) {
  const c = audio();
  if (!c || !master || ambient) return;
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, c.currentTime);
  out.gain.exponentialRampToValueAtTime(volume, c.currentTime + 2.5);
  out.connect(c.destination);

  // wind: filtered noise with a slowly moving filter
  const buf = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 500;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 260;
  lfo.connect(lfoGain).connect(lp.frequency);
  const windGain = c.createGain();
  windGain.gain.value = 0.5;
  noise.connect(lp).connect(windGain).connect(out);

  // pad: a quiet open fifth that breathes
  const pads = [146.83, 220, 293.66].map((f, i) => {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.detune.value = i * 3;
    const g = c.createGain();
    g.gain.value = 0.035;
    const l = c.createOscillator();
    const lg = c.createGain();
    l.frequency.value = 0.05 + i * 0.03;
    lg.gain.value = 0.025;
    l.connect(lg).connect(g.gain);
    o.connect(g).connect(out);
    o.start();
    l.start();
    return [o, l];
  });
  noise.start();
  lfo.start();
  ambient = {
    gain: out,
    stop: () => {
      const t = c.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      setTimeout(() => {
        try {
          noise.stop();
          lfo.stop();
          pads.flat().forEach((o) => o.stop());
          out.disconnect();
        } catch {
          /* already stopped */
        }
      }, 1400);
    },
  };
}

export function stopAmbient() {
  ambient?.stop();
  ambient = null;
}

export function setAmbientVolume(v: number) {
  if (ambient && ctx) ambient.gain.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, 0.2);
}

/** Unlock audio on iOS — call inside a user gesture. */
export function unlockAudio() {
  audio();
}
