import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { gifts } from '../../data/messages';
import { personalization } from '../../data/personalization';
import { burstFrom, rain } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import Sticker from '../StickerWorld/Sticker';
import { scrollToId } from '../Letter/Letter';
import './Gifts.css';

/* A small gift box drawn in CSS: body, ribbon, lid that lifts off. */
function GiftBox({ open, tone }: { open: boolean; tone: 'a' | 'b' | 'c' }) {
  return (
    <span className={`giftbox giftbox--${tone} ${open ? 'is-open' : ''}`} aria-hidden="true">
      <span className="giftbox__glow" />
      <span className="giftbox__lid">
        <span className="giftbox__bow">
          <i />
          <i />
        </span>
      </span>
      <span className="giftbox__body" />
    </span>
  );
}

function SkyWhale() {
  return (
    <svg viewBox="0 0 240 180" className="gift__illus" role="img" aria-label="A little whale swimming through a starry sky under the moon">
      <defs>
        <linearGradient id="gi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1f3d" />
          <stop offset="1" stopColor="#12518A" />
        </linearGradient>
      </defs>
      <rect width="240" height="180" rx="16" fill="url(#gi-sky)" />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} className="gift__tw" cx={(i * 53) % 240} cy={(i * 37) % 120} r={i % 4 ? 0.9 : 1.6} fill="#F8FCFF" style={{ animationDelay: `${(i % 6) * 0.3}s` }} />
      ))}
      <path d="M190 30a20 20 0 1 0 14 34 17 17 0 0 1-14-34Z" fill="#DCDFFF" />
      <g className="gift__whale">
        <path d="M40 112c0-14 16-24 36-24 18 0 32 9 36 21l8-7c3-3 8-1 6 3l-3 9 5 5c2 3-1 7-5 5l-8-3c-6 10-20 15-36 15-22 0-39-9-39-24Z" fill="#57B8F5" stroke="#E5F5FF" strokeWidth="1.5" />
        <path d="M44 118c10 9 26 12 40 10 10-1 20-5 26-11-6 12-20 17-32 17-16 0-28-6-34-16Z" fill="#E5F5FF" opacity=".85" />
        <circle cx="62" cy="108" r="2.6" fill="#102C50" />
        <path d="M58 116q4 3 8 0" stroke="#102C50" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
      <path d="M0 160q30-10 60 0t60 0 60 0 60 0V180H0Z" fill="#2589FF" opacity=".5" />
      <text x="120" y="172" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="16" fill="#E5F5FF">
        always swimming back to you
      </text>
    </svg>
  );
}

const PETALS = 6;

