"""궁전·애굽·히브리 새 NPC: 기본 걷기(무료) + 둘러보기(라이브러리 336)."""
import json, os, urllib.request
from concurrent.futures import ThreadPoolExecutor
from npc_extra import extra, HERE, call
from zone_assets import basic_walk
items = [i["name"] for i in json.load(open("batch-ch3.json", encoding="utf8")) if i["kind"] == "human"]
items = [n for n in items if os.path.exists(os.path.join(HERE, "out", n, "rig.json"))]
with ThreadPoolExecutor(max_workers=8) as ex:
    for r in ex.map(basic_walk, items): print(*r, flush=True)
    for r in ex.map(lambda n: extra(n, "LookAround", 336), items): print(*r, flush=True)
print("balance", call("GET", "/balance"))
