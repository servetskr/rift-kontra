/* Rift Kontra · VALORANT uygulama kodu */
"use strict";
const G = window.VAL_GAME || { agents:{}, roles:{}, weapons:{}, gear:{}, maps:{}, cats:{} };
const ST = window.VAL_STATS || null;
const NOTES = window.VAL_NOTES || [];
const META = window.VAL_META || {};

/* ===== YARDIMCILAR ===== */
const $ = s => document.querySelector(s);
const esc = s => String(s==null?"":s).replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const key = s => (s||"").toLocaleLowerCase("tr").replace(/ı/g,"i").replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]/g,"");
const dec = (v,n=1) => v.toFixed(n).replace(".",",");
const pct = v => v==null ? "–" : "%"+dec(v);
const n0 = v => Math.round(v).toLocaleString("tr-TR");
const rich = s => esc(s).replace(/\*\*([\s\S]*?)\*\*/g,"<b>$1</b>");
const fmtDate = iso => { try { return new Date(iso).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}); } catch { return iso; } };
const pref = (k,d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const setPref = (k,v) => { try { localStorage.setItem(k,v); } catch {} };
/* Riot'un tek renkli simgeleri maske olarak çizilir; böylece açık ve koyu temada görünür */
const mk = (src,cls) => src ? `<span class="mk${cls?" "+cls:""}" style="--m:url('${esc(src)}')" aria-hidden="true"></span>` : "";

/* ===== SİMGELER — tek çizgi stili, emoji yok ===== */
const SV = {
  duel:'<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/><circle cx="12" cy="12" r="1"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><path d="M16 5a3 3 0 0 1 0 6M18 14.5c1.8.7 3 2.6 3 5"/>',
  gun:'<path d="M3 9h15l2-2h1v4h-4l-1 2h-4l-1 2v4H7l1-6H3z"/>',
  scroll:'<path d="M7 4h11v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h11v1a3 3 0 0 0 3 3"/><path d="M7 4a2 2 0 0 0-2 2v10M10 8h5M10 12h5"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
  bolt:'<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  coin:'<circle cx="12" cy="12" r="8"/><path d="M9 9.5h4.5a1.75 1.75 0 0 1 0 3.5H10a1.75 1.75 0 0 0 0 3.5H15M12 7.5v1.5M12 16.5V18"/>',
  map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/>',
  arrow:'<path d="M4 12h15M14 7l5 5-5 5"/>',
  down:'<path d="M12 4v15M6 13l6 6 6-6"/>',
  run:'<path d="M13 4.5a1.5 1.5 0 1 0 0 .1M9 20l2.5-5.5L14 17v3M7 12l3-4 4 1 2 3h3"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  play:'<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
};
const ic = (n,cls) => `<svg class="ic${cls?" "+cls:""}" viewBox="0 0 24 24" aria-hidden="true">${SV[n]||""}</svg>`;

/* ===== VERİ ===== */
const ROLE_ORDER = ["assault","breaker","strategist","sentinel"].filter(r => G.roles[r]);
const ROLES = G.roles;
const roleChip = r => ROLES[r] ? `<span class="role" style="--rc:var(--r-${r})">${mk(ROLES[r].img)}${esc(ROLES[r].n)}</span>` : "";
const MAPSTAT = (ST && ST.map) || {};
const POOL = (ST && ST.pool) || {};
const AG = {}, ALIST = [];
Object.entries(G.agents).forEach(([id,a]) => {
  const s = ST && ST.all && ST.all[id];
  const o = { id, ...a, wr: s?s[0]:null, pr: s?s[1]:null, games: s?s[2]:null };
  AG[id]=o; ALIST.push(o);
});
ALIST.sort((a,b)=>a.n.localeCompare(b.n,"tr"));
/* Kademe: kazanma oranına göre yüzdelik dilim (S %15 · A %25 · B %30 · C %20 · D %10) */
function tiersFor(wrOf){
  const rows = ALIST.filter(a=>wrOf(a)!=null).sort((a,b)=>wrOf(b)-wrOf(a)); const out={};
  rows.forEach((a,i)=>{ const q=i/rows.length; out[a.id]= q<.15?"S":q<.40?"A":q<.70?"B":q<.90?"C":"D"; });
  return out;
}
const TIER = tiersFor(a=>a.wr);
const TIER_TXT = {S:"Çok güçlü",A:"Güçlü",B:"Dengeli",C:"Biraz zayıf",D:"Zayıf","?":"Verisi yok"};
const tierB = t => `<span class="tier" data-t="${t||"?"}" title="Kademe ${t||"?"}">${t||"?"}</span>`;

const CAT_ORDER = ["Sidearm","SMG","Shotgun","Rifle","Sniper","Heavy"];
const W = G.weapons;
const WLIST = Object.entries(W).map(([id,w])=>({id,...w})).sort((a,b)=>CAT_ORDER.indexOf(a.cat)-CAT_ORDER.indexOf(b.cat)||a.cost-b.cost);
const PEN = {Low:"Düşük",Medium:"Orta",High:"Yüksek"};
const catName = c => (G.cats||{})[c] || c;

/* Yama değişiklikleri: en yeni notlar işaretlenir */
const VMARK = {buff:["▲","Güçlendirildi"],nerf:["▼","Zayıflatıldı"],adj:["⇅","Dengelendi"],rework:["⟳","Yeniden tasarlandı"],new:["★","Yeni"]};
const LAST = NOTES[0] || null;
const chgOf = (type,id) => LAST && LAST[type] && LAST[type][id] || null;
const chgBadge = v => v&&VMARK[v] ? `<i class="chg" data-v="${v}" title="${VMARK[v][1]}" aria-label="${VMARK[v][1]}">${VMARK[v][0]}</i>` : "";
const vPill = v => VMARK[v] ? `<span class="vpill" data-v="${v}">${VMARK[v][0]} ${VMARK[v][1]}</span>` : "";
/* Bir öğenin son üç yamadaki en yeni değişikliği */
const lastChange = (type,id) => { for(const n of NOTES){ if(n[type]&&n[type][id]) return {n, ch:n[type][id]}; } return null; };

function por(a,cls,noMark){
  if(!a) return `<span class="por${cls?" "+cls:""}"><span class="ini">?</span></span>`;
  const c=a.c||[];
  return `<span class="por tint${cls?" "+cls:""}" style="--c1:${esc(c[0]||"#33415a")};--c2:${esc(c[1]||"#131c29")}">${a.img?`<img src="${esc(a.img)}" alt="" loading="lazy">`:`<span class="ini">${esc(a.n.slice(0,2))}</span>`}${noMark?"":chgBadge((chgOf("ag",a.id)||{}).v)}</span>`;
}

/* ===================================================================
 *  CEPHANELİK YARDIMCILARI — kalkanlar ve "kaç mermi" (hiç ıskalamadan)
 * =================================================================== */
const DEG = Math.PI/180;
const ARMOR = [{id:"none",n:"Yok",cap:0,abs:0,cost:0,img:null}];
[["lightarmor",25,.66],["heavyarmor",50,.66],["plasmaarmor",25,1]].forEach(([id,cap,abs])=>{ const g=G.gear[id]; if(g) ARMOR.push({id,n:g.n,cap:g.cap||cap,abs:g.abs||abs,cost:g.cost,img:g.img,d:g.d}); });
const ARM = Object.fromEntries(ARMOR.map(a=>[a.id,a]));
const dmgAt = (w,d) => w.dr.find(r=>d>=r[0]&&d<r[1]) || w.dr[w.dr.length-1];
/* Verilen bölgeye kaç isabet gerekir; pompalılarda beklenen saçma isabeti */
function stk(wid,part,armId,d){
  const w=W[wid], a=ARM[armId]||ARMOR[0], row=dmgAt(w,d);
  let per=row[2+part]; if(w.pel>1){ const x=d*Math.tan(Math.max(w.sp,0)*DEG); per*=w.pel/(1+Math.pow(x/.40,2)); }
  let hp=100, sh=a.cap;
  for(let k=1;k<=60;k++){ let dm=per; if(sh>0){ const ab=Math.min(sh,dm*a.abs); sh-=ab; dm-=ab; } hp-=dm; if(hp<=0.0001) return k; }
  return null;
}
const cr = v => v ? `<span class="cr">${ic("coin")}${n0(v)}</span>` : `<span class="cr">Bedava</span>`;

/* ===================================================================
 *  ETKİLEŞİM MOTORU — saf fonksiyonlar (DOM yok; node ile test edilir)
 *  Veri: data/interactions.js (elle hazırlanır) · data/duos.js (vstats.gg, otomatik)
 * =================================================================== */
const IXD = Object.assign({tags:{},vs:[],sp:[],duo:[],tips:{},roleVs:{},fresh:{}}, window.VAL_IX||{});
const DUOS = window.VAL_DUOS || null;
const ABK = ["Q","E","C","X"];
const abOf = (id,k) => (AG[id] && AG[id].ab.find(x=>x.k===k)) || null;
const abHas = (id,k,list) => (IXD.tags[id+":"+k]||[]).some(t=>list.includes(t));
const abWith = (id,list) => ABK.filter(k=>abOf(id,k)&&abHas(id,k,list)).map(k=>abOf(id,k));
const IXT = {
  engel:{n:"Kapatır",i:"x"}, kontra:{n:"Zayıflatır",i:"down"}, kacar:{n:"Kaçar",i:"run"}, ifsa:{n:"Gösterir",i:"eye"}, kombo:{n:"Kombo",i:"link"},
};
/* me'nin yetenekleri en'e karşı: kural etiketleri + özel çiftler, önem sırasıyla */
function vsSide(me,en){
  if(!AG[me]||!AG[en]) return [];
  const out=[];
  for(const r of IXD.vs){ const a=abWith(me,r.a), b=abWith(en,r.b); if(a.length&&b.length) out.push({id:r.id,t:r.t,s:r.s,x:r.x,a,b}); }
  for(const p of IXD.sp){ const [ai,ak]=p.a.split(":"), [bi,bk]=p.b.split(":");
    if(ai===me&&bi===en&&abOf(me,ak)&&abOf(en,bk)) out.push({id:"sp:"+p.a+">"+p.b,t:p.t,s:p.s,x:p.x,a:[abOf(me,ak)],b:[abOf(en,bk)]}); }
  return out.sort((x,y)=>y.s-x.s);
}
/* İkili kombolar: her kural her iki yönde denenir */
function duoCombos(a,b){
  const out=[];
  if(!AG[a]||!AG[b]||a===b) return out;
  for(const r of IXD.duo) for(const [x,y] of [[a,b],[b,a]]){
    const A=abWith(x,r.a); if(!A.length) continue;
    const B=r.b==="*"?[]:abWith(y,r.b); if(r.b!=="*"&&!B.length) continue;
    out.push({id:r.id+":"+x,t:"kombo",s:r.s,x:r.x,from:x,to:y,a:A,b:B});
  }
  return out.sort((p,q)=>q.s-p.s);
}
/* Uyum tahmini (0–100): kombolar (en fazla 50 puan) + rol dengesi. Maç verisi değildir. */
function synergy(a,b){
  const combos=duoCombos(a,b);
  if(!combos.length&&a===b) return {score:0,combos,roleTxt:"",same:true};
  const ra=AG[a].r, rb=AG[b].r;
  let role = ra===rb ? -8 : 12; if((ra==="strategist")!==(rb==="strategist")) role+=4;
  const cs=Math.min(50,combos.reduce((s,c)=>s+c.s,0));
  return { score:Math.max(5,Math.min(99,Math.round(30+role+cs))), combos, role,
    roleTxt: ra===rb ? "Aynı rol: görevler çakışır." : (ra==="strategist")!==(rb==="strategist") ? "Farklı roller, biri duman atıyor." : "Farklı roller." };
}
/* Ölçülen ikili oranı (vstats.gg). Harita seçiliyse ve o haritada yeterli maç varsa harita verisi. */
const DUO_MIN = {all:2000, map:800}, DUO_LOW = 3000;
function pairStat(a,b,map){
  if(!DUOS||!AG[a]||!AG[b]||a===b) return null;
  const k=[a,b].sort().join("|");
  const tries = map&&map!=="all"&&DUOS.map&&DUOS.map[map] ? [["map",DUOS.map[map]],["all",DUOS.all]] : [["all",DUOS.all]];
  for(const [scope,T] of tries){
    const p=T&&T.p&&T.p[k]; if(!p||p[1]<DUO_MIN[scope]) continue;
    const ea=T.ag[a], eb=T.ag[b]; const exp = ea&&eb ? ea[0]+eb[0]-50 : null;
    return { wr:p[0], m:p[1], exp, diff: exp==null?null:p[0]-exp, scope, map: scope==="map"?map:"all", low:p[1]<DUO_LOW, fellBack: map&&map!=="all"&&scope==="all" };
  }
  return null;
}
function bestPartners(a,map,n=5){
  const rows=ALIST.filter(x=>x.id!==a).map(x=>({id:x.id, st:pairStat(a,x.id,map), syn:synergy(a,x.id).score}));
  const measured=rows.filter(r=>r.st&&(map==="all"||r.st.scope==="map")).sort((x,y)=>y.st.wr-x.st.wr||y.syn-x.syn).slice(0,n);
  const combo=[...rows].sort((x,y)=>y.syn-x.syn||((y.st&&y.st.wr)||0)-((x.st&&x.st.wr)||0)).slice(0,n);
  return {measured, combo};
}
/* Bu ajana karşı en güçlü yetenek etkileşimine sahip rakipler (profil için) */
function counterList(id,n=5){
  return ALIST.filter(x=>x.id!==id).map(x=>({id:x.id, s:vsSide(x.id,id).filter(r=>r.t==="engel"||r.t==="kontra").reduce((s,r)=>s+r.s,0)}))
    .filter(r=>r.s>0).sort((x,y)=>y.s-x.s||AG[x.id].n.localeCompare(AG[y.id].n,"tr")).slice(0,n);
}

/* ===================================================================
 *  LINEUP — ajan → harita → hedef nokta → o noktaya atılan lineup'lar ve kurulumlar
 *  Veri: data/lineups.js (elle hazırlanır) · mini harita ve bölge adları: data/game.js (valorant-api.com)
 *  Konumlar bölge düzeyindedir: nokta, bölgenin mini haritadaki merkezidir (0–1 oranı).
 * =================================================================== */
const LU = Object.assign({abil:{},list:[]}, window.VAL_LINEUPS||{});
const LU_TYPE = { lineup:"Lineup", setup:"Kurulum", smoke:"Duman" };
const SIDE_TXT = { atk:"Saldırı", def:"Savunma" };
const CLX = {};
const clMap = m => CLX[m] || (CLX[m] = Object.fromEntries(((G.maps[m]||{}).cl||[]).map(c=>[c.k,c])));
/* Türkçe bölge adı: "A Bölge" → "A Bölgesi", başlangıçlar ve "Savunan Taraf / Su" gibi tek adlar */
function clName(c){
  if(!c) return "";
  if(c.r==="Bölge") return `${c.s} Bölgesi`;
  if(c.r==="Başlangıç") return /^Sald/.test(c.s) ? "Saldıran başlangıcı" : "Savunan başlangıcı";
  return / Taraf$/.test(c.s) ? c.r : `${c.s} ${c.r}`;
}
/* Konum: "X" bölge, "X~Y" iki bölgenin ortası, "X~Y@0.3" X'ten Y'ye %30 */
function luPos(m,ref){
  if(!ref) return null;
  const C=clMap(m), [a,rest]=ref.split("~");
  if(!rest){ const c=C[a]; return c ? {x:c.x, y:c.y, n:clName(c), en:a} : null; }
  const [b,t]=rest.split("@"), A=C[a], B=C[b]; if(!A||!B) return null;
  const f = t!=null&&isFinite(+t) ? +t : .5;
  return {x:A.x+(B.x-A.x)*f, y:A.y+(B.y-A.y)*f, n:`${clName(A)} – ${clName(B)} arası`, en:a};
}
const LUS = LU.list.filter(e=>AG[e.ag]&&G.maps[e.map]&&G.maps[e.map].mm&&abOf(e.ag,e.ab)&&luPos(e.map,e.to)&&(!e.from||luPos(e.map,e.from)))
  .map(e=>({...e, id:`${e.ag}-${e.map}-${key(e.title)}`}));
const LU_AG = [...new Set(LUS.map(e=>e.ag))].sort((a,b)=>AG[a].n.localeCompare(AG[b].n,"tr"));
const luMaps = () => { const all=Object.keys(G.maps).filter(m=>G.maps[m].mm); const pool=poolIds.filter(m=>all.includes(m));
  return { pool, off: all.filter(m=>!pool.includes(m)).sort() }; };
function luYT(e){
  const A=AG[e.ag], ab=LU.abil[e.ag+":"+e.ab]||{}, to=luPos(e.map,e.to), fr=luPos(e.map,e.from);
  const q=[A.n, ab.en||abOf(e.ag,e.ab).n, G.maps[e.map].n, to&&to.en, fr&&fr.en!==(to&&to.en)?"from "+fr.en:"", e.yt||"", e.type==="lineup"?"lineup":e.type==="smoke"?"smoke":"setup"].filter(Boolean).join(" ");
  return "https://www.youtube.com/results?search_query="+encodeURIComponent(q);
}
const ytSearch = q => "https://www.youtube.com/results?search_query="+encodeURIComponent(q);

/* ===================================================================
 *  ANA EKRAN — Lineup (ajan, harita, hedef nokta) · Duo (ikili seçim)
 * =================================================================== */
const H = { mode:"lu", me:null, fr:null, map:"all", la:null, lm:null, ls:"atk", lp:null, le:null };
function hSave(){ try { localStorage.setItem("rk-val-home",JSON.stringify(H)); } catch {} }
function hLoad(){
  let s=null; try { s=JSON.parse(localStorage.getItem("rk-val-home")||"null"); } catch {}
  const ok=id=>AG[id]?id:null, ids=ALIST.map(a=>a.id);
  H.mode = s&&s.mode==="duo" ? "duo" : "lu";
  H.me = ok(s&&s.me) || ok("jett") || ids[0];
  H.fr = ok(s&&s.fr) || ok("sova") || ids.find(x=>x!==H.me);
  if(H.fr===H.me) H.fr=ids.find(x=>x!==H.me);
  H.map = s&&s.map&&DUOS&&DUOS.map&&DUOS.map[s.map] ? s.map : "all";
  H.la = s&&LU_AG.includes(s.la) ? s.la : (LU_AG.includes("sova") ? "sova" : LU_AG[0]||null);
  H.lm = s&&s.lm&&G.maps[s.lm]&&G.maps[s.lm].mm ? s.lm : null;
  H.ls = s&&s.ls==="def" ? "def" : "atk";
  H.lp = s&&typeof s.lp==="string" ? s.lp : null;
  H.le = s&&typeof s.le==="string" ? s.le : null;
}
/* Geçerli seçimi tamamla: harita yoksa ajanın en çok kaydı olan havuz haritası, taraf boşsa diğeri,
 * hedef nokta yoksa en çok kaydı olan nokta, kayıt yoksa ilki */
function luState(){
  const mine=LUS.filter(e=>e.ag===H.la), {pool,off}=luMaps(), cnt=m=>mine.filter(e=>e.map===m).length;
  if(!H.lm||!G.maps[H.lm]||!G.maps[H.lm].mm) H.lm = [...pool,...off].sort((a,b)=>cnt(b)-cnt(a)||(pool.includes(b)-pool.includes(a)))[0] || null;
  const onMap=mine.filter(e=>e.map===H.lm);
  if(onMap.length&&!onMap.some(e=>e.side===H.ls)) H.ls = H.ls==="atk"?"def":"atk";
  const rows=onMap.filter(e=>e.side===H.ls), spots=[];
  rows.forEach(e=>{ let s=spots.find(x=>x.to===e.to); if(!s){ s={to:e.to,pos:luPos(e.map,e.to),rows:[]}; spots.push(s); } s.rows.push(e); });
  spots.sort((a,b)=>b.rows.length-a.rows.length||a.pos.n.localeCompare(b.pos.n,"tr"));
  if(!spots.some(s=>s.to===H.lp)) H.lp = spots[0] ? spots[0].to : null;
  const spot=spots.find(s=>s.to===H.lp)||null;
  if(spot&&H.le!==""&&!spot.rows.some(e=>e.id===H.le)) H.le = spot.rows[0].id; // "" = kullanıcı kartı kapattı
  return { mine, onMap, rows, spots, spot, pool, off, cnt };
}
const pc = v => (v*100).toFixed(2)+"%";
/* Stand noktaları aynı bölgede üst üste gelirse küçük bir çember üstüne dağıtılır */
function standPts(spot){
  const groups={}; return spot.rows.map((e,i)=>{ const p=luPos(e.map,e.from); if(!p) return null;
    const k=e.from; (groups[k]||=[]).push(i); return {i,p,k}; }).map(o=>{ if(!o) return null;
    const g=groups[o.k], j=g.indexOf(o.i), n=g.length; if(n<2) return o;
    const a=2*Math.PI*j/n-Math.PI/2, r=.032; return {...o, p:{...o.p, x:o.p.x+Math.cos(a)*r, y:o.p.y+Math.sin(a)*r}}; });
}
function luOverlay(S){
  if(!S.spot&&!S.spots.length) return "";
  const lines=[], pins=[];
  if(S.spot){
    const T=S.spot.pos, st=standPts(S.spot);
    S.spot.rows.forEach((e,i)=>{ const on=e.id===H.le, s=st[i];
      if(s) lines.push(`<line class="ln-th${on?" on":""}" x1="${s.p.x*100}" y1="${s.p.y*100}" x2="${T.x*100}" y2="${T.y*100}"${on?' marker-end="url(#lu-arr)"':""}/>`);
      if(on&&e.look){ const L=luPos(e.map,e.look); if(L){ lines.push(`<line class="ln-look" x1="${T.x*100}" y1="${T.y*100}" x2="${L.x*100}" y2="${L.y*100}"/>`);
        pins.push(`<span class="pin look" style="left:${pc(L.x)};top:${pc(L.y)}" title="Baktığı yer: ${esc(L.n)}">${ic("eye")}</span>`); } }
      if(s) pins.push(`<button type="button" class="pin st${on?" on":""}" data-lue="${esc(e.id)}" style="left:${pc(s.p.x)};top:${pc(s.p.y)}" aria-pressed="${on}" aria-label="${i+1}. kayıt, nerede dur: ${esc(s.p.n)}"><span>${i+1}</span></button>`);
    });
  }
  S.spots.forEach(s=>{ const on=S.spot&&s.to===S.spot.to;
    pins.push(`<button type="button" class="pin tg${on?" on":""}" data-lup="${esc(s.to)}" style="left:${pc(s.pos.x)};top:${pc(s.pos.y)}" aria-pressed="${!!on}" aria-label="Hedef nokta: ${esc(s.pos.n)}, ${s.rows.length} kayıt"><span>${s.rows.length}</span></button>`); });
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="lu-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z"/></marker></defs>${lines.join("")}</svg>${pins.join("")}`;
}
function luCard(e,i){
  const on=e.id===H.le, ab=abOf(e.ag,e.ab), A=LU.abil[e.ag+":"+e.ab]||{}, to=luPos(e.map,e.to), fr=luPos(e.map,e.from);
  const place = e.type==="setup";
  const where = (p,txt) => `${p?`<b>${esc(p.n)}</b>${p.en&&!/~/.test(p.en)?` <span class="en">${esc(p.en)}</span>`:""}`:""}${txt?`<p>${esc(txt)}</p>`:""}`;
  const how=[A.how,e.how].filter(Boolean).join(" ");
  return `<li class="lu-card${on?" on":""}">
    <button type="button" class="lu-head" data-lue="${esc(e.id)}" aria-expanded="${on}">
      <span class="lu-n">${i+1}</span>${abIcon(ab)}
      <span class="lu-tt"><b>${esc(e.title)}</b><small>${esc(ab.n)} · ${esc(SIDE_TXT[e.side])}${!on&&fr?` · Konum: ${esc(fr.n)}`:""}</small></span>
      <span class="lu-type" data-y="${e.type}">${LU_TYPE[e.type]||"Kurulum"}</span>
    </button>
    ${on?`<div class="lu-body"><dl class="lu-dl">
      <div><dt>${ic("run")}Nerede dur</dt><dd>${where(fr||(place?to:null),e.stand)}</dd></div>
      <div><dt>${ic("target")}${place?"Nereye kur":"Nereye nişan al"}</dt><dd>${where(to,e.aim)}${e.look?`<p class="muted small">Baktığı yer: ${esc((luPos(e.map,e.look)||{}).n||e.look)}</p>`:""}</dd></div>
      ${how?`<div><dt>${ic("bolt")}${place?"Nasıl kur":"Nasıl at"}</dt><dd><p>${esc(how)}</p></dd></div>`:""}
      <div><dt>${ic("spark")}Ne işe yarar</dt><dd><p>${esc(e.does)}</p></dd></div>
    </dl>
    <div class="lu-yt"><a class="btn" href="${esc(luYT(e))}" target="_blank" rel="noopener">${ic("play")}Videoda izle</a>
      <span class="muted small">${e.type==="lineup"?"Kesin nişan noktası, şarj ve sekme ayarı için videoyla doğrula.":"Tam yerini görmek için videoya bak."}</span></div></div>`:""}
  </li>`;
}
function luList(S){
  const A=AG[H.la], M=G.maps[H.lm];
  if(!S.onMap.length) return `<div class="empty">${esc(M.n)} için ${esc(A.n)} kaydı henüz yok. <a href="${esc(ytSearch(`${A.n} ${M.n} lineups`))}" target="_blank" rel="noopener">YouTube'da ara</a></div>`;
  if(!S.spot) return `<div class="empty">Bu tarafta kayıt yok.</div>`;
  const other=H.ls==="atk"?"def":"atk", nOther=S.onMap.filter(e=>e.side===other).length;
  return `<h2 class="lu-h">${ic("target")}${esc(S.spot.pos.n)} <small>${S.spot.rows.length} kayıt · ${esc(SIDE_TXT[H.ls])}</small></h2>
    <ol class="lu-cards">${S.spot.rows.map(luCard).join("")}</ol>
    ${nOther?`<p class="muted small" style="margin:0">${esc(SIDE_TXT[other])} tarafında ${nOther} kayıt daha var.</p>`:""}`;
}
function luHTML(){
  if(!H.la) return `<div class="empty">Lineup verisi yüklenemedi.</div>`;
  const S=luState(), A=AG[H.la], M=G.maps[H.lm];
  const agBtn=id=>`<button type="button" class="lu-ag" data-lua="${id}" aria-pressed="${id===H.la}">${por(AG[id],"sm",true)}<span>${esc(AG[id].n)}</span></button>`;
  const mapBtn=m=>`<button type="button" data-lum="${m}" aria-pressed="${m===H.lm}"${S.cnt(m)?"":' class="none"'}>${esc(G.maps[m].n)}<small>${S.cnt(m)||"–"}</small></button>`;
  const sideN=s=>S.onMap.filter(e=>e.side===s).length;
  return `<p class="muted lu-intro">Ajanını ve haritayı seç, haritada hedef noktaya dokun: o noktaya atılan lineup'lar ve kurulumlar çıkar.</p>
  <div class="lu-pick">
    <div class="lu-row"><span class="lu-lbl">Ajan</span><div class="lu-ags scrollx" role="group" aria-label="Ajan">${LU_AG.map(agBtn).join("")}</div></div>
    <div class="lu-row"><span class="lu-lbl">Harita</span><div class="seg sm scrollx lu-maps" role="group" aria-label="Harita">${S.pool.map(mapBtn).join("")}${S.off.length?`<span class="lu-sep">Havuz dışı</span>${S.off.map(mapBtn).join("")}`:""}</div></div>
    <div class="lu-row"><span class="lu-lbl">Taraf</span><div class="seg sm" role="group" aria-label="Taraf">${["atk","def"].map(s=>`<button type="button" data-lus="${s}" aria-pressed="${s===H.ls}">${SIDE_TXT[s]}<small>${sideN(s)}</small></button>`).join("")}</div></div>
  </div>
  <div class="lu-grid">
    <div class="card lu-mapcard">
      <div class="mm"><img src="${esc(M.mm)}" alt="${esc(M.n)} mini haritası" width="1024" height="1024"><div class="mm-ov" id="lu-ov">${luOverlay(S)}</div></div>
      <p class="lu-legend muted small"><span><i class="lg tg"></i>Hedef nokta (sayı: kayıt)</span><span><i class="lg st"></i>Nerede dur</span><span><i class="lg lk"></i>Kurulumun baktığı yer</span></p>
    </div>
    <div class="lu-list" id="lu-list" aria-live="polite">${luList(S)}</div>
  </div>
  <p class="muted small" style="margin:0">Konumlar bölge düzeyindedir; noktalar bölgenin mini haritadaki ortasını gösterir. Kayıtlar elle seçilmiş, yaygın kullanılan kurulumlardır (yama ${esc(LU.patch||"")}); harita değişikliklerinden etkilenebilir. ${esc(A.n)} · ${esc(M.n)}: ${S.onMap.length} kayıt.</p>`;
}
/* Yalnızca nokta ya da kayıt değiştiyse görsel yeniden yüklenmesin: katman ve liste güncellenir */
function luRefresh(scrollCard){
  const S=luState(); const ov=$("#lu-ov"), li=$("#lu-list");
  if(!ov||!li){ renderHome(); return; }
  ov.innerHTML=luOverlay(S); li.innerHTML=luList(S); hSave();
  if(scrollCard){ const c=li.querySelector(".lu-card.on"); if(c){ const r=c.getBoundingClientRect(); if(r.top<60||r.bottom>innerHeight) c.scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"}); } }
}
const abIcon = (x,cls) => x ? `<span class="abk${cls?" "+cls:""}" title="${esc(x.n)}">${mk(x.img)}<i>${x.k}</i></span>` : "";
function pickCard(side,id){
  const a=AG[id], lbl={me:"Sen",fr:"Arkadaşın"}[side];
  return `<button type="button" class="f-pick" data-hpick="${side}" aria-label="${lbl}: ${esc(a.n)} — değiştir">${por(a,"xl")}<span class="f-swap">${ic("swap")}</span></button>
    <div class="f-id"><span class="f-side">${lbl}</span><b class="f-name">${esc(a.n)}</b>${roleChip(a.r)}</div>
    <div class="abrow" aria-label="Yetenekler">${ABK.map(k=>abIcon(abOf(id,k))).join("")}</div>`;
}
const abNames = l => l.map(x=>esc(x.n)).join(", ");
function ixRow(r){
  const T=IXT[r.t]||IXT.kombo;
  const right = r.b.length ? `<span class="ix-to">${ic("arrow")}</span><span class="ix-ab">${r.b.map(x=>abIcon(x)).join("")}</span>` : "";
  return `<li class="ix" data-t="${r.t}"><div class="ix-top"><span class="ix-ab">${r.a.map(x=>abIcon(x)).join("")}</span>${right}<span class="ix-t">${ic(T.i)}${T.n}</span></div>
    <div class="ix-nm">${abNames(r.a)}${r.b.length?` <span class="muted">›</span> ${abNames(r.b)}`:""}</div><p>${esc(r.x)}</p></li>`;
}
function ixList(rows,empty,max=5){
  if(!rows.length) return `<p class="muted small ix-none">${esc(empty)}</p>`;
  const head=rows.slice(0,max), rest=rows.slice(max);
  return `<ul class="ixs">${head.map(ixRow).join("")}</ul>${rest.length?`<details class="more"><summary>${rest.length} etkileşim daha</summary><ul class="ixs">${rest.map(ixRow).join("")}</ul></details>`:""}`;
}
const pctTR = v => "%"+dec(v);
function duoHTML(me,fr,map){
  if(me===fr) return `<div class="empty">Aynı takımda iki aynı ajan olamaz. Arkadaşın için başka bir ajan seç.</div>`;
  const S=synergy(me,fr), P=pairStat(me,fr,map), A=AG[me], F=AG[fr];
  const mapN = m => m==="all"?"tüm haritalar":(G.maps[m]||{}).n||m;
  const wrBox = P ? `<div class="dwr"><span class="ml">Birlikte kazanma</span><b>${pctTR(P.wr)}</b>
      ${P.diff!=null?`<span class="dl ${P.diff>=.3?"good":P.diff<=-.3?"bad":""}">${P.diff>=0?"▲ +":"▼ −"}${dec(Math.abs(P.diff))} puan</span>`:""}
      <span class="muted small">${n0(P.m)} maç · ${esc(mapN(P.map))}${P.low?" · az örnek":""}. Beklenen ${P.exp!=null?pctTR(P.exp):"–"} (ikisinin ayrı ayrı oranından).${P.fellBack?` ${esc(mapN(map))} için yeterli maç yok.`:""}</span></div>`
    : `<div class="dwr"><span class="ml">Birlikte kazanma</span><b>–</b><span class="muted small">${DUOS?"Bu ikili için yeterli maç verisi yok.":"İkili oran verisi şu an yok."}</span></div>`;
  const B=bestPartners(me,map);
  const chip=(r,val)=>`<button type="button" class="pchip${r.id===fr?" on":""}" data-hfr="${r.id}">${por(AG[r.id],"sm",true)}<span class="n">${esc(AG[r.id].n)}</span><span class="v">${val}</span></button>`;
  return `<div class="grid2">
    <div class="card duo-sum"><h2>${ic("link")}${esc(A.n)} + ${esc(F.n)}</h2>
      <div class="dsc"><div class="ring" style="--v:${S.score}"><b>${S.score}</b><small>uyum</small></div>${wrBox}</div>
      <p class="muted small" style="margin:10px 0 0">Uyum, yetenek kombolarından ve rol dengesinden hesaplanan bir tahmindir (${esc(S.roleTxt)}). Birlikte kazanma oranı ölçülmüş veridir: ${DUOS?`${esc(DUOS.queue||"Rekabetçi")} · ${esc(DUOS.rank||"")} · ${esc(DUOS.actName||"")} · ${esc(DUOS.src)} (${fmtDate(DUOS.date)})`:"veri yok"}.</p></div>
    <div class="card"><h2>${ic("spark")}Kombolar <small>${S.combos.length}</small></h2>${ixList(S.combos,"Bu iki ajanın yetenekleri arasında belirgin bir kombo yok.",6)}</div>
  </div>
  <div class="card"><h2>${ic("users")}${esc(A.n)} için en iyi eşler <small>${esc(mapN(map))}</small></h2>
    <div class="grid2 tight">
      <div><h3 class="h3">${ic("trophy")}Birlikte en çok kazanan</h3>${B.measured.length?`<div class="pchips">${B.measured.map(r=>chip(r,pctTR(r.st.wr))).join("")}</div>`:`<p class="muted small">Bu harita için yeterli ikili verisi yok.</p>`}</div>
      <div><h3 class="h3">${ic("link")}En iyi kombo</h3><div class="pchips">${B.combo.map(r=>chip(r,r.syn)).join("")}</div></div>
    </div>
    <p class="muted small" style="margin:10px 0 0">Dokun: arkadaşının ajanı olarak seç. Soldaki liste ölçülmüş birlikte kazanma oranı (en az ${n0(map==="all"?DUO_MIN.all:DUO_MIN.map)} maç), sağdaki uyum tahmini.</p></div>`;
}
function renderHome(){
  const duo=H.mode==="duo";
  segSet($("#h-mode"),"hm",H.mode);
  $("#h-arena").hidden=!duo;
  if(duo){ $("#f-me").innerHTML=pickCard("me",H.me); $("#f-en").innerHTML=pickCard("fr",H.fr); }
  const maps = DUOS&&DUOS.map ? Object.keys(DUOS.map).filter(m=>G.maps[m]).sort() : [];
  $("#h-map").hidden=!duo||!maps.length;
  $("#h-map").innerHTML=[["all","Tüm haritalar"],...maps.map(m=>[m,G.maps[m].n])].map(([k,v])=>`<button type="button" data-hmap="${k}" aria-pressed="${H.map===k}">${k==="all"?ic("map"):""}${esc(v)}</button>`).join("");
  $("#h-out").innerHTML = duo ? duoHTML(H.me,H.fr,H.map) : luHTML();
  // Yatay kaydırılan seçim satırlarında seçili öğe görünür kalsın (sayfa kaydırılmaz)
  if(!duo) document.querySelectorAll("#h-out .scrollx").forEach(row=>{ const b=row.querySelector('[aria-pressed="true"]'); if(!b) return;
    const l=b.offsetLeft-row.offsetLeft; if(l<row.scrollLeft||l+b.offsetWidth>row.scrollLeft+row.clientWidth) row.scrollLeft=Math.max(0,l-24); });
  hSave();
}

/* Ajan seçici */
const ov=$("#ov"); let pickerCb=null, pickerRole="all";
function openPicker(title,cb){
  pickerCb=cb; pickerRole="all";
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><h3>${esc(title)}</h3><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <div class="toolbar"><div class="seg sm" id="pk-roles">${[["all","Tümü"],...ROLE_ORDER.map(r=>[r,ROLES[r].n])].map(([k,v])=>`<button type="button" data-r="${k}" aria-pressed="${k===pickerRole}">${k!=="all"?mk(ROLES[k].img,"rmk"):""}${esc(v)}</button>`).join("")}</div>
    <input id="pk-q" type="search" placeholder="İsimle ara" aria-label="Ajan ara"></div>
    <div class="pgrid" id="pk-grid"></div></div>`;
  ov.hidden=false; drawPicker();
  $("#pk-q").addEventListener("input",drawPicker);
  $("#pk-roles").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;pickerRole=b.dataset.r;[...$("#pk-roles").children].forEach(x=>x.setAttribute("aria-pressed",x===b));drawPicker()});
  setTimeout(()=>{const q=$("#pk-q"); if(q&&matchMedia("(pointer:fine)").matches) q.focus()},30);
}
function drawPicker(){
  const q=key($("#pk-q").value);
  const rows=ALIST.filter(a=>(pickerRole==="all"||a.r===pickerRole)&&(!q||key(a.n).includes(q)));
  $("#pk-grid").innerHTML=rows.map(a=>`<button class="pbtn" type="button" data-pick="${a.id}">${por(a)}<span>${esc(a.n)}</span></button>`).join("")||'<div class="empty">Bulunamadı.</div>';
}
ov.addEventListener("click",e=>{
  if(e.target===ov||e.target.closest("[data-close]")){ ov.hidden=true; return; }
  const p=e.target.closest("[data-pick]"); if(p){ ov.hidden=true; pickerCb&&pickerCb(AG[p.dataset.pick]); }
});
ov.addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.id==="pk-q"){ const f=ov.querySelector("[data-pick]"); if(f) f.click(); } });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!ov.hidden) ov.hidden=true; });

const segSet=(el,attr,v)=>[...el.children].forEach(x=>x.setAttribute("aria-pressed",x.dataset[attr]===v));
$("#h-mode").addEventListener("click",e=>{ const b=e.target.closest("[data-hm]"); if(!b||b.dataset.hm===H.mode) return; H.mode=b.dataset.hm; renderHome(); });
$("#h-map").addEventListener("click",e=>{ const b=e.target.closest("[data-hmap]"); if(!b) return; H.map=b.dataset.hmap; renderHome(); });
document.getElementById("v-ana").addEventListener("click",e=>{
  const p=e.target.closest("[data-hpick]"); if(p){ const side=p.dataset.hpick;
    openPicker({me:"Senin ajanın",fr:"Arkadaşının ajanı"}[side],a=>{ H[side]=a.id; if(H.me===H.fr) H[side==="me"?"fr":"me"]=ALIST.find(x=>x.id!==a.id).id; renderHome(); }); return; }
  const f=e.target.closest("[data-hfr]"); if(f){ H.fr=f.dataset.hfr; renderHome(); return; }
  // Lineup: ajan, harita ve taraf tüm ekranı; nokta ve kayıt yalnızca harita katmanını ve listeyi yeniler
  const la=e.target.closest("[data-lua]"); if(la){ if(H.la!==la.dataset.lua){ H.la=la.dataset.lua; H.lp=H.le=null; const y=scrollY; renderHome(); scrollTo(0,y); } return; }
  const lm=e.target.closest("[data-lum]"); if(lm){ if(H.lm!==lm.dataset.lum){ H.lm=lm.dataset.lum; H.lp=H.le=null; const y=scrollY; renderHome(); scrollTo(0,y); } return; }
  const ls=e.target.closest("[data-lus]"); if(ls){ if(H.ls!==ls.dataset.lus){ H.ls=ls.dataset.lus; H.lp=H.le=null; const y=scrollY; renderHome(); scrollTo(0,y); } return; }
  const lp=e.target.closest("[data-lup]"); if(lp){ H.lp=lp.dataset.lup; H.le=null; luRefresh(true); return; }
  const le=e.target.closest("[data-lue]"); if(le){ const fromMap=!!le.closest("#lu-ov"); H.le = !fromMap&&H.le===le.dataset.lue ? "" : le.dataset.lue; luRefresh(fromMap); }
});
$("#h-swap").addEventListener("click",()=>{ [H.me,H.fr]=[H.fr,H.me]; renderHome(); });

/* ===================================================================
 *  AJANLAR
 * =================================================================== */
let aRole="all", aMap="all", aSort=pref("rk-val-asort","role");
$("#a-roles").innerHTML=[["all","Tümü"],...ROLE_ORDER.map(r=>[r,ROLES[r].n])].map(([k,v])=>`<button type="button" data-r="${k}" aria-pressed="${k==="all"}">${k!=="all"?mk(ROLES[k].img,"rmk"):""}${esc(v)}</button>`).join("");
$("#a-roles").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;aRole=b.dataset.r;segSet($("#a-roles"),"r",aRole);renderGrid()});
const poolIds = Object.keys(POOL).filter(m=>G.maps[m]).sort();
$("#a-maps").innerHTML = poolIds.length ? [["all","Tüm haritalar"],...poolIds.map(m=>[m,G.maps[m].n])].map(([k,v])=>`<button type="button" data-m="${k}" aria-pressed="${k==="all"}">${k==="all"?ic("map"):""}${esc(v)}</button>`).join("") : "";
$("#a-maps").hidden=!poolIds.length;
$("#a-maps").addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;aMap=b.dataset.m;segSet($("#a-maps"),"m",aMap);renderGrid()});
$("#a-q").addEventListener("input",renderGrid);
segSet($("#a-sort"),"s",aSort);
$("#a-sort").addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;aSort=b.dataset.s;setPref("rk-val-asort",aSort);segSet($("#a-sort"),"s",aSort);renderGrid()});
const wrOn = (a,m) => m==="all" ? a.wr : (MAPSTAT[m]&&MAPSTAT[m][a.id] ? MAPSTAT[m][a.id][0] : null);
function renderGrid(){
  const q=key($("#a-q").value), wrOf=a=>wrOn(a,aMap), T=aMap==="all"?TIER:tiersFor(wrOf);
  const rows=ALIST.filter(a=>(aRole==="all"||a.r===aRole)&&(!q||key(a.n).includes(q)));
  const card=a=>`<button class="ccard" type="button" data-go="a-${a.id}">${por(a)}<span class="nm">${esc(a.n)}</span><span class="wr">${wrOf(a)!=null?tierB(T[a.id])+pct(wrOf(a)):"–"}</span></button>`;
  const byWr=(x,y)=>(wrOf(y)??-1)-(wrOf(x)??-1)||x.n.localeCompare(y.n,"tr");
  const out=$("#a-grid");
  if(!rows.length){ out.innerHTML='<div class="empty">Bulunamadı.</div>'; return; }
  if(aSort==="az"){ out.innerHTML=`<div class="cgrid">${rows.map(card).join("")}</div>`; return; }
  if(aSort==="tier"){ const g={}; rows.forEach(a=>{(g[T[a.id]||"?"]||=[]).push(a)});
    out.innerHTML=["S","A","B","C","D","?"].filter(t=>g[t]).map(t=>`<section class="tsec"><h2 class="th"><span class="tier big" data-t="${t}">${t}</span>${TIER_TXT[t]}<small>${g[t].length}</small></h2><div class="cgrid">${g[t].sort(byWr).map(card).join("")}</div></section>`).join(""); return; }
  out.innerHTML=ROLE_ORDER.map(r=>{ const g=rows.filter(a=>a.r===r); if(!g.length) return "";
    return `<section class="tsec"><h2 class="rh" style="--rc:var(--r-${r})">${mk(ROLES[r].img)}${esc(ROLES[r].n)}<small>${g.length}</small></h2><div class="cgrid">${g.sort(byWr).map(card).join("")}</div></section>`; }).join("");
}
const srcLabel = () => ST ? `${ST.queue||"Rekabetçi"} · ${ST.rank||""} · ${ST.act||""} · ${ST.src} (${fmtDate(ST.date)})` : "";
$("#a-src").textContent = ST ? `Oranlar: ${srcLabel()}. Kademe, kazanma oranına göre yüzdelik dilimdir.` : "Kazanma oranı verisi şu an yok.";

/* ===================================================================
 *  PROFİL — sekmeli: Yetenekler · Haritalar · Oynanış
 * =================================================================== */
const ROLE_TIPS = {
  assault:["Takımın ilk girenisin: alana yeteneğinle gir, ilk düelloyu sen al.","Girişten hemen önce takım arkadaşından flaş ya da bilgi iste; yalnız girme.","Skor aldıktan sonra kaçış yeteneğin hazırsa geri çekilip yeniden açı al."],
  breaker:["Flaş ve bilgi yeteneklerini takım girmeden hemen önce kullan.","Yeteneğinden sonra açıyı bir takım arkadaşınla birlikte kontrol et.","Tarama yeteneklerini tur başında boşa harcama; giriş anına sakla."],
  strategist:["Dumanlarla tehlikeli görüş hatlarını kapat, takımına güvenli geçiş aç.","Dumanı çok erken atma; takımın giriş zamanına göre kullan.","Spike kurulduktan sonra kalan yeteneklerini savunma için sakla."],
  sentinel:["Bölgeyi tuzak ve kameralarla tut, yan geçişlere karşı arkayı kolla.","Kurulumunun yerini turdan tura değiştir; rakip ezberlemesin.","Saldırırken yeteneklerini Spike kurulduktan sonraki savunmaya sakla."],
};
let pTab="yetenek", pId=null;
function changeBody(ch){
  if(!ch) return "";
  if(ch.v==="new"&&!ch.c.length) return `<p class="muted small" style="margin:0">${esc(ch.s||"Bu yamada oyuna eklendi.")}</p>`;
  return `<div class="chparts">${ch.c.map(([name,icon,lines])=>`<div class="chp">
      <span class="chico">${icon?mk(icon):ic("info")}</span>
      <div style="min-width:0"><div class="chn">${esc(name||"Genel")}</div><ul class="lns">${lines.map(lineHTML).join("")}</ul></div></div>`).join("")}</div>
    ${ch.s?`<details class="why"${ch.c.length?"":" open"}><summary>Riot neden değiştirdi?</summary><p>${esc(ch.s)}</p></details>`:""}`;
}
function lineHTML([t,d]){
  const ar=t.split("→"); const ci=ar[0].lastIndexOf(":");
  const name=ar.length===2&&ci>0?ar[0].slice(0,ci):"", left=ar.length===2?(ci>0?ar[0].slice(ci+1):ar[0]):"";
  const sym=d>0?"▲":d<0?"▼":"⇅", cls=d>0?"good":d<0?"bad":"even";
  const val = ar.length===2 ? `<span class="old">${esc(left.trim())}</span><span class="to">→</span><b class="new">${esc(ar[1].trim())}</b>` : esc(t);
  return `<li class="ln ${cls}"><i>${sym}</i><span>${name?`<span class="lk">${esc(name)}:</span> `:""}${val}</span></li>`;
}
function renderProfile(id){
  const a=AG[id], v=$("#v-profil");
  if(id!==pId){ pId=id; pTab="yetenek"; }
  if(!a){ v.innerHTML='<div class="empty">Ajan bulunamadı. <a href="#ajanlar">Listeye dön</a>.</div>'; return; }
  const lc=lastChange("ag",id);
  const tabs=[["yetenek","Yetenekler"],["harita","Haritalar"],["oyna","Oynanış"]];
  let body="";
  if(pTab==="yetenek") body=`<div class="card"><div class="abil">${a.ab.map(x=>{
      const cp=lc&&lc.ch.c.find(g=>g[0]&&key(g[0])===key(x.n)); const d=cp?cp[2].reduce((s,l)=>s+l[1],0):0;
      return `<div class="ab${cp?" chg-ab":""}"><span class="abi">${mk(x.img)}<span class="k">${x.k==="P"?"P":x.k}</span>${cp?chgBadge(d>0?"buff":d<0?"nerf":"adj"):""}</span>
        <div style="min-width:0"><div class="n">${esc(x.n)}</div><p>${rich(x.d)}</p>
        ${cp?`<ul class="lns">${cp[2].map(lineHTML).join("")}</ul><span class="muted small">Yama ${esc(lc.n.patch)}</span>`:""}</div></div>`; }).join("")}</div></div>`;
  if(pTab==="harita"){
    const rows=poolIds.map(m=>{ const s=MAPSTAT[m]&&MAPSTAT[m][id]; return s?{m,wr:s[0],pr:s[1],n:s[2]}:null; }).filter(Boolean).sort((x,y)=>y.wr-x.wr);
    const maxPr=Math.max(1,...rows.map(r=>r.pr));
    body = rows.length ? `<div class="card"><h2>${ic("map")}Haritalara göre <small>${esc(srcLabel())}</small></h2>
      <p class="muted small" style="margin:-4px 0 12px">Rekabetçi harita havuzu. Sağdaki sayı: o haritadaki kazanma oranının ${esc(a.n)} ortalamasından farkı.</p>
      <div class="mrows">${rows.map(r=>{ const dv=a.wr!=null?r.wr-a.wr:0; const M=G.maps[r.m];
        return `<div class="mrow"><span class="mi" style="background-image:url('${esc(M.img)}')">${esc(M.n)}</span>
          <div class="bars"><div><span>Kazanma</span><i><b style="width:${Math.max(0,Math.min(100,(r.wr-40)*5))}%"></b></i><span>${pct(r.wr)}</span></div>
          <div><span>Seçilme</span><i><b class="pr" style="width:${r.pr/maxPr*100}%"></b></i><span>${pct(r.pr)}</span></div></div>
          <span class="dv ${dv>=.5?"good":dv<=-.5?"bad":""}">${dv>=0?"▲ +":"▼ −"}${dec(Math.abs(dv))}</span></div>`; }).join("")}</div>
      ${rows.length>1?`<p class="small" style="margin:12px 0 0">En iyi haritası <b>${esc(G.maps[rows[0].m].n)}</b>, en zayıf olduğu <b>${esc(G.maps[rows[rows.length-1].m].n)}</b>.</p>`:""}</div>`
      : '<div class="empty">Bu ajan için harita bazlı oran verisi yok.</div>';
  }
  if(pTab==="oyna"){
    const ctr=counterList(id), bp=bestPartners(id,"all").measured;
    const face=(x,attr,val)=>`<button type="button" class="pchip" ${attr}>${por(AG[x],"sm",true)}<span class="n">${esc(AG[x].n)}</span>${val?`<span class="v">${val}</span>`:""}</button>`;
    body=`<div class="grid2"><div class="card"><h2>${mk(ROLES[a.r]&&ROLES[a.r].img,"rmk")}${esc((ROLES[a.r]||{}).n||"Rol")}</h2><p class="muted" style="margin:0 0 10px">${esc((ROLES[a.r]||{}).d||"")}</p><ul class="tips">${(ROLE_TIPS[a.r]||[]).map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
      <div class="card"><h2>${ic("bolt")}Kontralar <small>yetenekleri ${esc(a.n)}'i en çok zorlayanlar</small></h2>${ctr.length?`<div class="pchips">${ctr.map(r=>face(r.id,`data-go="a-${r.id}"`,"")).join("")}</div>`:`<p class="muted small" style="margin:0">Belirgin bir yetenek kontrası yok.</p>`}
        <h3 class="h3">${ic("users")}İyi eşler <small class="muted">birlikte kazanma</small></h3>${bp.length?`<div class="pchips">${bp.map(r=>face(r.id,`data-hduo="${id}:${r.id}"`,pct(r.st.wr))).join("")}</div>`:`<p class="muted small" style="margin:0">İkili oran verisi yok.</p>`}
        <p class="muted small" style="margin:10px 0 0">Dokun: kontrada o ajanın profili, eşlerde Duo ekranı açılır.</p></div></div>
      ${(IXD.tips[id]||[]).length?`<div class="card"><h2>${ic("target")}${esc(a.n)} karşısında</h2><ul class="tips">${IXD.tips[id].map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`:""}
      <div class="card"><h2>Hikâyesi</h2><p style="margin:0">${rich(a.d)}</p></div>`;
  }
  const kpis = a.wr!=null ? `<div class="ph-kpi"><span class="tier big" data-t="${TIER[a.id]}">${TIER[a.id]}</span><div><b>${pct(a.wr)}</b><span>kazanma</span></div><div><b>${pct(a.pr)}</b><span>seçilme</span></div><div><b>${a.games>=1e6?dec(a.games/1e6)+" mn":n0(a.games/1e3)+" bin"}</b><span>maç</span></div></div>` : `<div class="ph-kpi"><span class="muted small">Oran verisi yok</span></div>`;
  v.innerHTML=`<a href="#ajanlar" class="back">‹ Ajanlar</a>
  <div class="prof-head">${por(a,"lg")}
    <div class="ph-id"><h1>${esc(a.n)}</h1><div class="row">${roleChip(a.r)}</div></div>
    ${kpis}
    <div class="ph-cta">${LU_AG.includes(a.id)?`<button class="btn gold" type="button" id="pf-lu">${ic("target")}Lineup'ları gör</button>`:`<button class="btn gold" type="button" id="pf-lu">${ic("users")}Duo'da dene</button>`}</div>
  </div>
  ${lc?`<button type="button" class="chstrip" data-v="${lc.ch.v}" data-chg="ag:${a.id}:${NOTES.indexOf(lc.n)}">${chgBadge(lc.ch.v)}<span>Yama ${esc(lc.n.patch)}: <b>${esc(VMARK[lc.ch.v][1])}</b>${lc.ch.c.length?" — "+esc(lc.ch.c.map(g=>g[0]||"Genel").join(", ")):""}</span><span class="go">Ayrıntı ›</span></button>`:""}
  <div class="ptabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-pt="${k}" aria-selected="${k===pTab}">${l}</button>`).join("")}</div>
  ${body}
  ${a.wr!=null?`<p class="muted small" style="margin:0">Oranlar: ${esc(srcLabel())}.</p>`:""}`;
  $("#pf-lu").onclick=()=>{ if(LU_AG.includes(a.id)){ H.mode="lu"; if(H.la!==a.id){ H.la=a.id; H.lm=null; H.lp=H.le=null; } }
    else { H.mode="duo"; H.me=a.id; if(H.fr===a.id) H.fr=ALIST.find(x=>x.id!==a.id).id; } location.hash="ana"; };
  v.querySelector(".ptabs").onclick=e=>{const b=e.target.closest("[data-pt]");if(!b)return;pTab=b.dataset.pt;renderProfile(id)};
  document.title=`${a.n} · Rift Kontra VALORANT`;
}

/* ===================================================================
 *  CEPHANELİK — Silahlar ve Haritalar
 * =================================================================== */
let wTab="silah";
function renderArmory(){
  [...$("#w-tabs").children].forEach(b=>b.setAttribute("aria-selected",b.dataset.wt===wTab));
  const out=$("#w-out");
  if(wTab==="silah"){
    out.innerHTML=CAT_ORDER.map(c=>{ const ws=WLIST.filter(w=>w.cat===c); if(!ws.length) return "";
      return `<section class="isec"><h2 class="th">${esc(catName(c))}<small>${ws.length}</small></h2><div class="wcards">${ws.map(w=>{ const r0=w.dr[0];
        return `<button type="button" class="wcard" data-weapon="${w.id}">${chgBadge((chgOf("wp",w.id)||{}).v)}${mk(w.img)}<span class="top"><span class="nm">${esc(w.n)}</span>${cr(w.cost)}</span>
          <span class="q" title="Kafa / gövde / bacak hasarı (yakın mesafe)${w.pel>1?", saçma başına":""}"><span class="hdv" style="color:var(--gold)">${n0(r0[2])}</span><span>${n0(r0[3])}</span><span>${n0(r0[4])}</span>${w.pel>1?`<span>×${w.pel}</span>`:""}<span style="margin-left:auto">${dec(w.fr,w.fr<10?2:1).replace(/,?0+$/,"")}/sn</span></span></button>`; }).join("")}</div></section>`; }).join("")
      + `<section class="isec"><h2 class="th">Kalkanlar<small>${ARMOR.length-1}</small></h2><div class="wcards">${ARMOR.filter(a=>a.cap).map(a=>`<div class="gcard">${mk(a.img)}<div><b>${esc(a.n)}</b> ${cr(a.cost)}<p>${esc(a.d||"")}</p></div></div>`).join("")}</div></section>`;
  } else {
    const pool=poolIds.map(m=>({id:m,...G.maps[m],st:POOL[m]})), off=Object.keys(G.maps).filter(m=>!POOL[m]).sort().map(m=>({id:m,...G.maps[m]}));
    const top=m=>{ const s=MAPSTAT[m]||{}; return Object.entries(s).filter(([k,v])=>AG[k]&&v[1]>=1).sort((x,y)=>y[1][0]-x[1][0]).slice(0,4).map(([k])=>AG[k]); };
    const mcard=m=>{ const ch=chgOf("mp",m.id);
      return `<button type="button" class="mcard" data-map="${m.id}"><span class="ban" style="background-image:url('${esc(m.img)}')"><span>${esc(m.n)}</span>${chgBadge(ch&&ch.v)}<small>${esc(m.t||"")}</small></span>
      ${m.st?`<div class="side" title="Rekabetçi turların saldıran ve savunan tarafından kazanılma oranı"><div class="lg"><span>Saldırı ${pct(m.st.atk)}</span><span>Savunma ${pct(m.st.def)}</span></div><div class="sb"><i class="a" style="width:${m.st.atk/(m.st.atk+m.st.def)*100}%"></i><i class="d" style="flex:1"></i></div></div>`:""}
      ${top(m.id).length?`<div><span class="muted small">En çok kazandıranlar</span><div class="mtop">${top(m.id).map(a=>por(a,"",true)).join("")}</div></div>`:""}</button>`; };
    out.innerHTML = (pool.length?`<section class="isec"><h2 class="th">Rekabetçi havuz<small>${pool.length}</small></h2><div class="mcards">${pool.map(mcard).join("")}</div><p class="muted small">Oranlar: ${esc(srcLabel())}. "En çok kazandıranlar": o haritada seçilme oranı en az %1 olan ajanlardan en yüksek kazanma oranlıları.</p></section>`:"")
      + `<section class="isec"><h2 class="th">${pool.length?"Havuz dışı":"Haritalar"}<small>${off.length}</small></h2><div class="mcards">${off.map(m=>`<div class="mcard off"><span class="ban" style="background-image:url('${esc(m.img)}')"><span>${esc(m.n)}</span>${chgBadge((chgOf("mp",m.id)||{}).v)}<small>${esc(m.t||"")}</small></span></div>`).join("")}</div></section>`;
  }
}
$("#w-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-wt]");if(!b)return;wTab=b.dataset.wt;history.replaceState(null,"",wTab==="harita"?"#haritalar":"#silahlar");renderArmory()});
function showWeapon(id){
  const w=W[id]; if(!w) return; const lc=lastChange("wp",id);
  const rng=r=>`${r[0]}–${r[1]} m`;
  const d0=w.dr[0][0]+1;
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(w.n)}" style="width:min(620px,100%)">
    <div class="sheet-head"><div style="flex:1;min-width:0"><h3 style="margin:0">${esc(w.n)}</h3><span class="muted small">${esc(catName(w.cat))}</span> ${cr(w.cost)}</div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    ${mk(w.img,"wimg")}
    <dl class="stg">
      <div><dt>Atış hızı</dt><dd>${dec(w.fr,2).replace(/,?0+$/,"")}/sn</dd></div><div><dt>Şarjör</dt><dd>${w.mag}</dd></div>
      <div><dt>Doldurma</dt><dd>${dec(w.rl,2).replace(/,?0+$/,"")} sn</dd></div><div><dt>Kuşanma</dt><dd>${dec(w.eq,2).replace(/,?0+$/,"")} sn</dd></div>
      <div><dt>Duvar delme</dt><dd>${esc(PEN[w.pen]||"–")}</dd></div><div><dt>İlk mermi sapması</dt><dd>${w.sp>0?dec(w.sp,2)+"°":"0°"}</dd></div>
      <div><dt>Nişan alma</dt><dd>${w.ads?dec(w.ads.zoom,2).replace(/,?0+$/,"")+"×":"–"}</dd></div><div><dt>Koşu hızı</dt><dd>${w.run?"%"+Math.round(w.run*100):"–"}</dd></div>
    </dl>
    <div><h4 class="h3" style="margin-top:0">Hasar${w.pel>1?` <small class="muted">(saçma başına, ${w.pel} saçma)</small>`:""}</h4>
    <table class="dmg"><thead><tr><th>Mesafe</th><th>Kafa</th><th>Gövde</th><th>Bacak</th></tr></thead><tbody>${w.dr.map(r=>`<tr><td>${rng(r)}</td><td class="hd">${n0(r[2])}</td><td>${n0(r[3])}</td><td>${n0(r[4])}</td></tr>`).join("")}</tbody></table></div>
    <div><h4 class="h3" style="margin-top:0">Kaç mermi? <small class="muted">(${rng(w.dr[0])}, hiç ıskalamadan${w.pel>1?", beklenen saçma isabetiyle":""})</small></h4>
    <table class="dmg"><thead><tr><th>Rakip</th><th>Kafa</th><th>Gövde</th><th>Bacak</th></tr></thead><tbody>${ARMOR.filter(a=>a.id!=="plasmaarmor").map(a=>`<tr><td>${a.id==="none"?"Kalkansız":esc(a.n)}</td>${[0,1,2].map(p=>{const k=stk(id,p,a.id,d0);return `<td class="${p===0&&k===1?"hd":""}">${k||"–"}</td>`}).join("")}</tr>`).join("")}</tbody></table></div>
    ${lc?`<div class="chbox">${vPill(lc.ch.v)} <span class="muted small">Yama ${esc(lc.n.patch)}</span>${changeBody(lc.ch)}</div>`:""}</div>`;
  ov.hidden=false; ov.querySelector("[data-close]").focus();
}
function showMap(id){
  const m=G.maps[id]; if(!m) return; const s=MAPSTAT[id]||{}; const lc=lastChange("mp",id);
  const rows=Object.entries(s).filter(([k])=>AG[k]).map(([k,v])=>({a:AG[k],wr:v[0],pr:v[1]})).sort((x,y)=>y.wr-x.wr);
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(m.n)}" style="width:min(620px,100%)">
    <div class="sheet-head"><div style="flex:1;min-width:0"><h3 style="margin:0">${esc(m.n)}</h3><span class="muted small">${esc(m.t||"")}${POOL[id]?` · saldırı ${pct(POOL[id].atk)} · savunma ${pct(POOL[id].def)}`:""}</span></div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <span class="mcard" style="cursor:default;padding:0"><span class="ban" style="background-image:url('${esc(m.img)}');height:80px"></span></span>
    ${lc?`<div class="chbox">${vPill(lc.ch.v)} <span class="muted small">Yama ${esc(lc.n.patch)}</span>${changeBody(lc.ch)}</div>`:""}
    ${rows.length?`<div><h4 class="h3" style="margin-top:0">Bu haritada ajanlar <small class="muted">kazanma · seçilme</small></h4><div class="alist">${rows.map(r=>`<button type="button" class="arow" data-go="a-${r.a.id}">${por(r.a,"sm",true)}<span class="n">${esc(r.a.n)}</span><span class="v">${pct(r.wr)}</span><span class="v muted">${pct(r.pr)}</span></button>`).join("")}</div></div>`:'<div class="empty">Bu harita için oran verisi yok.</div>'}
  </div>`;
  ov.hidden=false; ov.querySelector("[data-close]").focus();
}

/* ===================================================================
 *  YAMA
 * =================================================================== */
let ySel=0;
function showChange(type,id,ni){
  const n=NOTES[ni], ch=n&&n[type]&&n[type][id]; if(!ch) return;
  const ent = type==="ag"?AG[id]:type==="wp"?W[id]:G.maps[id]; if(!ent) return;
  const head = type==="ag"?por(ent,"sm",true): type==="wp"?`<span class="chico" style="width:64px">${mk(ent.img)}</span>`:`<span class="chico" style="width:64px;background:url('${esc(ent.img)}') center/cover"></span>`;
  const cta = type==="ag"?`<a class="btn gold" href="#a-${id}" data-close>Profili aç</a>`: type==="wp"?`<button class="btn gold" type="button" data-weapon="${id}">Silahı aç</button>`:"";
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(ent.n)} değişiklikleri" style="width:min(560px,100%)">
    <div class="sheet-head">${head}<div style="min-width:0;flex:1"><h3 style="margin:0">${esc(ent.n)}</h3>${vPill(ch.v)}</div><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    ${changeBody(ch)}
    <div class="row">${cta}<span class="muted small">Yama ${esc(n.patch)}</span></div></div>`;
  ov.hidden=false; ov.querySelector("[data-close]").focus();
}
function renderPatch(){
  const ORDER=["new","rework","buff","nerf","adj"];
  const H={new:"Yeni",rework:"Yeniden tasarlananlar",buff:"Güçlendirilenler",nerf:"Zayıflatılanlar",adj:"Dengelenenler"};
  if(!NOTES.length){ $("#y-out").innerHTML='<div class="empty">Yama notları henüz okunamadı.</div>'; $("#y-sel").innerHTML=""; return; }
  const n=NOTES[ySel];
  $("#y-sel").innerHTML=NOTES.map((x,i)=>`<button type="button" data-y="${i}" aria-pressed="${i===ySel}">${esc(x.patch)}${i===0?" · güncel":""}</button>`).join("");
  $("#y-patch").textContent=n.patch;
  $("#y-sum").textContent=n.sum||"";
  const items=[...Object.keys(n.ag).filter(k=>AG[k]).map(k=>["ag",k]),...Object.keys(n.wp).filter(k=>W[k]).map(k=>["wp",k]),...Object.keys(n.mp).filter(k=>G.maps[k]).map(k=>["mp",k])];
  const tile=([t,k])=>{ const c=n[t][k];
    if(t==="ag") return `<button class="chtile" type="button" data-chg="ag:${k}:${ySel}"><span class="pw">${por(AG[k],"",true)}${chgBadge(c.v)}</span><span>${esc(AG[k].n)}</span></button>`;
    if(t==="wp") return `<button class="chtile" type="button" data-chg="wp:${k}:${ySel}"><span class="box">${mk(W[k].img)}${chgBadge(c.v)}</span><span>${esc(W[k].n)}</span></button>`;
    return `<button class="chtile" type="button" data-chg="mp:${k}:${ySel}"><span class="box" style="background-image:url('${esc(G.maps[k].img)}')">${chgBadge(c.v)}</span><span>${esc(G.maps[k].n)}</span></button>`; };
  const secs2=ORDER.map(v=>{ const g=items.filter(([t,k])=>n[t][k].v===v); if(!g.length) return "";
    return `<section class="psec"><h2 class="th">${chgBadge(v)}${H[v]}<small>${g.length}</small></h2><div class="chgrid">${g.map(tile).join("")}</div></section>`; }).join("");
  $("#y-out").innerHTML=(secs2||'<div class="empty">Bu yamada ajan, silah ya da harita değişikliği yok.</div>')
    +`<p class="muted small">Simgeye dokun: hangi yetenek ya da değer, eskisi ve yenisi. Kaynak: <a href="${esc(n.url)}" target="_blank" rel="noopener">resmi Türkçe yama notları</a> (${esc(fmtDate(n.date))}).</p>`;
}
$("#y-sel").addEventListener("click",e=>{const b=e.target.closest("[data-y]");if(!b)return;ySel=+b.dataset.y;renderPatch()});
function renderPatchStrip(){
  const n=LAST; if(!n){ $("#d-patch").innerHTML=""; return; }
  const ag=Object.keys(n.ag).filter(k=>AG[k]), wp=Object.keys(n.wp).filter(k=>W[k]);
  const parts=[ag.length?`${ag.length} ajan`:"", wp.length?`${wp.length} silah`:"", Object.keys(n.mp).length?`${Object.keys(n.mp).length} harita`:""].filter(Boolean);
  $("#d-patch").innerHTML=`<a class="pstrip" href="#yama">${ic("scroll")}<span><b>Yama ${esc(n.patch)}</b> · ${parts.length?parts.join(", ")+" değişti":"denge değişikliği yok"}</span><span class="faces">${ag.slice(0,6).map(k=>por(AG[k],"sm")).join("")}</span><span class="go">Gör ›</span></a>`;
}

/* Genel tıklamalar */
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]"); if(g){ ov.hidden=true; location.hash=g.dataset.go; return; }
  const ch=e.target.closest("[data-chg]"); if(ch){ const [t,id,ni]=ch.dataset.chg.split(":"); showChange(t,id,+ni||0); return; }
  const w=e.target.closest("[data-weapon]"); if(w){ showWeapon(w.dataset.weapon); return; }
  const m=e.target.closest("[data-map]"); if(m){ showMap(m.dataset.map); return; }
  const hv=e.target.closest("[data-hduo]"); if(hv){ const [x,y]=hv.dataset.hduo.split(":");
    H.me=x; H.fr=y; H.mode="duo"; H.map="all"; const here=(location.hash||"#ana")==="#ana"; location.hash="ana"; if(here) route(); }
});

