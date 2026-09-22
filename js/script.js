// Services dropdown — open on hover (desktop) in addition to click, no flicker
document.querySelectorAll('.services-dropdown').forEach((dropdownParent) => {
  const toggle = dropdownParent.querySelector('[data-bs-toggle="dropdown"]');
  if (!toggle || typeof bootstrap === 'undefined') return;
  const dropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
  let closeTimer;

  const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isHoverCapable) return; // touch devices keep tap-to-open only

  dropdownParent.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
    dropdown.show();
  });
  dropdownParent.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(() => dropdown.hide(), 150);
  });
});

// Go-to-top button (not present on every page, e.g. 404.html)
const goTop = document.getElementById('goTop');
if (goTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      goTop.classList.add('show');
    } else {
      goTop.classList.remove('show');
    }
  });

  goTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Services section — "Show more" reveals the rest of each category's cards
document.querySelectorAll('.services-toggle-btn').forEach((btn) => {
  const wrap = btn.closest('.container');
  if (!wrap) return;
  const extras = wrap.querySelectorAll('.services-extra');
  const moreLabel = btn.querySelector('.show-more-label');
  const lessLabel = btn.querySelector('.show-less-label');
  const icon = btn.querySelector('.bi');

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    extras.forEach((card) => card.classList.toggle('d-none', expanded));
    btn.setAttribute('aria-expanded', String(!expanded));
    if (moreLabel) moreLabel.classList.toggle('d-none', !expanded);
    if (lessLabel) lessLabel.classList.toggle('d-none', expanded);
    if (icon) {
      icon.classList.toggle('bi-chevron-down', expanded);
      icon.classList.toggle('bi-chevron-up', !expanded);
    }
  });
});

// Booking form — validates, builds a WhatsApp message and opens it for the customer to send
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const bookingNote = document.getElementById('bookingNote');
  const WHATSAPP_NUMBER = '966557232580';

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      if (bookingNote) {
        const lang = document.documentElement.getAttribute('lang') || 'ar';
        bookingNote.textContent = (lang === 'en' && window.__en && window.__en['booking.note.error']) ? window.__en['booking.note.error'] : 'يرجى تعبئة جميع الحقول المطلوبة.';
        bookingNote.classList.remove('success');
        bookingNote.classList.add('error');
      }
      return;
    }

    const name = bookingForm.querySelector('[name="name"]').value.trim();
    const phone = bookingForm.querySelector('[name="phone"]').value.trim();
    const email = bookingForm.querySelector('[name="email"]').value.trim();
    const serviceSelect = bookingForm.querySelector('[name="service"]');
    const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
    const detail = bookingForm.querySelector('[name="detail"]').value.trim();

    const lines = [
      'طلب حجز جديد من الموقع:',
      'الاسم: ' + name,
      'رقم الهاتف: ' + phone,
      'البريد الإلكتروني: ' + email,
      'نوع الخدمة: ' + serviceText,
      'تفاصيل الخدمة: ' + (detail || '-')
    ];
    const message = encodeURIComponent(lines.join('\n'));
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + message, '_blank', 'noopener');

    if (bookingNote) {
      const lang = document.documentElement.getAttribute('lang') || 'ar';
      bookingNote.textContent = (lang === 'en' && window.__en && window.__en['booking.note.success']) ? window.__en['booking.note.success'] : 'تم إعداد طلبك بنجاح! أكمل الإرسال عبر واتساب.';
      bookingNote.classList.remove('error');
      bookingNote.classList.add('success');
    }
    bookingForm.reset();
  });
}
