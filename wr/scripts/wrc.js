/*
 * wildriftcore.com sayfa ayrıştırıcıları (build, eşya listesi).
 * Veriler Wild Rift CN sunucusundan derlenmiştir; görseller Wild Rift'in kendi oyun içi simgeleridir.
 */
"use strict";
const RW = { TOP: "top", JUNGLE: "jg", MID: "mid", DRAGON: "adc", SUPPORT: "sup" };
const dec = s => (s || "").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const kebab = s => (s || "").toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Bir şampiyonun build sayfası → { roles:{rol:{v:[[anahtar, başlık, [eşya...], [ne zaman...]]], boots, runes}}, sit:[[eşya, durum]], icons } */
function parseBuilds(raw) {
  const h = raw.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/\s+/g, " ");
  let panels = h.split('<div class="eb-rolepanel">').slice(1);
  if (!panels.length) panels = [h.split('data-nx-section="eb_variants"')[1] || ""];
  const roles = {}, icons = {};
  for (const p of panels) {
    const role = RW[(p.match(/[?&]lane=([A-Z]+)/) || [])[1]]; if (!role || roles[role]) continue;
    const v = [];
    for (const a of p.split('<article class="engine-builds__variant"').slice(1)) {
      const key = (a.match(/data-variant-key="([^"]+)"/) || [])[1] || "standard";
      const title = dec((a.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/) || [])[1]);
      const itemsHtml = (a.split('class="eb-items"')[1] || "").split("</div>")[0];
      const its = [...itemsHtml.matchAll(/data-item="([^"]+)"[^>]*>\s*<img src="([^"]+)" alt="([^"]*)"/g)]
        .map(m => { icons[m[1]] = { src: m[2], en: dec(m[3]) }; return m[1]; });
      const when = [...a.matchAll(/class="eb-chip[^"]*">([\s\S]*?)<\/span>/g)].map(m => dec(m[1]));
      if (its.length >= 3) v.push([key, title, its, when]);
    }
    const shared = p.split("engine-builds__shared-block")[1] || "";
    const boots = shared.match(/<img src="([^"]+)" alt="([^"]*)"[^>]*><div><strong>[^<]*<\/strong><em>/);
    let bootSlug = null;
    if (boots) { bootSlug = kebab(dec(boots[2])); icons[bootSlug] = { src: boots[1], en: dec(boots[2]) }; }
    const runeBlk = (shared.split("eb-sit--runes")[1] || "").split("</div></div>")[0];
    const runes = [...runeBlk.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)].map(m => { icons["rune:" + dec(m[2])] = { src: m[1], en: dec(m[2]) }; return dec(m[2]); });
    if (v.length) roles[role] = { v, boots: bootSlug, runes };
  }
  const sitBlk = (h.split('data-nx-section="eb_situational"')[1] || "").split("</h3>")[0];
  const sit = [...sitBlk.matchAll(/data-item="([^"]+)"[^>]*><img src="([^"]+)" alt="([^"]*)"[^>]*><div><strong>[^<]*<\/strong><em>([^<]*)<\/em>/g)]
    .map(m => { icons[m[1]] = { src: m[2], en: dec(m[3]) }; return [m[1], dec(m[4])]; });
  return { roles, sit, icons };
}

/* Eşya listesi sayfası → { slug: { src, n } } */
function parseItemList(raw, lang) {
  const h = raw.replace(/\s+/g, " "); const map = {};
  const re = new RegExp(`<a[^>]*href="/${lang}/items/([a-z0-9-]+)/"[^>]*>([\\s\\S]*?)</a>`, "g");
  for (const m of h.matchAll(re)) {
    const o = map[m[1]] ||= {};
    const i = m[2].match(/<img[^>]*src="([^"]+)"/); if (i && !o.src) o.src = i[1];
    const n = dec(m[2]); if (n && !o.n) o.n = n;
  }
  return map;
}

module.exports = { parseBuilds, parseItemList, kebab };
