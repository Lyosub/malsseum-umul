import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&shopmock&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 });
for (const id of ['btn-shop', 'btn-book', 'btn-daily', 'btn-rank', 'btn-friends', 'btn-set', 'btn-log']){
  await page.evaluate(id => document.getElementById(id).click(), id); await new Promise(r => setTimeout(r, 500));
  const r = await page.evaluate(() => { const m = [...document.querySelectorAll('.modal')].find(x => !x.classList.contains('hidden')); if (!m) return 'no modal'; const x = m.querySelector('.xbtn'), c = m.querySelector('.close'); const vis = el => { const b = el.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight && b.height > 0; }; return m.id + ' ✕보임=' + (x && vis(x)) + ' 닫기보임=' + vis(c); });
  if (id === 'btn-shop') await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/shop-x.png' });
  await page.evaluate(() => { const m = [...document.querySelectorAll('.modal')].find(x => !x.classList.contains('hidden')); m && m.querySelector('.xbtn').click(); }); await new Promise(r => setTimeout(r, 200));
  console.log(id, r, '| ✕ 누른 뒤 닫힘', await page.evaluate(() => ![...document.querySelectorAll('.modal')].some(x => !x.classList.contains('hidden'))));
}
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
