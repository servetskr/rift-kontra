/* Rift Kontra — League of Legends (PC) uygulama kodu */
"use strict";

/* ===================================================================
 *  VERİ
 * =================================================================== */
const META = window.LOL_META || {};
const CHAMPS = window.LOL_CHAMPS || {};
const ITEMS = window.LOL_ITEMS || {};
const RUNES = window.LOL_RUNES || { st: {}, r: {}, sp: {} };
const AB = window.LOL_ABIL || {};
const STATS = (window.LOL_STATS || {}).rows || {};
const STATS_META = window.LOL_STATS || null;
const BUILDS = (window.LOL_BUILDS || {}).c || {};
const MU = window.LOL_MU || { top: {}, jg: {}, mid: {}, adc: {}, sup: {} };

const ROLE = { top: "Üst", jg: "Orman", mid: "Orta", adc: "Alt", sup: "Destek" };
const ROLE_LONG = { top: "Üst koridor", jg: "Orman", mid: "Orta koridor", adc: "Alt koridor", sup: "Destek" };
const DMG = { AD: "Fiziksel hasar", AP: "Büyü hasarı" };
const CAT = { fiz: "Fiziksel", buy: "Büyü", sav: "Savunma", des: "Destek", bot: "Çizmeler" };
const CAT_ALL = { ...CAT, bas: "Başlangıç", ara: "Ara eşyalar" };
const CLS_TR = { Fighter: "Dövüşçü", Tank: "Tank", Mage: "Büyücü", Assassin: "Suikastçı", Marksman: "Nişancı", Support: "Destek" };
const CLS_ROLE = { Marksman: "adc", Support: "sup", Mage: "mid", Assassin: "mid", Fighter: "top", Tank: "top" };

const key = s => (s || "").toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]/g, "");
const tierOf = wr => wr == null ? "?" : wr >= 52 ? "S" : wr >= 51 ? "A" : wr >= 49.5 ? "B" : wr >= 48 ? "C" : "D";
const MIN_PR = 0.5; // koridorda en az %0,5 seçilme: daha azı gürültü

/* Şampiyon listesi */
const CH = {}, LIST = [], BYSLUG = {};
for (const slug in CHAMPS) {
  const p = CHAMPS[slug], rs = STATS[slug] || {};
  const roles0 = Object.keys(rs).filter(r => ROLE[r] && rs[r][1] >= MIN_PR).sort((a, b) => rs[b][3] - rs[a][3]);
  const main = roles0[0] || Object.keys(rs).sort((a, b) => rs[b][3] - rs[a][3])[0] || CLS_ROLE[p.cls[0]] || "mid";
  const roles = [...new Set([main, ...roles0])];
  const c = {
    slug, name: p.n, disp: p.n, prof: p, roles, main, rs, b: p.b,
    dmg: p.b && p.b.t === "M" ? "AP" : "AD",
  };
  const m = rs[main]; c.wr = m ? m[0] : null; c.pr = m ? m[1] : null; c.br = m ? m[2] : null; c.games = m ? m[3] : 0; c.tier = tierOf(m && m[1] >= MIN_PR ? c.wr : null);
  CH[key(p.n)] = c; BYSLUG[slug] = c; LIST.push(c);
}
LIST.sort((a, b) => a.disp.localeCompare(b.disp, "tr"));

/* Eşyalar */
const IT = {}, ILIST = [];
for (const id in ITEMS) { const i = { id, ...ITEMS[id] }; IT[id] = i; ILIST.push(i); }
ILIST.sort((a, b) => a.c - b.c || a.n.localeCompare(b.n, "tr"));
const iname = id => IT[id] ? IT[id].n : "?";
const isBoot = id => IT[id] && IT[id].cat === "bot";

/* Yama değişiklikleri: v = buff | nerf | adj | rework | new */
const NOTES = META.notes || {}, CHG = NOTES.ch || {}, ICHG = NOTES.it || {};
const VMARK = { buff: ["▲", "Güçlendirildi"], nerf: ["▼", "Zayıflatıldı"], adj: ["⇅", "Dengelendi"], rework: ["⟳", "Yeniden tasarlandı"], new: ["★", "Yeni şampiyon"] };
const chgBadge = v => v && VMARK[v] ? `<i class="chg" data-v="${v}" title="${VMARK[v][1]}" aria-label="${VMARK[v][1]}">${VMARK[v][0]}</i>` : "";

/* Eşleşmeler: MU[koridor][şampiyon] = [[rakip, şampiyonun kazanma oranı, maç]] */
const MUX = {};
for (const r in MU) { MUX[r] = {}; for (const a in MU[r]) { const m = {}; for (const [b, w, g] of MU[r][a]) m[b] = [w, g]; MUX[r][a] = m; } }
/* me, en karşısında: kazanma oranı ve maç sayısı (yoksa null) */
function edge(me, en, role) {
  const a = MUX[role] && MUX[role][me.slug] && MUX[role][me.slug][en.slug]; if (a) return { wr: a[0], g: a[1] };
  const b = MUX[role] && MUX[role][en.slug] && MUX[role][en.slug][me.slug]; if (b) return { wr: 100 - b[0], g: b[1] };
  return null;
}
const EDGE_TXT = w => w >= 53.5 ? ["good", "Sert kontra"] : w >= 51.5 ? ["good", "Avantajlı"] : w > 48.5 ? ["even", "Dengeli"] : w > 46.5 ? ["bad", "Dezavantajlı"] : ["bad", "Kaçın"];
const boardRoles = c => c.roles.filter(r => MU[r] && MU[r][c.slug] && MU[r][c.slug].length);
const roleWR = (c, r) => c.rs[r] ? c.rs[r][0] : null;

/* ===================================================================
 *  UI YARDIMCILARI
 * =================================================================== */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const pct = v => v == null ? "–" : "%" + v.toFixed(1).replace(".", ",");
const n0 = v => Math.round(v).toLocaleString("tr-TR");
const dec = (v, d = 1) => String(+v.toFixed(d)).replace(".", ",");
function por(c, cls, noMark) {
  const src = c.prof && c.prof.p;
  const img = src ? `<img src="${src}" alt="" loading="lazy">` : `<span class="ini">${esc(c.disp.slice(0, 2))}</span>`;
  return `<span class="por${cls ? " " + cls : ""}">${img}${noMark ? "" : chgBadge(CHG[c.slug] && CHG[c.slug].v)}</span>`;
}
const tierB = c => `<span class="tier" data-t="${c.tier}" title="Kademe ${c.tier}">${c.tier}</span>`;
const roleB = r => `<span class="role" data-r="${r}">${ROLE[r]}</span>`;
const icoImg = (id, cls) => { const i = IT[id]; return i && i.img ? `<img class="${cls || "ico"}" src="${i.img}" alt="" loading="lazy">` : ""; };
const itile = (id, n) => { const i = IT[id]; if (!i) return ""; return `<button type="button" class="itile" data-item="${id}" title="${esc(i.n)}">${n ? `<span class="n">${n}</span>` : ""}<span class="ib">${i.img ? `<img src="${i.img}" alt="" loading="lazy">` : `<span class="ini">${esc(i.n.slice(0, 2))}</span>`}${chgBadge(ICHG[id] && ICHG[id].v)}</span><span class="nm">${esc(i.n)}</span></button>`; };
const champBtnAttrs = c => `data-go="s-${c.slug}"`;
const fmtDate = iso => { try { return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }); } catch { return iso; } };

/* ===================================================================
 *  SİMGELER — tek çizgi stili, emoji yok
 * =================================================================== */
