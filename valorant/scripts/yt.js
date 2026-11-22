/*
 * YouTube yardımcıları (lineup güncelleyicisi için). Yalnızca herkese açık sayfalar kullanılır:
 *   - arama sonuç sayfası ve izleme sayfasındaki ytInitialData (başlık, kanal, süre, bölümler, bölüm kareleri)
 *   - youtube.com/oembed (video var mı, gömülebilir mi, başlık ve kanal)
 * Gizli API, oturum ya da indirme yoktur. YouTube engeller ya da biçim değişirse fonksiyonlar
 * BlockedError fırlatır; çağıran bunu yakalayıp veriye dokunmadan çıkar.
 */
"use strict";

class BlockedError extends Error { constructor(msg, kind = "block") { super(msg); this.kind = kind; } } // kind: "block" (429/bot sayfası) · "format" (sayfa beklenen veriyi taşımıyor)

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const HEAD = { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", Cookie: "CONSENT=YES+1; SOCS=CAI" };

async function getText(url, timeout = 20000) {
  const r = await fetch(url, { headers: HEAD, signal: AbortSignal.timeout(timeout), redirect: "follow" });
  if (r.status === 429) throw new BlockedError("429 (çok fazla istek)");
  if (!r.ok) throw new BlockedError(`HTTP ${r.status}`);
  const t = await r.text();
  if (/consent\.youtube\.com|\/sorry\/index|unusual traffic|confirm you.re not a bot/i.test(r.url + t.slice(0, 4000)))
    throw new BlockedError("YouTube bot/onay sayfası döndürdü");
  return t;
}
function initialData(html) {
  const i = html.indexOf("var ytInitialData = ");
  if (i < 0) throw new BlockedError("ytInitialData bulunamadı (sayfa biçimi değişmiş olabilir)", "format");
  const s = html.slice(i + 20);
  try { return JSON.parse(s.slice(0, s.indexOf(";</script>"))); }
  catch { throw new BlockedError("ytInitialData ayrıştırılamadı", "format"); }
}
const walk = (o, f) => { if (!o || typeof o !== "object") return; f(o); for (const k in o) walk(o[k], f); };
const txt = t => t ? (t.simpleText || (t.runs || []).map(r => r.text).join("") || (t.content || "")) : "";
const secs = s => String(s).split(":").map(Number).reduce((a, b) => a * 60 + b, 0);

/* Arama: yalnızca video sonuçları; bölümler (varsa) ile */
async function search(q) {
  const d = initialData(await getText("https://www.youtube.com/results?search_query=" + encodeURIComponent(q) + "&sp=EgIQAQ%253D%253D&hl=en"));
  const out = [];
  walk(d, o => {
    if (o.videoRenderer) {
      const v = o.videoRenderer, ch = [];
      walk(v, x => { if (x.macroMarkersListItemRenderer) { const m = x.macroMarkersListItemRenderer; ch.push([secs(txt(m.timeDescription)), txt(m.title)]); } });
      out.push({ id: v.videoId, title: txt(v.title), ch: txt(v.longBylineText), dur: txt(v.lengthText), ago: txt(v.publishedTimeText), chap: ch });
    } else if (o.lockupViewModel && o.lockupViewModel.contentId && o.lockupViewModel.contentId.length === 11) {
      const L = o.lockupViewModel, md = L.metadata && L.metadata.lockupMetadataViewModel; if (!md) return;
      const meta = []; walk(md.metadata, x => { if (x.metadataParts) x.metadataParts.forEach(p => p.text && meta.push(p.text.content)); });
      let dur = ""; walk(L.contentImage, x => { if (x.thumbnailBadgeViewModel && /^\d+(:\d+)+$/.test(x.thumbnailBadgeViewModel.text || "")) dur = x.thumbnailBadgeViewModel.text; });
      const ch = []; walk(L, x => { if (x.macroMarkerListItemViewModel) { const m = x.macroMarkerListItemViewModel; ch.push([secs(m.timestamp.content), m.title.content]); } });
      out.push({ id: L.contentId, title: md.title.content, ch: meta[0] || "", dur, ago: meta.find(x => /ago/.test(x)) || "", chap: ch });
    }
  });
  const seen = new Set();
  return out.filter(v => v.id && !seen.has(v.id) && seen.add(v.id));
}

/* İzleme sayfası: tam bölüm listesi ve YouTube'un her bölüm için ürettiği kare (imzalı i.ytimg.com adresi) */
async function watch(id) {
  const d = initialData(await getText("https://www.youtube.com/watch?v=" + encodeURIComponent(id) + "&hl=en"));
  const ch = [], seen = new Set();
  walk(d, o => {
    if (!o.macroMarkersListItemRenderer) return; const m = o.macroMarkersListItemRenderer;
    const t = secs(txt(m.timeDescription)); if (seen.has(t)) return; seen.add(t);
    const th = ((m.thumbnail || {}).thumbnails || []).slice().sort((a, b) => b.width - a.width)[0];
    ch.push([t, txt(m.title), th ? th.url : null]);
  });
  return ch.sort((a, b) => a[0] - b[0]);
}
/* Bölüm karesinin i.ytimg.com/vi/{id}/ sonrası yolu (yalnız gerçek bölüm karesi; genel hqdefault değil) */
const IM_RE = /^https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/(hqdefault_\d+\.jpg\?sqp=[\w=+\/-]+&rs=[\w-]+)$/;
const imPath = url => { const m = url && IM_RE.exec(url); return m ? m[1] : null; };

/* oEmbed: { ok:true, title, author } · { gone:true, status } (404/401/403: silinmiş, gizli ya da gömülemez) · null (geçici hata) */
async function oembed(id) {
  try {
    const r = await fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id), { headers: HEAD, signal: AbortSignal.timeout(15000) });
    if (r.status === 200) { const j = await r.json(); return { ok: true, title: j.title, author: j.author_name }; }
    if ([400, 401, 403, 404].includes(r.status)) return { gone: true, status: r.status };
    return null;
  } catch { return null; }
}
/* Bölüm karesi hâlâ geçerli mi: geçersiz imzada i.ytimg.com 404 ve ~1 KB'lık gri yer tutucu döndürür */
async function stillOk(id, im) {
  try {
    const r = await fetch(`https://i.ytimg.com/vi/${id}/${im}`, { method: "HEAD", signal: AbortSignal.timeout(10000) });
    if (r.status >= 500 || r.status === 429) return null;
    const n = +r.headers.get("content-length") || 0;
    return r.status === 200 && n > 2000;
  } catch { return null; }
}

module.exports = { BlockedError, search, watch, imPath, oembed, stillOk };
