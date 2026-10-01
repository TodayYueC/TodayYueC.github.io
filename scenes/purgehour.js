/* Save slot 01 · PurgeHour: an architecture inspector for the GAS combat stack.
   The canvas walks through Owner/Avatar ownership, Ability Spec Handles, the
   Attribute → PlayerState → UI broadcast chain, DataAsset schemas and the enemy
   death pipeline — the same decisions called out in the project's README. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;
  const TAU = Math.PI * 2;
  const MONO = '"JetBrains Mono", Consolas, monospace';
  const DISPLAY = '"Barlow Condensed", "Arial Narrow", sans-serif';
  const FLOWS = [
    { id: "OWN", label: "OWNERSHIP", title: "PlayerState owns ASC", sub: "Character is Avatar only" },
    { id: "GA", label: "ABILITY FLOW", title: "Spec Handle lifecycle", sub: "Give → Activate → Cancel" },
    { id: "ATTR", label: "ATTR → UI", title: "Attribute broadcast hub", sub: "GAS · PlayerState · Widget" },
    { id: "DATA", label: "DATA DRIVEN", title: "Weapon / Sword DataAssets", sub: "Schema in C++, values in assets" },
    { id: "AI", label: "ENEMY AI", title: "Perception → BT → GAS", sub: "Death closes collision + DeathGA" },
  ];

  YC.defineScene("purgehour", (canvas) => {
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
    let pulse = 0;
    const packets = [];
    const tags = [];
    let tagTimer = 0;

    function setMode(text) {
      if (modeEl && modeEl.textContent !== text) modeEl.textContent = text;
    }
    setMode(FLOWS[0].id);

    function emitTag(text, color) {
      tags.push({ text, color, life: 2.4 });
      if (tags.length > 5) tags.shift();
    }

    function emitPacket(from, to, color) {
      packets.push({ from: [...from], to: [...to], t: 0, color });
    }

    function roundRect(x, y, rw, rh, r) {
      const rr = Math.min(r, rw / 2, rh / 2);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, rw, rh, rr);
      else ctx.rect(x, y, rw, rh);
    }

    function node(x, y, rw, rh, title, lines, accent, lit) {
      ctx.fillStyle = lit ? "rgba(20,16,24,0.92)" : "rgba(12,10,16,0.88)";
      ctx.strokeStyle = lit ? accent : "rgba(255,255,255,0.14)";
      ctx.lineWidth = lit ? 1.8 : 1;
      roundRect(x, y, rw, rh, 8);
      ctx.fill();
      ctx.stroke();
      if (lit) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.12 + pulse * 0.08;
        roundRect(x, y, rw, 18, 8);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = accent;
      ctx.font = `700 9px ${MONO}`;
      ctx.fillText(title, x + 10, y + 13);
      ctx.fillStyle = "rgba(245,240,234,0.88)";
      ctx.font = `500 10.5px ${MONO}`;
      lines.forEach((line, i) => ctx.fillText(line, x + 10, y + 30 + i * 13));
    }

    function wire(a, b, color, on) {
      ctx.strokeStyle = on ? color : "rgba(255,255,255,0.12)";
      ctx.lineWidth = on ? 1.8 : 1;
      ctx.beginPath();
      const mx = (a[0] + b[0]) / 2;
      ctx.moveTo(a[0], a[1]);
      ctx.bezierCurveTo(mx, a[1], mx, b[1], b[0], b[1]);
      ctx.stroke();
    }

    function drawOwnership() {
      const ps = [w * 0.08, h * 0.22, w * 0.34, 72];
      const hero = [w * 0.58, h * 0.22, w * 0.34, 72];
      const weapon = [w * 0.33, h * 0.58, w * 0.34, 58];
      node(ps[0], ps[1], ps[2], ps[3], "AHeroPlayerState · OWNER", ["UHeroYueASC  (replicated)", "UHeroAttributeSet"], "#ff7ba5", true);
      node(hero[0], hero[1], hero[2], hero[3], "AHero · AVATAR", ["PossessedBy / OnRep_PS", "InitAbilityActorInfo()"], "#62e6f0", flowT > 0.25);
      node(weapon[0], weapon[1], weapon[2], weapon[3], "AWeaponBase / ASwordBase", ["attached · grants GA handles"], "#ffd479", flowT > 0.55);
      const a = [ps[0] + ps[2], ps[1] + 36];
      const b = [hero[0], hero[1] + 36];
      const c = [hero[0] + hero[2] / 2, hero[1] + hero[3]];
      const d = [weapon[0] + weapon[2] / 2, weapon[1]];
      wire(a, b, "#ff7ba5", true);
      wire(c, d, "#62e6f0", flowT > 0.45);
      if (flowT > 0.2 && packets.length < 2) emitPacket(a, b, "#ff7ba5");
      if (flowT > 0.55 && packets.length < 3) emitPacket(c, d, "#62e6f0");
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `600 10px ${MONO}`;
      ctx.fillText("Respawn keeps ASC on PlayerState — cooldowns / buffs survive.", 14, h - 16);
    }

    function drawAbility() {
      const steps = [
        { x: 0.06, t: "1 · GIVE", d: ["PickUpWeapon / Sword", "GiveAbility → Handle"] },
        { x: 0.36, t: "2 · ACTIVATE", d: ["Controller → Hero", "TryActivateAbility"] },
        { x: 0.66, t: "3 · CANCEL", d: ["StopFire / Switch", "CancelAbilityHandle"] },
      ];
      const y = h * 0.26;
      steps.forEach((s, i) => {
        const lit = flowT > i * 0.28;
        node(w * s.x, y, w * 0.26, 78, s.t, s.d, i === 1 ? "#ff7ba5" : "#62e6f0", lit);
        if (i < 2) {
          const a = [w * s.x + w * 0.26, y + 39];
          const b = [w * steps[i + 1].x, y + 39];
          wire(a, b, "#ffd479", flowT > (i + 0.5) * 0.28);
          if (flowT > (i + 0.5) * 0.28) emitPacket(a, b, "#ffd479");
        }
      });
      const handles = ["GAFireHandle", "GAReloadHandle", "GAAttackHandle", "GAComboHandle", "GADodgeHandle"];
      handles.forEach((name, i) => {
        const on = Math.floor(time * 1.4 + i) % handles.length === i && flowT > 0.3;
        ctx.fillStyle = on ? "#ff7ba5" : "rgba(255,255,255,0.45)";
        ctx.font = `600 9px ${MONO}`;
        ctx.fillText((on ? "▶ " : "· ") + name, 16 + (i % 3) * 150, h - 34 + Math.floor(i / 3) * 14);
      });
    }

    function drawAttr() {
      const boxes = [
        { x: 0.05, t: "AttributeSet", d: ["Health / MaxHealth", "Ammo / ReserveAmmo"], c: "#ffd479" },
        { x: 0.37, t: "PlayerState hub", d: ["BindAttributeCallbacks", "Dynamic multicast"], c: "#ff7ba5" },
        { x: 0.69, t: "UFightWidget", d: ["NativeConstruct bind", "snapshot + live"], c: "#62e6f0" },
      ];
      const y = h * 0.28;
      boxes.forEach((b, i) => {
        node(w * b.x, y, w * 0.26, 78, b.t, b.d, b.c, flowT > i * 0.3);
        if (i < 2) {
          const a = [w * b.x + w * 0.26, y + 39];
          const z = [w * boxes[i + 1].x, y + 39];
          wire(a, z, b.c, flowT > (i + 0.4) * 0.3);
          if (flowT > (i + 0.4) * 0.3) emitPacket(a, z, b.c);
        }
      });
      const attrs = [
        ["Health", 0.72],
        ["Ammo", 0.45 + 0.1 * Math.sin(time * 3)],
        ["Reserve", 0.8],
      ];
      attrs.forEach((a, i) => {
        const x = 16 + i * 150;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = `600 9px ${MONO}`;
        ctx.fillText(a[0], x, h - 28);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(x, h - 22, 120, 5);
        ctx.fillStyle = boxes[i].c;
        ctx.fillRect(x, h - 22, 120 * a[1], 5);
      });
    }

    function drawData() {
      node(w * 0.05, h * 0.2, w * 0.42, 150, "UWeaponData · PrimaryDataAsset", [
        "AttackSpeed · Damage",
        "InitBullet / MaxMagazine",
        "RecoilPitch / Yaw / MaxCount",
        "Mesh · Sound · FireAnim · Icon",
      ], "#ff7ba5", true);
      node(w * 0.53, h * 0.2, w * 0.42, 150, "USwordData · DataAsset", [
        "Damage · StaticMesh",
        "MeleeMontage × 3",
        "Combo1[] · Combo2[]",
        "SkillsMontage · Description",
      ], "#ffd479", flowT > 0.35);
      ctx.fillStyle = "rgba(245,240,234,0.75)";
      ctx.font = `600 10px ${MONO}`;
      ctx.fillText("C++ defines the schema. New guns / swords = new assets, not new branches.", 14, h - 16);
    }

    function drawAI() {
      const steps = [
        { x: 0.04, t: "PERCEPTION", d: ["Sight 2000 / 90°", "IsPlayerTarget()"] },
        { x: 0.28, t: "BLACKBOARD", d: ["TargetActor key", "lost → clear if match"] },
        { x: 0.52, t: "BEHAVIOR TREE", d: ["Patrol / Chase", "BTTask_Attack"] },
        { x: 0.76, t: "GAS DEATH", d: ["Health ≤ 0", "SetDead → DeathGA"] },
      ];
      const y = h * 0.28;
      steps.forEach((s, i) => {
        node(w * s.x, y, w * 0.2, 78, s.t, s.d, i === 3 ? "#ff7ba5" : "#62e6f0", flowT > i * 0.22);
        if (i < 3) {
          const a = [w * s.x + w * 0.2, y + 39];
          const b = [w * steps[i + 1].x, y + 39];
          wire(a, b, "#ffd479", flowT > (i + 0.5) * 0.22);
        }
      });
      ctx.fillStyle = "rgba(245,240,234,0.72)";
      ctx.font = `600 10px ${MONO}`;
      ctx.fillText("Death closes capsule + mesh collision so warp targets skip corpses.", 14, h - 16);
    }

    const drawers = [drawOwnership, drawAbility, drawAttr, drawData, drawAI];

    function drawChrome() {
      ctx.fillStyle = "#0c0a10";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,123,165,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 24) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (let y = 0; y < h; y += 24) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(255,123,165,0.9)";
      ctx.font = `800 11px ${MONO}`;
      ctx.fillText("ARCHITECTURE · " + FLOWS[flow].label, 12, 18);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = `600 9px ${MONO}`;
      ctx.fillText(FLOWS[flow].sub, 12, 32);

      const tabW = Math.min(78, (w - 24) / FLOWS.length - 4);
      FLOWS.forEach((f, i) => {
        const x = 12 + i * (tabW + 4);
        const on = i === flow || i === hover;
        ctx.fillStyle = on ? "rgba(255,123,165,0.22)" : "rgba(255,255,255,0.05)";
        roundRect(x, 42, tabW, 18, 4);
        ctx.fill();
        ctx.fillStyle = on ? "#ffd2df" : "rgba(255,255,255,0.45)";
        ctx.font = `700 8px ${MONO}`;
        ctx.fillText(f.id, x + 6, 54);
      });

      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = `600 8px ${MONO}`;
      ctx.fillText("CLICK TAB · SPACE NEXT", w - 138, 18);
    }

    function drawPackets(dt) {
      for (const p of packets) {
        p.t += dt * 1.4;
        const t = Math.min(1, p.t);
        const x = p.from[0] + (p.to[0] - p.from[0]) * t;
        const y = p.from[1] + (p.to[1] - p.from[1]) * t;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, TAU);
        ctx.fill();
      }
      for (let i = packets.length - 1; i >= 0; i--) if (packets[i].t >= 1) packets.splice(i, 1);
    }

    function drawTags(dt) {
      for (const t of tags) t.life -= dt;
      for (let i = tags.length - 1; i >= 0; i--) if (tags[i].life <= 0) tags.splice(i, 1);
      tags.forEach((t, i) => {
        ctx.globalAlpha = Math.min(1, t.life);
        ctx.fillStyle = t.color;
        ctx.font = `700 9px ${MONO}`;
        ctx.textAlign = "right";
        ctx.fillText(t.text, w - 12, 70 + i * 13);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      });
    }

    function setFlow(next) {
      flow = (next + FLOWS.length) % FLOWS.length;
      flowT = 0;
      packets.length = 0;
      setMode(FLOWS[flow].id);
      emitTag(FLOWS[flow].title, "#ffd2df");
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
      if (event.pointerType !== "mouse") return;
      hover = tabAt(localX(event));
    });
    canvas.addEventListener("pointerleave", () => (hover = -1));
    canvas.addEventListener("pointerdown", (event) => {
      const i = tabAt(localX(event));
      if (i >= 0) setFlow(i);
      else setFlow(flow + 1);
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

    emitTag("ASC on PlayerState", "#ff7ba5");

    return {
      resize() {
        const fit = YC.fitCanvas(canvas, 1.5);
        dpr = fit.dpr;
        w = fit.w / dpr;
        h = fit.h / dpr;
      },
      frame(dt) {
        time += dt;
        pulse = 0.5 + 0.5 * Math.sin(time * 3);
        flowT = Math.min(1, flowT + dt * 0.55);
        if (time - lastInput > 4.5) {
          autoTimer += dt;
          if (autoTimer > 3.2) {
            autoTimer = 0;
            setFlow(flow + 1);
          }
        } else {
          autoTimer = 0;
        }
        tagTimer -= dt;
        if (tagTimer <= 0) {
          tagTimer = 2.2;
          const pool = [
            ["InitAbilityActorInfo", "#62e6f0"],
            ["FGameplayAbilitySpecHandle", "#ffd479"],
            ["SetByCaller · Reload", "#ff7ba5"],
            ["MotionWarping target", "#62e6f0"],
            ["Perception → Blackboard", "#ffd479"],
          ];
          const pick = pool[Math.floor(time * 0.4) % pool.length];
          emitTag(pick[0], pick[1]);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawChrome();
        drawers[flow]();
        drawPackets(dt);
        drawTags(dt);
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
