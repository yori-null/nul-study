import { useEffect, useMemo, useRef, useState } from 'react';
import { PartyPopper, Volume2, ChevronDown } from 'lucide-react';
import Heart3D from './Heart3D';
import { anniversary, secretMessage } from '../../data/messages';
import { personalization } from '../../data/personalization';
import { computeTogether, formatLongDate, parseLocalDate } from '../../lib/dates';
import { useInView } from '../../hooks/useReveal';
import { burstFrom, confetti, rain, toast } from '../../lib/effects';
import { sfx } from '../../lib/sound';
import { scrollToId } from '../Letter/Letter';
import './Anniversary.css';

function useStartDate() {
  return useMemo(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('since');
    return parseLocalDate(fromUrl) ?? parseLocalDate(personalization.startDate);
  }, []);
}

function CountUp({ to, run }: { to: number; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <>{v.toLocaleString()}</>;
}

export default function Anniversary() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const start = useStartDate();
  const together = start ? computeTogether(start) : null;
  const months = personalization.monthsTogetherOverride ?? together?.months ?? null;
  const fired = useRef(false);
  const secretTaps = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (inView && !fired.current) {
      fired.current = true;
      const t = window.setTimeout(() => {
        confetti(window.innerWidth / 2, window.innerHeight * 0.35);
        sfx('success');
      }, 700);
      return () => clearTimeout(t);
    }
  }, [inView]);

  const celebrate = (withSound: boolean) => {
    confetti(window.innerWidth / 2, window.innerHeight * 0.4);
    rain({ shapes: ['heart', 'star', 'sparkle'], count: 40, duration: 3600 });
    if (withSound) sfx('success', true);
    else sfx('success');
  };

  const headline = anniversary.headline.toUpperCase();
  const words = headline.split(' ');

  return (
    <section className="chapter anniv on-dark" id="celebrate" aria-labelledby="anniv-title">
      <div className={`anniv__inner ${inView ? 'is-in' : ''}`} ref={ref}>
        <div className="anniv__hearts" aria-hidden="true">
          <Heart3D size={130} className="anniv__h anniv__h--1" />
          <Heart3D size={74} className="anniv__h anniv__h--2" hue="cyan" />
          <Heart3D size={56} className="anniv__h anniv__h--3" hue="ice" />
          <Heart3D size={92} className="anniv__h anniv__h--4" hue="ice" />
          <Heart3D size={44} className="anniv__h anniv__h--5" hue="cyan" />
        </div>

        <span className="eyebrow">Chapter Two</span>
        <h2 className="anniv__title" id="anniv-title" aria-label={anniversary.headline}>
          {words.map((w, wi) => (
            <span className="anniv__word" key={wi} aria-hidden="true">
              {[...w].map((ch, i) => (
                <span className="anniv__char" key={i} style={{ ['--i' as string]: wi * 6 + i }}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
          <button
            type="button"
            className="anniv__secret"
            aria-label="A tiny star"
            onClick={(e) => {
              secretTaps.current += 1;
              burstFrom(e.currentTarget, { shapes: ['sparkle'], count: 6 + secretTaps.current * 3, spread: 50 + secretTaps.current * 12 });
              sfx('sparkle');
              if (secretTaps.current === 5) {
                rain({ shapes: ['star', 'sparkle'], count: 50, duration: 3600 });
                toast(secretMessage.text, { title: secretMessage.title, icon: 'star', duration: 8000 });
                secretTaps.current = 0;
              }
            }}
          >
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 1c1.2 8 3.6 12.6 15 15-11.4 2.4-13.8 7-15 15-1.2-8-3.6-12.6-15-15C12.4 13.6 14.8 9 16 1Z" />
            </svg>
          </button>
        </h2>
        <p className="anniv__sub">{anniversary.subtitle}</p>

        <div className="anniv__panel">
          <div className="anniv__badge" aria-label={together ? `Since ${formatLongDate(together.start)}` : 'Our monthiversary'}>
            <svg viewBox="0 0 200 200" className="anniv__ring" aria-hidden="true">
              <defs>
                <path id="anniv-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text>
                <textPath href="#anniv-circle">
                  {together
                    ? `HAPPY MONTHIVERSARY · SINCE ${formatLongDate(together.start).toUpperCase()} · `
                    : `HAPPY MONTHIVERSARY · ${personalization.recipientName.toUpperCase()} · ALWAYS · `}
                </textPath>
              </text>
            </svg>
            <div className="anniv__badge-core">
              {months !== null ? (
                <>
                  <strong>
                    <CountUp to={months} run={inView} />
                  </strong>
                  <span>{months === 1 ? 'month' : 'months'}</span>
                </>
              ) : (
                <svg viewBox="0 0 32 32" className="anniv__badge-heart" aria-hidden="true">
                  <path d="M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z" />
                </svg>
              )}
            </div>
          </div>

          <div className="anniv__counter">
            <p className="anniv__line">{anniversary.counterLine}</p>
            {together ? (
              <>
                <div className="anniv__cells">
                  <div className="anniv__cell">
                    <strong>
                      <CountUp to={months ?? together.months} run={inView} />
                    </strong>
                    <span>months</span>
                  </div>
                  <div className="anniv__cell">
                    <strong>
                      <CountUp to={together.days} run={inView} />
                    </strong>
                    <span>days</span>
                  </div>
                  <div className="anniv__cell">
                    <strong>
                      <CountUp to={together.totalDays} run={inView} />
                    </strong>
                    <span>days in total</span>
                  </div>
                </div>
                <p className="anniv__next">
                  {together.isMonthiversaryToday
                    ? 'Today is our monthiversary.'
                    : `Next monthiversary in ${together.daysToNext} ${together.daysToNext === 1 ? 'day' : 'days'} · ${formatLongDate(together.nextDate)}`}
                </p>
              </>
            ) : (
              <>
                <p className="anniv__placeholder">{anniversary.placeholder}</p>
                {import.meta.env.DEV && (
                  <p className="anniv__dev">
                    Set <code>startDate</code> in <code>src/data/personalization.ts</code> (or add <code>?since=YYYY-MM-DD</code> to the URL) to show the live counter.
                  </p>
                )}
              </>
            )}
            <div className="anniv__actions">
              <button type="button" className="btn" ref={btn} onClick={() => celebrate(false)}>
                <PartyPopper size={18} aria-hidden="true" /> Celebrate again
              </button>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => celebrate(true)}>
                <Volume2 size={16} aria-hidden="true" /> With a little sound
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="next-link" onClick={() => scrollToId('little-things')}>
          Little things <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
