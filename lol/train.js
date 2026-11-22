/* Rift Kontra · Antrenman — koridorda geçen özgün mini oyunlar:
 *  Kaçış     : kenarlardaki rakip şampiyonların attığı yeteneklerden kaç (sağ tık yürü, D Hayalet, F Sıçra)
 *  Nişan     : Q "Sihirli Ok" (düz atış) ve W "Yıldız Yağmuru" (gecikmeli alan) ile hareket eden rakiplere isabet ettir
 *  Son vuruş : dalga dalga gelen minyonlara son vuruşu yap
 * Arazi ve birimler canvas'ta özgün çizimdir; oyuncu jetonu sitedeki şampiyon portresidir (Data Dragon).
 * Harici kütüphane yok. En iyi skorlar localStorage'da. */
"use strict";
(() => {
  const $ = s => document.querySelector(s);
  const cv = $("#t-cv"), ctx = cv.getContext("2d"), hud = $("#t-hud"), panel = $("#t-panel"), stage = $("#t-stage"), touchBar = $("#t-touch");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOUCH = matchMedia("(pointer: coarse)").matches;
  const CH = window.LOL_CHAMPS || {};
  const C = { me:"#4aa8ff", meDark:"#123050", foe:"#e5534b", foeDark:"#4a1512", text:"#f2f5fa", muted:"#a9b4c4", good:"#5ed294", bad:"#f2806f",
    gold:"#f0c060", tele:"rgba(229,83,75,.22)", teleEdge:"rgba(255,120,110,.85)", hpMe:"#4fd06c", hpFoe:"#e5534b", hpBg:"#0b0f14" };

  /* ---------- Seçenekler ve skorlar ---------- */
  const S = { mode:"dodge", diff:"normal", len:30, left:true, champ:"ezreal" };
  try { Object.assign(S, JSON.parse(localStorage.getItem("rk-train-opt") || "{}")); } catch {}
  if (!CH[S.champ]) S.champ = CH.ezreal ? "ezreal" : Object.keys(CH)[0] || "ezreal";
  const saveOpt = () => { try { localStorage.setItem("rk-train-opt", JSON.stringify(S)); } catch {} };
  const BEST_KEY = "rk-train-v1";
  const readBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || "{}"); } catch { return {}; } };
  const writeBest = b => { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch {} };
  const bestKey = (m = S.mode, d = S.diff, l = S.len) => m === "dodge" ? `dodge:${d}` : m === "aim" ? `aim2:${d}:${l}` : `lh2:${d}:${l}`;
  const DIFF_TR = { easy:"Kolay", normal:"Normal", hard:"Zor" }, MODE_TR = { dodge:"Kaçış", aim:"Nişan", lh:"Son vuruş" };
  const cName = slug => (CH[slug] && CH[slug].n) || slug;

  const DD = { // Kaçış: tüm yetenek türleri baştan; Kolay/Normal'da daha seyrek ve yavaş
    easy:   { lives:3, spawn:1.5,  spd:0.75, tele:1.35, flash:8,  ghost:16, lead:0.0,  inv:1.2, foes:3 },
    normal: { lives:1, spawn:1.05, spd:0.92, tele:1.1,  flash:12, ghost:20, lead:0.25, inv:0,   foes:4 },
    hard:   { lives:1, spawn:0.65, spd:1.2,  tele:0.75, flash:15, ghost:24, lead:0.5,  inv:0,   foes:4 } };
  const DA = { // Nişan
    easy:   { foes:2, spd:110, juke:0.12, react:0.38, minions:2, qcd:0.8 },
    normal: { foes:3, spd:165, juke:0.4,  react:0.26, minions:4, qcd:0.95 },
    hard:   { foes:3, spd:215, juke:0.65, react:0.16, minions:5, qcd:1.1 } };
  const DL = { // Son vuruş
    easy:   { wind:0.05, cd:0.55, mark:2, gap:[1.0, 2.5], turret:false },
    normal: { wind:0.22, cd:0.7,  mark:1, gap:[0.8, 2.2], turret:false },
    hard:   { wind:0.32, cd:0.85, mark:0, gap:[0.6, 1.8], turret:true } };

  /* ---------- Alan, ölçek ---------- */
  let W = 1000, H = 625, sc = 1, ox = 0, oy = 0, dpr = 1, cssW = 0, cssH = 0;
  function pickWorld() { const w = stage.clientWidth; if (w < 560) { W = 700; H = 900; } else { W = 1000; H = 625; } }
  function resize() {
    if (!game) pickWorld();
    cssW = stage.clientWidth;
    cssH = cssW * H / W; const maxH = Math.max(300, innerHeight - (innerWidth <= 760 ? 140 : 90)); if (cssH > maxH) cssH = maxH;
    cv.style.height = cssH + "px";
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    sc = Math.min(cssW / W, cssH / H); ox = (cssW - W * sc) / 2; oy = (cssH - H * sc) / 2;
    terrain = null; tokCache.clear(); draw();
  }
  const toWorld = e => { const r = cv.getBoundingClientRect(); return { x:(e.clientX - r.left - ox) / sc, y:(e.clientY - r.top - oy) / sc }; };
  const clampX = (x, m = 0) => Math.max(m, Math.min(W - m, x)), clampY = (y, m = 0) => Math.max(m, Math.min(H - m, y));
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  /* ---------- Arazi: çim, taş patika, çalı, nehir kenarı (tohumlu, bir kez çizilir) ---------- */
  let terrain = null;
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function laneY(x) { return H * (W > H ? 0.5 : 0.5) + Math.sin(x / W * Math.PI * 1.2 + 0.4) * H * 0.06; }
  function buildTerrain() {
    const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height; const g = c.getContext("2d"), R = mulberry(W * 7 + H);
    g.fillStyle = "#0b1410"; g.fillRect(0, 0, c.width, c.height);
    g.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    // çim
    const grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, "#2a4527"); grd.addColorStop(1, "#33522c"); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { g.fillStyle = R() < 0.5 ? "rgba(20,40,18,.25)" : "rgba(80,120,60,.12)"; g.beginPath(); g.ellipse(R() * W, R() * H, 30 + R() * 90, 20 + R() * 60, R() * 3, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 1;
    for (let i = 0; i < (W * H) / 900; i++) { const x = R() * W, y = R() * H; g.strokeStyle = R() < 0.5 ? "rgba(120,170,90,.22)" : "rgba(14,34,14,.28)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + R() * 2 - 1, y - 2 - R() * 2.5); g.stroke(); }
    for (let i = 0; i < (W * H) / 1400; i++) { g.fillStyle = R() < 0.5 ? "rgba(140,190,100,.18)" : "rgba(16,36,14,.22)"; g.fillRect(R() * W, R() * H, 2, 2); }
    // nehir kenarı (sağ alt köşe)
    const rv = g.createRadialGradient(W, H, 0, W, H, Math.min(W, H) * 0.42);
    rv.addColorStop(0, "#21546b"); rv.addColorStop(0.75, "#2c6a82"); rv.addColorStop(0.86, "#5b7f63"); rv.addColorStop(1, "rgba(51,82,44,0)");
    g.fillStyle = rv; g.beginPath(); g.arc(W, H, Math.min(W, H) * 0.42, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(190,230,240,.25)"; g.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const r0 = Math.min(W, H) * (0.12 + R() * 0.22); g.beginPath(); g.arc(W, H, r0, Math.PI * (1.05 + R() * 0.1), Math.PI * (1.3 + R() * 0.15)); g.stroke(); }
    // taş patika (koridor)
    const pathPts = []; for (let x = -40; x <= W + 40; x += 20) pathPts.push([x, laneY(x)]);
    const band = (w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pathPts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
    band(H * 0.3, "#5d5643"); band(H * 0.27, "#7b715a"); band(H * 0.2, "#8c816a");
    for (let i = 0; i < W * 1.4; i++) { const x = R() * W, y = laneY(x) + (R() - 0.5) * H * 0.26; g.fillStyle = R() < 0.5 ? "rgba(160,150,128,.55)" : "rgba(70,64,50,.45)"; g.beginPath(); g.ellipse(x, y, 2 + R() * 6, 1.5 + R() * 4, R() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 26; i++) { const x = R() * W, y = laneY(x) + (R() - 0.5) * H * 0.2; g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(x + 3, y + 4, 14, 8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#9b927d"; g.beginPath(); g.ellipse(x, y, 13, 8, R(), 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(60,55,45,.6)"; g.lineWidth = 1; g.stroke(); }
    // çalılar
    const bushes = [[W * 0.18, H * 0.18], [W * 0.78, H * 0.16], [W * 0.3, H * 0.84], [W * 0.62, H * 0.8]];
    for (const [bx, by] of bushes) {
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(bx + 8, by + 12, 95, 42, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 26; i++) { const x = bx + (R() - 0.5) * 170, y = by + (R() - 0.5) * 60; g.fillStyle = R() < 0.5 ? "#1d3d1f" : "#244a25"; g.beginPath(); g.arc(x, y, 14 + R() * 16, 0, Math.PI * 2); g.fill(); }
      for (let i = 0; i < 60; i++) { const x = bx + (R() - 0.5) * 160, y = by + (R() - 0.5) * 55; g.fillStyle = R() < 0.5 ? "rgba(110,170,80,.28)" : "rgba(10,28,12,.35)"; g.beginPath(); g.ellipse(x, y, 3 + R() * 3, 1.5 + R() * 1.5, R() * 3, 0, Math.PI * 2); g.fill(); }
    }
    // kenar gölgesi
    const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.35)");
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    terrain = c;
  }

  /* ---------- Şampiyon jetonları (portre, takım halkası) ---------- */
  const imgs = new Map(), tokCache = new Map();
  function champImg(slug) {
    if (imgs.has(slug)) return imgs.get(slug);
    const im = new Image(); im.src = `img/champ/${slug}.png`; im.onload = () => { for (const k of [...tokCache.keys()]) if (k.startsWith(slug + "|")) tokCache.delete(k); };
    imgs.set(slug, im); return im;
  }
  function token(slug, team, r) {
    const px = Math.max(8, Math.round(r * 2 * sc * dpr)), k = `${slug}|${team}|${px}`;
    if (tokCache.has(k)) return tokCache.get(k);
    const c = document.createElement("canvas"); c.width = c.height = px + 8; const g = c.getContext("2d"), m = (px + 8) / 2, im = champImg(slug), ok = im.complete && im.naturalWidth;
    g.save(); g.beginPath(); g.arc(m, m, px / 2 - 2, 0, Math.PI * 2); g.clip();
    if (ok) g.drawImage(im, m - px / 2, m - px / 2, px, px); else { g.fillStyle = team === "me" ? C.meDark : C.foeDark; g.fill(); g.fillStyle = C.text; g.font = `700 ${px * 0.4}px sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(cName(slug).slice(0, 2), m, m); }
    g.restore();
    g.lineWidth = Math.max(2, px * 0.07); g.strokeStyle = team === "me" ? C.me : C.foe; g.beginPath(); g.arc(m, m, px / 2 - 2, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1; g.strokeStyle = "rgba(0,0,0,.6)"; g.beginPath(); g.arc(m, m, px / 2 + 1, 0, Math.PI * 2); g.stroke();
    if (ok) tokCache.set(k, c); return c;
  }
  const FOE_POOL = () => { const k = Object.keys(CH).filter(s => s !== S.champ); return k.length ? k : ["ahri", "lux", "jinx", "zed"]; };

  /* ---------- Oyun durumu ---------- */
  let game = null, paused = false, raf = 0, lastT = 0, mouse = { x:500, y:300 }, fx = [], nums = [], armW = false;
  const me = (x, y, extra = {}) => ({ slug:S.champ, name:cName(S.champ), team:"me", x, y, r:22, tx:x, ty:y, vx:0, vy:0, hp:1, max:1, ...extra });

  function newGame() {
    pickWorld(); resize();
    const base = { mode:S.mode, diff:S.diff, len:S.len, t:0, over:false };
    if (S.mode === "dodge") { const d = DD[S.diff], pool = FOE_POOL();
      const foes = []; const sides = ["top", "right", "bottom", "left"];
      const order = ["line", "hook", "circle", "cone"].sort(() => Math.random() - 0.5);
      for (let i = 0; i < d.foes; i++) { const side = sides[i % 4], slug = pool.splice(Math.floor(Math.random() * pool.length), 1)[0] || "ahri"; champImg(slug);
        foes.push({ slug, name:cName(slug), team:"foe", side, r:20, x:0, y:0, u:rnd(0.15, 0.85), dir:Math.random() < 0.5 ? -1 : 1, cast:0, away:null }); }
      foes.forEach(placeFoe);
      return { ...base, p:me(W / 2, H / 2, { hp:d.lives, max:d.lives }), foes, order, sk:[], spawnIn:1.2, inv:0, dodged:0, flashCd:0, ghostCd:0, ghost:0, flashes:0 }; }
    if (S.mode === "aim") { const d = DA[S.diff], pool = FOE_POOL(), foes = [];
      for (let i = 0; i < d.foes; i++) foes.push(newDummy(pool.splice(Math.floor(Math.random() * pool.length), 1)[0] || "ahri"));
      const mins = []; for (let i = 0; i < d.minions; i++) mins.push(newLaneMinion(i));
      return { ...base, dur:S.len, p:me(W / 2, H * 0.76, { hp:1, max:1 }), foes, mins, shots:[], aoes:[], qcd:0, wcd:0, score:0,
        qShots:0, qHits:0, wCasts:0, wHits:0, blocked:0, kills:0, dsum:0, lead:0 }; }
    const ch = CH[S.champ], ad = ch ? Math.round(ch.b.ad + 8) : 62;
    return { ...base, dur:S.len, p:me(W * 0.2, laneY(W * 0.2) + 95, { hp:1, max:1 }), allies:makeAllies(), wave:[], waveAt:0.3, shotsM:[], myShots:[], cs:0, early:0, missed:0, cd:0, ad, lefts:[], turret:{ x:W * 0.07, y:laneY(W * 0.07) - 10 } };
  }

  /* ---------- Kaçış ---------- */
  function placeFoe(f) { const m = 34;
    if (f.side === "top") { f.x = W * f.u; f.y = m + (hud.offsetHeight + 6) / Math.max(0.3, sc); } else if (f.side === "bottom") { f.x = W * f.u; f.y = H - m - 70 / Math.max(0.3, sc); }
    else if (f.side === "left") { f.x = m; f.y = H * f.u; } else { f.x = W - m; f.y = H * f.u; } }
  function aimFrom(g, from, spd) {
    const d = DD[g.diff], p = g.p, dd = dist(p, from), lead = d.lead * Math.random() * dd / spd;
    const a = Math.atan2(p.y + p.vy * lead - from.y, p.x + p.vx * lead - from.x) + rnd(-0.07, 0.07); return { dx:Math.cos(a), dy:Math.sin(a) };
  }
  function spawnSkill(g) {
    const d = DD[g.diff], ramp = 1 + g.t / 120, r = Math.random();
    // ilk dört yetenek dört türün hepsini (karışık sırayla) gösterir, sonra rastgele
    const kind = g.order.length ? g.order.shift() : r < 0.38 ? "line" : r < 0.58 ? "hook" : r < 0.82 ? "circle" : "cone";
    const free = g.foes.filter(f => !f.away && f.cast <= 0); if (!free.length) return;
    const f = pick(free); f.cast = 0.5;
    if (kind === "line" || kind === "hook") {
      const hook = kind === "hook", spd = (hook ? 1450 : rnd(600, 1000)) * d.spd * ramp, dir = aimFrom(g, f, spd);
      g.sk.push({ k:kind, f, x:f.x, y:f.y, dx:dir.dx, dy:dir.dy, w:hook ? 12 : rnd(18, 30), spd, tele:(hook ? 0.55 : rnd(0.4, 0.6)) * d.tele, age:0, pos:0, len:Math.hypot(W, H) + 100 });
    } else if (kind === "circle") {
      const p = g.p, lead = d.lead + 0.15;
      g.sk.push({ k:"circle", f, x:clampX(p.x + p.vx * lead * Math.random(), 30), y:clampY(p.y + p.vy * lead * Math.random(), 30), r:rnd(70, 110), tele:rnd(0.9, 1.25) * d.tele / Math.min(1.35, ramp), age:0, done:false });
    } else { // koni: rakip yakına sıçrar, savurur, geri döner
      const p = g.p, a0 = Math.random() * Math.PI * 2, dd = rnd(250, 330), x = clampX(p.x + Math.cos(a0) * dd, 30), y = clampY(p.y + Math.sin(a0) * dd, 30);
      f.away = { x, y, hx:f.x, hy:f.y }; puff(f.x, f.y); f.x = x; f.y = y; puff(x, y);
      g.sk.push({ k:"cone", f, x, y, a:Math.atan2(p.y - y, p.x - x), half:rnd(0.38, 0.5), len:440, tele:0.75 * d.tele, age:0, done:false });
    }
  }
  const segDist = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy; let t = l ? ((px - ax) * vx + (py - ay) * vy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - vx * t, py - ay - vy * t); };
  function hitPlayer(g, what) {
    if (g.inv > 0) return;
    g.p.hp--; num(g.p.x, g.p.y - 30, what, C.bad, 22); burst(g.p.x, g.p.y, C.bad);
    if (g.p.hp <= 0) { endGame(); return; }
    g.inv = DD[g.diff].inv || 1;
  }
  function moveUnit(u, sp, dt) {
    const dx = u.tx - u.x, dy = u.ty - u.y, dd = Math.hypot(dx, dy);
    if (dd > 1) { const m = Math.min(dd, sp * dt); u.vx = dx / dd * sp; u.vy = dy / dd * sp; u.x += dx / dd * m; u.y += dy / dd * m; } else { u.vx = u.vy = 0; }
  }
  function stepDodge(g, dt) {
    const d = DD[g.diff], p = g.p;
    g.ghost = Math.max(0, g.ghost - dt); moveUnit(p, 330 * (g.ghost > 0 ? 1.4 : 1), dt);
    g.inv = Math.max(0, g.inv - dt); g.flashCd = Math.max(0, g.flashCd - dt); g.ghostCd = Math.max(0, g.ghostCd - dt);
    for (const f of g.foes) { f.cast = Math.max(0, f.cast - dt);
      if (!f.away) { f.u += f.dir * dt * 0.04; if (f.u < 0.1 || f.u > 0.9) f.dir *= -1; placeFoe(f); } }
    g.spawnIn -= dt;
    if (g.spawnIn <= 0) { spawnSkill(g); g.spawnIn = Math.max(0.24, d.spawn / (1 + g.t / 45)) * rnd(0.8, 1.2); }
    for (const s of g.sk) {
      s.age += dt;
      if (s.k === "line" || s.k === "hook") {
        if (s.age < s.tele) continue;
        s.pos += s.spd * dt;
        const hx = s.x + s.dx * s.pos, hy = s.y + s.dy * s.pos, tl = Math.max(0, s.pos - s.w * 2.5);
        if (!s.hit && segDist(p.x, p.y, s.x + s.dx * tl, s.y + s.dy * tl, hx, hy) < s.w / 2 + p.r) { s.hit = true; hitPlayer(g, s.k === "hook" ? "Yakalandın!" : "İsabet!"); if (g.over) return; }
        if (s.pos > s.len) { s.gone = true; if (!s.hit) g.dodged++; }
      } else if (!s.done && s.age >= s.tele) {
        s.done = true; s.fade = 0.3; let hit = false;
        if (s.k === "circle") hit = dist(p, s) < s.r + p.r * 0.6;
        else { const dd = dist(p, s); let da = Math.abs(Math.atan2(p.y - s.y, p.x - s.x) - s.a); if (da > Math.PI) da = 2 * Math.PI - da;
          hit = dd <= s.len + p.r && (dd < p.r || da <= s.half + Math.asin(Math.min(1, p.r / dd))); }
        if (hit) { hitPlayer(g, "İsabet!"); if (g.over) return; } else g.dodged++;
      } else if (s.done) { s.fade -= dt;
        if (s.fade <= 0) { s.gone = true; const f = s.f; if (s.k === "cone" && f.away) { puff(f.x, f.y); f.away = null; placeFoe(f); puff(f.x, f.y); } } }
    }
    g.sk = g.sk.filter(s => !s.gone);
  }
  function doFlash() {
    const g = game; if (!g || paused || g.over || !g.p || g.flashCd > 0 || g.mode === "lh") return;
    const p = g.p, tx = TOUCH ? p.tx : mouse.x, ty = TOUCH ? p.ty : mouse.y, dx = tx - p.x, dy = ty - p.y, dd = Math.hypot(dx, dy) || 1, m = Math.min(150, dd);
    puff(p.x, p.y); p.x = clampX(p.x + dx / dd * m, p.r); p.y = clampY(p.y + dy / dd * m, p.r); puff(p.x, p.y);
    if (Math.hypot(p.tx - p.x, p.ty - p.y) < 30) { p.tx = p.x; p.ty = p.y; }
    g.flashCd = g.mode === "dodge" ? DD[g.diff].flash : 12; g.flashes = (g.flashes || 0) + 1;
  }
  function doGhost() { const g = game; if (!g || paused || g.over || g.mode !== "dodge" || g.ghostCd > 0) return; g.ghost = 3; g.ghostCd = DD[g.diff].ghost; num(g.p.x, g.p.y - 34, "Hayalet", C.good, 16); }

  /* ---------- Nişan (yetenek atışı) ---------- */
  function newDummy(slug) { champImg(slug); return { slug, name:cName(slug), team:"foe", r:24, x:rnd(80, W - 80), y:rnd(70, H * 0.48), vx:0, vy:0, turn:0, hp:500, max:500, juke:0, jukeCd:0, flash:0 }; }
  function newLaneMinion(i) { const dir = i % 2 ? 1 : -1; return { kind:i % 3 === 2 ? "caster" : "melee", team:"foe", r:13, x:dir > 0 ? rnd(-60, W * 0.3) : rnd(W * 0.7, W + 60), y:H * 0.6 + (i % 3) * 22 - 22, dir, hp:2, max:2 }; }
  function stepAim(g, dt) {
    const d = DA[g.diff], p = g.p;
    moveUnit(p, 330, dt); p.y = Math.max(H * 0.55, Math.min(H * 0.8, p.y));
    g.qcd = Math.max(0, g.qcd - dt); g.wcd = Math.max(0, g.wcd - dt);
    for (const f of g.foes) {
      f.turn -= dt; f.jukeCd = Math.max(0, f.jukeCd - dt); f.flash = Math.max(0, f.flash - dt);
      if (f.pj && g.t >= f.pj.at) { f.vx = f.pj.vx; f.vy = f.pj.vy; f.juke = 0.35; f.jukeCd = 1; f.pj = null; }
      if (f.juke > 0) f.juke -= dt;
      else if (f.turn <= 0) { const a = Math.random() * Math.PI * 2, sp = d.spd * rnd(0.5, 1.1); f.vx = Math.cos(a) * sp; f.vy = Math.sin(a) * sp * 0.6; f.turn = rnd(0.45, 1.3); if (Math.random() < 0.18) { f.vx = f.vy = 0; f.turn = rnd(0.3, 0.7); } }
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.x < 50 || f.x > W - 50) { f.vx *= -1; f.x = clampX(f.x, 50); }
      if (f.y < 50 || f.y > H * 0.5) { f.vy *= -1; f.y = Math.max(50, Math.min(H * 0.5, f.y)); }
      // kaçma: yaklaşan Sihirli Ok görülünce (tepki süresinden sonra) yana atılır
      if (f.juke <= 0 && f.jukeCd <= 0) for (const s of g.shots) {
        if (s.dead || s.seen && s.seen.has(f)) continue;
        const tx = f.x - s.x, ty = f.y - s.y, along = tx * s.dx + ty * s.dy, side = tx * -s.dy + ty * s.dx;
        if (along > 0 && Math.abs(side) < s.w / 2 + f.r + 40 && along / s.spd < 0.6) {
          (s.seen ||= new Set()).add(f);
          if (Math.random() < d.juke) { const sgn = side >= 0 ? 1 : -1, sp = d.spd * 1.9; f.pj = { at:g.t + d.react, vx:-s.dy * sgn * sp, vy:s.dx * sgn * sp }; g.jukes = (g.jukes || 0) + 1; }
        }
      }
    }
    for (const m of g.mins) { m.x += m.dir * 60 * dt; if (m.x < -80 || m.x > W + 80) { m.dir *= -1; m.hp = m.max; } }
    for (const s of g.shots) { // Sihirli Ok
      const step = s.spd * dt; s.pos += step; s.x += s.dx * step; s.y += s.dy * step;
      const hitU = [...g.mins.filter(m => m.hp > 0), ...g.foes].find(u => Math.hypot(u.x - s.x, u.y - s.y) < u.r + s.w / 2);
      if (hitU) { s.dead = true;
        if (hitU.kind) { g.blocked++; hitU.hp--; num(hitU.x, hitU.y - 20, "Minyona takıldı", C.muted, 14); if (hitU.hp <= 0) { burst(hitU.x, hitU.y, C.muted); hitU.x = hitU.dir > 0 ? -70 : W + 70; hitU.hp = hitU.max; } }
        else { const dd = Math.hypot(hitU.x - s.ox, hitU.y - s.oy), moving = Math.hypot(hitU.vx, hitU.vy), perp = Math.abs(hitU.vx * -s.dy + hitU.vy * s.dx);
          let pts = 10 + Math.round(dd / 100); const led = perp > 70 && moving > 60; if (led) { pts += 5; g.lead++; }
          g.qHits++; g.dsum += dd; g.score += pts; damage(g, hitU, 120, led ? `+${pts} öngörü` : `+${pts}`); } }
      if (s.pos > s.range) s.dead = true;
    }
    g.shots = g.shots.filter(s => !s.dead);
    for (const a of g.aoes) { a.age += dt;
      if (!a.done && a.age >= a.delay) { a.done = true; a.fade = 0.3; let n = 0;
        for (const f of g.foes) if (Math.hypot(f.x - a.x, f.y - a.y) < a.r + f.r * 0.5) { n++; g.wHits++; g.score += 15; damage(g, f, 150, "+15"); }
        if (!n) num(a.x, a.y, "Iska", C.muted, 14); }
      else if (a.done) a.fade -= dt; }
    g.aoes = g.aoes.filter(a => !a.done || a.fade > 0);
    if (g.t >= g.dur) endGame();
  }
  function damage(g, f, amt, label) {
    f.hp -= amt; f.flash = 0.15; num(f.x, f.y - 34, label, C.gold, 16);
    if (f.hp <= 0) { g.kills++; g.score += 25; num(f.x, f.y - 56, "Alındı! +25", C.good, 18); burst(f.x, f.y, C.foe); Object.assign(f, newDummy(pick(FOE_POOL()))); }
  }
  function castQ(target) {
    const g = game; if (!g || g.mode !== "aim" || paused || g.over || g.qcd > 0) return;
    const p = g.p, dx = target.x - p.x, dy = target.y - p.y, dd = Math.hypot(dx, dy) || 1;
    g.shots.push({ x:p.x, y:p.y, ox:p.x, oy:p.y, dx:dx / dd, dy:dy / dd, spd:1500, range:950, w:30, pos:0 }); g.qShots++; g.qcd = DA[g.diff].qcd;
  }
  function castW(target) {
    const g = game; if (!g || g.mode !== "aim" || paused || g.over || g.wcd > 0) return;
    const p = g.p, dx = target.x - p.x, dy = target.y - p.y, dd = Math.hypot(dx, dy), k = dd > 900 ? 900 / dd : 1;
    g.aoes.push({ x:p.x + dx * k, y:p.y + dy * k, r:110, delay:0.75, age:0, done:false }); g.wCasts++; g.wcd = 4; armW = false; syncTouch();
  }

  /* ---------- Son vuruş (dalga, kademeli ölüm zamanları) ---------- */
  function makeAllies() {
    const out = [], x0 = W * 0.36;
    for (let i = 0; i < 6; i++) { const melee = i < 3; out.push({ kind:melee ? "melee" : "caster", team:"me", r:melee ? 15 : 12, x:x0 - (melee ? 0 : 70) + (i % 3) * 8, y:laneY(x0) + ((i % 3) - 1) * 34, swing:0 }); }
    return out;
  }
  function spawnWave(g) {
    const d = DL[g.diff], x0 = W * 0.58, now = g.t;
    let T = now + rnd(5.2, 6.0); const wave = [];
    for (let i = 0; i < 6; i++) {
      const melee = i < 3, hp = melee ? 480 : 300, m = { kind:melee ? "melee" : "caster", team:"foe", r:melee ? 15 : 12, hp, max:hp,
        x:W + 40 + i * 30, y:laneY(x0) + ((i % 3) - 1) * 34, hx:x0 + (melee ? 0 : 70) - (i % 3) * 8, alive:true, ev:[], swing:0 };
      // ölüm zamanı: önce ön saftakiler; aralar 0,6–2,5 sn, çakışma nadir
      if (i) T += rnd(d.gap[0], d.gap[1]);
      const start = now + 2.9 + rnd(0, 0.6), n = Math.max(4, Math.round((T - start) / rnd(0.55, 0.8))), fin = rnd(0.4, 0.92) * g.ad;
      const wts = Array.from({ length:n - 1 }, () => rnd(0.6, 1.4)), sum = wts.reduce((a, b) => a + b, 0);
      for (let k = 0; k < n - 1; k++) m.ev.push({ t:start + (T - start - 0.55) * (k + rnd(0.2, 0.8)) / (n - 1), dmg:(hp - fin) * wts[k] / sum, src:Math.floor(Math.random() * 6) });
      m.ev.sort((a, b) => a.t - b.t);
      if (d.turret && Math.random() < 0.5) { const k = Math.floor(m.ev.length * rnd(0.3, 0.6)); m.ev[k].turret = true; }
      m.ev.push({ t:T, dmg:fin + 1, src:Math.floor(Math.random() * 6) }); m.death = T; wave.push(m);
    }
    g.wave.push(...wave); g.waveAt = T - 2.4; // sonraki dalga, bu dalganın son minyonundan ~3 sn sonra ilk ölümü verecek şekilde yürür
  }
  function stepLH(g, dt) {
    const d = DL[g.diff];
    g.cd = Math.max(0, g.cd - dt);
    if (g.t >= g.waveAt) spawnWave(g);
    for (const a of g.allies) a.swing = Math.max(0, a.swing - dt);
    for (const m of g.wave) {
      if (!m.alive) continue; m.swing = Math.max(0, m.swing - dt);
      if (m.x > m.hx) m.x = Math.max(m.hx, m.x - 180 * dt);
      else if (Math.random() < dt * 0.9) { m.swing = 0.2; const a = pick(g.allies); if (m.kind === "caster") g.shotsM.push({ x:m.x, y:m.y, tx:a.x, ty:a.y, age:0, life:0.35, col:C.foe }); }
      while (m.ev.length && m.ev[0].t <= g.t) { const e = m.ev.shift(), a = g.allies[e.src];
        if (e.turret) g.shotsM.push({ x:g.turret.x, y:g.turret.y - 40, tx:m.x, ty:m.y, age:0, life:0.3, col:C.gold, big:true });
        else { a.swing = 0.2; if (a.kind === "caster") g.shotsM.push({ x:a.x, y:a.y, tx:m.x, ty:m.y, age:0, life:0.3, col:C.me }); }
        m.hp -= e.dmg; if (m.hp <= 0) { m.alive = false; g.missed++; num(m.x, m.y - 24, "Kaçtı", C.muted, 14); break; } }
    }
    for (const s of g.myShots) { s.age += dt;
      if (!s.done && s.age >= s.wind) { s.done = true; const m = s.m;
        if (!m.alive) continue;
        if (m.hp <= g.ad) { g.lefts.push(m.hp / g.ad); m.alive = false; g.cs++; num(m.x, m.y - 26, "+21 altın", C.gold, 16); burst(m.x, m.y, C.gold); }
        else { m.hp -= g.ad; g.early++; num(m.x, m.y - 26, `−${g.ad} (erken)`, C.bad, 14); } } }
    for (const s of g.shotsM) s.age += dt;
    g.shotsM = g.shotsM.filter(s => s.age < s.life); g.myShots = g.myShots.filter(s => !s.done || s.age < s.wind + 0.1);
    g.wave = g.wave.filter(m => m.alive || m.x > W);
    if (g.t >= g.dur) endGame();
  }
  function hitMinion(g, w, touch) {
    const tol = touch ? 18 : 8;
    return g.wave.find(m => m.alive && m.x <= m.hx + 2 && Math.abs(w.x - m.x) <= m.r + tol + 6 && w.y >= m.y - m.r - 30 - tol && w.y <= m.y + m.r + tol);
  }
  function attackLH(g, w, touch) {
    if (g.cd > 0) return; const m = hitMinion(g, w, touch); if (!m) return;
    const d = DL[g.diff]; g.cd = d.cd; g.myShots.push({ m, wind:d.wind, age:0, done:false });
  }

  /* ---------- Efektler ---------- */
  function burst(x, y, col) { if (!RM) fx.push({ k:"burst", x, y, col, age:0, life:0.35 }); }
  function puff(x, y) { if (!RM) fx.push({ k:"puff", x, y, col:"#e9eef6", age:0, life:0.3 }); }
  function marker(x, y) { fx.push({ k:"mark", x, y, col:C.good, age:0, life:RM ? 0.25 : 0.45 }); }
  function num(x, y, text, col, size) { nums.push({ x, y, text, col, size, age:0, life:0.9 }); }

  /* ---------- Döngü ---------- */
  function loop(ts) {
    raf = 0; if (!game || paused || game.over) { draw(); return; }
    const dt = Math.min(0.05, (ts - lastT) / 1000 || 0); lastT = ts;
    step(dt); draw(); updHud();
    if (game && !game.over && !paused) raf = requestAnimationFrame(loop);
  }
  function step(dt) {
    const g = game; if (!g || g.over) return; g.t += dt;
    if (g.mode === "dodge") stepDodge(g, dt); else if (g.mode === "aim") stepAim(g, dt); else stepLH(g, dt);
    for (const f of fx) f.age += dt; fx = fx.filter(f => f.age < f.life);
    for (const n of nums) n.age += dt; nums = nums.filter(n => n.age < n.life);
  }
  const startLoop = () => { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); } };

  /* ---------- Çizim ---------- */
  const shadow = (x, y, r) => { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x + 3, y + r * 0.8, r * 0.95, r * 0.38, 0, 0, Math.PI * 2); ctx.fill(); };
  function hpBar(x, y, w, k, col, segs) {
    ctx.fillStyle = C.hpBg; ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 8);
    ctx.fillStyle = col; ctx.fillRect(x - w / 2, y, w * Math.max(0, Math.min(1, k)), 6);
    if (segs > 1) { ctx.fillStyle = C.hpBg; for (let i = 1; i < segs; i++) ctx.fillRect(x - w / 2 + w * i / segs - 0.5, y, 1.5, 6); }
  }
  function drawChamp(u, opt = {}) {
    shadow(u.x, u.y, u.r);
    if (opt.glow) { ctx.fillStyle = opt.glow; ctx.beginPath(); ctx.arc(u.x, u.y, u.r + 8, 0, Math.PI * 2); ctx.fill(); }
    const t = token(u.slug, u.team, u.r), s = (u.r * 2 + 8 / (sc * dpr) * 1) ; ctx.globalAlpha = opt.alpha ?? 1;
    ctx.drawImage(t, u.x - t.width / (2 * sc * dpr), u.y - t.height / (2 * sc * dpr), t.width / (sc * dpr), t.height / (sc * dpr)); ctx.globalAlpha = 1;
    if (u.flash > 0) { ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.arc(u.x, u.y, u.r, 0, Math.PI * 2); ctx.fill(); }
    if (opt.bar !== false) {
      const by = u.y - u.r - 14; hpBar(u.x, by, 56, u.hp / u.max, u.team === "me" ? C.hpMe : C.hpFoe, opt.segs || 0);
      ctx.font = "600 12px 'IBM Plex Sans',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.75)"; ctx.strokeText(u.name, u.x, by - 4); ctx.fillStyle = u.team === "me" ? "#cfe6ff" : "#ffd2cd"; ctx.fillText(u.name, u.x, by - 4);
    }
  }
  function drawMinion(m, showBar, markAd) {
    const team = m.team === "me", body = team ? "#3d7fd1" : "#c9473d", dark = team ? "#1d3f6b" : "#5c1c16", r = m.r;
    shadow(m.x, m.y, r);
    const lunge = m.swing > 0 ? (team ? 4 : -4) : 0, x = m.x + lunge, y = m.y;
    if (m.kind === "melee") {
      ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(x, y + 2, r, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x, y, r * 0.85, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c9cdd4"; ctx.beginPath(); ctx.arc(x, y - r * 0.55, r * 0.5, Math.PI, 0); ctx.fill(); // miğfer
      ctx.strokeStyle = "#d9dde3"; ctx.lineWidth = 2.5; const sx = x + (team ? r : -r); ctx.beginPath(); ctx.moveTo(sx, y + 2); ctx.lineTo(sx + (team ? 9 : -9), y - 10); ctx.stroke(); // kılıç
    } else {
      ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(x, y - r * 1.2); ctx.lineTo(x + r, y + r * 0.9); ctx.lineTo(x - r, y + r * 0.9); ctx.closePath(); ctx.fill(); // cüppe
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(x, y - r * 0.5, r * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 2; const sx = x + (team ? r * 0.9 : -r * 0.9); ctx.beginPath(); ctx.moveTo(sx, y + r); ctx.lineTo(sx, y - r * 1.1); ctx.stroke(); // asa
      ctx.fillStyle = team ? "#8fd0ff" : "#ff9e8a"; ctx.beginPath(); ctx.arc(sx, y - r * 1.2, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    if (showBar) { const w = 40, by = m.y - r - 12; const low = markAd != null && m.hp <= markAd;
      hpBar(m.x, by, w, m.hp / m.max, low && game.mode === "lh" && DL[game.diff].mark >= 2 ? C.gold : team ? C.hpMe : C.hpFoe);
      if (markAd != null && DL[game.diff].mark >= 1) { ctx.fillStyle = "#fff"; ctx.fillRect(m.x - w / 2 + w * markAd / m.max - 1, by - 2, 2, 10); } }
  }
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!terrain || terrain.width !== cv.width || terrain.height !== cv.height) buildTerrain();
    ctx.drawImage(terrain, 0, 0);
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    const g = game; if (!g) return;
    if (g.mode === "dodge") drawDodge(g); else if (g.mode === "aim") drawAim(g); else drawLH(g);
    for (const f of fx) { const k = f.age / f.life; ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.col; ctx.lineWidth = 3;
      if (f.k === "mark") { const r = 16 * (1 - k * 0.6); ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.moveTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.6); ctx.lineTo(f.x + Math.cos(a) * (r + 7), f.y + Math.sin(a) * (r + 7) * 0.6); } ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(f.x, f.y, f.k === "puff" ? 12 + 24 * k : 10 + 40 * k, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1; }
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    for (const n of nums) { const k = n.age / n.life; ctx.globalAlpha = 1 - k * k; ctx.font = `700 ${n.size}px 'IBM Plex Sans',sans-serif`;
      const y = n.y - (RM ? 0 : 26 * k); ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.8)"; ctx.strokeText(n.text, n.x, y); ctx.fillStyle = n.col; ctx.fillText(n.text, n.x, y); }
    ctx.globalAlpha = 1;
    if (!TOUCH) drawBar(g); // dokunmatikte yetenek düğmeleri ekranın altındadır
  }
  function teleLine(s, col) {
    const ex = s.x + s.dx * s.len, ey = s.y + s.dy * s.len, k = Math.min(1, s.age / s.tele);
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(Math.atan2(s.dy, s.dx));
    ctx.fillStyle = C.tele; ctx.fillRect(0, -s.w / 2, s.len, s.w);
    ctx.fillStyle = col; ctx.globalAlpha = 0.35; ctx.fillRect(0, -s.w / 2, s.len * k, s.w); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.teleEdge; ctx.lineWidth = 1.5; ctx.strokeRect(0, -s.w / 2, s.len, s.w); ctx.restore();
  }
  function drawDodge(g) {
    for (const s of g.sk) {
      if (s.k === "line" || s.k === "hook") {
        const col = s.k === "hook" ? C.gold : "#ff9a5c";
        if (s.age < s.tele) { teleLine(s, col); continue; }
        const hx = s.x + s.dx * s.pos, hy = s.y + s.dy * s.pos, tl = Math.max(0, s.pos - s.w * 2.5);
        if (s.k === "hook") { ctx.strokeStyle = "#9b8a66"; ctx.lineWidth = 3; ctx.setLineDash([7, 5]); ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(hx, hy); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx, hy, s.w * 0.8, 0, Math.PI * 2); ctx.fill(); }
        else { const gr = ctx.createLinearGradient(s.x + s.dx * tl, s.y + s.dy * tl, hx, hy); gr.addColorStop(0, "rgba(255,154,92,0)"); gr.addColorStop(1, col);
          ctx.strokeStyle = gr; ctx.lineWidth = s.w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(s.x + s.dx * tl, s.y + s.dy * tl); ctx.lineTo(hx, hy); ctx.stroke(); ctx.lineCap = "butt";
          ctx.fillStyle = "#fff2d0"; ctx.beginPath(); ctx.arc(hx, hy, s.w * 0.32, 0, Math.PI * 2); ctx.fill(); }
      } else if (s.k === "circle") {
        const k = Math.min(1, s.age / s.tele);
        if (!s.done) { ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(s.f.x, s.f.y); ctx.lineTo(s.x, s.y); ctx.stroke(); ctx.setLineDash([]); }
        ctx.fillStyle = s.done ? `rgba(190,140,255,${Math.max(0, s.fade / 0.3) * 0.6})` : C.tele; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.teleEdge; ctx.lineWidth = 2; ctx.stroke();
        if (!s.done) { ctx.fillStyle = "rgba(190,140,255,.35)"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * k, 0, Math.PI * 2); ctx.fill(); }
      } else {
        const k = Math.min(1, s.age / s.tele);
        ctx.fillStyle = s.done ? `rgba(255,110,90,${Math.max(0, s.fade / 0.3) * 0.55})` : C.tele;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.arc(s.x, s.y, s.len, s.a - s.half, s.a + s.half); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.teleEdge; ctx.lineWidth = 2; ctx.stroke();
        if (!s.done) { ctx.fillStyle = "rgba(255,110,90,.3)"; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.arc(s.x, s.y, s.len * k, s.a - s.half, s.a + s.half); ctx.closePath(); ctx.fill(); }
      }
    }
    for (const f of g.foes) drawChamp({ ...f, hp:1, max:1 }, { glow:f.cast > 0 ? "rgba(255,120,100,.35)" : null });
    const p = g.p;
    if (Math.hypot(p.tx - p.x, p.ty - p.y) > 6) { ctx.strokeStyle = "rgba(94,210,148,.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.tx, p.ty); ctx.stroke(); ctx.setLineDash([]); }
    if (g.ghost > 0) { ctx.fillStyle = "rgba(94,210,148,.18)"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 10, 0, Math.PI * 2); ctx.fill(); }
    drawChamp(p, { alpha:g.inv > 0 && Math.floor(g.t * 12) % 2 ? 0.45 : 1, segs:p.max });
  }
  function drawAim(g) {
    for (const m of g.mins) drawMinion(m, true);
    for (const a of g.aoes) { const k = Math.min(1, a.age / a.delay);
      ctx.fillStyle = a.done ? `rgba(130,190,255,${Math.max(0, a.fade / 0.3) * 0.55})` : "rgba(74,168,255,.14)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(140,200,255,.85)"; ctx.lineWidth = 2; ctx.stroke();
      if (!a.done) { ctx.fillStyle = "rgba(140,200,255,.3)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.r * k, 0, Math.PI * 2); ctx.fill(); } }
    for (const f of g.foes) drawChamp(f);
    for (const s of g.shots) { const tl = Math.max(0, s.pos - 70), gr = ctx.createLinearGradient(s.x - s.dx * 70, s.y - s.dy * 70, s.x, s.y);
      gr.addColorStop(0, "rgba(120,190,255,0)"); gr.addColorStop(1, "#9fd4ff"); ctx.strokeStyle = gr; ctx.lineWidth = s.w * 0.7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(s.x - s.dx * Math.min(70, s.pos), s.y - s.dy * Math.min(70, s.pos)); ctx.lineTo(s.x, s.y); ctx.stroke(); ctx.lineCap = "butt";
      ctx.fillStyle = "#f4fbff"; ctx.beginPath(); ctx.arc(s.x, s.y, s.w * 0.28, 0, Math.PI * 2); ctx.fill(); }
    const p = g.p;
    // nişan göstergesi: Q menzili ve yönü
    if (!TOUCH && !g.over) { const dx = mouse.x - p.x, dy = mouse.y - p.y, dd = Math.hypot(dx, dy) || 1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(dy, dx)); ctx.fillStyle = armW ? "rgba(0,0,0,0)" : "rgba(120,190,255,.07)"; ctx.fillRect(0, -15, 950, 30);
      ctx.strokeStyle = "rgba(160,210,255,.4)"; ctx.lineWidth = 1; if (!armW) ctx.strokeRect(0, -15, 950, 30); ctx.restore();
      if (armW) { ctx.strokeStyle = "rgba(160,210,255,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 110, 0, Math.PI * 2); ctx.stroke(); } }
    drawChamp(p, { bar:true });
  }
  function drawLH(g) {
    const t = g.turret; // müttefik kule
    shadow(t.x, t.y + 10, 30); ctx.fillStyle = "#3a4b63"; ctx.fillRect(t.x - 22, t.y - 50, 44, 62); ctx.fillStyle = "#53698a"; ctx.fillRect(t.x - 28, t.y - 58, 56, 12);
    ctx.fillStyle = "#8fd0ff"; ctx.beginPath(); ctx.arc(t.x, t.y - 66, 8, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#1d2b3e"; ctx.lineWidth = 2; ctx.strokeRect(t.x - 22, t.y - 50, 44, 62);
    for (const a of g.allies) drawMinion({ ...a, hp:1, max:1 }, false);
    for (const m of g.wave) if (m.alive) drawMinion(m, true, g.ad);
    for (const s of g.shotsM) { const k = s.age / s.life; ctx.fillStyle = s.col; ctx.beginPath(); ctx.arc(s.x + (s.tx - s.x) * k, s.y + (s.ty - s.y) * k, s.big ? 7 : 4, 0, Math.PI * 2); ctx.fill(); }
    const p = g.p;
    for (const s of g.myShots) { if (s.done) continue; const k = s.wind ? Math.min(1, s.age / s.wind) : 1;
      ctx.fillStyle = "#cfe6ff"; ctx.beginPath(); ctx.arc(p.x + (s.m.x - p.x) * k, p.y + (s.m.y - p.y) * k, 5, 0, Math.PI * 2); ctx.fill(); }
    drawChamp(p, { bar:true });
    if (g.cd > 0) { const d = DL[g.diff]; ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - g.cd / d.cd)); ctx.stroke(); }
    ctx.font = "600 13px 'IBM Plex Sans',sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.75)";
    const lab = `Saldırı gücü ${g.ad}`; ctx.strokeText(lab, p.x, p.y + p.r + 22); ctx.fillStyle = C.gold; ctx.fillText(lab, p.x, p.y + p.r + 22);
  }
  /* Alt yetenek çubuğu (ekran koordinatı): Q W E R | D F, bekleme süresi süpürmesiyle */
  function drawBar(g) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const slots = g.mode === "dodge" ? [["Q"], ["W"], ["E"], ["R"], ["D", "Hayalet", g.ghostCd, DD[g.diff].ghost], ["F", "Sıçra", g.flashCd, DD[g.diff].flash]]
      : g.mode === "aim" ? [["Q", "Sihirli Ok", g.qcd, DA[g.diff].qcd], ["W", "Yıldız Yağmuru", g.wcd, 4], ["E"], ["R"], ["D"], ["F"]]
      : [["Q"], ["W"], ["E"], ["R"], ["A", "Saldırı", g.cd, DL[g.diff].cd], ["F"]];
    const s = Math.max(30, Math.min(44, cssW / 12)), gap = 6, n = slots.length, bw = n * s + (n - 1) * gap + 22 + 20, x0 = (cssW - bw) / 2, y0 = cssH - s - 14;
    ctx.fillStyle = "rgba(8,12,18,.78)"; ctx.strokeStyle = "rgba(240,192,96,.35)"; ctx.lineWidth = 1; roundRect(x0, y0 - 6, bw, s + 12, 10); ctx.fill(); ctx.stroke();
    slots.forEach(([key, name, cd, max], i) => {
      const x = x0 + 10 + i * (s + gap) + (i >= 4 ? 22 : 0), y = y0, on = !!name;
      ctx.fillStyle = on ? "#1c2a3d" : "#111821"; roundRect(x, y, s, s, 6); ctx.fill();
      ctx.strokeStyle = on ? (cd > 0 ? "#34465e" : "#f0c060") : "#222e3d"; ctx.lineWidth = 1.5; ctx.stroke();
      if (on) { // basit özgün simge
        ctx.save(); ctx.translate(x + s / 2, y + s / 2); ctx.strokeStyle = "#cfe6ff"; ctx.fillStyle = "#9fd4ff"; ctx.lineWidth = 2;
        if (name === "Sıçra") { ctx.beginPath(); ctx.moveTo(-s * 0.18, s * 0.22); ctx.lineTo(0, -s * 0.05); ctx.lineTo(-s * 0.05, s * 0.05); ctx.lineTo(s * 0.18, -s * 0.22); ctx.stroke(); }
        else if (name === "Hayalet") { ctx.beginPath(); ctx.arc(0, -s * 0.05, s * 0.17, Math.PI, 0); ctx.lineTo(s * 0.17, s * 0.2); ctx.lineTo(-s * 0.17, s * 0.2); ctx.closePath(); ctx.stroke(); }
        else if (name === "Sihirli Ok") { ctx.beginPath(); ctx.moveTo(-s * 0.25, s * 0.15); ctx.lineTo(s * 0.2, -s * 0.15); ctx.stroke(); ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.15, s * 0.07, 0, Math.PI * 2); ctx.fill(); }
        else if (name === "Yıldız Yağmuru") { ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * 0.07, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.beginPath(); ctx.moveTo(-s * 0.2, s * 0.2); ctx.lineTo(s * 0.2, -s * 0.2); ctx.moveTo(s * 0.05, -s * 0.2); ctx.lineTo(s * 0.2, -s * 0.2); ctx.lineTo(s * 0.2, -s * 0.05); ctx.stroke(); }
        ctx.restore();
        if (cd > 0 && max) { ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.beginPath(); ctx.moveTo(x + s / 2, y + s / 2); ctx.arc(x + s / 2, y + s / 2, s * 0.72, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (cd / max)); ctx.closePath();
          ctx.save(); roundRect(x, y, s, s, 6); ctx.clip(); ctx.fill(); ctx.restore();
          ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(s * 0.36)}px 'IBM Plex Mono',monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(cd >= 1 ? Math.ceil(cd) : cd.toFixed(1).replace(".", ","), x + s / 2, y + s / 2 + 1); }
      }
      ctx.fillStyle = on ? "#f0c060" : "#4a5a70"; ctx.font = `700 ${Math.round(s * 0.26)}px 'IBM Plex Mono',monospace`; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(key, x + 3, y + 2);
    });
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* ---------- Gösterge ve paneller ---------- */
  const f1 = v => v.toFixed(1).replace(".", ","), f2 = v => v.toFixed(2).replace(".", ",");
  function updHud() {
    const g = game; if (!g) { hud.innerHTML = ""; return; }
    let h = `<span class="h">${MODE_TR[g.mode]} · ${DIFF_TR[g.diff]}</span>`;
    if (g.mode === "dodge") h += `<span class="h">Süre <b>${f1(g.t)} sn</b></span><span class="h">Kaçılan <b>${g.dodged}</b></span>`;
    else if (g.mode === "aim") h += `<span class="h">Kalan <b>${Math.max(0, Math.ceil(g.dur - g.t))} sn</b></span><span class="h">Skor <b>${g.score}</b></span><span class="h">İsabet <b>${g.qHits}/${g.qShots}</b></span>`;
    else h += `<span class="h">Kalan <b>${Math.max(0, Math.ceil(g.dur - g.t))} sn</b></span><span class="h">Son vuruş <b>${g.cs}</b></span><span class="h">Kaçan <b>${g.missed}</b></span>`;
    hud.innerHTML = h; syncTouch();
  }
  function syncTouch() {
    if (!TOUCH || !game) return; const g = game;
    for (const b of touchBar.querySelectorAll("[data-tk]:not([data-tk=P])")) { const k = b.dataset.tk;
      const cd = k === "F" ? g.flashCd : k === "D" ? g.ghostCd : k === "W" ? g.wcd : 0; b.disabled = cd > 0; b.setAttribute("aria-pressed", k === "W" && armW);
      b.textContent = (k === "F" ? "Sıçra" : k === "D" ? "Hayalet" : armW ? "W: hedefe dokun" : "W") + (cd > 0 ? ` ${Math.ceil(cd)}` : ""); }
  }
  function buildTouch() {
    const keys = S.mode === "dodge" ? ["D", "F"] : S.mode === "aim" ? ["W"] : [];
    touchBar.innerHTML = keys.map(k => `<button type="button" class="btn" data-tk="${k}">${k}</button>`).join("") + `<button type="button" class="btn" data-tk="P" aria-label="Duraklat">Duraklat</button>`;
  }
  const HOW = {
    dodge: () => `<ul class="howto">
      <li>${TOUCH ? "Gitmek istediğin yere <b>dokun ya da sürükle</b>." : "<b>Sağ tıkla</b> yürü; basılı tutup sürükleyebilirsin." + (S.left ? " Sol tık da yürütür." : "")} Tıkladığın yerde yeşil işaret çıkar.</li>
      <li>Kenarlardaki <b>rakip şampiyonlar</b> sana yetenek atar; her yetenek önce kırmızı alanla gösterilir: düz atış, hızlı kanca, gecikmeli alan ve yakına sıçrayıp koni savurma. Dört türün hepsi baştan gelir; Kolay ve Normal'da daha seyrek ve yavaştır.</li>
      <li>${TOUCH ? "<b>Hayalet</b> ve <b>Sıçra</b> düğmeleri" : "<kbd>D</kbd> Hayalet (3 sn hız), <kbd>F</kbd> Sıçra (imlece kısa ışınlanma)"}; ikisinin de bekleme süresi var.</li>
      <li>Skor hayatta kaldığın süredir. Kolay'da 3 can, diğerlerinde tek vuruşta biter. <kbd>Esc</kbd> duraklatır.</li></ul>`,
    aim: () => `<ul class="howto">
      <li><b>Q · Sihirli Ok</b>: imlece doğru düz giden, menzili ve hızı olan bir atış. ${TOUCH ? "Ekrana dokun: o yöne atılır." : "<kbd>Q</kbd> ya da sol tık ile imlece at."}</li>
      <li><b>W · Yıldız Yağmuru</b>: ${TOUCH ? "W düğmesine bas, sonra hedefe dokun" : "<kbd>W</kbd> ile imlecin olduğu yere"}; 0,75 sn sonra patlayan alan.</li>
      <li>Rakipler sağa sola kayar ve oku görünce kaçmaya çalışır (zorluk arttıkça daha sık ve daha hızlı). Aradan geçen <b>minyonlar oku keser</b>.</li>
      <li>Puan: isabet 10 + mesafe bonusu, hareket eden hedefi önden vurursan <b>+5 öngörü</b>, W isabeti 15, alınan rakip +25. ${TOUCH ? "" : "Sağ tıkla yürüyebilirsin."}</li></ul>`,
    lh: () => `<ul class="howto">
      <li>Rakip dalga gelir, senin minyonların ve kulen onlara vurur. Minyonun canı <b>saldırı gücünün</b> altına inince ${TOUCH ? "dokun" : "üstüne tıkla (sol ya da sağ)"}: son vuruş senin.</li>
      <li>Minyonlar sırayla, aralarında 0,6–2,5 sn farkla ölür; erken vurursan sadece hasar verirsin ve saldırın beklemeye girer, geç kalırsan minyon kaçar.</li>
      <li>Normal ve Zor'da saldırın <b>gecikmeyle</b> iner; Zor'da kule de minyonlara büyük vuruş yapar.</li>
      <li>Kolay'da vurulabilir can sarı olur; Normal'da can çubuğunda çizgi var; Zor'da işaret yok. Saldırı gücü seçtiğin şampiyonun taban saldırı gücü + 8.</li></ul>` };
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
    $("#t-left").checked = S.left; stage.classList.toggle("aiming", S.mode === "aim");
  }
  function fillChamps() {
    const sel = $("#t-champ"), list = Object.keys(CH).sort((a, b) => cName(a).localeCompare(cName(b), "tr"));
    sel.innerHTML = list.map(s => `<option value="${s}"${s === S.champ ? " selected" : ""}>${cName(s)}</option>`).join("") || `<option value="ezreal">Ezreal</option>`;
    sel.addEventListener("change", () => { S.champ = sel.value; saveOpt(); champImg(S.champ); menu(); });
  }
  function bestTxt() { const v = readBest()[bestKey()]; if (v == null) return "Henüz skor yok."; return `En iyi: <b>${S.mode === "dodge" ? f2(v) + " sn" : S.mode === "aim" ? v + " puan" : v + " son vuruş"}</b>`; }
  function showStart() {
    panel.hidden = false; touchBar.hidden = true;
    panel.innerHTML = `<div class="t-box"><h2>${MODE_TR[S.mode]} · ${DIFF_TR[S.diff]}${S.mode !== "dodge" ? ` · ${S.len} sn` : ""}</h2>
      <p>${esc(cName(S.champ))} ile ${S.mode === "dodge" ? "rakip yeteneklerinden kaç; ne kadar dayanırsan skor o kadar yüksek." : S.mode === "aim" ? "hareket eden rakiplere Sihirli Ok ve Yıldız Yağmuru isabet ettir." : "dalgadaki minyonlara son vuruşu yap."}</p>
      <p>${bestTxt()}</p>
      <div class="btns"><button type="button" class="btn gold" data-act="start">Başla</button></div>
      <p class="small">${TOUCH ? "" : "<kbd>Boşluk</kbd> ile de başlar · <kbd>Esc</kbd> duraklatır"}</p></div>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  function showPause() {
    panel.hidden = false;
    panel.innerHTML = `<div class="t-box"><h2>Duraklatıldı</h2><div class="btns"><button type="button" class="btn gold" data-act="resume">Devam et</button><button type="button" class="btn" data-act="start">Baştan başla</button><button type="button" class="btn" data-act="menu">Çık</button></div></div>`;
    panel.querySelector("[data-act=resume]").focus();
  }
  function endGame() {
    const g = game; if (!g || g.over) return; g.over = true;
    const B = readBest(), k = bestKey(g.mode, g.diff, g.len); let val, stats;
    if (g.mode === "dodge") { val = +g.t.toFixed(2);
      stats = [["Hayatta kalma", f2(g.t) + " sn"], ["Kaçılan yetenek", g.dodged], ["Sıçra kullanımı", g.flashes || 0]]; }
    else if (g.mode === "aim") { val = g.score;
      stats = [["Skor", g.score], ["Q isabet", `${g.qHits} / ${g.qShots}`], ["İsabet oranı", g.qShots ? "%" + Math.round(g.qHits / g.qShots * 100) : "–"], ["Öngörülü isabet", g.lead],
        ["W isabet", `${g.wHits} (${g.wCasts} atış)`], ["Minyona takılan", g.blocked], ["Alınan rakip", g.kills], ["Ort. isabet mesafesi", g.qHits ? Math.round(g.dsum / g.qHits) : "–"]]; }
    else { val = g.cs; const tot = g.cs + g.missed, left = g.lefts.length ? g.lefts.reduce((a, b) => a + b, 0) / g.lefts.length : null;
      stats = [["Son vuruş", `${g.cs} / ${tot}`], ["Oran", tot ? "%" + Math.round(g.cs / tot * 100) : "–"], ["Erken vuruş", g.early], ["Kaçan minyon", g.missed], ["Ort. kalan can", left != null ? "%" + Math.round(left * 100) + " SG" : "–"]]; }
    const rec = B[k] == null || val > B[k]; if (rec && val > 0) { B[k] = val; writeBest(B); }
    panel.hidden = false; touchBar.hidden = true; cancelAnimationFrame(raf); raf = 0; draw(); updHud();
    panel.innerHTML = `<div class="t-box"><h2>${g.mode === "dodge" ? "Vuruldun" : "Süre doldu"}</h2>${rec && val > 0 ? '<p class="t-new">Yeni rekor!</p>' : `<p>${bestTxt()}</p>`}
      <div class="t-stats">${stats.map(([l, v]) => `<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>
      ${g.mode === "lh" ? '<p class="small">Ort. kalan can: son vuruşu yaptığında minyonda kalan canın saldırı gücüne oranı. Düşük = son ana kadar bekledin.</p>' : g.mode === "aim" ? '<p class="small">Öngörülü isabet: yana hareket eden rakibi, gideceği yere atarak vurdun.</p>' : ""}
      <div class="btns"><button type="button" class="btn gold" data-act="start">Tekrar</button><button type="button" class="btn" data-act="menu">Menü</button></div></div>`;
    panel.querySelector("[data-act=start]").focus();
    renderSide();
  }
  function start() {
    cancelAnimationFrame(raf); raf = 0; fx = []; nums = []; paused = false; armW = false;
    game = newGame(); mouse = { x:W / 2, y:H / 2 };
    panel.hidden = true; buildTouch(); touchBar.hidden = !TOUCH;
    updHud(); draw(); cv.focus({ preventScroll:true });
    const hb = document.querySelector("header.bar"), top = stage.getBoundingClientRect().top + scrollY - (hb ? hb.offsetHeight : 0) - 8;
    if (Math.abs(scrollY - top) > 4) scrollTo({ top, behavior:RM ? "auto" : "smooth" });
    startLoop();
  }
  function pause(on) {
    if (!game || game.over) return; paused = on;
    if (on) { cancelAnimationFrame(raf); raf = 0; showPause(); } else { panel.hidden = true; startLoop(); }
  }
  function menu() { cancelAnimationFrame(raf); raf = 0; game = null; paused = false; fx = []; nums = []; armW = false; resize(); updHud(); showStart(); }

  /* ---------- Giriş ---------- */
  cv.tabIndex = 0;
  cv.addEventListener("contextmenu", e => e.preventDefault());
  let drag = 0;
  function moveTo(g, w, mark = true) { g.p.tx = clampX(w.x, g.p.r); g.p.ty = clampY(w.y, g.p.r); if (mark) marker(g.p.tx, g.p.ty); }
  cv.addEventListener("pointerdown", e => {
    const g = game; if (!g || paused || g.over) return;
    const w = toWorld(e); mouse = w; const touch = e.pointerType !== "mouse";
    if (g.mode === "dodge") {
      if (touch || e.button === 2 || (e.button === 0 && S.left)) { moveTo(g, w); drag = 1; try { cv.setPointerCapture(e.pointerId); } catch {} }
    } else if (g.mode === "aim") {
      if (touch) { armW ? castW(w) : castQ(w); }
      else if (e.button === 2) { moveTo(g, w); drag = 1; try { cv.setPointerCapture(e.pointerId); } catch {} }
      else if (e.button === 0) armW ? castW(w) : castQ(w);
    } else if (touch || e.button === 0 || e.button === 2) attackLH(g, w, touch);
    e.preventDefault();
  });
  cv.addEventListener("pointermove", e => {
    const w = toWorld(e); mouse = w; const g = game;
    if (g && !paused && !g.over && drag && g.mode !== "lh" && (e.pointerType !== "mouse" || e.buttons)) moveTo(g, w, false);
  });
  const endDrag = () => { drag = 0; };
  cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);
  addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea" || tag === "select") return;
    const k = e.key.toLowerCase();
    if (e.key === "Escape") { if (armW) { armW = false; return; } if (game && !game.over) { pause(!paused); e.preventDefault(); } return; }
    if (game && !game.over && !paused) {
      if (k === "f") { doFlash(); e.preventDefault(); return; }
      if (k === "d" && game.mode === "dodge") { doGhost(); e.preventDefault(); return; }
      if (k === "q" && game.mode === "aim") { castQ(mouse); e.preventDefault(); return; }
      if (k === "w" && game.mode === "aim") { castW(mouse); e.preventDefault(); return; }
    }
    if (e.key === " " && !panel.hidden && tag !== "button") { e.preventDefault(); if (paused) pause(false); else start(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && game && !game.over && !paused) pause(true); });
  panel.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b) return;
    const a = b.dataset.act; if (a === "start") start(); else if (a === "resume") pause(false); else menu(); });
  touchBar.addEventListener("click", e => { const b = e.target.closest("[data-tk]"); if (!b) return; const k = b.dataset.tk;
    if (k === "F") doFlash(); else if (k === "D") doGhost(); else if (k === "W") { armW = !armW && game && game.wcd <= 0; syncTouch(); } else pause(true); });
  const segPick = (id, key, conv = v => v) => $(id).addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (!b) return;
    S[key] = conv(b.dataset.v); saveOpt(); renderSide(); menu(); });
  segPick("#t-mode", "mode"); segPick("#t-diff", "diff"); segPick("#t-len", "len", v => +v);
  $("#t-left").addEventListener("change", e => { S.left = e.target.checked; saveOpt(); renderSide(); });
  $("#t-reset").addEventListener("click", () => { if (confirm("Bu cihazdaki tüm antrenman skorları silinsin mi?")) { writeBest({}); renderSide(); if (!game) showStart(); } });
  addEventListener("resize", () => resize());

  // Tarayıcı testleri için küçük kanca (oyunu değiştirmez)
  window.RKTrain = { start, step:(dt) => { step(dt); draw(); updHud(); }, state:() => game, end:endGame, opt:S, flash:doFlash, ghost:doGhost, q:castQ, w:castW, menu };

  fillChamps(); champImg(S.champ); renderSide(); resize(); showStart();
})();
