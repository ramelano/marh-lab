# MARH-LAB Teklif Platformu — Uygulama Planı

## Amaç ve kapsam

MARH-LAB platformunu birden fazla firmaya sunulacak ürün olarak konumlandır. MARH-LAB ürün sağlayıcısı ve yönetim markasıdır; KONDES METAL bu arayüzdeki müşteri firma/tenant hesabıdır. Firma çalışma alanındaki teklif, müşteri ve rapor sayfalarını bu ayrımla etiketle.

Kullanıcı isteği kapsamındaki ekler: açık arka plan üzerindeki kart, metin, tablo ve form bileşenleri için görünür kontrastı yükselt; her teklifin satırından ayrı A4 PDF önizlemesi aç; belgeyi inceleme aşamasından yazdır/PDF kaydet eylemine geçiş ver; MARH-LAB yönetici girişi ve ürün/tenant özet sayfası ekle. İlk demo yönetici kullanıcı adı `marhlab-admin`, geçici şifre `MarhLab!2026`. Giriş yerel prototip içindir; sunucu tarafı kimlik doğrulama veya güvenli multi-tenant erişim bu kapsamda sağlanmaz.

Teklif kayıtları tarayıcı `localStorage` alanında kalır. Önceki KONDES uygulaması ve ileri düzey eski özellikler `public/legacy/` altında korunur.

## Yapı ve uygulama yaklaşımı

- `src/App.tsx`: firma çalışma alanı, platform yönetim girişi/paneli, teklif tablosu, A4 belge önizlemesi ve eylemler.
- `src/data.ts`: demo başlangıç kayıtları, firma teklifleri ve localStorage yardımcıları.
- `src/styles.css`: Tailwind v4 + HeroUI importu, erişilebilir marka teması, kontrastlı açık tema, responsive ve print-only kuralları.
- `index.html`: MARH-LAB ürün metadataları ve favicon.
- `public/legacy/`: kullanıcı arşivindeki eski uygulama ve destek dosyaları.

## Tasarım kararı

Seçili yön: kontrastı yükseltilmiş mimari endüstriyel çalışma alanı. Sıcak nötr arka plan ve koyu grafit metin; ayrık, açık/beyaz yüzeylerde belirgin kenarlık ve okunaklı gövde metni; bakır aksanlar eylemleri vurgular. MARH-LAB markası ve yönetim alanı ile KONDES METAL firma hesabı açıkça ayrılır. Mobilde çekmeceli navigasyon ve yatay kaydırmalı tablo; masaüstünde sabit ürün menüsü ve geniş çalışma paneli.

Yönetici alanında oturum açma ve demo tenant/lisans kartı bulunur. A4 belge önizlemesi yazdırma/PDF eyleminden önce açılır. Azaltılmış hareket, görünür odak işaretleri ve etiketli form alanları korunur. Admin kimlik bilgileri uygulamanın istemci paketinde olduğundan bu özellik gerçek güvenlik sağlamaz; üretim öncesi backend kimlik doğrulama, parola saklama ve tenant izolasyonu gerekir.

## Geliştirme

Node.js 22 ve kilitli `pnpm` ile kurulum: `pnpm install`; geliştirme sunucusu: `pnpm dev`; üretim derlemesi: `pnpm build`. HeroUI React v3 sağlayıcı istemez ve örnek olarak Button bileşeni görünür alanda kullanılır.
