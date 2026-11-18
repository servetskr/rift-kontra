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
function buildCard(c) {
  const b = BUILDS[c.slug];
  if (!b || !Object.keys(b).length) return `<div class="empty">Bu şampiyon için oyuncu build verisi henüz yok (u.gg). Düello ekranındaki tarz düğmeleri sınıfına göre tahmini eşyalar önerir.</div>`;
  const roles = Object.keys(b).sort((x, y) => b[y].g - b[x].g); if (!roles.includes(bRole)) bRole = roles.includes(c.main) ? c.main : roles[0];
  const R = b[bRole]; if (!R.v[bVar]) bVar = 0; const V = R.v[bVar];
  const ru = R.ru || [];
  return `${roles.length > 1 ? `<div class="seg sm" style="margin-bottom:10px">${roles.map(r => `<button type="button" data-br="${r}" aria-pressed="${r === bRole}">${ROLE_LONG[r]}</button>`).join("")}</div>` : ""}
    <div class="vtabs" role="tablist">${R.v.map((v, i) => { const m = VAR[v[0]] || ["wand", v[0]]; return `<button type="button" role="tab" data-bv="${i}" aria-selected="${i === bVar}">${ic(m[0])}${esc(m[1])}</button>`; }).join("")}</div>
    <p class="muted small" style="margin:0 0 10px">${esc(ROLE_LONG[bRole])} · ${n0(R.g)} maç · kazanma ${pct(R.wr)}${V[3] ? ` · bu dizilim ${n0(V[3])} maç${V[2] != null ? ", " + pct(V[2]) : ""}` : ""}</p>
    ${R.start && R.start.length ? `<div class="brow2"><span class="l" title="Başlangıç">Başla</span><div class="irow">${R.start.map(id => itile(id)).join("")}</div></div>` : ""}
    <div class="brow2"><span class="l" title="Eşya sırası">Build</span><div class="irow">${V[1].map((id, i) => itile(id, i + 1)).join('<span class="arrow" aria-hidden="true">›</span>')}</div></div>
    <div class="bsub">
      ${R.boots ? `<div><span class="l" title="Çizme">${ic("boot")}</span>${itile(R.boots)}</div>` : ""}
      ${ru.length ? `<div class="runes"><span class="l" title="Rünler">${ic("rune")}</span>${runeImg(ru[0], "ks")}<span class="minor">${ru.slice(1, 4).map(n => runeImg(n)).join("")}</span><span class="minor sec">${ru.slice(4, 6).map(n => runeImg(n)).join("")}</span><span class="rn">${esc((RUNES.r[ru[0]] || [""])[0])}</span></div>` : ""}
      ${R.sp && R.sp.length ? `<div class="spells"><span class="l" title="Sihirdar büyüleri">${ic("spark")}</span>${R.sp.map(spellImg).join("")}<span class="small">${esc(R.sp.map(s => (RUNES.sp[s] || [""])[0]).join(" + "))}</span></div>` : ""}
    </div>
    ${R.so ? `<h3 class="h3">Yetenek sırası</h3>${skillOrderHTML(R.so, R.mx)}` : ""}
    ${R.sit && R.sit.length ? `<h3 class="h3">Duruma göre</h3><div class="irow">${R.sit.map(id => itile(id)).join("")}</div>` : ""}`;
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
      aaHit: s.ad * (1 + s.crit * (s.critMul - 1)) * mulOf(s, o, "P"), dAA: 0, dAB: 0, absorbed: 0,
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
      if (x.raw > 0) { if (x.dot > 0) out.dots.push({ ps: x.raw * x.mul / x.dot, until: t + x.dot }); else out.ab += x.raw * x.mul; }
      if (x.sh > 0) X.shields.push({ v: x.sh, until: t + x.shDur });
      if (x.cc) out.cc.push(x.cc);
      X.cds[i] = x.cd;
    });
    const rootedMelee = X.s.melee && !O.s.melee && t < X.rootUntil - 1e-9;
    if (!hard && !rootedMelee && X.aaT <= 0) { out.aa = X.aaHit; X.aaT = X.aaInt; }
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
const matchRole = (me, en) => me.c.roles.find(x => en.c.roles.includes(x)) || en.c.main;
function simulate(me, en) {
  const F = fightSim(me, en); if (!F) return null;
  const { sm, se, ttkMe, ttkEn } = F;
  const r = ttkEn / ttkMe, stat = r / (1 + r);
  const role = matchRole(me, en);
  const e = edge(me.c, en.c, role);
  // gerçek maç verisi (koridor eşleşmesi) simülasyondan daha güvenilir: yarı yarıya
  const real = e ? Math.min(0.95, Math.max(0.05, 0.5 + (e.wr - 50) * 0.03)) : null;
  const score = real != null ? 0.5 * stat + 0.5 * real : stat;
  const passMe = mulOf(sm, se, sm.t), passEn = mulOf(se, sm, se.t);
  return { ...F, score, edge: e, role, passMe, ehpMe: sm.hp / passEn };
}

