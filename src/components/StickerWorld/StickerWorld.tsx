import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, BookHeart, RotateCcw } from 'lucide-react';
import Sticker from './Sticker';
import { stickers, unlockRules, type StickerDef } from '../../data/stickers';
import { burst, burstFrom, pick, toast } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import { storage } from '../../lib/store';
import './StickerWorld.css';

type Pos = { x: number; y: number };

/** Home positions (% of the playground). Hidden ones appear where they're earned. */
const HOME: Record<string, Pos> = {
  cloud: { x: 10, y: 12 },
  whale: { x: 30, y: 8 },
  heart: { x: 52, y: 13 },
  cat: { x: 73, y: 9 },
  shy: { x: 90, y: 16 },
  shootingStar: { x: 16, y: 38 },
  bear: { x: 38, y: 34 },
  flower: { x: 62, y: 38 },
  sun: { x: 84, y: 40 },
  moon: { x: 8, y: 63 },
  envelope: { x: 28, y: 60 },
  ghost: { x: 50, y: 62 },
  planet: { x: 72, y: 64 },
  duck: { x: 91, y: 66 },
  balloon: { x: 50, y: 80 },
  hugBear: { x: 73, y: 22 },
  smileSparkle: { x: 40, y: 48 },
  crystalHeart: { x: 88, y: 28 },
  bouquet: { x: 62, y: 52 },
};

const KEY = 'sky.stickers.v1';
type Saved = { collected: string[]; unlocked: string[] };

