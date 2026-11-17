/* Sticker catalogue. `idle` and `react` map to CSS animation classes.
   Edit the reaction lines freely. */
import { stickerMessages } from './messages';

export type StickerDef = {
  id: string;
  name: string;
  idle: 'float' | 'wiggle' | 'bob' | 'pulse' | 'sway' | 'spin' | 'breathe';
  react: 'bounce' | 'spin' | 'jelly' | 'wave' | 'flip' | 'zoom';
  lines: string[];
  hidden?: boolean;
  /** Hidden stickers: the message they reveal + a hint for the collection panel. */
  message?: string;
  hint?: string;
};

export const stickers: StickerDef[] = [
  { id: 'cloud', name: 'Smiling Cloud', idle: 'float', react: 'jelly', lines: ['Hi hi!', 'Floating by to say hello.', 'Soft day ahead.'] },
  { id: 'whale', name: 'Little Blue Whale', idle: 'sway', react: 'bounce', lines: ['Splash!', 'Whale hello there.', 'Big hug, ocean-sized.'] },
  { id: 'heart', name: 'Floating Heart', idle: 'pulse', react: 'zoom', lines: ['Ba-dum.', 'Still beating for you.', '💙'] },
  { id: 'cat', name: 'Sleeping Cat', idle: 'breathe', react: 'jelly', lines: ['…zzz', 'Five more minutes…', 'mrrp?', 'Almost awake…'] },
  { id: 'shy', name: 'Shy One', idle: 'bob', react: 'jelly', lines: ['Oh! You saw me.', '…hi.', 'Okay, maybe one more peek.'] },
  { id: 'shootingStar', name: 'Tiny Shooting Star', idle: 'float', react: 'spin', lines: ['Make a wish!', 'Zoom!', 'Wish granted (probably).'] },
  { id: 'bear', name: 'Waving Bear', idle: 'bob', react: 'wave', lines: ['Hello hello!', '*waves enthusiastically*', 'Bear hug incoming.'] },
  { id: 'flower', name: 'Cute Flower', idle: 'sway', react: 'jelly', lines: ['Blooming!', 'Growing a little more…', 'Almost fully open!'] },
  { id: 'sun', name: 'Happy Sun', idle: 'spin', react: 'zoom', lines: ['Good morning!', 'Here’s some warmth.', 'Shine on.'] },
  { id: 'moon', name: 'Magical Moon', idle: 'float', react: 'flip', lines: ['Sweet dreams.', 'I keep the night soft.', 'Shhh… magic.'] },
  { id: 'envelope', name: 'Flying Envelope', idle: 'float', react: 'spin', lines: ['Special delivery!', 'Love letter in transit.', 'Flap flap.'] },
  { id: 'ghost', name: 'Little Ghost', idle: 'float', react: 'jelly', lines: ['Boo! …I mean, hi.', 'This heart is for you.', 'Not scary, just shy.'] },
  { id: 'planet', name: 'Smiling Planet', idle: 'breathe', react: 'spin', lines: ['Orbiting happily.', 'You’re my favourite star.', 'Spin spin!'] },
  { id: 'duck', name: 'Tiny Duck', idle: 'sway', react: 'bounce', lines: ['Quack!', 'Just paddling around.', 'Quack quack (that means hi).'] },
  { id: 'balloon', name: 'Heart Balloon', idle: 'float', react: 'bounce', lines: ['Up, up!', 'Light as a feeling.', 'Hold on tight.'] },

  {
    id: 'hugBear',
    name: 'Hug Bear',
    idle: 'breathe',
    react: 'jelly',
    hidden: true,
    message: stickerMessages.hug,
    hint: 'Someone is sleeping. Maybe they’d wake up for you…',
    lines: ['Squeeze!', 'Hugs are free here.'],
  },
  {
    id: 'smileSparkle',
    name: 'Smile Sparkle',
    idle: 'pulse',
    react: 'spin',
    hidden: true,
    message: stickerMessages.smile,
    hint: 'Send three stickers to the sky.',
    lines: ['✦ smile ✦', 'You’re glowing.'],
  },
  {
    id: 'crystalHeart',
    name: 'Crystal Heart',
    idle: 'pulse',
    react: 'zoom',
    hidden: true,
    message: stickerMessages.special,
    hint: 'Someone shy needs a little encouragement.',
    lines: ['Rare and precious.', 'Like you.'],
  },
  {
    id: 'bouquet',
    name: 'Tiny Bouquet',
    idle: 'sway',
    react: 'jelly',
    hidden: true,
    message: stickerMessages.flower,
    hint: 'Help a flower bloom all the way.',
    lines: ['For you.', 'Freshly picked.'],
  },
];

/** How many taps reveal each hidden sticker. */
export const unlockRules = {
  catTaps: 5, // wake the sleeping cat → Hug Bear
  shyTaps: 3, // encourage the shy one → Crystal Heart
  flowerTaps: 4, // help the flower bloom → Tiny Bouquet
  sendsNeeded: 3, // send 3 stickers → Smile Sparkle
};
