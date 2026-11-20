/* ⚠ 이 파일은 ark-src/js/ 조각을 합쳐 만든다. 직접 고치지 말고 조각을 고친 뒤 python ark-src/build.py (ark-src/README.md) */
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
  var TS = 16, ACOLS = 8, AROWS = 64, TILE = {}, TILE_AVG = [], tileCount = 0;
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
    // 농사·먹을 것
    tile('seed', function (px, R) { clear(px); [[5, 9], [8, 6], [10, 10], [7, 11], [11, 7], [6, 7]].forEach(function (c) { px(c[0], c[1], 0xc8a050, 1.1); px(c[0] + 1, c[1], 0xa07a30); px(c[0], c[1] + 1, 0x8a6420); }); });
    tile('wheat', function (px, R) {
      clear(px);
      for (var s = 0; s < 3; s++) { var bx = 4 + s * 3; for (var y = 5; y < 15; y++) px(bx + (y < 9 ? 0 : (y - 9) >> 2), y, 0xb89a40, 0.9 + R() * 0.2); for (var g = 1; g < 6; g++) { px(bx - 1, g + (s & 1), 0xe0c050, 1.1); px(bx + 1, g + 1 - (s & 1), 0xd0b040); } }
    });
    tile('bread', function (px, R) {
      clear(px);
      for (var y = 5; y < 12; y++) for (var x = 2; x < 14; x++) { var dx = (x - 7.5) / 6, dy = (y - 8.5) / 3.6; if (dx * dx + dy * dy > 1) continue; px(x, y, y < 7 ? 0xd89a4a : 0xb87a34, 0.9 + R() * 0.2); }
      [4, 7, 10].forEach(function (x) { px(x, 6, 0xf0d090); px(x + 1, 7, 0xf0d090); });
    });
    tile('fig', function (px, R) {
      clear(px);
      for (var y = 4; y < 14; y++) for (var x = 3; x < 13; x++) { var dx = (x - 8) / 4.6, dy = (y - 9.5) / (y < 8 ? 4 : 4.5); if (dx * dx + dy * dy > 1) continue; px(x, y, 0x6a3a6a, 0.85 + R() * 0.3 + (x < 7 && y < 9 ? 0.25 : 0)); }
      px(8, 3, 0x5a7a2a); px(8, 2, 0x5a7a2a); px(9, 2, 0x6a8a3a);
    });
    for (var cst = 0; cst < 4; cst++) (function (st) {
      tile('crop' + st, function (px, R) {
        clear(px);
        var h = [5, 9, 13, 14][st], col = st < 3 ? 0x5aa03a : 0xc8a040, head = st >= 2 ? (st === 3 ? 0xe0c050 : 0x9ac050) : 0;
        for (var c = 1; c < 16; c += 3) { var hh = h - ((c * 7) % 3); for (var y = TS - hh; y < TS; y++) px(c, y, col, 0.85 + R() * 0.3); if (head) for (var y2 = TS - hh; y2 < TS - hh + 4; y2++) { px(c - 1, y2, head); px(c + 1, y2 + 1, head, 0.85); } }
      });
    })(cst);
    // 침대·레버·벽 횃불
    tile('bedTop', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, y < 5 ? 0xf0ece0 : 0xb03a3a, (y < 5 ? 0.95 : 0.9) + R() * 0.1 - (y === 5 ? 0.2 : 0)); });
    tile('bedSide', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, y < 7 ? 0xb03a3a : (y < 9 ? 0xf0ece0 : 0x8a6236), 0.9 + R() * 0.12); });
    tile('lever', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, (x > 5 && x < 10) ? 0x8a6236 : 0x8f8f8b, 0.85 + R() * 0.25); });
    tile('wtorch', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, y < 4 ? (y < 2 ? 0xfff0a0 : 0xffb030) : 0x7a5430, 0.9 + R() * 0.15); });
    // 양털 블록(출 25:4 청색 자색 홍색)
    [['woolW', 0xeeeae0], ['woolB', 0x2f5fb0], ['woolV', 0x7a3a9a], ['woolR', 0xc0303a]].forEach(function (w) {
      tile(w[0], function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var k = 0.9 + R() * 0.12; if ((x + y * 2) % 5 === 0) k -= 0.07; if ((x * 2 + y) % 7 === 0) k += 0.05; px(x, y, w[1], k); } });
    });
    tile('sword', function (px) {
      clear(px);
      for (var i = 0; i < 9; i++) { px(5 + i, 10 - i, 0xe8eef5, 1.1); px(6 + i, 10 - i, 0xb8c0c8); px(5 + i, 11 - i, 0x9aa2aa, 0.9); }
      for (var g = 0; g < 6; g++) px(2 + g, 8 + g, 0xf0c840);   // 금 손잡이 가로대
      px(3, 12, 0x8a6236); px(2, 13, 0x8a6236); px(1, 14, 0xf0c840); px(14, 1, 0xffffff);
    });
    tile('shelf', function (px, R) {   // 책장: 위아래 나무 판, 두 칸에 알록달록한 책
      var BK = [0xb03a3a, 0x3a6ab0, 0x3a8a4a, 0xc8a040, 0x7a3a9a, 0x8a5a32];
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        if (y === 0 || y === 7 || y === 8 || y === 15 || x === 0 || x === 15) { px(x, y, 0xa77a48, 0.8 + R() * 0.15); continue; }
        var shelf = y < 7 ? 0 : 1, col = BK[((x * 7 + shelf * 3) / 2 | 0) % BK.length], top = shelf ? 9 : 1;
        if ((x + shelf) % 5 === 4) { px(x, y, 0x3a2614); continue; }
        px(x, y, col, y === top ? 1.25 : 0.85 + R() * 0.15);
      }
    });
    tile('sbrick', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var row = y >> 3, mortar = y % 8 === 7 || (x + row * 4) % 8 === 7;
        px(x, y, 0x9a9a96, mortar ? 0.68 : 0.9 + R() * 0.16 - (y % 8 === 0 ? 0 : 0.03));
      }
    });
    tile('lantern', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var frame = x < 2 || x > 13 || y < 2 || y > 13;
        px(x, y, frame ? 0x3a3a3a : (y > 9 ? 0xffd860 : 0xfff0b0), frame ? 0.9 : 0.95 + R() * 0.1);
      }
    });
    // 열두 보석: 광석(돌 속 결정), 보석(깎은 모양), 기초석(테두리 있는 보석 블록)
    GEMS.forEach(function (g, i) {
      if (!g) return;
      tile('gemOre' + i, function (px, R, noise) {
        noise(0x8f8f8b, 0.14);
        [[3, 3], [10, 4], [6, 9], [12, 11], [3, 12]].forEach(function (c, k) {
          for (var dy = 0; dy < 3; dy++) for (var dx = 0; dx < 2 + (k & 1); dx++) px(c[0] + dx, c[1] + dy, dy === 0 ? g[2] : g[1], 0.9 + R() * 0.25);
          px(c[0], c[1], 0xffffff, 1);
        });
      });
      tile('gem' + i, function (px) {
        clear(px);
        for (var y = 3; y < 14; y++) { var w = y < 7 ? (y - 2) : (14 - y) * 0.75; for (var x = Math.round(8 - w); x <= Math.round(7 + w); x++) px(x, y, y < 7 ? g[2] : g[1], x < 8 ? 1.15 : 0.85); }
        px(6, 5, 0xffffff); px(7, 4, 0xffffff);
      });
    });
    FS_NAMES.forEach(function (n, i) {
      var g = GEMS[i] || ['청옥', 0x2a5ad0, 0x7aa0f0];
      tile('fstone' + i, function (px, R) {
        for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
          var edge = x === 0 || y === 0 || x === 15 || y === 15, in2 = x > 2 && y > 2 && x < 13 && y < 13;
          px(x, y, edge ? 0xe8c33c : (in2 ? g[2] : g[1]), edge ? 1 : 0.85 + R() * 0.2 + ((x + y) % 7 === 0 ? 0.3 : 0));
        }
      });
    });
    tile('lampstand', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0xb8962e, 0.8 + R() * 0.3); });
    tile('lampstandLit', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, y < 5 ? 0xfff0a0 : 0xe8c33c, 0.95 + R() * 0.1); });
    tile('pearl', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var v = Math.sin(x * 0.7 + y * 0.4) * 0.5 + 0.5; px(x, y, v > 0.5 ? 0xf4f0ff : 0xffeef4, 0.92 + v * 0.1 + R() * 0.04); }
    });
    tile('socket', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var hole = x > 3 && x < 12 && y > 3 && y < 12; px(x, y, hole ? 0x2a2a2a : 0x9a9a96, hole ? 0.8 + R() * 0.2 : 0.85 + R() * 0.2); }
    });
    tile('goldst', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0xf0c840, 1 + Math.sin((x + y) * 0.5) * 0.08 + R() * 0.06 + ((x - y + 16) % 9 === 0 ? 0.2 : 0)); });
    tile('citywall', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var row = y >> 2, mortar = y % 4 === 3 || (x + (row % 2) * 4) % 8 === 7; px(x, y, 0xa84a38, mortar ? 0.7 : 0.88 + R() * 0.2); }
    });
    tile('lifeleaf', function (px, R) {
      var FR = [0xd03a3a, 0xf0c040, 0x8a3ab0, 0xf08a30, 0x3a8ad0];
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0x3aa04a, 0.75 + R() * 0.45);
      for (var k = 0; k < 4; k++) { var fx = (k * 5 + 2) % 14 + 1, fy = (k * 7 + 3) % 13 + 1; px(fx, fy, FR[k % 5], 1.1); px(fx + 1, fy, FR[k % 5]); px(fx, fy + 1, FR[k % 5], 0.85); }
    });
    // 눕힌 통나무 옆면: 세운 통나무 옆면을 돌려서
    tile('logSideH', function (px) {
      var t = TILE.logSide, d = actx.getImageData((t % ACOLS) * TS, Math.floor(t / ACOLS) * TS, TS, TS).data;
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var o = (x * TS + y) * 4; px(x, y, (d[o] << 16) | (d[o + 1] << 8) | d[o + 2]); }
    });
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
    tile('trapdoor', function (px, R) {   // 다락문: 판자 두 줄 + 가운데 창 두 개
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var frame = x < 2 || x > 13 || y < 2 || y > 13, hole = !frame && (y > 3 && y < 7 || y > 8 && y < 12) && (x > 3 && x < 7 || x > 8 && x < 12);
        px(x, y, hole ? 0x4a3420 : 0xa77a48, (frame ? 0.8 : 1) * (0.92 + R() * 0.14));
      }
    });
    tile('frame', function (px, R) {   // 액자: 나무 테두리 + 가죽 바탕
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var edge = x < 2 || x > 13 || y < 2 || y > 13;
        px(x, y, edge ? 0x8a5a2b : 0x6b4a33, (edge ? (x + y) % 3 ? 1 : 0.85 : 0.9 + R() * 0.12));
      }
    });
    // 금 가는 모습 4단계(캐는 중)
    var lines = []; var CR = mkRand(4242);
    for (var l = 0; l < 8; l++) { var p = [], x = 8 + (CR() * 4 - 2 | 0), y = 8 + (CR() * 4 - 2 | 0), dx = CR() < 0.5 ? -1 : 1, dy = CR() < 0.5 ? -1 : 1; for (var s = 0; s < 9; s++) { p.push([x, y]); if (CR() < 0.6) x += dx; if (CR() < 0.6) y += dy; } lines.push(p); }
    for (var st = 1; st <= 8; st++) {
      (function (st) {
        tile('crack' + st, function (px) { clear(px); for (var i = 0; i < st; i++) lines[i].slice(0, 2 + st).forEach(function (q) { px(q[0], q[1], 0x111111, 1, 220); }); });
      })(st);
    }
    // 건축·장식과 채집 자원의 픽셀 무늬.
    tile('marble', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var vein = (x + y * 2 + Math.floor(Math.sin(y * .6) * 3) + 32) % 16;
        px(x, y, vein < 2 ? 0xa5aeb2 : 0xe3e1d9, .93 + R() * .13);
      }
    });
    tile('alabaster', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        px(x, y, 0xe1bd8e, .97 + Math.sin(y * .85 + x * .2) * .065 + R() * .045);
      }
    });
    tile('roofFlat', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
        var seam = y % 4 === 0 || (x + Math.floor(y / 4) * 4) % 8 === 0;
        px(x, y, 0xad7752, seam ? .73 : .95 + R() * .1);
      }
    });
    [['blueRug',0x375c91,0xecd3a0], ['goldRug',0xc08d3b,0x6d382c],
     ['reedMat',0xc69e59,0x8a693e], ['wovenCloth',0x89518a,0xecd3a0],
     ['villageFlag',0x903b36,0xf6cf76]].forEach(function (design) {
      tile(design[0], function (px, R) {
        for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) {
          var border = x === 1 || y === 1 || x === 14 || y === 14;
          var pattern = design[0] === 'reedMat' ? (x + (y % 2) * 2) % 4 === 0 :
            Math.abs(x - 7.5) + Math.abs(y - 7.5) === 5 || (x + y) % 11 === 0;
          px(x, y, border || pattern ? design[2] : design[1], .94 + R() * .11);
        }
      });
    });
    [['saltCrystal',0xf1f0e7,0xc6cfce], ['flintChip',0x43505d,0x9ba8a9],
     ['striker',0x716b6a,0xbdac91], ['redEarth',0xa74732,0xd18557],
     ['seaPearl',0xe9e6da,0xfff8ec], ['redCoral',0xb94c3b,0xf08764]].forEach(function (art) {
      tile(art[0], function (px, R) {
        clear(px);
        for (var y = 2; y < 14; y++) for (var x = 2; x < 14; x++) {
          var dx = x - 7.5, dy = y - 7.5;
          var visible = art[0] === 'seaPearl' ? dx*dx + dy*dy < 25 :
            art[0] === 'redCoral' ? (Math.abs(dx) < 1.5 || (y < 9 && Math.abs(Math.abs(dx) - (10-y)*.56) < 1.2)) :
            art[0] === 'striker' ? Math.abs(dx) < 5 && Math.abs(dy) < 5 && (x < 6 || y < 5 || y > 10) :
            Math.abs(dx * .8) + Math.abs(dy) < 6;
          if (visible) px(x, y, y < 6 && x < 9 ? art[2] : art[1], .94 + R() * .1);
        }
      });
    });
    drawExpansionTiles();
  }

