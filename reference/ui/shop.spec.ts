import { test, expect } from '@playwright/test';
import { generateCustomers } from '../../app/data.js';

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

test('shop lists products and filters by category', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Shop', level: 1 })).toBeVisible();

  await page.getByRole('navigation', { name: 'Categories' }).getByRole('link', { name: 'Candles' }).click();

  await expect(page).toHaveURL(/category=candles/);
  const cards = page.getByRole('article');
  await expect(cards).toHaveCount(4);
  await expect(cards.first().getByRole('heading', { level: 2 })).toContainText('Candle');
});

test('adding a quantity from the product page prices the cart', async ({ page, request }) => {
  const products = await (await request.get('/api/products')).json();
  const product = products.find((p: { stock: number }) => p.stock >= 2);

  await page.goto(`/product/${product.slug}`);
  await page.getByLabel('Quantity').fill('2');
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(product.name) })).toContainText(money(product.price * 2));
  const subtotal = product.price * 2;
  const total = subtotal + (subtotal >= 7500 ? 0 : 800);
  await expect(page.getByText(/^Total:/)).toHaveText(`Total: ${money(total)}`);
});

test('removing the only item empties the cart', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('article').first();
  const name = await card.getByRole('heading').innerText();
  await card.getByRole('button', { name: 'Add to cart' }).click();

  await page.getByRole('button', { name: `Remove ${name}` }).click();

  await expect(page.getByText('Your cart is empty.')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /^Cart/ })).toHaveText('Cart (0)');
});

test('checkout places an order and shows the confirmation', async ({ page }) => {
  const [customer] = generateCustomers(42, 1);
  await page.goto('/');
  await page.getByRole('article').first().getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Checkout' }).click();

  await page.getByLabel('Full name').fill(customer.name);
  await page.getByLabel('Email').fill(customer.email);
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByRole('heading', { name: 'Thank you for your order' })).toBeVisible();
  await expect(page.getByText(/^Order number:/)).toHaveText(/ORD-\d{5}/);
  await expect(page.getByText(customer.email)).toBeVisible();
});

test('checkout rejects an invalid email and keeps what was typed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('article').first().getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Checkout' }).click();

  await page.getByLabel('Full name').fill('Test Shopper');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByRole('alert')).toContainText('Enter a valid email address');
  await expect(page.getByLabel('Email')).toHaveValue('not-an-email');
});
