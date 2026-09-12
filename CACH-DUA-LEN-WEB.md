# Đưa lên web

## Cách hoạt động

```
Bạn đẩy code lên GitHub  →  Vercel tự phát hiện  →  Tự chạy build  →  Web cập nhật
```

`vercel.json` đã khai báo build command và thư mục output. Mỗi lần đẩy mất
khoảng 1–2 phút là lên web.

## Lần đầu — thư mục này đã là một kho Git sẵn

Thư mục `minhtho/` đã được `git init` và commit sẵn toàn bộ (`.gitignore`
đã chặn `node_modules/`, `_site/`). Bạn chỉ cần nối nó với GitHub:

```bash
cd minhtho
git remote add origin https://github.com/<tài-khoản>/minhtho.git
git push -u origin main
```

Tạo repo trống trên GitHub trước (**New repository** → tên `minhtho` →
**không** tick "Add a README", để repo trống hoàn toàn).

Không quen dòng lệnh thì cài **GitHub Desktop** → *File → Add local
repository* → chọn thư mục `minhtho` → **Publish repository**. Cùng kết quả.

Sau đó vào Vercel → **Add New Project** → chọn repo → Framework preset để
**Other** (vercel.json lo phần còn lại) → Deploy. Lần deploy đầu Vercel sẽ
chạy `npm install` rồi `npm run build`.

## Kiểm tra ở máy trước khi đẩy (nên làm một lần)

```bash
npm install
npm start          # mở http://localhost:8080
```

Bản build **chưa từng được chạy thật** vì máy soát code không có mạng.
Mọi thứ tĩnh đã kiểm tra, nhưng nếu `npm start` báo lỗi, gửi nguyên dòng
lỗi vào chat là sửa được.

## Những lần sau

Sửa file → `git add -A && git commit -m "mô tả" && git push`. Hoặc trong
GitHub Desktop: gõ mô tả → **Commit** → **Push**. Anh Thọ đăng ảnh qua
`/admin` thì CMS tự commit, không cần bạn.

## Trước khi mở cho khách

1. `src/_data/site.json` → `goc`: tên miền thật (robots.txt và sitemap.xml lấy từ đây)
2. `admin/config.yml` → `repo` (tên tài khoản/repo) và `base_url` (worker sveltia-cms-auth)
3. Trên Vercel → Settings → Domains → thêm tên miền

Favicon và ảnh chia sẻ (`og-mac-dinh.jpg`) đã có sẵn.
