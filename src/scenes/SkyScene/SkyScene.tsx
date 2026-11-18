import { useEffect, useRef } from 'react';
import { store, useStore, prefersReducedMotion } from '../../lib/store';
import './SkyScene.css';

/**
 * The living sky behind everything: gradient layers (CSS, cross-faded per
 * mode) + one canvas for clouds, stars, particles, hearts & shooting stars.
 * One rAF loop, DPR capped, paused when the tab is hidden.
 */

type Star = { x: number; y: number; r: number; p: number; s: number };
type Mote = { x: number; y: number; r: number; v: number; a: number; w: number };
type Cloud = { x: number; y: number; s: number; v: number; img: number; depth: number };
type Heart = { x: number; y: number; s: number; v: number; a: number; w: number };
type Shooting = { x: number; y: number; vx: number; vy: number; life: number };

function makeCloudSprite(w: number, h: number, seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const puffs = 9 + Math.floor(rnd() * 5);
  for (let i = 0; i < puffs; i++) {
    const px = w * (0.18 + rnd() * 0.64);
    const py = h * (0.45 + (rnd() - 0.5) * 0.3);
    const pr = h * (0.22 + rnd() * 0.22);
    const grad = g.createRadialGradient(px, py - pr * 0.2, pr * 0.1, px, py, pr);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.55, 'rgba(248,252,255,0.75)');
    grad.addColorStop(1, 'rgba(229,245,255,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(px, py, pr, 0, Math.PI * 2);
    g.fill();
  }
  // soft blue underside for depth
  const under = g.createLinearGradient(0, h * 0.5, 0, h);
  under.addColorStop(0, 'rgba(168,220,255,0)');
  under.addColorStop(1, 'rgba(87,184,245,0.18)');
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = under;
  g.fillRect(0, 0, w, h);
  return c;
}

const heartPath = new Path2D(
  'M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z',
);

