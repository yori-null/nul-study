import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { apologyLetter, fill } from '../../data/messages';
import { personalization } from '../../data/personalization';
import { useInView } from '../../hooks/useReveal';
import { burstFrom, toast } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import Sticker from '../StickerWorld/Sticker';
import './Letter.css';

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const DECOR = [
  { id: 'cloud', cls: 'tl' },
  { id: 'balloon', cls: 'tr' },
  { id: 'shy', cls: 'bl' },
  { id: 'envelope', cls: 'br' },
];

export default function Letter() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const paper = useRef<HTMLDivElement>(null);
  const heart = useRef<HTMLButtonElement>(null);
  const [nonces, setNonces] = useState<Record<string, number>>({});
  const vars = { name: personalization.recipientName, sender: personalization.senderName };

  const onMove = (e: React.PointerEvent) => {
    const el = paper.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const n = apologyLetter.paragraphs.length;

  return (
    <section className="chapter letter" id="letter" aria-labelledby="letter-title">
      <div className={`letter__wrap ${inView ? 'is-open' : ''}`} ref={ref}>
        {DECOR.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`letter__decor letter__decor--${d.cls}`}
            aria-label="A little sticker"
            onClick={(e) => {
              setNonces((s) => ({ ...s, [d.id]: (s[d.id] ?? 0) + 1 }));
              burstFrom(e.currentTarget, { count: 8, spread: 60 });
              sfx('pop');
            }}
          >
            <Sticker id={d.id} size="100%" nonce={nonces[d.id]} />
          </button>
        ))}

        <article className="letter__paper" ref={paper} onPointerMove={onMove}>
          <span className="letter__crease letter__crease--1" aria-hidden="true" />
          <span className="letter__crease letter__crease--2" aria-hidden="true" />
          <span className="letter__glow" aria-hidden="true" />

          <button
            type="button"
            className="letter__heart"
            ref={heart}
            aria-label="A little heart — tap it"
            onClick={() => {
              burstFrom(heart.current, { shapes: ['heart'], count: 14, spread: 90 });
              sfx('soft');
              toast(apologyLetter.heartLine, { icon: 'heart', duration: 6000 });
            }}
          >
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z" />
            </svg>
          </button>

          <header className="letter__head">
            <span className="eyebrow">Chapter One</span>
            <h2 id="letter-title">{apologyLetter.title}</h2>
          </header>

          <div className="letter__body">
            <p className="letter__line letter__greet" style={{ ['--i' as string]: 0 }}>
              {fill(apologyLetter.greeting, vars)}
            </p>
            {apologyLetter.paragraphs.map((p, i) => (
              <p key={i} className={`letter__line ${p.trim() === "I'm sorry." ? 'letter__sorry' : ''}`} style={{ ['--i' as string]: i + 1 }}>
                {fill(p, vars)}
              </p>
            ))}
            <p className="letter__line letter__sign" style={{ ['--i' as string]: n + 1 }}>
              {apologyLetter.signOff}
              <br />
              <span>{personalization.senderName}</span>
            </p>
          </div>
        </article>

        <button type="button" className="btn letter__more" onClick={() => scrollToId('celebrate')} style={{ ['--i' as string]: n + 2 }}>
          {apologyLetter.button} <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
