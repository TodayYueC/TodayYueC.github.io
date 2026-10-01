/* Save slot 04 · PBRDeferredRenderer (in development): a G-buffer preview.
   Ten analytic spheres (roughness →, metal ↑) shaded with Cook-Torrance GGX and
   ACES tone mapping; the point light follows the pointer. Clicking wipes
   between the lit image, a 2×2 G-buffer split and single buffers. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;
  const MODES = [
    ["LIT · ACES", 0],
    ["G-BUFFER", 1],
    ["ALBEDO", 2],
    ["NORMAL", 3],
    ["DEPTH", 4],
  ];

  const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `precision highp float;
varying vec2 v;
uniform vec2 uRes;
uniform vec3 uLight;
uniform float uMode, uPrev, uReveal, uTime;
const float PI = 3.14159265;

float gT; vec3 gN; vec3 gAlb; float gRough; float gMetal;

void trace(vec3 ro, vec3 rd){
  gT = 1e9;
  for (int j = 0; j < 2; j++) {
    for (int i = 0; i < 5; i++) {
      vec3 c = vec3((float(i) - 2.0) * 1.05, j == 0 ? 0.56 : -0.56, 0.0);
      vec3 oc = ro - c;
      float b = dot(oc, rd);
      float cc = dot(oc, oc) - 0.44 * 0.44;
      float disc = b * b - cc;
      if (disc > 0.0) {
        float t = -b - sqrt(disc);
        if (t > 0.0 && t < gT) {
          gT = t;
          gN = normalize(ro + rd * t - c);
          gRough = mix(0.07, 1.0, float(i) / 4.0);
          gMetal = j == 0 ? 1.0 : 0.0;
          gAlb = j == 0 ? vec3(1.0, 0.76, 0.33) : vec3(0.93, 0.33, 0.5);
        }
      }
    }
  }
}

vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

vec3 background(vec2 uv){
  vec3 col = mix(vec3(0.02, 0.015, 0.05), vec3(0.09, 0.06, 0.17), uv.y);
  vec2 g = abs(fract(uv * vec2(16.0, 10.0)) - 0.5);
  col += vec3(0.5, 0.4, 1.0) * 0.035 * step(0.47, max(g.x, g.y));
  return col;
}

vec3 shade(vec3 p, vec3 V){
  vec3 N = gN;
  vec3 Lv = uLight - p;
  float dist = length(Lv);
  vec3 L = Lv / dist;
  vec3 H = normalize(V + L);
  float NdL = max(dot(N, L), 0.0);
  float NdV = max(dot(N, V), 0.001);
  float NdH = max(dot(N, H), 0.0);
  float VdH = max(dot(V, H), 0.0);
  float a = gRough * gRough;
  float a2 = a * a;
  float d = NdH * NdH * (a2 - 1.0) + 1.0;
  float D = a2 / (PI * d * d);
  float k = (gRough + 1.0) * (gRough + 1.0) / 8.0;
  float G = (NdV / (NdV * (1.0 - k) + k)) * (NdL / (NdL * (1.0 - k) + k));
  vec3 F0 = mix(vec3(0.04), gAlb, gMetal);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VdH, 5.0);
  vec3 spec = D * G * F / (4.0 * NdV * NdL + 0.0001);
  vec3 kd = (1.0 - F) * (1.0 - gMetal);
  vec3 radiance = vec3(1.0, 0.93, 0.86) * 14.0 / (dist * dist);
  vec3 Lo = (kd * gAlb / PI + spec) * radiance * NdL;
  vec3 sky = mix(vec3(0.05, 0.03, 0.09), vec3(0.34, 0.28, 0.6), N.y * 0.5 + 0.5);
  vec3 Fa = F0 + (max(vec3(1.0 - gRough), F0) - F0) * pow(1.0 - NdV, 5.0);
  vec3 amb = (1.0 - Fa) * (1.0 - gMetal) * gAlb * sky + Fa * sky * (1.0 - gRough * 0.75);
  float rim = pow(1.0 - NdV, 4.0);
  return Lo + amb + vec3(0.38, 0.9, 0.95) * rim * 0.12;
}

vec3 render(vec2 uv, float mode){
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);
  vec3 ro = vec3(0.0, 0.0, 5.2);
  vec3 rd = normalize(vec3(p, -2.6));
  trace(ro, rd);
  vec3 toL = uLight - ro;
  float along = dot(toL, rd);
  float miss = length(toL - rd * along);
  float glow = exp(-miss * miss * 90.0) * 1.6 + exp(-miss * 7.0) * 0.12;
  if (gT > 1e8) {
    if (mode == 2.0) return vec3(0.05);
    if (mode == 3.0) return vec3(0.12, 0.12, 0.25);
    if (mode == 4.0) return vec3(0.0);
    return background(uv) + vec3(1.0, 0.9, 0.75) * glow;
  }
  if (mode == 2.0) return gAlb;
  if (mode == 3.0) return gN * 0.5 + 0.5;
  if (mode == 4.0) return vec3(1.0 - clamp((gT - 4.3) / 1.2, 0.0, 1.0));
  vec3 col = aces(shade(ro + rd * gT, -rd) * 1.1);
  if (along < gT) col += vec3(1.0, 0.9, 0.75) * glow;
  return pow(col, vec3(1.0 / 2.2));
}

vec3 pixel(vec2 uv, float mode){
  if (mode == 1.0) {
    vec2 q = floor(uv * 2.0);
    vec2 l = fract(uv * 2.0);
    float sub = q.y > 0.5 ? (q.x < 0.5 ? 2.0 : 3.0) : (q.x < 0.5 ? 4.0 : 0.0);
    vec3 c = render(l, sub);
    vec2 e = min(l, 1.0 - l) * uRes * 0.5;
    return mix(vec3(0.1), c, step(1.0, min(e.x, e.y)));
  }
  return render(uv, mode);
}

void main(){
  float edge = v.x + (v.y - 0.5) * 0.25;
  float cut = uReveal * 1.3 - 0.15;
  float mode = edge < cut ? uMode : uPrev;
  vec3 col = pixel(v, mode);
  float line = 1.0 - smoothstep(0.0, 0.006, abs(edge - cut));
  col += vec3(0.65, 0.55, 1.0) * line * step(uReveal, 0.999);
  gl_FragColor = vec4(col, 1.0);
}`;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("[pbr]", gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  YC.defineScene("pbr", (canvas) => {
    const slot = canvas.closest(".slot");
    const modeEl = slot?.querySelector("[data-hud-mode]");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl) {
      if (modeEl) modeEl.textContent = "WEBGL OFF";
      return {};
    }
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
    ["uRes", "uLight", "uMode", "uPrev", "uReveal", "uTime"].forEach((name) => {
      u[name] = gl.getUniformLocation(program, name);
    });

    const labels = document.createElement("div");
    labels.className = "gb-labels";
    labels.setAttribute("aria-hidden", "true");
    labels.innerHTML = "<span>ALBEDO</span><span>NORMAL</span><span>DEPTH</span><span>LIT · ACES</span>";
    canvas.parentElement?.append(labels);

    let index = 0;
    let prev = 0;
    let reveal = 1;
    let time = 0;
    let lastInput = -99;
    let autoTimer = 0;
    let lost = false;
    const light = { x: 1.8, y: 1, z: 1.8 };
    const target = { x: 1.8, y: 1, z: 1.8 };
    let hovering = false;

    function setMode(next) {
      prev = MODES[index][1];
      index = (next + MODES.length) % MODES.length;
      reveal = YC.motionOK() ? 0 : 1;
      if (modeEl) modeEl.textContent = MODES[index][0];
      labels.classList.toggle("on", MODES[index][1] === 1);
    }
    if (modeEl) modeEl.textContent = MODES[0][0];

    function draw() {
      if (lost) return;
      gl.uniform3f(u.uLight, light.x, light.y, light.z);
      gl.uniform1f(u.uMode, MODES[index][1]);
      gl.uniform1f(u.uPrev, prev);
      gl.uniform1f(u.uReveal, reveal);
      gl.uniform1f(u.uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      lost = true;
    });
    canvas.addEventListener("pointermove", (event) => {
      const r = canvas.getBoundingClientRect();
      const nx = ((event.clientX - r.left) / r.width) * 2 - 1;
      const ny = 1 - ((event.clientY - r.top) / r.height) * 2;
      target.x = nx * 3.1;
      target.y = ny * 1.9;
      target.z = 1.3;
      hovering = event.pointerType === "mouse";
      lastInput = time;
    });
    canvas.addEventListener("pointerleave", () => (hovering = false));
    canvas.addEventListener("pointerdown", () => {
      lastInput = time;
      setMode(index + 1);
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      lastInput = time;
      setMode(index + 1);
    });

    return {
      resize() {
        const { w, h } = YC.fitCanvas(canvas, 1.5);
        gl.viewport(0, 0, w, h);
        gl.uniform2f(u.uRes, w, h);
        draw();
      },
      frame(dt) {
        time += dt;
        if (!hovering) {
          target.x = Math.cos(time * 0.7) * 2.6;
          target.y = Math.sin(time * 1.1) * 1.3;
          target.z = 1.7 + Math.sin(time * 0.5) * 0.4;
        }
        const k = 1 - Math.exp(-dt * 8);
        light.x += (target.x - light.x) * k;
        light.y += (target.y - light.y) * k;
        light.z += (target.z - light.z) * k;
        reveal = Math.min(1, reveal + dt * 2.4);
        if (time - lastInput > 8) {
          autoTimer += dt;
          if (autoTimer > 3.6) {
            autoTimer = 0;
            setMode(index + 1);
          }
        } else {
          autoTimer = 0;
        }
        draw();
      },
      still() {
        reveal = 1;
        draw();
      },
    };
  });
})();
