/* YueC.exe engine: a single requestAnimationFrame loop drives smooth scrolling,
   scroll-linked variables, the cursor and every live scene. Scenes register via
   YC.defineScene() and only tick while visible and while motion is allowed. */
(() => {
  "use strict";

  const root = document.documentElement;
  const YC = (window.YC = window.YC || {});
  const reduceQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  YC.clamp = clamp;

  /* ── Preferences ─────────────────────────────────────────────────────── */
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* storage disabled */ }
    },
  };
  YC.store = store;
  let userPaused = store.get("portfolioMotion") === "paused";
  const motionListeners = new Set();
  YC.motionOK = () => !reduceQuery.matches && !userPaused;
  YC.motionLockedBySystem = () => reduceQuery.matches;
  YC.onMotionChange = (fn) => motionListeners.add(fn);
  YC.setMotion = (enabled) => {
    userPaused = !enabled;
    store.set("portfolioMotion", enabled ? "enabled" : "paused");
    applyMotion();
  };
  function applyMotion() {
    const ok = YC.motionOK();
    root.classList.toggle("motion-paused", !ok);
    if (!ok) {
      root.classList.remove("is-booting", "has-cursor");
      stopLenis();
      markHeroReady();
      root.querySelector(".hero")?.classList.add("hero-in");
    } else {
      startLenis();
    }
    for (const fn of motionListeners) fn(ok);
  }
  reduceQuery.addEventListener("change", applyMotion);

  /* ── Clock ───────────────────────────────────────────────────────────── */
  const tasks = new Set();
  const stats = { ms: 16.7, fps: 60, scenes: 0 };
  let timeScale = 1;
  let sceneTime = 0;
  let last = performance.now();
  let rateTimer = 0;
  YC.tick = (fn) => {
    tasks.add(fn);
    return () => tasks.delete(fn);
  };
  YC.timeScale = () => timeScale;
  YC.setTimeScale = (scale) => {
    timeScale = clamp(scale, 0.05, 4);
    syncAnimationRate();
    clearInterval(rateTimer);
    if (timeScale !== 1) rateTimer = setInterval(syncAnimationRate, 700);
  };
  function syncAnimationRate() {
    if (!document.getAnimations) return;
    for (const a of document.getAnimations()) a.playbackRate = timeScale;
  }
  /* Adaptive quality: sustained slow frames switch the session to a lighter
     mode (30fps canvases, no large ambient loops) instead of staying janky.
     Gaps over 150ms are throttled/background frames, not jank, and reset it. */
  let slowTime = 0;
  YC.lite = false;
  YC.setLite = (on) => {
    YC.lite = !!on;
    root.classList.toggle("perf-lite", YC.lite);
    slowTime = 0;
  };
  function governor(gap) {
    if (YC.lite || document.hidden || !YC.motionOK() || root.classList.contains("is-booting")) return;
    if (gap > 150) {
      slowTime = 0;
      return;
    }
    slowTime = gap > 28 ? slowTime + gap : Math.max(0, slowTime - gap * 2);
    if (slowTime > 2500) {
      YC.setLite(true);
      console.info("[YC] Sustained slow frames: switched to lite mode (r.lite 0 to undo).");
    }
  }
  function frame(now) {
    requestAnimationFrame(frame);
    governor(now - last);
    const raw = Math.min(now - last, 100);
    last = now;
    stats.ms += (raw - stats.ms) * 0.06;
    stats.fps = 1000 / stats.ms;
    const dt = (raw / 1000) * timeScale;
    sceneTime += dt;
    if (lenis) lenis.raf(now);
    for (const fn of tasks) fn(dt, sceneTime, now);
  }
  requestAnimationFrame(frame);

  /* ── Smooth scroll (Lenis) ───────────────────────────────────────────── */
  let lenis = null;
  function startLenis() {
    if (lenis || !window.Lenis || !YC.motionOK()) return;
    lenis = new window.Lenis({
      autoRaf: false,
      lerp: 0.105,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => !!node.closest?.(".reader, .console, [data-lenis-prevent]"),
    });
  }
  function stopLenis() {
    if (!lenis) return;
    lenis.destroy();
    lenis = null;
    root.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");
  }
  YC.lockScroll = (locked) => {
    root.classList.toggle("scroll-locked", locked);
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  };
  YC.jumpTo = (y) => {
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo({ top: y, behavior: "instant" });
  };
  YC.scrollTo = (y, duration = 1.2) => {
    if (lenis) lenis.scrollTo(y, { duration, force: true });
    else window.scrollTo({ top: y, behavior: YC.motionOK() ? "smooth" : "instant" });
  };

  /* ── Scroll-linked state ─────────────────────────────────────────────── */
  const scroll = { y: scrollY, vh: innerHeight, vw: innerWidth, max: 1, velocity: 0, dir: 1 };
  YC.scroll = scroll;
  const hero = document.querySelector(".hero");
  const hud = document.querySelector(".hud-top");
  const progressTargets = [...document.querySelectorAll(".reading-progress, .hud-rail")];
  /* Scroll variables go on the few small elements that read them: a custom
     property set on a section root would restyle every node inside it. */
  const heroTargets = hero ? [...hero.querySelectorAll(".hero-grid, .hero-copy, .hero-art, .hero-bottom")] : [];
  let stages = [];
  let heroHeight = 1;
  let lastHp = -1;
  let measureQueued = false;
  function measure() {
    measureQueued = false;
    scroll.vh = innerHeight;
    scroll.vw = innerWidth;
    scroll.max = Math.max(1, root.scrollHeight - innerHeight);
    heroHeight = hero ? hero.offsetHeight : 1;
    stages = [...document.querySelectorAll(".stage")].map((el) => {
      const rect = el.getBoundingClientRect();
      const targets = [...el.querySelectorAll(":scope > .stage-deco > .ghost-title, :scope > .sq-sky")];
      return { el, top: rect.top + scrollY, height: rect.height, targets, last: -1 };
    });
    updateScroll(true);
  }
  YC.measure = () => {
    if (!measureQueued) {
      measureQueued = true;
      requestAnimationFrame(measure);
    }
  };
  new ResizeObserver(YC.measure).observe(document.body);
  addEventListener("resize", YC.measure, { passive: true });
  document.fonts?.ready.then(YC.measure);

  let navHidden = false;
  function updateScroll(force) {
    const y = scrollY;
    const dy = y - scroll.y;
    scroll.velocity += (dy - scroll.velocity) * 0.25;
    if (Math.abs(dy) > 0.5) scroll.dir = dy > 0 ? 1 : -1;
    scroll.y = y;
    if (!force && dy === 0) {
      if (Math.abs(scroll.velocity) < 0.05) scroll.velocity = 0;
      return;
    }
    const progress = (y / scroll.max).toFixed(4);
    for (const el of progressTargets) el.style.setProperty("--progress", progress);
    const hp = clamp(y / heroHeight, 0, 1);
    if (hp !== lastHp) {
      lastHp = hp;
      for (const el of heroTargets) el.style.setProperty("--hp", hp.toFixed(4));
    }
    for (const s of stages) {
      if (!s.targets.length) continue;
      const p = clamp((y + scroll.vh - s.top) / (s.height + scroll.vh), 0, 1);
      if (Math.abs(p - s.last) < 0.0005) continue;
      s.last = p;
      for (const el of s.targets) el.style.setProperty("--sp", p.toFixed(4));
    }
    const menuOpen = document.body.classList.contains("nav-open");
    const shouldHide = !menuOpen && y > scroll.vh * 0.6 && scroll.dir > 0 && Math.abs(dy) > 2;
    const shouldShow = scroll.dir < 0 || y < scroll.vh * 0.6;
    if (shouldHide && !navHidden) {
      navHidden = true;
      hud?.classList.add("is-hidden");
    } else if (shouldShow && navHidden) {
      navHidden = false;
      hud?.classList.remove("is-hidden");
    }
  }
  YC.tick(() => updateScroll(false));
  hud?.addEventListener("focusin", () => {
    navHidden = false;
    hud.classList.remove("is-hidden");
  });

  /* ── Worlds, nav pill and level rail ─────────────────────────────────── */
  const CHAPTERS = {
    hero: ["00", "TITLE SCREEN", null],
    about: ["01", "PLAYER PROFILE", "#about"],
    experience: ["02", "FIELD OPERATION", "#experience"],
    projects: ["03", "SAVE POINTS", "#projects"],
    "side-quest": ["03+", "SIDE QUEST", "#projects"],
    skills: ["04", "ABILITY LOADOUT", "#skills"],
    notes: ["05", "BLUEPRINT ARCHIVE", "#notes"],
    contact: ["∞", "CONTINUE?", null],
  };
  const navLinks = document.querySelector(".nav-links");
  const railNo = document.querySelector(".rail-no");
  const railName = document.querySelector(".rail-name");
  /* Chapters carry their own palette, so only the fixed chrome follows the live
     world. Switching it on <html> would restyle the entire document at once. */
  const worldChrome = [...document.querySelectorAll(".world-bg, .hud-top, .hud-rail, .reading-progress, .cursor, .scene-wipe")];
  let currentStage = null;
  function placePill() {
    const active = navLinks?.querySelector(".nav-link.active");
    if (!navLinks) return;
    navLinks.classList.toggle("has-active", !!active);
    if (active) {
      navLinks.style.setProperty("--pill-x", `${active.offsetLeft}px`);
      navLinks.style.setProperty("--pill-w", `${active.offsetWidth}px`);
    }
  }
  YC.placePill = placePill;
  function setStage(el) {
    if (currentStage === el) return;
    currentStage = el;
    const world = el.dataset.world;
    if (world) for (const node of worldChrome) if (node.dataset.world !== world) node.dataset.world = world;
    const [no, name, href] = CHAPTERS[el.id] || CHAPTERS.hero;
    if (railNo) railNo.textContent = no;
    if (railName) railName.textContent = name;
    document.querySelectorAll(".nav-link").forEach((link) => {
      const on = link.getAttribute("href") === href;
      link.classList.toggle("active", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    placePill();
    document.dispatchEvent(new CustomEvent("yc:stage", { detail: { id: el.id, world } }));
  }
  const stageObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) setStage(entry.target);
    },
    { rootMargin: "-46% 0px -53% 0px" },
  );
  document.querySelectorAll(".stage").forEach((el) => stageObserver.observe(el));
  addEventListener("resize", placePill, { passive: true });
  document.fonts?.ready.then(placePill);

  /* Pause CSS loops for chapters that are far away. */
  const offscreenObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
    },
    { rootMargin: "120px 0px" },
  );
  document.querySelectorAll(".stage").forEach((el) => offscreenObserver.observe(el));

  /* ── Text: split letters and scramble labels ─────────────────────────── */
  function splitChars(el) {
    if (el.dataset.splitReady) return;
    el.dataset.splitReady = "1";
    if (!el.closest("[aria-hidden='true']")) {
      const text = document.createElement("span");
      text.className = "sr-only";
      text.textContent = el.textContent.replace(/\s+/g, " ").trim();
      el.before(text);
      el.setAttribute("aria-hidden", "true");
    }
    let index = 0;
    const chars = (text, target) => {
      for (const c of text) {
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = c;
        span.style.setProperty("--ci", index++);
        target.append(span);
      }
    };
    const walk = (node) => {
      const kids = [...node.childNodes];
      for (let k = 0; k < kids.length; k++) {
        const child = kids[k];
        if (child.nodeType === Node.TEXT_NODE) {
          const tokens = child.textContent.split(/(\s+)/).filter(Boolean);
          const frag = document.createDocumentFragment();
          let lastWord = null;
          for (const token of tokens) {
            if (/^\s+$/.test(token)) {
              frag.append(document.createTextNode(" "));
              lastWord = null;
            } else {
              const word = document.createElement("span");
              word.className = "w";
              chars(token, word);
              frag.append(word);
              lastWord = word;
            }
          }
          const next = kids[k + 1];
          child.replaceWith(frag);
          if (lastWord && next && next.nodeType === Node.ELEMENT_NODE) {
            lastWord.append(next);
            walk(next);
            k++;
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      }
    };
    walk(el);
  }
  const GLYPHS = "!<>-_\\/[]{}=+*^?#01XYZΣΔ";
  function scramble(el) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    cancelAnimationFrame(el._scramble || 0);
    if (!YC.motionOK()) {
      el.textContent = final;
      return;
    }
    const start = performance.now();
    const duration = 520 + final.length * 14;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * p * final.length * 1.05);
      let out = "";
      for (let i = 0; i < final.length; i++) {
        const c = final[i];
        out += i < settled || c === " " || c === "/" ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) el._scramble = requestAnimationFrame(step);
      else el.textContent = final;
    };
    el._scramble = requestAnimationFrame(step);
  }
  YC.scramble = scramble;

  function markHeroReady() {
    if (!hero || hero.classList.contains("hero-ready")) return;
    hero.querySelectorAll(".ht-line").forEach((line, i) => line.style.setProperty("--li", i));
    hero.querySelectorAll("[data-split]").forEach(splitChars);
    hero.classList.add("hero-ready");
  }
  markHeroReady();
  YC.heroIntro = () => {
    markHeroReady();
    hero?.classList.add("hero-in");
  };

  /* ── Reveals ─────────────────────────────────────────────────────────── */
  const revealHandlers = new Set();
  YC.onReveal = (fn) => revealHandlers.add(fn);
  function show(el) {
    if (el.classList.contains("is-in")) return;
    el.classList.add("is-in");
    el.querySelectorAll("[data-scramble]").forEach(scramble);
    if (el.matches("[data-scramble]")) scramble(el);
    for (const fn of revealHandlers) fn(el);
  }
  /* Reveals play once; replaying them on every pass restyles whole sections mid-scroll. */
  const enterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        enterObserver.unobserve(entry.target);
        show(entry.target);
      }
    },
    { rootMargin: "0px 0px -9% 0px" },
  );
  const watched = new WeakSet();
  function watch(el, delay) {
    if (watched.has(el)) return;
    watched.add(el);
    if (delay != null) el.style.setProperty("--rd", `${delay}ms`);
    enterObserver.observe(el);
  }
  function unwatch(el) {
    enterObserver.unobserve(el);
  }
  function collectReveals(scope) {
    scope.querySelectorAll("[data-split]").forEach(splitChars);
    scope.querySelectorAll("[data-reveal]").forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      const i = siblings.indexOf(el);
      watch(el, siblings.length > 1 ? i * 110 : null);
    });
    scope.querySelectorAll(".save-grid > .slot").forEach((el, i) => watch(el, (i % 2) * 140));
    scope.querySelectorAll(".skill-grid > .ability").forEach((el, i) => watch(el, (i % 3) * 120));
    scope.querySelectorAll(".notes-grid > .bp-node").forEach((el, i) => watch(el, (i % 3) * 90));
    scope.querySelectorAll("[data-scramble]").forEach((el) => {
      if (!el.closest("[data-reveal]")) watch(el);
    });
  }
  YC.watch = watch;
  YC.unwatch = unwatch;

  /* ── Scenes ──────────────────────────────────────────────────────────── */
  const sceneDefs = {};
  const scenes = new Map();
  YC.defineScene = (name, factory) => {
    sceneDefs[name] = factory;
  };
  YC.fitCanvas = (canvas, maxDpr = 2, scale = 1) => {
    const dpr = Math.min(devicePixelRatio || 1, maxDpr) * scale;
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { w, h, dpr };
  };
  /* High-refresh displays would otherwise redraw every canvas 120–240 times a
     second; scenes step at 60fps (or their own `step`) regardless. */
  const SCENE_STEP = 1 / 60;
  function createScene(rec) {
    if (rec.inst) return;
    try {
      rec.inst = sceneDefs[rec.el.dataset.scene](rec.el) || {};
    } catch (error) {
      console.warn(`[YC] scene "${rec.el.dataset.scene}" failed`, error);
      rec.inst = {};
    }
    rec.inst.resize?.();
    if (!YC.motionOK()) rec.inst.still?.();
  }
  /* Scenes are built a little ahead of the viewport but only draw while on screen. */
  const sceneNear = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const rec = scenes.get(entry.target);
        if (rec && entry.isIntersecting) createScene(rec);
      }
    },
    { rootMargin: "600px 0px" },
  );
  const sceneLive = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const rec = scenes.get(entry.target);
      if (!rec) continue;
      rec.visible = entry.isIntersecting;
      if (rec.visible) createScene(rec);
      rec.acc = rec.inst?.step || SCENE_STEP;
      rec.inst?.visibility?.(rec.visible);
    }
  });
  const sceneResize = new ResizeObserver((entries) => {
    for (const entry of entries) scenes.get(entry.target)?.inst?.resize?.();
  });
  function mountScenes(scope) {
    scope.querySelectorAll("[data-scene]").forEach((el) => {
      if (scenes.has(el) || !sceneDefs[el.dataset.scene]) return;
      scenes.set(el, { el, inst: null, visible: false, acc: 0 });
      sceneNear.observe(el);
      sceneLive.observe(el);
      sceneResize.observe(el);
    });
  }
  function warmScenes() {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    const next = () => {
      const rec = [...scenes.values()].find((r) => !r.inst);
      if (!rec) return;
      createScene(rec);
      idle(next, { timeout: 1500 });
    };
    idle(next, { timeout: 1500 });
  }
  YC.tick((dt, t) => {
    if (!YC.motionOK() || document.hidden) return;
    let active = 0;
    for (const rec of scenes.values()) {
      if (!rec.visible || !rec.inst?.frame) continue;
      active++;
      rec.acc += dt;
      const step = Math.max(rec.inst.step || SCENE_STEP, YC.lite ? 1 / 30 : 0);
      if (rec.acc + dt * 0.5 < step) continue;
      rec.inst.frame(Math.min(rec.acc, 0.1), t);
      rec.acc = 0;
    }
    stats.scenes = active;
  });
  YC.onMotionChange((ok) => {
    for (const rec of scenes.values()) if (!ok) rec.inst?.still?.();
  });

  /* ── Boot sequence ───────────────────────────────────────────────────── */
  const boot = document.querySelector(".boot");
  const BOOT_LINES = [
    ["LogInit", "Display: Running engine for game: <span class=\"pink\">YueC</span>"],
    ["LogInit", "Build: ++YueC+Release-2026.10 · Changelist 0930"],
    ["LogRHI", "Display: Creating RHI · D3D12 · Shader Model 6"],
    ["LogShaderCompilers", "Display: Compiling 4 save points ... <span class=\"ok\">done</span>"],
    ["LogAbilitySystem", "ASC Owner → PlayerState · Avatar → Character"],
    ["LogArchive", "Display: Mounted 23 notes from /Game/Archive"],
    ["LogTemp", "<span class=\"warn\">Warning: Imagination overflow detected (this is fine)</span>"],
    ["LogWorld", "Bringing World /Game/Maps/YueC_World up for play ..."],
    ["LogLoad", "Display: Took {t}s to LoadMap(/Game/Maps/YueC_World)"],
    ["LogGame", "<span class=\"pink\">PRESS START ✦</span>"],
  ];
  let booting = false;
  async function runBoot(short = false) {
    if (!boot || booting) return;
    booting = true;
    const log = boot.querySelector(".boot-log");
    const bar = boot.querySelector(".boot-bar");
    const pct = boot.querySelector(".boot-pct");
    let skip = false;
    const onSkip = () => (skip = true);
    addEventListener("keydown", onSkip);
    boot.addEventListener("pointerdown", onSkip);
    root.classList.add("is-booting");
    boot.classList.remove("is-leaving", "is-clear");
    log.textContent = "";
    const lines = short ? BOOT_LINES.slice(-4) : BOOT_LINES;
    for (let i = 0; i < lines.length && !skip; i++) {
      const [cat, text] = lines[i];
      const p = document.createElement("p");
      p.innerHTML = `<b>${cat}:</b> ${text.replace("{t}", (performance.now() / 1000).toFixed(2))}`;
      log.append(p);
      const value = (i + 1) / lines.length;
      bar?.style.setProperty("--bp", value.toFixed(3));
      if (pct) pct.textContent = `${Math.round(value * 100)}%`;
      await wait(i < 2 ? 150 : 70 + Math.random() * 110);
    }
    bar?.style.setProperty("--bp", "1");
    if (pct) pct.textContent = "100%";
    await wait(skip ? 60 : 280);
    boot.classList.add("is-leaving");
    await wait(470);
    boot.classList.add("is-clear");
    YC.heroIntro();
    await wait(640);
    root.classList.remove("is-booting");
    boot.classList.remove("is-leaving", "is-clear");
    removeEventListener("keydown", onSkip);
    boot.removeEventListener("pointerdown", onSkip);
    try {
      sessionStorage.setItem("yc-booted", "1");
    } catch { /* storage disabled */ }
    booting = false;
    YC.measure();
    warmScenes();
  }
  YC.replayIntro = () => {
    if (!YC.motionOK()) return;
    hero?.classList.remove("hero-in");
    YC.jumpTo(0);
    runBoot(true);
  };

  /* ── Scene wipe navigation ───────────────────────────────────────────── */
  const wipe = document.querySelector(".scene-wipe");
  const wipeLabel = wipe?.querySelector(".scene-wipe-label");
  function chapterLabel(target) {
    const stage = target.closest(".stage") || target;
    const [no, name] = CHAPTERS[stage.id] || CHAPTERS.hero;
    return `<small>LOADING · ${no}</small>${name}`;
  }
  function targetY(target) {
    if (target.id === "top" || target === hero) return 0;
    return Math.max(0, target.getBoundingClientRect().top + scrollY - (target.classList.contains("stage") ? 0 : 110));
  }
  let wiping = false;
  YC.goTo = (target, { push = true } = {}) => {
    if (typeof target === "string") target = document.querySelector(target);
    if (!target) return;
    const hash = target.id ? `#${target.id}` : "";
    if (push && hash && location.hash !== hash) history.pushState(null, "", hash);
    const land = () => {
      YC.jumpTo(targetY(target));
      const focusTarget = target.id === "top" ? hero : target;
      if (focusTarget && !focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
      focusTarget?.focus({ preventScroll: true });
    };
    if (!YC.motionOK() || !wipe) return land();
    if (wiping) return;
    wiping = true;
    wipeLabel.innerHTML = chapterLabel(target);
    wipe.classList.remove("is-out");
    wipe.classList.add("is-in");
    setTimeout(() => {
      land();
      wipe.classList.remove("is-in");
      wipe.classList.add("is-out");
      setTimeout(() => {
        wipe.classList.remove("is-out");
        wiping = false;
      }, 580);
    }, 450);
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (link.classList.contains("skip-link")) return;
    const hash = link.getAttribute("href");
    if (hash.length < 2 || hash.startsWith("#note/")) return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    YC.closeMenu?.();
    YC.goTo(target);
  });

  /* ── Mobile pause menu ───────────────────────────────────────────────── */
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector(".nav-panel");
  YC.closeMenu = () => {
    if (!navToggle || navToggle.getAttribute("aria-expanded") !== "true") return;
    navToggle.setAttribute("aria-expanded", "false");
    navPanel?.classList.remove("active");
    document.body.classList.remove("nav-open");
    YC.lockScroll(false);
  };
  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    if (!open) return YC.closeMenu();
    navToggle.setAttribute("aria-expanded", "true");
    navPanel?.classList.add("active");
    document.body.classList.add("nav-open");
    YC.lockScroll(true);
  });
  document.querySelector(".menu-resume")?.addEventListener("click", () => YC.closeMenu());

  /* ── Tickers react to scroll velocity ────────────────────────────────── */
  function setupTickers() {
    document.querySelectorAll(".ticker").forEach((ticker) => {
      const track = ticker.querySelector(".ticker-track");
      const unit = track?.firstElementChild;
      if (!unit) return;
      const state = { x: 0, w: 1, dir: Number(ticker.dataset.dir) || -1, visible: true };
      const fill = () => {
        state.w = unit.offsetWidth || 1;
        const need = Math.ceil(ticker.offsetWidth / state.w) + 2;
        while (track.children.length < need) track.append(unit.cloneNode(true));
      };
      fill();
      new ResizeObserver(fill).observe(ticker);
      document.fonts?.ready.then(fill);
      new IntersectionObserver(([e]) => (state.visible = e.isIntersecting)).observe(ticker);
      YC.tick((dt) => {
        if (!state.visible || !YC.motionOK()) return;
        const boost = 1 + Math.min(Math.abs(scroll.velocity) * 0.12, 7);
        state.x += state.dir * scroll.dir * 70 * boost * dt;
        if (state.x <= -state.w) state.x += state.w;
        if (state.x > 0) state.x -= state.w;
        const skew = clamp(-scroll.velocity * 0.35, -10, 10);
        track.style.transform = `translate3d(${state.x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      });
    });
  }

  /* ── Pointer: cursor, magnetic buttons, tilt cards ───────────────────── */
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  YC.pointer = pointer;
  const cursor = document.querySelector(".cursor");
  const dot = cursor?.querySelector(".cursor-dot");
  const ring = cursor?.querySelector(".cursor-ring");
  const label = cursor?.querySelector(".cursor-label");
  let ringX = pointer.x;
  let ringY = pointer.y;
  const cursorWanted = () => finePointer.matches && YC.motionOK();
  function cursorState(target) {
    if (!cursor) return;
    const plain = target.closest("input, textarea, .note-markdown, .reader-body, .console");
    const play = target.closest(".slot-canvas");
    const read = target.closest(".bp-node-hit");
    const flip = target.closest(".player-card");
    const link = target.closest("a, button, summary, label[for], [role='button']");
    cursor.classList.toggle("is-hidden", !!plain);
    cursor.classList.toggle("is-play", !!play && !plain);
    cursor.classList.toggle("is-read", !!read && !plain);
    cursor.classList.toggle("is-link", !!(link || flip) && !play && !read && !plain);
    let text = "";
    if (play) text = play.dataset.cursor || "PLAY";
    else if (read) text = "READ";
    else if (flip) text = "FLIP";
    else if (link?.matches("a[target='_blank']")) text = "OPEN ↗";
    else if (link?.matches("a[href^='#'], a[href^='mailto:']")) text = link.matches("a[href^='mailto:']") ? "MAIL ✉" : "GO";
    if (label) label.textContent = text;
    label?.classList.toggle("has-text", !!text);
  }
  const magnets = new Map();
  document.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (event.pointerType !== "mouse" || !cursorWanted()) return;
      if (!root.classList.contains("has-cursor")) {
        root.classList.add("has-cursor");
        ringX = pointer.x;
        ringY = pointer.y;
      }
      if (dot) dot.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0)`;
      const magnet = event.target.closest?.("[data-magnetic]");
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        magnets.set(magnet, [(pointer.x - r.left - r.width / 2) * 0.22, (pointer.y - r.top - r.height / 2) * 0.32]);
        magnet.style.translate = `${magnets.get(magnet)[0].toFixed(1)}px ${magnets.get(magnet)[1].toFixed(1)}px`;
      }
      const tilt = event.target.closest?.("[data-tilt], .ability");
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (pointer.x - r.left) / r.width;
        const py = (pointer.y - r.top) / r.height;
        tilt.style.setProperty("--rx", `${((0.5 - py) * 12).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${((px - 0.5) * 14).toFixed(2)}deg`);
        tilt.style.setProperty("--hx", `${(px * 100).toFixed(1)}%`);
        tilt.style.setProperty("--hy", `${(py * 100).toFixed(1)}%`);
        tilt.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        tilt.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      }
    },
    { passive: true },
  );
  document.addEventListener("pointerover", (event) => {
    if (event.pointerType === "mouse") cursorState(event.target);
  });
  document.addEventListener("pointerout", (event) => {
    const magnet = event.target.closest?.("[data-magnetic]");
    if (magnet && !magnet.contains(event.relatedTarget)) {
      magnet.style.translate = "";
      magnets.delete(magnet);
    }
    const tilt = event.target.closest?.("[data-tilt], .ability");
    if (tilt && !tilt.contains(event.relatedTarget)) {
      ["--rx", "--ry", "--hx", "--hy", "--gx", "--gy"].forEach((k) => tilt.style.removeProperty(k));
    }
  });
  root.addEventListener("pointerleave", () => root.classList.remove("has-cursor"));
  document.addEventListener("pointerdown", (event) => {
    cursor?.classList.add("is-down");
    if (event.pointerType === "mouse" && YC.motionOK() && event.button === 0 && !event.target.closest("input, .note-markdown, .console, .reader-body, .slot-canvas")) {
      sparks.burst(event.clientX, event.clientY, event.target.closest("a, button, summary") ? 14 : 8);
    }
  });
  document.addEventListener("pointerup", () => cursor?.classList.remove("is-down"));
  YC.tick((dt) => {
    if (!root.classList.contains("has-cursor") || !ring) return;
    const k = 1 - Math.exp(-dt * 22 / Math.max(timeScale, 0.05));
    ringX += (pointer.x - ringX) * k;
    ringY += (pointer.y - ringY) * k;
    const t = `translate3d(${ringX.toFixed(1)}px,${ringY.toFixed(1)}px,0)`;
    ring.style.transform = t;
    if (label) label.style.transform = t;
  });
  finePointer.addEventListener("change", () => {
    if (!finePointer.matches) root.classList.remove("has-cursor");
  });

  /* Tiny four-point star bursts on click. */
  const sparks = (() => {
    const canvas = document.createElement("canvas");
    canvas.className = "spark-layer";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    const ctx = canvas.getContext("2d");
    let list = [];
    let sized = false;
    const size = () => {
      const { dpr } = YC.fitCanvas(canvas, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sized = true;
    };
    addEventListener("resize", () => (sized = false), { passive: true });
    const star = (x, y, r, rot, color, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.22, -r * 0.22);
      ctx.lineTo(r, 0);
      ctx.lineTo(r * 0.22, r * 0.22);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.22, r * 0.22);
      ctx.lineTo(-r, 0);
      ctx.lineTo(-r * 0.22, -r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    YC.tick((dt) => {
      if (!list.length) return;
      if (!sized) size();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const step = dt * 60;
      for (const p of list) {
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vy += 0.06 * step;
        p.vx *= Math.pow(0.95, step);
        p.life -= 0.028 * step;
        p.rot += 0.08 * step;
        if (p.life > 0) star(p.x, p.y, p.r * (0.5 + p.life * 0.5), p.rot, p.color, Math.min(1, p.life * 1.4));
      }
      list = list.filter((p) => p.life > 0);
      if (!list.length) ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    return {
      burst(x, y, count) {
        const live = getComputedStyle(worldChrome[0] || root);
        const accent = live.getPropertyValue("--accent").trim() || "#ff7ba5";
        const accent2 = live.getPropertyValue("--accent-2").trim() || "#62e6f0";
        const colors = [accent, accent2, "#ffffff"];
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 * i) / count + Math.random() * 0.5;
          const v = 2 + Math.random() * 3.5;
          list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.2, r: 3 + Math.random() * 5, rot: Math.random() * 3, life: 1, color: colors[i % 3] });
        }
        if (list.length > 160) list.splice(0, list.length - 160);
      },
    };
  })();
  YC.sparks = sparks;

  /* ── Hero details ────────────────────────────────────────────────────── */
  function setupHero() {
    if (!hero) return;
    const grid = hero.querySelector(".hero-grid");
    hero.addEventListener(
      "pointermove",
      (event) => {
        if (!YC.motionOK() || event.pointerType !== "mouse") return;
        const r = hero.getBoundingClientRect();
        const dx = (event.clientX - r.left) / r.width - 0.5;
        const dy = (event.clientY - r.top) / r.height - 0.5;
        grid?.style.setProperty("--gx", `${(dx * -24).toFixed(1)}px`);
        grid?.style.setProperty("--gy", `${(dy * -18).toFixed(1)}px`);
      },
      { passive: true },
    );
    const pct = hero.querySelector(".loadbar-pct");
    const sync = hero.querySelector(".ph-sync b");
    let value = 98;
    setInterval(() => {
      if (!YC.motionOK() || document.hidden) return;
      value = value >= 99 ? 97 + Math.round(Math.random()) : value + 1;
      if (pct) pct.textContent = value;
      if (sync) sync.textContent = 96 + Math.round(Math.random() * 3);
    }, 2600);
    hero.querySelector(".replay-intro")?.addEventListener("click", () => YC.replayIntro());
  }

  /* ── Toast ───────────────────────────────────────────────────────────── */
  const toastEl = document.querySelector(".toast");
  let toastTimer = 0;
  YC.toast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2400);
  };

  /* ── UE-style console (press `) ──────────────────────────────────────── */
  const consoleEl = document.querySelector(".console");
  const consoleLog = consoleEl?.querySelector(".console-log");
  const consoleInput = consoleEl?.querySelector("input");
  const statEl = document.querySelector(".stat-unit");
  const cmdHistory = [];
  let historyIndex = 0;
  let godMode = 0;
  const say = (html, cls = "") => {
    if (!consoleLog) return;
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.innerHTML = html;
    consoleLog.append(p);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const SECTIONS = { about: "#about", experience: "#experience", projects: "#projects", luckytri: "#side-quest", sidequest: "#side-quest", skills: "#skills", notes: "#notes", contact: "#contact", top: "#top" };
  const COMMANDS = {
    help: ["列出所有命令 / list commands", () => {
      Object.entries(COMMANDS).forEach(([name, [desc]]) => say(`<span class="c-key">${name.padEnd(16, " ")}</span>${esc(desc)}`));
    }],
    "stat fps": ["显示帧率 / toggle FPS overlay", () => toggleStat()],
    "stat unit": ["同 stat fps", () => toggleStat()],
    slomo: ["slomo 0.25 ~ 4 · 调整全局时间流速", (arg) => {
      const n = Number(arg);
      if (!Number.isFinite(n) || n <= 0) return say("Usage: slomo 0.5", "c-warn");
      YC.setTimeScale(n);
      say(`Time dilation set to ${YC.timeScale().toFixed(2)}×`, "c-ok");
    }],
    open: ["open about|experience|projects|luckytri|skills|notes|contact", (arg) => {
      const hash = SECTIONS[(arg || "").toLowerCase()];
      if (!hash) return say(`Usage: open ${Object.keys(SECTIONS).join("|")}`, "c-warn");
      closeConsole();
      YC.goTo(hash);
    }],
    lang: ["lang zh|en · 切换语言", (arg) => {
      if (arg !== "zh" && arg !== "en") return say("Usage: lang zh|en", "c-warn");
      YC.setLang?.(arg);
      say(`Culture set to ${arg === "zh" ? "zh-Hans" : "en"}`, "c-ok");
    }],
    motion: ["motion on|off · 开关动效", (arg) => {
      if (arg !== "on" && arg !== "off") return say("Usage: motion on|off", "c-warn");
      YC.setMotion(arg === "on");
      YC.updateMotionButton?.();
      say(`Motion ${arg === "on" ? "enabled" : "paused"}`, "c-ok");
    }],
    "r.lite": ["r.lite 1|0 · 流畅模式（30fps 画布、关闭大型氛围动画）", (arg) => {
      YC.setLite(arg !== "0");
      say(`r.Lite = ${YC.lite ? 1 : 0}`, "c-ok");
    }],
    "r.wireframe": ["r.wireframe 1|0 · 线框视图", (arg) => {
      const on = arg !== "0";
      root.classList.toggle("r-wireframe", on);
      say(`r.Wireframe = ${on ? 1 : 0}`, "c-ok");
    }],
    god: ["无敌模式 / god mode", () => {
      godMode = godMode ? 0 : 1;
      root.classList.toggle("god-mode", !!godMode);
      say(godMode ? "God Mode ON — 想象力无限，Bug 伤害为 0" : "God Mode OFF", godMode ? "c-ok" : "c-dim");
      if (godMode) {
        for (let i = 0; i < 6; i++) setTimeout(() => sparks.burst(Math.random() * innerWidth, Math.random() * innerHeight * 0.8, 18), i * 120);
      }
    }],
    summon: ["summon luckytri · 召唤", (arg) => {
      if ((arg || "").toLowerCase() !== "luckytri") return say("Usage: summon luckytri", "c-warn");
      closeConsole();
      YC.goTo("#side-quest");
      setTimeout(() => {
        for (let i = 0; i < 5; i++) setTimeout(() => sparks.burst(innerWidth * (0.2 + Math.random() * 0.6), innerHeight * (0.3 + Math.random() * 0.4), 20), i * 140);
      }, 700);
    }],
    about: ["关于我 / whoami", () => say("YueC · UE5 Gameplay Engineer · C++ / Rendering · 想用双手创造一个世界。")],
    contact: ["联系方式", () => say('Mail: <a href="mailto:tdyuechu@163.com">tdyuechu@163.com</a> · GitHub: TodayYueC', "c-ok")],
    echo: ["echo <text>", (arg) => say(esc(arg || ""))],
    clear: ["清屏", () => consoleLog && (consoleLog.textContent = "")],
    quit: ["退出游戏？", () => say("QUIT GAME? — 这个世界还在加载，先别走嘛。", "c-warn")],
    exit: ["同 quit", () => COMMANDS.quit[1]()],
  };
  function toggleStat() {
    if (!statEl) return;
    statEl.hidden = !statEl.hidden;
    say(`stat fps ${statEl.hidden ? "off" : "on"}`, "c-ok");
  }
  let statTimer = 0;
  YC.tick((dt, t, now) => {
    if (!statEl || statEl.hidden || now - statTimer < 250) return;
    statTimer = now;
    statEl.querySelector('[data-stat="fps"]').textContent = stats.fps.toFixed(2);
    statEl.querySelector('[data-stat="ms"]').textContent = stats.ms.toFixed(2);
    statEl.querySelector('[data-stat="scenes"]').textContent = stats.scenes;
  });
  function runCommand(raw) {
    const line = raw.trim();
    if (!line) return;
    cmdHistory.push(line);
    historyIndex = cmdHistory.length;
    say(`&gt; ${esc(line)}`, "c-cmd");
    const lower = line.toLowerCase();
    const name = Object.keys(COMMANDS)
      .sort((a, b) => b.length - a.length)
      .find((cmd) => lower === cmd || lower.startsWith(`${cmd} `));
    if (!name) return say(`Command not recognized: ${esc(line)}`, "c-err");
    COMMANDS[name][1](line.slice(name.length).trim());
  }
  function openConsole() {
    if (!consoleEl) return;
    consoleEl.hidden = false;
    requestAnimationFrame(() => consoleEl.classList.add("is-open"));
    if (!consoleLog.childElementCount) {
      say("YueC Console · type <span class=\"c-key\">help</span> for commands", "c-dim");
    }
    consoleInput?.focus({ preventScroll: true });
  }
  function closeConsole() {
    if (!consoleEl || consoleEl.hidden) return;
    consoleEl.classList.remove("is-open");
    setTimeout(() => {
      if (!consoleEl.classList.contains("is-open")) consoleEl.hidden = true;
    }, 400);
    consoleInput?.blur();
  }
  YC.toggleConsole = () => (consoleEl?.hidden ? openConsole() : closeConsole());
  document.addEventListener("keydown", (event) => {
    if (booting) return;
    const typing = event.target.closest?.("input, textarea, [contenteditable]");
    if ((event.code === "Backquote" || event.key === "`" || event.key === "~") && (!typing || event.target === consoleInput)) {
      event.preventDefault();
      YC.toggleConsole();
    }
    if (event.key === "Escape" && consoleEl && !consoleEl.hidden) closeConsole();
  });
  consoleEl?.querySelector("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runCommand(consoleInput.value);
    consoleInput.value = "";
  });
  consoleInput?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = clamp(historyIndex + (event.key === "ArrowUp" ? -1 : 1), 0, cmdHistory.length);
      consoleInput.value = cmdHistory[historyIndex] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      const value = consoleInput.value.toLowerCase();
      const match = Object.keys(COMMANDS).find((cmd) => cmd.startsWith(value) && cmd !== value);
      if (match) consoleInput.value = `${match} `;
    }
  });
  document.querySelector(".console-toggle")?.addEventListener("click", () => YC.toggleConsole());

  /* ── Start (called by script.js once content is rendered) ────────────── */
  let started = false;
  YC.start = () => {
    if (started) return;
    started = true;
    setupTickers();
    setupHero();
    collectReveals(document);
    mountScenes(document);
    measure();
    startLenis();
    if (root.classList.contains("is-booting") && YC.motionOK()) runBoot(false);
    else {
      YC.heroIntro();
      warmScenes();
    }
  };
  YC.refresh = (scope = document) => {
    collectReveals(scope);
    mountScenes(scope);
    YC.measure();
  };
  YC.stats = stats;

  applyMotion();
})();
