import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push(m.text().slice(0, 200)); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
await page.goto('http://localhost:8766/odyssey/?reset');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await new Promise(r => setTimeout(r, 3000));
await page.evaluate(() => { document.querySelector('.pick-b[data-b="boy"]') && null; document.getElementById('pick-modal').classList.add('hidden'); document.getElementById('btn-shop').click(); });
await new Promise(r => setTimeout(r, 2500));
console.log('상점 안내:', await page.$eval('#shop-bal', e => e.innerHTML));
console.log('supabase 연결:', await page.evaluate(() => typeof window.supabase + ' / ' + (window.SUPABASE_URL || '').slice(0, 30)));
// 사이트 첫 화면·로그인 화면도 정상인지
for (const u of ['/', '/login.html?next=/odyssey/', '/shop.html']){ const r = await page.goto('http://localhost:8766' + u); console.log(u, r.status()); }
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
