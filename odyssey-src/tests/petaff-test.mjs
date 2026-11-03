import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('dialog', d => d.accept());
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&shopmock&season=harvest&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => document.getElementById('tut-skip') && document.getElementById('tut-skip').click());
await page.evaluate(() => document.getElementById('btn-shop').click()); await w(500);
await page.evaluate(() => document.querySelector('#shop-tabs button[data-c="pet"]').click()); await w(300);
await page.evaluate(() => document.querySelector('[data-buy="pet-puppy"]').click()); await w(2500);
await page.evaluate(() => document.querySelector('#shop-modal .close').click()); await w(500);
console.log('🐾 버튼:', await page.$eval('#btn-pet', e => !e.classList.contains('hidden')));
await page.evaluate(() => { window.__debug.ST.manna = 3; document.getElementById('btn-pet').click(); }); await w(400);
for (let i = 0; i < 5; i++){ await page.evaluate(() => document.querySelector('[data-pa="pat"]').click()); await w(120); }
for (let i = 0; i < 3; i++){ await page.evaluate(() => document.querySelector('[data-pa="feed"]').click()); await w(120); }
console.log('펫 창:', await page.$eval('#pet-modal', e => e.innerText.replace(/\s+/g, ' ').slice(0, 260)));
await page.screenshot({ path: dir + 'pet-modal.png' });
await page.evaluate(() => { window.__debug.ST.petAff['pet-puppy'] = 90; document.querySelector('#pet-modal .close').click(); document.getElementById('btn-pet').click(); }); await w(300);
await page.evaluate(() => document.querySelector('[data-pa="trick"]').click()); await w(300);
console.log('재주 중 회전:', await page.evaluate(() => window.__debug.petPos3 && window.__debug.petPos3[1].toFixed(2)));
await w(3500); console.log('앉기(가만히 3.5초) — 펫 위치 y:', await page.evaluate(() => window.__debug.petPos3[1].toFixed(2)));
// 절기 장식
await page.evaluate(() => { const D = window.__debug, m = D.markers.find(x => x.data.id === 'home-in'); D.player.position.set(m.data.x + 0.6, 0, m.data.z + 0.4); }); await w(800);
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(1500);
await page.evaluate(() => document.getElementById('btn-home').click()); await w(2500);
console.log('꾸미기 목록에 한정 장식:', await page.$eval('#hp-items', e => [...e.querySelectorAll('.hp-it')].filter(b => /곡식단|과일|별|구유/.test(b.textContent)).map(b => b.innerText.replace(/\s+/g, ' ')).join(' | ')));
await page.evaluate(() => document.querySelector('[data-hk="harvest-sheaf"]').click()); await w(300); await page.evaluate(() => window.__debug.homeTap(420, 200)); await w(300);
await page.evaluate(() => document.querySelector('[data-hk="fruit-basket"]').click()); await w(300); await page.evaluate(() => window.__debug.homeTap(360, 220)); await w(500);
console.log('놓은 것:', await page.evaluate(() => window.__debug.homeObjs.map(o => o.e.k).join(',')), '|', await page.$eval('#quest-toast', e => e.textContent));
await page.screenshot({ path: dir + 'harvest.png' });
console.log('errors', errors.length ? errors.join(' / ') : 'none'); await browser.close();
