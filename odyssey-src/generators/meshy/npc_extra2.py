"""마을 생활 AI용 동작 추가 2차: 모든 NPC 걷기(무료) + 둘러보기·줍기·대화 변형·폴짝 뛰기(라이브러리)."""
import json, os
from concurrent.futures import ThreadPoolExecutor
from npc_extra import extra, HERE, call
import urllib.request

EXTRA2 = {
    'moses':        [('LookAround', 336), ('Talk3', 313)],
    'aaron':        [('LookAround', 336), ('Talk3', 313)],
    'jethro':       [('LookAround', 336), ('PickUp', 276)],
    'elder':        [('LookAround', 336)],
    'guide-sage':   [('LookAround', 336)],
    'blacksmith':   [('LookAround', 336), ('PickUp', 276), ('Talk3', 313)],
    'merchant':     [('LookAround', 336), ('PickUp', 281), ('Talk3', 313)],
    'herbalist':    [('LookAround', 336), ('PickUp', 281)],
    'shepherd-boy': [('LookAround', 336), ('PickUp', 276)],
    'child':        [('LookAround', 336), ('Hop', 44)],   # Happy_jump_f
}
NEED_WALK = ['moses', 'jethro', 'elder', 'blacksmith', 'herbalist']


def basic_walk(name):
    out = os.path.join(HERE, "out", name, "extra-Walk.glb")
    if os.path.exists(out):
        return name, "Walk", "already"
    rid = json.load(open(os.path.join(HERE, "out", name, "rig.json")))["rig"]["id"]
    rig = call("GET", f"/rigging/{rid}")
    urllib.request.urlretrieve(rig["result"]["basic_animations"]["walking_glb_url"], out)
    return name, "Walk", "ok basic"


if __name__ == "__main__":
    jobs = [(n, c, a) for n, lst in EXTRA2.items() for c, a in lst]
    with ThreadPoolExecutor(max_workers=8) as ex:
        for r in ex.map(lambda j: extra(*j), jobs):
            print(*r, flush=True)
        for r in ex.map(basic_walk, NEED_WALK):
            print(*r, flush=True)
    print("balance", call("GET", "/balance"))