/* ===================================================================
 *  BUILD TARZLARI — aynı şampiyon tank, büyücü, nişancı… oynanabilir
 *  Düz düğmeler oyuncuların gerçekten kullandığı tarzlardır (u.gg); "?" işaretliler deneysel.
 * =================================================================== */
const STYLES = [["tank", "Tank", "shield"], ["mage", "Büyücü", "spark"], ["adc", "Nişancı", "target"], ["bruiser", "Dövüşçü", "sword"], ["assassin", "Suikastçı", "bolt"]];
/* Deneysel tarzlar için Data Dragon kimlikleriyle örnek eşyalar (yamada kalkan eşya otomatik düşer) */
const ARCH = {
  tank: ["3068", "3084", "3075", "4401", "2504", "3143", "6665", "2502", "3742", "3047"],
  mage: ["6655", "4645", "3089", "3135", "3157", "6653", "4646", "3020"],
  adc: ["3031", "6672", "3046", "3036", "3072", "3032", "6675", "3006"],
  bruiser: ["3071", "3053", "6333", "6610", "3078", "3161", "6692", "3047"],
  assassin: ["3142", "6701", "3814", "6694", "6698", "6697", "3158"],
};
function styleOf(items, c) {
  const t = { ap: 0, crit: 0, def: 0, ad: 0, leth: 0 };
  items.forEach(id => { const x = (IT[id] || {}).s || {}; t.ap += x.ap || 0; t.crit += (x.crit || 0) * 2 + (x.as || 0); t.def += (x.armor || 0) + (x.mr || 0) + (x.hp || 0) / 12; t.ad += x.ad || 0; t.leth += (x.leth || 0) * 4; });
  if (t.ap >= Math.max(60, t.ad)) return t.def > t.ap * 1.6 ? "tank" : "mage";
  if (t.crit >= 60) return "adc";
  if (t.def > (t.ad + t.ap) * 2.2) return "tank";
  if (t.leth >= t.ad * 0.6) return "assassin";
  if (c && c.prof.cls[0] === "Marksman") return "adc";
  return "bruiser";
}
const styleCache = {};
function stylesFor(c) {
  if (styleCache[c.slug]) return styleCache[c.slug];
  const out = {}; const b = BUILDS[c.slug];
  if (b) {
    const roles = [c.main, ...Object.keys(b).filter(r => r !== c.main)].filter(r => b[r]);
    for (const r of roles) for (const v of b[r].v) {
      const its = [...v[1].slice(0, 5), b[r].boots].filter(id => id && IT[id]);
      const st = styleOf(its, c); if (!out[st]) out[st] = { items: its, real: true, role: r };
    }
  }
  for (const [k] of STYLES) if (!out[k]) { const its = ARCH[k].filter(id => IT[id]); const boot = its.find(isBoot); out[k] = { items: [...its.filter(id => !isBoot(id)).slice(0, 5), boot].filter(Boolean), real: false }; }
  const cls = c.prof.cls[0];
  out._def = b ? STYLES.map(x => x[0]).find(k => out[k].real && out[k].role === c.main) || STYLES.map(x => x[0]).find(k => out[k].real)
    : ({ Tank: "tank", Mage: "mage", Marksman: "adc", Fighter: "bruiser", Assassin: "assassin", Support: "mage" }[cls] || "bruiser");
  return styleCache[c.slug] = out;
}
/* Seviyeye uygun eşya sayısı: oyunda 11. seviyede genelde 3 eşya + çizme olur */
const itemsForLevel = (items, L) => {
  const boot = items.find(isBoot), rest = items.filter(id => id && !isBoot(id));
  const k = L <= 3 ? 0 : L <= 6 ? 1 : L <= 9 ? 2 : L <= 12 ? 3 : L <= 15 ? 4 : 5;
  return [...rest.slice(0, k), L >= 4 ? boot : null].filter(Boolean);
};
const defaultItems = c => { const S = stylesFor(c); return itemsForLevel(S[S._def].items, D.lvl); };

/* ===================================================================
 *  DÜELLO EKRANI
 * =================================================================== */
