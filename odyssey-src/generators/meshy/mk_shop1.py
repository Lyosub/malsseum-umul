import json, os
G = r"E:\temp\claude-work\exodus-game"
it = [{"name": "shop-staff-" + n, "src": os.path.join(G, "staffs", n + ".png"), "kind": "prop", "poly": 1500} for n in ["shepherd", "budding", "forked", "birch"]]
it += [{"name": "shop-pet-" + n, "src": os.path.join(G, "pets", n + ".png"), "kind": "prop", "poly": 3000} for n in ["donkey", "dove", "puppy"]]
assert all(os.path.exists(i["src"]) for i in it)
json.dump(it, open(os.path.join(G, "meshy", "batch-shop1.json"), "w"), indent=1)
print(len(it))
