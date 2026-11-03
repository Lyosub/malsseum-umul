import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=' + process.argv[2] + '&shopmock&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await new Promise(r => setTimeout(r, 1500));
console.log(await page.evaluate(() => { const D = window.__debug, P = D.player; const m = P.children.find(o => o.getObjectByName && o.getObjectByName('Head')); const out = {};
  const THREE = P.position.constructor; for (const n of ['Hips','Spine02','neck','Head','headfront','head_end','LeftFoot','LeftToeBase','RightFoot','RightToeBase','LeftShoulder','RightShoulder']){ const b = m.getObjectByName(n); if (!b) continue; const v = new THREE(); b.getWorldPosition(v); P.worldToLocal(v); out[n] = [v.x, v.y, v.z].map(x => +x.toFixed(3)).join(','); } return JSON.stringify(out, null, 0); }));
await browser.close();
