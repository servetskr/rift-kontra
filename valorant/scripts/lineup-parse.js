/*
 * Video bölüm başlıklarından lineup adayı çıkarır. Yalnız açık biçimler kabul edilir:
 *   "[Atk Recon] A Lobby to A Site"   "ZERO/point: A Main to A Site"   "B Default from B Lobby"
 *   "DEF A Main"   "Attack" / "Defender Lineups" gibi bölüm başlıkları tarafı belirler.
 * Taraf, yetenek ya da bölge kesin değilse bölüm atlanır (uydurma yok).
 */
"use strict";

/* Ajan → { kelime düzeni: yetenek tuşu } (oyundaki tuşlar; Deadlock/Phoenix düzeltmesi dahil) */
const VOCAB = {
  sova: [[/recon|reveal|arrow|scan/, "E"], [/shock|dart/, "Q"]],
  brimstone: [[/molly|mollies|incendiary/, "Q"], [/smoke/, "E"]],
  viper: [[/molly|mollies|snake ?bite/, "C"], [/orb|poison cloud|one[- ]?way/, "Q"], [/wall|toxic screen/, "E"]],
  kayo: [[/knife|zero/, "E"], [/flash/, "Q"], [/molly|mollies|frag/, "C"]],
  fade: [[/haunt|eye|reveal/, "E"], [/seize|tether/, "Q"]],
  gekko: [[/mosh|molly|mollies/, "C"]],
  killjoy: [[/nano|molly|mollies|swarm/, "C"], [/turret/, "E"], [/alarm/, "Q"]],
  cypher: [[/trip|trap/, "C"], [/cam(era)?s?\b/, "E"], [/cage/, "Q"]],
  deadlock: [[/sensor|sonic/, "Q"], [/barrier|mesh|wall/, "E"], [/grav ?net|gravnet/, "C"]],
  vyse: [[/thorn|razorvine|vine/, "C"], [/shear|wall/, "Q"], [/arc rose|flash/, "E"]],
  chamber: [[/trademark|trap/, "C"]],
  sage: [[/wall|barrier/, "C"], [/slow/, "Q"]],
  omen: [[/smoke|one[- ]?way/, "E"], [/paranoia/, "Q"]],
  astra: [[/smoke|nebula/, "E"], [/nova|stun/, "Q"], [/gravity|pull/, "C"]],
  clove: [[/smoke|one[- ]?way/, "E"]],
  harbor: [[/cove|bubble|smoke/, "E"], [/high tide|wave|wall/, "Q"], [/storm surge|surge/, "C"]],
  breach: [[/fault|stun/, "E"], [/aftershock/, "C"]],
  tejo: [[/drone/, "C"], [/salvo|missile|molly|mollies/, "E"], [/special delivery|stun/, "Q"]],
  veto: [[/chokehold|trip|trap/, "Q"]],
  phoenix: [[/molly|mollies|hot hands/, "E"]],
  skye: [[/dog|trailblazer|tiger/, "Q"]],
};
/* Bölümde yetenek sözcüğü yoksa video başlığına göre varsayılan */
function defaultAb(ag, vtitle) {
  const t = vtitle.toLowerCase();
  if (ag === "sova" && !/shock|dart/.test(t)) return "E";
  if (ag === "brimstone" && /molly|mollies|lineup/.test(t) && !/smoke/.test(t)) return "Q";
  if (ag === "fade" && /lineup/.test(t)) return "E";
  if (ag === "gekko" && /mosh|post.?plant|molly/.test(t)) return "C";
  if (ag === "phoenix" && /molly|lineup/.test(t)) return "E";
  if (ag === "killjoy" && /nano|molly|post.?plant/.test(t)) return "C";
  return null;
}
const SETUP = new Set(["cypher:C", "cypher:E", "cypher:Q", "killjoy:Q", "killjoy:E", "killjoy:C", "deadlock:Q", "deadlock:E", "vyse:Q", "vyse:C", "chamber:C", "sage:C", "veto:Q"]);
const SMOKE = new Set(["omen:E", "astra:E", "clove:E", "brimstone:E", "harbor:E"]);
const DMG = new Set(["brimstone:Q", "viper:C", "kayo:C", "gekko:C", "killjoy:C", "sova:Q", "phoenix:E", "breach:C", "tejo:E", "vyse:C"]);
const PURE_MOLLY = new Set(["brimstone:Q", "viper:C", "kayo:C", "gekko:C", "phoenix:E"]);

