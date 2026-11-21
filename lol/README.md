# Rift Kontra · League of Legends (PC)

League of Legends için Türkçe düello hesaplayıcı, kontra seçici, eşya rehberi ve yama özeti. Adres: **https://servetskr.github.io/rift-kontra/lol/**

- **Düello (ana ekran):** Kendi şampiyonunu ve rakibi, koridoru (5 koridorun hepsi), seviyeyi (1–18) ve eşya yuvalarını seç. Hazır build düğmeleri o koridordaki oyuncu buildlerini yükler (u.gg: en çok tercih edilen, en yüksek kazanan, Master+; kazanma oranıyla). Şampiyonun o koridorda verisi yoksa (ör. alt koridor Yasuo, destek Yasuo) en çok oynandığı koridorun buildi koridor kurallarına göre **uyarlanır** ve "uyarlanmış build" diye işaretlenir. Her buildin rün sayfası ve büyüleri de görünür.
- **Tarz buildleri:** Şampiyonun gerçekten oynandığı tarzlar ayrı düğmelerdir (ör. Malphite: Tank ve Büyücü (AP); Yasuo: Kritik ve Off-tank; Garen: Dövüşçü, Tank, Off-tank). Tarz; oyuncu buildlerindeki eşya türlerinden, şampiyon sınıfından ve yeteneklerin yetenek gücü oranlarından çıkarılır; sınıfa aykırı tarzlar (suikastçı Malphite gibi) eklenmez. Tarz buildinde önce şampiyonun o tarzda oynayan oyuncularının aldığı eşyalar gelir; her tarzın kendi rün sayfası vardır. Ayrıca **Bu rakibe göre** (ilk 2 eşya üstteki buildden, kalanı düello rakibine karşı seçilir).
- **Destek eşyası:** Destek rolünde build destek eşyasıyla başlar ve yolu gösterilir (Dünya Atlası → Rün Pusulası → Dünyaların Ganimeti → bedelsiz son yükseltme: Kan Şarkısı, Semavi Muhalefet, Düşgetiren, Zaz'Zak'ın Taşkını ya da Gündönümü Kızağı). Satış değeri 160 altın; oyun sonunda satılırsa yerine alınacak eşya da önerilir.
- **Karşı takım:** "Çoğu fiziksel / Dengeli / Çoğu büyü" seçimi savunma eşyalarını eşdeğeriyle değiştirir (ör. Doğanın Kudreti ↔ Randuin'in Alameti, Kutluyas Rukern ↔ Çivili Zırh, Malmortius'un Ağzı ↔ Ölümün Dansı, Banshee'nin Duvağı ↔ Zhonya'nın Kumsaati, Merkür'ün Adımları ↔ Çelik Kaplamalı Çizme) ve önerileri etkiler.
- **Öneriler:** Bu rakibe karşı en etkili 12 eşya (6'sı açık, 6'sı "daha fazla" altında). Havuz: oyuncuların o koridorda aldığı eşyalar + şampiyonun tarzlarına uyan eşyalar + sınıfına uygun savunma; tarza uymayanlar (tanka kritik, fiziksel şampiyona yetenek gücü) ayıklanır. Puan düello simülasyonundaki farktır; sıralamada rakibin ve karşı takımın hasar türü, rakibin dayanıklılığı, rakibin can yenilemesi ve eşyanın o koridorda ne kadar alındığı da tartılır. İlk 2 eşya ve destek eşyası yerinde kalır; etkisi simülasyonda olmayan eşyalar (Zhonya, Koruyucu Melek, Cıva Yatağan…) en son değiştirilir.
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

Tam güncelleme yaklaşık **10 dakika** sürer (u.gg'ye şampiyon başına 2 istek, wiki'ye şampiyon başına 1 istek; istekler arasında bekleme vardır). Olağan çalışmada değişmeyen adımlar atlanır.

| Veri | Ne zaman yenilenir | Kaynak |
|---|---|---|
| Sürüm (yama), Türkçe şampiyon/yetenek/eşya/rün/büyü adları ve açıklamaları, görseller | Her çalışmada (görseller yalnızca yeni/eksikse indirilir) | Riot Data Dragon `tr_TR` |
| Taban değerler, saldırı hızı oranı; birlikte alınamayan eşya grupları | Yeni yamada veya 20 saatte bir | LoL Wiki `Module:ChampionData/data`, `Module:ItemData/data` (CC BY-SA 4.0) |
| Yetenek hasarı, oranlar, bekleme, kalkan, kitle kontrolü süreleri | Yeni yamada veya 3 günde bir | LoL Wiki şampiyon sayfaları (CC BY-SA 4.0) |
| Kazanma / seçilme / yasaklanma oranları | Her çalışmada | u.gg herkese açık istatistik dosyaları (Dünya, Zümrüt+) |
| Buildler (koridor başına en çok tercih edilen, en yüksek kazanan, Master+), başlangıç, çizme, rün, büyü, yetenek sırası, durumsal eşyalar, 4./5./6. eşya seçenekleri ve başlangıç eşyalarının kazanma oranı | Yeni oran yamasında veya 20 saatte bir | u.gg |
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
- u.gg tek rün sayfası verir; tarz buildlerinin rün sayfaları LoL rün kurallarına uygun, tarza göre hazırlanmış sayfalardır (oyuncu verisi değildir).
- Uyarlanmış buildler (şampiyonun verisi olmayan koridor) oyuncu verisi değildir; başka koridorun buildinden koridor kurallarıyla türetilir.

Bu site hayran yapımıdır; Riot Games ile bağlantılı değildir. League of Legends ve ilgili görseller Riot Games'e aittir.
