"""batch.py 로 만든 사람형 모델에 자동 리깅 + 대기(Idle)·대화(Stand_and_Chat) 동작을 붙인다.
사용법: python rig_batch.py <목록.json>
결과: meshy/out/<name>/rigged.glb (모델+동작 2개), rig.json
"""
import json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from batch import call, HERE

HEIGHTS = {"child": 1.2, "shepherd-boy": 1.45, "miriam": 1.6, "herbalist": 1.55, "merchant": 1.65}  # 나머지 어른은 1.75


def wait(kind, tid):
    for _ in range(90):
        t = call("GET", f"/{kind}/{tid}")
        if t["status"] in ("SUCCEEDED", "FAILED", "CANCELED"):
            return t
        time.sleep(8)
    return {"status": "TIMEOUT"}


def run(item):
    out = os.path.join(HERE, "out", item["name"])
    if item.get("kind") != "human" or not os.path.exists(os.path.join(out, "task.json")):
        return item["name"], "skip"
    if os.path.exists(os.path.join(out, "rigged.glb")):
        return item["name"], "already"
    task = json.load(open(os.path.join(out, "task.json")))
    if task.get("status") != "SUCCEEDED":
        return item["name"], "no model"
    rig = wait("rigging", call("POST", "/rigging", {"input_task_id": task["id"], "height_meters": item.get("h", HEIGHTS.get(item["name"], 1.75))})["result"])
    if rig["status"] != "SUCCEEDED":
        return item["name"], "RIG FAILED " + str((rig.get("task_error") or {}).get("message"))
    anim = wait("animations", call("POST", "/animations", {"rig_task_id": rig["id"], "action_ids": [0, 56]})["result"])
    json.dump({"rig": rig, "anim": anim}, open(os.path.join(out, "rig.json"), "w"), indent=1)
    if anim["status"] != "SUCCEEDED":
        # 동작 실패 시 리깅 모델(기본 걷기 포함)이라도 받아 둔다
        urllib.request.urlretrieve(rig["result"]["basic_animations"]["walking_glb_url"], os.path.join(out, "rigged-walk.glb"))
        return item["name"], "ANIM FAILED " + str((anim.get("task_error") or {}).get("message"))
    urllib.request.urlretrieve(anim["result"]["animation_glb_url"], os.path.join(out, "rigged.glb"))
    return item["name"], f"ok rig {rig.get('consumed_credits')} + anim {anim.get('consumed_credits')}"


if __name__ == "__main__":
    items = json.load(open(sys.argv[1], encoding="utf8"))
    with ThreadPoolExecutor(max_workers=8) as ex:
        for name, res in ex.map(run, items):
            print(name, res, flush=True)
    print("balance", call("GET", "/balance"))
