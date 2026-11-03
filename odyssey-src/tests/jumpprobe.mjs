import puppeteer from 'puppeteer-core'; import fs from 'fs';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html');
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
const b64 = fs.readFileSync('../exodus-game/meshy/student-jump-466.glb').toString('base64');
console.log(await page.evaluate(async (b64)=>{
  const g = await new THREE.GLTFLoader().loadAsync('data:model/gltf-binary;base64,'+b64);
  const clip = g.animations[0]; clip.tracks = clip.tracks.filter(t=>!/\.scale$/.test(t.name));
  const model = g.scene; const m = new THREE.AnimationMixer(model); m.clipAction(clip).play();
  const L = model.getObjectByName('LeftFoot'), H = model.getObjectByName('Hips'); const a=new THREE.Vector3(), h=new THREE.Vector3(); const rows=[];
  for (let i=0;i<=20;i++){ m.setTime(clip.duration*i/20); model.updateMatrixWorld(true); L.getWorldPosition(a); H.getWorldPosition(h); rows.push(`${(clip.duration*i/20).toFixed(2)}s foot=${a.y.toFixed(2)} hipsY=${h.y.toFixed(2)} hipsZ=${h.z.toFixed(2)}`); }
  return clip.name+' dur '+clip.duration.toFixed(2)+'\n'+rows.join('\n');
}, b64));
await browser.close();
