import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=4&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(2000);
const vis = () => page.evaluate(() => [...document.querySelectorAll('#skill-bar .skill-btn')].map(b => { const r = b.getBoundingClientRect(); return b.textContent.trim() + (getComputedStyle(b).opacity > 0.5 ? '●' : '○'); }).join(' '));
console.log('접힘:', await vis()); await page.screenshot({ path: dir + 'skill-closed.png' });
await page.tap('.skill-toggle'); await w(600);
console.log('펼침:', await vis()); await page.screenshot({ path: dir + 'skill-open.png' });
await page.evaluate(() => [...document.querySelectorAll('.skill-list .skill-btn')].find(b => b.textContent.includes('기도')).click()); await w(700);
console.log('기도 쓴 뒤:', await vis(), '|', await page.$eval('#quest-toast', e => e.textContent));
// 새 스킬 얻을 때(찬양 새로 얻기 흉내)
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => document.getElementById('tut-skip') && document.getElementById('tut-skip').click());
await page.evaluate(() => window.__debug.unlockTest && 0);
console.log('errors', errors.length ? errors.join(' / ') : 'none'); await browser.close();
