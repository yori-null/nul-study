import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ChevronDown, Heart, Star, Timer } from 'lucide-react';
import { miniGame, fill } from '../../data/messages';
import { burst, confetti, pick, svgShape, toast } from '../../lib/effects';
import { sfx, unlockAudio } from '../../lib/sound';
import { store, useStore, prefersReducedMotion } from '../../lib/store';
import { scrollToId } from '../Letter/Letter';
import './MiniGame.css';

const ROUND = 30; // seconds
type Kind = 'heart' | 'star' | 'crystal';
type Item = { id: number; kind: Kind; x: number; y: number; vy: number; phase: number; amp: number; size: number; el: HTMLDivElement };
const POINTS: Record<Kind, number> = { heart: 1, star: 2, crystal: 5 };

const crystalSvg = `<svg viewBox="0 0 32 32"><path d="M16 30 3 14l4-8h6l3 4 3-4h6l4 8Z" fill="#A8DCFF" stroke="#12518A" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 14 16 30 3 14Z" fill="#57B8F5" opacity=".8"/><path d="M23 14 16 30l13-16Z" fill="#E5F5FF"/></svg>`;

function moodFor(score: number, phase: string) {
  if (phase === 'ready') return { face: 'calm', line: 'Ready when you are!' };
  if (phase === 'done') return { face: 'joy', line: 'That was lovely!' };
  if (score >= 45) return { face: 'joy', line: 'Wow! You’re amazing!' };
  if (score >= 25) return { face: 'joy', line: 'So many hearts!' };
  if (score >= 10) return { face: 'happy', line: 'You’re doing great!' };
  return { face: 'calm', line: 'Catch them!' };
}

