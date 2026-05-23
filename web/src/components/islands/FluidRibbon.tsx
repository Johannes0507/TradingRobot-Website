/**
 * FluidRibbon — Aurora flow for LendAuto hero
 *
 * Designed for our specific context (not a Stripe knock-off):
 *   • Hero is information-dense (pill + headline + sub + CTAs + KPI strip)
 *   • Animation must ACCENT, not COMPETE for attention
 *   • Brand feel: professional (financial) + active (24/7 automation) + premium
 *
 * Visual: a soft "aurora flow" — continuous gradient field with subtle
 * flowing motion. Stripe-inspired warm/cool palette but stripped of the
 * dramatic silk effect; reads as a gentle premium accent.
 *
 * Implementation principles:
 *   - SINGLE continuous gradient field (no discrete panels)
 *   - Multi-octave organic warp (waves of motion)
 *   - Smooth multi-stop palette: lavender → amber → orange → coral → vivid_p
 *   - Soft asymmetric mask (gathered upper-right, drifts lower-left)
 *   - Subtle vertical streaks suggest "always-on data flow"
 *   - Minimal noise/dithering for clean rendering
 *   - Very slow motion (~60s perceived cycle) — never distracting
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
uniform float u_time;

float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i+vec2(1,0)), f.x),
             mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * (vn(p) - 0.5);
    p = p * 2.07 + 11.7;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2  uv = v_uv;
  float t  = u_time;

  /* ─────────────────────────────────────────────────────────────────────
     1. POSITION: gentle diagonal gradient from upper-right to lower-left
     The "aurora" sweeps diagonally — same orientation as Stripe but
     simpler (no rotation matrix, just a dot product).
     ───────────────────────────────────────────────────────────────────── */
  float baseField = uv.x * 0.78 - uv.y * 0.62;        /* diagonal direction */

  /* ─────────────────────────────────────────────────────────────────────
     2. WARP: multi-octave noise layers create organic flow
     XL: wide arches (the big shape)
     L:  medium ripples
     M:  fine detail
     Tiny temporal drift on each — gives life without distraction.
     ───────────────────────────────────────────────────────────────────── */
  vec2  flow      = vec2(t * 0.030, t * 0.018);
  float warp_xl   = fbm(uv *  0.9 + flow)         * 0.32;
  float warp_l    = fbm(uv *  2.2 + flow * 1.4 + 5.0) * 0.14;
  float warp_m    = fbm(uv *  5.5 + flow * 1.8 + 9.0) * 0.04;

  float field = baseField + warp_xl + warp_l + warp_m;

  /* ─────────────────────────────────────────────────────────────────────
     3. COLOR: smooth 5-stop continuous gradient (no hard panel edges)
     Palette refined for our brand (warm-trust + cool-tech):
       lavender — premium tech feel
       amber    — financial warmth
       orange   — active/working
       coral    — energy/conversion
       vivid_p  — distinctive accent
     ───────────────────────────────────────────────────────────────────── */
  vec3 c_lavender = vec3(0.760, 0.815, 0.985);   /* slightly brighter than measured */
  vec3 c_amber    = vec3(0.995, 0.760, 0.310);
  vec3 c_orange   = vec3(0.955, 0.560, 0.080);
  vec3 c_coral    = vec3(0.945, 0.460, 0.560);
  vec3 c_vivid_p  = vec3(0.380, 0.220, 0.985);

  /* Map field range [~-0.7 to ~+1.5] smoothly through palette */
  float n = (field + 0.30) / 1.10;                 /* normalize approx 0..1 */
  n = clamp(n, 0.0, 1.0);

  vec3 col;
  if (n < 0.25)      col = mix(c_lavender, c_amber,   smoothstep(0.00, 0.25, n));
  else if (n < 0.50) col = mix(c_amber,    c_orange,  smoothstep(0.25, 0.50, n));
  else if (n < 0.72) col = mix(c_orange,   c_coral,   smoothstep(0.50, 0.72, n));
  else               col = mix(c_coral,    c_vivid_p, smoothstep(0.72, 1.00, n));

  /* ─────────────────────────────────────────────────────────────────────
     4. ASYMMETRIC MASK
     Gathered upper-right, drapes off lower-left — the silk-cloth shape
     but achieved through smooth field rather than discrete silhouette.

     mask combines:
       (a) radial fade from upper-right anchor (0.85, 0.20)
       (b) diagonal fade — silk drapes off lower-left
       (c) top/bottom canvas edge fades
     ───────────────────────────────────────────────────────────────────── */
  vec2  anchor = vec2(0.85, 0.20);
  float dRad   = length((uv - anchor) * vec2(0.95, 1.20));
  float radialMask = smoothstep(1.10, 0.30, dRad);

  float diagFade = smoothstep(-0.10, 0.55, uv.x - (1.0 - uv.y) * 0.25);

  float mask = radialMask * diagFade
             * smoothstep(0.0, 0.04, uv.y)
             * smoothstep(1.0, 0.94, uv.y);

  /* ─────────────────────────────────────────────────────────────────────
     5. COMPOSITE
     ───────────────────────────────────────────────────────────────────── */
  vec3 bg = vec3(1.0);
  col = mix(bg, col, mask);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[FluidRibbon]', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export interface FluidRibbonProps {
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
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER,   VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const quad = new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);
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
      if (canvas!.width !== w || canvas!.height !== h) { canvas!.width=w; canvas!.height=h; }
      gl!.viewport(0, 0, w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const start = performance.now();
    function tick() {
      const elapsed = reduceMotion ? 0 : ((performance.now()-start)/1000) * speed;
      gl!.uniform1f(uTime, elapsed);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
  }, [speed]);

  return <canvas ref={canvasRef} className={className} style={{ display:'block', width:'100%', height:'100%', ...style }} />;
}
