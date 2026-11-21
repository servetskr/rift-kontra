#!/usr/bin/env node
/*
 * Rift Kontra · VALORANT veri güncelleyici
 * Kullanım: node valorant/scripts/update.js [--full] [--game]
 *  - Oyun sürümünü her çalışmada okur (valorant-api.com)
 *  - Sürüm değiştiyse, 7 günden eskiyse ya da --full verildiyse ajanları, silahları, kalkanları,
 *    haritaları (mini harita ve bölge adlarıyla) ve görselleri yeniler (valorant-api.com, tr-TR)
 *  - --game: yalnızca oyun verisini zorla yeniler; oranlar, ikililer ve yama notları atlanır
 *  - Ajan kazanma/seçilme oranlarını ve harita bazlı oranları her çalışmada çeker (blitz.gg, Elmas+)
 *  - Aynı takımdaki ajan ikililerinin birlikte kazanma oranlarını çeker (vstats.gg, Elmas+, tüm haritalar + havuz)
 *  - Son üç resmi Türkçe yama notundan değişen ajan, silah ve haritaları çıkarır (playvalorant.com/tr-tr)
 * Her adım kendi sağlamlık kontrolünden geçer; kontrolü geçemeyen veri yazılmaz, eskisi korunur.
 * Yollar valorant/ klasörüne göredir. Bir adım başarısız olursa çıkış kodu 1'dir.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const IMG = path.join(ROOT, "img");
const STATE_FILE = path.join(DATA, "state.json");
const UA = "Mozilla/5.0 (compatible; RiftKontraUpdater/1.0; +https://github.com/servetskr/rift-kontra)";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const API = "https://valorant-api.com/v1";
const args = new Set(process.argv.slice(2));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const problems = [];

/* ---------- yardımcılar ---------- */
async function get(url, { binary = false, tries = 4, okMissing = false, ua = UA } = {}) {
  let wait = 2500;
  for (let t = 1; t <= tries; t++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": ua, "Accept-Language": "tr,en;q=0.8" } });
      if (r.status === 404 && okMissing) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return binary ? Buffer.from(await r.arrayBuffer()) : await r.text();
    } catch (e) {
      if (t === tries || /HTTP 40[13]/.test(e.message)) throw new Error(`${url} -> ${e.message}`);
      await sleep(wait); wait *= 2;
    }
  }
}
const api = async p => { const j = JSON.parse(await get(API + p)); if (j.status !== 200 || !j.data) throw new Error("valorant-api: " + p); return j.data; };
const nextData = h => {
  const m = h.split('<script id="__NEXT_DATA__" type="application/json">')[1];
  if (!m) throw new Error("NEXT_DATA bulunamadı");
  return JSON.parse(m.split("</script>")[0]);
};
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const readGlobal = (file, name) => {
  try { const w = {}; new Function("window", fs.readFileSync(path.join(DATA, file), "utf8"))(w); return w[name]; } catch { return null; }
};
/* Anahtarlar sıralı yazılır: veri değişmediyse dosya da değişmez (gereksiz commit olmaz) */
const sortKeys = v => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeys(v[k])])) : v;
function writeGlobal(file, name, value, comment) {
  const body = `/* ${comment} — otomatik üretildi, elle düzenleme */\nwindow.${name}=${JSON.stringify(sortKeys(value))};\n`;
  const f = path.join(DATA, file);
  const old = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  if (old !== body) { fs.writeFileSync(f, body); log("yazıldı", file, (body.length / 1024).toFixed(0) + " KB"); return true; }
  log("değişmedi", file); return false;
}
const slug = s => (s || "").toLocaleLowerCase("en").replace(/ı/g, "i").replace(/[^a-z0-9]/g, "");
// Özel adlar (ajan, silah, harita) İngilizce kurala göre küçültülür: "KILLJOY" → "Killjoy"; yetenek adları Türkçe: "ŞAŞKIN" → "Şaşkın"
const titleTR = (s, loc = "tr") => /\//.test(s) ? s : s.toLocaleLowerCase(loc).replace(/(^|[\s.'’(-])(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase(loc));
const richTR = s => (s || "").replace(/\r/g, "").replace(/<(whitebold|uiBold|bold)>([\s\S]*?)<\/>/gi, "**$2**").replace(/<[a-zA-Z]+>([\s\S]*?)<\/>/g, "$1").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
const r2 = v => Math.round(v * 100) / 100;

