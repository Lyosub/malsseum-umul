import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a); const dir = 'E:/temp/claude-work/tmpglb/';
async function closeModals(){ for (let k = 0; k < 5; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(400); } }
async function stepDialog(){ for (let k = 0; k < 90; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(90); } await w(600); }
const st = () => E(() => { const q = window.__debug.curStep(); return `${window.__debug.cur} ${q ? q.id : 'none'} @${window.__debug.zone}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id + ' in ' + d.zone); const p = m.mesh.position; d.player.position.set(p.x + 1.0, 0, p.z + 0.8); }, id); await w(900); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const waitZone = async z => { await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, z); await w(1500); };
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => window.__debug.openScrollGate()); await w(400);
console.log('문:', (await page.$eval('#scroll-gate-body', e => e.innerText)).split('\n').slice(1, 4).join(' | '));
await E(() => document.querySelector('[data-scroll="moses0"]').click()); await waitZone('egypt');
console.log('1', await st());
await goNear('hb_mother'); await act(); await stepDialog(); console.log('2', await st());
await goNear('hb_mother'); await act(); await stepDialog(); await w(400);
for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++){ await E(i => document.querySelector(`[data-seg="${i}"]`).click(), i); await w(40); }
await E(() => document.getElementById('mg-act').click()); await w(600); await stepDialog(); console.log('3 상자 칠한 뒤', await st());
await goNear('pr_reeds'); await act(); await stepDialog(); console.log('4', await st());
await E(() => { const D = window.__debug; D.player.position.set(-27, 0, 8); D.setCam(-1.2, 0.3); D.setZoom(1.4); }); await w(1200); await page.screenshot({ path: dir + 'prologue-reeds.png' });
await goNear('pr_girl'); await act(); await stepDialog(); console.log('5', await st());
await goNear('pr_princess'); await act(); await stepDialog(); await closeModals(); console.log('6', await st(), 'card', await E(() => window.__debug.ST.verses.includes('ex2-10')));
await goNear('moses'); await act(); await stepDialog(); console.log('7', await st());
await E(() => { const D = window.__debug, m = D.markers.find(x => x.data.id === 'to-midian2'); D.travelTo(m.data); }); await waitZone('midian'); await w(800);
console.log('8', await st());
await goNear('pr_well'); await act(); await stepDialog(); await w(300);
for (let i = 0; i < 10; i++){ await E(() => document.getElementById('mg-act').click()); await w(60); }
await w(600); await stepDialog(); console.log('9', await st());
await goNear('jethro'); await act(); await stepDialog(); await w(1500);
console.log('완료 창:', await page.$eval('#clear-title', e => e.textContent));
await closeModals(); await page.waitForFunction(() => window.__debug.cur === 'moses', { timeout: 60000 }); await w(2000);
console.log('모세로 돌아옴:', await st());
// 표징 두 가지(1장 마친 상태로)
await E(() => { const S = window.__debug.ST; S.ch = 1; S.step = 0; S.cleared = false; window.__debug.refreshShow(); }); await w(500);
await E(() => window.__debug.signsGame()); await w(300);
await E(() => document.getElementById('mg-act').click()); await w(300);
await E(() => document.getElementById('sg-tail').click()); await w(200);
for (let i = 0; i < 3; i++){ await E(() => document.getElementById('mg-act').click()); await w(150); }
console.log('표징 끝:', await E(() => window.__debug.ST.signsDone), JSON.stringify(await E(() => window.__debug.mat)));
await E(() => document.getElementById('mg-act').click()); await w(300);
await E(() => window.__debug.addGeneal(['나손'])); await E(() => document.getElementById('btn-book').click()); await w(500);
console.log('족보:', (await page.$eval('#book-cards', e => e.innerText)).match(/족보 조각 · [^\n]*/)[0]);
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
