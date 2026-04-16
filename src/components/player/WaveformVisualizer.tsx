import { useEffect, useRef } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';

const BAR_COUNT       = 52;
const BAR_GAP         = 3;
const MIN_HEIGHT      = 3;
const MAX_HEIGHT_PCT  = 0.72;
const LERP_PLAY       = 0.08;
const LERP_PAUSE      = 0.04;
const RETARGET_FRAMES = 18;


export function WaveformVisualizer() {
  const { isPlaying } = usePlayerContext();
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const stateRef   = useRef({
    heights:  new Float32Array(BAR_COUNT).fill(MIN_HEIGHT),
    targets:  new Float32Array(BAR_COUNT).fill(MIN_HEIGHT),
    frame:    0,
    playing:  false,
  });

  useEffect(() => {
    stateRef.current.playing = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    });
    ro.observe(canvas);

    const s = stateRef.current;
    for (let i = 0; i < BAR_COUNT; i++) {
      s.heights[i] = MIN_HEIGHT + Math.random() * 8;
      s.targets[i] = s.heights[i];
    }

    function randomTargets() {
      const maxH = canvas!.offsetHeight * MAX_HEIGHT_PCT;
      for (let i = 0; i < BAR_COUNT; i++) {
        const profile = 0.45 + 0.55 * Math.sin((i / (BAR_COUNT - 1)) * Math.PI);
        s.targets[i] = MIN_HEIGHT + Math.random() * maxH * profile;
      }
    }

    function draw() {
      const W = canvas!.offsetWidth;
      const H = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, W, H);

      const totalBarWidth = (W - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
      const barW = Math.max(1, totalBarWidth);

      // Taupe bars --accent #A89F94 with neumorphic shadow.
      ctx!.shadowColor    = 'rgba(0,0,0,0.13)';
      ctx!.shadowBlur     = 6;
      ctx!.shadowOffsetX  = 2;
      ctx!.shadowOffsetY  = 2;
      const [cr, cg, cb, aFull, aDim] = [168, 159, 148, 0.90, 0.50];

      for (let i = 0; i < BAR_COUNT; i++) {
        const h  = s.heights[i];
        const x  = i * (barW + BAR_GAP);
        const y  = (H - h) / 2;

        const grad = ctx!.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0,   `rgba(${cr},${cg},${cb},${aDim})`);
        grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${aFull})`);
        grad.addColorStop(1,   `rgba(${cr},${cg},${cb},${aDim})`);

        ctx!.fillStyle = grad;

        const r = Math.min(barW / 2, 3);
        ctx!.beginPath();
        ctx!.moveTo(x + r, y);
        ctx!.lineTo(x + barW - r, y);
        ctx!.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx!.lineTo(x + barW, y + h - r);
        ctx!.quadraticCurveTo(x + barW, y + h, x + barW - r, y + h);
        ctx!.lineTo(x + r, y + h);
        ctx!.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx!.lineTo(x, y + r);
        ctx!.quadraticCurveTo(x, y, x + r, y);
        ctx!.closePath();
        ctx!.fill();
      }
      // Reset shadow to avoid affecting other drawings.
      ctx!.shadowColor   = 'transparent';
      ctx!.shadowBlur    = 0;
      ctx!.shadowOffsetX = 0;
      ctx!.shadowOffsetY = 0;
    }

    function tick() {
      s.frame++;

      if (s.playing) {
        if (s.frame % RETARGET_FRAMES === 0) randomTargets();
        for (let i = 0; i < BAR_COUNT; i++) {
          s.heights[i] += (s.targets[i] - s.heights[i]) * LERP_PLAY;
        }
      } else {
        for (let i = 0; i < BAR_COUNT; i++) {
          s.heights[i] += (MIN_HEIGHT - s.heights[i]) * LERP_PAUSE;
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-visualizer"
      aria-hidden="true"
    />
  );
}
