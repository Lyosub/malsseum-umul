import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy&shopmock&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
const E = (f, ...a) => page.evaluate(f, ...a);
const close = async () => { for (let k = 0; k < 4; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(300); } };
await E(() => { const S = window.__debug.ST; S.stars = 32; S.quiz = { c2_lice: 'miss', c4_fear: 'miss' }; });
console.log('쓸 수 있는 별:', await E(() => window.__debug.starsLeft()));
// ③ 칭호
await E(() => document.getElementById('btn-book').click()); await w(600);
console.log('③ 칭호:', await E(() => ['말씀을 묵상하는 사람', '말씀을 새긴 사람', '지혜로운 마음의 사람'].map(t => !!document.querySelector(`[data-title="${t}"]`)).join(',')));
// ④ 다시 풀기
console.log('④ 목록:', await E(() => document.querySelectorAll('[data-retry]').length));
await E(() => document.querySelector('[data-retry="c2_lice"]').click()); await w(600);
await E(() => { const b = [...document.querySelectorAll('[data-opt]')].find(x => x.textContent === '이는 하나님의 권능이니이다'); b.click(); }); await w(300);
console.log('④ 결과:', await E(() => window.__debug.ST.quiz.c2_lice), await page.$eval('#mg-area', e => e.textContent.slice(0, 40)));
await E(() => document.getElementById('mg-act').click()); await w(300); await close();
// ① 히든 힌트
await E(() => document.getElementById('btn-hq').click()); await w(500);
await E(() => document.querySelector('[data-hqhint]').click()); await w(400);
console.log('① 힌트:', (await page.$eval('#hq-list', e => e.innerText)).split('\n').find(l => l.includes('⭐ ')) || '없음');
await page.screenshot({ path: dir + 'stars-hq.png' }); await close();
// ② 공방 교환
await E(() => window.__debug.openCraft()); await w(600);
const b0 = await E(() => window.__debug.mat.blue || 0);
await E(() => document.querySelector('[data-starx="blue"]').click()); await w(400);
console.log('② 청색 실:', b0, '→', await E(() => window.__debug.mat.blue));
await page.screenshot({ path: dir + 'stars-craft.png' }); await close();
// ⑤ 도서관
console.log('⑤ 닿음:', await E(() => { const d = window.__debug, m = d.markers.find(x => x.data.id === 'library'); const p = m.mesh.position; for (let a = 0; a < 8; a++) if (d.reachable(p.x + Math.cos(a) * 1.2, p.z + Math.sin(a) * 1.2)) return 'ok'; return 'NO'; }));
await E(() => { const d = window.__debug, m = d.markers.find(x => x.data.id === 'library'); const p = m.mesh.position; d.player.position.set(p.x + 0.9, 0, p.z + 0.7); }); await w(900);
await E(() => document.getElementById('interact-btn').click()); await w(500);
await E(() => document.querySelector('[data-lib="1"]').click()); await w(400);
console.log('⑤ 1장 칸:', await E(() => document.querySelectorAll('#lib-list .keyline').length), '구절');
await page.screenshot({ path: dir + 'stars-lib.png' });
console.log('남은 별:', await E(() => window.__debug.starsLeft()), '(32-1-1-3-2=25)');
console.log('errors', errors.length ? errors.slice(0, 6) : 'none');
await browser.close();
