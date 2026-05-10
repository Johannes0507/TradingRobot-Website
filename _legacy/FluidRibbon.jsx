// Fluid Ribbon WebGL Gradient — Stripe-style flowing silk
// Architecture: per-PIXEL Fragment Shader (not vertex). UV distortion via Simplex Noise.
// Sharp band boundaries via narrow smoothstep ranges.
const { useRef: useFR, useEffect: useFRE } = React;

const FR_VERTEX = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FR_FRAGMENT = `
precision highp float;

varying vec2 v_uv;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec3  u_color1;
uniform vec3  u_color2;
uniform vec3  u_color3;
uniform vec3  u_color4;
uniform vec3  u_color5;
uniform float u_distort;
uniform float u_band_sharp;
uniform float u_speed;

// ---------- Ashima Simplex Noise 3D ----------
vec4 mod289_v4(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 mod289_v3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289_v4(((x*34.0)+1.0)*x);}
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
  i=mod289_v3(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
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
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

// fBm — fractal Brownian motion (stacked octaves of noise)
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * u_speed;

  // Pattern flows downward — silk falls
  float yt = uv.y - t;

  // ============================================================
  // CENTERLINE — tornado spiral
  // Higher frequencies (8 & 14) → 2-3 full curves per canvas height
  // ============================================================
  float spiralA = sin(yt * 8.0) * 0.18;
  float spiralB = sin(yt * 14.0 + 1.3) * 0.10;
  float curve   = fbm(vec3(yt * 3.0, t * 0.15, 0.0)) * 0.10;
  float centerSway = spiralA + spiralB + curve;
  float center = 0.5 + centerSway;

  // Centerline derivative — used to TILT silk threads with the curve
  float slope = cos(yt * 8.0) * 8.0 * 0.18
              + cos(yt * 14.0 + 1.3) * 14.0 * 0.10;

  // ============================================================
  // SILK WIDTH
  // ============================================================
  float widthPulse = sin(yt * 4.0) * 0.04;
  float halfWidth = 0.22 + widthPulse + fbm(vec3(yt * 3.0, t * 0.2, 50.0)) * 0.04;

  float dx = uv.x - center;
  float localX = (dx + halfWidth) / (halfWidth * 2.0);

  // ============================================================
  // SWIRL FIELD — invisible stirrer perturbing the rotation phase
  // Non-uniform across silk → colors appear to chase/intertwine
  // ============================================================
  float swirlAmount = fbm(vec3(uv * 2.0, t * 0.25));

  // ============================================================
  // TWIST — color stops rotate along Y, perturbed by swirl
  // ============================================================
  float twistPhase = yt * 6.0 + swirlAmount * 1.8;
  float twist = sin(twistPhase) * u_distort;
  float colorPos = clamp(localX + twist, 0.0, 1.0);

  // ============================================================
  // 5-COLOR L→R GRADIENT (within silk)
  // ============================================================
  float w = u_band_sharp;
  vec3 color = u_color1;
  color = mix(color, u_color2, smoothstep(0.18 - w, 0.18 + w, colorPos));
  color = mix(color, u_color3, smoothstep(0.38 - w, 0.38 + w, colorPos));
  color = mix(color, u_color4, smoothstep(0.58 - w, 0.58 + w, colorPos));
  color = mix(color, u_color5, smoothstep(0.78 - w, 0.78 + w, colorPos));

  // ============================================================
  // GRAIN — 5 optimizations stacked
  // ============================================================

  // (1) COMPRESSION — threads densify when silk rotates away (3D illusion)
  //     |cos| of twistPhase: 1 when silk faces forward, low when edge-on
  float compression = 1.0 + abs(cos(twistPhase)) * 1.4;

  // (2) SLOPE TILT — threads tilt with centerline curve (like flag on pole)
  float threadOffset = fbm(vec3(yt * 6.0, t * 0.08, 0.0)) * 0.010;
  float sampleX = localX + threadOffset - slope * 0.025;

  // (3) ANTI-ALIAS — fwidth-based smoothing prevents moiré at narrow widths
  float threadFreq = 70.0 * compression;
  float threadPhase_g = sampleX * threadFreq;
  float aa = fwidth(threadPhase_g);
  float threadRaw = sin(threadPhase_g) * 0.5 + 0.5;
  // Blend toward 0.5 (gray average) when AA width exceeds visibility
  float threads = mix(threadRaw, 0.5, smoothstep(0.5, 1.5, aa));

  // Apply thread modulation
  color *= 0.92 + threads * 0.08;

  // (4) ANISOTROPIC SHEEN — cross-fiber highlight bands (silk's signature look)
  //     Strongest perpendicular to thread direction → modulated by yt phase
  float specPhase = abs(sin(yt * 5.0 + 1.5));
  float specBand = pow(specPhase, 6.0) * 0.18;
  color = mix(color, vec3(1.0), specBand * 0.45);

  // Sharp peak highlight along brightest threads
  float peakSheen = pow(threadRaw, 8.0) * 0.10;
  color += vec3(peakSheen);

  // (5) EDGE DARKENING — silk curves away from light at edges
  float silkDepth = 1.0 - abs(dx) / halfWidth;
  silkDepth = smoothstep(0.0, 0.55, silkDepth);
  color *= 0.82 + silkDepth * 0.18;

  // ============================================================
  // NEBULA DEPTH — slow 3D-ish depth field driving forward/back
  // High depth = pushed to foreground (bright, saturated, halo)
  // Low depth  = receded into vortex (dim, desaturated)
  // ============================================================
  float nebulaDepth = fbm(vec3(uv * 1.4, t * 0.18));
  nebulaDepth = nebulaDepth * 0.5 + 0.5;  // map to 0..1

  // Luminance modulation — forward brightens, back dims
  color *= mix(0.78, 1.18, nebulaDepth);

  // Saturation modulation — receded layers desaturate (visual depth)
  vec3 luma = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
  color = mix(luma, color, mix(0.82, 1.18, nebulaDepth));

  // EDGE HALO — high-saturation peaks rotating forward bloom at edges
  // condition: near silk edge AND high nebulaDepth
  float edgeNear = smoothstep(0.45, 0.92, abs(dx) / halfWidth);
  float forwardness = smoothstep(0.58, 1.0, nebulaDepth);
  float halo = edgeNear * forwardness * 0.50;
  color += color * halo;  // glow boosts whatever color is already there

  // ============================================================
  // SILHOUETTE — single continuous silk
  // ============================================================
  float edgeSoft = 0.04;
  float silkMask = smoothstep(halfWidth, halfWidth - edgeSoft, abs(dx));

  // Top: silk emerges from above viewport (extension feel)
  float topFade = smoothstep(1.0, 0.97, uv.y);

  // Bottom: silk tapers off well before page bottom (composition)
  // y=0..0.10 fully white, y=0.10..0.50 fading, y=0.50+ full silk
  float bottomFade = smoothstep(0.10, 0.50, uv.y);

  float alpha = silkMask * topFade * bottomFade;
  color = mix(vec3(1.0), color, alpha);

  gl_FragColor = vec4(color, 1.0);
}
`;

