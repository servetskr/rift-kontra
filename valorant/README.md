# Rift Kontra · VALORANT

VALORANT için Türkçe lineup ve kurulum rehberi (Lineup), arkadaşınla hangi ikiliyi seçmelisin (Duo); ajan ve silah rehberi. Wild Rift sürümüyle (`../wr/`) aynı tasarım dilini kullanır.

## Ekranlar

- **Lineup** (ana sayfa), iki mod:
  - **Lineup**: ajan → harita (önce rekabetçi havuz, sonra havuz dışı) → Saldırı/Savunma → mini haritada hedef noktaya dokun. O noktaya atılan lineup'lar ve kurulumlar listelenir: yetenek (simge ve resmi Türkçe ad), tür (Lineup · Kurulum · Duman), **Nerede dur**, **Nereye nişan al / Nereye kur**, **Nasıl at / Nasıl kur**, **Ne işe yarar** ve **video**: kaydın doğrulanmış YouTube videosunun **bölüm karesi** (YouTube'un o bölüm için ürettiği küçük resim; çoğunlukla nişan anını gösterir), yoksa videonun küçük resmi; dokununca video kartın içinde (çerezsiz `youtube-nocookie.com` oynatıcısı) kaydın başladığı saniyeden açılır, "YouTube'da aç" bağlantısı da aynı ana gider. Kayda özel video yoksa o ajan ve harita için seçilmiş genel video, o da yoksa YouTube araması gösterilir. Kaydı olmayan ajan + harita seçilince de varsa genel video gösterilir. Listedeki kayıtlar 1, 2, 3… diye numaralıdır ve haritadaki numaralar aynıdır: bir kayda dokununca durulacak yer **yeşil**, düştüğü/kurulduğu yer **kırmızı** noktayla ve aynı numarayla işaretlenir, aradaki çizgi ok ile çizilir (kurulumlarda `from` yoksa yalnız kırmızı nokta; "X~Y@t" konumlu kayıtlarda nokta bölge merkezi yerine o ara noktadır). Diğer hedef noktalar altın renkli kalır (sayı: o noktadaki kayıt sayısı). Haritanın altında küçük bir açıklama vardır; açık kartın üstünde "1 A Lobi → 1 A Bölgesi" şeklinde rota satırı ve telefonda haritaya kaydıran "Haritada gör" düğmesi bulunur. Kurulumlarda baktığı yer kesikli çizgiyle çizilir. Durma noktasına dokunmak o kaydı açar. Seçimler tarayıcıda hatırlanır.
  - **Duo**: sen ve arkadaşın (isteğe bağlı harita). Uyum puanı (tahmin), birlikte kazanma oranı (ölçülmüş), aradaki kombolar ve ajanın için en iyi eşler (birlikte en çok kazananlar · en iyi kombolar). Seçimler tarayıcıda hatırlanır.
- **Ajanlar**: role ya da kademeye göre ızgara, harita filtresi. Her kartta kademe, **Kaz.** (kazanma oranı) ve **Seçilme** (seçilme oranı) etiketli yazılır. Üstte **Meta ajanlar**: seçilme oranı en az %2 olan ve kazanma oranı seçilme ağırlıklı ortalamanın en fazla 0,3 puan altında kalan ajanlar, `seçilme × (kazanma − ortalama + 1,5)` puanına göre ilk 6 (harita filtresine göre o haritanın oranlarıyla). Profil: Yetenekler · Haritalar · Oynanış (rol önerileri, Kontralar, İyi eşler, "bu ajana karşı" önerileri). Lineup kaydı olan ajanlarda profilden "Lineup'ları gör", diğerlerinde "Duo'da dene".
- **Cephanelik**: silahlar (fiyat, atış hızı, şarjör, menzile göre hasar, kaç mermi tablosu), kalkanlar ve Haritalar sekmesi (rekabetçi havuz, saldırı/savunma dengesi, en çok kazandıran ajanlar).
- **Yama**: son üç resmi Türkçe yama notundan değişen ajan, silah ve haritalar; eski → yeni değerler.

## Lineup verisi