/* ===================================================================
 *  YÖNLENDİRME VE GEZİNME
 * =================================================================== */
const NAV=[["ana","Lineup","target"],["ajanlar","Ajanlar","users"],["silahlar","Cephanelik","gun"],["yama","Yama","scroll"]];
$("#nav-top").innerHTML=NAV.map(([h,l,i])=>`<a href="#${h}">${ic(i)}${l}</a>`).join("");
$("#nav-bot").innerHTML=NAV.map(([h,l,i])=>`<a href="#${h}">${ic(i)}<span>${l}</span></a>`).join("");
const TITLES={ana:"Rift Kontra · VALORANT lineup, kurulum ve ikili seçimi",ajanlar:"Ajanlar · Rift Kontra VALORANT",silahlar:"Cephanelik · Rift Kontra VALORANT",yama:"Yama notları · Rift Kontra VALORANT"};
function route(){
  ov.hidden=true;
  let h=(location.hash||"#ana").slice(1), v="ana";
  if(h==="haritalar"){ wTab="harita"; v="silahlar"; }
  else if(h==="silahlar"){ wTab="silah"; v="silahlar"; }
  else if(["ana","ajanlar","yama"].includes(h)) v=h;
  if(h.startsWith("a-")){ v="profil"; renderProfile(h.slice(2)); } else document.title=TITLES[v];
  if(v==="ana") renderHome();
  if(v==="silahlar") renderArmory();
  ["ana","ajanlar","profil","silahlar","yama"].forEach(x=>$("#v-"+x).hidden=x!==v);
  const nav = v==="profil"?"ajanlar":v;
  document.querySelectorAll("#nav-top a, #nav-bot a").forEach(a=>{ if(a.getAttribute("href")==="#"+nav) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
$("#hSearch").addEventListener("click",()=>openPicker("Ajan ara",a=>{location.hash="a-"+a.id}));

/* Yama ve güncellik */
document.querySelectorAll(".patch").forEach(e=>e.textContent="Yama "+(META.patch||""));
(()=>{ const f=$("#footFresh"), at=META.checkedAt; if(!at||!f) return;
  const days=(Date.now()-new Date(at))/864e5;
  f.textContent=`Veriler: Yama ${META.patch||"?"} · son kontrol ${fmtDate(at)}${days>3?" (güncelleme gecikti)":""}.`; })();
if("serviceWorker" in navigator && location.protocol==="https:"){
  // Yeni sürüm yayınlanınca sayfa bir kez kendiliğinden yenilenir (eski önbellekte takılı kalmasın)
  const hadCtl=!!navigator.serviceWorker.controller; let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(hadCtl&&!reloaded){reloaded=true;location.reload();} });
  navigator.serviceWorker.register("../sw.js",{updateViaCache:"none",scope:"../"}).then(r=>r.update()).catch(()=>{});
}
if(!ALIST.length||!WLIST.length){ document.querySelector("main").innerHTML='<div class="empty">Veri dosyaları yüklenemedi. Sayfayı yenile.</div>'; }
else { hLoad(); renderGrid(); renderPatch(); renderPatchStrip(); route(); }