async function saveImage(url, file, state) {
  if (!url) return null;
  const full = path.join(IMG, file);
  if (state.images[file] === url && fs.existsSync(full)) return "img/" + file;
  const buf = await get(url, { binary: true, tries: 3 });
  if (buf.length < 200) throw new Error("görsel çok küçük: " + url);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buf); state.images[file] = url; state.downloaded = (state.downloaded || 0) + 1;
  return "img/" + file;
}

/* ---------- 1. Oyun verisi (valorant-api.com) ---------- */
const SLOT = { Passive: "P", Ability1: "Q", Ability2: "E", Grenade: "C", Ultimate: "X" };
async function updateGame(state, prev) {
  const [agents, weapons, gear, maps] = [await api("/agents?language=tr-TR&isPlayableCharacter=true"), await api("/weapons?language=tr-TR"), await api("/gear?language=tr-TR"), await api("/maps?language=tr-TR")];
  // Ajanlar
  const roles = {}; const A = {};
  const seen = new Set();
  for (const a of agents) {
    if (!a.role || seen.has(a.uuid)) continue; seen.add(a.uuid);
    const id = slug(a.displayName);
    const rid = slug(a.role.assetPath.split("/").pop().replace(/_PrimaryDataAsset/, ""));
    roles[rid] = { n: a.role.displayName, d: a.role.description, img: await saveImage(a.role.displayIcon, `role/${rid}.png`, state) };
    const ab = [];
    for (const b of a.abilities) {
      if (!SLOT[b.slot] || !b.displayName) continue;
      ab.push({ k: SLOT[b.slot], n: titleTR(b.displayName), d: richTR(b.description), img: b.displayIcon ? await saveImage(b.displayIcon, `abil/${id}-${SLOT[b.slot].toLowerCase()}.png`, state) : null });
    }
    ab.sort((x, y) => "PQECX".indexOf(x.k) - "PQECX".indexOf(y.k));
    A[id] = {
      n: titleTR(a.displayName, "en"), r: rid, d: richTR(a.description), c: (a.backgroundGradientColors || []).slice(0, 2).map(x => "#" + x.slice(0, 6)),
      img: await saveImage(a.killfeedPortrait || a.displayIconSmall, `agent/${id}.png`, state), ab,
    };
  }
  const nA = Object.keys(A).length;
  if (nA < 25) throw new Error(`Ajanlar: liste çok kısa (${nA})`);
  if (Object.keys(roles).length !== 4) throw new Error("Ajanlar: rol sayısı 4 değil (" + Object.keys(roles).join(",") + ")");
  if (prev && prev.agents && nA < Object.keys(prev.agents).length) throw new Error(`Ajanlar: sayı azaldı (${nA})`);
  if (prev && prev.agents) { const added = Object.keys(A).filter(k => !prev.agents[k]); if (added.length) log("YENİ AJAN:", added.join(", ")); }

  // Silahlar
  const W = {}; const catText = {};
  for (const w of weapons) {
    const s = w.weaponStats; if (!s || !s.damageRanges || !s.damageRanges.length) continue;
    const cat = w.category.split("::")[1];
    const id = slug(w.displayName);
    if (w.shopData && w.shopData.categoryText) (catText[cat] ||= {})[w.shopData.categoryText] = ((catText[cat] || {})[w.shopData.categoryText] || 0) + 1;
    const ads = s.adsStats || null;
    W[id] = {
      n: titleTR(w.displayName, "en"), cat, cost: w.shopData ? w.shopData.cost : 0,
      fr: r2(s.fireRate), mag: s.magazineSize, rl: r2(s.reloadTimeSeconds), eq: r2(s.equipTimeSeconds),
      sp: r2(s.firstBulletAccuracy), pel: s.shotgunPelletCount > 1 ? s.shotgunPelletCount : 1,
      pen: (s.wallPenetration || "").split("::")[1] || "", run: r2(s.runSpeedMultiplier || 0),
      ads: ads ? { fr: r2(ads.fireRate), sp: r2(ads.firstBulletAccuracy), zoom: r2(ads.zoomMultiplier), burst: ads.burstCount } : null,
      alt: (s.altFireType || "").split("::")[1] || "",
      dr: s.damageRanges.map(d => [d.rangeStartMeters, d.rangeEndMeters, r2(d.headDamage), r2(d.bodyDamage), r2(d.legDamage)]),
      img: await saveImage(w.displayIcon, `weapon/${id}.png`, state),
    };
  }
  const cats = {}; for (const c in catText) cats[c] = Object.entries(catText[c]).sort((a, b) => b[1] - a[1])[0][0];
  const nW = Object.keys(W).length;
  if (nW < 16) throw new Error(`Silahlar: liste çok kısa (${nW})`);
  if (!W.vandal || W.vandal.dr[0][2] < 100 || W.vandal.fr < 5) throw new Error("Silahlar: Vandal verisi bozuk görünüyor");

  // Kalkanlar
  const G = {};
  for (const g of gear) {
    if (!g.shopData || g.shopData.category !== "Armor") continue;
    const id = slug(g.assetPath.split("/").pop().replace(/_PrimaryAsset/, ""));
    const absorb = (g.details || []).find(x => /SOĞURULAN/i.test(x.name));
    const cap = (g.description.match(/(\d+) hasar soğurduktan/) || [])[1];
    G[id] = { n: titleTR(g.displayName.replace(/Klkn/i, "Kalkan")), d: g.description, cost: g.shopData.cost, abs: absorb ? parseInt(absorb.value.replace(/\D/g, "")) / 100 : 0.66,
      cap: cap ? +cap : null, pool: +(((g.details || []).find(x => /HAVUZ/i.test(x.name)) || {}).value || 0) || null,
      img: await saveImage(g.displayIcon, `gear/${id}.png`, state) };
  }
  if (Object.keys(G).length < 2) throw new Error("Kalkanlar okunamadı");

  // Haritalar: yalnızca A/B bölgeli standart haritalar
  // Mini harita (displayIcon) ve bölge adları (callouts) Lineup ekranı içindir. Konum, oyun koordinatından
  // mini harita oranına valorant-api'nin verdiği katsayılarla çevrilir: x = oyunY·xMultiplier + xScalarToAdd,
  // y = oyunX·yMultiplier + yScalarToAdd (0–1, sol üst köşe 0,0). Anahtar İngilizce addır ("A Main"), ad Türkçe.
  const mapsEn = await api("/maps");
  const M = {}; let nMini = 0;
  for (const m of maps) {
    if (!m.tacticalDescription || !m.callouts || !m.callouts.length) continue;
    const id = slug(m.displayName);
    M[id] = { n: titleTR(m.displayName, "en"), t: m.tacticalDescription, co: m.coordinates || "", img: await saveImage(m.listViewIcon, `map/${id}.png`, state) };
    const en = mapsEn.find(x => x.uuid === m.uuid);
    if (!m.displayIcon || !m.xMultiplier || !m.yMultiplier || !en || !en.callouts || en.callouts.length !== m.callouts.length) { problems.push("mini harita verisi yok: " + id); continue; }
    const cl = [], keys = new Set();
    m.callouts.forEach((c, i) => {
      const e = en.callouts[i]; if (!c.location || !e) return;
      const x = c.location.y * m.xMultiplier + m.xScalarToAdd, y = c.location.x * m.yMultiplier + m.yScalarToAdd;
      if (!(x > -0.02 && x < 1.02 && y > -0.02 && y < 1.02)) return;
      let k = `${e.superRegionName} ${e.regionName}`.replace(/\s+/g, " ").trim(); if (keys.has(k)) k += " " + (i + 1); keys.add(k);
      cl.push({ k, s: c.superRegionName, r: c.regionName, x: Math.round(x * 1e4) / 1e4, y: Math.round(y * 1e4) / 1e4 });
    });
    if (cl.length < 10 || !cl.some(c => /Site$/.test(c.k))) { problems.push(`mini harita bölgeleri az ya da bozuk: ${id} (${cl.length})`); continue; }
    M[id].mm = await saveImage(m.displayIcon, `minimap/${id}.png`, state);
    M[id].cl = cl.sort((a, b) => a.k.localeCompare(b.k, "en")); nMini++;
  }
  if (Object.keys(M).length < 8) throw new Error(`Haritalar: liste çok kısa (${Object.keys(M).length})`);
  if (nMini < 8) throw new Error(`Haritalar: mini harita/bölge verisi çok az (${nMini})`);
  log("oyun verisi:", nA, "ajan,", nW, "silah,", Object.keys(G).length, "kalkan,", Object.keys(M).length, "harita");
  return { agents: A, roles, weapons: W, cats, gear: G, maps: M };
}

