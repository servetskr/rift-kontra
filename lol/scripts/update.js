#!/usr/bin/env node
/*
 * Rift Kontra — League of Legends (PC) veri güncelleyici
 * Kullanım: node lol/scripts/update.js [--full] [--skip-ugg] [--skip-wiki] [--builds]  (--builds: u.gg buildlerini ve eşleşmeleri hemen yeniler)
 *   (depo kökünden ya da herhangi bir yerden çalışır; tüm yollar lol/ klasörüne göredir)
 *
 * Adımlar (her biri kendi sağlamlık kontrolünden geçer; kontrolü geçemeyen veri yazılmaz, eskisi korunur):
 *  1. Riot Data Dragon (tr_TR): sürüm, şampiyonlar, yetenek adları/açıklamaları, eşyalar, rünler, sihirdar büyüleri + görseller
 *  2. LoL Wiki "Module:ChampionData/data": taban değerler ve saldırı hızı oranı (CC BY-SA 4.0)
 *  3. LoL Wiki şampiyon sayfaları: yetenek hasarı, oranlar, bekleme süreleri, kalkanlar, kitle kontrolü süreleri
 *  4. u.gg herkese açık istatistik dosyaları: kazanma/seçilme/yasaklanma oranları (Dünya, Zümrüt+)
 *  5. u.gg şampiyon başına: buildler (koridor başına 3 varyant), rünler, büyüler, yetenek sırası, eşleşmeler
 *  6. Resmi Türkçe yama notları (leagueoflegends.com/tr-tr): güçlendirme / zayıflatma / dengeleme
 * Sabit sıralı anahtarlar: değişmeyen veri git farkı üretmez. Bir adım başarısız olursa çıkış kodu 1.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");          // lol/
const DATA = path.join(ROOT, "data");
const IMG = path.join(ROOT, "img");
const STATE_FILE = path.join(DATA, "state.json");
const UA = "Mozilla/5.0 (compatible; RiftKontraUpdater/1.0; +https://github.com/servetskr/rift-kontra)";
const WIKI_UA = "RiftKontraUpdater/1.0 (+https://github.com/servetskr/rift-kontra)";
const DD = "https://ddragon.leagueoflegends.com";
const UGG = "https://stats2.u.gg/lol/1.5";
const args = new Set(process.argv.slice(2));
const FULL = args.has("--full");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const T0 = Date.now();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const problems = [];
class Blocked extends Error {}

/* ---------- yardımcılar ---------- */
async function get(url, { binary = false, tries = 4, okMissing = false, ua = UA, json = false } = {}) {
  let wait = 2000;
  for (let t = 1; t <= tries; t++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": ua, "Accept-Language": "tr,en;q=0.8" } });
      if ((r.status === 404 || r.status === 403) && okMissing) return null;
      if (r.status === 429 || r.status >= 500) throw new Error("HTTP " + r.status);
      if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; e.final = true; throw e; }
      if (binary) return Buffer.from(await r.arrayBuffer());
      const s = await r.text();
      return json ? JSON.parse(s) : s;
    } catch (e) {
      if (t === tries || e.final) throw new Error(`${url} -> ${e.message}`);
      await sleep(wait); wait *= 2;
    }
  }
}
const nextData = h => {
  const m = h.split('<script id="__NEXT_DATA__" type="application/json">')[1];
  if (!m) throw new Error("NEXT_DATA bulunamadı");
  return JSON.parse(m.split("</script>")[0]);
};
const strip = s => (s || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const readGlobal = (file, name) => {
  try { const w = {}; new Function("window", fs.readFileSync(path.join(DATA, file), "utf8"))(w); return w[name]; } catch { return null; }
};
const sortKeys = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
function writeGlobal(file, name, value, comment) {
  const body = `/* ${comment} — otomatik üretildi, elle düzenleme */\nwindow.${name}=${JSON.stringify(value)};\n`;
  const f = path.join(DATA, file);
  const old = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  if (old !== body) { fs.writeFileSync(f, body); log("yazıldı", file, (body.length / 1024).toFixed(0) + " KB"); return true; }
  log("değişmedi", file); return false;
}
async function pool(list, n, fn) {
  let i = 0; const out = new Array(list.length);
  await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const k = i++; out[k] = await fn(list[k], k); } }));
  return out;
}
/* Görsel indir: kaynak yolu sürümden bağımsız tutulur; aynı dosya varsa yeniden indirilmez (--full hariç) */
async function saveImage(url, file, state) {
  const full = path.join(IMG, file);
  const key = url.replace(/\/cdn\/[\d.]+\//, "/cdn/");
  if (!FULL && state.images[file] === key && fs.existsSync(full)) return "img/" + file;
  const buf = await get(url, { binary: true, tries: 3 });
  if (buf.length < 200) throw new Error("görsel çok küçük " + url);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (!fs.existsSync(full) || !fs.readFileSync(full).equals(buf)) fs.writeFileSync(full, buf);
  state.images[file] = key;
  return "img/" + file;
}
const ROLE_UGG = { 1: "jg", 2: "sup", 3: "adc", 4: "top", 5: "mid" };
const STYLE_UGG = ["ap", "tank", "ad", "crit", "lethality", "onhit"];   // u.gg tarz sayfaları
const ROLE_CR = { jungle: "jg", supp: "sup", adc: "adc", top: "top", mid: "mid" };
const gamePatch = v => { const [a, b] = v.split("."); return (+a + 10) + "." + b; };   // Data Dragon 16.23 → oyun yaması 26.23

/* ---------- 1. Data Dragon ---------- */
async function updateDDragon(state, prev) {
  const versions = await get(`${DD}/api/versions.json`, { json: true });
  const ver = versions[0];
  if (!/^\d+\.\d+\.\d+$/.test(ver)) throw new Error("Data Dragon: sürüm okunamadı");
  const full = (await get(`${DD}/cdn/${ver}/data/tr_TR/championFull.json`, { json: true })).data;
  const itemsTR = (await get(`${DD}/cdn/${ver}/data/tr_TR/item.json`, { json: true })).data;
  const itemsEN = (await get(`${DD}/cdn/${ver}/data/en_US/item.json`, { json: true })).data;
  const champsEN = (await get(`${DD}/cdn/${ver}/data/en_US/champion.json`, { json: true })).data;
  const runes = await get(`${DD}/cdn/${ver}/data/tr_TR/runesReforged.json`, { json: true });
  const spells = (await get(`${DD}/cdn/${ver}/data/tr_TR/summoner.json`, { json: true })).data;
  const nc = Object.keys(full).length, ni = Object.keys(itemsTR).length;
  if (nc < 160 || ni < 150) throw new Error(`Data Dragon: eksik veri (${nc} şampiyon, ${ni} eşya)`);
  if (prev && prev.champs && nc < Object.keys(prev.champs).length) throw new Error(`Data Dragon: şampiyon sayısı düştü (${nc})`);
  log("Data Dragon", ver, nc, "şampiyon", ni, "eşya");
  return { ver, versions, full, itemsTR, itemsEN, champsEN, runes, spells };
}

const TAG_TR = { Fighter: "Dövüşçü", Tank: "Tank", Mage: "Büyücü", Assassin: "Suikastçı", Marksman: "Nişancı", Support: "Destek" };
const cleanDesc = s => strip((s || "").replace(/<br\s*\/?>/gi, " ")).replace(/\s+([.,;:!?])/g, "$1");
async function buildChamps(dd, wiki, state) {
  const out = {};
  const wikiById = {}; for (const name in wiki || {}) if (wiki[name] && wiki[name].id) wikiById[String(wiki[name].id)] = { name, ...wiki[name] };
  const jobs = [];
  for (const id in dd.full) {
    const c = dd.full[id], slug = id.toLowerCase(), w = wikiById[c.key];
    const st = w && w.stats, s = c.stats;
    const b = st && st.hp_base ? {
      hp: st.hp_base, hpL: st.hp_lvl, ar: st.arm_base, arL: st.arm_lvl, mr: st.mr_base, mrL: st.mr_lvl, ad: st.dam_base, adL: st.dam_lvl,
      as: st.as_base, asR: st.as_ratio || st.as_base, asL: st.as_lvl || 0, rng: st.range, ms: st.ms,
    } : { hp: s.hp, hpL: s.hpperlevel, ar: s.armor, arL: s.armorperlevel, mr: s.spellblock, mrL: s.spellblockperlevel, ad: s.attackdamage, adL: s.attackdamageperlevel,
      as: s.attackspeed, asR: s.attackspeed, asL: s.attackspeedperlevel, rng: s.attackrange, ms: s.movespeed };
    b.t = w ? (w.adaptivetype === "Magic" ? "M" : "P") : (c.info.magic > c.info.attack ? "M" : "P");
    const ab = [];
    ab.push([c.passive.name, "P", cleanDesc(c.passive.description), null]);
    jobs.push([`${DD}/cdn/${dd.ver}/img/passive/${c.passive.image.full}`, `abil/${slug}-p.png`, p => ab[0][3] = p]);
    c.spells.forEach((sp, i) => {
      const slot = "QWER"[i]; const row = [sp.name, slot, cleanDesc(sp.description), null, sp.cooldown];
      ab.push(row);
      jobs.push([`${DD}/cdn/${dd.ver}/img/spell/${sp.image.full}`, `abil/${slug}-${slot.toLowerCase()}.png`, p => row[3] = p]);
    });
    const entry = {
      id, k: +c.key, n: c.name, en: (dd.champsEN[id] || {}).name || c.name, t: c.title, cls: c.tags, d: Math.max(1, Math.min(3, Math.ceil((c.info.difficulty || 5) / 3.4))),
      res: c.partype, b, ab, wk: w ? w.name : null, p: null,
      tip: [(c.allytips || []).map(strip).filter(Boolean), (c.enemytips || []).map(strip).filter(Boolean)],
    };
    jobs.push([`${DD}/cdn/${dd.ver}/img/champion/${c.image.full}`, `champ/${slug}.png`, p => entry.p = p]);
    out[slug] = entry;
  }
  let fail = 0;
  await pool(jobs, 8, async ([url, file, set]) => { try { set(await saveImage(url, file, state)); } catch (e) { fail++; problems.push("görsel " + file + ": " + e.message); if (fs.existsSync(path.join(IMG, file))) set("img/" + file); } });
  if (fail > jobs.length * 0.1) throw new Error(`Şampiyon görselleri: ${fail}/${jobs.length} indirilemedi`);
  const missingWiki = Object.values(out).filter(c => !c.wk).map(c => c.id);
  if (missingWiki.length) problems.push("wiki taban değeri yok (Data Dragon kullanıldı): " + missingWiki.join(", "));
  log("şampiyon", Object.keys(out).length, "görsel işi", jobs.length, "hata", fail);
  return sortKeys(out);
}

/* Eşyalar: Türkçe açıklamadaki <stats> bloğundan sayılar */
const STAT_KEY = [
  [/^Saldırı Gücü$/, "ad"], [/^Yetenek Gücü$/, "ap"], [/^Zırh$/, "armor"], [/^Büyü Direnci$/, "mr"], [/^Can$/, "hp"], [/^Saldırı Hızı$/, "as"],
  [/^Kritik Vuruş İhtimali$/, "crit"], [/^Kritik Vuruş Hasarı$/, "critdmg"], [/^Yetenek Hızı$/, "ah"], [/^Zırh Deşme$/, "leth"], [/^Zırh Delme$/, "armpen"],
  [/^Büyü Nüfuzu$/, "mpen"], [/^Can Çalma$/, "ls"], [/^Mutlak Sömürü$/, "ov"], [/^Hareket Hızı$/, "ms"], [/^Mana$/, "mana"],
  [/^Taban Mana Yenilenmesi$/, "mp5"], [/^Taban Can Yenilenmesi$/, "hp5"], [/^İyileştirme ve Kalkan Gücü$/, "hsp"], [/^Sıvışma$/, "ten"],
];
function itemStats(desc) {
  const blk = (desc.match(/<stats>([\s\S]*?)<\/stats>/) || [])[1] || ""; const s = {};
  for (const line of blk.split(/<br\s*\/?>/)) {
    const m = line.match(/<attention>\s*(%?)\s*([\d.,]+)\s*(%?)\s*<\/attention>\s*([^<]+)/); if (!m) continue;
    const name = m[4].trim(), v = parseFloat(m[2].replace(",", ".")), pct = !!(m[1] || m[3]);
    const k = (STAT_KEY.find(([re]) => re.test(name)) || [])[1]; if (!k) continue;
    const key = (k === "mpen" || k === "ms") && pct ? k + "p" : k;
    s[key] = (s[key] || 0) + v;
  }
  return s;
}
const itemFx = desc => (desc || "").replace(/<stats>[\s\S]*?<\/stats>/, "").replace(/<(passive|active)>([\s\S]*?)<\/\1>/g, "\n§$2§ ")
  .replace(/<li>/g, "\n").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").split("\n").map(x => x.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
const ITEM_SKIP = new Set(["2051", "3112", "3177", "3184", "1111"]);  // ARAM'a özgü / özel görev eşyaları
async function buildItems(dd, state, usedIds) {
  const raw = {};
  for (const id in dd.itemsTR) {
    const i = dd.itemsTR[id];
    if (+id >= 10000 || ITEM_SKIP.has(id) || !i.maps || !i.maps["11"] || !i.gold || !i.gold.purchasable || i.requiredAlly || i.requiredChampion || i.hideFromAll || i.inStore === false) continue;
    const tags = i.tags || [];
    if (tags.includes("Consumable") || tags.includes("Trinket") || /Kontrol Totemi|İksir/.test(i.name)) continue;
    raw[id] = i;
  }
  // aynı adlı kopyalardan (ör. orman yavruları) yalnızca birini tut
  const byName = {}; for (const id of Object.keys(raw).sort((a, b) => a - b)) { const n = raw[id].name; if (byName[n]) delete raw[id]; else byName[n] = id; }
  const out = {}; const jobs = [];
  for (const id in raw) {
    const i = raw[id], tags = i.tags || [], s = itemStats(i.description);
    const into = (i.into || []).filter(x => raw[x]);
    let tier;
    const bootLike = tags.includes("Boots") || (i.from || []).some(f => ((dd.itemsTR[f] || {}).tags || []).includes("Boots"));
    if (bootLike) tier = i.from && i.from.length ? "boot" : "comp";
    else if (!i.from && (tags.includes("Lane") || tags.includes("Jungle") || tags.includes("GoldPer")) && i.gold.total <= 500) tier = "start";
    else if (!into.length && (i.depth >= 2 || i.gold.total >= 2000)) tier = "fin";
    else tier = "comp";
    let cat;
    if (tier === "boot" || (tags.includes("Boots") && id === "1001")) cat = "bot";
    else if (tier === "start") cat = "bas";
    else if (tier === "comp") cat = "ara";
    else if (s.hsp || tags.includes("GoldPer") || (tags.includes("ManaRegen") && (s.ap || 0) <= 60 && !s.ad)) cat = "des";
    else if (s.ap) cat = "buy";
    else if (s.ad || s.crit || s.as || s.leth) cat = "fiz";
    else cat = "sav";
    const en = (dd.itemsEN[id] || {}).name || i.name;
    out[id] = { n: i.name, en, c: i.gold.total, cat, tier, s, fx: itemFx(i.description), pt: i.plaintext || "", from: (i.from || []).filter(x => raw[x]), img: null, u: usedIds.has(id) ? 1 : 0 };
    jobs.push([`${DD}/cdn/${dd.ver}/img/item/${id}.png`, `item/${id}.png`, p => out[id].img = p]);
  }
  let fail = 0;
  await pool(jobs, 8, async ([url, file, set]) => { try { set(await saveImage(url, file, state)); } catch (e) { fail++; problems.push("görsel " + file + ": " + e.message); } });
  const n = Object.keys(out).length, fin = Object.values(out).filter(x => x.tier === "fin").length;
  if (n < 120 || fin < 60) throw new Error(`Eşyalar: eksik (${n} eşya, ${fin} tamamlanmış)`);
  log("eşya", n, "tamamlanmış", fin, "görsel hatası", fail);
  return sortKeys(out);
}
async function buildRunes(dd, state) {
  const R = { st: {}, r: {}, sp: {} }; const jobs = [];
  for (const st of dd.runes) {
    R.st[st.id] = [st.name, null]; jobs.push([`${DD}/cdn/img/${st.icon}`, `rune/${st.id}.png`, p => R.st[st.id][1] = p]);
    st.slots.forEach((sl, si) => sl.runes.forEach(r => {
      R.r[r.id] = [r.name, null, st.id, si, strip(r.shortDesc)];
      jobs.push([`${DD}/cdn/img/${r.icon}`, `rune/${r.id}.png`, p => R.r[r.id][1] = p]);
    }));
  }
  for (const k in dd.spells) {
    const s = dd.spells[k]; if (!(s.modes || []).includes("CLASSIC")) continue;
    R.sp[s.key] = [s.name, null, strip(s.description)];
    jobs.push([`${DD}/cdn/${dd.ver}/img/spell/${s.image.full}`, `spell/${s.key}.png`, p => R.sp[s.key][1] = p]);
  }
  await pool(jobs, 8, async ([url, file, set]) => { try { set(await saveImage(url, file, state)); } catch (e) { problems.push("görsel " + file + ": " + e.message); } });
  if (Object.keys(R.r).length < 40) throw new Error("Rünler eksik");
  return { st: sortKeys(R.st), r: sortKeys(R.r), sp: sortKeys(R.sp) };
}

/* ---------- 2. Wiki taban değerleri ---------- */
const { parseLua } = require("./lua.js");
async function wikiModule(title) {
  const j = await get(`https://wiki.leagueoflegends.com/en-us/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=${encodeURIComponent(title)}`, { ua: WIKI_UA, json: true });
  const p = Object.values(j.query.pages)[0];
  if (!p.revisions) throw new Error("wiki: " + title + " bulunamadı");
  return parseLua(p.revisions[0].slots.main["*"]);
}
async function updateWikiStats() {
  const C = await wikiModule("Module:ChampionData/data");
  const n = Object.keys(C).length;
  if (n < 160) throw new Error(`Wiki taban değerleri eksik (${n})`);
  if (!C.Ahri || !(C.Ahri.stats.hp_base > 400) || !(C.Ahri.stats.as_ratio > 0.4)) throw new Error("Wiki taban değerleri bozuk görünüyor (Ahri)");
  const slim = {};
  for (const k in C) { const c = C[k]; if (!c || !c.id || !c.stats) continue; const s = c.stats; slim[k] = { id: c.id, adaptivetype: c.adaptivetype, rangetype: c.rangetype,
    stats: { hp_base: s.hp_base, hp_lvl: s.hp_lvl, arm_base: s.arm_base, arm_lvl: s.arm_lvl, mr_base: s.mr_base, mr_lvl: s.mr_lvl, dam_base: s.dam_base, dam_lvl: s.dam_lvl,
      as_base: s.as_base, as_ratio: s.as_ratio, as_lvl: s.as_lvl, range: s.range, ms: s.ms } }; }
  log("wiki taban değerleri:", Object.keys(slim).length);
  return slim;
}

/* Birlikte alınamayan eşya grupları (wiki "itemlimit": Fatality, Lifeline, Spellblade, Hydra…) ve
 * yalnızca menzilli şampiyonların alabildiği eşyalar → { id: { g:[grup...], ro:1 } } */
async function updateItemLimits() {
  const I = await wikiModule("Module:ItemData/data");
  const out = {};
  for (const name in I) {
    const it = I[name]; if (!it || typeof it !== "object" || !it.id) continue;
    const g = [it.itemlimit, it.itemlimit2].filter(x => typeof x === "string" && x).map(x => x.toLowerCase());
    const ro = typeof it.limit === "string" && /purchased on \{\{tip\|ranged/i.test(it.limit);
    if (g.length || ro) out[String(it.id)] = { ...(g.length ? { g } : {}), ...(ro ? { ro: 1 } : {}) };
  }
  const n = Object.keys(out).length;
  if (n < 40 || !out["3036"] || !(out["3036"].g || []).length) throw new Error(`Eşya grupları eksik (${n})`);
  log("eşya grupları:", n);
  return out;
}

/* ---------- 3. Yetenek sayıları (LoL Wiki şampiyon sayfaları) ---------- */
const { parseAbilities } = require("./abilities.js");
async function updateAbilities(champs, prev) {
  const out = {}; let ok = 0, fail = 0;
  const list = Object.keys(champs).filter(s => champs[s].wk).sort();
  for (const slug of list) {
    const page = encodeURIComponent(champs[slug].wk);
    try {
      let j = await get(`https://wiki.leagueoflegends.com/en-us/api.php?action=parse&format=json&prop=text&section=1&redirects=1&page=${page}`, { ua: WIKI_UA, tries: 3, json: true });
      if (!j.parse || !/class="skill skill/.test(j.parse.text["*"])) { await sleep(700); j = await get(`https://wiki.leagueoflegends.com/en-us/api.php?action=parse&format=json&prop=text&redirects=1&page=${page}`, { ua: WIKI_UA, tries: 3, json: true }); }
      if (!j.parse) throw new Error("sayfa yok");
      const a = parseAbilities(j.parse.text["*"]);
      const dmg = ["q", "w", "e", "r"].filter(k => a[k] && a[k].d.length).length;
      if (dmg || Object.keys(a).length >= 4) { out[slug] = a; ok++; }
      else { fail++; problems.push("yetenek " + slug + ": hasar bulunamadı"); if (prev && prev[slug]) out[slug] = prev[slug]; }
    } catch (e) { fail++; problems.push("yetenek " + slug + ": " + e.message); if (prev && prev[slug]) out[slug] = prev[slug]; }
    await sleep(600);
  }
  if (ok < list.length * 0.8) throw new Error(`Yetenekler: yalnızca ${ok}/${list.length} şampiyon okunabildi`);
  log("yetenek sayıları:", ok, "şampiyon,", fail, "eksik");
  return sortKeys(out);
}

/* ---------- 4. u.gg oranları ---------- */
const RANK_UGG = 17, RANK_HIGH = 14, REGION = 12;   // 17 = Zümrüt+, 14 = Master+, 12 = Dünya
async function uggPatch(dd) {
  // en yeni Data Dragon yamasından geriye doğru: yeterli maç verisi olan ilk yama
  for (const v of dd.versions.slice(0, 3)) {
    const p = v.split(".").slice(0, 2).join("_");
    const cr = await get(`${UGG}/champion_ranking/world/${p}/ranked_solo_5x5/emerald_plus/1.5.0.json`, { okMissing: true, json: true, tries: 3 });
    await sleep(400);
    if (cr && Array.isArray(cr) && cr[3] > 150000) return { p, cr };
    if (cr) log("u.gg", p, "yamasında henüz az maç var:", cr[3]);
  }
  // hiç biri yoksa erişim engellenmiş olabilir
  throw new Blocked("u.gg istatistik dosyalarına erişilemedi (son 3 yama)");
}
function parseRanking(cr, champs) {
  const byKey = {}; for (const s in champs) byKey[champs[s].k] = s;
  const total = cr[3], bans = cr[1] || {}, banTotal = bans.total_matches || total;
  const rows = {}, worst = {};
  for (const rn in cr[0]) {
    const role = ROLE_CR[rn]; if (!role) continue;
    for (const x of cr[0][rn]) {
      const slug = byKey[x[0]]; if (!slug) continue;
      const wins = x[2], games = x[3]; if (!games) continue;
      (rows[slug] ||= {})[role] = [+(wins / games * 100).toFixed(2), +(games / total * 100).toFixed(2), +((bans[x[0]] || 0) / banTotal * 100).toFixed(2), games];
      (worst[role] ||= {})[slug] = (x[1] || []).map(([o, ow, g]) => [byKey[o], g ? +(100 - ow / g * 100).toFixed(2) : 50, g]).filter(m => m[0]);
    }
  }
  return { rows, worst, total };
}

/* ---------- 5. u.gg buildler ve eşleşmeler ---------- */
function parseOverview(ov, items, rk) {
  const reg = ov && ov[REGION]; if (!reg) return null;
  const pick = r => reg[r] || {};
  const out = {};
  const isBoot = id => items[id] && items[id].cat === "bot";
  const isFin = id => items[id] && (items[id].tier === "fin" || items[id].cat === "bot");
  for (const rid in pick(rk)) {
    const role = ROLE_UGG[rid]; if (!role) continue;
    const o = pick(rk)[rid][0]; if (!o || !o[6] || !o[6][1]) continue;
    const games = o[6][1], wr = o[6][0] / games * 100;
    const core = (o[3] && o[3][2] || []).map(String).filter(id => items[id]);
    const opts = (o[5] || []).slice(0, 3).map(sl => (sl || []).map(([id, w, g]) => [String(id), w, g]).filter(x => isFin(x[0])));
    const variant = (pickFn) => {
      const list = [...core]; const used = new Set(list);
      for (const sl of opts) { const c = pickFn(sl.filter(x => !used.has(x[0]) && !(isBoot(x[0]) && list.some(isBoot)))); if (c) { list.push(c[0]); used.add(c[0]); } }
      return list;
    };
    const pop = variant(sl => sl.slice().sort((a, b) => b[2] - a[2])[0]);
    const minG = Math.max(30, games * 0.03);
    const win = variant(sl => sl.filter(x => x[2] >= minG).sort((a, b) => b[1] / b[2] - a[1] / a[2])[0] || sl.slice().sort((a, b) => b[2] - a[2])[0]);
    const all = [...pop]; for (const sl of opts) for (const x of sl.slice().sort((a, b) => b[2] - a[2])) if (!all.includes(x[0])) all.push(x[0]);
    const sit = all.filter(id => !pop.includes(id) && !isBoot(id)).slice(0, 6);
    const rune = o[0] || [];
    out[role] = {
      g: games, wr: +wr.toFixed(2),
      v: [["pop", pop.filter(id => !isBoot(id)), +(o[3] && o[3][0] ? o[3][1] / o[3][0] * 100 : wr).toFixed(1), o[3] ? o[3][0] : 0]],
      win: win.filter(id => !isBoot(id)),
      boots: [...pop, ...all].find(isBoot) || null,
      start: (o[2] && o[2][2] || []).map(String).filter(id => items[id]),
      rs: [rune[2], rune[3]], ru: (rune[4] || []).map(String),
      sp: (o[1] && o[1][2] || []).map(String), so: (o[4] && o[4][2] || []).join(""), mx: o[4] ? o[4][3] : "",
      sit,
      // 4., 5. ve 6. eşya seçenekleri: [eşya, kazanma %, maç] (en çok alınan 5, en az 20 maç)
      opt: (o[5] || []).slice(0, 3).map(sl => (sl || []).filter(x => isFin(String(x[0])) && !isBoot(String(x[0])) && x[2] >= 20).sort((a, b) => b[2] - a[2]).slice(0, 5).map(([id, w, g]) => [String(id), +(w / g * 100).toFixed(1), g])),
      // başlangıç eşyalarının kazanma oranı ve maç sayısı
      stw: o[2] && o[2][0] ? [+(o[2][1] / o[2][0] * 100).toFixed(1), o[2][0]] : null,
    };
  }
  return out;
}
function parseCounters(co, byKey) {
  const reg = co && co[REGION] && co[REGION][RANK_UGG]; if (!reg) return {};
  const out = {};
  for (const rid in reg) {
    const role = ROLE_UGG[rid]; if (!role) continue;
    const lists = reg[rid][1] || [];
    const rows = [];
    // yalnızca aynı koridordaki rakipler (ör. ormana giden orta koridor şampiyonu sayılmaz)
    for (const l of lists) for (const [o, orole, w, g] of l || []) { const s = byKey[o]; if (s && g && String(orole) === String(rid)) rows.push([s, +(w / g * 100).toFixed(2), g]); }
    out[role] = rows;
  }
  return out;
}
async function updateBuilds(champs, items, stats, prevB, prevMU) {
  const byKey = {}; for (const s in champs) byKey[champs[s].k] = s;
  const B = {}, MUc = {}; let ok = 0, fail = 0;
  const p = stats.uggPatch;
  for (const slug of Object.keys(champs).sort()) {
    const k = champs[slug].k;
    try {
      const ov = await get(`${UGG}/overview/${p}/ranked_solo_5x5/${k}/1.5.0.json`, { json: true, tries: 3, okMissing: true });
      await sleep(350);
      if (!ov) throw new Error("build dosyası yok");
      const main = parseOverview(ov, items, RANK_UGG) || {};
      const high = parseOverview(ov, items, RANK_HIGH) || {};
      // tarz buildleri (u.gg ap / tank / ad / crit / lethality / onhit sayfaları): her birinin kendi eşyası, rün sayfası ve oranı var
      const sty = {};
      for (const st of STYLE_UGG) {
        const so = await get(`${UGG}/${st}-overview/${p}/ranked_solo_5x5/${k}/1.5.0.json`, { json: true, tries: 2, okMissing: true });
        await sleep(200);
        if (!so) continue;
        const x = parseOverview(so, items, RANK_UGG) || {};
        for (const r in x) (sty[r] ||= {})[st] = x[r];
      }
      const rs = stats.rows[slug] || {};
      const tot = Object.values(rs).reduce((a, x) => a + x[3], 0) || 1;
      const roles = {};
      for (const r in main) {
        const share = (rs[r] ? rs[r][3] : main[r].g) / tot;
        if (share < 0.08 && main[r].g < 3000) continue;
        const R = main[r];
        const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
        if (!same(R.win, R.v[0][1])) R.v.push(["win", R.win, null, 0]);
        // Master+ buildi kendi rün sayfasıyla (u.gg her derece grubuna ayrı sayfa verir)
        if (high[r] && high[r].g >= 400 && !R.v.some(v => same(v[1], high[r].v[0][1]))) R.v.push(["high", high[r].v[0][1], high[r].v[0][2], high[r].v[0][3], high[r].ru]);
        delete R.win;
        // tarz buildleri: koridorda en az 300 maç ve koridor maçlarının %3'ü; ana buildle aynı olanlar atlanır
        const st = {};
        for (const name in sty[r] || {}) { const X = sty[r][name];
          if (X.g < Math.max(300, R.g * 0.03) || same(X.v[0][1], R.v[0][1])) continue;
          st[name] = { g: X.g, wr: X.wr, i: X.v[0][1], b: X.boots, ru: X.ru, sp: X.sp, start: X.start, so: X.so, mx: X.mx }; }
        if (Object.keys(st).length) R.st = st;
        roles[r] = R;
      }
      if (Object.keys(roles).length) { B[slug] = roles; ok++; }
      const co = await get(`${UGG}/counters/${p}/ranked_solo_5x5/${k}/1.5.0.json`, { json: true, tries: 3, okMissing: true });
      await sleep(350);
      if (co) MUc[slug] = parseCounters(co, byKey);
    } catch (e) {
      fail++; problems.push("build " + slug + ": " + e.message);
      if (prevB && prevB.c && prevB.c[slug]) B[slug] = prevB.c[slug];
    }
  }
  const n = Object.keys(champs).length;
  if (ok < n * 0.8) throw new Error(`Buildler: ${n} şampiyondan yalnızca ${ok} okunabildi`);
  log("build", ok, "şampiyon,", fail, "hata; eşleşme", Object.keys(MUc).length);
  return { B: sortKeys(B), MUc };
}
/* Eşleşmeleri birleştir: u.gg sayaçları (en iyi/en kötü 10) + sıralama dosyasındaki en kötü 10 (iki yönlü) */
function mergeMatchups(worst, MUc, prev) {
  const MU = { top: {}, jg: {}, mid: {}, adc: {}, sup: {} };
  const put = (r, a, b, wr, g) => { if (!MU[r] || !a || !b || a === b || g < 100) return; /* 100–300 maç arası arayüzde "az veri" diye işaretlenir */ const m = (MU[r][a] ||= {}); if (!m[b] || m[b][1] < g) m[b] = [wr, g]; };
  for (const r in worst) for (const a in worst[r]) for (const [b, wr, g] of worst[r][a]) { put(r, a, b, wr, g); put(r, b, a, +(100 - wr).toFixed(2), g); }
  for (const a in MUc) for (const r in MUc[a]) for (const [b, wr, g] of MUc[a][r]) { put(r, a, b, wr, g); put(r, b, a, +(100 - wr).toFixed(2), g); }
  const out = {}; let n = 0;
  for (const r in MU) { out[r] = {}; for (const a of Object.keys(MU[r]).sort()) { out[r][a] = Object.keys(MU[r][a]).sort().map(b => [b, +MU[r][a][b][0].toFixed(1), MU[r][a][b][1]]); n += out[r][a].length; } }
  if (n < 2000) { if (prev) return prev; throw new Error("Eşleşmeler: çok az kayıt (" + n + ")"); }
  log("eşleşme kaydı", n);
  return out;
}

/* ---------- 6. Yama notları ---------- */
const { parseNotes } = require("./notes.js");
async function updateNotes(ver, champs, items) {
  const [a, b] = ver.split(".");
  const patch = (+a + 10) + "." + b;
  const base = "https://www.leagueoflegends.com/tr-tr/news/game-updates/";
  let url = `${base}league-of-legends-patch-${+a + 10}-${b}-notes/`;
  let h = await get(url, { okMissing: true });
  let shown = patch;
  if (!h) {
    // en yeni notu liste sayfasından bul
    const list = await get(base);
    const links = [...new Set([...list.matchAll(/\/tr-tr\/news\/game-updates\/((?:league-of-legends-)?patch-(\d+)-(\d+)-notes)\/?/g)].map(m => [m[1], +m[2], +m[3]]).map(JSON.stringify))].map(JSON.parse)
      .sort((x, y) => y[1] - x[1] || y[2] - x[2]);
    if (!links.length) { log("yama notu bulunamadı"); return null; }
    url = `${base}${links[0][0]}/`; shown = links[0][1] + "." + links[0][2]; h = await get(url);
  }
  const itemTr = {}; for (const id in items) itemTr[id] = items[id].n;
  const { ch, it } = parseNotes(nextData(h), champs, itemTr);
  const title = strip((h.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
  if (!Object.keys(ch).length && !Object.keys(it).length) problems.push("yama notu: şampiyon/eşya değişikliği bulunamadı (" + url + ")");
  log("yama notu", shown, Object.keys(ch).length, "şampiyon,", Object.keys(it).length, "eşya");
  return { patch: shown, url, title, champs: Object.keys(ch), items: Object.keys(it).filter(k => it[k].known), ch: sortKeys(ch), it: sortKeys(it) };
}

/* ---------- ana akış ---------- */
(async () => {
  fs.mkdirSync(DATA, { recursive: true }); fs.mkdirSync(IMG, { recursive: true });
  const state = readJSON(STATE_FILE, { images: {} }); state.images ||= {};
  const prevMeta = readGlobal("meta.js", "LOL_META") || {};
  const prevChamps = readGlobal("champs.js", "LOL_CHAMPS");
  const prevItems = readGlobal("items.js", "LOL_ITEMS");
  const prevAbil = readGlobal("abilities.js", "LOL_ABIL");
  const prevStats = readGlobal("stats.js", "LOL_STATS");
  const prevBuilds = readGlobal("builds.js", "LOL_BUILDS");
  const prevMU = readGlobal("matchups.js", "LOL_MU");
  const now = new Date(); let failed = false;
  const hoursSince = k => prevMeta[k] ? (now - new Date(prevMeta[k])) / 36e5 : 1e9;

  // 1. Data Dragon
  let dd = null;
  try { dd = await updateDDragon(state, { champs: prevChamps }); } catch (e) { failed = true; problems.push(e.message); }
  const ver = dd ? dd.ver : prevMeta.dd;
  const patchChanged = !!ver && ver !== prevMeta.dd;
  if (patchChanged) log("YAMA DEĞİŞTİ:", prevMeta.dd, "->", ver);

  // 2. wiki taban değerleri (yeni yamada ya da 20 saatte bir)
  let wiki = readJSON(path.join(DATA, "wiki-stats.json"), null);
  if (!args.has("--skip-wiki") && (!wiki || patchChanged || FULL || hoursSince("wikiAt") > 20)) {
    try { wiki = await updateWikiStats(); fs.writeFileSync(path.join(DATA, "wiki-stats.json"), JSON.stringify(sortKeys(wiki))); prevMeta.wikiAt = now.toISOString(); }
    catch (e) { problems.push("wiki taban: " + e.message); }
    try { fs.writeFileSync(path.join(DATA, "item-limits.json"), JSON.stringify(sortKeys(await updateItemLimits()))); }
    catch (e) { problems.push("eşya grupları: " + e.message); }
  }

  // şampiyonlar + eşyalar + rünler
  let champs = prevChamps, items = prevItems, runes = readGlobal("runes.js", "LOL_RUNES");
  if (dd) {
    try { champs = await buildChamps(dd, wiki, state); writeGlobal("champs.js", "LOL_CHAMPS", champs, "Şampiyonlar (Türkçe adlar, yetenekler, taban değerler), kaynak: Riot Data Dragon tr_TR + LoL Wiki (CC BY-SA 4.0)"); }
    catch (e) { failed = true; problems.push("şampiyonlar: " + e.message); }
    try {
      const used = new Set(); for (const s in (prevBuilds && prevBuilds.c) || {}) for (const r in prevBuilds.c[s]) { const R = prevBuilds.c[s][r]; R.v.forEach(v => v[1].forEach(x => used.add(x))); (R.sit || []).forEach(x => used.add(x)); if (R.boots) used.add(R.boots); }
      items = await buildItems(dd, state, used); }
    catch (e) { failed = true; problems.push("eşyalar: " + e.message); }
    try { runes = await buildRunes(dd, state); writeGlobal("runes.js", "LOL_RUNES", runes, "Rünler ve sihirdar büyüleri, kaynak: Riot Data Dragon tr_TR"); }
    catch (e) { problems.push("rünler: " + e.message); }
  }
  if (!champs || !items) { problems.forEach(p => console.log(" -", p)); console.log("Temel veri yok; çıkılıyor."); process.exit(1); }

  // 3. yetenek sayıları: yeni yamada, 3 günde bir, --full ya da dosya yoksa
  if (!args.has("--skip-wiki") && (!prevAbil || patchChanged || FULL || hoursSince("abilitiesAt") > 72)) {
    try { writeGlobal("abilities.js", "LOL_ABIL", await updateAbilities(champs, prevAbil), "Yetenek hasarları, oranlar, bekleme süreleri, kalkan ve kitle kontrolü, kaynak: wiki.leagueoflegends.com (CC BY-SA 4.0)"); prevMeta.abilitiesAt = now.toISOString(); }
    catch (e) { failed = true; problems.push("yetenekler: " + e.message); }
  }

  // 4–5. u.gg oranları, buildler, eşleşmeler
  let stats = prevStats, builds = prevBuilds;
  if (!args.has("--skip-ugg") && dd) {
    try {
      const { p, cr } = await uggPatch(dd);
      const { rows, worst, total } = parseRanking(cr, champs);
      const n = Object.keys(rows).length;
      if (n < 150) throw new Error(`İstatistik: çok az şampiyon (${n})`);
      if (prevStats && prevStats.rows && n < Object.keys(prevStats.rows).length * 0.9) throw new Error(`İstatistik: şampiyon sayısı çok düştü (${n})`);
      stats = { patch: gamePatch(p.replace("_", ".")), uggPatch: p, rank: "Zümrüt+", region: "Dünya", games: total, date: now.toISOString().slice(0, 10), rows: sortKeys(rows) };
      writeGlobal("stats.js", "LOL_STATS", stats, "Kazanma/seçilme/yasaklanma oranları (Dünya, Zümrüt+), kaynak: u.gg");
      log("istatistik", stats.patch, n, "şampiyon,", total, "maç");
      const statsChanged = !prevBuilds || prevBuilds.patch !== stats.patch;
      if (statsChanged || FULL || args.has("--builds") || hoursSince("buildsAt") > 20) {
        try {
          const { B, MUc } = await updateBuilds(champs, items, stats, prevBuilds, prevMU);
          builds = { patch: stats.patch, c: B };
          writeGlobal("builds.js", "LOL_BUILDS", builds, "Buildler, rünler, büyüler ve yetenek sırası (Dünya, Zümrüt+ / Master+), kaynak: u.gg");
          writeGlobal("matchups.js", "LOL_MU", mergeMatchups(worst, MUc, prevMU), "Koridor eşleşmeleri: [rakip, kazanma oranı, maç] (Dünya, Zümrüt+), kaynak: u.gg");
          prevMeta.buildsAt = now.toISOString();
        } catch (e) { failed = true; problems.push(e.message); }
      }
    } catch (e) {
      if (e instanceof Blocked) log("ATLANDI:", e.message, "— eski oran/build verisi korunuyor");
      else { failed = true; problems.push(e.message); }
    }
  }

  // eşya listesini buildlerde kullanılanlara göre işaretleyip yaz
  if (builds && builds.c) { const used = new Set(); for (const s in builds.c) for (const r in builds.c[s]) { const R = builds.c[s][r]; R.v.forEach(v => v[1].forEach(x => used.add(x))); (R.sit || []).forEach(x => used.add(x)); if (R.boots) used.add(R.boots); }
    for (const id in items) items[id].u = used.has(id) ? 1 : 0; }
  // birlikte alınamayan eşya grupları (wiki), yalnızca menzilli eşyalar
  const limits = readJSON(path.join(DATA, "item-limits.json"), {});
  for (const id in items) { delete items[id].g; delete items[id].ro; const L = limits[id]; if (L) { if (L.g) items[id].g = L.g; if (L.ro) items[id].ro = 1; } }
  writeGlobal("items.js", "LOL_ITEMS", items, "Eşyalar (Türkçe adlar, sayılar, etkiler), kaynak: Riot Data Dragon tr_TR");

  // 6. yama notları (her çalışmada; Riot notları sonradan düzeltebilir)
  let notes = prevMeta.notes || null;
  if (ver) {
    try { notes = (await updateNotes(ver, champs, items)) || notes; }
    catch (e) { problems.push("yama notu: " + e.message); }
  }

  // meta
  const meta = {
    ...prevMeta, dd: ver, patch: ver ? gamePatch(ver) : prevMeta.patch, statsPatch: stats ? stats.patch : null, statsAt: stats ? stats.date : null,
    rank: stats ? stats.rank : null, checkedAt: now.toISOString(), notes, champCount: Object.keys(champs).length,
  };
  if (patchChanged) meta.patchSeenAt = now.toISOString();
  const cmp = o => JSON.stringify({ ...o, checkedAt: 0 });
  if (cmp(meta) !== cmp(prevMeta) || !fs.existsSync(path.join(DATA, "meta.js"))) writeGlobal("meta.js", "LOL_META", meta, "Yama ve güncelleme bilgisi");
  fs.writeFileSync(STATE_FILE, JSON.stringify({ images: sortKeys(state.images) }, null, 1));

  if (problems.length) { console.log("\nUYARILAR (" + problems.length + "):"); problems.slice(0, 80).forEach(p => console.log(" -", p)); }
  log("süre", ((Date.now() - T0) / 60000).toFixed(1), "dk");
  if (failed) { console.log("\nBazı adımlar başarısız oldu; eski veriler korundu."); process.exit(1); }
  log("bitti");
})().catch(e => { console.error(e); process.exit(1); });
