"""Meshy 이미지→3D 일괄 변환.
사용법: python batch.py <목록.json>
목록: [{"name": "moses", "src": "원화 경로", "kind": "human"|"prop", "poly": 8000}, ...]
결과: meshy/out/<name>/model.glb, views.png, task.json  (이미 있으면 건너뜀)
"""
import base64, io, json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

KEY = os.environ.get("MESHY_KEY") or open(r"C:\Users\User\AppData\Local\Temp\claude\E---------NEW-BRAIN\8b7eb239-c6ae-4e1a-a042-de8922b8d47b\scratchpad\meshy.key").read().strip()
H = {"Authorization": "Bearer " + KEY, "Content-Type": "application/json"}
API = "https://api.meshy.ai/openapi/v1"
HERE = os.path.dirname(os.path.abspath(__file__))


def call(method, path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None, headers=H, method=method)
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


def data_uri(path):
    im = Image.open(path)
    if im.mode == "RGBA":  # 투명 배경은 밝은 단색으로 깔아서 보냄
        bg = Image.new("RGB", im.size, (242, 236, 226)); bg.paste(im, mask=im.getchannel("A")); im = bg
    im = im.convert("RGB")
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=92)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def run(item):
    out = os.path.join(HERE, "out", item["name"]); os.makedirs(out, exist_ok=True)
    if os.path.exists(os.path.join(out, "model.glb")):
        return item["name"], "skip"
    human = item.get("kind") == "human"
    body = {"image_url": data_uri(item["src"]), "ai_model": "latest", "should_remesh": True, "topology": "triangle",
            "target_polycount": item.get("poly", 8000 if human else 3000), "should_texture": True, "enable_pbr": False,
            "texture_resolution": "2k", "target_formats": ["glb"], "multi_view_thumbnails": True}
    if human:
        body["pose_mode"] = "a-pose"
    tid = call("POST", "/image-to-3d", body)["result"]
    for _ in range(90):
        t = call("GET", f"/image-to-3d/{tid}")
        if t["status"] in ("SUCCEEDED", "FAILED", "CANCELED"):
            break
        time.sleep(10)
    json.dump(t, open(os.path.join(out, "task.json"), "w"), indent=1)
    if t["status"] != "SUCCEEDED":
        return item["name"], "FAILED " + str((t.get("task_error") or {}).get("message"))
    urllib.request.urlretrieve(t["model_urls"]["glb"], os.path.join(out, "model.glb"))
    views = []
    for k in ["front", "right", "back", "left"]:
        u = (t.get("thumbnail_urls") or {}).get(k)
        if u:
            p = os.path.join(out, f"{k}.png"); urllib.request.urlretrieve(u, p); views.append(Image.open(p).convert("RGB"))
    if views:
        h = 360; views = [v.resize((round(v.width * h / v.height), h)) for v in views]
        sheet = Image.new("RGB", (sum(v.width for v in views), h)); x = 0
        for v in views: sheet.paste(v, (x, 0)); x += v.width
        sheet.save(os.path.join(out, "views.png"))
    return item["name"], f"ok {t.get('consumed_credits')}cr"


if __name__ == "__main__":
    items = json.load(open(sys.argv[1], encoding="utf8"))
    with ThreadPoolExecutor(max_workers=8) as ex:
        for name, res in ex.map(run, items):
            print(name, res, flush=True)
    print("balance", call("GET", "/balance"))
