/**
 * FluidRibbon — Refined silk: smooth gradient + fine fibre texture
 *
 * Stripe's silk has SMOOTH COLOUR ZONES (not discrete panels) but stays
 * within a specific palette (no rainbow cycling). This implementation:
 *
 *   1. Wide colour bands with VERY soft transitions (no hard panel edges)
 *   2. Each band has internal subtle gradient via noise modulation
 *   3. Sparse, delicate white silk fold lines (only 1-2 prominent)
 *   4. Fine anisotropic silk thread texture along silk length
 *   5. Curved silhouette evoking gathered silk drape
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
#extension GL_OES_standard_derivatives : enable
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

  /* ── Silk frame: rotated to align with Stripe's diagonal ────────────── */
  vec2  centre = vec2(0.65, 0.32);
  vec2  c      = uv - centre;
  float angle  = -0.28;
  float ca     = cos(angle), sa = sin(angle);
  vec2  silkUV = vec2(c.x * ca + c.y * sa, -c.x * sa + c.y * ca);
  float yt     = silkUV.y + 0.5;

  /* ── Centerline with organic sway ─────────────────────────────────── */
  float sway = sin(yt * 1.5 + t * 0.10) * 0.030
             + (fbm(vec2(yt * 1.2, t * 0.07))) * 0.045;

  /* ── Multi-scale noise warp on silk's WIDTH coordinate ─────────────── */
  float warp_l = fbm(vec2(silkUV.x * 1.0, yt * 1.3 + t * 0.06)) * 0.16;
  float warp_m = fbm(vec2(silkUV.x * 3.5 + 7.1, yt * 2.5 + t * 0.04)) * 0.05;

  /* ── Tapering width ──────────────────────────────────────────────── */
  float halfW   = mix(0.62, 0.30, smoothstep(0.20, 0.85, yt));
  float across  = (silkUV.x - sway + warp_l + warp_m) / halfW;
  float localX  = (across + 1.0) * 0.5;

  /* ── Twist phase with higher frequency for richer band variation ────── */
  float twistNoise = fbm(vec2(silkUV.x * 1.4 + 3.0, yt * 1.5 + t * 0.08)) * 1.10;
  float twistPhase = yt * 4.20 + twistNoise + t * 0.30;
  float twist      = sin(twistPhase) * 0.48;
  float colorPos   = clamp(localX + twist, 0.0, 1.0);

  /* ── Colour palette (sampled from video) ────────────────────────────── */
  vec3 c_lavender = vec3(0.745, 0.800, 0.988);   /* rgb(190,204,252) */
  vec3 c_amber    = vec3(0.985, 0.700, 0.250);   /* rgb(251,178, 64) */
  vec3 c_orange   = vec3(0.945, 0.565, 0.082);   /* rgb(241,144, 21) */
  vec3 c_coral    = vec3(0.941, 0.451, 0.549);   /* rgb(240,115,140) */
  vec3 c_vivid_p  = vec3(0.314, 0.153, 0.969);   /* rgb( 80, 39,247) */

  /* ── 7-stop palette: lavender → orange → coral → lavender → vivid_p
     creates alternating warm/cool bands (Stripe's signature pattern)     */
  float w = 0.040;
  vec3 col = c_lavender;
  col = mix(col, c_amber,    smoothstep(0.08 - w, 0.08 + w, colorPos));
  col = mix(col, c_orange,   smoothstep(0.18 - w, 0.18 + w, colorPos));
  col = mix(col, c_coral,    smoothstep(0.48 - w, 0.48 + w, colorPos));
  col = mix(col, c_lavender, smoothstep(0.62 - w, 0.62 + w, colorPos));   /* back to lavender */
  col = mix(col, c_orange,   smoothstep(0.72 - w, 0.72 + w, colorPos));   /* warm again */
  col = mix(col, c_vivid_p,  smoothstep(0.88 - w, 0.88 + w, colorPos));

  /* ── Internal subtle variation: prevents each zone from being flat ─── */
  /* Apply a brightness/saturation modulation based on fine noise          */
  float subtle = fbm(vec2(silkUV.x * 6.0, silkUV.y * 8.0 + t * 0.05)) * 0.16;
  col *= 1.0 + subtle;

  /* ── Fine silk fibre — runs ALONG silk's length (sin in y dir) ──────
     Very subtle so it doesn't dominate.                                  */
  float fibre = sin(silkUV.y * 180.0 + warp_l * 25.0) * 0.5 + 0.5;
  fibre = pow(fibre, 2.0) * 0.06;
  col *= 1.0 + fibre;

  /* ── Sparse fold lines at the multi-band transitions ────────────── */
  float fold = 0.0;
  fold = max(fold, exp(-pow((colorPos - 0.18) / 0.010, 2.0)) * 0.50);
  fold = max(fold, exp(-pow((colorPos - 0.48) / 0.010, 2.0)) * 0.65);
  fold = max(fold, exp(-pow((colorPos - 0.62) / 0.010, 2.0)) * 0.55);
  fold = max(fold, exp(-pow((colorPos - 0.88) / 0.010, 2.0)) * 0.70);
  fold *= 1.0 - smoothstep(0.55, 0.85, abs(across));
  col = mix(col, vec3(1.0), fold * 0.65);

  /* ── Silk depth shading — cos(twistPhase) simulates front/back face ─── */
  float facing = cos(twistPhase) * 0.5 + 0.5;
  col *= 0.90 + facing * 0.12;

  /* ── 3D depth: brighter near silk centerline (face-on) ───────────── */
  float depth = 1.0 - abs(across);
  col *= 0.92 + smoothstep(0.0, 0.7, depth) * 0.10;

  /* ── Silk silhouette: SOFT elliptical mask + soft edge fade ─────── */
  /* Edge of silk fades smoothly (no hard cutoff)                       */
  float edgeMask = smoothstep(1.05, 0.55, abs(across));
  /* Combine with top/bottom fades                                       */
  float topFade  = smoothstep(0.0, 0.05, uv.y);
  float botFade  = smoothstep(1.0, 0.92, uv.y);
  float mask     = edgeMask * topFade * botFade;

  /* ── Composite with white background ────────────────────────────── */
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
    gl.getExtension('OES_standard_derivatives');

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
