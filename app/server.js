// Flora Mini — zero-dependency sample shop for the self-healing workshop.
// Run: node app/server.js [--port=3001]   (PORT, SEED and UI_VERSION env vars are optional)

import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCatalog } from './data.js';
import { priceCart } from './pricing.js';
import * as views from './views.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION_FILE = path.join(ROOT, '.ui-version');
// --port works the same on every OS (npm start -- --port=3001); PORT is for the test runner.
const portArg = process.argv.find((a) => a.startsWith('--port='))?.split('=')[1];
const PORT = Number(portArg ?? process.env.PORT ?? 3000);
const SEED = Number(process.env.SEED ?? 42);

const { categories, products } = generateCatalog(SEED);
const bySlug = new Map(products.map((p) => [p.slug, p]));
const sessions = new Map(); // sid -> { cart: Map<slug, quantity> }
const orders = new Map();
let orderSeq = 0;

// Read on every request, so `npm run break` flips a running server live.
function uiVersion() {
  const v = process.env.UI_VERSION ?? (existsSync(VERSION_FILE) ? readFileSync(VERSION_FILE, 'utf8').trim() : 'v1');
  return v === 'v2' ? 'v2' : 'v1';
}

function session(req, res) {
  const sid = /(?:^|;\s*)sid=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
  if (sid && sessions.has(sid)) return sessions.get(sid);
  const id = randomUUID();
  const s = { cart: new Map() };
  sessions.set(id, s);
  res.setHeader('Set-Cookie', `sid=${id}; Path=/; HttpOnly; SameSite=Lax`);
  return s;
}

const cartCount = (s) => [...s.cart.values()].reduce((n, q) => n + q, 0);
const cartView = (s, version) =>
  priceCart([...s.cart].map(([slug, quantity]) => ({ product: bySlug.get(slug), quantity })), version);

function addToCart(s, slug, quantity) {
  if (typeof slug !== 'string' || !slug) return { status: 400, error: 'slug is required' };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { status: 400, error: 'quantity must be an integer from 1 to 10' };
  }
  const product = bySlug.get(slug);
  if (!product) return { status: 404, error: `product '${slug}' not found` };
  const next = (s.cart.get(slug) ?? 0) + quantity;
  if (next > product.stock) return { status: 409, error: `only ${product.stock} in stock` };
  s.cart.set(slug, next);
  return { status: 201 };
}

function placeOrder(s, version, { name, email }) {
  const errors = [];
  if (s.cart.size === 0) errors.push('Your cart is empty');
  if (typeof name !== 'string' || !name.trim()) errors.push('Name is required');
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Enter a valid email address');
  if (errors.length) return { errors };
  const order = {
    id: `ORD-${String(++orderSeq).padStart(5, '0')}`,
    name: name.trim(),
    email,
    ...cartView(s, version),
    createdAt: new Date().toISOString(),
  };
  orders.set(order.id, order);
  s.cart.clear();
  return { order };
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 100_000) throw new Error('body too large');
  }
  return body;
}

async function readJson(req) {
  try {
    return JSON.parse(await readBody(req));
  } catch {
    return undefined;
  }
}

const readForm = async (req) => new URLSearchParams(await readBody(req));

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function html(res, status, page) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(page);
}

function redirect(res, location) {
  res.writeHead(303, { Location: location });
  res.end();
}

async function api(req, res, url, version) {
  const { pathname } = url;
  const method = req.method;
  let m;

  if (method === 'GET' && pathname === '/api/categories') return json(res, 200, categories);

  if (method === 'GET' && pathname === '/api/products') {
    const category = url.searchParams.get('category');
    if (category !== null && !categories.some((c) => c.slug === category)) {
      return json(res, 400, { error: `unknown category '${category}'` });
    }
    return json(res, 200, category ? products.filter((p) => p.category === category) : products);
  }

  if (method === 'GET' && (m = /^\/api\/products\/([^/]+)$/.exec(pathname))) {
    const slug = decodeURIComponent(m[1]);
    const product = bySlug.get(slug);
    return product ? json(res, 200, product) : json(res, 404, { error: `product '${slug}' not found` });
  }

  if (method === 'GET' && pathname === '/api/cart') return json(res, 200, cartView(session(req, res), version));

  if (method === 'POST' && pathname === '/api/cart/items') {
    const s = session(req, res);
    const body = await readJson(req);
    if (body === undefined) return json(res, 400, { error: 'body must be valid JSON' });
    const result = addToCart(s, body?.slug, body?.quantity);
    if (result.error) return json(res, result.status, { error: result.error });
    return json(res, 201, cartView(s, version));
  }

  if (method === 'DELETE' && (m = /^\/api\/cart\/items\/([^/]+)$/.exec(pathname))) {
    const s = session(req, res);
    const slug = decodeURIComponent(m[1]);
    if (!s.cart.delete(slug)) return json(res, 404, { error: `product '${slug}' is not in the cart` });
    return json(res, 200, cartView(s, version));
  }

  if (method === 'POST' && pathname === '/api/checkout') {
    const s = session(req, res);
    const body = await readJson(req);
    if (body === undefined) return json(res, 400, { error: 'body must be valid JSON' });
    const result = placeOrder(s, version, body ?? {});
    if (result.errors) return json(res, 400, { error: result.errors.join('; ') });
    return json(res, 201, result.order);
  }

  if (method === 'GET' && (m = /^\/api\/orders\/([^/]+)$/.exec(pathname))) {
    const order = orders.get(decodeURIComponent(m[1]));
    return order ? json(res, 200, order) : json(res, 404, { error: 'order not found' });
  }

  return json(res, 404, { error: 'not found' });
}

