import fs from 'fs';
const src = fs.readFileSync('saul7.js', 'utf8');
const DLG = {}, VERSES = {}, CONDS = {}, BADGES = {}, Z = () => ({ points: [] });
const ZONES = { shiloh: Z(), gibeah: Z(), gibeon: Z(), moab: Z(), gilgal: Z() };
const api = { DLG, VERSES, CONDS, BADGES, ZONES, PROP_DEFS: {}, THREE: {}, SPEAKERS: { NAR: { n: '해설' } }, ST: {}, mgOpen(){}, mgCloseAll(){}, completeTask(){} };
globalThis.window = { __odyQ: [] }; eval(src); const def = window.__odyQ[0](api);
const keys = Object.keys(DLG).filter(k => /^sl_/.test(k));
let md = `## 15. 7편 「사울과 다윗」 1·2부 대사 (1부 2026-10-31 · 2부 2026-11-02 · 전도사님 검수 대기)\n\n> 대사는 생성기(\`E:\\temp\\claude-work\\saul7\\gen7.py\`)가 대한성서공회 개역개정 원문 파일(사무엘상 8–15장)에서 그대로 뽑았다 — 손으로 옮긴 글자 없음. ▶ 줄은 게임 안내(성경 인물의 말이 아님).\n>\n> **전도사님 결정 반영:** 11:7(겨릿소 각을 뜸)은 해설로 읽기만, 11:11 싸움은 먼지만 멀리. 왕 편·백성 편을 고르는 판결 없음. 하나님의 말씀(8:7–9, 9:15–17)은 6편처럼 해설로 읽는다.\n\n### 구절 카드\n\n| 카드 | 본문 |\n|---|---|\n`;
for (const v of Object.values(VERSES)) md += `| ${v.ref} | ${v.text} |\n`;
for (const k of keys){ md += `\n### ${k}\n\n| 말하는 이 | 대사 |\n|---|---|\n`; for (const l of DLG[k]){ if (Array.isArray(l)) md += `| ${l[0] && l[0].n || '?'} | ${l[1]} |\n`; else if (l && l.event) md += `| (연출) | ${l.event} |\n`; } }
md += `\n### 장 구성\n\n` + def.chapters.map((c, i) => `${i + 1}. ${c.title.replace(/^📜 /, '')} — ${c.steps.length}단계`).join('\n') + '\n';
fs.writeFileSync('review15.md', md);
// 원문 대조
const V = {}; for (let c = 8; c <= 15; c++) for (const l of fs.readFileSync(`1sa${c}.txt`, 'utf8').split('\n')){ const m = l.trim().match(/^(\d+) (.*)$/); if (m) V[`삼상 ${c}:${m[1]}`] = m[2].replace('올라가니라사울이', '올라가니라 사울이').replace(/\d\)/g, '').replace(/\s+/g, ' ').trim(); }
const all = Object.values(V).join(' '); let n = 0, bad = 0, sp = 0, spBad = 0;
for (const k of keys) for (const l of DLG[k]){ if (!Array.isArray(l)) continue; const t = l[1]; const r = t.match(/^(.*) \((삼상 \d+:\d+)\)$/);
  if (r){ n++; const v = V[r[2]]; if (!(v === r[1] || v.includes(r[1]))){ bad++; console.log('다름', r[2]); } } else if (!t.startsWith('▶')){ sp++; if (!all.includes(t)){ spBad++; console.log('없음', t.slice(0, 30)); } } }
for (const v of Object.values(VERSES)){ const m = v.ref.match(/사무엘상 (\d+):(\d+)/); if (V[`삼상 ${m[1]}:${m[2]}`] !== v.text){ bad++; console.log('카드 다름', v.ref); } }
// 단계가 가리키는 지점·대사·게임이 다 있는지
const pts = {}; for (const [z, o] of Object.entries(ZONES)) for (const p of o.points) pts[`${z}:${p.id}`] = p;
let miss = 0; def.chapters.forEach(c => c.steps.forEach(s => { const id = s.npc || s.point; if (!pts[`${s.zone}:${id}`]){ miss++; console.log('지점 없음', s.id, s.zone, id); }
  for (const d of [s.dlg, s.doneDlg]) if (d && !DLG[d]){ miss++; console.log('대사 없음', s.id, d); }
  if (s.game && !def.games[s.game]){ miss++; console.log('게임 없음', s.id, s.game); }
  const p = pts[`${s.zone}:${id}`]; if (p && p.cond && !CONDS[p.cond]){ miss++; console.log('조건 없음', p.cond); } }));
console.log(`묶음 ${keys.length} · 해설 ${n}줄 중 다름 ${bad} · 인물 말 ${sp}줄 중 원문에 없음 ${spBad} · 카드 ${Object.keys(VERSES).length} · 빠진 연결 ${miss}`);
