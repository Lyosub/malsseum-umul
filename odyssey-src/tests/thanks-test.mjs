import puppeteer from 'puppeteer-core';
import fs from 'fs';
const out = 'E:/temp/claude-work/thanks';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const wait = ms => new Promise(r => setTimeout(r, ms));
await page.goto('http://localhost:8768/verses.html', { waitUntil: 'networkidle2' });
await page.evaluate(() => localStorage.removeItem('msu_thanks_2026'));
await page.reload({ waitUntil: 'networkidle2' }); await wait(800);
console.log('box hidden?', await page.evaluate(() => document.getElementById('thanksBox').hidden));
await page.evaluate(() => document.getElementById('thanksBox').scrollIntoView());
await page.screenshot({ path: out + '/1-box.png' });
await page.click('#thanksDrawBtn'); await wait(400);
await page.type('#thanksLine', '매일 아침 깨워 주는 엄마가 있어서 감사해요');
await page.evaluate(() => document.getElementById('thanksBox').scrollIntoView());
await page.screenshot({ path: out + '/2-drawn.png', fullPage: false });
// 저장 이미지: 세 사이즈 모두, 가장 긴 구절(하박국)로도
for (const [key, idx] of [['post', null], ['story', null], ['wallpaper', 5], ['post', 5]]) {
  const data = await page.evaluate(async (key, idx) => {
    const s = thanksLoad(); const v = THANKS_POOL[idx === null ? s.index : idx];
    await loadVerseCardFonts();
    const c = document.createElement('canvas'); const z = CARD_SIZES[key];
    drawThanksCard(c, v, s.line, z.w, z.h); return c.toDataURL('image/jpeg', 0.85);
  }, key, idx);
  fs.writeFileSync(`${out}/card-${key}-${idx ?? 'drawn'}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
}
// 다시 열면 그대로
await page.reload({ waitUntil: 'networkidle2' }); await wait(500);
console.log('persist', await page.evaluate(() => [document.getElementById('thanksCard').style.display, document.getElementById('thanksLine').value]));
console.log('regular draw btn', await page.evaluate(() => document.getElementById('drawBtn').textContent));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
