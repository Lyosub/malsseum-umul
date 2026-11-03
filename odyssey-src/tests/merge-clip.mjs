// 사용법: node merge-clip.mjs <본 GLB> <출력 GLB> <클립이름>=<클립 GLB> ...   (같은 뼈대 이름끼리 채널 이식, scale 채널 제외)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [,, mainSrc, out, ...pairs] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const main = await io.read(mainSrc);
const root = main.getRoot(), buf = root.listBuffers()[0];
const byName = new Map(root.listNodes().map(n => [n.getName(), n]));
const copyAcc = acc => main.createAccessor().setType(acc.getType()).setArray(acc.getArray().slice()).setBuffer(buf);
for (const p of pairs){
  const [name, spec] = p.split('='); const [file, idx] = spec.split('#');   // 파일#번호 = 그 파일의 몇 번째 동작(기본 0)
  const src = (await io.read(file)).getRoot().listAnimations()[+(idx || 0)];
  for (const a of root.listAnimations()) if (a.getName() === name || (name === 'Walk' && a.getName() === 'Casual_Walk')) a.dispose(); // 옛 산책 걷기 제거(같은 이름 Walk 두 개 방지)
  const anim = main.createAnimation(name); let n = 0;
  for (const ch of src.listChannels()){
    const target = byName.get(ch.getTargetNode().getName());
    if (!target || ch.getTargetPath() === 'scale') continue;
    const s = ch.getSampler();
    const sampler = main.createAnimationSampler().setInput(copyAcc(s.getInput())).setOutput(copyAcc(s.getOutput())).setInterpolation(s.getInterpolation());
    anim.addSampler(sampler).addChannel(main.createAnimationChannel().setTargetNode(target).setTargetPath(ch.getTargetPath()).setSampler(sampler)); n++;
  }
  console.log(name, 'channels', n);
}
for (const a of root.listAnimations()) for (const ch of a.listChannels()) if (ch.getTargetPath() === 'scale') ch.dispose();
await io.write(out, main);
console.log('anims', root.listAnimations().map(a => a.getName()));
