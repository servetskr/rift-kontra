/*
 * Resmi Türkçe VALORANT yama notlarını yapılandırılmış veriye çevirir.
 * Notlar iç içe listelerdir: Ajan › Yetenek › "Ad: eski >>> yeni" satırları.
 * Her satır güçlendirme (+1), zayıflatma (-1) ya da karışık (0) olarak işaretlenir.
 * Bekleme süresi, fiyat, sapma gibi "düşük olan iyidir" değerlerde yön ters çevrilir.
 */
"use strict";

const ENT = { "&nbsp;": " ", "&amp;": "&", "&gt;": ">", "&lt;": "<", "&quot;": '"', "&#x27;": "'", "&#39;": "'" };
const decode = s => s.replace(/&(nbsp|amp|gt|lt|quot|#x27|#39);/g, m => ENT[m] || m).replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
// Türkçe büyük harf + İ/I eşitleme: "Killjoy" ile "KILLJOY", "Bind" ile "BIND" aynı sayılır
const norm = s => (s || "").toLocaleUpperCase("tr").replace(/İ/g, "I").replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

/* ---------- küçük HTML ağacı ---------- */
const VOID = new Set(["br", "img", "meta", "hr", "source", "input"]);
function parseHTML(html) {
  const root = { tag: "#root", ch: [] }; const stack = [root];
  const re = /<(\/?)([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g; let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) { top.ch.push({ tag: "#text", t: decode(m[4]) }); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) { // kapanış
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
      continue;
    }
    const node = { tag, ch: [] }; top.ch.push(node);
    if (!VOID.has(tag) && !/\/\s*$/.test(m[3])) stack.push(node);
  }
  return root;
}
const isList = n => n.tag === "ul" || n.tag === "ol";
function text(n, skipLists = true) {
  if (n.tag === "#text") return n.t;
  if (n.tag === "br") return " ";
  if (skipLists && isList(n)) return "";
  return n.ch.map(c => text(c, skipLists)).join("");
}
const clean = s => s.replace(/\s+/g, " ").replace(/\s*>>>\s*/g, " → ").replace(/\s*->\s*/g, " → ").trim();

/* ---------- satır yönü ---------- */
const LOWER_BETTER = /bekleme süresi|fiyat|bedel|maliyet|gecikme|hazırlan|kuşanma süresi|doldurma süresi|şarjör değiştirme|sapma|saçılma|geri tepme|toparlanma süresi|kurulum süresi|yerleştirme süresi|etkinleşme süresi/i;
const nums = s => (s.match(/-?\d+(?:[.,]\d+)?/g) || []).map(x => parseFloat(x.replace(",", ".")));
const sum = a => a.reduce((x, y) => x + y, 0);
function lineDir(txt) {
  const parts = txt.split("→");
  const ci = parts[0].lastIndexOf(":");
  const name = ci > 0 ? parts[0].slice(0, ci) : parts[0];
  const lower = LOWER_BETTER.test(name) && !/azalması|azaltma miktarı/i.test(name);
  if (parts.length === 2) {
    const left = ci > 0 ? parts[0].slice(ci + 1) : parts[0];
    const a = sum(nums(left)), b = sum(nums(parts[1]));
    if (isFinite(a) && isFinite(b) && a !== b) { const d = b > a ? 1 : -1; return lower ? -d : d; }
    return 0;
  }
  // sayısız satırlar: fiile bak
  const t = txt.toLocaleLowerCase("tr");
  const down = /azaldı|azaltıldı|düşürüldü|hafifletildi|kısaltıldı|kısaldı|düştü/.test(t);
  const upw = /arttı|artırıldı|arttırıldı|yükseltildi|uzatıldı|uzadı|yükseldi/.test(t);
  if (lower) return down && !upw ? 1 : upw && !down ? -1 : 0;
  if (/güçlendirildi|geliştirildi|iyileştirildi/.test(t)) return 1;
  if (/zayıflatıldı/.test(t)) return -1;
  return upw && !down ? 1 : down && !upw ? -1 : 0;
}
function verdict(lines, summary) {
  const txt = (summary || "").toLocaleLowerCase("tr");
  if (/yeniden tasarla|baştan|yenilenmiş|elden geçir/.test(txt) && lines.length > 4) return "rework";
  let p = 0, n = 0; for (const l of lines) { if (l[1] > 0) p++; else if (l[1] < 0) n++; }
  if (p && !n) return "buff";
  if (n && !p) return "nerf";
  if (p && n) {
    if (/güçlendir|arttırıyoruz|artırıyoruz|iyileştir/.test(txt) && !/azaltıyoruz|zayıflat|dizginle/.test(txt)) return "buff";
    if (/azaltıyoruz|zayıflat|dizginle|kısıyoruz/.test(txt) && !/güçlendir/.test(txt)) return "nerf";
    return "adj";
  }
  if (/güçlendir/.test(txt)) return "buff";
  if (/zayıflat|dizginle/.test(txt)) return "nerf";
  return "adj";
}

/**
 * @param bodies  makalenin richText gövdeleri (HTML)
 * @param ents    { agent:{NORMAD:{id, ab:{NORMAD:[ad, simge]}}}, weapon:{NORMAD:id}, map:{NORMAD:id} }
 * @returns { ag:{id:{v,s,c:[[başlık, simge, [[satır, yön]]]]}}, wp:{...}, mp:{...}, sum }
 */
function parseNotes(bodies, ents) {
  const out = { ag: {}, wp: {}, mp: {} }; let tldr = "";
  const all = []; // [tür, id, normAd]
  for (const [type, map] of [["ag", ents.agent], ["wp", ents.weapon], ["mp", ents.map]])
    for (const k in map) all.push([type, map[k].id || map[k], k]);
  all.sort((a, b) => b[2].length - a[2].length); // uzun adlar önce (ör. "KAY/O")
  const matchEnt = own => {
    const u = norm(own);
    for (const [type, id, k] of all) {
      if (u === k) return { type, id, rest: "" };
      if (u.startsWith(k + " ") || u.startsWith(k + "(")) {
        const rest = own.trim().slice(k.length).trim();
        if (rest.length > 25 || /^\(/.test(rest)) return { type, id, rest: rest.replace(/^\([^)]*\)\s*/, "") };
      }
    }
    return null;
  };
  const bucket = (type, id) => (out[type][id] ||= { s: "", c: [] });
  const addLine = (e, group, icon, line) => {
    const b = bucket(e.type, e.id);
    let g = b.c.find(x => x[0] === group); if (!g) { g = [group, icon, []]; b.c.push(g); }
    const t = clean(line); if (t) g[2].push([t, lineDir(t)]);
  };
  const abilityOf = (e, own) => {
    if (e.type !== "ag") return null;
    const A = ents.agent[Object.keys(ents.agent).find(k => ents.agent[k].id === e.id)].ab || {};
    const u = norm(own).replace(/\s*\(.*\)\s*$/, "");
    return A[u] || null;
  };

  function processList(ul, ctx, found) {
    for (const li of ul.ch.filter(n => n.tag === "li")) {
      const own = clean(text(li));
      const subs = li.ch.filter(isList);
      // Harita havuzu: "BIND ve CORRODE, ... sıralarına GİRİŞ YAPTI."
      const pin = /GİRİŞ YAPTI|EKLENDİ/i.test(own), pout = /AYRILDI|ÇIKARILDI/i.test(own);
      if ((pin || pout) && /SIRA|HAVUZ/i.test(norm(own))) {
        const words = " " + norm(own).replace(/[^A-ZÇĞİÖŞÜ0-9/ ]/g, " ") + " ";
        const hit = all.filter(([t, , k]) => t === "mp" && words.includes(" " + k + " "));
        for (const [, id] of hit) { const b = bucket("mp", id); b.s = pin ? "Rekabetçi harita havuzuna girdi." : "Rekabetçi harita havuzundan çıktı."; b.pool = pin ? 1 : -1; }
        if (hit.length) continue;
      }
      const ent = matchEnt(own);
      if (ent) {
        ent.empty = !subs.length && !ent.rest;
        found.push(ent); bucket(ent.type, ent.id);
        if (ent.rest) bucket(ent.type, ent.id).s += (bucket(ent.type, ent.id).s ? " " : "") + ent.rest;
        const c2 = { e: ent, group: "", icon: null };
        subs.forEach(s => processList(s, c2, found));
        ctx.last = ent;
        continue;
      }
      if (ctx.e) {
        const ab = abilityOf(ctx.e, own);
        if (ab || (subs.length && own.length < 48)) {
          const c2 = { e: ctx.e, group: ab ? ab[0] : own, icon: ab ? ab[1] : null };
          if (subs.length) subs.forEach(s => processList(s, c2, found));
          else if (own && !ab) addLine(ctx.e, ctx.group, ctx.icon, own);
          continue;
        }
        if (own) addLine(ctx.e, ctx.group, ctx.icon, own);
        subs.forEach(s => processList(s, ctx, found));
        continue;
      }
      const nw = own.match(/yeni ajan\s+([^\s,!.]+)/i);
      if (nw) { const e = matchEnt(nw[1]); if (e && e.type === "ag") { found.push(e); bucket("ag", e.id).v = "new"; } continue; }
      subs.forEach(s => processList(s, ctx, found));
    }
  }

  for (const html of bodies) {
    const root = parseHTML(html);
    // düz sırayla başlıkları ve blokları gez
    let h1 = "", h2 = "", pending = "", ctx = { e: null, group: "", icon: null, last: null };
    const flat = [];
    (function flatten(n) { for (const c of n.ch) { if (/^(h1|h2|h3|p|ul|ol)$/.test(c.tag)) flat.push(c); else if (c.tag !== "#text") flatten(c); } })(root);
    for (const n of flat) {
      const t = clean(text(n, false));
      if (n.tag === "h1") { h1 = norm(t); continue; }
      if (n.tag === "h2") { if (t) { h2 = norm(t); ctx = { e: null, group: "", icon: null, last: null }; pending = ""; } continue; }
      if (!tldr && n.tag === "p" && /^Özetle/i.test(t)) { tldr = t.replace(/^Özetle\s*:?\s*/i, ""); continue; }
      const wanted = /AJAN GÜNCELLEME|SILAH GÜNCELLEME|HARITA GÜNCELLEME|SILAHLAR|AJANLAR/.test(h2) && !(/KONSOL/.test(h1) && !/TÜM/.test(h1));
      if (!wanted) continue;
      if (n.tag === "p" || n.tag === "h3") {
        if (!t || t.length < 3) continue;
        const ent = matchEnt(t);
        if (ent && ent.rest === "") { bucket(ent.type, ent.id); ctx = { e: ent, group: "", icon: null, last: ent }; continue; }
        const last = ctx.last && out[ctx.last.type][ctx.last.id];
        if (last && !last.c.some(g => g[2].length) && !last.s) last.s = t; else pending += (pending ? " " : "") + t;
        continue;
      }
      // liste
      const found = [];
      // "<li>Warden</li>" + açıklama + ayrı liste: satırlar son başlığa aittir
      const firstLi = n.ch.find(c => c.tag === "li");
      const lastB = ctx.last && out[ctx.last.type][ctx.last.id];
      if (!ctx.e && ctx.last && ctx.last.empty && lastB && !lastB.c.some(g => g[2].length) && firstLi && !matchEnt(clean(text(firstLi)))) {
        const c2 = { e: ctx.last, group: "", icon: null, last: ctx.last };
        processList(n, c2, found); continue;
      }
      processList(n, ctx, found);
      if (found.length) {
        if (pending) for (const e of found) { const b = out[e.type][e.id]; if (!b.s) b.s = pending; }
        pending = ""; ctx.last = found[found.length - 1];
      }
    }
  }
  // karar ver, boşları at
  for (const type of ["ag", "wp", "mp"]) for (const id of Object.keys(out[type])) {
    const b = out[type][id]; b.c = b.c.filter(g => g[2].length);
    if (!b.c.length && b.v !== "new" && !b.s) { delete out[type][id]; continue; }
    if (b.pool) b.v = b.pool > 0 ? "new" : "adj";
    else if (b.v !== "new") b.v = verdict(b.c.flatMap(g => g[2]), b.s);
    b.s = b.s.slice(0, 900);
  }
  return { ...out, sum: tldr };
}

module.exports = { parseNotes, lineDir, verdict, parseHTML, norm };
