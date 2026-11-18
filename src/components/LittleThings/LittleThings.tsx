import { useEffect, useRef, useState, type ReactElement } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { littleThings } from '../../data/messages';
import { burstFrom } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import { scrollToId } from '../Letter/Letter';
import './LittleThings.css';

const O = '#12518A';
const ART: ReactElement[] = [
  // 01 reminder — sun peeking through clouds
  <svg viewBox="0 0 120 90" key="a">
    <g className="lt-rays" style={{ transformOrigin: '60px 46px' }} stroke="#FFD9CB" strokeWidth="4" strokeLinecap="round">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <path key={i} d={`M${60 + Math.cos(a) * 24} ${46 + Math.sin(a) * 24}L${60 + Math.cos(a) * 32} ${46 + Math.sin(a) * 32}`} />;
      })}
    </g>
    <circle cx="60" cy="46" r="17" fill="#FFE6B8" stroke={O} strokeWidth="2" />
    <path className="lt-cloud" d="M24 74c-8 0-12-5-12-10s4-10 10-10c2-7 8-11 15-11 8 0 13 5 15 11 7 0 12 4 12 10s-5 10-12 10Z" fill="#F8FCFF" stroke={O} strokeWidth="2" />
    <path className="lt-cloud lt-cloud--2" d="M78 80c-6 0-10-4-10-8s4-8 8-8c1-6 6-9 12-9 6 0 11 4 12 9 5 0 10 3 10 8s-4 8-10 8Z" fill="#E5F5FF" stroke={O} strokeWidth="2" />
  </svg>,
  // 02 thank you — paper plane with a trail
  <svg viewBox="0 0 120 90" key="b">
    <path className="lt-trail" d="M10 74c20-4 24-20 40-22s18 12 30 4" fill="none" stroke="#54E4FF" strokeWidth="3" strokeDasharray="5 6" strokeLinecap="round" />
    <g className="lt-plane">
      <path d="M78 34 112 18 98 58 88 46Z" fill="#F8FCFF" stroke={O} strokeWidth="2" strokeLinejoin="round" />
      <path d="M78 34l10 12 2 14 8-2" fill="#A8DCFF" stroke={O} strokeWidth="2" strokeLinejoin="round" />
    </g>
  </svg>,
  // 03 promise — a little sprout that grows
  <svg viewBox="0 0 120 90" key="c">
    <path d="M30 80h60" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 80l6-16h28l6 16Z" fill="#57B8F5" stroke={O} strokeWidth="2" strokeLinejoin="round" />
    <g className="lt-sprout" style={{ transformOrigin: '60px 64px' }}>
      <path d="M60 64V36" stroke="#3B7F9E" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 46c-14 0-18-12-18-12 12-2 18 4 18 12Z" fill="#7CC6B8" stroke={O} strokeWidth="2" />
      <path d="M60 40c12 0 18-12 18-12-12-2-18 4-18 12Z" fill="#9FDCCF" stroke={O} strokeWidth="2" />
      <circle cx="60" cy="30" r="5" fill="#A8DCFF" stroke={O} strokeWidth="2" />
    </g>
  </svg>,
  // 04 wish — shooting star
  <svg viewBox="0 0 120 90" key="d">
    <g className="lt-shoot">
      <path d="M14 76 70 34" stroke="#54E4FF" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      <path d="M26 82 66 52" stroke="#A8DCFF" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      <path d="m84 10 6 13 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2Z" fill="#F8FCFF" stroke={O} strokeWidth="2" strokeLinejoin="round" />
    </g>
    <circle cx="20" cy="20" r="2" fill="#F8FCFF" className="lt-twinkle" />
    <circle cx="104" cy="70" r="2.4" fill="#F8FCFF" className="lt-twinkle" />
  </svg>,
  // 05 secret — a keyhole heart lock
  <svg viewBox="0 0 120 90" key="e">
    <path className="lt-shackle" d="M46 40V30a14 14 0 0 1 28 0v10" fill="none" stroke={O} strokeWidth="5" strokeLinecap="round" />
    <rect x="36" y="38" width="48" height="40" rx="10" fill="#2589FF" stroke={O} strokeWidth="2.5" />
    <path d="M60 68s-10-6-10-12c0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 6-10 12-10 12Z" fill="#F8FCFF" />
  </svg>,
];

const THEMES = ['lt-card--dawn', 'lt-card--paper', 'lt-card--ocean', 'lt-card--night', 'lt-card--glass'];

export default function LittleThings() {
  const [open, setOpen] = useState<number | null>(null);
  const [art, setArt] = useState(0);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    document.body.classList.add('is-locked');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const show = (i: number, el: HTMLElement) => {
    lastFocus.current = el;
    setOpen(i);
    sfx('paper');
  };
  const close = () => {
    setOpen(null);
    sfx('soft');
    lastFocus.current?.focus();
  };

  const card = open !== null ? littleThings.cards[open] : null;

  return (
    <section className="chapter lt" id="little-things" aria-labelledby="lt-title">
      <div className="chapter__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Chapter Three</span>
          <h2 id="lt-title">{littleThings.title}</h2>
          <p>Five small cards. Open them whenever you like.</p>
        </header>

        <ul className="lt__grid">
          {littleThings.cards.map((c, i) => (
            <li key={i} className="reveal" style={{ ['--d' as string]: `${i * 90}ms` }}>
              <button type="button" className={`lt-card ${THEMES[i]}`} onClick={(e) => show(i, e.currentTarget)} aria-haspopup="dialog">
                <span className="lt-card__num">Card {String(i + 1).padStart(2, '0')}</span>
                <span className="lt-card__art" aria-hidden="true">
                  {ART[i]}
                </span>
                <span className="lt-card__label">{c.label}</span>
                <span className="lt-card__open">Open</span>
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="next-link" onClick={() => scrollToId('stickers')}>
          The sticker world <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>

      {card && open !== null && (
        <div className="lt-modal" role="dialog" aria-modal="true" aria-labelledby="lt-modal-title" onClick={close}>
          <div className={`lt-modal__card ${THEMES[open]}`} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lt-modal__close" onClick={close} ref={closeRef} aria-label="Close card">
              <X size={20} />
            </button>
            <button
              type="button"
              className={`lt-modal__art is-anim-${art % 2}`}
              aria-label="Play with the little illustration"
              onClick={(e) => {
                setArt((a) => a + 1);
                burstFrom(e.currentTarget, { count: 14, spread: 100 });
                sfx('sparkle');
              }}
            >
              {ART[open]}
            </button>
            <span className="lt-card__num">Card {String(open + 1).padStart(2, '0')}</span>
            <h3 id="lt-modal-title">{card.label}</h3>
            <p className="lt-modal__text">
              {card.text.split(' ').map((w, i) => (
                <span key={i} style={{ ['--i' as string]: i }}>
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