function VirtualFlower() {
  const [grown, setGrown] = useState<boolean[]>(() => Array(PETALS).fill(false));
  const done = grown.every(Boolean);
  const count = grown.filter(Boolean).length;

  const grow = (i: number, el: Element) => {
    if (grown[i]) return;
    const next = grown.map((g, k) => (k === i ? true : g));
    setGrown(next);
    sfx('pop');
    burstFrom(el, { shapes: ['sparkle'], count: 6, spread: 40 });
    if (next.every(Boolean)) {
      setTimeout(() => {
        sfx('success');
        rain({ shapes: ['flower', 'sparkle'], count: 34, duration: 3600 });
      }, 300);
    }
  };

  return (
    <div className={`vflower glass ${done ? 'is-done' : ''}`}>
      <h3>A Flower to Grow</h3>
      <p className="vflower__hint">{done ? gifts.flowerDone : `Tap each petal to help it grow (${count}/${PETALS})`}</p>
      <svg viewBox="0 0 200 240" className="vflower__svg" aria-label="A little flower">
        <path className="vflower__stem" d="M100 230C96 190 106 160 100 120" stroke="#3B7F9E" strokeWidth="5" strokeLinecap="round" fill="none" style={{ strokeDashoffset: 120 - count * 20 }} />
        <path d="M100 196c-24-2-30-20-30-20 20-2 30 8 30 20Z" fill="#7CC6B8" stroke="#12518A" strokeWidth="1.6" className={count >= 2 ? 'vflower__leaf is-in' : 'vflower__leaf'} />
        <path d="M101 170c22-2 28-18 28-18-18-2-28 8-28 18Z" fill="#9FDCCF" stroke="#12518A" strokeWidth="1.6" className={count >= 4 ? 'vflower__leaf is-in' : 'vflower__leaf'} />
        <circle className="vflower__aura" cx="100" cy="90" r="70" />
        {grown.map((g, i) => (
          <g key={i} transform={`rotate(${i * (360 / PETALS)} 100 90)`}>
            <g
              className={`vflower__petal ${g ? 'is-grown' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={g ? 'Grown petal' : 'Petal bud — tap to grow'}
              aria-pressed={g}
              onClick={(e) => grow(i, e.currentTarget)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), grow(i, e.currentTarget))}
            >
              <circle cx="100" cy="52" r="20" fill="transparent" />
              <ellipse cx="100" cy="58" rx="16" ry="27" fill={i % 2 ? '#57B8F5' : '#2589FF'} stroke="#12518A" strokeWidth="1.8" className="vflower__petal-shape" />
              <circle cx="100" cy="58" r="5" fill="#A8DCFF" stroke="#12518A" strokeWidth="1.4" className="vflower__bud" />
            </g>
          </g>
        ))}
        <circle cx="100" cy="90" r="17" fill="#F8FCFF" stroke="#12518A" strokeWidth="2" />
        <g className="vflower__face">
          <circle cx="94" cy="88" r="2.2" fill="#102C50" />
          <circle cx="106" cy="88" r="2.2" fill="#102C50" />
          <path d={done ? 'M93 94q7 7 14 0' : 'M95 95q5 3 10 0'} stroke="#102C50" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
      {done && (
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setGrown(Array(PETALS).fill(false))}>
          <RotateCcw size={14} aria-hidden="true" /> Grow another
        </button>
      )}
    </div>
  );
}

export default function Gifts() {
  const [opened, setOpened] = useState<boolean[]>([false, false, false]);
  const toggle = (i: number, el: Element) => {
    const now = !opened[i];
    setOpened((o) => o.map((v, k) => (k === i ? now : v)));
    if (now) {
      sfx('chime');
      burstFrom(el, { shapes: ['star', 'heart', 'sparkle'], count: 22, spread: 130 });
    } else sfx('soft');
  };

  const items = [
    {
      label: 'A personal message',
      tone: 'a' as const,
      content: (
        <p className="gift__msg">
          {gifts.personalMessage}
          <span>— {personalization.senderName}</span>
        </p>
      ),
    },
    { label: 'An animated sticker', tone: 'b' as const, content: <Sticker id="hugBear" size={150} className="gift__sticker" /> },
    { label: 'A hidden illustration', tone: 'c' as const, content: <SkyWhale /> },
  ];

  return (
    <section className="chapter gifts" id="gifts" aria-labelledby="gifts-title">
      <div className="chapter__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Chapter Eight</span>
          <h2 id="gifts-title">{gifts.title}</h2>
          <p>{gifts.subtitle}</p>
        </header>

        <div className="gifts__row">
          {items.map((it, i) => (
            <div key={i} className={`gift reveal ${opened[i] ? 'is-open' : ''}`} style={{ ['--d' as string]: `${i * 120}ms` }}>
              <button type="button" className="gift__btn" onClick={(e) => toggle(i, e.currentTarget)} aria-expanded={opened[i]} aria-label={opened[i] ? `Close box ${i + 1}` : `Open box ${i + 1}: ${it.label}`}>
                <GiftBox open={opened[i]} tone={it.tone} />
              </button>
              <div className="gift__reveal" aria-hidden={!opened[i]}>
                {opened[i] && it.content}
              </div>
              <span className="gift__label">{opened[i] ? it.label : `Box ${i + 1}`}</span>
            </div>
          ))}
        </div>

        <VirtualFlower />

        <button type="button" className="next-link" onClick={() => scrollToId('feelings')}>
          How are you feeling? <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
