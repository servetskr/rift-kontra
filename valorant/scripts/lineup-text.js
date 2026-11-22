/*
 * Lineup kayıtlarının Türkçe metinleri: bölge adları, ekler (ünlü uyumu, ünsüz benzeşmesi),
 * yetenek başına "ne işe yarar" kalıpları, varsayılan "nerede dur / nereye nişan al" metinleri
 * ve yeni yetenekler için abil tanımları. Hepsi bölge düzeyindedir; kesin nişan videodadır.
 */
"use strict";

function clName(c) {
  if (c.r === "Bölge") return `${c.s} Bölgesi`;
  if (c.r === "Başlangıç") return /^Sald/.test(c.s) ? "Saldıran başlangıcı" : "Savunan başlangıcı";
  return / Taraf$/.test(c.s) ? c.r : `${c.s} ${c.r}`;
}
function nameOf(G, m, ref) {
  const C = Object.fromEntries(G.maps[m].cl.map(c => [c.k, c]));
  const [a, rest] = ref.split("~");
  if (!rest) { if (!C[a]) throw new Error(`${m}: bölge yok ${a}`); return clName(C[a]); }
  const [b] = rest.split("@"); if (!C[a] || !C[b]) throw new Error(`${m}: bölge yok ${ref}`);
  return `${clName(C[a])} – ${clName(C[b])} arası`;
}

/* Türkçe ekler: abl -dan/-den, dat -a/-e, loc -da/-de, acc -ı/-i/-u/-ü */
const VOW = "aıoueiöüAIOUEİÖÜ", BACK = "aıouAIOU", HARD = "fstkçşhpFSTKÇŞHP";
const I4 = { a: "ı", ı: "ı", o: "u", u: "u", e: "i", i: "i", ö: "ü", ü: "ü", A: "ı", I: "ı", O: "u", U: "u", E: "i", İ: "i", Ö: "ü", Ü: "ü" };
const lastV = s => { for (let i = s.length - 1; i >= 0; i--) if (VOW.includes(s[i])) return s[i]; return "e"; };
function sfx(s, c) {
  const v = /Hol$/.test(s) ? "e" : lastV(s), back = BACK.includes(v), last = s[s.length - 1];
  const vow = VOW.includes(last), hard = HARD.includes(last), e2 = back ? "a" : "e", i4 = I4[v] || "i";
  if (/(Bölgesi|başlangıcı|arası)$/.test(s)) return s + (/Bölgesi$/.test(s) ? "'" : "") + { abl: "nd" + e2 + "n", dat: "n" + e2, loc: "nd" + e2, acc: "n" + i4 }[c];
  if (c === "abl") return s + "'" + (hard ? "t" : "d") + e2 + "n";
  if (c === "loc") return s + "'" + (hard ? "t" : "d") + e2;
  if (c === "dat") return s + "'" + (vow ? "y" : "") + e2;
  if (c === "acc") return s + "'" + (vow ? "y" : "") + i4;
  return s;
}