function frHex(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function frCompile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[FluidRibbon] shader error:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function FluidRibbon({
  // Default palette: lavender → pink → coral → orange → deep orange
  colors = ['#A8B5FF', '#F9A8D4', '#FB7185', '#FB923C', '#F97316'],
  distort = 0.18,        // UV distortion strength (silk curl amount)
  bandSharp = 0.04,      // band edge sharpness (smaller = crisper)
  speed = 0.12,          // animation speed
  className,
  style,
}) {
  const canvasRef = useFR(null);

  useFRE(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true })
            || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('[FluidRibbon] WebGL not supported');
      return;
    }

    // Enable derivatives for fwidth() (used in thread anti-aliasing)
    const hasDerivatives = !!gl.getExtension('OES_standard_derivatives');
    const fragmentSrc = hasDerivatives
      ? '#extension GL_OES_standard_derivatives : enable\n' + FR_FRAGMENT
      : FR_FRAGMENT;

    const vs = frCompile(gl, gl.VERTEX_SHADER, FR_VERTEX);
    const fs = frCompile(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[FluidRibbon] link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Fullscreen quad — fragment shader does everything
    const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = name => gl.getUniformLocation(program, name);
    const uTime = u('u_time');
    const uRes = u('u_resolution');
    const uDistort = u('u_distort');
    const uSharp = u('u_band_sharp');
    const uSpeed = u('u_speed');
    const uC = [u('u_color1'), u('u_color2'), u('u_color3'), u('u_color4'), u('u_color5')];

    colors.forEach((c, i) => uC[i] && gl.uniform3fv(uC[i], frHex(c)));
    gl.uniform1f(uDistort, distort);
    gl.uniform1f(uSharp, bandSharp);
    gl.uniform1f(uSpeed, speed);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width * dpr));
      const h = Math.max(1, Math.floor(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf;
    const start = performance.now();
    function tick() {
      const t = reduceMotion ? 0 : (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [colors.join(','), distort, bandSharp, speed]);

  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%', ...style }} />;
}

Object.assign(window, { FluidRibbon });
