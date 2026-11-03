// Meshy 리깅+애니메이션 GLB → 게임용 GLB (텍스처 1024 JPEG, 키프레임 정리, 정점 양자화, 클립 이름 통일)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample, quantize, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';
const [,, src, out, texSize = '1024'] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const rename = { Idle:'Idle', Walk:'Walk', Jump:'Jump', Dig:'Dig', Casual_Walk:'Walk', Run_02:'Run', Cheer_with_One_Hand_Up:'Wave', Stand_and_Chat:'Talk', Regular_Jump:'Jump', Male_Bend_Over_Pick_Up:'Dig' };
for (const a of doc.getRoot().listAnimations()) if (rename[a.getName()]) a.setName(rename[a.getName()]);
await doc.transform(
  resample({ tolerance: 1e-4 }), prune(), dedup(),
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 85, resize: [+texSize, +texSize] }),
  quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 16, quantizeWeight: 8 }) // UV는 16비트(12비트는 조각 경계가 어긋남)
);
await io.write(out, doc);
console.log('anims', doc.getRoot().listAnimations().map(a => a.getName()), 'joints', doc.getRoot().listSkins().map(s => s.listJoints().map(j => j.getName()).join(',')));
