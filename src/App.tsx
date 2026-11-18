import { useEffect, useState } from 'react';
import SkyScene from './scenes/SkyScene/SkyScene';
import Envelope from './components/Envelope/Envelope';
import Letter from './components/Letter/Letter';
import Anniversary from './components/Anniversary/Anniversary';
import LittleThings from './components/LittleThings/LittleThings';
import StickerWorld from './components/StickerWorld/StickerWorld';
import SkyGarden from './components/SkyGarden/SkyGarden';
import MemoryGallery from './components/MemoryGallery/MemoryGallery';
import MiniGame from './components/MiniGame/MiniGame';
import Gifts from './components/Gifts/Gifts';
import ReactionCenter from './components/ReactionCenter/ReactionCenter';
import FinalSurprise from './components/FinalSurprise/FinalSurprise';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';
import { Cursor, Toaster, FloatingBubbles, TopBar, ChapterNav } from './components/Chrome/Chrome';
import { useRevealAll } from './hooks/useReveal';
import { personalization } from './data/personalization';
import { store } from './lib/store';

export default function App() {
  // ?skip=1 jumps past the envelope (handy while personalising)
  const [opened, setOpened] = useState(() => new URLSearchParams(window.location.search).has('skip'));

  useRevealAll(opened);

  useEffect(() => {
    store.set({ opened });
    document.body.classList.toggle('is-locked', !opened);
    if (opened) window.scrollTo(0, 0);
  }, [opened]);

  // let the favourite colours from personalization.ts tune the palette
  useEffect(() => {
    const r = document.documentElement.style;
    const c = personalization.colors;
    r.setProperty('--sky', c.primary);
    r.setProperty('--electric', c.electric);
    r.setProperty('--cyan', c.accent);
    r.setProperty('--peach', c.warm);
    document.title = `For ${personalization.recipientName} · A Little Sky Full of Love`;
  }, []);

  return (
    <div className="app">
      <SkyScene />
      <Cursor />
      <Toaster />
      <TopBar />
      {!opened && <Envelope onDone={() => setOpened(true)} />}
      {opened && (
        <>
          <ChapterNav />
          <FloatingBubbles />
          <MusicPlayer />
          <main>
            <Letter />
            <Anniversary />
            <LittleThings />
            <StickerWorld />
            <SkyGarden />
            <MemoryGallery />
            <MiniGame />
            <Gifts />
            <ReactionCenter />
            <FinalSurprise />
          </main>
        </>
      )}
    </div>
  );
}
