import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=3&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => { const D = window.__debug; D.ST.badges.push('companion', 'share', 'trust'); });
await page.evaluate(() => document.getElementById('btn-book').click()); await w(600);
console.log('수집첩 위쪽:', await page.$eval('#book-cards', e => e.innerText.replace(/\s+/g, ' ').slice(0, 330)));
await page.screenshot({ path: dir + 'badge-book.png' });
await page.evaluate(() => document.querySelector('#book-modal .close').click());
// 친구 이름표에 칭호
await page.evaluate(async () => { const D = window.__debug, P = D.player.position; D.FR.ch = { send(){}, track: async () => {} }; D.FR.me = { id: 'me', nick: '나' }; D.FR.meta = { f1: { nick: '빛나는별', body: 'girl', title: '바다를 건넌 믿음의 사람' } }; D.FR.online = 1;
  D.onFriendPos({ id: 'f1', z: D.zone, x: P.x + 2.5, y: P.y, w: P.z - 1, h: 0, a: 'Idle' }); });
await w(2500);
console.log('친구 이름표:', await page.evaluate(() => [...document.querySelectorAll('.ntag')].filter(e => e.textContent.includes('빛나는별')).map(e => e.innerHTML).join('|')));
await page.evaluate(() => window.__debug.setZoom(1.2)); await w(700);
await page.screenshot({ path: dir + 'friend-title.png' });
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
