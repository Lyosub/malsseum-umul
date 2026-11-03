// 파일 분리 뒤 확인: 게임이 뜨고, 1편과 2~7편 두루마리가 오류 없이 펼쳐지는지. 로컬 http(8768).
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms));
const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await w(1500);
console.log('시작', await E(() => { const D = window.__debug; return { zone: D.zone, step: D.curStep && D.curStep() && D.curStep().id }; }));
await E(() => { const D = window.__debug; D.ST.cleared = true; for (const k of ['moses0', 'sinai2', 'wild3', 'joshua', 'judges', 'ruth']) { D.ST.sp[k] = Object.assign(D.ST.sp[k] || {}, { ch: 0, step: 0, cleared: true }); } });
for (const id of ['moses0', 'sinai2', 'wild3', 'joshua', 'judges', 'ruth', 'saul']) {
  const before = errors.length;
  await E(i => window.__debug.enterScroll(i), id);
  await w(5000);
  const st = await E(() => { const D = window.__debug, q = D.curStep && D.curStep(); return { cur: D.cur, zone: D.zone, step: q ? q.id : null }; });
  console.log(id, JSON.stringify(st), errors.length === before ? '오류 없음' : '오류 ' + (errors.length - before));
}
console.log('오류 합계', errors.length);
for (const e of [...new Set(errors)].slice(0, 15)) console.log(' -', e.slice(0, 220));
await browser.close();