export default function MiniGame() {
  const area = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(ROUND);
  const [caught, setCaught] = useState({ heart: 0, star: 0, crystal: 0 });
  const [cheer, setCheer] = useState(0);
  const soundOn = useStore((s) => s.soundOn);
  const items = useRef<Item[]>([]);
  const scoreRef = useRef(0);
  const raf = useRef(0);

  // Game loop lives in an effect tied to `phase` so it always cleans up.
  useEffect(() => {
    if (phase !== 'playing') return;
    const el = area.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    let W = el.clientWidth;
    let H = el.clientHeight;
    let id = 0;
    let last = performance.now();
    const start = last;
    let nextSpawn = last;
    let lastSecond = ROUND;

    const spawn = (elapsed: number) => {
      const r = Math.random();
      const kind: Kind = r < 0.06 ? 'crystal' : r < 0.32 ? 'star' : 'heart';
      const size = (W < 500 ? 46 : 56) * (kind === 'crystal' ? 1.05 : 0.85 + Math.random() * 0.35);
      const node = document.createElement('div');
      node.className = `mg-item mg-item--${kind}`;
      node.dataset.id = String(++id);
      node.style.width = node.style.height = `${size}px`;
      node.innerHTML = kind === 'crystal' ? crystalSvg : svgShape(kind, kind === 'heart' ? pick(['#2589FF', '#57B8F5', '#1c6fe0']) : pick(['#54E4FF', '#A8DCFF']));
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `${kind}, ${POINTS[kind]} points`);
      el.appendChild(node);
      const difficulty = 1 + elapsed / 14; // gentle progression
      items.current.push({
        id,
        kind,
        x: size / 2 + Math.random() * (W - size),
        y: H + size,
        vy: (reduced ? 40 : 55 + Math.random() * 40) * difficulty * (kind === 'crystal' ? 1.35 : 1),
        phase: Math.random() * Math.PI * 2,
        amp: 10 + Math.random() * 26,
        size,
        el: node,
      });
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const elapsed = (t - start) / 1000;
      const left = Math.max(0, ROUND - elapsed);
      const sec = Math.ceil(left);
      if (sec !== lastSecond) {
        lastSecond = sec;
        setTime(sec);
      }
      if (left <= 0) {
        setPhase('done');
        return;
      }
      if (t >= nextSpawn) {
        spawn(elapsed);
        nextSpawn = t + Math.max(260, 820 - elapsed * 18) * (0.7 + Math.random() * 0.6);
      }
      for (let i = items.current.length - 1; i >= 0; i--) {
        const it = items.current[i];
        it.y -= it.vy * dt;
        it.phase += dt * 2;
        const x = it.x + Math.sin(it.phase) * it.amp;
        it.el.style.transform = `translate3d(${x - it.size / 2}px, ${it.y - it.size / 2}px, 0) rotate(${Math.sin(it.phase) * 12}deg)`;
        if (it.y < -it.size) {
          it.el.remove();
          items.current.splice(i, 1);
        }
      }
      raf.current = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest('.mg-item') as HTMLDivElement | null;
      if (!target) return;
      const idx = items.current.findIndex((i) => String(i.id) === target.dataset.id);
      if (idx < 0) return;
      const it = items.current[idx];
      items.current.splice(idx, 1);
      const pts = POINTS[it.kind];
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setCaught((c) => ({ ...c, [it.kind]: c[it.kind] + 1 }));
      setCheer((c) => c + 1);
      const r = target.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { shapes: it.kind === 'heart' ? ['heart', 'sparkle'] : ['star', 'sparkle'], count: it.kind === 'crystal' ? 24 : 9, spread: it.kind === 'crystal' ? 140 : 60, size: [8, 16], duration: 800 });
      sfx(it.kind === 'crystal' ? 'success' : it.kind === 'star' ? 'sparkle' : 'pop');
      // floating +points label
      const plus = document.createElement('span');
      plus.className = 'mg-plus';
      plus.textContent = `+${pts}`;
      plus.style.left = `${r.left - el.getBoundingClientRect().left + r.width / 2}px`;
      plus.style.top = `${r.top - el.getBoundingClientRect().top}px`;
      el.appendChild(plus);
      plus.addEventListener('animationend', () => plus.remove());
      target.classList.add('is-caught');
      target.addEventListener('animationend', () => target.remove(), { once: true });
      if (it.kind === 'crystal') toast(pick(miniGame.specials), { title: 'Special catch ✦', icon: 'star', duration: 2600 });
    };

    const onResize = () => {
      W = el.clientWidth;
      H = el.clientHeight;
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', onResize);
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onResize);
      items.current.forEach((i) => i.el.remove());
      items.current = [];
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') {
      confetti(window.innerWidth / 2, window.innerHeight / 2);
      sfx('success');
    }
  }, [phase]);

  const startGame = () => {
    unlockAudio();
    scoreRef.current = 0;
    setScore(0);
    setTime(ROUND);
    setCaught({ heart: 0, star: 0, crystal: 0 });
    setPhase('playing');
    sfx('chime');
  };

  const mood = moodFor(score, phase);

  return (
    <section className="chapter mg" id="game" aria-labelledby="mg-title">
      <div className="chapter__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Chapter Seven</span>
          <h2 id="mg-title">{miniGame.title}</h2>
          <p>{miniGame.subtitle}</p>
        </header>

        <div className="mg__box glass reveal">
          <div className="mg__hud">
            <div className="mg__stat" aria-live="polite">
              <Heart size={16} aria-hidden="true" /> <strong>{score}</strong> <span>points</span>
            </div>
            <div className="mg__stat">
              <Timer size={16} aria-hidden="true" /> <strong>{time}s</strong>
            </div>
            <div className="mg__time" aria-hidden="true">
              <span style={{ width: `${(time / ROUND) * 100}%` }} />
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Mute game sounds' : 'Turn game sounds on'}
              onClick={() => {
                unlockAudio();
                store.set({ soundOn: !soundOn });
              }}
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {phase === 'playing' && (
              <button type="button" className="icon-btn" aria-label="Restart game" onClick={() => setPhase('ready')}>
                <RotateCcw size={18} />
              </button>
            )}
          </div>

          <div className={`mg__area mg__area--${phase}`} ref={area}>
            <div className={`mg__buddy mg__buddy--${mood.face}`} key={cheer} aria-hidden="true">
              <svg viewBox="-60 -40 120 100">
                <path d="M-30 44c-14 0-22-9-22-19S-44 7-34 6c1-18 16-30 34-30s32 12 34 28c12 0 20 9 20 20s-9 20-22 20Z" fill="#F8FCFF" stroke="#12518A" strokeWidth="2.5" />
                {mood.face === 'calm' ? (
                  <g fill="#102C50">
                    <ellipse cx="-12" cy="10" rx="4" ry="5" />
                    <ellipse cx="12" cy="10" rx="4" ry="5" />
                  </g>
                ) : (
                  <g fill="none" stroke="#102C50" strokeWidth="3" strokeLinecap="round">
                    <path d="M-17 11q5-6 10 0M7 11q5-6 10 0" />
                  </g>
                )}
                <path d={mood.face === 'joy' ? 'M-9 18q9 12 18 0Z' : 'M-6 19q6 6 12 0'} fill={mood.face === 'joy' ? '#2589FF' : 'none'} stroke="#102C50" strokeWidth="2.6" strokeLinecap="round" />
                <ellipse cx="-24" cy="20" rx="6" ry="3.5" fill="#A8DCFF" />
                <ellipse cx="24" cy="20" rx="6" ry="3.5" fill="#A8DCFF" />
              </svg>
              <span className="mg__buddy-say">{mood.line}</span>
            </div>

            {phase === 'ready' && (
              <div className="mg__overlay">
                <div className="mg__legend">
                  <span>
                    <span className="mg__ico" dangerouslySetInnerHTML={{ __html: svgShape('heart', '#2589FF') }} /> 1
                  </span>
                  <span>
                    <span className="mg__ico" dangerouslySetInnerHTML={{ __html: svgShape('star', '#54E4FF') }} /> 2
                  </span>
                  <span>
                    <span className="mg__ico" dangerouslySetInnerHTML={{ __html: crystalSvg }} /> 5 + a secret
                  </span>
                </div>
                <button type="button" className="btn" onClick={startGame}>
                  <Play size={18} aria-hidden="true" /> Start ({ROUND}s)
                </button>
              </div>
            )}

            {phase === 'done' && (
              <div className="mg__overlay mg__overlay--done" role="status">
                <Star className="mg__done-star" size={40} aria-hidden="true" />
                <p className="mg__result">{fill(miniGame.endLine, { score })}</p>
                <p className="mg__breakdown">
                  {caught.heart} hearts · {caught.star} stars · {caught.crystal} crystal{caught.crystal === 1 ? '' : 's'}
                </p>
                <button type="button" className="btn" onClick={startGame}>
                  <RotateCcw size={18} aria-hidden="true" /> Play again
                </button>
              </div>
            )}
          </div>
        </div>

        <button type="button" className="next-link" onClick={() => scrollToId('gifts')}>
          Three little boxes <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
