/* Save slot 03 · SoftRenderer: an actual CPU rasterizer in JavaScript.
   Torus-knot mesh → MVP transform → back-face culling → edge-function
   rasterization with 1/w perspective-correct interpolation and a float
   Z-buffer. Passes: Blinn-Phong, wireframe, Z-buffer and normals. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;
  const PASSES = ["BLINN-PHONG", "WIREFRAME", "Z-BUFFER", "NORMALS"];
  const SCALE = 2.4;

  function buildKnot(U = 110, V = 10, p = 2, q = 3, tube = 0.36) {
    const curve = (t) => {
      const r = 2 + Math.cos(q * t);
      return [r * Math.cos(p * t) * 0.5, r * Math.sin(p * t) * 0.5, Math.sin(q * t) * 0.5];
    };
    const pos = new Float32Array(U * V * 3);
    const nrm = new Float32Array(U * V * 3);
    const e = 0.001;
    for (let i = 0; i < U; i++) {
      const t = (i / U) * Math.PI * 2;
      const c = curve(t);
      const a = curve(t + e);
      const b = curve(t - e);
      let T = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      let N = [a[0] + b[0] - 2 * c[0], a[1] + b[1] - 2 * c[1], a[2] + b[2] - 2 * c[2]];
      const norm = (v) => {
        const l = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / l, v[1] / l, v[2] / l];
      };
      const cross = (x, y) => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
      T = norm(T);
      N = norm(N);
      const B = norm(cross(T, N));
      N = cross(B, T);
      for (let j = 0; j < V; j++) {
        const th = (j / V) * Math.PI * 2;
        const cs = Math.cos(th);
        const sn = Math.sin(th);
        const n = [cs * N[0] + sn * B[0], cs * N[1] + sn * B[1], cs * N[2] + sn * B[2]];
        const k = (i * V + j) * 3;
        pos[k] = c[0] + n[0] * tube * 0.5;
        pos[k + 1] = c[1] + n[1] * tube * 0.5;
        pos[k + 2] = c[2] + n[2] * tube * 0.5;
        nrm[k] = n[0];
        nrm[k + 1] = n[1];
        nrm[k + 2] = n[2];
      }
    }
    const idx = new Uint16Array(U * V * 6);
    let o = 0;
    for (let i = 0; i < U; i++) {
      for (let j = 0; j < V; j++) {
        const a = i * V + j;
        const b = ((i + 1) % U) * V + j;
        const c = ((i + 1) % U) * V + ((j + 1) % V);
        const d = i * V + ((j + 1) % V);
        idx[o++] = a; idx[o++] = b; idx[o++] = c;
        idx[o++] = a; idx[o++] = c; idx[o++] = d;
      }
    }
    return { pos, nrm, idx, count: U * V };
  }

  YC.defineScene("rasterizer", (canvas) => {
    const ctx = canvas.getContext("2d");
    canvas.style.imageRendering = "pixelated";
    const slot = canvas.closest(".slot");
    const modeEl = slot?.querySelector("[data-hud-mode]");
    const infoEl = slot?.querySelector("[data-hud-info]");
    const mesh = buildKnot();
    const tris = mesh.idx.length / 3;
    const sx = new Float32Array(mesh.count);
    const sy = new Float32Array(mesh.count);
    const iw = new Float32Array(mesh.count);
    const vz = new Float32Array(mesh.count);
    const rn = new Float32Array(mesh.count * 3);
    const vp = new Float32Array(mesh.count * 3);
    let bw = 1;
    let bh = 1;
    let image = null;
    let px32 = null;
    let zbuf = null;
    let bg = null;
    let pass = 0;
    let yaw = 0.6;
    let pitch = 0.35;
    let spinV = 0.55;
    let pitchV = 0;
    let autoTimer = 0;
    let lastInput = -99;
    let time = 0;
    let sweep = 1;
    let costMs = 0;
    let infoTimer = 0;
    const D = 4.2;

    const rgba = (r, g, b) => (255 << 24) | (b << 16) | (g << 8) | r;

    function setPass(next) {
      pass = (next + PASSES.length) % PASSES.length;
      sweep = 0;
      if (modeEl) modeEl.textContent = PASSES[pass];
    }
    setPass(0);

    function allocate() {
      const fit = { w: Math.max(80, Math.round(canvas.clientWidth / SCALE)), h: Math.max(50, Math.round(canvas.clientHeight / SCALE)) };
      bw = fit.w;
      bh = fit.h;
      canvas.width = bw;
      canvas.height = bh;
      image = ctx.createImageData(bw, bh);
      px32 = new Uint32Array(image.data.buffer);
      zbuf = new Float32Array(bw * bh);
      bg = new Uint32Array(bw * bh);
      const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      for (let y = 0; y < bh; y++) {
        const k = y / bh;
        for (let x = 0; x < bw; x++) {
          const d = (bayer[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 6;
          const r = 22 - k * 10 + d;
          const g = 17 - k * 8 + d;
          const b = 28 - k * 12 + d;
          bg[y * bw + x] = rgba(r | 0, g | 0, b | 0);
        }
      }
    }

    function transform() {
      const cy = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const f = 2.3 * (bh / 2);
      const { pos, nrm, count } = mesh;
      for (let i = 0; i < count; i++) {
        const k = i * 3;
        let x = pos[k];
        let y = pos[k + 1];
        let z = pos[k + 2];
        let nx = nrm[k];
        let ny = nrm[k + 1];
        let nz = nrm[k + 2];
        let tx = x * cy + z * syw;
        let tz = -x * syw + z * cy;
        x = tx;
        z = tz;
        let ty = y * cp - z * sp;
        tz = y * sp + z * cp;
        y = ty;
        z = tz - D;
        tx = nx * cy + nz * syw;
        tz = -nx * syw + nz * cy;
        nx = tx;
        nz = tz;
        ty = ny * cp - nz * sp;
        tz = ny * sp + nz * cp;
        ny = ty;
        nz = tz;
        const w = -z;
        sx[i] = (x / w) * f + bw / 2;
        sy[i] = (-y / w) * f + bh / 2;
        iw[i] = 1 / w;
        vz[i] = w;
        vp[k] = x;
        vp[k + 1] = y;
        vp[k + 2] = z;
        rn[k] = nx;
        rn[k + 1] = ny;
        rn[k + 2] = nz;
      }
    }

    function line(x0, y0, x1, y1, color) {
      x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const stx = x0 < x1 ? 1 : -1;
      const sty = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (let guard = 0; guard < 2000; guard++) {
        if (x0 >= 0 && x0 < bw && y0 >= 0 && y0 < bh) px32[y0 * bw + x0] = color;
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += stx; }
        if (e2 <= dx) { err += dx; y0 += sty; }
      }
    }

    function render() {
      const t0 = performance.now();
      transform();
      px32.set(bg);
      zbuf.fill(0);
      const idx = mesh.idx;
      const near = D - 1.6;
      const far = D + 1.6;
      const Lx = 0.5, Ly = 0.62, Lz = 0.6;
      const Ll = Math.hypot(Lx, Ly, Lz);
      const lx = Lx / Ll, ly = Ly / Ll, lz = Lz / Ll;
      const Fl = Math.hypot(-0.75, -0.1, 0.45);
      const fx = -0.75 / Fl, fy = -0.1 / Fl, fz = 0.45 / Fl;
      let hx = lx, hy = ly, hz = lz + 1;
      const hl = Math.hypot(hx, hy, hz);
      hx /= hl; hy /= hl; hz /= hl;
      const wire = pass === 1;
      for (let t = 0; t < tris; t++) {
        const a = idx[t * 3];
        const b = idx[t * 3 + 1];
        const c = idx[t * 3 + 2];
        const ka = a * 3, kb = b * 3, kc = c * 3;
        const fnx = rn[ka] + rn[kb] + rn[kc];
        const fny = rn[ka + 1] + rn[kb + 1] + rn[kc + 1];
        const fnz = rn[ka + 2] + rn[kb + 2] + rn[kc + 2];
        if (fnx * vp[ka] + fny * vp[ka + 1] + fnz * vp[ka + 2] > 0) continue;
        const x0 = sx[a], y0 = sy[a], x1 = sx[b], y1 = sy[b], x2 = sx[c], y2 = sy[c];
        if (wire) {
          const shade = Math.max(0.25, Math.min(1, 1 - (vz[a] - near) / (far - near)));
          const col = rgba((255 * shade) | 0, (212 * shade) | 0, (121 * shade) | 0);
          line(x0, y0, x1, y1, col);
          line(x1, y1, x2, y2, col);
          line(x2, y2, x0, y0, col);
          continue;
        }
        const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
        if (Math.abs(area) < 1e-6) continue;
        const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
        const maxX = Math.min(bw - 1, Math.ceil(Math.max(x0, x1, x2)));
        const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
        const maxY = Math.min(bh - 1, Math.ceil(Math.max(y0, y1, y2)));
        if (minX > maxX || minY > maxY) continue;
        const inv = 1 / area;
        const A0 = (y1 - y2) * inv, B0 = (x2 - x1) * inv, C0 = (x1 * y2 - x2 * y1) * inv;
        const A1 = (y2 - y0) * inv, B1 = (x0 - x2) * inv, C1 = (x2 * y0 - x0 * y2) * inv;
        const i0 = iw[a], i1 = iw[b], i2 = iw[c];
        const n0x = rn[ka] * i0, n0y = rn[ka + 1] * i0, n0z = rn[ka + 2] * i0;
        const n1x = rn[kb] * i1, n1y = rn[kb + 1] * i1, n1z = rn[kb + 2] * i1;
        const n2x = rn[kc] * i2, n2y = rn[kc + 1] * i2, n2z = rn[kc + 2] * i2;
        for (let y = minY; y <= maxY; y++) {
          const py = y + 0.5;
          let w0 = A0 * (minX + 0.5) + B0 * py + C0;
          let w1 = A1 * (minX + 0.5) + B1 * py + C1;
          let o = y * bw + minX;
          for (let x = minX; x <= maxX; x++, o++, w0 += A0, w1 += A1) {
            const w2 = 1 - w0 - w1;
            if (w0 < 0 || w1 < 0 || w2 < 0) continue;
            const z = w0 * i0 + w1 * i1 + w2 * i2;
            if (z <= zbuf[o]) continue;
            zbuf[o] = z;
            if (pass === 2) {
              const g = Math.max(0, Math.min(1, 1 - (1 / z - near) / (far - near)));
              const v = (30 + g * 225) | 0;
              px32[o] = rgba(v, v, v);
              continue;
            }
            const rz = 1 / z;
            let nx = (w0 * n0x + w1 * n1x + w2 * n2x) * rz;
            let ny = (w0 * n0y + w1 * n1y + w2 * n2y) * rz;
            let nz = (w0 * n0z + w1 * n1z + w2 * n2z) * rz;
            const nl = 1 / (Math.hypot(nx, ny, nz) || 1);
            nx *= nl; ny *= nl; nz *= nl;
            if (pass === 3) {
              px32[o] = rgba(((nx * 0.5 + 0.5) * 255) | 0, ((ny * 0.5 + 0.5) * 255) | 0, ((nz * 0.5 + 0.5) * 255) | 0);
              continue;
            }
            const key = Math.max(0, nx * lx + ny * ly + nz * lz);
            const fill = Math.max(0, nx * fx + ny * fy + nz * fz) * 0.55;
            const nh = Math.max(0, nx * hx + ny * hy + nz * hz);
            const spec = Math.pow(nh, 48) * 0.9;
            const rim = Math.pow(1 - Math.max(0, nz), 3) * 0.45;
            const sky = ny * 0.5 + 0.5;
            const r = 255 * (0.95 * (0.06 + sky * 0.16 + key + fill * 0.38) + spec + rim);
            const g = 255 * (0.92 * (0.04 + sky * 0.16 + key * 0.82 + fill * 0.85) + spec + rim * 0.48);
            const bl = 255 * (0.9 * (0.09 + sky * 0.23 + key * 0.55 + fill * 0.95) + spec + rim * 0.65);
            px32[o] = rgba(r > 255 ? 255 : r | 0, g > 255 ? 255 : g | 0, bl > 255 ? 255 : bl | 0);
          }
        }
      }
      ctx.putImageData(image, 0, 0);
      if (sweep < 1) {
        const y = Math.round(sweep * bh);
        ctx.fillStyle = "rgba(255,212,121,0.9)";
        ctx.fillRect(0, y, bw, 1);
        ctx.fillStyle = "rgba(11,10,16,0.55)";
        ctx.fillRect(0, y + 1, bw, bh - y - 1);
      }
      costMs += (performance.now() - t0 - costMs) * 0.1;
    }

    let drag = null;
    canvas.addEventListener("pointerdown", (event) => {
      lastInput = time;
      drag = { x: event.clientX, y: event.clientY, moved: false, type: event.pointerType };
      if (event.pointerType === "mouse") canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drag || drag.type !== "mouse") return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (drag.moved) {
        spinV = dx * 0.6;
        pitchV = dy * 0.4;
        yaw += dx * 0.012;
        pitch = YC.clamp(pitch + dy * 0.01, -1.2, 1.2);
        drag.x = event.clientX;
        drag.y = event.clientY;
        lastInput = time;
      }
    });
    const release = () => {
      if (drag && !drag.moved) setPass(pass + 1);
      drag = null;
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", () => (drag = null));
    canvas.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        lastInput = time;
        setPass(pass + 1);
      } else if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        lastInput = time;
        if (event.key === "ArrowLeft") yaw -= 0.15;
        if (event.key === "ArrowRight") yaw += 0.15;
        if (event.key === "ArrowUp") pitch = YC.clamp(pitch - 0.12, -1.2, 1.2);
        if (event.key === "ArrowDown") pitch = YC.clamp(pitch + 0.12, -1.2, 1.2);
      }
    });

    return {
      resize() {
        allocate();
        render();
      },
      frame(dt) {
        time += dt;
        if (!drag) {
          spinV += (0.55 - spinV) * (1 - Math.exp(-dt * 1.5));
          pitchV *= Math.exp(-dt * 3);
          yaw += spinV * dt;
          pitch = YC.clamp(pitch + pitchV * dt * 0.02, -1.2, 1.2);
        }
        if (time - lastInput > 8) {
          autoTimer += dt;
          if (autoTimer > 3.4) {
            autoTimer = 0;
            setPass(pass + 1);
          }
        } else {
          autoTimer = 0;
        }
        sweep = Math.min(1, sweep + dt * 3.2);
        render();
        infoTimer -= dt;
        if (infoTimer <= 0 && infoEl) {
          infoTimer = 0.5;
          infoEl.textContent = `CPU · ${tris.toLocaleString("en-US")} TRIS · ${costMs.toFixed(1)}ms`;
        }
      },
      still() {
        sweep = 1;
        render();
        if (infoEl) infoEl.textContent = `CPU · ${tris.toLocaleString("en-US")} TRIS`;
      },
    };
  });
})();
