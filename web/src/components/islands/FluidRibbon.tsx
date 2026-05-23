/**
 * FluidRibbon — Ocean Wave Layers
 *
 * Inspired by the best ocean wave designs in the market (Apple liquid waves,
 * Spotify-wrapped flowing colour waves, Klint Finley wave shaders).
 *
 * Concept: 5 horizontal wave layers stacked vertically — like looking at
 * the sea from above. Each layer has its own colour from our brand palette,
 * with subtle highlights on the wave crests (light catching foam).
 *
 * Design pillars:
 *   • 質感 (texture)     — multi-octave sine waves give organic curves
 *   • 光影 (light/shadow) — Gaussian highlights on wave crests
 *   • 動向 (motion)       — slow horizontal flow at varying speeds per layer
 *   • 美感 (aesthetic)    — smooth gradient blends, soft mask fade
 *
 * Colour stack (top → bottom = sky → ocean depths):
 *   sky:      pale white
 *   mist:     lavender
 *   sunset:   amber
 *   wave:     warm orange
 *   deep:     coral
 *   abyss:    vivid purple
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

void main() {
  vec2  uv = v_uv;
  /* Flip Y so 0=top (sky), 1=bottom (deep ocean) — matches ocean metaphor */
  uv.y = 1.0 - uv.y;
  float t  = u_time;

  /* ─────────────────────────────────────────────────────────────────────
     WAVE LAYERS — multi-octave sin/cos for organic curves
     Each wave's Y position = base + sum of sine waves at varying freq/phase.
     Slower frequencies create the BIG SHAPE; higher frequencies add DETAIL.
     Per-layer time phases differ so layers swell asynchronously (natural).
     ───────────────────────────────────────────────────────────────────── */

  /* Wave 1 (uppermost: sky→mist) — gentle, high frequency */
  float w1 = 0.12
           + sin(uv.x * 2.8 + t * 0.32) * 0.025
           + sin(uv.x * 6.2 + t * 0.45 + 1.7) * 0.014
           + sin(uv.x * 11.0 + t * 0.60 + 3.4) * 0.005;

  /* Wave 2 (mist→sunset) — medium amplitude */
  float w2 = 0.30
           + sin(uv.x * 2.4 + t * 0.36 + 0.9) * 0.038
           + sin(uv.x * 5.3 + t * 0.50 + 2.2) * 0.018
           + sin(uv.x * 9.8 + t * 0.65 + 4.1) * 0.007;

  /* Wave 3 (sunset→warm orange) — larger waves */
  float w3 = 0.50
           + sin(uv.x * 2.0 + t * 0.30 + 1.8) * 0.055
           + sin(uv.x * 4.7 + t * 0.42 + 3.0) * 0.022
           + sin(uv.x * 8.5 + t * 0.55 + 5.0) * 0.009;

  /* Wave 4 (warm→deep coral) — broad swells */
  float w4 = 0.71
           + sin(uv.x * 1.7 + t * 0.34 + 2.5) * 0.062
           + sin(uv.x * 4.1 + t * 0.46 + 3.7) * 0.026
           + sin(uv.x * 7.8 + t * 0.58 + 5.8) * 0.010;

  /* Wave 5 (deep→abyss) — slowest, deepest */
  float w5 = 0.89
           + sin(uv.x * 1.4 + t * 0.40 + 3.2) * 0.038
           + sin(uv.x * 3.5 + t * 0.50 + 4.5) * 0.017;

  /* ─────────────────────────────────────────────────────────────────────
     COLOUR PALETTE — brand colours mapped to ocean depth metaphor
     ───────────────────────────────────────────────────────────────────── */
  vec3 c_sky    = vec3(1.000, 1.000, 1.000);
  vec3 c_mist   = vec3(0.760, 0.815, 0.985);   /* pale lavender mist     */
  vec3 c_sunset = vec3(0.995, 0.760, 0.310);   /* amber sunset           */
  vec3 c_wave   = vec3(0.955, 0.560, 0.080);   /* warm orange wave       */
  vec3 c_deep   = vec3(0.945, 0.460, 0.560);   /* coral depth            */
  vec3 c_abyss  = vec3(0.380, 0.220, 0.985);   /* vivid purple abyss     */

  /* ─────────────────────────────────────────────────────────────────────
     LAYER BLENDING — smooth transitions, no hard edges
     Each smoothstep transitions a small band around the wave Y position.
     ───────────────────────────────────────────────────────────────────── */
  float e = 0.014;
  vec3 col = c_sky;
  col = mix(col, c_mist,   smoothstep(w1 - e, w1 + e, uv.y));
  col = mix(col, c_sunset, smoothstep(w2 - e, w2 + e, uv.y));
  col = mix(col, c_wave,   smoothstep(w3 - e, w3 + e, uv.y));
  col = mix(col, c_deep,   smoothstep(w4 - e, w4 + e, uv.y));
  col = mix(col, c_abyss,  smoothstep(w5 - e, w5 + e, uv.y));

  /* ─────────────────────────────────────────────────────────────────────
     LIGHT HIGHLIGHTS — bright Gaussian on each wave crest
     Light catches the top edge of each wave like foam catching sunlight.
     Different intensities per wave: stronger on dominant waves.
     ───────────────────────────────────────────────────────────────────── */
  float light = 0.0;
  light += exp(-pow((uv.y - w1 + 0.004) / 0.009, 2.0)) * 0.18;
  light += exp(-pow((uv.y - w2 + 0.004) / 0.010, 2.0)) * 0.22;
  light += exp(-pow((uv.y - w3 + 0.004) / 0.012, 2.0)) * 0.26;
  light += exp(-pow((uv.y - w4 + 0.005) / 0.012, 2.0)) * 0.22;
  light += exp(-pow((uv.y - w5 + 0.004) / 0.010, 2.0)) * 0.16;
  col = mix(col, vec3(1.0), light);

  /* ─────────────────────────────────────────────────────────────────────
     DEPTH SHADOW — subtle darkening below each wave (under-curve shadow)
     Creates 3D depth feel on the wave underside.
     ───────────────────────────────────────────────────────────────────── */
  float shadow = 0.0;
  shadow += exp(-pow((uv.y - w2 - 0.012) / 0.012, 2.0)) * 0.10;
  shadow += exp(-pow((uv.y - w3 - 0.014) / 0.014, 2.0)) * 0.10;
  shadow += exp(-pow((uv.y - w4 - 0.014) / 0.014, 2.0)) * 0.10;
  col *= 1.0 - shadow;

  /* ─────────────────────────────────────────────────────────────────────
     SUBTLE LIGHT GRADIENT — overall lighting from upper-left
     Top of canvas slightly brighter, bottom slightly cooler.
     ───────────────────────────────────────────────────────────────────── */
  col *= 0.95 + (1.0 - uv.y) * 0.08;

  /* ─────────────────────────────────────────────────────────────────────
     CANVAS MASK — soft fades at edges
       • Left edge: gradual fade from canvas left (where text is) into colour
       • Top: very small fade (animation goes to top edge for full bleed)
       • Bottom: small fade
     ───────────────────────────────────────────────────────────────────── */
  /* Mask uses ORIGINAL uv.y (before flip) for top/bottom — use v_uv.y    */
  float origY    = v_uv.y;
  float leftFade = smoothstep(0.0, 0.32, uv.x);
  float topFade  = smoothstep(0.0, 0.04, origY);
  float botFade  = smoothstep(1.0, 0.94, origY);
  float mask     = leftFade * topFade * botFade;

  /* ── Composite ──────────────────────────────────────────────────────── */
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
