import json, sys, time, urllib.request
K=open(r"C:\Users\User\AppData\Local\Temp\claude\E---------NEW-BRAIN\8b7eb239-c6ae-4e1a-a042-de8922b8d47b\scratchpad\meshy.key").read().strip()
kind, tid = sys.argv[1], sys.argv[2]
for i in range(120):
    r=json.loads(urllib.request.urlopen(urllib.request.Request(f"https://api.meshy.ai/openapi/v1/{kind}/{tid}",headers={"Authorization":"Bearer "+K})).read())
    print(r.get("status"), r.get("progress"), flush=True)
    if r.get("status") in ("SUCCEEDED","FAILED","CANCELED"):
        json.dump(r, open(f"{kind}-{tid}.json","w"), indent=1); print(json.dumps({k:r.get(k) for k in ("consumed_credits","task_error")})); break
    time.sleep(10)
