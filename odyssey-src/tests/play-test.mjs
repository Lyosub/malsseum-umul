import puppeteer from 'puppeteer-core';
const out = process.argv[2] || 'E:/temp/claude-work/exodus-game/stage1/shots';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 600 });
const errors = [];
page.on('console', m => { if (m.type()==='error' || m.type()==='warning') errors.push(m.type()+': '+m.text()); });
page.on('pageerror', e => errors.push('pageerror: '+e.message));
const t0 = Date.now();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?fps');
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
console.log('ready in', Date.now()-t0, 'ms');
const wait = ms => new Promise(r => setTimeout(r, ms));
await wait(1500);
await page.screenshot({ path: out+'/1-idle.png' });
console.log('natural speeds', await page.evaluate(()=>JSON.stringify(window.__debug.natural)));
// 옆으로 걷기(측면 보기)
await page.keyboard.down('d'); await wait(1200);
await page.screenshot({ path: out+'/2-walk-right.png' });
await page.keyboard.up('d');
// 앞(카메라 쪽)으로 걷기 → 얼굴 방향 확인
await page.keyboard.down('s'); await wait(900);
await page.screenshot({ path: out+'/3-walk-toward-cam.png' });
await page.keyboard.up('s');
// 달리기 + 스태미나 소진
await page.keyboard.down('Shift'); await page.keyboard.down('w');
await wait(1500);
await page.screenshot({ path: out+'/4-run.png' });
const st = [];
for (let i=0;i<8;i++){ await wait(700); st.push(await page.evaluate(()=>window.__debug.stamina.toFixed(2)+(document.getElementById('run-btn').classList.contains('exhausted')?'X':''))); }
await page.screenshot({ path: out+'/5-exhausted.png' });
await page.keyboard.up('w'); await page.keyboard.up('Shift');
console.log('stamina over time', st.join(' '));
await wait(3000);
console.log('stamina after rest', await page.evaluate(()=>window.__debug.stamina.toFixed(2)));
// 모세에게 가서 대화
await page.evaluate(()=>{ const p=window.__debug.player.position; p.x=4; p.z=3.5; });
await wait(600);
await page.keyboard.press('e'); await wait(500);
await page.screenshot({ path: out+'/6-moses-talk.png' });
await page.click('#info-close'); await wait(400);
// 제스처
await page.keyboard.press(' '); await wait(700);
await page.screenshot({ path: out+'/7-gesture.png' });
console.log('perf', await page.evaluate(()=>document.getElementById('perf').textContent));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
