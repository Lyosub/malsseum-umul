// student-anims.glb(모델+Idle/Wave/Talk/Run) 에 리깅 기본 걷기(walking_man) 클립을 이식하고 Casual_Walk 는 뺀다
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [,, mainSrc, walkSrc, out] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const main = await io.read(mainSrc), walk = await io.read(walkSrc);
const root = main.getRoot(), buf = root.listBuffers()[0];
const byName = new Map(root.listNodes().map(n => [n.getName(), n]));
for (const a of root.listAnimations()) if (a.getName() === 'Casual_Walk') a.dispose();
const src = walk.getRoot().listAnimations()[0];
const anim = main.createAnimation('Walk');
const copyAcc = acc => main.createAccessor().setType(acc.getType()).setArray(acc.getArray().slice()).setBuffer(buf);
let n = 0;
for (const ch of src.listChannels()){
  const target = byName.get(ch.getTargetNode().getName());
  if (!target || ch.getTargetPath() === 'scale') continue;
  const s = ch.getSampler();
  const sampler = main.createAnimationSampler().setInput(copyAcc(s.getInput())).setOutput(copyAcc(s.getOutput())).setInterpolation(s.getInterpolation());
  anim.addSampler(sampler).addChannel(main.createAnimationChannel().setTargetNode(target).setTargetPath(ch.getTargetPath()).setSampler(sampler));
  n++;
}
// 모든 클립에서 scale 채널 제거(Idle 의 엉덩이 1.176배 → 멈추면 캐릭터가 커지던 문제)
for (const a of root.listAnimations()) for (const ch of a.listChannels()) if (ch.getTargetPath() === 'scale') ch.dispose();
await io.write(out, main);
console.log('walk channels', n, 'anims', root.listAnimations().map(a => a.getName()));
