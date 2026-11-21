/* Rift Kontra · VALORANT — elle hazırlanmış yetenek etkileşimleri (update.js bu dosyaya dokunmaz)
 *
 * Kaynaklar: VALORANT Fandom Wiki yetenek ve durum etkisi sayfaları (Status Effect, Mobility, Immunity,
 * Interceptor etkileşim tablosu), resmi Türkçe yetenek açıklamaları (valorant-api.com) ve
 * playvalorant.com yama notları. Kontrol edilen sürüm: 13.10.
 *
 * Yapı
 *  tags   "ajan:tuş" → mekanik etiketleri. Kurallar bu etiketlerle eşleşir; bir etiket yalnızca
 *         yetenek gerçekten o etkiyi uyguluyorsa verilir.
 *  vs     Ajan VS kuralları: a = etkiyi yapan yeteneğin etiketi, b = karşı tarafın etkilenen yeteneği.
 *         t: engel (karşı yeteneği kapatır) · kontra (zayıflatır) · kacar (karşı yetenekten kurtulur) · ifsa (gösterir)
 *         s: önem 1–3. x: tek satırlık Türkçe açıklama.
 *  sp     Tek bir yetenek çiftine özel, doğrulanmış etkileşimler (kural metninin yerine geçmez, eklenir).
 *  duo    İkili kombo kuralları (aynı takım). b:"*" = herhangi bir ajan.
 *  tips   "Bu rakibe karşı" kısa oyun önerileri.
 *  roleVs Rakibin rolüne göre genel öneri (doğrudan etkileşim yoksa gösterilir).
 *  fresh  Çok yeni ajanlar: bilgi sınırlı, arayüz bunu açıkça söyler.
 */
