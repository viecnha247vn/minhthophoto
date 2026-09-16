const path = require("path");
const fs = require("fs");
const sizeOf = require("image-size");

const CAC_CO = [600, 1200, 2000];
const CHAT_LUONG = 82;

// Ở local (eleventy --serve) không có /_vercel/image, nên dùng thẳng file gốc.
const TREN_VERCEL = !!process.env.VERCEL;

/**
 * Đọc kích thước thật của ảnh. image-size chỉ đọc vài chục byte đầu file
 * chứ không giải mã ảnh, nên gần như tức thì — build không chậm đi dù có
 * bao nhiêu bộ ảnh. Đây là khác biệt then chốt so với bản Netlify: ở đó
 * eleventy-img phải resize thật, mà Vercel không cache kết quả giữa các
 * lần deploy, nên mỗi lần deploy là resize lại từ đầu.
 */
function kichThuoc(src) {
  const tren_dia = src.startsWith("/") ? path.join("src", src) : src;
  if (!fs.existsSync(tren_dia)) {
    // Thiếu file thì cảnh báo rồi đi tiếp — đừng để cả bản build đổ vì một ảnh
    console.warn(`[anh] Không tìm thấy file: ${tren_dia}`);
    return { width: 1600, height: 1067 };
  }
  const { width, height } = sizeOf(tren_dia);
  return { width, height };
}

/** URL qua bộ tối ưu ảnh của Vercel. Cỡ phải khớp images.sizes trong vercel.json. */
function urlAnh(src, w) {
  if (!TREN_VERCEL) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${w}&q=${CHAT_LUONG}`;
}

function srcsetAnh(src, rong_goc) {
  return CAC_CO.filter((w) => w <= rong_goc || w === CAC_CO[0])
    .map((w) => `${urlAnh(src, w)} ${w}w`)
    .join(", ");
}

function thoat(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  eleventyConfig.addCollection("boAnh", (api) =>
    api
      .getFilteredByGlob("src/bo-anh/*.md")
      .filter((x) => x.data.hien !== false)
      .sort((a, b) => new Date(b.data.ngay) - new Date(a.data.ngay))
  );

  eleventyConfig.addCollection("baiViet", (api) =>
    api
      .getFilteredByGlob("src/bai-viet/*.md")
      .filter((x) => x.data.hien !== false)
      .sort((a, b) => new Date(b.data.ngay) - new Date(a.data.ngay))
  );

  /**
   * Một ảnh trong bộ. Kích thước thật dùng cho hai việc:
   *  - width/height => trình duyệt chừa sẵn chỗ, trang không giật khi ảnh về
   *  - tỉ lệ        => tự biết ảnh ngang hay dọc, khỏi bắt anh Thọ chọn tay
   */
  eleventyConfig.addShortcode("anh", function (item, sizes) {
    const { width, height } = kichThuoc(item.file);
    const ngang = width / height > 1.2;
    const chu_thich = item.chu_thich
      ? `<figcaption>${thoat(item.chu_thich)}</figcaption>`
      : "";

    return `<figure class="gal-o ${ngang ? "la-ngang" : "la-doc"}">
  <button type="button" class="gal-mo"
          data-to="${urlAnh(item.file, 2000)}" data-w="${width}" data-h="${height}"
          data-mo-ta="${thoat(item.alt)}" data-chu-thich="${thoat(item.chu_thich || "")}"
          aria-label="Phóng to: ${thoat(item.alt)}">
    <img src="${urlAnh(item.file, 1200)}" srcset="${srcsetAnh(item.file, width)}"
         sizes="${sizes || "(max-width: 860px) 100vw, 50vw"}"
         width="${width}" height="${height}"
         alt="${thoat(item.alt)}" loading="lazy" decoding="async">
  </button>${chu_thich}
</figure>`;
  });

  /** Ảnh bìa cho lưới ở trang Nghệ thuật. */
  eleventyConfig.addShortcode("bia", function (src, alt, sizes) {
    const { width, height } = kichThuoc(src);
    return `<img src="${urlAnh(src, 1200)}" srcset="${srcsetAnh(src, width)}"
      sizes="${sizes || "(max-width: 860px) 100vw, 560px"}"
      width="${width}" height="${height}"
      alt="${thoat(alt)}" loading="lazy" decoding="async">`;
  });

  /**
   * URL tuyệt đối cho og:image. Trỏ thẳng file gốc chứ không qua
   * /_vercel/image — trình thu thập của Facebook/Zalo hay bỏ qua URL có
   * query string, và ảnh gốc đã là WebP ~2400px do Sveltia nén sẵn.
   */
  eleventyConfig.addFilter("anhTuyetDoi", (src, goc) =>
    goc.replace(/\/$/, "") + src
  );

  eleventyConfig.addFilter("ngayVN", (d) => {
    if (!d) return "";
    const x = new Date(d);
    return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
  });

  eleventyConfig.addFilter("nam", (d) => (d ? new Date(d).getFullYear() : ""));

  /**
   * Hai mục trên site dùng chung một collection:
   *   nghe-thuat  — tác phẩm (mặc định)
   *   du-an       — bộ ảnh dịch vụ, hiện dưới trang Dịch vụ
   */
  eleventyConfig.addFilter("theoLoai", (bo, loai) =>
    bo.filter((b) => (b.data.loai || "nghe-thuat") === loai)
  );

  /** Alt của ảnh bìa = alt của chính tấm đó trong bộ, không lấy tên bộ. */
  eleventyConfig.addFilter("altBia", (data) => {
    const ds = Array.isArray(data && data.anh) ? data.anh : [];
    const a = ds.find((x) => x && x.file === data.cover);
    return a && a.alt ? a.alt : (data && data.ten) || "";
  });

  /** Các trang HTML cho sitemap: URL kết thúc bằng "/" (bỏ robots, sitemap, file). */
  eleventyConfig.addCollection("trangSitemap", (api) =>
    api.getAll().filter((p) => p.url && p.url.endsWith("/"))
  );

  /** YYYY-MM-DD cho sitemap. */
  eleventyConfig.addFilter("dateXML", (d) =>
    new Date(d || Date.now()).toISOString().slice(0, 10)
  );

  return {
    // `.` là gốc repo; input/output tính từ đó
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
