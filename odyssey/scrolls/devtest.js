// 시험 두루마리(개발용) — 두루마리 파일 따로 불러오기 구조를 확인하는 용도. 학생 화면에는 나오지 않음(?devscroll 일 때만).
// 대사 원칙: 해설은 개역개정 원문 + (출처).
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, SPEAKERS: { NAR } } = api;
  CONDS.devScroll = () => api.ST.cur === 'devtest';
  ZONES.sinai.points.push({ id: 'dv_altar', x: 4.5, z: 5.5, type: 'lore', title: '🔥 번제단(시험)', cond: 'devScroll', body: '' });
  Object.assign(DLG, {
    dv_call: [
      [NAR, '여호와께서 회막에서 모세를 부르시고 그에게 말씀하여 이르시되 (레위기 1:1)'],
      [NAR, '이스라엘 자손에게 말하여 이르라 너희 중에 누구든지 여호와께 예물을 드리려거든 가축 중에서 소나 양으로 예물을 드릴지니라 (레위기 1:2)'],
      [NAR, '▶ 번제단으로 가 보세요.'],
    ],
    dv_altar: [
      [NAR, '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라 (레위기 9:24)'],
    ],
  });
  return {
    id: 'devtest',
    chapters: [{
      title: '📜 시험 두루마리 1장 — 회막에서 부르심', clearTitle: '🎉 시험 두루마리 1장 완료!', next: '(시험 끝)',
      steps: [
        { id: 'dv1', zone: 'sinai', obj: '진영의 모세에게 가기', where: '진영 가운데', npc: 'moses', dlg: 'dv_call' },
        { id: 'dv2', zone: 'sinai', obj: '번제단 살펴보기', where: '진영 가운데 번제단(시험)', point: 'dv_altar', dlg: 'dv_altar', reward: { clear: true } },
      ],
    }],
    world(zone){ window.__dvWorld = zone; },   // 마을 연출 연결 확인용
  };
});
