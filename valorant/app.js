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
const median = a => { if(!a.length) return null; const s=[...a].sort((x,y)=>x-y); const m=s.length>>1; return s.length%2?s[m]:(s[m-1]+s[m])/2; };
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
  shield:'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
  bolt:'<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  wand:'<path d="m4 20 11-11M14 4v3M19 9h-3M17.5 5.5l-2 2M18 14v2M20 15h-4"/>',
  play:'<path d="M7 4v16l13-8z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  ruler:'<path d="M3 16 16 3l5 5L8 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>',
  coin:'<circle cx="12" cy="12" r="8"/><path d="M9 9.5h4.5a1.75 1.75 0 0 1 0 3.5H10a1.75 1.75 0 0 0 0 3.5H15M12 7.5v1.5M12 16.5V18"/>',
  map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/>',
  head:'<circle cx="12" cy="8" r="4"/><path d="M5 21c.8-4 3.6-6 7-6s6.2 2 7 6"/>',
  reset:'<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/>',
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
  // Düelloda modellenen yetenekler: etiket başına bir yetenek
  o.duel = {}; a.ab.forEach(x => (x.t||[]).forEach(t => { if(!o.duel[t]) o.duel[t]=x; }));
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
 *  DÜELLO MOTORU — Monte Carlo atış atış simülasyonu
 *  Her deneme: iki taraf da tepki süresinden sonra ateş eder; her mermi için
 *  isabet (silah sapması + nişan hatası + mesafe), vücut bölgesi (kafa/gövde/bacak),
 *  menzile göre hasar ve kalkan emilimi hesaplanır. İlk ölen kaybeder.
 *  Yok sayılanlar: hareket ve sekme, siper, ses, ping/peeker avantajı, ilk mermiden
 *  sonraki geri tepme desenleri (yaklaşık), yetenek hasarları ve iyileştirmeler.
 * =================================================================== */
const DEG = Math.PI/180;
const AIM = [
  {n:"Ortalama", hs:.20, sig:.40, rt:.26},
  {n:"İyi",      hs:.30, sig:.32, rt:.23},
  {n:"Çok iyi",  hs:.40, sig:.25, rt:.20},
];
AIM.forEach(a => a.href = 1/(1+Math.pow(10*Math.tan(a.sig*DEG)/0.2,2)));
const DIST = [{n:"0–15 m",a:2,b:15,mid:8},{n:"15–30 m",a:15,b:30,mid:22},{n:"30–50 m",a:30,b:50,mid:40}];
const ARMOR = [{id:"none",n:"Yok",cap:0,abs:0,cost:0,img:null}];
[["lightarmor",25,.66],["heavyarmor",50,.66],["plasmaarmor",25,1]].forEach(([id,cap,abs])=>{ const g=G.gear[id]; if(g) ARMOR.push({id,n:g.n,cap:g.cap||cap,abs:g.abs||abs,cost:g.cost,img:g.img,d:g.d}); });
const ARM = Object.fromEntries(ARMOR.map(a=>[a.id,a]));
const ABFX = {
  flash:{n:"Flaş", fx:"Rakip yaklaşık 0,45 sn geç ateş eder (kısmi körlük)."},
  stun:{n:"Sersemletme", fx:"Rakip ilk 2 sn çok isabetsiz ateş eder."},
  shield:{n:"Kalkan", fx:"Sana gelen ilk isabet tamamen engellenir."},
  stim:{n:"Kuvvetli Savaş", fx:"Yaklaşık %10 daha hızlı ateş edersin."},
};
const FLASH_DELAY=.45, STUN_TIME=2, STUN_SPREAD=2.5, STIM=1.10, MAXT=6, HIT_CAP=.93, N_MAIN=1600, N_FAST=700;

