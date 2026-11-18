# Rift Kontra · League of Legends (PC)

League of Legends için Türkçe düello hesaplayıcı, kontra seçici, eşya rehberi ve yama özeti. Adres: **https://servetskr.github.io/rift-kontra/lol/**

- **Düello (ana ekran):** Kendi şampiyonunu ve rakibi, seviyeyi (1–18) ve 6 eşya yuvasını seç. Tarz düğmeleri (Tank, Büyücü, Nişancı, Dövüşçü, Suikastçı) oyuncuların gerçekten kullandığı buildleri yükler; "?" işaretli olanlar deneyseldir. Güç dengesi, karar, 4 ölçüm (▲/▼ farkla), değişiklik günlüğü ("Rakip X aldı → avantajın −5 puan"), **Dövüştür** canlandırması (can, kalkan ve kitle kontrolü zaman çizelgesi), bu rakibe karşı en etkili eşyalar ve en iyi kontra seçimleri.
- **Şampiyonlar:** Koridora göre kazanma oranıyla S→D kademe grupları ya da A–Z; profilde Build · Yetenekler · Eşleşmeler · Oynanış sekmeleri ve yama değişikliği şeridi.
- **Eşyalar:** Kategoriye göre simgeler (Fiziksel, Büyü, Savunma, Destek, Çizmeler, Başlangıç, Ara eşyalar); dokununca sayılar, Türkçe etki metni, yapımı ve kimlerin aldığı.
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
# ek seçenekler: --skip-ugg (oranları/buildleri atla), --skip-wiki (wiki adımlarını atla)
```

Tam güncelleme yaklaşık **10 dakika** sürer (u.gg'ye şampiyon başına 2 istek, wiki'ye şampiyon başına 1 istek; istekler arasında bekleme vardır). Olağan çalışmada değişmeyen adımlar atlanır.

| Veri | Ne zaman yenilenir | Kaynak |
|---|---|---|
| Sürüm (yama), Türkçe şampiyon/yetenek/eşya/rün/büyü adları ve açıklamaları, görseller | Her çalışmada (görseller yalnızca yeni/eksikse indirilir) | Riot Data Dragon `tr_TR` |
| Taban değerler, saldırı hızı oranı | Yeni yamada veya 20 saatte bir | LoL Wiki `Module:ChampionData/data` (CC BY-SA 4.0) |
| Yetenek hasarı, oranlar, bekleme, kalkan, kitle kontrolü süreleri | Yeni yamada veya 3 günde bir | LoL Wiki şampiyon sayfaları (CC BY-SA 4.0) |
| Kazanma / seçilme / yasaklanma oranları | Her çalışmada | u.gg herkese açık istatistik dosyaları (Dünya, Zümrüt+) |
| Buildler (koridor başına en çok tercih edilen, en yüksek kazanan, Master+), başlangıç, çizme, rün, büyü, yetenek sırası, durumsal eşyalar | Yeni oran yamasında veya 20 saatte bir | u.gg |
| Koridor eşleşmeleri (kazanma oranı, maç sayısı) | Buildlerle birlikte | u.gg |
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

Bu site hayran yapımıdır; Riot Games ile bağlantılı değildir. League of Legends ve ilgili görseller Riot Games'e aittir.
