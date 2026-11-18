/* ==========================================================================
   MESSAGES — every longer piece of text in the gift. Edit freely.
   Use {name} to insert the recipient's name and {sender} for yours.
   ========================================================================== */

export const intro = {
  above: 'A little something for someone special...',
  below: 'Someone has prepared a surprise for you.',
  button: 'Open your little gift',
};

export const apologyLetter = {
  title: 'Before Anything Else...',
  greeting: 'Dear {name},',
  paragraphs: [
    'First, I want to say something that I should never have to make you guess.',
    "I'm sorry.",
    "I'm sorry for the moments when I may have made you feel upset, misunderstood, or unappreciated.",
    "I know that words alone cannot undo everything, and I don't expect a simple apology to solve everything.",
    "I just want you to know that I care, that I value what we share, and that I never want you to feel that your feelings don't matter.",
    'I may not always be perfect, but I can always try to understand, improve, and do better.',
    'And today, I wanted to make something special instead of simply sending another ordinary message.',
  ],
  /** The short line that also appears elsewhere in the experience. */
  heartLine:
    "I'm sorry. I may not always get everything right, but you deserve honesty, care, and appreciation.",
  signOff: 'With care,',
  button: "There's more...",
};

export const anniversary = {
  headline: 'Happy Monthiversary!',
  subtitle: 'Another little chapter of something special.',
  counterLine: 'Every little moment deserves to be celebrated.',
  placeholder: 'Every month with you is worth celebrating.',
};

export const littleThings = {
  title: 'Little Things I Want You to Know',
  cards: [
    { label: 'A Reminder', text: 'Your presence makes ordinary moments feel special.' },
    {
      label: 'A Little Thank You',
      text: 'Thank you for the moments, conversations, laughter, and everything in between.',
    },
    { label: 'A Promise', text: 'I want to keep learning, understanding, and becoming better.' },
    { label: 'A Wish', text: 'I hope today gives you at least one beautiful reason to smile.' },
    {
      label: 'A Secret',
      text: 'Some surprises are difficult to explain with words. This little world is one of them.',
    },
  ],
};

/** Tiny messages that drift across the sky now and then. */
export const floatingBubbles = [
  'Smile.',
  'Sending a little sunshine.',
  "You're appreciated.",
  'Stay magical.',
  'Hi, {nick}.',
  'Breathe. You’re doing great.',
  'A little sky, just for you.',
];

/** Random little messages from stars, stickers and the mini-game. */
export const hiddenMessages = [
  'You make the sky look a little bluer.',
  'This star was saving this for you.',
  'Psst — you are appreciated.',
  'A small reminder: you matter.',
  'Somebody is thinking of you right now.',
  'You found a secret. Of course you did.',
  'Here’s a little light for your day.',
];

export const stickerMessages = {
  hug: 'Sending you a little hug.',
  smile: 'One more reason to smile.',
  special: "You're special. Never forget that.",
  flower: "Here's a tiny virtual flower.",
};

export const skyGarden = {
  title: 'The Sky Garden',
  subtitle: 'A tiny world that grows when you touch it.',
  heartMessage: 'This heart has been glowing for you the whole time.',
  allBloomed: 'Every flower is blooming — just like you deserve.',
};

export const miniGame = {
  title: 'Collect Little Hearts!',
  subtitle: 'Tap the hearts and stars before they float away. No pressure — just play.',
  endLine: 'You collected {score} little pieces of happiness!',
  specials: [
    'You caught a wish!',
    'That one was extra bright — like you.',
    'A little happiness, delivered.',
    'Rare star found! You’re lucky (and loved).',
  ],
};

export const reactions = {
  title: 'How Are You Feeling Right Now?',
  note: "There's no right answer here. Whatever you feel is okay — and you never have to choose anything at all.",
  responses: {
    happy: 'That makes me really happy too.',
    smiling: 'Keep that smile. It suits you.',
    blushing: 'Okay, now I’m blushing a little too.',
    surprised: 'Surprise! There’s always a little more.',
    hug: 'Hug received. Sending one right back.',
    loved: 'Good. You are. Always.',
    forgive: 'Thank you. That means more than I can put into words — and I’ll keep trying.',
    thinking:
      'Take all the time you need. There’s no rush, and nothing you have to say. I’ll still be here.',
  },
};

export const gifts = {
  title: 'Three Little Boxes',
  subtitle: 'Each one holds something different.',
  personalMessage:
    'If I could give you one thing today, it would be the ability to see yourself the way I see you.',
  flowerDone: 'A little flower, just because.',
};

export const secretMessage = {
  title: 'You found the secret star ✦',
  text: 'Most people never click a star five times. You did. That curiosity is one of my favourite things about you.',
};

export const finalSurprise = {
  oneMoreThing: 'One More Thing...',
  paragraphs: [
    'Happy Monthiversary.',
    "I'm sorry for the moments I could have handled better.",
    'Thank you for being part of this little chapter.',
    'I hope we continue creating beautiful memories, sharing smiles, and understanding each other a little more every day.',
    'You deserve happiness, appreciation, and kindness.',
    'And this little digital world?',
    'I made it just for you.',
  ],
  closing: 'With love, always.',
  button: 'Open one last surprise',
  hiddenMessage:
    'Whatever today feels like, I hope you know this: you are cared for, exactly as you are.',
};

/** Replace {name}, {nick}, {sender}, {score} tokens. */
export function fill(text: string, vars: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
