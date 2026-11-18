/* ==========================================================================
   ✦  PERSONALIZATION — the one file to edit  ✦
   --------------------------------------------------------------------------
   Everything personal in the gift lives here (plus messages.ts for the longer
   texts and memories.ts for photos). Change a value, save, and the whole
   experience updates. Nothing else needs touching.
   ========================================================================== */

export const personalization = {
  /** The person this gift is for. Shown in headlines and letters. */
  recipientName: 'Efulim',

  /** Little names used around the experience (rotated in small places). */
  nicknames: ['Kodi', 'Sky'],

  /** Your name — signs the letters and the final message. */
  senderName: 'Your Batman',

  /**
   * The day it all started, as 'YYYY-MM-DD'.
   * Months and days together are calculated automatically from this date.
   * Leave it as null until you fill it in — the counter then shows a gentle
   * placeholder instead of a wrong number.
   *
   * Tip: while testing you can also add ?since=2026-01-17 to the URL.
   */
  startDate: '2026-10-18' as string | null,

  /**
   * Optional manual override for "number of months together".
   * Leave null to calculate it from startDate (recommended).
   */
  monthsTogetherOverride: null as number | null,

  /** Name of the little cloud companion who lives in the Sky Garden. */
  companionName: 'Nimbus',

  /**
   * Favourite colours. The gift is built around blue; these tune the accents.
   * Any CSS colour works.
   */
  colors: {
    primary: '#57B8F5', // primary sky blue
    electric: '#2589FF', // buttons & highlights
    accent: '#54E4FF', // glowing cyan
    warm: '#FFD9CB', // tiny peach accent (used sparingly)
  },

  /**
   * Music. Put your own (properly licensed) file in public/assets/audio/ and
   * change `src`. The default is an original lullaby generated for this gift
   * by scripts/generate-music.mjs — free to use.
   */
  music: {
    src: 'assets/audio/little-sky-lullaby.mp3',
    title: 'Little Sky Lullaby',
    artist: 'an original, made for you',
  },
} as const;

/** Convenience: the first nickname, falling back to the name. */
export const softName = personalization.nicknames[0] ?? personalization.recipientName;
