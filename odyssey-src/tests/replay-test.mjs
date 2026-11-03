import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('dialog', d => d.accept());
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=4&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => { const D = window.__debug; D.ST.cleared = true; });   // 4장까지 다 마친 학생
const st = () => page.evaluate(() => { const D = window.__debug; return `zone=${D.zone} ch=${D.ST.ch} step=${D.ST.step} cleared=${D.ST.cleared} q=${D.curStep() ? D.curStep().id : '-'}`; });
console.log('처음:', await st());
await page.evaluate(() => window.__debug.openReplay()); await w(400);
console.log('목록:', await page.$eval('#replay-list', e => [...e.querySelectorAll('button')].map(b => (b.disabled ? '✗' : '○') + b.innerText.split('\n')[0]).join(' | ')));
await page.evaluate(() => document.querySelector('[data-rp="rp_redsea"]').click());
await page.waitForFunction(() => window.__debug.zone === 'redsea' && window.__debug.REPLAY && window.__debug.REPLAY.t0, { timeout: 120000 }); await w(1500);
console.log('홍해 다시 하기 중:', await st(), '| 바', await page.$eval('#replay-bar', e => e.innerText.replace(/\s+/g, ' ')));
await page.evaluate(() => window.__debug.player.position.set(53.5, 0, 0)); await w(1500);
await page.waitForFunction(() => window.__debug.zone === 'alpha' && !window.__debug.REPLAY, { timeout: 120000 }); await w(3500);
console.log('끝난 뒤:', await st(), '| 기록', await page.evaluate(() => JSON.stringify(window.__debug.ST.best)), '|', await page.$eval('#quest-toast', e => e.textContent));
// 장 처음부터(1장) 시작했다가 그만두기
await page.evaluate(() => window.__debug.openReplay()); await w(400);
await page.evaluate(() => document.querySelector('[data-rc="0"]').click());
await page.waitForFunction(() => window.__debug.REPLAY && window.__debug.REPLAY.t0, { timeout: 120000 }); await w(1000);
console.log('1장 다시 하기 중:', await st());
await page.evaluate(() => document.getElementById('replay-stop').click());
await page.waitForFunction(() => !window.__debug.REPLAY, { timeout: 60000 }); await w(4000);
console.log('그만둔 뒤:', await st());
// 도중에 새로고침해도 원래대로
await page.evaluate(() => window.__debug.startReplay(window.__debug.REPLAYS[0]));
await page.waitForFunction(() => window.__debug.REPLAY && window.__debug.REPLAY.t0, { timeout: 120000 }); await w(800);
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notype&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1000);
console.log('도중 새로고침 뒤:', await st());
console.log('errors', errors.length ? errors.join(' / ') : 'none'); await browser.close();
