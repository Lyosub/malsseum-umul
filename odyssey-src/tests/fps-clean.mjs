import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 600 });
for (const z of ['alpha','midian','egypt']){
  await page.goto(`file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?fps&reset&zone=${z}`);
  await page.waitForFunction('window.__ready === true', { timeout: 90000 });
  await page.keyboard.down('w'); const r=[];
  for (let i=0;i<5;i++){ await new Promise(x=>setTimeout(x,1050)); r.push(await page.evaluate(()=>document.getElementById('perf').textContent.split(' · ').slice(0,2).join(' '))); }
  await page.keyboard.up('w'); console.log(z, r.join(' | '));
}
await browser.close();
