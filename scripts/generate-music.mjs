// Generates the gift's default soundtrack: an ORIGINAL music-box lullaby,
// composed note-by-note below and synthesised from scratch (no samples,
// no copyrighted material). Output: public/assets/audio/little-sky-lullaby.mp3
//
//   npm run music
//
// The track loops seamlessly: the reverb tail is wrapped back onto the start.

import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SR = 44100;
const BPM = 76;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---- Composition -----------------------------------------------------------
const CH = {
  D: [50, 57, 62, 66],
  Bm: [47, 54, 59, 62],
  G: [43, 50, 55, 59],
  A: [45, 52, 57, 61],
  Fsm: [42, 49, 54, 57],
};
const chords = ['D', 'Bm', 'G', 'A', 'D', 'Fsm', 'G', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A', 'D', 'D'];
const melody = [
  [[78, 1.5], [76, 0.5], [74, 1], [69, 1]],
  [[71, 1.5], [73, 0.5], [74, 2]],
  [[74, 1], [76, 1], [78, 1], [79, 1]],
  [[76, 3], [0, 1]],
  [[78, 1.5], [76, 0.5], [74, 1], [69, 1]],
  [[73, 1.5], [74, 0.5], [76, 2]],
  [[74, 1], [71, 1], [74, 1], [79, 1]],
  [[78, 2], [76, 2]],
  [[74, 1.5], [73, 0.5], [71, 2]],
  [[71, 1], [74, 1], [79, 2]],
  [[78, 1.5], [76, 0.5], [74, 2]],
  [[73, 1], [76, 1], [81, 2]],
  [[79, 1.5], [78, 0.5], [76, 1], [74, 1]],
  [[76, 1.5], [78, 0.5], [76, 1], [73, 1]],
  [[74, 4]],
  [[0, 4]],
];
const PASSES = 2;
const totalBars = chords.length * PASSES;
const length = Math.ceil(totalBars * BAR * SR);
const L = new Float32Array(length);
const R = new Float32Array(length);

function addNote(buf, t0, hz, dur, amp, kind, pan = 0) {
  const start = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s;
    if (kind === 'box') {
      // music-box tine: bright attack, slightly inharmonic partials, long decay
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 2.1);
      s =
        Math.sin(2 * Math.PI * hz * t) * env +
        0.22 * Math.sin(2 * Math.PI * hz * 3.01 * t) * Math.exp(-t * 7) +
        0.07 * Math.sin(2 * Math.PI * hz * 5.43 * t) * Math.exp(-t * 14);
    } else {
      // pad: soft, slow, detuned
      const a = Math.min(1, t / 0.9);
      const r = Math.min(1, (dur - t) / 1.1);
      const env = Math.max(0, Math.min(a, r));
      s =
        (Math.sin(2 * Math.PI * hz * t) +
          0.6 * Math.sin(2 * Math.PI * hz * 1.003 * t + 1.3) +
          0.25 * Math.sin(2 * Math.PI * hz * 2.002 * t)) *
        env *
        0.45;
    }
    const idx = (start + i) % length; // wrap = seamless loop
    buf[0][idx] += s * amp * gl;
    buf[1][idx] += s * amp * gr;
  }
}

const out = [L, R];
for (let p = 0; p < PASSES; p++) {
  chords.forEach((name, b) => {
    const barStart = (p * chords.length + b) * BAR;
    const ch = CH[name];
    // pad + soft bass
    ch.slice(0, 3).forEach((m, k) => addNote(out, barStart, midiHz(m), BAR + 0.6, 0.05, 'pad', k - 1));
    addNote(out, barStart, midiHz(ch[0] - 12), BAR + 0.4, 0.06, 'pad', 0);
    // arpeggio (8ths)
    const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
    pattern.forEach((k, i) => {
      const m = ch[k] + (p === 1 && i % 4 === 3 ? 12 : 0);
      addNote(out, barStart + i * (BEAT / 2), midiHz(m), 2.2, 0.075, 'box', -0.35 + (i % 2) * 0.2);
    });
    // melody
    let t = barStart;
    for (const [m, beats] of melody[b]) {
      if (m) {
        addNote(out, t, midiHz(m), 3.2, 0.2, 'box', 0.15);
        if (p === 1) addNote(out, t + 0.012, midiHz(m - 12 + (m % 2 ? 3 : 4)), 2.6, 0.06, 'box', 0.4);
      }
      t += beats * BEAT;
    }
    // a soft sparkle on the last bar of each pass
    if (b === chords.length - 1) {
      [86, 90, 93].forEach((m, i) => addNote(out, barStart + BEAT * (1 + i * 0.5), midiHz(m), 2, 0.05, 'box', 0.6));
    }
  });
}

// ---- Simple Schroeder reverb (circular, so it also loops) ------------------
function reverb(input, seed) {
  const combs = [1557, 1617, 1491, 1422].map((d) => d + seed);
  const res = new Float32Array(length);
  for (const d of combs) {
    const buf = new Float32Array(d);
    let idx = 0;
    // run twice around the loop so the tail wraps naturally
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < length; i++) {
        const y = buf[idx];
        buf[idx] = input[i] + y * 0.8;
        idx = (idx + 1) % d;
        if (pass === 1) res[i] += y * 0.25;
      }
    }
  }
  for (const d of [225, 556]) {
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < length; i++) {
      const b = buf[idx];
      const y = -res[i] + b;
      buf[idx] = res[i] + b * 0.5;
      idx = (idx + 1) % d;
      res[i] = y;
    }
  }
  return res;
}
const wl = reverb(L, 0);
const wr = reverb(R, 23);
let peak = 0;
for (let i = 0; i < length; i++) {
  L[i] = L[i] * 0.8 + wl[i] * 0.32;
  R[i] = R[i] * 0.8 + wr[i] * 0.32;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.85 / peak;

// ---- WAV -> MP3 ------------------------------------------------------------
const data = Buffer.alloc(length * 4);
for (let i = 0; i < length; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

const dir = join(root, 'public/assets/audio');
mkdirSync(dir, { recursive: true });
const wav = join(dir, '_tmp.wav');
writeFileSync(wav, Buffer.concat([header, data]));
const mp3 = join(dir, 'little-sky-lullaby.mp3');
try {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '112k', mp3]);
  unlinkSync(wav);
  console.log('Wrote', mp3, `(${(totalBars * BAR).toFixed(1)}s)`);
} catch {
  console.log('ffmpeg not found — kept WAV at', wav);
}
