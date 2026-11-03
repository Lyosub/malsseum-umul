import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 500, height: 500 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?close');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(()=>document.querySelectorAll('body > div').forEach(d=>{ if(d.id!=='canvas-wrap') d.style.display='none'; }));
const w = ms => new Promise(r=>setTimeout(r,ms));
for (const [n,x,z] of [['elder',-3.5,-8.5],['herbalist',-14,-9],['jethro',-7,-12.5],['child',2.5,-1.5],['guide',-3,4.5],['moses',3,3]]){
  await page.evaluate((x,z)=>{ const d=window.__debug; d.player.position.set(x+1.6,0,z+2.6); d.setHeading(Math.PI*0.8); d.setZoom(1.1); },x,z);
  await w(1600); await page.screenshot({path:`E:/temp/claude-work/exodus-game/stage1/village/npc-${n}.png`});
}
await browser.close();
