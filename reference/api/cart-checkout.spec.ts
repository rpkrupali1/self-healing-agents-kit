import { test, expect, type APIRequestContext } from '@playwright/test';
import { generateCustomers } from '../../app/data.js';

type Product = { slug: string; name: string; price: number; stock: number };

async function productWithStock(request: APIRequestContext, minStock: number): Promise<Product> {
  const products: Product[] = await (await request.get('/api/products')).json();
  const product = products.find((p) => p.stock >= minStock);
  expect(product, `a product with at least ${minStock} in stock`).toBeDefined();
  return product!;
}

// Pricing rule from the spec: $8.00 shipping below a $75.00 subtotal.
function expectedTotals(subtotal: number) {
  const shipping = subtotal >= 7500 ? 0 : 800;
  return { subtotal, shipping, total: subtotal + shipping };
}

for (const quantity of [1, 2, 4]) {
  test(`POST /api/cart/items prices a cart of ${quantity} correctly`, async ({ request }) => {
    const product = await productWithStock(request, quantity);
    const res = await request.post('/api/cart/items', { data: { slug: product.slug, quantity } });
    expect(res.status()).toBe(201);
    const cart = await res.json();
    expect(cart.items).toEqual([
      { slug: product.slug, name: product.name, unitPrice: product.price, quantity, lineTotal: product.price * quantity },
    ]);
    expect(cart).toMatchObject(expectedTotals(product.price * quantity));
  });
}

for (const quantity of [0, 11, 2.5, '2']) {
  test(`POST /api/cart/items rejects quantity ${JSON.stringify(quantity)} with 400`, async ({ request }) => {
    const product = await productWithStock(request, 1);
    const res = await request.post('/api/cart/items', { data: { slug: product.slug, quantity } });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ error: expect.stringContaining('quantity') });
  });
}

test('POST /api/checkout creates a retrievable order and empties the cart', async ({ request }) => {
  const [customer] = generateCustomers(42, 1);
  const product = await productWithStock(request, 1);
  await request.post('/api/cart/items', { data: { slug: product.slug, quantity: 1 } });

  const res = await request.post('/api/checkout', { data: customer });
  expect(res.status()).toBe(201);
  const order = await res.json();
  expect(order).toMatchObject({ id: expect.stringMatching(/^ORD-\d{5}$/), ...customer, ...expectedTotals(product.price) });

  const fetched = await request.get(`/api/orders/${order.id}`);
  expect(fetched.status()).toBe(200);
  expect(await fetched.json()).toEqual(order);

  const cart = await (await request.get('/api/cart')).json();
  expect(cart).toEqual({ items: [], subtotal: 0, shipping: 0, total: 0 });
});
