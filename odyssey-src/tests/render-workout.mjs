import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
const [src, out] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(src).href); await new Promise(r => setTimeout(r, 800));
const h = await p.evaluate(() => document.querySelector('.poster').scrollHeight);
await p.setViewport({ width: 1080, height: h }); await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: h } });
console.log('height', h); await b.close();
