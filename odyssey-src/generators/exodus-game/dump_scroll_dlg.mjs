// 두루마리 파일(scrolls/*.js)의 대사·구절 카드를 뽑는다 — 검수표 추가용.
// 사용법: node dump_scroll_dlg.mjs scrolls/moses0.js scrolls/sinai2.js > out.json
import fs from 'node:fs';
const deep = () => new Proxy(function(){}, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : deep(), apply: () => deep(), construct: () => deep() });
const res = {};
for (const f of process.argv.slice(2)){
  const DLG = {}, VERSES = {};
  const ZONES = new Proxy({}, { get: (t, k) => (t[k] = t[k] || { points: [], layout: [] }) });
  const SPEAKERS = new Proxy({}, { get: (t, k) => ({ NAR: { n: '해설' }, MOSES: { n: '모세' }, AARON: { n: '아론' }, ME: { n: '나' }, GUIDE: { n: '안내자' } })[k] || { n: String(k) } });
  const api = new Proxy({ DLG, VERSES, ZONES, SPEAKERS, CONDS: {}, RUMORS: {}, QUIZ: {}, KEYS: {}, BADGES: {}, PROP_DEFS: {}, THREE: deep(), ST: { sp: {} } }, { get: (t, k) => k in t ? t[k] : deep() });
  globalThis.window = { __odyQ: [] };
  new Function('window', fs.readFileSync(f, 'utf8'))(globalThis.window);
  for (const fn of window.__odyQ) fn(api);
  res[f] = { DLG: Object.fromEntries(Object.entries(DLG).map(([k, v]) => [k, v.filter(x => Array.isArray(x)).map(([s, t]) => [s && s.n || '?', t])])), VERSES };
}
process.stdout.write(JSON.stringify(res, null, 1));
