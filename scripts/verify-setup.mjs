// Pre-workshop check. Run: npm run verify
import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const results = [];
async function check(name, fn) {
  try {
    results.push({ ok: true, name, detail: (await fn()) ?? '' });
  } catch (err) {
    results.push({ ok: false, name, detail: err.message });
  }
}

await check('Node.js 20+', () => {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20) throw new Error(`found ${process.version}; install Node 20 or newer from nodejs.org`);
  return process.version;
});

await check('Git', () => execSync('git --version', { encoding: 'utf8' }).trim());

await check('Playwright 1.60+', () => {
  const pkg = new URL('../node_modules/@playwright/test/package.json', import.meta.url);
  if (!existsSync(pkg)) throw new Error('not installed; run: npm install');
  const { version } = JSON.parse(readFileSync(pkg, 'utf8'));
  const [major, minor] = version.split('.').map(Number);
  if (major < 1 || (major === 1 && minor < 60)) throw new Error(`found ${version}; run: npm i -D @playwright/test@latest`);
  return version;
});

await check('Chromium launches', async () => {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch().catch(() => {
    throw new Error('browser missing; run: npx playwright install chromium');
  });
  const version = browser.version();
  await browser.close();
  return version;
});

await check('Sample app starts', async () => {
  const port = 3199;
  const server = spawn(process.execPath, ['app/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore',
  });
  try {
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://localhost:${port}/api/health`);
        if (res.ok) return `ok (UI ${(await res.json()).uiVersion})`;
      } catch {
        // not up yet
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`no response on port ${port} after 10s`);
  } finally {
    server.kill();
  }
});

console.log('\nWorkshop setup check\n');
for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(20)} ${r.detail}`);
console.log('\n  ----  AI agent loop      Can\'t be checked automatically. Make sure you can log in to');
console.log('                             Claude Code, VS Code + Copilot, Codex or opencode.\n');

const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `${failed} check(s) failed. Fix them, or come anyway: there is a browser-only fallback.\n` : 'All set. See you at the workshop!\n');
process.exit(failed ? 1 : 0);
