/* PurgeHour gameplay illustration: rifle fire, sword combo and enemy response.
   Sources: README.md; Source/PurgeHour/Private/Characters/Hero/Hero.cpp (Fire, Combo,
   UpdateWarpTarget); Source/PurgeHour/Private/Characters/Enemy/EnemyBase1.cpp.
   Silhouettes and arena are illustrative, not in-game assets. */
(() => {
  const YC = window.YC;
  if (!YC?.defineScene) return;
  const TAU = Math.PI * 2;
  const MONO = '"JetBrains Mono", Consolas, monospace';
  YC.defineScene("purgehour", (canvas) => {
    const ctx = canvas.getContext("2d");
    const modeEl = canvas.closest(".slot")?.querySelector("[data-hud-mode]");
    let width = 600, height = 375, dpr = 1, time = 0, age = 0.28, mode = 0, autoTimer = 0, manual = false;
    const colors = ["#65e7f3", "#ff7ba5"];
    function setMode(n) { mode = (n + 2) % 2; if (modeEl) modeEl.textContent = mode ? "SWORD" : "RIFLE"; }
    function shape(points, fill, stroke, lineWidth = 1) {
      ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
    }
    function line(points, color, width = 1) {
      ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    }
    function glow(x, y, r, color) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(x-r, y-r, r*2, r*2);
    }
    function background() {
      const bg = ctx.createLinearGradient(0, 0, 0, 375); bg.addColorStop(0, "#111020"); bg.addColorStop(0.6, "#181729"); bg.addColorStop(1, "#090b14");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 375);
      glow(445, 175, 160, "rgba(255,91,148,0.22)"); glow(110, 220, 180, "rgba(70,192,217,0.16)");
      shape([[0,88],[180,102],[266,207],[0,215]], "rgba(18,29,44,0.42)");
      shape([[600,79],[482,98],[403,206],[600,210]], "rgba(47,26,49,0.36)");
      line([[0,92],[176,107],[254,210]], "rgba(105,208,225,0.19)",2);
      line([[600,84],[485,104],[411,209]], "rgba(255,143,183,0.16)",2);
      for(let i=0;i<4;i++) {
        const x=55+i*158; const grad=ctx.createLinearGradient(x,110,x,225);
        grad.addColorStop(0,"rgba(132,160,195,0)");grad.addColorStop(1,"rgba(132,160,195,0.1)");
        ctx.fillStyle=grad;ctx.fillRect(x,112,2,112);
      }
      ctx.fillStyle = "rgba(125,115,160,0.08)";
      [[0,160,68,75],[75,132,54,100],[135,175,65,58],[215,125,46,104],[270,155,80,75],[360,112,55,120],[428,151,70,80],[508,125,92,100]].forEach(([x,y,w,h])=>ctx.fillRect(x,y,w,h));
      line([[0,222],[600,222]], "rgba(164,151,189,0.26)");
      shape([[0,270],[600,205],[600,375],[0,375]], "#111421");
      shape([[0,292],[600,221],[600,235],[0,315]], "rgba(59,74,101,0.24)");
      for (let i=0;i<7;i++) {
        const y=246+i*25;
        line([[0,y+65],[600,y-20]], "rgba(99,147,170,0.15)");
      }
      for (let i=0;i<9;i++) line([[300+(i-4)*32,222],[(i-4)*140+300,375]], "rgba(99,147,170,0.11)");
      line([[0,282],[600,212]], "rgba(99,230,242,0.32)", 1.5);
      line([[0,314],[600,234]], "rgba(255,123,165,0.16)", 1);
      shape([[20,301],[187,281],[197,285],[27,308]], "rgba(107,228,241,0.17)");
      shape([[374,258],[565,235],[574,239],[384,263]], "rgba(255,123,165,0.13)");
      const fog=ctx.createLinearGradient(0,205,0,295);fog.addColorStop(0,"rgba(142,151,192,0)");fog.addColorStop(0.5,"rgba(142,151,192,0.06)");fog.addColorStop(1,"rgba(142,151,192,0)");
      ctx.fillStyle=fog;ctx.fillRect(0,205,600,90);
      ctx.fillStyle = "rgba(199,230,240,0.32)";
      for (let i=0;i<15;i++) {
        const x=(i*109+33)%600, y=95+(i*47)%148;
        ctx.fillRect(x, y + Math.sin(time*0.6+i)*2, i%4===0?2:1, i%4===0?2:1);
      }
    }
    function hero(shift) {
      ctx.save(); ctx.translate(shift,0);
      ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.ellipse(171,327,57,13,-0.1,0,TAU); ctx.fill();
      // Graphic silhouette: an illustration, not an in-game character model.
      shape([[144,243],[169,246],[165,282],[151,321],[130,318],[143,273]], "#252c3d", "#526174");
      shape([[171,245],[194,241],[205,278],[224,312],[207,321],[183,291],[171,269]], "#1b2231", "#516070");
      shape([[129,316],[151,318],[151,326],[121,328]], "#0b0f18");
      shape([[207,317],[225,310],[234,317],[229,324],[209,325]], "#0b0f18");
      shape([[141,169],[165,159],[190,171],[199,206],[187,249],[153,254],[133,226]], "#293247", "#8397ad",1.2);
      shape([[154,177],[174,170],[188,180],[188,207],[157,210]], "#39435a", "#5c7185");
      shape([[159,181],[174,176],[184,182],[184,196],[158,201]], "#495972");
      line([[159,202],[184,199]],"rgba(154,202,212,0.48)",1);
      shape([[144,269],[160,271],[157,284],[142,283]],"#354257","#6a8292");
      shape([[187,270],[201,269],[206,282],[193,286]],"#354257","#6a8292");
      shape([[140,192],[153,190],[158,224],[150,244],[135,239],[130,218]], "#364153", "#6d8192");
      shape([[155,127],[170,119],[187,124],[194,140],[186,158],[170,164],[153,154],[149,140]], "#283448", "#98acbb",1.2);
      shape([[157,138],[174,132],[190,136],[188,145],[159,148]], "#15202c");
      glow(173,141,19,"rgba(103,239,247,0.22)");
      line([[161,142],[183,139]], "#6ff0f7",2);
      line([[153,128],[168,122],[181,125]],"rgba(222,244,255,0.45)",1);
      line([[176,150],[185,148]],"rgba(222,244,255,0.35)",1);
      shape([[138,174],[155,164],[162,177],[150,188],[136,187]], "#53637a", "#9db0bc");
      if (mode===0) {
        shape([[184,182],[198,177],[216,192],[238,192],[239,204],[209,211],[188,201]], "#37445a", "#8da2b1");
        shape([[222,185],[263,183],[268,189],[262,197],[231,198]], "#141a25", "#8abecb");
        shape([[235,196],[244,196],[240,209],[233,209]], "#111622", "#7896a1");
        line([[227,188],[252,187]], "#61dbe9",1.5);
      } else {
        shape([[184,180],[199,176],[215,196],[231,207],[224,218],[203,211],[187,201]], "#37445a", "#8da2b1");
        line([[223,211],[234,202]], "#c8d5dc",4);
        shape([[233,204],[265,171],[270,167],[267,175],[239,211]], "#a9dfe8", "#e6fbff",1);
      }
      line([[150,221],[189,218]], "rgba(103,230,245,0.8)",2);
      shape([[149,237],[187,235],[188,242],[150,246]], "#141b28", "#6d8795");
      ctx.restore();
    }
    function enemy(hit) {
      const jolt = hit ? 5 : Math.sin(time*1.1)*1.5;
      ctx.save(); ctx.translate(jolt,0);
      ctx.fillStyle="rgba(0,0,0,0.38)"; ctx.beginPath(); ctx.ellipse(451,280,38,8,-0.1,0,TAU); ctx.fill();
      shape([[429,238],[446,240],[443,262],[432,277],[420,274]], "#252331", "#7f6071");
      shape([[449,238],[466,235],[471,261],[483,272],[473,278],[457,265]], "#242230", "#7f6071");
      shape([[426,196],[446,189],[465,197],[469,220],[459,243],[433,245],[420,222]], "#3a303d", "#aa788d",1.2);
      shape([[435,171],[448,165],[462,171],[466,184],[457,195],[438,195],[430,184]], "#493442", "#d69aae",1.1);
      glow(447,182,18,"rgba(255,113,158,0.27)");
      line([[437,183],[456,181]], "#ff89a9",2);
      shape([[435,203],[446,198],[459,203],[458,216],[435,220]],"#594050","#a6788b");
      shape([[420,199],[429,198],[426,222],[411,232],[406,226],[415,212]], "#493441", "#aa788d");
      shape([[464,199],[473,201],[480,218],[490,222],[487,229],[473,225]], "#493441", "#aa788d");
      line([[433,219],[459,216]], "rgba(255,123,165,0.75)",2);
      ctx.restore();
    }
    function effects(phase, active) {
      if (!active) return;
      const strength = Math.sin(Math.PI * Math.min(1,phase));
      if (mode===0) {
        const x=267, y=190;
        glow(x,y,38,"rgba(100,237,255,0.45)");
        shape([[x-2,y],[x+14,y-4],[x+6,y-10],[x+25,y-2],[x+8,y+4],[x+12,y+10]], "rgba(213,252,255,0.9)");
        line([[x+12,y-2],[430,205]], "rgba(135,244,255,"+(0.3+strength*0.6)+")",2);
        line([[x+20,y+1],[425,208]], "rgba(255,255,255,"+(strength*0.7)+")",1);
        glow(441,210,38,"rgba(255,116,154,0.4)");
      } else {
        const x=415, y=205;
        glow(x,y,85,"rgba(255,93,160,0.25)");
        ctx.save(); ctx.translate(x,y); ctx.rotate(-0.55+phase*0.8);
        ctx.beginPath(); ctx.arc(0,0,64,-1.35,1.02); ctx.strokeStyle="rgba(255,128,182,"+(0.4+strength*0.5)+")"; ctx.lineWidth=8; ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0,58,-1.2,0.9); ctx.strokeStyle="rgba(255,245,251,0.9)"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
        line([[390,186],[450,228]], "rgba(255,224,237,0.65)",1.5);
        if(phase>0.35){ctx.save();ctx.translate(421,209);ctx.rotate(0.65);ctx.beginPath();ctx.arc(0,0,48,-1.2,0.8);ctx.strokeStyle="rgba(135,242,255,0.7)";ctx.lineWidth=2;ctx.stroke();ctx.restore();}
      }
      ctx.save(); ctx.translate(441,210); ctx.rotate(phase*1.2);
      for(let i=0;i<7;i++){ctx.rotate(TAU/7);line([[15,0],[24+8*strength,0]],mode?"#ffb2ca":"#a9f7ff",1.5);}
      ctx.restore();
    }
    function ui(W,H) {
      const gap=5, w=Math.min(104,(W-26-gap)/2), y=33, h=25;
      ["SHOOT","SLASH"].forEach((label,i)=>{
        const x=10+i*(w+gap), on=i===mode;
        ctx.fillStyle=on?(i?"rgba(255,123,165,0.27)":"rgba(101,231,243,0.24)"):"rgba(10,12,20,0.78)";
        ctx.strokeStyle=on?colors[i]:"rgba(204,214,231,0.24)";ctx.lineWidth=1;
        ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,w,h,4); else ctx.rect(x,y,w,h);ctx.fill();ctx.stroke();
        ctx.fillStyle=on?"#fff":"rgba(235,237,246,0.7)";ctx.textBaseline="middle";ctx.textAlign="center";ctx.font="700 11px "+MONO;ctx.fillText(label,x+w/2,y+h/2);
      });
      ctx.textAlign="right";ctx.font="600 10px "+MONO;ctx.fillStyle="rgba(230,225,238,0.72)";
      if(W>400) ctx.fillText("GAMEPLAY ILLUSTRATION",W-11,H-12);
      else ctx.fillText("ILLUSTRATION",W-11,H-12);
      ctx.textAlign="left";
    }
    function draw() {
      if(!ctx) return;
      const W=width/dpr,H=height/dpr, active=age<0.85, phase=Math.max(0,Math.min(1,age/0.85));
      ctx.setTransform(width/600,0,0,height/375,0,0); background();
      const hit=active&&phase>0.22&&phase<0.8;
      enemy(hit); const shift=mode===1&&active?Math.sin(phase*Math.PI)*150:0; hero(shift); effects(phase,active);
      // A target frame helps read the interaction without claiming actual game UI.
      ctx.strokeStyle=hit?"rgba(255,157,190,0.78)":"rgba(255,186,208,0.28)";ctx.lineWidth=1;
      [[416,165,1,1],[480,165,-1,1],[416,250,1,-1],[480,250,-1,-1]].forEach(([x,y,sx,sy])=>{
        ctx.beginPath();ctx.moveTo(x,y+sy*7);ctx.lineTo(x,y);ctx.lineTo(x+sx*7,y);ctx.stroke();
      });
      ctx.setTransform(dpr,0,0,dpr,0,0); ui(W,H);
    }
    function choose(next) { manual=true; autoTimer=0; setMode(next); age=YC.motionOK()?0:0.32; draw(); }
    function tabAt(e) {
      const r=canvas.getBoundingClientRect(), W=r.width, x=e.clientX-r.left, y=e.clientY-r.top;
      const gap=5,w=Math.min(104,(W-26-gap)/2);
      if(y<33||y>58) return -1;
      for(let i=0;i<2;i++){const left=10+i*(w+gap);if(x>=left&&x<=left+w)return i;}return -1;
    }
    canvas.addEventListener("pointerdown",e=>{const n=tabAt(e);choose(n<0?mode+1:n);});
    canvas.addEventListener("keydown",e=>{
      if(e.key===" "||e.key==="Enter"||e.key==="ArrowRight"){e.preventDefault();choose(mode+1);}
      else if(e.key==="ArrowLeft"){e.preventDefault();choose(mode-1);}
    });
    setMode(0);
    return {
      resize(){({w:width,h:height,dpr}=YC.fitCanvas(canvas,1.5));draw();},
      frame(dt){time+=dt;age+=dt;if(!manual){autoTimer+=dt;if(autoTimer>3.4){autoTimer=0;setMode(mode+1);age=0;}}draw();},
      still(){if(age>=0.85)age=0.32;draw();},
    };
  });
})();
