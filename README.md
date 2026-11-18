# Rift Kontra

Wild Rift, League of Legends ve VALORANT için Türkçe düello, kontra, build ve yama rehberi:
**https://servetskr.github.io/rift-kontra/**

Ana sayfada oyun seçilir; her oyunun kendi sitesi vardır:

| Klasör | Oyun | Ekranlar |
|---|---|---|
| `wr/` | Wild Rift | Düello · Şampiyonlar · Eşyalar · Yama |
| `lol/` | League of Legends | Düello · Şampiyonlar · Eşyalar · Yama |
| `valorant/` | VALORANT | Silah düellosu · Ajanlar · Silahlar · Yama |

Telefona "Ana ekrana ekle" ile uygulama gibi kurulur; çevrimdışı da açılır (`sw.js`, tüm oyunlar için ortak).

## Otomatik güncelleme

`.github/workflows/update.yml` 6 saatte bir her oyunun güncelleyicisini ayrı ayrı çalıştırır
(`wr/scripts/update.js`, `lol/scripts/update.js`, `valorant/scripts/update.js`). Her adımın sağlamlık
kontrolü vardır; kontrolü geçemeyen veri yazılmaz, eski veri korunur ve iş akışı hata verir (GitHub e-posta ile bildirir).
Biri başarısız olsa da diğer oyunlar güncellenir.

Bazı kaynaklar GitHub sunucularını engeller (örneğin Wild Rift eşleşme ve build verisi). Bunlar bilgisayardan
`guncelle.cmd` dosyasına çift tıklayarak yenilenir; değişen veri otomatik gönderilir.

Elle başlatmak: GitHub'da **Actions → Verileri güncelle → Run workflow** ("full" kutusu her şeyi zorla yeniler).

## Wild Rift veri kaynakları

| Veri | Ne zaman | Kaynak |
|---|---|---|
| Kazanma / seçilme / yasaklanma oranları, yama numarası | Her çalışmada | riftpatchnotes.com (CN, Challenger+) |
| Şampiyon profilleri, yetenek açıklamaları, görseller | Yeni yamada veya 7 günde bir | wildrift.leagueoflegends.com/tr-tr |
| Eşleşme puanları, buildler, oyun içi simgeler | 20 saatte bir (yalnızca yerelden) | wildriftcore.com (CN) |
| Yama değişiklikleri (yetenek bazında, buff/nerf işaretli) | Her çalışmada | Resmi Türkçe yama notları |
| Taban değerler, item sayıları | Günde bir | LoL Wiki (CC BY-SA 4.0) |
| Yetenek hasarları, bekleme süreleri, kalkanlar, kitle kontrolü | Yeni yamada veya haftada bir | LoL Wiki WR sayfaları (CC BY-SA 4.0) |

Elle bakılan dosyalar: `wr/data/curated.js` (şampiyon ipuçları), `wr/data/items.js` (Türkçe eşya adları ve etkileri).
LoL ve VALORANT kaynakları kendi klasörlerindeki README dosyalarında.

Bu site hayran yapımıdır; Riot Games ile bağlantılı değildir. Oyun adları ve görseller Riot Games'e aittir.
