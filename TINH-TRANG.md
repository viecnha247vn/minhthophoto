# Tình trạng dự án

*Cập nhật: 12/09/2026. Đọc file này trước nếu tiếp tục dự án ở một cuộc
trò chuyện mới — nó thay cho toàn bộ lịch sử trao đổi.*

## Đây là gì

Website cho **Phan Media — NSNA Phan Minh Thọ** (Gò Bồi, Tuy Phước Đông,
Gia Lai). Eleventy 3 + Sveltia CMS, deploy trên Vercel qua GitHub. Ảnh
phục vụ qua `/_vercel/image`, kích thước đọc bằng `image-size` lúc build.

Mục tiêu cốt lõi: **anh Thọ tự đăng bộ ảnh mà không cần biết gì về kỹ thuật.**
Mọi quyết định kiến trúc đều xoay quanh điều này.

## Cấu trúc nội dung (chốt 12/09)

Một collection `src/bo-anh/*.md`, chia hai mục bằng ô **Thuộc mục** (`loai`):

**Nghệ thuật** (`loai: nghe-thuat`, trang `/nghe-thuat/`) — 7 bộ, 76 ảnh,
xếp theo đề tài. Thứ tự trên trang do `ngay` quyết định (mới nhất lên đầu):

| Bộ | Ảnh | Giải thưởng trong bộ |
|---|---|---|
| Mùa vàng | 12 | |
| Xứ biển sông nước | 16 | Giải Nhất Bình Định 2023 (Hoa trổ trên sông) |
| Võ cổ truyền Bình Định | 10 | **Giải Nhì "Bình Định đất và người" 2025 — ảnh bộ 8 tấm** |
| Sắc màu cao nguyên | 9 | Giải Nhất Sắc Xuân Măng Đen 2026 · Bằng danh dự HOPA 2025 |
| Đức tin | 9 | |
| Lễ hội & làng nghề | 9 | |
| Ý tưởng & chân dung | 10 | Giải Nhất ảnh trắng đen TP.HCM 2025 (Hoài niệm) |

**Dự án** (`loai: du-an`, hiện ở cuối trang `/dich-vu/#du-an`) — 4 bộ, 49 ảnh:
Ảnh cưới (28), Chân dung (15), Doanh nghiệp (4), Sự kiện (3).

Giải thưởng ghi ở hai chỗ: `giai_thuong` của bộ (hiện dưới tên bộ) và
`chu_thich` của tấm đoạt giải (hiện dưới ảnh và trong lightbox).

### Phát hiện quan trọng 12/09

Ảnh `tho-nhan-giai-nhi.webp` chụp anh Thọ đứng cạnh bảng trưng bày, và bảng
đó **chính là 8 tấm "Võ cổ truyền" gửi ở đợt ba** — tức ảnh bộ *Tinh hoa võ
thuật Bình Định* đoạt Giải Nhì. Đã đọc tên từng khung trên bảng và đặt lại
tên file theo đúng thứ tự dự thi: Thiết Phiến, Lôi Long Đao, Thanh Long Độc
Kiếm, Thiên Long Đao, Bàn Long Cước, Thôi Chưởng, Đối Luyện, Đồng Luyện.
Tấm `tinh-hoa-vo-thuat-binh-dinh.webp` cũ ở trang chủ trùng với Đồng Luyện
(bản nhỏ hơn) — đã xoá, trang chủ trỏ sang bản lớn. Đoạn giới thiệu trên
bảng là chữ của anh Thọ, dùng làm `mo_ta` của bộ.

Bài học cho câu 6 và 8 dưới đây: ảnh bộ dự thi nên hiện bằng **các khung rời
có chú thích**, không phải một tấm ghép có chữ in.

## Kiến trúc — những chỗ cần biết khi sửa

- `eleventy.config.js` — shortcode `anh` (ảnh trong bộ), `bia` (ảnh bìa,
  nhận `sizes`), filter `theoLoai`, `altBia`, `dateXML`, `ngayVN`, `nam`
- `src/_data/anh.json` — mọi ảnh cố định của site (hero, chân dung, tác phẩm
  nổi bật, ảnh minh hoạ dịch vụ). Đổi ảnh trang chủ là sửa ở đây, không đụng template
- `src/_data/site.json` — tên miền (`goc`), điện thoại, mạng xã hội.
  `robots.txt` và `sitemap.xml` đều lấy `goc` từ đây
- `src/bo-anh/bo-anh.json` — layout + permalink cho mọi bộ
- `admin/config.yml` — CMS. Danh sách Chủ đề ở đây **phải khớp** hàng nút lọc
  trong `nghe-thuat.njk` (xem câu 10)
- `vercel.json` — `localPatterns` cho phép `^/media/`; đổi `images.sizes` thì
  đổi `CAC_CO` trong eleventy.config.js theo
- `cong-cu/xu-ly-anh.py` — xử lý ảnh ở máy: không dấu, WebP q82, ≤2400px,
  nén lại nếu >700KB, sinh sẵn `.md`

