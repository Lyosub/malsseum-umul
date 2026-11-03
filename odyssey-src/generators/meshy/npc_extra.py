"""NPC 자율 행동용 동작 추가: 역할별 동작(Meshy 라이브러리) + 리깅 기본 걷기·달리기(무료).
결과: meshy/out/<name>/extra-<clip>.glb
"""
import json, os, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from batch import call, HERE

# 이름: [(저장할 클립 이름, 라이브러리 id)]
EXTRA = {
    'jethro':       [('Talk2', 310)],   # Talk_with_Left_Hand_Raised
    'elder':        [('Talk2', 313)],   # Talk_with_Hands_Open
    'blacksmith':   [('Work', 128)],    # Heavy_Hammer_Swing (망치질)
    'merchant':     [('Work', 278), ('Carry', 552)],  # 물건 고르기 / 물동이 들고 걷기
    'herbalist':    [('Work', 277)],    # 쪼그려 앉아 캐서 바구니에
    'shepherd-boy': [('Look', 341)],    # 천천히 걸으며 둘러보기
}
BASIC = ['aaron', 'child', 'shepherd-boy', 'merchant', 'guide-sage']  # 리깅 기본 걷기(+꼬마는 달리기)


def wait(tid):
    for _ in range(90):
        t = call("GET", f"/animations/{tid}")
        if t["status"] in ("SUCCEEDED", "FAILED", "CANCELED"):
            return t
        time.sleep(8)
    return {"status": "TIMEOUT"}


def extra(name, clip, aid):
    out = os.path.join(HERE, "out", name, f"extra-{clip}.glb")
    if os.path.exists(out):
        return name, clip, "already"
    rig = json.load(open(os.path.join(HERE, "out", name, "rig.json")))["rig"]
    t = wait(call("POST", "/animations", {"rig_task_id": rig["id"], "action_id": aid})["result"])
    if t["status"] != "SUCCEEDED":
        return name, clip, "FAILED " + str((t.get("task_error") or {}).get("message"))
    urllib.request.urlretrieve(t["result"]["animation_glb_url"], out)
    return name, clip, f"ok {t.get('consumed_credits')}cr"


def basic(name):
    rig = call("GET", f"/rigging/{json.load(open(os.path.join(HERE, 'out', name, 'rig.json')))['rig']['id']}")  # 서명 URL 새로 받기
    b = rig["result"]["basic_animations"]; res = []
    for clip, key in [("Walk", "walking_glb_url"), ("Run", "running_glb_url")]:
        if clip == "Run" and name != "child":
            continue
        out = os.path.join(HERE, "out", name, f"extra-{clip}.glb")
        if not os.path.exists(out):
            urllib.request.urlretrieve(b[key], out)
        res.append(clip)
    return name, "+".join(res), "ok basic"


if __name__ == "__main__":
    jobs = [(n, c, a) for n, lst in EXTRA.items() for c, a in lst]
    with ThreadPoolExecutor(max_workers=8) as ex:
        for r in ex.map(lambda j: extra(*j), jobs):
            print(*r, flush=True)
        for r in ex.map(basic, BASIC):
            print(*r, flush=True)
    print("balance", call("GET", "/balance"))
