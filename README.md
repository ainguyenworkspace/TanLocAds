# Tan Loc Advertising — Website

Website chính thức của **CÔNG TY TNHH MTV QUẢNG CÁO TẤN LỘC** (Tan Loc Advertising), xây dựng bằng Node.js + Express + EJS, có sẵn CMS quản trị nội dung (portfolio, blog, tuyển dụng) và form liên hệ gửi email thật.

## Tính năng

- Trang chủ, Giới thiệu, Dịch vụ, Bảng giá, Dự án (portfolio), Blog, Tuyển dụng, Liên hệ
- Form liên hệ gửi email qua SMTP (Nodemailer)
- Trang quản trị `/admin` (đăng nhập bằng `ADMIN_USERNAME` / `ADMIN_PASSWORD`) để:
  - Thêm/sửa/xóa dự án (portfolio), kèm upload ảnh
  - Viết/sửa/xóa bài blog
  - Đăng/xóa tin tuyển dụng
  - Cập nhật thông tin công ty (SĐT, email, địa chỉ...)
- Responsive, tối ưu SEO cơ bản (meta description, Open Graph)
- Bảo mật cơ bản: Helmet, rate limit cho form liên hệ & đăng nhập, session cookie httpOnly

## Cài đặt local

```bash
npm install
cp .env.example .env
# Chỉnh sửa .env: đặt SESSION_SECRET, ADMIN_PASSWORD, thông tin SMTP...
npm run dev
```

Truy cập http://localhost:3000 — trang quản trị tại http://localhost:3000/admin

## Biến môi trường (.env)

| Biến | Mô tả |
|---|---|
| `PORT` | Cổng chạy server (mặc định 3000) |
| `NODE_ENV` | `development` hoặc `production` |
| `SESSION_SECRET` | Chuỗi bí mật cho session — đặt giá trị ngẫu nhiên, dài |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Tài khoản đăng nhập trang quản trị `/admin` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | Cấu hình SMTP để gửi email từ form liên hệ (dùng email theo domain qua Hostinger, ví dụ `info@tanlocadv.com`) |
| `CONTACT_TO_EMAIL` | Email nhận yêu cầu liên hệ (mặc định `tanlocha45@gmail.com`) |
| `SITE_URL` | URL chính thức của website sau khi có domain |

Nếu chưa cấu hình SMTP, form liên hệ vẫn hoạt động nhưng chỉ ghi log ra console thay vì gửi email thật — cần điền đủ SMTP trước khi lên production.

## Cấu trúc dự án

```
src/
  app.js              # Điểm khởi động Express
  routes/site.js       # Route công khai
  routes/admin.js       # Route quản trị (CMS)
  middleware/auth.js    # Bảo vệ trang /admin
  utils/mailer.js       # Gửi email liên hệ qua Nodemailer
  data/site.json        # Toàn bộ nội dung động (portfolio, blog, giá, tuyển dụng...)
  data/store.js          # Đọc/ghi site.json
  views/                # Template EJS (pages, partials, admin)
  public/                # CSS, JS, ảnh tĩnh
deploy/                # Hướng dẫn & script deploy lên Hostinger VPS
```

Nội dung động (dự án, blog, tuyển dụng, thông tin công ty) được lưu tại `src/data/site.json` và chỉnh sửa qua trang quản trị `/admin` — không cần sửa code.

## Deploy lên Hostinger VPS

Xem hướng dẫn chi tiết tại [`deploy/HOSTINGER.md`](deploy/HOSTINGER.md).

## Bảo mật cần lưu ý trước khi go-live

- Đổi `SESSION_SECRET` và `ADMIN_PASSWORD` sang giá trị mạnh, không dùng giá trị mẫu
- Bật HTTPS (SSL) trên domain trước khi cho `NODE_ENV=production` (cookie session yêu cầu `secure`)
- Không commit file `.env` lên Git (đã có trong `.gitignore`)
