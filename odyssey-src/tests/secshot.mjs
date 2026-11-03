import puppeteer from 'puppeteer-core';
const [, , html, outdir] = process.argv;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 1080, height: 1920 });
await p.goto('file:///' + html, { waitUntil: 'networkidle0' });
const ids = await p.evaluate(() => [...document.querySelectorAll('section.pg')].map(s => s.id));
const broken = await p.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src));
console.log(ids, 'broken', broken);
for (const [i, id] of ids.entries()) { const el = await p.$('#' + id); await el.screenshot({ path: `${outdir}/0${i + 1}.jpg`, type: 'jpeg', quality: 92 }); }
await b.close();
