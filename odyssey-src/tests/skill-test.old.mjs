import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 390, height: 760, isMobile:true, hasTouch:true });
const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&zone=midian');
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
const w = ms => new Promise(r=>setTimeout(r,ms)); const dir='E:/temp/claude-work/exodus-game/stage1/skill/';
await w(800);
console.log('skills at start:', await page.$$eval('.skill-btn', b=>b.length));
// 점프: 머리 높이 변화 측정
const headY = () => page.evaluate(()=>{ const v=new THREE.Vector3(); let h=null; window.__debug.player.traverse(o=>{ if(o.name==='Head') h=o; }); h.getWorldPosition(v); return +(v.y - window.__debug.player.position.y).toFixed(2); });
const before = await headY();
await page.tap('#jump-btn'); let peak=0; for(let i=0;i<12;i++){ await w(60); peak=Math.max(peak, await headY()); if(i===5) await page.screenshot({path:dir+'1-jump.png'}); }
console.log('jump head height', before, '→ peak', peak);
// 떨기나무로 이동해 살펴보기
await page.evaluate(()=>{ const p=window.__debug.player.position; p.x=30; p.z=-27.3; }); await w(900);
await page.tap('#interact-btn'); await w(900);
await page.screenshot({path:dir+'2-unlock.png'});
console.log('modal visible:', await page.$eval('#skill-modal', e=>!e.classList.contains('hidden')));
await page.tap('#skill-modal-ok'); await page.tap('#info-close'); await w(400);
console.log('skills after quest:', await page.$$eval('.skill-btn', b=>b.map(x=>x.textContent)));
await page.tap('.skill-btn'); await w(700);
await page.screenshot({path:dir+'3-use-skill.png'});
// 새로고침해도 스킬 유지
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html'); await page.waitForFunction('window.__ready === true');
console.log('skills after reload:', await page.$$eval('.skill-btn', b=>b.length));
console.log('errors', errors.length? errors.join('\n'):'none');
await browser.close();