const SV = {
  sword: '<path d="M14.5 3.5 20 3l-.5 5.5L9 19l-4-4z"/><path d="m5 15-2 2 4 4 2-2M13 7l4 4"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  wall: '<path d="M4 6h16v12H4zM4 12h16M9 6v6M15 12v6"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="m9 13 6 4"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>',
  spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  boot: '<path d="M7 3h5v8l6 3c1.5.7 2 2 2 3v2H4v-4l3-2z"/>',
  rune: '<path d="m12 3 7 9-7 9-7-9z"/><path d="m12 8 3 4-3 4-3-4z"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><path d="M16 5a3 3 0 0 1 0 6M18 14.5c1.8.7 3 2.6 3 5"/>',
  grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  scroll: '<path d="M7 4h11v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h11v1a3 3 0 0 0 3 3"/><path d="M7 4a2 2 0 0 0-2 2v10M10 8h5M10 12h5"/>',
  duel: '<path d="M5 3 15 13M3 5l2-2M13 15l-2 2 6 6 2-2zM19 3 9 13M21 5l-2-2M11 15l2 2-6 6-2-2z"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  wand: '<path d="m4 20 11-11M14 4v3M19 9h-3M17.5 5.5l-2 2M18 14v2M20 15h-4"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  reset: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  star: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
};
const ic = (n, cls) => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${SV[n] || ""}</svg>`;

/* ===================================================================
 *  SEÇİCİ PENCERELERİ
 * =================================================================== */
const ov = $("#ov"); let pickerCb = null, pickerRole = "all", lastFocus = null;
function openOv(html) { lastFocus = document.activeElement; ov.innerHTML = html; ov.hidden = false; document.body.style.overflow = "hidden"; }
function closeOv() { ov.hidden = true; ov.innerHTML = ""; document.body.style.overflow = ""; if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus(); }
function openPicker(title, cb, role) {
  pickerCb = cb; pickerRole = role || "all";
  openOv(`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><h3>${esc(title)}</h3><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="toolbar"><div class="seg sm" id="pk-roles">${[["all", "Tümü"], ...Object.entries(ROLE)].map(([k, v]) => `<button type="button" data-r="${k}" aria-pressed="${k === pickerRole}">${v}</button>`).join("")}</div>
    <input id="pk-q" type="search" placeholder="İsimle ara" aria-label="Şampiyon ara"></div>
    <div class="pgrid" id="pk-grid"></div></div>`);
  drawPicker(); setTimeout(() => { const q = $("#pk-q"); if (q && matchMedia("(pointer:fine)").matches) q.focus(); }, 30);
  $("#pk-q").addEventListener("input", drawPicker);
  $("#pk-roles").addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (!b) return; pickerRole = b.dataset.r; [...$("#pk-roles").children].forEach(x => x.setAttribute("aria-pressed", x === b)); drawPicker(); });
}
function drawPicker() {
  const q = key($("#pk-q").value);
  const rows = LIST.filter(c => (pickerRole === "all" || c.roles.includes(pickerRole)) && (!q || key(c.disp).includes(q) || key(c.prof.en).includes(q)));
  $("#pk-grid").innerHTML = rows.map(c => `<button class="pbtn" type="button" data-pick="${c.slug}">${por(c)}<span>${esc(c.disp)}</span></button>`).join("") || '<div class="empty">Bulunamadı.</div>';
}
ov.addEventListener("click", e => {
  if (e.target === ov || e.target.closest("[data-close]")) { const a = e.target.closest("a[data-close]"); closeOv(); if (a) location.hash = a.getAttribute("href"); return; }
  const p = e.target.closest("[data-pick]"); if (p) { const cb = pickerCb; closeOv(); cb && cb(BYSLUG[p.dataset.pick]); }
});
ov.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "pk-q") { const f = ov.querySelector("[data-pick]"); if (f) f.click(); } });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !ov.hidden) closeOv(); });

/* Genel tıklama: profile git, eşya göster */
document.addEventListener("click", e => {
  const g = e.target.closest("main [data-go]"); if (g) { location.hash = g.dataset.go; return; }
  const ch = e.target.closest("[data-chg]"); if (ch) { showChange(ch.dataset.chg); return; }
  const it = e.target.closest("main [data-item], .sheet [data-item]"); if (it) showItem(it.dataset.item);
});

/* Yama değişikliği satırı: "Ad: eski → yeni" → işaretli, sade gösterim */
const SLOT_S = { P: "P", Q: "Q", W: "W", E: "E", R: "R" };
function lineHTML([t, d]) {
  const ci = t.indexOf(":"), name = ci > 0 && ci < 110 ? t.slice(0, ci) : "", rest = name ? t.slice(ci + 1) : t, ar = rest.split("→");
  const sym = d > 0 ? "▲" : d < 0 ? "▼" : "⇅", cls = d > 0 ? "good" : d < 0 ? "bad" : "even";
  const val = ar.length === 2 ? `<span class="old">${esc(ar[0].trim())}</span><span class="to">→</span><b class="new">${esc(ar[1].trim())}</b>` : esc(rest.trim());
  return `<li class="ln ${cls}"><i>${sym}</i><span>${name ? `<span class="lk">${esc(name)}</span> ` : ""}${val}</span></li>`;
}
function changeBody(ch) {
  if (!ch) return "";
  if (ch.v === "new" && !ch.c.length) return '<p class="muted small" style="margin:0">Bu yamada oyuna eklendi.</p>';
  return `<div class="chparts">${ch.c.map(([name, slot, icon, lines]) => `<div class="chp">
      <span class="chico">${icon ? `<img src="${icon}" alt="" loading="lazy">` : `<svg viewBox="0 0 24 24" aria-hidden="true">${SV.chart.replace("<path", '<path fill="none" stroke="currentColor" stroke-width="2"')}</svg>`}${slot ? `<span class="sk">${esc(SLOT_S[slot] || slot)}</span>` : ""}</span>
      <div style="min-width:0"><div class="chn">${esc(name || "Genel")}</div><ul class="lns">${lines.map(lineHTML).join("")}</ul></div></div>`).join("")}</div>
    ${ch.s ? `<details class="why"><summary>Riot neden değiştirdi?</summary><p>${esc(ch.s)}</p></details>` : ""}`;
}
const vPill = v => VMARK[v] ? `<span class="vpill" data-v="${v}">${VMARK[v][0]} ${VMARK[v][1]}</span>` : "";
function showChange(slug) {
  const c = BYSLUG[slug], ch = CHG[slug]; if (!c || !ch) return;
  openOv(`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(c.disp)} değişiklikleri" style="width:min(560px,100%)">
    <div class="sheet-head">${por(c, "sm", true)}<div style="min-width:0;flex:1"><h3 style="margin:0">${esc(c.disp)}</h3>${vPill(ch.v)}</div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    ${changeBody(ch)}
    <div class="row"><a class="btn gold" href="#s-${c.slug}" data-close>Profili aç</a><span class="muted small">Yama ${esc(NOTES.patch || "")}</span></div></div>`);
  ov.querySelector("[data-close]").focus();
}

/* ===================================================================
 *  BUILD GÖRÜNÜMÜ (u.gg, Dünya Zümrüt+)
 * =================================================================== */
const VAR = { pop: ["users", "En çok tercih edilen"], win: ["trophy", "En yüksek kazanma"], high: ["star", "Master+ oyuncular"] };
const runeImg = (id, cls) => { const r = RUNES.r[id] || RUNES.st[id]; return r && r[1] ? `<img class="${cls || ""}" src="${r[1]}" alt="${esc(r[0])}" title="${esc(r[0])}${r[4] ? " — " + esc(r[4]) : ""}" loading="lazy">` : ""; };
const spellImg = id => { const s = RUNES.sp[id]; return s && s[1] ? `<img class="spi" src="${s[1]}" alt="${esc(s[0])}" title="${esc(s[0])}" loading="lazy">` : ""; };
function skillOrderHTML(so, mx) {
  if (!so) return "";
  const rows = ["Q", "W", "E", "R"];
  return `<div class="sko" role="img" aria-label="Yetenek sırası: ${esc((mx || "").split("").join(" > "))}">
    <div class="sko-mx">${(mx || "").split("").map((k, i) => `<b>${k}</b>${i < mx.length - 1 ? '<span>›</span>' : ""}`).join("")}</div>
    <div class="sko-grid">${rows.map(k => `<div class="sko-row"><span class="sk-k">${k}</span>${so.split("").slice(0, 18).map((x, i) => `<i class="${x === k ? "on" + (k === "R" ? " r" : "") : ""}" title="Seviye ${i + 1}">${x === k ? i + 1 : ""}</i>`).join("")}</div>`).join("")}</div></div>`;
}
let bRole = null, bVar = 0;
/* Profil build kartı: koridor → oyuncu buildleri (u.gg) + tarz buildleri; her biri kendi rünüyle; rol kuralları uygulanmış */
function buildCard(c) {
  const roles = rolesOf(c); if (!roles.includes(bRole)) bRole = roles.includes(c.main) ? c.main : roles[0];
  const R = (BUILDS[c.slug] || {})[bRole];
  const P = presetsFor(c, bRole).filter(p => !p.gen);
  if (!P.length) return `<div class="empty">Bu şampiyon için build verisi henüz yok (u.gg).</div>`;
  if (!P[bVar]) bVar = 0; const V = P[bVar];
  const kind = kindOf(c), defPool = (kind === "tank" || kind === "sup") ? STY.tank.pool : (DEF_EXTRA[kind] || []);
  const vsM = defPool.filter(id => isMrOnly(id) || (istat(id).mr > 0 && !(istat(id).armor > 0))).slice(0, 4), vsP = defPool.filter(isArmorOnly).slice(0, 4);
  const boot = V.items.find(isBoot), ru = V.ru || [];
  const groups = [...new Set(P.map(p => p.grp))];
  return `${roles.length > 1 ? `<div class="seg sm" style="margin-bottom:10px">${roles.map(r => `<button type="button" data-br="${r}" aria-pressed="${r === bRole}">${ROLE_LONG[r]}</button>`).join("")}</div>` : ""}
    ${groups.length > 1 ? `<div class="vtabs grps" role="tablist" aria-label="Oyun tarzı">${groups.map(g => { const i = P.findIndex(p => p.grp === g); return `<button type="button" role="tab" data-bv="${i}" aria-selected="${g === V.grp}">${ic(STY[g] ? STY[g].ic : "sword")}${esc(P[i].grpLbl)}</button>`; }).join("")}</div>` : ""}
    <div class="vtabs" role="tablist" aria-label="Build">${P.map((p, i) => p.grp !== V.grp ? "" : `<button type="button" role="tab" data-bv="${i}" aria-selected="${i === bVar}">${ic(p.ic)}${esc(p.lbl)}${p.wr != null ? ` <small>${pct(p.wr)}</small>` : ""}</button>`).join("")}</div>
    <p class="muted small" style="margin:0 0 10px">${esc(ROLE_LONG[bRole])}${R ? ` · ${n0(R.g)} maç · kazanma ${pct(R.wr)}` : ""} · <b>${esc(V.grpLbl)} · ${esc(V.lbl)}</b> · ${esc(V.sub)}</p>
    ${V.start && V.start.length ? `<div class="brow2"><span class="l" title="Başlangıç">Başla</span><div class="irow">${V.start.map(id => itile(id)).join("")}</div></div>` : ""}
    <div class="brow2"><span class="l" title="Eşya sırası">Build</span><div class="irow">${V.items.filter(x => !isBoot(x)).map((id, i) => itile(id, i + 1)).join('<span class="arrow" aria-hidden="true">›</span>')}${bRole === "sup" && V.after ? `<span class="sellk" title="Build dolunca destek eşyasını sat, yerine bunu al">Satınca</span>${itile(V.after)}` : ""}</div></div>
    <div class="bsub">
      ${boot ? `<div><span class="l" title="Çizme">${ic("boot")}</span>${itile(boot)}</div>` : ""}
      ${ru.length ? `<div class="runes"><span class="l" title="Rünler">${ic("rune")}</span>${runeImg(ru[0], "ks")}<span class="minor">${ru.slice(1, 4).map(n => runeImg(n)).join("")}</span><span class="minor sec">${ru.slice(4, 6).map(n => runeImg(n)).join("")}</span><span class="rn">${esc((RUNES.r[ru[0]] || [""])[0])}${V.ruSrc ? `<small class="muted">${esc(V.ruSrc)}</small>` : ""}</span></div>` : ""}
      ${V.sp && V.sp.length ? `<div class="spells"><span class="l" title="Sihirdar büyüleri">${ic("spark")}</span>${V.sp.map(spellImg).join("")}<span class="small">${esc(V.sp.map(s => (RUNES.sp[s] || [""])[0]).join(" + "))}</span></div>` : ""}
    </div>
    ${bRole === "sup" ? supPath(V.items, null) : ""}
    <p class="muted small" style="margin:8px 0 0">${ic("info")} ${bRole === "adc" ? "Alt koridor rol görevi çizmeye ayrı yuva açar: çizme + 6 eşya." : bRole === "mid" ? "Orta koridor rol görevi çizmeyi gelişmiş (3. kademe) çizmeye yükseltir; çizme + 5 eşya." : bRole === "sup" ? "Destek eşyası yalnızca destek rolünde alınır; çizme + 5 eşya." : "Çizme + 5 eşya; gelişmiş çizmeler yalnızca orta koridorda."} Aynı gruptan tek eşya alınabilir (ör. tek zırh delme, tek can simidi, tek Hydra).</p>
    ${R && R.so ? `<h3 class="h3">Yetenek sırası</h3>${skillOrderHTML(R.so, R.mx)}` : ""}
    ${vsM.length || vsP.length ? `<h3 class="h3">Karşı takıma göre savunma</h3><div class="irow">${vsM.map(id => itile(id)).join("")}<span class="muted small" style="align-self:center">← çoğu büyü hasarıysa</span></div><div class="irow" style="margin-top:6px">${vsP.map(id => itile(id)).join("")}<span class="muted small" style="align-self:center">← çoğu fiziksel hasarsa</span></div>` : ""}
    ${R && R.sit && R.sit.length ? `<h3 class="h3">Duruma göre</h3><div class="irow">${arrange(R.sit, c, bRole).map(id => itile(id)).join("")}</div>` : ""}`;
}
/* ===================================================================
 *  DÜELLO MOTORU — saniye saniye dövüş simülasyonu
 *  LoL taban değerleri (LoL Wiki), eşya sayıları (Data Dragon), yetenek hasarları, oranlar,
 *  bekleme süreleri, kalkanlar ve kitle kontrolü süreleri (LoL Wiki). 0. saniyede iki taraf da
 *  hazır yeteneklerini atar; kitle kontrolü altındaki taraf saldıramaz/yetenek kullanamaz,
 *  kalkanlar hasarı emer. Menzil, hareket, kaçma, iyileştirme yetenekleri, eşya ve rün pasifleri
 *  (bazıları hariç) hesaba katılmaz.
 * =================================================================== */
const STAT_TR = { hp: "Can", ad: "Saldırı Gücü", ap: "Yetenek Gücü", armor: "Zırh", mr: "Büyü Direnci", as: "Saldırı Hızı", crit: "Kritik Vuruş İhtimali", critdmg: "Kritik Vuruş Hasarı",
  ah: "Yetenek Hızı", leth: "Zırh Deşme", armpen: "Zırh Delme", mpen: "Büyü Nüfuzu", mpenp: "Büyü Nüfuzu", ls: "Can Çalma", ov: "Mutlak Sömürü", ms: "Hareket Hızı", msp: "Hareket Hızı",
  mana: "Mana", mp5: "Taban Mana Yenilenmesi", hp5: "Taban Can Yenilenmesi", hsp: "İyileştirme ve Kalkan Gücü", ten: "Sıvışma" };
const PCT_STATS = new Set(["as", "crit", "critdmg", "armpen", "mpenp", "ls", "ov", "msp", "mp5", "hp5", "hsp", "ten"]);
const fmtStat = (k, v) => `${PCT_STATS.has(k) ? "%" : "+"}${String(v).replace(".", ",")} ${STAT_TR[k] || k}`;
const grow = L => (L - 1) * (0.7025 + 0.0175 * (L - 1));   // LoL seviye büyüme eğrisi
/* Çarpan etkili birkaç bilinen pasif (açıklamadaki yüzde okunur) */
const AP_AMP = (() => { const i = Object.values(IT).find(x => /Rabadon/.test(x.en)); if (!i) return null; const m = (i.fx || "").match(/%\s*(\d+)/); return { id: i.id, k: m ? +m[1] / 100 : 0.3 }; })();
function fstats(f) {
  const b = f.c.b; if (!b) return null;
  const L = f.lvl, g = grow(L);
  const s = { hp: b.hp + b.hpL * g, ar: b.ar + b.arL * g, mr: b.mr + b.mrL * g, ad: b.ad + b.adL * g, bad: 0, bhp: 0, ap: 0, asB: b.asL * g, crit: 0, critMul: 1.75,
    leth: 0, arpen: 0, mpenF: 0, mpen: 0, ls: 0, ov: 0, ah: 0, ten: 0, lvl: L, rng: b.rng, melee: b.rng < 300, t: b.t };
  s.baseAr = s.ar; s.baseMr = s.mr;
  for (const id of f.items) { if (!id || !IT[id]) continue; const x = IT[id].s || {};
    s.hp += x.hp || 0; s.bhp += x.hp || 0; s.ar += x.armor || 0; s.mr += x.mr || 0; s.ad += x.ad || 0; s.bad += x.ad || 0; s.ap += x.ap || 0; s.asB += x.as || 0; s.crit += x.crit || 0;
    s.critMul += (x.critdmg || 0) / 100; s.leth += x.leth || 0; s.arpen += x.armpen || 0; s.mpenF += x.mpen || 0; s.mpen += x.mpenp || 0; s.ls += x.ls || 0; s.ov += x.ov || 0; s.ah += x.ah || 0;
    s.ten = 1 - (1 - s.ten) * (1 - (x.ten || 0) / 100); }
  if (AP_AMP && f.items.includes(AP_AMP.id)) s.ap *= 1 + AP_AMP.k;
  s.as = Math.min(2.5, b.as + b.asR * s.asB / 100); s.crit = Math.min(100, s.crit) / 100;
  s.arpen = Math.min(60, s.arpen); s.mpen = Math.min(60, s.mpen);
  return s;
}
const mulOf = (a, d, type) => type === "T" ? 1 : type === "M" ? 100 / (100 + Math.max(0, d.mr * (1 - a.mpen / 100) - a.mpenF)) : 100 / (100 + Math.max(0, d.ar * (1 - a.arpen / 100) - a.leth));
/* Yetenek kademesi: oyuncuların gerçek yetenek sırası (u.gg) ya da genel sıra; temel 5, ulti 3 kademe (6/11/16) */
function skillOrder(c) {
  const b = BUILDS[c.slug]; const R = b && (b[c.main] || Object.values(b)[0]);
  if (R && R.so && R.so.length >= 15) return (R.so + "QWE".repeat(3)).slice(0, 18);
  const mx = (R && R.mx) || "QWE"; const out = []; const cnt = { Q: 0, W: 0, E: 0, R: 0 };
  for (let L = 1; L <= 18; L++) {
    if (L === 6 || L === 11 || L === 16) { out.push("R"); cnt.R++; continue; }
    const k = L <= 3 ? mx[L - 1] : mx.split("").find(x => cnt[x] < 5) || "Q"; out.push(k); cnt[k]++;
  }
  return out.join("");
}
const rankAt = (so, slot, L) => so.slice(0, L).split("").filter(x => x === slot).length;
const atRank = (v, rank) => Array.isArray(v) ? v[Math.max(0, Math.min(v.length, rank) - 1)] : (v || 0);
const SLOTS_AB = ["q", "w", "e", "r"];
function valueOf(base, rt, rank, a, d) {
  const L = a.lvl;
  const bv = base.lvl ? base.lvl[0] + (base.lvl[1] - base.lvl[0]) * (L - 1) / 17 : atRank(base.r, rank);
  return bv + atRank(rt.ap, rank) / 100 * a.ap + atRank(rt.ad, rank) / 100 * a.ad + atRank(rt.bad, rank) / 100 * a.bad
    + atRank(rt.thp, rank) / 100 * (d ? d.hp : 0) + atRank(rt.mhp, rank) / 100 * a.hp + atRank(rt.bhp, rank) / 100 * a.bhp
    + atRank(rt.arm, rank) / 100 * a.ar + atRank(rt.mr, rank) / 100 * a.mr;
}
function abilities(c, a, d) {
  const A = AB[c.slug] || {}, out = [], so = skillOrder(c);
  for (const slot of SLOTS_AB) {
    const x = A[slot]; if (!x) continue;
    const rank = rankAt(so, slot.toUpperCase(), a.lvl); if (!rank) continue;
    let dmg = 0, type = null, dot = 0;
    if (x.d && x.d.length) { const [b, t, r, dur, k] = x.d[0]; dmg = valueOf(b, r, rank, a, d) * (k != null ? k : (dur || 1)); dot = dur || 0; type = t || a.t; }
    const sh = x.sh ? valueOf(x.sh[0], x.sh[1], rank, a, null) : 0;
    const cc = x.cc ? { k: x.cc[0], d: atRank(x.cc[1], rank) } : null;
    if (!(dmg > 0) && !(sh > 0) && !cc) continue;
    const cdRaw = x.cd ? atRank(x.cd, rank) : (slot === "r" ? 100 : 8);
    const cd = Math.max(slot === "r" ? 20 : 2.5, cdRaw) * 100 / (100 + a.ah);
    out.push({ slot, rank, raw: Math.max(0, dmg), dot, type: type || a.t, mul: mulOf(a, d, type || a.t), cd, sh, shDur: x.sh ? x.sh[2] || 2.5 : 0, cc });
  }
  return out;
}
/* Yetenek verisi olmayan şampiyonlar için ortalama yetenek hasarı */
const AB_FALLBACK = (a, d) => [{ slot: "x", raw: ((12 + 9 * a.lvl) + 0.35 * a.bad + 0.45 * a.ap) * 3.2, type: a.t, mul: mulOf(a, d, a.t), cd: 5, sh: 0, cc: null }];
const CC_TR = { hard: "sersemledi", air: "havaya kalktı", root: "sabitlendi", silence: "susturuldu" };
function fightSim(me, en) {
  const sm = fstats(me), se = fstats(en); if (!sm || !se) return null;
  const mk = (f, s, o) => {
    let abs = abilities(f.c, s, o); const real = !!AB[f.c.slug] && abs.some(x => x.raw > 0);
    if (!real) abs = [...abs.filter(x => x.raw <= 0), ...AB_FALLBACK(s, o)];
    const A = AB[f.c.slug] || {};
    const psh = A.i && A.i.sh ? valueOf(A.i.sh[0], A.i.sh[1], 1, s, null) : 0;
    return { s, hp: s.hp, max: s.hp, abs, real, cds: abs.map(() => 0), aaT: 0, aaInt: 1 / s.as,
      aaHit: s.ad * (1 + s.crit * (s.critMul - 1)) * mulOf(s, o, "P"), dAA: 0, dAB: 0, byT: {}, absorbed: 0,
      shields: psh > 0 ? [{ v: psh, until: A.i.sh[2] || 99 }] : [], dots: [], hardUntil: 0, silUntil: 0, rootUntil: 0, ccTime: 0, ccEvents: [] };
  };
  const A = mk(me, sm, se), B = mk(en, se, sm);
  const shTot = X => X.shields.reduce((a, x) => a + x.v, 0);
  const dt = 0.05, T = 30; let t = 0, step = 0;
  const tl = [[0, 1, 1, shTot(A) / A.max, shTot(B) / B.max, 0, 0]];
  const act = (X, O) => {
    const out = { aa: 0, ab: 0, cc: [], dots: [] };
    const hard = t < X.hardUntil - 1e-9, sil = t < X.silUntil - 1e-9;
    if (!hard && !sil) X.abs.forEach((x, i) => {
      if (X.cds[i] > 0) return;
      if (x.raw > 0) { X.byT[x.type] = (X.byT[x.type] || 0) + x.raw * x.mul; if (x.dot > 0) out.dots.push({ ps: x.raw * x.mul / x.dot, until: t + x.dot }); else out.ab += x.raw * x.mul; }
      if (x.sh > 0) X.shields.push({ v: x.sh, until: t + x.shDur });
      if (x.cc) out.cc.push(x.cc);
      X.cds[i] = x.cd;
    });
    const rootedMelee = X.s.melee && !O.s.melee && t < X.rootUntil - 1e-9;
    if (!hard && !rootedMelee && X.aaT <= 0) { out.aa = X.aaHit; X.aaT = X.aaInt; X.byT.P = (X.byT.P || 0) + X.aaHit; }
    X.cds = X.cds.map(v => v - dt); X.aaT -= dt;
    // süreye yayılan hasar (yanma, alan etkisi, kanalize ultiler): rakibin üzerindeki etkiler
    O.dots.push(...out.dots); O.dots = O.dots.filter(z => z.until > t);
    for (const z of O.dots) out.ab += z.ps * Math.min(dt, z.until - t);
    X.dAA += out.aa; X.dAB += out.ab;
    return out;
  };
  const hit = (X, dmg) => {
    X.shields = X.shields.filter(s => s.until > t && s.v > 0);
    for (const s of X.shields) { const k = Math.min(s.v, dmg); s.v -= k; dmg -= k; X.absorbed += k; if (dmg <= 0) break; }
    X.hp -= dmg;
  };
  const applyCC = (X, list) => {
    for (const c of list) {
      const dur = c.k === "air" ? c.d : c.d * (1 - X.s.ten);
      if (c.k === "hard" || c.k === "air") { X.hardUntil = Math.max(X.hardUntil, t + dur); X.ccTime += dur; }
      else if (c.k === "silence") X.silUntil = Math.max(X.silUntil, t + dur);
      else if (c.k === "root") X.rootUntil = Math.max(X.rootUntil, t + dur);
      X.ccEvents.push([t, c.k, dur]);
    }
  };
  while (t < T && A.hp > 0 && B.hp > 0) {
    const ha = act(A, B), hb = act(B, A);
    hit(B, ha.aa + ha.ab); hit(A, hb.aa + hb.ab);
    applyCC(B, ha.cc); applyCC(A, hb.cc);
    if (A.hp > 0) A.hp = Math.min(A.max, A.hp + ha.aa * A.s.ls / 100 + (ha.aa + ha.ab) * A.s.ov / 100);
    if (B.hp > 0) B.hp = Math.min(B.max, B.hp + hb.aa * B.s.ls / 100 + (hb.aa + hb.ab) * B.s.ov / 100);
    t += dt; step++;
    if (step % 3 === 0) { A.shields = A.shields.filter(s => s.until > t && s.v > 0); B.shields = B.shields.filter(s => s.until > t && s.v > 0);
      tl.push([t, Math.max(0, A.hp / A.max), Math.max(0, B.hp / B.max), shTot(A) / A.max, shTot(B) / B.max, t < A.hardUntil ? 1 : t < A.rootUntil || t < A.silUntil ? 2 : 0, t < B.hardUntil ? 1 : t < B.rootUntil || t < B.silUntil ? 2 : 0]); }
  }
  tl.push([t, Math.max(0, A.hp / A.max), Math.max(0, B.hp / B.max), 0, 0, 0, 0]);
  // 30 sn'de iki taraf da ayaktaysa kalan canı ortalama hasar hızıyla tahmin et
  const dps = X => (X.dAA + X.dAB) / Math.max(t, dt);
  const ttkMe = B.hp <= 0 ? t : t + B.hp / Math.max(1, dps(A));
  const ttkEn = A.hp <= 0 ? t : t + A.hp / Math.max(1, dps(B));
  return { sm, se, A, B, tl, ttkMe, ttkEn, abShareMe: A.dAB / Math.max(1, A.dAA + A.dAB), realMe: A.real, realEn: B.real };
}
// koridor eşleşmesi yalnızca iki taraf aynı koridordaysa anlamlı
const matchRole = (me, en) => me.role && me.role === en.role ? me.role : null;
function simulate(me, en) {
  const F = fightSim(me, en); if (!F) return null;
  const { sm, se, ttkMe, ttkEn } = F;
  const r = ttkEn / ttkMe, stat = r / (1 + r);
  const lane = matchRole(me, en);
  const e = lane ? edge(me.c, en.c, lane) : null, role = lane || en.role || en.c.main;
  // gerçek maç verisi (koridor eşleşmesi) simülasyondan daha güvenilir: yarı yarıya
  const real = e ? Math.min(0.95, Math.max(0.05, 0.5 + (e.wr - 50) * 0.03)) : null;
  const score = real != null ? 0.5 * stat + 0.5 * real : stat;
  const passMe = mulOf(sm, se, sm.t), passEn = mulOf(se, sm, se.t);
  return { ...F, score, edge: e, role, passMe, ehpMe: sm.hp / passEn };
}

/* ===================================================================
 *  EŞYA VE ROL KURALLARI
 *  - Aynı gruptan tek eşya (wiki "itemlimit": Fatality = zırh delme, Lifeline, Spellblade, Hydra, Stasis…)
 *  - Tek çizme; gelişmiş (3. kademe) çizmeler yalnızca orta koridorun rol görevi ödülü
 *  - Alt koridor (nişancı) rol görevi: çizmeye ayrı yuva → çizme + 6 eşya; diğer roller çizme + 5 eşya
 *  - Destek eşyası (Dünya Atlası yükseltmeleri) yalnızca destek; menzilli eşyalar yalnızca menzilli şampiyon
 * =================================================================== */
const GRP_TR = { fatality: "zırh delme", blight: "büyü delme", lifeline: "can simidi", spellblade: "Büyülü Kılıç", hydra: "Hydra", stasis: "durağanlık",
  annul: "büyü kalkanı", immolate: "yakma", eternity: "Ebediyet", momentum: "ivme", manaflow: "mana akışı", quicksilver: "Cıva", glory: "Şan", starter: "destek / başlangıç" };
const igrp = id => (IT[id] && IT[id].g) || [];
const isT3Boot = id => isBoot(id) && (IT[id].from || []).some(f => isBoot(f) && f !== "1001");
const isSupItem = id => IT[id] && IT[id].tier === "fin" && igrp(id).includes("starter");
const slotsOf = role => role === "adc" ? 7 : 6;
function blockOf(f, id, slot) {
  const others = f.items.filter((x, i) => x && i !== slot);
  if (others.includes(id)) return "Zaten takılı";
  if (isBoot(id) && others.some(isBoot)) return "Yalnızca bir çizme taşınabilir";
  if (isT3Boot(id) && f.role !== "mid") return "Gelişmiş çizmeler yalnızca orta koridorun ödülü";
  if (isSupItem(id) && f.role !== "sup") return "Destek eşyası yalnızca destek rolünde";
  if (IT[id] && IT[id].ro && f.c.b && f.c.b.rng < 300) return "Yalnızca menzilli şampiyonlar alabilir";
  for (const g of igrp(id)) { const x = others.find(o => igrp(o).includes(g)); if (x) return `${iname(x)} ile birlikte alınamaz (tek ${GRP_TR[g] || g})`; }
  if (!isBoot(id) && others.filter(x => !isBoot(x)).length >= slotsOf(f.role) - 1) return `Bu rolde en fazla ${slotsOf(f.role) - 1} eşya + çizme`;
  return null;
}
/* Sıralı listeyi kurala uydurur: çakışanları atar, gelişmiş çizmeyi orta dışı rollerde 2. kademeye indirir, çizme sonda */
function arrange(items, c, role) {
  const f = { c, role, items: [] };
  for (let id of items) {
    if (!id || !IT[id]) continue;
    if (isT3Boot(id) && role !== "mid") id = (IT[id].from || []).find(isBoot) || id;
    if (!blockOf(f, id, -1)) f.items.push(id);
  }
  const boot = f.items.find(isBoot), rest = f.items.filter(x => !isBoot(x)).slice(0, slotsOf(role) - 1);
  return boot ? [...rest, boot] : rest;
}
/* Seviyeye uygun eşya sayısı: 11. seviyede genelde 3 eşya + çizme */
const itemsForLevel = (items, L, role) => {
  const boot = items.find(isBoot), rest = items.filter(id => id && !isBoot(id));
  const k = L <= 3 ? 0 : L <= 6 ? 1 : L <= 9 ? 2 : L <= 12 ? 3 : L <= 15 ? 4 : L <= 17 || role !== "adc" ? 5 : 6;
  return [...rest.slice(0, k), L >= 4 ? boot : null].filter(Boolean);
};

/* ===================================================================
 *  OYUN TARZLARI VE HAZIR BUILDLER
 *  - Koridor buildleri: u.gg (en çok tercih, en çok kazanan, Master+). Şampiyonun o koridorda
 *    verisi yoksa en çok oynandığı koridorun buildi koridor kurallarına göre uyarlanır.
 *  - Tarz buildleri: şampiyonun gerçekten oynandığı tarzlar (oyuncu verisi, sınıf, yetenek oranları).
 *    Ör. Malphite: Tank + Büyücü; Yasuo: Kritik + Off-tank. Suikastçı Malphite gibi tarzlar eklenmez.
 *  - Bu rakibe göre: ilk 2 eşya üstteki buildden, kalanlar düello rakibine karşı seçilir.
 * =================================================================== */
const ROLE_ORDER = ["top", "jg", "mid", "adc", "sup"];
const rolesOf = c => { const b = BUILDS[c.slug]; const have = b ? Object.keys(b) : []; const rs = [...new Set([...c.roles, ...ROLE_ORDER])].filter(r => have.includes(r)); return rs.length ? rs : [c.main]; };
const hasData = (c, r) => !!(BUILDS[c.slug] && BUILDS[c.slug][r]);
const kindOf = c => { const cls = (c.prof.cls || [])[0];
  if (cls === "Tank") return "tank"; if (cls === "Support") return c.dmg === "AP" ? "sup" : "tank";
  if (cls === "Marksman") return "adr"; return c.dmg === "AP" ? "ap" : "adm"; };
const have = l => l.filter(id => IT[id]);
const isMelee = c => !!(c.b && c.b.rng < 300);
/* Eşya türü (sayılarından): crit · leth (ölümcüllük) · brz (SG + dayanıklılık) · ad · ap · apt (YG + dayanıklılık) · ench (koruyucu destek) · tank · sup (destek eşyası) */
const ENCH = new Set(have(["3504", "6616", "6617", "6620", "3107", "3222", "2065", "4005", "6621", "2526"]));
function ITYPE(id) {
  const i = IT[id]; if (!i) return "?"; if (isBoot(id)) return "boot"; if (igrp(id).includes("starter")) return "sup"; if (ENCH.has(id)) return "ench";
  const s = i.s || {};
  if (s.crit) return "crit"; if (s.leth) return "leth"; if (s.ap) return (s.hp || s.armor || s.mr) ? "apt" : "ap";
  if (s.ad && (s.hp || s.armor || s.mr)) return "brz"; if (s.ad || s.as) return "ad"; if (s.hp || s.armor || s.mr) return "tank"; return "?";
}
const STY = {
  crit: { lbl: "Kritik", ic: "sword", boots: "3006", sub: "Kritik vuruş ve saldırı hızı: tam hasar",
    pool: have(["3031", "6673", "3036", "6675", "3046", "3095", "3094", "3072", "3033", "3508", "6676", "2512", "3085", "2523", "3026", "3139", "6672", "3153"]) },
  leth: { lbl: "Ölümcüllük", ic: "target", boots: "3158", sub: "Zırh deşme ile patlama hasarı",
    pool: have(["3142", "6695", "6696", "6697", "6698", "3179", "2520", "3814", "6699", "6676", "6694", "3156", "6333", "3026"]) },
  brz: { lbl: "Dövüşçü", ic: "sword", boots: "3047", sub: "Saldırı gücü + can: uzun dövüş",
    pool: have(["3078", "6610", "3071", "3161", "3053", "6333", "3156", "3748", "6631", "3073", "2501", "3181", "6609", "3074", "3065", "2517", "6692"]) },
  offtank: { lbl: "Off-tank", ic: "shield", sub: "2 hasar eşyası, kalanı dayanıklılık: hem vurur hem dayanır" },
  tank: { lbl: "Tank", ic: "shield", boots: "3047", sub: "Can, zırh ve büyü direnci: ön saf",
    pool: have(["3068", "6664", "3075", "2504", "3143", "4401", "3742", "3110", "6665", "3065", "3083", "3084", "2502", "6662", "8020", "3119", "2525"]) },
  ap: { lbl: "Büyücü (AP)", ic: "spark", boots: "3020", sub: "Yetenek gücü: patlama hasarı",
    pool: have(["3118", "6655", "4645", "3089", "3135", "3157", "3102", "3100", "4646", "3137", "2503", "3003", "4628", "2522", "3115", "3165", "3116", "6653", "4633"]) },
  apt: { lbl: "AP dövüşçü", ic: "spark", boots: "3111", sub: "Yetenek gücü + can: uzun dövüş",
    pool: have(["4633", "6653", "3152", "3116", "8010", "3157", "3102", "6657", "3165", "8020", "4629", "2510", "3089", "3135"]) },
  ench: { lbl: "Koruyucu", ic: "heart", boots: "3158", sub: "İyileştirme ve kalkan: takımı korur",
    pool: have(["3504", "6616", "6617", "6620", "3107", "3222", "2065", "4005", "6621", "3190", "3109"]) },
};
const STY_ORDER = ["crit", "leth", "brz", "ap", "apt", "ench", "tank", "offtank"];
const RANGED_ONLY_FEEL = new Set(["3094", "3085", "2523"]); // menzilli nişancı eşyaları: yakın dövüşçüye önerme
/* Bir eşya listesinin baskın tarzı */
function styleOfItems(items) {
  // kritik eşyaları buildi tanımlar (1,5 sayılır); saf SG/saldırı hızı eşyaları tarz belirlemez
  const n = {}; for (const id of items) { const t = ITYPE(id); if (["boot", "sup", "?", "ad"].includes(t)) continue; n[t] = (n[t] || 0) + (t === "crit" ? 1.5 : 1); }
  if (!Object.keys(n).length && items.some(id => ITYPE(id) === "ad")) return "brz";
  const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0]; return best ? best[0] : null;
}
/* Yeteneklerin toplam YG oranı (%), ör. Malphite ≈ 230 */
const valLast = x => Array.isArray(x) ? x[x.length - 1] : (x || 0);
function apRatio(c) { const a = AB[c.slug] || {}; let s = 0; for (const k of ["q", "w", "e", "r"]) for (const d of (a[k] && a[k].d) || []) s += valLast((d[2] || {}).ap); return s; }
const STYLE_MEMO = {};
function stylesOf(c) {
  if (STYLE_MEMO[c.slug]) return STYLE_MEMO[c.slug];
  const cls = c.prof.cls || [], b = BUILDS[c.slug] || {}, out = new Set();
  const vs = Object.values(b).flatMap(R => R.v.map(v => v[1]));
  for (const v of vs) { const s = styleOfItems(v); if (s) out.add(s); if (!["ap", "apt"].includes(s) && v.filter(id => ["ap", "apt"].includes(ITYPE(id))).length >= 2) out.add("ap"); }
  const critData = vs.some(v => styleOfItems(v) === "crit");
  if (cls.includes("Tank")) out.add("tank");
  if (c.dmg === "AD" && cls.includes("Marksman")) out.add("crit");
  if (c.dmg === "AD" && cls.includes("Fighter") && (!critData || cls.includes("Tank"))) out.add("brz");
  if (c.dmg === "AD" && cls.includes("Assassin") && !cls.includes("Marksman") && !critData) out.add("leth");
  if (cls.includes("Mage") && apRatio(c) >= 150) out.add("ap");
  if (c.dmg === "AP" && cls.includes("Fighter")) out.add("apt");
  if (cls[0] === "Support" && c.dmg === "AP" && !cls.includes("Tank")) out.add("ench");
  const kind = kindOf(c); if (kind !== "tank" && kind !== "sup") out.add("offtank");
  return (STYLE_MEMO[c.slug] = STY_ORDER.filter(k => out.has(k)));
}
const styleLbl = (c, st) => st === "offtank" && kindOf(c) !== "adm" ? "Karma (dayanıklı)" : STY[st].lbl;
/* Şampiyonun tüm koridorlardaki oyuncu buildlerinde eşya ağırlığı (öndeki eşya daha ağır) */
const FREQ_MEMO = {};
function dataFreq(c) {
  if (FREQ_MEMO[c.slug]) return FREQ_MEMO[c.slug];
  const m = new Map(); for (const R of Object.values(BUILDS[c.slug] || {})) for (const v of R.v) v[1].forEach((id, i) => m.set(id, (m.get(id) || 0) + (6 - i) * (v[3] || 1))); return (FREQ_MEMO[c.slug] = m);
}
/* Dayanıklılık havuzu (off-tank buildi ve öneriler için) */
const DEF_EXTRA = {
  adm: have(["3053", "6333", "3156", "3742", "3143", "4401", "3065", "2504", "3075", "6665", "3026"]),
  adr: have(["3026", "6673", "3139", "3156"]),
  crit: have(["3026", "6673", "3139", "3156", "6333", "3053"]), leth: have(["3814", "3156", "6333", "3026", "3053"]),
  ap: have(["3157", "3102", "4633", "6657", "3116", "2504", "4401"]),
  tank: STY.tank.pool, sup: have(["3190", "3050", "3109", "2524", "3157", "3102", "4401", "3143"]),
};
const ANTI_HEAL = new Set(have(["3033", "6609", "3165", "3075", "3123", "3916"]));
const ANTI_TANK = new Set(have(["3153", "3036", "6694", "3071", "3135", "6653", "3302", "3137", "8010", "6672"]));
/* Destek eşyası: Dünya Atlası → Rün Pusulası → Dünyaların Ganimeti → bedelsiz son yükseltme */
const SUP_FINAL = { ad: "3877", ap: "3871", tank: "3869", ench: "3870", cc: "3876" };
function supItemFor(c, st) {
  const R = BUILDS[c.slug] && BUILDS[c.slug].sup; const d = R && R.v[0][1].find(isSupItem); if (d) return d;
  if (st === "ench" || kindOf(c) === "sup" && !["ap", "apt"].includes(st)) return SUP_FINAL.ench;
  if (st === "tank") return SUP_FINAL.tank;
  if (st === "ap" || st === "apt") return SUP_FINAL.ap;
  return SUP_FINAL.ad;
}
/* Koridora göre büyüler (veri yoksa) ve başlangıç eşyası */
const SPELL_DEF = { top: ["4", "12"], jg: ["4", "11"], mid: ["4", "14"], adc: ["4", "7"], sup: ["4", "3"] };
function spellsFor(sp, src, role) {
  if (sp && src === role) return sp;
  return SPELL_DEF[role];
}
function startFor(c, role, R, st) {
  if (R && R.start && R.start.length && !(role === "sup" && !R.start.includes("3865"))) return R.start;
  if (role === "sup") return ["3865"];
  if (role === "jg") return [st === "tank" || kindOf(c) === "tank" ? "1103" : "1101"];
  if (st === "tank" || kindOf(c) === "tank") return ["1054"];
  return [c.dmg === "AP" || ["ap", "apt", "ench"].includes(st) ? "1056" : "1055"];
}
/* Tarz başına rün sayfaları (ana ağaç: anahtar + 3; ikincil ağaç: 2) — LoL rün kurallarına uygun */
const RUNE_PAGES = {
  crit_r: [8008, 9111, 9104, 8014, 8139, 8135], crit_m: [8010, 9111, 9104, 8299, 8473, 8451],
  leth: [8112, 8143, 8140, 8135, 9111, 8014], brz: [8010, 9111, 9104, 8299, 8444, 8451],
  offtank: [8437, 8446, 8444, 8451, 9111, 9104], offtank_r: [8010, 9111, 9104, 8299, 8444, 8451],
  tank: [8437, 8446, 8444, 8451, 8304, 8347], tank_sup: [8439, 8463, 8473, 8453, 8304, 8347],
  ap_m: [8112, 8143, 8140, 8135, 8226, 8210], ap_r: [8229, 8226, 8210, 8237, 8139, 8135],
  apt: [8010, 9111, 9104, 8299, 8444, 8451], ench: [8214, 8226, 8210, 8237, 8463, 8453],
};
function runePage(c, role, st) {
  const m = isMelee(c), k = st === "crit" ? (m ? "crit_m" : "crit_r") : st === "ap" ? (m ? "ap_m" : "ap_r") : st === "tank" ? (role === "sup" ? "tank_sup" : "tank")
    : st === "offtank" ? (m ? "offtank" : "offtank_r") : st;
  return (RUNE_PAGES[k] || RUNE_PAGES.brz).map(String);
}
const runeTree = id => (RUNES.r[id] || [])[2];
/* Tarz buildi: önce şampiyonun oyuncu verisinde geçen o tarz eşyaları, sonra tarzın genel sırası */
function styleList(c, st, base) {
  const fr = dataFreq(c), melee = isMelee(c);
  const rank = pool => [...pool].filter(id => !(melee && RANGED_ONLY_FEEL.has(id))).sort((a, b) => (fr.get(b) || 0) - (fr.get(a) || 0) || pool.indexOf(a) - pool.indexOf(b));
  if (st !== "offtank") return rank(STY[st].pool);
  const kind = kindOf(c), dmgSt = styleOfItems(base) || (c.dmg === "AP" ? "ap" : "brz");
  const dmg = [...base.filter(id => !["tank", "sup", "boot"].includes(ITYPE(id))), ...rank((STY[dmgSt] || STY.brz).pool)];
  const def = rank(DEF_EXTRA[kind] || DEF_EXTRA.adm).filter(id => !dmg.slice(0, 3).includes(id));
  const d = [...new Set(dmg)];
  return [d[0], d[1], def[0], def[1], d[2], def[2], def[3], def[4]].filter(Boolean);
}
const VAR_P = { pop: ["users", "En çok tercih"], win: ["trophy", "En çok kazanan"], high: ["star", "Master+"] };
/* u.gg tarz sayfalarının adı → bu sitedeki tarz (eşyalara bakılarak kesinleşir) */
const UGG_STY = { ap: "ap", tank: "tank", ad: "brz", crit: "crit", lethality: "leth", onhit: "crit" };
/* Koridorun veri kaynağı: kendi verisi, yoksa en çok oynanan koridor */
function srcRoleOf(c, role) { const b = BUILDS[c.slug]; if (!b) return null; if (b[role]) return role; return Object.keys(b).sort((x, y) => b[y].g - b[x].g)[0] || null; }
/* Fiziksel/büyü hasarına karşı varyant: savunma eşyalarını eşdeğeriyle değiştirir; değişecek eşya yoksa son eşyanın yerine tarzına uygun bir savunma eşyası koyar */
const ANTI_ADD = {
  ad: { crit: ["3026", "6333", "6673"], leth: ["6333", "3026", "3814"], brz: ["6333", "3143", "3742"], offtank: ["3143", "3742", "6333"], tank: ["3143", "3075", "3110", "3742"], ap: ["3157"], apt: ["3157", "3143"], ench: ["3109", "3190"] },
  ap: { crit: ["3156", "3139"], leth: ["3156", "3814"], brz: ["3156", "4401", "3065"], offtank: ["4401", "3065", "2504"], tank: ["4401", "2504", "3065", "6664"], ap: ["3102"], apt: ["3102", "4401"], ench: ["3190", "3222"] },
};
function antiItems(c, role, items, team, st) {
  let [out, sw] = swapDef(items, c, role, team);
  const nb = sw.filter(([a]) => !isBoot(a)).length;
  if (!nb) {
    const idx = out.map((x, i) => x && !isBoot(x) && !isSupItem(x) ? i : -1).filter(i => i >= 0).pop();
    for (const t of have((ANTI_ADD[team][st] || ANTI_ADD[team].brz))) {
      if (idx == null || out.includes(t)) continue; const tmp = [...out]; tmp[idx] = t;
      if (blockOf({ c, role, items: tmp }, t, idx)) continue; sw = [...sw, [out[idx], t]]; out = tmp; break; }
  }
  return [arrange(out, c, role), sw];
}
/* Hazır buildler: tarz grupları; her grupta ~3 build (u.gg varyantları ya da tarz sayfası + fiziksel/büyü hasarına karşı) ve kendi rün sayfası
 * → [{id, grp, grpLbl, lbl, ic, sub, items, style, ru, sp, start, wr, g, gen, adapted, after}] */
const P_MEMO = new Map();
function presetsFor(c, role) {
  const mk = c.slug + ":" + role; if (P_MEMO.has(mk)) return P_MEMO.get(mk);
  const b = BUILDS[c.slug] || {}, src = srcRoleOf(c, role), R = src ? b[src] : null, adapted = !!R && src !== role, out = [];
  const note = adapted ? `${ROLE_LONG[role]} için oyuncu verisi yok; ${ROLE_LONG[src]} buildinden uyarlandı` : "";
  const finish = (p, list) => {
    if (role === "sup" && !list.some(isSupItem)) list = [supItemFor(c, p.style), ...list];
    p.items = arrange(list, c, role);
    // aynı gruptaki aynı eşyalı buildler bir kez gösterilir
    const sig = [...p.items].sort().join(); if (out.some(q => q.grp === p.grp && q.items && [...q.items].sort().join() === sig)) return null;
    if (role === "sup") p.after = arrange(list.filter(x => !isSupItem(x)), c, "adc").find(x => !isBoot(x) && !p.items.includes(x)) || null;
    p.grpLbl = p.grpLbl || styleLbl(c, p.grp);
    out.push(p); return p;
  };
  // her grubun ilk buildinden fiziksel ve büyü hasarına karşı varyantlar
  const antis = (p0, list0) => { if (!p0) return;
    for (const [team, lbl, ic0] of [["ad", "Fiziksel hasara karşı", "shield"], ["ap", "Büyü hasarına karşı", "spark"]]) {
      const [items, sw] = antiItems(c, role, p0.items, team, p0.style); if (!sw.length) continue;
      finish({ ...p0, id: p0.grp + "-" + team, lbl, ic: ic0, wr: null, g: 0, items: null, after: null,
        sub: `${esc2(p0.lbl)} buildi; ${sw.map(([a, x]) => `${iname(a)} → ${iname(x)}`).join(", ")}${adapted ? " · " + note : ""}` }, [...items, ...list0.filter(x => !items.includes(x))]); }
  };
  let main = null;
  const anyBoots = Object.values(b).map(x => x.boots).find(Boolean) || null;
  const usedStyles = new Set();
  if (R) {
    main = styleOfItems(R.v[0][1]) || stylesOf(c)[0];
    usedStyles.add(main);
    const spare = [...R.v.flatMap(v => v[1]), ...(R.sit || []), ...(STY[main] && STY[main].pool ? styleList(c, main, []) : [])];
    const boots0 = R.boots || anyBoots || (STY[main] && STY[main].boots) || null;
    let first = null, firstList = null;
    R.v.forEach((v, i) => { const m = VAR_P[v[0]] || ["wand", v[0]]; const list = [...v[1], ...spare.filter(x => !v[1].includes(x)), boots0];
      const p = finish({ id: "v" + i, grp: main, lbl: m[1], ic: m[0], wr: adapted ? null : v[2], g: v[3], style: main, ru: v[4] || R.ru, ruSrc: v[4] ? "Master+ oyuncuların rün sayfası" : "Oyuncuların bu koridordaki rün sayfası",
        sp: spellsFor(R.sp, src, role), start: startFor(c, role, adapted ? null : R, main), adapted,
        sub: adapted ? note : `${v[3] ? `${n0(v[3])} maç${v[2] != null ? " · " + pct(v[2]) + " kazanma" : ""}` : "maç sayısı az"}` }, list);
      if (p && !first) { first = p; firstList = list; } });
    antis(first, firstList);
    // u.gg tarz sayfaları (bu koridorda yeterli maçı olanlar)
    for (const [name, X] of Object.entries(R.st || {})) {
      const st = styleOfItems(X.i) || UGG_STY[name]; if (!st || !STY[st] || usedStyles.has(st)) continue; usedStyles.add(st);
      const list = [...X.i, ...styleList(c, st, X.i), X.b || STY[st].boots || boots0];
      const p = finish({ id: "u-" + st, grp: st, lbl: "Standart", ic: STY[st].ic, wr: adapted ? null : X.wr, g: X.g, style: st, ru: X.ru, ruSrc: "Bu tarzda oynayan oyuncuların rün sayfası",
        sp: spellsFor(X.sp || R.sp, src, role), start: startFor(c, role, adapted ? null : { start: X.start }, st), adapted,
        sub: adapted ? note : `${STY[st].lbl} oynayan oyuncular · ${n0(X.g)} maç · ${pct(X.wr)} kazanma` }, list);
      antis(p, list);
    }
  }
  const base = R ? R.v[0][1] : [];
  for (const st of stylesOf(c)) {
    if (usedStyles.has(st)) continue; usedStyles.add(st);
    const boots = st === "offtank" ? (R && R.boots) || anyBoots || (c.dmg === "AP" ? "3020" : "3047") : STY[st].boots;
    const list = [...styleList(c, st, base), boots];
    const p = finish({ id: "s-" + st, grp: st, lbl: "Standart", ic: STY[st].ic, style: st, ru: runePage(c, role, st), ruSrc: "Tarza göre hazırlanmış rün sayfası (oyuncu verisi değil)",
      sp: spellsFor(R && R.sp, src, role), start: startFor(c, role, null, st), adapted,
      sub: STY[st].sub + (adapted ? " · " + note : "") }, list);
    antis(p, list);
  }
  // Bu rakibe göre (yalnızca düelloda): her grubun ilk buildinin ilk 2 eşyası + öneri motoru
  for (const g of [...new Set(out.map(p => p.grp))]) { const f0 = out.find(p => p.grp === g);
    out.push({ id: "ct-" + g, grp: g, grpLbl: f0.grpLbl, lbl: "Bu rakibe göre", ic: "target", gen: "ct", style: f0.style, ru: f0.ru, ruSrc: f0.ruSrc, sp: f0.sp, start: f0.start, adapted,
      base: f0.items.filter(x => !isBoot(x)), boots: f0.items.find(isBoot) || null,
      sub: `İlk 2 eşya "${f0.lbl}" buildinden; kalanlar düello rakibine göre önerilenler` }); }
  P_MEMO.set(mk, out); return out;
}
const esc2 = s => String(s == null ? "" : s);
/* Karşı takıma göre savunma: büyü direnci ↔ zırh eşdeğerleri */
const SWAP_TO_ARMOR = { "4401": "3143", "2504": "3075", "6664": "3068", "3156": "6333", "3102": "3157", "3111": "3047", "3139": "3026", "8020": "3110", "3065": "3110" };
const SWAP_TO_MR = { "3143": "4401", "3742": "4401", "3075": "2504", "3110": "3065", "3068": "6664", "6333": "3156", "3157": "3102", "3047": "3111", "3026": "3139", "2502": "3065" };
const FALLBACK = { armor: have(["3143", "3075", "3110", "3742", "3068", "2502", "6333", "3157"]), mr: have(["4401", "2504", "3065", "6664", "8020", "3156", "3102", "3091"]) };
const isArmorOnly = id => (istat(id).armor || 0) > 0 && !(istat(id).mr > 0);
const isMrOnly = id => (istat(id).mr || 0) > 0 && !(istat(id).armor > 0);
/* team: "ad" (çoğu fiziksel) · "ap" (çoğu büyü) · "bal" → [yeni liste, [[eski, yeni]...]] */
function swapDef(items, c, role, team) {
  if (team !== "ad" && team !== "ap") return [items, []];
  const map = team === "ad" ? SWAP_TO_ARMOR : SWAP_TO_MR, fb = team === "ad" ? FALLBACK.armor : FALLBACK.mr;
  const out = [...items], done = [];
  out.forEach((id, i) => {
    if (!id || !map[id] || isSupItem(id)) return; // yalnızca eşdeğeri bilinen savunma eşyaları değişir
    const tries = [map[id], ...(isBoot(id) ? [] : fb)].filter(Boolean);
    for (const t of tries) { const f = { c, role, items: out }; if (t === id || out.includes(t) || !IT[t] || blockOf(f, t, i)) continue;
      // tarz: hasar eşyasını savunma eşyasıyla değiştirirken saldırı gücü/yetenek gücü türü korunur
      if ((istat(id).ad > 0) !== (istat(t).ad > 0) || (istat(id).ap > 0) !== (istat(t).ap > 0)) continue;
      done.push([id, t]); out[i] = t; break; }
  });
  return [out, done];
}
/* ===================================================================
 *  ÖNERİ MOTORU (kural tabanlı) — simülasyon yalnızca düellodaki güç dengesi için kullanılır
 *  Aday havuzu: şampiyonun bu koridorda aldığı tamamlanmış eşyalar (buildler, varyantlar, 4–6. eşya seçenekleri,
 *  durumsal eşyalar; ne kadar alındığına göre ağırlıklı) + seçili tarzın eşyaları + tarza uygun savunma.
 *  Puan = yaygınlık (0–1) + rakibe göre ekler (dayanıklı rakip, kırılgan rakip, can yenileme, hasar türü
 *  ve karşı takım, patlama hasarı, kitle kontrolü). Yerine ne çıkacağını oyuncu seçer.
 * =================================================================== */
const HEALERS = new Set(["soraka", "aatrox", "sona", "yuumi", "nami", "vladimir", "drmundo", "warwick", "sylas", "fiddlesticks", "swain", "briar", "illaoi", "olaf", "trundle",
  "volibear", "maokai", "zac", "nasus", "udyr", "seraphine", "milio", "taric", "senna", "samira", "gwen", "masteryi", "nidalee", "karma", "renata", "belveth", "fiora", "irelia", "naafiri", "kayle"].filter(s => BYSLUG[s]));
/* Dayanıklı rakibe karşı: zırh/büyü delme ve yüzde can hasarı (saf saldırı hızı/kritik sayılmaz) */
const AT_P = { "3036": 1, "6694": 1, "3071": 0.9, "3033": 0.7, "3153": 0.9, "6672": 0.6, "3302": 0.5 };
const AT_M = { "3135": 1, "3137": 1, "6653": 0.9, "8010": 0.8 };
const PCT_HP = new Set(["3153", "6653", "6672"]);
const BURST_AP = new Set(["3089", "4645", "3100", "6655", "3118", "4646"]);
const ANTI_BURST = { "3026": 0.9, "3157": 1, "3814": 0.8, "3102": 0.8, "6673": 0.7, "3053": 0.6, "6333": 0.5 };
const ANTI_CC = { "3139": 1, "3111": 0.9, "3102": 0.4 };
/* Ağır Yara: kritik → Fani Hatıratı, diğer fiziksel → Zaun Zincirkılıcı, büyü → Morellonomikon, tank → Çivili Zırh */
const HEAL_CUT = { crit: "3033", leth: "6609", brz: "6609", offtank: "6609", ap: "3165", apt: "3165", ench: "3165", tank: "3075" };
const isAPStyle = st => ["ap", "apt", "ench"].includes(st);
/* Rakibin profili: dayanıklılık, kırılganlık, hasar türü, can yenileme, patlama, kitle kontrolü */
function foeProfile(o) {
  const c = o.c, st = fstats(o), cls = c.prof.cls || [];
  const ost = styleOfItems(o.items.filter(Boolean)) || (presetsFor(c, o.role)[0] || {}).style || (kindOf(c) === "tank" ? "tank" : c.dmg === "AP" ? "ap" : "brz");
  const bAr = st ? st.ar - st.baseAr : 0, bMr = st ? st.mr - st.baseMr : 0, bhp = st ? st.bhp : 0;
  let tank = Math.max(0, Math.min(1, (bhp - 250) / 1100 + (bAr + bMr - 30) / 140));
  if (cls.includes("Tank") && ost === "tank") tank = Math.max(tank, 0.6);
  const squishy = tank < 0.2 && !cls.includes("Tank") && (cls.includes("Marksman") || cls.includes("Mage") || cls.includes("Assassin") || ost === "ench") ? 1 : 0;
  const P = ["crit", "leth", "brz", "offtank"].includes(ost) ? 0.8 : isAPStyle(ost) ? 0.25 : c.dmg === "AP" ? 0.35 : 0.7;
  const ls = o.items.reduce((a, id) => a + (istat(id).ls || 0) + (istat(id).ov || 0), 0);
  const heal = HEALERS.has(c.slug) ? 1 : ls >= 15 ? 0.6 : 0;
  const burst = cls.includes("Assassin") || ost === "leth" ? 1 : cls.includes("Mage") && BURST_AP.size && o.items.some(id => BURST_AP.has(id)) ? 0.6 : 0;
  const A = AB[c.slug] || {}; const cc = ["q", "w", "e", "r"].filter(k => A[k] && A[k].cc && ["hard", "air"].includes(A[k].cc[0])).length;
  const threat = ost === "ench" ? 0.5 : ost === "tank" ? 0.75 : 1;
  return { c, st: ost, tank, squishy, P, heal, burst, cc, bAr, bMr, bhp, threat };
}
/* Bu koridorda alınma ağırlığı (0–1) */
function popMap(c, role, st) {
  const b = BUILDS[c.slug] || {}, src = srcRoleOf(c, role), R = src && b[src], m = new Map();
  const add = (id, w) => m.set(id, (m.get(id) || 0) + w);
  if (R) {
    R.v.forEach(v => v[1].forEach((id, i) => add(id, (v[3] || 50) * (1 - i * 0.08))));
    (R.opt || []).forEach(sl => sl.forEach(([id, , g]) => add(id, g)));
    (R.sit || []).forEach(id => add(id, (R.v[0][3] || 100) * 0.15));
    for (const X of Object.values(R.st || {})) if ((styleOfItems(X.i) || "") === st) X.i.forEach((id, i) => add(id, X.g * 0.5 * (1 - i * 0.08)));
  }
  const max = Math.max(1, ...m.values()); const out = new Map(); for (const [k, v] of m) out.set(k, v / max); return out;
}
/* Öneri listesi: [{id, s (puan), why: [metin]}] */
function recsFor(f, o, limit = 10, style) {
  const c = f.c, st = style || styleOfItems(f.items.filter(Boolean)) || (presetsFor(c, f.role).find(p => p.id === f.build) || presetsFor(c, f.role)[0] || {}).style;
  const pop = popMap(c, f.role, st), foe = foeProfile(o), team = D.team;
  const Pt = team === "ad" ? 0.85 : team === "ap" ? 0.15 : foe.P, Mt = 1 - Pt;
  const myAr = f.items.reduce((a, id) => a + (istat(id).armor || 0), 0), myMr = f.items.reduce((a, id) => a + (istat(id).mr || 0), 0);
  const ap = isAPStyle(st) || (st === "tank" && c.dmg === "AP");
  const pool = new Set([...recPool(f, st), ...pop.keys(), ...Object.keys(ap ? AT_M : AT_P), ...Object.keys(ANTI_BURST), ...Object.keys(ANTI_CC), HEAL_CUT[st] || (ap ? "3165" : "6609")]);
  const have0 = new Set(f.items.filter(Boolean)), hasBoot = f.items.some(x => x && isBoot(x));
  const okType = new Set(COMPAT[st] || []), defItem = id => (istat(id).armor || 0) + (istat(id).mr || 0) > 0;
  // patlamaya karşı eşya şampiyonun türüne uygun mu (Zhonya/Banshee büyücüye, Koruyucu Melek fiziksel taşıyıcıya…)
  const okB = id => id === "3157" || id === "3102" ? ap || (st === "tank" && c.dmg === "AP") : id === "6673" ? st === "crit" : id === "3814" ? ["leth", "brz"].includes(st) : id === "3053" ? ["brz", "offtank", "tank"].includes(st) && !ap : !ap;
  const out = [];
  for (const id of pool) {
    if (!IT[id] || have0.has(id) || (IT[id].tier !== "fin" && !isBoot(id))) continue;
    if (isBoot(id) && !["3111", "3047"].includes(id)) continue;           // çizme önerisi yalnızca savunma çizmesi (mevcut çizmenin yerine geçer)
    const fx = { ...f, items: isBoot(id) ? f.items.filter(x => x && !isBoot(x)) : f.items.filter(Boolean) };
    const why0 = blockOf(fx, id, -1); if (why0 && !/^Bu rolde en fazla/.test(why0)) continue;
    if (isMelee(c) && RANGED_ONLY_FEEL.has(id)) continue;
    const t = ITYPE(id), p0 = pop.get(id) || 0;
    // tarza uymayan hasar eşyası: yalnızca oyuncular gerçekten alıyorsa
    if (!isBoot(id) && !defItem(id) && !okType.has(t) && p0 < 0.15 && !(ANTI_BURST[id] && okB(id)) && !ANTI_CC[id] && !ANTI_HEAL.has(id)) continue;
    if (ANTI_BURST[id] && !okB(id) && p0 < 0.15 && !defItem(id)) continue;
    if (ap && ["crit", "leth", "brz", "ad"].includes(t)) continue;
    if (!ap && ["ap", "apt", "ench"].includes(t) && p0 < 0.15) continue;
    let s = p0 * 1.0; const why = [];
    const W = (v, txt) => { s += v; if (v > 0.15 && txt) why.push([v, txt]); };
    if (p0 >= 0.35) why.push([p0 * 0.5, `Oyuncuların ${ROLE_LONG[f.role]} için sık aldığı eşya`]);
    // dayanıklı rakip
    const atv = ap ? AT_M[id] : AT_P[id];
    if (atv && foe.tank > 0) W(1.3 * atv * foe.tank, PCT_HP.has(id) ? "Rakibin canı çok: yüzde can hasarı işe yarar" : ap ? "Rakip dayanıklı: büyü delme olmadan hasarın geçmez" : "Rakip çok zırhlı: zırh delme olmadan hasarın geçmez");
    if (!ap && (istat(id).leth || 0) > 0 && foe.tank > 0.4) s -= 0.4 * foe.tank;
    // kırılgan rakip
    if (foe.squishy && (((istat(id).leth || 0) > 0 && ["leth", "brz"].includes(st)) || (ap && BURST_AP.has(id)))) W(0.5, "Rakip kırılgan: patlama hasarı onu hızla indirir");
    if (foe.squishy && (AT_P[id] || AT_M[id]) && !PCT_HP.has(id)) s -= 0.5;
    // can yenileme
    if (ANTI_HEAL.has(id)) {
      const mine = id === HEAL_CUT[st] || (st === "crit" && id === "3033") || (!ap && st !== "crit" && id === "6609") || (ap && id === "3165") || (st === "tank" && id === "3075");
      if (foe.heal > 0 && mine) W(1.4 * foe.heal, `${foe.c.disp} çok can yeniliyor: Ağır Yara bunu keser`); else if (!foe.heal && p0 < 0.35) s -= 0.3; }
    // savunma: rakibin hasar türü + karşı takım
    const ar = istat(id).armor || 0, mr = istat(id).mr || 0;
    if (ar > 0 || mr > 0) {
      const tt = team === "ad" ? "Karşı takım çoğunlukla fiziksel hasar veriyor" : team === "ap" ? "Karşı takım çoğunlukla büyü hasarı veriyor" : null;
      if (ar > 0 && !(mr > 0)) { if (Pt >= 0.5) W(0.7 * Pt * (myAr < 40 ? 1.4 : 1) * (team === "ad" ? 1 : foe.threat), tt || `${foe.c.disp} çoğunlukla fiziksel hasar verir${myAr < 40 ? "; buildinde zırh yok" : ""}`); else if (Pt < 0.3) s -= 0.6; }
      else if (mr > 0 && !(ar > 0)) { if (Mt >= 0.5) W(0.7 * Mt * (myMr < 40 ? 1.4 : 1) * (team === "ap" ? 1 : foe.threat), tt || `${foe.c.disp} çoğunlukla büyü hasarı verir${myMr < 40 ? "; buildinde büyü direnci yok" : ""}`); else if (Mt < 0.3) s -= 0.6; }
      else W(0.3, null);
    }
    // patlama / suikastçı
    if (ANTI_BURST[id] && foe.burst) {
      if (okB(id)) W(0.9 * ANTI_BURST[id] * foe.burst, `${foe.c.disp} ani patlama hasarı verir: bu eşya seni hayatta tutar`); }
    // kitle kontrolü
    if (ANTI_CC[id] && foe.cc >= 2) { const okC = id === "3139" ? !ap && ["crit", "leth", "brz"].includes(st) : true;
      if (okC) W(0.8 * ANTI_CC[id], `${foe.c.disp} çok kitle kontrolü kullanır (${foe.cc} yetenek): etkisini kısaltır`); }
    if (s <= 0.05) continue;
    why.sort((a, b) => b[0] - a[0]);
    out.push({ id, s, why: why.slice(0, 2).map(x => x[1]) });
  }
  return out.sort((a, b) => b.s - a.s).slice(0, limit);
}
/* "Bu rakibe göre" buildi: ilk 2 eşya, kalanlar öneri motorundan (18. seviye sonu için) */
function genItems(f, p, o) {
  const c = f.c, n = slotsOf(f.role) - 1;
  let items = p.base.slice(0, 2);
  while (items.length < n) {
    const g = { ...f, items: [...items, p.boots].filter(Boolean) };
    const r = recsFor(g, o, 25, p.style).find(x => !isBoot(x.id) && !blockOf({ c, role: f.role, items }, x.id, -1));
    if (!r) break; items.push(r.id);
  }
  // çizme: rakibe göre savunma çizmesi önerilirse o
  const rb = recsFor({ ...f, items: [...items, p.boots].filter(Boolean) }, o, 25, p.style).find(x => isBoot(x.id));
  return arrange([...items, (rb && rb.s > 0.9 ? rb.id : p.boots) || p.boots], c, f.role);
}
/* Şampiyonun bu koridorda gerçekten alınan eşyaları */
function buildPool(c, role) {
  const b = BUILDS[c.slug]; const s = new Set();
  if (b) { const rs = b[role] ? [role] : Object.keys(b); rs.forEach(r => { const R = b[r]; R.v.forEach(v => v[1].forEach(x => s.add(x))); (R.sit || []).forEach(x => s.add(x)); if (R.boots) s.add(R.boots); }); }
  return [...s].filter(id => IT[id] && !blockOf({ c, role, items: [] }, id, -1));
}
/* Tarzla uyumlu eşya türleri */
const COMPAT = { crit: ["crit", "ad", "brz"], leth: ["leth", "ad", "brz"], brz: ["brz", "ad", "tank"], tank: ["tank"], ap: ["ap", "apt"], apt: ["apt", "ap", "tank"], ench: ["ench", "tank"], offtank: ["tank", "brz"] };
/* Öneri havuzu: oyuncu verisi + şampiyonun tarzları + sınıfına uygun savunma; tarza uymayanlar ayıklanır */
function recPool(f, style) {
  const c = f.c, kind = kindOf(c), data = new Set(buildPool(c, f.role));
  const st = style || styleOfItems(f.items.filter(Boolean)) || (presetsFor(c, f.role)[0] || {}).style;
  const ok = new Set([...(COMPAT[st] || []), ...(st === "offtank" ? COMPAT[styleOfItems(f.items.filter(Boolean)) || "brz"] || [] : [])]);
  const s = new Set(data);
  for (const k of stylesOf(c)) if (STY[k].pool && (COMPAT[st] || []).some(t => COMPAT[k] && COMPAT[k][0] === t)) STY[k].pool.forEach(x => s.add(x));
  if (st && STY[st] && STY[st].pool) STY[st].pool.forEach(x => s.add(x));
  // savunma: tarza göre (kritik buildde tank eşyası değil, SG'li savunma eşyaları)
  const defL = (["crit", "leth"].includes(st) && kind !== "adr" ? DEF_EXTRA[st] : DEF_EXTRA[kind]) || [];
  defL.forEach(x => s.add(x));
  const melee = isMelee(c), extra = new Set(defL);
  return [...s].filter(id => { if (!IT[id] || (IT[id].tier !== "fin" && !isBoot(id))) return false; if (melee && RANGED_ONLY_FEEL.has(id)) return false; if (blockOf({ c, role: f.role, items: [] }, id, -1)) return false;
    if (isBoot(id) || data.has(id) || extra.has(id)) return true; const t = ITYPE(id); return !st || ok.has(t); });
}

/* ===================================================================
 *  DÜELLO EKRANI
 * =================================================================== */
const MAXL = 18;
const D = { me: null, en: null, lvl: 11, prev: null, log: [], team: "bal" };
const dSave = () => { try { const o = f => f && { s: f.c.slug, r: f.role, b: f.build, i: f.items }; localStorage.setItem("rk-lol-duel2", JSON.stringify({ me: o(D.me), en: o(D.en), lvl: D.lvl, team: D.team })); } catch { } };
const pad = (items, role) => { const n = slotsOf(role), boot = items.find(x => x && isBoot(x)), rest = items.filter(x => x && !isBoot(x)); return [...rest, ...Array(n).fill(null)].slice(0, n - 1).concat(boot || null); };
/* Koridor: 5 koridorun hepsi seçilebilir; verisi olmayan koridorda build uyarlanır */
function fighter(side, c, o = {}) {
  const roles = rolesOf(c);
  const role = ROLE_ORDER.includes(o.role) ? o.role : (side === "en" && D.me && roles.includes(D.me.role) ? D.me.role : roles.includes(c.main) ? c.main : roles[0]);
  const f = { side, c, role, build: o.build || "v0", items: [], swaps: [], get lvl() { return D.lvl; } };
  if (Array.isArray(o.items)) f.items = pad(arrange(o.items, c, role), role);
  else { const P = presetsFor(c, role); if (!P.some(p => p.id === f.build && !p.gen)) f.build = (P[0] || {}).id || null;
    const p = P.find(x => x.id === f.build); let full = p ? p.items : [];
    if (side === "me" && p) [full, f.swaps] = swapDef(full, c, role, D.team);
    f.full = full; f.items = pad(itemsForLevel(full, D.lvl, role), role); }
  return f;
}
const other = side => D[side === "me" ? "en" : "me"];
function applyPreset(side, id) {
  const f = D[side], p = presetsFor(f.c, f.role).find(x => x.id === id); if (!p) return;
  let full = p.gen ? genItems(f, p, other(side)) : p.items; f.swaps = [];
  if (side === "me") [full, f.swaps] = swapDef(full, f.c, f.role, D.team);
  f.full = full; f.build = id;
  f.items = pad(itemsForLevel(f.full, D.lvl, f.role), f.role);
}
function dLoad() {
  try {
    const s = JSON.parse(localStorage.getItem("rk-lol-duel2") || "null");
    if (s && ["ad", "ap", "bal"].includes(s.team)) D.team = s.team;
    if (s && s.me && BYSLUG[s.me.s] && s.en && BYSLUG[s.en.s]) { D.lvl = Math.min(MAXL, Math.max(1, s.lvl || 11));
      D.me = fighter("me", BYSLUG[s.me.s], { role: s.me.r, build: s.me.b, items: s.me.i }); D.en = fighter("en", BYSLUG[s.en.s], { role: s.en.r, build: s.en.b, items: s.en.i }); return; }
  } catch { }
  D.me = fighter("me", BYSLUG.garen || LIST[0]); D.en = fighter("en", BYSLUG.darius || LIST[1]);
}
const verdictTxt = s => s >= 0.62 ? ["Sen kazanırsın", "good"] : s >= 0.54 ? ["Avantaj sende", "good"] : s > 0.46 ? ["Başa baş", "even"] : s > 0.38 ? ["Rakip önde", "bad"] : ["Rakip kazanır", "bad"];
const secs = t => t >= 60 ? "60+ sn" : (t < 10 ? dec(t) : Math.round(t)) + " sn";
/* Rün sayfası + büyüler (küçük satır) */
function runeLine(ru, sp) {
  if (!ru || !ru.length) return "";
  const t2 = runeTree(ru[4]);
  return `<div class="f-rune" title="Rünler: ${esc(ru.map(id => (RUNES.r[id] || [""])[0]).filter(Boolean).join(", "))}">${runeImg(ru[0], "ks")}<span class="rn">${esc((RUNES.r[ru[0]] || [""])[0])}</span>
    <span class="minor">${ru.slice(1, 4).map(n => runeImg(n)).join("")}</span>${t2 && RUNES.st[t2] ? `<img class="tree" src="${RUNES.st[t2][1]}" alt="${esc(RUNES.st[t2][0])}" title="İkincil: ${esc(RUNES.st[t2][0])}">` : ""}<span class="minor sec">${ru.slice(4, 6).map(n => runeImg(n)).join("")}</span>
    ${sp && sp.length ? `<span class="sps">${sp.map(spellImg).join("")}</span>` : ""}</div>`;
}
/* Destek eşyası yolu ve sonrası (Data Dragon: Dünya Atlası → Rün Pusulası → Dünyaların Ganimeti → bedelsiz son yükseltme) */
function supPath(items, after) {
  const fin = (items || []).find(isSupItem); if (!fin) return "";
  return `<div class="f-sup"><span class="l">${ic("scroll")}Destek eşyası</span>
    <span>${esc(iname("3865"))} → Rün Pusulası → Dünyaların Ganimeti → <b>${esc(iname(fin))}</b></span>
    <span class="muted">Destek görevinin altını dolunca kendiliğinden yükselir; son adım bedelsizdir. Satış değeri 160 altın: satarsan altın geliri ve totem yükleri gider.</span>
    ${after ? `<span class="sellrow"><span class="l">Build dolunca sat, yerine al</span>${sellTile(fin, after)}</span>` : ""}</div>`;
}
/* "Satınca:" — destek eşyası → yerine alınacak eşya (kutucuk) */
function sellTile(fin, after) {
  return `<span class="sell">${itile(fin)}<span class="arrow" aria-hidden="true">→</span>${itile(after)}</span>`;
}
function fighterHTML(side) {
  const f = D[side], c = f.c, st = fstats(f), P = presetsFor(c, f.role), cur = P.find(p => p.id === f.build);
  const abl = AB[c.slug] && Object.values(AB[c.slug]).some(x => x.d && x.d.length);
  const ruP = cur || P[0];
  const groups = [...new Set(P.map(p => p.grp))], g = cur ? cur.grp : (f.grp && groups.includes(f.grp) ? f.grp : groups[0]), GP = P.filter(p => p.grp === g);
  return `<div class="f-top">
      <button type="button" class="f-pick" data-dpick="${side}" aria-label="${side === "me" ? "Şampiyonunu" : "Rakibi"} değiştir: ${esc(c.disp)}">${por(c, "xl")}<span class="f-swap">${ic("swap")}</span></button>
      <div class="f-id"><span class="f-side">${side === "me" ? "Sen" : "Rakip"}</span><b class="f-name">${esc(c.disp)}</b>
        <span class="f-sub">${tierB(c)} ${esc(ROLE_LONG[f.role] || "")}${hasData(c, f.role) ? "" : ' <span class="adapt">uyarlanmış build</span>'}</span></div>
    </div>
    <div class="f-roles" role="group" aria-label="Koridor">${ROLE_ORDER.map(r => `<button type="button" data-drole="${side}:${r}" aria-pressed="${r === f.role}"${hasData(c, r) ? "" : ` class="nod" title="Bu koridorda ${esc(c.disp)} için oyuncu verisi yok; build uyarlanır"`}>${ROLE[r]}</button>`).join("")}</div>
    <div class="f-items${f.role === "adc" ? " seven" : ""}">${f.items.map((id, i) => id && IT[id] ? `<button type="button" class="slot-i${isBoot(id) ? " boot" : ""}" data-dslot="${side}:${i}" aria-label="${esc(iname(id))}: değiştir" title="${esc(iname(id))}"><img src="${IT[id].img}" alt="">${chgBadge(ICHG[id] && ICHG[id].v)}</button>`
      : `<button type="button" class="slot-i empty" data-dslot="${side}:${i}" aria-label="Eşya ekle">${ic("plus")}</button>`).join("")}</div>
    ${st ? `<dl class="f-stats">
      <div><dt>Can</dt><dd>${n0(st.hp)}</dd></div>
      ${(m => `<div><dt>${m ? "Yetenek G." : "Saldırı G."}</dt><dd>${n0(m ? st.ap : st.ad)}</dd></div>`)(st.ap > st.bad)}
      <div><dt>Zırh</dt><dd>${n0(st.ar)}</dd></div>
      <div><dt>Büyü D.</dt><dd>${n0(st.mr)}</dd></div>
      <div><dt>Saldırı H.</dt><dd>${st.as.toFixed(2).replace(".", ",")}</dd></div>
    </dl>` : `<p class="muted small">Bu şampiyonun taban değerleri henüz yok.</p>`}
    <div class="f-builds">
      ${groups.length > 1 ? `<div class="f-grps" role="group" aria-label="Oyun tarzı">${groups.map(x => { const p0 = P.find(p => p.grp === x); return `<button type="button" data-dgrp="${side}:${x}" aria-pressed="${x === g}">${ic(STY[x] ? STY[x].ic : "sword")}${esc(p0.grpLbl)}</button>`; }).join("")}</div>` : ""}
      <div class="f-styles" role="group" aria-label="Hazır build">${GP.map(p => `<button type="button" data-dbuild="${side}:${p.id}" aria-pressed="${f.build === p.id}" title="${esc(p.sub)}">${ic(p.ic)}${esc(p.lbl)}${p.wr != null ? ` <small>${pct(p.wr)}</small>` : ""}</button>`).join("") || '<span class="muted small">Bu şampiyon için build verisi yok.</span>'}</div>
      <p class="f-bsub muted small">${cur ? `<b>${esc(cur.grpLbl)} · ${esc(cur.lbl)}</b> · ${esc(cur.sub)}` : "Elle seçilmiş eşyalar"} · ${f.role === "adc" ? "Alt koridor: çizme + 6 eşya" : f.role === "mid" ? "Orta: gelişmiş çizme alınabilir" : "Çizme + 5 eşya"}${f.swaps && f.swaps.length ? ` · <span class="gold-t">Karşı takıma göre: ${esc(f.swaps.map(([a, b]) => `${iname(a)} → ${iname(b)}`).join(", "))}</span>` : ""}</p>
      ${ruP ? runeLine(ruP.ru, ruP.sp) : ""}
      ${f.role === "sup" ? supPath(f.full || f.items, cur && cur.after) : ""}
    </div>
    <div class="f-acts"><button type="button" class="lnk" data-dclear="${side}">${ic("reset")}Yuvaları boşalt</button>${abl ? "" : `<span class="muted small">Yetenek verisi yok, ortalama alınıyor</span>`}</div>`;
}
function metric(label, val, delta, goodUp, hint) {
  const d = delta == null || Math.abs(delta) < 0.005 ? "" : `<span class="dl ${(delta > 0) === goodUp ? "good" : "bad"}">${delta > 0 ? "▲" : "▼"} %${Math.abs(delta * 100).toFixed(0)}</span>`;
  return `<div class="mt" title="${esc(hint || "")}"><span class="ml">${label}</span><b>${val}</b>${d}</div>`;
}
function ccSummary(X) {
  const tot = X.ccEvents.reduce((a, e) => a + (e[1] === "hard" || e[1] === "air" ? e[2] : 0), 0);
  return tot > 0 ? dec(tot) + " sn" : "–";
}
const typeSplit = byT => { const P = byT.P || 0, M = byT.M || 0, T = byT.T || 0, s = Math.max(1, P + M + T); return { P: P / s, M: M / s, T: T / s }; };
function renderDuel() {
  $("#f-me").innerHTML = fighterHTML("me"); $("#f-en").innerHTML = fighterHTML("en"); renderTeam();
  $("#d-lvl").textContent = D.lvl;
  const r = simulate(D.me, D.en), out = $("#d-result");
  if (!r) { out.innerHTML = '<div class="empty">Bu eşleşme için taban değer verisi yok.</div>'; $("#d-recs").innerHTML = ""; return; }
  const p = D.prev; const rel = (a, b) => b ? (a - b) / b : null;
  const V = verdictTxt(r.score), pctMe = Math.round(r.score * 100);
  const E = r.edge ? EDGE_TXT(r.edge.wr) : null, sE = typeSplit(r.B.byT);
  out.innerHTML = `
    <div class="tug" role="img" aria-label="Güç dengesi: sen yüzde ${pctMe}, rakip yüzde ${100 - pctMe}">
      <span class="tug-me" style="width:${pctMe}%"><b>%${pctMe}</b></span><span class="tug-en"><b>%${100 - pctMe}</b></span>
    </div>
    <div class="verdict ${V[1]}"><span class="vh">${esc(V[0])}</span>
      <span class="muted small">${r.edge ? "Denge = dövüş simülasyonu + gerçek koridor verisi" : "Denge = dövüş simülasyonu (bu eşleşme için yeterli maç verisi yok)"}</span>
      ${E ? `<span class="vtag">${ic("users")}Koridor: <b class="${E[0] === "good" ? "good" : E[0] === "bad" ? "bad" : ""}">${esc(E[1])}</b> <small>${ROLE_LONG[r.role]} · ${pct(r.edge.wr)} kazanma · ${n0(r.edge.g)} maç</small></span>` : ""}
    </div>
    <div class="metrics">
      ${metric("Rakibi indirme", secs(r.ttkMe), p ? rel(r.ttkMe, p.ttkMe) : null, false, "Yetenek kombosu + normal saldırılarla rakibin canının bitme süresi")}
      ${metric("Seni indirme", secs(r.ttkEn), p ? rel(r.ttkEn, p.ttkEn) : null, true, "Rakibin kombosu + normal saldırılarıyla senin canının bitme süresi")}
      ${metric("Hasarının geçen kısmı", "%" + Math.round(r.passMe * 100), p ? rel(r.passMe, p.passMe) : null, true, "Rakibin zırh/büyü direncinden sonra ana hasar türünün ne kadarı işliyor")}
      ${metric("Etkili canın", n0(r.ehpMe), p ? rel(r.ehpMe, p.ehpMe) : null, true, "Rakibin hasar türüne karşı gerçek dayanıklılığın")}
    </div>
    <div class="cc-row">
      <span title="Rakibi kitle kontrolüyle durdurduğun toplam süre">${ic("lock")}Rakibi durdurma <b>${ccSummary(r.B)}</b></span>
      <span title="Rakibin seni durdurduğu toplam süre">${ic("lock")}Seni durdurma <b>${ccSummary(r.A)}</b></span>
      <span title="Kalkanlarının emdiği hasar">${ic("shield")}Kalkanın emdi <b>${n0(r.A.absorbed)}</b></span>
      <span title="Rakibin kalkanlarının emdiği hasar">${ic("shield")}Rakip kalkanı <b>${n0(r.B.absorbed)}</b></span>
    </div>
    <div class="split" title="Senin verdiğin hasarın kaynağı"><span class="sp-ab" style="width:${Math.round(r.abShareMe * 100)}%"></span></div>
    <p class="muted small" style="margin:-6px 0 0">Hasarının <b>%${Math.round(r.abShareMe * 100)}</b>'i yeteneklerden, <b>%${100 - Math.round(r.abShareMe * 100)}</b>'i normal saldırıdan. Rakibin hasarı: <b>%${Math.round(sE.P * 100)}</b> fiziksel, <b>%${Math.round(sE.M * 100)}</b> büyü${sE.T >= 0.03 ? `, <b>%${Math.round(sE.T * 100)}</b> gerçek` : ""}.</p>
    ${D.log.length ? `<ul class="dlog">${D.log.slice(0, 3).map((l, i) => `<li class="${i ? "old" : ""}">${l}</li>`).join("")}</ul>` : `<p class="muted small" style="margin:0">Bir eşyayı, buildi, koridoru ya da seviyeyi değiştir; sonuç anında değişsin.</p>`}
    <details class="why"><summary>${ic("info")} Hesap neyi içeriyor?</summary><p>1'e 1 dövüş tahmini: LoL taban değerleri ve seviye büyümesi, eşya sayıları, yetenek hasarları ve oranları, bekleme süreleri, oyuncuların yetenek sırası, kalkanlar ve kitle kontrolü; can çalma ve sıvışma dahil. Menzil, hareket, takım, minyon, rünler, sihirdar büyüleri ve çoğu eşya pasifi hesaba katılmaz. Sonuç kesin değil; karşılaştırma için kullan.</p></details>`;
  renderRecs(r); renderCounters(r);
  D.prev = { ttkMe: r.ttkMe, ttkEn: r.ttkEn, passMe: r.passMe, ehpMe: r.ehpMe, score: r.score };
  dSave();
}
/* ===================================================================
 *  ÖNERİLER — kural tabanlı öneri motoru (recsFor), ekleme ve yerine geçecek eşyayı seçme
 * =================================================================== */
