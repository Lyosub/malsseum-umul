// judges5.js를 가짜 엔진에 올려 대사·구절 카드를 꺼내 검수표(md)로 만든다
import fs from 'fs';
const src = fs.readFileSync('judges5.js', 'utf8');
const DLG = {}, VERSES = {}, CONDS = {}, BADGES = {}, Z = n => ({ points: [] });
const ZONES = { gilgal: Z(), hebron: Z(), shiloh: Z(), jezreel: Z(), moab: Z(), philistia: Z(), gibeon: Z() };
const NAR = { n: '해설' };
const api = { DLG, VERSES, CONDS, BADGES, ZONES, THREE: {}, SPEAKERS: { NAR }, ST: {}, mgOpen(){}, mgCloseAll(){}, completeTask(){} };
globalThis.window = { __odyQ: [] }; eval(src); const def = window.__odyQ[0](api);
const name = s => s && s.n ? s.n : '?';
const keys = Object.keys(DLG).filter(k => k.startsWith('jg_'));
let md = `## 13. 5편 「사사들과 함께」 대사 (2026-10-25 · 전도사님 검수 대기)\n\n> 대사는 생성기(\`E:\\temp\\claude-work\\judges5\\gen_dlg.py\`)가 대한성서공회 개역개정 원문 파일(삿 1–21장 618절)에서 그대로 뽑았다 — 손으로 옮긴 글자 없음. 각주 번호(1) 2))는 뺐다. 말 부분만 쓴 줄은 원문 안에 그대로 있는지 확인했다.\n>\n> **읽지 않는 본문(전도사님 결정·기준):** 삿 3:22(에훗의 칼 장면 묘사), 삿 19장 전체, 20:4-7(19장 사건 설명), 21:10-12(야베스 길르앗), 21:19-23(실로의 딸들). 칼·말뚝·서원 장면(3:21, 4:21, 11:30-40, 16:21)은 해설로 읽되 연출·버튼은 없다.\n\n### 구절 카드\n\n| 카드 | 본문 |\n|---|---|\n`;
for (const [k, v] of Object.entries(VERSES)) md += `| ${v.ref} | ${v.text} |\n`;
for (const k of keys){ md += `\n### ${k}\n\n| 말하는 이 | 대사 |\n|---|---|\n`;
  for (const l of DLG[k]){ if (Array.isArray(l)) md += `| ${name(l[0])} | ${l[1]} |\n`; else if (l && l.event) md += `| (연출) | ${l.event} |\n`; } }
md += `\n### 장 구성\n\n` + def.chapters.map((c, i) => `${i + 1}. ${c.title.replace(/^📜 /, '')} — ${c.steps.length}단계`).join('\n') + '\n';
fs.writeFileSync('review13.md', md);
console.log('keys', keys.length, 'lines', keys.reduce((a, k) => a + DLG[k].length, 0), 'cards', Object.keys(VERSES).length);
