import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const errors = [];
const w = ms => new Promise(r => setTimeout(r, ms));
const URL0 = 'file:///E:/temp/claude-work/exodus-game/prototype-standalone.html';
let store = null;
async function open(page, qs){ await page.goto(URL0 + qs); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500); }
const mock = page => page.evaluate(s => { window.__store = s; window.__debug.mockMsu(async (n, a) => {
  if (n === 'get_odyssey_state') return { data: window.__store ? [window.__store] : [], error: null };
  if (n === 'save_odyssey_state'){ if (window.__store && a.p_score < window.__store.score && !a.p_force) return { data: 0, error: null }; window.__store = { data: a.p_data, score: a.p_score, updated_at: new Date().toISOString() }; return { data: 1, error: null }; }
  return { data: null, error: null }; }); }, store);
// 기기 A: 5장 진행 기록을 계정에 저장
const A = await browser.newPage(); A.on('pageerror', e => errors.push('A ' + e.message));
await open(A, '?reset&notype&ch=5&body=boy&zone=wild');
await A.evaluate(() => { const D = window.__debug; D.ST.verses.push('ex16-4'); D.addMat({ gold: 3 }, null, true); });
await mock(A); await A.evaluate(() => window.__debug.cloudInit()); await w(800);
store = await A.evaluate(() => window.__store);
console.log('A 저장:', store && store.score, '| 키', store && Object.keys(store.data.keys).length, '| ST 크기', store && (store.data.keys['inodyssey.proto.story'] || '').length);
// 기기 B: 빈 기기 → 로그인하면 자동으로 불러옴
const ctx = await browser.createBrowserContext(); const B = await ctx.newPage(); B.on('pageerror', e => errors.push('B ' + e.message));
await open(B, '?reset&notype&body=boy&zone=alpha');
console.log('B 처음:', await B.evaluate(() => window.__debug.cloudScore()));
await mock(B); await B.evaluate(() => window.__debug.cloudInit());
await B.waitForNavigation({ timeout: 60000 }).catch(() => {}); await B.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
console.log('B 복구 뒤:', await B.evaluate(() => { const D = window.__debug; return `장 ${D.ST.ch + 1} · 구절 ${D.ST.verses.length} · 금 ${(D.ST.mat || {}).gold} · 마을 ${D.zone}`; }));
// 기기 B에서 계정보다 덜 진행한 상태로 저장하면 거부
await mock(B); await B.evaluate(() => { window.__debug.ST.ch = 1; window.__debug.ST.step = 0; }); 
const r = await B.evaluate(async () => { window.__debug.CLOUD.ready = true; const { data } = await window.__debug.mockMsu ? { data: null } : {}; return null; });
console.log('errors', errors.length ? errors.slice(0, 6) : 'none');
await browser.close();
