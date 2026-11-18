/* Original sticker illustrations — flat SVG, blue identity, each with named
   parts (.s-eye, .s-arm …) so CSS can give them a personality. */
import type { ReactElement } from 'react';

const O = '#12518A'; // outline
const NAVY = '#102C50';
const BLUSH = '#A8DCFF';

const Eyes = ({ x1, x2, y, r = 3.2, closed = false }: { x1: number; x2: number; y: number; r?: number; closed?: boolean }) =>
  closed ? (
    <g className="s-eyes" fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round">
      <path d={`M${x1 - 4} ${y} q4 4 8 0`} />
      <path d={`M${x2 - 4} ${y} q4 4 8 0`} />
    </g>
  ) : (
    <g className="s-eyes">
      <ellipse cx={x1} cy={y} rx={r} ry={r * 1.15} fill={NAVY} />
      <ellipse cx={x2} cy={y} rx={r} ry={r * 1.15} fill={NAVY} />
      <circle cx={x1 + 1} cy={y - 1.3} r={r * 0.35} fill="#fff" />
      <circle cx={x2 + 1} cy={y - 1.3} r={r * 0.35} fill="#fff" />
    </g>
  );

const Smile = ({ x, y, w = 8 }: { x: number; y: number; w?: number }) => (
  <path className="s-mouth" d={`M${x - w / 2} ${y} q${w / 2} ${w * 0.6} ${w} 0`} fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" />
);

const Cheeks = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => (
  <g className="s-cheeks" fill={BLUSH} opacity="0.9">
    <ellipse cx={x1} cy={y} rx="5" ry="3" />
    <ellipse cx={x2} cy={y} rx="5" ry="3" />
  </g>
);

const HEART = 'M16 29S2 20.5 2 11.2C2 6.6 5.6 3 9.9 3c2.7 0 4.9 1.4 6.1 3.6C17.2 4.4 19.4 3 22.1 3 26.4 3 30 6.6 30 11.2 30 20.5 16 29 16 29Z';

