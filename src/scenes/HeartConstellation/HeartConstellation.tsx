import { useEffect, useMemo, useRef, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { burst } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import { prefersReducedMotion } from '../../lib/store';
import './HeartConstellation.css';

const COUNT = 14;

/** Points on the classic heart curve, in a 400×360 viewBox. */
function heartPoints(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: 200 + x * 10.5, y: 160 - y * 10.5 };
  });
}

/**
 * Tap the stars to connect them — when every star is lit, a glowing heart
 * constellation appears. "Draw it for me" connects them automatically.
 */
export default function HeartConstellation({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const pts = useMemo(() => heartPoints(COUNT), []);
  const [lit, setLit] = useState<boolean[]>(() => Array(COUNT).fill(false));
  const [auto, setAuto] = useState(false);
  const done = lit.every(Boolean);
  const svg = useRef<SVGSVGElement>(null);
  const fired = useRef(false);

  const bg = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        x: (i * 89.3) % 400,
        y: (i * 47.7) % 360,
        r: i % 9 === 0 ? 1.6 : 0.5 + ((i * 7) % 10) / 14,
        d: (i % 30) * 0.12,
      })),
    [],
  );

  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      sfx('success');
      const r = svg.current?.getBoundingClientRect();
      if (r) burst(r.left + r.width / 2, r.top + r.height * 0.45, { shapes: ['sparkle', 'star', 'heart'], count: 40, spread: 220 });
      const t = window.setTimeout(onComplete, 900);
      return () => clearTimeout(t);
    }
  }, [done, onComplete]);

  const light = (i: number) => {
    if (lit[i]) return;
    setLit((l) => l.map((v, k) => (k === i ? true : v)));
    sfx('sparkle');
    const c = svg.current?.querySelectorAll('.hc__star')[i];
    if (c) {
      const r = c.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { shapes: ['sparkle'], count: 6, spread: 40, size: [6, 12] });
    }
  };

  const drawForMe = () => {
    setAuto(true);
    const reduced = prefersReducedMotion();
    pts.forEach((_, i) => {
      window.setTimeout(() => setLit((l) => l.map((v, k) => (k === i ? true : v))), reduced ? 0 : i * 140);
    });
    sfx('chime');
  };

  return (
    <div className={`hc ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}>
      <svg ref={svg} viewBox="0 0 400 360" className="hc__svg" role="group" aria-label={`Heart constellation: ${lit.filter(Boolean).length} of ${COUNT} stars connected`}>
        <defs>
          <radialGradient id="hc-glow">
            <stop offset="0" stopColor="#F8FCFF" />
            <stop offset=".35" stopColor="#54E4FF" stopOpacity=".7" />
            <stop offset="1" stopColor="#2589FF" stopOpacity="0" />
          </radialGradient>
          <filter id="hc-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {bg.map((s, i) => (
          <circle key={i} className="hc__bg" cx={s.x} cy={s.y} r={s.r} style={{ animationDelay: `${s.d}s` }} />
        ))}
        {/* glow heart once complete */}
        <path className="hc__fill" d={`M${pts.map((p) => `${p.x},${p.y}`).join(' L')} Z`} filter="url(#hc-blur)" />
        {pts.map((p, i) => {
          const q = pts[(i + 1) % COUNT];
          const on = lit[i] && lit[(i + 1) % COUNT];
          return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={`hc__line ${on ? 'is-on' : ''}`} />;
        })}
        {pts.map((p, i) => (
          <g
            key={i}
            className={`hc__star ${lit[i] ? 'is-lit' : ''}`}
            transform={`translate(${p.x} ${p.y})`}
            role="button"
            tabIndex={done ? -1 : 0}
            aria-label={lit[i] ? `Star ${i + 1}, connected` : `Star ${i + 1} — tap to light`}
            onClick={() => light(i)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), light(i))}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <circle r="18" fill="transparent" />
            <circle r="12" fill="url(#hc-glow)" className="hc__halo" />
            <path d="M0-7C.6-2.6 2.6-.6 7 0 2.6.6.6 2.6 0 7-.6 2.6-2.6.6-7 0-2.6-.6-.6-2.6 0-7Z" fill="#F8FCFF" />
          </g>
        ))}
      </svg>
      {!done && (
        <div className="hc__ui">
          <p>Tap the stars to connect them ({lit.filter(Boolean).length}/{COUNT})</p>
          {!auto && (
            <button type="button" className="btn btn--ghost btn--small" onClick={drawForMe}>
              <Wand2 size={15} aria-hidden="true" /> Draw it for me
            </button>
          )}
        </div>
      )}
    </div>
  );
}
