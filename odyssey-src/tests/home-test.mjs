import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('dialog', d => d.accept());
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&shopmock&body=girl'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => document.getElementById('tut-skip') && document.getElementById('tut-skip').click());
// 문으로 들어가기
await page.evaluate(() => { const D = window.__debug, m = D.markers.find(x => x.data.id === 'home-in'); D.player.position.set(m.data.x + 0.8, 0, m.data.z + 0.5); }); await w(900);
console.log('문 버튼:', await page.$eval('#interact-btn', e => e.textContent));
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(1500);
console.log('들어간 뒤 위치:', await page.evaluate(() => { const p = window.__debug.player.position; return p.x.toFixed(1) + ',' + p.z.toFixed(1); }), '| 꾸미기 버튼', await page.$eval('#btn-home', e => !e.classList.contains('hidden')));
await page.screenshot({ path: dir + 'home-yard.png' });
await page.evaluate(() => document.getElementById('btn-home').click()); await w(2500);
console.log('꾸미기 창:', await page.$eval('#hp-msg', e => e.textContent), '| 물건 수', await page.$$eval('.hp-it', b => b.length));
// 무료 항아리 2개, 산 모닥불 1개 놓기(화면 가운데 근처 누르기)
const tapAt = async (x, y) => page.evaluate(([x, y]) => window.__debug.homeTap(x, y), [x, y]);
for (const x of [360, 480]){ await page.evaluate(() => document.querySelector('[data-hk="jars"]').click()); await w(200); await tapAt(x, 200); await w(200); }
await page.evaluate(() => document.querySelector('[data-hk="campfire"]').click()); await w(800); await tapAt(420, 150); await w(300);
await page.evaluate(() => document.querySelector('[data-hk="lamb"]').click()); await w(800); await tapAt(420, 250); await w(600);
console.log('놓은 것:', await page.evaluate(() => window.__debug.homeObjs.map(o => o.e.k + '@' + o.e.x + ',' + o.e.z).join(' ')), '|', await page.$eval('#hp-msg', e => e.textContent));
// 하나 골라 돌리기 → 치우기
await page.evaluate(() => { const o = window.__debug.homeObjs[0]; }); 
await tapAt(360, 200); await w(200); console.log('고른 뒤 버튼:', await page.$eval('#hp-sel', e => !e.classList.contains('hidden')));
await page.evaluate(() => document.querySelector('[data-hp="rot"]').click()); await w(200);
await page.screenshot({ path: dir + 'home-edit.png' });
await page.evaluate(() => document.querySelector('[data-hp="del"]').click()); await w(200);
console.log('치운 뒤 개수:', await page.evaluate(() => window.__debug.homeObjs.length));
await page.evaluate(() => document.getElementById('hp-done').click()); await w(500);
console.log('저장:', await page.evaluate(() => JSON.stringify(window.__debug.ST.home)));
// 다시 불러오기(새로고침) → 그대로
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notype&shopmock&body=girl'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(3000);
console.log('새로고침 뒤:', await page.evaluate(() => window.__debug.homeObjs.map(o => o.e.k).join(',')));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-44, 0, 49); D.setCam(0, 0.45); D.setZoom(1.6); }); await w(1200);
await page.screenshot({ path: dir + 'home-view.png' });
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
