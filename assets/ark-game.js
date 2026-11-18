/* 나그네 마을(옛 이름 방주 마을) (1단계 v3) — 블록 월드, 창세기 6장 크기의 방주 구경, 자원 캐기·만들기, 내 땅에 집 짓기.
   v2(2026-11-18): 1블록 = 1규빗(사람 키 약 3.4칸) · 픽셀 무늬 블록 · 1인칭/3인칭 · 가로 화면 · 마인크래프트식 화면.
   v3(2026-11-18): 서쪽 돌산 · 동쪽 숲 · 남쪽 호수 · 역청 구덩이(창 14:10), 꾹 눌러 캐기, 가방, 만들기, 지으면 가방에서 줄어듦.
   3D는 In Odyssey의 three-bundle(window.THREE). 무늬는 모두 코드로 그린 말씀우물 고유 그림. */
(function () {
  'use strict';
  var THREE = window.THREE;
  function $(id) { return document.getElementById(id); }
  function clamp255(v) { return v < 0 ? 0 : (v > 255 ? 255 : v | 0); }
  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  // ───────── 블록 무늬(16×16 픽셀, 코드로 그림) ─────────
  var TS = 16, ACOLS = 8, AROWS = 24, TILE = {}, TILE_AVG = [], tileCount = 0;
  var atlas = document.createElement('canvas'); atlas.width = TS * ACOLS; atlas.height = TS * AROWS;
  var actx = atlas.getContext('2d');
  function mkRand(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function tile(name, fn) {
    var i = tileCount++, img = actx.createImageData(TS, TS), R = mkRand(i * 9973 + 17);
    function px(x, y, hex, k, a) {
      if (x < 0 || y < 0 || x >= TS || y >= TS) return;
      var o = (y * TS + x) * 4; k = k === undefined ? 1 : k;
      img.data[o] = clamp255(((hex >> 16) & 255) * k); img.data[o + 1] = clamp255(((hex >> 8) & 255) * k);
      img.data[o + 2] = clamp255((hex & 255) * k); img.data[o + 3] = a === undefined ? 255 : a;
    }
    function noise(hex, amp) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, hex, 1 + (R() - 0.5) * amp); }
    fn(px, R, noise);
    actx.putImageData(img, (i % ACOLS) * TS, Math.floor(i / ACOLS) * TS);
    var r = 0, g = 0, b = 0, n = 0;
    for (var o = 0; o < img.data.length; o += 4) if (img.data[o + 3] > 128) { r += img.data[o]; g += img.data[o + 1]; b += img.data[o + 2]; n++; }
    TILE_AVG[i] = n ? ((r / n) << 16) | ((g / n) << 8) | (b / n) : 0xdddddd;
    TILE[name] = i;
  }
  function planks(base, contrast) {
    return function (px, R) {
      for (var y = 0; y < TS; y++) {
        var bd = y >> 2, seam = (bd * 7 + 3) % 16;
        for (var x = 0; x < TS; x++) {
          var k = 1 + Math.sin(x * 0.8 + bd * 2.1) * 0.035 * contrast + (R() - 0.5) * 0.08 * contrast;
          if (y % 4 === 3) k *= 1 - 0.28 * contrast; else if (x === seam) k *= 1 - 0.22 * contrast;
          if (y % 4 === 0) k *= 1 + 0.06 * contrast;
          px(x, y, base, k);
        }
      }
    };
  }
  function grassTop(px, R) {
    for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
      var v = R(), k = 0.9 + v * 0.22; if (v < 0.07) k = 0.78; if (v > 0.95) k = 1.18; px(x, y, 0x6cae4b, k);
    }
  }
  function dirt(px, R) {
    for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
      var v = R(), k = 0.9 + v * 0.18; if (v < 0.1) k = 0.74; if (v > 0.96) k = 1.22; px(x, y, 0x8a6847, k);
    }
  }
  function cloth(base) {
    return function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var k = 0.95 + R() * 0.09; if ((x + y * 3) % 5 === 0) k -= 0.05; if ((x * 3 + y) % 7 === 0) k += 0.04; px(x, y, base, k);
      }
    };
  }
  function clear(px) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0, 1, 0); }
  function buildTiles() {
    tile('grassTop', grassTop);
    tile('dirt', dirt);
    tile('grassSide', function (px, R) {
      dirt(px, R);
      for (var x = 0; x < TS; x++) {
        var h = 3 + (R() < 0.5 ? 1 : 0) + (R() < 0.25 ? 1 : 0);
        for (var y = 0; y < h; y++) px(x, y, 0x6cae4b, 0.88 + R() * 0.2);
      }
    });
    tile('stone', function (px, R, noise) {
      noise(0x8f8f8b, 0.14);
      for (var b = 0; b < 7; b++) {
        var cx = R() * 16 | 0, cy = R() * 16 | 0, k = R() < 0.5 ? 0.82 : 1.1;
        for (var d = 0; d < 4; d++) px((cx + (d & 1)) % 16, (cy + (d >> 1)) % 16, 0x8f8f8b, k + (R() - 0.5) * 0.05);
      }
    });
    tile('sand', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var v = R(); px(x, y, 0xe2cf98, v < 0.08 ? 0.9 : 0.97 + v * 0.06); }
    });
    tile('plankG', planks(0xc79a5f, 1));
    tile('plankP', planks(0x4a3526, 1.2));
    tile('logTop', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var d = Math.hypot(x - 7.5, y - 7.5);
        if (d > 6.6) px(x, y, 0x6a4a2c, 0.9 + R() * 0.15);
        else px(x, y, 0xb88f58, (Math.floor(d * 0.9) % 2 ? 0.88 : 1.0) + (R() - 0.5) * 0.06);
      }
    });
    tile('logSide', function (px, R) {
      var col = []; for (var x = 0; x < TS; x++) col.push(0.82 + R() * 0.3);
      for (var y = 0; y < TS; y++) for (var x2 = 0; x2 < TS; x2++) {
        var k = col[x2] + (R() - 0.5) * 0.1; if (R() < 0.05) k *= 0.75; px(x2, y, 0x6b4b2c, k);
      }
    });
    tile('leaves', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var v = R(), k = 0.85 + v * 0.3; if (v < 0.13) k = 0.55; if (v > 0.93) k = 1.25; px(x, y, 0x4c9a3c, k);
      }
    });
    tile('glass', function (px) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var edge = x === 0 || y === 0 || x === 15 || y === 15;
        var streak = (x - y === 3 && x > 3 && x < 9) || (x - y === 6 && x > 8 && x < 13);
        if (edge) px(x, y, 0xe3f4f9, 1, 230); else if (streak) px(x, y, 0xffffff, 1, 170); else px(x, y, 0xcfeaf3, 1, 46);
      }
    });
    tile('lamp', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var edge = x < 2 || y < 2 || x > 13 || y > 13, bar = x === 7 || x === 8 || y === 7 || y === 8;
        if (edge) px(x, y, 0x5b3f22, 0.9 + R() * 0.2);
        else if (bar) px(x, y, 0x7a5530, 1);
        else { var d = Math.hypot(x - 7.5, y - 7.5); px(x, y, d < 4 ? 0xfff4c8 : 0xffd877, 1 + (R() - 0.5) * 0.05); }
      }
    });
    tile('lampTop', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var edge = x < 2 || y < 2 || x > 13 || y > 13;
        px(x, y, edge ? 0x5b3f22 : 0xffe49a, edge ? 0.9 + R() * 0.2 : 1);
      }
    });
    tile('plaster', function (px, R, noise) { noise(0xeee8da, 0.06); });
    tile('brick', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var row = y >> 2, mortar = y % 4 === 3 || (x + (row % 2) * 4) % 8 === 7;
        if (mortar) px(x, y, 0xcdbfa9, 0.95 + R() * 0.08); else px(x, y, 0xa84c38, 0.88 + R() * 0.2);
      }
    });
    tile('roof', function (px, R) {
      var rk = [1.14, 1.04, 0.95, 0.68];
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var row = y >> 2, k = rk[y % 4] + (R() - 0.5) * 0.06; if ((x + (row % 2) * 2) % 4 === 0) k *= 0.84; px(x, y, 0x5a6472, k);
      }
    });
    tile('clothB', cloth(0x7cc3e6)); tile('clothY', cloth(0xf0cc52)); tile('clothP', cloth(0xeea0b6)); tile('clothG', cloth(0x66b569));
    tile('gravel', function (px, R) {
      var ks = [0.72, 0.86, 1, 1.1, 1.22];
      for (var y = 0; y < TS; y += 2) for (var x = 0; x < TS; x += 2) {
        var k = ks[R() * 5 | 0];
        for (var d = 0; d < 4; d++) px(x + (d & 1), y + (d >> 1), 0xb2a790, k + (R() - 0.5) * 0.06);
      }
    });
    tile('flowerTop', function (px, R) {
      grassTop(px, R);
      var fc = [0xe2524a, 0xf4d03f, 0xffffff, 0xee8fc0];
      [[3, 3], [11, 4], [6, 10], [12, 12], [2, 13]].forEach(function (p, i) {
        var c = fc[i % 4];
        px(p[0], p[1], 0xf7c948); px(p[0] - 1, p[1], c); px(p[0] + 1, p[1], c); px(p[0], p[1] - 1, c); px(p[0], p[1] + 1, c);
      });
    });
    tile('mudbrick', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var row = y >> 3, mortar = y % 8 === 7 || (x + row * 8) % 16 === 15;
        if (mortar) px(x, y, 0x8a6a46, 0.95 + R() * 0.1); else px(x, y, 0xbf9566, 0.9 + R() * 0.16);
      }
    });
    tile('limestone', function (px, R, noise) {
      noise(0xe0d8c3, 0.07);
      var x = 2, y = 5; for (var i = 0; i < 12; i++) { px(x, y, 0xe0d8c3, 0.86); x = (x + 1) % 16; y = Math.max(0, Math.min(15, y + (R() < 0.5 ? -1 : 1) * (R() < 0.5 ? 1 : 0))); }
    });
    tile('thatch', function (px, R) {
      var col = []; for (var x = 0; x < TS; x++) col.push(0.84 + R() * 0.3);
      for (var y = 0; y < TS; y++) for (var x2 = 0; x2 < TS; x2++) {
        var k = col[x2] + (R() - 0.5) * 0.12; if (y === 7 || y === 15) k *= 0.7; px(x2, y, 0xc8a65a, k);
      }
    });
    tile('basalt', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var v = R(); px(x, y, 0x4a4a52, v < 0.12 ? 0.75 : 0.92 + v * 0.16); }
    });
    tile('water', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var wave = (y + Math.round(Math.sin(x * 0.7) * 1.5)) % 6 === 0;
        px(x, y, 0x3d7fc6, wave ? 1.25 : 0.95 + R() * 0.08, wave ? 190 : 160);
      }
    });
    tile('reed', function (px, R) {
      clear(px);
      [1, 4, 6, 9, 11, 14].forEach(function (sx, i) {
        var top = 1 + (R() * 5 | 0);
        for (var y = top; y < TS; y++) px(sx + (y < 6 && i % 2 ? 1 : 0), y, 0x7a9a3c, 0.85 + R() * 0.3);
        for (var t = 0; t < 3; t++) { px(sx, top + t, 0x7a5430, 0.9 + R() * 0.2); px(sx + 1, top + t, 0x6a4628, 0.9 + R() * 0.2); }
      });
    });
    tile('flowerPlant', function (px, R) {
      clear(px);
      var fc = [0xe2524a, 0xf4d03f, 0xffffff, 0xee8fc0, 0x8a7be0];
      [[3, 5], [8, 3], [12, 6], [6, 8]].forEach(function (p, i) {
        for (var y = p[1] + 1; y < TS; y++) px(p[0], y, 0x4f9a3c, 0.85 + R() * 0.3);
        px(p[0] + 1, p[1] + 6, 0x5fae48); px(p[0] - 1, p[1] + 8, 0x5fae48);
        var c = fc[(i * 2 + (R() * 3 | 0)) % fc.length];
        px(p[0], p[1], 0xf7c948); px(p[0] - 1, p[1], c); px(p[0] + 1, p[1], c); px(p[0], p[1] - 1, c); px(p[0], p[1] + 1, c);
      });
    });
    tile('clay', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var v = R(); px(x, y, 0x9aa1aa, v < 0.08 ? 0.86 : 0.95 + v * 0.1); }
    });
    tile('tar', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var v = R(), shine = (x + y * 2) % 11 === 0 && v > 0.4;
        px(x, y, shine ? 0x6b6258 : 0x1f1b18, shine ? 1 : 0.85 + v * 0.3);
      }
    });
    tile('snow', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0xf2f6fa, 0.95 + R() * 0.07); });
    tile('snowSide', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0x8f8f8b, 0.86 + R() * 0.2);
      for (var x2 = 0; x2 < TS; x2++) { var hh = 3 + (R() < 0.5 ? 1 : 0); for (var y2 = 0; y2 < hh; y2++) px(x2, y2, 0xf2f6fa, 0.95 + R() * 0.07); }
    });
    // 광석: 바탕(돌/깊은 돌) + 광물마다 다른 모양
    function stoneBase(px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0x8f8f8b, 1 + (R() - 0.5) * 0.14);
      for (var b = 0; b < 6; b++) { var cx = R() * 16 | 0, cy = R() * 16 | 0, k = R() < 0.5 ? 0.82 : 1.1; for (var d = 0; d < 4; d++) px((cx + (d & 1)) % 16, (cy + (d >> 1)) % 16, 0x8f8f8b, k); }
    }
    function deepBase(px, R) {
      for (var y = 0; y < TS; y++) { var rk = y % 4 === 0 ? 0.82 : 1; for (var x = 0; x < TS; x++) px(x, y, 0x5c5d63, rk * (0.9 + R() * 0.16)); }
    }
    // 광물 모양들(x, y는 그 알갱이 자리)
    var ORE_ART = {
      // 석탄: 울퉁불퉁 큰 검은 덩이
      coal: function (px, R) {
        [[2, 2], [9, 1], [5, 8], [11, 9], [2, 12]].forEach(function (c) {
          for (var dy = 0; dy < 3; dy++) for (var dx = 0; dx < 4; dx++) { if ((dx === 0 || dx === 3) && (dy === 0 || dy === 2) && R() < 0.7) continue; px(c[0] + dx, c[1] + dy, 0x1c1a18, 0.8 + R() * 0.4); }
          px(c[0] + 1, c[1], 0x4a4744);
        });
      },
      // 구리: 주황 줄무늬 결 + 푸른 녹(초록) 점
      copper: function (px, R) {
        [[2, 3, 1], [9, 2, -1], [5, 10, 1], [11, 10, -1]].forEach(function (c) {
          for (var i = 0; i < 4; i++) { px(c[0] + i, c[1] + (c[2] > 0 ? (i >> 1) : -(i >> 1)), 0xd87a3a, i === 0 ? 1.25 : 0.9 + R() * 0.2); px(c[0] + i, c[1] + 1 + (c[2] > 0 ? (i >> 1) : -(i >> 1)), 0xa8552a); }
          px(c[0] + 4, c[1], 0x5fb08c); px(c[0] - 1, c[1] + 1, 0x4f9a7a);
        });
      },
      // 철: 살구빛 작은 알갱이 무리(밝은 위·어두운 아래)
      iron: function (px) {
        [[3, 2], [5, 4], [11, 3], [9, 9], [12, 11], [3, 10], [5, 12]].forEach(function (c) {
          px(c[0], c[1], 0xf0d2b2); px(c[0] + 1, c[1], 0xdcb08a); px(c[0], c[1] + 1, 0xdcb08a); px(c[0] + 1, c[1] + 1, 0x9a7254);
        });
      },
      // 은: 반짝이는 십자 조각
      silver: function (px) {
        [[3, 3], [11, 2], [7, 8], [12, 12], [3, 12]].forEach(function (c) {
          px(c[0], c[1], 0xffffff); px(c[0] - 1, c[1], 0xdfe6ee); px(c[0] + 1, c[1], 0xdfe6ee); px(c[0], c[1] - 1, 0xdfe6ee); px(c[0], c[1] + 1, 0xb8c0ca); px(c[0] + 1, c[1] + 1, 0x7f8790);
        });
      },
      // 금: 굵은 금덩이(빛 받은 면 + 그늘)
      gold: function (px) {
        [[2, 3], [10, 2], [6, 8], [12, 11], [2, 12]].forEach(function (c) {
          for (var dy = 0; dy < 2; dy++) for (var dx = 0; dx < 3; dx++) px(c[0] + dx, c[1] + dy, 0xf2c230);
          px(c[0], c[1], 0xfff3a6); px(c[0] + 1, c[1], 0xffe066); px(c[0] + 2, c[1] + 1, 0xb08410); px(c[0] + 1, c[1] + 2, 0x8a6a10);
        });
      },
      // 호마노: 붉은 줄과 흰 줄이 번갈아 난 띠
      onyx: function (px) {
        [[2, 2], [9, 6], [3, 11]].forEach(function (c) {
          for (var dy = 0; dy < 4; dy++) for (var dx = 0; dx < 5; dx++) { if ((dx === 0 || dx === 4) && (dy === 0 || dy === 3)) continue; px(c[0] + dx, c[1] + dy, dy % 2 ? 0xf1e0c6 : 0xc94a32); }
        });
      },
      // 청옥: 파란 육각 결정(밝은 모서리)
      sapphire: function (px) {
        [[3, 2], [10, 4], [5, 10], [12, 11]].forEach(function (c) {
          var rows = [[1, 2], [0, 3], [0, 3], [1, 2]];
          rows.forEach(function (r, dy) { for (var dx = r[0]; dx <= r[1]; dx++) px(c[0] + dx, c[1] + dy, dy === 0 ? 0x6f98f0 : (dx === r[1] ? 0x1d3f9a : 0x2d5fd8)); });
          px(c[0] + 1, c[1] + 1, 0xc0d6ff);
        });
      },
      // 금강석: 마름모 보석(흰 반짝임, 어두운 테)
      diamond: function (px) {
        [[4, 3], [11, 4], [6, 11], [12, 12]].forEach(function (c) {
          [[0, -2], [-1, -1], [1, -1], [-2, 0], [2, 0], [-1, 1], [1, 1], [0, 2]].forEach(function (q) { px(c[0] + q[0], c[1] + q[1], 0x1f6e6a); });
          px(c[0], c[1] - 1, 0xb8fffa); px(c[0] - 1, c[1], 0xffffff); px(c[0], c[1], 0x7af2ea); px(c[0] + 1, c[1], 0x4fd8d0); px(c[0], c[1] + 1, 0x3fc0b8);
        });
      }
    };
    function oreTile(name, art) {
      tile(name, function (px, R) { stoneBase(px, R); ORE_ART[art](px, R); });
      tile(name + 'Deep', function (px, R) { deepBase(px, R); ORE_ART[art](px, R); });
    }
    oreTile('oreCopper', 'copper'); oreTile('oreIron', 'iron'); oreTile('oreSilver', 'silver'); oreTile('oreGold', 'gold');
    oreTile('oreCoal', 'coal'); oreTile('oreOnyx', 'onyx'); oreTile('oreSapphire', 'sapphire'); oreTile('oreDiamond', 'diamond');
    // 깊은 돌: 땅 아주 아래, 어둡고 결이 가로로 난 단단한 돌
    tile('deepStone', function (px, R) {
      for (var y = 0; y < TS; y++) { var rk = y % 4 === 0 ? 0.82 : 1; for (var x = 0; x < TS; x++) px(x, y, 0x5c5d63, rk * (0.9 + R() * 0.16)); }
    });
    // 보석 덩어리(블록)
    function gemBlock(col) {
      return function (px, R) {
        for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
          var edge = x === 0 || y === 0 || x === 15 || y === 15, facet = ((x + y) % 8 === 0 || (x - y + 16) % 8 === 0);
          px(x, y, col, edge ? 0.62 : (facet ? 1.25 : 0.92 + R() * 0.1));
        }
      };
    }
    tile('blkCoal', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var v = R(); px(x, y, 0x2a2724, v > 0.93 ? 1.9 : 0.8 + v * 0.35); } });
    // 호마노 블록: 붉은·흰 띠, 청옥 블록: 육각 무늬, 금강석 블록: 빗금 면
    tile('blkOnyx', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var edge = x === 0 || y === 0 || x === 15 || y === 15, band = Math.floor((y + Math.round(Math.sin(x * 0.5) * 1.2)) / 2) % 3;
        px(x, y, band === 1 ? 0xf1e0c6 : 0xc24a34, edge ? 0.62 : (band === 2 ? 0.8 : 1) * (0.94 + R() * 0.08));
      }
    });
    tile('blkSapphire', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var edge = x === 0 || y === 0 || x === 15 || y === 15, hx = ((x + (Math.floor(y / 4) % 2) * 2) % 4 === 0) || y % 4 === 0;
        px(x, y, 0x3463d6, edge ? 0.6 : (hx ? 0.78 : (x + y) % 7 === 0 ? 1.35 : 0.98 + R() * 0.08));
      }
    });
    tile('blkDiamond', gemBlock(0x63e4dc));
    // 횃불: 가운데 막대 + 위에 불꽃(엇갈린 두 장으로 그림)
    tile('torch', function (px, R) {
      clear(px);
      for (var y = 7; y < TS; y++) { px(7, y, 0x7a5430, 0.9 + R() * 0.2); px(8, y, 0x5c3e22, 0.9 + R() * 0.2); }
      [[7, 6, 0xffe27a], [8, 6, 0xffd04a], [7, 5, 0xffb028], [8, 5, 0xfff2b0], [7, 4, 0xff8a1e], [8, 4, 0xffc040], [7, 3, 0xff7a10], [6, 5, 0xff9a2a], [9, 5, 0xff9a2a]].forEach(function (q) { px(q[0], q[1], q[2]); });
    });
    // 들고 다니는 것: 석탄·숯 덩이, 보석
    function lump(col, hi) {
      return function (px, R) {
        clear(px);
        for (var y = 4; y < 13; y++) for (var x = 3; x < 13; x++) if (Math.hypot((x - 7.5) * 0.9, (y - 8.4) * 1.1) < 4.6 + R() * 0.6) px(x, y, R() < 0.12 ? hi : col, 0.85 + R() * 0.3);
      };
    }
    tile('coal', lump(0x23211f, 0x5a5a5a)); tile('charcoal', lump(0x3a2a20, 0x6a4a34));
    function gem(col) {
      return function (px) {
        clear(px);
        for (var y = 3; y < 14; y++) {
          var half = y < 6 ? 2 + (y - 3) * 1.5 : 6 - (y - 6) * 0.75;
          for (var x = Math.round(8 - half); x < Math.round(8 + half); x++) px(x, y, col, y < 6 ? (x < 8 ? 1.3 : 1.1) : (x < 8 ? 1 : 0.75));
        }
        px(6, 4, 0xffffff); px(5, 5, 0xffffff);
      };
    }
    tile('gemOnyx', function (px) {
      clear(px);
      for (var y = 4; y < 13; y++) for (var x = 3; x < 13; x++) {
        var d = Math.hypot((x - 7.5) / 4.8, (y - 8.3) / 4.2); if (d > 1) continue;
        px(x, y, Math.floor(y / 2) % 2 ? 0xf1e0c6 : 0xc94a32, d > 0.8 ? 0.7 : 1);
      }
      px(5, 5, 0xffffff);
    });
    tile('gemSapphire', function (px) {
      clear(px);
      for (var y = 3; y < 14; y++) {
        var half = y < 6 ? 2 + (y - 3) : (y > 10 ? 5 - (y - 10) : 5);
        for (var x = 8 - half; x < 8 + half; x++) px(x, y, 0x2d5fd8, x < 8 ? (y < 8 ? 1.35 : 1.05) : (y < 8 ? 1.1 : 0.72));
      }
      px(6, 5, 0xffffff); px(5, 6, 0xc0d6ff);
    });
    tile('gemDiamond', gem(0x7af2ea));
    tile('furnace', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var row = y >> 2, mortar = y % 4 === 3 || (x + (row % 2) * 4) % 8 === 7;
        px(x, y, 0x7e7e7a, mortar ? 0.7 : 0.9 + R() * 0.2);
      }
      for (var y2 = 8; y2 < 14; y2++) for (var x2 = 4; x2 < 12; x2++) px(x2, y2, y2 > 11 ? 0xff9a2a : 0x1a1410, y2 > 11 ? 0.8 + R() * 0.4 : 1);
    });
    tile('furnaceTop', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0x7e7e7a, (x % 8 === 7 || y % 8 === 7) ? 0.7 : 0.9 + R() * 0.15); });
    function metal(col, style) {
      return function (px, R) {
        for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
          var edge = x === 0 || y === 0 || x === 15 || y === 15, k = edge ? 0.72 : (y < 3 ? 1.15 : 1) * (0.95 + R() * 0.08), c = col;
          if (style === 'rivet' && (x === 2 || x === 13) && (y === 2 || y === 13)) k = 0.6;                 // 철: 판에 못
          if (style === 'rivet' && (x === 8) && !edge) k *= 0.82;
          if (style === 'patina' && !edge && R() < 0.07) c = 0x5fb08c;                                       // 구리: 푸른 녹
          if (style === 'shine' && !edge && (x - y + 16) % 9 < 2) k = 1.3;                                  // 은: 빗긴 빛줄
          if (style === 'bars' && !edge && (y % 5 === 4 || (x + (Math.floor(y / 5) % 2) * 4) % 8 === 7)) k = 0.7;   // 금: 금괴 쌓은 모양
          px(x, y, c, k);
        }
      };
    }
    tile('blkCopper', metal(0xc8743a, 'patina')); tile('blkIron', metal(0xd2d6db, 'rivet')); tile('blkSilver', metal(0xe8eef5, 'shine')); tile('blkGold', metal(0xf3c83c, 'bars'));
    function ingot(col) {
      return function (px) {
        clear(px);
        for (var y = 5; y < 11; y++) { var inset = y < 7 ? 2 : (y < 9 ? 1 : 0); for (var x = 2 + inset; x < 14 - inset; x++) px(x, y, col, y < 7 ? 1.2 : (y > 9 ? 0.7 : 1)); }
      };
    }
    tile('ingotCopper', ingot(0xc8743a)); tile('ingotIron', ingot(0xd2d6db)); tile('ingotSilver', ingot(0xe8eef5)); tile('ingotGold', ingot(0xf3c83c));
    tile('stick', function (px) { clear(px); for (var i = 0; i < 11; i++) { px(3 + i, 13 - i, 0x8a6236); px(4 + i, 13 - i, 0x6a4628); } });
    // 도구: 곡괭이·도끼·삽·칼 × 나무·돌·구리·철
    var TCOL = [0xa77a48, 0x8f8f8b, 0xc8743a, 0xd2d6db, 0x6ff0e6];
    function handle(px, n) { for (var i = 0; i < n; i++) { px(2 + i, 14 - i, 0x7a5430); px(3 + i, 14 - i, 0x5c3e22); } }
    ['pick', 'axe', 'shovel', 'knife'].forEach(function (type) {
      TCOL.forEach(function (col, tier) {
        tile('tool_' + type + tier, function (px) {
          clear(px);
          if (type === 'knife') {
            for (var i = 0; i < 8; i++) { px(6 + i, 9 - i, col, 1.15); px(7 + i, 9 - i, col, 0.85); px(6 + i, 10 - i, col, 0.7); }
            for (var g = 0; g < 4; g++) px(3 + g, 7 + g, 0x6a4628);
            px(3, 12, 0x7a5430); px(4, 11, 0x7a5430); px(2, 13, 0x5c3e22);
            return;
          }
          handle(px, type === 'shovel' ? 9 : 10);
          if (type === 'pick') [[6, 1], [7, 1], [8, 1], [9, 2], [10, 2], [11, 3], [12, 4], [13, 5], [13, 6], [14, 7], [14, 8], [5, 2], [6, 2], [7, 2], [8, 2], [12, 5], [13, 7]].forEach(function (q) { px(q[0], q[1], col, q[1] < 2 || q[0] > 13 ? 1.2 : 0.9); });
          if (type === 'axe') for (var y = 1; y < 8; y++) for (var x = 9; x < 15; x++) if (!(y === 1 && x > 12) && !(y === 7 && x > 12) && x - 9 < 2 + y) px(x, y, col, x > 12 ? 1.2 : 0.9);
          if (type === 'shovel') for (var y2 = 1; y2 < 7; y2++) for (var x2 = 10; x2 < 15; x2++) if (Math.hypot(x2 - 12.2, y2 - 3.6) < 2.8) px(x2, y2, col, x2 > 12 ? 1.2 : 0.9);
        });
      });
    });
    tile('saddle', function (px, R) {
      clear(px);
      for (var y = 4; y < 11; y++) for (var x = 2; x < 14; x++) {
        var dx = (x - 7.5) / 6, dy = (y - 7) / 3.4; if (dx * dx + dy * dy > 1) continue;
        px(x, y, 0x8a4a22, y < 6 ? 1.2 : (y > 9 ? 0.75 : 0.95 + R() * 0.1));
      }
      px(3, 4, 0x6a3418); px(4, 3, 0x8a4a22); px(12, 5, 0x6a3418);          // 앞·뒤 턱
      for (var y2 = 10; y2 < 15; y2++) { px(6, y2, 0x4a2a12); px(9, y2, 0x4a2a12); }   // 끈
      px(6, 14, 0xc8c8c8); px(9, 14, 0xc8c8c8);                             // 등자
    });
    // 제작대·가죽·양털·옷
    tile('craftTop', function (px, R) {
      planks(0xa77a48, 1)(px, R);
      for (var i = 0; i < TS; i++) { px(i, 0, 0x5a3a1e); px(i, 15, 0x5a3a1e); px(0, i, 0x5a3a1e); px(15, i, 0x5a3a1e); px(i, 7, 0x6a4628); px(7, i, 0x6a4628); }
      for (var j = 2; j < 6; j++) { px(j, 3, 0xc8ccd2); px(j, 4, 0x9a9ea4); }   // 칼
      px(10, 2, 0x8a6236); px(10, 3, 0x8a6236); px(9, 2, 0x9a9ea4); px(11, 2, 0x9a9ea4);   // 망치
      for (var k = 9; k < 14; k++) px(k, 11, 0xe8e0c8);   // 자
    });
    tile('craftSide', function (px, R) {
      planks(0x9a6a3a, 1)(px, R);
      for (var y = 0; y < TS; y++) { px(0, y, 0x5a3a1e); px(15, y, 0x5a3a1e); }
      for (var x = 0; x < TS; x++) px(x, 0, 0x5a3a1e);
      for (var t = 3; t < 12; t++) { px(t, 6, 0xc8ccd2); px(t, 7, t % 2 ? 0x8a8e94 : 0xc8ccd2); }   // 톱
      px(2, 6, 0x6a4628); px(2, 7, 0x6a4628); px(1, 6, 0x6a4628);
      for (var h = 9; h < 14; h++) px(11, h, 0x6a4628); px(10, 9, 0x9a9ea4); px(12, 9, 0x9a9ea4); px(10, 10, 0x9a9ea4); px(12, 10, 0x9a9ea4);
    });
    tile('leather', function (px, R) {
      clear(px);
      for (var y = 2; y < 15; y++) for (var x = 2; x < 14; x++) {
        var dx = (x - 7.5) / 5.6, dy = (y - 8.2) / 6.2; if (dx * dx + dy * dy > 1 || ((x === 2 || x === 13) && (y < 5 || y > 11))) continue;
        px(x, y, 0x9a6234, 0.85 + R() * 0.25);
      }
      for (var s = 4; s < 12; s += 2) px(s, 8, 0x6a3e1c);
    });
    tile('wool', function (px, R) {
      clear(px);
      [[5, 6, 3.4], [10, 6, 3.4], [7.5, 10, 4], [4, 10, 2.6], [11, 10, 2.6]].forEach(function (c) {
        for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) if (Math.hypot(x - c[0], y - c[1]) < c[2]) px(x, y, 0xf2efe6, 0.86 + R() * 0.16 - (y > c[1] + 1 ? 0.1 : 0));
      });
    });
    var GOLD = 0xf0c840;
    function wearIcon(shape, col) {
      return function (px, R) {
        clear(px);
        var G = shape.slice(-1) === 'G', s = G ? shape.slice(0, -1) : shape;
        function sh(x, y, k) { px(x, y, col, (k || 1) * (0.92 + R() * 0.12)); }
        var x, y;
        if (s === 'cap' || s === 'helm') {
          for (y = 4; y < 11; y++) for (x = 3; x < 13; x++) if (Math.hypot(x - 7.5, (y - 10) * 1.2) < 5.6) sh(x, y, y < 6 ? 1.15 : 1);
          if (s === 'cap') for (x = 1; x < 15; x++) sh(x, 11, 0.75);
          else { for (y = 10; y < 14; y++) { sh(3, y, 0.8); sh(12, y, 0.8); } sh(7, 11, 0.7); sh(8, 11, 0.7); sh(7, 12, 0.7); sh(8, 12, 0.7); }
          if (G) for (y = 2; y < 6; y++) { px(7, y, GOLD); px(8, y, GOLD, 0.85); }
        } else if (s === 'crown') {
          for (y = 9; y < 13; y++) for (x = 2; x < 14; x++) sh(x, y, y === 9 ? 1.2 : 1);
          [2, 7, 12].forEach(function (cx) { for (var yy = 4; yy < 9; yy++) for (var xx = cx; xx < cx + 2; xx++) if (yy > 5 || xx === cx) sh(xx, yy, 1.1); });
          px(5, 10, 0xd03a3a); px(10, 10, 0x3a6ad0); px(7, 11, 0x3ad06a);
        } else if (s === 'tunic' || s === 'stripe' || s === 'mail' || s === 'plate') {
          var STR = [0xd04a3a, 0xe8c040, 0x3a6ad0, 0x4aa04a, 0x8a4ab0];
          for (y = 2; y < 15; y++) for (x = 1; x < 15; x++) {
            var inBody = x >= 4 && x <= 11, inSleeve = y < 7 && (x < 4 || x > 11);
            if (!inBody && !inSleeve) continue;
            if (y === 2 && x >= 6 && x <= 9) continue;   // 목
            if (s === 'stripe') px(x, y, STR[(y >> 1) % 5], 0.9 + R() * 0.15);
            else sh(x, y, s === 'mail' && (x + y) % 2 ? 0.8 : 1);
          }
          if (s === 'plate') for (y = 5; y < 11; y++) for (x = 5; x < 11; x++) px(x, y, y === 5 || y === 10 || x === 5 || x === 10 ? GOLD : col, 1.1);
        } else if (s === 'belt') {
          for (y = 6; y < 10; y++) for (x = 1; x < 15; x++) sh(x, y, y === 6 ? 1.15 : 1);
          for (y = 5; y < 11; y++) for (x = 6; x < 10; x++) if (y === 5 || y === 10 || x === 6 || x === 9) px(x, y, G ? 0xffffff : 0xd8c070);
        } else if (s === 'boot') {
          [[2, 0], [9, 0]].forEach(function (b) {
            for (y = 3; y < 13; y++) for (x = b[0]; x < b[0] + 4; x++) sh(x, y, 1);
            for (x = b[0]; x < b[0] + 6; x++) { sh(x, 12, 0.9); sh(x, 13, 0.7); }
            if (G) for (x = b[0]; x < b[0] + 4; x++) px(x, 4, GOLD);
          });
        } else if (s === 'shield') {
          for (y = 1; y < 15; y++) for (x = 3; x < 13; x++) {
            if (y > 10 && Math.abs(x - 7.5) > (15 - y) * 1.1) continue;
            var edge = x === 3 || x === 12 || y === 1 || (y > 10 && Math.abs(x - 7.5) > (14 - y) * 1.1);
            sh(x, y, edge ? 0.7 : (col === 0xa77a48 && x % 3 === 0 ? 0.85 : 1));
          }
          if (G) { for (y = 3; y < 12; y++) { px(7, y, GOLD); px(8, y, GOLD); } for (x = 5; x < 11; x++) { px(x, 6, GOLD); px(x, 7, GOLD); } }
        }
      };
    }
    WEARS.forEach(function (w) { tile('wear' + w[0], wearIcon(w[4], w[3])); });
    tile('sapling', function (px, R) {
      clear(px);
      for (var y = 8; y < TS; y++) px(7 + (y < 11 ? 1 : 0), y, 0x6b4b2c, 0.9 + R() * 0.2);
      [[7, 3, 3], [4, 6, 3], [10, 5, 3], [6, 9, 2], [10, 9, 2]].forEach(function (c) { for (var dy = 0; dy < c[2]; dy++) for (var dx = 0; dx < c[2] + 1; dx++) px(c[0] + dx - 1, c[1] + dy, 0x4c9a3c, 0.8 + R() * 0.4); });
    });
    tile('oliveLeaf', function (px) {
      clear(px);
      for (var i = 0; i < 12; i++) { var cx = 3 + i, cy = 12 - i * 0.8, w = Math.sin(i / 11 * Math.PI) * 2.2; for (var d = -w; d <= w; d += 1) px(Math.round(cx + d * 0.5), Math.round(cy + d), d < 0 ? 0x8fae5a : 0x6f8f42); }
      for (var j = 0; j < 11; j++) px(3 + j, Math.round(12 - j * 0.8), 0xc8d89a);
      px(2, 13, 0x6b4b2c); px(1, 14, 0x6b4b2c);
    });
    tile('ladder', function (px, R) {
      clear(px);
      for (var y = 0; y < TS; y++) { px(2, y, 0x8a6236, 0.9 + R() * 0.15); px(3, y, 0x6a4628); px(12, y, 0x8a6236, 0.9 + R() * 0.15); px(13, y, 0x6a4628); }
      for (var r = 1; r < TS; r += 4) for (var x = 4; x < 12; x++) { px(x, r, 0xa77a48, 0.95 + R() * 0.1); px(x, r + 1, 0x6a4628); }
    });
    tile('chestTop', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var edge = x < 1 || y < 1 || x > 14 || y > 14; px(x, y, edge ? 0x4a3018 : 0xa77a48, edge ? 1 : (y % 5 === 4 ? 0.8 : 0.92 + R() * 0.14)); }
    });
    tile('chestSide', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var edge = x < 1 || y < 1 || x > 14 || y > 14 || y === 6; px(x, y, edge ? 0x4a3018 : 0xa77a48, edge ? 1 : (x % 5 === 4 ? 0.82 : 0.92 + R() * 0.14)); }
      for (var y2 = 5; y2 < 9; y2++) for (var x2 = 7; x2 < 9; x2++) px(x2, y2, y2 === 5 ? 0xfff0a0 : 0xe8c33c);   // 금 고리
    });
    tile('furnaceOn', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var row = y >> 2, mortar = y % 4 === 3 || (x + (row % 2) * 4) % 8 === 7;
        px(x, y, 0x7e7e7a, mortar ? 0.7 : 0.9 + R() * 0.2);
      }
      for (var y2 = 8; y2 < 14; y2++) for (var x2 = 4; x2 < 12; x2++) { var hot = y2 > 9 || R() < 0.4; px(x2, y2, hot ? (y2 > 11 ? 0xffe27a : 0xff8a1e) : 0x5a1a08, 0.85 + R() * 0.3); }
    });
    tile('door', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var frame = x < 2 || x > 13 || y < 1 || y > 14, bar = y === 7 || y === 8;
        var k = (frame || bar ? 0.78 : 1) * (0.92 + R() * 0.14) * (x % 4 === 0 && !frame ? 0.88 : 1);
        px(x, y, 0xa77a48, k);
      }
      px(11, 9, 0x3a2a18); px(11, 10, 0x3a2a18);
    });
    // 금 가는 모습 4단계(캐는 중)
    var lines = []; var CR = mkRand(4242);
    for (var l = 0; l < 8; l++) { var p = [], x = 8 + (CR() * 4 - 2 | 0), y = 8 + (CR() * 4 - 2 | 0), dx = CR() < 0.5 ? -1 : 1, dy = CR() < 0.5 ? -1 : 1; for (var s = 0; s < 9; s++) { p.push([x, y]); if (CR() < 0.6) x += dx; if (CR() < 0.6) y += dy; } lines.push(p); }
    for (var st = 1; st <= 8; st++) {
      (function (st) {
        tile('crack' + st, function (px) { clear(px); for (var i = 0; i < st; i++) lines[i].slice(0, 2 + st).forEach(function (q) { px(q[0], q[1], 0x111111, 1, 220); }); });
      })(st);
    }
  }

  // ───────── 블록 ─────────
  // [이름, 위 무늬, 옆 무늬, 아래 무늬, 투명(0/1), 빛(0/1), 종류('plant'|'water')]
  var B = [
    null,
    ['풀', 'grassTop', 'grassSide', 'dirt'],
    ['흙', 'dirt', 'dirt', 'dirt'],
    ['돌', 'stone', 'stone', 'stone'],
    ['모래', 'sand', 'sand', 'sand'],
    ['고페르 나무', 'plankG', 'plankG', 'plankG'],
    ['역청 칠한 나무', 'plankP', 'plankP', 'plankP'],
    ['통나무', 'logTop', 'logSide', 'logTop'],
    ['나뭇잎', 'leaves', 'leaves', 'leaves'],
    ['유리', 'glass', 'glass', 'glass', 1],
    ['등불', 'lampTop', 'lamp', 'lampTop', 0, 1],
    ['흰 벽', 'plaster', 'plaster', 'plaster'],
    ['붉은 벽돌', 'brick', 'brick', 'brick'],
    ['기와', 'roof', 'roof', 'roof'],
    ['하늘색 천', 'clothB', 'clothB', 'clothB'],
    ['노란 천', 'clothY', 'clothY', 'clothY'],
    ['분홍 천', 'clothP', 'clothP', 'clothP'],
    ['초록 천', 'clothG', 'clothG', 'clothG'],
    ['자갈길', 'gravel', 'gravel', 'gravel'],
    ['꽃밭', 'flowerTop', 'grassSide', 'dirt'],
    ['흙벽돌', 'mudbrick', 'mudbrick', 'mudbrick'],
    ['석회암', 'limestone', 'limestone', 'limestone'],
    ['갈대 지붕', 'thatch', 'thatch', 'thatch'],
    ['검은 돌', 'basalt', 'basalt', 'basalt'],
    ['물', 'water', 'water', 'water', 1, 0, 'water'],
    ['갈대', 'reed', 'reed', 'reed', 1, 0, 'plant'],
    ['진흙', 'clay', 'clay', 'clay'],
    ['역청', 'tar', 'tar', 'tar'],
    ['들꽃', 'flowerPlant', 'flowerPlant', 'flowerPlant', 1, 0, 'plant'],
    ['눈', 'snow', 'snowSide', 'stone']
  ];
  var AIR = 0, GRASS = 1, DIRT = 2, STONE = 3, SAND = 4, GOPHER = 5, PITCH = 6, LOG = 7, LEAF = 8, GLASS = 9, LAMP = 10,
      LIME = 21, BASALT = 23, WATER = 24, REED = 25, CLAY = 26, TAR = 27, FLOWER = 28, PATH = 18, BRICK = 12, SNOW = 29;
  // 광석·용광로·금속 블록(30~38), 덩이·막대기(70~74), 도구(80~95: 곡괭이·도끼·삽·칼 × 나무·돌·구리·철)
  var ORE_CU = 30, ORE_FE = 31, ORE_AG = 32, ORE_AU = 33, FURNACE = 34, BLK_CU = 35, BLK_FE = 36, BLK_AG = 37, BLK_AU = 38;
  var ING_CU = 70, ING_FE = 71, ING_AG = 72, ING_AU = 73, STICK = 74, TOOL0 = 80;
  // 마인크래프트처럼 더한 것: 석탄 광석(39), 호마노·청옥·금강석 광석, 보석 블록, 횃불, 깊은 돌(100~108), 석탄·숯·보석(75~79), 금강석 도구(120~123)
  var ORE_COAL = 39, ORE_ONYX = 100, ORE_SAPH = 101, ORE_DIA = 102, BLK_COAL = 103, BLK_ONYX = 104, BLK_SAPH = 105, BLK_DIA = 106, TORCH = 107, DEEP = 108;
  var COAL = 75, CHAR = 76, GEM_ONYX = 77, GEM_SAPH = 78, GEM_DIA = 79, TOOL4 = 120;
  var DEEPV = {};   // 보통 광석 → 깊은 돌 속 광석(같은 것이 나오지만 더 단단함)
  [ORE_COAL, ORE_CU, ORE_FE, ORE_AG, ORE_ONYX, ORE_AU, ORE_SAPH, ORE_DIA].forEach(function (o, i) { DEEPV[o] = 109 + i; });
  B[ORE_COAL] = ['석탄 광석', 'oreCoal', 'oreCoal', 'oreCoal']; B[ORE_ONYX] = ['호마노 광석', 'oreOnyx', 'oreOnyx', 'oreOnyx'];
  B[ORE_SAPH] = ['청옥 광석', 'oreSapphire', 'oreSapphire', 'oreSapphire']; B[ORE_DIA] = ['금강석 광석', 'oreDiamond', 'oreDiamond', 'oreDiamond'];
  B[BLK_COAL] = ['석탄 블록', 'blkCoal', 'blkCoal', 'blkCoal']; B[BLK_ONYX] = ['호마노 블록', 'blkOnyx', 'blkOnyx', 'blkOnyx'];
  B[BLK_SAPH] = ['청옥 블록', 'blkSapphire', 'blkSapphire', 'blkSapphire']; B[BLK_DIA] = ['금강석 블록', 'blkDiamond', 'blkDiamond', 'blkDiamond'];
  B[TORCH] = ['횃불', 'torch', 'torch', 'torch', 1, 1, 'plant'];
  // 묘목(117), 불 켠 용광로(118), 감람나무 잎(119), 사닥다리(124~127, 방향 4), 궤(128)
  var SAPLING = 117, FURNACE_ON = 118, OLIVE = 119, LADDER = 124, CHEST = 128, SADDLE = 129;
  B[SADDLE] = ['안장', 'saddle', 'saddle', 'saddle', 0, 0, 'item'];
  // 제작대(130)·가죽(131)·양털(132)·옷(140~158): 제작대에서 만들어 입는다
  var CRAFT = 130, LEATHER = 131, WOOL = 132;
  B[LEATHER] = ['가죽', 'leather', 'leather', 'leather', 0, 0, 'item'];
  B[WOOL] = ['양털', 'wool', 'wool', 'wool', 0, 0, 'item'];
  B[CRAFT] = ['제작대', 'craftTop', 'craftSide', B[GOPHER][3]];
  // [번호, 이름, 칸, 색, 모양, 구절] — 모양 끝의 G는 금 테두리(하나님의 전신 갑주, 엡 6:13-17)
  var WEARS = [
    [140, '가죽 모자', 'head', 0x8a5a32, 'cap', ''],
    [141, '놋 투구', 'head', 0xc8843a, 'helm', '삼상 17:38'],
    [142, '철 투구', 'head', 0xc8ccd2, 'helm', ''],
    [143, '순금 관', 'head', 0xf0c840, 'crown', '시 21:3'],
    [144, '구원의 투구', 'head', 0xe8eef5, 'helmG', '엡 6:17'],
    [145, '가죽옷', 'body', 0x8a5a32, 'tunic', '창 3:21'],
    [146, '양털 옷', 'body', 0xf2efe6, 'tunic', ''],
    [147, '채색옷', 'body', 0xd04a3a, 'stripe', '창 37:3'],
    [148, '놋 갑옷', 'body', 0xc8843a, 'mail', '삼상 17:38'],
    [149, '철 갑옷', 'body', 0xc8ccd2, 'mail', ''],
    [150, '의의 호심경', 'body', 0xe8eef5, 'plateG', '엡 6:14'],
    [151, '가죽 띠', 'belt', 0x6a3e1c, 'belt', '왕하 1:8'],
    [152, '진리의 허리 띠', 'belt', 0xf0d070, 'beltG', '엡 6:14'],
    [153, '가죽 신', 'feet', 0x7a4a26, 'boot', ''],
    [154, '나무 신', 'feet', 0xa77a48, 'boot', ''],
    [155, '평안의 복음의 신', 'feet', 0xe8eef5, 'bootG', '엡 6:15'],
    [156, '나무 방패', 'shield', 0xa77a48, 'shield', ''],
    [157, '철 방패', 'shield', 0xc8ccd2, 'shield', ''],
    [158, '믿음의 방패', 'shield', 0xe8eef5, 'shieldG', '엡 6:16']
  ];
  var WEARINFO = {}, SLOTS = ['head', 'body', 'belt', 'feet', 'shield'], SLOT_NAME = { head: '머리', body: '몸', belt: '허리', feet: '발', shield: '방패' };
  WEARS.forEach(function (w) { WEARINFO[w[0]] = { slot: w[1 + 1], col: w[3], shape: w[4], ref: w[5] }; B[w[0]] = [w[1], 'wear' + w[0], 'wear' + w[0], 'wear' + w[0], 0, 0, 'item']; });
  B[SAPLING] = ['묘목', 'sapling', 'sapling', 'sapling', 1, 0, 'plant'];
  B[FURNACE_ON] = ['용광로', 'furnaceTop', 'furnaceOn', 'furnaceTop'];
  B[OLIVE] = ['감람나무 잎', 'oliveLeaf', 'oliveLeaf', 'oliveLeaf', 0, 0, 'item'];
  B[CHEST] = ['궤', 'chestTop', 'chestSide', 'chestTop'];
  var LIGHTS = {}; LIGHTS[LAMP] = 1; LIGHTS[TORCH] = 1; LIGHTS[FURNACE_ON] = 1;   // 빛을 내는 것
  B[DEEP] = ['깊은 돌', 'deepStone', 'deepStone', 'deepStone'];
  [[COAL, '석탄', 'coal'], [CHAR, '숯', 'charcoal'], [GEM_ONYX, '호마노', 'gemOnyx'], [GEM_SAPH, '청옥', 'gemSapphire'], [GEM_DIA, '금강석', 'gemDiamond']].forEach(function (it) { B[it[0]] = [it[1], it[2], it[2], it[2], 0, 0, 'item']; });
  B[ORE_CU] = ['구리 광석', 'oreCopper', 'oreCopper', 'oreCopper']; B[ORE_FE] = ['철 광석', 'oreIron', 'oreIron', 'oreIron'];
  B[ORE_AG] = ['은 광석', 'oreSilver', 'oreSilver', 'oreSilver']; B[ORE_AU] = ['금 광석', 'oreGold', 'oreGold', 'oreGold'];
  for (var dvk in DEEPV) { var dv = DEEPV[dvk], t0 = B[dvk][1]; B[dv] = ['깊은 ' + B[dvk][0], t0 + 'Deep', t0 + 'Deep', t0 + 'Deep']; }
  B[FURNACE] = ['용광로', 'furnaceTop', 'furnace', 'furnaceTop'];
  B[BLK_CU] = ['구리 블록', 'blkCopper', 'blkCopper', 'blkCopper']; B[BLK_FE] = ['철 블록', 'blkIron', 'blkIron', 'blkIron'];
  B[BLK_AG] = ['은 블록', 'blkSilver', 'blkSilver', 'blkSilver']; B[BLK_AU] = ['금 블록', 'blkGold', 'blkGold', 'blkGold'];
  [[ING_CU, '구리 덩이', 'ingotCopper'], [ING_FE, '철 덩이', 'ingotIron'], [ING_AG, '은 덩이', 'ingotSilver'], [ING_AU, '금 덩이', 'ingotGold'], [STICK, '막대기', 'stick']].forEach(function (it) { B[it[0]] = [it[1], it[2], it[2], it[2], 0, 0, 'item']; });
  var TOOL_TYPES = ['pick', 'axe', 'shovel', 'knife'], TOOL_TNAME = ['곡괭이', '도끼', '삽', '칼'], TIER_NAME = ['나무', '돌', '구리', '철', '금강석'];
  function toolId(type, tier) { var ti = TOOL_TYPES.indexOf(type); return tier < 4 ? TOOL0 + ti * 4 + tier : TOOL4 + ti; }   // tier 0~4(4=금강석)
  TOOL_TYPES.forEach(function (type, ti) { for (var tier = 0; tier < 5; tier++) B[toolId(type, tier)] = [TIER_NAME[tier] + ' ' + TOOL_TNAME[ti], 'tool_' + type + tier, 'tool_' + type + tier, 'tool_' + type + tier, 0, 0, 'tool']; });
  function isItem(id) { var k = B[id] && B[id][6]; return k === 'item' || k === 'tool'; }
  // 모양 블록: 반 블록(40~42) · 계단(44~55, 방향 4) · 울타리(56) · 문(60~67, 방향 4 × 열림)
  // SHAPE[id] = { type, base(가방에 들어가는 번호), mat(무늬 블록), f(방향), open }
  var SHAPE = {}, SLAB_G = 40, SLAB_S = 41, SLAB_B = 42, STAIR_G = 44, STAIR_S = 48, STAIR_B = 52, FENCE = 56, DOOR = 60;
  function regShape(id, name, type, base, mat, f, open) {
    SHAPE[id] = { type: type, base: base, mat: mat, f: f || 0, open: !!open };
    B[id] = [name, B[mat][1], B[mat][2], B[mat][3], 0, 0, 'shape'];
  }
  regShape(SLAB_G, '고페르 반 블록', 'slab', SLAB_G, GOPHER); regShape(SLAB_S, '돌 반 블록', 'slab', SLAB_S, STONE); regShape(SLAB_B, '벽돌 반 블록', 'slab', SLAB_B, BRICK);
  [[STAIR_G, GOPHER, '고페르 계단'], [STAIR_S, STONE, '돌 계단'], [STAIR_B, BRICK, '벽돌 계단']].forEach(function (s) { for (var f = 0; f < 4; f++) regShape(s[0] + f, s[2], 'stair', s[0], s[1], f); });
  regShape(FENCE, '울타리', 'fence', FENCE, GOPHER);
  for (var lf = 0; lf < 4; lf++) { regShape(LADDER + lf, '사닥다리', 'ladder', LADDER, GOPHER, lf); B[LADDER + lf][1] = B[LADDER + lf][2] = B[LADDER + lf][3] = 'ladder'; }
  for (var df = 0; df < 4; df++) for (var dop = 0; dop < 2; dop++) { regShape(DOOR + df * 2 + dop, '나무 문', 'door', DOOR, GOPHER, df, dop); B[DOOR + df * 2 + dop][1] = B[DOOR + df * 2 + dop][2] = B[DOOR + df * 2 + dop][3] = 'door'; }
  for (var bi = 0; bi < B.length; bi++) if (B[bi] === undefined) B[bi] = null;
  function isShape(id) { return !!SHAPE[id]; }
  function baseOf(id) { return SHAPE[id] ? SHAPE[id].base : id; }
  // 모양별 상자들(칸 안 좌표 0~1)
  var EDGE = [[0, 0, 0, 1, 1, 0.19], [0.81, 0, 0, 1, 1, 1], [0, 0, 0.81, 1, 1, 1], [0, 0, 0, 0.19, 1, 1]];
  function shapeBoxes(id, x, y, z) {
    var s = SHAPE[id];
    if (s.type === 'slab') return [[0, 0, 0, 1, 0.5, 1]];
    if (s.type === 'stair') return [[0, 0, 0, 1, 0.5, 1], [[0, 0.5, 0, 1, 1, 0.5], [0.5, 0.5, 0, 1, 1, 1], [0, 0.5, 0.5, 1, 1, 1], [0, 0.5, 0, 0.5, 1, 1]][s.f]];
    if (s.type === 'door') return [EDGE[s.open ? (s.f + 1) % 4 : s.f]];
    if (s.type === 'ladder') return [[[0, 0, 0, 1, 1, 0.1], [0.9, 0, 0, 1, 1, 1], [0, 0, 0.9, 1, 1, 1], [0, 0, 0, 0.1, 1, 1]][s.f]];
    // 울타리: 기둥 + 옆 칸(울타리·꽉 찬 블록) 쪽으로 가로대
    var bx = [[0.375, 0, 0.375, 0.625, 1, 0.625]];
    [[0, -1, [0.44, 0, 0.56, 0.375]], [1, 0, [0.625, 0.44, 1, 0.56]], [0, 1, [0.44, 0.625, 0.56, 1]], [-1, 0, [0, 0.44, 0.375, 0.56]]].forEach(function (d) {
      var nb = get(x + d[0], y, z + d[1]);
      if (nb === FENCE || (isSolid(nb) && !isShape(nb) && !isTrans(nb))) { var r = d[2]; bx.push([r[0], 0.3, r[1], r[2], 0.45, r[3]]); bx.push([r[0], 0.7, r[1], r[2], 0.85, r[3]]); }
    });
    return bx;
  }
  function collBoxes(id, x, y, z) { var s = SHAPE[id]; if (s.type === 'ladder') return []; if (s.type === 'fence') return [[0.3, 0, 0.3, 0.7, 1, 0.7]].concat(shapeBoxes(id, x, y, z).slice(1).map(function (b) { return [b[0], 0, b[2], b[3], 1, b[5]]; })); return shapeBoxes(id, x, y, z); }
  // 가방에 들어가는 것(캐거나 만들어서 모음)
  var INV = [7, 5, 6, 8, 3, 21, 23, 4, 2, 26, 27, 25, 28, 29, 11, 12, 13, 20, 22, 9, 10, 18, 14, 15, 16, 17, SLAB_G, SLAB_S, SLAB_B, STAIR_G, STAIR_S, STAIR_B, FENCE, DOOR,
    ORE_CU, ORE_FE, ORE_AG, ORE_AU, ING_CU, ING_FE, ING_AG, ING_AU, FURNACE, BLK_CU, BLK_FE, BLK_AG, BLK_AU, STICK];
  INV.push(SAPLING, OLIVE, LADDER, CHEST, SADDLE, CRAFT, LEATHER, WOOL);
  WEARS.forEach(function (w) { INV.push(w[0]); });
  INV.push(ORE_COAL, COAL, CHAR, BLK_COAL, TORCH, DEEP, ORE_ONYX, GEM_ONYX, BLK_ONYX, ORE_SAPH, GEM_SAPH, BLK_SAPH, ORE_DIA, GEM_DIA, BLK_DIA);
  for (var tl = 0; tl < 16; tl++) INV.push(TOOL0 + tl);
  for (tl = 0; tl < 4; tl++) INV.push(TOOL4 + tl);
  var HOTBAR = [LOG, GOPHER, PITCH, STONE, LIME, 20, 12, 13, GLASS];
  // 캐는 데 걸리는 시간(초), 캤을 때 나오는 것
  var HARD = { 1: 0.35, 2: 0.35, 4: 0.3, 26: 0.35, 8: 0.15, 25: 0.05, 28: 0.05, 9: 0.25, 7: 0.6, 5: 0.5, 6: 0.5, 22: 0.4, 14: 0.3, 15: 0.3, 16: 0.3, 17: 0.3,
    3: 0.75, 21: 0.7, 23: 0.9, 29: 0.25, 12: 0.7, 20: 0.5, 11: 0.5, 13: 0.6, 18: 0.45, 27: 0.5, 10: 0.3, 19: 0.35 };
  var DROP = { 1: DIRT, 19: DIRT };
  // 석탄·보석 광석은 캐면 바로 석탄·보석이 나온다(금속 광석은 녹여야 덩이)
  DROP[ORE_COAL] = COAL; DROP[ORE_ONYX] = GEM_ONYX; DROP[ORE_SAPH] = GEM_SAPH; DROP[ORE_DIA] = GEM_DIA;
  for (var dk in DEEPV) DROP[DEEPV[dk]] = DROP[dk] || +dk;
  DROP[FURNACE_ON] = FURNACE;
  // 도구 갈래: 곡괭이(돌·광석·벽돌) · 도끼(나무) · 삽(흙·모래) · 칼(잎·풀·천)
  var TCLASS = {}, BASE_T = {};
  function setClass(cls, list, t) { list.forEach(function (id) { TCLASS[id] = cls; BASE_T[id] = t; }); }
  // 돌·광석은 단단한 정도대로: 석회암 < 돌 < 현무암, 광석은 귀할수록 단단하게 구리 < 철 < 은 < 금
  setClass('pick', [LIME], 1.2); setClass('pick', [STONE], 1.5); setClass('pick', [BASALT], 2.0);
  setClass('pick', [ORE_COAL], 2.0); setClass('pick', [ORE_CU], 2.5); setClass('pick', [ORE_FE], 3.0); setClass('pick', [ORE_AG], 3.6);
  setClass('pick', [ORE_ONYX], 3.9); setClass('pick', [ORE_AU], 4.2); setClass('pick', [ORE_SAPH], 4.6); setClass('pick', [ORE_DIA], 5.0);
  setClass('pick', [DEEP], 3.0); setClass('pick', [BLK_COAL], 2.4); setClass('pick', [BLK_ONYX], 4.0); setClass('pick', [BLK_SAPH], 4.8); setClass('pick', [BLK_DIA], 5.2);
  BASE_T[TORCH] = 0.05; BASE_T[SAPLING] = 0.05;
  setClass('pick', [FURNACE_ON], 1.6); setClass('axe', [LADDER, LADDER + 1, LADDER + 2, LADDER + 3], 0.4); setClass('axe', [CHEST, CRAFT], 1.2);
  for (var dk2 in DEEPV) { TCLASS[DEEPV[dk2]] = 'pick'; BASE_T[DEEPV[dk2]] = Math.round(BASE_T[dk2] * 1.3 * 10) / 10; }
  setClass('pick', [12, 11, 13, SLAB_S, SLAB_B, STAIR_S, STAIR_S + 1, STAIR_S + 2, STAIR_S + 3, STAIR_B, STAIR_B + 1, STAIR_B + 2, STAIR_B + 3], 1.2); setClass('pick', [20], 1.0);
  setClass('pick', [FURNACE], 1.6); setClass('pick', [BLK_CU], 2.6); setClass('pick', [BLK_FE], 3.2); setClass('pick', [BLK_AG], 3.8); setClass('pick', [BLK_AU], 4.4); setClass('pick', [GLASS], 0.4); setClass('pick', [LAMP], 0.6);
  setClass('axe', [LOG], 1.4); setClass('axe', [GOPHER, PITCH], 1.1); setClass('axe', [22], 0.8);
  setClass('axe', [SLAB_G, STAIR_G, STAIR_G + 1, STAIR_G + 2, STAIR_G + 3, FENCE, 60, 61, 62, 63, 64, 65, 66, 67], 1.0);
  setClass('shovel', [GRASS, DIRT, 19], 0.7); setClass('shovel', [SAND], 0.6); setClass('shovel', [CLAY, TAR], 0.9); setClass('shovel', [18], 0.9); setClass('shovel', [SNOW], 0.4);
  setClass('knife', [LEAF], 0.35); setClass('knife', [REED, FLOWER], 0.08); setClass('knife', [14, 15, 16, 17], 0.6);
  var NEED_TIER = {}; NEED_TIER[ORE_CU] = 0; NEED_TIER[ORE_FE] = 1; NEED_TIER[ORE_AG] = 2; NEED_TIER[ORE_AU] = 3;   // 0=나무 1=돌 2=구리 3=철 곡괭이
  NEED_TIER[ORE_COAL] = 0; NEED_TIER[ORE_ONYX] = 2; NEED_TIER[ORE_SAPH] = 3; NEED_TIER[ORE_DIA] = 3;
  for (var dk3 in DEEPV) NEED_TIER[DEEPV[dk3]] = NEED_TIER[dk3];
  var HAND_SLOW = 2, TIER_SPEED = [2, 3, 4.5, 6, 8], TOOL_MAX = [60, 130, 200, 300, 1000];
  function isTool(id) { return (id >= TOOL0 && id < TOOL0 + 16) || (id >= TOOL4 && id < TOOL4 + 4); }
  function tierOf(id) { return id >= TOOL4 ? 4 : (id - TOOL0) % 4; }
  function typeOf(id) { return id >= TOOL4 ? id - TOOL4 : Math.floor((id - TOOL0) / 4); }
  function toolMax(id) { return TOOL_MAX[tierOf(id)]; }
  function toolName(id) { return TIER_NAME[tierOf(id)] + ' ' + TOOL_TNAME[typeOf(id)]; }
  function bestTier(cls) { var t = -1; for (var k = 4; k >= 0; k--) if (have(toolId(cls, k)) > 0) { t = k; break; } return t; }
  // 캐는 시간(초)과 못 캐는 이유
  // 손에 든 도구로 캔다: 맞는 도구면 빨리, 맞지 않는 도구면 맨손 속도(그래도 닳음)
  function mineInfo(id) {
    var cls = TCLASS[id], base = BASE_T[id] || 0.5, held = HOTBAR[sel];
    var tool = isTool(held) && have(held) > 0 ? held : 0;
    var hType = tool ? TOOL_TYPES[typeOf(tool)] : '', hTier = tool ? tierOf(tool) : -1;
    var tier = cls && hType === cls ? hTier : -1;
    if (NEED_TIER[id] !== undefined && tier < NEED_TIER[id]) {
      var bt = bestTier('pick');
      return { deny: B[id][0] + '은(는) ' + TIER_NAME[NEED_TIER[id]] + ' 곡괭이 이상을 손에 들어야 캘 수 있어요' + (bt >= NEED_TIER[id] ? ' (가방에 ' + TIER_NAME[bt] + ' 곡괭이가 있어요)' : '') };
    }
    // 맞는 도구가 없으면(맨손·블록·맞지 않는 도구) 2배 느리게
    return { t: tier >= 0 ? base / TIER_SPEED[tier] : (cls ? base * HAND_SLOW : base), tool: tool, fit: tier >= 0 };
  }
  function dropOf(id) { return DROP[id] || baseOf(id); }
  // 만들기
  var RECIPES = [
    { out: [STICK, 4], need: [[GOPHER, 2]], cat: 'tool' },
    { out: [FURNACE, 1], need: [[STONE, 8]], cat: 'smelt' },
    { out: [GOPHER, 4], need: [[LOG, 1]] },
    { out: [PITCH, 2], need: [[GOPHER, 2], [TAR, 1]], ref: '창 6:14' },
    { out: [12, 2], need: [[CLAY, 2], [LOG, 1]], ref: '창 11:3' },
    { out: [20, 2], need: [[CLAY, 2], [REED, 1]] },
    { out: [13, 3], need: [[CLAY, 3], [LOG, 1]] },
    { out: [11, 2], need: [[LIME, 2]], ref: '신 27:2' },
    { out: [22, 2], need: [[REED, 3]] },
    { out: [GLASS, 1], need: [[SAND, 3], [LOG, 1]] },
    { out: [LAMP, 2], need: [[GOPHER, 1], [TAR, 1]] },
    { out: [PATH, 2], need: [[STONE, 2]] },
    { out: [SLAB_G, 6], need: [[GOPHER, 3]] },
    { out: [STAIR_G, 4], need: [[GOPHER, 6]] },
    { out: [FENCE, 3], need: [[GOPHER, 2], [LOG, 1]] },
    { out: [DOOR, 1], need: [[GOPHER, 6]] },
    { out: [SLAB_S, 6], need: [[STONE, 3]] },
    { out: [STAIR_S, 4], need: [[STONE, 6]] },
    { out: [SLAB_B, 6], need: [[BRICK, 3]] },
    { out: [STAIR_B, 4], need: [[BRICK, 6]] },
    { out: [14, 2], need: [[REED, 2], [FLOWER, 1]] },
    { out: [15, 2], need: [[REED, 2], [FLOWER, 1]] },
    { out: [16, 2], need: [[REED, 2], [FLOWER, 1]] },
    { out: [17, 2], need: [[REED, 2], [FLOWER, 1]] }
  ];
  TOOL_TYPES.forEach(function (type) {
    [GOPHER, STONE, ING_CU, ING_FE, GEM_DIA].forEach(function (mat, tier) {
      var n = type === 'shovel' ? 1 : (type === 'knife' ? 2 : 3), st = type === 'knife' ? 1 : 2;
      RECIPES.push({ out: [toolId(type, tier), 1], need: [[mat, n], [STICK, st]], cat: 'tool', ref: tier === 4 ? '렘 17:1' : (tier >= 2 ? '창 4:22' : '') });
    });
  });
  // 녹이기(용광로 + 땔감): 광석 1 → 덩이 1 — 욥 28:1-2. 땔감은 석탄·숯 1개로 8번, 통나무 1개로 1.5번, 석탄 블록 1개로 72번
  [[ORE_CU, ING_CU, '욥 28:2'], [ORE_FE, ING_FE, '욥 28:2'], [ORE_AG, ING_AG, '욥 28:1'], [ORE_AU, ING_AU, '욥 28:1']].forEach(function (o) {
    RECIPES.push({ out: [o[1], 1], need: [[o[0], 1]], cat: 'smelt', ref: o[2], furnace: true, fuel: true });
  });
  RECIPES.push({ out: [CHAR, 1], need: [[LOG, 1]], cat: 'smelt', ref: '요 21:9', furnace: true, fuel: true });
  // 블록으로 묶기(9개) ↔ 다시 풀기
  [[ING_CU, BLK_CU], [ING_FE, BLK_FE], [ING_AG, BLK_AG], [ING_AU, BLK_AU, '창 2:12'], [COAL, BLK_COAL], [GEM_ONYX, BLK_ONYX, '창 2:12'], [GEM_SAPH, BLK_SAPH, '욥 28:6'], [GEM_DIA, BLK_DIA, '렘 17:1']].forEach(function (o) {
    RECIPES.push({ out: [o[1], 1], need: [[o[0], 9]], cat: 'smelt', ref: o[2] || '' });
    RECIPES.push({ out: [o[0], 9], need: [[o[1], 1]], cat: 'smelt' });
  });
  RECIPES.push({ out: [LADDER, 3], need: [[STICK, 7]], cat: 'shape', ref: '창 28:12' });
  RECIPES.push({ out: [CHEST, 1], need: [[GOPHER, 8]], cat: 'block', ref: '출 25:10' });
  RECIPES.push({ out: [SADDLE, 1], need: [[GOPHER, 3], [ING_FE, 1]], cat: 'tool', ref: '창 22:3' });
  // 제작대와 옷: 옷은 제작대(가방이나 내 땅)가 있어야 만든다
  RECIPES.push({ out: [CRAFT, 1], need: [[GOPHER, 4]], cat: 'wear' });
  [[140, [[LEATHER, 3]]], [141, [[ING_CU, 5]]], [142, [[ING_FE, 5]]], [143, [[ING_AU, 5]]], [144, [[ING_FE, 4], [ING_AU, 1]]],
   [145, [[LEATHER, 6]]], [146, [[WOOL, 6]]], [147, [[WOOL, 6], [FLOWER, 3]]], [148, [[ING_CU, 8]]], [149, [[ING_FE, 8]]], [150, [[ING_FE, 6], [ING_AU, 2]]],
   [151, [[LEATHER, 2]]], [152, [[LEATHER, 2], [ING_AU, 2]]],
   [153, [[LEATHER, 3]]], [154, [[GOPHER, 3]]], [155, [[LEATHER, 3], [ING_AG, 2]]],
   [156, [[GOPHER, 5], [STICK, 1]]], [157, [[ING_FE, 5], [GOPHER, 2]]], [158, [[ING_FE, 5], [ING_AU, 1], [GOPHER, 2]]]
  ].forEach(function (o) { RECIPES.push({ out: [o[0], 1], need: o[1], cat: 'wear', table: true, ref: WEARINFO[o[0]].ref }); });
  RECIPES.push({ out: [TORCH, 4], need: [[STICK, 1], [COAL, 1]], cat: 'block', ref: '창 15:17' });
  RECIPES.push({ out: [TORCH, 4], need: [[STICK, 1], [CHAR, 1]], cat: 'block', ref: '창 15:17' });
  // 땔감
  var FUEL = {}; FUEL[COAL] = 8; FUEL[CHAR] = 8; FUEL[LOG] = 1.5; FUEL[BLK_COAL] = 72;
  var FUEL_ORDER = [COAL, CHAR, LOG, BLK_COAL];
  var HEAT = 0;   // 용광로에 남은 불(녹일 수 있는 횟수)
  // 녹이는 줄: [{o: 나올 것, n: 개수, s: 시작 시각(ms), g: 이미 꺼낸 개수}] — 창을 닫아도 시간은 흐른다
  var SMELT_SEC = 3, JOBS = [];
  try { JOBS = (JSON.parse(localStorage.getItem('arkVillage.smelt') || '[]') || []).filter(function (j) { return j && B[j.o] && j.n > 0; }); } catch (e) { JOBS = []; }
  function saveJobs() { try { localStorage.setItem('arkVillage.smelt', JSON.stringify(JOBS)); } catch (e) {} }
  function jobEnd(j) { return j.s + j.n * SMELT_SEC * 1000; }
  function queueSmelt(o, n) {
    var now = Date.now(), last = JOBS[JOBS.length - 1];
    if (last && last.o === o && jobEnd(last) > now) last.n += n;
    else JOBS.push({ o: o, n: n, s: last ? Math.max(now, jobEnd(last)) : now, g: 0 });
    saveJobs(); updateSmeltUI();
  }
  try { HEAT = Math.max(0, Math.min(200, +(localStorage.getItem('arkVillage.heat') || 0) || 0)); } catch (e) {}
  function needOf(rc, id) { var n = 0; rc.need.forEach(function (q) { if (q[0] === id) n += q[1]; }); return n; }
  function fuelLeft(rc) { var f = HEAT; FUEL_ORDER.forEach(function (id) { f += Math.max(0, have(id) - (rc ? needOf(rc, id) : 0)) * FUEL[id]; }); return f; }
  function burnOne(rc) {
    var guard = 0;
    while (HEAT < 1 && guard++ < 5) {
      var id = FUEL_ORDER.filter(function (f) { return have(f) - needOf(rc, f) > 0; })[0];
      if (!id) return false;
      take(id, 1); HEAT += FUEL[id];
    }
    if (HEAT < 1) return false;
    HEAT -= 1; return true;
  }
  RECIPES.forEach(function (r) { if (!r.cat) r.cat = SHAPE[r.out[0]] ? 'shape' : 'block'; });
  function canCraft(rc) { return isAdm() || rc.need.every(function (n) { return have(n[0]) >= n[1]; }) && (!rc.furnace || furnaceOK()) && (!rc.table || tableOK()) && (!rc.fuel || fuelLeft(rc) >= 1); }
  function kind(id) { return B[id] && B[id][6]; }
  function isTrans(id) { return id === AIR || (B[id] && (B[id][4] === 1 || B[id][6] === 'shape')); }
  function isSolid(id) { return id !== AIR && id !== WATER && kind(id) !== 'plant'; }

  // ───────── 월드(가까운 곳만 그때그때 만든다) ─────────
  // 1블록 = 1규빗(약 45cm), 사람 키 약 3.4칸. 세계는 2048×2048칸, 높이 80칸.
  // 32×32칸 기둥을 내 둘레만 만들어 보여 주고, 멀어지면 지운다. 땅·산·강·숲은 공식으로 만들어서 같은 자리는 언제 가도 똑같다.
  var WS = 2048, SY = 80, G = 16, CS = 32, NC = WS / CS, CY = Math.ceil(SY / CS);
  var SX = WS, SZ = WS;
  var COLS = new Array(NC * NC);   // 기둥: { d: 블록, sky: 하늘 그늘, lamps: 등불, mod: 고친 적 있음 }
  function colAt(x, z) { if (x < 0 || z < 0 || x >= WS || z >= WS) return null; return COLS[(z >> 5) * NC + (x >> 5)]; }
  function get(x, y, z) {
    if (y < 0) return BASALT;
    if (y >= SY) return AIR;
    var c = colAt(x, z); if (!c) return AIR;
    return c.d[(y * CS + (z & 31)) * CS + (x & 31)];
  }
  var genCol = null, genCX = 0, genCZ = 0;   // 지금 만드는 기둥(그 밖은 쓰지 않음)
  function setRaw(x, y, z, id) {
    if (y < 0 || y >= SY || x < 0 || z < 0 || x >= WS || z >= WS) return;
    var c;
    if (genCol) { if ((x >> 5) !== genCX || (z >> 5) !== genCZ) return; c = genCol; }
    else { c = colAt(x, z); if (!c) return; }
    c.d[(y * CS + (z & 31)) * CS + (x & 31)] = id;
  }
  function fill(x1, y1, z1, x2, y2, z2, id) {
    if (genCol) {   // 만드는 기둥 안쪽만
      x1 = Math.max(x1, genCX * CS); x2 = Math.min(x2, genCX * CS + CS - 1);
      z1 = Math.max(z1, genCZ * CS); z2 = Math.min(z2, genCZ * CS + CS - 1);
    }
    y1 = Math.max(0, y1); y2 = Math.min(SY - 1, y2);
    for (var y = y1; y <= y2; y++) for (var z = z1; z <= z2; z++) for (var x = x1; x <= x2; x++) setRaw(x, y, z, id);
  }

  // 방주: 창 6:15 길이 300 · 너비 50 · 높이 30 — 세계 한가운데
  var AL = 300, AW = 50, AH = 30, XM = 1024, AX0 = XM - 150, AZ0 = 846;
  var AX1 = AX0 + AL - 1, AZ1 = AZ0 + AW - 1, AY0 = G, AY1 = G + AH - 1;
  // 마을 땅: 방주 남쪽, 24×24칸, 8줄 × 8칸 = 64필지
  var PLOT = 24, PGAP = 4, PCOLS = 8, PROWS = 8, PH = 32, PSTEP = PLOT + PGAP;
  var PX0 = XM - Math.floor((PCOLS * PSTEP - PGAP) / 2), PZ0 = AZ1 + 17;
  var VX1 = PX0 + PCOLS * PSTEP - 1, VZ1 = PZ0 + PROWS * PSTEP - 1;
  // 남쪽 호수, 그 동쪽 역청 구덩이(창 14:10)
  var LX = XM, LZ = AZ0 + 328, LRX = 78, LRZ = 20;
  var TARR = [LX + LRX + 8, LZ - 18, LX + LRX + 46, LZ + 22];
  // 먼 곳: 북쪽 바다, 동쪽 사막(오아시스), 서쪽 끝 아라랏 산(창 8:4)
  var SEA_Z = AZ0 - 150, DES_X = VX1 + 170, ARX = XM - 600, ARZ = AZ0 + 60, OASX = VX1 + 430, OASZ = PZ0 + 70;
  function plotOrigin(i) { return { x: PX0 + (i % PCOLS) * PSTEP, z: PZ0 + Math.floor(i / PCOLS) * PSTEP }; }
  function plotAt(x, z) {
    var cx = x - PX0, cz = z - PZ0;
    if (cx < 0 || cz < 0) return -1;
    var c = Math.floor(cx / PSTEP), r = Math.floor(cz / PSTEP);
    if (c >= PCOLS || r >= PROWS || cx % PSTEP >= PLOT || cz % PSTEP >= PLOT) return -1;
    return r * PCOLS + c;
  }
  var PY0 = G - 3;
  var PSIZE = PLOT * PLOT * (G + PH - PY0);
  function inArk(x, y, z) { return x >= AX0 - 1 && x <= AX1 + 1 && z >= AZ0 - 1 && z <= AZ1 + 1 && y >= AY0 - 1 && y <= AY1 + 1; }
  // 마을·방주 마당(길과 마당은 캐지 않음)
  var TOWN = [[AX0 - 8, AZ0 - 8, AX1 + 8, AZ1 + 8], [PX0 - 8, AZ1, VX1 + 8, VZ1 + 6]];
  function inTown(x, z) { for (var i = 0; i < TOWN.length; i++) { var r = TOWN[i]; if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3]) return true; } return false; }
  function rnd(s) { s = Math.sin(s * 127.1) * 43758.5453; return s - Math.floor(s); }
  function hash2(x, z, seed) { return rnd(x * 0.12989 + z * 0.78233 + seed * 3.7719); }
  function vnoise(x, z, s, seed) {
    var gx = x / s, gz = z / s, ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz;
    fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
    var a = rnd(ix * 57.31 + iz * 131.73 + seed * 17.13), b = rnd((ix + 1) * 57.31 + iz * 131.73 + seed * 17.13);
    var c = rnd(ix * 57.31 + (iz + 1) * 131.73 + seed * 17.13), d = rnd((ix + 1) * 57.31 + (iz + 1) * 131.73 + seed * 17.13);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }
  function sstep(a, b, v) { var t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); }
  function lakeE(x, z) { var dx = (x - LX) / LRX, dz = (z - LZ) / LRZ; return dx * dx + dz * dz; }
  // 강: 서쪽 산 골짜기 → 남쪽 호수(마을은 비켜 감)
  var RIV = [[XM - 180, AZ0 + 60], [XM - 164, AZ0 + 136], [XM - 150, AZ0 + 216], [XM - 136, AZ0 + 286], [XM - 110, AZ0 + 320], [LX - LRX + 6, LZ]];
  function riverDist(x, z) {
    var best = 99;
    for (var s = 0; s + 1 < RIV.length; s++) {
      var a = RIV[s], b = RIV[s + 1], vx = b[0] - a[0], vz = b[1] - a[1], len = Math.hypot(vx, vz);
      var u = clamp01(((x - a[0]) * vx + (z - a[1]) * vz) / (len * len)) * len;
      var px = a[0] + vx * u / len + Math.sin(u * 0.08 + s) * 4, pz = a[1] + vz * u / len;
      var d = Math.hypot(x - px, z - pz); if (d < best) best = d;
    }
    return best;
  }
  function distOut(x, z) {
    var best = 1e9, rects = TOWN.concat([[TARR[0] - 4, TARR[1] - 4, TARR[2] + 4, TARR[3] + 4]]);
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i], dx = Math.max(r[0] - x, 0, x - r[2]), dz = Math.max(r[1] - z, 0, z - r[3]);
      best = Math.min(best, Math.hypot(dx, dz));
    }
    var le = lakeE(x, z);
    if (le < 1.7) best = 0; else best = Math.min(best, (Math.sqrt(le) - Math.sqrt(1.7)) * 40);
    var od = Math.hypot(x - OASX, z - OASZ); if (od < 30) best = Math.min(best, Math.max(0, od - 18));
    return best;
  }
  function region(x, z) {
    if (x >= TARR[0] - 4 && x <= TARR[2] + 4 && z >= TARR[1] - 4 && z <= TARR[3] + 4) return 'tar';
    if (lakeE(x, z) < 1.7) return 'lake';
    if (Math.hypot(x - OASX, z - OASZ) < 34) return 'oasis';
    if (z < SEA_Z + 10 + (vnoise(x, z, 60, 9) - 0.5) * 40) return 'sea';
    if (Math.hypot(x - ARX, z - ARZ) < 230) return 'ararat';
    var southF = z + (vnoise(x, z, 70, 12) - 0.5) * 60;
    if (x < PX0 - 8 && southF < LZ + 120) return 'west';
    if (x > DES_X + (vnoise(x, z, 80, 8) - 0.5) * 60 && southF < LZ + 120) return 'desert';
    if (x > VX1 + 8 || (x > AX1 + 8 && z < AZ1 + 20)) return 'east';
    if (z > LZ + 50) return 'south';
    return 'other';
  }
  function placeName(x, z) { return null; }

  // 한 자리(기둥)의 땅 모양: T.h(맨 위 블록 y), T.top/T.sub(겉흙·속흙), T.wtop(물 높이, 없으면 -1), T.reg
  var T = { h: 0, top: 0, sub: 0, wtop: -1, reg: '', rd: 99 };
  function terrain(x, z) {
    var reg = region(x, z), d = distOut(x, z), bl = sstep(3, 29, d);
    var n1 = vnoise(x, z, 26, 1), n2 = vnoise(x, z, 7, 2);
    // 서쪽은 높은 산, 동쪽은 낮은 언덕, 그 밖은 들판
    var southK = 1 - sstep(LZ + 60, LZ + 180, z + (vnoise(x, z, 70, 12) - 0.5) * 60);   // 남쪽은 들판
    var westW = clamp01((PX0 - 8 - x) / 30) * southK, ampW = 8 + 36 * clamp01((PX0 - 8 - x) / 60 + 0.15);
    var ridge = 1 - Math.abs(vnoise(x, z, 34, 4) * 2 - 1);
    var amp = 3 + westW * (ampW - 3) + (reg === 'east' ? 3 : 0);
    var hf = bl * amp * (0.2 + 0.5 * n1 + 0.4 * (westW > 0 ? ridge : 0.5)) + bl * 2.5 * n2;
    // 아라랏 산: 서쪽 끝에 우뚝(창 8:4)
    var ad = Math.hypot(x - ARX, z - ARZ), ar = Math.exp(-ad * ad / (2 * 95 * 95));
    hf += bl * 54 * ar * (0.85 + 0.15 * n2);
    // 동쪽 사막: 모래 언덕
    var desW = sstep(DES_X - 40, DES_X + 30, x + (vnoise(x, z, 80, 8) - 0.5) * 60) * southK;
    var dune = 2 + 5 * Math.abs(Math.sin(x * 0.045 + vnoise(x, z, 40, 5) * 4)) * vnoise(x, z, 30, 6);
    hf = hf * (1 - desW) + bl * dune * desW;
    var h = G - 1 + Math.round(hf);
    // 북쪽 바다: 바닷가에서 점점 깊게
    var seaD = (SEA_Z + (vnoise(x, z, 60, 9) - 0.5) * 40) - z;
    if (seaD > -12) h = Math.min(h, G - 1 - Math.round(clamp01((seaD + 12) / 40) * 11 + n2 * 2) + (seaD < 0 ? 1 : 0));
    // 강 골짜기
    var rd = riverDist(x, z);
    if (rd < 15) { var vf = clamp01((rd - 4) / 11); vf = vf * vf; h = Math.round(G - 1 + (h - (G - 1)) * vf); }
    if (h > SY - 4) h = SY - 4;
    var top = GRASS, sub = DIRT, wtop = -1;
    var le = lakeE(x, z), od = Math.hypot(x - OASX, z - OASZ);
    if (le < 1) { h = G - 2 - Math.floor(5 * (1 - le)); wtop = G - 1; top = hash2(x, z, 1) < 0.5 ? CLAY : SAND; sub = CLAY; }
    else if (od < 11) { h = G - 2 - Math.floor(4 * (1 - od / 11)); wtop = G - 1; top = SAND; sub = CLAY; }
    else if (rd <= 2.2) { wtop = h; h = h - 2; top = hash2(x, z, 2) < 0.5 ? CLAY : SAND; sub = SAND; }
    else if (h < G - 1) { wtop = G - 1; top = n2 < 0.3 ? 18 : SAND; sub = SAND; }
    else if (le < 1.3 || od < 16 || rd <= 3.2) { top = le < 1.3 && hash2(x, z, 3) < 0.3 ? CLAY : SAND; sub = SAND; }
    else if (desW > 0.5) { top = SAND; sub = SAND; }
    else if (seaD > -16) { top = SAND; sub = SAND; }
    else if (h > G + 46 + n2 * 4) { top = SNOW; sub = STONE; }
    else if ((westW > 0 || ar > 0.25) && h > G + 15 + vnoise(x, z, 9, 3) * 9) { top = STONE; sub = STONE; }
    T.h = h; T.top = top; T.sub = sub; T.wtop = wtop; T.reg = reg; T.rd = rd;
    return T;
  }
  function surfaceY(x, z) { terrain(x, z); return Math.max(T.h, T.wtop) + 1; }

  // 역청 구덩이 자리(고정)
  var TARPITS = [];
  for (var tp0 = 0; tp0 < 9; tp0++) TARPITS.push([TARR[0] + 2 + Math.floor(rnd(tp0 * 7.7 + 3) * (TARR[2] - TARR[0] - 6)), TARR[1] + 2 + Math.floor(rnd(tp0 * 9.1 + 4) * (TARR[3] - TARR[1] - 6)), 3 + Math.floor(rnd(tp0 * 2.2) * 3)]);

  function genColumn(cx, cz) {
    var col = { d: new Uint8Array(CS * SY * CS), sky: new Int16Array(CS * CS), lamps: [], mod: false };
    genCol = col; genCX = cx; genCZ = cz;
    var x0 = cx * CS, z0 = cz * CS, lx, lz, x, z, y;
    var tops = new Int16Array(CS * CS), topIds = new Uint8Array(CS * CS), wtops = new Int16Array(CS * CS);
    for (lz = 0; lz < CS; lz++) for (lx = 0; lx < CS; lx++) {
      x = x0 + lx; z = z0 + lz;
      terrain(x, z);
      var h = T.h, d = col.d;
      d[(0 * CS + lz) * CS + lx] = BASALT;
      for (y = 1; y <= h; y++) {
        var id = y === h ? T.top : (y > h - 4 ? T.sub : STONE);
        if (id === STONE && y < h - 2) {
          // 돌 속 석회암·검은 돌(2칸씩 뭉쳐서)
          var o = hash2((x >> 1) * 3 + y, (z >> 1) * 5 - (y >> 1), 7);
          if (o < 0.035) id = y < 7 || o < 0.008 ? BASALT : LIME;
          else if (hash2(x * 3 + y * 7, z * 5 - y, 14) < 0.7) {
            var cl = hash2((x >> 1) * 7 + (y >> 1) * 131, (z >> 1) * 11 - (y >> 1) * 17, 13);
            if (cl < 0.006 && y <= 12) id = ORE_AU;
            else if (cl >= 0.006 && cl < 0.014 && y <= 18) id = ORE_AG;
            else if (cl >= 0.014 && cl < 0.034 && y <= 48) id = ORE_FE;
            else if (cl >= 0.034 && cl < 0.06 && y <= 64) id = ORE_CU;
            else if (cl >= 0.06 && cl < 0.064 && y <= 22) id = ORE_ONYX;
            else if (cl >= 0.064 && cl < 0.067 && y <= 10) id = ORE_SAPH;
            else if (cl >= 0.067 && cl < 0.0695 && y <= 8) id = ORE_DIA;
          }
          // 석탄: 큰 덩이(3칸씩)로 흔하게, 산 속 높은 곳까지
          if (id === STONE && y <= 72) { var cc = hash2(Math.floor(x / 3) * 13 + Math.floor(y / 3) * 71, Math.floor(z / 3) * 17 - Math.floor(y / 3) * 5, 15); if (cc < 0.05 && hash2(x * 5 + y, z * 3 - y * 2, 16) < 0.75) id = ORE_COAL; }
          // 맨 아래 몇 칸은 깊은 돌(더 단단함)
          if (y <= 4 + Math.floor(hash2(x >> 2, z >> 2, 17) * 3)) { if (id === STONE) id = DEEP; else if (DEEPV[id]) id = DEEPV[id]; }
        }
        d[(y * CS + lz) * CS + lx] = id;
      }
      for (y = h + 1; y <= T.wtop; y++) d[(y * CS + lz) * CS + lx] = WATER;
      tops[lz * CS + lx] = h; topIds[lz * CS + lx] = T.top; wtops[lz * CS + lx] = T.wtop;
      // 물가 갈대, 들꽃
      if (T.wtop < 0) {
        var le = lakeE(x, z), od = Math.hypot(x - OASX, z - OASZ), hh = hash2(x, z, 11);
        if (((le >= 1 && le < 1.22) || (od >= 11 && od < 13.5) || (T.rd > 2.2 && T.rd < 3.6)) && hh < 0.45 && h + 1 < SY) d[((h + 1) * CS + lz) * CS + lx] = REED;
        else if (T.top === GRASS && hh > 0.955 && plotAt(x, z) < 0 && !(z > AZ0 - 5 && z < AZ1 + 5 && x > AX0 - 5 && x < AX1 + 5)) d[((h + 1) * CS + lz) * CS + lx] = FLOWER;
      }
    }
    carveCaves(col, cx, cz, tops, wtops);
    // 나무: 7칸 격자마다 한 그루 후보(옆 기둥 나무도 걸치게)
    for (var gz = Math.floor((z0 - 6) / 7); gz <= Math.floor((z0 + CS + 6) / 7); gz++) for (var gx = Math.floor((x0 - 6) / 7); gx <= Math.floor((x0 + CS + 6) / 7); gx++) {
      var tx = gx * 7 + Math.floor(hash2(gx, gz, 21) * 6), tz = gz * 7 + Math.floor(hash2(gx, gz, 22) * 6);
      if (inTown(tx, tz) || distOut(tx, tz) < 6 || plotAt(tx, tz) >= 0) continue;
      terrain(tx, tz);
      if (T.wtop >= 0) continue;
      var reg = T.reg, p = reg === 'east' ? 0.6 : (reg === 'south' ? 0.16 : (reg === 'west' || reg === 'ararat' ? 0.14 : (reg === 'other' ? 0.1 : 0)));
      var palm = reg === 'oasis' || (reg === 'desert' && hash2(gx, gz, 24) < 0.015);
      if (palm) p = reg === 'oasis' ? 0.7 : 1;
      if (hash2(gx, gz, 23) > p) continue;
      if (palm) { if (T.top === SAND) palmTree(tx, T.h + 1, tz, 8 + Math.floor(hash2(gx, gz, 25) * 4)); continue; }
      if (T.top !== GRASS) continue;
      var t2 = T.h; terrain(tx + 1, tz + 1); if (T.h !== t2) continue;
      tree(tx, t2 + 1, tz, 7 + Math.floor(hash2(gx, gz, 26) * 5));
    }
    // 마을·방주(그 기둥에 걸친 부분만)
    if (x0 + CS > TOWN[0][0] - 6 && x0 < TOWN[1][2] + 6 && z0 + CS > TOWN[0][1] - 6 && z0 < LZ - LRZ) buildTown();
    if (x0 + CS > TARR[0] && x0 < TARR[2] + 6 && z0 + CS > TARR[1] && z0 < TARR[3] + 6)
      TARPITS.forEach(function (t) { fill(t[0], G - 1, t[1], t[0] + t[2] - 1, G - 1, t[1] + t[2] - 1, AIR); fill(t[0], G - 3, t[1], t[0] + t[2] - 1, G - 2, t[1] + t[2] - 1, TAR); });
    // 학생 집
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var po = plotOrigin(i);
      if (po.x + PLOT <= x0 || po.x >= x0 + CS || po.z + PLOT <= z0 || po.z >= z0 + CS) continue;
      if (plotData[i]) { var a = plotData[i], k = 0; for (y = PY0; y < G + PH; y++) for (z = 0; z < PLOT; z++) for (x = 0; x < PLOT; x++) setRaw(po.x + x, y, po.z + z, a[k++]); }
    }
    markPlots();
    var ed = EDITS[cz * NC + cx]; if (ed) for (var li in ed) col.d[li] = ed[li];
    genCol = null;
    // 하늘 그늘, 등불
    for (lz = 0; lz < CS; lz++) for (lx = 0; lx < CS; lx++) skyScan(col, lx, lz);
    for (var q = 0; q < col.d.length; q++) if (LIGHTS[col.d[q]]) { var qx = q % CS, r0 = (q - qx) / CS, qz = r0 % CS, qy = (r0 - qz) / CS; col.lamps.push([x0 + qx, qy, z0 + qz]); }
    COLS[cz * NC + cx] = col;
    return col;
  }
  // 땅속 굴: 둘레 기둥에서 시작한 굴(벌레가 지나간 길처럼 구불구불)이 이 기둥을 지나면 판다. 가끔 땅 위로 입구가 열린다.
  function carveCaves(col, cx, cz, tops, wtops) {
    var x0 = cx * CS, z0 = cz * CS, d = col.d;
    for (var oz = cz - 3; oz <= cz + 3; oz++) for (var ox = cx - 3; ox <= cx + 3; ox++) {
      if (hash2(ox, oz, 31) > 0.62) continue;
      var sx = ox * CS + hash2(ox, oz, 32) * CS, sz = oz * CS + hash2(ox, oz, 35) * CS;
      if (sx < 12 || sz < 12 || sx > WS - 12 || sz > WS - 12) continue;
      terrain(sx | 0, sz | 0);
      var ent = hash2(ox, oz, 33) < 0.3 && T.wtop < 0 && T.h >= G && !inTown(sx | 0, sz | 0) && plotAt(sx | 0, sz | 0) < 0 && distOut(sx | 0, sz | 0) > 8;
      var py = ent ? T.h + 1 : 3 + hash2(ox, oz, 36) * Math.max(3, T.h - 9);
      var L = 50 + hash2(ox, oz, 37) * 70 | 0, yaw = hash2(ox, oz, 38) * Math.PI * 2, pitch = ent ? -0.6 : (hash2(ox, oz, 39) - 0.5) * 0.4;
      var px = sx, pz = sz, big = hash2(ox, oz, 40) < 0.2 ? (L * 0.6 | 0) : -99;   // 가끔 넓은 방
      for (var i = 0; i < L; i++) {
        yaw += (hash2(ox * 7 + i, oz * 13 - i, 41) - 0.5) * 0.45;
        pitch = ent && i < 14 ? -0.6 : pitch * 0.85 + (hash2(ox * 3 - i, oz * 5 + i, 42) - 0.5) * 0.18;
        var cpi = Math.cos(pitch);
        px += Math.cos(yaw) * cpi; pz += Math.sin(yaw) * cpi; py += Math.sin(pitch);
        if (py < 3) { py = 3; pitch = Math.abs(pitch); }
        var r = 1.4 + Math.sin(i / L * Math.PI) * 1.1 + (Math.abs(i - big) < 4 ? 2.4 : 0), ry = r * 0.75;
        if (px + r < x0 || px - r >= x0 + CS || pz + r < z0 || pz - r >= z0 + CS) continue;
        var xa = Math.max(x0, Math.floor(px - r)), xb = Math.min(x0 + CS - 1, Math.floor(px + r));
        var za = Math.max(z0, Math.floor(pz - r)), zb = Math.min(z0 + CS - 1, Math.floor(pz + r));
        var ya = Math.max(1, Math.floor(py - ry)), yb = Math.min(SY - 2, Math.floor(py + ry));
        for (var z = za; z <= zb; z++) for (var x = xa; x <= xb; x++) {
          var li = (z - z0) * CS + (x - x0), top = tops[li];
          var lim = ent && i < 16 && wtops[li] < 0 ? top : top - 3;   // 입구 굴의 처음 부분만 땅 위로 뚫린다
          for (var y = ya; y <= Math.min(yb, lim); y++) {
            var ddx = (x + 0.5 - px) / r, ddy = (y + 0.5 - py) / ry, ddz = (z + 0.5 - pz) / r;
            if (ddx * ddx + ddy * ddy + ddz * ddz > 1) continue;
            var k = (y * CS + (z - z0)) * CS + (x - x0);
            if (d[k] === WATER) continue;
            d[k] = AIR;
            if (y === top && y + 1 < SY && kind(d[k + CS * CS]) === 'plant') d[k + CS * CS] = AIR;
          }
        }
      }
    }
  }
  function skyScan(col, lx, lz) {
    var t = -1;
    for (var y = SY - 1; y >= 0; y--) { var id = col.d[(y * CS + lz) * CS + lx]; if (isSolid(id) && id !== GLASS && id !== LEAF) { t = y; break; } }
    col.sky[lz * CS + lx] = t;
  }
  function updateSky(x, z) { var c = colAt(x, z); if (c) skyScan(c, x & 31, z & 31); }
  function skyAt(x, z) { var c = colAt(x, z); return c ? c.sky[(z & 31) * CS + (x & 31)] : -1; }
  function tree(x, y, z, h) {
    fill(x, y, z, x + 1, y + h - 1, z + 1, LOG);
    for (var ly = h - 3; ly <= h + 2; ly++) {
      var rr = ly > h ? 2 : 4;
      for (var dz = -rr; dz <= rr + 1; dz++) for (var dx = -rr; dx <= rr + 1; dx++) {
        var ddx = dx - 0.5, ddz = dz - 0.5;
        if (ddx * ddx + ddz * ddz <= (rr + 0.6) * (rr + 0.6) && get2(x + dx, y + ly, z + dz) === AIR) setRaw(x + dx, y + ly, z + dz, LEAF);
      }
    }
  }
  function palmTree(x, y, z, h) {
    for (var i = 0; i < h; i++) setRaw(x + (i > h * 0.6 ? 1 : 0), y + i, z, LOG);
    var tx = x + 1, ty = y + h;
    setRaw(tx, ty, z, LEAF);
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(function (d) {
      for (var k = 1; k <= 4; k++) setRaw(tx + d[0] * k, ty - (k > 2 ? 1 : 0), z + d[1] * k, LEAF);
    });
  }
  // 만드는 중에는 그 기둥 안을 읽는다
  function get2(x, y, z) {
    if (genCol && (x >> 5) === genCX && (z >> 5) === genCZ) { if (y < 0 || y >= SY) return AIR; return genCol.d[(y * CS + (z & 31)) * CS + (x & 31)]; }
    return get(x, y, z);
  }
  function buildTown() {
    fill(AX0 - 4, G - 1, AZ0 - 4, AX1 + 4, G - 1, AZ1 + 4, SAND);
    fill(XM - 3, G - 1, AZ1 + 1, XM + 2, G - 1, PZ0 - 1, PATH);
    for (var r = 0; r <= PROWS; r++) { var zz = PZ0 - PGAP + r * PSTEP; fill(PX0 - PGAP, G - 1, zz, VX1, G - 1, zz + PGAP - 1, PATH); }
    for (var c = 0; c <= PCOLS; c++) { var xx = PX0 - PGAP + c * PSTEP; fill(xx, G - 1, PZ0 - PGAP, xx + PGAP - 1, G - 1, VZ1, PATH); }
    fill(XM - 2, G - 1, VZ1 + 1, XM + 1, G - 1, LZ - LRZ - 2, PATH);
    // 마을 땅 위 꽃·풀은 치운다
    fill(PX0 - PGAP, G, PZ0 - PGAP, VX1, G, VZ1, AIR);
    buildArk();
  }

  function buildArk() {
    // 바닥·벽·지붕: 역청을 그 안팎에 칠한 나무(창 6:14)
    fill(AX0, AY0, AZ0, AX1, AY0, AZ1, PITCH);
    fill(AX0, AY0 + 1, AZ0, AX1, AY1, AZ0, PITCH);
    fill(AX0, AY0 + 1, AZ1, AX1, AY1, AZ1, PITCH);
    fill(AX0, AY0 + 1, AZ0, AX0, AY1, AZ1, PITCH);
    fill(AX1, AY0 + 1, AZ0, AX1, AY1, AZ1, PITCH);
    fill(AX0, AY1, AZ0, AX1, AY1, AZ1, PITCH);
    fill(AX0 + 1, AY0 + 1, AZ0 + 1, AX1 - 1, AY1 - 1, AZ1 - 1, AIR);
    // 상 중 하 삼층(창 6:16)
    fill(AX0 + 1, AY0 + 10, AZ0 + 1, AX1 - 1, AY0 + 10, AZ1 - 1, GOPHER);
    fill(AX0 + 1, AY0 + 20, AZ0 + 1, AX1 - 1, AY0 + 20, AZ1 - 1, GOPHER);
    // 창: 위에서부터 한 규빗(지붕 바로 아래 한 줄)을 사방으로 트고 5칸마다 기둥
    var yw = AY1 - 1, x, z;
    fill(AX0 + 1, yw, AZ0, AX1 - 1, yw, AZ0, AIR); fill(AX0 + 1, yw, AZ1, AX1 - 1, yw, AZ1, AIR);
    fill(AX0, yw, AZ0 + 1, AX0, yw, AZ1 - 1, AIR); fill(AX1, yw, AZ0 + 1, AX1, yw, AZ1 - 1, AIR);
    for (x = AX0 + 5; x < AX1; x += 5) { setRaw(x, yw, AZ0, LOG); setRaw(x, yw, AZ1, LOG); }
    for (z = AZ0 + 5; z < AZ1; z += 5) { setRaw(AX0, yw, z, LOG); setRaw(AX1, yw, z, LOG); }
    // 문은 옆으로: 남쪽 긴 벽 가운데, 하층
    fill(XM - 3, AY0 + 1, AZ1, XM + 2, AY0 + 8, AZ1, AIR);
    // 칸들(창 6:14)
    [AY0 + 1, AY0 + 11].forEach(function (y) {
      for (x = AX0 + 25; x < AX1; x += 25) {
        fill(x, y, AZ0 + 1, x, y + 1, AZ0 + 17, GOPHER);
        if (Math.abs(x - XM) > 6) fill(x, y, AZ1 - 17, x, y + 1, AZ1 - 1, GOPHER);
      }
    });
    // 층 사이 계단(10단)과 계단 구멍
    function stairs(x0, yBase, dir) {
      for (var i = 0; i < 10; i++) { var sx = x0 + dir * i; fill(sx, yBase + 1, AZ0 + 21, sx, yBase + 1 + i, AZ0 + 23, GOPHER); }
      var a = x0 - dir, b = x0 + dir * 8;
      fill(Math.min(a, b), yBase + 10, AZ0 + 21, Math.max(a, b), yBase + 10, AZ0 + 23, AIR);
    }
    stairs(AX0 + 12, AY0, 1); stairs(AX1 - 12, AY0, -1);
    stairs(AX0 + 40, AY0 + 10, 1); stairs(AX1 - 40, AY0 + 10, -1);
    var zc = AZ0 + Math.floor(AW / 2);
    [AY0, AY0 + 10, AY0 + 20].forEach(function (y) { for (x = AX0 + 5; x < AX1; x += 10) setRaw(x, y, zc, LAMP); });
  }

  var plotData = {};   // 필지 번호 → 그 땅 블록(Uint8Array)
  // 내 땅 밖에서 캔 자리·놓은 것: 기둥별로 기억해 두었다가 그 기둥을 다시 만들 때 덮어씀(이 기기에 저장)
  var EDITS = {}, editTimer = null;
  try { EDITS = JSON.parse(localStorage.getItem('arkVillage.edits') || '{}') || {}; } catch (e) { EDITS = {}; }
  function recordEdit(x, y, z, id) {
    if (x < 0 || z < 0 || x >= WS || z >= WS || y < 0 || y >= SY) return;
    var k = (z >> 5) * NC + (x >> 5), li = (y * CS + (z & 31)) * CS + (x & 31);
    (EDITS[k] || (EDITS[k] = {}))[li] = id;
    clearTimeout(editTimer); editTimer = setTimeout(saveEdits, 1500);
  }
  function saveEdits() { try { localStorage.setItem('arkVillage.edits', JSON.stringify(EDITS)); } catch (e) {} }
  window.addEventListener('pagehide', saveEdits);

  // ───────── 그리기(청크 메시) ─────────
  var chunks = {}, scene, camera, renderer, opaqueMat, glassMat, plantMat, atlasTex;
  var FACES = [
    { n: [1, 0, 0], s: 0.80, v: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], uv: function (v) { return [1 - v[2], v[1]]; } },
    { n: [-1, 0, 0], s: 0.74, v: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], uv: function (v) { return [v[2], v[1]]; } },
    { n: [0, 1, 0], s: 1.00, v: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], uv: function (v) { return [v[0], v[2]]; } },
    { n: [0, -1, 0], s: 0.55, v: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], uv: function (v) { return [v[0], v[2]]; } },
    { n: [0, 0, 1], s: 0.88, v: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], uv: function (v) { return [v[0], v[1]]; } },
    { n: [0, 0, -1], s: 0.68, v: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], uv: function (v) { return [1 - v[0], v[1]]; } }
  ];
  // 풀·꽃처럼 엇갈린 두 장
  var CROSS = [[[0.15, 0, 0.15], [0.15, 1, 0.15], [0.85, 1, 0.85], [0.85, 0, 0.85]], [[0.85, 0, 0.15], [0.85, 1, 0.15], [0.15, 1, 0.85], [0.15, 0, 0.85]]];
  function tileUV(t, lu, lv) {
    var tc = t % ACOLS, tr = Math.floor(t / ACOLS), e = 0.3;
    return [(tc * TS + e + lu * (TS - 2 * e)) / (TS * ACOLS), 1 - (tr * TS + e + (1 - lv) * (TS - 2 * e)) / (TS * AROWS)];
  }
  var BT = [];
  function faceTile(id, f) { return BT[id][f === 2 ? 0 : (f === 3 ? 2 : 1)]; }

  function solidAO(x, y, z) { var id = get(x, y, z); return isSolid(id) && id !== GLASS ? 1 : 0; }
  function shadowed(x, y, z) { return y < SY && skyAt(x, z) > y; }
  // 하늘빛: 하늘이 보이면 1, 지붕 한 겹 아래(집 안)는 0.62, 땅속 깊을수록 어둡게, 굴 입구 가까이는 조금 밝게
  function skyLight(x, y, z) {
    if (y >= SY) return 1;
    var t = skyAt(x, z); if (t < y) return 1;
    var n = 0;
    for (var yy = y + 1; yy <= t && n < 4; yy++) { var b = get(x, yy, z); if (b !== AIR && b !== GLASS && b !== LEAF && b !== WATER && kind(b) !== 'plant' && !SHAPE[b]) n++; }
    var v = n <= 1 ? 0.62 : (n === 2 ? 0.42 : (n === 3 ? 0.24 : 0.1));
    if (v < 0.62) for (var dz = -2; dz <= 2; dz++) for (var dx = -2; dx <= 2; dx++) { if (skyAt(x + dx, z + dz) < y) { var o = 0.62 - (Math.abs(dx) + Math.abs(dz)) * 0.12; if (o > v) v = o; } }
    return v;
  }
  // 등불 빛: 등불 둘레 7.5칸까지 따뜻하게(밤에 보임). 정점 색 r=하늘빛, g=등불빛
  function lampsNear(x0, y0, z0, x1, y1, z1) {
    var out = [];
    for (var cz = Math.floor(z0 / CS); cz <= Math.floor(z1 / CS); cz++) for (var cx = Math.floor(x0 / CS); cx <= Math.floor(x1 / CS); cx++) {
      if (!inWorldC(cx, cz)) continue;
      var c = COLS[cz * NC + cx]; if (!c) continue;
      for (var i = 0; i < c.lamps.length; i++) { var l = c.lamps[i]; if (l[0] >= x0 && l[0] <= x1 && l[1] >= y0 && l[1] <= y1 && l[2] >= z0 && l[2] <= z1) out.push(l); }
    }
    return out;
  }
  function lampChanged(x, y, z) {
    for (var cz = Math.floor((z - 8) / CS); cz <= Math.floor((z + 8) / CS); cz++) for (var cx = Math.floor((x - 8) / CS); cx <= Math.floor((x + 8) / CS); cx++) {
      if (!inWorldC(cx, cz) || !meshedCols[cz * NC + cx]) continue;
      for (var cy = Math.max(0, Math.floor((y - 8) / CS)); cy <= Math.min(CY - 1, Math.floor((y + 8) / CS)); cy++) buildChunk(cx, cy, cz);
    }
  }
  function buildChunk(cx, cy, cz) {
    var key = cx + ',' + cy + ',' + cz, old = chunks[key];
    if (old) { old.forEach(function (m) { scene.remove(m); m.geometry.dispose(); }); }
    var P = [[], [], []], C = [[], [], []], U = [[], [], []], I = [[], [], []];
    var x0 = cx * CS, y0 = cy * CS, z0 = cz * CS;
    var colm = COLS[cz * NC + cx]; if (!colm) { delete chunks[key]; return; } var cd = colm.d;
    var lamps = lampsNear(x0 - 8, y0 - 8, z0 - 8, x0 + CS + 8, y0 + CS + 8, z0 + CS + 8);
    function blk(px, py, pz) {
      if (!lamps.length) return 0;
      var best = 0;
      for (var i = 0; i < lamps.length; i++) {
        var l = lamps[i], dx = px - l[0] - 0.5, dy = py - l[1] - 0.5, dz = pz - l[2] - 0.5, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 56.25) { var vv = 1 - Math.sqrt(d2) / 7.5; if (vv > best) best = vv; }
      }
      return best;
    }
    for (var y = y0; y < Math.min(y0 + CS, SY); y++)
      for (var z = z0; z < Math.min(z0 + CS, SZ); z++)
        for (var x = x0; x < Math.min(x0 + CS, SX); x++) {
          var id = cd[(y * CS + (z & 31)) * CS + (x & 31)];
          if (id === AIR) continue;
          var def = B[id], k, v, uv, start;
          if (def[6] === 'plant') {
            var ps = def[5] || LIGHTS[id] ? 1 : skyLight(x, y, z), tp = BT[id][1];
            for (var q = 0; q < 2; q++) {
              start = P[2].length / 3;
              for (k = 0; k < 4; k++) {
                v = CROSS[q][k]; P[2].push(x + v[0], y + v[1], z + v[2]);
                uv = tileUV(tp, k < 2 ? 0 : 1, v[1]); U[2].push(uv[0], uv[1]); C[2].push(ps, def[5] || LIGHTS[id] ? 1 : blk(x + v[0], y + v[1], z + v[2]), 0);
              }
              I[2].push(start, start + 1, start + 2, start, start + 2, start + 3);
            }
            continue;
          }
          if (def[6] === 'shape') {
            // 문·계단·반 블록·울타리: 작은 상자들
            var sb = shapeBoxes(id, x, y, z), sh0 = skyLight(x, y + 1, z), bk = SHAPE[id].type === 'ladder' ? 2 : 0;
            for (var bi3 = 0; bi3 < sb.length; bi3++) {
              var bb = sb[bi3];
              for (var f2 = 0; f2 < 6; f2++) {
                var F2 = FACES[f2];
                var onB = (f2 === 0 && bb[3] === 1) || (f2 === 1 && bb[0] === 0) || (f2 === 2 && bb[4] === 1) || (f2 === 3 && bb[1] === 0) || (f2 === 4 && bb[5] === 1) || (f2 === 5 && bb[2] === 0);
                if (onB && !isTrans(get(x + F2.n[0], y + F2.n[1], z + F2.n[2]))) continue;
                start = P[bk].length / 3;
                for (k = 0; k < 4; k++) {
                  v = F2.v[k];
                  var vx = v[0] ? bb[3] : bb[0], vy = v[1] ? bb[4] : bb[1], vz = v[2] ? bb[5] : bb[2];
                  P[bk].push(x + vx, y + vy, z + vz);
                  var luv2 = F2.uv([vx, vy, vz]); uv = tileUV(faceTile(id, f2), luv2[0], luv2[1]); U[bk].push(uv[0], uv[1]);
                  C[bk].push(F2.s * sh0, blk(x + vx, y + vy, z + vz) * F2.s, 0);
                }
                I[bk].push(start, start + 1, start + 2, start, start + 2, start + 3);
              }
            }
            continue;
          }
          var tr = def[4] === 1 ? 1 : 0, lit = def[5] === 1, water = id === WATER;
          var lowTop = water && get(x, y + 1, z) !== WATER;
          var jitter = water ? 1 : 0.97 + rnd(x * 7.1 + y * 13.3 + z * 3.7) * 0.06;
          for (var f = 0; f < 6; f++) {
            var F = FACES[f], nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2], nb = get(nx, ny, nz);
            if (!(nb === AIR || (isTrans(nb) && nb !== id))) continue;
            if (water && f === 3) continue;
            var t = faceTile(id, f);
            var shade = lit ? 1 : F.s * jitter;
            if (!lit && ny >= 0) shade *= skyLight(nx, ny, nz);
            var P2 = P[tr], C2 = C[tr], U2 = U[tr], I2 = I[tr];
            start = P2.length / 3;
            for (k = 0; k < 4; k++) {
              v = F.v[k];
              P2.push(x + v[0], y + (lowTop && v[1] ? 0.86 : v[1]), z + v[2]);
              var luv = F.uv(v); uv = tileUV(t, luv[0], luv[1]); U2.push(uv[0], uv[1]);
              var ao = 1;
              if (!lit && !tr) {
                var ax = F.n[0] !== 0 ? 0 : (v[0] ? 1 : -1), ay = F.n[1] !== 0 ? 0 : (v[1] ? 1 : -1), az = F.n[2] !== 0 ? 0 : (v[2] ? 1 : -1);
                var s1, s2, s3;
                if (F.n[0] !== 0) { s1 = solidAO(nx, y + ay, z); s2 = solidAO(nx, y, z + az); s3 = solidAO(nx, y + ay, z + az); }
                else if (F.n[1] !== 0) { s1 = solidAO(x + ax, ny, z); s2 = solidAO(x, ny, z + az); s3 = solidAO(x + ax, ny, z + az); }
                else { s1 = solidAO(x + ax, y, nz); s2 = solidAO(x, y + ay, nz); s3 = solidAO(x + ax, y + ay, nz); }
                var occ = (s1 && s2) ? 3 : s1 + s2 + s3;
                ao = 1 - occ * 0.15;
              }
              var m = Math.min(1, shade * ao);
              C2.push(m, lit ? 1 : blk(x + v[0], y + v[1], z + v[2]) * ao * F.s, 0);
            }
            I2.push(start, start + 1, start + 2, start, start + 2, start + 3);
          }
        }
    var meshes = [], mats = [opaqueMat, glassMat, plantMat];
    for (var tt = 0; tt < 3; tt++) {
      if (!I[tt].length) continue;
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P[tt], 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(C[tt], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(U[tt], 2));
      g.setIndex(I[tt]);
      g.computeBoundingSphere();
      var mesh = new THREE.Mesh(g, mats[tt]);
      if (tt === 1) mesh.renderOrder = 1;
      scene.add(mesh); meshes.push(mesh);
    }
    chunks[key] = meshes;
  }
  function rebuildAround(x, y, z) {
    var done = {};
    [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(function (d) {
      var cx = Math.floor((x + d[0]) / CS), cy = Math.floor((y + d[1]) / CS), cz = Math.floor((z + d[2]) / CS);
      if (cy < 0 || cy >= CY || !inWorldC(cx, cz) || !meshedCols[cz * NC + cx]) return;
      var k = cx + ',' + cy + ',' + cz; if (done[k]) return; done[k] = 1; buildChunk(cx, cy, cz);
    });
  }
  function cubeGeometry(tiles, shadeOn) {
    var Pp = [], Cc = [], Uu = [], Ii = [];
    for (var f = 0; f < 6; f++) {
      var F = FACES[f], t = tiles(f), st = Pp.length / 3, s = shadeOn ? F.s : 1;
      for (var k = 0; k < 4; k++) {
        var v = F.v[k]; Pp.push(v[0] - 0.5, v[1] - 0.5, v[2] - 0.5);
        var luv = F.uv(v), uv = tileUV(t, luv[0], luv[1]); Uu.push(uv[0], uv[1]); Cc.push(s, shadeOn ? 0 : 1, 0);
      }
      Ii.push(st, st + 1, st + 2, st, st + 2, st + 3);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(Pp, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(Uu, 2));
    g.setIndex(Ii);
    return g;
  }
  function blockGeometry(id) { return cubeGeometry(function (f) { return faceTile(id, f); }, !B[id][5]); }
  // 블록 아이콘(비스듬히 본 모습, 풀·꽃·문은 납작하게)
  var ICON = [];
  function isoPt(x, y, z) { return [32 + 28 * (x - z), 4 + 14 * (x + z) + 28 * (1 - y)]; }
  function drawFace(ctx, t, p0, p1, p2, dark, lit) {
    ctx.setTransform((p1[0] - p0[0]) / TS, (p1[1] - p0[1]) / TS, (p2[0] - p0[0]) / TS, (p2[1] - p0[1]) / TS, p0[0], p0[1]);
    ctx.drawImage(atlas, (t % ACOLS) * TS, Math.floor(t / ACOLS) * TS, TS, TS, 0, 0, TS, TS);
    if (dark && !lit) { ctx.fillStyle = 'rgba(0,0,0,' + dark + ')'; ctx.fillRect(0, 0, TS, TS); }
  }
  function iconBoxes(id) {
    if (isItem(id)) return null;
    var sp = SHAPE[id];
    if (!sp) return [[0, 0, 0, 1, 1, 1]];
    if (sp.type === 'slab') return [[0, 0, 0, 1, 0.5, 1]];
    if (sp.type === 'stair') return [[0, 0, 0, 1, 0.5, 1], [0, 0.5, 0, 1, 1, 0.5]];
    if (sp.type === 'fence') return [[0.05, 0, 0.4, 0.25, 1, 0.6], [0.75, 0, 0.4, 0.95, 1, 0.6], [0, 0.3, 0.45, 1, 0.45, 0.55], [0, 0.7, 0.45, 1, 0.85, 0.55]];
    return null;
  }
  function makeIcons() {
    for (var id = 1; id < B.length; id++) {
      if (!B[id]) continue;
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      var boxes = iconBoxes(id);
      if (kind(id) === 'plant' || !boxes) {
        var tp = BT[id][1];
        x.drawImage(atlas, (tp % ACOLS) * TS, Math.floor(tp / ACOLS) * TS, TS, TS, 4, 4, 56, 56);
        ICON[id] = c.toDataURL(); continue;
      }
      boxes.slice().sort(function (a, b) { return a[1] - b[1] || (a[0] + a[2] + a[3] + a[5]) - (b[0] + b[2] + b[3] + b[5]); }).forEach(function (b) {
        var lit = !!B[id][5];
        drawFace(x, BT[id][0], isoPt(b[0], b[4], b[2]), isoPt(b[3], b[4], b[2]), isoPt(b[0], b[4], b[5]), 0, lit);
        drawFace(x, BT[id][1], isoPt(b[0], b[4], b[5]), isoPt(b[3], b[4], b[5]), isoPt(b[0], b[1], b[5]), 0.22, lit);
        drawFace(x, BT[id][1], isoPt(b[3], b[4], b[5]), isoPt(b[3], b[4], b[2]), isoPt(b[3], b[1], b[5]), 0.4, lit);
      });
      ICON[id] = c.toDataURL();
    }
  }

  // ───────── 사람(네모난 몸, 3인칭에서 보임) ─────────
  var HW = 0.42, HT = 3.4, EYE = 3.1, REACH = 11;   // 몸 너비 0.84칸: 한 칸짜리 문을 지나갈 수 있게
  var avatarMat;
  function boxGeo(w, h, d, hex) {
    var g = new THREE.BoxGeometry(w, h, d), n = g.attributes.position.count, col = new Float32Array(n * 3);
    var sh = [0.8, 0.72, 1, 0.55, 0.76, 0.92], c = new THREE.Color(hex);
    for (var f = 0; f < 6; f++) for (var k = 0; k < 4; k++) { var o = (f * 4 + k) * 3; col[o] = c.r * sh[f]; col[o + 1] = c.g * sh[f]; col[o + 2] = c.b * sh[f]; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }
  function shadedBox(w, h, d, hex) { return new THREE.Mesh(boxGeo(w, h, d, hex), avatarMat); }
  // 여러 상자를 한 덩어리로(그리기 횟수 줄이기) — 상자: [너비, 높이, 깊이, 색, x, y, z]
  function mergedBoxes(list) {
    var pos = [], col = [], ind = [], off = 0;
    list.forEach(function (b) {
      var g = boxGeo(b[0], b[1], b[2], b[3]); g.translate(b[4], b[5], b[6]);
      var p = g.attributes.position.array, c = g.attributes.color.array, ix = g.index.array, i;
      for (i = 0; i < p.length; i++) { pos.push(p[i]); col.push(c[i]); }
      for (i = 0; i < ix.length; i++) ind.push(off + ix[i]);
      off += p.length / 3; g.dispose();
    });
    var m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    m.setIndex(ind); m.computeBoundingSphere();
    return m;
  }
  function makeAvatar(c) {
    var u = HT / 32, root = new THREE.Group(), parts = {};
    function add(parent, w, h, d, hex, x, y, z) { var m = shadedBox(w * u, h * u, d * u, hex); m.position.set(x * u, y * u, z * u); parent.add(m); return m; }
    function pivot(x, y, z) { var g = new THREE.Group(); g.position.set(x * u, y * u, z * u); root.add(g); return g; }
    parts.legL = pivot(-2, 12, 0); parts.legR = pivot(2, 12, 0);
    [parts.legL, parts.legR].forEach(function (L) { add(L, 4, 10.5, 4, c.robe2, 0, -5.25, 0); add(L, 4.3, 1.5, 4.6, c.sandal, 0, -11.25, -0.15); });
    add(root, 8, 12, 4, c.robe, 0, 18, 0);
    add(root, 8.4, 1.6, 4.4, c.belt, 0, 14.5, 0);
    add(root, 1.6, 12, 0.4, c.trim, 0, 18, -2.1);
    parts.armL = pivot(-6, 22, 0); parts.armR = pivot(6, 22, 0);
    [parts.armL, parts.armR].forEach(function (A) { add(A, 4, 6, 4, c.robe, 0, -1, 0); add(A, 3.8, 6, 3.8, c.skin, 0, -7, 0); });
    parts.head = pivot(0, 24, 0);
    add(parts.head, 8, 8, 8, c.skin, 0, 4, 0);
    var st = c.style || 'short';
    if (st === 'scarf') {   // 머릿수건
      add(parts.head, 8.8, 2.8, 8.8, c.scarf, 0, 7.3, 0);
      add(parts.head, 8.8, 9, 1.6, c.scarf, 0, 3.2, 3.8);
      add(parts.head, 1.2, 6, 8.2, c.scarf, -4.3, 3.6, 0.3); add(parts.head, 1.2, 6, 8.2, c.scarf, 4.3, 3.6, 0.3);
      add(parts.head, 8.6, 0.8, 0.6, c.hair, 0, 5.9, -4.1);
    } else {
      add(parts.head, 8.5, st === 'curly' ? 3.2 : 2.4, 8.5, c.hair, 0, st === 'curly' ? 7.4 : 7.3, 0);
      if (st === 'long') {   // 긴 머리: 어깨까지
        add(parts.head, 8.5, 11, 1.4, c.hair, 0, 1.6, 3.6);
        add(parts.head, 1.1, 8, 7.4, c.hair, -4.3, 3.2, 0.4); add(parts.head, 1.1, 8, 7.4, c.hair, 4.3, 3.2, 0.4);
      } else add(parts.head, 8.5, 5, 1.4, c.hair, 0, 4.6, 3.6);
      if (st === 'curly') { add(parts.head, 1.2, 3, 6, c.hair, -4.4, 5.4, 0.8); add(parts.head, 1.2, 3, 6, c.hair, 4.4, 5.4, 0.8); }
    }
    add(parts.head, 1.3, 1.3, 0.3, 0x2b1d14, -1.8, 4, -4.05);
    add(parts.head, 1.3, 1.3, 0.3, 0x2b1d14, 1.8, 4, -4.05);
    add(parts.head, 2.2, 0.5, 0.3, 0xb5806a, 0, 1.9, -4.05);
    // 캐릭터마다 디자인된 옷차림(만든 옷을 입으면 그 자리 장식은 가려짐: torso·belt·head)
    parts.deco = [];
    function deco(tag, parent, w, h, d, hex, x, y, z, rz) { var m = add(parent, w, h, d, hex, x, y, z); if (rz) m.rotation.z = rz; parts.deco.push({ m: m, tag: tag }); return m; }
    var f = c.fit || {};
    if (f.stripes) {   // 세로 줄무늬 겉옷
      [-2.4, 2.4].forEach(function (sx) { deco('torso', root, 1.3, 12, 4.3, f.stripes, sx, 18, 0); });
      [parts.legL, parts.legR].forEach(function (L) { deco('torso', L, 1.2, 9, 4.3, f.stripes, 0, -4.6, 0); });
    }
    if (f.agal) { deco('head', parts.head, 9, 0.9, 9, f.agal, 0, 7.2, 0); }   // 머릿수건을 누르는 띠
    if (f.staff) { var stf = deco('back', root, 0.9, 30, 0.9, f.staff, 1.5, 17, 2.7, 0.32); deco('back', root, 0.9, 3.4, 0.9, f.staff, -3.3, 31.2, 2.7, -0.9); }
    if (f.short) [parts.legL, parts.legR].forEach(function (L) { deco('legs', L, 4.05, 5.2, 4.05, c.skin, 0, -7.6, 0); });   // 무릎까지 오는 짧은 옷
    if (f.vest) { [-2.75, 2.75].forEach(function (sx) { deco('torso', root, 2.6, 10.5, 4.5, f.vest, sx, 18.6, 0); }); deco('torso', root, 8.5, 2.2, 4.5, f.vest, 0, 22.9, 0); }
    if (f.rope) { deco('belt', root, 8.6, 1.1, 4.6, f.rope, 0, 14.6, 0); deco('belt', root, 0.9, 3.4, 0.6, f.rope, -1.8, 12.6, -2.4); deco('belt', root, 0.9, 2.6, 0.6, f.rope, -0.9, 12.9, -2.4); }
    if (f.headband) { deco('head', parts.head, 8.7, 1.1, 8.7, f.headband, 0, 6.4, 0); if (f.flower) { deco('head', parts.head, 1.6, 1.6, 0.6, f.flower, 2.6, 6.6, -4.4); deco('head', parts.head, 0.6, 0.6, 0.7, 0xffe060, 2.6, 6.6, -4.6); } }
    if (f.apron) {
      deco('torso', root, 6.4, 10, 0.5, f.apron, 0, 15.6, -2.3); deco('torso', root, 3, 2.2, 0.6, 0x5a3418, 1.2, 13.6, -2.6);
      [-2.6, 2.6].forEach(function (sx) { deco('torso', root, 0.8, 4, 0.5, f.apron, sx, 22, -2.3); });
      deco('belt', root, 1.1, 2.6, 0.9, 0x8a8e94, 3.8, 13.4, -1.6); deco('belt', root, 0.9, 3, 0.9, 0x6a4628, 3.8, 11.5, -1.6);   // 허리에 찬 망치
    }
    if (f.shawl) { deco('torso', root, 9, 3.6, 4.9, f.shawl, 0, 22.4, 0); deco('torso', root, 2.4, 6, 0.6, f.shawl, -2.4, 18.6, -2.45); deco('torso', root, 2.4, 6, 0.6, f.shawl, 2.4, 18.6, -2.45); [parts.armL, parts.armR].forEach(function (A) { deco('torso', A, 4.4, 3, 4.4, f.shawl, 0, 0.6, 0); }); }
    if (f.hem) [parts.legL, parts.legR].forEach(function (L) { deco('legs', L, 4.25, 1.1, 4.25, f.hem, 0, -9.6, 0); deco('legs', L, 4.25, 0.5, 4.25, f.hem2 || f.hem, 0, -8.4, 0); });
    if (f.sash) deco('torso', root, 1.2, 15, 0.5, f.sash, 0.2, 18.3, -2.35, 0.55);   // 어깨에 멘 끈
    if (f.bag) deco('torso', root, 3, 3, 1.6, f.bag, -3.6, 13, -1.2);
    if (f.cloak) { deco('back', root, 9.2, 17, 0.9, f.cloak, 0, 15.8, 2.6); deco('back', root, 9.4, 1.6, 5.2, f.cloak, 0, 23.6, 0.2); deco('torso', root, 1.4, 1.4, 0.6, 0xe0c060, -3.2, 23.2, -2.6); }
    if (f.necklace) { deco('torso', root, 5, 0.6, 0.5, f.necklace, 0, 23.1, -2.3); deco('torso', root, 1.2, 1.2, 0.6, f.necklace, 0, 22.3, -2.4); }
    root.userData = parts;
    return root;
  }
  // 기본 모습 6가지
  var LOOKS = [
    // 모두 나그네(히 11:13) — 같은 나그네 옷차림(망토·어깨 가방·끈)에 얼굴·머리·옷 빛깔만 다르다
    { name: '나그네 · 짧은 머리', robe: 0xe2d8c0, robe2: 0xd2c6aa, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xe5b98f, hair: 0x3a2618, sandal: 0x6b4425, style: 'short',
      fit: { cloak: 0x6a4a30, sash: 0x8a4b14, bag: 0x8a5a32 } },
    { name: '나그네 · 곱슬머리', robe: 0xd8d4c4, robe2: 0xc8c2b0, belt: 0x5a3a1e, trim: 0x5a3a1e, skin: 0xc98f62, hair: 0x1e1410, sandal: 0x5a3a1e, style: 'curly',
      fit: { cloak: 0x4f5a3a, sash: 0x5a3a1e, bag: 0x9a7040 } },
    { name: '나그네 · 머릿수건', robe: 0xe8e4da, robe2: 0xd8d2c4, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xd9a67a, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0xeee8d8,
      fit: { cloak: 0x7a5a3a, sash: 0x6b4425, bag: 0x8a5a32, agal: 0x2a2018 } },
    { name: '나그네 · 긴 머리', robe: 0xe6dcc6, robe2: 0xd6ccb4, belt: 0x6a3e5a, trim: 0x6a3e5a, skin: 0xe5b98f, hair: 0x6b4425, sandal: 0x6b4425, style: 'long',
      fit: { cloak: 0x7a3e4a, sash: 0x6a3e5a, bag: 0x9a7040 } },
    { name: '나그네 · 검은 긴 머리', robe: 0xdcd8cc, robe2: 0xccc6b6, belt: 0x3f5a7a, trim: 0x3f5a7a, skin: 0xd9a67a, hair: 0x1e1410, sandal: 0x5a3a1e, style: 'long',
      fit: { cloak: 0x3f4f6a, sash: 0x3f5a7a, bag: 0x8a5a32 } },
    { name: '나그네 · 파란 수건', robe: 0xe8e4da, robe2: 0xd8d2c4, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xc98f62, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0x5a7ab0,
      fit: { cloak: 0x8a6a40, sash: 0x8a4b14, bag: 0x6a4a30 } }
  ];
  // 입은 옷을 몸 위에 겹쳐 그림
  function dressAvatar(av, worn) {
    var pr = av.userData, u = HT / 32;
    (pr.dress || []).forEach(function (m) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); });
    pr.dress = [];
    // 만든 옷을 입은 자리는 기본 옷차림 장식을 가린다
    (pr.deco || []).forEach(function (d) { d.m.visible = !((d.tag === 'torso' && worn && worn.body) || (d.tag === 'belt' && worn && worn.belt) || (d.tag === 'head' && worn && worn.head) || (d.tag === 'legs' && worn && worn.feet && false)); });
    function add(parent, w, h, d, hex, x, y, z) { var m = shadedBox(w * u, h * u, d * u, hex); m.position.set(x * u, y * u, z * u); parent.add(m); pr.dress.push(m); }
    var GOLD = 0xf0c840;
    SLOTS.forEach(function (slot) {
      var id = worn && worn[slot], wi = id && WEARINFO[id]; if (!wi) return;
      var col = wi.col, sh = wi.shape, G = sh.slice(-1) === 'G'; if (G) sh = sh.slice(0, -1);
      if (slot === 'head') {
        if (sh === 'cap') { add(pr.head, 8.9, 2.8, 8.9, col, 0, 7.6, 0); add(pr.head, 10, 0.7, 10, col, 0, 6.2, -0.3); }
        else if (sh === 'helm') {
          add(pr.head, 9.1, 4.6, 9.1, col, 0, 6.6, 0); add(pr.head, 9.1, 4, 1.2, col, 0, 3.6, 3.9);
          add(pr.head, 1, 3, 0.6, col, 0, 4.2, -4.7);
          if (G) { add(pr.head, 1.2, 2.6, 7, GOLD, 0, 9.9, 0.4); add(pr.head, 9.3, 0.7, 9.3, GOLD, 0, 4.5, 0); }
        } else if (sh === 'crown') {
          add(pr.head, 9, 1.6, 9, col, 0, 8.6, 0);
          [[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8], [0, -3.8]].forEach(function (q) { add(pr.head, 1.4, 1.8, 1.4, col, q[0], 10.2, q[1]); });
          add(pr.head, 0.9, 0.9, 0.4, 0xd03a3a, 0, 8.6, -4.6);
        }
      } else if (slot === 'body') {
        var bodyCol = function (i) { return sh === 'stripe' ? [0xd04a3a, 0xe8c040, 0x3a6ad0, 0x4aa04a, 0x8a4ab0][i % 5] : col; };
        if (sh === 'stripe') for (var i = 0; i < 6; i++) add(av, 8.7, 2.1, 4.7, bodyCol(i), 0, 13.1 + i * 2.05, 0);
        else add(av, 8.8, 12.6, 4.8, col, 0, 18, 0);
        [pr.armL, pr.armR].forEach(function (A) { add(A, 4.6, 6.4, 4.6, bodyCol(2), 0, -1, 0); });
        if (sh === 'mail' || sh === 'plate') {
          [pr.armL, pr.armR].forEach(function (A) { add(A, 5, 1.6, 5, col, 0, 2.3, 0); });
          if (sh === 'mail') for (var r = 0; r < 5; r++) add(av, 8.9, 0.4, 4.9, 0x6a6e74, 0, 13.6 + r * 2.4, 0);
        }
        if (sh === 'plate') { add(av, 7, 7, 0.7, col, 0, 19.5, -2.7); add(av, 7.4, 0.6, 0.8, GOLD, 0, 23, -2.7); add(av, 7.4, 0.6, 0.8, GOLD, 0, 16, -2.7); add(av, 0.6, 7, 0.8, GOLD, -3.5, 19.5, -2.7); add(av, 0.6, 7, 0.8, GOLD, 3.5, 19.5, -2.7); }
      } else if (slot === 'belt') {
        add(av, 9, 1.8, 5, col, 0, 14.5, 0); add(av, 2, 2.2, 0.6, G ? 0xffffff : 0xd8c070, 0, 14.5, -2.6);
      } else if (slot === 'feet') {
        [pr.legL, pr.legR].forEach(function (L) { add(L, 4.6, 4.2, 4.9, col, 0, -9.9, -0.15); if (G) add(L, 4.8, 0.7, 5.1, GOLD, 0, -7.6, -0.15); });
      } else if (slot === 'shield') {
        add(pr.armL, 0.9, 8, 7, col, -2.6, -5.5, 0);
        add(pr.armL, 1, 8.4, 0.6, col === 0xa77a48 ? 0x6a4628 : 0x8a8e94, -2.6, -5.5, -3.5); add(pr.armL, 1, 8.4, 0.6, col === 0xa77a48 ? 0x6a4628 : 0x8a8e94, -2.6, -5.5, 3.5);
        if (G) { add(pr.armL, 0.5, 6, 1.2, GOLD, -3.15, -5.5, 0); add(pr.armL, 0.5, 1.2, 4.6, GOLD, -3.15, -4, 0); }
      }
    });
  }

  // ───────── 플레이어 ─────────
  var P = { x: XM + 0.5, y: G, z: PZ0 - 9, vx: 0, vy: 0, vz: 0, yaw: Math.PI, pitch: -0.12, ground: false, fly: false, camY: 0, walk: 0, stepAcc: 0, sprint: false, swim: false };
  function collides(px, py, pz) {
    for (var x = Math.floor(px - HW); x <= Math.floor(px + HW); x++)
      for (var y = Math.floor(py); y <= Math.floor(py + curHT - 0.01); y++)
        for (var z = Math.floor(pz - HW); z <= Math.floor(pz + HW); z++)
          {
            var cid = get(x, y, z);
            if (!isSolid(cid) || (riding && cid === LEAF)) continue;   // 타고 있을 때는 나뭇잎을 헤치고 지나감
            if (!SHAPE[cid]) return true;
            var bs = collBoxes(cid, x, y, z);
            for (var bi2 = 0; bi2 < bs.length; bi2++) {
              var b = bs[bi2];
              if (px + HW > x + b[0] && px - HW < x + b[3] && py + HT > y + b[1] && py < y + b[4] && pz + HW > z + b[2] && pz - HW < z + b[5]) return true;
            }
          }
    return false;
  }
  function onLadder() { for (var y = Math.floor(P.y); y <= Math.floor(P.y + 1.6); y++) { var id = get(Math.floor(P.x), y, Math.floor(P.z)); if (SHAPE[id] && SHAPE[id].type === 'ladder') return true; } return false; }
  function inWater() { return get(Math.floor(P.x), Math.floor(P.y + 1), Math.floor(P.z)) === WATER; }
  function moveAxis(axis, d) {
    if (!d) return false;
    var steps = Math.ceil(Math.abs(d) / 0.2), s = d / steps;
    for (var i = 0; i < steps; i++) {
      var nx = P.x + (axis === 0 ? s : 0), ny = P.y + (axis === 1 ? s : 0), nz = P.z + (axis === 2 ? s : 0);
      if (collides(nx, ny, nz)) {
        if (axis !== 1 && (P.ground || P.swim || P.ladder) && !P.fly) {
          var up = !collides(nx, ny + 0.51, nz) && !collides(P.x, P.y + 0.51, P.z) ? 0.51 : (!collides(nx, ny + 1.01, nz) && !collides(P.x, P.y + 1.01, P.z) ? 1.01 : 0);
          if (up) { P.y += up; P.camY -= up; P.x = nx; P.z = nz; continue; }
        }
        return true;
      }
      P.x = nx; P.y = ny; P.z = nz;
    }
    return false;
  }

  // ───────── 설정·가방(이 기기에 저장, 로그인하면 내 땅 기록에도 저장) ─────────
  var S = { sens: 1, aim: 'cross', sound: true, view: 0 };
  try { var saved = JSON.parse(localStorage.getItem('arkVillage.settings') || 'null'); if (saved) for (var sk in saved) S[sk] = saved[sk]; } catch (e) {}
  // 2026-11-18: 휴대폰도 기본은 화면 가운데 십자(+)로 겨누기(손가락 자리는 메뉴에서 고를 수 있음) — 한 번 바꿔 줌
  if (!S.aim2) { S.aim = 'cross'; S.aim2 = 1; }
  // 단축 칸은 처음엔 비어 있고(0 = 빈 칸), 플레이어가 직접 채운다
  HOTBAR = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  try { var hb = JSON.parse(localStorage.getItem('arkVillage.hotbar4') || 'null'); if (hb && hb.length === 9) HOTBAR = hb.map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; }); } catch (e) {}
  // 가방 칸: 가진 것을 플레이어가 정한 자리에(이 기기에 저장)
  var BAGSLOT = [];
  try { BAGSLOT = (JSON.parse(localStorage.getItem('arkVillage.bagslots') || '[]') || []).map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; }); } catch (e) { BAGSLOT = []; }
  function nameOf(id) { return id && B[id] ? B[id][0] : '빈 칸'; }
  var BAG = {};
  try { var bg = JSON.parse(localStorage.getItem('arkVillage.bag') || 'null'); if (bg) for (var bk in bg) if (INV.indexOf(+bk) >= 0) BAG[+bk] = Math.max(0, Math.min(9999, bg[bk] | 0)); } catch (e) {}
  function saveSettings() { try { localStorage.setItem('arkVillage.settings', JSON.stringify(S)); localStorage.setItem('arkVillage.hotbar4', JSON.stringify(HOTBAR)); localStorage.setItem('arkVillage.bagslots', JSON.stringify(BAGSLOT)); } catch (e) {} }
  // 가방 칸 정리: 다 쓴 것은 빼고, 새로 얻은 것은 빈 칸에(최소 4줄 × 9칸)
  function syncBagSlots() {
    var i, seenIds = {};
    for (i = 0; i < BAGSLOT.length; i++) { var v = BAGSLOT[i]; if (!v || have(v) < 1 || seenIds[v]) BAGSLOT[i] = 0; else seenIds[v] = 1; }
    INV.forEach(function (id) { if (have(id) > 0 && !seenIds[id]) { var e = BAGSLOT.indexOf(0); if (e < 0) { e = BAGSLOT.length; BAGSLOT.push(0); } BAGSLOT[e] = id; seenIds[id] = 1; } });
    while (BAGSLOT.length < 36) BAGSLOT.push(0);
    while (BAGSLOT.length > 36 && BAGSLOT.length % 9 === 0 && BAGSLOT.slice(-9).every(function (v) { return !v; })) BAGSLOT.length -= 9;
    while (BAGSLOT.length % 9) BAGSLOT.push(0);
  }
  var WEAR = {};
  try { var wr = JSON.parse(localStorage.getItem('arkVillage.wear') || 'null'); if (wr) for (var wk in wr) if (isTool(+wk)) WEAR[+wk] = Math.max(1, Math.min(toolMax(+wk), wr[wk] | 0)); } catch (e) {}
  // 관리자 계정: 모든 자원 무한, 모든 제작법 열림, 날기 가능(서버 get_my_ark_name의 admin)
  function isAdm() { return typeof NET !== 'undefined' && !!NET.admin; }
  function have(id) { return isAdm() && INV.indexOf(id) >= 0 ? 9999 : (BAG[id] || 0); }
  function wearLeft(id) { return WEAR[id] !== undefined ? WEAR[id] : toolMax(id); }
  // 한 번 캘 때마다 1씩 닳고, 0이 되면 그 도구 하나가 부서진다(같은 도구가 더 있으면 새것으로)
  function wearTool(tid) {
    if (!tid || have(tid) < 1 || isAdm()) return;
    var left = wearLeft(tid) - 1;
    if (left > 0) { WEAR[tid] = left; if (left === 10) toast(toolName(tid) + '이(가) 곧 부서지려 해요'); return; }
    take(tid, 1); delete WEAR[tid];
    toast(toolName(tid) + '이(가) 다 닳아 부서졌어요' + (have(tid) > 0 ? ' · 남은 것 ' + have(tid) + '개' : ' · 만들기에서 새로 만들어요'));
    sfx('break');
  }
  function bagChanged() {
    for (var wk2 in WEAR) if (have(+wk2) < 1) delete WEAR[wk2];
    // 다 쓴 것은 단축 칸에서 빠진다
    var hc = false; for (var hi = 0; hi < 9; hi++) if (HOTBAR[hi] && have(HOTBAR[hi]) < 1) { HOTBAR[hi] = 0; hc = true; }
    syncBagSlots(); if (hc) saveSettings();
    try { localStorage.setItem('arkVillage.bag', JSON.stringify(BAG)); localStorage.setItem('arkVillage.wear', JSON.stringify(WEAR)); localStorage.setItem('arkVillage.heat', String(HEAT)); } catch (e) {}
    renderHotbar(); setSel(sel, true);
    if (ui === 'inv') renderInv();
    if (ui === 'chest') renderChest();
    if (me && myPlot >= 0) markDirty();
  }
  function give(id, n) {
    if (INV.indexOf(id) < 0 || isAdm()) return;
    BAG[id] = Math.min(9999, have(id) + n);
    if (n > 0) {
      markSeen(id);
      // 새로 얻은 것은 단축 칸 빈자리에 저절로(이미 있으면 그대로)
      if (HOTBAR.indexOf(id) < 0) { var e = HOTBAR.indexOf(0); if (e >= 0) { HOTBAR[e] = id; saveSettings(); } }
    }
  }
  // ───────── 제작법은 단계별로 열린다: 재료를 한 번이라도 얻으면 그 재료로 만드는 법이 열림 ─────────
  var SEEN = {}, seenQuiet = true, newRecs = [], newRecT = null;
  try { (localStorage.getItem('arkVillage.seen') || '').split(',').forEach(function (k) { if (+k) SEEN[+k] = 1; }); } catch (e) {}
  for (var bk3 in BAG) if (BAG[bk3] > 0) SEEN[+bk3] = 1;
  function saveSeen() { try { localStorage.setItem('arkVillage.seen', Object.keys(SEEN).join(',')); } catch (e) {} }
  function seenString() { return Object.keys(SEEN).join('.'); }
  // 열리는 조건: 재료 + 녹이기는 용광로, 옷은 제작대를 한 번 가져 봐야
  function recIds(rc) { var a = rc.need.map(function (n) { return n[0]; }); if (rc.furnace) a.push(FURNACE); if (rc.table) a.push(CRAFT); return a; }
  function recOpen(rc) { return isAdm() || recIds(rc).every(function (id) { return SEEN[id]; }); }
  function markSeen(id) {
    if (SEEN[id]) return;
    SEEN[id] = 1; saveSeen();
    if (seenQuiet) return;
    RECIPES.forEach(function (rc) {
      if (!recOpen(rc) || recIds(rc).indexOf(id) < 0) return;
      var nm = B[rc.out[0]][0]; if (newRecs.indexOf(nm) < 0) newRecs.push(nm);
    });
    if (!newRecs.length) return;
    clearTimeout(newRecT);
    newRecT = setTimeout(function () {
      var st = curStage();
      toast('📜 새 제작법이 열렸어요: ' + newRecs.slice(0, 4).join(', ') + (newRecs.length > 4 ? ' 외 ' + (newRecs.length - 4) + '가지' : '') + ' — 🎒 → 🔨 만들기' + (st.up ? ' · ' + st.n + '단계 「' + st.name + '」' : ''));
      newRecs = []; lastStage = st.n;
    }, 300);
  }
  // 단계: 1 나무·흙 → 2 돌 → 3 구리 → 4 철·은 → 5 금·보석
  var STAGE_NAME = ['', '나무·흙', '돌', '구리', '철·은', '금·보석'];
  var STAGE_NEXT = ['', '돌을 캐면(곡괭이) 2단계', '구리 광석을 캐서 용광로에 녹이면 3단계', '철 광석을 캐서 녹이면 4단계', '금 광석이나 보석을 얻으면 5단계', ''];
  var MAT_STAGE = {};
  [[2, [STONE, LIME, BASALT, DEEP, COAL, CHAR, ORE_COAL, BLK_COAL, FURNACE, BRICK]], [3, [ORE_CU, ING_CU, BLK_CU]],
   [4, [ORE_FE, ING_FE, BLK_FE, ORE_AG, ING_AG, BLK_AG, GEM_ONYX, BLK_ONYX, ORE_ONYX]], [5, [ORE_AU, ING_AU, BLK_AU, ORE_SAPH, GEM_SAPH, BLK_SAPH, ORE_DIA, GEM_DIA, BLK_DIA]]
  ].forEach(function (s) { s[1].forEach(function (id) { MAT_STAGE[id] = s[0]; }); });
  for (var dv2 in DEEPV) MAT_STAGE[DEEPV[dv2]] = MAT_STAGE[dv2] || 1;
  function recStage(rc) { var s = 1; recIds(rc).forEach(function (id) { s = Math.max(s, MAT_STAGE[id] || 1); }); return s; }
  var lastStage = 0;
  function curStage() { var s = 1; for (var k in SEEN) s = Math.max(s, MAT_STAGE[k] || 1); var up = lastStage && s > lastStage; return { n: s, name: STAGE_NAME[s], up: up }; }
  // 재료를 어디서 얻는지
  function howGet(id) {
    var H = {};
    H[LOG] = '동쪽 숲에서 나무를 꾹 눌러 캐요(도끼가 빨라요)'; H[LEAF] = '나뭇잎을 캐요(칼이 빨라요)';
    H[STONE] = '서쪽 산 바위나 땅속 돌을 곡괭이로 캐요'; H[LIME] = '서쪽 산 위쪽 바위에서 캐요'; H[BASALT] = '서쪽 산의 검은 바위에서 캐요';
    H[SAND] = '북쪽 바닷가나 동쪽 사막에서 삽으로 캐요'; H[DIRT] = '풀밭이나 흙을 삽으로 캐요'; H[CLAY] = '남쪽 호숫가 물가에서 캐요'; H[REED] = '남쪽 호숫가의 갈대를 캐요';
    H[TAR] = '남쪽 호수 동쪽의 역청 구덩이에서 캐요(창 14:10)'; H[FLOWER] = '들판에 핀 들꽃을 캐요'; H[SNOW] = '아라랏 산 꼭대기의 눈을 캐요';
    H[COAL] = '석탄 광석을 곡괭이로 캐면 나와요 — 산 속과 땅속에 흔해요'; H[CHAR] = '용광로에서 통나무를 녹이면 숯이 돼요(요 21:9)';
    H[WOOL] = '칼을 들고 양을 누르면 양털을 깎아요'; H[LEATHER] = '칼을 들고 소·염소·낙타를 누르면 얻어요';
    H[GEM_ONYX] = '깊은 땅속 호마노 광석을 구리 곡괭이 이상으로 캐요'; H[GEM_SAPH] = '아주 깊은 곳 청옥 광석을 철 곡괭이로 캐요'; H[GEM_DIA] = '맨 아래 가까이 금강석 광석을 철 곡괭이로 캐요';
    [[ING_CU, ORE_CU], [ING_FE, ORE_FE], [ING_AG, ORE_AG], [ING_AU, ORE_AU]].forEach(function (q) { H[q[0]] = B[q[1]][0] + '을 캐서 용광로에서 녹여요(욥 28:2)'; });
    [[ORE_CU, '돌 아래 땅속'], [ORE_FE, '땅속 깊이(돌 곡괭이 이상)'], [ORE_AG, '더 깊은 땅속(구리 곡괭이 이상)'], [ORE_AU, '아주 깊은 땅속(철 곡괭이)']].forEach(function (q) { H[q[0]] = q[1] + '에서 캐요'; });
    if (H[id]) return H[id];
    var rc = RECIPES.filter(function (r) { return r.out[0] === id; })[0];
    if (rc) return '만들기에서 만들어요: ' + rc.need.map(function (n) { return B[n[0]][0] + ' ' + n[1]; }).join(' + ');
    return '캐서 모아요';
  }
  function take(id, n) { if (isAdm()) return; BAG[id] = Math.max(0, have(id) - n); }
  // 내 모습(기본 6가지 중 하나)과 입은 옷 — 이 기기와 내 땅 기록(|w:)에 저장, 친구들에게도 보임
  var LOOK = 0, WORN = { head: 0, body: 0, belt: 0, feet: 0, shield: 0 };
  function wornFromString(s) {
    var a = String(s || '').split('.').map(function (v) { return v | 0; });
    if (a[0] >= 0 && a[0] < LOOKS.length) LOOK = a[0];
    SLOTS.forEach(function (slot, i) { var id = a[i + 1]; WORN[slot] = id && WEARINFO[id] && WEARINFO[id].slot === slot ? id : 0; });
  }
  function wornString() { return [LOOK].concat(SLOTS.map(function (s) { return WORN[s] || 0; })).join('.'); }
  try { var ws0 = localStorage.getItem('arkVillage.worn'); if (ws0) wornFromString(ws0); } catch (e) {}
  function saveWorn() {
    try { localStorage.setItem('arkVillage.worn', wornString()); } catch (e) {}
    if (me && myPlot >= 0) markDirty();
    refreshMyAvatar();
    if (NET.ch) NET.ch.track({ n: NET.nick, w: wornString() }).catch(function () {});
  }
  function refreshMyAvatar() {
    if (!scene) return;
    var vis = avatar ? avatar.visible : false;
    if (avatar) scene.remove(avatar);
    avatar = makeAvatar(LOOKS[LOOK]); dressAvatar(avatar, WORN); avatar.visible = vis; scene.add(avatar);
  }
  function wearItem(id) {
    var wi = WEARINFO[id]; if (!wi) return;
    if (have(id) < 1) return deny(B[id][0] + '이(가) 없어요. 제작대에서 만들어요');
    take(id, 1);
    var old = WORN[wi.slot]; if (old) give(old, 1);
    WORN[wi.slot] = id; sfx('craft'); bagChanged(); saveWorn();
    toast(jo(B[id][0], '을', '를') + ' 입었어요' + (wi.ref ? ' (' + wi.ref + ')' : '') + (isTouch ? '' : ' — 👁(V)로 3인칭에서 볼 수 있어요'));
    armorCheck();
    if ($('looks').classList.contains('show')) renderLooks();
  }
  function unwear(slot) {
    var id = WORN[slot]; if (!id) return;
    WORN[slot] = 0; give(id, 1); sfx('click'); bagChanged(); saveWorn();
    if ($('looks').classList.contains('show')) renderLooks();
  }
  // 「내 모습」 화면: 작은 그림은 따로 그리는 작은 화면 하나로 만든다
  var lookR = null, lookScene = null, lookCam = null, lookThumbs = null;
  function lookShot(look, worn) {
    try {
      if (!lookR) {
        lookR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        lookR.setPixelRatio(1); lookR.setSize(150, 200, false);
        lookScene = new THREE.Scene(); lookCam = new THREE.PerspectiveCamera(26, 150 / 200, 0.1, 60);
        lookCam.position.set(-3.2, HT * 0.62, -9.6); lookCam.lookAt(0, HT * 0.5, 0);
      }
      var av = makeAvatar(LOOKS[look]); if (worn) dressAvatar(av, worn);
      av.rotation.y = -0.25; lookScene.add(av);
      var keep = avatarMat.color.clone(); avatarMat.color.setScalar(1);
      lookR.render(lookScene, lookCam);
      avatarMat.color.copy(keep);
      var url = lookR.domElement.toDataURL('image/png');
      lookScene.remove(av); av.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
      return url;
    } catch (e) { return ''; }
  }
  function openLooks() { openPanel('looks'); renderLooks(); sfx('click'); }
  function renderLooks() {
    if (!lookThumbs) lookThumbs = LOOKS.map(function (l, i) { return lookShot(i, null); });
    var g = $('lookGrid'); g.innerHTML = '';
    LOOKS.forEach(function (l, i) {
      var b = document.createElement('button'); b.className = 'lcard' + (i === LOOK ? ' on' : ''); b.title = l.name; b.setAttribute('aria-label', l.name);
      if (lookThumbs[i]) { var im = document.createElement('img'); im.src = lookThumbs[i]; im.alt = ''; b.appendChild(im); } else b.textContent = (i + 1) + '';
      b.addEventListener('click', function () { LOOK = i; saveWorn(); renderLooks(); sfx('click'); $('lookName').textContent = '모습: ' + l.name; });
      g.appendChild(b);
    });
    var wr = $('wornRow'); wr.innerHTML = '';
    SLOTS.forEach(function (slot) {
      var id = WORN[slot], b = document.createElement('button'); b.className = 'wslot';
      b.innerHTML = (id ? '<img src="' + ICON[id] + '" alt="">' : '<span style="display:block;height:34px;line-height:34px;font-size:18px;opacity:.5">·</span>') + '<small>' + SLOT_NAME[slot] + '</small>';
      b.title = id ? B[id][0] + ' (누르면 벗어요)' : SLOT_NAME[slot] + ' — 비었어요';
      b.addEventListener('click', function () { if (id) { unwear(slot); $('lookName').textContent = B[id][0] + '을(를) 벗어서 가방에 넣었어요'; } else $('lookName').textContent = SLOT_NAME[slot] + '에 입을 옷이 없어요'; });
      wr.appendChild(b);
    });
    var cg = $('clothGrid'); cg.innerHTML = '';
    var mine2 = WEARS.filter(function (w) { return have(w[0]) > 0; });
    if (!mine2.length) { var em = document.createElement('div'); em.className = 'empty'; em.textContent = '아직 옷이 없어요. 고페르 나무 4개로 제작대를 만들고, 가죽·양털·덩이로 옷을 지어요.'; cg.appendChild(em); }
    mine2.forEach(function (w) {
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(w[0], have(w[0])); d.title = w[1];
      d.addEventListener('click', function () { wearItem(w[0]); $('lookName').textContent = w[1] + (w[5] ? ' (' + w[5] + ')' : '') + '을(를) 입었어요'; });
      cg.appendChild(d);
    });
    var me2 = lookShot(LOOK, WORN); if (me2) $('lookMe').src = me2;
  }
  // 하나님의 전신 갑주를 다 입으면 말씀 카드(엡 6:11)
  function armorCheck() {
    if (!(WORN.head === 144 && WORN.body === 150 && WORN.belt === 152 && WORN.feet === 155 && WORN.shield === 158)) return;
    $('cardEmoji').textContent = '🛡'; $('cardName').textContent = '하나님의 전신 갑주';
    $('cardText').textContent = '마귀의 간계를 능히 대적하기 위하여 하나님의 전신 갑주를 입으라'; $('cardRef').textContent = '에베소서 6:11';
    $('cardNew').textContent = '구원의 투구 · 의의 호심경 · 진리의 허리 띠 · 평안의 복음의 신 · 믿음의 방패 (엡 6:14-17)';
    $('card').classList.add('show'); sfx('pop');
    clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 12000);
  }
  function bagString() { var a = []; for (var k in BAG) if (BAG[k] > 0) a.push(k + '.' + BAG[k] + (WEAR[k] !== undefined ? '.' + WEAR[k] : '')); if (HEAT > 0) a.push('h.' + Math.round(HEAT * 2)); return a.join(','); }
  function bagFromString(s) {
    var o = {}; WEAR = {}; HEAT = 0;
    (s || '').split(',').forEach(function (p) {
      var q = p.split('.'); var id = +q[0], n = +q[1];
      if (q[0] === 'h') { HEAT = Math.max(0, Math.min(200, (n | 0) / 2)); return; }
      if (INV.indexOf(id) >= 0 && n > 0) { o[id] = Math.min(9999, n | 0); if (isTool(id) && +q[2] > 0) WEAR[id] = Math.min(toolMax(id), q[2] | 0); }
    }); return o;
  }

  // ───────── 소리(코드로 만든 짧은 소리) ─────────
  var AC = null;
  function audioOn() {
    try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; }
  }
  var DIG_F = { pick: 2200, axe: 700, shovel: 420, knife: 1600 };
  function matSound(id) { if (id === SAND || id === SNOW || id === 18) return 1300; if (id === GRASS || id === LEAF || kind(id) === 'plant') return 1700; return DIG_F[TCLASS[id]] || 900; }   // 돌은 딱딱, 나무는 둔탁, 흙은 사각
  function sfx(kindS, freq) {
    if (!AC || !S.sound) return;
    try {
      var dur = { 'break': 0.18, step: 0.06, click: 0.03, dig: 0.05, pop: 0.05, craft: 0.12, door: 0.14, place: 0.07 }[kindS] || 0.09;
      var len = Math.floor(AC.sampleRate * dur), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, kindS === 'break' ? 1.6 : 3);
      var src = AC.createBufferSource(); src.buffer = buf;
      var f = AC.createBiquadFilter(); f.type = kindS === 'pop' || kindS === 'craft' ? 'bandpass' : 'lowpass';
      f.frequency.value = freq || { 'break': 1500, step: 520, click: 2600, dig: 800, pop: 1800, craft: 1200 }[kindS] || 950;
      var g = AC.createGain(); g.gain.value = { step: 0.1, click: 0.18, dig: 0.16, pop: 0.5, craft: 0.5 }[kindS] || 0.42;
      src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
    } catch (e) {}
  }

  // ───────── 화면 상태 ─────────
  var ui = 'title', uiBack = 'title';
  var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var lockOn = false, canvasEl;
  function showUI(name) {
    ['title', 'pause', 'inv', 'book', 'help', 'map', 'chest', 'chat', 'looks', 'tips'].forEach(function (n) { $(n).classList.toggle('show', n === name); });
    document.body.classList.toggle('playing', name === 'play');
    document.body.classList.toggle('menu', name !== 'play');
    ui = name;
    if (name !== 'play') { joy.x = joy.y = 0; keys = {}; jumpHeld = false; flyDown = false; mouseMining = false; stopHold(); }
  }
  function openPanel(name) { bagPick = null; uiBack = ui === 'play' ? 'play' : ui; showUI(name); if (name === 'inv') renderInv(); if (lockOn) document.exitPointerLock(); }
  function closePanel() { if (uiBack === 'play') resume(); else showUI(uiBack); }
  function resume() {
    showUI('play'); sfx('click');
    if (!isTouch && canvasEl.requestPointerLock) { try { canvasEl.requestPointerLock(); } catch (e) {} }
  }
  function startGame() {
    audioOn(); sfx('click');
    if (isTouch) {
      try {
        var de = document.documentElement, rq = de.requestFullscreen || de.webkitRequestFullscreen;
        if (rq) {
          var pr = rq.call(de, { navigationUI: 'hide' });
          if (pr && pr.then) pr.then(function () { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); }).catch(function () {});
        }
      } catch (e) {}
    }
    if (furnaceOK()) SEEN[FURNACE] = 1; if (tableOK()) SEEN[CRAFT] = 1;   // 내 땅에 놓아 둔 용광로·제작대
    SLOTS.forEach(function (s) { if (WORN[s]) SEEN[WORN[s]] = 1; }); saveSeen();
    started = true; seenQuiet = false; lastStage = curStage().n;
    if (myPlot >= 0) goHome(); else { teleport(XM + 0.5, G, PZ0 - 9, Math.PI); toast('숲·산·호수에서 재료를 캐서 모아 보세요. 방주 문은 옆으로 나 있어요(창 6:16)'); }
    var seen = false; try { seen = localStorage.getItem('arkVillage.tips') === '1'; } catch (e) {}
    if (isTouch && !seen) { showUI('tips'); return; }   // 휴대폰 처음: 조작 안내
    resume();
  }
  function travel(where) {
    var spots = {
      ark: [XM + 0.5, AZ1 + 8, 0, '방주 문 앞이에요 — 문은 옆으로(창 6:16)'],
      forest: [VX1 + 14, PZ0 + 60, -Math.PI / 2, '동쪽 숲이에요. 나무를 꾹 눌러 통나무를 모아요'],
      hill: [PX0 - 14, PZ0 + 60, Math.PI / 2, '서쪽 산이에요. 위쪽 바위에서 돌·석회암·검은 돌을 캘 수 있어요'],
      lake: [XM + 0.5, LZ - LRZ - 6, Math.PI, '남쪽 호수예요. 물가에서 진흙과 갈대를, 동쪽에서 역청을 캐요(창 14:10)'],
      sea: [XM + 0.5, SEA_Z + 24, 0, '북쪽 바다예요. 모래사장과 바닷속 물고기를 만나 보세요'],
      desert: [DES_X + 40, PZ0 + 70, -Math.PI / 2, '동쪽 사막이에요. 낙타를 만나고, 더 가면 오아시스가 있어요'],
      ararat: [ARX + 150, ARZ, Math.PI / 2, '아라랏 산이에요. 방주가 아라랏 산에 머물렀어요(창 8:4)']
    }, s = spots[where];
    teleport(s[0], surfaceY(Math.floor(s[0]), Math.floor(s[1])), s[1], s[2]); resume(); toast(s[3]);
  }

  // ───────── 입력 ─────────
  var keys = {}, joy = { x: 0, y: 0 }, jumpHeld = false, flyDown = false, sel = 0, lastJumpTap = 0, mouseMining = false;
  var hold = null; // 터치로 누르고 있는 손가락
  // 달리기: PC는 W 두 번(누르고 있는 동안)·Ctrl·R, 휴대폰은 🏃 버튼(다시 누르면 꺼짐)이나 막대를 끝까지
  var runLock = false, runSrc = '', lastW = 0, runTold = false;
  function setRun(on, src) {
    runLock = !!on; runSrc = on ? src : '';
    document.body.classList.toggle('running', runLock);
    if (on && src === 'btn' && !runTold) { runTold = true; toast('🏃 달리기 켬 — 앞으로 걸으면 더 빨리 가요. 한 번 더 누르면 꺼져요'); }
  }
  function jumpPress() {
    var now = performance.now();
    if (now - lastJumpTap < 280) { toggleFly(); lastJumpTap = 0; } else lastJumpTap = now;
    jumpHeld = true;
  }
  function bindInput(canvas) {
    window.addEventListener('keydown', function (e) {
      if (ui === 'chat') { if (e.code === 'Escape') { closePanel(); e.preventDefault(); } return; }
      if ((e.code === 'KeyT' || e.code === 'Enter') && ui === 'play' && !e.repeat) { openChat(); e.preventDefault(); return; }
      if (e.code === 'KeyE' && (ui === 'play' || ui === 'inv' || ui === 'chest')) { if (ui !== 'play') closePanel(); else openPanel('inv'); e.preventDefault(); return; }
      if ((e.code === 'F5' || e.code === 'KeyV') && ui === 'play') { cycleView(); e.preventDefault(); return; }
      if (e.code === 'KeyC' && (ui === 'play' || ui === 'looks') && !e.repeat) { if (ui === 'looks') closePanel(); else openLooks(); e.preventDefault(); return; }
      if (e.code === 'KeyM' && (ui === 'play' || ui === 'map') && !e.repeat) { if (ui === 'map') closePanel(); else { openPanel('map'); drawMap($('bigmapc'), true); } e.preventDefault(); return; }
      if (e.code === 'KeyH' && ui === 'play' && !e.repeat) { S.keysOff = !S.keysOff; saveSettings(); document.body.classList.toggle('keysoff', !!S.keysOff); return; }
      if (ui !== 'play') return;
      if (e.code === 'KeyW' && !e.repeat) { var nw = performance.now(); if (nw - lastW < 300) setRun(true, 'key'); lastW = nw; }
      keys[e.code] = true;
      if (e.code === 'Space' && !e.repeat) jumpPress();
      if (e.code === 'KeyF') toggleFly();
      if (/^Digit[1-9]$/.test(e.code)) setSel(+e.code.slice(5) - 1);
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && riding) dismount();
      if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; if (e.code === 'Space') jumpHeld = false; if (e.code === 'KeyW' && runSrc === 'key') setRun(false); });
    canvas.addEventListener('mousedown', function (e) {
      if (isTouch || ui !== 'play') return;
      if (!lockOn) { canvas.requestPointerLock && canvas.requestPointerLock(); return; }
      if (e.button === 0) { mouseMining = true; return; }
      if (e.button === 2) { tapAt(); return; }
      var h = pickCenter(); if (!h) return;
      else if (e.button === 1) { var id = get(h.x, h.y, h.z); id = dropOf(id); if (INV.indexOf(id) >= 0 && have(id) > 0) { var hj = HOTBAR.indexOf(id); if (hj >= 0) { setSel(hj); return; } HOTBAR[sel] = id; renderHotbar(); setSel(sel); saveSettings(); } }
    });
    window.addEventListener('mouseup', function (e) { if (e.button === 0) { mouseMining = false; mine = null; } });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('pointerlockchange', function () {
      lockOn = document.pointerLockElement === canvas;
      if (!lockOn && ui === 'play' && !isTouch) showUI('pause');
    });
    document.addEventListener('mousemove', function (e) { if (lockOn) look(e.movementX, e.movementY, 0.0024 * S.sens); });
    window.addEventListener('wheel', function (e) { if (lockOn) setSel((sel + (e.deltaY > 0 ? 1 : -1) + 9) % 9); });

    // 터치: 왼쪽 = 걷기, 오른쪽 = 둘러보기 · 톡 = 놓기 · 꾹 = 캐기(계속 누르면 이어서)
    var tMove = null, tLook = null, base = $('stickBase'), knob = $('knob');
    function stickHome() { base.classList.remove('active'); base.style.left = ''; base.style.top = ''; knob.style.transform = 'translate(0,0)'; }
    canvas.addEventListener('touchstart', function (e) {
      if (!isTouch) { isTouch = true; document.body.classList.add('touch'); }
      if (ui !== 'play') return;
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        // 걷기는 왼쪽 아래 방향키로 하고, 화면은 어디를 끌어도 둘러보기
        if (!tLook) {
          tLook = { id: t.identifier, lx: t.clientX, ly: t.clientY, t0: performance.now(), moved: 0 };
          hold = { x: t.clientX, y: t.clientY, t0: performance.now(), dug: false };
        }
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (tMove && t.identifier === tMove.id) {
          var dx = t.clientX - tMove.ox, dy = t.clientY - tMove.oy, L = Math.hypot(dx, dy), max = 50;
          if (L > max) { dx *= max / L; dy *= max / L; }
          joy.x = dx / max; joy.y = dy / max;
          knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        } else if (tLook && t.identifier === tLook.id) {
          var mx = t.clientX - tLook.lx, my = t.clientY - tLook.ly;
          tLook.moved += Math.abs(mx) + Math.abs(my);
          if (tLook.moved > 12 && hold && !hold.dug) stopHold();
          look(mx, my, 0.0058 * S.sens);
          tLook.lx = t.clientX; tLook.ly = t.clientY;
          if (hold) { hold.x = t.clientX; hold.y = t.clientY; }
        }
      }
      e.preventDefault();
    }, { passive: false });
    function end(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (tMove && t.identifier === tMove.id) { tMove = null; joy.x = joy.y = 0; stickHome(); }
        else if (tLook && t.identifier === tLook.id) {
          var tap = tLook.moved < 12 && performance.now() - tLook.t0 < 260 && hold && !hold.dug;
          if (tap) tapAt(tLook.lx, tLook.ly);
          stopHold(); tLook = null;
        }
      }
    }
    canvas.addEventListener('touchend', end); canvas.addEventListener('touchcancel', end);

    // 방향키(↑ ← → ↓): 누른 채 손가락을 옆으로 밀어도 따라가고, 모서리는 대각선. ↑ 두 번 = 달리기
    var pad = $('dpad'), padT = null, lastUp = 0, upWas = false;
    function padAt(t) {
      var r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
      var dx = (t.clientX - cx) / R, dy = (t.clientY - cy) / R;
      var x = Math.abs(dx) > 0.33 ? (dx > 0 ? 1 : -1) : 0, y = Math.abs(dy) > 0.33 ? (dy > 0 ? 1 : -1) : 0;
      if (Math.abs(dx) < 0.33 && Math.abs(dy) < 0.33) { x = 0; y = 0; }
      joy.x = x; joy.y = y;
      if (x && y) { joy.x = x * 0.7071; joy.y = y * 0.7071; }
      var up = y < 0;
      if (up && !upWas) { var now = performance.now(); if (now - lastUp < 330) setRun(true, 'pad'); lastUp = now; }
      if (!up && runSrc === 'pad') setRun(false);
      upWas = up;
      ['dUp', 'dLeft', 'dRight', 'dDown'].forEach(function (k, i) { $(k).classList.toggle('on', [y < 0, x < 0, x > 0, y > 0][i]); });
    }
    function padEnd() { padT = null; joy.x = joy.y = 0; upWas = false; if (runSrc === 'pad') setRun(false); ['dUp', 'dLeft', 'dRight', 'dDown'].forEach(function (k) { $(k).classList.remove('on'); }); }
    pad.addEventListener('touchstart', function (e) { if (ui !== 'play') return; var t = e.changedTouches[0]; if (!padT) { padT = t.identifier; padAt(t); } e.preventDefault(); e.stopPropagation(); }, { passive: false });
    pad.addEventListener('touchmove', function (e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === padT) padAt(e.changedTouches[i]); e.preventDefault(); e.stopPropagation(); }, { passive: false });
    function padUp(e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === padT) padEnd(); e.preventDefault(); }
    pad.addEventListener('touchend', padUp); pad.addEventListener('touchcancel', padUp);
  }
  function stopHold() { hold = null; mine = null; var r = $('ring'); if (r) r.classList.remove('show'); }
  function look(dx, dy, k) {
    P.yaw -= dx * k; P.pitch -= dy * k;
    P.pitch = Math.max(-1.53, Math.min(1.53, P.pitch));
  }
  function toggleFly() {
    if (!isAdm()) { if (P.fly) { P.fly = false; document.body.classList.remove('flying'); } return; }   // 날기는 관리자만
    if (riding) { toast('내린 뒤에 날 수 있어요'); return; }
    P.fly = !P.fly; P.vy = 0;
    document.body.classList.toggle('flying', P.fly);
    toast(P.fly ? '날기 켬 — 점프 두 번 누르면 꺼져요' : '날기 끔');
  }
  var VIEW_NAMES = ['1인칭', '3인칭(뒤)', '3인칭(앞)'];
  function cycleView() { S.view = (S.view + 1) % 3; saveSettings(); updateMenuLabels(); toast('시점: ' + VIEW_NAMES[S.view]); }
  var selNameT = null;
  function setSel(i, quiet) {
    sel = i;
    var slots = document.querySelectorAll('#hotbar .slot');
    for (var k = 0; k < slots.length; k++) slots[k].classList.toggle('on', k === i);
    if (!quiet) {
      var el = $('selName'); el.textContent = HOTBAR[i] ? B[HOTBAR[i]][0] + ' · ' + have(HOTBAR[i]) + '개' : '빈 손'; el.classList.add('show');
      clearTimeout(selNameT); selNameT = setTimeout(function () { el.classList.remove('show'); }, 1600);
    }
    if (heldMesh) setHeld(HOTBAR[i]);
  }

  // ───────── 겨누기(블록 찾기) ─────────
  function raycast(ox, oy, oz, dx, dy, dz, maxD) {
    var x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
    var sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    var tdx = Math.abs(1 / dx), tdy = Math.abs(1 / dy), tdz = Math.abs(1 / dz);
    var tx = (sx > 0 ? x + 1 - ox : ox - x) * tdx, ty = (sy > 0 ? y + 1 - oy : oy - y) * tdy, tz = (sz > 0 ? z + 1 - oz : oz - z) * tdz;
    var px = x, py = y, pz = z, t = 0;
    while (t <= maxD) {
      var id = get(x, y, z);
      if (y >= 0 && id !== AIR && id !== WATER) return { x: x, y: y, z: z, px: px, py: py, pz: pz, t: t };
      px = x; py = y; pz = z;
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; }
      else if (ty < tz) { y += sy; t = ty; ty += tdy; }
      else { z += sz; t = tz; tz += tdz; }
    }
    return null;
  }
  var camDist = 0, tmpV = new THREE.Vector3();
  function withinReach(h) {
    if (!h) return null;
    var d = Math.hypot(h.x + 0.5 - P.x, h.y + 0.5 - (P.y + EYE), h.z + 0.5 - P.z);
    return d <= REACH + 1 ? h : null;
  }
  function pickDir(dir) { var o = camera.position; return withinReach(raycast(o.x, o.y, o.z, dir.x, dir.y, dir.z, REACH + camDist + 1)); }
  function pickCenter() { camera.getWorldDirection(tmpV); return pickDir(tmpV); }
  function pickTouch(sx, sy) {
    if (S.aim === 'cross') return pickCenter();
    camera.updateMatrixWorld();
    tmpV.set(sx / window.innerWidth * 2 - 1, -(sy / window.innerHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    return pickDir(tmpV);
  }

  // ───────── 캐기·놓기 권한, 저장 ─────────
  var client = null, me = null, myPlot = -1, plotOwners = {}, plotUser = {}, saveTimer = null, dirty = false, started = false;
  function canMine(x, y, z) {
    if (inArk(x, y, z)) return '방주는 3단계에서 다 함께 지어요. 지금은 구경해요!';
    if (y <= 0) return '맨 아래 바닥은 캘 수 없어요';
    var p = plotAt(x, z);
    if (p >= 0) {
      if (!me || p !== myPlot) return (p + 1) + '번 땅은 ' + (me ? '다른 사람의 땅이에요' : '주인이 있는 땅이에요');
      if (y < PY0 || y >= G + PH) return '땅 높이 안에서만 지을 수 있어요';
      return '';
    }
    if (inTown(x, z) && y >= G - 4 && kind(get(x, y, z)) !== 'plant') return '마을 길과 마당은 캘 수 없어요. 숲·산·호수로 가 보세요';
    return '';
  }
  function canPlace(x, y, z, id) {
    if (inArk(x, y, z)) return '방주는 3단계에서 다 함께 지어요. 지금은 구경해요!';
    var p = plotAt(x, z);
    // 땅 밖(숲·산·호수 같은 자연)에서도 블록을 놓을 수 있다 — 마을 마당·다른 사람 땅·방주만 빼고
    if (p < 0) return inTown(x, z) && y >= G - 4 ? '마을 마당에는 놓을 수 없어요' : '';
    if (!me) return '로그인하면 내 땅을 받아 집을 지을 수 있어요';
    if (p !== myPlot) return (p + 1) + '번 땅은 다른 사람의 땅이에요';
    if (y < PY0 || y >= G + PH) return '땅 높이 안에서만 지을 수 있어요(아래 3칸 ~ 위 ' + PH + '칸)';
    return '';
  }
  var lastDeny = '', lastDenyT = 0;
  function deny(msg) { var now = performance.now(); if (msg !== lastDeny || now - lastDenyT > 1500) { toast(msg); lastDeny = msg; lastDenyT = now; } }
  function lookDir() { var fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); return Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 1 : 3) : (fz < 0 ? 0 : 2); }
  function doorColumn(x, y, z) {
    var y0 = y, y1 = y;
    while (SHAPE[get(x, y0 - 1, z)] && SHAPE[get(x, y0 - 1, z)].type === 'door') y0--;
    while (SHAPE[get(x, y1 + 1, z)] && SHAPE[get(x, y1 + 1, z)].type === 'door') y1++;
    return [y0, y1];
  }
  function toggleDoor(x, y, z) {
    var p = plotAt(x, z);
    if (p >= 0 && p !== myPlot) return deny('다른 사람 집의 문이에요');
    var c = doorColumn(x, y, z);
    for (var yy = c[0]; yy <= c[1]; yy++) { var nid = get(x, yy, z) ^ 1; setRaw(x, yy, z, nid); plotWrite(x, yy, z, nid); }
    for (yy = c[0]; yy <= c[1]; yy++) rebuildAround(x, yy, z);
    if (p === myPlot && myPlot >= 0) markDirty();
    sfx('door'); swingT = 0.25;
  }
  function act(kindA, h) {
    if (!h) return;
    if (kindA === 'break') {
      var why = canMine(h.x, h.y, h.z); if (why) return deny(why);
      var old = get(h.x, h.y, h.z), usedTool = mineInfo(old).tool || 0;
      if (SHAPE[old] && SHAPE[old].type === 'door') {
        // 문은 한 줄(4칸)을 통째로
        var dc = doorColumn(h.x, h.y, h.z);
        for (var dy = dc[0]; dy <= dc[1]; dy++) setBlock(h.x, dy, h.z, AIR);
        burst(h.x, h.y, h.z, old); dropItem(h.x + 0.5, h.y + 0.45, h.z + 0.5, DOOR, 1);
      } else {
        breakAt(h.x, h.y, h.z, old);
        var up = get(h.x, h.y + 1, h.z);
        if (kind(up) === 'plant') breakAt(h.x, h.y + 1, h.z, up);
      }
      if (isGrav(get(h.x, h.y + 1, h.z))) startFall(h.x, h.y + 1, h.z);
      sfx('break', matSound(old)); wearTool(usedTool); bagChanged();
    } else {
      var tgt = get(h.x, h.y, h.z);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'door') return toggleDoor(h.x, h.y, h.z);
      if (tgt === FURNACE || tgt === FURNACE_ON) { if (plotAt(h.x, h.z) !== myPlot) return deny('다른 사람의 용광로예요'); craftCat = 'smelt'; invTab = 'craft'; openPanel('inv'); return; }
      if (tgt === CHEST) return openChest(h.x, h.y, h.z);
      if (tgt === CRAFT) { craftCat = 'wear'; invTab = 'craft'; openPanel('inv'); sfx('click'); return; }
      var item = HOTBAR[sel];
      if (!item) return deny('손에 든 것이 없어요. 아래 칸을 고르거나 🎒 가방에서 단축 칸에 넣어요');
      if (WEARINFO[item]) return wearItem(item);
      var why2 = canPlace(h.px, h.py, h.pz, item); if (why2) return deny(why2);
      if (isItem(item)) return deny('「' + B[item][0] + '」은(는) 놓는 블록이 아니에요. 블록을 골라 주세요');
      if (have(item) < 1) return deny(B[item][0] + '이(가) 없어요. 캐거나 만들어서 모아요');
      var bx = h.px, by = h.py, bz = h.pz, id = item, ld = lookDir();
      if (kind(id) === 'plant' && (!isSolid(get(bx, by - 1, bz)) || isShape(get(bx, by - 1, bz)))) return deny(id === TORCH ? '횃불은 단단한 블록 위에만 놓을 수 있어요' : '풀과 꽃은 땅 위에만 심을 수 있어요');
      if (SHAPE[id] && SHAPE[id].type === 'stair') id = SHAPE[id].base + ld;
      if (id === LADDER) {
        var ddx = h.x - h.px, ddz = h.z - h.pz;
        if (ddx || ddz) { if (!isSolid(get(h.x, h.y, h.z)) || SHAPE[get(h.x, h.y, h.z)]) return deny('사닥다리는 벽에 붙여요'); id = LADDER + (ddz < 0 ? 0 : (ddx > 0 ? 1 : (ddz > 0 ? 2 : 3))); }
        else id = LADDER + ld;
      }
      if (id === SAPLING && [GRASS, DIRT].indexOf(get(bx, by - 1, bz)) < 0) return deny('묘목은 풀이나 흙 위에 심어요');
      function hitsMe(yy) { return bx + 1 > P.x - HW && bx < P.x + HW && yy + 1 > P.y && yy < P.y + HT && bz + 1 > P.z - HW && bz < P.z + HW; }
      if (item === DOOR) {
        // 문: 사람 키에 맞게 4칸 높이
        for (var k = 0; k < 4; k++) {
          var c = get(bx, by + k, bz);
          if ((c !== AIR && kind(c) !== 'plant') || canPlace(bx, by + k, bz)) return deny('문은 위로 빈 칸 4개가 있어야 놓을 수 있어요');
        }
        var df = (ld + 2) % 4;
        take(DOOR, 1);
        for (k = 0; k < 4; k++) setBlock(bx, by + k, bz, DOOR + df * 2);
        sfx('place', matSound(item)); bagChanged(); stats.placed++; questCheck();
        swingT = 0.25; vibrate(); return;
      }
      if (isSolid(id) && !SHAPE[id] && hitsMe(by)) return;
      take(item, 1); setBlock(bx, by, bz, id); sfx('place', matSound(item)); bagChanged();
      if (isGrav(id)) startFall(bx, by, bz);
      if (id === SAPLING) { SAPS.push({ x: bx, y: by, z: bz, t: Date.now() + (90 + Math.random() * 90) * 1000 }); saveSaps(); toast('묘목을 심었어요. 조금 지나면 나무로 자라요 (시 1:3)'); }
      if (plotAt(bx, bz) === myPlot) { stats.placed++; questCheck(); }
    }
    swingT = 0.25; vibrate();
  }
  function breakAt(x, y, z, old) {
    setBlock(x, y, z, AIR); burst(x, y, z, old);
    var dropId = dropOf(old);
    dropItem(x + 0.5, y + 0.45, z + 0.5, dropId, 1);
    if (old === CHEST) spillChest(x, y, z);
    if (old === LEAF) {
      if (Math.random() < 0.08) dropItem(x + 0.5, y + 0.45, z + 0.5, SAPLING, 1);
      if (Math.random() < 0.025) {
        dropItem(x + 0.5, y + 0.45, z + 0.5, OLIVE, 1);
        toast('🕊 감람나무 새 잎사귀! 비둘기가 물고 온 잎이에요 (창 8:11)');
      }
    }
    if (DEX_MATS.indexOf(dropId) >= 0 && !DEX['m' + dropId]) { DEX['m' + dropId] = 1; saveDex(); toast('📖 도감에 「' + B[dropId][0] + '」을(를) 적었어요'); }
    if (dropId === LOG) { stats.log++; questCheck(); }
  }
  var pickT = null, pickAgg = {};
  function pickup(id, n) {
    pickAgg[id] = (pickAgg[id] || 0) + (n || 1);
    var el = $('pickup'), parts = [];
    for (var k in pickAgg) parts.push('+' + pickAgg[k] + ' ' + B[k][0]);
    el.textContent = parts.join('  '); el.classList.add('show'); sfx('pop');
    clearTimeout(pickT); pickT = setTimeout(function () { el.classList.remove('show'); pickAgg = {}; }, 1400);
  }
  function vibrate() { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }
  function setBlock(x, y, z, id) {
    var was = get(x, y, z), c0 = colAt(x, z);
    setRaw(x, y, z, id); updateSky(x, z); plotWrite(x, y, z, id);
    if (plotAt(x, z) < 0) recordEdit(x, y, z, id);
    if (c0) c0.mod = true;
    if (LIGHTS[was] || LIGHTS[id]) {
      if (c0) { if (LIGHTS[id]) c0.lamps.push([x, y, z]); else c0.lamps = c0.lamps.filter(function (l) { return l[0] !== x || l[1] !== y || l[2] !== z; }); }
      lampChanged(x, y, z);
    } else rebuildAround(x, y, z);
    if (plotAt(x, z) === myPlot && myPlot >= 0) markDirty();
    netEdit(x, y, z, id);
  }
  function markDirty() { dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(savePlot, 1500); setSave('저장 중…'); }

  // 캐는 중(꾹 누르기/왼쪽 클릭 누르고 있기)
  var mine = null, crackMesh = null, crackGeo = [];
  function mineTick(h, dt) {
    if (!h) { mine = null; return; }
    if (!mine || mine.x !== h.x || mine.y !== h.y || mine.z !== h.z) {
      var why = canMine(h.x, h.y, h.z);
      if (why) { deny(why); mine = { x: h.x, y: h.y, z: h.z, t: 0, need: 1, denied: true }; return; }
      var id = get(h.x, h.y, h.z), mi = mineInfo(id);
      if (mi.deny) { deny(mi.deny); mine = { x: h.x, y: h.y, z: h.z, t: 0, need: 1, denied: true }; return; }
      mine = { x: h.x, y: h.y, z: h.z, t: 0, need: mi.t * (P.swim ? 3 : 1), snd: 0, f: DIG_F[TCLASS[id]] || 900 };
    }
    if (mine.denied) return;
    mine.t += dt; mine.snd -= dt;
    if (mine.snd <= 0) { sfx('dig', mine.f); mine.snd = 0.2; swingT = 0.25; burst(mine.x, mine.y, mine.z, get(mine.x, mine.y, mine.z), true); }
    if (mine.t >= mine.need) { act('break', h); mine = null; if (hold) hold.dug = true; }
  }
  function updateCrack() {
    if (mine && !mine.denied && mine.t > 0) {
      var st = Math.min(7, Math.floor(mine.t / mine.need * 8));
      crackMesh.geometry = crackGeo[st]; crackMesh.position.set(mine.x + 0.5, mine.y + 0.5, mine.z + 0.5); crackMesh.visible = true;
    } else crackMesh.visible = false;
  }
  function updateRing() {
    var r = $('ring');
    if (!hold || !mine || mine.denied || ui !== 'play') { r.classList.remove('show'); return; }
    var px = S.aim === 'cross' ? window.innerWidth / 2 : hold.x, py = S.aim === 'cross' ? window.innerHeight / 2 : hold.y;
    r.classList.add('show'); r.style.left = px + 'px'; r.style.top = py + 'px';
    r.style.setProperty('--p', (Math.min(1, mine.t / mine.need) * 100) + '%');
  }

  // 땅 한 필지 = 24×24×(PH+3)칸 → (개수, 블록) 묶음 → base64, 뒤에 |i:가방 |d:도감
  function plotDefault() {
    var a = new Uint8Array(PSIZE), k = 0;
    for (var y = PY0; y < G + PH; y++) { var id = y < G - 1 ? DIRT : (y === G - 1 ? GRASS : AIR); for (var j = 0; j < PLOT * PLOT; j++) a[k++] = id; }
    return a;
  }
  function plotWrite(x, y, z, id) {
    var p = plotAt(x, z);
    if (p < 0 || p !== myPlot || y < PY0 || y >= G + PH) return;
    if (!plotData[p]) plotData[p] = plotDefault();
    var o = plotOrigin(p); plotData[p][((y - PY0) * PLOT + (z - o.z)) * PLOT + (x - o.x)] = id;
  }
  function encodePlot(i) {
    var a = plotData[i], out = '', k;
    if (a) {
      for (k = 0; k < a.length;) {
        var v = a[k], n = 1;
        while (k + n < a.length && a[k + n] === v && n < 255) n++;
        out += String.fromCharCode(n, v); k += n;
      }
    }
    var cs = chestString();
    return (a ? 'r1:' + btoa(out) : 'r0:') + '|i:' + bagString() + '|d:' + dexString() + (cs ? '|c:' + cs : '') + '|w:' + wornString() + '|s:' + seenString();
  }
  function decodePlot(i, data, mine) {
    try {
      var parts = data.split('|'), body = parts[0];
      if (mine) parts.slice(1).forEach(function (seg) {
        if (seg.slice(0, 2) === 'i:') { BAG = bagFromString(seg.slice(2)); for (var bk4 in BAG) if (BAG[bk4] > 0) SEEN[+bk4] = 1; saveSeen(); }
        else if (seg.slice(0, 2) === 's:') { seg.slice(2).split('.').forEach(function (k) { if (+k && B[+k]) SEEN[+k] = 1; }); saveSeen(); }
        else if (seg.slice(0, 2) === 'c:') chestFromString(seg.slice(2));
        else if (seg.slice(0, 2) === 'w:') { wornFromString(seg.slice(2)); try { localStorage.setItem('arkVillage.worn', wornString()); } catch (e) {} refreshMyAvatar(); }
        else if (seg.slice(0, 2) === 'd:') { dexFromString(seg.slice(2)); try { localStorage.setItem('arkVillage.dex', JSON.stringify(DEX)); } catch (e) {} }
      });
      if (body.slice(0, 3) !== 'r1:') return;
      var s = atob(body.slice(3)), a = new Uint8Array(PSIZE), k = 0;
      for (var j = 0; j + 1 < s.length; j += 2) {
        var n = s.charCodeAt(j), v = s.charCodeAt(j + 1);
        if (k + n > PSIZE) return;
        a.fill(v < B.length && B[v] && v !== WATER ? v : AIR, k, k + n); k += n;
      }
      if (k !== PSIZE) return;
      plotData[i] = a;
    } catch (e) {}
  }
  function savePlotNow() {
    if (!client || !me || myPlot < 0) return Promise.resolve();
    clearTimeout(saveTimer); dirty = false;
    var data = encodePlot(myPlot);
    if (data.length > 20000) return Promise.resolve();
    return client.from('ark_village_plots').update({ data: data, updated_at: new Date().toISOString() }).eq('user_id', me.id)
      .then(function (r) { setSave(r.error ? '저장 실패 — 다시 시도해요' : '저장됨'); if (r.error) { dirty = true; saveTimer = setTimeout(savePlot, 4000); } });
  }
  function savePlot() {
    if (!client || !me || myPlot < 0 || !dirty) return;
    var data = encodePlot(myPlot);
    if (data.length > 20000) { setSave('저장 안 됨'); toast('집이 너무 복잡해서 저장할 수 없어요. 블록을 조금 정리해 주세요'); return; }
    dirty = false;
    client.from('ark_village_plots').update({ data: data, updated_at: new Date().toISOString() }).eq('user_id', me.id)
      .then(function (r) { setSave(r.error ? '저장 실패 — 다시 시도해요' : '저장됨'); if (r.error) { dirty = true; saveTimer = setTimeout(savePlot, 4000); } });
  }
  function setSave(t) { var el = $('saveState'); if (el) el.textContent = t; }
  function markPlots() {
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var o = plotOrigin(i), id = i === myPlot ? 15 : (plotOwners[i] ? 11 : 0);
      if (!id) continue;
      [[-1, -1], [PLOT, -1], [-1, PLOT], [PLOT, PLOT]].forEach(function (c) { setRaw(o.x + c[0], G - 1, o.z + c[1], id); });
    }
  }

  // ───────── 부서지는 조각 ─────────
  var bits = [], bitGeo = null, bitMats = {};
  // 무늬에서 실제 색 몇 개를 골라 조각 색으로
  var palCache = {};
  function tilePalette(t) {
    if (palCache[t]) return palCache[t];
    var dd = actx.getImageData((t % ACOLS) * TS, Math.floor(t / ACOLS) * TS, TS, TS).data, cs = [];
    for (var k = 0; k < 4; k++) for (var tries = 0; tries < 20; tries++) {
      var o = (Math.floor(Math.random() * TS * TS)) * 4; if (dd[o + 3] < 128) continue;
      cs.push((dd[o] << 16) | (dd[o + 1] << 8) | dd[o + 2]); break;
    }
    if (!cs.length) cs.push(TILE_AVG[t]);
    return (palCache[t] = cs);
  }
  function burst(x, y, z, id, small) {
    if (!id) return;
    var mats = bitMats[id] || (bitMats[id] = tilePalette(BT[id][1]).map(function (c) { return new THREE.MeshBasicMaterial({ color: c }); }));
    var cnt = small ? 2 : 10;
    for (var i = 0; i < cnt; i++) {
      var m = new THREE.Mesh(bitGeo, mats[i % mats.length]);
      m.position.set(x + 0.2 + Math.random() * 0.6, y + (small ? 0.9 : 0.2 + Math.random() * 0.6), z + 0.2 + Math.random() * 0.6);
      if (small) m.scale.setScalar(0.6);
      m.userData = { vx: (Math.random() - 0.5) * (small ? 2.5 : 5), vy: (small ? 1.5 : 3) + Math.random() * (small ? 2 : 5), vz: (Math.random() - 0.5) * (small ? 2.5 : 5), life: small ? 0.3 : 0.55 + Math.random() * 0.3, s0: small ? 0.6 : 1 };
      scene.add(m); bits.push(m);
    }
  }
  // 땅에 떨어진 것: 빙글 돌며 떠 있다가 가까이 가면 빨려 들어온다(멀어지거나 오래되면 그냥 가방으로)
  var DROPS = [], dropGeo = {}, dropMatB = null, dropMatF = null;
  function dropMats() {
    if (!dropMatB) {
      dropMatB = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true }); lightPatch(dropMatB);
      dropMatF = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }); lightPatch(dropMatF);
    }
  }
  function isFlat(id) { return isItem(id) || kind(id) === 'plant' || (SHAPE[id] && (SHAPE[id].type === 'ladder' || SHAPE[id].type === 'door')); }
  function dropItem(x, y, z, id, n) {
    if (!id || INV.indexOf(id) < 0 || !n) return;
    for (var i = 0; i < DROPS.length; i++) { var o0 = DROPS[i]; if (o0.id === id && !o0.dead && Math.abs(o0.x - x) < 1 && Math.abs(o0.y - y) < 1.2 && Math.abs(o0.z - z) < 1) { o0.n += n; return; } }
    if (DROPS.length > 60) collectDrop(DROPS[0], true);
    if (!scene || !atlasTex) { give(id, n); return; }
    dropMats();
    var flat = isFlat(id), geo = dropGeo[id] || (dropGeo[id] = flat ? itemGeometry(id) : blockGeometry(id));
    var m = new THREE.Mesh(geo, flat ? dropMatF : dropMatB); m.scale.setScalar(flat ? 0.5 : 0.3); m.position.set(x, y, z); scene.add(m);
    DROPS.push({ id: id, n: n, x: x, y: y, z: z, vx: (Math.random() - 0.5) * 2.2, vy: 3.5, vz: (Math.random() - 0.5) * 2.2, age: 0, m: m, rot: Math.random() * 6 });
  }
  function collectDrop(o, quiet) {
    if (o.dead) return; o.dead = true;
    give(o.id, o.n); if (!quiet) pickup(o.id, o.n);
    if (o.m) { scene.remove(o.m); o.m = null; }
  }
  function collectAll() { DROPS.forEach(function (o) { collectDrop(o, true); }); DROPS = []; bagChanged(); }
  window.addEventListener('pagehide', function () { if (DROPS.length) collectAll(); });
  function stepDrops(dt) {
    if (!DROPS.length) return;
    var got = false, px = P.x, py = P.y + 1.3, pz = P.z;
    for (var i = 0; i < DROPS.length; i++) {
      var o = DROPS[i]; if (o.dead) continue;
      o.age += dt;
      var dx = px - o.x, dy = py - o.y, dz = pz - o.z, dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
      if (dist > 28 || o.age > 30) { collectDrop(o, true); got = true; continue; }
      if (o.age > 0.35 && (dist < 3.4 || o.age > 6)) {
        var spd = Math.min(32, 7 + (3.4 - Math.min(dist, 3.4)) * 9 + (o.age > 6 ? 12 : 0));
        o.x += dx / dist * spd * dt; o.y += dy / dist * spd * dt; o.z += dz / dist * spd * dt;
        if (dist < 0.9) { collectDrop(o); got = true; continue; }
      } else {
        o.vy -= 22 * dt;
        var nx = o.x + o.vx * dt, nz = o.z + o.vz * dt, ny = o.y + o.vy * dt;
        if (isSolid(get(Math.floor(nx), Math.floor(o.y), Math.floor(nz))) && !SHAPE[get(Math.floor(nx), Math.floor(o.y), Math.floor(nz))]) { nx = o.x; nz = o.z; o.vx = o.vz = 0; }
        var below = get(Math.floor(nx), Math.floor(ny - 0.18), Math.floor(nz));
        if (o.vy < 0 && isSolid(below)) { ny = Math.floor(ny - 0.18) + 1.18; o.vy = 0; o.vx *= 0.6; o.vz *= 0.6; }
        o.x = nx; o.y = ny; o.z = nz;
      }
      o.rot += dt * 1.8;
      o.m.position.set(o.x, o.y + Math.sin(o.age * 3) * 0.06, o.z); o.m.rotation.y = o.rot;
    }
    DROPS = DROPS.filter(function (o) { return !o.dead; });
    if (got) bagChanged();
  }
  // ════════ 7) 모래·자갈은 받침이 없으면 떨어진다 ════════
  var FALLS = [], fallRes = {}, fallGeo = {};
  function isGrav(id) { return id === SAND || id === 18; }
  function fallThrough(b) { return b === AIR || b === WATER || kind(b) === 'plant'; }
  function startFall(x, y, z) {
    var id = get(x, y, z); if (!isGrav(id)) return;
    if (!fallThrough(get(x, y - 1, z)) || fallRes[x + ',' + (y - 1) + ',' + z]) return;
    setBlock(x, y, z, AIR);
    var ly = y; while (ly - 1 >= 1 && fallThrough(get(x, ly - 1, z)) && !fallRes[x + ',' + (ly - 1) + ',' + z]) ly--;
    fallRes[x + ',' + ly + ',' + z] = 1;
    dropMats();
    var m = new THREE.Mesh(fallGeo[id] || (fallGeo[id] = blockGeometry(id)), dropMatB); m.position.set(x + 0.5, y + 0.5, z + 0.5); scene.add(m);
    FALLS.push({ id: id, x: x, z: z, y: y, ty: ly, vy: 0, m: m });
    if (isGrav(get(x, y + 1, z))) startFall(x, y + 1, z);
  }
  function stepFalls(dt) {
    for (var i = FALLS.length - 1; i >= 0; i--) {
      var f = FALLS[i]; f.vy -= 30 * dt; f.y += f.vy * dt;
      if (f.y <= f.ty) {
        scene.remove(f.m); FALLS.splice(i, 1); delete fallRes[f.x + ',' + f.ty + ',' + f.z];
        var cur = get(f.x, f.ty, f.z), x = f.x, y = f.ty, z = f.z;
        var onMe = x + 1 > P.x - HW && x < P.x + HW && y + 1 > P.y && y < P.y + HT && z + 1 > P.z - HW && z < P.z + HW;
        if (fallThrough(cur) && !onMe) { if (kind(cur) === 'plant') dropItem(x + 0.5, y + 1.2, z + 0.5, dropOf(cur), 1); setBlock(x, y, z, f.id); sfx('place', matSound(f.id)); }
        else dropItem(x + 0.5, y + 1.2, z + 0.5, f.id, 1);
        continue;
      }
      f.m.position.y = f.y + 0.5;
    }
  }
  var SAPS = [];
  try { SAPS = JSON.parse(localStorage.getItem('arkVillage.saps') || '[]') || []; } catch (e) { SAPS = []; }
  function saveSaps() { try { localStorage.setItem('arkVillage.saps', JSON.stringify(SAPS)); } catch (e) {} }
  // 블록 여러 개를 한꺼번에 바꾸고 그림은 한 번만 다시 그림
  function setQuiet(x, y, z, id) { setRaw(x, y, z, id); plotWrite(x, y, z, id); if (plotAt(x, z) < 0) recordEdit(x, y, z, id); var c0 = colAt(x, z); if (c0) c0.mod = true; netEdit(x, y, z, id); }
  function rebuildBox(x0, y0, z0, x1, y1, z1) {
    for (var cz = Math.floor(z0 / CS); cz <= Math.floor(z1 / CS); cz++) for (var cx = Math.floor(x0 / CS); cx <= Math.floor(x1 / CS); cx++) {
      if (!inWorldC(cx, cz) || !meshedCols[cz * NC + cx]) continue;
      for (var cy = Math.max(0, Math.floor(y0 / CS)); cy <= Math.min(CY - 1, Math.floor(y1 / CS)); cy++) buildChunk(cx, cy, cz);
    }
  }
  function growTree(x, y, z) {
    var hgt = 5 + (hash2(x, z, 51) * 2 | 0), p0 = plotAt(x, z);
    function ok(cx, cy, cz) { return !inArk(cx, cy, cz) && plotAt(cx, cz) === p0 && !(p0 < 0 && inTown(cx, cz) && cy >= G - 4) && cy < (p0 >= 0 ? G + PH : SY - 1) && get(cx, cy, cz) === AIR; }
    for (var k = 1; k < hgt; k++) if (!ok(x, y + k, z)) return false;
    for (k = 0; k < hgt; k++) setQuiet(x, y + k, z, LOG);
    for (var ly = hgt - 2; ly <= hgt + 1; ly++) {
      var rr = ly >= hgt ? 1 : 2;
      for (var dz = -rr; dz <= rr; dz++) for (var dx = -rr; dx <= rr; dx++) {
        if (rr === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        if (ly === hgt + 1 && dx && dz) continue;
        if (ok(x + dx, y + ly, z + dz)) setQuiet(x + dx, y + ly, z + dz, LEAF);
      }
    }
    updateSky(x, z); for (var sz = -2; sz <= 2; sz++) for (var sx = -2; sx <= 2; sx++) updateSky(x + sx, z + sz);
    rebuildBox(x - 3, y - 1, z - 3, x + 3, y + hgt + 2, z + 3);
    if (p0 >= 0 && p0 === myPlot) markDirty();
    return true;
  }
  setInterval(function () {
    if (!SAPS.length) return;
    var now = Date.now(), ch = false;
    SAPS = SAPS.filter(function (sp) {
      if (sp.t > now || !colAt(sp.x, sp.z)) return true;
      if (get(sp.x, sp.y, sp.z) !== SAPLING) { ch = true; return false; }
      if (growTree(sp.x, sp.y, sp.z)) { ch = true; if (Math.hypot(sp.x - P.x, sp.z - P.z) < 40) toast('🌳 묘목이 나무로 자랐어요'); return false; }
      sp.t = now + 30000; ch = true; return true;
    });
    if (ch) saveSaps();
  }, 2000);
  function stepBits(dt) {
    for (var i = bits.length - 1; i >= 0; i--) {
      var m = bits[i], d = m.userData;
      d.life -= dt; d.vy -= 30 * dt;
      m.position.x += d.vx * dt; m.position.y += d.vy * dt; m.position.z += d.vz * dt;
      if (isSolid(get(Math.floor(m.position.x), Math.floor(m.position.y), Math.floor(m.position.z)))) { d.vy = 0; d.vx *= 0.5; d.vz *= 0.5; m.position.y = Math.ceil(m.position.y) + 0.01; }
      m.scale.setScalar(Math.max(0.01, Math.min(1, d.life * 2)) * (d.s0 || 1));
      if (d.life <= 0) { scene.remove(m); bits.splice(i, 1); }
    }
  }

  // ───────── 화면 글·패널 ─────────
  var toastT = null;
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2600); }
  placeName = function () {
    var x = Math.floor(P.x), y = Math.floor(P.y), z = Math.floor(P.z);
    if (x >= AX0 && x <= AX1 && z >= AZ0 && z <= AZ1 && y >= AY0 && y <= AY1 + 1) {
      if (y > AY1 - 1) return '방주 지붕';
      return y >= AY0 + 21 ? '방주 상층' : (y >= AY0 + 11 ? '방주 중층' : '방주 하층');
    }
    var p = plotAt(x, z);
    if (p >= 0) return p === myPlot ? '내 땅 (' + (p + 1) + '번)' : (p + 1) + '번 땅' + (plotOwners[p] ? '' : ' · 빈 땅');
    var reg = region(x, z);
    if (reg === 'tar') return '역청 구덩이 (창 14:10)';
    if (reg === 'lake') return P.swim ? '호수 (헤엄치는 중)' : '남쪽 호숫가';
    if (inTown(x, z)) return z < AZ1 + 16 && z > AZ0 - 16 ? '방주 앞' : '나그네 마을';
    if (reg === 'west') return '서쪽 산';
    if (reg === 'east') return '동쪽 숲';
    if (reg === 'sea' || z < SEA_Z + 40) return P.swim ? '북쪽 바다 (헤엄치는 중)' : '북쪽 바닷가';
    if (reg === 'desert') return '동쪽 사막';
    if (reg === 'oasis') return '오아시스';
    if (reg === 'ararat') return '아라랏 산 (창 8:4)';
    if (reg === 'south') return '남쪽 들판';
    return '들판';
  };
  function slotHTML(id, count) {
    var bar = '';
    if (count > 0 && isTool(id) && WEAR[id] !== undefined) {
      var f = WEAR[id] / toolMax(id);
      bar = '<b class="dur"><s style="width:' + Math.max(4, Math.round(f * 100)) + '%;background:' + (f > 0.5 ? '#4fd14f' : f > 0.2 ? '#e8c53a' : '#e0473a') + '"></s></b>';
    }
    return '<img alt="" src="' + ICON[id] + '"' + (count === 0 ? ' class="none"' : '') + '>' + bar + (count > 0 && !(isTool(id) && count === 1) ? '<i>' + count + '</i>' : '');
  }
  function renderHotbar() {
    var bar = $('hotbar'); bar.innerHTML = '';
    HOTBAR.forEach(function (id, i) {
      var d = document.createElement('button'); d.className = 'slot' + (i === sel ? ' on' : ''); d.title = nameOf(id) + ' (' + (i + 1) + ')'; d.innerHTML = (id ? slotHTML(id, have(id)) : '') + '<u class="num">' + (i + 1) + '</u>';
      d.addEventListener('click', function () { setSel(i); sfx('click'); });
      bar.appendChild(d);
    });
    var more = document.createElement('button'); more.className = 'slot more'; more.innerHTML = '🎒<small>가방</small>'; more.title = '가방·만들기 (E)';
    more.addEventListener('click', function () { openPanel('inv'); sfx('click'); });
    bar.appendChild(more);
  }
  var invTab = 'bag', craftCat = 'block', bagPick = null;
  function renderInv() {
    $('tabBag').classList.toggle('on', invTab === 'bag'); $('tabCraft').classList.toggle('on', invTab === 'craft'); $('tabDex').classList.toggle('on', invTab === 'dex');
    $('bagView').style.display = invTab === 'bag' ? '' : 'none'; $('craftView').style.display = invTab === 'craft' ? '' : 'none'; $('dexView').style.display = invTab === 'dex' ? '' : 'none';
    renderDex();
    var grid = $('invGrid'), row = $('invHot'), list = $('craftList'); grid.innerHTML = ''; row.innerHTML = ''; list.innerHTML = '';
    // 가방: 가진 것만 칸에. 눌러서 집고 → 다른 가방 칸(자리 바꾸기)이나 아래 단축 칸(넣기)을 누른다
    syncBagSlots();
    function info(id) { return B[id][0] + ' ' + have(id) + '개' + (isTool(id) ? ' · 남은 힘 ' + wearLeft(id) + '/' + toolMax(id) : ''); }
    BAGSLOT.forEach(function (id, i) {
      var d = document.createElement('button'), on = bagPick && bagPick.from === 'bag' && bagPick.i === i;
      d.className = 'islot' + (on ? ' pick' : '') + (id ? '' : ' empty'); d.innerHTML = id ? slotHTML(id, have(id)) : ''; d.title = id ? B[id][0] : '빈 칸';
      d.addEventListener('click', function () {
        sfx('click');
        if (bagPick && bagPick.from === 'bag') {
          if (bagPick.i !== i) { var t = BAGSLOT[i]; BAGSLOT[i] = BAGSLOT[bagPick.i]; BAGSLOT[bagPick.i] = t; saveSettings(); $('invName').textContent = '자리를 옮겼어요'; }
          else $('invName').textContent = '내려놓았어요';
          bagPick = null; renderInv(); return;
        }
        if (bagPick && bagPick.from === 'hot') {   // 단축 칸에서 집은 것을 가방에 놓으면 단축 칸이 빈다
          var hid = HOTBAR[bagPick.i]; HOTBAR[bagPick.i] = 0; saveSettings(); renderHotbar(); setSel(sel, true);
          $('invName').textContent = (bagPick.i + 1) + '번 단축 칸을 비웠어요' + (hid ? ' (' + jo(B[hid][0], '은', '는') + ' 가방에 그대로 있어요)' : '');
          bagPick = null; renderInv(); return;
        }
        if (!id) { $('invName').textContent = '빈 칸이에요'; return; }
        bagPick = { from: 'bag', i: i, id: id }; renderInv();
        $('invName').textContent = info(id) + ' — 집었어요 → 아래 단축 칸을 누르면 넣고, 다른 가방 칸을 누르면 자리를 바꿔요';
      });
      grid.appendChild(d);
    });
    HOTBAR.forEach(function (id, i) {
      var on = bagPick && bagPick.from === 'hot' && bagPick.i === i;
      var d = document.createElement('button'); d.className = 'islot' + (i === sel ? ' on' : '') + (on ? ' pick' : '') + (id ? '' : ' empty'); d.innerHTML = (id ? slotHTML(id, have(id)) : '') + '<u class="num">' + (i + 1) + '</u>'; d.title = (i + 1) + '번 칸: ' + nameOf(id);
      d.addEventListener('click', function () {
        sfx('click');
        if (bagPick && bagPick.from === 'bag') {   // 가방에서 집은 것을 이 단축 칸에
          var pid = bagPick.id, j = HOTBAR.indexOf(pid);
          if (j >= 0 && j !== i) HOTBAR[j] = HOTBAR[i];   // 같은 것이 다른 칸에 있으면 서로 바꿈
          HOTBAR[i] = pid; saveSettings(); bagPick = null; setSel(i, true); renderHotbar(); renderInv();
          $('invName').textContent = B[pid][0] + ' → ' + (i + 1) + '번 단축 칸'; return;
        }
        if (bagPick && bagPick.from === 'hot') {   // 단축 칸끼리 자리 바꾸기
          if (bagPick.i !== i) { var t2 = HOTBAR[i]; HOTBAR[i] = HOTBAR[bagPick.i]; HOTBAR[bagPick.i] = t2; saveSettings(); $('invName').textContent = '단축 칸 자리를 바꿨어요'; }
          bagPick = null; setSel(i, true); renderHotbar(); renderInv(); return;
        }
        setSel(i, true); renderHotbar();
        if (id) { bagPick = { from: 'hot', i: i, id: id }; $('invName').textContent = (i + 1) + '번 칸 ' + info(id) + ' — 집었어요 → 다른 단축 칸을 누르면 자리 바꾸기, 가방 칸을 누르면 이 칸 비우기'; }
        else $('invName').textContent = (i + 1) + '번 칸은 비어 있어요. 가방에서 넣을 것을 먼저 눌러요';
        renderInv();
      });
      row.appendChild(d);
    });
    ['block', 'shape', 'tool', 'smelt', 'wear'].forEach(function (c) { var b = $('cc_' + c); if (b) b.classList.toggle('on', craftCat === c); });
    if (craftCat === 'wear') {
      var wi = document.createElement('div'); wi.className = 'fuelinfo';
      wi.innerHTML = '🪚 옷은 <b>제작대</b>가 가방에 있거나 내 땅에 놓여 있어야 만들어요' + (tableOK() ? ' — <b>지금 만들 수 있어요</b>' : '') + '. 가죽은 소·염소·낙타를, 양털은 양을 칼을 들고 누르면 얻어요. 만든 옷은 손에 들고 누르거나 「👤 내 모습」에서 입어요.';
      list.appendChild(wi);
    }
    if (craftCat === 'smelt') {
      var fi = document.createElement('div'); fi.className = 'fuelinfo';
      var fl = Math.floor(fuelLeft() * 2) / 2;
      fi.innerHTML = '🔥 땔감: 석탄·숯 1개 = 8번 · 통나무 1개 = 1.5번 · 석탄 블록 = 72번 — <b>지금 ' + fl + '번 녹일 수 있어요</b>' + (HEAT > 0 ? ' (용광로에 남은 불 ' + HEAT + ')' : '');
      list.appendChild(fi);
      var sj = document.createElement('div'); sj.id = 'smeltJobs'; list.appendChild(sj); updateSmeltUI();
    }
    if (craftCat === 'tool') {
      var REP_MAT = [GOPHER, STONE, ING_CU, ING_FE, GEM_DIA];
      Object.keys(WEAR).forEach(function (k) {
        var tid = +k; if (have(tid) < 1) return;
        var mat = REP_MAT[tierOf(tid)], mx = toolMax(tid), w = WEAR[tid], nw = Math.min(mx, w + Math.ceil(mx / 4)), okR = have(mat) >= 1;
        var r = document.createElement('div'); r.className = 'rec rep' + (okR ? '' : ' no');
        r.innerHTML = '<span class="ins"><span class="ri"><img src="' + ICON[tid] + '" alt=""></span><b>+</b><span class="ri' + (okR ? '' : ' lack') + '"><img src="' + ICON[mat] + '" alt=""><i>1</i></span></span><b class="arr">→</b><span class="ri"><img src="' + ICON[tid] + '" alt=""></span>'
          + '<span class="rname">' + toolName(tid) + ' 고치기 <small>힘 ' + w + ' → ' + nw + ' / ' + mx + '</small></span>';
        var bt = document.createElement('button'); bt.className = 'mc mk'; bt.textContent = '고치기';
        bt.addEventListener('click', function () {
          if (have(mat) < 1) { $('invName').textContent = B[mat][0] + '이(가) 1개 있어야 고칠 수 있어요'; sfx('click'); return; }
          take(mat, 1); if (nw >= mx) delete WEAR[tid]; else WEAR[tid] = nw;
          sfx('craft'); $('invName').textContent = toolName(tid) + '을(를) 고쳤어요 (힘 ' + nw + '/' + mx + ')'; bagChanged();
        });
        r.appendChild(bt); list.appendChild(r);
      });
    }
    // 단계·열린 제작법 수
    var st = curStage(), allN = RECIPES.length, openN = RECIPES.filter(recOpen).length;
    var sb = document.createElement('div'); sb.className = 'stagebar';
    sb.innerHTML = '📜 제작법 <b>' + openN + '/' + allN + '</b> 열림 · 지금 <b>' + st.n + '단계 「' + st.name + '」</b>' + (STAGE_NEXT[st.n] ? ' — 다음: ' + STAGE_NEXT[st.n] : ' — 마지막 단계예요') + '<br><small>재료를 처음 얻으면 그 재료로 만드는 법이 열려요. 재료 그림을 누르면 어디서 얻는지 알려 줘요.</small>';
    list.appendChild(sb);
    var locked = [];
    RECIPES.forEach(function (rc) {
      if (rc.cat !== craftCat) return;
      if (!recOpen(rc)) { locked.push(rc); return; }
      var ok = canCraft(rc);
      var r = document.createElement('div'); r.className = 'rec' + (ok ? '' : ' no');
      r.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.ri[data-id]'); if (t) { var gid = +t.getAttribute('data-id'); $('invName').textContent = '「' + B[gid][0] + '」 ' + howGet(gid) + ' (지금 ' + have(gid) + '개)'; sfx('click'); } });
      var h = '<span class="ins">';
      rc.need.forEach(function (n, k) { h += (k ? '<b>+</b>' : '') + '<span class="ri' + (have(n[0]) >= n[1] ? '' : ' lack') + '" data-id="' + n[0] + '" title="' + B[n[0]][0] + ' — 누르면 얻는 곳"><img src="' + ICON[n[0]] + '" alt=""><i>' + n[1] + '</i></span>'; });
      h += '</span><b class="arr">→</b><span class="ri"><img src="' + ICON[rc.out[0]] + '" alt=""><i>' + rc.out[1] + '</i></span>';
      h += '<span class="rname">' + B[rc.out[0]][0] + (rc.ref ? ' <small>' + rc.ref + '</small>' : '') + (rc.furnace ? ' <small class="fz' + (furnaceOK() ? '' : ' lack') + '">🔥용광로</small>' : '') + (rc.fuel ? ' <small class="fz' + (fuelLeft(rc) >= 1 ? '' : ' lack') + '">땔감</small>' : '') + (rc.table ? ' <small class="fz' + (tableOK() ? '' : ' lack') + '">🪚제작대</small>' : '') + '</span>';
      r.innerHTML = h;
      var btn = document.createElement('button'); btn.className = 'mc mk'; btn.textContent = '만들기';
      function craftN(times) {
        if (!canCraft(rc)) {
          sfx('click');
          if (rc.furnace && !furnaceOK()) $('invName').textContent = '녹이려면 용광로가 있어야 해요. 돌 8개로 만들어 가방에 넣거나 내 땅에 놓아요';
          else if (rc.fuel && fuelLeft(rc) < 1) $('invName').textContent = '땔감이 없어요. 석탄·숯·통나무를 모아요';
          else if (rc.table && !tableOK()) $('invName').textContent = '옷은 제작대에서 만들어요. 고페르 나무 4개로 제작대를 만들어 가방에 넣거나 내 땅에 놓아요';
          return;
        }
        var made = 0;
        while (made < times && canCraft(rc)) {
          if (rc.fuel && !burnOne(rc)) break;
          rc.need.forEach(function (n) { take(n[0], n[1]); });
          if (rc.fuel) queueSmelt(rc.out[0], rc.out[1]); else give(rc.out[0], rc.out[1]);
          made++;
          if (rc.out[0] === GOPHER) { stats.crafted++; questCheck(); }
        }
        sfx('craft'); $('invName').textContent = rc.fuel ? '용광로에 넣었어요 — ' + B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개가 하나에 ' + SMELT_SEC + '초씩 녹아요' : B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개를 만들었어요';
        bagChanged();
      }
      btn.addEventListener('click', function () { craftN(1); });
      r.appendChild(btn);
      if (rc.fuel) { var b8 = document.createElement('button'); b8.className = 'mc mk mk8'; b8.textContent = '×8'; b8.title = '8번 한꺼번에'; b8.addEventListener('click', function () { craftN(8); }); r.appendChild(b8); }
      list.appendChild(r);
    });
    // 아직 잠긴 제작법: 단계 순서로, 무엇을 얻으면 열리는지
    locked.sort(function (a, b) { return recStage(a) - recStage(b); }).forEach(function (rc) {
      var miss = recIds(rc).filter(function (id) { return !SEEN[id]; });
      var r = document.createElement('div'); r.className = 'rec lockd';
      r.innerHTML = '<span class="ri"><img src="' + ICON[rc.out[0]] + '" alt=""></span><span class="rname">🔒 <b class="stg">' + recStage(rc) + '단계</b> ??? <small>— ' + miss.map(function (id) { return '「' + B[id][0] + '」'; }).join(', ') + '을(를) 얻으면 열려요</small></span>';
      r.addEventListener('click', function () { $('invName').textContent = miss.map(function (id) { return '「' + B[id][0] + '」 ' + howGet(id); }).join(' / '); sfx('click'); });
      list.appendChild(r);
    });
  }
  function plotHas(id) { var a = myPlot >= 0 && plotData[myPlot]; return !!a && a.indexOf(id) >= 0; }
  function furnaceOK() { return have(FURNACE) > 0 || plotHas(FURNACE) || plotHas(FURNACE_ON); }
  function tableOK() { return have(CRAFT) > 0 || plotHas(CRAFT); }
  // 녹이는 중이면 내 땅의 용광로에 불이 켜진다
  function syncFurnaces() {
    var a = myPlot >= 0 && plotData[myPlot]; if (!a) return;
    var from = JOBS.length ? FURNACE : FURNACE_ON, to = JOBS.length ? FURNACE_ON : FURNACE;
    if (a.indexOf(from) < 0) return;
    var o = plotOrigin(myPlot), A = PLOT * PLOT;
    for (var k = 0; k < a.length; k++) if (a[k] === from) {
      var y = PY0 + Math.floor(k / A), z = o.z + Math.floor(k / PLOT) % PLOT, x = o.x + k % PLOT;
      if (colAt(x, z)) setBlock(x, y, z, to);
    }
  }
  // 궤: 내 땅 안 자리마다 안에 든 것 { "x,y,z(땅 안 좌표)": {번호: 개수} }
  var CHESTS = {}, curChest = null, chestOne = false;
  function chestKey(x, y, z) { var o = plotOrigin(myPlot); return (x - o.x) + ',' + (y - PY0) + ',' + (z - o.z); }
  function chestString() {
    var a = []; for (var k in CHESTS) { var c = CHESTS[k], it = []; for (var id in c) if (c[id] > 0) it.push(id + ':' + c[id]); if (it.length) a.push(k.replace(/,/g, '.') + '=' + it.join(';')); }
    return a.join('/');
  }
  function chestFromString(str) {
    CHESTS = {};
    (str || '').split('/').forEach(function (e) {
      var q = e.split('='); if (q.length !== 2) return; var key = q[0].replace(/\./g, ','), c = {};
      q[1].split(';').forEach(function (p) { var r = p.split(':'), id = +r[0], n = +r[1]; if (INV.indexOf(id) >= 0 && n > 0) c[id] = Math.min(9999, n | 0); });
      CHESTS[key] = c;
    });
  }
  function openChest(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) return deny('다른 사람의 궤예요');
    curChest = chestKey(x, y, z); if (!CHESTS[curChest]) CHESTS[curChest] = {};
    openPanel('chest'); renderChest(); sfx('door');
  }
  function spillChest(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) return;
    var key = chestKey(x, y, z), c = CHESTS[key]; if (!c) return;
    for (var id in c) dropItem(x + 0.5, y + 0.6, z + 0.5, +id, c[id]);
    delete CHESTS[key]; markDirty();
  }
  function renderChest() {
    var c = CHESTS[curChest] || {}, g1 = $('chestGrid'), g2 = $('chestBag'); g1.innerHTML = ''; g2.innerHTML = '';
    $('chestOne').textContent = '한 개씩: ' + (chestOne ? '켬' : '끔');
    Object.keys(c).forEach(function (k) {
      var id = +k; if (!(c[id] > 0)) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, c[id]); d.title = B[id][0];
      d.addEventListener('click', function () { var n = chestOne ? 1 : c[id]; c[id] -= n; if (c[id] <= 0) delete c[id]; give(id, n); $('chestName').textContent = B[id][0] + ' ' + n + '개를 가방으로'; sfx('click'); markDirty(); bagChanged(); renderChest(); });
      g1.appendChild(d);
    });
    if (!g1.children.length) g1.innerHTML = '<span class="empty">비어 있어요 — 아래 가방에서 눌러 넣어요</span>';
    INV.forEach(function (id) {
      if (have(id) < 1) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, have(id)); d.title = B[id][0];
      d.addEventListener('click', function () {
        if (isTool(id)) { $('chestName').textContent = '도구는 가방에 넣고 다녀요'; sfx('click'); return; }
        if (!c[id] && Object.keys(c).length >= 27) { $('chestName').textContent = '궤가 가득 찼어요(27가지)'; return; }
        var n = chestOne ? 1 : have(id); take(id, n); c[id] = (c[id] || 0) + n; CHESTS[curChest] = c;
        $('chestName').textContent = B[id][0] + ' ' + n + '개를 궤에'; sfx('click'); markDirty(); bagChanged(); renderChest();
      });
      g2.appendChild(d);
    });
  }
  function smeltState() {
    var now = Date.now(), j = JOBS[0]; if (!j) return null;
    var el = Math.max(0, now - j.s), per = SMELT_SEC * 1000, done = Math.min(j.n, Math.floor(el / per));
    var left = 0; JOBS.forEach(function (q) { left += q.n - q.g; });
    return { j: j, done: done, frac: now < j.s ? 0 : Math.min(1, (el % per) / per), left: left };
  }
  function updateSmeltUI() {
    var st = smeltState(), sj = $('smeltJobs'), hud = $('smeltHud');
    if (!hud) { hud = document.createElement('div'); hud.id = 'smeltHud'; document.body.appendChild(hud); }
    if (!st) { if (sj) sj.innerHTML = ''; hud.style.display = 'none'; return; }
    var name = B[st.j.o][0], pct = Math.round(st.frac * 100);
    if (sj) sj.innerHTML = '<div class="smrow"><img src="' + ICON[st.j.o] + '" alt=""> 녹이는 중: ' + name + ' ' + st.done + ' / ' + st.j.n + (JOBS.length > 1 ? ' · 뒤에 ' + (JOBS.length - 1) + '가지 더' : '') + '<span class="smbar"><s style="width:' + pct + '%"></s></span></div>';
    hud.innerHTML = '🔥 ' + name + ' <span class="smbar"><s style="width:' + pct + '%"></s></span> ' + st.done + '/' + st.j.n;
    hud.style.display = ui === 'play' ? 'flex' : 'none';
  }
  function smeltTick() {
    var now = Date.now(), changed = false;
    JOBS.forEach(function (j) {
      var done = Math.min(j.n, Math.max(0, Math.floor((now - j.s) / (SMELT_SEC * 1000))));
      if (done > j.g) { give(j.o, done - j.g); for (var k = j.g; k < done && ui === 'play'; k++) pickup(j.o); j.g = done; changed = true; }
    });
    var fin = JOBS.filter(function (j) { return j.g >= j.n; });
    if (fin.length) { JOBS = JOBS.filter(function (j) { return j.g < j.n; }); fin.forEach(function (j) { toast('🔥 ' + B[j.o][0] + ' ' + j.n + '개가 다 녹았어요'); }); sfx('craft'); }
    if (changed) { saveJobs(); bagChanged(); }
    updateSmeltUI(); syncFurnaces();
  }
  setInterval(smeltTick, 250);
  function renderDex() {
    var g = $('dexGrid'); if (!g) return; g.innerHTML = '';
    $('dexCount').textContent = '도감 ' + dexCount() + ' / ' + (CREATURE_KEYS.length + DEX_MATS.length) + (DEX.done ? ' — 다 채웠어요!' : '') + '  ·  동물 다 만나면 +3, 재료 다 모으면 +2 달란트';
    CREATURE_KEYS.forEach(function (k) {
      var c = CREATURE[k], got = DEX['c' + k], d = document.createElement('button');
      d.className = 'dslot' + (got ? '' : ' unk'); d.innerHTML = got ? '<span class="em">' + c.emoji + '</span><small>' + c.name + '</small>' : '<span class="em">?</span><small>동물</small>';
      d.addEventListener('click', function () { if (got) { closePanel(); showCard(k); } else $('invName').textContent = '동물을 눌러 말씀 카드를 보면 도감에 적혀요'; });
      g.appendChild(d);
    });
    DEX_MATS.forEach(function (m) {
      var got = DEX['m' + m], d = document.createElement('button');
      d.className = 'dslot' + (got ? '' : ' unk'); d.innerHTML = got ? '<img src="' + ICON[m] + '" alt=""><small>' + B[m][0] + '</small>' : '<span class="em">?</span><small>재료</small>';
      d.addEventListener('click', function () { $('invName').textContent = got ? B[m][0] + ' — 캐서 모았어요' : '숲·산·호수에서 캐 보면 도감에 적혀요'; });
      g.appendChild(d);
    });
  }
  function updateMenuLabels() {
    $('mView').textContent = '시점: ' + VIEW_NAMES[S.view];
    $('mSound').textContent = '소리: ' + (S.sound ? '켬' : '끔');
    $('mAim').textContent = '겨누기: ' + (S.aim === 'cross' ? '가운데 십자선' : '손가락 자리');
    $('mSensLabel').textContent = '둘러보기 속도: ' + Math.round(S.sens * 100) + '%';
    $('mSens').value = Math.round(S.sens * 100);
    document.body.classList.toggle('aimcross', S.aim === 'cross');
  }
  function bindUI() {
    function on(id, fn) { $(id).addEventListener('click', function (e) { e.stopPropagation(); fn(); }); }
    on('tStart', startGame);
    on('tBook', function () { openPanel('book'); sfx('click'); });
    on('tHelp', function () { openPanel('help'); sfx('click'); });
    on('btnPause', function () { openPanel('pause'); sfx('click'); });
    on('btnView', cycleView);
    on('btnBag', function () { openPanel('inv'); sfx('click'); });
    on('btnChat', openChat);
    on('chatSend', sendChat);
    on('chatDone', function () { $('chatInput').blur(); closePanel(); });
    $('chatInput').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendChat(); } });
    on('mResume', resume);
    on('mBook', function () { openPanel('book'); sfx('click'); });
    on('mHelp', function () { openPanel('help'); sfx('click'); });
    on('mArk', function () { travel('ark'); });
    on('mHome', function () { resume(); goHome(); });
    on('mForest', function () { travel('forest'); });
    on('mHill', function () { travel('hill'); });
    on('mLake', function () { travel('lake'); });
    on('mView', function () { S.view = (S.view + 1) % 3; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mSound', function () { S.sound = !S.sound; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mAim', function () { S.aim = S.aim === 'cross' ? 'finger' : 'cross'; saveSettings(); updateMenuLabels(); sfx('click'); });
    $('mSens').addEventListener('input', function () { S.sens = +this.value / 100; saveSettings(); updateMenuLabels(); });
    on('bookDone', function () { closePanel(); });
    on('helpDone', function () { closePanel(); });
    on('invDone', function () { closePanel(); });
    on('chestDone', function () { closePanel(); });
    on('chestOne', function () { chestOne = !chestOne; renderChest(); sfx('click'); });
    on('tabBag', function () { invTab = 'bag'; renderInv(); sfx('click'); });
    on('tabCraft', function () { invTab = 'craft'; renderInv(); sfx('click'); });
    on('tabDex', function () { invTab = 'dex'; renderInv(); sfx('click'); });
    ['block', 'shape', 'tool', 'smelt', 'wear'].forEach(function (c) { on('cc_' + c, function () { craftCat = c; renderInv(); sfx('click'); }); });
    on('tLook', function () { openLooks(); });
    on('btnLook', function () { openLooks(); });
    on('tipsDone', function () { try { localStorage.setItem('arkVillage.tips', '1'); } catch (e) {} resume(); });
    var br = $('btnRun');
    br.addEventListener('touchstart', function (e) { setRun(!runLock, 'btn'); e.preventDefault(); }, { passive: false });
    br.addEventListener('click', function () { setRun(!runLock, 'btn'); });
    on('mLook', function () { openLooks(); });
    on('looksDone', function () { closePanel(); });
    on('cardClose', function () { $('card').classList.remove('show'); });
    on('mapc', function () { openPanel('map'); drawMap($('bigmapc'), true); sfx('click'); });
    on('mapDone', function () { closePanel(); });
    on('mMap', function () { openPanel('map'); drawMap($('bigmapc'), true); sfx('click'); });
    ['ark', 'forest', 'hill', 'lake'].forEach(function (w) { on('go_' + w, function () { travel(w); }); });
    on('go_home', function () { resume(); goHome(); });
    ['sea', 'desert', 'ararat'].forEach(function (w) { var b = $('go_' + w); if (b) on('go_' + w, function () { travel(w); }); });
    var bj = $('btnJump'), bd = $('btnDown');
    bj.addEventListener('touchstart', function (e) { jumpPress(); e.preventDefault(); }, { passive: false });
    bj.addEventListener('touchend', function (e) { jumpHeld = false; e.preventDefault(); });
    bj.addEventListener('touchcancel', function () { jumpHeld = false; });
    bd.addEventListener('touchstart', function (e) { flyDown = true; e.preventDefault(); }, { passive: false });
    bd.addEventListener('touchend', function (e) { flyDown = false; e.preventDefault(); });
    bd.addEventListener('touchcancel', function () { flyDown = false; });
    $('btnFly').addEventListener('touchstart', function (e) { toggleFly(); e.preventDefault(); }, { passive: false });
    $('btnFly').addEventListener('click', toggleFly);
    $('btnRide').addEventListener('touchstart', function (e) { dismount(); e.preventDefault(); }, { passive: false });
    $('btnRide').addEventListener('click', function () { dismount(); });
    updateMenuLabels();
  }

  // ───────── 동물·새·물고기 ─────────
  // 네발짐승: 몸통(상자 여러 개) + 다리 4개. 앞쪽은 -z.
  var BEASTS = {
    sheep: { name: '양', n: 26, speed: 1.6, leg: [0.34, 1.0, 0x3b3530], lx: 0.45, lz: 0.72, parts: [
      [1.5, 1.3, 2.2, 0xeeeae0, 0, 1.65, 0], [0.75, 0.75, 0.8, 0x3b3530, 0, 2.05, -1.3], [0.95, 0.35, 0.7, 0xeeeae0, 0, 2.5, -1.15], [0.6, 0.6, 0.35, 0xeeeae0, 0, 1.75, 1.15]] },
    goat: { name: '염소', n: 16, speed: 2.2, leg: [0.27, 1.2, 0x5a4430], lx: 0.33, lz: 0.68, parts: [
      [1.0, 1.05, 1.9, 0x8a6a4a, 0, 1.72, 0], [0.62, 0.68, 0.8, 0x7a5c40, 0, 2.35, -1.1], [0.12, 0.5, 0.12, 0x3a3026, -0.2, 2.9, -0.95], [0.12, 0.5, 0.12, 0x3a3026, 0.2, 2.9, -0.95],
      [0.2, 0.4, 0.15, 0xeee6d6, 0, 1.9, -1.45], [0.2, 0.3, 0.35, 0x8a6a4a, 0, 2.2, 1.0]] },
    cow: { name: '소', n: 10, speed: 1.2, leg: [0.42, 1.3, 0xece8df], lx: 0.55, lz: 1.0, parts: [
      [1.6, 1.5, 2.9, 0xf2efe8, 0, 2.05, 0], [1.62, 0.8, 0.9, 0x5a3a26, 0, 2.3, 0.45], [1.62, 0.6, 0.7, 0x5a3a26, 0, 1.85, -0.75],
      [1.0, 1.0, 0.9, 0xf2efe8, 0, 2.55, -1.75], [0.8, 0.4, 0.22, 0xe6a8a0, 0, 2.25, -2.25], [0.15, 0.35, 0.15, 0xddd5c0, -0.42, 3.15, -1.65], [0.15, 0.35, 0.15, 0xddd5c0, 0.42, 3.15, -1.65]] },
    camel: { name: '낙타', n: 6, speed: 1.4, leg: [0.32, 2.2, 0xbf9a60], lx: 0.45, lz: 0.9, parts: [
      [1.4, 1.3, 2.6, 0xc9a46a, 0, 2.85, 0], [1.0, 0.8, 1.0, 0xbf9a60, 0, 3.85, 0.15], [0.5, 1.5, 0.5, 0xc9a46a, 0, 3.6, -1.35], [0.6, 0.6, 1.1, 0xc9a46a, 0, 4.35, -1.7], [0.2, 0.2, 0.2, 0x2b1d14, 0, 4.35, -2.25]] },
    // 말: 긴 다리·목·갈기(욥 39:19), 나귀: 작은 몸·긴 귀(슥 9:9). seat = 안장 높이, ride = 탈 때 빠르기, jump = 탈 때 뛰는 힘
    horse: { name: '말', n: 8, speed: 2.4, seat: 3.35, ride: 17, jump: 18.5, leg: [0.3, 2.0, 0x4a2e1a], lx: 0.42, lz: 1.0, parts: [
      [1.2, 1.2, 2.8, 0x8a5a34, 0, 2.6, 0], [0.7, 1.4, 0.8, 0x8a5a34, 0, 3.45, -1.35], [0.62, 0.62, 1.3, 0x8a5a34, 0, 4.1, -1.95], [0.5, 0.4, 0.32, 0x3a2414, 0, 3.95, -2.62],
      [0.14, 0.34, 0.14, 0x6a4428, -0.2, 4.55, -1.6], [0.14, 0.34, 0.14, 0x6a4428, 0.2, 4.55, -1.6], [0.2, 1.7, 0.5, 0x24160c, 0, 3.8, -1.1],
      [0.08, 0.12, 0.12, 0x111111, -0.32, 4.2, -2.1], [0.08, 0.12, 0.12, 0x111111, 0.32, 4.2, -2.1], [0.3, 1.3, 0.3, 0x24160c, 0, 2.45, 1.5], [1.22, 0.3, 0.3, 0xf0e8dc, 0, 1.55, -1.0]] },
    donkey: { name: '나귀', n: 8, speed: 1.8, seat: 2.65, ride: 12, jump: 15.5, leg: [0.25, 1.5, 0x6a6662], lx: 0.36, lz: 0.8, parts: [
      [1.0, 1.0, 2.2, 0x8e8a86, 0, 2.0, 0], [0.55, 1.0, 0.65, 0x8e8a86, 0, 2.7, -1.05], [0.56, 0.56, 1.1, 0x8e8a86, 0, 3.15, -1.5], [0.46, 0.42, 0.3, 0xe2ded6, 0, 3.0, -2.06],
      [0.15, 0.75, 0.15, 0x7a7672, -0.18, 3.75, -1.3], [0.15, 0.75, 0.15, 0x7a7672, 0.18, 3.75, -1.3], [0.08, 0.1, 0.1, 0x111111, -0.29, 3.25, -1.7], [0.08, 0.1, 0.1, 0x111111, 0.29, 3.25, -1.7],
      [0.14, 0.9, 0.3, 0x3e3a38, 0, 3.0, -0.95], [0.14, 1.0, 0.14, 0x3e3a38, 0, 1.85, 1.15], [1.02, 0.05, 0.3, 0x3e3a38, 0, 2.51, -0.3], [0.3, 0.05, 2.2, 0x3e3a38, 0, 2.51, 0], [1.0, 0.25, 1.6, 0xd8d2c8, 0, 1.5, 0]] },
    rabbit: { name: '토끼', n: 16, speed: 3.2, hop: true, leg: [0.16, 0.3, 0xa89074], lx: 0.2, lz: 0.3, parts: [
      [0.6, 0.55, 0.9, 0xb8a088, 0, 0.58, 0], [0.5, 0.5, 0.5, 0xb8a088, 0, 0.98, -0.5], [0.12, 0.55, 0.12, 0xb8a088, -0.12, 1.45, -0.45], [0.12, 0.55, 0.12, 0xb8a088, 0.12, 1.45, -0.45], [0.25, 0.25, 0.2, 0xffffff, 0, 0.68, 0.5]] }
  };
  var animals = [], birds = [], fishes = [], aniGeo = {};
  function groundAt(x, z, fromY) {
    var ix = Math.floor(x), iz = Math.floor(z);
    if (ix < 1 || iz < 1 || ix >= SX - 1 || iz >= SZ - 1) return null;
    // 나뭇잎·통나무는 땅으로 치지 않는다(동물이 나무 꼭대기에 서는 문제) — 통나무 자리는 막힌 곳
    for (var y = Math.floor(fromY) + 2; y >= 1; y--) {
      var id = get(ix, y, iz); if (id === WATER) return null;
      if (id === LEAF || id === LOG) continue;
      if (isSolid(id)) { var up = get(ix, y + 1, iz); return up === LOG ? null : y + 1; }
    }
    return null;
  }
  function makeBeast(kindName, x, z) {
    var sp = BEASTS[kindName];
    if (!aniGeo[kindName]) aniGeo[kindName] = { body: mergedBoxes(sp.parts), leg: boxGeo(sp.leg[0], sp.leg[1], sp.leg[0], sp.leg[2]) };
    var root = new THREE.Group(), body = new THREE.Mesh(aniGeo[kindName].body, avatarMat), legs = [];
    root.add(body);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
      var p = new THREE.Group(); p.position.set(s[0] * sp.lx, sp.leg[1], s[1] * sp.lz);
      var m = new THREE.Mesh(aniGeo[kindName].leg, avatarMat); m.position.y = -sp.leg[1] / 2; p.add(m); root.add(p); legs.push(p);
    });
    var y = groundAt(x, z, SY - 3) || G;
    root.position.set(x, y, z); scene.add(root);
    return { sp: sp, kind: kindName, mesh: root, body: body, legs: legs, x: x, y: y, ty: y, z: z, h: Math.random() * 6.28, mode: 'idle', t: Math.random() * 3, walk: 0 };
  }
  function stepBeast(a, dt) {
    if (a === riding) return;
    a.t -= dt;
    if (a.saddled && a.mode === 'walk') a.mode = 'idle';
    if (a.t <= 0) {
      if (a.mode === 'walk') { a.mode = 'idle'; a.t = 1.5 + Math.random() * 4; }
      else if (!a.saddled) { a.mode = 'walk'; a.t = 2 + Math.random() * 4; a.h += (Math.random() - 0.5) * 2.6; }
      else a.t = 3;
    }
    var moving = false;
    if (a.mode === 'walk') {
      var s = a.sp.speed * dt, nx = a.x - Math.sin(a.h) * s, nz = a.z - Math.cos(a.h) * s, gy = groundAt(nx, nz, a.y);
      if (gy === null || Math.abs(gy - a.y) > 1.2 || plotAt(nx | 0, nz | 0) >= 0 || inArk(nx | 0, gy | 0, nz | 0) || Math.hypot(nx - P.x, nz - P.z) < 1.4) {
        a.h += Math.PI * (0.5 + Math.random()); a.mode = 'idle'; a.t = 0.4;
      } else { a.x = nx; a.z = nz; a.ty = gy; a.walk += s * 2.4; moving = true; }
    }
    a.y += (a.ty - a.y) * Math.min(1, 10 * dt);
    var hop = a.sp.hop && moving ? Math.abs(Math.sin(a.walk * 1.2)) * 0.5 : 0;
    a.mesh.position.set(a.x, a.y + hop, a.z);
    var dh = a.h - a.mesh.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    a.mesh.rotation.y += dh * Math.min(1, 6 * dt);
    var sw = moving && !a.sp.hop ? Math.sin(a.walk * 2) * 0.6 : 0;
    a.legs[0].rotation.x = sw; a.legs[3].rotation.x = sw; a.legs[1].rotation.x = -sw; a.legs[2].rotation.x = -sw;
    // 서 있을 때 가끔 고개 숙여 풀 뜯기
    a.body.rotation.x = a.mode === 'idle' && a.t > 1 && !a.sp.hop ? Math.min(0.12, (a.t - 1) * 0.1) : 0;
  }
  // 새: 비둘기(흰색)·까마귀(검정) — 창 8:7-12
  function spawnBirds() {
    var types = [{ name: '비둘기', col: 0xf4f4f0, n: 12 }, { name: '까마귀', col: 0x26262c, n: 5 }];
    types.forEach(function (t, ti) {
      var bodyG = mergedBoxes([[0.45, 0.4, 0.9, t.col, 0, 0, 0], [0.34, 0.34, 0.34, t.col, 0, 0.15, -0.58], [0.12, 0.1, 0.22, ti ? 0x111111 : 0xd99a5a, 0, 0.1, -0.84], [0.35, 0.08, 0.4, t.col, 0, 0.05, 0.6]]);
      var wingG = boxGeo(0.9, 0.06, 0.5, ti ? 0x1c1c22 : 0xe8e8e2); wingG.translate(0.45, 0, 0);
      for (var i = 0; i < t.n; i++) {
        var root = new THREE.Group(), body = new THREE.Mesh(bodyG, avatarMat), wl = new THREE.Mesh(wingG, avatarMat), wr = new THREE.Mesh(wingG, avatarMat);
        wl.position.x = 0.2; wr.position.x = -0.2; wr.scale.x = -1;
        root.add(body); root.add(wl); root.add(wr); scene.add(root);
        var k = ti * 50 + i;
        birds.push({ kind: ti ? 'raven' : 'dove', mesh: root, wl: wl, wr: wr, cx: 30 + rnd(k * 3.1) * (SX - 60), cz: 30 + rnd(k * 4.7) * (SZ - 60), r: 12 + rnd(k * 5.9) * 30,
          alt: G + 22 + rnd(k * 6.1) * 22, ang: rnd(k) * 6.28, spd: (0.25 + rnd(k * 2.2) * 0.25) * (rnd(k * 8.8) < 0.5 ? -1 : 1), flap: rnd(k * 9.9) * 6 });
      }
    });
  }
  function stepBird(b, dt, t) {
    var cp = camera.position;
    if (Math.abs(b.cx - cp.x) > 220 || Math.abs(b.cz - cp.z) > 220) { b.cx = cp.x + (Math.random() - 0.5) * 300; b.cz = cp.z + (Math.random() - 0.5) * 300; b.alt = Math.max(G + 22, surfaceY(b.cx | 0, b.cz | 0) + 14) + Math.random() * 12; }
    b.ang += b.spd * dt;
    var x = b.cx + Math.cos(b.ang) * b.r, z = b.cz + Math.sin(b.ang) * b.r, y = b.alt + Math.sin(b.ang * 2) * 2;
    var dx = -Math.sin(b.ang) * b.spd, dz = Math.cos(b.ang) * b.spd;
    b.mesh.position.set(x, y, z); b.mesh.rotation.y = Math.atan2(-dx, -dz);
    var f = Math.sin(t * 9 + b.flap) * 0.7; b.wl.rotation.z = f; b.wr.rotation.z = -f;
  }
  function stepFish(f, dt, t) {
    f.t -= dt;
    if (f.t <= 0) { f.h += (Math.random() - 0.5) * 2; f.t = 1 + Math.random() * 3; }
    var nx = f.x - Math.sin(f.h) * f.spd * dt, nz = f.z - Math.cos(f.h) * f.spd * dt;
    if (get(Math.floor(nx), Math.floor(f.y), Math.floor(nz)) === WATER) { f.x = nx; f.z = nz; } else { f.h += Math.PI * (0.6 + Math.random() * 0.8); }
    f.mesh.position.set(f.x, f.y + Math.sin(t * 2 + f.spd * 5) * 0.08, f.z);
    f.mesh.rotation.y = f.h + Math.sin(t * 10 + f.spd * 7) * 0.18;
  }
  function stepCreatures(dt, t) {
    spawnSavedHorses();
    var cx = camera.position.x, cz = camera.position.z, far = 150 * 150;
    for (var i = 0; i < animals.length; i++) {
      var a = animals[i], d2 = (a.x - cx) * (a.x - cx) + (a.z - cz) * (a.z - cz);
      a.mesh.visible = d2 < far; if (a.mesh.visible) stepBeast(a, dt);
    }
    for (i = 0; i < birds.length; i++) stepBird(birds[i], dt, t);
    for (i = 0; i < fishes.length; i++) {
      var f = fishes[i], fd = (f.x - cx) * (f.x - cx) + (f.z - cz) * (f.z - cz);
      f.mesh.visible = fd < 90 * 90; if (f.mesh.visible) stepFish(f, dt, t);
    }
  }

  // ───────── 말씀 카드(동물을 누르면) · 도감 · 처음 안내 ─────────
  // 구절은 개역개정 원문(대한성서공회)으로 확인함(2026-11-18)
  var CREATURE = {
    sheep: { emoji: '🐑', name: '양', ref: '시편 23:1', text: '여호와는 나의 목자시니 내게 부족함이 없으리로다' },
    goat: { emoji: '🐐', name: '염소', ref: '창세기 6:19', text: '혈육 있는 모든 생물을 너는 각기 암수 한 쌍씩 방주로 이끌어들여 너와 함께 생명을 보존하게 하되' },
    cow: { emoji: '🐄', name: '소', ref: '창세기 1:25', text: '하나님이 땅의 짐승을 그 종류대로, 가축을 그 종류대로, 땅에 기는 모든 것을 그 종류대로 만드시니 하나님이 보시기에 좋았더라' },
    camel: { emoji: '🐪', name: '낙타', ref: '마태복음 19:24', text: '다시 너희에게 말하노니 낙타가 바늘귀로 들어가는 것이 부자가 하나님의 나라에 들어가는 것보다 쉬우니라 하시니' },
    rabbit: { emoji: '🐇', name: '토끼', ref: '창세기 6:20', text: '새가 그 종류대로, 가축이 그 종류대로, 땅에 기는 모든 것이 그 종류대로 각기 둘씩 네게로 나아오리니 그 생명을 보존하게 하라' },
    dove: { emoji: '🕊️', name: '비둘기', ref: '창세기 8:11', text: '저녁때에 비둘기가 그에게로 돌아왔는데 그 입에 감람나무 새 잎사귀가 있는지라 이에 노아가 땅에 물이 줄어든 줄을 알았으며' },
    raven: { emoji: '🐦', name: '까마귀', ref: '창세기 8:7', text: '까마귀를 내놓으매 까마귀가 물이 땅에서 마르기까지 날아 왕래하였더라' },
    horse: { emoji: '🐎', name: '말', ref: '욥기 39:19', text: '말의 힘을 네가 주었느냐 그 목에 흩날리는 갈기를 네가 입혔느냐' },
    donkey: { emoji: '🐴', name: '나귀', ref: '스가랴 9:9', text: '시온의 딸아 크게 기뻐할지어다 예루살렘의 딸아 즐거이 부를지어다 보라 네 왕이 네게 임하시나니 그는 공의로우시며 구원을 베푸시며 겸손하여서 나귀를 타시나니 나귀의 작은 것 곧 나귀 새끼니라' },
    fish: { emoji: '🐟', name: '물고기', ref: '창세기 1:21', text: '하나님이 큰 바다 짐승들과 물에서 번성하여 움직이는 모든 생물을 그 종류대로, 날개 있는 모든 새를 그 종류대로 창조하시니 하나님이 보시기에 좋았더라' }
  };
  var CREATURE_KEYS = ['sheep', 'goat', 'cow', 'camel', 'horse', 'donkey', 'rabbit', 'dove', 'raven', 'fish'];
  var REWARD_ANIMALS = ['sheep', 'goat', 'cow', 'camel', 'rabbit', 'dove', 'raven', 'fish'];   // 달란트 기준(서버 claim_ark_dex와 같은 8가지)
  var DEX_MATS = [LOG, LEAF, STONE, LIME, BASALT, SAND, DIRT, CLAY, TAR, REED, FLOWER];
  var DEX = {};
  try { DEX = JSON.parse(localStorage.getItem('arkVillage.dex') || '{}') || {}; } catch (e) { DEX = {}; }
  function dexString() { return Object.keys(DEX).filter(function (k) { return DEX[k] && k !== 'done'; }).join(','); }
  function dexFromString(str) { (str || '').split(',').forEach(function (k) { if (/^(c[a-z]+|m\d+)$/.test(k)) DEX[k] = 1; }); }
  function dexCount() { var n = 0; CREATURE_KEYS.forEach(function (k) { if (DEX['c' + k]) n++; }); DEX_MATS.forEach(function (m) { if (DEX['m' + m]) n++; }); return n; }
  function saveDex() {
    if (dexCount() === CREATURE_KEYS.length + DEX_MATS.length && !DEX.done) { DEX.done = 1; toast('📖 도감을 다 채웠어요! 하나님이 지으신 모든 것을 만났어요'); }
    try { localStorage.setItem('arkVillage.dex', JSON.stringify(DEX)); } catch (e) {}
    if (me && myPlot >= 0) markDirty();
    if (ui === 'inv') renderInv();
    tryClaimDex();
  }
  // 도감 달란트: 동물 8가지 다 +3, 재료 11가지 다 +2 (계정마다 한 번, 서버가 내 땅 기록의 도감을 확인하고 줌)
  var dexClaimed = {};
  try { dexClaimed = JSON.parse(localStorage.getItem('arkVillage.dexClaim') || '{}') || {}; } catch (e) { dexClaimed = {}; }
  function partDone(part) { return part === 'animals' ? REWARD_ANIMALS.every(function (k) { return DEX['c' + k]; }) : DEX_MATS.every(function (m) { return DEX['m' + m]; }); }
  function tryClaimDex() {
    ['animals', 'mats'].forEach(function (part) {
      if (!partDone(part) || dexClaimed[part] || dexClaimed['busy_' + part]) return;
      if (!client || !me || myPlot < 0) { if (!dexClaimed['hint_' + part]) { dexClaimed['hint_' + part] = 1; toast('📖 도감 ' + (part === 'animals' ? '동물' : '재료') + '을 다 채웠어요! 로그인하면 달란트를 받아요'); } return; }
      dexClaimed['busy_' + part] = 1;
      savePlotNow().then(function () { return client.rpc('claim_ark_dex', { p_part: part }); }).then(function (r) {
        dexClaimed['busy_' + part] = 0;
        if (!r || r.error) return;
        if (r.data > 0) { toast('💰 도감 ' + (part === 'animals' ? '동물 8가지' : '재료 11가지') + '를 다 채워 ' + r.data + '달란트를 받았어요!'); sfx('craft'); }
        if (r.data >= 0) { dexClaimed[part] = 1; try { localStorage.setItem('arkVillage.dexClaim', JSON.stringify({ animals: dexClaimed.animals, mats: dexClaimed.mats })); } catch (e) {} }
      }).catch(function () { dexClaimed['busy_' + part] = 0; });
    });
  }
  var cardT = null;
  function showCard(kindC) {
    var c = CREATURE[kindC]; if (!c) return;
    $('cardEmoji').textContent = c.emoji; $('cardName').textContent = c.name;
    $('cardText').textContent = c.text; $('cardRef').textContent = c.ref;
    var first = !DEX['c' + kindC];
    $('cardNew').textContent = first ? '📖 도감에 새로 적었어요' : '';
    $('card').classList.add('show'); sfx('pop'); animalCall(kindC);
    clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 9000);
    if (first) { DEX['c' + kindC] = 1; saveDex(); }
    stats.tapped++; questCheck();
  }
  // 화면의 한 점에서 나가는 광선에 맞는 동물(블록보다 가까울 때만)
  var CR_R = { sheep: 1.3, goat: 1.2, cow: 1.7, camel: 2.3, rabbit: 0.8, dove: 1.1, raven: 1.1, fish: 0.8, horse: 2.1, donkey: 1.7 };
  function pickCreature(dir, blockT) {
    var o = camera.position, best = null, bt = blockT === undefined ? 1e9 : blockT;
    function test(kindC, cx, cy, cz, maxT, obj) {
      var r = CR_R[kindC], ox = cx - o.x, oy = cy - o.y, oz = cz - o.z, tca = ox * dir.x + oy * dir.y + oz * dir.z;
      if (tca < 0) return;
      var d2 = ox * ox + oy * oy + oz * oz - tca * tca; if (d2 > r * r) return;
      var t = tca - Math.sqrt(r * r - d2);
      if (t < bt && t < maxT && (!best || t < best.t)) best = { kind: kindC, t: t, a: obj };
    }
    var reach = REACH + camDist + 8;
    animals.forEach(function (a) { if (a.mesh.visible && a !== riding) test(a.kind, a.x, a.y + CR_R[a.kind] * 0.9, a.z, reach, a); });
    birds.forEach(function (b) { test(b.kind, b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 60); });
    fishes.forEach(function (f) { if (f.mesh.visible) test('fish', f.x, f.y, f.z, reach); });
    return best;
  }
  function screenDir(sx, sy) {
    camera.updateMatrixWorld();
    if (sx === undefined || S.aim === 'cross') { camera.getWorldDirection(tmpV); return tmpV.clone(); }
    return new THREE.Vector3(sx / window.innerWidth * 2 - 1, -(sy / window.innerHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
  }
  // 톡/오른쪽 클릭: 동물이 먼저, 아니면 블록 놓기(문이면 열고 닫기)
  function tapAt(sx, sy) {
    var dir = screenDir(sx, sy), h = pickDir(dir), c = pickCreature(dir, h ? h.t : undefined);
    if (c && riding && c.a && c.a.sp.seat) c = null;
    if (c && c.a && harvestAnimal(c.a)) return;
    if (c) return c.a && c.a.sp.seat ? tapRideable(c.a) : showCard(c.kind);
    if (h) act('place', h);
    else if (WEARINFO[HOTBAR[sel]]) wearItem(HOTBAR[sel]);
  }
  // 칼을 들고 양을 누르면 양털, 소·염소·낙타를 누르면 가죽(한 마리에 3분에 한 번)
  function harvestAnimal(a) {
    var held = HOTBAR[sel];
    if (!(isTool(held) && have(held) > 0 && TOOL_TYPES[typeOf(held)] === 'knife')) return false;
    var what = a.kind === 'sheep' ? WOOL : (a.kind === 'cow' || a.kind === 'goat' || a.kind === 'camel' ? LEATHER : 0);
    if (!what) return false;
    var now = Date.now();
    if (a.cutAt && now - a.cutAt < 180000) { deny(a.kind === 'sheep' ? '털을 깎은 지 얼마 안 됐어요. 조금 뒤에 다시 와요' : '조금 뒤에 다시 와요'); return true; }
    a.cutAt = now;
    var n = what === WOOL ? 2 : 1;
    dropItem(a.x, a.y + 1.6, a.z, what, n); wearTool(held); bagChanged(); animalCall(a.kind); sfx('dig', 1500); swingT = 0.25;
    toast(what === WOOL ? '양털 ' + n + '개를 깎았어요 — 제작대에서 옷을 지어요' : '가죽을 얻었어요 — 제작대에서 가죽옷을 지어요 (창 3:21)');
    return true;
  }

  // ───────── 말·나귀 타기: 안장을 손에 들고 누르면 얹고, 안장 얹은 것을 누르면 탄다(창 22:3) ─────────
  var riding = null, curHT = HT, saddleGeo = {}, HORSES = [], horseSaveT = 0;
  try { HORSES = (JSON.parse(localStorage.getItem('arkVillage.horses') || '[]') || []).filter(function (o) { return o && BEASTS[o.k]; }).slice(0, 6); } catch (e) { HORSES = []; }
  var pendingHorses = HORSES.slice();
  function saveHorses() {
    var a = animals.filter(function (x) { return x.saddled; }).slice(-6).map(function (x) { return { k: x.kind, x: Math.round(x.x * 10) / 10, z: Math.round(x.z * 10) / 10, h: Math.round(x.h * 100) / 100 }; });
    pendingHorses.forEach(function (o) { if (a.length < 6) a.push(o); });
    try { localStorage.setItem('arkVillage.horses', JSON.stringify(a)); } catch (e) {}
  }
  function putSaddle(a) {
    var sp = a.sp, top = sp.seat - 0.1;
    if (!saddleGeo[a.kind]) saddleGeo[a.kind] = mergedBoxes([[1.0, 0.22, 1.05, 0x7a3e1c, 0, top, -0.1], [sp.parts[0][0] + 0.06, 0.95, 0.16, 0x4a2a12, 0, top - 0.5, -0.1],
      [0.5, 0.3, 0.16, 0x7a3e1c, 0, top + 0.2, -0.6], [0.6, 0.22, 0.16, 0x7a3e1c, 0, top + 0.12, 0.42], [0.12, 0.12, 0.3, 0xc8c8c8, -(sp.parts[0][0] / 2 + 0.06), top - 1.0, -0.1], [0.12, 0.12, 0.3, 0xc8c8c8, sp.parts[0][0] / 2 + 0.06, top - 1.0, -0.1]]);
    var m = new THREE.Mesh(saddleGeo[a.kind], avatarMat); a.mesh.add(m); a.saddle = m; a.saddled = true;
  }
  function jo(n, a, b) { var c = n.charCodeAt(n.length - 1) - 0xAC00; return n + (c >= 0 && c % 28 ? a : b); }   // 받침에 맞는 조사
  function tapRideable(a) {
    if (riding) return;
    var nm = a.sp.name;
    if (!a.saddled) {
      if (HOTBAR[sel] === SADDLE && have(SADDLE) > 0) {
        take(SADDLE, 1); putSaddle(a); bagChanged(); saveHorses(); sfx('craft'); animalCall(a.kind);
        if (!DEX['c' + a.kind]) { DEX['c' + a.kind] = 1; saveDex(); }
        toast('안장을 얹었어요! ' + jo(nm, '을', '를') + ' 한 번 더 누르면 타요 (창 22:3)');
        return;
      }
      showCard(a.kind);
      setTimeout(function () { if (!a.saddled && !riding) toast('안장(만들기 ⛏)을 손에 들고 ' + jo(nm, '을', '를') + ' 누르면 탈 수 있어요'); }, 1200);
      return;
    }
    mount(a);
  }
  function mount(a) {
    if (P.fly) toggleFly();
    riding = a; a.mode = 'ride';
    curHT = a.sp.seat + 2.1;
    P.x = a.x; P.z = a.z; P.y = a.y; P.vx = P.vz = P.vy = 0;
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    P.yaw = a.mesh.rotation.y;
    document.body.classList.add('riding'); animalCall(a.kind); stats.tapped++; questCheck();
    toast((a.kind === 'horse' ? '🐎 말을' : '🐴 나귀를') + ' 탔어요 — 내릴 때는 「내리기」' + (isTouch ? '' : ' (Shift)'));
  }
  function dismount(quiet) {
    if (!riding) return;
    var a = riding; riding = null; curHT = HT; a.mode = 'idle'; a.t = 2;
    a.x = P.x; a.z = P.z; a.y = a.ty = P.y; a.h = P.yaw;
    document.body.classList.remove('riding');
    // 옆으로 내린다
    var side = [[1.9, 0], [-1.9, 0], [0, 1.9], [0, -1.9]], c = Math.cos(P.yaw), s2 = Math.sin(P.yaw);
    for (var i = 0; i < side.length; i++) {
      var ox = side[i][0] * c + side[i][1] * s2, oz = -side[i][0] * s2 + side[i][1] * c;
      if (!collides(P.x + ox, P.y, P.z + oz)) { P.x += ox; P.z += oz; break; }
    }
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    saveHorses();
    if (!quiet) toast('내렸어요. ' + jo(a.sp.name, '은', '는') + ' 여기서 기다려요');
  }
  // 탄 동안 짐승이 나를 따라 움직임
  function stepRide(dt, moved) {
    var a = riding; if (!a) return;
    if (P.swim) { dismount(true); toast('물에서는 내려서 헤엄쳐요'); return; }
    a.x = P.x; a.z = P.z; a.y = a.ty = P.y; a.h = P.yaw;
    a.mesh.position.set(P.x, P.y, P.z); a.mesh.rotation.y = P.yaw;
    a.walk += moved * 1.1;
    var sw = moved > 0.01 ? Math.sin(a.walk * 2) * 0.75 : 0;
    a.legs[0].rotation.x = sw; a.legs[3].rotation.x = sw; a.legs[1].rotation.x = -sw; a.legs[2].rotation.x = -sw;
    a.body.rotation.x = 0;
    horseSaveT -= dt; if (horseSaveT <= 0) { horseSaveT = 3; saveHorses(); }
  }
  // 저장해 둔 안장 얹은 짐승은 그 자리 땅이 만들어지면 다시 나타남
  function spawnSavedHorses() {
    if (!pendingHorses.length) return;
    pendingHorses = pendingHorses.filter(function (o) {
      if (!colAt(o.x | 0, o.z | 0) || groundAt(o.x, o.z, SY - 3) === null) return true;
      var a = makeBeast(o.k, o.x, o.z); a.h = o.h || 0; a.mesh.rotation.y = a.h; putSaddle(a); animals.push(a); return false;
    });
  }

  // 처음 온 사람 안내(한 번 다 하면 다시 안 나옴)
  var stats = { log: 0, crafted: 0, placed: 0, tapped: 0 }, qStep = 0;
  try { var qs = JSON.parse(localStorage.getItem('arkVillage.quest') || 'null'); if (qs) { stats = qs.stats || stats; qStep = qs.step || 0; } } catch (e) {}
  var QUEST = [
    { text: '🌲 동쪽 숲에서 통나무 5개 캐기', prog: function () { return Math.min(5, stats.log) + '/5'; }, done: function () { return stats.log >= 5; }, btn: ['숲으로', function () { travel('forest'); }] },
    { text: '🔨 가방 → 만들기에서 고페르 나무 만들기', done: function () { return stats.crafted > 0; }, btn: ['가방 열기', function () { invTab = 'craft'; openPanel('inv'); }] },
    { text: '🐑 동물을 눌러 말씀 카드 보기', done: function () { return stats.tapped > 0; } },
    { text: '🏠 내 땅에 블록 놓기', done: function () { return stats.placed > 0; }, btn: ['내 땅으로', function () { goHome(); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' }
  ];
  function questSave() { try { localStorage.setItem('arkVillage.quest', JSON.stringify({ stats: stats, step: qStep })); } catch (e) {} }
  function questCheck() {
    var moved = false;
    while (qStep < QUEST.length && QUEST[qStep].done()) { qStep++; moved = true; }
    if (moved) { sfx('craft'); if (qStep >= QUEST.length) toast('🎉 처음 할 일을 모두 해냈어요! 이제 마음껏 지어 보세요'); }
    questSave(); renderQuest();
  }
  function renderQuest() {
    var el = $('quest'); if (!el) return;
    if (qStep >= QUEST.length) { el.style.display = 'none'; return; }
    var q = QUEST[qStep], guest = q.guest && !me;
    el.style.display = '';
    $('qHead').textContent = '할 일 ' + (qStep + 1) + '/' + QUEST.length;
    $('qText').textContent = (guest ? q.guest : q.text) + (q.prog ? '  ' + q.prog() : '');
    var b = $('qBtn');
    if (q.btn && !guest) { b.style.display = ''; b.textContent = q.btn[0]; b.onclick = function (e) { e.stopPropagation(); sfx('click'); q.btn[1](); }; }
    else b.style.display = 'none';
  }

  // ───────── 해·밤, 비 ─────────
  var FOG_FAR = (isTouch ? 5 : 7) * 32 - 12;
  var DAY_LEN = 900, dayT = DAY_LEN * 0.06, rain = 0, rainOn = false, rainTimer = 100;
  var LU = { uDay: { value: 1 }, uTint: { value: new THREE.Color(1, 1, 1) } };
  function lightPatch(mat) {
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uDay = LU.uDay; sh.uniforms.uTint = LU.uTint;
      sh.fragmentShader = 'uniform float uDay;\nuniform vec3 uTint;\n' + sh.fragmentShader.replace('#include <color_fragment>',
        '#if defined( USE_COLOR )\n diffuseColor.rgb *= max(vColor.r * uDay * uTint, vColor.g * vec3(1.0, 0.86, 0.62));\n#endif');
    };
  }
  var clouds = [], sunM, moonM, stars, cloudMat, rainLines, rainPos, RAIN_N = 900;
  var C_DAY = new THREE.Color(0x9fcdee), C_NIGHT = new THREE.Color(0x0c1430), C_DUSK = new THREE.Color(0xf09a5a), C_RAIN = new THREE.Color(0x8792a0);
  var C_WHITE = new THREE.Color(1, 1, 1), C_NTINT = new THREE.Color(0.72, 0.8, 1), C_DTINT = new THREE.Color(1, 0.84, 0.68), skyC = new THREE.Color(), fogC = new THREE.Color();
  function makeSky() {
    sunM = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ color: 0xfff1b8, fog: false }));
    moonM = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ color: 0xe6ecf8, fog: false, transparent: true }));
    scene.add(sunM); scene.add(moonM);
    var sp = [];
    for (var i = 0; i < 700; i++) { var th = rnd(i * 3.1) * Math.PI * 2, ph = Math.acos(rnd(i * 7.7) * 0.95), r = 260; sp.push(Math.cos(th) * Math.sin(ph) * r, Math.cos(ph) * r, Math.sin(th) * Math.sin(ph) * r); }
    var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    stars.frustumCulled = false; scene.add(stars);
    rainPos = new Float32Array(RAIN_N * 6);
    var rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    rainLines = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaabbd4, transparent: true, opacity: 0 }));
    rainLines.frustumCulled = false; rainLines.visible = false; scene.add(rainLines);
  }
  function respawnDrop(i, top) {
    var o = i * 6, x = camera.position.x + (Math.random() - 0.5) * 70, z = camera.position.z + (Math.random() - 0.5) * 70;
    var y = top ? camera.position.y + 12 + Math.random() * 22 : camera.position.y - 20 + Math.random() * 50;
    rainPos[o] = x; rainPos[o + 1] = y; rainPos[o + 2] = z; rainPos[o + 3] = x + 0.15; rainPos[o + 4] = y - 1.1; rainPos[o + 5] = z;
  }
  var skyState = { dayF: 1, dusk: 0 }, caveK = 0, C_CAVE = new THREE.Color(0x07080a);
  function updateDay(dt) {
    dayT += dt;
    var p = (dayT % DAY_LEN) / DAY_LEN, ang = p < 0.62 ? p / 0.62 * Math.PI : Math.PI + (p - 0.62) / 0.38 * Math.PI;
    var elev = Math.sin(ang), dayF = clamp01((elev + 0.12) / 0.34); dayF = dayF * dayF * (3 - 2 * dayF);
    var dusk = elev > -0.2 ? clamp01(1 - Math.abs(elev) / 0.28) : 0;
    // 비: 가끔 1~2분
    rainTimer -= dt;
    if (rainTimer <= 0) { if (rainOn) { rainOn = false; rainTimer = 150 + Math.random() * 200; } else if (Math.random() < 0.35) { rainOn = true; rainTimer = 60 + Math.random() * 70; } else rainTimer = 90; }
    rain += ((rainOn ? 1 : 0) - rain) * Math.min(1, dt * 0.25);
    skyC.copy(C_NIGHT).lerp(C_DAY, dayF).lerp(C_DUSK, dusk * 0.5).lerp(C_RAIN, rain * 0.6 * dayF);
    scene.background.copy(skyC);
    fogC.copy(skyC).lerp(C_WHITE, 0.18 * dayF);
    scene.fog.color.copy(fogC); scene.fog.near = FOG_FAR * 0.4 * (1 - 0.45 * rain); scene.fog.far = FOG_FAR * (1 - 0.3 * rain);
    LU.uDay.value = (0.24 + 0.76 * dayF) * (1 - 0.22 * rain);
    LU.uTint.value.copy(C_WHITE).lerp(C_NTINT, 1 - dayF).lerp(C_DTINT, dusk * 0.6);
    var ccx = Math.floor(camera.position.x), ccy = Math.floor(camera.position.y), ccz = Math.floor(camera.position.z);
    var cvT = started && skyLight(ccx, ccy, ccz) < 0.3 ? 1 : 0; caveK += (cvT - caveK) * Math.min(1, dt * 1.5);
    if (caveK > 0.01) scene.fog.color.lerp(C_CAVE, caveK * 0.9);
    if (heldMesh) heldMesh.material.color.setScalar(1 - caveK * 0.6);   // 굴 속에서는 손에 든 것도 어둡게
    avatarMat.color.setScalar(Math.max(0.32, LU.uDay.value) * (1 - caveK * 0.55));
    cloudMat.color.setScalar(0.35 + 0.65 * dayF);
    clouds.forEach(function (cl) {
      cl.position.x += dt * 1.5;
      if (cl.position.x - camera.position.x > 300) cl.position.x -= 600; else if (camera.position.x - cl.position.x > 300) cl.position.x += 600;
      if (cl.position.z - camera.position.z > 300) cl.position.z -= 600; else if (camera.position.z - cl.position.z > 300) cl.position.z += 600;
    });
    var cp = camera.position, dx = Math.cos(ang), dy = Math.sin(ang);
    sunM.position.set(cp.x + dx * 250, cp.y + dy * 250, cp.z - 70); sunM.lookAt(cp); sunM.visible = dy > -0.2 && rain < 0.7;
    moonM.position.set(cp.x - dx * 250, cp.y - dy * 250, cp.z + 70); moonM.lookAt(cp); moonM.visible = dy < 0.2; moonM.material.opacity = 1 - rain * 0.8;
    stars.position.copy(cp); stars.material.opacity = (1 - dayF) * (1 - rain);
    // 빗줄기
    rainLines.visible = rain > 0.03; rainLines.material.opacity = 0.5 * rain;
    if (rainLines.visible) {
      for (var i = 0; i < RAIN_N; i++) {
        var o = i * 6;
        if (!rainPos[o + 1] && !rainPos[o]) respawnDrop(i, false);
        rainPos[o + 1] -= 42 * dt; rainPos[o + 4] -= 42 * dt;
        var gx = Math.floor(rainPos[o]), gz = Math.floor(rainPos[o + 2]), top = skyAt(gx, gz);
        if (rainPos[o + 4] < top + 1 || rainPos[o + 4] < cp.y - 22 || Math.abs(rainPos[o] - cp.x) > 40 || Math.abs(rainPos[o + 2] - cp.z) > 40) respawnDrop(i, true);
      }
      rainLines.geometry.attributes.position.needsUpdate = true;
    }
    skyState.dayF = dayF; skyState.dusk = dusk;
  }

  // ───────── 배경 소리 ─────────
  var amb = null, ambTick = 0, nearWater = 0, underRoof = false;
  function noiseLoop(type, freq, q) {
    var len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
    var f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = AC.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
    return g;
  }
  function tone(type, f0, f1, dur, vol, trem) {
    if (!AC || !S.sound) return;
    try {
      var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + dur);
      lp.type = 'lowpass'; lp.frequency.value = Math.max(f0, f1) * 3;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.03); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(lp); lp.connect(g); g.connect(AC.destination);
      if (trem) { var l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = trem; lg.gain.value = vol * 0.6; l.connect(lg); lg.connect(g.gain); l.start(t); l.stop(t + dur); }
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  function animalCall(k, vol) {
    vol = vol || 0.12;
    if (k === 'sheep') tone('sawtooth', 430, 400, 0.55, vol, 16);
    else if (k === 'goat') tone('sawtooth', 620, 560, 0.45, vol, 22);
    else if (k === 'cow') tone('sawtooth', 150, 115, 0.95, vol * 1.3);
    else if (k === 'camel') tone('square', 120, 95, 0.45, vol * 0.8, 9);
    else if (k === 'horse') tone('sawtooth', 820, 420, 0.7, vol, 28);
    else if (k === 'donkey') { tone('square', 620, 560, 0.35, vol * 0.8); setTimeout(function () { tone('square', 260, 220, 0.45, vol * 0.8); }, 380); }
    else if (k === 'dove') { tone('sine', 520, 470, 0.28, vol); setTimeout(function () { tone('sine', 500, 450, 0.36, vol); }, 330); }
    else if (k === 'raven') { tone('square', 880, 700, 0.17, vol * 0.7); setTimeout(function () { tone('square', 860, 690, 0.17, vol * 0.7); }, 230); }
    else tone('sine', 900, 1300, 0.08, vol * 0.5);
  }
  function chirp() { var n = 2 + (Math.random() * 3 | 0), f = 2400 + Math.random() * 1400; for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { tone('sine', f, f * 1.25, 0.07, 0.035); }, i * 110); })(i); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function updateAmbient(dt) {
    if (!AC) return;
    if (!amb) { try { amb = { water: noiseLoop('bandpass', 520, 0.7), rain: noiseLoop('lowpass', 2400) }; } catch (e) { amb = {}; return; } }
    ambTick -= dt;
    if (ambTick <= 0) {
      ambTick = 0.5;
      var px = Math.floor(P.x), pz = Math.floor(P.z), best = 99;
      for (var dz = -16; dz <= 16; dz += 4) for (var dx = -16; dx <= 16; dx += 4) {
        var hx = px + dx, hz = pz + dz; if (hx < 0 || hz < 0 || hx >= SX || hz >= SZ) continue;
        terrain(hx, hz); if (T.wtop >= 0) best = Math.min(best, Math.hypot(dx, dz));
      }
      nearWater = clamp01(1 - best / 18);
      underRoof = skyAt(px, pz) > P.y + HT;
      // 새소리(낮), 풀벌레(밤), 가까운 동물 울음
      if (S.sound && started && ui === 'play') {
        if (skyState.dayF > 0.6 && rain < 0.3 && !underRoof && Math.random() < 0.09) chirp();
        if (skyState.dayF < 0.3 && rain < 0.3 && Math.random() < 0.18) tone('square', 4200, 4300, 0.05, 0.012);
        if (Math.random() < 0.25) {
          var nearA = null, nd = 16;
          animals.forEach(function (a) { var d = Math.hypot(a.x - P.x, a.z - P.z); if (d < nd) { nd = d; nearA = a; } });
          if (nearA && Math.random() < 0.35) animalCall(nearA.kind, 0.1 * (1 - nd / 16) + 0.02);
        }
      }
    }
    var on = S.sound && started ? 1 : 0;
    if (amb.water) amb.water.gain.value = 0.05 * nearWater * on;
    if (amb.rain) amb.rain.gain.value = 0.07 * rain * on * (underRoof ? 0.4 : 1);
  }

  // ───────── 지도(공식으로 그려 두고, 조금씩 채운다) ─────────
  var MAPN = 512, MSC = WS / MAPN, mapBase = document.createElement('canvas'), mapRow = 0, mapImg = null;
  mapBase.width = mapBase.height = MAPN;
  function mapTick() {
    if (mapRow >= MAPN) return;
    var x = mapBase.getContext('2d');
    if (!mapImg) { mapImg = x.createImageData(MAPN, 1); x.fillStyle = '#3a4a3a'; x.fillRect(0, 0, MAPN, MAPN); }
    for (var r = 0; r < 4 && mapRow < MAPN; r++, mapRow++) {
      for (var px = 0; px < MAPN; px++) {
        var wx = Math.floor((px + 0.5) * MSC), wz = Math.floor((mapRow + 0.5) * MSC);
        terrain(wx, wz);
        var col = T.wtop >= 0 ? (T.wtop - T.h > 5 ? 0x2c62a8 : 0x3d7fc6) : TILE_AVG[BT[T.top][0]];
        var k = T.wtop >= 0 ? 1 : 0.82 + clamp01((T.h - G + 4) / 50) * 0.5, o = px * 4;
        mapImg.data[o] = clamp255(((col >> 16) & 255) * k); mapImg.data[o + 1] = clamp255(((col >> 8) & 255) * k); mapImg.data[o + 2] = clamp255((col & 255) * k); mapImg.data[o + 3] = 255;
      }
      x.putImageData(mapImg, 0, mapRow);
    }
  }
  var MAP_LABELS = [['⛵ 방주', XM, AZ0 + AW / 2], ['마을', XM, PZ0 + 112], ['🌲 동쪽 숲', VX1 + 80, PZ0 + 60], ['⛰ 서쪽 산', PX0 - 110, PZ0 + 60], ['🌊 호수', LX, LZ],
    ['역청 구덩이', TARR[0] + 18, TARR[1] - 12], ['🌊 북쪽 바다', XM, SEA_Z - 180], ['🐪 동쪽 사막', DES_X + 260, PZ0 - 80], ['🌴 오아시스', OASX, OASZ + 30], ['🏔 아라랏 산', ARX, ARZ - 30], ['🌾 남쪽 들판', XM, LZ + 260]];
  // 작은 지도: 내 둘레 320칸 / 큰 지도: 온 세계
  function drawMap(cv, big) {
    if (!cv) return;
    var x = cv.getContext('2d'), w = cv.width, h = cv.height;
    x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false;
    var span = big ? WS : 320, ox = big ? 0 : P.x - span / 2, oz = big ? 0 : P.z - span / 2, sc = w / span;
    x.fillStyle = '#26302a'; x.fillRect(0, 0, w, h);
    x.drawImage(mapBase, ox / MSC, oz / MSC, span / MSC, span / MSC, 0, 0, w, h);
    function R(wx, wz, ww, wh, col, lw) { x.strokeStyle = col; x.lineWidth = lw; x.strokeRect((wx - ox) * sc, (wz - oz) * sc, ww * sc, wh * sc); }
    x.fillStyle = '#4a3424'; x.fillRect((AX0 - ox) * sc, (AZ0 - oz) * sc, AL * sc, AW * sc);
    if (!big) for (var i = 0; i < PCOLS * PROWS; i++) { var po = plotOrigin(i); R(po.x, po.z, PLOT, PLOT, 'rgba(255,255,255,.35)', 1); }
    else R(PX0, PZ0, VX1 - PX0, VZ1 - PZ0, 'rgba(255,255,255,.6)', 1);
    if (myPlot >= 0) { var o = plotOrigin(myPlot); R(o.x, o.z, PLOT, PLOT, '#ffd84a', big ? 2 : 2); }
    if (big) {
      x.font = '13px Galmuri11, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      MAP_LABELS.forEach(function (l) { var lx = (l[1] - ox) * sc, ly = (l[2] - oz) * sc; x.fillStyle = 'rgba(0,0,0,.55)'; var tw = x.measureText(l[0]).width + 10; x.fillRect(lx - tw / 2, ly - 10, tw, 20); x.fillStyle = '#fff'; x.fillText(l[0], lx, ly); });
      if (mapRow < MAPN) { x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, h - 22, w, 22); x.fillStyle = '#fff'; x.fillText('지도를 그리는 중… ' + Math.round(mapRow / MAPN * 100) + '%', w / 2, h - 11); }
    }
    var mx = (P.x - ox) * sc, mz = (P.z - oz) * sc, r = big ? 7 : 5;
    x.save(); x.translate(mx, mz); x.rotate(-P.yaw);
    x.beginPath(); x.moveTo(0, -r * 1.3); x.lineTo(r * 0.8, r); x.lineTo(-r * 0.8, r); x.closePath();
    x.fillStyle = '#ff4040'; x.fill(); x.lineWidth = 1.5; x.strokeStyle = '#fff'; x.stroke(); x.restore();
  }

  // ───────── 가까운 곳 만들고 지우기 ─────────
  var R_MESH = isTouch ? 5 : 7, R_GEN = R_MESH + 1, R_DROP = R_MESH + 4;
  var meshedCols = new Uint8Array(NC * NC), OFFS = [];
  for (var odz = -R_DROP; odz <= R_DROP; odz++) for (var odx = -R_DROP; odx <= R_DROP; odx++) OFFS.push([odx, odz, odx * odx + odz * odz]);
  OFFS.sort(function (a, b) { return a[2] - b[2]; });
  function inWorldC(cx, cz) { return cx >= 0 && cz >= 0 && cx < NC && cz < NC; }
  function columnReady(cx, cz) {
    for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) { var x = cx + dx, z = cz + dz; if (inWorldC(x, z) && !COLS[z * NC + x]) return false; }
    return true;
  }
  function meshColumn(cx, cz) { for (var cy = 0; cy < CY; cy++) buildChunk(cx, cy, cz); meshedCols[cz * NC + cx] = 1; }
  function unmeshColumn(cx, cz) {
    for (var cy = 0; cy < CY; cy++) { var key = cx + ',' + cy + ',' + cz, old = chunks[key]; if (old) { old.forEach(function (m) { scene.remove(m); m.geometry.dispose(); }); delete chunks[key]; } }
    meshedCols[cz * NC + cx] = 0;
  }
  function newColumn(cx, cz) { genColumn(cx, cz); spawnColumn(cx, cz); }
  // 바로 필요할 때(처음, 순간 이동): 그 둘레를 한꺼번에
  function ensureAround(x, z, r) {
    var pcx = Math.floor(x / CS), pcz = Math.floor(z / CS), dx, dz;
    for (dz = -r - 1; dz <= r + 1; dz++) for (dx = -r - 1; dx <= r + 1; dx++) { var cx = pcx + dx, cz = pcz + dz; if (inWorldC(cx, cz) && !COLS[cz * NC + cx]) newColumn(cx, cz); }
    for (dz = -r; dz <= r; dz++) for (dx = -r; dx <= r; dx++) { var mx = pcx + dx, mz = pcz + dz; if (inWorldC(mx, mz) && !meshedCols[mz * NC + mx] && columnReady(mx, mz)) meshColumn(mx, mz); }
  }
  var dropT = 0;
  function streamTick(px, pz, dt) {
    var pcx = Math.floor(px / CS), pcz = Math.floor(pz / CS), t0 = performance.now(), i, o, cx, cz;
    for (i = 0; i < OFFS.length; i++) {
      o = OFFS[i]; if (o[2] > R_GEN * R_GEN) break;
      cx = pcx + o[0]; cz = pcz + o[1];
      if (inWorldC(cx, cz) && !COLS[cz * NC + cx]) { newColumn(cx, cz); if (performance.now() - t0 > 6) break; }
    }
    t0 = performance.now();
    for (i = 0; i < OFFS.length; i++) {
      o = OFFS[i]; if (o[2] > R_MESH * R_MESH) break;
      cx = pcx + o[0]; cz = pcz + o[1];
      if (inWorldC(cx, cz) && !meshedCols[cz * NC + cx] && COLS[cz * NC + cx] && columnReady(cx, cz)) { meshColumn(cx, cz); if (performance.now() - t0 > 7) break; }
    }
    dropT -= dt;
    if (dropT <= 0) {
      dropT = 1;
      for (var k = 0; k < NC * NC; k++) {
        if (!COLS[k] && !meshedCols[k]) continue;
        var kx = k % NC, kz = (k - kx) / NC, d2 = (kx - pcx) * (kx - pcx) + (kz - pcz) * (kz - pcz);
        if (meshedCols[k] && d2 > (R_MESH + 2) * (R_MESH + 2)) unmeshColumn(kx, kz);
        if (COLS[k] && d2 > R_DROP * R_DROP) COLS[k] = null;   // 고친 자리는 EDITS에 있어 다시 만들 때 살아남
      }
      despawnFar(px, pz);
    }
  }
  // 기둥이 생길 때 그 땅에 맞는 동물·물고기
  var fishGeos = null;
  function spawnColumn(cx, cz) {
    var x0 = cx * CS, z0 = cz * CS;
    terrain(x0 + 16, z0 + 16);
    var reg = T.reg, i;
    if (inTown(x0 + 16, z0 + 16) || reg === 'tar') return;
    if (!fishGeos) {
      fishGeos = [0xa8b8c4, 0xe0884a, 0x8aa66a, 0xc4c8a0].map(function (c) { return mergedBoxes([[0.32, 0.45, 1.0, c, 0, 0, 0], [0.08, 0.42, 0.35, c, 0, 0, 0.65], [0.06, 0.08, 0.08, 0x111111, 0.17, 0.08, -0.35], [0.06, 0.08, 0.08, 0x111111, -0.17, 0.08, -0.35]]); });
    }
    for (i = 0; i < 4; i++) {
      var fx = x0 + 2 + Math.floor(hash2(cx * 5 + i, cz, 41) * 28), fz = z0 + 2 + Math.floor(hash2(cx, cz * 5 + i, 42) * 28);
      terrain(fx, fz);
      if (T.wtop < 0 || T.wtop - T.h < 1 || hash2(fx, fz, 43) > 0.6) continue;
      var m = new THREE.Mesh(fishGeos[i % 4], avatarMat); scene.add(m);
      fishes.push({ kind: 'fish', mesh: m, x: fx + 0.5, y: T.h + 1 + Math.min(T.wtop - T.h - 1, 1) + 0.5, z: fz + 0.5, h: hash2(fx, fz, 44) * 6.28, spd: 1.2 + hash2(fx, fz, 45) * 1.2, t: 0 });
    }
    terrain(x0 + 16, z0 + 16);
    var kinds = reg === 'desert' ? ['camel', 'camel', 'donkey'] : (reg === 'west' || reg === 'ararat' ? ['goat', 'goat', 'sheep', 'donkey'] : (reg === 'sea' || reg === 'lake' || reg === 'oasis' ? (reg === 'oasis' ? ['camel', 'donkey'] : []) : ['sheep', 'goat', 'cow', 'rabbit', 'sheep', 'cow', 'rabbit', 'horse', 'horse', 'donkey']));
    if (!kinds.length || hash2(cx, cz, 31) > (reg === 'desert' ? 0.16 : 0.3)) return;
    var kn = kinds[Math.floor(hash2(cx, cz, 32) * kinds.length)], n = 2 + Math.floor(hash2(cx, cz, 33) * 3);
    for (i = 0; i < n; i++) {
      var hx = x0 + 4 + hash2(cx + i, cz, 34) * 24, hz = z0 + 4 + hash2(cx, cz + i, 35) * 24;
      if (inTown(hx | 0, hz | 0) || plotAt(hx | 0, hz | 0) >= 0) continue;
      var gy = groundAt(hx, hz, SY - 3); if (gy === null) continue;
      animals.push(makeBeast(kn, hx, hz));
    }
  }
  function despawnFar(px, pz) {
    var far = (R_DROP * CS) * (R_DROP * CS);
    animals = animals.filter(function (a) { var ok = a.saddled || (a.x - px) * (a.x - px) + (a.z - pz) * (a.z - pz) < far; if (!ok) scene.remove(a.mesh); return ok; });
    fishes = fishes.filter(function (f) { var ok = (f.x - px) * (f.x - px) + (f.z - pz) * (f.z - pz) < far; if (!ok) scene.remove(f.mesh); return ok; });
  }

  // ───────── 시작 ─────────
  var hl, avatar, heldMesh, swingT = 0;
  function itemGeometry(id) {
    var t = BT[id][1], a = tileUV(t, 0, 0), b = tileUV(t, 1, 0), c = tileUV(t, 1, 1), d = tileUV(t, 0, 1);
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1]], 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 3));
    g.setIndex([0, 1, 2, 0, 2, 3, 0, 2, 1, 0, 3, 2]);   // 앞뒤 두 면
    return g;
  }
  function setHeld(id) { if (heldMesh.geometry) heldMesh.geometry.dispose(); if (!id) { heldMesh.geometry = new THREE.BufferGeometry(); return; } heldMesh.geometry =isItem(id) || id === TORCH ? itemGeometry(id) : blockGeometry(id); heldMesh.material.alphaTest = isItem(id) || id === TORCH ? 0.5 : 0; heldMesh.material.needsUpdate = true; }
  function init() {
    canvasEl = $('game');
    if (isTouch) document.body.classList.add('touch');
    document.body.classList.toggle('keysoff', !!S.keysOff);
    buildTiles();
    for (var id = 1; id < B.length; id++) if (B[id]) BT[id] = [TILE[B[id][1]], TILE[B[id][2]], TILE[B[id][3]]];
    makeIcons();

    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: !isTouch, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.6 : 2));
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fcdee);
    scene.fog = new THREE.Fog(0xc4e2f4, FOG_FAR * 0.4, FOG_FAR);
    camera = new THREE.PerspectiveCamera(70, 1, 0.08, FOG_FAR + 60);
    scene.add(camera);
    atlasTex = new THREE.CanvasTexture(atlas);
    atlasTex.magFilter = THREE.NearestFilter; atlasTex.minFilter = THREE.NearestFilter; atlasTex.generateMipmaps = false;
    if (THREE.SRGBColorSpace) atlasTex.colorSpace = THREE.SRGBColorSpace;
    opaqueMat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true });
    glassMat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, transparent: true, depthWrite: false });
    plantMat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide });
    lightPatch(opaqueMat); lightPatch(glassMat); lightPatch(plantMat);
    avatarMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    bitGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    hl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006, 1.006, 1.006)), new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.6 }));
    hl.visible = false; scene.add(hl);
    for (var st = 1; st <= 8; st++) (function (t) { crackGeo.push(cubeGeometry(function () { return t; }, false)); })(TILE['crack' + st]);
    crackMesh = new THREE.Mesh(crackGeo[0], new THREE.MeshBasicMaterial({ map: atlasTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    crackMesh.scale.setScalar(1.004); crackMesh.visible = false; crackMesh.renderOrder = 3; scene.add(crackMesh);
    heldMesh = new THREE.Mesh(HOTBAR[0] ? blockGeometry(HOTBAR[0]) : new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, depthTest: false, depthWrite: false, transparent: true }));
    lightPatch(heldMesh.material); heldMesh.renderOrder = 10; heldMesh.scale.setScalar(0.34); camera.add(heldMesh);
    refreshMyAvatar(); avatar.visible = false;
    makeSky();
    cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, fog: false });
    for (var c = 0; c < 26; c++) {
      var cl = new THREE.Mesh(new THREE.BoxGeometry(20 + rnd(c) * 30, 3, 12 + rnd(c + 5) * 16), cloudMat);
      cl.position.set(XM + rnd(c + 11) * 600 - 300, G + 82 + rnd(c + 3) * 10, AZ0 + rnd(c + 17) * 600 - 300); scene.add(cl); clouds.push(cl);
    }

    bindInput(canvasEl); bindUI(); renderHotbar();
    window.addEventListener('resize', resize); resize();

    loadOnline().then(function () {
      ensureAround(XM, AZ0 + 60, 3);
      spawnBirds(); renderQuest();
      renderHotbar(); setSel(0, true);
      $('loading').style.display = 'none';
      $('tWho').textContent = me ? (myPlot >= 0 ? '로그인됨 · 내 땅 ' + (myPlot + 1) + '번' : '로그인됨') : '구경 모드 · 로그인하면 내 땅과 가방이 저장돼요';
      showUI('title');
      var last = performance.now(), orbit = 0, mapT = 0;
      (function loop(now) {
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (!started) {
          orbit += dt * 0.035;
          var cxr = XM, czr = AZ0 + AW / 2 + 40;
          camera.position.set(cxr + Math.cos(orbit) * 190, G + 66, czr + Math.sin(orbit) * 140);
          camera.lookAt(cxr, G + 10, AZ0 + AW / 2 + 20);
          heldMesh.visible = false; hl.visible = false;
        } else {
          if (ui === 'play') step(dt); else placeCamera(dt);
          var h = null;
          if (ui === 'play') {
            if (!isTouch) h = pickCenter();
            else if (hold) h = pickTouch(hold.x, hold.y);
            else if (S.aim === 'cross') h = pickCenter();
            if (!isTouch && mouseMining) mineTick(h, dt);
            else if (isTouch && hold && (now - hold.t0 > 200 || hold.dug)) mineTick(h, dt);
            else if (!hold && !mouseMining) mine = null;
          }
          updateCrack(); updateRing();
          hl.visible = !!h; if (h) hl.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5);
        }
        if (started) { updateDay(dt); updateAmbient(dt); mapT -= dt; if (mapT <= 0) { mapT = 0.25; drawMap($('mapc'), false); if (ui === 'map') drawMap($('bigmapc'), true); } }
        streamTick(camera.position.x, camera.position.z, dt); mapTick();
        stepBits(dt); stepDrops(dt); stepFalls(dt); stepCreatures(dt, now / 1000); netTick(dt, now);
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      })(last);
      setInterval(function () { if (started) $('place').textContent = placeName(); }, 300);
    });
  }
  function teleport(x, y, z, yaw) {
    if (riding) dismount(true);
    ensureAround(x, z, 2);
    P.x = x; P.z = z; P.y = y; P.vy = 0; P.vx = P.vz = 0;
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    if (yaw !== undefined) P.yaw = yaw; P.pitch = -0.12; P.camY = 0;
  }
  function goHome() {
    if (myPlot < 0) { toast(me ? '내 땅을 받는 중이에요' : '로그인하면 내 땅을 받을 수 있어요'); return; }
    var o = plotOrigin(myPlot); teleport(o.x + PLOT / 2, G, o.z - 2, Math.PI); toast('내 땅(' + (myPlot + 1) + '번)이에요. 모은 블록으로 지어 보세요!');
  }
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  var fwd = new THREE.Vector3(), lastX = 0, lastZ = 0;
  function step(dt) {
    var mx = 0, mz = 0;
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
    mx += joy.x; mz += joy.y;
    var len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    P.swim = !P.fly && inWater();
    P.ladder = !P.fly && onLadder();
    P.sprint = !P.swim && (keys.ControlLeft || keys.KeyR || runLock) && mz < -0.3;
    var sp = (P.fly ? 20 : (P.swim ? 5 : (riding ? riding.sp.ride : 8.5))) * (P.sprint && !riding ? 1.5 : 1);
    var sin = Math.sin(P.yaw), cos = Math.cos(P.yaw);
    var wx = (mx * cos + mz * sin) * sp, wz = (-mx * sin + mz * cos) * sp;
    var a = P.ground || P.fly || P.swim ? 14 : 4;
    P.vx += (wx - P.vx) * Math.min(1, a * dt); P.vz += (wz - P.vz) * Math.min(1, a * dt);
    if (P.fly) {
      var vy = (jumpHeld || keys.Space ? 1 : 0) - (flyDown || keys.ShiftLeft || keys.KeyC ? 1 : 0);
      P.vy += (vy * 14 - P.vy) * Math.min(1, 10 * dt);
    } else if (P.swim) {
      P.vy -= 12 * dt; if (P.vy < -4) P.vy = -4;
      if (jumpHeld || keys.Space) P.vy = 6;
    } else if (P.ladder) {
      // 사닥다리: 앞으로 밀거나 점프하면 오르고, 가만히 있으면 천천히 내려간다(창 28:12)
      if (jumpHeld || keys.Space || mz < -0.2) P.vy = 5.5;
      else if (flyDown || keys.ShiftLeft) P.vy = 0;
      else { P.vy -= 50 * dt; if (P.vy < -3.5) P.vy = -3.5; }
    } else {
      P.vy -= 50 * dt; if (P.vy < -60) P.vy = -60;
      if (jumpHeld && P.ground) P.vy = riding ? riding.sp.jump : 15.2;
    }
    lastX = P.x; lastZ = P.z;
    moveAxis(0, P.vx * dt); moveAxis(2, P.vz * dt);
    var hitY = moveAxis(1, P.vy * dt);
    P.ground = false;
    if (hitY) { if (P.vy < 0) P.ground = true; P.vy = 0; }
    else if (!P.fly && collides(P.x, P.y - 0.02, P.z)) P.ground = true;
    if (P.y < -10) teleport(P.x, surfaceY(P.x | 0, P.z | 0), P.z);
    P.x = clamp(P.x, 40, WS - 40); P.z = clamp(P.z, 40, WS - 40);
    var moved = Math.hypot(P.x - lastX, P.z - lastZ);
    if (riding) stepRide(dt, moved);
    if (P.ground) { P.walk += moved * 0.55; P.stepAcc += moved; if (P.stepAcc > 2.6) { P.stepAcc = 0; sfx('step', matSound(get(Math.floor(P.x), Math.floor(P.y - 0.1), Math.floor(P.z)))); } }
    else P.walk += moved * 0.2;
    P.camY += (0 - P.camY) * Math.min(1, 12 * dt);
    placeCamera(dt, moved / Math.max(dt, 1e-4));
  }
  var bobAmp = 0;
  function placeCamera(dt, speed) {
    speed = speed || 0;
    var ex = P.x, ey = P.y + (riding ? riding.sp.seat + 1.85 : EYE) + P.camY, ez = P.z;
    fwd.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
    var targetFov = P.sprint ? 78 : 70;
    if (Math.abs(camera.fov - targetFov) > 0.05) { camera.fov += (targetFov - camera.fov) * Math.min(1, 8 * dt); camera.updateProjectionMatrix(); }
    bobAmp += ((P.ground && speed > 1 ? 1 : 0) - bobAmp) * Math.min(1, 8 * dt);
    swingT = Math.max(0, swingT - dt);
    var sw = Math.sin((swingT / 0.25) * Math.PI);
    if (S.view === 0) {
      camDist = 0;
      var bob = Math.sin(P.walk * 2) * 0.07 * bobAmp, sway = Math.cos(P.walk) * 0.05 * bobAmp;
      camera.position.set(ex + Math.cos(P.yaw) * sway, ey + Math.abs(bob), ez - Math.sin(P.yaw) * sway);
      camera.lookAt(camera.position.x + fwd.x, camera.position.y + fwd.y, camera.position.z + fwd.z);
      avatar.visible = false; heldMesh.visible = true;
      heldMesh.position.set(0.52 + Math.cos(P.walk) * 0.02 * bobAmp, -0.46 + Math.abs(Math.sin(P.walk * 2)) * 0.025 * bobAmp - sw * 0.12, -0.82 - sw * 0.1);
      heldMesh.rotation.set(0.1 - sw * 0.6, 0.72, 0);
    } else {
      var dir = S.view === 1 ? -1 : 1, want = 8.5, d = 0.6;
      while (d < want) {
        var qx = ex + fwd.x * dir * d, qy = ey + fwd.y * dir * d, qz = ez + fwd.z * dir * d;
        if (isSolid(get(Math.floor(qx), Math.floor(qy), Math.floor(qz)))) { d -= 0.45; break; }
        d += 0.25;
      }
      camDist = Math.max(0.6, Math.min(want, d));
      camera.position.set(ex + fwd.x * dir * camDist, ey + fwd.y * dir * camDist, ez + fwd.z * dir * camDist);
      camera.lookAt(ex, ey, ez);
      avatar.visible = true; heldMesh.visible = false;
      avatar.position.set(P.x, P.y + P.camY + (riding ? riding.sp.seat - 1.2 : 0), P.z);
      avatar.rotation.y = P.yaw;
      var pr = avatar.userData, swing = riding ? 0 : Math.sin(P.walk * 1.6) * 0.75 * bobAmp;
      pr.legL.rotation.x = swing; pr.legR.rotation.x = -swing;
      pr.legL.rotation.z = riding ? -0.45 : 0; pr.legR.rotation.z = riding ? 0.45 : 0;   // 걸터앉기
      pr.armL.rotation.x = -swing * 0.8; pr.armR.rotation.x = swing * 0.8 - sw * 1.2;
      pr.head.rotation.x = P.pitch * 0.7;
    }
    // 물속이면 화면을 푸르게
    var under = get(Math.floor(camera.position.x), Math.floor(camera.position.y), Math.floor(camera.position.z)) === WATER;
    document.body.classList.toggle('underwater', under && started);
  }

  // ───────── 함께 놀기(2단계): 친구 보기 · 블록 함께 바꾸기 · 채팅 ─────────
  // 실시간 채널 'ark-world'(로그인 회원만, DB 정책)로 위치·블록 바꿈을 주고받고, 내 땅 밖에서 바꾼 자리는 DB(ark_world_edits)에 남긴다.
  // 채팅은 DB 함수(send_ark_chat)로만 써서 이름을 속일 수 없고, 새 글·지운 글은 DB 변경 알림으로 받는다.
  var NET = { ok: false, ready: false, ch: null, on: false, nick: '', admin: false, meta: {}, peers: {}, q: [], pm: {}, flushT: 0, sentAt: 0, sentKey: '', applying: false,
    chat: [], chatIds: {}, reported: {}, joinedAt: 0, holdUntil: 0, edits: null };
  var ROBES = [[0xd8c39a, 0xc0a97e, 0x3f6fae], [0x9fb7d8, 0x7d97bb, 0xc8a040], [0xc98f8f, 0xa86f6f, 0x3a6a3a], [0x9fcf9a, 0x7fae7a, 0x8a4b14],
    [0xd6b0e0, 0xb48fc0, 0x2f5f8f], [0xe0d070, 0xc0b050, 0x7a2a2a], [0x8fd0d0, 0x6fb0b0, 0x6b3d14], [0xe8e8e8, 0xc8c8c8, 0x7a3ea8]];
  var HAIRS = [0x3a2618, 0x1e1410, 0x6b4425, 0x2b1d14, 0x8a5a2a];
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function peerLook(u) {
    var h = hashStr(u || ''), r = ROBES[h % ROBES.length];
    return { robe: r[0], robe2: r[1], belt: 0x7a4a26, trim: r[2], skin: [0xe5b98f, 0xd9a67a, 0xc98f62][(h >>> 4) % 3], hair: HAIRS[(h >>> 8) % HAIRS.length], sandal: 0x6b4425 };
  }
  function textSprite(t, bg, fg, hgt) {
    var px = 28, f = px + 'px Galmuri11, "Malgun Gothic", sans-serif', c = document.createElement('canvas'), g = c.getContext('2d');
    g.font = f; var w = Math.ceil(g.measureText(t).width) + 20, h = px + 14;
    c.width = w; c.height = h; g = c.getContext('2d'); g.font = f;
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(t, 10, h / 2 + 1);
    var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, fog: false }));
    s.scale.set(w / h * hgt, hgt, 1); s.renderOrder = 20;
    return s;
  }
  function disposeSprite(s) { if (!s) return; if (s.parent) s.parent.remove(s); s.material.map.dispose(); s.material.dispose(); }
  function shortName(n, k) { var cs = Array.from(n || '친구'); return cs.length > k ? cs.slice(0, k).join('') + '…' : cs.join(''); }

  // 친구 모습
  function peerGet(u) {
    var p = NET.peers[u]; if (p) return p;
    var av = new THREE.Group(); scene.add(av);
    p = NET.peers[u] = { u: u, av: av, wk: null, tag: null, nick: null, x: 0, y: 0, z: 0, h: 0, pt: 0, tx: 0, ty: 0, tz: 0, th: 0, t: 0, s: 0, walk: 0, rk: '', beast: null, bub: null, bubT: 0, fresh: true };
    peerName(p);
    return p;
  }
  function peerName(p) {
    var m = NET.meta[p.u], n = (m && m.n) || '친구', wk = (m && m.w) || '';
    if (wk !== p.wk) {   // 친구 모습·옷이 바뀌면 다시 만듦
      p.wk = wk;
      var a = wk.split('.').map(function (v) { return v | 0; }), worn = {};
      SLOTS.forEach(function (s, i) { var id = a[i + 1]; if (id && WEARINFO[id] && WEARINFO[id].slot === s) worn[s] = id; });
      var nav = makeAvatar(wk && LOOKS[a[0]] ? LOOKS[a[0]] : peerLook(p.u)); dressAvatar(nav, worn);
      nav.position.copy(p.av.position); nav.rotation.y = p.av.rotation.y; nav.visible = p.av.visible;
      if (p.tag) nav.add(p.tag); if (p.bub) nav.add(p.bub);
      scene.remove(p.av); p.av = nav; scene.add(nav);
    }
    if (n === p.nick) return;
    p.nick = n; disposeSprite(p.tag);
    p.tag = textSprite(shortName(n, 8), 'rgba(0,0,0,0.45)', '#ffffff', 0.62); p.tag.position.y = HT + 0.7; p.av.add(p.tag);
  }
  function peerBubble(p, body) {
    disposeSprite(p.bub);
    p.bub = textSprite(shortName(body, 18), 'rgba(255,255,255,0.88)', '#222222', 0.6); p.bub.position.y = HT + 1.5; p.av.add(p.bub);
    p.bubT = performance.now() + 6000;
  }
  function peerRemove(u) {
    var p = NET.peers[u]; if (!p) return;
    disposeSprite(p.tag); disposeSprite(p.bub); scene.remove(p.av);
    if (p.beast) scene.remove(p.beast.mesh);
    delete NET.peers[u];
  }
  function onPos(m) {
    if (!m || !me || m.u === me.id || typeof m.x !== 'number') return;
    var p = peerGet(m.u);
    p.tx = m.x; p.ty = m.y; p.tz = m.z; p.th = m.h || 0; p.pt = m.p || 0; p.s = m.s ? 1 : 0; p.t = performance.now();
    if (p.fresh) { p.fresh = false; p.x = p.tx; p.y = p.ty; p.z = p.tz; p.h = p.th; }
    var rk = BEASTS[m.r] ? m.r : '';
    if (rk !== p.rk) {
      if (p.beast) { scene.remove(p.beast.mesh); p.beast = null; }
      p.rk = rk;
      if (rk) { p.beast = makeBeast(rk, p.x, p.z); putSaddle(p.beast); }
    }
  }
  function sendPos(now) {
    var r = riding ? riding.kind : '', s = (mine && !mine.denied) || swingT > 0 ? 1 : 0;
    var m = { u: me.id, x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), h: +P.yaw.toFixed(2), p: +P.pitch.toFixed(2), r: r, s: s };
    var key = [m.x, m.y, m.z, m.h, m.p, r, s].join();
    if ((key === NET.sentKey && now - NET.sentAt < 2500) || now - NET.sentAt < 110) return;
    NET.sentKey = key; NET.sentAt = now;
    NET.ch.send({ type: 'broadcast', event: 'pos', payload: m });
  }
  function netTick(dt, now) {
    if (!NET.ch) return;
    if (started) sendPos(now);
    var k = Math.min(1, dt * 10);
    for (var u in NET.peers) {
      var p = NET.peers[u];
      if (now - p.t > 15000 || (!NET.meta[u] && now - p.t > 5000)) { peerRemove(u); continue; }
      var ox = p.x, oz = p.z;
      if (Math.abs(p.tx - p.x) + Math.abs(p.tz - p.z) + Math.abs(p.ty - p.y) > 12) { p.x = p.tx; p.y = p.ty; p.z = p.tz; }
      else { p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; p.z += (p.tz - p.z) * k; }
      var d = p.th - p.h; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; p.h += d * k;
      var mv = Math.hypot(p.x - ox, p.z - oz); p.walk += mv;
      var seat = p.rk ? BEASTS[p.rk].seat - 1.2 : 0;
      p.av.position.set(p.x, p.y + seat, p.z); p.av.rotation.y = p.h;
      var pr = p.av.userData, sw = p.rk || mv < 0.003 ? 0 : Math.sin(p.walk * 1.6) * 0.75;
      pr.legL.rotation.x = sw; pr.legR.rotation.x = -sw;
      pr.legL.rotation.z = p.rk ? -0.45 : 0; pr.legR.rotation.z = p.rk ? 0.45 : 0;
      pr.armL.rotation.x = -sw * 0.8; pr.armR.rotation.x = sw * 0.8 - (p.s ? 0.9 + Math.sin(now / 70) * 0.5 : 0);
      pr.head.rotation.x = p.pt * 0.7;
      if (p.beast) {
        var b = p.beast; b.mesh.position.set(p.x, p.y, p.z); b.mesh.rotation.y = p.h; b.walk += mv * 1.1;
        var s2 = mv > 0.003 ? Math.sin(b.walk * 2) * 0.75 : 0;
        b.legs[0].rotation.x = s2; b.legs[3].rotation.x = s2; b.legs[1].rotation.x = -s2; b.legs[2].rotation.x = -s2;
      }
      if (p.bub && now > p.bubT) { disposeSprite(p.bub); p.bub = null; }
      p.av.visible = Math.abs(p.x - P.x) + Math.abs(p.z - P.z) < FOG_FAR * 1.4;
    }
  }

  // 블록 바꿈: 내 땅·땅 밖에서 바꾼 것을 알리고, 땅 밖은 DB에도 남김
  function netEdit(x, y, z, id) {
    if (NET.applying || !NET.ready) return;
    var p = plotAt(x, z);
    if ((p >= 0 && p !== myPlot) || inArk(x, y, z)) return;
    NET.q.push([x, y, z, id]);
    if (p < 0) NET.pm[x + ',' + y + ',' + z] = id;
    if (!NET.flushT) NET.flushT = setTimeout(netFlush, 120);
  }
  function netFlush() {
    NET.flushT = 0;
    if (NET.ch) for (var i = 0; i < NET.q.length; i += 400) NET.ch.send({ type: 'broadcast', event: 'blk', payload: { u: me.id, e: NET.q.slice(i, i + 400) } });
    NET.q = [];
  }
  var persistBusy = false;
  function requeue(arr) { arr.forEach(function (e) { var k = e[0] + ',' + e[1] + ',' + e[2]; if (!(k in NET.pm)) NET.pm[k] = e[3]; }); }
  function netPersist() {
    if (!NET.ready || persistBusy || performance.now() < NET.holdUntil) return;
    var ks = Object.keys(NET.pm); if (!ks.length) return;
    var batch = ks.slice(0, 300), arr = batch.map(function (k) { var a = k.split(','); return [+a[0], +a[1], +a[2], NET.pm[k]]; });
    batch.forEach(function (k) { delete NET.pm[k]; });
    persistBusy = true;
    client.rpc('put_ark_edits', { p_edits: arr }).then(function (r) {
      persistBusy = false;
      if (r.error || r.data === -3) { requeue(arr); NET.holdUntil = performance.now() + (r.data === -3 ? 30000 : 6000); }
    }, function () { persistBusy = false; requeue(arr); NET.holdUntil = performance.now() + 6000; });
  }
  setInterval(netPersist, 2000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { if (NET.flushT) { clearTimeout(NET.flushT); netFlush(); } netPersist(); } });
  function plotPut(p, x, y, z, id) {
    if (y < PY0 || y >= G + PH) return;
    if (!plotData[p]) plotData[p] = plotDefault();
    var o = plotOrigin(p); plotData[p][((y - PY0) * PLOT + (z - o.z)) * PLOT + (x - o.x)] = id;
  }
  // 친구가 바꾼 블록을 내 세계에 반영(그림은 한 번에 다시 그림)
  function applyRemote(u, list) {
    var bb = null, lit = [];
    NET.applying = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var e = list[i]; if (!e || e.length !== 4) continue;
        var x = e[0] | 0, y = e[1] | 0, z = e[2] | 0, id = e[3] | 0;
        if (y < 1 || y >= SY || x < 0 || z < 0 || x >= WS || z >= WS || (id !== AIR && !B[id]) || inArk(x, y, z)) continue;
        var p = plotAt(x, z);
        if (p >= 0) {
          if (p === myPlot || (plotUser[p] && plotUser[p] !== u)) continue;   // 그 땅 주인이 바꾼 것만
          plotUser[p] = u; plotOwners[p] = 1; plotPut(p, x, y, z, id);
        } else recordEdit(x, y, z, id);
        var was = get(x, y, z); if (was === id) continue;
        setRaw(x, y, z, id);
        var c0 = colAt(x, z); if (!c0) continue;
        c0.mod = true; updateSky(x, z);
        if (LIGHTS[was] || LIGHTS[id]) {
          if (LIGHTS[id]) c0.lamps.push([x, y, z]); else c0.lamps = c0.lamps.filter(function (l) { return l[0] !== x || l[1] !== y || l[2] !== z; });
          lit.push([x, y, z]);
        }
        if (!bb) bb = [x, y, z, x, y, z];
        else { bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.min(bb[2], z); bb[3] = Math.max(bb[3], x); bb[4] = Math.max(bb[4], y); bb[5] = Math.max(bb[5], z); }
      }
    } finally { NET.applying = false; }
    lit.forEach(function (l) { lampChanged(l[0], l[1], l[2]); });
    if (bb) rebuildBox(bb[0] - 1, bb[1] - 1, bb[2] - 1, bb[3] + 1, bb[4] + 1, bb[5] + 1);
  }

  // 처음 들어올 때: 이름·관리자 여부, 함께 쓰는 세계의 바뀐 자리
  function uploadLocalOnce() {
    try { if (localStorage.getItem('arkVillage.editsUp') === '1') return; localStorage.setItem('arkVillage.editsUp', '1'); } catch (e) { return; }
    var n = 0;
    for (var k in EDITS) {
      var cz = Math.floor(k / NC), cx = k % NC, ed = EDITS[k];
      for (var li in ed) {
        if (n >= 1400) return;
        var l = +li, lx = l % CS, r0 = (l - lx) / CS, lz = r0 % CS, y = (r0 - lz) / CS, x = cx * CS + lx, z = cz * CS + lz;
        if (y < 1 || plotAt(x, z) >= 0 || inArk(x, y, z)) continue;
        NET.pm[x + ',' + y + ',' + z] = ed[li]; n++;
      }
    }
  }
  function loadShared() {
    if (!client || !me) return Promise.resolve();
    return Promise.all([
      client.rpc('get_my_ark_name').then(function (r) { if (!r.error && r.data) { NET.nick = r.data.nick || '친구'; NET.admin = !!r.data.admin; NET.ok = true; document.body.classList.toggle('adm', NET.admin); try { bagChanged(); } catch (e) {} } }, function () {}),
      client.rpc('get_ark_edits').then(function (r) { if (!r.error && typeof r.data === 'string') NET.edits = r.data; }, function () {})
    ]).then(function () {
      if (!NET.ok) return;   // DB 준비 전이면 혼자 놀기 그대로
      uploadLocalOnce();
      if (NET.edits) NET.edits.split(';').forEach(function (s) {
        var a = s.split(','); if (a.length !== 4) return;
        var x = +a[0], y = +a[1], z = +a[2];
        if (plotAt(x, z) >= 0 || inArk(x, y, z)) return;
        recordEdit(x, y, z, +a[3]); delete NET.pm[x + ',' + y + ',' + z];
      });
      NET.edits = null; NET.ready = true;
      return client.auth.getSession().then(function (s) {
        try { if (s && s.data && s.data.session) client.realtime.setAuth(s.data.session.access_token); } catch (e) {}
        netConnect();
      });
    }).catch(function () {});
  }
  function netConnect() {
    if (!client || !me || NET.chan) return;
    var ch = NET.chan = client.channel('ark-world', { config: { private: true, presence: { key: me.id }, broadcast: { self: false } } });
    ch.on('broadcast', { event: 'pos' }, function (r) { onPos(r.payload); })
      .on('broadcast', { event: 'blk' }, function (r) { var p = r.payload; if (p && p.u !== me.id && p.e && p.e.length) applyRemote(p.u, p.e.slice(0, 600)); })
      .on('presence', { event: 'sync' }, function () {
        var st = ch.presenceState(); NET.meta = {};
        for (var key in st) if (st[key] && st[key][0]) NET.meta[key] = st[key][0];
        for (var u in NET.peers) { if (!NET.meta[u]) peerRemove(u); else peerName(NET.peers[u]); }
        netPill(); if (ui === 'chat') chatWho();
      })
      .on('presence', { event: 'join' }, function (r) {
        var n = r.newPresences && r.newPresences[0] && r.newPresences[0].n;
        if (r.key !== me.id && n && performance.now() - NET.joinedAt > 4000) chatSys(n + ' 님이 들어왔어요');
        NET.sentKey = '';
      })
      .on('presence', { event: 'leave' }, function (r) {
        var n = r.leftPresences && r.leftPresences[0] && r.leftPresences[0].n;
        if (r.key !== me.id && n && !NET.meta[r.key]) chatSys(n + ' 님이 나갔어요');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ark_chat' }, function (r) {
        var c = r.new; if (c && c.id) addChat({ id: c.id, nick: c.nick, body: c.body, mine: c.user_id === me.id, uid: c.user_id, reports: 0 }, true);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ark_chat' }, function (r) { if (r.old && r.old.id) removeChat(r.old.id); })
      .subscribe(function (status) {
        if (status === 'SUBSCRIBED') {
          var first = !NET.ch; NET.ch = ch; NET.on = true; NET.joinedAt = performance.now(); NET.sentKey = '';
          ch.track({ n: NET.nick, w: wornString() }).catch(function () {});
          netPill(); loadChat();
          if (first) chatSys('함께 놀기에 들어왔어요 — 💬' + (isTouch ? '' : '(T)') + '로 이야기해요');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') { NET.on = false; netPill(); }
      });
  }
  function netPill() {
    var n = Object.keys(NET.meta).length;
    $('netState').textContent = NET.on ? '👥 지금 ' + Math.max(1, n) + '명이 함께 있어요' : (NET.ready ? '👥 연결하는 중…' : '');
  }

  // 채팅
  var CHAT_ERR = { login: '로그인하면 이야기할 수 있어요', empty: '할 말을 써 주세요', long: '60자까지 쓸 수 있어요', slow: '조금 천천히 보내 주세요', same: '같은 말을 여러 번 보낼 수 없어요' };
  function hudChat(c) {
    var box = $('chatLog'), d = document.createElement('div');
    if (c.sys) { d.textContent = c.body; d.style.color = '#b8f0ff'; }
    else { var b = document.createElement('b'); b.textContent = shortName(c.nick, 8) + ': '; if (c.mine) b.className = 'me'; d.appendChild(b); d.appendChild(document.createTextNode(c.body)); d.setAttribute('data-id', c.id); }
    box.appendChild(d); while (box.children.length > 5) box.removeChild(box.firstChild);
    setTimeout(function () { d.classList.add('old'); }, 10000);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 10700);
  }
  function chatSys(t) { hudChat({ sys: true, body: t }); }
  function addChat(c, live) {
    if (NET.chatIds[c.id]) return;
    NET.chatIds[c.id] = 1; NET.chat.push(c);
    NET.chat.sort(function (a, b) { return a.id - b.id; });
    if (NET.chat.length > 60) NET.chat.shift();
    if (live) {
      hudChat(c);
      var p = c.uid && NET.peers[c.uid]; if (p) peerBubble(p, c.body);
      if (!c.mine) sfx('click');
    }
    if (ui === 'chat') renderChat();
  }
  function removeChat(id) {
    NET.chatIds[id] = 1;
    NET.chat = NET.chat.filter(function (c) { return c.id !== id; });
    var el = $('chatLog').querySelector('[data-id="' + (+id) + '"]'); if (el) el.parentNode.removeChild(el);
    if (ui === 'chat') renderChat();
  }
  function loadChat() {
    client.rpc('get_ark_chat_recent').then(function (r) {
      if (r.error || !r.data) return;
      r.data.slice().reverse().forEach(function (c) { addChat({ id: c.id, nick: c.nick, body: c.body, mine: !!c.mine, reports: c.reports || 0 }, false); });
    }, function () {});
  }
  function chatWho() {
    var names = Object.keys(NET.meta).map(function (k) { return shortName(NET.meta[k].n, 6); });
    $('chatWho').textContent = NET.on ? '· 지금 ' + names.length + '명: ' + names.slice(0, 8).join(', ') + (names.length > 8 ? ' …' : '') : (me ? '· 연결하는 중…' : '');
  }
  function renderChat() {
    var L = $('chatList'); L.innerHTML = ''; chatWho();
    if (!NET.chat.length) {
      var em = document.createElement('div'); em.className = 'empty';
      em.textContent = !me ? '로그인하면 함께 이야기할 수 있어요' : (NET.on ? '아직 이야기가 없어요. 먼저 인사해 보세요!' : '함께 놀기에 연결하는 중이에요…');
      L.appendChild(em); return;
    }
    NET.chat.forEach(function (c) {
      var row = document.createElement('div'); row.className = 'cm';
      var b = document.createElement('b'); b.textContent = shortName(c.nick, 8) + ':'; if (c.mine) b.className = 'me';
      var s = document.createElement('span'); s.textContent = ' ' + c.body;
      row.appendChild(b); row.appendChild(s);
      if (NET.admin && c.reports) { var sm = document.createElement('small'); sm.textContent = '신고 ' + c.reports; row.appendChild(sm); }
      function btn(t, title, fn) { var x = document.createElement('button'); x.className = 'mc'; x.textContent = t; x.title = title; x.setAttribute('aria-label', title); x.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); row.appendChild(x); return x; }
      if (!c.mine && !NET.reported[c.id]) btn('🚩', '신고', function () { reportChat(c); });
      if (NET.admin) { btn('🗑', '지우기', function () { adminRemove(c, 0); }); btn('🔇', '지우고 30분 말하기 금지', function () { adminRemove(c, 30); }); }
      L.appendChild(row);
    });
    L.scrollTop = L.scrollHeight;
  }
  function openChat() {
    if (!me) { toast('로그인하면 친구들과 이야기할 수 있어요'); return; }
    if (!NET.ok) { toast('함께 놀기를 준비하는 중이에요. 조금 뒤에 다시 눌러 주세요'); return; }
    openPanel('chat'); renderChat(); sfx('click');
    if (!isTouch) setTimeout(function () { $('chatInput').focus(); }, 30);
  }
  var chatBusy = false;
  function sendChat() {
    var inp = $('chatInput'), t = inp.value.replace(/\s+/g, ' ').trim();
    if (!t || chatBusy) return;
    if (!client || !me || !NET.ok) { toast(CHAT_ERR.login); return; }
    if (Array.from(t).length > 60) { toast(CHAT_ERR.long); return; }
    chatBusy = true;
    client.rpc('send_ark_chat', { p_body: t }).then(function (r) {
      chatBusy = false;
      var d = r && r.data;
      if (r.error || !d) { toast('보내지 못했어요 — 인터넷을 확인해 주세요'); return; }
      if (d.error) {
        if (d.error === 'muted') { var u = new Date(d.until); toast('선생님이 잠시 채팅을 멈췄어요 (' + u.getHours() + ':' + ('0' + u.getMinutes()).slice(-2) + '까지)'); }
        else toast(CHAT_ERR[d.error] || '보내지 못했어요');
        return;
      }
      inp.value = '';
      addChat({ id: d.id, nick: NET.nick, body: t, mine: true, uid: me.id, reports: 0 }, true);
    }, function () { chatBusy = false; toast('보내지 못했어요 — 인터넷을 확인해 주세요'); });
  }
  function reportChat(c) {
    if (!window.confirm('「' + shortName(c.body, 30) + '」\n이 글을 신고할까요? 세 사람이 신고하면 가려지고 선생님이 볼 수 있어요.')) return;
    client.rpc('report_ark_chat', { p_id: c.id }).then(function (r) {
      if (r.error) { toast('신고하지 못했어요'); return; }
      NET.reported[c.id] = 1;
      toast(r.data >= 3 ? '신고가 모여서 글을 가렸어요' : (r.data === -2 ? '내 글은 신고할 수 없어요' : '신고했어요. 고마워요'));
      if (r.data >= 3) removeChat(c.id); else if (ui === 'chat') renderChat();
    }, function () { toast('신고하지 못했어요'); });
  }
  function adminRemove(c, mins) {
    if (!window.confirm(mins ? '이 글을 지우고 쓴 사람의 채팅을 ' + mins + '분 동안 멈출까요?' : '이 글을 지울까요?')) return;
    client.rpc('admin_remove_ark_chat', { p_id: c.id, p_mute_minutes: mins }).then(function (r) {
      if (r.error || !r.data) { toast('지우지 못했어요'); return; }
      removeChat(c.id); toast(mins ? '지우고 ' + mins + '분 동안 멈췄어요' : '지웠어요');
    }, function () { toast('지우지 못했어요'); });
  }

  function loadOnline() {
    try {
      if (window.supabase && window.SUPABASE_URL) client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } catch (e) { client = null; }
    if (!client) return Promise.resolve();
    return client.auth.getSession().then(function (r) {
      me = r && r.data && r.data.session ? r.data.session.user : null;
      $('who').textContent = me ? '' : '구경 중 · 로그인하면 저장돼요';
      var claim = me ? client.rpc('claim_village_plot').then(function (c) { if (!c.error && c.data !== null) myPlot = c.data; }) : Promise.resolve();
      return claim.then(function () { return client.from('ark_village_plots').select('plot_idx,data,user_id'); });
    }).then(function (res) {
      (res && res.data || []).forEach(function (row) {
        plotOwners[row.plot_idx] = 1; plotUser[row.plot_idx] = row.user_id;
        if (row.data) decodePlot(row.plot_idx, row.data, me && row.user_id === me.id);
      });
      return loadShared();
    }).then(function () {
      setSave(myPlot >= 0 ? '내 땅 ' + (myPlot + 1) + '번' : '');
      if (me && myPlot >= 0) setTimeout(tryClaimDex, 3000);
    }).catch(function () { toast('인터넷이 약해서 다른 사람 집을 못 불러왔어요'); });
  }
  window.addEventListener('beforeunload', function () { if (dirty) savePlot(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { saveEdits(); if (dirty) savePlot(); } });

  window.__arkDebug = { WORN: function () { return WORN; }, LOOK: function (i) { if (i !== undefined) { LOOK = i; saveWorn(); } return LOOK; }, wearItem: wearItem, unwear: unwear, harvestAnimal: harvestAnimal, openLooks: openLooks, tableOK: tableOK, NET: NET, applyRemote: applyRemote, onPos: onPos, addChat: addChat, removeChat: removeChat, netEdit: netEdit, netTick: netTick, peerBubble: peerBubble, openChat: openChat, setMe: function (u, nick) { me = { id: u }; NET.nick = nick; NET.ok = true; NET.ready = true; }, riding: function () { return riding; }, tapRideable: tapRideable, dismount: dismount, makeBeast: function (k, x, z) { var a = makeBeast(k, x, z); animals.push(a); return a; }, collectAll: collectAll, DROPS: function () { return DROPS; }, FALLS: function () { return FALLS; }, SAPS: function () { return SAPS; }, growTree: growTree, CHESTS: function () { return CHESTS; }, openChest: openChest, skyLight: skyLight, startFall: startFall, setBlock: setBlock, atlasURL: function () { return atlas.toDataURL(); }, JOBS: function () { return JOBS; }, smeltTick: smeltTick, SMELT: function (v) { SMELT_SEC = v; }, WEAR: function () { return WEAR; }, mineInfo: mineInfo, HEAT: function () { return HEAT; }, fuelLeft: fuelLeft, canPlace: canPlace, wearTool: function (t) { wearTool(t); bagChanged(); }, P: P, teleport: teleport, start: function () { startGame(); }, S: S, act: act, pickCenter: pickCenter, setUI: showUI, openPanel: openPanel,
    BAG: function () { return BAG; }, tapAt: function (x, y) { tapAt(x, y); }, enc: function () { return encodePlot(myPlot); }, dec: function (d) { plotData[0] = null; decodePlot(0, d, true); return !!plotData[0]; }, fakeLogin: function () { client = null; me = { id: 'test' }; myPlot = 0; }, setHot: function (i, id) { HOTBAR[i] = id; setSel(i, true); }, plotOrigin: plotOrigin, collides: collides, animals: function () { return animals; }, setDay: function (p) { dayT = DAY_LEN * p; }, rain: function (on) { rainOn = on; rain = on ? 1 : 0; rainTimer = 999; }, dex: function () { return DEX; }, q: function () { return qStep; }, camera: function () { return camera; }, counts: function () { return [animals.length, birds.length, fishes.length]; }, give: function (id, n) { give(id, n); bagChanged(); }, travel: travel, mineAt: function (dt) { mineTick(pickCenter(), dt); }, terrain: function (x, z) { terrain(x, z); return { h: T.h, top: T.top, wtop: T.wtop, reg: T.reg }; }, get: get, cols: function () { var n = 0; for (var i = 0; i < COLS.length; i++) if (COLS[i]) n++; return n; }, meshed: function () { var n = 0; for (var i = 0; i < meshedCols.length; i++) if (meshedCols[i]) n++; return n; }, mapRow: function () { return mapRow; }, setTab: function (t) { invTab = t; renderInv(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
