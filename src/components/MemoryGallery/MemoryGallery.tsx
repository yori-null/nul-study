import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X, ImagePlus } from 'lucide-react';
import { memories, type Memory } from '../../data/memories';
import { sfx } from '../../lib/sound';
import { scrollToId } from '../Letter/Letter';
import './MemoryGallery.css';

const assetUrl = (src: string) => (/^(https?:|data:|\/)/.test(src) ? src : `${import.meta.env.BASE_URL}${src}`);

/** Elegant illustrated placeholder — never pretends to be a real memory. */
function PlaceholderArt({ art = 'clouds' }: { art?: Memory['art'] }) {
  const palettes: Record<string, [string, string, string]> = {
    dawn: ['#A8DCFF', '#E5F5FF', '#FFD9CB'],
    ocean: ['#2589FF', '#57B8F5', '#A8DCFF'],
    night: ['#102C50', '#12518A', '#57B8F5'],
    clouds: ['#57B8F5', '#A8DCFF', '#F8FCFF'],
    stars: ['#0b1f3d', '#12518A', '#54E4FF'],
    horizon: ['#12518A', '#57B8F5', '#E5F5FF'],
  };
  const [a, b, c] = palettes[art] ?? palettes.clouds;
  const dark = art === 'night' || art === 'stars';
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" className="mem__ph" aria-hidden="true">
      <defs>
        <linearGradient id={`ph-${art}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset=".7" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#ph-${art})`} />
      {dark &&
        Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 97) % 300} cy={(i * 53) % 190} r={i % 6 === 0 ? 1.8 : 1} fill="#fff" opacity={0.5 + (i % 3) * 0.2} />)}
      {art === 'dawn' && <circle cx="150" cy="210" r="46" fill="#FFF3E9" opacity=".85" />}
      {art === 'night' && <path d="M210 60a34 34 0 1 0 22 56 30 30 0 0 1-22-56Z" fill="#DCDFFF" />}
      {art === 'ocean' && (
        <g fill="none" stroke="#F8FCFF" strokeWidth="3" opacity=".7" strokeLinecap="round">
          <path d="M0 220q25-12 50 0t50 0 50 0 50 0 50 0 50 0" />
          <path d="M0 250q25-12 50 0t50 0 50 0 50 0 50 0 50 0" opacity=".6" />
        </g>
      )}
      {(art === 'clouds' || art === 'dawn' || art === 'horizon') && (
        <g fill="#F8FCFF" opacity=".9">
          <path d="M40 140c-12 0-20-7-20-16s7-15 16-15c3-13 13-21 26-21 12 0 22 8 25 19 10 0 18 7 18 17s-8 16-18 16Z" />
          <path d="M190 100c-9 0-15-5-15-12s5-12 12-12c2-10 10-16 20-16 9 0 17 6 19 15 8 0 14 5 14 13s-6 12-14 12Z" opacity=".8" />
        </g>
      )}
      {art === 'horizon' && <path d="M0 230h300v70H0Z" fill="#12518A" opacity=".35" />}
      {art === 'stars' && <path d="M60 230 110 170l40 30 50-60 40 40" fill="none" stroke="#54E4FF" strokeWidth="1.5" opacity=".7" />}
      <g transform="translate(150 150)" opacity=".9">
        <circle r="26" fill={dark ? 'rgba(248,252,255,.12)' : 'rgba(255,255,255,.4)'} />
        <path d="M-10-6h20v14h-20Z M-4-10h8" fill="none" stroke={dark ? '#E5F5FF' : '#12518A'} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <circle cy="1" r="4" fill="none" stroke={dark ? '#E5F5FF' : '#12518A'} strokeWidth="2.4" />
      </g>
    </svg>
  );
}

function Media({ m, full = false }: { m: Memory; full?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!m.src || failed || m.type === 'placeholder') return <PlaceholderArt art={m.art} />;
  if (m.type === 'video')
    return (
      <video
        src={assetUrl(m.src)}
        poster={m.poster ? assetUrl(m.poster) : undefined}
        controls={full}
        muted={!full}
        loop
        playsInline
        preload={full ? 'metadata' : 'none'}
        onError={() => setFailed(true)}
      />
    );
  return <img src={assetUrl(m.src)} alt={m.caption} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

const fmt = (d?: string) => {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function MemoryGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const hasReal = memories.some((m) => m.src);

  const go = useCallback((d: number) => {
    setOpen((o) => (o === null ? o : (o + d + memories.length) % memories.length));
    sfx('soft');
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    document.body.classList.add('is-locked');
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
  }, [open, go, close]);

  const tilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${x * 16}deg`);
    el.style.setProperty('--rx', `${-y * 16}deg`);
  };
  const untilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty('--ry', '0deg');
    e.currentTarget.style.setProperty('--rx', '0deg');
  };

  const cur = open !== null ? memories[open] : null;

  return (
    <section className="chapter mem" id="memories" aria-labelledby="mem-title">
      <div className="chapter__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Chapter Six</span>
          <h2 id="mem-title">Little Moments, Beautiful Memories</h2>
          <p>{hasReal ? 'Tap a photo to see it closer.' : 'A little gallery waiting for our photos. Tap one to look closer.'}</p>
        </header>

        <ul className="mem__grid">
          {memories.map((m, i) => (
            <li key={i} className="reveal" style={{ ['--d' as string]: `${i * 80}ms`, ['--rot' as string]: `${[-4, 3, -2, 4, -3, 2][i % 6]}deg` }}>
              <button
                type="button"
                className="mem__card"
                onPointerMove={tilt}
                onPointerLeave={untilt}
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  setOpen(i);
                  sfx('paper');
                }}
                aria-label={`Open memory: ${m.caption}`}
              >
                <span className="mem__tape" aria-hidden="true" />
                <span className="mem__photo">
                  <Media m={m} />
                </span>
                <span className="mem__caption">{m.caption}</span>
                {m.date && <span className="mem__date">{fmt(m.date)}</span>}
                {!m.src && (
                  <span className="mem__hint">
                    <ImagePlus size={12} aria-hidden="true" /> placeholder
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="next-link" onClick={() => scrollToId('game')}>
          A little game <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>

      {cur && open !== null && (
        <div
          className="mem__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={cur.caption}
          onClick={close}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <figure className="mem__figure" onClick={(e) => e.stopPropagation()} key={open}>
            <div className="mem__full">
              <Media m={cur} full />
            </div>
            <figcaption>
              <strong>{cur.caption}</strong>
              {cur.date && <span className="mem__date">{fmt(cur.date)}</span>}
              {cur.note && <p>{cur.note}</p>}
            </figcaption>
          </figure>
          <button type="button" className="mem__nav mem__nav--prev" onClick={(e) => (e.stopPropagation(), go(-1))} aria-label="Previous memory">
            <ChevronLeft />
          </button>
          <button type="button" className="mem__nav mem__nav--next" onClick={(e) => (e.stopPropagation(), go(1))} aria-label="Next memory">
            <ChevronRight />
          </button>
          <button type="button" className="mem__close" ref={closeBtn} onClick={close} aria-label="Close">
            <X />
          </button>
          <span className="mem__count">
            {open + 1} / {memories.length}
          </span>
        </div>
      )}
    </section>
  );
}
