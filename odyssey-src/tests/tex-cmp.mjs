import puppeteer from 'puppeteer-core';
const tag = process.argv[2];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 500, height: 500 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.evaluate(()=>document.querySelectorAll('body > div').forEach(d=>{ if(d.id!=='canvas-wrap') d.style.display='none'; }));
const w = ms => new Promise(r=>setTimeout(r,ms)); await w(3000);
for (const [id, zoom] of [['eg_noble',1.1],['hb_grandpa',1.1],['eg_noble',2.2]]){
  await page.evaluate((id,zoom)=>{ const d=window.__debug; const m=d.markers.find(k=>k.data.id===id); m.ai.state='act'; m.ai.act='Idle'; m.ai.t=99; m.ai.path=null;
    const p=m.mesh.position; m.yaw=m.mesh.rotation.y=0; d.player.position.set(p.x+0.3,0,p.z+2.4); d.setCam(0,0.15); d.setZoom(zoom); }, id, zoom);
  await w(1800); await page.screenshot({path:`E:/temp/claude-work/tmpglb/cmp-${tag}-${id}-${zoom}.png`});
}
await browser.close();
