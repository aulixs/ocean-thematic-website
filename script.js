/* =========================================================
   OCEAN 2026 — interaction layer
   Pure JS, no dependencies.
   ========================================================= */
(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel) => document.querySelector(sel);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixColor = (a, b, t) => `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(lerp(a[2], b[2], t))})`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Every visible string has a parallel-reality version. */
  const ALT = {
    "depth-meta": `DEPTH LEFT <span>/</span> 2026`,
    "hint": `HOLD LEFT CLICK TO RETURN TO YOUR OCEAN`,
    "toast": `PARALLEL REALITY <span>— WELCOME TO THE OTHER SIDE</span>`,
    "hero-eyebrow": `A PARALLEL DESCENT <span>—</span> VOL. 02`,
    "hero-word": `ABYSS`,
    "hero-year": `∞`,
    "hero-sub": `A DIFFERENT OCEAN BREATHES HERE.<br>MOVE YOUR CURSOR. THE LIGHT REMEMBERS YOU.<br>SCROLL TO FIND WHAT WAS NEVER LOST.`,
    "hero-scroll": `SCROLL TO REMEMBER`,
    "zone-0": `00 <span>/</span> OTHER SIDE`,
    "zone-1": `<b>01</b> NEON SHALLOWS <span>0 — 200 M</span>`,
    "zone-2": `<b>02</b> VIOLET DRIFT <span>200 — 1000 M</span>`,
    "zone-3": `<b>03</b> THE OTHER DEEP <span>1000 — 4000 M</span>`,
    "c1-kicker": `THEY REMEMBER YOU`,
    "c1-title": `QUIET<br>FISH.<br><em>LOUD</em><br>MEMORIES.`,
    "c1-text": `Here the water keeps a second version of itself. The same fish leave different trails — and every trail leads somewhere you almost remember.`,
    "c1-stat": `<span>01</span> CARASSIUS AURATUS <i></i> MEMORY: 100%`,
    "c2-kicker": `MOVE BACKWARDS`,
    "c2-title": `ONE TURN.<br>ONE <em>ECHO.</em>`,
    "c2-text": `They never stop in the other ocean either. But here the current runs the other way, and the school moves through a light that has no source.`,
    "c3-kicker": `SOMETHING OLDER`,
    "c3-title": `THE SILENCE<br>HAS <em>NAMES.</em>`,
    "c3-text": `Light forgets you first. Then sound. Out of the violet, a shape that has been waiting for the other version of you.`,
    "c3-stat": `<span>02</span> CARCHARODON CARCHARIAS <i></i> MEMORY: 56 KM/H`,
    "a-kicker": `NO SUNLIGHT EVER DID`,
    "a-title": `DOWN WHERE THE<br>LIGHT <em>ANSWERS.</em>`,
    "center-kicker": `THE FIRST FRIEND`,
    "center-title": `THE<br>KRAKEN<br><em>KNOWS.</em>`,
    "center-text": `And right beside it, the version of the treasure you never kept.`,
    "end-kicker": `YOU WERE ALWAYS AT THE BOTTOM`,
    "end-title": `NICE TO MEET<br>YOU AT THE <span class="outline-text">BOTTOM.</span>`,
    "end-text": `The other ocean keeps its doors open.<br>Stay as long as you like — there is no surface here.`,
    "end-button": `<span>↑</span> BACK TO YOUR OCEAN`,
    "foot-1": `ABYSS 2026 <i>©</i> A PARALLEL DESCENT`,
    "foot-2": `DESIGNED TO BE REMEMBERED, NOT JUST SEEN`,
    "foot-3": `4000 M <i>—</i> 0 M`
  };
  const txNodes = [...document.querySelectorAll("[data-tx]")];
  const originalText = new Map(txNodes.map((el) => [el, el.innerHTML]));
  function applyTexts(glow) {
    txNodes.forEach((el) => {
      const alt = ALT[el.dataset.tx];
      el.innerHTML = glow && alt !== undefined ? alt : originalText.get(el);
    });
  }
  applyTexts(false);

  const shiftWipe = $("#shiftWipe");
  const shiftOrigin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let shiftTimers = [], shiftEndTimer = 0;
  function animateTexts(glow) {
    shiftTimers.forEach(clearTimeout);
    shiftTimers = [];
    clearTimeout(shiftEndTimer);

    root.classList.remove("is-shifting");
    shiftWipe.classList.remove("is-active");
    shiftWipe.style.setProperty("--ox", shiftOrigin.x + "px");
    shiftWipe.style.setProperty("--oy", shiftOrigin.y + "px");
    void shiftWipe.offsetWidth; // restart the CSS animation
    root.classList.add("is-shifting");
    shiftWipe.classList.add("is-active");

    txNodes.forEach((el, i) => {
      const delay = Math.min(i * 4, 130);
      el.style.setProperty("--shift-delay", delay + "ms");
      const alt = ALT[el.dataset.tx];
      let next = glow && alt !== undefined ? alt : originalText.get(el);
      if (el.dataset.tx === "toast") {
        next = glow ? ALT.toast : `REALITY RESTORED <span>— BACK TO THE OCEAN</span>`;
      }
      shiftTimers.push(setTimeout(() => { el.innerHTML = next; }, delay + 78));
    });

    shiftEndTimer = setTimeout(() => {
      root.classList.remove("is-shifting");
      shiftWipe.classList.remove("is-active");
      txNodes.forEach((el) => el.style.removeProperty("--shift-delay"));
      measure();
    }, 880);
  }

  /* -------------------------------------------------------
     1. Cursor trail — glowing gradient ribbon that decays
        when the pointer stops moving.
  ------------------------------------------------------- */
  const canvas = $("#trail");
  const ctx = canvas.getContext("2d");
  const pointer = { x: -100, y: -100, seen: false };
  const points = [];
  const TRAIL_MAX = 26;
  let vw = 0, vh = 0, dpr = 1, depth = 0, trailRunning = false;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function trailColor(alpha) {
    const glow = root.dataset.theme === "glow";
    const near = glow ? [255, 122, 198] : [116, 220, 255];
    const far = glow ? [255, 205, 236] : [214, 253, 255];
    return `rgba(${Math.round(lerp(near[0], far[0], depth))}, ${Math.round(lerp(near[1], far[1], depth))}, ${Math.round(lerp(near[2], far[2], depth))}, ${alpha})`;
  }

  let lastFrame = performance.now();
  function drawTrail(now) {
    const dt = clamp((now - lastFrame) / 1000, 0, 0.05);
    lastFrame = now;

    for (let i = points.length - 1; i >= 0; i--) {
      points[i].life -= dt * 1.05;
      if (points[i].life <= 0) points.splice(i, 1);
    }

    // Nothing to draw: clear once and stop the loop entirely until the
    // pointer moves again. No idle canvas work between interactions.
    if (points.length === 0) {
      ctx.clearRect(0, 0, vw, vh);
      trailRunning = false;
      return;
    }

    ctx.clearRect(0, 0, vw, vh);
    if (points.length > 1) {
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        const t = i / (points.length - 1);
        const life = Math.min(a.life, b.life);
        const alpha = clamp(life * (0.25 + t * 0.75), 0, 1);
        const width = 1.5 + 26 * t * life;

        // soft halo
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = trailColor(alpha * 0.16);
        ctx.lineWidth = width * 2.2;
        ctx.stroke();

        // core ribbon
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = trailColor(alpha * 0.92);
        ctx.lineWidth = width;
        ctx.stroke();
      }

      const head = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 3.2 * head.life + 1, 0, Math.PI * 2);
      ctx.fillStyle = trailColor(head.life * 0.95);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    requestAnimationFrame(drawTrail);
  }

  function wakeTrail() {
    if (trailRunning) return;
    trailRunning = true;
    lastFrame = performance.now();
    requestAnimationFrame(drawTrail);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
    const last = points[points.length - 1];
    if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 2.5) {
      points.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (points.length > TRAIL_MAX) points.shift();
      wakeTrail();
    }
  }, { passive: true });

  resizeCanvas();

  /* -------------------------------------------------------
     2. Hold left mouse button -> shift the light theme.
  ------------------------------------------------------- */
  const ring = $("#holdRing");
  const ringFill = $(".hold-ring__fill");
  const toast = $("#shiftToast");
  const HOLD_MS = 520;
  const RING_LEN = 226;
  let holding = false, holdStart = 0, holdRaf = 0, toastTimer = 0;
  let themeIndex = 0;

  function toggleTheme() {
    themeIndex = (themeIndex + 1) % 2;
    const glow = themeIndex === 1;
    root.dataset.theme = glow ? "glow" : "ocean";
    animateTexts(glow);
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
    onScroll();
    updateButton();
  }

  function tickHold() {
    if (!holding) return;
    const p = clamp((performance.now() - holdStart) / HOLD_MS);
    ringFill.style.strokeDashoffset = String(RING_LEN - RING_LEN * p);
    if (p >= 1 && !ring.dataset.shifted) {
      ring.dataset.shifted = "1";
      toggleTheme();
    }
    holdRaf = requestAnimationFrame(tickHold);
  }

  function beginHold(e) {
    if (e.button !== 0 || e.pointerType === "touch") return;
    if (e.target instanceof Element && e.target.closest("button, a")) return;
    holding = true;
    document.body.classList.add("is-holding");
    ring.dataset.shifted = "";
    holdStart = performance.now();
    shiftOrigin.x = e.clientX;
    shiftOrigin.y = e.clientY;
    ring.style.left = e.clientX + "px";
    ring.style.top = e.clientY + "px";
    ring.classList.add("is-visible");
    holdRaf = requestAnimationFrame(tickHold);
  }
  function endHold() {
    if (!holding) return;
    holding = false;
    document.body.classList.remove("is-holding");
    cancelAnimationFrame(holdRaf);
    ringFill.style.strokeDashoffset = String(RING_LEN);
    ring.classList.remove("is-visible");
  }

  window.addEventListener("pointerdown", beginHold);
  window.addEventListener("pointerup", endHold);
  window.addEventListener("pointercancel", endHold);
  window.addEventListener("blur", endHold);
  window.addEventListener("pointermove", (e) => {
    if (!holding) return;
    ring.style.left = e.clientX + "px";
    ring.style.top = e.clientY + "px";
  }, { passive: true });

  /* -------------------------------------------------------
     3. Depth: % readout, darkening water, active dot.
  ------------------------------------------------------- */
  const depthValue = $("#depthValue");
  const depthFill = $("#depthFill");
  const sections = [...document.querySelectorAll(".level")];
  const dots = [...document.querySelectorAll(".level-nav a")];
  const TOP_LIGHT = [22, 132, 192], TOP_DARK = [2, 14, 40];
  const MID_LIGHT = [10, 75, 130], MID_DARK = [1, 8, 26];
  const BOT_LIGHT = [5, 46, 92], BOT_DARK = [0, 1, 8];
  let scrollQueued = false;
  let maxScrollValue = 1, lastColorP = -1;
  let sectionTops = [];
  const diveIcon = $("#diveIcon"), diveText = $("#diveText");

  // Layout is read only here (load/resize), never inside the scroll loop.
  function measure() {
    maxScrollValue = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    sectionTops = sections.map((s) => s.offsetTop);
  }
  function maxScroll() { return maxScrollValue; }

  function updateButton() {
    const glow = root.dataset.theme === "glow";
    if (diveRaf) { diveIcon.textContent = "‖"; diveText.textContent = glow ? "PAUSE DRIFT" : "PAUSE DIVE"; }
    else if (window.scrollY < 12) { diveIcon.textContent = "↓"; diveText.textContent = glow ? "DRIFT" : "DIVE"; }
    else { diveIcon.textContent = "↑"; diveText.textContent = glow ? "YOUR OCEAN" : "SURFACE"; }
  }

  function onScroll() {
    const p = clamp(window.scrollY / maxScrollValue);
    depth = p;
    // Quantised color updates avoid a full-screen repaint on every pixel.
    if (lastColorP < 0 || Math.abs(p - lastColorP) > 0.008) {
      lastColorP = p;
      const colorT = Math.pow(p, 0.62); // darken early and visibly
      root.style.setProperty("--depth", p.toFixed(4));
      root.style.setProperty("--bg-top", mixColor(TOP_LIGHT, TOP_DARK, colorT));
      root.style.setProperty("--bg-mid", mixColor(MID_LIGHT, MID_DARK, colorT));
      root.style.setProperty("--bg-bottom", mixColor(BOT_LIGHT, BOT_DARK, colorT));
    }
    const remaining = root.dataset.theme === "glow";
    const shown = remaining ? 100 - Math.round(p * 100) : Math.round(p * 100);
    depthValue.textContent = String(clamp(shown, 0, 100)).padStart(2, "0");
    depthFill.style.transform = `scaleY(${remaining ? 1 - p : p})`;

    const line = window.scrollY + window.innerHeight * 0.45;
    let active = 0;
    for (let i = 0; i < sectionTops.length; i++) {
      if (sectionTops[i] <= line) active = i;
    }
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
    updateButton();
  }

  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
  }
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", () => { resizeCanvas(); measure(); lastColorP = -1; onScroll(); }, { passive: true });
  window.addEventListener("load", () => { measure(); lastColorP = -1; onScroll(); });

  /* -------------------------------------------------------
     4. One button: up if deep, slow auto-dive if at surface.
  ------------------------------------------------------- */
  let diveRaf = 0;

  function cancelDive() {
    root.style.scrollBehavior = "";
    if (!diveRaf) return;
    cancelAnimationFrame(diveRaf);
    diveRaf = 0;
    updateButton();
  }

  function startDive() {
    const from = window.scrollY;
    const to = maxScroll();
    if (to - from < 20) return;
    // Temporarily kill CSS smooth scrolling: per-frame scrollTo() would
    // otherwise restart a smooth animation each frame and barely move.
    root.style.scrollBehavior = "auto";
    const duration = reduceMotion ? 1200 : 17000;
    let start = 0;
    const step = (t) => {
      if (!start) start = t;
      const k = clamp((t - start) / duration);
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * k);
      window.scrollTo(0, from + (to - from) * eased);
      if (k < 1) diveRaf = requestAnimationFrame(step);
      else { diveRaf = 0; root.style.scrollBehavior = ""; updateButton(); }
    };
    diveRaf = requestAnimationFrame(step);
    updateButton();
  }

  $("#diveBtn").addEventListener("click", () => {
    if (diveRaf) { cancelDive(); return; }
    root.style.scrollBehavior = "";
    if (window.scrollY > 12) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    else startDive();
  });
  $("#backTop").addEventListener("click", () => {
    cancelDive();
    root.style.scrollBehavior = "";
    if (root.dataset.theme === "glow") toggleTheme();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  dots.forEach((dot) => dot.addEventListener("click", cancelDive));
  window.addEventListener("wheel", cancelDive, { passive: true });
  window.addEventListener("touchstart", cancelDive, { passive: true });

  /* -------------------------------------------------------
     5. Ambient bubbles + reveal-on-scroll.
  ------------------------------------------------------- */
  const bubbleLayer = $("#bubbles");
  for (let i = 0; i < 18; i++) {
    const b = document.createElement("i");
    const size = 3 + Math.random() * 13;
    b.style.setProperty("--x", (Math.random() * 100).toFixed(2) + "%");
    b.style.setProperty("--s", size.toFixed(1) + "px");
    b.style.setProperty("--d", (13 + Math.random() * 18).toFixed(1) + "s");
    b.style.setProperty("--delay", (-Math.random() * 26).toFixed(1) + "s");
    b.style.setProperty("--drift", ((Math.random() - 0.5) * 140).toFixed(0) + "px");
    bubbleLayer.appendChild(b);
  }

  const reveals = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  measure();
  onScroll();
})();
