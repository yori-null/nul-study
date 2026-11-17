import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Gift, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { intro } from '../../data/messages';
import { personalization } from '../../data/personalization';
import { store, useStore, prefersReducedMotion } from '../../lib/store';
import { burst } from '../../lib/effects';
import { sfx, unlockAudio } from '../../lib/sound';
import './Envelope.css';

/** The first screen: a floating blue envelope that opens into the experience. */
export default function Envelope({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const env = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const letter = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const soundOn = useStore((s) => s.soundOn);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => () => {
    tl.current?.kill();
  }, []);

  const finish = () => {
    store.set({ glow: 0 });
    onDone();
  };

  const open = () => {
    if (busy) return;
    setBusy(true);
    unlockAudio();
    sfx('chime');
    const reduced = prefersReducedMotion();
    if (reduced) {
      gsap.to(root.current, { opacity: 0, duration: 0.5, onComplete: finish });
      return;
    }
    const burstAround = () => {
      const r = env.current?.getBoundingClientRect();
      if (!r) return;
      burst(r.left + r.width / 2, r.top + r.height * 0.2, { shapes: ['heart', 'cloud', 'star', 'sparkle'], count: 34, spread: Math.min(360, window.innerWidth * 0.5), size: [12, 28], duration: 1800, gravity: -40 });
    };
    const t = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    tl.current = t;
    t.set('.intro__copy, .intro__actions', { animation: 'none', opacity: 1 })
      .to('.intro__copy, .intro__actions', { opacity: 0, y: 16, duration: 0.5, stagger: 0.05 })
      .add(() => store.set({ glow: 0.55 }), 0)
      .to(env.current, { y: -40, scale: 1.04, rotateX: 8, duration: 0.9 }, 0.1)
      .to('.envelope__seal', { scale: 0, opacity: 0, duration: 0.35, ease: 'back.in(2)' }, 0.55)
      .add(() => sfx('paper'), 0.7)
      .set(flap.current, { transformPerspective: 900 }, 0)
      .to(flap.current, { rotateX: 180, duration: 0.85, ease: 'power2.inOut' }, 0.7)
      .set(flap.current, { zIndex: 1 }, 1.12)
      .to(letter.current, { y: '-62%', duration: 0.9, ease: 'power2.out' }, 1.25)
      .add(burstAround, 1.5)
      .add(() => sfx('sparkle'), 1.5)
      .to(env.current, { y: 40, duration: 1, ease: 'power2.inOut' }, 2.1)
      .to(letter.current, { y: '-80%', scale: 1.25, duration: 1, ease: 'power2.inOut' }, 2.1)
      .add(() => store.set({ glow: 0.95 }), 2.4)
      .to(flash.current, { opacity: 1, duration: 0.8, ease: 'power2.in' }, 2.6)
      .add(() => sfx('whoosh'), 2.6)
      .to(root.current, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 3.5)
      .add(finish);
  };

  return (
    <div className="intro" ref={root} role="dialog" aria-modal="true" aria-label="Your gift">
      <div className="intro__stage">
        <p className="intro__copy intro__above">{intro.above}</p>

        <div className="envelope-wrap">
          <div className="envelope-shadow" aria-hidden="true" />
          <div
            className={`envelope ${busy ? 'is-opening' : ''}`}
            ref={env}
            onClick={open}
            role="button"
            tabIndex={0}
            aria-label="Open the envelope"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
          >
            <div className="envelope__back" />
            <div className="envelope__letter" ref={letter}>
              <span className="envelope__letter-to">for</span>
              <span className="envelope__letter-name">{personalization.recipientName}</span>
              <span className="envelope__letter-line" />
              <span className="envelope__letter-line short" />
            </div>
            <div className="envelope__front" />
            <div className="envelope__flap" ref={flap}>
              <div className="envelope__flap-face" />
            </div>
            <div className="envelope__seal" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <path d="M16 27S4 19.7 4 11.9C4 8 7 5 10.6 5c2.3 0 4.2 1.2 5.4 3 1.2-1.8 3.1-3 5.4-3C25 5 28 8 28 11.9 28 19.7 16 27 16 27Z" />
              </svg>
            </div>
            <span className="envelope__shine" />
          </div>
        </div>

        <p className="intro__copy intro__below">{intro.below}</p>

        <div className="intro__actions">
          <button type="button" className="btn" onClick={open} disabled={busy}>
            <Gift size={18} aria-hidden="true" /> {intro.button}
          </button>
          <div className="intro__minor">
            <button
              type="button"
              className="intro__chip"
              aria-pressed={soundOn}
              onClick={() => {
                unlockAudio();
                store.set({ soundOn: !soundOn });
                if (!soundOn) sfx('soft', true);
              }}
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {soundOn ? 'Sound on' : 'Sound off'}
            </button>
            <button type="button" className="intro__chip" onClick={finish}>
              <SkipForward size={14} /> Skip intro
            </button>
          </div>
        </div>
      </div>
      <div className="intro__flash" ref={flash} aria-hidden="true" />
    </div>
  );
}
