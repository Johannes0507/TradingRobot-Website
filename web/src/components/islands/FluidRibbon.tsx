/**
 * FluidRibbon — Brand-gradient base with petal-texture overlay
 *
 * Multi-layer composition:
 *   1. BASE — designer-grade brand gradient (purple → coral → amber)
 *      Cool tint anchors with page, warm corner toward viewport edge.
 *   2. PETAL OVERLAY — radial petal pattern from upper-right focal point
 *      5 petals radiating, soft translucent edges, like an open bloom.
 *   3. PETAL VEINS — subtle striations within petals (delicate texture)
 *   4. FLOWING MOTION — slow rotation + organic warp for life
 *
 * Visual reference: blooming flower seen from above, captured in our
 * exact brand palette. The petals are SOFT and TRANSLUCENT, not opaque
 * shapes — they enhance the gradient, not overwrite it.
 *
 * Brand colors (from design tokens):
 *   --color-bg-tint  #f7f9fc  (page anchor)
 *   --color-brand    #635bff  (primary purple, dominant)
 *   --color-coral    #fb7185  (warm transition)
 *   --color-amber    #f59e0b  (warm accent)
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

const float PI = 3.14159265359;

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
     STEP 1 — BASE DIAGONAL GRADIENT (brand palette)
     Same direction as the headline gradient for visual coherence.
     ───────────────────────────────────────────────────────────────────── */
  float diag = uv.x * 0.92 - uv.y * 0.38 + 0.30;

  /* Multi-octave organic warp */
  float warp_l = fbm(vec2(uv.x * 1.0, uv.y * 1.3 + t * 0.04)) * 0.18;
  float warp_m = fbm(vec2(uv.x * 2.6, uv.y * 3.0 + t * 0.025)) * 0.07;
  float field  = diag + warp_l + warp_m + sin(t * 0.05) * 0.03;

  /* Brand palette with tonal variations */
  vec3 c_tint        = vec3(0.969, 0.976, 0.988);
  vec3 c_brand_pale  = vec3(0.878, 0.878, 1.000);
  vec3 c_brand       = vec3(0.388, 0.357, 1.000);
  vec3 c_brand_deep  = vec3(0.290, 0.235, 0.900);
  vec3 c_coral       = vec3(0.984, 0.443, 0.522);
  vec3 c_amber       = vec3(0.961, 0.620, 0.043);
  vec3 c_amber_pale  = vec3(1.000, 0.851, 0.490);

  vec3 col = c_tint;
  col = mix(col, c_brand_pale, smoothstep(0.05, 0.20, field));
  col = mix(col, c_brand,      smoothstep(0.20, 0.42, field));
  col = mix(col, c_brand_deep, smoothstep(0.42, 0.55, field));
  col = mix(col, c_coral,      smoothstep(0.55, 0.72, field));
  col = mix(col, c_amber,      smoothstep(0.72, 0.88, field));
  col = mix(col, c_amber_pale, smoothstep(0.88, 1.05, field));

  /* ─────────────────────────────────────────────────────────────────────
     STEP 2 — PETAL RADIAL FIELD
     Focal point upper-right (off-canvas). 5 petals radiate inward.
     ───────────────────────────────────────────────────────────────────── */
  vec2  focal   = vec2(1.05, -0.05);
  vec2  d       = uv - focal;
  float r       = length(d);
  float theta   = atan(d.y, d.x);

  /* Slow rotation + organic angular warp                                  */
  float wobble  = fbm(vec2(theta * 1.5, r * 1.8 + t * 0.06)) * 0.30;
  float theta2  = theta + t * 0.04 + wobble;

  /* Petal modulation: n petals around full circle                         */
  float n_petals = 5.0;
  float petals   = cos(theta2 * n_petals);
  petals         = pow(max(petals, 0.0), 1.4);    /* sharpen peaks slightly */

  /* Radial envelope: petals strongest at moderate distance, fade at tip   */
  float radial = smoothstep(0.1, 0.55, r) * smoothstep(1.30, 0.75, r);

  float petalField = petals * radial;

  /* ─────────────────────────────────────────────────────────────────────
     STEP 3 — APPLY PETAL HIGHLIGHTS
     Soft translucent overlay — petals lighten and slightly warm the base.
     Multiply blending preserves the brand gradient underneath.
     ───────────────────────────────────────────────────────────────────── */
  /* Inner petal tone: warm cream */
  vec3 petalInner = vec3(1.000, 0.965, 0.910);
  col = mix(col, petalInner, petalField * 0.35);

  /* Outer petal tint: slight pink warmth at petal edges                   */
  float petalEdge = (1.0 - petals) * radial * smoothstep(0.8, 1.2, r);
  col = mix(col, c_coral * 1.05, petalEdge * 0.10);

  /* ─────────────────────────────────────────────────────────────────────
     STEP 4 — PETAL VEINS
     Delicate radial striations within petals — like flower veins.
     ───────────────────────────────────────────────────────────────────── */
  float veinPhase = theta * n_petals * 3.0 + r * 8.0;
  float vein      = sin(veinPhase) * 0.5 + 0.5;
  vein            = pow(vein, 4.0);
  /* Only show veins within petal areas                                    */
  vein *= petalField;
  col *= 1.0 + vein * 0.06;

  /* ─────────────────────────────────────────────────────────────────────
     STEP 5 — SUBTLE ROTATIONAL SHIMMER
     Adds gentle "breath" — petal field slightly pulsates over time.
     ───────────────────────────────────────────────────────────────────── */
  float breath = sin(t * 0.18) * 0.04 + 1.0;
  col = mix(col, col * breath, petalField * 0.3);

  /* ─────────────────────────────────────────────────────────────────────
     STEP 6 — CANVAS MASK (soft asymmetric)
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
    let running = false;
    let pausedElapsed = 0;
    let lastStart = performance.now();

    function tick() {
      const elapsed = reduceMotion ? 0
        : pausedElapsed + ((performance.now() - lastStart) / 1000) * speed;
      gl!.uniform1f(uTime, elapsed);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (running) return;
      running = true;
      lastStart = performance.now();
      tick();
    }
    function stopLoop() {
      if (!running) return;
      running = false;
      pausedElapsed += ((performance.now() - lastStart) / 1000) * speed;
      cancelAnimationFrame(raf);
    }

    /* Pause animation when hero is off-screen (saves CPU/GPU/battery) */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) startLoop();
          else stopLoop();
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    /* Also pause when tab hidden */
    function onVisibility() {
      if (document.hidden) stopLoop();
      else if (canvas!.getBoundingClientRect().bottom > 0) startLoop();
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteBuffer(buf); gl.deleteProgram(prog);
    };
  }, [speed]);

  return <canvas ref={canvasRef} className={className} style={{ display:'block', width:'100%', height:'100%', ...style }} />;
}
