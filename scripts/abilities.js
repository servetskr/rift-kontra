/*
 * LoL Wiki'nin işlenmiş "WR:<Şampiyon>" sayfasından yetenek hasarlarını çıkarır.
 * Çıktı (yuva başına): { n: ad, cd: [bekleme süreleri], d: [[taban, tür "P"|"M"|"T"|null, oranlar{}, saniyelik(0/1)]] }
 *   taban: { r: [kademe değerleri] } ya da { lvl: [seviye 1 değeri, seviye 15 değeri] }
 *   oranlar: ap, ad (toplam SG), bad (ilave SG), thp (hedefin azami canı %), mhp (kendi azami canı %), bhp (ilave can %)
 */
"use strict";
const ent = s => s.replace(/&#95;/g, "_").replace(/&#160;|&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"');
const txt = s => ent((s || "").replace(/<small>(\d+)<\/small>/g, "$1").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const nums = s => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

function baseList(s) {
  const head = s.split("(")[0];
  const pct = head.match(/%\s*(bonus\s+)?(AD|AP)\b/);
  if (pct) {                                   // "30 / 40 / 50% AD" → yalnızca oran
    const v = nums(head); const k = pct[2] === "AP" ? "ap" : pct[1] ? "bad" : "ad";
    return { b: { r: [0] }, extra: { [k]: v.length > 1 ? v : v[0] } };
  }
  const lv = s.match(/(-?\d+(?:\.\d+)?)\s*[–-]\s*(-?\d+(?:\.\d+)?)\s*\(based on level\)/i);
  if (lv) return { b: { lvl: [Number(lv[1]), Number(lv[2])] }, extra: {} };
  const n = nums(head);
  return n.length ? { b: { r: n }, extra: {} } : null;
}
function ratios(s) {
  const out = {};
  for (const m of s.matchAll(/\(\+\s*([^()]*?)\)/g)) {
    const t = m[1];
    if (/per\s+\d+/i.test(t)) continue;                      // "+2% per 100 AP" gibi ikincil ölçekler
    const v = nums(t.split("%")[0]); if (!v.length) continue;
    const val = v.length > 1 ? v : v[0];
    if (/\bAP\b/.test(t)) out.ap = val;
    else if (/bonus AD/i.test(t)) out.bad = val;
    else if (/\bAD\b/.test(t)) out.ad = val;
    else if (/target'?s? (?:maximum|max) health/i.test(t)) out.thp = val;
    else if (/bonus health/i.test(t)) out.bhp = val;
    else if (/maximum health/i.test(t)) out.mhp = val;
  }
  return out;
}
const SKIP = /reduc|minion|monster|increase|modifier|structure|turret|minimum|empowered|against|shield|heal|mana|cap\b|threshold|sweetspot|second cast|third cast|recast|subsequent|per stack|attack damage|ability power|attack speed|penetration/i;

function cooldownOf(body) {
  for (const st of body.split(/stats(?:&#95;|_){2}stat"/).slice(1)) {
    const lab = txt((st.match(/stat-label"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "");
    if (!/COOLDOWN/i.test(lab)) continue;
    const v = txt((st.match(/stat-value"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "");
    const first = v.includes("/") ? v.split("(")[0] : v.split(/[–(]/)[0];
    const n = nums(first);
    if (n.length) return n;
  }
  return null;
}

function parseAbilities(html) {
  const parts = html.split(/class="skill skill(?:&#95;|_)/).slice(1);
  const out = {};
  for (const body of parts) {
    const slot = (body.match(/^(innate|1|2|3|4)/) || [])[1]; if (!slot || slot === "innate") continue;
    const name = txt((body.match(/class="skill(?:&#95;|_)header[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "").replace(/✎/g, "").trim();
    const cd = cooldownOf(body);
    const sub = txt((body.match(/Sub-type\(s\)[\s\S]{0,300}?<td[^>]*>([\s\S]*?)<\/td>/) || [])[1] || "");
    const d = [];
    for (const m of body.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
      const label = txt(m[1]).replace(/:$/, ""), val = txt(m[2]);
      if (!/damage/i.test(label) || SKIP.test(label)) continue;
      const bl = baseList(val); if (!bl) continue;
      const t = /magic/i.test(label) ? "M" : /physical/i.test(label) ? "P" : /true/i.test(label) ? "T"
        : /Magic/.test(sub) ? "M" : /Physical/.test(sub) ? "P" : /True/.test(sub) ? "T" : null;
      const ps = /per second|per tick|each second/i.test(label) ? 1 : 0;
      d.push([bl.b, t, { ...ratios(val), ...bl.extra }, ps]);
      break; // ilk ana hasar satırı
    }
    out[slot] = { n: name, cd, d };
  }
  return out;
}
module.exports = { parseAbilities };
