/*
 * Resmi Türkçe LoL yama notlarını (leagueoflegends.com/tr-tr) yapılandırılmış veriye çevirir.
 * Her satır "NİTELİK: eski ⇒ yeni" biçimindedir; sayılar karşılaştırılıp satır güçlendirme (+1),
 * zayıflatma (-1) ya da karışık (0) olarak işaretlenir. Bekleme süresi ve bedel gibi
 * "düşük olan iyidir" değerlerde yön ters çevrilir.
 * Çıktı: ch[slug] = { v, s, c:[[başlık, yuva, simge, [[satır, yön]]]] }, it[id] = { v, s, c }
 */
"use strict";

const strip = s => (s || "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const up = s => strip(s).toLocaleUpperCase("tr").replace(/[^\p{L}\p{N}]+/gu, "");
const low = s => (s || "").toLocaleLowerCase("tr");

const LOWER_BETTER = /bekleme süresi|bedel|maliyet|gecikme|hazırlanma süresi|kanalize etme süresi|yükleme süresi|kullanım süresi|bekleme|cooldown/;
const nums = s => (s.match(/-?\d+(?:[.,]\d+)?/g) || []).map(x => parseFloat(x.replace(",", ".")));
const sum = a => a.reduce((x, y) => x + y, 0);

function lineDir(txt) {
  const parts = txt.split("→");
  if (parts.length !== 2) return 0;
  const ci = parts[0].indexOf(":");
  const name = ci > 0 ? parts[0].slice(0, ci) : "";
  const left = ci > 0 ? parts[0].slice(ci + 1) : parts[0];
  const right = parts[1];
  const segL = left.split(/\s\+\s|\(\+/), segR = right.split(/\s\+\s|\(\+/);
  const n = segL.length === segR.length ? segL.length : 1;
  let pos = 0, neg = 0;
  for (let i = 0; i < n; i++) {
    const a = sum(nums(segL[i])), b = sum(nums(segR[i]));
    if (!isFinite(a) || !isFinite(b) || a === b) continue;
    if (b > a) pos++; else neg++;
  }
  let d = pos && !neg ? 1 : neg && !pos ? -1 : 0;
  const ln = low(name);
  if (d && LOWER_BETTER.test(ln) && !/azal|indirim|iade/.test(ln)) d = -d;
  return d;
}

// Satır yönleri + açıklama metninden genel karar
function verdict(lines, summary) {
  const txt = low(summary);
  if (/yeniden tasarla|görsel ve oynanış güncellemesi|baştan aşağı|yenilenmiş|yeniden çalışma|elden geçir/.test(txt) && lines.length > 6) return "rework";
  let p = 0, n = 0;
  for (const l of lines) { if (l[1] > 0) p++; else if (l[1] < 0) n++; }
  const saysUp = /güçlendir|sevgi|arttırıyoruz|artırıyoruz|yardım eli|destek olmak|biraz daha güç/.test(txt);
  const saysDown = /azaltıyoruz|kısıyoruz|dizginle|zayıflat|aşağı çek|törpü|fazla güçlü|fazla yüksek|biraz fazla/.test(txt);
  if (p && !n) return "buff";
  if (n && !p) return "nerf";
  if (p && n) {
    if (saysUp && !saysDown) return p >= n ? "buff" : "adj";
    if (saysDown && !saysUp) return n >= p ? "nerf" : "adj";
    return "adj";
  }
  if (saysUp && !saysDown) return "buff";
  if (saysDown && !saysUp) return "nerf";
  return "adj";
}

const listLines = html => [...(html || "").matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => strip(m[1]).replace(/\s*⇒\s*/g, " → ")).filter(Boolean);
const toLines = arr => arr.map(t => [t, lineDir(t)]);
/* "TIBBERS'IN CANI" → "Tibbers'ın canı": büyük harfli nitelik adı cümle düzenine çevrilir; özel adlar sözlükten geri getirilir */
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function sentence(label, proper) {
  let out = low(label);
  for (const w of proper) {
    const alts = [...new Set([low(w.toLocaleUpperCase("tr")), low(w.toUpperCase()), low(w)])].map(reEsc).join("|");
    out = out.replace(new RegExp("(^|[^\\p{L}])(" + alts + ")(?=$|[^\\p{L}])", "gu"), (m, a) => a + w);
  }
  return out.charAt(0).toLocaleUpperCase("tr") + out.slice(1);
}
const letters = s => s.replace(/[^\p{L}]/gu, "");
const fixLabel = (t, proper) => t.replace(/^([^:→]{2,100}):/, (m, a) => (letters(a) && letters(a) === letters(a).toLocaleUpperCase("tr")) ? sentence(a, proper) + ":" : a + ":");
const properOf = (...names) => [...new Set(names.join(" ").split(/[\s:,.!?/()"-]+/).flatMap(w => [w, w.split("'")[0]]).filter(w => (w.length > 2 || /^[QWER]$/.test(w)) && /^\p{Lu}/u.test(w)))];

/**
 * @param page   __NEXT_DATA__ JSON
 * @param champs LOL_CHAMPS (slug → {n, ab:[[ad, yuva, açıklama, simge]]})
 * @param items  { id: türkçeAd }
 */
function parseNotes(page, champs, items) {
  const champByName = {}; for (const s in champs) { champByName[up(champs[s].n)] = s; champByName[up(s)] = s; }
  const itemByName = {}; for (const id in items) itemByName[up(items[id])] = id;
  const ch = {}, it = {};
  const bodies = [];
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== "object") return;
    if (o.richText && typeof o.richText.body === "string") bodies.push(o.richText.body);
    for (const k in o) walk(o[k]);
  })(page);
  const html = bodies.join("\n");
  const sections = html.split(/<h2[^>]*>/).slice(1).map(s => { const i = s.indexOf("</h2>"); return [up(s.slice(0, i)), s.slice(i + 5)]; });
  for (const [head, body] of sections) {
    const isChamp = head === "ŞAMPİYONLAR", isItem = head === "EŞYALAR", isNew = /^YENİŞAMPİYON/.test(head);
    if (!isChamp && !isItem && !isNew) continue;
    for (const blk of body.split(/<h3[^>]*class="change-title"[^>]*>/).slice(1)) {
      const hi = blk.indexOf("</h3>"); const title = strip(blk.slice(0, hi)); const rest = blk.slice(hi + 5).split(/<div class="content-border"|<h3/)[0];
      const summary = strip((rest.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/) || [])[1] || "");
      const parts = [];
      const after = rest.replace(/<blockquote[\s\S]*?<\/blockquote>/, "");
      const chunks = after.split(/<h4[^>]*>/);
      // h4 öncesi doğrudan liste (çoğunlukla eşyalarda)
      const pre = listLines(chunks[0]); if (pre.length) parts.push(["", null, null, toLines(pre)]);
      for (const c of chunks.slice(1)) {
        const ti = c.indexOf("</h4>"); const sub = strip(c.slice(0, ti)); const lines = listLines(c.slice(ti + 5));
        if (!lines.length) continue;
        const m = sub.match(/^([PQWER]|Pasif)\s*[-–]\s*(.+)$/i);
        parts.push([m ? m[2].trim() : sub, m ? (/^p/i.test(m[1]) ? "P" : m[1].toUpperCase()) : null, null, toLines(lines)]);
      }
      const proper = isItem ? properOf(title) : properOf(title, ...((champs[champByName[up(title)]] || {}).ab || []).map(a => a[0]), "Ulti", "Q", "W", "E", "R");
      for (const p of parts) p[3] = p[3].map(([t, d]) => [fixLabel(t, proper), d]);
      if (isChamp || isNew) {
        const slug = champByName[up(title)]; if (!slug) continue;
        const ab = champs[slug].ab || [];
        for (const p of parts) { const a = ab.find(x => x[1] === p[1]); if (a) { p[0] = a[0]; p[2] = a[3]; } }
        ch[slug] = { v: isNew ? "new" : verdict(parts.flatMap(p => p[3]), summary), s: summary, c: parts };
      } else {
        const id = itemByName[up(title)];
        it[id || title] = { v: verdict(parts.flatMap(p => p[3]), summary), s: summary, c: parts, known: !!id, n: title };
      }
    }
  }
  return { ch, it };
}

module.exports = { parseNotes, lineDir, verdict };
