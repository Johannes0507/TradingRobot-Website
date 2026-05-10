// WebGL Mesh Gradient — replicates Stripe's hero animation
// Architecture: plane mesh (~100×100 vertices) + Ashima 3D Simplex Noise
// vertex shader displaces Z + blends 4 colors → fragment shader just outputs interpolated color
const { useRef: useMG, useEffect: useMGE } = React;

const MG_VERTEX = `
precision highp float;

attribute vec2 a_position;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_noise_freq;
uniform float u_noise_speed;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;

varying vec3 v_color;

// Ashima 3D Simplex Noise
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
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

void main() {
  // Three noise layers for organic flow (slow + medium + fine detail)
  float n1 = snoise(vec3(a_position * u_noise_freq * 1.0, u_time * u_noise_speed));
  float n2 = snoise(vec3(a_position * u_noise_freq * 2.4, u_time * u_noise_speed * 1.3));
  float n3 = snoise(vec3(a_position * u_noise_freq * 4.8, u_time * u_noise_speed * 0.7));

  // Color bands follow Y axis — noise BENDS them into organic ribbons,
  // it does NOT randomize colors per-vertex (which would be a heat map)
  float coord = a_position.y * 1.15 + n1 * 0.75 + n2 * 0.32 + n3 * 0.14;
  float t = clamp((coord + 1.4) * 0.36, 0.0, 1.0);

  // 4-stop band mix
  vec3 color = u_color1;
  color = mix(color, u_color2, smoothstep(0.00, 0.32, t));
  color = mix(color, u_color3, smoothstep(0.28, 0.58, t));
  color = mix(color, u_color4, smoothstep(0.55, 0.88, t));

  // Fade to white on the left side — gives the "ribbon flowing in from right" silhouette
  // a_position.x: -1 (far left) ... +1 (far right)
  float fadeIn = smoothstep(-0.4, 0.45, a_position.x + n1 * 0.18);
  color = mix(vec3(1.0), color, fadeIn);

  v_color = color;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const MG_FRAGMENT = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_darken_top;
uniform float u_shadow_power;

varying vec3 v_color;

void main() {
  vec3 color = v_color;

  if (u_darken_top == 1.0) {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

function mgHexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function mgCreatePlaneGeometry(segments) {
  const positions = [];
  const indices = [];
  for (let y = 0; y <= segments; y++) {
    for (let x = 0; x <= segments; x++) {
      positions.push((x / segments) * 2 - 1, (y / segments) * 2 - 1);
    }
  }
  const stride = segments + 1;
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < segments; x++) {
      const a = y * stride + x;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }
  return {
    positions: new Float32Array(positions),
    indices: new Uint32Array(indices),
  };
}

function mgCompile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('shader error:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function MeshGradient({
  colors = ['#FB923C', '#FB7185', '#A78BFA', '#FCD34D'],
  noiseFreq = [1.5, 1.5],
  noiseSpeed = 0.18,
  darkenTop = false,
  className,
  style,
}) {
  const canvasRef = useMG(null);

  useMGE(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true })
            || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('[MeshGradient] WebGL not supported — fallback to CSS');
      canvas.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]})`;
      return;
    }

    // Need 32-bit indices for big plane meshes (>65535 vertices)
    const ext = gl.getExtension('OES_element_index_uint');
    const segments = ext ? 100 : 80;

    const vs = mgCompile(gl, gl.VERTEX_SHADER, MG_VERTEX);
    const fs = mgCompile(gl, gl.FRAGMENT_SHADER, MG_FRAGMENT);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const { positions, indices } = mgCreatePlaneGeometry(segments);
    const indexArray = ext ? indices : new Uint16Array(indices);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = name => gl.getUniformLocation(program, name);
    const uTime = u('u_time');
    const uRes = u('u_resolution');
    const uFreq = u('u_noise_freq');
    const uSpeed = u('u_noise_speed');
    const uDark = u('u_darken_top');
    const uShadow = u('u_shadow_power');
    const uC = [u('u_color1'), u('u_color2'), u('u_color3'), u('u_color4')];

    colors.forEach((c, i) => uC[i] && gl.uniform3fv(uC[i], mgHexToRgb(c)));
    gl.uniform2f(uFreq, noiseFreq[0], noiseFreq[1]);
    gl.uniform1f(uSpeed, noiseSpeed);
    gl.uniform1f(uDark, darkenTop ? 1.0 : 0.0);
    gl.uniform1f(uShadow, 5.0);

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
    const idxType = ext ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    function tick() {
      const t = reduceMotion ? 0 : (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, indexArray.length, idxType, 0);
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(idxBuf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [colors.join(','), noiseFreq.join(','), noiseSpeed, darkenTop]);

  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%', ...style }} />;
}

Object.assign(window, { MeshGradient });