**Kayıtlar** (`data/lineups.js`, `window.VAL_LINEUPS`). İlk 144 kayıt elle yazıldı; sonrakiler video bölümlerinden üretildi ve liste `scripts/lineups.js` ile kendiliğinden büyür (aşağıda "Lineup güncelleyicisi"). Oyun verisi güncelleyicisi (`scripts/update.js`) bu dosyaya dokunmaz. Açık bir lineup veri seti olmadığı için liste elle yazılır ve yalnızca yaygın, standart kurulumlar girilir (Cypher, Killjoy, Deadlock, Vyse, Chamber, Sage kurulumları; Sova, Brimstone, Viper, Fade, KAY/O, Gekko atışları; Brimstone dumanları). Dosyanın başındaki yorum alanları anlatır: `ag`, `ab` (tuş), `map`, `side` (`atk`/`def`), `type` (`lineup`/`setup`/`smoke`), `to` (hedef bölge), isteğe bağlı `from` (durulacak bölge) ve `look` (kurulumun baktığı bölge), `title`, `stand`, `aim`, `does`, isteğe bağlı `how`, `yt` (yalnız arama yedeği için ek İngilizce sözcük), `v` (bu kaydı gösteren YouTube video kimliği) ve `t` (videoda kaydın başladığı saniye; videonun kendi bölüm başlıklarından alınır) ve `im` (bölüm karesi: `https://i.ytimg.com/vi/{v}/` sonrası yol).

**Bölüm kareleri (`im`)**: oyun içi ekran görüntüsü alınamadığı için, videonun herkese açık izleme sayfasındaki bölüm listesinde YouTube'un her bölüm için verdiği küçük resim kullanılır (i.ytimg.com'dan doğrudan gösterilir; indirilmez, yeniden barındırılmaz, gizli bir API kullanılmaz). Bu adresler YouTube tarafından imzalıdır (`sqp`/`rs` parametreleri); imzasız biçimi 404 döner. YouTube imzayı değiştirirse resim yüklenmez ve arayüz kendiliğinden videonun genel küçük resmine döner; kareyi yenilemek için videonun izleme sayfasındaki bölüm listesinden yeni adres alınır. Kare, YouTube'un o bölümden seçtiği tek bir andır; nişan noktası çoğunlukla görünür ama her zaman değil, kesin ayar için video aynı saniyeden oynatılır. `abil` sözlüğü her yeteneğin İngilizce adını (video araması için) ve varsayılan "nasıl atılır/kurulur" anlatımını tutar.

**Videolar**: `vids` sözlüğü video kimliği → `[başlık, kanal]` (yalnızca doğrulanmış videolar); `vid` sözlüğü `"ajan:harita"` → o ikili için genel video kimliği. Videolar YouTube aramasından (başlıkta ajan ve harita adı geçen, en az 1 dakikalık, bölümlü ve yeni olanlar öne alınarak) elle seçildi ve her kimlik `youtube.com/oembed` ile doğrulandı (200 yanıtı, başlık eşleşmesi). `t` değerleri videonun açıklamasındaki bölüm (chapter) zamanlarıdır; tahmin edilmez. Bir video kaldırılırsa küçük resim gri görünür; o kimliği `vids`'ten silmek yeterlidir, arayüz aramaya döner.

**Konumlar bölge düzeyindedir.** `to`/`from`/`look` değerleri valorant-api.com bölge adlarının İngilizce anahtarıdır (`"B Main"`); `"X~Y"` iki bölgenin ortası (ör. bir kapı), `"X~Y@0.3"` X'ten Y'ye %30. Piksel hassasiyetinde nişan noktası uydurulmaz: metinler bölge ve tarif düzeyindedir, kesin nişan, şarj ve sekme ayarı için kayda bağlı video (yoksa genel video ya da arama) vardır. 1.102 kaydın 1.042'si seçilen rehber videolarının (185 video) bölüm başlıklarından çıkarıldı: bölüm "A Lobby to A Site", "B Default from B Main", "[Def Turret] C Long & C Garage" gibi durma yeri ve hedefi açıkça söylüyorsa kayıt girildi, taraf ya da bölge belirsizse girilmedi. Geniş bölümlü videolarda ("A Site Setups") `t` o bölümün başıdır; kayıt o bölümde anlatılan kurulumlardan biridir.

### Lineup güncelleyicisi (`scripts/lineups.js`)

