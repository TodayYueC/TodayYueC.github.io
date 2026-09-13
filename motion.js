/* One animation loop drives the cursor, trails and bounded particle pool. */
(() => {
  "use strict";
  const ready = () => {
    const root = document.documentElement;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const hero = document.querySelector(".hero");
    const art = document.querySelector(".hero-art");
    const effects = document.createElement("div");
    effects.innerHTML = `
      <canvas class="fx-canvas" aria-hidden="true"></canvas>
      <div class="fx-cursor" aria-hidden="true"><span class="fx-cursor-ring"></span><span class="fx-cursor-label"></span></div>
      <div class="fx-cursor-core" aria-hidden="true"></div>
      <div class="fx-intro" aria-hidden="true"><div class="fx-intro-panel"></div><div class="fx-intro-panel"></div><div class="fx-intro-lines"></div><span class="fx-intro-star">✦</span><div class="fx-intro-title"><span>TAKE</span><span>YOUR</span><span>WORLD.</span></div><span class="fx-intro-caption">YUEC / IMAGINATION UNLEASHED</span></div>
      <div class="fx-section-label" aria-hidden="true">00 / ENTER THE WORLD</div>`;
    document.body.append(effects);
    const canvas = effects.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const cursor = effects.querySelector(".fx-cursor");
    const core = effects.querySelector(".fx-cursor-core");
    const cursorLabel = effects.querySelector(".fx-cursor-label");
    const intro = effects.querySelector(".fx-intro");
    const sectionLabel = effects.querySelector(".fx-section-label");
    const replay = document.createElement("button");
    replay.type = "button";
    replay.className = "fx-replay";
    replay.textContent = "REPLAY INTRO ↻";
    replay.setAttribute("aria-label", "重播开场动画 / Replay intro");
    hero.append(replay);
    const orbit = document.createElement("div");
    orbit.className = "fx-orbit";
    orbit.setAttribute("aria-hidden", "true");
    hero.append(orbit);
    const speed = document.createElement("div");
    speed.className = "fx-hero-speed";
    speed.setAttribute("aria-hidden", "true");
    speed.innerHTML = Array.from(
      { length: 7 },
      (_, i) =>
        `<i class="fx-speed-line" style="--top:${15 + i * 13}%;--duration:${3.5 + i * 0.37}s;--delay:${-i * 0.79}s"></i>`,
    ).join("");
    hero.append(speed);
    hero
      .querySelectorAll("h1 > span")
      .forEach((el) => (el.dataset.echo = el.textContent.replace("✦", "")));

    let width = innerWidth,
      height = innerHeight,
      raf = 0,
      last = 0,
      heroVisible = true,
      introTimer = 0;
    let pointerVisible = false,
      x = width / 2,
      y = height / 2,
      followX = x,
      followY = y,
      lastSpark = 0,
      tiltCard = null,
      magnet = null;
    let particles = [],
      trail = [],
      rings = [],
      bursts = [];
    const activeAnimations = new Set();
    const allowed = () => motionEnabled() && !document.hidden;
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wake();
    };
    function wake() {
      if (!raf && allowed() && ctx) raf = requestAnimationFrame(draw);
    }
    const colors = ["#ff7ba5", "#ffc3d4", "#f3eee9"];
    function spark(px, py, count, force = 1) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2,
          velocity = (1 + Math.random() * 5) * force;
        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          decay: 0.018 + Math.random() * 0.018,
          size: 1 + Math.random() * 4,
          spin: Math.random() * 6,
          color: colors[i % 3],
        });
      }
      if (particles.length > 180) particles.splice(0, particles.length - 180);
      wake();
    }
    function star(px, py, r, rotation, color, alpha) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.23, -r * 0.23);
      ctx.lineTo(r, 0);
      ctx.lineTo(r * 0.23, r * 0.23);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.23, r * 0.23);
      ctx.lineTo(-r, 0);
      ctx.lineTo(-r * 0.23, -r * 0.23);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    function draw(now) {
      raf = 0;
      if (!allowed()) {
        ctx.clearRect(0, 0, width, height);
        last = 0;
        return;
      }
      const dt = Math.min((now - (last || now)) / 16.667 || 1, 2);
      last = now;
      ctx.clearRect(0, 0, width, height);
      if (pointerVisible && finePointer.matches) {
        const ease = 1 - Math.pow(0.78, dt);
        followX += (x - followX) * ease;
        followY += (y - followY) * ease;
        cursor.style.transform = `translate3d(${followX}px,${followY}px,0)`;
        core.style.transform = `translate3d(${x}px,${y}px,0)`;
        const angle = 45 + Math.sin(now * 0.0014) * 24;
        cursor.querySelector(".fx-cursor-ring").style.transform =
          `rotate(${angle}deg)`;
      }
      trail = trail.filter((p) => now - p.time < 360);
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1],
            b = trail[i],
            fade = 1 - (now - b.time) / 360;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,123,165,${Math.max(0, fade) * 0.6})`;
          ctx.lineWidth = fade * 3;
          ctx.stroke();
        }
      }
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.025 * dt;
        p.vx *= Math.pow(0.98, dt);
        p.life -= p.decay * dt;
        p.spin += 0.05 * dt;
        star(p.x, p.y, p.size, p.spin, p.color, Math.max(0, p.life));
      }
      particles = particles.filter((p) => p.life > 0);
      for (const r of rings) {
        const age = (now - r.time) / 700;
        if (age >= 1) continue;
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(age * 1.5);
        ctx.strokeStyle = `rgba(255,123,165,${1 - age})`;
        ctx.lineWidth = (1 - age) * 3;
        const radius = 12 + age * 80;
        ctx.strokeRect(-radius / 2, -radius / 2, radius, radius);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, 0.2, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
      }
      rings = rings.filter((r) => now - r.time < 700);
      for (const b of bursts) {
        const age = (now - b.time) / 750;
        if (age >= 1) continue;
        ctx.save();
        ctx.translate(
          Math.min(width - 85, Math.max(80, b.x)),
          Math.max(35, b.y - 20 - age * 40),
        );
        ctx.rotate(-0.15);
        ctx.globalAlpha = 1 - age;
        ctx.fillStyle = "#111114";
        ctx.fillRect(-45, -15, 90, 28);
        ctx.fillStyle = "#ff7ba5";
        ctx.font = '800 18px "Barlow Condensed", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(b.text, 0, 6);
        ctx.restore();
      }
      bursts = bursts.filter((b) => now - b.time < 750);
      if (heroVisible) {
        // Slow, sparse stars remain in the poster margin, away from the copy.
        for (let i = 0; i < 9; i++) {
          const px = width * (0.55 + ((i * 0.163) % 0.43));
          const py = height - ((now * 0.014 + i * 87) % (height + 100));
          star(
            px,
            py,
            2 + (i % 3),
            now * 0.0003 + i,
            colors[i % 3],
            0.16 + 0.1 * Math.sin(now * 0.001 + i),
          );
        }
      }
      if (
        pointerVisible ||
        particles.length ||
        rings.length ||
        trail.length ||
        bursts.length ||
        heroVisible
      )
        wake();
      else last = 0;
    }
    function hidePointer() {
      pointerVisible = false;
      cursor.classList.remove("visible", "pressed");
      core.classList.remove("visible");
      if (root.classList.contains("fx-pointer"))
        root.classList.remove("fx-pointer");
    }
    function resetTilt() {
      if (tiltCard) {
        tiltCard.style.removeProperty("--tilt-x");
        tiltCard.style.removeProperty("--tilt-y");
        tiltCard = null;
      }
    }
    function resetMagnet() {
      if (magnet) {
        magnet.style.removeProperty("--mag-x");
        magnet.style.removeProperty("--mag-y");
        magnet = null;
      }
    }
    document.addEventListener(
      "pointermove",
      (event) => {
        if (!allowed() || !finePointer.matches || event.pointerType !== "mouse")
          return;
        const now = performance.now();
        x = event.clientX;
        y = event.clientY;
        const nativeTarget = event.target.closest(
          "input,textarea,.note-markdown",
        );
        if (nativeTarget) hidePointer();
        else {
          if (!pointerVisible) {
            followX = x;
            followY = y;
          }
          pointerVisible = true;
          root.classList.add("fx-pointer");
          cursor.classList.add("visible");
          core.classList.add("visible");
          const target = event.target.closest("a,button,summary");
          cursor.classList.toggle("target", !!target);
          cursorLabel.textContent = target ? "OPEN ↗" : "";
          trail.push({ x, y, time: now });
          if (trail.length > 28) trail.shift();
          if (now - lastSpark > 35) {
            spark(x, y, 1, 0.35);
            lastSpark = now;
          }
        }
        const card = event.target.closest(
          ".project-card,.vibe-card,.info-card",
        );
        if (card !== tiltCard) resetTilt();
        if (card) {
          tiltCard = card;
          const rect = card.getBoundingClientRect();
          const dx = (x - rect.left) / rect.width - 0.5,
            dy = (y - rect.top) / rect.height - 0.5;
          card.style.setProperty("--tilt-x", `${-dy * 7}deg`);
          card.style.setProperty("--tilt-y", `${dx * 9}deg`);
          card.style.setProperty("--light-x", `${(dx + 0.5) * 100}%`);
          card.style.setProperty("--light-y", `${(dy + 0.5) * 100}%`);
        }
        const button = event.target.closest(".button");
        if (button !== magnet) resetMagnet();
        if (button) {
          magnet = button;
          const rect = button.getBoundingClientRect();
          button.style.setProperty(
            "--mag-x",
            `${(x - rect.left - rect.width / 2) * 0.12}px`,
          );
          button.style.setProperty(
            "--mag-y",
            `${(y - rect.top - rect.height / 2) * 0.16}px`,
          );
        }
        wake();
      },
      { passive: true },
    );
    document.addEventListener(
      "pointerdown",
      (event) => {
        if (
          !allowed() ||
          event.button !== 0 ||
          event.target.closest("input,textarea,.note-markdown")
        )
          return;
        const now = performance.now();
        spark(event.clientX, event.clientY, 26, 1.25);
        rings.push({ x: event.clientX, y: event.clientY, time: now });
        if (rings.length > 8) rings.shift();
        if (event.target.closest("a,button,summary")) {
          bursts.push({
            x: event.clientX,
            y: event.clientY,
            time: now,
            text: event.target.closest("a") ? "LET’S GO!" : "ACTION!",
          });
          if (bursts.length > 5) bursts.shift();
        }
        cursor.classList.add("pressed");
      },
      { passive: true },
    );
    document.addEventListener(
      "pointerup",
      () => cursor.classList.remove("pressed"),
      { passive: true },
    );
    document.documentElement.addEventListener("pointerleave", () => {
      hidePointer();
      resetTilt();
      resetMagnet();
    });
    window.addEventListener("blur", hidePointer);
    hero.addEventListener(
      "pointermove",
      (event) => {
        if (!allowed() || event.pointerType !== "mouse" || innerWidth < 900)
          return;
        const rect = hero.getBoundingClientRect(),
          dx = (event.clientX - rect.left) / rect.width - 0.5,
          dy = (event.clientY - rect.top) / rect.height - 0.5;
        art.style.setProperty("--mx", `${dx * 38}px`);
        art.style.setProperty("--my", `${dy * 26}px`);
        art.style.setProperty("--ry", `${dx * -7}deg`);
        art.style.setProperty("--rx", `${dy * 5}deg`);
        hero.style.setProperty("--gx", `${dx * -16}px`);
        hero.style.setProperty("--gy", `${dy * -12}px`);
      },
      { passive: true },
    );
    hero.addEventListener("pointerleave", () => {
      ["--rx", "--ry", "--mx", "--my"].forEach((k) =>
        art.style.removeProperty(k),
      );
      ["--gx", "--gy"].forEach((k) => hero.style.removeProperty(k));
    });
    function animate(el, frames, options) {
      if (!allowed()) return;
      const animation = el.animate(frames, options);
      activeAnimations.add(animation);
      animation.finished
        .catch(() => {})
        .finally(() => activeAnimations.delete(animation));
    }
    function playIntro() {
      if (!allowed()) return;
      clearTimeout(introTimer);
      intro.classList.remove("running");
      void intro.offsetWidth;
      intro.classList.add("running");
      hero.querySelectorAll("h1 > span").forEach((el, i) =>
        animate(
          el,
          [
            {
              opacity: 0,
              translate: `${i % 2 ? 100 : -100}px 35px`,
              rotate: "-8deg",
              filter: "blur(8px)",
            },
            { opacity: 1, translate: "0 0", rotate: "0deg", filter: "blur(0)" },
          ],
          {
            duration: 750,
            delay: 900 + i * 140,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards",
          },
        ),
      );
      animate(
        art,
        [
          { opacity: 0, clipPath: "inset(0 100% 0 0)", translate: "100px 0" },
          { opacity: 1, clipPath: "inset(0 0 0 0)", translate: "0 0" },
        ],
        {
          duration: 1050,
          delay: 750,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        },
      );
      introTimer = setTimeout(() => intro.classList.remove("running"), 1900);
    }
    replay.addEventListener("click", playIntro);
    // Re-arm every card after it leaves the viewport, in either direction.
    const sceneItems = new Map();
    let scrollDirection = 1,
      previousScroll = scrollY,
      scrollFrame = 0;
    const sceneSelector =
      ".section-heading,.profile-art,.about-copy,.experience-feature,.experience-header,.experience-work>section,.agent-grid>div,.project-card,.vibe-card,.info-card,.note-card,.footer-main,.footer-links";
    const sceneSections = [...document.querySelectorAll(".section-band")];
    const ghostNames = [
      "THE PLAYER",
      "EXPERIENCE",
      "SAVE POINTS",
      "LOADOUT",
      "ARCHIVE",
    ];
    sceneSections.forEach((section, i) => {
      const ghost = document.createElement("div");
      ghost.className = "fx-ghost-title";
      ghost.setAttribute("aria-hidden", "true");
      ghost.textContent = ghostNames[i];
      section.append(ghost);
    });
    root.classList.add("fx-scroll-ready");
    // Distinct visual vocabulary for each type of content; reverse only its travel direction.
    function sceneChoreography(el, index, direction, narrow) {
      const sign = index % 2 ? 1 : -1;
      const full = "inset(0% 0% 0% 0%)";
      const still = {
        opacity: 1,
        translate: "0 0",
        rotate: "0deg",
        scale: 1,
        filter: "blur(0px)",
        clipPath: full,
      };
      const make = (name, frames, duration = 850, delay = 0) => ({
        name,
        frames,
        duration,
        delay,
      });
      if (el.matches(".experience-feature"))
        return make(
          "cinematic-aperture",
          [
            {
              opacity: 0.2,
              clipPath: "inset(48% 0% 48% 0%)",
              scale: 1.08,
              filter: "brightness(1.5)",
            },
            { opacity: 1, clipPath: full, scale: 1, filter: "brightness(1)" },
          ],
          1350,
        );
      if (el.matches(".profile-art"))
        return make(
          "polaroid-turn",
          [
            {
              opacity: 0,
              translate: `${sign * (narrow ? 24 : 65)}px ${direction * 25}px`,
              rotate: `${direction * -14}deg`,
              scale: 0.93,
            },
            {
              opacity: 1,
              translate: "0 0",
              rotate: "2deg",
              scale: 1.025,
              offset: 0.76,
            },
            { opacity: 1, translate: "0 0", rotate: "0deg", scale: 1 },
          ],
          1050,
        );
      if (el.matches(".about-copy"))
        return make(
          "editorial-unfold",
          [
            {
              opacity: 0,
              clipPath:
                direction > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
            },
            { opacity: 1, clipPath: full },
          ],
          1100,
          100,
        );
      if (el.matches(".experience-header"))
        return make(
          "title-lock-on",
          [
            { opacity: 0, translate: "-45px 0", filter: "blur(7px)" },
            { opacity: 1, translate: "0 0", filter: "blur(0px)" },
          ],
          900,
          180,
        );
      if (el.matches(".experience-work>section"))
        return make(
          "mission-panel",
          [
            {
              opacity: 0,
              clipPath: "inset(0% 100% 0% 0%)",
              translate: `${sign * 20}px 0`,
            },
            { opacity: 1, clipPath: full, translate: "0 0" },
          ],
          900,
          index * 160,
        );
      if (el.matches(".agent-grid>div"))
        return make(
          "agent-boot",
          [
            { opacity: 0, scale: 0.93, filter: "blur(9px)" },
            { opacity: 1, scale: 1.01, filter: "blur(0px)", offset: 0.8 },
            { opacity: 1, scale: 1, filter: "blur(0px)" },
          ],
          1050,
          index * 180,
        );
      if (el.matches(".project-card")) {
        switch (index % 4) {
          case 0:
            return make(
              "project-diagonal",
              [
                {
                  opacity: 0.2,
                  clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
                },
                {
                  opacity: 1,
                  clipPath: "polygon(0% 0%, 78% 0%, 36% 100%, 0% 100%)",
                  offset: 0.58,
                },
                {
                  opacity: 1,
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                },
              ],
              1050,
            );
          case 1:
            return make(
              "project-shutter",
              [
                { opacity: 0.3, clipPath: "inset(50% 0% 50% 0%)", scale: 0.98 },
                { opacity: 1, clipPath: full, scale: 1 },
              ],
              1000,
              100,
            );
          case 2:
            return make(
              "project-perspective",
              [
                {
                  opacity: 0,
                  transform: `perspective(1200px) rotateY(${direction * -17}deg)`,
                  translate: `${direction * -35}px 0`,
                  transformOrigin: "left center",
                },
                {
                  opacity: 1,
                  transform: "perspective(1200px) rotateY(0deg)",
                  translate: "0 0",
                  transformOrigin: "left center",
                },
              ],
              1150,
            );
          default:
            return make(
              "project-scan",
              [
                {
                  opacity: 0.4,
                  clipPath:
                    direction > 0
                      ? "inset(100% 0% 0% 0%)"
                      : "inset(0% 0% 100% 0%)",
                  translate: `0 ${direction * 25}px`,
                },
                { opacity: 1, clipPath: full, translate: "0 0" },
              ],
              1100,
              120,
            );
        }
      }
      if (el.matches(".vibe-card"))
        return make(
          "sidequest-fan",
          [
            {
              opacity: 0,
              rotate: `${sign * direction * 8}deg`,
              translate: `${sign * 30}px ${direction * 25}px`,
              transformOrigin: sign > 0 ? "right bottom" : "left bottom",
            },
            { opacity: 1, rotate: "0deg", translate: "0 0" },
          ],
          900,
          index * 120,
        );
      if (el.matches(".info-card"))
        return make(
          "skill-unlock",
          [
            { opacity: 0, scale: 0.76, filter: "blur(4px)" },
            { opacity: 1, scale: 1.035, filter: "blur(0px)", offset: 0.7 },
            { opacity: 1, scale: 1, filter: "blur(0px)" },
          ],
          760,
          (index % 3) * 140,
        );
      if (el.matches(".note-card"))
        return make(
          "archive-drawer",
          [
            {
              opacity: 0,
              translate: `${direction * (narrow ? 22 : 45)}px 0`,
              clipPath: "inset(0% 0% 0% 12%)",
            },
            { opacity: 1, translate: "0 0", clipPath: full },
          ],
          650,
          (index % 3) * 80,
        );
      if (el.matches(".footer-main"))
        return make(
          "final-title",
          [
            {
              opacity: 0,
              translate: `0 ${direction * 60}px`,
              filter: "blur(4px)",
            },
            { opacity: 1, translate: "0 0", filter: "blur(0px)" },
          ],
          1200,
        );
      if (el.matches(".footer-links"))
        return make("footer-fade", [{ opacity: 0 }, { opacity: 1 }], 850, 250);
      if (el.matches(".section-heading")) {
        if (el.closest("#experience"))
          return make(
            "featured-heading",
            [
              {
                opacity: 0,
                clipPath: "inset(0% 100% 0% 0%)",
                filter: "blur(3px)",
              },
              { opacity: 1, clipPath: full, filter: "blur(0px)" },
            ],
            1200,
          );
        if (el.closest("#skills"))
          return make(
            "loadout-heading",
            [
              { opacity: 0, scale: 0.92 },
              { opacity: 1, scale: 1 },
            ],
            800,
          );
        if (el.closest("#notes"))
          return make(
            "archive-heading",
            [
              { opacity: 0, translate: "-25px 0" },
              { opacity: 1, translate: "0 0" },
            ],
            750,
          );
        return make(
          "chapter-mask",
          [
            { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
            { opacity: 1, clipPath: full },
          ],
          900,
        );
      }
      return make("quiet-fade", [{ opacity: 0 }, still], 650);
    }
    function revealScene(el, item) {
      item.animation?.cancel();
      item.animation = null;
      el.dataset.sceneState = "inside";
      if (
        !allowed() ||
        el.matches(".note-card.expanded") ||
        el.contains(document.activeElement)
      )
        return;
      const index = [...el.parentElement.children].indexOf(el);
      const narrow = innerWidth < 700;
      const heading = el.matches(".section-heading");
      el.classList.remove("fx-scene-impact");
      void el.offsetWidth;
      el.classList.add("fx-scene-impact");
      if (heading) {
        el.classList.remove("fx-heading-hit");
        void el.offsetWidth;
        el.classList.add("fx-heading-hit");
      }
      const preset = sceneChoreography(el, index, scrollDirection, narrow);
      el.dataset.entryStyle = preset.name;
      const animation = el.animate(preset.frames, {
        duration: preset.duration,
        delay: preset.delay || 0,
        easing: preset.easing || "cubic-bezier(.16,1,.3,1)",
        fill: "backwards",
      });
      item.animation = animation;
      activeAnimations.add(animation);
      animation.finished
        .catch(() => {})
        .finally(() => {
          activeAnimations.delete(animation);
          if (item.animation === animation) {
            item.animation = null;
            const bounds = el.getBoundingClientRect();
            if (bounds.bottom < 76 || bounds.top > innerHeight - 24) {
              item.inside = false;
              el.dataset.sceneState = "outside";
              el.classList.remove("fx-scene-impact", "fx-heading-hit");
            }
          }
        });
    }
    const entranceObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target,
            item = sceneItems.get(el);
          if (!item) continue;
          if (entry.isIntersecting) {
            if (!item.inside) {
              item.inside = true;
              revealScene(el, item);
            }
          } else {
            // Transforms can briefly move an entering card outside the observer. Let its entrance finish.
            if (item.animation && allowed()) continue;
            item.inside = false;
            item.animation?.cancel();
            item.animation = null;
            el.dataset.sceneState = "outside";
            el.classList.remove("fx-scene-impact", "fx-heading-hit");
          }
        }
      },
      { rootMargin: "-76px 0px -24px 0px", threshold: 0 },
    );
    function observeElements(node) {
      if (node.nodeType !== 1) return;
      const elements = [
        ...(node.matches(sceneSelector) ? [node] : []),
        ...node.querySelectorAll(sceneSelector),
      ];
      for (const el of elements)
        if (!sceneItems.has(el)) {
          sceneItems.set(el, { inside: false, animation: null });
          el.classList.add("fx-scroll-item");
          entranceObserver.observe(el);
        }
    }
    observeElements(document.querySelector("main"));
    observeElements(document.querySelector("footer"));
    new MutationObserver((records) => {
      for (const r of records) {
        r.removedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          for (const el of [node, ...node.querySelectorAll(sceneSelector)]) {
            const item = sceneItems.get(el);
            if (item) {
              item.animation?.cancel();
              entranceObserver.unobserve(el);
              sceneItems.delete(el);
            }
          }
        });
        r.addedNodes.forEach(observeElements);
      }
    }).observe(document.querySelector("main"), {
      childList: true,
      subtree: true,
    });
    function updateScrollScene() {
      scrollFrame = 0;
      if (!allowed()) return;
      const current = scrollY,
        delta = current - previousScroll;
      if (Math.abs(delta) > 1) scrollDirection = delta > 0 ? 1 : -1;
      previousScroll = current;
      root.dataset.scrollDirection = scrollDirection > 0 ? "down" : "up";
      const viewportHeight = innerHeight;
      for (const section of sceneSections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < viewportHeight) {
          const offset = Math.max(
            -120,
            Math.min(120, (viewportHeight * 0.5 - rect.top) * 0.13),
          );
          section.style.setProperty("--ghost-shift", `${offset}px`);
          section.style.setProperty("--ghost-drift", `${offset * -0.3}px`);
        }
      }
      for (const [el, item] of sceneItems) {
        if (
          !item.inside ||
          !el.matches(".project-card") ||
          item.animation ||
          el.matches(".note-card.expanded") ||
          el.contains(document.activeElement)
        )
          continue;
        const box = el.getBoundingClientRect();
        const leavingTop = Math.max(0, Math.min(1, (160 - box.bottom) / 160));
        const enteringBottom = Math.max(
          0,
          Math.min(1, (box.top - (viewportHeight - 80)) / 120),
        );
        const edge = Math.max(leavingTop, enteringBottom);
        el.style.setProperty(
          "--edge-y",
          `${(enteringBottom - leavingTop) * 20}px`,
        );
        el.style.setProperty("--edge-scale", String(1 - edge * 0.055));
        el.style.setProperty(
          "--edge-turn",
          `${(enteringBottom - leavingTop) * 1.5}deg`,
        );
      }
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0) {
        hero.style.setProperty(
          "--hero-scroll",
          `${Math.min(current * 0.2, 140)}px`,
        );
        hero.style.setProperty(
          "--copy-scroll",
          `${Math.min(current * 0.09, 65)}px`,
        );
      }
      document
        .querySelector(".ticker")
        .style.setProperty("--scroll-drift", `${-(current % 1600) * 0.1}px`);
    }
    window.addEventListener(
      "scroll",
      () => {
        const delta = scrollY - previousScroll;
        if (Math.abs(delta) > 1) scrollDirection = delta > 0 ? 1 : -1;
        if (!scrollFrame)
          scrollFrame = requestAnimationFrame(updateScrollScene);
      },
      { passive: true },
    );
    window.addEventListener(
      "resize",
      () => {
        if (!scrollFrame)
          scrollFrame = requestAnimationFrame(updateScrollScene);
      },
      { passive: true },
    );
    document.addEventListener("focusin", (event) => {
      const el = event.target.closest(".fx-scroll-item");
      if (!el) return;
      const item = sceneItems.get(el);
      if (item) {
        item.animation?.cancel();
        el.dataset.sceneState = "inside";
      }
    });
    function resetScrollScene() {
      for (const [el, item] of sceneItems) {
        item.animation?.cancel();
        item.animation = null;
        el.dataset.sceneState = "inside";
      }
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      previousScroll = scrollY;
    }
    updateScrollScene();
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        hero.classList.toggle("fx-offscreen", !heroVisible);
        wake();
      },
      { threshold: 0 },
    ).observe(hero);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            sectionLabel.textContent =
              entry.target.querySelector(".eyebrow")?.textContent ||
              "00 / ENTER THE WORLD";
          }
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main > section,footer")
      .forEach((el) => sectionObserver.observe(el));
    document.querySelectorAll('a[href^="#"]').forEach((link) =>
      link.addEventListener("click", () => {
        document.querySelector(".page-wipe").dataset.scene = link.textContent
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 30);
      }),
    );
    function syncPreference() {
      if (!allowed()) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        hidePointer();
        resetTilt();
        resetMagnet();
        particles = [];
        trail = [];
        rings = [];
        bursts = [];
        ctx?.clearRect(0, 0, width, height);
        activeAnimations.forEach((a) => a.cancel());
        activeAnimations.clear();
        resetScrollScene();
        intro.classList.remove("running");
        clearTimeout(introTimer);
      } else {
        updateScrollScene();
        wake();
      }
    }
    let wasPaused = root.classList.contains("motion-paused");
    new MutationObserver(() => {
      const paused = root.classList.contains("motion-paused");
      if (paused !== wasPaused) {
        wasPaused = paused;
        syncPreference();
      }
    }).observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", syncPreference);
    finePointer.addEventListener("change", () => {
      hidePointer();
      syncPreference();
    });
    window.addEventListener("resize", resize, { passive: true });
    resize();
    playIntro();
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
