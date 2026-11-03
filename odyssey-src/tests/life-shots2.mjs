import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 600, height: 420 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(()=>document.querySelectorAll('body > div').forEach(d=>{ if(d.id!=='canvas-wrap') d.style.display='none'; }));
const w = ms => new Promise(r=>setTimeout(r,ms)); const dir='E:/temp/claude-work/exodus-game/stage1/village/';
// 마을 가장자리에서 높은 시점으로 마을 전체를 시간차로 4장
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(6,0,12); d.setCam(0.35, 0.72); d.setZoom(1.6); });
for (let i=0;i<4;i++){ await w(i===0?4000:6000); await page.screenshot({path:dir+`life3-${i}.png`}); }
await browser.close();
