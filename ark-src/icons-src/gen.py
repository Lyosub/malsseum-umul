from slice import slice_sheet
S=[('아이콘1_무기탈것.png',['sword','sling','shield','bow','arrow','boat','bed','cart','rail','shard']),
   ('아이콘2_도구전신갑주.png',['pick','axe','shovel','knife','helmG','plateG','beltG','bootG','shieldG']),
   ('아이콘3_가구옷.png',['chair','table','chest','oillamp','cap','helmCu','helmFe','crown','tunicL','tunicW','coat','mailCu','mailFe','sandal','clog'])]
CH='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*+-/:;<=>?@^_~'
lines=[]
for fn,names in S:
    for name,(w,h,g) in zip(names,slice_sheet(fn,len(names))):
        assert w<=16 and h<=16,(name,w,h)
        ox=(16-w)//2; oy=(16-h)//2; pal=[]; s=''
        grid=[[None]*16 for _ in range(16)]
        for y in range(h):
            for x in range(w): grid[oy+y][ox+x]=g[y][x]
        for y in range(16):
            for x in range(16):
                c=grid[y][x]
                if c is None: s+='.'; continue
                hx=(c[0]<<16)|(c[1]<<8)|c[2]
                if hx not in pal: pal.append(hx)
                s+=CH[pal.index(hx)]
        assert len(pal)<=len(CH),(name,len(pal))
        lines.append("    %s: [[%s], '%s']" % (name, ','.join('0x%06x'%p for p in pal), s))
js = """  // ── 11/21 GPT가 그린 물건 아이콘(전도사님 요청, 원본 E:/temp/claude-work/ark-icons/) — 16×16, '.'은 빈칸 ──
  //    회색(쇠·돌) 부분은 재료 색으로 바꿔 칠한다(도구 여섯 단계 · 무기 일곱 재료)
  var SPR_CH = '%s';
  var SPR = {
%s
  };
  var SPR_ICON = {};   // 블록(침대·의자 등)의 가방 아이콘을 이 그림으로
  function sprPaint(name, col, tint) {
    var d = SPR[name], pal = d[0], s = d[1], cr = col >> 16 & 255, cg = col >> 8 & 255, cb = col & 255;
    return function (px) {
      clear(px);
      for (var i = 0; i < 256; i++) {
        var ch = s.charAt(i); if (ch === '.') continue;
        var c = pal[SPR_CH.indexOf(ch)], r = c >> 16 & 255, g = c >> 8 & 255, b = c & 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (r + g + b) / 3;
        if (col !== undefined && mx - mn < 22 && l > 75 && l < 205) { var k = l / 165; c = (clamp255(cr * k) << 16) | (clamp255(cg * k) << 8) | clamp255(cb * k); }
        else if (col !== undefined && tint && mx - mn >= 22 && l > 70 && r > b) { var k2 = l / 150, t = tint; c = (clamp255(r * (1 - t) + cr * k2 * t) << 16) | (clamp255(g * (1 - t) + cg * k2 * t) << 8) | clamp255(b * (1 - t) + cb * k2 * t); }
        px(i & 15, i >> 4, c);
      }
    };
  }
  function applySprites() {
    function re(tn, name, col, tint) { if (TILE[tn] !== undefined && SPR[name]) tile(tn, sprPaint(name, col, tint)); }
    ARM_COL.forEach(function (col, m) {
      re('arm' + (ARM_SWORD0 + m), 'sword', col); re('arm' + (ARM_SLING0 + m), 'sling', col); re('arm' + (ARM_BOW0 + m), 'bow', col);
      re('arm' + (ARM_ARROW0 + m), 'arrow', col); re('wear' + (ARM_SHIELD0 + m), 'shield', col, 0.45);
    });
    re('sword', 'sword', 0xf6e7a8); re('word' + SLING, 'sling'); re('bow' + BOW, 'bow'); re('bow' + ARROW, 'arrow');
    re('bow' + CART, 'cart'); re('bow' + SHARD, 'shard'); re('boat' + BOAT, 'boat');
    re('wear156', 'shield'); re('wear157', 'shield', 0xc8ccd2, 0.45);
    var TIER_COL = [0xa77a48, 0x8f8f8b, 0xc8743a, 0xd0d4da, 0xb57ad8, 0x6ff0e6];
    TOOL_TYPES.forEach(function (type) { for (var tier = 0; tier < 6; tier++) re('tool_' + type + tier, type, TIER_COL[tier]); });
    [[144, 'helmG'], [150, 'plateG'], [152, 'beltG'], [155, 'bootG'], [158, 'shieldG'], [140, 'cap'], [141, 'helmCu'], [142, 'helmFe'], [143, 'crown'],
     [145, 'tunicL'], [146, 'tunicW'], [147, 'coat'], [148, 'mailCu'], [149, 'mailFe'], [153, 'sandal'], [154, 'clog']].forEach(function (w) { re('wear' + w[0], w[1]); });
    [[BED, 'bed'], [RAIL0, 'rail'], [CHAIR, 'chair'], [FEAST_TABLE, 'table'], [CHEST, 'chest'], [OIL_LAMP, 'oillamp']].forEach(function (b) { tile('spr_' + b[1], sprPaint(b[1])); SPR_ICON[b[0]] = 'spr_' + b[1]; });
    tile('spr_railF', sprPaint('rail', 0xf3c83c)); SPR_ICON[RAILF0] = 'spr_railF';
  }
""" % (CH, ',\n'.join(lines))
open('out/01b-sprites.js','w',encoding='utf-8').write(js)
print(len(js))
