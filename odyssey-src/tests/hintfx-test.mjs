import puppeteer from 'puppeteer-core';
const out = 'E:/temp/claude-work/hintfx';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = [];
page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const wait = ms => new Promise(r => setTimeout(r, ms));
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
try { await page.waitForFunction('window.__ready === true', { timeout: 90000 }); }
catch (e){ console.log('NOT READY\n' + errors.join('\n')); await browser.close(); process.exit(1); }
await wait(2500);
const st = () => page.evaluate(() => ({ zone: __debug.zone, step: __debug.AP().step, ch: __debug.AP().ch, lv: __debug.hintLv,
  btn: document.getElementById('hint-btn').className + '|' + document.getElementById('hint-btn').textContent,
  toast: document.getElementById('quest-toast').textContent.slice(0, 160) }));
console.log('before', JSON.stringify(await st()));
await page.evaluate(() => { __debug.stepT = 60; }); await wait(800);
console.log('after 60s', JSON.stringify(await st()));
await page.screenshot({ path: out + '/1-btn.png' });
await page.evaluate(() => document.getElementById('hint-btn').click()); await wait(600);
console.log('tap1', JSON.stringify(await st()));
await page.screenshot({ path: out + '/2-tap1.png' });
await page.evaluate(() => document.getElementById('hint-btn').click()); await wait(1200);
console.log('tap2', JSON.stringify(await st()), 'beam', await page.evaluate(() => __debug.zoneRoot.children.some(c => c.geometry && c.geometry.type === 'CylinderGeometry' && c.geometry.parameters.height === 40)));
await page.screenshot({ path: out + '/3-tap2.png' });
await page.evaluate(() => __debug.advance()); await wait(800);
console.log('after advance', JSON.stringify(await st()));
await page.evaluate(() => __debug.showClear()); await wait(900);
await page.screenshot({ path: out + '/4-fx.png' });
console.log('fx', await page.evaluate(() => document.getElementById('ch-fx').className + '|' + document.getElementById('ch-fx-t').textContent + '|' + document.getElementById('ch-fx-sub').textContent + '|' + document.querySelectorAll('#ch-fx .cf').length));
await wait(3200);
await page.screenshot({ path: out + '/5-modal.png' });
console.log('modal', await page.evaluate(() => document.getElementById('clear-modal').className + '|lines ' + document.querySelectorAll('#clear-body .ln').length + '|fx ' + document.getElementById('ch-fx').className + '|cf ' + document.querySelectorAll('#ch-fx .cf').length));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
