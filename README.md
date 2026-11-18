# Rift Kontra

Wild Rift için Türkçe kontra ve item rehberi: **https://servetskr.github.io/rift-kontra/**

- **Düello (ana ekran):** İki şampiyon, seviye ve itemlar seç; güç dengesi, indirme süreleri, hasar geçişi ve etkili can anında hesaplanır. Bir itemı değiştirince farkı gösterir, en etkili itemları ve en iyi kontraları önerir.
- **Şampiyonlar:** Kademe (S→D, koridora göre) ya da A–Z; profilde Build · Yetenekler · Eşleşmeler · Oynanış sekmeleri
- **Eşyalar:** Kategoriye göre Wild Rift simgeleri, dokununca sayılar ve etki
- **Yama:** Güçlenen / zayıflayan / dengelenen şampiyon ve itemlar, yetenek bazında eski → yeni değerler
- Telefona "Ana ekrana ekle" ile uygulama gibi kurulur, çevrimdışı da açılır.

## Otomatik güncelleme

`.github/workflows/update.yml` 6 saatte bir `scripts/update.js` dosyasını çalıştırır:

| Veri | Ne zaman yenilenir | Kaynak |
|---|---|---|
| Kazanma / seçilme / yasaklanma oranları | Her çalışmada | riftpatchnotes.com (CN, Challenger+) |
| Yama numarası | Her çalışmada; değişirse her şey yenilenir | riftpatchnotes.com |
| Şampiyon profilleri, yetenekler, görseller | Yeni yamada veya 7 günde bir | wildrift.leagueoflegends.com/tr-tr |
| Eşleşme puanları | 20 saatte bir veya yeni yamada | wildriftcore.com (CN, Master+) |
| Şampiyon buildleri (koridor başına 3 varyant, bot, rün, durumsal eşyalar) | Eşleşmelerle birlikte | wildriftcore.com (CN sunucu verisi) |
| Wild Rift oyun içi simgeleri (şampiyon, eşya, rün) | Eksik/değişmiş olanlar | wildriftcore.com |
| Yamada değişen şampiyon ve eşyalar: hangi yetenek, eski → yeni değer, güçlendirme / zayıflatma / dengeleme işareti | Her çalışmada | Resmi Türkçe yama notları (`scripts/notes.js`) |
| Wild Rift taban değerleri ve item sayıları (düello için) | Günde bir veya yeni yamada | LoL Wiki, CC BY-SA 4.0 |
| Eşya simgesi yedeği | Wild Rift simgesi bulunamayanlar | Riot Data Dragon |

Her adımın sağlamlık kontrolü var (eksik/yarım veri, ani düşüş, tutarsız eşleşmeler). Kontrolü geçemeyen veri yazılmaz, eski veri korunur ve iş akışı hata verir (GitHub e-posta ile bildirir). Yeni çıkan şampiyonlar otomatik eklenir; elle yazılmış ipucu gelene kadar resmi sınıfına göre tahmini build gösterilir.

wildriftcore.com GitHub sunucularını engellediği (403) için eşleşme, build ve Wild Rift simgeleri yalnızca yerelden yenilenir: `scripts\yerel-guncelle.cmd`.

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
