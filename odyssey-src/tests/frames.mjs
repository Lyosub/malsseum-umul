import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 300, height: 420 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?close');
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
await page.evaluate(()=>{ document.querySelectorAll('body > div').forEach(d=>{ if(d.id!=='canvas-wrap') d.style.display='none'; }); window.__debug.player.position.set(-3,0,30); });
const wait = ms => new Promise(r=>setTimeout(r,ms));
await wait(2000);
const dir='E:/temp/claude-work/exodus-game/stage1/frames/';
for (let i=0;i<4;i++){ await page.screenshot({path:dir+`idle${i}.png`}); await wait(700); }
await page.keyboard.down('d'); await wait(800);
for (let i=0;i<6;i++){ await page.screenshot({path:dir+`walk${i}.png`}); await wait(120); }
await page.keyboard.down('Shift'); await wait(700);
for (let i=0;i<6;i++){ await page.screenshot({path:dir+`run${i}.png`}); await wait(90); }
await page.keyboard.up('Shift'); await page.keyboard.up('d'); await wait(900);
await page.keyboard.press(' '); await wait(500); await page.screenshot({path:dir+`wave.png`});
await browser.close();