Lineup listesini sürekli büyütür. Zamanlanmış iş (`.github/workflows/update.yml`, 6 saatte bir) her seferinde çalıştırır ama güncelleyici durum dosyasındaki zamana bakar ve **günde en fazla bir kez** iş yapar (son çalışmadan 20 saat geçmediyse hemen çıkar). Adım 15 dakikada kesilir ve hatası işi başarısız saymaz.

Bir çalışmada:
1. **Sıra**: ajan × harita ikilileri (yalnız lineup yeteneği tanımlı ajanlar; Waylay, Iso, Jett gibi ajanlar yok) en az kaydı olandan başlayarak, eşitlikte en eski arananı önce alınır; en fazla `--max` (varsayılan 40) arama yapılır. Aranma zamanları `data/lineups-state.json`'da (`searched`) tutulur, böylece her çalışma sıradaki ikililere geçer.
2. **Video seçimi**: YouTube arama sonuç sayfasında (herkese açık `ytInitialData`) başlığında ajan ve harita adı geçen, en az 1 dakikalık, en az 3 bölümlü, 30 aydan yeni ve daha önce kullanılmamış en fazla 2 video seçilir; montaj/oyun kaydı/Vietnamca başlıklar elenir.
3. **Bölümlerden kayıt** (`scripts/lineup-parse.js`): izleme sayfasının bölüm listesi okunur. Yalnız açık biçimler kabul edilir: `[Atk Recon] A Lobby to A Site`, `ZERO/point: A Main to A Site`, `B Default from B Lobby`, `DEF A Main Flash` ve `Attack`/`Defender Lineups` gibi taraf başlıkları. Yetenek, ajan başına sözcüklerden (recon, shock, molly, knife, trip, cam, turret, haunt…) bulunur. Bölge adları haritanın `cl` anahtarlarına, haritaya özel takma adlarla çevrilir (Bind "Showers" → A Bath, Split "B Main" → B Garage, Icebox "A Main" → A Belt…); bölge harfi tutmayan eşleşme (ör. "A Main" → B Main) reddedilir. Taraf, yetenek ya da bölgesi kesin olmayan bölüm atlanır; bir videodan 3'ten az kayıt çıkarsa video hiç kullanılmaz (biçimi anlaşılmamış demektir).
4. **Doğrulama**: video `youtube.com/oembed` ile denenir (200, başlıkta ajan ve harita); bölüm karesi (`im`) izleme sayfasındaki imzalı adresten alınır. Aynı ajan + yetenek + harita + taraf + durma yeri + hedef zaten varsa kayıt eklenmez.
5. **Metin** (`scripts/lineup-text.js`): başlık, "nerede dur / nereye nişan al" ve yetenek başına "ne işe yarar" Türkçe kalıplarla, ünlü uyumlu eklerle üretilir; yeni yetenek için `abil` tanımı eklenir.
6. **Tazelik**: her çalışmada `--verify` (20) video, en eski doğrulanandan başlayarak yeniden denenir; iki çalışma üst üste silinmiş/gizli/gömülemez çıkan videonun `v`/`t`/`im` alanları kayıtlardan, kendisi `vids`/`vid`'den kaldırılır (kayıt metni kalır, arayüz aramaya döner). `--stills` (60) bölüm karesi sırayla denenir; imzası bozulan kare (i.ytimg.com'un 120×90 yer tutucusu) izleme sayfasından yenilenir, bulunamazsa silinir.
7. **Yazma**: yeni dosya metin düzeyinde üretilir (el yazımı kayıtlar, sıraları ve yorumlar korunur; yeni kayıtlar listenin sonuna `otomatik ekleme` başlığıyla eklenir), sonra tamamı doğrulanır: her kaydın ajanı, yeteneği, bölgeleri, videosu ve eski kayıtların sırası. Bir sorun varsa **hiçbir şey yazılmaz**. Yazım önce `.tmp` dosyasına yapılıp yerine taşınır.

**Güvenli başarısızlık**: YouTube 429 verirse, bot/onay sayfası döndürürse ya da sayfa biçimi değişirse (`ytInitialData` yok) güncelleyici bunu yazar ve 0 koduyla çıkar; o ana kadar doğrulanmış eklemeler dışında veriye dokunmaz. Hiçbir arama başarılı olmadıysa durum dosyasına da dokunmaz (bir sonraki zamanlı çalışma yeniden dener); bazı aramalar başarılıysa yalnız hangi ikililerin arandığını kaydeder. Tek bir videonun izleme sayfası beklenen veriyi taşımıyorsa yalnız o video atlanır. Beklenmeyen bir hata da `::warning::` olarak yazılır ve iş sürer.

