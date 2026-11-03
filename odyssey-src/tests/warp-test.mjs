import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const errors = []; const w = ms => new Promise(r => setTimeout(r, ms));
async function open(q){ const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true }); page.on('pageerror', e => errors.push(e.message));
  await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?' + q); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500); return page; }
const list = page => page.evaluate(() => [...document.querySelectorAll('.warp-go')].map(b => (b.disabled ? '✗' : '○') + b.innerText.replace(/\s+/g, ' ')).join(' | '));
const go = async (page, z) => { await page.evaluate(() => window.__debug.useSkill('warp')); await w(500); await page.evaluate(z => document.querySelector(`[data-wz="${z}"]`).click(), z); await page.waitForFunction(z => window.__debug.zone === z, { timeout: 120000 }, z); await w(3500); };
let page = await open('reset&notype&body=boy');
console.log('처음 스킬:', await page.evaluate(() => window.__debug.skills));
await page.evaluate(() => window.__debug.useSkill('warp')); await w(500); console.log('처음 목록:', await list(page)); await page.close();
page = await open('reset&notype&ch=3&body=boy');
await page.evaluate(() => window.__debug.useSkill('warp')); await w(500); console.log('3장 목록:', await list(page)); await page.evaluate(() => document.querySelector('#warp-modal .close').click());
const s0 = await page.evaluate(() => window.__debug.curStep().id);
await go(page, 'alpha'); console.log('→ 두루마리마을:', await page.evaluate(() => window.__debug.zone), '단계', await page.evaluate(() => window.__debug.curStep().id), '(전', s0 + ')');
await go(page, 'egypt'); console.log('→ 애굽 복귀:', await page.evaluate(() => window.__debug.zone), '단계', await page.evaluate(() => window.__debug.curStep().id)); await page.close();
page = await open('reset&notype&ch=4&body=boy');
console.log('4장 시작 단계:', await page.evaluate(() => window.__debug.curStep().id));
await go(page, 'redsea'); console.log('→ 홍해(출구 단계 스킬로):', await page.evaluate(() => window.__debug.curStep().id));
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
