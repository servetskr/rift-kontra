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
async function get(url, { binary = false, tries = 4, okMissing = false, ua = UA } = {}) {
  let wait = 3000;
  for (let t = 1; t <= tries; t++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": ua, "Accept-Language": "tr,en;q=0.8" } });
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
const { parseBuilds, parseItemList, kebab } = require("./wrc.js");
async function updateMatchups(slugMap, prev, prevBuilds) {
  let listH;
  try { listH = await get("https://wildriftcore.com/en/champions/", { tries: 2 }); }
  catch (e) { if (/HTTP 403/.test(e.message)) throw new Blocked("wildriftcore.com bu ağdan erişimi engelliyor (403)"); throw e; }
  const slugs = [...new Set([...listH.matchAll(/href="\/en\/champions\/([a-z0-9-]+)\/"/g)].map(m => m[1]))];
  if (slugs.length < 120) throw new Error(`Eşleşme: liste çok kısa (${slugs.length})`);
  const MU = { top: {}, jg: {}, mid: {}, adc: {}, sup: {} };
  const B = { c: {}, src: {}, champSrc: {} }; let bOk = 0;
  const to = s => slugMap[canon(s)];
  let ok = 0, fail = 0;
  for (const s of slugs) {
    try {
      const boards = parseBoards(await get(`https://wildriftcore.com/en/champions/${s}/counters/`, { tries: 5 }));
      const me = to(s); if (!me) { problems.push("eşleşme: tanınmayan slug " + s); continue; }
      for (const r in boards) MU[r][me] = boards[r].map(([o, e, wr, pr]) => [to(o) || o, e, wr, pr]).filter(x => slugMap[canon(x[0])] || to(x[0]));
      ok++;
      B.champSrc[me] = `/assets/champions/icons/${s}.webp`;
      await sleep(2500);
      try {
        const r = parseBuilds(await get(`https://wildriftcore.com/tr/champions/${s}/builds/`, { tries: 4 }));
        if (Object.keys(r.roles).length) { const old = (prevBuilds && prevBuilds.c && prevBuilds.c[me]) || {}; B.c[me] = { r: r.roles, sit: r.sit }; const sp = r.spells || old.sp, so = r.order || old.so; if (sp) B.c[me].sp = sp; if (so) B.c[me].so = so; Object.assign(B.src, r.icons); bOk++; }
        else problems.push("build: boş sayfa " + s);
      } catch (e) {
        problems.push("build " + s + ": " + e.message);
        if (prevBuilds && prevBuilds.c && prevBuilds.c[me]) B.c[me] = prevBuilds.c[me];
      }
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
  log("eşleşme", ok, "sayfa,", fail, "hata,", agree, "çift tutarlı; build", bOk, "şampiyon");
  if (bOk < ok * 0.85) { problems.push(`Build: ${ok} şampiyondan yalnızca ${bOk} okunabildi; eski build verisi korunuyor`); return { MU, B: null }; }
  return { MU, B };
}

/* ---------- 4. Yama notları ---------- */
const { parseNotes } = require("./notes.js");
async function updateNotes(patch, profiles, itemTr) {
  const slug = "wild-rift-patch-notes-" + patch.replace(".", "-");
  const url = `https://wildrift.leagueoflegends.com/tr-tr/news/game-updates/${slug}/`;
  const h = await get(url, { okMissing: true });
  if (!h) { log("yama notu bulunamadı:", url); return null; }
  const { ch, it } = parseNotes(nextData(h), profiles, itemTr);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  log("yama notu", patch, Object.keys(ch).length, "şampiyon,", Object.keys(it).length, "eşya");
  return { patch, url, title: strip(title), champs: Object.keys(ch), items: Object.keys(it).filter(k => it[k].known), ch, it };
}

/* ---------- 5. Simgeler ----------
 * Önce Wild Rift'in kendi oyun içi simgeleri (wildriftcore.com, yalnızca yerelden erişilebilir),
 * bulunamayanlar için Riot Data Dragon. Biçim: { item:{kebab:yol}, champ:{slug:yol}, rune:{ad:yol} }
 */
const ITEM_ALIAS = { "dominiks-regards": "lord-dominiks-regards", "staff-of-flowing-waters": "staff-of-flowing-water", "mercurys-treads": "mercury-boots" };
async function saveRaw(url, file, state) {
  const full = path.join(IMG, file);
  if (state.images[file] === url && fs.existsSync(full)) return "img/" + file;
  const buf = await get(url, { binary: true, tries: 3 });
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buf); state.images[file] = url;
  return "img/" + file;
}
function normIcons(prev) {
  if (prev && prev.item) return { item: { ...prev.item }, champ: { ...(prev.champ || {}) }, rune: { ...(prev.rune || {}) } };
  const item = {}; for (const en in prev || {}) item[kebab(en)] = prev[en]; // eski düz biçimden geçiş
  return { item, champ: {}, rune: {} };
}
async function updateWrIcons(B, itemEn, prev, state) {
  const icons = normIcons(prev);
  const W = "https://wildriftcore.com";
  const list = parseItemList(await get(W + "/en/items/"), "en");
  const want = {}; // kebab → kaynak
  for (const k in list) if (list[k].src) want[k] = list[k].src;
  for (const k in B.src) if (!k.startsWith("rune:")) want[k] ||= B.src[k].src;
  for (const en of itemEn) { const k = kebab(en), w = ITEM_ALIAS[k]; if (w && want[w]) want[k] = want[w]; }
  let n = 0;
  const jobs = [
    ...Object.entries(want).map(([k, src]) => [`wr/item/${k}.webp`, W + src, p => icons.item[k] = p]),
    ...Object.entries(B.champSrc).map(([slug, src]) => [`wr/champ/${slug}.webp`, W + src, p => icons.champ[slug] = p]),
    ...Object.entries(B.src).filter(([k]) => k.startsWith("rune:")).map(([k, v]) => [`wr/rune/${kebab(v.en)}.webp`, W + v.src, p => icons.rune[v.en] = p]),
  ];
  for (const [file, url, set] of jobs) {
    const had = state.images[file] === url;
    try { set(await saveRaw(url, file, state)); if (!had) { n++; await sleep(300); } }
    catch (e) { problems.push("simge " + file + ": " + e.message); }
  }
  log("WR simgeleri:", Object.keys(icons.item).length, "eşya,", Object.keys(icons.champ).length, "şampiyon,", Object.keys(icons.rune).length, "rün;", n, "yeni indirildi");
  return icons;
}
async function updateItemIcons(itemEn, prev) {
  const icons = normIcons(prev);
  const missing = itemEn.filter(n => { const p = icons.item[kebab(n)]; return !p || !fs.existsSync(path.join(ROOT, p)); });
  if (!missing.length) return icons;
  const ver = JSON.parse(await get("https://ddragon.leagueoflegends.com/api/versions.json"))[0];
  const dd = JSON.parse(await get(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/item.json`)).data;
  const byName = {}; for (const id in dd) if (!byName[dd[id].name] || dd[id].gold && dd[id].gold.purchasable) byName[dd[id].name] = id;
  const alias = { "Dominik's Regards": "Lord Dominik's Regards" };
  for (const n of missing) {
    const id = byName[alias[n] || n]; if (!id) continue;
    try {
      const buf = await get(`https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png`, { binary: true });
      const f = `img/item/${hash(n)}.png`;
      fs.mkdirSync(path.join(ROOT, "img/item"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, f), buf); icons.item[kebab(n)] = f;
    } catch (e) { problems.push("eşya simgesi " + n + ": " + e.message); }
  }
  log("eşya simgesi (Data Dragon yedeği)", Object.keys(icons.item).length);
  return icons;
}

/* ---------- 5b. En popüler çekirdek buildler (riftpatchnotes.com şampiyon sayfaları) ---------- */
const { parseCores } = require("./rpn.js");
async function updateCores(slugMap, prev) {
  const list = await get("https://www.riftpatchnotes.com/winrates");
  const rpn = [...new Set([...list.matchAll(/href="\/champion\/([a-z0-9-]+)"/g)].map(m => m[1]))];
  const out = { c: { ...((prev && prev.c) || {}) } }; let ok = 0, miss = 0;
  for (const r of rpn) {
    const slug = slugMap[canon(r)]; if (!slug) { miss++; continue; }
    try { const x = parseCores(await get(`https://www.riftpatchnotes.com/champion/${r}`, { tries: 3 })); if (Object.keys(x).length) { out.c[slug] = x; ok++; } }
    catch (e) { problems.push("çekirdek " + r + ": " + e.message); }
    await sleep(700);
  }
  if (ok < 80) throw new Error(`çekirdek build verisi eksik (${ok} şampiyon, ${miss} eşleşmedi)`);
  log("çekirdek buildler:", ok, "şampiyon");
  out.c = Object.fromEntries(Object.keys(out.c).sort().map(k => [k, out.c[k]]));
  return out;
}

/* ---------- 6. Wild Rift taban değerleri ve eşya sayıları (LoL Wiki, CC BY-SA) ---------- */
const { parseLua } = require("./lua.js");
async function wikiModule(title) {
  const j = JSON.parse(await get(`https://wiki.leagueoflegends.com/en-us/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=${encodeURIComponent(title)}`, { ua: "RiftKontraUpdater/1.0 (+https://github.com/servetskr/rift-kontra)" }));
  const p = Object.values(j.query.pages)[0];
  if (!p.revisions) throw new Error("wiki: " + title + " bulunamadı");
  return parseLua(p.revisions[0].slots.main["*"]);
}
const WIKI_MENU = { physical: "fiz", magical: "buy", defense: "sav", support: "des" };
async function updateWiki(slugMap) {
  const C = await wikiModule("Module:ChampionDataWR/data");
  const I = await wikiModule("Module:WRItemData/data");
  const champ = {}; wikiNames = {};
  for (const name in C) {
    const st = C[name].stats; const slug = slugMap[canon(name)]; if (!st || !slug) continue;
    wikiNames[slug] = name;
    champ[slug] = {
      hp: st.hp_base, hpL: st.hp_lvl, ar: st.arm_base, arL: st.arm_lvl, mr: st.mr_base, mrL: st.mr_lvl,
      ad: st.dam_base, adL: st.dam_lvl, as: st.as_base, asR: st.as_ratio || st.as_base, asL: st.as_lvl || 0,
      rng: st.range, ms: st.ms, t: C[name].adaptivetype === "Magic" ? "M" : "P",
      dmg: C[name].damage || 2, cls: (C[name].herotype || [])[0] || "",
    };
  }
  const item = {};
  for (const name in I) {
    const it = I[name]; if (!it || typeof it !== "object" || !it.stats) continue;
    const m = Object.keys(it.menu || {}).filter(k => it.menu[k] === true).map(k => WIKI_MENU[k]).filter(Boolean);
    if (it.modes && it.modes.classic_5v5 === false) continue; // yalnızca ARAM vb. modlarda
    const boot = Array.isArray(it.type) && it.type.includes("Boots");
    const o = { n: name, s: it.stats, m: boot ? ["bot"] : m, t: it.tier || 0, c: it.buy || 0 };
    // Birlikte alınamayan item grupları (ör. "Anti-armor", "Lifeline", "Active": yalnızca bir aktif item)
    const g = [it.itemlimit, it.itemlimit2].filter(x => typeof x === "string" && x).map(x => x.toLowerCase());
    if (g.length) o.g = g;
    if (typeof it.limit === "string" && /ranged/i.test(it.limit)) o.ro = 1; // yalnızca menzilli şampiyonlar
    item[kebab(name)] = o;
  }
  const nc = Object.keys(champ).length, ni = Object.keys(item).length;
  if (nc < 120 || ni < 120) throw new Error(`Wiki verisi eksik (${nc} şampiyon, ${ni} eşya)`);
  if (!champ.yasuo || !(champ.yasuo.hp > 400)) throw new Error("Wiki verisi bozuk görünüyor (Yasuo)");
  log("wiki:", nc, "şampiyon taban değeri,", ni, "eşya");
  return { champ, item };
}

/* ---------- 7. Yetenek hasarları (LoL Wiki "WR:<şampiyon>" sayfaları) ---------- */
const { parseAbilities } = require("./abilities.js");
let wikiNames = null;
async function updateAbilities(names, prev) {
  const out = {}; let ok = 0, fail = 0;
  for (const slug of Object.keys(names).sort()) {
    try {
      const j = JSON.parse(await get(`https://wiki.leagueoflegends.com/en-us/api.php?action=parse&format=json&prop=text&redirects=1&page=${encodeURIComponent("WR:" + names[slug])}`, { ua: "RiftKontraUpdater/1.0 (+https://github.com/servetskr/rift-kontra)", tries: 3 }));
      if (!j.parse) throw new Error("sayfa yok");
      const a = parseAbilities(j.parse.text["*"]);
      const dmg = Object.entries(a).filter(([k, x]) => k !== "i" && x.d && x.d.length).length;
      if (dmg) { out[slug] = Object.fromEntries(Object.entries(a).map(([k, v]) => { const o = {}; if (v.cd) o.cd = v.cd; if (v.d) o.d = v.d; if (v.sh) o.sh = v.sh; if (v.cc) o.cc = v.cc; if (v.hl) o.hl = v.hl; if (v.bf) o.bf = v.bf; for (const f of ["rg", "tg", "mv", "sl"]) if (v[f] != null) o[f] = v[f]; return [k, o]; })); ok++; }
      else { fail++; if (prev && prev[slug]) out[slug] = prev[slug]; }
    } catch (e) { fail++; problems.push("yetenek " + slug + ": " + e.message); if (prev && prev[slug]) out[slug] = prev[slug]; }
    await sleep(700);
  }
  if (ok < Object.keys(names).length * 0.8) throw new Error(`Yetenekler: yalnızca ${ok} şampiyon okunabildi`);
  log("yetenek hasarı:", ok, "şampiyon,", fail, "eksik");
  return out;
}

/* ---------- ana akış ---------- */
(async () => {
  fs.mkdirSync(DATA, { recursive: true });
  const state = readJSON(STATE_FILE, { images: {} });
  state.images ||= {};
  const prevStats = readGlobal("stats.js", "WR_STATS");
  const prevProfiles = readGlobal("profiles.js", "WR_PROFILES");
  const prevMU = readGlobal("matchups.js", "WR_MU");
  const prevBuilds = readGlobal("builds.js", "WR_BUILDS");
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

  let wrB = null;
  // 3. eşleşmeler + buildler: yama değiştiyse ya da 20 saatten eskiyse
  const muAge = prevMeta.matchupsAt ? (now - new Date(prevMeta.matchupsAt)) / 36e5 : 99;
  if (!args.has("--skip-matchups") && (!prevMU || patchChanged || muAge > 20 || args.has("--full"))) {
    try {
      const { MU: mu, B } = await updateMatchups(slugMap, prevMU, prevBuilds);
      writeGlobal("matchups.js", "WR_MU", mu, "Eşleşme puanları, kaynak: wildriftcore.com"); prevMeta.matchupsAt = now.toISOString(); prevMeta.matchupsPatch = patch;
      if (B) {
        wrB = B;
        // items.js'te olmayan eşyaların Türkçe adları
        const known = new Set((items || []).map(i => kebab(i[0])).flatMap(k => [k, ITEM_ALIAS[k]]));
        const trList = parseItemList(await get("https://wildriftcore.com/tr/items/"), "tr");
        const names = {}; for (const k in B.src) if (!k.startsWith("rune:") && !known.has(k)) names[k] = [B.src[k].en, (trList[k] && trList[k].n) || B.src[k].en];
        writeGlobal("builds.js", "WR_BUILDS", { patch, c: Object.fromEntries(Object.keys(B.c).sort().map(k => [k, B.c[k]])), names }, "Şampiyon buildleri (CN sunucu verisi), kaynak: wildriftcore.com");
        prevMeta.buildsAt = now.toISOString();
      }
    }
    catch (e) {
      if (e instanceof Blocked) log("ATLANDI:", e.message, "— eşleşmeler yerel çalıştırmayla güncellenir (scripts/yerel-guncelle.cmd)");
      else { failed = true; problems.push(e.message); }
    }
  }

  // 3a. en popüler 3 çekirdek build (kazanma/seçilme oranlı): yeni yamada ya da 20 saatte bir
  const coreAge = prevMeta.coresAt ? (now - new Date(prevMeta.coresAt)) / 36e5 : 99;
  if (!args.has("--skip-cores") && (patchChanged || coreAge > 20 || args.has("--full") || !fs.existsSync(path.join(DATA, "cores.js")))) {
    try { writeGlobal("cores.js", "WR_CORES", await updateCores(slugMap, readGlobal("cores.js", "WR_CORES")), "En popüler çekirdek buildler (Elmas+, CN), kaynak: riftpatchnotes.com"); prevMeta.coresAt = now.toISOString(); }
    catch (e) { problems.push("çekirdek buildler: " + e.message); }
  }

  // 3b. taban değerler + eşya sayıları: günde bir ya da yeni yamada
  const wikiAge = prevMeta.wikiAt ? (now - new Date(prevMeta.wikiAt)) / 36e5 : 99;
  const needAb = args.has("--abilities") || !fs.existsSync(path.join(DATA, "abilities.js")) || !prevMeta.abilitiesAt || (now - new Date(prevMeta.abilitiesAt)) / 864e5 > 7;
  if (patchChanged || wikiAge > 20 || needAb || args.has("--full") || !fs.existsSync(path.join(DATA, "wr.js"))) {
    try { writeGlobal("wr.js", "WR_DATA", await updateWiki(slugMap), "Wild Rift taban değerleri ve eşya sayıları, kaynak: wiki.leagueoflegends.com (CC BY-SA 4.0)"); prevMeta.wikiAt = now.toISOString(); }
    catch (e) { problems.push("wiki: " + e.message); }
  }

  // 3c. yetenek hasarları: yeni yamada, haftada bir ya da dosya yoksa
  const abAge = prevMeta.abilitiesAt ? (now - new Date(prevMeta.abilitiesAt)) / 864e5 : 99;
  if (wikiNames && (patchChanged || abAge > 7 || args.has("--full") || args.has("--abilities") || !fs.existsSync(path.join(DATA, "abilities.js")))) {
    try { writeGlobal("abilities.js", "WR_ABIL", await updateAbilities(wikiNames, readGlobal("abilities.js", "WR_ABIL")), "Yetenek hasarları, bekleme süreleri, kalkanlar ve kitle kontrolü, kaynak: wiki.leagueoflegends.com (CC BY-SA 4.0)"); prevMeta.abilitiesAt = now.toISOString(); }
    catch (e) { problems.push("yetenekler: " + e.message); }
  }

  // 4. yama notları
  let notes = prevMeta.notes || null;
  if (patch) { // tek istek; Riot notları sonradan düzeltebildiği için her çalışmada okunur
    try { const itemTr = {}; (items || []).forEach(i => itemTr[i[0]] = i[1]); notes = (await updateNotes(patch, profiles, itemTr)) || notes; }
    catch (e) { problems.push("yama notu: " + e.message); }
  }

  // 5. eşya simgeleri
  let icons = readGlobal("icons.js", "WR_ICONS");
  if (items) {
    if (wrB) { try { icons = await updateWrIcons(wrB, items.map(i => i[0]), icons, state); } catch (e) { problems.push("WR simgeleri: " + e.message); } }
    try { icons = await updateItemIcons(items.map(i => i[0]), icons); } catch (e) { problems.push("eşya simgeleri: " + e.message); }
    writeGlobal("icons.js", "WR_ICONS", icons, "Simgeler, kaynak: Wild Rift (wildriftcore.com), yedek: Riot Data Dragon");
  }

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