const FINISHED = () => ILIST.filter(i => i.tier === "fin" || i.tier === "boot");
const istat = id => (IT[id] && IT[id].s) || {};
const TEAM_OPTS = [["ad", "Çoğu fiziksel"], ["bal", "Dengeli"], ["ap", "Çoğu büyü"]];
function renderTeam() {
  $("#d-team").innerHTML = `<span class="l">${ic("users")}Karşı takım</span><div class="seg sm" role="group" aria-label="Karşı takımın hasar türü">${TEAM_OPTS.map(([k, v]) => `<button type="button" data-team="${k}" aria-pressed="${D.team === k}">${v}</button>`).join("")}</div>
    <span class="muted small">Savunma eşyaların ve öneriler buna göre değişir (ör. çoğu fiziksel: ${esc(iname("4401"))} yerine ${esc(iname("3143"))}).</span>`;
}
/* Öneriler: kural tabanlı; puan ve "yerine" yok — oyuncu ekler, yuva doluysa neyin çıkacağını seçer */
function renderRecs() {
  const best = recsFor(D.me, D.en, 10);
  const row = x => `<button type="button" class="rec2" data-radd="${x.id}">${IT[x.id].img ? `<img src="${IT[x.id].img}" alt="">` : ""}
      <span class="rb"><span class="nm">${esc(iname(x.id))}</span>
        ${x.why.length ? `<span class="whyl">${x.why.map(s => `<span class="good">${esc(s)}</span>`).join("")}</span>` : ""}</span>
      <span class="add" aria-hidden="true">${ic("plus")}</span></button>`;
  $("#d-recs").innerHTML = `<h2>${ic("wand")}Bu rakibe karşı en etkili eşyalar</h2>
    <p class="muted small">${esc(D.me.c.disp)} (${esc(ROLE_LONG[D.me.role] || "")}) için, ${esc(D.en.c.disp)} karşısında: oyuncuların bu koridorda aldığı eşyalar ve tarzına uyanlar arasından, rakibin dayanıklılığına, hasar türüne, can yenilemesine, patlama hasarına ve kitle kontrolüne göre sıralandı${D.team !== "bal" ? "; karşı takım seçimi de hesaba katıldı" : ""}. Birlikte alınamayanlar ve bu rolde alınamayanlar ayıklandı. Dokun, ekle; yuvalar doluysa neyin yerine geçeceğini sen seçersin.</p>
    ${best.length ? `<div class="rec-list">${best.map(row).join("")}</div>` : '<div class="empty">Eklenebilecek eşya kalmadı.</div>'}`;
}
/* Öneriyi ekle: çizme → çizme yuvası; boş yuva varsa oraya; yoksa hangi eşyanın çıkacağını sor */
function addRec(id) {
  const f = D.me;
  if (isBoot(id)) { setItem("me", f.items.length - 1, id); return; }
  const empty = f.items.findIndex((x, i) => !x && i < f.items.length - 1);
  if (empty >= 0) { setItem("me", empty, id); return; }
  const opts = f.items.map((x, i) => x && !isBoot(x) ? i : -1).filter(i => i >= 0);
  openOv(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Yerine geçecek eşyayı seç" style="width:min(460px,100%)">
    <div class="sheet-head">${icoImg(id, "ico-lg")}<div style="flex:1;min-width:0"><h3 style="margin:0">${esc(iname(id))}</h3><span class="muted small">Yuvaların dolu. Hangi eşyanın yerine alacaksın?</span></div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="repl">${opts.map(i => { const x = f.items[i], why = (() => { const tmp = [...f.items]; tmp[i] = id; return blockOf({ ...f, items: tmp }, id, i); })();
      return `<button type="button" class="ipb${why ? " off" : ""}" data-rrep="${id}:${i}"${why ? ` disabled title="${esc(why)}"` : ""}><span class="ib">${IT[x].img ? `<img src="${IT[x].img}" alt="">` : ""}</span><span class="nm">${esc(iname(x))}</span>${why ? `<span class="why-off">${esc(why)}</span>` : ""}</button>`; }).join("")}</div></div>`);
  const b = ov.querySelector("[data-rrep]:not([disabled])") || ov.querySelector("[data-close]"); if (b) b.focus();
}
function renderCounters(r) {
  const en = D.en.c, role = r ? r.role : D.en.role;
  const rows = (MU[role] && MU[role][en.slug] || []).filter(x => x[1] < 50 && BYSLUG[x[0]] && BYSLUG[x[0]].roles.includes(role)).sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => ({ c: BYSLUG[x[0]], wr: 100 - x[1], g: x[2] }));
  $("#d-counters").innerHTML = `<h2>${ic("trophy")}${esc(en.disp)} karşısında en iyi seçimler</h2>
    <p class="muted small">${ROLE_LONG[role]} · gerçek maç verisi (u.gg, Dünya, Zümrüt+). Dokun, onunla düello et.</p>
    ${rows.length ? `<div class="ctr-row">${rows.map(x => `<button type="button" class="ctr" data-dme="${x.c.slug}" title="${n0(x.g)} maç">${por(x.c)}<span class="nm">${esc(x.c.disp)}</span><span class="tag ${EDGE_TXT(x.wr)[0]}">${pct(x.wr)}</span></button>`).join("")}</div>` : '<div class="empty">Bu koridor için eşleşme verisi yok.</div>'}`;
}
/* Eşya seçici: her eşyanın düelloya etkisi; alınamayanlar nedeniyle soluk */
let ipSide = "me", ipSlot = 0, ipCat = "rec";
function openItemPicker(side, slot) {
  ipSide = side; ipSlot = slot; ipCat = "rec"; const f = D[side]; const cur = f.items[slot];
  openOv(`<div class="sheet ip" role="dialog" aria-modal="true" aria-label="Eşya seç">
    <div class="sheet-head"><h3>${side === "me" ? "Senin" : "Rakibin"} eşyası</h3>${cur ? `<button class="btn" type="button" data-iprm>${ic("x")}Çıkar</button>` : ""}<button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="toolbar"><div class="seg sm" id="ip-cats">${[["rec", `${esc(f.c.disp)} için`], ["all", "Tümü"], ...Object.entries(CAT)].map(([k, v]) => `<button type="button" data-c="${k}" aria-pressed="${k === ipCat}">${v}</button>`).join("")}</div>
    <input id="ip-q" type="search" placeholder="Eşya ara" aria-label="Eşya ara"></div>
    <p class="muted small" style="margin:0">"${esc(f.c.disp)} için": oyuncuların bu şampiyonda ${esc(ROLE_LONG[f.role] || "")} için aldığı eşyalar. Sıra: bu rakibe karşı öneri sırası. Soluk olanlar bu rolde ya da bu buildde alınamaz.</p>
    <div class="ipgrid" id="ip-grid"></div></div>`);
  drawItemPicker();
  $("#ip-q").addEventListener("input", drawItemPicker);
  $("#ip-cats").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; ipCat = b.dataset.c; [...$("#ip-cats").children].forEach(x => x.setAttribute("aria-pressed", x === b)); drawItemPicker(); });
  setTimeout(() => { const q = $("#ip-q"); if (q && matchMedia("(pointer:fine)").matches) q.focus(); }, 30);
}
function drawItemPicker() {
  const f = D[ipSide], o = other(ipSide), q = key($("#ip-q").value);
  // "X için" sekmesi: öneri motorunun sırası (rakibe göre); diğerleri ada göre
  const rank = new Map(recsFor({ ...f, items: f.items.map((x, i) => i === ipSlot ? null : x) }, o, 60).map((x, i) => [x.id, i]));
  const pool = new Set([...recPool(f), ...rank.keys()]);
  const rows = (q ? ILIST : FINISHED()).filter(i => (q || ipCat === "all" || (ipCat === "rec" ? pool.has(i.id) : i.cat === ipCat)) && (!q || key(i.n + " " + i.en).includes(q)));
  const scored = rows.map(i => ({ i, why: blockOf(f, i.id, ipSlot), r: rank.has(i.id) ? rank.get(i.id) : 999 }))
    .sort((a, b) => (!!a.why - !!b.why) || (a.r - b.r) || a.i.n.localeCompare(b.i.n, "tr"));
  $("#ip-grid").innerHTML = scored.map(({ i, why, r }) => `<button type="button" class="ipb${why ? " off" : ""}" data-ipick="${i.id}"${why ? ` disabled title="${esc(why)}"` : ""}>
      <span class="ib">${i.img ? `<img src="${i.img}" alt="" loading="lazy">` : ""}${chgBadge(ICHG[i.id] && ICHG[i.id].v)}</span>
      <span class="nm">${esc(i.n)}</span>${why ? `<span class="why-off">${esc(why)}</span>` : r < 5 ? `<span class="gain good">Önerilen</span>` : ""}</button>`).join("") || '<div class="empty">Bulunamadı.</div>';
}
function logChange(side, html, before) {
  const r = simulate(D.me, D.en); if (!r || before == null) return;
  const d = Math.round((r.score - before) * 100), sf = side === "me" ? "n" : "";
  D.log.unshift(`<span class="who ${side}">${side === "me" ? "Sen" : "Rakip"}</span> ${html.replace("{s}", sf)} → avantajın <b class="${d >= 0 ? "good" : "bad"}">${d >= 0 ? "+" : "−"}${Math.abs(d)} puan</b>`); D.log = D.log.slice(0, 3);
}
function setItem(side, slot, id) {
  const f = D[side], old = f.items[slot], before = D.prev && D.prev.score; f.items[slot] = id; f.build = null;
  const boot = f.items.find(x => x && isBoot(x)); const n = slotsOf(f.role);
  if (boot) { const rest = f.items.filter(x => x && !isBoot(x)); f.items = [...rest, ...Array(n).fill(null)].slice(0, n - 1).concat(boot); }
  logChange(side, id && old ? `${esc(iname(old))} yerine <b>${esc(iname(id))}</b> aldı{s}` : id ? `<b>${esc(iname(id))}</b> aldı{s}` : `<b>${esc(iname(old))}</b> çıkardı{s}`, before);
  renderDuel();
}
document.getElementById("v-ana").addEventListener("click", e => {
  const t = e.target.closest("[data-dpick],[data-dslot],[data-dbuild],[data-drole],[data-dclear],[data-radd],[data-dgrp],[data-dme],[data-lvl],[data-team]"); if (!t) return;
  if (t.dataset.team) { const v = t.dataset.team; if (v === D.team) return; const before = D.prev && D.prev.score; D.team = v;
    // savunma eşyaları karşı takıma göre değişir (yalnızca senin tarafın)
    const f = D.me; const [items, sw] = swapDef(f.items, f.c, f.role, v); f.items = items; if (f.full) f.full = swapDef(f.full, f.c, f.role, v)[0]; f.swaps = sw;
    logChange("me", sw.length ? `karşı takıma göre ${sw.map(([a, b]) => `${esc(iname(a))} yerine <b>${esc(iname(b))}</b>`).join(", ")} aldı{s}` : `karşı takımı <b>${esc(TEAM_OPTS.find(x => x[0] === v)[1].toLocaleLowerCase("tr"))}</b> seçti{s}`, before);
    renderDuel(); return; }
  if (t.dataset.dpick) { const side = t.dataset.dpick; openPicker(side === "me" ? "Senin şampiyonun" : "Rakip şampiyon", c => { if (!c) return; D[side] = fighter(side, c); D.log = []; D.prev = null; renderDuel(); }); }
  else if (t.dataset.dslot) { const [s, i] = t.dataset.dslot.split(":"); openItemPicker(s, +i); }
  else if (t.dataset.drole) { const [s, r] = t.dataset.drole.split(":"); const f = D[s]; if (f.role === r) return; const before = D.prev && D.prev.score;
    D[s] = fighter(s, f.c, { role: r }); logChange(s, `<b>${esc(ROLE_LONG[r])}</b> buildine geçti{s}`, before); renderDuel(); }
  else if (t.dataset.dbuild) { const [s, id] = t.dataset.dbuild.split(":"); const before = D.prev && D.prev.score;
    t.classList.add("busy"); setTimeout(() => { applyPreset(s, id); const p = presetsFor(D[s].c, D[s].role).find(x => x.id === id);
      logChange(s, `<b>${esc(p ? p.lbl : "")}</b> buildini seçti{s}`, before); renderDuel(); }, 10); }
  else if (t.dataset.dclear) { const s = t.dataset.dclear; D[s].items = pad([], D[s].role); D[s].build = null; renderDuel(); }
  else if (t.dataset.radd) addRec(t.dataset.radd);
  else if (t.dataset.dgrp) { const [s0, g0] = t.dataset.dgrp.split(":"); const p = presetsFor(D[s0].c, D[s0].role).find(x => x.grp === g0 && !x.gen); if (!p) return; const before = D.prev && D.prev.score;
    D[s0].grp = g0; applyPreset(s0, p.id); logChange(s0, `<b>${esc(p.grpLbl)}</b> tarzına geçti{s}`, before); renderDuel(); }
  else if (t.dataset.dme) { D.me = fighter("me", BYSLUG[t.dataset.dme], { role: D.en.role }); D.log = []; D.prev = null; renderDuel(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  else if (t.dataset.lvl) {
    const old = D.lvl; D.lvl = Math.min(MAXL, Math.max(1, D.lvl + (+t.dataset.lvl))); if (D.lvl === old) return;
    // hazır build seçiliyse eşya sayısı seviyeyle birlikte değişir
    for (const s of ["me", "en"]) { const f = D[s]; if (f.build) { const p = presetsFor(f.c, f.role).find(x => x.id === f.build); const full = f.full || (p && !p.gen ? p.items : null); if (full) f.items = pad(itemsForLevel(full, D.lvl, f.role), f.role); } }
    const r = simulate(D.me, D.en), p = D.prev; const dd = r && p ? Math.round((r.score - p.score) * 100) : 0;
    if (p) { D.log.unshift(`Seviye <b>${D.lvl}</b>${[6, 11, 16].includes(D.lvl) && t.dataset.lvl > 0 ? " (ulti kademesi)" : ""} → avantajın <b class="${dd >= 0 ? "good" : "bad"}">${dd >= 0 ? "+" : "−"}${Math.abs(dd)} puan</b>`); D.log = D.log.slice(0, 3); }
    renderDuel();
  }
});
ov.addEventListener("click", e => {
  const p = e.target.closest("[data-ipick]"); if (p) { if (p.disabled) return; closeOv(); setItem(ipSide, ipSlot, p.dataset.ipick); return; }
  if (e.target.closest("[data-iprm]")) { closeOv(); setItem(ipSide, ipSlot, null); return; }
  const rr = e.target.closest("[data-rrep]"); if (rr) { if (rr.disabled) return; const [id, slot] = rr.dataset.rrep.split(":"); closeOv(); setItem("me", +slot, id); }
});
$("#d-swap").addEventListener("click", () => { [D.me, D.en] = [D.en, D.me]; D.me.side = "me"; D.en.side = "en"; D.log = []; D.prev = null; renderDuel(); });

/* ===================================================================
 *  ŞAMPİYONLAR (kademe listesi: "Kademe" sıralaması gruplar)
 * =================================================================== */
let cRole = "all";
const pref = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const setPref = (k, v) => { try { localStorage.setItem(k, v); } catch { } };
let cSort = pref("rk-lol-csort", "tier");
const segSet = (id, attr, v) => [...$(id).children].forEach(x => x.setAttribute("aria-pressed", x.dataset[attr] === v));
const TIER_TXT = { S: "Çok güçlü", A: "Güçlü", B: "Dengeli", C: "Biraz zayıf", D: "Zayıf", "?": "Az oynanıyor ya da verisi yok" };
$("#c-roles").innerHTML = [["all", "Tümü"], ...Object.entries(ROLE)].map(([k, v]) => `<button type="button" data-r="${k}" aria-pressed="${k === "all"}">${v}</button>`).join("");
$("#c-roles").addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (!b) return; cRole = b.dataset.r; segSet("#c-roles", "r", cRole); renderGrid(); });
$("#c-q").addEventListener("input", renderGrid);
segSet("#c-sort", "s", cSort);
$("#c-sort").addEventListener("click", e => { const b = e.target.closest("[data-s]"); if (!b) return; cSort = b.dataset.s; setPref("rk-lol-csort", cSort); segSet("#c-sort", "s", cSort); renderGrid(); });
const cst = (w, pr) => `<span class="cst"><span title="Kazanma oranı">Kazanma <b>${pct(w)}</b></span><span title="Bu koridorda seçilme oranı">Seçilme <b>${pct(pr)}</b></span></span>`;
const ccard = (c, w, pr) => `<button class="ccard" type="button" ${champBtnAttrs(c)}>${por(c)}<span class="nm">${esc(c.disp)}</span>${cst(w, pr)}</button>`;
/* Meta şampiyonlar: koridorda en az %2,5 seçilen ve %50,5 üstü kazananlar; kazanma ve seçilme birlikte puanlanır */
const META_PR = 2.5, META_WR = 50.5;
function metaPicks(role, n) {
  return LIST.map(c => { const x = c.rs[role]; if (!x || x[1] < META_PR || x[0] < META_WR) return null; return { c, wr: x[0], pr: x[1], s: (x[0] - 50) / 1.2 + Math.log2(x[1] / META_PR) }; })
    .filter(Boolean).sort((a, b) => b.s - a.s).slice(0, n);
}
function metaHTML() {
  const roles = cRole === "all" ? ROLE_ORDER : [cRole];
  const rows = roles.map(r => { const m = metaPicks(r, cRole === "all" ? 5 : 10); return m.length ? `<div class="mrow"><span class="mr-l">${roleB(r)}</span><div class="mcards">${m.map(x =>
    `<button class="mcard" type="button" ${champBtnAttrs(x.c)}>${por(x.c, "sm")}<span class="mb"><span class="nm">${esc(x.c.disp)}</span>${cst(x.wr, x.pr)}</span></button>`).join("")}</div></div>` : ""; }).join("");
  if (!rows) return "";
  return `<section class="card metabox"><h2 class="th">${ic("star")}Meta şampiyonlar<small>Yama ${esc(STATS_META ? STATS_META.patch : "–")}</small></h2>
    <p class="muted small" style="margin:0 0 10px">Bu yamada hem çok seçilen (koridorda en az %2,5) hem de kazanma oranı %50,5'in üstünde olanlar; kazanma ve seçilme birlikte puanlanır. Kaynak: u.gg, Dünya, Zümrüt+.</p>${rows}</section>`;
}
function renderGrid() {
  const q = key($("#c-q").value);
  const rOf = c => cRole === "all" ? c.main : cRole;
  const wrOf = c => { if (cRole === "all") return c.tier === "?" ? null : c.wr; const x = c.rs[cRole]; return x && x[1] >= MIN_PR ? x[0] : null; };
  const prOf = c => { const x = c.rs[rOf(c)]; return x ? x[1] : null; };
  const rows = LIST.filter(c => (cRole === "all" || c.roles.includes(cRole)) && (!q || key(c.disp).includes(q) || key(c.prof.en).includes(q)));
  const out = $("#c-grid");
  if (!rows.length) { out.innerHTML = '<div class="empty">Bulunamadı.</div>'; return; }
  const legend = `<p class="muted small legend">Kartlarda <b>Kazanma</b>: kazanma oranı, <b>Seçilme</b>: ${cRole === "all" ? "ana koridorundaki" : "bu koridordaki"} seçilme oranı. Kademe kazanma oranına göre: S %52 ve üstü · A %51 · B %49,5 · C %48 · D %48'in altı.</p>`;
  if (cSort === "az") { out.innerHTML = legend + `<div class="cgrid">${rows.sort((a, b) => a.disp.localeCompare(b.disp, "tr")).map(c => ccard(c, wrOf(c), prOf(c))).join("")}</div>`; return; }
  const groups = {}; rows.forEach(c => { const t = tierOf(wrOf(c)); (groups[t] ||= []).push(c); });
  out.innerHTML = (q ? "" : metaHTML()) + legend + ["S", "A", "B", "C", "D", "?"].filter(t => groups[t]).map(t => `<section class="tsec"><h2 class="th"><span class="tier big" data-t="${t}">${t}</span>${TIER_TXT[t]}<small>${groups[t].length}</small></h2>
    <div class="cgrid">${groups[t].sort((a, b) => (wrOf(b) || 0) - (wrOf(a) || 0) || a.disp.localeCompare(b.disp, "tr")).map(c => ccard(c, wrOf(c), prOf(c))).join("")}</div></section>`).join("")
    + `<p class="muted small">Kademe, ${cRole === "all" ? "her şampiyonun ana koridorundaki" : ROLE_LONG[cRole] + " için"} kazanma oranına göre (u.gg, Dünya, Zümrüt+, yama ${esc(STATS_META ? STATS_META.patch : "–")}). Koridorda %0,5'ten az seçilenler "?" grubunda.</p>`;
}
/* ===================================================================
 *  PROFİL — sekmeli: Build · Yetenekler · Eşleşmeler · Oynanış
 * =================================================================== */
let pRole = null, pSlug = null, pTab = "build";
function pickRow(c, wr, g) {
  const T = EDGE_TXT(wr);
  return `<button class="pick" type="button" ${champBtnAttrs(c)}>${por(c, "sm")}<span class="nm">${esc(c.disp)}${g < FEW_G ? ' <span class="few" title="300\'den az maç: oran oynak olabilir">az veri</span>' : ""}</span><span class="tag ${T[0]}">${T[1]}</span><span class="rt">${pct(wr)}<br><small>${n0(g)} maç</small></span></button>`;
}
const FEW_G = 300;
/* İstatistik sekmesi: koridor başına oranlar, eşya seçeneklerinin kazanma oranları (u.gg) */
function statsTab(c) {
  const rows = ROLE_ORDER.filter(r => c.rs[r] && c.rs[r][3] >= 50).sort((a, b) => c.rs[b][3] - c.rs[a][3]);
  const B = BUILDS[c.slug] || {};
  const optRow = (l, list) => list && list.length ? `<div class="opt"><span class="l">${l}</span><div class="irow">${list.map(([id, w, g]) => IT[id] ? `<span class="optc">${itile(id)}<span class="ow ${w >= 52 ? "good" : w < 48 ? "bad" : ""}">${pct(w)}</span><small>${n0(g)} maç</small></span>` : "").join("")}</div></div>` : "";
  const roleBlock = r => { const R = B[r]; if (!R) return "";
    const v = R.v.map(x => `<li><b>${esc((VAR_P[x[0]] || ["", x[0]])[1])}</b> çekirdeği (ilk 3 eşya): ${esc(x[1].slice(0, 3).map(iname).join(" › "))}${x[2] != null ? ` · ${pct(x[2])} kazanma` : ""}${x[3] ? ` · ${n0(x[3])} maç` : ""}</li>`).join("");
    return `<div class="card"><h2>${roleB(r)} ${esc(ROLE_LONG[r])}</h2>
      <ul class="howto" style="margin:0 0 10px;padding-left:18px">${v}${R.stw ? `<li><b>Başlangıç</b> (${esc((R.start || []).map(iname).join(" + ") || "–")}): ${pct(R.stw[0])} kazanma · ${n0(R.stw[1])} maç</li>` : ""}</ul>
      ${R.opt ? optRow("4. eşya", R.opt[0]) + optRow("5. eşya", R.opt[1]) + optRow("6. eşya", R.opt[2]) : '<p class="muted small" style="margin:0">Eşya seçeneklerinin kazanma oranı bir sonraki veri güncellemesinde gelir.</p>'}</div>`; };
  return `<div class="card"><h2>${ic("chart")}Koridorlara göre</h2>
    <div class="tblw"><table class="stbl"><thead><tr><th>Koridor</th><th>Kademe</th><th>Kazanma</th><th>Seçilme</th><th>Yasaklanma</th><th>Maç</th></tr></thead><tbody>
    ${rows.map(r => { const x = c.rs[r], t = tierOf(x[1] >= MIN_PR ? x[0] : null); return `<tr><th>${esc(ROLE_LONG[r])}</th><td><span class="tier" data-t="${t}">${t}</span></td><td>${pct(x[0])}</td><td>${pct(x[1])}</td><td>${pct(x[2])}</td><td>${n0(x[3])}${x[3] < 1000 ? ' <span class="few">az veri</span>' : ""}</td></tr>`; }).join("")}
    </tbody></table></div>
    <p class="muted small" style="margin:8px 0 0">Yasaklanma oranı şampiyonun tamamı içindir. Kademe: S %52 ve üstü · A %51 · B %49,5 · C %48 · D altı; koridorda %0,5'ten az seçilirse "?".</p></div>
    ${rolesOf(c).map(roleBlock).join("")}
    <p class="muted small" style="margin:0">Kaynak: u.gg, Dünya, Zümrüt+ (Master+ satırı Master ve üstü). Eşya seçenekleri: o sırada en çok alınan eşyalar ve kazanma oranları; az maçlı seçenekler gösterilmez.</p>`;
}
const SLOT_NAME = { P: "Pasif", Q: "Q", W: "W", E: "E", R: "Ulti" };
const CC_NAME = { hard: "Sersemletme / etkisiz bırakma", air: "Havaya kaldırma", root: "Sabitleme", silence: "Susturma" };
const numsTxt = v => Array.isArray(v) ? v.map(x => dec(x, 2)).join(" / ") : dec(v, 2);
const ratioTxt = r => Object.entries(r || {}).map(([k, v]) => `+%${numsTxt(v)} ${({ ap: "YG", ad: "SG", bad: "ilave SG", thp: "hedefin azami canı", mhp: "azami can", bhp: "ilave can", arm: "zırh", mr: "büyü direnci" })[k] || k}`).join(" ");
const baseTxt = b => b.lvl ? `${dec(b.lvl[0], 2)}–${dec(b.lvl[1], 2)} (seviyeye göre)` : (b.r.length === 1 && b.r[0] === 0 ? "" : numsTxt(b.r));
function abilityNums(c, slot) {
  const A = AB[c.slug]; const x = A && A[slot === "P" ? "i" : slot.toLowerCase()]; if (!x) return "";
  const out = [];
  if (x.d && x.d.length) { const [b, t, r, dur, k] = x.d[0]; const ps = dur && k && Math.abs(k - 1) > 0.01; out.push(`<span title="Simülasyonda kullanılan hasar">${ic("sword")}${esc([baseTxt(b), ratioTxt(r)].filter(Boolean).join(" "))}${t ? ` <small>${t === "M" ? "büyü" : t === "P" ? "fiziksel" : "gerçek"}</small>` : ""}${dur ? ` <small>${ps ? "saniyelik/vuruş başı, " : "toplam, "}${dec(dur)} sn boyunca</small>` : ""}</span>`); }
  if (x.sh) out.push(`<span title="Kalkan">${ic("shield")}${esc([baseTxt(x.sh[0]), ratioTxt(x.sh[1])].filter(Boolean).join(" "))} <small>${dec(x.sh[2])} sn</small></span>`);
  if (x.cc) out.push(`<span title="Kitle kontrolü">${ic("lock")}${CC_NAME[x.cc[0]]} ${numsTxt(x.cc[1])} sn</span>`);
  if (x.cd && slot !== "P") out.push(`<span title="Bekleme süresi">${ic("clock")}${numsTxt(x.cd)} sn</span>`);
  return out.length ? `<div class="abn">${out.join("")}</div>` : "";
}
function playTips(c) {
  const tips = [], R = BUILDS[c.slug] && (BUILDS[c.slug][c.main] || Object.values(BUILDS[c.slug])[0]);
  if (R && R.mx) tips.push(`Yetenek önceliği: <b>${R.mx.split("").join(" › ")}</b>; ultiyi 6, 11 ve 16. seviyede yükselt.`);
  if (R && R.v[0]) tips.push(`İlk eşyalar: <b>${esc(R.v[0][1].slice(0, 3).map(iname).join(" › "))}</b>${R.boots ? ` ve ${esc(iname(R.boots))}` : ""}.`);
  if (R && R.ru && RUNES.r[R.ru[0]]) tips.push(`Ana rün: <b>${esc(RUNES.r[R.ru[0]][0])}</b>${R.sp && R.sp.length ? `, büyüler: <b>${esc(R.sp.map(s => (RUNES.sp[s] || [""])[0]).join(" + "))}</b>` : ""}.`);
  const br = boardRoles(c), r0 = br.includes(c.main) ? c.main : br[0];
  const easy = r0 ? MU[r0][c.slug].filter(x => x[1] >= 52 && BYSLUG[x[0]] && BYSLUG[x[0]].roles.includes(r0)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => BYSLUG[x[0]].disp) : [];
  if (easy.length) tips.push(`${ROLE_LONG[r0]} için rahat ettiği rakipler: <b>${esc(easy.join(", "))}</b>.`);
  return tips;
}
function howToBeat(c) {
  const tips = [];
  const br = boardRoles(c), r0 = br.includes(c.main) ? c.main : br[0];
  const cs = r0 ? MU[r0][c.slug].filter(x => x[1] < 48.5 && BYSLUG[x[0]] && BYSLUG[x[0]].roles.includes(r0)).sort((a, b) => a[1] - b[1]).slice(0, 3).map(x => BYSLUG[x[0]].disp) : [];
  if (cs.length) tips.push(`${ROLE_LONG[r0]} için en sert kontraları: <b>${esc(cs.join(", "))}</b>.`);
  const A = AB[c.slug] || {};
  const ccs = ["q", "w", "e", "r"].filter(k => A[k] && A[k].cc && A[k].cc[0] !== "silence").map(k => k.toUpperCase());
  if (ccs.length) tips.push(`Kitle kontrolü: <b>${ccs.join(", ")}</b>. Bu yetenekleri harcamasını bekle; ${esc(iname("3111"))} ya da sıvışma veren eşyalar süresini kısaltır.`);
  const shs = ["i", "q", "w", "e", "r"].filter(k => A[k] && A[k].sh).map(k => k === "i" ? "pasif" : k.toUpperCase());
  if (shs.length) tips.push(`Kalkan kullanır (<b>${shs.join(", ")}</b>). Kalkanı düştükten sonra yüklen; ${esc(iname("6695"))} kalkanları zayıflatır.`);
  const trueD = ["q", "w", "e", "r"].some(k => A[k] && A[k].d && A[k].d[0] && A[k].d[0][1] === "T");
  if (trueD) tips.push("Gerçek hasar verir; zırh ve büyü direnci bunu azaltmaz.");
  tips.push(c.dmg === "AP" ? `Çoğunlukla büyü hasarı verir: büyü direnci (${esc(iname("3111"))}, ${esc(iname("4401"))}) işe yarar.` : `Çoğunlukla fiziksel hasar verir: zırh (${esc(iname("3047"))}, ${esc(iname("3143"))}) işe yarar.`);
  if (c.wr != null && c.wr < 48.5 && c.tier !== "?") tips.push(`Bu yamada zayıf (${pct(c.wr)} kazanma oranı).`);
  return tips;
}
function renderProfile(slug) {
  const c = BYSLUG[slug]; const v = $("#v-profil");
  if (slug !== pSlug) { pSlug = slug; pRole = null; bRole = null; bVar = 0; pTab = "build"; }
  if (!c) { v.innerHTML = '<div class="empty">Şampiyon bulunamadı. <a href="#sampiyonlar">Listeye dön</a>.</div>'; return; }
  const pr = c.prof || {};
  const br = boardRoles(c); if (!br.includes(pRole)) pRole = br.includes(c.main) ? c.main : br[0];
  const board = pRole ? (MU[pRole][c.slug] || []).filter(x => BYSLUG[x[0]] && BYSLUG[x[0]].roles.includes(pRole)).map(([s, w, g]) => ({ o: BYSLUG[s], w, g })) : [];
  const strong = board.filter(x => x.w >= 50).sort((a, b) => b.w - a.w), weak = board.filter(x => x.w < 50).sort((a, b) => a.w - b.w);
  const ch = CHG[c.slug];
  const tabs = [["build", "Build"], ["istat", "İstatistik"], ["yetenek", "Yetenekler"], ["eslesme", "Eşleşmeler"], ["oyna", "Oynanış"]];
  let body = "";
  if (pTab === "istat") body = statsTab(c);
  if (pTab === "build") body = `<div class="card" id="pf-build">${buildCard(c)}</div>`;
  if (pTab === "yetenek") body = `<div class="card"><div class="abil">${(pr.ab || []).map(a => {
    const cp = ch && ch.c.find(p => p[1] === a[1]); const d = cp ? cp[3].reduce((x, l) => x + l[1], 0) : null;
    return `<div class="ab${cp ? " chg-ab" : ""}"><span class="abi">${a[3] ? `<img src="${a[3]}" alt="">` : ""}${cp ? chgBadge(d > 0 ? "buff" : d < 0 ? "nerf" : "adj") : ""}</span><div style="min-width:0"><div class="k">${esc(SLOT_NAME[a[1]] || a[1])}</div><div class="n">${esc(a[0])}</div><p>${esc(a[2])}</p>${abilityNums(c, a[1])}${cp ? `<ul class="lns">${cp[3].map(lineHTML).join("")}</ul>` : ""}</div></div>`;
  }).join("") || '<div class="empty">Yetenek bilgisi yok.</div>'}</div><p class="muted small" style="margin:12px 0 0">Açıklamalar Riot Data Dragon'dan (Türkçe); sayılar LoL Wiki'den (İngilizce kaynak, CC BY-SA 4.0) alınır ve düello hesabında kullanılır.</p></div>`;
  if (pTab === "eslesme") body = br.length ? `<div class="seg sm" id="pf-roles">${br.map(r => `<button type="button" data-r="${r}" aria-pressed="${r === pRole}">${ROLE_LONG[r]}</button>`).join("")}</div>
    <div class="grid2"><div class="card"><h2 class="good-h">Rahat ettiği rakipler <small>${strong.length}</small></h2><div class="list">${strong.map(x => pickRow(x.o, x.w, x.g)).join("") || '<div class="empty">Kayıt yok.</div>'}</div></div>
    <div class="card"><h2 class="bad-h">Zorlandığı rakipler <small>${weak.length}</small></h2><div class="list">${weak.map(x => pickRow(x.o, x.w, x.g)).join("") || '<div class="empty">Kayıt yok.</div>'}</div></div></div>
    <p class="muted small" style="margin:0">Yüzde: ${esc(c.disp)}'in bu rakibe karşı kazanma oranı (u.gg, Dünya, Zümrüt+). En az 100 maçı olan eşleşmeler gösterilir; 300'den az maçlılar "az veri" diye işaretli.</p>`
    : '<div class="empty">Bu şampiyon için eşleşme verisi yok.</div>';
  if (pTab === "oyna") {
    const at = (pr.tip && pr.tip[0]) || [], et = (pr.tip && pr.tip[1]) || [];
    const pt = playTips(c), hb = howToBeat(c);
    body = `<div class="grid2"><div class="card"><h2>${ic("sword")}Nasıl oynanır</h2><ul class="howto" style="margin:0;padding-left:18px">${[...pt, ...at.map(esc)].map(t => `<li>${t}</li>`).join("") || "<li>Henüz ipucu yok.</li>"}</ul></div>
      <div class="card"><h2>${ic("shield")}Karşına çıkarsa</h2><ul class="howto" style="margin:0;padding-left:18px">${[...hb, ...et.map(esc)].map(t => `<li>${t}</li>`).join("")}</ul></div></div>
      <p class="muted small" style="margin:0">İpuçlarının bir kısmı Riot'un resmi Türkçe ipuçlarından, geri kalanı oyuncu verisinden otomatik üretilir.</p>`;
  }
  v.innerHTML = `
  <a href="#sampiyonlar" class="back">‹ Şampiyonlar</a>
  <div class="prof-head">
    ${por(c, "lg")}
    <div class="ph-id">
      <h1>${esc(c.disp)}</h1>${pr.t ? `<div class="title">${esc(pr.t)}</div>` : ""}
      <div class="prof-meta">${c.roles.map(roleB).join("")}<span class="chip ${c.dmg.toLowerCase()}">${DMG[c.dmg]}</span>${(pr.cls || []).map(x => `<span class="chip">${esc(CLS_TR[x] || x)}</span>`).join("")}${pr.d ? `<span class="chip">Zorluk <span class="diff">${[1, 2, 3].map(i => `<i class="${i <= pr.d ? "on" : ""}"></i>`).join("")}</span></span>` : ""}</div>
    </div>
    <div class="ph-kpi" title="${esc(ROLE_LONG[c.main])} için, u.gg Dünya Zümrüt+"><span class="tier big" data-t="${c.tier}" title="Kademe (kazanma oranına göre)">${c.tier}</span><div><b>${pct(c.wr)}</b><span>kazanma oranı</span></div><div><b>${pct(c.pr)}</b><span>seçilme oranı</span></div><div><b>${pct(c.br)}</b><span>yasaklanma oranı</span></div></div>
    <div class="ph-cta"><button class="btn gold" type="button" id="pf-duel">${ic("duel")}Düelloda dene</button></div>
  </div>
  ${ch ? `<button type="button" class="chstrip" data-v="${ch.v}" data-chg="${c.slug}">${chgBadge(ch.v)}<span>Yama ${esc(NOTES.patch || "")}: <b>${esc(VMARK[ch.v][1])}</b> · ${ch.c.length ? esc(ch.c.map(p => p[0] || "Genel").join(", ")) : "yeni şampiyon"}</span><span class="go">Ayrıntı ›</span></button>` : ""}
  <div class="ptabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-pt="${k}" aria-selected="${k === pTab}">${l}</button>`).join("")}</div>
  ${body}`;
  $("#pf-duel").onclick = () => { D.me = fighter("me", c, { role: bRole || undefined }); D.log = []; D.prev = null; location.hash = "ana"; };
  v.querySelector(".ptabs").onclick = e => { const b = e.target.closest("[data-pt]"); if (!b) return; pTab = b.dataset.pt; renderProfile(slug); };
  const pb = $("#pf-build"); if (pb) pb.onclick = e => { const b = e.target.closest("[data-br],[data-bv]"); if (!b) return; if (b.dataset.br) { bRole = b.dataset.br; bVar = 0; } else bVar = +b.dataset.bv; pb.innerHTML = buildCard(c); };
  const pr2 = $("#pf-roles"); if (pr2) pr2.onclick = e => { const b = e.target.closest("[data-r]"); if (!b) return; pRole = b.dataset.r; renderProfile(slug); };
  document.title = `${c.disp} · Rift Kontra LoL`;
}

/* ===================================================================
 *  EŞYALAR — kategoriye göre gruplu simge ızgarası
 * =================================================================== */
$("#e-q").addEventListener("input", renderItems);
const ICAT_ORDER = ["fiz", "buy", "sav", "des", "bot", "bas", "ara"];
function renderItems() {
  const q = key($("#e-q").value);
  const statTxt = i => Object.entries(i.s || {}).map(([k, v]) => STAT_TR[k] || k).join(" ");
  const rows = ILIST.filter(i => !q || key(i.n + " " + i.en + " " + statTxt(i) + " " + i.fx).includes(q));
  $("#e-out").innerHTML = ICAT_ORDER.map(k => {
    const g = rows.filter(i => i.cat === k).sort((a, b) => (b.c - a.c) || a.n.localeCompare(b.n, "tr")); if (!g.length) return "";
    return `<section class="isec" id="cat-${k}"><h2 class="th">${CAT_ALL[k]}<small>${g.length}</small></h2><div class="igrid2">${g.map(i => itile(i.id)).join("")}</div></section>`;
  }).join("") || '<div class="empty">Eşleşen eşya yok.</div>';
}
$("#e-cats").innerHTML = ICAT_ORDER.map(k => `<a href="#esyalar" data-jump="cat-${k}">${CAT_ALL[k]}</a>`).join("");
$("#e-cats").addEventListener("click", e => { const a = e.target.closest("[data-jump]"); if (!a) return; e.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
/* Eşya ayrıntısı: sayılar + Türkçe etki + yama değişikliği */
function fxHTML(fx) {
  return (fx || "").split("\n").map(l => { const m = l.match(/^§([^§]+)§\s*(.*)$/); return m ? `<p><b class="fxn">${esc(m[1])}</b>${m[2] ? " " + esc(m[2]) : ""}</p>` : `<p>${esc(l)}</p>`; }).join("");
}
function showItem(id) {
  const i = IT[id]; if (!i) return;
  const stats = Object.entries(i.s || {}).map(([k, v]) => fmtStat(k, v));
  // kim alır listesi yerine: bu eşyanın alım kuralları
  const rules = [...igrp(id).filter(g => g !== "starter").map(g => { const o = ILIST.filter(x => x.id !== id && x.tier === "fin" && igrp(x.id).includes(g)).map(x => x.n); return o.length ? `Tek ${GRP_TR[g] || g} eşyası: ${o.join(", ")} ile birlikte alınamaz.` : ""; }),
    isT3Boot(id) ? "Gelişmiş çizme: yalnızca orta koridor rol görevini tamamlayınca alınır." : "", isSupItem(id) ? "Destek eşyası: yalnızca destek rolünde." : "", i.ro ? "Yalnızca menzilli şampiyonlar alabilir." : ""].filter(Boolean);
  openOv(`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(i.n)}" style="width:min(500px,100%)">
    <div class="sheet-head">${icoImg(id, "ico-lg")}<div style="flex:1;min-width:0"><h3 style="margin:0">${esc(i.n)}</h3><span class="muted small">${esc(CAT_ALL[i.cat] || "")} · <b class="gold-t">${n0(i.c)} altın</b></span></div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    ${stats.length ? `<ul class="stl">${stats.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    ${i.fx ? `<div class="fx">${fxHTML(i.fx)}</div>` : i.pt ? `<p style="margin:0">${esc(i.pt)}</p>` : ""}
    ${i.from && i.from.length ? `<div><div class="muted small" style="margin-bottom:6px">Yapımı</div><div class="irow">${i.from.map(x => itile(x)).join("")}</div></div>` : ""}
    ${rules.length ? `<ul class="stl rules">${rules.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${ICHG[id] ? `<div class="chbox">${vPill(ICHG[id].v)} <span class="muted small">Yama ${esc(NOTES.patch || "")}</span>${changeBody(ICHG[id])}</div>` : ""}
    <p class="muted small" style="margin:0">İngilizce adı: ${esc(i.en)}</p></div>`);
  ov.querySelector("[data-close]").focus();
}

/* ===================================================================
 *  YAMA
 * =================================================================== */
function renderPatch() {
  const n = NOTES, ORDER = ["new", "rework", "buff", "nerf", "adj"];
  const H = { new: "Yeni şampiyonlar", rework: "Yeniden tasarlananlar", buff: "Güçlendirilenler", nerf: "Zayıflatılanlar", adj: "Dengelenenler" };
  if (!n || !n.patch) { $("#y-out").innerHTML = '<div class="empty">Bu yamanın Türkçe notları henüz yayınlanmadı.</div>'; $("#d-patch").innerHTML = ""; return; }
  const champs = (n.champs || []).map(s => BYSLUG[s]).filter(Boolean), items = Object.keys(ICHG).filter(k => IT[k]);
  const sec = v => {
    const cs = champs.filter(c => (CHG[c.slug] || {}).v === v), is = items.filter(e => (ICHG[e] || {}).v === v); if (!cs.length && !is.length) return "";
    return `<section class="psec" data-v="${v}"><h2 class="th">${chgBadge(v)}${H[v]}<small>${cs.length + is.length}</small></h2>
      <div class="chgrid">${cs.map(c => `<button class="chtile" type="button" data-chg="${c.slug}">${por(c)}<span>${esc(c.disp)}</span></button>`).join("")}${is.map(id => itile(id)).join("")}</div></section>`;
  };
  $("#y-patch").textContent = n.patch;
  $("#y-out").innerHTML = `<div class="vlegend">${ORDER.map(v => `<span>${chgBadge(v)}${VMARK[v][1]}</span>`).join("")}</div>`
    + ORDER.map(sec).join("")
    + `<p class="muted small">Simgeye dokun: hangi yetenek ya da değer, eskisi ve yenisi. Kaynak: <a href="${esc(n.url)}" target="_blank" rel="noopener">resmi Türkçe yama notları</a>. Bu sitede yalnızca Sihirdar Vadisi şampiyon ve eşya değişiklikleri gösterilir.</p>`;
  $("#d-patch").innerHTML = `<a class="pstrip" href="#yama">${ic("scroll")}<span><b>Yama ${esc(n.patch)}</b> · ${champs.length} şampiyon, ${items.length} eşya değişti</span><span class="faces">${champs.slice(0, 6).map(c => por(c, "sm")).join("")}</span><span class="go">Gör ›</span></a>`;
}

/* ===================================================================
 *  YÖNLENDİRME
 * =================================================================== */
const VIEWS = ["ana", "sampiyonlar", "esyalar", "yama"];
const TITLES = { ana: "Rift Kontra · LoL düello ve kontra", sampiyonlar: "Şampiyonlar · Rift Kontra LoL", esyalar: "Eşyalar · Rift Kontra LoL", yama: "Yama notları · Rift Kontra LoL" };
function route() {
  if (!ov.hidden) { ov.hidden = true; ov.innerHTML = ""; document.body.style.overflow = ""; }
  let h = (location.hash || "#ana").slice(1); let v = "ana";
  if (h.startsWith("kontra-") && BYSLUG[h.slice(7)]) {
    const en = BYSLUG[h.slice(7)]; D.en = fighter("en", en, { role: en.main });
    const best = (MU[en.main] && MU[en.main][en.slug] || []).filter(x => x[1] < 50 && BYSLUG[x[0]] && BYSLUG[x[0]].roles.includes(en.main)).sort((a, b) => a[1] - b[1])[0];
    if (best) D.me = fighter("me", BYSLUG[best[0]], { role: D.en.role }); D.log = []; D.prev = null; history.replaceState(null, "", "#ana"); h = "ana";
  }
  if (h === "kontra" || h === "item" || h === "duello") h = "ana";
  if (h === "kademe") { cSort = "tier"; segSet("#c-sort", "s", cSort); renderGrid(); h = "sampiyonlar"; }
  if (VIEWS.includes(h)) v = h;
  if (h.startsWith("s-")) { v = "profil"; renderProfile(h.slice(2)); } else document.title = TITLES[v];
  if (v === "ana") renderDuel();
  ["ana", "sampiyonlar", "profil", "esyalar", "yama"].forEach(x => $("#v-" + x).hidden = x !== v);
  const nav = v === "profil" ? "sampiyonlar" : v;
  document.querySelectorAll(".tabs a, .bnav a").forEach(a => { if (a.getAttribute("href") === "#" + nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* Yama ve güncellik */
document.querySelectorAll(".patch").forEach(e => e.textContent = "Yama " + (META.patch || ""));
(() => {
  const f = $("#footFresh"); const at = META.checkedAt; if (!at || !f) return;
  const days = (Date.now() - new Date(at)) / 864e5;
  f.textContent = `Veriler: Yama ${META.patch}${STATS_META ? ` · oranlar ve buildler yama ${STATS_META.patch} (${STATS_META.region}, ${STATS_META.rank}, ${n0(STATS_META.games)} maç)` : " · oran verisi yok"} · son kontrol ${fmtDate(at)}${days > 3 ? " (güncelleme gecikti)" : ""}.`;
})();
$("#hSearch").addEventListener("click", () => openPicker("Şampiyon ara", c => { if (c) location.hash = "s-" + c.slug; }));
if ("serviceWorker" in navigator && location.protocol === "https:") {
  // Yeni sürüm yayınlanınca sayfa bir kez kendiliğinden yenilenir (eski önbellekte takılı kalmasın)
  const hadCtl = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadCtl && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register("../sw.js", { updateViaCache: "none", scope: "../" }).then(r => r.update()).catch(() => { });
}
dLoad(); renderGrid(); renderItems(); renderPatch(); route();

/* ===================================================================
 *  BİLGİ KUTUSU — eşya, rün, büyü ve şampiyon simgelerinin üstüne gelince (her ekranda)
 *  Tek bir kutu; simge görselinin adresinden ne olduğu bulunur. Fare: 120 ms gecikme, çıkınca kapanır.
 *  Klavye: odaklanınca açılır. Dokunmatik: dokunuş bozulmaz; basılı tutunca (0,5 sn) açılır.
 * =================================================================== */
(() => {
  const BY = new Map();
  for (const id in IT) if (IT[id].img) BY.set(IT[id].img, ["i", id]);
  for (const id in RUNES.r) if (RUNES.r[id][1]) BY.set(RUNES.r[id][1], ["r", id]);
  for (const id in RUNES.st) if (RUNES.st[id][1]) BY.set(RUNES.st[id][1], ["t", id]);
  for (const id in RUNES.sp) if (RUNES.sp[id][1]) BY.set(RUNES.sp[id][1], ["s", id]);
  for (const c of LIST) if (c.prof && c.prof.p) BY.set(c.prof.p, ["c", c.slug]);
  const tip = document.createElement("div"); tip.id = "tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true; document.body.append(tip);
  const kOf = img => img ? BY.get(img.getAttribute("src")) : null;
  const what = el => {
    if (!el || !el.closest || el.closest("#tip")) return null;
    const btn = el.closest("button, a");
    if (btn) { const imgs = btn.querySelectorAll("img"); if (imgs.length === 1) { const k = kOf(imgs[0]); if (k) return { host: btn, k }; } }
    if (el.tagName === "IMG") { const k = kOf(el); if (k) return { host: el, k }; }
    const p = el.closest(".por, .ib"); if (p) { const k = kOf(p.querySelector("img")); if (k) return { host: p, k }; }
    return null;
  };
  const statsLine = id => Object.entries(istat(id)).map(([k, v]) => `<li>${esc(fmtStat(k, v))}</li>`).join("");
  function body([t, id]) {
    if (t === "i") { const i = IT[id]; return `<div class="tt-h">${icoImg(id, "tt-ic")}<span><b>${esc(i.n)}</b><small class="gold-t">${i.c ? n0(i.c) + " altın" : "Bedelsiz"}</small></span></div>
      ${statsLine(id) ? `<ul class="tt-st">${statsLine(id)}</ul>` : ""}${i.fx ? `<div class="tt-fx">${fxHTML(i.fx)}</div>` : i.pt ? `<p>${esc(i.pt)}</p>` : ""}`; }
    if (t === "r") { const r = RUNES.r[id], tr = RUNES.st[r[2]]; return `<div class="tt-h"><img class="tt-ic rnd" src="${r[1]}" alt=""><span><b>${esc(r[0])}</b>${tr ? `<small>${esc(tr[0])}${r[3] === 0 ? " · anahtar rün" : ""}</small>` : ""}</span></div>${r[4] ? `<p>${esc(r[4])}</p>` : ""}`; }
    if (t === "t") { const r = RUNES.st[id]; return `<div class="tt-h"><img class="tt-ic rnd" src="${r[1]}" alt=""><span><b>${esc(r[0])}</b><small>Rün ağacı</small></span></div>`; }
    if (t === "s") { const s = RUNES.sp[id]; return `<div class="tt-h"><img class="tt-ic" src="${s[1]}" alt=""><span><b>${esc(s[0])}</b><small>Sihirdar büyüsü</small></span></div>${s[2] ? `<p>${esc(s[2])}</p>` : ""}`; }
    if (t === "c") { const c = BYSLUG[id]; return `<div class="tt-h"><img class="tt-ic" src="${c.prof.p}" alt=""><span><b>${esc(c.disp)}</b>${c.prof.t ? `<small>${esc(c.prof.t)}</small>` : ""}</span></div>
      <p>${c.roles.map(r => esc(ROLE_LONG[r])).join(", ")} · ${(c.prof.cls || []).map(x => esc(CLS_TR[x] || x)).join(", ")} · ${esc(DMG[c.dmg])}</p>
      <p><span class="tier" data-t="${c.tier}">${c.tier}</span> ${c.wr != null ? `${pct(c.wr)} kazanma · ${pct(c.pr)} seçilme <small class="muted">(${esc(ROLE_LONG[c.main])})</small>` : "Oran verisi yok"}</p>`; }
    return "";
  }
  let cur = null, timer = 0, saved = [], pend = null;
  function place(host) {
    const r = host.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = innerHeight;
    tip.style.left = "0px"; tip.style.top = "0px"; tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = Math.min(Math.max(8, r.left), vw - w - 8), y = r.bottom + 8;
    if (y + h > vh - 8) y = r.top - h - 8;          // altta yer yoksa üstte; imleç simgenin üstünde kalır, kutu onu örtmez
    if (y < 8) { y = Math.max(8, Math.min(vh - h - 8, r.top)); x = r.right + 8 + w < vw ? r.right + 8 : Math.max(8, r.left - w - 8); }
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function show(m) {
    hide(); cur = m; tip.innerHTML = body(m.k); if (!tip.innerHTML) return;
    // tarayıcının kendi ipucu iki kez görünmesin
    [m.host, ...m.host.querySelectorAll("[title]")].forEach(e => { if (e.hasAttribute && e.hasAttribute("title")) { saved.push([e, e.getAttribute("title")]); e.removeAttribute("title"); } });
    place(m.host);
  }
  function hide() { clearTimeout(timer); tip.hidden = true; cur = null; saved.forEach(([e, t]) => e.setAttribute("title", t)); saved = []; }
  document.addEventListener("pointerover", e => {
    if (e.pointerType === "touch") return; const m = what(e.target); if (!m) return; if (cur && cur.host === m.host) return;
    clearTimeout(timer); pend = m.host; timer = setTimeout(() => { pend = null; show(m); }, 120);
  });
  document.addEventListener("pointerout", e => {
    if (e.pointerType === "touch") return; const host = cur ? cur.host : pend;
    if (!host || (e.relatedTarget && host.contains(e.relatedTarget))) return;
    pend = null; hide();
  });
  document.addEventListener("focusin", e => { if (!e.target.matches || !e.target.matches(":focus-visible")) return; const m = what(e.target); if (m) show(m); else hide(); });
  document.addEventListener("focusout", hide);
  addEventListener("scroll", hide, { passive: true, capture: true });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && cur) hide(); });
  // dokunmatik: basılı tutunca aç, ardından gelen dokunuşu yut
  let lp = 0, sx = 0, sy = 0, eat = false;
  document.addEventListener("pointerdown", e => {
    if (e.pointerType !== "touch") { if (cur && !cur.host.contains(e.target)) hide(); return; }
    if (cur) hide(); const m = what(e.target); if (!m) return; sx = e.clientX; sy = e.clientY;
    clearTimeout(lp); lp = setTimeout(() => { show(m); eat = true; }, 500);
  });
  document.addEventListener("pointermove", e => { if (e.pointerType === "touch" && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) clearTimeout(lp); });
  document.addEventListener("pointerup", e => { if (e.pointerType === "touch") clearTimeout(lp); });
  document.addEventListener("pointercancel", () => clearTimeout(lp));
  document.addEventListener("click", e => { if (eat) { eat = false; e.preventDefault(); e.stopPropagation(); } }, true);
  document.addEventListener("contextmenu", e => { if (cur && eat) e.preventDefault(); });
  addEventListener("hashchange", hide);
})();
