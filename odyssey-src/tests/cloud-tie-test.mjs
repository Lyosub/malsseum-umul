// 2026-09-29: 코드 리뷰(GPT) 지적 확인·수정 검증
//  1) 모세 편을 다 마쳐 점수가 같은 두 기기에서, 다른 두루마리를 덜 진행한 기기가 계정 기록을 덮어쓰지 않는가
//  2) 서버에 예전 방식(모세 편만 센) 점수가 있어도 복구 안내가 뜨는가
//  3) 다른 두루마리 배지가 있어도 장 완료 화면이 멈추지 않는가
//  4) 로그인 때 2·3편의 놓친 장 보상을 다시 청구하는가
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const errors = [], out = [];
const w = ms => new Promise(r => setTimeout(r, ms));
const URL0 = 'file:///E:/temp/claude-work/exodus-game/prototype-standalone.html';
async function open(page, qs){ await page.goto(URL0 + qs); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1200); }
// 서버 흉내: 실제 save_odyssey_state 와 같은 규칙(덜 진행한 점수는 거부, 같거나 크면 덮어씀)
const mock = (page, seed, claims) => page.evaluate((s, claimsOn) => { window.__store = s; window.__claims = [];
  window.__debug.mockMsu(async (n, a) => {
    if (n === 'get_odyssey_state') return { data: window.__store ? [window.__store] : [], error: null };
    if (n === 'save_odyssey_state'){ if (window.__store && a.p_score < window.__store.score && !a.p_force) return { data: 0, error: null };
      window.__store = { data: a.p_data, score: a.p_score, updated_at: new Date().toISOString() }; return { data: 1, error: null }; }
    if (n === 'claim_odyssey_scroll_chapter'){ window.__claims.push([a.p_scroll, a.p_ch]); return { data: 0, error: null }; }
    if (n === 'claim_odyssey_chapter'){ return { data: 0, error: null }; }
    return { data: null, error: null }; }); }, seed, claims);
const setState = (page, fn) => page.evaluate(fn);

// ── 기기 A: 모세 편 10장 완료 + 3편 5장 진행 → 계정에 저장
const A = await browser.newPage(); A.on('pageerror', e => errors.push('A ' + e.message));
await open(A, '?reset&notype&body=boy&zone=alpha');
await setState(A, () => { const S = window.__debug.ST; S.ch = 9; S.cleared = true; S.step = 0; S.verses = ['v1', 'v2']; S.badges = ['b1']; S.sp = { wild3: { ch: 5, step: 0, cleared: false, rumor: [] } }; });
await mock(A, null); await A.evaluate(() => { window.__debug.CLOUD.ready = false; return window.__debug.cloudInit(); }); await w(1500);
let store = await A.evaluate(() => window.__store);
out.push(`1) A 저장: score=${store && store.score} wild3.ch=${store && JSON.parse(store.data.keys['inodyssey.proto.story'] || '{}').sp.wild3.ch}`);

// ── 기기 B: 같은 모세 편 점수, 3편은 시작도 안 함 → 안내창(취소) 뒤 저장해도 계정 기록이 그대로여야 함
const ctx = await browser.createBrowserContext(); const B = await ctx.newPage(); B.on('pageerror', e => errors.push('B ' + e.message));
const dialogs = []; B.on('dialog', d => { dialogs.push(d.message().replace(/\n/g, ' / ')); d.dismiss(); });
await open(B, '?reset&notype&body=boy&zone=alpha');
await setState(B, () => { const S = window.__debug.ST; S.ch = 9; S.cleared = true; S.step = 0; S.verses = ['v1', 'v2', 'v3']; S.badges = ['b1']; });
await mock(B, store);
await B.evaluate(() => window.__debug.cloudInit()); await w(800);
out.push(`2) B 안내창: ${dialogs.length}개 — ${dialogs[0] ? dialogs[0].slice(0, 90) : '없음(문제)'}`);
await B.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await w(800);
const after = await B.evaluate(() => window.__store);
const wild = JSON.parse(after.data.keys['inodyssey.proto.story']).sp.wild3;
out.push(`3) B 저장 시도 뒤 계정의 3편 진행: ch=${wild && wild.ch} (5여야 통과) | score=${after.score}`);

// ── 예전 방식 점수가 저장된 서버 행(모세 편만 센 점수)
const ctx2 = await browser.createBrowserContext(); const B2 = await ctx2.newPage(); B2.on('pageerror', e => errors.push('B2 ' + e.message));
const d2 = []; B2.on('dialog', d => { d2.push(d.message().slice(0, 60)); d.dismiss(); });
await open(B2, '?reset&notype&body=boy&zone=alpha');
await setState(B2, () => { const S = window.__debug.ST; S.ch = 9; S.cleared = true; S.step = 0; });
await mock(B2, { data: store.data, score: 10000, updated_at: new Date().toISOString() });
await B2.evaluate(() => window.__debug.cloudInit()); await w(800);
out.push(`4) 예전 점수(10000)의 서버 행: 안내창 ${d2.length}개 (1이어야 통과)`);

// ── 배지: 다른 두루마리 배지가 있는데 그 파일이 안 열린 상태로 장 완료 화면
const C = await browser.newPage(); C.on('pageerror', e => errors.push('C ' + e.message));
await open(C, '?reset&notype&body=boy&zone=alpha');
const clear = await C.evaluate(() => { const D = window.__debug; D.ST.badges = ['holy_people', 'trumpet_follow']; try { D.showClear(); return document.getElementById('clear-body').textContent.slice(-40); } catch (e){ return 'ERROR ' + e.message; } });
out.push(`5) 장 완료 화면(모르는 배지 2개): ${clear}`);

// ── 놓친 장 보상 다시 청구
const E = await browser.newPage(); E.on('pageerror', e => errors.push('E ' + e.message));
await open(E, '?reset&notype&body=boy&zone=alpha');
await setState(E, () => { const S = window.__debug.ST; S.sp = { sinai2: { ch: 3, step: 2, cleared: false, rumor: [] }, wild3: { ch: 15, step: 0, cleared: true, rumor: [] } }; });
await mock(E, null);
await E.evaluate(() => window.__debug.claimClearedChapters()); await w(500);
const claims = await E.evaluate(() => window.__claims);
out.push(`6) 재청구 호출: 2편 ${claims.filter(c => c[0] === 2).map(c => c[1]).join(',')} | 3편 ${claims.filter(c => c[0] === 3).length}개(16이어야 통과) | 모세(1) ${claims.filter(c => c[0] === 1).length}개(0이어야 통과)`);

console.log(out.join('\n'));
console.log('errors', errors.length ? errors.slice(0, 6) : 'none');
await browser.close();
