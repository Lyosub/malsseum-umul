import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
console.log('reachable', await E(() => window.__debug.reachable(-12.8, -3.2)));
await E(() => { window.__debug.ST.cleared = true; });
await E(() => { const d = window.__debug, m = d.markers.find(x => x.data.id === 'links'); const p = m.mesh.position; d.player.position.set(p.x + 1.0, 0, p.z + 0.6); }); await w(900);
console.log('버튼:', await page.$eval('#interact-btn', e => e.textContent));
await E(() => document.getElementById('interact-btn').click()); await w(500);
console.log('창 열림:', await E(() => !document.getElementById('links-modal').classList.contains('hidden')));
// 틀린 짝 한 번
await E(() => document.querySelector('[data-lk="o:0"]').click()); await w(100);
await E(() => document.querySelector('[data-lk="n:1"]').click()); await w(100);
console.log('틀림:', await page.$eval('#links-body', e => e.innerText.split('\n').pop()));
await page.screenshot({ path: dir + 'links.png' });
for (let i = 0; i < await E(() => window.__debug.LINKS.length); i++){ await E(i => document.querySelector(`[data-lk="o:${i}"]`).click(), i); await w(80); await E(i => { const L = window.__debug.LINKS, r = L.findIndex(x => x.ntr === L[i].ntr); document.querySelector(`[data-lk="n:${r}"]`).click(); }, i); await w(80); }
console.log('신약 카드 수', await E(() => document.querySelectorAll('[data-lk^="n:"]').length), '/ 짝', await E(() => window.__debug.LINKS.length));
console.log('완료:', await E(() => window.__debug.links.length), await page.$eval('#links-body', e => e.innerText.split('\n').pop()), 'badge', await E(() => window.__debug.ST.badges.includes('links_all')), 'mat', JSON.stringify(await E(() => window.__debug.mat)));
await page.screenshot({ path: dir + 'links-done.png' });
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