/* "ne işe yarar" kalıpları: [0] saldırı/genel, [1] savunma ya da Spike dışı, [2] ek; {to} bölge adı, {to:acc} ekli */
const DOES = {
  "sova:E": ["{to:acc} ve çevresini tarar; içerideki rakipler açığa çıkar, ekip bilgiyle girer.", "{to:acc} tarar; yaklaşan ya da saklanan rakipleri gösterir, geri alma ve tutuş için bilgi verir."],
  "sova:Q": ["Spike'ın dibine iki ok art arda düşer; etkisizleştirmeye çalışan rakibi ağır hasarla durdurur.", "{to:loc} kurulmuş Gözcü teçhizatını (tuzak, kamera, alarm) uzaktan kırar.", "{to:loc} kurulumu ya da etkisizleştirmeyi engeller; rakibi geri çekilmeye zorlar."],
  "brimstone:Q": ["Spike'ın dibine yanar; etkisizleştirme girişimini uzaktan keser.", "{to:acc} alevle kapatır; kurulum ya da geçiş gecikir."],
  "brimstone:E": ["{to:acc} görüşe kapatır; ekip uzun açılardan vurulmadan geçer."],
  "viper:C": ["Spike'ın dibine asit havuzu açar; etkisizleştirmeyi uzaktan engeller ve savunmasız bırakır.", "{to:acc} asitle kapatır; geçen rakibi savunmasız bırakır."],
  "viper:Q": ["{to:acc} zehir bulutuyla kapatır; yakıt yettikçe açıp kapatarak geçişi kontrol edersin."],
  "viper:E": ["Zehir Perdesi {to:acc} ikiye böler; uzun görüş hatları kapanır, ekip bölgeye güvenle girer.", "Zehir Perdesi {to:acc} ikiye böler; saldıranların görüşü kesilir, tutuş ya da geri alma kolaylaşır."],
  "kayo:E": ["{to:loc} yetenekleri sindirir; Gözcü kurulumları ve kaçış yetenekleri kapanır, giriş kolaylaşır."],
  "kayo:Q": ["{to:loc} bekleyenleri kör eder; ekip hemen girer ya da sen açıyı alırsın."],
  "kayo:C": ["Spike'ın dibine dalga dalga hasar verir; etkisizleştirmeyi engeller.", "{to:acc} parça bombasıyla temizler; köşede bekleyeni çıkarır."],
  "fade:E": ["{to:loc} görüş hattındaki rakipleri işaretler; ekip bilgiyle girer."],
  "fade:Q": ["Spike'ın dibine düşer; etkisizleştirmeye gelen rakip yerinde kalır, kolay hedef olur.", "{to:loc} rakipleri yerinde tutar ve sağırlaştırır; köşeye ya da Spike'a yaklaşanı durdurur."],
  "gekko:C": ["Spike'ın dibinde büyük patlama yapar; etkisizleştirme girişimini keser.", "{to:acc} yüksek hasarla temizler."],
  "killjoy:C": ["Spike'ın dibine konur; etkisizleştirmeye gelen rakip tetiklenen sürüyle hasar alır.", "{to:acc} kontrol eder; girişte tetiklersen geçen rakibe yüksek hasar verir."],
  "killjoy:Q": ["{to:loc} sessizce bekler; giren rakibi yakalayıp savunmasız bırakır ve girişi haber verir."],
  "killjoy:E": ["{to:acc} izler; giren rakibe ateş eder ve yerini gösterir."],
  "cypher:C": ["{to:loc} geçen ilk rakibi bağlar ve açığa çıkarır; yan geçişleri erkenden haber verir."],
  "cypher:E": ["{to:acc} kameradan izlersin; girişi görür, iğneyle rakibi işaretlersin."],
  "cypher:Q": ["{to:acc} kafesle kapatır; geçenler yavaşlar ve sesleri duyulur."],
  "deadlock:Q": ["{to:loc} ses çıkaran rakipleri sersemletir; girişi tek başına geciktirir."],
  "deadlock:E": ["Bariyer Ağı {to:acc} kapatır; işaretler kırılana kadar geçiş yavaşlar."],
  "deadlock:C": ["Nanoçekim {to:loc} rakipleri yere çeker; kaçamazlar ve kolay hedef olurlar."],
  "vyse:C": ["{to:acc} sarmaşıkla kaplar; açınca içinden geçen rakipler yavaşlar ve hasar alır."],
  "vyse:Q": ["{to:loc} basan rakibin önüne duvar çıkarır; ekibini böler ya da kaçışını keser."],
  "vyse:E": ["Ark Gülü {to:loc} bakan rakipleri kör eder; girişi ya da baskıyı keser."],
  "chamber:C": ["{to:acc} izler; yaklaşan rakip yavaşlar ve gelişi haber verilir."],
  "sage:C": ["{to:acc} duvarla kapatır; erken baskıyı durdurur ya da kurulum için siper sağlar."],
  "sage:Q": ["{to:acc} yavaşlatır; girişi geciktirir ve basan rakibin sesini duyurur."],
  "omen:E": ["{to:acc} görüşe kapatır; ekip açıdan vurulmadan geçer."],
  "omen:Q": ["Paranoya {to:loc} bekleyenleri kör eder; ekip hemen girer."],
  "astra:E": ["{to:acc} dumanla kapatır; ekip açıdan vurulmadan geçer."],
  "astra:Q": ["Nova Darbesi {to:loc} bekleyenleri sersemletir."],
  "astra:C": ["Çekim Alanı {to:loc} rakipleri merkeze çeker ve savunmasız bırakır."],
  "clove:E": ["{to:acc} dumanla kapatır; Clove öldükten sonra bile duman atabilir."],
  "harbor:E": ["Kalkanlı su küresi {to:acc} kapatır; mermileri bir süre durdurur."],
  "harbor:Q": ["Su dalgası {to:acc} ikiye böler; görüşü keser, içinden geçenleri yavaşlatır."],
  "harbor:C": ["Fırtına Akını {to:loc} bekleyenleri kör eder; ekip hemen girer."],
  "breach:E": ["Fay Hattı {to:loc} bekleyenleri sersemletir; ekip hemen girer."],
  "breach:C": ["Spike'ın dibine artçı sarsıntı vurur; etkisizleştirmeye gelen rakibe ağır hasar verir.", "Artçı Sarsıntı {to:loc} köşede bekleyeni yerinden çıkarır ya da hasarla öldürür."],
  "tejo:C": ["Gizli Dron {to:acc} tarar; bekleyen rakipleri açığa çıkarır, ekip bilgiyle girer ya da geri alır."],
  "tejo:E": ["Spike'ın dibine füzeler düşer; etkisizleştirmeye gelen rakibi durdurur.", "Güdümlü Salvo {to:loc} köşede ya da Spike'ın dibinde bekleyeni hasarla çıkarır."],
  "tejo:Q": ["Özel Teslimat {to:loc} bekleyenleri sersemletir; ekip hemen girer."],
  "veto:Q": ["Darboğaz {to:loc} geçen rakibi yavaşlatır, sağırlaştırır ve kırılgan yapar; girişi tek başına geciktirir."],
  "phoenix:E": ["Spike'ın dibine Yakar Top atar; etkisizleştirmeye gelen rakibi yakar.", "{to:acc} alevle kapatır; kurulum ya da geçiş gecikir."],
  "skye:Q": ["Av Peşinde {to:acc} tarar; köşede bekleyeni bulur, sersemletir ve yerini gösterir."],
};
const STAND = { lineup: "Videodaki duruş noktasına geç; tam yer önemlidir, ayağını videodaki köşeye ya da çizgiye daya.", setup: "Kurulum yerinin yanında dur; videodaki açıyı birebir uygula.", smoke: "Haritayı aç; konumu videodaki gibi işaretle." };
const AIM = { lineup: "Nişan, şarj ve sekme ayarı videodakiyle birebir aynı olmalı; videoyu bu kaydın anından açıp ekrandaki işarete hizala.", setup: "Videodaki duvar ya da zemin noktasına kur; rakibin gelirken kolay görmeyeceği bir köşe seç.", smoke: "Dumanı {to} üstüne, girişi tam kapatacak şekilde koy; videoda dumanın kenarı görünür." };
const DENY = "Kurulum yerini kapatır; saldıranın Spike'ı orada kurmasını geciktirir.";

