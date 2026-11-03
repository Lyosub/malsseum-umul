import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8768/odyssey/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 4000));
console.log('errors:', JSON.stringify(errs));
await b.close();
