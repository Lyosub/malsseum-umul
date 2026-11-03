import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=9&body=boy&shopmock&zone=sinai');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
const E = (f, ...a) => page.evaluate(f, ...a);
const step = () => E(() => { const q = window.__debug.curStep(); return q ? q.id : 'CLEARED'; });
const log = async l => console.log(l.padEnd(14), '→', await step());
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id + ' step ' + (d.curStep() || {}).id); const p = m.mesh.position; d.player.position.set(p.x + 1.0, 0, p.z + 0.8); }, id); await w(900); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(400); } }
async function stepDialog(pick = 0){ for (let k = 0; k < 120; k++){ const st = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await E(p => { const b = document.querySelectorAll('#dlg-choices button'); b[Math.min(p, b.length - 1)].click(); }, pick); else await E(() => document.getElementById('dlg-next').click()); await w(90); } await w(1300); await closeModals(); await w(300); }
async function talk(pick){ await E(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(pick); }
const shot = async (name, x, z, yaw, pitch, zoom) => { await E(([x, z, yaw, pitch, zoom]) => { const D = window.__debug; D.player.position.set(x, 0, z); D.setCam(yaw, pitch); D.setZoom(zoom); }, [x, z, yaw, pitch, zoom]); await w(1600); await page.screenshot({ path: dir + name + '.png' }); };
await log('9장 시작');
await goNear('moses'); await talk(); await log('c9s1 산에 오름');
console.log('모세 숨김:', await E(() => (window.__debug.markers.find(x => x.data.id === 'moses') || {}).hidden));
for (const id of ['gc_1', 'gc_2', 'gc_3']){ await goNear(id); await talk(); } await log('c9s2 백성');
await goNear('aaron'); await talk(0); await log('c9s3 금송아지'); console.log('송아지:', await E(() => window.__debug.calfOn));
await shot('c9-calf', -1, 1, 2.4, 0.25, 1.4);
await goNear('calf_spot'); await talk(); await log('c9s4 잔치');
await goNear('joshua9'); await talk(); await w(2500); await log('c9s5 판을 깨뜨림');
await goNear('calf_spot'); await talk(); await w(1500); await log('c9s6 불사름'); console.log('송아지 남음:', await E(() => window.__debug.calfOn));
await goNear('camp_gate'); await talk(0); await log('c9s7 여호와의 편');
await goNear('tent_meeting'); await talk(); await log('c9s8 회막');
await goNear('rock_cleft'); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(500); await stepDialog(); await w(400); await page.evaluate(() => window.__cleftFinish()); await w(600); await page.evaluate(() => document.getElementById('mg-act').click()); await w(700); await stepDialog(); await log('c9s8b 반석 틈');
await shot('c9-tent', -20, -6, -0.9, 0.2, 1.8);
await E(() => { window.__mgCheat = true; }); await goNear('moses'); await E(() => document.getElementById('interact-btn').click()); await w(500);
for (let i = 0; i < 6; i++){ await E(() => document.getElementById('mg-act').click()); await w(200); } await w(1200); await stepDialog();
console.log('완료:', await page.$eval('#clear-title', e => e.textContent).catch(() => '?')); console.log('광채:', await E(() => window.__debug.shine));
await shot('c9-shine', 1, -17, 3.1, 0.15, 0.8);
await closeModals(); await w(1500); await log('10장 시작');
await goNear('moses'); await talk(); await log('c10s1 예물');
for (const id of ['of_1', 'of_2', 'of_3']){ await goNear(id); await talk(); } await log('c10s2 가족들');
await E(() => window.__debug.addMat({ wood: 2, gold: 1 }, null, true));
await goNear('offer_spot'); await E(() => document.getElementById('interact-btn').click()); await w(500);
await page.screenshot({ path: dir + 'c10-offer.png' });
await E(() => document.querySelector('[data-offer]').click()); await w(200); await E(() => document.getElementById('mg-act').click()); await w(700); await stepDialog(); await log('c10s3 예물 드림');
await goNear('bezalel'); await talk(); await w(1500); await log('c10s4 궤'); console.log('궤:', await E(() => window.__debug.arkOn));
await goNear('moses'); await E(() => document.getElementById('interact-btn').click()); await w(600);
for (let i = 0; i < 16; i++){ await E(i => document.querySelector(`[data-er="${i}"]`).click(), i); await w(150); }
console.log('성막 단계:', await E(() => window.__debug.tabStage)); await page.screenshot({ path: dir + 'c10-erect.png' });
await E(() => document.getElementById('mg-act').click()); await w(800); await stepDialog();
console.log('완료:', await page.$eval('#clear-title', e => e.textContent).catch(() => '?'), '| 영광 구름:', await E(() => window.__debug.gloryOn));
await closeModals(); await w(1000);
await shot('c10-tab', 20, -2, 0.9, 0.3, 2.6); await shot('c10-tab2', -2, 2, 3.14, 0.35, 2.2);
console.log('배지:', await E(() => window.__debug.ST.badges.filter(b => ['lords_side', 'willing', 'as_commanded'].includes(b)).join(',')));
console.log('구절:', await E(() => window.__debug.ST.verses.filter(v => /ex3[2-9]|ex40/.test(v)).join(',')));
console.log('errors', errors.length ? errors.slice(0, 8) : 'none');
await browser.close();
