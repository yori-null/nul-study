import { useEffect, useState } from 'react';
import { stickerArt } from './stickerArt';
import { stickers } from '../../data/stickers';
import './Sticker.css';

type Props = {
  id: string;
  size?: number | string;
  /** change this number to replay the click reaction */
  nonce?: number;
  still?: boolean;
  className?: string;
  silhouette?: boolean;
};

/** Visual-only sticker: die-cut border, idle personality, reaction animation. */
export default function Sticker({ id, size = 96, nonce = 0, still = false, className = '', silhouette = false }: Props) {
  const def = stickers.find((s) => s.id === id);
  const [reacting, setReacting] = useState(false);
  useEffect(() => {
    if (!nonce) return;
    setReacting(true);
    const t = window.setTimeout(() => setReacting(false), 950);
    return () => clearTimeout(t);
  }, [nonce]);
  const Art = stickerArt[id];
  if (!Art || !def) return null;
  return (
    <span
      className={`sticker sticker--${id} ${still ? '' : `idle-${def.idle}`} ${reacting ? `react-${def.react}` : ''} ${silhouette ? 'is-silhouette' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="sticker__inner" key={nonce}>
        <Art />
      </span>
    </span>
  );
}