const SLOTS = 6, MAXL = 18;
const D = { me: null, en: null, lvl: 11, prev: null, log: [] };
const dSave = () => { try { localStorage.setItem("rk-lol-duel", JSON.stringify({ me: D.me && { s: D.me.c.slug, i: D.me.items, y: D.me.style }, en: D.en && { s: D.en.c.slug, i: D.en.items, y: D.en.style }, lvl: D.lvl })); } catch { } };
const fighter = (c, items, style) => ({ c, style: items ? (style || null) : stylesFor(c)._def, items: [...(items || defaultItems(c)).filter(id => !id || IT[id]), ...Array(SLOTS).fill(null)].slice(0, SLOTS), get lvl() { return D.lvl; } });
function dLoad() {
  try {
    const s = JSON.parse(localStorage.getItem("rk-lol-duel") || "null");
    if (s && s.me && BYSLUG[s.me.s] && s.en && BYSLUG[s.en.s]) { D.me = fighter(BYSLUG[s.me.s], s.me.i, s.me.y); D.en = fighter(BYSLUG[s.en.s], s.en.i, s.en.y); D.lvl = Math.min(MAXL, Math.max(1, s.lvl || 11)); return; }
  } catch { }
  D.me = fighter(BYSLUG.garen || LIST[0]); D.en = fighter(BYSLUG.darius || LIST[1]);
}
const verdictTxt = s => s >= 0.62 ? ["Sen kazanırsın", "good"] : s >= 0.54 ? ["Avantaj sende", "good"] : s > 0.46 ? ["Başa baş", "even"] : s > 0.38 ? ["Rakip önde", "bad"] : ["Rakip kazanır", "bad"];
const secs = t => t >= 60 ? "60+ sn" : (t < 10 ? dec(t) : Math.round(t)) + " sn";

