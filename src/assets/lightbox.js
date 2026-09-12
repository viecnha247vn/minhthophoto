// Xem ảnh phóng to. Viết tay ~90 dòng thay vì kéo thư viện về —
// site không có bundler, thêm dependency là thêm thứ phải bảo trì.
(function () {
  var nut = Array.prototype.slice.call(document.querySelectorAll('.gal-mo'));
  if (!nut.length) return;

  var i = 0;
  var moTu = null; // nút đã mở lightbox, để trả focus về đúng chỗ

  var lop = document.createElement('div');
  lop.className = 'lb';
  lop.setAttribute('role', 'dialog');
  lop.setAttribute('aria-modal', 'true');
  lop.setAttribute('aria-label', 'Xem ảnh phóng to');
  lop.hidden = true;
  lop.innerHTML =
    '<button type="button" class="lb-dong" aria-label="Đóng">&times;</button>' +
    '<button type="button" class="lb-truoc" aria-label="Ảnh trước">&#8249;</button>' +
    '<figure class="lb-khung"><img alt=""><figcaption class="lb-chu"></figcaption></figure>' +
    '<button type="button" class="lb-sau" aria-label="Ảnh tiếp theo">&#8250;</button>' +
    '<p class="lb-dem" aria-live="polite"></p>';
  document.body.appendChild(lop);

  var img = lop.querySelector('img');
  var chu = lop.querySelector('.lb-chu');
  var dem = lop.querySelector('.lb-dem');

  function nap(n) {
    i = (n + nut.length) % nut.length;
    var d = nut[i].dataset;
    img.src = d.to;
    img.alt = d.moTa;
    img.width = d.w;
    img.height = d.h;
    // Chú thích hiện dưới ảnh là chú thích do người biên tập viết, KHÔNG phải
    // alt. Alt tả lại đúng thứ người sáng mắt đang nhìn thấy — in ra thành chữ
    // dưới ảnh vừa thừa, vừa làm trình đọc màn hình đọc hai lần.
    chu.textContent = d.chuThich || '';
    chu.hidden = !d.chuThich;
    dem.textContent = (i + 1) + ' / ' + nut.length;
    // Nạp sẵn ảnh kế tiếp để bấm mũi tên không phải chờ
    if (nut.length > 1) new Image().src = nut[(i + 1) % nut.length].dataset.to;
  }

  function mo(n, tu) {
    moTu = tu;
    nap(n);
    lop.hidden = false;
    document.body.style.overflow = 'hidden';
    lop.querySelector('.lb-dong').focus();
  }

  function dong() {
    lop.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
    if (moTu) moTu.focus();
  }

  nut.forEach(function (b, n) {
    b.addEventListener('click', function () { mo(n, b); });
  });

  lop.querySelector('.lb-dong').addEventListener('click', dong);
  lop.querySelector('.lb-truoc').addEventListener('click', function () { nap(i - 1); });
  lop.querySelector('.lb-sau').addEventListener('click', function () { nap(i + 1); });
  lop.addEventListener('click', function (e) {
    if (e.target === lop) dong(); // bấm ra nền để đóng
  });

  document.addEventListener('keydown', function (e) {
    if (lop.hidden) return;
    if (e.key === 'Escape') dong();
    else if (e.key === 'ArrowLeft') nap(i - 1);
    else if (e.key === 'ArrowRight') nap(i + 1);
    else if (e.key === 'Tab') {
      // Giữ focus trong lightbox
      var duoc = lop.querySelectorAll('button');
      var dau = duoc[0], cuoi = duoc[duoc.length - 1];
      if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); }
      else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); }
    }
  });

  // Vuốt trên điện thoại
  var x0 = null;
  lop.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lop.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var d = e.changedTouches[0].clientX - x0;
    if (Math.abs(d) > 50) nap(d < 0 ? i + 1 : i - 1);
    x0 = null;
  }, { passive: true });
})();
