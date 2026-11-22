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
| En çok oynanan 3 çekirdek build, kazanma ve seçilme oranıyla ("En çok kazananlar") | Yeni yamada veya 20 saatte bir | riftpatchnotes.com (CN, Elmas+) |
| Yama değişiklikleri (yetenek bazında, buff/nerf işaretli) | Her çalışmada | Resmi Türkçe yama notları |
| Taban değerler, item sayıları, birlikte alınamayan item grupları | Günde bir | LoL Wiki (CC BY-SA 4.0) |
| Yetenek hasarları, bekleme süreleri, kalkanlar, kitle kontrolü | Yeni yamada veya haftada bir | LoL Wiki WR sayfaları (CC BY-SA 4.0) |

Elle bakılan dosyalar: `wr/data/curated.js` (şampiyon ipuçları), `wr/data/items.js` (Türkçe eşya adları ve etkileri; LoL Wiki WR eşya verisine göre).

**Wild Rift düellosunda build kuralları:** tek çizme; aynı gruptan tek item (zırh delme, can simidi, aktif item, Büyülü Kılıç…); destek görev itemı yalnızca destek koridorunda; yalnızca menzilli itemlar. Oyuncu buildlerinde bu kurala uymayan item varsa aynı koridorun diğer buildlerinden yasal bir itemla değiştirilir. Her şampiyon için koridor ve oyun stili seçilir (Tank, Off-tank, Kritik, Suikastçı, Büyücü, Koruyucu). Stil yalnızca gerçekten oynanıyorsa açılır: şampiyonun arketipi, oyuncu buildlerinin ve top 3 çekirdeklerin item türü, yetenek AP oranları, yakın dövüş + sert kitle kontrolü. Her stilde Build 1–3 önce gerçek oyuncu verisidir: riftpatchnotes'un Elmas+ (CN) en popüler 3 çekirdeği (ilk 3 item, kazanma ve seçilme oranıyla), 4.–5. item aynı koridordaki diğer çekirdeklerden ve önerilen buildlerden en sık alınanlarla tamamlanır; wildriftcore'un build motoru varyantları yalnızca koşullu öneri olarak ("Tanklara karşı", "Güvenli"…) gösterilir. Gerçek veri olmayan stillerde: oyuncu buildleri; yoksa aynı stildeki şampiyonların o koridordaki gerçek buildlerinden çıkarılan Standart / Fiziksel hasara karşı / Büyü hasarına karşı), Karma ve Bu rakibe göre; ayrıca En çok kazananlar (top 3). Her buildin rün sayfası vardır; stil şablonunun rünü stile uygun ana rünle seçilir. "Karşı takım" seçimi (Çoğu fiziksel / Dengeli / Çoğu büyü) savunma itemlarını eşine çevirir (ör. Doğanın Kudreti ↔ Ölü Adamın Zırhı) ve önerileri etkiler. Şampiyon listesinde kazanma ve seçilme oranları etiketlidir; üstte Meta şampiyonlar (kademe S/A ve koridorunda ortalamanın üstünde seçilen) gösterilir. Öneriler ("Bu rakibe karşı en etkili itemlar") kural tabanlıdır: şampiyonun o koridorda ne kadar sık aldığı + rakibe göre ihtiyaç (tank rakibe zırh/büyü delme ve yüzde can hasarı, iyileşene Ağır Yara, hasar türüne uygun savunma, ani hasara ve kitle kontrolüne karşı); hangi itemın çıkarılacağına oyuncu karar verir. En çok kazananlar sekmesindeki buildler riftpatchnotes'un iki rün sayfasından (en popüler + alternatif) stile uyanı kullanır. Item, rün ve şampiyonların üstüne gelince bilgi kutusu açılır (rün açıklamaları: wr/data/runes.js, elle yazıldı). Profilde İstatistik sekmesi: koridor başına kazanma/seçilme/yasaklanma, en popüler çekirdekler, çizmeler ve rün sayfaları.
LoL ve VALORANT kaynakları kendi klasörlerindeki README dosyalarında.

Bu site hayran yapımıdır; Riot Games ile bağlantılı değildir. Oyun adları ve görseller Riot Games'e aittir.
