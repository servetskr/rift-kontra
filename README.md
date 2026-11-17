# Rift Kontra

Wild Rift için Türkçe kontra ve item rehberi: **https://servetskr.github.io/rift-kontra/**

- **Kontra Seç:** Rakip şampiyona karşı koridor koridor avantajlı seçimler (paylaşılabilir link: `#kontra-darius`)
- **Item Rehberi:** Rakip takıma göre sıralı item yolu
- **Şampiyonlar:** Tüm şampiyonların Türkçe profili, yetenekleri, koridor bazında istatistikleri
- **Kademe Listesi:** Koridor koridor S'den D'ye güç sıralaması
- **Eşyalar:** Oyundaki Türkçe adları ve simgeleriyle itemlar
- Telefona "Ana ekrana ekle" ile uygulama gibi kurulur, çevrimdışı da açılır.

## Otomatik güncelleme

`.github/workflows/update.yml` 6 saatte bir `scripts/update.js` dosyasını çalıştırır:

| Veri | Ne zaman yenilenir | Kaynak |
|---|---|---|
| Kazanma / seçilme / yasaklanma oranları | Her çalışmada | riftpatchnotes.com (CN, Challenger+) |
| Yama numarası | Her çalışmada; değişirse her şey yenilenir | riftpatchnotes.com |
| Şampiyon profilleri, yetenekler, görseller | Yeni yamada veya 7 günde bir | wildrift.leagueoflegends.com/tr-tr |
| Eşleşme puanları | 20 saatte bir veya yeni yamada | wildriftcore.com (CN, Master+) |
| Yamada değişen şampiyon ve eşyalar | Yeni yamada | Resmi Türkçe yama notları |
| Eşya simgeleri | Eksik olanlar | Riot Data Dragon |

Her adımın sağlamlık kontrolü var (eksik/yarım veri, ani düşüş, tutarsız eşleşmeler). Kontrolü geçemeyen veri yazılmaz, eski veri korunur ve iş akışı hata verir (GitHub e-posta ile bildirir). Yeni çıkan şampiyonlar otomatik eklenir; elle yazılmış ipucu gelene kadar resmi sınıfına göre tahmini build gösterilir.

Elle yapmak: GitHub'da **Actions → Verileri güncelle → Run workflow** (tam yenileme için "full" kutusunu işaretle) ya da yerelde `node scripts/update.js --full`.

### Elle bakılan dosyalar
- `data/curated.js` — şampiyon başına arketip, etiketler ve Türkçe ipucu
- `data/items.js` — eşya listesi, Türkçe adlar ve değerler. Yamada değişen eşyalar sitede işaretlenir; değerleri buradan güncellenir.

## Veri kaynakları

- Şampiyon profilleri ve görseller: [wildrift.leagueoflegends.com/tr-tr](https://wildrift.leagueoflegends.com/tr-tr/champions/)
- Oranlar: [riftpatchnotes.com](https://www.riftpatchnotes.com/winrates)
- Eşleşme puanları: [wildriftcore.com](https://wildriftcore.com/)
- Türkçe eşya adları: resmi Wild Rift yama notları · simgeler: Riot Data Dragon

Bu site hayran yapımıdır; Riot Games ile bağlantılı değildir. Wild Rift ve ilgili görseller Riot Games'e aittir.