function fighterHTML(side) {
  const f = D[side], c = f.c, st = fstats(f);
  const S = stylesFor(c);
  const abl = AB[c.slug] && Object.values(AB[c.slug]).some(x => x.d && x.d.length);
  return `<div class="f-top">
      <button type="button" class="f-pick" data-dpick="${side}" aria-label="${side === "me" ? "Şampiyonunu" : "Rakibi"} değiştir: ${esc(c.disp)}">${por(c, "xl")}<span class="f-swap">${ic("swap")}</span></button>
      <div class="f-id"><span class="f-side">${side === "me" ? "Sen" : "Rakip"}</span><b class="f-name">${esc(c.disp)}</b>
        <span class="f-sub">${tierB(c)} ${c.roles.slice(0, 2).map(r => ROLE[r]).join(" · ")}</span></div>
    </div>
    <div class="f-items">${f.items.map((id, i) => id && IT[id] ? `<button type="button" class="slot-i" data-dslot="${side}:${i}" aria-label="${esc(iname(id))}: değiştir" title="${esc(iname(id))}"><img src="${IT[id].img}" alt="">${chgBadge(ICHG[id] && ICHG[id].v)}</button>`
      : `<button type="button" class="slot-i empty" data-dslot="${side}:${i}" aria-label="Eşya ekle">${ic("plus")}</button>`).join("")}</div>
    ${st ? `<dl class="f-stats">
      <div><dt>Can</dt><dd>${n0(st.hp)}</dd></div>
      ${(m => `<div><dt>${m ? "Yetenek G." : "Saldırı G."}</dt><dd>${n0(m ? st.ap : st.ad)}</dd></div>`)(st.t === "M" && st.ap > 0)}
      <div><dt>Zırh</dt><dd>${n0(st.ar)}</dd></div>
      <div><dt>Büyü D.</dt><dd>${n0(st.mr)}</dd></div>
      <div><dt>Saldırı H.</dt><dd>${st.as.toFixed(2).replace(".", ",")}</dd></div>
    </dl>` : `<p class="muted small">Bu şampiyonun taban değerleri henüz yok.</p>`}
    <div class="f-styles" role="group" aria-label="Build tarzı">${STYLES.map(([k, l, i]) => `<button type="button" data-dstyle="${side}:${k}" aria-pressed="${f.style === k}" class="${S[k].real ? "real" : "exp"}" title="${S[k].real ? "Oyuncuların gerçekten oynadığı tarz (u.gg)" : "Deneysel: oyuncular bu tarzı nadiren kullanır"}">${ic(i)}${k === "adc" && c.b && c.b.rng < 300 ? "Kritik" : l}${S[k].real ? "" : "<sup>?</sup>"}</button>`).join("")}</div>
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
function renderDuel() {
  $("#f-me").innerHTML = fighterHTML("me"); $("#f-en").innerHTML = fighterHTML("en");
  $("#d-lvl").textContent = D.lvl;
  const r = simulate(D.me, D.en), out = $("#d-result");
  if (!r) { out.innerHTML = '<div class="empty">Bu eşleşme için taban değer verisi yok.</div>'; return; }
  const p = D.prev; const rel = (a, b) => b ? (a - b) / b : null;
  const V = verdictTxt(r.score), pctMe = Math.round(r.score * 100);
  const E = r.edge ? EDGE_TXT(r.edge.wr) : null;
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
    <p class="muted small" style="margin:-6px 0 0">Hasarının <b>%${Math.round(r.abShareMe * 100)}</b>'i yeteneklerden, <b>%${100 - Math.round(r.abShareMe * 100)}</b>'i normal saldırıdan.</p>
    ${D.log.length ? `<ul class="dlog">${D.log.slice(0, 3).map((l, i) => `<li class="${i ? "old" : ""}">${l}</li>`).join("")}</ul>` : `<p class="muted small" style="margin:0">Bir eşyayı, tarzı ya da seviyeyi değiştir; sonuç anında değişsin.</p>`}
    <details class="why"><summary>${ic("info")} Hesap neyi içeriyor?</summary><p>Saniye saniye simülasyon: LoL taban değerleri ve seviye büyümesi, eşya sayıları, yetenek hasarları ve oranları, bekleme süreleri (yetenek hızıyla), oyuncuların yetenek sırası, kalkanlar ve kitle kontrolü (sersemletme, havaya kaldırma, susturma; sabitlenen yakın dövüşçü uzaktakine vuramaz). Can çalma ve sıvışma dahildir. Menzil, hareket ve kaçma, iyileştirme yetenekleri, rünler, sihirdar büyüleri ve çoğu eşya pasifi hesaba katılmaz. Sonuç tahminidir.</p></details>
    <button type="button" class="btn gold fight" id="d-fight">${ic("play")}Dövüştür</button>
    <div class="arena-bars" id="d-bars" hidden>
      <span class="hb-clock" id="hb-t">0 sn</span>
      <div><span>${esc(D.me.c.disp)} <em class="ccf" id="cc-me"></em></span><i><b id="hb-me"></b><u id="sh-me"></u></i></div>
      <div><span>${esc(D.en.c.disp)} <em class="ccf" id="cc-en"></em></span><i><b id="hb-en" class="en"></b><u id="sh-en"></u></i></div>
      <p id="d-ko" class="ko" aria-live="polite"></p>
    </div>`;
  $("#d-fight").onclick = () => fight(r);
  renderRecs(); renderCounters(r);
  D.prev = { ttkMe: r.ttkMe, ttkEn: r.ttkEn, passMe: r.passMe, ehpMe: r.ehpMe, score: r.score };
  dSave();
}
/* Can çubukları: simülasyondaki gerçek can, kalkan ve kitle kontrolü zaman çizelgesi oynatılır */
let fightRAF = 0;
function fight(r) {
  cancelAnimationFrame(fightRAF);
  const bars = $("#d-bars"); bars.hidden = false;
  const me = $("#hb-me"), en = $("#hb-en"), sme = $("#sh-me"), sen = $("#sh-en"), ko = $("#d-ko"), clock = $("#hb-t"), cme = $("#cc-me"), cen = $("#cc-en");
  ko.textContent = ""; const tl = r.tl, end = tl[tl.length - 1][0];
  const dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : Math.min(4200, Math.max(1600, end * 300));
  const t0 = performance.now(); let done = false;
  const at = t => { let i = 0; while (i < tl.length - 1 && tl[i + 1][0] <= t) i++; return tl[i]; };
  const ccT = v => v === 1 ? "kontrol altında" : v === 2 ? "kısıtlı" : "";
  const step = now => {
    if (done) return; const k = dur ? Math.min(1, (now - t0) / dur) : 1; const p = at(end * k); if (k >= 1) done = true;
    me.style.width = (p[1] * 100) + "%"; en.style.width = (p[2] * 100) + "%";
    sme.style.left = (p[1] * 100) + "%"; sme.style.width = Math.min(100 - p[1] * 100, p[3] * 100) + "%";
    sen.style.left = (p[2] * 100) + "%"; sen.style.width = Math.min(100 - p[2] * 100, p[4] * 100) + "%";
    cme.textContent = ccT(p[5]); cen.textContent = ccT(p[6]);
    clock.textContent = dec(p[0]) + " sn";
    if (k < 1) fightRAF = requestAnimationFrame(step);
    else {
      const last = tl[tl.length - 1]; cme.textContent = ""; cen.textContent = "";
      ko.innerHTML = last[2] <= 0 && last[1] > 0 ? `<b class="good">${esc(D.en.c.disp)} düştü!</b> ${esc(D.me.c.disp)} canının %${Math.round(last[1] * 100)} kadarıyla ayakta (${secs(last[0])}).`
        : last[1] <= 0 && last[2] > 0 ? `<b class="bad">${esc(D.me.c.disp)} düştü.</b> ${esc(D.en.c.disp)} canının %${Math.round(last[2] * 100)} kadarıyla ayakta (${secs(last[0])}).`
          : last[1] <= 0 ? `<b>İkisi aynı anda düştü.</b>` : `<b>30 saniyede kimse düşmedi.</b> Uzun dövüşte ${r.ttkMe <= r.ttkEn ? esc(D.me.c.disp) : esc(D.en.c.disp)} önde.`;
    }
  };
  fightRAF = requestAnimationFrame(step); setTimeout(() => step(t0 + dur + 1), dur + 80);
}
/* Bu rakibe karşı en çok fark yaratan eşyalar: her eşyayı boş yuvaya koyup yeniden hesaplar */
const FINISHED = () => ILIST.filter(i => i.tier === "fin" || i.tier === "boot");
function buildPool(c) {
  const b = BUILDS[c.slug]; const s = new Set();
  if (b) Object.values(b).forEach(R => { R.v.forEach(v => v[1].forEach(x => s.add(x))); (R.sit || []).forEach(x => s.add(x)); if (R.boots) s.add(R.boots); });
  if (!b || s.size < 8) { const S = stylesFor(c); S[S._def].items.forEach(x => s.add(x)); ILIST.filter(i => i.u && i.tier === "fin").forEach(i => { const st = styleOf([i.id], c); if (st === S._def) s.add(i.id); }); }
  return s;
}
function bestItems(side, limit) {
  const f = D[side], o = D[side === "me" ? "en" : "me"]; const base = simulate(D.me, D.en); if (!base) return [];
  const has = new Set(f.items.filter(Boolean)); const slot = f.items.indexOf(null); const i0 = slot < 0 ? SLOTS - 1 : slot;
  const hasBoot = f.items.some(id => id && isBoot(id) && f.items.indexOf(id) !== i0);
  const pool = buildPool(f.c);
  return FINISHED().filter(i => pool.has(i.id) && !has.has(i.id) && !(hasBoot && i.cat === "bot")).map(i => {
    const items = [...f.items]; items[i0] = i.id; const t = { ...f, items, lvl: D.lvl };
    const r = side === "me" ? simulate(t, o) : simulate(o, t);
    return { id: i.id, gain: side === "me" ? r.score - base.score : base.score - r.score };
  }).sort((a, b) => b.gain - a.gain).slice(0, limit);
}
const gainTxt = g => (g >= 0 ? "+" : "−") + Math.abs(g * 100).toFixed(1).replace(".", ",") + " puan";
function renderRecs() {
  const best = bestItems("me", 5);
  const full = D.me.items.every(Boolean);
  $("#d-recs").innerHTML = `<h2>${ic("wand")}Bu rakibe karşı en etkili eşyalar</h2>
    <p class="muted small">${esc(D.me.c.disp)} oyuncularının aldığı eşyalar arasından, bu rakibe karşı avantajını en çok artıranlar${full ? " (son yuvanın yerine)" : ""}. Dokun, ekle.</p>
    ${best.length ? `<div class="rec-row">${best.map(x => `<button type="button" class="rec" data-dadd="${x.id}">${IT[x.id].img ? `<img src="${IT[x.id].img}" alt="">` : ""}<span class="nm">${esc(iname(x.id))}</span><span class="gain ${x.gain >= 0.0005 ? "good" : x.gain <= -0.0005 ? "bad" : ""}">${gainTxt(x.gain)}</span></button>`).join("")}</div>` : '<div class="empty">Öneri yok.</div>'}`;
}
function renderCounters(r) {
  const en = D.en.c, role = r ? r.role : en.main;
  const rows = (MU[role] && MU[role][en.slug] || []).filter(x => x[1] < 50 && BYSLUG[x[0]] && BYSLUG[x[0]].roles.includes(role)).sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => ({ c: BYSLUG[x[0]], wr: 100 - x[1], g: x[2] }));
  $("#d-counters").innerHTML = `<h2>${ic("trophy")}${esc(en.disp)} karşısında en iyi seçimler</h2>
    <p class="muted small">${ROLE_LONG[role]} · gerçek maç verisi (u.gg, Dünya, Zümrüt+). Dokun, onunla düello et.</p>
    ${rows.length ? `<div class="ctr-row">${rows.map(x => `<button type="button" class="ctr" data-dme="${x.c.slug}" title="${n0(x.g)} maç">${por(x.c)}<span class="nm">${esc(x.c.disp)}</span><span class="tag ${EDGE_TXT(x.wr)[0]}">${pct(x.wr)}</span></button>`).join("")}</div>` : '<div class="empty">Bu koridor için eşleşme verisi yok.</div>'}`;
}
/* Eşya seçici: her eşyanın düelloya etkisi kutunun üstünde görünür */
let ipSide = "me", ipSlot = 0, ipCat = "rec";
function openItemPicker(side, slot) {
  ipSide = side; ipSlot = slot; ipCat = "rec"; const f = D[side]; const cur = f.items[slot];
  openOv(`<div class="sheet ip" role="dialog" aria-modal="true" aria-label="Eşya seç">
    <div class="sheet-head"><h3>${side === "me" ? "Senin" : "Rakibin"} eşyası</h3>${cur ? `<button class="btn" type="button" data-iprm>${ic("x")}Çıkar</button>` : ""}<button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="toolbar"><div class="seg sm" id="ip-cats">${[["rec", `${esc(f.c.disp)} için`], ["all", "Tümü"], ...Object.entries(CAT)].map(([k, v]) => `<button type="button" data-c="${k}" aria-pressed="${k === ipCat}">${v}</button>`).join("")}</div>
    <input id="ip-q" type="search" placeholder="Eşya ara" aria-label="Eşya ara"></div>
    <p class="muted small" style="margin:0">"${esc(f.c.disp)} için": oyuncuların bu şampiyonda gerçekten aldığı eşyalar. Kutulardaki sayı: bu eşya bu yuvaya girerse ${side === "me" ? "avantajın" : "rakibin avantajı"} kaç puan değişir.</p>
    <div class="ipgrid" id="ip-grid"></div></div>`);
  drawItemPicker();
  $("#ip-q").addEventListener("input", drawItemPicker);
  $("#ip-cats").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; ipCat = b.dataset.c; [...$("#ip-cats").children].forEach(x => x.setAttribute("aria-pressed", x === b)); drawItemPicker(); });
  setTimeout(() => { const q = $("#ip-q"); if (q && matchMedia("(pointer:fine)").matches) q.focus(); }, 30);
}
function drawItemPicker() {
  const f = D[ipSide], o = D[ipSide === "me" ? "en" : "me"], q = key($("#ip-q").value);
  const base = simulate(D.me, D.en);
  const pool = buildPool(f.c);
  const rows = (q ? ILIST : FINISHED()).filter(i => (q || ipCat === "all" || (ipCat === "rec" ? pool.has(i.id) : i.cat === ipCat)) && (!q || key(i.n + " " + i.en).includes(q)));
  const scored = rows.map(i => {
    const items = [...f.items]; items[ipSlot] = i.id; const t = { ...f, items, lvl: D.lvl };
    const own = f.items.some((x, k) => x === i.id && k !== ipSlot);
    const r = own ? null : (ipSide === "me" ? simulate(t, o) : simulate(o, t)); const g = r && base ? (ipSide === "me" ? r.score - base.score : base.score - r.score) : 0; return { i, g, own };
  }).sort((a, b) => (a.own - b.own) || (b.g - a.g));
  $("#ip-grid").innerHTML = scored.map(({ i, g, own }) => `<button type="button" class="ipb${own ? " on" : ""}" data-ipick="${i.id}"${own ? " disabled" : ""}>
      <span class="ib">${i.img ? `<img src="${i.img}" alt="" loading="lazy">` : ""}${chgBadge(ICHG[i.id] && ICHG[i.id].v)}</span>
      <span class="nm">${esc(i.n)}</span><span class="gain ${own ? "" : g > 0.0005 ? "good" : g < -0.0005 ? "bad" : ""}">${own ? "Takılı" : Math.abs(g) < 0.0005 ? "±0" : (g > 0 ? "+" : "−") + Math.abs(g * 100).toFixed(1).replace(".", ",")}</span></button>`).join("") || '<div class="empty">Bulunamadı.</div>';
}
function setItem(side, slot, id) {
  const f = D[side], old = f.items[slot]; f.items[slot] = id; f.style = styleOf(f.items.filter(Boolean), f.c);
  const r = simulate(D.me, D.en), p = D.prev;
  if (r && p) {
    const who = side === "me" ? "Sen" : "Rakip"; const d = Math.round((r.score - p.score) * 100);
    const sf = side === "me" ? "n" : ""; const what = id && old ? `${esc(iname(old))} yerine <b>${esc(iname(id))}</b> aldı${sf}` : id ? `<b>${esc(iname(id))}</b> aldı${sf}` : `<b>${esc(iname(old))}</b> çıkardı${sf}`;
    D.log.unshift(`<span class="who ${side}">${who}</span> ${what} → avantajın <b class="${d >= 0 ? "good" : "bad"}">${d >= 0 ? "+" : "−"}${Math.abs(d)} puan</b>`); D.log = D.log.slice(0, 3);
  }
  renderDuel();
}
document.getElementById("v-ana").addEventListener("click", e => {
  const t = e.target.closest("[data-dpick],[data-dslot],[data-dstyle],[data-dclear],[data-dadd],[data-dme],[data-lvl]"); if (!t) return;
  if (t.dataset.dpick) { const side = t.dataset.dpick; openPicker(side === "me" ? "Senin şampiyonun" : "Rakip şampiyon", c => { if (!c) return; D[side] = fighter(c); D.log = []; D.prev = null; renderDuel(); }); }
  else if (t.dataset.dslot) { const [s, i] = t.dataset.dslot.split(":"); openItemPicker(s, +i); }
  else if (t.dataset.dstyle) {
    const [s, k] = t.dataset.dstyle.split(":"); const S = stylesFor(D[s].c); D[s] = fighter(D[s].c, itemsForLevel(S[k].items, D.lvl), k);
    const r = simulate(D.me, D.en), p = D.prev; const dd = r && p ? Math.round((r.score - p.score) * 100) : 0;
    D.log.unshift(`<span class="who ${s}">${s === "me" ? "Sen" : "Rakip"}</span> <b>${esc(STYLES.find(x => x[0] === k)[1])}</b> tarzına geçti${s === "me" ? "n" : ""}${p ? ` → avantajın <b class="${dd >= 0 ? "good" : "bad"}">${dd >= 0 ? "+" : "−"}${Math.abs(dd)} puan</b>` : ""}`); D.log = D.log.slice(0, 3); renderDuel();
  }
  else if (t.dataset.dclear) { const s = t.dataset.dclear; D[s] = fighter(D[s].c, [], null); renderDuel(); }
  else if (t.dataset.dadd) { const f = D.me; let i = f.items.indexOf(null); if (i < 0) i = SLOTS - 1; if (isBoot(t.dataset.dadd)) { const bi = f.items.findIndex(x => x && isBoot(x)); if (bi >= 0) i = bi; } setItem("me", i, t.dataset.dadd); }
  else if (t.dataset.dme) { D.me = fighter(BYSLUG[t.dataset.dme]); D.log = []; D.prev = null; renderDuel(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  else if (t.dataset.lvl) {
    const old = D.lvl; D.lvl = Math.min(MAXL, Math.max(1, D.lvl + (+t.dataset.lvl))); if (D.lvl === old) return;
    const r = simulate(D.me, D.en), p = D.prev; const dd = r && p ? Math.round((r.score - p.score) * 100) : 0;
    if (p) { D.log.unshift(`Seviye <b>${D.lvl}</b>${[6, 11, 16].includes(D.lvl) && t.dataset.lvl > 0 ? " (ulti kademesi)" : ""} → avantajın <b class="${dd >= 0 ? "good" : "bad"}">${dd >= 0 ? "+" : "−"}${Math.abs(dd)} puan</b>`); D.log = D.log.slice(0, 3); }
    renderDuel();
  }
});
ov.addEventListener("click", e => {
  const p = e.target.closest("[data-ipick]"); if (p) { closeOv(); setItem(ipSide, ipSlot, p.dataset.ipick); return; }
  if (e.target.closest("[data-iprm]")) { closeOv(); setItem(ipSide, ipSlot, null); }
});
$("#d-swap").addEventListener("click", () => { [D.me, D.en] = [D.en, D.me]; D.log = []; D.prev = null; renderDuel(); });

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
const ccard = (c, w) => `<button class="ccard" type="button" ${champBtnAttrs(c)}>${por(c)}<span class="nm">${esc(c.disp)}</span><span class="wr">${pct(w)}</span></button>`;
function renderGrid() {
  const q = key($("#c-q").value);
  const wrOf = c => { if (cRole === "all") return c.tier === "?" ? null : c.wr; const x = c.rs[cRole]; return x && x[1] >= MIN_PR ? x[0] : null; };
  const rows = LIST.filter(c => (cRole === "all" || c.roles.includes(cRole)) && (!q || key(c.disp).includes(q) || key(c.prof.en).includes(q)));
  const out = $("#c-grid");
  if (!rows.length) { out.innerHTML = '<div class="empty">Bulunamadı.</div>'; return; }
  if (cSort === "az") { out.innerHTML = `<div class="cgrid">${rows.sort((a, b) => a.disp.localeCompare(b.disp, "tr")).map(c => ccard(c, wrOf(c))).join("")}</div>`; return; }
  const groups = {}; rows.forEach(c => { const t = tierOf(wrOf(c)); (groups[t] ||= []).push(c); });
  out.innerHTML = ["S", "A", "B", "C", "D", "?"].filter(t => groups[t]).map(t => `<section class="tsec"><h2 class="th"><span class="tier big" data-t="${t}">${t}</span>${TIER_TXT[t]}<small>${groups[t].length}</small></h2>
    <div class="cgrid">${groups[t].sort((a, b) => (wrOf(b) || 0) - (wrOf(a) || 0) || a.disp.localeCompare(b.disp, "tr")).map(c => ccard(c, wrOf(c))).join("")}</div></section>`).join("")
    + `<p class="muted small">Kademe, ${cRole === "all" ? "her şampiyonun ana koridorundaki" : ROLE_LONG[cRole] + " için"} kazanma oranına göre (u.gg, Dünya, Zümrüt+, yama ${esc(STATS_META ? STATS_META.patch : "–")}). Koridorda %0,5'ten az seçilenler "?" grubunda.</p>`;
}

/* ===================================================================
 *  PROFİL — sekmeli: Build · Yetenekler · Eşleşmeler · Oynanış
 * =================================================================== */
let pRole = null, pSlug = null, pTab = "build";
function pickRow(c, wr, g) {
  const T = EDGE_TXT(wr);
  return `<button class="pick" type="button" ${champBtnAttrs(c)}>${por(c, "sm")}<span class="nm">${esc(c.disp)}</span><span class="tag ${T[0]}">${T[1]}</span><span class="rt">${pct(wr)}<br><small>${n0(g)} maç</small></span></button>`;
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
  const tabs = [["build", "Build"], ["yetenek", "Yetenekler"], ["eslesme", "Eşleşmeler"], ["oyna", "Oynanış"]];
  let body = "";
  if (pTab === "build") body = `<div class="card" id="pf-build">${buildCard(c)}</div>`;
  if (pTab === "yetenek") body = `<div class="card"><div class="abil">${(pr.ab || []).map(a => {
    const cp = ch && ch.c.find(p => p[1] === a[1]); const d = cp ? cp[3].reduce((x, l) => x + l[1], 0) : null;
    return `<div class="ab${cp ? " chg-ab" : ""}"><span class="abi">${a[3] ? `<img src="${a[3]}" alt="">` : ""}${cp ? chgBadge(d > 0 ? "buff" : d < 0 ? "nerf" : "adj") : ""}</span><div style="min-width:0"><div class="k">${esc(SLOT_NAME[a[1]] || a[1])}</div><div class="n">${esc(a[0])}</div><p>${esc(a[2])}</p>${abilityNums(c, a[1])}${cp ? `<ul class="lns">${cp[3].map(lineHTML).join("")}</ul>` : ""}</div></div>`;
  }).join("") || '<div class="empty">Yetenek bilgisi yok.</div>'}</div><p class="muted small" style="margin:12px 0 0">Açıklamalar Riot Data Dragon'dan (Türkçe); sayılar LoL Wiki'den (İngilizce kaynak, CC BY-SA 4.0) alınır ve düello hesabında kullanılır.</p></div>`;
  if (pTab === "eslesme") body = br.length ? `<div class="seg sm" id="pf-roles">${br.map(r => `<button type="button" data-r="${r}" aria-pressed="${r === pRole}">${ROLE_LONG[r]}</button>`).join("")}</div>
    <div class="grid2"><div class="card"><h2 class="good-h">Rahat ettiği rakipler <small>${strong.length}</small></h2><div class="list">${strong.map(x => pickRow(x.o, x.w, x.g)).join("") || '<div class="empty">Kayıt yok.</div>'}</div></div>
    <div class="card"><h2 class="bad-h">Zorlandığı rakipler <small>${weak.length}</small></h2><div class="list">${weak.map(x => pickRow(x.o, x.w, x.g)).join("") || '<div class="empty">Kayıt yok.</div>'}</div></div></div>
    <p class="muted small" style="margin:0">Yüzde: ${esc(c.disp)}'in bu rakibe karşı kazanma oranı (u.gg, Dünya, Zümrüt+). Yalnızca yeterli maçı olan eşleşmeler gösterilir.</p>`
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
    <div class="ph-kpi"><span class="tier big" data-t="${c.tier}">${c.tier}</span><div><b>${pct(c.wr)}</b><span>kazanma</span></div><div><b>${pct(c.pr)}</b><span>seçilme</span></div><div><b>${pct(c.br)}</b><span>yasaklanma</span></div></div>
    <div class="ph-cta"><button class="btn gold" type="button" id="pf-duel">${ic("duel")}Düelloda dene</button></div>
  </div>
  ${ch ? `<button type="button" class="chstrip" data-v="${ch.v}" data-chg="${c.slug}">${chgBadge(ch.v)}<span>Yama ${esc(NOTES.patch || "")}: <b>${esc(VMARK[ch.v][1])}</b> · ${ch.c.length ? esc(ch.c.map(p => p[0] || "Genel").join(", ")) : "yeni şampiyon"}</span><span class="go">Ayrıntı ›</span></button>` : ""}
  <div class="ptabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-pt="${k}" aria-selected="${k === pTab}">${l}</button>`).join("")}</div>
  ${body}`;
  $("#pf-duel").onclick = () => { D.me = fighter(c); D.log = []; D.prev = null; location.hash = "ana"; };
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
  const users = LIST.filter(c => { const b = BUILDS[c.slug]; return b && Object.values(b).some(R => R.v[0][1].includes(id) || R.boots === id); }).sort((a, b) => b.games - a.games).slice(0, 8);
  openOv(`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(i.n)}" style="width:min(500px,100%)">
    <div class="sheet-head">${icoImg(id, "ico-lg")}<div style="flex:1;min-width:0"><h3 style="margin:0">${esc(i.n)}</h3><span class="muted small">${esc(CAT_ALL[i.cat] || "")} · <b class="gold-t">${n0(i.c)} altın</b></span></div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    ${stats.length ? `<ul class="stl">${stats.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    ${i.fx ? `<div class="fx">${fxHTML(i.fx)}</div>` : i.pt ? `<p style="margin:0">${esc(i.pt)}</p>` : ""}
    ${i.from && i.from.length ? `<div><div class="muted small" style="margin-bottom:6px">Yapımı</div><div class="irow">${i.from.map(x => itile(x)).join("")}</div></div>` : ""}
    ${users.length ? `<div><div class="muted small" style="margin-bottom:6px">Ana buildinde alanlar</div><div class="faces">${users.map(c => `<a class="facebtn" href="#s-${c.slug}" data-close>${por(c, "sm", true)}<span>${esc(c.disp)}</span></a>`).join("")}</div></div>` : ""}
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
    const en = BYSLUG[h.slice(7)]; D.en = fighter(en);
    const best = (MU[en.main] && MU[en.main][en.slug] || []).filter(x => x[1] < 50 && BYSLUG[x[0]] && BYSLUG[x[0]].roles.includes(en.main)).sort((a, b) => a[1] - b[1])[0];
    if (best) D.me = fighter(BYSLUG[best[0]]); D.log = []; D.prev = null; history.replaceState(null, "", "#ana"); h = "ana";
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
