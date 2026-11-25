# MARH-LAB SaaS — Sunucu Kurulumu

## Gereksinimler

- Ubuntu/Debian sunucu
- Node.js 20 veya üzeri
- Alan adı ve tercihen Nginx

## 1. Dosyaları sunucuya yükleme

ZIP dosyasını sunucuya yükleyin ve açın:

```bash
unzip MARH_LAB_SaaS_Platform_guncel.zip
cd marh-lab-saas
```

## 2. Bağımlılıkları kurma ve derleme

```bash
npm install
npm run build
```

Derleme sonunda yayınlanacak dosyalar `dist/` klasöründe oluşur.

## 3. Basit önizleme / test

```bash
npm run dev -- --host 0.0.0.0 --port 4173
```

Üretim dosyalarını yerel olarak test etmek için:

```bash
npx vite preview --host 0.0.0.0 --port 4173
```

## 4. Nginx ile yayınlama

`dist/` klasörünü örneğin `/var/www/marh-lab/dist` konumuna kopyalayın:

```bash
sudo mkdir -p /var/www/marh-lab
sudo cp -a dist/. /var/www/marh-lab/
```

Nginx site yapılandırması:

```nginx
server {
    listen 80;
    server_name alan-adiniz.com;
    root /var/www/marh-lab;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Ardından:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS için Certbot kullanılabilir:

```bash
sudo certbot --nginx -d alan-adiniz.com
```

## Notlar

- Uygulama bu sürümde verileri tarayıcı `localStorage` alanında tenant anahtarıyla saklar; gerçek sunucu tarafı çoklu tenant güvenliği içermez.
- Demo girişleri: `kondes_metal / Kd!2026#92` ve `marhlab-admin / MarhLab!2026`.
- `node_modules` ZIP’e dahil değildir; sunucuda `npm install` çalıştırılmalıdır.
- `dist/` klasörü ZIP’e dahil edilmemiştir; sunucuda `npm run build` ile yeniden oluşturulur.
