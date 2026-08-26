# Tan Loc Advertising — Website

Website chính thức của **CÔNG TY TNHH MTV QUẢNG CÁO TẤN LỘC** (Tan Loc Advertising), xây dựng bằng Node.js + Express + EJS, có sẵn CMS quản trị nội dung (portfolio, blog, tuyển dụng, bảng giá, yêu cầu tư vấn).

## Tính năng

- Trang chủ, Giới thiệu, Dịch vụ, Bảng giá, Dự án (portfolio), Blog, Tuyển dụng, Liên hệ
- Form liên hệ lưu trực tiếp vào trang quản trị (không cần cấu hình email/SMTP)
- Trang quản trị `/admin` (đăng nhập bằng `ADMIN_USERNAME` / `ADMIN_PASSWORD`) để:
  - Xem toàn bộ yêu cầu tư vấn từ khách hàng, đánh dấu đã liên hệ, xóa
  - Thêm/sửa/xóa dự án (portfolio), kèm upload ảnh
  - Thêm/sửa/xóa gói giá (bảng giá tham khảo), giá có thể để trống để ẩn công khai
  - Viết/sửa/xóa bài blog
  - Đăng/xóa tin tuyển dụng
  - Cập nhật thông tin công ty (SĐT, email, địa chỉ...)
- Responsive, tối ưu SEO cơ bản (meta description, Open Graph)
- Bảo mật cơ bản: Helmet, rate limit cho form liên hệ & đăng nhập, session cookie httpOnly

## Cài đặt local

```bash
npm install
cp .env.example .env
# Chỉnh sửa .env: đặt SESSION_SECRET, ADMIN_PASSWORD...
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
| `SITE_URL` | URL chính thức của website sau khi có domain |

## Cấu trúc dự án

```
src/
  app.js               # Điểm khởi động Express
  routes/site.js        # Route công khai
  routes/admin.js        # Route quản trị (CMS)
  middleware/auth.js     # Bảo vệ trang /admin
  data/site.json         # Toàn bộ nội dung động (portfolio, blog, giá, tuyển dụng, yêu cầu tư vấn...)
  data/store.js           # Đọc/ghi site.json
  views/                 # Template EJS (pages, partials, admin)
  public/                 # CSS, JS, ảnh tĩnh
deploy/                 # Hướng dẫn & script deploy lên Hostinger VPS
```

Nội dung động (dự án, blog, tuyển dụng, thông tin công ty, yêu cầu tư vấn) được lưu tại `src/data/site.json` và chỉnh sửa qua trang quản trị `/admin` — không cần sửa code.

## Deploy lên Hostinger VPS

Xem hướng dẫn chi tiết tại [`deploy/HOSTINGER.md`](deploy/HOSTINGER.md).

## Bảo mật cần lưu ý trước khi go-live

- Đổi `SESSION_SECRET` và `ADMIN_PASSWORD` sang giá trị mạnh, không dùng giá trị mẫu
- Nên bật HTTPS (SSL) trên domain khi lên production
- Không commit file `.env` lên Git (đã có trong `.gitignore`)
