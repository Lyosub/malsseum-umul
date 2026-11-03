import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
await page.setContent('<html><body>t</body></html>');
await page.addScriptTag({ url: 'https://logoswell.kr/assets/vendor/supabase-js.js' });
const r = await page.evaluate(() => new Promise(res => {
  const c = window.supabase.createClient('https://qaxwxbaqduxqzjqoahcb.supabase.co', 'sb_publishable_Q5HhLUzyLoFlNK0MCai_eQ_SOFeu_ks');
  const out = [];
  const ch = c.channel('odyssey-world', { config: { private: true } });
  ch.subscribe((st, err) => { out.push(st + (err ? ':' + err.message : '')); if (st !== 'SUBSCRIBED' || out.length > 1) res(out.join(' / ')); });
  setTimeout(() => res(out.join(' / ') || 'timeout'), 12000);
}));
console.log('로그인 안 한 사람 비공개 채널:', r);
await browser.close();