/* ---------- 2. Ajan oranları (blitz.gg, Rekabetçi · Elmas+) ---------- */
const RANK_TR = { Iron: "Demir", Bronze: "Bronz", Silver: "Gümüş", Gold: "Altın", Platinum: "Platin", Diamond: "Elmas", Ascendant: "Yücelik", Immortal: "Ölümsüzlük", Radiant: "Radyant" };
const plain = h => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
function parseTable(h) {
  const rows = {};
  for (const tr of h.split("<tr").slice(1)) {
    const cell = k => { const m = tr.match(new RegExp(`data-sort-key="${k}"[\\s\\S]*?cell-content[^>]*>([\\s\\S]*?)</div>`)); return m ? m[1].replace(/<[^>]+>/g, "").trim() : null; };
    const name = cell("name") || (tr.match(/alt="([^"]+)"/) || [])[1];
    if (!name) continue;
    const wr = parseFloat(cell("winrate")), pr = parseFloat(cell("pickrate")), n = parseInt((cell("matches") || "").replace(/[^\d]/g, ""));
    if (isFinite(wr) && isFinite(pr)) rows[slug(name)] = [wr, pr, n || 0];
  }
  return rows;
}
function filterLabel(h) {
  const t = plain(h);
  const m = t.match(/(Iron|Bronze|Silver|Gold|Platinum|Diamond|Ascendant|Immortal|Radiant)(\+?)\s+(V\d+)\s*-\s*ACT\s*([IVX]+)/);
  return m ? { rank: RANK_TR[m[1]] + m[2], act: `${m[3]} · Bölüm ${m[4]}` } : null;
}
async function updateStats(agentIds, mapIds, prev) {
  const B = "https://blitz.gg/valorant/stats";
  const h = await get(B + "/agents", { ua: BROWSER_UA, tries: 3 });
  const all = parseTable(h); const lbl = filterLabel(h);
  const known = Object.keys(all).filter(k => agentIds.has(k));
  if (known.length < agentIds.size * 0.8) throw new Error(`Oranlar: çok az ajan (${known.length}/${agentIds.size})`);
  if (Object.values(all).some(([wr, pr]) => wr < 30 || wr > 70 || pr < 0 || pr > 100)) throw new Error("Oranlar: değerler mantıksız");
  // Rekabetçi harita havuzu ve saldırı/savunma dengesi
  await sleep(2500);
  const mh = await get(B + "/maps", { ua: BROWSER_UA, tries: 3 });
  const pool = {};
  for (const tr of mh.split("<tr").slice(1)) {
    const t = plain("<tr" + tr).trim().split(" ");
    // "1 Abyss 14.2% 51.0% 49.4% 1,501,952"
    const i = t.findIndex(x => /%$/.test(x)); if (i < 2) continue;
    const name = slug(t.slice(1, i).join(" "));
    const [play, atk, def] = t.slice(i, i + 3).map(x => parseFloat(x));
    if (mapIds.has(name) && isFinite(atk)) pool[name] = { play, atk, def, n: parseInt((t[i + 3] || "").replace(/\D/g, "")) || 0 };
  }
  if (Object.keys(pool).length < 5) throw new Error(`Oranlar: harita havuzu okunamadı (${Object.keys(pool).length})`);
  const byMap = {};
  for (const m of Object.keys(pool).sort()) {
    await sleep(3000); // siteye yük bindirmemek için
    try {
      const rows = parseTable(await get(`${B}/agents?map=${m}`, { ua: BROWSER_UA, tries: 3 }));
      if (Object.keys(rows).length >= 15) byMap[m] = rows;
      else { problems.push("harita oranı boş: " + m); if (prev && prev.map && prev.map[m]) byMap[m] = prev.map[m]; }
    } catch (e) { problems.push("harita oranı " + m + ": " + e.message); if (prev && prev.map && prev.map[m]) byMap[m] = prev.map[m]; }
  }
  log("oranlar:", Object.keys(all).length, "ajan,", Object.keys(byMap).length, "harita", lbl ? lbl.rank + " " + lbl.act : "");
  return { src: "blitz.gg", rank: lbl ? lbl.rank : "", act: lbl ? lbl.act : "", queue: "Rekabetçi", date: new Date().toISOString().slice(0, 10), all, map: byMap, pool };
}

