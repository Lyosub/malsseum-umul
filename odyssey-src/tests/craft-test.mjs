import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy&shopmock&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const E = (f, ...a) => page.evaluate(f, ...a);
console.log('zone', await E(() => window.__debug.zone), 'chaptersDone', await E(() => window.__debug.ST.ch + (window.__debug.ST.cleared ? 1 : 0)));
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.2, p.y, p.z + 1.2); }, id); await w(700); }
// 1. 브살렐
await goNear('a_bezalel');
console.log('버튼:', await page.$eval('#interact-btn', e => e.textContent), '| 걸어서 닿음:', await E(() => { const m = window.__debug.markers.find(x => x.data.id === 'a_bezalel'); return window.__debug.reachable(m.mesh.position.x, m.mesh.position.z + 1.2); }));
await E(() => document.getElementById('interact-btn').click()); await w(900);
console.log('공방 창:', await E(() => !document.getElementById('craft-modal').classList.contains('hidden')), '| 재료:', JSON.stringify(await E(() => window.__debug.mat)));
await page.screenshot({ path: dir + 'craft-modal.png' });
await E(() => window.__debug.addMat({ wood: 12, bronze: 4, flax: 8, papyrus: 5, wool: 8, goat: 6, blue: 2, purple: 2, scarlet: 2, silver: 2, gold: 3 }, null, true));
const make = async (cat, key) => { await E(c => document.querySelector(`#craft-tabs [data-c="${c}"]`).click(), cat); await w(200);
  await E(k => document.querySelector(`[data-make="${k}"]`).click(), key); await w(700); console.log(key, '→', await page.$eval('#craft-msg', e => e.textContent)); };
