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

  /* =====================================================================
     KERANJANG + CHECKOUT
     Data keranjang disimpan di localStorage supaya tidak hilang saat
     halaman di-refresh. Nomor WhatsApp admin & rekening ada di bagian
     KONFIGURASI di bawah — tinggal ganti sesuai data toko asli.
  ===================================================================== */

  const CONFIG = {
    // Ganti dengan nomor WhatsApp admin format internasional tanpa "+" atau "0" di depan
    whatsappNumber: '628123456789'
  };

  const STORAGE_KEY = 'kaktus_cart_v1';
  const cartCountEl = document.getElementById('cartCount');
  const cartDrawer = document.getElementById('cartDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyMsg = document.getElementById('cartEmptyMsg');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const goToCheckoutBtn = document.getElementById('goToCheckoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutItemsEl = document.getElementById('checkoutItems');
  const checkoutTotalEl = document.getElementById('checkoutTotal');

  const formatRp = (n) => 'Rp' + n.toLocaleString('id-ID');

  const loadCart = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  };
  let cart = loadCart(); // [{ id, name, price, img, qty }]
  const saveCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

  const parsePrice = (priceEl) => {
    const raw = priceEl.childNodes[0]?.textContent || priceEl.textContent;
    return parseInt(raw.replace(/[^\d]/g, ''), 10) || 0;
  };

  const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartQty = () => cart.reduce((sum, item) => sum + item.qty, 0);

  function renderCartCount() {
    const qty = cartQty();
    cartCountEl.textContent = qty;
    cartCountEl.classList.remove('bump');
    void cartCountEl.offsetWidth;
    cartCountEl.classList.add('bump');
  }

  function renderCartDrawer() {
    cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
    cartEmptyMsg.hidden = cart.length !== 0;
    goToCheckoutBtn.disabled = cart.length === 0;

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.id = item.id;
      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div>
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${formatRp(item.price)} /pcs</p>
          <div class="cart-item-qty">
            <button type="button" data-action="dec" aria-label="Kurangi jumlah">−</button>
            <span>${item.qty}</span>
            <button type="button" data-action="inc" aria-label="Tambah jumlah">+</button>
          </div>
        </div>
        <div>
          <button type="button" class="cart-item-remove" data-action="remove">Hapus</button>
        </div>
        <p class="cart-item-linetotal">${formatRp(item.price * item.qty)}</p>
      `;
      cartItemsEl.appendChild(row);
    });

    cartSubtotalEl.textContent = formatRp(cartTotal());
  }

  /* ---------- Ongkos kirim (estimasi flat-rate per wilayah, prototipe) ----------
     Ini perkiraan kasar, bukan hitungan real-time dari kurir. Untuk ongkir akurat
     per berat/jarak, ganti dengan integrasi API RajaOngkir/Komship/Biteship. */
  const shippingZoneEl = document.getElementById('shippingZone');
  const shippingCost = () => parseInt(shippingZoneEl.value, 10) || 0;

  function renderCheckoutSummary() {
    checkoutItemsEl.innerHTML = cart.map(item => `
      <div class="checkout-item-row">
        <span>${item.name} × ${item.qty}</span>
        <strong>${formatRp(item.price * item.qty)}</strong>
      </div>
    `).join('') + `
      <div class="checkout-item-row">
        <span>Ongkos kirim</span>
        <strong>${formatRp(shippingCost())}</strong>
      </div>
    `;
    checkoutTotalEl.textContent = formatRp(cartTotal() + shippingCost());
  }

  shippingZoneEl.addEventListener('change', renderCheckoutSummary);

  function renderAll() {
    renderCartCount();
    renderCartDrawer();
    saveCart();
  }

  function addToCart(id, name, price, img) {
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty++;
    else cart.push({ id, name, price, img, qty: 1 });
    renderAll();
  }

  /* ---------- Varian harga: bikin dropdown otomatis dari <ul class="price-list"> ----------
     Produk dengan beberapa opsi harga (mis. 1–49 pcs / 50–99 pcs / ≥100 pcs, atau
     tipe/ukuran berbeda) dapat dropdown pemilih; harga di kartu ikut berubah sesuai
     pilihan, dan itu yang dipakai saat "+ Keranjang" ditekan. Produk dengan 1 harga saja
     tidak diberi dropdown. ---------- */
  document.querySelectorAll('.product-card').forEach(card => {
    const list = card.querySelector('.price-list');
    const priceEl = card.querySelector('.price');
    if (!list || !priceEl) return;

    const options = Array.from(list.querySelectorAll('li')).map(li => ({
      label: li.querySelector('span')?.textContent.trim() || '',
      price: parsePrice(li.querySelector('b'))
    }));
    if (options.length < 2) return;

    const select = document.createElement('select');
    select.className = 'variant-select';
    select.setAttribute('aria-label', 'Pilih varian / jumlah pesanan');
    options.forEach((opt, i) => {
      const optionEl = document.createElement('option');
      optionEl.value = i;
      optionEl.textContent = `${opt.label} — ${formatRp(opt.price)}`;
      select.appendChild(optionEl);
    });

    select.addEventListener('change', () => {
      const opt = options[select.value];
      priceEl.childNodes[0].textContent = formatRp(opt.price);
      card.dataset.variant = opt.label;
    });

    card.querySelector('.product-bottom').insertAdjacentElement('beforebegin', select);
    card.dataset.variant = options[0].label;
  });

  /* ---------- Tambah ke keranjang dari kartu produk ---------- */
  document.querySelectorAll('.product-card').forEach(card => {
    const btn = card.querySelector('.btn-add');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const baseName = btn.dataset.name;
      const variant = card.dataset.variant;
      // Varian beda dianggap item beda supaya tidak tergabung jadi satu baris di keranjang
      const name = variant ? `${baseName} (${variant})` : baseName;
      const priceEl = card.querySelector('.price');
      const price = parsePrice(priceEl);
      const img = card.querySelector('img')?.getAttribute('src') || '';
      addToCart(name, name, price, img);

      const originalText = btn.textContent;
      btn.textContent = 'Ditambahkan ✓';
      btn.classList.add('is-added');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('is-added');
      }, 1200);
    });
  });

  /* ---------- Ubah qty / hapus item dari drawer ---------- */
  cartItemsEl.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const row = actionBtn.closest('.cart-item');
    const id = row.dataset.id;
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (actionBtn.dataset.action === 'inc') item.qty++;
    if (actionBtn.dataset.action === 'dec') {
      item.qty--;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    }
    if (actionBtn.dataset.action === 'remove') cart = cart.filter(i => i.id !== id);

    renderAll();
  });

  /* ---------- Buka / tutup drawer keranjang ---------- */
  function openCart() {
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.classList.add('is-open');
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    if (!checkoutModal.classList.contains('is-open')) drawerOverlay.classList.remove('is-open');
  }
  document.getElementById('cartBtn').addEventListener('click', () => {
    renderCartDrawer();
    openCart();
  });
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
  document.getElementById('continueShoppingBtn').addEventListener('click', closeCart);

  /* ---------- Buka / tutup checkout ---------- */
  function openCheckout() {
    if (cart.length === 0) return;
    renderCheckoutSummary();
    closeCart();
    checkoutModal.classList.add('is-open');
    checkoutModal.setAttribute('aria-hidden', 'false');
    drawerOverlay.classList.add('is-open');
  }
  function closeCheckout() {
    checkoutModal.classList.remove('is-open');
    checkoutModal.setAttribute('aria-hidden', 'true');
    drawerOverlay.classList.remove('is-open');
  }
  document.getElementById('goToCheckoutBtn').addEventListener('click', openCheckout);
  document.getElementById('checkoutCloseBtn').addEventListener('click', closeCheckout);

  drawerOverlay.addEventListener('click', () => {
    closeCart();
    closeCheckout();
  });

  /* ---------- Pilih metode pembayaran (section "Pembayaran" di halaman) ---------- */
  const paymentGrid = document.getElementById('paymentGrid');
  const paymentDetails = document.querySelectorAll('#paymentDetail .payment-detail-item');

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

  /* ---------- Pilih metode pembayaran (di dalam modal checkout) ---------- */
  const checkoutPaymentGrid = document.getElementById('checkoutPaymentGrid');
  const checkoutPaymentDetails = document.querySelectorAll('#checkoutPaymentDetail .payment-detail-item');
  let selectedPayment = 'bank';

  checkoutPaymentGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.payment-card');
    if (!card) return;
    checkoutPaymentGrid.querySelectorAll('.payment-card').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');
    selectedPayment = card.dataset.pay;
    checkoutPaymentDetails.forEach(detail => {
      detail.hidden = detail.dataset.detail !== selectedPayment;
    });
  });

  const paymentLabels = {
    bank: 'Transfer Bank',
    ewallet: 'E-Wallet (GoPay/OVO/DANA/ShopeePay)',
    qris: 'QRIS',
    cod: 'COD (Bayar di Tempat)'
  };

  /* ---------- Kirim pesanan via WhatsApp ---------- */
  const sendOrderBtn = document.getElementById('sendOrderBtn');
  const checkoutError = document.getElementById('checkoutError');

  sendOrderBtn.addEventListener('click', () => {
    const name = document.getElementById('buyerName').value.trim();
    const phone = document.getElementById('buyerPhone').value.trim();
    const address = document.getElementById('buyerAddress').value.trim();
    const note = document.getElementById('buyerNote').value.trim();

    if (!name || !phone || !address || cart.length === 0) {
      checkoutError.hidden = false;
      return;
    }
    checkoutError.hidden = true;

    const itemLines = cart.map(item =>
      `- ${item.name} x${item.qty} = ${formatRp(item.price * item.qty)}`
    ).join('\n');
    const shipping = shippingCost();
    const zoneLabel = shippingZoneEl.options[shippingZoneEl.selectedIndex].textContent;

    const message =
`Halo KaktusQuLucu, saya mau pesan 🌵

*Detail Pesanan:*
${itemLines}

Subtotal: ${formatRp(cartTotal())}
Ongkir (${zoneLabel}): ${formatRp(shipping)}
*Total: ${formatRp(cartTotal() + shipping)}*
*Metode Bayar:* ${paymentLabels[selectedPayment]}

*Data Pengiriman:*
Nama: ${name}
No. WA: ${phone}
Alamat: ${address}${note ? `\nCatatan: ${note}` : ''}`;

    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  /* ---------- Render awal saat halaman dibuka ---------- */
  renderCartCount();
  renderCartDrawer();

  /* ---------- Kembali ke atas ---------- */
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
