/* Ambient scenes: title-screen starfield, golden-hour bokeh, the tactical
   briefing reticle/compass and the memory agent's live chart. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;
  const TAU = Math.PI * 2;

  function sparkle(ctx, x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.fill();
    ctx.restore();
  }

  /* ── Title screen: drifting stars that stretch into warp lines on scroll ── */
  YC.defineScene("stars", (canvas) => {
    const ctx = canvas.getContext("2d");
    const COLORS = ["255,255,255", "255,123,165", "98,230,240", "255,212,121"];
    let w = 1;
    let h = 1;
    let dpr = 1;
    let stars = [];

    function seed() {
      const area = (w * h) / (dpr * dpr);
      const count = Math.round(YC.clamp(area / 12000, 36, 140));
      stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: 0.25 + Math.random() * 0.75,
        r: 0.5 + Math.random() * 1.4,
        phase: Math.random() * TAU,
        speed: 0.6 + Math.random() * 1.8,
        color: COLORS[Math.random() < 0.6 ? 0 : 1 + ((Math.random() * 3) | 0)],
        big: Math.random() < 0.07,
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const px = YC.pointer.x / innerWidth - 0.5;
      const py = YC.pointer.y / innerHeight - 0.5;
      const warp = YC.clamp(YC.scroll.velocity, -60, 60);
      for (const s of stars) {
        const x = s.x * w - px * 36 * s.z * dpr;
        let y = (s.y * h - t * 7 * s.z * dpr) % h;
        if (y < 0) y += h;
        y -= py * 24 * s.z * dpr;
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const alpha = (0.25 + 0.75 * twinkle) * s.z;
        ctx.fillStyle = `rgba(${s.color},${alpha.toFixed(3)})`;
        if (s.big) {
          sparkle(ctx, x, y, (4 + twinkle * 6) * dpr * s.z, t * 0.4 + s.phase);
        } else if (Math.abs(warp) > 3) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = s.r * dpr * s.z;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + warp * s.z * 1.6 * dpr);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s.r * dpr * s.z, 0, TAU);
          ctx.fill();
        }
      }
    }

    return {
      resize() {
        ({ w, h, dpr } = YC.fitCanvas(canvas, 1.5));
        seed();
        draw(0);
      },
      frame(dt, t) {
        draw(t);
      },
      still() {
        draw(0);
      },
    };
  });

  /* ── 01 · Golden hour: soft bokeh discs drifting through warm light ────── */
  YC.defineScene("bokeh", (canvas) => {
    const ctx = canvas.getContext("2d");
    const PALETTE = ["255,176,92", "255,140,110", "255,120,160", "255,214,130", "255,196,160", "120,220,235"];
    const sprites = new Map();
    let w = 1;
    let h = 1;
    let dpr = 1;
    let discs = [];

    function sprite(color) {
      if (sprites.has(color)) return sprites.get(color);
      const size = 128;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d");
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, `rgba(${color},0.34)`);
      grad.addColorStop(0.72, `rgba(${color},0.26)`);
      grad.addColorStop(0.88, `rgba(${color},0.42)`);
      grad.addColorStop(0.94, `rgba(${color},0.16)`);
      grad.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      sprites.set(color, c);
      return c;
    }

    function seed() {
      const count = Math.round(YC.clamp((w / dpr) / 60, 12, 28));
      discs = Array.from({ length: count }, (_, i) => {
        const z = Math.random();
        return {
          x: Math.random(),
          y: Math.random(),
          z,
          r: (18 + z * 90) * dpr,
          drift: (0.004 + Math.random() * 0.01) * (i % 2 ? 1 : -1),
          rise: 0.006 + Math.random() * 0.012,
          phase: Math.random() * TAU,
          img: sprite(PALETTE[i % PALETTE.length]),
        };
      });
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const sp = YC.scroll.y / Math.max(1, YC.scroll.vh);
      const px = YC.pointer.x / innerWidth - 0.5;
      for (const d of discs) {
        let x = ((d.x + t * d.drift + Math.sin(t * 0.3 + d.phase) * 0.02) % 1 + 1) % 1;
        let y = ((d.y - t * d.rise - sp * 0.08 * (0.3 + d.z)) % 1 + 1) % 1;
        x = x * (w + d.r * 2) - d.r - px * 40 * d.z * dpr;
        y = y * (h + d.r * 2) - d.r;
        const a = 0.55 + 0.45 * Math.sin(t * 0.8 + d.phase);
        ctx.globalAlpha = a * (0.45 + d.z * 0.55);
        ctx.drawImage(d.img, x - d.r, y - d.r, d.r * 2, d.r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    return {
      /* Out-of-focus discs survive a half-resolution, 30fps buffer untouched. */
      step: 1 / 30,
      resize() {
        ({ w, h, dpr } = YC.fitCanvas(canvas, 1, 0.5));
        seed();
        draw(0);
      },
      frame(dt, t) {
        draw(t);
      },
      still() {
        draw(0);
      },
    };
  });

  /* ── 02 · Briefing: reticle tracks the pointer, compass follows heading ── */
  YC.defineScene("briefing", (figure) => {
    const img = figure.querySelector(":scope > img");
    const reticle = figure.querySelector(".brf-reticle");
    const compass = figure.querySelector(".brf-compass");
    const tape = figure.querySelector(".brf-tape");
    const LABELS = ["N", "15", "30", "NE", "60", "75", "E", "105", "120", "SE", "150", "165", "S", "195", "210", "SW", "240", "255", "W", "285", "300", "NW", "330", "345"];
    const STEP = 60;
    const unit = LABELS.length * STEP;
    if (tape && !tape.childElementCount) {
      tape.innerHTML = [...LABELS, ...LABELS, ...LABELS].map((l) => `<span>${l}</span>`).join("");
    }
    let w = figure.clientWidth;
    let h = figure.clientHeight;
    let cw = compass?.clientWidth || 300;
    let inside = false;
    let tx = w * 0.68;
    let ty = h * 0.42;
    let rx = tx;
    let ry = ty;
    let heading = 0;
    let dwell = 0;
    let locked = false;

    figure.addEventListener("pointermove", (event) => {
      const r = figure.getBoundingClientRect();
      tx = event.clientX - r.left;
      ty = event.clientY - r.top;
      inside = true;
      if (YC.motionOK()) {
        img?.style.setProperty("--bx", `${((0.5 - tx / r.width) * 26).toFixed(1)}px`);
        img?.style.setProperty("--by", `${((0.5 - ty / r.height) * 16).toFixed(1)}px`);
      }
    });
    figure.addEventListener("pointerleave", () => {
      inside = false;
      img?.style.setProperty("--bx", "0px");
      img?.style.setProperty("--by", "0px");
    });

    function place() {
      if (reticle) reticle.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (tape) {
        const px = ((heading / 360) * unit % unit + unit) % unit;
        tape.style.transform = `translate3d(${(cw / 2 - STEP / 2 - unit - px).toFixed(1)}px,0,0)`;
      }
    }

    return {
      resize() {
        w = figure.clientWidth;
        h = figure.clientHeight;
        cw = compass?.clientWidth || 300;
        place();
      },
      frame(dt, t) {
        if (!inside) {
          tx = w * (0.66 + 0.13 * Math.sin(t * 0.45));
          ty = h * (0.4 + 0.14 * Math.sin(t * 0.7 + 1.3));
        }
        const k = 1 - Math.exp(-dt * (inside ? 14 : 2.4));
        rx += (tx - rx) * k;
        ry += (ty - ry) * k;
        dwell = inside && Math.hypot(tx - rx, ty - ry) < 5 ? dwell + dt : 0;
        const lock = dwell > 0.35;
        if (lock !== locked) {
          locked = lock;
          figure.classList.toggle("is-locked", lock);
        }
        const targetHeading = (rx / Math.max(1, w) - 0.5) * 160 + t * 3;
        heading += (targetHeading - heading) * (1 - Math.exp(-dt * 5));
        place();
      },
      still() {
        rx = w * 0.68;
        ry = h * 0.42;
        place();
      },
    };
  });

  /* ── 02 · Memory agent: streaming usage with a flagged leak ───────────── */
  YC.defineScene("memchart", (canvas) => {
    const ctx = canvas.getContext("2d");
    const flag = canvas.parentElement?.querySelector(".agent-flag");
    const N = 120;
    const samples = [];
    let w = 1;
    let h = 1;
    let dpr = 1;
    let acc = 0;
    let phase = 0;
    let leak = 0;
    let leakTimer = 3;
    let flagged = false;

    function next() {
      phase += 1;
      if (leak > 0) {
        leak -= 1;
        const last = samples[samples.length - 1]?.v ?? 0.42;
        return { v: Math.min(0.92, last + 0.012 + Math.random() * 0.01), bad: true };
      }
      const saw = ((phase % 26) / 26) * 0.1;
      return { v: 0.34 + saw + (Math.random() - 0.5) * 0.04, bad: false };
    }
    for (let i = 0; i < N; i++) samples.push(next());

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(127,231,255,0.08)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = Math.round((h * i) / 4) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const step = w / (N - 1);
      const offset = acc * step;
      const yOf = (v) => h - v * h * 0.86 - h * 0.06;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(127,231,255,0.28)");
      grad.addColorStop(1, "rgba(127,231,255,0)");
      ctx.beginPath();
      ctx.moveTo(-offset, h);
      samples.forEach((s, i) => ctx.lineTo(i * step - offset, yOf(s.v)));
      ctx.lineTo((N - 1) * step - offset, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 1.6 * dpr;
      ctx.lineJoin = "round";
      for (let i = 1; i < N; i++) {
        const a = samples[i - 1];
        const b = samples[i];
        ctx.strokeStyle = b.bad ? "#ff8a4c" : "#7fe7ff";
        ctx.beginPath();
        ctx.moveTo((i - 1) * step - offset, yOf(a.v));
        ctx.lineTo(i * step - offset, yOf(b.v));
        ctx.stroke();
      }
      const peak = samples.reduce((best, s, i) => (s.bad && s.v > (samples[best]?.v ?? 0) ? i : best), -1);
      if (peak > 0) {
        const x = peak * step - offset;
        const y = yOf(samples[peak].v);
        ctx.strokeStyle = "rgba(255,138,76,0.9)";
        ctx.setLineDash([3 * dpr, 3 * dpr]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#ff8a4c";
        ctx.beginPath();
        ctx.arc(x, y, 3.2 * dpr, 0, TAU);
        ctx.fill();
      }
      const bad = samples.slice(-40).some((s) => s.bad);
      if (bad !== flagged) {
        flagged = bad;
        flag?.style.setProperty("--flag", bad ? "1" : "0");
      }
    }

    return {
      step: 1 / 30,
      resize() {
        ({ w, h, dpr } = YC.fitCanvas(canvas, 1.5));
        draw();
      },
      frame(dt) {
        acc += dt * 9;
        leakTimer -= dt;
        if (leakTimer <= 0) {
          leak = 16 + ((Math.random() * 8) | 0);
          leakTimer = 7 + Math.random() * 4;
        }
        while (acc >= 1) {
          acc -= 1;
          samples.shift();
          samples.push(next());
        }
        draw();
      },
      still() {
        acc = 0;
        draw();
      },
    };
  });
})();
