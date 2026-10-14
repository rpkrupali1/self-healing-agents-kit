import { test, expect } from '@playwright/test';
import {
  addItem, cartItemShape, errorShape, expectedTotals, expectValidCart, findCombo,
  getProducts, productWithStock, FREE_SHIPPING_THRESHOLD,
} from './helpers';

test.describe('GET /api/cart', () => {
  test('a new session has an empty cart', async ({ request }) => {
    const res = await request.get('/api/cart');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ items: [], subtotal: 0, shipping: 0, total: 0 });
  });

  test('reflects added items with a valid shape and invariants', async ({ request }) => {
    const p = await productWithStock(request, 2);
    await addItem(request, p.slug, 2);
    const res = await request.get('/api/cart');
    expect(res.status()).toBe(200);
    const cart = await res.json();
    expectValidCart(cart);
    expect(cart.items).toEqual([{ slug: p.slug, name: p.name, unitPrice: p.price, quantity: 2, lineTotal: p.price * 2 }]);
  });
});

test.describe('POST /api/cart/items', () => {
  for (const quantity of [1, 2, 4, 10]) {
    test(`prices a cart of quantity ${quantity} correctly`, async ({ request }) => {
      const p = await productWithStock(request, quantity);
      const cart = await addItem(request, p.slug, quantity);
      expectValidCart(cart);
      expect(cart.items).toEqual([{ slug: p.slug, name: p.name, unitPrice: p.price, quantity, lineTotal: p.price * quantity }]);
      expect(cart).toEqual({ items: expect.any(Array), ...expectedTotals(p.price * quantity) });
    });
  }

  test('adding the same product twice merges into one line with summed quantity', async ({ request }) => {
    const p = await productWithStock(request, 3);
    await addItem(request, p.slug, 1);
    const cart = await addItem(request, p.slug, 2);
    expect(cart.items).toEqual([{ slug: p.slug, name: p.name, unitPrice: p.price, quantity: 3, lineTotal: p.price * 3 }]);
    expectValidCart(cart);
  });

  test('a cart with two different products totals both lines', async ({ request }) => {
    const [a, b] = await getProducts(request);
    await addItem(request, a.slug, 1);
    const cart = await addItem(request, b.slug, 1);
    expect(cart.items).toHaveLength(2);
    expectValidCart(cart);
    expect(cart.subtotal).toBe(a.price + b.price);
  });

  test.describe('shipping threshold', () => {
    const cases = [
      { title: 'just below the threshold', target: FREE_SHIPPING_THRESHOLD - 100 },
      { title: 'exactly at the threshold', target: FREE_SHIPPING_THRESHOLD },
      { title: 'just above the threshold', target: FREE_SHIPPING_THRESHOLD + 100 },
    ];
    for (const { title, target } of cases) {
      test(`shipping is correct ${title} (subtotal ${target})`, async ({ request }) => {
        const combo = findCombo(await getProducts(request), target);
        expect(combo, `a product/quantity combination summing to ${target} (seed 42 catalog changed?)`).not.toBeNull();
        let cart: any;
        for (const line of combo!) cart = await addItem(request, line.slug, line.quantity);
        expect(cart.subtotal).toBe(target);
        expect(cart.shipping).toBe(target >= FREE_SHIPPING_THRESHOLD ? 0 : 800);
        expect(cart.total).toBe(cart.subtotal + cart.shipping);
      });
    }
  });

  const invalidBodies = [
    { title: 'quantity 0', body: (s: string) => ({ slug: s, quantity: 0 }) },
    { title: 'quantity 11', body: (s: string) => ({ slug: s, quantity: 11 }) },
    { title: 'quantity -1', body: (s: string) => ({ slug: s, quantity: -1 }) },
    { title: 'quantity 2.5', body: (s: string) => ({ slug: s, quantity: 2.5 }) },
    { title: 'quantity "2" (string)', body: (s: string) => ({ slug: s, quantity: '2' }) },
    { title: 'quantity null', body: (s: string) => ({ slug: s, quantity: null }) },
    { title: 'missing quantity', body: (s: string) => ({ slug: s }) },
    { title: 'missing slug', body: () => ({ quantity: 1 }) },
    { title: 'non-string slug', body: () => ({ slug: 123, quantity: 1 }) },
    { title: 'empty object', body: () => ({}) },
  ];
  for (const { title, body } of invalidBodies) {
    test(`rejects ${title} with 400 and leaves the cart empty`, async ({ request }) => {
      const p = await productWithStock(request, 1);
      const res = await request.post('/api/cart/items', { data: body(p.slug) });
      expect(res.status()).toBe(400);
      expect(await res.json()).toEqual(errorShape);
      expect((await (await request.get('/api/cart')).json()).items).toEqual([]);
    });
  }

  test('rejects invalid JSON with 400', async ({ request }) => {
    const res = await request.post('/api/cart/items', {
      headers: { 'content-type': 'application/json' },
      data: '{not json',
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual(errorShape);
  });

  test('returns 404 for an unknown product', async ({ request }) => {
    const res = await request.post('/api/cart/items', { data: { slug: 'no-such-flower', quantity: 1 } });
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual(errorShape);
  });

  test('returns 409 when one request exceeds stock', async ({ request }) => {
    const p = (await getProducts(request)).find((x) => x.stock < 10);
    expect(p, 'a product with stock below 10, so one request can exceed it').toBeDefined();
    const res = await request.post('/api/cart/items', { data: { slug: p!.slug, quantity: p!.stock + 1 } });
    expect(res.status()).toBe(409);
    expect(await res.json()).toEqual(errorShape);
    expect((await (await request.get('/api/cart')).json()).items).toEqual([]);
  });

  test('returns 409 when cumulative quantity exceeds stock, and keeps the earlier quantity', async ({ request }) => {
    const [p] = await getProducts(request);
    let added = 0;
    while (added < p.stock) {
      const q = Math.min(10, p.stock - added);
      await addItem(request, p.slug, q);
      added += q;
    }
    const res = await request.post('/api/cart/items', { data: { slug: p.slug, quantity: 1 } });
    expect(res.status()).toBe(409);
    expect(await res.json()).toEqual(errorShape);
    const cart = await (await request.get('/api/cart')).json();
    expect(cart.items).toEqual([{ ...cartItemShape(), slug: p.slug, quantity: p.stock }]);
  });

  test('allows adding exactly the stock (boundary)', async ({ request }) => {
    const p = (await getProducts(request)).find((x) => x.stock >= 1 && x.stock <= 10);
    expect(p, 'a product with stock between 1 and 10').toBeDefined();
    const cart = await addItem(request, p!.slug, p!.stock);
    expect(cart.items[0].quantity).toBe(p!.stock);
  });
});

test.describe('DELETE /api/cart/items/{slug}', () => {
  test('removes only that product and recomputes totals', async ({ request }) => {
    const [a, b] = await getProducts(request);
    await addItem(request, a.slug, 1);
    await addItem(request, b.slug, 1);
    const res = await request.delete(`/api/cart/items/${a.slug}`);
    expect(res.status()).toBe(200);
    const cart = await res.json();
    expectValidCart(cart);
    expect(cart.items.map((i: any) => i.slug)).toEqual([b.slug]);
    expect(cart).toMatchObject(expectedTotals(b.price));
    expect(await (await request.get('/api/cart')).json()).toEqual(cart);
  });

  test('removing the last item returns an empty cart with no shipping', async ({ request }) => {
    const p = await productWithStock(request, 1);
    await addItem(request, p.slug, 1);
    const res = await request.delete(`/api/cart/items/${p.slug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ items: [], subtotal: 0, shipping: 0, total: 0 });
  });

  test('removal crossing the free-shipping threshold re-adds shipping', async ({ request }) => {
    const combo = findCombo(await getProducts(request), FREE_SHIPPING_THRESHOLD, 2);
    expect(combo, `a two-product combination summing to ${FREE_SHIPPING_THRESHOLD} (seed 42 catalog changed?)`).not.toBeNull();
    let cart: any;
    for (const line of combo!) cart = await addItem(request, line.slug, line.quantity);
    expect(cart.shipping).toBe(0);
    const res = await request.delete(`/api/cart/items/${combo![0].slug}`);
    expect(res.status()).toBe(200);
    const after = await res.json();
    expect(after.shipping).toBe(800);
    expect(after.total).toBe(after.subtotal + 800);
  });

  test('returns 404 for a real product that is not in the cart', async ({ request }) => {
    const p = await productWithStock(request, 1);
    const res = await request.delete(`/api/cart/items/${p.slug}`);
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual(errorShape);
  });

  test('returns 404 for an unknown product', async ({ request }) => {
    const res = await request.delete('/api/cart/items/no-such-flower');
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual(errorShape);
  });

  test('a second delete of the same product returns 404', async ({ request }) => {
    const p = await productWithStock(request, 1);
    await addItem(request, p.slug, 1);
    expect((await request.delete(`/api/cart/items/${p.slug}`)).status()).toBe(200);
    expect((await request.delete(`/api/cart/items/${p.slug}`)).status()).toBe(404);
  });
});
