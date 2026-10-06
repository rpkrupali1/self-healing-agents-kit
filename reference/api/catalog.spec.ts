import { test, expect } from '@playwright/test';

const productShape = {
  slug: expect.any(String),
  name: expect.any(String),
  category: expect.any(String),
  description: expect.any(String),
  price: expect.any(Number),
  stock: expect.any(Number),
};

test('GET /api/products returns the catalog in the documented shape', async ({ request }) => {
  const res = await request.get('/api/products');
  expect(res.status()).toBe(200);
  const products = await res.json();
  expect(products.length).toBeGreaterThan(0);
  for (const product of products) {
    // toEqual also fails on undocumented extra fields.
    expect(product).toEqual(productShape);
    expect(Number.isInteger(product.price) && product.price > 0).toBe(true);
  }
});

test('GET /api/products?category= returns only that category', async ({ request }) => {
  const all = await (await request.get('/api/products')).json();
  const res = await request.get('/api/products', { params: { category: 'candles' } });
  expect(res.status()).toBe(200);
  const candles = await res.json();
  expect(candles.length).toBeGreaterThan(0);
  expect(candles.length).toBeLessThan(all.length);
  expect(candles.every((p: { category: string }) => p.category === 'candles')).toBe(true);
});

test('GET /api/products with an unknown category is rejected with 400', async ({ request }) => {
  const res = await request.get('/api/products', { params: { category: 'not-a-category' } });
  expect(res.status()).toBe(400);
  expect(await res.json()).toEqual({ error: expect.stringContaining('not-a-category') });
});

test('GET /api/products/{slug} returns the same product as the list', async ({ request }) => {
  const [first] = await (await request.get('/api/products')).json();
  const res = await request.get(`/api/products/${first.slug}`);
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual(first);
});

test('GET /api/products/{slug} for an unknown slug returns 404', async ({ request }) => {
  const res = await request.get('/api/products/no-such-flower');
  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({ error: expect.any(String) });
});
