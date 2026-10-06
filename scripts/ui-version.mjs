// Switches the sample app between v1 and the v2 "refactor".
// A running server picks the change up on its next request.
import { writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!['v1', 'v2'].includes(version)) {
  console.error('usage: node scripts/ui-version.mjs v1|v2');
  process.exit(1);
}
writeFileSync(new URL('../.ui-version', import.meta.url), `${version}\n`);
console.log(version === 'v2' ? 'Shipped the v2 "refactor". Re-run your suite.' : 'Restored v1.');
