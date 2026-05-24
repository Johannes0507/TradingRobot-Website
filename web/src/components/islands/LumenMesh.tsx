/**
 * LumenMesh — WebGL animated mesh gradient
 * Ported from docs/reference/Stripe Website v2/js/mesh-gradient.js
 *
 * A displaced plane (~60 segment grid) driven by 3D simplex noise.
 * Per-vertex color is blended from 4 "wave layers", each with its own
 * frequency + temporal phase. The result is a fluid, painterly mesh that
 * looks expensively crafted — quite different from the obvious AI radial
 * blobs.
 *
 * Colors come from `--gradientcolor{zero..three}` on the canvas itself,
 * so palettes are tweakable per-instance via inline style without
 * recompiling the shader.
 */
import { useEffect, useRef } from 'react';

export interface LumenMeshProps {
  /** Plane subdivision count (segments per axis). Default 60. */
  segments?: number;
  /** Wave displacement amplitude. Default 0.35. */
  amplitude?: number;
  /** Time multiplier. 0 disables motion. Default 1.0. */
  speed?: number;
  freq1?: number;
  freq2?: number;
  freq3?: number;
  /** Top-edge subtle darkening for depth. Default 0.12. */
  darkenTop?: number;
  /** Inline style for the canvas element (use to set --gradientcolor*). */
  style?: React.CSSProperties;
  className?: string;
}

const VERT = `
  precision highp float;
  attribute vec3 a_position;
  attribute vec2 a_uv;

  uniform float u_time;
  uniform float u_amplitude;
  uniform vec3 u_baseColor;
  uniform vec3 u_waveColor1;
  uniform vec3 u_waveColor2;
  uniform vec3 u_waveColor3;
  uniform float u_speed;
  uniform float u_freq1;
  uniform float u_freq2;
  uniform float u_freq3;
  uniform float u_darkenTop;

  varying vec3 v_color;
  varying float v_depth;

  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main() {
    float t = u_time * 0.0004 * u_speed;
    vec2 uv = a_uv;

    float n1 = snoise(vec3(uv.x * 2.0, uv.y * 1.0, t * 1.1));
    float n2 = snoise(vec3(uv.x * 3.5 + 5.0, uv.y * 2.0, t * 1.6));
    float displaced = n1 * 0.6 + n2 * 0.3;

    vec3 pos = a_position;
    pos.z += displaced * u_amplitude;

    vec3 color = u_baseColor;

    float w1 = snoise(vec3(uv.x * u_freq1 + 2.0, uv.y * u_freq1 * 0.7, t * 1.2)) * 0.5 + 0.5;
    w1 = smoothstep(0.18, 0.78, w1);
    color = mix(color, u_waveColor1, w1);

    float w2 = snoise(vec3(uv.x * u_freq2 - 3.0 + t, uv.y * u_freq2 + 4.0, t * 1.7)) * 0.5 + 0.5;
    w2 = smoothstep(0.12, 0.82, w2);
    color = mix(color, u_waveColor2, w2);

    float w3 = snoise(vec3(uv.x * u_freq3 + 7.0, uv.y * u_freq3 - 2.0 + t * 1.3, t * 2.2)) * 0.5 + 0.5;
    w3 = smoothstep(0.22, 0.76, w3);
    color = mix(color, u_waveColor3, w3);

    float topShade = mix(1.0, 1.0 - u_darkenTop * 0.4, 1.0 - uv.y);
    color *= topShade;

    v_color = color;
    v_depth = displaced;

    gl_Position = vec4(a_position.xy, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  varying vec3 v_color;
  varying float v_depth;
  void main() {
    vec3 c = v_color;
    c *= 1.0 + v_depth * 0.08;
    gl_FragColor = vec4(c, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader compile error', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function hexToRgb(hex: string): [number, number, number] {
  let h = (hex || '#000000').trim();
  if (h[0] === '#') h = h.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readCssVar(el: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

export default function LumenMesh({
  segments = 60,
  amplitude = 0.35,
  speed = 1.0,
  freq1 = 1.6,
  freq2 = 2.4,
  freq3 = 3.4,
  darkenTop = 0.12,
  style,
  className,
}: LumenMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    /* Plane geometry */
    const SEG = segments;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let y = 0; y <= SEG; y++) {
      for (let x = 0; x <= SEG; x++) {
        const u = x / SEG;
        const v = y / SEG;
        positions.push(u * 2 - 1, v * 2 - 1, 0);
        uvs.push(u, v);
      }
    }
    for (let y = 0; y < SEG; y++) {
      for (let x = 0; x < SEG; x++) {
        const i = y * (SEG + 1) + x;
        const j = i + (SEG + 1);
        indices.push(i, j, i + 1);
        indices.push(j, j + 1, i + 1);
      }
    }
    const indexCount = indices.length;

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(prog, 'a_uv');
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const u = {
      time:       gl.getUniformLocation(prog, 'u_time'),
      amplitude:  gl.getUniformLocation(prog, 'u_amplitude'),
      base:       gl.getUniformLocation(prog, 'u_baseColor'),
      wave1:      gl.getUniformLocation(prog, 'u_waveColor1'),
      wave2:      gl.getUniformLocation(prog, 'u_waveColor2'),
      wave3:      gl.getUniformLocation(prog, 'u_waveColor3'),
      speed:      gl.getUniformLocation(prog, 'u_speed'),
      f1:         gl.getUniformLocation(prog, 'u_freq1'),
      f2:         gl.getUniformLocation(prog, 'u_freq2'),
      f3:         gl.getUniformLocation(prog, 'u_freq3'),
      darkenTop:  gl.getUniformLocation(prog, 'u_darkenTop'),
    };

    let colors: [number, number, number][] = [
      hexToRgb('#f6f9fc'),
      hexToRgb('#5b7cfa'),
      hexToRgb('#9d6cff'),
      hexToRgb('#ff7eb6'),
    ];
    const refreshColors = () => {
      colors = [
        hexToRgb(readCssVar(canvas, '--gradientcolorzero',  '#f6f9fc')),
        hexToRgb(readCssVar(canvas, '--gradientcolorone',   '#5b7cfa')),
        hexToRgb(readCssVar(canvas, '--gradientcolortwo',   '#9d6cff')),
        hexToRgb(readCssVar(canvas, '--gradientcolorthree', '#ff7eb6')),
      ];
    };
    refreshColors();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let running = false;
    let t = 0;
    let last = performance.now();

    const draw = () => {
      gl.useProgram(prog);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.amplitude, amplitude);
      gl.uniform1f(u.speed, speed);
      gl.uniform1f(u.f1, freq1);
      gl.uniform1f(u.f2, freq2);
      gl.uniform1f(u.f3, freq3);
      gl.uniform1f(u.darkenTop, darkenTop);
      gl.uniform3fv(u.base,  colors[0]);
      gl.uniform3fv(u.wave1, colors[1]);
      gl.uniform3fv(u.wave2, colors[2]);
      gl.uniform3fv(u.wave3, colors[3]);
      gl.clearColor(colors[0][0], colors[0][1], colors[0][2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(now - last, 64);
      last = now;
      if (!reduceMotion) t += dt;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };

    /* Always render at least one frame so the canvas isn't blank */
    draw();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (canvas.getBoundingClientRect().bottom > 0) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [segments, amplitude, speed, freq1, freq2, freq3, darkenTop]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
