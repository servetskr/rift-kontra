/* Rift Kontra uygulama kodu */
"use strict";
const P = window.WR_PROFILES || {};

/* ===== KÜRATÖR VERİSİ =====
 ad|koridorlar|arketip|hasar|etiketler|ona karşı iyi olanlar|onun iyi olduğu rakipler|ipucu */
const CHAMP_RAW = window.WR_CURATED || "";


/* ===== EŞYALAR =====  ingilizceAd|türkçeAd|fiyat|kategori|özellikler|etki */

/* ===== ARKETİPLER ===== */
const ARCH = {
  crit_adc:{lbl:"Kritik nişancı",rune:"Ölümcül Tempo",boots:"Berserker's Greaves",core:["Yun Tal Wildarrows","Infinity Edge","Phantom Dancer"],late:["Bloodthirster","Guardian Angel","Mortal Reminder"]},
  onhit_adc:{lbl:"İsabet nişancısı",rune:"Ölümcül Tempo",boots:"Berserker's Greaves",core:["Blade of the Ruined King","Guinsoo's Rageblade","Kraken Slayer"],late:["Wit's End","Terminus","Guardian Angel"]},
  lethal_adc:{lbl:"Uzun menzilli nişancı",rune:"Ayağı Çabuk",boots:"Boots of Dynamism",core:["The Collector","Infinity Edge","Rapid Firecannon"],late:["Mortal Reminder","Guardian Angel","Bloodthirster"]},
  caster_adc:{lbl:"Yetenekli nişancı",rune:"Yenilmez",boots:"Ionian Boots of Lucidity",core:["Manamune","Trinity Force","Serylda's Grudge"],late:["Black Cleaver","Navori Quickblades","Guardian Angel"]},
  ad_assassin:{lbl:"Fiziksel suikastçı",rune:"Elektrik Ver",boots:"Boots of Dynamism",core:["Youmuu's Ghostblade","Duskblade of Draktharr","Serylda's Grudge"],late:["Edge of Night","The Collector","Guardian Angel"]},
  bruiser:{lbl:"Dövüşçü",rune:"Yenilmez",boots:"Plated Steelcaps",core:["Black Cleaver","Sterak's Gage","Death's Dance"],late:["Guardian Angel","Spear of Shojin","Force of Nature"]},
  juggernaut:{lbl:"Ağır dövüşçü",rune:"Yenilmez",boots:"Plated Steelcaps",core:["Sundered Sky","Sterak's Gage","Dead Man's Plate"],late:["Force of Nature","Randuin's Omen","Death's Dance"]},
  skirmisher:{lbl:"Düellocu",rune:"Yenilmez",boots:"Plated Steelcaps",core:["Trinity Force","Blade of the Ruined King","Sterak's Gage"],late:["Death's Dance","Guardian Angel","Wit's End"]},
  crit_melee:{lbl:"Kritik yakın dövüşçü",rune:"Ölümcül Tempo",boots:"Berserker's Greaves",core:["Infinity Edge","Navori Quickblades","Immortal Shieldbow"],late:["Death's Dance","Guardian Angel","Bloodthirster"]},
  tank:{lbl:"Tank",rune:"Hortlağın Pençesi",boots:"Plated Steelcaps",core:["Sunfire Aegis","Heartsteel","Force of Nature"],late:["Randuin's Omen","Thornmail","Kaenic Rookern","Gargoyle Stoneplate"]},
  tank_jg:{lbl:"Tank ormancı",rune:"Hortlağın Pençesi",boots:"Plated Steelcaps",core:["Sunfire Aegis","Dead Man's Plate","Force of Nature"],late:["Thornmail","Randuin's Omen","Gargoyle Stoneplate"]},
  ap_tank:{lbl:"Büyü tankı",rune:"Hortlağın Pençesi",boots:"Mercury's Treads",core:["Hextech Rocketbelt","Riftmaker","Force of Nature"],late:["Zhonya's Hourglass","Abyssal Mask","Kaenic Rookern"]},
  mage_burst:{lbl:"Ani hasar büyücüsü",rune:"Elektrik Ver",boots:"Boots of Mana",core:["Luden's Echo","Stormsurge","Rabadon's Deathcap"],late:["Void Staff","Zhonya's Hourglass","Banshee's Veil"]},
  mage_control:{lbl:"Kontrol büyücüsü",rune:"Sihirli Yıldız",boots:"Boots of Mana",core:["Blackfire Torch","Malignance","Rabadon's Deathcap"],late:["Void Staff","Zhonya's Hourglass","Cryptbloom"]},
  mage_battle:{lbl:"Savaş büyücüsü",rune:"Sürat Coşkusu",boots:"Mercury's Treads",core:["Riftmaker","Liandry's Torment","Rabadon's Deathcap"],late:["Zhonya's Hourglass","Void Staff","Bloodletter's Curse"]},
  ap_assassin:{lbl:"Büyü suikastçısı",rune:"Elektrik Ver",boots:"Boots of Mana",core:["Hextech Rocketbelt","Lich Bane","Rabadon's Deathcap"],late:["Zhonya's Hourglass","Void Staff","Banshee's Veil"]},
  ap_onhit:{lbl:"Saldırı odaklı büyücü",rune:"Ölümcül Tempo",boots:"Berserker's Greaves",core:["Nashor's Tooth","Guinsoo's Rageblade","Rabadon's Deathcap"],late:["Void Staff","Zhonya's Hourglass","Wit's End"]},
  enchanter:{lbl:"Koruyucu destek",rune:"Aery",boots:"Ionian Boots of Lucidity",start:"Black Mist Scythe",core:["Ardent Censer","Staff of Flowing Waters","Redemption"],late:["Mikael's Blessing","Echoes of Helia","Locket of the Iron Solari"]},
  tank_sup:{lbl:"Tank destek",rune:"Muhafız",boots:"Mercury's Treads",start:"Bulwark of the Mountain",core:["Locket of the Iron Solari","Zeke's Convergence","Knight's Vow"],late:["Radiant Virtue","Abyssal Mask","Dawnshroud","Gargoyle Stoneplate"]},
  mage_sup:{lbl:"Büyücü destek",rune:"Sihirli Yıldız",boots:"Boots of Mana",start:"Black Mist Scythe",core:["Imperial Mandate","Liandry's Torment","Horizon Focus"],late:["Zhonya's Hourglass","Rylai's Crystal Scepter","Morellonomicon"]},
};
const OVERRIDE = {
  "Darius":["Stridebreaker","Sterak's Gage","Dead Man's Plate"],"Lucian":["Essence Reaver","Navori Quickblades","Infinity Edge"],"Smolder":["Essence Reaver","Navori Quickblades","Infinity Edge"],
  "Vayne":["Blade of the Ruined King","Guinsoo's Rageblade","Wit's End"],"Teemo":["Liandry's Torment","Nashor's Tooth","Rabadon's Deathcap"],"Gwen":["Riftmaker","Nashor's Tooth","Rabadon's Deathcap"],
  "Kai'Sa":["Yun Tal Wildarrows","Guinsoo's Rageblade","Nashor's Tooth"],"Pyke":["Youmuu's Ghostblade","Edge of Night","Serylda's Grudge"],"Senna":["Youmuu's Ghostblade","The Collector","Serpent's Fang"],
  "Rammus":["Thornmail","Sunfire Aegis","Force of Nature"],"Graves":["Youmuu's Ghostblade","The Collector","Serylda's Grudge"],"Viego":["Blade of the Ruined King","Kraken Slayer","Sterak's Gage"],
  "Master Yi":["Blade of the Ruined King","Guinsoo's Rageblade","Wit's End"],"Kayle":["Nashor's Tooth","Guinsoo's Rageblade","Rabadon's Deathcap"],"Vladimir":["Riftmaker","Rod of Ages","Rabadon's Deathcap"],
  "Swain":["Liandry's Torment","Rylai's Crystal Scepter","Riftmaker"],"Lillia":["Liandry's Torment","Riftmaker","Rylai's Crystal Scepter"],"Rumble":["Liandry's Torment","Riftmaker","Rylai's Crystal Scepter"],
  "Kog'Maw":["Blade of the Ruined King","Guinsoo's Rageblade","Wit's End"],"Twitch":["Yun Tal Wildarrows","Infinity Edge","Runaan's Hurricane"],"Malphite":["Sunfire Aegis","Frozen Heart","Thornmail"],
  "Amumu":["Sunfire Aegis","Liandry's Torment","Force of Nature"],"Nunu & Willump":["Sunfire Aegis","Liandry's Torment","Force of Nature"],"Singed":["Rod of Ages","Riftmaker","Force of Nature"],
  "Nilah":["Yun Tal Wildarrows","Infinity Edge","Bloodthirster"],"Zoe":["Luden's Echo","Stormsurge","Rabadon's Deathcap"],
};
const SPELLS = {top:"Sıçra + Tutuştur",jg:"Çarp + Sıçra",mid:"Sıçra + Tutuştur",adc:"Sıçra + Şifa",sup:"Sıçra + Bitkinlik"};
const ROLE = {top:"Baron",jg:"Orman",mid:"Orta",adc:"Ejderha",sup:"Destek"};
const ROLE_LONG = {top:"Baron koridoru",jg:"Orman",mid:"Orta koridor",adc:"Ejderha koridoru",sup:"Destek"};
const DMG = {AD:"Fiziksel hasar",AP:"Büyü hasarı",mixed:"Karma hasar"};
const CAT = {fiz:"Fiziksel",buy:"Büyü",sav:"Savunma",des:"Destek",bot:"Çizmeler"};
const CLS_TR = {"NİŞANCI":"Nişancı","SUİKASTÇI":"Suikastçı","BÜYÜCÜ":"Büyücü","DÖVÜŞÇÜ":"Dövüşçü","TANK":"Tank","DESTEK":"Destek"};

