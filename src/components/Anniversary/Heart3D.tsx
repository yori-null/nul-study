import { useId } from 'react';

/** An extruded blue heart built from stacked SVG layers (real CSS 3D, no WebGL). */
export default function Heart3D({ size = 120, className = '', hue = 'blue' }: { size?: number; className?: string; hue?: 'blue' | 'ice' | 'cyan' }) {
  const id = useId().replace(/:/g, '');
  const stops =
    hue === 'ice' ? ['#F8FCFF', '#A8DCFF', '#57B8F5'] : hue === 'cyan' ? ['#B8F6FF', '#54E4FF', '#2589FF'] : ['#A8DCFF', '#2589FF', '#12518A'];
  const layers = 7;
  return (
    <span className={`heart3d ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="heart3d__spin">
        {Array.from({ length: layers }, (_, i) => (
          <svg key={i} viewBox="0 0 32 32" style={{ transform: `translateZ(${(i - layers / 2) * (size / 70)}px)` }}>
            <defs>
              <linearGradient id={`${id}-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={i === layers - 1 ? stops[0] : stops[1]} />
                <stop offset=".6" stopColor={stops[1]} />
                <stop offset="1" stopColor={stops[2]} />
              </linearGradient>
            </defs>
            <path
              d="M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z"
              fill={i === layers - 1 || i === 0 ? `url(#${id}-${i})` : stops[2]}
              opacity={i === layers - 1 || i === 0 ? 1 : 0.95}
            />
            {(i === layers - 1 || i === 0) && <ellipse cx="9.5" cy="10" rx="3.2" ry="2" fill="#fff" opacity=".55" transform="rotate(-30 9.5 10)" />}
          </svg>
        ))}
      </span>
    </span>
  );
}
