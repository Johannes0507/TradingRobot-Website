/**
 * FluidRibbon — Stripe hero animation (pixel-calibrated)
 *
 * Exhaustive analysis via 30fps frame extraction + per-pixel RGB tracking:
 *
 * Gradient direction: NEGATIVE x, POSITIVE y  →  pos = -x·0.944 + y·0.330
 *   Bands run "\" (upper-left → lower-right), nearly vertical (19° from vert).
 *   LEFT side = high pos = purple/lavender
 *   RIGHT/bottom = low pos = orange
 *
 * Calibration (measured from pixel data):
 *   Orange left boundary at canvas cv=41.6%, hero y=20% moves +0.67%/s rightward
 *   → scrollSpeed = 0.0063 / s  (full cycle ~174 s)
 *   Canvas-left (cv=4%, y=10%) is always purple  → pos ≈ -0.005 → a ≈ 0.69
 *   Canvas-centre (cv=50%, y=40%) is orange at t=0 → pos ≈ -0.340 → a ≈ 0.39
 *   PERIOD = 1.10, phase offset = 0.767
 *
 * Colour palette from direct video pixel sampling:
 *   purple:  rgb(80, 39,247)  vivid indigo-purple
 *   lavender: rgb(190,204,252) pale periwinkle (long-range purple)
 *   orange:  rgb(242,148, 24) rich warm orange
 *   coral:   rgb(240,115,140) warm coral-salmon
 *   magenta: rgb(235, 95,185) vivid hot pink
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

float h2(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vn(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);
}

void main() {
  vec2  uv = v_uv;
  float t  = u_time;

  /* ── Gradient: bands run "\" (upper-left to lower-right) ───────────────
     Measured from orange zone tracing:
       orange cv=58% at hero-y=5% → canvas (0.58, 0.05)
       orange cv=69% at hero-y=40% → canvas (0.69, 0.40)
     Line direction: (Δx=0.11, Δy=0.35) → normal: (-0.330, 0.944) → ca=0.944, sa=0.330
     pos = -ca*x + sa*y  (decreases going right, increases going down)    */
  float ca = 0.944, sa = 0.330;

  /* Organic warp: breaks straight lines → silk-like curvature.
     Amplitude 0.055 chosen to match the ~4% band position variation
     observed across hero height in pixel data.                           */
  float warp = (vn(uv * 2.1 + vec2(t*0.019, t*0.013)) - 0.5) * 0.055
             + (vn(uv * 5.3 + vec2(t*0.009, t*0.017)) - 0.5) * 0.020;

  float pos = -uv.x * ca + uv.y * sa + warp;

  /* Scroll: a increases → orange retreats rightward (as measured).
     Speed 0.0063/s  (orange boundary moves +0.0067 canvas/s at y=20%)
     PERIOD = 1.10   offset = 0.767                                       */
  float PERIOD = 1.10;
  float a = fract((pos + t * 0.0063 + 0.767) / PERIOD);

  /* ── Colour zones (a increasing = retreating from orange toward purple) ─
     Sampled colour positions:
       cv=4%,  y=10%  → always purple  → pos≈-0.005 → a≈0.692
       cv=21%, y=35%  → always lavender → pos≈-0.088 → a≈0.617
       cv=41%, y=20%  → orange left edge → a≈0.40 (boundary)
       cv=50%, y=40%  → orange core     → a≈0.39
       cv=58%, y=5%   → orange peak     → a≈0.28
       cv=75%, y=10%  → transition/magenta → a≈0.15
     Zones: orange 0.00-0.40, transition 0.40-0.55, purple 0.55-0.85,
             magenta 0.85-0.97, return-to-orange 0.97-1.00               */
  vec3 bg       = vec3(1.000, 1.000, 1.000);
  /* Vivid purple (measured far-right at top): rgb(80,39,247)             */
  vec3 orange   = vec3(0.949, 0.580, 0.094);   /* rgb(242,148, 24) peak  */
  vec3 coral    = vec3(0.941, 0.451, 0.549);   /* rgb(240,115,140)       */
  vec3 vivid_p  = vec3(0.314, 0.153, 0.969);   /* rgb( 80, 39,247) vivid */
  vec3 lavender = vec3(0.745, 0.800, 0.988);   /* rgb(190,204,252) pale  */
  vec3 magenta  = vec3(0.922, 0.373, 0.725);   /* rgb(235, 95,185)       */

  /* Zone layout (a increasing = orange retreats right):
     return-orange 0.00-0.12 → orange 0.12-0.50 → coral 0.50-0.62
     → white ribbon at 0.55 → vivid-purple 0.62-0.80 → lavender 0.80-0.92
     → magenta 0.92-1.00
     Far right top (a≈0.86 at canvas x=1, y=0.05) → lavender ✓
     Far left (a≈0.69 at canvas x=0, y=0.5) → lavender/purple ✓          */
  float blur = 0.018;
  float t1 = smoothstep(0.12-blur, 0.12+blur, a);  /* return → orange    */
  float t2 = smoothstep(0.50-blur, 0.50+blur, a);  /* orange → coral     */
  float t3 = smoothstep(0.62-blur, 0.62+blur, a);  /* coral  → vivid-p   */
  float t4 = smoothstep(0.80-blur, 0.80+blur, a);  /* vivid-p → lavender */
  float t5 = smoothstep(0.92-blur, 0.92+blur, a);  /* lavender → magenta */

  vec3 col = orange;  /* start colour (a=0.00 = return-from-orange zone) */
  col = mix(col, orange,    t1);   /* transition back to orange           */
  col = mix(col, coral,     t2);
  col = mix(col, vivid_p,   t3);
  col = mix(col, lavender,  t4);
  col = mix(col, magenta,   t5);

  /* Subtle within-band brightness lift (Stripe's silk has 3D depth)      */
  /* Keep it very gentle to avoid visible banding artefacts.               */
  float bandCtr = sin(a * 3.14159 * 2.0) * 0.5 + 0.5;
  col *= 0.97 + bandCtr * 0.06;

  /* ── White ribbon at the orange→coral crease (a≈0.50) ─────────────────
     The most prominent visual element in Stripe's animation.              */
  float rib = smoothstep(0.028, 0.000, abs(a - 0.50));
  rib *= smoothstep(0.0, 0.12, uv.x)
       * smoothstep(0.0, 0.055, uv.y)
       * smoothstep(1.0, 0.90, uv.x);
  col = mix(col, bg, rib * 0.92);

  /* Second dimmer ribbon at coral→purple (a≈0.62)                        */
  float rib2 = smoothstep(0.018, 0.000, abs(a - 0.62));
  rib2 *= smoothstep(0.0, 0.08, uv.x) * smoothstep(0.0, 0.04, uv.y);
  col = mix(col, bg, rib2 * 0.45);

  /* ── Left-edge fade: animation blends into white page background ──────── */
  float leftFade = smoothstep(0.0, 0.14, uv.x);
  col = mix(bg, col, leftFade);

  /* ── Top / bottom edge fades ─────────────────────────────────────────── */
  col = mix(bg, col, smoothstep(0.0, 0.055, uv.y) * smoothstep(1.0, 0.88, uv.y));

  /* ── Right-edge soft fade ─────────────────────────────────────────────── */
  col = mix(bg, col, smoothstep(1.0, 0.90, uv.x));

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
