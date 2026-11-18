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

/* Kitle kontrolü: açıklamadaki "… for 1.5 seconds" ifadeleri. Sert KK hedefi saldıramaz/yetenek kullanamaz yapar. */
const CC_RE = /\b(stun(?:s|ned|ning)?|airborne|knock(?:s|ed|ing)?\s+(?:\w+\s+){0,2}?(?:up|airborne|back)|suppress(?:es|ed|ing)?|charm(?:s|ed|ing)?|fear(?:s|ed|ing)?|flee(?:s|ing)?|taunt(?:s|ed|ing)?|sleep|asleep|polymorph(?:s|ed)?|root(?:s|ed|ing)?|silenc(?:e|es|ed|ing))\b[^.]{0,120}?\bfor (?:up to )?(\d+(?:\.\d+)?)(?:\s*\/\s*(?:\d+(?:\.\d+)?))*\s*seconds?/gi;
const ccKind = w => /root/i.test(w) ? "root" : /silenc/i.test(w) ? "silence" : "hard";
function ccOf(text) {
  let best = null;
  for (const m of text.matchAll(CC_RE)) {
    if (/minion|monster/i.test(m[0])) continue;           // yalnızca minyon/canavar etkileyen KK sayılmaz
    const k = ccKind(m[1]), d = Number(m[2]); if (!(d > 0 && d <= 4)) continue;
    const rank = k === "hard" ? 2 : k === "silence" ? 1 : 0;
    if (!best || rank > best.r || (rank === best.r && d > best.d)) best = { k, d, r: rank };
  }
  return best ? [best.k, best.d] : null;
}
/* Kalkan: "Shield …" etiketli satır ya da açıklamada "shield equal to X% maximum health" */
function shieldOf(body, text) {
  for (const m of body.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
    const label = txt(m[1]).replace(/:$/, ""), val = txt(m[2]);
    if (!/shield/i.test(label) || /reduc|duration|ally|allied/i.test(label)) continue;
    const bl = baseList(val); if (!bl) continue;
    const dur = Number((text.match(/shield[^.]{0,80}?for (\d+(?:\.\d+)?) seconds?/i) || [])[1]) || 2.5;
    return [bl.b, { ...ratios(val), ...bl.extra }, dur];
  }
  const m = text.match(/shield (?:equal to|of|worth) (\d+(?:\.\d+)?)% (?:of (?:his|her|their|its) )?(maximum|bonus) health/i);
  if (m) return [{ r: [0] }, { [m[2] === "bonus" ? "bhp" : "mhp"]: Number(m[1]) }, Number((text.match(/shield[^.]{0,80}?for (\d+(?:\.\d+)?) seconds?/i) || [])[1]) || 99];
  return null;
}

