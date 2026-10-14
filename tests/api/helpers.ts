import { expect, type APIRequestContext } from '@playwright/test';

export type Product = { slug: string; name: string; category: string; description: string; price: number; stock: number };
export type Category = { slug: string; name: string };

export const FREE_SHIPPING_THRESHOLD = 7500; // spec: free at or above $75.00
export const SHIPPING_FEE = 800;

export function expectedTotals(subtotal: number) {
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

export async function getProducts(request: APIRequestContext): Promise<Product[]> {
  const res = await request.get('/api/products');
  expect(res.status()).toBe(200);
  return res.json();
}

export async function getCategories(request: APIRequestContext): Promise<Category[]> {
  const res = await request.get('/api/categories');
  expect(res.status()).toBe(200);
  return res.json();
}

export async function productWithStock(request: APIRequestContext, minStock: number): Promise<Product> {
  const product = (await getProducts(request)).find((p) => p.stock >= minStock);
  expect(product, `a product with at least ${minStock} in stock`).toBeDefined();
  return product!;
}

export async function addItem(request: APIRequestContext, slug: string, quantity: number) {
  const res = await request.post('/api/cart/items', { data: { slug, quantity } });
  expect(res.status(), await res.text()).toBe(201);
  return res.json();
}

export const errorShape = { error: expect.any(String) };

export function cartItemShape() {
  return {
    slug: expect.any(String),
    name: expect.any(String),
    unitPrice: expect.any(Number),
    quantity: expect.any(Number),
    lineTotal: expect.any(Number),
  };
}

/** Asserts exact Cart shape, integer money and the documented invariants. */
export function expectValidCart(cart: any) {
  expect(cart).toEqual({
    items: expect.any(Array),
    subtotal: expect.any(Number),
    shipping: expect.any(Number),
    total: expect.any(Number),
  });
  for (const item of cart.items) {
    expect(item).toEqual(cartItemShape());
    expect(Number.isInteger(item.unitPrice) && item.unitPrice > 0).toBe(true);
    expect(Number.isInteger(item.quantity) && item.quantity >= 1).toBe(true);
    expect(item.lineTotal).toBe(item.unitPrice * item.quantity);
  }
  const subtotal = cart.items.reduce((s: number, i: any) => s + i.lineTotal, 0);
  expect(cart).toMatchObject(expectedTotals(subtotal));
  expect(Number.isInteger(cart.subtotal) && Number.isInteger(cart.shipping) && Number.isInteger(cart.total)).toBe(true);
}

/**
 * Finds a (product, quantity) list whose subtotal equals `target`, using live
 * prices and stock. Returns null if none exists in this catalog.
 * `lines` restricts the result to that many distinct products (0 = any).
 */
export function findCombo(products: Product[], target: number, lines = 0): { slug: string; quantity: number }[] | null {
  const max = (p: Product) => Math.min(10, p.stock);
  for (const a of products) {
    for (let qa = 1; qa <= max(a); qa++) {
      if (lines !== 2 && a.price * qa === target) return [{ slug: a.slug, quantity: qa }];
      if (lines === 1) continue;
      for (const b of products) {
        if (b.slug === a.slug) continue;
        for (let qb = 1; qb <= max(b); qb++) {
          if (a.price * qa + b.price * qb === target) {
            return [{ slug: a.slug, quantity: qa }, { slug: b.slug, quantity: qb }];
          }
        }
      }
    }
  }
  return null;
}
