/* Save slot 02 · Cyber2026: an architecture inspector for the rhythm-shooter
   stack. Walks the event bus, Early/Late/Miss judgment timeline, mask layers,
   death chain reaction and the Controller → Character → Subsystem → UI split
   documented in ARCHITECTURE.md — not a toy rhythm game. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;
  const TAU = Math.PI * 2;
  const MONO = '"JetBrains Mono", Consolas, monospace';
  const FLOWS = [
    { id: "BUS", label: "EVENT BUS", title: "UDelegatesSubsystem", sub: "Game logic broadcasts · UI only binds" },
    { id: "BEAT", label: "RHYTHM JUDGE", title: "Early / Late / Miss", sub: "Windowed fire, not one flat hitbox" },
    { id: "MASK", label: "MASK LAYERS", title: "Red / Blue visibility", sub: "Same world, different enemy filters" },
    { id: "CHAIN", label: "DEATH CHAIN", title: "Proximity cascade", sub: "Death damages neighbours · guarded" },
    { id: "LAYERS", label: "LAYERS", title: "Separation of concerns", sub: "Controller · Character · Component · UI" },
  ];
  const MULT = [
    [1, 4, "1.0×"],
    [5, 9, "1.1×"],
    [10, 19, "1.2×"],
    [20, 39, "1.4×"],
    [40, 99, "2.0×"],
  ];

  YC.defineScene("rhythm", (canvas) => {
    const ctx = canvas.getContext("2d");
    const modeEl = canvas.closest(".slot")?.querySelector("[data-hud-mode]");
    let w = 480;
    let h = 300;
    let dpr = 1;
    let time = 0;
    let flow = 0;
    let flowT = 0;
    let autoTimer = 0;
    let lastInput = -99;
    let hover = -1;
    let combo = 12;
    let events = [];
    let packets = [];
    let chainBurst = 0;

    function setMode(text) {
      if (modeEl && modeEl.textContent !== text) modeEl.textContent = text;
    }
    setMode(FLOWS[0].id);

    function emit(text, color = "#c8f7fb") {
      events.unshift({ text, color, life: 2.6 });
      if (events.length > 5) events.length = 5;
    }
    function packet(from, to, color) {
      packets.push({ from: [...from], to: [...to], t: 0, color });
    }
    function roundRect(x, y, rw, rh, r) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, rw, rh, Math.min(r, rw / 2, rh / 2));
      else ctx.rect(x, y, rw, rh);
    }
    function node(x, y, rw, rh, title, lines, accent, lit) {
      ctx.fillStyle = lit ? "rgba(10,18,28,0.94)" : "rgba(8,12,20,0.9)";
      ctx.strokeStyle = lit ? accent : "rgba(255,255,255,0.12)";
      ctx.lineWidth = lit ? 1.7 : 1;
      roundRect(x, y, rw, rh, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = `700 9px ${MONO}`;
      ctx.fillText(title, x + 10, y + 13);
      ctx.fillStyle = "rgba(238,247,255,0.88)";
      ctx.font = `500 10.5px ${MONO}`;
      lines.forEach((line, i) => ctx.fillText(line, x + 10, y + 30 + i * 13));
    }
    function wire(a, b, color, on) {
      ctx.strokeStyle = on ? color : "rgba(255,255,255,0.1)";
      ctx.lineWidth = on ? 1.7 : 1;
      ctx.beginPath();
      const mx = (a[0] + b[0]) / 2;
      ctx.moveTo(a[0], a[1]);
      ctx.bezierCurveTo(mx, a[1], mx, b[1], b[0], b[1]);
      ctx.stroke();
    }

    function drawBus() {
      const bus = [w * 0.3, h * 0.34, w * 0.4, 56];
      node(bus[0], bus[1], bus[2], bus[3], "UDelegatesSubsystem", ["GameInstance scope · multicast"], "#62e6f0", true);
      const pubs = [
        [w * 0.05, h * 0.18, "AHero", ["Fire / Mask / SP"]],
        [w * 0.05, h * 0.58, "HealthComponent", ["OnHealthChanged"]],
      ];
      const subs = [
        [w * 0.7, h * 0.18, "UFightHud", ["HP · SP bars"]],
        [w * 0.7, h * 0.48, "Mask flash", ["OnFireFlash"]],
        [w * 0.7, h * 0.72, "TimeWidget", ["pause on Death"]],
      ];
      pubs.forEach((p, i) => {
        node(p[0], p[1], w * 0.22, 54, p[2], p[3], "#ff4fa3", flowT > i * 0.2);
        wire([p[0] + w * 0.22, p[1] + 27], [bus[0], bus[1] + 28], "#ff4fa3", flowT > 0.2);
        if (flowT > 0.25 + i * 0.15) packet([p[0] + w * 0.22, p[1] + 27], [bus[0], bus[1] + 28], "#ff4fa3");
      });
      subs.forEach((s, i) => {
        node(s[0], s[1], w * 0.26, 46, s[2], s[3], "#ffd479", flowT > 0.35 + i * 0.15);
        wire([bus[0] + bus[2], bus[1] + 28], [s[0], s[1] + 23], "#62e6f0", flowT > 0.4);
        if (flowT > 0.45 + i * 0.12) packet([bus[0] + bus[2], bus[1] + 28], [s[0], s[1] + 23], "#62e6f0");
      });
      if (Math.floor(time * 1.2) !== Math.floor((time - 0.016) * 1.2)) {
        const names = ["OnHealthPercentChanged", "OnSPPercentChanged", "OnMaskStateChanged", "OnFireFlash"];
        emit(names[Math.floor(time) % names.length] + " → UI", "#62e6f0");
      }
    }

    function drawBeat() {
      const y = h * 0.42;
      const left = 24;
      const right = w - 24;
      const mid = (left + right) / 2;
      const beat = ((time / 0.47) % 1);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      // Late / Perfect / Early windows
      const late = [mid - 70, mid - 18];
      const perfect = [mid - 18, mid + 18];
      const early = [mid + 18, mid + 70];
      [[late, "#ff9a5c", "LATE"], [perfect, "#ffd479", "PERFECT"], [early, "#62e6f0", "EARLY"]].forEach(([r, c, label]) => {
        ctx.fillStyle = c + "33";
        ctx.fillRect(r[0], y - 28, r[1] - r[0], 56);
        ctx.fillStyle = c;
        ctx.font = `700 9px ${MONO}`;
        ctx.fillText(label, (r[0] + r[1]) / 2 - 18, y - 34);
      });
      ctx.fillStyle = "#fff";
      ctx.fillRect(mid - 1, y - 36, 2, 72);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = `600 8px ${MONO}`;
      ctx.fillText("BEAT", mid - 14, y + 48);
      // playhead
      const px = left + (right - left) * beat;
      ctx.fillStyle = "#ff4fa3";
      ctx.beginPath();
      ctx.moveTo(px, y - 40);
      ctx.lineTo(px + 6, y - 28);
      ctx.lineTo(px - 6, y - 28);
      ctx.closePath();
      ctx.fill();
      // combo table
      MULT.forEach((row, i) => {
        const on = combo >= row[0] && combo <= row[1];
        ctx.fillStyle = on ? "#ffd479" : "rgba(255,255,255,0.4)";
        ctx.font = `700 9px ${MONO}`;
        ctx.fillText(`${row[0]}–${row[1]}  →  ${row[2]}`, 20 + i * 90, h - 18);
      });
      ctx.fillStyle = "#ff4fa3";
      ctx.font = `800 18px ${MONO}`;
      ctx.fillText(`COMBO ${combo}`, w - 130, 70);
      if (Math.floor(time * 2) !== Math.floor((time - 0.016) * 2)) {
        const kind = beat < 0.18 ? "Late Hit → ExecuteFire()" : beat > 0.82 ? "Early Hit → SetTimer(to beat)" : beat > 0.45 && beat < 0.55 ? "On-beat · SP +10" : "Off-window";
        if (kind !== "Off-window") emit(kind, beat > 0.45 && beat < 0.55 ? "#ffd479" : "#62e6f0");
        if (beat > 0.45 && beat < 0.55) combo = Math.min(48, combo + 1);
      }
    }

    function drawMask() {
      const mask = Math.floor(time / 2.4) % 2;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `700 10px ${MONO}`;
      ctx.fillText(`ACTIVE MASK · ${mask ? "RED" : "BLUE"}`, 16, 72);
      for (let i = 0; i < 8; i++) {
        const x = 30 + (i % 4) * 110;
        const y = 96 + Math.floor(i / 4) * 90;
        const red = i % 2 === 0;
        const visible = (mask === 1 && red) || (mask === 0 && !red);
        ctx.globalAlpha = visible ? 1 : 0.18;
        ctx.fillStyle = red ? "#ff4fa3" : "#3de0ff";
        ctx.strokeStyle = visible ? "#fff" : "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + 30, y + 28, 22, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#0b0b12";
        ctx.font = `800 9px ${MONO}`;
        ctx.fillText(red ? "RED" : "BLU", x + 18, y + 32);
        ctx.globalAlpha = 1;
        ctx.fillStyle = visible ? "#ffd479" : "rgba(255,255,255,0.3)";
        ctx.font = `600 8px ${MONO}`;
        ctx.fillText(visible ? "VISIBLE" : "CULLED", x + 8, y + 62);
      }
      if (Math.floor(time / 2.4) !== Math.floor((time - 0.016) / 2.4)) emit(`Mask.Switch(${mask ? "RED" : "BLUE"}) → UI`, "#ff4fa3");
    }

    function drawChain() {
      const cx = w * 0.5;
      const cy = h * 0.52;
      const enemies = [];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + time * 0.2;
        enemies.push({ x: cx + Math.cos(a) * 90, y: cy + Math.sin(a) * 58, dead: false, flash: 0 });
      }
      const epicenter = Math.floor(time / 2.8) % enemies.length;
      enemies[epicenter].dead = flowT > 0.2;
      enemies.forEach((e, i) => {
        const d = Math.hypot(e.x - enemies[epicenter].x, e.y - enemies[epicenter].y);
        if (enemies[epicenter].dead && d < 78 && i !== epicenter) e.flash = Math.max(0, 1 - (time % 2.8) / 1.2);
      });
      // radius
      ctx.strokeStyle = "rgba(255,79,163,0.35)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(enemies[epicenter].x, enemies[epicenter].y, 70, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      enemies.forEach((e, i) => {
        ctx.fillStyle = e.dead ? "rgba(80,60,70,0.7)" : e.flash > 0 ? `rgba(255,212,121,${0.4 + e.flash * 0.6})` : "#3de0ff";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.dead ? 10 : 14, 0, TAU);
        ctx.fill();
        if (i === epicenter && e.dead) {
          ctx.strokeStyle = "#ff4fa3";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, 18 + (time % 1) * 10, 0, TAU);
          ctx.stroke();
        }
      });
      ctx.fillStyle = "rgba(238,247,255,0.75)";
      ctx.font = `600 10px ${MONO}`;
      ctx.fillText("Death → neighbours in 1m take 50 dmg · HitVictims de-dupes", 16, h - 16);
      if (flowT > 0.25 && chainBurst !== Math.floor(time / 2.8)) {
        chainBurst = Math.floor(time / 2.8);
        emit("Death cascade · guarded", "#ff4fa3");
      }
    }

    function drawLayers() {
      const layers = [
        { t: "CONTROL", d: "AHeroController · Enhanced Input · UI mode", c: "#ff4fa3" },
        { t: "CHARACTER", d: "AHero · rhythm / mask / stamina / combo", c: "#62e6f0" },
        { t: "COMPONENT", d: "UHealthComponent · reusable damage / heal", c: "#ffd479" },
        { t: "SUBSYSTEM", d: "UDelegatesSubsystem · global event bus", c: "#a58bff" },
        { t: "UI", d: "UFightHud / TimeWidget · bind & unbind", c: "#7dffb0" },
      ];
      layers.forEach((l, i) => {
        const y = 68 + i * 38;
        const lit = flowT > i * 0.16;
        ctx.globalAlpha = lit ? 1 : 0.35;
        ctx.fillStyle = "rgba(10,16,24,0.92)";
        ctx.strokeStyle = l.c;
        ctx.lineWidth = 1.5;
        roundRect(24, y, w - 48, 32, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = l.c;
        ctx.font = `800 11px ${MONO}`;
        ctx.fillText(l.t, 36, y + 20);
        ctx.fillStyle = "rgba(238,247,255,0.8)";
        ctx.font = `500 10px ${MONO}`;
        ctx.fillText(l.d, 150, y + 20);
        ctx.globalAlpha = 1;
        if (i < layers.length - 1 && lit) {
          ctx.fillStyle = l.c;
          ctx.fillRect(w / 2 - 1, y + 32, 2, 6);
        }
      });
    }

    const drawers = [drawBus, drawBeat, drawMask, drawChain, drawLayers];

    function drawChrome() {
      // synthwave-ish dark bg without looking like a game stage
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#10081c");
      g.addColorStop(1, "#070412");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(98,230,240,0.05)";
      ctx.beginPath();
      for (let x = 0; x < w; x += 28) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(98,230,240,0.9)";
      ctx.font = `800 11px ${MONO}`;
      ctx.fillText("ARCHITECTURE · " + FLOWS[flow].label, 12, 18);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `600 9px ${MONO}`;
      ctx.fillText(FLOWS[flow].sub, 12, 32);
      const tabW = Math.min(78, (w - 24) / FLOWS.length - 4);
      FLOWS.forEach((f, i) => {
        const x = 12 + i * (tabW + 4);
        const on = i === flow || i === hover;
        ctx.fillStyle = on ? "rgba(98,230,240,0.2)" : "rgba(255,255,255,0.05)";
        roundRect(x, 42, tabW, 18, 4);
        ctx.fill();
        ctx.fillStyle = on ? "#c8f7fb" : "rgba(255,255,255,0.4)";
        ctx.font = `700 8px ${MONO}`;
        ctx.fillText(f.id, x + 6, 54);
      });
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = `600 8px ${MONO}`;
      ctx.fillText("CLICK TAB · SPACE NEXT", w - 138, 18);
      events.forEach((e, i) => {
        ctx.globalAlpha = Math.min(1, e.life);
        ctx.fillStyle = e.color;
        ctx.font = `600 9px ${MONO}`;
        ctx.textAlign = "right";
        ctx.fillText("EVT  " + e.text, w - 12, 72 + i * 12);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      });
    }

    function setFlow(next) {
      flow = (next + FLOWS.length) % FLOWS.length;
      flowT = 0;
      packets.length = 0;
      setMode(FLOWS[flow].id);
      emit(FLOWS[flow].title, "#ffd479");
      lastInput = time;
    }
    function tabAt(x) {
      const tabW = Math.min(78, (w - 24) / FLOWS.length - 4);
      for (let i = 0; i < FLOWS.length; i++) {
        const left = 12 + i * (tabW + 4);
        if (x >= left && x <= left + tabW) return i;
      }
      return -1;
    }
    function localX(event) {
      const r = canvas.getBoundingClientRect();
      return ((event.clientX - r.left) / r.width) * w;
    }
    canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType === "mouse") hover = tabAt(localX(event));
    });
    canvas.addEventListener("pointerleave", () => (hover = -1));
    canvas.addEventListener("pointerdown", (event) => {
      const i = tabAt(localX(event));
      setFlow(i >= 0 ? i : flow + 1);
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter" || event.key === "ArrowRight") {
        event.preventDefault();
        setFlow(flow + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setFlow(flow - 1);
      }
    });
    emit("UDelegatesSubsystem online", "#62e6f0");

    return {
      resize() {
        const fit = YC.fitCanvas(canvas, 1.5);
        dpr = fit.dpr;
        w = fit.w / dpr;
        h = fit.h / dpr;
      },
      frame(dt) {
        time += dt;
        flowT = Math.min(1, flowT + dt * 0.55);
        for (const e of events) e.life -= dt;
        events = events.filter((e) => e.life > 0);
        for (const p of packets) p.t += dt * 1.5;
        packets = packets.filter((p) => p.t < 1);
        if (time - lastInput > 4.5) {
          autoTimer += dt;
          if (autoTimer > 3.2) {
            autoTimer = 0;
            setFlow(flow + 1);
          }
        } else autoTimer = 0;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawChrome();
        drawers[flow]();
        for (const p of packets) {
          const t = Math.min(1, p.t);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.from[0] + (p.to[0] - p.from[0]) * t, p.from[1] + (p.to[1] - p.from[1]) * t, 3, 0, TAU);
          ctx.fill();
        }
      },
      still() {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        flowT = 1;
        drawChrome();
        drawers[flow]();
      },
    };
  });
})();
