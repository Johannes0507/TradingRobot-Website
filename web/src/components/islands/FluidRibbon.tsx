/**
 * FluidRibbon — Clean brand-gradient washes
 *
 * Pure smooth multi-stop gradient aligned to design tokens.
 * No discrete shapes, no petal overlays, no specular crests.
 * Just colour fields flowing organically.
 *
 * Brand colours (tokens.css):
 *   --color-bg-tint  #f7f9fc
 *   --color-brand    #635bff
 *   --color-coral    #fb7185
 *   --color-amber    #f59e0b
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

  /* Diagonal field — same direction as the headline brand gradient */
  float diag = uv.x * 0.92 - uv.y * 0.38 + 0.30;

  /* Single VERY gentle warp — barely curves the gradient, no blobs.
     Reduced amplitudes prevent visible "shape" artefacts.                */
  float warp = fbm(vec2(uv.x * 0.7, uv.y * 0.9 + t * 0.025)) * 0.06;
  float field = clamp(diag + warp, 0.0, 1.0);

  /* Brand palette — ONLY 4 anchors, no tonal sub-shades.
     Each colour transitions smoothly to the next via continuous lerp. */
  vec3 c_tint   = vec3(0.969, 0.976, 0.988);
  vec3 c_brand  = vec3(0.388, 0.357, 1.000);
  vec3 c_coral  = vec3(0.984, 0.443, 0.522);
  vec3 c_amber  = vec3(0.961, 0.620, 0.043);

  /* Continuous piecewise lerp (no smoothstep — eliminates wavy edges) */
  vec3 col;
  if (field < 0.30) {
    col = mix(c_tint, c_brand, field / 0.30);
  } else if (field < 0.60) {
    col = mix(c_brand, c_coral, (field - 0.30) / 0.30);
  } else {
    col = mix(c_coral, c_amber, clamp((field - 0.60) / 0.30, 0.0, 1.0));
  }

  /* Soft asymmetric mask — gathered upper-right, drape to lower-left */
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

    /* Pause when off-screen */
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