/* ===== AYRIŞTIRMA ===== */
const key = s => (s||"").toLocaleLowerCase("tr").replace(/ı/g,"i").replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]/g,"");
const slugOf = n => n.toLowerCase().replace(/&/g,"and").replace(/['.]/g,"").trim().replace(/\s+/g,"-");
const META = window.WR_META || {};
const STATS = (window.WR_STATS || {}).rows || {};
const ICON = window.WR_ICONS || {};
const MU = window.WR_MU || {top:{},jg:{},mid:{},adc:{},sup:{}};
const canon = s => (s||"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]/g,"").replace(/and(?=willump)/,"");
const tierOf = wr => wr==null ? "?" : wr>=52.5?"S":wr>=51?"A":wr>=49.5?"B":wr>=48?"C":"D";
const titleTR = s => s.toLocaleLowerCase("tr").replace(/(^|[\s.'-])(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase("tr")).replace(/\bIv\b/,"IV");
const CLS_ARCH = {"NİŞANCI":"crit_adc","BÜYÜCÜ":"mage_burst","SUİKASTÇI":"ad_assassin","DÖVÜŞÇÜ":"bruiser","TANK":"tank","DESTEK":"enchanter"};
/* Elle yazılmış şampiyon notları (arketip, etiketler, ipucu) */
const CUR = {};
CHAMP_RAW.trim().split("\n").filter(Boolean).forEach(line=>{
  const [name,roles,arch,dmg,tags,,,tip] = line.split("|");
  CUR[slugOf(name)] = {name,roles:roles.split(","),arch,dmg,tags:tags?tags.split(","):[],tip};
});
/* Şampiyon listesi: resmi sitedeki her şampiyon; yeni gelenler notları olmadan da görünür */
const CH = {}, LIST = [], BYSLUG = {};
new Set([...Object.keys(P),...Object.keys(CUR)]).forEach(slug=>{
  const cur=CUR[slug], pr=P[slug]||null; if(!cur&&!pr) return;
  const rs = STATS[canon(slug)] || {};
  const statRoles = Object.keys(rs).filter(r=>ROLE[r]).sort((a,b)=>rs[b][1]-rs[a][1]);
  const boardR = Object.keys(ROLE).filter(r=>MU[r]&&MU[r][slug]);
  const main = statRoles[0] || (cur&&cur.roles[0]) || boardR[0] || "mid";
  let arch = cur ? cur.arch : (CLS_ARCH[(pr.cls||[])[0]] || "bruiser");
  if(!cur){ if(arch==="tank"&&main==="jg")arch="tank_jg"; if(arch==="tank"&&main==="sup")arch="tank_sup"; if(arch==="mage_burst"&&main==="sup")arch="mage_sup"; }
  const name = cur ? cur.name : titleTR(pr.n);
  const roles = [...new Set([main, ...statRoles.filter(r=>rs[r][1]>=1), ...(cur?cur.roles:boardR)])];
  const c = {
    name, slug, prof:pr, arch, roles, main, rs,
    disp: name==="Nunu & Willump" ? "Nunu ve Willump" : name,
    dmg: cur ? cur.dmg : (/mage|^ap_|enchanter/.test(arch)?"AP":"AD"),
    tags: cur ? cur.tags : [],
    tip: cur ? cur.tip : "Bu şampiyon sisteme otomatik eklendi; yazılı oynanış ipucu henüz yok. Yetenekleri ve eşleşmeleri aşağıda.",
    isNew: !cur,
  };
  const m = rs[main]; c.wr = m?m[0]:null; c.pr = m?m[1]:null; c.br = m?m[2]:null; c.tier = tierOf(c.wr);
  CH[key(name)] = c; BYSLUG[slug] = c; LIST.push(c);
});
LIST.sort((a,b)=>a.disp.localeCompare(b.disp,"tr"));
/* Simgeler: Wild Rift oyun içi simgeleri (yoksa Data Dragon yedeği) */
const kb = s => (s||"").toLowerCase().replace(/'/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const ICO_ITEM = ICON.item || Object.fromEntries(Object.entries(ICON).map(([k,v])=>[kb(k),v]));
const ICO_CHAMP = ICON.champ || {}, ICO_RUNE = ICON.rune || {};
const ITEM_ALIAS = {"lord-dominiks-regards":"dominiks-regards","staff-of-flowing-water":"staff-of-flowing-waters","mercury-boots":"mercurys-treads"};
const WB = window.WR_BUILDS || {}, BUILDS = WB.c || {};
const IT = {}, ILIST = [], SLUG2EN = {};
(window.WR_ITEMS||[]).forEach(([en,tr,cost,cat,st,fx])=>{const k=kb(en);const i={en,tr,cost,cat,st,fx,icon:ICO_ITEM[k]||null};IT[en]=i;ILIST.push(i);SLUG2EN[k]=en;});
Object.entries(ITEM_ALIAS).forEach(([w,k])=>{ if(SLUG2EN[k]){ SLUG2EN[w]=SLUG2EN[k]; if(ICO_ITEM[w]) IT[SLUG2EN[k]].icon=ICO_ITEM[w]; } });
// Buildlerde geçen ama elle bakılan listede olmayan eşyalar
Object.entries(WB.names||{}).forEach(([k,[en,tr]])=>{ if(SLUG2EN[k]) return; SLUG2EN[k]=en; if(!IT[en]) IT[en]={en,tr,cost:0,cat:"",st:"",fx:"",icon:ICO_ITEM[k]||null}; });
// En çok kazanan buildlerde geçen ama listede olmayan itemlar (ör. Muramana gibi yükseltmeler): wiki adı ve oyun içi simgesiyle
{ const wi=(window.WR_DATA||{}).item||{}, CATM={fiz:"fiz",buy:"buy",sav:"sav",des:"des",bot:"bot"};
  Object.values((window.WR_CORES||{}).c||{}).forEach(R=>Object.values(R).forEach(x=>[...x.c.flatMap(c=>c[0]),...(x.b||[]).map(b=>b[0])].forEach(k=>{
    if(SLUG2EN[k]||!wi[k]) return; const en=wi[k].n; SLUG2EN[k]=en; if(IT[en]) return;
    const i={en,tr:en,cost:wi[k].c||0,cat:CATM[(wi[k].m||[])[0]]||"",st:"",fx:wi[k].t>=4?"Görev tamamlanınca dönüşen yükseltilmiş item.":"",icon:ICO_ITEM[k]||null}; IT[en]=i; ILIST.push(i); }))); }
const itemOf = slug => SLUG2EN[slug] || slug;
/* Yama değişiklikleri: v = buff | nerf | adj | rework | new */
const NOTES = META.notes || {}, CHG = NOTES.ch || {}, ICHG = NOTES.it || {};
const CHANGED_ITEMS = new Set(NOTES.it ? Object.keys(ICHG).filter(k=>IT[k]) : (NOTES.items||[]));
const VMARK = {buff:["▲","Güçlendirildi"],nerf:["▼","Zayıflatıldı"],adj:["⇅","Dengelendi"],rework:["⟳","Yeniden tasarlandı"],new:["★","Yeni şampiyon"]};
const chgBadge = v => v&&VMARK[v] ? `<i class="chg" data-v="${v}" title="${VMARK[v][1]}" aria-label="${VMARK[v][1]}">${VMARK[v][0]}</i>` : "";
const iname = en => IT[en] ? IT[en].tr : en;

/* Eşleşme tahtası: MU[koridor][şampiyon] = [[rakip, puan, rakibinKO, rakibinSO]]; puan>0 => rakip bu şampiyona karşı avantajlı */
const RWR = {};
Object.keys(MU).forEach(r=>{RWR[r]={};Object.values(MU[r]).forEach(rows=>rows.forEach(x=>{if(x[2]!=null)RWR[r][x[0]]=[x[2],x[3]]}))});
const roleWR = (c,r) => c.rs[r] ? c.rs[r][0] : (RWR[r]&&RWR[r][c.slug]) ? RWR[r][c.slug][0] : null;
const boardRoles = c => Object.keys(ROLE).filter(r=>MU[r]&&MU[r][c.slug]);
/* me, en karşısında: >0 me avantajlı */
function edge(me,en,role){
  const a=MU[role]&&MU[role][en.slug]; if(a){const x=a.find(r=>r[0]===me.slug); if(x) return x[1];}
  const b=MU[role]&&MU[role][me.slug]; if(b){const x=b.find(r=>r[0]===en.slug); if(x) return -x[1];}
  return null;
}
const EDGE_TXT = e => e>=2?["good","Sert kontra"]:e===1?["good","Avantajlı"]:e===0?["even","Dengeli"]:e===-1?["bad","Dezavantajlı"]:["bad","Kaçın"];
const sgn = e => e>0?"+"+e:e<0?"−"+(-e):"±0";
function findChamp(v){const k=key(v);if(!k)return null;return CH[k]||LIST.find(c=>key(c.disp).startsWith(k)||key(c.name).startsWith(k))||null}

/* ===== UI YARDIMCILARI ===== */
const $ = s=>document.querySelector(s);
const esc = s=>String(s==null?"":s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const pct = v => v==null ? "–" : "%"+v.toFixed(1).replace(".",",");
function por(c,cls,noMark){
  const src = ICO_CHAMP[c.slug] || (c.prof && c.prof.p);
  const img = src ? `<img src="${src}" alt="" loading="lazy">` : `<span class="ini">${esc(c.disp.slice(0,2))}</span>`;
  return `<span class="por${cls?" "+cls:""}${ICO_CHAMP[c.slug]?" wr":""}">${img}${noMark?"":chgBadge(CHG[c.slug]&&CHG[c.slug].v)}</span>`;
}
const tierB = c => `<span class="tier" data-t="${c.tier}" title="Kademe ${c.tier}">${c.tier}</span>`;
const roleB = r => `<span class="role" data-r="${r}">${ROLE[r]}</span>`;
const icoImg = (en,cls) => { const i=IT[en]; return i&&i.icon ? `<img class="${cls||"ico"}" src="${i.icon}" alt="" loading="lazy">` : ""; };
/* Büyük eşya kutusu: simge + küçük ad, değiştiyse işaret */
const itile = (en,n) => { const i=IT[en]; return `<button type="button" class="itile" data-item="${esc(en)}" title="${esc(iname(en))}">${n?`<span class="n">${n}</span>`:""}<span class="ib">${i&&i.icon?`<img src="${i.icon}" alt="" loading="lazy">`:`<span class="ini">${esc(iname(en).slice(0,2))}</span>`}${chgBadge(ICHG[en]&&ICHG[en].v)}</span><span class="nm">${esc(iname(en))}</span></button>`; };
function itm(en,n){const i=IT[en];return `<button type="button" class="itm" data-item="${esc(en)}" title="${i?esc(i.st+" — "+i.fx):""}">${n?`<span class="n">${n}</span>`:""}${icoImg(en)}${esc(iname(en))}</button>`}
const champBtnAttrs = c => `data-go="s-${c.slug}"`;

/* Şampiyon seçici */
const ov = $("#ov"); let pickerCb=null, pickerRole="all";
function openPicker(title,cb,role){
  pickerCb=cb; pickerRole=role||"all";
  ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><h3>${esc(title)}</h3><button class="btn" type="button" data-close>Kapat</button></div>
    <div class="toolbar"><div class="seg" id="pk-roles">${[["all","Tümü"],...Object.entries(ROLE)].map(([k,v])=>`<button type="button" data-r="${k}" aria-pressed="${k===pickerRole}">${v}</button>`).join("")}</div>
    <input id="pk-q" type="search" placeholder="İsimle ara" aria-label="Şampiyon ara"></div>
    <div class="pgrid" id="pk-grid"></div></div>`;
  ov.hidden=false; drawPicker(); setTimeout(()=>{const q=$("#pk-q");if(q)q.focus()},30);
  $("#pk-q").addEventListener("input",drawPicker);
  $("#pk-roles").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;pickerRole=b.dataset.r;[...$("#pk-roles").children].forEach(x=>x.setAttribute("aria-pressed",x===b));drawPicker()});
}
function drawPicker(){
  const q=key($("#pk-q").value);
  const rows=LIST.filter(c=>(pickerRole==="all"||c.roles.includes(pickerRole))&&(!q||key(c.disp).includes(q)||key(c.name).includes(q)));
  $("#pk-grid").innerHTML = rows.map(c=>`<button class="pbtn" type="button" data-pick="${esc(c.name)}">${por(c)}<span>${esc(c.disp)}</span></button>`).join("")||'<div class="empty">Bulunamadı.</div>';
}
ov.addEventListener("click",e=>{
  if(e.target===ov||e.target.closest("[data-close]")){ov.hidden=true;return}
  const p=e.target.closest("[data-pick]"); if(p){ov.hidden=true; pickerCb&&pickerCb(CH[key(p.dataset.pick)]);}
});
ov.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="pk-q"){const f=ov.querySelector("[data-pick]");if(f)f.click()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)ov.hidden=true});

function slotHTML(c,ph){
  return c ? `${por(c,"sm")}<span style="min-width:0"><span class="nm">${esc(c.disp)}</span><span class="sub">${c.roles.map(r=>ROLE[r]).join(" · ")} · değiştir</span></span>`
           : `<span class="por sm"><span class="ini">+</span></span><span><span class="nm">${esc(ph)}</span><span class="sub">Seçmek için dokun</span></span>`;
}

/* Genel tıklama: profile git, item göster */
document.addEventListener("click",e=>{
  const g=e.target.closest("main [data-go]"); if(g){location.hash=g.dataset.go;return}
  const ch=e.target.closest("[data-chg]"); if(ch){showChange(ch.dataset.chg);return}
  const it=e.target.closest("main [data-item], .sheet [data-item]"); if(it){showItem(it.dataset.item)}
});
/* Yama değişikliği satırı: "Ad: eski → yeni" → işaretli, sade gösterim */
const SLOT_S = {"PASİF":"P","1":"1","2":"2","3":"3","ULTİ":"U"};
function lineHTML([t,d]){
  const ci=t.indexOf(":"), name=ci>0?t.slice(0,ci):"", rest=ci>0?t.slice(ci+1):t, ar=rest.split("→");
  const sym=d>0?"▲":d<0?"▼":"⇅", cls=d>0?"good":d<0?"bad":"even";
  const val = ar.length===2 ? `<span class="old">${esc(ar[0].trim())}</span><span class="to">→</span><b class="new">${esc(ar[1].trim())}</b>` : esc(rest.trim());
  return `<li class="ln ${cls}"><i>${sym}</i><span>${name?`<span class="lk">${esc(name)}</span> `:""}${val}</span></li>`;
}
function changeBody(ch){
  if(!ch) return "";
  if(ch.v==="new"&&!ch.c.length) return '<p class="muted small" style="margin:0">Bu yamada oyuna eklendi.</p>';
  return `<div class="chparts">${ch.c.map(([name,slot,icon,lines])=>`<div class="chp">
      <span class="chico">${icon?`<img src="${icon}" alt="" loading="lazy">`:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`}${slot?`<span class="sk">${esc(SLOT_S[slot]||slot)}</span>`:""}</span>
      <div style="min-width:0"><div class="chn">${esc(name?titleTR(name):"Temel değerler")}</div><ul class="lns">${lines.map(lineHTML).join("")}</ul></div></div>`).join("")}</div>
    ${ch.s?`<details class="why"><summary>Riot neden değiştirdi?</summary><p>${esc(ch.s)}</p></details>`:""}`;
}
const vPill = v => VMARK[v] ? `<span class="vpill" data-v="${v}">${VMARK[v][0]} ${VMARK[v][1]}</span>` : "";
function showChange(slug){
  const c=BYSLUG[slug], ch=CHG[slug]; if(!c||!ch) return;
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(c.disp)} değişiklikleri" style="width:min(560px,100%)">
    <div class="sheet-head">${por(c,"sm",true)}<div style="min-width:0;flex:1"><h3 style="margin:0">${esc(c.disp)}</h3>${vPill(ch.v)}</div><button class="btn" type="button" data-close aria-label="Kapat">✕</button></div>
    ${changeBody(ch)}
    <div class="row"><a class="btn gold" href="#s-${c.slug}" data-close>Profili aç</a><span class="muted small">Yama ${esc(NOTES.patch||"")}</span></div></div>`;
  ov.hidden=false; ov.querySelector("[data-close]").focus();
}

function buildHTML(c){
  const a=ARCH[c.arch], core=OVERRIDE[c.name]||a.core;
  return `<div class="build">
    ${a.start?`<div class="brow"><span class="l">Başlangıç</span><div class="items">${itm(a.start)}</div></div>`:""}
    <div class="brow"><span class="l">Çekirdek</span><div class="items">${core.map((n,i)=>itm(n,i+1)).join('<span class="arrow">›</span>')}</div></div>
    <div class="brow"><span class="l">Çizme</span><div class="items">${itm(a.boots)}</div></div>
    <div class="brow"><span class="l">Geç oyun</span><div class="items">${a.late.map(n=>itm(n)).join("")}</div></div>
    <div class="brow"><span class="l">Ana rün</span><div class="items"><span class="chip" style="color:var(--fg)">${esc(a.rune)}</span></div></div>
    <div class="brow"><span class="l">Büyüler</span><div class="items"><span class="chip" style="color:var(--fg)">${esc(SPELLS[c.main])}</span></div></div>
  </div>`;
}
const fmtDate = iso => { try { return new Date(iso).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}); } catch { return iso; } };
function howToBeat(c){
  const tips=[];
  const br=boardRoles(c), r0=br.includes(c.main)?c.main:br[0];
  const cs=r0?(MU[r0][c.slug]||[]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>BYSLUG[x[0]]).filter(Boolean).map(x=>x.disp):[];
  if(cs.length) tips.push(`${ROLE_LONG[r0]} için en sert kontraları: <b>${esc(cs.join(", "))}</b>.`);
  if(c.tags.includes("heal")) tips.push(`Kendini iyileştirir. Erkenden ağır yara al: nişancıysan ${iname("Mortal Reminder")}, büyücüysen ${iname("Morellonomicon")}, dövüşçüysen ${iname("Chempunk Chainsword")}, tanksan ${iname("Thornmail")}.`);
  if(c.tags.includes("shield")) tips.push(`Kalkan kullanır. ${iname("Serpent's Fang")} ya da ${iname("Oceanid's Trident")} kalkanını küçültür.`);
  if(c.tags.includes("dash")) tips.push("Atılma yetenekleri var. Atılmayı harcamasını bekle, sonra sabitleme yeteneğini kullan.");
  if(c.tags.includes("stealth")) tips.push("Görünmez olabilir. Kontrol totemi taşı, çalılara dikkat et.");
  if(c.tags.includes("poke")) tips.push("Uzaktan dürtür. Minyonların arkasında dur, can yenileme al ve yakına girdiğinde üstüne çık.");
  if(c.tags.includes("burst")) tips.push(`Ani hasarla öldürür. ${iname("Zhonya's Hourglass")}, ${iname("Guardian Angel")} ya da ${iname("Edge of Night")} hayat kurtarır.`);
  if(c.tags.includes("engage")||c.tags.includes("cc")) tips.push(`Kitle kontrolü güçlü. ${iname("Mercury's Treads")} etki direnci verir; aynı anda birden çok kişi toplu durmayın.`);
  if(c.tags.includes("tank")||/tank/.test(c.arch)) tips.push(`Dayanıklı. Yüzde hasar ve delme al: ${iname("Blade of the Ruined King")}, ${iname("Void Staff")}, ${iname("Black Cleaver")}.`);
  if(c.tags.includes("true")) tips.push("Gerçek hasar verir; zırh ve büyü direnci onu tam durdurmaz, uzun dövüşten kaçın.");
  if(c.wr!=null&&c.wr<49) tips.push(`Bu yamada zayıf (${pct(c.wr)} kazanma oranı).`);
  return `<ul class="howto" style="margin:0;padding-left:18px">${tips.map(t=>`<li>${t}</li>`).join("")}</ul>`;
}

/* ===================================================================
 *  SİMGELER — tek çizgi stili, emoji yok
 * =================================================================== */
const SV = {
  sword:'<path d="M14.5 3.5 20 3l-.5 5.5L9 19l-4-4z"/><path d="m5 15-2 2 4 4 2-2M13 7l4 4"/>',
  shield:'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
  bolt:'<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  wall:'<path d="M4 6h16v12H4zM4 12h16M9 6v6M15 12v6"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="m9 13 6 4"/>',
  wind:'<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>',
  spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  boot:'<path d="M7 3h5v8l6 3c1.5.7 2 2 2 3v2H4v-4l3-2z"/>',
  rune:'<path d="m12 3 7 9-7 9-7-9z"/><path d="m12 8 3 4-3 4-3-4z"/>',
  swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><path d="M16 5a3 3 0 0 1 0 6M18 14.5c1.8.7 3 2.6 3 5"/>',
  grid:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  scroll:'<path d="M7 4h11v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h11v1a3 3 0 0 0 3 3"/><path d="M7 4a2 2 0 0 0-2 2v10M10 8h5M10 12h5"/>',
  duel:'<path d="M5 3 15 13M3 5l2-2M13 15l-2 2 6 6 2-2zM19 3 9 13M21 5l-2-2M11 15l2 2-6 6-2-2z"/>',
  search:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  wand:'<path d="m4 20 11-11M14 4v3M19 9h-3M17.5 5.5l-2 2M18 14v2M20 15h-4"/>',
  play:'<path d="M7 4v16l13-8z"/>',
  reset:'<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
};
const ic = (n,cls) => `<svg class="ic${cls?" "+cls:""}" viewBox="0 0 24 24" aria-hidden="true">${SV[n]||""}</svg>`;

/* ===================================================================
 *  WILD RIFT BUILDLERİ
 * =================================================================== */
const VAR = {standard:["sword","Standart"],"anti-tank":["shield","Tanklara karşı"],sustain:["heart","Uzun dövüş"],poke:["target","Dürtmeye karşı"],
  engage:["bolt","Dalış takımı"],safety:["wall","Güvenli"],burst:["bolt","Ani hasar"],"anti-heal":["drop","İyileşmeye karşı"],"anti-ap":["spark","Büyüye karşı"],
  "anti-ad":["sword","Fiziksele karşı"],tank:["shield","Tank"],peel:["users","Takımı koru"],"anti-dive":["wall","Dalışa karşı"],pen:["target","Zırh delme"],
  utility:["wand","Destekleyici"],bruiser:["sword","Dövüşçü"]};
const SITS = [[/İyileş/i,"drop","İyileşmeye karşı"],[/tank|HP/i,"shield","Tanklara karşı"],[/AD burst/i,"sword","Fiziksel patlamaya karşı"],[/AP burst/i,"spark","Büyü patlamasına karşı"],[/hareketli/i,"wind","Kaçan rakiplere karşı"]];
const RUNE_TR = {"Conqueror":"Yenilmez","Lethal Tempo":"Ölümcül Tempo","Electrocute":"Elektrik Ver","Grasp of the Undying":"Hortlağın Pençesi","Summon Aery":"Aery","Aery":"Aery","Arcane Comet":"Sihirli Yıldız","Phase Rush":"Sürat Coşkusu","Fleet Footwork":"Ayağı Çabuk","Guardian":"Muhafız","Aftershock":"Artçı Şok","Dark Harvest":"Karanlık Hasat","First Strike":"İlk Vuruş","Kraken Slayer":"Kraken Avcısı","Glacial Augment":"Buzul Takviyesi"};
const RUNES = window.WR_RUNES || {};
/* riftpatchnotes yeni adları → simge adları */
const RUNE_ALIAS = {"Ice Overlord":"Ice Tyrant","Cut Down":"Giant Slayer","Eyeball Collection":"Eyeball Collector","Hexflash":"Hextech Flashtraption","Aery":"Summon Aery"};
const runeKey = n => ICO_RUNE[n] ? n : (RUNE_ALIAS[n]&&ICO_RUNE[RUNE_ALIAS[n]] ? RUNE_ALIAS[n] : n);
const runeTR = n => RUNE_TR[n] || (RUNES[n]&&RUNES[n][0]) || n;
const tipAttr = (k,id) => `data-tip="${k}:${esc(id)}"`;
const runeImg = (n0,cls) => { const n=runeKey(n0); return ICO_RUNE[n] ? `<img class="${cls||""}" src="${ICO_RUNE[n]}" alt="${esc(runeTR(n))}" ${tipAttr("rune",n)} loading="lazy">` : `<span class="chip" ${tipAttr("rune",n)}>${esc(runeTR(n))}</span>`; };
const wrBuild = (c,r) => { const b=BUILDS[c.slug]; if(!b) return null; const rr = b.r[r] ? r : b.r[c.main] ? c.main : Object.keys(b.r)[0]; return rr ? {role:rr, ...b.r[rr], sit:b.sit||[]} : null; };
let bRole=null, bVar=0, bTab="rec", bStyle=null;
/* Profil build kartı: koridor → stil → Önerilenler (oyuncu/stil buildleri + Karma) / En çok kazananlar (top 3 çekirdek) */
function buildCard(c){
  const roles=rolesOf(c); if(!roles.includes(bRole)) bRole=roles.includes(c.main)?c.main:roles[0];
  const b=BUILDS[c.slug]||{}, styles=stylesShown(c,bRole); if(!styles.includes(bStyle)) bStyle=styles[0];
  const P=presetsFor(c,bRole).filter(p=>!(p.gen==="ct")).map(p=>{ if(p.gen!=="hy") return p;
    const pool=p.kind==="tank"?DMG_POOL[c.dmg==="AP"||p.style==="ap"?"AP":"AD"]:(DEF_POOL[p.kind]||DEF_POOL.adm);
    const items=arrange([...p.base.slice(0,3),...pool,p.boots],c,bRole); return {...p, items:arrange([...items.filter(x=>!isBoot(x)).slice(0,5),p.boots],c,bRole)}; });
  const hasTop=P.some(p=>p.tab==="top"); if(!hasTop) bTab="rec";
  const list=P.filter(p=>p.tab===bTab&&(bTab==="top"||p.style===bStyle)); if(!list[bVar]) bVar=0; const V=list[bVar];
  const kind=STYLE[bStyle]?STYLE[bStyle].kind:kindOf(c), defPool=(kind==="tank"||kind==="sup") ? FINISHED().filter(i=>i.cat==="sav").map(i=>i.en) : (DEF_POOL[kind]||[]);
  const vsM=defPool.filter(en=>(itemStats(en).mr||0)>0).slice(0,4), vsP=defPool.filter(en=>(itemStats(en).armor||0)>0&&!(itemStats(en).mr>0)).slice(0,4);
  const runes=V&&V.runes&&V.runes.length?V.runes:tplOf(bStyle,bRole,isMelee(c.slug)).runes;
  const swaps=V?DEF_SWAP.filter(p=>V.items.includes(p[0])||V.items.includes(p[1])):[];
  return `${roles.length>1?`<div class="seg sm" style="margin-bottom:10px">${roles.map(r=>`<button type="button" data-br="${r}" aria-pressed="${r===bRole}">${ROLE[r]}</button>`).join("")}</div>`:""}
    ${hasTop?`<div class="f-btabs" role="tablist" style="margin-bottom:8px"><button type="button" role="tab" data-btab="rec" aria-selected="${bTab==="rec"}">Önerilenler</button><button type="button" role="tab" data-btab="top" aria-selected="${bTab==="top"}">${ic("trophy")}En çok kazananlar</button></div>`:""}
    ${bTab==="rec"&&styles.length>1?`<div class="f-stylesel" role="group" aria-label="Oyun stili" style="margin-bottom:8px"><span class="lbl">Stil</span>${styles.map(s=>`<button type="button" data-bstyle="${s}" aria-pressed="${s===bStyle}" title="${esc(STY_DESC[s])}">${ic(STYLE[s].ic)}${esc(STYLE[s].lbl)}</button>`).join("")}</div>`:""}
    <div class="vtabs" role="tablist">${list.map((p,i)=>`<button type="button" role="tab" data-bv="${i}" aria-selected="${i===bVar}">${ic(p.ic)}${esc(p.lbl)}${p.wr!=null?` <small>%${dec1(p.wr)}</small>`:""}</button>`).join("")}</div>
    ${V?`<p class="muted small" style="margin:0 0 10px">${esc(V.sub)}${V.src?` · ${esc(V.src)}`:""}</p>
    <div class="irow">${V.items.filter(x=>!isBoot(x)).map((en,i)=>itile(en,i+1)).join('<span class="arrow" aria-hidden="true">›</span>')}</div>`:'<div class="empty">Bu koridor için build verisi yok.</div>'}
    <div class="bsub">
      ${V&&V.items.find(isBoot)?`<div><span class="l" title="Çizme">${ic("boot")}</span>${itile(V.items.find(isBoot))}</div>`:""}
      ${runes&&runes.length?`<div class="runes"><span class="l" title="Rünler">${ic("rune")}</span>${runeImg(runes[0],"ks")}<span class="minor">${runes.slice(1).map(n=>runeImg(n)).join("")}</span><span class="rn">${esc(runeTR(runeKey(runes[0])))}${V&&V.runeSrc?`<small class="muted"> · ${esc(V.runeSrc)}</small>`:""}</span></div>`:""}
      <div><span class="l" title="Sihirdar büyüleri">${ic("spark")}</span><span class="small">${esc(SPELLS[bRole])}</span></div>
    </div>
    ${bRole==="sup"?`<p class="muted small" style="margin:8px 0 0">${ic("info")} Destek görev itemı yalnızca destek koridorunda alınır; oyunun başında ilk item odur.</p>`:""}
    ${swaps.length?`<h3 class="h3">Karşı takıma göre değiştir</h3><div class="swaps">${swaps.map(([m,p])=>`<div class="swap">${itile(m)}<span class="sw-l">${ic("spark")}Çoğu büyü hasarıysa<br>${ic("sword")}Çoğu fiziksel hasarsa</span>${itile(p)}</div>`).join("")}</div>`:""}
    ${vsM.length||vsP.length?`<h3 class="h3">Karşı takıma göre savunma</h3><div class="sits">
      ${vsM.map(en=>`<div class="sit">${itile(en)}<span class="ctx">${ic("spark")}Çoğu büyü hasarıysa</span></div>`).join("")}
      ${vsP.map(en=>`<div class="sit">${itile(en)}<span class="ctx">${ic("sword")}Çoğu fiziksel hasarsa</span></div>`).join("")}</div>`:""}
    ${b.sit&&b.sit.length?`<h3 class="h3">Duruma göre</h3><div class="sits">${b.sit.map(([s,ctx])=>{const m=SITS.find(x=>x[0].test(ctx))||[0,"info",ctx];return `<div class="sit" title="${esc(ctx)}">${itile(itemOf(s))}<span class="ctx">${ic(m[1])}${esc(m[2])}</span></div>`}).join("")}</div>`:""}
    <p class="muted small" style="margin:10px 0 0">Aynı gruptan yalnızca bir item alınabilir (ör. tek zırh delme itemı, tek aktif item, tek can simidi); buildler buna göre düzenlenir. Stil buildleri, o stilde oynanan şampiyonların bu koridordaki gerçek buildlerinden çıkarılır.</p>`;
}
/* ===================================================================
 *  DÜELLO MOTORU — saniye saniye dövüş simülasyonu
 *  Taban değerler, item sayıları ve yetenek hasarları Wild Rift'e özgü (LoL Wiki).
 *  0. saniyede iki taraf da yetenek kombosunu atar; sonra normal saldırılar ve
 *  bekleme süresi dolan yetenekler devam eder. Kalkanlar hasarı emer; sert kitle kontrolü
 *  hedefin saldırısını ve yeteneklerini durdurur (etki direnci kısaltır).
 *  Şampiyon pasifleri, yeteneklerin özel etkileri, item pasifleri/aktifleri ve ana rün
 *  data/mechanics.js'teki etki listelerinden okunur (MECH). Menzil ve kaçma hesaba katılmaz.
 * =================================================================== */
const WD = window.WR_DATA || {champ:{}, item:{}};
const AB = window.WR_ABIL || {};
const MX = window.WR_MECH || {champ:{}, item:{}, rune:{}, fix:{}};
const STAT_TR = {hp:"Can",ad:"Saldırı Gücü",ap:"Yetenek Gücü",armor:"Zırh",mr:"Büyü Direnci",as:"Saldırı Hızı",crit:"Kritik",ah:"Yetenek Hızı",
  armpenflat:"Zırh Delme",armpen:"Zırh Delme",mpenflat:"Büyü Delme",mpen:"Büyü Delme",lifesteal:"Can Çalma",omnivamp:"Tam Can Çalma",ms:"Hareket Hızı",
  msflat:"Hareket Hızı",mana:"Mana",mp5:"Mana Yenileme",hp5:"Can Yenileme",hsp:"İyileştirme ve Kalkan Gücü",tenacity:"Etki Direnci"};
const PCT_STATS = new Set(["as","crit","armpen","mpen","lifesteal","omnivamp","ms","hsp","tenacity"]);
const itemData = en => { const k=kb(en); return WD.item[k] || WD.item[Object.keys(ITEM_ALIAS).find(w=>ITEM_ALIAS[w]===k)||""] || null; };
const itemStats = en => (itemData(en)||{}).s || {};
const fmtStat = (k,v) => `${PCT_STATS.has(k)?"%":"+"}${String(v).replace(".",",")} ${STAT_TR[k]||k}`;
/* Seviyeye göre yetenek kademesi (Wild Rift: temel yetenekler 4, ulti 3 kademe) */
/* Yetenek kademesi. Ulti 5/9/13'te; temel yetenekler önce birer kademe, sonra yükseltme önceliğine göre (wildriftcore "skill order", yoksa Q > W > E) */
const QWE = {Q:"1",W:"2",E:"3"};
const orderOf = slug => { const b=BUILDS[slug]; return b&&b.so ? b.so.map(k=>QWE[k]) : ["1","2","3"]; };
const abRank = (slot,L,order) => { const ult=L>=13?3:L>=9?2:L>=5?1:0; if(slot==="4") return ult;
  let p=L-ult; const o=order||["1","2","3"], r={"1":0,"2":0,"3":0};
  for(const k of o) if(p>0){ r[k]=1; p--; }
  for(const k of o){ const a=Math.min(3,p); r[k]+=a; p-=a; }
  return r[slot]||0; };
const atRank = (v,rank) => Array.isArray(v) ? v[Math.min(v.length,rank)-1] : (v||0);
const isMelee = slug => ((WD.champ[slug]||{}).rng||125) < 300;
const itemKeys = f => [...new Set(f.items.filter(Boolean).map(en=>{ const k=kb(en); return MX.item[k]?k:(ITEM_ALIAS[k]&&MX.item[ITEM_ALIAS[k]]?ITEM_ALIAS[k]:k); }))];
/* Seçili buildin ana rünü (oyuncu verisi yoksa yok) */
const keystoneOf = f => { if(f.rune!==undefined) return f.rune; const b=BUILDS[f.c.slug]; if(!b) return null; const r=b.r[f.c.main]||Object.values(b.r)[0]; return r&&r.runes ? r.runes[0] : null; };
/* Çağırıcı büyüleri: wildriftcore build sayfasından (builds.js "sp"), yoksa Sıçra + rol varsayılanı */
const SPELL_ROLE = {top:"Ignite",mid:"Ignite",adc:"Heal",sup:"Exhaust",jg:"Smite"};
const spellsFor = c => { const b=BUILDS[c.slug]; if(b&&b.sp&&b.sp.length===2) return [...b.sp]; return ["Flash",SPELL_ROLE[c.main]||"Ignite"]; };
function fstats(f){
  const b=WD.champ[f.c.slug]; if(!b||!(b.hp>0)) return null;
  const L=f.lvl-1;
  const s={hp:b.hp+b.hpL*L, ar:b.ar+b.arL*L, mr:b.mr+b.mrL*L, ad:b.ad+b.adL*L, bad:0, bhp:0, bar:0, bmr:0, ap:0, asB:b.asL*L, crit:0, leth:0, arpen:0, mpenF:0, mpen:0, ls:0, ov:0, ah:0, hsp:0, lvl:f.lvl, critMul:1.75, fx:[]};
  s.adBase=s.ad;
  for(const en of f.items){ if(!en) continue; const x=itemStats(en);
    s.hp+=x.hp||0; s.bhp+=x.hp||0; s.ar+=x.armor||0; s.bar+=x.armor||0; s.mr+=x.mr||0; s.bmr+=x.mr||0; s.ad+=x.ad||0; s.bad+=x.ad||0; s.ap+=x.ap||0; s.asB+=x.as||0; s.crit+=x.crit||0;
    s.leth+=x.armpenflat||0; s.arpen+=x.armpen||0; s.mpenF+=x.mpenflat||0; s.mpen+=x.mpen||0; s.ls+=x.lifesteal||0; s.ov+=x.omnivamp||0; s.ah+=x.ah||0; s.hsp+=x.hsp||0; s.ten=(s.ten||0)+(x.tenacity||0); }
  s.crit/=100;
  /* Kalıcı değer etkileri: önce itemlar, sonra şampiyon pasifi (Yasuo kritiği ikiye katlar) */
  const ord=orderOf(f.c.slug), c={lvl:f.lvl, melee:isMelee(f.c.slug), rk:slot=>abRank(slot,f.lvl,ord)};
  const statFx = [...itemKeys(f).flatMap(k=>(MX.item[k]||[]).map(e=>[e,iname(itemOf(k))])), ...(MX.champ[f.c.slug]||[]).map(e=>[e,""])];
  for(const [e,src] of statFx) if(e&&e.k==="stat"){ e.f(s,c); s.fx.push(src?src+": "+e.name:e.name); }
  let msF=0, msP=0; for(const en of f.items){ if(!en) continue; const x=itemStats(en); msF+=x.msflat||0; msP+=x.ms||0; }
  s.ms=((b.ms||340)+msF)*(1+msP/100); s.rng=b.rng||125;
  s.as=Math.min(2.5, b.as + b.asR*s.asB/100); s.crit=Math.min(1,s.crit);
  s.arpen=Math.min(60,s.arpen); s.mpen=Math.min(60,s.mpen);
  return s;
}
const mulOf = (a,d,type) => type==="T" ? 1 : type==="M" ? 100/(100+Math.max(0, d.mr*(1-a.mpen/100)-a.mpenF)) : 100/(100+Math.max(0, d.ar*(1-a.arpen/100)-a.leth));
function abilities(slug,a,d){
  const A=AB[slug]||{}, base=WD.champ[slug], out=[], FX=MX.fix[slug]||{}, ME=MX.champ[slug]||[];
  const val=(b,r,rank)=> (b.lvl ? b.lvl[0]+(b.lvl[1]-b.lvl[0])*(a.lvl-1)/14 : atRank(b.r,rank))
    + atRank(r.ap,rank)/100*a.ap + atRank(r.ad,rank)/100*a.ad + atRank(r.bad,rank)/100*a.bad
    + atRank(r.thp,rank)/100*d.hp + atRank(r.mhp,rank)/100*a.hp + atRank(r.bhp,rank)/100*a.bhp;
  for(const slot of ["1","2","3","4"]){
    const x={...(A[slot]||{}), ...(FX[slot]||{})}; if(!A[slot]&&!FX[slot]) continue;
    const rank=abRank(slot,a.lvl,orderOf(slug)); if(!rank) continue;
    /* bu yuvaya bağlı mekanikler (kaçınma, ölümsüzlük, iyileşme…) */
    const mine=ME.filter(e=>e&&(e.slot===slot||e.on==="cast:"+slot));
    let raw=0, type=base.t==="M"?"M":"P";
    if(x.d&&x.d.length){ const [b,t,r,ps]=x.d[0]; raw=val(b,r,rank)*(ps?3:1); type=t||type; }
    if(x.dv) type=x.t||type;
    if(x.hl&&!mine.some(e=>e.heal)) mine.push({on:"cast:"+slot, heal:()=>val(x.hl[0],x.hl[1],rank), name:(x.n||"")});
    const sh = x.sh ? {amt:val(x.sh[0],x.sh[1],rank), dur:x.sh[2]||2.5} : null;
    const cc = x.cc ? {k:x.cc[0], dur:x.cc[1]} : null;
    const dg = ME.find(e=>e&&(e.k==="dodge"||e.k==="invuln")&&e.slot===slot);
    const u = ME.find(e=>e&&(e.k==="undying"||e.k==="revive")&&e.slot===slot);
    let use = x.use || (u?"never":null) || (dg&&(dg.use||(dg.react?"react":null))) || (mine.find(e=>e.use)||{}).use || null;
    if(raw<=0&&!x.dv&&!sh&&!cc&&!mine.length&&!x.keep&&!x.bf&&!x.mv) continue;
    /* menzil yoksa: hareket yeteneği 300, yakın dövüşçü kendi saldırı menzili + 50, uzak menzilli 550 (varsayım) */
    const rg = x.rg || (x.mv ? 300 : base.rng<300 ? base.rng+50 : Math.max(550,base.rng));
    const cd = Math.max(2, x.cd?atRank(x.cd,rank):8) * 100/(100+a.ah);
    out.push({slot, raw:Math.max(0,raw), dv:x.dv||null, over:x.over||0, type, rg, tg:x.tg||"U", mv:x.mv||null, sl:x.sl?[atRank(x.sl[0],rank),x.sl[1]]:null, cd, mul:mulOf(a,d,type), sh, cc, use, lockAA:x.lockAA||0, bf:mine.some(e=>e.buff)||!x.bf?null:{st:Object.fromEntries(Object.entries(x.bf.st).map(([k,v])=>[k,atRank(v,rank)])),dur:x.bf.dur},
      dodge: dg ? {aaOnly:!!dg.aaOnly, inv:dg.k==="invuln", dur:dg.dur, lock:dg.lock||0, dr:dg.dr||0, parry:!!dg.ccBack, name:dg.name} : null});
  }
  return out;
}
/* Yetenek verisi olmayan şampiyonlar için ortalama yetenek hasarı */
const AB_FALLBACK = (a,c) => [{slot:"x", raw:((8+5.5*a.lvl)*(0.6+0.25*(c.dmg||2)) + 0.3*a.bad + 0.35*a.ap)*4, type:c.t==="M"?"M":"P", cd:4, sh:null, cc:null}];

/* Etkileri olay adlarına göre dizinler. Kaynak etiketi sonuç ekranındaki "Hesaba katılanlar" listesine gider. */
function mechOf(f){
  const L=[]; const push=(e,label)=>{ if(e&&e.k!=="stat") L.push({...e, label}); };
  (MX.champ[f.c.slug]||[]).forEach(e=>push(e,e&&e.name));
  const grp=new Set();
  for(const k of itemKeys(f)) for(const e of (MX.item[k]||[])){
    const g = e.grp || (e.k==="lifeline"?"lifeline":null); if(g){ if(grp.has(g)) continue; grp.add(g); }
    push(e, iname(itemOf(k))+(e.name?" — "+e.name:"")); }
  const ks=keystoneOf(f); if(ks&&MX.rune[ks]) MX.rune[ks].forEach(e=>push(e,runeTR(ks)+(e.name&&e.name!==runeTR(ks)?" — "+e.name:"")));
  L.forEach((e,i)=>e.i=i);
  return L;
}
const fval = (v,c) => typeof v==="function" ? v(c) : (v||0);

function fightSim(me,en){
  const sm=fstats(me), se=fstats(en); if(!sm||!se) return null;
  const dt=0.05, T=30, tl=[[0,1,1]]; let t=0, step=0;
  const mk=(f,s,o)=>{ const c=WD.champ[f.c.slug];
    let abs=abilities(f.c.slug,s,o); const real=abs.some(x=>x.raw>0||x.dv);
    if(!real) abs=abs.concat(AB_FALLBACK(s,c).map(x=>({...x,mul:mulOf(s,o,x.type)})));
    const M=mechOf(f), X={f, s, base:c, slug:f.c.slug, melee:isMelee(f.c.slug), hp:s.hp, max:s.hp, abs, real, M,
      cds:abs.map(()=>0), ccReady:abs.map(()=>0), aaT:0, aaN:0, dAA:0, dAB:0, absorbed:0, healed:0, stunUntil:0, silUntil:0, ccUntil:0, ccDealt:0,
      shields:[], buffs:[], hots:[], dots:{}, bleeds:{}, pend:[], delayQ:[], ramps:M.filter(e=>e.k==="ramp").map(e=>({e,n:0,until:0})),
      cnt:{}, ecd:{}, used:{}, flags:{}, charges:{}, fx:{}, inv:0, untarg:0, aaDodge:0, lock:0, aaLock:0, gwV:0, gwUntil:0, shRed:0, shRedUntil:0,
      shred:{}, gcd:0, rootUntil:0, slowV:0, slowUntil:0, windUntil:0, acc:.5, miss:0, ev:[], sp:[], flashT:-9, flashAb:-1, dead:false, deadAt:-1, dealt:0, byT:{}, takenPre:0, grit:0, gritT:0, lastHit:-9, burst:[], burstReady:0, flowReady:true, reviveAt:0, zombieAt:0};
    const K=k=>M.filter(e=>e.k===k);
    Object.assign(X,{dyn:K("dyn"), vamp:K("vamp"), amp:K("amp"), vuln:K("vuln"), dr:K("dr"), gw:K("gw"), shredFx:K("shred"), reflect:K("reflect"),
      aura:K("aura"), regen:K("regen"), timed:K("timed"), enemyFx:K("enemy"), aamul:K("aamul"), shieldred:K("shieldred"),
      lifeline:K("lifeline")[0]||null, revive:K("revive")[0]||null, zombie:K("zombie")[0]||null, undying:K("undying")[0]||null, stasis:K("stasis")[0]||null,
      exec:K("exec")[0]||null, delay:K("delay")[0]||null, sshield:K("sshield")[0]||null, qss:K("qss")[0]||null, flow:K("flow")[0]||null,
      gritFx:K("grit")[0]||null, burstFx:K("burst")[0]||null, bleedFx:K("bleed")});
    X.rng=s.rng; X.order=orderOf(f.c.slug);
    X.sp=(f.sp||spellsFor(f.c)).map(k=>MX.spell&&MX.spell[k]?{k,...MX.spell[k],ready:0}:null).filter(Boolean);
    X.llReady=0; X.revReady=true; X.stReady=0; X.ssReady=0; X.qssReady=0;
    X.trig={}; M.filter(e=>e.on&&!e.k).forEach(e=>{ const ev=e.on.split(":")[0]; (X.trig[ev]=X.trig[ev]||[]).push(e); if(e.startCd!=null) X.ecd[e.i]=e.startCd; });
    return X; };
  const A=mk(me,sm,se), B=mk(en,se,sm);
  const ctx=(X,Y)=>({s:X.s, o:Y.s, me:X, en:Y, lvl:X.s.lvl, melee:X.melee, rk:slot=>abRank(slot,X.s.lvl,X.order), get L(){return X.L}, get t(){return t}});
  for(const [X,Y] of [[A,B],[B,A]]){ X.c=ctx(X,Y); X.Y=Y;
    X.stk=id=>{ const r=X.ramps.find(r=>r.e.id===id); if(r) return r.until>t?r.n:0; const b=X.bleeds[id]; return b&&b.until>t?b.n:0; };
    X.has=id=>X.buffs.some(b=>b.id===id&&b.until>t);
    X.shTotal=()=>X.shields.reduce((a,s)=>a+(s.until>t?s.amt:0),0);
    X.tag=(label,n)=>{ if(label) X.fx[label]=(X.fx[label]||0)+(n===undefined?1:n); }; }
  /* canlı değerler: buff, yük, dinamik pasifler */
  const live=(X,Y)=>{ const s=X.s, b=X.base;
    const L={ad:s.ad, ap:s.ap, asB:s.asB, crit:s.crit, ar:s.ar, mr:s.mr, ls:s.ls/100, ov:s.ov/100, pv:0, dr:0, amp:0, abAmp:0, ten:s.ten||0, arpen:s.arpen, mpen:s.mpen, healAmp:(s.healAmp||0)/100, regen:0, asMul:1, msP:0, msF:0, dmgOut:1};
    const add=(k,v)=>{ switch(k){
      case "as": L.asB+=v; break; case "ad": L.ad+=v; break; case "adPct": L.ad+=s.ad*v/100; break; case "ar": L.ar+=v; break; case "mr": L.mr+=v; break;
      case "arPct": L.ar+=s.ar*v/100; break; case "mrPct": L.mr+=s.mr*v/100; break; case "ov": L.ov+=v/100; break; case "dr": L.dr+=v; break; case "ten": L.ten+=v; break;
      case "healAmp": L.healAmp+=v/100; break; case "regen": L.regen+=v; break; case "arpen": L.arpen+=v; break; case "mpen": L.mpen+=v; break; case "abAmp": L.abAmp+=v/100; break;
      case "asMul": L.asMul*=v; break; case "ms": L.msP+=v; break; case "msF": L.msF+=v; break; case "dmgOut": L.dmgOut*=v; break; case "adapt": if(b.t==="M") L.ap+=v*1.6; else L.ad+=v; break; } };
    for(const bf of X.buffs) if(bf.until>t) for(const k in bf.st) add(k,bf.st[k]);
    for(const r of X.ramps) if(r.n>0&&r.until>t&&r.e.st) for(const k in r.e.st) add(k,fval(r.e.st[k],X.c)*r.n);
    for(const e of Y.enemyFx) for(const k in e.st) add(k,e.st[k]);
    X.L=L; for(const e of X.dyn) e.f(L,X.c);
    L.arpen=Math.min(60,L.arpen); L.mpen=Math.min(60,L.mpen); L.crit=Math.min(1,L.crit); L.asBonus=L.asB;
    L.as=Math.min(2.5, b.as+b.asR*L.asB/100)*L.asMul;
    L.ms=(s.ms*(1+L.msP/100)+L.msF)*(t<X.slowUntil?1-X.slowV:1);
    return L; };
  A.L=live(A,B); B.L=live(B,A);
  const shredOf=(Y,k)=>{ const r=Y.shred[k]; return r&&r.until>t ? r.v : 0; };
  const resist=(X,Y,type)=>{ if(type==="T") return 1; const L=X.L, D=Y.L;
    if(type==="M"){ const mr=D.mr*(1-Math.min(.9,shredOf(Y,"mr")))-shredOf(Y,"mrF"); return 100/(100+Math.max(0, mr*(1-L.mpen/100)-X.s.mpenF)); }
    const ar=D.ar*(1-Math.min(.9,shredOf(Y,"ar"))); return 100/(100+Math.max(0, ar*(1-L.arpen/100)-X.s.leth)); };
  const addShield=(X,amt,dur,o={})=>{ if(!(amt>0)||X.dead) return; amt*=1+(X.s.hsp||0)/100; if(t<X.shRedUntil) amt*=1-X.shRed;
    X.shields.push({amt, until:t+(dur||2.5), decay:o.decay?amt/(dur||2.5):0, only:o.only||null}); };
  const heal=(X,amt,over)=>{ if(!(amt>0)||X.dead||t<X.reviveAt) return 0;
    amt*=(1-(t<X.gwUntil?X.gwV:0))*(1+X.L.healAmp); const h=Math.min(Math.max(0,X.max-X.hp),amt); X.hp+=h; X.healed+=h;
    if(over&&amt>h) addShield(X,Math.min(over.cap||1e9,amt-h),over.dur||6); return h; };
  const addBuff=(X,b,label)=>{ if(!b) return; const stv={}; for(const k in b.st) stv[k]=fval(b.st[k],X.c);
    const dur=fval(b.dur,X.c)||1;
    if(b.id&&!b.stack){ const old=X.buffs.find(x=>x.id===b.id&&x.until>t); if(old){ old.until=t+dur; return; } }
    if(b.stack&&X.buffs.filter(x=>x.id===b.id&&x.until>t).length>=b.stack){ const o=X.buffs.find(x=>x.id===b.id&&x.until>t); o.until=t+dur; return; }
    if(stv.hpB){ X.max+=stv.hpB; X.hp+=stv.hpB; }
    X.buffs.push({id:b.id||null, st:stv, until:t+dur, hits:b.hits||0}); };
  const applyDot=(X,Y,d,key)=>{ const tot=fval(d.v,X.c), dur=d.dur||3; if(!(tot>0)) return; Y.dots[key]={from:X, t:d.t||"M", dps:tot/dur, until:t+dur}; };
  const applyCC=(X,Y,cc)=>{ if(!cc||Y.dead) return; let [k,dur]=cc;
    if(t<Y.inv||t<Y.untarg){ if(Y.parry&&t<Y.inv){ Y.parry=false; Y.tag("Karşılık sersemletmesi"); applyCC(Y,X,["hard",1.5]); } return; }
    if(Y.has("ccimm")) return;
    dur*=1-Math.min(.6,(Y.L.ten||0)/100);
    if(k==="hard"&&Y.qss&&t>=Y.qssReady&&dur>=.5){ Y.qssReady=t+Y.qss.cd; Y.tag(Y.qss.label); return; }
    if(k==="hard") Y.stunUntil=Math.max(Y.stunUntil,t+dur); else if(k==="root") Y.rootUntil=Math.max(Y.rootUntil,t+dur); else Y.silUntil=Math.max(Y.silUntil,t+dur);
    X.ccDealt+=dur; Y.ccUntil=Math.max(Y.ccUntil,t+dur); fire(X,Y,"cc"); };
  /* Ölümcül hasar: Ölümsüz Öfke, zombi, diriliş */
  const lethal=(Y,X)=>{
    if(t<Y.undyUntil){ Y.hp=Math.max(Y.hp,Y.undyMin); return; }
    const U=Y.undying; if(U){ const i=Y.abs.findIndex(a=>a.slot===U.slot); if(i>=0&&Y.cds[i]<=0){
      Y.cds[i]=Y.abs[i].cd; Y.undyUntil=t+U.dur; Y.undyMin=fval(U.min,Y.c); Y.hp=Math.max(Y.hp,Y.undyMin);
      const r=Y.ramps.find(r=>r.e.id==="fury"); if(r&&U.fury){ r.n=Math.min(r.e.max,r.n+fval(U.fury,Y.c)); r.until=t+99; }
      Y.tag(U.label); return; } }
    if(Y.zombie&&!Y.zombieAt){ Y.zombieAt=t+Y.zombie.dur; Y.inv=Y.lock=t+Y.zombie.dur; Y.hp=0.001; Y.tag(Y.zombie.label); return; }
    const R=Y.revive; if(R&&Y.revReady){ const i=R.slot?Y.abs.findIndex(a=>a.slot===R.slot):-1;
      if(!R.slot||(i>=0&&Y.cds[i]<=0)){ if(i>=0) Y.cds[i]=Y.abs[i].cd; if(!R.slot) Y.revReady=false;
        Y.reviveAt=t+R.dur; Y.reviveHP=fval(R.hp,Y.c); Y.inv=Y.lock=t+R.dur; Y.hp=0.001; Y.dots={}; Y.tag(R.label); return; } }
    Y.dead=true; Y.deadAt=t; };
  /* Hasar: dokunulmazlık → direnç → güçlendirme/azaltma → erteleme → can simidi → kalkan → can */
  const deal=(X,Y,amt,type,src,o={})=>{
    if(!(amt>0)||Y.dead) return 0;
    if(t<Y.inv) return null;
    if(src!=="dot"&&src!=="aura"&&src!=="dd"&&t<Y.untarg) return null;
    if(src==="aa"&&t<Y.aaDodge) return null;
    if(type==="A") type=X.base.t==="M"||X.s.ap>X.s.bad?"M":"P";
    if(src==="ab"&&Y.sshield&&t>=Y.ssReady){ Y.ssReady=t+Y.sshield.cd; Y.tag(Y.sshield.label); return null; }
    let d=amt;
    if(src!=="dd"){
      X.byT[type]=(X.byT[type]||0)+amt;
      Y.takenPre+=amt; d*=resist(X,Y,type);
      let amp=X.L.amp+(src==="ab"?X.L.abAmp:0);
      for(const e of X.amp) if(!e.src||e.src===src) amp+=fval(e.v,X.c);
      for(const e of X.vuln) if(e.t===type){ if(e.asTrue) { if(!o.noVuln) deal(X,Y,amt*e.v,"T","fx",{noVuln:1}); } else amp+=e.v; }
      d*=(1+amp)*X.L.dmgOut;
      let dr=Y.L.dr; for(const e of Y.dr){ if(e.src==="aa"&&(src==="aa"||src==="oh")) dr+=e.v; if(e.src==="crit"&&o.critShare) d*=1-e.v/100*o.critShare; }
      d*=1-Math.min(90,dr)/100;
      if(Y.delay&&type!=="T"){ const p=fval(Y.delay.v,Y.c)*d; Y.delayQ.push({from:X, left:p, rate:p/Y.delay.dur}); d-=p; Y.tag(Y.delay.label,0); }
    }
    const before=Y.hp+Y.shTotal();
    if(Y.flow&&Y.flowReady&&src!=="dd"){ Y.flowReady=false; addShield(Y,fval(Y.flow.sh,Y.c),Y.flow.dur); Y.tag(Y.flow.label); }
    const LL=Y.lifeline; if(LL&&t>=Y.llReady&&(!LL.only||LL.only===type)&&before-d<LL.th*Y.max){ Y.llReady=t+LL.cd;
      if(LL.sh) addShield(Y,fval(LL.sh,Y.c),LL.dur,{decay:LL.decay}); if(LL.heal) Y.hots.push({rate:fval(LL.heal,Y.c)/(LL.hot||5), until:t+(LL.hot||5)});
      if(LL.buff) addBuff(Y,LL.buff); Y.tag(LL.label); }
    if(src!=="dd") fire(Y,X,"taken",{type});
    Y.shields=Y.shields.filter(s=>s.until>t&&s.amt>0.5);
    let rem=d;
    for(const sh of Y.shields){ if(rem<=0) break; if(sh.only&&sh.only!==type) continue; const take=Math.min(sh.amt,rem); sh.amt-=take; rem-=take; Y.absorbed+=take; }
    Y.hp-=rem; Y.lastHit=t;
    if(Y.gritFx&&rem>0){ Y.grit=Math.min(Y.gritFx.cap*Y.max,Y.grit+rem); Y.gritT=t; }
    if(src!=="dd"){ X.dealt+=d; if(src==="aa"||src==="oh") X.dAA+=d; else X.dAB+=d; }
    if(src!=="dd"&&d>0){
      const L=X.L; let v=d*L.ov; if(src==="aa"||src==="oh") v+=d*L.ls; if(type==="P") v+=d*L.pv;
      let ovs=null;
      for(const e of X.vamp){ if(e.src==="any"||(e.src==="ab"&&src==="ab")||(e.src==="P"&&type==="P")||(e.src==="crit"&&o.critShare)) { const a=fval(e.v,X.c)*d*(e.src==="crit"?o.critShare:1); v+=a; if(a>0) X.tag(e.label,0); }
        if(e.over) ovs={cap:e.cap?fval(e.cap,X.c):0, dur:6, label:e.label}; }
      if(v>0) heal(X,v,ovs);
      for(const e of X.gw) if(e.t==="any"||e.t===type){ Y.gwV=Math.max(t<Y.gwUntil?Y.gwV:0,e.v); Y.gwUntil=t+3; }
      for(const e of X.shredFx) if((!e.t||e.t===type)&&(!e.src||e.src==="any"||e.src===src||(e.src==="ab"&&src==="fx"))){ const r=Y.shred[e.st]||(Y.shred[e.st]={v:0,until:0,n:0});
        if(r.until<t) r.n=0; r.n=Math.min(e.max,r.n+1); r.v=r.n*e.per; r.until=t+e.dur; }
      for(const e of X.shieldred){ if(t>=Y.shRedUntil){ const red=fval(e.v,X.c); Y.shields.forEach(s=>s.amt*=1-red); Y.shRed=red; } Y.shRedUntil=t+3; }
      if(X.burstFx){ X.burst.push([t,d]); X.burst=X.burst.filter(b=>b[0]>t-X.burstFx.win); const e=X.burstFx;
        if(t>=X.burstReady&&X.burst.reduce((a,b)=>a+b[1],0)>=e.pct*Y.max){ X.burstReady=t+e.cd; X.pend.push({at:t+e.delay, f:()=>{ deal(X,Y,fval(e.v,X.c),e.t,"fx"); X.tag(e.label); }}); } }
    }
    if(t<Y.undyUntil) Y.hp=Math.max(Y.hp,Y.undyMin);
    if(Y.hp<=0) lethal(Y,X);
    else if(X.exec&&Y.hp<X.exec.th*Y.max&&!(t<Y.undyUntil)){ Y.hp=0; X.tag(X.exec.label); lethal(Y,X); }
    if(!Y.dead&&Y.stasis&&t>=Y.stReady&&Y.hp>0&&Y.hp<Y.stasis.th*Y.max){ Y.stReady=t+Y.stasis.cd; Y.inv=Y.lock=t+Y.stasis.dur; Y.tag(Y.stasis.label); }
    return d; };
  /* Tetikleyiciler: "aa", "cast", "hit", "abhit", "taken", "start", "low", "tick", "cc", "bleed5", "abtaken" */
  const fire=(X,Y,ev,info={})=>{
    for(const r of X.ramps){ const e=r.e; if(e.on!==ev&&!(e.refresh===ev&&r.n>0)) continue;
      if(e.on!==ev){ r.until=t+e.dur; continue; }
      if(e.cd&&t<(X.ecd[e.i]||0)) continue; if(e.cd) X.ecd[e.i]=t+e.cd;
      if(r.until<t) r.n=0; r.n=Math.min(e.max,r.n+(e.per?fval(e.per,X.c):1)); r.until=t+e.dur; X.tag(e.label,0); }
    if(ev==="hit"||(ev==="aa"&&X.bleedFx.some(e=>e.on==="aa"))) for(const e of X.bleedFx) if(e.on===ev||(e.on==="hit"&&ev==="hit")){
      const b=Y.bleeds[e.id]||(Y.bleeds[e.id]={n:0,until:0,from:X,e}); if(b.until<t) b.n=0;
      b.n = X.has("noxMight") ? e.max : Math.min(e.max,b.n+1); b.until=t+e.dur; b.per=fval(e.v,X.c);
      X.tag(e.label,0); if(b.n>=e.max) fire(X,Y,"bleed5"); }
    const L=X.trig[ev]; if(!L) return;
    for(const e of L){
      if(e.on.includes(":")&&e.on.split(":")[1]!==info.slot) continue;
      if(e.first&&X.used[e.i]) continue;
      if(e.need&&!e.need(X.c)) continue;
      if(e.after){ if(!X.flags[e.after+"#"+e.i]) continue; }
      if(e.on==="low"&&X.hp>=e.th*X.max) continue;
      if(e.only&&ev==="taken"&&info.type!==e.only) continue;
      let charged=false;
      if(e.cd&&t<(X.ecd[e.i]||0)){ if(e.charge&&X.charges[e.charge]>0){ X.charges[e.charge]--; charged=true; } else continue; }
      if(e.every){ X.cnt[e.i]=(X.cnt[e.i]||0)+1; if(!(e.firstToo&&X.cnt[e.i]===1)&&X.cnt[e.i]%e.every!==0) continue; }
      if(e.skip){ X.cnt["s"+e.i]=(X.cnt["s"+e.i]||0)+1; if(X.cnt["s"+e.i]<=e.skip) continue; }
      X.used[e.i]=true; if(e.cd&&!charged) X.ecd[e.i]=t+fval(e.cd,X.c); if(e.after) X.flags[e.after+"#"+e.i]=false;
      if(e.consume){ const r=X.ramps.find(r=>r.e.id===e.consume); if(r) r.n=e.consume==="runic"?Math.max(0,r.n-1):0; }
      let dmg=0;
      if(e.t&&e.v){ let a=fval(e.v,X.c); if(e.crit) a*=1+X.L.crit*(X.s.critMul-1);
        if(e.delay) X.pend.push({at:t+e.delay, f:()=>deal(X,Y,a,e.t,"fx")}); else dmg=deal(X,Y,a,e.t,ev==="aa"?"oh":"fx")||0; }
      if(e.healPct&&dmg>0){ let h=dmg*fval(e.healPct,X.c); if(e.healCap) h=Math.min(h,fval(e.healCap,X.c)); heal(X,h); }
      if(e.healOfLast&&info.dmg>0) heal(X,info.dmg*fval(e.healOfLast,X.c));
      if(e.healOfThis&&dmg>0) heal(X,dmg*e.healOfThis);
      if(e.heal){ const h=fval(e.heal,X.c); if(e.hot) X.hots.push({rate:h/e.hot, from:t+(e.delay||0), until:t+(e.delay||0)+e.hot}); else if(e.delay) X.pend.push({at:t+e.delay,f:()=>heal(X,h)}); else heal(X,h); }
      if(e.sh) addShield(X,fval(e.sh,X.c),e.dur,{decay:e.decay,only:e.shOnly||e.only});
      if(e.buff) addBuff(X,e.buff);
      if(e.dot) applyDot(X,Y,e.dot,(X===A?"a":"b")+e.i);
      if(e.cc) applyCC(X,Y,fval(e.cc,X.c));
      if(e.shred){ const k=e.shred.st; Y.shred[k]={v:Math.max(shredOf(Y,k),e.shred.v),until:t+e.shred.dur,n:1}; }
      if(e.lock) X.lock=Math.max(X.lock,t+e.lock);
      if(e.inv) X.inv=Math.max(X.inv,t+e.inv);
      if(e.charges) X.charges[e.charges.id]=(X.charges[e.charges.id]||0)+e.charges.n;
      if(e.cdr) X.abs.forEach((a,k)=>{ if(a.slot!=="4") X.cds[k]*=1-e.cdr; });
      if(e.onhitAgain&&!info.again) onhits(X,Y,{again:true});
      X.tag(e.label, e.t||e.heal||e.sh||e.cc||e.dot?1:0);
    } };
  /* Saldırı başı tekrar uygulanan isabet etkileri (Çifte Vuruş, Hayalet Vuruş) */
  const onhits=(X,Y,info)=>{ for(const e of (X.trig.aa||[])) if(e.t&&e.v&&!e.every&&!e.cd&&!e.first&&!e.after&&!e.need){ let a=fval(e.v,X.c); deal(X,Y,a,e.t,"oh"); } };
  const targetable=Y=>!(t<Y.inv||t<Y.untarg);
  const rawOf=(X,x)=>x.dv?x.dv(X.c):x.raw;
  let dist=0;
  const inRg=r=>dist<=r+25;
  const log=(X,txt)=>{ if(X.ev.length<12) X.ev.push([t,txt]); };
  const LET={"1":"Q","2":"W","3":"E","4":"R"};
  const mobile=Y=>Y.abs.some((y,k)=>(y.mv==="d"||y.mv==="b")&&Y.cds[k]<=0)||Y.sp.some(p=>p.k==="Flash"&&t>=p.ready);
  /* Beceri atışı isabeti (deterministik): yön atışı %75, alan atışı %85; rakibin hazır atılma/Sıçra'sı varsa −15 puan,
     dibindeyse (≤200) +15, sabitlenmişse kesin. Birikimli sayaçla: beklenen isabet oranı korunur, rastgelelik yok. */
  const hits=(X,Y,x)=>{ if(x.tg!=="D"&&x.tg!=="L") return true;
    if(t<Y.stunUntil||t<Y.rootUntil) return true;
    let p=x.tg==="D"?.75:.85; if(mobile(Y)) p-=.15; if(dist<=200) p+=.15; p=Math.min(1,p);
    X.acc+=p; if(X.acc>=1){ X.acc-=1; return true; } X.miss++; return false; };
  const ranged=X=>X.rng>=300;
  const canAct=X=>!(X.dead&&X.deadAt!==t)&&t>=X.lock&&t>=X.stunUntil&&!(t<X.reviveAt)&&!X.zombieAt;
  /* Kombo sırayla atılır: en fazla 0,25 sn'de bir yetenek */
  const plan=(X,Y)=>{ const out=[]; if(!canAct(X)||t<X.silUntil||t<X.gcd) return out; const tg=targetable(Y);
    if(t-X.flashT<.4&&X.flashAb>=0&&X.cds[X.flashAb]<=0&&inRg(X.abs[X.flashAb].rg)) return [X.flashAb];
    X.abs.forEach((x,i)=>{ if(out.length||X.cds[i]>0||x.use==="never"||x.use==="react") return;
      const dmgy=x.raw>0||x.dv||x.cc;
      if(x.mv==="d"||x.mv==="b"){
        if(ranged(X)&&!ranged(Y)&&dist<X.rng*.5){ out.push(i); return; }                       // kaçış
        if(!ranged(X)&&dist>X.rng+25){ if(dist<=x.rg+X.rng&&tg) out.push(i); return; }       // açığı kapatma
        if(dmgy&&inRg(x.rg)&&tg) out.push(i); return; }
      if(x.use&&x.use.startsWith("low:")){ if(X.hp<+x.use.slice(4)*X.max&&!Y.dead) out.push(i); return; }
      if(dmgy&&!inRg(x.rg)) return;
      if(!dmgy&&!x.use&&dist>X.rng+400) return;
      if(x.use&&x.use.startsWith("low:")){ if(X.hp<+x.use.slice(4)*X.max&&!Y.dead) out.push(i); return; }
      if(x.use==="exec"){ if(tg&&(rawOf(X,x)*resist(X,Y,x.type)>=Y.hp+Y.shTotal()||Y.hp<.12*Y.max)) out.push(i); return; }
      if(x.use==="grit"){ if(X.grit>=.25*X.max||X.hp<.3*X.max) out.push(i); return; }
      if(!tg&&(x.raw>0||x.dv||x.cc)) return;
      out.push(i); });
    return out; };
  const react=(X,Y,yPlan)=>{ if(!canAct(X)||t<X.silUntil) return [];
    /* tepki: sert kitle kontrolüne ya da canının %15'inden fazlasını alacak yeteneğe karşı, ya da can azken */
    const threat=yPlan.some(i=>{ const y=Y.abs[i]; return (y.cc&&y.cc.k==="hard"&&t>=Y.ccReady[i])||rawOf(Y,y)*resist(Y,X,y.type)>=.15*X.max; })||(X.hp<.3*X.max&&t-X.lastHit<.5);
    if(!threat) return [];
    const i=X.abs.findIndex((x,k)=>x.use==="react"&&X.cds[k]<=0); return i>=0?[i]:[]; };
  const cast=(X,Y,i)=>{ if(X.dead&&X.deadAt!==t) return; const x=X.abs[i]; X.cds[i]=x.cd; X.gcd=t+.25;
    (X.trig.aa||[]).concat(X.trig.hit||[]).forEach(e=>{ if(e.after==="cast"||e.after==="cast:"+x.slot) X.flags[e.after+"#"+e.i]=true; });
    if(x.dodge){ const g=x.dodge; if(g.aaOnly) X.aaDodge=t+g.dur; else X.untarg=t+g.dur; if(g.inv) X.inv=t+g.dur; if(g.parry) X.parry=true;
      if(g.lock) X.lock=t+g.lock; if(g.dr) addBuff(X,{st:{dr:g.dr},dur:g.dur}); X.tag(g.name); }
    if(X.flow&&X.flow.rearm==="cast:"+x.slot) X.flowReady=true;
    if(x.mv==="d"||x.mv==="b"){ const d0=dist;
      if(ranged(X)&&!ranged(Y)&&dist<X.rng*.5){ dist+=x.rg; log(X,LET[x.slot]+" ile uzaklaştı"); }
      else if(dist>X.rng+25){ dist=Math.max(dist-x.rg,Math.min(dist,X.rng*.8)); if(d0-dist>150) log(X,LET[x.slot]+" ile atılıp yaklaştı"); } }
    const reach=x.mv==="d"||x.mv==="b" ? Math.max(x.rg,X.rng) : x.rg;
    let dmg=0, blocked=false; const raw=rawOf(X,x);
    const landed = (raw>0||x.cc||x.mv==="p"||x.mv==="k") ? inRg(reach)&&hits(X,Y,x) : true;
    if(!landed) blocked=true;
    if(!blocked){
    if(raw>0&&x.over){ if(!targetable(Y)) blocked=true; else { Y.dots["ab"+(X===A?"a":"b")+i]={from:X, t:x.type, dps:raw/x.over, until:t+x.over}; dmg=raw*resist(X,Y,x.type); } }
    else if(raw>0){ const r=deal(X,Y,raw,x.type,"ab"); if(r===null) blocked=true; else dmg=r; } }
    if(!blocked&&targetable(Y)){
      if(x.mv==="p"&&dist>X.rng){ dist=Math.max(100,Math.min(dist,X.rng)); log(X,(t-X.flashT<1?"Sıçra + ":"")+LET[x.slot]+" ile çekti"); }
      if(x.mv==="k"){ dist+=300; log(X,LET[x.slot]+" ile itti"); }
      if(x.sl){ Y.slowV=Math.max(t<Y.slowUntil?Y.slowV:0,x.sl[0]/100); Y.slowUntil=Math.max(Y.slowUntil,t+x.sl[1]); } }
    if(x.slot==="2"&&X.gritFx){ addShield(X,X.grit,3,{decay:true}); X.grit=0; }
    if(x.sh) addShield(X,x.sh.amt,x.sh.dur);
    if(x.cc&&!blocked&&t>=X.ccReady[i]){ applyCC(X,Y,[x.cc.k,x.cc.dur]); X.ccReady[i]=t+Math.max(6,x.cd); }
    if(x.lockAA) X.aaLock=t+x.lockAA;
    if(x.bf) addBuff(X,{st:x.bf.st,dur:x.bf.dur});
    fire(X,Y,"cast",{slot:x.slot,dmg});
    if(dmg>0){ fire(X,Y,"abhit",{slot:x.slot,dmg}); fire(X,Y,"hit",{slot:x.slot,dmg}); fire(Y,X,"abtaken"); } };
  const attack=(X,Y)=>{ if(X.aaT>0||!canAct(X)||t<X.aaLock||!targetable(Y)||Y.dead||!inRg(X.rng)) return;
    const L=X.L, cm=X.s.ashe?1:1+L.crit*(X.s.critMul-1); let mul=1; for(const e of X.aamul) mul*=fval(e.v,X.c);
    const d=deal(X,Y,L.ad*cm*mul,"P","aa",{critShare:X.s.ashe?0:L.crit*X.s.critMul/cm});
    X.aaN++; const sett=X.trig.aa&&X.trig.aa.some(e=>e.fast);
    X.aaT = sett&&X.aaN%2===1 ? 1/(8*L.as) : 1/L.as;
    X.windUntil=t+.25/L.as;   // saldırı hazırlığı: saldırı süresinin %25'i (varsayım), bu sırada yürünmez
    if(d!==null){ fire(X,Y,"aa",{dmg:d}); fire(X,Y,"hit",{dmg:d}); }
    X.buffs.forEach(b=>{ if(b.hits&&b.until>t&&--b.hits<=0) b.until=t; });
    if(d===null) return;
    for(const e of Y.reflect){ deal(Y,X,fval(e.v,Y.c),e.t,"fx"); Y.tag(e.label); }
    for(const e of Y.gw) if(e.taken){ X.gwV=Math.max(t<X.gwUntil?X.gwV:0,e.v); X.gwUntil=t+3; } };
  /* Her adımın başında: süreli hasarlar, alanlar, iyileşmeler, ertelenmiş hasar, zamanlı etkiler */
  const upkeep=(X,Y)=>{
    if(X.reviveAt&&t>=X.reviveAt){ X.reviveAt=0; X.hp=Math.min(X.max,X.reviveHP); }
    if(X.zombieAt&&t>=X.zombieAt){ deal(X,Y,fval(X.zombie.v,X.c),X.zombie.t,"fx"); X.zombieAt=0; X.dead=true; X.deadAt=t; X.hp=0; return; }
    if(X.dead) return;
    for(const k of Object.keys(X.dots)){ const d=X.dots[k]; if(!d) continue; if(d.until<=t){ delete X.dots[k]; continue; } deal(d.from,X,d.dps*dt,d.t,"dot"); }
    for(const k in X.bleeds){ const b=X.bleeds[k]; if(b.until<=t||!b.n) continue; deal(b.from,X,b.n*b.per/b.e.dur*dt,b.e.t,"dot"); }
    for(const q of X.delayQ){ if(q.left<=0) continue; const a=Math.min(q.left,q.rate*dt); q.left-=a; deal(q.from,X,a,"T","dd"); }
    if(X.delayQ.length>40) X.delayQ=X.delayQ.filter(q=>q.left>0);
    for(const e of X.aura) if(!e.need||e.need(X.c)){ deal(X,Y,fval(e.v,X.c)*dt,e.t,"aura"); }
    let rg=X.L.regen; for(const e of X.regen) rg+=fval(e.v,X.c); if(rg>0) heal(X,rg*dt);
    X.hots=X.hots.filter(h=>h.until>t); for(const h of X.hots) if(!(h.from>t)) heal(X,h.rate*dt);
    for(const p of X.pend) if(p.at<=t&&!p.done){ p.done=true; p.f(); } if(X.pend.length>20) X.pend=X.pend.filter(p=>!p.done);
    for(const e of X.timed) if(t>=e.at&&!X.used["tm"+e.i]){ X.used["tm"+e.i]=true; addBuff(X,e.buff); X.tag(e.label); }
    for(const s of X.shields) if(s.decay) s.amt-=s.decay*dt;
    if(X.gritFx&&t-X.gritT>4) X.grit*=1-.3*dt;
    if(X.trig.low) fire(X,Y,"low");
    if(X.trig.tick&&targetable(Y)) fire(X,Y,"tick"); };
  /* Çağırıcı büyüleri — basit kurallar:
     Sıçra: yakın dövüşçü, hazır sert KK/çekme yeteneğinin menzili + 400 içindeyse ya da rakip %25 canın altındaysa saldırmak için;
            uzak menzilli, canı %25'in altındayken yakın dövüşçüden kaçmak için. Tutuştur: rakip %50 canın altında, 600 menzilde.
     Bitkinlik: rakip seni vurabiliyor ve canın %60'ın altında. Şifa / Bariyer: canın %30'un altında. Hayalet: kovalarken ya da kaçarken.
     Arındır: en az 0,75 sn'lik sersemletme ya da kökte. Çarp: şampiyonlara etkisi yok. */
  const spells=(X,Y)=>{ if(X.dead||!X.sp.length||t<X.reviveAt||X.zombieAt) return; const stun=t<X.stunUntil||t<X.silUntil||t<X.lock;
    for(const p of X.sp){ if(t<p.ready) continue; const c=X.c, use=()=>{ p.ready=t+p.cd; X.tag("Büyü: "+p.tr); };
      switch(p.k){
      case "Flash": { if(stun) break;
        if(!ranged(X)&&targetable(Y)&&dist>X.rng+25){ const i=X.abs.findIndex((x,k)=>X.cds[k]<=0&&(x.mv==="p"||(x.cc&&x.cc.k==="hard"))&&dist>x.rg+25&&dist<=x.rg+p.rg);
          if(i>=0||(Y.hp<.25*Y.max&&dist<=X.rng+p.rg)){ dist=Math.max(X.rng*.8,dist-p.rg); X.flashT=t; X.flashAb=i; use(); log(X,"Sıçra ile yaklaştı"); } }
        else if(ranged(X)&&!ranged(Y)&&X.hp<.25*X.max&&dist<Y.rng+150){ dist+=p.rg; use(); log(X,"Sıçra ile kaçtı"); } break; }
      case "Ignite": if(dist<=p.rg&&targetable(Y)&&Y.hp<.5*Y.max){ Y.dots["ign"+(X===A?"a":"b")]={from:X,t:"T",dps:fval(p.v,c)/p.dur,until:t+p.dur}; Y.gwV=Math.max(Y.gwV,p.gw); Y.gwUntil=Math.max(Y.gwUntil,t+p.dur); use(); log(X,"Tutuştur"); } break;
      case "Exhaust": if(dist<=p.rg&&targetable(Y)&&dist<=Y.rng+50&&X.hp<.6*X.max){ addBuff(Y,{st:{dmgOut:1-p.red},dur:p.dur}); Y.slowV=Math.max(Y.slowV,p.slow); Y.slowUntil=t+p.dur; use(); log(X,"Bitkinlik"); } break;
      case "Heal": if(X.hp<.3*X.max){ heal(X,fval(p.v,c)); addBuff(X,{st:{ms:p.ms},dur:p.msDur}); use(); log(X,"Şifa"); } break;
      case "Barrier": if(X.hp<.3*X.max){ addShield(X,fval(p.v,c),p.dur); use(); log(X,"Bariyer"); } break;
      case "Ghost": if(!stun&&((!ranged(X)&&dist>X.rng+150)||(ranged(X)&&!ranged(Y)&&dist<X.rng*.6))){ addBuff(X,{st:{ms:p.ms},dur:p.dur}); use(); log(X,"Hayalet"); } break;
      case "Cleanse": if(X.stunUntil-t>=.75||X.rootUntil-t>=.75){ X.stunUntil=X.rootUntil=X.silUntil=t; addBuff(X,{id:"ccimm",st:{},dur:p.imm}); use(); log(X,"Arındır"); } break;
      } } };
  /* Hareket: 1 boyutlu mesafe. Uzak menzilli rakibinden uzun menzilliyse saldırılar arasında geri çekilir (kaçarak vurma);
     saldırı hazırlığında, sersemlemiş, köklenmiş ya da kanal açarken yürünmez. Diğerleri kendi menziline girene kadar yaklaşır. */
  const vel=(X,Y)=>{ if(X.dead||t<X.stunUntil||t<X.rootUntil||t<X.lock||t<X.windUntil||t<X.reviveAt||X.zombieAt) return 0;
    const ms=X.L.ms;
    if(ranged(X)&&X.rng>Y.rng+50){ if(dist>X.rng) return -ms; if(X.aaT>dt&&dist<X.rng-10) return ms; return 0; }
    return dist>X.rng ? -ms : 0; };
  dist=Math.max(500,Math.max(A.rng,B.rng)+100);
  fire(A,B,"start"); fire(B,A,"start");
  /* Eski yöntem: ayrıştırılan doğuştan kalkan (mekanik dosyasında tanımlı değilse) */
  for(const [X,f] of [[A,me],[B,en]]){ const fx=MX.fix[f.c.slug]||{}; const inn=(AB[f.c.slug]||{}).i;
    if(inn&&inn.sh&&fx.i!==null) { addShield(X,(inn.sh[1].mhp||0)/100*X.s.hp+(inn.sh[1].bhp||0)/100*X.s.bhp+atRank(inn.sh[0].r||[0],1),inn.sh[2]||99); X.tag("Doğuştan kalkan (pasif)",0); } }
  while(t<T && !A.dead && !B.dead){
    A.L=live(A,B); B.L=live(B,A);
    upkeep(A,B); upkeep(B,A);
    if(!A.dead&&!B.dead){
      spells(A,B); spells(B,A);
      const pa=plan(A,B), pb=plan(B,A), ra=react(A,B,pb), rb=react(B,A,pa);
      ra.forEach(i=>cast(A,B,i)); rb.forEach(i=>cast(B,A,i));
      pa.forEach(i=>cast(A,B,i)); pb.forEach(i=>cast(B,A,i));
      attack(A,B); attack(B,A);
      dist=Math.max(50,dist+(vel(A,B)+vel(B,A))*dt);
    }
    for(const X of [A,B]){ for(let i=0;i<X.cds.length;i++) X.cds[i]-=dt; X.aaT-=dt; }
    t+=dt; step++;
    if(step%4===0) tl.push([t, Math.max(0,A.hp/A.max), Math.max(0,B.hp/B.max)]);
  }
  tl.push([t, Math.max(0,A.hp/A.max), Math.max(0,B.hp/B.max)]);
  // 30 sn'de iki taraf da ayaktaysa kalan canı net hasar hızıyla tahmin et (iyileşme düşülür)
  const net = (X,Y) => Math.max(1,(X.dAA+X.dAB-Y.healed*.5)/Math.max(t,dt));
  const ttkMe = B.dead ? t : t + Math.max(0,B.hp)/net(A,B);
  const ttkEn = A.dead ? t : t + Math.max(0,A.hp)/net(B,A);
  const fxList = X => [...X.s.fx, ...Object.entries(X.fx).filter(([k])=>k).map(([k,n])=>n>1?`${k} ×${n}`:k), ...(X.miss?[`Iskalanan beceri atışı ×${X.miss}`]:[])];
  const events = [...A.ev.map(e=>[e[0],"me",e[1]]), ...B.ev.map(e=>[e[0],"en",e[1]])].sort((a,b)=>a[0]-b[0]);
  return {sm, se, A, B, tl, ttkMe, ttkEn, abShareMe: A.dAB/Math.max(1,A.dAA+A.dAB), realMe:A.real, realEn:B.real,
    typeMe:A.byT, typeEn:B.byT, ccMe:A.ccDealt, ccEn:B.ccDealt, shMe:A.absorbed, shEn:B.absorbed, healMe:A.healed, healEn:B.healed, fxMe:fxList(A), fxEn:fxList(B), events, spMe:A.sp.map(p=>p.k), spEn:B.sp.map(p=>p.k)};
}
function simulate(me,en){
  const F=fightSim(me,en); if(!F) return null;
  const {sm,se,ttkMe,ttkEn}=F;
  const r = ttkEn/ttkMe, stat = r/(1+r);
  // koridor eşleşmesi yalnızca iki taraf aynı koridordaysa anlamlı
  const lane = me.role&&me.role===en.role ? me.role : null;
  const e = lane ? edge(me.c,en.c,lane) : null, role = lane || en.role || en.c.main;
  // gerçek maç verisi (koridor eşleşmesi) simülasyondan daha güvenilir: yarı yarıya
  const score = e!=null ? 0.5*stat + 0.5*Math.min(0.95,Math.max(0.05,0.5+e*0.1)) : stat;
  const mainT = WD.champ[me.c.slug].t, enT = WD.champ[en.c.slug].t;
  const passMe = mulOf(sm,se,mainT==="M"?"M":"P"), passEn = mulOf(se,sm,enT==="M"?"M":"P");
  return {...F, score, edge:e, role, passMe, ehpMe: sm.hp/passEn};
}

/* ===================================================================
 *  ITEM KURALLARI — Wild Rift'te birlikte alınamayan itemlar (LoL Wiki "itemlimit" grupları)
 *  Tek çizme · aynı gruptan tek item (zırh delme, can simidi, aktif…) · destek görev itemı
 *  yalnızca destek koridorunda · yalnızca menzilli şampiyonların alabildiği itemlar.
 * =================================================================== */
const GRP_TR = {"anti-armor":"zırh delme","anti-magic resist":"büyü delme","lifeline":"can simidi","active":"aktif item","spellblade":"Büyülü Kılıç",
  "annul":"büyü kalkanı","immolate":"yakma","thorns":"diken","eternity":"Ebediyet","momentum":"ivme","tear of the goddess":"Gözyaşı","quest":"destek görev"};
const igrp = en => (itemData(en)||{}).g || [];
const isBoot = en => !!en && ((IT[en]&&IT[en].cat==="bot") || ((itemData(en)||{}).m||[]).includes("bot"));
const isQuest = en => igrp(en).includes("quest");
/* null = alınabilir; değilse nedeni */
function blockOf(f, en, slot){
  const others=f.items.filter((x,i)=>x&&i!==slot);
  if(others.includes(en)) return "Zaten takılı";
  if(isBoot(en)&&others.some(isBoot)) return "Yalnızca bir çizme taşınabilir";
  if(isQuest(en)&&f.role!=="sup") return "Yalnızca destek koridorunda alınır";
  if((itemData(en)||{}).ro&&isMelee(f.c.slug)) return "Yalnızca menzilli şampiyonlar alabilir";
  for(const g of igrp(en)){ const x=others.find(o=>igrp(o).includes(g)); if(x) return `${iname(x)} ile birlikte alınamaz (tek ${GRP_TR[g]||g})`; }
  return null;
}
/* Sıralı listeyi kurala uydurur: çakışan itemları atar, çizmeyi son yuvaya koyar */
function arrange(items, c, role){
  const f={c, role, items:[]};
  for(const en of items){ if(!en||!IT[en]) continue; if(!blockOf(f,en,-1)) f.items.push(en); }
  const boot=f.items.find(isBoot), rest=f.items.filter(x=>!isBoot(x)).slice(0, boot?SLOTS-1:SLOTS);
  return boot ? [...rest, boot] : rest;
}

/* ===================================================================
 *  HAZIR BUILDLER — koridora göre
 *  Önerilenler: oyuncu buildleri (CN sunucusu, wildriftcore) + Karma (hasar + dayanıklılık)
 *  + Bu rakibe göre (düello rakibine karşı en çok fark yaratan itemlarla tamamlanır).
 *  En çok kazananlar: en popüler 3 çekirdek, kazanma ve seçilme oranıyla (riftpatchnotes, Elmas+).
 * =================================================================== */
const SLOTS = 6;
const CORES = (window.WR_CORES||{}).c || {};
const ROLE_ORDER = ["top","jg","mid","adc","sup"];
const rolesOf = c => { const b=BUILDS[c.slug]; const have=b?Object.keys(b.r):[c.main]; return [...new Set([...c.roles,...ROLE_ORDER])].filter(r=>have.includes(r)); };
const kindOf = c => { const a=c.arch;
  if(/tank/.test(a)) return "tank";
  if(a==="enchanter"||a==="mage_sup") return "sup";
  if(/^mage|^ap_/.test(a)) return "ap";
  if(/adc/.test(a)) return "adr";
  return "adm"; };
const have = l => l.filter(n=>IT[n]);
/* Karma build için savunma, tank buildi için hasar havuzları */
const DEF_POOL = {
  adm: have(["Sterak's Gage","Death's Dance","Maw of Malmortius","Guardian Angel","Randuin's Omen","Force of Nature","Dead Man's Plate","Amaranth's Twinguard","Kaenic Rookern","Thornmail"]),
  adr: have(["Guardian Angel","Immortal Shieldbow","Mercurial Scimitar","Maw of Malmortius","Death's Dance","Edge of Night"]),
  ap:  have(["Zhonya's Hourglass","Banshee's Veil","Rod of Ages","Riftmaker","Abyssal Mask"]),
};
const DMG_POOL = { AP: have(["Hextech Rocketbelt","Riftmaker","Liandry's Torment","Abyssal Mask","Rod of Ages"]), AD: have(["Black Cleaver","Sundered Sky","Sterak's Gage","Divine Sunderer","Titanic Hydra"]) };
const ANTI_HEAL = new Set(have(["Mortal Reminder","Chempunk Chainsword","Morellonomicon","Thornmail"]));
const ANTI_TANK = new Set(have(["Blade of the Ruined King","Dominik's Regards","Serylda's Grudge","Black Cleaver","Void Staff","Liandry's Torment","Divine Sunderer","Terminus","Cryptbloom","Bloodletter's Curse","Kraken Slayer"]));

function realVariants(c, role){
  const b=BUILDS[c.slug], R=b&&b.r[role]; if(!R) return [];
  return R.v.map(v=>({key:v[0], title:v[1], when:v[3]||[], items:v[2].map(itemOf), boots:R.boots?itemOf(R.boots):null, runes:R.runes||[]}));
}
/* ===== STİLLER — aynı şampiyonun farklı oynanış tarzları =====
 * Bir stil yalnızca gerçekten oynanıyorsa açılır: şampiyonun kendi arketipi, oyuncu buildlerinin
 * ve en çok kazanan çekirdeklerin item türü (%3+ seçilme), yetenek oranları (toplam %150+ AP oranı
 * → büyücü), yakın dövüş + sert kitle kontrolü (→ tank), yakın dövüş fiziksel hasar (→ off-tank).
 * Stil buildi oyuncu verisi yoksa aynı stildeki şampiyonların bu koridordaki gerçek buildlerinden
 * çıkarılır: en sık alınan itemlar, çizme ve rün sayfası. */
const STYLE = {
  tank:{lbl:"Tank",ic:"shield",fam:["tank","tank_jg","tank_sup","ap_tank"],kind:"tank"},
  bruiser:{lbl:"Off-tank",ic:"sword",fam:["bruiser","juggernaut","skirmisher"],kind:"adm"},
  crit:{lbl:"Kritik",ic:"target",fam:["crit_adc","crit_melee","onhit_adc","lethal_adc","caster_adc"],kind:"adr"},
  leth:{lbl:"Suikastçı",ic:"bolt",fam:["ad_assassin"],kind:"adm"},
  ap:{lbl:"Büyücü",ic:"spark",fam:["mage_burst","mage_control","mage_battle","ap_assassin","ap_onhit","mage_sup"],kind:"ap"},
  sup:{lbl:"Koruyucu",ic:"heart",fam:["enchanter"],kind:"sup"},
};
const STY_ORDER = Object.keys(STYLE);
const STY_DESC = {tank:"Can, zırh ve büyü direnci; ön safta kalır, kontrol eder",bruiser:"Hasar + dayanıklılık: hem vurur hem dayanır",crit:"Kritik vuruşla en yüksek sürekli hasar",
  leth:"Zırh delmeyle ani hasar, dayanıklılık az",ap:"Yetenek gücüyle ani büyü hasarı",sup:"Kalkan, iyileştirme ve takım güçlendirme"};
const styleOfArch = a => STY_ORDER.find(k=>STYLE[k].fam.includes(a)) || "bruiser";
const itemKind = en => { const s=itemStats(en);
  if(s.crit) return "crit"; if(s.ap) return "ap";
  if(s.ad) return s.armpenflat&&!s.hp ? "leth" : (s.hp||s.armor||s.mr) ? "bruiser" : "ad";
  return (s.hp||s.armor||s.mr) ? "tank" : null; };
function listStyle(items){
  const n={}; items.filter(x=>x&&!isBoot(x)).forEach(x=>{ const k=itemKind(x); if(k) n[k]=(n[k]||0)+1; });
  if((n.ap||0)>=2) return "ap"; if((n.crit||0)>=2) return "crit"; if((n.leth||0)>=2) return "leth";
  if((n.tank||0)>=3&&(n.ad||0)+(n.bruiser||0)<=1) return "tank";
  if((n.bruiser||0)+(n.ad||0)>=2) return "bruiser";
  return (n.tank||0)>=2 ? "tank" : null;
}
function abilSums(slug){
  const A=AB[slug]||{}; let ap=0, cc=false;
  ["1","2","3","4"].forEach(k=>{ const a=A[k]; if(!a) return; (a.d||[]).forEach(d=>{ if(d[1]==="M"&&d[2]) ap+=d[2].ap||0; }); if(a.cc&&a.cc[0]==="hard") cc=true; });
  return {ap, cc};
}
const STY_CACHE = {};
function stylesOf(c, role){
  const k=c.slug+"|"+role; if(STY_CACHE[k]) return STY_CACHE[k];
  const own=styleOfArch(c.arch), melee=isMelee(c.slug), S=new Set([own]);
  const fix=s=>!s?null:s==="ap"&&own==="sup"?"sup":!melee&&(s==="bruiser"||s==="tank")?own:s;
  realVariants(c,role).forEach(v=>{ const s=fix(listStyle(v.items)); if(s) S.add(s); });
  // en çok kazanan çekirdekler: bu koridordakiler her stili açar; diğer koridorlardakiler yalnızca tank/büyücü (ör. AP Malphite)
  Object.entries(CORES[c.slug]||{}).forEach(([r,R])=>R.c.forEach(x=>{ if(x[2]>=3){ const s=fix(listStyle(x[0].map(itemOf))); if(s&&(r===role||s==="ap"||s==="tank")) S.add(s); } }));
  const {ap,cc}=abilSums(c.slug);
  if(ap>=150&&own!=="sup"&&own!=="tank") S.add("ap");
  if(melee&&c.dmg!=="AP"&&["crit","bruiser","tank"].includes(own)) S.add("bruiser");
  if(melee&&(["bruiser","tank"].includes(own)||(own==="crit"&&cc))) S.add("tank");
  if(role==="sup") ["crit","leth","bruiser"].forEach(s=>{ if(s!==own) S.delete(s); });
  else if(own!=="sup") S.delete("sup");
  return STY_CACHE[k]=[own,...STY_ORDER.filter(s=>s!==own&&S.has(s))];
}
/* Stil şablonu: aynı stildeki şampiyonların gerçek buildlerinden en sık itemlar, çizme, rün sayfası */
const TPL = {};
const KS_OK = {tank:["Grasp of the Undying","Ice Tyrant","Guardian","Aftershock"], bruiser:["Conqueror","Grasp of the Undying","Phase Rush","Fleet Footwork","Lethal Tempo"],
  crit:["Lethal Tempo","Fleet Footwork","Conqueror","First Strike","Empowerment"], leth:["Electrocute","First Strike","Dark Harvest","Conqueror","Phase Rush"],
  ap:["Electrocute","Arcane Comet","First Strike","Dark Harvest","Phase Rush","Summon Aery","Empowerment"], sup:null};
/* Başka stilden gelen şampiyon için (ör. tank Malphite → büyücü) şablon o stilin "saf" ailesinden çıkarılır */
const CORE_FAM = {ap:{sup:["mage_sup"],x:["mage_burst"]}, tank:{sup:["tank_sup"],jg:["tank_jg","tank"],x:["tank"]}, bruiser:{x:["bruiser","juggernaut"]},
  crit:{x:["crit_adc"],m:["crit_melee"]}, leth:{x:["ad_assassin"]}};
function tplOf(style, role, melee, pure){
  const k=style+"|"+role+"|"+melee+"|"+!!pure; if(TPL[k]) return TPL[k];
  const cf=CORE_FAM[style], fams=pure&&cf ? (melee&&cf.m) || cf[role] || cf.x : null;
  const gather=(rs,mOnly)=>{ const it={}, bo={}, ru={}; let n=0;
    LIST.forEach(c=>{ if(styleOfArch(c.arch)!==style||(fams&&!fams.includes(c.arch))||(mOnly&&isMelee(c.slug)!==melee)) return; const b=BUILDS[c.slug]; if(!b) return;
      rs.forEach(r=>{ const R=b.r[r]; if(!R) return; n++;
        R.v.forEach((v,i)=>v[2].forEach((x,j)=>{ const en=itemOf(x); if(!IT[en]||isBoot(en)) return; it[en]=(it[en]||0)+(i?1:2)*(1.5-j*0.1); }));
        if(R.boots){ const bb=itemOf(R.boots); bo[bb]=(bo[bb]||0)+1; }
        if(R.runes&&R.runes.length){ const rk=R.runes.join("|"); ru[rk]=(ru[rk]||0)+1; } }); });
    return {n,it,bo,ru}; };
  const all=role==="sup"?["sup"]:ROLE_ORDER.filter(r=>r!=="sup");
  let d=gather([role],true); if(d.n<3) d=gather([role],false); if(d.n<3) d=gather(all,true); if(d.n<3) d=gather(all,false);
  const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  // rün sayfası stile uygun ana rünle olmalı (ör. tank → Ölümsüzün Pençesi; büyücü rünü değil)
  const ks=KS_OK[style], okRune=rk=>!ks||ks.includes(rk.split("|")[0]);
  let page=top(d.ru).find(okRune); if(!page) page=top(gather(ROLE_ORDER,false).ru).find(okRune);
  // büyücü stilinde iyileştirme/kalkan (koruyucu destek) itemları alınmaz
  const okItem=en=>(role==="sup"||!isQuest(en))&&!(style==="ap"&&(itemStats(en).hsp||0)>0);
  return TPL[k]={items:top(d.it).filter(okItem), boots:top(d.bo)[0]||null, runes:(page||"").split("|").filter(Boolean)};
}
/* Karşı takıma göre savunma eşleri: [büyü hasarına karşı, fiziksel hasara karşı] */
const DEF_SWAP = [["Force of Nature","Dead Man's Plate"],["Kaenic Rookern","Randuin's Omen"],["Abyssal Mask","Frozen Heart"],["Maw of Malmortius","Death's Dance"],
  ["Banshee's Veil","Zhonya's Hourglass"],["Mercurial Scimitar","Guardian Angel"],["Mercury's Treads","Plated Steelcaps"]].filter(p=>IT[p[0]]&&IT[p[1]]);
const ARMOR_TANK = have(["Randuin's Omen","Dead Man's Plate","Frozen Heart","Thornmail","Iceborn Gauntlet","Sunfire Aegis"]);
const MR_TANK = have(["Force of Nature","Kaenic Rookern","Abyssal Mask"]);
/* team: "AD" | "AP" | "mix" — buildin savunma itemlarını karşı takımın hasar türüne çevirir */
function swapDef(items, team, c, role){
  if(team!=="AD"&&team!=="AP") return items;
  const from=team==="AD"?0:1, to=1-from, out=[...items];
  // değişim yalnızca kurala uyuyorsa yapılır (aynı gruptan item varsa eski item kalır)
  const ok=(i,en)=>!blockOf({c,role,items:out.map((x,j)=>j===i?null:x)},en,-1);
  out.forEach((en,i)=>{ const p=DEF_SWAP.find(x=>x[from]===en); if(p&&!out.includes(p[to])&&ok(i,p[to])) out[i]=p[to]; });
  // eşi zaten buildde olan saf tank itemları: aynı türdeki başka bir tank itemına çevrilir
  const need=team==="AD"?"armor":"mr", drop=team==="AD"?"mr":"armor", alt=team==="AD"?ARMOR_TANK:MR_TANK;
  out.forEach((en,i)=>{ const x=itemStats(en); if(isBoot(en)||itemKind(en)!=="tank"||!(x[drop]>0)||x[need]>0) return;
    const r=alt.find(a=>!out.includes(a)&&ok(i,a)); if(r) out[i]=r; });
  return arrange(out, c, role);
}
/* Stil buildi: şablondaki en sık itemlar kurala uyarak sırayla; "AD"/"AP" sürümünde savunma o türe çevrilir */
/* Stile göre item türü sınırları: tankta hasar itemı yok, büyücüde fiziksel item yok… */
const KIND_CAP = {tank:{tank:5,sup:5}, bruiser:{bruiser:5,ad:3,tank:2}, crit:{crit:5,ad:3,bruiser:1}, leth:{leth:5,ad:3,bruiser:1}, ap:{ap:5,tank:1}, sup:null};
function styleItems(c, role, style, team){
  const pure=style!==styleOfArch(c.arch), T=tplOf(style, role, isMelee(c.slug), pure), f={c, role, items:[]}, cap=KIND_CAP[style], n={};
  for(const en of T.items){ if(f.items.length>=SLOTS-1) break; if(blockOf(f,en,-1)) continue;
    const k=isQuest(en)?"sup":itemKind(en)||"tank"; if(cap&&(n[k]||0)>=(cap[k]||0)) continue; n[k]=(n[k]||0)+1; f.items.push(en); }
  let boots=T.boots; if(style==="tank"||style==="bruiser"){ if(team==="AD") boots="Plated Steelcaps"; if(team==="AP") boots="Mercury's Treads"; }
  return ensureDef(arrange([...f.items, boots], c, role), team, c, role, style);
}
/* Karşı takıma göre savunma: önce eşini koy (Doğanın Kudreti ↔ Ölü Adamın Zırhı…); build o türe karşı
 * hiç savunma taşımıyorsa son itemı stile uygun, o türe karşı en sık alınan savunma itemıyla değiştir */
function ensureDef(items, team, c, role, style){
  if(team!=="AD"&&team!=="AP") return items;
  items=swapDef(items, team, c, role);
  const need=team==="AD"?"armor":"mr";
  if(items.some(en=>!isBoot(en)&&(itemStats(en)[need]||0)>0)) return items;
  const st=STYLE[style]?style:styleOfArch(c.arch), T=tplOf(st, role, isMelee(c.slug), st!==styleOfArch(c.arch));
  const pool=[...(DEF_POOL[STYLE[st].kind]||DEF_POOL.adm), ...T.items].filter(en=>(itemStats(en)[need]||0)>0&&!items.includes(en)&&itemFits(en,st));
  const rest=items.filter(x=>!isBoot(x)), boot=items.find(isBoot);
  for(const en of pool){ const t=[...rest.slice(0,-1), en]; if(arrange(t,c,role).length===t.length) return arrange([...t,boot],c,role); }
  return items;
}
/* Bir fighter'ı rakibe karşı dener: item listesinin kazancı (0–1 ölçeğinde) */
const trial = (f, items, o) => { const t={...f, items:[...items,...Array(SLOTS).fill(null)].slice(0,SLOTS)}; const r=f.side==="en"?simulate(o,t):simulate(t,o); return r ? (f.side==="en"?1-r.score:r.score) : 0; };
/* Boş yuvaları havuzdan, rakibe karşı en iyi sonucu veren yasal itemlarla doldurur */
function greedyFill(f, base, pool, o, upto){
  let items=[...base];
  while(items.filter(x=>!isBoot(x)).length<upto){
    let best=null, bv=-1;
    for(const en of pool){ if(isBoot(en)||blockOf({...f,items},en,-1)) continue; const v=trial(f,[...items,en],o); if(v>bv){bv=v;best=en;} }
    if(!best) break; items.push(best);
  }
  return items;
}
/* Koridor için hazır buildler: [{id, tab:"rec"|"top", style, lbl, sub, items|gen, runes}] */
const PRE_CACHE = {};
function presetsFor(c, role){
  const ck=c.slug+"|"+role; if(PRE_CACHE[ck]) return PRE_CACHE[ck];
  const out=[], V=realVariants(c,role), styles=stylesOf(c,role), own=styles[0], melee=isMelee(c.slug);
  const C=(CORES[c.slug]||{})[role]||{c:[],b:[],r:[]};
  // riftpatchnotes rün sayfaları (en popüler + alternatif): stile uyan ana rünlü olan seçilir
  const RP=C.r||[];
  const pageFor = st => RP.find(pg=>{ const ks=KS_OK[st]; return !ks||ks.includes(runeKey(pg[0][0])); });
  const pageSrc = pg => pg ? `rün sayfası %${dec1(pg[1])} kazanma · %${dec1(pg[2])} seçilme` : null;
  const spare=V.flatMap(v=>v.items);
  // wildriftcore build motoru varyantları (koşullu öneriler: tanklara karşı, AD takıma karşı…)
  const real=V.map((v,i)=>{ const m=VAR[v.key]||["wand",v.title];
    const items=arrange([...v.items,...spare.filter(x=>!v.items.includes(x))],c,role).filter(x=>!isBoot(x)).slice(0,SLOTS-1);
    const fixed=v.items.some(x=>!items.includes(x)), st=listStyle(items);
    return {id:"v"+i, key:v.key, tab:"rec", style: st&&styles.includes(st) ? st : (st==="ap"&&own==="sup" ? "sup" : own), ic:m[0], title:m[1],
      sub:`${m[1]}${v.when.length?" — "+v.when.join(" · "):""}${fixed?" (birlikte alınamayan item değiştirildi)":""}`, items:arrange([...items,v.boots],c,role), runes:v.runes, src:"Önerilen build (wildriftcore)"}; });
  const runesFor = s => { const pg=pageFor(s); return pg ? [pg[0].map(runeKey), pageSrc(pg)] : [(real.find(p=>p.style===s)||{}).runes || tplOf(s,role,melee,s!==own).runes, null]; };
  /* GERÇEK OYUNCU BUILDLERİ: Elmas+ (CN) en popüler 3 çekirdek; 4.–5. item aynı koridordaki diğer
   * çekirdeklerden, önerilen buildlerden ve stilin şablonundan en sık alınanlarla tamamlanır */
  const coreStyle = core => { const st0=listStyle(core); return st0&&STYLE[st0]&&styles.includes(st0==="ap"&&own==="sup"?"sup":st0)&&!(!melee&&(st0==="bruiser"||st0==="tank")) ? (st0==="ap"&&own==="sup"?"sup":st0) : own; };
  const followFor = (core, st) => { const w={}; const add=(en,v)=>{ if(IT[en]&&!core.includes(en)&&!isBoot(en)&&itemFits(en,st)&&(role==="sup"||!isQuest(en))) w[en]=(w[en]||0)+v; };
    C.c.forEach(x=>x[0].map(itemOf).forEach((en,j)=>add(en, x[2]*(1.2-j*0.1))));
    V.forEach(v=>v.items.forEach((en,j)=>add(en, 2.5*(1.2-j*0.1))));
    tplOf(st,role,melee,st!==own).items.slice(0,12).forEach((en,j)=>add(en, 2-j*0.12));
    return Object.entries(w).sort((a,b)=>b[1]-a[1]).map(x=>x[0]); };
  const boot0=C.b&&C.b[0] ? itemOf(C.b[0][0]) : (V[0]&&V[0].boots);
  const bootFor = st => st===own ? boot0 : (tplOf(st,role,melee,true).boots||boot0);
  const coreB=[...C.c].sort((a,b)=>b[2]-a[2]).map(x=>{ const core=x[0].map(itemOf), st=coreStyle(core);
    return {core, st, wr:x[1], pr:x[2], items:arrange([...core,...followFor(core,st),bootFor(st)],c,role)}; });
  const coreSrc="Elmas+ maçlar, CN sunucusu — ilk 3 item gerçek oyuncu verisi, 4.–5. item en sık alınanlardan";
  styles.forEach(s=>{
    let k=0; const mineCore=coreB.filter(b=>b.st===s);
    mineCore.forEach((b,i)=>{ const [runes,runeSrc]=runesFor(s);
      out.push({id:"c"+coreB.indexOf(b), tab:"rec", style:s, lbl:`Build ${++k}`, ic:i?"wand":"users", wr:b.wr, pr:b.pr, core:b.core, title:i?"Alternatif çekirdek":"En popüler çekirdek",
        items:b.items, runes, runeSrc, sub:`${i?"Alternatif":"En popüler"} oyuncu buildi · %${dec1(b.wr)} kazanma · %${dec1(b.pr)} seçilme`, src:coreSrc}); });
    // önerilen build motorunun varyantları: gerçek veri varsa yalnızca koşullu olanlar ("Tanklara karşı"…)
    const mine=real.filter(p=>p.style===s&&(!mineCore.length||p.key!=="standard"));
    mine.forEach(p=>{ p.lbl=mineCore.length ? (VAR[p.key]||["",p.title])[1] : `Build ${++k}`; out.push(p); });
    const VS=[["mix","Standart",STYLE[s].ic],["AD","Fiziksel hasara karşı","sword"],["AP","Büyü hasarına karşı","spark"]];
    const all=out.filter(p=>p.style===s);
    if(all.length===1){ // tek build: savunmasını karşı takıma göre çeviren iki sürüm
      const b=all[0], seen=new Set([b.items.join()]);
      VS.slice(1).forEach(([team,t,icn])=>{ const items=swapDef(b.items,team,c,role); const sig=items.join(); if(seen.has(sig)) return; seen.add(sig);
        out.push({...b, id:`${b.id}:${team}`, lbl:`Build ${++k}`, ic:icn, title:t, items, wr:null, pr:null, sub:`${b.title} — ${t}`}); });
    }
    if(!all.length){
      const T=tplOf(s, role, melee, s!==own), seen=new Set();
      VS.forEach(([team,t,icn])=>{
        const items=styleItems(c, role, s, team); const sig=items.join(); if(items.length<4||seen.has(sig)) return; seen.add(sig);
        const [runes,runeSrc]=runesFor(s);
        out.push({id:`s:${s}:${team}`, tab:"rec", style:s, lbl:`Build ${++k}`, ic:icn, title:t, items, runes:runes||T.runes, runeSrc,
          sub:`${STYLE[s].lbl} — ${t}`, src:`aynı stildeki şampiyonların ${ROLE_LONG[role]||""} buildlerinden`}); });
    }
    const first=out.find(p=>p.style===s);
    if(first&&role!=="sup"&&s!=="sup"){
      const base=first.items.filter(x=>!isBoot(x)), boots=first.items.find(isBoot)||null;
      out.push({id:"hy:"+s, tab:"rec", style:s, lbl:"Karma", ic:"heart", runes:first.runes, sub: s==="tank" ? "Tank + hasar: 3 dayanıklılık itemı, 2 hasar itemı" : "Hasar + dayanıklılık: 3 hasar itemı, 2 savunma itemı", gen:"hy", base, boots, kind:STYLE[s].kind});
      out.push({id:"ct:"+s, tab:"rec", style:s, lbl:"Bu rakibe göre", ic:"target", runes:first.runes, sub:"İlk 2 item stil buildinden; kalanlar bu rakibe karşı en etkili itemlar", gen:"ct", base, boots, kind:STYLE[s].kind});
    }
  });
  // En çok kazananlar: aynı gerçek çekirdekler, kazanma oranına göre
  [...coreB].sort((a,b)=>b.wr-a.wr).forEach((b,i)=>{ const [runes,runeSrc]=runesFor(b.st);
    out.push({id:"t"+i, tab:"top", style:b.st, lbl:`#${i+1}`, ic:"trophy", wr:b.wr, pr:b.pr, core:b.core, runes, runeSrc,
      sub:`${STYLE[b.st]?STYLE[b.st].lbl+" · ":""}%${dec1(b.wr)} kazanma · %${dec1(b.pr)} seçilme (çekirdek: ilk 3 item)`, items:b.items, src:coreSrc}); });
  out.styles=styles.filter(s=>out.some(p=>p.tab==="rec"&&p.style===s));
  if(!out.styles.length) out.styles=[own];
  return PRE_CACHE[ck]=out;
}
/* Arayüzde gösterilen stiller: en az bir buildi olanlar */
const stylesShown = (c, role) => presetsFor(c, role).styles;
const dec1 = v => (+v).toFixed(1).replace(".",",");
/* Üretilen buildlerin (Karma, Bu rakibe göre) itemlarını hesaplar */
function genItems(f, p, o){
  const c=f.c, kind=p.kind||kindOf(c), boots=p.boots;
  if(p.gen==="hy"){
    const dmgType=c.dmg==="AP"||p.style==="ap"?"AP":"AD";
    const pool = kind==="tank" ? DMG_POOL[dmgType] : DEF_POOL[kind]||DEF_POOL.adm;
    return arrange([...greedyFill(f, p.base.slice(0,3), pool, o, 5), boots], c, f.role);
  }
  const pool=[...new Set([...buildPool(c,f.role,p.style), ...(DEF_POOL[kind]||[]), ...(kind==="tank"?DMG_POOL[c.dmg==="AP"?"AP":"AD"]:[])])];
  const items=greedyFill(f, p.base.slice(0,2), pool, o, 5);
  // çizme: build çizmesi ya da rakibin hasar türüne göre savunma çizmesi
  const bc=have([boots,"Plated Steelcaps","Mercury's Treads"].filter(Boolean)); let bb=boots, bv=-1;
  for(const b of bc){ const v=trial(f,[...items,b],o); if(v>bv){bv=v;bb=b;} }
  return arrange([...items,bb], c, f.role);
}
function presetItems(f, id, o){
  const p=presetsFor(f.c,f.role).find(x=>x.id===id); if(!p) return null;
  const items = p.gen ? genItems(f,p,o) : [...p.items];
  return f.side==="me"&&D.team!=="mix" ? ensureDef(items, D.team, f.c, f.role, p.style||f.style) : items;
}
/* Şampiyonun bu koridorda gerçekten alınan itemları (+ seçili stilin şablonu) — seçici ve öneriler için havuz */
function buildPool(c, role, style){
  const b=BUILDS[c.slug]; const s=new Set();
  if(b){ const rs=b.r[role]?[role]:Object.keys(b.r); rs.forEach(r=>{const R=b.r[r]; R.v.forEach(v=>v[2].forEach(x=>s.add(itemOf(x)))); if(R.boots) s.add(itemOf(R.boots));}); (b.sit||[]).forEach(([x])=>s.add(itemOf(x))); }
  ((CORES[c.slug]||{})[role]||{c:[]}).c.forEach(x=>x[0].forEach(k=>s.add(itemOf(k))));
  if(!b){ const a=ARCH[c.arch]; [...(OVERRIDE[c.name]||a.core),...a.late,a.boots].forEach(n=>s.add(n)); }
  if(style&&STYLE[style]){ const T=tplOf(style,role,isMelee(c.slug)); T.items.slice(0,14).forEach(en=>s.add(en)); if(T.boots) s.add(T.boots);
    (DEF_POOL[STYLE[style].kind]||[]).forEach(en=>s.add(en)); }
  return [...s].filter(en=>IT[en]&&(role==="sup"||!isQuest(en))&&(!style||style===styleOfArch(c.arch)||itemFits(en,style)));
}
/* Seçili stile aykırı hasar itemlarını havuzdan çıkarır (ör. büyücü stilde kritik itemı) */
const itemFits = (en, style) => { const k=itemKind(en); if(!k||style==="tank"||style==="sup"||style==="bruiser"&&k==="tank") return true;
  if(k==="tank") return (DEF_POOL[(STYLE[style]||{}).kind]||[]).includes(en);
  return style==="ap" ? k==="ap" : k!=="ap"; };
/* ===================================================================
 *  DÜELLO EKRANI
 * =================================================================== */
const D = { me:null, en:null, lvl:11, prev:null, log:[], team:"mix" };
const dSave = () => { try { const o=f=>f&&{s:f.c.slug,r:f.role,b:f.build,t:f.tab,i:f.items,p:f.sp,y:f.style}; localStorage.setItem("rk-duel2", JSON.stringify({me:o(D.me),en:o(D.en),lvl:D.lvl,team:D.team})); } catch {} };
const SPELL_KEYS = ["Flash","Ignite","Exhaust","Heal","Barrier","Ghost","Cleanse","Smite"];
const okSp = sp => Array.isArray(sp)&&sp.length===2&&sp.every(k=>SPELL_KEYS.includes(k))&&sp[0]!==sp[1];
const SPELL_ROLE2 = {top:"Ignite",mid:"Ignite",adc:"Heal",sup:"Exhaust",jg:"Smite"};
/* Seçili buildin rün sayfası; elle seçilmiş itemlarda stilin rün sayfası */
function runesOf(f){
  const p=f.build&&presetsFor(f.c,f.role).find(x=>x.id===f.build);
  if(p&&p.runes&&p.runes.length) return p.runes;
  const own=presetsFor(f.c,f.role).find(x=>x.style===f.style&&x.runes&&x.runes.length);
  return own ? own.runes : tplOf(f.style||styleOfArch(f.c.arch), f.role, isMelee(f.c.slug)).runes;
}
/* side: "me" | "en"; rol verilmezse ana koridor (rakip için: seninle aynı koridor varsa o) */
function fighter(side, c, o={}){
  const roles=rolesOf(c);
  let role = roles.includes(o.role) ? o.role : (side==="en"&&D.me&&roles.includes(D.me.role) ? D.me.role : roles.includes(c.main) ? c.main : roles[0]);
  const f={side, c, role, tab:o.tab==="top"?"top":"rec", build:o.build||null, style:null, sp: okSp(o.sp)?[...o.sp]:null, items:[], get lvl(){return D.lvl}};
  if(!f.sp){ const b=BUILDS[c.slug]; f.sp = b&&b.sp&&b.sp.length===2 ? [...b.sp] : ["Flash", SPELL_ROLE2[role]||"Ignite"]; if(role!=="jg"&&f.sp.includes("Smite")) f.sp=["Flash",SPELL_ROLE2[role]||"Ignite"]; }
  const P=presetsFor(c,role), styles=stylesShown(c,role);
  f.style = styles.includes(o.style) ? o.style : styles[0];
  if(Array.isArray(o.items)) f.items=[...arrange(o.items,c,role),...Array(SLOTS).fill(null)].slice(0,SLOTS);
  else { if(!P.some(p=>p.id===f.build&&!p.gen)) f.build=(P.find(p=>!p.gen&&p.tab==="rec"&&p.style===f.style)||P.find(p=>!p.gen)||{}).id||null;
    const p=P.find(x=>x.id===f.build); if(p&&p.style) f.style=p.style;
    let items=p?p.items:[]; if(side==="me"&&D.team!=="mix") items=ensureDef(items,D.team,c,role,f.style);
    f.items=[...items,...Array(SLOTS).fill(null)].slice(0,SLOTS); }
  f.rune = runesOf(f)[0];
  return f;
}
const other = side => D[side==="me"?"en":"me"];
function applyPreset(side, id){
  const f=D[side]; const items=presetItems(f,id,other(side)); if(!items) return;
  const p=presetsFor(f.c,f.role).find(x=>x.id===id);
  f.build=id; if(p&&p.style) f.style=p.style; f.items=[...items,...Array(SLOTS).fill(null)].slice(0,SLOTS); f.rune=runesOf(f)[0];
}
function dLoad(){
  try { const s=JSON.parse(localStorage.getItem("rk-duel2")||"null");
    if(s&&["AD","AP","mix"].includes(s.team)) D.team=s.team;
    if(s&&s.me&&BYSLUG[s.me.s]&&s.en&&BYSLUG[s.en.s]){ D.lvl=s.lvl||11;
      D.me=fighter("me",BYSLUG[s.me.s],{role:s.me.r,build:s.me.b,tab:s.me.t,items:s.me.i,sp:s.me.p,style:s.me.y});
      D.en=fighter("en",BYSLUG[s.en.s],{role:s.en.r,build:s.en.b,tab:s.en.t,items:s.en.i,sp:s.en.p,style:s.en.y}); return; } } catch {}
  D.me=fighter("me",BYSLUG.yasuo||LIST[0]); D.en=fighter("en",BYSLUG.malphite||LIST[1]);
}
const verdictTxt = s => s>=0.62?["Sen kazanırsın","good"]:s>=0.54?["Avantaj sende","good"]:s>0.46?["Başa baş","even"]:s>0.38?["Rakip önde","bad"]:["Rakip kazanır","bad"];
const secs = t => t>=60?"60+ sn":(t<10?t.toFixed(1):Math.round(t))+" sn";
const n0 = v => Math.round(v).toLocaleString("tr-TR");

const spellTR = k => (MX.spell&&MX.spell[k]&&MX.spell[k].tr)||k;
const SPELL_INFO = {Flash:"400 birim ışınlanır; kombo için yaklaşma ya da kaçış",Ignite:"5 sn gerçek hasar, %60 Ağır Yara",Exhaust:"2,5 sn: rakibin hasarı −%40, %35 yavaşlama",
  Heal:"Can yeniler, kısa hız",Barrier:"2,5 sn kalkan",Ghost:"8 sn %25 hareket hızı",Cleanse:"Kitle kontrolünü kaldırır, 0,75 sn bağışıklık",Smite:"Şampiyonlara etkisi yok (ormancı)"};
let spSide="me", spIdx=0;
function openSpellPicker(side,idx){
  spSide=side; spIdx=idx; const f=D[side];
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Çağırıcı büyüsü seç">
    <div class="sheet-head"><h3>${side==="me"?"Senin":"Rakibin"} ${idx+1}. büyüsü</h3><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="spgrid">${SPELL_KEYS.map(k=>`<button type="button" class="spb" data-spick="${k}" aria-pressed="${f.sp[idx]===k}"><b>${esc(spellTR(k))}</b><span class="muted small">${esc(SPELL_INFO[k])}</span></button>`).join("")}</div></div>`;
  ov.hidden=false;
}
const TEAM = [["AD","Çoğu fiziksel","sword"],["mix","Dengeli","users"],["AP","Çoğu büyü","spark"]];
const runeRow = runes => runes&&runes.length ? `<div class="f-runes">${runeImg(runes[0],"ks")}<span class="minor">${runes.slice(1).map(n=>runeImg(n)).join("")}</span><span class="rn">${esc(runeTR(runes[0]))}</span></div>` : "";
function buildsHTML(side){
  const f=D[side], P=presetsFor(f.c,f.role), styles=stylesShown(f.c,f.role), hasTop=P.some(p=>p.tab==="top");
  if(!hasTop&&f.tab==="top") f.tab="rec";
  if(!styles.includes(f.style)) f.style=styles[0];
  const list=P.filter(p=>p.tab===f.tab&&(f.tab==="top"||p.style===f.style)), cur=P.find(p=>p.id===f.build);
  return `<div class="f-builds">
    ${hasTop?`<div class="f-btabs" role="tablist" aria-label="Build listesi"><button type="button" role="tab" data-dtab="${side}:rec" aria-selected="${f.tab==="rec"}">Önerilenler</button><button type="button" role="tab" data-dtab="${side}:top" aria-selected="${f.tab==="top"}">${ic("trophy")}En çok kazananlar</button></div>`:""}
    ${f.tab==="rec"&&styles.length>1?`<div class="f-stylesel" role="group" aria-label="Oyun stili"><span class="lbl">Stil</span>${styles.map(s=>`<button type="button" data-dstyle="${side}:${s}" aria-pressed="${s===f.style}" title="${esc(STY_DESC[s])}">${ic(STYLE[s].ic)}${esc(STYLE[s].lbl)}</button>`).join("")}</div>`:""}
    <div class="f-styles" role="group" aria-label="Hazır build">${list.map(p=>`<button type="button" data-dbuild="${side}:${p.id}" aria-pressed="${f.build===p.id}" title="${esc(p.sub)}">${ic(p.ic)}${esc(p.lbl)}${p.wr!=null?` <small>%${dec1(p.wr)}</small>`:""}</button>`).join("")||'<span class="muted small">Bu koridor için build verisi yok.</span>'}</div>
    <p class="f-bsub muted small">${cur?`<b>${esc(cur.lbl)}</b> · ${esc(cur.sub)}`:"Elle seçilmiş itemlar"}</p>
    ${runeRow(runesOf(f))}${cur&&cur.runeSrc?`<p class="f-bsub muted small">${esc(cur.runeSrc)} (Elmas+, CN)</p>`:""}
    ${side==="me"?`<div class="f-team" role="group" aria-label="Karşı takımın hasar türü"><span class="lbl">Karşı takım</span>${TEAM.map(([k,l,icn])=>`<button type="button" data-dteam="${k}" aria-pressed="${D.team===k}">${ic(icn)}${l}</button>`).join("")}</div>`:""}
  </div>`;
}
function fighterHTML(side){
  const f=D[side], c=f.c, st=fstats(f), b=WD.champ[c.slug], roles=rolesOf(c);
  return `<div class="f-top">
      <button type="button" class="f-pick" data-dpick="${side}" aria-label="${side==="me"?"Şampiyonunu":"Rakibi"} değiştir: ${esc(c.disp)}">${por(c,"xl")}<span class="f-swap">${ic("swap")}</span></button>
      <div class="f-id"><span class="f-side">${side==="me"?"Sen":"Rakip"}</span><b class="f-name">${esc(c.disp)}</b>
        <span class="f-sub">${tierB(c)} ${esc(ROLE_LONG[f.role]||"")}</span></div>
    </div>
    ${roles.length>1?`<div class="f-roles" role="group" aria-label="Koridor">${roles.map(r=>`<button type="button" data-drole="${side}:${r}" aria-pressed="${r===f.role}">${ROLE[r]}</button>`).join("")}</div>`:""}
    <div class="f-items">${f.items.map((en,i)=>en?`<button type="button" class="slot-i" data-dslot="${side}:${i}" aria-label="${esc(iname(en))} — değiştir">${IT[en]&&IT[en].icon?`<img src="${IT[en].icon}" alt="">`:`<span class="ini">${esc(iname(en).slice(0,2))}</span>`}${chgBadge(ICHG[en]&&ICHG[en].v)}</button>`
        :`<button type="button" class="slot-i empty" data-dslot="${side}:${i}" aria-label="Item ekle">${ic("plus")}</button>`).join("")}</div>
    ${st?`<dl class="f-stats">
      <div><dt>Can</dt><dd>${n0(st.hp)}</dd></div>
      ${(m=>`<div><dt>${m?"Yetenek G.":"Saldırı G."}</dt><dd>${n0(m?st.ap:st.ad)}</dd></div>`)(b.t==="M"&&st.ap>0)}
      <div><dt>Zırh</dt><dd>${n0(st.ar)}</dd></div>
      <div><dt>Büyü D.</dt><dd>${n0(st.mr)}</dd></div>
      <div><dt>Saldırı H.</dt><dd>${st.as.toFixed(2).replace(".",",")}</dd></div>
    </dl>`:`<p class="muted small">Bu şampiyonun taban değerleri henüz yok.</p>`}
    ${buildsHTML(side)}
    <div class="f-spells" role="group" aria-label="Çağırıcı büyüleri">${f.sp.map((k,i)=>`<button type="button" data-dspell="${side}:${i}" aria-label="Büyü ${i+1}: ${esc(spellTR(k))} — değiştir">${ic(i?"spark":"bolt")}${esc(spellTR(k))}</button>`).join("")}</div>
    <div class="f-acts"><button type="button" class="lnk" data-dclear="${side}">${ic("reset")}Yuvaları boşalt</button>${AB[c.slug]?"":`<span class="muted small">Yetenek verisi yok, ortalama alınıyor</span>`}</div>`;
}
const ccChip=(who,side,cc,sh,hl)=>`<span class="ccc ${side}"><span class="who ${side}">${who}</span>${ic("bolt")}${cc>0?cc.toFixed(1).replace(".",",")+" sn kitle kontrolü":"kitle kontrolü yok"} · ${ic("shield")}${sh>0?n0(sh)+" hasar kalkanla emildi":"kalkan yok"} · ${ic("heart")}${hl>=1?n0(hl)+" can iyileşti":"iyileşme yok"}</span>`;
/* Hesaba katılan pasif, item ve rün etkileri (tetiklenme sayısıyla) */
const fxRow=(who,side,list)=>list.length?`<li><span class="who ${side}">${who}</span> ${list.map(esc).join(" · ")}</li>`:"";
function metric(label,val,delta,goodUp,hint){
  const d = delta==null||Math.abs(delta)<0.005 ? "" : `<span class="dl ${(delta>0)===goodUp?"good":"bad"}">${delta>0?"▲":"▼"} %${Math.abs(delta*100).toFixed(0)}</span>`; // ok: değerin yönü, renk: senin için iyi mi
  return `<div class="mt" title="${esc(hint||"")}"><span class="ml">${label}</span><b>${val}</b>${d}</div>`;
}
const typeSplit = byT => { const P=byT.P||0, M=byT.M||0, T=byT.T||0, s=Math.max(1,P+M+T); return {P:P/s, M:M/s, T:T/s}; };
function renderDuel(){
  $("#f-me").innerHTML=fighterHTML("me"); $("#f-en").innerHTML=fighterHTML("en");
  $("#d-lvl").textContent=D.lvl;
  const r=simulate(D.me,D.en), out=$("#d-result");
  if(!r){ out.innerHTML='<div class="empty">Bu eşleşme için taban değer verisi yok.</div>'; $("#d-recs").innerHTML=""; return; }
  const p=D.prev; const rel=(a,b)=>b?(a-b)/b:null;
  const V=verdictTxt(r.score), pctMe=Math.round(r.score*100);
  const E = r.edge!=null ? EDGE_TXT(r.edge) : null;
  const sE=typeSplit(r.typeEn);
  out.innerHTML=`
    <div class="tug" role="img" aria-label="Güç dengesi: sen yüzde ${pctMe}, rakip yüzde ${100-pctMe}">
      <span class="tug-me" style="width:${pctMe}%"><b>%${pctMe}</b></span><span class="tug-en"><b>%${100-pctMe}</b></span>
    </div>
    <div class="verdict ${V[1]}"><span class="vh">${esc(V[0])}</span>
      <span class="muted small">Denge = dövüş simülasyonu${E?" + gerçek koridor verisi":" (bu eşleşme için yeterli maç verisi yok)"}</span>
      ${E?`<span class="vtag">${ic("users")}Koridor eşleşmesi: <b class="${E[0]==="good"?"good":E[0]==="bad"?"bad":""}">${esc(E[1])}</b> <small>${ROLE_LONG[r.role]} · gerçek maç verisi</small></span>`:""}
    </div>
    <div class="metrics">
      ${metric("Rakibi indirme",secs(r.ttkMe),p?rel(r.ttkMe,p.ttkMe):null,false,"Yetenek kombosu + normal saldırılarla rakibin canının bitme süresi")}
      ${metric("Seni indirme",secs(r.ttkEn),p?rel(r.ttkEn,p.ttkEn):null,true,"Rakibin kombosu + normal saldırılarıyla senin canının bitme süresi")}
      ${metric("Hasarının geçen kısmı","%"+Math.round(r.passMe*100),p?rel(r.passMe,p.passMe):null,true,"Rakibin zırh/büyü direncinden sonra ana hasar türünün ne kadarı işliyor")}
      ${metric("Etkili canın",n0(r.ehpMe),p?rel(r.ehpMe,p.ehpMe):null,true,"Rakibin hasar türüne karşı gerçek dayanıklılığın")}
    </div>
    <div class="split" title="Senin verdiğin hasarın kaynağı"><span class="sp-ab" style="width:${Math.round(r.abShareMe*100)}%"></span></div>
    <p class="muted small" style="margin:-6px 0 0">Hasarın: <b>%${Math.round(r.abShareMe*100)}</b> yeteneklerden, <b>%${100-Math.round(r.abShareMe*100)}</b> normal saldırıdan. Rakibin hasarı: <b>%${Math.round(sE.P*100)}</b> fiziksel, <b>%${Math.round(sE.M*100)}</b> büyü${sE.T>=0.03?`, <b>%${Math.round(sE.T*100)}</b> gerçek`:""}.</p>
    <div class="ccrow">${ccChip("Sen","me",r.ccMe,r.shMe,r.healMe)}${ccChip("Rakip","en",r.ccEn,r.shEn,r.healEn)}</div>
    ${r.fxMe.length||r.fxEn.length?`<details class="dfx"><summary>Hesaba katılanlar: pasifler, item etkileri, rün, büyüler</summary><ul>${fxRow("Sen","me",r.fxMe)}${fxRow("Rakip","en",r.fxEn)}</ul></details>`:""}
    ${D.log.length?`<ul class="dlog">${D.log.slice(0,3).map((l,i)=>`<li class="${i?"old":""}">${l}</li>`).join("")}</ul>`:`<p class="muted small" style="margin:0">Bir itemı, buildi ya da koridoru değiştir, sonuç anında değişsin.</p>`}
    <p class="muted small" style="margin:0">${ic("info")} 1'e 1 dövüş tahmini: Wild Rift taban değerleri, item sayıları ve yetenek hasarları; pasifler, item etkileri, ana rün, iyileşme, kalkan, kitle kontrolü, menzil ve sihirdar büyüleri dahil. Takım, minyon, kule ve oyuncu becerisi yok; sonucu kesin değil, karşılaştırma için kullan.</p>`;
  renderRecs(r); renderCounters(r);
  D.prev={ttkMe:r.ttkMe,ttkEn:r.ttkEn,passMe:r.passMe,ehpMe:r.ehpMe,score:r.score};
  dSave();
}

/* ===================================================================
 *  ÖNERİLER — her item için: kural kontrolü, simülasyon farkı ve gerekçe
 * =================================================================== */
/* ===== ÖNERİ MOTORU — kural tabanlı =====
 * Simülasyon puanı yerine: bu şampiyonun bu koridorda gerçekten aldığı itemlar (ne kadar sık alındığı)
 * + rakibe göre ihtiyaç: tank rakibe zırh/büyü delme ve yüzde can hasarı, iyileşene Ağır Yara,
 * rakibin hasar türüne uygun savunma, ani hasara karşı hayatta kalma, kitle kontrolüne karşı arındırma.
 * Hangi itemın çıkarılacağına oyuncu karar verir. */
const PEN_ARMOR = new Set(have(["Serylda's Grudge","Dominik's Regards","Black Cleaver","Mortal Reminder","Terminus"]));
const PEN_MAGIC = new Set(have(["Void Staff","Cryptbloom","Terminus"]));
const PCT_HP = new Set(have(["Blade of the Ruined King","Liandry's Torment","Divine Sunderer","Kraken Slayer","Bloodletter's Curse","Riftmaker","Sundered Sky"]));
const ANTI_BURST = new Set(have(["Guardian Angel","Zhonya's Hourglass","Edge of Night","Banshee's Veil","Immortal Shieldbow","Sterak's Gage","Maw of Malmortius","Death's Dance"]));
const ANTI_CC = new Set(have(["Mercurial Scimitar","Mercury's Treads","Quicksilver Sash","Wit's End"]));
const FINISHED = () => ILIST.filter(i=>{const d=itemData(i.en);return d&&(d.t>=3||i.cat==="bot")&&i.cat!=="";});
/* Rakibin profili (karşı takım seçimi savunma kararına katılır) */
function foeOf(r, side){
  const mine = side==="me", foeF = mine ? D.en : D.me;
  const s = mine ? r.se : r.sm, heal = mine ? r.healEn : r.healMe;
  let split = typeSplit(mine ? r.typeEn : r.typeMe);
  const team = mine&&D.team!=="mix" ? D.team : null;
  if(team){ const t=team==="AD"?{P:0.85,M:0.15,T:0}:{P:0.15,M:0.85,T:0}; split={P:(split.P+t.P)/2, M:(split.M+t.M)/2, T:split.T/2}; }
  const A=AB[foeF.c.slug]||{}; const hardCC=["1","2","3","4"].filter(k=>A[k]&&A[k].cc&&A[k].cc[0]==="hard").length;
  const burst=/assassin|mage_burst/.test(foeF.c.arch) || (mine?r.ttkEn:r.ttkMe)<4;
  return { c:foeF.c, split, s, heal, team, hardCC, burst,
    tankyAR: s.ar>=140||s.bar>=70, tankyMR: s.mr>=110||s.bmr>=60, tankyHP: s.bhp>=900,
    get tanky(){ return this.tankyAR||this.tankyMR||this.tankyHP; }, squishy: s.bhp<450&&s.bar<35&&s.bmr<35 };
}
/* Bu şampiyonun bu koridordaki item sıklığı (0–1) */
function popOf(c, role, style){
  const k=c.slug+"|"+role+"|"+style; if(popOf.m[k]) return popOf.m[k];
  const w={}, add=(en,v)=>{ if(IT[en]) w[en]=(w[en]||0)+v; };
  const b=BUILDS[c.slug];
  if(b&&b.r[role]) b.r[role].v.forEach((v,i)=>v[2].forEach((x,j)=>add(itemOf(x),(i?1:2)*(1.4-j*0.08))));
  if(b) Object.entries(b.r).forEach(([r,R])=>{ if(r!==role) R.v.forEach(v=>v[2].forEach(x=>add(itemOf(x),0.4))); });
  if(b) (b.sit||[]).forEach(([x])=>add(itemOf(x),1.2));
  ((CORES[c.slug]||{})[role]||{c:[]}).c.forEach(x=>x[0].forEach(s=>add(itemOf(s),0.6+x[2]/20)));
  if(style&&STYLE[style]) tplOf(style,role,isMelee(c.slug),style!==styleOfArch(c.arch)).items.slice(0,14).forEach((en,i)=>add(en,0.9-i*0.04));
  const mx=Math.max(1,...Object.values(w)); Object.keys(w).forEach(en=>w[en]=Math.min(1,w[en]/mx));
  return popOf.m[k]=w;
}
popOf.m={};
/* Tek item için puan ve gerekçeler */
function recScore(en, f, foe, mineSplit){
  const x=itemStats(en), why=[]; const pop=popOf(f.c,f.role,f.style)[en]||0; let sc=pop*1.2;
  const myP=mineSplit.P>=0.5, myM=mineSplit.M>=0.5, fn=esc(foe.c.disp);
  const has=k=>f.items.some(o=>o&&(itemStats(o)[k]||0)>0);
  const isDmg=!!(x.ad||x.ap||x.crit||x.as);
  // tank rakip: delme ve yüzde can hasarı
  if(foe.tankyAR&&myP&&(PEN_ARMOR.has(en)||(x.armpen||0)>0)){ sc+=1.6; why.push(["good",`${fn} çok zırhlı: zırh delme şart`]); }
  if(foe.tankyMR&&myM&&(PEN_MAGIC.has(en)||(x.mpen||0)>0)){ sc+=1.6; why.push(["good",`${fn} çok büyü direnci taşıyor: büyü delme şart`]); }
  if(foe.tankyHP&&PCT_HP.has(en)&&((x.ap>0)===myM||!(x.ap||x.ad))){ sc+=0.9; why.push(["good",`${fn} çok can yığıyor: yüzde can hasarı işe yarar`]); }
  if(foe.tanky&&isDmg&&(x.armpenflat||0)>0&&!(x.armpen>0)){ sc-=0.6; why.push(["bad","Öldürücülük tanklara karşı zayıf kalır"]); }
  // kırılgan rakip
  if(foe.squishy&&(PEN_ARMOR.has(en)||PEN_MAGIC.has(en)||PCT_HP.has(en))&&!(x.armpenflat||x.mpenflat)){ sc-=0.5; why.push(["bad",`${fn} dayanıklı değil; bu item tanklara karşı alınır`]); }
  if(foe.squishy&&((x.armpenflat||0)>0&&myP||(x.mpenflat||0)>0&&myM)){ sc+=0.5; why.push(["good",`${fn} kırılgan: ani hasar etkili`]); }
  // iyileşme
  const healer=foe.c.arch==="enchanter"||/İyileş|heal/i.test((foe.c.tags||[]).join(" "));
  if(ANTI_HEAL.has(en)&&(foe.heal>=0.08*foe.s.hp||healer)&&!f.items.some(o=>o&&ANTI_HEAL.has(o))){ sc+=1.1; why.push(["good",healer?`${fn} takımını iyileştiriyor: Ağır Yara`:`${fn} dövüşte çok iyileşiyor: Ağır Yara`]); }
  // savunma: rakibin (ve karşı takımın) hasar türüne göre
  const who=foe.team?"Karşı takım":fn;
  if((x.armor||0)>0&&!(x.mr>0)){ if(foe.split.P>=0.6){ sc+=0.6+(has("armor")?0:0.4); why.push(["good",`${who} çoğunlukla fiziksel hasar veriyor`]); } else if(foe.split.P<0.3){ sc-=0.8; why.push(["bad",`${who} çoğunlukla büyü hasarı veriyor; zırh az işe yarar`]); } }
  if((x.mr||0)>0&&!(x.armor>0)){ if(foe.split.M>=0.6){ sc+=0.6+(has("mr")?0:0.4); why.push(["good",`${who} çoğunlukla büyü hasarı veriyor`]); } else if(foe.split.M<0.3){ sc-=0.8; why.push(["bad",`${who} çoğunlukla fiziksel vuruyor; büyü direnci az işe yarar`]); } }
  // ani hasar ve kitle kontrolü
  if(foe.burst&&ANTI_BURST.has(en)){ sc+=0.5; why.push(["good",`${fn} ani hasar veriyor: hayatta kalmana yardım eder`]); }
  if(foe.hardCC>=2&&ANTI_CC.has(en)){ sc+=0.5; why.push(["good",`${fn} çok kitle kontrolü taşıyor`]); }
  if(pop>=0.55&&why.every(w=>w[0]!=="good")) why.push(["good",`${esc(f.c.disp)} oyuncularının bu koridorda sık aldığı item`]);
  return {sc, pop, why:why.slice(0,2)};
}
function bestItems(side, limit){
  const f=D[side], base=simulate(D.me,D.en); if(!base) return [];
  const foe=foeOf(base,side), mineSplit=typeSplit(side==="me"?base.typeMe:base.typeEn);
  const pool=new Set([...buildPool(f.c,f.role,f.style), ...Object.keys(popOf(f.c,f.role,f.style)).filter(en=>itemFits(en,f.style))]);
  return FINISHED().filter(i=>pool.has(i.en)&&!f.items.includes(i.en)&&(f.role==="sup"||!isQuest(i.en))).map(i=>{
    // kural: aynı gruptan item varsa yalnızca onun yerine alınabilir — öneri yine gösterilir, seçicide belirtilir
    const g=f.items.find(o=>o&&o!==i.en&&(isBoot(i.en)?isBoot(o):igrp(o).some(x=>igrp(i.en).includes(x))));
    const test={...f, items:f.items.map(o=>o===g?null:o)}; if(blockOf(test,i.en,-1)) return null;
    const r=recScore(i.en,f,foe,mineSplit); return {en:i.en, ...r, conflict:g||null};
  }).filter(x=>x&&x.sc>0.15).sort((a,b)=>b.sc-a.sc).slice(0,limit);
}
function renderRecs(){
  const best=bestItems("me",12), sty=STYLE[D.me.style];
  const lvl=x=>x.sc>=1.8?["hi","Çok etkili"]:x.sc>=1.1?["mid","Etkili"]:["lo","Uygun"];
  $("#d-recs").innerHTML = `<h2>${ic("wand")}Bu rakibe karşı en etkili itemlar</h2>
    <p class="muted small">${esc(D.me.c.disp)}${sty?` (${esc(sty.lbl)})`:""} için: oyuncuların bu koridorda aldığı itemlar, ${esc(D.en.c.disp)} rakibinin özelliklerine göre sıralandı${D.team!=="mix"?`; karşı takım ${D.team==="AD"?"çoğunlukla fiziksel":"çoğunlukla büyü"} hasar veriyor`:""}. Dokun: boş yuvaya eklenir, build doluysa hangi itemın yerine alacağını sen seçersin.</p>
    <div class="rec-list${recMore?" open":""}">${best.map(x=>{ const L=lvl(x); return `<button type="button" class="rec2" data-dadd="${esc(x.en)}" ${tipAttr("item",x.en)}>
      ${IT[x.en]&&IT[x.en].icon?`<img src="${IT[x.en].icon}" alt="">`:""}
      <span class="rb"><span class="nm">${esc(iname(x.en))}</span>
        ${x.why.length?`<span class="why">${x.why.map(([t,s])=>`<span class="${t}">${s}</span>`).join("")}</span>`:""}</span>
      <span class="rlvl ${L[0]}">${L[1]}</span></button>`; }).join("")||'<div class="empty">Eklenebilecek item kalmadı.</div>'}</div>
    ${best.length>6?`<button type="button" class="lnk rec-more" data-recmore aria-expanded="${recMore}">${ic(recMore?"x":"plus")}${recMore?"Daha az göster":`${best.length-6} öneri daha göster`}</button>`:""}`;
}
let recMore=false;
/* Öneriyi ekle: boş yuva varsa oraya; yoksa (ya da aynı gruptan item varsa) oyuncu seçer */
function addRec(en){
  const f=D.me, g=f.items.find(o=>o&&o!==en&&(isBoot(en)?isBoot(o):igrp(o).some(x=>igrp(en).includes(x))));
  if(!g){ const empty=f.items.findIndex((o,i)=>!o&&(isBoot(en)?true:i<SLOTS)); if(empty>=0){ setItem("me",empty,en); return; } }
  const opts=f.items.map((o,i)=>({o,i})).filter(x=>x.o&&(!g||x.o===g));
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Hangi itemın yerine?">
    <div class="sheet-head"><h3>${esc(iname(en))}: hangi itemın yerine?</h3><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    ${g?`<p class="muted small" style="margin:0 0 10px">${esc(iname(g))} ile aynı gruptan (${esc(igrp(en).map(x=>GRP_TR[x]||x).join(", "))}); ikisi birlikte alınamaz.</p>`:""}
    <div class="repl">${opts.map(x=>`<button type="button" class="ipb" data-repl="${x.i}" data-repl-en="${esc(en)}" ${tipAttr("item",x.o)}><span class="ib">${IT[x.o]&&IT[x.o].icon?`<img src="${IT[x.o].icon}" alt="">`:""}</span><span class="nm">${esc(iname(x.o))}</span></button>`).join("")}</div></div>`;
  ov.hidden=false;
}
const ptsTxt = g => Math.abs(g)<0.0005?"±0":(g>0?"+":"−")+Math.abs(g*100).toFixed(1).replace(".",",");
function renderCounters(r){
  const en=D.en.c, role=r?r.role:D.en.role;
  const rows=(MU[role]&&MU[role][en.slug]||[]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>({c:BYSLUG[x[0]],e:x[1]})).filter(x=>x.c);
  $("#d-counters").innerHTML = `<h2>${ic("trophy")}${esc(en.disp)} karşısında en iyi seçimler</h2>
    <p class="muted small">${ROLE_LONG[role]} · gerçek maç verisi. Dokun, onunla düello et.</p>
    ${rows.length?`<div class="ctr-row">${rows.map(x=>`<button type="button" class="ctr" data-dme="${x.c.slug}">${por(x.c)}<span class="nm">${esc(x.c.disp)}</span><span class="tag ${EDGE_TXT(x.e)[0]}">${esc(EDGE_TXT(x.e)[1])}</span></button>`).join("")}</div>`:'<div class="empty">Bu koridor için eşleşme verisi yok.</div>'}`;
}
/* Item seçici: her itemın düelloya etkisi; alınamayan itemlar nedeniyle gösterilir */
let ipSide="me", ipSlot=0, ipCat="rec";
function openItemPicker(side,slot){
  ipSide=side; ipSlot=slot; ipCat="rec"; const f=D[side]; const cur=f.items[slot];
  ov.innerHTML=`<div class="sheet ip" role="dialog" aria-modal="true" aria-label="Item seç">
    <div class="sheet-head"><h3>${side==="me"?"Senin":"Rakibin"} itemı</h3>${cur?`<button class="btn" type="button" data-iprm>${ic("x")}Çıkar</button>`:""}<button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="toolbar"><div class="seg sm" id="ip-cats">${[["rec",`${esc(f.c.disp)} için`],["all","Tümü"],...Object.entries(CAT)].map(([k,v])=>`<button type="button" data-c="${k}" aria-pressed="${k===ipCat}">${v}</button>`).join("")}</div>
    <input id="ip-q" type="search" placeholder="Item ara" aria-label="Item ara"></div>
    <p class="muted small" style="margin:0">"${esc(f.c.disp)} için": oyuncuların bu şampiyonda ${esc(ROLE_LONG[f.role]||"")} için gerçekten aldığı itemlar. Sayı: bu item bu yuvaya girerse ${side==="me"?"avantajın":"rakibin avantajı"} kaç puan değişir. Soluk olanlar bu builde eklenemez.</p>
    <div class="ipgrid" id="ip-grid"></div></div>`;
  ov.hidden=false; drawItemPicker();
  $("#ip-q").addEventListener("input",drawItemPicker);
  $("#ip-cats").addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;ipCat=b.dataset.c;[...$("#ip-cats").children].forEach(x=>x.setAttribute("aria-pressed",x===b));drawItemPicker()});
  setTimeout(()=>{const q=$("#ip-q"); if(q&&matchMedia("(pointer:fine)").matches) q.focus()},30);
}
function drawItemPicker(){
  const f=D[ipSide], o=other(ipSide), q=key($("#ip-q").value);
  const base=simulate(D.me,D.en), baseV=base?(ipSide==="me"?base.score:1-base.score):0;
  const pool=new Set(buildPool(f.c,f.role,f.style));
  const rows=(q?ILIST.filter(i=>itemData(i.en)):FINISHED()).filter(i=>(q||ipCat==="all"||(ipCat==="rec"?pool.has(i.en):i.cat===ipCat))&&(!q||key(i.tr+" "+i.en).includes(q)));
  const scored=rows.map(i=>{ const why=blockOf(f,i.en,ipSlot); if(why) return {i,why,g:0};
    const items=[...f.items]; items[ipSlot]=i.en; return {i,why:null,g:base?trial(f,items,o)-baseV:0}; })
    .sort((a,b)=>(!!a.why-!!b.why)||(b.g-a.g));
  $("#ip-grid").innerHTML=scored.map(({i,g,why})=>`<button type="button" class="ipb${why?" off":""}" data-ipick="${esc(i.en)}"${why?` disabled title="${esc(why)}"`:""}>
      <span class="ib">${i.icon?`<img src="${i.icon}" alt="" loading="lazy">`:""}${chgBadge(ICHG[i.en]&&ICHG[i.en].v)}</span>
      <span class="nm">${esc(i.tr)}</span>${why?`<span class="why-off">${esc(why)}</span>`:`<span class="gain ${g>0.0005?"good":g<-0.0005?"bad":""}">${ptsTxt(g)}</span>`}</button>`).join("")||'<div class="empty">Bulunamadı.</div>';
}
function logChange(side, html, before){
  const r=simulate(D.me,D.en); if(!r||before==null) return;
  const d=Math.round((r.score-before)*100); const sf=side==="me"?"n":"";
  D.log.unshift(`<span class="who ${side}">${side==="me"?"Sen":"Rakip"}</span> ${html.replace("{s}",sf)} → avantajın <b class="${d>=0?"good":"bad"}">${d>=0?"+":"−"}${Math.abs(d)} puan</b>`); D.log=D.log.slice(0,3);
}
function setItem(side,slot,en){
  const f=D[side], old=f.items[slot], before=D.prev&&D.prev.score; f.items[slot]=en; f.build=null;
  // çizme son yuvada kalsın
  const boot=f.items.find(isBoot); if(boot){ const rest=f.items.filter(x=>x&&!isBoot(x)); f.items=[...rest,...Array(SLOTS).fill(null)].slice(0,SLOTS-1).concat(boot); }
  logChange(side, en&&old?`${esc(iname(old))} yerine <b>${esc(iname(en))}</b> aldı{s}`:en?`<b>${esc(iname(en))}</b> aldı{s}`:`<b>${esc(iname(old))}</b> çıkardı{s}`, before);
  renderDuel();
}
document.getElementById("v-ana").addEventListener("click",e=>{
  const t=e.target.closest("[data-dpick],[data-dslot],[data-dspell],[data-dbuild],[data-dtab],[data-drole],[data-dclear],[data-dadd],[data-dme],[data-lvl],[data-dstyle],[data-dteam],[data-recmore]"); if(!t) return;
  if(t.dataset.dstyle){ const i=t.dataset.dstyle.indexOf(":"), s=t.dataset.dstyle.slice(0,i), st=t.dataset.dstyle.slice(i+1), f=D[s]; if(f.style===st) return;
    const before=D.prev&&D.prev.score, p=presetsFor(f.c,f.role).find(x=>x.tab==="rec"&&x.style===st&&!x.gen);
    f.style=st; f.tab="rec"; if(p) applyPreset(s,p.id); else { f.build=null; f.rune=runesOf(f)[0]; }
    logChange(s,`<b>${esc(STYLE[st].lbl)}</b> stiline geçti{s}`,before); renderDuel(); return; }
  if(t.dataset.dteam){ const v=t.dataset.dteam; if(D.team===v) return; const before=D.prev&&D.prev.score, f=D.me; D.team=v;
    if(f.build) applyPreset("me",f.build); else f.items=[...ensureDef(f.items.filter(Boolean),v,f.c,f.role,f.style),...Array(SLOTS).fill(null)].slice(0,SLOTS);
    logChange("me",`karşı takımı <b>${v==="AD"?"çoğu fiziksel":v==="AP"?"çoğu büyü":"dengeli"}</b> seçti{s}${v!=="mix"?"; savunma itemları buna göre değişti":""}`,before); renderDuel(); return; }
  if(t.dataset.recmore!==undefined){ recMore=!recMore; renderRecs(); return; }
  if(t.dataset.dpick){ const side=t.dataset.dpick; openPicker(side==="me"?"Senin şampiyonun":"Rakip şampiyon",c=>{D[side]=fighter(side,c);D.log=[];D.prev=null;renderDuel()}); }
  else if(t.dataset.dslot){ const [s,i]=t.dataset.dslot.split(":"); openItemPicker(s,+i); }
  else if(t.dataset.dspell){ const [s,i]=t.dataset.dspell.split(":"); openSpellPicker(s,+i); }
  else if(t.dataset.dtab){ const [s,k]=t.dataset.dtab.split(":"); D[s].tab=k; renderDuel(); }
  else if(t.dataset.drole){ const [s,r]=t.dataset.drole.split(":"); const f=D[s]; if(f.role===r) return; const before=D.prev&&D.prev.score;
    D[s]=fighter(s,f.c,{role:r,tab:f.tab,style:f.style}); logChange(s,`<b>${esc(ROLE_LONG[r])}</b> buildine geçti{s}`,before); renderDuel(); }
  else if(t.dataset.dbuild){ const j=t.dataset.dbuild.indexOf(":"), s=t.dataset.dbuild.slice(0,j), id=t.dataset.dbuild.slice(j+1); const before=D.prev&&D.prev.score;
    t.classList.add("busy"); setTimeout(()=>{ applyPreset(s,id); const p=presetsFor(D[s].c,D[s].role).find(x=>x.id===id);
      logChange(s,`<b>${esc(p?p.lbl:"")}</b> buildini seçti{s}`,before); renderDuel(); },10); }
  else if(t.dataset.dclear){ const s=t.dataset.dclear; D[s].items=Array(SLOTS).fill(null); D[s].build=null; renderDuel(); }
  else if(t.dataset.dadd){ addRec(t.dataset.dadd); }
  else if(t.dataset.dme){ D.me=fighter("me",BYSLUG[t.dataset.dme],{role:D.en.role}); D.log=[]; D.prev=null; renderDuel(); window.scrollTo({top:0,behavior:"smooth"}); }
  else if(t.dataset.lvl){ D.lvl=Math.min(15,Math.max(1,D.lvl+(+t.dataset.lvl))); renderDuel(); }
});
ov.addEventListener("click",e=>{
  const q=e.target.closest("[data-spick]"); if(q){ ov.hidden=true; const f=D[spSide], k=q.dataset.spick, o=1-spIdx;
    if(f.sp[spIdx]!==k){ const old=f.sp[spIdx], before=D.prev&&D.prev.score; if(f.sp[o]===k) f.sp[o]=old; f.sp[spIdx]=k;
      logChange(spSide,`<b>${esc(spellTR(k))}</b> büyüsünü seçti{s}`,before); renderDuel(); } return; }
  const rp=e.target.closest("[data-repl]"); if(rp){ ov.hidden=true; setItem("me",+rp.dataset.repl,rp.dataset.replEn); return; }
  const p=e.target.closest("[data-ipick]"); if(p){ if(p.disabled) return; ov.hidden=true; setItem(ipSide,ipSlot,p.dataset.ipick); return; }
  if(e.target.closest("[data-iprm]")){ ov.hidden=true; setItem(ipSide,ipSlot,null); }
});
$("#d-swap").addEventListener("click",()=>{ [D.me,D.en]=[D.en,D.me]; D.me.side="me"; D.en.side="en"; D.log=[]; D.prev=null; renderDuel(); });

/* ===================================================================
 *  ŞAMPİYONLAR (kademe listesi burada: "Kademe" sıralaması gruplar)
 * =================================================================== */
let cRole="all";
const pref = (k,d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const setPref = (k,v) => { try { localStorage.setItem(k,v); } catch {} };
let cSort = pref("rk-csort","tier");
const segSet = (id,attr,v) => [...$(id).children].forEach(x=>x.setAttribute("aria-pressed",x.dataset[attr]===v));
const TIER_TXT = {S:"Çok güçlü",A:"Güçlü",B:"Dengeli",C:"Biraz zayıf",D:"Zayıf","?":"Verisi yok"};
$("#c-roles").innerHTML=[["all","Tümü"],...Object.entries(ROLE)].map(([k,v])=>`<button type="button" data-r="${k}" aria-pressed="${k==="all"}">${v}</button>`).join("");
$("#c-roles").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;cRole=b.dataset.r;segSet("#c-roles","r",cRole);renderGrid()});
$("#c-q").addEventListener("input",renderGrid);
segSet("#c-sort","s",cSort);
$("#c-sort").addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;cSort=b.dataset.s;setPref("rk-csort",cSort);segSet("#c-sort","s",cSort);renderGrid()});
/* Kart: kazanma ve seçilme oranı, ikisi de yazıyla etiketli */
const cst = s => `<span class="cst"><span>Kazanma <b>${pct(s&&s[0])}</b></span><span>Seçilme <b>${pct(s&&s[1])}</b></span></span>`;
const ccard = (c,s) => `<button class="ccard" type="button" ${champBtnAttrs(c)}>${por(c)}<span class="nm">${esc(c.disp)}</span>${cst(s)}</button>`;
const TIER_RULE = {S:"kazanma %52,5 ve üstü",A:"kazanma %51–52,5",B:"kazanma %49,5–51",C:"kazanma %48–49,5",D:"kazanma %48'in altı","?":"bu koridorda yeterli maç yok"};
/* Meta: kademesi S/A (kazanma %51+) ve koridorunda ortalamanın üstünde seçilen; sıra: seçilme × güç */
function metaPicks(role, n){
  const rows=LIST.map(c=>{ const s=c.rs[role]; return s&&s[0]!=null&&s[1]!=null?{c,s}:null; }).filter(Boolean);
  if(!rows.length) return [];
  const prs=rows.map(x=>x.s[1]).sort((a,b)=>a-b), med=prs[Math.floor(prs.length/2)];
  return rows.filter(x=>x.s[0]>=51&&x.s[1]>=med).sort((a,b)=>b.s[1]*(b.s[0]-48)-a.s[1]*(a.s[0]-48)).slice(0,n);
}
function metaHTML(){
  const roles=cRole==="all"?Object.keys(ROLE):[cRole];
  const rows=roles.map(r=>[r,metaPicks(r,cRole==="all"?5:10)]).filter(x=>x[1].length);
  if(!rows.length) return "";
  return `<section class="card metabox"><h2 class="th">${ic("trophy")}Meta şampiyonlar<small>Yama ${esc(META.patch||"")}</small></h2>
    <p class="muted small" style="margin:0 0 10px">Şu an hem güçlü hem çok oynananlar: kademesi S ya da A (kazanma %51 ve üstü) ve o koridorda ortalamanın üstünde seçilen şampiyonlar; seçilme ve kazanma birlikte puanlanır. Kaynak: Elmas+ maçlar, CN sunucusu.</p>
    ${rows.map(([r,l])=>`<div class="mrow"><span class="mr-l">${roleB(r)}</span><div class="mcards">${l.map(x=>`<button class="mcard" type="button" ${champBtnAttrs(x.c)}>${por(x.c,"sm")}<span class="mb"><span class="nm">${esc(x.c.disp)}</span>${cst(x.s)}</span></button>`).join("")}</div></div>`).join("")}</section>`;
}
function renderGrid(){
  const q=key($("#c-q").value);
  const stOf = c => cRole==="all" ? (c.wr!=null?[c.wr,c.pr]:null) : (c.rs[cRole]||null);
  const wrOf = c => { const s=stOf(c); return s?s[0]:null; };
  const rows=LIST.filter(c=>(cRole==="all"||c.roles.includes(cRole)||c.rs[cRole])&&(!q||key(c.disp).includes(q)));
  const out=$("#c-grid");
  if(!rows.length){ out.innerHTML='<div class="empty">Bulunamadı.</div>'; return; }
  const legend=`<p class="muted small c-legend">${ic("info")}<span>Harf, şampiyonun kademesidir ve ${cRole==="all"?"ana koridorundaki":ROLE_LONG[cRole]+" için"} <b>kazanma oranına</b> göre verilir. Kartta iki oran var: <b>kazanma</b> (oynandığı maçların yüzde kaçını kazanıyor) ve <b>seçilme</b> (maçların yüzde kaçında seçiliyor).</span></p>`;
  if(cSort==="az"){ out.innerHTML=`${legend}<div class="cgrid">${rows.sort((a,b)=>a.disp.localeCompare(b.disp,"tr")).map(c=>ccard(c,stOf(c))).join("")}</div>`; return; }
  const groups={}; rows.forEach(c=>{const t=tierOf(wrOf(c));(groups[t]||=[]).push(c)});
  out.innerHTML=(q?"":metaHTML())+legend+["S","A","B","C","D","?"].filter(t=>groups[t]).map(t=>`<section class="tsec"><h2 class="th"><span class="tier big" data-t="${t}">${t}</span>${TIER_TXT[t]}<small class="trule">${TIER_RULE[t]} · ${groups[t].length} şampiyon</small></h2>
    <div class="cgrid">${groups[t].sort((a,b)=>(wrOf(b)||0)-(wrOf(a)||0)).map(c=>ccard(c,stOf(c))).join("")}</div></section>`).join("");
}

/* ===================================================================
 *  PROFİL — sekmeli: Build · Yetenekler · Eşleşmeler · Oynanış
 * =================================================================== */
let pRole=null, pSlug=null, pTab="build";
function pickRow(c,e,role){
  const T=EDGE_TXT(e); const w=role?roleWR(c,role):null;
  return `<button class="pick" type="button" ${champBtnAttrs(c)}>${por(c,"sm")}<span class="nm">${esc(c.disp)}</span><span class="tag ${T[0]}">${T[1]}</span><span class="rt">${pct(w!=null?w:c.wr)}</span></button>`;
}
/* İstatistik sekmesi: koridor başına oranlar, en popüler çekirdekler, çizmeler ve rün sayfaları (Elmas+, CN) */
function statsTab(c){
  const rows=Object.keys(ROLE).filter(r=>c.rs[r]).sort((a,b)=>c.rs[b][1]-c.rs[a][1]);
  const C=CORES[c.slug]||{};
  const wpr=(w,p)=>`<span class="ow ${w>=52?"good":w<48?"bad":""}">${pct(w)}</span> kazanma · ${pct(p)} seçilme`;
  const roleBlock=r=>{ const R=C[r]; if(!R) return "";
    return `<div class="card"><h2>${roleB(r)} ${esc(ROLE_LONG[r])}</h2>
      <h3 class="h3">En popüler çekirdekler (ilk 3 item)</h3>
      <div class="cores">${R.c.map(x=>`<div class="core"><div class="irow">${x[0].map(itemOf).map(en=>itile(en)).join("")}</div><span class="small">${wpr(x[1],x[2])}</span></div>`).join("")}</div>
      ${R.b&&R.b.length?`<h3 class="h3">Çizmeler</h3><div class="cores">${R.b.map(x=>`<div class="core"><div class="irow">${itile(itemOf(x[0]))}</div><span class="small">${wpr(x[1],x[2])}</span></div>`).join("")}</div>`:""}
      ${R.r&&R.r.length?`<h3 class="h3">Rün sayfaları</h3><div class="cores">${R.r.map(x=>`<div class="core"><div class="runes">${runeImg(x[0][0],"ks")}<span class="minor">${x[0].slice(1).map(n=>runeImg(n)).join("")}</span><span class="rn">${esc(runeTR(runeKey(x[0][0])))}</span></div><span class="small">${wpr(x[1],x[2])}</span></div>`).join("")}</div>`:""}
      <p class="muted small" style="margin:8px 0 0">Oyun stilleri: ${esc(stylesShown(c,r).map(s=>STYLE[s].lbl).join(", "))}</p></div>`; };
  return `<div class="card"><h2>${ic("trophy")}Koridorlara göre</h2>
    <div class="tblw"><table class="stbl"><thead><tr><th>Koridor</th><th>Kademe</th><th>Kazanma</th><th>Seçilme</th><th>Yasaklanma</th></tr></thead><tbody>
    ${rows.map(r=>{ const x=c.rs[r], t=tierOf(x[0]); return `<tr><th>${esc(ROLE_LONG[r])}</th><td><span class="tier" data-t="${t}">${t}</span></td><td>${pct(x[0])}</td><td>${pct(x[1])}</td><td>${pct(x[2])}</td></tr>`; }).join("")||'<tr><td colspan="5">Veri yok.</td></tr>'}
    </tbody></table></div>
    <p class="muted small" style="margin:8px 0 0">Kademe: S %52,5 ve üstü · A %51 · B %49,5 · C %48 · D altı. Kaynak: Elmas+ dereceli maçlar, Wild Rift CN sunucusu (riftpatchnotes.com).</p></div>
    ${rows.map(roleBlock).join("")}`;
}
function renderProfile(slug){
  const c=BYSLUG[slug]; const v=$("#v-profil");
  if(slug!==pSlug){pSlug=slug;pRole=null;bRole=null;bVar=0;bTab="rec";bStyle=null;pTab="build";}
  if(!c){v.innerHTML='<div class="empty">Şampiyon bulunamadı. <a href="#sampiyonlar">Listeye dön</a>.</div>';return}
  const pr=c.prof||{};
  const br=boardRoles(c); if(!br.includes(pRole)) pRole=br.includes(c.main)?c.main:br[0];
  const board=pRole?(MU[pRole][c.slug]||[]).map(([s,e])=>({o:BYSLUG[s],e})).filter(x=>x.o):[];
  const strong=board.filter(x=>x.e<0).sort((a,b)=>a.e-b.e), weak=board.filter(x=>x.e>0).sort((a,b)=>b.e-a.e);
  const slotName={"PASİF":"Pasif","1":"1","2":"2","3":"3","ULTİ":"Ulti"};
  const ch=CHG[c.slug];
  const tabs=[["build","Build"],["istatistik","İstatistik"],["yetenek","Yetenekler"],["eslesme","Eşleşmeler"],["oyna","Oynanış"]];
  let body="";
  if(pTab==="build") body=`<div class="card" id="pf-build">${buildCard(c)}</div>`;
  if(pTab==="istatistik") body=statsTab(c);
  if(pTab==="yetenek") body=`<div class="card"><div class="abil">${(pr.ab||[]).map(a=>{const cp=ch&&ch.c.find(p=>p[0]===a[0]);const d=cp?cp[3].reduce((x,l)=>x+l[1],0):null;return `<div class="ab${cp?" chg-ab":""}"><span class="abi">${a[3]?`<img src="${a[3]}" alt="">`:""}${cp?chgBadge(d>0?"buff":d<0?"nerf":"adj"):""}</span><div><div class="k">${esc(slotName[a[1]]||a[1])}</div><div class="n">${esc(a[0])}</div><p>${esc(a[2])}</p>${cp?`<ul class="lns">${cp[3].map(lineHTML).join("")}</ul>`:""}</div></div>`}).join("")||'<div class="empty">Yetenek bilgisi yok.</div>'}</div></div>`;
  if(pTab==="eslesme") body=br.length?`<div class="seg sm" id="pf-roles">${br.map(r=>`<button type="button" data-r="${r}" aria-pressed="${r===pRole}">${ROLE_LONG[r]}</button>`).join("")}</div>
    <div class="grid2"><div class="card"><h2 class="good-h">Rahat ettiği rakipler <small>${strong.length}</small></h2><div class="list">${strong.map(x=>pickRow(x.o,-x.e,pRole)).join("")||'<div class="empty">Kayıt yok.</div>'}</div></div>
    <div class="card"><h2 class="bad-h">Zorlandığı rakipler <small>${weak.length}</small></h2><div class="list">${weak.map(x=>pickRow(x.o,-x.e,pRole)).join("")||'<div class="empty">Kayıt yok.</div>'}</div></div></div>`
    :'<div class="empty">Bu şampiyon için eşleşme verisi yok.</div>';
  if(pTab==="oyna") body=`<div class="grid2"><div class="card"><h2>Nasıl oynanır</h2><p style="margin:0">${esc(c.tip)}</p></div><div class="card"><h2>Karşına çıkarsa</h2>${howToBeat(c)}</div></div>`;
  v.innerHTML=`
  <a href="#sampiyonlar" class="back">‹ Şampiyonlar</a>
  <div class="prof-head">
    ${por(c,"lg")}
    <div class="ph-id">
      <h1>${esc(c.disp)}</h1>${pr.t?`<div class="title">${esc(pr.t)}</div>`:""}
      <div class="prof-meta">${c.roles.map(roleB).join("")}<span class="chip ${c.dmg.toLowerCase()}">${DMG[c.dmg]}</span>${(pr.cls||[]).map(x=>`<span class="chip">${esc(CLS_TR[x]||x)}</span>`).join("")}${pr.d?`<span class="chip">Zorluk <span class="diff">${[1,2,3].map(i=>`<i class="${i<=pr.d?"on":""}"></i>`).join("")}</span></span>`:""}</div>
    </div>
    <div class="ph-kpi"><span class="tier big" data-t="${c.tier}">${c.tier}</span><div><b>${pct(c.wr)}</b><span>kazanma</span></div><div><b>${pct(c.pr)}</b><span>seçilme</span></div>${c.br!=null?`<div><b>${pct(c.br)}</b><span>yasaklanma</span></div>`:""}</div>
    <div class="ph-cta"><button class="btn gold" type="button" id="pf-duel">${ic("duel")}Düelloda dene</button></div>
  </div>
  ${ch?`<button type="button" class="chstrip" data-v="${ch.v}" data-chg="${c.slug}">${chgBadge(ch.v)}<span>Yama ${esc(NOTES.patch||"")}: <b>${esc(VMARK[ch.v][1])}</b> — ${ch.c.length?esc(ch.c.map(p=>p[0]?titleTR(p[0]):"Temel değerler").join(", ")):"yeni şampiyon"}</span><span class="go">Ayrıntı ›</span></button>`:""}
  <div class="ptabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-pt="${k}" aria-selected="${k===pTab}">${l}</button>`).join("")}</div>
  ${body}`;
  $("#pf-duel").onclick=()=>{D.me=fighter("me",c,{role:bRole||undefined,style:bStyle||undefined});D.log=[];D.prev=null;location.hash="ana"};
  v.querySelector(".ptabs").onclick=e=>{const b=e.target.closest("[data-pt]");if(!b)return;pTab=b.dataset.pt;renderProfile(slug)};
  const pb=$("#pf-build"); if(pb) pb.onclick=e=>{const b=e.target.closest("[data-br],[data-bv],[data-btab],[data-bstyle]");if(!b)return;if(b.dataset.br){bRole=b.dataset.br;bVar=0}else if(b.dataset.btab){bTab=b.dataset.btab;bVar=0}else if(b.dataset.bstyle){bStyle=b.dataset.bstyle;bVar=0}else bVar=+b.dataset.bv;pb.innerHTML=buildCard(c)};
  const pr2=$("#pf-roles"); if(pr2) pr2.onclick=e=>{const b=e.target.closest("[data-r]");if(!b)return;pRole=b.dataset.r;renderProfile(slug)};
  document.title = `${c.disp} · Rift Kontra`;
}

/* ===================================================================
 *  EŞYALAR — kategoriye göre gruplu simge ızgarası
 * =================================================================== */
$("#e-q").addEventListener("input",renderItems);
function renderItems(){
  const q=key($("#e-q").value);
  const rows=ILIST.filter(i=>!q||key(i.tr+" "+i.en+" "+i.st+" "+i.fx).includes(q));
  $("#e-out").innerHTML=Object.entries(CAT).map(([k,v])=>{const g=rows.filter(i=>i.cat===k);if(!g.length)return"";
    return `<section class="isec" id="cat-${k}"><h2 class="th">${v}<small>${g.length}</small></h2><div class="igrid2">${g.map(i=>itile(i.en)).join("")}</div></section>`}).join("")||'<div class="empty">Eşleşen item yok.</div>';
}
$("#e-cats").innerHTML=Object.entries(CAT).map(([k,v])=>`<a href="#esyalar" data-jump="cat-${k}">${v}</a>`).join("");
$("#e-cats").addEventListener("click",e=>{const a=e.target.closest("[data-jump]");if(!a)return;e.preventDefault();const t=document.getElementById(a.dataset.jump);if(t)t.scrollIntoView({behavior:"smooth",block:"start"})});
/* Item ayrıntısı: Wild Rift sayıları + Türkçe etki + yama değişikliği */
function showItem(en){
  const i=IT[en]; if(!i) return; const d=itemData(en);
  const stats = d&&d.s ? Object.entries(d.s).map(([k,v])=>fmtStat(k,v)) : (i.st?i.st.split(" · "):[]);
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(i.tr)}" style="width:min(480px,100%)">
    <div class="sheet-head">${icoImg(en,"ico-lg")}<div style="flex:1;min-width:0"><h3 style="margin:0">${esc(i.tr)}</h3><span class="muted small">${i.cat?esc(CAT[i.cat])+" · ":""}${d&&d.c?d.c+" altın":i.cost?i.cost+" altın":""}</span></div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    ${stats.length?`<ul class="stl">${stats.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
    ${i.fx?`<p style="margin:0">${esc(i.fx)}</p>`:""}
    ${ICHG[en]?`<div class="chbox">${vPill(ICHG[en].v)} <span class="muted small">Yama ${esc(NOTES.patch||"")}</span>${changeBody(ICHG[en])}</div>`:""}
    <p class="muted small" style="margin:0">İngilizce adı: ${esc(i.en)}</p></div>`;
  ov.hidden=false; ov.querySelector("[data-close]").focus();
}

/* ===================================================================
 *  YAMA
 * =================================================================== */
function renderPatch(){
  const n=NOTES, ORDER=["new","rework","buff","nerf","adj"];
  const H={new:"Yeni şampiyonlar",rework:"Yeniden tasarlananlar",buff:"Güçlendirilenler",nerf:"Zayıflatılanlar",adj:"Dengelenenler"};
  if(!n||!n.patch){ $("#y-out").innerHTML='<div class="empty">Bu yamanın Türkçe notları henüz yayınlanmadı.</div>'; return; }
  const champs=(n.champs||[]).map(s=>BYSLUG[s]).filter(Boolean), items=n.it?Object.keys(ICHG).filter(k=>IT[k]):(n.items||[]);
  const sec=(v)=>{ const cs=champs.filter(c=>(CHG[c.slug]||{}).v===v), is=items.filter(e=>(ICHG[e]||{}).v===v); if(!cs.length&&!is.length) return "";
    return `<section class="psec" data-v="${v}"><h2 class="th">${chgBadge(v)}${H[v]}<small>${cs.length+is.length}</small></h2>
      <div class="chgrid">${cs.map(c=>`<button class="chtile" type="button" data-chg="${c.slug}">${por(c)}<span>${esc(c.disp)}</span></button>`).join("")}${is.map(en=>itile(en)).join("")}</div></section>`; };
  $("#y-patch").textContent=n.patch;
  $("#y-out").innerHTML=ORDER.map(sec).join("")+`<p class="muted small">Simgeye dokun: hangi yetenek ya da değer, eskisi ve yenisi. Kaynak: <a href="${esc(n.url)}" target="_blank" rel="noopener">resmi Türkçe yama notları</a>.</p>`;
  const k=champs.length+items.length;
  $("#d-patch").innerHTML=`<a class="pstrip" href="#yama">${ic("scroll")}<span><b>Yama ${esc(n.patch)}</b> · ${champs.length} şampiyon, ${items.length} item değişti</span><span class="faces">${champs.slice(0,6).map(c=>por(c,"sm")).join("")}</span><span class="go">Gör ›</span></a>`;
}

/* ===================================================================
 *  YÖNLENDİRME (eski bağlantılar yeni ekranlara gider)
 * =================================================================== */
const VIEWS=["ana","sampiyonlar","esyalar","yama"];
function route(){
  let h=(location.hash||"#ana").slice(1); let v="ana";
  if(h.startsWith("kontra-")&&BYSLUG[h.slice(7)]){ const en=BYSLUG[h.slice(7)]; D.en=fighter("en",en,{role:en.main});
    const role=D.en.role; const best=(MU[role]&&MU[role][en.slug]||[]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1])[0];
    if(best&&BYSLUG[best[0]]) D.me=fighter("me",BYSLUG[best[0]],{role}); D.log=[]; D.prev=null; history.replaceState(null,"","#ana"); h="ana"; }
  if(h==="kontra"||h==="item"||h==="duello") h="ana";
  if(h==="kademe"){ cSort="tier"; segSet("#c-sort","s",cSort); renderGrid(); h="sampiyonlar"; }
  if(VIEWS.includes(h)) v=h;
  if(h.startsWith("s-")){ v="profil"; renderProfile(h.slice(2)); } else document.title = {ana:"Rift Kontra · Wild Rift düello ve kontra",sampiyonlar:"Şampiyonlar · Rift Kontra",esyalar:"Eşyalar · Rift Kontra",yama:"Yama notları · Rift Kontra"}[v];
  if(v==="ana") renderDuel();
  ["ana","sampiyonlar","profil","esyalar","yama"].forEach(x=>$("#v-"+x).hidden=x!==v);
  const nav = v==="profil"?"sampiyonlar":v;
  document.querySelectorAll(".tabs a, .bnav a").forEach(a=>{if(a.getAttribute("href")==="#"+nav)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);

/* Yama ve güncellik */
document.querySelectorAll(".patch,.js-patch").forEach(e=>e.textContent=(e.classList.contains("patch")?"Yama ":"")+(META.patch||""));
(()=>{
  const f=$("#footFresh"); const at=META.checkedAt||META.statsAt; if(!at||!f) return;
  const days=(Date.now()-new Date(at))/864e5;
  f.textContent=`Veriler: Yama ${META.patch} · son kontrol ${fmtDate(at)}${days>3?" (güncelleme gecikti)":""}.`;
})();
$("#hSearch").addEventListener("click",()=>openPicker("Şampiyon ara",c=>{location.hash="s-"+c.slug}));
if("serviceWorker" in navigator && location.protocol==="https:"){
  // Yeni sürüm yayınlanınca sayfa bir kez kendiliğinden yenilenir (eski önbellekte takılı kalmasın)
  const hadCtl = !!navigator.serviceWorker.controller; let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(hadCtl&&!reloaded){reloaded=true;location.reload();} });
  navigator.serviceWorker.register("../sw.js",{updateViaCache:"none",scope:"../"}).then(r=>r.update()).catch(()=>{});
}
dLoad(); renderGrid(); renderItems(); renderPatch(); route();

/* ===================================================================
 *  BİLGİ KUTUSU — item, rün ya da şampiyonun üstüne gelince açılır, imleç gidince kapanır.
 *  Tek bir kutu; olay temsilciliği ile tüm görünümlerde çalışır. Dokunmatik ekranda gösterilmez.
 * =================================================================== */
(()=>{
  if(!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  const box=document.createElement("div"); box.className="tipbox"; box.setAttribute("role","tooltip"); box.hidden=true; document.body.append(box);
  let cur=null, timer=0;
  const SEL="[data-tip],[data-item],[data-ipick],[data-dslot],[data-go^='s-'],[data-dme],[data-dpick],[data-repl]";
  function resolve(el){
    const t=el.closest(SEL); if(!t) return null; const d=t.dataset;
    if(d.tip){ const i=d.tip.indexOf(":"); return {t, k:d.tip.slice(0,i), id:d.tip.slice(i+1)}; }
    if(d.item) return {t,k:"item",id:d.item};
    if(d.ipick) return {t,k:"item",id:d.ipick};
    if(d.dslot){ const [s,i]=d.dslot.split(":"); const en=D[s]&&D[s].items[+i]; return en?{t,k:"item",id:en}:null; }
    if(d.go) return {t,k:"champ",id:d.go.slice(2)};
    if(d.dme) return {t,k:"champ",id:d.dme};
    if(d.dpick) return D[d.dpick]?{t,k:"champ",id:D[d.dpick].c.slug}:null;
    return null;
  }
  const statLines = en => Object.entries(itemStats(en)).filter(([k,v])=>STAT_TR[k]&&v).map(([k,v])=>fmtStat(k,v));
  function itemHTML(en){
    const i=IT[en]; if(!i) return ""; const d=itemData(en)||{}, g=igrp(en);
    const st=statLines(en), rules=[...g.filter(x=>GRP_TR[x]).map(x=>`Tek ${GRP_TR[x]} itemı taşınabilir`), ...(d.ro?["Yalnızca menzilli şampiyonlar"]:[]), ...(isQuest(en)?["Yalnızca destek koridoru"]:[])];
    return `<div class="tb-h">${i.icon?`<img src="${i.icon}" alt="">`:""}<div><b>${esc(i.tr)}</b>${i.tr!==i.en?`<small>${esc(i.en)}</small>`:""}${i.cost?`<span class="tb-cost">${n0(+i.cost)} altın</span>`:""}</div></div>
      ${st.length?`<ul class="tb-st">${st.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:i.st?`<p class="tb-st1">${esc(i.st)}</p>`:""}
      ${i.fx?`<p>${esc(i.fx)}</p>`:""}${rules.length?`<p class="tb-rule">${esc(rules.join(" · "))}</p>`:""}`;
  }
  function runeHTML(n){
    const r=RUNES[n]||[]; return `<div class="tb-h">${ICO_RUNE[n]?`<img class="rd" src="${ICO_RUNE[n]}" alt="">`:""}<div><b>${esc(runeTR(n))}</b>${runeTR(n)!==n?`<small>${esc(n)}</small>`:""}</div></div>${r[1]?`<p>${esc(r[1])}</p>`:`<p class="muted">Açıklama henüz yok.</p>`}`;
  }
  function champHTML(slug){
    const c=BYSLUG[slug]; if(!c) return ""; const pr=c.prof||{};
    const rs=Object.keys(ROLE).filter(r=>c.rs[r]).map(r=>`<li><span>${ROLE[r]}</span> kazanma ${pct(c.rs[r][0])} · seçilme ${pct(c.rs[r][1])}</li>`);
    const st=stylesShown(c, c.main).map(s=>STYLE[s].lbl).join(", ");
    return `<div class="tb-h">${por(c,"sm",true)}<div><b>${esc(c.disp)}</b><small>${esc((pr.cls||[]).map(x=>CLS_TR[x]||x).join(" · ")||(ARCH[c.arch]||{}).lbl||"")}</small><span class="tb-cost">${tierB(c)} ${esc(DMG[c.dmg]||"")}</span></div></div>
      ${rs.length?`<ul class="tb-st">${rs.join("")}</ul>`:""}${st?`<p><b>Oyun stilleri:</b> ${esc(st)}</p>`:""}`;
  }
  function place(t){
    const r=t.getBoundingClientRect(), bw=box.offsetWidth, bh=box.offsetHeight, m=8;
    let x=r.left, y=r.bottom+m; if(x+bw>innerWidth-m) x=innerWidth-m-bw; if(x<m) x=m;
    if(y+bh>innerHeight-m) y=r.top-m-bh; if(y<m) y=Math.min(innerHeight-m-bh, r.bottom+m);
    box.style.left=x+"px"; box.style.top=y+"px";
  }
  function show(info){
    const html = info.k==="item" ? itemHTML(info.id) : info.k==="rune" ? runeHTML(info.id) : info.k==="champ" ? champHTML(info.id) : "";
    if(!html){ hide(); return; }
    box.innerHTML=html; box.hidden=false; place(info.t);
  }
  function hide(){ clearTimeout(timer); box.hidden=true; cur=null; }
  const enter = e => { const info=resolve(e.target); if(!info){ if(cur&&!cur.contains(e.target)) hide(); return; } if(cur===info.t) return;
    clearTimeout(timer); cur=info.t; if(info.t.title) { info.t.dataset.title=info.t.title; info.t.removeAttribute("title"); }
    timer=setTimeout(()=>{ if(cur===info.t) show(info); }, box.hidden?120:0); };
  document.addEventListener("mouseover", enter);
  document.addEventListener("mouseout", e => { if(cur&&!cur.contains(e.relatedTarget)) hide(); });
  document.addEventListener("focusin", enter);
  document.addEventListener("focusout", () => hide());
  addEventListener("scroll", hide, {passive:true, capture:true});
  document.addEventListener("click", () => hide(), true);
})();