/* ---------- 2b. İkili kazanma oranları (vstats.gg, Rekabetçi · Elmas+) ----------
 * vstats.gg sitesinin kendi kullandığı statik dosyalar: /statistics/{bölüm}/ALL/{harita}/duo.json.gz
 * Her satır: d = aynı takımdaki iki ajanın uuid'si (sıralı), r = rütbe grubu (19 = Elmas, 22 Yücelik, 25 Ölümsüzlük, 27 Radyant),
 * m = maç, w = kazanılan maç. Elmas+ satırları toplanır. Ajanın tek başına oranı da aynı veriden çıkar
 * (bir maç, ajanın dört takım arkadaşıyla dört ayrı ikili satırında sayılır; Σw/Σm = ajanın kazanma oranı). */
const DUO_MIN_RANK = 19, DUO_KEEP = 200;
const gunzipMaybe = buf => (buf[0] === 0x1f && buf[1] === 0x8b) ? require("zlib").gunzipSync(buf) : buf;
function duoTable(rows, uuidToId) {
  const p = {}, ag = {};
  for (const x of rows) {
    if (!x || !Array.isArray(x.d) || x.d.length !== 2 || !(x.r >= DUO_MIN_RANK) || !(x.m > 0)) continue;
    const ids = x.d.map(u => uuidToId[u]); if (!ids[0] || !ids[1] || ids[0] === ids[1]) continue;
    const k = ids.sort().join("|");
    const c = (p[k] ||= [0, 0]); c[0] += x.m; c[1] += x.w;
    for (const id of ids) { const a = (ag[id] ||= [0, 0]); a[0] += x.m; a[1] += x.w; }
  }
  const out = { p: {}, ag: {} };
  for (const [k, [m, w]] of Object.entries(p)) if (m >= DUO_KEEP) out.p[k] = [Math.round(w / m * 1000) / 10, m];
  for (const [id, [m, w]] of Object.entries(ag)) out.ag[id] = [Math.round(w / m * 1000) / 10, Math.round(m / 4)];
  return out;
}
async function updateDuos(game, mapIds, prev) {
  // Güncel bölüm (act) kimliği valorant-api'den; vstats aynı uuid'yi kullanır
  const now = Date.now();
  const act = (await api("/seasons")).find(s => /Act$/.test(s.type || "") && new Date(s.startTime) <= now && new Date(s.endTime) >= now);
  if (!act) throw new Error("güncel bölüm bulunamadı");
  const agents = await api("/agents?isPlayableCharacter=true");
  const uuidToId = {}; for (const a of agents) { const id = slug(a.displayName); if (game.agents[id]) uuidToId[a.uuid] = id; }
  if (Object.keys(uuidToId).length < Object.keys(game.agents).length * 0.9) throw new Error("ajan uuid eşlemesi eksik");
  const maps = await api("/maps");
  const code = {}; for (const m of maps) { const id = slug(m.displayName); const c = (m.mapUrl || "").split("/")[3]; if (game.maps[id] && c) code[id] = c; }
  const B = `https://www.vstats.gg/statistics/${act.uuid}/ALL`;
  const fetchTable = async seg => {
    const buf = gunzipMaybe(await get(`${B}/${seg}/duo.json.gz`, { binary: true, ua: BROWSER_UA, tries: 3 }));
    const txt = buf.toString("utf8");
    if (!/^\s*\[/.test(txt)) throw new Error(`vstats ${seg}: JSON değil (site yapısı değişmiş olabilir)`);
    return duoTable(JSON.parse(txt), uuidToId);
  };
  const all = await fetchTable("ALL");
  const nP = Object.keys(all.p).length, games = Object.values(all.ag).reduce((s, x) => s + x[1], 0);
  if (nP < 300) throw new Error(`İkililer: çok az çift (${nP})`);
  if (games < 500000) throw new Error(`İkililer: çok az maç (${games})`);
  if (Object.values(all.p).some(([wr, m]) => m >= 2000 && (wr < 35 || wr > 65))) throw new Error("İkililer: oranlar mantıksız");
  const byMap = {};
  for (const m of [...mapIds].filter(x => code[x]).sort()) {
    await sleep(2500); // siteye yük bindirmemek için
    try {
      const t = await fetchTable(code[m]);
      if (Object.keys(t.p).length >= 150) byMap[m] = t;
      else { problems.push("ikili oranı az: " + m); if (prev && prev.map && prev.map[m]) byMap[m] = prev.map[m]; }
    } catch (e) { problems.push("ikili oranı " + m + ": " + e.message); if (prev && prev.map && prev.map[m]) byMap[m] = prev.map[m]; }
  }
  log("ikililer:", nP, "çift,", Object.keys(byMap).length, "harita,", act.displayName);
  return { src: "vstats.gg", url: "https://www.vstats.gg/agents", act: act.uuid, actName: (act.displayName || "").replace(/^ACT\s*/i, "Bölüm "), rank: "Elmas+", queue: "Rekabetçi", date: new Date().toISOString().slice(0, 10), all, map: byMap };
}

/* ---------- 3. Yama notları (playvalorant.com/tr-tr) ---------- */
const { parseNotes, norm } = require("./notes.js");
async function updateNotes(game, state) {
  const list = nextData(await get("https://playvalorant.com/tr-tr/news/tags/patch-notes/"));
  const arts = []; const seen = new Set();
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== "object") return;
    const u = o.action && o.action.payload && o.action.payload.url;
    if (u && o.title && /Yama Notları/i.test(o.title) && /^\/tr-tr\/news\//.test(u) && !seen.has(u)) { seen.add(u); arts.push({ url: u, title: o.title, date: o.publishedAt || o.publishDate || "" }); }
    for (const k in o) walk(o[k]);
  })(list);
  const ver = t => { const m = t.match(/(\d+)\.(\d+)/); return m ? +m[1] * 1000 + +m[2] : 0; };
  arts.sort((a, b) => ver(b.title) - ver(a.title) || String(b.date).localeCompare(String(a.date)));
  if (!arts.length) throw new Error("Yama notu listesi boş");
  // eşleştirme sözlükleri
  const ents = { agent: {}, weapon: {}, map: {} };
  for (const id in game.agents) { const a = game.agents[id]; const ab = {}; a.ab.forEach(x => ab[norm(x.n)] = [x.n, x.img]); ents.agent[norm(a.n)] = { id, ab }; }
  for (const id in game.weapons) ents.weapon[norm(game.weapons[id].n)] = { id };
  for (const id in game.maps) ents.map[norm(game.maps[id].n)] = { id };
  const out = [];
  for (const a of arts.slice(0, 3)) {
    try {
      const j = nextData(await get("https://playvalorant.com" + a.url.replace(/\/?$/, "/")));
      const blades = j.props.pageProps.page.blades;
      const bodies = blades.filter(b => b.richText && b.richText.body).map(b => b.richText.body);
      const mast = blades.find(b => b.type === "articleMasthead") || {};
      const r = parseNotes(bodies, ents);
      const patch = (a.title.match(/\d+\.\d+/) || [""])[0];
      out.push({ patch, title: a.title, url: "https://playvalorant.com" + a.url, date: String(mast.publishDate || a.date).slice(0, 10), sum: r.sum || (mast.description && mast.description.body ? mast.description.body.replace(/<[^>]+>/g, "") : ""), ag: r.ag, wp: r.wp, mp: r.mp });
      log("yama notu", patch, Object.keys(r.ag).length, "ajan,", Object.keys(r.wp).length, "silah,", Object.keys(r.mp).length, "harita");
    } catch (e) { problems.push("yama notu " + a.url + ": " + e.message); }
    await sleep(1000);
  }
  if (!out.length) throw new Error("Hiçbir yama notu okunamadı");
  return out;
}

