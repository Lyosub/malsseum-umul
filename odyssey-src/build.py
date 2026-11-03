#!/usr/bin/env python3
"""In Odyssey 게임 화면 만들기: odyssey-src/ 조각을 합쳐 odyssey/index.html을 만든다.

    python odyssey-src/build.py          # 만들기
    python odyssey-src/build.py --check  # 커밋 전 확인(다르면 실패, 파일은 안 바꿈)

게임은 예전과 똑같이 한 파일로 배포된다. 조각은 고치기 쉽게 나눈 원본이다.
__SCROLL_V(두루마리 캐시 번호)는 scrolls/*.js 내용으로 자동 계산한다.
"""
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT = os.path.join(REPO, 'odyssey', 'index.html')

# 합치는 순서. 게임 코드는 하나의 함수 안에서 돌아가므로 순서를 바꾸면 안 된다.
JS_PARTS = [
    '01-setup', '02-world', '03-player-camera', '04-village-ai',
    '05-input-skills', '06-moses-story', '07-moses-dialogue', '08-save-collect',
    '09-scroll-system', '10-craft-activity', '11-side-quests', '12-museum-map',
    '13-dialogue-ui', '14-plagues-events', '15-minigames', '16-main-loop',
]

# 두루마리 id → 파일. 새 편을 만들면 여기에 한 줄 더한다.
SCROLLS = {
    'devtest': 'devtest.js',
    'moses0': 'moses0.js',
    'sinai2': 'sinai2.js',
    'wild3': 'wild3.js',
    'joshua': 'joshua4.js',
    'judges': 'judges5.js',
    'ruth': 'ruth6.js',
    'saul': 'saul7.js',
}


def read(path):
    with open(path, 'rb') as f:
        return f.read().replace(b'\r\n', b'\n')


def scroll_line():
    versions = {}
    for sid, name in SCROLLS.items():
        data = read(os.path.join(REPO, 'odyssey', 'scrolls', name))
        versions[sid] = hashlib.md5(data).hexdigest()[:8]
    return ('<script>window.__SCROLL_V=%s;</script>\n' % json.dumps(versions)).encode('utf-8')


def build():
    pieces = [
        read(os.path.join(HERE, 'page-head.html')),
        read(os.path.join(HERE, 'game.css')),
        read(os.path.join(HERE, 'page-body.html')),
        scroll_line(),
        read(os.path.join(HERE, 'page-scripts.html')),
    ]
    pieces += [read(os.path.join(HERE, 'js', name + '.js')) for name in JS_PARTS]
    pieces.append(read(os.path.join(HERE, 'page-tail.html')))
    return b''.join(pieces)


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    data = build()
    current = read(OUT) if os.path.exists(OUT) else b''
    if '--check' in sys.argv:
        if data != current:
            print('odyssey/index.html이 odyssey-src 조각과 다릅니다. '
                  'index.html을 직접 고쳤거나 build.py를 안 돌렸습니다. '
                  '조각을 고친 뒤 python odyssey-src/build.py 를 돌리세요.')
            sys.exit(1)
        print('확인 완료: index.html과 조각이 일치합니다 (%d바이트)' % len(data))
        return
    with open(OUT, 'wb') as f:
        f.write(data)
    print('만듦: odyssey/index.html %d바이트%s' % (len(data), '' if data != current else ' (변경 없음)'))


if __name__ == '__main__':
    main()
