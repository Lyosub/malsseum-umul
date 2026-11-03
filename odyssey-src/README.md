# In Odyssey 원본 조각

`odyssey/index.html`은 **이 폴더에서 만들어지는 파일**이다. 직접 고치지 않는다.

```
조각 수정 → python odyssey-src/build.py → 게임 시험 → 커밋(조각 + index.html)
```

- 게임은 예전과 똑같이 파일 하나로 배포된다. 코드 전체가 하나의 함수 안에서 변수를 공유하므로 조각끼리 자유롭게 부를 수 있다.
- `JS_PARTS` 순서를 바꾸지 않는다. 조각 경계에서 문법이 이어지는 곳이 있어 **조각 하나만 따로 실행할 수는 없다.**
- 두루마리 캐시 번호(`__SCROLL_V`)는 build.py가 `odyssey/scrolls/*.js` 내용으로 계산한다. 새 편을 만들면 `SCROLLS`에 한 줄 더한다.
- 푸시하면 GitHub Actions(`odyssey-src-check.yml`)가 조각과 index.html이 맞는지 확인하고, 다르면 실패 메일을 보낸다.

| 조각 | 내용 |
|---|---|
| `page-head.html`, `game.css`, `page-body.html`, `page-scripts.html`, `page-tail.html` | 화면 틀과 스타일 |
| `js/01-setup` | 기본 세팅, 화질, 조명, 바닥 |
| `js/02-world` | 3D 소품, 마을(ZONES) |
| `js/03-player-camera` | 플레이어, 꾸미기, 카메라, 정보 포인트 |
| `js/04-village-ai` | 마을 사람 움직임 |
| `js/05-input-skills` | 조이스틱, 줌, 스태미나, 스킬 |
| `js/06-moses-story` | 1편 이야기 단계(STORY1~10, CHAPTERS) |
| `js/07-moses-dialogue` | 1편 소문, 대사 |
| `js/08-save-collect` | 저장, 숨은 조각, 인물 도감, 칭호 |
| `js/09-scroll-system` | 두루마리 불러오기와 진행 |
| `js/10-craft-activity` | 공방, 재료, 활동 퀘스트 |
| `js/11-side-quests` | 장별 곁 임무, 지난 이야기 |
| `js/12-museum-map` | 기념 전시관, 여정 지도 |
| `js/13-dialogue-ui` | 대화창 |
| `js/14-plagues-events` | 재앙 등 이야기 사건 |
| `js/15-minigames` | 미니게임 |
| `js/16-main-loop` | 상호작용 버튼, 메인 루프, 미니맵, 시작 |
