// 오늘의 찬양 추천 — 중등부에서 자주 부르는 워십 목록.
// query는 실제 영상이 바뀌거나 삭제돼도 안 깨지도록 유튜브 "검색 결과" 링크로 연결한다(특정 영상 링크 고정 X).
var WORSHIP_SONGS = [
  { title: "여기 있어요", artist: "위러브" },
  { title: "지금 이 순간", artist: "마커스워십" },
  { title: "예수 신실하신 나의 친구", artist: "어노인팅" },
  { title: "여전히 나는", artist: "JUS" },
  { title: "축복합니다", artist: "소리엘" },
  { title: "부흥", artist: "다윗의 장막" },
  { title: "예수 오 나의 예수", artist: "제이어스" },
  { title: "놀라운 은혜", artist: "마커스워십" },
  { title: "선한 능력", artist: "위러브" },
  { title: "예람", artist: "예람워십" }
];

function worshipYoutubeSearchUrl(song) {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(song.artist + " " + song.title);
}

// verses-data.js의 getDayIndex()와 같은 방식(연중 일수 기준)으로 매일 자동으로 바뀐다.
function getSongOfTheDay() {
  var idx = (typeof getDayIndex === "function") ? getDayIndex() : Math.floor(Date.now() / 86400000);
  return WORSHIP_SONGS[idx % WORSHIP_SONGS.length];
}
