import { prefersReducedMotion } from './store';

/* Particle bursts drawn with tiny SVGs + the Web Animations API.
   Each particle removes itself when its animation finishes (no leaks). */

export type Shape = 'heart' | 'star' | 'sparkle' | 'flower' | 'confetti' | 'cloud' | 'dot';

const BLUES = ['#57B8F5', '#2589FF', '#A8DCFF', '#54E4FF', '#E5F5FF', '#12518A'];
const ACCENTS = ['#DCDFFF', '#FFD9CB'];

export const svgShape = (shape: Shape, color: string) => {
  switch (shape) {
    case 'heart':
      return `<svg viewBox="0 0 32 32"><path fill="${color}" d="M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z"/></svg>`;
    case 'star':
      return `<svg viewBox="0 0 32 32"><path fill="${color}" d="m16 2 4.1 8.6 9.4 1.2-6.9 6.5 1.8 9.3L16 23.1l-8.4 4.5 1.8-9.3-6.9-6.5 9.4-1.2Z"/></svg>`;
    case 'sparkle':
      return `<svg viewBox="0 0 32 32"><path fill="${color}" d="M16 1c1.2 8 3.6 12.6 15 15-11.4 2.4-13.8 7-15 15-1.2-8-3.6-12.6-15-15C12.4 13.6 14.8 9 16 1Z"/></svg>`;
    case 'flower':
      return `<svg viewBox="0 0 32 32"><g fill="${color}">${[0, 72, 144, 216, 288]
        .map((r) => `<ellipse cx="16" cy="8.5" rx="5" ry="7.5" transform="rotate(${r} 16 16)"/>`)
        .join('')}</g><circle cx="16" cy="16" r="4.2" fill="#FFF7D6"/></svg>`;
    case 'cloud':
      return `<svg viewBox="0 0 64 40"><path fill="${color}" d="M16 38C7 38 2 32 2 26s5-11 11-11c2-8 9-13 17-13 9 0 16 6 17 14 8 0 15 5 15 11s-5 11-13 11Z"/></svg>`;
    case 'dot':
      return `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="${color}"/></svg>`;
    case 'confetti':
    default:
      return `<svg viewBox="0 0 10 16"><rect width="10" height="16" rx="2" fill="${color}"/></svg>`;
  }
};

let layer: HTMLDivElement | null = null;
function getLayer() {
  if (layer && document.body.contains(layer)) return layer;
  layer = document.createElement('div');
  layer.className = 'fx-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  return layer;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

type BurstOpts = {
  shapes?: Shape[];
  colors?: string[];
  count?: number;
  spread?: number;
  size?: [number, number];
  duration?: number;
  gravity?: number;
};

let live = 0;
const MAX_LIVE = 260;

/** Explode particles from a viewport point. */
export function burst(x: number, y: number, opts: BurstOpts = {}) {
  if (typeof document === 'undefined') return;
  const reduced = prefersReducedMotion();
  const {
    shapes = ['sparkle', 'heart', 'star'],
    colors = [...BLUES, ...BLUES, ...ACCENTS],
    spread = 140,
    size = [10, 22],
    duration = 1200,
    gravity = 60,
  } = opts;
  let count = opts.count ?? 16;
  if (reduced) count = Math.min(count, 6);
  count = Math.min(count, MAX_LIVE - live);
  const root = getLayer();
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const s = rand(size[0], size[1]);
    el.className = 'fx-p';
    el.style.cssText = `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px`;
    el.innerHTML = svgShape(pick(shapes), pick(colors));
    root.appendChild(el);
    live++;
    const ang = rand(0, Math.PI * 2);
    const dist = rand(spread * 0.35, spread);
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist;
    const rot = rand(-220, 220);
    const anim = el.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }]
        : [
            { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 1 },
            { transform: `translate(${dx * 0.8}px,${dy * 0.8}px) scale(1) rotate(${rot * 0.7}deg)`, opacity: 1, offset: 0.55 },
            { transform: `translate(${dx}px,${dy + gravity}px) scale(.6) rotate(${rot}deg)`, opacity: 0 },
          ],
      { duration: duration * rand(0.75, 1.2), easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'forwards' },
    );
    anim.onfinish = () => {
      el.remove();
      live--;
    };
  }
}

/** Burst from the centre of an element. */
export function burstFrom(el: Element | null, opts?: BurstOpts) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, opts);
}

type RainOpts = { shapes?: Shape[]; colors?: string[]; count?: number; duration?: number; size?: [number, number]; from?: 'top' | 'bottom' | 'left' };

/** Let particles fall (or rise / drift) across the whole screen. */
export function rain(opts: RainOpts = {}) {
  if (typeof document === 'undefined') return;
  const reduced = prefersReducedMotion();
  const { shapes = ['heart', 'star', 'flower', 'sparkle'], colors = [...BLUES, ...ACCENTS], duration = 4200, size = [14, 30], from = 'top' } = opts;
  let count = opts.count ?? 60;
  if (reduced) count = Math.min(count, 10);
  if (window.innerWidth < 600) count = Math.round(count * 0.6);
  count = Math.min(count, MAX_LIVE - live);
  const root = getLayer();
  const W = window.innerWidth;
  const H = window.innerHeight;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const s = rand(size[0], size[1]);
    el.className = 'fx-p';
    let x0 = rand(0, W);
    let y0 = -40;
    let x1 = x0 + rand(-120, 120);
    let y1 = H + 60;
    if (from === 'bottom') {
      y0 = H + 40;
      y1 = rand(-80, H * 0.2);
    } else if (from === 'left') {
      x0 = -60;
      y0 = rand(H * 0.1, H * 0.8);
      x1 = W + 60;
      y1 = y0 + rand(-80, 80);
    }
    el.style.cssText = `left:${x0}px;top:${y0}px;width:${s}px;height:${s}px`;
    el.innerHTML = svgShape(pick(shapes), pick(colors));
    root.appendChild(el);
    live++;
    const anim = el.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }]
        : [
            { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
            { opacity: 1, offset: 0.1 },
            { opacity: 1, offset: 0.85 },
            { transform: `translate(${x1 - x0}px,${y1 - y0}px) rotate(${rand(-360, 360)}deg)`, opacity: 0 },
          ],
      { duration: duration * rand(0.7, 1.3), delay: rand(0, duration * 0.6), easing: 'linear', fill: 'both' },
    );
    anim.onfinish = () => {
      el.remove();
      live--;
    };
  }
}

export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  burst(x, y, { shapes: ['confetti', 'confetti', 'sparkle', 'heart'], count: 46, spread: 320, size: [8, 16], duration: 1700, gravity: 220 });
}

/* ---------- Global toast messages ---------- */
export type ToastDetail = { text: string; title?: string; icon?: Shape; duration?: number };

export function toast(text: string, opts: Omit<ToastDetail, 'text'> = {}) {
  window.dispatchEvent(new CustomEvent<ToastDetail>('sky:toast', { detail: { text, ...opts } }));
}

export { pick, rand };
