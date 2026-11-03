import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('dialog', d => d.accept());
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => document.getElementById('tut-skip') && document.getElementById('tut-skip').click());
await page.evaluate(() => {
  const S = { people: [{ user_id: 'u1', nickname: '빛나는별', title: '재앙 속에서 믿은 사람', rel: 'friend', likes: 2 }, { user_id: 'u2', nickname: '우진이', title: null, rel: 'none', likes: 0 }, { user_id: 'u3', nickname: '새친구', title: null, rel: 'received', likes: 0 }], likes: 2, liked: false };
  window.__calls = [];
  window.__debug.mockMsu(async (n, a) => { window.__calls.push(n);
    if (n === 'get_odyssey_people') return { data: S.people };
    if (n === 'request_odyssey_friend'){ S.people.find(p => p.user_id === a.p_to).rel = 'sent'; return { data: 'sent' }; }
    if (n === 'respond_odyssey_friend'){ const p = S.people.find(p => p.user_id === a.p_other); p.rel = a.p_accept ? 'friend' : 'none'; return { data: 'friend' }; }
    if (n === 'get_odyssey_home_info') return { data: { layout: [{ k: 'camel', x: -44, z: 43, r: 0 }, { k: 'jars', x: -46, z: 45, r: 0 }], likes: S.likes, liked: S.liked, nickname: '빛나는별' } };
    if (n === 'like_odyssey_home'){ S.liked = !S.liked; S.likes += S.liked ? 1 : -1; return { data: S.likes }; }
    if (n === 'get_odyssey_home') return { data: [{ k: 'lamb', x: -44, z: 46, r: 0 }] };
    return { data: null };
  });
});
await page.evaluate(() => document.getElementById('btn-friends').click()); await w(600);
console.log('내 친구:', await page.$eval('#people-list', e => e.innerText.replace(/\s+/g, ' ')));
await page.evaluate(() => document.querySelector('[data-pt="find"]').click()); await w(200);
await page.evaluate(() => document.querySelector('[data-req="u2"]').click()); await w(400);
console.log('요청 뒤:', await page.$eval('#people-list', e => e.innerText.replace(/\s+/g, ' ')));
await page.evaluate(() => document.querySelector('[data-pt="received"]').click()); await w(200);
await page.evaluate(() => document.querySelector('[data-acc="u3"]').click()); await w(400);
console.log('수락 뒤:', await page.$eval('#people-list', e => e.innerText.replace(/\s+/g, ' ').slice(0, 60)));
await page.screenshot({ path: dir + 'friends.png' });
// 놀러 가기
await page.evaluate(() => document.querySelector('[data-pt="friend"]').click()); await w(200);
await page.evaluate(() => document.querySelector('[data-visit="u1"]').click()); await w(3500);
console.log('놀러 감:', await page.evaluate(() => JSON.stringify(window.__debug.VISIT)), '| 물건', await page.evaluate(() => window.__debug.homeObjs.map(o => o.e.k).join(',')), '| 위치', await page.evaluate(() => { const p = window.__debug.player.position; return p.x.toFixed(0) + ',' + p.z.toFixed(0); }), '| 꾸미기 버튼 숨김', await page.$eval('#home-btns', e => e.classList.contains('hidden')));
await page.evaluate(() => document.getElementById('visit-like').click()); await w(300);
console.log('좋아요:', await page.$eval('#visit-bar', e => e.innerText.replace(/\s+/g, ' ')));
await page.evaluate(() => { const D = window.__debug; D.setCam(0, 0.45); D.setZoom(1.5); }); await w(900);
await page.screenshot({ path: dir + 'visit.png' });
await page.evaluate(() => document.getElementById('visit-back').click()); await w(2500);
console.log('돌아온 뒤:', await page.evaluate(() => String(window.__debug.VISIT)), '| 내 물건', await page.evaluate(() => window.__debug.homeObjs.map(o => o.e.k).join(',')), '| 위치', await page.evaluate(() => { const p = window.__debug.player.position; return p.x.toFixed(0) + ',' + p.z.toFixed(0); }));
// 초대 받기
await page.evaluate(() => { window.__debug.FR.me = { id: 'me', nick: '나' }; window.__debug.onInvite({ to: 'me', from: 'u1', nick: '빛나는별' }); }); await w(300);
console.log('초대 창:', await page.$eval('#invite-pop', e => !e.classList.contains('hidden') && e.innerText.replace(/\s+/g, ' ')));
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
