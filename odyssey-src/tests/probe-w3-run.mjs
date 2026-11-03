import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a); const dir = 'E:/temp/claude-work/tmpglb/';
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(600); } }
async function stepDialog(){ for (let k = 0; k < 90; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(90); } await w(500); }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(900); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
const vis = ids => E(ids => ids.map(id => { const m = window.__debug.markers.find(x => x.data.id === id); return id + ':' + (m ? !m.hidden : 'none'); }).join(' '), ids);
const chEnd = async n => { await finish(); await w(1500); console.log(`${n}장 끝:`, await page.$eval('#clear-title', e => e.textContent), '|', await st()); await closeModals(); await w(1500); };
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha&devscroll');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const S = window.__debug.ST; S.cleared = true; S.sp = S.sp || {}; S.sp.sinai2 = { ch: 9, step: 5, cleared: true, rumor: [] }; S.sp.wild3 = { ch: 11, step: 0, cleared: false, rumor: [] }; });
await E(() => window.__debug.enterScroll('wild3')); await page.waitForFunction(() => window.__debug.zone === 'moab' && !window.__debug.pendingNPC, { timeout: 150000 }); await w(2500);
const R = pts => E(pts => pts.map(([x, z]) => x + ',' + z + ':' + window.__debug.reachable(x, z)).join(' '), pts);
console.log('모압 딸들', await R([[20, -7], [16, -4], [21, -9], [12, -6], [19, -3]]));
await E(() => window.__debug.travelTo({ id: 'test', to: 'kadesh', spawn: [30, -4] })); await page.waitForFunction(() => window.__debug.zone === 'kadesh', { timeout: 90000 }); await w(2500);
console.log('가데스 호르', await R([[20, 28], [18, 30], [26, 26], [22, 25], [16, 27]]));
console.log('가데스 아랏', await R([[-4, 30], [0, 31], [-8, 30], [-2, 28], [4, 30]]));
await browser.close();
