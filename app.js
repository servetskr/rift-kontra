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
function showItem(en){
  const i=IT[en]; if(!i) return;
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(i.tr)}" style="width:min(460px,100%)">
    <div class="sheet-head">${icoImg(en,"ico-lg")}<h3 style="flex:1">${esc(i.tr)}</h3><button class="btn" type="button" data-close aria-label="Kapat">✕</button></div>
    ${ICHG[en]?`<div>${vPill(ICHG[en].v)} <span class="muted small">Yama ${esc(NOTES.patch||"")}</span></div>${changeBody(ICHG[en])}`:CHANGED_ITEMS.has(en)?`<div class="tag even" style="justify-self:start">Yama ${esc(META.patch)}'de değişti</div>`:""}
    <div class="muted small">${i.cat?esc(CAT[i.cat])+" · ":""}İngilizce adı: ${esc(i.en)}${i.cost?` · ${i.cost} altın`:""}</div>
    ${i.st?`<div style="color:var(--teal)">${esc(i.st)}</div>`:""}${i.fx?`<div>${esc(i.fx)}</div>`:""}</div>`;
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
/* ===== WILD RIFT BUILDLERİ (CN sunucu verisi) ===== */
const VAR = {standard:["⚔️","Standart"],"anti-tank":["🛡️","Tanklara karşı"],sustain:["❤️","Uzun dövüş"],poke:["🎯","Dürtmeye karşı"],engage:["⚡","Dalış takımı"],safety:["🧱","Güvenli"],burst:["💥","Ani hasar"],"anti-heal":["🩸","İyileşmeye karşı"],"anti-ap":["✨","Büyüye karşı"],"anti-ad":["🗡️","Fiziksele karşı"],splitpush:["🏰","Koridor baskısı"],tank:["🛡️","Tank"],peel:["🤝","Takımı koru"],"anti-dive":["🧱","Dalışa karşı"],pen:["🔪","Zırh delme"],utility:["🧰","Destekleyici"],bruiser:["💪","Dövüşçü"]};
const SITS = [[/İyileş/i,"🩸","İyileşmeye karşı"],[/tank|HP/i,"🛡️","Tanklara karşı"],[/AD burst/i,"🗡️","Fiziksel patlamaya karşı"],[/AP burst/i,"✨","Büyü patlamasına karşı"],[/hareketli/i,"💨","Kaçan rakiplere karşı"]];
const RUNE_TR = {"Conqueror":"Yenilmez","Lethal Tempo":"Ölümcül Tempo","Electrocute":"Elektrik Ver","Grasp of the Undying":"Hortlağın Pençesi","Summon Aery":"Aery","Aery":"Aery","Arcane Comet":"Sihirli Yıldız","Phase Rush":"Sürat Coşkusu","Fleet Footwork":"Ayağı Çabuk","Guardian":"Muhafız","Aftershock":"Artçı Şok","Dark Harvest":"Karanlık Hasat","First Strike":"İlk Vuruş","Kraken Slayer":"Kraken Avcısı","Glacial Augment":"Buzul Takviyesi"};
const runeTR = n => RUNE_TR[n] || n;
const runeImg = (n,cls) => ICO_RUNE[n] ? `<img class="${cls||""}" src="${ICO_RUNE[n]}" alt="${esc(runeTR(n))}" title="${esc(runeTR(n))}" loading="lazy">` : `<span class="chip">${esc(runeTR(n))}</span>`;
let bRole=null, bVar=0;
const wrBuild = (c,r) => { const b=BUILDS[c.slug]; if(!b) return null; const rr = b.r[r] ? r : b.r[c.main] ? c.main : Object.keys(b.r)[0]; return rr ? {role:rr, ...b.r[rr], sit:b.sit||[]} : null; };
function buildCard(c){
  const b=BUILDS[c.slug];
  if(!b) return `<h2>Önerilen build <small>${esc(ARCH[c.arch].lbl)} · tahmini</small></h2>${buildHTML(c)}`;
  const roles=Object.keys(b.r); if(!roles.includes(bRole)) bRole=roles.includes(pRole)?pRole:roles.includes(c.main)?c.main:roles[0];
  const R=b.r[bRole]; if(!R.v[bVar]) bVar=0; const V=R.v[bVar]; const vm=VAR[V[0]]||["🔧",V[1]||V[0]];
  return `<h2>Önerilen buildler <small>Wild Rift · en iyi oyuncular</small></h2>
    ${roles.length>1?`<div class="seg" style="margin-bottom:10px">${roles.map(r=>`<button type="button" data-br="${r}" aria-pressed="${r===bRole}">${ROLE[r]}</button>`).join("")}</div>`:""}
    <div class="vtabs" role="tablist">${R.v.map((v,i)=>{const m=VAR[v[0]]||["🔧",v[1]||v[0]];return `<button type="button" role="tab" data-bv="${i}" aria-selected="${i===bVar}" title="${esc(v[3].join(" · "))}"><span class="em">${m[0]}</span>${esc(m[1])}</button>`}).join("")}</div>
    ${V[3].length?`<div class="when">${V[3].map(w=>`<span>${esc(w)}</span>`).join("")}</div>`:""}
    <div class="irow">${V[2].map((s,i)=>itile(itemOf(s),i+1)).join('<span class="arrow">›</span>')}</div>
    <div class="bsub">
      ${R.boots?`<div><span class="l">👟</span>${itile(itemOf(R.boots))}</div>`:""}
      ${R.runes&&R.runes.length?`<div class="runes"><span class="l">◈</span>${runeImg(R.runes[0],"ks")}<span class="minor">${R.runes.slice(1).map(n=>runeImg(n)).join("")}</span><span class="rn">${esc(runeTR(R.runes[0]))}</span></div>`:""}
      <div><span class="l">✦</span><span class="chip">${esc(SPELLS[bRole])}</span></div>
    </div>
    ${b.sit&&b.sit.length?`<div class="step-t" style="margin-top:12px">Duruma göre</div><div class="sits">${b.sit.map(([s,ctx])=>{const m=SITS.find(x=>x[0].test(ctx))||[0,"•",ctx];return `<div class="sit" title="${esc(ctx)}"><span class="em">${m[1]}</span>${itile(itemOf(s))}<span class="ctx">${esc(m[2])}</span></div>`}).join("")}</div>`:""}`;
}
/* e: satırdaki şampiyonun bakış açısından puan (>0 iyi) */
function pickRow(c,e,note,role){
  const T=EDGE_TXT(e); const w=role?roleWR(c,role):null;
  return `<button class="pick" type="button" ${champBtnAttrs(c)}>${por(c,"sm")}<span style="min-width:0"><span class="nm">${esc(c.disp)}</span> <span class="tag ${T[0]}">${T[1]} ${sgn(e)}</span><br><span class="why">${note||c.roles.map(r=>ROLE[r]).join(" · ")}</span></span><span class="rt">${tierB(c)}<br>${w!=null?`${pct(w)} <span title="Bu şampiyonun bu koridordaki genel kazanma oranı">koridorda</span>`:pct(c.wr)}</span></button>`;
}

/* ===== ANA SAYFA ===== */
const fmtDate = iso => { try { return new Date(iso).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}); } catch { return iso; } };
function renderHome(){
  const top5 = [...LIST].filter(c=>c.wr&&c.pr>=1).sort((a,b)=>b.wr-a.wr).slice(0,5);
  $("#heroFaces").innerHTML = top5.map(c=>`<button class="facebtn" style="width:auto" type="button" ${champBtnAttrs(c)} aria-label="${esc(c.disp)}">${por(c)}<span>${esc(c.disp)}</span></button>`).join("");
  // Yama notları (otomatik)
  const n = META.notes;
  const ORDER=["new","rework","buff","nerf","adj"];
  const champs = n ? (n.champs||[]).map(s=>BYSLUG[s]).filter(Boolean).sort((a,b)=>ORDER.indexOf((CHG[a.slug]||{}).v)-ORDER.indexOf((CHG[b.slug]||{}).v)) : [];
  const items = n ? (n.it ? Object.keys(ICHG) : (n.items||[])).sort((a,b)=>ORDER.indexOf((ICHG[a]||{}).v)-ORDER.indexOf((ICHG[b]||{}).v)) : [];
  const used = new Set([...champs.map(c=>(CHG[c.slug]||{}).v),...items.map(e=>(ICHG[e]||{}).v)]);
  const newOnes = LIST.filter(c=>c.isNew);
  $("#patchNotes").innerHTML = (n ? `
    <div class="vlegend">${ORDER.filter(v=>used.has(v)).map(v=>`<span>${chgBadge(v)} ${VMARK[v][1]}</span>`).join("")}</div>
    ${champs.length?`<div class="chgrid">${champs.map(c=>`<button class="chtile" type="button" data-chg="${c.slug}" aria-label="${esc(c.disp)}: ${esc((VMARK[(CHG[c.slug]||{}).v]||["",""])[1])}">${por(c)}<span>${esc(c.disp)}</span></button>`).join("")}</div>`:""}
    ${items.length?`<div class="chgrid it">${items.map(en=>itile(en)).join("")}</div>`:""}
    <p class="muted small" style="margin:10px 0">Ayrıntı için simgeye dokun.</p>
    <a href="${esc(n.url)}" target="_blank" rel="noopener">Yama ${esc(n.patch)} notlarının tamamını oku →</a>`
    : `<p class="muted">Bu yamanın Türkçe notları henüz yayınlanmadı.</p>`)
    + (newOnes.length?`<div class="callout" style="margin-top:12px"><b>Sisteme yeni eklenenler:</b> ${newOnes.map(c=>`<a href="#s-${c.slug}">${esc(c.disp)}</a>`).join(", ")}</div>`:"");
  $("#roleBest").innerHTML = Object.keys(ROLE).map(r=>{
    const best=LIST.filter(c=>c.rs[r]&&c.rs[r][1]>=1).sort((a,b)=>b.rs[r][0]-a.rs[r][0]).slice(0,4);
    return `<div class="rb">${roleB(r)}<div class="faces">${best.map(c=>`<button class="facebtn" type="button" ${champBtnAttrs(c)}>${por(c,"sm")}<span>${esc(c.disp)}</span></button>`).join("")}</div></div>`;
  }).join("");
}

/* ===== KONTRA ===== */
let kEnemy=null, kRole="auto";
function renderKontra(){
  $("#k-slot").innerHTML=`<button class="slot${kEnemy?" filled":""}" type="button" id="k-pick" style="max-width:340px">${slotHTML(kEnemy,"Rakip şampiyonu seç")}</button>`;
  const av=kEnemy?boardRoles(kEnemy):Object.keys(ROLE);
  if(kRole!=="auto"&&kRole!=="all"&&!av.includes(kRole)) kRole="auto";
  const autoR=kEnemy?(av.includes(kEnemy.main)?kEnemy.main:av[0]):null;
  const roles=[["auto",autoR?`Rakibinle aynı (${ROLE[autoR]})`:"Rakibinle aynı"],...Object.entries(ROLE).filter(([k])=>av.includes(k)),["all","Hepsi"]];
  $("#k-roles").innerHTML=roles.map(([k,v])=>`<button type="button" data-r="${k}" aria-pressed="${k===kRole}">${v}</button>`).join("");
  const out=$("#k-out");
  if(!kEnemy){out.innerHTML='<div class="empty">Başlamak için yukarıdan rakip şampiyonu seç.</div>';return}
  const avail=boardRoles(kEnemy);
  let role = kRole==="auto" ? (avail.includes(kEnemy.main)?kEnemy.main:avail[0]) : kRole;
  // Satırları topla: [şampiyon, puan (seçen için), koridor]
  let rows=[];
  const roleList = role==="all" ? avail : [role];
  roleList.forEach(r=>(MU[r][kEnemy.slug]||[]).forEach(([s,e])=>{const c=BYSLUG[s]; if(c) rows.push({c,e,r})}));
  if(role==="all"){const m=new Map();rows.forEach(x=>{const p=m.get(x.c.slug);if(!p||Math.abs(x.e)>Math.abs(p.e))m.set(x.c.slug,x)});rows=[...m.values()]}
  const byWr=(a,b)=>(roleWR(b.c,b.r)||b.c.wr||0)-(roleWR(a.c,a.r)||a.c.wr||0);
  const good=rows.filter(x=>x.e>0).sort((a,b)=>b.e-a.e||byWr(a,b));
  const even=rows.filter(x=>x.e===0).sort(byWr);
  const bad=rows.filter(x=>x.e<0).sort((a,b)=>a.e-b.e||byWr(b,a));
  const meta=[];
  const best=good[0];
  if(!rows.length){out.innerHTML=`<div class="empty">${esc(kEnemy.disp)} için ${role==="all"?"":ROLE_LONG[role].toLocaleLowerCase("tr")+" "}eşleşme verisi yok. ${avail.length?`Veri olan koridorlar: ${avail.map(r=>ROLE[r]).join(", ")}.`:""}</div>`;return}
  out.innerHTML=`
  ${best?`<div class="callout"><b>Kısa cevap:</b> ${esc(kEnemy.disp)} karşısında ${role==="all"?"":ROLE_LONG[role].toLocaleLowerCase("tr")+" için "}en iyi seçim <b>${esc(best.c.disp)}</b>${good[1]?`, alternatif olarak <b>${esc(good[1].c.disp)}</b>`:""}${good[2]?` ya da <b>${esc(good[2].c.disp)}</b>`:""}.</div>`:""}
  <div class="grid2">
    <div class="card">
      <div class="row" style="gap:14px">${por(kEnemy)}<div><h2 style="margin:0">${esc(kEnemy.disp)}</h2><div class="row" style="gap:6px;margin-top:4px">${tierB(kEnemy)}${kEnemy.roles.map(roleB).join("")}<span class="chip ${kEnemy.dmg.toLowerCase()}">${DMG[kEnemy.dmg]}</span></div></div></div>
      <h2 style="margin-top:16px">Ona karşı nasıl oynanır</h2>${howToBeat(kEnemy)}
      <div class="row" style="margin-top:12px"><a class="btn" href="#s-${kEnemy.slug}" style="text-decoration:none">${esc(kEnemy.disp)} profilini aç</a></div>
    </div>
    <div class="card">
      <h2>Sana önerilenler <small>${role==="all"?"tüm koridorlar":ROLE_LONG[role]} · ${good.length} seçenek</small></h2>
      <div class="list">${good.map(x=>pickRow(x.c,x.e,`${esc(kEnemy.disp)} karşısında ${x.e>=2?"çok":""} avantajlı${role==="all"?" · "+ROLE[x.r]:""}`,x.r)).join("")||'<div class="empty">Bu koridorda avantajlı eşleşme yok. Dengeli seçeneklere bak.</div>'}</div>
      ${even.length?`<details style="margin-top:14px"><summary style="cursor:pointer;font-weight:600">Dengeli eşleşmeler (${even.length}) <span class="muted small">— kim iyi oynarsa kazanır</span></summary><div class="list" style="margin-top:8px">${even.map(x=>pickRow(x.c,0,`Eşit eşleşme${role==="all"?" · "+ROLE[x.r]:""}`,x.r)).join("")}</div></details>`:""}
      <h2 style="margin-top:18px">Bunları seçme <small>${esc(kEnemy.disp)} bunlara karşı üstün</small></h2>
      <div class="list">${bad.map(x=>pickRow(x.c,x.e,`${esc(kEnemy.disp)} karşısında zorlanır${role==="all"?" · "+ROLE[x.r]:""}`,x.r)).join("")||'<div class="empty">Bu koridorda dezavantajlı eşleşme yok.</div>'}</div>
      <p class="muted small" style="margin:14px 0 0">Puan, WildRiftCore'un eşleşme tahtasından gelir (${META.matchupsAt?"güncelleme: "+fmtDate(META.matchupsAt):""}${META.matchupsPatch&&META.matchupsPatch!==META.patch?", önceki yama "+esc(META.matchupsPatch)+" verisi; yeni yama verisi bekleniyor":""}) (Çin sunucusu, Master+). +3 en büyük avantaj, −3 en büyük dezavantaj. Sağdaki yüzde, o şampiyonun bu koridordaki genel kazanma oranıdır; iki şampiyonun birbirine karşı oranı değildir.</p>
    </div>
  </div>`;
}
$("#k-slot").addEventListener("click",()=>openPicker("Rakip şampiyon",c=>{kEnemy=c;history.replaceState(null,"","#kontra-"+c.slug);renderKontra()}));
$("#k-roles").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;kRole=b.dataset.r;renderKontra()});

/* "Nasıl yenilir" metni */
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

/* ===== ITEM REHBERİ ===== */
const CLASS_OF={crit_adc:"mm",onhit_adc:"mm",lethal_adc:"mm",caster_adc:"mm",ad_assassin:"as",bruiser:"fi",juggernaut:"fi",skirmisher:"fi",crit_melee:"fi",tank:"ta",tank_jg:"ta",tank_sup:"ta",ap_tank:"ta",mage_burst:"ma",mage_control:"ma",mage_battle:"ma",ap_assassin:"ma",ap_onhit:"ma",mage_sup:"ma",enchanter:"en"};
const POOL={
  heal:{mm:[["Mortal Reminder","fiziksel hasarın ağır yara uygular"]],ma:[["Morellonomicon","büyü hasarın iyileşmeyi keser"]],fi:[["Chempunk Chainsword","dövüşçü özellikleriyle birlikte ağır yara"]],as:[["Chempunk Chainsword","kombondan sonra rakip iyileşemez"]],ta:[["Thornmail","sana vuran ağır yara yer"]],en:[["Echoes of Helia","uzun savaşta takımını ayakta tut; ağır yarayı nişancına bırak"]]},
  shield:{mm:[["Serpent's Fang","rakip kalkanlarını küçültür"]],as:[["Serpent's Fang","kalkanlı hedefi tek komboda indirirsin"]],fi:[["Serpent's Fang","kalkan yığan rakiplere karşı"]],ma:[["Oceanid's Trident","büyü hasarınla kalkanları küçültür"]]},
  ap:{mm:[["Wit's End","büyü direnci ve saldırı hızı birlikte"],["Maw of Malmortius","büyü patlamasına karşı kalkan"]],ma:[["Banshee's Veil","bir yeteneği engeller, büyü direnci verir"]],fi:[["Maw of Malmortius","büyü patlamasına karşı kalkan"],["Force of Nature","uzun savaşta büyü direnci yığar"]],as:[["Maw of Malmortius","büyü patlamasına karşı kalkan"],["Edge of Night","bir yeteneği engeller"]],ta:[["Force of Nature","büyü hasarı aldıkça büyü direnci artar"],["Kaenic Rookern","yüksek büyü direnci ve büyü kalkanı"]],en:[["Mikael's Blessing","arkadaşına gelen kontrolü temizlersin"]]},
  ad:{mm:[["Guardian Angel","üstüne dalınırsa ikinci can"]],ma:[["Zhonya's Hourglass","zırh ve dokunulmazlık"]],fi:[["Death's Dance","fiziksel ani hasarı zamana yayar"]],as:[["Death's Dance","fiziksel ani hasarı zamana yayar"],["Guardian Angel","daldıktan sonra ikinci şans"]],ta:[["Randuin's Omen","yüksek zırh, kritik hasarı azaltır"],["Thornmail","yüksek zırh ve hasar yansıtma"]],en:[["Locket of the Iron Solari","takıma kalkan, dalışı karşılar"]]},
  aa:{ta:[["Frozen Heart","rakiplerin saldırı hızını düşürür"],["Randuin's Omen","kritik hasarı azaltır"]],fi:[["Randuin's Omen","kritik nişancılara karşı"]],ma:[["Zhonya's Hourglass","normal saldırıyla dalanlara karşı zaman kazandırır"]],mm:[["Immortal Shieldbow","düellolarda kalkan"]],as:[["Death's Dance","uzun düelloda hasarı yayar"]],en:[["Knight's Vow","nişancına gelen hasarı paylaşırsın"]]},
  cc:{mm:[["Mercurial Scimitar","aktifiyle kontrolü temizler"]],ma:[["Quicksilver Sash","ucuz kontrol temizleme"]],fi:[["Sterak's Gage","etki direnci ve büyük kalkan"]],as:[["Mercurial Scimitar","aktifiyle kontrolden kurtul"]],ta:[["Gargoyle Stoneplate","kontrol altında bile ayakta kalırsın"]],en:[["Mikael's Blessing","arkadaşının kontrolünü temizler"]]},
  burst:{mm:[["Immortal Shieldbow","suikastçı patlamasına karşı kalkan"],["Guardian Angel","odaklanırsan dirilirsin"]],ma:[["Zhonya's Hourglass","suikastçının kombosunu boşa çıkarır"]],fi:[["Sterak's Gage","ani hasarı emen kalkan"]],as:[["Edge of Night","ilk yeteneği engeller"]],ta:[["Gargoyle Stoneplate","aktif kalkan ani hasarı emer"]],en:[["Locket of the Iron Solari","takıma alan kalkanı"]]},
  tank:{mm:[["Dominik's Regards","canı yüksek hedeflere ekstra hasar ve zırh delme"],["Blade of the Ruined King","mevcut can yüzdesi hasarı"]],ma:[["Void Staff","%40 büyü delme"],["Liandry's Torment","uzun savaşta büyüyen yanma"]],fi:[["Black Cleaver","zırhı yığarak düşürür"]],as:[["Serylda's Grudge","yüzde zırh delme ve yavaşlatma"]],ta:[["Abyssal Mask","takımının büyü hasarını artırır"]],en:[["Staff of Flowing Waters","taşıyıcılarının hasarını güçlendirir"]]},
};
const THREAT={heal:["İyileşme","iyileşen şampiyon"],shield:["Kalkan","kalkan veren şampiyon"],ap:["Büyü hasarı ağırlıklı",""],ad:["Fiziksel hasar ağırlıklı",""],aa:["Normal saldırıyla vuranlar","sürekli saldırıyla hasar veren"],cc:["Yoğun kitle kontrolü","kontrol yeteneği olan"],burst:["Ani hasar / suikastçı","suikastçı ya da ani hasarcı"],tank:["Tanklar","dayanıklı şampiyon"]};
function analyse(en){
  const p={ad:0,ap:0,heal:[],shield:[],cc:[],tank:[],burst:[],aa:[]};
  en.forEach(c=>{
    if(c.dmg==="AD")p.ad++;else if(c.dmg==="AP")p.ap++;else{p.ad+=.5;p.ap+=.5}
    if(c.tags.includes("heal"))p.heal.push(c);
    if(c.tags.includes("shield")||c.arch==="enchanter")p.shield.push(c);
    if(c.tags.includes("cc"))p.cc.push(c);
    if(c.tags.includes("tank")||/tank/.test(c.arch))p.tank.push(c);
    if(/assassin/.test(c.arch)||c.tags.includes("burst"))p.burst.push(c);
    if(/crit_adc|onhit_adc|crit_melee|lethal_adc|ap_onhit/.test(c.arch))p.aa.push(c);
  });
  const t=[], n=en.length||1, add=(k,s,who)=>t.push({k,s,who});
  if(p.heal.length) add("heal",p.heal.length>=2?2:1,p.heal);
  if(p.shield.length>=2) add("shield",p.shield.length>=3?2:1,p.shield);
  if(p.ap/n>=.5&&p.ap>=2) add("ap",p.ap>=3.5?2:1,[]);
  if(p.ad/n>=.5&&p.ad>=2) add("ad",p.ad>=3.5?2:1,[]);
  if(p.aa.length>=2) add("aa",p.aa.length>=3?2:1,p.aa);
  if(p.cc.length>=3) add("cc",p.cc.length>=4?2:1,p.cc);
  if(p.burst.length>=2) add("burst",p.burst.length>=3?2:1,p.burst);
  if(p.tank.length>=2) add("tank",p.tank.length>=3?2:1,p.tank);
  t.sort((a,b)=>b.s-a.s); p.threats=t; return p;
}
let iMe=null, iEn=[null,null,null,null,null];
const EN_PH=["Rakip Baron","Rakip Orman","Rakip Orta","Rakip Ejderha","Rakip Destek"], EN_R=["top","jg","mid","adc","sup"];
function renderItem(){
  $("#i-me").innerHTML=`<button class="slot${iMe?" filled":""}" type="button" data-slot="me">${slotHTML(iMe,"Şampiyonunu seç")}</button>`;
  $("#i-enemies").innerHTML=iEn.map((c,i)=>`<button class="slot${c?" filled":""}" type="button" data-slot="${i}">${slotHTML(c,EN_PH[i])}</button>`).join("");
  const out=$("#i-out"), en=iEn.filter(Boolean);
  if(!iMe){out.innerHTML='<div class="empty">Önce kendi şampiyonunu seç. Rakipleri ekledikçe öneriler güncellenir.</div>';return}
  const cls=CLASS_OF[iMe.arch], p=analyse(en);
  let a=ARCH[iMe.arch], core=OVERRIDE[iMe.name]||a.core, vNote="";
  // Wild Rift build verisi varsa rakibe uyan varyantı seç
  const wb=wrBuild(iMe,iMe.main);
  if(wb){
    const want = p.tank.length>=2 ? ["anti-tank"] : (p.burst.length>=2||p.aa.length>=2) ? ["safety","sustain"] : p.ap>=3 ? ["poke","safety"] : [];
    const V = wb.v.find(v=>want.includes(v[0])) || wb.v[0];
    const its = V[2].map(itemOf);
    a = {...a, start: undefined, boots: wb.boots?itemOf(wb.boots):a.boots, rune: runeTR(wb.runes[0]||a.rune), late: its.slice(3)};
    core = its.slice(0,3);
    if(V!==wb.v[0]) vNote = `Rakibe göre <b>${esc((VAR[V[0]]||["",V[1]])[1])}</b> buildi seçildi. `;
  }
  const recs=new Map();
  p.threats.forEach(t=>(POOL[t.k][cls]||[]).forEach(([n,why],i)=>{
    const cur=recs.get(n), sc=t.s*10-i;
    if(cur){cur.sc+=sc;cur.why.push(why);cur.from.push(THREAT[t.k][0])} else recs.set(n,{n,sc,why:[why],from:[THREAT[t.k][0]]});
  }));
  const sit=[...recs.values()].filter(r=>!core.includes(r.n)).sort((x,y)=>y.sc-x.sc);
  let boots=a.boots, bootWhy="Bu şampiyon tipinin standart çizmesi.";
  if(cls!=="mm"&&cls!=="en"){ if((p.ap>=3||p.cc.length>=3)&&p.ap>=p.ad){boots="Mercury's Treads";bootWhy="Rakipte büyü hasarı ve kitle kontrolü fazla."} else if(p.ad>=3&&p.aa.length>=2){boots="Plated Steelcaps";bootWhy="Rakipte normal saldırıyla vuran birden çok şampiyon var."} }
  // Sıralı yol
  const path=[];
  if(a.start) path.push({n:a.start,why:"Destek başlangıç itemı; görevleri tamamlayınca güçlenir.",k:"core"});
  path.push({n:core[0],why:"İlk çekirdek item; gücünün çoğu buradan gelir.",k:"core"});
  path.push({n:boots,why:bootWhy,k:boots!==a.boots?"sit":"core"});
  path.push({n:core[1],why:"İkinci çekirdek item.",k:"core"});
  const s1=sit[0], s2=sit[1];
  if(s1&&s1.sc>=20){path.push({n:s1.n,why:`${[...new Set(s1.from)].join(" + ")}: ${[...new Set(s1.why)].join("; ")}.`,k:"sit"});path.push({n:core[2],why:"Üçüncü çekirdek item.",k:"core"})}
  else{path.push({n:core[2],why:"Üçüncü çekirdek item.",k:"core"}); if(s1)path.push({n:s1.n,why:`${[...new Set(s1.from)].join(" + ")}: ${[...new Set(s1.why)].join("; ")}.`,k:"sit"})}
  if(s2) path.push({n:s2.n,why:`${[...new Set(s2.from)].join(" + ")}: ${[...new Set(s2.why)].join("; ")}.`,k:"sit"});
  for(const l of a.late){ if(path.length>=(a.start?7:6))break; if(!path.some(x=>x.n===l)) path.push({n:l,why:"Geç oyun tamamlayıcısı.",k:"core"}); }
  const tot=p.ad+p.ap||1, adP=Math.round(p.ad/tot*100);
  out.innerHTML=`<div class="grid2">
    <div class="card"><h2>Bu maç için item sıran <small>${esc(iMe.disp)} · ${esc(a.lbl)}</small></h2>
      <div class="path">${path.map((s,i)=>{const it=IT[s.n];return `<div class="pstep${s.k==="sit"?" sit":""}"><span class="no">${i+1}</span><span style="min-width:0"><button type="button" class="itm" data-item="${esc(s.n)}" style="padding:0;border:0;background:none;font-weight:600;font-size:15px">${icoImg(s.n)}${esc(iname(s.n))}</button>${s.k==="sit"?' <span class="badge">BU MAÇA ÖZEL</span>':""}<br><span class="why">${esc(s.why)}</span></span><span class="cost">${it&&it.cost?it.cost+" altın":""}</span></div>`}).join("")}</div>
      <p class="muted small" style="margin:12px 0 0">${vNote}Turkuaz kutular rakip takım yüzünden eklendi. Itemın adına dokununca özelliklerini görürsün. Ana rün: <b>${esc(a.rune)}</b> · Büyüler: <b>${esc(SPELLS[iMe.main])}</b></p>
    </div>
    <div class="card"><h2>Rakip takım neyle tehdit ediyor <small>${en.length}/5 şampiyon</small></h2>
      ${en.length?`<div class="dmgbar" role="img" aria-label="Fiziksel %${adP}, büyü %${100-adP}"><i style="width:${adP}%;background:var(--ad)"></i><i style="width:${100-adP}%;background:var(--ap)"></i></div>
      <div class="legend"><span style="color:var(--ad)">Fiziksel %${adP}</span><span style="color:var(--ap)">Büyü %${100-adP}</span></div>
      <div class="list" style="margin-top:14px">${p.threats.map(t=>`<div class="threat"><span class="lv" data-s="${t.s}">${t.s===2?"YÜKSEK":"ORTA"}</span><span><b>${THREAT[t.k][0]}</b><span>${t.who.length?`${t.who.length} ${THREAT[t.k][1]}: ${esc(t.who.map(c=>c.disp).join(", "))}`:(t.k==="ap"?"Büyü direnci (BD) değerli.":"Zırh değerli.")}</span></span></div>`).join("")||'<div class="empty">Belirgin bir tehdit yok; çekirdek build yeterli.</div>'}</div>`
      :'<div class="empty">Rakip takımdan en az bir şampiyon seç.</div>'}
    </div></div>`;
}
document.getElementById("v-item").addEventListener("click",e=>{
  const s=e.target.closest("[data-slot]"); if(!s) return;
  const k=s.dataset.slot;
  if(k==="me") openPicker("Senin şampiyonun",c=>{iMe=c;renderItem()});
  else openPicker(EN_PH[+k],c=>{iEn[+k]=c;renderItem()},EN_R[+k]);
});
$("#i-sample").addEventListener("click",()=>{iMe=CH[key("Jinx")];iEn=["Darius","Lee Sin","Syndra","Kai'Sa","Leona"].map(n=>CH[key(n)]);renderItem()});
$("#i-clear").addEventListener("click",()=>{iMe=null;iEn=[null,null,null,null,null];renderItem()});

/* ===== ŞAMPİYONLAR ===== */
let cRole="all";
$("#c-roles").innerHTML=[["all","Tümü"],...Object.entries(ROLE)].map(([k,v])=>`<button type="button" data-r="${k}" aria-pressed="${k==="all"}">${v}</button>`).join("");
$("#c-roles").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;cRole=b.dataset.r;[...$("#c-roles").children].forEach(x=>x.setAttribute("aria-pressed",x===b));renderGrid()});
$("#c-q").addEventListener("input",renderGrid);
/* Sıralama tercihi tarayıcıda hatırlanır */
const pref = (k,d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const setPref = (k,v) => { try { localStorage.setItem(k,v); } catch {} };
let cSort = pref("rk-csort","az"), tSort = pref("rk-tsort","wr");
const segSet = (id,v) => [...$(id).children].forEach(x=>x.setAttribute("aria-pressed",x.dataset.s===v));
segSet("#c-sort",cSort);
$("#c-sort").addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;cSort=b.dataset.s;setPref("rk-csort",cSort);segSet("#c-sort",cSort);renderGrid()});
const TORD = {S:0,A:1,B:2,C:3,D:4,"?":5};
function renderGrid(){
  const q=key($("#c-q").value);
  const wrOf = c => cRole==="all" ? c.wr : (c.rs[cRole]?c.rs[cRole][0]:null);
  const rows=LIST.filter(c=>(cRole==="all"||c.roles.includes(cRole))&&(!q||key(c.disp).includes(q)))
    .sort(cSort==="tier" ? (a,b)=>(TORD[tierOf(wrOf(a))]-TORD[tierOf(wrOf(b))])||((wrOf(b)||0)-(wrOf(a)||0)) : (a,b)=>a.disp.localeCompare(b.disp,"tr"));
  $("#c-grid").innerHTML=rows.map(c=>`<button class="ccard" type="button" ${champBtnAttrs(c)}>${por(c)}<span class="nm">${esc(c.disp)}</span><span class="bt">${(t=>`<span class="tier" data-t="${t}">${t}</span>`)(tierOf(wrOf(c)))}<small>${pct(wrOf(c))}</small></span></button>`).join("")||'<div class="empty">Bulunamadı.</div>';
}

/* ===== PROFİL ===== */
let pRole=null, pSlug=null;
function renderProfile(slug){
  const c=BYSLUG[slug]; const v=$("#v-profil");
  if(slug!==pSlug){pSlug=slug;pRole=null;bRole=null;bVar=0;}
  if(!c){v.innerHTML='<div class="empty">Şampiyon bulunamadı. <a href="#sampiyonlar">Listeye dön</a>.</div>';return}
  const pr=c.prof||{};
  const br=boardRoles(c); if(!br.includes(pRole)) pRole=br.includes(c.main)?c.main:br[0];
  const board=pRole?(MU[pRole][c.slug]||[]).map(([s,e])=>({o:BYSLUG[s],e})).filter(x=>x.o):[];
  const strong=board.filter(x=>x.e<0).sort((a,b)=>a.e-b.e);
  const weak=board.filter(x=>x.e>0).sort((a,b)=>b.e-a.e);
  const slotName={"PASİF":"Pasif","1":"1. yetenek","2":"2. yetenek","3":"3. yetenek","ULTİ":"Ulti"};
  v.innerHTML=`
  <div class="row"><a href="#sampiyonlar" class="small">← Tüm şampiyonlar</a></div>
  <div class="card prof-head">
    ${por(c,"lg")}
    <div style="min-width:0">
      <h1>${esc(c.disp)}</h1>${pr.t?`<div class="title">${esc(pr.t)}</div>`:""}
      <div class="prof-meta">${c.roles.map(roleB).join("")}${(pr.cls||[]).map(x=>`<span class="chip">${esc(CLS_TR[x]||x)}</span>`).join("")}<span class="chip ${c.dmg.toLowerCase()}">${DMG[c.dmg]}</span>${pr.d?`<span class="chip">Zorluk: ${esc(pr.dn)}<span class="diff">${[1,2,3].map(i=>`<i class="${i<=pr.d?"on":""}"></i>`).join("")}</span></span>`:""}</div>
      <div class="kpis">
        <div class="kpi"><b>${tierB(c)}</b><span>Kademe</span></div>
        <div class="kpi"><b>${pct(c.wr)}</b><span>Kazanma oranı</span></div>
        <div class="kpi"><b>${pct(c.pr)}</b><span>Seçilme oranı</span></div>
        <div class="kpi"><b>${pct(c.br)}</b><span>Yasaklanma oranı</span></div>
      </div>
      ${c.wr==null?'<p class="muted small" style="margin:8px 0 0">Bu şampiyon için bu yamada yeterli dereceli verisi yok.</p>':""}
      ${Object.keys(c.rs).length>1?`<div class="small" style="margin-top:10px;display:grid;gap:4px">${Object.keys(c.rs).sort((a,b)=>c.rs[b][1]-c.rs[a][1]).map(r=>`<div>${roleB(r)} <span class="tier" data-t="${tierOf(c.rs[r][0])}">${tierOf(c.rs[r][0])}</span> <span class="muted">kazanma ${pct(c.rs[r][0])} · seçilme ${pct(c.rs[r][1])}</span></div>`).join("")}</div>`:""}
      ${c.isNew?'<p class="callout small" style="margin:10px 0 0">Bu şampiyon yeni yamayla otomatik eklendi. Sınıfı ve önerilen build resmi sınıfına göre tahmin edildi.</p>':""}
    </div>
  </div>
  ${CHG[c.slug]?`<div class="card chcard" data-v="${CHG[c.slug].v}"><h2>Yama ${esc(NOTES.patch||"")}'de ${vPill(CHG[c.slug].v)}</h2>${changeBody(CHG[c.slug])}</div>`:""}
  <div class="grid2">
    <div class="card"><h2>Yetenekler</h2><div class="abil">${(pr.ab||[]).map(a=>{const cp=CHG[c.slug]&&CHG[c.slug].c.find(p=>p[0]===a[0]);const d=cp?cp[3].reduce((x,l)=>x+l[1],0):null;return `<div class="ab${cp?" chg-ab":""}">${a[3]?`<span class="abi"><img src="${a[3]}" alt="">${cp?chgBadge(d>0?"buff":d<0?"nerf":"adj"):""}</span>`:'<span></span>'}<div><div class="k">${esc(slotName[a[1]]||a[1])}</div><div class="n">${esc(a[0])}</div><p>${esc(a[2])}</p></div></div>`}).join("")||'<div class="empty">Yetenek bilgisi yok.</div>'}</div></div>
    <div style="display:grid;gap:20px;align-content:start">
      <div class="card" id="pf-build">${buildCard(c)}</div>
      <div class="card"><h2>Nasıl oynanır</h2><p style="margin:0">${esc(c.tip)}</p></div>
      <div class="card"><h2>Karşısına çıkarsa nasıl yenilir</h2>${howToBeat(c)}</div>
    </div>
  </div>
  ${br.length?`<div class="row"><b>Eşleşmeler:</b><div class="seg" id="pf-roles">${br.map(r=>`<button type="button" data-r="${r}" aria-pressed="${r===pRole}">${ROLE_LONG[r]}</button>`).join("")}</div></div>`:'<div class="empty">Bu şampiyon için eşleşme verisi yok.</div>'}
  <div class="grid2">
    <div class="card"><h2>Rahat ettiği rakipler <small>${strong.length}</small></h2><div class="list">${strong.map(x=>pickRow(x.o,x.e,`${esc(c.disp)} bu rakibe karşı üstün`,pRole)).join("")||'<div class="empty">Kayıt yok.</div>'}</div></div>
    <div class="card"><h2>Zorlandığı rakipler <small>${weak.length}</small></h2><div class="list">${weak.map(x=>pickRow(x.o,x.e,`Bu rakip ${esc(c.disp)} karşısında üstün`,pRole)).join("")||'<div class="empty">Kayıt yok.</div>'}</div></div>
  </div>
  <p class="muted small" style="margin:0">Etiketler listedeki şampiyonun gözünden: "Sert kontra +2", o şampiyonun ${esc(c.disp)} karşısında çok avantajlı olduğu anlamına gelir. Kaynak: WildRiftCore eşleşme tahtası, yama ${esc(META.patch||"")}.</p>
  <div class="row"><button class="btn gold" type="button" id="pf-k">Buna kontra bul</button><button class="btn" type="button" id="pf-i">Bu şampiyonla item rehberi</button></div>`;
  $("#pf-k").onclick=()=>{kRole="auto";location.hash="kontra-"+c.slug};
  $("#pf-i").onclick=()=>{iMe=c;location.hash="item"};
  $("#pf-build").onclick=e=>{const b=e.target.closest("[data-br],[data-bv]");if(!b)return;if(b.dataset.br){bRole=b.dataset.br;bVar=0}else bVar=+b.dataset.bv;$("#pf-build").innerHTML=buildCard(c)};
  const pr2=$("#pf-roles"); if(pr2) pr2.onclick=e=>{const b=e.target.closest("[data-r]");if(!b)return;pRole=b.dataset.r;const y=window.scrollY;renderProfile(slug);window.scrollTo(0,y)};
  document.title = `${c.disp} · Rift Kontra`;
}

/* ===== KADEME ===== */
let tRole="top";
$("#t-roles").innerHTML=Object.entries(ROLE).map(([k,v])=>`<button type="button" data-r="${k}" aria-pressed="${k===tRole}">${v}</button>`).join("");
segSet("#t-sort",tSort);
$("#t-sort").addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;tSort=b.dataset.s;setPref("rk-tsort",tSort);segSet("#t-sort",tSort);renderTier()});
$("#t-roles").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;tRole=b.dataset.r;[...$("#t-roles").children].forEach(x=>x.setAttribute("aria-pressed",x===b));renderTier()});
function renderTier(){
  const r=tRole;
  const rows=LIST.filter(c=>c.rs[r]&&c.rs[r][1]>=0.5).map(c=>({c,wr:c.rs[r][0],pr:c.rs[r][1]})).sort(tSort==="az"?(a,b)=>a.c.disp.localeCompare(b.c.disp,"tr"):(a,b)=>b.wr-a.wr);
  const noData=LIST.filter(c=>!Object.keys(c.rs).length).map(c=>c.disp);
  $("#t-out").innerHTML=["S","A","B","C","D"].map(t=>{const g=rows.filter(x=>tierOf(x.wr)===t);return `<div class="tierrow"><div class="tl" data-t="${t}">${t}</div><div class="faces">${g.map(x=>`<button class="facebtn" type="button" ${champBtnAttrs(x.c)} title="Seçilme oranı ${pct(x.pr)}">${por(x.c)}<span>${esc(x.c.disp)}</span><small>${pct(x.wr)}</small></button>`).join("")||'<span class="muted small" style="line-height:56px">Bu kademede şampiyon yok.</span>'}</div></div>`}).join("")
   + `<p class="muted small" style="margin:12px 0 0">${ROLE_LONG[r]} için bu koridorda en az %0,5 oranında seçilen şampiyonlar gösterilir; bir şampiyon birden çok koridorda görünebilir. Yama ${esc(META.patch||"")} · ${esc((window.WR_STATS||{}).rank||"")}.${noData.length?` Bu yamada verisi olmayanlar: ${esc(noData.join(", "))}.`:""}</p>`;
}

/* ===== EŞYALAR ===== */
let eCat="all";
$("#e-cats").innerHTML=[["all","Tümü"],...Object.entries(CAT)].map(([k,v])=>`<button type="button" data-c="${k}" aria-pressed="${k==="all"}">${v}</button>`).join("");
$("#e-cats").addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;eCat=b.dataset.c;[...$("#e-cats").children].forEach(x=>x.setAttribute("aria-pressed",x===b));renderItems()});
$("#e-q").addEventListener("input",renderItems);
function renderItems(){
  const q=key($("#e-q").value);
  const rows=ILIST.filter(i=>(eCat==="all"||i.cat===eCat)&&(!q||key(i.tr+" "+i.en+" "+i.st+" "+i.fx).includes(q)));
  $("#e-grid").innerHTML=rows.map(i=>`<div class="icard${CHANGED_ITEMS.has(i.en)?" hl":""}" id="it-${key(i.en)}"><div class="top"><span class="row" style="gap:8px;flex-wrap:nowrap">${icoImg(i.en,"ico-md")}<span><span class="nm">${esc(i.tr)}</span><br><span class="en">${esc(i.en)}</span></span></span><span class="cost">${i.cost?i.cost+" altın":esc(CAT[i.cat])}</span></div>${CHANGED_ITEMS.has(i.en)?`<span class="tag even" style="justify-self:start">Yama ${esc(META.patch)}'de değişti</span>`:""}<span class="st">${esc(i.st)}</span><span class="fx">${esc(i.fx)}</span></div>`).join("")||'<div class="empty">Eşleşen item yok.</div>';
}

/* ===== YÖNLENDİRME ===== */
const VIEWS=["ana","kontra","item","sampiyonlar","kademe","esyalar"];
function route(){
  const h=(location.hash||"#ana").slice(1);
  let v=VIEWS.includes(h)?h:"ana";
  if(h.startsWith("kontra-")&&BYSLUG[h.slice(7)]){kEnemy=BYSLUG[h.slice(7)];v="kontra";}
  if(h.startsWith("s-")){v="profil";renderProfile(h.slice(2))} else document.title=v==="kontra"&&kEnemy?`${kEnemy.disp} kontraları · Rift Kontra`:"Rift Kontra";
  if(v==="kontra")renderKontra(); if(v==="item")renderItem();
  ["ana","kontra","item","sampiyonlar","profil","kademe","esyalar"].forEach(x=>$("#v-"+x).hidden=x!==v);
  const nav = v==="profil"?"sampiyonlar":v;
  document.querySelectorAll("nav.tabs a").forEach(a=>{if(a.getAttribute("href")==="#"+nav)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);

/* Yama, sayılar, güncellik */
document.querySelectorAll(".patch,.js-patch").forEach(e=>e.textContent=(e.classList.contains("patch")?"Yama ":"")+(META.patch||"7.3f"));
document.querySelectorAll(".js-count").forEach(e=>e.textContent=LIST.length);
(()=>{
  const el=$("#freshness"), f=$("#footFresh"); const at=META.checkedAt||META.statsAt; if(!at) return;
  const days=(Date.now()-new Date(at))/864e5;
  const txt=`Veriler: Yama ${META.patch} · son kontrol ${fmtDate(at)}`;
  if(el) el.textContent = days>3 ? txt+" (güncelleme gecikti)" : txt;
  if(f) f.textContent = txt+(META.patchSeenAt?` · bu yama ilk ${fmtDate(META.patchSeenAt)} tarihinde görüldü`:"")+".";
})();
$("#homeSearch").addEventListener("click",()=>openPicker("Şampiyon ara",c=>{location.hash="s-"+c.slug}));
if("serviceWorker" in navigator && location.protocol==="https:"){
  // Yeni sürüm yayınlanınca sayfa bir kez kendiliğinden yenilenir (eski önbellekte takılı kalmasın)
  const hadCtl = !!navigator.serviceWorker.controller; let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(hadCtl&&!reloaded){reloaded=true;location.reload();} });
  navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(r=>r.update()).catch(()=>{});
}

/* Başlangıç: örnek seçimler */
kEnemy=CH[key("Darius")];
iMe=CH[key("Jinx")]; iEn=["Darius","Lee Sin","Syndra","Kai'Sa","Leona"].map(n=>CH[key(n)]);
renderHome(); renderGrid(); renderTier(); renderItems(); route();
