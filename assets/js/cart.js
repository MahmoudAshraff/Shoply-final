/* cart.js — full cart logic using localStorage */

const CART_KEY = "shoply_cart_v1";

/* Helpers */
function getCart(){
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCountUI();
  renderCartItems(); // keep UI synced
}

function addToCart(id, qty = 1){
  const cart = getCart();
  const found = cart.find(i => i.id === id);

  if(found) found.qty += qty;
  else cart.push({ id, qty });

  saveCart(cart);
  toast("Added to cart");
}

function removeFromCart(id){
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
}

function updateQty(id, qty){
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if(!item) return;

  item.qty = qty;
  saveCart(cart);
}

function cartTotal(){
  const cart = getCart();
  let total = 0;

  cart.forEach(i => {
    const p = SHOPLY.PRODUCTS.find(x => x.id === i.id);
    if(p) total += p.price * i.qty;
  });

  return total;
}

function updateCartCountUI(){
  const count = getCart().reduce((n, i) => n + i.qty, 0);
  document.querySelectorAll('.cart-count')
    .forEach(el => el.textContent = count);
}

/* Cart Sidebar Rendering */
function renderCartItems(){
  const el = document.getElementById('cartItems');
  const elPage = document.getElementById('cartItemsPage');
  if(!el && !elPage) return;

  const cart = getCart();

  const html = cart.map(i => {
    const p = SHOPLY.PRODUCTS.find(x => x.id === i.id);
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.title}">
        <div class="meta" style="flex:1">
          <h5>${p.title}</h5>
          <small style="color:var(--muted)">${formatPrice(p.price)}</small>
        </div>
        <div class="qty-control">
          <input type="number" min="1" value="${i.qty}" data-id="${i.id}" class="cart-qty" style="width:64px;padding:6px;border-radius:8px;border:1px solid var(--border);">
          <button class="btn ghost remove-js" data-id="${i.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  if(el) el.innerHTML = html || '<p style="color:var(--muted)">Your cart is empty.</p>';
  if(elPage) elPage.innerHTML = html || '<p style="color:var(--muted)">Your cart is empty.</p>';

  document.getElementById('cartTotal')?.textContent = formatPrice(cartTotal());
  document.getElementById('cartTotalPage')?.textContent = formatPrice(cartTotal());

  // attach events
  document.querySelectorAll('.remove-js').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)))
  );

  document.querySelectorAll('.cart-qty').forEach(inp =>
    inp.addEventListener('change', () => {
      const id = Number(inp.dataset.id);
      const val = Number(inp.value);
      if(val < 1){ inp.value = 1; return; }
      updateQty(id, val);
    })
  );
}

/* Small Toast */
function toast(msg){
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.right = "1rem";
  t.style.bottom = "1rem";
  t.style.background = "#111";
  t.style.color = "#fff";
  t.style.padding = "0.6rem 1rem";
  t.style.borderRadius = "8px";
  t.style.zIndex = 999;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1500);
}

/* Open/close sidebar */
document.addEventListener('click', (e) => {
  if(e.target && e.target.id === 'openCart'){
    document.getElementById('sidebarCart')?.classList.toggle('open');
    renderCartItems();
  }
});

/* Render cart on load */
window.addEventListener("DOMContentLoaded", () => {
  renderCartItems();
});