**GitHub Actions notu**: YouTube veri merkezi IP'lerine sık sık bot doğrulaması gösterir. Bu durumda zamanlanmış çalışma arama yapamaz, kendini atlar ve veri olduğu gibi kalır; lineup'lar o zaman yalnız yerel çalıştırmayla büyür. Her çalışmanın özeti `data/lineups-state.json` → `runs` listesindedir (`queries`, `added`, `videos`, `removed`, `stills`, `blocked`).

Yerelde çalıştırma:

```
node valorant/scripts/lineups.js --force                 # günlük sınırı yok say, 40 arama
node valorant/scripts/lineups.js --force --dry --max 5   # yazmadan ne ekleneceğini göster
node valorant/scripts/lineups.js --force --agents omen,harbor --maps lotus,split --max 20
```

Seçenekler: `--force` (20 saat sınırını yok say), `--dry` (hiçbir dosyaya yazma), `--max N` (arama sayısı, 40), `--agents a,b` / `--maps a,b` (yalnız bunlar), `--verify N` (yeniden doğrulanacak video, 20), `--stills N` (denenecek bölüm karesi, 60), `--delay ms` (istekler arası bekleme, 2500; rastgele +%40), `--min-gap saat` (günlük sınır, 20).

**Mini harita koordinatları**: güncelleyici her haritanın `displayIcon` görselini `img/minimap/{harita}.png` olarak indirir ve bölgeleri (`callouts`) `data/game.js` içinde `maps.{harita}.cl` olarak yazar: `k` İngilizce anahtar, `s`/`r` Türkçe üst bölge ve bölge adı, `x`/`y` mini harita üzerinde 0–1 oranı. Dönüşüm valorant-api.com'un katsayılarıyladır: `x = oyunY · xMultiplier + xScalarToAdd`, `y = oyunX · yMultiplier + yScalarToAdd` (sol üst köşe 0,0). Bir haritada 10'dan az geçerli bölge varsa o harita atlanır; toplamda 8'den az harita mini harita verisi alırsa adım başarısız olur.

Yeni kayıt eklerken: bölge anahtarını `data/game.js`'teki `cl` listesinden al, metni Türkçe ve bölge düzeyinde yaz, emin olmadığın nişan ayrıntısını yazma. Harita güncellemesinden sonra o haritanın kayıtlarını gözden geçir.

## Duo modeli

