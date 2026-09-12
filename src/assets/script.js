// Phan Media — shared scripts
(function () {
  // Nav scroll state (chỉ áp dụng khi nav không phải dạng "solid" cố định)
  var nav = document.getElementById('nav');
  if (nav && !nav.classList.contains('solid')) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Mobile menu
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', false);
      });
    });
  }

  // Scroll reveal
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .14 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Toast
  function showToast(t) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = t; toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }

  // Booking form -> Zalo
  // Gom thông tin -> copy clipboard -> mở Zalo để dán & gửi (không cần server).
  //
  // Hai chỗ dễ sai, đã sửa:
  //  1. f.name KHÔNG phải ô "Họ và tên". HTMLFormElement có sẵn thuộc tính
  //     .name (thuộc tính name của thẻ <form>), nó che mất ô input cùng tên,
  //     nên f.name.value là undefined và tên khách luôn ra "—".
  //     => lấy qua f.elements['name'].
  //  2. window.open phải chạy NGAY trong lần bấm, không được để trong .then()
  //     hay setTimeout — mọi trình duyệt đều coi đó là popup tự mở và chặn.
  //     => mở tab trước, chép clipboard sau; cả hai vẫn nằm trong một lần bấm.
  var ZALO = '0976722420';
  var form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var o = form.elements;
      var lay = function (ten) {
        return (o[ten] && o[ten].value ? o[ten].value.trim() : '') || '—';
      };
      var text = [
        'YÊU CẦU CHỤP ẢNH',
        'Họ tên: ' + lay('name'),
        'SĐT: ' + lay('phone'),
        'Loại hình: ' + lay('type'),
        'Ngày dự kiến: ' + lay('date'),
        'Mong muốn: ' + lay('msg')
      ].join('\n');

      var tab = window.open('https://zalo.me/' + ZALO, '_blank', 'noopener');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast(tab
            ? 'Đã sao chép thông tin — dán vào Zalo và gửi nhé!'
            : 'Đã sao chép thông tin — mở Zalo 0976 722 420 rồi dán vào nhé!');
        }).catch(function () { chepTay(text); });
      } else { chepTay(text); }
    });
  }

  // Trình duyệt cũ hoặc trang không chạy https thì clipboard API không có.
  // Hiện sẵn nội dung đã bôi đen để khách chỉ cần Ctrl+C.
  function chepTay(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    var xong = false;
    try { xong = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    showToast(xong
      ? 'Đã sao chép thông tin — dán vào Zalo và gửi nhé!'
      : 'Hãy nhắn Zalo 0976 722 420 kèm tên, SĐT và ngày dự kiến nhé!');
  }
})();
