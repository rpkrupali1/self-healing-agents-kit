// Deterministic test data. The same seed produces the same catalog and
// customers on every machine, so every attendee sees identical results.

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CATEGORIES = [
  { slug: 'clay-flowers', name: 'Clay Flowers' },
  { slug: 'candles', name: 'Candles' },
  { slug: 'paintings', name: 'Paintings' },
];

const ITEMS = [
  ['clay-flowers', 'Peony Bouquet', 'Hand-shaped clay peonies that never wilt.'],
  ['clay-flowers', 'Rose Stem Trio', 'Three long-stem clay roses in blush pink.'],
  ['clay-flowers', 'Tulip Pot', 'A ceramic pot of spring tulips, sculpted by hand.'],
  ['clay-flowers', 'Lavender Bundle', 'A tied bundle of clay lavender sprigs.'],
  ['candles', 'Vanilla Bloom Candle', 'Soy wax with warm vanilla and orange blossom.'],
  ['candles', 'Rose Garden Candle', 'Soy wax with fresh-cut rose and green leaves.'],
  ['candles', 'Citrus Grove Candle', 'Soy wax with bright lemon and bergamot.'],
  ['candles', 'Midnight Jasmine Candle', 'Soy wax with night jasmine and amber.'],
  ['paintings', 'Sunflower Field Canvas', 'Acrylic on canvas, 16 x 20 in.'],
  ['paintings', 'Lotus Pond Canvas', 'Acrylic on canvas, 12 x 16 in.'],
  ['paintings', 'Wildflower Meadow Print', 'Giclee print on cotton paper, 11 x 14 in.'],
  ['paintings', 'Cherry Blossom Print', 'Giclee print on cotton paper, 8 x 10 in.'],
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function generateCatalog(seed = 42) {
  const next = rng(seed);
  const products = ITEMS.map(([category, name, description]) => ({
    slug: slugify(name),
    name,
    category,
    description,
    price: (12 + Math.floor(next() * 54)) * 100, // cents, $12.00–$65.00
    stock: 2 + Math.floor(next() * 11), // 2–12
  }));
  return { categories: CATEGORIES, products };
}

const FIRST = ['Asha', 'Ben', 'Chloe', 'Diego', 'Elena', 'Farah', 'Gus', 'Hana', 'Ivan', 'Jade'];
const LAST = ['Patel', 'Nguyen', 'Okafor', 'Smith', 'Garcia', 'Kim', 'Rossi', 'Haddad'];

export function generateCustomers(seed = 42, count = 10) {
  const next = rng(seed + 1);
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[Math.floor(next() * FIRST.length)];
    const last = LAST[Math.floor(next() * LAST.length)];
    return {
      name: `${first} ${last}`,
      email: `${first}.${last}.${i + 1}@example.test`.toLowerCase(),
    };
  });
}
