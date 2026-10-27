/* YueSignal · a schematic of four local communication semantics. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;

  const MODES = [
    { name: "SIGNAL", detail: "BROADCAST", color: "127,231,255" },
    { name: "DOMAIN EVENT", detail: "PUBLISH FACT", color: "255,183,114" },
    { name: "COMMAND", detail: "REQUEST", color: "255,132,174" },
    { name: "QUERY", detail: "REQUEST", color: "184,164,255" },
  ];
  const TAU = Math.PI * 2;

  YC.defineScene("signal", (canvas) => {
    const ctx = canvas.getContext("2d");
    const slot = canvas.closest(".slot");
    const modeEl = slot?.querySelector("[data-hud-mode]");
    const infoEl = slot?.querySelector("[data-hud-info]");
    let w = 1, h = 1, dpr = 1;
    let index = 0, time = 0, lastInput = -99, autoTimer = 0;

    function setMode(next) {
      index = (next + MODES.length) % MODES.length;
      if (modeEl) modeEl.textContent = MODES[index].name;
      if (infoEl) infoEl.textContent = MODES[index].detail + " · LOCAL WORLD";
    }

    function line(x1, y1, x2, y2, color, width) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const unit = Math.min(w / 600, h / 330);
      const cx = w * 0.5, cy = h * 0.5;
      const scale = Math.max(0.1, unit);
      const color = MODES[index].color;

      ctx.fillStyle = "#100e1c";
      ctx.fillRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250 * scale);
      glow.addColorStop(0, "rgba(" + color + ",0.11)");
      glow.addColorStop(1, "rgba(" + color + ",0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const grid = 30 * scale;
      ctx.strokeStyle = "rgba(180,170,220,0.055)";
      ctx.lineWidth = Math.max(1, scale * 0.6);
      ctx.beginPath();
      for (let x = cx % grid; x < w; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = cy % grid; y < h; y += grid) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      const nodes = [
        { x: -185, y: -83 }, { x: 185, y: -83 },
        { x: -185, y: 83 }, { x: 185, y: 83 },
      ];
      const centerRadius = 39 * scale;
      nodes.forEach((node, i) => {
        const x = cx + node.x * scale, y = cy + node.y * scale;
        const active = i === index;
        line(cx, cy, x, y, active ? "rgba(" + color + ",0.7)" : "rgba(166,156,202,0.18)", Math.max(1, scale));
        if (active) {
          const p = (t * 0.55) % 1;
          const px = x + (cx - x) * p, py = y + (cy - y) * p;
          ctx.fillStyle = "rgba(" + color + ",0.95)";
          ctx.shadowColor = "rgba(" + color + ",0.9)";
          ctx.shadowBlur = 12 * scale;
          ctx.beginPath();
          ctx.arc(px, py, 3 * scale, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        const boxW = 125 * scale, boxH = 46 * scale;
        ctx.fillStyle = active ? "rgba(" + color + ",0.13)" : "rgba(24,22,39,0.95)";
        ctx.strokeStyle = active ? "rgba(" + color + ",0.8)" : "rgba(165,155,200,0.27)";
        ctx.lineWidth = Math.max(1, scale);
        ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
        ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold " + (10 * scale) + "px monospace";
        ctx.fillStyle = active ? "rgb(" + color + ")" : "rgba(222,216,238,0.75)";
        ctx.fillText(MODES[i].name, x, y - 5 * scale);
        ctx.font = (8 * scale) + "px monospace";
        ctx.fillStyle = "rgba(202,195,224,0.55)";
        ctx.fillText(MODES[i].detail, x, y + 10 * scale);
      });

      ctx.fillStyle = "#181525";
      ctx.strokeStyle = "rgba(" + color + ",0.85)";
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      ctx.beginPath();
      ctx.arc(cx, cy, centerRadius, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, centerRadius + 7 * scale, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.55);
      ctx.strokeStyle = "rgba(" + color + ",0.22)";
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f6f2ff";
      ctx.font = "bold " + (12 * scale) + "px monospace";
      ctx.fillText("YUE", cx, cy - 7 * scale);
      ctx.font = (9 * scale) + "px monospace";
      ctx.fillStyle = "rgb(" + color + ")";
      ctx.fillText("SIGNAL", cx, cy + 9 * scale);

      ctx.fillStyle = "rgba(204,197,226,0.48)";
      ctx.font = (9 * scale) + "px monospace";
      ctx.textAlign = "left";
      ctx.fillText("LOCAL WORLD", 20 * scale, h - 19 * scale);
      ctx.textAlign = "right";
      ctx.fillText("04 / CHANNELS", w - 20 * scale, h - 19 * scale);
    }

    canvas.addEventListener("pointerdown", () => {
      lastInput = time;
      setMode(index + 1);
      if (!YC.motionOK()) draw(0);
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      lastInput = time;
      setMode(index + 1);
      if (!YC.motionOK()) draw(0);
    });

    setMode(0);
    return {
      resize() {
        ({ w, h, dpr } = YC.fitCanvas(canvas, 1.5));
        draw(time);
      },
      frame(dt) {
        time += dt;
        if (time - lastInput > 8) {
          autoTimer += dt;
          if (autoTimer > 3.8) { autoTimer = 0; setMode(index + 1); }
        } else autoTimer = 0;
        draw(time);
      },
      still() { draw(0); },
    };
  });
})();

