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
  ['너희의 찬양이 오늘 밤 가장 큰 선물이었어', '이OO 권사'], ['하나님이 너희를 정말 기뻐하셔', '한 성도'],
  ['무대에 선 용기, 멋있었어!', '박OO 집사'], ['너희가 세상의 빛이야', '김OO 집사'],
  ['내년 성탄에도 이 자리에서 만나자', '최OO 장로'], ['예수님이 너희와 함께하셔', '정OO 선생님'],
  ['기도로 늘 응원할게', '한 성도'], ['오늘 정말 자랑스러웠어', '윤OO 집사'],
  ['너희 덕분에 성탄이 더 기뻐', '강OO 권사'], ['끝까지 해낸 모습 최고!', '조OO 선생님'],
  ['사랑한다 우리 아이들', '한 성도'], ['빛으로 자라 가렴', '신OO 집사'],
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
