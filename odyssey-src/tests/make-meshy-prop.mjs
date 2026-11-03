// Meshy 소품/건물 GLB → 게임용 GLB (텍스처 JPEG 축소, 위치·법선만 양자화 — UV는 그대로)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, quantize, textureCompress, simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
const [,, src, out, texSize = '512', ratio = '1'] = process.argv;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
await doc.transform(prune(), dedup(),
  ...(+ratio < 1 ? [weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +ratio, error: 0.02 })] : []),
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 85, resize: [+texSize, +texSize] }),
  quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 16 }));
await io.write(out, doc);