async function ui(req, res, url, version) {
  const { pathname } = url;
  const method = req.method;
  const s = session(req, res);
  const page = (status, title, body) => html(res, status, views.layout({ title, body, version, cartCount: cartCount(s) }));
  let m;

  if (method === 'GET' && pathname === '/') {
    const category = url.searchParams.get('category');
    const known = categories.some((c) => c.slug === category);
    const list = known ? products.filter((p) => p.category === category) : products;
    return page(200, 'Shop', views.shopPage({ version, products: list, categories, activeCategory: known ? category : null }));
  }

  if (method === 'GET' && (m = /^\/product\/([^/]+)$/.exec(pathname))) {
    const product = bySlug.get(decodeURIComponent(m[1]));
    if (!product) return page(404, 'Not found', views.notFoundPage());
    return page(200, product.name, views.productPage({ version, product }));
  }

  if (method === 'POST' && pathname === '/cart/add') {
    const form = await readForm(req);
    const slug = form.get('slug');
    const result = addToCart(s, slug, Number(form.get('quantity')));
    if (result.error) {
      const product = bySlug.get(slug);
      if (!product) return page(404, 'Not found', views.notFoundPage());
      return page(result.status, product.name, views.productPage({ version, product, error: result.error }));
    }
    return redirect(res, '/cart');
  }

  if (method === 'POST' && pathname === '/cart/remove') {
    const form = await readForm(req);
    s.cart.delete(form.get('slug'));
    return redirect(res, '/cart');
  }

  if (method === 'GET' && pathname === '/cart') return page(200, 'Cart', views.cartPage({ version, cart: cartView(s, version) }));

  if (method === 'GET' && pathname === '/checkout') {
    if (s.cart.size === 0) return redirect(res, '/cart');
    return page(200, 'Checkout', views.checkoutPage({ version, cart: cartView(s, version) }));
  }

  if (method === 'POST' && pathname === '/checkout') {
    const form = await readForm(req);
    const values = { name: form.get('name') ?? '', email: form.get('email') ?? '' };
    const result = placeOrder(s, version, values);
    if (result.errors) {
      return page(400, 'Checkout', views.checkoutPage({ version, cart: cartView(s, version), values, errors: result.errors }));
    }
    return redirect(res, `/order/${result.order.id}`);
  }

  if (method === 'GET' && (m = /^\/order\/([^/]+)$/.exec(pathname))) {
    const order = orders.get(decodeURIComponent(m[1]));
    if (!order) return page(404, 'Not found', views.notFoundPage());
    return page(200, 'Order confirmed', views.orderPage({ order }));
  }

  return page(404, 'Not found', views.notFoundPage());
}

async function route(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const version = uiVersion();
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return json(res, 200, { status: 'ok', uiVersion: version, seed: SEED });
  }
  if (req.method === 'GET' && url.pathname === '/openapi.yaml') {
    res.writeHead(200, { 'Content-Type': 'text/yaml; charset=utf-8' });
    return res.end(readFileSync(path.join(ROOT, 'openapi.yaml')));
  }
  return url.pathname.startsWith('/api/') ? api(req, res, url, version) : ui(req, res, url, version);
}

http
  .createServer(async (req, res) => {
    try {
      await route(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) json(res, 500, { error: 'internal error' });
    }
  })
  .on('error', (err) => {
    if (err.code !== 'EADDRINUSE') throw err;
    const next = PORT + 1;
    console.error(`Port ${PORT} is already in use by another program.`);
    console.error(`Start Flora Mini on another port instead:  npm start -- --port=${next}`);
    console.error(`Then open http://localhost:${next}`);
    process.exit(1);
  })
  .listen(PORT, () => {
    console.log(`Flora Mini running at http://localhost:${PORT}  (UI ${uiVersion()}, seed ${SEED})`);
  });
