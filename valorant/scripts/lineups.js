#!/usr/bin/env node
/*
 * Rift Kontra · VALORANT lineup güncelleyicisi (data/lineups.js'e EKLER, el yazımı kayıtlara dokunmaz)
 *
 * Her çalışmada:
 *   1. En az kaydı olan ajan × harita ikililerinden başlayarak en fazla --max kadar YouTube araması yapar
 *      (son aranma zamanı data/lineups-state.json'da; aynı ikili tekrar sıraya en sona girer).
 *   2. Başlığında ajan ve harita geçen, bölümlü rehber videolarının izleme sayfasından bölümleri ve
 *      YouTube'un bölüm karelerini alır; bölüm başlıklarından yalnız taraf, yetenek ve bölgesi kesin
 *      olanları kayda çevirir (scripts/lineup-parse.js). Bir videodan 3'ten az kayıt çıkarsa video atlanır.
 *   3. Her yeni video youtube.com/oembed ile doğrulanır (200 + başlıkta ajan ve harita).
 *   4. Tazelik: her çalışmada --verify kadar eski videoyu oembed ile yeniden dener; iki çalışma üst üste
 *      yok/gizli/gömülemez çıkan videonun v/t/im alanları kayıtlardan kaldırılır (kayıt metni kalır).
 *      --stills kadar bölüm karesini dener; imzası bozulanı izleme sayfasından yeniler, yoksa siler.
 *   5. Yazmadan önce tüm dosyayı doğrular (ajan, yetenek, bölge, video, tekrar); sorun varsa yazmaz.
 * YouTube engellerse, sınırlarsa ya da sayfa biçimi değişirse durumu yazar ve 0 koduyla çıkar; veri
 * dosyasına dokunmaz (o ana kadar doğrulanmış eklemeler dışında).
 *
 * Kullanım: node valorant/scripts/lineups.js [--force] [--dry] [--max 40] [--agents omen,harbor]
 *           [--maps abyss,bind] [--verify 20] [--stills 60] [--delay 2500] [--min-gap 20]
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const { BlockedError, search, watch, imPath, oembed, stillOk } = require("./yt.js");
const { parseChapters, VOCAB, DMG } = require("./lineup-parse.js");
const { nameOf, sfx, DOES, STAND, AIM, DENY, ABIL } = require("./lineup-text.js");

const ROOT = path.join(__dirname, ".."), DATA = path.join(ROOT, "data");
const FILE = path.join(DATA, "lineups.js"), STATE_FILE = path.join(DATA, "lineups-state.json");
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : true); };
const OPT = {
  force: !!arg("force", false), dry: !!arg("dry", false), max: +arg("max", 40), verify: +arg("verify", 20), stills: +arg("stills", 60),
  delay: +arg("delay", 2500), minGap: +arg("min-gap", 20),
  agents: arg("agents", "") ? String(arg("agents")).split(",") : null, maps: arg("maps", "") ? String(arg("maps")).split(",") : null,
};
const log = (...a) => console.log("[lineup]", ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms + Math.random() * ms * 0.4));
const now = () => new Date().toISOString();
const q = s => JSON.stringify(s);
const ROLE_WORD = a => /^(killjoy|cypher|deadlock|vyse|chamber|sage|veto)$/.test(a) ? "setups lineups" : /^(omen|astra|clove|harbor|brimstone)$/.test(a) ? (a === "brimstone" ? "lineups" : "smokes lineups") : "lineups";
const BAD_TITLE = /montage|reaction|ranked game|\bpov\b|gameplay|\bvs\b|pearl harbor|[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđơư]/i;
const IM_OK = /^hqdefault_\d+\.jpg\?sqp=[\w=+\/-]+&rs=[\w-]+$/;

function loadJS(file, key) { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(file, "utf8"), ctx, { filename: file, timeout: 5000 }); return ctx.window[key]; }
function loadState() { try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { return { v: 1, searched: {}, verified: {}, gone: {}, stillIdx: 0, runs: [] }; } }
const ageMo = s => { const m = /(\d+)\s*(year|month|week|day|hour|y|mo|w|d|h)/.exec(s || ""); if (!m) return 0; const n = +m[1]; return /^y/.test(m[2]) ? n * 12 : /^mo|^month/.test(m[2]) ? n : /^w/.test(m[2]) ? n / 4 : 0; };
const durS = s => s ? String(s).split(":").map(Number).reduce((a, b) => a * 60 + b, 0) : 0;
const agentNames = (G, a) => a === "kayo" ? ["kay/o", "kayo", "kay o"] : [G.agents[a].n.toLowerCase()];
const dkey = e => [e.ag, e.ab, e.map, e.side, e.from || "", e.to].join("|");

/* ---------- doğrulama: hata listesi döner ---------- */
function validate(G, LU) {
  const err = [], reg = (m, s) => !s || s.split("~").every(p => G.maps[m].cl.some(c => c.k === p.split("@")[0]));
  if (!LU || !Array.isArray(LU.list)) return ["liste yok"];
  const vids = LU.vids || {};
  LU.list.forEach((e, i) => {
    const w = `#${i} ${e.title}`;
    if (!G.maps[e.map] || !G.maps[e.map].cl) err.push(w + ": harita"); else if (!["to", "from", "look"].every(f => reg(e.map, e[f]))) err.push(w + ": bölge");
    if (!G.agents[e.ag] || !G.agents[e.ag].ab.some(a => a.k === e.ab)) err.push(w + ": ajan/yetenek");
    if (!["atk", "def"].includes(e.side) || !["lineup", "setup", "smoke"].includes(e.type)) err.push(w + ": taraf/tür");
    if (!e.title || !e.does) err.push(w + ": metin");
    if (e.v && !vids[e.v]) err.push(w + ": video vids'te yok");
    if (e.t != null && !(Number.isInteger(e.t) && e.t >= 0)) err.push(w + ": t");
    if (e.im && (!e.v || !IM_OK.test(e.im))) err.push(w + ": im");
  });
  for (const [k, id] of Object.entries(LU.vid || {})) if (!vids[id]) err.push(`vid ${k}: video vids'te yok`);
  return err;
}