export const stickerArt: Record<string, () => ReactElement> = {
  cloud: () => (
    <svg viewBox="0 0 120 120">
      <path className="s-body" d="M30 88c-12 0-20-8-20-18 0-9 7-17 17-17 2-14 14-24 28-24 13 0 23 8 27 20 2-1 5-1 7-1 11 0 20 9 20 20s-9 20-20 20Z" fill="#F8FCFF" stroke={O} strokeWidth="2.5" />
      <path d="M22 80c8 4 60 5 80 0" fill="none" stroke="#A8DCFF" strokeWidth="5" strokeLinecap="round" opacity=".6" />
      <Eyes x1={50} x2={72} y={62} />
      <Smile x={61} y={70} w={10} />
      <Cheeks x1={42} x2={80} y={70} />
    </svg>
  ),
  whale: () => (
    <svg viewBox="0 0 120 120">
      <g className="s-spout" fill="#54E4FF" stroke={O} strokeWidth="2">
        <path d="M52 30c0-8 4-12 4-12s4 4 4 12" />
        <circle cx="47" cy="20" r="4" />
        <circle cx="65" cy="18" r="3.5" />
      </g>
      <path className="s-body" d="M14 70c0-18 18-32 42-32 22 0 38 12 42 28l8-10c4-5 10-2 8 4l-4 12 6 6c3 4-1 9-6 7l-10-4C92 92 76 98 58 98 32 98 14 88 14 70Z" fill="#57B8F5" stroke={O} strokeWidth="2.5" />
      <path d="M18 78c10 12 30 16 46 14 12-2 22-6 30-14-6 14-22 20-36 20-18 0-34-8-40-20Z" fill="#E5F5FF" />
      <Eyes x1={36} x2={54} y={66} r={3} />
      <Smile x={45} y={74} w={8} />
      <Cheeks x1={30} x2={60} y={73} />
    </svg>
  ),
  heart: () => (
    <svg viewBox="0 0 120 120">
      <g transform="translate(14 14) scale(2.9)">
        <path className="s-body" d={HEART} fill="#2589FF" stroke={O} strokeWidth=".9" />
        <path d="M8 9c-2 1-3 3-3 5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      </g>
      <g className="s-glints" fill="#54E4FF">
        <path d="M100 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
        <path d="M16 96l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" />
      </g>
    </svg>
  ),
  cat: () => (
    <svg viewBox="0 0 120 120">
      <g className="s-zzz" fill={O} fontFamily="Fraunces, serif" fontWeight="700">
        <text x="84" y="30" fontSize="14">z</text>
        <text x="94" y="20" fontSize="10">z</text>
      </g>
      <path className="s-tail" d="M96 84c12 0 14-14 6-18" fill="none" stroke={O} strokeWidth="9" strokeLinecap="round" />
      <path className="s-tail" d="M96 84c12 0 14-14 6-18" fill="none" stroke="#7FA9D6" strokeWidth="5" strokeLinecap="round" />
      <ellipse className="s-body" cx="62" cy="80" rx="40" ry="22" fill="#7FA9D6" stroke={O} strokeWidth="2.5" />
      <g className="s-head">
        <path d="M24 66l4-22 12 12Z M52 56l10-14 2 18Z" fill="#7FA9D6" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="42" cy="72" r="20" fill="#7FA9D6" stroke={O} strokeWidth="2.5" />
        <Eyes x1={35} x2={50} y={72} closed />
        <path d="M41 79l1.5 1.5L44 79" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
        <Cheeks x1={30} x2={55} y={80} />
      </g>
    </svg>
  ),
  shy: () => (
    <svg viewBox="0 0 120 120">
      <g className="s-peek">
        <circle cx="60" cy="50" r="26" fill="#E5F5FF" stroke={O} strokeWidth="2.5" />
        <Eyes x1={51} x2={69} y={48} />
        <Cheeks x1={44} x2={76} y={56} />
      </g>
      <g transform="translate(18 44) scale(2.6)">
        <path className="s-body" d={HEART} fill="#57B8F5" stroke={O} strokeWidth="1" />
      </g>
      <g className="s-hands" fill="#E5F5FF" stroke={O} strokeWidth="2.5">
        <ellipse cx="36" cy="62" rx="7" ry="6" />
        <ellipse cx="84" cy="62" rx="7" ry="6" />
      </g>
    </svg>
  ),
  shootingStar: () => (
    <svg viewBox="0 0 120 120">
      <g className="s-trail" stroke="#54E4FF" strokeLinecap="round">
        <path d="M18 98l40-30" strokeWidth="7" opacity=".5" />
        <path d="M30 104l28-22" strokeWidth="4" opacity=".4" />
        <path d="M10 84l38-26" strokeWidth="4" opacity=".35" />
      </g>
      <path className="s-body" d="m78 14 9 19 21 3-15 14 4 21-19-10-19 10 4-21-15-14 21-3Z" fill="#A8DCFF" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <Eyes x1={71} x2={85} y={42} r={2.6} />
      <Smile x={78} y={49} w={7} />
    </svg>
  ),
  bear: () => (
    <svg viewBox="0 0 120 120">
      <g className="s-arm" style={{ transformOrigin: '84px 78px' }}>
        <ellipse cx="94" cy="62" rx="9" ry="14" transform="rotate(25 94 62)" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      </g>
      <ellipse className="s-body" cx="60" cy="92" rx="28" ry="20" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <ellipse cx="60" cy="96" rx="14" ry="10" fill="#F8FCFF" />
      <circle cx="38" cy="30" r="10" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <circle cx="82" cy="30" r="10" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <circle cx="38" cy="30" r="5" fill={BLUSH} />
      <circle cx="82" cy="30" r="5" fill={BLUSH} />
      <circle cx="60" cy="52" r="26" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <ellipse cx="60" cy="60" rx="10" ry="8" fill="#F8FCFF" />
      <ellipse cx="60" cy="56" rx="4" ry="3" fill={NAVY} />
      <Eyes x1={49} x2={71} y={48} r={2.8} />
      <Smile x={60} y={62} w={7} />
      <Cheeks x1={42} x2={78} y={58} />
    </svg>
  ),
  flower: () => (
    <svg viewBox="0 0 120 120">
      <path d="M60 70v40" stroke="#3B7F9E" strokeWidth="5" strokeLinecap="round" />
      <path d="M60 96c-14-2-20-12-20-12 12-2 20 4 20 12Z" fill="#7CC6B8" stroke={O} strokeWidth="2" />
      <g className="s-petals" style={{ transformOrigin: '60px 46px' }}>
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="60" cy="24" rx="13" ry="18" transform={`rotate(${r} 60 46)`} fill="#57B8F5" stroke={O} strokeWidth="2.2" />
        ))}
      </g>
      <circle cx="60" cy="46" r="12" fill="#F8FCFF" stroke={O} strokeWidth="2.2" />
      <Eyes x1={55} x2={65} y={45} r={2} />
      <Smile x={60} y={50} w={5} />
    </svg>
  ),
  sun: () => (
    <svg viewBox="0 0 120 120">
      <g className="s-rays" style={{ transformOrigin: '60px 60px' }} stroke="#FFC9A8" strokeWidth="6" strokeLinecap="round">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <path key={i} d={`M${60 + Math.cos(a) * 38} ${60 + Math.sin(a) * 38}L${60 + Math.cos(a) * 50} ${60 + Math.sin(a) * 50}`} />;
        })}
      </g>
      <circle className="s-body" cx="60" cy="60" r="30" fill="#FFE6B8" stroke={O} strokeWidth="2.5" />
      <Eyes x1={50} x2={70} y={56} r={3} />
      <Smile x={60} y={66} w={12} />
      <g fill="#FFC9A8">
        <ellipse cx="44" cy="66" rx="5" ry="3" />
        <ellipse cx="76" cy="66" rx="5" ry="3" />
      </g>
    </svg>
  ),
  moon: () => (
    <svg viewBox="0 0 120 120">
      <path className="s-body" d="M76 16a44 44 0 1 0 28 72A38 38 0 0 1 76 16Z" fill="#DCDFFF" stroke={O} strokeWidth="2.5" />
      <circle cx="44" cy="80" r="5" fill="#C3C8F5" />
      <circle cx="58" cy="94" r="3" fill="#C3C8F5" />
      <Eyes x1={44} x2={60} y={60} closed />
      <Smile x={52} y={68} w={6} />
      <g className="s-glints" fill="#54E4FF" stroke={O} strokeWidth="1.2">
        <path d="m96 20 2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" />
        <path d="m104 54 1.8 4 4 1.8-4 1.8-1.8 4-1.8-4-4-1.8 4-1.8Z" />
      </g>
    </svg>
  ),
  envelope: () => (
    <svg viewBox="0 0 120 120">
      <g className="s-wing s-wing--l" style={{ transformOrigin: '30px 56px' }}>
        <path d="M30 56C14 40 6 44 4 50c8 0 12 6 26 10Z" fill="#F8FCFF" stroke={O} strokeWidth="2.2" />
      </g>
      <g className="s-wing s-wing--r" style={{ transformOrigin: '90px 56px' }}>
        <path d="M90 56c16-16 24-12 26-6-8 0-12 6-26 10Z" fill="#F8FCFF" stroke={O} strokeWidth="2.2" />
      </g>
      <rect className="s-body" x="26" y="40" width="68" height="48" rx="6" fill="#57B8F5" stroke={O} strokeWidth="2.5" />
      <path d="M28 44l32 24 32-24" fill="none" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <g transform="translate(52 66) scale(.5)">
        <path d={HEART} fill="#F8FCFF" />
      </g>
    </svg>
  ),
  ghost: () => (
    <svg viewBox="0 0 120 120">
      <path className="s-body" d="M30 100V54c0-18 14-32 30-32s30 14 30 32v46l-8-7-8 7-7-7-7 7-7-7-8 7-8-7Z" fill="#F8FCFF" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <Eyes x1={50} x2={68} y={52} />
      <path d="M55 62q4 4 8 0" fill="none" stroke={NAVY} strokeWidth="2.4" strokeLinecap="round" />
      <Cheeks x1={44} x2={74} y={60} />
      <g className="s-held" transform="translate(44 66) scale(1)">
        <path d={HEART} fill="#2589FF" stroke={O} strokeWidth="1.6" />
      </g>
    </svg>
  ),
  planet: () => (
    <svg viewBox="0 0 120 120">
      <path d="M16 72c-6 10 10 16 44 8s50-22 44-32" fill="none" stroke="#54E4FF" strokeWidth="5" strokeLinecap="round" />
      <circle className="s-body" cx="60" cy="60" r="30" fill="#2589FF" stroke={O} strokeWidth="2.5" />
      <path d="M36 48c10-4 22 2 30-2s14-2 18 2M34 70c10 2 18-4 28 0s16 2 22-2" fill="none" stroke="#57B8F5" strokeWidth="4" strokeLinecap="round" />
      <Eyes x1={50} x2={70} y={58} r={3} />
      <Smile x={60} y={66} w={9} />
      <path className="s-ring" d="M104 48c6 10-10 24-44 32" fill="none" stroke="#54E4FF" strokeWidth="5" strokeLinecap="round" />
      <circle className="s-moonlet" cx="98" cy="24" r="6" fill="#DCDFFF" stroke={O} strokeWidth="2" />
    </svg>
  ),
  duck: () => (
    <svg viewBox="0 0 120 120">
      <path d="M8 96c10-6 18 6 28 0s18 6 28 0 18 6 28 0 18 6 20 2" fill="none" stroke="#57B8F5" strokeWidth="4" strokeLinecap="round" />
      <g className="s-body">
        <path d="M24 72c0-10 10-14 22-12l16-2c14 0 30 2 34 12 2 14-12 22-36 22S24 86 24 72Z" fill="#F8FCFF" stroke={O} strokeWidth="2.5" />
        <path d="M84 66c6-2 10-8 10-8" fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="44" cy="44" r="18" fill="#F8FCFF" stroke={O} strokeWidth="2.5" />
        <path d="M24 44c-8 0-12 4-12 6 6 2 10 2 14-2Z" fill="#FFC9A8" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
        <Eyes x1={38} x2={50} y={40} r={2.6} />
        <ellipse cx="52" cy="48" rx="4" ry="2.5" fill={BLUSH} />
        <path d="M58 72c6 6 16 6 22-2" fill="none" stroke="#A8DCFF" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  ),
  balloon: () => (
    <svg viewBox="0 0 120 120">
      <path className="s-string" d="M60 78c-6 10 6 16 0 26s4 10 2 14" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" />
      <g className="s-body" transform="translate(20 8) scale(2.5)">
        <path d={HEART} fill="#57B8F5" stroke={O} strokeWidth="1" />
        <path d="M8 8c-2 1-3 3-3 5" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".85" />
      </g>
      <path d="M56 80l4-4 4 4Z" fill="#2589FF" stroke={O} strokeWidth="1.6" />
    </svg>
  ),

  /* ---------- hidden stickers ---------- */
  hugBear: () => (
    <svg viewBox="0 0 120 120">
      <circle cx="36" cy="26" r="9" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <circle cx="84" cy="26" r="9" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <ellipse cx="60" cy="90" rx="32" ry="22" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <circle cx="60" cy="48" r="26" fill="#CFE8FB" stroke={O} strokeWidth="2.5" />
      <ellipse cx="60" cy="56" rx="9" ry="7" fill="#F8FCFF" />
      <ellipse cx="60" cy="53" rx="3.6" ry="2.6" fill={NAVY} />
      <Eyes x1={49} x2={71} y={44} closed />
      <Cheeks x1={42} x2={78} y={54} />
      <g transform="translate(40 68) scale(1.25)">
        <path className="s-body" d={HEART} fill="#2589FF" stroke={O} strokeWidth="1.6" />
      </g>
      <g fill="#CFE8FB" stroke={O} strokeWidth="2.5">
        <ellipse cx="38" cy="84" rx="10" ry="8" transform="rotate(-30 38 84)" />
        <ellipse cx="82" cy="84" rx="10" ry="8" transform="rotate(30 82 84)" />
      </g>
    </svg>
  ),
  smileSparkle: () => (
    <svg viewBox="0 0 120 120">
      <path className="s-body" d="M60 6c4 30 14 44 50 54-36 10-46 24-50 54-4-30-14-44-50-54 36-10 46-24 50-54Z" fill="#54E4FF" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <Eyes x1={52} x2={68} y={56} r={3} />
      <Smile x={60} y={64} w={10} />
      <Cheeks x1={46} x2={74} y={64} />
    </svg>
  ),
  crystalHeart: () => (
    <svg viewBox="0 0 120 120">
      <path className="s-body" d="M60 104 14 54l14-26h20l12 14 12-14h20l14 26Z" fill="#A8DCFF" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 54h92M28 28l10 26 22 50 22-50 10-26M48 28l-10 26M72 28l10 26M60 42 38 54M60 42l22 12" fill="none" stroke={O} strokeWidth="1.6" strokeLinejoin="round" opacity=".7" />
      <path d="M38 54 60 104 28 54Z" fill="#57B8F5" opacity=".7" />
      <path d="M82 54 60 104l32-50Z" fill="#E5F5FF" opacity=".8" />
      <g className="s-glints" fill="#fff">
        <path d="m96 12 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
      </g>
    </svg>
  ),
  bouquet: () => (
    <svg viewBox="0 0 120 120">
      <path d="M60 110 44 64M60 110l16-46M60 110V60" stroke="#3B7F9E" strokeWidth="4" strokeLinecap="round" />
      {[
        [40, 52, '#57B8F5'],
        [80, 52, '#2589FF'],
        [60, 38, '#A8DCFF'],
      ].map(([cx, cy, c], i) => (
        <g key={i} className="s-petals" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx={cx as number} cy={(cy as number) - 11} rx="7" ry="10" transform={`rotate(${r} ${cx} ${cy})`} fill={c as string} stroke={O} strokeWidth="1.8" />
          ))}
          <circle cx={cx as number} cy={cy as number} r="5.5" fill="#F8FCFF" stroke={O} strokeWidth="1.8" />
        </g>
      ))}
      <path d="M40 86h40l-8 18H48Z" fill="#E5F5FF" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M52 92q8 6 16 0" fill="none" stroke="#2589FF" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
};
