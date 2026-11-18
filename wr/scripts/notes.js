/*
 * Resmi Türkçe yama notlarını yapılandırılmış veriye çevirir.
 * Her satır "Ad: eski → yeni" biçimindedir; sayılar karşılaştırılıp satır güçlendirme (+1),
 * zayıflatma (-1) ya da karışık (0) olarak işaretlenir. Bekleme süresi ve bedel gibi
 * "düşük olan iyidir" değerlerde yön ters çevrilir.
 */
"use strict";

const strip = s => (s || "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const up = s => strip(s).toLocaleUpperCase("tr").replace(/\s+/g, " ").trim();

// Düşük değerin daha iyi olduğu nitelikler (ama "bekleme süresi azalması" gibi ifadeler hariç)
const LOWER_BETTER = /bekleme süresi|bedel|maliyet|gecikme|hazırlanma süresi|kanalize etme süresi|yükleme süresi/i;
const nums = s => (s.match(/-?\d+(?:[.,]\d+)?/g) || []).map(x => parseFloat(x.replace(",", ".")));
const sum = a => a.reduce((x, y) => x + y, 0);

function lineDir(txt) {
  const parts = txt.split("→");
  if (parts.length !== 2) return 0;
  const ci = parts[0].indexOf(":");
  const name = ci > 0 ? parts[0].slice(0, ci) : "";
  const left = ci > 0 ? parts[0].slice(ci + 1) : parts[0];
  const right = parts[1];
  const segL = left.split(" + "), segR = right.split(" + ");
  const n = segL.length === segR.length ? segL.length : 1;
  let pos = 0, neg = 0;
  for (let i = 0; i < n; i++) {
    const a = sum(nums(segL[i])), b = sum(nums(segR[i]));
    if (!isFinite(a) || !isFinite(b) || a === b) continue;
    if (b > a) pos++; else neg++;
  }
  let d = pos && !neg ? 1 : neg && !pos ? -1 : 0;
  if (d && LOWER_BETTER.test(name) && !/azal|indirim/i.test(name)) d = -d;
  // Metin içi "Yeni:" / "Kaldırıldı" gibi satırlar karışık sayılır
  return d;
}

// Satır yönleri + açıklama metninden genel karar
function verdict(lines, summary, title) {
  const txt = (summary + " " + title).toLocaleLowerCase("tr");
  if (/yeniden tasarla|görsel ve oynanış güncellemesi|baştan aşağı|yenilenmiş/.test(txt)) return "rework";
  let p = 0, n = 0;
  for (const l of lines) { if (l[1] > 0) p++; else if (l[1] < 0) n++; }
  if (p && !n) return "buff";
  if (n && !p) return "nerf";
  if (p && n) {
    if (/güçlendir|sevgi|arttırıyoruz|artırıyoruz/.test(txt) && !/azaltıyoruz|kısıyoruz|dizginle/.test(txt)) return p >= n ? "buff" : "adj";
    if (/azaltıyoruz|kısıyoruz|dizginle|zayıflat/.test(txt) && !/güçlendir|arttır/.test(txt)) return n >= p ? "nerf" : "adj";
    return "adj";
  }
  if (/güçlendir|sevgi|arttırıyoruz|geri veriyoruz/.test(txt)) return "buff";
  if (/azaltıyoruz|kısıyoruz|dizginle|zayıflat/.test(txt)) return "nerf";
  return "adj";
}

const listLines = html => [...(html || "").matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => strip(m[1])).filter(Boolean);
const toLines = arr => arr.map(t => [t, lineDir(t)]);

/**
 * @param page   __NEXT_DATA__ JSON
 * @param profiles WR_PROFILES (slug → {n, ab:[[ad, yuva, açıklama, simge]]})
 * @param itemTr  { ingilizceAd: türkçeAd }
 */
function parseNotes(page, profiles, itemTr) {
  const champByName = {}; for (const s in profiles) champByName[up(profiles[s].n)] = s;
  const itemByName = {}; for (const en in itemTr) itemByName[up(itemTr[en])] = en;
  const ch = {}, it = {};
  const blades = [];
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== "object") return;
    if (o.character && typeof o.character.name === "string") { blades.push({ card: o }); return; }
    const body = o.richText && o.richText.body || (typeof o.body === "string" && o.type === "html" ? null : null);
    if (body) blades.push({ html: body });
    for (const k in o) walk(o[k]);
  })(page);

  for (const b of blades) {
    if (b.card) {
      const c = b.card, slug = champByName[up(c.character.name)];
      if (!slug) continue;
      const abil = {}; (profiles[slug].ab || []).forEach(a => abil[up(a[0])] = a);
      const parts = (c.changes || []).map(x => {
        const a = abil[up(x.title)];
        return [a ? a[0] : strip(x.title), a ? a[1] : null, a ? a[3] : null, toLines(listLines(x.description && x.description.body))];
      });
      const all = parts.flatMap(p => p[3]);
      const summary = strip(c.summary && c.summary.body);
      ch[slug] = { v: verdict(all, summary, ""), s: summary, c: parts };
      continue;
    }
    // HTML gövdesi: YENİ bölümü (yeni şampiyon) ve EŞYALAR bölümü
    const h = b.html;
    const sections = h.split(/<h2[^>]*>/).slice(1).map(s => { const i = s.indexOf("</h2>"); return [up(s.slice(0, i)), s.slice(i + 5)]; });
    for (const [head, body] of sections) {
      if (head === "YENİ") {
        for (const m of body.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)) {
          const t = up(m[1]); const name = t.split(",").pop().trim();
          const slug = champByName[name] || champByName[t];
          if (slug && !ch[slug]) ch[slug] = { v: "new", s: "", c: [] };
        }
      }
      if (head === "EŞYALAR") {
        for (const blk of body.split(/<h4[^>]*>/).slice(1)) {
          const i = blk.indexOf("</h4>"); const name = up(blk.slice(0, i)); const en = itemByName[name];
          const rest = blk.slice(i + 5);
          const parts = []; let summary = "", sub = null;
          for (const m of rest.matchAll(/<p>([\s\S]*?)<\/p>|<ul>([\s\S]*?)<\/ul>/g)) {
            if (m[1] !== undefined) { const t = strip(m[1]); if (t.length > 60) summary += (summary ? " " : "") + t; else sub = t; }
            else { parts.push([sub || "", null, null, toLines(listLines(m[2]))]); sub = null; }
          }
          const all = parts.flatMap(p => p[3]);
          const key = en || strip(blk.slice(0, i));
          it[key] = { v: verdict(all, summary, ""), s: summary, c: parts, known: !!en };
        }
      }
    }
  }
  return { ch, it };
}

module.exports = { parseNotes, lineDir, verdict };