/* Dosyada abil tanımı yoksa eklenecek yetenekler (video araması yedeği ve "nasıl at/kur" anlatımı) */
const ABIL = {
  "kayo:Q": { en: "flash", how: "FLAŞ/Bellek'i kuşan; sol tıkla at (yerde patlar), sağ tıkla hemen patlayacak şekilde at. Patlamaya bakan herkes kör olur." },
  "fade:Q": { en: "seize", how: "Mıhla'yı kuşan ve sol tıkla fırlat; tekrar etkinleştirince erken düşer. İndiği yerde rakipleri yerinde tutar, sağırlaştırır ve çürütür." },
  "deadlock:C": { en: "gravnet", how: "Nanoçekim'i kuşan; sol tıkla at, sağ tıkla yavaş at. İndiği yerdeki rakipler eğilmek zorunda kalır ve yavaşlar; kurtulmak için ağı sökmeleri gerekir." },
  "omen:E": { en: "smoke", how: "Karanlık Örtü'yü kuşan; haritadan değil, bakış yönünden nişan alırsın. Sağ tıkla mesafeyi ayarla, sol tıkla gönder; kürenin düştüğü yerde duman açılır." },
  "omen:Q": { en: "paranoia", how: "Paranoya'yı kuşan ve sol tıkla gönder. Düz bir hat boyunca ilerler, değdiği herkesi kör eder ve sağırlaştırır." },
  "astra:E": { en: "smoke", how: "Astral forma geç, haritada yıldız koy; sonra yıldızı Yıldız Bulutu olarak etkinleştir. Duman yıldızın olduğu yerde açılır." },
  "astra:Q": { en: "stun", how: "Astral formda yıldız koy, sonra Nova Darbesi olarak etkinleştir; kısa gecikmeyle patlar ve içindekileri sersemletir." },
  "astra:C": { en: "gravity well", how: "Astral formda yıldız koy, sonra Çekim Alanı olarak etkinleştir; içindekileri merkeze çeker ve savunmasız bırakır." },
  "clove:E": { en: "smoke", how: "Katakulli'yi kuşan, haritada duman noktalarını seç ve gönder. Clove öldükten sonra bile duman atabilir." },
  "harbor:E": { en: "cove", how: "Dalgakıran'ı kuşan; sol tıkla at, sağ tıkla yavaş at. İndiği yerde mermileri bir süre durduran kalkanlı bir su küresi açılır." },
  "harbor:Q": { en: "high tide", how: "Taşkın'ı kuşan; sol tıkı basılı tutarak su duvarını yönlendir. Duvar görüşü keser ve içinden geçenleri yavaşlatır." },
  "harbor:C": { en: "storm surge", how: "Fırtına Akını'nı kuşan ve sol tıkla at. İndiği yerde patlar; içindeki rakipleri kör eder ve yavaşlatır." },
  "breach:E": { en: "fault line", how: "Fay Hattı'nı kuşan; sol tıkı basılı tutarak menzili uzat, bırakınca sismik dalga gider. Yol üstündeki her rakip sersemler." },
  "breach:C": { en: "aftershock", how: "Artçı Sarsıntı'yı kuşan ve bir duvara nişan alıp sol tıkla. Duvarın arkasında art arda üç patlama olur, içindeki rakip ağır hasar alır." },
  "tejo:C": { en: "stealth drone", how: "Gizli Dron'u kuşan ve sol tıkla gönder; dronu sen yönetirsin. Sol tıkla nabız atınca çevredeki rakipler açığa çıkar." },
  "tejo:E": { en: "guided salvo", how: "Güdümlü Salvo'yu kuşan, haritada bir ya da iki hedef seç ve gönder. Füzeler seçilen noktaya düşüp patlar." },
  "tejo:Q": { en: "special delivery", how: "Özel Teslimat'ı kuşan ve sol tıkla fırlat; sağ tıkla bir kez sekerek gider. İndiği yerde patlayıp içindekileri sersemletir." },
  "veto:Q": { en: "chokehold", how: "Darboğaz'ı kuşan ve bir yüzeye yerleştir. Tetiklenince içindeki rakipler yavaşlar, sağırlaşır ve kırılganlaşır." },
  "vyse:E": { en: "arc rose", how: "Ark Gülü'nü kuşan ve bir duvara ya da yere yerleştir. Tekrar etkinleştirince patlar; ona bakan herkes kör olur." },
  "phoenix:E": { en: "hot hands molly", how: "Yakar Top'u kuşan; sol tıkla düz at, sağ tıkla yay çizerek at. Yere düştüğü yerde alev alanı açar; rakibe hasar verir, Phoenix'i iyileştirir." },
  "skye:Q": { en: "trailblazer", how: "Av Peşinde'yi kuşan ve sol tıkla Tazmanya kaplanını gönder; onu sen yönetirsin. Tekrar sol tıkla sıçrar, değdiği rakipleri sersemletir ve yerlerini gösterir." },
  "gekko:C": { en: "mosh pit", how: "Pofu'yu kuşan; sol tıkla at, sağ tıkla yavaş at. İndiği yerde önce düşük hasar verir, sonra büyük bir patlamayla yüksek hasar verir." },
};

module.exports = { clName, nameOf, sfx, DOES, STAND, AIM, DENY, ABIL };
