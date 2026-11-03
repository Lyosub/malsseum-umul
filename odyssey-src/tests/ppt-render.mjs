import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage(); await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
for (const [file, n, out] of [['deck_mg.html', 3, 'chk003.png'], ['deck_mg.html', 14, 'chk014.png'], ['deck_fix_mg.html', 3, 'new003.png'], ['deck_fix_mg.html', 14, 'new014.png']]){
  await page.goto('file:///E:/temp/claude-work/ppt_gpt_test/' + file + '#s' + n, { waitUntil: 'networkidle0' }); await page.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'E:/temp/claude-work/ppt_gpt_test/' + out });
}
await browser.close();
