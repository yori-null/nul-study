import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Gift, Camera, ArrowUp, X } from 'lucide-react';
import HeartConstellation from '../../scenes/HeartConstellation/HeartConstellation';
import { finalSurprise } from '../../data/messages';
import { personalization } from '../../data/personalization';
import { useInView } from '../../hooks/useReveal';
import { rain, burstFrom } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import { store, useStore, prefersReducedMotion } from '../../lib/store';
import './FinalSurprise.css';

/** Many tiny stars from a single element (box-shadows are cheap to paint). */
function useStarField(n: number) {
  return useMemo(() => {
    const s: string[] = [];
    for (let i = 0; i < n; i++) {
      const x = Math.round(Math.random() * 2000);
      const y = Math.round(Math.random() * 1400);
      const a = (0.3 + Math.random() * 0.7).toFixed(2);
      s.push(`${x}px ${y}px 0 ${Math.random() < 0.1 ? 1 : 0}px rgba(${Math.random() < 0.3 ? '168,220,255' : '248,252,255'},${a})`);
    }
    return s.join(',');
  }, [n]);
}

export default function FinalSurprise() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [formed, setFormed] = useState(false);
  const [box, setBox] = useState<'closed' | 'showing' | 'opened'>('closed');
  const clean = useStore((s) => s.cleanMode);
  const boxRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const field = useStarField(typeof window !== 'undefined' && window.innerWidth < 700 ? 260 : 520);
  const field2 = useStarField(typeof window !== 'undefined' && window.innerWidth < 700 ? 120 : 260);

  useEffect(() => () => {
    tl.current?.kill();
  }, []);

  const onFormed = useCallback(() => {
    setFormed(true);
    window.setTimeout(() => document.getElementById('final-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 700);
  }, []);

  const openBox = () => {
    setBox('showing');
    sfx('chime');
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => {
      const el = boxRef.current;
      if (!el) return;
      const reduced = prefersReducedMotion();
      const t = gsap.timeline();
      tl.current = t;
      const q = gsap.utils.selector(el);
      if (reduced) {
        t.set(q('.fbox'), { opacity: 1 }).add(reveal);
        return;
      }
      t.fromTo(q('.fbox'), { y: 200, scale: 0.4, opacity: 0, rotate: -10 }, { y: 0, scale: 1, opacity: 1, rotate: 0, duration: 1, ease: 'back.out(1.6)' })
        .to(q('.fbox'), { rotate: 6, duration: 0.09, repeat: 7, yoyo: true, ease: 'sine.inOut' }, '+=0.2')
        .add(() => sfx('whoosh'))
        .to(q('.fbox__lid'), { y: -180, x: 60, rotate: 40, opacity: 0, duration: 0.9, ease: 'power3.out' })
        .to(q('.fbox__light'), { opacity: 1, scale: 1.4, duration: 0.6 }, '<')
        .add(reveal, '<0.1');
    });
  };

  const reveal = () => {
    setBox('opened');
    sfx('success');
    rain({ shapes: ['star', 'heart', 'flower', 'sparkle'], count: 90, duration: 5200 });
    window.setTimeout(() => rain({ shapes: ['star', 'heart', 'flower'], count: 50, duration: 4800 }), 1200);
  };

  const closeBox = () => {
    setBox('closed');
    document.body.classList.remove('is-locked');
  };

  const enterCalm = () => {
    closeBox();
    store.set({ cleanMode: true });
    window.setTimeout(() => document.getElementById('final-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('clean-mode', clean);
  }, [clean]);

  const { recipientName, senderName } = personalization;

  return (
    <section className="chapter finale on-dark" id="finale" aria-labelledby="finale-title">
      <div className={`finale__stars ${inView ? 'is-in' : ''}`} aria-hidden="true">
        <span style={{ boxShadow: field }} />
        <span className="finale__stars-2" style={{ boxShadow: field2 }} />
      </div>

      <div className="finale__inner" ref={ref}>
        <span className="eyebrow chrome">Chapter Ten</span>
        <HeartConstellation active={inView} onComplete={onFormed} />

        <div className={`finale__message ${formed ? 'is-in' : ''}`} id="final-message">
          <h2 id="finale-title" className="finale__omt">
            {finalSurprise.oneMoreThing}
          </h2>
          <div className="finale__card" id="final-card">
            {finalSurprise.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? 'finale__lead' : i >= finalSurprise.paragraphs.length - 2 ? 'finale__em' : ''} style={{ ['--i' as string]: i }}>
                {p}
              </p>
            ))}
            <p className="finale__closing" style={{ ['--i' as string]: finalSurprise.paragraphs.length }}>
              {finalSurprise.closing}
            </p>
            <p className="finale__sender" style={{ ['--i' as string]: finalSurprise.paragraphs.length + 1 }}>
              {senderName}
            </p>
            {clean && <p className="finale__for">for {recipientName} · {personalization.nicknames.join(' · ')}</p>}
          </div>

          {!clean && (
            <div className="finale__actions" style={{ ['--i' as string]: finalSurprise.paragraphs.length + 2 }}>
              <button type="button" className="btn" onClick={openBox}>
                <Gift size={18} aria-hidden="true" /> {finalSurprise.button}
              </button>
              <button type="button" className="btn btn--ghost btn--small" onClick={enterCalm}>
                <Camera size={15} aria-hidden="true" /> Calm view
              </button>
            </div>
          )}
        </div>

        {!formed && (
          <button type="button" className="finale__skip chrome" onClick={onFormed}>
            Skip to the message
          </button>
        )}

        <button type="button" className="next-link chrome finale__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUp size={18} aria-hidden="true" /> Back to the beginning
        </button>
      </div>

      {box !== 'closed' && (
        <div className="fbox-layer" ref={boxRef} role="dialog" aria-modal="true" aria-label="One last surprise">
          <div className="fbox" onClick={(e) => burstFrom(e.currentTarget, { count: 12 })}>
            <div className="fbox__light" />
            <div className="fbox__lid">
              <span className="fbox__bow">
                <i />
                <i />
              </span>
            </div>
            <div className="fbox__body" />
          </div>
          {box === 'opened' && (
            <div className="fbox__note">
              <span className="eyebrow">A final hidden message</span>
              <p>{finalSurprise.hiddenMessage}</p>
              <span className="fbox__sign">— {senderName}</span>
              <div className="fbox__actions">
                <button type="button" className="btn btn--small" onClick={enterCalm}>
                  <Camera size={14} aria-hidden="true" /> Calm view
                </button>
                <button type="button" className="btn btn--ghost btn--small" onClick={closeBox}>
                  <X size={14} aria-hidden="true" /> Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
