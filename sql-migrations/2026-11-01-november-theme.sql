-- 중등부 11월 주제 공지 + 홈 한 줄 공지(10월 주제 배너를 11월로 교체)
-- 형식은 9월·10월 주제 공지(announcements id 2, 4)와 같다. 10월 공지 글은 지난 달 것처럼 그대로 둔다.

insert into announcements (title, content, created_by)
values (
  '중등부 11월 주제',
  E'[11월 주제]\n“감사로 열매 맺는 중등부”\n\n범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라\n데살로니가전서 5장 18절\n\n기도 : 받은 은혜를 돌아보며 감사하게 하소서, 모든 상황 속에서 감사의 눈을 열어 주소서',
  '6a216eec-c359-41ae-bd30-78f98ed80714'
);

delete from home_banner where id = 5;  -- 「중등부 10월 주제 · 세상 속에서 구별된 중등부」

insert into home_banner (title, description, link_url, created_by)
values (
  '중등부 11월 주제 · 감사로 열매 맺는 중등부',
  '데살로니가전서 5장 18절',
  'notice.html',
  '6a216eec-c359-41ae-bd30-78f98ed80714'
);
