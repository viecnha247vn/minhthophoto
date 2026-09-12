# Phan Media — bộ khung Eleventy + Sveltia CMS

> **Tiếp tục dự án?** Đọc [`TINH-TRANG.md`](TINH-TRANG.md) trước — việc đã
> xong, việc còn lại và các câu hỏi chưa quyết đều nằm ở đó.
> **Thêm bộ ảnh mới?** Chạy `python3 cong-cu/xu-ly-anh.py <thư-mục> <ten-bo>`.

Chuyển site tĩnh cũ sang một site có CMS, để anh Thọ tự đăng bộ ảnh.

## Vì sao chọn stack này

| | |
|---|---|
| **Eleventy** | Xuất ra HTML tĩnh thuần — giữ nguyên lợi thế SEO của bản cũ. Không có React, không hydrate, không JS thừa. |
| **Sveltia CMS** | Bản viết lại hiện đại của Decap/Netlify CMS, dùng chung `config.yml`. Chọn nó thay Decap vì **Netlify đã deprecate Git Gateway + Identity** — cấu hình mới trên nền đó không còn được khuyến nghị. Sveltia cũng có sẵn nén ảnh lúc upload và trang quản trị dùng được trên điện thoại. |
| **Vercel Image Optimization** | Resize/AVIF/WebP theo yêu cầu trên CDN. Không có bước xử lý ảnh nào lúc build. |
| **image-size** | Đọc header file để lấy `width`/`height` thật lúc build — chỉ vài chục byte mỗi ảnh. |

Chia vai rõ ràng: **Sveltia lo lúc upload** (WebP, giới hạn 2400px, nén, chống file khổng lồ lọt vào Git), **Eleventy lo lúc build** (`srcset`, kích thước thật để không giật layout), **Vercel lo lúc phục vụ** (cắt cỡ, đổi định dạng, cache CDN).

### Vì sao không dùng eleventy-img trên Vercel

Build cache của Vercel chỉ giữ `node_modules`, artifact monorepo và file riêng của framework — **không giữ `.cache` hay thư mục output của Eleventy**. `eleventy-img` sẽ phải resize lại toàn bộ ảnh ở mỗi lần deploy; sửa một dòng chữ ở trang Liên hệ cũng kéo theo 300 lần resize. Đẩy việc đó sang CDN giữ cho thời gian build không đổi dù bộ sưu tập dày lên.

Đánh đổi: Vercel tính phí theo số lần transform ảnh. Với site này con số rất nhỏ (3 cỡ × số ảnh, cache 31 ngày theo `minimumCacheTTL`), nhưng nên xem lại bảng giá hiện hành. Lưu ý thêm: **gói Hobby chỉ dành cho mục đích phi thương mại** — đây là site của một doanh nghiệp nên phải ở gói Pro. Nếu muốn tránh hoàn toàn khoản này thì quay lại `@11ty/eleventy-img` và chấp nhận build chậm dần.

## Dựng lần đầu

```bash
npm install
npm start          # http://localhost:8080
```

Chưa chạy `npm install` được trong môi trường viết code này (không có mạng), nên **bản build chưa được test** — chạy local một lượt trước khi deploy.

Ở local, `/_vercel/image` không tồn tại nên shortcode tự trỏ thẳng file gốc (nhận biết qua biến môi trường `VERCEL`). Ảnh sẽ nặng hơn khi dev nhưng bố cục giống hệt bản thật.

### Các chỗ phải sửa trước khi lên thật

1. `admin/config.yml` → `repo: TEN-GITHUB/minhtho` (đổi thành repo thật)
2. `src/_data/site.json` → `goc` (tên miền thật) và `nam`
3. Thêm `src/assets/og-mac-dinh.jpg` (1200×630) — ảnh hiện khi chia sẻ link
4. Thêm `src/static/favicon.ico` và `favicon.svg`
5. `admin/config.yml` → `base_url` (URL Cloudflare Worker, xem phần dưới)
6. Tạo tài khoản GitHub cho anh Thọ, mời làm collaborator (quyền Write)

### Tạo tài khoản cho anh Thọ

Anh Thọ không cần biết GitHub là gì — với anh ấy đây chỉ là tên đăng nhập vào trang quản lý. Sveltia giấu hoàn toàn repo, commit, branch.

- Đăng ký một tài khoản GitHub mới bằng email của anh ấy, đặt username dễ nhận (`phanmedia-tho`)
- Mời vào repo với quyền **Write** (Settings → Collaborators)
- Bật 2FA — GitHub bắt buộc. Dùng app Authenticator trên điện thoại anh ấy, làm giúp luôn lúc bàn giao
- Lưu mật khẩu vào trình duyệt máy và điện thoại anh ấy, ghi ra giấy một bản để đó
- Tạo bookmark `phanmedia.vn/admin` trên cả hai máy