/* ---------- ana akış ---------- */
(async () => {
  const t0 = Date.now();
  fs.mkdirSync(DATA, { recursive: true });
  const state = readJSON(STATE_FILE, { images: {} });
  state.images ||= {}; state.downloaded = 0;
  const prevMeta = readGlobal("meta.js", "VAL_META") || {};
  const prevGame = readGlobal("game.js", "VAL_GAME");
  const prevStats = readGlobal("stats.js", "VAL_STATS");
  const now = new Date();
  let failed = false;

  // 0. sürüm
  let version = prevMeta.version || null;
  try { const v = await api("/version"); version = { branch: v.branch, build: v.version, date: v.buildDate }; }
  catch (e) { failed = true; problems.push("sürüm: " + e.message); }
  const patch = version && (version.branch.match(/(\d+\.\d+)/) || [])[1] || prevMeta.patch;
  const verChanged = !!version && (!prevMeta.version || version.build !== prevMeta.version.build);
  if (verChanged && prevMeta.version) log("SÜRÜM DEĞİŞTİ:", prevMeta.version.build, "->", version.build);

  // 1. oyun verisi
  let game = prevGame;
  const age = prevMeta.gameAt ? (now - new Date(prevMeta.gameAt)) / 864e5 : 99;
  if (!prevGame || verChanged || age > 7 || args.has("--full") || args.has("--game")) {
    try { game = await updateGame(state, prevGame); writeGlobal("game.js", "VAL_GAME", game, "Ajanlar, silahlar, kalkanlar ve haritalar, kaynak: valorant-api.com (tr-TR)"); prevMeta.gameAt = now.toISOString(); }
    catch (e) { failed = true; problems.push("oyun verisi: " + e.message); }
  }
  if (!game) { console.error("Oyun verisi yok; devam edilemiyor."); process.exit(1); }

  const only = args.has("--game");
  // 2. oranlar (her çalışmada)
  let stats = prevStats;
  if (!only) try { stats = await updateStats(new Set(Object.keys(game.agents)), new Set(Object.keys(game.maps)), prevStats); writeGlobal("stats.js", "VAL_STATS", stats, "Ajan kazanma/seçilme oranları (Rekabetçi), kaynak: blitz.gg"); }
  catch (e) {
    if (/HTTP 40[13]/.test(e.message)) log("ATLANDI: blitz.gg erişimi engelliyor; oranlar olmadan devam ediliyor —", e.message);
    else { failed = true; problems.push("oranlar: " + e.message); }
  }

  // 2b. ikili oranları (her çalışmada; harita listesi oranların rekabetçi havuzundan)
  const prevDuos = readGlobal("duos.js", "VAL_DUOS");
  if (!only) try {
    await sleep(2000);
    const pool = stats && stats.pool && Object.keys(stats.pool).length ? Object.keys(stats.pool) : Object.keys(game.maps);
    const duos = await updateDuos(game, new Set(pool), prevDuos);
    writeGlobal("duos.js", "VAL_DUOS", duos, "Aynı takımdaki iki ajanın birlikte kazanma oranı (Rekabetçi, Elmas+), kaynak: vstats.gg");
  } catch (e) {
    if (/HTTP 40[13]/.test(e.message)) log("ATLANDI: vstats.gg erişimi engelliyor; ikili oranları olmadan devam ediliyor —", e.message);
    else { failed = true; problems.push("ikili oranları: " + e.message); }
  }

  // 3. yama notları (her çalışmada: Riot notları sonradan düzeltebiliyor)
  let notes = readGlobal("notes.js", "VAL_NOTES");
  if (!only) try { notes = await updateNotes(game, state); writeGlobal("notes.js", "VAL_NOTES", notes, "Yama değişiklikleri, kaynak: playvalorant.com/tr-tr resmi yama notları"); }
  catch (e) { failed = true; problems.push("yama notları: " + e.message); }

  // 4. meta
  const meta = { ...prevMeta, patch, version, statsAt: stats ? stats.date : prevMeta.statsAt, notesPatch: notes && notes[0] ? notes[0].patch : null, checkedAt: now.toISOString() };
  const cmp = o => JSON.stringify(sortKeys({ ...o, checkedAt: 0 }));
  if (cmp(meta) !== cmp(prevMeta) || !fs.existsSync(path.join(DATA, "meta.js"))) writeGlobal("meta.js", "VAL_META", meta, "Sürüm ve güncelleme bilgisi");
  const dl = state.downloaded; delete state.downloaded;
  fs.writeFileSync(STATE_FILE, JSON.stringify(sortKeys(state), null, 1) + "\n");

  if (problems.length) { console.log("\nUYARILAR:"); problems.forEach(p => console.log(" -", p)); }
  log(`bitti: ${dl} görsel indirildi, ${((Date.now() - t0) / 1000).toFixed(0)} sn`);
  if (failed) { console.log("\nBazı adımlar başarısız oldu; eski veriler korundu."); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