function parseAbilities(html) {
  const parts = html.split(/class="skill skill(?:&#95;|_)/).slice(1);
  const out = {};
  for (const body of parts) {
    const slot = (body.match(/^(innate|1|2|3|4)/) || [])[1]; if (!slot) continue;
    const ci = body.indexOf("ability-info-content");
    const text = txt(body.slice(ci < 0 ? 0 : ci).split(/Targeting input/)[0]);
    const sh = shieldOf(body, text), cc = slot === "innate" ? null : ccOf(text);
    if (slot === "innate") { if (sh) out.i = { sh }; continue; }
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
    if (sh) out[slot].sh = sh;
    if (cc) out[slot].cc = cc;
    const hl = healOf(body), bf = buffOf(body, text);
    if (hl) out[slot].hl = hl;
    if (bf) out[slot].bf = bf;
    /* menzil, hedefleme, hareket (atılma / ışınlanma / çekme / itme), yavaşlatma */
    const S = statsOf(body);
    const rgOf = k => { const v = S[k]; if (!v) return 0; const n = nums(v.split(/[(+]/)[0]).filter(x => x >= 50 && x <= 2500); return n.length ? Math.max(...n) : 0; };
    const rg = rgOf("TARGET RANGE") || rgOf("RANGE") || rgOf("EFFECT RADIUS");
    if (rg) out[slot].rg = rg;
    const tg = (txt(body).match(/Targeting input (Direction|Unit|Location|Auto|Passive|Vector)/) || [])[1];
    if (tg) out[slot].tg = tg[0];
    const rec = S.RECHARGE && nums(S.RECHARGE.split("(")[0]), imm = S["TARGET IMMUNITY"] && nums(S["TARGET IMMUNITY"].split("(")[0]);
    if (rec && rec.length) out[slot].cd = rec;                      // cephaneli yeteneklerde gerçek bekleme şarj süresidir
    else if (imm && imm.length && cd && Math.max(...cd) < Math.min(...imm)) out[slot].cd = imm;   // aynı hedefe tekrar kullanılamama süresi
    const mv = moveOf(text); if (mv) out[slot].mv = mv;
    const sl = slowOf(text, body); if (sl) out[slot].sl = sl;
  }
  return out;
}
function statsOf(body) {
  const o = {};
  for (const st of body.split(/stats(?:&#95;|_){2}stat"/).slice(1)) {
    const lab = txt((st.match(/stat-label"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "").replace(/\s*:$/, "").trim().toUpperCase();
    const v = txt((st.match(/stat-value"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "").replace(/(\d)\. (\d)/g, "$1.$2");
    if (lab && !o[lab]) o[lab] = v;
  }
  return o;
}
/* Kendi hareketi ya da rakibi yerinden oynatma. "p" çekme, "k" itme, "b" ışınlanma, "d" atılma */
function moveOf(text) {
  const t = text.split(/Patch history|V\d+\.\d/)[0];
  if (/\b(pull(s|ing)?|drag(s|ging)?|reel(s|ing)?|yank(s|ing)?)\b[^.]{0,80}\b(toward|towards|to)\s+(him|her|itself|them|the caster|his|its)/i.test(t)) return "p";
  if (/\bknock(s|ing|ed)?\b[^.]{0,40}\b(back|away)\b|\bpush(es|ing)?\b[^.]{0,30}\baway\b/i.test(t)) return "k";
  if (/\bblinks?\b|\bteleports?\b/i.test(t)) return "b";
  if (/\b(dash(es)?|leaps?|lunges?|jumps?|vaults?|charges? (forward|toward))\b/i.test(t)) return "d";
  return null;
}
/* Yavaşlatma: "Slow: 30 / 40 / 50 / 60%" satırı + metindeki süre, ya da metinde "slows … by X% for Y seconds" */
function slowOf(text, body) {
  for (const m of (body || "").matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
    const label = txt(m[1]).replace(/:$/, ""), val = txt(m[2]);
    if (!/^(slow|maximum slow)$/i.test(label)) continue;
    const head = val.split("(")[0]; if (!/%/.test(head)) continue; const v = nums(head).filter(x => x > 0 && x <= 99); if (!v.length) continue;
    const sent = text.split(/(?<=\.)\s+/).find(x => /slow/i.test(x) && /for (\d+(?:\.\d+)?) seconds?/i.test(x));
    const d = sent ? Number(sent.match(/for (\d+(?:\.\d+)?) seconds?/i)[1]) : 0;
    if (d > 0 && d <= 5) return [v.length > 1 ? v : v[0], d];
  }
  const m = text.match(/\bslow(?:s|ing|ed)?\b[^.]{0,70}?\bby (\d+(?:\.\d+)?)(?:\s*\/\s*[\d.]+)*%[^.]{0,60}?\bfor (\d+(?:\.\d+)?)(?:\s*\/\s*[\d.]+)* seconds?/i);
  if (!m) return null; const p = Number(m[1]), d = Number(m[2]);
  return p > 0 && p <= 99 && d > 0 && d <= 5 ? [p, d] : null;
}
/* Kendini iyileştirme: "Heal" / "Self Heal" / "Heal Amount" satırı, düz değer (+ oranlar). Yüzde değerler (hasarın %'si) alınmaz. */
function healOf(body) {
  for (const m of body.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
    const label = txt(m[1]).replace(/:$/, ""), val = txt(m[2]);
    if (!/^(heal|self heal|heal amount|total heal)$/i.test(label)) continue;
    if (/%/.test(val.split("(")[0]) && !/%\s*(bonus\s+)?(AD|AP)\b/.test(val.split("(")[0])) continue;
    if (/missing health|target/i.test(val)) continue;
    const bl = baseList(val); if (!bl) continue;
    return [bl.b, { ...ratios(val), ...bl.extra }];
  }
  return null;
}
/* Kısa süreli güçlenme: saldırı hızı, saldırı gücü, zırh, hasar azaltma. Süre metinde "for X seconds" olarak yazıyorsa alınır. */
const BUFF = [[/^bonus attack speed$/i, "as", /attack speed/i], [/^bonus attack damage$/i, "ad", /attack damage/i],
  [/^bonus armor$/i, "ar", /armor/i], [/^damage reduction$/i, "dr", /damage reduction|reduced damage/i], [/^bonus movement speed$/i, "ms", /movement speed/i]];
function buffOf(body, text) {
  const st = {}; let dur = 0;
  for (const m of body.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
    const label = txt(m[1]).replace(/:$/, ""), val = txt(m[2]);
    const b = BUFF.find(x => x[0].test(label)); if (!b || st[b[1]] || /per 100|based on|target/i.test(val)) continue;
    const head = val.split("(")[0]; if (/%/.test(head) !== (b[1] === "as" || b[1] === "dr" || b[1] === "ms")) continue;   // AS ve hasar azaltma yüzde, diğerleri düz
    const v = nums(head); if (!v.length) continue;
    const sent = text.split(/(?<=\.)\s+/).find(s => b[2].test(s) && /for (?:the next )?(\d+(?:\.\d+)?) seconds/i.test(s))
      || text.split(/(?<=\.)\s+/).find(s => b[2].test(s) && /(?:for|next) (\d+(?:\.\d+)?) seconds/i.test(s));
    const d = sent && Number((sent.match(/(?:for|next) (?:the next )?(\d+(?:\.\d+)?) seconds/i) || [])[1]);
    if (!(d > 0 && d <= 15)) continue;
    st[b[1]] = v.length > 1 ? v : v[0]; dur = Math.max(dur, d);
  }
  if (!st.ms) { const m = text.match(/gains? (\d+(?:\.\d+)?)% bonus movement speed for (\d+(?:\.\d+)?) seconds?/i);
    if (m && Number(m[2]) <= 10) { st.ms = Number(m[1]); dur = Math.max(dur, Number(m[2])); } }
  return Object.keys(st).length ? { st, dur } : null;
}
module.exports = { parseAbilities };
