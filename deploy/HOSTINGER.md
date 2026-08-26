# Hướng dẫn deploy lên Hostinger VPS

Áp dụng cho gói **VPS Hostinger** (Ubuntu 22.04 khuyến nghị). Nếu bạn dùng gói Business/Cloud có sẵn tính năng "Node.js App" trong hPanel, dùng file `deploy/HOSTINGER-SHARED.md` thay thế (xem cuối tài liệu).

## 1. Chuẩn bị VPS

SSH vào VPS:

```bash
ssh root@<IP_VPS_CUA_BAN>
```

Cài Node.js (dùng NodeSource, bản LTS):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

Cài PM2 (giữ ứng dụng chạy nền, tự khởi động lại khi crash):

```bash
sudo npm install -g pm2
```

Cài Nginx (reverse proxy) và Git:

```bash
sudo apt update
sudo apt install -y nginx git
```

## 2. Clone code từ GitHub

```bash
cd /var/www
sudo git clone https://github.com/ainguyenworkspace/TanLocAds.git
cd TanLocAds
sudo npm install --omit=dev
```

## 3. Cấu hình biến môi trường

```bash
sudo cp .env.example .env
sudo nano .env
```

Điền:
- `NODE_ENV=production`
- `SESSION_SECRET=` (chuỗi ngẫu nhiên dài, ví dụ tạo bằng `openssl rand -hex 32`)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` (mật khẩu mạnh)
- `SITE_URL=https://tenmiencuaban.com`

Yêu cầu tư vấn từ khách hàng được lưu trực tiếp vào `src/data/site.json` và xem tại trang quản trị `/admin/yeu-cau` — không cần cấu hình email/SMTP.

## 4. Chạy ứng dụng bằng PM2

```bash
cd /var/www/TanLocAds
sudo pm2 start src/app.js --name tan-loc-web
sudo pm2 save
sudo pm2 startup
```

Lệnh `pm2 startup` sẽ in ra một dòng lệnh — copy và chạy lại dòng đó để PM2 tự khởi động cùng VPS.

Kiểm tra ứng dụng đang chạy:

```bash
pm2 status
pm2 logs tan-loc-web
```

## 5. Cấu hình Nginx reverse proxy

Tạo file cấu hình:

```bash
sudo nano /etc/nginx/sites-available/tanlocads
```

Nội dung:

```nginx
server {
    listen 80;
    server_name tenmiencuaban.com www.tenmiencuaban.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt site và khởi động lại Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/tanlocads /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Trỏ domain về VPS

Tại nơi quản lý DNS của domain (Hostinger hPanel > Domains > DNS):
- Thêm bản ghi `A` cho `@` trỏ về IP của VPS
- Thêm bản ghi `A` cho `www` trỏ về IP của VPS

## 7. Cài SSL miễn phí (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tenmiencuaban.com -d www.tenmiencuaban.com
```

Certbot sẽ tự cấu hình HTTPS cho Nginx và tự gia hạn chứng chỉ.

## 8. Cập nhật website sau này

```bash
cd /var/www/TanLocAds
sudo git pull origin main
sudo npm install --omit=dev
sudo pm2 restart tan-loc-web
```

## Ghi chú bảo mật

- Không mở port 3000 ra Internet trực tiếp — chỉ Nginx (port 80/443) nên public, Node.js chỉ lắng nghe `127.0.0.1:3000`
- Bật firewall cơ bản: `sudo ufw allow 'Nginx Full'`, `sudo ufw allow OpenSSH`, `sudo ufw enable`
- Backup định kỳ file `src/data/site.json` và thư mục `src/public/images/portfolio` (nội dung do CMS tạo ra, không nằm trong Git sau khi thêm qua admin)