export default function StickerWorld() {
  const saved = storage.get<Saved>(KEY, { collected: [], unlocked: [] });
  const [pos, setPos] = useState<Record<string, Pos>>(() => ({ ...HOME }));
  const [collected, setCollected] = useState<Set<string>>(() => new Set(saved.collected));
  const [unlocked, setUnlocked] = useState<Set<string>>(() => new Set(saved.unlocked));
  const [reacting, setReacting] = useState<Record<string, number>>({});
  const [bubble, setBubble] = useState<{ id: string; text: string; k: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<'send' | 'book' | null>(null);
  const [flying, setFlying] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [panelMsg, setPanelMsg] = useState<string>('Tap a sticker in your book to read it.');

  const fieldRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const taps = useRef<Record<string, number>>({});
  const sends = useRef(0);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean; el: HTMLElement } | null>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    storage.set(KEY, { collected: [...collected], unlocked: [...unlocked] });
  }, [collected, unlocked]);

  const visible = stickers.filter((s) => !s.hidden || unlocked.has(s.id));

  const react = (id: string) => setReacting((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));

  const unlock = useCallback(
    (id: string) => {
      if (unlocked.has(id)) return;
      const def = stickers.find((s) => s.id === id)!;
      setUnlocked((u) => new Set(u).add(id));
      setCollected((c) => new Set(c).add(id));
      setFresh(id);
      later(() => setFresh(null), 1600);
      sfx('success');
      const field = fieldRef.current?.getBoundingClientRect();
      if (field) {
        const p = HOME[id];
        burst(field.left + (field.width * p.x) / 100, field.top + (field.height * p.y) / 100, { count: 30, spread: 180 });
      }
      toast(def.message ?? '', { title: `Hidden sticker found: ${def.name}`, icon: 'sparkle', duration: 5200 });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unlocked],
  );

  const onTap = (def: StickerDef, el: HTMLElement) => {
    react(def.id);
    sfx(def.react === 'bounce' ? 'bloop' : 'pop');
    burstFrom(el, { count: 10, spread: 70, size: [8, 16], shapes: ['sparkle', 'heart'] });
    const n = (taps.current[def.id] = (taps.current[def.id] ?? 0) + 1);
    let line = pick(def.lines);
    if (def.id === 'cat') line = n >= unlockRules.catTaps ? 'Okay, okay, I’m awake! I brought a friend…' : def.lines[Math.min(n - 1, def.lines.length - 1)];
    if (def.id === 'flower') line = n >= unlockRules.flowerTaps ? 'Fully bloomed! Here — these are for you.' : def.lines[Math.min(n - 1, def.lines.length - 1)];
    if (def.id === 'shy') line = n >= unlockRules.shyTaps ? 'You really think so? Then… this is for you.' : def.lines[Math.min(n - 1, def.lines.length - 1)];
    setBubble({ id: def.id, text: line, k: Date.now() });
    if (def.id === 'cat' && n === unlockRules.catTaps) later(() => unlock('hugBear'), 500);
    if (def.id === 'shy' && n === unlockRules.shyTaps) later(() => unlock('crystalHeart'), 500);
    if (def.id === 'flower' && n === unlockRules.flowerTaps) later(() => unlock('bouquet'), 500);
    if (def.hidden && def.message) setPanelMsg(def.message);
  };

  useEffect(() => {
    if (!bubble) return;
    const t = window.setTimeout(() => setBubble(null), 2200);
    return () => clearTimeout(t);
  }, [bubble]);

  const zoneAt = (x: number, y: number): 'send' | 'book' | null => {
    const hit = (el: HTMLElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 10;
    };
    if (hit(sendRef.current)) return 'send';
    if (hit(bookRef.current)) return 'book';
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (flying === id) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = { id, sx: e.clientX, sy: e.clientY, ox: pos[id].x, oy: pos[id].y, moved: false, el };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const field = fieldRef.current;
    if (!d || !field) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(d.id);
      sfx('soft');
    }
    const r = field.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, d.ox + (dx / r.width) * 100));
    const y = Math.max(2, Math.min(98, d.oy + (dy / r.height) * 100));
    setPos((p) => ({ ...p, [d.id]: { x, y } }));
    setOverZone(zoneAt(e.clientX, e.clientY));
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>, def: StickerDef) => {
    const d = drag.current;
    drag.current = null;
    setDragging(null);
    setOverZone(null);
    if (!d) return;
    if (!d.moved) {
      onTap(def, d.el);
      return;
    }
    const zone = zoneAt(e.clientX, e.clientY);
    if (zone === 'send') {
      setFlying(def.id);
      sfx('whoosh');
      burstFrom(sendRef.current, { shapes: ['heart', 'sparkle'], count: 18, spread: 120 });
      toast(`${def.name} is floating up to you as a little reaction.`, { title: 'Sticker sent ✦', icon: 'heart', duration: 2600 });
      later(() => {
        setFlying(null);
        setPos((p) => ({ ...p, [def.id]: HOME[def.id] }));
      }, 1300);
      sends.current += 1;
      if (sends.current === unlockRules.sendsNeeded) later(() => unlock('smileSparkle'), 1400);
    } else if (zone === 'book') {
      const already = collected.has(def.id);
      setCollected((c) => new Set(c).add(def.id));
      sfx(already ? 'soft' : 'sparkle');
      burstFrom(bookRef.current, { shapes: ['sparkle', 'star'], count: 14, spread: 90 });
      setPanelMsg(already ? `${def.name} is already in your book.` : `${def.name} was added to your sticker book!`);
      setPos((p) => ({ ...p, [def.id]: HOME[def.id] }));
      react(def.id);
    }
  };

  const reset = () => {
    setPos({ ...HOME });
    sfx('soft');
  };

  const total = stickers.length;
  const count = collected.size;

  return (
    <section className="chapter stickers" id="stickers" aria-labelledby="stickers-title">
      <div className="chapter__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Chapter Four</span>
          <h2 id="stickers-title">The Sticker World</h2>
          <p>Tap them, drag them, send them to the sky or keep them in your book. A few are hiding — see if you can find them.</p>
        </header>

        <div className="stickers__layout reveal">
          <div className={`stickers__field glass ${dragging ? 'is-dragging' : ''}`} ref={fieldRef}>
            <div className="stickers__grid-glow" aria-hidden="true" />
            {visible.map((def) => (
              <button
                key={def.id}
                type="button"
                className={`stickers__item ${dragging === def.id ? 'is-held' : ''} ${flying === def.id ? 'is-flying' : ''} ${fresh === def.id ? 'is-fresh' : ''}`}
                style={{ left: `${pos[def.id].x}%`, top: `${pos[def.id].y}%` }}
                onPointerDown={(e) => onPointerDown(e, def.id)}
                onPointerMove={onPointerMove}
                onPointerUp={(e) => endDrag(e, def)}
                onPointerCancel={() => {
                  drag.current = null;
                  setDragging(null);
                  setOverZone(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTap(def, e.currentTarget);
                  }
                }}
                aria-label={`${def.name} sticker. Tap to play, drag to move.`}
              >
                <Sticker id={def.id} size="100%" nonce={reacting[def.id] ?? 0} />
                {bubble?.id === def.id && (
                  <span className="stickers__bubble" key={bubble.k} role="status">
                    {bubble.text}
                  </span>
                )}
              </button>
            ))}

            <div className={`stickers__zone stickers__zone--send ${overZone === 'send' ? 'is-over' : ''}`} ref={sendRef}>
              <Send size={18} aria-hidden="true" />
              <span>Send as a reaction</span>
            </div>
            <div className={`stickers__zone stickers__zone--book ${overZone === 'book' ? 'is-over' : ''}`} ref={bookRef}>
              <BookHeart size={18} aria-hidden="true" />
              <span>Keep in my book</span>
            </div>
            <button type="button" className="icon-btn stickers__reset" onClick={reset} aria-label="Put all stickers back">
              <RotateCcw size={18} />
            </button>
          </div>

          <aside className="stickers__book glass" aria-label="Sticker collection">
            <div className="stickers__book-head">
              <h3>Sticker Book</h3>
              <span className="stickers__count">
                {count}/{total}
              </span>
            </div>
            <div className="stickers__progress" aria-hidden="true">
              <span style={{ width: `${(count / total) * 100}%` }} />
            </div>
            <ul className="stickers__slots">
              {stickers.map((def) => {
                const has = collected.has(def.id);
                const secret = def.hidden && !unlocked.has(def.id);
                return (
                  <li key={def.id}>
                    <button
                      type="button"
                      className={`stickers__slot ${has ? 'has' : ''} ${def.hidden ? 'is-special' : ''}`}
                      onClick={() => {
                        if (secret) setPanelMsg(`Hint: ${def.hint}`);
                        else if (!has) setPanelMsg(`Drag the ${def.name} into your book to collect it.`);
                        else setPanelMsg(def.message ?? `${def.name}: “${pick(def.lines)}”`);
                        sfx('soft');
                      }}
                      aria-label={secret ? 'Hidden sticker — tap for a hint' : `${def.name}${has ? ' (collected)' : ''}`}
                    >
                      {secret ? <span className="stickers__q">?</span> : <Sticker id={def.id} size="100%" still silhouette={!has} />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="stickers__msg" aria-live="polite">
              {panelMsg}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