await make('staff', 'craft-staff-silver'); await make('robe', 'craft-cloak-purple'); await make('shoes', 'craft-shoes-travel'); await make('head', 'craft-head-gold');
await E(() => document.querySelector('#craft-tabs [data-c="staff"]').click()); await w(200);
console.log('호마노 버튼:', await E(() => document.querySelector('[data-make="craft-staff-onyx"]').textContent));
await page.screenshot({ path: dir + 'craft-made.png' });
await E(() => document.querySelector('#craft-tabs [data-c="where"]').click()); await w(200); await page.screenshot({ path: dir + 'craft-where.png' });
await E(() => document.querySelector('#craft-modal .close').click()); await w(1500);
console.log('장착:', await E(() => window.__debug.gear), '| 지팡이:', await E(() => window.__debug.staffOn), '| equip', await E(() => window.__debug.equip));
// 캐릭터 가까이 앞·뒤
const look = async (name, yaw) => { await E(y => { const D = window.__debug; D.player.position.set(0, 0, 12); D.setHeading(0); D.setCam(y, 0.15); D.setZoom(0.55); }, yaw); await w(1500); await page.screenshot({ path: dir + name }); };
await look('gear-front.png', Math.PI); await look('gear-back.png', 0); await look('gear-side.png', Math.PI / 2);
// 걷는 중에도 따라오는지
await page.keyboard.down('w'); await w(1200); await page.screenshot({ path: dir + 'gear-walk.png' }); await page.keyboard.up('w');
// 상점에는 공방 지팡이가 없음
await E(() => document.getElementById('btn-shop').click()); await w(900);
console.log('상점 지팡이 카드:', await E(() => document.querySelectorAll('#shop-grid .shop-card').length));
await E(() => document.querySelector('#shop-tabs [data-c="outfit"]').click()); await w(200);
console.log('상점 옷 탭:', (await page.$eval('#shop-grid', e => e.textContent)).slice(0, 60));
await E(() => document.querySelector('#shop-modal .close').click()); await w(300);
// 2. 마을마다 모으는 곳
const spots = { midian: [0, 15], egypt: [0, 16], wild: [0, 16], rephidim: [0, 16], sinai: [0, 16] };
for (const [z, sp] of Object.entries(spots)){
  await E(([z, sp]) => window.__debug.travelTo({ to: z, spawn: sp }), [z, sp]);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 90000 }, z); await w(2500);
  const r = await E(() => window.__debug.markers.filter(m => m.data.gather || /^act_/.test(m.data.id)).map(m => { const D = window.__debug, p = m.mesh.position; let best = 99; for (let a = 0; a < 8; a++){ const x = m.data.x + Math.cos(a) * 1.2, zz = m.data.z + Math.sin(a) * 1.2; if (D.reachable(x, zz)) best = 1; } return `${m.data.id}:${m.hidden ? '숨김' : '보임'}:${best === 1 ? '닿음' : '❌못닿음'}`; }).join(' '));
  console.log(z.padEnd(9), r, z === 'egypt' ? '| 우상 ' + await E(() => window.__debug.idols) : '');
  if (z === 'egypt'){
    // 삼 거두기(연타)
    await goNear('g_eg_flax'); await E(() => document.getElementById('interact-btn').click()); await w(400);
    await E(() => document.getElementById('mg-act').click()); for (let i = 0; i < 20; i++){ await E(() => document.getElementById('mg-act').click()); await w(60); }
    await w(300); console.log('삼 거두기:', await page.$eval('#mg-stat', e => e.textContent), JSON.stringify(await E(() => window.__debug.mat.flax)));
    await E(() => document.getElementById('mg-close').click()); await w(300);
    // 우상 부수기
    await goNear('act_idol'); await E(() => document.getElementById('interact-btn').click()); await w(400);
    await E(() => document.getElementById('mg-act').click()); for (let i = 0; i < 20; i++){ await E(() => document.getElementById('mg-act').click()); await w(60); }
    await w(500); console.log('우상:', (await page.$eval('#mg-info', e => e.textContent)).slice(0, 40));
    await E(() => document.getElementById('mg-close').click()); await w(900);
    await E(() => { const D = window.__debug; D.player.position.set(15, 0, 3); D.setCam(Math.PI, 0.3); D.setZoom(1.2); }); await w(1200); await page.screenshot({ path: dir + 'idols-broken.png' });
    // 흠 없는 어린 양 고르기
    await goNear('act_pick'); await E(() => document.getElementById('interact-btn').click()); await w(400);
    await E(() => document.getElementById('mg-act').click()); await w(300); await page.screenshot({ path: dir + 'pick.png' });
    for (let r = 0; r < 5; r++){
      await E(() => { const bs = [...document.querySelectorAll('[data-lamb]')]; const good = bs.find(b => { const h = b.innerHTML; return h.includes('rotate(-25') && !h.includes('r="7"') && !h.includes('M30 34') && !h.includes('l5 5') && (h.match(/height="16"/g) || []).length === 4; }); (good || bs[0]).click(); });
      await w(700); }
    console.log('양 고르기:', (await page.$eval('#mg-info', e => e.textContent)).slice(0, 30), '| 재료', JSON.stringify(await E(() => window.__debug.mat)));
    await E(() => document.getElementById('mg-close').click()); await w(300);
    // 양 몰기(양을 우리 안으로 옮겨 판정만 확인)
    await goNear('act_herd'); await E(() => document.getElementById('interact-btn').click()); await w(400); await E(() => document.getElementById('mg-act').click()); await w(800);
    console.log('양 몰기 시작 — 양', await E(() => window.__debug.live.objs.length), '마리');
    await E(() => { window.__debug.player.position.set(-12, 0, 8); }); await w(1800); await page.screenshot({ path: dir + 'herd.png' });
    await E(() => window.__debug.live.objs.forEach(o => o.position.set(-12, 0, 19))); await w(1200);
    console.log('양 몰기 끝:', await page.$eval('#quest-toast', e => e.textContent));
    // 양 지키기
    await goNear('act_guard'); await E(() => document.getElementById('interact-btn').click()); await w(400); await E(() => document.getElementById('mg-act').click()); await w(5000);
    console.log('들짐승:', await E(() => window.__debug.live.objs.length), await page.$eval('#hud-challenge', e => e.textContent));
    await E(() => { const D = window.__debug; D.player.position.set(-12, 0, 8); D.setCam(0, 0.5); D.setZoom(2); }); await w(600); await page.screenshot({ path: dir + 'guard.png' });
    await E(() => { window.__debug.live.t = 0.05; window.__debug.live.hearts = 3; }); await w(600);
    console.log('양 지키기 끝:', await page.$eval('#quest-toast', e => e.textContent));
  }
  if (z === 'wild'){
    await goNear('act_quail'); await E(() => document.getElementById('interact-btn').click()); await w(400); await E(() => document.getElementById('mg-act').click()); await w(800);
    const n = await E(() => window.__debug.live.objs.length); console.log('메추라기', n, '마리');
    await page.screenshot({ path: dir + 'quail.png' });
    for (let i = 0; i < 12; i++){ await E(() => { const o = window.__debug.live.objs[0]; if (o) window.__debug.player.position.set(o.position.x, 0, o.position.z); }); await w(250); }
    await E(() => { window.__debug.live.t = 0.05; }); await w(500);
    console.log('메추라기 끝:', await page.$eval('#quest-toast', e => e.textContent));
  }
  if (z === 'midian'){
    await goNear('g_md_wood'); await E(() => { const m = window.__debug.markers.find(x => x.data.id === 'g_md_wood'); const p = m.mesh.position; const D = window.__debug; D.player.position.set(p.x + 3, 0, p.z + 3); D.setCam(0.8, 0.3); D.setZoom(1.2); }); await w(1200);
    await page.screenshot({ path: dir + 'gather-wood.png' });
  }
}
console.log('오늘의 퀘스트 후보에 gather/act:', await E(() => JSON.stringify(window.__debug.daily)));
console.log('배지:', await E(() => window.__debug.ST.badges.filter(b => ['idol_breaker', 'craftsman'].includes(b)).join(',')));
console.log('errors', errors.length ? errors.slice(0, 8) : 'none');
await browser.close();
