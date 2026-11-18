# Rift Kontra · VALORANT

VALORANT için Türkçe 1v1 düello hesaplayıcı, ajan ve silah rehberi. Wild Rift sürümüyle (`../wr/`) aynı tasarım dilini kullanır.

## Ekranlar

- **Düello** (ana sayfa): iki taraf için ajan, silah, kalkan ve nişan profili; ortada mesafe. Kazanma şansı, öldürme süresi, gereken mermi, ilk mermide öldürme olasılığı; değişikliklerin puan etkisi; "Dövüştür" ile rastgele bir çatışmanın atış atış tekrarı; bu rakibe ve mesafeye karşı en iyi silahlar (bütçe filtresiyle); mesafeye göre şans.
- **Ajanlar**: role ya da kademeye göre ızgara, harita filtresi. Profil: Yetenekler · Haritalar · Oynanış.
- **Cephanelik**: silahlar (fiyat, atış hızı, şarjör, menzile göre hasar, kaç mermi tablosu), kalkanlar ve Haritalar sekmesi (rekabetçi havuz, saldırı/savunma dengesi, en çok kazandıran ajanlar).
- **Yama**: son üç resmi Türkçe yama notundan değişen ajan, silah ve haritalar; eski → yeni değerler.

## Düello modeli

Monte Carlo simülasyonu (1.600 deneme, sabit tohum; aynı ayarlar hep aynı sonucu verir). Her mermi için isabet (silahın ilk mermi sapması + nişan profilinin hata açısı + mesafe), vücut bölgesi (kafa oranı profilden, uzaklık ve sprey ile azalır; isabetlerin %15'i bacak), menzile göre hasar ve kalkan emilimi (%66 / Yenilenen Kalkan %100, 25 puan) hesaplanır. Otomatik silahlarda 15–30 m'de 4'lü, 30–50 m'de 2'li seri atış; nişan alan silahlarda nişan alma süresi ve büyütme. Yetenekler: flaş (rakip ≈0,45 sn geç ateş eder), sersemletme (rakip ilk 2 sn isabetsiz), Iso kalkanı (ilk isabet engellenir), Kuvvetli Savaş (≈%10 atış hızı).

Hesaba katılmayanlar: hareket, siper, ses, ping/peeker avantajı, gerçek geri tepme desenleri, yetenek hasarları ve iyileştirmeler.

## Veri kaynakları

| Veri | Kaynak |
| --- | --- |
| Ajanlar, yetenekler, roller, silahlar, kalkanlar, haritalar, görseller (tr-TR) | [valorant-api.com](https://valorant-api.com) |
| Yama değişiklikleri | [playvalorant.com/tr-tr](https://playvalorant.com/tr-tr/news/tags/patch-notes/) resmi Türkçe yama notları |
| Ajan kazanma/seçilme oranları, harita bazlı oranlar, rekabetçi harita havuzu | [blitz.gg](https://blitz.gg/valorant/stats/agents) (Rekabetçi, Elmas+, güncel bölüm) |

Erişim engellenirse (403) oranlar atlanır, eski veri korunur; arayüz oranlar olmadan da çalışır.

## Güncelleme

```
node valorant/scripts/update.js          # olağan çalışma (~30 sn)
node valorant/scripts/update.js --full   # oyun verisini ve görselleri zorla yenile
```

- Oyun sürümü her çalışmada okunur; sürüm değiştiyse, veri 7 günden eskiyse ya da `--full` verilirse ajan/silah/harita verisi ve görseller yenilenir (`data/state.json` sayesinde değişmeyen görseller yeniden indirilmez).
- Oranlar ve yama notları her çalışmada okunur (blitz.gg'ye 9 istek, aralarında 2,5–3 sn bekleme).
- Her adım sağlamlık kontrolünden geçer; geçemeyen veri yazılmaz, eskisi korunur ve çıkış kodu 1 olur.
- Dosyalar `data/*.js` (`window.VAL_*`) olarak sıralı anahtarlarla yazılır; veri değişmediyse git farkı oluşmaz.
- Önerilen sıklık: günde bir kez (yeni yama genellikle iki haftada bir salı günü gelir).

Hayran yapımıdır; Riot Games ile bağlantılı değildir.
