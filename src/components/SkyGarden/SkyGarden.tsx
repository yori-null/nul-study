import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, Sprout } from 'lucide-react';
import { skyGarden, hiddenMessages } from '../../data/messages';
import { personalization } from '../../data/personalization';
import { treeMemories } from '../../data/memories';
import { burst, burstFrom, confetti, pick } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import { scrollToId } from '../Letter/Letter';
import './SkyGarden.css';

const O = '#12518A';
const FLOWERS = [
  { x: 300, y: 392, c: '#57B8F5' },
  { x: 352, y: 404, c: '#A8DCFF' },
  { x: 712, y: 398, c: '#2589FF' },
  { x: 160, y: 304, c: '#54E4FF' },
  { x: 858, y: 334, c: '#DCDFFF' },
];
const CLOUDS = [
  { x: 120, y: 92, s: 1 },
  { x: 760, y: 70, s: 1.2 },
  { x: 470, y: 46, s: 0.8 },
];
const PET_LINES = [
  `Hi! I’m ${personalization.companionName}.`,
  'I look after this garden.',
  'Have you tried tapping the flowers?',
  'The tree remembers things…',
  'That heart up there? It’s glowing for you.',
  '*happy cloud noises*',
];

type PetMode = 'idle' | 'wave' | 'celebrate';

