import puppeteer from 'puppeteer-core';
const D = 'E:/temp/claude-work/insta-lands/';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1350 });
for (const n of ['1', '2']){
  await p.goto(`file:///${D}p${n}.html`, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready);
  const o = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, font: document.fonts.check('900 40px Pretendard'), wrap3: [...document.querySelectorAll('.v')].filter(v => v.offsetHeight > 60).length, xh: Math.max(...[...document.querySelectorAll('.x')].map(v => v.offsetHeight)), noimg: [...document.images].filter(i => !i.naturalWidth).length }));
  console.log(n, JSON.stringify(o));
  await p.screenshot({ path: `${D}page${n}.png` });
}
await b.close();
