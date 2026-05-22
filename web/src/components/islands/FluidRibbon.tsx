/**
 * FluidRibbon — Stripe-style diagonal panel hero animation
 *
 * Three large overlapping silk panels (purple → coral → orange) separated
 * by slowly oscillating diagonal boundaries, matching the visual style of
 * stripe.com's hero. Pure WebGL fragment shader, zero dependencies.
 *
 * Architecture:
 *   - Gradient axis ~22° from horizontal creates "/"-oriented panel seams
 *   - Value-noise warp adds organic boundary variation
 *   - Left-edge fade merges canvas into white page background
 *   - Thin white ribbon highlight cuts across the purple boundary
 *   - All motion < 0.5 Hz, amplitude < 4% — perceptually "barely moving"
 *   - prefers-reduced-motion: animation frozen at t=0 (panels still visible)
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

/* ---- 2D smooth value noise -------------------------------------------- */
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i),           h2(i + vec2(1.0, 0.0)), f.x),
             mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2  uv = v_uv;
  float t  = u_time * 0.065;        /* very slow — ~14s full oscillation */

  /* ── Stripe palette ─────────────────────────────────────────────────── */
  vec3 bg     = vec3(1.000, 1.000, 1.000);
  vec3 purple = vec3(0.610, 0.540, 0.980);   /* blue-purple  */
  vec3 coral  = vec3(0.965, 0.590, 0.625);   /* warm coral   */
  vec3 orange = vec3(0.990, 0.720, 0.360);   /* warm orange  */

  /* ── Gradient axis: ~22° from horizontal ───────────────────────────── */
  /* Creates diagonal panel seams that go from lower-left → upper-right.  */
  /* Upper-left canvas area → purple. Lower-right area → orange.          */
  float ang = 0.38
            + sin(t * 0.37) * 0.038
            + sin(t * 0.91 + 1.10) * 0.012;
  float ca = cos(ang), sa = sin(ang);

  /* Organic warp: subtly distorts panel boundaries for non-mechanical feel */
  float warp = (vn(uv * 2.8 + vec2(t * 0.11, t * 0.07)) - 0.5) * 0.042;
  float pos  = uv.x * ca + uv.y * sa + warp;

  /* ── Panel boundary positions ──────────────────────────────────────── */
  float b1 = 0.395 + sin(t * 0.48)        * 0.022
                   + sin(t * 0.29 + 0.70) * 0.010;   /* purple → coral  */
  float b2 = 0.655 + sin(t * 0.41 + 1.20) * 0.020
                   + sin(t * 0.35 + 2.10) * 0.010;   /* coral  → orange */
  float edg = 0.015;

  float z1  = smoothstep(b1 - edg, b1 + edg, pos);  /* 0=purple, 1=coral+ */
  float z2  = smoothstep(b2 - edg, b2 + edg, pos);  /* 0=...coral, 1=orange */

  vec3 col  = mix(purple, coral,  z1);
  col       = mix(col,    orange, z2);

  /* ── Silk sheen: subtle luminance variation across each panel ───────── */
  float sheen = vn(uv * 5.5 + vec2(t * 0.06)) * 0.5 + 0.5;
  col *= 0.97 + sheen * 0.06;

  /* ── Left-edge fade: canvas blends into white page background ──────── */
  float leftFade = smoothstep(0.0, 0.32, uv.x - uv.y * 0.06);
  col = mix(bg, col, leftFade);

  /* ── Top / bottom edge fades ─────────────────────────────────────────── */
  float topFade = smoothstep(0.0,  0.07, uv.y);
  float botFade = smoothstep(1.0,  0.88, uv.y);
  col = mix(bg, col, topFade * botFade);

  /* ── White highlight ribbon ─────────────────────────────────────────── */
  /* Thin bright line near the left boundary of the colored area, matching */
  /* the highlight stripe visible on stripe.com's hero.                    */
  float rAng = 0.32 + sin(t * 0.78) * 0.045 + sin(t * 1.10 + 0.6) * 0.012;
  float rPos = uv.x * cos(rAng) + uv.y * sin(rAng);
  float rCtr = 0.155 + sin(t * 0.62) * 0.018;
  float rHW  = 0.0115 + sin(t * 0.53) * 0.002;
  float rib  = smoothstep(rHW + 0.007, rHW - 0.007, abs(rPos - rCtr));
  /* Fade ribbon at top edge and left edge to avoid harsh termination */
  rib *= smoothstep(0.0, 0.10, uv.y) * smoothstep(0.0, 0.18, uv.x);
  col  = mix(col, bg, rib * 0.88);

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
  /** Animation speed multiplier (1.0 = default "barely moving") */
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