/* Bölüm başlığı taraf sözcüğü taşıyorsa taraf o bölümden itibaren geçerlidir */
const ATK = /\b(att|atk|attack|attacking|attacker|attackers|offen[cs]e|saldırı)\b|攻め/;
const DEF = /\b(def|defen[cs]e|defending|defender|defenders|defensive|defencive|savunma)\b|守り/;
/* Yalnız o bölüm için: geri alma savunma, plant sonrası saldırıdır */
const ONE_DEF = /\bretakes?\b/, ONE_ATK = /post.?plant|afterplant|after plant/;
const SKIP = /\b(intro|outro|subscribe|patreon|sponsor|discord|thank|giriş|kapanış|ult|ults|ultimate|montage|gameplay|example|tips?|explained|why|how to|bonus|clips?|summary|overview|pistol|eco|playstyle|positioning|strategy|strategies|rotat)/;

/* Bölge çözücü (harita başına) */
const ALIAS = {
  ascent: { "a heaven": "A Rafters", heaven: "A Rafters", market: "Mid Market", "b market": "Mid Market", cat: "Mid Catwalk", catwalk: "Mid Catwalk", "mid link": "Mid Link", cubby: "Mid Cubby", pizza: "Mid Pizza", courtyard: "Mid Courtyard", "boat house": "B Boat House", boathouse: "B Boat House" },
  bind: { showers: "A Bath", shower: "A Bath", "a showers": "A Bath", hookah: "B Window", "b hookah": "B Window", "a heaven": "A Tower", heaven: "A Tower", lamps: "A Lamps", "b long": "B Long", "b short": "B Short", garden: "B Garden", elbow: "B Elbow", fountain: "B Fountain", "a short": "A Short" },
  haven: { "a short": "A Sewer", short: "A Sewer", sewer: "A Sewer", sewers: "A Sewer", "a main": "A Long", "a long": "A Long", "c main": "C Long", "c long": "C Long", "a heaven": "A Tower", heaven: "A Tower", garage: "C Garage", "mid window": "Mid Window", "b back": "B Back", "b backsite": "B Back", "c window": "C Window", "c link": "C Link", "a link": "A Link", "a garden": "A Garden", "c lobby": "C Lobby", "a lobby": "A Lobby" },
  split: { "a heaven": "A Rafters", "b heaven": "B Rafters", "b main": "B Garage", "a ramp": "A Ramps", ramp: "A Ramps", ramps: "A Ramps", screens: "A Screens", "a screens": "A Screens", vents: "Mid Vent", vent: "Mid Vent", mail: "Mid Mail", "b ct": "B Back", "a back": "A Back", "b back": "B Back", "b alley": "B Alley", "b lobby": "B Lobby", "a lobby": "A Lobby" },
  lotus: { "a heaven": "A Top", "a top": "A Top", root: "A Root", rubble: "A Rubble", "a tree": "A Tree", tree: "A Tree", mound: "C Mound", waterfall: "C Waterfall", "c water": "C Waterfall", "c halls": "C Hall", "c hall": "C Hall", "b pillars": "B Pillars", pillars: "B Pillars", "b upper": "B Upper", "c gravel": "C Gravel", "c bend": "C Bend", "a drop": "A Drop", "a door": "A Door" },
  sunset: { market: "B Market", "b market": "B Market", boba: "B Boba", "a elbow": "A Elbow", elbow: "A Elbow", tiles: "Mid Tiles", "a alley": "A Alley", "a link": "A Link", "b lobby": "B Lobby", "a lobby": "A Lobby", courtyard: "Mid Courtyard" },
  breeze: { pyramids: "A Pyramids", "a bridge": "A Bridge", shop: "A Shop", "a shop": "A Shop", "b window": "B Window", tunnel: "B Tunnel", "b tunnel": "B Tunnel", nest: "Mid Nest", "mid nest": "Mid Nest", "b nest": "Mid Nest", "ct arches": "Defender Side Arches", arches: "Defender Side Arches", cannon: "Mid Cannon", "mid cannon": "Mid Cannon", "mid doors": "Mid Wood Doors", "wood doors": "Mid Wood Doors", "b elbow": "B Elbow", "mid pillar": "Mid Pillar", "a ramp": "A Ramp" },
  icebox: { "a main": "A Belt", belt: "A Belt", "a belt": "A Belt", "b main": "B Yellow", yellow: "B Yellow", "b yellow": "B Yellow", kitchen: "B Kitchen", hut: "B Hut", "b hut": "B Hut", boiler: "Mid Boiler", "mid boiler": "Mid Boiler", "a heaven": "A Rafters", "a rafters": "A Rafters", "a screen": "A Screen", "a screens": "A Screen", "a nest": "A Nest", "a pipes": "A Pipes", pipes: "A Pipes", "b garage": "B Garage", garage: "B Garage", "b green": "B Green", green: "B Green", "b snowman": "B Snowman", snowman: "B Snowman", "b back": "B Back", "b orange": "B Orange", "mid pallet": "Mid Pallet", pallet: "Mid Pallet" },
  pearl: { "b long": "B Main", art: "A Art", "a art": "A Art", flowers: "A Flowers", "a flowers": "A Flowers", dugout: "A Dugout", "a dugout": "A Dugout", secret: "A Secret", "a secret": "A Secret", restaurant: "A Restaurant", connector: "Mid Connector", "mid connector": "Mid Connector", shops: "Mid Shops", "mid shops": "Mid Shops", plaza: "Mid Plaza", "mid doors": "Mid Doors", "b tower": "B Tower", "b tunnel": "B Tunnel", "b ramp": "B Ramp", club: "B Club", "b hall": "B Hall", "b halls": "B Hall", "b screen": "B Screen", "b screens": "B Screen", "b link": "B Link", "a link": "A Link", "a main": "A Main", "b main": "B Main" },
  fracture: { dish: "A Dish", "a dish": "A Dish", "a drop": "A Drop", drop: "A Drop", rope: "A Rope", ropes: "A Rope", "a rope": "A Rope", "a ropes": "A Rope", gate: "A Gate", "a gate": "A Gate", "a hall": "A Hall", "a door": "A Door", arcade: "B Arcade", "b arcade": "B Arcade", bench: "B Bench", "b bench": "B Bench", canteen: "B Canteen", generator: "B Generator", "b generator": "B Generator", "b tower": "B Tower", "b tree": "B Tree", tree: "B Tree", "b tunnel": "B Tunnel", "b main": "B Main", "a main": "A Main", "a link": "A Link", "b link": "B Link" },
  abyss: { library: "Mid Library", catwalk: "Mid Catwalk", "mid catwalk": "Mid Catwalk", bend: "Mid Bend", "mid bend": "Mid Bend", "a security": "A Security", security: "A Security", "a vent": "A Vent", "a secret": "A Secret", "a bridge": "A Bridge", "b danger": "B Danger", danger: "B Danger", "b nest": "B Nest", "a tower": "A Tower", "b tower": "B Tower" },
  corrode: { crane: "A Crane", "a crane": "A Crane", yard: "A Yard", "a yard": "A Yard", pocket: "A Pocket", "a pocket": "A Pocket", "b arch": "B Arch", arch: "B Arch", stairs: "Mid Stairs", "mid stairs": "Mid Stairs", "mid window": "Mid Window", "b tower": "B Tower", "a elbow": "A Elbow", "b elbow": "B Elbow" },
  summit: { art: "A Art", "a art": "A Art", cave: "A Cave", "a cave": "A Cave", "a garden": "A Garden", garden: "A Garden", "a hall": "A Hall", gym: "B Gym", "b gym": "B Gym", trophy: "B Trophy", "b trophy": "B Trophy", "b drop": "B Drop", fountain: "Mid Fountain", "mid fountain": "Mid Fountain", tiles: "Mid Tiles", "mid tiles": "Mid Tiles", "mid bend": "Mid Bend", "mid window": "Mid Window", "b tower": "B Tower" },
};
const NOISE = new Set(("reveal recon arrow arrows bolt shock dart darts molly mollies lineup lineups flash flashes knife smoke smokes wall walls orb one way oneway god simple fast best insane info early retake support plant post postplant afterplant easy deep close high push hold the from to for with and setup setups trap traps trip trips tripwire tripwires cam cams camera cameras cage cages turret alarm alarmbot nano swarm haunt eye tether seize thorn thorns stun drone entry execute denial deny defuse prevention combo sneaky broken op quick hidden great amazing new crazy solo self peek pop variations variation version v1 v2 v3 alt alternative 2nd 3rd fake fakes lurk gadget destruction cypher killjoy sentinel utility round main? on in of at is a b c site? default? recon? jump crosshair unblockable slow pseudo boxes box").split(" ").filter(w => !/\?$/.test(w)));