/* ---------- kayıt metni ---------- */
function buildEntry(G, r, abN) {
  const key = r.ag + ":" + r.ab, to = nameOf(G, r.map, r.to), fr = r.from ? nameOf(G, r.map, r.from) : null;
  const fill = s => s.replace(/\{to(?::(\w+))?\}/g, (_, c) => c ? sfx(to, c) : to);
  const D = DOES[key]; if (!D) return null;
  const site = / Site$/.test(r.to), deny = r.side === "def" && DMG.has(key) && site && !r.retake;
  let title, does;
  if (r.type === "smoke") { title = `${to} dumanı`; does = fill(D[0]); }
  else if (r.pp) { title = `Plant sonrası ${fr ? sfx(fr, "abl") + " " : ""}${sfx(to, "dat")} ${abN}`; does = fill(D[0]); }
  else if (r.gadget) { title = `${sfx(to, "loc")}ki tuzakları kıran ${abN}`; does = fill(D[1] || D[0]); }
  else if (deny) { title = `${fr ? sfx(fr, "abl") + " " : ""}${to} kurulumunu engelleyen ${abN}`; does = key === "sova:Q" ? fill(D[2]) : DENY; }
  else {
    title = r.retake && site && !fr ? `${sfx(to, "acc")} geri almak için ${abN}` : fr ? `${sfx(fr, "abl")} ${sfx(to, "dat")} ${abN}` : `${sfx(to, "dat")} ${abN}`;
    const alt = DMG.has(key) ? 1 : r.side === "def" ? 1 : 0; does = fill(D[alt] || D[0]);
  }
  const e = { ag: r.ag, ab: r.ab, map: r.map, side: r.side, type: r.type };
  if (r.from) e.from = r.from; e.to = r.to;
  Object.assign(e, { title, stand: STAND[r.type], aim: fill(AIM[r.type]), does, v: r.v, t: r.t });
  if (r.im) e.im = r.im;
  return e;
}
function entryText(e) {
  const a = ["ag", "ab", "map", "side", "type", "from", "to", "look"].filter(k => e[k] != null).map(k => `${k}: ${q(e[k])}`).join(", ");
  const rest = ["stand", "aim", "how", "does"].filter(k => e[k]).map(k => `      ${k}: ${q(e[k])}`).join(",\n");
  return `    { ${a}, title: ${q(e.title)},\n${rest},\n      v: ${q(e.v)}${e.t != null ? `, t: ${e.t}` : ""}${e.im ? `,\n      im: ${q(e.im)}` : ""} },`;
}

