import { useState, useEffect, useRef } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';

/** Mismo algoritmo que NowPlaying para mantener coherencia de color */
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

  // Dos capas que se alternan para lograr el crossfade sin parpadeo
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

    // 1. Escribir el nuevo contenido en la capa INACTIVA (invisible)
    setLayers((prev) => {
      const updated: [Layer, Layer] = [prev[0], prev[1]];
      updated[nextIdx] = next;
      return updated;
    });

    // 2. Después de que React la pinte, hacerla visible con fade
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

      {/* Viñeta radial: difumina los bordes y protege la legibilidad */}
      <div className="dyn-bg__vignette" />
    </div>
  );
}
