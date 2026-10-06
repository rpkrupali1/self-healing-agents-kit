// Server-rendered HTML. No client-side JavaScript, so every page is easy for
// agents (and humans) to explore with accessible roles and labels.

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const money = (cents) => `$${(cents / 100).toFixed(2)}`;

// UI copy and structure per release. v2 is the "refactor" used in the
// self-healing exercise.
const LABELS = {
  v1: {
    cartLink: 'Cart',
    cartLinkAria: null,
    addToCart: 'Add to cart',
    cartHeading: 'Your cart',
    emptyCart: 'Your cart is empty.',
    nameLabel: 'Full name',
    submitOrder: 'Place order',
    cardHeading: 'h2',
  },
  v2: {
    cartLink: 'Bag',
    cartLinkAria: 'Shopping bag',
    addToCart: 'Add to bag',
    cartHeading: 'Your bag',
    emptyCart: 'Your bag is empty.',
    nameLabel: 'Name on order',
    submitOrder: 'Complete purchase',
    cardHeading: 'h3',
  },
};

const CSS = `
:root{--ink:#3b2a2f;--muted:#7a6268;--accent:#b8577a;--bg:#fdf7f8;--card:#fff;--line:#ecdde1}
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,sans-serif;color:var(--ink);background:var(--bg)}
header{display:flex;justify-content:space-between;align-items:center;padding:12px 24px;background:var(--card);border-bottom:1px solid var(--line)}
header nav{display:flex;gap:16px}a{color:var(--accent)}.brand{font-weight:700;text-decoration:none;font-size:1.2rem}
main{max-width:960px;margin:0 auto;padding:24px}footer{text-align:center;color:var(--muted);font-size:.85rem;padding:24px}
.filters,.grid{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:12px}
.grid li{flex:1 1 200px}article{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;height:100%}
article h2,article h3{font-size:1.05rem;margin:0 0 4px}.price{font-weight:600}
button,.button{background:var(--accent);color:#fff;border:0;border-radius:6px;padding:8px 14px;font:inherit;cursor:pointer;text-decoration:none;display:inline-block}
[aria-current=page]{font-weight:700}table{width:100%;border-collapse:collapse;background:var(--card)}
th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line)}.total{font-size:1.2rem;font-weight:700}
[role=alert]{background:#fde8ec;border:1px solid var(--accent);border-radius:6px;padding:8px 12px}
input{font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`;

export function layout({ title, body, version, cartCount }) {
  const L = LABELS[version];
  const cartLink = L.cartLinkAria
    ? `<a href="/cart" aria-label="${L.cartLinkAria}">🛍 ${cartCount}</a>`
    : `<a href="/cart">${L.cartLink} (${cartCount})</a>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Flora Mini</title><style>${CSS}</style></head>
<body data-ui-version="${version}">
<header><a href="/" class="brand">Flora Mini</a><nav aria-label="Main"><a href="/">Shop</a>${cartLink}</nav></header>
<main>${body}</main>
<footer>Workshop sample app · not a real store</footer>
</body></html>`;
}

export function shopPage({ version, products, categories, activeCategory }) {
  const L = LABELS[version];
  const H = L.cardHeading;
  const filters = [{ slug: '', name: 'All' }, ...categories]
    .map((c) => {
      const href = c.slug ? `/?category=${c.slug}` : '/';
      const current = c.slug === (activeCategory ?? '') ? ' aria-current="page"' : '';
      return `<li><a href="${href}"${current}>${esc(c.name)}</a></li>`;
    })
    .join('');
  const cards = products
    .map(
      (p) => `<li><article aria-labelledby="p-${p.slug}">
<${H} id="p-${p.slug}"><a href="/product/${p.slug}">${esc(p.name)}</a></${H}>
<p class="price">${money(p.price)}</p>
<form method="post" action="/cart/add"><input type="hidden" name="slug" value="${p.slug}"><input type="hidden" name="quantity" value="1"><button type="submit">${L.addToCart}</button></form>
</article></li>`,
    )
    .join('');
  return `<h1>Shop</h1><nav aria-label="Categories"><ul class="filters">${filters}</ul></nav><ul class="grid">${cards}</ul>`;
}

export function productPage({ version, product, error }) {
  const L = LABELS[version];
  return `<p><a href="/">← Back to shop</a></p>
<h1>${esc(product.name)}</h1>
<p class="price">${money(product.price)}</p>
<p>${esc(product.description)}</p>
<p>${product.stock} in stock</p>
${error ? `<p role="alert">${esc(error)}</p>` : ''}
<form method="post" action="/cart/add">
<input type="hidden" name="slug" value="${product.slug}">
<label for="quantity">Quantity</label>
<input id="quantity" name="quantity" type="number" min="1" max="10" value="1">
<button type="submit">${L.addToCart}</button>
</form>`;
}

export function cartPage({ version, cart }) {
  const L = LABELS[version];
  if (cart.items.length === 0) {
    return `<h1>${L.cartHeading}</h1><p>${L.emptyCart}</p><p><a href="/">Continue shopping</a></p>`;
  }
  const rows = cart.items
    .map(
      (i) => `<tr><th scope="row">${esc(i.name)}</th><td>${i.quantity}</td><td>${money(i.unitPrice)}</td><td>${money(i.lineTotal)}</td>
<td><form method="post" action="/cart/remove"><input type="hidden" name="slug" value="${i.slug}"><button type="submit" aria-label="Remove ${esc(i.name)}">Remove</button></form></td></tr>`,
    )
    .join('');
  return `<h1>${L.cartHeading}</h1>
<table><caption class="sr-only">Items</caption>
<thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col">Line total</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
<tbody>${rows}</tbody></table>
<p>Subtotal: ${money(cart.subtotal)}</p>
<p>Shipping: ${cart.shipping ? money(cart.shipping) : 'Free'}</p>
<p class="total">Total: ${money(cart.total)}</p>
<p><a class="button" href="/checkout">Checkout</a></p>`;
}

export function checkoutPage({ version, cart, values = {}, errors = [] }) {
  const L = LABELS[version];
  const alert = errors.length
    ? `<div role="alert"><p>Please fix the following:</p><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>`
    : '';
  return `<h1>Checkout</h1>${alert}
<p class="total">Total: ${money(cart.total)}</p>
<form method="post" action="/checkout" novalidate>
<p><label for="name">${L.nameLabel}</label><br><input id="name" name="name" autocomplete="name" value="${esc(values.name ?? '')}"></p>
<p><label for="email">Email</label><br><input id="email" name="email" type="email" autocomplete="email" value="${esc(values.email ?? '')}"></p>
<button type="submit">${L.submitOrder}</button>
</form>`;
}

export function orderPage({ order }) {
  return `<h1>Thank you for your order</h1>
<p>Order number: <strong>${order.id}</strong></p>
<p>A confirmation will be sent to ${esc(order.email)}.</p>
<p class="total">Total: ${money(order.total)}</p>
<p><a href="/">Continue shopping</a></p>`;
}

export function notFoundPage() {
  return `<h1>Page not found</h1><p><a href="/">Back to shop</a></p>`;
}
