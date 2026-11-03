// 다른 두루마리를 펼친 채로 「다시 하기」 → 끝나면 그 두루마리로 돌아오는지
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha&devscroll');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const S = window.__debug.ST; S.cleared = true; });
await E(() => window.__debug.enterScroll('devtest')); await page.waitForFunction(() => window.__debug.zone === 'sinai' && !window.__debug.pendingNPC, { timeout: 90000 }); await w(1500);
console.log('펼침:', await E(() => window.__debug.cur), await E(() => window.__debug.curStep().id));
await E(() => window.__debug.startReplay(window.__debug.REPLAYS[0])); await page.waitForFunction(() => !window.__debug.pendingNPC, { timeout: 90000 }); await w(2500);
console.log('다시 하기 중:', await E(() => window.__debug.cur), await E(() => { const q = window.__debug.curStep(); return q ? q.id : '-'; }));
await E(() => { window.confirm = () => true; document.getElementById('replay-stop').click(); }); await w(6000);
console.log('그만둔 뒤:', await E(() => window.__debug.cur), await E(() => { const q = window.__debug.curStep(); return q ? q.id : '-'; }), 'moses cleared', await E(() => window.__debug.ST.cleared));
console.log('errors', errors.length ? errors : 'none'); await browser.close();
