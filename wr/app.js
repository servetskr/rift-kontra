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
const runeTR = n => RUNE_TR[n] || n;
const runeImg = (n,cls) => ICO_RUNE[n] ? `<img class="${cls||""}" src="${ICO_RUNE[n]}" alt="${esc(runeTR(n))}" title="${esc(runeTR(n))}" loading="lazy">` : `<span class="chip">${esc(runeTR(n))}</span>`;
const wrBuild = (c,r) => { const b=BUILDS[c.slug]; if(!b) return null; const rr = b.r[r] ? r : b.r[c.main] ? c.main : Object.keys(b.r)[0]; return rr ? {role:rr, ...b.r[rr], sit:b.sit||[]} : null; };
let bRole=null, bVar=0;
function buildCard(c){
  const b=BUILDS[c.slug];
  if(!b) return `<p class="muted small">Bu şampiyon için oyuncu verisi henüz yok; sınıfına göre tahmini build:</p>${buildHTML(c)}`;
  const roles=Object.keys(b.r); if(!roles.includes(bRole)) bRole=roles.includes(c.main)?c.main:roles[0];
  const R=b.r[bRole]; if(!R.v[bVar]) bVar=0; const V=R.v[bVar];
  return `${roles.length>1?`<div class="seg sm" style="margin-bottom:10px">${roles.map(r=>`<button type="button" data-br="${r}" aria-pressed="${r===bRole}">${ROLE[r]}</button>`).join("")}</div>`:""}
    <div class="vtabs" role="tablist">${R.v.map((v,i)=>{const m=VAR[v[0]]||["wand",v[1]||v[0]];return `<button type="button" role="tab" data-bv="${i}" aria-selected="${i===bVar}">${ic(m[0])}${esc(m[1])}</button>`}).join("")}</div>
    ${V[3].length?`<p class="muted small" style="margin:0 0 10px">Ne zaman: ${esc(V[3].join(" · "))}</p>`:""}
    <div class="irow">${V[2].map((s,i)=>itile(itemOf(s),i+1)).join('<span class="arrow" aria-hidden="true">›</span>')}</div>
    <div class="bsub">
      ${R.boots?`<div><span class="l" title="Bot">${ic("boot")}</span>${itile(itemOf(R.boots))}</div>`:""}
      ${R.runes&&R.runes.length?`<div class="runes"><span class="l" title="Rünler">${ic("rune")}</span>${runeImg(R.runes[0],"ks")}<span class="minor">${R.runes.slice(1).map(n=>runeImg(n)).join("")}</span><span class="rn">${esc(runeTR(R.runes[0]))}</span></div>`:""}
      <div><span class="l" title="Sihirdar büyüleri">${ic("spark")}</span><span class="small">${esc(SPELLS[bRole])}</span></div>
    </div>
    ${b.sit&&b.sit.length?`<h3 class="h3">Duruma göre</h3><div class="sits">${b.sit.map(([s,ctx])=>{const m=SITS.find(x=>x[0].test(ctx))||[0,"info",ctx];return `<div class="sit" title="${esc(ctx)}">${itile(itemOf(s))}<span class="ctx">${ic(m[1])}${esc(m[2])}</span></div>`}).join("")}</div>`:""}`;
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
const abRank = (slot,L) => slot==="4" ? (L>=13?3:L>=9?2:L>=5?1:0) : Math.max(1,Math.min(4,Math.ceil(L/3.25)));
const atRank = (v,rank) => Array.isArray(v) ? v[Math.min(v.length,rank)-1] : (v||0);
const isMelee = slug => ((WD.champ[slug]||{}).rng||125) < 300;
const itemKeys = f => [...new Set(f.items.filter(Boolean).map(en=>{ const k=kb(en); return MX.item[k]?k:(ITEM_ALIAS[k]&&MX.item[ITEM_ALIAS[k]]?ITEM_ALIAS[k]:k); }))];
/* Seçili buildin ana rünü (oyuncu verisi yoksa yok) */
const keystoneOf = f => { if(f.rune!==undefined) return f.rune; const b=BUILDS[f.c.slug]; if(!b) return null; const r=b.r[f.c.main]||Object.values(b.r)[0]; return r&&r.runes ? r.runes[0] : null; };
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
  const c={lvl:f.lvl, melee:isMelee(f.c.slug), rk:slot=>abRank(slot,f.lvl)};
  const statFx = [...itemKeys(f).flatMap(k=>(MX.item[k]||[]).map(e=>[e,iname(itemOf(k))])), ...(MX.champ[f.c.slug]||[]).map(e=>[e,""])];
  for(const [e,src] of statFx) if(e&&e.k==="stat"){ e.f(s,c); s.fx.push(src?src+": "+e.name:e.name); }
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
    const rank=abRank(slot,a.lvl); if(!rank) continue;
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
    if(raw<=0&&!x.dv&&!sh&&!(cc&&cc.k!=="root")&&!mine.length&&!x.keep&&!x.bf) continue;
    const cd = Math.max(2, x.cd?atRank(x.cd,rank):8) * 100/(100+a.ah);
    out.push({slot, raw:Math.max(0,raw), dv:x.dv||null, over:x.over||0, type, cd, mul:mulOf(a,d,type), sh, cc, use, lockAA:x.lockAA||0, bf:mine.some(e=>e.buff)||!x.bf?null:{st:Object.fromEntries(Object.entries(x.bf.st).map(([k,v])=>[k,atRank(v,rank)])),dur:x.bf.dur},
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
      shred:{}, gcd:0, dead:false, deadAt:-1, dealt:0, takenPre:0, grit:0, gritT:0, lastHit:-9, burst:[], burstReady:0, flowReady:true, reviveAt:0, zombieAt:0};
    const K=k=>M.filter(e=>e.k===k);
    Object.assign(X,{dyn:K("dyn"), vamp:K("vamp"), amp:K("amp"), vuln:K("vuln"), dr:K("dr"), gw:K("gw"), shredFx:K("shred"), reflect:K("reflect"),
      aura:K("aura"), regen:K("regen"), timed:K("timed"), enemyFx:K("enemy"), aamul:K("aamul"), shieldred:K("shieldred"),
      lifeline:K("lifeline")[0]||null, revive:K("revive")[0]||null, zombie:K("zombie")[0]||null, undying:K("undying")[0]||null, stasis:K("stasis")[0]||null,
      exec:K("exec")[0]||null, delay:K("delay")[0]||null, sshield:K("sshield")[0]||null, qss:K("qss")[0]||null, flow:K("flow")[0]||null,
      gritFx:K("grit")[0]||null, burstFx:K("burst")[0]||null, bleedFx:K("bleed")});
    X.llReady=0; X.revReady=true; X.stReady=0; X.ssReady=0; X.qssReady=0;
    X.trig={}; M.filter(e=>e.on&&!e.k).forEach(e=>{ const ev=e.on.split(":")[0]; (X.trig[ev]=X.trig[ev]||[]).push(e); if(e.startCd!=null) X.ecd[e.i]=e.startCd; });
    return X; };
  const A=mk(me,sm,se), B=mk(en,se,sm);
  const ctx=(X,Y)=>({s:X.s, o:Y.s, me:X, en:Y, lvl:X.s.lvl, melee:X.melee, rk:slot=>abRank(slot,X.s.lvl), get L(){return X.L}, get t(){return t}});
  for(const [X,Y] of [[A,B],[B,A]]){ X.c=ctx(X,Y); X.Y=Y;
    X.stk=id=>{ const r=X.ramps.find(r=>r.e.id===id); if(r) return r.until>t?r.n:0; const b=X.bleeds[id]; return b&&b.until>t?b.n:0; };
    X.has=id=>X.buffs.some(b=>b.id===id&&b.until>t);
    X.shTotal=()=>X.shields.reduce((a,s)=>a+(s.until>t?s.amt:0),0);
    X.tag=(label,n)=>{ if(label) X.fx[label]=(X.fx[label]||0)+(n===undefined?1:n); }; }
  /* canlı değerler: buff, yük, dinamik pasifler */
  const live=(X,Y)=>{ const s=X.s, b=X.base;
    const L={ad:s.ad, ap:s.ap, asB:s.asB, crit:s.crit, ar:s.ar, mr:s.mr, ls:s.ls/100, ov:s.ov/100, pv:0, dr:0, amp:0, abAmp:0, ten:s.ten||0, arpen:s.arpen, mpen:s.mpen, healAmp:(s.healAmp||0)/100, regen:0, asMul:1};
    const add=(k,v)=>{ switch(k){
      case "as": L.asB+=v; break; case "ad": L.ad+=v; break; case "adPct": L.ad+=s.ad*v/100; break; case "ar": L.ar+=v; break; case "mr": L.mr+=v; break;
      case "arPct": L.ar+=s.ar*v/100; break; case "mrPct": L.mr+=s.mr*v/100; break; case "ov": L.ov+=v/100; break; case "dr": L.dr+=v; break; case "ten": L.ten+=v; break;
      case "healAmp": L.healAmp+=v/100; break; case "regen": L.regen+=v; break; case "arpen": L.arpen+=v; break; case "mpen": L.mpen+=v; break; case "abAmp": L.abAmp+=v/100; break;
      case "asMul": L.asMul*=v; break; case "adapt": if(b.t==="M") L.ap+=v*1.6; else L.ad+=v; break; } };
    for(const bf of X.buffs) if(bf.until>t) for(const k in bf.st) add(k,bf.st[k]);
    for(const r of X.ramps) if(r.n>0&&r.until>t&&r.e.st) for(const k in r.e.st) add(k,fval(r.e.st[k],X.c)*r.n);
    for(const e of Y.enemyFx) for(const k in e.st) add(k,e.st[k]);
    X.L=L; for(const e of X.dyn) e.f(L,X.c);
    L.arpen=Math.min(60,L.arpen); L.mpen=Math.min(60,L.mpen); L.crit=Math.min(1,L.crit); L.asBonus=L.asB;
    L.as=Math.min(2.5, b.as+b.asR*L.asB/100)*L.asMul;
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
    if(k==="hard") Y.stunUntil=Math.max(Y.stunUntil,t+dur); else Y.silUntil=Math.max(Y.silUntil,t+dur);
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
      Y.takenPre+=amt; d*=resist(X,Y,type);
      let amp=X.L.amp+(src==="ab"?X.L.abAmp:0);
      for(const e of X.amp) if(!e.src||e.src===src) amp+=fval(e.v,X.c);
      for(const e of X.vuln) if(e.t===type){ if(e.asTrue) { if(!o.noVuln) deal(X,Y,amt*e.v,"T","fx",{noVuln:1}); } else amp+=e.v; }
      d*=1+amp;
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
  const canAct=X=>!(X.dead&&X.deadAt!==t)&&t>=X.lock&&t>=X.stunUntil&&!(t<X.reviveAt)&&!X.zombieAt;
  /* Kombo sırayla atılır: en fazla 0,25 sn'de bir yetenek */
  const plan=(X,Y)=>{ const out=[]; if(!canAct(X)||t<X.silUntil||t<X.gcd) return out; const tg=targetable(Y);
    X.abs.forEach((x,i)=>{ if(out.length||X.cds[i]>0||x.use==="never"||x.use==="react") return;
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
    let dmg=0, blocked=false; const raw=rawOf(X,x);
    if(raw>0&&x.over){ if(!targetable(Y)) blocked=true; else { Y.dots["ab"+(X===A?"a":"b")+i]={from:X, t:x.type, dps:raw/x.over, until:t+x.over}; dmg=raw*resist(X,Y,x.type); } }
    else if(raw>0){ const r=deal(X,Y,raw,x.type,"ab"); if(r===null) blocked=true; else dmg=r; }
    if(x.slot==="2"&&X.gritFx){ addShield(X,X.grit,3,{decay:true}); X.grit=0; }
    if(x.sh) addShield(X,x.sh.amt,x.sh.dur);
    if(x.cc&&!blocked&&t>=X.ccReady[i]&&x.cc.k!=="root"){ applyCC(X,Y,[x.cc.k,x.cc.dur]); X.ccReady[i]=t+Math.max(6,x.cd); }
    if(x.lockAA) X.aaLock=t+x.lockAA;
    if(x.bf) addBuff(X,{st:x.bf.st,dur:x.bf.dur});
    fire(X,Y,"cast",{slot:x.slot,dmg});
    if(dmg>0){ fire(X,Y,"abhit",{slot:x.slot,dmg}); fire(X,Y,"hit",{slot:x.slot,dmg}); fire(Y,X,"abtaken"); } };
  const attack=(X,Y)=>{ if(X.aaT>0||!canAct(X)||t<X.aaLock||!targetable(Y)||Y.dead) return;
    const L=X.L, cm=X.s.ashe?1:1+L.crit*(X.s.critMul-1); let mul=1; for(const e of X.aamul) mul*=fval(e.v,X.c);
    const d=deal(X,Y,L.ad*cm*mul,"P","aa",{critShare:X.s.ashe?0:L.crit*X.s.critMul/cm});
    X.aaN++; const sett=X.trig.aa&&X.trig.aa.some(e=>e.fast);
    X.aaT = sett&&X.aaN%2===1 ? 1/(8*L.as) : 1/L.as;
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
  fire(A,B,"start"); fire(B,A,"start");
  /* Eski yöntem: ayrıştırılan doğuştan kalkan (mekanik dosyasında tanımlı değilse) */
  for(const [X,f] of [[A,me],[B,en]]){ const fx=MX.fix[f.c.slug]||{}; const inn=(AB[f.c.slug]||{}).i;
    if(inn&&inn.sh&&fx.i!==null) addShield(X,(inn.sh[1].mhp||0)/100*X.s.hp+(inn.sh[1].bhp||0)/100*X.s.bhp+atRank(inn.sh[0].r||[0],1),inn.sh[2]||99); X.tag("Doğuştan kalkan (pasif)",0); }
  while(t<T && !A.dead && !B.dead){
    A.L=live(A,B); B.L=live(B,A);
    upkeep(A,B); upkeep(B,A);
    if(!A.dead&&!B.dead){
      const pa=plan(A,B), pb=plan(B,A), ra=react(A,B,pb), rb=react(B,A,pa);
      ra.forEach(i=>cast(A,B,i)); rb.forEach(i=>cast(B,A,i));
      pa.forEach(i=>cast(A,B,i)); pb.forEach(i=>cast(B,A,i));
      attack(A,B); attack(B,A);
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
  const fxList = X => [...X.s.fx, ...Object.entries(X.fx).filter(([k])=>k).map(([k,n])=>n>1?`${k} ×${n}`:k)];
  return {sm, se, A, B, tl, ttkMe, ttkEn, abShareMe: A.dAB/Math.max(1,A.dAA+A.dAB), realMe:A.real, realEn:B.real,
    ccMe:A.ccDealt, ccEn:B.ccDealt, shMe:A.absorbed, shEn:B.absorbed, healMe:A.healed, healEn:B.healed, fxMe:fxList(A), fxEn:fxList(B)};
}
function simulate(me,en){
  const F=fightSim(me,en); if(!F) return null;
  const {sm,se,ttkMe,ttkEn}=F;
  const r = ttkEn/ttkMe, stat = r/(1+r);
  const role = me.c.roles.find(x=>en.c.roles.includes(x)) || (MU[en.c.main]&&MU[en.c.main][en.c.slug]?en.c.main:me.c.main);
  const e = edge(me.c,en.c,role);
  // gerçek maç verisi (koridor eşleşmesi) simülasyondan daha güvenilir: yarı yarıya
  const score = e!=null ? 0.5*stat + 0.5*Math.min(0.95,Math.max(0.05,0.5+e*0.1)) : stat;
  const mainT = WD.champ[me.c.slug].t, enT = WD.champ[en.c.slug].t;
  const passMe = mulOf(sm,se,mainT==="M"?"M":"P"), passEn = mulOf(se,sm,enT==="M"?"M":"P");
  return {...F, score, edge:e, role, passMe, ehpMe: sm.hp/passEn};
}

/* ===================================================================
 *  BUILD TARZLARI — aynı şampiyon tank, büyücü, nişancı… oynanabilir
 *  "Oyuncu" işaretli olanlar gerçek CN sunucu buildlerinden; diğerleri deneysel.
 * =================================================================== */
const STYLES = [["tank","Tank","shield"],["mage","Büyücü","spark"],["adc","Nişancı","target"],["bruiser","Dövüşçü","sword"],["assassin","Suikastçı","bolt"]];
const STYLE_ARCH = {tank:"tank",mage:"mage_burst",adc:"crit_adc",bruiser:"bruiser",assassin:"ad_assassin"};
function styleOf(items,c){
  const t={ap:0,crit:0,def:0,ad:0,leth:0};
  items.forEach(en=>{ const x=itemStats(en); t.ap+=x.ap||0; t.crit+=(x.crit||0)*2+(x.as||0); t.def+=(x.armor||0)+(x.mr||0)+(x.hp||0)/12; t.ad+=x.ad||0; t.leth+=(x.armpenflat||0)*4; });
  if(t.ap>=Math.max(60,t.ad)) return t.def>t.ap*1.6?"tank":"mage";
  if(t.crit>=60) return "adc";
  if(t.def>t.ad*2.2) return "tank";
  if(t.leth>=t.ad*0.6) return "assassin";
  if(c&&WD.champ[c.slug]&&WD.champ[c.slug].cls==="Marksman") return "adc";
  return "bruiser";
}
const styleCache = {};
function stylesFor(c){
  if(styleCache[c.slug]) return styleCache[c.slug];
  const out={}; const b=BUILDS[c.slug];
  if(b){ const roles=[c.main,...Object.keys(b.r).filter(r=>r!==c.main)].filter(r=>b.r[r]);
    for(const r of roles) for(const v of b.r[r].v){ const its=[...v[2].map(itemOf), b.r[r].boots?itemOf(b.r[r].boots):null].filter(Boolean);
      const st=styleOf(its,c); if(!out[st]) out[st]={items:its, real:true}; } }
  for(const [k] of STYLES) if(!out[k]){ const a=ARCH[STYLE_ARCH[k]]; out[k]={items:[...a.core,...a.late.slice(0,2),a.boots].filter(n=>IT[n]).slice(0,6), real:false}; }
  out._def = b ? STYLES.map(x=>x[0]).find(k=>out[k].real) : ((STYLES.find(([k])=>STYLE_ARCH[k]===c.arch)||["bruiser"])[0]);
  return styleCache[c.slug]=out;
}
const defaultItems = c => { const S=stylesFor(c); return [...S[S._def].items]; };

/* ===================================================================
 *  DÜELLO EKRANI
 * =================================================================== */
const SLOTS = 6;
const D = { me:null, en:null, lvl:11, prev:null, log:[] };
const dSave = () => { try { localStorage.setItem("rk-duel", JSON.stringify({me:D.me&&{s:D.me.c.slug,i:D.me.items,y:D.me.style},en:D.en&&{s:D.en.c.slug,i:D.en.items,y:D.en.style},lvl:D.lvl})); } catch {} };
const fighter = (c,items,style) => ({c, style: items ? (style||null) : stylesFor(c)._def, items: [...(items||defaultItems(c)), ...Array(SLOTS).fill(null)].slice(0,SLOTS), get lvl(){return D.lvl}});
function dLoad(){
  try { const s=JSON.parse(localStorage.getItem("rk-duel")||"null");
    if(s&&s.me&&BYSLUG[s.me.s]&&s.en&&BYSLUG[s.en.s]){ D.me=fighter(BYSLUG[s.me.s],s.me.i,s.me.y); D.en=fighter(BYSLUG[s.en.s],s.en.i,s.en.y); D.lvl=s.lvl||11; return; } } catch {}
  D.me=fighter(BYSLUG.yasuo||LIST[0]); D.en=fighter(BYSLUG.malphite||LIST[1]);
}
const verdictTxt = s => s>=0.62?["Sen kazanırsın","good"]:s>=0.54?["Avantaj sende","good"]:s>0.46?["Başa baş","even"]:s>0.38?["Rakip önde","bad"]:["Rakip kazanır","bad"];
const secs = t => t>=60?"60+ sn":(t<10?t.toFixed(1):Math.round(t))+" sn";
const n0 = v => Math.round(v).toLocaleString("tr-TR");

function fighterHTML(side){
  const f=D[side], c=f.c, st=fstats(f), b=WD.champ[c.slug];
  return `<div class="f-top">
      <button type="button" class="f-pick" data-dpick="${side}" aria-label="${side==="me"?"Şampiyonunu":"Rakibi"} değiştir: ${esc(c.disp)}">${por(c,"xl")}<span class="f-swap">${ic("swap")}</span></button>
      <div class="f-id"><span class="f-side">${side==="me"?"Sen":"Rakip"}</span><b class="f-name">${esc(c.disp)}</b>
        <span class="f-sub">${tierB(c)} ${c.roles.slice(0,2).map(r=>ROLE[r]).join(" · ")}</span></div>
    </div>
    <div class="f-items">${f.items.map((en,i)=>en?`<button type="button" class="slot-i" data-dslot="${side}:${i}" aria-label="${esc(iname(en))} — değiştir">${IT[en]&&IT[en].icon?`<img src="${IT[en].icon}" alt="">`:`<span class="ini">${esc(iname(en).slice(0,2))}</span>`}${chgBadge(ICHG[en]&&ICHG[en].v)}</button>`
        :`<button type="button" class="slot-i empty" data-dslot="${side}:${i}" aria-label="Item ekle">${ic("plus")}</button>`).join("")}</div>
    ${st?`<dl class="f-stats">
      <div><dt>Can</dt><dd>${n0(st.hp)}</dd></div>
      ${(m=>`<div><dt>${m?"Yetenek G.":"Saldırı G."}</dt><dd>${n0(m?st.ap:st.ad)}</dd></div>`)(b.t==="M"&&st.ap>0)}
      <div><dt>Zırh</dt><dd>${n0(st.ar)}</dd></div>
      <div><dt>Büyü D.</dt><dd>${n0(st.mr)}</dd></div>
      <div><dt>Saldırı H.</dt><dd>${st.as.toFixed(2).replace(".",",")}</dd></div>
    </dl>`:`<p class="muted small">Bu şampiyonun taban değerleri henüz yok.</p>`}
    <div class="f-styles" role="group" aria-label="Build tarzı">${(S=>STYLES.map(([k,l,i])=>(l=k==="adc"&&(WD.champ[c.slug]||{}).rng<300?"Kritik":l,`<button type="button" data-dstyle="${side}:${k}" aria-pressed="${f.style===k}" class="${S[k].real?"real":"exp"}" title="${S[k].real?"Oyuncuların gerçekten oynadığı tarz":"Deneysel: oyuncular bu tarzı nadiren kullanır"}">${ic(i)}${l}${S[k].real?"":"<sup>?</sup>"}</button>`)).join(""))(stylesFor(c))}</div>
    <div class="f-acts"><button type="button" class="lnk" data-dclear="${side}">${ic("reset")}Yuvaları boşalt</button>${AB[c.slug]?"":`<span class="muted small">Yetenek verisi yok, ortalama alınıyor</span>`}</div>`;
}
const ccChip=(who,side,cc,sh,hl)=>`<span class="ccc ${side}"><span class="who ${side}">${who}</span>${ic("bolt")}${cc>0?cc.toFixed(1).replace(".",",")+" sn kitle kontrolü":"kitle kontrolü yok"} · ${ic("shield")}${sh>0?n0(sh)+" hasar kalkanla emildi":"kalkan yok"} · ${ic("heart")}${hl>=1?n0(hl)+" can iyileşti":"iyileşme yok"}</span>`;
/* Hesaba katılan pasif, item ve rün etkileri (tetiklenme sayısıyla) */
const fxRow=(who,side,list)=>list.length?`<li><span class="who ${side}">${who}</span> ${list.map(esc).join(" · ")}</li>`:"";
function metric(label,val,delta,goodUp,hint){
  const d = delta==null||Math.abs(delta)<0.005 ? "" : `<span class="dl ${(delta>0)===goodUp?"good":"bad"}">${delta>0?"▲":"▼"} %${Math.abs(delta*100).toFixed(0)}</span>`; // ok: değerin yönü, renk: senin için iyi mi
  return `<div class="mt" title="${esc(hint||"")}"><span class="ml">${label}</span><b>${val}</b>${d}</div>`;
}
function renderDuel(){
  $("#f-me").innerHTML=fighterHTML("me"); $("#f-en").innerHTML=fighterHTML("en");
  $("#d-lvl").textContent=D.lvl;
  const r=simulate(D.me,D.en), out=$("#d-result");
  if(!r){ out.innerHTML='<div class="empty">Bu eşleşme için taban değer verisi yok.</div>'; return; }
  const p=D.prev; const rel=(a,b)=>b?(a-b)/b:null;
  const V=verdictTxt(r.score), pctMe=Math.round(r.score*100);
  const E = r.edge!=null ? EDGE_TXT(r.edge) : null;
  out.innerHTML=`
    <div class="tug" role="img" aria-label="Güç dengesi: sen yüzde ${pctMe}, rakip yüzde ${100-pctMe}">
      <span class="tug-me" style="width:${pctMe}%"><b>%${pctMe}</b></span><span class="tug-en"><b>%${100-pctMe}</b></span>
    </div>
    <div class="verdict ${V[1]}"><span class="vh">${esc(V[0])}</span>
      <span class="muted small">Denge = dövüş simülasyonu + gerçek koridor verisi</span>
      ${E?`<span class="vtag">${ic("users")}Koridor eşleşmesi: <b class="${E[0]==="good"?"good":E[0]==="bad"?"bad":""}">${esc(E[1])}</b> <small>${ROLE_LONG[r.role]} · gerçek maç verisi</small></span>`:""}
    </div>
    <div class="metrics">
      ${metric("Rakibi indirme",secs(r.ttkMe),p?rel(r.ttkMe,p.ttkMe):null,false,"Yetenek kombosu + normal saldırılarla rakibin canının bitme süresi")}
      ${metric("Seni indirme",secs(r.ttkEn),p?rel(r.ttkEn,p.ttkEn):null,true,"Rakibin kombosu + normal saldırılarıyla senin canının bitme süresi")}
      ${metric("Hasarının geçen kısmı","%"+Math.round(r.passMe*100),p?rel(r.passMe,p.passMe):null,true,"Rakibin zırh/büyü direncinden sonra ana hasar türünün ne kadarı işliyor")}
      ${metric("Etkili canın",n0(r.ehpMe),p?rel(r.ehpMe,p.ehpMe):null,true,"Rakibin hasar türüne karşı gerçek dayanıklılığın")}
    </div>
    <div class="split" title="Senin verdiğin hasarın kaynağı"><span class="sp-ab" style="width:${Math.round(r.abShareMe*100)}%"></span></div>
    <p class="muted small" style="margin:-6px 0 0">Hasarının <b>%${Math.round(r.abShareMe*100)}</b>'i yeteneklerden, <b>%${100-Math.round(r.abShareMe*100)}</b>'i normal saldırıdan.</p>
    <div class="ccrow">${ccChip("Sen","me",r.ccMe,r.shMe,r.healMe)}${ccChip("Rakip","en",r.ccEn,r.shEn,r.healEn)}</div>
    ${r.fxMe.length||r.fxEn.length?`<details class="dfx"><summary>Hesaba katılanlar: pasifler, item etkileri, rün</summary><ul>${fxRow("Sen","me",r.fxMe)}${fxRow("Rakip","en",r.fxEn)}</ul></details>`:""}
    ${D.log.length?`<ul class="dlog">${D.log.slice(0,3).map((l,i)=>`<li class="${i?"old":""}">${l}</li>`).join("")}</ul>`:`<p class="muted small" style="margin:0">Bir itemı ya da tarzı değiştir, sonuç anında değişsin.</p>`}
    <p class="muted small" style="margin:0">${ic("info")} Saniye saniye simülasyon: Wild Rift taban değerleri, item sayıları ve yetenek hasarları. Pasifler, item etkileri, ana rün, iyileşme, kalkan ve kitle kontrolü dahil; menzil ve kaçma hesaba katılmaz.</p>
    <button type="button" class="btn gold fight" id="d-fight">${ic("play")}Dövüştür</button>
    <div class="arena-bars" id="d-bars" hidden>
      <span class="hb-clock" id="hb-t">0 sn</span>
      <div><span>${esc(D.me.c.disp)}</span><i><b id="hb-me"></b></i></div>
      <div><span>${esc(D.en.c.disp)}</span><i><b id="hb-en" class="en"></b></i></div>
      <p id="d-ko" class="ko" aria-live="polite"></p>
    </div>`;
  $("#d-fight").onclick=()=>fight(r);
  renderRecs(r); renderCounters(r);
  D.prev={ttkMe:r.ttkMe,ttkEn:r.ttkEn,passMe:r.passMe,ehpMe:r.ehpMe,score:r.score};
  dSave();
}
/* Can çubukları: simülasyondaki gerçek can değişimi oynatılır (ilk saniyedeki kombo ani düşüş olarak görünür) */
function fight(r){
  const bars=$("#d-bars"); bars.hidden=false; const me=$("#hb-me"), en=$("#hb-en"), ko=$("#d-ko"), clock=$("#hb-t");
  ko.textContent=""; const tl=r.tl, end=tl[tl.length-1][0]; const dur=matchMedia("(prefers-reduced-motion: reduce)").matches?0:Math.min(3200,Math.max(1400,end*260));
  const t0=performance.now(); let done=false;
  const at = t => { let i=0; while(i<tl.length-1&&tl[i+1][0]<=t) i++; return tl[i]; };
  const step=now=>{ if(done) return; const k=dur?Math.min(1,(now-t0)/dur):1; const p=at(end*k); if(k>=1) done=true;
    me.style.width=(p[1]*100)+"%"; en.style.width=(p[2]*100)+"%"; clock.textContent=p[0].toFixed(1).replace(".",",")+" sn";
    if(k<1) requestAnimationFrame(step);
    else { const last=tl[tl.length-1];
      ko.innerHTML = last[2]<=0&&last[1]>0 ? `<b class="good">${esc(D.en.c.disp)} düştü!</b> ${esc(D.me.c.disp)} canının %${Math.round(last[1]*100)} kadarıyla ayakta (${secs(last[0])}).`
        : last[1]<=0&&last[2]>0 ? `<b class="bad">${esc(D.me.c.disp)} düştü.</b> ${esc(D.en.c.disp)} canının %${Math.round(last[2]*100)} kadarıyla ayakta (${secs(last[0])}).`
        : last[1]<=0 ? `<b>İkisi aynı anda düştü.</b>` : `<b>30 saniyede kimse düşmedi.</b> Uzun dövüşte ${r.ttkMe<=r.ttkEn?esc(D.me.c.disp):esc(D.en.c.disp)} önde.`; }
  };
  requestAnimationFrame(step); setTimeout(()=>step(t0+dur+1), dur+60);
}
/* Bu rakibe karşı en çok fark yaratan itemlar: her itemı boş yuvaya koyup yeniden hesaplar */
const FINISHED = () => ILIST.filter(i=>{const d=itemData(i.en);return d&&(d.t>=3||i.cat==="bot")&&i.cat!=="";});
function bestItems(side,limit){
  const f=D[side], o=D[side==="me"?"en":"me"]; const base=simulate(D.me,D.en); if(!base) return [];
  const has=new Set(f.items.filter(Boolean)); const slot=f.items.indexOf(null); const i0=slot<0?SLOTS-1:slot;
  const hasBoot=f.items.some(en=>en&&IT[en]&&IT[en].cat==="bot");
  const pool=buildPool(f.c);
  return FINISHED().filter(i=>pool.has(i.en)&&!has.has(i.en)&&!(hasBoot&&i.cat==="bot")).map(i=>{
    const items=[...f.items]; items[i0]=i.en; const t={...f,items,lvl:D.lvl};
    const r = side==="me"?simulate(t,o):simulate(o,t);
    return {en:i.en, gain: side==="me" ? r.score-base.score : base.score-r.score};
  }).sort((a,b)=>b.gain-a.gain).slice(0,limit);
}
function renderRecs(){
  const best=bestItems("me",5);
  $("#d-recs").innerHTML = `<h2>${ic("wand")}Bu rakibe karşı en etkili itemlar</h2>
    <p class="muted small">${esc(D.me.c.disp)} oyuncularının aldığı itemlar arasından, bu rakibe karşı avantajını en çok artıranlar. Dokun, ekle.</p>
    <div class="rec-row">${best.map(x=>`<button type="button" class="rec" data-dadd="${esc(x.en)}">${IT[x.en]&&IT[x.en].icon?`<img src="${IT[x.en].icon}" alt="">`:""}<span class="nm">${esc(iname(x.en))}</span><span class="gain ${x.gain>=0?"good":"bad"}">${x.gain>=0?"+":"−"}${Math.abs(x.gain*100).toFixed(1).replace(".",",")} puan</span></button>`).join("")}</div>`;
}
function renderCounters(r){
  const en=D.en.c, role=r?r.role:en.main;
  const rows=(MU[role]&&MU[role][en.slug]||[]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>({c:BYSLUG[x[0]],e:x[1]})).filter(x=>x.c);
  $("#d-counters").innerHTML = `<h2>${ic("trophy")}${esc(en.disp)} karşısında en iyi seçimler</h2>
    <p class="muted small">${ROLE_LONG[role]} · gerçek maç verisi. Dokun, onunla düello et.</p>
    ${rows.length?`<div class="ctr-row">${rows.map(x=>`<button type="button" class="ctr" data-dme="${x.c.slug}">${por(x.c)}<span class="nm">${esc(x.c.disp)}</span><span class="tag ${EDGE_TXT(x.e)[0]}">${esc(EDGE_TXT(x.e)[1])}</span></button>`).join("")}</div>`:'<div class="empty">Bu koridor için eşleşme verisi yok.</div>'}`;
}
/* Item seçici: her itemın düelloya etkisi kutunun üstünde görünür */
let ipSide="me", ipSlot=0, ipCat="rec";
const buildPool = c => { const b=BUILDS[c.slug]; if(!b) return new Set([...(OVERRIDE[c.name]||ARCH[c.arch].core),...ARCH[c.arch].late,ARCH[c.arch].boots]); const s=new Set(); Object.values(b.r).forEach(R=>{R.v.forEach(v=>v[2].forEach(x=>s.add(itemOf(x)))); if(R.boots) s.add(itemOf(R.boots));}); (b.sit||[]).forEach(([x])=>s.add(itemOf(x))); return s; };
function openItemPicker(side,slot){
  ipSide=side; ipSlot=slot; ipCat="rec"; const f=D[side]; const cur=f.items[slot];
  ov.innerHTML=`<div class="sheet ip" role="dialog" aria-modal="true" aria-label="Item seç">
    <div class="sheet-head"><h3>${side==="me"?"Senin":"Rakibin"} itemı</h3>${cur?`<button class="btn" type="button" data-iprm>${ic("x")}Çıkar</button>`:""}<button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="toolbar"><div class="seg sm" id="ip-cats">${[["rec",`${esc(f.c.disp)} için`],["all","Tümü"],...Object.entries(CAT)].map(([k,v])=>`<button type="button" data-c="${k}" aria-pressed="${k===ipCat}">${v}</button>`).join("")}</div>
    <input id="ip-q" type="search" placeholder="Item ara" aria-label="Item ara"></div>
    <p class="muted small" style="margin:0">"${esc(f.c.disp)} için": oyuncuların bu şampiyonda gerçekten aldığı itemlar. Kutulardaki sayı: bu item bu yuvaya girerse ${side==="me"?"avantajın":"rakibin avantajı"} kaç puan değişir.</p>
    <div class="ipgrid" id="ip-grid"></div></div>`;
  ov.hidden=false; drawItemPicker();
  $("#ip-q").addEventListener("input",drawItemPicker);
  $("#ip-cats").addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;ipCat=b.dataset.c;[...$("#ip-cats").children].forEach(x=>x.setAttribute("aria-pressed",x===b));drawItemPicker()});
  setTimeout(()=>{const q=$("#ip-q"); if(q&&matchMedia("(pointer:fine)").matches) q.focus()},30);
}
function drawItemPicker(){
  const f=D[ipSide], o=D[ipSide==="me"?"en":"me"], q=key($("#ip-q").value);
  const base=simulate(D.me,D.en);
  const pool=buildPool(f.c);
  const rows=(q?ILIST.filter(i=>itemData(i.en)):FINISHED()).filter(i=>(q||ipCat==="all"||(ipCat==="rec"?pool.has(i.en):i.cat===ipCat))&&(!q||key(i.tr+" "+i.en).includes(q)));
  const scored=rows.map(i=>{ const items=[...f.items]; items[ipSlot]=i.en; const t={...f,items,lvl:D.lvl};
    const own = f.items.some((x,k)=>x===i.en&&k!==ipSlot);
    const r= own?null:(ipSide==="me"?simulate(t,o):simulate(o,t)); const g = r&&base ? (ipSide==="me"?r.score-base.score:base.score-r.score) : 0; return {i,g,own}; })
    .sort((a,b)=>(a.own-b.own)||(b.g-a.g));
  $("#ip-grid").innerHTML=scored.map(({i,g,own})=>`<button type="button" class="ipb${own?" on":""}" data-ipick="${esc(i.en)}"${own?" disabled":""}>
      <span class="ib">${i.icon?`<img src="${i.icon}" alt="" loading="lazy">`:""}${chgBadge(ICHG[i.en]&&ICHG[i.en].v)}</span>
      <span class="nm">${esc(i.tr)}</span><span class="gain ${own?"":g>0.0005?"good":g<-0.0005?"bad":""}">${own?"Takılı":Math.abs(g)<0.0005?"±0":(g>0?"+":"−")+Math.abs(g*100).toFixed(1).replace(".",",")}</span></button>`).join("")||'<div class="empty">Bulunamadı.</div>';
}
function setItem(side,slot,en){
  const f=D[side], old=f.items[slot]; f.items[slot]=en; f.style=styleOf(f.items.filter(Boolean),f.c);
  const r=simulate(D.me,D.en), p=D.prev;
  if(r&&p){ const who=side==="me"?"Sen":"Rakip"; const d=Math.round((r.score-p.score)*100);
    const sf = side==="me"?"n":""; const what = en&&old?`${esc(iname(old))} yerine <b>${esc(iname(en))}</b> aldı${sf}`:en?`<b>${esc(iname(en))}</b> aldı${sf}`:`<b>${esc(iname(old))}</b> çıkardı${sf}`;
    D.log.unshift(`<span class="who ${side}">${who}</span> ${what} → avantajın <b class="${d>=0?"good":"bad"}">${d>=0?"+":"−"}${Math.abs(d)} puan</b>`); D.log=D.log.slice(0,3); }
  renderDuel();
}
document.getElementById("v-ana").addEventListener("click",e=>{
  const t=e.target.closest("[data-dpick],[data-dslot],[data-dstyle],[data-dclear],[data-dadd],[data-dme],[data-lvl]"); if(!t) return;
  if(t.dataset.dpick){ const side=t.dataset.dpick; openPicker(side==="me"?"Senin şampiyonun":"Rakip şampiyon",c=>{D[side]=fighter(c);D.log=[];D.prev=null;renderDuel()}); }
  else if(t.dataset.dslot){ const [s,i]=t.dataset.dslot.split(":"); openItemPicker(s,+i); }
  else if(t.dataset.dstyle){ const [s,k]=t.dataset.dstyle.split(":"); const S=stylesFor(D[s].c); D[s]=fighter(D[s].c,[...S[k].items],k);
    const r=simulate(D.me,D.en), p=D.prev; const dd=r&&p?Math.round((r.score-p.score)*100):0;
    D.log.unshift(`<span class="who ${s}">${s==="me"?"Sen":"Rakip"}</span> <b>${esc(STYLES.find(x=>x[0]===k)[1])}</b> tarzına geçti${s==="me"?"n":""}${p?` → avantajın <b class="${dd>=0?"good":"bad"}">${dd>=0?"+":"−"}${Math.abs(dd)} puan</b>`:""}`); D.log=D.log.slice(0,3); renderDuel(); }
  else if(t.dataset.dclear){ const s=t.dataset.dclear; D[s]=fighter(D[s].c,[],null); renderDuel(); }
  else if(t.dataset.dadd){ const f=D.me; let i=f.items.indexOf(null); if(i<0) i=SLOTS-1; setItem("me",i,t.dataset.dadd); }
  else if(t.dataset.dme){ D.me=fighter(BYSLUG[t.dataset.dme]); D.log=[]; D.prev=null; renderDuel(); window.scrollTo({top:0,behavior:"smooth"}); }
  else if(t.dataset.lvl){ D.lvl=Math.min(15,Math.max(1,D.lvl+(+t.dataset.lvl))); renderDuel(); }
});
ov.addEventListener("click",e=>{
  const p=e.target.closest("[data-ipick]"); if(p){ ov.hidden=true; setItem(ipSide,ipSlot,p.dataset.ipick); return; }
  if(e.target.closest("[data-iprm]")){ ov.hidden=true; setItem(ipSide,ipSlot,null); }
});
$("#d-swap").addEventListener("click",()=>{ [D.me,D.en]=[D.en,D.me]; D.log=[]; D.prev=null; renderDuel(); });

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
const ccard = (c,w) => `<button class="ccard" type="button" ${champBtnAttrs(c)}>${por(c)}<span class="nm">${esc(c.disp)}</span><span class="wr">${pct(w)}</span></button>`;
function renderGrid(){
  const q=key($("#c-q").value);
  const wrOf = c => cRole==="all" ? c.wr : (c.rs[cRole]?c.rs[cRole][0]:null);
  const rows=LIST.filter(c=>(cRole==="all"||c.roles.includes(cRole)||c.rs[cRole])&&(!q||key(c.disp).includes(q)));
  const out=$("#c-grid");
  if(!rows.length){ out.innerHTML='<div class="empty">Bulunamadı.</div>'; return; }
  if(cSort==="az"){ out.innerHTML=`<div class="cgrid">${rows.sort((a,b)=>a.disp.localeCompare(b.disp,"tr")).map(c=>ccard(c,wrOf(c))).join("")}</div>`; return; }
  const groups={}; rows.forEach(c=>{const t=tierOf(wrOf(c));(groups[t]||=[]).push(c)});
  out.innerHTML=["S","A","B","C","D","?"].filter(t=>groups[t]).map(t=>`<section class="tsec"><h2 class="th"><span class="tier big" data-t="${t}">${t}</span>${TIER_TXT[t]}<small>${groups[t].length}</small></h2>
    <div class="cgrid">${groups[t].sort((a,b)=>(wrOf(b)||0)-(wrOf(a)||0)).map(c=>ccard(c,wrOf(c))).join("")}</div></section>`).join("");
}

/* ===================================================================
 *  PROFİL — sekmeli: Build · Yetenekler · Eşleşmeler · Oynanış
 * =================================================================== */
let pRole=null, pSlug=null, pTab="build";
function pickRow(c,e,role){
  const T=EDGE_TXT(e); const w=role?roleWR(c,role):null;
  return `<button class="pick" type="button" ${champBtnAttrs(c)}>${por(c,"sm")}<span class="nm">${esc(c.disp)}</span><span class="tag ${T[0]}">${T[1]}</span><span class="rt">${pct(w!=null?w:c.wr)}</span></button>`;
}
function renderProfile(slug){
  const c=BYSLUG[slug]; const v=$("#v-profil");
  if(slug!==pSlug){pSlug=slug;pRole=null;bRole=null;bVar=0;pTab="build";}
  if(!c){v.innerHTML='<div class="empty">Şampiyon bulunamadı. <a href="#sampiyonlar">Listeye dön</a>.</div>';return}
  const pr=c.prof||{};
  const br=boardRoles(c); if(!br.includes(pRole)) pRole=br.includes(c.main)?c.main:br[0];
  const board=pRole?(MU[pRole][c.slug]||[]).map(([s,e])=>({o:BYSLUG[s],e})).filter(x=>x.o):[];
  const strong=board.filter(x=>x.e<0).sort((a,b)=>a.e-b.e), weak=board.filter(x=>x.e>0).sort((a,b)=>b.e-a.e);
  const slotName={"PASİF":"Pasif","1":"1","2":"2","3":"3","ULTİ":"Ulti"};
  const ch=CHG[c.slug];
  const tabs=[["build","Build"],["yetenek","Yetenekler"],["eslesme","Eşleşmeler"],["oyna","Oynanış"]];
  let body="";
  if(pTab==="build") body=`<div class="card" id="pf-build">${buildCard(c)}</div>`;
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
      <div class="prof-meta">${c.roles.map(roleB).join("")}<span class="chip ${c.dmg.toLowerCase()}">${DMG[c.dmg]}</span>${pr.d?`<span class="chip">Zorluk <span class="diff">${[1,2,3].map(i=>`<i class="${i<=pr.d?"on":""}"></i>`).join("")}</span></span>`:""}</div>
    </div>
    <div class="ph-kpi"><span class="tier big" data-t="${c.tier}">${c.tier}</span><div><b>${pct(c.wr)}</b><span>kazanma</span></div><div><b>${pct(c.pr)}</b><span>seçilme</span></div></div>
    <div class="ph-cta"><button class="btn gold" type="button" id="pf-duel">${ic("duel")}Düelloda dene</button></div>
  </div>
  ${ch?`<button type="button" class="chstrip" data-v="${ch.v}" data-chg="${c.slug}">${chgBadge(ch.v)}<span>Yama ${esc(NOTES.patch||"")}: <b>${esc(VMARK[ch.v][1])}</b> — ${ch.c.length?esc(ch.c.map(p=>p[0]?titleTR(p[0]):"Temel değerler").join(", ")):"yeni şampiyon"}</span><span class="go">Ayrıntı ›</span></button>`:""}
  <div class="ptabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-pt="${k}" aria-selected="${k===pTab}">${l}</button>`).join("")}</div>
  ${body}`;
  $("#pf-duel").onclick=()=>{D.me=fighter(c);D.log=[];D.prev=null;location.hash="ana"};
  v.querySelector(".ptabs").onclick=e=>{const b=e.target.closest("[data-pt]");if(!b)return;pTab=b.dataset.pt;renderProfile(slug)};
  const pb=$("#pf-build"); if(pb) pb.onclick=e=>{const b=e.target.closest("[data-br],[data-bv]");if(!b)return;if(b.dataset.br){bRole=b.dataset.br;bVar=0}else bVar=+b.dataset.bv;pb.innerHTML=buildCard(c)};
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
  if(h.startsWith("kontra-")&&BYSLUG[h.slice(7)]){ const en=BYSLUG[h.slice(7)]; D.en=fighter(en);
    const role=en.main; const best=(MU[role]&&MU[role][en.slug]||[]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1])[0];
    if(best&&BYSLUG[best[0]]) D.me=fighter(BYSLUG[best[0]]); D.log=[]; D.prev=null; history.replaceState(null,"","#ana"); h="ana"; }
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
