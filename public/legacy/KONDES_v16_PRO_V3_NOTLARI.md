# KON-DES METAL — v16 Pro v3 (Hardening Build)

## Kendi tespitlerim ve uygulanan düzeltmeler

### Kayıt kimliği ve sipariş kodu
- Teklifler için kalıcı `id` birincil anahtar olarak kullanılır; sipariş kodu yalnızca kullanıcıya görünen iş kodudur.
- Formdan yüklenen teklifin `ACTIVE_QUOTE_ID` değeri korunur. Aynı teklif tekrar kaydedildiğinde aynı ID güncellenir.
- Farklı ID ile aynı sipariş kodu kullanılırsa kod otomatik olarak yeni ve boş bir sipariş koduna çevrilir; mevcut müşteri kaydı korunur.
- Provizyon/onay geçişleri sipariş kodu ile değil teklif ID'si ile yapılır.
- Eski tekliflere açılışta ID migrasyonu uygulanır.
- Teklif güncelleme zamanı `updatedAt` ile tutulur; tarayıcı ve sunucu kopyaları birleştirilirken aynı ID için daha yeni zaman damgası tercih edilir.

### Provizyon ve CRM
- Provizyon teklifleri `provizyon.js` dosyasına ve `KONDES_PROVISION_QUOTES_V16` tarayıcı önbelleğine yazılır.
- Provizyondaki kayıtlar `SAVED_QUOTES` içinde tutulmaz; CRM ve satış raporlarına dahil edilmez.
- Onaylama aynı teklif ID'sini korur, onay zamanını kaydeder ve CRM senkronizasyonunu tetikler.
- CRM bağlantısı teklif üzerindeki `crmCustomerId` alanıyla kurulur. Aynı isimli fakat farklı telefonlu müşteriler birleştirilmez; tahsilat ve borç toplamı müşteri kimliği üzerinden hesaplanır.
- CRM tahsilat silme işlemi onaydan sonra tahsilatı Silinenler arşivine taşır; geri yüklenebilir.

### Silinenler ve yedekleme
- Teklif, provizyon, CRM tahsilatı, sistem satırı, teklif kalemi, ölçü satırı, 3D manuel ölçü satırı ve 3D görsel kaldırma işlemlerinde onay akışı bulunur.
- Teklif ve tahsilat kayıtları çöp kutusunda `deletedAt` zaman damgasıyla saklanır.
- Eksik olan `silinenler.js` ve `provizyon.js` veri dosyaları oluşturuldu ve HTML'e bağlandı.
- Sunucu her veri yazımından önce tam sistem JSON anlık görüntüsü alır.
- `yedekler/` klasöründe tam sistem JSON yedekleri ve dosya bazlı `.bak` yedekleri tutulur.
- Son 80 tam sistem anlık görüntüsü ve dosya başına son 40 `.bak` yedeği korunur.
- Sunucu yedekleri listelenebilir, indirilebilir; tam sistem JSON yedeği geri yüklenebilir.
- Sunucu yedeğine dönüşte tarayıcı cache anahtarları temizlenir; eski localStorage kopyasının geri yüklenen sunucu verisinin üzerine yazması engellenir.
- Tam JSON dışa aktarma CRM ve logoyu da dahil eder.

### Arayüz, mobil ve yazdırma
- Menü tek bir yüzen Liquid Glass kontrol adası olarak kalır; tema anahtarı aynı kapsül menünün içindedir.
- Dark mode için form, tablo, modal ve kart kontrastları güçlendirildi.
- Dar ekranlarda menü 2 sütunlu düzenle taşma yapmayacak şekilde yeniden akar.
- Yazdırma sırasında navigasyon ve modal katmanları gizlenir; A4 içerik beyaz zemin/yüksek kontrast ile basılır.
- 3D görseli teklif kaydına `threeDSnapshot` alanıyla dahil edilir; mevcut teklif açıldığında geri yüklenir ve kaldırma işlemi kayda gerçekten null olarak yazılır. Görsel JPEG kalite 0.84 ile saklanır; büyük veri gövdesi riski azaltılır.
- Hareket azaltma tercihi olan sistemlerde animasyonlar azaltılır.

## Dosya mimarisi
- `Teklif_Hazirla.html`: arayüz ve uygulama mantığı
- `server.ps1`: localhost:8765 HTTP sunucusu, atomik dosya yazımı, dosya yedekleri ve tam sistem snapshot/restore API
- `ayarlar.js`, `teklifler.js`, `crm.js`: mevcut veri dosyaları
- `provizyon.js`: sunucu tarafı provizyon kayıtları
- `silinenler.js`: sunucu tarafı çöp kutusu kayıtları
- `yedekler/`: otomatik yedeklerin tutulduğu klasör
- `libs/three.min.js`, `logo.png`: mevcut bağımlılıklar ve marka görseli

## Kurulum
1. Mevcut proje klasörünün tamamını ayrıca yedekleyin.
2. ZIP'i yeni ve boş bir klasöre çıkarın. Eski klasörün üzerine doğrudan yazmayın.
3. `Baslat.bat` dosyasını çalıştırın.
4. Uygulamayı `http://127.0.0.1:8765/Teklif_Hazirla.html` üzerinden açın.
5. Eski kullanıcı verilerinin bulunduğu bilgisayarda tarayıcı cache'i ve sunucu dosyaları ilk açılışta birleştirilir. İlk testte eski v15 klasörünü silmeyin.
6. Önce bir tam JSON yedeği indirin; ardından teklif ekleme, aynı kod çakışması, provizyon/onay, tahsilat silme/geri yükleme ve sunucu yedeğine dönüş testlerini yapın.

## Test ve doğrulama durumu
- HTML içindeki JavaScript, Node.js `--check` ile sözdizimi kontrolünden geçirildi.
- Teklif kaydetme fonksiyonu için izole davranış testleri geçti: başka müşteri kaydının ezilmemesi, aynı ID güncellemesi ve provizyonun onaylı tekliflerden ayrı kalması.
- Sipariş kodu çakışması için payload fonksiyonu testi geçti.
- HTML ID tekrar kontrolü temiz; silme aksiyonlarının listesi incelendi.
- Bu çalışma ortamında Windows PowerShell 5.1 çalıştırılamadığı ve tarayıcı başlatma denemeleri yönetici politikasıyla engellendiği için gerçek Windows HTTP sunucusu ve görsel/3D/A4 uçtan uca testi yapılamadı. Bu nedenle bu paket kapsamlı statik ve izole testlerden geçmiş bir **aday üretim sürümüdür**; canlı kullanım öncesi Windows üzerinde aşağıdaki kabul testleri tamamlanmalıdır.

## Canlıya alma kabul testleri
- Windows PowerShell 5.1 üzerinde `Baslat.bat` ve `server.ps1` başlatma.
- Teklif oluşturma → kaydetme → kapat/aç → verinin korunması.
- Aynı sipariş kodunu farklı müşteriyle kaydetme → eski teklifin korunması ve yeni kod üretilmesi.
- Provizyon kaydetme → CRM borç toplamının değişmemesi.
- Provizyon onaylama → onaylı listede ve CRM'de tek kez görünmesi.
- CRM tahsilatı silme → Silinenler'e taşıma → geri yükleme.
- Tam JSON dışa aktarma → temiz tarayıcı önbelleğinde içe aktarma.
- Sunucu snapshot'ı indirme ve geri yükleme → sayfa yenilendikten sonra doğru veri.
- Light/Dark mod, mobil genişlik, A4 teklif çıktısı ve Teknik PDF kontrolü.