Sau bước này anh ấy chỉ cần: mở bookmark → bấm nút đăng nhập → làm việc.

### Deploy lên Vercel

Import repo trên Vercel. Framework preset để **Other**; `vercel.json` đã khai báo sẵn build command, output dir, cấu hình `images` (bắt buộc, nếu thiếu thì `/_vercel/image` từ chối request) và các header cache.

### Dựng OAuth để anh Thọ đăng nhập được

Vercel không có OAuth client sẵn như Netlify. GitHub có kế hoạch hỗ trợ PKCE phía client — khi đó Sveltia đăng nhập thẳng không cần backend — nhưng hiện README của Sveltia vẫn ghi "sắp có", nên tạm thời:

1. Deploy [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) lên Cloudflare Workers (có nút Deploy sẵn, miễn phí). Copy URL worker.
2. Trên GitHub: Settings → Developer settings → OAuth Apps → New. **Authorization callback URL** là `<URL_WORKER>/callback`.
3. Quay lại Cloudflare → worker → Settings → Variables, thêm `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, và `ALLOWED_DOMAINS` = tên miền site (chặn worker bị site khác mượn dùng).
4. Dán URL worker vào `base_url` trong `admin/config.yml`.

Khoảng 15 phút, làm một lần. Anh Thọ không thấy gì về Cloudflare — chỉ bấm "Sign in with GitHub" ở `/admin`.

> Phương án khác: tự port worker này thành Vercel Edge Function (cùng chữ ký `fetch`) để gom hết về một chỗ. Làm được, nhưng không chính thức nên phải tự bảo trì.

## Còn phải làm

Mình mới chuyển **trang Nghệ thuật** sang Eleventy vì đó là trang gắn với bộ ảnh. Bốn trang còn lại (`index`, `dich-vu`, `ve-chung-toi`, `lien-he`) vẫn là HTML rời trong repo cũ — chuyển sang layout là việc dán nội dung vào `{% block noi_dung %}`, mỗi trang khoảng 5 phút.

Chưa làm, xếp theo mức đáng làm:

- [ ] Chuyển 4 trang còn lại sang layout `base.njk`
- [ ] `sitemap.xml` (plugin `@11ty/eleventy-plugin-sitemap` hoặc một template `.njk` 10 dòng)
- [ ] Sửa luồng form ở `lien-he` — `window.open` sau `setTimeout` bị popup blocker chặn; thêm Formspree làm bản lưu
- [ ] Xoá 3 file `xemtruoc-*.png` (2.5MB không dùng) khỏi repo cũ
- [ ] Nội dung: bộ ảnh thật. Lưới cover trống thì cả kiến trúc này vô nghĩa.

## Ghi chú kỹ thuật

**Thứ tự ảnh.** `.gal` dùng CSS Grid chứ không dùng `columns`. Masonry kiểu `columns` đọc theo cột nên phá thứ tự anh Thọ sắp trong CMS. Grid giữ đúng thứ tự; ảnh ngang `span 2`, ảnh dọc `span 1`, và hướng ảnh được suy ra từ kích thước thật do `eleventy-img` trả về nên không phải thêm ô chọn trong CMS.

**Cỡ ảnh phải khớp hai nơi.** `CAC_CO` trong `eleventy.config.js` và `images.sizes` trong `vercel.json` phải giống nhau. Vercel từ chối mọi `w` không nằm trong danh sách, và ảnh sẽ hỏng im lặng — thêm cỡ mới thì nhớ sửa cả hai.

**`gallery.css` có kèm bản vá cho `style.css` cũ** — nằm ở cuối file, có đánh dấu: nâng `--muted-2` lên `#9d8768` (bản cũ 3.66:1, dưới chuẩn WCAG AA), thêm vòng focus, `visibility:hidden` cho menu mobile khi đóng (bản cũ vẫn Tab vào được menu vô hình), trạng thái X cho nút burger, `scroll-margin-top` cho anchor bị nav che. Khi nào rảnh thì gộp thẳng vào `style.css` cho gọn.

**Ghim phiên bản Sveltia** trong `admin/index.html` (đang là `@0.128`). Sveltia còn ở public beta; để `@latest` là một hôm nào đó trang quản trị hỏng mà không ai đụng vào code. Kiểm tra changelog trước khi nâng.
