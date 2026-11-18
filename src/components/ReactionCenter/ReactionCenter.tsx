import { useRef, useState, type ReactElement } from 'react';
import { ChevronDown } from 'lucide-react';
import { reactions } from '../../data/messages';
import { burstFrom, confetti, rain } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import { scrollToId } from '../Letter/Letter';
import './ReactionCenter.css';

type Key = keyof typeof reactions.responses;
const N = '#102C50';

const Face = ({ children, bg = '#57B8F5' }: { children: ReactElement | ReactElement[]; bg?: string }) => (
  <svg viewBox="0 0 64 64" className="rc-face" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill={bg} stroke="#12518A" strokeWidth="2" />
    {children}
  </svg>
);

const OPTIONS: { key: Key; label: string; icon: ReactElement }[] = [
  {
    key: 'happy',
    label: 'Happy',
    icon: (
      <Face>
        <path d="M20 27q4-5 8 0M36 27q4-5 8 0" stroke={N} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M20 36q12 14 24 0Z" fill="#F8FCFF" stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      </Face>
    ),
  },
  {
    key: 'smiling',
    label: 'Smiling',
    icon: (
      <Face bg="#A8DCFF">
        <circle cx="24" cy="27" r="3" fill={N} />
        <circle cx="40" cy="27" r="3" fill={N} />
        <path d="M22 38q10 8 20 0" stroke={N} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </Face>
    ),
  },
  {
    key: 'blushing',
    label: 'Blushing',
    icon: (
      <Face bg="#E5F5FF">
        <path d="M19 28q5 4 10 0M35 28q5 4 10 0" stroke={N} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="19" cy="36" rx="6" ry="3.5" fill="#FFD9CB" />
        <ellipse cx="45" cy="36" rx="6" ry="3.5" fill="#FFD9CB" />
        <path d="M28 40q4 3 8 0" stroke={N} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </Face>
    ),
  },
  {
    key: 'surprised',
    label: 'Surprised',
    icon: (
      <Face bg="#54E4FF">
        <circle cx="24" cy="26" r="3.6" fill={N} />
        <circle cx="40" cy="26" r="3.6" fill={N} />
        <ellipse cx="32" cy="41" rx="5" ry="6.5" fill={N} />
      </Face>
    ),
  },
  {
    key: 'hug',
    label: 'Sending a hug',
    icon: (
      <Face bg="#A8DCFF">
        <path d="M20 28q4-4 8 0M36 28q4-4 8 0" stroke={N} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M27 37q5 4 10 0" stroke={N} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M6 44q10-8 18 2M58 44q-10-8-18 2" stroke="#12518A" strokeWidth="5" fill="none" strokeLinecap="round" />
      </Face>
    ),
  },
  {
    key: 'loved',
    label: 'Feeling loved',
    icon: (
      <Face bg="#2589FF">
        <path d="M18 26c0-3 4-4 6-1 2-3 6-2 6 1 0 3-6 6-6 6s-6-3-6-6ZM34 26c0-3 4-4 6-1 2-3 6-2 6 1 0 3-6 6-6 6s-6-3-6-6Z" fill="#F8FCFF" />
        <path d="M22 39q10 9 20 0" stroke="#F8FCFF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </Face>
    ),
  },
  {
    key: 'forgive',
    label: 'I forgive you',
    icon: (
      <svg viewBox="0 0 64 64" className="rc-face" aria-hidden="true">
        <path d="M32 54S8 40 8 24c0-7 6-13 13-13 5 0 9 3 11 7 2-4 6-7 11-7 7 0 13 6 13 13 0 16-24 30-24 30Z" fill="#57B8F5" stroke="#12518A" strokeWidth="2" />
        <path d="M32 18l-3 9 5 6-3 10" stroke="#F8FCFF" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'thinking',
    label: 'Still thinking',
    icon: (
      <Face bg="#DCDFFF">
        <path d="M20 27h8M36 25q4 3 8 0" stroke={N} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M26 40h12" stroke={N} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="52" cy="12" r="3" fill="#F8FCFF" stroke="#12518A" strokeWidth="1.4" />
        <circle cx="58" cy="5" r="2" fill="#F8FCFF" stroke="#12518A" strokeWidth="1.2" />
      </Face>
    ),
  },
];

function Stage({ k, nonce }: { k: Key; nonce: number }) {
  const cloud = (cls: string, eyesClosed = false) => (
    <g className={cls}>
      <path d="M-30 44c-14 0-22-9-22-19S-44 7-34 6c1-18 16-30 34-30s32 12 34 28c12 0 20 9 20 20s-9 20-22 20Z" fill="#F8FCFF" stroke="#12518A" strokeWidth="2.5" />
      {eyesClosed ? (
        <path d="M-17 11q5 5 10 0M7 11q5 5 10 0" stroke={N} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      ) : (
        <g fill={N}>
          <ellipse cx="-12" cy="10" rx="4" ry="5" />
          <ellipse cx="12" cy="10" rx="4" ry="5" />
        </g>
      )}
      <path d="M-6 20q6 6 12 0" stroke={N} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="-24" cy="20" rx="6" ry="3.5" fill="#A8DCFF" />
      <ellipse cx="24" cy="20" rx="6" ry="3.5" fill="#A8DCFF" />
    </g>
  );
  return (
    <svg viewBox="0 0 300 160" className={`rc-stage rc-stage--${k}`} key={`${k}-${nonce}`} aria-hidden="true">
      {k === 'happy' && (
        <g transform="translate(150 80)">
          {cloud('rc-jump')}
        </g>
      )}
      {k === 'smiling' && (
        <g className="rc-sunrise">
          <g transform="translate(150 96)">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <path key={i} d={`M${Math.cos(a) * 44} ${Math.sin(a) * 44}L${Math.cos(a) * 58} ${Math.sin(a) * 58}`} stroke="#FFD9CB" strokeWidth="6" strokeLinecap="round" />;
            })}
            <circle r="36" fill="#FFE6B8" stroke="#12518A" strokeWidth="2.5" />
            <circle cx="-12" cy="-6" r="3.5" fill={N} />
            <circle cx="12" cy="-6" r="3.5" fill={N} />
            <path d="M-12 8q12 12 24 0" stroke={N} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <rect x="0" y="120" width="300" height="40" fill="#A8DCFF" />
        </g>
      )}
      {k === 'blushing' && (
        <g>
          {[0, 1, 2].map((i) => (
            <path key={i} className={`rc-pinkcloud rc-pinkcloud--${i}`} d="M20 60C8 60 0 52 0 43s7-16 17-16c3-15 15-25 31-25 15 0 27 10 30 23 3-1 5-1 8-1 12 0 22 9 22 19s-10 17-22 17Z" fill={['#FFE3EF', '#FFD9CB', '#F3E2FF'][i]} opacity=".95" />
          ))}
          <g transform="translate(150 84)">{cloud('rc-shy', true)}</g>
        </g>
      )}
      {k === 'surprised' && (
        <g transform="translate(150 100)">
          <rect className="rc-box" x="-36" y="-10" width="72" height="56" rx="6" fill="#2589FF" stroke="#12518A" strokeWidth="2.5" />
          <rect x="-6" y="-10" width="12" height="56" fill="#F8FCFF" />
          <g className="rc-boxlid">
            <rect x="-42" y="-26" width="84" height="18" rx="5" fill="#57B8F5" stroke="#12518A" strokeWidth="2.5" />
            <rect x="-6" y="-26" width="12" height="18" fill="#F8FCFF" />
          </g>
          <g className="rc-popstar">
            <path d="m0-70 7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#54E4FF" stroke="#12518A" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </g>
      )}
      {k === 'hug' && (
        <g>
          <g className="rc-hug-l">
            <g transform="translate(110 84)">{cloud('', true)}</g>
          </g>
          <g className="rc-hug-r">
            <g transform="translate(190 84) scale(-1 1)">{cloud('', true)}</g>
          </g>
          <g transform="translate(138 10) scale(.75)">
            <path className="rc-hug-heart" d="M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z" fill="#2589FF" />
          </g>
        </g>
      )}
      {k === 'loved' && (
        <g transform="translate(150 80)">
          <g transform="translate(-48 -48) scale(3)">
            <path className="rc-bigheart" d="M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z" fill="#2589FF" stroke="#F8FCFF" strokeWidth="1" />
          </g>
        </g>
      )}
      {k === 'forgive' && (
        <g transform="translate(150 84)">
          <g className="rc-half rc-half--l">
            <path d="M0 54S-30 36-30 14c0-10 8-18 17-18 6 0 11 3 13 8L-6 20 4 30Z" fill="#57B8F5" stroke="#12518A" strokeWidth="2.5" strokeLinejoin="round" transform="translate(0 -30)" />
          </g>
          <g className="rc-half rc-half--r">
            <path d="M0 54S30 36 30 14c0-10-8-18-17-18-6 0-11 3-13 8L-6 20 4 30Z" fill="#2589FF" stroke="#12518A" strokeWidth="2.5" strokeLinejoin="round" transform="translate(0 -30)" />
          </g>
          <circle className="rc-mend-glow" r="60" fill="rgba(84,228,255,.25)" />
        </g>
      )}
      {k === 'thinking' && (
        <g transform="translate(150 86)">
          <g className="rc-breathe">{cloud('', true)}</g>
          <g className="rc-dots" fill="#F8FCFF" stroke="#12518A" strokeWidth="1.5">
            <circle cx="50" cy="-30" r="5" />
            <circle cx="64" cy="-46" r="7" />
            <circle cx="84" cy="-62" r="10" />
          </g>
        </g>
      )}
    </svg>
  );
}

