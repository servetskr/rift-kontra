/* Rift Kontra · Antrenman — özgün mini oyunlar: Kaçış (yeteneklerden kaçma), Nişan (hızlı tıklama),
 * Son vuruş (zamanlama). Düz canvas + JS, harici kütüphane yok. En iyi skorlar localStorage'da. */
"use strict";
(() => {
  const $ = s => document.querySelector(s);
  const cv = $("#t-cv"), ctx = cv.getContext("2d"), hud = $("#t-hud"), panel = $("#t-panel"), stage = $("#t-stage");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOUCH = matchMedia("(pointer: coarse)").matches;
  const C = { bg:"#0a1018", grid:"#132030", edge:"#22324a", me:"#4cc7bc", meIn:"#15363a", line:"#f09060", hook:"#e0b153",
    circ:"#a29cff", cone:"#f2806f", text:"#e9eef6", muted:"#97a5b9", good:"#5ed294", bad:"#f2806f", gold:"#e0b153", foe:"#c95a4c" };

  /* ---------- Seçenekler ---------- */
  const S = { mode:"dodge", diff:"normal", len:30, left:true };
  try { Object.assign(S, JSON.parse(localStorage.getItem("rk-train-opt") || "{}")); } catch {}
  const saveOpt = () => { try { localStorage.setItem("rk-train-opt", JSON.stringify(S)); } catch {} };
  const BEST_KEY = "rk-train-v1";
  const readBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || "{}"); } catch { return {}; } };
  const writeBest = b => { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch {} };
  const bestKey = (m = S.mode, d = S.diff, l = S.len) => m === "dodge" ? `dodge:${d}` : `${m}:${d}:${l}`;
  const DIFF_TR = { easy:"Kolay", normal:"Normal", hard:"Zor" }, MODE_TR = { dodge:"Kaçış", aim:"Nişan", lh:"Son vuruş" };

  const DD = { // Kaçış
    easy:   { lives:3, spawn:1.25, spd:0.8, tele:1.35, flash:8,  lead:0.0, inv:1.2 },
    normal: { lives:1, spawn:0.9,  spd:1.0, tele:1.0,  flash:12, lead:0.25, inv:0 },
    hard:   { lives:1, spawn:0.65, spd:1.2, tele:0.75, flash:15, lead:0.5, inv:0 } };
  const DA = { // Nişan
    easy:   { r:46, life:1.7,  max:1 },
    normal: { r:36, life:1.25, max:2 },
    hard:   { r:28, life:0.95, max:3 } };
  const DL = { // Son vuruş
    easy:   { wind:0,    drain:1.0, cd:0.5,  mark:2 },
    normal: { wind:0.22, drain:1.25, cd:0.65, mark:1 },
    hard:   { wind:0.32, drain:1.6, cd:0.8,  mark:0 } };

  /* ---------- Alan boyutu ve çizim ölçeği ---------- */
  let W = 1000, H = 625, sc = 1, ox = 0, oy = 0, dpr = 1;
  function pickWorld() { const w = stage.clientWidth; if (w < 560) { W = 700; H = 900; } else { W = 1000; H = 625; } }
  function resize() {
    if (!game) pickWorld();
    const cssW = stage.clientWidth;
    // alan, üst çubuk ve (telefonda) alt gezinme arasında ekrana sığsın
    let cssH = cssW * H / W; const maxH = Math.max(300, innerHeight - (innerWidth <= 760 ? 140 : 90)); if (cssH > maxH) cssH = maxH;
    cv.style.height = cssH + "px";
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    sc = Math.min(cssW / W, cssH / H); ox = (cssW - W * sc) / 2; oy = (cssH - H * sc) / 2;
    draw();
  }
  const toWorld = e => { const r = cv.getBoundingClientRect(); return { x:(e.clientX - r.left - ox) / sc, y:(e.clientY - r.top - oy) / sc }; };
  const clampX = x => Math.max(0, Math.min(W, x)), clampY = y => Math.max(0, Math.min(H, y));
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- Oyun durumu ---------- */
  let game = null, paused = false, raf = 0, lastT = 0, mouse = { x:W / 2, y:H / 2 }, fx = [];

  function newGame() {
    pickWorld(); resize();
    const base = { mode:S.mode, diff:S.diff, len:S.len, t:0, over:false };
    if (S.mode === "dodge") { const d = DD[S.diff];
      return { ...base, p:{ x:W / 2, y:H / 2, r:18, tx:W / 2, ty:H / 2, vx:0, vy:0 }, sk:[], spawnIn:0.9, lives:d.lives, inv:0, dodged:0, flashCd:0, flashes:0 }; }
    if (S.mode === "aim") return { ...base, dur:S.len, tg:[], gap:0, hits:0, misses:0, expired:0, rts:[], score:0 };
    return { ...base, dur:S.len, mn:[], cs:0, early:0, missed:0, cd:0, shots:[], wave:0.4, ad:62, lefts:[] };
  }

  /* ---------- Kaçış ---------- */
  const edgePoint = () => { const s = Math.floor(Math.random() * 4), m = 40;
    return s === 0 ? { x:rnd(0, W), y:-m } : s === 1 ? { x:W + m, y:rnd(0, H) } : s === 2 ? { x:rnd(0, W), y:H + m } : { x:-m, y:rnd(0, H) }; };
  function aimAt(g, from, spd) {
    const d = DD[g.diff], p = g.p, dist = Math.hypot(p.x - from.x, p.y - from.y), lead = d.lead * Math.random() * dist / spd;
    let tx = p.x + p.vx * lead, ty = p.y + p.vy * lead; const a = Math.atan2(ty - from.y, tx - from.x) + rnd(-0.07, 0.07);
    return { dx:Math.cos(a), dy:Math.sin(a) };
  }
  function spawnSkill(g) {
    const d = DD[g.diff], ramp = 1 + g.t / 120, r = Math.random();
    const kind = g.t > 10 && r < 0.15 ? "cone" : g.t > 5 && r < 0.32 ? "hook" : r < 0.6 ? "line" : "circle";
    if (kind === "line" || kind === "hook") {
      const o = edgePoint(), hook = kind === "hook";
      const spd = (hook ? 1500 : rnd(620, 1050)) * d.spd * ramp, dir = aimAt(g, o, spd);
      g.sk.push({ k:kind, x:o.x, y:o.y, dx:dir.dx, dy:dir.dy, w:hook ? 10 : rnd(16, 30), spd, tele:(hook ? 0.5 : rnd(0.38, 0.55)) * d.tele, age:0, pos:0, len:Math.hypot(W, H) + 200 });
    } else if (kind === "circle") {
      const p = g.p, lead = d.lead + 0.15;
      g.sk.push({ k:"circle", x:clampX(p.x + p.vx * lead * Math.random()), y:clampY(p.y + p.vy * lead * Math.random()), r:rnd(70, 115), tele:rnd(0.85, 1.2) * d.tele / Math.min(1.4, ramp), age:0, done:false });
    } else {
      const p = g.p, a0 = Math.random() * Math.PI * 2, dist = rnd(260, 360);
      const x = clampX(p.x + Math.cos(a0) * dist), y = clampY(p.y + Math.sin(a0) * dist);
      g.sk.push({ k:"cone", x, y, a:Math.atan2(p.y - y, p.x - x), half:rnd(0.38, 0.5), len:470, tele:0.7 * d.tele, age:0, done:false });
    }
  }
  const segDist = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy; let t = l ? ((px - ax) * vx + (py - ay) * vy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - vx * t, py - ay - vy * t); };
  function hitPlayer(g) {
    if (g.inv > 0) return;
    g.lives--; burst(g.p.x, g.p.y, C.bad);
    if (g.lives <= 0) { endGame(); return; }
    g.inv = DD[g.diff].inv || 1;
  }
  function stepDodge(g, dt) {
    const d = DD[g.diff], p = g.p, sp = 330;
    const dx = p.tx - p.x, dy = p.ty - p.y, dist = Math.hypot(dx, dy);
    if (dist > 1) { const m = Math.min(dist, sp * dt); p.vx = dx / dist * sp; p.vy = dy / dist * sp; p.x += dx / dist * m; p.y += dy / dist * m; } else { p.vx = p.vy = 0; }
    g.inv = Math.max(0, g.inv - dt); g.flashCd = Math.max(0, g.flashCd - dt);
    g.spawnIn -= dt;
    if (g.spawnIn <= 0) { spawnSkill(g); g.spawnIn = Math.max(0.22, d.spawn / (1 + g.t / 40)) * rnd(0.8, 1.2); }
    for (const s of g.sk) {
      s.age += dt;
      if (s.k === "line" || s.k === "hook") {
        if (s.age < s.tele) continue;
        s.pos += s.spd * dt;
        const hx = s.x + s.dx * s.pos, hy = s.y + s.dy * s.pos, tl = Math.max(0, s.pos - s.w * 2.5);
        if (!s.hit && segDist(p.x, p.y, s.x + s.dx * tl, s.y + s.dy * tl, hx, hy) < s.w / 2 + p.r) { s.hit = true; hitPlayer(g); if (g.over) return; }
        if (s.pos > s.len) { s.gone = true; if (!s.hit) g.dodged++; }
      } else if (!s.done && s.age >= s.tele) {
        s.done = true; s.fade = 0.25;
        let hit = false;
        if (s.k === "circle") hit = Math.hypot(p.x - s.x, p.y - s.y) < s.r + p.r * 0.6;
        else { const dd = Math.hypot(p.x - s.x, p.y - s.y); let da = Math.abs(Math.atan2(p.y - s.y, p.x - s.x) - s.a); if (da > Math.PI) da = 2 * Math.PI - da;
          hit = dd <= s.len + p.r && (dd < p.r || da <= s.half + Math.asin(Math.min(1, p.r / dd))); }
        if (hit) { hitPlayer(g); if (g.over) return; } else g.dodged++;
      } else if (s.done) { s.fade -= dt; if (s.fade <= 0) s.gone = true; }
    }
    g.sk = g.sk.filter(s => !s.gone);
  }
  function doFlash() {
    const g = game; if (!g || g.mode !== "dodge" || paused || g.over || g.flashCd > 0) return;
    const p = g.p, tx = TOUCH ? p.tx : mouse.x, ty = TOUCH ? p.ty : mouse.y, dx = tx - p.x, dy = ty - p.y, dd = Math.hypot(dx, dy) || 1, m = Math.min(150, dd);
    burst(p.x, p.y, C.gold); p.x = clampX(p.x + dx / dd * m); p.y = clampY(p.y + dy / dd * m); burst(p.x, p.y, C.gold);
    if (Math.hypot(p.tx - p.x, p.ty - p.y) < 30) { p.tx = p.x; p.ty = p.y; }
    g.flashCd = DD[g.diff].flash; g.flashes++;
  }

  /* ---------- Nişan ---------- */
  function stepAim(g, dt) {
    const d = DA[g.diff];
    for (const t of g.tg) t.age += dt;
    g.tg = g.tg.filter(t => { if (t.age >= d.life) { g.expired++; return false; } return true; });
    g.gap -= dt;
    if (g.tg.length < d.max && g.gap <= 0) {
      const m = d.r + 14; let x, y, k = 0;
      do { x = rnd(m, W - m); y = rnd(m + 40, H - m); k++; } while (k < 20 && g.tg.some(t => Math.hypot(t.x - x, t.y - y) < d.r * 2.6));
      g.tg.push({ x, y, age:0 }); g.gap = 0.22;
    }
    if (g.t >= g.dur) endGame();
  }
  const tgR = (g, t) => DA[g.diff].r * Math.max(0, 1 - t.age / DA[g.diff].life) ** 0.7;
  function clickAim(g, w, touch) {
    const tol = touch ? 12 : 3; let best = null, bd = 1e9;
    for (const t of g.tg) { const dd = Math.hypot(w.x - t.x, w.y - t.y); if (dd <= tgR(g, t) + tol && dd < bd) { bd = dd; best = t; } }
    if (!best) { g.misses++; ring(w.x, w.y, C.bad, 10); return; }
    const life = DA[g.diff].life; g.hits++; g.rts.push(best.age); g.score += 10 + Math.round(10 * (1 - best.age / life));
    ring(best.x, best.y, C.good, tgR(g, best) + 6); g.tg = g.tg.filter(t => t !== best);
  }

  /* ---------- Son vuruş ---------- */
  function spawnWave(g) {
    const n = 4, y = H * 0.38, gapX = W / (n + 1);
    for (let i = 0; i < n; i++) g.mn.push({ x:gapX * (i + 1) + rnd(-20, 20), y:y + rnd(-30, 30) + (i % 2) * 40, hp:420, max:420, next:rnd(0.3, 1.1), alive:true, hitBy:false });
  }
  function stepLH(g, dt) {
    const d = DL[g.diff];
    g.cd = Math.max(0, g.cd - dt); g.wave -= dt;
    if (g.wave <= 0) { spawnWave(g); g.wave = 8.5; }
    for (const m of g.mn) {
      if (!m.alive) continue;
      m.next -= dt * d.drain;
      if (m.next <= 0) { m.hp -= rnd(22, 70); m.next = rnd(0.35, 0.95); if (m.hp <= 0) { m.alive = false; g.missed++; ring(m.x, m.y, C.muted, 22); } }
    }
    for (const s of g.shots) {
      s.age += dt;
      if (!s.done && s.age >= s.wind) {
        s.done = true; const m = s.m;
        if (!m.alive) continue; // vuruş inmeden öldü (kaçırılan zaten sayıldı)
        if (m.hp <= g.ad) { g.lefts.push(m.hp / g.ad); m.alive = false; g.cs++; ring(m.x, m.y, C.gold, 26); }
        else { m.hp -= g.ad; g.early++; ring(m.x, m.y, C.bad, 18); }
      }
    }
    g.shots = g.shots.filter(s => !s.done || s.age < s.wind + 0.15);
    g.mn = g.mn.filter(m => m.alive);
    if (g.t >= g.dur) endGame();
  }
  function clickLH(g, w, touch) {
    if (g.cd > 0) return;
    const tol = touch ? 16 : 6; const m = g.mn.find(m => m.alive && Math.abs(w.x - m.x) <= 34 + tol && w.y >= m.y - 48 - tol && w.y <= m.y + 30 + tol);
    if (!m) return;
    const d = DL[g.diff]; g.cd = d.cd; g.shots.push({ m, wind:d.wind, age:0, done:false, fx:W / 2, fy:H * 0.86 });
  }

  /* ---------- Efektler ---------- */
  function burst(x, y, col) { if (!RM) fx.push({ k:"burst", x, y, col, age:0, life:0.35 }); }
  function ring(x, y, col, r) { fx.push({ k:"ring", x, y, col, r, age:0, life:RM ? 0.18 : 0.35 }); }

  /* ---------- Döngü ---------- */
  function loop(ts) {
    raf = 0; if (!game || paused || game.over) { draw(); return; }
    const dt = Math.min(0.05, (ts - lastT) / 1000 || 0); lastT = ts;
    step(dt); draw(); updHud();
    if (game && !game.over && !paused) raf = requestAnimationFrame(loop);
  }
  function step(dt) {
    const g = game; if (!g || g.over) return;
    g.t += dt;
    if (g.mode === "dodge") stepDodge(g, dt); else if (g.mode === "aim") stepAim(g, dt); else stepLH(g, dt);
    for (const f of fx) f.age += dt; fx = fx.filter(f => f.age < f.life);
  }
  const startLoop = () => { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); } };

  /* ---------- Çizim ---------- */
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    // alan
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1 / sc; ctx.beginPath();
    for (let x = 0; x <= W; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += 50) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke(); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.strokeRect(0, 0, W, H);
    const g = game; if (!g) return;
    if (g.mode === "dodge") drawDodge(g); else if (g.mode === "aim") drawAim(g); else drawLH(g);
    for (const f of fx) { const k = f.age / f.life; ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.k === "burst" ? 10 + 40 * k : f.r * (1 + 0.4 * k), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  function drawDodge(g) {
    for (const s of g.sk) {
      if (s.k === "line" || s.k === "hook") {
        const col = s.k === "hook" ? C.hook : C.line, ex = s.x + s.dx * s.len, ey = s.y + s.dy * s.len;
        if (s.age < s.tele) { // uyarı: yolu göster
          ctx.globalAlpha = 0.18 + 0.25 * (s.age / s.tele); ctx.strokeStyle = col; ctx.lineWidth = s.w; ctx.lineCap = "butt";
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.globalAlpha = 1; continue; }
        const hx = s.x + s.dx * s.pos, hy = s.y + s.dy * s.pos, tl = Math.max(0, s.pos - s.w * 2.5);
        ctx.globalAlpha = 0.12; ctx.strokeStyle = col; ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(s.x + s.dx * s.pos, s.y + s.dy * s.pos); ctx.lineTo(ex, ey); ctx.stroke(); ctx.globalAlpha = 1;
        if (s.k === "hook") { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(hx, hy); ctx.stroke(); ctx.setLineDash([]); }
        ctx.strokeStyle = col; ctx.lineWidth = s.w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(s.x + s.dx * tl, s.y + s.dy * tl); ctx.lineTo(hx, hy); ctx.stroke(); ctx.lineCap = "butt";
      } else if (s.k === "circle") {
        const k = Math.min(1, s.age / s.tele);
        ctx.fillStyle = C.circ; ctx.globalAlpha = s.done ? Math.max(0, s.fade / 0.25) * 0.6 : 0.12; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = C.circ; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
        if (!s.done) { ctx.globalAlpha = 0.35; ctx.fillStyle = C.circ; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * k, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      } else {
        const k = Math.min(1, s.age / s.tele);
        ctx.fillStyle = C.cone; ctx.globalAlpha = s.done ? Math.max(0, s.fade / 0.25) * 0.6 : 0.1 + 0.2 * k;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.arc(s.x, s.y, s.done ? s.len : s.len * (0.3 + 0.7 * k), s.a - s.half, s.a + s.half); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = C.cone; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.arc(s.x, s.y, s.len, s.a - s.half, s.a + s.half); ctx.closePath(); ctx.stroke();
      }
    }
    const p = g.p;
    if (Math.hypot(p.tx - p.x, p.ty - p.y) > 4) { ctx.strokeStyle = C.good; ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.tx, p.ty, 8, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.globalAlpha = g.inv > 0 && Math.floor(g.t * 12) % 2 ? 0.45 : 1;
    ctx.fillStyle = C.meIn; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.me; ctx.lineWidth = 3; ctx.stroke();
    const a = Math.atan2(p.vy, p.vx); if (p.vx || p.vy) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a) * p.r, p.y + Math.sin(a) * p.r); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  function drawAim(g) {
    for (const t of g.tg) { const r = tgR(g, t);
      ctx.fillStyle = "rgba(224,177,83,.18)"; ctx.beginPath(); ctx.arc(t.x, t.y, DA[g.diff].r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(t.x, t.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(t.x, t.y, Math.max(0, r * 0.35), 0, Math.PI * 2); ctx.fill(); }
  }
  function drawLH(g) {
    const d = DL[g.diff], cx = W / 2, cy = H * 0.86;
    for (const m of g.mn) {
      ctx.fillStyle = C.foe; ctx.beginPath(); ctx.arc(m.x, m.y, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#3a1712"; ctx.lineWidth = 2; ctx.stroke();
      const bw = 68, bh = 9, bx = m.x - bw / 2, by = m.y - 44, k = Math.max(0, m.hp / m.max), low = m.hp <= g.ad;
      ctx.fillStyle = "#1a2535"; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = low && d.mark >= 2 ? C.gold : C.bad; ctx.fillRect(bx, by, bw * k, bh);
      if (d.mark >= 1) { const tx = bx + bw * (g.ad / m.max); ctx.fillStyle = C.text; ctx.fillRect(tx - 1, by - 3, 2, bh + 6); }
      ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    }
    for (const s of g.shots) { if (s.done) continue; const k = s.wind ? s.age / s.wind : 1;
      ctx.fillStyle = C.me; ctx.beginPath(); ctx.arc(s.fx + (s.m.x - s.fx) * k, s.fy + (s.m.y - s.fy) * k, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.meIn; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.me; ctx.lineWidth = 3; ctx.stroke();
    if (g.cd > 0) { ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - g.cd / d.cd)); ctx.stroke(); }
    ctx.fillStyle = C.muted; ctx.font = "16px 'IBM Plex Sans',sans-serif"; ctx.textAlign = "center"; ctx.fillText(`Saldırı gücü: ${g.ad}`, cx, cy + 52);
  }

  /* ---------- Gösterge ve paneller ---------- */
  const f1 = v => v.toFixed(1).replace(".", ","), f2 = v => v.toFixed(2).replace(".", ",");
  function updHud() {
    const g = game; if (!g) { hud.innerHTML = ""; return; }
    let h = `<span class="h">${MODE_TR[g.mode]} · ${DIFF_TR[g.diff]}</span>`;
    if (g.mode === "dodge") h += `<span class="h">Süre <b>${f1(g.t)} sn</b></span><span class="h">Kaçılan <b>${g.dodged}</b></span>${DD[g.diff].lives > 1 ? `<span class="h">Can <b>${"♥".repeat(Math.max(0, g.lives))}</b></span>` : ""}<span class="h ${g.flashCd > 0 ? "cd" : "ok"}">Sıçra <b>${g.flashCd > 0 ? Math.ceil(g.flashCd) + " sn" : "hazır"}</b></span>`;
    else if (g.mode === "aim") h += `<span class="h">Kalan <b>${Math.max(0, Math.ceil(g.dur - g.t))} sn</b></span><span class="h">Skor <b>${g.score}</b></span><span class="h">İsabet <b>${g.hits}</b></span>`;
    else h += `<span class="h">Kalan <b>${Math.max(0, Math.ceil(g.dur - g.t))} sn</b></span><span class="h">Son vuruş <b>${g.cs}</b></span><span class="h">Kaçan <b>${g.missed}</b></span>`;
    hud.innerHTML = h;
    if (TOUCH && g.mode === "dodge") { const b = $("#t-flash"); b.disabled = g.flashCd > 0; b.textContent = g.flashCd > 0 ? `Sıçra ${Math.ceil(g.flashCd)}` : "Sıçra"; }
  }
  const HOW = {
    dodge: () => `<ul class="howto">
      <li>${TOUCH ? "Gitmek istediğin yere <b>dokun ya da sürükle</b>." : "<b>Sağ tıkla</b> yürü (oyundaki gibi); basılı tutup sürükleyebilirsin." + (S.left ? " Sol tık da yürütür." : "")}</li>
      <li>Kenarlardan gelen yetenekler önce <b>uyarı</b> olarak çizilir, sonra ateşlenir: düz atış (turuncu), hızlı ince kanca (sarı), gecikmeli alan (mor), koni süpürme (kırmızı).</li>
      <li>${TOUCH ? "<b>Sıçra</b> düğmesi" : "<kbd>F</kbd> ya da <kbd>D</kbd>"}: imlece doğru kısa ışınlanma (bekleme süreli).</li>
      <li>Skor hayatta kaldığın süredir; zaman geçtikçe yetenekler sıklaşır ve hızlanır. Kolay'da 3 can, diğerlerinde tek vuruşta biter.</li>
      <li><kbd>Esc</kbd> duraklatır.</li></ul>`,
    aim: () => `<ul class="howto">
      <li>Altın hedefler belirir ve <b>küçülerek</b> kaybolur; ${TOUCH ? "dokunarak" : "sol tıkla"} vur.</li>
      <li>Ne kadar erken vurursan o kadar puan (10–20). Boşa tıklama isabet oranını düşürür.</li>
      <li>Sonuçta: tepki süresi, isabet oranı ve dakikada vuruş.</li>
      <li>Zorluk arttıkça hedefler küçülür, daha hızlı kaybolur ve aynı anda daha çok çıkar.</li></ul>`,
    lh: () => `<ul class="howto">
      <li>Minyonların canı müttefik vuruşlarıyla parça parça azalır. Canı <b>saldırı gücünün</b> altına indiğinde ${TOUCH ? "dokun" : "tıkla"}: son vuruş senin olur.</li>
      <li>Erken vurursan minyon ölmez ve saldırın bekleme süresine girer; geç kalırsan minyon kaçar.</li>
      <li>Normal ve Zor'da saldırın <b>gecikmeyle</b> iner: canın ne kadar düşeceğini önceden kestir.</li>
      <li>Kolay'da vurulabilir can sarı olur; Normal'da yalnızca çizgi işareti var; Zor'da işaret yok.</li></ul>` };
  function renderSide() {
    $("#t-how").innerHTML = HOW[S.mode]();
    const B = readBest(), rows = [];
    for (const d of ["easy", "normal", "hard"]) {
      if (S.mode === "dodge") rows.push([DIFF_TR[d], B[bestKey("dodge", d)] != null ? f2(B[bestKey("dodge", d)]) + " sn" : "–"]);
      else for (const l of [30, 60]) { const v = B[bestKey(S.mode, d, l)]; rows.push([`${DIFF_TR[d]} · ${l} sn`, v != null ? (S.mode === "aim" ? v + " puan" : v + " son vuruş") : "–"]); }
    }
    $("#t-best").innerHTML = `<table class="tbest"><thead><tr><th>${MODE_TR[S.mode]}</th><th>En iyi</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="v">${r[1]}</td></tr>`).join("")}</tbody></table>`;
    $("#t-lenrow").hidden = S.mode === "dodge"; $("#t-walkrow").hidden = S.mode !== "dodge" || TOUCH;
    [["#t-mode", S.mode], ["#t-diff", S.diff], ["#t-len", String(S.len)]].forEach(([id, v]) => [...$(id).children].forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v)));
    $("#t-left").checked = S.left;
  }
  function bestTxt() { const v = readBest()[bestKey()]; if (v == null) return "Henüz skor yok."; return `En iyi: <b>${S.mode === "dodge" ? f2(v) + " sn" : S.mode === "aim" ? v + " puan" : v + " son vuruş"}</b>`; }
  function showStart() {
    panel.hidden = false; $("#t-touch").hidden = true;
    panel.innerHTML = `<div class="t-box"><h2>${MODE_TR[S.mode]} · ${DIFF_TR[S.diff]}${S.mode !== "dodge" ? ` · ${S.len} sn` : ""}</h2>
      <p>${S.mode === "dodge" ? "Uyarıları izle, yeteneklerin dışına çık. Ne kadar uzun dayanırsan skor o kadar yüksek." : S.mode === "aim" ? "Küçülen hedefleri kaybolmadan vur." : "Minyonun canı saldırı gücünün altına inince vur."}</p>
      <p>${bestTxt()}</p>
      <div class="btns"><button type="button" class="btn gold" data-act="start">Başla</button></div>
      <p class="small">${TOUCH ? "" : "<kbd>Boşluk</kbd> ile de başlar · <kbd>Esc</kbd> duraklatır"}</p></div>`;
  }
  function showPause() {
    panel.hidden = false;
    panel.innerHTML = `<div class="t-box"><h2>Duraklatıldı</h2><div class="btns"><button type="button" class="btn gold" data-act="resume">Devam et</button><button type="button" class="btn" data-act="start">Baştan başla</button><button type="button" class="btn" data-act="menu">Çık</button></div></div>`;
    panel.querySelector("[data-act=resume]").focus();
  }
  function endGame() {
    const g = game; if (!g || g.over) return; g.over = true;
    const B = readBest(), k = bestKey(g.mode, g.diff, g.len); let val, stats;
    if (g.mode === "dodge") { val = +g.t.toFixed(2);
      stats = [["Hayatta kalma", f2(g.t) + " sn"], ["Kaçılan yetenek", g.dodged], ["Sıçra kullanımı", g.flashes]]; }
    else if (g.mode === "aim") { val = g.score; const shots = g.hits + g.misses, rt = g.rts.length ? g.rts.reduce((a, b) => a + b, 0) / g.rts.length : 0;
      stats = [["Skor", g.score], ["İsabet", g.hits], ["İsabet oranı", shots ? "%" + Math.round(g.hits / shots * 100) : "–"], ["Ort. tepki", rt ? Math.round(rt * 1000) + " ms" : "–"], ["Dakikada vuruş", Math.round(g.hits / (g.dur / 60))], ["Kaçan hedef", g.expired]]; }
    else { val = g.cs; const tot = g.cs + g.missed, left = g.lefts.length ? g.lefts.reduce((a, b) => a + b, 0) / g.lefts.length : null;
      stats = [["Son vuruş", `${g.cs} / ${tot}`], ["Oran", tot ? "%" + Math.round(g.cs / tot * 100) : "–"], ["Erken vuruş", g.early], ["Kaçan minyon", g.missed], ["Ort. kalan can", left != null ? "%" + Math.round(left * 100) + " SG" : "–"]]; }
    const rec = B[k] == null || val > B[k]; if (rec && val > 0) { B[k] = val; writeBest(B); }
    panel.hidden = false; $("#t-touch").hidden = true; cancelAnimationFrame(raf); raf = 0; draw(); updHud();
    panel.innerHTML = `<div class="t-box"><h2>${g.mode === "dodge" ? "Vuruldun" : "Süre doldu"}</h2>${rec && val > 0 ? '<p class="t-new">Yeni rekor!</p>' : `<p>${bestTxt()}</p>`}
      <div class="t-stats">${stats.map(([l, v]) => `<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>
      ${g.mode === "lh" ? '<p class="small">Ort. kalan can: son vuruşu yaptığında minyonda kalan canın saldırı gücüne oranı. Düşük = son ana kadar bekledin.</p>' : ""}
      <div class="btns"><button type="button" class="btn gold" data-act="start">Tekrar</button><button type="button" class="btn" data-act="menu">Menü</button></div></div>`;
    panel.querySelector("[data-act=start]").focus();
    renderSide();
  }
  function start() {
    cancelAnimationFrame(raf); raf = 0; fx = []; paused = false;
    game = newGame(); mouse = { x:W / 2, y:H / 2 };
    panel.hidden = true; $("#t-touch").hidden = !TOUCH; $("#t-flash").hidden = S.mode !== "dodge";
    updHud(); draw(); cv.focus({ preventScroll:true });
    const hb = document.querySelector("header.bar"), top = stage.getBoundingClientRect().top + scrollY - (hb ? hb.offsetHeight : 0) - 8;
    if (Math.abs(scrollY - top) > 4) scrollTo({ top, behavior:RM ? "auto" : "smooth" });
    startLoop();
  }
  function pause(on) {
    if (!game || game.over) return; paused = on;
    if (on) { cancelAnimationFrame(raf); raf = 0; showPause(); } else { panel.hidden = true; startLoop(); }
  }
  function menu() { cancelAnimationFrame(raf); raf = 0; game = null; paused = false; fx = []; resize(); updHud(); showStart(); }

  /* ---------- Giriş ---------- */
  cv.tabIndex = 0;
  cv.addEventListener("contextmenu", e => e.preventDefault());
  let dragBtn = 0;
  cv.addEventListener("pointerdown", e => {
    const g = game; if (!g || paused || g.over) return;
    const w = toWorld(e); mouse = w; const touch = e.pointerType !== "mouse";
    if (g.mode === "dodge") {
      if (touch || e.button === 2 || (e.button === 0 && S.left)) { g.p.tx = clampX(w.x); g.p.ty = clampY(w.y); dragBtn = touch ? 1 : e.button === 2 ? 2 : 1; ring(w.x, w.y, C.good, 8); try { cv.setPointerCapture(e.pointerId); } catch {} }
    } else if (e.button === 0 || touch) { g.mode === "aim" ? clickAim(g, w, touch) : clickLH(g, w, touch); }
    e.preventDefault();
  });
  cv.addEventListener("pointermove", e => {
    const w = toWorld(e); mouse = w; const g = game;
    if (g && g.mode === "dodge" && !paused && !g.over && dragBtn && (e.pointerType !== "mouse" || e.buttons & (dragBtn === 2 ? 2 : 1))) { g.p.tx = clampX(w.x); g.p.ty = clampY(w.y); }
  });
  const endDrag = () => { dragBtn = 0; };
  cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);
  addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea") return;
    if (e.key === "Escape") { if (game && !game.over) { pause(!paused); e.preventDefault(); } return; }
    if ((e.key === "f" || e.key === "F" || e.key === "d" || e.key === "D") && game && game.mode === "dodge") { doFlash(); e.preventDefault(); return; }
    if (e.key === " " && !panel.hidden && tag !== "button") { e.preventDefault(); if (paused) pause(false); else start(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && game && !game.over && !paused) pause(true); });
  panel.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b) return;
    const a = b.dataset.act; if (a === "start") start(); else if (a === "resume") pause(false); else menu(); });
  $("#t-flash").addEventListener("click", doFlash);
  $("#t-pause").addEventListener("click", () => pause(true));
  const segPick = (id, key, conv = v => v) => $(id).addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (!b) return;
    S[key] = conv(b.dataset.v); saveOpt(); renderSide(); menu(); });
  segPick("#t-mode", "mode"); segPick("#t-diff", "diff"); segPick("#t-len", "len", v => +v);
  $("#t-left").addEventListener("change", e => { S.left = e.target.checked; saveOpt(); renderSide(); });
  $("#t-reset").addEventListener("click", () => { if (confirm("Bu cihazdaki tüm antrenman skorları silinsin mi?")) { writeBest({}); renderSide(); if (!game) showStart(); } });
  addEventListener("resize", () => resize());

  // Tarayıcı testleri için küçük kanca (oyunu değiştirmez)
  window.RKTrain = { start, step:(dt) => { step(dt); draw(); updHud(); }, state:() => game, end:endGame, opt:S, flash:doFlash, menu };

  renderSide(); resize(); showStart();
})();
