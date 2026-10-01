/* Chapter details that are DOM-driven rather than canvas scenes: the player
   card flip, LuckyTri's candy sky and memory line, skill-tree links,
   Blueprint exec wires and the arcade CONTINUE? countdown. */
(() => {
  const YC = window.YC;
  if (!YC) return;
  const SVG = "http://www.w3.org/2000/svg";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hash = (n) => {
    const x = Math.sin(n * 91.3 + 17.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const visible = (el, margin = "80px 0px") => {
    const state = { on: false };
    if (el) new IntersectionObserver(([e]) => (state.on = e.isIntersecting), { rootMargin: margin }).observe(el);
    return state;
  };
  /* Layout position inside an ancestor, ignoring reveal transforms. */
  const offsetIn = (el, ancestor) => {
    let x = 0;
    let y = 0;
    let node = el;
    while (node && node !== ancestor) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return node === ancestor ? [x, y] : null;
  };

  /* ── 01 · Player card flip ───────────────────────────────────────────── */
  const card = document.querySelector(".player-card");
  const flipButton = document.querySelector(".pc-flip");
  function flip() {
    if (!card) return;
    const on = !card.classList.contains("is-flipped");
    card.classList.toggle("is-flipped", on);
    flipButton?.setAttribute("aria-pressed", String(on));
    if (YC.motionOK()) {
      const r = card.getBoundingClientRect();
      YC.sparks?.burst(r.left + r.width / 2, r.top + r.height * 0.4, 16);
    }
  }
  card?.addEventListener("click", flip);
  flipButton?.addEventListener("click", flip);

  /* ── Side quest · candy sky ──────────────────────────────────────────── */
  const sky = document.querySelector(".sq-sky");
  if (sky && !sky.childElementCount) {
    const kinds = ["tri", "star", "ring", "dots", "star", "tri"];
    const colors = ["#ff9ec7", "#7fdcff", "#ffe27a", "#9ff0d6", "#c7a8ff", "#ffb8a3"];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 18; i++) {
      const el = document.createElement("i");
      const kind = kinds[i % kinds.length];
      el.className = `sq-shape ${kind}`;
      const edge = i % 2 ? 0.72 + hash(i) * 0.26 : hash(i) * 0.26;
      const size = kind === "dots" ? 70 + hash(i + 9) * 60 : 16 + hash(i + 3) * 44;
      el.style.cssText = [
        `--x:${(edge * 100).toFixed(1)}%`,
        `--y:${(4 + hash(i + 1) * 88).toFixed(1)}%`,
        `--s:${size.toFixed(0)}px`,
        `--c:${colors[i % colors.length]}`,
        `--o:${(0.5 + hash(i + 5) * 0.45).toFixed(2)}`,
        `--depth:${(60 + hash(i + 7) * 260).toFixed(0)}`,
        `--dur:${(7 + hash(i + 11) * 8).toFixed(1)}s`,
        `--del:${(-hash(i + 13) * 8).toFixed(1)}s`,
        `--fx:${((hash(i + 15) - 0.5) * 40).toFixed(0)}px`,
        `--fy:${(-10 - hash(i + 17) * 30).toFixed(0)}px`,
        `--fr:${((hash(i + 19) - 0.5) * 120).toFixed(0)}deg`,
      ].join(";");
      frag.append(el);
    }
    sky.append(frag);
  }

  /* LuckyTri replies after a short "typing…" beat whenever the card appears. */
  const chat = document.querySelector(".lt-chat");
  let typingTimer = 0;
  YC.onReveal?.((el) => {
    if (!chat || !el.classList.contains("lt-card") || !YC.motionOK()) return;
    chat.classList.add("is-typing");
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => chat.classList.remove("is-typing"), 1500);
  });

  /* Memory line: the path draws with scroll and lights each node it reaches. */
  const memory = document.querySelector(".memory-line");
  const memPath = memory?.querySelector(".mem-path");
  const memNodes = memory ? [...memory.querySelectorAll(".mem-nodes li")] : [];
  if (memPath && memNodes.length) {
    try {
      const len = memPath.getTotalLength();
      const samples = [];
      for (let i = 0; i <= 200; i++) samples.push(memPath.getPointAtLength((len * i) / 200));
      memNodes.forEach((li, n) => {
        const x = (n + 0.5) * 200;
        const p = samples.reduce((best, s) => (Math.abs(s.x - x) < Math.abs(best.x - x) ? s : best), samples[0]);
        li.style.setProperty("--ny", `${p.y.toFixed(1)}px`);
      });
    } catch { /* SVG geometry unavailable: CSS fallback positions apply */ }
  }
  const memVisible = visible(memory);
  let memDraw = -1;
  /* Cached layout offset: reading getBoundingClientRect every frame forces a
     synchronous style + layout pass right after the scroll writes. */
  let memTop = null;
  const remeasureMemory = () => (memTop = null);
  addEventListener("resize", remeasureMemory, { passive: true });
  new ResizeObserver(remeasureMemory).observe(document.body);
  function documentTop(el) {
    let top = 0;
    for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  }
  function setDraw(value) {
    if (Math.abs(value - memDraw) < 0.002) return;
    memDraw = value;
    memory.style.setProperty("--draw", value.toFixed(3));
    memNodes.forEach((li, n) => li.classList.toggle("lit", value >= (n + 0.5) / memNodes.length - 0.02));
  }
  if (memory) {
    YC.tick(() => {
      if (!YC.motionOK()) return setDraw(1);
      if (!memVisible.on) return;
      if (memTop === null) memTop = documentTop(memory);
      const top = memTop - YC.scroll.y;
      setDraw(clamp((YC.scroll.vh * 0.9 - top) / (YC.scroll.vh * 0.55), 0, 1));
    });
  }

  /* ── 04 · Skill tree links ───────────────────────────────────────────── */
  const board = document.querySelector(".skill-board");
  const linkSvg = board?.querySelector(".skill-links");
  const core = board?.querySelector(".skill-core");
  let links = [];
  function drawSkillLinks() {
    if (!board || !linkSvg || !core) return;
    const cards = [...board.querySelectorAll(".ability")];
    const rects = cards
      .map((el) => {
        const at = offsetIn(el, board);
        return at && { el, x: at[0] + el.offsetWidth / 2, top: at[1], bottom: at[1] + el.offsetHeight };
      })
      .filter(Boolean);
    if (!rects.length) return;
    const rows = [];
    rects.forEach((r) => {
      const row = rows.find((list) => Math.abs(list[0].top - r.top) < 12);
      if (row) row.push(r);
      else rows.push([r]);
    });
    rows.sort((a, z) => a[0].top - z[0].top);
    const ox = board.clientWidth / 2;
    const oy = core.offsetTop + core.offsetHeight + 6;
    const bus = oy + (rows[0][0].top - oy) * 0.5;
    const paths = [];
    rows.forEach((row, ri) => {
      row.forEach((r) => {
        let d;
        let parent = null;
        if (ri === 0) {
          const dir = Math.sign(r.x - ox);
          const rad = Math.min(10, Math.abs(r.x - ox) / 2);
          d = dir === 0
            ? `M${ox} ${oy} V${r.top}`
            : `M${ox} ${oy} V${bus - rad} Q${ox} ${bus} ${ox + dir * rad} ${bus} H${r.x - dir * rad} Q${r.x} ${bus} ${r.x} ${bus + rad} V${r.top}`;
        } else {
          parent = rows[ri - 1].reduce((best, p) => (Math.abs(p.x - r.x) < Math.abs(best.x - r.x) ? p : best));
          d = `M${parent.x} ${parent.bottom} C${parent.x} ${(parent.bottom + r.top) / 2} ${r.x} ${(parent.bottom + r.top) / 2} ${r.x} ${r.top}`;
        }
        paths.push({ d, el: r.el, parent: parent?.el || null });
      });
    });
    linkSvg.setAttribute("viewBox", `0 0 ${board.clientWidth} ${board.clientHeight}`);
    linkSvg.innerHTML = paths.map((p) => `<path class="link-base" d="${p.d}"/><path class="link-flow" d="${p.d}"/>`).join("");
    const flows = linkSvg.querySelectorAll(".link-flow");
    links = paths.map((p, i) => ({ ...p, flow: flows[i] }));
  }
  function lightPath(el, on) {
    let current = el;
    while (current) {
      const link = links.find((l) => l.el === current);
      if (!link) break;
      link.flow?.classList.toggle("on", on);
      current = link.parent;
    }
  }
  board?.addEventListener("pointerover", (event) => {
    const ability = event.target.closest(".ability");
    if (ability) lightPath(ability, true);
  });
  board?.addEventListener("pointerout", (event) => {
    const ability = event.target.closest(".ability");
    if (ability && !ability.contains(event.relatedTarget)) lightPath(ability, false);
  });
  board?.addEventListener("focusin", (event) => {
    const ability = event.target.closest(".ability");
    if (ability) lightPath(ability, true);
  });
  board?.addEventListener("focusout", (event) => {
    const ability = event.target.closest(".ability");
    if (ability) lightPath(ability, false);
  });

  /* ── 05 · Blueprint exec wires ───────────────────────────────────────── */
  const graph = document.querySelector(".bp-graph");
  const wireSvg = graph?.querySelector(".bp-wires");
  function drawWires() {
    if (!graph || !wireSvg) return;
    const nodes = [...graph.querySelectorAll(".bp-node")];
    const pin = (node, cls) => {
      const el = node.querySelector(`.pin-exec.${cls}`);
      const at = el && offsetIn(el, graph);
      return at ? [at[0] + el.offsetWidth / 2, at[1] + el.offsetHeight / 2] : null;
    };
    const f = (n) => n.toFixed(1);
    let d = "";
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = pin(nodes[i], "out");
      const z = pin(nodes[i + 1], "in");
      if (!a || !z) continue;
      if (z[0] > a[0]) {
        const dx = Math.max(40, (z[0] - a[0]) * 0.5);
        d += `M${f(a[0])} ${f(a[1])} C${f(a[0] + dx)} ${f(a[1])} ${f(z[0] - dx)} ${f(z[1])} ${f(z[0])} ${f(z[1])} `;
      } else {
        const next = offsetIn(nodes[i + 1], graph);
        const gap = next ? next[1] - 22 : (a[1] + z[1]) / 2;
        d += `M${f(a[0])} ${f(a[1])} C${f(a[0] + 56)} ${f(a[1])} ${f(a[0] + 56)} ${f(gap)} ${f(a[0] + 8)} ${f(gap)} `;
        d += `L${f(z[0] - 8)} ${f(gap)} C${f(z[0] - 56)} ${f(gap)} ${f(z[0] - 56)} ${f(z[1])} ${f(z[0])} ${f(z[1])} `;
      }
    }
    wireSvg.setAttribute("viewBox", `0 0 ${graph.clientWidth} ${graph.clientHeight}`);
    wireSvg.innerHTML = d ? `<path class="wire-glow" d="${d}"/><path class="wire" d="${d}"/><path class="wire-pulse" d="${d}"/>` : "";
  }

  /* Blueprint grid pans a little with the pointer, like dragging the graph. */
  const notes = document.querySelector(".notes");
  const bpPan = notes?.querySelector(".bp-grid-pan");
  const notesVisible = visible(notes);
  const pan = { x: 0, y: 0, tx: 0, ty: 0, out: "" };
  const TILE = 128;
  const wrap = (v) => ((v % TILE) + TILE) % TILE;
  notes?.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pan.tx = (event.clientX / innerWidth - 0.5) * -40;
    pan.ty = (event.clientY / innerHeight - 0.5) * -30;
  });
  YC.tick((dt) => {
    if (!bpPan || !notesVisible.on || !YC.motionOK()) return;
    const k = 1 - Math.exp(-dt * 4);
    pan.x += (pan.tx - pan.x) * k;
    pan.y += (pan.ty - pan.y) * k;
    const out = `translate3d(${wrap(pan.x).toFixed(1)}px,${wrap(pan.y - YC.scroll.y * 0.08).toFixed(1)}px,0)`;
    if (out !== pan.out) bpPan.style.transform = pan.out = out;
  });

  /* Relayout links whenever content or layout changes. */
  let relayoutQueued = false;
  function relayout() {
    if (relayoutQueued) return;
    relayoutQueued = true;
    requestAnimationFrame(() => {
      relayoutQueued = false;
      drawSkillLinks();
      drawWires();
    });
  }
  document.addEventListener("yc:rendered", relayout);
  if (board) new ResizeObserver(relayout).observe(board);
  if (graph) new ResizeObserver(relayout).observe(graph);
  document.fonts?.ready.then(relayout);

  /* ── Ending · CONTINUE? countdown ────────────────────────────────────── */
  const ending = document.querySelector(".ending");
  const cont = ending?.querySelector(".continue");
  const count = ending?.querySelector(".continue-count");
  const endingVisible = visible(ending, "0px");
  let n = 9;
  let timer = 0;
  let hold = false;
  cont?.addEventListener("pointerenter", () => (hold = true));
  cont?.addEventListener("pointerleave", () => (hold = false));
  cont?.addEventListener("focus", () => (hold = true));
  cont?.addEventListener("blur", () => (hold = false));
  YC.tick((dt) => {
    if (!count || !endingVisible.on || hold || !YC.motionOK()) return;
    timer += dt;
    if (timer < 1) return;
    timer = 0;
    n = n > 0 ? n - 1 : 9;
    count.textContent = String(n);
    count.classList.remove("tick");
    void count.offsetWidth;
    count.classList.add("tick");
  });
})();