**Yetenek etkileşimleri** (`data/interactions.js`, elle hazırlanır, güncelleyici dokunmaz; Duo kombolarında ve profildeki Kontralar listesinde kullanılır):
- Her yeteneğe mekanik etiketleri verilir (ör. `suppress` bastırma, `tether` bağlama, `dash` atılma, `tp` ışınlanma, `intang` dokunulmazlık, `vuln` kırılganlık, `trap` Gözcü kurulumu, `icpt` Veto'nun Tehditsavar'ının vurabildiği teçhizat).
- Karşılaştırma kuralları etiket çiftleridir: "bastırma → Gözcü kurulumları kapanır", "bağlama → atılma işe yaramaz, ışınlanma kırar", "yavaşlatma → atılma kısalır", "dokunulmazlık → etkilere bağışık", "Evrim → zayıflatmalara bağışık, anlık isabetli yetenek silahları hariç" gibi. Kurallara ek olarak tek bir çifte özel birkaç doğrulanmış etkileşim vardır (ör. Fake At klonu Dikenli Çit'i tetikler).
- Mekanikler VALORANT Wiki'nin durum etkisi, hareket, bağışıklık ve Tehditsavar etkileşim tablosu sayfalarından ve oyun içi Türkçe açıklamalardan alınmıştır (yama 13.10). Yeni çıkan ajanlarda (`fresh`) yalnızca resmi açıklamadaki etkiler kullanılır ve arayüz bunu belirtir.

**Uyum puanı** (0–100, tahmin): 30 + rol dengesi (farklı roller +12, aynı rol −8, birisi Kontrol Uzmanıysa +4) + kombo puanları (en fazla 50). Kombolar da etiket kurallarıdır: kırılganlık + alan hasarı, tutma + alan hasarı, kör etme/sersemletme + giriş, bilgi + hasar, Armoni, Kuvvet İşareti, iyileştirme, diriliş. Maç verisi değildir; arayüzde "tahmin" diye yazar.

**Birlikte kazanma oranı** (ölçülmüş): aynı takımdaki iki ajanın Rekabetçi Elmas+ maçlarda birlikte kazanma oranı. "Beklenen" = iki ajanın aynı veriden hesaplanan tek başına oranlarının toplamı − 50; aradaki fark ikilinin kendi etkisini gösterir. Tüm haritalarda en az 2.000, tek haritada en az 800 maç yoksa gösterilmez; harita verisi yetersizse tüm haritalar gösterilir ve bu yazılır. 3.000 maçın altı "az örnek" diye işaretlenir.

## Veri kaynakları

| Veri | Kaynak |
| --- | --- |
| Ajanlar, yetenekler, roller, silahlar, kalkanlar, haritalar, mini haritalar ve bölge adları, görseller (tr-TR) | [valorant-api.com](https://valorant-api.com) |
| Lineup ve kurulumlar | `data/lineups.js`: ilk kayıtlar elle; sonrakiler YouTube rehber videolarının bölüm başlıklarından, video kimliği, başlangıç saniyesi ve bölüm karesiyle; `scripts/lineups.js` günde en fazla bir kez yenilerini ekler (YouTube arama/izleme sayfası, oembed) |
| Yama değişiklikleri | [playvalorant.com/tr-tr](https://playvalorant.com/tr-tr/news/tags/patch-notes/) resmi Türkçe yama notları |
| Ajan kazanma/seçilme oranları, harita bazlı oranlar, rekabetçi harita havuzu | [blitz.gg](https://blitz.gg/valorant/stats/agents) (Rekabetçi, Elmas+, güncel bölüm) |
| İkili (aynı takım) kazanma oranları, tüm haritalar ve havuzdaki her harita | [vstats.gg](https://www.vstats.gg/agents) (sitenin kendi statik dosyaları `statistics/{bölüm}/ALL/{harita}/duo.json.gz`; Elmas+ rütbe grupları toplanır) |
| Yetenek etkileşimleri | [VALORANT Wiki](https://valorant.fandom.com) yetenek ve durum etkisi sayfaları, oyun içi açıklamalar (elle, `data/interactions.js`) |

Erişim engellenirse (403) oranlar atlanır, eski veri korunur; arayüz oranlar olmadan da çalışır. blitz.gg'de ikili ya da takım dizilimi verisi yok; tracker.gg ve metasrc Cloudflare engeline takılıyor, bu yüzden ikili oranlar vstats.gg'den.

## Güncelleme

```
node valorant/scripts/update.js          # olağan çalışma (~1 dk)
node valorant/scripts/update.js --full   # oyun verisini ve görselleri zorla yenile
node valorant/scripts/update.js --game   # yalnızca oyun verisini (mini haritalar dahil) yenile; oranlar, ikililer, yama notları atlanır
```

- Oyun sürümü her çalışmada okunur; sürüm değiştiyse, veri 7 günden eskiyse ya da `--full` verilirse ajan/silah/harita verisi ve görseller yenilenir (`data/state.json` sayesinde değişmeyen görseller yeniden indirilmez).
- Oranlar ve yama notları her çalışmada okunur (blitz.gg'ye 9 istek, aralarında 2,5–3 sn bekleme).
- İkili oranları her çalışmada okunur: güncel bölümün kimliği valorant-api.com'dan, ardından vstats.gg'ye tüm haritalar için 1 + havuzdaki her harita için 1 istek (aralarında 2,5 sn). En az 300 çift ve 500.000 maç yoksa ya da oranlar %35–65 dışındaysa yazılmaz; okunamayan harita için eski veri kalır.
- Her adım sağlamlık kontrolünden geçer; geçemeyen veri yazılmaz, eskisi korunur ve çıkış kodu 1 olur.
- Dosyalar `data/*.js` (`window.VAL_*`) olarak sıralı anahtarlarla yazılır; veri değişmediyse git farkı oluşmaz.
- Önerilen sıklık: günde bir kez (yeni yama genellikle iki haftada bir salı günü gelir).

Hayran yapımıdır; Riot Games ile bağlantılı değildir.
