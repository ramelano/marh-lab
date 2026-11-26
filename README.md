# MARH-LAB SaaS Platform v5

Crafted & Engineered by **ramelano** • MARH-LAB SaaS Architecture

## Hızlı Çalıştırma (Windows)
1. Klasör içindeki **`Baslat_MARH_LAB.bat`** dosyasına çift tıklayın (bağımlılıkları otomatik kurar ve yerel sunucuyu başlatır).
2. Tarayıcıda açılan adrese gidin (genellikle `http://localhost:5173`).

## Giriş Bilgileri
- **Yönetici (Admin):** `marhlab-admin` / `MarhLab!2026`
- **Tek Kayıtlı Müşteri (KON-DES METAL):** `kondes_metal` / `Kd!2026#92`

## v5 Yenilikleri
- **Çoklu Balkon & Müteahhit Proje Sepeti:** Tek teklifte birden fazla cephe ve adet/daire çarpanı, toplu iskonto ve tek KDV.
- **Opsiyonel 2. Sayfa Mimari Teknik Çizim Paftası (A-02):** A4 PDF modalında tek tuşla ölçülendirilmiş mimari ön görünüş, kanat toplanma plan kesiti ve teknik antet ekleme.
- **Esnek Sağ Önizleme Paneli:** 3D Canlı Simülasyon, Canlı A4 Önizleme ve geniş ekranlar için Yan Yana Aç modu.
- **Atölye Kesim Özeti & Alternatif Teklif Kopyalama:** Onaylanan ve bekleyen işler için cam/6m profil kesim listesi ve tek tıkla alternatif teklif çoğaltma.
- **Admin İstatistik Detayları, Trafik Grafiği & Askıdaki Üyeler:** Tıklanabilir özet kartları, ciro göz ikonu, 50+ firma destekli aranabilir üye listesi, otomatik paket bitiş tarihi ve Askıdaki Üyeler yenileme akışı.


## Supabase bulut eşitlemesi

Uygulama, Supabase bilgileri yoksa hata vermeden `localStorage` ile yerel modda çalışır. Yerel geliştirme için `.env.example` dosyasını `.env` olarak kopyalayın ve Supabase Project URL ile anon/public anahtarını doldurun (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Yeniden başlatıp `npm run dev` komutunu çalıştırın.

GitHub Pages dağıtımında repository **Settings → Secrets and variables → Actions** altında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` adlı Actions secrets oluşturun. Workflow bu secrets değerlerini build aşamasına geçirir. Bu anahtarlar tarayıcı uygulamasına gömüldüğünden Supabase tablolarında uygun Row Level Security (RLS) politikalarını etkinleştirin; service-role anahtarını kesinlikle kullanmayın.

Firma girişinden sonra yerel önbellek anında açılır, bulut verileri arka planda yüklenir. Üst çubuktaki **Yerel Verileri Buluta Eşitle** düğmesi elle aktarımı başlatır; ağ kesintilerinde yazma işlemleri yerel kuyruğa alınır ve bağlantı geri gelince yeniden denenir. Logo Storage yüklemesi başarısız olursa Base64/yerel logo kullanılmaya devam eder. Storage için `firm-logos` public bucket'ı gereklidir.

Genel Muhasebe bulut senkronizasyonu ve müşteri silme durumları için `supabase/member-finance.sql` dosyasını Supabase SQL Editor'da bir kez çalıştırın. Uygulamanın giriş modeli Supabase Auth JWT üretmediğinden, tablolar için mevcut tenant erişim modelinize uygun RLS politikalarını ayrıca yapılandırın; anonim anahtara geniş yazma izni vermeyin.
