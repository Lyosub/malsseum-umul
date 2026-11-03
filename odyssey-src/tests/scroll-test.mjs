import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'file:///E:/temp/claude-work/exodus-game/prototype-standalone.html';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const reqs = []; page.on('request', r => { if (r.url().includes('scrolls/')) reqs.push(r.url().split('/').slice(-2).join('/')); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
const ready = async () => { await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1200); };
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `cur=${D.cur} step=${q ? q.id : 'none'} zone=${D.zone} | moses ch=${D.ST.ch} step=${D.ST.step} cleared=${D.ST.cleared}`; });
async function stepDialog(){ for (let k = 0; k < 60; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(250); } }
async function closeModals(){ for (let k = 0; k < 5; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(400); } }
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.0, 0, p.z + 0.8); }, id); await w(900); }
await page.goto(BASE + '?reset&notype&ch=10&body=boy&zone=alpha&devscroll'); await ready();
console.log('시작:', await st(), '문 자리 걸어갈 수 있음:', await E(() => window.__debug.reachable(3.5, 2.5)));
await goNear('scroll_gate'); console.log('문 버튼:', await page.$eval('#interact-btn', e => e.textContent));
await E(() => document.getElementById('interact-btn').click()); await w(500);
console.log('문 창:', (await page.$eval('#scroll-gate-body', e => e.innerText)).split('\n').slice(1, 4).join(' | '));
await E(() => document.querySelector('[data-scroll="devtest"]').click());
await page.waitForFunction(() => window.__debug.zone === 'sinai' && !window.__debug.pendingNPC, { timeout: 90000 }); await w(2000);
console.log('펼친 뒤:', await st(), '| 퀘스트:', (await page.$eval('#quest-list', e => e.textContent)).slice(0, 40), '| world:', await E(() => window.__dvWorld));
console.log('번제단 보임(dv1 단계):', await E(() => { const m = window.__debug.markers.find(x => x.data.id === 'dv_altar'); return m ? !m.hidden : 'none'; }));
await goNear('moses'); await E(() => document.getElementById('interact-btn').click()); await w(400); await stepDialog(); await w(500);
console.log('모세 대화 후:', await st());
await goNear('dv_altar'); await E(() => document.getElementById('interact-btn').click()); await w(400); await stepDialog(); await w(1500);
console.log('완료 창:', await E(() => !document.getElementById('clear-modal').classList.contains('hidden')), await page.$eval('#clear-title', e => e.textContent));
await closeModals(); console.log('완료 뒤:', await st(), '| 퀘스트:', (await page.$eval('#quest-list', e => e.textContent)).slice(0, 40));
// 새로고침해도 시험 두루마리가 이어지는지
await page.goto(BASE + '?notype&body=boy&devscroll'); await ready();
console.log('새로고침:', await st());
// 모세로 돌아가기
await E(() => window.__debug.enterScroll('moses')); await page.waitForFunction(() => !window.__debug.pendingNPC, { timeout: 90000 }); await w(2500);
console.log('모세로:', await st(), '| 퀘스트:', (await page.$eval('#quest-list', e => e.textContent)).slice(0, 40));
console.log('저장된 두루마리 진행:', JSON.stringify(await E(() => window.__debug.ST.sp)));
console.log('받은 두루마리 파일:', reqs.join(', ') || '(페이지 안에 들어 있음)');
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
