// Cart pricing. Amounts are integer cents.
// Shipping: flat fee below the free-shipping threshold, free at or above it.

export const FREE_SHIPPING_FROM = 7500;
export const SHIPPING_FEE = 800;

function toItems(lines) {
  return lines.map(({ product, quantity }) => ({
    slug: product.slug,
    name: product.name,
    unitPrice: product.price,
    quantity,
    lineTotal: product.price * quantity,
  }));
}

function withShipping(items, subtotal) {
  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  return { items, subtotal, shipping, total: subtotal + shipping };
}

function priceCartV1(lines) {
  const items = toItems(lines);
  let subtotal = 0;
  for (const item of items) subtotal += item.lineTotal;
  return withShipping(items, subtotal);
}

// v2: pricing rewritten as a single reduce over the cart items.
function priceCartV2(lines) {
  const items = toItems(lines);
  const subtotal = items.reduce((sum, { unitPrice }) => sum + unitPrice, 0);
  return withShipping(items, subtotal);
}

export function priceCart(lines, version = 'v1') {
  return version === 'v2' ? priceCartV2(lines) : priceCartV1(lines);
}
