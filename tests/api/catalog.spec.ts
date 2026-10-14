import { test, expect } from '@playwright/test';
import { getCategories, getProducts, errorShape, type Product } from './helpers';

const productShape = {
  slug: expect.any(String),
  name: expect.any(String),
  category: expect.any(String),
  description: expect.any(String),
  price: expect.any(Number),
  stock: expect.any(Number),
};

test.describe('GET /api/health', () => {
  test('returns the documented shape', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok', uiVersion: expect.stringMatching(/^(v1|v2)$/), seed: expect.any(Number) });
    expect(Number.isInteger(body.seed)).toBe(true);
  });
});

test.describe('GET /api/categories', () => {
  test('returns unique categories in the documented shape', async ({ request }) => {
    const categories = await getCategories(request);
    expect(categories.length).toBeGreaterThan(0);
    for (const c of categories) expect(c).toEqual({ slug: expect.any(String), name: expect.any(String) });
    expect(new Set(categories.map((c) => c.slug)).size).toBe(categories.length);
  });
});

test.describe('GET /api/products', () => {
  test('returns the catalog in the documented shape with valid invariants', async ({ request }) => {
    const products = await getProducts(request);
    const categories = (await getCategories(request)).map((c) => c.slug);
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p).toEqual(productShape);
      expect(Number.isInteger(p.price) && p.price >= 1).toBe(true);
      expect(Number.isInteger(p.stock) && p.stock >= 0).toBe(true);
      expect(categories).toContain(p.category);
    }
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  test('filtering by every category returns exactly that category, and the filters partition the catalog', async ({ request }) => {
    const all = await getProducts(request);
    const categories = await getCategories(request);
    let total = 0;
    for (const c of categories) {
      const res = await request.get('/api/products', { params: { category: c.slug } });
      expect(res.status(), `category ${c.slug}`).toBe(200);
      const list: Product[] = await res.json();
      expect(list).toEqual(all.filter((p) => p.category === c.slug));
      total += list.length;
    }
    expect(total).toBe(all.length);
  });

  const badCategories = [
    { title: 'unknown slug', value: 'not-a-category' },
    { title: 'wrong case', value: 'Candles' },
    { title: 'empty value', value: '' },
    { title: 'whitespace', value: ' ' },
    { title: 'trailing space', value: 'candles ' },
  ];
  for (const { title, value } of badCategories) {
    test(`rejects ${title} (${JSON.stringify(value)}) with 400`, async ({ request }) => {
      const res = await request.get('/api/products', { params: { category: value } });
      expect(res.status()).toBe(400);
      expect(await res.json()).toEqual(errorShape);
    });
  }
});

test.describe('GET /api/products/{slug}', () => {
  test('returns the same product as the list for every slug', async ({ request }) => {
    const products = await getProducts(request);
    for (const p of products) {
      const res = await request.get(`/api/products/${p.slug}`);
      expect(res.status(), p.slug).toBe(200);
      expect(await res.json()).toEqual(p);
    }
  });

  const missing = [
    { title: 'unknown slug', slug: 'no-such-flower' },
    { title: 'encoded junk', slug: '%20%2F..' },
  ];
  for (const { title, slug } of missing) {
    test(`returns 404 for ${title}`, async ({ request }) => {
      const res = await request.get(`/api/products/${slug}`);
      expect(res.status()).toBe(404);
      expect(await res.json()).toEqual(errorShape);
    });
  }

  test('returns 404 for the upper-cased slug of a real product', async ({ request }) => {
    const [first] = await getProducts(request);
    const res = await request.get(`/api/products/${first.slug.toUpperCase()}`);
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual(errorShape);
  });
});
