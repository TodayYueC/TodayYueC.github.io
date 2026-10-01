/* Title screen poster: the key art re-rendered through WebGL with a pointer lens,
   chromatic aberration driven by scroll speed and short "still loading" glitches.
   The <img> underneath stays as the fallback until the first frame is drawn. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;

  const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D uTex;
uniform vec2 uRes, uImg, uMouse, uFocus;
uniform float uTime, uHover, uVel, uGlitch;
float hash(float n){ return fract(sin(n) * 43758.5453123); }
vec2 cover(vec2 uv){
  float ca = uRes.x / uRes.y, ia = uImg.x / uImg.y;
  vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - uFocus) * s + uFocus;
}
void main(){
  vec2 uv = v;
  vec2 d = uv - uMouse;
  d.x *= uRes.x / uRes.y;
  float lens = uHover * smoothstep(0.38, 0.0, length(d));
  uv -= (uv - uMouse) * lens * 0.1;

  float tick = floor(uTime * 18.0);
  float band = floor(uv.y * 28.0);
  float g = uGlitch * step(0.7, hash(band * 1.31 + tick));
  uv.x += (hash(band * 7.7 + tick) - 0.5) * 0.09 * g;
  uv = (uv - 0.5) * (1.0 - 0.035 * uHover) + 0.5 + (uMouse - 0.5) * 0.02 * uHover;

  float ab = 0.0015 + abs(uVel) * 0.014 + g * 0.025 + lens * 0.012;
  vec3 col = vec3(
    texture2D(uTex, cover(uv + vec2(ab, 0.0))).r,
    texture2D(uTex, cover(uv)).g,
    texture2D(uTex, cover(uv - vec2(ab, 0.0))).b
  );
  col *= 0.955 + 0.045 * sin(v.y * uRes.y * 1.3 - uTime * 4.0);
  float sweep = exp(-pow((v.y - fract(uTime * 0.12) * 1.4 + 0.2) * 14.0, 2.0));
  col += vec3(0.38, 0.9, 0.95) * sweep * 0.07;
  col += vec3(1.0, 0.45, 0.65) * lens * 0.07;
  col = mix(col, col * vec3(1.0, 0.55, 0.8) + vec3(0.05, 0.0, 0.08), g * 0.6);
  gl_FragColor = vec4(col, 1.0);
}`;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("[poster]", gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  YC.defineScene("poster", (canvas) => {
    const figure = canvas.closest(".poster");
    const img = figure?.querySelector(".poster-img");
    const art = canvas.closest(".hero-art") || figure;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl || !img) return {};

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return {};
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return {};
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    ["uTex", "uRes", "uImg", "uMouse", "uFocus", "uTime", "uHover", "uVel", "uGlitch"].forEach((name) => {
      u[name] = gl.getUniformLocation(program, name);
    });
    gl.uniform1i(u.uTex, 0);
    gl.uniform2f(u.uFocus, 0.44, 0.64);

    const texture = gl.createTexture();
    const mouse = { x: 0.5, y: 0.5, h: 0 };
    const target = { x: 0.5, y: 0.5, h: 0 };
    let ready = false;
    let lost = false;
    let time = 0;
    let vel = 0;
    let glitch = 0;
    let nextGlitch = 2.5 + Math.random() * 3;

    function draw() {
      if (!ready || lost) return;
      gl.uniform1f(u.uTime, time);
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);
      gl.uniform1f(u.uHover, mouse.h);
      gl.uniform1f(u.uVel, vel);
      gl.uniform1f(u.uGlitch, glitch);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function upload() {
      if (lost || !img.naturalWidth) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      } catch {
        return;
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform2f(u.uImg, img.naturalWidth, img.naturalHeight);
      ready = true;
      draw();
      requestAnimationFrame(() => figure.classList.add("gl-ready"));
    }
    img.addEventListener("load", upload);
    if (img.complete) upload();

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      lost = true;
      figure.classList.remove("gl-ready");
    });

    art.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      target.x = (event.clientX - r.left) / r.width;
      target.y = 1 - (event.clientY - r.top) / r.height;
      target.h = 1;
    });
    art.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") glitch = Math.max(glitch, 0.55);
    });
    art.addEventListener("pointerleave", () => (target.h = 0));

    return {
      resize() {
        const { w, h } = YC.fitCanvas(canvas, 1.5);
        gl.viewport(0, 0, w, h);
        gl.uniform2f(u.uRes, w, h);
        draw();
      },
      frame(dt, t) {
        time = t;
        const k = 1 - Math.exp(-dt * 7);
        mouse.x += (target.x - mouse.x) * k;
        mouse.y += (target.y - mouse.y) * k;
        mouse.h += (target.h - mouse.h) * (1 - Math.exp(-dt * 4));
        vel += (YC.clamp(YC.scroll.velocity / 28, -1, 1) - vel) * k;
        glitch = Math.max(0, glitch - dt * 3.2);
        if (t > nextGlitch) {
          glitch = 1;
          nextGlitch = t + 4 + Math.random() * 5;
        }
        draw();
      },
      still() {
        mouse.h = 0;
        glitch = 0;
        vel = 0;
        draw();
      },
    };
  });
})();
