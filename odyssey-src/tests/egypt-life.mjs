import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 800, height: 560 });
const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
const w = ms => new Promise(r=>setTimeout(r,ms));
await page.waitForFunction('window.__debug.pendingNPC === 0', { timeout: 60000 });
console.log('start-bad', await page.evaluate(()=>{const d=window.__debug;return d.markers.filter(m=>m.ai).filter(m=>!d.walkable(m.data.x,m.data.z)).map(m=>m.data.id).join(',')||'none';}));
console.log('POIs', await page.evaluate(()=>{ const c={}; window.__debug.POIS.forEach(p=>c[p.kind]=(c[p.kind]||0)+1); return JSON.stringify(c); }));
await page.evaluate(()=>window.__debug.player.position.set(44,0,0)); // 멀리서 관찰
const log = {}; const states = {}; let chats = 0; const insideHits = [];
for (let t=0;t<40;t++){
  const snap = await page.evaluate(()=>{ const d=window.__debug; return d.markers.filter(m=>m.ai).map(m=>({id:m.data.id,x:m.mesh.position.x,z:m.mesh.position.z,st:m.ai.state,a:m.cur,poi:m.ai.poi&&m.ai.poi.kind,ok:d.walkable(m.mesh.position.x,m.mesh.position.z)})); });
  for (const s of snap){ (log[s.id] ||= new Set()).add(s.poi||'-'); (states[s.id] ||= new Set()).add(s.a); if (s.st==='chat') chats++; if (!s.ok && s.st!=='act') insideHits.push(`${s.id}@${s.x.toFixed(1)},${s.z.toFixed(1)}`); }
  if (t===15) await page.screenshot({path:'E:/temp/claude-work/exodus-game/stage1/village/egypt-life.png'});
  await w(1000);
}
const final = await page.evaluate(()=>window.__debug.markers.filter(m=>m.ai).map(m=>`${m.data.id}:${m.ai.state}/${m.cur}@${m.mesh.position.x.toFixed(1)},${m.mesh.position.z.toFixed(1)}`).join(' '));
for (const id of Object.keys(log)) console.log(id.padEnd(11), 'places:', [...log[id]].join(','), '| anims:', [...states[id]].join(','));
console.log('chat samples', chats, '| off-walkable while moving', insideHits.length, insideHits.slice(0,5).join(' '));
const moved = await page.evaluate(()=>window.__debug.markers.filter(m=>m.ai).map(m=>m.data.id+':'+Math.hypot(m.mesh.position.x-m.data.x,m.mesh.position.z-m.data.z).toFixed(1)).join(' '));
console.log('moved', moved);
console.log('final', final);
console.log('errors', errors.length?errors.join('\n'):'none');
await browser.close();
