# KONDES v9 Mimari Tasarım

## Winnice’ten doğrulanabilen ürün sinyalleri

Winnice, App Store kaydında cam balkon sistemleri için bir **kesim ölçüsü hesaplama programı** olarak konumlanıyor ve iPhone/iPad üzerinde çalışıyor [1]. Google Play kaydı da ürünü cam balkon sistemleri hesaplama programı olarak tanımlıyor; ayrıca son sürüm notlarında hata mesajları ve servis katmanı iyileştirmeleri yer alıyor [2]. Bu iki sinyal, KONDES’in yalnızca teklif PDF’i üreten bir araç değil, sahada hızlı ve hataya dayanıklı ölçü-hesaplama ürünü olması gerektiğini gösteriyor.

App Store kaydındaki kullanıcı yorumu telefon üzerinden tüm işlemlerin yapılabildiğini belirtiyor; bu ifade resmi teknik özellik değildir, fakat mobil-first kullanım beklentisini destekleyen kullanıcı geri bildirimidir [1]. Winnice kaynaklarında ayrıntılı fiyat motoru, CRM, bulut senkronizasyonu veya çoklu teklif mimarisi açıkça belgelenmediği için bunlar Winnice özelliği olarak değil, KONDES’in farklılaşma hedefi olarak ele alınmalıdır.

## Önerilen mimari

### 1. Domain katmanı

`MeasurementSet`, `QuoteItem`, `PricingSnapshot`, `Quote` ve `Customer` ayrı veri modelleri olmalı. Hesap motoru DOM’dan bağımsız saf fonksiyonlar hâline getirilmeli. Böylece aynı metrikler mobil arayüz, PDF, WhatsApp ve ileride API tarafından ortak kullanılabilir.

Her teklif kaydedilirken sistem, cam, motor, profil, KDV, kâr ve iskonto değerlerini **snapshot** olarak saklamalı. Ayar sonradan değişse bile eski teklifin tutarı değişmemeli.

### 2. Uygulama katmanı

İş akışı şu sırayı izlemeli:

1. Müşteri ve proje oluştur.
2. Sistem/ürün seç.
3. Ölçüleri doğrula.
4. Kesim ve fiyat hesabını çalıştır.
5. Alternatif teklifleri karşılaştır.
6. Teklif snapshot’ını kaydet.
7. PDF/WhatsApp çıktısı üret.
8. Teklif durumunu takip et: taslak, gönderildi, onaylandı, sipariş, montaj, tamamlandı.

### 3. Veri ve kalıcılık katmanı

İlk aşamada mevcut yerel sunucu korunabilir; fakat dosyaya doğrudan yazmak yerine doğrulama, atomik yazım, otomatik yedek ve sürüm bilgisi kullanılmalı. İkinci aşamada SQLite veya yönetilen bir API katmanı eklenmeli. `localStorage` yalnızca çevrimdışı geçici cache olmalı; tek kalıcı kaynak olmamalı.

### 4. Arayüz katmanı

Masaüstü iki kolon görünümü korunurken mobilde tek kolon ve büyük dokunmatik kontroller kullanılmalı. Ölçü girişi ayrı bir “saha modu” olmalı: minimum metin, büyük rakam alanları, son satırı çoğaltma, fotoğraf ekleme, hızlı sistem preset’leri ve anında hata mesajı.

### 5. Güvenlik ve güvenilirlik

Yerel servis yalnızca loopback adresinde dinlemeli. İstek gövdesi sınırlandırılmalı, JSON şeması doğrulanmalı, dosya yolu normalleştirilmeli, path traversal engellenmeli, yazma işlemleri geçici dosyaya yapılıp atomik taşınmalı. İleride bulut API’ye geçildiğinde kullanıcı kimliği, rol yetkisi, TLS, audit log ve şifreli yedek eklenmeli.

## Bu geçişte uygulanan kod değişiklikleri

- Genişlik ve yükseklik alanlarına `1–100000 mm` sınırı eklendi.
- Müşteri adı, ölçü, cam sayısı ve satış fiyatı için kayıt/gönderim/PDF öncesi doğrulama eklendi.
- Hatalar aksiyon alanında görünür, erişilebilir bir uyarı bölmesinde gösteriliyor.
- Geçersiz pozitif olmayan ölçüler hesap motorunda alanı sıfırlıyor ve kayıt engelleniyor.
- Sunucu çalışmıyorsa daha önce kaydedilmiş localStorage cache’i HTTP modunda da yükleniyor.
- `/api/ping` başarısız HTTP durumu artık çevrimdışı olarak işaretleniyor.
- PowerShell sunucusunda path traversal, boş/büyük gövde, bozuk JSON ve geçersiz temel şema kontrolleri eklendi.
- Ayar, teklif ve logo yazımları atomik hâle getirildi; önceki dosya yedekleniyor.
- Logo için veri türü ve 2 MB boyut sınırı eklendi.

## v10 web modülleri

### Görsel tasarım motoru

Yeni tasarımcı üçüncü parti 3D kütüphaneye ihtiyaç duymadan Canvas 2D üzerinde perspektifli bir balkon sahnesi çizer. Kullanıcı sistem, genişlik, yükseklik, kanat sayısı, açılım yönü, profil rengi ve cam rengini değiştirir; sürükleme ile yatay/dikey perspektifi ayarlar. “Teklife Aktar” seçimi ilk teklif kaleminin ölçü, profil, cam ve kanat değerlerini günceller.

Bu ilk sürüm gerçek üretim geometrisi veya fotogerçekçi render değildir. Üretim doğruluğu için sonraki aşamada profil kütüphanesi, bağlantı noktaları, kesim listesi ve WebGL/Three.js tabanlı parametrik model eklenmelidir.

### Raporlama paneli

Rapor paneli mevcut teklif geçmişinden müşteri özeti, teklif sayısı, toplam satış, alan, maliyet ve tahmini net kâr KPI’larını üretir. Müşteri/proje/sipariş araması, müşteri varlığı filtresi ve tutar/müşteri/tarih sıralaması vardır. Maliyetler mevcut fiyat motorundan yeniden hesaplanır; bu nedenle fiyat snapshot modeli tamamlanana kadar geçmiş teklifler için “tahmini” olarak etiketlenmelidir.

Rapor paneli ayrı bir veri kaynağı oluşturmaz. Aynı `SAVED_QUOTES` koleksiyonunu okur; böylece müşteri yönetimi ve geçmiş teklif ekranı arasında veri tutarsızlığı oluşmaz. Kalıcı çok kullanıcılı müşteri yönetimi için sonraki adım `Customer` ve `Quote` tablolarını SQLite/API katmanına taşımaktır.

## Sonraki geliştirme sırası

1. Saf hesap motoru ve snapshot veri modelini HTML’den ayır.
2. Mobil saha ölçüm ekranını oluştur.
3. Üç alternatifli teklif ve iskonto senaryolarını ekle.
4. Fotoğraf, teknik çizim ve müşteri geçmişini teklife bağla.
5. SQLite/API kalıcılığı ve rol tabanlı erişime geç.
6. Android/iOS PWA veya native istemciyi aynı domain katmanına bağla.

## References

[1]: https://apps.apple.com/tr/app/winnice-cam-balkon/id6504556693?l=tr "Winnice Cam Balkon — App Store"

[2]: https://play.google.com/store/apps/details?id=com.cammetalapp.winnice&hl=en_US "Winnice Cam Balkon — Google Play"
