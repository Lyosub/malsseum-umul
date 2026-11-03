import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const errors = []; const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
async function open(q){ const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errors.push(e.message)); await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?' + q);
  await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500); return page; }
// 3장 시작 저장 = 2장 지남 → 기도 스킬 자동 지급, 칭호 2개
let page = await open('reset&notype&ch=3&body=boy');
console.log('3장 저장 스킬:', await page.evaluate(() => window.__debug.skills), '| 칭호:', await page.evaluate(() => window.__debug.myTitle()), '| 학생 동작:', await page.evaluate(() => Object.keys(window.__debug.actions()).join(',')));
await page.evaluate(() => window.__debug.useSkill('pray')); await w(1500);
console.log('기도 빛:', await page.evaluate(() => window.__debug.prayFx), '|', await page.$eval('#quest-toast', e => e.textContent));
await page.evaluate(() => { window.__debug.setCam(window.__debug.camYaw, 0.55); window.__debug.setZoom(2.2); }); await w(800);
await page.screenshot({ path: dir + 'd-pray.png' });
await page.evaluate(() => window.__debug.useSkill('pray')); await w(300);
console.log('쿨타임:', await page.$eval('#quest-toast', e => e.textContent));
await page.evaluate(() => document.getElementById('btn-book').click()); await w(500);
console.log('수집첩 칭호:', await page.$eval('#book-cards', e => e.innerText.split('\n').slice(0, 8).join(' | ')));
await page.evaluate(() => [...document.querySelectorAll('button[data-title]')].find(b => !b.disabled && b.dataset.title.includes('새내기')).click()); await w(400);
console.log('바꾼 칭호:', await page.evaluate(() => window.__debug.myTitle()));
await page.screenshot({ path: dir + 'd-title.png' });
await page.evaluate(() => document.querySelector('#book-modal .close').click());
// 연출 카메라
await page.evaluate(() => { const D = window.__debug; D.startCine('test', D.player.position.x + 6, 0, D.player.position.z, { dur: 3 }); }); await w(1500);
console.log('연출 중:', await page.evaluate(() => window.__debug.cine), '| 퀘스트창 투명도', await page.$eval('#quest-panel', e => getComputedStyle(e).opacity));
await page.screenshot({ path: dir + 'd-cine.png' });
await w(2200); console.log('연출 끝:', await page.evaluate(() => window.__debug.cine));
await page.close();
// 4장 완료 저장 → 찬양
page = await open('reset&notype&ch=4&body=boy');
await page.evaluate(() => { const D = window.__debug; D.ST.cleared = true; }); 
await page.evaluate(() => { const D = window.__debug; D.travelTo(D.markers.find(m => m.data.id === 'to-redsea').data); }); await page.waitForFunction('window.__debug.zone === "redsea"', { timeout: 120000 }); await w(1500);
console.log('4장 완료 스킬:', await page.evaluate(() => window.__debug.skills), '| 칭호', await page.evaluate(() => window.__debug.myTitle()));
const p0 = await page.evaluate(() => window.__debug.player.position.x);
await page.evaluate(() => window.__debug.useSkill('praise')); await w(1200);
await page.keyboard.down('w'); await w(1000); await page.keyboard.up('w');
console.log('찬양 중:', await page.evaluate(() => window.__debug.boost), '| 1초 이동', (await page.evaluate(() => window.__debug.player.position.x) - p0).toFixed(2));
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
