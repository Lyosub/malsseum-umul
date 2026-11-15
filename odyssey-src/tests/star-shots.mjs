// 별 밝히기 한 장 기획안 2쪽용 화면 찍기 — 하늘 화면은 서버 응답을 가짜 자료로 바꿔서 찍는다(실제 방에 아무것도 보내지 않음)
import puppeteer from 'puppeteer-core';
const OUT = 'E:/temp/claude-work/xmas1p/';
const BASE = 'http://localhost:8768/';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const wait = ms => new Promise(r => setTimeout(r, ms));

// 1) 보내기 화면(휴대폰)
if (!process.argv.includes('--sky')) {
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto(BASE + 'star.html', { waitUntil: 'networkidle2' });
  await p.select('#dept', '중등부');
  await p.type('#name', '김OO 집사');
  await p.type('#body', '너희가 세상의 빛이야');
  await p.evaluate(() => document.getElementById('body').dispatchEvent(new Event('input')));
  await wait(500);
  await p.screenshot({ path: OUT + 'shot-send.png', fullPage: true });
  await p.close();
}

const msgs = [
  ['예수님, 우리에게 오셔서 감사합니다', '이OO 권사'], ['올 한 해도 함께해 주셔서 감사해요', '한 성도'],
  ['나를 구원하신 예수님, 사랑합니다', '박OO 집사'], ['우리 아이들을 지켜 주셔서 감사합니다', '김OO 집사'],
  ['예수님, 생일 축하드려요!', '최OO 장로'], ['구주로 오신 예수님을 찬양합니다', '정OO 선생님'],
  ['힘든 날에도 곁에 계셔 주셔서 감사해요', '한 성도'], ['말구유에 오신 사랑, 감사합니다', '윤OO 집사'],
  ['우리 가정을 붙들어 주셔서 감사합니다', '강OO 권사'], ['예수님 때문에 기쁜 성탄이에요', '조OO 선생님'],
  ['날마다 새 힘 주셔서 감사합니다', '한 성도'], ['임마누엘 예수님, 사랑해요', '신OO 집사'],
].map((m, i) => ({ id: 'm' + i, seq: i + 1, body: m[0], who: m[1] }));

async function sky(state, extra, ms, file) {
  const p = await b.newPage();
  await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  await p.setRequestInterception(true);
  let sent = false;
  p.on('request', r => {
    if (r.url().includes('/rpc/star_sky') && r.method() === 'OPTIONS')
      return r.respond({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
    if (r.url().includes('/rpc/star_sky')) {
      const body = sent ? { total: msgs.length, messages: [], hidden: [], state, stage_label: '', state_seq: 1, draw_seq: 1, ...extra }
                        : { total: msgs.length, messages: msgs, hidden: [], state, stage_label: '', state_seq: 1, draw_seq: 1, ...extra };
      sent = true;
      return r.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
    }
    r.continue();
  });
  await p.goto(BASE + 'star-sky.html#shot', { waitUntil: 'networkidle2' });
  await wait(ms);
  await p.screenshot({ path: OUT + file });
  await p.close();
}
await sky('cheer', {}, 3500, 'shot-cheer.png');
await sky('gather', {}, 9000, 'shot-gather.png');
await sky('draw', { draw: { id: 'm3', body: '너희가 세상의 빛이야', name: '김OO 집사', dept: '중등부' } }, 8000, 'shot-draw.png');
await b.close();
console.log('ok');
