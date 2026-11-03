import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a); const dir = 'E:/temp/claude-work/tmpglb/';
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(600); } }
async function stepDialog(){ for (let k = 0; k < 90; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(90); } await w(500); }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(900); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
await page.goto('https://logoswell.kr/odyssey/?reset&notype&ch=10&body=boy&zone=alpha', { timeout: 120000 });
await page.waitForFunction('window.__ready === true', { timeout: 200000 }); await w(1500);
await E(() => { const S = window.__debug.ST; S.cleared = true; S.sp = S.sp || {}; S.sp.sinai2 = { ch: 9, step: 3, cleared: false, rumor: [] }; });
console.log('bundle load', await E(() => window.__debug.enterScroll('sinai2')));
await page.waitForFunction(() => window.__debug.zone === 'sinai' && !window.__debug.pendingNPC, { timeout: 150000 }); await w(2500);
console.log('step', await st());
await goNear('moses'); await act(); await stepDialog(); await w(400);
console.log('mg', await E(() => document.querySelector('#mg-area').innerText.slice(0, 80)));
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