/* ---------- dosya yamaları (metin düzeyinde; el yazımı biçim ve yorumlar korunur) ---------- */
function entrySpans(body, n) {
  const ls = body.indexOf("\n  list: ["), le = body.lastIndexOf("  ],\n};"); const pos = []; let p = ls;
  while ((p = body.indexOf("{ ag:", p + 1)) > 0 && p < le) pos.push(p);
  if (pos.length !== n) throw new Error(`kayıt sayısı tutmuyor (${pos.length}/${n})`);
  return pos.map((s, i) => [s, pos[i + 1] || le]);
}
function insertInBlock(body, head, lines) {
  if (!lines.length) return body;
  const i = body.indexOf(`\n  ${head}: {`); if (i < 0) throw new Error(head + " bloğu yok");
  const end = body.indexOf("\n  },", i); return body.slice(0, end) + "\n" + lines.join("\n") + body.slice(end);
}

async function main() {
  const t0 = Date.now(), state = loadState();
  state.searched ||= {}; state.verified ||= {}; state.gone ||= {}; state.runs ||= [];
  if (!OPT.force && state.lastRun && Date.now() - Date.parse(state.lastRun) < OPT.minGap * 3600e3) {
    log(`son çalışma ${state.lastRun}; ${OPT.minGap} saat dolmadı, atlandı (--force ile zorla)`); return;
  }
  const G = loadJS(path.join(DATA, "game.js"), "VAL_GAME");
  const raw = fs.readFileSync(FILE, "utf8"), CRLF = raw.includes("\r\n"); let body = raw.replace(/\r\n/g, "\n");
  const LU = loadJS(FILE, "VAL_LINEUPS");
  const pre = validate(G, LU);
  if (pre.length) { log("UYARI: mevcut veri doğrulanmadı, hiçbir şey yazılmayacak:", pre.slice(0, 5).join(" · ")); return; }
  const before = LU.list.length;
  const keys = new Set(LU.list.map(dkey)), usedVid = new Set(Object.keys(LU.vids || {}));
  const report = { date: now(), queries: 0, added: 0, videos: 0, removed: 0, stills: 0, blocked: null };

  /* 1) Arama sırası: en az kaydı olan ikili önce, aynı sayıda en eski aranan önce */
  const ags = Object.keys(VOCAB).filter(a => G.agents[a] && (!OPT.agents || OPT.agents.includes(a)));
  const maps = Object.keys(G.maps).filter(m => G.maps[m].mm && G.maps[m].cl && (!OPT.maps || OPT.maps.includes(m)));
  const cnt = {}; LU.list.forEach(e => { const k = e.ag + ":" + e.map; cnt[k] = (cnt[k] || 0) + 1; });
  const pairs = ags.flatMap(a => maps.map(m => a + ":" + m))
    .sort((x, y) => (cnt[x] || 0) - (cnt[y] || 0) || String(state.searched[x] || "").localeCompare(String(state.searched[y] || "")))
    .slice(0, OPT.max);

  const added = [], newVids = {}, newVid = {};
  let blocks = 0;
  for (const pair of pairs) {
    if (blocks >= 2) break;
    const [a, m] = pair.split(":"), an = agentNames(G, a), mn = G.maps[m].n.toLowerCase();
    let res;
    try { res = await search(`${G.agents[a].n} ${G.maps[m].n} ${ROLE_WORD(a)}`); blocks = 0; report.queries++; }
    catch (e) { if (e instanceof BlockedError) { blocks++; report.blocked = e.message; log("arama engellendi:", e.message); await sleep(OPT.delay * 4); continue; } throw e; }
    state.searched[pair] = now();
    const cands = res.filter(v => { const t = v.title.toLowerCase(); return !usedVid.has(v.id) && !newVids[v.id] && an.some(x => t.includes(x)) && t.includes(mn) && !BAD_TITLE.test(v.title) && durS(v.dur) >= 60 && ageMo(v.ago) <= 30 && v.chap.length >= 3; })
      .sort((x, y) => y.chap.length - x.chap.length).slice(0, 2);
    if (!cands.length) log(`${pair}: uygun bölümlü video yok (${res.length} sonuç)`);
    for (const v of cands) {
      await sleep(OPT.delay);
      let chap;
      try { chap = await watch(v.id); } catch (e) {
        if (!(e instanceof BlockedError)) throw e;
        if (e.kind === "format") { log(`${pair}: ${v.id} izleme sayfası okunamadı, atlandı`); continue; } // tek videoya özgü
        blocks++; report.blocked = e.message; log("izleme sayfası engellendi:", e.message); break; }
      // en az 3 bölüm çözülemiyorsa videonun biçimi anlaşılmamıştır: hiç kullanma
      const parsed = parseChapters(G, a, m, v.title, chap.map(c => [c[0], c[1]]));
      if (parsed.length < 3) { log(`${pair}: ${v.id} bölümleri çözülemedi (${parsed.length}), atlandı`); continue; }
      const rows = parsed.filter(r => { const k = dkey(r); if (keys.has(k)) return false; keys.add(k); return true; });
      if (!rows.length) { log(`${pair}: ${v.id} yeni kayıt getirmedi (hepsi zaten var)`); continue; }
      const oe = await oembed(v.id);
      const ot = oe && oe.ok ? oe.title.toLowerCase() : "";
      if (!oe || !oe.ok || !an.some(x => ot.includes(x)) || !ot.includes(mn)) { rows.forEach(r => keys.delete(dkey(r))); log("video doğrulanamadı, atlandı:", v.id); continue; }
      const abName = k => (G.agents[a].ab.find(x => x.k === k) || {}).n;
      let n = 0;
      for (const r of rows.slice(0, 25)) {
        if (!LU.abil[a + ":" + r.ab] && !ABIL[a + ":" + r.ab]) { keys.delete(dkey(r)); continue; }
        const c = chap.find(x => x[0] === r.t); r.v = v.id; r.im = c ? imPath(c[2]) : null;
        const e = buildEntry(G, r, abName(r.ab)); if (!e) { keys.delete(dkey(r)); continue; }
        added.push(e); n++;
      }
      if (n) { newVids[v.id] = [oe.title, oe.author]; if (!(LU.vid || {})[pair] && !newVid[pair]) newVid[pair] = v.id; report.videos++; log(`${pair}: ${v.id} → ${n} kayıt`); }
    }
    await sleep(OPT.delay);
  }

  /* 2) Tazelik: eski videoları yeniden doğrula */
  const allIds = Object.keys(LU.vids || {}).sort((x, y) => String(state.verified[x] || "").localeCompare(String(state.verified[y] || ""))).slice(0, OPT.verify);
  const drop = new Set();
  for (const id of allIds) {
    const r = await oembed(id); await sleep(300);
    if (!r) continue;                                   // geçici hata: dokunma
    if (r.ok) { state.verified[id] = now(); delete state.gone[id]; continue; }
    state.gone[id] = (state.gone[id] || 0) + 1;         // iki çalışma üst üste yoksa kaldır
    if (state.gone[id] >= 2) drop.add(id);
  }
  /* Bölüm kareleri: sırayla bir dilim dene, bozulanı yenile */
  const withIm = LU.list.map((e, i) => [e, i]).filter(([e]) => e.im && !drop.has(e.v));
  const imFix = new Map(); const refetched = {};
  if (withIm.length && OPT.stills > 0) {
    let idx = (state.stillIdx || 0) % withIm.length;
    for (let k = 0; k < Math.min(OPT.stills, withIm.length); k++, idx = (idx + 1) % withIm.length) {
      const [e, i] = withIm[idx]; const ok = await stillOk(e.v, e.im);
      if (ok !== false) continue;
      if (!(e.v in refetched)) { try { refetched[e.v] = await watch(e.v); await sleep(OPT.delay); } catch (er) { if (!(er instanceof BlockedError)) throw er; if (er.kind === "format") { refetched[e.v] = null; continue; } report.blocked = er.message; break; } }
      if (!refetched[e.v]) continue;
      const c = (refetched[e.v] || []).find(x => x[0] === e.t); const np = c ? imPath(c[2]) : null;
      imFix.set(i, np && np !== e.im ? np : null);
    }
    state.stillIdx = idx;
  }

  /* 3) Yeni dosya metni */
  if (!added.length && !drop.size && !imFix.size) { log("değişiklik yok"); return finish(state, report, t0); }
  const spans = entrySpans(body, before);
  for (let i = before - 1; i >= 0; i--) {
    const e = LU.list[i]; const [s, end] = spans[i]; let seg = body.slice(s, end);
    if (e.v && drop.has(e.v)) { seg = seg.replace(/,\n\s+v: "[\w-]{11}"(, t: \d+)?/, "").replace(/,\n\s+im: "[^"]*"/, ""); report.removed++; }
    else if (imFix.has(i)) { const np = imFix.get(i); seg = np ? seg.replace(/im: "[^"]*"/, `im: ${q(np)}`) : seg.replace(/,\n\s+im: "[^"]*"/, ""); report.stills++; }
    body = body.slice(0, s) + seg + body.slice(end);
  }
  for (const id of drop) {
    body = body.replace(new RegExp(`\\n    ${q(id).replace(/[-]/g, "\\-")}: \\[.*\\],`), "");
    body = body.replace(new RegExp(`\\n    "[a-z]+:[a-z]+": ${q(id).replace(/[-]/g, "\\-")},`, "g"), "");
  }
  body = insertInBlock(body, "vids", Object.entries(newVids).map(([k, v]) => `    ${q(k)}: ${q(v)},`));
  body = insertInBlock(body, "vid", Object.entries(newVid).map(([k, v]) => `    ${q(k)}: ${q(v)},`));
  const needAb = [...new Set(added.map(e => e.ag + ":" + e.ab))].filter(k => !LU.abil[k] && ABIL[k]);
  body = insertInBlock(body, "abil", needAb.map(k => `    ${q(k)}: { en: ${q(ABIL[k].en)}, how: ${q(ABIL[k].how)} },`));
  if (added.length) {
    const li = body.lastIndexOf("  ],\n};");
    body = body.slice(0, li) + `    /* ---- otomatik ekleme ${now().slice(0, 10)} (scripts/lineups.js) ---- */\n` + added.map(entryText).join("\n") + "\n" + body.slice(li);
  }

  /* 4) Doğrula; eski kayıtlar aynı sırada duruyor mu, tekrar var mı */
  let NL; try { const ctx = { window: {} }; vm.runInNewContext(body, ctx, { timeout: 5000 }); NL = ctx.window.VAL_LINEUPS; } catch (e) { log("yeni dosya çalışmadı, yazılmadı:", e.message); return finish(state, report, t0); }
  const errs = validate(G, NL);
  const kept = NL.list.length === before + added.length && LU.list.every((e, i) => NL.list[i].title === e.title && NL.list[i].ag === e.ag && NL.list[i].map === e.map);
  if (errs.length || !kept) { log("doğrulama başarısız, yazılmadı:", errs.slice(0, 5).join(" · ") || "eski kayıtlar korunmadı"); return finish(state, report, t0); }
  report.added = added.length;
  if (OPT.dry) { log(`--dry: ${added.length} kayıt, ${Object.keys(newVids).length} video eklenecekti; yazılmadı`); added.slice(0, 15).forEach(e => log("  ", e.map, e.side, e.title)); return; }
  // önce geçici dosyaya yaz, sonra yerine taşı: yarıda kesilirse (zaman aşımı) eski dosya bozulmaz
  fs.writeFileSync(FILE + ".tmp", CRLF ? body.replace(/\n/g, "\r\n") : body); fs.renameSync(FILE + ".tmp", FILE);
  log(`yazıldı: ${before} → ${NL.list.length} kayıt (+${added.length}), ${Object.keys(newVids).length} yeni video, ${report.removed} video kaldırıldı, ${report.stills} kare yenilendi`);
  finish(state, report, t0);
}
function finish(state, report, t0) {
  if (OPT.dry) return;
  // engellendiyse ve hiçbir şey değişmediyse durum dosyasına da dokunma; bir sonraki zamanlı çalışma yeniden dener
  if (report.blocked && !report.queries) { log(`YouTube engelledi (${report.blocked}); veri ve durum değişmedi`); return; }
  report.sec = Math.round((Date.now() - t0) / 1000);
  state.lastRun = now(); state.runs = [report, ...(state.runs || [])].slice(0, 20);
  fs.writeFileSync(STATE_FILE + ".tmp", JSON.stringify(state, null, 1) + "\n"); fs.renameSync(STATE_FILE + ".tmp", STATE_FILE);
  log(`bitti: ${report.queries} arama, ${report.added} kayıt, ${report.sec} sn${report.blocked ? `, engel: ${report.blocked}` : ""}`);
}

main().catch(e => { console.log(`::warning::VALORANT lineup güncelleyicisi hata verdi, veri değişmedi: ${e && e.stack || e}`); process.exitCode = 0; });
