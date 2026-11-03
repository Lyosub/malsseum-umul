import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read('../exodus-game/stage1/Casual_2.glb');
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()){
  const mat = prim.getMaterial()?.getName(); const pos = prim.getAttribute('POSITION');
  const n = pos.getCount(); const mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; const v=[0,0,0];
  for (let i=0;i<n;i++){ pos.getElement(i,v); for(let k=0;k<3;k++){ mn[k]=Math.min(mn[k],v[k]); mx[k]=Math.max(mx[k],v[k]); } }
  console.log(mesh.getName(), mat, n, mn.map(x=>x.toFixed(5)).join(','), '|', mx.map(x=>x.toFixed(5)).join(','));
}
