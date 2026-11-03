import puppeteer from 'puppeteer-core';
const OUT='E:/temp/claude-work/insta-odyssey/shots/';
const mode = process.argv[2], pet = process.argv[3] || 'none';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 640, deviceScaleFactor: 1 });
page.on('dialog', d => d.accept()); page.on('pageerror', e => console.log('PAGEERR', e.message.slice(0,120)));
const w = ms => new Promise(r => setTimeout(r, ms));
const E = (f, ...a) => page.evaluate(f, ...a);
const step = async (name, fn) => { try { await fn(); console.log('ok', name); } catch (e) { console.log('FAIL', name, String(e.message).slice(0,200)); } };
if (pet !== 'none') await page.evaluateOnNewDocument(p => { localStorage.setItem('inodyssey-owned', JSON.stringify(['pet-donkey','pet-dove','pet-puppy'])); localStorage.setItem('inodyssey-equip', JSON.stringify({ pet: p })); }, pet);
const zone = mode === 'moses' ? 'egypt&ch=3' : 'alpha&ch=8';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy&shopmock&zone=' + zone);
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(3000);
const hideUI = () => E(() => { document.querySelectorAll('.toast,#toast,#hint-bar').forEach(e => e.style.display='none'); });
if (mode === 'moses') {
  for (const yaw of [0, 1.2, 2.4, 3.6, 4.8]) await step('moses-yaw' + yaw, async () => {
    await E(() => { const d = window.__debug, m = d.markers.find(x => x.data.id === 'moses'); const p = m.mesh.position; d.player.position.set(p.x + 1.8, p.y, p.z + 0.4); });
    await E(y => { const D = window.__debug; D.setCam(y, 0.12); D.setZoom(0.7); }, yaw); await w(1500); await hideUI(); await page.screenshot({ path: OUT + `02-moses-y${yaw}.png` }); });
}
if (mode === 'pet') await step('pet-' + pet, async () => { await E(() => { const D = window.__debug; D.setCam(Math.PI, 0.12); D.setZoom(0.7); D.player.position.set(0, 0, 12); }); await w(2500); await hideUI(); await page.screenshot({ path: OUT + '06-' + pet + '.png' }); });
if (mode === 'home') {
  await step('home', async () => {
    await E(() => document.getElementById('btn-menu').click()); await w(300); await E(() => document.getElementById('btn-home').click()); await w(2500);
    const place = async (k, x, y) => { await E(k => document.querySelector(`[data-hk="${k}"]`)?.click(), k); await w(300); await page.mouse.click(x, y); await w(500); };
    const keys = await E(() => [...document.querySelectorAll('[data-hk]')].map(b => b.dataset.hk));
    console.log(keys.join(','));
    const pos = [[560,330],[700,360],[620,420],[760,300],[520,260],[680,250],[820,380],[470,380]];
    for (let i = 0; i < Math.min(keys.length, 8); i++) await place(keys[i], pos[i][0], pos[i][1]);
    await w(800); await page.screenshot({ path: OUT + '07b-home-decor.png' });
  });
}
if (mode === 'rank') await step('rank', async () => {
  const a = [1,2,3].map(i => ({ kind:'progress', rank:i, nickname:['모험가A','모험가B','모험가C'][i-1], is_mine:i===2, title:'', score:0, chapters:10-i, verses:30-i*3 }));
  const b = [['모험가A',14],['모험가B',11],['모험가C',9],['모험가D',7],['모험가E',5]].map(([n,v],i) => ({ group_name:'우리 오이코스', nickname:n, verses:v, is_mine:i===1 }));
  await E((a,b) => window.__debug.rankMock(a, b, 'oikos'), a, b); await w(1200); await page.screenshot({ path: OUT + '09-oikos.png' }); });
await browser.close();
