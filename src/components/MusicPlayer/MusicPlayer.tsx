import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music2, Wind, ChevronDown } from 'lucide-react';
import { personalization } from '../../data/personalization';
import { store } from '../../lib/store';
import { startAmbient, stopAmbient, setAmbientVolume, unlockAudio } from '../../lib/sound';
import './MusicPlayer.css';

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

/** Optional music — never autoplays; the file is only fetched on first play. */
export default function MusicPlayer() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [ambient, setAmbient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { music } = personalization;

  const getAudio = () => {
    if (!audio.current) {
      const a = new Audio();
      a.preload = 'none';
      a.loop = true;
      a.src = `${import.meta.env.BASE_URL}${music.src}`;
      a.volume = vol;
      a.addEventListener('timeupdate', () => setT(a.currentTime));
      a.addEventListener('loadedmetadata', () => setDur(a.duration));
      a.addEventListener('durationchange', () => setDur(a.duration));
      a.addEventListener('play', () => {
        setPlaying(true);
        store.set({ musicPlaying: true });
      });
      a.addEventListener('pause', () => {
        setPlaying(false);
        store.set({ musicPlaying: false });
      });
      a.addEventListener('waiting', () => setLoading(true));
      a.addEventListener('playing', () => setLoading(false));
      a.addEventListener('error', () => {
        setError('The track could not be loaded. Check music.src in personalization.ts.');
        setLoading(false);
        setPlaying(false);
        store.set({ musicPlaying: false });
      });
      audio.current = a;
    }
    return audio.current;
  };

  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
      stopAmbient();
      store.set({ musicPlaying: false });
    },
    [],
  );

  const toggle = async () => {
    unlockAudio();
    const a = getAudio();
    setError(null);
    if (a.paused) {
      setLoading(true);
      try {
        await a.play();
      } catch {
        setError('Playback was blocked — tap play once more.');
      } finally {
        setLoading(false);
      }
    } else a.pause();
  };

  const setVolume = (v: number) => {
    setVol(v);
    if (audio.current) audio.current.volume = v;
    if (ambient) setAmbientVolume(v * 0.55);
    if (v > 0 && muted) toggleMute(false);
  };

  const toggleMute = (to = !muted) => {
    setMuted(to);
    if (audio.current) audio.current.muted = to;
    if (ambient) setAmbientVolume(to ? 0.0001 : vol * 0.55);
  };

  const toggleAmbient = () => {
    unlockAudio();
    if (ambient) stopAmbient();
    else startAmbient(muted ? 0.0001 : vol * 0.55);
    setAmbient(!ambient);
  };

  return (
    <div className={`player chrome ${open ? 'is-open' : ''} ${playing ? 'is-playing' : ''}`}>
      {open && (
        <div className="player__panel" role="group" aria-label="Music player">
          <div className="player__track">
            <span className="player__disc" aria-hidden="true">
              <Music2 size={16} />
            </span>
            <div>
              <strong>{music.title}</strong>
              <span>{music.artist}</span>
            </div>
          </div>
          <div className="player__seek">
            <span>{fmt(t)}</span>
            <input
              type="range"
              min={0}
              max={dur || 0}
              step={0.1}
              value={Math.min(t, dur || 0)}
              onChange={(e) => {
                const a = getAudio();
                a.currentTime = +e.target.value;
                setT(+e.target.value);
              }}
              aria-label="Track position"
              disabled={!dur}
              style={{ ['--p' as string]: dur ? `${(t / dur) * 100}%` : '0%' }}
            />
            <span>{fmt(dur)}</span>
          </div>
          <div className="player__row">
            <button type="button" className="icon-btn" onClick={() => toggleMute()} aria-pressed={muted} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : vol}
              onChange={(e) => setVolume(+e.target.value)}
              aria-label="Volume"
              className="player__vol"
              style={{ ['--p' as string]: `${(muted ? 0 : vol) * 100}%` }}
            />
            <button type="button" className={`player__amb ${ambient ? 'is-on' : ''}`} onClick={toggleAmbient} aria-pressed={ambient}>
              <Wind size={15} aria-hidden="true" /> Ambient
            </button>
          </div>
          {error && <p className="player__err">{error}</p>}
        </div>
      )}
      <div className="player__bar">
        <button type="button" className="player__play" onClick={toggle} aria-label={playing ? 'Pause music' : 'Play music'}>
          {loading ? <span className="player__spin" /> : playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button type="button" className="player__label" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Hide music controls' : 'Show music controls'}>
          <span className="player__eq" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="player__name">{playing ? music.title : 'Music'}</span>
          <ChevronDown size={16} className="player__chev" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
