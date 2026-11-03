import puppeteer from 'puppeteer-core';
const OUT='E:/temp/claude-work/insta-odyssey/shots/';
const pet = process.argv[2] || 'none', mode = process.argv[3] || 'main';
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
const hideToast = () => E(() => { document.querySelectorAll('.toast,#toast,#hint-bar').forEach(e => e.style.display='none'); });
const goNear = async id => { await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id); const p = m.mesh.position; d.player.position.set(p.x + 1.6, p.y, p.z + 1.6); }, id); await w(900); };
if (mode === 'pet') await step('pet-' + pet, async () => { await E(() => { const D = window.__debug; D.setCam(Math.PI, 0.15); D.setZoom(0.7); }); await E(() => { window.__debug.keys && 0; }); await w(2500); await hideToast(); await page.screenshot({ path: OUT + '06-' + pet + '.png' }); });
if (mode === 'moses') {
  await step('moses', async () => { await goNear('moses'); await E(() => document.getElementById('interact-btn').click()); await w(1500); await hideToast(); await page.screenshot({ path: OUT + '02-moses-dialog.png' }); });
}
if (mode === 'main') {
  await step('clear', async () => { await E(() => window.__debug.showClear()); await w(1500); await page.screenshot({ path: OUT + '04-clear.png' }); await E(() => document.querySelector('.modal:not(.hidden) .close, #clear-close, #clear-ok')?.click()); await w(500); });
  await step('daily', async () => { await E(() => document.getElementById('btn-menu').click()); await w(300); await E(() => document.getElementById('btn-daily').click()); await w(1200); await page.screenshot({ path: OUT + '08a-daily.png' }); await E(() => document.querySelector('.modal:not(.hidden) .close')?.click()); await w(400); });
  await step('hq', async () => { await E(() => document.getElementById('btn-menu').click()); await w(300); await E(() => document.getElementById('btn-hq').click()); await w(1200); await page.screenshot({ path: OUT + '08b-hq.png' }); await E(() => document.querySelector('.modal:not(.hidden) .close')?.click()); await w(400); });
  await step('worship', async () => { await E(() => { window.__debug.mockMsu && window.__debug.mockMsu(); }); await E(() => document.getElementById('btn-menu').click()); await w(300); await E(() => document.getElementById('btn-worship').click()); await w(1200); await page.screenshot({ path: OUT + '08c-worship.png' }); await E(() => document.querySelector('.modal:not(.hidden) .close')?.click()); await w(400); });
  await step('rank', async () => { await E(() => { window.__debug.rankMock && window.__debug.rankMock(); }); await E(() => document.getElementById('btn-menu').click()); await w(300); await E(() => document.getElementById('btn-rank').click()); await w(1500); await page.screenshot({ path: OUT + '09-rank.png' }); await E(() => document.querySelector('.modal:not(.hidden) .close')?.click()); await w(400); });
  await step('home', async () => { await E(() => document.getElementById('btn-menu').click()); await w(300); await E(() => document.getElementById('btn-home').click()); await w(2500); await page.screenshot({ path: OUT + '07a-home.png' }); });
}
await browser.close();
