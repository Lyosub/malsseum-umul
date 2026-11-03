import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a); const dir = 'E:/temp/claude-work/tmpglb/';
async function closeModals(){ for (let k = 0; k < 5; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(400); } }
async function stepDialog(){ for (let k = 0; k < 90; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(90); } await w(600); }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `ch${D.ST.ch + 1} ${q ? q.id : 'none'} cleared=${D.ST.cleared}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.0, 0, p.z + 0.8); }, id); await w(900); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy&zone=sinai');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1200);
await E(() => { const D = window.__debug; D.ST.step = D.STORY.findIndex(q => q.id === 'c8s7'); D.refreshShow(); }); await w(300);
await E(() => { const D = window.__debug; D.startChapter(7); D.ST.step = D.STORY.findIndex(q => q.id === 'c8s7'); D.travelTo({ id: 'test', to: 'sinai', spawn: [0, 5] }); }); await page.waitForFunction(() => !window.__debug.pendingNPC, { timeout: 90000 }); await w(2500);
console.log('시작', await st());
await goNear('aaron'); console.log('버튼', await page.$eval('#interact-btn', e => e.textContent)); await act(); await stepDialog(); await closeModals(); await w(600); console.log('c8s7 뒤', await st());
console.log('모세 자리 걸을 수 있음', await E(() => window.__debug.reachable(14, -13.5)), '제단', await E(() => window.__debug.reachable(16, -16)));
await goNear('moses'); await act(); await stepDialog(); await w(300);
for (let i = 0; i < 12; i++){ await E(i => document.querySelector(`[data-pil="${i}"]`).click(), i); await w(40); }
await E(() => document.getElementById('mg-act').click()); await w(700); await stepDialog(); await w(2000);
console.log('완료 창:', await page.$eval('#clear-title', e => e.textContent), '| 구절', await E(() => window.__debug.ST.verses.includes('ex24-7')));
await closeModals(); await w(1500); await closeModals(); await w(800); console.log('9장', await st(), '제단 보임', await E(() => window.__debug.covAltar));
await E(() => { const D = window.__debug; D.player.position.set(12, 0, -10); D.setCam(-2.4, 0.35); D.setZoom(1.6); }); await w(1500); await page.screenshot({ path: dir + 'cov-altar.png' });
// 9장 반석 틈
await E(() => { const D = window.__debug; if (D.ST.ch !== 8) D.startChapter(8); D.ST.step = D.STORY.findIndex(q => q.id === 'c9s8b'); window.__dbg1 = D.ST.step + ':' + D.curStep().id; D.travelTo({ id: 'test', to: 'sinai', spawn: [0, 5] }); }); await page.waitForFunction(() => !window.__debug.pendingNPC, { timeout: 90000 }); await w(2500);
console.log('설정 직후', await E(() => window.__dbg1)); console.log('상태', await E(() => { const D = window.__debug; const m = D.markers.find(x => x.data.id === 'rock_cleft'); return JSON.stringify({ ch: D.ST.ch, step: D.ST.step, q: D.curStep() && D.curStep().id, marker: m ? (m.hidden ? 'hidden' : 'shown') : 'none', modal: [...document.querySelectorAll('.modal:not(.hidden)')].map(x => x.id) }); }));
console.log('반석 자리 걸을 수 있음', await E(() => window.__debug.reachable(-4, -24)));
await goNear('rock_cleft'); await act(); await stepDialog(); await w(300);
await E(() => window.__cleftFinish()); await w(600);
await E(() => document.getElementById('mg-act').click()); await w(700); await stepDialog(); await closeModals();
console.log('반석 뒤', await st(), '구절', await E(() => window.__debug.ST.verses.includes('ex33-22')));
// 5장 만나 시간 제한
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=5&body=boy&zone=wild');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1200);
await E(() => { const D = window.__debug; D.ST.step = D.STORY.findIndex(q => q.id === 'c5s10'); D.travelTo({ id: 'test', to: 'wild', spawn: [20, 0] }); }); await page.waitForFunction(() => !window.__debug.pendingNPC, { timeout: 90000 }); await w(2500);
console.log('만나 해 타이머', !!(await E(() => window.__debug.mannaSun)), '| HUD', await page.$eval('#hud-challenge', e => e.className + ' ' + e.textContent));
await E(() => { window.__debug.mannaSunT0 = performance.now() - 200000; }); await w(1200);
console.log('시간 끝 → 남은 만나', await E(() => window.__debug.mannaFlakes.length), '| HUD', await page.$eval('#hud-challenge', e => e.className));
await w(5500); console.log('이튿날 아침 → 만나', await E(() => window.__debug.mannaFlakes.length), '타이머', !!(await E(() => window.__debug.mannaSun)));
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
