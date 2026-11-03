import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 600 });
const errors=[]; page.on('pageerror', e=>errors.push(e.message));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&zone=midian');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
const w = ms => new Promise(r=>setTimeout(r,ms));
// 1) 경로 충돌 검사
console.log('ROUTE CHECK', await page.evaluate(()=>{
  const d = window.__debug, out = [];
  const npcCols = new Set(d.markers.filter(m=>m.col).map(m=>m.col));
  const hit = (x,z) => {
    for (const o of d.obstacles){ if (npcCols.has(o)) continue; if (Math.hypot(x-o.x,z-o.z) < o.r + 0.4) return 'circle@'+o.x.toFixed(1)+','+o.z.toFixed(1); }
    for (const b of d.boxes){ const c=Math.cos(b.rot), s=Math.sin(b.rot), rx=x-b.x, rz=z-b.z, lx=rx*c-rz*s, lz=rx*s+rz*c;
      if (Math.abs(lx) < b.hx+0.4 && Math.abs(lz) < b.hz+0.4) return 'box@'+b.x.toFixed(1)+','+b.z.toFixed(1); }
    return null; };
  for (const m of d.markers){ if (!m.ai || m.ai.role!=='route') continue;
    const r = m.ai.def.route, pts=[[m.data.x,m.data.z], ...r.map(p=>[p[0],p[1]])];
    for (let i=0;i<pts.length;i++){ const [ax,az]=pts[i], [bx,bz]=pts[(i+1)%pts.length];
      for (let t=0;t<=1;t+=0.05){ const h=hit(ax+(bx-ax)*t, az+(bz-az)*t); if (h){ out.push(`${m.data.id} seg${i} t${t.toFixed(2)} ${h}`); break; } } } }
  return out.length ? out.join('\n') : 'all clear';
}));
// 2) NPC 행동: 12초 동안 위치·동작 변화
const snap = () => page.evaluate(()=>window.__debug.markers.filter(m=>m.ai).map(m=>`${m.data.id}:${m.cur}@${m.mesh.position.x.toFixed(1)},${m.mesh.position.z.toFixed(1)}`).join(' '));
await page.evaluate(()=>window.__debug.player.position.set(0,0,40)); // 멀리 떨어져서(돌아보지 않게)
console.log('T0 ', await snap()); await w(6000); console.log('T6 ', await snap()); await w(6000); console.log('T12', await snap());
// 3) 우물 충돌: 북쪽에서 우물 쪽으로 걸어가기
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(0,0,-1.5); d.setCam(0); d.setHeading(0); });
await page.keyboard.down('w'); await w(2500); await page.keyboard.up('w');
console.log('well test player', await page.evaluate(()=>{ const p=window.__debug.player.position; return p.x.toFixed(2)+','+p.z.toFixed(2)+' dist from well '+Math.hypot(p.x,p.z+6).toFixed(2); }));
// 4) 장작더미 점프 올라서기: 남쪽에서 북쪽으로 달려가며 점프
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(8.8,0,7.5); d.setCam(0); });
const baseY = await page.evaluate(()=>window.__debug.player.position.y);
await page.keyboard.down('w'); await w(450); await page.keyboard.press(' '); await w(1200); await page.keyboard.up('w'); await w(600);
console.log('firewood test', await page.evaluate((b)=>{ const p=window.__debug.player.position; return `pos ${p.x.toFixed(2)},${p.z.toFixed(2)} y=${p.y.toFixed(2)} (terrain ${b.toFixed(2)}) grounded=${window.__debug.grounded}`; }, baseY));
await page.screenshot({path:'E:/temp/claude-work/exodus-game/stage1/village/firewood-top.png'});
// 5) 카메라 90도 돌리고 w → 카메라 앞 방향(-x)으로 이동해야 함
await page.evaluate(()=>{ const d=window.__debug; d.player.position.set(0,0,30); d.setCam(Math.PI/2); });
await w(300); const p0 = await page.evaluate(()=>({...window.__debug.player.position}));
await page.keyboard.down('w'); await w(1200); await page.keyboard.up('w');
const p1 = await page.evaluate(()=>({...window.__debug.player.position}));
console.log('cam yaw 90 → move dx', (p1.x-p0.x).toFixed(2), 'dz', (p1.z-p0.z).toFixed(2));
await page.screenshot({path:'E:/temp/claude-work/exodus-game/stage1/village/cam-rot.png'});
console.log('errors', errors.length?errors.join('\n'):'none');
await browser.close();
