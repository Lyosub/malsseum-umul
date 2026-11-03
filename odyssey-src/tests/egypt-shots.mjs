import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 600 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
const w = ms => new Promise(r=>setTimeout(r,ms)); const dir='E:/temp/claude-work/exodus-game/stage1/village/';
await page.evaluate(()=>['hint','joystick-zone','action-cluster','zoom-ctrl'].forEach(i=>{const e=document.getElementById(i); if(e) e.style.visibility='hidden';}));
const shot = async (x,z,yaw,pitch,zoom,f)=>{ await page.evaluate((x,z,yaw,pitch,zoom)=>{const d=window.__debug; d.player.position.set(x,0,z); d.setCam(yaw,pitch); d.setZoom(zoom);},x,z,yaw,pitch,zoom); await w(2500); await page.screenshot({path:dir+f}); };
await w(8000);
for (const y of [-0.5, 0.3]) { await shot(20,-10,y,0.25,3.2,'palclose-'+y+'.png'); }


await browser.close();
