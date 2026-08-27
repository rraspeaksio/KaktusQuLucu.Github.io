document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header berubah saat scroll ---------- */
  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 12;
    header.classList.toggle('is-scrolled', scrolled);
    toTop.classList.toggle('is-visible', window.scrollY > 500);
  });

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open);
    navToggle.innerHTML = open
      ? '<svg width="24" height="24"><use href="#icon-close"/></svg>'
      : '<svg width="24" height="24"><use href="#icon-menu"/></svg>';
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', false);
      navToggle.innerHTML = '<svg width="24" height="24"><use href="#icon-menu"/></svg>';
    });
  });

  /* ---------- Reveal saat scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Filter kategori produk ---------- */
  const filterBar = document.getElementById('filterBar');
  const productCards = document.querySelectorAll('.product-card');
  const emptyState = document.getElementById('emptyState');

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    filterBar.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
    btn.classList.add('is-active');

    const filter = btn.dataset.filter;
    let visibleCount = 0;
    productCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    emptyState.hidden = visibleCount !== 0;
  });

  /* ---------- Wishlist (suka) ---------- */
  document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('is-active'));
  });

  /* ---------- Keranjang (demo, tanpa backend) ---------- */
  let cartCount = 0;
  const cartCountEl = document.getElementById('cartCount');

  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      cartCount++;
      cartCountEl.textContent = cartCount;
      cartCountEl.classList.remove('bump');
      void cartCountEl.offsetWidth; // reset animasi
      cartCountEl.classList.add('bump');

      const originalText = btn.textContent;
      btn.textContent = 'Ditambahkan ✓';
      btn.classList.add('is-added');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('is-added');
      }, 1200);
    });
  });

  /* ---------- Pilih metode pembayaran ---------- */
  const paymentGrid = document.getElementById('paymentGrid');
  const paymentDetails = document.querySelectorAll('.payment-detail-item');

  paymentGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.payment-card');
    if (!card) return;
    paymentGrid.querySelectorAll('.payment-card').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');

    const method = card.dataset.pay;
    paymentDetails.forEach(detail => {
      detail.hidden = detail.dataset.detail !== method;
    });
  });

  /* ---------- Kembali ke atas ---------- */
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