## Chưa xong

| Việc | Ai làm | Ghi chú |
|---|---|---|
| Chạy `npm install` + `npm start` một lượt | bạn | **bản build vẫn chưa từng chạy thật** — xem mục dưới |
| Tạo tài khoản GitHub cho anh Thọ | bạn | ~10 phút, nhớ cài sẵn 2FA |
| Dựng `sveltia-cms-auth` trên Cloudflare Workers | bạn | ~15 phút, các bước trong README |
| Sửa `repo` + `base_url` trong `admin/config.yml` | bạn | |
| Sửa `goc` trong `src/_data/site.json` | bạn | tên miền thật |
| Nơi nhận đơn dự phòng cho form liên hệ | | khách không dán vào Zalo là mất đơn; Formspree free 50 đơn/tháng |

### Bản build chưa chạy thật

Máy soát không có mạng nên chỉ kiểm tra được phần tĩnh: YAML/JSON hợp lệ,
125 đường dẫn ảnh trong `.md` và `.json` đều có file thật, không tấm nào trùng
hay thiếu alt, JS không lỗi cú pháp. Nunjucks có dựng nổi hay không phải
`npm install && npm start` mới biết. Nếu build đổ, ba chỗ nghi trước:

- `{% bia b.data.cover, b.data | altBia %}` — truyền filter làm tham số shortcode
- `{% bia anh.tac_pham_noi_bat[1].file, ... %}` — ngoặc vuông trong tham số
- `src/sitemap.njk` gọi `p.url.endsWith("/")`

## Câu hỏi còn treo

1. **"Thể thao nghệ thuật đường phố"** — tên file ghi *Giải Nhì*, yêu cầu ban
   đầu ghi *Giải Khuyến khích*. Đang để theo yêu cầu, ở cả `anh.json` lẫn
   `chu_thich` trong bộ Ý tưởng & chân dung.

2. **Tên thương hiệu không đồng nhất** — nav ghi "Minh Thọ Photographer",
   còn h1 trang chủ / footer / tiêu đề tab vẫn "NSNA Phan Minh Thọ".

3. **"Từ năm 2014" vs "13 năm trong lĩnh vực nhiếp ảnh"** — 2026 trừ 13 là
   2013. Chưa sửa.

4. **Bộ Ảnh cưới 28 tấm** gộp ba buổi chụp. Đề xuất tách "Biển Quy Nhơn" /
   "Hồ và núi" / "Cổ phục & phố". Giờ đã có mục Dự án riêng nên tách càng hợp.

5. **Hai ảnh bộ còn ở dạng tấm ghép** — Cồn Chim (bộ Xứ biển) và Hang Dơi
   (bộ Cao nguyên) vẫn là bố cục có chữ in, trên web không đọc nổi. Cần khung
   rời như đã làm với Tinh hoa võ thuật.

6. **"Phía sau điểm số"** ở trang chủ — cũng là tấm ghép 5 khung có chữ, lại
   bị cắt vuông. Đây là Huy chương Vàng. Cần 5 khung rời, rồi cho vào bộ
   Ý tưởng & chân dung.

7. **Đồng ý hình ảnh** — 3 tấm nha khoa (bộ Doanh nghiệp) có bệnh nhân thấy
   mặt; tấm toà giải tội (`tia-nang-toa-giai`, bộ Đức tin) thấy rõ mặt nữ
   sinh. Cần xác nhận là dàn dựng / có đồng ý đăng.

8. **Danh sách chủ đề nằm ở hai nơi** — `admin/config.yml` và
   `nghe-thuat.njk`. Thêm chủ đề mới phải sửa cả hai.

9. **Ba ảnh tư liệu hội chưa dùng** ở `src/media/trang/`:
   `trao-giai-trien-lam`, `tho-phat-bieu-gap-mat`, `chi-hoi-nhiep-anh-gia-lai`.
   Hoặc thêm một mục "Hoạt động" ở trang Về chúng tôi, hoặc xoá khỏi repo.

## Quy ước đã thống nhất

- Ảnh: cạnh dài ≤ 2400px, WebP q82, tên không dấu chữ thường gạch nối.
  Tên file là tên tác phẩm nếu có; ảnh không tên thì đặt tên mô tả
- **Alt text bắt buộc, tả nội dung nhìn thấy** — không phải tên tác phẩm.
  Đây là gần như toàn bộ nội dung chữ mà Google đọc được trên trang ảnh
- Alt không dùng dấu hai chấm (YAML hiểu nhầm thành khoá)
- Giải thưởng của tấm ảnh ghi vào `chu_thich`; của cả bộ ghi vào `giai_thuong`
- Thứ tự ảnh trong bộ do người biên tập sắp, lưới CSS giữ nguyên thứ tự
- Ảnh có chữ/logo in sẵn không đưa vào portfolio
- Ảnh *có* anh Thọ trong đó là tư liệu cá nhân — để ở `src/media/trang/`
- Giọng văn trên site: ngôi thứ ba ("anh", "Phan Media"), không "tôi"
