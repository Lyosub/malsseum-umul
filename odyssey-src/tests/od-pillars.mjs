import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 740, height: 360, isMobile: true, hasTouch: true });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0,100)));
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8767/odyssey/index.html?reset&notype&notut&body=boy&shopmock');
await page.waitForFunction('window.__ready === true', { timeout: 100000 }); await w(4000);
await E(() => window.__debug.pillarsGame({ id: 'x', done: false }));
await w(3000);
// 대화가 먼저 나올 수 있으니 넘기기
for (let i = 0; i < 12; i++) { const open = await E(() => !document.getElementById('mg').classList.contains('hidden')); if (open) break; await E(() => document.getElementById('dlg-next') && document.getElementById('dlg-next').click()); await w(500); }
console.log('mg open', await E(() => !document.getElementById('mg').classList.contains('hidden')));
await page.screenshot({ path: 'E:/temp/claude-work/insta-odyssey/shots/pillars-after.png' });
const info = await E(() => { const a = document.getElementById('mg-area').getBoundingClientRect(), box = document.querySelector('.mg-box').getBoundingClientRect(); return { areaH: Math.round(a.height), boxH: Math.round(box.height), vh: innerHeight, btns: [...document.querySelectorAll('[data-pil]')].map(b => { const r = b.getBoundingClientRect(); return Math.round(r.bottom) <= Math.round(box.bottom) }).filter(Boolean).length }; });
console.log(JSON.stringify(info), 'errors', errs.length);
await browser.close();
