import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html');
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
console.log(await page.evaluate(async ()=>{
  const gltf = await new THREE.GLTFLoader().loadAsync(window.__ASSETS['student.glb']);
  const model = gltf.scene; const out = {};
  const head = model.getObjectByName('Head'), foot = model.getObjectByName('LeftFoot'), hips = model.getObjectByName('Hips');
  const w = new THREE.Vector3();
  model.updateMatrixWorld(true); head.getWorldPosition(w); out.rest = w.y.toFixed(3);
  for (const clip of gltf.animations){
    const scaleTracks = clip.tracks.filter(t=>/\.scale$/.test(t.name)).map(t=>t.name+':'+Array.from(t.values.slice(0,3)).map(v=>v.toFixed(3)).join('/'));
    const m = new THREE.AnimationMixer(model); m.clipAction(clip).play();
    const hs=[];
    for (let i=0;i<=8;i++){ m.setTime(clip.duration*i/8); model.updateMatrixWorld(true); head.getWorldPosition(w); hs.push(w.y.toFixed(2)); }
    m.stopAllAction(); m.uncacheRoot(model);
    out[clip.name] = { headY: hs.join(' '), scaleTracks: scaleTracks.slice(0,4), n: scaleTracks.length };
  }
  return JSON.stringify(out, null, 1);
}));
await browser.close();
