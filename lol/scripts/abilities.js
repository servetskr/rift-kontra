/*
 * LoL Wiki'nin işlenmiş şampiyon sayfasından (Abilities bölümü) yetenek sayılarını çıkarır.
 * Çıktı (yuva başına, q/w/e/r; pasif için i):
 *   { cd: [bekleme süreleri], d: [[taban, tür "P"|"M"|"T"|null, oranlar{}, sürekli(sn)]], sh: [taban, oranlar, süre], cc: [tür, [süreler]] }
 *   taban: { r: [kademe değerleri] } ya da { lvl: [seviye 1 değeri, seviye 18 değeri] }
 *   oranlar: ap, ad (toplam SG), bad (ilave SG), thp (hedefin azami canı %), mhp (kendi azami canı %), bhp (ilave can %), arm (zırh %), mr (büyü direnci %)
 *   kitle kontrolü türleri: hard (sersemletme, büyüleme, korku, alay, uyku, bastırma), air (havaya kaldırma), root (sabitleme), silence (susturma)
 */
"use strict";
const ent = s => s.replace(/&#95;/g, "_").replace(/&#160;|&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;|&ndash;/g, "–");
const txt = s => ent((s || "").replace(/<small>(\d+)<\/small>/g, "$1").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const nums = s => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const one = v => v.length > 1 ? v : v[0];

function baseList(s) {
  const head = s.split("(")[0];
  const pct = head.match(/%\s*(bonus\s+)?(AD|AP)\b/);
  if (pct) {                                   // "30 / 40 / 50% AD" → yalnızca oran
    const v = nums(head); const k = pct[2] === "AP" ? "ap" : pct[1] ? "bad" : "ad";
    return { b: { r: [0] }, extra: { [k]: one(v) } };
  }
  const pcth = head.match(/%\s*(?:of\s+)?(?:the\s+)?(target'?s?\s+)?(maximum|max|bonus|missing|current)\s+health/i);
  if (pcth) {
    const v = nums(head); const k = pcth[1] ? "thp" : pcth[2] === "bonus" ? "bhp" : "mhp";
    if (/missing|current/i.test(pcth[2]) && !pcth[1]) return null;
    return { b: { r: [0] }, extra: { [k]: one(v) } };
  }
  const lv = s.match(/(-?\d+(?:\.\d+)?)\s*[–-]\s*(-?\d+(?:\.\d+)?)\s*\(based on (?:level|ultimate rank)\)/i);
  if (lv) return { b: { lvl: [Number(lv[1]), Number(lv[2])] }, extra: {} };
  if (/%/.test(head)) return null;
  const n = nums(head);
  return n.length ? { b: { r: n }, extra: {} } : null;
}
function ratios(s) {
  const out = {};
  for (const m of s.matchAll(/\(\+\s*([^()]*?)\)/g)) {
    const t = m[1];
    if (/per\s+\d+/i.test(t)) continue;                      // "+2% per 100 AP" gibi ikincil ölçekler
    const v = nums(t.split("%")[0]); if (!v.length) continue;
    const val = one(v);
    if (/\bAP\b/.test(t)) out.ap = val;
    else if (/bonus AD/i.test(t)) out.bad = val;
    else if (/\bAD\b/.test(t)) out.ad = val;
    else if (/target'?s? (?:maximum|max) health/i.test(t)) out.thp = val;
    else if (/bonus health/i.test(t)) out.bhp = val;
    else if (/(?:maximum|max) health/i.test(t)) out.mhp = val;
    else if (/bonus armor|\barmor\b/i.test(t)) out.arm = val;
    else if (/bonus magic resist|magic resist/i.test(t)) out.mr = val;
  }
  return out;
}
const SKIP = /reduc|minion|monster|increase|modifier|structure|turret|minimum|empowered|against|shield|heal|mana|cap\b|capped|threshold|sweetspot|second cast|third cast|recast|subsequent|per stack|attack damage|ability power|attack speed|penetration|non-champion|clone|tibbers|bonus damage per|storm|per bolt|per bullet|per shot|per hit|per pass|per dagger|per feather/i;

function statOf(body, re) {
  for (const st of body.split(/stats(?:&#95;|_){2}stat"/).slice(1)) {
    const lab = txt((st.match(/stat-label"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "");
    if (!re.test(lab)) continue;
    const v = txt((st.match(/stat-value"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "");
    const first = v.includes("/") ? v.split("(")[0] : v.split(/[–(]/)[0];
    const n = nums(first);
    if (n.length) return n;
  }
  return null;
}

/* Kitle kontrolü: önce "Stun Duration" gibi etiketli satırlar, yoksa açıklamadaki "… for 1.5 seconds" ifadeleri */
const CC_RE = /\b(stun(?:s|ned|ning)?|airborne|knock(?:s|ed|ing)?\s+(?:\w+\s+){0,2}?(?:up|airborne|back|aside)|pull(?:s|ed|ing)?|suppress(?:es|ed|ing)?|charm(?:s|ed|ing)?|fear(?:s|ed|ing)?|flee(?:s|ing)?|taunt(?:s|ed|ing)?|sleep|asleep|drowsy|polymorph(?:s|ed)?|root(?:s|ed|ing)?|snar(?:e|es|ed|ing)|immobiliz(?:e|es|ed|ing)|silenc(?:e|es|ed|ing)|ground(?:s|ed|ing)?)\b[^.]{0,140}?\bfor (?:up to )?(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)\s*seconds?/gi;
const ccKind = w => /root|snar|immobil/i.test(w) ? "root" : /silenc/i.test(w) ? "silence" : /ground/i.test(w) ? "none" : /knock|airborne|pull/i.test(w) ? "air" : "hard";
const RANK = { hard: 3, air: 3, silence: 1, root: 2 };
function ccOf(body, text) {
  let best = null;
  const take = (k, d) => {
    if (k === "none" || !d.length || !(d[0] > 0 && d[d.length - 1] <= 4)) return;
    const r = RANK[k];
    if (!best || r > best.r || (r === best.r && d[0] > best.d[0])) best = { k, d, r };
  };
  for (const m of body.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
    const label = txt(m[1]);
    const lm = label.match(/^(Stun|Root|Snare|Knock ?up|Airborne|Fear|Flee|Charm|Taunt|Sleep|Suppression|Silence|Disable|Polymorph)\s+Duration/i);
    if (!lm) continue;
    const v = nums(txt(m[2]).split("(")[0]);
    take(/disable/i.test(lm[1]) ? "hard" : ccKind(lm[1]), v);
  }
  if (best) return [best.k, one(best.d)];
  for (const m of text.matchAll(CC_RE)) {
    if (/minion|monster|non-champion/i.test(m[0])) continue;  // yalnızca minyon/canavar etkileyen KK sayılmaz
    take(ccKind(m[1]), nums(m[2]));
  }
  // havaya kaldırma çoğu zaman süresiz yazılır ("knocks up") — kısa bir süre say
  if (!best && /\bknock(?:s|ed|ing)? (?:\w+ ){0,2}?(?:up|airborne)\b|\bairborne\b/i.test(text) && !/minion|monster/i.test((text.match(/[^.]*knock[^.]*/i) || [""])[0])) best = { k: "air", d: [0.75], r: 3 };
  return best ? [best.k, one(best.d)] : null;
}
/* Kalkan: "Shield …" etiketli satır ya da açıklamada "shield equal to X% maximum health" */
function shieldOf(body, text) {
  const durOf = () => Number((text.match(/shield[^.]{0,100}?for (\d+(?:\.\d+)?) seconds?/i) || text.match(/for (\d+(?:\.\d+)?) seconds?[^.]{0,60}?shield/i) || [])[1]) || 2.5;
  for (const m of body.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
    const label = txt(m[1]).replace(/:$/, ""), val = txt(m[2]);
    if (!/shield/i.test(label) || /reduc|duration|ally|allied|minion|per |increase|bonus/i.test(label)) continue;
    const bl = baseList(val); if (!bl) continue;
    return [bl.b, { ...ratios(val), ...bl.extra }, durOf()];
  }
  const m = text.match(/shield (?:equal to|of|worth) (\d+(?:\.\d+)?)% (?:of (?:his|her|their|its) )?(maximum|bonus) health/i);
  if (m) return [{ r: [0] }, { [m[2] === "bonus" ? "bhp" : "mhp"]: Number(m[1]) }, durOf()];
  return null;
}
const SLOT = { innate: "i", q: "q", w: "w", e: "e", r: "r", "1": "q", "2": "w", "3": "e", "4": "r" };

function parseAbilities(html) {
  const parts = html.split(/class="skill skill(?:&#95;|_)/).slice(1);
  const out = {};
  for (const body of parts) {
    const raw = (body.match(/^(innate|q|w|e|r|1|2|3|4)\b/) || [])[1]; if (!raw) continue;
    const slot = SLOT[raw]; if (out[slot]) continue;  // aynı yuvanın ikinci biçimi (dönüşüm) atlanır
    const ci = body.indexOf("ability-info-content");
    const text = txt(body.slice(ci < 0 ? 0 : ci).split(/Targeting input|Notes\/General Details/)[0]);
    const sh = shieldOf(body, text);
    if (slot === "i") { const cc = ccOf(body, text); if (sh || cc) out.i = { ...(sh ? { sh } : {}), ...(cc ? { cc } : {}) }; continue; }
    const cc = ccOf(body, text);
    // cephaneli yeteneklerde (Teemo R, Corki R…) asıl bekleme "RECHARGE" satırıdır
    const cd = statOf(body, /^RECHARGE/i) || statOf(body, /^(STATIC )?COOLDOWN/i);
    const sub = txt((body.match(/Sub-type\(s\)[\s\S]{0,300}?<td[^>]*>([\s\S]*?)<\/td>/) || [])[1] || "");
    const overDur = () => { const dm = text.match(/over (?:the next )?(\d+(?:\.\d+)?) seconds?/i) || text.match(/for (\d+(?:\.\d+)?) seconds?/i); return dm ? Number(dm[1]) : 0; };
    const cands = [];
    for (const m of body.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
      const label = txt(m[1]).replace(/:$/, ""), val = txt(m[2]);
      if (!/damage/i.test(label) || SKIP.test(label)) continue;
      const bl = baseList(val); if (!bl) continue;
      const t = /magic|mixed/i.test(label) ? "M" : /physical/i.test(label) ? "P" : /true/i.test(label) ? "T"
        : /Magic/.test(sub) ? "M" : /Physical/.test(sub) ? "P" : /True/.test(sub) ? "T" : null;
      // [taban, tür, oranlar, süre (sn, 0 = anlık), çarpan (değer × çarpan = toplam hasar)]
      const ps = /per second|each second/i.test(label), pt = /per tick|per half/i.test(label);
      let dur = 0, k = 1;
      if (ps || pt) { dur = Math.min(6, overDur() || 3); k = dur * (pt ? 2 : 1); }
      else if (/total/i.test(label)) { const od = overDur(); if (od >= 1.5 && /over/i.test(text)) dur = Math.min(8, od); }
      const score = (/total/i.test(label) ? 2 : /maximum|max\b/i.test(label) ? 0.5 : 1) + (/single-target|champion/i.test(label) ? 1 : 0);
      cands.push({ score, row: [bl.b, t, { ...ratios(val), ...bl.extra }, dur, k] });
    }
    cands.sort((a, b) => b.score - a.score);
    const d = cands.length ? [cands[0].row] : [];
    out[slot] = { cd, d };
    if (sh) out[slot].sh = sh;
    if (cc) out[slot].cc = cc;
  }
  return out;
}
module.exports = { parseAbilities };