export default function SkyScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useStore((s) => s.skyMode);
  const glow = useStore((s) => s.glow);
  const music = useStore((s) => s.musicPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let stars: Star[] = [];
    let motes: Mote[] = [];
    let clouds: Cloud[] = [];
    let hearts: Heart[] = [];
    const shooting: Shooting[] = [];
    const sprites = [makeCloudSprite(420, 170, 7), makeCloudSprite(520, 190, 21), makeCloudSprite(340, 140, 42)];
    let nightness = store.get().skyMode === 'night' ? 1 : 0;
    let nextShoot = performance.now() + 4000;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = (W * H) / (1440 * 900);
      const small = W < 700;
      const nStars = Math.round((small ? 110 : 220) * Math.min(1.4, Math.max(0.5, area)));
      stars = Array.from({ length: nStars }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() < 0.08 ? 1.6 + Math.random() : 0.4 + Math.random() * 1.1,
        p: Math.random() * Math.PI * 2,
        s: 0.6 + Math.random() * 1.8,
      }));
      motes = Array.from({ length: small ? 22 : 44 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.8 + Math.random() * 2.2,
        v: 0.08 + Math.random() * 0.25,
        a: 0.25 + Math.random() * 0.5,
        w: Math.random() * Math.PI * 2,
      }));
      clouds = Array.from({ length: small ? 6 : 9 }, (_, i) => {
        const depth = 0.35 + Math.random() * 0.65;
        return {
          x: Math.random() * (W + 500) - 250,
          y: (i / (small ? 6 : 9)) * H * 0.95 + Math.random() * 40 - 40,
          s: (small ? 0.5 : 0.75) * (0.6 + depth * 0.7),
          v: 0.05 + depth * 0.12,
          img: i % sprites.length,
          depth,
        };
      });
      hearts = Array.from({ length: small ? 5 : 9 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 6 + Math.random() * 10,
        v: 0.12 + Math.random() * 0.22,
        a: 0.18 + Math.random() * 0.28,
        w: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      const st = store.get();
      const targetNight = st.skyMode === 'night' ? 1 : st.skyMode === 'dusk' ? 0.45 : 0;
      nightness += (targetNight - nightness) * (reduced ? 1 : 0.02);
      const speed = st.musicPlaying ? 1.35 : 1;
      const scrollY = window.scrollY;
      ctx.clearRect(0, 0, W, H);

      // stars — faint in daylight, brilliant at night
      const starAlpha = 0.28 + nightness * 0.72;
      for (const s of stars) {
        const tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.s * speed + s.p);
        const y = (((s.y - scrollY * 0.03) % H) + H) % H;
        ctx.globalAlpha = starAlpha * tw;
        ctx.fillStyle = s.r > 1.5 ? '#E5F5FF' : nightness > 0.5 ? '#FFFFFF' : '#F8FCFF';
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.5) {
          ctx.globalAlpha = starAlpha * tw * 0.35;
          ctx.fillStyle = '#54E4FF';
          ctx.beginPath();
          ctx.arc(s.x, y, s.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // clouds — parallax with scroll, fade at night
      const cloudAlpha = 1 - nightness * 0.92;
      if (cloudAlpha > 0.02) {
        for (const c of clouds) {
          if (!reduced) c.x += c.v * speed;
          const img = sprites[c.img];
          const w = img.width * c.s;
          const h = img.height * c.s;
          if (c.x > W + 40) c.x = -w - 40;
          const y = (((c.y - scrollY * 0.12 * c.depth) % (H + h)) + (H + h)) % (H + h) - h * 0.6;
          ctx.globalAlpha = cloudAlpha * (0.45 + c.depth * 0.5);
          ctx.drawImage(img, c.x, y, w, h);
        }
      }

      // drifting motes (glowing cyan particles)
      for (const m of motes) {
        if (!reduced) {
          m.y -= m.v * speed;
          m.w += 0.01;
          if (m.y < -10) {
            m.y = H + 10;
            m.x = Math.random() * W;
          }
        }
        const x = m.x + Math.sin(m.w) * 12;
        ctx.globalAlpha = m.a * (0.6 + nightness * 0.4);
        const g = ctx.createRadialGradient(x, m.y, 0, x, m.y, m.r * 4);
        g.addColorStop(0, 'rgba(229,250,255,1)');
        g.addColorStop(0.4, 'rgba(84,228,255,0.55)');
        g.addColorStop(1, 'rgba(84,228,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, m.y, m.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // soft floating hearts
      for (const h of hearts) {
        if (!reduced) {
          h.y -= h.v * speed;
          h.w += 0.012;
          if (h.y < -30) {
            h.y = H + 30;
            h.x = Math.random() * W;
          }
        }
        const x = h.x + Math.sin(h.w) * 18;
        ctx.save();
        ctx.globalAlpha = h.a;
        ctx.translate(x, h.y);
        ctx.rotate(Math.sin(h.w) * 0.25);
        ctx.scale(h.s / 32, h.s / 32);
        ctx.translate(-16, -16);
        ctx.fillStyle = nightness > 0.5 ? '#A8DCFF' : '#F8FCFF';
        ctx.fill(heartPath);
        ctx.restore();
      }

      // shooting stars
      if (!reduced && t > nextShoot) {
        nextShoot = t + 5000 + Math.random() * (nightness > 0.5 ? 4000 : 12000);
        shooting.push({ x: Math.random() * W * 0.7 + W * 0.2, y: Math.random() * H * 0.35, vx: -(6 + Math.random() * 4), vy: 2.6 + Math.random() * 2, life: 1 });
      }
      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.012;
        if (s.life <= 0) {
          shooting.splice(i, 1);
          continue;
        }
        const tail = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        tail.addColorStop(0, `rgba(255,255,255,${s.life})`);
        tail.addColorStop(0.3, `rgba(84,228,255,${s.life * 0.6})`);
        tail.addColorStop(1, 'rgba(84,228,255,0)');
        ctx.globalAlpha = 1;
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running && !reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduced) draw(performance.now());
      }, 120);
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    let unsub: (() => void) | undefined;
    if (reduced) {
      draw(0);
      // redraw on mode changes only
      unsub = store.subscribe(() => draw(performance.now()));
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      unsub?.();
    };
  }, []);

  return (
    <div className={`sky sky--${mode} ${music ? 'sky--music' : ''}`} aria-hidden="true" style={{ ['--glow' as string]: glow }}>
      <div className="sky__layer sky__layer--day" />
      <div className="sky__layer sky__layer--dusk" />
      <div className="sky__layer sky__layer--night" />
      <div className="sky__rays" />
      <div className="sky__haze" />
      <canvas ref={canvasRef} className="sky__canvas" />
      <div className="sky__glow" />
    </div>
  );
}
