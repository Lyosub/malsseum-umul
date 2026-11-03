import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage(); await page.setViewport({ width: 420, height: 900 });
await page.goto('https://logoswell.kr/play.html', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2500));
console.log('카드 표시(비로그인):', await page.evaluate(() => getComputedStyle(document.getElementById('odysseyCard')).display));
await page.goto('https://logoswell.kr/odyssey/index.html?reset', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 120000 }); await new Promise(r => setTimeout(r, 4000));
console.log('게임 로드:', await page.evaluate(() => window.__debug.zone));
await browser.close();
