/**
 * FluidRibbon — Diagonal ocean waves with Hokusai-style foam crests
 *
 * Inspired by Japanese ukiyo-e wave aesthetics (The Great Wave off Kanagawa):
 *   • DIAGONAL flow direction — waves crash from upper-right to lower-left
 *   • WHITE FOAM crests like blooming roses / cotton clouds on wave tops
 *   • SPARKLE highlights — light catches foam like scattered pearls/diamonds
 *   • LAYERED depth — multiple waves stacked, async swelling motion
 *   • SMOOTH gradient base — colour zones flow like musical notes
 *
 * 三大設計面向 (3 design dimensions):
 *
 * 形態 (Form):
 *   - 波峰白色泡沫 (Gaussian highlights, varying width per wave)
 *   - 波下色彩漸層 (5-layer brand palette: lavender→amber→orange→coral→purple)
 *   - 對角線排列 (rotated UV gives diagonal wave direction)
 *
 * 動向 (Motion):
 *   - 多速度疊加 (each wave layer has unique speed/phase — async swell)
 *   - 連綿翻騰 (multi-octave sine for organic non-repeating wave shapes)
 *   - 緩慢流暢 (overall slow motion — never frantic)
 *
 * 光影 (Light/Shadow):
 *   - 浪頭白色高光 (bright Gaussian on each wave crest)
 *   - 浪下陰影 (subtle shadow under each crest for 3D depth)
 *   - 晶瑩閃爍 (cell-based sparkle pattern within foam areas)
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

void main() {
  vec2  uv = v_uv;
  /* Flip Y so 0=top (sky), 1=bottom (depths) — ocean metaphor              */
  uv.y = 1.0 - uv.y;
  float t  = u_time;

  /* ─────────────────────────────────────────────────────────────────────
     DIAGONAL ROTATION — waves flow diagonally (upper-right → lower-left)
     Same direction as Stripe's silk, but applied to wave layers.
     After rotation, wuv.x = "along wave length", wuv.y = "across waves".
     ───────────────────────────────────────────────────────────────────── */
  float angle = 0.32;                              /* ~18° rotation        */
  float ca    = cos(angle), sa = sin(angle);
  vec2  c     = uv - vec2(0.5, 0.5);
  vec2  wuv;
  wuv.x = c.x *  ca + c.y * sa + 0.5;
  wuv.y = -c.x * sa + c.y * ca + 0.5;

  /* ─────────────────────────────────────────────────────────────────────
     WAVE LAYERS — 5 stacked horizontal-ish waves in rotated space
     Multi-octave sine for organic curves (low+mid+high freq).
     Each wave has unique speed/phase for async motion.
     ───────────────────────────────────────────────────────────────────── */
  float w1 = 0.12
           + sin(wuv.x * 3.2 + t * 0.34) * 0.028
           + sin(wuv.x * 6.5 + t * 0.48 + 1.7) * 0.014
           + sin(wuv.x * 11.0 + t * 0.65 + 3.4) * 0.005;

  float w2 = 0.30
           + sin(wuv.x * 2.8 + t * 0.40 + 0.8) * 0.042
           + sin(wuv.x * 5.7 + t * 0.55 + 2.1) * 0.020
           + sin(wuv.x * 10.0 + t * 0.70 + 4.0) * 0.008;

  float w3 = 0.50
           + sin(wuv.x * 2.4 + t * 0.36 + 1.6) * 0.058
           + sin(wuv.x * 4.9 + t * 0.50 + 2.8) * 0.025
           + sin(wuv.x * 8.8 + t * 0.62 + 4.9) * 0.010;

  float w4 = 0.71
           + sin(wuv.x * 2.0 + t * 0.42 + 2.4) * 0.065
           + sin(wuv.x * 4.3 + t * 0.52 + 3.6) * 0.028
           + sin(wuv.x * 8.0 + t * 0.66 + 5.7) * 0.011;

  float w5 = 0.89
           + sin(wuv.x * 1.6 + t * 0.46 + 3.0) * 0.040
           + sin(wuv.x * 3.6 + t * 0.58 + 4.3) * 0.018;

  /* ─────────────────────────────────────────────────────────────────────
     COLOUR LAYERS — ocean depth metaphor with brand palette
     ───────────────────────────────────────────────────────────────────── */
  vec3 c_sky    = vec3(1.000, 1.000, 1.000);     /* sky / above water     */
  vec3 c_mist   = vec3(0.770, 0.825, 0.985);     /* lavender mist         */
  vec3 c_sunset = vec3(0.995, 0.760, 0.310);     /* amber horizon         */
  vec3 c_wave   = vec3(0.955, 0.560, 0.080);     /* warm orange swell     */
  vec3 c_deep   = vec3(0.945, 0.460, 0.560);     /* coral deep water      */
  vec3 c_abyss  = vec3(0.380, 0.220, 0.985);     /* vivid purple abyss    */

  float e = 0.014;
  vec3 col = c_sky;
  col = mix(col, c_mist,   smoothstep(w1 - e, w1 + e, wuv.y));
  col = mix(col, c_sunset, smoothstep(w2 - e, w2 + e, wuv.y));
  col = mix(col, c_wave,   smoothstep(w3 - e, w3 + e, wuv.y));
  col = mix(col, c_deep,   smoothstep(w4 - e, w4 + e, wuv.y));
  col = mix(col, c_abyss,  smoothstep(w5 - e, w5 + e, wuv.y));

  /* ─────────────────────────────────────────────────────────────────────
     WHITE FOAM CRESTS — Hokusai-style fluffy white wave tops
     Bright Gaussian on each wave's upper edge. Per-wave intensity varies
     so foam looks natural (some waves "splash" more than others).
     ───────────────────────────────────────────────────────────────────── */
  float foam = 0.0;
  /* Width of foam band: vary slightly with x for organic ripples         */
  float foamWidth = 0.011 + sin(wuv.x * 9.0 + t * 0.4) * 0.003;

  /* Foam strength per layer (deeper waves have less foam)                 */
  foam += exp(-pow((wuv.y - w1 + 0.002) / foamWidth, 2.0)) * 0.55;
  foam += exp(-pow((wuv.y - w2 + 0.002) / foamWidth, 2.0)) * 0.75;
  foam += exp(-pow((wuv.y - w3 + 0.003) / foamWidth, 2.0)) * 0.85;
  foam += exp(-pow((wuv.y - w4 + 0.003) / foamWidth, 2.0)) * 0.70;
  foam += exp(-pow((wuv.y - w5 + 0.002) / foamWidth, 2.0)) * 0.50;

  /* Make foam look fluffy: add organic noise variation                    */
  float foamNoise = h2(floor(wuv * 40.0) + floor(t * 2.5));
  foam *= 0.75 + foamNoise * 0.35;

  /* Apply white foam                                                       */
  col = mix(col, vec3(1.0), foam * 0.85);

  /* ─────────────────────────────────────────────────────────────────────
     SPARKLE PEARLS — tiny bright cells within foam areas
     Cell-based: each grid cell may or may not "sparkle" at any moment.
     Slow twinkling so it doesn't feel frantic.
     ───────────────────────────────────────────────────────────────────── */
  vec2  sparkleGrid = floor(wuv * vec2(120.0, 80.0));
  float sparkleTime = floor(t * 1.2);
  float sparkleRand = h2(sparkleGrid + sparkleTime * 0.13);
  float sparkleVal  = h2(sparkleGrid + sparkleTime * 0.31);
  /* Only top 4% of cells sparkle, and only inside foam zones              */
  float sparkle     = step(0.96, sparkleRand) * sparkleVal;
  /* Spatial fade within cell (so sparkle is a soft dot, not block)        */
  vec2  cellLocal   = fract(wuv * vec2(120.0, 80.0)) - 0.5;
  float cellFalloff = 1.0 - smoothstep(0.0, 0.5, length(cellLocal));
  sparkle *= cellFalloff;
  /* Multiply by foam mask: sparkles only on foam                          */
  float foamMask = clamp(foam, 0.0, 1.0);
  col += vec3(1.4, 1.4, 1.5) * sparkle * foamMask * 0.9;

  /* ─────────────────────────────────────────────────────────────────────
     UNDERWAVE SHADOW — subtle darkening just below each foam crest
     Adds 3D depth so waves don't look flat.
     ───────────────────────────────────────────────────────────────────── */
  float shadow = 0.0;
  shadow += exp(-pow((wuv.y - w2 - 0.018) / 0.014, 2.0)) * 0.08;
  shadow += exp(-pow((wuv.y - w3 - 0.020) / 0.016, 2.0)) * 0.10;
  shadow += exp(-pow((wuv.y - w4 - 0.020) / 0.016, 2.0)) * 0.10;
  col *= 1.0 - shadow;

  /* ─────────────────────────────────────────────────────────────────────
     GLOBAL LIGHTING — gentle gradient (sky brighter, depths darker)
     ───────────────────────────────────────────────────────────────────── */
  col *= 0.94 + (1.0 - wuv.y) * 0.10;

  /* ─────────────────────────────────────────────────────────────────────
     CANVAS MASK — soft asymmetric fade
     Use ORIGINAL uv (not flipped) for top/bottom canvas fades.
     ───────────────────────────────────────────────────────────────────── */
  float origY    = v_uv.y;
  float leftFade = smoothstep(0.0, 0.28, v_uv.x);
  float topFade  = smoothstep(0.0, 0.04, origY);
  float botFade  = smoothstep(1.0, 0.94, origY);
  float mask     = leftFade * topFade * botFade;

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
