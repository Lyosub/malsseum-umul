import fs from 'fs';
const V = {}; for (let c = 1; c <= 21; c++) for (const l of fs.readFileSync(`jdg${c}.txt`, 'utf8').split('\n')){ const m = l.trim().match(/^(\d+) (.*)$/); if (m) V[`${c}:${m[1]}`] = m[2].replace(/\d\)/g, '').replace(/\s+/g, ' ').trim(); }
const md = fs.readFileSync('review13.md', 'utf8'); let n = 0, bad = 0, sp = 0, spBad = 0;
const all = Object.values(V).join(' ');
for (const line of md.split('\n')){ const m = line.match(/^\| ([^|]+) \| (.+) \|$/); if (!m || m[1] === '말하는 이' || m[1] === '---' || m[1] === '(연출)' || m[1].startsWith('사사기')) continue;
  const t = m[2]; const r = t.match(/^(.*) \(삿 (\d+:\d+)\)$/);
  if (r){ n++; const v = V[r[2]]; if (!(v === r[1] || v.startsWith(r[1]))){ bad++; console.log('다름', r[2], r[1].slice(0, 40)); } }
  else if (!t.startsWith('▶')){ sp++; if (!all.includes(t)){ spBad++; console.log('원문에 없음', t.slice(0, 40)); } } }
console.log(`해설 ${n}줄 중 다름 ${bad} · 인물 말 ${sp}줄 중 원문에 없음 ${spBad}`);
