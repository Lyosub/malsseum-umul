import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample, quantize } from '@gltf-transform/functions';
const [,, src, out] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const root = doc.getRoot();
// sRGB hex -> linear rgb
const lin = h => [0,2,4].map(i => { const c = parseInt(h.slice(1+i,3+i),16)/255; return c<=0.04045? c/12.92 : Math.pow((c+0.055)/1.055,2.4); });
const colors = {                 // 원화(student-character.png) 기준
  LightBrown: '#8fa67f',         // 세이지 그린 티셔츠
  LightBlue:  '#4b423c',         // 짙은 갈회색 바지
  Red_Dark:   '#ece8df',         // 흰 운동화(갑피)
  White:      '#cfc9bd',         // 밑창·양말
  Skin:       '#e3a97f',
  Skin_Darker:'#e3a97f',         // 원래 턱수염 → 피부색으로 덮어 학생 얼굴로
  Hair:       '#6a4329',         // 갈색 머리
  Eyebrows:   '#4a2f1e',
  Eye:        '#2a1a10',
};
for (const m of root.listMaterials()) {
  const c = colors[m.getName()];
  if (c) m.setBaseColorFactor([...lin(c), 1]);
  m.setMetallicFactor(0); m.setRoughnessFactor(0.9);
}
const keep = { 'CharacterArmature|Idle':'Idle', 'CharacterArmature|Walk':'Walk', 'CharacterArmature|Run':'Run',
               'CharacterArmature|Wave':'Wave', 'CharacterArmature|Interact':'Interact' };
for (const a of root.listAnimations()) {
  if (keep[a.getName()]) a.setName(keep[a.getName()]); else a.dispose();
}
// 뒷머리 묶음(원화에 없음) 제거: 두피 뒤쪽(+Y 0.00062)보다 더 튀어나온 머리카락 삼각형을 뺀다
const PONYTAIL_Y = 0.00085;
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  if (prim.getMaterial()?.getName() !== 'Hair') continue;
  const pos = prim.getAttribute('POSITION'), idx = prim.getIndices();
  const src = idx.getArray(), keep = [], v = [0,0,0];
  let removed = 0;
  for (let t = 0; t < src.length; t += 3) {
    let back = false;
    for (let k = 0; k < 3; k++) { pos.getElement(src[t+k], v); if (v[1] > PONYTAIL_Y) back = true; }
    if (back) { removed++; continue; }
    keep.push(src[t], src[t+1], src[t+2]);
  }
  idx.setArray(new (src.constructor)(keep));
  console.log('ponytail triangles removed', removed);
}
// 정점색(COLOR_0)은 재질 색과 곱해져 원화 색을 흐리므로 제거
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) { const a = prim.getAttribute('COLOR_0'); if (a) prim.setAttribute('COLOR_0', null); }
await doc.transform(resample({ tolerance: 1e-4 }), prune(), dedup(), quantize({ quantizePosition: 14, quantizeNormal: 10 }));
await io.write(out, doc);
console.log('anims', root.listAnimations().map(a=>a.getName()));
