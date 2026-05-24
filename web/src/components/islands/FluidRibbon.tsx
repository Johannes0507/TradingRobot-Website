/**
 * FluidRibbon — Canvas 2D radial-blob mesh (Lumen/Stripe-inspired)
 *
 * Why Canvas 2D radial gradients instead of WebGL shader:
 *   - WebGL multi-stop smoothstep blending produces visible band edges
 *     when warped by noise (we hit this artefact repeatedly)
 *   - 4 large radialGradient blobs with 'lighter' composite mode produce
 *     a true continuous mesh with no discrete band boundaries
 *   - Light theme: blob colours are brand tokens at low opacity over white
 *
 * Reference: Lumen.html (docs/reference) — same technique, dark→light port.
 */
import { useEffect, useRef } from 'react';

export interface FluidRibbonProps {
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Blob {
  x: number; y: number;
  r: number;
  color: [number, number, number];
  sx: number; sy: number;
  phase: number;
}

export default function FluidRibbon({ speed = 1.0, className, style }: FluidRibbonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Light-theme blob palette — brand tokens at low opacity */
    const blobs: Blob[] = [
      { x: 0.22, y: 0.25, r: 0.62, color: [99, 91, 255],  sx: 0.00030, sy: 0.00020, phase: 0   }, // brand purple
      { x: 0.78, y: 0.40, r: 0.58, color: [251, 113, 133], sx: -0.00022, sy: 0.00026, phase: 2 }, // coral
      { x: 0.55, y: 0.78, r: 0.50, color: [245, 158, 11],  sx: 0.00018, sy: -0.00028, phase: 4 }, // amber
      { x: 0.88, y: 0.15, r: 0.42, color: [167, 139, 250], sx: -0.00026, sy: -0.00012, phase: 1 }, // light purple
    ];

    let W = 0, H = 0, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width  = Math.max(1, Math.floor(W * dpr));
      canvas!.height = Math.max(1, Math.floor(H * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let running = false;
    let t = 0;
    let last = performance.now();

    function draw() {
      const now = performance.now();
      const dt = reduceMotion ? 0 : (now - last) * speed;
      last = now;
      t += dt;

      ctx!.clearRect(0, 0, W, H);

      /* Soft cream-tinted base so blobs don't blow out the page white */
      ctx!.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx!.fillRect(0, 0, W, H);

      /* Composite mode 'multiply' on light bg gives the gentle wash without
         the harsh saturation that 'lighter' produces on white.            */
      ctx!.globalCompositeOperation = 'multiply';

      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * b.sx + b.phase) * 0.10) * W;
        const cy = (b.y + Math.cos(t * b.sy + b.phase) * 0.08) * H;
        const r  = b.r * Math.min(W, H);
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        const [R, G, B] = b.color;
        grad.addColorStop(0,    `rgba(${R}, ${G}, ${B}, 0.55)`);
        grad.addColorStop(0.45, `rgba(${R}, ${G}, ${B}, 0.18)`);
        grad.addColorStop(1,    `rgba(${R}, ${G}, ${B}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, W, H);
      }

      ctx!.globalCompositeOperation = 'source-over';

      /* Soft left-edge fade to white (so canvas blends with text area) */
      const leftFade = ctx!.createLinearGradient(0, 0, W * 0.35, 0);
      leftFade.addColorStop(0,   'rgba(255,255,255,1)');
      leftFade.addColorStop(0.7, 'rgba(255,255,255,0.45)');
      leftFade.addColorStop(1,   'rgba(255,255,255,0)');
      ctx!.fillStyle = leftFade;
      ctx!.fillRect(0, 0, W * 0.35, H);

      /* Top + bottom soft fades (avoid hard horizontal edges) */
      const topFade = ctx!.createLinearGradient(0, 0, 0, 30);
      topFade.addColorStop(0, 'rgba(255,255,255,1)');
      topFade.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.fillStyle = topFade;
      ctx!.fillRect(0, 0, W, 30);

      const botFade = ctx!.createLinearGradient(0, H - 40, 0, H);
      botFade.addColorStop(0, 'rgba(255,255,255,0)');
      botFade.addColorStop(1, 'rgba(255,255,255,1)');
      ctx!.fillStyle = botFade;
      ctx!.fillRect(0, H - 40, W, 40);

      raf = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      draw();
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    /* Pause when off-screen */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    function onVisibility() {
      if (document.hidden) stop();
      else if (canvas!.getBoundingClientRect().bottom > 0) start();
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
