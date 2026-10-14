import { test, expect } from '@playwright/test';
import { generateCustomers } from '../../app/data.js';
import { addItem, errorShape, expectedTotals, FREE_SHIPPING_THRESHOLD, findCombo, getProducts, productWithStock } from './helpers';

const orderShape = {
  id: expect.stringMatching(/^ORD-\d{5}$/),
  name: expect.any(String),
  email: expect.any(String),
  items: expect.any(Array),
  subtotal: expect.any(Number),
  shipping: expect.any(Number),
  total: expect.any(Number),
  createdAt: expect.any(String),
};

const customers = generateCustomers(42, 3);

test.describe('POST /api/checkout', () => {
  for (const customer of customers) {
    test(`creates a retrievable order for ${customer.name}, then empties the cart`, async ({ request }) => {
      const p = await productWithStock(request, 2);
      await addItem(request, p.slug, 2);
      const res = await request.post('/api/checkout', { data: customer });
      expect(res.status()).toBe(201);
      const order = await res.json();
      expect(order).toEqual(orderShape);
      expect(order).toMatchObject({ ...customer, ...expectedTotals(p.price * 2) });
      expect(order.items).toEqual([{ slug: p.slug, name: p.name, unitPrice: p.price, quantity: 2, lineTotal: p.price * 2 }]);
      expect(order.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(Number.isNaN(Date.parse(order.createdAt))).toBe(false);

      const fetched = await request.get(`/api/orders/${order.id}`);
      expect(fetched.status()).toBe(200);
      expect(await fetched.json()).toEqual(order);

      expect(await (await request.get('/api/cart')).json()).toEqual({ items: [], subtotal: 0, shipping: 0, total: 0 });
    });
  }

  test('order totals match the cart at the free-shipping threshold', async ({ request }) => {
    const combo = findCombo(await getProducts(request), FREE_SHIPPING_THRESHOLD);
    expect(combo, `a product/quantity combination summing to ${FREE_SHIPPING_THRESHOLD} (seed 42 catalog changed?)`).not.toBeNull();
    for (const line of combo!) await addItem(request, line.slug, line.quantity);
    const res = await request.post('/api/checkout', { data: customers[0] });
    expect(res.status()).toBe(201);
    expect(await res.json()).toMatchObject({ subtotal: FREE_SHIPPING_THRESHOLD, shipping: 0, total: FREE_SHIPPING_THRESHOLD });
  });

  test('two orders get different ids', async ({ request }) => {
    const p = await productWithStock(request, 1);
    // Both checkouts must succeed with a well-formed id first: if the first one
    // failed, `undefined` would trivially differ from the second id.
    await addItem(request, p.slug, 1);
    const firstRes = await request.post('/api/checkout', { data: customers[0] });
    expect(firstRes.status()).toBe(201);
    const first = await firstRes.json();
    await addItem(request, p.slug, 1);
    const secondRes = await request.post('/api/checkout', { data: customers[1] });
    expect(secondRes.status()).toBe(201);
    const second = await secondRes.json();
    expect(first.id).toMatch(/^ORD-\d{5}$/);
    expect(second.id).toMatch(/^ORD-\d{5}$/);
    expect(first.id).not.toBe(second.id);
  });

  test('a second checkout straight after success is rejected (cart is empty)', async ({ request }) => {
    const p = await productWithStock(request, 1);
    await addItem(request, p.slug, 1);
    expect((await request.post('/api/checkout', { data: customers[0] })).status()).toBe(201);
    const res = await request.post('/api/checkout', { data: customers[0] });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual(errorShape);
  });

  test('rejects an empty cart with 400', async ({ request }) => {
    const res = await request.post('/api/checkout', { data: customers[0] });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual(errorShape);
  });

  const invalidCustomers = [
    { title: 'missing name', data: { email: 'a@example.com' } },
    { title: 'empty name', data: { name: '', email: 'a@example.com' } },
    { title: 'non-string name', data: { name: 42, email: 'a@example.com' } },
    { title: 'missing email', data: { name: 'Ann' } },
    { title: 'empty email', data: { name: 'Ann', email: '' } },
    { title: 'non-string email', data: { name: 'Ann', email: 5 } },
    { title: 'email "a"', data: { name: 'Ann', email: 'a' } },
    { title: 'email "a@"', data: { name: 'Ann', email: 'a@' } },
    { title: 'email "@b.com"', data: { name: 'Ann', email: '@b.com' } },
    { title: 'email with a space', data: { name: 'Ann', email: 'a b@c.com' } },
    { title: 'empty object', data: {} },
  ];
  for (const { title, data } of invalidCustomers) {
    test(`rejects ${title} with 400 and keeps the cart`, async ({ request }) => {
      const p = await productWithStock(request, 1);
      await addItem(request, p.slug, 1);
      const res = await request.post('/api/checkout', { data });
      expect(res.status()).toBe(400);
      expect(await res.json()).toEqual(errorShape);
      expect((await (await request.get('/api/cart')).json()).items).toHaveLength(1);
    });
  }

  test('rejects invalid JSON with 400', async ({ request }) => {
    const p = await productWithStock(request, 1);
    await addItem(request, p.slug, 1);
    const res = await request.post('/api/checkout', { headers: { 'content-type': 'application/json' }, data: '{bad' });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual(errorShape);
  });
});

test.describe('GET /api/orders/{id}', () => {
  test('returns 404 for a well-formed id that does not exist', async ({ request }) => {
    const res = await request.get('/api/orders/ORD-99999');
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual(errorShape);
  });

  // Spec documents only 404 for unknown ids, so malformed ids are expected to 404 too.
  const malformed = ['ORD-1', 'ord-00001', 'abc', 'ORD-123456', 'ORD-0000a'];
  for (const id of malformed) {
    test(`returns 404 for malformed id ${id}`, async ({ request }) => {
      const res = await request.get(`/api/orders/${id}`);
      expect(res.status()).toBe(404);
      expect(await res.json()).toEqual(errorShape);
    });
  }
});
