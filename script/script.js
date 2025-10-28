document.addEventListener('DOMContentLoaded', function () {
  // ---------------- Toasts ----------------
  var toastContainer = document.createElement('div');
  toastContainer.id = 'toastContainer';
  toastContainer.className = 'fixed top-4 right-4 flex flex-col gap-2 z-50';
  document.body.appendChild(toastContainer);

  function showToast(message, duration) {
    if (duration === undefined) duration = 2000;

    var toast = document.createElement('div');
    toast.className = 'bg-yellow-500 text-black px-7 py-2 rounded shadow-md opacity-0 translate-x-4 transition-all duration-300';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.remove('opacity-0', 'translate-x-4');
      toast.classList.add('opacity-100', 'translate-x-0');
    });

    setTimeout(function () {
      toast.classList.remove('opacity-100', 'translate-x-0');
      toast.classList.add('opacity-0', 'translate-x-4');
      toast.addEventListener('transitionend', function () {
        toast.remove();
      }, {
        once: true
      });
    }, duration);
  }

  // ---------------- Tabs ----------------
  var tabButtons = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener('click', function () {
      var tabId = this.dataset.tab;

      for (var j = 0; j < tabButtons.length; j++) {
        tabButtons[j].classList.remove('active', 'bg-yellow-500', 'text-white');
        tabButtons[j].classList.add('bg-gray-200', 'text-black');
      }

      for (var k = 0; k < tabContents.length; k++) {
        tabContents[k].classList.add('hidden');
      }

      this.classList.add('active', 'bg-yellow-500', 'text-white');
      this.classList.remove('bg-gray-200');

      var tabElement = document.getElementById(tabId);
      if (tabElement) tabElement.classList.remove('hidden');
    });
  }

  // ---------------- Cart ----------------
  var cartOverlay = document.getElementById('cartOverlay');
  var cartItemsContainer = document.getElementById('cartItems');
  var cartTotalEl = document.getElementById('cartTotal');
  var cartButton = document.getElementById('cartButton');
  var closeCart = document.getElementById('closeCart');
  var cartCountEl = document.querySelector('#cartButton span');
  var cart = JSON.parse(localStorage.getItem('cart')) || [];

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCounter();
  }

  function updateCartCounter() {
    if (cartCountEl) {
      var totalCount = 0;
      for (var i = 0; i < cart.length; i++) {
        totalCount += cart[i].quantity;
      }
      cartCountEl.textContent = totalCount;
    }
  }

  function renderCart() {
    if (!cartItemsContainer || !cartTotalEl) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<div class="text-center text-gray-500 py-8">' +
        '<svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21"></path>' +
        '</svg><p class="text-lg">Корзина пуста</p></div>';
      cartTotalEl.textContent = '0 ₽';
      return;
    }

    var total = 0;

    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      total += item.price * item.quantity;

      var itemEl = document.createElement('div');
      itemEl.className = 'flex justify-between items-center bg-gray-100 rounded-lg p-4';
      itemEl.innerHTML =
        '<div>' +
        '<h4 class="font-semibold text-gray-900">' + item.name + '</h4>' +
        '<p class="text-gray-600 text-sm">' + item.quantity + ' × ' + item.price.toLocaleString() + ' ₽</p>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
        '<button class="decrease text-red-500 font-bold px-2">−</button>' +
        '<button class="increase text-green-500 font-bold px-2">+</button>' +
        '</div>';

      var decreaseBtn = itemEl.querySelector('.decrease');
      var increaseBtn = itemEl.querySelector('.increase');

      (function (item) {
        if (decreaseBtn) {
          decreaseBtn.addEventListener('click', function () {
            item.quantity--;
            if (item.quantity <= 0) {
              cart = cart.filter(function (p) {
                return p.id !== item.id;
              });
              showToast('❌ Товар удалён из корзины');
            } else {
              showToast('❌ ' + item.name + ' количество: ' + item.quantity);
            }
            saveCart();
          });
        }

        if (increaseBtn) {
          increaseBtn.addEventListener('click', function () {
            item.quantity++;
            showToast('✅ ' + item.name + ' количество: ' + item.quantity);
            saveCart();
          });
        }
      })(item);

      cartItemsContainer.appendChild(itemEl);
    }

    cartTotalEl.textContent = total.toLocaleString() + ' ₽';
  }

  // ---------------- Add to Cart ----------------
  var addToCartBtns = document.querySelectorAll('.add-to-cart');
  for (var i = 0; i < addToCartBtns.length; i++) {
    addToCartBtns[i].addEventListener('click', function () {
      var productId = this.dataset.productId;
      var product = products ? products[productId] : null;
      if (!product) return;

      var item = null;
      for (var j = 0; j < cart.length; j++) {
        if (cart[j].id === productId) {
          item = cart[j];
          break;
        }
      }

      if (item) item.quantity++;
      else cart.push({
        ...product,
        quantity: 1
      });

      saveCart();
      showToast('✅ Товар добавлен в корзину!');

      if (cartOverlay && cartOverlay.className.indexOf('hidden') === -1) renderCart();
    });
  }

  // ---------------- Show / Hide Cart ----------------
  function showCartOverlay() {
    if (!cartOverlay) return;
    cartOverlay.classList.remove('hidden');
    renderCart();
  }

  function hideCartOverlay() {
    if (!cartOverlay) return;
    cartOverlay.classList.add('hidden');
  }

  if (cartButton) {
    cartButton.addEventListener('click', function (e) {
      e.stopPropagation();
      showCartOverlay();
    });
  }

  if (closeCart) {
    closeCart.addEventListener('click', function (e) {
      e.stopPropagation(); // предотвращает всплытие и баг с hover
      hideCartOverlay();
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', function (e) {
      if (e.target === cartOverlay) hideCartOverlay();
    });
  }

  // ---------------- Mobile Menu ----------------
  var burgerButton = document.getElementById('burgerButton');
  var mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  var closeMobileMenu = document.getElementById('closeMobileMenu');

  var orderOverlay = document.getElementById('orderOverlay');

  if (burgerButton && mobileMenuOverlay && closeMobileMenu) {
    var mobileMenu = mobileMenuOverlay.querySelector('.fixed.right-0');
    if (mobileMenu) mobileMenu.style.transform = 'translateX(100%)';

    function openMobileMenu() {
      mobileMenuOverlay.classList.remove('hidden');
      requestAnimationFrame(function () {
        if (mobileMenu) mobileMenu.style.transform = 'translateX(0)';
      });
      if (cartOverlay) cartOverlay.classList.add('hidden');
      if (orderOverlay) orderOverlay.classList.add('hidden');
    }

    function closeMobileMenuAnimated() {
      if (mobileMenu) mobileMenu.style.transform = 'translateX(100%)';
      if (mobileMenu) {
        mobileMenu.addEventListener('transitionend', function () {
          mobileMenuOverlay.classList.add('hidden');
        }, {
          once: true
        });
      }
    }

    burgerButton.addEventListener('click', function (e) {
      e.stopPropagation();
      openMobileMenu();
    });
    closeMobileMenu.addEventListener('click', closeMobileMenuAnimated);
    mobileMenuOverlay.addEventListener('click', function (e) {
      if (e.target === mobileMenuOverlay) closeMobileMenuAnimated();
    });
  }

  // ---------------- Order Modal ----------------
  var checkoutButton = document.getElementById('checkoutButton');
  var closeOrder = document.getElementById('closeOrder');
  var backToCart = document.getElementById('backToCart');
  var orderWindow = orderOverlay ? orderOverlay.querySelector('.bg-white') : null;
  var phoneInput = document.getElementById('phoneInput');
  var orderForm = document.getElementById('orderForm');
  var orderItemsContainer = document.getElementById('orderItems');
  var orderTotalEl = document.getElementById('orderTotal');

  function showOrderOverlay() {
    if (!orderOverlay || !orderWindow) return;
    orderOverlay.classList.remove('hidden');
    orderWindow.style.transform = 'scale(0.95)';
    requestAnimationFrame(function () {
      orderWindow.style.transform = 'scale(1)';
    });
    renderOrderSummary();
  }

  function hideOrderOverlay() {
    if (!orderOverlay || !orderWindow) return;
    orderWindow.style.transform = 'scale(0.95)';
    orderOverlay.addEventListener('transitionend', function () {
      orderOverlay.classList.add('hidden');
    }, {
      once: true
    });
  }

  if (checkoutButton) checkoutButton.addEventListener('click', function () {
    hideCartOverlay();
    showOrderOverlay();
  });
  if (closeOrder) closeOrder.addEventListener('click', hideOrderOverlay);
  if (backToCart) backToCart.addEventListener('click', function () {
    hideOrderOverlay();
    showCartOverlay();
  });
  if (orderOverlay) orderOverlay.addEventListener('click', function (e) {
    if (e.target === orderOverlay) hideOrderOverlay();
  });

  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('✅ Заказ отправлен!');
      hideOrderOverlay();
      orderForm.reset();
      cart = [];
      saveCart();
    });
  }

  // ---------------- Phone Mask ----------------
  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      var value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      value = value.substring(0, 11);

      var formatted = '+7';
      if (value.length > 1) formatted += ' (' + value.substring(1, 4);
      if (value.length >= 4) formatted += ') ' + value.substring(4, 7);
      if (value.length >= 7) formatted += '-' + value.substring(7, 9);
      if (value.length >= 9) formatted += '-' + value.substring(9, 11);

      e.target.value = formatted;
    });
  }

  // ---------------- Products Dropdown ----------------
  var productsBtn = document.getElementById('productsBtn');
  var productsDropdown = document.getElementById('productsDropdown');
  var productsArrow = document.getElementById('arrow');

  if (productsBtn && productsDropdown) {
    productsBtn.addEventListener('click', function () {
      if (productsDropdown.className.indexOf('hidden') !== -1)
        productsDropdown.classList.remove('hidden');
      else
        productsDropdown.classList.add('hidden');

      if (productsArrow) productsArrow.classList.toggle('rotate-180');
    });
  }

  // ---------------- Order Summary ----------------
  function renderOrderSummary() {
    if (!orderItemsContainer || !orderTotalEl) return;

    var cartData = JSON.parse(localStorage.getItem('cart')) || [];
    orderItemsContainer.innerHTML = '';

    if (cartData.length === 0) {
      orderItemsContainer.innerHTML = '<p class="text-gray-500">Корзина пуста</p>';
      orderTotalEl.textContent = '0 ₽';
      return;
    }

    var total = 0;
    for (var i = 0; i < cartData.length; i++) {
      var item = cartData[i];
      total += item.price * item.quantity;
      var itemEl = document.createElement('div');
      itemEl.className = 'flex justify-between';
      itemEl.innerHTML =
        '<span>' + item.name + ' × ' + item.quantity + '</span><span>' +
        (item.price * item.quantity).toLocaleString() + ' ₽</span>';
      orderItemsContainer.appendChild(itemEl);
    }

    orderTotalEl.textContent = total.toLocaleString() + ' ₽';
  }

  // ---------------- Init ----------------
  renderCart();
  updateCartCounter();
});