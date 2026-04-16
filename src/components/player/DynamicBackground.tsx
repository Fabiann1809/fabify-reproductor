import { useState, useEffect, useRef } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';

/** Same algorithm as NowPlaying to keep color coherence. */
function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 35%, 72%)`;
}

interface Layer {
  artworkUrl: string;
  fallbackColor: string;
}

const EMPTY: Layer = { artworkUrl: '', fallbackColor: '#111' };

export function DynamicBackground() {
  const { nowPlaying } = usePlayerContext();

  // Two alternating layers for flicker-free crossfade.
  const [layers, setLayers] = useState<[Layer, Layer]>([EMPTY, EMPTY]);
  const [active, setActive] = useState<0 | 1>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next: Layer = nowPlaying
      ? {
          artworkUrl:    nowPlaying.artworkUrl ?? '',
          fallbackColor: colorFromString(nowPlaying.artist),
        }
      : EMPTY;

    const nextIdx = active === 0 ? 1 : 0;

    // 1. Write new content into the INACTIVE layer (invisible).
    setLayers((prev) => {
      const updated: [Layer, Layer] = [prev[0], prev[1]];
      updated[nextIdx] = next;
      return updated;
    });

    // 2. After React paints it, make it visible with fade.
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive(nextIdx as 0 | 1);
    }, 60);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.id]);

  return (
    <div className="dyn-bg" aria-hidden="true">
      {(layers as Layer[]).map((layer, idx) => (
        <div
          key={idx}
          className="dyn-bg__layer"
          style={{ opacity: idx === active ? 1 : 0 }}
        >
          {layer.artworkUrl ? (
            <img
              src={layer.artworkUrl}
              className="dyn-bg__img"
              alt=""
              draggable={false}
            />
          ) : (
            <div
              className="dyn-bg__color"
              style={{ background: layer.fallbackColor }}
            />
          )}
        </div>
      ))}

      {/* Radial vignette: softens edges and improves readability */}
      <div className="dyn-bg__vignette" />
    </div>
  );
}
