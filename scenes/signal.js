/* YueSignal: interactive local message routes. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;
  const MODES = [
    { tab: "SIGNAL", name: "SIGNAL", color: "103,230,246", verb: "BROADCAST", target: "LISTENER", summary: "One signal, multiple listeners", fanout: true },
    { tab: "EVENT", name: "DOMAIN EVENT", color: "255,191,111", verb: "PUBLISH", target: "OBSERVER", summary: "Publish a fact to observers", fanout: true },
    { tab: "CMD", name: "COMMAND", color: "255,120,166", verb: "EXECUTE", target: "HANDLER", summary: "Send a command to a handler", fanout: false },
    { tab: "QUERY", name: "QUERY", color: "190,164,255", verb: "REQUEST", target: "RESPONDER", summary: "Request data and receive a reply", fanout: false, reply: true },
  ];
  const MONO = '"JetBrains Mono", Consolas, monospace';
  const TAU = Math.PI * 2;

  YC.defineScene("signal", (canvas) => {
    const ctx = canvas.getContext("2d");
    const modeEl = canvas.closest(".slot")?.querySelector("[data-hud-mode]");
    let width = 1, height = 1, dpr = 1, time = 0, index = 0, idle = 0, manual = false;

    function setMode(n) {
      index = (n + MODES.length) % MODES.length;
      if (modeEl) modeEl.textContent = MODES[index].name;
    }
    function rgba(color, alpha) { return "rgba(" + color + "," + alpha + ")"; }
    function rect(x, y, w, h, radius) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, radius);
      else ctx.rect(x, y, w, h);
    }
    function text(value, x, y, size, color, align, weight) {
      ctx.font = (weight || 600) + " " + size + "px " + MONO;
      ctx.fillStyle = color;
      ctx.textAlign = align || "left";
      ctx.textBaseline = "middle";
      ctx.fillText(value, x, y);
    }
    function path(a, b, color, dim) {
      const mid = (a.x + b.x) / 2;
      ctx.strokeStyle = rgba(color, dim ? 0.2 : 0.58);
      ctx.lineWidth = dim ? 1 : 1.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.bezierCurveTo(mid, a.y, mid, b.y, b.x, b.y);
      ctx.stroke();
      if (!dim) {
        ctx.fillStyle = rgba(color, 0.9);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - 5, b.y - 3); ctx.lineTo(b.x - 5, b.y + 3); ctx.closePath(); ctx.fill();
      }
    }
    function packet(a, b, color, phase, reverse) {
      const p = (time * 0.38 + phase) % 1;
      const t = reverse ? 1 - p : p;
      const mid = (a.x + b.x) / 2;
      const x = Math.pow(1-t,3)*a.x + 3*Math.pow(1-t,2)*t*mid + 3*(1-t)*t*t*mid + t*t*t*b.x;
      const y = Math.pow(1-t,3)*a.y + 3*Math.pow(1-t,2)*t*a.y + 3*(1-t)*t*t*b.y + t*t*t*b.y;
      ctx.save();
      ctx.shadowColor = rgba(color, 0.9); ctx.shadowBlur = 12;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 2.3, 0, TAU); ctx.fill();
      ctx.restore();
    }
    function node(x, y, w, h, title, sub, color, emphasis) {
      ctx.fillStyle = emphasis ? rgba(color, 0.13) : "rgba(17,16,29,0.94)";
      ctx.strokeStyle = rgba(color, emphasis ? 0.85 : 0.45);
      ctx.lineWidth = emphasis ? 1.5 : 1;
      rect(x, y, w, h, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgba(color, emphasis ? 0.95 : 0.65);
      ctx.fillRect(x + 1, y + 1, 3, h - 2);
      text(title, x + w / 2, y + h * (sub ? 0.38 : 0.5), 10, "#f3f2fa", "center", 700);
      if (sub) text(sub, x + w / 2, y + h * 0.71, 10, rgba(color, 0.9), "center", 600);
    }
    function draw() {
      if (!ctx) return;
      const W = width / dpr, H = height / dpr;
      const mode = MODES[index], c = mode.color;
      const small = W < 420;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0d0d18"; ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(W * 0.5, H * 0.53, 0, W * 0.5, H * 0.53, W * 0.55);
      glow.addColorStop(0, rgba(c, 0.13)); glow.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(194,181,235,0.055)"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W; x += 24) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y < H; y += 24) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();

      // Four selectable channels sit below the card's own HUD.
      const margin = 10, tabGap = 4, tabY = 32, tabH = small ? 23 : 28;
      const tabW = (W - margin * 2 - tabGap * 3) / 4;
      MODES.forEach((m, i) => {
        const x = margin + i * (tabW + tabGap), active = i === index;
        ctx.fillStyle = active ? rgba(m.color, 0.19) : "rgba(255,255,255,0.035)";
        ctx.strokeStyle = active ? rgba(m.color, 0.9) : "rgba(201,189,232,0.16)";
        rect(x, tabY, tabW, tabH, 3); ctx.fill(); ctx.stroke();
        text(m.tab, x + tabW / 2, tabY + tabH / 2, small ? 10 : 11, active ? "#fff" : "rgba(225,219,239,0.64)", "center", 700);
      });

      const centerY = small ? H * 0.55 : H * 0.52;
      const nodeW = small ? 74 : Math.min(126, W * 0.22);
      const nodeH = small ? 39 : 58;
      const leftX = 12, rightX = W - nodeW - 12, centerX = (W - nodeW) / 2;
      const gapY = small ? 27 : 43;
      const src = { x: leftX + nodeW, y: centerY };
      const inPoint = { x: centerX, y: centerY };
      const outPoint = { x: centerX + nodeW, y: centerY };
      const destinations = mode.fanout ? [centerY - gapY, centerY + gapY] : [centerY];
      path(src, inPoint, c, false);
      destinations.forEach(y => path(outPoint, { x: rightX, y }, c, false));
      packet(src, inPoint, c, 0, false);
      destinations.forEach((y, i) => packet(outPoint, { x: rightX, y }, c, 0.56 + i * 0.15, false));
      if (mode.reply) {
        packet(outPoint, { x: rightX, y: centerY }, "255,255,255", 0.04, true);
        packet(src, inPoint, "255,255,255", 0.60, true);
      }
      node(leftX, centerY - nodeH / 2, nodeW, nodeH, "SOURCE", mode.verb, c, false);
      node(centerX, centerY - nodeH / 2, nodeW, nodeH, "YUESIGNAL", "TAG + TYPE", c, true);
      destinations.forEach((y, i) => node(rightX, y - nodeH / 2, nodeW, nodeH, mode.target, mode.fanout ? "0" + (i + 1) : (mode.reply ? "REPLY" : "READY"), c, false));

      const footerY = H - (small ? 24 : 29);
      ctx.fillStyle = "rgba(7,7,15,0.75)"; ctx.fillRect(0, footerY - 13, W, 30);
      ctx.fillStyle = rgba(c, 0.95); ctx.fillRect(10, footerY - 3, 5, 5);
      text(small ? (mode.fanout ? "1  →  MANY" : (mode.reply ? "REQUEST  ↔  REPLY" : "1  →  HANDLER")) : mode.summary, 22, footerY, small ? 10 : 12, "rgba(244,241,252,0.9)", "left", 600);
      if (!small) text("LOCAL / WORLD", W - 12, footerY, 10, rgba(c, 0.85), "right", 700);
    }
    function choose(n) {
      manual = true; idle = 0; setMode(n); draw();
    }
    canvas.addEventListener("pointerdown", (event) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
      const W = bounds.width, margin = 10, gap = 4, tabW = (W - margin * 2 - gap * 3) / 4;
      if (y >= 32 && y <= (W < 420 ? 55 : 60)) {
        const tab = Math.floor((x - margin) / (tabW + gap));
        choose(Math.max(0, Math.min(3, tab)));
      } else choose(index + 1);
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter" || event.key === "ArrowRight") { event.preventDefault(); choose(index + 1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); choose(index - 1); }
    });
    setMode(0);
    return {
      resize() { ({ w: width, h: height, dpr } = YC.fitCanvas(canvas, 1.5)); draw(); },
      frame(dt) {
        time += dt;
        if (!manual) { idle += dt; if (idle > 5) { idle = 0; setMode(index + 1); } }
        draw();
      },
      still() { draw(); },
    };
  });
})();

