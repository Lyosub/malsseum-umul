await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha&devscroll');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const S = window.__debug.ST; S.cleared = true; S.sp = S.sp || {}; S.sp.sinai2 = { ch: 9, step: 5, cleared: true, rumor: [] }; S.sp.wild3 = { ch: 5, step: 0, cleared: false, rumor: [] }; });
await E(() => window.__debug.enterScroll('wild3')); await page.waitForFunction(() => window.__debug.zone === 'kadesh' && !window.__debug.pendingNPC, { timeout: 150000 }); await w(3000);
console.log('펼침', await st(), '| 걸을 수 있음', JSON.stringify(await E(() => [[-21,13],[-26.5,12.5],[-24,14.5],[-28,-18],[-13.8,-27.8],[24,32],[-4,34],[34,-18],[6,-2],[15,-18]].map(([x,z]) => x+','+z+':'+window.__debug.reachable(x,z)))));
const clickText = async (sel, text) => E(([s, t]) => { const b = [...document.querySelectorAll(s)].find(x => x.textContent.includes(t)); if (!b) throw new Error('no btn ' + t); b.click(); }, [sel, text]);
// 6장
await goNear('kd_korah'); await act(); await stepDialog(); console.log('6-1', await st());
await goNear('kd_tents'); await act(); await stepDialog(); await w(1200); console.log('6-2', await st(), await vis(['kd_korah']));
await E(() => { const D = window.__debug; D.player.position.set(-14, 0, 22); D.setCam(-0.9, 0.35); D.setZoom(1.5); }); await w(1200); await page.screenshot({ path: dir + 'k-crack.png' });
await goNear('aaron'); await act(); await stepDialog(); await w(300); for (let i = 0; i < 17; i++){ await E(() => document.querySelector('[data-rn]').click()); await w(40); } await w(200);
await mg(); await chEnd(6);
// 7장
await goNear('moses'); await act(); await stepDialog(); console.log('7-1', await st());
await goNear('kd_door'); await act(); await w(400); for (let i = 0; i < 12; i++){ const done = await E(() => !document.getElementById('mg-act').disabled); if (done) break; await E(i => document.querySelector(`[data-sf="${i}"]`).click(), i); await w(60); }
await mg(); await finish(); console.log('7-2', await st());
await goNear('aaron'); await act(); await chEnd(7);
// 8장
console.log('미리암', await vis(['kd_miriam']));
await goNear('kd_grave'); await act(); await stepDialog(); console.log('8-1', await st());
await goNear('moses'); await act(); await stepDialog(); console.log('8-2', await st());
await goNear('kd_rock'); await act(); await stepDialog(); await w(800); console.log('8-3', await st());
await goNear('kd_rock'); await act(); await w(300); await clickText('[data-rq]', '반석에게 명령'); await w(100); await mg(); await finish(); console.log('8-4', await st());
await E(() => { const D = window.__debug; D.player.position.set(-8, 0, -24); D.setCam(-2.5, 0.35); D.setZoom(1.4); }); await w(1200); await page.screenshot({ path: dir + 'k-rock.png' });
await goNear('kd_hor'); await act(); await chEnd(8);
console.log('아론/엘르아살', await vis(['aaron', 'kd_eleazar']));
// 9장
await goNear('moses'); await act(); await stepDialog(); console.log('9-1', await st());
await goNear('kd_arad'); await act(); await chEnd(9);
// 10장
await goNear('kd_edom'); await act(); await stepDialog(); await w(800); console.log('10-1', await st());
await goNear('moses'); await act(); await stepDialog(); console.log('10-2', await st());
await goNear('kd_pole'); await act(); await stepDialog(); await w(600); console.log('10-3', await st());
await E(() => { const D = window.__debug; D.player.position.set(12, 0, 4); D.setCam(-2.2, 0.35); D.setZoom(1.3); }); await w(1200); await page.screenshot({ path: dir + 'k-serpent.png' });
await goNear('kd_pole'); await act(); await w(300); for (let i = 0; i < 6; i++){ await E(i => document.querySelector(`[data-lk3="${i}"]`).click(), i); await w(40); }
await mg(); await chEnd(10);
// 11장 — 모압 평지로
console.log('11 시작', await st(), '| 모압 출구', await vis(['to-moab']), '| 걸을 수 있음', await E(() => window.__debug.reachable(39.5, -4)));
await goNear('to-moab'); await act(); await page.waitForFunction(() => window.__debug.zone === 'moab' && !window.__debug.pendingNPC, { timeout: 150000 }); await w(3000);
console.log('모압', await st(), '| 걸을 수 있음', JSON.stringify(await E(() => [[15,-12],[30,14],[33,-26],[-20,24],[-26,-30],[-18,29],[17,-6],[-25,27],[0,4],[18,27],[18.5,-10]].map(([x,z]) => x+','+z+':'+window.__debug.reachable(x,z)))));
await E(() => { const D = window.__debug; D.player.position.set(10, 0, 10); D.setCam(0.6, 0.35); D.setZoom(2.2); }); await w(1500); await page.screenshot({ path: dir + 'm-overview.png' });
await goNear('moses'); await act(); await stepDialog(); console.log('11-2', await st());
await goNear('mb_road'); await act(); await w(300); for (let i = 0; i < 6; i++){ await clickText('[data-rd]', '왕의 큰길'); await w(50); } await mg(); await finish(); console.log('11-3', await st());
await goNear('mb_battle'); await act(); await chEnd(11);
// 12장
await goNear('mb_balak'); await act(); await stepDialog(); console.log('12-1', await st());
await goNear('mb_path'); await act(); await stepDialog(); await w(300);
for (const t of ['밭으로', '담에 대기', '엎드리기']){ await clickText('[data-dk]', t); await w(80); }
await mg(); await finish(); console.log('12-2', await st());
await goNear('mb_high'); await act(); await chEnd(12);
// 13장
await goNear('mb_daughters'); await act(); await stepDialog(); await w(300); for (const n of ['말라', '노아', '호글라', '밀가', '디르사']){ await clickText('[data-dt]', n); await w(50); }
await mg(); await finish(); console.log('13-1', await st());
await goNear('moses'); await act(); await chEnd(13);
// 14장
await goNear('moses'); await act(); await stepDialog(); console.log('14-1', await st());
await E(() => { const D = window.__debug; D.player.position.set(-20, 0, 20); D.setCam(-0.9, 0.3); D.setZoom(1.5); }); await w(1200); await page.screenshot({ path: dir + 'm-refuge.png' });
await goNear('mb_refuge'); await act(); await chEnd(14);
// 15장
await goNear('moses'); await act(); await stepDialog(); console.log('15-1', await st());
await goNear('moses'); await act(); await w(300); for (const t of ['마음에', '자녀에게', '손목과', '문설주']){ await clickText('[data-sm]', t); await w(50); }
await mg(); await finish(); console.log('15-2', await st());
await goNear('mb_camp'); await act(); await chEnd(15);
// 16장
await goNear('moses'); await act(); await stepDialog(); console.log('16-1', await st());
await goNear('mb_joshua'); await act(); await stepDialog(); console.log('16-2', await st());
await goNear('mb_nebo'); await act(); await stepDialog(); await w(1000); await page.screenshot({ path: dir + 'm-nebo.png' }); await chEnd(16);
console.log('모세 보임', await vis(['moses']), '| 족보', await E(() => window.__debug.geneal.join(',')));
console.log('배지', await E(() => window.__debug.ST.badges.filter(b => ['looked_up', 'refuge_run', 'hear_israel'].includes(b)).join(',')), '| 구절', await E(() => ['nu16-48','nu17-8','nu20-12','nu21-3','nu21-8','nu21-34','nu23-19','nu27-7','nu35-11','de6-5','de8-3','de31-8'].filter(v => window.__debug.ST.verses.includes(v)).length), '/12 | 진행', JSON.stringify(await E(() => window.__debug.ST.sp.wild3)));
await E(() => window.__debug.enterScroll('moses')); await w(500);
await E(() => window.__debug.travelTo({ id: 'test', to: 'alpha', spawn: [6, -2] })); await page.waitForFunction(() => window.__debug.zone === 'alpha', { timeout: 90000 }); await w(4000);
console.log('전시관 물체', await E(() => window.__debug.exhibit)); await E(() => window.__debug.openExhibit()); await w(300); console.log('전시관 글', await E(() => document.getElementById('exhibit-body').innerText.slice(-140)));
console.log('errors', errors.length ? errors.slice(0, 8) : 'none'); await browser.close();
