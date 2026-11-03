"""주인공(학생) 몸 모델 만들기: 이미지→3D → 뼈대(키 지정) → 학생과 같은 동작 6개 + 기본 걷기(무료).
동작: Idle(0) · Run_02(14) · Cheer_with_One_Hand_Up(306, 손 흔들기) · Stand_and_Chat(56) · Regular_Jump(466) · Male_Bend_Over_Pick_Up(276, 파기)
사용법: python char_batch.py <목록.json>   목록: [{"name": "char-base-boy", "src": "...png", "h": 1.6}, ...]
결과: meshy/out/<name>/anims.glb(동작 6개), walk.glb(기본 걷기)
"""
import json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from batch import run as convert, call, HERE

ACTIONS = [0, 14, 306, 56, 466, 276]


def wait(kind, tid):
    for _ in range(120):
        t = call("GET", f"/{kind}/{tid}")
        if t["status"] in ("SUCCEEDED", "FAILED", "CANCELED"):
            return t
        time.sleep(8)
    return {"status": "TIMEOUT"}


def run(item):
    name = item["name"]; out = os.path.join(HERE, "out", name)
    r = convert({**item, "kind": "human"})
    if not r[1].startswith(("ok", "skip")):
        return name, "MODEL " + r[1]
    if os.path.exists(os.path.join(out, "anims.glb")):
        return name, "already"
    task = json.load(open(os.path.join(out, "task.json")))
    rig = wait("rigging", call("POST", "/rigging", {"input_task_id": task["id"], "height_meters": item.get("h", 1.6)})["result"])
    if rig["status"] != "SUCCEEDED":
        return name, "RIG " + str((rig.get("task_error") or {}).get("message"))
    urllib.request.urlretrieve(rig["result"]["basic_animations"]["walking_glb_url"], os.path.join(out, "walk.glb"))
    anim = wait("animations", call("POST", "/animations", {"rig_task_id": rig["id"], "action_ids": ACTIONS})["result"])
    json.dump({"rig": rig, "anim": anim}, open(os.path.join(out, "rig.json"), "w"), indent=1)
    if anim["status"] != "SUCCEEDED":
        return name, "ANIM " + str((anim.get("task_error") or {}).get("message"))
    urllib.request.urlretrieve(anim["result"]["animation_glb_url"], os.path.join(out, "anims.glb"))
    return name, f"ok model+rig {rig.get('consumed_credits')} + anim {anim.get('consumed_credits')}"


if __name__ == "__main__":
    items = json.load(open(sys.argv[1], encoding="utf8"))
    with ThreadPoolExecutor(max_workers=4) as ex:
        for name, res in ex.map(run, items):
            print(name, res, flush=True)
    print("balance", call("GET", "/balance"))