function resolver(G, m) {
  const cl = G.maps[m].cl, keys = cl.map(c => c.k), names = new Map();
  const add = (n, k) => { n = n.toLowerCase(); if (names.has(n) && names.get(n) !== k) names.set(n, null); else names.set(n, k); };
  for (const k of keys) {
    add(k, k);
    const mm = /^([ABC]) Site$/.exec(k);
    if (mm) { const L = mm[1].toLowerCase(); for (const s of ["site", "default", "site default", "default plant", "open", "open plant", "backsite", "back site", "site back", "corner", "safe", "plant", "center", "center plant", "side plant", "box", "dice", "under"]) add(`${L} ${s}`, k); add(`site ${L}`, k); add(`${L} retake`, k); }
    if (k === "Mid Top") add("top mid", k); if (k === "Mid Bottom") add("bottom mid", k);
    if (k === "Defender Side Spawn") for (const s of ["ct", "ct spawn", "defender spawn", "def spawn", "cts", "defenders spawn"]) add(s, k);
    if (k === "Attacker Side Spawn") for (const s of ["t spawn", "attacker spawn", "attack spawn", "attackers spawn", "attack side spawns", "t-spawn"]) add(s, k);
  }
  // site harfi olmadan benzersiz tek sözcük (ör. "garden")
  const tail = {}; for (const k of keys) { const w = k.replace(/^(A|B|C|Mid|Attacker Side|Defender Side) /, "").toLowerCase(); (tail[w] ||= []).push(k); }
  for (const [w, ks] of Object.entries(tail)) if (ks.length === 1 && !/^(site|spawn)$/.test(w)) add(w, ks[0]);
  for (const [n, k] of Object.entries(ALIAS[m] || {})) if (keys.includes(k)) names.set(n, k);
  const list = [...names.entries()].filter(([, k]) => k).sort((a, b) => b[0].length - a[0].length);
  return function resolve(phrase) {
    if (!phrase) return null;
    let p = phrase.toLowerCase().replace(/\(.*?\)/g, " ").replace(/["“”'’*!#]/g, " ").replace(/\bno\.?\s*\d+\b/g, " ").replace(/\b\d+(st|nd|rd|th)?\b/g, " ");
    p = p.split(/[\/&+|,]| or /)[0].replace(/[^a-z\- ]/g, " ").replace(/\b([abc])-(?=[a-z])/g, "$1 ").replace(/\s+/g, " ").trim();
    if (!p) return null;
    const words = ` ${p} `;
    for (const [n, k] of list) {
      if (!words.includes(` ${n} `)) continue;
      const rest = words.replace(` ${n} `, " ").trim().split(" ").filter(w => w && !NOISE.has(w));
      if (rest.length > 2) return null;
      // ifadedeki bölge harfi (a/b/c) anahtarınkiyle aynı olmalı ("A Main" asla "B Main" olmasın)
      const L = /(?:^| )([abc])(?= )/.exec(` ${p} `), KL = /^([ABC]) /.exec(k);
      if (L && KL && L[1] !== KL[1].toLowerCase()) return null;
      if (L && !KL && !/^(Mid|Attacker|Defender)/.test(k)) return null;
      return k;
    }
    return null;
  };
}

/* Bir videonun bölümlerinden adaylar: [{ab, side, type, from, to, t, pp, gadget}] */
function parseChapters(G, ag, m, vtitle, chap) {
  const voc = VOCAB[ag]; if (!voc || !G.agents[ag]) return [];
  const has = k => G.agents[ag].ab.some(a => a.k === k);
  const resolve = resolver(G, m), out = [];
  let side = null, ab = null, prefixed = false;
  const defAb = defaultAb(ag, vtitle);
  for (const [t, raw] of chap) {
    const s = String(raw).toLowerCase();
    const sAtk = ATK.test(s), sDef = DEF.test(s);
    if (sAtk && !sDef) side = "atk"; else if (sDef && !sAtk) side = "def";
    // "ZERO/point: …" gibi önek yetenek bölümü açar
    const pre = /^([^:]{2,30}):/.exec(s);
    let a = null, ai = 1e9; for (const [re, k] of voc) { const mm = re.exec(s); if (mm && mm.index < ai) { a = k; ai = mm.index; } } // ilk geçen yetenek
    if (pre && a) { ab = a; prefixed = true; }
    if (SKIP.test(s)) continue;
    const ability = a || (prefixed ? ab : defAb);
    if (!ability || !has(ability)) continue;
    // hedef ve durma yeri
    const body = raw.replace(/^\s*\[[^\]]*\]\s*/, "").replace(/^[^:]{2,30}:\s*/, "").replace(/^(att|atk|def|attack|defense|defence)\b[\s\-–:]*/i, "");
    let to = null, from = null, mt;
    if ((mt = /^(.+?)\s+to\s+(.+)$/i.exec(body))) { from = mt[1]; to = mt[2]; }
    else if ((mt = /^(.+?)\s+from\s+(.+)$/i.exec(body))) { to = mt[1]; from = mt[2]; }
    else if ((mt = /^(.+?)\s+-\s+(.+)$/.exec(body)) && resolve(mt[1]) && resolve(mt[2])) { from = mt[1]; to = mt[2]; }
    else to = body;
    const T = resolve(to); if (!T) continue;
    let F = null; if (from) { F = resolve(from); if (!F) continue; }
    if (F === T) F = null;
    const key = ag + ":" + ability;
    let sd = side;
    if (ONE_ATK.test(s)) sd = "atk"; else if (ONE_DEF.test(s) && !sAtk) sd = "def";
    if (/\((defencive|defensive)\)/.test(s)) sd = "def";
    if (!sd && PURE_MOLLY.has(key) && / Site$/.test(T) && /default|plant|open|safe|corner|backsite|back|under|box|dice|center|pocket|heaven/.test(s)) sd = "atk";
    // başlığı plant sonrası molotof videosu olan videoda taraf yazmayan site hedefleri saldırıdır
    if (!sd && PURE_MOLLY.has(key) && / Site$/.test(T) && /post.?plant|molly|mollies|mosh/i.test(vtitle)) sd = "atk";
    if (!sd) continue;
    const site = / Site$/.test(T);
    const gadget = key === "sova:Q" && /trip|trap|cypher|gadget|destruct|alarm|killjoy|sentinel|cam/.test(s);
    const pp = sd === "atk" && DMG.has(key) && site && !gadget && (PURE_MOLLY.has(key) || /default|plant|post|after|open|safe|corner|backsite|dice|box|center/.test(s));
    const type = SMOKE.has(key) ? "smoke" : SETUP.has(key) && sd === "def" ? "setup" : "lineup";
    out.push({ ag, ab: ability, map: m, side: sd, type, from: F, to: T, t, pp, gadget, retake: /retake/.test(s) });
  }
  return out;
}

module.exports = { VOCAB, parseChapters, resolver, SETUP, SMOKE, DMG };
