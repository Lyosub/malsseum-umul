import puppeteer from 'puppeteer-core';
const OUT='E:/temp/claude-work/insta-odyssey/shots/';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 640 });
page.on('pageerror', e => console.log('PAGEERR', e.message.slice(0,150)));
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8765/odyssey/index.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await w(6000);
console.log('zone', await E(() => window.__debug.zone), 'tut visible', await E(() => !document.getElementById('tut').classList.contains('hidden')));
console.log('markers', await E(() => window.__debug.markers.filter(m => /guide|fountain|a_/.test(m.data.id)).map(m => m.data.id).join(',')));
await page.screenshot({ path: OUT + 'guest-1.png' });
// 안내자 찾기: 튜토리얼 마지막 단계 문구에 나온 분수 광장 안내자
const ids = await E(() => window.__debug.markers.map(m => m.data.id + ':' + (m.data.title||m.data.name||'')).slice(0,40).join(' | '));
console.log(ids);
await browser.close();