export default function SkyGarden() {
  const frame = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // on narrow screens the garden is wider than the frame: start in the middle
  useEffect(() => {
    const s = scroller.current;
    if (s && s.scrollWidth > s.clientWidth) s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
  }, []);
  const [bloom, setBloom] = useState<boolean[]>(() => FLOWERS.map(() => false));
  const [pet, setPet] = useState<PetMode>('idle');
  const [say, setSay] = useState<string | null>(null);
  const [card, setCard] = useState<{ title: string; text: string } | null>(null);
  const memIndex = useRef(0);
  const petIndex = useRef(0);
  const celebrated = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // gentle parallax with the pointer
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  const speak = (text: string, ms = 2600) => {
    setSay(text);
    later(() => setSay((s) => (s === text ? null : s)), ms);
  };

  const tapFlower = (i: number, el: Element) => {
    if (bloom[i]) {
      burstFrom(el, { shapes: ['flower', 'sparkle'], count: 6, spread: 50 });
      sfx('pop');
      return;
    }
    const next = bloom.map((b, k) => (k === i ? true : b));
    setBloom(next);
    sfx('sparkle');
    burstFrom(el, { shapes: ['flower', 'sparkle'], count: 14, spread: 80, colors: ['#57B8F5', '#A8DCFF', '#54E4FF', '#F8FCFF'] });
    const left = next.filter((b) => !b).length;
    if (left === 0 && !celebrated.current) {
      celebrated.current = true;
      later(() => {
        setPet('celebrate');
        speak(skyGarden.allBloomed, 4200);
        confetti(window.innerWidth / 2, window.innerHeight * 0.45);
        sfx('success');
        later(() => setPet('idle'), 2600);
      }, 500);
    } else if (left > 0) {
      speak(left === 1 ? 'Just one more flower!' : `${left} flowers left to wake up.`, 1800);
    }
  };

  const tapPet = (el: Element) => {
    setPet('wave');
    sfx('bloop');
    burstFrom(el, { shapes: ['heart'], count: 8, spread: 60 });
    speak(PET_LINES[petIndex.current++ % PET_LINES.length]);
    later(() => setPet((p) => (p === 'wave' ? 'idle' : p)), 1500);
  };

  const tapCloud = (el: Element) => {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.7, { shapes: ['star', 'sparkle'], count: 14, spread: 90, gravity: 140, colors: ['#F8FCFF', '#54E4FF', '#A8DCFF'] });
    sfx('sparkle');
    if (Math.random() < 0.35) speak(pick(hiddenMessages), 3000);
  };

  const tapTree = (el: Element) => {
    burstFrom(el, { shapes: ['sparkle', 'heart'], count: 16, spread: 120 });
    sfx('chime');
    const text = treeMemories[memIndex.current++ % treeMemories.length];
    setCard({ title: 'A memory from the tree', text });
  };

  const tapHeart = (el: Element) => {
    burstFrom(el, { shapes: ['heart'], count: 20, spread: 120 });
    sfx('soft');
    setCard({ title: 'A hidden message', text: skyGarden.heartMessage });
  };

  const keyAct = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const bloomedCount = bloom.filter(Boolean).length;

  return (
    <section className="chapter garden" id="garden" aria-labelledby="garden-title">
      <div className="chapter__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Chapter Five</span>
          <h2 id="garden-title">{skyGarden.title}</h2>
          <p>{skyGarden.subtitle}</p>
        </header>

        <div className="garden__frame reveal" ref={frame} onPointerMove={onMove}>
          <div className="garden__scroll" ref={scroller}>
          <svg className="garden__svg" viewBox="0 0 1000 620" role="img" aria-label="A floating sky garden with islands, a magic tree, flowers and a little cloud companion">
            <defs>
              <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a7fd4" />
                <stop offset=".55" stopColor="#57B8F5" />
                <stop offset="1" stopColor="#E5F5FF" />
              </linearGradient>
              <linearGradient id="g-rock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a6db0" />
                <stop offset="1" stopColor="#102C50" />
              </linearGradient>
              <linearGradient id="g-grass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#B9EBDF" />
                <stop offset="1" stopColor="#7CC6B8" />
              </linearGradient>
              <radialGradient id="g-glow">
                <stop offset="0" stopColor="#F8FCFF" stopOpacity=".9" />
                <stop offset=".4" stopColor="#54E4FF" stopOpacity=".5" />
                <stop offset="1" stopColor="#54E4FF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="g-fall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#A8DCFF" stopOpacity=".9" />
                <stop offset="1" stopColor="#A8DCFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            <rect width="1000" height="620" fill="url(#g-sky)" />
            <ellipse cx="500" cy="640" rx="620" ry="120" fill="#F8FCFF" opacity=".55" />

            {/* far layer */}
            <g className="garden__layer garden__layer--far">
              {Array.from({ length: 26 }, (_, i) => (
                <circle key={i} className="garden__star" cx={(i * 137) % 1000} cy={(i * 71) % 260} r={i % 5 === 0 ? 2.2 : 1.2} fill="#F8FCFF" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />
              ))}
              <g opacity=".55">
                <ellipse cx="90" cy="470" rx="46" ry="8" fill="#B9EBDF" />
                <path d="M44 470q20 40 46 46 26-6 46-46Z" fill="#2a6db0" opacity=".7" />
                <ellipse cx="930" cy="200" rx="38" ry="7" fill="#B9EBDF" />
                <path d="M892 200q16 30 38 36 22-6 38-36Z" fill="#2a6db0" opacity=".7" />
              </g>
            </g>

            {/* clouds (tap: tiny stars) */}
            <g className="garden__layer garden__layer--mid">
              {CLOUDS.map((c, i) => (
                <g
                  key={i}
                  className="garden__cloud is-interactive"
                  style={{ animationDelay: `${-i * 3}s` }}
                  transform={`translate(${c.x} ${c.y}) scale(${c.s})`}
                  role="button"
                  tabIndex={0}
                  aria-label="A soft cloud — tap to release stars"
                  onClick={(e) => tapCloud(e.currentTarget)}
                  onKeyDown={keyAct(() => tapCloud(document.activeElement as Element))}
                >
                  <path d="M20 60C8 60 0 52 0 43s7-16 17-16c3-15 15-25 31-25 15 0 27 10 30 23 3-1 5-1 8-1 12 0 22 9 22 19s-10 17-22 17Z" fill="#F8FCFF" />
                  <path d="M10 54c18 6 70 6 90 0" stroke="#A8DCFF" strokeWidth="5" strokeLinecap="round" opacity=".7" />
                </g>
              ))}
            </g>

            {/* side islands */}
            <g className="garden__layer garden__layer--near">
              <g className="garden__island garden__island--l">
                <path d="M80 310q30 70 80 84 50-14 80-84Z" fill="url(#g-rock)" />
                <ellipse cx="160" cy="310" rx="82" ry="15" fill="url(#g-grass)" />
              </g>
              <g className="garden__island garden__island--r">
                <path d="M770 340q26 60 70 72 44-12 72-72Z" fill="url(#g-rock)" />
                <ellipse cx="841" cy="340" rx="72" ry="13" fill="url(#g-grass)" />
              </g>

              {/* main island */}
              <g className="garden__island garden__island--main">
                <rect x="276" y="420" width="16" height="150" fill="url(#g-fall)" className="garden__fall" />
                <path d="M250 400Q290 520 410 566q90 34 180 0 120-46 160-166Z" fill="url(#g-rock)" />
                <path d="M300 440q40 60 110 90M700 440q-40 60-110 90" stroke="#57B8F5" strokeWidth="3" opacity=".35" fill="none" />
                <ellipse cx="500" cy="400" rx="252" ry="40" fill="url(#g-grass)" />
                <ellipse cx="460" cy="392" rx="160" ry="16" fill="#E5F5FF" opacity=".35" />
              </g>

              {/* magic tree (tap: a memory) */}
              <g
                className="garden__tree is-interactive"
                role="button"
                tabIndex={0}
                aria-label="The magic tree — tap for a memory"
                onClick={(e) => tapTree(e.currentTarget)}
                onKeyDown={keyAct(() => tapTree(document.activeElement as Element))}
              >
                <path d="M602 398c-6-40 4-70-2-110M600 330c-20-10-30-26-34-40M603 312c18-8 30-22 34-38" stroke="#12518A" strokeWidth="12" strokeLinecap="round" fill="none" />
                <g className="garden__canopy">
                  <circle cx="600" cy="236" r="70" fill="#57B8F5" />
                  <circle cx="548" cy="262" r="46" fill="#2589FF" />
                  <circle cx="656" cy="258" r="48" fill="#2589FF" />
                  <circle cx="600" cy="200" r="50" fill="#A8DCFF" />
                  <circle cx="574" cy="212" r="18" fill="#E5F5FF" opacity=".55" />
                  {[
                    [560, 240],
                    [640, 230],
                    [600, 280],
                    [620, 190],
                    [540, 280],
                    [668, 276],
                  ].map(([cx, cy], i) => (
                    <g key={i} className="garden__fruit" style={{ animationDelay: `${i * 0.35}s` }}>
                      <circle cx={cx} cy={cy} r="16" fill="url(#g-glow)" />
                      <circle cx={cx} cy={cy} r="5" fill="#F8FCFF" />
                    </g>
                  ))}
                </g>
              </g>

              {/* glowing heart (tap: hidden message) */}
              <g
                className="garden__heart is-interactive"
                role="button"
                tabIndex={0}
                aria-label="A glowing heart — tap it"
                onClick={(e) => tapHeart(e.currentTarget)}
                onKeyDown={keyAct(() => tapHeart(document.activeElement as Element))}
              >
                <circle cx="430" cy="226" r="46" fill="url(#g-glow)" />
                <g transform="translate(408 204) scale(1.4)">
                  <path d="M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z" fill="#2589FF" stroke="#F8FCFF" strokeWidth="1.4" />
                </g>
              </g>

              {/* flowers (tap: bloom) */}
              {FLOWERS.map((f, i) => (
                <g
                  key={i}
                  className={`garden__flower is-interactive ${bloom[i] ? 'is-bloom' : ''}`}
                  transform={`translate(${f.x} ${f.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={bloom[i] ? 'A blooming flower' : 'A flower bud — tap to make it bloom'}
                  aria-pressed={bloom[i]}
                  onClick={(e) => tapFlower(i, e.currentTarget)}
                  onKeyDown={keyAct(() => tapFlower(i, document.activeElement as Element))}
                >
                  <rect x="-22" y="-62" width="44" height="66" fill="transparent" />
                  <path d="M0 0V-30" stroke="#3B7F9E" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0-12c-10 0-13-8-13-8 9-1 13 3 13 8Z" fill="#7CC6B8" />
                  <circle className="garden__flower-glow" cx="0" cy="-38" r="24" fill="url(#g-glow)" />
                  <g className="garden__petals" transform="translate(0 -38)">
                    {[0, 72, 144, 216, 288].map((r) => (
                      <ellipse key={r} cx="0" cy="-9" rx="6.5" ry="10" transform={`rotate(${r})`} fill={f.c} stroke={O} strokeWidth="1.2" />
                    ))}
                    <circle r="5" fill="#F8FCFF" stroke={O} strokeWidth="1.2" />
                  </g>
                  <ellipse className="garden__bud" cx="0" cy="-36" rx="5.5" ry="8" fill={f.c} stroke={O} strokeWidth="1.2" />
                </g>
              ))}

              {/* butterflies */}
              {[0, 1, 2].map((i) => (
                <g key={i} className={`garden__fly garden__fly--${i}`}>
                  <g className="garden__wings">
                    <path d="M0 0c-10-12-18-6-14 2 2 4 8 4 14-2Z" fill={i === 1 ? '#54E4FF' : '#A8DCFF'} stroke={O} strokeWidth="1" />
                    <path d="M0 0c10-12 18-6 14 2-2 4-8 4-14-2Z" fill={i === 1 ? '#54E4FF' : '#A8DCFF'} stroke={O} strokeWidth="1" />
                  </g>
                  <path d="M0-4v8" stroke={O} strokeWidth="2" strokeLinecap="round" />
                </g>
              ))}

              {/* Nimbus — the companion */}
              <g
                className={`garden__pet is-interactive pet--${pet}`}
                role="button"
                tabIndex={0}
                aria-label={`${personalization.companionName}, the cloud companion — tap to say hi`}
                onClick={(e) => tapPet(e.currentTarget)}
                onKeyDown={keyAct(() => tapPet(document.activeElement as Element))}
              >
                <g transform="translate(400 330)">
                  <ellipse className="garden__pet-shadow" cx="0" cy="58" rx="40" ry="7" fill="#12518A" opacity=".18" />
                  <g className="garden__pet-body">
                    <g className="garden__pet-arm garden__pet-arm--l">
                      <ellipse cx="-44" cy="20" rx="9" ry="13" fill="#F8FCFF" stroke={O} strokeWidth="2.5" />
                    </g>
                    <g className="garden__pet-arm garden__pet-arm--r">
                      <ellipse cx="44" cy="20" rx="9" ry="13" fill="#F8FCFF" stroke={O} strokeWidth="2.5" />
                    </g>
                    <path d="M-30 44c-14 0-22-9-22-19S-44 7-34 6c1-18 16-30 34-30s32 12 34 28c12 0 20 9 20 20s-9 20-22 20Z" fill="#F8FCFF" stroke={O} strokeWidth="2.5" />
                    <path d="M-38 36c22 6 58 6 76 0" stroke="#A8DCFF" strokeWidth="5" strokeLinecap="round" opacity=".7" fill="none" />
                    <g className="garden__pet-eyes">
                      <ellipse cx="-12" cy="10" rx="4.5" ry="5.5" fill="#102C50" />
                      <ellipse cx="12" cy="10" rx="4.5" ry="5.5" fill="#102C50" />
                      <circle cx="-10.5" cy="8" r="1.6" fill="#fff" />
                      <circle cx="13.5" cy="8" r="1.6" fill="#fff" />
                    </g>
                    <path className="garden__pet-mouth" d="M-6 20q6 6 12 0" stroke="#102C50" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                    <ellipse cx="-24" cy="20" rx="6" ry="3.5" fill="#A8DCFF" />
                    <ellipse cx="24" cy="20" rx="6" ry="3.5" fill="#A8DCFF" />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          </div>

          {say && (
            <div className="garden__say" role="status" key={say}>
              {say}
            </div>
          )}

          <div className="garden__hud">
            <Sprout size={16} aria-hidden="true" />
            <span>
              {bloomedCount}/{FLOWERS.length} flowers blooming
            </span>
          </div>

          {card && (
            <div className="garden__card" role="dialog" aria-label={card.title}>
              <button type="button" className="garden__card-x" onClick={() => setCard(null)} aria-label="Close">
                <X size={18} />
              </button>
              <span className="eyebrow">{card.title}</span>
              <p>{card.text}</p>
            </div>
          )}
        </div>

        <p className="garden__tips reveal">
          <span className="garden__swipe">Swipe sideways to explore. </span>Tap the flowers, the clouds, the tree, the glowing heart — and say hi to {personalization.companionName}.
        </p>

        <button type="button" className="next-link" onClick={() => scrollToId('memories')}>
          Little moments <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
