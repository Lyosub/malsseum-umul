import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'] });
const page = await browser.newPage();
// 폰 화면 크기 + 레티나(dpr 3) + CPU 6배 느리게
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const cdp = await page.createCDPSession();
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
const t0 = Date.now();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?fps&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 120000 });
console.log('ready (CPU x6)', Date.now()-t0, 'ms');
const wait = ms => new Promise(r => setTimeout(r, ms));
await page.keyboard.down('Shift'); await page.keyboard.down('w');
for (let i=0;i<3;i++){ await wait(1500); console.log(await page.evaluate(()=>document.getElementById('perf').textContent)); }
await page.keyboard.up('w'); await page.keyboard.up('Shift');
await page.screenshot({ path: 'E:/temp/claude-work/exodus-game/stage1/shots-gpu/mobile.png' });
await browser.close();
