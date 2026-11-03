import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 800, height: 560 });
const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
const t0 = Date.now();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
console.log('start zone', await page.evaluate(()=>window.__debug.zone), 'in', Date.now()-t0, 'ms');
const w = ms => new Promise(r=>setTimeout(r,ms)); const dir='E:/temp/claude-work/exodus-game/stage1/zones/';
const info = () => page.evaluate(()=>{ const d=window.__debug; return `zone=${d.zone} npcs=${d.markers.filter(m=>m.ai).length} walking=${d.markers.filter(m=>m.ai&&m.ai.state==='walk').length} pois=${d.POIS.length} obst=${d.obstacles.length} quests=[${[...document.querySelectorAll('#quest-list li')].map(l=>l.textContent).join(' / ')}]`; });
const hide = () => page.evaluate(()=>{ ['hint','quest-panel','joystick-zone','action-cluster','minimap','zoom-ctrl','skill-bar'].forEach(i=>{ const e=document.getElementById(i); if(e) e.style.visibility='hidden'; }); });
await hide(); await w(3000);
console.log(await info());
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(0,0,16); d.setCam(0.3,0.5); d.setZoom(1.6); }); await w(1500);
await page.screenshot({path:dir+'1-alpha.png'});
// 알파 → 미디안 (포털에서 이동하기)
await page.evaluate(()=>window.__debug.player.position.set(0,0,-17)); await w(800);
const btn1 = await page.$eval('#interact-btn', e=>e.textContent + (e.classList.contains('hidden')?' (hidden)':''));
console.log('near portal button:', btn1);
let t1 = Date.now(); await page.click('#interact-btn'); await page.waitForFunction('window.__debug.zone==="midian"', {timeout:60000}); console.log('→ midian in', Date.now()-t1, 'ms');
await w(2500); console.log(await info());
await page.evaluate(()=>{ const d=window.__debug; d.setCam(0.3,0.5); d.setZoom(1.6); }); await w(1200); await page.screenshot({path:dir+'2-midian.png'});
// 미디안 → 애굽
await page.evaluate(()=>window.__debug.player.position.set(-50.8,0,-6)); await w(1500);
t1 = Date.now(); await page.click('#interact-btn'); await page.waitForFunction('window.__debug.zone==="egypt"', {timeout:60000}); console.log('→ egypt in', Date.now()-t1, 'ms');
await w(3000); console.log(await info());
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(20,0,12); d.setCam(-0.9,0.55); d.setZoom(1.7); }); await w(1500); await page.screenshot({path:dir+'3-egypt.png'});
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(-22,0,-2); d.setCam(-1.9,0.45); d.setZoom(1.4); }); await w(1500); await page.screenshot({path:dir+'4-egypt-nile.png'});
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(18,0,-4); d.setCam(-2.4,0.35); d.setZoom(1.5); }); await w(1500); await page.screenshot({path:dir+'5-egypt-palace.png'});
// 애굽 → 미디안 복귀(메모리 해제 후 재구성)
await page.evaluate(()=>window.__debug.player.position.set(50.8,0,0)); await w(1200);
await page.click('#interact-btn'); await page.waitForFunction('window.__debug.zone==="midian"', {timeout:60000});
await w(2000); console.log('back:', await info());
console.log('errors', errors.length?errors.join('\n'):'none');
await browser.close();
