#!/usr/bin/env python3
"""
Xử lý một thư mục ảnh thành bộ ảnh cho website.

Làm đúng những việc đã làm thủ công từ đầu dự án:
  - đổi tên không dấu, chữ thường, gạch nối
  - xoay theo EXIF rồi bỏ metadata
  - giảm cạnh dài về 2400px (ảnh flycam nhiều chi tiết: 2000px)
  - chuyển WebP chất lượng 82
  - sinh sẵn file .md của bộ ảnh, alt để trống chờ điền

CÁCH DÙNG
    python3 cong-cu/xu-ly-anh.py <thư-mục-ảnh> <ten-bo-anh> ["Tên hiển thị"]

VÍ DỤ
    python3 cong-cu/xu-ly-anh.py ~/Desktop/anh-moi tac-pham-nghe-thuat
    python3 cong-cu/xu-ly-anh.py ~/Desktop/le-hoi le-hoi "Lễ hội"

Nếu bộ ảnh đã tồn tại, script chỉ thêm ảnh mới vào cuối, không ghi đè.

CẦN CÀI (một lần)
    pip install pillow
"""

import os
import re
import sys
import unicodedata

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Thiếu thư viện Pillow. Chạy:  pip install pillow")

CANH_DAI = 2400      # cạnh dài tối đa
CHAT_LUONG = 82
NANG_TOI_DA = 700 * 1024  # quá ngưỡng này thì nén lại nhỏ hơn
DUOI_ANH = (".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff")


def khong_dau(s: str) -> str:
    """'Gánh những hạt vàng.JPG' -> 'ganh-nhung-hat-vang'"""
    s = os.path.splitext(s)[0]
    s = s.replace("Đ", "D").replace("đ", "d")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "anh"


def xu_ly(nguon: str, dich: str) -> tuple:
    """
    Nén rồi ĐO kết quả. Ảnh chi tiết dày (ruộng lúa, rơm rạ nhìn từ flycam)
    nén rất kém — không có cách đoán trước nào đáng tin, nên cứ nén thử,
    tấm nào vượt ngưỡng thì hạ kích thước rồi nén lại.
    """
    goc = ImageOps.exif_transpose(Image.open(nguon)).convert("RGB")
    for canh, chat_luong in ((CANH_DAI, CHAT_LUONG),
                             (2000, CHAT_LUONG),
                             (2000, 76)):
        im = goc
        w, h = im.size
        if max(w, h) > canh:
            r = canh / max(w, h)
            im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
        im.save(dich, "WEBP", quality=chat_luong, method=6)
        if os.path.getsize(dich) <= NANG_TOI_DA:
            break
    return im.size, os.path.getsize(dich)


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)

    thu_muc = os.path.expanduser(sys.argv[1])
    slug = sys.argv[2]
    ten_hien_thi = sys.argv[3] if len(sys.argv) > 3 else slug.replace("-", " ").capitalize()

    if not os.path.isdir(thu_muc):
        sys.exit(f"Không thấy thư mục: {thu_muc}")

    goc = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    thu_muc_anh = os.path.join(goc, "src", "media", "bo-anh", slug)
    file_md = os.path.join(goc, "src", "bo-anh", f"{slug}.md")
    os.makedirs(thu_muc_anh, exist_ok=True)

    da_co = {f for f in os.listdir(thu_muc_anh) if f.endswith(".webp")}
    nguon = sorted(f for f in os.listdir(thu_muc)
                   if f.lower().endswith(DUOI_ANH) and not f.startswith("."))
    if not nguon:
        sys.exit(f"Không có ảnh nào trong {thu_muc}")

    print(f"Xử lý {len(nguon)} ảnh -> {thu_muc_anh}\n")
    moi, tong_goc, tong_moi, bo_qua = [], 0, 0, 0

    for f in nguon:
        ten = khong_dau(f)
        dich_ten = f"{ten}.webp"
        # tránh ghi đè: thêm hậu tố nếu trùng
        i = 2
        while dich_ten in da_co:
            dich_ten = f"{ten}-{i}.webp"
            i += 1
        if i > 2:
            print(f"  (trùng tên, đổi thành {dich_ten})")

        p_nguon = os.path.join(thu_muc, f)
        p_dich = os.path.join(thu_muc_anh, dich_ten)
        tong_goc += os.path.getsize(p_nguon)
        try:
            (w, h), kb = xu_ly(p_nguon, p_dich)
        except Exception as e:
            print(f"  LỖI {f}: {e}")
            bo_qua += 1
            continue
        tong_moi += kb
        da_co.add(dich_ten)
        moi.append(dich_ten)
        print(f"  {dich_ten:38s} {w:4d}x{h:4d} {kb/1024:6.0f} KB")

    if not moi:
        sys.exit("\nKhông xử lý được ảnh nào.")

    khoi = "".join(
        f"  - file: /media/bo-anh/{slug}/{f}\n"
        f"    alt: \"\"   # <-- TẢ NỘI DUNG ẢNH BẰNG MỘT CÂU\n"
        for f in moi
    )

    if os.path.exists(file_md):
        s = open(file_md, encoding="utf-8").read().rstrip()
        assert s.endswith("---"), f"{file_md} không kết thúc bằng ---"
        open(file_md, "w", encoding="utf-8").write(s[:-3] + khoi + "---\n")
        print(f"\nĐã nối {len(moi)} ảnh vào {file_md}")
    else:
        open(file_md, "w", encoding="utf-8").write(
            "---\n"
            f"ten: {ten_hien_thi}\n"
            "hien: true\n"
            "ngay: 2026-01-01   # <-- SỬA NGÀY CHỤP\n"
            f"cover: /media/bo-anh/{slug}/{moi[0]}\n"
            "tags:\n  - Đời thường\n"
            'giai_thuong: ""\n'
            "mo_ta: >\n  <-- VIẾT MỘT HAI CÂU GIỚI THIỆU BỘ ẢNH\n"
            "anh:\n" + khoi + "---\n"
        )
        print(f"\nĐã tạo {file_md}")

    print(f"{tong_goc/1024/1024:.1f} MB -> {tong_moi/1024/1024:.1f} MB"
          + (f"  ({bo_qua} ảnh lỗi)" if bo_qua else ""))
    print("\nCÒN LẠI: mở file .md, điền alt cho từng ảnh, rồi đẩy lên GitHub.")
    print("Ô alt để trống thì ảnh vẫn hiện, nhưng Google Hình ảnh sẽ bỏ qua.")


if __name__ == "__main__":
    main()
