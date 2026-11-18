# Rift Kontra · VALORANT

VALORANT için Türkçe ajan eşleşme rehberi: iki ajanın yetenekleri birbirini nasıl etkiler (VS), arkadaşınla hangi ikiliyi seçmelisin (Duo); ajan ve silah rehberi. Wild Rift sürümüyle (`../wr/`) aynı tasarım dilini kullanır.

## Ekranlar

- **Eşleşme** (ana sayfa), iki mod:
  - **VS**: senin ajanın ve rakip ajan. "Senin elinde" ve "Rakibin elinde" listeleri: hangi yetenek hangi yeteneği etkiler (simgelerle), sonuç türü (Kapatır · Zayıflatır · Kaçar · Gösterir) ve tek satırlık açıklama. Altta "Nasıl oynanır": o rakibe karşı kısa öneriler; yetenekler doğrudan etkileşmiyorsa role göre genel öneri.
  - **Duo**: sen ve arkadaşın (isteğe bağlı harita). Uyum puanı (tahmin), birlikte kazanma oranı (ölçülmüş), aradaki kombolar ve ajanın için en iyi eşler (birlikte en çok kazananlar · en iyi kombolar). Seçimler tarayıcıda hatırlanır.
- **Ajanlar**: role ya da kademeye göre ızgara, harita filtresi. Profil: Yetenekler · Haritalar · Oynanış (rol önerileri, Kontralar, İyi eşler, "bu ajana karşı" önerileri).
- **Cephanelik**: silahlar (fiyat, atış hızı, şarjör, menzile göre hasar, kaç mermi tablosu), kalkanlar ve Haritalar sekmesi (rekabetçi havuz, saldırı/savunma dengesi, en çok kazandıran ajanlar).
- **Yama**: son üç resmi Türkçe yama notundan değişen ajan, silah ve haritalar; eski → yeni değerler.

## Eşleşme modeli

**Yetenek etkileşimleri** (`data/interactions.js`, elle hazırlanır, güncelleyici dokunmaz):
- Her yeteneğe mekanik etiketleri verilir (ör. `suppress` bastırma, `tether` bağlama, `dash` atılma, `tp` ışınlanma, `intang` dokunulmazlık, `vuln` kırılganlık, `trap` Gözcü kurulumu, `icpt` Veto'nun Tehditsavar'ının vurabildiği teçhizat).
- VS kuralları etiket çiftleridir: "bastırma → Gözcü kurulumları kapanır", "bağlama → atılma işe yaramaz, ışınlanma kırar", "yavaşlatma → atılma kısalır", "dokunulmazlık → etkilere bağışık", "Evrim → zayıflatmalara bağışık, anlık isabetli yetenek silahları hariç" gibi. Kurallara ek olarak tek bir çifte özel birkaç doğrulanmış etkileşim vardır (ör. Fake At klonu Dikenli Çit'i tetikler).
- Mekanikler VALORANT Wiki'nin durum etkisi, hareket, bağışıklık ve Tehditsavar etkileşim tablosu sayfalarından ve oyun içi Türkçe açıklamalardan alınmıştır (yama 13.10). Yeni çıkan ajanlarda (`fresh`) yalnızca resmi açıklamadaki etkiler kullanılır ve arayüz bunu belirtir.

**Uyum puanı** (0–100, tahmin): 30 + rol dengesi (farklı roller +12, aynı rol −8, birisi Kontrol Uzmanıysa +4) + kombo puanları (en fazla 50). Kombolar da etiket kurallarıdır: kırılganlık + alan hasarı, tutma + alan hasarı, kör etme/sersemletme + giriş, bilgi + hasar, Armoni, Kuvvet İşareti, iyileştirme, diriliş. Maç verisi değildir; arayüzde "tahmin" diye yazar.

**Birlikte kazanma oranı** (ölçülmüş): aynı takımdaki iki ajanın Rekabetçi Elmas+ maçlarda birlikte kazanma oranı. "Beklenen" = iki ajanın aynı veriden hesaplanan tek başına oranlarının toplamı − 50; aradaki fark ikilinin kendi etkisini gösterir. Tüm haritalarda en az 2.000, tek haritada en az 800 maç yoksa gösterilmez; harita verisi yetersizse tüm haritalar gösterilir ve bu yazılır. 3.000 maçın altı "az örnek" diye işaretlenir.

## Veri kaynakları

| Veri | Kaynak |
| --- | --- |
| Ajanlar, yetenekler, roller, silahlar, kalkanlar, haritalar, görseller (tr-TR) | [valorant-api.com](https://valorant-api.com) |
| Yama değişiklikleri | [playvalorant.com/tr-tr](https://playvalorant.com/tr-tr/news/tags/patch-notes/) resmi Türkçe yama notları |
| Ajan kazanma/seçilme oranları, harita bazlı oranlar, rekabetçi harita havuzu | [blitz.gg](https://blitz.gg/valorant/stats/agents) (Rekabetçi, Elmas+, güncel bölüm) |
| İkili (aynı takım) kazanma oranları, tüm haritalar ve havuzdaki her harita | [vstats.gg](https://www.vstats.gg/agents) (sitenin kendi statik dosyaları `statistics/{bölüm}/ALL/{harita}/duo.json.gz`; Elmas+ rütbe grupları toplanır) |
| Yetenek etkileşimleri | [VALORANT Wiki](https://valorant.fandom.com) yetenek ve durum etkisi sayfaları, oyun içi açıklamalar (elle, `data/interactions.js`) |

Erişim engellenirse (403) oranlar atlanır, eski veri korunur; arayüz oranlar olmadan da çalışır. blitz.gg'de ikili ya da takım dizilimi verisi yok; tracker.gg ve metasrc Cloudflare engeline takılıyor, bu yüzden ikili oranlar vstats.gg'den.

## Güncelleme

```
node valorant/scripts/update.js          # olağan çalışma (~1 dk)
node valorant/scripts/update.js --full   # oyun verisini ve görselleri zorla yenile
```

- Oyun sürümü her çalışmada okunur; sürüm değiştiyse, veri 7 günden eskiyse ya da `--full` verilirse ajan/silah/harita verisi ve görseller yenilenir (`data/state.json` sayesinde değişmeyen görseller yeniden indirilmez).
- Oranlar ve yama notları her çalışmada okunur (blitz.gg'ye 9 istek, aralarında 2,5–3 sn bekleme).
- İkili oranları her çalışmada okunur: güncel bölümün kimliği valorant-api.com'dan, ardından vstats.gg'ye tüm haritalar için 1 + havuzdaki her harita için 1 istek (aralarında 2,5 sn). En az 300 çift ve 500.000 maç yoksa ya da oranlar %35–65 dışındaysa yazılmaz; okunamayan harita için eski veri kalır.
- Her adım sağlamlık kontrolünden geçer; geçemeyen veri yazılmaz, eskisi korunur ve çıkış kodu 1 olur.
- Dosyalar `data/*.js` (`window.VAL_*`) olarak sıralı anahtarlarla yazılır; veri değişmediyse git farkı oluşmaz.
- Önerilen sıklık: günde bir kez (yeni yama genellikle iki haftada bir salı günü gelir).

Hayran yapımıdır; Riot Games ile bağlantılı değildir.
