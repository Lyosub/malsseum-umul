import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
const [src, out, w, h] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const p = await b.newPage(); await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(src).href, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 800));
const over = await p.evaluate(() => document.documentElement.scrollHeight);
await p.screenshot({ path: out }); console.log('scrollHeight', over); await b.close();
