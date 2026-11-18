/* ==========================================================================
   MEMORIES — the photo gallery and the Sky Garden's memory tree.
   --------------------------------------------------------------------------
   1. Put your photos / short videos in  public/assets/memories/
   2. Add an entry below. `src` is relative to the public folder, e.g.
        { type: 'image', src: 'assets/memories/beach.jpg', date: '2026-03-14',
          caption: 'That windy afternoon', note: 'You laughed at my hair.' }
      Videos: { type: 'video', src: 'assets/memories/clip.mp4', poster: '...' }
   3. Entries without `src` show an elegant illustrated placeholder — nothing
      fake is ever shown as a real memory.
   Tip: keep photos under ~400 KB (e.g. 1600px wide JPG/WebP at 80%).
   ========================================================================== */

export type Memory = {
  type: 'image' | 'video' | 'placeholder';
  src?: string;
  poster?: string;
  /** 'YYYY-MM-DD' or any short text. */
  date?: string;
  caption: string;
  note?: string;
  /** Placeholder artwork style (only used without a src). */
  art?: 'dawn' | 'ocean' | 'night' | 'clouds' | 'stars' | 'horizon';
};

export const memories: Memory[] = [
  { type: 'image', src: 'assets/memories/snow.jpg', caption: 'Two of us, braving the cold', note: 'Side by side, even in the snow.' },
  { type: 'image', src: 'assets/memories/gummies.jpg', caption: 'Sweets for the ride', note: 'A whole box of little colours.' },
  { type: 'image', src: 'assets/memories/pomegranates.jpg', caption: 'Pomegranate season', note: 'Sweet things, just opening up.' },
  { type: 'image', src: 'assets/memories/letters.jpg', caption: 'Letters hidden in a sketch', note: 'Some messages only we can read.' },
  { type: 'image', src: 'assets/memories/stickers.jpg', caption: 'A pile of tiny friends', note: 'Every one of them has a face worth smiling at.' },
  { type: 'image', src: 'assets/memories/taj-academy.jpg', caption: 'Taj Academy', note: 'Don’t forget our home.' },
];

/** Shown when the visitor taps the tree in the Sky Garden. */
export const treeMemories: string[] = [
  'Two of us in the snow — side by side, even in the cold.',
  'A box of gummies, every colour you can think of.',
  'Pomegranates, cracked open and full of little red jewels.',
  'Letters hidden in a sketch — some messages only we can read.',
  'A mountain of tiny dog and cat stickers.',
  'Taj Academy. Don’t forget our home.',
];
