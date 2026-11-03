import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notype');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
console.log(await page.evaluate(async () => {
  const g = await new THREE.GLTFLoader().setMeshoptDecoder(THREE.MeshoptDecoder).loadAsync(window.__ASSETS['student.glb']);
  const clip = g.animations.find(c => c.name === 'Dig'); const m = new THREE.AnimationMixer(g.scene); m.clipAction(clip).play();
  const H = g.scene.getObjectByName('Hips'), Hd = g.scene.getObjectByName('Head'), v = new THREE.Vector3(), out = [];
  for (let t = 0; t <= clip.duration; t += 0.3){ m.setTime(t); g.scene.updateMatrixWorld(true); Hd.getWorldPosition(v); const hy = v.y; H.getWorldPosition(v); out.push(t.toFixed(1) + ':' + hy.toFixed(2) + '/' + v.z.toFixed(2)); }
  return out.join(' ');
}));
await browser.close();
