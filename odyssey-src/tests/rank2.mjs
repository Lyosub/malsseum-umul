import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 });
const a = [{ kind: 'progress', rank: 1, nickname: '빛나는별', title: '바다를 건넌 믿음의 사람', value: 4, extra: '31/12', is_mine: false }, { kind: 'progress', rank: 2, nickname: '나', title: '재앙 속에서 믿은 사람', value: 2, extra: '17/5', is_mine: true }, { kind: 'brick', rank: 1, nickname: '빛나는별', title: null, value: 14, extra: null, is_mine: false }];
const b = [{ group_name: '1반 오이코스', nickname: '빛나는별', verses: 31, chapters: 4, is_mine: false }, { group_name: '1반 오이코스', nickname: '나', verses: 17, chapters: 2, is_mine: true }];
for (const t of ['progress', 'oikos']){ await page.evaluate((a, b, t) => window.__debug.rankMock(a, b, t), a, b, t); await new Promise(r => setTimeout(r, 400)); console.log(t, ':', await page.$eval('#rank-list', e => e.innerText.replace(/\s+/g, ' '))); await page.screenshot({ path: `E:/temp/claude-work/tmpglb/rank-${t}.png` }); }
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