export default function ReactionCenter() {
  const [sel, setSel] = useState<Key | null>(null);
  const [nonce, setNonce] = useState(0);
  const panel = useRef<HTMLDivElement>(null);

  const choose = (k: Key, el: Element) => {
    setSel(k);
    setNonce((n) => n + 1);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    switch (k) {
      case 'happy':
        confetti(cx, cy);
        sfx('success');
        break;
      case 'smiling':
        burstFrom(el, { shapes: ['sparkle', 'star'], count: 20, spread: 120, colors: ['#FFE6B8', '#FFD9CB', '#54E4FF', '#F8FCFF'] });
        sfx('chime');
        break;
      case 'blushing':
        rain({ shapes: ['cloud'], colors: ['#FFE3EF', '#FFD9CB', '#F3E2FF', '#F8FCFF'], count: 16, size: [60, 120], duration: 7000, from: 'left' });
        sfx('soft');
        break;
      case 'surprised':
        setTimeout(() => {
          const s = panel.current?.querySelector('.rc-stage');
          if (s) burstFrom(s, { shapes: ['star', 'sparkle', 'heart'], count: 30, spread: 180 });
          sfx('bloop');
        }, 700);
        break;
      case 'hug':
        setTimeout(() => {
          const s = panel.current?.querySelector('.rc-stage');
          if (s) burstFrom(s, { shapes: ['heart'], count: 16, spread: 100 });
        }, 900);
        sfx('soft');
        break;
      case 'loved':
        rain({ shapes: ['heart'], count: 60, duration: 4600 });
        sfx('chime');
        break;
      case 'forgive':
        setTimeout(() => {
          const s = panel.current?.querySelector('.rc-stage');
          if (s) burstFrom(s, { shapes: ['sparkle', 'heart'], count: 18, spread: 110 });
          sfx('success');
        }, 1100);
        break;
      case 'thinking':
        sfx('soft');
        break;
    }
  };

  return (
    <section className="chapter rc" id="feelings" aria-labelledby="rc-title">
      <div className="chapter__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Chapter Nine</span>
          <h2 id="rc-title">{reactions.title}</h2>
          <p>{reactions.note}</p>
        </header>

        <div className="rc__grid" role="radiogroup" aria-label="Choose a feeling (optional)">
          {OPTIONS.map((o, i) => (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={sel === o.key}
              className={`rc__card reveal ${sel === o.key ? 'is-selected' : ''}`}
              style={{ ['--d' as string]: `${i * 60}ms` }}
              onClick={(e) => choose(o.key, e.currentTarget)}
            >
              {o.icon}
              <span>{o.label}</span>
            </button>
          ))}
        </div>

        <div className={`rc__panel ${sel ? 'is-on' : ''}`} ref={panel} aria-live="polite">
          {sel ? (
            <>
              <Stage k={sel} nonce={nonce} />
              <p className="rc__response" key={`${sel}-${nonce}`}>
                {reactions.responses[sel]}
              </p>
            </>
          ) : (
            <p className="rc__idle">Choose one if you feel like it — or simply keep going.</p>
          )}
        </div>

        <button type="button" className="next-link" onClick={() => scrollToId('finale')}>
          One more thing <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
