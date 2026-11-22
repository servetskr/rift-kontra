/*
 * riftpatchnotes.com şampiyon sayfası ayrıştırıcısı: koridor başına en popüler 3 çekirdek build
 * (3 item), kazanma ve seçilme oranlarıyla; en popüler 2 çizme ve en popüler 2 rün sayfası. Elmas+ dereceli, Wild Rift CN sunucusu.
 */
"use strict";
const ROLE = { top: "top", baron: "top", jungle: "jg", mid: "mid", middle: "mid", dragon: "adc", adc: "adc", bot: "adc", duo: "adc", support: "sup" };
const num = s => parseFloat(String(s).replace(",", "."));

/* → { rol: { c:[[[item-slug...], kazanma, seçilme], ...], b:[[çizme-slug, kazanma, seçilme], ...], r:[[[rün adı...], kazanma, seçilme], ...] } } */
function parseCores(raw) {
  const h = raw.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!-- -->/g, "").replace(/\s+/g, " ");
  const out = {};
  const parts = h.split(/<h2[^>]*>[^<]*Build Guide\s*<span[^>]*>\(/).slice(1);
  for (const p of parts) {
    const role = ROLE[(p.match(/^\s*([A-Za-z]+)\s*\)/) || [])[1]?.toLowerCase()];
    if (!role || out[role]) continue;
    const body = p.split(/<h3[^>]*>\s*Runes/)[0];
    const blocks = body.split(/<h4[^>]*>/).slice(1);
    const c = [], b = [];
    for (const blk of blocks) {
      const title = (blk.match(/^([^<]*)/) || [])[1].trim().toLowerCase();
      const m = blk.match(/([\d.,]+)% WR · ([\d.,]+)% pick/); if (!m) continue;
      const its = [...blk.matchAll(/href="\/item\/([a-z0-9-]+)"/g)].map(x => x[1]);
      if (/core/.test(title) && its.length >= 2) c.push([its, num(m[1]), num(m[2])]);
      else if (/boots/.test(title) && its.length) b.push([its[0], num(m[1]), num(m[2])]);
    }
    // rün sayfaları: "Most popular page" ve "Alternative page" (kazanma ve seçilme oranıyla)
    const rs = (p.split(/<h3[^>]*>\s*Runes/)[1] || "").split(/<h3/)[0];
    const r = [];
    for (const m of rs.matchAll(/(?:Most popular|Alternative) page[\s\S]*?([\d.,]+)% WR · ([\d.,]+)% pick([\s\S]*?)(?=(?:Most popular|Alternative) page|$)/g)) {
      const names = [...m[3].matchAll(/<img[^>]*src="\/runes\/[^"]+"[^>]*alt="([^"]+)"/g)].map(x => x[1].replace(/&#x27;/g, "'").replace(/&amp;/g, "&"));
      if (names.length >= 3) r.push([names, num(m[1]), num(m[2])]);
    }
    if (c.length) out[role] = r.length ? { c, b, r } : { c, b };
  }
  return out;
}

module.exports = { parseCores };