function rng(seed){ let a=seed>>>0; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const gauss = R => Math.sqrt(-2*Math.log(R()||1e-9))*Math.cos(2*Math.PI*R());
const dmgAt = (w,d) => w.dr.find(r=>d>=r[0]&&d<r[1]) || w.dr[w.dr.length-1];
/* Silahın bu mesafede nasıl kullanıldığı: nişan alma, seri/tek atış temposu, sapma büyümesi */
function gunAt(w,band,stim){
  const sn = w.cat==="Sniper", shot = w.pel>1;
  const ads = !!w.ads && (sn || band>0) && !shot;
  let sp = ads ? w.ads.sp : w.sp; if(!(sp>0)) sp = 0;
  let fr = (ads && w.ads.fr) ? w.ads.fr : w.fr; if(stim) fr *= STIM;
  const auto = (["Rifle","SMG","Heavy"].includes(w.cat) && w.fr>=6) || (w.cat==="Sidearm" && w.fr>=9);
  let burst=Infinity, pause=0, F=1, gr=0;
  if(auto){
    F = w.cat==="Heavy"?4 : w.cat==="SMG"?3 : w.cat==="Sidearm"?1 : 2;
    gr = w.cat==="Heavy"?.12 : w.cat==="SMG"?.22 : w.cat==="Sidearm"?.45 : .30;
    if(w.cat!=="Heavy"){ if(band===1){burst=4;pause=.28} if(band===2){burst=2;pause=.36} }
  } else if(!shot && !sn){ // yarı otomatik: uzaklaştıkça oyuncu atışlarını yavaşlatır
    gr = band===0?.25 : band===1?.12 : .06; if(band===1) fr=Math.min(fr,4.5); if(band===2) fr=Math.min(fr,3.1); }
  // Nişan alırken büyütme insan hatasını küçültür; saçmalar gövdenin tamamına (daha geniş alana) dağılır
  return { w, sp, fr, burst, pause, F, gr, shot, pel:shot?w.pel:1, draw: ads?(sn?.12:.05):0, zoomK: ads&&w.ads.zoom>1?1/Math.sqrt(w.ads.zoom):1, R: shot?.40:.30 };
}
function mkSide(f,o,band,R){
  const w=W[f.w], g=gunAt(w,band,f.ab.has("stim")), aim=AIM[f.aim], arm=ARM[f.arm]||ARMOR[0];
  let t = Math.max(.12, aim.rt + gauss(R)*.035) + g.draw;
  if(o.ab.has("flash")) t += FLASH_DELAY;
  if(o.ab.has("stun")) t += .1;
  return { g, w, aim, t, i:0, inB:0, mag:w.mag, hp:100, sh:arm.cap, abs:arm.abs, cap:arm.cap, block:f.ab.has("shield"), stunUntil:o.ab.has("stun")?STUN_TIME:-1, fired:0 };
}
function shoot(S,T,d,t,R,ev,side){
  const g=S.g; let spread=Math.min(3.5, g.sp + g.gr*Math.max(0,S.i-g.F));
  if(t<S.stunUntil) spread += STUN_SPREAD;
  const sig=S.aim.sig*g.zoomK, tot=Math.sqrt(spread*spread+sig*sig)*DEG, x=d*Math.tan(tot);
  const pHit=HIT_CAP/(1+Math.pow(x/g.R,2));
  const pHead=Math.min(.9, S.aim.hs*Math.min(1.15,Math.sqrt((1/(1+Math.pow(x/.2,2)))/S.aim.href)));
  const row=dmgAt(S.w,d); const parts=[]; let dealt=0, blocked=false;
  for(let p=0;p<g.pel;p++){
    if(R()>=pHit) continue;
    const part = R()<pHead ? 0 : (R()<.15 ? 2 : 1);
    let dmg = row[2+part]; parts.push(part);
    if(T.block){ T.block=false; blocked=true; continue; }
    if(T.sh>0){ const a=Math.min(T.sh, dmg*T.abs); T.sh-=a; dmg-=a; }
    T.hp-=dmg; dealt+=dmg;
  }
  S.fired++; S.i++; S.inB++; S.mag--;
  let dt=1/g.fr;
  if(S.mag<=0){ dt=S.w.rl; S.mag=S.w.mag; S.i=0; S.inB=0; }
  else if(S.inB>=g.burst){ dt+=g.pause; S.i=0; S.inB=0; }
  S.t+=dt;
  if(ev) ev.push({t, s:side, parts, dealt, blocked});
}
/* Tek deneme: 1 = sen kazandın, 0 = rakip, .5 = ikisi birden / kimse */
function trial(me,en,band,R,passive,ev){
  const d = DIST[band].a + R()*(DIST[band].b-DIST[band].a);
  const A=mkSide(me,en,band,R), B=mkSide(en,me,band,R);
  if(passive==="en") B.t=Infinity; if(passive==="me") A.t=Infinity;
  while(true){
    const t=Math.min(A.t,B.t); if(t>MAXT) return {res:.5,t:MAXT,A,B,d};
    const fa=A.t<=t+1e-9, fb=B.t<=t+1e-9;
    if(fa) shoot(A,B,d,t,R,ev,"me");
    if(fb) shoot(B,A,d,t,R,ev,"en");
    if(ev) { const e=ev[ev.length-1]; e.hp=[Math.max(0,A.hp),A.sh,Math.max(0,B.hp),B.sh]; if(fa&&fb) ev[ev.length-2].hp=e.hp; }
    if(A.hp<=0||B.hp<=0) return {res: B.hp<=0&&A.hp>0?1 : A.hp<=0&&B.hp>0?0 : .5, t, A, B, d};
  }
}
const cfgKey = (me,en,band) => [me.a,me.w,me.arm,me.aim,[...me.ab].sort(),en.a,en.w,en.arm,en.aim,[...en.ab].sort(),band].join("|");
const simCache = new Map();
function winProb(me,en,band,n){
  const k="w"+n+cfgKey(me,en,band); if(simCache.has(k)) return simCache.get(k);
  // İki yönlü: (sen→rakip) ve (rakip→sen) sırasıyla yarı yarıya; aynı anda ateşte sıra avantajı kalmaz
  const h=n>>1; let s=0, R=rng(7331); for(let i=0;i<h;i++) s+=trial(me,en,band,R).res;
  R=rng(7331); for(let i=0;i<h;i++) s+=1-trial(en,me,band,R).res;
  const v=s/(2*h); if(simCache.size>4000) simCache.clear(); simCache.set(k,v); return v;
}
/* Karşılık gelmeyen ateşte öldürme süresi (tepki dahil), mermi sayısı, ilk mermide öldürme */
function oneSided(me,en,band,n){
  const R=rng(4242); const ts=[], bs=[]; let one=0, kills=0;
  for(let i=0;i<n;i++){ const r=trial(me,en,band,R,"en"); if(r.res===1){ kills++; ts.push(r.t); bs.push(r.A.fired); if(r.A.fired===1) one++; } }
  return { ttk: median(ts) ?? MAXT, bullets: median(bs) ?? 99, one: one/n, kill: kills/n };
}
function simulate(me,en,band){
  const win=winProb(me,en,band,N_MAIN), a=oneSided(me,en,band,900), b=oneSided(en,me,band,900);
  return { win, ttkMe:a.ttk, ttkEn:b.ttk, bulMe:a.bullets, bulEn:b.bullets, oneMe:a.one, oneEn:b.one };
}
/* Deterministik "kaç mermi": hiç ıskalamadan, verilen bölgeye; pompalılarda beklenen saçma isabeti */
function stk(wid,part,armId,d){
  const w=W[wid], a=ARM[armId]||ARMOR[0], row=dmgAt(w,d);
  let per=row[2+part]; if(w.pel>1){ const x=d*Math.tan(Math.max(w.sp,0)*DEG); per*=w.pel/(1+Math.pow(x/.40,2)); }
  let hp=100, sh=a.cap;
  for(let k=1;k<=60;k++){ let dm=per; if(sh>0){ const ab=Math.min(sh,dm*a.abs); sh-=ab; dm-=ab; } hp-=dm; if(hp<=0.0001) return k; }
  return null;
}

/* ===================================================================
 *  DÜELLO EKRANI
 * =================================================================== */
const D = { me:null, en:null, band:1, prev:null, log:[], tally:[0,0], budget:0 };
const fighter = (a,w,arm,aim,ab) => ({ a, w:W[w]?w:"vandal", arm:ARM[arm]?arm:"heavyarmor", aim:aim==null?1:aim, ab:new Set((ab||[]).filter(t=>AG[a]&&AG[a].duel[t])) });
function dSave(){ try { const o=f=>({a:f.a,w:f.w,arm:f.arm,aim:f.aim,ab:[...f.ab]}); localStorage.setItem("rk-val-duel",JSON.stringify({me:o(D.me),en:o(D.en),band:D.band,budget:D.budget})); } catch {} }
function dLoad(){
  try { const s=JSON.parse(localStorage.getItem("rk-val-duel")||"null");
    if(s&&s.me&&AG[s.me.a]&&s.en&&AG[s.en.a]){ D.me=fighter(s.me.a,s.me.w,s.me.arm,s.me.aim,s.me.ab); D.en=fighter(s.en.a,s.en.w,s.en.arm,s.en.aim,s.en.ab); D.band=[0,1,2].includes(s.band)?s.band:1; D.budget=s.budget||0; return; } } catch {}
  const first=ALIST[0]&&ALIST[0].id, second=ALIST[1]&&ALIST[1].id;
  D.me=fighter(AG.jett?"jett":first,"vandal","heavyarmor",1); D.en=fighter(AG.reyna?"reyna":second,W.phantom?"phantom":"vandal","heavyarmor",1);
}
const verdictTxt = s => s>=.62?["Sen kazanırsın","good"]:s>=.54?["Avantaj sende","good"]:s>.46?["Başa baş","even"]:s>.38?["Rakip önde","bad"]:["Rakip kazanır","bad"];
const secs = t => t>=MAXT?"6+ sn":dec(t,2)+" sn";
const cr = v => v ? `<span class="cr">${ic("coin")}${n0(v)}</span>` : `<span class="cr">Bedava</span>`;
const PART = ["Kafa","Gövde","Bacak"];

function fighterHTML(side){
  const f=D[side], a=AG[f.a], w=W[f.w], o=D[side==="me"?"en":"me"], d=DIST[D.band].mid;
  const wc=lastChange("wp",f.w);
  const abs=Object.entries(a.duel);
  const shot=w.pel>1;
  return `<div class="f-top">
      <button type="button" class="f-pick" data-dpick="${side}" aria-label="${side==="me"?"Ajanını":"Rakip ajanı"} değiştir: ${esc(a.n)}">${por(a,"xl")}<span class="f-swap">${ic("swap")}</span></button>
      <div class="f-id"><span class="f-side">${side==="me"?"Sen":"Rakip"}</span><b class="f-name">${esc(a.n)}</b>${roleChip(a.r)}</div>
    </div>
    <button type="button" class="f-gun" data-dgun="${side}" aria-label="Silah: ${esc(w.n)} — değiştir">
      <span style="min-width:0;display:grid;gap:6px">${mk(w.img,"gimg")}<span class="gnm">${esc(w.n)} ${wc&&wc.n===LAST?chgBadge(wc.ch.v):""}</span></span>
      <span class="gsub">${cr(w.cost)}<small>${esc(catName(w.cat))}</small><small>değiştir ›</small></span>
    </button>
    <div class="f-row" title="Kalkan">${ic("shield")}<div class="opt" role="group" aria-label="Kalkan">${ARMOR.map(x=>`<button type="button" data-darm="${side}:${x.id}" aria-pressed="${f.arm===x.id}" title="${esc(x.n)}${x.cap?` · ${x.cap} kalkan, hasarın %${Math.round(x.abs*100)}'ini emer`:""}">${x.img?mk(x.img):""}${esc(x.id==="plasmaarmor"?"Yenilenen":x.id==="none"?"Yok":x.n.split(" ")[0])}${x.cap?`<small>${x.cap}</small>`:""}</button>`).join("")}</div></div>
    <div class="f-row" title="Nişan">${ic("target")}<div class="opt" role="group" aria-label="Nişan (kafa vuruşu oranı)">${AIM.map((x,i)=>`<button type="button" data-daim="${side}:${i}" aria-pressed="${f.aim===i}">${esc(x.n)}<small>%${Math.round(x.hs*100)}</small></button>`).join("")}</div></div>
    ${abs.length?`<div class="f-row" title="Düelloya etki eden yetenekler">${ic("spark")}<div class="opt abt" role="group" aria-label="Yetenek kullan">${abs.map(([t,x])=>`<button type="button" data-dab="${side}:${t}" aria-pressed="${f.ab.has(t)}" title="${esc(x.n)}: ${esc(ABFX[t].fx)}">${mk(x.img)}${esc(ABFX[t].n)}</button>`).join("")}</div></div>`:""}
    <dl class="f-stats" title="Hiç ıskalamadan, rakibin kalkanına karşı ${DIST[D.band].n} mesafede kaç mermi gerekir${shot?" (pompalıda beklenen saçma isabetiyle)":""}">
      ${[0,1,2].map(p=>{const k=stk(f.w,p,o.arm,d);return `<div class="${p===0&&k===1?"hd":""}"><dt>${PART[p]}</dt><dd>${k?(shot?"≈":"")+k:"–"}</dd></div>`}).join("")}
      <div><dt>Atış/sn</dt><dd>${dec(w.fr,w.fr<10?2:1).replace(/,?0+$/,"")}</dd></div>
      <div><dt>Şarjör</dt><dd>${w.mag}</dd></div>
    </dl>`;
}
function metric(label,val,delta,goodUp,hint){
  const d = delta==null||Math.abs(delta)<0.005 ? "" : `<span class="dl ${(delta>0)===goodUp?"good":"bad"}">${delta>0?"▲":"▼"} %${Math.abs(delta*100).toFixed(0)}</span>`;
  return `<div class="mt" title="${esc(hint||"")}"><span class="ml">${label}</span><b>${val}</b>${d}</div>`;
}
let lastR=null;
function renderDuel(){
  $("#f-me").innerHTML=fighterHTML("me"); $("#f-en").innerHTML=fighterHTML("en");
  $("#d-dist").innerHTML=DIST.map((x,i)=>`<button type="button" data-dband="${i}" aria-pressed="${D.band===i}">${x.n}</button>`).join("")+`<small>Mesafe</small>`;
  const r=simulate(D.me,D.en,D.band); lastR=r; const out=$("#d-result"), p=D.prev;
  const rel=(a,b)=>b?(a-b)/b:null;
  const V=verdictTxt(r.win), pctMe=Math.round(r.win*100);
  out.innerHTML=`
    <div class="tug" role="img" aria-label="Kazanma şansı: sen yüzde ${pctMe}, rakip yüzde ${100-pctMe}">
      <span class="tug-me" style="width:${pctMe}%"><b>%${pctMe}</b></span><span class="tug-en"><b>%${100-pctMe}</b></span>
    </div>
    <div class="verdict ${V[1]}"><span class="vh">${esc(V[0])}</span>
      <span class="muted small">Bu ayarlarla 100 düellonun yaklaşık <b>${pctMe}</b>'ini sen kazanırsın.</span></div>
    <div class="metrics">
      ${metric("Rakibi indirme",secs(r.ttkMe),p?rel(r.ttkMe,p.ttkMe):null,false,"Rakip karşılık vermezse: tepki süresi + ilk atıştan ölüme kadar geçen süre (ortanca)")}
      ${metric("Seni indirme",secs(r.ttkEn),p?rel(r.ttkEn,p.ttkEn):null,true,"Sen karşılık vermezsen rakibin seni indirme süresi (ortanca)")}
      ${metric("Gereken mermi",dec(r.bulMe,r.bulMe%1?1:0),p?rel(r.bulMe,p.bulMe):null,false,"Rakibi indirmek için ateşlediğin mermi sayısı (ortanca, ıskalar dahil)")}
      ${metric("İlk mermide öldürme","%"+Math.round(r.oneMe*100),p?(p.oneMe?rel(r.oneMe,p.oneMe):(r.oneMe>0?1:null)):null,true,"İlk merminin rakibi tek başına indirme olasılığı")}
    </div>
    ${D.log.length?`<ul class="dlog">${D.log.slice(0,3).map((l,i)=>`<li class="${i?"old":""}">${l}</li>`).join("")}</ul>`:`<p class="muted small" style="margin:0">Silahı, kalkanı, mesafeyi ya da nişanı değiştir; sonuç anında değişsin.</p>`}
    <div class="fight-row"><button type="button" class="btn gold" id="d-fight">${ic("play")}Dövüştür</button><span class="tally" id="d-tally">${D.tally[0]+D.tally[1]?`Skor ${D.tally[0]} – ${D.tally[1]}`:""}</span></div>
    <div class="arena-bars" id="d-bars" hidden>
      <div class="hb-top"><span class="hb-clock" id="hb-t">0,00 sn</span><span class="muted small" id="hb-d"></span></div>
      <div class="hb"><span>${esc(AG[D.me.a].n)}</span><span class="bar"><b id="hb-me"></b><s id="hs-me"></s></span><span class="num" id="hn-me"></span></div>
      <div class="hb"><span>${esc(AG[D.en.a].n)}</span><span class="bar"><b id="hb-en" class="en"></b><s id="hs-en"></s></span><span class="num" id="hn-en"></span></div>
      <ul class="feed" id="d-feed" aria-hidden="true"></ul>
      <p id="d-ko" class="ko" aria-live="polite"></p>
    </div>
    <p class="note muted small">${ic("info")}<span>Atış atış ${N_MAIN} denemelik simülasyon: silahın atış hızı, ilk mermi sapması, menzile göre kafa/gövde/bacak hasarı, kalkan emilimi ve nişan profilinin tepki süresi ile kafa oranı. Hareket, siper, ses, ping avantajı, yetenek hasarları ve iyileştirmeler hesaba katılmaz; ajan seçimi yalnızca işaretli yeteneklerle etkiler.</span></p>`;
  $("#d-fight").onclick=fight;
  renderRecs(); renderRange();
  D.prev={ttkMe:r.ttkMe,ttkEn:r.ttkEn,bulMe:r.bulMe,oneMe:r.oneMe,win:r.win};
  dSave();
}
/* Dövüştür: rastgele bir deneme atış atış oynatılır */
function fight(){
  const bars=$("#d-bars"); bars.hidden=false;
  const ev=[]; const seed=(Math.random()*2**31)|0; const res=trial(D.me,D.en,D.band,rng(seed),null,ev);
  const capMe=(ARM[D.me.arm]||ARMOR[0]).cap, capEn=(ARM[D.en.arm]||ARMOR[0]).cap;
  const set=(hp,sh,cap,id)=>{ const tot=100+cap; $("#hb-"+id).style.width=(hp/tot*100)+"%"; $("#hs-"+id).style.width=(sh/tot*100)+"%"; $("#hn-"+id).textContent=Math.ceil(hp)+(cap?" +"+Math.ceil(sh):""); };
  set(100,capMe,capMe,"me"); set(100,capEn,capEn,"en");
  $("#hb-d").textContent=`${Math.round(res.d)} m`;
  const feed=$("#d-feed"), ko=$("#d-ko"), clock=$("#hb-t"); feed.innerHTML=""; ko.textContent="";
  const end=Math.max(res.t,.05); const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur=reduce?0:Math.min(3600,Math.max(1400,end*2600));
  const nm={me:AG[D.me.a].n,en:AG[D.en.a].n};
  const line=e=>{ const who=e.s==="me"?`<span class="who me">Sen</span>`:`<span class="who en">Rakip</span>`;
    if(e.blocked&&!e.dealt) return `<li><span class="t">${dec(e.t,2)}</span>${who}<span>Kalkan isabeti engelledi</span></li>`;
    if(!e.parts.length) return `<li><span class="t">${dec(e.t,2)}</span>${who}<span class="ms">Iska</span></li>`;
    const c=[0,1,2].map(p=>e.parts.filter(x=>x===p).length); const txt=c.map((k,p)=>k?`${PART[p]}${k>1?" ×"+k:""}`:"").filter(Boolean).join(", ");
    return `<li><span class="t">${dec(e.t,2)}</span>${who}<span class="${c[0]?"hd":""}">${txt}</span><span class="muted">−${Math.round(e.dealt)}</span></li>`; };
  let shown=0; const t0=performance.now(); let done=false;
  const step=now=>{ if(done) return; const k=dur?Math.min(1,(now-t0)/dur):1; const tt=end*k;
    while(shown<ev.length&&ev[shown].t<=tt+1e-9){ const e=ev[shown++]; set(e.hp[0],e.hp[1],capMe,"me"); set(e.hp[2],e.hp[3],capEn,"en"); feed.insertAdjacentHTML("afterbegin",line(e)); while(feed.children.length>4) feed.lastChild.remove(); }
    clock.textContent=dec(tt,2)+" sn";
    if(k<1){ requestAnimationFrame(step); return; }
    done=true;
    if(res.res===1){ D.tally[0]++; ko.innerHTML=`<b class="good">${esc(nm.en)} düştü.</b> ${esc(nm.me)} ${Math.ceil(res.A.hp)} canla ayakta (${secs(res.t)}, ${res.A.fired} mermi).`; }
    else if(res.res===0){ D.tally[1]++; ko.innerHTML=`<b class="bad">${esc(nm.me)} düştü.</b> ${esc(nm.en)} ${Math.ceil(res.B.hp)} canla ayakta (${secs(res.t)}, ${res.B.fired} mermi).`; }
    else ko.innerHTML = res.t>=MAXT?`<b>6 saniyede kimse düşmedi.</b>`:`<b>İkisi aynı anda düştü (takas).</b>`;
    $("#d-tally").textContent=`Skor ${D.tally[0]} – ${D.tally[1]}`;
    $("#d-fight").innerHTML=`${ic("reset")}Tekrar dövüştür`;
  };
  requestAnimationFrame(step); setTimeout(()=>step(t0+dur+1), dur+80);
}
/* Bu rakibe ve menzile karşı en iyi silahlar: her silah senin elinde denenir */
const BUDGET = [[0,"Tümü"],[2900,"≤ 2.900"],[1600,"≤ 1.600"],[800,"≤ 800"]];
function weaponGains(side,list){
  const base=winProb(D.me,D.en,D.band,N_FAST);
  return list.map(w=>{ const f={...D[side],w:w.id}; const p= side==="me"?winProb(f,D.en,D.band,N_FAST):winProb(D.me,f,D.band,N_FAST);
    return {w, win:side==="me"?p:1-p, gain: side==="me"?p-base:base-p}; });
}
function renderRecs(){
  const lim=BUDGET[D.budget][0];
  const list=WLIST.filter(w=>w.id!==D.me.w&&(!lim||w.cost<=lim));
  const best=weaponGains("me",list).sort((a,b)=>b.win-a.win).slice(0,6);
  $("#d-recs").innerHTML=`<h2>${ic("wand")}Bu rakibe en iyi silahlar <small>${esc(DIST[D.band].n)}</small></h2>
    <div class="seg sm" role="group" aria-label="Bütçe" style="margin-bottom:12px">${BUDGET.map(([v,l],i)=>`<button type="button" data-dbud="${i}" aria-pressed="${D.budget===i}">${i?ic("coin"):""}${l}</button>`).join("")}</div>
    ${best.length?`<div class="rec-row">${best.map(x=>`<button type="button" class="rec" data-dwpn="${x.w.id}" title="Kazanma şansın %${Math.round(x.win*100)} olur">${mk(x.w.img)}<span class="nm">${esc(x.w.n)}</span>${cr(x.w.cost)}<span class="gain ${x.gain>.004?"good":x.gain<-.004?"bad":""}">${Math.abs(x.gain)<.005?"±0":(x.gain>0?"+":"−")+Math.round(Math.abs(x.gain)*100)} puan</span></button>`).join("")}</div>`:'<div class="empty">Bu bütçede başka silah yok.</div>'}
    <p class="muted small" style="margin:10px 0 0">Puan: silahı değiştirirsen kazanma şansın kaç puan değişir. Dokun, kuşan.</p>`;
}
function renderRange(){
  $("#d-range").innerHTML=`<h2>${ic("ruler")}Mesafeye göre şansın</h2>
    <div class="rng">${DIST.map((x,i)=>{ const p=Math.round(winProb(D.me,D.en,i,i===D.band?N_MAIN:N_FAST)*100);
      return `<button type="button" class="rngrow" data-dband="${i}" aria-pressed="${D.band===i}"><span class="l">${x.n}</span><span class="tb" role="img" aria-label="Yüzde ${p}"><i style="width:${p}%"></i></span><b class="${p>=54?"good":p<=46?"bad":""}">%${p}</b></button>`; }).join("")}</div>
    <p class="muted small" style="margin:10px 0 0">${(()=>{ const ps=DIST.map((x,i)=>winProb(D.me,D.en,i,i===D.band?N_MAIN:N_FAST)); const bi=ps.indexOf(Math.max(...ps)), wi=ps.indexOf(Math.min(...ps));
      return ps[bi]-ps[wi]<.06?"Mesafe bu eşleşmede pek fark yaratmıyor.":`En rahat olduğun mesafe <b>${DIST[bi].n}</b>; <b>${DIST[wi].n}</b> aralığından kaçın.`; })()}</p>`;
}
function logChange(side,what,before){
  const r=winProb(D.me,D.en,D.band,N_MAIN); const d=Math.round((r-before)*100);
  const sf=side==="me"?"n":"";
  D.log.unshift(`${side?`<span class="who ${side}">${side==="me"?"Sen":"Rakip"}</span> `:""}${what.replace("{s}",sf)} → avantajın <b class="${d>=0?"good":"bad"}">${d>=0?"+":"−"}${Math.abs(d)} puan</b>`); D.log=D.log.slice(0,3);
}
function change(side,fn,what){ const before=winProb(D.me,D.en,D.band,N_MAIN); fn(); if(what) logChange(side,what,before); renderDuel(); }

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
/* Silah seçici: her seçeneğin kazanma şansına etkisi kutunun üstünde */
let wpSide="me";
function openWeaponPicker(side){
  wpSide=side; const f=D[side];
  const gains=Object.fromEntries(weaponGains(side,WLIST).map(x=>[x.w.id,x]));
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Silah seç">
    <div class="sheet-head"><h3>${side==="me"?"Senin":"Rakibin"} silahı</h3><span class="muted small">${esc(DIST[D.band].n)}</span><button class="btn icon" type="button" data-close aria-label="Kapat">${ic("x")}</button></div>
    <p class="muted small" style="margin:0">Kutulardaki sayı: bu silahla ${side==="me"?"senin":"rakibin"} kazanma şansı kaç puan değişir.</p>
    <div class="wpk">${CAT_ORDER.map(c=>{const ws=WLIST.filter(w=>w.cat===c); if(!ws.length) return "";
      return `<section><h4>${esc(catName(c))}</h4><div class="wgrid">${ws.map(w=>{const g=gains[w.id], on=w.id===f.w; const v=g?g.gain:0;
        return `<button type="button" class="wbtn${on?" on":""}" data-wpick="${w.id}"${on?' aria-current="true"':""}>${chgBadge((chgOf("wp",w.id)||{}).v)}${mk(w.img)}<span class="nm">${esc(w.n)}</span><span class="meta">${cr(w.cost)}<span class="gain ${on?"":v>.004?"good":v<-.004?"bad":""}">${on?"Kuşanılı":Math.abs(v)<.005?"±0":(v>0?"+":"−")+Math.round(Math.abs(v)*100)}</span></span></button>`}).join("")}</div></section>`}).join("")}</div></div>`;
  ov.hidden=false;
}
ov.addEventListener("click",e=>{
  if(e.target===ov||e.target.closest("[data-close]")){ ov.hidden=true; return; }
  const p=e.target.closest("[data-pick]"); if(p){ ov.hidden=true; pickerCb&&pickerCb(AG[p.dataset.pick]); return; }
  const w=e.target.closest("[data-wpick]"); if(w){ ov.hidden=true; const id=w.dataset.wpick, side=wpSide; if(id===D[side].w) return;
    const old=W[D[side].w].n; change(side,()=>{D[side].w=id},`${esc(old)} yerine <b>${esc(W[id].n)}</b> aldı{s}`); return; }
});
ov.addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.id==="pk-q"){ const f=ov.querySelector("[data-pick]"); if(f) f.click(); } });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!ov.hidden) ov.hidden=true; });

document.getElementById("v-ana").addEventListener("click",e=>{
  const t=e.target.closest("[data-dpick],[data-dgun],[data-darm],[data-daim],[data-dab],[data-dband],[data-dwpn],[data-dbud]"); if(!t) return;
  const ds=t.dataset;
  if(ds.dpick){ const side=ds.dpick; openPicker(side==="me"?"Senin ajanın":"Rakip ajan",a=>{ const f=D[side]; D[side]=fighter(a.id,f.w,f.arm,f.aim,[...f.ab]); D.log=[]; D.prev=null; renderDuel(); }); }
  else if(ds.dgun) openWeaponPicker(ds.dgun);
  else if(ds.darm){ const [s,id]=ds.darm.split(":"); if(D[s].arm===id) return; change(s,()=>{D[s].arm=id},id==="none"?"kalkanı çıkardı{s}":`<b>${esc(ARM[id].n)}</b> aldı{s}`); }
  else if(ds.daim){ const [s,i]=ds.daim.split(":"); if(D[s].aim===+i) return; change(s,()=>{D[s].aim=+i},`nişanı <b>${esc(AIM[+i].n)}</b> seçti{s}`); }
  else if(ds.dab){ const [s,t2]=ds.dab.split(":"); const on=D[s].ab.has(t2); const x=AG[D[s].a].duel[t2];
    change(s,()=>{ on?D[s].ab.delete(t2):D[s].ab.add(t2); },`<b>${esc(x.n)}</b> ${on?"kullanmadı{s}":"kullandı{s}"}`); }
  else if(ds.dband){ const b=+ds.dband; if(b===D.band) return; change(null,()=>{D.band=b},`Mesafe <b>${esc(DIST[b].n)}</b>`); }
  else if(ds.dwpn){ const id=ds.dwpn, old=W[D.me.w].n; change("me",()=>{D.me.w=id},`${esc(old)} yerine <b>${esc(W[id].n)}</b> aldı{s}`); }
  else if(ds.dbud){ D.budget=+ds.dbud; renderRecs(); dSave(); }
});
$("#d-swap").addEventListener("click",()=>{ [D.me,D.en]=[D.en,D.me]; D.log=[]; D.prev=null; D.tally=[0,0]; renderDuel(); });

/* ===================================================================
 *  AJANLAR
 * =================================================================== */
let aRole="all", aMap="all", aSort=pref("rk-val-asort","role");
const segSet=(el,attr,v)=>[...el.children].forEach(x=>x.setAttribute("aria-pressed",x.dataset[attr]===v));
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
        ${(x.t||[]).filter(t=>a.duel[t]===x).map(t=>`<span class="dtag">${ic("duel")}Düelloda: ${esc(ABFX[t].fx)}</span>`).join(" ")}
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
    const du=Object.entries(a.duel);
    body=`<div class="grid2"><div class="card"><h2>${mk(ROLES[a.r]&&ROLES[a.r].img,"rmk")}${esc((ROLES[a.r]||{}).n||"Rol")}</h2><p class="muted" style="margin:0 0 10px">${esc((ROLES[a.r]||{}).d||"")}</p><ul class="tips">${(ROLE_TIPS[a.r]||[]).map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
      <div class="card"><h2>${ic("duel")}Düelloda</h2>${du.length?`<ul class="tips">${du.map(([t,x])=>`<li><b>${esc(x.n)}</b>: ${esc(ABFX[t].fx)}</li>`).join("")}</ul><p class="muted small" style="margin:10px 0 0">Düello ekranında bu yetenekleri açıp kapatabilirsin.</p>`:`<p class="muted" style="margin:0">Bu ajanın yetenekleri (hareket, bilgi, duman, alan kontrolü) 1v1 silah düellosunun hesabına doğrudan girmiyor. Sonucu silah, kalkan, mesafe ve nişan belirler.</p>`}</div></div>
      <div class="card"><h2>Hikâyesi</h2><p style="margin:0">${rich(a.d)}</p></div>`;
  }
  const kpis = a.wr!=null ? `<div class="ph-kpi"><span class="tier big" data-t="${TIER[a.id]}">${TIER[a.id]}</span><div><b>${pct(a.wr)}</b><span>kazanma</span></div><div><b>${pct(a.pr)}</b><span>seçilme</span></div><div><b>${a.games>=1e6?dec(a.games/1e6)+" mn":n0(a.games/1e3)+" bin"}</b><span>maç</span></div></div>` : `<div class="ph-kpi"><span class="muted small">Oran verisi yok</span></div>`;
  v.innerHTML=`<a href="#ajanlar" class="back">‹ Ajanlar</a>
  <div class="prof-head">${por(a,"lg")}
    <div class="ph-id"><h1>${esc(a.n)}</h1><div class="row">${roleChip(a.r)}</div></div>
    ${kpis}
    <div class="ph-cta"><button class="btn gold" type="button" id="pf-duel">${ic("duel")}Düelloda dene</button></div>
  </div>
  ${lc?`<button type="button" class="chstrip" data-v="${lc.ch.v}" data-chg="ag:${a.id}:${NOTES.indexOf(lc.n)}">${chgBadge(lc.ch.v)}<span>Yama ${esc(lc.n.patch)}: <b>${esc(VMARK[lc.ch.v][1])}</b>${lc.ch.c.length?" — "+esc(lc.ch.c.map(g=>g[0]||"Genel").join(", ")):""}</span><span class="go">Ayrıntı ›</span></button>`:""}
  <div class="ptabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-pt="${k}" aria-selected="${k===pTab}">${l}</button>`).join("")}</div>
  ${body}
  ${a.wr!=null?`<p class="muted small" style="margin:0">Oranlar: ${esc(srcLabel())}.</p>`:""}`;
  $("#pf-duel").onclick=()=>{ const f=D.me; D.me=fighter(a.id,f.w,f.arm,f.aim,[]); D.log=[]; D.prev=null; location.hash="ana"; };
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
      + `<section class="isec"><h2 class="th">Kalkanlar<small>${ARMOR.length-1}</small></h2><div class="wcards">${ARMOR.filter(a=>a.cap).map(a=>`<div class="gcard">${mk(a.img)}<div><b>${esc(a.n)}</b> ${cr(a.cost)}<p>${esc(a.d||"")}</p></div></div>`).join("")}</div>
        <p class="muted small">Düelloda Yenilenen Kalkan 25 puan ve %100 emilim kabul edilir; tek çatışma içinde yenilenmez.</p></section>`;
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
    ${lc?`<div class="chbox">${vPill(lc.ch.v)} <span class="muted small">Yama ${esc(lc.n.patch)}</span>${changeBody(lc.ch)}</div>`:""}
    <div class="row"><button class="btn gold" type="button" data-usew="${id}">${ic("duel")}Düelloda kullan</button></div></div>`;
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
  const u=e.target.closest("[data-usew]"); if(u){ ov.hidden=true; D.me.w=u.dataset.usew; D.log=[]; D.prev=null; const here=(location.hash||"#ana")==="#ana"; location.hash="ana"; if(here) route(); }
});

/* ===================================================================
 *  YÖNLENDİRME VE GEZİNME
 * =================================================================== */
const NAV=[["ana","Düello","duel"],["ajanlar","Ajanlar","users"],["silahlar","Cephanelik","gun"],["yama","Yama","scroll"]];
$("#nav-top").innerHTML=NAV.map(([h,l,i])=>`<a href="#${h}">${ic(i)}${l}</a>`).join("");
$("#nav-bot").innerHTML=NAV.map(([h,l,i])=>`<a href="#${h}">${ic(i)}<span>${l}</span></a>`).join("");
const TITLES={ana:"Rift Kontra · VALORANT düello hesaplayıcı",ajanlar:"Ajanlar · Rift Kontra VALORANT",silahlar:"Cephanelik · Rift Kontra VALORANT",yama:"Yama notları · Rift Kontra VALORANT"};
function route(){
  ov.hidden=true;
  let h=(location.hash||"#ana").slice(1), v="ana";
  if(h==="haritalar"){ wTab="harita"; v="silahlar"; }
  else if(h==="silahlar"){ wTab="silah"; v="silahlar"; }
  else if(["ana","ajanlar","yama"].includes(h)) v=h;
  if(h.startsWith("a-")){ v="profil"; renderProfile(h.slice(2)); } else document.title=TITLES[v];
  if(v==="ana") renderDuel();
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
else { dLoad(); renderGrid(); renderPatch(); renderPatchStrip(); route(); }
