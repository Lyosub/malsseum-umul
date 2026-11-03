"""2단계 존 준비: 포털 3D 변환 + 애굽 사람 4명 동작(걷기 무료, 둘러보기·줍기)."""
import json, os, urllib.request
from concurrent.futures import ThreadPoolExecutor
from batch import run as convert
from npc_extra import extra, HERE, call

G = r"E:\temp\claude-work\exodus-game"
EXTRA = {
    'miriam':  [('LookAround', 336), ('PickUp', 281)],
    'hur':     [('LookAround', 336), ('PickUp', 276)],
    'joshua':  [('LookAround', 336), ('PickUp', 276)],
    'pharaoh': [('LookAround', 336)],
}


def basic_walk(name):
    out = os.path.join(HERE, "out", name, "extra-Walk.glb")
    if os.path.exists(out):
        return name, "Walk", "already"
    rid = json.load(open(os.path.join(HERE, "out", name, "rig.json")))["rig"]["id"]
    rig = call("GET", f"/rigging/{rid}")
    urllib.request.urlretrieve(rig["result"]["basic_animations"]["walking_glb_url"], out)
    return name, "Walk", "ok basic"


if __name__ == "__main__":
    print(*convert({"name": "prop-portal", "src": os.path.join(G, "world", "portal-gate.png"), "kind": "prop", "poly": 4000}), flush=True)
    jobs = [(n, c, a) for n, lst in EXTRA.items() for c, a in lst]
    with ThreadPoolExecutor(max_workers=8) as ex:
        for r in ex.map(lambda j: extra(*j), jobs):
            print(*r, flush=True)
        for r in ex.map(basic_walk, list(EXTRA)):
            print(*r, flush=True)
    print("balance", call("GET", "/balance"))
