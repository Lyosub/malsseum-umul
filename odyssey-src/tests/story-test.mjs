// 모세 편 1장 13단계를 실제 조작(다가가기 → 버튼 → 대화 넘기기 → 선택지)으로 끝까지 진행
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 420, height: 800, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms));
const shotDir = 'E:/temp/claude-work/exodus-game/stage1/story/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
const step = () => page.evaluate(() => { const q = window.__debug.curStep(); return q ? q.id + ' ' + q.obj : 'CLEARED'; });
const obj = () => page.$eval('#quest-list', e => e.textContent.replace(/\s+/g, ' ').trim());
async function goNear(id){
  await page.waitForFunction(id => window.__debug.markers.some(x => x.data.id === id && !x.hidden), { timeout: 8000 }, id).catch(() => {});
  await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.6, 0, p.z + 1.2); }, id);
  await w(700);
}
async function closeModals(){ for (let k = 0; k < 6; k++){ const open = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!open) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(500); } }
async function talkThrough(choiceOrder = []){
  await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300);
  for (let k = 0; k < 40; k++){
    const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, choices: [...document.querySelectorAll('#dlg-choices button')].map(b => b.textContent) }));
    if (!st.open) break;
    if (st.choices.length){ const c = choiceOrder.length ? choiceOrder.shift() : 0; await page.evaluate(i => document.querySelectorAll('#dlg-choices button')[i].click(), c); }
    else await page.evaluate(() => document.getElementById('dlg-next').click());
    await w(120);
  }
  await w(1300); await closeModals(); await w(300); await closeModals();
}
const log = async label => console.log(label.padEnd(26), '→', await step(), '|', await obj());

console.log('시작 마을', await page.evaluate(() => window.__debug.zone), '|', await obj());
// 안내자와 이야기 전에 포털 → 잠겨 있어야
await goNear('to-midian'); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(400);
console.log('포털(안내자 전) 잠김 토스트:', await page.$eval('#quest-toast', e => e.textContent));
await goNear('guide'); await talkThrough(); await log('s1 안내자');
await goNear('board'); await talkThrough(); await log('a1 게시판');
await goNear('map'); await talkThrough(); await log('a2 성경 지도');
await goNear('memorial'); await talkThrough(); await log('a3 기념 전시관');
await goNear('guide'); await talkThrough(); await log('a4 안내자 다시');
await goNear('to-midian'); await page.evaluate(() => document.getElementById('interact-btn').click());
await page.waitForFunction('window.__debug.zone==="midian"', { timeout: 60000 }); await w(1500); await log('s2 포털 → 미디안');
console.log('아론 숨김(부르심 전):', await page.evaluate(() => window.__debug.markers.find(m => m.data.id === 'aaron').hidden));
await goNear('to-egypt'); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(400);
console.log('애굽 길(이른 시점) 잠김:', await page.$eval('#quest-toast', e => e.textContent));
await goNear('blacksmith'); await talkThrough(); await log('s3 소문 1');
await goNear('merchant'); await talkThrough(); await log('s3 소문 2');
await goNear('jethro'); await talkThrough(); await log('s4 이드로');
await goNear('bush'); await page.screenshot({ path: shotDir + '1-bush.png' });
await talkThrough([1, 0]); await log('s5 떨기나무(틀린 선택→바른 선택)');
await goNear('moses'); await talkThrough(); await log('s6 모세');
console.log('스킬:', await page.$$eval('.skill-btn', b => b.map(x => x.textContent)), '구절:', await page.evaluate(() => window.__debug.ST.verses.join(',')));
await goNear('aaron'); await talkThrough(); await log('s7 아론');
await goNear('to-egypt'); await page.evaluate(() => document.getElementById('interact-btn').click());
await page.waitForFunction('window.__debug.zone==="egypt"', { timeout: 60000 }); await w(1500); await log('s8 → 애굽');
await goNear('miriam'); await talkThrough(); await log('s9 미리암');
await goNear('moses'); await talkThrough(); await log('s10 궁전 앞 모세');
await goNear('pharaoh'); await talkThrough(); await log('s11 바로');
const straws = await page.evaluate(() => window.__debug.straws.map(o => [o.x, o.z]));
console.log('짚단', straws.length, '개 생성');
for (const [x, z] of straws){ await page.evaluate((x, z) => window.__debug.player.position.set(x, 0, z), x, z); await w(350); }
await w(500); await log('s12 짚단 모으기');
await goNear('worker1'); await talkThrough(); await w(600);
console.log('완료 화면:', await page.$eval('#clear-title', e => e.textContent));
await log('s13 일꾼에게 전달');
await page.evaluate(() => document.getElementById('btn-book').click()); await w(400);
await page.screenshot({ path: shotDir + '2-book.png' });
console.log('수집첩 카드:', await page.$$eval('#book-cards .vcard', c => c.map(x => (x.classList.contains('locked') ? '🔒' : '✓') + x.querySelector('.ref').textContent).join(' ')));
await closeModals();
await page.evaluate(() => document.getElementById('btn-log').click()); await w(300);
console.log('퀴즈:', await page.evaluate(() => JSON.stringify(window.__debug.ST.quiz)), '별', await page.evaluate(() => window.__debug.ST.stars), '기억할 말', await page.evaluate(() => window.__debug.ST.keys.length)); console.log('대화 기록 줄 수:', await page.$$eval('#log-list .logline', l => l.length)); await closeModals();
// 새로고침해도 진행 유지
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html'); await page.waitForFunction('window.__ready === true', { timeout: 90000 });
console.log('새로고침 후:', await step(), '| 마을', await page.evaluate(() => window.__debug.zone));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
