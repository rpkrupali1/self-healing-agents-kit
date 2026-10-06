// Writes the deterministic seed data to data/seed.json, for inspection or for
// data-driven tests. Usage: npm run data -- --seed=42 --customers=10
import { mkdirSync, writeFileSync } from 'node:fs';
import { generateCatalog, generateCustomers } from '../app/data.js';

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};

const seed = arg('seed', 42);
const data = { seed, ...generateCatalog(seed), customers: generateCustomers(seed, arg('customers', 10)) };

mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/seed.json', import.meta.url), `${JSON.stringify(data, null, 2)}\n`);
console.log(`data/seed.json: ${data.products.length} products, ${data.customers.length} customers (seed ${seed})`);
