import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1000);
await page.evaluate(() => { window.__debug.mockMsu(async (n, a) => {
  if (n === 'get_odyssey_worship') return { data: { service_date: '2026-09-27', len: 6, claimed: false } };
  if (n === 'submit_odyssey_worship') return { data: a.p_answer.replace(/\s/g, '') === '당연한건없다' ? { ok: true, new: true, talents: 10, service_date: '2026-09-27', title: '당연한 건 없다', verse_ref: '누가복음 17:15-16', verse_text: '그 중의 한 사람이 자기가 나은 것을 보고 …' } : { ok: false, msg: '아쉬워요, 설교 제목이 아니에요.' } };
  return { data: null }; }); });
await page.evaluate(() => document.getElementById('btn-worship').click()); await w(600);
console.log('창:', await page.$eval('#worship-body', e => e.innerText.replace(/\s+/g, ' ')));
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/worship.png' });
await page.evaluate(() => { document.getElementById('worship-in').value = '감사'; document.getElementById('worship-go').click(); }); await w(400);
console.log('오답:', await page.$eval('#worship-msg', e => e.textContent));
await page.evaluate(() => { document.getElementById('worship-in').value = '당연한 건 없다'; document.getElementById('worship-go').click(); }); await w(1500);
console.log('정답:', await page.$eval('#worship-body', e => e.innerText.replace(/\s+/g, ' ').slice(0, 90)), '| 카드', await page.evaluate(() => window.__debug.ST.verses.includes('wv-2026-09-27')));
console.log('errors', errors.length ? errors.join(' / ') : 'none'); await browser.close();
