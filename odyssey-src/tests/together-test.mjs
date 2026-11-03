import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=3&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
console.log('오늘의 퀘스트:', await page.evaluate(() => JSON.stringify(window.__debug.daily)));
// 퀘스트 전부 채우기(종류별 이벤트)
await page.evaluate(() => { const D = window.__debug; for (const k of D.daily.q){ D.dq(k, 200); } }); await w(300);
await page.evaluate(() => document.getElementById('btn-daily').click()); await w(400);
console.log('창:', await page.$eval('#daily-modal', e => e.innerText.replace(/\s+/g, ' ')), '| 메뉴 빨간점', await page.$eval('#btn-menu', e => e.classList.contains('dot')));
await page.screenshot({ path: dir + 'daily.png' });
await page.evaluate(() => document.querySelector('#daily-modal .close').click());
// 가짜 친구
const r = await page.evaluate(async () => {
  const D = window.__debug, P = D.player.position; D.FR.ch = { send(){} }; D.FR.me = { id: 'me' }; D.FR.meta = { f1: { nick: '빛나는별', body: 'girl', hair: null } }; D.FR.online = 1;
  D.onFriendPos({ id: 'f1', z: D.zone, x: P.x + 3, y: P.y, w: P.z, h: 0, a: 'Idle' });
  await new Promise(r => setTimeout(r, 2500));
  D.onFriendPos({ id: 'f1', z: D.zone, x: P.x + 3, y: P.y, w: P.z - 3, h: 0, a: 'Walk' });
  await new Promise(r => setTimeout(r, 800));
  const f = D.FR.list.get('f1'); D.showBubble(f.g, '👋'); D.friendPill();
  return { has: !!f, mixer: !!f.mixer, kids: f.g.children.length, pos: [f.g.position.x - P.x, f.g.position.z - P.z].map(v => v.toFixed(1)).join(','), cur: f.cur };
});
console.log('친구 아바타:', JSON.stringify(r), '| 접속 표시:', await page.$eval('#friend-pill', e => e.textContent));
await w(3500); await page.evaluate(() => { const D = window.__debug; D.showBubble(D.FR.list.get('f1').g, '👋'); D.setZoom(1.3); }); await w(700);
console.log('이름표:', await page.evaluate(() => [...document.querySelectorAll('.ntag')].filter(e => e.textContent === '빛나는별').map(e => e.style.display + ' ' + e.style.transform).join('|')), '| 말풍선', await page.evaluate(() => [...document.querySelectorAll('.emo-bub')].map(e => e.style.left + ',' + e.style.top + ',' + e.style.opacity).join('|')));
await page.screenshot({ path: dir + 'friend.png' });
// 다른 마을로 가면 사라짐
await page.evaluate(() => window.__debug.onFriendPos({ id: 'f1', z: 'midian', x: 0, y: 0, w: 0, h: 0, a: 'Idle' }));
console.log('다른 마을로 간 뒤:', await page.evaluate(() => window.__debug.FR.list.size));
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
