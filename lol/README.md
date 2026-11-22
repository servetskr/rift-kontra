# Rift Kontra · League of Legends (PC)

League of Legends için Türkçe düello hesaplayıcı, kontra seçici, eşya rehberi ve yama özeti. Adres: **https://servetskr.github.io/rift-kontra/lol/**

- **Düello (ana ekran):** Kendi şampiyonunu ve rakibi, koridoru (5 koridorun hepsi), seviyeyi (1–18) ve eşya yuvalarını seç. Hazır build düğmeleri o koridordaki oyuncu buildlerini yükler (u.gg: en çok tercih edilen, en yüksek kazanan, Master+; kazanma oranıyla). Şampiyonun o koridorda verisi yoksa (ör. alt koridor Yasuo, destek Yasuo) en çok oynandığı koridorun buildi koridor kurallarına göre **uyarlanır** ve "uyarlanmış build" diye işaretlenir. Her buildin rün sayfası ve büyüleri de görünür.
- **Tarz buildleri:** Buildler tarz gruplarına ayrılır (ör. Malphite: Tank · Büyücü (AP); Yasuo: Kritik · Off-tank; Garen: Kritik · Dövüşçü · Tank · Off-tank). Her grupta yaklaşık 3 build vardır: ana tarzda u.gg varyantları (En çok tercih, En çok kazanan, Master+); diğer tarzlarda u.gg'nin tarz sayfası (ap, tank, ad, crit, lethality, onhit; koridorda en az 300 maç) ya da veri yoksa tarza göre hazırlanmış "Standart" build; ayrıca her grubun ilk buildinden **Fiziksel hasara karşı** ve **Büyü hasarına karşı** varyantları (savunma eşyaları eşdeğeriyle değişir, değişecek eşya yoksa son eşyanın yerine tarza uygun savunma eşyası girer). Tarz yalnızca şampiyonun gerçekten oynandığı tarzlardır (oyuncu verisi, u.gg tarz sayfaları, sınıf, yeteneklerin yetenek gücü oranları); suikastçı Malphite gibi tarzlar eklenmez. Ayrıca düelloda her grup için **Bu rakibe göre** (ilk 2 eşya + öneri motoru).
- **Rünler:** Her buildin kendi rün sayfası gösterilir ve kaynağı yazılır: En çok tercih / En çok kazanan → oyuncuların o koridordaki sayfası (u.gg, Zümrüt+; u.gg eşya yolu başına ayrı sayfa vermez, ikisi aynıdır); Master+ → Master+ oyuncuların sayfası; u.gg tarz sayfası → o tarzda oynayanların sayfası; veri yoksa tarza göre hazırlanmış sayfa (oyuncu verisi değil).
- **Destek eşyası:** Destek rolünde build destek eşyasıyla başlar ve yolu gösterilir (Dünya Atlası → Rün Pusulası → Dünyaların Ganimeti → bedelsiz son yükseltme: Kan Şarkısı, Semavi Muhalefet, Düşgetiren, Zaz'Zak'ın Taşkını ya da Gündönümü Kızağı). Satış değeri 160 altın; build dolunca satıp yerine alınacak eşya **"Satınca"** kutucuğuyla buildin sonunda (profil) ve destek eşyası kutusunda (düello) görünür.
- **Karşı takım:** "Çoğu fiziksel / Dengeli / Çoğu büyü" seçimi savunma eşyalarını eşdeğeriyle değiştirir (ör. Doğanın Kudreti ↔ Randuin'in Alameti, Kutluyas Rukern ↔ Çivili Zırh, Malmortius'un Ağzı ↔ Ölümün Dansı, Banshee'nin Duvağı ↔ Zhonya'nın Kumsaati, Merkür'ün Adımları ↔ Çelik Kaplamalı Çizme) ve önerileri etkiler.
- **Öneriler (kural tabanlı):** "Bu rakibe karşı en etkili eşyalar" en fazla 10 eşya, her biri 1–2 kısa gerekçeyle; puan ve "yerine" yazılmaz. Aday havuzu: şampiyonun bu koridorda aldığı tamamlanmış eşyalar (buildler, varyantlar, 4–6. eşya seçenekleri, durumsal eşyalar, ne kadar alındığına göre ağırlıklı) + seçili tarzın eşyaları + tarza uygun savunma; buildde olanlar ve kurala aykırılar (grup, koridor, menzil, çizme) çıkarılır. Puan = yaygınlık (0–1) + ekler: rakip dayanıklıysa zırh/büyü delme ve yüzde can hasarı (saf saldırı hızı/kritik sayılmaz); rakip kırılgansa patlama hasarı (tanka karşı eşyalar geriye düşer); rakip çok can yeniliyorsa Ağır Yara; rakibin hasar türü ve karşı takım seçimine uygun savunma (buildde o direnç yoksa daha çok); suikastçı/patlama rakibe Koruyucu Melek, Zhonya, Gecenin Kıyısı, Banshee; çok kitle kontrolüne Cıva Yatağan, Merkür'ün Adımları. Dokununca boş yuvaya girer; yuvalar doluysa hangi eşyanın yerine geçeceğini oyuncu seçer. Düello simülasyonu yalnızca güç dengesi çubuğu ve ölçümler içindir.
- **Bilgi kutuları:** Her ekranda eşya, rün, büyü ve şampiyon simgelerinin üstüne gelince bilgi kutusu açılır (eşya: ad, fiyat, değerler, pasif/aktif metni; rün: ad ve açıklama; şampiyon: koridorlar, sınıf, kademe, kazanma oranı). 120 ms gecikme, ekranın içinde kalır, imleci örtmez; klavyeyle odaklanınca da açılır. Dokunmatik ekranda dokunuşlar bozulmaz; basılı tutunca (0,5 sn) açılır.
- **Rol ve eşya kuralları:** alt koridor çizme + 6 eşya, diğer roller çizme + 5 eşya; gelişmiş (3. kademe) çizmeler yalnızca orta koridor; destek eşyası yalnızca destek; aynı gruptan tek eşya (wiki `itemlimit`: zırh delme, can simidi, Büyülü Kılıç, Hydra, durağanlık…; `data/item-limits.json`). Alınamayan eşyalar seçicide soluk ve nedeniyle görünür; buildler bu kurallara göre düzenlenir.
- **Şampiyonlar:** Üstte **Meta şampiyonlar** (koridor başına: en az %2,5 seçilen ve %50,5 üstü kazananlar, kazanma ve seçilme birlikte puanlanır); altında koridora göre kazanma oranıyla S→D kademe grupları ya da A–Z. Kartlarda "Kazanma" ve "Seçilme" oranları etiketlidir. Profilde Build · İstatistik · Yetenekler · Eşleşmeler · Oynanış sekmeleri ve yama değişikliği şeridi. İstatistik: koridor başına kademe, kazanma, seçilme, yasaklanma ve maç sayısı; buildlerin ve başlangıç eşyalarının kazanma oranı; 4., 5. ve 6. eşya seçeneklerinin kazanma oranları. Eşleşmeler en az 100 maçlıdır; 300'den az maçlılar "az veri" diye işaretlenir.
- **Eşyalar:** Kategoriye göre simgeler (Fiziksel, Büyü, Savunma, Destek, Çizmeler, Başlangıç, Ara eşyalar); dokununca sayılar, Türkçe etki metni, yapımı ve alım kuralları (birlikte alınamadığı eşyalar, rol kısıtı).
- **Yama:** Resmi Türkçe yama notlarından güçlendirme / zayıflatma / dengeleme işaretleri; yetenek bazında eski → yeni değerler.

## Düello hesabı

Saniye saniye (0,05 sn adımlı, en fazla 30 sn) simülasyon:

- LoL taban değerleri ve seviye büyüme eğrisi, saldırı hızı oranı (LoL Wiki)
- Eşya sayıları (Data Dragon Türkçe açıklamalarından okunur), Rabadon çarpanı, kritik hasarı, delme/deşme, can çalma, sıvışma
- Yetenek hasarları, oranlar (YG, SG, ilave SG, can ve hedef canı yüzdesi, zırh), bekleme süreleri ve yetenek hızı
- Yetenek kademeleri oyuncuların gerçek yetenek sırasından (u.gg); temel yetenekler 5, ulti 3 kademe (6/11/16)
- Kalkanlar hasarı emer; sersemletme / havaya kaldırma hedefin saldırmasını ve yetenek kullanmasını durdurur, susturma yeteneği durdurur, sabitlenen yakın dövüşçü uzaktaki rakibe vuramaz
- Süreye yayılan hasar (yanma, alan, kanalize ultiler) süre boyunca işlenir
- Sonuç: simülasyon ile gerçek koridor eşleşmesi verisinin (varsa) yarı yarıya karışımı

Hesaba katılmayanlar: menzil, hareket ve kaçma, iyileştirme yetenekleri, rünler, sihirdar büyüleri, çoğu eşya pasifi ve aktifi, minyonlar. Sonuçlar tahminidir.

## Otomatik güncelleme

```
node lol/scripts/update.js            # olağan çalışma (depo kökünden ya da herhangi bir yerden)
node lol/scripts/update.js --full     # her şeyi zorla yenile (görseller dahil)
# ek seçenekler: --skip-ugg (oranları/buildleri atla), --skip-wiki (wiki adımlarını atla), --builds (buildleri ve eşleşmeleri hemen yenile)
```

Tam güncelleme yaklaşık **20–25 dakika** sürer (u.gg'ye şampiyon başına 8 istek: genel, 6 tarz sayfası ve eşleşmeler; wiki'ye şampiyon başına 1 istek; istekler arasında bekleme vardır). Olağan çalışmada değişmeyen adımlar atlanır.

| Veri | Ne zaman yenilenir | Kaynak |
|---|---|---|
| Sürüm (yama), Türkçe şampiyon/yetenek/eşya/rün/büyü adları ve açıklamaları, görseller | Her çalışmada (görseller yalnızca yeni/eksikse indirilir) | Riot Data Dragon `tr_TR` |
| Taban değerler, saldırı hızı oranı; birlikte alınamayan eşya grupları | Yeni yamada veya 20 saatte bir | LoL Wiki `Module:ChampionData/data`, `Module:ItemData/data` (CC BY-SA 4.0) |
| Yetenek hasarı, oranlar, bekleme, kalkan, kitle kontrolü süreleri | Yeni yamada veya 3 günde bir | LoL Wiki şampiyon sayfaları (CC BY-SA 4.0) |
| Kazanma / seçilme / yasaklanma oranları | Her çalışmada | u.gg herkese açık istatistik dosyaları (Dünya, Zümrüt+) |
| Buildler (koridor başına en çok tercih edilen, en yüksek kazanan, Master+ kendi rün sayfasıyla; u.gg tarz sayfaları: ap, tank, ad, crit, lethality, onhit), başlangıç, çizme, rün, büyü, yetenek sırası, durumsal eşyalar, 4./5./6. eşya seçenekleri ve başlangıç eşyalarının kazanma oranı | Yeni oran yamasında veya 20 saatte bir | u.gg |
| Koridor eşleşmeleri (kazanma oranı, maç sayısı; en az 100 maç) | Buildlerle birlikte | u.gg |
| Yama değişiklikleri | Her çalışmada | leagueoflegends.com/tr-tr yama notları (`scripts/notes.js`) |

Önerilen sıklık: 6 saatte bir (WR sürümüyle aynı iş akışına `node lol/scripts/update.js` adımı ve `git add lol/data lol/img` eklenebilir).

Her adımın sağlamlık kontrolü var (eksik/yarım veri, ani düşüş, az maç). Kontrolü geçemeyen veri yazılmaz, eski veri korunur ve betik 1 koduyla çıkar. u.gg'ye erişilemezse (engel ya da dosya yoksa) adım atlanır, eski oranlar ve buildler korunur. Yeni yamanın ilk saatlerinde u.gg'de yeterli maç yoksa önceki yamanın oranları kullanılır; arayüz hangi yamanın oranlarını gösterdiğini altbilgide yazar. Anahtarlar sıralı yazılır; değişmeyen veri git farkı üretmez.

### Dosyalar

- `scripts/update.js` — ana güncelleyici · `scripts/notes.js` — Türkçe yama notu ayrıştırıcı · `scripts/abilities.js` — wiki yetenek ayrıştırıcı · `scripts/lua.js` — wiki Lua modülü ayrıştırıcı
- `data/*.js` — `window.LOL_*` globalleri (champs, items, runes, abilities, stats, builds, matchups, meta) · `data/state.json` — indirilmiş görsellerin kaydı · `data/wiki-stats.json` — wiki taban değer önbelleği
- `img/` — yerel görseller (şampiyon, yetenek, eşya, rün, büyü)

## Bilinen sınırlamalar

- Yetenek sayıları İngilizce wiki'den ayrıştırılır; bazı özel yetenekler (ör. Aphelios silahları, dönüşüm biçimleri) eksik kalabilir; bu durumda ortalama hasar kullanılır ve arayüzde belirtilir.
- Eşleşmeler her şampiyonun en iyi/en kötü rakipleri ve u.gg sıralama dosyasından birleştirilir; az oynanan eşleşmelerde veri olmayabilir (düello o zaman yalnızca simülasyona dayanır).
- Oranlar u.gg'nin Dünya, Zümrüt+ dereceli tekli/ikili maçlarıdır.
- u.gg koridor başına, derece grubu başına (Zümrüt+, Master+) ve tarz sayfası başına birer rün sayfası verir; aynı koridordaki "En çok tercih" ve "En çok kazanan" buildleri için ayrı sayfa yoktur. Veri olmayan tarzlarda rün sayfası tarza göre hazırlanır (oyuncu verisi değildir).
- Uyarlanmış buildler (şampiyonun verisi olmayan koridor) oyuncu verisi değildir; başka koridorun buildinden koridor kurallarıyla türetilir.

Bu site hayran yapımıdır; Riot Games ile bağlantılı değildir. League of Legends ve ilgili görseller Riot Games'e aittir.
