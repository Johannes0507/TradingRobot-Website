/**
 * FluidRibbon — Stripe-style diagonally-twisted silk
 *
 * Critical insight from frame analysis: the silk's LENGTH runs diagonally
 * from upper-left to lower-right of canvas. Its WIDTH (perpendicular)
 * gives the colour bands from upper-right to lower-left, matching Stripe.
 *
 * Implementation:
 *   1. Rotate canvas UV to align silk's length with the rotated y axis
 *   2. Apply silk twist algorithm in rotated coords (centerline + width)
 *   3. Sharp panel transitions create distinct silk faces
 *   4. White folds at panel boundaries (silk crease highlights)
 *
 * Geometry:
 *   silk LENGTH direction in canvas: (0.91, 0.41) — right and down
 *   silk WIDTH direction in canvas: (-0.41, 0.91) — left and down
 *   colour bands run perpendicular to width = parallel to length-perp
 *     = along (-0.41, 0.91) direction in canvas
 *     = from UPPER-RIGHT to LOWER-LEFT (matches Stripe) ✓
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

void main() {
  vec2  uv = v_uv;
  float t  = u_time;

  /* ── Rotate canvas UV to silk's natural frame ─────────────────────────
     NEGATIVE rotation: silk length runs from upper-right → lower-left.
     Centre moved up-right so silk extends off the canvas to right (silk's
     vivid-purple edge is positioned at canvas top-right corner area).     */
  vec2  c        = uv - vec2(0.75, 0.30);
  float angle    = -0.28;                                 /* ~16° from vertical — matches Stripe band slope */
  float ca       = cos(angle), sa = sin(angle);
  vec2  silkUV;
  silkUV.x = c.x *  ca + c.y * sa;                       /* across silk                 */
  silkUV.y = -c.x * sa + c.y * ca;                       /* along silk                  */

  /* ── Along-silk parameter (–0.5..0.5 across canvas height) ──────────── */
  float yt = silkUV.y + 0.5;                              /* shift to 0..1 range        */

  /* ── Very subtle curvature — Stripe's bands are mostly straight ─────── */
  float curvature = sin(yt * 1.4 + t * 0.05) * 0.025
                  + (vn(vec2(yt * 1.0, t * 0.04)) - 0.5) * 0.020;

  /* ── Centreline sway ─────────────────────────────────────────────── */
  float sway = sin(yt * 1.6 + t * 0.10) * 0.025
             + (vn(vec2(yt * 1.2, t * 0.07)) - 0.5) * 0.035;

  /* ── Tapering silk width: wide at upper-right (yt≈0.3), narrow at
     lower-left (yt≈0.8) — matches Stripe's fan-from-corner shape.        */
  float halfW = mix(0.55, 0.25, smoothstep(0.20, 0.85, yt));
  float across  = (silkUV.x - sway + curvature) / halfW;
  float localX  = (across + 1.0) * 0.5;

  /* ── Twist phase with radial fan component ──────────────────────────
     The silk appears to fan out from the upper-right corner.
     Adding a distance-from-corner term to twistPhase makes the bands
     curve toward this point — like a real silk gathered at one corner.   */
  vec2  fanCorner   = vec2(0.95, 0.05);
  float distFromFan = length(uv - fanCorner);
  float twistNoise  = (vn(vec2(silkUV.x * 1.4 + 3.0, yt * 1.5 + t * 0.08)) - 0.5) * 0.55;
  float twistPhase  = yt * 3.20                              /* base twist along length    */
                    + distFromFan * 1.20                     /* fan-out from corner        */
                    + twistNoise
                    + t * 0.32;
  float twist       = sin(twistPhase) * 0.42;
  float colorPos    = clamp(localX + twist, 0.0, 1.0);

  /* ── 5-panel colour gradient with sharp transitions ──────────────────── */
  vec3 c1 = vec3(0.745, 0.800, 0.988);   /* lavender                       */
  vec3 c2 = vec3(0.985, 0.700, 0.250);   /* amber                          */
  vec3 c3 = vec3(0.945, 0.565, 0.082);   /* orange peak                    */
  vec3 c4 = vec3(0.941, 0.451, 0.549);   /* coral                          */
  vec3 c5 = vec3(0.314, 0.153, 0.969);   /* vivid purple                   */

  /* Softer panel transitions for flowing silk feel (was 0.022 → 0.045) */
  float w  = 0.045;
  vec3  color = c1;
  color = mix(color, c2, smoothstep(0.13 - w, 0.13 + w, colorPos));  /* lavender→amber */
  color = mix(color, c3, smoothstep(0.28 - w, 0.28 + w, colorPos));  /* amber→orange   */
  color = mix(color, c4, smoothstep(0.68 - w, 0.68 + w, colorPos));  /* orange→coral   */
  color = mix(color, c5, smoothstep(0.86 - w, 0.86 + w, colorPos));  /* coral→vivid_p  */

  /* ── White silk fold creases (Stripe's signature bright lines) ─────── */
  /* Use exp falloff for sharp narrow bright lines (Gaussian-like)        */
  float fold = 0.0;
  fold = max(fold, exp(-pow((colorPos - 0.13) / 0.008, 2.0)));
  fold = max(fold, exp(-pow((colorPos - 0.28) / 0.008, 2.0)));
  fold = max(fold, exp(-pow((colorPos - 0.68) / 0.008, 2.0)));
  fold = max(fold, exp(-pow((colorPos - 0.86) / 0.008, 2.0)));
  fold *= 1.0 - smoothstep(0.70, 0.95, abs(across));
  color = mix(color, vec3(1.0), fold * 0.95);

  /* ── 3D silk shading ───────────────────────────────────────────────── */
  float silkDepth = 1.0 - abs(across);
  silkDepth = smoothstep(0.0, 0.65, silkDepth);
  color *= 0.86 + silkDepth * 0.14;

  /* Brighten where silk faces the viewer (panel centre = brightest)       */
  float panelCtr = 1.0 - abs(colorPos * 2.0 - 1.0);
  color *= 0.95 + panelCtr * 0.08;

  /* ── Silk silhouette ──────────────────────────────────────────────── */
  float mask = smoothstep(0.85, 0.72, abs(across));

  /* ── Top/bottom canvas fades (using canvas uv.y, not silkUV.y) ────── */
  mask *= smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.92, uv.y);

  /* ── Composite ──────────────────────────────────────────────────────── */
  vec3 bg = vec3(1.0);
  color = mix(bg, color, mask);

  gl_FragColor = vec4(color, 1.0);
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
