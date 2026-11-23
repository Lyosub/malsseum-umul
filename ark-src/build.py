#!/usr/bin/env python3
"""나그네 마을 게임 파일 만들기: ark-src/js/ 조각을 합쳐 assets/ark-game.js를 만든다.

    python ark-src/build.py          # 만들기(ark.html의 ?v= 캐시 번호도 내용에 맞게 바꿈)
    python ark-src/build.py --check  # 커밋 전 확인(다르면 실패, 파일은 안 바꿈)

게임은 예전과 똑같이 파일 하나로 배포된다. 코드 전체가 하나의 함수 안에서 변수를 공유하므로
조각끼리 자유롭게 부를 수 있지만, 조각 하나만 따로 실행할 수는 없다. 순서를 바꾸지 않는다.
"""
import hashlib
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT = os.path.join(REPO, 'assets', 'ark-game.js')
PAGE = os.path.join(REPO, 'ark.html')

PARTS = [
    '01-textures', '01b-sprites', '01c-gpt-tex', '02-blocks', '03-world-gen', '04-mesh', '05-people-player',
    '06-bag-craft-sound', '07-screen-input-aim', '08-mine-place-save', '09-panels',
    '10-animals-cards-ride', '11-day-map-stream', '12-start', '13-life', '14-journey',
    '15-together', '15b-adventure', '15c-team', '15d-play', '15e-fun', '17-far-lands', '16-social-seasons',
]


def read(path):
    with open(path, 'rb') as f:
        return f.read().replace(b'\r\n', b'\n')


def build_js():
    return b''.join(read(os.path.join(HERE, 'js', p + '.js')) for p in PARTS)


def page_with_version(js):
    v = hashlib.md5(js).hexdigest()[:10]
    with open(PAGE, 'rb') as f:
        page = f.read()
    new, n = re.subn(rb'assets/ark-game\.js\?v=[^"\']*', b'assets/ark-game.js?v=' + v.encode(), page)
    if n != 1:
        sys.exit('ark.html에서 ark-game.js 줄을 찾지 못함')
    return page, new


def main():
    js = build_js()
    page, new_page = page_with_version(js)
    if '--check' in sys.argv:
        bad = []
        if read(OUT) != js:
            bad.append('assets/ark-game.js가 ark-src/js 조각과 다름 — 조각을 고치고 python ark-src/build.py를 돌릴 것')
        if page != new_page:
            bad.append('ark.html의 ark-game.js?v= 번호가 내용과 다름 — python ark-src/build.py를 돌릴 것')
        if bad:
            print('\n'.join(bad))
            sys.exit(1)
        print('ok — 조각과 게임 파일이 같음')
        return
    with open(OUT, 'wb') as f:
        f.write(js)
    if page != new_page:
        with open(PAGE, 'wb') as f:
            f.write(new_page)
    print('만듦: assets/ark-game.js (%d줄), ark.html 캐시 번호 %s' % (js.count(b'\n'), hashlib.md5(js).hexdigest()[:10]))


if __name__ == '__main__':
    main()
