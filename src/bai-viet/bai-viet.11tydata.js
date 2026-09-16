/**
 * Dữ liệu chung cho mọi bài viết.
 *
 * Bài dẫn nguồn báo khác (có `lien_ket`) thì KHÔNG sinh trang riêng —
 * thẻ trên trang Bài viết trỏ thẳng ra báo gốc. Bài anh Thọ tự viết
 * (không có `lien_ket`) thì sinh trang /bai-viet/<slug>/.
 */
module.exports = {
  layout: "bai-viet-chi-tiet.njk",
  hien: true,
  eleventyComputed: {
    permalink: (data) =>
      data.lien_ket ? false : `/bai-viet/${data.page.fileSlug}/index.html`,
  },
};
