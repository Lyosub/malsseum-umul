import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notut&shopmock');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
const w = ms => new Promise(r => setTimeout(r, ms)); const D = '(window.__debug)';
await page.evaluate(() => localStorage.removeItem('inodyssey-mockbal'));
// 상점 주인에게 말 걸기
await page.evaluate(() => { const D = window.__debug, m = D.markers.find(k => k.data.id === 'a_shop'); D.player.position.set(m.mesh.position.x + 1.2, 0, m.mesh.position.z + 1); }); await w(900);
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(800);
console.log('상점 열림:', await page.evaluate(() => !document.getElementById('shop-modal').classList.contains('hidden')), '|', await page.$eval('#shop-bal', e => e.textContent));
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/shop-a.png' });
await page.evaluate(() => document.querySelector('[data-buy="staff-budding"]').click()); await w(1500);
console.log('지팡이:', await page.$eval('#shop-msg', e => e.textContent), '|', await page.$eval('#shop-bal', e => e.textContent), '| 손에 듦', await page.evaluate(() => window.__debug.staffOn));
await page.evaluate(() => document.querySelector('#shop-tabs [data-c="pet"]').click()); await w(300);
await page.evaluate(() => document.querySelector('[data-buy="pet-puppy"]').click()); await w(1500);
console.log('펫:', await page.$eval('#shop-msg', e => e.textContent), '|', await page.$eval('#shop-bal', e => e.textContent));
await page.evaluate(() => document.querySelector('[data-buy="pet-donkey"]').click()); await w(1500);
console.log('나귀(잔액 부족?):', await page.$eval('#shop-msg', e => e.textContent));
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/shop-b.png' });
await page.evaluate(() => document.querySelector('#shop-modal .close').click()); await w(400);
// 걸어 다니며 펫이 따라오는지
const p0 = await page.evaluate(() => window.__debug.petPos);
await page.keyboard.down('w'); await w(3000); await page.keyboard.up('w'); await w(1500);
const pl = await page.evaluate(() => { const p = window.__debug.player.position; return [p.x, p.z]; }), pp = (await page.evaluate(() => window.__debug.petPos)).split(',').map(Number);
console.log('펫 따라옴: 처음', p0, '→ 학생과 거리', Math.hypot(pl[0] - pp[0], pl[1] - pp[2]).toFixed(2));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-2, 0, 12); D.setHeading(0); D.setCam(Math.PI * 0.85, 0.22); D.setZoom(0.62); }); await w(2500);
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/shop-c.png' });
// 새로고침해도 장착 유지(?reset 없이)
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notut&shopmock'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
console.log('새로고침 후:', await page.evaluate(() => window.__debug.equip), '| 지팡이', await page.evaluate(() => window.__debug.staffOn), '| 펫', !!(await page.evaluate(() => window.__debug.petPos)));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
