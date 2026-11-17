#!/usr/bin/env node
/*
 * Rift Kontra veri güncelleyici
 * Kullanım: node scripts/update.js [--full] [--skip-matchups]
 *  - İstatistikleri her çalışmada çeker (riftpatchnotes.com)
 *  - Yama değiştiyse ya da --full verildiyse şampiyon profillerini ve görselleri yeniler (resmi Wild Rift TR sitesi)
 *  - Eşleşme puanlarını 20 saatte bir yeniler (wildriftcore.com)
 *  - Yeni yamanın resmi TR yama notlarından değişen şampiyon ve eşyaları çıkarır
 * Her adım kendi sağlamlık kontrolünden geçer; kontrolü geçemeyen veri yazılmaz, eskisi korunur.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const IMG = path.join(ROOT, "img");
const STATE_FILE = path.join(DATA, "state.json");
const UA = "Mozilla/5.0 (compatible; RiftKontraUpdater/1.0; +https://github.com/servetskr/rift-kontra)";
const args = new Set(process.argv.slice(2));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const problems = [];

/* ---------- yardımcılar ---------- */
async function get(url, { binary = false, tries = 4, okMissing = false } = {}) {
  let wait = 3000;
  for (let t = 1; t <= tries; t++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "tr,en;q=0.8" } });
      if (r.status === 404 && okMissing) return null;
      if (r.status === 429 || r.status >= 500) throw new Error("HTTP " + r.status);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return binary ? Buffer.from(await r.arrayBuffer()) : await r.text();
    } catch (e) {
      if (t === tries) throw new Error(`${url} -> ${e.message}`);
      await sleep(wait); wait *= 2;
    }
  }
}
const nextData = h => {
  const m = h.split('<script id="__NEXT_DATA__" type="application/json">')[1];
  if (!m) throw new Error("NEXT_DATA bulunamadı");
  return JSON.parse(m.split("</script>")[0]);
};
const strip = s => (s || "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
const walk = (o, f) => { if (Array.isArray(o)) o.forEach(x => walk(x, f)); else if (o && typeof o === "object") { f(o); for (const k in o) walk(o[k], f); } };
/* Farklı sitelerin slug'larını tek biçime indirger */
const canon = s => (s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "").replace(/and(?=willump)/, "");
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const readGlobal = (file, name) => {
  try { const w = {}; new Function("window", fs.readFileSync(path.join(DATA, file), "utf8"))(w); return w[name]; } catch { return null; }
};
function writeGlobal(file, name, value, comment) {
  const body = `/* ${comment} — otomatik üretildi, elle düzenleme */\nwindow.${name}=${JSON.stringify(value)};\n`;
  const f = path.join(DATA, file);
  const old = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  if (old !== body) { fs.writeFileSync(f, body); log("yazıldı", file, (body.length / 1024).toFixed(0) + " KB"); return true; }
  log("değişmedi", file); return false;
}
const hash = s => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
const ROLE_POS = { 1: "mid", 2: "top", 3: "adc", 4: "sup", 5: "jg" };
const ROLE_WRC = { TOP: "top", JUNGLE: "jg", MID: "mid", DRAGON: "adc", SUPPORT: "sup" };

/* ---------- 1. İstatistikler ---------- */
async function updateStats(prev) {
  const h = await get("https://www.riftpatchnotes.com/winrates");
  const patch = (h.match(/version="(\d+\.\d+[a-z]?)"/) || [])[1];
  const flat = h.replace(/\\"/g, '"');
  const re = /\{"slug":"([a-z0-9-]+)","rank":(\d+),"position":(\d+),"winRate":([\d.]+),"pickRate":([\d.]+),"banRate":([\d.]+)/g;
  const rows = {}; let n = 0, m;
  while ((m = re.exec(flat))) {
    if (+m[2] !== 3) continue; // 3 = Challenger+
    const role = ROLE_POS[m[3]]; if (!role) continue;
    (rows[canon(m[1])] ||= {})[role] = [+m[4], +m[5], +m[6]]; n++;
  }
  const count = Object.keys(rows).length;
  if (!patch) throw new Error("İstatistik: yama numarası okunamadı");
  if (count < 100 || n < 120) throw new Error(`İstatistik: çok az satır (${count} şampiyon, ${n} satır)`);
  if (prev && prev.rows && count < Object.keys(prev.rows).length * 0.85) throw new Error(`İstatistik: şampiyon sayısı çok düştü (${count})`);
  log("istatistik", patch, count, "şampiyon", n, "satır");
  return { patch, rank: "Challenger+", server: "CN", date: new Date().toISOString().slice(0, 10), rows };
}

/* ---------- 2. Profiller + görseller ---------- */
async function saveImage(url, w, file, state) {
  const src = url.split("?")[0];
  const key = file;
  const full = path.join(IMG, file);
  if (state.images[key] === src && fs.existsSync(full)) return "img/" + file;
  const buf = await get(`${src}?accountingTag=WR&w=${w}&fm=webp&q=72`, { binary: true });
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buf);
  state.images[key] = src;
  return "img/" + file;
}
async function updateProfiles(state, prev) {
  const list = nextData(await get("https://wildrift.leagueoflegends.com/tr-tr/champions/"));
  const cards = []; const seen = new Set();
  walk(list, o => {
    const u = o.action && o.action.payload && o.action.payload.url;
    if (u && /\/tr-tr\/champions\/[a-z0-9-]+\/$/.test(u) && o.media && !seen.has(u)) { seen.add(u); cards.push({ slug: u.split("/")[3], name: o.title, portrait: o.media.url }); }
  });
  if (cards.length < 120) throw new Error(`Profiller: liste çok kısa (${cards.length})`);
  const out = {}; let i = 0;
  async function worker() {
    while (i < cards.length) {
      const c = cards[i++];
      try {
        const j = nextData(await get(`https://wildrift.leagueoflegends.com/tr-tr/champions/${c.slug}/`));
        const blades = j.props.pageProps.page.blades;
        const mast = blades.find(b => b.type === "characterMasthead") || {};
        const tab = blades.find(b => b.type === "iconTab") || {};
        const ab = [];
        for (const [k, g] of (tab.groups || []).entries()) {
          const icon = g.thumbnail ? await saveImage(g.thumbnail.url, 48, `abil/${c.slug}-${k}.webp`, state) : null;
          ab.push([strip(g.label), strip(g.content && g.content.subtitle), strip(g.content && g.content.description && g.content.description.body), icon]);
        }
        out[c.slug] = {
          n: strip(mast.title || c.name), t: strip(mast.subtitle), cls: (mast.role && mast.role.roles || []).map(r => r.name),
          d: mast.difficulty ? mast.difficulty.value : null, dn: mast.difficulty ? mast.difficulty.name : null,
          p: await saveImage(c.portrait, 150, `champ/${c.slug}.webp`, state), ab,
        };
      } catch (e) {
        problems.push("profil " + c.slug + ": " + e.message);
        if (prev && prev[c.slug]) out[c.slug] = prev[c.slug]; // eskisini koru
      }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  const sorted = {}; Object.keys(out).sort().forEach(k => sorted[k] = out[k]); // sabit sıra: gereksiz commit olmasın
  const n = Object.keys(sorted).length;
  if (n < cards.length * 0.95) throw new Error(`Profiller: ${cards.length} şampiyondan yalnızca ${n} okunabildi`);
  const added = prev ? Object.keys(out).filter(s => !prev[s]) : [];
  if (added.length) log("YENİ ŞAMPİYON:", added.join(", "));
  log("profil", n, "şampiyon");
  return sorted;
}

/* ---------- 3. Eşleşme puanları ---------- */
function parseBoards(h) {
  const out = {};
  for (const b of h.split('<div class="nx-role-board" data-role="').slice(1)) {
    const role = ROLE_WRC[b.slice(0, b.indexOf('"'))]; if (!role || out[role]) continue;
    const body = (b.split("<tbody>")[1] || "").split("</tbody>")[0];
    const rows = [];
    for (const tr of body.split("<tr").slice(1)) {
      const slug = (tr.match(/data-anchor="mu-[A-Z_]+-([a-z0-9-]+)"/) || [])[1]; if (!slug) continue;
      const nums = [...tr.matchAll(/<td class="nx-mb-num[^"]*"[^>]*>([^<]*)<\/td>/g)].map(x => x[1].trim().replace("−", "-").replace("±", ""));
      rows.push([slug, parseInt(nums[0]) || 0, parseFloat(nums[1]) || null, parseFloat(nums[2]) || null]);
    }
    out[role] = rows;
  }
  return out;
}
class Blocked extends Error {}
async function updateMatchups(slugMap, prev) {
  let listH;
  try { listH = await get("https://wildriftcore.com/en/champions/", { tries: 2 }); }
  catch (e) { if (/HTTP 403/.test(e.message)) throw new Blocked("wildriftcore.com bu ağdan erişimi engelliyor (403)"); throw e; }
  const slugs = [...new Set([...listH.matchAll(/href="\/en\/champions\/([a-z0-9-]+)\/"/g)].map(m => m[1]))];
  if (slugs.length < 120) throw new Error(`Eşleşme: liste çok kısa (${slugs.length})`);
  const MU = { top: {}, jg: {}, mid: {}, adc: {}, sup: {} };
  const to = s => slugMap[canon(s)];
  let ok = 0, fail = 0;
  for (const s of slugs) {
    try {
      const boards = parseBoards(await get(`https://wildriftcore.com/en/champions/${s}/counters/`, { tries: 5 }));
      const me = to(s); if (!me) { problems.push("eşleşme: tanınmayan slug " + s); continue; }
      for (const r in boards) MU[r][me] = boards[r].map(([o, e, wr, pr]) => [to(o) || o, e, wr, pr]).filter(x => slugMap[canon(x[0])] || to(x[0]));
      ok++;
    } catch (e) {
      fail++; problems.push("eşleşme " + s + ": " + e.message);
      const me = to(s);
      if (prev && me) for (const r in prev) if (prev[r][me]) MU[r][me] = prev[r][me];
    }
    await sleep(2500); // siteye yük bindirmemek için
  }
  if (ok < slugs.length * 0.85) throw new Error(`Eşleşme: ${slugs.length} sayfadan yalnızca ${ok} okunabildi`);
  // tutarlılık: A, B'ye +k diyorsa B, A'ya -k demeli
  let agree = 0, dis = 0;
  for (const r in MU) for (const a in MU[r]) for (const [b, e] of MU[r][a]) {
    const x = MU[r][b] && MU[r][b].find(y => y[0] === a); if (!x) continue;
    if (Math.sign(x[1]) === -Math.sign(e)) agree++; else dis++;
  }
  if (dis > agree * 0.05) throw new Error(`Eşleşme: tutarsız veri (${dis} çelişki / ${agree} uyum)`);
  log("eşleşme", ok, "sayfa,", fail, "hata,", agree, "çift tutarlı");
  return MU;
}

/* ---------- 4. Yama notları ---------- */
async function updateNotes(patch, profiles, itemTr) {
  const slug = "wild-rift-patch-notes-" + patch.replace(".", "-");
  const url = `https://wildrift.leagueoflegends.com/tr-tr/news/game-updates/${slug}/`;
  const h = await get(url, { okMissing: true });
  if (!h) { log("yama notu bulunamadı:", url); return null; }
  const bodies = [], cards = [];
  walk(nextData(h), o => {
    if (typeof o.body === "string") bodies.push(o.body);
    if (o.character && typeof o.character.name === "string") cards.push(`<h4>${o.character.name}</h4>`); // şampiyon/eşya değişiklik kartları
  });
  const heads = [...cards, ...(bodies.join("\n").match(/<h[2-5][^>]*>[\s\S]*?<\/h[2-5]>/g) || [])];
  const up = s => s.toLocaleUpperCase("tr").replace(/\s+/g, " ").trim();
  const champByName = {}; for (const s in profiles) champByName[up(profiles[s].n)] = s;
  const itemByName = {}; for (const en in itemTr) itemByName[up(itemTr[en])] = en;
  const champs = new Set(), items = new Set();
  for (const raw of heads) {
    const t = up(strip(raw)).replace(/\[.*?\]/g, "").trim();
    if (champByName[t]) champs.add(champByName[t]);
    else if (itemByName[t]) items.add(itemByName[t]);
    else for (const n in champByName) if (t.length > 2 && t.startsWith(n + " ")) champs.add(champByName[n]);
  }
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  log("yama notu", patch, champs.size, "şampiyon,", items.size, "eşya");
  return { patch, url, title: strip(title), champs: [...champs], items: [...items] };
}

/* ---------- 5. Eşya simgeleri (yalnızca eksikse) ---------- */
async function updateItemIcons(itemEn, prevIcons) {
  const icons = { ...(prevIcons || {}) };
  const missing = itemEn.filter(n => !icons[n] || !fs.existsSync(path.join(ROOT, icons[n])));
  if (!missing.length) return icons;
  const ver = JSON.parse(await get("https://ddragon.leagueoflegends.com/api/versions.json"))[0];
  const dd = JSON.parse(await get(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/item.json`)).data;
  const byName = {}; for (const id in dd) if (!byName[dd[id].name] || dd[id].gold && dd[id].gold.purchasable) byName[dd[id].name] = id;
  const alias = { "Dominik's Regards": "Lord Dominik's Regards", "Wit's End": "Wit's End", "Statikk Shiv": "Statikk Shiv" };
  for (const n of missing) {
    const id = byName[alias[n] || n]; if (!id) continue;
    try {
      const buf = await get(`https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png`, { binary: true });
      const f = `img/item/${hash(n)}.png`;
      fs.mkdirSync(path.join(ROOT, "img/item"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, f), buf); icons[n] = f;
    } catch (e) { problems.push("eşya simgesi " + n + ": " + e.message); }
  }
  log("eşya simgesi", Object.keys(icons).length, "/", itemEn.length);
  return icons;
}

/* ---------- ana akış ---------- */
(async () => {
  fs.mkdirSync(DATA, { recursive: true });
  const state = readJSON(STATE_FILE, { images: {} });
  state.images ||= {};
  const prevStats = readGlobal("stats.js", "WR_STATS");
  const prevProfiles = readGlobal("profiles.js", "WR_PROFILES");
  const prevMU = readGlobal("matchups.js", "WR_MU");
  const prevMeta = readGlobal("meta.js", "WR_META") || {};
  const items = readGlobal("items.js", "WR_ITEMS"); // elle bakılan eşya listesi
  const now = new Date();
  let failed = false;

  // 1. istatistik (yama tespiti buradan)
  let stats = prevStats;
  try { stats = await updateStats(prevStats); writeGlobal("stats.js", "WR_STATS", stats, "Kazanma/seçilme/yasaklanma oranları, kaynak: riftpatchnotes.com"); }
  catch (e) { failed = true; problems.push(e.message); }
  const patch = stats && stats.patch;
  const patchChanged = !!patch && patch !== prevMeta.patch;
  if (patchChanged) log("YAMA DEĞİŞTİ:", prevMeta.patch, "->", patch);

  // 2. profiller: yama değiştiyse, 7 günden eskiyse ya da --full ise
  let profiles = prevProfiles;
  const profAge = prevMeta.profilesAt ? (now - new Date(prevMeta.profilesAt)) / 864e5 : 99;
  if (!prevProfiles || patchChanged || profAge > 7 || args.has("--full")) {
    try { profiles = await updateProfiles(state, prevProfiles); writeGlobal("profiles.js", "WR_PROFILES", profiles, "Şampiyon profilleri, kaynak: wildrift.leagueoflegends.com/tr-tr"); prevMeta.profilesAt = now.toISOString(); }
    catch (e) { failed = true; problems.push(e.message); }
  }
  const slugMap = {}; for (const s in profiles || {}) slugMap[canon(s)] = s;

  // 3. eşleşmeler: yama değiştiyse ya da 20 saatten eskiyse
  const muAge = prevMeta.matchupsAt ? (now - new Date(prevMeta.matchupsAt)) / 36e5 : 99;
  if (!args.has("--skip-matchups") && (!prevMU || patchChanged || muAge > 20 || args.has("--full"))) {
    try { const mu = await updateMatchups(slugMap, prevMU); writeGlobal("matchups.js", "WR_MU", mu, "Eşleşme puanları, kaynak: wildriftcore.com"); prevMeta.matchupsAt = now.toISOString(); prevMeta.matchupsPatch = patch; }
    catch (e) {
      if (e instanceof Blocked) log("ATLANDI:", e.message, "— eşleşmeler yerel çalıştırmayla güncellenir (scripts/yerel-guncelle.cmd)");
      else { failed = true; problems.push(e.message); }
    }
  }

  // 4. yama notları
  let notes = prevMeta.notes || null;
  if (patch) { // tek istek; Riot notları sonradan düzeltebildiği için her çalışmada okunur
    try { const itemTr = {}; (items || []).forEach(i => itemTr[i[0]] = i[1]); notes = (await updateNotes(patch, profiles, itemTr)) || notes; }
    catch (e) { problems.push("yama notu: " + e.message); }
  }

  // 5. eşya simgeleri
  let icons = readGlobal("icons.js", "WR_ICONS");
  if (items) { try { icons = await updateItemIcons(items.map(i => i[0]), icons); writeGlobal("icons.js", "WR_ICONS", icons, "Eşya simgeleri, kaynak: Riot Data Dragon"); } catch (e) { problems.push("eşya simgeleri: " + e.message); } }

  // 6. meta
  const meta = {
    ...prevMeta, patch: patch || prevMeta.patch, statsAt: stats ? stats.date : prevMeta.statsAt,
    checkedAt: now.toISOString(), notes, champCount: profiles ? Object.keys(profiles).length : 0,
  };
  if (patchChanged) meta.patchSeenAt = now.toISOString();
  // checkedAt her çalışmada değişir; yalnızca başka bir şey değiştiyse yazılsın diye karşılaştırmada dışarıda bırak
  const cmp = o => JSON.stringify({ ...o, checkedAt: 0 });
  if (cmp(meta) !== cmp(prevMeta) || !fs.existsSync(path.join(DATA, "meta.js"))) writeGlobal("meta.js", "WR_META", meta, "Yama ve güncelleme bilgisi");
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 1));

  if (problems.length) { console.log("\nUYARILAR:"); problems.forEach(p => console.log(" -", p)); }
  if (failed) { console.log("\nBazı adımlar başarısız oldu; eski veriler korundu."); process.exit(1); }
  log("bitti");
})().catch(e => { console.error(e); process.exit(1); });
