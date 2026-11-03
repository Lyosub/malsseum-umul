import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 600, height: 420 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(()=>document.querySelectorAll('body > div').forEach(d=>{ if(d.id!=='canvas-wrap') d.style.display='none'; }));
const w = ms => new Promise(r=>setTimeout(r,ms)); const dir='E:/temp/claude-work/exodus-game/stage1/village/';
const shot = async (x,z,yaw,pitch,zoom,name) => { await page.evaluate((x,z,y,p,zm)=>{ const d=window.__debug; d.player.position.set(x,0,z); d.setCam(y,p); d.setZoom(zm); },x,z,yaw,pitch,zoom); await w(1500); await page.screenshot({path:dir+name}); };
await w(3000);
await shot(-2.5,-6.5, 2.4, 0.35, 0.8, 'life-talk.png');      // 이드로·장로 대화
await shot(14.5,-1.5, -0.6, 0.35, 0.8, 'life-work.png');      // 대장장이
await shot(6.5,4.5, 0.2, 0.55, 1.0, 'life-child.png');        // 꼬마 뛰어다님
await shot(22,14, 0, 0.7, 1.5, 'life-pen.png');               // 양 우리·목동
await browser.close();
