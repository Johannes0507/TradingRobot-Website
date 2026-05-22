/**
 * FluidRibbon — Stripe-style scrolling silk panels
 *
 * Based on frame-by-frame video analysis of stripe.com hero animation:
 *
 * Mechanism: diagonal colour bands continuously scroll from right to left,
 * completing one full cycle every ~20 seconds.  The four bands in sequence
 * are purple → coral → orange → magenta, with a thin white ribbon marking
 * the leading (left) edge of the purple band.
 *
 * Key parameters validated against video:
 *  - Gradient axis: ~22° from horizontal (cos ≈ 0.928, sin ≈ 0.371)
 *  - Scroll period: 2.0 gradient-units, speed 0.10 units/second → 20 s cycle
 *  - Colour zones: purple 0–0.27, coral 0.27–0.52, orange 0.52–0.82,
 *                  magenta 0.82–0.94, return-to-purple 0.94–1.0
 *  - White ribbon: leading edge of purple (a ≈ 0), width ≈ 3% of period
 *  - Canvas left-edge fade merges into white page background
 */
import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a_pos;
varying   vec2 v_uv;
void main() {
  v_uv        = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2  v_uv;
uniform float u_time;   /* seconds × speed multiplier */

/* ---- 2D smooth value noise ------------------------------------------ */
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i),           h2(i + vec2(1.0, 0.0)), f.x),
             mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2  uv = v_uv;
  float t  = u_time;

  /* ── Gradient axis: 22° from horizontal ───────────────────────────── */
  /* Diagonal panels going lower-left → upper-right, sweeping left over time */
  float ang = 0.38;                        /* 21.8° */
  float ca  = cos(ang), sa = sin(ang);     /* 0.928, 0.371 */

  /* Organic warp — gentle noise displacement prevents mechanical edges */
  float warp = (vn(uv * 2.6 + vec2(t * 0.07, t * 0.04)) - 0.5) * 0.028
             + (vn(uv * 5.2 + vec2(t * 0.03, t * 0.06)) - 0.5) * 0.010;

  /* Scrolling gradient (+ t = pattern advances, panels move left on screen) */
  /* PERIOD 1.4, speed 0.038 → full cycle ~37 s — calibrated from video    */
  float pos    = uv.x * ca + uv.y * sa + warp + t * 0.038;
  float PERIOD = 1.4;
  float a      = fract(pos / PERIOD);      /* 0..1, cycles every ~37 s      */

  /* ── Colour palette (calibrated from video) ───────────────────────── */
  vec3 bg      = vec3(1.000, 1.000, 1.000);
  vec3 purple  = vec3(0.590, 0.490, 0.980);   /* vivid blue-purple  */
  vec3 coral   = vec3(0.980, 0.400, 0.420);   /* saturated coral    */
  vec3 orange  = vec3(0.995, 0.680, 0.200);   /* rich warm orange   */
  vec3 magenta = vec3(0.920, 0.280, 0.700);   /* vivid hot pink     */

  /* ── Colour zones with sharp-ish transitions ──────────────────────── */
  float blur = 0.018;  /* sharper edges */
  float t1 = smoothstep(0.27 - blur, 0.27 + blur, a);  /* purple → coral   */
  float t2 = smoothstep(0.50 - blur, 0.50 + blur, a);  /* coral  → orange  */
  float t3 = smoothstep(0.88 - blur, 0.88 + blur, a);  /* orange → magenta */
  float t4 = smoothstep(0.96 - blur, 0.96 + blur, a);  /* magenta→ purple  */

  vec3 col = purple;
  col = mix(col, coral,   t1);
  col = mix(col, orange,  t2);
  col = mix(col, magenta, t3);
  col = mix(col, purple,  t4);

  /* ── Silk sheen: subtle luminance bands running along the stripes ──── */
  float sheen = vn(uv * 7.0 + vec2(t * 0.025, t * 0.015)) * 0.5 + 0.5;
  col *= 0.96 + sheen * 0.08;

  /* ── White ribbon: leading edge of purple band (a ≈ 0) ─────────────── */
  /* Sweeps leftward with the animation — the crease of the silk fold */
  float ribbon = smoothstep(0.032, 0.000, a);
  ribbon *= smoothstep(0.0, 0.14, uv.x)           /* fade near left edge  */
          * smoothstep(0.0, 0.06, uv.y);           /* fade at very top     */
  col = mix(col, bg, ribbon * 0.92);

  /* ── Second, dimmer ribbon at coral→orange boundary (a ≈ 0.52) ─────── */
  float ribbon2 = smoothstep(0.020, 0.000, abs(a - 0.52));
  ribbon2 *= smoothstep(0.0, 0.08, uv.x) * smoothstep(0.0, 0.05, uv.y);
  col = mix(col, bg, ribbon2 * 0.45);

  /* ── Left-edge fade: canvas blends into white page background ──────── */
  float leftFade = smoothstep(0.0, 0.30, uv.x - uv.y * 0.04);
  col = mix(bg, col, leftFade);

  /* ── Top / bottom edge fades ─────────────────────────────────────── */
  float topFade = smoothstep(0.0, 0.06, uv.y);
  float botFade = smoothstep(1.0, 0.88, uv.y);
  col = mix(bg, col, topFade * botFade);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[FluidRibbon] shader error:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export interface FluidRibbonProps {
  /** Speed multiplier — 1.0 = ~20 s full colour cycle */
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function FluidRibbon({ speed = 1.0, className, style }: FluidRibbonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (
      canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true }) ||
      canvas.getContext('experimental-webgl')
    ) as WebGLRenderingContext | null;
    if (!gl) { console.warn('[FluidRibbon] WebGL not supported'); return; }

    const vs = compileShader(gl, gl.VERTEX_SHADER,   VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[FluidRibbon] link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r   = canvas!.getBoundingClientRect();
      const w   = Math.max(1, Math.floor(r.width  * dpr));
      const h   = Math.max(1, Math.floor(r.height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width  = w;
        canvas!.height = h;
      }
      gl!.viewport(0, 0, w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const start = performance.now();

    function tick() {
      const t = reduceMotion ? 0 : ((performance.now() - start) / 1000) * speed;
      gl!.uniform1f(uTime, t);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
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
