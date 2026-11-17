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
  { type: 'placeholder', art: 'dawn', caption: 'A moment worth keeping', note: 'Add a photo in src/data/memories.ts' },
  { type: 'placeholder', art: 'ocean', caption: 'Somewhere we smiled', note: 'Your caption goes here' },
  { type: 'placeholder', art: 'night', caption: 'A late conversation', note: 'Write a little note about it' },
  { type: 'placeholder', art: 'clouds', caption: 'An ordinary, perfect day', note: 'Add the date too, if you like' },
  { type: 'placeholder', art: 'stars', caption: 'Something only we understand', note: 'Photos or short videos work' },
  { type: 'placeholder', art: 'horizon', caption: 'The next memory', note: 'Still waiting to be made' },
];

/** Shown when the visitor taps the tree in the Sky Garden. */
export const treeMemories: string[] = [
  'A special memory goes here — edit treeMemories in src/data/memories.ts.',
  'Another little moment you want to remember together.',
  'A small thing that made you smile.',
];
