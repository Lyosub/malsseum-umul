import fs from 'fs';
const src = fs.readFileSync('ruth6.js', 'utf8');
const DLG = {}, VERSES = {}, CONDS = {}, BADGES = {}, Z = () => ({ points: [] });
const ZONES = { moab: Z(), bethlehem: Z(), shiloh: Z(), philistia: Z(), gibeon: Z() };
const api = { DLG, VERSES, CONDS, BADGES, ZONES, PROP_DEFS: {}, THREE: {}, SPEAKERS: { NAR: { n: '해설' } }, ST: {}, mgOpen(){}, mgCloseAll(){}, completeTask(){} };
globalThis.window = { __odyQ: [] }; eval(src); const def = window.__odyQ[0](api);
const keys = Object.keys(DLG).filter(k => /^(rt|sm)_/.test(k));
let md = `## 14. 6편 「룻과 사무엘」 대사 (2026-10-25 · 전도사님 검수 대기)\n\n> 대사는 생성기(\`E:\\temp\\claude-work\\ruth6\\gen6.py\`)가 대한성서공회 개역개정 원문 파일(룻기 85절, 사무엘상 1–7장 157절)에서 그대로 뽑았다 — 손으로 옮긴 글자 없음, 각주 번호 제거.\n>\n> **전도사님 결정:** 룻 3장 타작마당은 해설로 읽고 밤 장면은 배경만. 삼상 4장(엘리 집안의 죽음·이가봇)과 6:19(벧세메스)는 해설로 읽고 멀리서만. 다곤은 얼굴·모양 없는 돌덩이로 엎드러진 모습만.\n\n### 구절 카드\n\n| 카드 | 본문 |\n|---|---|\n`;
for (const v of Object.values(VERSES)) md += `| ${v.ref} | ${v.text} |\n`;
for (const k of keys){ md += `\n### ${k}\n\n| 말하는 이 | 대사 |\n|---|---|\n`; for (const l of DLG[k]){ if (Array.isArray(l)) md += `| ${l[0] && l[0].n || '?'} | ${l[1]} |\n`; else if (l && l.event) md += `| (연출) | ${l.event} |\n`; } }
md += `\n### 장 구성\n\n` + def.chapters.map((c, i) => `${i + 1}. ${c.title.replace(/^📜 /, '')} — ${c.steps.length}단계`).join('\n') + '\n';
fs.writeFileSync('review14.md', md);
// 원문 대조
const V = {}; for (const [b, n, ab] of [['rut', 4, '룻'], ['1sa', 7, '삼상']]) for (let c = 1; c <= n; c++) for (const l of fs.readFileSync(`${b}${c}.txt`, 'utf8').split('\n')){ const m = l.trim().match(/^(\d+) (.*)$/); if (m) V[`${ab} ${c}:${m[1]}`] = m[2].replace(/\d\)/g, '').replace(/\s+/g, ' ').trim(); }
const all = Object.values(V).join(' '); let n = 0, bad = 0, sp = 0, spBad = 0;
for (const k of keys) for (const l of DLG[k]){ if (!Array.isArray(l)) continue; const t = l[1]; const r = t.match(/^(.*) \(((?:룻|삼상) \d+:\d+)\)$/);
  if (r){ n++; const v = V[r[2]]; if (!(v === r[1] || v.startsWith(r[1]))){ bad++; console.log('다름', r[2]); } } else if (!t.startsWith('▶')){ sp++; if (!all.includes(t)){ spBad++; console.log('없음', t.slice(0, 30)); } } }
console.log(`묶음 ${keys.length} · 해설 ${n}줄 중 다름 ${bad} · 인물 말 ${sp}줄 중 원문에 없음 ${spBad} · 카드 ${Object.keys(VERSES).length}`);
