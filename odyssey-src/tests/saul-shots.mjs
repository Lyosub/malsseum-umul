// 7편 1부 장면 사진 — 라마, 기브아(기스의 집·숩 땅의 성읍·하나님의 산), 미스바 짐보따리, 야베스, 길갈 비 (r6-shots와 같은 방식: 카메라는 학생 뒤에서 -z 쪽을 본다)
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 500 });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(2000);
const OUT = 'E:/temp/claude-work/saul7/_shot_';
async function go(sp, zone){
  await E(sp => { const D = window.__debug; D.ST.cleared = true; D.ST.sp.ruth = { ch: 8, step: 3, cleared: true }; D.enterScroll('saul'); D.ST.sp.saul = Object.assign(D.ST.sp.saul || {}, sp); }, sp); await w(1200);
  await E(zone => window.__debug.travelTo({ id: 'test', to: zone, spawn: [0, 0] }), zone);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(2500);
}
async function look(x, z, file, dx = 0, dz = 5){
  await E(([x, z, dx, dz]) => { const D = window.__debug; D.player.position.set(x + dx, D.player.position.y, z + dz); }, [x, z, dx, dz]);
  await w(6000); await page.screenshot({ path: OUT + file, type: 'jpeg', quality: 70 }); console.log('찍음', file);
}
await go({ ch: 0, step: 1, cleared: false }, 'shiloh'); await look(-30, 22, 'ramah.jpg', 4, 9);
await go({ ch: 1, step: 0, cleared: false }, 'gibeah'); await look(-22, 2, 'kish.jpg', 2, 12);
await go({ ch: 1, step: 2, cleared: false }, 'gibeah'); await look(18, -10, 'zuph.jpg', -2, 16);
await go({ ch: 1, step: 7, cleared: false }, 'gibeah'); await look(-10, -26, 'godhill.jpg', 2, 11);
await go({ ch: 1, step: 10, cleared: false }, 'gibeon'); await look(6, 22, 'bags.jpg', 0, 8);
await go({ ch: 2, step: 0, cleared: false }, 'moab'); await look(-6, -22, 'jabesh.jpg', 2, 14);
await go({ ch: 3, step: 3, cleared: false }, 'gilgal'); await look(-6, 6, 'gilgal.jpg', 4, 16);
console.log('오류', errs.length, errs.slice(0, 8));
await browser.close();
