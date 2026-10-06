// The reference UI suite after healing against v2 (`npm run break`).
// Every change is a locator or copy update. One assertion was deliberately NOT
// healed: see the cart total test below.
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
  // HEALED: card headings moved from h2 to h3.
  await expect(cards.first().getByRole('heading', { level: 3 })).toContainText('Candle');
});

test('adding a quantity from the product page prices the cart', async ({ page, request }) => {
  const products = await (await request.get('/api/products')).json();
  const product = products.find((p: { stock: number }) => p.stock >= 2);

  await page.goto(`/product/${product.slug}`);
  await page.getByLabel('Quantity').fill('2');
  // HEALED: button copy "Add to cart" -> "Add to bag".
  await page.getByRole('button', { name: 'Add to bag' }).click();

  // HEALED: heading copy "Your cart" -> "Your bag".
  await expect(page.getByRole('heading', { name: 'Your bag' })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(product.name) })).toContainText(money(product.price * 2));
  const subtotal = product.price * 2;
  const total = subtotal + (subtotal >= 7500 ? 0 : 800);
  // NOT HEALED: v2 shows a lower total than the line total it displays.
  // That is a pricing regression, not a stale test. This stays red until the
  // app is fixed. Changing the expected value here would hide a real bug.
  await expect(page.getByText(/^Total:/)).toHaveText(`Total: ${money(total)}`);
});

test('removing the only item empties the cart', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('article').first();
  const name = await card.getByRole('heading').innerText();
  // HEALED: "Add to cart" -> "Add to bag".
  await card.getByRole('button', { name: 'Add to bag' }).click();

  await page.getByRole('button', { name: `Remove ${name}` }).click();

  // HEALED: empty-state copy and cart link (now an icon link labelled "Shopping bag").
  await expect(page.getByText('Your bag is empty.')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Shopping bag' })).toHaveText(/\b0$/);
});

test('checkout places an order and shows the confirmation', async ({ page }) => {
  const [customer] = generateCustomers(42, 1);
  await page.goto('/');
  // HEALED: "Add to cart" -> "Add to bag".
  await page.getByRole('article').first().getByRole('button', { name: 'Add to bag' }).click();
  await page.getByRole('link', { name: 'Checkout' }).click();

  // HEALED: label "Full name" -> "Name on order"; button "Place order" -> "Complete purchase".
  await page.getByLabel('Name on order').fill(customer.name);
  await page.getByLabel('Email').fill(customer.email);
  await page.getByRole('button', { name: 'Complete purchase' }).click();

  await expect(page.getByRole('heading', { name: 'Thank you for your order' })).toBeVisible();
  await expect(page.getByText(/^Order number:/)).toHaveText(/ORD-\d{5}/);
  await expect(page.getByText(customer.email)).toBeVisible();
});

test('checkout rejects an invalid email and keeps what was typed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('article').first().getByRole('button', { name: 'Add to bag' }).click();
  await page.getByRole('link', { name: 'Checkout' }).click();

  await page.getByLabel('Name on order').fill('Test Shopper');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Complete purchase' }).click();

  await expect(page.getByRole('alert')).toContainText('Enter a valid email address');
  await expect(page.getByLabel('Email')).toHaveValue('not-an-email');
});