window.VAL_IX = {
  patch: "13.10",

  tags: {
    "astra:Q": ["stun", "stunzone"], "astra:E": ["smoke"], "astra:C": ["pull", "vuln"], "astra:X": ["wallvis", "hsblock"],
    "breach:Q": ["flash"], "breach:E": ["stun", "stunzone"], "breach:C": ["dmg", "objdmg"], "breach:X": ["stun", "stunzone", "knock"],
    "brimstone:Q": ["dmg", "icpt"], "brimstone:E": ["smoke"], "brimstone:C": ["stim", "icpt"], "brimstone:X": ["dmg"],
    "chamber:Q": ["hitscan"], "chamber:E": ["tp", "trap", "icpt", "util"], "chamber:C": ["trap", "slow", "seeutil", "icpt", "util"], "chamber:X": ["hitscan", "scope", "slow"],
    "clove:Q": ["decay", "icpt"], "clove:E": ["smoke"], "clove:C": ["selfheal"], "clove:X": ["revive"],
    "cypher:Q": ["smoke", "icpt"], "cypher:E": ["reveal", "trap", "seeutil", "icpt", "util"], "cypher:C": ["trap", "slow", "reveal", "icpt", "util"], "cypher:X": ["reveal"],
    "deadlock:Q": ["stun", "trap", "icpt", "util"], "deadlock:C": ["slow", "icpt"], "deadlock:E": ["mesh", "icpt", "util"], "deadlock:X": ["detain", "beam", "icpt"],
    "fade:Q": ["tether", "deafen", "decay", "icpt"], "fade:E": ["reveal", "mark", "icpt"], "fade:C": ["near", "icpt"], "fade:X": ["deafen", "decay", "mark"],
    "gekko:Q": ["stun", "icpt"], "gekko:E": ["flash", "icpt"], "gekko:C": ["dmg", "icpt"], "gekko:X": ["detain", "icpt"],
    "harbor:Q": ["wallvis", "slow"], "harbor:E": ["smoke", "bulletblock", "util"], "harbor:C": ["near", "slow", "icpt"], "harbor:X": ["near", "slow"],
    "hush:Q": ["flash"], "hush:E": ["pull", "stun"],
    "iso:Q": ["vuln", "suppress"], "iso:E": ["shield1", "icpt"], "iso:C": ["wallvis", "bulletblock"], "iso:X": ["arena"],
    "jett:Q": ["dash"], "jett:E": ["dash"], "jett:C": ["smoke", "icpt"], "jett:X": ["hitscan"],
    "kayo:Q": ["flash", "icpt"], "kayo:E": ["suppress", "icpt"], "kayo:C": ["dmg", "icpt"], "kayo:X": ["suppress", "downed"],
    "killjoy:Q": ["trap", "vuln", "icpt", "util"], "killjoy:E": ["trap", "seeutil", "icpt", "util"], "killjoy:C": ["trap", "dmg", "icpt"], "killjoy:X": ["detain", "lock", "icpt"],
    "miks:Q": ["stimduo"], "miks:E": ["smoke"], "miks:C": ["stun", "stunzone", "heal"], "miks:X": ["knock", "slow", "deafen"],
    "neon:Q": ["stun", "stunzone", "icpt"], "neon:E": ["dash"], "neon:C": ["wallvis"], "neon:X": ["hitscan"],
    "omen:Q": ["near", "nearutil"], "omen:E": ["smoke"], "omen:C": ["tp"], "omen:X": ["tp"],
    "phoenix:E": ["dmg", "icpt"], "phoenix:Q": ["flash", "icpt"], "phoenix:C": ["wallvis", "dmg"], "phoenix:X": ["revive"],
    "raze:Q": ["dash", "icpt", "objdmg"], "raze:E": ["dmg", "icpt", "objdmg"], "raze:C": ["dmg", "icpt"], "raze:X": ["dmg", "icpt", "objdmg"],
    "reyna:Q": ["selfheal"], "reyna:E": ["intang"], "reyna:C": ["near", "icpt"], "reyna:X": [],
    "sage:Q": ["slow", "icpt"], "sage:E": ["heal"], "sage:C": ["block", "icpt", "util"], "sage:X": ["rez"],
    "skye:Q": ["stun", "icpt"], "skye:E": ["flash", "icpt"], "skye:C": ["heal"], "skye:X": ["near", "slow", "icpt"],
    "sova:Q": ["dmg", "icpt", "objdmg"], "sova:E": ["reveal", "icpt"], "sova:C": ["reveal", "icpt"], "sova:X": ["dmg", "reveal", "pierce", "objdmg"],
    "tejo:Q": ["stun", "stunzone", "dmg", "icpt"], "tejo:E": ["dmg", "icpt"], "tejo:C": ["reveal", "suppress", "icpt"], "tejo:X": ["dmg"],
    "veto:Q": ["tether", "deafen", "decay", "icpt"], "veto:E": ["antiutil", "icpt", "util"], "veto:C": ["tp", "icpt"], "veto:X": ["immune"],
    "viper:Q": ["smoke", "decay", "icpt"], "viper:E": ["wallvis", "decay"], "viper:C": ["vuln", "dmg", "icpt"], "viper:X": ["smoke", "decay"],
    "vyse:Q": ["block", "trap"], "vyse:E": ["flash", "trap", "icpt", "util"], "vyse:C": ["slow", "dmg", "trap", "icpt", "util"], "vyse:X": ["jam"],
    "waylay:Q": ["dash"], "waylay:E": ["intang"], "waylay:C": ["hinder", "icpt"], "waylay:X": ["hinder"],
    "yoru:Q": ["flash", "icpt"], "yoru:E": ["tp", "icpt"], "yoru:C": ["flash"], "yoru:X": ["intang"]
  },

  vs: [
    { id: "sup-trap", a: ["suppress"], b: ["trap"], t: "engel", s: 3, x: "Bastırılan Gözcü'nün kurulu tuzak ve kameraları bastırma bitene dek kapanır, yerleri görünür." },
    { id: "sup-move", a: ["suppress"], b: ["dash", "tp", "intang", "selfheal"], t: "engel", s: 3, x: "Bastırılan rakip yetenek kullanamaz: kaçış ya da iyileşme yolu birkaç saniye kapanır. Başlamış ışınlanmayı kesmez." },
    { id: "arena", a: ["arena"], b: ["dash", "tp", "intang", "selfheal", "trap"], t: "engel", s: 2, x: "Düello arenasında ikiniz de bastırılırsınız; bu yetenek işe yaramaz, sonucu silah belirler." },
    { id: "tether-dash", a: ["tether"], b: ["dash"], t: "engel", s: 3, x: "Bağlanan oyuncu atılarak kaçamaz; bağı yalnızca ışınlanma kırar." },
    { id: "tp-tether", a: ["tp"], b: ["tether"], t: "kacar", s: 3, x: "Işınlanma bağlamayı kırar: bağlanınca ışınlanarak çık." },
    { id: "slow-dash", a: ["slow", "stun", "hinder"], b: ["dash"], t: "kontra", s: 2, x: "Yavaşlatma (sersemletme ve ağırlaştırma da yavaşlatır) atılma hızını ve zıplamayı düşürür; alandan atılarak kaçmak zorlaşır." },
    { id: "tp-wall", a: ["tp"], b: ["mesh", "block"], t: "kacar", s: 1, x: "Işınlanma duvarın ya da ağın arkasına doğrudan geçirir." },
    { id: "objdmg-util", a: ["objdmg"], b: ["util"], t: "engel", s: 2, x: "Bu yetenek hasarı kurulu teçhizata da işler; girişten önce tuzakları ve duvarı kırabilir." },
    { id: "mesh-dash", a: ["mesh"], b: ["dash"], t: "engel", s: 2, x: "Bariyer Ağı'ndan ajan geçemez; atılmayla aşılmaz, düğümü kırmak gerekir." },
    { id: "intang-mesh", a: ["intang"], b: ["mesh"], t: "kacar", s: 1, x: "Dokunulmazken yarı saydam Bariyer Ağı'nın içinden geçebilirsin." },
    { id: "intang-cc", a: ["intang"], b: ["stun", "detain", "tether", "flash", "near", "slow", "hinder", "vuln", "suppress", "decay", "dmg"], t: "kacar", s: 2, x: "Dokunulmazken etkilere ve hasara bağışıksın; doğru anda kullanırsan bu yetenek seni tutmaz." },
    { id: "immune", a: ["immune"], b: ["flash", "near", "stun", "tether", "detain", "slow", "hinder", "vuln", "suppress", "decay", "deafen", "jam", "dmg"], t: "kacar", s: 3, x: "Evrim'deyken zayıflatmalara ve yetenek hasarına bağışık; yalnızca silahlar ve anlık isabetli yetenek silahları işler." },
    { id: "hitscan-immune", a: ["hitscan"], b: ["immune"], t: "kontra", s: 3, x: "Anlık isabetli yetenek silahı Evrim bağışıklığını aşar, silah gibi hasar verir." },
    { id: "intercept", a: ["antiutil"], b: ["icpt"], t: "engel", s: 3, x: "Tehditsavar menzildeki bu teçhizatı vurup yok eder (9 sn, 18 m). Bazıları yalnızca fırlatılırken ya da görünürken vurulur." },
    { id: "stun-scope", a: ["stun"], b: ["scope"], t: "kontra", s: 2, x: "Sersemleyen oyuncu dürbün ve nişan kullanamaz." },
    { id: "move-lock", a: ["dash", "tp"], b: ["lock"], t: "kacar", s: 2, x: "Tecrit 13 sn'de dolar; dolmadan alanın dışına çık ya da cihazı vur." },
    { id: "dash-beam", a: ["dash"], b: ["beam"], t: "kacar", s: 2, x: "Kıskıvrak 0,5 sn hazırlanıp düz bir hatta uçar; sesini duyunca hattan atıl. Koza yakalarsa yetenek kullanamazsın." },
    { id: "dash-stunzone", a: ["dash"], b: ["stunzone"], t: "kacar", s: 1, x: "Sersemletme alanı kısa bir hazırlıktan sonra patlar; işareti görünce atılarak çık." },
    { id: "para-util", a: ["nearutil"], b: ["seeutil"], t: "kontra", s: 2, x: "Paranoya görüşü olan kurulu yetenekleri de miyop eder; tareti ve kamerayı kısa süre kör bırakır." },
    { id: "hs-jam", a: ["hitscan"], b: ["jam"], t: "kacar", s: 2, x: "Çelik Bahçesi yalnızca birincil silahları kilitler; yetenek silahın ateşlenmeye devam eder." },
    { id: "wall-hs", a: ["hsblock"], b: ["hitscan"], t: "engel", s: 2, x: "Kozmik Ayrım mermiyi ve anlık isabetli yetenekleri geçirmez." },
    { id: "dmg-shield", a: ["dmg"], b: ["shield1"], t: "kontra", s: 1, x: "Çelik İrade kalkanı ilk hasar anında kırılır; yetenek hasarıyla önce kalkanı harcat." },
    { id: "tp-mark", a: ["tp"], b: ["mark"], t: "kacar", s: 1, x: "Dehşet İzi ışınlanmayı takip etmez; ışınlanınca iz kopar." }
  ],

  sp: [
    { a: "yoru:C", b: "vyse:Q", t: "engel", s: 3, x: "Fake At klonu Dikenli Çit'i tetikler; duvarı klonla boşa harcat." },
    { a: "viper:X", b: "sova:E", t: "kontra", s: 2, x: "İn'in içine düşen Keşif Oku miyop olur, yalnızca çok yakını görür." },
    { a: "viper:X", b: "chamber:C", t: "kontra", s: 2, x: "İn'in içindeki Kartvizit miyop olur, uzaktaki hedefi görmez." },
    { a: "sova:X", b: "viper:X", t: "ifsa", s: 3, x: "Avcının Hiddeti duvar ve dumanı deler; İn'deki Viper'ı vurur ve gösterir." },
    { a: "veto:E", b: "deadlock:X", t: "engel", s: 3, x: "Tehditsavar kozayı da vurur: yakalanan arkadaşın kurtulur." }
  ],

  duo: [
    { id: "vuln-dmg", a: ["vuln"], b: ["dmg"], s: 12, x: "Kırılgan hedef tüm hasarı iki kat alır; arkasından gelen alan hasarı katlanır." },
    { id: "hold-dmg", a: ["tether", "stun", "detain", "slow", "hinder", "pull"], b: ["dmg"], s: 8, x: "Tutulan ya da yavaşlayan hedef alan hasarından kaçamaz." },
    { id: "blind-entry", a: ["flash", "near", "stun", "suppress"], b: ["dash", "tp"], s: 7, x: "Önce kör et ya da sersemlet, ardından hemen içeri gir." },
    { id: "reveal-dmg", a: ["reveal"], b: ["dmg", "pierce"], s: 6, x: "Gösterilen hedefe siper arkasından yetenek hasarı." },
    { id: "reveal-entry", a: ["reveal"], b: ["dash", "tp"], s: 4, x: "Rakibin yerini gördükten sonra giriş." },
    { id: "smoke-entry", a: ["smoke"], b: ["dash", "tp"], s: 3, x: "Duman görüşü keserken hızlı giriş." },
    { id: "harmony", a: ["stimduo"], b: "*", s: 10, x: "Armoni ikinize de kuvvetli savaş ve hız verir; ikiniz de hayattayken skor alınca yenilenir." },
    { id: "stim", a: ["stim"], b: "*", s: 5, x: "Kuvvet İşareti alanında %10 ateş ve hareket hızı." },
    { id: "heal", a: ["heal"], b: "*", s: 4, x: "Düellodan sonra arkadaşını iyileştir." },
    { id: "rez", a: ["rez"], b: "*", s: 5, x: "Diriliş arkadaşını tam canla geri getirir." },
    { id: "downed", a: ["downed"], b: "*", s: 3, x: "İPTAL/Komut'ta düşen KAY/O'yu arkadaşı kaldırabilir." }
  ],

  tips: {
    astra: ["Yerçekimi Kuyusu'nun çekişine ters yöne yürüyerek direnebilirsin; patlamada içinde kalırsan 2,5 sn kırılgan olursun.", "Kozmik Ayrım mermiyi ve sesi keser, yetenekler geçer: duvar arkasına yetenekle baskı yap."],
    breach: ["Yetenekleri duvarın arkasından gelir; Fay Hattı'nın alanını görünce çık.", "Sersemleyince dürbün kullanılamaz; Operator tutuyorsan sersemledikten sonra açıdan çekil."],
    brimstone: ["Gökten Duman ve Uydu Saldırısı düşeceği yerde önceden görünür; işareti görünce yer değiştir.", "Kuvvet İşareti yalnızca onun takımını güçlendirir (%10 ateş ve hareket hızı)."],
    chamber: ["Buluşma alanındayken ceketi altın rengine döner: ışınlanmaya hazır demektir.", "Işınlanma iki noktada da ses verir; kaçtığı yere sesten yönel.", "Kartvizit ve Buluşma görünür ve kırılabilir; Chamber ölünce ya da bastırılınca kapanır."],
    clove: ["Öldükten sonra da bir kez kısa duman (6 sn) atabilir; ölümünden sonra dumana hazırlıklı ol.", "Daha Ölmedik ile dirilince skor ya da hasar asisti almazsa ölür: dirilince ona hasar fırsatı verme."],
    cypher: ["Kurulu kamera 8 m'ye yaklaşınca görünür; kullanılırken 12 m'den sesi duyulur.", "İşaret dartını kanal açarak çıkarabilirsin.", "Cypher ölünce ya da bastırılınca tuzakları ve kamerası kapanır, yerleri görünür."],
    deadlock: ["Sonik Sensör koşma, zıplama, ateş ve doldurma sesine tepki verir; yürüyerek ya da çömelerek geç.", "Kıskıvrak kozasını (600 can) 7 sn dolmadan vurup kırarsan arkadaşın kurtulur.", "Bariyer Ağı'ndan mermi ve yetenek geçer, ajan geçmez; ortadaki büyük düğüm kırılınca tüm duvarlar düşer."],
    fade: ["Musallat ve Ecel kırılabilir; yere iner inmez vur.", "Dehşet İzi ışınlanmayı takip etmez.", "Gece Karanlığı 8 sn sağırlaştırır ve canını çürütür; dalgadan hemen sonra savaşa girme."],
    gekko: ["Şaşkın'ın plazma körlüğü arkanı dönsen de işler; görünce vur ya da siper al.", "Kankuş, Şaşkın ve Zorba vurulup yok edilebilir.", "Görevi biten yetenek yerde küreye döner; Gekko almak için o noktaya dönmek zorunda."],
    harbor: ["Dalgakıran kalkanlıyken mermi geçmez, yetenek geçer.", "Kaynama Noktası çarptığı herkesi miyop eder ve yavaşlatır; dalganın önünden çekil."],
    hush: ["Yeni ajan: Flaş Parıltısı havada yön değiştirebilir; Yerinden Et merkeze çeker, bir yüzeye ya da oyuncuya çarparsan sersemletir."],
    iso: ["Çelik İrade kalkanı ilk hasarda kırılır; önce tek bir vuruşla kalkanı harcat.", "Ölen rakiplerden çıkan enerji küresini sen vurursan kalkanını yenileyemez.", "B Planı duvarı mermi geçirmez, yetenek geçirir."],
    jett: ["Rüzgâr Gibi önce hazırlanır (bacaklarında rüzgâr görünür), sonra atılır; hazırlığı görürsen kaçacağını bil.", "Atılma her iki skorda bir yenilenir.", "Yavaşlatma atılmayı kısaltır, bağlama tamamen engeller."],
    kayo: ["İPTAL/Komut'ta öldürülünce yere düşer, arkadaşları kaldırabilir: düşen KAY/O'yu bitir.", "SIFIR/Noktası bıçağını kurulurken vurup yok edebilirsin.", "Bıçak bastırılanların kimliğini gösterir, yerini göstermez."],
    killjoy: ["Taret ve botlar Killjoy uzaklaşınca, ölünce ya da bastırılınca kapanır.", "Tecrit 13 sn'de dolar; cihazı vur ya da alanın dışına çık.", "Alarm Botu patlarsa iki kat hasar alırsın; yaklaşırken vur."],
    miks: ["M Patlaması iyileştirme modundayken menzildeki herkesi, seni de iyileştirir.", "Armoni bir arkadaşını da güçlendirir ve skorla yenilenir: önce güçlenen ikiliden birini düşür.", "Bas Depremi geri iter, sağırlaştırır ve yavaşlatır; koninin dışına çık."],
    neon: ["Yüksek Devir'deyken silah tutamaz; koşu sesi ve parlayan izleri belli olur.", "Elektro Ok kısa bir hazırlıktan sonra patlar; alanını görünce çık.", "Enerji Patlaması'nda havadayken ışını isabetsizleşir."],
    omen: ["Gölgelerin İçinden'de gölgeyi tek mermiyle vur: ışınlanma iptal olur, eski yerine döner.", "Gizli Adım öncesinde ses verir; ses geldiyse yer değiştirecek demektir.", "Paranoya duvarlardan geçer ve kurulu yetenekleri de miyop eder."],
    phoenix: ["Yakardöner'de ölürse işaret bıraktığı yerde tam canla döner; işaretin yerini aklında tut.", "Falso köşeden kıvrılarak gelir; parlamayı görünce arkanı dön."],
    raze: ["Bombot rakip görünce yüksek ses çıkarır; vurup yok et.", "Patlayıcı Çanta havadayken yavaşlatılırsa daha az uçar.", "Nefes Kesen kurulu yeteneklere fazladan hasar verir."],
    reyna: ["Sömür ve Azlet için ruh küresi gerekir; ilk düelloyu ona verme.", "Azlet 1,5 sn sürer; bitince çıkacağı yeri bekle.", "Sömür'le gelen fazla can 10 sn sürer; İmparatoriçe'de Azlet onu görünmez yapar."],
    sage: ["Diriliş'te yükselen arkadaşı kristal içinde hasar almaz; kalkıp yere indiği anda vur.", "Bariyer bölümleri kırılabilir ve 2 sn sonra güçlenir; kıracaksan hemen kır.", "Yavaşlatan Küre atılma hızını yarıya indirir."],
    skye: ["Kılavuz Işık ne kadar uzun uçarsa flaş o kadar uzun sürer.", "Av Peşinde'yi sürerken Skye'ın bedeni savunmasız; hasar alınca kontrol biter.", "İzsürenler'i vurup yok edebilirsin."],
    sova: ["Keşif Oku ve Baykuş Dron vurulup yok edilebilir.", "Dronu sürerken Sova'nın bedeni savunmasız; hasar alınca dron biter.", "Avcının Hiddeti duvarları deler; atış hattından çık."],
    tejo: ["Gizli Dron yakına gelince görünür; zıplarsa 16 m'deki görüş hattındakileri gösterir ve bastırır.", "Özel Teslimat yapıştığı yerde kısa gecikmeyle patlar; yapıştığı yerden uzaklaş."],
    veto: ["Darboğaz bağlar, sağırlaştırır ve canı çürütür; bağı yalnızca ışınlanma kırar.", "Evrim'deyken yeteneklerin işlemez: onu silahla düşür.", "Tehditsavar beklerken ses verir; kırmadan değerli yetenek atma."],
    viper: ["Yılan Isırığı iki kat hasar aldırır; içinde savaşma.", "Viper'ın İni'nde Viper seni kırmızı çizgiyle görür, mini haritan kapanır.", "Yakıtı biterse duman ve perde düşer; uzun süre açık kalamaz."],
    vyse: ["Tuzakları yaklaşınca görünür; Vyse ölünce ya da bastırılınca kapanır.", "Çelik Bahçesi yalnızca birincil silahı kilitler; tabancana geç.", "Ark Gülü flaş hazırlığına girince kırılabilir."],
    waylay: ["Kırılma'da işaret bıraktığı yere döner ve yolda dokunulmazdır; dönüş noktasını bekle.", "Tutulma ve Yakınsayan Işınlar ağırlaştırır: hareket, ateş ve doldurma yavaşlar."],
    yoru: ["Fake At klonunu vurursan döner ve flaşlar; vurma ya da arkanı dön.", "Çatkapı sahte ışınlanma da yapabilir; yerde iz kaldıysa sahtedir.", "Boyutlararası Geçiş'te seni gördüğünde ekranının kenarında iz belirir."]
  },

  roleVs: {
    assault: "İlk girişi o yapar: açını geniş tut, kaçış yeteneğini harcatınca vur.",
    breaker: "Bilgi ve flaşını takımı girmeden hemen önce kullanır; yetenek sesini duyunca açıdan çekil, sonra yeniden tut.",
    strategist: "Dumanların süresi sınırlıdır; dumanın içine körlemesine girme, dağılma anını bekle.",
    sentinel: "Kurulumlarını ezberle: tuzakları önceden kır ya da bastır, yan geçişe dikkat et."
  },

  fresh: {
    hush: "13.09 yamasıyla geldi. Kesin etkileşim bilgisi henüz az; yalnızca resmi yetenek açıklamalarından çıkan etkiler gösteriliyor."
  }
};
