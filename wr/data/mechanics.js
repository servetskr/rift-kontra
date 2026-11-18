/* Düello simülasyonu için elle derlenmiş mekanikler: şampiyon pasifleri, yeteneklerin özel etkileri,
 * item pasifleri/aktifleri ve ana rünler. Güncelleyici bu dosyaya dokunmaz.
 * Kaynak: LoL Wiki "WR:<Şampiyon>" sayfaları, Module:WRItemData/data ve WR rün sayfaları (CC BY-SA 4.0).
 * Sayılar Wild Rift değerleridir. "tahmin" notu olanlar wiki'de sayı olmadığı için yapılan varsayımlardır.
 *
 * Değer fonksiyonları c alır: c.s kendi değerlerin (ad, bad, adBase, ap, hp, bhp, ar, mr, bar, bmr, crit, lvl),
 * c.o rakibin değerleri, c.me / c.en canlı durum (hp, max, stk(id), has(id)), c.lvl, c.rk(yuva), c.melee, c.L canlı değerler.
 * Etki türleri app.js'deki MECH motorunda açıklanmıştır.
 */
(function(){
"use strict";
/* seviye 1→15 doğrusal */
const lv=(c,a,b)=>a+(b-a)*(c.lvl-1)/14;
/* "a / b / c / d (based on level)": seviyeye eşit dilimlerle */
const st=(c,arr)=>arr[Math.min(arr.length-1,Math.floor((c.lvl-1)*arr.length/15))];
/* yetenek kademesine göre */
const rk=(c,slot,arr)=>arr[Math.max(1,Math.min(arr.length,c.rk(slot)))-1];
const miss=c=>Math.max(0,1-c.en.hp/c.en.max), myMiss=c=>Math.max(0,1-c.me.hp/c.me.max);
const MR=(c,m,r)=>c.melee?m:r;

const champ = {
  aatrox:[
    {on:"aa",cd:c=>lv(c,24,13),t:"P",v:c=>c.en.max*lv(c,4,13)/100,healPct:c=>c.melee?1:.6,name:"Ölüm Getiren Duruş"},
    {k:"vamp",src:"any",v:c=>rk(c,"3",[19,21,23,25])/100*(c.me.has("aatroxR")?rk(c,"3",[24,31,38,45])/rk(c,"3",[19,21,23,25]):1),name:"Umutsuz Hücum iyileşmesi"},
    {on:"cast:4",buff:{id:"aatroxR",st:{adPct:c=>rk(c,"4",[30,40,50]),healAmp:c=>rk(c,"4",[25,35,45])},dur:10},name:"Dünya Sonu"},
  ],
  ahri:[{on:"abhit",every:3,heal:c=>st(c,[40,60,80,100])+.2*c.s.ap,name:"Öz Hırsızlığı"}],
  akali:[{on:"aa",after:"cast",cd:4,t:"M",v:c=>lv(c,37,205)+.6*c.s.bad+.65*c.s.ap,name:"Suikastçının İşareti (tahmin: 4 sn'de bir)"}],
  akshan:[
    {k:"aamul",v:()=>1.5,name:"Kirli Dövüş ikinci atış"},
    {on:"hit",every:3,t:"M",v:c=>lv(c,25,180),name:"Kirli Dövüş üçüncü vuruş"},
  ],
  alistar:[{on:"low",th:.7,cd:40,heal:c=>lv(c,27,160),name:"Zafer Böğürtüsü"}],
  ambessa:[{on:"aa",after:"cast",t:"P",v:c=>lv(c,5,40)+.25*c.s.bad,buff:{st:{as:50},dur:.5},name:"Medarda Düsturu"}],
  amumu:[{k:"vuln",t:"M",v:.10,asTrue:true,name:"Lanetli Dokunuş"}],
  annie:[{on:"cast",every:4,cc:c=>["hard",st(c,[1,1.25,1.5])],name:"Piromani sersemletmesi"}],
  ashe:[{k:"stat",f:s=>{s.ashe=true;},name:"Buz Atışı"},
    {on:"aa",t:"P",v:c=>c.L.ad*(.1+c.L.crit*(.75+(c.s.critMul>1.75?.3:0))),name:"Buz Atışı ek hasarı"}],
  aurora:[{on:"hit",every:3,t:"M",v:c=>c.en.max*(2.5+2*c.s.ap/100)/100,buff:{id:"auroraSp",st:{regen:c=>lv(c,1,18)+.02*c.s.ap},dur:4,stack:4},name:"Ruh Kovma"}],
  brand:[{on:"abhit",dot:{t:"M",v:c=>.03*c.en.max,dur:4},name:"Alaz"}],
  braum:[{on:"aa",every:4,cd:8,t:"M",v:c=>lv(c,45,255),cc:c=>["hard",lv(c,1.25,1.75)],name:"Sarsıcı Darbeler (tahmin: 8 sn)"}],
  caitlyn:[{on:"aa",every:6,t:"P",v:c=>c.L.ad*(lv(c,50,100)/100+c.L.crit*(1.25+(c.s.critMul>1.75?.375:0))),name:"Kafadan Vuruş"}],
  camille:[{on:"aa",cd:c=>st(c,[18,16,14,12]),sh:c=>.2*c.s.hp,dur:2,name:"Uyarlanır Savunma"}],
  corki:[{on:"aa",t:"T",v:c=>.16*c.L.ad,crit:true,name:"Hextech Mühimmat"}],
  darius:[
    {k:"bleed",id:"hemo",on:"hit",t:"P",v:c=>lv(c,18,46)+.4*c.s.bad,max:5,dur:5,name:"Kanama"},
    {on:"bleed5",cd:5,buff:{id:"noxMight",st:{ad:c=>lv(c,32,236)},dur:5},name:"Noxus Kudreti"},
    {on:"cast:1",heal:c=>.15*(c.me.max-c.me.hp),name:"Kırım iyileşmesi"},
  ],
  diana:[
    {on:"cast",buff:{st:{as:c=>lv(c,30,100)},dur:4},name:"Ay Gümüşü Kılıç hızı"},
    {on:"aa",every:3,t:"M",v:c=>lv(c,35,245)+.5*c.s.ap,name:"Ay Gümüşü Kılıç yarması"},
  ],
  "dr-mundo":[{k:"regen",v:c=>c.me.max*lv(c,.2,.4)/100,name:"Canlanma"}],
  ekko:[{on:"hit",every:3,cd:5,t:"M",v:c=>lv(c,30,142)+.9*c.s.ap,name:"Z-Sürücü Rezonansı (tahmin: 5 sn)"}],
  ezreal:[{k:"ramp",id:"ezAS",on:"abhit",max:4,dur:6,st:{as:13},name:"Artan Büyü Gücü"}],
  fiora:[
    {on:"hit",charge:"vital",cd:c=>[2,1.75,1.5,1.25][c.rk("4")]+1,t:"T",v:c=>c.en.max*(3.5+5*c.s.bad/100)/100,heal:c=>lv(c,45,115),name:"Hayati Nokta (tahmin: konumlanma +1 sn)"},
    {on:"cast:4",charges:{id:"vital",n:4},name:"Büyük Meydan Okuma"},
    {on:"cast:4",heal:c=>rk(c,"4",[400,550,700])+3*c.s.bad,hot:5,delay:2,name:"Zafer Alanı"},
    {on:"aa",after:"cast:3",t:"P",v:c=>c.L.ad*(rk(c,"3",[170,180,190,200])/100-1),name:"Kılıç Ustalığı kritiği"},
    {on:"cast:3",buff:{st:{as:60},dur:1.5}},
  ],
  fizz:[{on:"aa",dot:{t:"M",v:c=>lv(c,24,80)+.45*c.s.ap,dur:3},name:"Deniz Taşı Mızrağı"}],
  galio:[{on:"aa",cd:5,t:"M",v:c=>lv(c,15,155)+c.L.ad+.45*c.s.ap+.6*c.s.bmr,name:"Devasa Darbe"}],
  garen:[
    {k:"stat",f:s=>{s.ar+=s.bar*.1; s.mr+=s.bmr*.1;},name:"Cesaret +%10 zırh/BD"},
    {on:"cast:2",buff:{st:{dr:30},dur:4},name:"Cesaret hasar azaltma"},
  ],
  gragas:[{on:"cast",cd:c=>st(c,[8,7,6,5]),heal:c=>.085*c.s.hp,name:"Mutlu Saat"}],
  gwen:[{on:"aa",t:"M",v:c=>c.en.max*(1+.5*c.s.ap/100)/100,healPct:.7,healCap:c=>lv(c,12,30)+.07*c.s.ap,name:"Bin Kesik"}],
  irelia:[
    {k:"ramp",id:"fervor",on:"abhit",max:4,dur:6,refresh:"aa",st:{as:c=>lv(c,3,17)},name:"İon Coşkusu"},
    {on:"aa",need:c=>c.me.stk("fervor")>=4,t:"M",v:c=>lv(c,25,150)+.3*c.s.bad,name:"İon Coşkusu hasarı"},
  ],
  "jarvan-iv":[{on:"aa",cd:6,t:"P",v:c=>.08*c.en.hp,name:"Savaş Ritmi (tahmin: 6 sn)"}],
  jax:[
    {k:"ramp",id:"jaxAS",on:"aa",max:5,dur:3,st:{as:c=>lv(c,6,20)},name:"Amansız Saldırı"},
    {on:"aa",every:3,t:"M",v:c=>rk(c,"4",[75,130,185])+.7*c.s.ap,name:"Silahların Ustası"},
    {k:"dodge",slot:"3",dur:2,aaOnly:true,dr:25,react:false,name:"Karşı Saldırı"},
    {on:"cast:4",buff:{st:{ar:c=>rk(c,"4",[30,50,70])+.5*c.s.bad,mr:c=>.6*(rk(c,"4",[30,50,70])+.5*c.s.bad)},dur:8},name:"Silahların Ustası savunma"},
  ],
  jhin:[{on:"aa",every:4,t:"P",v:c=>c.L.ad*(c.s.critMul-1)*(1-c.L.crit)+(c.en.max-c.en.hp)*lv(c,11,25)/100,name:"Fısıltı dördüncü mermi"}],
  kaisa:[
    {on:"aa",t:"M",v:c=>lv(c,5,12)+.15*c.s.ap,name:"Yakıcı Yaralar"},
    {on:"aa",every:5,t:"M",v:c=>(c.en.max-c.en.hp)*(15+2.5*c.s.ap/100)/100,name:"Yakıcı Yaralar patlaması"},
  ],
  kassadin:[{on:"cast",cd:c=>st(c,[9,8,7,6]),sh:c=>lv(c,50,190)+.3*c.s.ap,dur:1.5,name:"Boşluk Taşı"}],
  katarina:[{on:"cast:1",t:"M",v:c=>lv(c,55,265)+c.s.bad+c.s.ap*lv(c,34.5,97.5)/100,delay:1,name:"Hançer (Q)"},
    {on:"cast:2",t:"M",v:c=>lv(c,55,265)+c.s.bad+c.s.ap*lv(c,34.5,97.5)/100,delay:1.25,name:"Hançer (W)"}],
  kayle:[
    {k:"ramp",id:"zeal",on:"aa",max:5,dur:5,st:{as:c=>st(c,[4,5,6,7])+c.s.ap/100},name:"Gayret"},
    {on:"aa",t:"M",v:c=>(c.en.max-c.en.hp)*(rk(c,"3",[7,8,9,10])+2*c.s.ap/100)/100*(c.lvl>=9&&c.me.stk("zeal")>=5?2:1),name:"Yıldız Ateşi"},
    {k:"invuln",slot:"4",dur:2.5,use:"low:.3",name:"İlahi Yargı"},
  ],
  kennen:[{on:"abhit",every:3,cc:()=>["hard",1.25],name:"Fırtına İşareti"}],
  khazix:[{on:"aa",first:true,t:"M",v:c=>lv(c,23,135)+.5*c.s.bad,name:"Görünmez Tehdit"}],
  kogmaw:[{k:"zombie",dur:4,t:"T",v:c=>lv(c,140,710),name:"İkat Sürprizi"}],
  ksante:[{on:"aa",after:"cast",t:"P",v:c=>12+c.en.max*lv(c,1,2.12)/100,name:"Yılmaz İçgüdü"}],
  "lee-sin":[{on:"cast",buff:{st:{as:40},dur:3,hits:2},name:"Seri Darbe"}],
  lillia:[{on:"abhit",dot:{t:"M",v:c=>c.en.max*(6+1.25*c.s.ap/100)/100,dur:3},heal:c=>lv(c,10,108)+.15*c.s.ap,hot:3,cd:3,name:"Rüya Tozu"}],
  lucian:[{on:"aa",after:"cast",t:"P",v:c=>c.L.ad*st(c,[35,50,65])/100,crit:true,name:"Işık Tabancası ikinci atış"}],
  lulu:[{on:"aa",t:"M",v:c=>lv(c,12,96)+.15*c.s.ap,name:"Pix"}],
  lux:[{on:"cast",skip:1,t:"M",v:c=>lv(c,25.5,130.5)+.25*c.s.ap,name:"Aydınlatma"}],
  maokai:[{on:"aa",cd:c=>lv(c,24,17)-3,need:c=>c.me.hp<.95*c.me.max,heal:c=>c.s.hp*lv(c,4,10)/100,name:"Özsu Büyüsü"}],
  "master-yi":[
    {on:"aa",every:4,t:"P",v:c=>.5*c.L.ad,crit:true,onhitAgain:true,name:"Çifte Vuruş"},
    {k:"stat",f:s=>{s.ad+=s.ad*.08; s.bad+=s.ad*.08/1.08;},name:"Wuju Tarzı +%8 SG"},
    {on:"aa",need:c=>c.me.has("wuju"),t:"T",v:c=>rk(c,"3",[30,35,40,45])+.25*c.s.bad,name:"Wuju Tarzı gerçek hasar"},
    {on:"cast:3",buff:{id:"wuju",st:{},dur:5}},
    {k:"dodge",slot:"1",dur:1,lock:1,react:true,name:"Alfa Darbesi"},
    {on:"cast:2",lock:4,buff:{st:{dr:c=>rk(c,"2",[55,60,65,70])},dur:4},heal:c=>(rk(c,"2",[160,240,320,400])+c.s.ap)*(1+myMiss(c)),hot:4,use:"low:.35",name:"Meditasyon"},
    {on:"cast:4",buff:{st:{as:c=>rk(c,"4",[30,60,90])},dur:7},name:"Yüce Savaşçı"},
  ],
  "miss-fortune":[{on:"hit",every:3,cd:1,t:"P",v:c=>(15+.4*c.s.bad)*(1+c.L.crit),name:"Sevgi Dokunuşu"}],
  mordekaiser:[
    {k:"stat",f:(s,c)=>{s.mpen=Math.min(60,s.mpen+st(c,[3,6,9,12]));},name:"Karanlığın Yükselişi büyü delme"},
    {on:"aa",t:"M",v:c=>.3*c.s.ap,name:"Karanlığın Yükselişi isabet"},
    {k:"ramp",id:"darkRise",on:"hit",max:3,dur:5,name:"Karanlığın Yükselişi"},
    {k:"aura",need:c=>c.me.stk("darkRise")>=3,t:"M",v:c=>lv(c,5,8.5)+.25*c.s.ap+c.en.max*st(c,[2,3,4,5])/100,name:"Karanlığın Yükselişi alanı"},
    {on:"cast:2",sh:c=>Math.min(.3*c.s.hp,Math.max(.05*c.s.hp,.35*c.me.dealt+.07*c.me.takenPre)),dur:4,name:"Yok Edilemez"},
  ],
  morgana:[{k:"vamp",src:"ab",v:()=>.2,name:"Ruh Emme"}],
  nasus:[
    {k:"vamp",src:"P",v:c=>st(c,[6,12,18,24])/100,name:"Ruh Yiyen"},
    {on:"cast:4",buff:{st:{hpB:c=>rk(c,"4",[300,450,600]),ar:c=>rk(c,"4",[40,50,60]),mr:c=>rk(c,"4",[40,50,60])},dur:15},name:"Kumların Gazabı"},
    {on:"cast:4",dot:{t:"M",v:c=>Math.min(240*15,c.en.max*15*rk(c,"4",[3,4,5])/100*(1+c.s.ap/1000)),dur:15},name:"Kumların Gazabı alanı"},
  ],
  nautilus:[{on:"aa",cd:8,t:"P",v:c=>lv(c,13,125),name:"Sersemletici Darbe (tahmin: 8 sn)"}],
  nilah:[{k:"vamp",src:"crit",v:()=>.2,over:"shield",name:"Sonsuz Neşe"}],
  nocturne:[{on:"aa",cd:6,t:"P",v:c=>.2*c.L.ad,crit:true,heal:c=>lv(c,16,30)+.3*c.s.ap,name:"Gölge Kılıçlar (her vuruş −3 sn)"}],
  olaf:[
    {k:"dyn",f:(L,c)=>{const m=Math.min(1,myMiss(c)/.7); L.as+=m*lv(c,70,110); L.pv+=m*lv(c,15,30)/100;},name:"Çılgın Öfke"},
    {k:"stat",f:(s,c)=>{const r=[0,25,35,45][c.rk("4")]||0; s.ar+=r; s.mr+=r;},name:"Ragnarok direnci"},
    {on:"cast:4",buff:{id:"ccimm",st:{ad:c=>rk(c,"4",[5,15,25])+.2*c.s.ad},dur:4},name:"Ragnarok"},
  ],
  orianna:[{on:"aa",t:"M",v:c=>lv(c,13,55)+.15*c.s.ap,name:"Kurmalı Saat"}],
  ornn:[{k:"stat",f:(s,c)=>{const p=st(c,[7,12,17,22])/100; s.hp+=s.bhp*p; s.bhp*=1+p; s.ar+=s.bar*p; s.mr+=s.bmr*p;},name:"Yaşayan Ocak"}],
  poppy:[{on:"aa",cd:c=>st(c,[12,9,6]),t:"M",v:c=>lv(c,20,180),sh:c=>c.s.hp*st(c,[13,15.5,18])/100,dur:3,shDelay:1.5,name:"Demir Elçi"}],
  pyke:[{k:"stat",f:s=>{s.ad+=s.bhp/14; s.bad+=s.bhp/14; s.hp-=s.bhp; s.bhp=0;},name:"Boğulanların Armağanı"}],
  rakan:[{on:"start",sh:c=>lv(c,31,255)+.8*c.s.ap,dur:99,name:"Peri Tüyleri"}],
  rell:[{on:"aa",t:"M",v:c=>.05*c.s.ar+.05*c.s.mr,name:"Kalıbı Kır"},{k:"shred",st:"ar",per:.03,max:5,dur:5,src:"any",both:true,name:"Kalıbı Kır zayıflatma"}],
  riven:[{k:"ramp",id:"runic",on:"cast",max:3,dur:6,name:"Rünik Kılıç"},
    {on:"aa",need:c=>c.me.stk("runic")>0,consume:"runic",t:"P",v:c=>c.L.ad*lv(c,22,50)/100,crit:true,name:"Rünik Kılıç"}],
  senna:[{on:"aa",t:"P",v:c=>.2*c.L.ad,name:"Kurtuluş"}],
  sett:[
    {on:"aa",every:2,t:"P",v:c=>lv(c,9,135)+.5*c.s.bad,fast:true,name:"Sağ Yumruk"},
    {k:"regen",v:c=>Math.floor(myMiss(c)*20)*st(c,[.25,.5,1,2]),name:"Dövüş Azmi"},
    {k:"grit",cap:.5,name:"Azim"},
  ],
  shen:[{on:"cast",cd:10,sh:c=>lv(c,51,100)+.14*c.s.bhp,dur:2.5,name:"Ki Bariyeri"}],
  skarner:[{on:"hit",every:3,dot:{t:"M",v:c=>c.en.max*lv(c,5,10)/100,dur:4},name:"Titreşim"}],
  sona:[{on:"cast",every:3,t:"M",v:c=>lv(c,20,160)+.15*c.s.ap,cc:()=>["hard",.5],name:"Güç Akoru"}],
  talon:[{on:"abhit",every:3,dot:{t:"P",v:c=>lv(c,100,300)+2.1*c.s.bad,dur:2},name:"Bıçağın Ucu"}],
  teemo:[{on:"aa",t:"M",v:c=>lv(c,8,36)+.2*c.s.ap,dot:{t:"M",v:c=>lv(c,44,212)+.36*c.s.ap,dur:4},name:"Zehirli Atış"}],
  tryndamere:[
    {on:"aa",buff:{st:{as:c=>[30,45,60,75][c.rk("4")]},dur:5},name:"Savaş Öfkesi hızı"},
    {k:"ramp",id:"fury",on:"aa",per:c=>5+5*c.L.crit,max:100,dur:99,name:"Öfke"},
    {k:"dyn",f:(L,c)=>{L.crit+=c.me.stk("fury")*lv(c,.32,.5)/100; L.ad+=rk(c,"1",[7,12,17,22])+rk(c,"1",[.35,.4,.45,.5])*myMiss(c)*100;},name:"Öfke kritik / Kana Susamışlık SG"},
    {on:"cast:1",use:"low:.25",heal:c=>Math.min(rk(c,"1",[205,275,345,415])+1.5*c.s.ap,rk(c,"1",[55,65,75,85])+.3*c.s.ap+c.me.stk("fury")*(rk(c,"1",[1.5,2.1,2.7,3.3])+.012*c.s.ap)),consume:"fury",name:"Kana Susamışlık"},
    {k:"undying",slot:"4",dur:5,min:c=>rk(c,"4",[50,75,100]),fury:c=>rk(c,"4",[50,75,100]),name:"Ölümsüz Öfke"},
  ],
  twitch:[{k:"bleed",id:"venom",on:"aa",t:"T",v:c=>st(c,[5,10,15,20,25])+.125*c.s.ap,max:5,dur:5,name:"Ölümcül Zehir"}],
  urgot:[{on:"aa",cd:c=>st(c,[15,8,4,2]),t:"P",v:c=>c.L.ad*st(c,[60,75,90,105])/100+c.en.max*lv(c,3,6)/100,name:"Yankılanan Alevler"}],
  vayne:[
    {on:"aa",every:3,t:"T",v:c=>Math.max(rk(c,"2",[50,65,80,95]),c.en.max*rk(c,"2",[2,5,8,11])/100),name:"Gümüş Oklar"},
    {on:"cast:2",buff:{st:{as:c=>rk(c,"2",[10,15,20,25]),ov:10},dur:5},name:"Gümüş Oklar aktif"},
    {on:"cast:4",buff:{st:{ad:c=>rk(c,"4",[15,25,35])},dur:c=>rk(c,"4",[8,10,12])},name:"Son Saat"},
  ],
  velkoz:[{on:"abhit",every:3,t:"T",v:c=>lv(c,35,180)+.6*c.s.ap,name:"Organik Ayrıştırma"}],
  vi:[{on:"aa",every:3,t:"P",v:c=>c.en.max*(lv(c,4.8,9)+3*c.s.bad/100)/100,shred:{st:"ar",v:.2,dur:4},buff:{st:{as:c=>lv(c,27,55)},dur:4},name:"Ezici Darbeler"}],
  vladimir:[
    {k:"stat",f:s=>{const ap=s.bhp*.05, hp=s.ap*1.5; if(ap*1.5>hp){s.ap+=ap;}else{s.hp+=hp;s.bhp+=hp;}},name:"Kızıl Ahit"},
    {on:"cast:1",heal:c=>rk(c,"1",[15,20,25,30])+.35*c.s.ap,name:"Kan Nakli"},
    {k:"dodge",slot:"2",dur:2,lock:2,react:true,name:"Kan Havuzu"},
  ],
  volibear:[
    {k:"ramp",id:"storm",on:"hit",max:5,dur:6,st:{as:c=>5+4*c.s.ap/100},name:"Bitmeyen Fırtına"},
    {on:"aa",need:c=>c.me.stk("storm")>=5,t:"M",v:c=>lv(c,11,80)+.4*c.s.ap,name:"Şimşek Pençeler"},
  ],
  warwick:[
    {on:"aa",t:"M",v:c=>lv(c,12,46)+.2*c.s.bad+.1*c.s.ap,healPct:c=>c.me.hp<.5*c.me.max?1:0,name:"Ebedi Açlık"},
    {on:"cast:1",healOfLast:c=>rk(c,"1",[42.5,55,67.5,80])/100,name:"Canavar Isırığı iyileşmesi"},
  ],
  wukong:[{k:"ramp",id:"stone",on:"hit",max:3,dur:5,st:{ar:c=>lv(c,10,18),regen:c=>c.s.hp*.0175/5},name:"Taş Deri"}],
  "xin-zhao":[{on:"aa",every:3,t:"P",v:c=>c.L.ad*lv(c,22,50)/100,heal:c=>lv(c,7,60)+.1*c.L.ad+.4*c.s.ap,name:"Kararlılık"}],
  yasuo:[
    {k:"stat",f:s=>{s.crit*=2; if(s.crit>1){s.ad+=(s.crit-1)*60; s.crit=1;}},name:"Kararlılık: kritik ×2"},
    {k:"flow",sh:c=>lv(c,115,500)+100*c.s.crit,dur:1,rearm:"cast:4",name:"Akış kalkanı"},
  ],
  yone:[{k:"stat",f:s=>{s.crit*=2; if(s.crit>1){s.ad+=(s.crit-1)*60; s.crit=1;}},name:"Avcının Yolu: kritik ×2"}],
  zed:[
    {on:"aa",cd:10,need:c=>c.en.hp<.5*c.en.max,t:"M",v:c=>c.en.max*st(c,[7,8,9,10,11])/100,name:"Zayıfa Küçümseme (tahmin: 10 sn)"},
    {k:"dodge",slot:"4",dur:.95,react:false,name:"Ölüm İşareti"},
  ],
  zoe:[{on:"aa",after:"cast",t:"M",v:c=>lv(c,9,128)+.2*c.s.ap,name:"Daha Çok Pırıltı!"}],
};
champ.fizz.push({k:"dodge",slot:"3",dur:.75,react:true,name:"Oyuncu"});
champ.xayah=[{k:"dodge",slot:"4",dur:1.5,react:true,name:"Tüy Fırtınası"}];
champ.evelynn=[{k:"dodge",slot:"4",dur:.5,react:false,name:"Son Okşayış"}];
champ.camille.push({k:"dodge",slot:"4",dur:.75,react:false,name:"Hextech Ültimatomu"});
champ.mel=[{k:"invuln",slot:"2",dur:.75,react:true,name:"Çürütme"}];
champ.ekko=champ.ekko.concat([{on:"cast:4",use:"low:.3",heal:c=>rk(c,"4",[150,200,250])+.5*c.s.ap,name:"Kronokırılma"}]);
champ.zilean=[{k:"revive",slot:"4",dur:3,hp:c=>rk(c,"4",[600,850,1100])+2*c.s.ap,name:"Zaman Kayması"}];
champ.fiora.push({k:"invuln",slot:"2",dur:.75,lock:.75,react:true,ccBack:true,name:"Karşılık"});
champ.lissandra=[{on:"cast:4",use:"low:.3",heal:c=>rk(c,"4",[100,150,200])+.4*c.s.ap,inv:2.5,lock:2.5,name:"Donmuş Mezar"}];
champ.kayn=[{on:"cast:3",heal:c=>rk(c,"3",[100,120,140,160])+.5*c.s.bad,name:"Gölge Geçidi"}];
champ.khazix.push({on:"cast:2",heal:c=>rk(c,"2",[40,75,110,145])+.5*c.s.ap,name:"Boşluk Dikeni"});
champ.irelia.push({on:"cast:1",heal:c=>c.L.ad*rk(c,"1",[11,14,17,20])/100,name:"Kılıç Hücumu"});
champ.sivir=[{on:"cast:3",heal:c=>c.L.ad*rk(c,"3",[65,70,75,80])/100+.5*c.s.ap,name:"Büyü Kalkanı"}];
champ.smolder=[{on:"cast:4",heal:c=>rk(c,"4",[100,135,170])+.5*c.s.bad+.75*c.s.ap,name:"Annee!"}];
champ.volibear.push({on:"cast:2",heal:c=>rk(c,"2",[20,30,40,50])+(c.me.max-c.me.hp)*rk(c,"2",[5,6,7,8])/100,name:"Hırçın Yırtış"});
champ.renekton=[{on:"cast:1",heal:c=>Math.min(rk(c,"1",[50,85,120,155])+.25*c.s.bad,rk(c,"1",[16,24,32,40])+.2*c.s.bad),name:"Zayıfı Biç"}];
champ.vladimir.push({on:"cast:4",heal:c=>rk(c,"4",[150,250,350])+.7*c.s.ap,delay:4,name:"Kan Vebası"});
champ.hecarim=[{on:"cast:2",heal:c=>Math.min(rk(c,"2",[90,130,170,210]),rk(c,"2",[40,80,120,160])+.4*c.s.bhp),hot:4,name:"Dehşet Yayan"}];
champ.senna.push({on:"cast:1",heal:c=>rk(c,"1",[40,70,100,130])+.4*c.s.bad+.25*c.s.ap,name:"Karanlığın Gölgesi"});
champ["lee-sin"].push({on:"cast:2",buff:{st:{ov:c=>rk(c,"2",[16,24,32,40])},dur:4},name:"Güvenlik (tam can çalma, tahmin 4 sn)"});
champ.malphite=[{on:"cast:2",buff:{st:{arPct:c=>rk(c,"2",[25,30,35,40])},dur:6},name:"Gök Gürültüsü zırhı (tahmin 6 sn)"}];

/* Ayrıştırıcının yanlış okuduğu yetenekler için düzeltmeler (yuva alanlarının üzerine yazılır).
   dv: dinamik hasar fonksiyonu, t: tür, use: kullanım zamanı ("exec" infaz, "low:x" can oranı altında, "react" tepki, "never") */
const fix = {
  vayne:{"2":{d:[]}},
  fiora:{"3":{d:[]}},
  mordekaiser:{"2":{sh:null}},
  "master-yi":{"3":{d:[]}},
  garen:{"3":{dv:c=>{const n=Math.round(3/st(c,[.375,.341,.307,.273])); return n*(rk(c,"3",[13,17,21,25])+c.L.ad*rk(c,"3",[25,30,35,40])/100)*1.2;},t:"P",over:3,lockAA:3},
         "4":{dv:c=>rk(c,"4",[150,250,350])+(c.en.max-c.en.hp)*(15+12*c.s.bad/100)/100,t:"T",use:"exec"}},
  darius:{"4":{dv:c=>(rk(c,"4",[125,250,375])+.75*c.s.bad)*(1+c.en.stk("hemo")/5),t:"T",use:"exec"}},
  jax:{"4":{dv:c=>rk(c,"4",[100,200,300])+c.s.ap,t:"M"}},
  nasus:{"1":{dv:c=>rk(c,"1",[20,50,80,110])+20*(c.lvl-1),t:"P",note:"Nasus Q yükü tahmini: seviye başına 20"},"4":{d:[]}},
  warwick:{"1":{dv:c=>1.3*c.L.ad+.9*c.s.ap+c.en.max*rk(c,"1",[6,7,8,9])/100,t:"M"}},
  sett:{"2":{dv:c=>rk(c,"2",[80,105,130,155])+c.me.grit*(25+27.5*c.s.bad/100)/100,t:"T",use:"grit"}},
  tryndamere:{"1":{keep:true},"4":{keep:true}},
  pyke:{"4":{use:"exec"}},
  urgot:{"4":{use:"exec"}},
  chogath:{"4":{use:"exec"}},
  kayle:{"4":{keep:true}},
  olaf:{"4":{keep:true}},
  vladimir:{"2":{keep:true}},
  camille:{"i":null},
};

/* Itemlar: anahtarlar wr.js'deki item kısa adları */
const item = {
  "infinity-edge":[{k:"stat",f:s=>{s.critMul+=.3;},name:"+%30 kritik hasarı"}],
  "steraks-gage":[
    {k:"stat",f:s=>{s.ad+=s.adBase*.5; s.bad+=s.adBase*.5;},name:"Ağır El: +%50 taban SG"},
    {k:"lifeline",th:.35,sh:c=>.75*c.s.bhp,dur:5,decay:true,cd:70,name:"Can Simidi kalkanı"}],
  "immortal-shieldbow":[{k:"lifeline",th:.35,sh:c=>c.melee?lv(c,350,650):lv(c,300,550),dur:3,cd:70,name:"Can Simidi kalkanı"}],
  "maw-of-malmortius":[{k:"lifeline",th:.35,only:"M",sh:c=>lv(c,220,530),dur:3,cd:70,buff:{st:{ov:10},dur:99},name:"Büyü kalkanı + %10 tam can çalma"}],
  "mantle-of-the-twelfth-hour":[{k:"lifeline",th:.3,heal:c=>lv(c,200,400)+1.2*c.s.bar+1.2*c.s.bmr+.15*c.s.hp,hot:5,buff:{st:{ten:20},dur:5},cd:70,name:"Can Simidi iyileşmesi"}],
  "deaths-dance":[{k:"delay",v:c=>c.melee?.3:.12,dur:3,name:"Dağlama (hasar erteleme)"}],
  "guardian-angel":[{k:"revive",dur:4,hp:c=>.5*(c.s.hp-c.s.bhp),cd:180,name:"Diriliş"}],
  "zhonyas-hourglass":[{k:"stasis",th:.3,dur:2.5,cd:90,name:"Durağanlık (aktif)"}],
  "black-cleaver":[{k:"shred",st:"ar",per:.06,max:5,dur:6,t:"P",name:"Yarma (zırh azaltma)"}],
  "bloodletters-curse":[{k:"shred",st:"mr",per:.075,max:4,dur:6,t:"M",src:"ab",name:"Çürüme (BD azaltma)"}],
  "sunfire-aegis":[{k:"aura",t:"M",v:c=>.015*c.s.bhp,name:"Yakıcı alan"}],
  "hollow-radiance":[{k:"aura",t:"M",v:c=>lv(c,20,30)+.01*c.s.bhp,name:"Yakıcı alan"}],
  "bamis-cinder":[{k:"aura",t:"M",v:c=>lv(c,10,20),name:"Yakıcı alan"}],
  "unending-despair":[{on:"tick",cd:4,t:"M",v:c=>.03*c.s.bhp,healOfThis:2.5,name:"Iztırap"}],
  "thornmail":[{k:"reflect",t:"M",v:c=>20+.06*c.s.bar+.01*c.s.bhp,name:"Dikenler"},{k:"gw",v:.5,t:"any",taken:true,name:"Ağır Yara %50"}],
  "bramble-vest":[{k:"reflect",t:"M",v:c=>4+.06*c.s.bar,name:"Dikenler"},{k:"gw",v:.4,t:"none",taken:true,name:"Ağır Yara %40"}],
  "mortal-reminder":[{k:"gw",v:.5,t:"P",name:"Ağır Yara %50"}],
  "chempunk-chainsword":[{k:"gw",v:.5,t:"P",name:"Ağır Yara %50"}],
  "executioners-calling":[{k:"gw",v:.4,t:"P",name:"Ağır Yara %40"}],
  "morellonomicon":[{k:"gw",v:.5,t:"M",name:"Ağır Yara %50"}],
  "oblivion-orb":[{k:"gw",v:.4,t:"M",name:"Ağır Yara %40"}],
  "liandrys-torment":[{on:"abhit",dot:{t:"M",v:c=>.02*c.en.max,dur:3},name:"Azap yanığı"},{k:"amp",v:c=>Math.min(6,2*Math.floor(c.t))/100,name:"Delilik"}],
  "rabadons-deathcap":[{k:"stat",f:s=>{s.ap*=1.3;},name:"+%30 YG"}],
  "nashors-tooth":[{on:"aa",t:"M",v:c=>15+.2*c.s.ap,name:"Kemirme"}],
  "blade-of-the-ruined-king":[{on:"aa",t:"P",v:c=>Math.max(15,c.en.hp*(c.melee?.08:.06)),name:"Mahvolmuş Darbeler"}],
  "trinity-force":[{on:"aa",after:"cast",cd:1.5,grp:"spellblade",t:"P",v:c=>2*c.s.adBase,name:"Büyülü Kılıç"}],
  "lich-bane":[{on:"aa",after:"cast",cd:1.5,grp:"spellblade",t:"M",v:c=>.75*c.s.adBase+.5*c.s.ap,name:"Büyülü Kılıç"}],
  "divine-sunderer":[{on:"aa",after:"cast",cd:1.5,grp:"spellblade",t:"P",v:c=>Math.max(1.25*c.s.adBase,c.en.max*(c.melee?.1:.07)),heal:c=>Math.max(c.s.adBase*(c.melee?.9:.5),c.en.max*(c.melee?.06:.025)),name:"Büyülü Kılıç"}],
  "iceborn-gauntlet":[{on:"aa",after:"cast",cd:1.5,grp:"spellblade",t:"P",v:c=>c.s.adBase+.25*c.s.bar,name:"Büyülü Kılıç"}],
  "essence-reaver":[{on:"aa",after:"cast",cd:1.5,grp:"spellblade",t:"P",v:c=>1.35*c.s.adBase+80*c.L.crit,name:"Büyülü Kılıç"}],
  "dusk-and-dawn":[{on:"aa",after:"cast",cd:1.5,grp:"spellblade",t:"M",v:c=>.75*c.s.adBase+.1*c.s.ap,heal:c=>.1*c.s.ap+.03*c.s.bhp,onhitAgain:true,name:"Büyülü Kılıç"}],
  "kraken-slayer":[{on:"aa",every:3,t:"P",v:c=>(c.melee?lv(c,150,210):lv(c,120,168))*(1+Math.min(.7,.75*miss(c))),name:"Yere Ser"}],
  "wits-end":[{on:"aa",t:"M",v:()=>40,name:"Akıl Sınırı"}],
  "guinsoos-rageblade":[{on:"aa",t:"M",v:()=>30,name:"Gazap"},{k:"ramp",id:"guinsoo",on:"aa",max:4,dur:3,st:{as:8},name:"Kaynayan Darbe"},
    {on:"aa",every:3,need:c=>c.me.stk("guinsoo")>=4,onhitAgain:true,name:"Hayalet Vuruş"}],
  "terminus":[{on:"aa",t:"M",v:()=>30,name:"Gölge"},{k:"ramp",id:"termin",on:"aa",max:6,dur:5,st:{arpen:5,mpen:5,ar:c=>lv(c,5,8)/2,mr:c=>lv(c,5,8)/2},name:"Yan Yana"}],
  "phantom-dancer":[{k:"ramp",id:"pd",on:"aa",max:5,dur:6,st:{as:6},name:"Hayalet Vals"}],
  "yun-tal-wildarrows":[{k:"stat",f:s=>{s.crit=Math.min(1,s.crit+.25);},name:"Pratik: +%25 kritik (tam yük varsayımı)"},{on:"aa",first:true,buff:{st:{as:35},dur:6},name:"Sağanak"}],
  "rapid-firecannon":[{on:"aa",first:true,t:"M",v:()=>80,name:"Keskin Nişancı"}],
  "stormrazor":[{on:"aa",first:true,t:"M",v:()=>120,name:"Şimşek"}],
  "statikk-shiv":[{on:"aa",every:8,t:"M",v:()=>60,firstToo:true,name:"Elektrik Kıvılcımı (tahmin: 8 vuruşta bir)"}],
  "sundered-sky":[{on:"aa",cd:6,t:"P",v:c=>c.L.ad*(1.6*c.s.critMul/1.75-1-c.L.crit*(c.s.critMul-1)),heal:c=>1.25*c.s.adBase+.06*(c.me.max-c.me.hp),name:"Işık Kalkanı Darbesi"}],
  "eclipse":[{on:"hit",every:2,cd:6,t:"P",v:c=>c.en.max*(c.melee?.06:.03),sh:c=>(c.melee?140:70)+(c.melee?.35:.18)*c.s.bad,dur:2,name:"Yükselen Ay"}],
  "duskblade-of-draktharr":[{on:"aa",cd:10,t:"P",v:c=>lv(c,60,160),name:"Gece Avcısı"}],
  "hullbreaker":[{on:"aa",every:5,t:"P",v:c=>(1.6*c.s.adBase+.05*c.s.hp)*(c.melee?1:.4),name:"Kaptan"}],
  "titanic-hydra":[{on:"aa",cd:1.75,t:"P",v:c=>(25+.03*c.s.bhp)*(c.melee?1:.75),name:"Yarma"}],
  "heartsteel":[{on:"aa",cd:20,startCd:2.5,t:"P",v:c=>140+.035*c.s.hp,name:"Devasa Tüketim"}],
  "dead-mans-plate":[{on:"aa",first:true,t:"M",v:()=>40,name:"Ezici Darbe"}],
  "goredrinker":[{k:"stat",f:s=>{s.ov+=8;},name:"+%8 tam can çalma"},{on:"tick",cd:12,startCd:0,t:"P",v:c=>1.75*c.s.adBase,healOfThis:0,heal:c=>.2*c.L.ad+.1*(c.me.max-c.me.hp),name:"Susuz Kesik (aktif)"}],
  "gluttonous-greaves":[{k:"stat",f:s=>{s.ov+=5;},name:"+%5 tam can çalma"}],
  "hellfire-hatchet":[{k:"stat",f:s=>{s.arpen=Math.min(60,s.arpen+15);},name:"+%15 zırh delme"},
    {on:"hit",cd:.5,heal:c=>.015*c.en.hp,dot:{t:"P",v:c=>c.en.max*(1+.4*c.s.bad/100)/100,dur:2},name:"Kömürleşme"}],
  "stridebreaker":[{on:"tick",cd:25,startCd:0,t:"P",v:c=>c.L.ad,name:"Kırıcı Şok Dalgası (aktif)"}],
  "hextech-rocketbelt":[{on:"tick",cd:30,startCd:0,t:"M",v:c=>100+.15*c.s.ap,name:"Roket Kemer (aktif)"}],
  "serpents-fang":[{k:"shieldred",v:c=>c.melee?Math.min(.6,.4+.1*c.s.bad/100):Math.min(.45,.25+.1*c.s.bad/100),name:"Kalkan Parçalayıcı"}],
  "oceanids-trident":[{k:"shieldred",v:c=>Math.min(.6,.4+.05*c.s.ap/100),name:"Ölümcül Silah"}],
  "bloodthirster":[{k:"vamp",src:"ls",over:"shield",cap:c=>lv(c,165,345),v:()=>0,name:"Kan Kalkanı"}],
  "frozen-heart":[{k:"enemy",st:{asMul:.75},name:"Kış Okşaması (−%25 saldırı hızı)"}],
  "randuins-omen":[{k:"dr",src:"crit",v:30,name:"Dayanıklılık (−%30 kritik hasarı)"}],
  "plated-steelcaps":[{k:"dr",src:"aa",v:10,name:"Blok (−%10 saldırı hasarı)"}],
  "force-of-nature":[{k:"ramp",id:"fon",on:"abtaken",max:4,dur:7,st:{mr:17.5},name:"Sebat"}],
  "amaranths-twinguard":[{k:"timed",at:5,buff:{st:{arPct:30,mrPct:30,ten:20},dur:99},name:"Dayanıklılık"}],
  "kaenic-rookern":[{on:"start",sh:c=>lv(c,70,180)+.1*c.s.hp,dur:99,only:"M",name:"Büyü Kıran kalkanı"}],
  "gargoyle-stoneplate":[{on:"low",th:.6,cd:60,sh:c=>100+.09*c.s.bhp,dur:2.5,decay:true,name:"Taş Zırh (aktif)"}],
  "armored-advance":[{on:"taken",only:"P",cd:12,sh:c=>lv(c,20,140)+.05*c.s.hp,dur:5,shOnly:"P",name:"Noxus Dayanıklılığı"}],
  "chainlaced-crushers":[{on:"taken",only:"M",cd:12,sh:c=>lv(c,20,140)+.05*c.s.hp,dur:5,shOnly:"M",name:"Noxus Azmi"}],
  "berserkers-greaves":[{on:"aa",heal:()=>10,name:"Kutsal Kılıç"}],
  "gunmetal-greaves":[{on:"aa",heal:()=>12,name:"Kutsal Kılıç"}],
  "riftmaker":[{k:"stat",f:s=>{s.ap+=.02*s.bhp;},name:"Boşluk Aşılaması"},{k:"amp",v:c=>Math.min(8,2*Math.floor(c.t))/100,name:"Boşluk Yozlaşması"},
    {k:"timed",at:4,buff:{st:{ov:c=>c.melee?10:6},dur:99},name:"Boşluk Yozlaşması can çalma"}],
  "psychic-projector":[{k:"stat",f:s=>{s.ap+=Math.min(400,.035*s.bhp); if(s.bhp>=950){s.ar+=Math.min(80,.2*s.ap); s.mr+=Math.min(40,.1*s.ap);}},name:"Dönüşüm"}],
  "overlords-bloodmail":[{k:"stat",f:s=>{s.ad+=.025*s.bhp; s.bad+=.025*s.bhp;},name:"Zorbalık"},{k:"dyn",f:(L,c)=>{L.ad*=1+.09*Math.min(1,myMiss(c)/.7);},name:"İntikam"}],
  "lord-dominiks-regards":[{k:"amp",v:c=>Math.min(12,c.o.bhp/125)/100,name:"Dev Avcısı"}],
  "perplexity":[{k:"amp",v:c=>Math.min(30,c.o.bhp/100)/100,name:"Dev Avcısı"}],
  "abyssal-mask":[{k:"vuln",t:"M",v:.12,name:"Bozma (+%12 büyü hasarı)"}],
  "infinity-orb":[{k:"amp",src:"ab",v:c=>c.en.hp<.4*c.en.max?.2:0,name:"Kaçınılmaz Son"}],
  "the-collector":[{k:"exec",th:.05,name:"Ölüm ve Vergiler (%5 infaz)"}],
  "spear-of-shojin":[{k:"ramp",id:"shojin",on:"hit",max:4,dur:6,st:{abAmp:3},name:"Odaklanmış İrade"}],
  "navori-quickblades":[{on:"aa",cdr:.15,name:"Ustaca Darbeler"}],
  "experimental-hexplate":[{on:"cast:4",cd:30,buff:{st:{as:40},dur:8},name:"Aşırı Yük"}],
  "fiendhunter-bolts":[{on:"cast:4",cd:45,buff:{id:"fhb",st:{as:50},dur:8,hits:3},name:"Açılış Yaylımı"},
    {on:"aa",need:c=>c.me.has("fhb"),t:"P",v:c=>c.L.ad*Math.max(0,1.8-(1+c.L.crit*(c.s.critMul-1))),name:"Açılış Yaylımı kritiği"}],
  "banshees-veil":[{k:"sshield",cd:30,name:"Büyü kalkanı"}],
  "edge-of-night":[{k:"sshield",cd:99,name:"Büyü kalkanı"}],
  "mercurial-scimitar":[{k:"qss",cd:60,name:"Cıva (arındırma)"}],
  "quicksilver-sash":[{k:"qss",cd:90,name:"Cıva (arındırma)"}],
  "blackfire-torch":[{on:"abhit",dot:{t:"M",v:c=>60+.06*c.s.ap,dur:3},name:"Kötücül Alev"},{k:"stat",f:s=>{s.ap*=1.04;},name:"Kara Ateş"}],
  "malignance":[{on:"cast:4",cd:3,dot:{t:"M",v:c=>180+.15*c.s.ap,dur:3},shred:{st:"mrF",v:10,dur:3},name:"Nefret Sisi"}],
  "ludens-echo":[{on:"abhit",first:true,t:"M",v:c=>80+.09*c.s.ap,name:"Yankı (ilk yetenek)"}],
  "stormsurge":[{k:"burst",pct:.25,win:2.5,cd:25,delay:2,t:"M",v:c=>125+.1*c.s.ap,name:"Fırtına Akıncısı"}],
  "imperial-mandate":[{on:"cc",buff:{id:"mandate",st:{},dur:4},name:"Komuta"},{k:"amp",v:c=>c.en.ccUntil>c.t?.07:0,name:"Komuta (+%7 hasar)"}],
  "edge-of-durand":[{on:"hit",need:c=>c.en.shTotal()>0,t:"P",v:c=>15+.4*c.L.ad,name:"Bariyer Kırma"}],
  "warmogs-armor":[{k:"stat",f:s=>{s.healAmp=(s.healAmp||0)+30;},name:"Kutsanmış (+%30 iyileşme)"}],
};

/* Ana rünler (seçili buildin ilk rünü) */
const rune = {
  "Conqueror":[{k:"ramp",id:"conq",on:"hit",cd:.25,max:6,dur:6,st:{adapt:c=>lv(c,3,5)},name:"Fatih"},
    {k:"dyn",f:(L,c)=>{ if(c.me.stk("conq")>=6) L.ov+=c.melee?.09:.05; },name:"Fatih can çalma"}],
  "Lethal Tempo":[{k:"ramp",id:"lt",on:"aa",max:6,dur:6,st:{as:c=>c.melee?6:4.8},name:"Ölümcül Tempo"},
    {on:"aa",need:c=>c.me.stk("lt")>=6,t:"A",v:c=>(c.melee?lv(c,9,30):lv(c,6,20))*(1+(c.melee?.005:.0033)*c.L.asBonus),name:"Ölümcül Tempo oku"}],
  "Electrocute":[{on:"hit",every:3,cd:c=>lv(c,20,13),t:"A",v:c=>lv(c,60,210)+.1*c.s.bad+.05*c.s.ap,name:"Elektrik Ver"}],
  "Grasp of the Undying":[{on:"aa",cd:3,startCd:3,t:"M",v:c=>(c.melee?.03:.012)*c.s.hp,heal:c=>(c.melee?.013:.0052)*c.s.hp,name:"Hortlağın Pençesi"}],
};

window.WR_MECH = { champ, item, rune, fix, lv, st, rk };
})();
