/**
 * FluidRibbon — Refined layered gradient washes
 *
 * Color hierarchy aligned to LendAuto's design tokens:
 *   --color-brand: #635bff  (primary purple — premium trust)
 *   --color-coral: #fb7185  (warm coral — friendly)
 *   --color-amber: #f59e0b  (warm amber — reliable)
 *   --color-bg-tint: #f7f9fc (cool-leaning page tint)
 *
 * Same `from-brand via-coral to-amber` gradient as the headline's
 * "24×60×60 秒" accent text — visual coherence across the hero.
 *
 * Design philosophy (designer-grade restraint):
 *   • LIMITED PALETTE — only brand colours, no random hues
 *   • TONAL VARIATIONS — each colour has light/mid/dark via shade shifts
 *   • HIERARCHICAL — purple dominant, amber accent, coral as bridge
 *   • SOFT TRANSITIONS — no hard edges, only smoothstep blends
 *   • COMPOSITION — diagonal axis matches the headline gradient direction
 *   • RESTRAINED MOTION — slow position drift, never flashy
 *
 * The result reads as a sophisticated abstract — not a Stripe knock-off,
 * not a literal wave, just refined colour washes echoing the brand.
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
  for (int i = 0; i < 4; i++) {
    v += a * (vn(p) - 0.5);
    p = p * 2.05 + 11.7;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2  uv = v_uv;
  float t  = u_time;

  /* ─────────────────────────────────────────────────────────────────────
     DIAGONAL GRADIENT AXIS
     Matches the headline's bg-gradient-to-r → diagonal direction creates
     visual rhyme between hero text and animation.
     ───────────────────────────────────────────────────────────────────── */
  float diag = uv.x * 0.92 - uv.y * 0.38 + 0.30;     /* tilted right-down */

  /* Add organic warp so the gradient layers curve slightly (not straight) */
  float warp_l = fbm(vec2(uv.x * 1.2, uv.y * 1.4 + t * 0.05)) * 0.18;
  float warp_m = fbm(vec2(uv.x * 3.0, uv.y * 3.5 + t * 0.03)) * 0.06;
  float field  = diag + warp_l + warp_m + sin(t * 0.06) * 0.04;

  /* ─────────────────────────────────────────────────────────────────────
     BRAND PALETTE — exact token colours, with tonal variations
     Each anchor colour has a "light tint" and "deep shade" for richness.
     ───────────────────────────────────────────────────────────────────── */
  vec3 c_tint        = vec3(0.969, 0.976, 0.988);    /* #f7f9fc bg-tint    */
  vec3 c_brand_pale  = vec3(0.878, 0.878, 1.000);    /* light purple tint  */
  vec3 c_brand       = vec3(0.388, 0.357, 1.000);    /* #635bff brand     */
  vec3 c_brand_deep  = vec3(0.290, 0.235, 0.900);    /* deeper purple     */
  vec3 c_coral       = vec3(0.984, 0.443, 0.522);    /* #fb7185 coral     */
  vec3 c_amber       = vec3(0.961, 0.620, 0.043);    /* #f59e0b amber     */
  vec3 c_amber_pale  = vec3(1.000, 0.851, 0.490);    /* light amber       */

  /* ─────────────────────────────────────────────────────────────────────
     LAYERED GRADIENT — multi-stop blend along diagonal field
     Composition (left/top → right/bottom):
       1. cool bg-tint   (anchors with the page background)
       2. light purple   (gentle introduction of brand)
       3. brand purple   (dominant zone)
       4. brand deep     (richest brand moment)
       5. coral          (warm transition)
       6. amber          (warm accent)
       7. light amber    (soft exit toward page edge)
     ───────────────────────────────────────────────────────────────────── */
  vec3 col = c_tint;
  col = mix(col, c_brand_pale, smoothstep(0.05, 0.20, field));
  col = mix(col, c_brand,      smoothstep(0.20, 0.42, field));
  col = mix(col, c_brand_deep, smoothstep(0.42, 0.55, field));
  col = mix(col, c_coral,      smoothstep(0.55, 0.72, field));
  col = mix(col, c_amber,      smoothstep(0.72, 0.88, field));
  col = mix(col, c_amber_pale, smoothstep(0.88, 1.05, field));

  /* ─────────────────────────────────────────────────────────────────────
     SECONDARY GRADIENT — overlapping wash adds depth (Rothko-like)
     A second wash in a different direction creates rich tonal blending.
     ───────────────────────────────────────────────────────────────────── */
  float field2 = uv.y * 0.6 + uv.x * 0.2 - 0.10
               + fbm(vec2(uv.x * 0.8, uv.y * 1.0 + t * 0.04)) * 0.12;

  /* Multiply a subtle warm overlay (amber) where field2 > 0.5             */
  float warmOverlay = smoothstep(0.50, 0.80, field2) * 0.18;
  col = mix(col, col * vec3(1.05, 0.96, 0.88), warmOverlay);

  /* Multiply a subtle cool overlay (purple) where field2 < 0.5            */
  float coolOverlay = smoothstep(0.50, 0.20, field2) * 0.12;
  col = mix(col, col * vec3(0.92, 0.94, 1.05), coolOverlay);

  /* ─────────────────────────────────────────────────────────────────────
     CANVAS MASK — soft asymmetric fade
     Gathered upper-right, soft drape to lower-left.
     ───────────────────────────────────────────────────────────────────── */
  float leftFade = smoothstep(0.0, 0.32, uv.x);
  float diagFade = smoothstep(-0.05, 0.55, uv.x - (1.0 - uv.y) * 0.28);
  float topFade  = smoothstep(0.0, 0.04, uv.y);
  float botFade  = smoothstep(1.0, 0.94, uv.y);
  float mask     = leftFade * diagFade * topFade * botFade;

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
