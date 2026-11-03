import puppeteer from 'puppeteer-core';
import fs from 'fs';
const files = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html');
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
for (const f of files){
  const b64 = fs.readFileSync(f).toString('base64');
  console.log(f.split('/').pop(), await page.evaluate(async (b64)=>{
    const gltf = await new THREE.GLTFLoader().loadAsync('data:model/gltf-binary;base64,'+b64);
    const model = gltf.scene; const res=[];
    for (const clip of gltf.animations){
      clip.tracks = clip.tracks.filter(t=>!/\.scale$/.test(t.name));
      const m = new THREE.AnimationMixer(model); m.clipAction(clip).play();
      const L = model.getObjectByName('LeftFoot'), R = model.getObjectByName('RightFoot'), H = model.getObjectByName('Hips');
      const a=new THREE.Vector3(), b=new THREE.Vector3(), h=new THREE.Vector3(); const zs=[]; let wmax=0, hx=[1e9,-1e9];
      for (let i=0;i<=160;i++){ m.setTime(clip.duration*i/160); model.updateMatrixWorld(true); L.getWorldPosition(a); R.getWorldPosition(b); H.getWorldPosition(h);
        zs.push(a.z); wmax=Math.max(wmax,Math.abs(a.x-b.x)); hx[0]=Math.min(hx[0],h.z); hx[1]=Math.max(hx[1],h.z); }
      const mn=Math.min(...zs), mx=Math.max(...zs), mid=(mn+mx)/2; let c=0; for(let i=1;i<zs.length;i++) if(zs[i-1]<mid&&zs[i]>=mid) c++;
      res.push(`${clip.name} dur=${clip.duration.toFixed(2)} cycles=${c} speed=${((mx-mn)*2*Math.max(1,c)/clip.duration).toFixed(2)}m/s stanceW=${wmax.toFixed(2)} hipsZdrift=${(hx[1]-hx[0]).toFixed(2)}`);
      m.stopAllAction(); m.uncacheRoot(model);
    }
    return res.join(' | ');
  }, b64));
}
await browser.close();
