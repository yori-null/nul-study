import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { store, useStore, isCoarsePointer, prefersReducedMotion } from '../../lib/store';
import { burst, svgShape, type ToastDetail } from '../../lib/effects';
import { sfx, unlockAudio } from '../../lib/sound';
import { floatingBubbles, fill } from '../../data/messages';
import { personalization, softName } from '../../data/personalization';
import './Chrome.css';

/* ---------------- Custom cursor + click sparkles ---------------- */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = !isCoarsePointer() && window.matchMedia('(pointer: fine)').matches;
    const onClick = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      burst(e.clientX, e.clientY, { count: e.pointerType === 'touch' ? 6 : 8, spread: 46, size: [6, 12], duration: 700, gravity: 10, shapes: ['sparkle', 'dot'] });
    };
    window.addEventListener('pointerdown', onClick, { passive: true });
    if (!fine) return () => window.removeEventListener('pointerdown', onClick);
    document.documentElement.classList.add('has-custom-cursor');
    let x = -100;
    let y = -100;
    let hx = x;
    let hy = y;
    let raf = 0;
    let hover = false;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element | null;
      hover = !!t?.closest?.('button, a, [role="button"], input, .is-interactive');
    };
    const tick = () => {
      hx += (x - hx) * 0.18;
      hy += (y - hy) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (halo.current) {
        halo.current.style.transform = `translate3d(${hx}px,${hy}px,0) scale(${hover ? 1.6 : 1})`;
      }
      raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      x = y = -100;
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', onClick);
      document.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);
  return (
    <>
      <div className="cursor-halo chrome" ref={halo} aria-hidden="true" />
      <div className="cursor-dot chrome" ref={dot} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgShape('sparkle', '#F8FCFF') }} />
    </>
  );
}

/* ---------------- Toast messages ---------------- */
type T = ToastDetail & { id: number };
export function Toaster() {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    let n = 0;
    const timers: number[] = [];
    const on = (e: Event) => {
      const d = (e as CustomEvent<ToastDetail>).detail;
      const id = ++n;
      setItems((list) => [...list.slice(-2), { ...d, id }]);
      timers.push(window.setTimeout(() => setItems((list) => list.filter((i) => i.id !== id)), d.duration ?? 3800));
    };
    window.addEventListener('sky:toast', on);
    return () => {
      window.removeEventListener('sky:toast', on);
      timers.forEach(clearTimeout);
    };
  }, []);
  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((t) => (
        <div className="toast" key={t.id}>
          <span className="toast__icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgShape(t.icon ?? 'sparkle', '#2589FF') }} />
          <div>
            {t.title && <strong>{t.title}</strong>}
            <p>{t.text}</p>
          </div>
          <button type="button" className="toast__x" onClick={() => setItems((l) => l.filter((i) => i.id !== t.id))} aria-label="Dismiss message">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Floating message bubbles ---------------- */
export function FloatingBubbles() {
  const [b, setB] = useState<{ text: string; top: number; k: number } | null>(null);
  const opened = useStore((s) => s.opened);
  useEffect(() => {
    if (!opened || prefersReducedMotion()) return;
    let i = Math.floor(Math.random() * floatingBubbles.length);
    const show = () => {
      if (document.hidden || store.get().cleanMode) return;
      i = (i + 1) % floatingBubbles.length;
      setB({ text: fill(floatingBubbles[i], { nick: softName, name: personalization.recipientName }), top: 18 + Math.random() * 55, k: Date.now() });
    };
    const first = window.setTimeout(show, 14000);
    const id = window.setInterval(show, 26000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [opened]);
  if (!b) return null;
  return (
    <div className="bubble-drift chrome" key={b.k} style={{ top: `${b.top}%` }} aria-hidden="true" onAnimationEnd={() => setB(null)}>
      <span>{b.text}</span>
    </div>
  );
}

/* ---------------- Top bar: sound + calm mode exit ---------------- */
export function TopBar() {
  const soundOn = useStore((s) => s.soundOn);
  const clean = useStore((s) => s.cleanMode);
  return (
    <>
      <div className="topbar chrome">
        <button
          type="button"
          className="icon-btn"
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Turn sound effects off' : 'Turn sound effects on'}
          title={soundOn ? 'Sound effects on' : 'Sound effects off'}
          onClick={() => {
            unlockAudio();
            store.set({ soundOn: !soundOn });
            if (!soundOn) sfx('chime', true);
          }}
        >
          {soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>
      </div>
      {clean && (
        <button type="button" className="clean-exit" onClick={() => store.set({ cleanMode: false })}>
          <Sparkles size={14} /> Show controls
        </button>
      )}
    </>
  );
}

/* ---------------- Chapter progress ---------------- */
export const CHAPTERS = [
  { id: 'letter', label: 'The letter' },
  { id: 'celebrate', label: 'Monthiversary' },
  { id: 'little-things', label: 'Little things' },
  { id: 'stickers', label: 'Sticker world' },
  { id: 'garden', label: 'Sky garden' },
  { id: 'memories', label: 'Memories' },
  { id: 'game', label: 'Mini-game' },
  { id: 'gifts', label: 'Little boxes' },
  { id: 'feelings', label: 'Feelings' },
  { id: 'finale', label: 'One more thing' },
];

export function ChapterNav() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = CHAPTERS.findIndex((c) => c.id === e.target.id);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  // the sky follows the story: day → dusk → night
  useEffect(() => {
    const id = CHAPTERS[active].id;
    store.set({ skyMode: id === 'finale' ? 'night' : id === 'feelings' ? 'dusk' : 'day' });
  }, [active]);
  return (
    <nav className="chapters chrome" aria-label="Chapters">
      <ol>
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <a href={`#${c.id}`} className={i === active ? 'is-active' : ''} aria-current={i === active ? 'step' : undefined}>
              <span className="chapters__label">{c.label}</span>
              <span className="chapters__dot" />
            </a>
          </li>
        ))}
      </ol>
      <div className="chapters__bar" aria-hidden="true">
        <span style={{ width: `${((active + 1) / CHAPTERS.length) * 100}%` }} />
      </div>
    </nav>
  );
}
