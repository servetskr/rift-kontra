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

**Kayıtlar** (`data/lineups.js`, `window.VAL_LINEUPS`, elle hazırlanır, güncelleyici dokunmaz). Açık bir lineup veri seti olmadığı için liste elle yazılır ve yalnızca yaygın, standart kurulumlar girilir (Cypher, Killjoy, Deadlock, Vyse, Chamber, Sage kurulumları; Sova, Brimstone, Viper, Fade, KAY/O, Gekko atışları; Brimstone dumanları). Dosyanın başındaki yorum alanları anlatır: `ag`, `ab` (tuş), `map`, `side` (`atk`/`def`), `type` (`lineup`/`setup`/`smoke`), `to` (hedef bölge), isteğe bağlı `from` (durulacak bölge) ve `look` (kurulumun baktığı bölge), `title`, `stand`, `aim`, `does`, isteğe bağlı `how`, `yt` (yalnız arama yedeği için ek İngilizce sözcük), `v` (bu kaydı gösteren YouTube video kimliği) ve `t` (videoda kaydın başladığı saniye; videonun kendi bölüm başlıklarından alınır) ve `im` (bölüm karesi: `https://i.ytimg.com/vi/{v}/` sonrası yol).

**Bölüm kareleri (`im`)**: oyun içi ekran görüntüsü alınamadığı için, videonun herkese açık izleme sayfasındaki bölüm listesinde YouTube'un her bölüm için verdiği küçük resim kullanılır (i.ytimg.com'dan doğrudan gösterilir; indirilmez, yeniden barındırılmaz, gizli bir API kullanılmaz). Bu adresler YouTube tarafından imzalıdır (`sqp`/`rs` parametreleri); imzasız biçimi 404 döner. YouTube imzayı değiştirirse resim yüklenmez ve arayüz kendiliğinden videonun genel küçük resmine döner; kareyi yenilemek için videonun izleme sayfasındaki bölüm listesinden yeni adres alınır. Kare, YouTube'un o bölümden seçtiği tek bir andır; nişan noktası çoğunlukla görünür ama her zaman değil, kesin ayar için video aynı saniyeden oynatılır. `abil` sözlüğü her yeteneğin İngilizce adını (video araması için) ve varsayılan "nasıl atılır/kurulur" anlatımını tutar.

**Videolar**: `vids` sözlüğü video kimliği → `[başlık, kanal]` (yalnızca doğrulanmış videolar); `vid` sözlüğü `"ajan:harita"` → o ikili için genel video kimliği. Videolar YouTube aramasından (başlıkta ajan ve harita adı geçen, en az 1 dakikalık, bölümlü ve yeni olanlar öne alınarak) elle seçildi ve her kimlik `youtube.com/oembed` ile doğrulandı (200 yanıtı, başlık eşleşmesi). `t` değerleri videonun açıklamasındaki bölüm (chapter) zamanlarıdır; tahmin edilmez. Bir video kaldırılırsa küçük resim gri görünür; o kimliği `vids`'ten silmek yeterlidir, arayüz aramaya döner.

**Konumlar bölge düzeyindedir.** `to`/`from`/`look` değerleri valorant-api.com bölge adlarının İngilizce anahtarıdır (`"B Main"`); `"X~Y"` iki bölgenin ortası (ör. bir kapı), `"X~Y@0.3"` X'ten Y'ye %30. Piksel hassasiyetinde nişan noktası uydurulmaz: metinler bölge ve tarif düzeyindedir, kesin nişan, şarj ve sekme ayarı için kayda bağlı video (yoksa genel video ya da arama) vardır. 1.102 kaydın 1.042'si seçilen rehber videolarının (185 video) bölüm başlıklarından çıkarıldı: bölüm "A Lobby to A Site", "B Default from B Main", "[Def Turret] C Long & C Garage" gibi durma yeri ve hedefi açıkça söylüyorsa kayıt girildi, taraf ya da bölge belirsizse girilmedi. Geniş bölümlü videolarda ("A Site Setups") `t` o bölümün başıdır; kayıt o bölümde anlatılan kurulumlardan biridir.

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
| Lineup ve kurulumlar | Elle (`data/lineups.js`); kayıtların çoğu seçilen YouTube rehber videolarının bölüm başlıklarından, video kimliği ve başlangıç saniyesiyle |
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
