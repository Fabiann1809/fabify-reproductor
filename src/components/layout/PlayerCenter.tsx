import { NowPlaying } from '../player/NowPlaying';
import { ProgressBar } from '../player/ProgressBar';
import { PlayerControls } from '../player/PlayerControls';
import { VolumeRepeatShuffle } from '../player/VolumeRepeatShuffle';
import { WaveformVisualizer } from '../player/WaveformVisualizer';
import { DynamicBackground } from '../player/DynamicBackground';
import { CenterSearch } from '../search/CenterSearch';

export function PlayerCenter() {
  return (
    <main className="player-center">
      {/* z-index 0 — dynamic blurred artwork background */}
      <DynamicBackground />

      {/* z-index 1 — ambient golden glow */}
      <div className="player-center__glow" aria-hidden="true" />

      {/* z-index 3 — search input above turntable */}
      <CenterSearch />

      {/* z-index 2 — turntable */}
      <div className="player-center__stage">
        <NowPlaying />
      </div>

      {/* z-index 3 — Spotify-style control bar */}
      <div className="player-center__controls">
        {/* Background waveform visualizer */}
        <WaveformVisualizer />

        {/* Top row: [spacer] [5 central buttons] [volume] */}
        <div className="player-center__ctrl-row">
          <div className="player-center__ctrl-side" />
          <PlayerControls />
          <div className="player-center__ctrl-side player-center__ctrl-side--right">
            <VolumeRepeatShuffle />
          </div>
        </div>

        {/* Progress bar with timestamps */}
        <ProgressBar />
      </div>
    </main>
  );
}
