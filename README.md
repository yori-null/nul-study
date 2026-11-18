# A Little Sky Full of Love 💙

An interactive digital gift: an apology, a monthiversary celebration and a few surprises, set in a small blue sky world.

Built with **React + TypeScript + Vite**, **GSAP** for the envelope and gift-box sequences, CSS and SVG for the illustrations and 3D effects, a single Canvas for the living sky, and the **Web Audio API** for sound effects and the ambient soundscape. It doesn't use WebGL or any images, so it stays light on ordinary phones.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # production build → dist/
npm run preview    # serve the build locally
npm test           # anniversary date-maths tests
```

Handy URL options while you personalise it:

| URL | What it does |
| --- | --- |
| `?skip=1` | skips the envelope intro |
| `?since=2026-01-17` | previews the counter with a start date without editing code |

---

## Personalising: the three files to edit

### 1. `src/data/personalization.ts`, the main settings

| Setting | What it is |
| --- | --- |
| `recipientName` | `'Efulim'` |
| `nicknames` | `['Kodi', 'Sky']`, used in small places like the floating bubbles and the final card |
| `senderName` | **your name**. It signs the letter, the boxes and the final message |
| `startDate` | **the day it started**, written as `'YYYY-MM-DD'`. The months, days and next monthiversary are worked out from it automatically. While it's `null`, the counter shows a gentle placeholder instead of a wrong number |
| `monthsTogetherOverride` | optional manual month count. Leave it `null` to calculate it |
| `companionName` | the little cloud in the Sky Garden |
| `colors` | the accent colours. Blue stays the main colour |
| `music` | `src`, `title` and `artist` of the track |

### 2. `src/data/messages.ts`, every longer piece of text

The apology letter, the anniversary lines, the five "Little Things" cards, the floating bubbles, hidden messages, sticker secrets, the reaction responses, the gift-box message, the secret-star message and the final message with its hidden note. Inside any text, `{name}` inserts the recipient's name and `{sender}` inserts yours.

### 3. `src/data/memories.ts`, photos and memories

The gallery shows illustrated **placeholders** until you add real items. It never shows a made-up memory.

---

## Adding photos and videos

1. Put the files in `public/assets/memories/`. For photos, 1600 px wide JPG or WebP at about 80% quality (≤ 400 KB) works well.
2. Edit `src/data/memories.ts`:

```ts
export const memories: Memory[] = [
  { type: 'image', src: 'assets/memories/beach.jpg', date: '2026-03-14',
    caption: 'That windy afternoon', note: 'You laughed at my hair.' },
  { type: 'video', src: 'assets/memories/clip.mp4', poster: 'assets/memories/clip.jpg',
    caption: 'Dancing in the kitchen' },
];
```

Images load lazily. If a path is wrong, the card falls back to a placeholder instead of showing a broken image. `treeMemories` (same file) holds the notes that appear when someone taps the tree in the Sky Garden.

## Adding your own music

The default track, `public/assets/audio/little-sky-lullaby.mp3`, is an **original lullaby generated for this gift** by `scripts/generate-music.mjs`, so you're free to use it. To use your own track:

1. Copy a track you have permission to use into `public/assets/audio/`.
2. Set `music.src`, `music.title` and `music.artist` in `personalization.ts`.

Music never plays by itself. The file isn't downloaded until someone presses play, and sound effects stay off until the speaker button is turned on. The *Ambient* button adds a soft wind and pad generated live in the browser.

To regenerate (or tweak) the original track: `npm run music` (needs `ffmpeg`).

---

## What's inside

| Chapter | Highlights |
| --- | --- |
| **Intro** | A floating CSS-3D envelope: the flap opens, the letter rises, the sky brightens and particles burst. There's a sound toggle and a skip button. |
| **1 · The letter** | A paper letter that unfolds, with lines that reveal one by one, a glowing cursor light, a beating heart you can tap and stickers around the edge. |
| **2 · Monthiversary** | An animated headline, extruded 3D hearts, confetti, a rotating date badge and a live month/day counter. A hidden star sits near the headline: tap it 5 times to reveal the secret message. |
| **3 · Little things** | Five cards, each designed differently, that open into a dialog where the message reveals word by word. They close with ✕, Esc or a click outside. |
| **4 · Sticker world** | 15 original animated SVG stickers you can tap or drag. Drop one into *Send* to send it as a reaction, or into *Book* to collect it. Four hidden stickers are unlocked through play, and the collection is saved in the browser. |
| **5 · Sky garden** | Floating islands with pointer parallax. Flowers bloom, clouds release stars, the tree shares memories, the heart holds a hidden message and Nimbus the cloud waves and celebrates when every flower blooms. |
| **6 · Memories** | Floating polaroids with a 3D tilt and a full-screen lightbox (arrows, swipe, Esc). |
| **7 · Mini-game** | 30 seconds of catching hearts (1), stars (2) and rare crystals (5 plus a message). It gets a little faster over time, the cloud buddy reacts and there are restart and sound buttons. |
| **8 · Three little boxes** | A personal message, an animated sticker and a hidden illustration, plus a flower that grows as you tap its petals. |
| **9 · Feelings** | Eight optional reactions, each with its own animation. Forgiveness is never required. |
| **10 · One more thing** | The sky turns to night. Connect the stars into a heart (or let it draw itself), then the final letter, the last gift box and a **Calm view** that hides every control for a clean screenshot. |

Also included: a custom star cursor with click sparkles (it switches off on touch screens), tiny messages that drift across the sky, a progress dot for each chapter, and a sky that moves from day to dusk to night as the story goes.

### Accessibility and performance

- Respects `prefers-reduced-motion`: animations are minimal and the intro becomes a simple fade.
- Everything works by keyboard, with visible focus rings, ARIA labels and Esc to close dialogs.
- One `requestAnimationFrame` loop for the sky. It pauses when the tab is hidden, caps the pixel ratio and uses fewer particles on phones.
- Particles remove themselves when finished, and every listener and timer is cleaned up.
- Fonts are self-hosted (Fraunces, Manrope, Caveat), with only the subsets in use downloaded.
- About 135 KB of gzipped JavaScript in total.

---

## Project structure

```
src/
  App.tsx, main.tsx
  components/
    Envelope/  Letter/  Anniversary/  LittleThings/  StickerWorld/
    SkyGarden/  MemoryGallery/  MiniGame/  Gifts/  ReactionCenter/
    MusicPlayer/  FinalSurprise/  Chrome/ (cursor, toasts, bubbles, nav)
  scenes/
    SkyScene/            living canvas sky
    HeartConstellation/  connect-the-stars heart
  data/
    personalization.ts  messages.ts  memories.ts  stickers.ts
  hooks/useReveal.ts
  lib/  dates.ts  effects.ts  sound.ts  store.ts
  styles/  design-tokens.css  global.css  animations.css
public/assets/  audio/  memories/
scripts/  generate-music.mjs  test-dates.ts
```

---

## Deploying

The build in `dist/` is a static site that uses relative paths (`base: './'`), so it works almost anywhere.

- **Netlify**: drag the `dist` folder onto app.netlify.com/drop, or connect the repo with build command `npm run build` and publish directory `dist`.
- **Vercel**: import the repo. It detects Vite automatically (output `dist`).
- **GitHub Pages**: run `npm run build`, then publish `dist/` (for example with the `gh-pages` package: `npx gh-pages -d dist`).
- **Anywhere else**: upload the contents of `dist/` to any static host.

Before you share the link, fill in `senderName` and `startDate`, then add photos if you'd like.
