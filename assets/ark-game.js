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
    // 레일: 자갈 바닥 + 나무 침목 + 쇠 레일 두 줄(위가 북쪽). 굽은 것은 두 변을 잇는 사분원
    function railTile(name, kind, gold) {
      tile(name, function (px, R) {
        for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0x7d7266, 0.8 + R() * 0.3);
        var C = { 2: [16, -1], 3: [16, 16], 4: [-1, 16], 5: [-1, -1] }[kind];
        for (var y2 = 0; y2 < TS; y2++) for (var x2 = 0; x2 < TS; x2++) {
          var a, b;   // a: 레일을 따라가는 값, b: 가로지르는 값(0~15)
          if (kind === 0) { a = y2; b = x2; } else if (kind === 1) { a = x2; b = y2; }
          else { var r = Math.hypot(x2 + 0.5 - C[0], y2 + 0.5 - C[1]); b = r - 0.5; a = Math.atan2(y2 + 0.5 - C[1], x2 + 0.5 - C[0]) * 8; if (b < 0 || b > 15.5) continue; }
          var tie = ((Math.floor(a) % 4) + 4) % 4 < 2 && b > 1 && b < 14.5, rail = Math.abs(b - 3.5) < 0.8 || Math.abs(b - 11.5) < 0.8;
          if (rail) px(x2, y2, gold ? 0xe8c53a : 0xb9bec2, 0.9 + R() * 0.15); else if (tie) px(x2, y2, 0x7a5232, 0.85 + R() * 0.2);
        }
      });
    }
    ['', 'F'].forEach(function (g) { railTile('railNS' + g, 0, g); railTile('railEW' + g, 1, g); railTile('railC2' + g, 2, g); railTile('railC3' + g, 3, g); railTile('railC4' + g, 4, g); railTile('railC5' + g, 5, g); });
    tile('railSide', function (px, R) { for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, 0x5e5a55, 0.85 + R() * 0.2); });
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
    // 남쪽 새 지역(11/20): 백향목·소금·붉은 바위
    tile('cedarBark', function (px, R) {
      var col = []; for (var x = 0; x < TS; x++) col.push(0.8 + R() * 0.32);
      for (var y = 0; y < TS; y++) for (var x2 = 0; x2 < TS; x2++) { var k = col[x2] + (R() - 0.5) * 0.08; if ((x2 * 7 + y * 3) % 11 === 0) k *= 0.78; px(x2, y, 0x8a4f32, k); }
    });
    tile('cedarTop', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var d = Math.hypot(x - 7.5, y - 7.5); if (d > 6.6) px(x, y, 0x7a4430, 0.9 + R() * 0.15); else px(x, y, 0xc98a5e, (Math.floor(d * 1.1) % 2 ? 0.86 : 1.0) + (R() - 0.5) * 0.06); }
    });
    tile('cedarLeaf', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var v = R(), k = 0.82 + v * 0.3; if (v < 0.16) k = 0.55; if ((x + y * 2) % 5 === 0 && v > 0.5) k = 1.18; px(x, y, 0x2f6b4a, k); }
    });
    tile('saltTop', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var crack = (x * 5 + y * 3) % 13 === 0 || (x * 2 - y * 7 + 64) % 17 === 0; px(x, y, crack ? 0xc9c4b4 : 0xf2efe6, crack ? 0.95 : 0.96 + R() * 0.06); }
    });
    tile('saltSide', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) px(x, y, y < 4 ? 0xf2efe6 : 0xd9c896, y < 4 ? 0.95 + R() * 0.07 : 0.93 + R() * 0.1);
    });
    tile('saltRock', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var f = (x * 3 + y * 5) % 9 === 0; px(x, y, f ? 0xbfc6c6 : 0xe9e7df, 0.92 + R() * 0.1); }
    });
    tile('redRock', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var band = (y + Math.floor(Math.sin(x * 0.7) * 1.3) + 16) % 8 < 2; px(x, y, band ? 0xb2603c : 0xc97a4c, 0.92 + R() * 0.1); }
    });
    tile('redRock2', function (px, R) {
      for (var y = 0; y < TS; y++) for (var x = 0; x < TS; x++) { var band = (y + 16) % 5 < 2; px(x, y, band ? 0xe0a774 : 0xa94f33, 0.92 + R() * 0.1); }
    });
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
  for (var wl = 170; wl < 174; wl++) LIGHTS[wl] = 1;   // 벽 횃불
  LIGHTS[199] = 1;   // 등롱
  LIGHTS[212] = 1;   // 켜진 등잔대
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
  // ── 2026-11-20 더한 것: 다락문(위로 여는 문)·액자 ──
  var TRAP = 900, FRAME = 916;
  for (var tf = 0; tf < 4; tf++) for (var th = 0; th < 2; th++) for (var to = 0; to < 2; to++) {
    var tid = TRAP + tf * 4 + th * 2 + to; if (B[tid]) throw new Error('블록 번호가 겹쳐요: ' + tid);
    regShape(tid, '다락문', 'trapdoor', TRAP, GOPHER, tf, to); SHAPE[tid].h = th; B[tid][1] = B[tid][2] = B[tid][3] = 'trapdoor';
  }
  for (var ff = 0; ff < 4; ff++) { if (B[FRAME + ff]) throw new Error('블록 번호가 겹쳐요: ' + (FRAME + ff)); regShape(FRAME + ff, '액자', 'frame', FRAME, GOPHER, ff); B[FRAME + ff][1] = B[FRAME + ff][2] = B[FRAME + ff][3] = 'frame'; }
  // ── 2026-11-20 레일(수레 길): 0 남북 · 1 동서 · 2 북-동 · 3 동-남 · 4 남-서 · 5 서-북 · 6~9 북·동·남·서로 올라가는 비탈 ──
  var RAIL0 = 940, CART = 950, RAILF0 = 960;   // RAILF0: 빠른 레일(금) — 지나가면 수레가 빨라짐
  var RAIL_TILE = ['railNS', 'railEW', 'railC2', 'railC3', 'railC4', 'railC5', 'railNS', 'railEW', 'railNS', 'railEW'];
  [[RAIL0, '레일', ''], [RAILF0, '빠른 레일', 'F']].forEach(function (rr) {
    for (var rs = 0; rs < 10; rs++) { var rid = rr[0] + rs; if (B[rid]) throw new Error('블록 번호가 겹쳐요: ' + rid); regShape(rid, rr[1], 'mrail', rr[0], STONE, rs); B[rid][1] = RAIL_TILE[rs] + rr[2]; B[rid][2] = B[rid][3] = 'railSide'; }
  });
  if (B[CART]) throw new Error('번호가 겹쳐요: ' + CART);
  // ── 2026-11-18 더한 것: 농사(159~166), 침대·레버·벽 횃불·유리판·표지판(167~178), 양털 블록(179~182), 반 블록·계단(183~192), 눕힌 통나무(193~194)
  var SEED = 159, WHEAT = 160, BREAD = 161, FIG = 162, CROP0 = 163, BED = 167, LEVER = 168, WTORCH = 170, PANE = 174, SIGN = 175;
  var WOOL_W = 179, WOOL_B = 180, WOOL_V = 181, WOOL_R = 182, SLAB_L = 183, SLAB_P = 184, STAIR_L = 185, STAIR_P = 189, LOG_X = 193, LOG_Z = 194;
  B[SEED] = ['밀 씨', 'seed', 'seed', 'seed', 0, 0, 'item']; B[WHEAT] = ['밀', 'wheat', 'wheat', 'wheat', 0, 0, 'item'];
  B[BREAD] = ['떡', 'bread', 'bread', 'bread', 0, 0, 'item']; B[FIG] = ['무화과', 'fig', 'fig', 'fig', 0, 0, 'item'];
  for (var cs0 = 0; cs0 < 4; cs0++) B[CROP0 + cs0] = ['밀(' + ['싹', '자람', '이삭', '익음'][cs0] + ')', 'crop' + cs0, 'crop' + cs0, 'crop' + cs0, 1, 0, 'plant'];
  B[WOOL_W] = ['흰 양털 블록', 'woolW', 'woolW', 'woolW']; B[WOOL_B] = ['청색 양털 블록', 'woolB', 'woolB', 'woolB'];
  B[WOOL_V] = ['자색 양털 블록', 'woolV', 'woolV', 'woolV']; B[WOOL_R] = ['홍색 양털 블록', 'woolR', 'woolR', 'woolR'];
  B[LOG_X] = ['통나무', 'logTop', 'logSideH', 'logSideH']; B[LOG_Z] = ['통나무', 'logTop', 'logSideH', 'logSideH'];
  var CHAIR = 510;
  var CHAIR_SEAT = .56;
  for (var cf = 0; cf < 4; cf++) regShape(CHAIR + cf, '나무 의자', 'chair', CHAIR, GOPHER, cf);
  regShape(BED, '침대', 'bed', BED, GOPHER); B[BED][1] = 'bedTop'; B[BED][2] = 'bedSide'; B[BED][3] = 'plankG';
  regShape(LEVER, '레버', 'lever', LEVER, STONE); regShape(LEVER + 1, '레버', 'lever', LEVER, STONE, 0, true); B[LEVER][1] = B[LEVER][2] = B[LEVER][3] = B[LEVER + 1][1] = B[LEVER + 1][2] = B[LEVER + 1][3] = 'lever';
  for (var wt = 0; wt < 4; wt++) { regShape(WTORCH + wt, '횃불', 'wtorch', TORCH, GOPHER, wt); B[WTORCH + wt][1] = B[WTORCH + wt][2] = B[WTORCH + wt][3] = 'wtorch'; B[WTORCH + wt][5] = 1; }
  regShape(PANE, '유리판', 'pane', PANE, GLASS);
  for (var sg = 0; sg < 4; sg++) regShape(SIGN + sg, '표지판', 'sign', SIGN, GOPHER, sg);
  regShape(SLAB_L, '석회암 반 블록', 'slab', SLAB_L, LIME); regShape(SLAB_P, '역청 나무 반 블록', 'slab', SLAB_P, PITCH);
  for (var sf = 0; sf < 4; sf++) { regShape(STAIR_L + sf, '석회암 계단', 'stair', STAIR_L, LIME, sf); regShape(STAIR_P + sf, '역청 나무 계단', 'stair', STAIR_P, PITCH, sf); }
  var SWORD = 195; B[SWORD] = ['성령의 검', 'sword', 'sword', 'sword', 0, 0, 'item'];   // 엡 6:17 — 어둠의 그림자를 물리침
  // 집 꾸미기(2026-11-18 대저택): 책장·돌 벽돌·카펫·등롱
  var SHELF = 196, SBRICK = 197, CARPET = 198, LANTERN = 199;
  B[SHELF] = ['책장', 'plankG', 'shelf', 'plankG']; B[SBRICK] = ['돌 벽돌', 'sbrick', 'sbrick', 'sbrick'];
  regShape(CARPET, '카펫', 'carpet', CARPET, WOOL_R); regShape(LANTERN, '등롱', 'lantern', LANTERN, GOPHER); B[LANTERN][1] = B[LANTERN][2] = B[LANTERN][3] = 'lantern'; B[LANTERN][5] = 1;
  // ── 「본향을 향하여」 이야기(2026-11-18): 열두 보석 광석(200~210), 보석(300~310), 기초석 블록(230~241),
  //    등잔대(211 꺼짐·212 켜짐), 진주 문(213), 기초석 자리(214), 정금 길(215), 성곽(216), 생명나무 잎(217) ──
  // [이름, 진한 색, 밝은 색, 나오는 곳(T.reg 또는 'any'), y 아래, y 위, 드물기, 곡괭이 단계]
  var GEMS = [
    ['벽옥', 0xa04030, 0xd06a50, 'west', 20, 60, 0.00012, 2], ['남보석', 0x2a4ab0, 0x6a8ae0, 'sea', 1, 14, 0.0002, 3],
    ['옥수', 0xc8c0b0, 0xe8eef8, 'lake', 1, 12, 0.00025, 2], ['녹보석', 0x1f8a4a, 0x60d090, 'east', 1, 12, 0.00012, 3],
    ['홍마노', 0xb0402e, 0xf0e0d0, 'desert', 1, 16, 0.00008, 2], ['홍보석', 0xc8102e, 0xff6a7a, 'desert', 1, 7, 0.0001, 4],
    ['황옥', 0xb8c030, 0xf0f080, 'oasis', 1, 14, 0.0006, 3], ['녹옥', 0x309a8a, 0x90e0d0, 'sea', 1, 8, 0.00015, 4],
    ['담황옥', 0xe0a840, 0xffe0a0, 'ararat', 55, 79, 0.00012, 3], ['비취옥', 0x70b030, 0xb8e888, 'ararat', 1, 10, 0.0001, 4],
    null /* 열한째 청옥은 원래 있는 청옥 */, ['자수정', 0x7a38a8, 0xc898f0, 'south', 1, 20, 0.00015, 3]
  ];
  var GEM_ORE0 = 200, GEM_ITEM0 = 300, FSTONE0 = 230, LAMPSTAND = 211, PEARL = 213, SOCKET = 214, GOLDST = 215, CITYWALL = 216, LIFELEAF = 217;
  var FS_NAMES = ['벽옥', '남보석', '옥수', '녹보석', '홍마노', '홍보석', '황옥', '녹옥', '담황옥', '비취옥', '청옥', '자수정'];
  function gemOre(i) { return i < 10 ? GEM_ORE0 + i : (i === 11 ? GEM_ORE0 + 10 : ORE_SAPH); }      // 열두 번째 자수정은 210
  function gemItem(i) { return i < 10 ? GEM_ITEM0 + i : (i === 11 ? GEM_ITEM0 + 10 : GEM_SAPH); }
  GEMS.forEach(function (g, i) { if (!g) return; B[gemOre(i)] = [g[0] + ' 광석', 'gemOre' + i, 'gemOre' + i, 'gemOre' + i]; B[gemItem(i)] = [g[0], 'gem' + i, 'gem' + i, 'gem' + i, 0, 0, 'item']; });
  FS_NAMES.forEach(function (n, i) { B[FSTONE0 + i] = [n + ' 기초석', 'fstone' + i, 'fstone' + i, 'fstone' + i]; });
  regShape(LAMPSTAND, '등잔대', 'lampstand', LAMPSTAND, GOPHER); regShape(LAMPSTAND + 1, '켜진 등잔대', 'lampstand', LAMPSTAND, GOPHER, 0, true);
  B[LAMPSTAND][1] = B[LAMPSTAND][2] = B[LAMPSTAND][3] = 'lampstand'; B[LAMPSTAND + 1][1] = B[LAMPSTAND + 1][2] = B[LAMPSTAND + 1][3] = 'lampstandLit'; B[LAMPSTAND + 1][5] = 1;
  B[PEARL] = ['진주 문', 'pearl', 'pearl', 'pearl', 0, 1]; B[SOCKET] = ['기초석 자리', 'socket', 'sbrick', 'sbrick'];
  B[GOLDST] = ['정금 길', 'goldst', 'goldst', 'goldst', 0, 1]; B[CITYWALL] = ['벽옥 성곽', 'citywall', 'citywall', 'citywall'];
  B[LIFELEAF] = ['생명나무 잎', 'lifeleaf', 'lifeleaf', 'lifeleaf'];
  // ── 남쪽 새 지역(11/20): 백향목 숲·광야·소금 바다의 자연 블록 — 캐면 원래 재료(통나무·소금·붉은 흙)로 가방에 들어간다(서버 허용 목록은 그대로) ──
  var CEDAR_LOG = 860, CEDAR_LEAF = 861, SALT_CRUST = 862, SALT_ROCK = 863, RED_ROCK = 864, RED_ROCK2 = 865;
  B[CEDAR_LOG] = ['백향목', 'cedarTop', 'cedarBark', 'cedarTop']; B[CEDAR_LEAF] = ['백향목 잎', 'cedarLeaf', 'cedarLeaf', 'cedarLeaf'];
  B[SALT_CRUST] = ['소금 땅', 'saltTop', 'saltSide', 'sand']; B[SALT_ROCK] = ['소금 바위', 'saltRock', 'saltRock', 'saltRock'];
  B[RED_ROCK] = ['붉은 바위', 'redRock', 'redRock', 'redRock']; B[RED_ROCK2] = ['붉은 바위 줄무늬', 'redRock2', 'redRock2', 'redRock2'];
  // 반 블록은 가방에는 아래쪽 번호 하나로, 세계에는 위아래 번호를 따로 저장한다.
  var SLABS = [[SLAB_G,GOPHER,242],[SLAB_S,STONE,243],[SLAB_B,BRICK,244],
    [SLAB_L,LIME,245],[SLAB_P,PITCH,246],[218,DIRT,247],[219,20,248],
    [220,11,249],[221,13,250],[222,22,251],[223,PATH,252],[224,GLASS,253],
    [225,WOOL_W,254],[226,WOOL_B,255],[227,WOOL_V,43],[228,WOOL_R,57],[229,LOG,58]];
  var SLAB_TOP = {}, SLAB_MATERIAL = {};
  SLABS.forEach(function (s) {
    var id = s[0], mat = s[1], upper = s[2];
    if (B[upper] || (id >= 218 && B[id])) throw new Error('반 블록 번호가 겹쳐요');
    if (!SHAPE[id]) regShape(id, B[mat][0] + ' 반 블록', 'slab', id, mat);
    regShape(upper, B[id][0], 'slab', id, mat, 1);
    SLAB_TOP[id] = upper; SLAB_MATERIAL[id] = mat;
  });
  // 건축 1묶음. 놓이는 번호는 기존 한 바이트 저장 범위 안에 둔다.
  var PILLAR = 96, ARCH = 97, RAIL = 98, FLAT_ROOF = 99;
  var BLUE_RUG = 134, GOLD_RUG = 135, REED_MAT = 136, FLAG = 137, PATTERN_CLOTH = 138;
  var GATE = 59, GATE_STATES = [[GATE, 68], [69, 133]];
  var SALT = 320, FLINT = 321, STRIKER = 322, MARBLE = 323, ALABASTER = 324, RED_EARTH = 325, SEA_PEARL = 326, CORAL = 327;
  var BUILD_BLOCKS = [
    [PILLAR, '대리석 기둥', 'marble', 'pillar', STONE],
    [ARCH, '설화석고 아치', 'alabaster', 'arch', LIME],
    [RAIL, '돌 난간', 'sbrick', 'rail', SBRICK],
    [FLAT_ROOF, '평평한 옥상 블록', 'roofFlat', 'roof', GOPHER],
    [BLUE_RUG, '파란 카펫', 'blueRug', 'carpet', WOOL_B],
    [GOLD_RUG, '황토색 카펫', 'goldRug', 'carpet', WOOL_W],
    [REED_MAT, '갈대 돗자리', 'reedMat', 'carpet', GOPHER],
    [FLAG, '천 깃발', 'villageFlag', 'flag', GOPHER],
    [PATTERN_CLOTH, '무늬 천', 'wovenCloth', 'cloth', GOPHER]
  ];
  var BUILD_ITEMS = [
    [SALT,'소금','saltCrystal'], [FLINT,'부싯돌','flintChip'], [STRIKER,'부시','striker'],
    [MARBLE,'대리석','marble'], [ALABASTER,'설화석고','alabaster'],
    [RED_EARTH,'붉은 흙','redEarth'], [SEA_PEARL,'바다 진주','seaPearl'], [CORAL,'산호','redCoral']
  ];
  function buildShape(id, name, texture, type, material, facing, open, base) {
    if (B[id]) throw new Error('건축 블록 번호가 겹쳐요: ' + id);
    regShape(id, name, type, base || id, material, facing, open);
    B[id][1] = B[id][2] = B[id][3] = texture;
  }
  BUILD_BLOCKS.forEach(function (d) { buildShape(d[0], d[1], d[2], d[3], d[4]); });
  GATE_STATES.forEach(function (states, axis) {
    states.forEach(function (id, open) { buildShape(id, '울타리 문', 'plankG', 'gate', GOPHER, axis, open, GATE); });
  });
  BUILD_ITEMS.forEach(function (d) {
    if (B[d[0]]) throw new Error('자원 번호가 겹쳐요: ' + d[0]);
    B[d[0]] = [d[1], d[2], d[2], d[2], 0, 0, 'item'];
  });
  // 2묶음. 설치물 400~457, 가방에만 들어가는 물건 600~637.
  var FARM_SOIL = 400, OVEN = 401, MILL = 402, WINE_PRESS = 403, OIL_PRESS = 404, COOK_POT = 405;
  var HOE = 624, FISH_ROD = 625, FISH_NET = 626, RAW_FISH = 627, RAW_LAMB = 628,
      HONEY = 629, POMEGRANATE = 630, STEW = 631, COOKED_FISH = 632, COOKED_LAMB = 633,
      FLATBREAD = 634, FLOUR = 635, WINE = 636, OLIVE_OIL = 637;
  // 이름, 거둘 것, 식물색, 열매색, 여러 번 거두는 작물, 나무 높이.
  var FARM_TYPES = [
    ['보리','보리',0x86a64b,0xc6a551], ['포도나무','포도',0x4b803e,0x75428b,true],
    ['올리브나무','올리브',0x78904b,0x353e33,true,2.2], ['렌틸','렌틸콩',0x508044,0xaf784d],
    ['오이','오이',0x557a39,0x91bf55], ['수박','수박',0x477c44,0x8cbe62],
    ['마늘','마늘',0x739044,0xd7d2ba], ['양파','양파',0x719943,0xb8824c],
    ['부추','부추',0x5c8e3e,0x97ab51], ['무화과나무','무화과',0x438648,0x95547d,true,2.2],
    ['종려나무','대추야자',0x558647,0xad6742,true,2.7], ['석류나무','석류',0x567d38,0xb64643,true,2.1]
  ];
  var FARM_PLANTS = {}, FARM_SEEDS = {};
  function expansionItem(id, name, tileName) { B[id] = [name,tileName,tileName,tileName,0,0,'item']; }
  function expansionBlock(id, name, tileName, light) { B[id] = [name,tileName,tileName,tileName,0,light || 0]; if (light) LIGHTS[id] = 1; }
  expansionBlock(FARM_SOIL, '경작지', 'tilled');
  [[OVEN,'화덕과 솥','oven2'], [MILL,'맷돌','mill2'], [WINE_PRESS,'포도주 틀','wine2'], [OIL_PRESS,'기름 짜는 틀','oil2'],[COOK_POT,'솥','pot2']]
    .forEach(function(d) { expansionBlock(d[0],d[1],d[2]); });
  var VILLAGE_FISH={ '강':680, '호수':681, '바다':682 };
  var MANNA = 545;   // 광야의 만나(출 16장)
  var FOOD_ART = [[MANNA,'만나',0xf3efdc],[680,'강의 은빛 물고기',0x84b1ac],[681,'호수의 줄무늬 물고기',0x76a495],[682,'바다의 푸른 물고기',0x527b9c],
    [HOE,'괭이',0x92754c],[FISH_ROD,'낚싯대',0xa98555],[FISH_NET,'그물',0xc8b787],
    [RAW_FISH,'물고기',0x8a9fa9],[RAW_LAMB,'손질한 양고기',0xc77968],[HONEY,'꿀',0xdfa437],
    [POMEGRANATE,'석류',0xb64643],[STEW,'렌틸콩죽',0xaa5c3d],[COOKED_FISH,'구운 생선',0xb77b41],
    [COOKED_LAMB,'구운 양고기',0x9e5940],[FLATBREAD,'누룩 없는 빵',0xddb475],
    [FLOUR,'가루',0xebd8b3],[WINE,'포도주',0x803b56],[OLIVE_OIL,'올리브 기름',0x9e8e43]];
  FOOD_ART.forEach(function(d) { expansionItem(d[0],d[1],'farmItem'+d[0]); });
  FARM_TYPES.forEach(function(d, i) {
    var spec = { base:410+i*4, seed:600+i, harvest:i===9 ? FIG : (i===11 ? POMEGRANATE : 612+i), perennial:!!d[4], height:d[5] || 1 };
    FARM_SEEDS[spec.seed] = spec;
    expansionItem(spec.seed,d[0]+(d[4] ? ' 묘목' : ' 씨'),'farmSeed'+i);
    if (i!==9 && i!==11) expansionItem(spec.harvest,d[1],'farmFruit'+i);
    for (var s=0; s<4; s++) {
      var id=spec.base+s, art='farmPlant'+i+'_'+s;
      B[id]=[d[0]+' · '+['싹','자라는 중','열매 맺는 중','다 자람'][s],art,art,art,1,0,'plant'];
      FARM_PLANTS[id]=spec;
    }
  });
  function drawExpansionTiles() {
    function icon(name,color,mode) {
      tile(name,function(px,R) {
        clear(px);
        for(var y=2;y<14;y++) for(var x=2;x<14;x++) {
          var dx=x-7.5,dy=y-7.5;
          var hit=mode==='rod' ? Math.abs(x+y-15)<1.5 || (x===12&&y<11) :
            mode==='net' ? (Math.abs(dx)<5 && Math.abs(dy)<5 && ((x+y)%4===0 || (x-y+16)%4===0 || Math.abs(dx)>3 || Math.abs(dy)>3)) :
            mode==='seed' ? dx*dx+dy*dy*2<22 : dx*dx+dy*dy<31;
          if(hit) px(x,y,color,.87+R()*.22);
        }
      });
    }
    [['tilled',0x69432e],['oven2',0xb06846],['mill2',0x9a9285],['wine2',0x865545],['oil2',0x817149],['pot2',0x5a4a40]].forEach(function(d,i) {
      tile(d[0],function(px,R) {
        for(var y=0;y<16;y++) for(var x=0;x<16;x++) {
          var groove=i===0 ? x%4===0 : (i===1 ? y>8&&x>3&&x<12 : Math.hypot(x-7.5,y-7.5)<4);
          px(x,y,d[1],(groove?.64:.96)+R()*.12);
        }
      });
    });
    FOOD_ART.forEach(function(d){icon('farmItem'+d[0],d[2],d[0]===FISH_ROD||d[0]===HOE?'rod':d[0]===FISH_NET?'net':'food');});
    FARM_TYPES.forEach(function(d,i) {
      icon('farmSeed'+i,d[3],'seed'); icon('farmFruit'+i,d[3],'food');
      for(var s=0;s<4;s++) (function(stage) {
        tile('farmPlant'+i+'_'+stage,function(px,R){
          clear(px);
          for(var y=15;y>=11-stage*3;y--) {
            px(7,y,d[5]?0x725438:d[2]);px(8,y,d[5]?0x725438:d[2]);
            if(y>12&&!d[5]) continue;
            var w=Math.min(6,1+stage+(y%3));
            for(var x=8-w;x<8+w;x++) if((x+y+i)%4!==0) px(x,y,stage===3&&(x+2*y)%5===0?d[3]:d[2],.84+R()*.23);
          }
        });
      })(s);
    });
    drawLifeAndWordTiles();
  }
  // 3묶음. 우물·베틀·그릇·조명·식물은 같은 설치/저장 규칙을 쓴다.
  var WELL=460, LOOM=461, JAR=462, OIL_JAR=463, ALABASTER_JAR=464, OIL_LAMP=465,
      CANDLESTICK=466, CAMPFIRE=467, THORN=468, THISTLE=469, LILY=470,
      LYRE=540, HARP=541, TIMBREL=542, CYMBAL=543, MANGER=548;   // 악기(시 150:3-5) · 구유(성탄)
  var BUCKET=640, WATER_BUCKET=641, WATER_JAR=642, FULL_JAR=643, THREAD=644,
      LINEN=645, WOOL_CLOTH=646, RED_DYE=647, BLUE_DYE=648, GOLD_DYE=649, WELL_BUCKET=650;
  var LIFE_BLOCKS=[
    [WELL,'우물',0x968778,'well'], [LOOM,'베틀',0xa38357,'loom'],
    [JAR,'항아리',0xb46e52,'jar'], [OIL_JAR,'기름 항아리',0x998451,'jar'],
    [ALABASTER_JAR,'옥합',0xe2bb91,'jar'],[OIL_LAMP,'기름 등잔',0xe89e40,'lamp',1],
    [CANDLESTICK,'촛대',0xd8a258,'stand',1],[CAMPFIRE,'모닥불',0xe57c39,'camp',1],
    [THORN,'가시나무',0x656838,'plant'],[THISTLE,'엉겅퀴',0x884d8b,'plant'],[LILY,'백합',0xf5e4a4,'plant'],
    [MANGER,'구유',0xb38550,'manger',1],[LYRE,'수금',0xb8874a,'lyre'],[HARP,'비파',0x8f5f34,'harp'],[TIMBREL,'소고',0xd9b27a,'drum'],[CYMBAL,'제금',0xd2ad3c,'cymbal']
  ];
  var LIFE_ITEMS=[
    [BUCKET,'빈 양동이',0x9e7745],[WATER_BUCKET,'물이 든 양동이',0x4698c8],
    [WATER_JAR,'빈 물동이',0xae6651],[FULL_JAR,'물이 든 물동이',0x6794a5],
    [THREAD,'실',0xecddbb],[LINEN,'베',0xe6ccb1],[WOOL_CLOTH,'모직',0xb59174],
    [RED_DYE,'붉은 염료',0xa34138],[BLUE_DYE,'푸른 염료',0x38678e],[GOLD_DYE,'황토 염료',0xc5a146],
    [WELL_BUCKET,'두레박',0x856746]
  ];
  var EXT_BOXES={
    ditch:[[0,0,0,1,.10,1]],
    feast:[[.08,.64,.08,.92,.78,.92],[.12,0,.12,.27,.64,.27],[.73,0,.12,.88,.64,.27],
      [.12,0,.73,.27,.64,.88],[.73,0,.73,.88,.64,.88]],
    well:[[0,0,0,1,.22,1],[0,.22,0,.21,.72,1],[.79,.22,0,1,.72,1],[.21,.22,0,.79,.72,.21],[.21,.22,.79,.79,.72,1]],
    loom:[[.12,0,.26,.22,1,.63],[.78,0,.26,.88,1,.63],[.22,.22,.40,.78,.73,.49],[.22,.84,.34,.78,1,.57]],
    jar:[[.24,0,.24,.76,.18,.76],[.15,.18,.15,.85,.66,.85],[.31,.66,.31,.69,.9,.69]],
    lamp:[[.2,0,.22,.8,.14,.78],[.34,.14,.34,.66,.23,.66],[.45,.23,.45,.55,.41,.55]],
    stand:[[.19,0,.19,.81,.12,.81],[.43,.12,.43,.57,.6,.57],[.24,.6,.24,.76,.7,.76],[.44,.7,.44,.56,.94,.56]],
    camp:[[.08,0,.08,.92,.12,.92],[.23,.12,.25,.76,.24,.75],[.32,.24,.33,.68,.6,.67]],
    manger:[[.12,.3,.22,.88,.62,.78],[.14,0,.26,.24,.3,.36],[.76,0,.26,.86,.3,.36],[.14,0,.64,.24,.3,.74],[.76,0,.64,.86,.3,.74],[.2,.62,.3,.8,.7,.7]],
    lyre:[[.28,0,.38,.72,.1,.62],[.28,.1,.44,.38,.86,.56],[.62,.1,.44,.72,.86,.56],[.28,.78,.44,.72,.88,.56],[.46,.1,.48,.54,.78,.52]],
    harp:[[.2,0,.34,.8,.12,.66],[.2,.12,.42,.32,.96,.58],[.2,.86,.42,.8,.96,.58],[.68,.12,.42,.8,.86,.58]],
    drum:[[.16,0,.16,.84,.2,.84],[.22,.2,.22,.78,.24,.78]],
    cymbal:[[.45,0,.45,.55,.5,.55],[.2,.5,.2,.8,.56,.8],[.26,.62,.26,.74,.66,.74]]
  };
  LIFE_BLOCKS.forEach(function(d){
    var id=d[0], art='life'+id;
    if(d[3]==='plant') B[id]=[d[1],art,art,art,1,0,'plant'];
    else { buildShape(id,d[1],art,'extension',STONE); SHAPE[id].boxes=d[3]; if(d[4]) { B[id][5]=1; LIGHTS[id]=1; } }
  });
  LIFE_ITEMS.forEach(function(d){ expansionItem(d[0],d[1],'life'+d[0]); });
  function drawLifeAndWordTiles() {
    LIFE_BLOCKS.concat(LIFE_ITEMS).forEach(function(d){
      tile('life'+d[0],function(px,R){
        var plant=d[3]==='plant', item=d[0]>=640;
        if(plant||item) clear(px);
        for(var y=0;y<16;y++) for(var x=0;x<16;x++) {
          var dx=x-7.5, dy=y-7.5;
          if(plant && !(Math.abs(dx)<1.1 || (y>5&&y<13&&Math.abs(dx)<4&&(x+y)%3===0) ||
            (d[0]!==THORN&&y>=3&&y<=6&&Math.abs(dx)<3))) continue;
          if(item && (Math.abs(dx) + Math.abs(dy)*.7 > 6.5)) continue;
          var color=plant && y>6 ? 0x568348 : d[2];
          px(x,y,color,.82+R()*.22+((x+y)%4===0?.1:0));
        }
      });
    });
    drawWordTiles(); drawBowTiles();
  }
  // 4묶음. 말씀·양 돌보기·길 찾기.
  var FIND_MARK=500, FIND_POT=501, FIND_LAMP=502, FIND_SEED=503, DITCH=504, FEAST_TABLE=505,
      FEAST_BREAD=506, FEAST_OLIVE=507, FEAST_FISH=508, FERRY_POST=509;
  var VILLAGE_ART = [
    [FIND_MARK,'발굴 자리','sand','target'], [FIND_POT,'토기 조각 전시','stone','jar'],
    [FIND_LAMP,'옛 등잔 전시','clay','lamp'], [FIND_SEED,'옛 씨앗 전시','sand','jar'],
    [DITCH,'물길','water','ditch'], [FEAST_TABLE,'공동 식탁','plankG','feast'],
    [FEAST_BREAD,'차린 빵','sand','camp'], [FEAST_OLIVE,'차린 올리브','grassTop','camp'],
    [FEAST_FISH,'차린 생선','stone','camp'], [FERRY_POST,'나룻배 표지','plankG','study']
  ];
  VILLAGE_ART.forEach(function (entry) {
    regShape(entry[0],entry[1],'extension',entry[0],STONE,0);
    B[entry[0]][1]=B[entry[0]][2]=B[entry[0]][3]=entry[2];
    SHAPE[entry[0]].boxes=entry[3];
  });
  var ROPE=520, PULLEY=521, COUNTERWEIGHT=522, PRESS_PLATE=523, LIFT=524, WATERWHEEL=525, SLUICE=526;
  var STONE_RAIL=534, WOOD_PILLAR=535, ARCH_SIDE=536;
  var FRONTIER_RECIPES = [
    [ROPE,'밧줄',GOPHER,[[THREAD,3]],'rope'],
    [PULLEY,'도르래',GOPHER,[[GOPHER,2],[STICK,1]],'pulley'],
    [COUNTERWEIGHT,'돌 추',STONE,[[STONE,3],[ROPE,1]],'weight'],
    [PRESS_PLATE,'밟는 발판',GOPHER,[[GOPHER,2],[STONE,1]],'plate'],
    [LIFT,'나무 승강대',GOPHER,[[GOPHER,6],[PULLEY,1]],'lift'],
    [WATERWHEEL,'물레방아',GOPHER,[[GOPHER,5],[STICK,2]],'wheel'],
    [SLUICE,'수문',GOPHER,[[GOPHER,4],[ROPE,1]],'sluice'],
    [STONE_RAIL,'돌 난간',STONE,[[STONE,2]],'rail'],
    [WOOD_PILLAR,'나무 기둥',GOPHER,[[GOPHER,3]],'pillar']
  ];
  FRONTIER_RECIPES.forEach(function (r) { regShape(r[0],r[1],r[4],r[0],r[2]); });
  for (var si=0;si<8;si++) regShape(SLUICE+si,'수문','sluice',SLUICE,GOPHER,si>>1,si%2);
  regShape(ARCH_SIDE,B[ARCH][0],'arch',ARCH,SHAPE[ARCH].mat,1);
  var WORD_SHELF=480, ALTAR=481, SLING_TARGET=482;
  var WORD_SCROLL=660, STAFF=661, HAND_MAP=662, COMPASS=663, SHOFAR=664, SLING=665, ROUND_STONE=666;
  var WORD_BLOCKS=[[WORD_SHELF,'말씀 서재',0x99693e,'study'],[ALTAR,'돌 제단',0x9b9081,'altar'],
    [SLING_TARGET,'물매 연습 표적',0xbb8454,'target']];
  var WORD_ITEMS=[[WORD_SCROLL,'말씀 두루마리',0xead6a2],[STAFF,'양치기 지팡이',0x856145],
    [HAND_MAP,'두루마리 지도',0xdfbf88],[COMPASS,'방향 바늘',0x9f7949],[SHOFAR,'쇼파르',0xd6ab71],
    [SLING,'물매',0x9a7052],[ROUND_STONE,'매끄러운 돌',0xa4adad]];
  EXT_BOXES.study=[[.07,0,.14,.93,.19,.86],[.09,.19,.72,.91,.87,.85],[.07,.52,.2,.93,.62,.74],[.07,.87,.14,.93,1,.86]];
  EXT_BOXES.altar=[[.03,0,.03,.97,.25,.97],[.15,.25,.15,.85,.73,.85],[.03,.73,.03,.97,.9,.97]];
  EXT_BOXES.target=[[.39,0,.38,.61,.65,.62],[.1,.47,.40,.9,1,.60]];
  WORD_BLOCKS.forEach(function(d){
    buildShape(d[0],d[1],'word'+d[0],'extension',STONE); SHAPE[d[0]].boxes=d[3];
  });
  WORD_ITEMS.forEach(function(d){expansionItem(d[0],d[1],'word'+d[0]);});
  // ── 2026-11-20 활과 화살: 어둠의 그림자를 멀리서 물리침 ──
  var BOW = 930, ARROW = 931, SHARD = 933;
  [[BOW, '활'], [ARROW, '화살'], [CART, '수레'], [SHARD, '빛 조각']].forEach(function (d) { if (B[d[0]]) throw new Error('번호가 겹쳐요: ' + d[0]); expansionItem(d[0], d[1], 'bow' + d[0]); });
  function drawBowTiles() {
    tile('bow930', function (px, R) {
      clear(px);
      for (var y = 1; y < 15; y++) { var cx = 3 + 7.5 * Math.sin(Math.PI * (y - 1) / 13); for (var x = 0; x < 16; x++) if (Math.abs(x - cx) < 1.1) px(x, y, 0x8a5a2b, 0.85 + R() * 0.25); }
      for (var y2 = 1; y2 < 15; y2++) px(3, y2, 0xe8e2d0, 1);
      px(10, 7, 0x4a2f18); px(10, 8, 0x4a2f18);
    });
    tile('bow950', function (px, R) {   // 수레: 쇠 통 + 바퀴
      clear(px);
      for (var y = 4; y < 12; y++) for (var x = 2; x < 14; x++) { var rim = y === 4 || x === 2 || x === 13; px(x, y, rim ? 0x6d7378 : 0x8d949a, 0.85 + R() * 0.2); }
      [[4, 12], [5, 12], [4, 13], [5, 13], [10, 12], [11, 12], [10, 13], [11, 13]].forEach(function (q) { px(q[0], q[1], 0x2b2b2b, 1); });
    });
    tile('bow933', function (px, R) {   // 빛 조각: 빛나는 노란 마름모
      clear(px);
      for (var y = 2; y < 14; y++) for (var x = 2; x < 14; x++) { var d = Math.abs(x - 7.5) + Math.abs(y - 7.5); if (d < 5.6) px(x, y, d < 2.2 ? 0xfffbe0 : (d < 4 ? 0xffe27a : 0xe8b030), 1); }
    });
    tile('bow931', function (px, R) {
      clear(px);
      for (var i = 3; i < 13; i++) px(i, 15 - i, 0x9a6a3a, 0.9 + R() * 0.2);
      [[12, 2], [13, 2], [13, 3], [11, 2], [13, 4], [12, 3]].forEach(function (q) { px(q[0], q[1], 0xa8adb2, 1); });
      [[2, 12], [3, 12], [2, 13], [3, 13], [1, 13], [2, 14], [4, 13], [3, 14]].forEach(function (q) { px(q[0], q[1], (q[0] + q[1]) % 2 ? 0xf0ece0 : 0xc0473a, 1); });
    });
  }
  function drawWordTiles() {
    WORD_BLOCKS.concat(WORD_ITEMS).forEach(function(d) {
      tile('word'+d[0],function(px,R){
        var item=d[0]>=660; if(item)clear(px);
        for(var y=0;y<16;y++)for(var x=0;x<16;x++){
          var dx=x-7.5,dy=y-7.5;
          var mark=d[0]===SLING_TARGET&&dx*dx+dy*dy<12;
          var visible=d[0]===STAFF ? (x===5&&y>4)||(y===4&&x>=5&&x<=9)||(x===9&&y===5) :
            d[0]===SLING?y>3&&y<13&&(Math.abs(Math.abs(dx)-(13-y)*.32)<1.3||Math.abs(dy)<1.5&&Math.abs(dx)<3) :
            d[0]===SHOFAR ? Math.abs(y-(4+Math.pow(x-5,2)*.077))<1.8 && x>2&&x<14 :
            (d[0]===WORD_SCROLL||d[0]===HAND_MAP)?Math.abs(dx)<6&&Math.abs(dy)<4.7:dx*dx+dy*dy<28;
          if(item&&!visible)continue;
          px(x,y,mark?0x94463b:d[2],.86+R()*.20+((x+y)%7===0?.12:0));
        }
      });
    });
  }
  for (var bi = 0; bi < B.length; bi++) if (B[bi] === undefined) B[bi] = null;
  function isShape(id) { return !!SHAPE[id]; }
  function baseOf(id) { return SHAPE[id] ? SHAPE[id].base : id; }
  // 모양별 상자들(칸 안 좌표 0~1)
  var EDGE = [[0, 0, 0, 1, 1, 0.19], [0.81, 0, 0, 1, 1, 1], [0, 0, 0.81, 1, 1, 1], [0, 0, 0, 0.19, 1, 1]];
  function swapBoxAxes(b) { return [b[2],b[1],b[0],b[5],b[4],b[3]]; }
  function shapeBoxes(id, x, y, z) {
    var s = SHAPE[id];
    if (s.type === 'slab') return [s.f ? [0, 0.5, 0, 1, 1, 1] : [0, 0, 0, 1, 0.5, 1]];
    if (s.type === 'stair') return [[0, 0, 0, 1, 0.5, 1], [[0, 0.5, 0, 1, 1, 0.5], [0.5, 0.5, 0, 1, 1, 1], [0, 0.5, 0.5, 1, 1, 1], [0, 0.5, 0, 0.5, 1, 1]][s.f]];
    if (s.type === 'extension') return EXT_BOXES[s.boxes];
    if (s.type === 'pillar') return [[.1,0,.1,.9,.13,.9],[.22,.13,.22,.78,.87,.78],[.1,.87,.1,.9,1,.9]];
    if (s.type === 'arch') {
      var arch=[[0,0,.12,.17,1,.88],[.83,0,.12,1,1,.88],
        [.17,.38,.12,.34,1,.88],[.66,.38,.12,.83,1,.88],[.34,.68,.12,.66,1,.88]];
      return s.f ? arch.map(swapBoxAxes) : arch;
    }
    if (s.type === 'rope') {
      var rope=[[.46,0,.46,.54,1,.54]];
      if(mechanismNeighbor(get(x-1,y,z)))rope.push([0,.53,.46,.46,.61,.54]);
      if(mechanismNeighbor(get(x+1,y,z)))rope.push([.54,.53,.46,1,.61,.54]);
      if(mechanismNeighbor(get(x,y,z-1)))rope.push([.46,.53,0,.54,.61,.46]);
      if(mechanismNeighbor(get(x,y,z+1)))rope.push([.46,.53,.54,.54,.61,1]);
      return rope;
    }
    if (s.type === 'pulley') return [[.14,.38,.34,.86,.74,.66],[.44,.7,.44,.56,1,.56]];
    if (s.type === 'weight') return [[.24,.14,.24,.76,.76,.76],[.45,.76,.45,.55,1,.55]];
    if (s.type === 'plate') return [[.08,0,.08,.92,.11,.92]];
    if (s.type === 'lift') return [[0,0,0,1,.17,1],[.02,.17,.02,.11,.65,.11],[.89,.17,.02,.98,.65,.11]];
    if (s.type === 'wheel') return [[.43,0,.43,.57,.47,.57],[.27,.43,.27,.73,.57,.73]];
    if (s.type === 'sluice') {
      var gateBoxes=s.open ? [[0,0,.4,.12,1,.6],[.88,0,.4,1,1,.6],[.12,.85,.4,.88,1,.6]] : [[0,0,.39,1,1,.61]];
      return s.f % 2 ? gateBoxes.map(swapBoxAxes) : gateBoxes;
    }
    if (s.type === 'rail') {
      var rail = [[.2,0,.2,.8,1,.8]];
      if (get(x-1,y,z) === id) rail.push([0,.48,.36,.2,.9,.64]);
      if (get(x+1,y,z) === id) rail.push([.8,.48,.36,1,.9,.64]);
      if (get(x,y,z-1) === id) rail.push([.36,.48,0,.64,.9,.2]);
      if (get(x,y,z+1) === id) rail.push([.36,.48,.8,.64,.9,1]);
      return rail;
    }
    if (s.type === 'roof') return [[0,.64,0,1,1,1]];
    if (s.type === 'flag') return [[.1,0,.44,.2,1,.56],[.2,.43,.47,.94,.96,.53]];
    if (s.type === 'cloth') return [[.05,.05,.46,.95,.95,.54]];
    if (s.type === 'gate') {
      var gate = s.open ? [[0,0,.43,.13,1,.57],[.87,0,.43,1,1,.57],[.02,.28,.52,.13,.45,1],[.02,.65,.52,.13,.82,1]] :
        [[0,0,.43,.13,1,.57],[.87,0,.43,1,1,.57],[.13,.28,.43,.87,.45,.57],[.13,.65,.43,.87,.82,.57]];
      return s.f ? gate.map(function(b) { return [b[2],b[1],b[0],b[5],b[4],b[3]]; }) : gate;
    }
    if (s.type === 'door') return [EDGE[s.open ? (s.f + 1) % 4 : s.f]];
    if (s.type === 'mrail') {
      if (s.f < 6) return [[0, 0, 0, 1, 0.0625, 1]];
      var rb = [];
      for (var k = 0; k < 4; k++) { var lo = k * 0.25, hi = lo + 0.0625; rb.push([[0, lo, 0.75 - lo, 1, hi, 1 - lo], [lo, lo, 0, lo + 0.25, hi, 1], [0, lo, lo, 1, hi, lo + 0.25], [0.75 - lo, lo, 0, 1 - lo, hi, 1]][s.f - 6]); }
      return rb;
    }
    if (s.type === 'trapdoor') return s.open ? [EDGE[s.f]] : [s.h ? [0, 0.81, 0, 1, 1, 1] : [0, 0, 0, 1, 0.19, 1]];   // 닫히면 바닥(아래·위 반쪽), 열리면 한쪽 벽에 세워짐
    if (s.type === 'frame') return [[[0.12, 0.12, 0, 0.88, 0.88, 0.06], [0.94, 0.12, 0.12, 1, 0.88, 0.88], [0.12, 0.12, 0.94, 0.88, 0.88, 1], [0, 0.12, 0.12, 0.06, 0.88, 0.88]][s.f]];
    if (s.type === 'ladder') return [[[0, 0, 0, 1, 1, 0.1], [0.9, 0, 0, 1, 1, 1], [0, 0, 0.9, 1, 1, 1], [0, 0, 0, 0.1, 1, 1]][s.f]];
    if (s.type === 'chair') {
      var boxes = [[.1,.42,.1,.9,CHAIR_SEAT,.9],[.1,0,.1,.23,.42,.23],[.77,0,.1,.9,.42,.23],
        [.1,0,.77,.23,.42,.9],[.77,0,.77,.9,.42,.9],[.1,CHAIR_SEAT,.77,.9,1,.9]];
      if (!s.f) return boxes;
      return boxes.map(function (b) {
        if (s.f === 1) return [1-b[5],b[1],b[0],1-b[2],b[4],b[3]];
        if (s.f === 2) return [1-b[3],b[1],1-b[5],1-b[0],b[4],1-b[2]];
        return [b[2],b[1],1-b[3],b[5],b[4],1-b[0]];
      });
    }
    if (s.type === 'bed') return [[0, 0, 0, 1, 0.56, 1]];
    if (s.type === 'carpet') return [[0, 0, 0, 1, 0.07, 1]];
    if (s.type === 'lampstand') return [[0.25, 0, 0.25, 0.75, 0.15, 0.75], [0.44, 0.15, 0.44, 0.56, 0.85, 0.56], [0.3, 0.85, 0.3, 0.7, 1, 0.7]];
    if (s.type === 'lantern') return [[0.3, 0.15, 0.3, 0.7, 0.7, 0.7], [0.4, 0.7, 0.4, 0.6, 1, 0.6]];
    if (s.type === 'lever') return [[0.3, 0, 0.3, 0.7, 0.12, 0.7], s.open ? [0.45, 0.12, 0.6, 0.55, 0.62, 0.7] : [0.45, 0.12, 0.3, 0.55, 0.62, 0.4]];
    if (s.type === 'wtorch') return [[[0.43, 0.25, 0, 0.57, 0.85, 0.14], [0.86, 0.25, 0.43, 1, 0.85, 0.57], [0.43, 0.25, 0.86, 0.57, 0.85, 1], [0, 0.25, 0.43, 0.14, 0.85, 0.57]][s.f]];
    if (s.type === 'sign') return [[0.45, 0, 0.45, 0.55, 0.55, 0.55], s.f % 2 ? [0.44, 0.5, 0.04, 0.56, 1, 0.96] : [0.04, 0.5, 0.44, 0.96, 1, 0.56]];
    if (s.type === 'pane') {
      var pb = [[0.44, 0, 0.44, 0.56, 1, 0.56]], con = 0;
      [[0, -1, [0.44, 0, 0.56, 0.44]], [1, 0, [0.56, 0.44, 1, 0.56]], [0, 1, [0.44, 0.56, 0.56, 1]], [-1, 0, [0, 0.44, 0.44, 0.56]]].forEach(function (d) {
        var nb = get(x + d[0], y, z + d[1]);
        if (nb === PANE || nb === GLASS || (isSolid(nb) && !isShape(nb))) { var r = d[2]; pb.push([r[0], 0, r[1], r[2], 1, r[3]]); con++; }
      });
      if (!con) pb.push([0, 0, 0.44, 1, 1, 0.56]);
      return pb;
    }
    // 울타리: 기둥 + 옆 칸(울타리·꽉 찬 블록) 쪽으로 가로대
    var bx = [[0.375, 0, 0.375, 0.625, 1, 0.625]];
    [[0, -1, [0.44, 0, 0.56, 0.375]], [1, 0, [0.625, 0.44, 1, 0.56]], [0, 1, [0.44, 0.625, 0.56, 1]], [-1, 0, [0, 0.44, 0.375, 0.56]]].forEach(function (d) {
      var nb = get(x + d[0], y, z + d[1]);
      if (nb === FENCE || (SHAPE[nb] && SHAPE[nb].type === 'gate' && SHAPE[nb].f === (d[0] === 0 ? 1 : 0)) || (isSolid(nb) && !isShape(nb) && !isTrans(nb))) { var r = d[2]; bx.push([r[0], 0.3, r[1], r[2], 0.45, r[3]]); bx.push([r[0], 0.7, r[1], r[2], 0.85, r[3]]); }
    });
    return bx;
  }
  function collBoxes(id, x, y, z) { var s = SHAPE[id]; if ((s.type === 'door' || s.type === 'gate' || s.type === 'trapdoor') && s.open) return [];
    if (s.type === 'frame' || s.type === 'mrail') return [];
    if (s.type === 'flag' || s.type === 'cloth' || s.type === 'rope' || s.type === 'plate') return [];
    if (s.type === 'gate') return [s.f ? [.43,0,0,.57,1,1] : [0,0,.43,1,1,.57]]; if (s.type === 'ladder' || s.type === 'wtorch' || s.type === 'lever' || s.type === 'sign' || s.type === 'lantern' || s.type === 'carpet' || s.type === 'lampstand') return []; if (s.type === 'fence') return [[0.3, 0, 0.3, 0.7, 1, 0.7]].concat(shapeBoxes(id, x, y, z).slice(1).map(function (b) { return [b[0], 0, b[2], b[3], 1, b[5]]; })); return shapeBoxes(id, x, y, z); }
  // 가방에 들어가는 것(캐거나 만들어서 모음)
  var INV = [7, 5, 6, 8, 3, 21, 23, 4, 2, 26, 27, 25, 28, 29, 11, 12, 13, 20, 22, 9, 10, 18, 14, 15, 16, 17, SLAB_G, SLAB_S, SLAB_B, STAIR_G, STAIR_S, STAIR_B, FENCE, DOOR,
    ORE_CU, ORE_FE, ORE_AG, ORE_AU, ING_CU, ING_FE, ING_AG, ING_AU, FURNACE, BLK_CU, BLK_FE, BLK_AG, BLK_AU, STICK];
  INV.push(SAPLING, OLIVE, LADDER, CHEST, SADDLE, CRAFT, LEATHER, WOOL);
  WEARS.forEach(function (w) { INV.push(w[0]); });
  FRONTIER_RECIPES.forEach(function(r){INV.push(r[0]);});
  INV.push(TRAP, FRAME, BOW, ARROW, RAIL0, CART, RAILF0, SHARD);
  INV.push(SEED, WHEAT, BREAD, FIG, BED, CHAIR, LEVER, PANE, SIGN, WOOL_W, WOOL_B, WOOL_V, WOOL_R, SLAB_L, SLAB_P, STAIR_L, STAIR_P, SWORD, SHELF, SBRICK, CARPET, LANTERN);
  GEMS.forEach(function (g, i) { if (g) INV.push(gemOre(i), gemItem(i)); });
  for (var fsi = 0; fsi < 12; fsi++) INV.push(FSTONE0 + fsi);
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
  DROP[FURNACE_ON] = FURNACE; DROP[LOG_X] = LOG; DROP[LOG_Z] = LOG;
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
  setClass('axe', [BED, CHAIR, CHAIR + 1, CHAIR + 2, CHAIR + 3, SIGN, SIGN + 1, SIGN + 2, SIGN + 3], 0.5); setClass('pick', [LEVER, LEVER + 1], 0.3); setClass('pick', [PANE], 0.25);
  setClass('knife', [WOOL_W, WOOL_B, WOOL_V, WOOL_R], 0.5); setClass('axe', [LOG_X, LOG_Z], 1.4);
  GEMS.forEach(function (g, i) { if (!g) return; setClass('pick', [gemOre(i)], 5.2 + g[7] * 0.3); DROP[gemOre(i)] = gemItem(i); });
  for (var fsj = 0; fsj < 12; fsj++) setClass('pick', [FSTONE0 + fsj], 3.0);
  (function () { var r = []; for (var i = 0; i < 10; i++) r.push(RAIL0 + i, RAILF0 + i); setClass('pick', r, 0.5); })();
  (function () { var t = []; for (var i = 0; i < 16; i++) t.push(TRAP + i); setClass('axe', t, 0.9); setClass('axe', [FRAME, FRAME + 1, FRAME + 2, FRAME + 3], 0.3); })();
  setClass('axe', [SHELF], 1.0); setClass('pick', [SBRICK], 1.6); setClass('knife', [CARPET], 0.1); setClass('pick', [LANTERN], 0.4);
  setClass('pick', [SLAB_L, STAIR_L, STAIR_L + 1, STAIR_L + 2, STAIR_L + 3], 1.2); setClass('axe', [SLAB_P, STAIR_P, STAIR_P + 1, STAIR_P + 2, STAIR_P + 3], 1.0);
  for (var cb = 0; cb < 4; cb++) { BASE_T[CROP0 + cb] = 0.05; BASE_T[WTORCH + cb] = 0.05; }
  for (var dk2 in DEEPV) { TCLASS[DEEPV[dk2]] = 'pick'; BASE_T[DEEPV[dk2]] = Math.round(BASE_T[dk2] * 1.3 * 10) / 10; }
  setClass('pick', [12, 11, 13, SLAB_S, SLAB_B, STAIR_S, STAIR_S + 1, STAIR_S + 2, STAIR_S + 3, STAIR_B, STAIR_B + 1, STAIR_B + 2, STAIR_B + 3], 1.2); setClass('pick', [20], 1.0);
  setClass('pick', [FURNACE], 1.6); setClass('pick', [BLK_CU], 2.6); setClass('pick', [BLK_FE], 3.2); setClass('pick', [BLK_AG], 3.8); setClass('pick', [BLK_AU], 4.4); setClass('pick', [GLASS], 0.4); setClass('pick', [LAMP], 0.6);
  setClass('axe', [LOG], 1.4); setClass('axe', [GOPHER, PITCH], 1.1); setClass('axe', [22], 0.8);
  setClass('axe', [SLAB_G, STAIR_G, STAIR_G + 1, STAIR_G + 2, STAIR_G + 3, FENCE, 60, 61, 62, 63, 64, 65, 66, 67], 1.0);
  setClass('shovel', [GRASS, DIRT, 19], 0.7); setClass('shovel', [SAND], 0.6); setClass('shovel', [CLAY, TAR], 0.9); setClass('shovel', [18], 0.9); setClass('shovel', [SNOW], 0.4);
  setClass('knife', [LEAF, CEDAR_LEAF], 0.35); setClass('axe', [CEDAR_LOG], 1.6); setClass('shovel', [SALT_CRUST], 0.6); setClass('pick', [SALT_ROCK], 1.0); setClass('pick', [RED_ROCK, RED_ROCK2], 1.3);
  DROP[CEDAR_LOG] = LOG; DROP[SALT_CRUST] = SALT; DROP[SALT_ROCK] = SALT; DROP[RED_ROCK] = RED_EARTH; DROP[RED_ROCK2] = RED_EARTH; setClass('knife', [REED, FLOWER], 0.08); setClass('knife', [14, 15, 16, 17], 0.6);
  var NEED_TIER = {}; NEED_TIER[ORE_CU] = 0; NEED_TIER[ORE_FE] = 1; NEED_TIER[ORE_AG] = 2; NEED_TIER[ORE_AU] = 3;   // 0=나무 1=돌 2=구리 3=철 곡괭이
  GEMS.forEach(function (g, i) { if (g) NEED_TIER[gemOre(i)] = g[7]; });   // 열두 보석: 귀한 것은 금강석 곡괭이(4)
  NEED_TIER[ORE_COAL] = 0; NEED_TIER[ORE_ONYX] = 2; NEED_TIER[ORE_SAPH] = 3; NEED_TIER[ORE_DIA] = 3;
  for (var dk3 in DEEPV) NEED_TIER[DEEPV[dk3]] = NEED_TIER[dk3];
  var HAND_SLOW = 2, MINE_SLOW = 1.8, TIER_SPEED = [2, 3, 4.5, 6, 8], TOOL_MAX = [60, 130, 200, 300, 1000];
  function isTool(id) { return (id >= TOOL0 && id < TOOL0 + 16) || (id >= TOOL4 && id < TOOL4 + 4); }
  function tierOf(id) { return id >= TOOL4 ? 4 : (id - TOOL0) % 4; }
  function typeOf(id) { return id >= TOOL4 ? id - TOOL4 : Math.floor((id - TOOL0) / 4); }
  function toolMax(id) { return TOOL_MAX[tierOf(id)]; }
  function toolName(id) { return TIER_NAME[tierOf(id)] + ' ' + TOOL_TNAME[typeOf(id)]; }
  function bestTier(cls) { var t = -1; for (var k = 4; k >= 0; k--) if (have(toolId(cls, k)) > 0) { t = k; break; } return t; }
  // 캐는 시간(초)과 못 캐는 이유
  // 손에 든 도구로 캔다: 맞는 도구면 빨리, 맞지 않는 도구면 맨손 속도(그래도 닳음)
  function mineInfo(id) {
    var material = SHAPE[id] && SHAPE[id].type === 'slab' ? SHAPE[id].base : id;
    if (!TCLASS[material] && SLAB_MATERIAL[material]) material = SLAB_MATERIAL[material];
    if (SHAPE[id] && (SHAPE[id].type === 'gate' || BUILD_BLOCKS.some(function (d) { return d[0] === id; }))) material = SHAPE[id].mat;
    var cls = TCLASS[material], base = BASE_T[material] || 0.5, held = HOTBAR[sel];
    var tool = isTool(held) && have(held) > 0 ? held : 0;
    var hType = tool ? TOOL_TYPES[typeOf(tool)] : '', hTier = tool ? tierOf(tool) : -1;
    var tier = cls && hType === cls ? hTier : -1;
    if (NEED_TIER[id] !== undefined && tier < NEED_TIER[id]) {
      var bt = bestTier('pick');
      return { deny: B[id][0] + '은(는) ' + TIER_NAME[NEED_TIER[id]] + ' 곡괭이 이상을 손에 들어야 캘 수 있어요' + (bt >= NEED_TIER[id] ? ' (가방에 ' + TIER_NAME[bt] + ' 곡괭이가 있어요)' : '') };
    }
    // 맞는 도구가 없으면(맨손·블록·맞지 않는 도구) 2배 느리게. 전체를 1.8배 느리게(전도사님 「캐지는 속도가 너무 빨라」 11/18) — 풀·꽃처럼 톡 캐지는 것은 그대로
    var t = tier >= 0 ? base / TIER_SPEED[tier] : (cls ? base * HAND_SLOW : base);
    if (base > 0.1) t *= MINE_SLOW;
    return { t: t, tool: tool, fit: tier >= 0 };
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
    { out: [TRAP, 2], need: [[GOPHER, 6]], cat: 'shape' },
    { out: [BOW, 1], need: [[STICK, 3], [THREAD, 3]], cat: 'tool' },
    { out: [RAIL0, 16], need: [[ING_FE, 6], [STICK, 1]], cat: 'shape' },
    { out: [RAILF0, 6], need: [[ING_AU, 6], [STICK, 1]], cat: 'shape' },
    { out: [CART, 1], need: [[ING_FE, 5]], cat: 'tool' },
    { out: [ARROW, 4], need: [[STICK, 1], [FLINT, 1]], cat: 'tool' },
    { out: [FRAME, 1], need: [[STICK, 8], [LEATHER, 1]], cat: 'shape' },
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
  // 농사·침대·레버·유리판·표지판·양털 블록·반 블록과 계단(2026-11-18)
  RECIPES.push({ out: [BREAD, 1], need: [[WHEAT, 3]], cat: 'block', ref: '마 4:4' });
  // 열두 기초석: 보석 3 + 금 덩이 1, 제작대에서(계 21:19-20)
  FS_NAMES.forEach(function (n, i) { RECIPES.push({ out: [FSTONE0 + i, 1], need: [[gemItem(i), 3], [ING_AU, 1]], cat: 'block', table: true, ref: i < 4 ? '계 21:19' : '계 21:20' }); });
  RECIPES.push({ out: [SHELF, 1], need: [[GOPHER, 6], [REED, 3]], cat: 'block' });
  RECIPES.push({ out: [SBRICK, 4], need: [[STONE, 4]], cat: 'block' });
  RECIPES.push({ out: [CARPET, 3], need: [[WOOL_R, 2]], cat: 'shape' });
  RECIPES.push({ out: [LANTERN, 1], need: [[ING_FE, 1], [TORCH, 1]], cat: 'shape' });
  RECIPES.push({ out: [SWORD, 1], need: [[ING_FE, 2], [ING_AU, 1], [STICK, 1]], cat: 'wear', table: true, ref: '엡 6:17' });
  FRONTIER_RECIPES.forEach(function(r){RECIPES.push({out:[r[0],1],need:r[3],cat:'shape'});});
  RECIPES.push({ out: [CHAIR, 1], need: [[GOPHER, 3], [STICK, 2]], cat: 'shape' });
  RECIPES.push({ out: [BED, 1], need: [[WOOL, 3], [GOPHER, 3]], cat: 'block', ref: '시 4:8' });
  RECIPES.push({ out: [LEVER, 1], need: [[STICK, 1], [STONE, 1]], cat: 'shape' });
  RECIPES.push({ out: [PANE, 16], need: [[GLASS, 6]], cat: 'shape' });
  RECIPES.push({ out: [SIGN, 3], need: [[GOPHER, 6], [STICK, 1]], cat: 'shape' });
  RECIPES.push({ out: [WOOL_W, 1], need: [[WOOL, 4]], cat: 'block' });
  RECIPES.push({ out: [WOOL_R, 4], need: [[WOOL_W, 4], [FLOWER, 1]], cat: 'block', ref: '출 25:4' });
  RECIPES.push({ out: [WOOL_B, 4], need: [[WOOL_W, 4], [GEM_SAPH, 1]], cat: 'block', ref: '출 25:4' });
  RECIPES.push({ out: [WOOL_V, 4], need: [[WOOL_B, 2], [WOOL_R, 2]], cat: 'block', ref: '출 25:4' });
  RECIPES.push({ out: [SLAB_L, 6], need: [[LIME, 3]], cat: 'shape' }); RECIPES.push({ out: [STAIR_L, 4], need: [[LIME, 6]], cat: 'shape' });
  RECIPES.push({ out: [SLAB_P, 6], need: [[PITCH, 3]], cat: 'shape' }); RECIPES.push({ out: [STAIR_P, 4], need: [[PITCH, 6]], cat: 'shape' });
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
  RECIPES.push({ out: [TORCH, 6], need: [[SHARD, 1], [STICK, 1]], cat: 'block', ref: '요 1:5' });   // 빛 조각으로 더 많이
  RECIPES.push({ out: [LANTERN, 2], need: [[SHARD, 2], [ING_FE, 1]], cat: 'shape' });
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
    saveJobs(); updateSmeltUI(); unlock('smelt');
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
  SLABS.slice(5).forEach(function (s) {
    INV.push(s[0]);
    RECIPES.push({ out: [s[0], 6], need: [[s[1], 3]], cat: 'shape' });
  });
  BUILD_BLOCKS.forEach(function (d) { INV.push(d[0]); });
  BUILD_ITEMS.forEach(function (d) { INV.push(d[0]); });
  INV.push(GATE);
  [
    [PILLAR,2,[[MARBLE,2]]], [ARCH,2,[[ALABASTER,2]]],
    [RAIL,4,[[SBRICK,3]]], [FLAT_ROOF,4,[[13,3],[GOPHER,1]]],
    [BLUE_RUG,3,[[WOOL_B,2]]], [GOLD_RUG,3,[[WOOL_W,2],[RED_EARTH,1]]],
    [REED_MAT,2,[[REED,3]]], [FLAG,1,[[16,2],[STICK,1]]],
    [PATTERN_CLOTH,2,[[14,1],[16,1],[WOOL_W,1]]],
    [GATE,1,[[GOPHER,2],[STICK,4]]]
  ].forEach(function (d) { RECIPES.push({ out: [d[0],d[1]], need: d[2], cat: 'shape', ref: d[0] === RAIL || d[0] === FLAT_ROOF ? '신명기 22장 8절' : '' }); });
  RECIPES.push({ out: [STRIKER,1], need: [[ING_FE,1]], cat: 'tool', table: true });
  INV.push(FARM_SOIL,OVEN,MILL,WINE_PRESS,OIL_PRESS,COOK_POT);
  FOOD_ART.forEach(function(d) { INV.push(d[0]); });
  Object.keys(FARM_SEEDS).forEach(function(id) {
    var seed=FARM_SEEDS[id]; INV.push(seed.seed);
    if (INV.indexOf(seed.harvest)<0) INV.push(seed.harvest);
    RECIPES.push({out:[seed.seed,1],need:[[seed.harvest,1]],cat:'block'});
  });
  [[HOE,1,[[STONE,2],[STICK,2]]],[FISH_ROD,1,[[STICK,3],[WOOL,1]]],[FISH_NET,1,[[REED,4],[WOOL,2]]],
   [OVEN,1,[[BRICK,6],[STONE,2]]],[MILL,1,[[STONE,5]]],[WINE_PRESS,1,[[GOPHER,5],[STONE,2]]],[OIL_PRESS,1,[[GOPHER,4],[STONE,4]]],[COOK_POT,1,[[ING_CU,3],[CLAY,2]]]
  ].forEach(function(d){ RECIPES.push({out:[d[0],d[1]],need:d[2],cat:d[0]<600?'block':'tool'}); });
  [
    [FLOUR,2,[[612,2]],MILL], [FLOUR,2,[[WHEAT,2]],MILL],
    [WINE,1,[[613,3]],WINE_PRESS], [OLIVE_OIL,1,[[614,3]],OIL_PRESS],
    [STEW,1,[[615,2],[CHAR,1]],OVEN], [COOKED_FISH,1,[[RAW_FISH,1],[CHAR,1]],OVEN],
    [COOKED_LAMB,1,[[RAW_LAMB,1],[CHAR,1]],OVEN], [FLATBREAD,2,[[FLOUR,2],[CHAR,1]],OVEN]
  ].forEach(function(d){ RECIPES.push({out:[d[0],d[1]],need:d[2],station:d[3],cat:'block'}); });
  LIFE_BLOCKS.forEach(function(d){ INV.push(d[0]); });
  LIFE_ITEMS.forEach(function(d){ INV.push(d[0]); });
  [
    [WELL,1,[[STONE,8],[GOPHER,2],[WELL_BUCKET,1]]],[LOOM,1,[[GOPHER,5],[THREAD,2]]],
    [JAR,2,[[CLAY,3],[CHAR,1]]],[OIL_JAR,1,[[JAR,1],[OLIVE_OIL,1]]],
    [ALABASTER_JAR,1,[[ALABASTER,2]]],[OIL_LAMP,1,[[CLAY,1],[OLIVE_OIL,1],[THREAD,1]]],
    [CANDLESTICK,1,[[ING_CU,1],[HONEY,1],[THREAD,1]]],[CAMPFIRE,1,[[STONE,3],[LOG,2],[CHAR,1]]],
    [BUCKET,1,[[GOPHER,3],[ING_FE,1]]],[WATER_JAR,1,[[CLAY,3],[CHAR,1]]],
    [THREAD,3,[[WOOL,1]]],[LINEN,2,[[THREAD,3],[REED,1]],LOOM],[WOOL_CLOTH,2,[[THREAD,2],[WOOL,2]],LOOM],
    [RED_DYE,2,[[FLOWER,1],[RED_EARTH,1]]],[BLUE_DYE,2,[[THISTLE,2]]],[GOLD_DYE,2,[[CLAY,1],[SALT,1]]],
    [16,2,[[LINEN,2],[RED_DYE,1]],LOOM],[14,2,[[LINEN,2],[BLUE_DYE,1]],LOOM],
    [15,2,[[LINEN,2],[GOLD_DYE,1]],LOOM],[PATTERN_CLOTH,2,[[WOOL_CLOTH,2],[BLUE_DYE,1]],LOOM],
    [WELL_BUCKET,1,[[GOPHER,2],[THREAD,2]]],
    [LYRE,1,[[GOPHER,3],[THREAD,3]]],[HARP,1,[[GOPHER,4],[THREAD,4]]],[TIMBREL,1,[[LEATHER,1],[GOPHER,1]]],[CYMBAL,1,[[ING_CU,2]]]
  ].forEach(function(d){RECIPES.push({out:[d[0],d[1]],need:d[2],station:d[3],cat:'block'});});
  DROP[FEAST_BREAD]=FLATBREAD; DROP[FEAST_OLIVE]=614; DROP[FEAST_FISH]=COOKED_FISH;
  Object.values(VILLAGE_FISH).forEach(function (id) {
    RECIPES.push({out:[COOKED_FISH,1],need:[[id,1],[CHAR,1]],station:OVEN,cat:'block'});
  });
  [FIND_POT,FIND_LAMP,FIND_SEED,DITCH,FEAST_TABLE].forEach(function (id) { INV.push(id); });
  RECIPES.push({out:[DITCH,4],need:[[STONE,2],[CLAY,1]],cat:'shape'});
  RECIPES.push({out:[FEAST_TABLE,1],need:[[GOPHER,4],[REED,1]],cat:'shape'});
  WORD_BLOCKS.forEach(function(d){INV.push(d[0]);});
  WORD_ITEMS.forEach(function(d){INV.push(d[0]);});
  [
    [WORD_SHELF,1,[[SHELF,1],[WORD_SCROLL,1]]],[ALTAR,1,[[STONE,6]]],
    [SLING_TARGET,1,[[REED,4],[STICK,2]]],[WORD_SCROLL,1,[[REED,3],[THREAD,1]]],
    [STAFF,1,[[LOG,1],[STICK,2]]],[HAND_MAP,1,[[REED,3],[CHAR,1]]],
    [COMPASS,1,[[ING_FE,1],[GOPHER,2]]],[SHOFAR,1,[[CLAY,2],[WOOL,1]]],
    [SLING,1,[[LEATHER,1],[THREAD,2]]],[ROUND_STONE,4,[[STONE,1]]]
  ].forEach(function(d){RECIPES.push({out:[d[0],d[1]],need:d[2],cat:d[0]<600?'shape':'tool'});});
  RECIPES.forEach(function (r) { if (!r.cat) r.cat = SHAPE[r.out[0]] ? 'shape' : 'block'; });
  function canCraft(rc) { return isAdm() || rc.need.every(function (n) { return have(n[0]) >= n[1]; }) && (!rc.station || (workshopNeeds() & STATION_BITS[rc.station])) && (!rc.furnace || furnaceOK()) && (!rc.table || tableOK()) && (!rc.fuel || fuelLeft(rc) >= 1); }
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
  function get(x,y,z) {
    var id=readBlock(x,y,z);
    return id===AIR && frontierWater.size && frontierWater.has(frontierCell(x,y,z)) ? WATER : id;
  }
  function readBlock(x, y, z) {
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
  var OLD_PLOT = 24, WIDE_PLOT = 26, PLOT = OLD_PLOT, PGAP = 4, PCOLS = 8, PROWS = 8, PH = 32, PSTEP = 28;
  var PX0 = XM - Math.floor((PCOLS * PSTEP - 4) / 2), PZ0 = AZ1 + 17;
  var VX1 = PX0 + PCOLS * PSTEP - 1, VZ1 = PZ0 + PROWS * PSTEP - 1;
  // 남쪽 호수, 그 동쪽 역청 구덩이(창 14:10)
  var LX = XM, LZ = AZ0 + 328, LRX = 78, LRZ = 20;
  var TARR = [LX + LRX + 8, LZ - 18, LX + LRX + 46, LZ + 22];
  // 먼 곳: 북쪽 바다, 동쪽 사막(오아시스), 서쪽 끝 아라랏 산(창 8:4)
  var SEA_Z = AZ0 - 150, DES_X = VX1 + 170, ARX = XM - 600, ARZ = AZ0 + 60, OASX = VX1 + 430, OASZ = PZ0 + 70;
  // 남쪽 새 지역(11/20): 서남쪽 백향목 숲(시 92:12), 가운데 광야와 성막(출 25:8, 27:18), 동남쪽 소금 바다(마 5:13)와 나그네 장막촌(히 11:9)
  var CEX = 640, CEZ = 1640, CER = 210, WIX = 1030, WIZ = 1700, WIR = 190, SAX = 1440, SAZ = 1690, SARX = 140, SARZ = 85, SAR = 205;
  var TBX = 1030, TBZ = 1700, CTX = 640, CTZ = 1640, TCX = 1262, TCZ = 1690, LOTX = 1440, LOTZ = 1784;
  function southReg(x, z) {
    if (z < 1380) return '';
    var n = (vnoise(x, z, 50, 71) - 0.5) * 60;
    if (Math.hypot(x - SAX, (z - SAZ) * 1.3) + n < SAR) return 'salt';
    if (Math.hypot(x - WIX, z - WIZ) + n < WIR) return 'wild';
    if (Math.hypot(x - CEX, z - CEZ) + n < CER) return 'cedar';
    return '';
  }
  function saltE(x, z) { var dx = (x - SAX) / SARX, dz = (z - SAZ) / SARZ; return dx * dx + dz * dz; }
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
  function enableWidePlots() {
    PLOT = WIDE_PLOT;
    PGAP = PSTEP - PLOT;
    PSIZE = PLOT * PLOT * (G + PH - PY0);
  }
  function inArk(x, y, z) { return x >= AX0 - 1 && x <= AX1 + 1 && z >= AZ0 - 1 && z <= AZ1 + 1 && y >= AY0 - 1 && y <= AY1 + 1; }
  // 마을·방주 마당(길과 마당은 캐지 않음)
  var TOWN = [[AX0 - 8, AZ0 - 8, AX1 + 8, AZ1 + 8], [PX0 - 8, AZ1, VX1 + 8, VZ1 + 6]];
  function inTown(x, z) { for (var i = 0; i < TOWN.length; i++) { var r = TOWN[i]; if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3]) return true; } return false; }
  function rnd(s) { s = Math.sin(s * 127.1) * 43758.5453; return s - Math.floor(s); }
  function hash2(x, z, seed) { return rnd(x * 0.12989 + z * 0.78233 + seed * 3.7719); }
  // 노이즈 격자점 값은 같은 점을 수없이 다시 계산하므로 기억해 둔다(값은 rnd 그대로라 땅 모양은 한 비트도 바뀌지 않음)
  var VN_N = 1 << 14, vnK = new Int32Array(VN_N).fill(-1), vnV = new Float64Array(VN_N);
  function vlat(ix, iz, seed) {
    if ((ix | iz) >>> 10 || seed > 63) return rnd(ix * 57.31 + iz * 131.73 + seed * 17.13);   // 범위 밖은 그냥 계산
    var key = (ix << 16) | (iz << 6) | seed, h = (Math.imul(ix, 73856093) ^ Math.imul(iz, 19349663) ^ Math.imul(seed, 83492791)) & (VN_N - 1);
    if (vnK[h] === key) return vnV[h];
    var v = rnd(ix * 57.31 + iz * 131.73 + seed * 17.13); vnK[h] = key; vnV[h] = v; return v;
  }
  function vnoise(x, z, s, seed) {
    var gx = x / s, gz = z / s, ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz;
    fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
    var a = vlat(ix, iz, seed), b = vlat(ix + 1, iz, seed);
    var c = vlat(ix, iz + 1, seed), d = vlat(ix + 1, iz + 1, seed);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }
  function sstep(a, b, v) { var t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); }
  function lakeE(x, z) { var dx = (x - LX) / LRX, dz = (z - LZ) / LRZ; return dx * dx + dz * dz; }
  // 강: 서쪽 산 골짜기 → 남쪽 호수(마을은 비켜 감)
  var RIV = [[XM - 180, AZ0 + 60], [XM - 164, AZ0 + 136], [XM - 150, AZ0 + 216], [XM - 136, AZ0 + 286], [XM - 110, AZ0 + 320], [LX - LRX + 6, LZ]];
  var RIV_LEN = RIV.slice(1).map(function (b, s) { return Math.hypot(b[0] - RIV[s][0], b[1] - RIV[s][1]); });   // 구간 길이는 한 번만
  function riverDist(x, z) {
    var best = 99;
    for (var s = 0; s + 1 < RIV.length; s++) {
      var a = RIV[s], b = RIV[s + 1], vx = b[0] - a[0], vz = b[1] - a[1], len = RIV_LEN[s];
      var u = clamp01(((x - a[0]) * vx + (z - a[1]) * vz) / (len * len)) * len;
      var px = a[0] + vx * u / len + Math.sin(u * 0.08 + s) * 4, pz = a[1] + vz * u / len;
      var d = Math.hypot(x - px, z - pz); if (d < best) best = d;
    }
    return best;
  }
  var DO_RECTS = null;   // 마을·역청 구덩이 둘레(상수라 한 번만 만든다)
  function distOut(x, z) {
    var best = 1e9, rects = DO_RECTS || (DO_RECTS = TOWN.concat([[TARR[0] - 4, TARR[1] - 4, TARR[2] + 4, TARR[3] + 4]]));
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
    var sr = southReg(x, z); if (sr) return sr;
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
    var wildW = 0, mesaTop = false;
    if (z > 1340) {   // 남쪽 새 지역 땅 모양
      var snz = (vnoise(x, z, 50, 71) - 0.5) * 60;
      var cw = sstep(0, 50, CER - (Math.hypot(x - CEX, z - CEZ) + snz));
      wildW = sstep(0, 50, WIR - (Math.hypot(x - WIX, z - WIZ) + snz));
      var sw = sstep(0, 40, SAR - (Math.hypot(x - SAX, (z - SAZ) * 1.3) + snz));
      if (cw > 0) hf = hf * (1 - cw) + cw * bl * (4 + 12 * n1 + 10 * ridge * n1);
      if (wildW > 0) { var mesa = vnoise(x, z, 38, 72), mh = mesa > 0.64 ? Math.min(14, 5 + Math.round((mesa - 0.64) * 70)) : 0; mesaTop = mh > 0 && wildW > 0.6; hf = hf * (1 - wildW) + wildW * bl * (1.2 + 2 * n2 + mh); }
      if (sw > 0) hf = hf * (1 - sw) + sw * bl * (0.8 + n2);
      // 건축물 자리는 평평하게
      var fk = landmarkFlat(x, z); if (fk) { hf = hf * (1 - fk[1]) + fk[0] * fk[1]; if (fk[1] > 0.5) mesaTop = false; }
    }
    var h = G - 1 + Math.round(hf);
    // 북쪽 바다: 바닷가에서 점점 깊게
    var seaD = (SEA_Z + (vnoise(x, z, 60, 9) - 0.5) * 40) - z;
    if (seaD > -12) h = Math.min(h, G - 1 - Math.round(clamp01((seaD + 12) / 40) * 11 + n2 * 2) + (seaD < 0 ? 1 : 0));
    // 강 골짜기
    var rd = riverDist(x, z);
    if (rd < 15) { var vf = clamp01((rd - 4) / 11); vf = vf * vf; h = Math.round(G - 1 + (h - (G - 1)) * vf); }
    if (h > SY - 4) h = SY - 4;
    var top = GRASS, sub = DIRT, wtop = -1;
    var le = lakeE(x, z), od = Math.hypot(x - OASX, z - OASZ), se = z > 1500 ? saltE(x, z) : 9;
    if (le < 1) { h = G - 2 - Math.floor(5 * (1 - le)); wtop = G - 1; top = hash2(x, z, 1) < 0.5 ? CLAY : SAND; sub = CLAY; }
    else if (od < 11) { h = G - 2 - Math.floor(4 * (1 - od / 11)); wtop = G - 1; top = SAND; sub = CLAY; }
    else if (se < 1) { h = G - 2 - Math.floor(6 * (1 - se)); wtop = G - 1; top = hash2(x, z, 4) < 0.3 ? SALT_CRUST : SAND; sub = SAND; }
    else if (rd <= 2.2) { wtop = h; h = h - 2; top = hash2(x, z, 2) < 0.5 ? CLAY : SAND; sub = SAND; }
    else if (h < G - 1) { wtop = G - 1; top = n2 < 0.3 ? 18 : SAND; sub = SAND; }
    else if (le < 1.3 || od < 16 || rd <= 3.2) { top = le < 1.3 && hash2(x, z, 3) < 0.3 ? CLAY : SAND; sub = SAND; }
    else if (desW > 0.5) { top = SAND; sub = SAND; }
    else if (se < 1.5) { top = SALT_CRUST; sub = SAND; }
    else if (wildW > 0.5) { top = mesaTop ? RED_ROCK : (n2 > 0.62 ? 18 : (n1 > 0.6 ? RED_ROCK : SAND)); sub = RED_ROCK; }
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

  // ── 3부: 사망의 음침한 골짜기(시 23:4) — 동쪽 사막 땅속 14×14칸 미로, 깨지지 않는 깊은 돌, 일곱 등잔대 ──
  var DUN = { x0: DES_X + 60, z0: PZ0 + 100, n: 14, cs: 6, yf: 3, yc: 10 };
  var DUN_LAMPS = [[13, 0], [0, 0], [13, 13], [7, 7], [3, 10], [10, 3], [6, 12]];
  function inDungeon(x, y, z) { return x >= DUN.x0 && x < DUN.x0 + DUN.n * DUN.cs && z >= DUN.z0 && z < DUN.z0 + DUN.n * DUN.cs && y <= DUN.yc + 1; }
  function dunOpen(i, j, dir) {   // 칸 (i,j)에서 동쪽(1)·북쪽(0)으로 길이 열렸나(정해진 무늬 + 가끔 고리)
    var n = DUN.n;
    if (dir === 1 && i >= n - 1) return false; if (dir === 0 && j <= 0) return false;
    var pick = (i >= n - 1) ? 0 : (j <= 0 ? 1 : (hash2(i * 31 + 7, j * 17 + 3, 61) < 0.5 ? 0 : 1));
    return pick === dir || hash2(i * 13 + dir * 101, j * 29 + 5, 62) < 0.12;
  }
  function buildDungeon() {
    var D = DUN, cs = D.cs, X1 = D.x0 + D.n * cs - 1, Z1 = D.z0 + D.n * cs - 1;
    fill(D.x0, 1, D.z0, X1, D.yc, Z1, DEEP);
    for (var j = 0; j < D.n; j++) for (var i = 0; i < D.n; i++) {
      var cx0 = D.x0 + i * cs, cz0 = D.z0 + j * cs;
      fill(cx0 + 1, D.yf + 1, cz0 + 1, cx0 + 4, D.yf + 5, cz0 + 4, AIR);
      if (dunOpen(i, j, 1)) fill(cx0 + 5, D.yf + 1, cz0 + 1, cx0 + 6, D.yf + 5, cz0 + 4, AIR);
      if (dunOpen(i, j, 0)) fill(cx0 + 1, D.yf + 1, cz0 - 1, cx0 + 4, D.yf + 5, cz0, AIR);
    }
    DUN_LAMPS.forEach(function (c, k) { var lx = D.x0 + c[0] * cs + 2, lz = D.z0 + c[1] * cs + 2; fill(lx, D.yf + 1, lz, lx, D.yf + 1, lz, STORY.lamps[k] ? LAMPSTAND + 1 : LAMPSTAND); });
    // 들어가는 곳: 남서쪽 칸(0, n-1)에서 땅 위까지 세로 굴과 사닥다리, 돌 벽돌 입구
    var ex = D.x0 + 2, ez = D.z0 + (D.n - 1) * cs + 2; terrain(ex, ez); var top = T.h;
    fill(ex, D.yf + 1, ez, ex + 1, top + 4, ez + 1, AIR);
    for (var y = D.yf + 1; y <= top + 1; y++) fill(ex, y, ez, ex, y, ez, LADDER + 3);
    fill(ex - 1, D.yf + 1, ez - 1, ex - 1, top + 3, ez + 2, SBRICK); fill(ex + 2, top - 1, ez - 1, ex + 2, top + 3, ez + 2, SBRICK);
    fill(ex - 1, top + 4, ez - 1, ex + 2, top + 4, ez + 2, SBRICK); fill(ex, top + 4, ez, ex + 1, top + 4, ez + 1, AIR);
    fill(ex - 1, top + 3, ez - 1, ex - 1, top + 3, ez - 1, LAMP); fill(ex + 2, top + 3, ez + 2, ex + 2, top + 3, ez + 2, LAMP);
  }
  // ── 4부: 거룩한 성(계 21) — 동쪽 끝, 벽옥 성곽, 열두 진주 문, 서쪽 성벽 밑 기초석 자리 열둘, 정금 길, 생명수 강과 생명나무 ──
  var CITY = { x0: 1888, z0: 946, x1: 1998, z1: 1056 };
  function inCity(x, z) { return x >= CITY.x0 - 3 && x <= CITY.x1 + 3 && z >= CITY.z0 - 3 && z <= CITY.z1 + 3; }
  function cityInside(x, z) { return x > CITY.x0 + 1 && x < CITY.x1 - 1 && z > CITY.z0 + 1 && z < CITY.z1 - 1; }
  function cityGates() {   // 열두 문: 각 변에 셋(가운데 x/z 위치, 변)
    var g = [], C = CITY, w = C.x1 - C.x0;
    [0.25, 0.5, 0.75].forEach(function (f) { var m = Math.round(C.x0 + w * f); g.push(['n', m]); g.push(['s', m]); var mz = Math.round(C.z0 + (C.z1 - C.z0) * f); g.push(['w', mz]); g.push(['e', mz]); });
    return g;
  }
  function socketPos(i) { var C = CITY, zc = Math.round((C.z0 + C.z1) / 2); return [C.x0 - 3, G, zc - 11 + i * 2]; }
  function buildCity() {
    var C = CITY, xm = Math.round((C.x0 + C.x1) / 2), zm = Math.round((C.z0 + C.z1) / 2);
    fill(C.x0 - 4, G, C.z0 - 4, C.x1 + 4, SY - 1, C.z1 + 4, AIR);
    fill(C.x0 - 4, G - 14, C.z0 - 4, C.x1 + 4, G - 2, C.z1 + 4, STONE);
    fill(C.x0 - 4, G - 1, C.z0 - 4, C.x1 + 4, G - 1, C.z1 + 4, 18);
    fill(C.x0 + 2, G - 1, C.z0 + 2, C.x1 - 2, G - 1, C.z1 - 2, GOLDST);
    // 성곽(두께 2, 높이 20)과 성가퀴
    fill(C.x0, G - 1, C.z0, C.x1, G + 19, C.z0 + 1, CITYWALL); fill(C.x0, G - 1, C.z1 - 1, C.x1, G + 19, C.z1, CITYWALL);
    fill(C.x0, G - 1, C.z0, C.x0 + 1, G + 19, C.z1, CITYWALL); fill(C.x1 - 1, G - 1, C.z0, C.x1, G + 19, C.z1, CITYWALL);
    for (var k = C.x0; k <= C.x1; k += 2) { fill(k, G + 20, C.z0, k, G + 20, C.z0, CITYWALL); fill(k, G + 20, C.z1, k, G + 20, C.z1, CITYWALL); }
    for (k = C.z0; k <= C.z1; k += 2) { fill(C.x0, G + 20, k, C.x0, G + 20, k, CITYWALL); fill(C.x1, G + 20, k, C.x1, G + 20, k, CITYWALL); }
    // 열두 진주 문(이야기를 다 마치면 열림)
    var open = STORY.done;
    cityGates().forEach(function (g) {
      var id = open ? AIR : PEARL, m = g[1];
      if (g[0] === 'n') fill(m - 2, G, C.z0, m + 2, G + 6, C.z0 + 1, id);
      if (g[0] === 's') fill(m - 2, G, C.z1 - 1, m + 2, G + 6, C.z1, id);
      if (g[0] === 'w') fill(C.x0, G, m - 2, C.x0 + 1, G + 6, m + 2, id);
      if (g[0] === 'e') fill(C.x1 - 1, G, m - 2, C.x1, G + 6, m + 2, id);
    });
    // 기초석 자리 열둘(서쪽 성벽 밖)
    for (var i = 0; i < 12; i++) { var s = socketPos(i); fill(s[0], s[1], s[2], s[0], s[1], s[2], STORY.sockets[i] ? FSTONE0 + i : SOCKET); }
    // 생명수 강(가운데 남북으로)과 강 좌우 생명나무, 가운데 다리
    fill(xm - 1, G - 4, C.z0 + 2, xm + 1, G - 4, C.z1 - 2, GOLDST); fill(xm - 1, G - 3, C.z0 + 2, xm + 1, G - 1, C.z1 - 2, WATER);
    fill(xm - 1, G - 1, zm - 1, xm + 1, G - 1, zm + 1, GOLDST);
    for (var tz = C.z0 + 6; tz <= C.z1 - 6; tz += 8) [xm - 4, xm + 4].forEach(function (tx) {
      fill(tx, G, tz, tx, G + 5, tz, LOG);
      for (var ly = G + 4; ly <= G + 7; ly++) { var r = ly >= G + 7 ? 1 : 2; for (var dz = -r; dz <= r; dz++) for (var dx = -r; dx <= r; dx++) { if (r === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue; if (dx === 0 && dz === 0 && ly <= G + 5) continue; fill(tx + dx, ly, tz + dz, tx + dx, ly, tz + dz, LIFELEAF); } }
    });
  }
  // 광석 난수는 2칸·3칸 덩이마다 같은 값이라 덩이마다 한 번만 계산해 둔다(값은 hash2 그대로 — 세상 모양은 한 칸도 안 바뀜)
  var OC = new Float64Array(16 * 16 * SY), CLC = new Float64Array(16 * 16 * (SY >> 1) + 256), CCC = new Float64Array(12 * 12 * 28);
  function genColumn(cx, cz) {
    OC.fill(NaN); CLC.fill(NaN); CCC.fill(NaN);
    var col = { d: new Uint16Array(CS * SY * CS), sky: new Int16Array(CS * CS), lamps: [], mod: false };
    genCol = col; genCX = cx; genCZ = cz;
    var x0 = cx * CS, z0 = cz * CS, lx, lz, x, z, y;
    var tops = new Int16Array(CS * CS), topIds = new Uint8Array(CS * CS), wtops = new Int16Array(CS * CS);
    for (lz = 0; lz < CS; lz++) for (lx = 0; lx < CS; lx++) {
      x = x0 + lx; z = z0 + lz;
      terrain(x, z);
      var h = T.h, d = col.d;
      d[(0 * CS + lz) * CS + lx] = BASALT;
      // 칸마다 한 번만: 깊은 돌 높이, 이 지역 보석이 나올 수 있는 높이 범위(그 밖은 보석 계산을 건너뛴다 — 결과는 같음)
      var deepY = 4 + Math.floor(hash2(x >> 2, z >> 2, 17) * 3), gemLo = 99, gemHi = -1;
      for (var gq = 0; gq < 12; gq++) { var gr = GEMS[gq]; if (gr && gr[3] === T.reg) { if (gr[4] < gemLo) gemLo = gr[4]; if (gr[5] > gemHi) gemHi = gr[5]; } }
      for (y = 1; y <= h; y++) {
        var id = y === h ? T.top : (y > h - 4 ? T.sub : STONE);
        if (T.reg === 'wild' && id === STONE && y >= G - 3) id = y % 3 === 0 ? RED_ROCK2 : RED_ROCK;   // 광야: 붉은 바위 켜
        if (id === STONE && y < h - 2) {
          // 돌 속 석회암·검은 돌(2칸씩 뭉쳐서)
          var pk = ((lz >> 1) * 16 + (lx >> 1)), oi = pk * SY + y, o = OC[oi];
          if (o !== o) o = OC[oi] = hash2((x >> 1) * 3 + y, (z >> 1) * 5 - (y >> 1), 7);
          var ci = pk * (SY >> 1) + (y >> 1), cl = CLC[ci];
          if (cl !== cl) cl = CLC[ci] = hash2((x >> 1) * 7 + (y >> 1) * 131, (z >> 1) * 11 - (y >> 1) * 17, 13);
          if (o < 0.035) id = y < 7 || o < 0.008 ? BASALT : LIME;
          else if (cl < 0.0695 && hash2(x * 3 + y * 7, z * 5 - y, 14) < 0.35) {   // 11/19 광석 절반으로(전도사님 「광물이 너무 잘 나와」)   // cl이 크면 광석이 될 수 없으니 이 난수는 건너뜀
            if (cl < 0.006 && y <= 12) id = ORE_AU;
            else if (cl >= 0.006 && cl < 0.014 && y <= 18) id = ORE_AG;
            else if (cl >= 0.014 && cl < 0.034 && y <= 48) id = ORE_FE;
            else if (cl >= 0.034 && cl < 0.06 && y <= 64) id = ORE_CU;
            else if (cl >= 0.06 && cl < 0.064 && y <= 22) id = ORE_ONYX;
            else if (cl >= 0.064 && cl < 0.067 && y <= 10) id = ORE_SAPH;
            else if (cl >= 0.067 && cl < 0.0695 && y <= 8) id = ORE_DIA;
          }
          // 석탄: 큰 덩이(3칸씩)로 흔하게, 산 속 높은 곳까지
          if (id === STONE && y <= 72) { var fx3 = Math.floor(x / 3), fz3 = Math.floor(z / 3), fy3 = Math.floor(y / 3), cci = ((fz3 - Math.floor(z0 / 3)) * 12 + (fx3 - Math.floor(x0 / 3))) * 28 + fy3, cc = CCC[cci]; if (cc !== cc) cc = CCC[cci] = hash2(fx3 * 13 + fy3 * 71, fz3 * 17 - fy3 * 5, 15); if (cc < 0.05 && hash2(x * 5 + y, z * 3 - y * 2, 16) < 0.375) id = ORE_COAL; }
          // 열두 보석 광석: 곳마다·깊이마다 다르고 아주 드묾(계 21:19-20)
          if (id === STONE && y >= gemLo && y <= gemHi) {
            var gv = hash2(x * 7 + y * 131, z * 11 - y * 17, 41), gb = 0.3;
            for (var gi = 0; gi < 12; gi++) { var gg = GEMS[gi]; if (gg && gg[3] === T.reg && y >= gg[4] && y <= gg[5] && gv >= gb && gv < gb + gg[6]) { id = gemOre(gi); break; } gb += 0.002; }
          }
          // 맨 아래 몇 칸은 깊은 돌(더 단단함)
          if (y <= deepY) { if (id === STONE) id = DEEP; else if (DEEPV[id]) id = DEEPV[id]; }
        }
        d[(y * CS + lz) * CS + lx] = id;
      }
      for (y = h + 1; y <= T.wtop; y++) d[(y * CS + lz) * CS + lx] = WATER;
      tops[lz * CS + lx] = h; topIds[lz * CS + lx] = T.top; wtops[lz * CS + lx] = T.wtop;
      // 물가 갈대, 들꽃
      if (T.wtop < 0) {
        var le = lakeE(x, z), od = Math.hypot(x - OASX, z - OASZ), hh = hash2(x, z, 11);
        if (T.reg === 'salt' && T.top === SALT_CRUST && hh < 0.005 && h + 6 < SY && !landmarkAt(x, z, 4)) { var sk = 2 + Math.floor(hash2(x, z, 12) * 5); for (var sy = 1; sy <= sk; sy++) d[((h + sy) * CS + lz) * CS + lx] = SALT_ROCK; }
        else if (((le >= 1 && le < 1.22) || (od >= 11 && od < 13.5) || (T.rd > 2.2 && T.rd < 3.6)) && hh < 0.45 && h + 1 < SY) d[((h + 1) * CS + lz) * CS + lx] = REED;
        else if (T.top===GRASS && hh>.92 && hh<=.955 && !inTown(x,z) && !inCommons(x,z) && h+1<SY)
          d[((h+1)*CS+lz)*CS+lx]=le<2.1 || T.rd<12?LILY:(z>1210||x>VX1+70?THORN:THISTLE);
        else if (T.top === GRASS && hh > 0.955 && plotAt(x, z) < 0 && !(z > AZ0 - 5 && z < AZ1 + 5 && x > AX0 - 5 && x < AX1 + 5)) d[((h + 1) * CS + lz) * CS + lx] = FLOWER;
      }
    }
    carveCaves(col, cx, cz, tops, wtops);
    buildFrontierCave(x0,z0,tops);
    // 나무: 7칸 격자마다 한 그루 후보(옆 기둥 나무도 걸치게)
    for (var gz = Math.floor((z0 - 6) / 7); gz <= Math.floor((z0 + CS + 6) / 7); gz++) for (var gx = Math.floor((x0 - 6) / 7); gx <= Math.floor((x0 + CS + 6) / 7); gx++) {
      var tx = gx * 7 + Math.floor(hash2(gx, gz, 21) * 6), tz = gz * 7 + Math.floor(hash2(gx, gz, 22) * 6);
      if (landmarkAt(tx, tz, 13)) continue;
      if (inTown(tx, tz) || distOut(tx, tz) < 6 || plotAt(tx, tz) >= 0 || (tx >= COMMONS[0] - 4 && tx <= COMMONS[2] + 4 && tz >= COMMONS[1] - 4 && tz <= COMMONS[3] + 4)) continue;
      terrain(tx, tz);
      if (T.wtop >= 0) continue;
      var reg = T.reg, p = reg === 'cedar' ? 0.62 : reg === 'wild' ? 0.035 : reg === 'salt' ? 0 : reg === 'east' ? 0.6 : (reg === 'south' ? 0.16 : (reg === 'west' || reg === 'ararat' ? 0.14 : (reg === 'other' ? 0.1 : 0)));
      var palm = reg === 'oasis' || (reg === 'desert' && hash2(gx, gz, 24) < 0.015);
      if (palm) p = reg === 'oasis' ? 0.7 : 1;
      if (hash2(gx, gz, 23) > p) continue;
      if (palm) { if (T.top === SAND) palmTree(tx, T.h + 1, tz, 8 + Math.floor(hash2(gx, gz, 25) * 4)); continue; }
      if (T.top !== GRASS && !(reg === 'wild' && T.top === SAND)) continue;
      var t2 = T.h; terrain(tx + 1, tz + 1); if (T.h !== t2) continue;
      if (reg === 'cedar') cedarTree(tx, t2 + 1, tz, 14 + Math.floor(hash2(gx, gz, 26) * 8));
      else if (reg === 'wild') acaciaTree(tx, t2 + 1, tz, 5 + Math.floor(hash2(gx, gz, 26) * 3));
      else tree(tx, t2 + 1, tz, 7 + Math.floor(hash2(gx, gz, 26) * 5));
    }
    // 함께 짓는 터: 평평한 풀밭 + 자갈 테두리 + 네 귀퉁이 등불
    if (x0 + CS > COMMONS[0] - 1 && x0 < COMMONS[2] + 2 && z0 + CS > COMMONS[1] - 1 && z0 < COMMONS[3] + 2) {
      fill(COMMONS[0] - 1, G, COMMONS[1] - 1, COMMONS[2] + 1, SY - 1, COMMONS[3] + 1, AIR);
      fill(COMMONS[0] - 1, G - 12, COMMONS[1] - 1, COMMONS[2] + 1, G - 2, COMMONS[3] + 1, DIRT);
      fill(COMMONS[0], G - 1, COMMONS[1], COMMONS[2], G - 1, COMMONS[3], GRASS);
      fill(COMMONS[0] - 1, G - 1, COMMONS[1] - 1, COMMONS[2] + 1, G - 1, COMMONS[1] - 1, 18); fill(COMMONS[0] - 1, G - 1, COMMONS[3] + 1, COMMONS[2] + 1, G - 1, COMMONS[3] + 1, 18);
      fill(COMMONS[0] - 1, G - 1, COMMONS[1] - 1, COMMONS[0] - 1, G - 1, COMMONS[3] + 1, 18); fill(COMMONS[2] + 1, G - 1, COMMONS[1] - 1, COMMONS[2] + 1, G - 1, COMMONS[3] + 1, 18);
      [[COMMONS[0] - 1, COMMONS[1] - 1], [COMMONS[2] + 1, COMMONS[1] - 1], [COMMONS[0] - 1, COMMONS[3] + 1], [COMMONS[2] + 1, COMMONS[3] + 1]].forEach(function (c) { fill(c[0], G, c[1], c[0], G, c[1], LAMP); });
    }
    // 이야기 3부·4부: 사막 땅속 「사망의 음침한 골짜기」 미로, 동쪽 끝 「거룩한 성」
    if (x0 + CS > DUN.x0 && x0 < DUN.x0 + DUN.n * DUN.cs && z0 + CS > DUN.z0 && z0 < DUN.z0 + DUN.n * DUN.cs) buildDungeon();
    if (x0 + CS > CITY.x0 - 4 && x0 < CITY.x1 + 4 && z0 + CS > CITY.z0 - 4 && z0 < CITY.z1 + 4) buildCity();
    // 마을·방주(그 기둥에 걸친 부분만)
    // 동쪽 끝은 마을 땅과 방주 중 더 먼 쪽까지(마을 땅만 보면 방주 동쪽 끝 기둥이 빠져 뚫렸었다)
    if (x0 + CS > Math.min(TOWN[0][0], TOWN[1][0]) - 6 && x0 < Math.max(TOWN[0][2], TOWN[1][2]) + 6 && z0 + CS > TOWN[0][1] - 6 && z0 < LZ - LRZ) buildTown();
    if (x0 + CS > TARR[0] && x0 < TARR[2] + 6 && z0 + CS > TARR[1] && z0 < TARR[3] + 6)
      TARPITS.forEach(function (t) { fill(t[0], G - 1, t[1], t[0] + t[2] - 1, G - 1, t[1] + t[2] - 1, AIR); fill(t[0], G - 3, t[1], t[0] + t[2] - 1, G - 2, t[1] + t[2] - 1, TAR); });
    buildExcursions(x0,z0);
    if(villageProjectsEnabled)buildBridgeGround(x0,z0);
    // 학생 집
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var po = plotOrigin(i);
      if (po.x + PLOT <= x0 || po.x >= x0 + CS || po.z + PLOT <= z0 || po.z >= z0 + CS) continue;
      if (plotData[i]) { var a = plotData[i], k = 0; for (y = PY0; y < G + PH; y++) for (z = 0; z < PLOT; z++) for (x = 0; x < PLOT; x++) setRaw(po.x + x, y, po.z + z, a[k++]); }
    }
    buildLandmarks(x0, z0);
    if (HOREB_X >= x0 - 2 && HOREB_X < x0 + CS + 2 && HOREB_Z >= z0 - 2 && HOREB_Z < z0 + CS + 2) buildHoreb();
    markPlots();
    var ed = EDITS[cz * NC + cx]; if (ed) for (var li in ed) col.d[li] = ed[li];
    col.machines=new Set();
    genCol = null;
    // 하늘 그늘, 등불
    for (lz = 0; lz < CS; lz++) for (lx = 0; lx < CS; lx++) skyScan(col, lx, lz);
    for (var q = 0; q < col.d.length; q++) {
      var bid=col.d[q];
      if(isFrontierMachine(bid))col.machines.add(q);
      if (LIGHTS[bid]) {
        var qx=q%CS,r0=(q-qx)/CS,qz=r0%CS,qy=(r0-qz)/CS;
        col.lamps.push([x0+qx,qy,z0+qz]);
      }
    }
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
  // ── 절기: 대림절 첫 주일 ~ 주현절(1/6)은 성탄 장식, 12~2월은 눈(사막 빼고). 주소에 ?season=christmas 를 붙이면 미리 보기 ──
  function adventStart(y) { var c = new Date(y, 11, 25), back = (c.getDay() || 7) + 21; return new Date(y, 11, 25 - back); }
  function festiveOn() {
    if (/season=christmas/.test(location.search)) return true;
    var d = new Date(), y = d.getFullYear(), t = new Date(y, d.getMonth(), d.getDate());
    return t >= adventStart(y) || t <= new Date(y, 0, 6);
  }
  function winterOn() { var m = new Date().getMonth() + 1; return /season=(christmas|winter)/.test(location.search) || m === 12 || m <= 2; }
  var FESTIVE = festiveOn(), WINTER = winterOn();
  var NAT_X = XM - 68, NAT_Z = AZ1 + 3;   // 베들레헴 마구간(마을 남쪽 광장 서쪽, 마을 구역이라 캘 수 없음)
  function buildNativity() {
    if (!FESTIVE) return;
    var x0 = NAT_X, z0 = NAT_Z, x1 = x0 + 10, z1 = z0 + 8, y = G;
    fill(x0, G - 1, z0, x1, G - 1, z1, 22);                                   // 짚 바닥
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [x0, z0 + 4], [x1, z0 + 4]].forEach(function (c) { fill(c[0], y, c[1], c[0], y + 3, c[1], LOG); });
    fill(x0, y, z0 + 1, x0, y + 2, z1 - 1, GOPHER);                           // 뒷벽(서쪽)
    fill(x0 + 1, y, z0, x1 - 1, y + 1, z0, GOPHER); fill(x0 + 1, y, z1, x1 - 1, y + 1, z1, GOPHER);   // 옆 낮은 벽
    fill(x0 - 1, y + 4, z0 - 1, x1 + 1, y + 4, z1 + 1, 22);                   // 짚 지붕
    setRaw(x0 + 4, y, z0 + 4, MANGER);                                        // 구유(눅 2:7)
    setRaw(x0 + 1, y, z0 + 1, 22); setRaw(x0 + 1, y + 1, z0 + 1, 22); setRaw(x0 + 1, y, z1 - 1, 22); setRaw(x0 + 2, y, z1 - 1, 22);
    setRaw(x0 + 2, y, z0 + 2, OIL_LAMP); setRaw(x0 + 2, y, z1 - 2, OIL_LAMP);
    for (var z = AZ1 + 2; z < PZ0 - 1; z += 4) { setRaw(XM - 5, y, z, LANTERN); setRaw(XM + 4, y, z, LANTERN); }   // 마을 길 등불
  }
  // ── 광야(출 13·16·17장): 호렙의 반석 · 구름 기둥과 불 기둥 · 아침 만나 ──
  var HOREB_X = DES_X + 120, HOREB_Z = OASZ - 40, HOREB_Y = -1;
  function horebY() { if (HOREB_Y < 0) { terrain(HOREB_X, HOREB_Z); HOREB_Y = T.h + 1; } return HOREB_Y; }
  function buildHoreb() {
    var y = horebY();
    fill(HOREB_X - 1, y, HOREB_Z - 1, HOREB_X + 1, y + 2, HOREB_Z + 1, BASALT);
    setRaw(HOREB_X, y + 3, HOREB_Z, BASALT);
  }
  function inHoreb(x, y, z) { var hy = horebY(); return Math.abs(x - HOREB_X) <= 1 && Math.abs(z - HOREB_Z) <= 1 && y >= hy && y <= hy + 3; }
  function strikeRock() {
    if (HOTBAR[sel] === STAFF && have(STAFF)) {
      var y = horebY(), sx = HOREB_X + 2, sz = HOREB_Z;
      if (get(sx, y, sz) === AIR) setBlock(sx, y, sz, WATER);
      if (get(sx + 1, y, sz) === AIR) setBlock(sx + 1, y, sz, WATER);
      swingT = 0.25; sfx('break', 1); unlock('rock');
      showVerseCard('💧', '호렙의 반석', '내가 호렙 산에 있는 그 반석 위 거기서 네 앞에 서리니 너는 그 반석을 치라 그것에서 물이 나오리니 백성이 마시리라 모세가 이스라엘 장로들의 목전에서 그대로 행하니라', '출애굽기 17:6', '반석에서 물이 솟았어요');
    } else showVerseCard('🪨', '호렙의 반석', '내가 호렙 산에 있는 그 반석 위 거기서 네 앞에 서리니 너는 그 반석을 치라 그것에서 물이 나오리니 백성이 마시리라 모세가 이스라엘 장로들의 목전에서 그대로 행하니라', '출애굽기 17:6', '지팡이를 들고 반석을 쳐 보세요');
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
    buildNativity();
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
    // ── 완성된 방주 안(창 6:14·19·21, 7:13) ──
    var LOW = AY0 + 1, MID = AY0 + 11, TOP = AY0 + 21;
    // 아래·가운데 층 칸: 앞은 울타리(가운데 세 칸은 드나드는 곳), 안쪽 벽에 짚더미와 물 항아리
    [LOW, MID].forEach(function (y) {
      for (var x0 = AX0 + 1; x0 < AX1; x0 += 25) {
        var x1 = Math.min(x0 + 23, AX1 - 1), mid = (x0 + x1) >> 1;
        [[AZ0 + 18, AZ0 + 1, 1], [AZ1 - 18, AZ1 - 1, -1]].forEach(function (s) {
          if (s[2] < 0 && y === LOW && x1 >= XM - 8 && x0 <= XM + 8) return;   // 문 앞 넓은 마당은 비워 둔다
          for (var fx = x0; fx <= x1; fx++) if (Math.abs(fx - mid) > 1) setRaw(fx, y, s[0], FENCE);
          setRaw(x0 + 1, y, s[1], 22); setRaw(x0 + 2, y, s[1], 22); setRaw(x0 + 1, y + 1, s[1], 22);   // 짚더미
          setRaw(x1 - 1, y, s[1], JAR);   // 물 항아리
        });
      }
    });
    // 위층 서쪽: 노아와 아들 셋 부부의 방 넷(창 7:13)
    for (var r = 0; r < 4; r++) {
      var rx = AX0 + 3 + r * 11, rz0 = AZ0 + 1, rz1 = AZ0 + 11;
      fill(rx, TOP, rz0, rx, TOP + 2, rz1, GOPHER);
      fill(rx + 10, TOP, rz0, rx + 10, TOP + 2, rz1, GOPHER);
      fill(rx, TOP, rz1, rx + 10, TOP + 2, rz1, GOPHER);
      fill(rx + 4, TOP, rz1, rx + 6, TOP + 1, rz1, AIR);   // 방 문
      setRaw(rx + 2, TOP, rz0 + 1, BED); setRaw(rx + 8, TOP, rz0 + 1, BED);
      fill(rx + 3, TOP, rz0 + 4, rx + 7, TOP, rz0 + 7, CARPET);
      setRaw(rx + 5, TOP, rz0 + 1, OIL_LAMP);
      setRaw(rx + 2, TOP, rz0 + 8, CHAIR); setRaw(rx + 8, TOP, rz0 + 8, CHAIR);
    }
    // 위층 동쪽: 먹을 모든 양식을 저축한 곳간(창 6:21)
    var sx0 = AX1 - 42;
    fill(sx0, TOP, AZ0 + 1, sx0, TOP + 2, AZ0 + 16, GOPHER);
    fill(sx0, TOP, AZ0 + 16, AX1 - 1, TOP + 2, AZ0 + 16, GOPHER);
    fill(sx0 + 18, TOP, AZ0 + 16, sx0 + 21, TOP + 1, AZ0 + 16, AIR);   // 곳간 문
    for (x = sx0 + 2; x < AX1 - 2; x += 3) {
      setRaw(x, TOP, AZ0 + 2, JAR); setRaw(x, TOP, AZ0 + 4, (x & 1) ? OIL_JAR : JAR);
      setRaw(x + 1, TOP, AZ0 + 8, 22); setRaw(x + 1, TOP + 1, AZ0 + 8, 22);
      setRaw(x, TOP, AZ0 + 12, LOG_X);
    }
    fill(AX1 - 1, TOP, AZ0 + 1, AX1 - 1, TOP + 2, AZ0 + 15, SHELF);
  }
  // 방주 안 동물: 혈육 있는 생물을 암수 한 쌍씩(창 6:19). 가까이 오면 불러오고, 멀어지면 다른 동물처럼 정리된다
  var ARK_PAIRS = [['camel', XM - 13, 0, 0], ['cow', XM + 12, 0, 0], ['horse', XM - 38, 1, 0], ['donkey', XM + 37, 1, 0],
    ['sheep', XM - 13, 0, 1], ['goat', XM + 12, 0, 1], ['rabbit', XM - 38, 1, 1]];
  function arkBeasts(px, pz) {
    if (px < AX0 - 60 || px > AX1 + 60 || pz < AZ0 - 60 || pz > AZ1 + 60) return;
    if (animals.some(function (a) { return a.arkPet; })) return;
    ARK_PAIRS.forEach(function (p) {
      var z = (p[2] ? AZ1 - 9 : AZ0 + 9) + 0.5, y = p[3] ? AY0 + 11 : AY0 + 1;
      [-2, 2].forEach(function (dx) {
        var x = p[1] + dx + 0.5;
        if (!colAt(x | 0, z | 0) || !isSolid(get(x | 0, y - 1, z | 0))) return;
        var a = makeBeast(p[0], x, z);
        a.arkPet = true; a.y = a.ty = y; a.mesh.position.y = y; a.h = p[2] ? 0 : Math.PI;
        animals.push(a);
      });
    });
  }

  var plotData = {};   // 필지 번호 → 그 땅 블록(Uint16Array)
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
  function faceTile(id, f) {
    if (id === LOG_X) return f < 2 ? TILE.logTop : TILE.logSideH;   // 동서로 눕힌 통나무
    if (id === LOG_Z) return f >= 4 ? TILE.logTop : (f < 2 ? TILE.logSideH : TILE.logSide);   // 남북으로 눕힌 통나무
    return BT[id][f === 2 ? 0 : (f === 3 ? 2 : 1)];
  }

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
  // 등불마다 빈칸을 따라 퍼지며(벽은 못 지나감) 닿는 칸을 표시 — 칸마다 등불 32개까지 비트로
  var LR = CS + 16, LMASK = new Int32Array(LR * LR * LR), LQ = new Int32Array(4096 * 3);
  function lightPass(id) { return isTrans(id) || !isSolid(id); }
  function lampReach(lamps, x0, y0, z0) {
    LMASK.fill(0);
    for (var i = 0; i < lamps.length; i++) {
      var l = lamps[i], bit = 1 << i, lx = l[0], ly = l[1], lz = l[2], qh = 0, qt = 0;
      var r0 = ((ly - y0 + 8) * LR + (lz - z0 + 8)) * LR + (lx - x0 + 8);
      if (lx - x0 + 8 < 0 || ly - y0 + 8 < 0 || lz - z0 + 8 < 0 || lx - x0 + 8 >= LR || ly - y0 + 8 >= LR || lz - z0 + 8 >= LR) continue;
      LMASK[r0] |= bit; LQ[qt++] = lx; LQ[qt++] = ly; LQ[qt++] = lz;
      while (qh < qt && qt < LQ.length - 18) {
        var x = LQ[qh++], y = LQ[qh++], z = LQ[qh++];
        for (var f = 0; f < 6; f++) {
          var nx = x + (f === 0 ? 1 : f === 1 ? -1 : 0), ny = y + (f === 2 ? 1 : f === 3 ? -1 : 0), nz = z + (f === 4 ? 1 : f === 5 ? -1 : 0);
          var dx = nx - lx, dy = ny - ly, dz = nz - lz; if (dx * dx + dy * dy + dz * dz > 64) continue;
          var rx = nx - x0 + 8, ry = ny - y0 + 8, rz = nz - z0 + 8;
          if (rx < 0 || ry < 0 || rz < 0 || rx >= LR || ry >= LR || rz >= LR || ny < 0 || ny >= SY) continue;
          var ri = (ry * LR + rz) * LR + rx; if (LMASK[ri] & bit) continue;
          LMASK[ri] |= bit;   // 벽 칸도 빛은 받음(그 면은 빈칸 쪽에서 계산), 지나가지는 못함
          if (lightPass(get(nx, ny, nz))) { LQ[qt++] = nx; LQ[qt++] = ny; LQ[qt++] = nz; }
        }
      }
    }
  }
  function buildChunk(cx, cy, cz) {
    var key = cx + ',' + cy + ',' + cz, old = chunks[key];
    if (old) { old.forEach(function (m) { scene.remove(m); m.geometry.dispose(); }); }
    var P = [[], [], []], C = [[], [], []], U = [[], [], []], I = [[], [], []];
    var x0 = cx * CS, y0 = cy * CS, z0 = cz * CS;
    var colm = COLS[cz * NC + cx]; if (!colm) { delete chunks[key]; return; } var cd = colm.d;
    var lamps = lampsNear(x0 - 8, y0 - 8, z0 - 8, x0 + CS + 8, y0 + CS + 8, z0 + CS + 8);
    if (lamps.length > 32) { var mcx = x0 + 16, mcy = y0 + 16, mcz = z0 + 16; lamps.sort(function (a, b) { return (Math.abs(a[0] - mcx) + Math.abs(a[1] - mcy) + Math.abs(a[2] - mcz)) - (Math.abs(b[0] - mcx) + Math.abs(b[1] - mcy) + Math.abs(b[2] - mcz)); }); lamps.length = 32; }
    if (lamps.length) lampReach(lamps, x0, y0, z0);
    // 등불 빛은 벽에 막힌다: 등불에서 빈칸을 따라 닿는 칸에만(cx,cy,cz = 빛을 받는 빈칸)
    function blk(px, py, pz, cx, cy, cz) {
      if (!lamps.length) return 0;
      var rx = cx - x0 + 8, ry = cy - y0 + 8, rz = cz - z0 + 8;
      var mask = (rx < 0 || ry < 0 || rz < 0 || rx >= LR || ry >= LR || rz >= LR) ? -1 : LMASK[(ry * LR + rz) * LR + rx];
      if (!mask) return 0;
      var best = 0;
      for (var i = 0; i < lamps.length; i++) {
        if (!(mask & (1 << i))) continue;
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
                v = CROSS[q][k]; P[2].push(x + v[0], y + v[1] * (FARM_PLANTS[id] && id >= 410 ? plantHeight(id) : 1), z + v[2]);
                uv = tileUV(tp, k < 2 ? 0 : 1, v[1]); U[2].push(uv[0], uv[1]); C[2].push(ps, def[5] || LIGHTS[id] ? 1 : blk(x + v[0], y + v[1], z + v[2], x, y, z), (v[1] > 0.5 && !def[5] && !LIGHTS[id]) ? 1 : 0);
              }
              I[2].push(start, start + 1, start + 2, start, start + 2, start + 3);
            }
            continue;
          }
          if (def[6] === 'shape') {
            // 문·계단·반 블록·울타리: 작은 상자들
            var sb = shapeBoxes(id, x, y, z), sh0 = SHAPE[id].type === 'wtorch' || SHAPE[id].type === 'lantern' || id === LAMPSTAND + 1 ? 1 : skyLight(x, y + 1, z), bk = SHAPE[id].type === 'ladder' ? 2 : (SHAPE[id].type === 'pane' || SLAB_MATERIAL[baseOf(id)] === GLASS ? 1 : 0);
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
                  C[bk].push(F2.s * sh0, blk(x + vx, y + vy, z + vz, x, y, z) * F2.s, 0);
                }
                I[bk].push(start, start + 1, start + 2, start, start + 2, start + 3);
              }
            }
            continue;
          }
          var tr = def[4] === 1 ? 1 : 0, lit = def[5] === 1, water = id === WATER;
          var lowTop = water && get(x, y + 1, z) !== WATER;
          var jitter = water ? 1 : -1;   // 보이는 면이 있을 때만 계산
          for (var f = 0; f < 6; f++) {
            var F = FACES[f], nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2], nb = get(nx, ny, nz);
            if (!(nb === AIR || (isTrans(nb) && nb !== id))) continue;
            if (water && f === 3) continue;
            var t = faceTile(id, f);
            if (jitter < 0) jitter = 0.97 + rnd(x * 7.1 + y * 13.3 + z * 3.7) * 0.06;
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
                ao = 1 - occ * 0.18;   // 모서리 그늘(조금 진하게)
              }
              var m = Math.min(1, shade * ao);
              C2.push(m, lit ? 1 : blk(x + v[0], y + v[1], z + v[2], nx, ny, nz) * ao * F.s, water ? 2 : 0);
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
    if (id === RAIL) return [[.18,0,.34,.82,1,.66]];
    if (BUILD_BLOCKS.some(function(d) { return d[0] === id; }) || sp.type === 'gate' || sp.type === 'extension') return shapeBoxes(id,0,0,0);
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
  var HW = 0.42, HT = 3.4, EYE = 3.1, REACH = 6;   // 손이 닿는 거리: 눈에서 6.5칸(사람 키의 두 배쯤, 전도사님 「너무 멀리서도 캐져」 11/18)   // 몸 너비 0.84칸: 한 칸짜리 문을 지나갈 수 있게
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
    if (f.agal) { deco('head', parts.head, 9, 0.9, 9, f.agal, 0, 7.2, 0); }
    if (f.beard) { deco('face', parts.head, 7, 3.6, 1, f.beard, 0, 1.4, -4.3); deco('face', parts.head, 1.2, 3, 6, f.beard, -3.9, 2.6, -1); deco('face', parts.head, 1.2, 3, 6, f.beard, 3.9, 2.6, -1); }   // 머릿수건을 누르는 띠
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
  function collides(px, py, pz, barrierOnly) {
    for (var x = Math.floor(px - HW); x <= Math.floor(px + HW); x++)
      for (var y = Math.floor(py); y <= Math.floor(py + curHT - 0.01); y++)
        for (var z = Math.floor(pz - HW); z <= Math.floor(pz + HW); z++)
          {
            var cid = get(x, y, z);
            if (barrierOnly && cid !== RAIL && !(SHAPE[cid] && SHAPE[cid].type === 'gate' && !SHAPE[cid].open)) continue;
            if (!isSolid(cid) || (riding && cid === LEAF)) continue;   // 타고 있을 때는 나뭇잎을 헤치고 지나감
            if (!SHAPE[cid]) return true;
            var bs = collBoxes(cid, x, y, z);
            for (var bi2 = 0; bi2 < bs.length; bi2++) {
              var b = bs[bi2];
              if (px + HW > x + b[0] && px - HW < x + b[3] && py + curHT > y + b[1] && py < y + b[4] && pz + HW > z + b[2] && pz - HW < z + b[5]) return true;
            }
          }
    return false;
  }
  function onLadder() { for (var y = Math.floor(P.y); y <= Math.floor(P.y + 1.6); y++) { var id = get(Math.floor(P.x), y, Math.floor(P.z)); if (SHAPE[id] && SHAPE[id].type === 'ladder') return true; } return false; }
  function inWater() { return get(Math.floor(P.x), Math.floor(P.y + 1), Math.floor(P.z)) === WATER; }
  // 웅크리면 가장자리에서 떨어지지 않음: 새 자리 발밑에 받칠 블록이 하나도 없으면 멈춤
  function supported(px, py, pz) {
    for (var x = Math.floor(px - HW); x <= Math.floor(px + HW); x++) for (var z = Math.floor(pz - HW); z <= Math.floor(pz + HW); z++) { var b = get(x, Math.floor(py - 0.05), z); if (isSolid(b) && !(SHAPE[b] && collBoxes(b, x, Math.floor(py - 0.05), z).length === 0)) return true; }
    return false;
  }
  function moveAxis(axis, d) {
    if (!d) return false;
    var steps = Math.ceil(Math.abs(d) / 0.2), s = d / steps;
    for (var i = 0; i < steps; i++) {
      var nx = P.x + (axis === 0 ? s : 0), ny = P.y + (axis === 1 ? s : 0), nz = P.z + (axis === 2 ? s : 0);
      if (axis !== 1 && P.sneak && P.ground && !supported(nx, P.y, nz)) return true;
      if (collides(nx, ny, nz)) {
        if (axis !== 1 && collides(nx, ny, nz, true)) return true;
        // 1칸까지는 계단처럼 저절로 올라감 — 올라선 자리에 몸이 들어가기만 하면 됨(문 아래·나뭇잎 밑·낮은 굴에서도)
        if (axis !== 1 && (P.ground || P.swim || P.ladder || performance.now() - (P.groundAt || 0) < 150) && !P.fly) {
          var up = !collides(nx, ny + 0.51, nz) ? 0.51 : (!collides(nx, ny + 1.01, nz) ? 1.01 : 0);
          if (up) { P.y += up; P.camY -= up; P.x = nx; P.z = nz; continue; }
          // 휴대폰: 2칸 턱이면 저절로 뛰어오름(자동 점프, 메뉴에서 끌 수 있음)
          if (isTouch && S.autoJump !== false && P.ground && !P.swim && P.vy <= 0 && !riding && !collides(nx, ny + 2.05, nz) && !collides(P.x, P.y + 2.4, P.z)) { P.vy = 15.2; exhaust(0.05); }
        }
        // 말·나귀를 타고 있을 때도 2칸 턱은 저절로 뛰어넘음
        if (axis !== 1 && riding && P.ground && P.vy <= 0 && !collides(nx, ny + 2.05, nz)) P.vy = riding.sp.jump;
        return true;
      }
      P.x = nx; P.y = ny; P.z = nz;
    }
    return false;
  }

  // ───────── 설정·가방(이 기기에 저장, 로그인하면 내 땅 기록에도 저장) ─────────
  var S = { sens: 1, aim: 'cross', sound: true, view: 0, lightMode: false };
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
  // 가방: 36칸, 한 칸에 한 묶음(77개, 도구·옷·안장은 1개). 관리자는 끝없음(∞)
  var STACK = 77, BAG_SLOTS = 36;
  function stackOf(id) { return isTool(id) || WEARINFO[id] || id === SADDLE || id === SWORD || id === BOW || id === CART ? 1 : STACK; }
  function slotsFor(id, n) { return n > 0 ? Math.ceil(n / stackOf(id)) : 0; }
  function usedSlots() { var s = 0; for (var k in BAG) if (BAG[k] > 0) s += slotsFor(+k, BAG[k]); return s; }
  // 이 물건을 몇 개 더 담을 수 있나(채우다 만 묶음 + 빈 칸)
  function room(id) {
    if (isAdm()) return 1e9;
    var st = stackOf(id), cur = BAG[id] || 0, part = cur % st ? st - cur % st : 0;
    return Math.min(9999 - cur, part + Math.max(0, BAG_SLOTS - usedSlots()) * st);
  }
  function fmtN(n) { return isAdm() ? '∞' : String(n); }
  // 단축 칸에는 한 묶음만(최대 77, 도구·옷은 1) — 다 쓰면 가방의 다음 묶음이 채워짐
  function hotCount(id) { return Math.min(have(id), stackOf(id)); }
  var fullT = 0;
  function bagFull() { var now = performance.now(); if (now - fullT > 4000) { fullT = now; toast('🎒 가방이 가득 찼어요 — 안 쓰는 것을 궤에 넣거나 가방에서 버려요'); } }
  // 가방 칸 정리: 물건마다 필요한 묶음 수만큼 칸을 두고(넘치면 빼고, 모자라면 빈 칸에), 최소 4줄 × 9칸
  function syncBagSlots() {
    var i, need = {}, cnt = {};
    if (isAdm()) INV.forEach(function (id) { need[id] = 1; });
    else for (var k in BAG) if (BAG[k] > 0) need[+k] = slotsFor(+k, BAG[k]);
    for (i = 0; i < BAGSLOT.length; i++) { var v = BAGSLOT[i]; if (!v) continue; cnt[v] = (cnt[v] || 0) + 1; if (cnt[v] > (need[v] || 0)) { BAGSLOT[i] = 0; cnt[v]--; } }
    INV.forEach(function (id) { while ((cnt[id] || 0) < (need[id] || 0)) { var e = BAGSLOT.indexOf(0); if (e < 0) { e = BAGSLOT.length; BAGSLOT.push(0); } BAGSLOT[e] = id; cnt[id] = (cnt[id] || 0) + 1; } });
    while (BAGSLOT.length < BAG_SLOTS) BAGSLOT.push(0);
    while (BAGSLOT.length > BAG_SLOTS && BAGSLOT.length % 9 === 0 && BAGSLOT.slice(-9).every(function (v) { return !v; })) BAGSLOT.length -= 9;
    while (BAGSLOT.length % 9) BAGSLOT.push(0);
  }
  // 칸마다 보여 줄 개수: 같은 물건은 앞 칸부터 77개씩 채우고 마지막 칸이 나머지
  function slotCounts() {
    var left = {}, out = [];
    BAGSLOT.forEach(function (id) { if (!id) { out.push(0); return; } if (left[id] === undefined) left[id] = have(id); var st = isAdm() ? left[id] : Math.min(stackOf(id), left[id]); out.push(st); left[id] -= st; });
    return out;
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
    if (started && qStep < QUEST.length) questCheck();
    try { localStorage.setItem('arkVillage.bag', JSON.stringify(BAG)); localStorage.setItem('arkVillage.wear', JSON.stringify(WEAR)); localStorage.setItem('arkVillage.heat', String(HEAT)); } catch (e) {}
    renderHotbar(); setSel(sel, true);
    if (ui === 'inv') renderInv();
    if (ui === 'chest') renderChest();
    if (me && myPlot >= 0) markDirty();
  }
  // 담은 개수를 돌려준다(가방이 차면 담을 수 있는 만큼만)
  function give(id, n) {
    if (INV.indexOf(id) < 0) return 0;
    if (isAdm()) return n;
    if (n > 0) n = Math.min(n, room(id));
    if (!n) return 0;
    BAG[id] = Math.max(0, Math.min(9999, have(id) + n));
    if (n > 0) {
      markSeen(id);
      var ak = id === LOG ? 'log' : id === CRAFT ? 'table' : isTool(id) ? 'tool' : id === STONE ? 'stone' : id === ING_FE ? 'iron' : id === GEM_DIA ? 'diamond' : '';
      if (ak && started) unlock(ak);
      // 새로 얻은 것은 단축 칸 빈자리에 저절로(이미 있으면 그대로)
      if (HOTBAR.indexOf(id) < 0) { var e = HOTBAR.indexOf(0); if (e >= 0) { HOTBAR[e] = id; saveSettings(); } }
    }
    return n;
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
  [MARBLE, ALABASTER, PILLAR, ARCH, RAIL, FLINT].forEach(function (id) { MAT_STAGE[id] = 2; });
  MAT_STAGE[STRIKER] = 4;
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
    H[HONEY] = '숲의 꽃을 살펴보세요. 꽃을 캐면 가끔 꿀이 나와요';
    H[RAW_FISH] = '물에 낚싯대나 그물을 써요';
    H[RAW_LAMB] = '양고기가 없을 때 목자에게 말을 걸어요';
    if (FARM_SEEDS[id]) return '풀이나 잎을 캐면 가끔 나와요. 괭이로 갈아 놓은 밭에 심어요';
    H[SALT] = '북쪽 바닷가의 마른 모래를 캐면 가끔 나와요 (마태복음 5장 13절)';
    H[FLINT] = '자연 상태의 돌을 캐면 가끔 나와요';
    H[MARBLE] = '서쪽 산의 높은 곳에서 돌을 캐면 가끔 나와요';
    H[ALABASTER] = '자연 상태의 석회암을 캐면 가끔 나와요';
    H[RED_EARTH] = '남쪽 호수나 강의 진흙을 캐면 가끔 나와요';
    H[SEA_PEARL] = '북쪽 바닷속 바닥의 모래나 진흙을 캐면 드물게 나와요';
    H[CORAL] = '북쪽 바닷속 바닥의 모래나 진흙을 캐면 가끔 나와요';
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
    if (NET.ch) trackMe();
  }
  function refreshMyAvatar() {
    if (!scene) return;
    var vis = avatar ? avatar.visible : false;
    if (avatar) scene.remove(avatar);
    avatar = makeAvatar(LOOKS[LOOK]); dressAvatar(avatar, WORN); avatar.visible = vis; scene.add(avatar);
    if (heldMesh) handItem(avatar, heldWeapon());
  }
  function wearItem(id) {
    var wi = WEARINFO[id]; if (!wi) return;
    if (have(id) < 1) return deny(B[id][0] + '이(가) 없어요. 제작대에서 만들어요');
    take(id, 1);
    var old = WORN[wi.slot]; if (old) give(old, 1);
    WORN[wi.slot] = id; sfx('craft'); bagChanged(); saveWorn(); unlock('wear');
    toast(jo(B[id][0], '을', '를') + ' 입었어요' + (wi.ref ? ' (' + wi.ref + ')' : '') + (isTouch ? '' : ' — 👁(V)로 3인칭에서 볼 수 있어요'));
    armorCheck();
    if ($('looks').classList.contains('show')) renderLooks();
  }
  function unwear(slot) {
    var id = WORN[slot]; if (!id) return;
    if (room(id) < 1) { bagFull(); return; }
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
    unlock('armor');
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
  // 캐고·부수고·놓는 소리를 재료마다 다르게(11/20, 마인크래프트처럼): 돌 딱 · 나무 통 · 흙 사각 · 모래·눈 스슥 · 풀잎 바스락 · 유리 쨍 · 쇠 깡 · 양털 폭
  function matSound(id) {
    if (!id || !B[id]) return 'stone';
    var m = SHAPE[id] && SHAPE[id].mat ? SHAPE[id].mat : id;
    if (SLAB_MATERIAL[m]) m = SLAB_MATERIAL[m];
    if (m === GLASS || id === PANE) return 'glass';
    if ((m >= BLK_CU && m <= BLK_AU) || m === LANTERN) return 'metal';
    if ((m >= WOOL_W && m <= WOOL_R) || m === WOOL || (SHAPE[id] && SHAPE[id].type === 'carpet') || B[m][1] === 'wool') return 'wool';
    if (m === LEAF || kind(m) === 'plant' || m === REED) return 'plant';
    var k = stepKind(m);
    return k === 'soft' ? 'sand' : k === 'grass' ? 'dirt' : k === 'water' ? 'dirt' : k;   // wood · stone
  }
  function nz(dur, type, freq, gain, pw, grain, q, at) {   // 잡음 한 토막: grain>0이면 사각사각 끊김
    var len = Math.max(1, Math.floor(AC.sampleRate * dur)), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0), gate = 1;
    for (var i = 0; i < len; i++) { if (grain && i % Math.floor(AC.sampleRate * grain) === 0) gate = Math.random() < 0.55 ? 1 : 0.25; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, pw) * gate; }
    var src = AC.createBufferSource(); src.buffer = buf; src.playbackRate.value = 0.9 + Math.random() * 0.2;
    var f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = AC.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(AC.destination); src.start(AC.currentTime + (at || 0));
  }
  function matSfx(act, m) {
    var big = act === 'break', dig = act === 'dig', v = 0.9 + Math.random() * 0.2;
    if (m === 'stone') { nz(dig ? 0.045 : big ? 0.16 : 0.07, 'highpass', 1700, dig ? 0.22 : 0.4, 4.5); nz(big ? 0.12 : 0.05, 'bandpass', 700 * v, dig ? 0.12 : 0.25, 3, 0, 1.5); }
    else if (m === 'wood') { nz(dig ? 0.05 : big ? 0.14 : 0.07, 'bandpass', 520 * v, dig ? 0.3 : 0.45, 3, 0, 2); tone('sine', 230 * v, 150 * v, dig ? 0.06 : 0.1, dig ? 0.07 : 0.12); if (big) tone('sine', 160 * v, 95 * v, 0.14, 0.1); }
    else if (m === 'dirt') { nz(dig ? 0.08 : big ? 0.2 : 0.1, 'lowpass', 900 * v, dig ? 0.3 : 0.45, 1.6, 0.006); }
    else if (m === 'sand') { nz(dig ? 0.1 : big ? 0.24 : 0.12, 'highpass', 2300 * v, dig ? 0.12 : 0.2, 1.3, 0.004); }
    else if (m === 'plant') { nz(dig ? 0.07 : big ? 0.16 : 0.08, 'bandpass', 2600 * v, dig ? 0.18 : 0.3, 1.8, 0.005, 0.8); }
    else if (m === 'wool') { nz(dig ? 0.06 : 0.11, 'lowpass', 420 * v, dig ? 0.25 : 0.4, 2); }
    else if (m === 'glass') {
      if (big) { nz(0.25, 'highpass', 3000, 0.35, 2.2, 0.003); for (var i = 0; i < 6; i++) (function (k) { setTimeout(function () { tone('sine', 2400 + Math.random() * 3200, 2200 + Math.random() * 2600, 0.08 + Math.random() * 0.1, 0.05); }, k * 28 + Math.random() * 20); })(i); }
      else { nz(0.04, 'highpass', 2600, dig ? 0.15 : 0.25, 4); tone('sine', 2900 * v, 2900 * v, dig ? 0.06 : 0.14, dig ? 0.03 : 0.06); }
    }
    else if (m === 'metal') { nz(0.04, 'highpass', 2200, dig ? 0.18 : 0.3, 4); tone('triangle', 880 * v, 860 * v, dig ? 0.12 : big ? 0.45 : 0.3, dig ? 0.05 : 0.09); tone('sine', 1330 * v, 1300 * v, dig ? 0.1 : 0.35, dig ? 0.03 : 0.05); }
    else return false;
    return true;
  }
  // 발소리: 밟은 것마다 다르게(모래·눈은 사각, 풀·흙은 부드럽게, 나무는 통통, 돌은 딱딱, 물은 첨벙) + 걸음마다 조금씩 다른 높이
  var STEP_CFG = { soft: [0.11, 'bandpass', 1100, 0.085, 1.2], grass: [0.07, 'lowpass', 650, 0.09, 2.2], wood: [0.05, 'bandpass', 420, 0.15, 4], stone: [0.045, 'highpass', 1300, 0.06, 4.5], water: [0.16, 'bandpass', 620, 0.1, 1] };
  function stepKind(id) {
    if (id === WATER) return 'water';
    if (id === SAND || id === SNOW || id === PATH) return 'soft';
    if (id === GRASS || id === DIRT || id === CLAY || id === LEAF || kind(id) === 'plant') return 'grass';
    if (TCLASS[id] === 'axe' || (SHAPE[id] && TCLASS[SHAPE[id].mat] === 'axe')) return 'wood';
    return 'stone';
  }
  function stepSound(id) {
    if (!AC || !S.sound) return;
    try {
      var k = stepKind(id), c = STEP_CFG[k], v = 0.85 + Math.random() * 0.3;
      var len = Math.floor(AC.sampleRate * c[0]), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, c[4]);
      var src = AC.createBufferSource(); src.buffer = buf; src.playbackRate.value = v;
      var f = AC.createBiquadFilter(); f.type = c[1]; f.frequency.value = c[2] * v;
      var g = AC.createGain(); g.gain.value = c[3];
      src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
      if (k === 'wood') tone('sine', 190 * v, 140 * v, 0.07, 0.05);   // 나무 바닥은 통통
    } catch (e) {}
  }
  function sfx(kindS, freq) {
    if (!AC || !S.sound) return;
    try {
      if (typeof freq === 'string' && (kindS === 'break' || kindS === 'dig' || kindS === 'place') && matSfx(kindS, freq)) return;   // 재료 소리
      if (typeof freq === 'string') freq = 0;
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
    ['title', 'pause', 'inv', 'book', 'help', 'map', 'chest', 'chat', 'looks', 'tips', 'signs', 'visit', 'story', 'ending', 'party', 'friends', 'practice', 'villageWork', 'frontierChest'].forEach(function (n) { $(n).classList.toggle('show', n === name); });
    document.body.classList.toggle('playing', name === 'play');
    if (name === 'play') setTimeout(function () { fitBottomBar(); }, 60);   // 단축 칸 폭을 방향키에 맞춤
    document.body.classList.toggle('menu', name !== 'play');
    ui = name;
    if (name === 'map') { tutorialEvent('map'); renderPins(); if (!FRIENDS.ready) friendsFetch(); }
    if (name === 'play' && started) renderQuest();
    if (name !== 'play') {
      resetInput();
      // 어떤 창이든 열리면 마우스 잠금을 풀어 커서가 화면에 갇히지 않게
      try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
    }
  }
  function openPanel(name) { bagPick = null; uiBack = ui === 'play' ? 'play' : ui; showUI(name); if (name === 'inv') renderInv(); if (lockOn) document.exitPointerLock(); }
  function closePanel() { if (uiBack === 'play') resume(); else showUI(uiBack); }
  function requestGamePointerLock() {
    // 자동 시험 브라우저(navigator.webdriver)는 잠그지 않는다 — 윈도우에서는 숨은 창이라도 실제 마우스 커서를 가둠(11/19)
    if (isTouch || navigator.webdriver || !canvasEl || !canvasEl.requestPointerLock ||
        !document.hasFocus() || document.pointerLockElement === canvasEl) return;
    try {
      var request = canvasEl.requestPointerLock();
      // Chrome can reject asynchronously when the user leaves the window during a request.
      if (request && typeof request.catch === 'function') request.catch(function () {});
    } catch (e) {}
  }
  function resume() {
    showUI('play'); sfx('click');
    requestGamePointerLock();
  }
  // ── 화면 안내(처음 한 번): 버튼이 어디 있고 무엇을 하는지 노란 테두리로 차례로 짚어 준다 ──
  var TOUR_STEPS = [
    [null, '👋 나그네 마을에 온 것을 환영해요!', '화면에 있는 것들을 하나씩 짚어 줄게요. 언제든 「건너뛰기」를 누를 수 있어요.'],
    ['#dpad', '🕹 방향키', '눌러서 걸어요. ▲를 두 번 누르면 달리고, 가운데를 톡톡 두 번 누르면 웅크려요(다시 톡톡 누르면 일어나요).', 'touch'],
    ['#keys', '⌨ 걷기', 'W A S D로 걷고 마우스로 둘러봐요. 스페이스는 점프, W를 두 번 누르면 달리기예요.', 'pc'],
    [null, '👀 둘러보기', '화면의 빈 곳을 손가락으로 끌면 둘러봐요. 가운데 + 표시가 겨누는 곳이에요.', 'touch'],
    ['#btnJump', '⬆ 점프', '한 칸 높이는 저절로 올라가고, 더 높으면 점프를 눌러요.', 'touch'],
    ['#btnRun', '🏃 달리기', '누르면 달리기가 켜지고, 다시 누르면 꺼져요.', 'touch'],
    ['#hotbar', '🧰 단축 칸', '손에 들 것을 고르는 곳이에요. 칸을 눌러 바꾸고, 맨 오른쪽은 가방이에요.'],
    [null, '⛏ 캐기와 놓기', '겨눈 블록을 꾹 누르면 캐고, 톡 누르면 손에 든 블록을 놓아요. 오른쪽에 「놓기」 「캐기」 버튼도 나와요.', 'touch'],
    [null, '⛏ 캐기와 놓기', '왼쪽 클릭을 누르고 있으면 캐고, 오른쪽 클릭으로 놓아요.', 'pc'],
    ['#btnBag', '🎒 가방', '모은 것을 보고 만들기·도감·업적을 열어요. 집은 물건은 땅에 버릴 수도 있어요.'],
    ['#btnChat', '💬 채팅', '함께 있는 나그네들과 이야기해요.'],
    ['#btnLook', '👤 옷', '내 모습과 입을 옷을 골라요.'],
    ['#btnView', '👁 시점', '1인칭 · 3인칭(뒤) · 3인칭(앞)을 바꿔요.'],
    ['#btnRotate', '🔄 화면', '가로 · 세로를 바꿔요.', 'touch'],
    ['#btnFold', '▶ 접기', '위쪽 버튼들을 접어 화면을 넓게 써요. 다시 누르면 펴져요.'],
    ['#btnPause', '❚❚ 메뉴', '게임 · 이동 · 함께 · 설정 탭이 있어요. 마을 수첩 · 지도 · 친구 · 파티도 여기서 열어요.'],
    ['#mapc', '🗺 작은 지도', '누르면 큰 지도가 열려요. 아래 「지도」 글자를 누르면 접혀요.'],
    ['#quest', '📜 할 일 안내', '지금 해 볼 일을 알려 줘요. ▴를 누르면 접혀요.'],
    ['#info', '📍 지금 있는 곳', '장소 · 계절 · 함께 있는 사람 수가 나와요.'],
    [null, '🤝 다른 나그네', '다른 사람을 두 번 누르면 친구 신청 · 파티 초대를 할 수 있어요.'],
    [null, '✅ 준비 끝!', '이제 할 일 안내를 따라 해 보세요. 메뉴 → 게임 → 「화면 안내 다시 보기」로 언제든 다시 볼 수 있어요.']
  ];
  var tourBox = null;
  function tourVisible(el) { if (!el) return false; var r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; }
  function startTour(done) {
    if (tourBox) return;
    if (ui !== 'play') showUI('play');
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var steps = TOUR_STEPS.filter(function (s) {
      if (s[3] === 'touch' && !isTouch) return false;
      if (s[3] === 'pc' && isTouch) return false;
      return !s[0] || tourVisible(document.querySelector(s[0]));
    });
    var i = 0;
    tourBox = document.createElement('div'); tourBox.id = 'tour';
    var hole = document.createElement('div'); hole.className = 'thole';
    var bub = document.createElement('div'); bub.className = 'tbub';
    tourBox.appendChild(hole); tourBox.appendChild(bub); document.body.appendChild(tourBox);
    function finish() { if (!tourBox) return; tourBox.remove(); tourBox = null; S.tourDone = 1; saveSettings(); if (done) done(); }
    function show() {
      var s = steps[i], el = s[0] && document.querySelector(s[0]);
      bub.innerHTML = '';
      var h = document.createElement('b'); h.textContent = s[1];
      var p = document.createElement('p'); p.textContent = s[2];
      var row = document.createElement('div'); row.className = 'trow';
      var n = document.createElement('small'); n.textContent = (i + 1) + ' / ' + steps.length;
      var skip = document.createElement('button'); skip.className = 'mc'; skip.textContent = '건너뛰기';
      var next = document.createElement('button'); next.className = 'mc tnext'; next.textContent = i === steps.length - 1 ? '시작하기' : '다음 ▶';
      skip.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
      next.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); if (++i >= steps.length) finish(); else show(); });
      row.appendChild(n); if (i < steps.length - 1) row.appendChild(skip); row.appendChild(next);
      bub.appendChild(h); bub.appendChild(p); bub.appendChild(row);
      var W = innerWidth, H = innerHeight;
      if (el && tourVisible(el)) {
        var r = el.getBoundingClientRect(), pad = 6;
        hole.style.display = 'block'; tourBox.classList.remove('dim');
        hole.style.left = (r.left - pad) + 'px'; hole.style.top = (r.top - pad) + 'px'; hole.style.width = (r.width + pad * 2) + 'px'; hole.style.height = (r.height + pad * 2) + 'px';
        var bw = Math.min(300, W - 24); bub.style.width = bw + 'px';
        var bh = bub.offsetHeight || 120;
        var top = r.bottom + 14; if (top + bh > H - 8) top = r.top - bh - 14; if (top < 8) top = Math.max(8, Math.min(H - bh - 8, r.top));
        var left = r.left + r.width / 2 - bw / 2;
        if (top === Math.max(8, Math.min(H - bh - 8, r.top)) && (r.top - bh - 14 < 8)) left = r.right + 14 + bw < W ? r.right + 14 : r.left - bw - 14;   // 위·아래 자리가 없으면 옆으로
        bub.style.left = Math.max(8, Math.min(W - bw - 8, left)) + 'px'; bub.style.top = top + 'px';
      } else {
        hole.style.display = 'none'; tourBox.classList.add('dim');
        var bw2 = Math.min(340, W - 24); bub.style.width = bw2 + 'px';
        bub.style.left = (W - bw2) / 2 + 'px'; bub.style.top = Math.max(8, (H - (bub.offsetHeight || 140)) / 2) + 'px';
      }
    }
    show();
  }
  // 느린 휴대폰이면 「가벼운 화면」을 한 번 자동으로 켠다(시작 뒤 20초 평균 26fps 미만)
  function watchLowSpec() {
    if (!isTouch || S.lightMode || S.lightAuto) return;
    var n = 0, t0 = 0;
    (function f(now) {
      if (!t0) t0 = now; n++;
      if (now - t0 < 20000) { requestAnimationFrame(f); return; }
      var fps = n / ((now - t0) / 1000); S.lightAuto = 1;
      if (fps < 26 && !S.lightMode) { S.lightMode = true; applyLightMode(); updateMenuLabels(); toast('📱 기기가 느려서 「가벼운 화면」을 켰어요 — 메뉴 → 설정에서 끌 수 있어요'); }
      saveSettings();
    })(performance.now());
  }
  function startGame() {
    setTimeout(watchLowSpec, 8000);
    audioOn(); sfx('click');
    if (furnaceOK()) SEEN[FURNACE] = 1; if (tableOK()) SEEN[CRAFT] = 1;   // 내 땅에 놓아 둔 용광로·제작대
    SLOTS.forEach(function (s) { if (WORN[s]) SEEN[WORN[s]] = 1; }); saveSeen();
    started = true; seenQuiet = false; lastStage = curStage().n;
    if ((!me || myPlot < 0) && (tutorialStep === 4 || tutorialStep === 5)) { tutorialStep = 6; tutorialSave(); }
    if ((!me || !NET.ok) && tutorialStep === 7) { tutorialStep = 8; tutorialSave(); }
    if (myPlot >= 0) goHome(); else { teleport(XM + 0.5, G, PZ0 - 9, Math.PI); toast('숲·산·호수에서 재료를 캐서 모아 보세요. 방주 문은 옆으로 나 있어요(창 6:16)'); }
    if (!me) setTimeout(function () { toast('지금은 구경 모드예요 — 로그인하면 내 땅과 가방이 저장돼요'); }, 15000);
    resume();
    // 처음이면 화면 안내부터, 끝나면 (휴대폰) 첫 집 연습터
    if (!S.tourDone) setTimeout(function () { startTour(function () { if (isTouch && !S.practiceSeen) openPractice(); }); }, 900);
    else if (isTouch && !S.practiceSeen) openPractice();
  }
  var forestRoute = null;
  var FOREST_ENTRY = [VX1 + 14, PZ0 + 60];
  function startForestRoute() {
    var points = [];
    if (P.x <= VX1 && P.x >= PX0 - 10 && P.z >= PZ0 - 12 && P.z <= VZ1 + 6) {
      var row = Math.max(0, Math.min(PROWS, Math.round((P.z - PZ0 + 1) / PSTEP)));
      var roadZ = PZ0 + row * PSTEP - 1;
      if (Math.abs(P.z - roadZ) > 2) points.push([P.x, roadZ]);
      points.push([VX1 + 8, roadZ]);
    }
    points.push(FOREST_ENTRY);
    forestRoute = points; forestDestination=FOREST_ENTRY; forestName='동쪽 숲';
    resume();
    renderForestRoute();
  }
  function cancelForestRoute() {
    forestRoute = null;
    $('forestGuide').hidden = true;
  }
  function renderForestRoute() {
    if (!forestRoute) return;
    var next = forestRoute[0];
    var distance = Math.hypot(next[0] - P.x, next[1] - P.z);
    while (forestRoute.length > 1 && distance <= 2) {
      forestRoute.shift();
      next = forestRoute[0];
      distance = Math.hypot(next[0] - P.x, next[1] - P.z);
    }
    var remaining = Math.hypot(forestDestination[0] - P.x, forestDestination[1] - P.z);
    if (remaining <= 6) {
      cancelForestRoute();
      toast(forestName+'에 도착했어요!');
      return;
    }
    var angle = Math.atan2(next[0] - P.x, P.z - next[1]) + P.yaw;
    if ($('forestPlace').textContent !== forestName) $('forestPlace').textContent=forestName;
    $('forestArrow').style.transform = 'rotate(' + angle + 'rad)';
    var distanceLabel = Math.round(remaining) + '칸';
    if ($('forestDistance').textContent !== distanceLabel) $('forestDistance').textContent = distanceLabel;
    $('forestGuide').hidden = false;
  }
  function travel(where) {
    if (where === 'forest') return startForestRoute();
    var spots = {
      ark: [XM + 0.5, AZ1 + 8, 0, '방주 문 앞이에요 — 문은 옆으로(창 6:16)'],
      hill: [PX0 - 14, PZ0 + 60, Math.PI / 2, '서쪽 산이에요. 위쪽 바위에서 돌·석회암·검은 돌을 캘 수 있어요'],
      lake: [XM + 0.5, LZ - LRZ - 6, Math.PI, '남쪽 호수예요. 물가에서 진흙과 갈대를, 동쪽에서 역청을 캐요(창 14:10)'],
      sea: [XM + 0.5, SEA_Z + 24, 0, '북쪽 바다예요. 모래사장과 바닷속 물고기를 만나 보세요'],
      desert: [DES_X + 40, PZ0 + 70, -Math.PI / 2, '동쪽 사막이에요. 낙타를 만나고, 더 가면 오아시스가 있어요'],
      ararat: [ARX + 150, ARZ, Math.PI / 2, '아라랏 산이에요. 방주가 아라랏 산에 머물렀어요(창 8:4)'],
      commons: [XM + 0.5, COMMONS[3] + 4, 0, '함께 짓는 터예요. 누구나 함께 지을 수 있고, 지은 것은 모두에게 남아요']
    }, s = spots[where];
    teleport(s[0], surfaceY(Math.floor(s[0]), Math.floor(s[1])), s[1], s[2]); resume(); toast(s[3]);
  }

  // ───────── 입력 ─────────
  var keys = {}, joy = { x: 0, y: 0 }, jumpHeld = false, flyDown = false, sel = 0, lastJumpTap = 0, mouseMining = false;
  var hold = null; // 터치로 누르고 있는 손가락
  // 달리기: PC는 W 두 번(누르고 있는 동안)·Ctrl·R, 휴대폰은 🏃 버튼(다시 누르면 꺼짐)이나 막대를 끝까지
  var runLock = false, runSrc = '', lastW = 0, runTold = false, sneakLock = false, sprintTold = false;
  function setRun(on, src) {
    runLock = !!on; runSrc = on ? src : '';
    document.body.classList.toggle('running', runLock);
    if (on && src === 'btn' && !runTold) { runTold = true; toast('🏃 달리기 켬 — 앞으로 걸으면 더 빨리 가요. 한 번 더 누르면 꺼져요'); }
  }
  function jumpPress() {
    if (furnitureRest) return standFromFurniture();
    var now = performance.now();
    lastJumpTap = now;   // 점프 두 번으로 날기를 켜지 않는다 — 굴에서 턱을 넘다 모르게 켜졌음(11/19), 날기는 「날기」 버튼·F 키로만
    jumpHeld = true;
  }
  var resetTouchInput = function () {};
  function resetInput() {
    keys = {}; jumpHeld = false; flyDown = false; mouseMining = false;
    joy.x = joy.y = 0; lastW = 0; lastJumpTap = 0;
    if (runSrc === 'key' || runSrc === 'pad') setRun(false);
    resetTouchInput(); stopHold();
  }
  function bindInput(canvas) {
    window.addEventListener('blur', resetInput);
    document.addEventListener('visibilitychange', function () { if (document.hidden) resetInput(); });
    window.addEventListener('keydown', function (e) {
      if (ui === 'chat') { if (e.code === 'Escape') { closePanel(); e.preventDefault(); } return; }
      if ((e.code === 'KeyT' || e.code === 'Enter') && ui === 'play' && !e.repeat) { openChat(); e.preventDefault(); return; }
      if (e.code === 'KeyE' && (ui === 'play' || ui === 'inv' || ui === 'chest')) { if (ui !== 'play') closePanel(); else openPanel('inv'); e.preventDefault(); return; }
      if ((e.code === 'F5' || e.code === 'KeyV') && ui === 'play') { cycleView(); e.preventDefault(); return; }
      if (e.code === 'F2' && (ui === 'play' || ui === 'pause') && !e.repeat) { savePhoto(); e.preventDefault(); return; }   // 마인크래프트처럼 F2 = 사진
      if (e.code === 'KeyC' && (ui === 'play' || ui === 'looks') && !e.repeat) { if (ui === 'looks') closePanel(); else openLooks(); e.preventDefault(); return; }
      if (e.code === 'KeyM' && (ui === 'play' || ui === 'map') && !e.repeat) { if (ui === 'map') closePanel(); else { openPanel('map'); drawMap($('bigmapc'), true); } e.preventDefault(); return; }
      if (e.code === 'KeyH' && ui === 'play' && !e.repeat) { S.keysOff = !S.keysOff; saveSettings(); document.body.classList.toggle('keysoff', !!S.keysOff); return; }
      if (ui !== 'play') return;
      if (e.code === 'KeyW' && !e.repeat) { var nw = performance.now(); if (nw - lastW < 300) setRun(true, 'key'); lastW = nw; }
      keys[e.code] = true;
      if (e.code === 'Space' && !e.repeat) jumpPress();
      if (e.code === 'KeyF') toggleFly();
      if (e.code === 'KeyG' && ui === 'play' && !e.repeat) waveHand();   // G: 손 흔들기
      if (e.code === 'KeyQ' && ui === 'play' && !e.repeat) throwItem(HOTBAR[sel], e.shiftKey ? Math.min(64, have(HOTBAR[sel])) : 1);   // Q 버리기, Shift+Q 모두
      if (e.code === 'KeyG' && !e.repeat) rotateBuild();
      if (e.code === 'KeyZ' && !e.repeat) undoBuild();
      if (/^Digit[1-9]$/.test(e.code)) setSel(+e.code.slice(5) - 1);
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && riding) dismount();
      if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; if (e.code === 'Space') jumpHeld = false; if (e.code === 'KeyW' && runSrc === 'key') setRun(false); });
    canvas.addEventListener('mousedown', function (e) {
      if (isTouch || ui !== 'play') return;
      if (!lockOn) { requestGamePointerLock(); return; }
      if (e.button === 0) {
        // 왼쪽 클릭: 그림자를 겨누고 있으면 치기, 아니면 캐기
        var cs2 = pickCreature(screenDir(), (pickCenter() || {}).t);
        if (cs2 && cs2.shadow) { hitShadow(cs2.shadow); return; }
        mouseMining = true; return;
      }
      if (e.button === 2) { if (HOTBAR[sel] === BOW && have(BOW) > 0 && bowStart()) return; tapAt(); return; }
      var h = pickCenter(); if (!h) return;
      else if (e.button === 1) { var id = get(h.x, h.y, h.z); id = dropOf(id); if (INV.indexOf(id) >= 0 && have(id) > 0) { var hj = HOTBAR.indexOf(id); if (hj >= 0) { setSel(hj); return; } HOTBAR[sel] = id; renderHotbar(); setSel(sel); saveSettings(); } }
    });
    window.addEventListener('mouseup', function (e) { if (e.button === 0) { mouseMining = false; mine = null; } if (e.button === 2 && bowDraw) bowRelease(screenDir()); });
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
          if (HOTBAR[sel] === BOW && have(BOW) > 0 && bowStart()) tLook.bow = true;   // 활: 누르고 있는 동안 당김(끌어서 겨눔), 떼면 쏨
          else hold = { x: t.clientX, y: t.clientY, t0: performance.now(), dug: false };
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
          if (tLook.bow) { if (e.type === 'touchend' && ui === 'play') bowRelease(screenDir()); else bowCancel(); stopHold(); tLook = null; continue; }
          var tap = tLook.moved < 12 && performance.now() - tLook.t0 < 260 && hold && !hold.dug;
          if (e.type === 'touchend' && ui === 'play' && tap) tapAt(tLook.lx, tLook.ly);
          stopHold(); tLook = null;
        }
      }
    }
    canvas.addEventListener('touchend', end); canvas.addEventListener('touchcancel', end);

    // 방향키(↑ ← → ↓): 누른 채 손가락을 옆으로 밀어도 따라가고, 모서리는 대각선. ↑ 두 번 = 달리기
    var pad = $('dpad'), padT = null, lastUp = 0, upWas = false, padMid = null;   // padMid: 가운데에서 누르기 시작한 때(밖으로 밀면 취소)
    function padAt(t) {
      var r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
      var dx = (t.clientX - cx) / R, dy = (t.clientY - cy) / R;
      var x = Math.abs(dx) > 0.33 ? (dx > 0 ? 1 : -1) : 0, y = Math.abs(dy) > 0.33 ? (dy > 0 ? 1 : -1) : 0;
      var center = Math.abs(dx) < 0.33 && Math.abs(dy) < 0.33;
      if (center) { x = 0; y = 0; }
      if (!center && padMid) { padMid = null; $('dMid').classList.remove('hold'); }   // 가운데에서 밀어 걸으면 웅크리기 아님
      joy.x = x; joy.y = y;
      if (x && y) { joy.x = x * 0.7071; joy.y = y * 0.7071; }
      var up = y < 0;
      if (up && !upWas) { var now = performance.now(); if (now - lastUp < 330) setRun(true, 'pad'); lastUp = now; }
      if (!up && runSrc === 'pad') setRun(false);
      upWas = up;
      ['dUp', 'dLeft', 'dRight', 'dDown'].forEach(function (k, i) { $(k).classList.toggle('on', [y < 0, x < 0, x > 0, y > 0][i]); });
    }
    function padEnd() { padMid = null; $('dMid').classList.remove('hold'); padT = null; joy.x = joy.y = 0; upWas = false; if (runSrc === 'pad') setRun(false); ['dUp', 'dLeft', 'dRight', 'dDown'].forEach(function (k) { $(k).classList.remove('on'); }); }
    pad.addEventListener('touchstart', function (e) {
      if (ui !== 'play') return; var t = e.changedTouches[0];
      if (padT === null) { padT = t.identifier; var r = pad.getBoundingClientRect(), R = r.width / 2; if (Math.abs(t.clientX - r.left - R) < R * 0.33 && Math.abs(t.clientY - r.top - R) < R * 0.33) { padMid = performance.now(); $('dMid').classList.add('hold'); } padAt(t); }
      e.preventDefault(); e.stopPropagation();
    }, { passive: false });
    pad.addEventListener('touchmove', function (e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === padT) padAt(e.changedTouches[i]); e.preventDefault(); e.stopPropagation(); }, { passive: false });
    // 마인크래프트 휴대폰 조작처럼: 가운데를 톡톡 두 번 = 웅크리기 켜고 끄기 · 의자/침대에선 일어나기 · 탄 동물에선 내리기
    var lastMidTap = 0;   // 두 번째 톡이 0.4초 안에 와야 함
    function padMidTap() {
      vibrate('tap');
      if (typeof furnitureRest !== 'undefined' && furnitureRest) { standFromFurniture(); return; }
      if (cartRide) { leaveCart(); return; }
      if (riding) { dismount(); return; }
      sneakLock = !sneakLock; newsMark('sneak');
      toast(sneakLock ? '🧎 웅크렸어요 — 천천히 걷고 가장자리에서 떨어지지 않아요' : '🧍 일어났어요');
    }
    function padUp(e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === padT) { var tap = padMid && e.type === 'touchend' && performance.now() - padMid < 600; padEnd(); if (tap) { var nw = performance.now(); if (nw - lastMidTap < 400) { lastMidTap = 0; padMidTap(); } else lastMidTap = nw; } } e.preventDefault(); }
    pad.addEventListener('touchend', padUp); pad.addEventListener('touchcancel', padUp);
    resetTouchInput = function () { tMove = tLook = null; stickHome(); padEnd(); lastUp = 0; };
  }
  function stopHold() { hold = null; mine = null; var r = $('ring'); if (r) r.classList.remove('show'); }
  function look(dx, dy, k) {
    if (started && ui === 'play' && Math.abs(dx) + Math.abs(dy) >= 2) tutorialEvent('look');
    P.yaw -= dx * k; P.pitch -= dy * k;
    P.pitch = Math.max(-1.53, Math.min(1.53, P.pitch));
  }
  // 가로/세로 바꾸기: 말씀우물 앱은 세로로 묶여 있어서(manifest) 게임에서만 방향을 바꿔 준다
  function rotateScreen() {
    var so = screen.orientation, cur = (so && so.type) || (innerWidth > innerHeight ? 'landscape' : 'portrait');
    var want = cur.indexOf('portrait') === 0 ? 'landscape' : 'portrait';
    function done() { toast(want === 'landscape' ? '📱 가로 화면으로 바꿨어요' : '📱 세로 화면으로 바꿨어요'); }
    function fail() { toast('이 휴대폰에서는 버튼으로 돌릴 수 없어요. 휴대폰 자동 회전을 켜고 직접 돌려 주세요'); }
    if (!so || !so.lock) return fail();
    so.lock(want).then(done, function () {
      var el = document.documentElement, rf = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!rf) return fail();
      Promise.resolve(rf.call(el)).then(function () { return so.lock(want); }).then(done, fail);
    });
  }
  window.addEventListener('pagehide', function () { try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {} });
  function toggleFly() {
    if (!isAdm()) { if (P.fly) { P.fly = false; document.body.classList.remove('flying'); } return; }   // 날기는 관리자만
    if (furnitureRest) return;
    if (riding) { toast('내린 뒤에 날 수 있어요'); return; }
    P.fly = !P.fly; P.vy = 0;
    document.body.classList.toggle('flying', P.fly);
    toast(P.fly ? '🕊 날기 켬 — 「날기」 버튼(F)을 다시 누르면 꺼져요' : '날기 끔');
  }
  var VIEW_NAMES = ['1인칭', '3인칭(뒤)', '3인칭(앞)'];
  function cycleView() { S.view = (S.view + 1) % 3; saveSettings(); updateMenuLabels(); toast('시점: ' + VIEW_NAMES[S.view]); }
  var selNameT = null;
  function setSel(i, quiet) {
    if(sel!==i){buildTurn=0; $('buildRotate').textContent='돌리기';}
    sel = i;
    var slots = document.querySelectorAll('#hotbar .slot');
    for (var k = 0; k < slots.length; k++) slots[k].classList.toggle('on', k === i);
    if (!quiet) {
      var el = $('selName'); el.textContent = HOTBAR[i] ? B[HOTBAR[i]][0] + ' · ' + fmtN(have(HOTBAR[i])) + '개' : '빈 손'; el.classList.add('show');
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
      if (y >= 0 && id !== AIR && id !== WATER) return { x: x, y: y, z: z, px: px, py: py, pz: pz, atY: oy + dy * t, t: t };
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
    return d <= REACH + 0.5 ? h : null;
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
    if (isAdm()) return y <= 0 ? '맨 아래 바닥은 캘 수 없어요' : '';   // 관리자는 어디서든(다른 사람 땅·방주 포함)
    var frontierReason=frontierEditReason(x,z); if(frontierReason) return frontierReason;
    if (protectedExcursion(x,z)) return '이곳은 함께 구경하는 장소예요';
    if (villageProjectLocked(x,z)) return '완성한 공사장이에요. 선생님에게 문의해요';
    if (inArk(x, y, z)) return '노아의 방주는 다 지어져 있어요. 안으로 들어가 둘러보세요! (창 6:22)';
    if (inCity(x, z)) return '거룩한 성은 지켜져 있어요';
    if (inLandmark(x, z)) return '「' + REGION_INFO[inLandmark(x, z)][0] + '」은(는) 함께 구경하는 곳이라 지켜져 있어요';
    if (inDungeon(x, y, z) && get(x, y, z) !== TORCH && !(get(x, y, z) >= 170 && get(x, y, z) < 174) && get(x, y, z) !== LADDER + 3) return '골짜기의 벽은 깨지지 않아요 — 길을 찾아 지나가요(시 23:4)';
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
    if (isAdm()) return '';
    var frontierReason=frontierEditReason(x,z); if(frontierReason) return frontierReason;
    if(client && !frontierEnabled && id>=ROPE && id<=ARCH_SIDE) return '개척 도구를 서버에서 준비하는 중이에요';
    if (client && !villageProjectsEnabled && id>=FIND_POT && id<=FEAST_FISH) return '마을 새 재료를 서버에서 준비하는 중이에요';
    if (protectedExcursion(x,z)) return '이곳은 함께 구경하는 장소예요';
    if (villageProjectLocked(x,z)) return '완성한 공사장이에요. 선생님에게 문의해요';
    if (inArk(x, y, z)) return '노아의 방주는 다 지어져 있어요. 안으로 들어가 둘러보세요! (창 6:22)';
    if (inCity(x, z)) return '거룩한 성은 지켜져 있어요';
    if (inLandmark(x, z)) return '「' + REGION_INFO[inLandmark(x, z)][0] + '」은(는) 함께 구경하는 곳이라 지켜져 있어요';
    if (inDungeon(x, y, z) && id !== TORCH) return '골짜기에는 횃불만 놓을 수 있어요';
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
    var p = plotAt(x, z), reason=canPlace(x,y,z,DOOR);
    if (reason) return deny(reason);
    var c = doorColumn(x, y, z);
    if (myPlot >= 0 && p === myPlot && !SHAPE[get(x, y, z)].open) tutorialDoor = { x: x, z: z, y: c[0], top: c[1] + 1 };
    for (var yy = c[0]; yy <= c[1]; yy++) if(canPlace(x,yy,z,DOOR))return;
    for (yy = c[0]; yy <= c[1]; yy++) setBlock(x,yy,z,readBlock(x,yy,z)^1);
    sfx('door'); swingT = 0.25;
  }
  function toggleTrap(x, y, z, id) {
    var why = canPlace(x, y, z, id); if (why) return deny(why);
    setBlock(x, y, z, id ^ 1); sfx('door', 700); swingT = 0.25;
  }
  function toggleGate(x, y, z, id) {
    var why = canPlace(x, y, z, id);
    if (why) return deny(why);
    var gate = SHAPE[id];
    if (gate.open && P.y < y + 1 && P.y + curHT > y &&
        P.x + HW > x && P.x - HW < x+1 && P.z + HW > z && P.z - HW < z+1) {
      return deny('울타리 문에서 한 걸음 물러난 뒤 닫아요');
    }
    setBlock(x, y, z, GATE_STATES[gate.f][gate.open ? 0 : 1]);
    sfx('door'); swingT = .25;
  }
  function act(kindA, h) {
    if (!h || furnitureRest) return;
    if (kindA === 'break') {
      var why = canMine(h.x, h.y, h.z); if (why) return deny(why);
      var old = get(h.x, h.y, h.z), usedTool = mineInfo(old).tool || 0;
      if (SHAPE[old] && SHAPE[old].type === 'door') {
        // 문은 한 줄(4칸)을 통째로
        var dc = doorColumn(h.x, h.y, h.z);
        for (var dy = dc[0]; dy <= dc[1]; dy++) setBlock(h.x, dy, h.z, AIR);
        burst(h.x, h.y, h.z, old); dropItem(h.x + 0.5, h.y + 0.45, h.z + 0.5, DOOR, 1);
      } else {
        breakAt(h.x, h.y, h.z, old); if (oreBase(old)) oreBroken(h.x, h.y, h.z, old);
        var up = get(h.x, h.y + 1, h.z);
        if (kind(up) === 'plant') breakAt(h.x, h.y + 1, h.z, up);
      }
      if (isGrav(get(h.x, h.y + 1, h.z))) startFall(h.x, h.y + 1, h.z);
      sfx('break', matSound(old)); vibrate('break'); wearTool(usedTool); bagChanged(); questEvent('break', old, 1);
    } else {
      var tgt = get(h.x, h.y, h.z);
      if (tryFrontierDevice(tgt,h)) return;
      if (SHAPE[tgt] && SHAPE[tgt].type === 'gate') return toggleGate(h.x, h.y, h.z, tgt);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'door') return toggleDoor(h.x, h.y, h.z);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'trapdoor') return toggleTrap(h.x, h.y, h.z, tgt);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'frame') return useFrame(h.x, h.y, h.z);
      if (railAt(h.x, h.y, h.z) >= 0 && parkedAt(h.x, h.y, h.z)) return startCart(h.x, h.y, h.z, parkedAt(h.x, h.y, h.z));   // 세워 둔 수레
      if (HOTBAR[sel] === CART) { if (railAt(h.x, h.y, h.z) >= 0) return startCart(h.x, h.y, h.z); return deny('수레는 손에 들고 레일을 눌러 타요'); }
      if (tgt === FURNACE || tgt === FURNACE_ON) { if (plotAt(h.x, h.z) !== myPlot) return deny('다른 사람의 용광로예요'); craftCat = 'smelt'; invTab = 'craft'; openPanel('inv'); return; }
      if (tgt === CHEST) return openChest(h.x, h.y, h.z);
      if (tgt === CRAFT) { craftCat = 'wear'; invTab = 'craft'; openPanel('inv'); sfx('click'); return; }
      if (tgt>=FIND_MARK && tgt<=FIND_SEED || tgt===FERRY_POST || tgt===FEAST_TABLE) return useVillageBlock(tgt,h);
      if (tgt===WORD_SHELF) return showWordCard(false);
      if (tgt===ALTAR) return showWordCard(true);
      if (tgt===WELL) return drawWell(HOTBAR[sel]);
      if (STATION_BITS[tgt] && !FARM_SEEDS[HOTBAR[sel]]) {
        craftCat = 'block'; invTab = 'craft'; openPanel('inv'); return;
      }
      if (tgt === BED) return useBed(h.x, h.y, h.z);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'chair') return beginFurnitureRest('sit', h.x, h.y, h.z, tgt);
      if (tgt === LAMPSTAND || tgt === LAMPSTAND + 1) return useLampstand(h.x, h.y, h.z);
      if (tgt === SOCKET) return useSocket(h.x, h.y, h.z);
      if (tgt === PEARL) return toast(STORY.done ? '문이 열려 있어요' : '진주 문은 닫혀 있어요 — 📜 나그네의 길을 끝까지 걸어야 열려요(계 21:21)');
      if (tgt === LEVER || tgt === LEVER + 1) return useLever(h.x, h.y, h.z);
      if (INSTR[tgt]) return playInstrument(tgt, h.x, h.y, h.z);
      if (inHoreb(h.x, h.y, h.z) && get(h.x, h.y, h.z) === BASALT) return strikeRock();
      if (tgt === MANGER) return showVerseCard('🌟', '구유', '첫아들을 낳아 강보로 싸서 구유에 뉘었으니 이는 여관에 있을 곳이 없음이러라', '누가복음 2:7', '오늘 다윗의 동네에 너희를 위하여 구주가 나셨으니 곧 그리스도 주시니라 (눅 2:11)');
      if (SHAPE[tgt] && SHAPE[tgt].type === 'sign' && plotAt(h.x, h.z) === myPlot && myPlot >= 0) return openSignPick(h.x, h.y, h.z);
      var item = HOTBAR[sel];
      if (!item) return deny('손에 든 것이 없어요. 아래 칸을 고르거나 🎒 가방에서 단축 칸에 넣어요');
      if (WEARINFO[item]) return wearItem(item);
      if (FOODS[item]) return eatItem(item);
      if (item===WATER_BUCKET || item===FULL_JAR) return pourWater(item,h);
      if (item === HOE) return tillGround(h);
      if (FARM_SEEDS[item]) { if (have(item)>0) plantSeed(h,item); return; }
      if (item === SEED) { if (have(SEED) < 1) return; return plantSeed(h); }
      var bx = h.px, by = h.py, bz = h.pz, id = item, ld = lookDir();
      ld = (ld + buildTurn) % 4;
      if (SHAPE[id] && SHAPE[id].type === 'stair') id = SHAPE[id].base + ld;
      id = orientedBuild(item,ld,id);
      if (item === CHAIR) id = CHAIR + (ld + 2) % 4;
      if (item === GATE) id = GATE_STATES[ld % 2][0];
      if (item === STRIKER) {
        if (!have(STRIKER)) return deny('먼저 부시를 만들어요');
        var reason = canPlace(bx, by, bz, TORCH), ground = get(bx, by - 1, bz), target = get(bx, by, bz);
        if (reason) return deny(reason);
        if (!have(FLINT) || !have(STICK) || (!have(CHAR) && !have(COAL))) return deny('불을 붙이려면 부싯돌, 막대기, 숯이나 석탄이 필요해요');
        if (target !== AIR || !isSolid(ground) || isShape(ground)) return deny('바닥의 빈 곳에 불을 붙여요');
        take(STICK,1); take(have(CHAR) ? CHAR : COAL,1);
        setBlock(bx,by,bz,TORCH); bagChanged(); sfx('place'); return;
      }
      var why2 = canPlace(h.px, h.py, h.pz, item); if (why2) return deny(why2);
      if (isItem(item)) return deny('「' + B[item][0] + '」은(는) 놓는 블록이 아니에요. 블록을 골라 주세요');
      if (have(item) < 1) return deny(B[item][0] + '이(가) 없어요. 캐거나 만들어서 모아요');
      if (SLAB_TOP[id]) {
        // 같은 재료 반 블록의 빈 반쪽을 겨누면 한 칸 전체 블록으로 합친다
        if (slabMergeTarget(id, h)) {
          var mwhy = canPlace(h.x, h.y, h.z, item); if (mwhy) return deny(mwhy);
          if (isSolid(SLAB_MATERIAL[id]) && h.x + 1 > P.x - HW && h.x < P.x + HW && h.y + 1 > P.y && h.y < P.y + HT && h.z + 1 > P.z - HW && h.z < P.z + HW) return;
          take(item, 1); setBlock(h.x, h.y, h.z, SLAB_MATERIAL[id]); sfx('place', matSound(item)); bagChanged();
          partyAdd('build', 1);
          tutorialEvent('place');
          if (plotAt(h.x, h.z) === myPlot) { stats.placed++; questCheck(); if (stats.placed >= 30) unlock('house'); buildMilestone(); }
          if (inCommons(h.x, h.z)) unlock('commons');
          swingT = 0.25; vibrate('place'); exhaust(0.02);
          return;
        }
        id = slabPlacement(id, h);
      }
      if (id === LADDER) {
        var ddx = h.x - h.px, ddz = h.z - h.pz;
        if (ddx || ddz) { if (!isSolid(get(h.x, h.y, h.z)) || SHAPE[get(h.x, h.y, h.z)]) return deny('사닥다리는 벽에 붙여요'); id = LADDER + (ddz < 0 ? 0 : (ddx > 0 ? 1 : (ddz > 0 ? 2 : 3))); }
        else id = LADDER + ld;
      }
      if (id === TRAP) { var ttop = h.py < h.y || (h.py === h.y && h.atY - h.py >= 0.5); id = TRAP + ((ld + 2) % 4) * 4 + (ttop ? 2 : 0); }   // 블록 윗반쪽·아랫면을 겨누면 위에 붙임
      if (id === FRAME) {
        var fdx = h.x - h.px, fdz = h.z - h.pz;
        if (!(fdx || fdz) || !isSolid(get(h.x, h.y, h.z)) || SHAPE[get(h.x, h.y, h.z)]) return deny('액자는 벽 옆면에 걸어요');
        id = FRAME + (fdz < 0 ? 0 : (fdx > 0 ? 1 : (fdz > 0 ? 2 : 3)));
      }
      if (id === SAPLING && [GRASS, DIRT].indexOf(get(bx, by - 1, bz)) < 0) return deny('묘목은 풀이나 흙 위에 심어요');
      // 벽 횃불: 옆면을 누르면 벽에 붙임
      var sdx = h.x - h.px, sdz = h.z - h.pz;
      if (id === TORCH && (sdx || sdz) && h.py === h.y && isSolid(get(h.x, h.y, h.z)) && !SHAPE[get(h.x, h.y, h.z)]) id = WTORCH + (sdz < 0 ? 0 : (sdx > 0 ? 1 : (sdz > 0 ? 2 : 3)));
      else if (kind(id) === 'plant' && (!isSolid(get(bx, by - 1, bz)) || isShape(get(bx, by - 1, bz)))) return deny(id === TORCH ? '횃불은 단단한 블록 위나 벽에 붙여요' : '풀과 꽃은 땅 위에만 심을 수 있어요');
      // 통나무: 옆면에 놓으면 눕혀서
      if (id === LOG && h.py === h.y) id = sdx ? LOG_X : LOG_Z;
      if (id === RAIL0 || id === RAILF0) { var rg = get(bx, by - 1, bz); if (!isSolid(rg) || isShape(rg)) return deny('레일은 단단한 블록 위에 깔아요'); id = id + railShapeFor(bx, by, bz, ld); }
      if (id === LEVER && (!isSolid(get(bx, by - 1, bz)) || isShape(get(bx, by - 1, bz)))) return deny('레버는 단단한 블록 위에 놓아요');
      if (id === SIGN) { if (plotAt(bx, bz) !== myPlot || myPlot < 0) return deny('표지판은 내 땅에 세워요'); id = SIGN + ld; }
      function hitsMe(yy) { return bx + 1 > P.x - HW && bx < P.x + HW && yy + 1 > P.y && yy < P.y + HT && bz + 1 > P.z - HW && bz < P.z + HW; }
      if (item === DOOR) {
        // 문: 사람 키에 맞게 4칸 높이
        for (var k = 0; k < 4; k++) {
          var c = get(bx, by + k, bz);
          if ((c !== AIR && kind(c) !== 'plant') || canPlace(bx, by + k, bz)) return deny('문은 위로 빈 칸 4개가 있어야 놓을 수 있어요');
        }
        var df = (ld + 2) % 4;
        take(DOOR, 1);
        var doorUndo=[];
        for (k = 0; k < 4; k++) {
          doorUndo.push([bx,by+k,bz,readBlock(bx,by+k,bz),DOOR+df*2]);
          setBlock(bx, by + k, bz, DOOR + df * 2);
        }
        rememberBuild(item,doorUndo);
        sfx('place', matSound(item)); bagChanged(); stats.placed++; questCheck();
        swingT = 0.25; vibrate('place'); return;
      }
      if ((isSolid(id) && !SHAPE[id] || id === RAIL || item === GATE) && hitsMe(by)) return;
      var beforeId=readBlock(bx,by,bz);
      take(item, 1); setBlock(bx, by, bz, id); sfx('place', matSound(item)); bagChanged();
      rememberBuild(item,[[bx,by,bz,beforeId,id]]);
      if (item === RAIL0 || item === RAILF0) railFixNeighbors(bx, by, bz);
      if (item === TRAP) newsMark('trap');
      if (isGrav(id)) startFall(bx, by, bz);
      if (id === SAPLING) { SAPS.push({ x: bx, y: by, z: bz, t: Date.now() + (90 + Math.random() * 90) * 1000 }); saveSaps(); toast('묘목을 심었어요. 조금 지나면 나무로 자라요 (시 1:3)'); }
      partyAdd('build', 1);
      tutorialEvent('place');
      if (plotAt(bx, bz) === myPlot) { stats.placed++; questCheck(); if (stats.placed >= 30) unlock('house'); buildMilestone(); }
      if (inCommons(bx, bz)) unlock('commons');
      if (SHAPE[id] && SHAPE[id].type === 'sign') openSignPick(bx, by, bz);
    }
    swingT = 0.25; vibrate('place'); exhaust(0.02);
  }
  function naturalBuildResource(x, y, z, old) {
    if (old !== STONE && old !== LIME && old !== SAND && old !== CLAY) return 0;
    if (inTown(x, z) || inCommons(x, z) || inCity(x, z) || inDungeon(x, y, z) || plotAt(x, z) >= 0) return 0;
    var chunkKey = (z >> 5) * NC + (x >> 5), cell = (y * CS + (z & 31)) * CS + (x & 31);
    if (EDITS[chunkKey] && Object.hasOwn(EDITS[chunkKey], cell)) return 0;
    terrain(x,z);
    var r = hash2(x * 13 + y * 47, z * 17 - y * 71, 72);
    var nearSea = z < SEA_Z + 28;
    if (nearSea && y === T.h && (old === SAND || old === CLAY)) {
      if (T.wtop > y) return r < .035 ? SEA_PEARL : (r < .15 ? CORAL : 0);
      if (old === SAND && r < .24) return SALT;
    }
    if (old === CLAY && r < .3) return RED_EARTH;
    if (old === LIME && r < .26) return ALABASTER;
    if (old === STONE && x < PX0 - 20 && y >= G + 12 && r < .19) return MARBLE;
    if (old === STONE && r < .28) return FLINT;
    return 0;
  }
  function breakAt(x, y, z, old) {
    var resource = naturalBuildResource(x, y, z, old);
    setBlock(x, y, z, AIR); burst(x, y, z, old);
    var dropId = dropOf(old);
    exhaust(0.03);
    if (FARM_PLANTS[old]) {
      var farm = FARM_PLANTS[old], ripe = old === farm.base+3;
      if (ripe) {
        dropItem(x+.5,y+.4,z+.5,farm.harvest,2); dexMore('p' + farm.harvest, B[farm.harvest][0]);
        unlock('harvest'); partyAdd('harvest',1);
        if (farm.perennial && get(x,y-1,z)===FARM_SOIL) {
          setBlock(x,y,z,farm.base+1); trackCrop(x,y,z,farm.base,1); return;
        }
      }
      dropItem(x+.5,y+.4,z+.5,farm.seed,1);
      return;
    }
    if (isCrop(old)) {   // 밀 거두기: 익었으면 밀과 씨, 덜 익었으면 씨만
      if (old === CROP0 + 3) { dropItem(x + 0.5, y + 0.45, z + 0.5, WHEAT, 1 + (Math.random() < 0.5 ? 1 : 0)); dropItem(x + 0.5, y + 0.45, z + 0.5, SEED, 1 + (Math.random() < 0.6 ? 1 : 0)); unlock('harvest'); partyAdd('harvest', 1); }
      else dropItem(x + 0.5, y + 0.45, z + 0.5, SEED, 1);
      return;
    }
    dropItem(x + 0.5, y + 0.45, z + 0.5, dropId, 1);
    if ((old===GRASS || old===FLOWER || old===LEAF) && plotAt(x,z)<0 && Math.random()<.16)
      dropItem(x+.5,y+.4,z+.5,600+Math.floor(Math.random()*FARM_TYPES.length),1);
    if (old===FLOWER && Math.random()<.18) dropItem(x+.5,y+.4,z+.5,HONEY,1);
    if (resource) dropItem(x + .5,y + .6,z + .5,resource,1);
    if ((old === GRASS || old === FLOWER) && Math.random() < 0.12) dropItem(x + 0.5, y + 0.6, z + 0.5, SEED, 1);
    if (SHAPE[old] && SHAPE[old].type === 'sign' && myPlot >= 0 && plotAt(x, z) === myPlot) { var so = plotOrigin(myPlot); delete SIGNS[(x - so.x) + ',' + (y - PY0) + ',' + (z - so.z)]; markDirty(); refreshSigns(); }
    if (old === CHEST) spillChest(x, y, z);
    if (SHAPE[old] && SHAPE[old].type === 'frame') frameBroken(x, y, z);
    if (SHAPE[old] && SHAPE[old].type === 'mrail') parkedBroken(x, y, z);
    if (old === LEAF && Math.random() < 0.04) dropItem(x + 0.5, y + 0.45, z + 0.5, FIG, 1);
    if (old === LEAF) {
      if (Math.random() < 0.08) dropItem(x + 0.5, y + 0.45, z + 0.5, SAPLING, 1);
      if (Math.random() < 0.025) {
        dropItem(x + 0.5, y + 0.45, z + 0.5, OLIVE, 1);
        toast('🕊 감람나무 새 잎사귀! 비둘기가 물고 온 잎이에요 (창 8:11)');
      }
    }
    if (DEX_MATS.indexOf(dropId) >= 0 && !DEX['m' + dropId]) { DEX['m' + dropId] = 1; saveDex(); toast('📖 도감에 「' + B[dropId][0] + '」을(를) 적었어요'); }
    dexMined(old);
    if (old >= THORN && old <= LILY) recordVillagePlant(old,x,z);
    if (dropId === LOG) { stats.log++; questCheck(); partyAdd('logs', 1); }
  }
  var pickT = null, pickAgg = {};
  function pickup(id, n) {
    if (id === MANNA) unlock('manna');
    pickAgg[id] = (pickAgg[id] || 0) + (n || 1);
    var el = $('pickup'), parts = [];
    for (var k in pickAgg) parts.push('+' + pickAgg[k] + ' ' + B[k][0]);
    el.textContent = parts.join('  '); el.classList.add('show'); sfx('pop');
    clearTimeout(pickT); pickT = setTimeout(function () { el.classList.remove('show'); pickAgg = {}; }, 1400);
  }
  var VIB = { tap: 10, place: 12, drop: 18, break: 22, bow: [8, 30, 26], block: 40, hurt: [50, 40, 50], faith: [25, 30, 25, 30, 25], thunder: [20, 80, 70] };
  function vibrate(k) { try { navigator.vibrate && navigator.vibrate(VIB[k] || 12); } catch (e) {} }
  function setBlock(x, y, z, id) {
    var was = readBlock(x, y, z), c0 = colAt(x, z);
    setRaw(x, y, z, id); updateFrontierMachine(c0,x,y,z,id); updateSky(x, z); plotWrite(x, y, z, id);
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
    if (!h || furnitureRest) { mine = null; return; }
    if (!mine || mine.x !== h.x || mine.y !== h.y || mine.z !== h.z) {
      var why = canMine(h.x, h.y, h.z);
      if (why) { deny(why); mine = { x: h.x, y: h.y, z: h.z, t: 0, need: 1, denied: true }; return; }
      var id = get(h.x, h.y, h.z), mi = mineInfo(id);
      if (mi.deny) { deny(mi.deny); mine = { x: h.x, y: h.y, z: h.z, t: 0, need: 1, denied: true }; return; }
      mine = { x: h.x, y: h.y, z: h.z, t: 0, need: mi.t * (P.swim ? 3 : 1), snd: 0, f: matSound(id) };
    }
    if (mine.denied) return;
    mine.t += dt; mine.snd -= dt;
    if (mine.snd <= 0) { sfx('dig', mine.f); mine.snd = 0.2; swingT = 0.25; burst(mine.x, mine.y, mine.z, get(mine.x, mine.y, mine.z), true); oreTap(mine.x, mine.y, mine.z, get(mine.x, mine.y, mine.z)); }
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

  // 땅 한 필지 = PLOT×PLOT×(PH+3)칸 → (개수, 블록) 묶음 → base64, 뒤에 |i:가방 |d:도감
  function plotDefault() {
    var a = new Uint16Array(PSIZE), k = 0;
    for (var y = PY0; y < G + PH; y++) { var id = y < G - 1 ? DIRT : (y === G - 1 ? GRASS : AIR); for (var j = 0; j < PLOT * PLOT; j++) a[k++] = id; }
    return a;
  }
  function plotWrite(x, y, z, id) {
    var p = plotAt(x, z);
    if (p < 0 || (p !== myPlot && !isAdm()) || y < PY0 || y >= G + PH) return;
    if (!plotData[p]) plotData[p] = plotDefault();
    var o = plotOrigin(p); plotData[p][((y - PY0) * PLOT + (z - o.z)) * PLOT + (x - o.x)] = id;
  }
  var expandedPlotFormats={};
  function compactLegacyPlot(a) {
    if(!a||PLOT===OLD_PLOT)return a;
    for(var layer=0;layer<G+PH-PY0;layer++){
      var y=layer+PY0, base=y<G-1?DIRT:(y===G-1?GRASS:AIR);
      for(var z=0;z<PLOT;z++)for(var x=(z<OLD_PLOT?OLD_PLOT:0);x<PLOT;x++){
        if(a[(layer*PLOT+z)*PLOT+x]!==base)return null;
      }
    }
    var legacy=new Uint16Array(OLD_PLOT*OLD_PLOT*(G+PH-PY0));
    for(layer=0;layer<G+PH-PY0;layer++)for(z=0;z<OLD_PLOT;z++){
      var from=(layer*PLOT+z)*PLOT;
      legacy.set(a.subarray(from,from+OLD_PLOT),(layer*OLD_PLOT+z)*OLD_PLOT);
    }
    return legacy;
  }
  function encodePlot(i) {
    var a=plotData[i], out='', k, expanded=!!expandedPlotFormats[i];
    if(a&&PLOT===WIDE_PLOT&&!expanded){
      var compact=compactLegacyPlot(a);
      if(compact)a=compact;
      else expanded=expandedPlotFormats[i]=true;
    }
    var wide=expanded||(a&&a.some(function(id){return id>255;}));
    if (a) {
      for (k = 0; k < a.length;) {
        var v = a[k], n = 1;
        while (k + n < a.length && a[k + n] === v && n < 255) n++;
        out += wide ? String.fromCharCode(n, v & 255, v >> 8) : String.fromCharCode(n, v); k += n;
      }
    }
    var cs = chestString();
    return (a ? (expanded ? 'r3:' : (wide ? 'r2:' : 'r1:')) + btoa(out) : 'r0:') + '|i:' + bagString() + '|d:' + dexString() + (cs ? '|c:' + cs : '') + '|w:' + wornString() + '|s:' + seenString() + (signString() ? '|g:' + signString() : '') + (frameString() ? '|f:' + frameString() : '');
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
      parts.slice(1).forEach(function (seg) {   // 표지판 글: 내 땅이든 다른 사람 땅이든
        if (seg.slice(0, 2) !== 'g:') return;
        if (mine) { SIGNS = {}; signFromString(seg.slice(2), SIGNS); } else { OTHER_SIGNS[i] = {}; signFromString(seg.slice(2), OTHER_SIGNS[i]); }
      });
      if (mine) FRAMES = {}; else delete OTHER_FRAMES[i];
      parts.slice(1).forEach(function (seg) {   // 액자에 건 것: 내 땅이든 다른 사람 땅이든
        if (seg.slice(0, 2) !== 'f:') return;
        if (mine) frameFromString(seg.slice(2), FRAMES); else { OTHER_FRAMES[i] = {}; frameFromString(seg.slice(2), OTHER_FRAMES[i]); }
      });
      var format = body.slice(0, 3);
      if (format !== 'r1:' && format !== 'r2:' && format !== 'r3:') return;
      var size = format === 'r3:' ? WIDE_PLOT : OLD_PLOT;
      if (size > PLOT) return;
      var volume = size * size * (G + PH - PY0);
      var s = atob(body.slice(3)), a = new Uint16Array(volume), k = 0, stride = format === 'r1:' ? 2 : 3;
      if (s.length % stride) return;
      for (var j = 0; j < s.length; j += stride) {
        var n = s.charCodeAt(j), v = s.charCodeAt(j + 1) + (stride === 3 ? s.charCodeAt(j + 2) * 256 : 0);
        if (!n || k + n > volume) return;
        a.fill(v < B.length && B[v] ? v : AIR, k, k + n); k += n;   // 물도 그대로(대저택 수영장)
      }
      if (k !== volume) return;
      if (size < PLOT) {
        var expanded = plotDefault();
        for (var layer = 0; layer < G + PH - PY0; layer++) {
          for (var row = 0; row < size; row++) {
            var offset = (layer * size + row) * size;
            expanded.set(a.subarray(offset, offset + size), (layer * PLOT + row) * PLOT);
          }
        }
        a = expanded;
      }
      plotData[i] = a;
      expandedPlotFormats[i]=format==='r3:';
    } catch (e) {}
  }
  // 내 땅 저장: 서버 기록이 내가 마지막으로 본 것 그대로일 때만 덮는다.
  // 그 사이 다른 기기·선생님이 먼저 저장했으면 덮지 않고 서버의 최신 내 땅을 불러온다(두 기기로 번갈아 해도 기록이 사라지지 않게)
  var plotSrvAt = null;   // 내 땅 서버 기록의 마지막 저장 시각(이름 주의: plotAt은 「몇 번 땅인지」 함수)
  var noBagNote = false;
  function plotWriteServer(data) {
    var now = new Date().toISOString(), q = client.from('ark_village_plots').update({ data: data, updated_at: now }).eq('user_id', me.id);
    if (plotSrvAt) q = q.eq('updated_at', plotSrvAt);
    return q.select(noBagNote ? 'updated_at' : 'updated_at,bag_note').then(function (r) {
      if (r.error && !noBagNote && /bag_note/.test(r.error.message || '')) { noBagNote = true; return plotWriteServer(data); }   // 서버에 가방 확인이 아직 없을 때
      if (r.error) { setSave('저장 실패 — 다시 시도해요'); dirty = true; saveTimer = setTimeout(savePlot, 4000); return; }
      if (r.data && r.data.length) {
        plotSrvAt = r.data[0].updated_at; setSave('저장됨');
        if (r.data[0].bag_note === 'reverted') return reloadMyPlot(true).then(function () { toast('🎒 가방 숫자가 갑자기 너무 많이 늘어서 서버에 저장된 가방으로 되돌렸어요'); });
        return;
      }
      return reloadMyPlot();   // 다른 곳에서 더 나중에 저장함
    });
  }
  function reloadMyPlot(quiet) {
    return client.from('ark_village_plots').select('data,updated_at').eq('user_id', me.id).maybeSingle().then(function (r) {
      var row = r && r.data; if (!row) { setSave('저장 실패 — 다시 시도해요'); return; }
      plotSrvAt = row.updated_at; dirty = false; clearTimeout(saveTimer);
      if (row.data) decodePlot(myPlot, row.data, true);
      var o = plotOrigin(myPlot);
      for (var cz = (o.z - 1) >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = (o.x - 1) >> 5; cx <= (o.x + PLOT) >> 5; cx++) {
        var k = cz * NC + cx; if (!COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); }
      }
      bagChanged(); setSave('저장됨'); if (!quiet) toast('📱 다른 기기(또는 선생님)가 더 나중에 바꾼 내 땅을 불러왔어요');
    });
  }
  function savePlotNow() {
    if (!client || !me || myPlot < 0) return Promise.resolve();
    clearTimeout(saveTimer); dirty = false;
    var data = encodePlot(myPlot);
    if (data.length > 20000) return Promise.resolve();
    return plotWriteServer(data);
  }
  function savePlot() {
    if (!client || !me || myPlot < 0 || !dirty) return;
    var data = encodePlot(myPlot);
    if (data.length > 20000) { setSave('저장 안 됨'); toast('집이 너무 복잡해서 저장할 수 없어요. 블록을 조금 정리해 주세요'); return; }
    dirty = false;
    plotWriteServer(data);
  }
  function setSave(t) { var el = $('saveState'); if (el) { el.textContent = t; el.classList.toggle('quiet', t === '저장됨'); } }
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
    if (DROPS.length > 60 && !collectDrop(DROPS[0], true)) dropAway(DROPS[0]);
    if (!scene || !atlasTex) { give(id, n); return; }
    dropMats();
    var flat = isFlat(id), geo = dropGeo[id] || (dropGeo[id] = flat ? itemGeometry(id) : blockGeometry(id));
    var m = new THREE.Mesh(geo, flat ? dropMatF : dropMatB); m.scale.setScalar(flat ? 0.5 : 0.3); m.position.set(x, y, z); scene.add(m);
    DROPS.push({ id: id, n: n, x: x, y: y, z: z, vx: (Math.random() - 0.5) * 2.2, vy: 3.5, vz: (Math.random() - 0.5) * 2.2, age: 0, m: m, rot: Math.random() * 6 });
  }
  // 줍기: 가방에 자리가 없으면 남은 것은 땅에 그대로(잠깐 안 끌려옴)
  function collectDrop(o, quiet) {
    if (o.dead) return true;
    var g = give(o.id, o.n);
    if (g > 0 && !quiet) pickup(o.id, g);
    if (g < o.n) { o.n -= g; o.full = o.age; bagFull(); return false; }
    o.dead = true;
    if (o.m) { scene.remove(o.m); o.m = null; }
    return true;
  }
  function dropAway(o) { if (o.m) { scene.remove(o.m); o.m = null; } o.dead = true; }
  function collectAll() { DROPS.forEach(function (o) { collectDrop(o, true); }); DROPS = []; bagChanged(); }
  window.addEventListener('pagehide', function () { if (DROPS.length) collectAll(); });
  // ── 버리기·줍기: 버린 물건은 근처 사람 모두에게 보이고 먼저 닿는 사람이 줍는다(서버 ark_drops, 15분 뒤 사라짐) ──
  var SDROPS = {}, sdropAt = 0, sdropBusy = false, takeBusy = {};
  function throwItem(id, n) {
    if (!id || INV.indexOf(id) < 0) { toast('버릴 것을 골라요'); return; }
    n = Math.min(n, have(id), 64); if (n < 1) { toast(nameOf(id) + '이(가) 없어요'); return; }
    var fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), x = P.x + fx * 1.6, z = P.z + fz * 1.6, y = P.y + 1.2;
    take(id, n); bagChanged(); sfx('pop');
    if (socialOn()) {
      client.rpc('drop_ark_item', { p_x: x, p_y: y, p_z: z, p_item: id, p_amount: n }).then(function (r) {
        var nid = r && r.data;
        if (!nid || nid < 0) { give(id, n); bagChanged(); toast(nid === -3 ? '버린 물건이 너무 많아요. 조금 뒤에 다시 해요' : '버리지 못했어요'); return; }
        addSDrop({ id: nid, x: x, y: y, z: z, item: id, amount: n, mine: true });
        toast('🫳 ' + nameOf(id) + ' ' + n + '개를 버렸어요 — 다른 사람도 주울 수 있어요');
      }, function () { give(id, n); bagChanged(); toast('버리지 못했어요'); });
    } else {
      dropItem(x, y, z, id, n);
      var o = DROPS[DROPS.length - 1]; if (o && o.id === id) { o.thrown = true; o.full = o.age; }
      toast('🫳 ' + nameOf(id) + ' ' + n + '개를 버렸어요');
    }
  }
  function addSDrop(d) {
    if (SDROPS[d.id] || !scene || !atlasTex || !B[d.item]) return;
    dropMats();
    var flat = isFlat(d.item), geo = dropGeo[d.item] || (dropGeo[d.item] = flat ? itemGeometry(d.item) : blockGeometry(d.item));
    var m = new THREE.Mesh(geo, flat ? dropMatF : dropMatB); m.scale.setScalar(flat ? 0.5 : 0.3);
    var ix = Math.floor(d.x), iz = Math.floor(d.z), gy = d.y;
    for (var yy = Math.min(SY - 1, Math.floor(d.y)); yy > 0; yy--) { if (isSolid(get(ix, yy - 1, iz))) { gy = yy + 0.18; break; } }
    m.position.set(d.x, gy, d.z); scene.add(m);
    SDROPS[d.id] = { id: d.id, item: d.item, n: d.amount, x: d.x, y: gy, z: d.z, m: m, hold: d.mine ? performance.now() + 3000 : 0, rot: Math.random() * 6, fullT: 0 };
  }
  function removeSDrop(id) { var s = SDROPS[id]; if (!s) return; if (s.m) scene.remove(s.m); delete SDROPS[id]; }
  function fetchSDrops() {
    if (!socialOn() || sdropBusy || performance.now() < sdropAt) return;
    sdropAt = performance.now() + 4000; sdropBusy = true;
    client.rpc('get_ark_drops', { p_x: P.x, p_z: P.z }).then(function (r) {
      sdropBusy = false; if (!r || r.error || !Array.isArray(r.data)) return;
      var seen = {}; r.data.forEach(function (d) { seen[d.id] = 1; addSDrop(d); });
      for (var k in SDROPS) { var s = SDROPS[k]; if (!seen[k] && !takeBusy[k] && Math.abs(s.x - P.x) <= 60 && Math.abs(s.z - P.z) <= 60) removeSDrop(k); }
    }, function () { sdropBusy = false; });
  }
  function stepSDrops(dt) {
    fetchSDrops();
    var now = performance.now();
    for (var k in SDROPS) {
      var s = SDROPS[k]; s.rot += dt * 1.8;
      s.m.position.y = s.y + Math.sin(now / 330 + s.id) * 0.06; s.m.rotation.y = s.rot;
      var dx = P.x - s.x, dy = (P.y + 0.6) - s.y, dz = P.z - s.z;
      if (Math.abs(dx) > 90 || Math.abs(dz) > 90) { removeSDrop(k); continue; }
      if (now < s.hold || takeBusy[k] || dx * dx + dy * dy + dz * dz > 2.6) continue;
      if (!isAdm() && room(s.item) < s.n) { if (now > s.fullT) { s.fullT = now + 5000; bagFull(); } continue; }
      takeSDrop(s);
    }
  }
  function takeSDrop(s) {
    takeBusy[s.id] = 1;
    client.rpc('take_ark_drop', { p_id: s.id }).then(function (r) {
      delete takeBusy[s.id]; removeSDrop(s.id);
      var d = r && r.data;
      if (d && d.item) { give(d.item, d.amount); bagChanged(); pickup(d.item, d.amount); }
    }, function () { delete takeBusy[s.id]; });
  }
  // 관리자가 다른 사람 땅을 고치면: 그 땅의 블록 부분만 서버에 저장(가방·도감 같은 주인 기록은 그대로)
  var adminPlots = {}, adminPlotT = 0;
  function adminPlotDirty(p) {
    adminPlots[p] = 1; clearTimeout(adminPlotT);
    adminPlotT = setTimeout(function () {
      var ps = Object.keys(adminPlots); adminPlots = {};
      ps.forEach(function (k) {
        var blocks = encodePlot(+k).split('|')[0];
        client.rpc('admin_set_plot_blocks', { p_plot: +k, p_blocks: blocks }).then(function (r) {
          if (r && r.data === true) toast('🛠 ' + (+k + 1) + '번 땅을 고쳐 저장했어요(관리자)');
          else toast((+k + 1) + '번 땅을 저장하지 못했어요');
        }, function () { toast((+k + 1) + '번 땅을 저장하지 못했어요'); });
      });
    }, 1500);
  }
  function stepDrops(dt) {
    if (!DROPS.length) return;
    var got = false, px = P.x, py = P.y + 1.3, pz = P.z;
    for (var i = 0; i < DROPS.length; i++) {
      var o = DROPS[i]; if (o.dead) continue;
      o.age += dt;
      var dx = px - o.x, dy = py - o.y, dz = pz - o.z, dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
      var wait = o.full !== undefined && o.age - o.full < 3;   // 가방이 찼거나 버린 것은 잠깐 안 끌려옴
      if (o.age > 300) { dropAway(o); continue; }   // 5분 지나면 사라짐
      if (o.manna && (dayT % DAY_LEN) / DAY_LEN > 0.3) { dropAway(o); continue; }   // 햇볕이 뜨겁게 쬐면 스러짐(출 16:21)
      if (!wait && !o.thrown && (dist > 28 || o.age > 30)) { if (collectDrop(o, true)) got = true; continue; }
      if (!wait && o.age > 0.35 && (o.thrown ? dist < 1.4 : (dist < 3.4 || o.age > 6))) {
        var spd = Math.min(32, 7 + (3.4 - Math.min(dist, 3.4)) * 9 + (o.age > 6 ? 12 : 0));
        o.x += dx / dist * spd * dt; o.y += dy / dist * spd * dt; o.z += dz / dist * spd * dt;
        if (dist < 0.9) { got = true; if (!collectDrop(o)) { o.vx = (Math.random() - 0.5) * 3; o.vz = (Math.random() - 0.5) * 3; o.vy = 3; } continue; }
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
  // 알림은 차례로 보여 준다(빨리 덮이지 않게): 같은 말은 한 번, 기다리는 것은 3개까지
  var toastQ = [], toastCur = '';
  function toast(t) {
    if (!t || t === toastCur || toastQ.indexOf(t) >= 0) return;
    if (toastCur) { toastQ.push(t); if (toastQ.length > 3) toastQ.shift(); return; }
    toastShow(t);
  }
  function toastShow(t) {
    var el = $('toast'); toastCur = t; el.textContent = t; el.classList.add('show'); clearTimeout(toastT);
    toastT = setTimeout(function () {
      el.classList.remove('show'); toastCur = '';
      if (toastQ.length) setTimeout(function () { if (!toastCur && toastQ.length) toastShow(toastQ.shift()); }, 250);
    }, toastQ.length ? 2000 : 2600);
  }
  // 게임 오류는 말씀우물 오류 기록(client_errors)에 남긴다 — 한 번 들어올 때 6건까지, 같은 말은 한 번(auth.js와 같은 규칙)
  (function () {
    var sent = 0, seen = {}, pend = [];
    function send(msg, stack) {
      msg = String(msg || 'script error'); if (sent >= 6 || seen[msg]) return; seen[msg] = 1; sent++;
      var go = function () { try { client.rpc('log_client_error', { p_page: location.pathname + location.search, p_message: msg.slice(0, 1000), p_stack: String(stack || '').slice(0, 4000), p_ua: navigator.userAgent }).then(function () {}, function () {}); } catch (e) {} };
      if (typeof client !== 'undefined' && client && client.rpc) go(); else pend.push(go);
    }
    setInterval(function () { if (pend.length && client && client.rpc) { var q = pend; pend = []; q.forEach(function (f) { f(); }); } }, 5000);
    window.addEventListener('error', function (e) { send(e.message, (e.error && e.error.stack) || ((e.filename || '') + ':' + (e.lineno || '') + ':' + (e.colno || ''))); });
    window.addEventListener('unhandledrejection', function (e) { var r = e.reason; send('unhandledrejection: ' + (r && r.message ? r.message : String(r)), (r && r.stack) || ''); });
  })();
  placeName = function () {
    var x = Math.floor(P.x), y = Math.floor(P.y), z = Math.floor(P.z);
    if (x >= AX0 && x <= AX1 && z >= AZ0 && z <= AZ1 && y >= AY0 && y <= AY1 + 1) {
      if (y > AY1 - 1) return '방주 지붕';
      return y >= AY0 + 21 ? '방주 상층' : (y >= AY0 + 11 ? '방주 중층' : '방주 하층');
    }
    var p = plotAt(x, z);
    if (p >= 0) return p === myPlot ? '내 땅 (' + (p + 1) + '번)' + (homeSafe ? ' · 🏠 안전한 집' : '') : (p + 1) + '번 땅' + (plotOwners[p] ? '' : ' · 빈 땅');
    var reg = region(x, z), lmk = inLandmark(x, z);
    if (lmk) return REGION_INFO[lmk][0];
    if (reg === 'cedar') return '백향목 숲';
    if (reg === 'wild') return '광야';
    if (reg === 'salt') return P.swim ? '소금 바다 (헤엄치는 중)' : '소금 바닷가';
    if (reg === 'tar') return '역청 구덩이 (창 14:10)';
    if (reg === 'lake') return P.swim ? '호수 (헤엄치는 중)' : '남쪽 호숫가';
    if (inCommons(x, z)) return '🏗 함께 짓는 터';
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
    return '<img alt="" src="' + ICON[id] + '"' + (count === 0 ? ' class="none"' : '') + '>' + bar + (isAdm() ? '<i class="inf">∞</i>' : (count > 1 || (count === 1 && stackOf(id) > 1) ? '<i>' + count + '</i>' : ''));
  }
  // 마인크래프트 휴대폰판처럼 단축 칸을 길게 누르면 버리기 — 0.5초에 1개, 그대로 1.5초까지 누르면 한 묶음
  var hotHold = { t1: 0, t2: 0, quiet: 0 };
  function hotHoldStop() { clearTimeout(hotHold.t1); clearTimeout(hotHold.t2); hotHold.t1 = hotHold.t2 = 0; }
  window.addEventListener('pointerup', hotHoldStop); window.addEventListener('pointercancel', hotHoldStop);
  function renderHotbar() {
    var bar = $('hotbar'); bar.innerHTML = '';
    HOTBAR.forEach(function (id, i) {
      var d = document.createElement('button'); d.className = 'slot' + (i === sel ? ' on' : ''); d.title = nameOf(id) + ' (' + (i + 1) + ')'; d.innerHTML = (id ? slotHTML(id, hotCount(id)) : '') + '<u class="num">' + (i + 1) + '</u>';
      d.addEventListener('click', function () { if (performance.now() < hotHold.quiet) return; setSel(i); sfx('click'); });
      d.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      d.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch' || !id || ui !== 'play' || have(id) < 1) return;
        hotHoldStop();
        hotHold.t1 = setTimeout(function () {
          hotHold.quiet = performance.now() + 2500; setSel(i, true); throwItem(id, 1); vibrate('drop'); newsMark('drop');
          hotHold.t2 = setTimeout(function () { hotHold.t2 = 0; var n = Math.min(hotCount(id), 64); if (n > 0) { throwItem(id, n); vibrate('break'); } }, 1000);
        }, 500);
      });
      d.addEventListener('pointerleave', function () { if (hotHold.t1 && !hotHold.quiet) hotHoldStop(); });
      bar.appendChild(d);
    });
    var more = document.createElement('button'); more.className = 'slot more'; more.innerHTML = '🎒<small>가방</small>'; more.title = '가방·만들기 (E)';
    more.addEventListener('click', function () { openPanel('inv'); sfx('click'); });
    bar.appendChild(more);
  }
  var invTab = 'bag', craftCat = 'block', bagPick = null, craftQuery = '';
  var BAG_CATS = [['all', '전체'], ['block', '🧱 블록'], ['tool', '⛏ 도구·옷'], ['food', '🍞 먹을 것'], ['item', '💎 재료'], ['deco', '🪑 꾸미기']];
  function bagCat(id) {
    var k = B[id] && B[id][6];
    if (k === 'tool' || isWeapon(id) || WEARINFO[id] || id === SADDLE || id === BOW || id === ARROW || id === CART || id === FISH_ROD || id === FISH_NET || id === HOE || id === STAFF || id === SLING || id === COMPASS || id === HAND_MAP || id === SHOFAR) return 'tool';
    if (FOODS[id] !== undefined) return 'food';
    if (k === 'item') return 'item';
    if (SHAPE[id] || LIGHTS[id] || k === 'plant') return 'deco';
    return 'block';
  }
  // ── 가방·만들기 한 화면(11/20): 왼쪽 세로 그림 탭 · 가운데 칸 · 오른쪽 자세히 · 아래 단축 칸 ──
  var invSel = null, lastBC = 'bag', dropAmt = { id: 0, n: 1 };
  var CRAFT_TABS = [['all', '🔍', '모두'], ['recent', '🕘', '최근'], ['block', '🧱', '블록'], ['shape', '🚪', '모양'], ['tool', '⛏', '도구'], ['smelt', '🔥', '녹이기'], ['wear', '👕', '옷']];
  var REP_MAT_T = function (tid) { return [GOPHER, STONE, ING_CU, ING_FE, GEM_DIA][tierOf(tid)]; };
  // 최근 만든 것: [제작법 번호, 나오는 물건] 12개까지, 새로 만든 것이 앞
  function recentRank(rc) { var a = S.recentCraft || [], i = RECIPES.indexOf(rc); for (var k = 0; k < a.length; k++) if (a[k][0] === i && a[k][1] === rc.out[0]) return k; return -1; }
  function noteRecent(rc) { var i = RECIPES.indexOf(rc); if (i < 0) return; var a = (S.recentCraft || []).filter(function (p) { return p[0] !== i && RECIPES[p[0]] && RECIPES[p[0]].out[0] === p[1]; }); a.unshift([i, rc.out[0]]); S.recentCraft = a.slice(0, 12); saveSettings(); }
  function craftTimes(rc) { if (isAdm()) return 99; var t = 999; rc.need.forEach(function (n) { t = Math.min(t, Math.floor(have(n[0]) / n[1])); }); return t; }
  function invInfo(id) { return B[id][0] + ' ' + fmtN(have(id)) + '개' + (isTool(id) && !isAdm() ? ' · 남은 힘 ' + wearLeft(id) + '/' + toolMax(id) : ''); }
  function renderInv() {
    var inBC = invTab === 'bag' || invTab === 'craft';
    if (inBC) lastBC = invTab;
    $('tabBag').classList.toggle('on', inBC); $('tabDex').classList.toggle('on', invTab === 'dex'); $('tabAch').classList.toggle('on', invTab === 'ach');
    $('bagView').style.display = invTab === 'bag' ? '' : 'none'; $('craftView').style.display = invTab === 'craft' ? '' : 'none';
    $('dexView').style.display = invTab === 'dex' ? '' : 'none'; $('achView').style.display = invTab === 'ach' ? '' : 'none';
    $('invSide').style.display = inBC ? '' : 'none'; $('invDetail').style.display = inBC ? '' : 'none'; $('invHot').style.display = inBC ? '' : 'none';
    $('invBody').classList.toggle('solo', !inBC);
    if (invTab === 'ach') renderAch();
    renderDex();
    // 왼쪽 세로 탭: 만들기 분류 여섯 + 가방(맨 아래)
    var side = $('invSide'); side.innerHTML = '';
    function sideBtn(on, icon, label, fn) {
      var b = document.createElement('button'); b.className = 'vtab' + (on ? ' on' : ''); b.innerHTML = '<span>' + icon + '</span><small>' + label + '</small>'; b.title = label;
      b.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); fn(); }); side.appendChild(b);
    }
    sideBtn(invTab === 'bag', '🎒', '가방', function () { invTab = 'bag'; invSel = null; renderInv(); });
    var sp = document.createElement('i'); sp.className = 'vsep'; side.appendChild(sp);
    CRAFT_TABS.forEach(function (c) { sideBtn(invTab === 'craft' && craftCat === c[0], c[1], c[2], function () { invTab = 'craft'; craftCat = c[0]; invSel = null; bagPick = null; renderInv(); }); });
    syncBagSlots();
    var SC = slotCounts();
    // 가방
    var grid = $('invGrid'); grid.innerHTML = '';
    if (invTab === 'bag') {
      $('bagUse').textContent = isAdm() ? '관리자 · 모두 ∞' : usedSlots() + ' / ' + BAG_SLOTS + '칸';
      var cats = $('bagCats'); cats.innerHTML = '';
      BAG_CATS.forEach(function (c) {
        var n = c[0] === 'all' ? 0 : BAGSLOT.filter(function (id) { return id && bagCat(id) === c[0]; }).length;
        var b = document.createElement('button'); b.className = 'mc' + ((S.bagCat || 'all') === c[0] ? ' on' : ''); b.textContent = c[1] + (n ? ' ' + n : '');
        b.addEventListener('click', function (e) { e.stopPropagation(); S.bagCat = c[0]; saveSettings(); sfx('click'); bagPick = null; renderInv(); });
        cats.appendChild(b);
      });
      var showCat = S.bagCat || 'all', shown = 0;
      BAGSLOT.forEach(function (id, i) {
        if (showCat !== 'all' && (!id || bagCat(id) !== showCat)) return;
        shown++;
        var d = document.createElement('button'), on = bagPick && bagPick.from === 'bag' && bagPick.i === i;
        d.className = 'islot' + (on ? ' pick' : '') + (id ? '' : ' empty'); d.innerHTML = id ? slotHTML(id, SC[i]) : ''; d.title = id ? B[id][0] + (isAdm() ? '' : ' ' + SC[i] + '개') : '빈 칸';
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
          bagPick = { from: 'bag', i: i, id: id, n: SC[i] }; renderInv();
          $('invName').textContent = B[id][0] + ' — 아래 단축 칸을 누르면 손에 들고, 다른 가방 칸을 누르면 자리를 바꿔요';
        });
        grid.appendChild(d);
      });
      if (showCat !== 'all' && !shown) { var e0 = document.createElement('div'); e0.className = 'bagEmpty'; e0.textContent = '이 분류에 든 것이 없어요'; grid.appendChild(e0); }
    }
    // 아래 단축 칸(가방·만들기 모두)
    var row = $('invHot'); row.innerHTML = '';
    HOTBAR.forEach(function (id, i) {
      var on = bagPick && bagPick.from === 'hot' && bagPick.i === i;
      var d = document.createElement('button'); d.className = 'islot' + (i === sel ? ' on' : '') + (on ? ' pick' : '') + (id ? '' : ' empty'); d.innerHTML = (id ? slotHTML(id, hotCount(id)) : '') + '<u class="num">' + (i + 1) + '</u>'; d.title = (i + 1) + '번 칸: ' + nameOf(id);
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
        if (id) { bagPick = { from: 'hot', i: i, id: id }; if (invTab !== 'bag') invTab = 'bag'; $('invName').textContent = (i + 1) + '번 칸 — 다른 단축 칸을 누르면 자리 바꾸기, 가방 칸을 누르면 이 칸 비우기'; }
        else $('invName').textContent = (i + 1) + '번 칸은 비어 있어요. 가방 칸을 먼저 누르고 여기를 눌러요';
        renderInv();
      });
      row.appendChild(d);
    });
    if (invTab === 'craft') renderCraftGrid();
    renderInvDetail();
    if (!$('invName').textContent && !S.invHint) { $('invName').textContent = '가방 칸을 누르고 → 아래 단축 칸을 누르면 손에 들어요'; S.invHint = 1; saveSettings(); }
  }
  // 제작법 그림 칸: 만들 수 있으면 회색(몇 개 만들 수 있는지 숫자), 재료가 모자라면 빨강, 아직 모르면 어둡게
  function renderCraftGrid() {
    var list = $('craftList'); list.innerHTML = '';
    var q = $('craftQ'); if (q && document.activeElement !== q) q.value = craftQuery;
    var st = curStage(), allN = RECIPES.length, openN = RECIPES.filter(recOpen).length, sb = $('craftStage');
    sb.innerHTML = '📜 제작법 <b>' + openN + '/' + allN + '</b> · <b>' + st.n + '단계</b> 「' + st.name + '」';
    sb.title = STAGE_NEXT[st.n] ? '다음: ' + STAGE_NEXT[st.n] : '마지막 단계예요';
    var items = [];
    RECIPES.forEach(function (rc) {
      if (craftQuery) { if (!recOpen(rc) || B[rc.out[0]][0].indexOf(craftQuery) < 0) return; }   // 찾는 중엔 잠긴 제작법 이름을 드러내지 않음
      else if (craftCat === 'recent') { if (recentRank(rc) < 0 || !recOpen(rc)) return; }
      else if (craftCat !== 'all' && rc.cat !== craftCat) return;
      if (!recOpen(rc)) { if (craftCat !== 'all') items.push({ k: 'lock', rc: rc, o: 3 + recStage(rc) / 100 }); return; }   // 「모두」에는 아는 제작법만
      var ok = canCraft(rc); items.push({ k: 'rec', rc: rc, ok: ok, o: craftCat === 'recent' && !craftQuery ? recentRank(rc) : (ok ? 0 : 2) });
    });
    if (craftCat === 'tool' && !craftQuery) Object.keys(WEAR).forEach(function (k) {
      var tid = +k; if (have(tid) < 1) return;
      items.push({ k: 'rep', id: tid, ok: have(REP_MAT_T(tid)) >= 1, o: have(REP_MAT_T(tid)) >= 1 ? 1 : 2.5 });
    });
    items.forEach(function (it, i) { it.i = i; });
    items.sort(function (a, b) { return a.o - b.o || a.i - b.i; });
    function same(a, b) { return a && b && a.k === b.k && (a.k === 'rep' ? a.id === b.id : a.rc === b.rc); }
    if (!items.some(function (it) { return same(it, invSel); })) invSel = items[0] || null;
    items.forEach(function (it) {
      var d = document.createElement('button'), out = it.k === 'rep' ? it.id : it.rc.out[0];
      d.className = 'rtile' + (it.k === 'lock' ? ' lockd' : (it.ok ? '' : ' no')) + (it.k === 'rep' ? ' rep' : '') + (same(it, invSel) ? ' pick' : '');
      var h = '<img src="' + ICON[out] + '" alt="">';
      if (it.k === 'rec' && it.ok && !isAdm()) { var n = craftTimes(it.rc) * it.rc.out[1]; if (n > 0) h += '<i>' + (n > 99 ? '99+' : n) + '</i>'; }
      if (it.k === 'rep') h += '<em>🔧</em>'; if (it.k === 'lock') h += '<em>🔒</em>';
      d.innerHTML = h; d.title = it.k === 'lock' ? '아직 모르는 제작법' : (it.k === 'rep' ? toolName(it.id) + ' 고치기' : B[out][0]);
      d.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); invSel = it; renderInv(); });
      list.appendChild(d);
    });
    if (!items.length) { var e = document.createElement('div'); e.className = 'bagEmpty'; e.textContent = craftQuery ? '찾는 제작법이 없어요' : (craftCat === 'recent' ? '아직 만든 것이 없어요 — 만들면 여기에 모여요' : '아직 이 분류의 제작법이 없어요'); list.appendChild(e); }
  }
  // 오른쪽 자세히: 가방에서 고른 것 / 고른 제작법
  function renderInvDetail() {
    var det = $('invDetail'); det.innerHTML = '';
    function add(tag, cls, html) { var el = document.createElement(tag); if (cls) el.className = cls; if (html !== undefined) el.innerHTML = html; det.appendChild(el); return el; }
    function btn(label, fn, parent) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.addEventListener('click', function (e) { e.stopPropagation(); fn(e); }); (parent || det).appendChild(b); return b; }
    function top(id, name, sub) { add('div', 'dtop', '<span class="big"><img src="' + ICON[id] + '" alt=""></span><span><b>' + name + '</b><small>' + (sub || '') + '</small></span>'); }
    function fuelLine() { var fl = Math.floor(fuelLeft() * 2) / 2; add('div', 'dhint', '🔥 땔감: 석탄·숯 1개 = 8번 · 통나무 1개 = 1.5번 · 석탄 블록 = 72번<br><b>지금 ' + fl + '번 녹일 수 있어요</b>' + (HEAT > 0 ? ' (남은 불 ' + HEAT + ')' : '')); }
    if (invTab === 'bag') {
      var p = bagPick;
      if (!p || !p.id || !B[p.id]) {
        add('div', 'dempty', '🎒 가방 칸을 누르면 여기에 자세히 나와요.<br><br>누른 다음 <b>아래 단축 칸</b>을 누르면 손에 들 수 있어요.');
        btn('↕ 가방 정리', function () { $('bagSort').click(); });
        return;
      }
      var id = p.id, kind = { block: '블록', tool: '도구·옷', food: '먹을 것', item: '재료', deco: '꾸미기' }[bagCat(id)];
      top(id, B[id][0], kind + ' · ' + fmtN(have(id)) + '개');
      if (isTool(id) && WEAR[id] !== undefined && !isAdm()) { var f = WEAR[id] / toolMax(id); add('div', 'ddur', '<s style="width:' + Math.max(4, Math.round(f * 100)) + '%;background:' + (f > 0.5 ? '#4fd14f' : f > 0.2 ? '#e8c53a' : '#e0473a') + '"></s>'); add('div', 'dhint', '남은 힘 ' + wearLeft(id) + ' / ' + toolMax(id) + ' — 만들기 → ⛏ 도구에서 고쳐요'); }
      if (FOODS[id] !== undefined && vitalsOn()) btn('🍞 먹기 (기운 +' + FOODS[id] + ')', function () { eatItem(id); bagPick = null; renderInv(); });
      if (p.from === 'bag') {
        add('div', 'dhint', '⬇ 아래 단축 칸을 누르면 손에 들어요');
        if (!isAdm()) {
          var maxN = Math.max(1, Math.min(have(id), 64));
          if (dropAmt.id !== id) dropAmt = { id: id, n: 1 };
          dropAmt.n = Math.max(1, Math.min(maxN, dropAmt.n));
          if (maxN > 1) {   // 몇 개 버릴지: − 숫자 + · 반 · 최대
            var r = add('div', 'drow damt');
            btn('−', function () { dropAmt.n = Math.max(1, dropAmt.n - 1); renderInvDetail(); }, r);
            var lab = document.createElement('b'); lab.textContent = dropAmt.n + '개'; r.appendChild(lab);
            btn('+', function () { dropAmt.n = Math.min(maxN, dropAmt.n + 1); renderInvDetail(); }, r);
            btn('반', function () { dropAmt.n = Math.max(1, Math.floor(maxN / 2)); renderInvDetail(); }, r);
            btn('최대', function () { dropAmt.n = maxN; renderInvDetail(); }, r);
          }
          btn('🫳 ' + dropAmt.n + '개 버리기', function () { var n = dropAmt.n; bagPick = null; dropAmt = { id: 0, n: 1 }; throwItem(id, n); $('invName').textContent = B[id][0] + ' ' + n + '개를 앞에 버렸어요 — 다시 가까이 가면 주워요'; renderInv(); }).classList.add('ddrop');
        }
      } else {
        add('div', 'dhint', '다른 단축 칸을 누르면 자리를 바꿔요');
        btn('단축 칸 비우기', function () { HOTBAR[p.i] = 0; bagPick = null; saveSettings(); renderHotbar(); setSel(sel, true); $('invName').textContent = '단축 칸을 비웠어요'; renderInv(); });
      }
      add('div', 'dhint', '📍 ' + howGet(id));
      return;
    }
    var it = invSel;
    if (!it) { add('div', 'dempty', '왼쪽 제작법 그림을 누르면 재료가 여기에 나와요'); if (craftCat === 'smelt') fuelLine(); return; }
    if (it.k === 'rep') {
      var tid = it.id, mat = REP_MAT_T(tid), mx = toolMax(tid), w = WEAR[tid], nw = Math.min(mx, w + Math.ceil(mx / 4)), okR = have(mat) >= 1;
      top(tid, toolName(tid) + ' 고치기', '힘 ' + w + ' → ' + nw + ' / ' + mx);
      add('div', 'dneed' + (okR ? '' : ' lack'), '<img src="' + ICON[mat] + '" alt=""><span>' + B[mat][0] + '</span><em>' + fmtN(have(mat)) + ' / 1</em>');
      btn('🔧 고치기', function () {
        if (have(mat) < 1) { $('invName').textContent = jo(B[mat][0], '이', '가') + ' 1개 있어야 고칠 수 있어요'; sfx('click'); return; }
        take(mat, 1); if (nw >= mx) delete WEAR[tid]; else WEAR[tid] = nw;
        sfx('craft'); $('invName').textContent = toolName(tid) + '을(를) 고쳤어요 (힘 ' + nw + '/' + mx + ')'; bagChanged();
      });
      return;
    }
    var rc = it.rc;
    if (it.k === 'lock') {
      var miss = recIds(rc).filter(function (id) { return !SEEN[id]; });
      add('div', 'dtop', '<span class="big lockd"><img src="' + ICON[rc.out[0]] + '" alt=""></span><span><b>🔒 아직 몰라요</b><small>' + recStage(rc) + '단계 제작법</small></span>');
      add('div', 'dhint', '이 재료를 처음 얻으면 열려요:');
      miss.forEach(function (id) { add('div', 'dneed lack', '<img src="' + ICON[id] + '" alt=""><span>' + B[id][0] + '<br><small>' + howGet(id) + '</small></span>'); });
      addRecipePin(det, rc);
      return;
    }
    top(rc.out[0], B[rc.out[0]][0] + (rc.out[1] > 1 ? ' ×' + rc.out[1] : ''), rc.ref || '');
    rc.need.forEach(function (n) {
      var r = add('div', 'dneed' + (have(n[0]) >= n[1] ? '' : ' lack'), '<img src="' + ICON[n[0]] + '" alt=""><span>' + B[n[0]][0] + '</span><em>' + fmtN(have(n[0])) + ' / ' + n[1] + '</em>');
      r.title = '누르면 얻는 곳';
      r.addEventListener('click', function () { $('invName').textContent = '「' + B[n[0]][0] + '」 ' + howGet(n[0]) + ' (지금 ' + fmtN(have(n[0])) + '개)'; sfx('click'); });
    });
    var req = '';
    if (rc.furnace) req += '<span class="dreq' + (furnaceOK() ? '' : ' lack') + '">🔥 용광로</span>';
    if (rc.fuel) req += '<span class="dreq' + (fuelLeft(rc) >= 1 ? '' : ' lack') + '">🪵 땔감</span>';
    if (rc.table) req += '<span class="dreq' + (tableOK() ? '' : ' lack') + '">🪚 제작대</span>';
    if (rc.station) req += '<span class="dreq">' + B[rc.station][0] + ' 가까이</span>';
    if (req) add('div', '', req);
    function craftN(times) {
      if (!canCraft(rc)) {
        sfx('click');
        if (rc.furnace && !furnaceOK()) $('invName').textContent = '녹이려면 용광로가 있어야 해요. 돌 8개로 만들어 가방에 넣거나 내 땅에 놓아요';
        else if (rc.fuel && fuelLeft(rc) < 1) $('invName').textContent = '땔감이 없어요. 석탄·숯·통나무를 모아요';
        else if (rc.station) $('invName').textContent = B[rc.station][0] + ' 가까이에서 만들어요';
        else if (rc.table && !tableOK()) $('invName').textContent = '이 물건은 제작대가 있어야 만들어요. 고페르 나무 4개로 제작대를 만들어 가방에 넣거나 내 땅에 놓아요';
        else $('invName').textContent = '재료가 모자라요 — 빨간 재료를 누르면 얻는 곳을 알려 줘요';
        return;
      }
      var made = 0;
      if (!rc.fuel && room(rc.out[0]) < rc.out[1]) { sfx('click'); $('invName').textContent = '🎒 가방이 가득 차서 만들 수 없어요. 안 쓰는 것을 버리거나 궤에 넣어요'; return; }
      while (made < times && canCraft(rc) && (rc.fuel || room(rc.out[0]) >= rc.out[1])) {
        if (rc.fuel && !burnOne(rc)) break;
        rc.need.forEach(function (n) { take(n[0], n[1]); });
        if (rc.fuel) queueSmelt(rc.out[0], rc.out[1]); else give(rc.out[0], rc.out[1]);
        made++;
        if (rc.out[0] === GOPHER) { stats.crafted++; questCheck(); }
        if (rc.out[0] === PITCH && STORY.started) { STORY.s.pitch += rc.out[1]; saveStory(); }
      }
      if (made) noteRecent(rc);
      sfx('craft'); $('invName').textContent = rc.fuel ? '용광로에 넣었어요 — ' + B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개가 하나에 ' + SMELT_SEC + '초씩 녹아요' : B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개를 만들었어요';
      bagChanged();
    }
    var ok = canCraft(rc), times = craftTimes(rc);
    var mk = btn(rc.fuel ? '🔥 녹이기' : '🔨 만들기', function () { craftN(1); }); mk.classList.add('dmake'); if (!ok) mk.classList.add('off');
    if (rc.fuel) btn('×8 한꺼번에', function () { craftN(8); });
    else if (ok && times >= 2 && !isAdm()) btn('모두 만들기 (×' + Math.min(times, 64) + ')', function () { craftN(Math.min(times, 64)); });
    if (rc.fuel) fuelLine();
    if (rc.cat === 'wear') add('div', 'dhint', '가죽은 소·염소·낙타를, 양털은 양을 칼을 들고 누르면 얻어요. 만든 옷은 「👤 내 모습」에서 입어요.');
    addRecipePin(det, rc);
  }
  function addRecipePin(row,recipe) {
    villageButton(row,'재료 표시',function(e){
      e.stopPropagation();
      var index=RECIPES.indexOf(recipe);
      if(index<0)return;
      villageBook.recipe={id:recipe.out[0],index:index};saveVillageBook();renderMaterialGuide();
      toast('마을 수첩에 '+nameOf(recipe.out[0])+' 재료를 표시했어요');
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
  var CHESTS = {}, curChest = null, chestAmt = 0;   // 옮기는 양: 0 모두 · 1 반 · 2 한 개
  var AMT_NAME = ['모두', '반', '1개'];
  function amtOf(total, half) { var m = half ? 1 : chestAmt; return m === 0 ? total : m === 1 ? Math.max(1, Math.ceil(total / 2)) : 1; }
  // 칸을 길게 누르거나(휴대폰) 오른쪽 클릭하면(컴퓨터) 반만
  var holdQuiet = 0;   // 길게 누른 뒤 칸이 다시 그려지면 손을 뗄 때 새 칸이 눌린 것으로 잡히므로 잠깐 무시
  function holdable(d, tap, hold) {
    var t = null, fired = false;
    function H() { fired = true; holdQuiet = performance.now() + 600; hold(); }
    d.addEventListener('pointerdown', function () { fired = false; clearTimeout(t); t = setTimeout(H, 450); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { d.addEventListener(ev, function () { clearTimeout(t); }); });
    d.addEventListener('contextmenu', function (e) { e.preventDefault(); clearTimeout(t); if (!fired && performance.now() > holdQuiet) H(); });
    d.addEventListener('click', function () { if (fired || performance.now() < holdQuiet) { fired = false; return; } tap(); });
  }
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
  function chestItemKeys(c) {
    var keys = Object.keys(c);
    if (S.chestSorted) keys.sort(function (a,b) { return nameOf(+a).localeCompare(nameOf(+b),'ko'); });
    return keys;
  }
  function withdrawChest() {
    var c = CHESTS[curChest], moved = 0;
    if (!c || isAdm()) return;
    chestItemKeys(c).forEach(function (id) {
      var n = give(+id, c[id]);
      c[id] -= n; moved += n;
      if (c[id] <= 0) delete c[id];
    });
    $('chestName').textContent = moved ? moved + '개를 가방으로 옮겼어요' : '가방에 빈 자리가 없거나 궤가 비어 있어요';
    if (moved) { bagChanged(); markDirty(); renderChest(); }
  }
  function renderChest() {
    var c = CHESTS[curChest] || {}, g1 = $('chestGrid'), g2 = $('chestBag'); g1.innerHTML = ''; g2.innerHTML = '';
    $('chestOne').textContent = '옮기는 양: ' + AMT_NAME[chestAmt];
    if (!$('chestName').textContent) $('chestName').textContent = '칸을 길게 누르면 반만 옮겨요';
    chestItemKeys(c).forEach(function (k) {
      var id = +k; if (!(c[id] > 0)) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, c[id]); d.title = B[id][0];
      function out(half) { var n = give(id, amtOf(c[id], half)); if (!n) { $('chestName').textContent = '🎒 가방이 가득 찼어요'; sfx('click'); return; } c[id] -= n; if (c[id] <= 0) delete c[id]; $('chestName').textContent = B[id][0] + ' ' + n + '개를 가방으로'; sfx('click'); markDirty(); bagChanged(); renderChest(); }
      holdable(d, function () { out(false); }, function () { out(true); });
      g1.appendChild(d);
    });
    if (!g1.children.length) g1.innerHTML = '<span class="empty">비어 있어요 — 아래 가방에서 눌러 넣어요</span>';
    function put(id, half) {
      if (have(id) < 1) return;
      if (isTool(id)) { $('chestName').textContent = '도구는 가방에 넣고 다녀요'; sfx('click'); return; }
      if (!c[id] && Object.keys(c).length >= 27) { $('chestName').textContent = '궤가 가득 찼어요(27가지)'; return; }
      var n = amtOf(have(id), half); take(id, n); c[id] = (c[id] || 0) + n; CHESTS[curChest] = c;
      $('chestName').textContent = B[id][0] + ' ' + n + '개를 궤에'; sfx('click'); markDirty(); bagChanged(); renderChest();
    }
    INV.forEach(function (id) {
      if (have(id) < 1) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, have(id)); d.title = B[id][0];
      holdable(d, function () { put(id); }, function () { put(id, true); });
      g2.appendChild(d);
    });
    if (!g2.children.length) g2.innerHTML = '<span class="empty">가방이 비어 있어요</span>';
    var g3 = $('chestHot'); if (g3) { g3.innerHTML = '';
      HOTBAR.forEach(function (id, i) {
        var d = document.createElement('button'); d.className = 'islot' + (i === sel ? ' on' : '') + (id ? '' : ' empty'); d.innerHTML = (id ? slotHTML(id, hotCount(id)) : '') + '<u class="num">' + (i + 1) + '</u>'; d.title = (i + 1) + '번 칸: ' + nameOf(id);
        holdable(d, function () { if (id) put(id); else sfx('click'); }, function () { if (id) put(id, true); });
        g3.appendChild(d);
      });
    }
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
      if (done > j.g) {
        var got2 = give(j.o, done - j.g);   // 가방이 차면 용광로에 남겨 두었다가 자리가 나면 꺼냄
        for (var k = 0; k < got2 && ui === 'play'; k++) pickup(j.o);
        j.g += got2; if (got2) changed = true; if (j.o === ING_FE) partyAdd('iron', got2); if (got2 < done - (j.g - got2)) bagFull();
      }
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
    // 넓힌 도감: 광석 · 보석 · 식물과 열매 · 성경 인물 · 밤하늘
    var more = 0, moreAll = 0;
    function slot(key, gotHtml, unkLabel, hint, onGot) {
      var got = !!DEX[key], d = document.createElement('button'); moreAll++; if (got) more++;
      d.className = 'dslot' + (got ? '' : ' unk'); d.innerHTML = got ? gotHtml : '<span class="em">?</span><small>' + unkLabel + '</small>';
      d.addEventListener('click', function () { if (got && onGot) { closePanel(); onGot(); } else $('invName').textContent = hint; });
      g.appendChild(d);
    }
    function head(t) { var h = document.createElement('div'); h.className = 'dhead'; h.textContent = t; h.style.cssText = 'grid-column:1/-1;flex-basis:100%;width:100%;margin:8px 0 2px;font-size:12px;opacity:.8'; g.appendChild(h); }
    head('⛏ 광석');
    dexOres().forEach(function (o) { slot('o' + o, '<img src="' + ICON[o] + '" alt=""><small>' + B[o][0] + '</small>', '광석', '땅속 깊이 곡괭이로 캐 보면 적혀요'); });
    head('💎 열두 보석(계 21:19-20)');
    dexGems().forEach(function (i) { var it = gemItem(i); slot('g' + i, '<img src="' + (ICON[it] || ICON[gemOre(i)]) + '" alt=""><small>' + GEMS[i][0] + '</small>', '보석', '지역마다 다른 깊이에 아주 드물게 있어요'); });
    head('🌿 식물과 열매');
    dexPlants().forEach(function (pId) { slot('p' + pId, '<img src="' + ICON[pId] + '" alt=""><small>' + B[pId][0] + '</small>', '식물', '들에서 캐거나 밭에서 거두면 적혀요'); });
    head('👤 방주의 사람들');
    DEX_PEOPLE.forEach(function (nm, i) {
      slot('n' + i, '<span class="em">👤</span><small>' + nm + '</small>', '사람', '방주 둘레와 방주 안에서 말을 걸어 보세요', function () { var n = NPCS.filter(function (x) { return x.d.name === nm; })[0]; if (n) showNpc(n); });
    });
    head('🌌 밤하늘');
    STAR_VERSES.forEach(function (v, i) { slot('s' + i, '<span class="em">' + v[0] + '</span><small>' + v[1] + '</small>', '별', '밤에 하늘을 한참 올려다보면 적혀요', function () { showVerseCard(v[0], v[1], v[3], v[2]); }); });
    $('dexCount').textContent += '  ·  넓힌 도감 ' + more + ' / ' + moreAll;
  }
  // 버튼 크기(11/20): 작게·보통·크게 — 오른쪽 버튼·단축 칸은 zoom(화면 모서리에서 떨어진 거리도 같이 커져 겹치지 않음), 방향키는 왼쪽 아래 기준 확대
  var BTN_SIZES = [['작게', 0.84], ['보통', 1], ['크게', 1.2]];
  function applyBtnSize() {
    var k = (BTN_SIZES[S.btnSize === undefined ? 1 : S.btnSize] || BTN_SIZES[1])[1];
    ['btnJump', 'btnDown', 'btnRide', 'btnFly', 'btnRun', 'btnSneak', 'touchAction', 'slabMode', 'hotbar'].forEach(function (id) { var el = $(id); if (el) el.style.zoom = k === 1 ? '' : String(k); });
    var dp = $('dpad'); if (dp) { dp.style.transformOrigin = 'left bottom'; dp.style.transform = k === 1 ? '' : 'scale(' + k + ')'; }
    fitBottomBar(k);
  }
  // 단축 칸·체력 줄이 방향키와 오른쪽 버튼 사이에 들어가게(작은 휴대폰 가로)
  function fitBottomBar(k) {
    var hb = $('hotbar'), vt = $('vitals'), dp = $('dpad'); if (!hb || !dp) return;
    k = k || +(hb.style.zoom || 1);
    if (!isTouch || innerWidth < innerHeight) { hb.style.maxWidth = ''; if (vt) vt.style.maxWidth = ''; return; }
    var r = dp.getBoundingClientRect(), avail = innerWidth - 2 * (r.right + 8);
    hb.style.maxWidth = Math.max(220, avail) / k + 'px'; if (vt) vt.style.maxWidth = Math.max(220, avail) + 'px';
  }
  window.addEventListener('resize', function () { setTimeout(function () { fitBottomBar(); }, 120); });
  // ── 건의하기(11/20): 불편한 점·바라는 점을 관리자에게(300자, 1분에 한 번·하루 10번) ──
  function fbBox(title) {
    var old = $('fbBox'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'fbBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:70;background:rgba(16,16,24,.96);border:2px solid #000;box-shadow:inset 0 0 0 2px #5a4a8a;padding:12px 14px;display:flex;flex-direction:column;gap:8px;width:min(520px,92vw);max-height:86vh;overflow:auto;color:#fff';
    var h = document.createElement('b'); h.textContent = title; h.style.cssText = 'font-size:16px;color:#ffe27a'; box.appendChild(h);
    document.body.appendChild(box); return box;
  }
  function fbBtn(parent, label, fn) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); parent.appendChild(b); return b; }
  function openFeedback() {
    var box = fbBox('📮 건의하기');
    var p = document.createElement('div'); p.textContent = '불편한 점, 고장 난 곳, 있었으면 하는 것을 적어 주세요. 전도사님께 바로 전해져요.'; p.style.fontSize = '13px'; box.appendChild(p);
    var ta = document.createElement('textarea'); ta.maxLength = 300; ta.rows = 4; ta.placeholder = '예: 수레가 비탈에서 멈춰요 / 낚시를 더 하고 싶어요'; ta.setAttribute('aria-label', '건의할 내용'); ta.style.cssText = 'font:inherit;font-size:14px;padding:6px;resize:vertical;width:100%;box-sizing:border-box'; box.appendChild(ta);
    var cnt = document.createElement('small'); cnt.textContent = '0 / 300'; box.appendChild(cnt);
    ta.addEventListener('input', function () { cnt.textContent = ta.value.length + ' / 300'; });
    var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end'; box.appendChild(row);
    fbBtn(row, '닫기', function () { box.remove(); });
    fbBtn(row, '보내기', function () {
      if (!client || !me || me.id === 'test') { toast('로그인하면 건의를 보낼 수 있어요'); return; }
      client.rpc('send_ark_feedback', { p_body: ta.value, p_x: Math.floor(P.x), p_z: Math.floor(P.z), p_ua: navigator.userAgent }).then(function (r) {
        var d = r && r.data || {}, why = { empty: '두 글자 이상 적어 주세요', long: '300자까지 쓸 수 있어요', slow: '1분 뒤에 다시 보내 주세요', many: '오늘은 10번까지 보낼 수 있어요', login: '로그인하면 보낼 수 있어요' }[d.error];
        if (why) return toast('📮 ' + why);
        box.remove(); toast('📮 고마워요! 건의를 보냈어요');
      }, function () { toast('📮 보내지 못했어요. 조금 뒤에 다시 해 주세요'); });
    });
    setTimeout(function () { ta.focus(); }, 50);
  }
  function openFeedbackAdmin(all) {
    if (!NET.admin || !client) return;
    var box = fbBox('📮 건의함' + (all ? ' (모두)' : ' (아직 안 본 것)'));
    var top = document.createElement('div'); top.style.cssText = 'display:flex;gap:8px'; box.appendChild(top);
    fbBtn(top, all ? '안 본 것만' : '모두 보기', function () { openFeedbackAdmin(!all); });
    fbBtn(top, '닫기', function () { box.remove(); });
    var list = document.createElement('div'); list.textContent = '불러오는 중…'; box.appendChild(list);
    client.rpc('list_ark_feedback', { p_all: !!all }).then(function (r) {
      list.textContent = ''; var rows = r && r.data || [];
      if (!rows.length) { list.textContent = '건의가 없어요'; return; }
      rows.forEach(function (f) {
        var it = document.createElement('div'); it.style.cssText = 'border-top:1px solid #444;padding:6px 0;font-size:13px' + (f.handled ? ';opacity:.5' : '');
        var head = document.createElement('div'); head.style.color = '#9fd0ff'; head.textContent = (f.nick || '?') + ' · ' + new Date(f.at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + (f.x !== null ? ' · 자리 ' + f.x + ',' + f.z : '');
        var txt = document.createElement('div'); txt.textContent = f.body; txt.style.whiteSpace = 'pre-wrap';
        it.append(head, txt);
        if (!f.handled) fbBtn(it, '본 것으로', function () { client.rpc('mark_ark_feedback', { p_id: f.id, p_handled: true }).then(function () { it.style.opacity = '.5'; }); });
        list.appendChild(it);
      });
    }, function () { list.textContent = '불러오지 못했어요'; });
  }
  function updateMenuLabels() {
    if ($('mNews') && NEWS) { var nl = newsLeft(); $('mNews').textContent = '✨ 새 기능' + (S.newsSeen !== NEWS_VER ? ' (새로 ' + NEWS.length + ')' : (nl ? ' · ' + (NEWS.length - nl) + '/' + NEWS.length : ' ✅')); }
    if ($('mBtnSize')) $('mBtnSize').textContent = '버튼 크기: ' + (BTN_SIZES[S.btnSize === undefined ? 1 : S.btnSize] || BTN_SIZES[1])[0];
    $('mLight').textContent = '가벼운 화면: ' + (S.lightMode ? '켬' : '끔');
    $('mLight').setAttribute('aria-pressed', String(!!S.lightMode));
    $('mMapVisible').textContent = '지도에 내 위치: ' + (S.mapVisible === false ? '숨김' : '표시');
    $('mView').textContent = '시점: ' + VIEW_NAMES[S.view];
    $('mSound').textContent = '소리: ' + (S.sound ? '켬' : '끔');
    $('mMusic').textContent = '음악: ' + (S.music === false ? '끔' : '켬');
    $('mShadow').textContent = '어둠의 그림자: ' + (S.shadows === false ? '안 나옴' : '나옴');
    $('mAutoJump').textContent = '자동 점프: ' + (S.autoJump === false ? '끔' : '켬');
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
    on('btnPause', function () { openPanel('pause'); renderGoal(); fetchGoal(true); sfx('click'); });
    on('btnView', cycleView);
    // 접고 펴기: 위쪽 버튼 줄 · 처음 안내 · 작은 지도(이 기기에 기억)
    function applyFold() {
      var f = S.fold || {};
      $('topRight').classList.toggle('fold', !!f.top); document.body.classList.toggle('topfold', !!f.top);
      $('btnFold').querySelector('span').textContent = f.top ? '◀' : '▶'; $('btnFold').querySelector('small').textContent = f.top ? '펴기' : '접기';
      document.body.classList.toggle('qfold', !!f.q);   // 안내를 접으면 상자는 숨기고 위쪽 줄의 📜 버튼만
      document.body.classList.toggle('mapfold', !!f.map);
      $('mapCap').innerHTML = f.map ? '🗺 지도 펴기' : '지도<b class="k">M</b>';
    }
    function toggleFold(k) { S.fold = S.fold || {}; S.fold[k] = !S.fold[k]; saveSettings(); applyFold(); sfx('click'); }
    on('btnFold', function () { toggleFold('top'); });
    on('qFold', function () { toggleFold('q'); });
    on('qMini', function () { toggleFold('q'); });
    on('bagSort', function () {   // 블록 → 모양 → 재료 → 도구 순, 같은 종류는 번호 순
      var ids = BAGSLOT.filter(function (v) { return v; }), rank = function (id) { return isTool(id) ? 3 : (isItem(id) ? 2 : (isShape(id) ? 1 : 0)); };
      ids.sort(function (a, b) { return rank(a) - rank(b) || a - b; });
      for (var i = 0; i < BAGSLOT.length; i++) BAGSLOT[i] = ids[i] || 0;
      saveSettings(); bagPick = null; renderInv(); sfx('click'); $('invName').textContent = '가방을 정리했어요';
    });
    on('mTour', function () { startTour(); });
    on('chatWave', function () { closePanel(); waveHand(); });
    if (FESTIVE) { var adv = document.createElement('button'); adv.id = 'mAdvent'; adv.className = 'mc'; adv.textContent = '🕯 대림절 말씀 달력'; var grid0 = document.querySelector('#pause .grid3'), last = grid0 && grid0.querySelector('a'); if (grid0) grid0.insertBefore(adv, last); on('mAdvent', function () { window.open('advent.html', '_blank'); }); }
    // 게임 메뉴: 버튼을 묶음 탭(게임·이동·함께·설정)으로 — 돌아가기·나가기는 늘 보임
    (function () {
      var grid = document.querySelector('#pause .grid3'); if (!grid) return;
      var G = { game: ['mNews', 'mQuest', 'mFeedback', 'mBook', 'mStory', 'mVillageWork', 'mPhoto', 'mLook', 'mMap', 'mTour', 'mTutorial', 'mPractice', 'mHelp'], go: ['mArk', 'mHome', 'mForest', 'mHill', 'mLake'],
        together: ['goalCard', 'mParty', 'mFriends', 'mVisit', 'mRevert', 'mWatch', 'mFeedbackAdmin'], settings: ['mLight', 'mBtnSize', 'mView', 'mSound', 'mMusic', 'mShadow', 'mAutoJump', 'mMapVisible', 'mAim'] };
      var NAMES = { game: '🎮 게임', go: '🧭 이동', together: '🤝 함께', settings: '⚙ 설정' };
      Object.keys(G).forEach(function (g) { G[g].forEach(function (id) { var el = $(id); if (el) el.setAttribute('data-g', g); }); });
      var sl = grid.querySelector('.slider'); if (sl) sl.setAttribute('data-g', 'settings');
      Array.prototype.forEach.call(grid.children, function (el) { if (!el.hasAttribute('data-g') && el.id !== 'mResume' && el.tagName !== 'A') el.setAttribute('data-g', 'game'); });
      var tabs = document.createElement('div'); tabs.id = 'pauseTabs';
      function pick(g) {
        S.pauseTab = g; Array.prototype.forEach.call(grid.children, function (el) { el.classList.toggle('gon', el.getAttribute('data-g') === g); });
        Array.prototype.forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.getAttribute('data-g') === g); });
      }
      Object.keys(NAMES).forEach(function (g) {
        var b = document.createElement('button'); b.className = 'tab'; b.setAttribute('data-g', g); b.textContent = NAMES[g];
        b.addEventListener('click', function (e) { e.stopPropagation(); pick(g); saveSettings(); sfx('click'); }); tabs.appendChild(b);
      });
      grid.parentNode.insertBefore(tabs, grid); pick(G[S.pauseTab] ? S.pauseTab : 'game');
    })();
    on('mapCap', function () { toggleFold('map'); });
    on('btnRotate', rotateScreen);
    applyFold();
    on('restUp', function () { if (cartRide) leaveCart(); else standFromFurniture(); });
    on('forestCancel', cancelForestRoute);
    on('go_frontier', function(){ startFrontierGuide(FRONTIER_ENTRY,'자유 개척지'); });
    on('go_cave', function(){ startFrontierGuide(FRONTIER_CAVE[0],'바위굴 입구'); });
    on('buildRotate', rotateBuild);
    on('buildUndo', undoBuild);
    on('frontierDeposit',function(){changeFrontierStock(true);});
    on('frontierTake',function(){changeFrontierStock(false);});
    on('frontierChestDone',closePanel);
    on('btnBag', function () { openPanel('inv'); sfx('click'); });
    on('btnChat', openChat);
    on('chatSend', sendChat);
    on('chatDone', function () { $('chatInput').blur(); closePanel(); });
    $('chatInput').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendChat(); } });
    on('mResume', resume);
    on('mBook', function () { openPanel('book'); sfx('click'); });
    on('mHelp', function () { openPanel('help'); sfx('click'); });
    on('mArk', function () { travel('ark'); });
    on('mFriends', openFriends);
    on('friendsDone', closePanel);
    on('friendsSend', function () { friendRequest($('friendsNick').value); });
    $('friendsNick').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); friendRequest(this.value); }
    });
    on('qSkip', function () { if (tutorialStep < 9) finishTutorial(false); });
    on('mTutorial', function () {
      tutorialStep = 0; tutorialWalk = tutorialLook = false; tutorialDoor = null;
      tutorialSave(); resume();
    });
    on('mPractice', openPractice);
    on('mVillageWork', function () { openVillageWork('build'); });
    on('villageDone', function () { closePanel(); });
    on('mapPinNow', function () {
      var field=$('mapPinLabel'), name=field.value.trim();
      if(addVillagePin(name||placeName(),P.x,P.z)) {field.value='';drawMap($('bigmapc'),true);}
    });
    on('mapPinRemove', function () {
      if (!villageBook.target) return;
      villageBook.pins = villageBook.pins.filter(function (pin) { return pin.id !== villageBook.target; });
      villageBook.target = ''; saveVillageBook(); renderPins();
    });
    $('mapPins').addEventListener('change', function () { villageBook.target = this.value; saveVillageBook(); renderPins(); });
    on('chestSort', function () {
      var items = BAGSLOT.filter(Boolean);
      items.sort(function (a,b) { return nameOf(a).localeCompare(nameOf(b),'ko'); });
      BAGSLOT = items; S.chestSorted = true; saveSettings(); renderChest();
    });
    on('chestTakeAll', function () { withdrawChest(); });
    on('practiceDoor', function () { practiceStep = 1; renderPractice(); });
    on('practiceWalk', function () { practiceStep = 2; renderPractice(); });
    on('practiceHalf', function () { practiceUpper = !practiceUpper; renderPractice(); });
    on('practiceTile', function () { practiceHalves |= practiceUpper ? 2 : 1; if (practiceHalves === 3) practiceStep = 3; renderPractice(); });
    on('practiceMap', function () { practiceStep = 4; renderPractice(); });
    on('practiceSkip', finishPractice);
    on('practiceDone', finishPractice);
    on('mLight', function () { S.lightMode = !S.lightMode; if (!S.lightMode && S.autoLit) S.autoLight = false; S.autoLit = false; applyLightMode(); saveSettings(); updateMenuLabels(); });   // 자동으로 켠 것을 사람이 끄면 다시 자동으로 켜지 않음
    on('mBtnSize', function () { S.btnSize = ((S.btnSize === undefined ? 1 : S.btnSize) + 1) % 3; applyBtnSize(); saveSettings(); updateMenuLabels(); sfx('click'); newsMark('btn'); });
    on('mNews', function () { openVillageWork('news'); });
    on('mFeedback', function () { openFeedback(); });
    on('mQuest', function () { openQuests(); });
    on('advChip', function () { openQuests('today'); });
    on('mFeedbackAdmin', function () { openFeedbackAdmin(); });
    applyBtnSize();
    on('touchAction', function () { if (isTouch && ui === 'play' && HOTBAR[sel] !== BOW) { tapAt(); mobileHudAt = 0; } });
    (function () { var ta = $('touchAction'); if (!ta) return;
      ta.addEventListener('pointerdown', function () { if (ui === 'play' && HOTBAR[sel] === BOW) bowStart(); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { ta.addEventListener(ev, function (e) { if (bowDraw) { if (e.type === 'pointerup') bowRelease(screenDir()); else bowCancel(); } }); }); })();
    on('slabMode', function () {
      slabMode = (slabMode + 1) % SLAB_NAMES.length;
      $('slabMode').textContent = '반 블록: ' + SLAB_NAMES[slabMode];
      mobileHudAt = 0;
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitMobileKeyboard);
    }
    on('mHome', function () { resume(); goHome(); });
    on('mForest', function () { travel('forest'); });
    on('mHill', function () { travel('hill'); });
    on('mLake', function () { travel('lake'); });
    on('mView', function () { S.view = (S.view + 1) % 3; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mPhoto', function () { savePhoto(); });
    on('mSound', function () { S.sound = !S.sound; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mAim', function () { S.aim = S.aim === 'cross' ? 'finger' : 'cross'; saveSettings(); updateMenuLabels(); sfx('click'); });
    $('mSens').addEventListener('input', function () { S.sens = +this.value / 100; saveSettings(); updateMenuLabels(); });
    on('bookDone', function () { closePanel(); });
    on('helpDone', function () { closePanel(); });
    on('invDone', function () { closePanel(); });
    on('chestDone', function () { closePanel(); });
    on('chestOne', function () { chestAmt = (chestAmt + 1) % 3; renderChest(); sfx('click'); });
    on('tabBag', function () { invTab = lastBC; renderInv(); sfx('click'); });
    on('tabDex', function () { invTab = 'dex'; renderInv(); sfx('click'); });
    $('craftQ').addEventListener('input', function () { craftQuery = this.value.trim(); invSel = null; renderInv(); });
    $('craftStage').addEventListener('click', function () { $('invName').textContent = this.title + ' · 재료를 처음 얻으면 그 재료로 만드는 법이 열려요'; sfx('click'); });
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
    on('mMapVisible', function () { S.mapVisible = S.mapVisible === false; NET.sentKey = ''; saveSettings(); updateMenuLabels(); });
    $('bigmapc').addEventListener('click', selectMapPerson);
    on('mapFriend', function () {
      var nick = NET.names[selectedMapPeer]; if (nick && canRequestMapFriend(selectedMapPeer)) friendRequest(nick);
    });
    on('mMap', function () { openPanel('map'); drawMap($('bigmapc'), true); sfx('click'); });
    ['ark', 'forest', 'hill', 'lake'].forEach(function (w) { on('go_' + w, function () { travel(w); }); });
    on('go_home', function () { resume(); goHome(); });
    ['sea', 'desert', 'ararat', 'commons'].forEach(function (w) { var b = $('go_' + w); if (b) on('go_' + w, function () { travel(w); }); });
    on('mMusic', function () { S.music = S.music === false; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mRevert', adminRevertCommons);
    on('mWatch', openAdminWatch);
    on('mStory', openStory); on('mParty', openParty); on('partyDone', function () { closePanel(); }); on('storyDone', function () { closePanel(); }); on('storyStart', function () { closePanel(); startStory(); });
    on('endingDone', function () { closePanel(); toast('🏙 본향에 이르렀어요 — 성 안을 거닐어 보세요'); });
    on('mAutoJump', function () { S.autoJump = S.autoJump === false; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('go_visit', openVisit); on('mVisit', openVisit);
    on('visitDone', function () { closePanel(); });
    $('visitShow').addEventListener('change', saveShowcase); $('visitIntro').addEventListener('change', saveShowcase);
    on('mShadow', function () { S.shadows = S.shadows === false; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('tabAch', function () { invTab = 'ach'; renderInv(); sfx('click'); });
    var bs = $('btnSneak');
    bs.addEventListener('touchstart', function (e) { sneakLock = !sneakLock; e.preventDefault(); }, { passive: false });
    bs.addEventListener('click', function () { sneakLock = !sneakLock; });
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
  function dexFromString(str) { (str || '').split(',').forEach(function (k) { if (/^(c[a-z]+|[mopgns]\d+)$/.test(k)) DEX[k] = 1; }); }
  function dexCount() { var n = 0; CREATURE_KEYS.forEach(function (k) { if (DEX['c' + k]) n++; }); DEX_MATS.forEach(function (m) { if (DEX['m' + m]) n++; }); return n; }
  // 넓힌 도감(달란트 보상과는 별개): o광석 · g보석 · p식물/열매 · n성경 인물 · s밤하늘
  var STAR_VERSES = [['🌌', '뭇별', '창세기 15:5', '그를 이끌고 밖으로 나가 이르시되 하늘을 우러러 뭇별을 셀 수 있나 보라 또 그에게 이르시되 네 자손이 이와 같으리라'],
    ['✨', '별들의 이름', '시편 147:4', '그가 별들의 수효를 세시고 그것들을 다 이름대로 부르시는도다'],
    ['⭐', '북두성과 삼성과 묘성', '욥기 9:9', '북두성과 삼성과 묘성과 남방의 밀실을 만드셨으며'],
    ['🔭', '만상', '이사야 40:26', '너희는 눈을 높이 들어 누가 이 모든 것을 창조하였나 보라 주께서는 수효대로 만상을 이끌어 내시고 그들의 모든 이름을 부르시나니 그의 권세가 크고 그의 능력이 강하므로 하나도 빠짐이 없느니라']];
  var DEX_PEOPLE = ['노아', '셈', '함', '야벳', '노아의 아내'];
  function dexOres() { return [ORE_COAL, ORE_CU, ORE_FE, ORE_AG, ORE_AU, ORE_ONYX, ORE_SAPH, ORE_DIA]; }
  function dexGems() { var a = []; GEMS.forEach(function (g, i) { if (g) a.push(i); }); return a; }
  function dexPlants() { var a = [LILY, THORN, THISTLE]; Object.keys(FARM_SEEDS).forEach(function (k) { var h = FARM_SEEDS[k].harvest; if (a.indexOf(h) < 0) a.push(h); }); return a; }
  function dexMore(key, label) { if (DEX[key]) return; DEX[key] = 1; saveDex(); toast('📖 도감에 「' + label + '」을(를) 적었어요'); }
  function dexMined(old) {
    var base = old; for (var k in DEEPV) if (DEEPV[k] === old) base = +k;
    if (dexOres().indexOf(base) >= 0) dexMore('o' + base, B[base][0]);
    for (var gi = 0; gi < 12; gi++) if (GEMS[gi] && base === gemOre(gi)) dexMore('g' + gi, GEMS[gi][0]);
    if (old === LILY || old === THORN || old === THISTLE) dexMore('p' + old, B[old][0]);
  }
  function showStarVerse(n) {
    if (FESTIVE && Math.abs(P.x - (NAT_X + 5)) < 60 && Math.abs(P.z - (NAT_Z + 4)) < 60) { showVerseCard('🌟', '베들레헴의 별', '박사들이 왕의 말을 듣고 갈새 동방에서 보던 그 별이 문득 앞서 인도하여 가다가 아기 있는 곳 위에 머물러 서 있는지라', '마태복음 2:9'); return; }
    var i = n % STAR_VERSES.length, v = STAR_VERSES[i], first = !DEX['s' + i];
    showVerseCard(v[0], v[1], v[3], v[2], first ? '📖 도감 「밤하늘」에 새로 적었어요' : '');
    if (first) { DEX['s' + i] = 1; saveDex(); }
  }
  function saveDex() {
    if (dexCount() === CREATURE_KEYS.length + DEX_MATS.length && !DEX.done) { DEX.done = 1; unlock('dex'); toast('📖 도감을 다 채웠어요! 하나님이 지으신 모든 것을 만났어요'); }
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
    stats.tapped++; tutorialEvent('animal'); questCheck();
  }
  // 화면의 한 점에서 나가는 광선에 맞는 동물(블록보다 가까울 때만)
  var CR_R = { peer: 1.6, npc: 1.8, shadow: 1.6, sheep: 1.3, goat: 1.2, cow: 1.7, camel: 2.3, rabbit: 0.8, dove: 1.1, raven: 1.1, fish: 0.8, horse: 2.1, donkey: 1.7 };
  function pickCreature(dir, blockT) {
    var o = camera.position, best = null, bt = blockT === undefined ? 1e9 : blockT;
    function test(kindC, cx, cy, cz, maxT, obj) {
      var r = CR_R[kindC], ox = cx - o.x, oy = cy - o.y, oz = cz - o.z, tca = ox * dir.x + oy * dir.y + oz * dir.z;
      if (tca < 0) return;
      var d2 = ox * ox + oy * oy + oz * oz - tca * tca; if (d2 > r * r) return;
      var t = tca - Math.sqrt(r * r - d2);
      if (t < bt && t < maxT && (!best || t < best.t)) best = { kind: kindC, t: t, a: obj };
    }
    var reach = REACH + camDist + 3;
    animals.forEach(function (a) { if (a.mesh.visible && a !== riding) test(a.kind, a.x, a.y + CR_R[a.kind] * 0.9, a.z, reach, a); });
    birds.forEach(function (b) { test(b.kind, b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 60); });
    fishes.forEach(function (f) { if (f.mesh.visible) test('fish', f.x, f.y, f.z, reach); });
    NPCS.forEach(function (n) { var b0 = best; test('npc', n.x, n.y + 1.7, n.z, reach); if (best !== b0 && best && best.kind === 'npc') best.npc = n; });
    for (var pu in NET.peers) { var pp = NET.peers[pu]; if (!pp || !pp.av) continue; var b2 = best; test('peer', pp.x, pp.y + 1.7, pp.z, reach); if (best !== b2 && best && best.kind === 'peer') best.peer = pp; }
    SHADOWS.forEach(function (s) { if (s.dead) return; var b0 = best; test('shadow', s.x, s.y + 1.7 * s.sp.h, s.z, REACH + camDist + 1); if (best !== b0 && best && best.kind === 'shadow') best.shadow = s; });
    return best;
  }
  function screenDir(sx, sy) {
    camera.updateMatrixWorld();
    if (sx === undefined || S.aim === 'cross') { camera.getWorldDirection(tmpV); return tmpV.clone(); }
    return new THREE.Vector3(sx / window.innerWidth * 2 - 1, -(sy / window.innerHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
  }
  var slabMode = 0, slabGhost, mobileHudAt = 0;
  var SLAB_NAMES = ['자동', '아래쪽', '위쪽'];
  // 겨눈 칸이 같은 재료 반 블록이고, 누른 면이 그 반 블록의 비어 있는 반쪽 쪽이면 합칠 수 있다
  function slabMergeTarget(id, h) {
    if (!SLAB_TOP[id] || !h) return false;
    var cur = get(h.x, h.y, h.z), side = h.py === h.y, half = h.atY - h.y >= 0.5;
    if (cur === id) return h.py > h.y || (side && half);                 // 아래 반 블록: 윗면이나 옆면 윗반쪽
    if (cur === SLAB_TOP[id]) return h.py < h.y || (side && !half);      // 위 반 블록: 아랫면이나 옆면 아랫반쪽
    return false;
  }
  function slabPlacement(id, h) {
    if (isTouch && slabMode) return slabMode === 2 ? SLAB_TOP[id] : id;
    return h.py < h.y || (h.py === h.y && h.atY - h.py >= 0.5) ? SLAB_TOP[id] : id;
  }
  function blockActionLabel(h, held) {
    var id = get(h.x, h.y, h.z), shape = SHAPE[id];
    var frontierAction=frontierActionLabel(id,h); if(frontierAction) return frontierAction;
    if (shape && (shape.type === 'door' || shape.type === 'gate' || shape.type === 'trapdoor')) return shape.open ? '문 닫기' : '문 열기';
    if (shape && shape.type === 'mrail' && (held === CART || parkedAt(h.x, h.y, h.z))) return '수레 타기';
    if (shape && shape.type === 'frame') return myPlot >= 0 && plotAt(h.x, h.z) === myPlot ? '액자' : '';
    if (id>=FIND_MARK && id<=FIND_SEED) return id===FIND_MARK?'살펴보기':'전시 보기';
    if (id===FERRY_POST) return '나룻배 타기';
    if (id===FEAST_TABLE) return '음식 놓기';
    if (id === WELL) return held === BUCKET || held === WATER_JAR ? '물 긷기' : '우물 쓰기';
    if (id === ALTAR) return '기도하기';
    if (id === WORD_SHELF) return '말씀 읽기';
    if (id === BED) return '눕기';
    if (shape && shape.type === 'chair') return '앉기';
    if (id === CHEST) return '궤 열기';
    if (id === CRAFT || id === FURNACE || id === FURNACE_ON ||
        (STATION_BITS[id] && !FARM_SEEDS[held])) return '만들기';
    if (id === LEVER || id === LEVER + 1 || id === LAMPSTAND || id === LAMPSTAND + 1 ||
        id === SOCKET || id === PEARL) return '사용';
    if (shape && shape.type === 'sign' && myPlot >= 0 && plotAt(h.x, h.z) === myPlot) return '표지판 고치기';
    return '';
  }
  function mobileTarget() {
    var held = HOTBAR[sel], h = pickCenter(), label = '';
    if (held === FISH_ROD || held === FISH_NET) return { label: '낚시' };
    if (have(held)) {
      if (held === WORD_SCROLL) return { label: '말씀 읽기' };
      if (held === HAND_MAP) return { label: '지도 열기' };
      if (held === COMPASS) return { label: '방향 보기' };
      if (held === SHOFAR) return { label: '나팔 불기' };
      if (held === SLING) return { label: '물매 연습' };
      if (held === BOW) return { label: '꾹 눌러 활 당기기' };
    }
    var c = pickCreature(screenDir(), blockCover(h));
    if (c && !(riding && c.a && c.a.sp.seat)) {
      return { label: c.peer ? '두 번: 친구' : c.npc ? '말 걸기' : (c.shadow ? '막기' : (c.a && c.a.sp.seat ? '타기' : '동물 누르기')) };
    }
    if (h) label = blockActionLabel(h, held);
    if (label) return { label: label };
    if (WEARINFO[held]) return { label: '입기' };
    if (!h || !have(held)) return { label: '' };
    if (FOODS[held]) return { label: '먹기' };
    if (held === WATER_BUCKET || held === FULL_JAR) return { label: '물 붓기' };
    if (held === HOE) return { label: '밭 갈기' };
    if (held === SEED || FARM_SEEDS[held]) return { label: '심기' };
    if (held === STRIKER) return { label: '불붙이기' };
    if (isItem(held)) return { label: '' };
    return { label: '놓기', hit: h };
  }
  function updateMobileBuild(now) {
    var action = $('touchAction'), toggle = $('slabMode');
    if (!isTouch || ui !== 'play' || furnitureRest) {
      if (!action.hidden) action.hidden = true;
      if (!toggle.hidden) toggle.hidden = true;
      slabGhost.visible = false;
      return;
    }
    var held = HOTBAR[sel], slab = SLAB_TOP[held] && have(held);
    if (now < mobileHudAt) return;
    mobileHudAt = now + (slab ? 50 : 100);
    var target = mobileTarget(), h = target.hit;
    action.hidden = !target.label;
    if (action.textContent !== target.label) action.textContent = target.label;
    toggle.hidden = !slab;
    if (!slab || !h) { slabGhost.visible = false; return; }
    var merge = slabMergeTarget(held, h), id = slabPlacement(held, h), valid = merge ? !canPlace(h.x, h.y, h.z, held) : !canPlace(h.px, h.py, h.pz, held);
    if (merge) slabGhost.position.set(h.x + .5, h.y + (get(h.x, h.y, h.z) === held ? .75 : .25), h.z + .5);
    else slabGhost.position.set(h.px + .5, h.py + (id === held ? .25 : .75), h.pz + .5);
    slabGhost.material.color.setHex(valid ? 0x91edb3 : 0xff806d);
    slabGhost.visible = true;
  }
  // 톡/오른쪽 클릭: 동물이 먼저, 아니면 블록 놓기(문이면 열고 닫기)
  // 다른 사람 캐릭터: 한 번 누르면 이름, 두 번 누르면 친구·파티 메뉴
  var peerTap = { u: null, t: 0 }, hintT0 = 0;
  function tapPeer(p) {
    var u = p.u, nm = (NET.names && NET.names[u]) || '나그네', now = performance.now();
    if (peerTap.u === u && now - peerTap.t < 600) { peerTap.u = null; openPeerMenu(u, nm); return; }
    peerTap = { u: u, t: now }; toast('👤 ' + nm + ' — 한 번 더 누르면 친구·파티 메뉴');
  }
  function openPeerMenu(u, nm) {
    var old = $('peerMenu'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'peerMenu';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.94);border:2px solid #000;box-shadow:inset 0 0 0 2px #5a4a8a;padding:12px 14px;display:flex;flex-direction:column;gap:8px;min-width:210px;color:#fff;font-size:15px;text-align:center';
    var h = document.createElement('b'); h.textContent = '👤 ' + nm; box.appendChild(h);
    function add(label, fn, off) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.disabled = !!off; b.addEventListener('click', function (e) { e.stopPropagation(); box.remove(); if (fn) fn(); }); box.appendChild(b); }
    var isFriend = !!(FRIENDS.accepted && FRIENDS.accepted.has(u));
    if (!me || !NET.ok) add('로그인하면 친구·파티를 할 수 있어요', null, true);
    else {
      if (isFriend) add('✓ 이미 친구예요', null, true);
      else if (FRIENDS.hidden && FRIENDS.hidden.has(u)) add('친구 신청을 보낼 수 없어요', null, true);
      else add('🤝 친구 신청', function () { friendRequest(nm); });
      if (partyMate(u)) add('✓ 같은 파티예요', null, true);
      else add('🧭 파티 초대', function () { partyCall('party_invite', { p_to: u }, '🤝 초대를 보냈어요 (10분 안에 받아야 해요)'); });
      if (isFriend) add('🎁 선물 보내기', function () { openVillageWork('gifts'); fetchGifts(true); });
      if (!FRIENDS.ready) friendsFetch();
    }
    add('닫기');
    document.body.appendChild(box); sfx('pop');
  }
  var waveUntil = 0;
  function waveHand() { waveUntil = performance.now() + 2000; sfx('pop'); if (S.view === 0) toast('👋 손을 흔들었어요 — 다른 사람에게 보여요'); }
  // ── 마을 사람 할 일(모두 선택): 상인 물물 교환, 농부 씨앗, 어부 낚싯대, 오병이어(요 6장) ──
  var TRADES = [[[LOG, 16], [ING_AG, 1]], [[STONE, 32], [ING_AG, 1]], [[WOOL, 4], [THREAD, 6]], [[ING_AG, 1], [POMEGRANATE, 3]], [[ING_AG, 1], [610, 1]], [[ING_AG, 2], [OLIVE_OIL, 2]]];
  // ── 노아의 부탁(창 6~9장): 다섯 가지를 마치면 창 9:1 복과 함께 남쪽 개척 땅을 맡을 수 있다(서버: 2026-11-19-ark-noah-quest.sql)
  // 노아는 지어낸 말을 하지 않는다 — 부탁은 게임 안내문으로, 말은 성경 구절로만
  var NOAH = { step: 0, rainbow: 0, done: 0 };
  try { var noahLs = JSON.parse(localStorage.getItem('arkVillage.noah') || 'null'); if (noahLs && typeof noahLs.step === 'number') NOAH = noahLs; } catch (e) {}
  function noahSave() { try { localStorage.setItem('arkVillage.noah', JSON.stringify(NOAH)); } catch (e) {} stateDirty(); }
  function noahPairs() { return CREATURE_KEYS.filter(function (k) { return DEX['c' + k]; }).length; }
  var NOAH_STEPS = [
    { e: '🪵', t: '고페르 나무 10개를 가져다 드리기', v: '너는 고페르 나무로 너를 위하여 방주를 만들되 그 안에 칸들을 막고 역청을 그 안팎에 칠하라', r: '창세기 6:14', prog: function () { return Math.min(10, have(GOPHER)) + '/10'; }, ok: function () { return have(GOPHER) >= 10; }, give: function () { take(GOPHER, 10); }, go: ['숲으로', function () { travel('forest'); }] },
    { e: '⚫', t: '역청 3개를 가져다 드리기 — 남쪽 호수 동쪽 역청 구덩이에서 삽으로 캐요', v: '너는 고페르 나무로 너를 위하여 방주를 만들되 그 안에 칸들을 막고 역청을 그 안팎에 칠하라', r: '창세기 6:14', prog: function () { return Math.min(3, have(TAR)) + '/3'; }, ok: function () { return have(TAR) >= 3; }, give: function () { take(TAR, 3); }, go: ['호수로', function () { travel('lake'); }] },
    { e: '🌾', t: '먹을 양식 가져다 드리기 — 밀 5개 또는 빵 2개', v: '너는 먹을 모든 양식을 네게로 가져다가 저축하라 이것이 너와 그들의 먹을 것이 되리라', r: '창세기 6:21', prog: function () { return '밀 ' + Math.min(5, have(WHEAT)) + '/5 · 빵 ' + Math.min(2, have(BREAD)) + '/2'; }, ok: function () { return have(WHEAT) >= 5 || have(BREAD) >= 2; }, give: function () { if (have(WHEAT) >= 5) take(WHEAT, 5); else take(BREAD, 2); } },
    { e: '🐑', t: '여러 동물을 눌러 말씀 카드 보기 — 다섯 종류', v: '혈육 있는 모든 생물을 너는 각기 암수 한 쌍씩 방주로 이끌어들여 너와 함께 생명을 보존하게 하되', r: '창세기 6:19', prog: function () { return Math.min(5, noahPairs()) + '/5'; }, ok: function () { return noahPairs() >= 5; }, give: null },
    { e: '🌈', t: '낮에 비가 그친 뒤 하늘의 무지개 보기 — 곧 비가 와요', v: '내가 내 무지개를 구름 속에 두었나니 이것이 나와 세상 사이의 언약의 증거니라', r: '창세기 9:13', prog: function () { return NOAH.rainbow ? '봤어요' : '아직'; }, ok: function () { return !!NOAH.rainbow; }, give: null }
  ];
  function noahWantsRain() { return started && !NOAH.done && NOAH.step === 4 && !NOAH.rainbow; }
  function noahSawRainbow() { if (noahWantsRain()) { NOAH.rainbow = 1; noahSave(); toast('🌈 무지개를 봤어요 — 방주 앞 노아에게 가요'); } }
  function noahFinish() {
    NOAH.done = 1; noahSave(); unlock('noah');
    if (client && me) client.rpc('finish_ark_noah').then(function () { fetchFrontier(true); }, function () {});
    showVerseCard('🌈', '하나님이 복을 주셨어요', '하나님이 노아와 그 아들들에게 복을 주시며 그들에게 이르시되 생육하고 번성하여 땅에 충만하라', '창세기 9:1', '노아의 부탁을 다 마쳤어요 — 이제 남쪽 개척 땅을 맡을 수 있어요 (메뉴 → 마을 수첩 → 개척 땅)');
  }
  function openNoah() {
    var old = $('noahBox'); if (old) old.remove();
    $('card').classList.remove('show');   // 노아를 누르면 뜨는 구절 카드 대신 부탁 상자(구절이 들어 있음)
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'noahBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.95);border:2px solid #000;box-shadow:inset 0 0 0 2px #c8a860;padding:12px 14px;color:#fff;font-size:14px;width:min(380px,92vw);max-height:86vh;overflow:auto';
    function add(tag, text, css) { var el = document.createElement(tag); el.textContent = text; el.style.cssText = css || ''; box.appendChild(el); return el; }
    function btn(label, fn, dis) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.disabled = !!dis; b.style.cssText = 'display:block;width:100%;margin-top:6px;white-space:normal;height:auto;min-height:38px'; b.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); box.appendChild(b); return b; }
    if (NOAH.done) {
      add('b', '🕊 노아의 부탁 — 다 마쳤어요', 'display:block;font-size:16px;color:#ffe27a;margin-bottom:6px');
      add('p', '「하나님이 노아와 그 아들들에게 복을 주시며 그들에게 이르시되 생육하고 번성하여 땅에 충만하라」 (창세기 9:1)', 'margin:0 0 8px;font-size:13px;opacity:.9');
      add('div', '남쪽 개척 땅을 맡아 넓혀 가요. 친구와 함께 짓고 창고도 함께 쓸 수 있어요.', 'font-size:13px');
      btn('🗺 개척 땅 보기(마을 수첩)', function () { box.remove(); openVillageWork('frontier'); });
    } else {
      var s = NOAH_STEPS[NOAH.step], ready = s.ok() || isAdm();
      add('b', '🕊 노아의 부탁 ' + (NOAH.step + 1) + '/5', 'display:block;font-size:16px;color:#ffe27a;margin-bottom:4px');
      add('p', '「' + s.v + '」 (' + s.r + ')', 'margin:0 0 8px;font-size:12px;opacity:.85');
      add('div', s.e + ' ' + s.t, 'font-size:14px;margin-bottom:4px');
      add('div', '지금: ' + s.prog(), 'font-size:13px;color:#bfe0a0');
      if (NOAH.step === 4 && !NOAH.rainbow) rainTimer = Math.min(rainTimer, 20);   // 무지개 부탁을 들으면 곧 비가 온다
      btn(s.give ? '가져다 드리기' : '마쳤어요', function () {
        if (!(s.ok() || isAdm())) return;
        if (s.give && !isAdm()) s.give();
        bagChanged(); sfx('craft');
        NOAH.step++; noahSave(); box.remove();
        if (NOAH.step >= NOAH_STEPS.length) noahFinish();
        else { toast('🕊 다음 부탁: ' + NOAH_STEPS[NOAH.step].t); openNoah(); }
      }, !ready);
      if (s.go) btn('🧭 ' + s.go[0], function () { box.remove(); s.go[1](); });
      add('div', '다 마치면 남쪽 개척 땅을 맡을 수 있어요 (창 9:1)', 'font-size:12px;opacity:.7;margin-top:8px');
    }
    btn('닫기', function () { box.remove(); });
    document.body.appendChild(box); sfx('pop');
  }
  function villageNpcTap(npc) {
    var nm = npc.d.name;
    if (nm === '노아') { openNoah(); return true; }
    if (nm === '상인') { openTrade(); return true; }
    if (nm === '농부') {
      var hasSeed = Object.keys(FARM_SEEDS).some(function (k) { return have(+k) > 0; }) || have(SEED) > 0, dayN = Math.floor(dayT / DAY_LEN);
      if (!hasSeed && villageBook.farmerDay !== dayN) {
        var ks = Object.keys(FARM_SEEDS); for (var i = 0; i < 3; i++) give(+ks[Math.floor(Math.random() * ks.length)], 1);
        villageBook.farmerDay = dayN; saveVillageBook(); bagChanged(); $('cardNew').textContent = '🌱 농부가 씨앗 3개를 나눠 줬어요. 괭이로 간 밭에 심어 보세요';
      }
      return true;
    }
    if (nm === '어부') {
      if (!have(FISH_ROD) && !villageBook.gotRod) { give(FISH_ROD, 1); villageBook.gotRod = 1; saveVillageBook(); bagChanged(); $('cardNew').textContent = '🎣 어부가 낚싯대를 줬어요. 낚싯대를 들고 물을 누르면 낚시해요'; }
      return true;
    }
    if (nm === '한 아이') { loavesQuest(); return true; }
    return false;
  }
  function openTrade() {
    var old = $('tradeBox'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'tradeBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.95);border:2px solid #000;box-shadow:inset 0 0 0 2px #b88a3a;padding:12px 14px;color:#fff;font-size:14px;width:min(340px,92vw);max-height:86vh;overflow:auto';
    var h = document.createElement('b'); h.textContent = '⚖ 상인과 물물 교환'; h.style.cssText = 'display:block;font-size:16px;color:#ffe27a;margin-bottom:4px';
    var v = document.createElement('p'); v.textContent = '「속이는 저울은 여호와께서 미워하시나 공평한 추는 그가 기뻐하시느니라」 (잠 11:1)'; v.style.cssText = 'margin:0 0 8px;font-size:12px;opacity:.85';
    box.appendChild(h); box.appendChild(v);
    TRADES.forEach(function (t) {
      var give0 = t[0], get0 = t[1], ok = isAdm() || have(give0[0]) >= give0[1];
      var b = document.createElement('button'); b.className = 'mc'; b.style.cssText = 'display:block;width:100%;margin:4px 0;text-align:left;white-space:normal;height:auto;min-height:38px;padding:4px 8px';
      b.textContent = nameOf(give0[0]) + ' ' + give0[1] + '개 → ' + nameOf(get0[0]) + ' ' + get0[1] + '개' + (ok ? '' : '  (모자라요: ' + have(give0[0]) + '/' + give0[1] + ')');
      b.disabled = !ok;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!isAdm() && have(give0[0]) < give0[1]) return;
        if (!isAdm() && room(get0[0]) < get0[1]) { bagFull(); return; }
        take(give0[0], give0[1]); give(get0[0], get0[1]); bagChanged(); sfx('craft');
        toast('⚖ ' + nameOf(give0[0]) + ' ' + give0[1] + '개를 ' + nameOf(get0[0]) + ' ' + get0[1] + '개로 바꿨어요'); box.remove(); openTrade();
      });
      box.appendChild(b);
    });
    var c = document.createElement('button'); c.className = 'mc'; c.textContent = '닫기'; c.style.cssText = 'display:block;width:100%;margin-top:6px';
    c.addEventListener('click', function (e) { e.stopPropagation(); box.remove(); }); box.appendChild(c);
    document.body.appendChild(box); sfx('pop');
  }
  function fishCount() { var n = have(RAW_FISH) + have(COOKED_FISH); for (var k in VILLAGE_FISH) n += have(VILLAGE_FISH[k]); return n; }
  function takeFish(n) {
    [COOKED_FISH, RAW_FISH].concat(Object.keys(VILLAGE_FISH).map(function (k) { return VILLAGE_FISH[k]; })).forEach(function (id) { var t = Math.min(n, have(id)); if (t > 0) { take(id, t); n -= t; } });
  }
  function loavesQuest() {
    var breads = have(BREAD) + have(FLATBREAD);
    if (ACH.loaves && !isAdm()) { $('cardNew').textContent = '🧺 남은 조각이 열두 바구니에 찼어요 (요 6:13)'; return; }
    if (breads < 5 || fishCount() < 2) { $('cardNew').textContent = '빵 다섯 개와 물고기 두 마리를 가져와 함께 나눠 보세요 (지금 빵 ' + breads + '/5 · 물고기 ' + fishCount() + '/2)'; return; }
    var nb = 5; [BREAD, FLATBREAD].forEach(function (id) { var t = Math.min(nb, have(id)); if (t > 0) { take(id, t); nb -= t; } });
    takeFish(2); give(FLATBREAD, 12); bagChanged(); sfx('craft');
    showVerseCard('🧺', '열두 바구니', '이에 거두니 보리떡 다섯 개로 먹고 남은 조각이 열두 바구니에 찼더라', '요한복음 6:13', '예수께서 떡을 가져 축사하신 후에 앉아 있는 자들에게 나눠 주시고 물고기도 그렇게 그들의 원대로 주시니라 (요 6:11) — 빵 12개를 받았어요');
    unlock('loaves');
  }
  // 풀·꽃·갈대 같은 식물은 사람·동물을 가리지 않는다(누르는 광선이 갈대에 먼저 걸려 사람을 못 누르던 것)
  function blockCover(h) { return h && kind(get(h.x, h.y, h.z)) !== 'plant' ? h.t : undefined; }
  function tapAt(sx, sy) {
    if (furnitureRest) return;
    var dir = screenDir(sx, sy), held=HOTBAR[sel];
    // 사람(마을 사람·다른 나그네)을 겨눴으면 손에 든 물건보다 먼저 — 낚싯대를 들고 물가 사람을 눌러도 말을 걸 수 있게
    var hPre = pickDir(dir), cPre = pickCreature(dir, blockCover(hPre));
    var personFirst = cPre && (cPre.npc || cPre.peer);
    if(!personFirst && (held===FISH_ROD||held===FISH_NET)) return useFishing(held,dir);
    if(!personFirst) {
      if(held===WORD_SCROLL && have(held)) return showWordCard(false);
      if(held===HAND_MAP && have(held)) {openPanel('map');drawMap($('bigmapc'),true);return;}
      if(held===COMPASS && have(held)) return toast('지금 보는 방향: '+headingName());
      if(held===SHOFAR && have(held)) return callShofar();
      if(held===SLING && have(held)) return slingPractice(pickDir(dir));
      if(held===BOW && have(held)) return shootArrow(dir);
    }
    var h = pickDir(dir), c = pickCreature(dir, blockCover(h));
    if (c && riding && c.a && c.a.sp.seat) c = null;
    if (c && c.shadow) return hitShadow(c.shadow);
    if (c && c.peer) return tapPeer(c.peer);
    if (c && c.npc) {
      var npc=c.npc; showNpc(npc);
      if (villageNpcTap(npc)) return;
      if ((npc.d.name==='목자' || npc.d.name==='빵 굽는 사람') && !held)
        $('cardNew').textContent='마을 수첩 → 마을 사람에서 부탁을 볼 수 있어요';
      if (npc.d.name==='목자' && held===STAFF && have(STAFF)) return shepherdVisit(npc);
      if (npc.d.name==='목자' && have(RAW_LAMB)===0 && room(RAW_LAMB)>0) {
        give(RAW_LAMB,1);bagChanged();toast('목자가 요리할 양고기를 나눠 줬어요');
      }
      return;
    }
    if (c && c.a && held===STAFF && have(STAFF) && c.a===lostSheep && !c.a.found) {
      c.a.found=true; animalCall('sheep'); toast('잃은 양을 찾았어요. 지팡이를 들고 목자에게 함께 가요'); return;
    }
    if (c && c.a && BREEDS[c.a.kind] && HOTBAR[sel] === WHEAT && have(WHEAT) > 0) return feedAnimal(c.a);
    if (c && c.a && harvestAnimal(c.a)) return;
    if (c) return c.a && c.a.sp.seat ? tapRideable(c.a) : showCard(c.kind);
    if (h) act('place', h);
    else if (WEARINFO[HOTBAR[sel]]) wearItem(HOTBAR[sel]);
    else if (FOODS[HOTBAR[sel]]) eatItem(HOTBAR[sel]);
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
  function readCargo(items) {
    return [0,1].map(function (i) {
      var slot=Array.isArray(items)&&items[i], id=slot&&Number(slot[0]), n=slot&&Math.floor(slot[1]);
      return id&&n>0&&INV.indexOf(id)>=0&&!isTool(id)?[id,Math.min(STACK,n)]:null;
    });
  }
  function horseSaveRow(x) {
    var row={k:x.kind,x:Math.round(x.x*10)/10,z:Math.round(x.z*10)/10,h:Math.round(x.h*100)/100};
    if(x.kind==='donkey')row.cargo=readCargo(x.cargo);
    return row;
  }
  function saveHorses() {
    var a = animals.filter(function (x) { return x.saddled; }).slice(-6).map(horseSaveRow);
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
    document.body.classList.add('riding'); animalCall(a.kind); stats.tapped++; questCheck(); unlock('ride');
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
      var a = makeBeast(o.k, o.x, o.z); a.h = o.h || 0; a.mesh.rotation.y = a.h; a.cargo=readCargo(o.cargo); putSaddle(a); animals.push(a); return false;
    });
  }

  // 처음 온 사람 안내(한 번 다 하면 다시 안 나옴)
  var stats = { log: 0, crafted: 0, placed: 0, tapped: 0 }, qStep = 0;
  try { var qs = JSON.parse(localStorage.getItem('arkVillage.quest') || 'null'); if (qs) { stats = qs.stats || stats; qStep = qs.step || 0; } } catch (e) {}
  var tutorialStored = false, tutorialStep = qStep >= 4 ? 9 : 0, tutorialWalk = false, tutorialLook = false, tutorialDoor = null;
  var tutorialStartLog = stats.log || 0, tutorialStartCraft = stats.crafted || 0, tutorialOneLogTold = false, tutorialOneCraftTold = false;
  try {
    var tut = localStorage.getItem('arkVillage.tutorial');
    if (tut !== null && /^[0-9]$/.test(tut)) { tutorialStep = +tut; tutorialStored = true; }
  } catch (e) {}
  function tutorialSave() {
    tutorialStored = true;
    try { localStorage.setItem('arkVillage.tutorial', String(tutorialStep)); } catch (e) {}
    stateDirty();
  }
  function finishTutorial(showMessage) {
    tutorialStep = 9;
    // 새 안내가 이전의 처음 네 가지 할 일을 대신한다.
    if (qStep < 4) { qStep = 4; questSave(); }
    if (showMessage) toast('첫 안내를 끝냈어요. 위에 나오는 할 일을 따라 첫 집을 지어 보세요! 활·수레 같은 것은 메뉴 「✨ 새 기능」에서 봐요');
    tutorialSave(); renderQuest();
  }
  function tutorialAdvance() {
    tutorialStep++;
    if (tutorialStep === 1) tutorialStartLog = stats.log || 0;
    if (tutorialStep === 2) tutorialStartCraft = stats.crafted || 0;
    // 로그인 없이 할 수 있는 안내는 끝까지 보여 준다.
    if (tutorialStep === 4 && (!me || myPlot < 0)) tutorialStep = 6;
    if (tutorialStep === 7 && (!me || !NET.ok)) tutorialStep = 8;
    if (tutorialStep === 9) { finishTutorial(true); return; }
    tutorialSave(); renderQuest();
  }
  function tutorialEvent(event) {
    if (!started || tutorialStep >= 9) return;
    if (tutorialStep === 0) {
      if (event === 'walk') tutorialWalk = true;
      if (event === 'look') tutorialLook = true;
      if (tutorialWalk && tutorialLook) tutorialAdvance();
    } else if (['', 'log', 'craft', 'place', 'home', 'door', 'map', 'chat', 'animal'][tutorialStep] === event) {
      tutorialAdvance();
    }
  }
  var practiceStep = 0, practiceUpper = false, practiceHalves = 0;
  function openPractice() {
    practiceStep = practiceHalves = 0;
    practiceUpper = false;
    renderPractice();
    openPanel('practice');
  }
  function finishPractice() {
    S.practiceSeen = true;
    saveSettings();
    resume();
  }
  function renderPractice() {
    $('practiceHint').textContent = ['문을 눌러 열어 봐요.', '열린 문을 지나가 봐요.',
      '아래쪽과 위쪽에 반 블록을 한 번씩 놓아 봐요.', '지도를 열어 내 땅을 찾아봐요.',
      '연습 끝! 마을에서 직접 지어 봐요.'][practiceStep];
    $('practiceDoor').hidden = practiceStep > 1;
    $('practiceDoor').disabled = practiceStep === 1;
    $('practiceDoor').classList.toggle('open', practiceStep === 1);
    $('practiceDoor').textContent = practiceStep === 1 ? '열린 문' : '문 열기';
    $('practiceWalk').hidden = practiceStep !== 1;
    $('practiceHalf').hidden = $('practiceTile').hidden = practiceStep !== 2;
    $('practiceHalf').textContent = practiceUpper ? '위쪽' : '아래쪽';
    $('practiceTile').classList.toggle('upper', practiceUpper);
    $('practiceTile').classList.toggle('placed', !!(practiceHalves & (practiceUpper ? 2 : 1)));
    $('practiceMap').hidden = practiceStep !== 3;
    $('practiceMapView').hidden = $('practiceDone').hidden = practiceStep !== 4;
    $('practiceSkip').hidden = practiceStep === 4;
  }
  function renderTutorial() {
    var text = [
      isTouch ? '방향키로 걷고 화면을 밀어 둘러봐요 (방향키 가운데 톡톡 = 웅크리기)' : 'WASD로 걷고 마우스로 둘러봐요 (Shift = 웅크리기)',
      isTouch ? '통나무 2개를 캐요 — ＋에 맞추고 화면을 꾹 눌러요' : '통나무 2개를 캐요 — ＋를 맞추고 왼쪽 버튼을 꾹 눌러요',
      '가방 → 만들기 → 블록에서 고페르 나무를 두 번 만들어요',
      isTouch ? '단축 칸에서 블록을 고르고 화면을 톡 눌러 놓아요' : '단축 칸에서 블록을 고르고 오른쪽 클릭해 놓아요',
      '내 땅으로 가요',
      '나무 문을 놓고 연 다음 문 안으로 걸어가요',
      isTouch ? '작은 지도를 눌러 큰 지도를 열어요' : 'M 키로 큰 지도를 열어요',
      isTouch ? '채팅 버튼을 눌러 채팅을 열어요' : 'T 키로 채팅을 열어요',
      '동물에 ＋를 맞추고 눌러 말씀 카드를 봐요'
    ];
    var actions = { 1: ['숲으로', function () { travel('forest'); }],
      2: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }],
      4: ['내 땅으로', goHome],
      5: ['문 만들기', function () { invTab = 'craft'; craftCat = 'shape'; openPanel('inv'); }] };
    var action = actions[tutorialStep], btn = $('qBtn');
    $('qHead').textContent = '처음 안내 ' + (tutorialStep + 1) + '/9';
    $('qText').textContent = text[tutorialStep];
    btn.style.display = action ? '' : 'none';
    btn.textContent = action ? action[0] : '';
    btn.onclick = action ? function (e) { e.stopPropagation(); action[1](); } : null;
  }
  var QUEST = [
    { text: '🌲 동쪽 숲에서 통나무 5개 캐기', prog: function () { return Math.min(5, stats.log) + '/5'; }, done: function () { return stats.log >= 5; }, btn: ['숲으로', function () { travel('forest'); }] },
    { text: '🔨 가방 → 만들기에서 고페르 나무 만들기', done: function () { return stats.crafted > 0; }, btn: ['가방 열기', function () { invTab = 'craft'; openPanel('inv'); }] },
    { text: '🐑 동물을 눌러 말씀 카드 보기', done: function () { return stats.tapped > 0; } },
    { text: '🏠 내 땅에 블록 놓기', done: function () { return stats.placed > 0; }, btn: ['내 땅으로', function () { goHome(); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    // 첫 집 짓기: 무엇을 지을지 한 단계씩
    { text: '🪵 집 지을 고페르 나무 20개 모으기(통나무 1 → 4)', prog: function () { return Math.min(20, have(GOPHER)) + '/20'; }, done: function () { return have(GOPHER) >= 20 || stats.placed >= 30; }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }] },
    { text: '🧱 내 땅에 바닥과 벽 블록 30개 놓기', prog: function () { return Math.min(30, stats.placed) + '/30'; }, done: function () { return stats.placed >= 30; }, btn: ['내 땅으로', function () { goHome(); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🚪 문을 만들어 집에 달기(고페르 나무 6)', done: function () { return [60, 61, 62, 63, 64, 65, 66, 67].some(plotHas); }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'shape'; openPanel('inv'); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🔥 등불이나 횃불로 집 안 밝히기', done: function () { return plotHas(LAMP) || plotHas(TORCH) || [170, 171, 172, 173].some(plotHas); }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🛏 침대를 놓아 쉴 곳 만들기(양털 3 + 고페르 나무 3)', done: function () { return plotHas(BED); }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🕊 방주 문 앞 노아의 부탁 다섯 가지 마치기 → 개척 땅', prog: function () { return (NOAH.done ? 5 : NOAH.step) + '/5'; }, done: function () { return !!NOAH.done; }, btn: ['노아에게', function () { travel('ark'); }], guest: '🏠 로그인하면 노아의 부탁을 받고 개척 땅을 맡을 수 있어요' },
    { text: '🐑 울타리로 우리를 짓고 밀을 들고 양을 데려오기', done: function () { return HERD.length > 0; }, btn: ['내 땅으로', function () { goHome(); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' }
  ];
  function questSave() { try { localStorage.setItem('arkVillage.quest', JSON.stringify({ stats: stats, step: qStep })); } catch (e) {} }
  function questCheck() {
    // 문까지 만들려면 고페르 나무 7개(놓기 1 + 문 6)가 필요 → 통나무 2개를 캐면 넘어감
    if (tutorialStep === 1 && stats.log - tutorialStartLog >= 2) tutorialEvent('log');
    else if (tutorialStep === 1 && stats.log - tutorialStartLog === 1 && !tutorialOneLogTold) { tutorialOneLogTold = true; toast('🪵 하나 더! 문까지 만들려면 통나무가 2개 필요해요'); }
    if (tutorialStep === 2 && stats.crafted - tutorialStartCraft >= 2) tutorialEvent('craft');   // 통나무 2개 → 고페르 나무 8개(놓기 1 + 문 6)
    else if (tutorialStep === 2 && stats.crafted - tutorialStartCraft === 1 && !tutorialOneCraftTold) { tutorialOneCraftTold = true; toast('🪵 한 번 더 만들어요 — 문을 만들려면 고페르 나무가 더 필요해요'); }
    var moved = false;
    while (qStep < QUEST.length && QUEST[qStep].done()) { qStep++; moved = true; }
    if (moved) { sfx('craft'); if (qStep >= QUEST.length) toast('🎉 첫 집을 다 지었어요! 이제 함께 짓는 터에서 친구들과 지어 보세요'); else if (qStep === 4) toast('🏠 이제 첫 집을 지어 봐요 — 위의 할 일을 하나씩 따라가요'); }
    questSave(); renderQuest();
  }
  function renderQuest() {
    var el = $('quest'); if (!el) return;
    var tutoring = started && tutorialStep < 9;
    $('qSkip').hidden = !tutoring;
    if (tutoring) { el.style.display = ''; renderTutorial(); return; }
    if (qStep >= QUEST.length) {   // 첫 집을 다 지으면: 「본향을 향하여」 지금 할 일
      if (STORY.ended) { el.style.display = 'none'; return; }
      el.style.display = ''; var b2 = $('qBtn'); b2.style.display = '';
      if (!STORY.started) {
        $('qHead').textContent = '📜 ' + PART_NAMES[0]; $('qText').textContent = '🧭 마을 입구의 「안내하는 나그네」에게 말을 걸어요';
        b2.textContent = '가기'; b2.onclick = function (e) { e.stopPropagation(); teleport(XM - 6.5, G, PZ0 - 3, 0); resume(); };
        return;
      }
      var part = partOf(), txt = '';
      if (part === 1) { var t = TOKENS.filter(function (t2) { return !has(t2[0]); })[0], q = t && tokenTasks(t).filter(function (q2) { return q2[1] < q2[2]; })[0]; txt = t ? t[2] + ' ' + t[1] + ': ' + (q ? q[0] + ' ' + Math.min(q[1], q[2]) + '/' + q[2] : '') : ''; }
      else if (part === 2) txt = '💎 기초석 ' + FS_NAMES.filter(function (n, i) { return have(FSTONE0 + i) > 0 || STORY.sockets[i]; }).length + '/12 — 땅속 깊이 열두 보석을 캐요';
      else if (part === 3) txt = '🕯 골짜기 등잔대 ' + STORY.lamps.filter(Boolean).length + '/7 — 동쪽 사막 땅속 미로';
      else txt = '🚪 기초석 자리 ' + STORY.sockets.filter(Boolean).length + '/12 — 동쪽 끝 거룩한 성';
      $('qHead').textContent = '📜 ' + PART_NAMES[part]; $('qText').textContent = txt;
      b2.textContent = '자세히'; b2.onclick = function (e) { e.stopPropagation(); sfx('click'); openStory(); };
      return;
    }
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
  var DAY_LEN = 1200, dayT = DAY_LEN * 0.06, rain = 0, rainOn = false, rainTimer = 300;   // 11/20: 하루 15분 → 20분(낮 약 12분·밤 약 8분), 처음 5분은 맑게
  var storm = false, thunderT = 8, flashK = 0, stormTold = false;   // 뇌우: 비가 올 때 열에 넷쯤(노아 때 비는 늘 뇌우)
  var LU = { uDay: { value: 1 }, uTint: { value: new THREE.Color(1, 1, 1) }, uTime: { value: 0 }, uHand: { value: new THREE.Vector4(0, -999, 0, 0) } };   // uHand: 손에 든 횃불(위치, 세기)
  function lightPatch(mat) {
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uDay = LU.uDay; sh.uniforms.uTint = LU.uTint; sh.uniforms.uTime = LU.uTime; sh.uniforms.uHand = LU.uHand;
      sh.vertexShader = 'uniform float uTime;\nvarying vec3 vWpL;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n vWpL = (modelMatrix * vec4(position, 1.0)).xyz;\n#ifdef USE_COLOR\n float swayW = color.b;\n if (swayW > 0.5) { vec4 wpS = modelMatrix * vec4(position, 1.0);\n' +
        '  if (swayW < 1.5) { transformed.x += sin(uTime * 1.7 + wpS.x * 0.7 + wpS.z * 0.5) * 0.07; transformed.z += cos(uTime * 1.3 + wpS.z * 0.6 + wpS.x * 0.2) * 0.05; }\n' +
        '  else { transformed.y += sin(uTime * 1.6 + wpS.x * 0.8 + wpS.z * 0.6) * 0.035 - 0.035; } }\n#endif');
      sh.fragmentShader = 'uniform float uDay;\nuniform vec3 uTint;\nuniform vec4 uHand;\nvarying vec3 vWpL;\n' + sh.fragmentShader.replace('#include <color_fragment>',
        '#if defined( USE_COLOR )\n float handL = uHand.w * clamp(1.0 - distance(vWpL, uHand.xyz) / 7.0, 0.0, 1.0) * (0.55 + 0.45 * vColor.r);\n' +
        ' diffuseColor.rgb *= max(vColor.r * uDay * uTint, max(vColor.g, handL) * vec3(1.0, 0.86, 0.62));\n#endif');
    };
  }
  var brightStars = null, starLook = 0, starNight = -1;
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
    // 북두성·삼성·묘성(욥 9:9): 밝게 보이는 별 무리
    var cps = [];
    [[22, 52, [[0, 0], [5, 1], [9, 0], [13, -1], [14, -6], [19, -7], [19, -1]]],
     [205, 32, [[0, 0], [7, 1], [3, -5], [4, -6], [5, -7], [1, -12], [8, -11]]],
     [118, 62, [[0, 0], [1.4, .6], [2.3, -.2], [1, -1], [2.1, -1.3], [3, -.7], [.4, -1.8]]]].forEach(function (gp) {
      gp[2].forEach(function (o) {
        var az = (gp[0] + o[0]) * Math.PI / 180, el = (gp[1] + o[1]) * Math.PI / 180, r = 255;
        cps.push(Math.cos(az) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(az) * Math.cos(el) * r);
      });
    });
    var cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cps, 3));
    brightStars = new THREE.Points(cg, new THREE.PointsMaterial({ color: 0xfff4d6, size: 4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    brightStars.frustumCulled = false; scene.add(brightStars);
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
  var WEATHER=['이른 비','맑은 철','늦은 비','가뭄'], rainbowUntil=0, rainbow=[], lastSeason=-1;
  function seasonIndex(){return Math.floor(dayT/DAY_LEN)%WEATHER.length;}
  function makeRainbow(){
    [0xdd746d,0xe5a966,0xe7d68a,0x93c78d,0x80abc8,0xb39ccc].forEach(function(color,i){
      var points=[];
      for(var k=0;k<=32;k++){
        var angle=k*Math.PI/32,r=75-i*1.6;
        points.push(new THREE.Vector3(Math.cos(angle)*r,Math.sin(angle)*r*.55,0));
      }
      var line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color:color,transparent:true,opacity:.46,depthWrite:false,fog:false}));
      line.visible=false;scene.add(line);rainbow.push(line);
    });
  }
  // 베들레헴의 별(마 2:9): 성탄 절기에 마구간 위에 머무는 큰 별
  var bStar = null;
  function makeBethlehemStar() {
    if (!FESTIVE || bStar) return;
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(.18, 'rgba(255,244,190,.95)'); g.addColorStop(.45, 'rgba(255,224,130,.35)'); g.addColorStop(1, 'rgba(255,210,100,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,235,.9)'; x.fillRect(62, 0, 4, 128); x.fillRect(0, 62, 128, 4);
    bStar = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false }));
    bStar.position.set(NAT_X + 5, G + 28, NAT_Z + 4); bStar.scale.set(12, 12, 1); bStar.renderOrder = 2; scene.add(bStar);
  }
  var snowNow = false, snowRegT = 0, snowRegOK = true;
  var pillar = null, pillarTold = false, mannaDay = -1, mannaTold = false, wildRegT = 0, inWild = false;
  function makePillar() {
    if (pillar) return;
    pillar = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 4.2, 70, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }));
    pillar.position.set(HOREB_X + 0.5, horebY() + 40, HOREB_Z + 0.5); pillar.renderOrder = 2; scene.add(pillar);
  }
  var C_CLOUDP = new THREE.Color(0xf4f4f0), C_FIREP = new THREE.Color(0xff8a30);
  function stepWilderness(dt, dayF) {
    if (!started) return;
    if (!pillar) makePillar();
    pillar.material.color.copy(C_CLOUDP).lerp(C_FIREP, 1 - dayF); pillar.material.opacity = 0.42 + 0.35 * (1 - dayF);
    var dx = P.x - HOREB_X, dz = P.z - HOREB_Z;
    if (!pillarTold && dx * dx + dz * dz < 45 * 45) { pillarTold = true; showVerseCard(dayF > 0.5 ? '☁' : '🔥', dayF > 0.5 ? '구름 기둥' : '불 기둥', '여호와께서 그들 앞에서 가시며 낮에는 구름 기둥으로 그들의 길을 인도하시고 밤에는 불 기둥을 그들에게 비추사 낮이나 밤이나 진행하게 하시니', '출애굽기 13:21'); }
    wildRegT -= dt;
    if (wildRegT <= 0) { wildRegT = 1; var r0 = T.reg; terrain(Math.floor(P.x), Math.floor(P.z)); inWild = T.reg === 'desert' || T.reg === 'oasis'; T.reg = r0; }
    var p = (dayT % DAY_LEN) / DAY_LEN, day = Math.floor(dayT / DAY_LEN);
    if (inWild && p > 0.02 && p < 0.2 && mannaDay !== day && ui === 'play') {   // 아침에 광야에 있으면 만나가 내림(하루 한 번)
      mannaDay = day;
      for (var i = 0; i < 10; i++) {
        var a = Math.random() * 6.28, r = 3 + Math.random() * 9, mx = P.x + Math.cos(a) * r, mz = P.z + Math.sin(a) * r, gy = groundAt(mx, mz, SY - 3);
        if (gy === null) continue;
        dropItem(mx, gy + 0.2, mz, MANNA, 1); var o = DROPS[DROPS.length - 1]; if (o && o.id === MANNA) { o.thrown = true; o.manna = true; o.full = o.age; o.vy = 0; }
      }
      if (!mannaTold) { mannaTold = true; showVerseCard('🍯', '만나', '이스라엘 자손이 보고 그것이 무엇인지 알지 못하여 서로 이르되 이것이 무엇이냐 하니 모세가 그들에게 이르되 이는 여호와께서 너희에게 주어 먹게 하신 양식이라', '출애굽기 16:15', '깟씨 같이 희고 맛은 꿀 섞은 과자 같았더라 (출 16:31) — 땅에 내린 만나를 주워요'); }
    }
  }
  function updateDay(dt) {
    dayT += dt; LU.uTime.value = (LU.uTime.value + dt) % 600;
    var p = (dayT % DAY_LEN) / DAY_LEN, ang = p < 0.62 ? p / 0.62 * Math.PI : Math.PI + (p - 0.62) / 0.38 * Math.PI;
    var elev = Math.sin(ang), dayF = clamp01((elev + 0.12) / 0.34); dayF = dayF * dayF * (3 - 2 * dayF);
    var dusk = elev > -0.2 ? clamp01(1 - Math.abs(elev) / 0.28) : 0;
    // 거룩한 성 안: 다시 밤이 없음(계 22:5)
    if (started && STORY.done && cityInside(Math.floor(P.x), Math.floor(P.z))) { dayF = 1; dusk = 0; }
    // 비: 11/20 「날씨가 너무 자주 바뀌어」 — 맑은 날 6~12분, 비 1.5~3분, 비가 올지는 2분마다 한 번 봄
    rainTimer -= dt;
    var season=seasonIndex();
    if(lastSeason!==season){
      if(lastSeason!==-1){if(started)toast(['🌧 이른 비 철이에요 — 밭 작물이 빨리 자라요','☀ 맑은 철이에요','🌧 늦은 비 철이에요 — 작물이 가장 빨리 여물어요','🏜 가뭄이에요 — 물가 밭이 아니면 작물이 더디 자라요'][season]);}
      lastSeason=season;
    }
    if (rainTimer<=0) {
      if (rainOn) { rainOn=false;rainTimer=360+Math.random()*360;if(dayF>.6)rainbowUntil=dayT+44; }
      else if (noahWantsRain() || Math.random()<[.45,.12,.4,.04][season]) {rainOn=true;rainTimer=noahWantsRain()?30:90+Math.random()*90;storm=noahWantsRain()||Math.random()<.4;thunderT=6+Math.random()*8;}
      else rainTimer=120;
    }
    rain += ((rainOn ? 1 : 0) - rain) * Math.min(1, dt * 0.25);
    if (!rainOn) storm = false;
    if (started && storm && rain > 0.7 && !snowNow) { thunderT -= dt; if (thunderT <= 0) { thunderT = 9 + Math.random() * 22; thunderStrike(); } }
    flashK = Math.max(0, flashK - dt * 3.2);
    skyC.copy(C_NIGHT).lerp(C_DAY, dayF).lerp(C_DUSK, dusk * 0.5).lerp(C_RAIN, rain * 0.6 * dayF);
    scene.background.copy(skyC);
    fogC.copy(skyC).lerp(C_WHITE, 0.18 * dayF);
    scene.fog.color.copy(fogC); scene.fog.near = FOG_FAR * 0.4 * (1 - 0.45 * rain); scene.fog.far = FOG_FAR * (1 - 0.3 * rain);
    LU.uDay.value = (0.24 + 0.76 * dayF) * (1 - 0.22 * rain);
    if (flashK > 0) { var fk = flashK * (1 - caveK) * (flashK > 0.55 && flashK < 0.75 ? 0.35 : 1); LU.uDay.value = Math.min(1.25, LU.uDay.value + fk * 0.9); skyC.lerp(C_WHITE, fk * 0.75); scene.background.copy(skyC); }
    // 횃불·등을 손에 들면 내 둘레 7칸이 밝아짐(밤·굴에서)
    var hId = started ? HOTBAR[sel] : 0, hOn = hId && have(hId) > 0 && (hId === TORCH || (hId >= WTORCH && hId < WTORCH + 4) || hId === LANTERN || hId === LAMPSTAND + 1) ? 1 : 0;
    var hu = LU.uHand.value; hu.w += (hOn - hu.w) * Math.min(1, dt * 6); hu.x = P.x; hu.y = P.y + 2.4; hu.z = P.z;
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
    rainbow.forEach(function(line){
      line.visible=dayT<rainbowUntil&&rain<.32&&dayF>.55&&caveK<.3; if (line.visible) noahSawRainbow();
      if(line.visible)line.position.set(cp.x,Math.max(G+3,cp.y-26),cp.z-155);
    });
    stars.position.copy(cp); stars.material.opacity = (1 - dayF) * (1 - rain);
    if (bStar) bStar.material.opacity = 0.35 + 0.65 * (1 - dayF);
    stepWilderness(dt, dayF);
    if (brightStars) { brightStars.position.copy(cp); brightStars.material.opacity = Math.min(1, (1 - dayF) * 1.2) * (1 - rain); }
    // 밤에 하늘을 2초쯤 올려다보면 별 말씀 하나(밤마다 하나씩)
    var nightN = Math.floor(dayT / DAY_LEN);
    if (nightN !== starNight) { starNight = nightN; starLook = 0; }
    if (started && ui === 'play' && P.pitch > 0.7 && dayF < 0.3 && rain < 0.3 && caveK < 0.3) { if (starLook >= 0) { starLook += dt; if (starLook > 2) { starLook = -1; showStarVerse(nightN); } } }
    else if (starLook > 0) starLook = 0;
    // 빗줄기
    snowRegT -= dt; if (snowRegT <= 0) { snowRegT = 1; if (WINTER) { var reg0 = T.reg; terrain(Math.floor(cp.x), Math.floor(cp.z)); snowRegOK = T.reg !== 'desert' && T.reg !== 'oasis'; T.reg = reg0; } }
    var snowing = WINTER && snowRegOK;
    if (snowing !== snowNow) { snowNow = snowing; rainLines.material.color.setHex(snowing ? 0xffffff : 0xaabbd4); }
    rainLines.visible = rain > 0.03; rainLines.material.opacity = (snowing ? 0.95 : 0.5) * rain;
    if (rainLines.visible) {
      var rainCount = S.lightMode ? 240 : RAIN_N;
      for (var i = 0; i < rainCount; i++) {
        var o = i * 6;
        if (!rainPos[o + 1] && !rainPos[o]) respawnDrop(i, false);
        var fall = snowNow ? 6 : 42; rainPos[o + 1] -= fall * dt; rainPos[o + 4] = snowNow ? rainPos[o + 1] - 0.14 : rainPos[o + 4] - fall * dt;
        if (snowNow) { rainPos[o] += Math.sin(dayT * 1.3 + i) * 0.8 * dt; rainPos[o + 3] = rainPos[o] + 0.12; }
        var gx = Math.floor(rainPos[o]), gz = Math.floor(rainPos[o + 2]), top = skyAt(gx, gz);
        if (rainPos[o + 4] < top + 1 || rainPos[o + 4] < cp.y - 22 || Math.abs(rainPos[o] - cp.x) > 40 || Math.abs(rainPos[o + 2] - cp.z) > 40) respawnDrop(i, true);
      }
      rainLines.geometry.attributes.position.needsUpdate = true;
    }
    skyState.dayF = dayF; skyState.dusk = dusk;
  }

  // ───────── 배경 소리 ─────────
  var amb = null, ambTick = 0, nearWater = 0, underRoof = false, ambReg = '', ambSand = false, ambGrass = false, inCave = false, ambT = 0;
  function noiseLoop(type, freq, q) {
    var len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
    var f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = AC.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
    return g;
  }
  // 번개: 하늘이 두 번 번쩍, 0.3~2.5초 뒤 우르릉(가까울수록 빨리·크게). 굴 속에선 빛은 안 보이고 소리만 작게
  function thunderStrike() {
    var near = Math.random(); flashK = 1; vibrate('thunder');
    setTimeout(function () { rumble(near); }, 300 + (1 - near) * 2200);
    if (!stormTold && ui === 'play') { stormTold = true; toast('⛈ 천둥 번개가 쳐요 — 지붕 밑이나 방주 안으로 피해요'); }
  }
  function rumble(near) {
    if (!AC || !S.sound) return;
    try {
      var vol = (0.25 + 0.45 * near) * (1 - caveK * 0.6), dur = 2.2 + (1 - near) * 1.6;
      var len = Math.floor(AC.sampleRate * dur), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var tt = i / len, env = (tt < 0.04 ? tt / 0.04 : Math.pow(1 - tt, 1.7)) * (0.7 + 0.3 * Math.sin(tt * 37) * Math.sin(tt * 11)); last = last * 0.96 + (Math.random() * 2 - 1) * 0.2; d[i] = last * env * 3; }
      var src = AC.createBufferSource(); src.buffer = buf;
      var f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160 + near * 260;
      var g = AC.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
      if (near > 0.7) { var b2 = AC.createBufferSource(), l2 = Math.floor(AC.sampleRate * 0.25), bb = AC.createBuffer(1, l2, AC.sampleRate), d2 = bb.getChannelData(0); for (var k = 0; k < l2; k++) d2[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / l2, 3); b2.buffer = bb; var f2 = AC.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 900; var g2 = AC.createGain(); g2.gain.value = 0.35 * (1 - caveK * 0.7); b2.connect(f2); f2.connect(g2); g2.connect(AC.destination); b2.start(); }   // 가까우면 「쾅」
    } catch (e) {}
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
  // ── 악기: 놓은 높이에 따라 음이 달라진다(계단처럼 쌓으면 음계). 처음 연주하면 시편 150편 ──
  var INSTR = {}; INSTR[LYRE] = 1; INSTR[HARP] = 1; INSTR[TIMBREL] = 1; INSTR[CYMBAL] = 1;
  var INSTR_SCALE = [0, 2, 4, 7, 9, 12, 14, 16], instrTold = false;
  function playInstrument(id, x, y, z) {
    var note = INSTR_SCALE[((y % 8) + 8) % 8], f = 261.63 * Math.pow(2, note / 12);
    if (id === LYRE) { tone('triangle', f, f, 0.9, 0.16); tone('sine', f * 2, f * 2, 0.6, 0.05); }
    else if (id === HARP) { tone('triangle', f / 2, f / 2, 1.3, 0.16); tone('sine', f, f, 0.9, 0.05); }
    else if (id === TIMBREL) { tone('square', 180 + note * 6, 70, 0.16, 0.2); tone('sawtooth', 2400, 1800, 0.12, 0.03, 30); }
    else if (id === CYMBAL) { tone('sawtooth', 3600 + note * 40, 2600, 0.7, 0.05, 37); tone('square', 5200, 4200, 0.5, 0.025, 53); }
    swingT = 0.25;
    if (!instrTold) { instrTold = true; showVerseCard('🎵', B[id][0], '나팔 소리로 찬양하며 비파와 수금으로 찬양할지어다', '시편 150:3', '놓은 높이마다 음이 달라요. 계단처럼 쌓아 노래해 보세요'); }
  }
  function showVerseCard(emoji, name, text, ref, note) {
    $('cardEmoji').textContent = emoji; $('cardName').textContent = name; $('cardText').textContent = text; $('cardRef').textContent = ref; $('cardNew').textContent = note || '';
    $('card').classList.add('show'); sfx('pop'); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 10000);
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
    if (!amb) { try { amb = { water: noiseLoop('bandpass', 520, 0.7), rain: noiseLoop('lowpass', 2400), wind: noiseLoop('lowpass', 380), leaves: noiseLoop('highpass', 3600), surf: noiseLoop('lowpass', 850) }; } catch (e) { amb = {}; return; } }
    ambT += dt;
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
      var r0 = T.reg; terrain(px, pz); ambReg = T.reg; ambSand = T.top === SAND && T.reg !== 'sea' && T.reg !== 'lake'; ambGrass = T.top === GRASS; T.reg = r0;
      inCave = skyAt(px, pz) > P.y + HT + 3 && P.y < G - 2;   // 땅속 굴
      if (S.sound && started && ui === 'play' && inCave && Math.random() < 0.22) { var df = 1100 + Math.random() * 700; tone('sine', df, df * 0.6, 0.14, 0.035); }   // 굴 속 물방울
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
    var on = S.sound && started ? 1 : 0, out = !inCave && !underRoof ? 1 : 0, high = clamp01((P.y - G - 14) / 30);
    // 지역마다 바람·나뭇잎·파도(천천히 바뀜)
    var tWind = on * (inCave ? 0 : (ambReg === 'desert' || ambReg === 'oasis' || ambSand ? 0.05 : 0.012 + 0.05 * high) * (underRoof ? 0.3 : 1));
    var tLeaves = on * out * (ambReg === 'east' && ambGrass && skyState.dayF > 0.3 && rain < 0.3 ? 0.016 : 0);
    var tSurf = on * (ambReg === 'sea' ? 0.07 * nearWater * (0.5 + 0.5 * Math.sin(ambT * 0.55)) : 0) * (inCave ? 0 : 1);
    var ka = Math.min(1, dt * 1.5);
    if (amb.wind) amb.wind.gain.value += (tWind - amb.wind.gain.value) * ka;
    if (amb.leaves) amb.leaves.gain.value += (tLeaves - amb.leaves.gain.value) * ka;
    if (amb.surf) amb.surf.gain.value += (tSurf - amb.surf.gain.value) * ka;
    if (amb.water) amb.water.gain.value = 0.05 * nearWater * on * (ambReg === 'sea' ? 0.4 : 1);
    if (amb.rain) amb.rain.gain.value = snowNow ? 0 : 0.07 * rain * on * (underRoof ? 0.4 : 1);   // 눈은 조용히
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
  var FRIENDS = { accepted: new Set(), hidden: new Set(), rows: [], ready: false, busy: false, seq: 0, poll: 0 };
  function friendError(code) {
    return { login: '로그인하면 친구를 맺을 수 있어요', missing: '그 닉네임을 찾을 수 없어요',
      duplicate: '같은 닉네임이 여러 명이에요. 선생님에게 알려 주세요', self: '나에게는 신청할 수 없어요',
      existing: '이미 친구이거나 신청이 있어요', blocked: '이 사람에게는 신청할 수 없어요',
      daily: '오늘은 친구 신청을 다 보냈어요', pending: '기다리는 신청이 너무 많아요',
      gone: '신청이나 친구 기록이 이미 바뀌었어요' }[code] || '친구 기능을 아직 열 수 없어요. 조금 뒤에 다시 시도해 주세요';
  }
  function friendsFetch() {
    if (!client || !me || !NET.ok) return Promise.resolve();
    var seq = ++FRIENDS.seq;
    return client.rpc('get_ark_friends').then(function (r) {
      if (seq !== FRIENDS.seq) return;
      var d = r && r.data;
      FRIENDS.ready = !!d && !r.error && Array.isArray(d.rows);
      if (FRIENDS.ready) {
        FRIENDS.rows = d.rows;
        FRIENDS.accepted = new Set(d.rows.filter(function (v) { return v.status === 'accepted'; }).map(function (v) { return v.id; }));
        FRIENDS.hidden = new Set(d.hidden || []);
      }
      if (ui === 'friends') renderFriends();
    }, function () {
      if (seq !== FRIENDS.seq) return;
      FRIENDS.ready = false;
      if (ui === 'friends') renderFriends();
    });
  }
  function friendCall(rpc, args, message) {
    if (!me || !client || !NET.ok) { toast(friendError('login')); return; }
    if (FRIENDS.busy) return;
    FRIENDS.busy = true;
    client.rpc(rpc, args).then(function (r) {
      FRIENDS.busy = false;
      var d = r && r.data;
      if (!d || r.error || !d.ok) { toast(friendError(d && d.error)); friendsFetch(); return; }
      if (rpc === 'request_ark_friend') $('friendsNick').value = '';
      if (args.p_action === 'block') {
        FRIENDS.hidden.add(args.p_user); FRIENDS.accepted.delete(args.p_user);
        if (selectedMapPeer === args.p_user) { selectedMapPeer = ''; $('mapPerson').hidden = true; }
      }
      toast(message); friendsFetch();
    }, function () { FRIENDS.busy = false; toast(friendError()); });
  }
  function friendRequest(nick) {
    nick = nick.trim();
    if (!nick) { toast('친구의 닉네임을 적어 주세요'); return; }
    friendCall('request_ark_friend', { p_nick: nick }, '친구 신청을 보냈어요');
  }
  function openFriends() {
    if (!me) { toast(friendError('login')); return; }
    openPanel('friends'); fitMobileKeyboard(); renderFriends(); friendsFetch();
  }
  var recentPlayers = new Map();
  function fitMobileKeyboard() {
    if (isTouch && window.visualViewport) {
      document.body.style.setProperty('--game-visible-height', window.visualViewport.height + 'px');
    }
  }
  function rememberNearby(now) {
    if (!NET.on) return;
    for (var id in NET.peers) {
      var peer = NET.peers[id], nick = NET.names[id];
      if (peer.mapHidden || FRIENDS.hidden.has(id)) { recentPlayers.delete(id); continue; }
      if (nick && now - peer.t <= 6000 && Math.hypot(peer.tx - P.x, peer.tz - P.z) <= 160) {
        recentPlayers.delete(id);
        recentPlayers.set(id, { nick: nick, at: now });
      }
    }
    while (recentPlayers.size > 8) recentPlayers.delete(recentPlayers.keys().next().value);
  }
  function renderRecentPlayers() {
    var wrap = $('friendsRecent'), now = performance.now();
    var busy = new Set(FRIENDS.rows.map(function (row) { return row.id; }));
    var rows = Array.from(recentPlayers).reverse().filter(function (row) {
      return now - row[1].at <= 900000 && !busy.has(row[0]) && !FRIENDS.hidden.has(row[0]) &&
        !(NET.peers[row[0]] && NET.peers[row[0]].mapHidden);
    });
    wrap.replaceChildren();
    wrap.hidden = !FRIENDS.ready || !rows.length;
    if (wrap.hidden) return;
    var heading = document.createElement('h3'); heading.textContent = '최근 만난 사람'; wrap.appendChild(heading);
    rows.forEach(function (row) {
      var line = document.createElement('div'); line.className = 'vrow';
      var name = document.createElement('span'); name.textContent = row[1].nick;
      var button = document.createElement('button'); button.className = 'mc'; button.textContent = '신청';
      button.addEventListener('click', function () {
        if (!FRIENDS.hidden.has(row[0]) && !(NET.peers[row[0]] && NET.peers[row[0]].mapHidden)) friendRequest(row[1].nick);
      });
      line.append(name, button); wrap.appendChild(line);
    });
  }
  function renderFriends() {
    renderRecentPlayers();
    var body = $('friendsBody');
    body.replaceChildren();
    if (!FRIENDS.ready) { body.textContent = '친구 목록을 아직 열 수 없어요'; return; }
    var actions = { accept: ['받기','친구가 됐어요'], decline: ['거절','신청을 거절했어요'],
      remove: ['친구 삭제','친구 목록에서 뺐어요'], cancel: ['신청 취소','보낸 신청을 취소했어요'],
      block: ['차단','이 사람을 차단했어요'], unblock: ['차단 풀기','차단을 풀었어요'] };
    [['incoming','받은 신청',['accept','decline','block']], ['outgoing','보낸 신청',['cancel','block']],
     ['accepted','내 친구',['remove','block']], ['blocked','차단한 사람',['unblock']]].forEach(function (group) {
      var heading = document.createElement('h3'); heading.textContent = group[1]; body.appendChild(heading);
      var rows = FRIENDS.rows.filter(function (r) { return r.status === group[0]; });
      if (!rows.length) { var empty = document.createElement('p'); empty.textContent = '아직 없어요'; body.appendChild(empty); }
      rows.forEach(function (r) {
        var row = document.createElement('div'); row.className = 'vrow';
        var name = document.createElement('span'); name.textContent = r.nick; row.appendChild(name);
        group[2].forEach(function (action) {
          var b = document.createElement('button'); b.className = 'mc'; b.textContent = actions[action][0];
          b.addEventListener('click', function () {
            friendCall('change_ark_friend', { p_user: r.id, p_action: action }, actions[action][1]);
          });
          row.appendChild(b);
        });
        body.appendChild(row);
      });
    });
  }
  var mapPeople = [], selectedMapPeer = '';
  function mapPeerColor(u) {
    return partyMate(u) ? '#a7e86e' : (FRIENDS.accepted.has(u) ? '#67c6ff' : '#c0c6cd');
  }
  function drawMapPeople(ctx, big, ox, oz, scale, w, h) {
    var now = performance.now(), shown = [];
    if (NET.on) for (var u in NET.peers) {
      var p = NET.peers[u];
      if (!NET.names[u] || p.mapHidden || FRIENDS.hidden.has(u) || now - p.t > 6000 ||
          !Number.isFinite(p.tx) || !Number.isFinite(p.tz) || Math.hypot(p.tx - P.x, p.tz - P.z) > 160) continue;
      var x = (Math.round(p.tx / 4) * 4 - ox) * scale;
      var y = (Math.round(p.tz / 4) * 4 - oz) * scale;
      if (x < 0 || x > w || y < 0 || y > h) continue;
      shown.push({ u: u, x: x, y: y, color: mapPeerColor(u) });
    }
    shown.sort(function (a, b) {
      return Math.hypot(a.x - (P.x-ox)*scale, a.y - (P.z-oz)*scale) -
             Math.hypot(b.x - (P.x-ox)*scale, b.y - (P.z-oz)*scale);
    });
    shown = shown.slice(0, 48);
    shown.forEach(function (dot) {
      ctx.beginPath(); ctx.arc(dot.x, dot.y, big ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = dot.color; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#26302a'; ctx.stroke();
    });
    if (big) {
      mapPeople = shown;
      var active = shown.some(function (dot) { return dot.u === selectedMapPeer; });
      $('mapPerson').hidden = !active;
      if (!active) selectedMapPeer = '';
      else $('mapFriend').hidden = !canRequestMapFriend(selectedMapPeer);
    }
  }
  function canRequestMapFriend(id) {
    return FRIENDS.ready && !FRIENDS.hidden.has(id) && !FRIENDS.rows.some(function (row) { return row.id === id; });
  }
  function selectMapPerson(event) {
    var cv = $('bigmapc'), rect = cv.getBoundingClientRect(), hit = null, best = isTouch ? 23 : 16;
    mapPeople.forEach(function (dot) {
      var d = Math.hypot(dot.x * rect.width / cv.width + rect.left - event.clientX,
        dot.y * rect.height / cv.height + rect.top - event.clientY);
      if (d < best) { best = d; hit = dot; }
    });
    selectedMapPeer = hit ? hit.u : '';
    $('mapPerson').hidden = !hit;
    if (hit) {
      $('mapPersonName').textContent = NET.names[hit.u];
      $('mapFriend').hidden = !canRequestMapFriend(hit.u);
    }
  }
  // 작은 지도: 내 둘레 320칸 / 큰 지도: 온 세계
  function drawMap(cv, big) {
    if (!cv) return;
    var x = cv.getContext('2d'), w = cv.width, h = cv.height;
    x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false;
    rememberNearby(performance.now());
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
    drawMapRails(x, ox, oz, sc, w, h); drawMapBed(x, big, ox, oz, sc);
    drawMapPeople(x, big, ox, oz, sc, w, h);
    drawVillagePins(x, ox, oz, sc, w, h);
    drawFrontierMap(x,big,ox,oz,sc);
    if (forestRoute) {
      x.save();
      x.strokeStyle = '#ffdb61'; x.lineWidth = big ? 3 : 2; x.setLineDash([5, 4]);
      x.beginPath(); x.moveTo((P.x - ox) * sc, (P.z - oz) * sc);
      forestRoute.forEach(function (point) { x.lineTo((point[0] - ox) * sc, (point[1] - oz) * sc); });
      x.stroke(); x.restore();
    }
    var mx = (P.x - ox) * sc, mz = (P.z - oz) * sc, r = big ? 7 : 5;
    x.save(); x.translate(mx, mz); x.rotate(-P.yaw);
    x.beginPath(); x.moveTo(0, -r * 1.3); x.lineTo(r * 0.8, r); x.lineTo(-r * 0.8, r); x.closePath();
    x.fillStyle = '#ff4040'; x.fill(); x.lineWidth = 1.5; x.strokeStyle = '#fff'; x.stroke(); x.restore();
  }

  // ───────── 가까운 곳 만들고 지우기 ─────────
  var R_MESH = isTouch ? 5 : 7, R_GEN = R_MESH + 1, R_DROP = R_MESH + 4;
  function applyLightMode() {
    var radius = S.lightMode ? 3 : (isTouch ? 5 : 7);
    R_MESH = radius; R_GEN = radius + 1; R_DROP = radius + 4;
    FOG_FAR = radius * CS - 12;
    if (!renderer || !camera) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, S.lightMode ? 1 : (isTouch ? 1.6 : 2)));
    scene.fog.near = FOG_FAR * .4;
    scene.fog.far = FOG_FAR;
    camera.far = FOG_FAR + 60;
    if (rainLines) rainLines.geometry.setDrawRange(0, (S.lightMode ? 240 : RAIN_N) * 2);
    resize();
  }
  var meshedCols = new Uint8Array(NC * NC), OFFS = [];
  for (var odz = -11; odz <= 11; odz++) for (var odx = -11; odx <= 11; odx++) OFFS.push([odx, odz, odx * odx + odz * odz]);
  OFFS.sort(function (a, b) { return a[2] - b[2]; });
  function inWorldC(cx, cz) { return cx >= 0 && cz >= 0 && cx < NC && cz < NC; }
  function columnReady(cx, cz) {
    for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) { var x = cx + dx, z = cz + dz; if (inWorldC(x, z) && !COLS[z * NC + x]) return false; }
    return true;
  }
  function meshColumn(cx, cz) { for (var cy = 0; cy < CY; cy++) buildChunk(cx, cy, cz); meshedCols[cz * NC + cx] = 1; delete meshProg[cz * NC + cx]; }
  // 걸어 다닐 때는 기둥 하나를 높이 조각(3개)으로 나눠 프레임마다 한 조각씩 그린다(느린 휴대폰에서 끊기지 않게)
  var meshProg = {};
  function meshStep(cx, cz) { var k = cz * NC + cx, c = meshProg[k] || 0; buildChunk(cx, c, cz); if (++c >= CY) { meshedCols[k] = 1; delete meshProg[k]; } else meshProg[k] = c; }
  function unmeshColumn(cx, cz) {
    for (var cy = 0; cy < CY; cy++) { var key = cx + ',' + cy + ',' + cz, old = chunks[key]; if (old) { old.forEach(function (m) { scene.remove(m); m.geometry.dispose(); }); delete chunks[key]; } }
    meshedCols[cz * NC + cx] = 0; delete meshProg[cz * NC + cx];
  }
  function newColumn(cx, cz) { genColumn(cx, cz); spawnColumn(cx, cz); }
  // 바로 필요할 때(처음, 순간 이동): 그 둘레를 한꺼번에
  function ensureAround(x, z, r) {
    if (isTouch) r = Math.max(1, r - 1);   // 휴대폰: 바로 밟을 곳만 먼저 만들고 나머지는 걸으며 채운다(한꺼번에 만들면 몇 초씩 멈춤)
    var pcx = Math.floor(x / CS), pcz = Math.floor(z / CS), dx, dz;
    for (dz = -r - 1; dz <= r + 1; dz++) for (dx = -r - 1; dx <= r + 1; dx++) { var cx = pcx + dx, cz = pcz + dz; if (inWorldC(cx, cz) && !COLS[cz * NC + cx]) newColumn(cx, cz); }
    for (dz = -r; dz <= r; dz++) for (dx = -r; dx <= r; dx++) { var mx = pcx + dx, mz = pcz + dz; if (inWorldC(mx, mz) && !meshedCols[mz * NC + mx] && columnReady(mx, mz)) meshColumn(mx, mz); }
  }
  var dropT = 0;
  var streamFlip = false;
  function streamTick(px, pz, dt) {
    var pcx = Math.floor(px / CS), pcz = Math.floor(pz / CS), t0, i, o, cx, cz;
    // 땅 만들기와 모양 만들기를 한 프레임에 같이 하지 않고 번갈아 한다(둘 다 하면 느린 폰에서 한 프레임이 100ms를 넘음)
    function genPass() {
      var did = false; t0 = performance.now();
      for (i = 0; i < OFFS.length; i++) {
        o = OFFS[i]; if (o[2] > R_GEN * R_GEN) break;
        cx = pcx + o[0]; cz = pcz + o[1];
        if (inWorldC(cx, cz) && !COLS[cz * NC + cx]) { newColumn(cx, cz); did = true; if (performance.now() - t0 > 6) break; }
      }
      return did;
    }
    function meshPass() {
      var did = false; t0 = performance.now();
      for (i = 0; i < OFFS.length; i++) {
        o = OFFS[i]; if (o[2] > R_MESH * R_MESH) break;
        cx = pcx + o[0]; cz = pcz + o[1];
        if (inWorldC(cx, cz) && !meshedCols[cz * NC + cx] && COLS[cz * NC + cx] && columnReady(cx, cz)) { meshStep(cx, cz); did = true; if (performance.now() - t0 > 7) break; }
      }
      return did;
    }
    streamFlip = !streamFlip;
    var didGen = streamFlip ? genPass() : false;
    var didMesh = didGen ? false : meshPass();
    if (!streamFlip && !didMesh) genPass();
    dropT -= dt;
    if (dropT <= 0) {
      dropT = 1;
      for (var k = 0; k < NC * NC; k++) {
        if (!COLS[k] && !meshedCols[k]) continue;
        var kx = k % NC, kz = (k - kx) / NC, d2 = (kx - pcx) * (kx - pcx) + (kz - pcz) * (kz - pcz);
        if ((meshedCols[k] || meshProg[k]) && d2 > (R_MESH + 2) * (R_MESH + 2)) unmeshColumn(kx, kz);
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
    animals = animals.filter(function (a) { var ok = a.saddled || a.kept || (a.x - px) * (a.x - px) + (a.z - pz) * (a.z - pz) < far; if (!ok) scene.remove(a.mesh); return ok; });
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
  // 무기(칼·성령의 검): 손에 들면 크게, 3인칭·친구 화면에서도 손에 쥔 모습
  function isWeapon(id) { return id === SWORD || isTool(id); }   // 칼·검과 곡괭이·도끼·삽: 손에 든 모습을 크게
  function heldWeapon() { var id = HOTBAR[sel]; return id && have(id) > 0 && isWeapon(id) ? id : 0; }
  function heldShown() { var id = HOTBAR[sel]; return id && B[id] && have(id) > 0 ? id : 0; }   // 다른 사람에게 보이는 손에 든 것(블록·물건 포함)
  function handItem(av, id) {
    var pr = av && av.userData; if (!pr || !pr.armR) return;
    if (pr.hand) { pr.armR.remove(pr.hand); pr.hand.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); pr.hand = null; }
    if (!id) return;
    if (!isWeapon(id)) {   // 블록·물건: 손에 작게 쥔 모습(그림은 새로 만들어 지울 때 함께 지움)
      dropMats();
      var flat = isFlat(id), hm = new THREE.Mesh(flat ? itemGeometry(id) : blockGeometry(id), flat ? dropMatF : dropMatB), hu = HT / 32, hg = new THREE.Group();
      hm.scale.setScalar(flat ? 0.55 : 0.36); hg.add(hm);
      hg.position.set(0, -13 * hu, -1.6 * hu);
      pr.armR.add(hg); pr.hand = hg; pr.handId = id;
      return;
    }
    // 입체로: 손잡이·가로대·칼날(어느 쪽에서 봐도 보이게). 칼날은 앞쪽으로 조금 들어 올림
    var u = HT / 32, g = new THREE.Group(), big = id === SWORD, type = big ? 'sword' : TOOL_TYPES[typeOf(id)];
    var mat = big ? 0xe8eef5 : [0xa77a48, 0x8f8f8b, 0xc8743a, 0xd2d6db, 0x6ff0e6][tierOf(id)], wood = 0x7a5430;
    function bx(w, h, d, hex, y, x) { var m = shadedBox(w * u, h * u, d * u, hex); m.position.set((x || 0) * u, y * u, 0); g.add(m); }
    if (type === 'sword' || type === 'knife') {
      var len = big ? 13 : 8;
      bx(1.4, 3.6, 1.4, 0x6a4628, 0); bx(big ? 5.5 : 3.2, 1, 1.6, big ? 0xf0c840 : 0x5a3a1e, 2.2); bx(big ? 1.8 : 1.4, len, 0.6, mat, 2.7 + len / 2); bx(big ? 1 : 0.8, 1.4, 0.6, mat, 3.3 + len);
      if (big) bx(0.5, len - 1, 0.7, 0xb8c4d0, 2.7 + len / 2);   // 가운데 홈
    } else {
      bx(1.2, 13, 1.2, wood, 4.5);   // 자루
      if (type === 'pick') { bx(13, 2.4, 2.2, mat, 11.2); bx(2, 2, 2, mat, 9.8, -6.6); bx(2, 2, 2, mat, 9.8, 6.6); }   // 곡괭이 머리(양쪽 뾰족)
      else if (type === 'axe') { bx(6, 6.4, 1.2, mat, 9.4, 3.2); bx(1.2, 7, 1.4, mat, 9.4, 6.4); }   // 도끼날(한쪽)
      else if (type === 'shovel') { bx(5, 6, 0.8, mat, 13.4); bx(3.2, 1.4, 0.8, mat, 17); }   // 삽날(끝)
    }
    g.position.set(0, -12.5 * u, -0.6 * u); g.rotation.x = -Math.PI / 2 + (type === 'sword' || type === 'knife' ? 0.45 : 0.75);
    pr.armR.add(g); pr.hand = g; pr.handId = id;
  }
  function setHeld(id) {
    var wpn = isWeapon(id);
    heldMesh.userData.weapon = wpn; heldMesh.scale.set(wpn ? -(id === SWORD ? 0.72 : 0.62) : (isItem(id) ? 0.5 : 0.34), wpn ? (id === SWORD ? 0.72 : 0.62) : (isItem(id) ? 0.5 : 0.34), isItem(id) ? 0.5 : 0.34);
    heldMesh.material.side = wpn ? THREE.DoubleSide : THREE.FrontSide;
    if (avatar) handItem(avatar, heldShown() === id ? id : 0);
    if (heldMesh.geometry) heldMesh.geometry.dispose(); if (!id) { heldMesh.geometry = new THREE.BufferGeometry(); return; } heldMesh.geometry =isItem(id) || id === TORCH ? itemGeometry(id) : blockGeometry(id); heldMesh.material.alphaTest = isItem(id) || id === TORCH ? 0.5 : 0; heldMesh.material.needsUpdate = true; }
  function init() {
    canvasEl = $('game');
    if (isTouch) document.body.classList.add('touch');
    document.body.classList.toggle('keysoff', !!S.keysOff);
    buildTiles();
    for (var id = 1; id < B.length; id++) if (B[id]) BT[id] = [TILE[B[id][1]], TILE[B[id][2]], TILE[B[id][3]]];
    makeIcons();

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: !isTouch, powerPreference: 'high-performance' });
    } catch (e) {
      $('loadingBar').hidden = true;
      $('loadingStatus').textContent = '3D 화면을 열 수 없어요. 브라우저를 다시 열거나 다른 브라우저로 접속해 보세요.';
      return;
    }
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
    slabGhost = new THREE.Mesh(new THREE.BoxGeometry(.996, .494, .996),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: .45, depthWrite: false }));
    slabGhost.visible = false; slabGhost.renderOrder = 4; scene.add(slabGhost);
    createBlueprintMesh();
    for (var st = 1; st <= 8; st++) (function (t) { crackGeo.push(cubeGeometry(function () { return t; }, false)); })(TILE['crack' + st]);
    crackMesh = new THREE.Mesh(crackGeo[0], new THREE.MeshBasicMaterial({ map: atlasTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    crackMesh.scale.setScalar(1.004); crackMesh.visible = false; crackMesh.renderOrder = 3; scene.add(crackMesh);
    heldMesh = new THREE.Mesh(HOTBAR[0] ? blockGeometry(HOTBAR[0]) : new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, depthTest: false, depthWrite: false, transparent: true }));
    lightPatch(heldMesh.material); heldMesh.renderOrder = 10; heldMesh.scale.setScalar(0.34); camera.add(heldMesh);
    refreshMyAvatar(); avatar.visible = false;
    makeSky(); makeRainbow(); makeBethlehemStar();
    cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, fog: false });
    for (var c = 0; c < 26; c++) {
      var cl = new THREE.Mesh(new THREE.BoxGeometry(20 + rnd(c) * 30, 3, 12 + rnd(c + 5) * 16), cloudMat);
      cl.position.set(XM + rnd(c + 11) * 600 - 300, G + 82 + rnd(c + 3) * 10, AZ0 + rnd(c + 17) * 600 - 300); scene.add(cl); clouds.push(cl);
    }

    bindInput(canvasEl); bindUI(); renderHotbar();
    window.addEventListener('resize', queueGameResize);
    if (window.screen.orientation && window.screen.orientation.addEventListener) {
      window.screen.orientation.addEventListener('change', queueGameResize);
    } else {
      window.addEventListener('orientationchange', queueGameResize);
    }
    if (window.ResizeObserver) new ResizeObserver(queueGameResize).observe(canvasEl);
    applyLightMode();
    fitMobileKeyboard();

    loadOnline().then(function () {
      ensureAround(XM, AZ0 + 60, 3);
      spawnBirds(); renderQuest();
      renderHotbar(); setSel(0, true);
      $('loading').style.display = 'none';
      $('tWho').textContent = me ? (myPlot >= 0 ? '로그인됨 · 내 땅 ' + (myPlot + 1) + '번' : '로그인됨') : '구경 모드 · 로그인하면 내 땅과 가방이 저장돼요';
      showUI('title');
      var last = performance.now(), orbit = 0, mapT = 0, npcT = 0;
      (function loop(now) {
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        fpsWatch(now);
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
        if (started) { updateMobileBuild(now); updateFrontierTools(now); tickBlueprint(now); }
        if (started) stepFrontier(now,dt);
        if (started) { stepVitals(dt); stepHerd(dt); stepMusic(dt); stepShadows(dt); storyTick(dt); partyTick(dt); npcT -= dt; if (npcT <= 0) { npcT = 1; spawnNpcs(); refreshSigns(); refreshFrames(); tickParked(); newsTick(); checkHome(); refreshPlotSigns(); spawnZoneSigns(); } }
        if (started) {
          updateDay(dt); updateAmbient(dt);
          if (ui === 'play' || ui === 'map') {
            mapT -= dt;
            if (mapT <= 0) {
              mapT = 0.25;
              if (ui === 'play') drawMap($('mapc'), false);
              else drawMap($('bigmapc'), true);
            }
          }
        }
        streamTick(camera.position.x, camera.position.z, dt); mapTick();
        stepBits(dt); stepFx(dt); stepDrops(dt); stepSDrops(dt); stepFalls(dt); stepCreatures(dt, now / 1000); netTick(dt, now);
        if (forestRoute && ui === 'play') renderForestRoute();
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      })(last);
      setInterval(function () {
        if (!started) return;
        $('place').textContent=placeName(); regionTick();
        renderMaterialGuide();
        if(((ui==='villageWork'&&(villageTab==='projects'||villageTab==='neighbors'))||(villageProjectsEnabled&&inCommons(P.x,P.z)))&&Date.now()>villageProjectAt){villageProjectAt=Date.now()+6000;fetchVillageProjects();}
        $('seasonInfo').textContent=(FESTIVE?'🌟 성탄 절기 · ':'')+WEATHER[seasonIndex()]+(rainOn?(snowNow?' · 눈':' · 비'):'')+
          (HOTBAR[sel]===COMPASS?' · '+headingName():'');
        fetchFeed(); fetchGifts();
        if (!hintT0) hintT0 = performance.now();
        // 세로 화면: 장소 글자를 안내 상자(접었으면 위쪽 버튼 줄) 바로 아래로
        var inf = $('info');
        if (inf) { if (isTouch && innerHeight > innerWidth) { var qe = $('quest'), qr = qe && getComputedStyle(qe).display !== 'none' ? qe.getBoundingClientRect() : null, tr = $('topRight').getBoundingClientRect(); inf.style.top = Math.round(Math.max(qr && qr.height ? qr.bottom : 0, tr.bottom) + 6) + 'px'; } else if (inf.style.top) inf.style.top = ''; }
        if (tutorialStep >= 9 || performance.now() - hintT0 > 60000) document.body.classList.add('nohint');
      },300);
    });
  }
  function teleport(x, y, z, yaw, keepGuide) {
    clearFurnitureRest();
    clearFrontierLift();
    if (!keepGuide) cancelForestRoute();
    if(ferryRide){ferryRide=null;ferryMesh.visible=false;}
    if (cartRide) leaveCart(true);
    if (riding) dismount(true);
    ensureAround(x, z, 2);
    P.x = x; P.z = z; P.y = y; P.vy = 0; P.vx = P.vz = 0; fallTop = null;
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    if (yaw !== undefined) P.yaw = yaw; P.pitch = -0.12; P.camY = 0;
  }
  function goHome() {
    if (myPlot < 0) { toast(me ? '내 땅을 받는 중이에요' : '로그인하면 내 땅을 받을 수 있어요'); return; }
    var o = plotOrigin(myPlot); teleport(o.x + OLD_PLOT / 2, G, o.z - 2, Math.PI); tutorialEvent('home'); toast('내 땅(' + (myPlot + 1) + '번)이에요. 모은 블록으로 지어 보세요!');
  }
  var gameResizeFrame = 0;
  function queueGameResize() {
    if (gameResizeFrame) return;
    gameResizeFrame = requestAnimationFrame(function () {
      gameResizeFrame = 0;
      resize();
      fitMobileKeyboard();
    });
  }
  function resize() {
    var w = canvasEl.clientWidth, h = canvasEl.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  // 화면 품질 자동 조절(11/20): 휴대폰이 버벅이면(4초씩 두 번 연속 초당 24장 아래) 「가벼운 화면」을 켬. 메뉴에서 끄면 다시는 자동으로 켜지 않음
  var fpsW = { t0: 0, n: 0, low: 0 }, perfAcc = { sum: 0, n: 0, low: 999, next: 0 };   // perfAcc: 실제 폰 버벅임 기록(1분 평균, 10분에 한 번 서버로)
  function fpsWatch(now) {
    if (!started || ui !== 'play' || document.hidden) { fpsW.t0 = 0; return; }
    if (!fpsW.t0) { fpsW.t0 = now; fpsW.n = 0; return; }
    fpsW.n++;
    if (now - fpsW.t0 < 4000) return;
    var fps = fpsW.n * 1000 / (now - fpsW.t0); fpsW.t0 = now; fpsW.n = 0; fpsW.last = fps;
    perfAcc.sum += fps; perfAcc.n++; perfAcc.low = Math.min(perfAcc.low, fps);
    if (perfAcc.n >= 15) {
      if (client && me && me.id !== 'test' && now > perfAcc.next) { perfAcc.next = now + 600000; client.rpc('log_ark_perf', { p_avg: Math.round(perfAcc.sum / perfAcc.n * 10) / 10, p_low: Math.round(perfAcc.low * 10) / 10, p_light: !!S.lightMode, p_w: innerWidth, p_h: innerHeight, p_dpr: window.devicePixelRatio || 1, p_ua: navigator.userAgent }).then(function () {}, function () {}); }
      perfAcc.sum = 0; perfAcc.n = 0; perfAcc.low = 999;
    }
    fpsW.low = fps < 24 ? fpsW.low + 1 : 0;
    if (fpsW.low >= 2 && !S.lightMode && S.autoLight !== false) {
      S.lightMode = true; S.autoLit = true; applyLightMode(); saveSettings(); updateMenuLabels(); fpsW.low = 0;
      toast('📱 화면이 버벅여서 「가벼운 화면」으로 바꿨어요 — 메뉴에서 다시 끌 수 있어요');
    }
  }
  var fwd = new THREE.Vector3(), lastX = 0, lastZ = 0;
  function step(dt) {
    if(ferryRide){stepFerry(dt);return;}
    if(cartRide){stepCart(dt);return;}
    if(frontierLift){moveFrontierLift(dt);placeCamera(dt,0);return;}
    if (furnitureRest) {
      var rest = furnitureRest;
      if (get(rest.x, rest.y, rest.z) !== rest.id || jumpHeld || joy.x || joy.y ||
          keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.ArrowUp || keys.ArrowLeft || keys.ArrowDown || keys.ArrowRight ||
          keys.ShiftLeft || keys.ShiftRight) {
        standFromFurniture();
      }
      placeCamera(dt, 0);
      return;
    }
    var mx = 0, mz = 0;
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
    mx += joy.x; mz += joy.y;
    var len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    P.swim = !P.fly && inWater();
    P.ladder = !P.fly && onLadder();
    P.sneak = !P.fly && !riding && !P.swim && (keys.ShiftLeft || keys.ShiftRight || sneakLock);
    P.sprint = !P.swim && !P.sneak && (keys.ControlLeft || keys.KeyR || runLock) && mz < -0.3 && (FOOD > 6 || !vitalsOn());
    if (!P.sprint && (keys.ControlLeft || runLock) && mz < -0.3 && FOOD <= 6 && vitalsOn() && !sprintTold) { sprintTold = true; toast('기운이 없어서 달릴 수 없어요 — 떡이나 무화과를 먹어요'); }
    // 걷기 8.5→6.5칸/초(11/19 전도사님 「이동하는 속도가 너무 빨라」), 달리기는 1.5배
    var sp = (P.fly ? 20 : (P.swim ? (has('moses') ? 8 : 5) : (riding ? riding.sp.ride : 6.5 * (has('enoch') ? 1.1 : 1)))) * (P.sprint && !riding ? 1.5 : 1) * (P.sneak ? 0.35 : 1);
    document.body.classList.toggle('sneaking', !!P.sneak);
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
      if (jumpHeld || keys.Space || mz < -0.2) P.vy = has('jacob') ? 11 : 5.5;
      else if (flyDown || keys.ShiftLeft) P.vy = 0;
      else { P.vy -= 50 * dt; if (P.vy < -3.5) P.vy = -3.5; }
    } else {
      P.vy -= 50 * dt; if (P.vy < -60) P.vy = -60;
      if (jumpHeld && P.ground) { P.vy = riding ? riding.sp.jump : 15.2; exhaust(P.sprint ? 0.2 : 0.05); }
    }
    lastX = P.x; lastZ = P.z;
    moveAxis(0, P.vx * dt); moveAxis(2, P.vz * dt);
    var hitY = moveAxis(1, P.vy * dt);
    P.ground = false;
    if (hitY) { if (P.vy < 0) P.ground = true; P.vy = 0; }
    else if (!P.fly && collides(P.x, P.y - 0.02, P.z)) P.ground = true;
    if (P.ground) P.groundAt = performance.now();
    if (P.y < -10) teleport(P.x, surfaceY(P.x | 0, P.z | 0), P.z);
    P.x = clamp(P.x, 40, WS - 40); P.z = clamp(P.z, 40, WS - 40);
    var moved = Math.hypot(P.x - lastX, P.z - lastZ);
    if (len > 0 && moved > 0.03 && moved < 2) tutorialEvent('walk');
    if (tutorialStep === 5 && tutorialDoor && Math.floor(P.x) === tutorialDoor.x && Math.floor(P.z) === tutorialDoor.z &&
        P.y >= tutorialDoor.y - 0.1 && P.y < tutorialDoor.top) {
      var door = SHAPE[get(tutorialDoor.x, tutorialDoor.y, tutorialDoor.z)];
      if (door && door.type === 'door' && door.open) tutorialEvent('door');
    }
    if (riding) stepRide(dt, moved);
    // 떨어짐: 사람 키(3.4칸)의 두 배 넘게 떨어지면 아픔(물·사닥다리·말 위·날기는 괜찮음)
    if (P.fly || P.swim || P.ladder || riding) fallTop = null;
    else if (!P.ground) { if (fallTop === null || P.y > fallTop) fallTop = P.y; }
    else if (fallTop !== null) { var fd = fallTop - P.y; fallTop = null; if (fd > 8) hurt(Math.floor((fd - 8) / 2) + 1, '높은 곳에서 떨어졌어요'); }
    if (P.ground && !riding) exhaust(moved * (P.sprint ? 0.03 : 0.004));
    storyStep(dt, moved);
    if (P.ground) { P.walk += moved * 0.55; P.stepAcc += moved; if (P.stepAcc > 2.6) { P.stepAcc = 0; var fx0 = Math.floor(P.x), fz0 = Math.floor(P.z), feet = get(fx0, Math.floor(P.y + 0.1), fz0); stepSound(feet === WATER ? WATER : get(fx0, Math.floor(P.y - 0.1), fz0)); } }
    else P.walk += moved * 0.2;
    P.camY += (0 - P.camY) * Math.min(1, 12 * dt);
    placeCamera(dt, moved / Math.max(dt, 1e-4));
  }
  var bobAmp = 0;
  function placeCamera(dt, speed) {
    speed = speed || 0;
    var ex = P.x, ey = P.y + (riding ? riding.sp.seat + 1.85 : EYE) + P.camY - (P.sneak ? 0.45 : 0), ez = P.z;
    fwd.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
    var targetFov = P.sprint ? 78 : 70;
    if (Math.abs(camera.fov - targetFov) > 0.05) { camera.fov += (targetFov - camera.fov) * Math.min(1, 8 * dt); camera.updateProjectionMatrix(); }
    bobAmp += ((P.ground && speed > 1 ? 1 : 0) - bobAmp) * Math.min(1, 8 * dt);
    swingT = Math.max(0, swingT - dt);
    var sw = Math.sin((swingT / 0.25) * Math.PI);
    if (furnitureRest) ey = P.y + (furnitureRest.pose === 'lie' ? .35 : .85);
    if (S.view === 0 && !furnitureRest) {
      camDist = 0;
      var bob = Math.sin(P.walk * 2) * 0.07 * bobAmp, sway = Math.cos(P.walk) * 0.05 * bobAmp;
      camera.position.set(ex + Math.cos(P.yaw) * sway, ey + Math.abs(bob), ez - Math.sin(P.yaw) * sway);
      camera.lookAt(camera.position.x + fwd.x, camera.position.y + fwd.y, camera.position.z + fwd.z);
      avatar.visible = false; heldMesh.visible = true;
      if (heldMesh.userData.weapon) {   // 칼·검: 오른쪽 아래에서 위로 비스듬히 세워 들고, 휘두르면 내려침
        heldMesh.position.set(0.48 + Math.cos(P.walk) * 0.02 * bobAmp, -0.38 + Math.abs(Math.sin(P.walk * 2)) * 0.025 * bobAmp - sw * 0.1, -0.8 - sw * 0.12);
        heldMesh.rotation.set(-0.15 - sw * 0.5, 0.35, sw * 1.1);
      } else {
        heldMesh.position.set(0.52 + Math.cos(P.walk) * 0.02 * bobAmp, -0.46 + Math.abs(Math.sin(P.walk * 2)) * 0.025 * bobAmp - sw * 0.12, -0.82 - sw * 0.1);
        heldMesh.rotation.set(0.1 - sw * 0.6, 0.72, 0);
      }
    } else {
      var dir = furnitureRest || S.view === 1 ? -1 : 1;
      var want = furnitureRest ? 5.4 : 8.5, d = 0.6;
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
      avatar.rotation.set(0, P.yaw, 0, 'YXZ');
      var pr = avatar.userData, swing = riding ? 0 : Math.sin(P.walk * 1.6) * 0.75 * bobAmp;
      pr.legL.rotation.x = swing; pr.legR.rotation.x = -swing;
      pr.legL.rotation.z = riding ? -0.45 : 0; pr.legR.rotation.z = riding ? 0.45 : 0;   // 걸터앉기
      var waving = performance.now() < waveUntil;
      pr.armL.rotation.x = -swing * 0.8; pr.armR.rotation.x = waving ? -2.7 : swing * 0.8 - sw * 1.2;
      pr.armR.rotation.z = waving ? Math.sin(performance.now() / 110) * 0.45 : 0;
      pr.head.rotation.x = P.pitch * 0.7;
      if (furnitureRest) poseFurnitureAvatar(avatar, furnitureRest.pose, P.x, P.y, P.z, furnitureRest.yaw);
    }
    // 물속이면 화면을 푸르게
    var under = get(Math.floor(camera.position.x), Math.floor(camera.position.y), Math.floor(camera.position.z)) === WATER;
    document.body.classList.toggle('underwater', under && started);
  }

  // ════════ 2026-11-18 생존·농사·기르기·침대·레버·업적·함께 짓는 터·마을 사람·음악·이어 하기 ════════
  // ── 체력(♥ 20)·기운(◆ 20, 배고픔)·숨 — 관리자는 안 닳음. 쓰러져도 가진 것은 그대로 ──
  var HP = 20, FOOD = 20, AIRV = 10, EXH = 0, regenT = 0, starveT = 0, drownT = 0, fallTop = null, SPAWN = null, vitT = 0;
  var FOODS = {}; FOODS[BREAD] = 6; FOODS[FIG] = 3; FOODS[MANNA] = 4;
  [[613,3],[614,2],[616,2],[617,4],[618,1],[619,2],[620,1],[622,4],
   [HONEY,3],[POMEGRANATE,4],[STEW,7],[COOKED_FISH,6],[COOKED_LAMB,8],[FLATBREAD,4]]
    .forEach(function(d){FOODS[d[0]]=d[1];});
  function vitalsOn() { return started && !isAdm(); }
  // ── 믿음(✦, 11/20): 어둠의 그림자에게 맞으면 깎이고(입은 방패가 불화살을 막음, 파티원이 곁에 있으면 덜 깎임 — 전 4:12), 다 깨지면 「유혹에 넘어졌어요」 → 집에서 다시 일어남(눅 15:20).
  //    잠시 맞지 않으면 조금씩, 말씀 두루마리를 읽거나 제단에서 기도하면 다 채워짐 ──
  var FAITH = 20, faithHitT = 0, faithRegT = 0, faithTold = false, cordTold = false;
  function matesNear() {   // 12칸 안에 있는 파티원 수
    if (!inParty() || !NET.on) return 0; var n = 0, now = performance.now();
    for (var u in NET.peers) { var p = NET.peers[u]; if (partyMate(u) && now - p.t < 6000 && Math.hypot(p.tx - P.x, p.tz - P.z) < 12) n++; }
    return n;
  }
  function hurtFaith(n, who) {
    if (!vitalsOn() || n <= 0) return;
    var mates = matesNear();
    if (mates) { n = Math.max(1, Math.round(n * (mates >= 2 ? 0.6 : 0.75))); if (!cordTold) { cordTold = true; setTimeout(function () { showVerseCard('🤝', '세 겹 줄', '한 사람이면 패하겠거니와 두 사람이면 맞설 수 있나니 세 겹 줄은 쉽게 끊어지지 아니하느니라', '전도서 4:12', '파티원이 곁에 있으면 그림자에게 덜 흔들리고 믿음이 더 빨리 차요'); }, 300); } }
    FAITH = Math.max(0, FAITH - n); faithHitT = performance.now(); renderVitals(); stateDirty(); newsMark('faith');
    document.body.classList.add('hurt'); setTimeout(function () { document.body.classList.remove('hurt'); }, 260); sfx('break', 200); vibrate('faith');
    if (!faithTold && FAITH > 0) { faithTold = true; toast('✦ 믿음이 흔들렸어요 — 다 사라지기 전에 물리치거나 마을·불빛 곁으로 피해요. 방패를 차면 불화살을 막아요 (엡 6:16)'); }
    if (FAITH <= 0) fallTemptation(who);
  }
  function fallTemptation(who) {
    FAITH = 20; faithHitT = 0;
    SHADOWS.forEach(function (s) { s.dead = true; }); clearFireArrows();
    document.body.classList.add('faint'); setTimeout(function () { document.body.classList.remove('faint'); }, 1400);
    respawn(); renderVitals(); stateDirty();
    showVerseCard('🏠', '집으로 돌아왔어요', '이에 일어나서 아버지께로 돌아가니라 아직도 거리가 먼데 아버지가 그를 보고 측은히 여겨 달려가 목을 안고 입을 맞추니', '누가복음 15:20', (who || '어둠의 그림자') + '의 유혹에 넘어졌어요. ' + (SPAWN ? '침대' : '내 자리') + '에서 다시 일어났고 믿음도 다시 채워졌어요 (가진 것은 그대로예요)');
  }
  function refillFaith() { if (vitalsOn() && FAITH < 20) { FAITH = 20; renderVitals(); stateDirty(); setTimeout(function () { toast('✦ 믿음이 다시 채워졌어요'); }, 400); } }
  function exhaust(v) { if (!vitalsOn()) return; EXH += v * (has('abraham') ? 0.7 : 1); while (EXH >= 4) { EXH -= 4; if (FOOD > 0) { FOOD--; renderVitals(); stateDirty(); } } }
  function hurt(n, why) {
    if (!vitalsOn() || n <= 0) return;
    HP = Math.max(0, HP - n); renderVitals(); stateDirty();
    document.body.classList.add('hurt'); setTimeout(function () { document.body.classList.remove('hurt'); }, 260); sfx('break', 260); vibrate('hurt');
    if (HP <= 0) faint(why);
  }
  function faint(why) {
    HP = 20; FOOD = Math.max(FOOD, 12); AIRV = 10; fallTop = null;
    document.body.classList.add('faint'); setTimeout(function () { document.body.classList.remove('faint'); }, 1400);
    respawn(); renderVitals(); stateDirty();
    toast('쓰러졌어요 — ' + why + '. ' + (SPAWN ? '침대에서' : '처음 자리에서') + ' 다시 일어났어요 (가진 것은 그대로예요)');
  }
  function respawn() {
    if (riding) dismount(true);
    if (SPAWN) teleport(SPAWN.x + 0.5, SPAWN.y, SPAWN.z + 0.5);
    else if (myPlot >= 0) { var o = plotOrigin(myPlot); teleport(o.x + OLD_PLOT / 2, G, o.z - 2, Math.PI); }
    else teleport(XM + 0.5, G, PZ0 - 9, Math.PI);
  }
  function stepVitals(dt) {
    if (!vitalsOn()) { if ($('vitals').innerHTML) $('vitals').innerHTML = ''; return; }
    var headWater = get(Math.floor(P.x), Math.floor(P.y + EYE + P.camY), Math.floor(P.z)) === WATER;
    if (headWater) { AIRV -= dt; if (AIRV <= 0) { AIRV = 0; drownT -= dt; if (drownT <= 0) { drownT = 1; hurt(2, '물속에서 숨이 막혔어요'); } } }
    else AIRV = Math.min(10, AIRV + dt * 4);
    if (headWater && has('noah')) AIRV += dt * 0.5;   // 노아의 증표: 숨을 두 배 오래
    regenT += dt;
    if (FOOD >= 16 && HP < 20 && regenT > (has('abel') ? 2 : 4)) { regenT = 0; HP++; exhaust(1.2); renderVitals(); }
    if (FOOD === 0) { starveT += dt; if (starveT > 8) { starveT = 0; if (HP > 2) hurt(1, '배가 고파요'); } } else starveT = 0;
    if (FAITH < 20 && performance.now() - faithHitT > 6000 && !SHADOWS.some(function (s) { return !s.dead && Math.hypot(s.x - P.x, s.z - P.z) < 12; })) { faithRegT += dt; if (faithRegT > (matesNear() ? 2 : 3)) { faithRegT = 0; FAITH++; renderVitals(); } } else faithRegT = 0;
    vitT -= dt; if (vitT <= 0) { vitT = 0.25; renderVitals(headWater || AIRV < 10); }
  }
  var vitKey = '';
  function renderVitals(showAir) {
    var el = $('vitals'); if (!vitalsOn()) { el.innerHTML = ''; return; }
    var air = showAir === undefined ? AIRV < 10 : showAir, shield = FAITH < 20 || SHADOWS.some(function (s) { return !s.dead; }), key = HP + ',' + FOOD + ',' + (air ? Math.ceil(AIRV) : -1) + ',' + (shield ? FAITH : -1);
    if (key === vitKey) return; vitKey = key;
    function row(n, full, half, empty, cls) { var h = ''; for (var i = 0; i < 10; i++) { var v = n - i * 2; h += '<b class="' + cls + (v >= 2 ? '' : (v === 1 ? ' half' : ' off')) + '">' + (v >= 2 ? full : (v === 1 ? half : empty)) + '</b>'; } return h; }
    el.innerHTML = (shield ? '<span class="sh" title="믿음">' + row(FAITH, '✦', '✦', '✧', 's') + '</span>' : '') + '<span class="hp" title="체력">' + row(HP, '♥', '♥', '♥', 'h') + '</span>' + (air ? '<span class="air" title="숨">' + row(Math.ceil(AIRV) * 2, '●', '●', '○', 'a') + '</span>' : '') + '<span class="fd" title="기운(배고픔)">' + row(FOOD, '◆', '◆', '◇', 'f') + '</span>';
  }
  function eatItem(id) {
    if (!vitalsOn()) return deny('관리자는 배고프지 않아요');
    if (FOOD >= 20) return deny('배가 불러요');
    if (have(id) < 1) return;
    take(id, 1); FOOD = Math.min(20, FOOD + FOODS[id]); EXH = 0; sfx('pop', 600); bagChanged(); renderVitals(); stateDirty(); unlock('eat');
    toast(jo(B[id][0], '을', '를') + ' 먹었어요 — 기운 +' + FOODS[id] + (id === BREAD ? ' (마 4:4)' : ''));
  }
  // ── 농사: 풀·꽃을 캐면 가끔 밀 씨 → 흙·풀 위에 심으면 싹 → 자람 → 이삭 → 익음(물이 가까우면 빨리) ──
  var CROPS = [];
  try { CROPS = JSON.parse(localStorage.getItem('arkVillage.crops') || '[]') || []; } catch (e) { CROPS = []; }
  function saveCrops() { try { localStorage.setItem('arkVillage.crops', JSON.stringify(CROPS)); } catch (e) {} stateDirty(); }
  function isCrop(id) { return id >= CROP0 && id < CROP0 + 4 || !!FARM_PLANTS[id]; }
  function cropTime(x, y, z) {
    var wet = false;
    for (var dz = -4; dz <= 4 && !wet; dz++) for (var dx = -4; dx <= 4; dx++) if (get(x + dx, y - 1, z + dz) === WATER || get(x + dx, y - 2, z + dz) === WATER) { wet = true; break; }
    var watered = wet || ditchWaterNear(x,y,z), sk = [0.8, 1, 0.7, watered ? 1 : 1.5][seasonIndex()];   // 이른 비·맑은 철·늦은 비·가뭄
    return (40 + Math.random() * 30) * (watered ? 0.6 : 1) * sk * 1000;
  }
  function plantHeight(id) { var farm = FARM_PLANTS[id]; return farm ? 1 + (farm.height-1)*(id-farm.base)/3 : 1; }
  var STATION_BITS = {401:1,402:2,403:4,404:8,405:1,461:16};
  var workshopCache = { x:null,y:null,z:null,until:0, mask:0 };
  function workshopNeeds() {
    var x=Math.floor(P.x), y=Math.floor(P.y), z=Math.floor(P.z), now=performance.now();
    if(x===workshopCache.x&&y===workshopCache.y&&z===workshopCache.z&&now<workshopCache.until) return workshopCache.mask;
    var mask=0;
    for(var dz=-4;dz<=4;dz++) for(var dx=-4;dx<=4;dx++) for(var dy=-2;dy<=3;dy++)
      mask |= STATION_BITS[get(x+dx,y+dy,z+dz)]||0;
    workshopCache={x:x,y:y,z:z,until:now+250,mask:mask};
    return mask;
  }
  function drawWell(held) {
    var out=held===BUCKET?WATER_BUCKET:(held===WATER_JAR?FULL_JAR:0);
    if (!out || !have(held)) return deny('빈 양동이나 빈 물동이를 들고 우물을 눌러요. 두레박으로 물을 길어요');
    if (!give(out,1)) return bagFull();
    take(held,1);bagChanged();sfx('pop');toast('우물에서 물을 길었어요');
  }
  function pourWater(held,h) {
    if (!have(held)) return;
    var x=h.px,y=h.py,z=h.pz, why=canPlace(x,y,z,WATER);
    if (why) return deny(why);
    if (!inMyPlot(x,z) && !inCommons(x,z)) return deny('내 땅이나 함께 짓는 터에서 물을 부어요');
    if (get(x,y,z)!==AIR) return deny('물이 들어갈 빈 곳을 골라요');
    var empty=held===WATER_BUCKET?BUCKET:WATER_JAR;
    if (!give(empty,1)) return bagFull();
    take(held,1);setBlock(x,y,z,WATER);bagChanged();sfx('pop');
  }
  function tillGround(h) {
    var old=get(h.x,h.y,h.z), why=canPlace(h.x,h.y,h.z,FARM_SOIL);
    if (why) return deny(why);
    if ((old!==DIRT && old!==GRASS) || h.py!==h.y+1 || get(h.x,h.y+1,h.z)!==AIR) return deny('윗칸이 빈 흙이나 풀의 윗면을 갈아요');
    setBlock(h.x,h.y,h.z,FARM_SOIL); sfx('dig'); toast('밭을 갈았어요. 씨나 묘목을 심어 보세요');
  }
  function trackCrop(x,y,z,base,stage) {
    CROPS=CROPS.filter(function(c){return c.x!==x||c.y!==y||c.z!==z;});
    CROPS.push({x:x,y:y,z:z,s:stage,base:base,t:Date.now()+cropTime(x,y,z)}); saveCrops();
  }
  var fishing=null;
  function useFishing(item,dir) {
    if (!have(item)) return;
    var now=performance.now();
    if (fishing && fishing.item===item && now<fishing.ready) return deny('물고기가 물 때까지 기다려요');
    if (fishing && fishing.item===item && now<=fishing.until && Math.hypot(P.x-fishing.x,P.z-fishing.z)<5) {
      var count=item===FISH_NET ? 2 : 1;
      var caught=VILLAGE_FISH[fishing.region]||RAW_FISH;
      if (room(caught)<count) return bagFull();
      give(caught,count); bagChanged(); recordVillageFish(fishing.region,count); fishing=null; toast(nameOf(caught)+' '+count+'마리를 건졌어요'); return;
    }
    var origin=camera.position, water=false, fishRegion=null;
    for(var t=.25;t<=REACH+camDist+.5;t+=.25) {
      var x=origin.x+dir.x*t,y=origin.y+dir.y*t,z=origin.z+dir.z*t;
      var id=get(Math.floor(x),Math.floor(y),Math.floor(z));
      if(id===WATER&&Math.hypot(x-P.x,y-(P.y+EYE),z-P.z)<=REACH+.5){water=true;fishRegion=villageWaterRegion(x,z);break;}
      if(isSolid(id))break;
    }
    if (!water) return deny('가까운 물을 겨누고 눌러요');
    var line={item:item,x:P.x,z:P.z,region:fishRegion,ready:now+2200,until:now+8500}; fishing=line;
    toast(item===FISH_NET?'그물을 던졌어요':'낚싯줄을 던졌어요');
    setTimeout(function(){if(fishing===line&&ui==='play')toast('물고기가 왔어요! 다시 눌러 건져요');},2200);
  }
  function plantSeed(h, seedId) {
    seedId=seedId || SEED;
    var farm=FARM_SEEDS[seedId];
    var g = get(h.x, h.y, h.z);
    if (h.py !== h.y + 1 || h.px !== h.x || h.pz !== h.z) return deny('씨나 묘목은 땅의 윗면에 심어요');
    if (farm ? g!==FARM_SOIL : g!==GRASS && g!==DIRT && g!==FARM_SOIL)
      return deny(farm?'괭이로 갈아 놓은 밭에 심어요':'흙이나 풀 위에 심어요');
    if(farm&&farm.height>1) for(var dy=2;dy<=Math.ceil(farm.height);dy++)
      if(get(h.x,h.y+dy,h.z)!==AIR) return deny('묘목 위에 빈 공간을 만들어 주세요');
    if (get(h.x, h.y + 1, h.z) !== AIR) return deny('위가 비어 있어야 심을 수 있어요');
    var why = canPlace(h.x, h.y + 1, h.z, SAPLING); if (why) return deny(why);
    var base=farm?farm.base:CROP0;
    take(seedId,1);
    if(g===GRASS) setBlock(h.x,h.y,h.z,DIRT);
    setBlock(h.x,h.y+1,h.z,base); trackCrop(h.x,h.y+1,h.z,base,0);
    sfx('place', 1700); bagChanged(); swingT = 0.25;
    if (!plantTold) { plantTold = true; toast('심었어요. 물이 가까우면 더 빨리 자라요'); }
  }
  var plantTold = false;
  function stepCrops() {
    if (!CROPS.length || !started) return;
    var now = Date.now(), ch = false;
    CROPS = CROPS.filter(function (c) {
      if (!colAt(c.x, c.z)) return true;
      var id = get(c.x, c.y, c.z); if (!isCrop(id)) { ch = true; return false; }
      var base=c.base || CROP0, actual=FARM_PLANTS[id] ? FARM_PLANTS[id].base : CROP0;
      if (actual!==base) { ch=true; return false; }
      if (id-base<3 && now>=c.t) { c.s=id-base+1;c.t=now+cropTime(c.x,c.y,c.z);setBlock(c.x,c.y,c.z,base+c.s);ch=true; }
      return true;
    });
    if (ch) saveCrops();
  }
  setInterval(stepCrops,1000);
  // ── 동물 기르기: 밀을 들고 있으면 양·소·염소가 따라오고, 밀을 먹인 둘이 가까이 있으면 새끼가 태어남. 내 땅 안의 동물은 저장 ──
  var BREEDS = { sheep: 1, cow: 1, goat: 1 }, HERD = [];
  try { HERD = JSON.parse(localStorage.getItem('arkVillage.herd') || '[]') || []; } catch (e) { HERD = []; }
  var pendingHerd = HERD.slice(), herdT = 0;
  function feedAnimal(a) {
    var now = Date.now();
    if (a.baby) return deny('새끼는 아직 어려요');
    if (a.breedAt && now < a.breedAt) return deny('조금 쉬었다가 다시 먹여요');
    take(WHEAT, 1); bagChanged(); a.love = now + 30000; animalCall(a.kind); heartAt(a);
    var mate = animals.filter(function (b) { return b !== a && b.kind === a.kind && b.love > now && !b.baby && Math.hypot(b.x - a.x, b.z - a.z) < 10; })[0];
    if (mate) {
      var baby = makeBeast(a.kind, (a.x + mate.x) / 2, (a.z + mate.z) / 2); baby.baby = true; baby.growAt = now + 180000; baby.mesh.scale.setScalar(0.55); animals.push(baby);
      a.love = mate.love = 0; a.breedAt = mate.breedAt = now + 60000; heartAt(baby);
      toast('♥ 새끼가 태어났어요! 3분 지나면 다 자라요. 내 땅 안에 있으면 저장돼요'); unlock('breed'); saveHerd();
    } else toast('밀을 먹었어요 ♥ — 가까이 있는 같은 동물에게도 먹이면 새끼가 태어나요');
  }
  function heartAt(a) { var s = textSprite('♥', 'rgba(0,0,0,0)', '#ff5a7a', 0.9); s.position.set(a.x, a.y + 2.6, a.z); scene.add(s); var t0 = performance.now(); (function up() { var k = (performance.now() - t0) / 1400; if (k >= 1) { disposeSprite(s); return; } s.position.y += 0.02; s.material.opacity = 1 - k; requestAnimationFrame(up); })(); }
  function inMyPlot(x, z) { return myPlot >= 0 && plotAt(Math.floor(x), Math.floor(z)) === myPlot; }
  function saveHerd() {
    var a = animals.filter(function (x) { return BREEDS[x.kind] && inMyPlot(x.x, x.z); }).slice(0, 16).map(function (x) { return { k: x.kind, x: Math.round(x.x * 10) / 10, z: Math.round(x.z * 10) / 10, b: x.baby ? 1 : 0 }; });
    pendingHerd.forEach(function (o) { if (a.length < 16) a.push(o); });
    var had = HERD.length; HERD = a; try { localStorage.setItem('arkVillage.herd', JSON.stringify(HERD)); } catch (e) {} stateDirty();
    if (!had && HERD.length) questCheck();
  }
  var lostSheep=null, wordIndex=0, hornAt=0, slingAt=0;
  function verseSource(ref) {
    if(typeof BLESSING_POOL==='undefined') return null;
    return BLESSING_POOL.find(function(v){return v.ref===ref && !!v.text;})||null;
  }
  function showWordCard(prayer) {
    var rows=typeof BLESSING_POOL==='undefined'?[]:BLESSING_POOL.filter(function(v){
      return typeof v.text==='string' && /^(시편 23:1|로마서 8:28|빌립보서 4:13|이사야 41:10|요한복음 14:27)$/.test(v.ref);
    });
    var v=prayer ? verseSource('시편 23:1') : (rows.length ? rows[wordIndex++ % rows.length] : null);
    $('cardEmoji').textContent=prayer?'🕊':'📜'; $('cardName').textContent=prayer?'감사 기도':'말씀 두루마리';
    $('cardText').textContent=v?v.text:'말씀을 불러오는 중이에요. 조금 뒤에 다시 열어 주세요';
    $('cardRef').textContent=v?v.ref.replace(/ (\d+):(\d+)$/,' $1장 $2절')+' · 개역개정판, ⓒ 대한성서공회':'';
    $('cardNew').textContent=prayer?'예수님, 저를 돌보아 주셔서 감사해요. 아멘.':'말씀우물 구절 데이터';
    $('card').classList.add('show'); clearTimeout(cardT); cardT=setTimeout(function(){$('card').classList.remove('show');},14000);
    refillFaith();
  }
  function headingName() {
    return ['북쪽','서쪽','남쪽','동쪽'][((Math.round(P.yaw/(Math.PI/2))%4)+4)%4];
  }
  function callShofar() {
    var now=performance.now();if(now<hornAt)return;hornAt=now+3000;
    tone('triangle',205,186,0.34,0.15,4);
    setTimeout(function(){tone('triangle',181,156,0.47,0.13,4);},360);
    toast('쇼파르 소리가 마을에 울려요');
  }
  function slingPractice(hit) {
    if(!hit || get(hit.x,hit.y,hit.z)!==SLING_TARGET)return deny('연습 표적에 가운데 +를 맞추고 눌러요');
    var now=performance.now();if(now<slingAt)return;
    if(!have(ROUND_STONE))return deny('가방에서 매끄러운 돌을 준비해요');
    slingAt=now+600;take(ROUND_STONE,1);bagChanged();burst(hit.x,hit.y,hit.z,SLING_TARGET);sfx('pop');
    toast('연습 표적에 맞았어요');
  }
  function shepherdVisit(n) {
    if(lostSheep && animals.indexOf(lostSheep)<0)lostSheep=null;
    if(lostSheep) {
      if(lostSheep.found&&Math.hypot(lostSheep.x-n.x,lostSheep.z-n.z)<=7){
        scene.remove(lostSheep.mesh);
        animals.splice(animals.indexOf(lostSheep),1);
        lostSheep=null;
        toast('양이 목자 곁으로 돌아왔어요. 예수님은 잃은 양을 찾는 목자 이야기를 들려주셨어요 (누가복음 15장 4–7절)');
      }else toast(lostSheep.found?'지팡이를 든 채 양을 목자 곁까지 데려와요':'목장 바깥에서 양을 찾아 눌러요');
      return;
    }
    var offsets=[[20,14],[-20,14],[20,-14],[-20,-14]], point=null;
    for(var i=0;i<offsets.length;i++) {
      var x=n.x+offsets[i][0],z=n.z+offsets[i][1],y=groundAt(x,z,SY-3);
      if(colAt(x,z)&&y!==null&&get(Math.floor(x),Math.floor(y+1),Math.floor(z))!==WATER){point=[x,z];break;}
    }
    if(!point)return deny('목장 주변을 먼저 둘러본 뒤 목자와 다시 이야기해요');
    lostSheep=makeBeast('sheep',point[0],point[1]);animals.push(lostSheep);
    toast('목장 바깥 '+(point[0]>n.x?'동쪽':'서쪽')+'에서 길 잃은 양을 찾아 눌러요');
  }
  function stepHerd(dt) {
    var now=Date.now(), held=HOTBAR[sel], active=have(held)>0 && ui==='play';
    var lure=active&&held===WHEAT, staff=active&&held===STAFF;
    animals.forEach(function (a) {
      if (!BREEDS[a.kind]) return;
      if (a.baby && now > a.growAt) { a.baby = false; a.mesh.scale.setScalar(1); }
      a.kept = inMyPlot(a.x, a.z);
      if ((lure || (staff && a.kind==='sheep' && (a!==lostSheep || a.found))) && a !== riding) {
        var dx = P.x - a.x, dz = P.z - a.z, d = Math.hypot(dx, dz);
        if (d < 14 && d > 3) { a.h = Math.atan2(-dx, -dz); a.mode = 'walk'; a.t = 0.6; }
        else if (d <= 3 && a.mode === 'walk') { a.mode = 'idle'; a.t = 1; }
      }
    });
    if (pendingHerd.length) pendingHerd = pendingHerd.filter(function (o) {
      if (!colAt(o.x | 0, o.z | 0) || groundAt(o.x, o.z, SY - 3) === null) return true;
      var a = makeBeast(o.k, o.x, o.z); if (o.b) { a.baby = true; a.growAt = Date.now() + 120000; a.mesh.scale.setScalar(0.55); } a.kept = true; animals.push(a); return false;
    });
    herdT -= dt; if (herdT <= 0) { herdT = 5; if (myPlot >= 0 && !pendingHerd.length) saveHerd(); }
  }
  // 의자와 침대는 같은 자리 고정·일어나기 동작을 쓴다.
  var furnitureRest = null;
  function isNight() { var p = (dayT % DAY_LEN) / DAY_LEN; return p > 0.6 && p < 0.97; }
  function beginFurnitureRest(pose, x, y, z, id) {
    if (furnitureRest || riding || ferryRide || P.fly) return false;
    var facing = pose === 'sit' ? SHAPE[id].f : 2;
    var yaw = -facing * Math.PI / 2;
    var centerX = x + .5, centerZ = z + .5;
    var seatY = y + (pose === 'sit' ? CHAIR_SEAT : .56);
    furnitureRest = { pose:pose, x:x, y:y, z:z, id:id, yaw:yaw,
      standX:P.x, standY:P.y, standZ:P.z, standYaw:P.yaw, standPitch:P.pitch, standCamY:P.camY, timer:0 };
    resetInput();
    P.x = centerX; P.y = seatY; P.z = centerZ;
    P.vx = P.vy = P.vz = 0;
    P.yaw = yaw + Math.PI * .42; P.pitch = -.35; P.camY = 0;
    fallTop = null;
    $('restUp').hidden = false;
    toast(pose === 'sit' ? '의자에 앉았어요' : '침대에 누웠어요');
    return true;
  }
  function clearFurnitureRest() {
    if (!furnitureRest) return;
    clearTimeout(furnitureRest.timer);
    furnitureRest = null;
    document.body.classList.remove('sleep');
    $('restUp').hidden = true;
  }
  function standFromFurniture() {
    var rest = furnitureRest;
    if (!rest) return;
    resetInput();
    teleport(rest.standX, rest.standY, rest.standZ, rest.standYaw, true);
    P.pitch = rest.standPitch; P.camY = rest.standCamY;
  }
  function poseFurnitureAvatar(av, pose, x, y, z, yaw) {
    var parts = av.userData;
    av.rotation.set(pose === 'lie' ? Math.PI / 2 : 0, yaw, 0, 'YXZ');
    if (pose === 'lie') {
      var half = HT * .47;
      av.position.set(x - Math.sin(yaw) * half, y + HT * .13, z - Math.cos(yaw) * half);
    } else {
      av.position.set(x, y - HT * .375, z);
    }
    parts.legL.rotation.set(pose === 'sit' ? 1.06 : 0, 0, 0);
    parts.legR.rotation.copy(parts.legL.rotation);
    parts.armL.rotation.x = parts.armR.rotation.x = pose === 'sit' ? .26 : 0;
    parts.head.rotation.x = 0;
  }
  function useBed(x, y, z) {
    if (!beginFurnitureRest('lie', x, y, z, BED)) return;
    SPAWN = { x: x, y: y + 1, z: z }; stateDirty();
    if (!isNight()) return;
    var rest = furnitureRest, bday = Math.floor(dayT / DAY_LEN);
    document.body.classList.add('sleep');
    rest.timer = setTimeout(function () {
      if (furnitureRest !== rest || get(x,y,z) !== BED) return;
      if (STORY.started && !inTown(x, z) && plotAt(x, z) < 0 && STORY.s.bedDay !== bday) {
        STORY.s.bedDay = bday; STORY.s.bedsOut++; saveStory();
      }
      dayT = (bday + 1.02) * DAY_LEN;
      standFromFurniture();
      toast('🌅 아침이에요 — 내가 평안히 눕고 자기도 하리니 나를 안전히 살게 하시는 이는 오직 여호와이시니이다 (시 4:8)');
      unlock('sleep');
    }, 1900);
  }
  // ── 레버: 누르면 켜고 끄고, 둘레 4칸 안의 문을 함께 여닫음 ──
  function useLever(x, y, z) {
    var id = get(x, y, z), on = id === LEVER;
    if (canPlace(x,y,z,id)) return;
    var linked=pulseMechanical(x,y,z,on);
    setBlock(x, y, z, on ? LEVER + 1 : LEVER); sfx('click', 1200);
    if (linked) { toast(on?'연결한 장치를 열었어요':'연결한 장치를 닫았어요'); return; }
    var done = {}, n = 0;
    for (var dy = -2; dy <= 3; dy++) for (var dz = -4; dz <= 4; dz++) for (var dx = -4; dx <= 4; dx++) {
      var d = get(x + dx, y + dy, z + dz);
      if (SHAPE[d] && SHAPE[d].type === 'trapdoor') { if (!!SHAPE[d].open !== on && !canPlace(x + dx, y + dy, z + dz, d)) { setBlock(x + dx, y + dy, z + dz, d ^ 1); n++; } continue; }
      if (!(SHAPE[d] && SHAPE[d].type === 'door')) continue;
      var col = doorColumn(x + dx, y + dy, z + dz), key = (x + dx) + ',' + col[0] + ',' + (z + dz); if (done[key]) continue; done[key] = 1;
      if (!!SHAPE[d].open !== on) { toggleDoor(x + dx, col[0], z + dz); n++; }
    }
    if (n) unlock('lever');
    toast(on ? '레버를 켰어요' + (n ? ' — 문 ' + n + '개가 열렸어요' : '') : '레버를 껐어요' + (n ? ' — 문 ' + n + '개가 닫혔어요' : ''));
  }
  // ── 표지판: 내 땅에 세우고 글을 고름(정해진 글·말씀만) ──
  var SIGN_TEXTS = ['어서 오세요', '나그네의 집', '우리 집', '창고', '농장', '목장', '쉬는 곳', '함께 지어요', '여호와는 나의 목자시니 내게 부족함이 없으리로다 (시 23:1)', '내가 평안히 눕고 자기도 하리니 나를 안전히 살게 하시는 이는 오직 여호와이시니이다 (시 4:8)', '노아가 그와 같이 하여 하나님이 자기에게 명하신 대로 다 준행하였더라 (창 6:22)'];
  var SIGNS = {}, OTHER_SIGNS = {}, signSprites = {}, signAt = null;
  function signString() { var a = []; for (var k in SIGNS) a.push(k.replace(/,/g, '.') + '=' + SIGNS[k]); return a.join('/'); }
  function signFromString(str, into) { (str || '').split('/').forEach(function (e) { var q = e.split('='); if (q.length === 2 && SIGN_TEXTS[+q[1]] !== undefined) into[q[0].replace(/\./g, ',')] = +q[1]; }); }
  // ── 액자(11/20): 손에 든 것 1개를 걸어 두고, 다시 누르면 꺼냄. 땅 저장에 함께 실려 다른 사람도 봄 ──
  var FRAMES = {}, OTHER_FRAMES = {}, frameMeshes = {}, frameTex = {}, FRAME_GEO = null;
  function frameString() { var a = []; for (var k in FRAMES) a.push(k.replace(/,/g, '.') + '=' + FRAMES[k]); return a.join('/'); }
  function frameFromString(str, into) { (str || '').split('/').forEach(function (e) { var q = e.split('='); if (q.length === 2 && INV.indexOf(+q[1]) >= 0) into[q[0].replace(/\./g, ',')] = +q[1]; }); }
  function frameKey(x, y, z) { var o = plotOrigin(myPlot); return (x - o.x) + ',' + (y - PY0) + ',' + (z - o.z); }
  function useFrame(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) { var ok = frameMeshes[x + ',' + y + ',' + z]; return toast(ok ? '🖼 액자: ' + nameOf(ok.userData.id) : '다른 사람의 액자예요'); }
    var k = frameKey(x, y, z), cur = FRAMES[k];
    if (cur) {
      if (give(cur, 1) < 1) return deny('🎒 가방이 가득 찼어요');
      delete FRAMES[k]; toast('🖼 ' + jo(nameOf(cur), '을', '를') + ' 액자에서 꺼냈어요');
    } else {
      var it = HOTBAR[sel];
      if (!it || have(it) < 1 || it === FRAME) return deny('걸어 둘 것을 손에 들고 액자를 눌러요');
      take(it, 1); FRAMES[k] = it; newsMark('frame'); toast('🖼 ' + jo(nameOf(it), '을', '를') + ' 액자에 걸었어요 — 다시 누르면 꺼내요');
    }
    bagChanged(); markDirty(); refreshFrames(); sfx('click'); swingT = 0.25;
  }
  function frameBroken(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) return;
    var k = frameKey(x, y, z), cur = FRAMES[k];
    if (cur) { dropItem(x + 0.5, y + 0.5, z + 0.5, cur, 1); delete FRAMES[k]; markDirty(); }
    refreshFrames();
  }
  function frameTexture(id) {
    if (frameTex[id]) return frameTex[id];
    var img = new Image(), t = new THREE.Texture(img);
    img.onload = function () { t.needsUpdate = true; }; img.src = ICON[id];
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    return (frameTex[id] = t);
  }
  function refreshFrames() {
    if (!FRAME_GEO) FRAME_GEO = new THREE.PlaneGeometry(0.62, 0.62);
    var want = {};
    function add(p, map) { var o = plotOrigin(p); for (var k in map) { var q = k.split(','), x = o.x + +q[0], y = PY0 + +q[1], z = o.z + +q[2], b = get(x, y, z); if (SHAPE[b] && SHAPE[b].type === 'frame' && ICON[map[k]]) want[x + ',' + y + ',' + z] = [map[k], SHAPE[b].f]; } }
    if (myPlot >= 0) add(myPlot, FRAMES);
    for (var p in OTHER_FRAMES) add(+p, OTHER_FRAMES[p]);
    for (var k in frameMeshes) { var m = frameMeshes[k], w = want[k]; if (!w || m.userData.id !== w[0] || m.userData.f !== w[1]) { scene.remove(m); m.material.dispose(); delete frameMeshes[k]; } }
    var lit = 0.35 + 0.65 * skyState.dayF;
    for (var k2 in want) {
      if (!frameMeshes[k2]) {
        var q = k2.split(','), w2 = want[k2], d = [[0, 0, -0.42], [0.42, 0, 0], [0, 0, 0.42], [-0.42, 0, 0]][w2[1]];
        var mesh = new THREE.Mesh(FRAME_GEO, new THREE.MeshBasicMaterial({ map: frameTexture(w2[0]), transparent: true, alphaTest: 0.1 }));
        mesh.position.set(+q[0] + 0.5 + d[0], +q[1] + 0.5, +q[2] + 0.5 + d[2]); mesh.rotation.y = [0, -Math.PI / 2, Math.PI, Math.PI / 2][w2[1]];
        mesh.userData = { id: w2[0], f: w2[1] }; scene.add(mesh); frameMeshes[k2] = mesh;
      }
      frameMeshes[k2].material.color.setScalar(lit);
    }
  }
  // ── 땅 이름 팻말(11/20): 주인 있는 땅 앞(길 쪽)에 나무 기둥 + 「OO님의 땅」 — 56칸 안만 그림, 차단한 사람은 번호만 ──
  var plotSignObjs = {}, plotPostMat = null, plotPostGeo = null, PLOT_NAMES = {}, PLOT_HIDDEN = {}, plotNameT = 0;
  function fetchPlotNames() {   // 주인이 쓴 팻말 글(서버, 금칙어 검사를 거친 것)
    if (!client || !me || me.id === 'test') return;
    client.rpc('get_ark_plot_names', {}).then(function (r) { if (!r || r.error || !Array.isArray(r.data)) return; PLOT_NAMES = {}; PLOT_HIDDEN = {}; r.data.forEach(function (row) { if (row.hidden) PLOT_HIDDEN[row.user_id] = row.body; else PLOT_NAMES[row.user_id] = row.body; }); }, function () {});
  }
  function refreshPlotSigns() {
    if (!started) return;
    if (plotNameT-- <= 0) { plotNameT = 30; fetchPlotNames(); }
    var want = {}, ids = [];
    for (var pu in plotUser) if (plotUser[pu]) ids.push(plotUser[pu]);
    if (me && me.id) ids.push(me.id);
    if (ids.length && me && me.id !== 'test' && typeof fetchNames === 'function') fetchNames(ids);   // 이름은 로그인했을 때만(구경 중엔 서버가 막음)
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var u = plotUser[i]; if (!u && i !== myPlot) continue;
      var o = plotOrigin(i), cx = o.x + 0.5, cz = o.z - 1.5;   // 길 쪽 왼편 모서리
      if (Math.hypot(cx - P.x, cz - P.z) > 56) continue;
      var mine = i === myPlot, hidden = !mine && u && FRIENDS.hidden && FRIENDS.hidden.has(u);
      var nm = mine ? (me && NET.names[me.id]) : (hidden ? null : NET.names[u]);
      var own = mine ? (me && PLOT_NAMES[me.id]) : (hidden ? null : PLOT_NAMES[u]);
      want[i] = (mine ? '🏠 ' : '🏡 ') + (own ? own + (nm ? ' · ' + nm : '') : (nm ? nm + '님의 땅' : (i + 1) + '번 땅')) + (mine ? ' (내 땅)' : '');
    }
    for (var k in plotSignObjs) if (want[k] !== plotSignObjs[k].txt) { scene.remove(plotSignObjs[k].g); disposeSprite(plotSignObjs[k].s); delete plotSignObjs[k]; }
    for (var k2 in want) if (!plotSignObjs[k2]) {
      if (!plotPostMat) { plotPostMat = new THREE.MeshBasicMaterial({ color: 0x6b4a2b }); plotPostGeo = new THREE.BoxGeometry(0.16, 2.1, 0.16); }
      var o2 = plotOrigin(+k2), x2 = o2.x + 0.5, z2 = o2.z - 1.5, gy = groundAt(x2, z2, SY - 3); if (gy === null) continue;
      var g = new THREE.Group(), post = new THREE.Mesh(plotPostGeo, plotPostMat); post.position.y = 1.05; g.add(post);
      var s = signSprite(want[k2]); s.position.y = 2.1 + s.scale.y / 2; g.add(s);
      g.position.set(x2, gy, z2); scene.add(g); plotSignObjs[k2] = { g: g, s: s, txt: want[k2] };
    }
  }
  function openSignPick(x, y, z) {
    signAt = { x: x, y: y, z: z }; var L = $('signList'); L.innerHTML = '';
    SIGN_TEXTS.forEach(function (t, i) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = t; b.addEventListener('click', function () { setSignText(i); }); L.appendChild(b); });
    openPanel('signs');
  }
  function setSignText(i) {
    if (!signAt) return; var o = plotOrigin(myPlot), key = (signAt.x - o.x) + ',' + (signAt.y - PY0) + ',' + (signAt.z - o.z);
    SIGNS[key] = i; markDirty(); refreshSigns(); closePanel(); sfx('click');
  }
  function wrapText(t, n) { var out = [], s = ''; Array.from(t).forEach(function (ch) { s += ch; if (s.length >= n && ch === ' ') { out.push(s.trim()); s = ''; } }); if (s.trim()) out.push(s.trim()); return out.slice(0, 4); }
  function signSprite(t) {
    var lines = wrapText(t, 12), px = 26, c = document.createElement('canvas'), g = c.getContext('2d'), f = px + 'px Galmuri11, "Malgun Gothic", sans-serif'; g.font = f;
    var w = Math.max.apply(null, lines.map(function (l) { return g.measureText(l).width; })) + 20, h = lines.length * (px + 6) + 12;
    c.width = Math.ceil(w); c.height = h; g = c.getContext('2d'); g.font = f; g.fillStyle = 'rgba(240,228,196,0.92)'; g.fillRect(0, 0, c.width, h); g.fillStyle = '#3a2a14'; g.textBaseline = 'top';
    lines.forEach(function (l, i) { g.fillText(l, 10, 8 + i * (px + 6)); });
    var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); var hh = 0.42 * lines.length + 0.2; s.scale.set(c.width / h * hh, hh, 1); return s;
  }
  function refreshSigns() {
    var want = {};
    function add(p, map) { var o = plotOrigin(p); for (var k in map) { var q = k.split(','), x = o.x + +q[0], y = PY0 + +q[1], z = o.z + +q[2]; if (!(SHAPE[get(x, y, z)] && SHAPE[get(x, y, z)].type === 'sign')) continue; want[x + ',' + y + ',' + z] = map[k]; } }
    if (myPlot >= 0) add(myPlot, SIGNS);
    for (var p in OTHER_SIGNS) add(+p, OTHER_SIGNS[p]);
    for (var k in signSprites) if (want[k] === undefined || signSprites[k].i !== want[k]) { disposeSprite(signSprites[k].s); delete signSprites[k]; }
    for (var k2 in want) if (!signSprites[k2]) { var q = k2.split(','), s = signSprite(SIGN_TEXTS[want[k2]]); s.position.set(+q[0] + 0.5, +q[1] + 1.55 + s.scale.y / 2, +q[2] + 0.5); scene.add(s); signSprites[k2] = { s: s, i: want[k2] }; }
  }
  // ── 함께 짓는 터: 방주 북쪽 들판 64×64칸, 누구나 함께 짓고 그 자리는 모두에게 남음 ──
  var COMMONS = [XM - 32, AZ0 - 92, XM + 31, AZ0 - 29];
  function inCommons(x, z) { return x >= COMMONS[0] && x <= COMMONS[2] && z >= COMMONS[1] && z <= COMMONS[3]; }
  // 터를 네 구역으로: 맡고 싶은 곳을 골라 함께 지어요(표지는 땅 위에 떠 있음)
  var ZONES = [['🌿 정원', 0.25, 0.25], ['🐑 우리', 0.75, 0.25], ['🛤 길과 다리', 0.25, 0.75], ['⛺ 모임터', 0.75, 0.75]], zoneSprites = null;
  function spawnZoneSigns() {
    if (zoneSprites || Math.abs(P.x - XM) > 120 || Math.abs(P.z - (COMMONS[1] + COMMONS[3]) / 2) > 120) return;
    zoneSprites = ZONES.map(function (z) {
      var s = signSprite(z[0] + ' 구역'), x = COMMONS[0] + (COMMONS[2] - COMMONS[0]) * z[1], zz = COMMONS[1] + (COMMONS[3] - COMMONS[1]) * z[2];
      s.position.set(x, G + 5, zz); s.scale.multiplyScalar(2.2); scene.add(s); return s;
    });
  }
  // 관리자(전도사님 계정만): 막힌 채팅 · 가방 숫자 의심 기록 보기
  function openAdminWatch() {
    if (!NET.admin || !client) return;
    var old = $('watchBox'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'watchBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.96);border:2px solid #000;box-shadow:inset 0 0 0 2px #7a8aa0;padding:12px 14px;color:#fff;font-size:13px;width:min(440px,94vw);max-height:86vh;overflow:auto';
    function head(t) { var h = document.createElement('b'); h.textContent = t; h.style.cssText = 'display:block;font-size:15px;color:#ffe27a;margin:6px 0 4px'; box.appendChild(h); }
    function line(t, dim) { var d = document.createElement('div'); d.textContent = t; d.style.cssText = 'padding:3px 0;border-bottom:1px solid rgba(255,255,255,.08);' + (dim ? 'opacity:.6' : ''); box.appendChild(d); return d; }
    function when(at) { var d = new Date(at); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2); }
    head('🛡 지켜보기 — 관리자만 보여요');
    var chatH = line('🕊 막힌 채팅(최근 30일) — 불러오는 중…'), bagH;
    var c = document.createElement('button'); c.className = 'mc'; c.textContent = '닫기'; c.style.cssText = 'display:block;width:100%;margin-top:8px';
    c.addEventListener('click', function (e) { e.stopPropagation(); box.remove(); });
    document.body.appendChild(box); sfx('pop');
    client.rpc('get_ark_chat_blocked').then(function (r) {
      var rows = (r && r.data) || [];
      chatH.textContent = '🕊 막힌 채팅(최근 30일) ' + rows.length + '건' + (r.error ? ' — 불러오지 못했어요' : '');
      rows.slice(0, 40).forEach(function (x) { line(when(x.at) + ' · ' + (x.nick || '?') + ': ' + x.body); });
      bagH = line('🎒 가방 숫자 의심 기록 — 불러오는 중…');
      return client.rpc('get_ark_bag_flags');
    }).then(function (r) {
      var rows = (r && r.data) || [];
      bagH.textContent = '🎒 가방 숫자 의심 기록(최근 60일) ' + rows.length + '건' + (r.error ? ' — 불러오지 못했어요' : '');
      rows.slice(0, 40).forEach(function (x) {
        line(when(x.at) + ' · ' + (x.nick || '?') + ': 한 번에 ' + x.gain + '개 늘어남(가장 많이: ' + nameOf(x.top_item) + ' ' + x.top_gain + '개) — ' + (x.reverted ? '되돌림' : '기록만'), !x.reverted);
      });
      box.appendChild(c);
    }, function () { box.appendChild(c); toast('불러오지 못했어요'); });
  }
  // 관리자: 함께 짓는 터를 최근 몇 분만큼 되돌리기(모두의 화면에서 처음 풀밭으로)
  function adminRevertCommons() {
    if (!NET.admin || !client) return;
    var v = window.prompt('함께 짓는 터에서 최근 몇 분 동안 바뀐 것을 되돌릴까요?\n(0 = 지금까지 전부)', '30'); if (v === null) return;
    client.rpc('admin_revert_commons', { p_minutes: Math.max(0, parseInt(v, 10) || 0) }).then(function (r) {
      toast(r.error || r.data < 0 ? '되돌리지 못했어요' : '🧹 ' + r.data + '칸을 처음 모습으로 되돌렸어요');
    }, function () { toast('되돌리지 못했어요'); });
  }
  // ── 친구 집 구경: 내 땅을 보여 줄지·한 줄 소개를 정하고, 보여 준 집들로 가 보기 ──
  var INTROS = ['구경 오세요!', '함께 지은 나그네의 집', '작은 집이에요', '농장이 있어요', '동물 우리가 있어요', '높은 탑을 쌓았어요', '정원을 꾸몄어요', '방주를 닮은 집이에요'];
  function openVisit() {
    if (!me || !client || !NET.ok) { toast('로그인하면 친구 집을 구경할 수 있어요'); return; }
    openPanel('visit'); $('visitList').innerHTML = '<div class="empty">불러오는 중…</div>';
    Promise.all([client.rpc('get_ark_showcase'),client.rpc('get_ark_showcase_details').catch(function(){return {data:[]};})]).then(function (ans) {
      var r=ans[0],details = Array.isArray(ans[1].data)?ans[1].data:[];
      var L = $('visitList'); L.innerHTML = ''; var rows = r.data || [], mine = rows.filter(function (x) { return x.mine; })[0];
      var sel = $('visitIntro'); sel.innerHTML = ''; INTROS.forEach(function (t, i) { var o = document.createElement('option'); o.value = i; o.textContent = t; sel.appendChild(o); });
      if (mine) sel.value = mine.intro || 0;
      $('visitShow').checked = visitShown;
      var others = rows.filter(function (x) { return !x.mine; });
      if (!others.length) { L.innerHTML = '<div class="empty">아직 보여 준 친구 집이 없어요. 먼저 내 집을 보여 주세요!</div>'; return; }
      others.forEach(function (x) {
        var d = document.createElement('div'); d.className = 'vrow';
        var detail=details.find(function(d){return d.plot_idx===x.plot_idx;});
        var t = document.createElement('span'); t.textContent = '🏡 ' + shortName(x.nick, 8) + ' — ' + (INTROS[x.intro] || INTROS[0]) +
          (detail&&detail.theme?' · '+HOUSE_THEMES[detail.theme]:'')+' (' + (x.plot_idx + 1) + '번 땅)';
        var b = document.createElement('button'); b.className = 'mc'; b.textContent = '가 보기';
        b.addEventListener('click', function () {
          var o = plotOrigin(x.plot_idx);
          visitMarks=(detail&&Array.isArray(detail.marks)?detail.marks:[]).map(function(mark,i){
            return {id:'tour-'+i,label:'집 볼거리 '+(i+1),x:o.x+mark[0],z:o.z+mark[1]};
          });
          if(visitMarks.length)villageBook.target=visitMarks[0].id;
          teleport(o.x + OLD_PLOT / 2, G, o.z - 3, Math.PI); resume();
          toast('🏡 ' + x.nick + '의 집이에요 — '+(visitMarks.length?'지도에 볼거리가 있어요':'구경만 할 수 있어요'));
        });
        d.appendChild(t); d.appendChild(b); L.appendChild(d);
      });
    }, function () { $('visitList').innerHTML = '<div class="empty">불러오지 못했어요</div>'; });
  }
  var visitShown = false;
  try { visitShown = localStorage.getItem('arkVillage.show') === '1'; } catch (e) {}
  function saveShowcase() {
    if (!client || !me) return;
    var show = $('visitShow').checked, intro = +$('visitIntro').value || 0; visitShown = show;
    try { localStorage.setItem('arkVillage.show', show ? '1' : '0'); } catch (e) {}
    client.rpc('set_ark_showcase', { p_show: show, p_intro: intro }).then(function (r) { toast(r.data ? (show ? '내 집을 친구들에게 보여 줘요' : '내 집을 보여 주지 않아요') : '내 땅이 있어야 해요'); }, function () {});
  }
  // ── 파티(최대 4명): 초대·수락·나가기, 함께 채우는 파티 퀘스트, 보상은 업적과 칭호뿐 ──
  var PQ = [   // [키, 이모지, 할 일, 목표, 칭호]
    ['logs', '🪵', '함께 나무 300개 캐기', 300, '나무꾼'],
    ['build', '🧱', '함께 블록 400개 놓기', 400, '함께 짓는 사람'],
    ['harvest', '🌾', '함께 익은 밀 120번 거두기', 120, '추수하는 일꾼'],
    ['iron', '⚙', '함께 철 덩이 60개 녹이기', 60, '대장장이'],
    ['shadows', '⚔', '함께 어둠의 그림자 50번 물리치기', 50, '빛의 갑옷'],
    ['summit', '⛰', '파티원 누구든 아라랏 산 꼭대기에 오르기', 1, '산에 오른 사람']
  ];
  var TITLES = PQ.map(function (q) { return q[4]; }).concat(['세 겹 줄']);   // 마지막: 파티 퀘스트를 모두 마치면(전 4:12)
  var PARTY = { id: null, members: [], invites: [], progress: {}, pend: {}, seenInv: {}, flushT: 0, pollT: 0, busy: false, summitSent: false };
  var MYTITLE = -1, GOTTITLES = {};
  try { MYTITLE = +(localStorage.getItem('arkVillage.title') || -1); GOTTITLES = JSON.parse(localStorage.getItem('arkVillage.titles') || '{}') || {}; } catch (e) {}
  function saveTitles() { try { localStorage.setItem('arkVillage.title', String(MYTITLE)); localStorage.setItem('arkVillage.titles', JSON.stringify(GOTTITLES)); } catch (e) {} stateDirty(); }
  function inParty() { return !!PARTY.id; }
  function partyMate(u) { return inParty() && PARTY.members.some(function (m) { return m.id === u; }); }
  function partyAdd(k, n) { if (!inParty() || !n) return; var p = PARTY.progress[k]; if (p && p.done) return; PARTY.pend[k] = (PARTY.pend[k] || 0) + n; }
  var PARTY_ERR = { login: '로그인해야 파티를 맺을 수 있어요', self: '나는 초대할 수 없어요', nouser: '없는 사람이에요', busy: '이미 다른 파티에 있어요', full: '파티는 4명까지예요', gone: '초대가 사라졌어요(10분이 지났어요)', notleader: '파티를 이끄는 사람만 할 수 있어요' };
  function partyApply(d) {
    if (!d) return;
    var wasIn = PARTY.id, before = JSON.stringify(PARTY.progress);
    PARTY.id = d.party || null; PARTY.members = d.members || []; PARTY.invites = d.invites || []; PARTY.progress = d.progress || {};
    if (!PARTY.id) PARTY.pend = {};
    PARTY.invites.forEach(function (iv) { if (!PARTY.seenInv[iv.id]) { PARTY.seenInv[iv.id] = 1; toast('🤝 ' + shortName(iv.from, 8) + ' 님이 파티에 초대했어요 — 메뉴 → 🤝 파티에서 받아요'); sfx('click'); } });
    if (PARTY.id && !wasIn) { unlock('party'); chatSys('🤝 파티를 맺었어요 — 함께 파티 퀘스트를 채워요'); }
    if (wasIn && !PARTY.id) chatSys('파티에서 나왔어요');
    // 다 채운 파티 퀘스트 → 칭호와 업적
    var all = PARTY.id && PQ.every(function (q) { var p = PARTY.progress[q[0]]; return p && p.done; });
    PQ.forEach(function (q, i) {
      var p = PARTY.progress[q[0]];
      if (p && p.done && !GOTTITLES[i]) { GOTTITLES[i] = Date.now(); saveTitles(); unlock('pq'); setTimeout(function () { toast('🏷 칭호 「' + q[4] + '」을 받았어요 — ' + q[2]); }, 1200); }
    });
    if (all && !GOTTITLES[PQ.length]) { GOTTITLES[PQ.length] = Date.now(); saveTitles(); unlock('cord'); setTimeout(function () { toast('🏷 칭호 「세 겹 줄」 — 세 겹 줄은 쉽게 끊어지지 아니하느니라(전 4:12)'); }, 2400); }
    if (JSON.stringify(PARTY.progress) !== before || ui === 'party') { if (ui === 'party') renderParty(); }
    for (var u in NET.peers) { NET.peers[u].nick = null; peerName(NET.peers[u]); }   // 파티원 이름표 색
    netPill();
  }
  function partyFetch() {
    if (!client || !me || !NET.ok || PARTY.busy) return Promise.resolve();
    PARTY.busy = true;
    return client.rpc('get_my_party').then(function (r) { PARTY.busy = false; if (!r.error) partyApply(r.data); }, function () { PARTY.busy = false; });
  }
  function partyTick(dt) {
    if (!client || !me || !NET.ok) return;
    PARTY.pollT -= dt; PARTY.flushT -= dt;
    if (PARTY.pollT <= 0) { PARTY.pollT = ui === 'party' ? 4 : 15; partyFetch(); }
    // 아라랏 꼭대기
    if (inParty() && !PARTY.summitSent && P.y >= ARARAT_TOP) { terrain(Math.floor(P.x), Math.floor(P.z)); if (T.reg === 'ararat') { PARTY.summitSent = true; partyAdd('summit', 1); } }
    if (PARTY.flushT <= 0 && inParty()) {
      PARTY.flushT = 8;
      Object.keys(PARTY.pend).forEach(function (k) {
        var n = Math.min(50, PARTY.pend[k] || 0); if (n <= 0) return;
        PARTY.pend[k] -= n;
        client.rpc('party_progress', { p_key: k, p_n: n }).then(function (r) {
          if (r.error || !r.data) { PARTY.pend[k] = (PARTY.pend[k] || 0) + n; return; }
          var was = PARTY.progress[k] && PARTY.progress[k].done;
          PARTY.progress[k] = { n: r.data.n, done: r.data.n >= r.data.target };
          if (!was && PARTY.progress[k].done) partyFetch();
          if (ui === 'party') renderParty();
        }, function () { PARTY.pend[k] = (PARTY.pend[k] || 0) + n; });
      });
    }
  }
  function partyCall(fn, args, okMsg) {
    if (!client || !me || !NET.ok) { toast(PARTY_ERR.login); return; }
    client.rpc(fn, args || {}).then(function (r) {
      var v = r.data;
      if (r.error) { toast('하지 못했어요 — 인터넷을 확인해 주세요'); return; }
      if (v === 'ok') { if (okMsg) toast(okMsg); } else if (v === 'no') toast('초대를 사양했어요'); else toast(PARTY_ERR[v] || '하지 못했어요');
      PARTY.pollT = 0; partyFetch();
    }, function () { toast('하지 못했어요 — 인터넷을 확인해 주세요'); });
  }
  function openParty() {
    if (!me) { toast(PARTY_ERR.login); return; }
    if (!NET.ok) { toast('함께 놀기를 준비하는 중이에요. 조금 뒤에 다시 눌러 주세요'); return; }
    openPanel('party'); renderParty(); partyFetch(); sfx('click');
  }
  function renderParty() {
    var box = $('partyBody'); if (!box) return; box.innerHTML = '';
    function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
    function btn(t, fn) { var b = el('button', 'mc', t); b.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); fn(); }); return b; }
    var amLeader = PARTY.members.some(function (m) { return m.id === me.id && m.leader; });
    // 받은 초대
    PARTY.invites.forEach(function (iv) {
      var r = el('div', 'prow pinv'); r.appendChild(el('span', '', '🤝 ' + shortName(iv.from, 8) + ' 님의 파티 초대'));
      r.appendChild(btn('함께하기', function () { partyCall('party_answer', { p_invite: iv.id, p_yes: true }, '🤝 파티에 들어왔어요'); }));
      r.appendChild(btn('사양', function () { partyCall('party_answer', { p_invite: iv.id, p_yes: false }); }));
      box.appendChild(r);
    });
    // 내 파티
    box.appendChild(el('h3', '', inParty() ? '내 파티 (' + PARTY.members.length + '/4)' : '아직 파티가 없어요 — 아래에서 친구를 초대하면 파티가 생겨요'));
    PARTY.members.forEach(function (m) {
      var r = el('div', 'prow'); r.appendChild(el('span', '', (m.leader ? '👑 ' : '🧑 ') + shortName(m.nick || '친구', 10) + (m.id === me.id ? ' (나)' : '') + (NET.meta[m.id] ? ' · 접속 중' : '')));
      if (amLeader && m.id !== me.id) r.appendChild(btn('내보내기', function () { if (window.confirm(shortName(m.nick, 10) + ' 님을 파티에서 내보낼까요?')) partyCall('party_kick', { p_user: m.id }, '내보냈어요'); }));
      box.appendChild(r);
    });
    if (inParty()) { var lv = el('div', 'prow'); lv.appendChild(btn('파티 나가기', function () { if (window.confirm('파티에서 나갈까요? 함께 채운 기록은 파티에 남아요')) partyCall('party_leave', {}, '파티에서 나왔어요'); })); box.appendChild(lv); }
    // 초대할 수 있는 사람: 지금 접속한 사람
    if (!inParty() || PARTY.members.length < 4) {
      box.appendChild(el('h3', '', '지금 함께 있는 사람 초대하기'));
      var who = Object.keys(NET.meta).filter(function (u) { return u !== me.id && !partyMate(u); });
      if (!who.length) box.appendChild(el('div', 'empty', '지금 초대할 수 있는 사람이 없어요'));
      who.forEach(function (u) { var r = el('div', 'prow'); r.appendChild(el('span', '', '🧑 ' + shortName(NET.names[u] || '친구', 10))); r.appendChild(btn('초대', function () { partyCall('party_invite', { p_to: u }, '🤝 초대를 보냈어요 (10분 안에 받아야 해요)'); })); box.appendChild(r); });
    }
    // 파티 퀘스트
    box.appendChild(el('h3', '', '파티 퀘스트 — 두 사람이 한 사람보다 나음은 그들이 수고함으로 좋은 상을 얻을 것임이라 (전 4:9)'));
    PQ.forEach(function (q) {
      var p = PARTY.progress[q[0]] || { n: 0 }, n = Math.min(q[3], (p.n || 0) + (PARTY.pend[q[0]] || 0)), r = el('div', 'prow pq' + (p.done ? ' done' : ''));
      r.appendChild(el('span', '', q[1] + ' ' + q[2]));
      var bar = el('span', 'sbar'), s = el('s'); s.style.width = Math.round(100 * n / q[3]) + '%'; bar.appendChild(s); r.appendChild(bar);
      r.appendChild(el('small', '', (p.done ? '✔ ' : '') + n + '/' + q[3] + ' · 칭호 「' + q[4] + '」'));
      box.appendChild(r);
    });
    if (!inParty()) box.appendChild(el('div', 'empty', '파티를 맺어야 파티 퀘스트를 채울 수 있어요'));
    // 내 칭호
    box.appendChild(el('h3', '', '내 칭호 — 이름표 위에 보여요'));
    var tr = el('div', 'prow ptitles');
    var none = btn(MYTITLE < 0 ? '✔ 칭호 없음' : '칭호 없음', function () { MYTITLE = -1; saveTitles(); trackMe(); renderParty(); }); tr.appendChild(none);
    TITLES.forEach(function (t, i) {
      if (!GOTTITLES[i]) { tr.appendChild(el('span', 'tlock', '🔒 ' + t)); return; }
      tr.appendChild(btn((MYTITLE === i ? '✔ ' : '🏷 ') + t, function () { MYTITLE = i; saveTitles(); trackMe(); renderParty(); toast('🏷 칭호 「' + t + '」을 달았어요'); }));
    });
    box.appendChild(tr);
    box.appendChild(el('div', 'sverse', '너희가 짐을 서로 지라 그리하여 그리스도의 법을 성취하라 (갈라디아서 6:2)'));
  }
  function trackMe() { if (NET.chan && NET.on) NET.chan.track({ n: NET.nick, w: wornString(), t: MYTITLE }).catch(function () {}); }
  // ── 업적 ──
  var ACHS = [
    ['log', '🪵', '첫 통나무', '나무를 캐서 통나무를 얻어요'], ['table', '🪚', '제작대', '제작대를 만들어요'], ['tool', '⛏', '첫 도구', '도구를 하나 만들어요'],
    ['stone', '🪨', '돌의 단계', '돌을 캐요'], ['smelt', '🔥', '녹이는 사람', '용광로에서 무엇을 녹여요(욥 28:2)'], ['iron', '⚙', '철 덩이', '철 덩이를 얻어요'],
    ['diamond', '💎', '금강석', '금강석을 캐요(렘 17:1)'], ['house', '🏠', '첫 집', '내 땅에 블록 30개를 놓아요'], ['harvest', '🌾', '거두는 기쁨', '익은 밀을 거둬요'],
    ['eat', '🍞', '일용할 양식', '먹을 것을 먹어요'], ['breed', '🐑', '목자', '새끼 동물이 태어나게 해요'], ['ride', '🐎', '말 타기', '말이나 나귀를 타요'],
    ['wear', '👕', '옷 입기', '만든 옷을 입어요'], ['armor', '🛡', '전신 갑주', '하나님의 전신 갑주를 다 입어요(엡 6:11)'], ['commons', '🏗', '함께 짓기', '함께 짓는 터에 블록을 놓아요'],
    ['sleep', '🛏', '평안한 잠', '침대에서 자고 아침을 맞아요(시 4:8)'], ['shadow', '⚔', '말씀의 검', '어둠의 그림자를 물리쳐요(엡 6:17)'], ['chat', '💬', '첫 인사', '채팅으로 인사해요'], ['lever', '🔘', '레버', '레버로 문을 열어요'],
    ['tokens', '🎖', '믿음의 증표', '일곱 증표를 모두 받아요(히 11)'], ['stones', '💎', '열두 기초석', '기초석 열둘을 성벽 밑에 놓아요(계 21:19-20)'],
    ['valley', '🕯', '골짜기의 빛', '일곱 등잔대를 모두 밝혀요(시 23:4)'], ['home', '🏙', '본향에 이르다', '거룩한 성에 들어가요(히 11:16)'],
    ['party', '🤝', '함께 가는 길', '친구와 파티를 맺어요(시 133:1)'], ['pq', '🏷', '함께 받은 상', '파티 퀘스트 하나를 끝까지 채워요(전 4:9)'], ['cord', '🪢', '세 겹 줄', '파티 퀘스트를 모두 채워요(전 4:12)'], ['dex', '📖', '도감 완성', '도감을 다 채워요'],
    ['loaves', '🧺', '열두 바구니', '보리떡 다섯과 물고기 둘을 아이와 나눠요(요 6:13)'],
    ['noah', '🕊', '노아의 부탁', '노아의 부탁 다섯 가지를 마쳐요(창 6:22)'],
    ['together', '🤝', '함께 지었어요', '이번 주 마을 목표를 함께 채워요(느 2:18)'],
    ['rock', '💧', '반석의 물', '지팡이로 호렙의 반석을 쳐요(출 17:6)'], ['tabernacle', '⛺', '성막 모형', '내 땅에 성막 모형을 다 지어요(출 40:34)'], ['manna', '🍯', '일용할 만나', '광야에서 아침 만나를 거둬요(출 16:15)']
  ];
  var ACH = {};
  try { ACH = JSON.parse(localStorage.getItem('arkVillage.ach') || '{}') || {}; } catch (e) { ACH = {}; }
  function unlock(k) {
    if (ACH[k] || isAdm()) return; var a = ACHS.filter(function (x) { return x[0] === k; })[0]; if (!a) return;
    ACH[k] = Date.now(); try { localStorage.setItem('arkVillage.ach', JSON.stringify(ACH)); } catch (e) {} stateDirty();
    feedPost('ach', ACHS.indexOf(a));
    setTimeout(function () { toast('🏅 업적: ' + a[1] + ' ' + a[2] + ' — ' + a[3]); sfx('craft', 1600); }, 900);
  }
  function renderAch() {
    var g = $('achGrid'); if (!g) return; g.innerHTML = '';
    $('achCount').textContent = '업적 ' + ACHS.filter(function (a) { return ACH[a[0]]; }).length + ' / ' + ACHS.length;
    ACHS.forEach(function (a) { var d = document.createElement('div'); d.className = 'ach' + (ACH[a[0]] ? ' on' : ''); d.innerHTML = '<span class="em"></span><b></b><small></small>'; d.querySelector('.em').textContent = ACH[a[0]] ? a[1] : '🔒'; d.querySelector('b').textContent = a[2]; d.querySelector('small').textContent = a[3]; g.appendChild(d); });
  }
  // ── 마을 사람(말씀으로만 말함) ──
  var NPCS = [], NPC_DEFS = [
    { name:'빵 굽는 사람',x:XM+19,z:PZ0-9,look:{robe:0xd6ad77,robe2:0xe4cb9f,belt:0x70442c,
      trim:0x865636,skin:0xc68a60,hair:0x33251e,sandal:0x653c23,style:'scarf',scarf:0xe3cbab},
      text:'여행자에게 대접할 빵과 올리브, 구운 생선을 함께 차려 주세요.',ref:'마을 사람의 부탁',emoji:'🍞' },
    { name: '노아', x: XM + 7, z: AZ1 + 7, look: { robe: 0xd8cfb8, robe2: 0xc4b89a, belt: 0x6b4425, trim: 0x8a5a32, skin: 0xd9a67a, hair: 0xe8e4dc, sandal: 0x6b4425, style: 'long', fit: { beard: 0xe8e4dc, cloak: 0x7a5a3a } }, text: '노아가 그와 같이 하여 하나님이 자기에게 명하신 대로 다 준행하였더라', ref: '창세기 6:22', emoji: '⛵' },
    { name: '목자', x: XM + 46, z: PZ0 - 10, look: { robe: 0xddd0b0, robe2: 0xcfc09c, belt: 0x6b4425, trim: 0x7a5a3a, skin: 0xc98f62, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0xeee8d8, fit: { stripes: 0x7a5a3a, agal: 0x2a2018, staff: 0x8a6236 } }, text: '여호와는 나의 목자시니 내게 부족함이 없으리로다', ref: '시편 23:1', emoji: '🐑' },
    // 방주 안의 노아 가족(층마다 바닥 높이 y를 따로 준다)
    { name: '야벳', x: XM, z: AZ1 - 12, y: AY0 + 1, look: { robe: 0xc9b48c, robe2: 0xb8a27a, belt: 0x5a3a20, trim: 0x7a5a3a, skin: 0xd2a07a, hair: 0x3a2a1c, sandal: 0x6b4425, style: 'short', fit: { beard: 0x3a2a1c } }, text: '들어간 것들은 모든 것의 암수라 하나님이 그에게 명하신 대로 들어가매 여호와께서 그를 들여보내고 문을 닫으시니라', ref: '창세기 7:16', emoji: '🚪' },
    { name: '셈', x: XM - 13, z: AZ0 + 20, y: AY0 + 11, look: { robe: 0xb9c2a4, robe2: 0xa4ad8e, belt: 0x5a3a20, trim: 0x6a7050, skin: 0xd6a67e, hair: 0x2a1e14, sandal: 0x6b4425, style: 'long', fit: { beard: 0x2a1e14 } }, text: '혈육 있는 모든 생물을 너는 각기 암수 한 쌍씩 방주로 이끌어들여 너와 함께 생명을 보존하게 하되', ref: '창세기 6:19', emoji: '🐑' },
    { name: '함', x: AX1 - 22, z: AZ0 + 18, y: AY0 + 21, look: { robe: 0xc79a6a, robe2: 0xb58858, belt: 0x4a2e18, trim: 0x8a5a32, skin: 0xb27a52, hair: 0x1e1610, sandal: 0x6b4425, style: 'scarf', scarf: 0xe8d8b8, fit: { beard: 0x1e1610 } }, text: '너는 먹을 모든 양식을 네게로 가져다가 저축하라 이것이 너와 그들의 먹을 것이 되리라', ref: '창세기 6:21', emoji: '🏺' },
    { name: '노아의 아내', x: AX0 + 20, z: AZ0 + 14, y: AY0 + 21, look: { robe: 0x9a7aa0, robe2: 0x86688c, belt: 0x5a3a20, trim: 0x6a4a70, skin: 0xd9a67a, hair: 0xb8b2a8, sandal: 0x6b4425, style: 'scarf', scarf: 0xe4dccf }, text: '곧 그 날에 노아와 그의 아들 셈, 함, 야벳과 노아의 아내와 세 며느리가 다 방주로 들어갔고', ref: '창세기 7:13', emoji: '🏠' },
    { name: '마리아', x: NAT_X + 3, z: NAT_Z + 5, y: G, season: 1, look: { robe: 0x5b7fb8, robe2: 0x4a6aa0, belt: 0xd8cfb8, trim: 0x3a5488, skin: 0xd9a67a, hair: 0x3a2618, sandal: 0x6b4425, style: 'scarf', scarf: 0x7fa0d0 }, text: '마리아는 이 모든 말을 마음에 새기어 생각하니라', ref: '누가복음 2:19', emoji: '🤍' },
    { name: '요셉', x: NAT_X + 5, z: NAT_Z + 2, y: G, season: 1, look: { robe: 0x8a6a48, robe2: 0x765a3c, belt: 0x4a2e18, trim: 0x5a4028, skin: 0xc68a60, hair: 0x2b1d14, sandal: 0x6b4425, style: 'short', fit: { beard: 0x2b1d14 } }, text: '요셉이 잠에서 깨어 일어나 주의 사자의 분부대로 행하여 그의 아내를 데려왔으나', ref: '마태복음 1:24', emoji: '🪚' },
    { name: '천사', x: NAT_X + 12, z: NAT_Z + 10, y: G, season: 1, look: { robe: 0xf4f2ea, robe2: 0xe8e4d8, belt: 0xe0c060, trim: 0xe0c060, skin: 0xe5b98f, hair: 0xd8b878, sandal: 0xf0e8d0, style: 'long' }, text: '천사가 이르되 무서워하지 말라 보라 내가 온 백성에게 미칠 큰 기쁨의 좋은 소식을 너희에게 전하노라', ref: '누가복음 2:10', emoji: '👼' },
    { name: '동방 박사', x: NAT_X + 14, z: NAT_Z - 1, y: G, season: 1, look: { robe: 0x7a3a8a, robe2: 0x6a2a7a, belt: 0xe0b040, trim: 0xe0b040, skin: 0xb27a52, hair: 0x1e1610, sandal: 0x6b4425, style: 'scarf', scarf: 0xe0b040 }, text: '유대인의 왕으로 나신 이가 어디 계시냐 우리가 동방에서 그의 별을 보고 그에게 경배하러 왔노라 하니', ref: '마태복음 2:2', emoji: '👑' },
    { name: '동방 박사', x: NAT_X + 13, z: NAT_Z + 4, y: G, season: 1, look: { robe: 0x2a6a5a, robe2: 0x1f5a4a, belt: 0xe0b040, trim: 0xd0a030, skin: 0xd2a07a, hair: 0x3a2a1c, sandal: 0x6b4425, style: 'long', fit: { beard: 0x3a2a1c } }, text: '그들이 별을 보고 매우 크게 기뻐하고 기뻐하더라', ref: '마태복음 2:10', emoji: '⭐' },
    { name: '동방 박사', x: NAT_X + 14, z: NAT_Z + 9, y: G, season: 1, look: { robe: 0xa04030, robe2: 0x8a3428, belt: 0xe0b040, trim: 0xe0b040, skin: 0x9a6440, hair: 0x1e1610, sandal: 0x6b4425, style: 'scarf', scarf: 0xf0d080 }, text: '집에 들어가 아기와 그의 어머니 마리아가 함께 있는 것을 보고 엎드려 아기께 경배하고 보배합을 열어 황금과 유향과 몰약을 예물로 드리니라', ref: '마태복음 2:11', emoji: '🎁' },
    { name: '상인', x: XM + 32, z: AZ1 + 8, look: { robe: 0xb88a3a, robe2: 0xa27830, belt: 0x5a3a20, trim: 0x7a5228, skin: 0xc68a60, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0xd8b060, fit: { beard: 0x2b1d14, bag: 0x8a5a32 } }, text: '속이는 저울은 여호와께서 미워하시나 공평한 추는 그가 기뻐하시느니라', ref: '잠언 11:1', emoji: '⚖' },
    { name: '농부', x: XM - 12, z: VZ1 + 6, look: { robe: 0xa89a6a, robe2: 0x948858, belt: 0x5a3a20, trim: 0x6a5a38, skin: 0xb27a52, hair: 0x3a2a1c, sandal: 0x6b4425, style: 'short', fit: { beard: 0x3a2a1c } }, text: '더러는 좋은 땅에 떨어지매 자라 무성하여 결실하였으니 삼십 배나 육십 배나 백 배가 되었느니라 하시고', ref: '마가복음 4:8', emoji: '🌾' },
    { name: '어부', x: XM + 20, z: LZ - LRZ - 3, look: { robe: 0x6a8aa0, robe2: 0x5a7a90, belt: 0x4a3a28, trim: 0x4a6a80, skin: 0xb27a52, hair: 0x2b1d14, sandal: 0x6b4425, style: 'short', fit: { beard: 0x2b1d14 } }, text: '말씀하시되 나를 따라오라 내가 너희를 사람을 낚는 어부가 되게 하리라 하시니', ref: '마태복음 4:19', emoji: '🎣' },
    { name: '한 아이', x: XM - 20, z: LZ - LRZ - 3, look: { robe: 0xd8c8a0, robe2: 0xc8b890, belt: 0x8a5a32, trim: 0x8a5a32, skin: 0xd9a67a, hair: 0x3a2618, sandal: 0x6b4425, style: 'short' }, text: '여기 한 아이가 있어 보리떡 다섯 개와 물고기 두 마리를 가지고 있나이다 그러나 그것이 이 많은 사람에게 얼마나 되겠사옵나이까', ref: '요한복음 6:9', emoji: '🧺' },
    { name: '안내하는 나그네', x: XM - 6, z: PZ0 - 7, look: { robe: 0xe8e4da, robe2: 0xd8d2c4, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xe5b98f, hair: 0x3a2618, sandal: 0x6b4425, style: 'short', fit: { cloak: 0x3f4f6a, sash: 0x8a4b14, bag: 0x8a5a32 } }, text: '이 사람들은 다 믿음을 따라 죽었으며 약속을 받지 못하였으되 그것들을 멀리서 보고 환영하며 또 땅에서는 외국인과 나그네임을 증언하였으니', ref: '히브리서 11:13', emoji: '🧭' }
  ];
  function spawnNpcs() {
    arkBeasts(P.x, P.z);
    NPC_DEFS.forEach(function (d) {
      if (d.season && !FESTIVE) return;   // 성탄 인물은 절기에만
      if (NPCS.some(function (n) { return n.d === d; }) || !colAt(d.x, d.z)) return;
      var y = d.y !== undefined ? d.y : groundAt(d.x + 0.5, d.z + 0.5, SY - 3); if (y === null) return;
      var av = makeAvatar(d.look); dressAvatar(av, {}); av.position.set(d.x + 0.5, y, d.z + 0.5); av.rotation.y = Math.PI; scene.add(av);
      var tag = textSprite(d.name, 'rgba(60,40,10,0.6)', '#ffe9a0', 0.62); tag.position.y = HT + 0.7; av.add(tag);
      NPCS.push({ d: d, av: av, x: d.x + 0.5, y: y, z: d.z + 0.5 });
    });
    NPCS.forEach(function (n) { var dx = P.x - n.x, dz = P.z - n.z; if (Math.hypot(dx, dz) < 12) n.av.rotation.y = Math.atan2(-dx, -dz) + Math.PI; });
  }
  function showNpc(n) {
    var d = n.d, pi = DEX_PEOPLE.indexOf(d.name); if (pi >= 0) dexMore('n' + pi, d.name);
    if (d.name === '안내하는 나그네' && (!STORY.started || STORY.ended === false)) { if (!STORY.started) return startStory(); } $('cardEmoji').textContent = d.emoji; $('cardName').textContent = d.name; $('cardText').textContent = d.text; $('cardRef').textContent = d.ref; $('cardNew').textContent = '';
    $('card').classList.add('show'); sfx('pop'); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 10000);
  }
  // ── 어둠의 그림자(미움·거짓·교만): 밤 들판과 굴 속에 나옴. 마을·내 땅·함께 짓는 터·불빛 가까이엔 안 나옴.
  //    횃불을 들면 가까이 못 오고, 햇빛에 사라짐. 갑옷은 덜 다치게, 전신 갑주를 다 입으면 다치지 않음. 칼·성령의 검(엡 6:17)으로 물리침 ──
  var SHADOWS = [], shadowT = 3, shadowMat = null, shadowTold = false;
  var SH_KINDS = {
    hate: { name: '미움', eye: 0xff3a3a, hp: 3, dmg: 2, speed: 4.2, h: 1 },
    lie: { name: '거짓', eye: 0xc060ff, hp: 2, dmg: 2, speed: 5.0, h: 0.95, blink: true },
    pride: { name: '교만', eye: 0xffc840, hp: 5, dmg: 3, speed: 3.0, h: 1.25 },
    doubt: { name: '의심', eye: 0x6ad0ff, hp: 3, dmg: 2, speed: 3.4, h: 1.05, ranged: true },   // 멀찍이 서서 불화살(엡 6:16)
    great: { name: '큰 그림자', eye: 0xff8a2a, hp: 10, dmg: 4, speed: 4.6, h: 1.45 }   // 골짜기에만
  };
  function shadowsOn() { return S.shadows !== false; }
  function armorGuard() {   // 0~1: 줄여 주는 몫
    var g = 0, god = 0;
    SLOTS.forEach(function (s) { var id = WORN[s]; if (!id) return; var sh = WEARINFO[id].shape; if (sh.slice(-1) === 'G') { god++; g += 0.2; } else if (/helm|mail|shield|crown/.test(sh)) g += 0.12; else g += 0.06; });
    return god === 5 ? 1 : Math.min(0.85, g);
  }
  function makeShadow(kind, x, z) {
    var sp = SH_KINDS[kind], u = HT / 32 * sp.h, root = new THREE.Group();
    if (!shadowMat) shadowMat = new THREE.MeshBasicMaterial({ color: 0x08060c, transparent: true, opacity: 0.78 });
    function box(w, h, d, x0, y0, z0, mat) { var m = new THREE.Mesh(new THREE.BoxGeometry(w * u, h * u, d * u), mat || shadowMat); m.position.set(x0 * u, y0 * u, z0 * u); root.add(m); return m; }
    box(8.4, 13, 4.4, 0, 18, 0); box(7, 8, 3.6, 0, 7, 0); box(3, 9, 3, -6, 19, 0); box(3, 9, 3, 6, 19, 0);
    var head = box(8, 8, 8, 0, 28.5, 0), eyeM = new THREE.MeshBasicMaterial({ color: sp.eye, fog: false });
    box(1.6, 1.2, 0.4, -1.8, 29, -4.1, eyeM); box(1.6, 1.2, 0.4, 1.8, 29, -4.1, eyeM);
    var tag = textSprite(sp.name, 'rgba(0,0,0,0.55)', '#' + sp.eye.toString(16).padStart(6, '0'), 0.55); tag.position.y = HT * sp.h + 0.6; root.add(tag);
    var y = groundAt(x, z, SY - 3); if (y === null) y = P.y;
    root.position.set(x, y, z); scene.add(root);
    return { kind: kind, sp: sp, mesh: root, x: x, y: y, z: z, hp: sp.hp, hitT: 0, t: Math.random() * 6, fade: 0, dead: false };
  }
  function litNear(x, y, z, r) {
    for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) {
      var c = colAt(x + dx * CS, z + dz * CS); if (!c) continue;
      for (var i = 0; i < c.lamps.length; i++) { var l = c.lamps[i]; if (Math.abs(l[0] - x) <= r && Math.abs(l[2] - z) <= r && Math.abs(l[1] - y) <= r) return true; }
    }
    return false;
  }
  // ── 안전한 집(11/20): 내 땅 둘레 칸이 모두 내 땅 안 불빛(횃불·등) 6칸 안이면 「🏠 안전한 집」 — 둘레 10칸까지 그림자가 나오지 않음 ──
  var homeSafe = false, homeTold = false, wasNight = false, nightTold = -1;
  function checkHome() {
    if (myPlot < 0) { homeSafe = false; return; }
    var o = plotOrigin(myPlot), lamps = [];
    for (var cz = o.z >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = o.x >> 5; cx <= (o.x + PLOT) >> 5; cx++) {
      var c = COLS[cz * NC + cx]; if (!c) { return; }   // 아직 안 불러온 땅이면 그대로
      c.lamps.forEach(function (l) { if (l[0] >= o.x && l[0] < o.x + PLOT && l[2] >= o.z && l[2] < o.z + PLOT) lamps.push(l); });
    }
    var ok = lamps.length > 0;
    for (var i = 0; i < PLOT && ok; i++) {
      [[o.x + i, o.z], [o.x + i, o.z + PLOT - 1], [o.x, o.z + i], [o.x + PLOT - 1, o.z + i]].forEach(function (q) {
        if (ok && !lamps.some(function (l) { return Math.abs(l[0] - q[0]) <= 6 && Math.abs(l[2] - q[1]) <= 6; })) ok = false;
      });
    }
    if (ok && !homeSafe && started) {
      if (!S.homeTold) { S.homeTold = 1; saveSettings(); showVerseCard('🏠', '안전한 집', '주의 말씀은 내 발에 등이요 내 길에 빛이니이다', '시편 119:105', '내 땅 둘레를 모두 밝혔어요 — 밤에도 그림자가 집 가까이 오지 못해요'); }
      else toast('🏠 안전한 집이 됐어요 — 둘레가 밝아요');
    } else if (!ok && homeSafe && started) toast('🏠 집 둘레에 어두운 곳이 생겼어요 — 횃불을 더 밝혀요');
    homeSafe = ok;
    var night = isNight(), dayN = Math.floor(dayT / DAY_LEN);
    if (night && !wasNight && started && ui === 'play' && !homeSafe && nightTold !== dayN && shadowsOn()) { nightTold = dayN; toast('🌙 밤이 와요 — 내 땅 둘레에 횃불을 6칸마다 밝히면 「🏠 안전한 집」이 돼요'); }
    wasNight = night;
  }
  function nearSafeHome(x, z) { if (!homeSafe || myPlot < 0) return false; var o = plotOrigin(myPlot); return x >= o.x - 10 && x < o.x + PLOT + 10 && z >= o.z - 10 && z < o.z + PLOT + 10; }
  function safeZone(x, z) { return nearSafeHome(x, z) || inTown(x, z) || inCommons(x, z) || plotAt(x, z) >= 0 || inArk(x, G + 2, z) || inCity(x, z) || !!inLandmark(x, z); }
  function removeShadow(s) {
    var materials = new Set();
    s.mesh.traverse(function (o) {
      if (o.isSprite) return;
      if (o.geometry) o.geometry.dispose();
      if (o.material && o.material !== shadowMat) materials.add(o.material);
    });
    s.mesh.children.slice().forEach(function (o) { if (o.isSprite) disposeSprite(o); });
    materials.forEach(function (m) { m.dispose(); });
    scene.remove(s.mesh);
  }
  function stepShadows(dt) {
    var now = performance.now();
    stepArrows(dt);
    if (!shadowsOn() || !started) { if (SHADOWS.length) { SHADOWS.forEach(removeShadow); SHADOWS = []; } clearFireArrows(); return; }
    var px = Math.floor(P.x), pz = Math.floor(P.z), cave = skyLight(px, Math.floor(P.y + 1), pz) < 0.3, dark = cave || isNight();
    // 나타나기
    shadowT -= dt;
    if (shadowT <= 0) {
      var inDun = inDungeon(px, Math.floor(P.y), pz);   // 골짜기: 더 자주, 더 많이, 큰 그림자도
      shadowT = inDun ? 1.5 + Math.random() * 2 : 4 + Math.random() * 5;
      if ((dark || inDun) && ui === 'play' && SHADOWS.length < (inDun ? 8 : 4) && !safeZone(px, pz) && !riding) {
        var ang = Math.random() * Math.PI * 2, d = inDun ? 8 + Math.random() * 10 : 14 + Math.random() * 8, sx = P.x + Math.cos(ang) * d, sz = P.z + Math.sin(ang) * d;
        if (inDun) {   // 미로: 가까운 칸(2~3칸 떨어진) 한가운데에서
          var ci = Math.floor((P.x - DUN.x0) / DUN.cs) + (Math.random() < 0.5 ? -1 : 1) * (2 + (Math.random() * 2 | 0)), cj = Math.floor((P.z - DUN.z0) / DUN.cs) + ((Math.random() * 5 | 0) - 2);
          ci = Math.max(0, Math.min(DUN.n - 1, ci)); cj = Math.max(0, Math.min(DUN.n - 1, cj));
          sx = DUN.x0 + ci * DUN.cs + 2.5; sz = DUN.z0 + cj * DUN.cs + 2.5;
        }
        var gy = cave || inDun ? null : groundAt(sx, sz, SY - 3);
        if (cave || inDun) { for (var yy = Math.floor(P.y) + 3; yy > Math.floor(P.y) - 6; yy--) if (!isSolid(get(Math.floor(sx), yy, Math.floor(sz))) && !isSolid(get(Math.floor(sx), yy + 1, Math.floor(sz))) && isSolid(get(Math.floor(sx), yy - 1, Math.floor(sz)))) { gy = yy; break; } }
        if (gy !== null && !safeZone(Math.floor(sx), Math.floor(sz)) && !litNear(Math.floor(sx), gy, Math.floor(sz), 7) && get(Math.floor(sx), gy, Math.floor(sz)) !== WATER) {
          var keys2 = Object.keys(SH_KINDS).filter(function (k) { return k !== 'great'; }), kk = inDun && Math.random() < 0.4 ? 'great' : keys2[Math.random() * keys2.length | 0];
          var s = makeShadow(kk, sx, sz); s.y = gy; s.mesh.position.y = gy; SHADOWS.push(s);
          if (!shadowTold) { shadowTold = true; toast('어둠 속에 그림자가 있어요 — 횃불을 들거나, 칼·성령의 검으로 물리쳐요(엡 6:17). 마을과 불빛 곁은 안전해요'); }
        }
      }
    }
    var torch = (HOTBAR[sel] === TORCH && have(TORCH) > 0) || litNear(px, Math.floor(P.y), pz, 6);
    SHADOWS.forEach(function (s) {
      s.t += dt;
      var dx = P.x - s.x, dz = P.z - s.z, dist = Math.hypot(dx, dz) || 0.01;
      var sun = !cave && !inDungeon(Math.floor(s.x), Math.floor(s.y), Math.floor(s.z)) && !isNight() && skyLight(Math.floor(s.x), Math.floor(s.y) + 1, Math.floor(s.z)) > 0.6;
      if (s.dead || sun || dist > 44 || safeZone(Math.floor(s.x), Math.floor(s.z))) { s.fade += dt * 1.5; }
      else if (!s.dead) {
        var want = s.sp.ranged ? (torch ? 11 : 9) : (torch ? 6 : 1.2), mv = 0;
        if (dist > want + 0.3) mv = s.sp.speed * dt; else if ((torch || s.sp.ranged) && dist < want - 0.5) mv = -s.sp.speed * 0.6 * dt;
        if (s.sp.ranged) { s.fireT = (s.fireT === undefined ? 1.5 + Math.random() : s.fireT) - dt; if (s.fireT <= 0 && dist < 20 && Math.abs(P.y - s.y) < 6) { s.fireT = 2.8 + Math.random() * 1.2; shootFireArrow(s); } }
        if (s.sp.blink && dist > 6 && Math.random() < dt * 0.25) mv = Math.min(dist - 3, 4);   // 거짓: 갑자기 가까이
        if (mv && !(s.wind > 0)) {
          var nx = s.x + dx / dist * mv, nz = s.z + dz / dist * mv, ny = groundAt(nx, nz, s.y + 2);
          if (ny !== null && Math.abs(ny - s.y) <= 1.6 && !litNear(Math.floor(nx), ny, Math.floor(nz), 4)) { s.x = nx; s.z = nz; s.y = ny; }
        }
        if (!s.sp.ranged && !(s.wind > 0) && dist < 1.9 && Math.abs(P.y - s.y) < 2.5 && now - s.hitT > 1200) { s.wind = 0.45; s.hitT = now; }
        if (s.wind > 0 && (s.wind -= dt) <= 0) {   // 공격 신호(몸을 젖힘) 0.45초 뒤에 덮침 — 그 사이 물러서면 피함
          s.wind = 0; s.hitT = now; s.lunge = 1;
          if (dist < 2.3 && Math.abs(P.y - s.y) < 2.5) { var g = armorGuard(), dmg = Math.round(s.sp.dmg * (1 - g));
          if (dmg > 0) hurtFaith(dmg, '「' + s.sp.name + '」'); else if (vitalsOn()) toast('🛡 하나님의 전신 갑주가 막아 주었어요 (엡 6:11)');
          P.vx += dx / dist * 6; P.vz += dz / dist * 6; }
          else floatText(P.x, P.y + HT + 0.3, P.z, '피했어요!', '#bfe8ff', 0.5, 0.8);
        }
      }
      shadowFxStep(s, dt);
      s.mesh.position.set(s.x, s.y + Math.sin(s.t * 2) * 0.12, s.z);
      s.mesh.rotation.y = Math.atan2(-dx, -dz);
      var op = Math.max(0, 0.78 * (1 - s.fade)) * (0.85 + Math.sin(s.t * 5) * 0.15);
      s.mesh.children.forEach(function (m) { if (m.material && m.material !== shadowMat) m.material.opacity = 1 - s.fade; });
      s.op = op;
    });
    if (SHADOWS.length) shadowMat.opacity = Math.max(0.15, Math.min.apply(null, SHADOWS.map(function (s) { return s.op; })));
    SHADOWS = SHADOWS.filter(function (s) { if (s.fade >= 1) { removeShadow(s); return false; } return true; });
  }
  function hitShadow(s, arrowDmg, sweep) {
    if (s.dead) return;
    var held = arrowDmg ? 0 : HOTBAR[sel], dmg = 1;
    if (arrowDmg) dmg = arrowDmg;
    else if (held === SWORD && have(SWORD) > 0) dmg = 4;
    else if (isTool(held) && have(held) > 0 && TOOL_TYPES[typeOf(held)] === 'knife') dmg = 1.5 + tierOf(held) * 0.5;
    if (has('jericho')) dmg += 1;
    var crit = !arrowDmg && !P.ground && P.vy < -1 && !P.swim && !P.fly;   // 떨어지면서 치면 강한 일격
    if (crit) dmg *= 1.5;
    if (s.wind > 0 && !arrowDmg) { s.wind = 0; s.hitT = performance.now(); }   // 덮치려던 순간에 맞으면 멈칫
    s.hp -= dmg; if (!sweep) { swingT = 0.25; sfx('dig', 300); }
    combatFx(s, dmg, crit);
    var dx = s.x - P.x, dz = s.z - P.z, d = Math.hypot(dx, dz) || 1, kb = crit ? 11 : (arrowDmg ? 4 : 8); s.kx = dx / d * kb; s.kz = dz / d * kb;   // 밀려남
    if (held === SWORD && !arrowDmg && have(SWORD) > 0) sweepHit(s);
    if (isTool(held)) wearTool(held);
    if (s.hp <= 0) {
      s.dead = true; burst(Math.floor(s.x), Math.floor(s.y) + 1, Math.floor(s.z), LAMP); sfx('craft', 1800); shadowDeathFx(s); questEvent('shadow', s.kind, 1);
      dropItem(s.x, s.y + 1, s.z, SHARD, s.kind === 'great' ? 3 : 1);   // 빛 조각 — 횃불·등롱 재료
      if (!S.shardTold) { S.shardTold = 1; saveSettings(); setTimeout(function () { showVerseCard('✨', '빛 조각', '빛이 어둠에 비치되 어둠이 깨닫지 못하더라', '요한복음 1:5', '그림자를 물리친 자리에 빛 조각이 남았어요 — 주워서 횃불·등롱을 만들어요'); }, ACH.shadow ? 300 : 9500); }
      if (!ACH.shadow) { $('cardEmoji').textContent = '⚔'; $('cardName').textContent = '성령의 검'; $('cardText').textContent = '구원의 투구와 성령의 검 곧 하나님의 말씀을 가지라'; $('cardRef').textContent = '에베소서 6:17'; $('cardNew').textContent = '어둠의 그림자 「' + s.sp.name + '」을(를) 물리쳤어요'; $('card').classList.add('show'); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 9000); }
      unlock('shadow');
      partyAdd('shadows', 1);
      if (STORY.started) { STORY.s.shadows++; if (isNight()) STORY.s.night++; saveStory(); }
    }
    bagChanged();
  }
  // ── 화살(내가 쏨)·불화살(의심이 쏨) ──
  var shieldToldT = 0;
  var ARROWS = [], FIRES = [], bowAt = 0, arrowGeo = null, arrowMat = null, fireMat = null;
  function arrowMesh(fire) {
    if (!arrowGeo) { arrowGeo = new THREE.BoxGeometry(0.06, 0.06, 0.7); arrowMat = new THREE.MeshBasicMaterial({ color: 0x8a5a2b }); fireMat = new THREE.MeshBasicMaterial({ color: 0xff7a1e, fog: false }); }
    var m = new THREE.Mesh(arrowGeo, fire ? fireMat : arrowMat); if (fire) m.scale.set(2.2, 2.2, 1); scene.add(m); return m;
  }
  var bowDraw = null, bowUiT = 0;
  function bowStart() {
    if (HOTBAR[sel] !== BOW || have(BOW) < 1) return false;
    if (!isAdm() && have(ARROW) < 1) { deny('화살이 없어요 — 막대기 1 + 부싯돌 1로 화살 4개를 만들어요'); return true; }
    bowDraw = { t0: performance.now() }; $('bowBar').classList.add('show'); tone('triangle', 140, 220, 0.5, 0.03);
    clearInterval(bowUiT); bowUiT = setInterval(function () { if (!bowDraw) return; var p = Math.min(1, (performance.now() - bowDraw.t0) / 1000); $('bowFill').style.width = Math.round(p * 100) + '%'; $('bowBar').classList.toggle('full', p >= 1); }, 40);
    return true;
  }
  function bowRelease(dir) {
    if (!bowDraw) return false;
    var p = Math.max(0.15, Math.min(1, (performance.now() - bowDraw.t0) / 1000));
    bowDraw = null; clearInterval(bowUiT); $('bowBar').classList.remove('show', 'full'); $('bowFill').style.width = '0%';
    if (HOTBAR[sel] === BOW) { bowAt = 0; shootArrow(dir || screenDir(), p); }
    return true;
  }
  function bowCancel() { if (bowDraw) { bowDraw = null; clearInterval(bowUiT); $('bowBar').classList.remove('show', 'full'); } }
  function shootArrow(dir, pow) {
    pow = pow || 0.35;
    var now = performance.now(); if (now < bowAt) return;
    if (!isAdm() && have(ARROW) < 1) return deny('화살이 없어요 — 막대기 1 + 부싯돌 1로 화살 4개를 만들어요');
    bowAt = now + 250; if (!isAdm()) { take(ARROW, 1); bagChanged(); } newsMark('bow');
    var p = camera.position, v = 12 + 24 * pow;
    ARROWS.push({ x: p.x + dir.x * 0.6, y: p.y + dir.y * 0.6 - 0.1, z: p.z + dir.z * 0.6, vx: dir.x * v, vy: dir.y * v + 1.5, vz: dir.z * v, t: 0, dmg: 1 + Math.round(2.5 * pow), mesh: arrowMesh(false) });
    tone('triangle', 260 + 160 * pow, 150, 0.12, 0.06 + 0.06 * pow); swingT = 0.25; vibrate('bow');
  }
  function shootFireArrow(s) {
    var tx = P.x - s.x, ty = P.y + 1.1 - (s.y + 1.5 * s.sp.h), tz = P.z - s.z, d = Math.hypot(tx, ty, tz) || 1, v = 13;
    FIRES.push({ x: s.x, y: s.y + 1.5 * s.sp.h, z: s.z, vx: tx / d * v, vy: ty / d * v, vz: tz / d * v, t: 0, who: s.sp.name, dmg: s.sp.dmg, mesh: arrowMesh(true) });
    tone('sawtooth', 900, 300, 0.25, 0.04);
  }
  function clearFireArrows() { FIRES.forEach(function (a) { scene.remove(a.mesh); }); FIRES = []; }
  function stepArrows(dt) {
    var live = [];
    ARROWS.forEach(function (a) {
      var gone = false;
      for (var k = 0; k < 3 && !gone; k++) {
        var st = dt / 3; a.vy -= 12 * st; a.x += a.vx * st; a.y += a.vy * st; a.z += a.vz * st; a.t += st;
        var bid = get(Math.floor(a.x), Math.floor(a.y), Math.floor(a.z));
        if (isSolid(bid) && !(SHAPE[bid] && collBoxes(bid, 0, 0, 0).length === 0)) { gone = true; if (Math.random() < 0.6 && !isAdm()) dropItem(a.x - a.vx * st, a.y - a.vy * st + 0.2, a.z - a.vz * st, ARROW, 1); sfx('dig', 900); break; }
        for (var i = 0; i < SHADOWS.length; i++) {
          var s = SHADOWS[i]; if (s.dead) continue;
          var hy = a.y - s.y; if (Math.hypot(a.x - s.x, a.z - s.z) < 0.7 && hy > 0 && hy < 2.1 * s.sp.h) { hitShadow(s, a.dmg || 3); gone = true; break; }
        }
      }
      if (gone || a.t > 4 || a.y < 0) { scene.remove(a.mesh); return; }
      a.mesh.position.set(a.x, a.y, a.z); a.mesh.lookAt(a.x + a.vx, a.y + a.vy, a.z + a.vz); live.push(a);
    });
    ARROWS = live;
    var liveF = [];
    FIRES.forEach(function (f) {
      var gone = false;
      for (var k = 0; k < 3 && !gone; k++) {
        var st = dt / 3; f.x += f.vx * st; f.y += f.vy * st; f.z += f.vz * st; f.t += st;
        if (isSolid(get(Math.floor(f.x), Math.floor(f.y), Math.floor(f.z)))) { gone = true; break; }
        if (Math.hypot(f.x - P.x, f.z - P.z) < 0.55 && f.y > P.y && f.y < P.y + HT + 0.1) {
          gone = true; var g = armorGuard(), dmg = Math.round(f.dmg * (1 - g)), sh = WORN.shield, fl = Math.hypot(f.vx, f.vz) || 1;
          var front = (-Math.sin(P.yaw)) * (-f.vx / fl) + (-Math.cos(P.yaw)) * (-f.vz / fl) > 0.3;
          if (sh && front && Math.random() < ({ 156: 0.5, 157: 0.75, 158: 1 }[sh] || 0)) { newsMark('shield'); vibrate('block'); sfx('place', 'metal'); burst(Math.floor(f.x), Math.floor(f.y), Math.floor(f.z), LAMP); var nowB = performance.now(); if (nowB - shieldToldT > 5000) { shieldToldT = nowB; toast(sh === 158 ? '🛡 믿음의 방패로 불화살을 막았어요 (엡 6:16)' : '🛡 ' + nameOf(sh) + '로 불화살을 막았어요'); } break; }
          if (dmg > 0) hurtFaith(dmg, '「' + f.who + '」'); else if (vitalsOn()) toast('🛡 하나님의 전신 갑주가 불화살을 막아 주었어요 (엡 6:16)');
        }
      }
      if (gone || f.t > 3) { scene.remove(f.mesh); return; }
      f.mesh.position.set(f.x, f.y, f.z); f.mesh.lookAt(f.x + f.vx, f.y + f.vy, f.z + f.vz); f.mesh.rotation.z += f.t * 12; liveF.push(f);
    });
    FIRES = liveF;
  }
  // ── 배경 음악(코드로 만든 잔잔한 가락) — 메뉴에서 끌 수 있음 ──
  var musicT = 20;
  function stepMusic(dt) {
    if (!AC || !S.sound || S.music === false || !started) return;
    musicT -= dt; if (musicT > 0) return;
    musicT = 28 + Math.random() * 30;
    var night = skyState.dayF < 0.4, cave = caveK > 0.5, base = cave ? 196 : (night ? 220 : 262);
    var scale = night || cave ? [0, 3, 5, 7, 10, 12] : [0, 2, 4, 7, 9, 12], n = 5 + (Math.random() * 4 | 0), t0 = AC.currentTime + 0.1, deg = 2;
    for (var i = 0; i < n; i++) {
      deg = Math.max(0, Math.min(scale.length - 1, deg + [-1, 0, 1, 1, -1, 2][Math.random() * 6 | 0]));
      var f = base * Math.pow(2, scale[deg] / 12), at = t0 + i * (cave ? 1.1 : 0.75), dur = cave ? 1.6 : 1.1;
      try {
        var o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.035, at + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g); g.connect(AC.destination); o.start(at); o.stop(at + dur + 0.05);
      } catch (e) {}
    }
  }
  // ── 다른 기기에서 이어 하기: 단축 칸·가방 칸·녹이는 것·안장 얹은 말·기른 동물·밭·체력·기운·침대·업적·처음 안내를 계정에 저장 ──
  var stateDirtyF = false, stateT = null, lastStateStr = '';
  function stateDirty() { stateDirtyF = true; }
  function stateGather() {
    var horses = []; try { horses = JSON.parse(localStorage.getItem('arkVillage.horses') || '[]'); } catch (e) {}
    return { v: 1, hot: HOTBAR, slots: BAGSLOT, jobs: JOBS, horses: horses, herd: HERD, crops: CROPS, saps: SAPS, hp: HP, food: FOOD, faith: FAITH, spawn: SPAWN, ach: ACH, noah: NOAH, quest: { stats: stats, step: qStep }, story: STORY, tutorial: tutorialStep, titles: { t: MYTITLE, got: GOTTITLES }, adv: ADV };
  }
  function stateApply(d) {
    if (!d || d.v !== 1) return;
    if (d.hot && d.hot.length === 9) HOTBAR = d.hot.map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; });
    if (d.slots) BAGSLOT = d.slots.map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; });
    if (d.jobs) { JOBS = d.jobs.filter(function (j) { return j && B[j.o] && j.n > 0; }); saveJobs(); }
    if (d.horses) { try { localStorage.setItem('arkVillage.horses', JSON.stringify(d.horses)); } catch (e) {} pendingHorses = d.horses.filter(function (o) { return o && BEASTS[o.k]; }).slice(0, 6); }
    if (d.herd) { HERD = d.herd; pendingHerd = HERD.slice(); }
    if (d.crops) CROPS = d.crops; if (d.saps) { SAPS = d.saps; saveSaps(); }
    if (typeof d.faith === 'number') FAITH = Math.max(1, Math.min(20, d.faith));
    if (typeof d.hp === 'number') HP = Math.max(1, Math.min(20, d.hp)); if (typeof d.food === 'number') FOOD = Math.max(0, Math.min(20, d.food));
    SPAWN = d.spawn || null; if (d.ach) ACH = d.ach;
    if (d.noah && typeof d.noah.step === 'number' && ((d.noah.done || 0) > (NOAH.done || 0) || d.noah.step > NOAH.step)) { NOAH = d.noah; try { localStorage.setItem('arkVillage.noah', JSON.stringify(NOAH)); } catch (e) {} }
    if (d.titles) { for (var tk in (d.titles.got || {})) if (TITLES[+tk]) GOTTITLES[tk] = d.titles.got[tk]; if (typeof d.titles.t === 'number' && (d.titles.t < 0 || GOTTITLES[d.titles.t])) MYTITLE = d.titles.t; try { localStorage.setItem('arkVillage.title', String(MYTITLE)); localStorage.setItem('arkVillage.titles', JSON.stringify(GOTTITLES)); } catch (e) {} }
    if (d.adv) advMerge(d.adv);
    if (d.story) { mergeStory(d.story); try { localStorage.setItem('arkVillage.story', JSON.stringify(STORY)); } catch (e) {} }
    if (Number.isInteger(d.tutorial) && d.tutorial >= 0 && d.tutorial <= 9) {
      tutorialStep = d.tutorial; tutorialWalk = tutorialLook = false; tutorialDoor = null;
      if (tutorialStep === 4 || tutorialStep === 5) { if (!me || myPlot < 0) tutorialStep = 6; }
      if (tutorialStep === 7 && (!me || !NET.ok)) tutorialStep = 8;
      tutorialSave();
    }
    if (d.quest) {
      stats = d.quest.stats || stats; qStep = d.quest.step || 0;
      if (!tutorialStored && qStep >= 4) { tutorialStep = 9; tutorialSave(); }
      questSave();
    }
    tutorialStartLog = stats.log || 0; tutorialStartCraft = stats.crafted || 0;
    if (started) renderQuest();
    saveSettings(); saveCrops();
    try { localStorage.setItem('arkVillage.ach', JSON.stringify(ACH)); localStorage.setItem('arkVillage.herd', JSON.stringify(HERD)); } catch (e) {}
  }
  function stateSave(force) {
    if (!started) return;
    var str = JSON.stringify(stateGather());
    if (!force && str === lastStateStr) { stateDirtyF = false; return; }
    lastStateStr = str; stateDirtyF = false;
    try { localStorage.setItem('arkVillage.state', str); } catch (e) {}
    if (client && me && NET.ok && str.length < 60000) {
      var base = null; try { base = localStorage.getItem('arkVillage.stateSrv'); } catch (e) {}
      // 다른 기기가 그 사이 더 새로 저장했으면 덮지 않고 그 기록을 불러옴
      client.rpc('save_ark_state2', { p_data: JSON.parse(str), p_base: base }).then(function (r) {
        var d = r && r.data; if (r.error || !d) return;
        if (d.conflict) { stateApply(d.data); lastStateStr = JSON.stringify(stateGather()); bagChanged(); renderVitals(); toast('📱 다른 기기에서 더 나중에 한 기록을 불러왔어요'); }
        try { localStorage.setItem('arkVillage.stateSrv', d.at); localStorage.setItem('arkVillage.state', d.conflict ? JSON.stringify(d.data) : str); } catch (e) {}
      }, function () {});
    }
  }
  setInterval(function () { stateSave(false); }, 8000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stateSave(false); });
  try { var hv = JSON.parse(localStorage.getItem('arkVillage.state') || 'null'); if (hv) { if (typeof hv.hp === 'number') HP = hv.hp; if (typeof hv.food === 'number') FOOD = hv.food; SPAWN = hv.spawn || null; } } catch (e) {}
  function loadState() {
    if (!client || !me || !NET.ok) return Promise.resolve();
    return client.rpc('get_ark_state').then(function (r) {
      if (r.error || !r.data || !r.data.data) return;
      var srvAt = r.data.at, mine2 = null; try { mine2 = localStorage.getItem('arkVillage.stateSrv'); } catch (e) {}
      if (!mine2 || srvAt > mine2) { stateApply(r.data.data); try { localStorage.setItem('arkVillage.stateSrv', srvAt); localStorage.setItem('arkVillage.state', JSON.stringify(r.data.data)); } catch (e) {} }
    }, function () {});
  }

  // ════════ 「본향을 향하여」(히 11:16) — 긴 이야기: 서장 · 1부 믿음의 증표 · 2부 열두 기초석 · 3부 골짜기 · 4부 진주 문 ════════
  var STORY = { started: false, tokens: {}, s: { walk: 0, swim: 0, ladder: 0, shadows: 0, night: 0, bedsOut: 0, pitch: 0, arkY: {}, regions: {}, ararat: 0, laps: 0, lapDay: -1, lapAng: null, lapAcc: 0 },
    lamps: [0, 0, 0, 0, 0, 0, 0], sockets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], done: false, ended: false };
  function mergeStory(o) {
    if (!o) return;
    STORY.started = !!o.started; STORY.done = !!o.done; STORY.ended = !!o.ended; STORY.tokens = o.tokens || {};
    if (o.s) for (var k in o.s) STORY.s[k] = o.s[k];
    if (o.lamps && o.lamps.length === 7) STORY.lamps = o.lamps; if (o.sockets && o.sockets.length === 12) STORY.sockets = o.sockets;
  }
  try { mergeStory(JSON.parse(localStorage.getItem('arkVillage.story') || 'null')); } catch (e) {}
  function saveStory() { try { localStorage.setItem('arkVillage.story', JSON.stringify(STORY)); } catch (e) {} stateDirty(); }
  var ARARAT_TOP = 70;   // 아라랏 산 꼭대기로 치는 높이(가장 높은 곳이 76칸 — 시험으로 맞춤)
  var REGION_NAMES = { east: '동쪽 숲', west: '서쪽 산', lake: '남쪽 호수', sea: '북쪽 바다', desert: '동쪽 사막', oasis: '오아시스', ararat: '아라랏 산', tar: '역청 구덩이' };
  function sheepCount() { return HERD.filter(function (h) { return h.k === 'sheep'; }).length; }
  function nK(o) { return Object.keys(o || {}).length; }
  // 일곱 증표(히 11) — [키, 이름, 그림, 구절 장절, 구절, 할 일들, 받는 힘]
  var TOKENS = [
    ['abel', '아벨의 증표', '🐑', '히브리서 11:4', '믿음으로 아벨은 가인보다 더 나은 제사를 하나님께 드림으로 의로운 자라 하시는 증거를 얻었으니 하나님이 그 예물에 대하여 증언하심이라 그가 죽었으나 그 믿음으로써 지금도 말하느니라',
      function () { return [['내 땅 우리에서 양 12마리 기르기', sheepCount(), 12]]; }, '체력이 두 배 빨리 차올라요'],
    ['enoch', '에녹의 증표', '👣', '히브리서 11:5', '믿음으로 에녹은 죽음을 보지 않고 옮겨졌으니 하나님이 그를 옮기심으로 다시 보이지 아니하였느니라 그는 옮겨지기 전에 하나님을 기쁘시게 하는 자라 하는 증거를 받았느니라',
      function () { return [['걸어서 2만 칸 다니기', Math.floor(STORY.s.walk), 20000]]; }, '걷기·달리기가 10% 빨라져요'],
    ['noah', '노아의 증표', '⛵', '히브리서 11:7', '믿음으로 노아는 아직 보이지 않는 일에 경고하심을 받아 경외함으로 방주를 준비하여 그 집을 구원하였으니 이로 말미암아 세상을 정죄하고 믿음을 따르는 의의 상속자가 되었느니라',
      function () { return [['역청 칠한 나무 300개 만들기', STORY.s.pitch, 300], ['방주 하층·중층·상층 모두 가 보기', nK(STORY.s.arkY), 3]]; }, '물속에서 숨을 두 배 오래 참아요'],
    ['abraham', '아브라함의 증표', '⛺', '히브리서 11:8', '믿음으로 아브라함은 부르심을 받았을 때에 순종하여 장래의 유업으로 받을 땅에 나아갈새 갈 바를 알지 못하고 나아갔으며',
      function () { return [['여덟 곳 모두 가 보기(숲·산·호수·바다·사막·오아시스·아라랏 산·역청 구덩이)', nK(STORY.s.regions), 8], ['아라랏 산 꼭대기에 오르기', STORY.s.ararat, 1], ['마을 밖에서 침대에 누워 일곱 밤 자기', STORY.s.bedsOut, 7]]; }, '기운이 천천히 줄어요'],
    ['jacob', '야곱의 증표', '🪜', '히브리서 11:21', '믿음으로 야곱은 죽을 때에 요셉의 각 아들에게 축복하고 그 지팡이 머리에 의지하여 경배하였으며',
      function () { return [['사닥다리로 모두 120칸 오르기', Math.floor(STORY.s.ladder), 120]]; }, '사닥다리를 두 배 빨리 올라요'],
    ['moses', '모세의 증표', '🌊', '히브리서 11:29', '믿음으로 그들은 홍해를 육지 같이 건넜으나 애굽 사람들은 이것을 시험하다가 빠져 죽었으며',
      function () { return [['물에서 모두 600칸 헤엄치기', Math.floor(STORY.s.swim), 600], ['어둠의 그림자 40번 물리치기', STORY.s.shadows, 40]]; }, '헤엄이 빨라져요'],
    ['jericho', '여리고와 기드온의 증표', '📯', '히브리서 11:30 · 사사기 7:20', '믿음으로 칠 일 동안 여리고를 도니 성이 무너졌으며 (히 11:30) — 세 대가 나팔을 불며 항아리를 부수고 왼손에 횃불을 들고 오른손에 나팔을 들어 불며 외쳐 이르되 여호와와 기드온의 칼이다 하고 (삿 7:20)',
      function () { return [['하루(해 뜰 때부터 다음 해 뜰 때까지) 안에 방주 둘레 일곱 바퀴 돌기', Math.min(7, STORY.s.laps), 7], ['밤에 어둠의 그림자 30번 물리치기', STORY.s.night, 30]]; }, '어둠의 그림자에게 주는 힘 +1']
  ];
  function tokenTasks(t) { return t[5](); }
  function tokenReady(t) { return tokenTasks(t).every(function (q) { return q[1] >= q[2]; }); }
  function has(k) { return !!STORY.tokens[k]; }
  function partOf() {
    if (!STORY.started) return 0;
    if (nK(STORY.tokens) < 7) return 1;
    if (!FS_NAMES.every(function (n, i) { return have(FSTONE0 + i) > 0 || STORY.sockets[i]; })) return 2;
    if (STORY.lamps.some(function (v) { return !v; })) return 3;
    return 4;
  }
  var PART_NAMES = ['서장 「떠나라」', '1부 「믿음의 증표」', '2부 「열두 기초석」', '3부 「사망의 음침한 골짜기」', '4부 「진주 문」'];
  function storyCard(emoji, name, text, ref, sub, ms) {
    $('cardEmoji').textContent = emoji; $('cardName').textContent = name; $('cardText').textContent = text; $('cardRef').textContent = ref; $('cardNew').textContent = sub || '';
    $('card').classList.add('show'); sfx('craft', 1400); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, ms || 14000);
  }
  function startStory() {
    if (STORY.started) { openStory(); return; }
    if (qStep < QUEST.length && !isAdm()) { storyCard('🧭', '안내하는 나그네', '여호와께서 아브람에게 이르시되 너는 너의 고향과 친척과 아버지의 집을 떠나 내가 네게 보여 줄 땅으로 가라', '창세기 12:1', '먼저 위의 할 일(첫 집 짓기)을 다 마치면 길을 떠날 수 있어요'); return; }
    STORY.started = true; saveStory();
    storyCard('🧭', '서장 「떠나라」', '여호와께서 아브람에게 이르시되 너는 너의 고향과 친척과 아버지의 집을 떠나 내가 네게 보여 줄 땅으로 가라', '창세기 12:1', '본향을 향한 길이 시작됐어요 — 메뉴 → 📜 나그네의 길에서 할 일을 봐요', 16000);
    renderQuest();
  }
  // 걸음·헤엄·사닥다리·방주 둘레 바퀴(매 프레임)
  function storyStep(dt, moved) {
    if (!STORY.started || !vitalsOn() && !isAdm()) return;
    var s = STORY.s;
    if (P.swim) s.swim += moved; else if (P.ground && !riding) s.walk += moved;
    if (P.ladder && P.vy > 0) s.ladder += P.vy * dt;
    // 방주 둘레: 방주 밖, 방주를 둘러싼 테 안에서 각도를 모아 바퀴 수로
    var cx = XM, cz = (AZ0 + AZ1) / 2, dx = P.x - cx, dz = P.z - cz, ring = Math.abs(dx) <= 230 && Math.abs(dz) <= 120 && !(Math.abs(dx) < 152 && Math.abs(dz) < 27);
    var day = Math.floor((dayT + DAY_LEN * 0.06) / DAY_LEN);
    if (day !== s.lapDay) { s.lapDay = day; s.lapAcc = 0; s.lapAng = null; }
    if (ring) { var a = Math.atan2(dz, dx); if (s.lapAng !== null) { var da = a - s.lapAng; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; s.lapAcc += da; } s.lapAng = a; s.laps = Math.max(s.laps || 0, Math.floor(Math.abs(s.lapAcc) / (Math.PI * 2))); }
    else s.lapAng = null;
  }
  // 1초마다: 가 본 곳, 증표 받기, 성문, 엔딩
  var storyT = 0;
  function storyTick(dt) {
    if (!STORY.started) return;
    storyT -= dt; if (storyT > 0) return; storyT = 1;
    var s = STORY.s, x = Math.floor(P.x), z = Math.floor(P.z), reg = region(x, z), pn = placeName(), ch = false;
    if (REGION_NAMES[reg] && !s.regions[reg]) { s.regions[reg] = 1; ch = true; toast('📜 「' + REGION_NAMES[reg] + '」에 왔어요 (' + nK(s.regions) + '/8)'); }
    var ak = pn === '방주 하층' ? 'lo' : pn === '방주 중층' ? 'mid' : pn === '방주 상층' ? 'hi' : '';
    if (ak && !s.arkY[ak]) { s.arkY[ak] = 1; ch = true; }
    if (reg === 'ararat' && P.y >= ARARAT_TOP && !s.ararat) { s.ararat = 1; ch = true; toast('⛰ 아라랏 산 꼭대기에 올랐어요 (창 8:4)'); }
    TOKENS.forEach(function (t) {
      if (has(t[0]) || !tokenReady(t)) return;
      STORY.tokens[t[0]] = Date.now(); ch = true;
      storyCard(t[2], '믿음의 증표 — ' + t[1], t[4], t[3], '받은 힘: ' + t[6] + ' · 증표 ' + nK(STORY.tokens) + '/7');
      if (nK(STORY.tokens) === 7) { unlock('tokens'); setTimeout(function () { toast('🎖 일곱 증표를 다 받았어요! 2부 「열두 기초석」 — 세상 곳곳 땅속의 보석을 찾아요'); }, 15000); }
    });
    if (!STORY.done && STORY.sockets.every(Boolean) && nK(STORY.tokens) === 7 && STORY.lamps.every(Boolean)) openGates();
    if (STORY.done && !STORY.ended && cityInside(x, z)) showEnding();
    if (ch) saveStory();
    if (ui === 'play' && qStep >= QUEST.length) renderQuest();
  }
  // 3부: 등잔대를 횃불로 밝히기
  function localSet(x, y, z, id) { NET.applying = true; try { setBlock(x, y, z, id); } finally { NET.applying = false; } }
  function useLampstand(x, y, z) {
    var k = -1; DUN_LAMPS.forEach(function (c, i) { if (DUN.x0 + c[0] * DUN.cs + 2 === x && DUN.z0 + c[1] * DUN.cs + 2 === z) k = i; });
    if (k < 0) return;
    if (STORY.lamps[k]) return toast('이미 밝힌 등잔대예요 (' + STORY.lamps.filter(Boolean).length + '/7)');
    if (!(HOTBAR[sel] === TORCH && have(TORCH) > 0)) return deny('횃불을 손에 들고 누르면 등잔대에 불을 밝혀요');
    take(TORCH, 1); bagChanged(); STORY.lamps[k] = 1; localSet(x, y, z, LAMPSTAND + 1); saveStory(); sfx('craft', 900);
    var n = STORY.lamps.filter(Boolean).length;
    if (n < 7) toast('🕯 등잔대에 불을 밝혔어요 (' + n + '/7)');
    else { unlock('valley'); storyCard('🕯', '골짜기의 빛', '내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라 주의 지팡이와 막대기가 나를 안위하시나이다', '시편 23:4', '일곱 등잔대를 다 밝혔어요 — 4부 「진주 문」: 동쪽 끝 거룩한 성으로 가요'); }
  }
  // 4부: 기초석 자리에 맞는 기초석 넣기
  function useSocket(x, y, z) {
    var k = -1; for (var i = 0; i < 12; i++) { var sp = socketPos(i); if (sp[0] === x && sp[1] === y && sp[2] === z) k = i; }
    if (k < 0 || STORY.sockets[k]) return;
    var need = FSTONE0 + k;
    if (!(HOTBAR[sel] === need && have(need) > 0)) return deny('이 자리에는 「' + FS_NAMES[k] + ' 기초석」을 손에 들고 눌러요 (' + (k + 1) + '번째 기초석, 계 21:19-20)');
    take(need, 1); bagChanged(); STORY.sockets[k] = 1; localSet(x, y, z, need); saveStory(); sfx('craft', 700);
    var n = STORY.sockets.filter(Boolean).length;
    toast('💎 ' + FS_NAMES[k] + ' 기초석을 놓았어요 (' + n + '/12)' + (n === 12 && (nK(STORY.tokens) < 7 || !STORY.lamps.every(Boolean)) ? ' — 증표 일곱과 일곱 등잔대도 있어야 문이 열려요' : ''));
    if (n === 12) unlock('stones');
  }
  function regenArea(ax0, az0, ax1, az1) {
    for (var cz = az0 >> 5; cz <= az1 >> 5; cz++) for (var cx = ax0 >> 5; cx <= ax1 >> 5; cx++) { var k = cz * NC + cx; if (!COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); } }
  }
  function openGates() {
    STORY.done = true; saveStory();
    regenArea(CITY.x0 - 4, CITY.z0 - 4, CITY.x1 + 4, CITY.z1 + 4);
    storyCard('🚪', '열두 진주 문이 열렸어요', '그 열두 문은 열두 진주니 각 문마다 한 개의 진주로 되어 있고 성의 길은 맑은 유리 같은 정금이더라', '요한계시록 21:21', '성 안으로 들어가요');
  }
  function showEnding() {
    STORY.ended = true; saveStory(); unlock('home');
    var s = STORY.s, el = $('endingText'); el.innerHTML = '';
    var lines = [
      ['또 내가 보매 거룩한 성 새 예루살렘이 하나님께로부터 하늘에서 내려오니 그 준비한 것이 신부가 남편을 위하여 단장한 것 같더라', '요한계시록 21:2'],
      ['내가 들으니 보좌에서 큰 음성이 나서 이르되 보라 하나님의 장막이 사람들과 함께 있으매 하나님이 그들과 함께 계시리니 그들은 하나님의 백성이 되고 하나님은 친히 그들과 함께 계셔서', '요한계시록 21:3'],
      ['모든 눈물을 그 눈에서 닦아 주시니 다시는 사망이 없고 애통하는 것이나 곡하는 것이나 아픈 것이 다시 있지 아니하리니 처음 것들이 다 지나갔음이러라', '요한계시록 21:4'],
      ['또 그가 수정 같이 맑은 생명수의 강을 내게 보이니 하나님과 및 어린 양의 보좌로부터 나와서', '요한계시록 22:1'],
      ['길 가운데로 흐르더라 강 좌우에 생명나무가 있어 열두 가지 열매를 맺되 달마다 그 열매를 맺고 그 나무 잎사귀들은 만국을 치료하기 위하여 있더라', '요한계시록 22:2'],
      ['그들이 이제는 더 나은 본향을 사모하니 곧 하늘에 있는 것이라 이러므로 하나님이 그들의 하나님이라 일컬음 받으심을 부끄러워하지 아니하시고 그들을 위하여 한 성을 예비하셨느니라', '히브리서 11:16']
    ];
    lines.forEach(function (l, i) { var p = document.createElement('p'); p.style.animationDelay = (i * 2.2) + 's'; p.textContent = l[0]; var r = document.createElement('small'); r.textContent = l[1]; p.appendChild(r); el.appendChild(p); });
    $('endingStats').textContent = '걸은 길 ' + Math.floor(s.walk).toLocaleString() + '칸 · 헤엄 ' + Math.floor(s.swim).toLocaleString() + '칸 · 물리친 어둠의 그림자 ' + s.shadows + ' · 믿음의 증표 7 · 기초석 12 · 등잔대 7';
    openPanel('ending');
  }
  // 📜 나그네의 길(이야기 진행판)
  function openStory() { openPanel('story'); renderStory(); sfx('click'); }
  function bar(cur, need) { var f = Math.max(0, Math.min(1, cur / need)); return '<span class="sbar"><s style="width:' + Math.round(f * 100) + '%"></s></span> <b>' + Math.min(cur, need).toLocaleString() + '/' + need.toLocaleString() + '</b>'; }
  function dirText(tx, tz) { var dx = tx - P.x, dz = tz - P.z, d = Math.round(Math.hypot(dx, dz)); var ns = dz < -d * 0.38 ? '북' : (dz > d * 0.38 ? '남' : ''), ew = dx > d * 0.38 ? '동' : (dx < -d * 0.38 ? '서' : ''); return (ns + ew || '바로 여기') + (d > 3 ? '쪽 ' + d + '칸' : ''); }
  function renderStory() {
    var L = $('storyBody'), h = '', part = partOf();
    function esc(t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
    h += '<div class="sverse">이는 그가 하나님이 계획하시고 지으실 터가 있는 성을 바랐음이라 <small>(히브리서 11:10)</small></div>';
    if (!STORY.started) h += '<div class="spart on"><h3>' + PART_NAMES[0] + '</h3><p>' + (qStep < QUEST.length ? '먼저 위의 할 일(첫 집 짓기)을 다 마쳐요. 그다음 나그네 마을 입구의 「안내하는 나그네」를 찾아가 말을 걸어요.' : '나그네 마을 입구의 「안내하는 나그네」를 찾아가 말을 걸면 길이 시작돼요.') + '</p></div>';
    else {
      h += '<div class="spart' + (part === 1 ? ' on' : ' done') + '"><h3>' + PART_NAMES[1] + ' <small>' + nK(STORY.tokens) + '/7</small></h3>';
      TOKENS.forEach(function (t) {
        h += '<div class="stok' + (has(t[0]) ? ' got' : '') + '"><b>' + t[2] + ' ' + esc(t[1]) + '</b> <small>' + t[3] + ' · 받는 힘: ' + esc(t[6]) + '</small>';
        tokenTasks(t).forEach(function (q) { h += '<div class="stask">' + esc(q[0]) + ' ' + bar(q[1], q[2]) + '</div>'; });
        h += '</div>';
      });
      h += '</div>';
      h += '<div class="spart' + (part === 2 ? ' on' : (part > 2 ? ' done' : '')) + '"><h3>' + PART_NAMES[2] + ' <small>계 21:19-20</small></h3><p>세상 곳곳 땅속 깊은 곳에 열두 보석이 있어요. 보석 3개와 금 덩이 1개로 제작대에서 기초석을 만들어요. 귀한 보석은 금강석 곡괭이가 있어야 캐요.</p><div class="sgems">';
      FS_NAMES.forEach(function (n, i) {
        var g = GEMS[i], ok = have(FSTONE0 + i) > 0 || STORY.sockets[i], where = g ? (g[3] === 'south' ? '남쪽 들판' : REGION_NAMES[g[3]]) + ' · ' + (g[4] > 30 ? '높은 바위 속' : (g[5] <= 8 ? '아주 깊은 곳' : '땅속')) : '어디든 깊은 곳';
        h += '<span class="sg' + (ok ? ' got' : '') + '">' + (ok ? '💎' : '◇') + ' ' + n + '<small>' + where + ' · 보석 ' + have(gemItem(i)) + '/3</small></span>';
      });
      h += '</div></div>';
      h += '<div class="spart' + (part === 3 ? ' on' : (part > 3 ? ' done' : '')) + '"><h3>' + PART_NAMES[3] + ' <small>시 23:4</small></h3><p>동쪽 사막 땅속 깊이 깨지지 않는 미로가 있어요. 어둠의 그림자와 큰 그림자가 끝없이 나와요. 일곱 등잔대를 찾아 횃불을 들고 눌러 밝혀요. 입구: ' + dirText(DUN.x0 + 2, DUN.z0 + (DUN.n - 1) * DUN.cs + 2) + '</p>' + bar(STORY.lamps.filter(Boolean).length, 7) + '</div>';
      h += '<div class="spart' + (part === 4 ? ' on' : '') + '"><h3>' + PART_NAMES[4] + ' <small>계 21:12·21</small></h3><p>세상 동쪽 끝에 벽옥 성곽과 열두 진주 문이 있어요. 서쪽 성벽 밖의 기초석 자리 열둘에 기초석을 하나씩 들고 눌러 놓아요. 증표 일곱·등잔대 일곱·기초석 열둘이 다 갖춰지면 문이 열려요. 성: ' + dirText((CITY.x0 + CITY.x1) / 2, (CITY.z0 + CITY.z1) / 2) + '</p>' + bar(STORY.sockets.filter(Boolean).length, 12) + '</div>';
      if (STORY.ended) h += '<div class="spart done"><h3>🏙 본향에 이르렀어요</h3><p>그래도 길은 계속돼요. 성 안을 거닐고, 마을로 돌아가 친구들을 도와요.</p></div>';
    }
    L.innerHTML = h;
    $('storyStart').style.display = STORY.started ? 'none' : '';
  }

  // ───────── 함께 놀기(2단계): 친구 보기 · 블록 함께 바꾸기 · 채팅 ─────────
  // 실시간 채널 'ark-world'(로그인 회원만, DB 정책)로 위치·블록 바꿈을 주고받고, 내 땅 밖에서 바꾼 자리는 DB(ark_world_edits)에 남긴다.
  // 채팅은 DB 함수(send_ark_chat)로만 써서 이름을 속일 수 없고, 새 글·지운 글은 DB 변경 알림으로 받는다.
  var NET = { ok: false, ready: false, ch: null, on: false, nick: '', admin: false, meta: {}, peers: {}, q: [], pm: {}, flushT: 0, sentAt: 0, sentKey: '', applying: false,
    chat: [], chatIds: {}, reported: {}, joinedAt: 0, holdUntil: 0, edits: null, pp: {}, names: {}, nameAsk: {} };
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
    var m = NET.meta[p.u], n = NET.names[p.u] || '친구', wk = (m && m.w) || '';   // 이름은 서버의 닉네임만
    if (wk !== p.wk) {   // 친구 모습·옷이 바뀌면 다시 만듦
      p.wk = wk;
      var a = wk.split('.').map(function (v) { return v | 0; }), worn = {};
      SLOTS.forEach(function (s, i) { var id = a[i + 1]; if (id && WEARINFO[id] && WEARINFO[id].slot === s) worn[s] = id; });
      var nav = makeAvatar(wk && LOOKS[a[0]] ? LOOKS[a[0]] : peerLook(p.u)); dressAvatar(nav, worn);
      nav.position.copy(p.av.position); nav.rotation.y = p.av.rotation.y; nav.visible = p.av.visible;
      if (p.tag) nav.add(p.tag); if (p.bub) nav.add(p.bub);
      scene.remove(p.av); p.av = nav; scene.add(nav);
      if (p.wi) handItem(nav, p.wi);
    }
    var ti = m && typeof m.t === 'number' && TITLES[m.t] ? m.t : -1, mate = partyMate(p.u);   // 칭호는 정해진 목록 번호만
    var key = n + '|' + ti + '|' + mate;
    if (key === p.nick) return;
    p.nick = key; disposeSprite(p.tag);
    p.tag = textSprite((ti >= 0 ? '「' + TITLES[ti] + '」 ' : '') + (mate ? '🤝' : '') + shortName(n, 8), mate ? 'rgba(30,110,40,0.7)' : 'rgba(0,0,0,0.45)', '#ffffff', 0.62); p.tag.position.y = HT + 0.7; p.av.add(p.tag);
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
    p.mapHidden = m.mapHidden === true;
    p.restPose = m.rest === 'sit' || m.rest === 'lie' ? m.rest : '';
    p.restYaw = typeof m.restYaw === 'number' && Number.isFinite(m.restYaw) ? m.restYaw : 0;
    p.tx = m.x; p.ty = m.y; p.tz = m.z; p.th = m.h || 0; p.pt = m.p || 0; p.s = m.s ? 1 : 0; p.w = m.w ? 1 : 0; p.t = performance.now();
    if (p.fresh) { p.fresh = false; p.x = p.tx; p.y = p.ty; p.z = p.tz; p.h = p.th; }
    var wi = typeof m.i === 'number' && m.i > 0 && B[m.i] ? m.i : 0;
    if (wi !== (p.wi || 0)) { p.wi = wi; handItem(p.av, wi); }
    var rk = BEASTS[m.r] ? m.r : '';
    if (rk !== p.rk) {
      if (p.beast) { scene.remove(p.beast.mesh); p.beast = null; }
      p.rk = rk;
      if (rk) { p.beast = makeBeast(rk, p.x, p.z); putSaddle(p.beast); }
    }
  }
  function sendPos(now) {
    var r = riding ? riding.kind : '', s = (mine && !mine.denied) || swingT > 0 ? 1 : 0, wv = performance.now() < waveUntil ? 1 : 0;
    var m = { u: me.id, x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), h: +P.yaw.toFixed(2), p: +P.pitch.toFixed(2), r: r, s: s, i: heldShown(), mapHidden: S.mapVisible === false || (myPlot >= 0 && plotAt(Math.floor(P.x), Math.floor(P.z)) === myPlot) };
    if (furnitureRest) { m.rest = furnitureRest.pose; m.restYaw = furnitureRest.yaw; }
    if (wv) m.w = 1;
    var key = [m.x, m.y, m.z, m.h, m.p, r, s, wv, m.i, m.mapHidden, m.rest, m.restYaw].join();
    if ((key === NET.sentKey && now - NET.sentAt < 2500) || now - NET.sentAt < 110) return;
    NET.sentKey = key; NET.sentAt = now;
    NET.ch.send({ type: 'broadcast', event: 'pos', payload: m });
  }
  function netTick(dt, now) {
    if (!NET.ch) return;
    if (started) sendPos(now);
    if (now >= FRIENDS.poll) { FRIENDS.poll = now + 20000; friendsFetch(); }
    if (started) fetchGoal();
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
      p.av.position.set(p.x, p.y + seat, p.z); p.av.rotation.set(0, p.h, 0, 'YXZ');
      var pr = p.av.userData, sw = p.rk || mv < 0.003 ? 0 : Math.sin(p.walk * 1.6) * 0.75;
      pr.legL.rotation.x = sw; pr.legR.rotation.x = -sw;
      pr.legL.rotation.z = p.rk ? -0.45 : 0; pr.legR.rotation.z = p.rk ? 0.45 : 0;
      pr.armL.rotation.x = -sw * 0.8; pr.armR.rotation.x = p.w ? -2.7 : sw * 0.8 - (p.s ? 0.9 + Math.sin(now / 70) * 0.5 : 0);
      pr.armR.rotation.z = p.w ? Math.sin(now / 110) * 0.45 : 0;   // 손 흔들기
      pr.head.rotation.x = p.pt * 0.7;
      if (p.restPose && !p.rk) poseFurnitureAvatar(p.av, p.restPose, p.x, p.y, p.z, p.restYaw);
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
    var p = plotAt(x, z), adm = isAdm();
    if (p >= 0 && p !== myPlot) {   // 다른 사람 땅은 관리자만: 블록 부분 저장 + 실시간으로 주인·다른 사람에게
      if (!adm) return;
      adminPlotDirty(p); NET.pp[x + ',' + y + ',' + z] = id; if (!NET.flushT) NET.flushT = setTimeout(netFlush, 150); return;
    }
    if (inArk(x, y, z) && !adm) return;
    // 친구에게는 서버가 검사해서 받은 것만 전달된다(DB 변경 알림) — 내 땅은 put_plot_edits, 땅 밖은 put_ark_edits
    if (p >= 0) { NET.pp[x + ',' + y + ',' + z] = id; if (!NET.flushT) NET.flushT = setTimeout(netFlush, 150); }
    else NET.pm[x + ',' + y + ',' + z] = id;
  }
  function netFlush() {
    NET.flushT = 0;
    var ks = Object.keys(NET.pp); if (!ks.length || !client) return;
    var arr = ks.slice(0, 300).map(function (k) { var a = k.split(','); return [+a[0], +a[1], +a[2], NET.pp[k]]; });
    ks.slice(0, 300).forEach(function (k) { delete NET.pp[k]; });
    client.rpc('put_plot_edits', { p_edits: arr }).then(function () {}, function () {});
    if (ks.length > 300) NET.flushT = setTimeout(netFlush, 300);
  }
  // 서버에서 온 바꿈을 잠깐 모아 한꺼번에 그림
  var inBuf = {}, inT = 0;
  function queueRemote(u, e) { if (NET.testMute) return;   // 시험: 끊긴 동안 못 받은 것처럼
 (inBuf[u] || (inBuf[u] = [])).push(e); if (!inT) inT = setTimeout(function () { inT = 0; var b = inBuf; inBuf = {}; for (var k in b) applyRemote(k, b[k]); }, 80); }
  // 선생님이 함께 짓는 터를 되돌리면: 지워진 자리를 처음 모습으로(그 기둥을 다시 만듦)
  var revBuf = {}, revT = 0;
  function queueRevert(x, y, z) {
    if (x < 0 || z < 0 || x >= WS || z >= WS) return;
    var k = (z >> 5) * NC + (x >> 5), li = (y * CS + (z & 31)) * CS + (x & 31);
    if (EDITS[k]) delete EDITS[k][li];
    revBuf[k] = 1;
    if (!revT) revT = setTimeout(function () {
      revT = 0; var ks = Object.keys(revBuf); revBuf = {}; saveEdits();
      ks.forEach(function (kk) {
        kk = +kk; var cx = kk % NC, cz = Math.floor(kk / NC); if (!COLS[kk]) return;
        var was = meshedCols[kk]; genColumn(cx, cz);
        if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); }
      });
    }, 300);
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
      if (!r.error && r.data>=0 && r.data<arr.length && villageProjectsEnabled) {
        var areas=Object.keys(VILLAGE_PROJECTS).filter(function(k){return arr.some(function(e){return inProject(VILLAGE_PROJECTS[k],e[0],e[2]);});});
        areas.forEach(syncVillageProject);
        if(areas.length){fetchVillageProjects();toast('그 공사장에는 놓이지 않은 블록이 있어요');}
      }
      if(!r.error&&r.data>=0&&r.data<arr.length&&frontierEnabled)syncRejectedFrontier(arr);
      if (r.error || r.data === -3) { requeue(arr); NET.holdUntil = performance.now() + (r.data === -3 ? 30000 : 6000); }
    }, function () { persistBusy = false; requeue(arr); NET.holdUntil = performance.now() + 6000; });
  }
  setInterval(netPersist, 600);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { if (NET.flushT) { clearTimeout(NET.flushT); netFlush(); } netPersist(); } });
  function plotPut(p, x, y, z, id) {
    if (y < PY0 || y >= G + PH) return;
    if (!plotData[p]) plotData[p] = plotDefault();
    var o = plotOrigin(p); plotData[p][((y - PY0) * PLOT + (z - o.z)) * PLOT + (x - o.x)] = id;
  }
  // 친구가 바꾼 블록을 내 세계에 반영(그림은 한 번에 다시 그림)
  var ARK_ADMINS = {}, adminTouchedMine = false;
  function applyRemote(u, list) {
    var bb = null, lit = []; adminTouchedMine = false;
    NET.applying = true;
    try {
      var fxN = 0;
      for (var i = 0; i < list.length; i++) {
        var e = list[i]; if (!e || e.length !== 4) continue;
        var x = e[0] | 0, y = e[1] | 0, z = e[2] | 0, id = e[3] | 0;
        if (y < 1 || y >= SY || x < 0 || z < 0 || x >= WS || z >= WS || (id !== AIR && !B[id])) continue;
        var p = plotAt(x, z);
        if (p >= 0) {
          if (ARK_ADMINS[u]) { plotPut(p, x, y, z, id); if (p === myPlot) adminTouchedMine = true; }   // 관리자가 고친 것은 주인 기기에도 반영
          else {
            if (p === myPlot || (plotUser[p] && plotUser[p] !== u)) continue;   // 그 땅 주인이 바꾼 것만
            plotUser[p] = u; plotOwners[p] = 1; plotPut(p, x, y, z, id);
          }
        } else recordEdit(x, y, z, id);
        var was = readBlock(x, y, z); if (was === id) continue;
        if (u !== 'sync' && fxN < 3 && colAt(x, z)) {   // 가까이에서 다른 사람이 캐거나 놓으면 조각·소리
          var fdx = x + 0.5 - P.x, fdz = z + 0.5 - P.z, fd2 = fdx * fdx + fdz * fdz;
          if (fd2 < 400) { fxN++; if (id === AIR && was !== AIR && B[was]) { burst(x, y, z, was, fd2 > 100); if (fd2 < 144) sfx('break', matSound(was)); } else if (id !== AIR && fd2 < 144) sfx('place', matSound(id)); }
        }
        setRaw(x, y, z, id);
        var c0 = colAt(x, z); updateFrontierMachine(c0,x,y,z,id); if (!c0) continue;
        c0.mod = true; updateSky(x, z);
        if (LIGHTS[was] || LIGHTS[id]) {
          if (LIGHTS[id]) c0.lamps.push([x, y, z]); else c0.lamps = c0.lamps.filter(function (l) { return l[0] !== x || l[1] !== y || l[2] !== z; });
          lit.push([x, y, z]);
        }
        if (!bb) bb = [x, y, z, x, y, z];
        else { bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.min(bb[2], z); bb[3] = Math.max(bb[3], x); bb[4] = Math.max(bb[4], y); bb[5] = Math.max(bb[5], z); }
      }
    } finally { NET.applying = false; }
    if (adminTouchedMine && myPlot >= 0) markDirty();   // 관리자가 내 땅을 고쳤으면 그 모습으로 저장(덮어쓰지 않게)
    lit.forEach(function (l) { lampChanged(l[0], l[1], l[2]); });
    if (bb) rebuildBox(bb[0] - 1, bb[1] - 1, bb[2] - 1, bb[3] + 1, bb[4] + 1, bb[5] + 1);
  }

  // 다시 연결되면(휴대폰 화면이 꺼졌다 켜짐·인터넷이 잠깐 끊김) 그동안 다른 사람이 바꾼 것을 받아 온다
  // — 실시간 알림은 끊겨 있던 동안의 것을 다시 보내 주지 않기 때문(11/19 「A가 판 게 B에게 안 보여요」)
  var resyncBusy = false, plotSeen = {}, hiddenAt = 0;
  function resyncWorld() {
    if (resyncBusy || !client || !me || !NET.ready) return;
    resyncBusy = true;
    var jobs = [];
    var p1 = client.rpc('get_ark_edits').then(function (r) {
      if (!r || r.error || typeof r.data !== 'string' || !r.data) return;
      var byCol = {};
      r.data.split(';').forEach(function (s) {
        var a = s.split(','); if (a.length !== 4) return;
        var x = +a[0], y = +a[1], z = +a[2], id = +a[3];
        if (x < 0 || z < 0 || x >= WS || z >= WS || y < 1 || y >= SY || plotAt(x, z) >= 0) return;
        if (NET.pm[x + ',' + y + ',' + z] !== undefined) return;   // 내가 아직 보내는 중인 것은 그대로
        var k = (z >> 5) * NC + (x >> 5), li = (y * CS + (z & 31)) * CS + (x & 31);
        if (EDITS[k] && EDITS[k][li] === id && (!COLS[k] || readBlock(x, y, z) === id)) return;
        (byCol[k] || (byCol[k] = [])).push([x, y, z, id]);
      });
      for (var k in byCol) jobs.push(byCol[k]);
    });
    var p2 = client.from('ark_village_plots').select('plot_idx,data,user_id,updated_at').then(function (r) {
      (r && r.data || []).forEach(function (row) {
        if (!row.data || row.user_id === me.id || plotSeen[row.plot_idx] === row.updated_at) return;
        plotSeen[row.plot_idx] = row.updated_at; plotOwners[row.plot_idx] = 1; plotUser[row.plot_idx] = row.user_id;
        decodePlot(row.plot_idx, row.data, false); jobs.push({ plot: row.plot_idx });
      });
    });
    Promise.all([p1, p2]).then(function () {
      (function step() {   // 한 번에 한 기둥씩(휴대폰이 멈추지 않게)
        var j = jobs.shift(); if (!j) { resyncBusy = false; return; }
        if (j.plot !== undefined) regenPlotCols(j.plot); else applyRemote('sync', j);
        setTimeout(step, 30);
      })();
    }, function () { resyncBusy = false; });
  }
  function regenPlotCols(p) {
    var o = plotOrigin(p);
    for (var cz = (o.z - 1) >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = (o.x - 1) >> 5; cx <= (o.x + PLOT) >> 5; cx++) {
      var k = cz * NC + cx; if (!inWorldC(cx, cz) || !COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); }
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) hiddenAt = performance.now();
    else if (hiddenAt && performance.now() - hiddenAt > 15000) { hiddenAt = 0; setTimeout(resyncWorld, 1500); }
  });

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
      client.rpc('get_ark_admin_ids').then(function (r) { if (r && Array.isArray(r.data)) r.data.forEach(function (id) { ARK_ADMINS[id] = 1; }); }, function () {}),
      client.rpc('get_my_ark_name').then(function (r) { if (!r.error && r.data) { NET.nick = r.data.nick || '친구'; NET.admin = !!r.data.admin; NET.ok = true; if (NET.admin) window.__arkDebug = ARK_DBG; document.body.classList.toggle('adm', NET.admin); try { bagChanged(); } catch (e) {} } }, function () {}),
      client.rpc('get_ark_edits').then(function (r) { if (!r.error && typeof r.data === 'string') NET.edits = r.data; }, function () {})
    ]).then(function () {
      if (!NET.ok) return;   // DB 준비 전이면 혼자 놀기 그대로
      uploadLocalOnce();
      if (NET.edits) NET.edits.split(';').forEach(function (s) {
        var a = s.split(','); if (a.length !== 4) return;
        var x = +a[0], y = +a[1], z = +a[2];
        if (plotAt(x, z) >= 0) return;   // 방주 안 고침도 받는다(서버가 관리자만 허용)
        recordEdit(x, y, z, +a[3]); delete NET.pm[x + ',' + y + ',' + z];
      });
      NET.edits = null; NET.ready = true;
      return loadState().then(function () { return client.auth.getSession(); }).then(function (s) {
        try { if (s && s.data && s.data.session) client.realtime.setAuth(s.data.session.access_token); } catch (e) {}
        netConnect();
      });
    }).catch(function () {});
  }
  function netConnect() {
    if (!client || !me || NET.chan) return;
    var ch = NET.chan = client.channel('ark-world', { config: { private: true, presence: { key: me.id }, broadcast: { self: false } } });
    ch.on('broadcast', { event: 'pos' }, function (r) { onPos(r.payload); })
      // 블록 바꿈은 휴대폰끼리 직접 주고받지 않고, 서버가 검사해서 받은 것만(DB 변경 알림)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ark_world_edits' }, function (r) { var w = r.new; if (w && w.user_id !== me.id) queueRemote(w.user_id, [w.x, w.y, w.z, w.id]); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ark_world_edits' }, function (r) { var w = r.new; if (w && w.user_id !== me.id) queueRemote(w.user_id, [w.x, w.y, w.z, w.id]); })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ark_world_edits' }, function (r) { var w = r.old; if (w && w.x !== undefined) queueRevert(w.x, w.y, w.z); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ark_plot_edits' }, function (r) { var w = r.new; if (w && w.user_id !== me.id) queueRemote(w.user_id, [w.x, w.y, w.z, w.b]); })
      .on('presence', { event: 'sync' }, function () {
        var st = ch.presenceState(); NET.meta = {};
        for (var key in st) if (st[key] && st[key][0]) NET.meta[key] = st[key][0];
        fetchNames(Object.keys(NET.meta));
        for (var u in NET.peers) { if (!NET.meta[u]) peerRemove(u); else peerName(NET.peers[u]); }
        netPill(); if (ui === 'chat') chatWho();
      })
      .on('presence', { event: 'join' }, function (r) {
        var key3 = r.key; NET.sentKey = '';
        if (key3 === me.id || performance.now() - NET.joinedAt <= 4000) return;
        setTimeout(function () {
          if (!NET.meta[key3] || FRIENDS.hidden.has(key3)) return;
          var friend = FRIENDS.accepted.has(key3), n = NET.names[key3];
          if (!n) return;
          chatSys((friend ? '💙 친구 ' : '') + n + ' 님이 들어왔어요');
        }, 600);   // 서버 닉네임을 받은 뒤
      })
      .on('presence', { event: 'leave' }, function (r) {
        var n = NET.names[r.key];
        if (r.key !== me.id && n && !NET.meta[r.key] && !FRIENDS.hidden.has(r.key)) chatSys(n + ' 님이 나갔어요');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ark_chat' }, function (r) {
        var c = r.new; if (c && c.id) addChat({ id: c.id, nick: c.nick, body: c.body, mine: c.user_id === me.id, uid: c.user_id, reports: 0 }, true);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ark_chat' }, function (r) { if (r.old && r.old.id) removeChat(r.old.id); })
      .subscribe(function (status) {
        if (status === 'SUBSCRIBED') {
          var first = !NET.ch; NET.ch = ch; NET.on = true; NET.joinedAt = performance.now(); NET.sentKey = '';
          trackMe();
          FRIENDS.poll = 0;
          netPill(); loadChat(); PARTY.pollT = 0;
          if (first) chatSys('함께 놀기에 들어왔어요 — 💬' + (isTouch ? '' : '(T)') + '로 이야기해요');
          else resyncWorld();   // 끊겼다가 다시 붙음: 그동안 바뀐 것 받아 오기
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') { NET.on = false; netPill(); }
      });
  }
  // 이름표에 쓸 닉네임은 서버에서(휴대폰이 보낸 이름을 믿지 않음)
  function fetchNames(ids) {
    var need = ids.filter(function (u) { return !NET.names[u] && !NET.nameAsk[u] && /^[0-9a-f-]{36}$/.test(u); }).slice(0, 50);
    if (!need.length || !client) return;
    need.forEach(function (u) { NET.nameAsk[u] = 1; });
    client.rpc('get_ark_names', { p_ids: need }).then(function (r) {
      (r.data || []).forEach(function (row) { NET.names[row.user_id] = row.nick || '친구'; });
      for (var u in NET.peers) peerName(NET.peers[u]);
      if (ui === 'chat') chatWho();
    }, function () { need.forEach(function (u) { delete NET.nameAsk[u]; }); });
  }
  function netPill() {
    var n = Object.keys(NET.meta).length;
    $('netState').textContent = NET.on ? '👥 ' + Math.max(1, n) + '명 함께' : (NET.ready ? '👥 연결 중…' : '');
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
    var names = Object.keys(NET.meta).map(function (k) { return shortName(k === (me && me.id) ? NET.nick : (NET.names[k] || '친구'), 6); });
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
    openPanel('chat'); tutorialEvent('chat'); renderChat(); sfx('click');
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
        else if (d.error === 'bad') {   // 서버가 욕설을 막음 — 보낸 사람에게만 보임
          toast('🕊 이 글은 보내지 않았어요 — 고운 말로 다시 써 볼까요?');
          chatSys('🕊 「무릇 더러운 말은 너희 입 밖에도 내지 말고 오직 덕을 세우는 데 소용되는 대로 선한 말을 하여 듣는 자들에게 은혜를 끼치게 하라」 (에베소서 4:29)');
        }
        else toast(CHAT_ERR[d.error] || '보내지 못했어요');
        return;
      }
      inp.value = ''; unlock('chat');
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

  var villageBook = loadVillageBook('guest'), villageTab = 'build', visitMarks = [];
  function villageBookKey(id) { return 'arkVillage.notebook.' + id; }
  function loadVillageBook(id) {
    var data;
    try { data=JSON.parse(localStorage.getItem(villageBookKey(id))||'null'); } catch(e){}
    if(!data||typeof data!=='object')data={};
    if(!Array.isArray(data.pins))data.pins=[];
    return data;
  }
  function saveVillageBook() {
    try { localStorage.setItem(villageBookKey(me ? me.id : 'guest'), JSON.stringify(villageBook)); } catch (e) {}
  }
  function allVillagePins(){return villageBook.pins.concat(visitMarks);}
  function villageButton(parent, label, action) {
    var button = document.createElement('button');
    button.className = 'mc'; button.textContent = label;
    button.addEventListener('click', action); parent.appendChild(button);
    return button;
  }
  function villageText(parent, text, tag) {
    var node = document.createElement(tag || 'p'); node.textContent = text; parent.appendChild(node); return node;
  }
  function addVillagePin(label,x,z) {
    if (villageBook.pins.length >= 12) { toast('표시는 12곳까지 남길 수 있어요'); return false; }
    var pin = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,5), label: label, x: Math.floor(x), z: Math.floor(z) };
    villageBook.pins.push(pin); villageBook.target = pin.id; saveVillageBook(); renderPins(); return true;
  }
  function renderPins() {
    var sel = $('mapPins'); sel.replaceChildren();
    [['','따라갈 장소 고르기']].concat(allVillagePins().map(function (p) { return [p.id,p.label]; })).forEach(function (pair) {
      var choice = document.createElement('option'); choice.value=pair[0]; choice.textContent=pair[1]; sel.appendChild(choice);
    });
    sel.value = villageBook.target || '';
    $('mapPinRemove').disabled=!villageBook.pins.some(function(p){return p.id===villageBook.target;});
  }
  function drawVillagePins(ctx,ox,oz,sc,w,h) {
    allVillagePins().forEach(function (p) {
      var x=(p.x-ox)*sc,y=(p.z-oz)*sc;
      if (x < 0 || y < 0 || x > w || y > h) return;
      ctx.fillStyle=p.id===villageBook.target?'#ffdb61':'#77dac1';
      ctx.beginPath(); ctx.moveTo(x,y+5); ctx.lineTo(x-5,y-4); ctx.lineTo(x+5,y-4); ctx.closePath(); ctx.fill();
    });
  }
  function pinnedRecipe() {
    var p=villageBook.recipe, r=p&&RECIPES[p.index];
    return r && r.out[0]===p.id ? r : null;
  }
  function renderMaterialGuide() {
    var p=allVillagePins().find(function (x) { return x.id===villageBook.target; }), r=pinnedRecipe(), text=[];
    if (p) {
      var bearing=Math.atan2(p.x-P.x,-(p.z-P.z)), direction=['북','북동','동','남동','남','남서','서','북서'][(Math.round(bearing/(Math.PI/4))+8)%8];
      var dist=Math.round(Math.hypot(p.x-P.x,p.z-P.z)); text.push(p.label+' '+(dist<=2?'도착':direction+'쪽 '+dist+'칸'));
    }
    if (r) text.push(nameOf(r.out[0])+' · '+r.need.map(function (n) {return nameOf(n[0])+' '+Math.min(have(n[0]),n[1])+'/'+n[1];}).join(' · '));
    $('trailGuide').textContent=text.join(' / ');
  }
  var BLUEPRINTS=[['작은 집',7,6],['양 우리',9,7],['빵집',8,7],['성막 모형',22,12]], blueprintMesh, blueprintAt=0;
  function blueprintCells(plan) {
    if (plan && plan.kind === 'custom') return customPlanCells(plan);
    if (!plan || !BLUEPRINTS[plan.kind] || plan.plot!==myPlot) return [];
    var def=BLUEPRINTS[plan.kind], w=def[1], l=def[2], p=plotOrigin(plan.plot), a=[];
    var ox=p.x+plan.x, oz=p.z+plan.z;
    function add(x,y,z,id) { a.push([ox+x,G+y,oz+z,id]); }
    if (plan.kind===3) { tabernacleCells(add); return a; }
    for (var z=0; z<l; z++) for (var x=0; x<w; x++) {
      var border=x===0||z===0||x===w-1||z===l-1, entry=z===0&&x===Math.floor(w/2);
      if (plan.kind===1) { if (border&&!entry) add(x,0,z,FENCE); else if(entry) add(x,0,z,GATE); continue; }
      add(x,-1,z,plan.kind===2?BRICK:GOPHER);
      if (border) for (var y=0;y<4;y++) {
        if(entry) add(x,y,z,DOOR); else add(x,y,z,plan.kind===2?BRICK:GOPHER);
      }
      add(x,4,z,FLAT_ROOF);
    }
    if(plan.kind===2) add(w-2,0,l-2,OVEN);
    return a;
  }
  function matchesPlan(expected,id) {
    var s=SHAPE[id]; return id===expected || (s && s.base===expected) || (expected===RAIL0 && s && s.type==='mrail') ||
      (expected===GATE && s && s.type==='gate');
  }
  function createBlueprintMesh() {
    blueprintMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.98,.98,.98),
      new THREE.MeshBasicMaterial({color:0x7bccea,transparent:true,opacity:.25,depthWrite:false}),600);
    blueprintMesh.frustumCulled=false; blueprintMesh.count=0; scene.add(blueprintMesh);
  }
  var blueprintMatrix = new THREE.Matrix4();
  function tickBlueprint(now) {
    if(now<blueprintAt) return;
    blueprintAt=now+350;
    if(!blueprintMesh) return;
    var plan=villageBook.plan, cells=plotAt(Math.floor(P.x),Math.floor(P.z))===myPlot?blueprintCells(plan):[];
    var project=VILLAGE_PROJECTS[villageBook.project];
    if(project && villageProjectsEnabled && inCommons(P.x,P.z)) cells=projectCells(villageBook.project);
    var count=0;
    cells.forEach(function (c) {
      if(matchesPlan(c[3],get(c[0],c[1],c[2])) || count>=600) return;
      blueprintMatrix.makeTranslation(c[0]+.5,c[1]+.5,c[2]+.5);
      blueprintMesh.setMatrixAt(count++,blueprintMatrix);
    });
    blueprintMesh.count=count; if(count) blueprintMesh.instanceMatrix.needsUpdate=true;
    if (plan && plan.kind===3 && cells.length && count===0 && !ACH.tabernacle && plotAt(Math.floor(P.x),Math.floor(P.z))===myPlot) {
      unlock('tabernacle'); showVerseCard('☁', '성막을 다 지었어요', '구름이 회막에 덮이고 여호와의 영광이 성막에 충만하매', '출애굽기 40:34', '성막 모형을 완성했어요');
    }
  }
  // 성막 모형(출 25~40장): 바깥 뜰 휘장, 동쪽 뜰 문(청·자·홍, 출 27:16), 놋 제단, 물두멍, 성막(성소·지성소, 언약궤·촛대)
  function tabernacleCells(add) {
    var W = 22, L = 12, x, y, z;
    for (x = 0; x < W; x++) for (z = 0; z < L; z++) {
      var edge = x === 0 || z === 0 || x === W - 1 || z === L - 1; if (!edge) continue;
      for (y = 0; y < 2; y++) {
        if (x === W - 1 && z >= 4 && z <= 7) add(x, y, z, [WOOL_B, WOOL_V, WOOL_R, WOOL_W][z - 4]);   // 뜰 문 휘장
        else add(x, y, z, WOOL_W);   // 세마포 휘장
      }
    }
    add(16, 0, 5, BLK_CU); add(17, 0, 5, BLK_CU); add(16, 0, 6, BLK_CU); add(17, 0, 6, BLK_CU);   // 놋 제단
    add(13, 0, 5, JAR);   // 물두멍
    for (x = 2; x <= 9; x++) for (z = 4; z <= 7; z++) {
      var wall = x === 2 || x === 9 || z === 4 || z === 7;
      if (wall) for (y = 0; y < 4; y++) { if (x === 9 && (z === 5 || z === 6)) { if (y < 3) add(x, y, z, WOOL_V); } else add(x, y, z, GOPHER); }
      add(x, 4, z, WOOL_R);   // 붉은 덮개(출 26:14)
    }
    for (y = 0; y < 3; y++) { add(5, y, 5, WOOL_B); add(5, y, 6, WOOL_B); }   // 성소와 지성소 사이 휘장
    add(3, 0, 5, BLK_AU);   // 언약궤
    add(8, 0, 5, CANDLESTICK);   // 촛대
  }
  function startBlueprint(kind) {
    if(myPlot<0) return toast('로그인하고 내 땅을 먼저 받아요');
    var o=plotOrigin(myPlot), d=BLUEPRINTS[kind];
    villageBook.plan={kind:kind,plot:myPlot,x:Math.max(1,Math.min(PLOT-d[1]-1,Math.floor(P.x)-o.x)),z:Math.max(1,Math.min(PLOT-d[2]-1,Math.floor(P.z)-o.z))};
    saveVillageBook(); renderVillageWork();
    if (kind===3) showVerseCard('⛺', '성막 모형', '내가 그들 중에 거할 성소를 그들이 나를 위하여 짓되', '출애굽기 25:8', '무릇 내가 네게 보이는 모양대로 장막을 짓고 기구들도 그 모양을 따라 지을지니라 (출 25:9) — 반투명 윤곽을 따라 지어요');
  }
  var villageTabs = [['news','✨ 새 기능'],['build','설계도'],['materials','재료'],['discover','탐험'],['projects','공동 작업'],['neighbors','마을 사람'],['cargo','나귀 짐'],['showcase','집 구경'],['frontier','개척 땅'],['feed','마을 소식'],['gifts','선물'],['photos','사진']];
  function openVillageWork(tab) { villageTab=tab; openPanel('villageWork'); renderVillageWork(); if(tab==='projects'||tab==='neighbors')fetchVillageProjects(); }
  var VILLAGE_GROUPS=[['🔨 짓기',['build','materials','projects','frontier']],['🏘 마을',['news','neighbors','cargo','discover']],['🤝 함께',['showcase','feed','gifts','photos']]];
  function renderVillageWork() {
    var tabs=$('villageTabs'), body=$('villageBody'); tabs.replaceChildren(); body.replaceChildren();
    // 탭은 두 줄: 위는 묶음(짓기·마을·함께), 아래는 고른 묶음의 탭만
    function tabFetch() { if(villageTab==='projects'||villageTab==='neighbors')fetchVillageProjects(); if(villageTab==='frontier')fetchFrontier(true); if(villageTab==='feed')fetchFeed(true); if(villageTab==='gifts')fetchGifts(true); if(villageTab==='photos')fetchPhotos(true); if(villageTab==='build')fetchPlans(true); }
    var curG=VILLAGE_GROUPS.filter(function (g) { return g[1].indexOf(villageTab)>=0; })[0]||VILLAGE_GROUPS[0];
    var gRow=document.createElement('div'); gRow.className='vgroups'; tabs.appendChild(gRow);
    VILLAGE_GROUPS.forEach(function (g) {
      var b=villageButton(gRow,g[0],function () { if(g===curG) return; villageTab=g[1][0]; renderVillageWork(); tabFetch(); });
      b.setAttribute('aria-pressed',String(g===curG));
    });
    var sRow=document.createElement('div'); sRow.className='vsub'; tabs.appendChild(sRow);
    villageTabs.forEach(function (tab) {
      if(curG[1].indexOf(tab[0])<0) return;
      var b=villageButton(sRow,tab[1],function () { villageTab=tab[0]; renderVillageWork(); tabFetch(); });
      b.setAttribute('aria-pressed',String(villageTab===tab[0]));
    });
    if(villageTab==='build') {
      villageText(body,'내 땅에 설계도를 표시하고 반투명 윤곽을 따라 지어 봐요.');
      BLUEPRINTS.forEach(function (row,i) { villageButton(body,row[0],function () { startBlueprint(i); }); });
      var plan=villageBook.plan;
      if(plan&&BLUEPRINTS[plan.kind]&&plan.plot===myPlot) {
        var remaining={}, cells=blueprintCells(plan), total=0;
        cells.forEach(function (c) { if(!matchesPlan(c[3],get(c[0],c[1],c[2]))) { remaining[c[3]]=(remaining[c[3]]||0)+1; total++; } });
        villageText(body, BLUEPRINTS[plan.kind][0]+' '+(cells.length-total)+'/'+cells.length);
        Object.keys(remaining).forEach(function (id) { villageText(body,nameOf(+id)+' '+(id==DOOR?Math.ceil(remaining[id]/4):remaining[id])+'개 · '+howGet(+id)); });
        villageButton(body,'설계도 지우기',function () {delete villageBook.plan; saveVillageBook(); renderVillageWork();});
      }
      if(plan&&plan.kind==='custom'&&plan.plot===myPlot) {
        var cc=customPlanCells(plan), left=0, need={};
        cc.forEach(function (c) { if(!matchesPlan(c[3],get(c[0],c[1],c[2]))) { left++; need[c[3]]=(need[c[3]]||0)+1; } });
        villageText(body,(plan.nick?plan.nick+'님의 ':'')+plan.name+' '+(cc.length-left)+'/'+cc.length);
        Object.keys(need).slice(0,12).forEach(function (id) { villageText(body,nameOf(+id)+' '+need[id]+'개 · '+howGet(+id)); });
        villageButton(body,'설계도 지우기',function () {delete villageBook.plan; saveVillageBook(); renderVillageWork();});
      }
      renderPlanShare(body);
    } else if(villageTab==='news') {
      renderNews(body);
    } else if(villageTab==='materials') {
      var r=pinnedRecipe();
      if(!r) return villageText(body,'가방의 만들기 목록에서 「재료 표시」를 눌러요.');
      villageText(body,nameOf(r.out[0]),'h3');
      r.need.forEach(function (n) { villageText(body,nameOf(n[0])+' '+Math.min(n[1],have(n[0]))+'/'+n[1]+' · '+howGet(n[0])); });
      villageButton(body,'재료 표시 끄기',function () {delete villageBook.recipe; saveVillageBook(); renderVillageWork();});
    } else {
      renderVillageExtras(villageTab,body);
    }
  }
  // ── 새 기능 안내(11/20): 해 보면 저절로 ✅ — 처음 들어오면 한 번 알림, 메뉴의 「✨ 새 기능」·마을 수첩에서 봄 ──
  var NEWS_VER = 3, NEWS = [
    ['quest', '📜', '퀘스트', '왼쪽 위 「📜 부탁」이나 메뉴의 「📜 퀘스트」에서 오늘의 부탁 셋·모험·땅 밟기를 봐요. 다 들어주면 보상을 받아요.', 0],
    ['south', '🌲', '남쪽 새 땅', '마을 남쪽 멀리 백향목 숲·광야·소금 바다가 생겼어요. 광야에는 성막, 숲에는 망대, 바닷가에는 나그네 장막촌이 있어요.', 0],
    ['vein', '💎', '광맥', '광석을 캐면 반짝이며, 이어진 광석이 있으면 잠깐 비춰 줘요.', 0],
    ['crit', '✦', '강한 일격', '뛰어올라 떨어지면서 그림자를 치면 더 세게 쳐요. 성령의 검은 앞쪽 그림자를 함께 쳐요. 그림자가 몸을 젖히면 곧 덮치니 물러서요.', 0],
    ['bow', '🏹', '활과 화살', '활을 들고 화면을 꾹 눌러 당기고, 떼면 쏴요. 오래 당길수록 멀리·세게 날아가요.', BOW],
    ['shield', '🛡', '방패로 불화살 막기', '방패를 차면 「의심」이 쏘는 불화살을 앞에서 막아요. 믿음의 방패는 모두 막아요(엡 6:16).', 0],
    ['faith', '✦', '믿음', '그림자에게 맞으면 믿음이 깎여요. 말씀 두루마리를 읽거나 제단에서 기도하면 다시 차고, 파티원과 함께면 덜 깎여요.', 0],
    ['cart', '🛒', '레일과 수레', '레일을 이어 깔고, 수레를 들고 레일을 누르면 타요. 금빛 빠른 레일은 더 빨라요.', RAIL0],
    ['trap', '🚪', '다락문', '바닥이나 천장 쪽에 놓고 누르면 위로 열려요.', TRAP],
    ['frame', '🖼', '액자', '벽 옆면에 걸고, 손에 든 것을 들고 누르면 걸어 둬요. 다른 사람도 봐요.', FRAME],
    ['photo', '📷', '사진 저장', '메뉴의 「📷 사진 저장」을 누르면 지금 화면을 내 폰에 저장해요.', 0],
    ['drop', '🫳', '길게 눌러 버리기', '아래 단축 칸을 길게 누르면 1개, 더 오래 누르면 한 묶음을 버려요.', 0],
    ['sneak', '🧎', '웅크리기', '방향키 가운데를 톡톡 두 번 누르면 웅크려서 가장자리에서 떨어지지 않아요.', 0],
    ['btn', '📱', '버튼 크기', '메뉴 → 설정에서 버튼 크기를 작게·보통·크게로 바꿔요.', 0],
    ['plotname', '🪧', '땅 팻말', '내 땅 앞 모서리에 「이름님의 땅」 팻말이 서요. 마을 수첩 → 함께 → 집 구경에서 팻말 글을 직접 써요(16자).', 0]
  ];
  var NEWS_DONE = {}; try { NEWS_DONE = JSON.parse(localStorage.getItem('arkVillage.newsDone') || '{}') || {}; } catch (e) { NEWS_DONE = {}; }
  function newsMark(k) {
    if (NEWS_DONE[k]) return; NEWS_DONE[k] = 1; try { localStorage.setItem('arkVillage.newsDone', JSON.stringify(NEWS_DONE)); } catch (e) {}
    if (NEWS.every(function (n) { return NEWS_DONE[n[0]]; })) setTimeout(function () { toast('✨ 새 기능을 다 해 봤어요!'); }, 1200);
    if (ui === 'villageWork' && villageTab === 'news') renderVillageWork();
    updateMenuLabels();
  }
  function newsLeft() { return NEWS.filter(function (n) { return !NEWS_DONE[n[0]]; }).length; }
  function renderNews(body) {
    if (S.newsSeen !== NEWS_VER) { S.newsSeen = NEWS_VER; saveSettings(); updateMenuLabels(); }
    villageText(body, '✨ 새로 생긴 것 ' + NEWS.length + '가지 — 해 보면 ✅ 표시가 돼요 (' + (NEWS.length - newsLeft()) + '/' + NEWS.length + ')');
    NEWS.forEach(function (n) {
      villageText(body, (NEWS_DONE[n[0]] ? '✅ ' : '⬜ ') + n[1] + ' ' + n[2], 'h3');
      villageText(body, n[3]);
      var rc = n[4] ? RECIPES.filter(function (r) { return r.out[0] === n[4]; })[0] : null;
      if (rc) villageButton(body, nameOf(n[4]) + ' 재료 표시', function () { villageBook.recipe = { id: rc.out[0], index: RECIPES.indexOf(rc) }; saveVillageBook(); renderMaterialGuide(); toast('마을 수첩에 ' + nameOf(rc.out[0]) + ' 재료를 표시했어요'); });
    });
  }
  var newsTold = false, newsT = 0;
  function newsTick() {   // 1초마다: 들어온 지 6초 뒤 한 번 알림
    if (newsTold || !started || ui !== 'play' || S.newsSeen === NEWS_VER) return;
    if (++newsT < 6) return;
    newsTold = true; toast('✨ 새 기능 ' + NEWS.length + '가지가 생겼어요 — 메뉴의 「✨ 새 기능」에서 봐요 (퀘스트·남쪽 새 땅·성막·광맥·강한 일격…)');
  }
  var VILLAGE_SITES = [
    { name:'사막의 옛 우물',x:1510,z:811,r:7,style:'well',item:FIND_POT,clue:'동쪽 사막의 북쪽에서 돌 테두리를 찾아요.' },
    { name:'서쪽 언덕의 옛집',x:779,z:1038,r:7,style:'house',item:FIND_LAMP,clue:'서쪽 산에서 남쪽으로 이어지는 바위 언덕을 찾아요.' },
    { name:'바위틈 샘',x:1160,z:1210,r:7,style:'spring',item:FIND_SEED,clue:'남쪽 호수의 동남쪽, 낮은 바위 사이를 찾아요.' }
  ];
  var VILLAGE_EXHIBITS = {
    501:['토기 조각','흙으로 만든 그릇에는 물과 곡식, 기름을 담았어요. 조각의 모양을 보면 그릇이 얼마나 컸는지 짐작할 수 있어요.'],
    502:['기름 등잔','작은 그릇에 기름을 담고 심지를 밝혀 어두운 방을 비췄어요.'],
    503:['옛 씨앗','사람들은 다음 철에 심을 씨앗을 따로 보관했어요. 씨앗은 무엇을 길렀는지 알려 줘요.']
  };
  function protectedExcursion(x,z) {
    return ferryPiers.some(function(p){return p.x===x&&p.z===z;}) ||
      VILLAGE_SITES.some(function (s) {return Math.abs(x-s.x)<=s.r && Math.abs(z-s.z)<=s.r;});
  }
  function buildExcursions(x0,z0) {
    VILLAGE_SITES.forEach(function (s) {
      if(s.x+s.r<x0||s.z+s.r<z0||s.x-s.r>=x0+CS||s.z-s.r>=z0+CS) return;
      terrain(s.x,s.z); var y=T.h+1, x=s.x,z=s.z;
      fill(x-4,y-1,z-4,x+4,y-1,z+4,PATH);
      fill(x-4,y,z-4,x+4,y+3,z+4,AIR);
      if(s.style==='well') {
        fill(x-3,y,z-3,x+3,y,z+3,STONE);
        fill(x-2,y,z-2,x+2,y,z+2,WATER);
        setRaw(x,y+1,z-3,FIND_MARK);
      } else if(s.style==='house') {
        fill(x-3,y,z-3,x+3,y+1,z-3,BRICK);
        fill(x-3,y,z-3,x-3,y+1,z+2,BRICK);
        fill(x+1,y,z+1,x+3,y,z+3,STONE);
        setRaw(x,y,z,FIND_MARK);
      } else {
        fill(x-3,y,z-3,x+3,y+3,z-2,STONE);
        fill(x-3,y,z-2,x-2,y+2,z+3,STONE);
        fill(x-2,y+3,z-2,x+3,y+4,z+2,STONE);
        fill(x+3,y,z-2,x+3,y+2,z+1,STONE);
        fill(x-1,y,z-1,x+1,y,z+1,WATER);
        setRaw(x+2,y,z+2,FIND_MARK);
      }
    });
    ferryPiers.forEach(function (p) {
      if (p.x<x0||p.x>=x0+CS||p.z<z0||p.z>=z0+CS) return;
      setRaw(p.x, surfaceY(p.x,p.z), p.z, FERRY_POST);
    });
  }
  function showVillageFind(id) {
    var entry=VILLAGE_EXHIBITS[id];
    $('cardEmoji').textContent='🏺'; $('cardName').textContent=entry[0]; $('cardText').textContent=entry[1];
    $('cardRef').textContent='고대 마을 전시'; $('cardNew').textContent=''; $('card').classList.add('show');
    clearTimeout(cardT); cardT=setTimeout(function () {$('card').classList.remove('show');},12000);
  }
  function useVillageBlock(id,h) {
    if(id===FERRY_POST) return startFerry(h);
    if(id===FEAST_TABLE) {
      var held=HOTBAR[sel], serving=held===FLATBREAD||held===BREAD?FEAST_BREAD:(held===614?FEAST_OLIVE:(held===COOKED_FISH?FEAST_FISH:0));
      if(!serving||!have(held)) return toast('빵이나 올리브, 구운 생선을 들고 식탁을 눌러요');
      if(!inMyPlot(h.x,h.z)&&!inCommons(h.x,h.z)) return deny('내 땅이나 함께 짓는 터에서 차려요');
      var why=canPlace(h.x,h.y+1,h.z,serving);
      if(why) return deny(why);
      if(get(h.x,h.y+1,h.z)!==AIR) return toast('이미 음식이 놓여 있어요');
      take(held,1); setBlock(h.x,h.y+1,h.z,serving); bagChanged(); return toast('함께 먹을 음식을 차렸어요');
    }
    if(id!==FIND_MARK) return showVillageFind(id);
    var find=VILLAGE_SITES.find(function (s) {return Math.abs(h.x-s.x)<=s.r&&Math.abs(h.z-s.z)<=s.r;});
    if(!find) return;
    var found=villageBook.found || (villageBook.found={});
    if(!found[find.item]) {
      if(!give(find.item,1)) return bagFull();
      found[find.item]=true; saveVillageBook(); bagChanged();
    }
    showVillageFind(find.item);
  }
  function villageWaterRegion(x,z) {
    if(z<SEA_Z+8) return '바다';
    if(lakeE(x,z)<1.2) return '호수';
    if(riverDist(x,z)<9) return '강';
    return null;
  }
  function recordVillageFish(region,count) {
    if(!region) return;
    var fish=villageBook.fish || (villageBook.fish={}); fish[region]=(fish[region]||0)+count; saveVillageBook();
  }
  function recordVillagePlant(id,x,z) {
    var plants=villageBook.plants || (villageBook.plants={});
    if(!plants[id]) { plants[id]=placeName(); saveVillageBook(); }
  }
  function ditchWaterNear(x,y,z) {
    return ditchHasSource(x,y-1,z) || ditchHasSource(x,y,z);
  }
  function ditchHasSource(x,yy,z) {
    var todo=[], visited=new Set(), steps=[[1,0],[-1,0],[0,1],[0,-1]];
    for(var dx=-4;dx<=4;dx++)for(var dz=-4;dz<=4;dz++)if(get(x+dx,yy,z+dz)===DITCH)todo.push([x+dx,z+dz,0]);
    for(var i=0;i<todo.length && i<180;i++){
      var q=todo[i],key=q[0]+','+q[1];
      if(visited.has(key))continue;
      visited.add(key);
      if(get(q[0],yy-1,q[1])===WATER)return true;
      for(var j=0;j<4;j++){
        var ax=q[0]+steps[j][0],az=q[1]+steps[j][1],b=get(ax,yy,az);
        if(b===WATER||get(ax,yy-1,az)===WATER)return true;
        if(b===DITCH && q[2]<12 && !visited.has(ax+','+az))todo.push([ax,az,q[2]+1]);
      }
    }
    return false;
  }
  var ferryPiers=[{x:1024,z:1150},{x:1024,z:1199}], ferryRide=null, ferryMesh;
  function startFerry(h) {
    if(ferryRide) return;
    var p=ferryPiers[0], q=ferryPiers[1];
    if(Math.abs(h.z-q.z)<Math.abs(h.z-p.z)){p=ferryPiers[1];q=ferryPiers[0];}
    if(riding)dismount(true);
    if(!ferryMesh){
      ferryMesh=new THREE.Mesh(mergedBoxes([[2.1,.25,3.6,0x7a4e2e,0,0,0],[.18,.5,3.4,0x96603a,-1,.26,0],[.18,.5,3.4,0x96603a,1,.26,0],[1.8,.45,.22,0x865630,0,.25,1.6],[1.8,.45,.22,0x865630,0,.25,-1.6]]),avatarMat);
      scene.add(ferryMesh);
    }
    ferryMesh.visible=true; ferryRide={from:p,to:q,t:0};
    P.yaw=q.z>p.z?Math.PI:0; P.pitch=-.08; toast('나룻배로 호수를 건너요');
  }
  // ── 수레(11/20, 마인크래프트 수레처럼): 레일을 따라 굴러감. 앞으로 = 바라보는 쪽으로 밀기, 비탈은 내려가며 빨라짐.
  //    내리기 = Shift·「내리기」 버튼·방향키 가운데 톡톡 — 내리면 수레는 가방으로 ──
  var RDX = [0, 1, 0, -1], RDZ = [-1, 0, 1, 0], RAIL_CONN = [[0, 2], [1, 3], [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [0, 2], [1, 3]];
  var cartRide = null, cartMesh = null, cartClackT = 0;
  function railAt(x, y, z) { var id = get(x, y, z); return id >= RAIL0 && id < RAIL0 + 10 ? id - RAIL0 : (id >= RAILF0 && id < RAILF0 + 10 ? id - RAILF0 : -1); }
  function railBaseAt(x, y, z) { var id = get(x, y, z); return id >= RAILF0 && id < RAILF0 + 10 ? RAILF0 : RAIL0; }
  function railHas(s, d) { return RAIL_CONN[s][0] === d || RAIL_CONN[s][1] === d; }
  function railNeighbor(x, y, z, d) {   // d쪽 옆 레일: 같은 높이 → 한 칸 위 → 한 칸 아래
    var nx = x + RDX[d], nz = z + RDZ[d];
    for (var k = 0; k < 3; k++) { var dy = [0, 1, -1][k], s = railAt(nx, y + dy, nz); if (s >= 0) return { x: nx, y: y + dy, z: nz, s: s, up: dy }; }
    return null;
  }
  function railLinks(x, y, z) { var s = railAt(x, y, z); if (s < 0) return 0; var n = 0; RAIL_CONN[s].forEach(function (d) { var nb = railNeighbor(x, y, z, d); if (nb && railHas(nb.s, (d + 2) % 4)) n++; }); return n; }
  function railShapeFor(x, y, z, look) {
    var cand = [];
    for (var d = 0; d < 4; d++) { var nb = railNeighbor(x, y, z, d); if (nb && (railHas(nb.s, (d + 2) % 4) || railLinks(nb.x, nb.y, nb.z) < 2)) cand.push({ d: d, up: nb.up }); }
    var a = cand[0], b = null;
    for (var i = 0; i < cand.length && !b; i++) for (var j = i + 1; j < cand.length; j++) if ((cand[i].d + 2) % 4 === cand[j].d) { a = cand[i]; b = cand[j]; break; }
    if (!b && cand.length > 1) b = cand[1];
    if (!a) return (look % 2) ? 1 : 0;
    var upD = a.up === 1 ? a.d : (b && b.up === 1 ? b.d : -1);
    if (!b || (a.d + 2) % 4 === b.d) { if (upD >= 0) return 6 + upD; return a.d % 2 ? 1 : 0; }
    var p = [a.d, b.d].sort(), key = p[0] + ',' + p[1];
    return { '0,1': 2, '1,2': 3, '2,3': 4, '0,3': 5 }[key];
  }
  function railFixNeighbors(x, y, z) {   // 새 레일 쪽으로 옆 레일을 돌려 이음(이미 양쪽이 이어진 레일은 그대로)
    for (var d = 0; d < 4; d++) {
      var nb = railNeighbor(x, y, z, d); if (!nb) continue;
      var lowFlat = nb.up === -1 && nb.s < 6;   // 한 칸 아래 평평한 레일은 이쪽으로 올라오는 비탈로
      if (!lowFlat && (railHas(nb.s, (d + 2) % 4) || railLinks(nb.x, nb.y, nb.z) >= 2)) continue;
      var ns = railShapeFor(nb.x, nb.y, nb.z, nb.s % 2); if (ns !== nb.s && !canPlace(nb.x, nb.y, nb.z, RAIL0)) setBlock(nb.x, nb.y, nb.z, railBaseAt(nb.x, nb.y, nb.z) + ns);
    }
    var me = railShapeFor(x, y, z, railAt(x, y, z) % 2); if (me !== railAt(x, y, z)) setBlock(x, y, z, railBaseAt(x, y, z) + me);
  }
  function cartPos(c) {
    var s = c.s, A = [c.x + 0.5 + RDX[c.from] * 0.5, c.z + 0.5 + RDZ[c.from] * 0.5], Bp = [c.x + 0.5 + RDX[c.to] * 0.5, c.z + 0.5 + RDZ[c.to] * 0.5], t = c.t, px, pz;
    if ((c.from + 2) % 4 === c.to) { px = A[0] + (Bp[0] - A[0]) * t; pz = A[1] + (Bp[1] - A[1]) * t; }
    else { var u = 1 - t, cx = c.x + 0.5, cz = c.z + 0.5; px = u * u * A[0] + 2 * u * t * cx + t * t * Bp[0]; pz = u * u * A[1] + 2 * u * t * cz + t * t * Bp[1]; }
    var py = c.y + 0.07; if (s >= 6) py = c.y + 0.07 + (c.to === s - 6 ? t : 1 - t);
    return [px, py, pz];
  }
  function cartLen(c) { return c.s >= 6 ? 1.4 : ((c.from + 2) % 4 === c.to ? 1 : 0.8); }
  function makeCartMesh() {
    var g = new THREE.Group(), iron = new THREE.MeshBasicMaterial({ color: 0x7f868c }), dark = new THREE.MeshBasicMaterial({ color: 0x3a3d40 });
    function bx(w, h, d, x, y, z, m) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); }
    bx(0.9, 0.08, 1.2, 0, 0.2, 0, dark); bx(0.9, 0.42, 0.08, 0, 0.42, 0.56, iron); bx(0.9, 0.42, 0.08, 0, 0.42, -0.56, iron); bx(0.08, 0.42, 1.2, 0.41, 0.42, 0, iron); bx(0.08, 0.42, 1.2, -0.41, 0.42, 0, iron);
    [[-0.45, -0.38], [0.45, -0.38], [-0.45, 0.38], [0.45, 0.38]].forEach(function (q) { bx(0.06, 0.2, 0.2, q[0], 0.12, q[1], dark); });
    scene.add(g); return g;
  }
  function cartNet() { return !!(client && me && me.id && me.id !== 'test'); }
  function cartToBag() { if (!isAdm()) { if (give(CART, 1) < 1) dropItem(P.x, P.y + 0.5, P.z, CART, 1); bagChanged(); } }
  function startCart(x, y, z, park) {
    if (park && park.id) {   // 서버에 세워 둔 수레: 먼저 누른 한 사람만
      if (park.taking) return; park.taking = true;
      client.rpc('take_ark_cart', { p_id: park.id }).then(function (r) {
        var d = r && r.data; removeParked(park);
        if (!d) return toast('다른 사람이 먼저 탔어요');
        startCart(d.x, d.y, d.z, { x: d.x, y: d.y, z: d.z, s: d.s, from: d.from, to: d.to, t: d.t });
      }, function () { park.taking = false; toast('수레를 타지 못했어요. 다시 눌러 주세요'); });
      return;
    }
    if (riding || ferryRide || furnitureRest) return deny('지금은 수레를 탈 수 없어요');
    if (!park && !isAdm() && have(CART) < 1) return deny('수레가 없어요 — 철 덩이 5개로 만들어요');
    var s = railAt(x, y, z); if (s < 0) return;
    var f = [-Math.sin(P.yaw), -Math.cos(P.yaw)], c0 = RAIL_CONN[s][0], c1 = RAIL_CONN[s][1];
    var to = RDX[c0] * f[0] + RDZ[c0] * f[1] >= RDX[c1] * f[0] + RDZ[c1] * f[1] ? c0 : c1;
    if (park) { removeParked(park); cartRide = { x: park.x, y: park.y, z: park.z, s: s, to: park.to, from: park.from, t: park.t, v: 0 }; if (!railHas(s, cartRide.to) || !railHas(s, cartRide.from)) { cartRide.to = to; cartRide.from = to === c0 ? c1 : c0; cartRide.t = 0.5; } }
    else { if (!isAdm()) { take(CART, 1); bagChanged(); } cartRide = { x: x, y: y, z: z, s: s, to: to, from: to === c0 ? c1 : c0, t: 0.5, v: 0 }; }
    if (!cartMesh) cartMesh = makeCartMesh(); cartMesh.visible = true;
    $('restUp').textContent = '내리기'; $('restUp').hidden = false; resetInput(); sfx('door', 500); newsMark('cart');
    toast('🛤 수레에 탔어요 — 앞으로 가면 바라보는 쪽으로 밀리고, 금빛 빠른 레일을 지나면 빨라져요. 내리면 수레는 레일 위에 서 있어요');
  }
  function leaveCart(quiet) {
    var c = cartRide; if (!c) return;
    cartRide = null; if (cartMesh) cartMesh.visible = false;
    $('restUp').hidden = true; $('restUp').textContent = '일어나기';
    var onRail = railAt(c.x, c.y, c.z) >= 0, parked = onRail && (cartNet() || PARKED.filter(function (q) { return !q.id; }).length < 12);
    if (parked) {
      var lp = { x: c.x, y: c.y, z: c.z, s: c.s, from: c.from, to: c.to, t: Math.max(0, Math.min(1, c.t)) };
      if (cartNet()) {
        lp.pending = true; addParked(lp);
        client.rpc('park_ark_cart', { p_x: lp.x, p_y: lp.y, p_z: lp.z, p_s: lp.s, p_from: lp.from, p_to: lp.to, p_t: lp.t }).then(function (r) {
          var id = r && r.data;
          if (id > 0) { lp.id = id; lp.pending = false; return; }
          removeParked(lp); cartToBag(); toast(id === -4 ? '세워 둘 수 있는 수레는 한 사람 6대까지예요 — 수레를 가방에 넣었어요' : '여기에는 수레를 세울 수 없어요 — 가방에 넣었어요');
        }, function () { removeParked(lp); cartToBag(); toast('수레를 세우지 못해 가방에 넣었어요'); });
      } else addParked(lp);
    } else cartToBag();
    P.vx = P.vy = P.vz = 0; P.y += 0.3; P.x += -Math.cos(P.yaw) * 0.9; P.z += Math.sin(P.yaw) * 0.9; if (collides(P.x, P.y, P.z)) { P.x = cartPos(c)[0]; P.z = cartPos(c)[2]; } while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    if (!quiet) { sfx('door', 500); toast(parked ? '수레에서 내렸어요 — 수레는 레일 위에 세워 뒀어요. ' + (cartNet() ? '누구나 눌러 탈 수 있고, ' : '다시 누르면 타고, ') + '레일을 캐면 가방으로 돌아와요' : '수레에서 내렸어요 — 수레는 가방에 넣었어요'); }
  }
  function stepCart(dt) {
    var c = cartRide;
    if (keys.ShiftLeft || keys.ShiftRight) { leaveCart(); placeCamera(dt, 0); return; }
    if (railAt(c.x, c.y, c.z) !== c.s) { leaveCart(); placeCamera(dt, 0); return; }   // 레일이 사라짐
    var fwdIn = ((keys.KeyW || keys.ArrowUp) ? 1 : 0) - ((keys.KeyS || keys.ArrowDown) ? 1 : 0) - joy.y;
    var p0 = cartPos(c), save = c.t; c.t = Math.min(1, c.t + 0.01); var p1 = cartPos(c); c.t = save;
    var tx = p1[0] - p0[0], tz = p1[2] - p0[2], tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    var look = tx * -Math.sin(P.yaw) + tz * -Math.cos(P.yaw);
    c.v += fwdIn * look * 7 * dt;
    if (c.s >= 6) c.v += (c.to === c.s - 6 ? -1 : 1) * 4.5 * dt;
    var fr = (0.35 + 0.12 * Math.abs(c.v)) * dt; c.v = Math.abs(c.v) <= fr ? 0 : c.v - Math.sign(c.v) * fr;
    if (c.v < 0) { var tmp = c.from; c.from = c.to; c.to = tmp; c.t = 1 - c.t; c.v = -c.v; }
    var fast = railBaseAt(c.x, c.y, c.z) === RAILF0;
    if (fast && c.v > 0.2) c.v += 9 * dt;   // 빠른 레일: 굴러가는 수레를 더 밀어 줌
    if (!fast && c.v > 10) c.v -= 3 * dt;
    c.v = Math.min(14, c.v);
    c.t += c.v * dt / cartLen(c);
    var guard = 0;
    while (c.t >= 1 && guard++ < 4) {
      var ny = c.y + (c.s >= 6 && c.to === c.s - 6 ? 1 : 0), nx = c.x + RDX[c.to], nz = c.z + RDZ[c.to], back = (c.to + 2) % 4, ns = railAt(nx, ny, nz);
      if (ns < 0 || !railHas(ns, back)) { var ds = railAt(nx, ny - 1, nz); if (ds >= 6 && ds - 6 === back) { ny--; ns = ds; } else ns = -1; }
      if (ns < 0) { c.t = 1; if (c.v > 2) { sfx('break', 'metal'); } c.v = 0; break; }
      c.t -= 1; c.x = nx; c.y = ny; c.z = nz; c.s = ns; c.from = back; c.to = RAIL_CONN[ns][0] === back ? RAIL_CONN[ns][1] : RAIL_CONN[ns][0];
      if (c.v > 0.5) tone('square', 130, 95, 0.04, Math.min(0.05, c.v * 0.006));
    }
    var p = cartPos(c);
    P.x = p[0]; P.z = p[2]; P.y = p[1] + 0.25; P.vx = P.vy = P.vz = 0; P.swim = false; fallTop = null;
    if (cartMesh) { cartMesh.position.set(p[0], p[1], p[2]); cartMesh.rotation.y = Math.atan2(tx, tz); }
    ensureAround(P.x, P.z, 2);
    placeCamera(dt, c.v);
  }
  // 세워 둔 수레(이 기기에 기억): 레일이 사라지면 가방으로
  var PARKED = [];
  try { PARKED = (JSON.parse(localStorage.getItem('arkVillage.carts') || '[]') || []).filter(function (p) { return p && typeof p.x === 'number'; }).slice(0, 12); } catch (e) { PARKED = []; }
  function saveParked() { try { localStorage.setItem('arkVillage.carts', JSON.stringify(PARKED.filter(function (p) { return !p.id && !p.pending; }).map(function (p) { return { x: p.x, y: p.y, z: p.z, s: p.s, from: p.from, to: p.to, t: p.t }; }))); } catch (e) {} }
  function parkedAt(x, y, z) { for (var i = 0; i < PARKED.length; i++) { var p = PARKED[i]; if (p.x === x && p.y === y && p.z === z) return p; } return null; }
  function placeParkedMesh(p) { if (!p.mesh) p.mesh = makeCartMesh(); var q = cartPos(p), save = p.t; p.t = Math.min(1, p.t + 0.01); var q2 = cartPos(p); p.t = save; p.mesh.position.set(q[0], q[1], q[2]); p.mesh.rotation.y = Math.atan2(q2[0] - q[0], q2[2] - q[2]); p.mesh.visible = true; }
  function addParked(p) { PARKED.push(p); placeParkedMesh(p); saveParked(); }
  function removeParked(p) { var i = PARKED.indexOf(p); if (i >= 0) PARKED.splice(i, 1); if (p.mesh) { scene.remove(p.mesh); p.mesh = null; } saveParked(); }
  function parkedBroken(x, y, z) {
    var p = parkedAt(x, y, z); if (!p) return; removeParked(p);
    if (p.id) { client.rpc('take_ark_cart', { p_id: p.id }).then(function (r) { if (r && r.data) { cartToBag(); toast('🛒 세워 둔 수레를 가방에 넣었어요'); } }, function () {}); return; }
    cartToBag(); toast('🛒 세워 둔 수레를 가방에 넣었어요');
  }
  var cartPollT = 0;
  function pollCarts() {
    client.rpc('list_ark_carts', { p_x: Math.floor(P.x), p_z: Math.floor(P.z) }).then(function (r) {
      if (!r || r.error || !Array.isArray(r.data)) return;
      var ids = new Set(r.data.map(function (d) { return d.id; }));
      PARKED.slice().forEach(function (p) { if (p.id && !ids.has(p.id) && !p.taking) removeParked(p); });
      r.data.forEach(function (d) { if (!PARKED.some(function (p) { return p.id === d.id; })) PARKED.push({ id: d.id, x: d.x, y: d.y, z: d.z, s: d.s, from: d.frm, to: d.too, t: d.t }); });
    }, function () {});
  }
  function tickParked() {   // 1초마다: 가까이 있으면 보이게. 이 기기 수레는 땅이 불러와졌는데 레일이 없으면 가방으로
    if (cartNet() && started && ++cartPollT >= 5) { cartPollT = 0; pollCarts(); }
    PARKED.slice().forEach(function (p) {
      if (!colAt(p.x, p.z)) { if (p.mesh) p.mesh.visible = false; return; }
      if (railAt(p.x, p.y, p.z) < 0) { if (p.id || p.pending) { if (p.mesh) p.mesh.visible = false; } else parkedBroken(p.x, p.y, p.z); return; }
      p.s = railAt(p.x, p.y, p.z); if (!railHas(p.s, p.to) || !railHas(p.s, p.from)) { p.from = RAIL_CONN[p.s][0]; p.to = RAIL_CONN[p.s][1]; }
      placeParkedMesh(p);
    });
  }
  // 지도에 그릴 레일: 불러온 땅 기둥을 하나씩 돌아가며 살펴봄(0.05초에 한 기둥)
  var RAIL_MAP = new Map(), railScanK = 0;
  setInterval(railScanStep, 200);
  function railScanStep() {
    if (!started || document.hidden) return;
    for (var tries = 0; tries < 4096; tries++) { railScanK = (railScanK + 1) % (NC * NC); if (COLS[railScanK]) break; }
    var col = COLS[railScanK]; if (!col) return;
    var cx = (railScanK % NC) * CS, cz = Math.floor(railScanK / NC) * CS, d = col.d;
    RAIL_MAP.forEach(function (v, key) { var kx = key >> 12, kz = key & 4095; if (kx >= cx && kx < cx + CS && kz >= cz && kz < cz + CS) RAIL_MAP.delete(key); });
    for (var i = 0; i < d.length; i++) { var v = d[i]; if ((v >= RAIL0 && v < RAIL0 + 10) || (v >= RAILF0 && v < RAILF0 + 10)) { var lx = i % CS, lz = Math.floor(i / CS) % CS; RAIL_MAP.set(((cx + lx) << 12) | (cz + lz), v >= RAILF0 ? 2 : 1); } }
    if (RAIL_MAP.size > 20000) RAIL_MAP.clear();
  }
  function drawMapRails(x, ox, oz, sc, w, h) {
    var s = Math.max(1.5, sc);
    RAIL_MAP.forEach(function (v, key) {
      var mx = ((key >> 12) - ox) * sc, mz = ((key & 4095) - oz) * sc; if (mx < -2 || mz < -2 || mx > w + 2 || mz > h + 2) return;
      x.fillStyle = v === 2 ? '#e8c53a' : '#2f2f33'; x.fillRect(mx - s / 2, mz - s / 2, s, s);
    });
    PARKED.forEach(function (p) { var mx = (p.x + 0.5 - ox) * sc, mz = (p.z + 0.5 - oz) * sc; x.fillStyle = '#9aa3aa'; x.fillRect(mx - 3, mz - 2, 6, 4); x.strokeStyle = '#222'; x.lineWidth = 1; x.strokeRect(mx - 3, mz - 2, 6, 4); });
  }
  function drawMapBed(x, big, ox, oz, sc) {
    if (!SPAWN) return;
    var mx = (SPAWN.x + 0.5 - ox) * sc, mz = (SPAWN.z + 0.5 - oz) * sc, r = big ? 6 : 4;
    x.fillStyle = '#c0473a'; x.fillRect(mx - r, mz - r * 0.6, r * 2, r * 1.2); x.fillStyle = '#f2efe6'; x.fillRect(mx - r, mz - r * 0.6, r * 0.7, r * 1.2);
    x.strokeStyle = '#fff'; x.lineWidth = 1; x.strokeRect(mx - r, mz - r * 0.6, r * 2, r * 1.2);
    if (big) { x.font = '11px Galmuri11, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText('내 침대', mx, mz - r - 6); }
  }
  function stepFerry(dt) {
    var ride=ferryRide; ride.t+=dt;
    var progress=Math.min(1,ride.t/7),x=ride.from.x+.5,z=ride.from.z+.5+(ride.to.z-ride.from.z)*progress;
    P.x=x;P.z=z;P.y=surfaceY(Math.floor(x),Math.floor(z))+.14;
    P.vx=P.vy=P.vz=0;P.swim=false;
    ferryMesh.position.set(x,P.y-.45,z);
    ferryMesh.rotation.y=P.yaw; placeCamera(dt);
    if(progress>=1){
      ferryMesh.visible=false; ferryRide=null;
      var shore=ride.to.z+(ride.to.z>ride.from.z?2:-2);
      teleport(ride.to.x+.5,surfaceY(ride.to.x,shore),shore,P.yaw);
      toast('호수 건너편에 도착했어요');
    }
  }
  // ───────── 모험 손맛(2026-11-20): 광석 캐기 반짝임·광맥 알림, 그림자와 싸울 때 체력 막대·피해 숫자·번쩍임·강한 일격·검 휘두르기·공격 신호 ─────────
  var ORE_SET = {}, ORE_COLOR = {};
  [[ORE_COAL, 0x5a5a66], [ORE_CU, 0xff9a52], [ORE_FE, 0xf0c49a], [ORE_AG, 0xeef6ff], [ORE_ONYX, 0xc88cff], [ORE_AU, 0xffd84a], [ORE_SAPH, 0x5a8cff], [ORE_DIA, 0x8ff8ff]].forEach(function (o) {
    ORE_SET[o[0]] = o[0]; ORE_COLOR[o[0]] = o[1]; if (DEEPV[o[0]]) ORE_SET[DEEPV[o[0]]] = o[0];
  });
  for (var gq0 = 0; gq0 < 12; gq0++) if (GEMS[gq0]) { var go0 = gemOre(gq0); if (!ORE_COLOR[go0]) { ORE_SET[go0] = go0; ORE_COLOR[go0] = TILE_AVG[TILE['gem' + gq0]] || 0xffffff; } }
  function oreBase(id) { return ORE_SET[id] || 0; }
  // 반짝이·숫자 같은 잠깐 보이는 것(FX)
  var FX = [], glowTex = null;
  function glowMat(color, through) {
    if (!glowTex) {
      var c = document.createElement('canvas'); c.width = c.height = 32; var g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32); glowTex = new THREE.CanvasTexture(c);
    }
    return new THREE.SpriteMaterial({ map: glowTex, color: color, transparent: true, depthWrite: false, depthTest: !through, blending: THREE.AdditiveBlending, fog: false });
  }
  function sparkle(x, y, z, color, n, o) {
    if (S.lightMode) n = Math.ceil(n / 2);
    if (!scene) return;
    o = o || {};
    for (var i = 0; i < n; i++) {
      var s = new THREE.Sprite(glowMat(color, o.through)), sz = (o.size || 0.32) * (0.6 + Math.random() * 0.8);
      s.scale.set(sz, sz, 1); s.position.set(x + (Math.random() - 0.5) * (o.spread || 0.8), y + (Math.random() - 0.5) * (o.spread || 0.8), z + (Math.random() - 0.5) * (o.spread || 0.8));
      s.renderOrder = o.through ? 19 : 4; scene.add(s);
      FX.push({ m: s, vx: (Math.random() - 0.5) * (o.v || 1.6), vy: (o.up === undefined ? 1.2 : o.up) + Math.random() * (o.v || 1.6), vz: (Math.random() - 0.5) * (o.v || 1.6), g: o.g || 0, life: (o.life || 0.9) * (0.7 + Math.random() * 0.6), t: 0, sz: sz });
    }
  }
  function floatText(x, y, z, t, color, hgt, life) {
    if (!scene) return;
    var s = textSprite(t, 'rgba(0,0,0,0)', color, hgt || 0.6); s.position.set(x, y, z); scene.add(s);
    FX.push({ m: s, vx: (Math.random() - 0.5) * 0.6, vy: 1.6, vz: (Math.random() - 0.5) * 0.6, g: 1.2, life: life || 0.9, t: 0, text: true });
  }
  function stepFx(dt) {
    if (!FX.length) return;
    FX = FX.filter(function (f) {
      f.t += dt; f.vy -= f.g * dt;
      f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.position.z += f.vz * dt;
      var k = f.t / f.life;
      if (k >= 1) { if (f.text) disposeSprite(f.m); else { scene.remove(f.m); f.m.material.dispose(); } return false; }
      f.m.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      if (!f.text) { var sc = f.sz * (1 - k * 0.5); f.m.scale.set(sc, sc, 1); }
      return true;
    });
  }
  // 광석을 캘 때: 두드릴 때마다 광석 빛 부스러기, 캐면 반짝 + 맑은 소리, 이어진 광석(광맥)이 있으면 잠깐 비춰 주고 알림
  var veinToldAt = 0;
  function oreTap(x, y, z, id) { var b = oreBase(id); if (b) sparkle(x + 0.5, y + 0.5, z + 0.5, ORE_COLOR[b], 2, { size: 0.22, life: 0.45, up: 0.6 }); }
  function oreBroken(x, y, z, id) {
    var b = oreBase(id); if (!b) return;
    sparkle(x + 0.5, y + 0.5, z + 0.5, ORE_COLOR[b], 12, { size: 0.4, life: 1.0, up: 1.4, v: 2.2 });
    var rare = b === ORE_AU || b === ORE_DIA || b === ORE_SAPH || b === ORE_ONYX || b >= GEM_ORE0 && b <= GEM_ORE0 + 10;
    tone('sine', rare ? 1568 : 1175, rare ? 2093 : 1568, 0.22, 0.045);
    if (rare) setTimeout(function () { tone('sine', 2093, 2637, 0.25, 0.035); }, 110);
    // 광맥: 닿아 있는(대각선 포함) 같은 광석을 32개까지 찾는다
    var seen = {}, q = [[x, y, z]], found = [];
    seen[x + ',' + y + ',' + z] = 1;
    while (q.length && found.length < 32) {
      var c = q.shift();
      for (var dy = -1; dy <= 1; dy++) for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) {
        var nx = c[0] + dx, ny = c[1] + dy, nz = c[2] + dz, k = nx + ',' + ny + ',' + nz;
        if (seen[k]) continue; seen[k] = 1;
        if (oreBase(get(nx, ny, nz)) === b) { found.push([nx, ny, nz]); q.push([nx, ny, nz]); }
      }
    }
    if (found.length) {
      found.forEach(function (p, i) { setTimeout(function () { sparkle(p[0] + 0.5, p[1] + 0.5, p[2] + 0.5, ORE_COLOR[b], 3, { size: 0.5, life: 1.4, up: 0.3, v: 0.4, spread: 0.6, through: true }); }, 120 + i * 60); });
      var now = performance.now();
      questEvent('vein', found.length + 1, 1);
      if (now - veinToldAt > 9000) { veinToldAt = now; toast('⛏ ' + B[b][0] + ' 줄기 — 이어진 광석 ' + found.length + '개가 더 있어요'); }
    }
    questEvent('ore', b, 1);
  }
  // ── 그림자와 싸우기 ──
  var flashMat = null;
  function shadowEyes(s) {
    if (!s.eyes) { s.eyes = []; s.mesh.children.forEach(function (m) { if (!m.isSprite && m.material && m.material !== shadowMat && m.material !== flashMat) s.eyes.push(m); }); }
    return s.eyes;
  }
  function hpBarDraw(s) {
    if (!s.bar) {
      var c = document.createElement('canvas'); c.width = 64; c.height = 10;
      var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.NearestFilter; tex.magFilter = THREE.NearestFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, fog: false }));
      sp.scale.set(1.3, 0.2, 1); sp.position.y = HT * s.sp.h + 0.2; sp.renderOrder = 21; s.mesh.add(sp);
      s.bar = sp; s.barC = c;
    }
    var g = s.barC.getContext('2d'), f = Math.max(0, s.hp) / s.sp.hp;
    g.clearRect(0, 0, 64, 10); g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 0, 64, 10);
    g.fillStyle = f > 0.5 ? '#ffe27a' : (f > 0.25 ? '#ffae4a' : '#ff6a4a'); g.fillRect(2, 2, Math.round(60 * f), 6);
    s.bar.material.map.needsUpdate = true; s.bar.visible = true; s.barT = 4;
  }
  function combatFx(s, dmg, crit) {
    if (!flashMat) flashMat = new THREE.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: 0.95 });
    s.mesh.children.forEach(function (m) { if (m.material === shadowMat) m.material = flashMat; });
    s.flashT = 0.12;
    hpBarDraw(s);
    var top = s.y + HT * s.sp.h + 0.5, n = Math.round(dmg * 10) / 10;
    floatText(s.x, top, s.z, (crit ? '✦ ' : '') + n, crit ? '#ffd23a' : '#ffffff', crit ? 0.8 : 0.6);
    sparkle(s.x, s.y + 1.6 * s.sp.h, s.z, crit ? 0xffd23a : 0xfff0c0, crit ? 8 : 4, { size: 0.35, life: 0.5, v: 2.4, up: 0.8 });
    if (crit) { newsMark('crit'); tone('square', 520, 1040, 0.12, 0.04); vibrate('break'); if (s.hp <= 0) questEvent('crit'); }
  }
  function shadowFxStep(s, dt) {
    if (s.flashT > 0) { s.flashT -= dt; if (s.flashT <= 0) s.mesh.children.forEach(function (m) { if (m.material === flashMat) m.material = shadowMat; }); }
    if (s.bar && s.barT > 0) { s.barT -= dt; if (s.barT <= 0 || s.dead) s.bar.visible = false; }
    if (s.kx || s.kz) {   // 밀려나기(땅을 따라 미끄러지듯)
      var nx = s.x + s.kx * dt, nz = s.z + s.kz * dt, ny = groundAt(nx, nz, s.y + 2);
      if (ny !== null && Math.abs(ny - s.y) <= 1.6) { s.x = nx; s.z = nz; s.y = ny; }
      s.kx *= Math.pow(0.02, dt); s.kz *= Math.pow(0.02, dt); if (Math.abs(s.kx) + Math.abs(s.kz) < 0.2) s.kx = s.kz = 0;
    }
    // 공격 신호: 몸을 뒤로 젖히고 눈이 커지며 밝아짐
    var w = s.wind > 0 ? 1 - s.wind / 0.45 : 0;
    s.mesh.rotation.x = s.wind > 0 ? -0.35 * w : (s.lunge > 0 ? 0.3 * s.lunge : 0);
    if (s.lunge > 0) s.lunge = Math.max(0, s.lunge - dt * 4);
    shadowEyes(s).forEach(function (m) { var k = s.wind > 0 ? 1 + w * 0.9 : 1; m.scale.set(k, k, 1); });
  }
  function sweepHit(s0) {   // 성령의 검: 앞쪽 가까이 있는 다른 그림자도 함께(조금 약하게)
    var dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    SHADOWS.forEach(function (o) {
      if (o === s0 || o.dead) return;
      var dx = o.x - P.x, dz = o.z - P.z, d = Math.hypot(dx, dz);
      if (d < 3.4 && Math.abs(o.y - P.y) < 2.5 && (dx * dir.x + dz * dir.z) / (d || 1) > 0.2) hitShadow(o, 2, true);
    });
    sparkleArc();
  }
  function sparkleArc() {   // 휘두른 자리에 빛 줄기
    var dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    for (var i = -3; i <= 3; i++) {
      var a = i * 0.22, cx = dir.x * Math.cos(a) - dir.z * Math.sin(a), cz = dir.x * Math.sin(a) + dir.z * Math.cos(a);
      (function (cx, cz, i) { setTimeout(function () { sparkle(P.x + cx * 2.2, P.y + 1.9 - i * 0.08, P.z + cz * 2.2, 0xfff3c4, 1, { size: 0.45, life: 0.3, up: 0, v: 0.2, spread: 0.1 }); }, (i + 3) * 14); })(cx, cz, i);
    }
  }
  function shadowDeathFx(s) {
    sparkle(s.x, s.y + 1.2 * s.sp.h, s.z, 0xfff3c4, s.kind === 'great' ? 26 : 16, { size: 0.42, life: 1.4, up: 2.2, v: 1.2, spread: 1.2 });
    tone('sine', 880, 1760, 0.35, 0.04); setTimeout(function () { tone('sine', 1320, 2640, 0.4, 0.03); }, 140);
  }
  // ───────── 남쪽 새 지역의 건축물(11/20): 성막(출 25–27장 치수 그대로) · 백향목 망대 · 나그네 장막촌 · 소금 기둥 ─────────
  // 성막 뜰: 길이 100 · 너비 50 · 세마포 휘장 높이 5(출 27:18), 동쪽 문, 번제단 5×5×3(출 27:1), 물두멍, 성막 30×10×10, 지성소 10×10×10
  var TB_TENT = { x0: TBX - 42, x1: TBX - 13, z0: TBZ - 5, z1: TBZ + 4 }, TWY = G + 4, TCY = G + 1;
  var TENTS = [[-10, -9, 0], [7, -10, 1], [-9, 8, 1], [8, 7, 0]];
  var LANDMARKS = [
    { k: 'tabernacle', x0: TBX - 50, z0: TBZ - 25, x1: TBX + 49, z1: TBZ + 24, flat: 0 },
    { k: 'tower', x0: CTX - 6, z0: CTZ - 6, x1: CTX + 6, z1: CTZ + 6, flat: 4 },
    { k: 'tents', x0: TCX - 16, z0: TCZ - 16, x1: TCX + 16, z1: TCZ + 16, flat: 1 },
    { k: 'lot', x0: LOTX - 2, z0: LOTZ - 2, x1: LOTX + 2, z1: LOTZ + 2, flat: 1 }
  ];
  function landmarkAt(x, z, m) {
    if (!LANDMARKS) return '';
    m = m || 0;
    for (var i = 0; i < LANDMARKS.length; i++) { var L = LANDMARKS[i]; if (x >= L.x0 - m && x <= L.x1 + m && z >= L.z0 - m && z <= L.z1 + m) return L.k; }
    return '';
  }
  function landmarkFlat(x, z) {   // [평평하게 할 높이, 섞는 정도] — 둘레 10칸에 걸쳐 원래 땅과 이어지게
    if (!LANDMARKS) return null;
    for (var i = 0; i < LANDMARKS.length; i++) {
      var L = LANDMARKS[i], dx = Math.max(L.x0 - 3 - x, 0, x - L.x1 - 3), dz = Math.max(L.z0 - 3 - z, 0, z - L.z1 - 3), d = Math.hypot(dx, dz);
      if (d < 12) return [L.flat, 1 - sstep(0, 12, d)];
    }
    return null;
  }
  function inLandmark(x, z) { return landmarkAt(x, z, 1); }
  function cedarTree(x, y, z, h) {   // 레바논 백향목: 곧은 줄기, 넓고 납작한 가지 켜(시 92:12)
    for (var i = 0; i < h; i++) { setRaw(x, y + i, z, CEDAR_LOG); setRaw(x + 1, y + i, z, CEDAR_LOG); setRaw(x, y + i, z + 1, CEDAR_LOG); setRaw(x + 1, y + i, z + 1, CEDAR_LOG); }
    var tiers = 0;
    for (var ly = Math.floor(h * 0.4); ly <= h; ly += 3) {
      var r = Math.max(1.5, (h - ly) / h * 8 + 1.2);
      for (var dz = -Math.ceil(r); dz <= Math.ceil(r) + 1; dz++) for (var dx = -Math.ceil(r); dx <= Math.ceil(r) + 1; dx++) {
        var ddx = dx - 0.5, ddz = dz - 0.5, dd = ddx * ddx + ddz * ddz, rr = r + (hash2(x + dx, z + dz, ly) - 0.5) * 1.2;
        if (dd <= rr * rr && get2(x + dx, y + ly, z + dz) === AIR) setRaw(x + dx, y + ly, z + dz, CEDAR_LEAF);
        if (dd <= (rr - 1.5) * (rr - 1.5) && get2(x + dx, y + ly + 1, z + dz) === AIR) setRaw(x + dx, y + ly + 1, z + dz, CEDAR_LEAF);
      }
      tiers++;
    }
    for (var t = 0; t < 2; t++) for (var dz2 = 0; dz2 <= 1; dz2++) for (var dx2 = 0; dx2 <= 1; dx2++) if (get2(x + dx2, y + h + 1 + t, z + dz2) === AIR) setRaw(x + dx2, y + h + 1 + t, z + dz2, CEDAR_LEAF);
  }
  function acaciaTree(x, y, z, h) {   // 광야의 조각목(출 27:1): 굽은 줄기, 납작한 잎 지붕
    var cx = x, cz = z, dir = hash2(x, z, 27) < 0.5 ? 1 : -1;
    for (var i = 0; i < h; i++) { if (i === Math.floor(h / 2)) cx += dir; setRaw(cx, y + i, cz, LOG); }
    for (var dz = -3; dz <= 3; dz++) for (var dx = -3; dx <= 3; dx++) {
      if (Math.abs(dx) + Math.abs(dz) > 4) continue;
      if (get2(cx + dx, y + h, cz + dz) === AIR) setRaw(cx + dx, y + h, cz + dz, LEAF);
      if (Math.abs(dx) + Math.abs(dz) <= 2 && get2(cx + dx, y + h + 1, cz + dz) === AIR) setRaw(cx + dx, y + h + 1, cz + dz, LEAF);
    }
  }
  function buildLandmarks(x0, z0) {
    LANDMARKS.forEach(function (L) {
      if (x0 + CS <= L.x0 - 4 || x0 > L.x1 + 4 || z0 + CS <= L.z0 - 4 || z0 > L.z1 + 4) return;
      if (L.k === 'tabernacle') buildTabernacle(); else if (L.k === 'tower') buildCedarTower(); else if (L.k === 'tents') buildTentCamp(); else buildLotPillar();
    });
  }
  function buildTabernacle() {
    var x0 = TBX - 50, x1 = TBX + 49, z0 = TBZ - 25, z1 = TBZ + 24, y = G, x, z;
    fill(x0 - 2, G, z0 - 2, x1 + 2, SY - 1, z1 + 2, AIR);
    fill(x0 - 2, G - 4, z0 - 2, x1 + 2, G - 2, z1 + 2, SAND);
    fill(x0 - 2, G - 1, z0 - 2, x1 + 2, G - 1, z1 + 2, SAND);
    fill(x0 + 1, G - 1, z0 + 1, x1 - 1, G - 1, z1 - 1, 18);
    // 세마포 휘장(높이 5)과 5규빗마다 기둥(놋 받침·은 머리)
    [[x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1]].forEach(function (s) { fill(s[0], y, s[1], s[2], y + 4, s[3], WOOL_W); });
    function post(px, pz) { setRaw(px, y, pz, BLK_CU); fill(px, y + 1, pz, px, y + 4, pz, PILLAR); setRaw(px, y + 5, pz, BLK_AG); }
    for (x = x0; x <= x1; x += 5) { post(x, z0); post(x, z1); }
    post(x1, z1);
    for (z = z0; z <= z1; z += 5) { post(x0, z); post(x1, z); }
    // 동쪽 뜰 문 너비 20(출 27:16): 위쪽에 청색·자색·홍색 실로 수놓은 휘장, 아래는 드나드는 곳
    var gz0 = TBZ - 10, gz1 = TBZ + 9, cols = [WOOL_B, WOOL_V, WOOL_R, WOOL_W];
    fill(x1, y, gz0, x1, y + 3, gz1, AIR);
    for (z = gz0; z <= gz1; z++) setRaw(x1, y + 4, z, cols[(z - gz0) % 4]);
    [gz0, gz0 + 6, gz1 - 6, gz1].forEach(function (pz) { post(x1, pz); });
    fill(x1 + 1, G - 1, gz0, x1 + 2, G - 1, gz1, 18);
    // 번제단: 길이·너비 5, 높이 3, 네 모퉁이 뿔(출 27:1-2), 위에 불
    var ax = TBX + 22;
    fill(ax - 2, y, TBZ - 2, ax + 2, y + 2, TBZ + 2, BLK_CU);
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(function (c) { setRaw(ax + c[0], y + 3, TBZ + c[1], BLK_CU); });
    setRaw(ax, y + 3, TBZ, LAMP);
    // 물두멍(출 30:18): 놋 받침 위 물
    var lx = TBX + 6;
    fill(lx - 1, y, TBZ - 1, lx + 1, y, TBZ + 1, BLK_CU); setRaw(lx, y, TBZ, WATER);
    // 성막: 금으로 싼 널판(출 26:29) 벽, 붉은 물 들인 숫양의 가죽 덮개(출 26:14), 동쪽 입구 기둥 다섯(출 26:37)
    var T2 = TB_TENT;
    fill(T2.x0, y, T2.z0, T2.x1, y + 9, T2.z1, BLK_AU);
    fill(T2.x0 + 1, y, T2.z0 + 1, T2.x1 - 1, y + 9, T2.z1 - 1, AIR);
    fill(T2.x0 + 1, G - 1, T2.z0 + 1, T2.x1 - 1, G - 1, T2.z1 - 1, SAND);
    fill(T2.x0 - 1, y + 10, T2.z0 - 1, T2.x1 + 1, y + 10, T2.z1 + 1, WOOL_R);
    fill(T2.x0 - 1, y + 6, T2.z0 - 1, T2.x1 + 1, y + 9, T2.z0 - 1, WOOL_R); fill(T2.x0 - 1, y + 6, T2.z1 + 1, T2.x1 + 1, y + 9, T2.z1 + 1, WOOL_R);
    fill(T2.x0 - 1, y + 6, T2.z0 - 1, T2.x0 - 1, y + 9, T2.z1 + 1, WOOL_R);
    fill(T2.x1, y, T2.z0 + 1, T2.x1, y + 8, T2.z1 - 1, AIR);
    for (z = T2.z0 + 1; z <= T2.z1 - 1; z++) setRaw(T2.x1, y + 9, z, cols[(z - T2.z0) % 3]);
    [T2.z0 + 1, T2.z0 + 3, TBZ, T2.z1 - 3, T2.z1 - 1].forEach(function (pz) { fill(T2.x1, y, pz, T2.x1, y + 8, pz, BLK_AU); });
    // 휘장(출 26:31-33): 지성소와 성소 사이 — 위로부터 아래까지 찢어져 열린 길(마 27:51, 히 10:20)
    var vx = T2.x0 + 10;
    for (z = T2.z0 + 1; z <= T2.z1 - 1; z++) fill(vx, y, z, vx, y + 9, z, cols[(z - T2.z0) % 3]);
    fill(vx, y, TBZ - 1, vx, y + 9, TBZ, AIR);
    // 지성소: 언약궤 / 성소: 남쪽 등잔대, 북쪽 떡상, 휘장 앞 분향단
    fill(T2.x0 + 4, y, TBZ - 1, T2.x0 + 5, y, TBZ, BLK_AU); setRaw(T2.x0 + 4, y + 1, TBZ - 1, LANTERN); setRaw(T2.x0 + 5, y + 1, TBZ, LANTERN);
    fill(TBX - 26, y, T2.z1 - 2, TBX - 26, y + 1, T2.z1 - 2, BLK_AU); setRaw(TBX - 26, y + 2, T2.z1 - 2, LANTERN);
    fill(TBX - 27, y, T2.z0 + 2, TBX - 25, y, T2.z0 + 2, BLK_AU);
    fill(vx + 2, y, TBZ - 1, vx + 2, y + 1, TBZ - 1, BLK_AU); setRaw(vx + 2, y + 2, TBZ - 1, LANTERN);
    for (x = T2.x0 + 14; x < T2.x1; x += 6) setRaw(x, y + 9, TBZ, LAMP);
  }
  function buildCedarTower() {   // 견고한 망대(잠 18:10): 돌 탑 18칸 + 백향목 기둥 + 넓은 전망대 + 기와 지붕
    var x0 = CTX - 4, x1 = CTX + 4, z0 = CTZ - 4, z1 = CTZ + 4, y = TWY, k;
    fill(x0 - 5, y, z0 - 5, x1 + 5, SY - 1, z1 + 5, AIR);
    fill(x0 - 2, y - 1, z0 - 2, x1 + 2, y - 1, z1 + 2, 18);
    fill(x0, y, z0, x1, y + 17, z1, SBRICK); fill(x0 + 1, y, z0 + 1, x1 - 1, y + 17, z1 - 1, AIR);
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) { fill(c[0], y, c[1], c[0], y + 17, c[1], CEDAR_LOG); });
    fill(CTX - 1, y, z1, CTX + 1, y + 3, z1, AIR);                       // 남쪽 문
    for (k = 5; k <= 15; k += 5) { fill(CTX, y + k, z0, CTX, y + k + 1, z0, AIR); fill(x0, y + k, CTZ + 1, x0, y + k + 1, CTZ + 1, AIR); fill(x1, y + k, CTZ, x1, y + k + 1, CTZ, AIR); }
    fill(x0 + 1, y + 9, z0 + 1, x1 - 1, y + 9, z1 - 1, GOPHER);          // 가운데 층
    for (k = 0; k <= 18; k++) setRaw(x0 + 1, y + k, CTZ - 1, LADDER + 3);   // 서쪽 벽 사닥다리
    setRaw(x1 - 1, y + 10, z1 - 1, LANTERN); setRaw(x1 - 1, y, z0 + 1, LANTERN);
    // 전망대(13×13): 바닥, 돌 난간, 백향목 기둥, 등불, 기와 지붕, 깃발
    fill(x0 - 2, y + 18, z0 - 2, x1 + 2, y + 18, z1 + 2, GOPHER); setRaw(x0 + 1, y + 18, CTZ - 1, LADDER + 3);
    for (k = x0 - 2; k <= x1 + 2; k++) { setRaw(k, y + 19, z0 - 2, RAIL); setRaw(k, y + 19, z1 + 2, RAIL); }
    for (k = z0 - 2; k <= z1 + 2; k++) { setRaw(x0 - 2, y + 19, k, RAIL); setRaw(x1 + 2, y + 19, k, RAIL); }
    [[x0 - 2, z0 - 2], [x1 + 2, z0 - 2], [x0 - 2, z1 + 2], [x1 + 2, z1 + 2]].forEach(function (c) { fill(c[0], y + 19, c[1], c[0], y + 23, c[1], CEDAR_LOG); });
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) { setRaw(c[0], y + 19, c[1], LANTERN); });
    for (k = 0; k < 4; k++) fill(x0 - 3 + k, y + 24 + k, z0 - 3 + k, x1 + 3 - k, y + 24 + k, z1 + 3 - k, 13);
    fill(CTX, y + 28, CTZ, CTX, y + 29, CTZ, CEDAR_LOG); setRaw(CTX, y + 30, CTZ, FLAG);
  }
  function buildTentCamp() {   // 나그네 장막촌(히 11:9): 줄무늬 양털 장막 넷, 가운데 모닥불
    var y = TCY;
    fill(TCX - 16, y, TCZ - 16, TCX + 16, SY - 1, TCZ + 16, AIR);
    fill(TCX - 2, y - 1, TCZ - 2, TCX + 2, y - 1, TCZ + 2, 18);
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (c) { setRaw(TCX + c[0], y, TCZ + c[1], STONE); }); setRaw(TCX, y, TCZ, LAMP);
    TENTS.forEach(function (t, n) {
      var tx = TCX + t[0], tz = TCZ + t[1], a = t[2] ? WOOL_B : WOOL_R;
      for (var k = 0; k <= 4; k++) for (var dz = -4; dz <= 4; dz++) {
        var c = (dz + 4) % 2 ? WOOL_W : a;
        setRaw(tx - 4 + k, y + k, tz + dz, c); setRaw(tx + 4 - k, y + k, tz + dz, c);
      }
      for (var k2 = 0; k2 <= 3; k2++) fill(tx - 3 + k2, y + k2, tz + 4, tx + 3 - k2, y + k2, tz + 4, a);   // 뒤쪽 막음
      fill(tx - 2, y - 1, tz - 3, tx + 2, y - 1, tz + 3, 18);
      fill(tx - 1, y, tz - 3, tx + 1, y, tz + 3, CARPET);
      setRaw(tx - 3, y, tz + 3, JAR); setRaw(tx + 3, y, tz + 3, OIL_JAR); setRaw(tx, y, tz + 3, OIL_LAMP);
    });
  }
  function buildLotPillar() {   // 소금 기둥(창 19:26)
    var y = G + 1;
    fill(LOTX - 1, y, LOTZ - 1, LOTX + 1, y, LOTZ + 1, SALT_ROCK);
    fill(LOTX, y + 1, LOTZ, LOTX, y + 4, LOTZ, SALT_ROCK);
  }
  // ───────── 지역 이름 카드 · 퀘스트(오늘의 부탁 · 모험 · 땅 밟기) (11/20) ─────────
  // 구절은 개역개정 원문 대조(2026-11-20, bskorea)
  var REGION_INFO = {
    town: ['나그네 마을'], west: ['서쪽 산'], east: ['동쪽 숲'], sea: ['북쪽 바다'], desert: ['동쪽 사막'], oasis: ['오아시스'],
    ararat: ['아라랏 산'], lake: ['남쪽 호수'], tar: ['역청 구덩이'], south: ['남쪽 들판'],
    cedar: ['백향목 숲', '의인은 종려나무 같이 번성하며 레바논의 백향목 같이 성장하리로다', '시편 92:12'],
    wild: ['광야', '네 하나님 여호와께서 이 사십 년 동안에 네게 광야 길을 걷게 하신 것을 기억하라 이는 너를 낮추시며 너를 시험하사 네 마음이 어떠한지 그 명령을 지키는지 지키지 않는지 알려 하심이라', '신명기 8:2'],
    salt: ['소금 바다', '너희는 세상의 소금이니 소금이 만일 그 맛을 잃으면 무엇으로 짜게 하리요 후에는 아무 쓸 데 없어 다만 밖에 버려져 사람에게 밟힐 뿐이니라', '마태복음 5:13'],
    tabernacle: ['성막', '내가 그들 중에 거할 성소를 그들이 나를 위하여 짓되', '출애굽기 25:8'],
    tower: ['백향목 망대', '여호와의 이름은 견고한 망대라 의인은 그리로 달려가서 안전함을 얻느니라', '잠언 18:10'],
    tents: ['나그네 장막촌', '믿음으로 그가 이방의 땅에 있는 것 같이 약속의 땅에 거류하여 동일한 약속을 유업으로 함께 받은 이삭 및 야곱과 더불어 장막에 거하였으니', '히브리서 11:9'],
    lot: ['소금 기둥', '롯의 아내는 뒤를 돌아보았으므로 소금 기둥이 되었더라', '창세기 19:26']
  };
  var WALK_KEYS = ['town', 'east', 'west', 'sea', 'desert', 'oasis', 'ararat', 'lake', 'tar', 'south', 'cedar', 'wild', 'salt'];
  var ADV = { day: '', list: [], done: {}, regions: {}, tour: 0, total: 0, bonus: '' };
  try { var advS = JSON.parse(localStorage.getItem('arkVillage.adv') || 'null'); if (advS && typeof advS === 'object') { for (var ak in advS) ADV[ak] = advS[ak]; } } catch (e) {}
  function advSave() { try { localStorage.setItem('arkVillage.adv', JSON.stringify(ADV)); } catch (e) {} if (typeof stateDirty === 'function') stateDirty(); advChip(); }
  function advMerge(d) {   // 다른 기기 기록과 합치기(이룬 것은 잃지 않게)
    if (!d || typeof d !== 'object') return;
    ['done', 'regions'].forEach(function (k) { for (var q in (d[k] || {})) ADV[k][q] = 1; });
    ADV.tour = Math.max(ADV.tour || 0, d.tour || 0); ADV.total = Math.max(ADV.total || 0, d.total || 0);
    if (d.day && d.day >= ADV.day && Array.isArray(d.list)) { if (d.day > ADV.day) { ADV.day = d.day; ADV.list = d.list; } else d.list.forEach(function (e, i) { var m = ADV.list[i]; if (m && e && e.i === m.i) { m.n = Math.max(m.n || 0, e.n || 0); m.claimed = m.claimed || e.claimed; } }); }
    if (d.bonus && d.bonus > (ADV.bonus || '')) ADV.bonus = d.bonus;
    try { localStorage.setItem('arkVillage.adv', JSON.stringify(ADV)); } catch (e) {}
  }
  // 지역 카드: 새 지역에 들어서면 가운데에 이름(과 말씀)
  var regKey = '', regPend = '', regPendN = 0, regCardT = null;
  function regionKeyAt() {
    var x = Math.floor(P.x), z = Math.floor(P.z), lm = inLandmark(x, z);
    if (lm) return lm;
    if (inTown(x, z) || plotAt(x, z) >= 0 || inCommons(x, z) || inArk(x, G + 2, z)) return 'town';
    var r = region(x, z); return REGION_INFO[r] ? r : (z > LZ + 50 ? 'south' : '');
  }
  function showRegionCard(k, first) {
    var info = REGION_INFO[k]; if (!info || $('card').classList.contains('show')) return;
    var el = $('regionCard');
    if (!el) { el = document.createElement('div'); el.id = 'regionCard'; el.style.cssText = 'position:fixed;left:50%;top:21%;transform:translateX(-50%);z-index:30;pointer-events:none;text-align:center;width:min(560px,84vw);transition:opacity .8s;opacity:0;text-shadow:0 2px 0 #000,0 0 12px rgba(0,0,0,.7)'; document.body.appendChild(el); }
    el.innerHTML = '';
    var n = document.createElement('div'); n.textContent = info[0]; n.style.cssText = 'font-size:' + (isTouch ? 26 : 34) + 'px;color:#ffe27a;letter-spacing:3px;font-weight:bold'; el.appendChild(n);
    if (first) { var f = document.createElement('div'); f.textContent = '— 처음 밟은 땅 —'; f.style.cssText = 'font-size:12px;color:#fff;opacity:.85;margin-top:2px'; el.appendChild(f); }
    if (info[1]) { var v = document.createElement('div'); v.textContent = '「' + info[1] + '」 ' + info[2]; v.style.cssText = 'font-size:' + (isTouch ? 12 : 14) + 'px;color:#fff;margin-top:6px;line-height:1.45'; el.appendChild(v); }
    el.style.opacity = '1'; clearTimeout(regCardT); regCardT = setTimeout(function () { el.style.opacity = '0'; }, info[1] ? 6500 : 3200);
  }
  function regionTick() {
    if (!started || ui !== 'play') return;
    advDaily(); advChip();
    var k = regionKeyAt();
    if (k && k !== regKey) {
      if (k === regPend) regPendN++; else { regPend = k; regPendN = 1; }
      if (regPendN >= 2) {
        var first = !ADV.regions[k] && WALK_KEYS.indexOf(k) >= 0;
        regKey = k; showRegionCard(k, first && k !== 'town');
        if (first) { ADV.regions[k] = 1; advSave(); }
        questEvent('visit', k, 1);
        if (k === 'lot') advDone('lot');
        if (k === 'cedar' || k === 'wild' || k === 'salt' || k === 'tabernacle' || k === 'tower' || k === 'tents') newsMark('south');
      }
    }
    // 모험: 성막 순례 · 망대 꼭대기 · 장막촌의 밤 · 소금 10개
    var x = P.x, z = P.z;
    if (!ADV.done.tabernacle && inLandmark(Math.floor(x), Math.floor(z)) === 'tabernacle') {
      var T2 = TB_TENT, vx = T2.x0 + 10, step = ADV.tour || 0, inTent = x > T2.x0 && x < T2.x1 + 0.5 && z > T2.z0 && z < T2.z1 + 1;
      var ok = [Math.abs(x - (TBX + 49)) < 6 && Math.abs(z - TBZ) < 11, Math.hypot(x - (TBX + 22), z - TBZ) < 5.5, Math.hypot(x - (TBX + 6), z - TBZ) < 3.5, inTent && x > vx + 1, inTent && x < vx][step];
      var names = ['🚪 뜰 문으로 들어왔어요 — 번제단으로 가요', '🔥 번제단(출 27:1) — 이제 물두멍으로', '💧 물두멍(출 30:18) — 이제 성막 안 성소로', '🕯 성소 — 등잔대·떡상·분향단 너머 휘장이 열려 있어요', ''];
      if (ok) { ADV.tour = step + 1; advSave(); if (step < 4) toast(names[step]); else advDone('tabernacle'); }
    }
    if (!ADV.done.tower && Math.abs(x - CTX) < 8 && Math.abs(z - CTZ) < 8 && P.y >= TWY + 18) advDone('tower');
    if (!ADV.done.tents && inLandmark(Math.floor(x), Math.floor(z)) === 'tents' && isNight()) advDone('tents');
    if (!ADV.done.salt10 && have(SALT) >= 10) advDone('salt10');
    if (!ADV.done.walk && WALK_KEYS.every(function (k2) { return ADV.regions[k2]; })) advDone('walk');
  }
  // 모험(한 번만): [키, 이름, 할 일, 보상, 카드(그림·이름·말씀·장절) 또는 null]
  var ADVS = [
    ['tabernacle', '⛺ 성막 순례', '광야 한가운데 성막: 뜰 문 → 번제단 → 물두멍 → 성소 → 지성소 순서로 걸어 봐요', [[GEM_SAPH, 1], [LANTERN, 2]], ['⛺', '열린 휘장', '그 길은 우리를 위하여 휘장 가운데로 열어 놓으신 새로운 살 길이요 휘장은 곧 그의 육체니라', '히브리서 10:20']],
    ['tower', '🗼 백향목 망대 꼭대기', '백향목 숲 가운데 돌 망대의 사닥다리를 타고 꼭대기 전망대까지 올라가요', [[ARROW, 12]], ['🗼', '견고한 망대', REGION_INFO.tower[1], REGION_INFO.tower[2]]],
    ['tents', '⛺ 장막촌의 밤', '소금 바다 서쪽 나그네 장막촌에서 밤을 맞아요', [[BREAD, 4], [WOOL_W, 6]], ['⛺', '장막에 거한 나그네', REGION_INFO.tents[1], REGION_INFO.tents[2]]],
    ['salt10', '🧂 세상의 소금', '소금 바다의 소금 땅·소금 바위를 캐서 소금 10개를 모아요', [[COOKED_FISH, 3]], ['🧂', '세상의 소금', REGION_INFO.salt[1], REGION_INFO.salt[2]]],
    ['lot', '🧂 뒤돌아보지 않기', '소금 바다 남쪽 바닷가의 소금 기둥을 찾아가요', [[SHARD, 2]], null],
    ['vein', '💎 광맥 찾기', '광석을 캐다가 이어진 광석이 5개 넘는 줄기를 찾아요', [[ING_FE, 3]], null],
    ['crit', '✦ 강한 일격', '뛰어올라 떨어지면서 칼로 쳐서 그림자를 물리쳐요', [[SHARD, 3]], null],
    ['walk', '🗺 땅을 두루 밟기', '나그네 땅 13곳을 모두 밟아요(땅 밟기 탭)', [[GEM_DIA, 1], [ING_AU, 2]], ['🗺', '두루 다녀 보라', '너는 일어나 그 땅을 종과 횡으로 두루 다녀 보라 내가 그것을 네게 주리라', '창세기 13:17']]
  ];
  function advDone(k) {
    if (ADV.done[k]) return;
    var a = ADVS.filter(function (q) { return q[0] === k; })[0]; if (!a) return;
    ADV.done[k] = 1; advSave();
    a[3].forEach(function (r) { give(r[0], r[1]); }); bagChanged();
    var gift = a[3].map(function (r) { return B[r[0]][0] + ' ' + r[1]; }).join(', ');
    if ($('regionCard')) $('regionCard').style.opacity = '0';
    if (a[4]) showVerseCard(a[4][0], a[4][1], a[4][2], a[4][3], '모험 「' + a[1].replace(/^\S+ /, '') + '」을(를) 마쳤어요 — ' + gift);
    else toast('🎉 모험 「' + a[1] + '」 완료! ' + gift + ' 받았어요');
    sfx('craft'); vibrate('break');
  }
  // 오늘의 부탁(매일 한국 시간 0시에 셋이 바뀜): [종류, 대상, 목표, 글, 보상]
  var ERRANDS = [
    ['ore', ORE_COAL, 8, '⛏ 석탄 광석 8개 캐기', [[TORCH, 6]]],
    ['ore', ORE_CU, 6, '⛏ 구리 광석 6개 캐기', [[ING_CU, 3]]],
    ['ore', ORE_FE, 5, '⛏ 철 광석 5개 캐기', [[ING_FE, 3]]],
    ['ore', ORE_AG, 3, '⛏ 은 광석 3개 캐기', [[ING_AU, 1]]],
    ['shadow', '', 3, '⚔ 어둠의 그림자 3번 물리치기', [[SHARD, 2], [ARROW, 6]]],
    ['shadow', 'doubt', 2, '🛡 「의심」 그림자 2번 물리치기', [[SHARD, 3]]],
    ['log', '', 12, '🪓 통나무 12개 캐기(백향목도 돼요)', [[BREAD, 3]]],
    ['salt', '', 8, '🧂 소금 바다에서 소금 8개 캐기', [[COOKED_FISH, 2]]],
    ['red', '', 8, '🪨 광야의 붉은 바위 8개 캐기', [[RED_EARTH, 4], [LANTERN, 1]]],
    ['place', '', 40, '🧱 블록 40개 놓아 짓기', [[LANTERN, 2]]],
    ['craft', '', 5, '🔨 무엇이든 5번 만들기', [[ING_CU, 2]]],
    ['visit', 'cedar', 1, '🌲 백향목 숲 다녀오기', [[BREAD, 2]]],
    ['visit', 'wild', 1, '🏜 광야 다녀오기', [[BREAD, 2]]],
    ['visit', 'salt', 1, '🌊 소금 바다 다녀오기', [[BREAD, 2]]],
    ['visit', 'ararat', 1, '⛰ 아라랏 산 다녀오기', [[BREAD, 2]]]
  ];
  function kstDay() { return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function advDaily() {
    var d = kstDay(); if (ADV.day === d && ADV.list.length) return;
    var seed = 0; for (var i = 0; i < d.length; i++) seed = (seed * 31 + d.charCodeAt(i)) | 0;
    var R = mkRand(seed), pick = [], kinds = {};
    while (pick.length < 3) { var j = Math.floor(R() * ERRANDS.length), e = ERRANDS[j], kk = e[0] === 'visit' || e[0] === 'ore' ? e[0] : e[0] + e[1]; if (kinds[kk]) continue; kinds[kk] = 1; pick.push(j); }
    ADV.day = d; ADV.list = pick.map(function (j) { return { i: j, n: 0, base: ERRANDS[j][0] === 'place' ? stats.placed : (ERRANDS[j][0] === 'craft' ? stats.crafted : 0), claimed: false }; });
    advSave();
  }
  function errandProg(e) {
    var E = ERRANDS[e.i]; if (!E) return 0;
    if (E[0] === 'place') return Math.max(0, stats.placed - e.base);
    if (E[0] === 'craft') return Math.max(0, stats.crafted - e.base);
    return e.n || 0;
  }
  var errToldDay = {};
  function questEvent(kind, key, n) {
    if (!started) return;
    if (kind === 'vein') { newsMark('vein'); if (key >= 5) advDone('vein'); return; }
    if (kind === 'crit') { newsMark('crit'); advDone('crit'); return; }
    advDaily();
    var ch = false;
    ADV.list.forEach(function (e) {
      var E = ERRANDS[e.i]; if (!E || e.claimed) return;
      var hit = (E[0] === kind && (E[1] === '' || E[1] === key)) ||
        (E[0] === 'log' && kind === 'break' && (key === LOG || key === CEDAR_LOG || key === LOG_X || key === LOG_Z)) ||
        (E[0] === 'salt' && kind === 'break' && (key === SALT_CRUST || key === SALT_ROCK)) ||
        (E[0] === 'red' && kind === 'break' && (key === RED_ROCK || key === RED_ROCK2));
      if (!hit) return;
      var before = errandProg(e); e.n = (e.n || 0) + n; ch = true;
      if (before < E[2] && errandProg(e) >= E[2]) { toast('📜 부탁 완료: ' + E[3].replace(/^\S+ /, '') + ' — 📜 퀘스트에서 보상을 받아요'); sfx('craft'); }
    });
    if (ch) advSave();
  }
  function claimErrand(idx) {
    var e = ADV.list[idx], E = e && ERRANDS[e.i]; if (!E || e.claimed || errandProg(e) < E[2]) return;
    e.claimed = true; ADV.total = (ADV.total || 0) + 1;
    E[4].forEach(function (r) { give(r[0], r[1]); }); bagChanged(); sfx('craft');
    toast('🎁 ' + E[4].map(function (r) { return B[r[0]][0] + ' ' + r[1]; }).join(', ') + ' 받았어요');
    if (ADV.list.every(function (q) { return q.claimed; }) && ADV.bonus !== ADV.day) {
      ADV.bonus = ADV.day; give(GEM_SAPH, 1); bagChanged();
      setTimeout(function () { showVerseCard('🤝', '오늘의 부탁을 다 들어줬어요', '너희가 짐을 서로 지라 그리하여 그리스도의 법을 성취하라', '갈라디아서 6:2', '덤으로 청옥 1개를 받았어요 — 내일 새 부탁이 와요'); }, 400);
    }
    advSave();
  }
  function advChip() {
    var c = $('advChip'); if (!c) return;
    if (!started) { c.hidden = true; return; }
    var ready = ADV.list.filter(function (e) { var E = ERRANDS[e.i]; return E && !e.claimed && errandProg(e) >= E[2]; }).length;
    var left = ADV.list.filter(function (e) { return !e.claimed; }).length;
    c.hidden = false; c.textContent = ready ? '📜 보상 ' + ready : '📜 부탁 ' + left;
    c.classList.toggle('ready', ready > 0);
  }
  var questTab = 'today';
  function openQuests(tab) {
    if (tab) questTab = tab;
    newsMark('quest');
    advDaily();
    var box = fbBox('📜 퀘스트');
    var tabs = document.createElement('div'); tabs.style.cssText = 'display:flex;gap:6px'; box.appendChild(tabs);
    [['today', '오늘의 부탁'], ['adv', '모험 ' + ADVS.filter(function (a) { return ADV.done[a[0]]; }).length + '/' + ADVS.length], ['walk', '땅 밟기 ' + WALK_KEYS.filter(function (k) { return ADV.regions[k]; }).length + '/' + WALK_KEYS.length]].forEach(function (t) {
      var b = fbBtn(tabs, t[1], function () { openQuests(t[0]); }); b.style.flex = '1'; b.style.fontSize = '13px'; if (questTab === t[0]) b.style.boxShadow = 'inset 0 0 0 2px #ffe27a';
    });
    var body = document.createElement('div'); body.style.cssText = 'display:flex;flex-direction:column;gap:6px;font-size:13px'; box.appendChild(body);
    function row(title, sub, right) {
      var r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);padding:6px 8px';
      var l = document.createElement('div'); l.style.flex = '1';
      var t = document.createElement('div'); t.textContent = title; l.appendChild(t);
      if (sub) { var s = document.createElement('small'); s.textContent = sub; s.style.cssText = 'opacity:.75;display:block;margin-top:2px'; l.appendChild(s); }
      r.appendChild(l); if (right) r.appendChild(right); body.appendChild(r); return r;
    }
    function gifts(list) { return '보상: ' + list.map(function (r) { return B[r[0]][0] + ' ' + r[1]; }).join(', '); }
    if (questTab === 'today') {
      ADV.list.forEach(function (e, i) {
        var E = ERRANDS[e.i]; if (!E) return;
        var p = Math.min(errandProg(e), E[2]), right;
        if (e.claimed) { right = document.createElement('b'); right.textContent = '✔ 받음'; right.style.color = '#8be08b'; }
        else if (p >= E[2]) right = fbBtn(document.createElement('span'), '보상 받기', function () { claimErrand(i); openQuests(); });
        else { right = document.createElement('b'); right.textContent = p + '/' + E[2]; }
        row(E[3], gifts(E[4]), right);
      });
      var note = document.createElement('small'); note.style.opacity = '.75';
      note.textContent = '매일 0시에 새 부탁 셋이 와요. 셋을 다 들어주면 덤으로 청옥을 받아요. 지금까지 들어준 부탁 ' + (ADV.total || 0) + '번'; body.appendChild(note);
    } else if (questTab === 'adv') {
      ADVS.forEach(function (a) {
        var right = document.createElement('b'); right.textContent = ADV.done[a[0]] ? '✔' : (a[0] === 'tabernacle' && ADV.tour ? ADV.tour + '/5' : '');
        right.style.color = '#8be08b'; row(a[1], a[2] + ' · ' + gifts(a[3]), right);
      });
      var go = document.createElement('div'); go.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap'; body.appendChild(go);
      [['🌲 백향목 숲', CTX + 0.5, CTZ + 9.5], ['🏜 광야 성막', TBX + 56.5, TBZ + 0.5], ['🌊 소금 바다', TCX + 0.5, TCZ + 18.5]].forEach(function (g) {
        fbBtn(go, g[0] + ' 길 안내', function () { $('fbBox').remove(); startFrontierGuide([Math.floor(g[1]), Math.floor(g[2])], g[0].replace(/^\S+ /, '')); resume(); }).style.fontSize = '12px';
      });
    } else {
      WALK_KEYS.forEach(function (k) { var right = document.createElement('b'); right.textContent = ADV.regions[k] ? '✔' : '?'; right.style.color = ADV.regions[k] ? '#8be08b' : '#999'; row(ADV.regions[k] ? REGION_INFO[k][0] : '아직 밟지 않은 땅', null, right); });
    }
    fbBtn(box, '닫기', function () { box.remove(); });
  }
  // ── 마을 소식 · 선물 · 건축 사진 · 설계도 나누기(서버: sql-migrations/2026-11-19-ark-village-social.sql) ──
  // 자유 글은 쓰지 않는다: 소식은 종류+숫자, 사진 제목과 설계도 이름은 고르기
  var SOCIAL = { feed: [], feedAt: 0, lastSeen: 0, gifts: [], giftAt: 0, giftN: -1, photos: [], photoAt: 0, plans: null, planAt: 0, imgs: {}, busy: {} };
  var PLAN_NAMES = ['우리 집', '작은 집', '큰 집', '탑', '정원', '다리', '양 우리', '가게', '성막 모형', '그 밖의 건물'];
  var PHOTO_CAPS = ['우리 집', '함께 지은 것', '멋진 경치', '밤하늘', '농장', '동물들', '방주', '개척 땅', '동굴', '마을'];
  function socialOn() { return !!(client && me && NET.ok); }
  function feedPost(kind, n) { if (!socialOn()) return; client.rpc('post_ark_feed', { p_kind: kind, p_n: n | 0 }).then(function () { SOCIAL.feedAt = 0; }, function () {}); }
  function feedLine(f) {
    var who = f.nick + '님이 ';
    if (f.kind === 'ach') { var a = ACHS[f.n]; return a ? a[1] + ' ' + who + '「' + a[2] + '」 업적을 받았어요' : null; }
    if (f.kind === 'build') return '🏠 ' + who + '내 땅에 블록 ' + f.n + '개를 놓았어요';
    if (f.kind === 'photo') return '📷 ' + who + '건축 사진을 올렸어요';
    if (f.kind === 'plan') return '📐 ' + who + '설계도를 나눴어요';
    if (f.kind === 'gift') return '🎁 ' + who + '친구에게 선물을 보냈어요';
    return null;
  }
  function timeAgo(t) { var m = Math.max(0, Math.round((Date.now() - new Date(t).getTime()) / 60000)); return m < 1 ? '방금' : (m < 60 ? m + '분 전' : (m < 1440 ? Math.floor(m / 60) + '시간 전' : Math.floor(m / 1440) + '일 전')); }
  function socialRerender(tab) { if (ui === 'villageWork' && villageTab === tab) renderVillageWork(); }
  function fetchFeed(force) {
    if (!socialOn() || SOCIAL.busy.feed || (!force && Date.now() < SOCIAL.feedAt)) return;
    SOCIAL.feedAt = Date.now() + 60000; SOCIAL.busy.feed = 1;
    client.rpc('get_ark_feed').then(function (r) {
      SOCIAL.busy.feed = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      SOCIAL.feed = r.data;
      var news = r.data.filter(function (f) { return !f.mine && f.id > SOCIAL.lastSeen; });
      if (SOCIAL.lastSeen && news.length && ui === 'play') { var t = feedLine(news[0]); if (t) toast('📣 ' + t + (news.length > 1 ? ' 외 ' + (news.length - 1) + '개 소식' : '')); }
      if (r.data.length) SOCIAL.lastSeen = Math.max(SOCIAL.lastSeen, r.data[0].id);
      socialRerender('feed');
    }, function () { SOCIAL.busy.feed = 0; });
  }
  function buildMilestone() { if ([50, 100, 300, 1000].indexOf(stats.placed) >= 0) feedPost('build', stats.placed); }
  // 선물: 손에 든 것을 친구에게 1·4·8개
  function giftError(c) { return { login: '로그인하면 선물을 보낼 수 있어요', friend: '친구에게만 보낼 수 있어요', item: '이건 보낼 수 없어요', daily: '오늘은 선물을 다 보냈어요(하루 10번)', full: '친구의 선물함이 가득 찼어요' }[c] || '선물을 보내지 못했어요. 조금 뒤에 다시 해 주세요'; }
  function fetchGifts(force) {
    if (!socialOn() || SOCIAL.busy.gift || (!force && Date.now() < SOCIAL.giftAt)) return;
    SOCIAL.giftAt = Date.now() + 90000; SOCIAL.busy.gift = 1;
    client.rpc('get_ark_gifts').then(function (r) {
      SOCIAL.busy.gift = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      if (SOCIAL.giftN >= 0 && r.data.length > SOCIAL.giftN && ui === 'play') toast('🎁 선물이 왔어요 — 📒 마을 수첩 「선물」에서 받아요');
      SOCIAL.gifts = r.data; SOCIAL.giftN = r.data.length;
      socialRerender('gifts');
    }, function () { SOCIAL.busy.gift = 0; });
  }
  function sendGift(friendId, nick, amount) {
    var item = HOTBAR[sel];
    if (!item || INV.indexOf(item) < 0) return toast('보낼 것을 손에 들어요(단축 칸에서 고르기)');
    if (have(item) < amount) return toast(nameOf(item) + '이(가) ' + amount + '개 없어요');
    if (SOCIAL.busy.send) return; SOCIAL.busy.send = 1;
    client.rpc('send_ark_gift', { p_to: friendId, p_item: item, p_amount: amount }).then(function (r) {
      SOCIAL.busy.send = 0;
      var d = r && r.data;
      if (!d || !d.ok) return toast(giftError(d && d.error));
      take(item, amount); bagChanged(); sfx('craft');
      toast('🎁 ' + nick + '님에게 ' + nameOf(item) + ' ' + amount + '개를 보냈어요(행 20:35)');
      feedPost('gift', 0);
    }, function () { SOCIAL.busy.send = 0; toast(giftError()); });
  }
  function claimGift(g) {
    client.rpc('claim_ark_gift', { p_id: g.id }).then(function (r) {
      var d = r && r.data;
      if (d && d.item) { give(d.item, d.amount); bagChanged(); sfx('pop'); toast('🎁 ' + g.nick + '님이 보낸 ' + nameOf(d.item) + ' ' + d.amount + '개를 받았어요'); }
      fetchGifts(true);
    }, function () { toast('선물을 받지 못했어요. 조금 뒤에 다시 해 주세요'); });
  }
  // 사진 저장(11/20): 지금 화면을 내 폰·컴퓨터에 저장 — 휴대폰은 공유 창(사진에 저장), 컴퓨터는 내려받기
  function savePhoto() {
    try {
      renderer.render(scene, camera);
      var src = canvasEl, W = Math.min(1920, src.width), H = Math.round(W * src.height / src.width), c = document.createElement('canvas');
      c.width = W; c.height = H; var g = c.getContext('2d'); g.drawImage(src, 0, 0, W, H);
      var fs = Math.max(12, Math.round(H / 40)); g.font = 'bold ' + fs + 'px sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom';
      var mark = '나그네 마을 · logoswell.kr'; g.lineWidth = Math.max(2, fs / 6); g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText(mark, W - fs * 0.6, H - fs * 0.5); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillText(mark, W - fs * 0.6, H - fs * 0.5);
      var url = c.toDataURL('image/jpeg', 0.9), bin = atob(url.split(',')[1]), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var name = '나그네마을_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '.jpg';
      var blob = new Blob([arr], { type: 'image/jpeg' }), file = null;
      try { file = new File([blob], name, { type: 'image/jpeg' }); } catch (e) {}
      newsMark('photo'); document.body.classList.add('snapflash'); setTimeout(function () { document.body.classList.remove('snapflash'); }, 260);
      sfx('click'); tone('square', 1800, 1200, 0.05, 0.05);
      function dl() {
        var a = document.createElement('a'), ou = URL.createObjectURL(blob); a.href = ou; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(ou); }, 4000);
        toast('📷 찰칵! 사진을 저장했어요 (' + name + ')');
      }
      var canS = false; try { canS = isTouch && file && navigator.canShare && navigator.canShare({ files: [file] }); } catch (e) {}
      if (canS) {   // 휴대폰: 공유 창에서 「이미지 저장」 — 사람이 닫은 것(AbortError)이 아니면 내려받기로
        navigator.share({ files: [file], title: '나그네 마을' }).then(function () { toast('📷 사진을 보냈어요'); }, function (er) { if (!er || er.name !== 'AbortError') dl(); });
        return;
      }
      dl();
    } catch (e) { toast('사진을 찍지 못했어요'); }
  }
  // 건축 사진: 게임 화면만 작게 찍는다(한 사람 3장, 제목은 고르기)
  var photoCap = 0;
  function takePhoto() {
    if (!socialOn()) return toast('로그인하면 사진을 올릴 수 있어요');
    resume();
    setTimeout(function () {
      try {
        renderer.render(scene, camera);
        var src = canvasEl, W = 480, H = Math.max(1, Math.round(480 * src.height / src.width)), c = document.createElement('canvas');
        c.width = W; c.height = H; c.getContext('2d').drawImage(src, 0, 0, W, H);
        var url = c.toDataURL('image/jpeg', 0.62); if (url.length > 118000) url = c.toDataURL('image/jpeg', 0.4);
        if (url.length > 118000) return toast('사진이 너무 커요. 다시 찍어 주세요');
        sfx('click'); toast('📷 찰칵! 올리는 중…');
        client.rpc('post_ark_photo', { p_img: url, p_caption: photoCap }).then(function (r) {
          var d = r && r.data;
          if (!d || !d.ok) return toast(d && d.error === 'wait' ? '사진은 2분에 한 장씩 올릴 수 있어요' : '사진을 올리지 못했어요');
          toast('📷 「' + PHOTO_CAPS[photoCap] + '」 사진을 올렸어요 — 📒 마을 수첩 「사진」에서 볼 수 있어요');
          SOCIAL.photoAt = 0; feedPost('photo', 0);
        }, function () { toast('사진을 올리지 못했어요'); });
      } catch (e) { toast('이 기기에서는 사진을 찍을 수 없어요'); }
    }, 450);
  }
  function fetchPhotos(force) {
    if (!socialOn() || SOCIAL.busy.photo || (!force && Date.now() < SOCIAL.photoAt)) return;
    SOCIAL.photoAt = Date.now() + 30000; SOCIAL.busy.photo = 1;
    client.rpc('get_ark_photos').then(function (r) {
      SOCIAL.busy.photo = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      SOCIAL.photos = r.data; socialRerender('photos');
    }, function () { SOCIAL.busy.photo = 0; });
  }
  function showPhoto(p, holder) {
    if (SOCIAL.imgs[p.id]) { holder.src = SOCIAL.imgs[p.id]; holder.hidden = false; return; }
    client.rpc('get_ark_photo_img', { p_id: p.id }).then(function (r) { if (r && typeof r.data === 'string') { SOCIAL.imgs[p.id] = r.data; holder.src = r.data; holder.hidden = false; } }, function () {});
  }
  // 설계도 나누기: 내 땅에 지은 모양을 저장하고, 친구 설계도를 내 땅에 반투명으로 띄운다
  var planName = 0;
  function capturePlan() {
    if (myPlot < 0) return toast('로그인하고 내 땅을 먼저 받아요');
    var o = plotOrigin(myPlot), raw = [], x0 = 99, z0 = 99, x1 = -1, z1 = -1, hMax = 0;
    for (var y = G - 1; y < G + PH && y < SY; y++) for (var z = 0; z < PLOT; z++) for (var x = 0; x < PLOT; x++) {
      var id = get(o.x + x, y, o.z + z);
      if (!id || id === WATER || kind(id) === 'plant' || id > 999) continue;
      if (y === G - 1 && (id === GRASS || id === DIRT || id === SAND)) continue;   // 원래 땅은 빼고 지은 것만
      raw.push([x, y - (G - 1), z, id]); x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); hMax = Math.max(hMax, y - (G - 1));
    }
    if (!raw.length) return toast('내 땅에 지은 것이 없어요. 먼저 지어 보세요');
    var str = raw.map(function (c) { return (c[0] - x0) + '.' + c[1] + '.' + (c[2] - z0) + '.' + c[3]; }).join(';');
    if (str.length > 40000) return toast('설계도로 담기에는 너무 커요(블록을 조금 줄여 주세요)');
    client.rpc('save_ark_plan', { p_name: planName, p_cells: str, p_w: x1 - x0 + 1, p_l: z1 - z0 + 1, p_h: Math.min(40, hMax + 1) }).then(function (r) {
      var d = r && r.data;
      if (!d || !d.ok) return toast('설계도를 저장하지 못했어요');
      toast('📐 「' + PLAN_NAMES[planName] + '」 설계도를 저장했어요 — 친구들이 따라 지을 수 있어요(블록 ' + raw.length + '개)');
      SOCIAL.planAt = 0; feedPost('plan', 0); socialRerender('build');
    }, function () { toast('설계도를 저장하지 못했어요'); });
  }
  function fetchPlans(force) {
    if (!socialOn() || SOCIAL.busy.plan || (!force && Date.now() < SOCIAL.planAt)) return;
    SOCIAL.planAt = Date.now() + 30000; SOCIAL.busy.plan = 1;
    client.rpc('get_ark_plans').then(function (r) {
      SOCIAL.busy.plan = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      SOCIAL.plans = r.data; socialRerender('build');
    }, function () { SOCIAL.busy.plan = 0; if (!SOCIAL.plans) SOCIAL.plans = []; });
  }
  function loadPlan(row) {
    if (myPlot < 0) return toast('로그인하고 내 땅을 먼저 받아요');
    client.rpc('get_ark_plan', { p_owner: row.owner }).then(function (r) {
      if (!r || typeof r.data !== 'string' || !r.data) return toast('설계도를 불러오지 못했어요');
      var cells = r.data.split(';').map(function (s) { return s.split('.').map(Number); }).filter(function (c) { return c.length === 4 && B[c[3]]; });
      var o = plotOrigin(myPlot);
      villageBook.plan = { kind: 'custom', plot: myPlot, name: PLAN_NAMES[row.name] || '설계도', nick: row.nick, cells: cells,
        x: Math.max(0, Math.min(PLOT - row.w, Math.floor(P.x) - o.x)), z: Math.max(0, Math.min(PLOT - row.l, Math.floor(P.z) - o.z)) };
      saveVillageBook(); resume(); toast('📐 ' + row.nick + '님의 「' + villageBook.plan.name + '」 설계도를 내 땅에 띄웠어요. 반투명 윤곽을 따라 지어요');
    }, function () { toast('설계도를 불러오지 못했어요'); });
  }
  function customPlanCells(plan) {
    if (!plan || plan.kind !== 'custom' || plan.plot !== myPlot || !plan.cells) return [];
    var o = plotOrigin(plan.plot);
    return plan.cells.map(function (c) { return [o.x + plan.x + c[0], G - 1 + c[1], o.z + plan.z + c[2], c[3]]; });
  }
  function selectRow(body, label, names, cur, onPick) {
    var wrap = document.createElement('p'), lab = document.createElement('span'), s = document.createElement('select');
    lab.textContent = label + ' ';
    names.forEach(function (n, i) { var op = document.createElement('option'); op.value = i; op.textContent = n; if (i === cur) op.selected = true; s.appendChild(op); });
    s.addEventListener('change', function () { onPick(+s.value); });
    wrap.appendChild(lab); wrap.appendChild(s); body.appendChild(wrap);
  }
  function renderSocialTab(tab, body) {
    if (tab !== 'feed' && tab !== 'gifts' && tab !== 'photos') return false;
    if (!socialOn()) { villageText(body, '로그인하면 마을 소식·선물·사진을 함께 나눌 수 있어요.'); return true; }
    if (tab === 'feed') {
      fetchFeed();
      villageText(body, '최근 사흘 동안 마을에서 있었던 일이에요.');
      var lines = SOCIAL.feed.map(function (f) { var t = feedLine(f); return t ? t + ' · ' + timeAgo(f.at) : null; }).filter(Boolean);
      if (!lines.length) villageText(body, '아직 소식이 없어요. 집을 짓거나 사진을 올리면 여기에 나와요.');
      lines.forEach(function (t) { villageText(body, t); });
      villageButton(body, '새로 고침', function () { fetchFeed(true); });
    } else if (tab === 'gifts') {
      fetchGifts();
      villageText(body, '받은 선물', 'h3');
      if (!SOCIAL.gifts.length) villageText(body, '받은 선물이 없어요.');
      SOCIAL.gifts.forEach(function (g) { villageButton(body, '🎁 ' + g.nick + '님 · ' + nameOf(g.item) + ' ' + g.amount + '개 받기', function () { claimGift(g); }); });
      villageText(body, '선물 보내기', 'h3');
      var held = HOTBAR[sel];
      villageText(body, '손에 든 것: ' + (held && INV.indexOf(held) >= 0 ? nameOf(held) + ' (' + have(held) + '개)' : '없음') + ' · 친구에게 1·4·8개를 보낼 수 있어요(하루 10번).');
      if (!FRIENDS.ready) { friendsFetch(); villageText(body, '친구 목록을 불러오는 중…'); }
      var fr = FRIENDS.rows.filter(function (v) { return v.status === 'accepted'; });
      if (FRIENDS.ready && !fr.length) villageText(body, '아직 친구가 없어요. 친구를 맺으면 선물을 보낼 수 있어요.');
      fr.forEach(function (f) {
        var p = villageText(body, f.nick + ' ');
        [1, 4, 8].forEach(function (n) { villageButton(p, n + '개', function () { sendGift(f.id, f.nick, n); }); });
      });
    } else if (tab === 'photos') {
      fetchPhotos();
      villageText(body, '지금 보고 있는 게임 화면을 찍어 마을에 전시해요(한 사람 3장까지).');
      selectRow(body, '사진 제목', PHOTO_CAPS, photoCap, function (i) { photoCap = i; });
      villageButton(body, '📷 지금 화면 찍어 올리기', takePhoto);
      villageText(body, '마을 사진첩', 'h3');
      if (!SOCIAL.photos.length) villageText(body, '아직 올라온 사진이 없어요.');
      SOCIAL.photos.forEach(function (p) {
        var row = villageText(body, p.nick + ' · ' + (PHOTO_CAPS[p.caption] || '사진') + ' · ' + timeAgo(p.at) + ' · ♥ ' + p.likes + ' ');
        var img = document.createElement('img'); img.hidden = true; img.alt = PHOTO_CAPS[p.caption] || '사진'; img.style.cssText = 'display:block;max-width:100%;margin:4px 0;image-rendering:auto';
        villageButton(row, '보기', function () { showPhoto(p, img); });
        if (!p.mine) villageButton(row, p.liked ? '♥ 취소' : '♥ 좋아요', function () { client.rpc('like_ark_photo', { p_id: p.id }).then(function () { fetchPhotos(true); }); });
        if (p.mine || NET.admin) villageButton(row, '지우기', function () { client.rpc('remove_ark_photo', { p_id: p.id }).then(function () { fetchPhotos(true); }); });
        row.appendChild(img);
      });
    }
    return true;
  }
  function renderPlanShare(body) {
    villageText(body, '설계도 나누기', 'h3');
    if (!socialOn()) { villageText(body, '로그인하면 내 설계도를 친구와 나눌 수 있어요.'); return; }
    villageText(body, '내 땅에 지은 모양을 설계도로 저장하면 친구들이 자기 땅에서 따라 지을 수 있어요(한 사람 하나).');
    selectRow(body, '설계도 이름', PLAN_NAMES, planName, function (i) { planName = i; });
    villageButton(body, '📐 내 땅 모양을 설계도로 저장', capturePlan);
    fetchPlans();
    if (SOCIAL.plans === null) { villageText(body, '설계도 목록을 불러오는 중…'); return; }
    if (!SOCIAL.plans.length) villageText(body, '아직 나눈 설계도가 없어요. 친구가 저장하면 여기에 나와요.');
    SOCIAL.plans.forEach(function (row) {
      villageButton(body, (row.mine ? '내 설계도' : row.nick + '님') + ' · ' + (PLAN_NAMES[row.name] || '설계도') + ' (' + row.w + '×' + row.l + ', 높이 ' + row.h + ')', function () { loadPlan(row); });
    });
  }
  function renderVillageExtras(tab,body) {
    if (renderSocialTab(tab, body)) return;
    if(tab==='discover') {
      villageText(body,'가까운 옛터를 찾으면 살펴보고 발견물을 내 땅에 전시할 수 있어요.');
      VILLAGE_SITES.forEach(function (s) { villageText(body, (villageBook.found&&villageBook.found[s.item]?'✓ ':'')+s.name+' · '+s.clue); });
      villageText(body,'낚시 도감','h3');
      ['강','호수','바다'].forEach(function (r) { villageText(body,nameOf(VILLAGE_FISH[r])+' · '+(villageBook.fish&&villageBook.fish[r]||0)+'마리'); });
      villageText(body,'자연 도감','h3');
      [[THORN,'남쪽 들판이나 동쪽 숲 끝'],[THISTLE,'서쪽 언덕이나 열린 들판'],[LILY,'강이나 호수 가까이']].forEach(function (item) {
        villageText(body,nameOf(item[0])+' · '+(villageBook.plants&&villageBook.plants[item[0]]||item[1]));
      });
      return;
    }
    if(tab==='frontier') return renderFrontier(body);
    renderVillageCommunity(tab,body);
  }
  var VILLAGE_PROJECTS={
    bridge:['돌다리',996,790,1008,797],
    well:['공동 우물',1030,765,1036,772],
    shelter:['여행자 쉼터',1031,790,1041,800],
    pen:['목자의 양 우리',1030,775,1039,785],
    meal:['함께 차리는 식탁',1042,790,1053,800],
    railway:['함께 놓는 철길',993,756,1054,815]
  };
  var VILLAGE_ROLES=['재료 모으기','재료 다듬기','블록 놓기'];
  var villageProjectsEnabled=false, villageProjectState={}, villageProjectFetch=false, villageProjectAt=0;
  function projectCells(key) {
    var out=[];
    function put(x,y,z,id){out.push([x,y,z,id]);}
    if(key==='bridge'){
      for(var x=998;x<=1006;x++)for(var z=793;z<=795;z++)put(x,G,z,SBRICK);
      for(x=998;x<=1006;x++){put(x,G+1,793,RAIL);put(x,G+1,795,RAIL);}
    }else if(key==='well'){
      put(1033,G,768,WELL);
      for(var dx=-1;dx<=1;dx++)for(var dz=-1;dz<=1;dz++)if(dx||dz)put(1033+dx,G,768+dz,SBRICK);
    }else if(key==='shelter'){
      for(x=1033;x<=1039;x++)for(z=792;z<=798;z++)put(x,G+4,z,FLAT_ROOF);
      [1033,1039].forEach(function(a){[792,798].forEach(function(b){for(var y=G;y<G+4;y++)put(a,y,b,PILLAR);});});
    }else if(key==='pen'){
      for(x=1032;x<=1037;x++)for(z=777;z<=782;z++)if(x===1032||x===1037||z===777||z===782)
        put(x,G,z,x===1034&&z===782?GATE:FENCE);
    }else if(key==='railway'){   // 함께 짓는 터 둘레 한 바퀴(240칸) — 보통·빠른 레일 어떤 모양이든
      for(x=993;x<=1054;x++){put(x,G,756,RAIL0);put(x,G,815,RAIL0);}
      for(z=757;z<=814;z++){put(993,G,z,RAIL0);put(1054,G,z,RAIL0);}
    }else if(key==='meal'){
      [FEAST_BREAD,FEAST_OLIVE,FEAST_FISH].forEach(function(id,i){put(1045+i*2,G,795,FEAST_TABLE);put(1045+i*2,G+1,795,id);});
    }
    return out;
  }
  function buildBridgeGround(x0,z0) {
    if(x0+CS<=1001||x0>1003||z0+CS<=790||z0>797)return;
    fill(1001,G-2,790,1003,G-2,797,STONE);
    fill(1001,G-1,790,1003,G-1,797,WATER);
    fill(1001,G,790,1003,G,797,AIR);
  }
  function inProject(p,x,z) { return !!p&&x>=p[1]&&x<=p[3]&&z>=p[2]&&z<=p[4]; }
  function villageProjectLocked(x,z) {
    return Object.keys(villageProjectState).some(function(key){
      return villageProjectState[key].locked&&inProject(VILLAGE_PROJECTS[key],x,z);
    });
  }
  function syncVillageProject(key) {
    var p=VILLAGE_PROJECTS[key];
    if(!p||!client)return;
    client.rpc('ark_village_project_blocks',{p_key:key}).then(function(r){
      if(r.error||!Array.isArray(r.data))return;
      var data=new Map();
      r.data.forEach(function(row){data.set(row.x+','+row.y+','+row.z,row);});
      for(var z=p[2];z<=p[4];z++)for(var x=p[1];x<=p[3];x++)for(var y=1;y<SY;y++){
        var place=x+','+y+','+z;
        if(Object.hasOwn(NET.pm,place))continue;
        var index=(z>>5)*NC+(x>>5), block=(y*CS+(z&31))*CS+(x&31), current=EDITS[index];
        if(!data.has(place)&&current&&Object.hasOwn(current,block))queueRevert(x,y,z);
      }
      data.forEach(function(row,place){
        if(!Object.hasOwn(NET.pm,place))queueRemote('project-'+key,[row.x,row.y,row.z,row.id]);
      });
    },function(){});
  }
  function fetchVillageProjects() {
    if(!client||villageProjectFetch)return Promise.resolve();
    villageProjectFetch=true;
    return client.rpc('ark_village_project_status',{}, {get:true}).then(function(r){
      if(!Array.isArray(r.data)||r.error)return;
      villageProjectsEnabled=true; villageProjectState={};
      r.data.forEach(function(row){villageProjectState[row.key]=row;});
      if(ui==='villageWork'&&(villageTab==='projects'||villageTab==='neighbors'))renderVillageWork();
    }).catch(function(){}).finally(function(){villageProjectFetch=false;});
  }
  function focusProject(key) {
    var p=VILLAGE_PROJECTS[key];
    villageBook.project=key; saveVillageBook(); saveProjectRole();
    teleport((p[1]+p[3])/2+.5,surfaceY((p[1]+p[3])>>1,p[4]+2),p[4]+2,0);
    resume(); toast(p[0]+' 설계도를 보여 줘요');
  }
  function saveProjectRole() {
    var k=villageBook.project, i=VILLAGE_ROLES.indexOf(villageBook.role);
    if(!client||!me||!VILLAGE_PROJECTS[k]||i<0)return;
    client.rpc('set_ark_village_role',{p_key:k,p_role:i}).then(function(r){
      if(r.data===true)fetchVillageProjects();
    },function(){});
  }
  function projectAdmin(key,action) {
    if(!NET.admin||!client)return;
    if(action==='restore'&&!window.confirm(VILLAGE_PROJECTS[key][0]+'만 마지막 저장 상태로 되돌릴까요?'))return;
    client.rpc('ark_village_project_admin',{p_key:key,p_action:action}).then(function(r){
      toast(!r.error&&r.data===true?'공사장 상태를 바꿨어요':'공사장 상태를 바꾸지 못했어요');
      if(!r.error&&r.data===true&&action==='restore')syncVillageProject(key);
      fetchVillageProjects();
    }, function(){toast('공사장 상태를 바꾸지 못했어요');});
  }
  function renderOneProject(body,key) {
    var d=VILLAGE_PROJECTS[key], state=villageProjectState[key], cells=projectCells(key);
    var line=document.createElement('div'); line.className='vrow'; body.appendChild(line);
    var available=!!state, count=available?state.done:0, done=available&&count>=cells.length;
    villageText(line,d[0]+(available?' '+count+'/'+cells.length:' · 연결 중')+(done?' · 완성':'')+(state&&state.locked?' · 보호 중':''),'span');
    if(!available)return;
    if(Array.isArray(state.roles))villageText(line,VILLAGE_ROLES.map(function(role,i){return role+' '+state.roles[i]+'명';}).join(' · '),'small');
    villageButton(line,'공사장으로',function(){focusProject(key);});
    if(NET.admin){
      if((done||state.locked)&&key!=='railway')villageButton(line,state.locked?'잠금 풀기':'완성한 곳 보호',function(){projectAdmin(key,state.locked?'unlock':'lock');});
      if(state.snapshot)villageButton(line,'이곳만 되돌리기',function(){projectAdmin(key,'restore');});
    }
  }
  function renderDonkeyCargo(body) {
    var a=riding&&riding.kind==='donkey'?riding:animals.find(function(animal){return animal.kind==='donkey'&&animal.saddled&&Math.hypot(animal.x-P.x,animal.z-P.z)<=6;});
    if(!a)return villageText(body,'안장을 얹은 나귀 가까이에서 짐을 실어요.');
    a.cargo=readCargo(a.cargo);
    a.cargo.forEach(function(slot,i){
      var line=document.createElement('div'); line.className='vrow'; body.appendChild(line);
      villageText(line,(i+1)+'번 짐 · '+(slot?nameOf(slot[0])+' '+slot[1]+'개':'빈 자리'),'span');
      if(slot){
        villageButton(line,'꺼내기',function(){
          var n=give(slot[0],slot[1]); if(!n)return bagFull();
          slot[1]-=n; if(!slot[1])a.cargo[i]=null;
          saveHorses(); stateDirty(); bagChanged(); renderVillageWork();
        });
      }else{
        var select=document.createElement('select'); select.setAttribute('aria-label',(i+1)+'번 짐에 실을 물건');
        INV.filter(function(id){return !isTool(id)&&have(id)>0;}).forEach(function(id){
          var o=document.createElement('option');o.value=id;o.textContent=nameOf(id)+' '+have(id)+'개';select.appendChild(o);
        });
        line.appendChild(select);
        villageButton(line,'실어 두기',function(){
          var id=Number(select.value),n=Math.min(STACK,have(id));
          if(!id||!n||isAdm())return;
          take(id,n); a.cargo[i]=[id,n]; saveHorses(); stateDirty(); bagChanged(); renderVillageWork();
        });
      }
    });
  }
  var HOUSE_THEMES=['주제 없음','목장','쉼터','정원','빵집'];
  function renderShowcaseSetup(body) {
    if(myPlot<0||!client)return villageText(body,'로그인하고 내 땅을 받은 뒤 꾸밀 수 있어요.');
    // 땅 팻말 글: 16자까지, 채팅처럼 쓸 수 없는 말은 막힘, 비우면 「OO님의 땅」으로
    villageText(body,'🪧 내 땅 팻말 — 16자까지, 모두에게 보여요 (비우면 「이름님의 땅」)');
    var nrow=document.createElement('div');nrow.className='vrow';body.appendChild(nrow);
    var inp=document.createElement('input');inp.type='text';inp.maxLength=16;inp.placeholder='예: 하늘 목장, 기도하는 집';inp.value=(me&&PLOT_NAMES[me.id])||'';inp.setAttribute('aria-label','팻말에 쓸 말');inp.style.cssText='flex:1;min-width:0;font:inherit;padding:6px';
    nrow.appendChild(inp);
    villageButton(nrow,'팻말 저장',function(){
      client.rpc('set_ark_plot_name',{p_body:inp.value}).then(function(r){
        var d=r&&r.data||{}, why={bad:'쓸 수 없는 말이 들어 있어요',long:'16자까지 쓸 수 있어요',muted:'지금은 글을 쓸 수 없어요',slow:'조금 뒤에 다시 저장해 주세요',login:'로그인하면 쓸 수 있어요'}[d.error];
        if(why)return toast('🪧 '+why);
        if(d.cleared)delete PLOT_NAMES[me.id]; else PLOT_NAMES[me.id]=inp.value.trim().replace(/\s{2,}/g,' ');
        newsMark('plotname'); refreshPlotSigns(); toast(d.cleared?'🪧 팻말을 「이름님의 땅」으로 돌렸어요':'🪧 팻말을 바꿨어요 — 땅 앞 모서리에서 보여요');
      },function(){toast('🪧 팻말을 저장하지 못했어요');});
    });
    villageText(body,'친구 집 구경에서 보여 줄 집의 주제와 두 군데의 볼거리를 정해요.');
    var profile=villageBook.house || (villageBook.house={theme:0,marks:[]});
    var row=document.createElement('div');row.className='vme';body.appendChild(row);
    HOUSE_THEMES.forEach(function(t,i){
      var b=villageButton(row,t,function(){profile.theme=i;profile.edited=true;saveVillageBook();renderVillageWork();});
      b.setAttribute('aria-pressed',String(profile.theme===i));
    });
    if (profile.loading!==true&&!profile.ready) {
      profile.loading=true;
      client.rpc('get_ark_showcase_details').then(function(r){
        var own=Array.isArray(r.data)&&r.data.find(function(d){return d.plot_idx===myPlot;});
        if(own&&!profile.edited){profile.theme=own.theme;profile.marks=own.marks;}
        profile.ready=true;delete profile.loading;
        if(ui==='villageWork'&&villageTab==='showcase')renderVillageWork();
      },function(){profile.ready=true;delete profile.loading;});
    }
    profile.marks.forEach(function (mark,i) {
      var line=document.createElement('div');line.className='vrow';body.appendChild(line);
      villageText(line,'볼거리 '+(i+1)+' · 내 땅 '+(mark[0]+1)+', '+(mark[1]+1),'span');
      villageButton(line,'빼기',function (){profile.edited=true;profile.marks.splice(i,1);saveVillageBook();renderVillageWork();});
    });
    villageButton(body,'지금 선 자리를 볼거리로',function(){
      var x=Math.floor(P.x),z=Math.floor(P.z);
      if(plotAt(x,z)!==myPlot)return toast('내 땅 안에서 다시 눌러요');
      if(profile.marks.length>=2)return toast('볼거리는 두 군데까지 둘 수 있어요');
      var o=plotOrigin(myPlot);
      if(profile.marks.some(function(m){return m[0]===x-o.x&&m[1]===z-o.z;}))return toast('이미 표시한 곳이에요');
      profile.edited=true;profile.marks.push([x-o.x,z-o.z]);saveVillageBook();renderVillageWork();
    });
    villageButton(body,'집 구경 정보 저장',function(){
      client.rpc('set_ark_showcase_details',{p_theme:profile.theme,p_marks:profile.marks}).then(function(r){
        toast(r.data===true?'집 구경 정보를 저장했어요':'집 구경 정보를 저장하지 못했어요');
      },function(){toast('집 구경 정보를 저장하지 못했어요');});
    });
    villageButton(body,'공개 설정과 친구 집',openVisit);
    // 근처 팻말 신고: 서로 다른 3명이 신고하면 가려져요(주인이 새로 쓰면 다시 셈)
    var near=Object.keys(plotSignObjs).map(Number).filter(function(i){var u=plotUser[i];return u&&i!==myPlot&&PLOT_NAMES[u];});
    if(near.length){
      villageText(body,'🚩 근처 팻말 — 보기 싫은 말이 있으면 신고해요(3명이 신고하면 가려져요)','h3');
      near.forEach(function(i){var u=plotUser[i],line=document.createElement('div');line.className='vrow';body.appendChild(line);
        villageText(line,PLOT_NAMES[u]+' · '+(NET.names[u]||(i+1)+'번 땅'),'span');
        villageButton(line,'신고',function(){
          if(!window.confirm('「'+PLOT_NAMES[u]+'」 팻말을 신고할까요?'))return;
          client.rpc('report_ark_plot_name',{p_target:u}).then(function(r){var d=r&&r.data||{};toast(d.ok?'🚩 신고했어요 — 3명이 신고하면 가려져요':(d.error==='login'?'로그인하면 신고할 수 있어요':'신고하지 못했어요'));},function(){toast('신고하지 못했어요');});
        });});
    }
    if(NET.admin){   // 관리자: 팻말 글 지우기
      Object.keys(PLOT_HIDDEN).forEach(function(u){var line=document.createElement('div');line.className='vrow';body.appendChild(line);
        villageText(line,'(신고로 가려짐) '+(NET.names[u]||'?')+' · '+PLOT_HIDDEN[u],'span');
        villageButton(line,'지우기',function(){client.rpc('admin_clear_ark_plot_name',{p_user:u}).then(function(r){if(r&&r.data===true){delete PLOT_HIDDEN[u];renderVillageWork();toast('팻말 글을 지웠어요');}});});});
      var ids=Object.keys(PLOT_NAMES); if(ids.length)villageText(body,'관리자 · 학생 팻말 글','h3');
      ids.forEach(function(u){var line=document.createElement('div');line.className='vrow';body.appendChild(line);
        villageText(line,(NET.names[u]||'?')+' · '+PLOT_NAMES[u],'span');
        villageButton(line,'지우기',function(){client.rpc('admin_clear_ark_plot_name',{p_user:u}).then(function(r){if(r&&r.data===true){delete PLOT_NAMES[u];refreshPlotSigns();renderVillageWork();toast('팻말 글을 지웠어요');}});});});
    }
  }
  function renderVillageCommunity(tab,body) {
    if(tab==='cargo')return renderDonkeyCargo(body);
    if(tab==='showcase')return renderShowcaseSetup(body);
    if(tab==='projects'){
      villageText(body,'함께 짓는 터의 공사장에서는 설계도에 맞게 놓은 블록을 모두의 진행에 더해요.');
      var row=document.createElement('div'); row.className='vme'; body.appendChild(row);
      VILLAGE_ROLES.forEach(function(role){
        var btn=villageButton(row,role,function(){villageBook.role=role; saveVillageBook(); saveProjectRole(); renderVillageWork();});
        btn.setAttribute('aria-pressed',String(villageBook.role===role));
      });
      if(villageBook.role)villageText(body,'내가 맡은 일 · '+villageBook.role);
      ['bridge','well','shelter'].forEach(function(key){renderOneProject(body,key);});
      villageText(body,'🛤 함께 짓는 터 둘레에 레일을 이어 깔아 한 바퀴 도는 철길을 만들어요. 다 이으면 수레를 타고 함께 돌아요(금빛 빠른 레일도 돼요).');
      renderOneProject(body,'railway');
      if(villageProjectState.railway&&villageProjectState.railway.done>=240)villageText(body,'철길이 한 바퀴 다 이어졌어요! 수레를 타고 돌아 보세요.');
    }else{
      villageText(body,'목자가 부탁했어요. 양들이 안전하게 쉴 수 있도록 울타리와 문을 고쳐 주세요.');
      renderOneProject(body,'pen');
      villageText(body,'여행자에게 대접할 빵과 올리브, 구운 생선을 식탁에 차려 주세요.');
      renderOneProject(body,'meal');
      if(villageProjectState.meal&&villageProjectState.meal.done>=6)villageText(body,'따뜻한 식탁이 준비됐어요. 함께 먹을 자리가 생겼어요.');
    }
  }

  function loadOnline() {
    try {
      if (window.supabase && window.SUPABASE_URL) client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } catch (e) { client = null; }
    if (!client) return Promise.resolve();
    return client.auth.getSession().then(function (r) {
      me = r && r.data && r.data.session ? r.data.session.user : null;
      villageBook=loadVillageBook(me ? me.id : 'guest');
      $('who').textContent = me ? '' : '구경 중 · 로그인하면 저장돼요';
      var claim = me ? client.rpc('claim_village_plot').then(function (c) { if (!c.error && c.data !== null) myPlot = c.data; }) : Promise.resolve();
      return claim.then(function () { return client.from('ark_village_plots').select('plot_idx,data,user_id,updated_at'); });
    }).then(function (res) {
      var hasExpandedRows=(res&&res.data||[]).some(function(row){
        return typeof row.data==='string'&&row.data.startsWith('r3:');
      });
      function usePlotLayout(layout) {
        if (hasExpandedRows || (layout && layout.data===WIDE_PLOT)) enableWidePlots();
        return res;
      }
      return client.rpc('ark_plot_width', {}, { get: true }).then(usePlotLayout,function(){return usePlotLayout(null);});
    }).then(function (res) {
      (res && res.data || []).forEach(function (row) {
        plotOwners[row.plot_idx] = 1; plotUser[row.plot_idx] = row.user_id;
        if (me && row.user_id === me.id) plotSrvAt = row.updated_at;
        plotSeen[row.plot_idx] = row.updated_at;
        if (row.data) decodePlot(row.plot_idx, row.data, me && row.user_id === me.id);
      });
      return Promise.all([loadShared(),fetchVillageProjects(),fetchFrontier()]);
    }).then(function () {
      setSave(myPlot >= 0 ? '내 땅 ' + (myPlot + 1) + '번' : '');
      if (me && myPlot >= 0) setTimeout(tryClaimDex, 3000);
    }).catch(function () { toast('인터넷이 약해서 다른 사람 집을 못 불러왔어요'); });
  }
  window.addEventListener('beforeunload', function () { if (dirty) savePlot(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { saveEdits(); if (dirty) savePlot(); } });


  // 개척지 지형은 기존 자연·플레이어 편집을 덮지 않도록 생성 단계에서만 넣는다.
  var FRONTIER_ENTRY=[1238,1154], FRONTIER_CAVE=[[1242,1176,10],[1296,1198,10]];
  var FRONTIER_BOUNDS=[1216,1144,1311,1239];
  var forestDestination=FOREST_ENTRY, forestName='동쪽 숲';
  var FRONTIER_DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
  function buildFrontierCave(x0,z0,tops) {
    if(x0>1304||x0+CS<=1236||z0>1206||z0+CS<=1174)return;
    fill(1242,10,1174,1296,15,1178,AIR);
    fill(1294,10,1176,1298,15,1198,AIR);
    fill(1257,9,1176,1277,17,1191,AIR);
    fill(1279,7,1183,1296,13,1187,AIR);
    fill(1273,9,1180,1283,14,1187,AIR);
    fill(1261,9,1189,1277,9,1191,WATER);
    fill(1281,7,1184,1292,7,1185,WATER);
    fill(1246,10,1173,1251,12,1173,ORE_CU);
    fill(1267,9,1192,1272,11,1192,ORE_FE);
    fill(1284,6,1184,1290,6,1184,ORE_AG);
    fill(1296,7,1185,1297,8,1185,ORE_AU);
    FRONTIER_CAVE.forEach(function(entry){
      var x=entry[0],z=entry[1];
      if(x<x0||x>=x0+CS||z<z0||z>=z0+CS)return;
      var top=tops[(z-z0)*CS+x-x0];
      fill(x,entry[2],z,x,top+1,z,LADDER+3);
      setRaw(x,top+2,z,AIR);
    });
  }
  function startFrontierGuide(pos,label) {
    forestRoute=[];
    if(P.x<VX1 && P.z>=PZ0-12 && P.z<=VZ1) {
      startForestRoute();
      if(!forestRoute) forestRoute=[];
    }
    forestRoute.push(pos);
    forestDestination=pos; forestName=label;
    resume(); renderForestRoute();
  }
  function drawFrontierMap(ctx,big,ox,oz,scale) {
    function outline(box,color) { ctx.strokeStyle=color; ctx.strokeRect((box[0]-ox)*scale,(box[1]-oz)*scale,(box[2]-box[0]+1)*scale,(box[3]-box[1]+1)*scale); }
    ctx.save(); ctx.lineWidth=big?2:1;
    outline(FRONTIER_BOUNDS,'#a7d466');
    for(var i=0;i<9;i++)outline(frontierBounds(i),frontierPlots[i]?.canEdit?'#84ebc7':'#e6ac60');
    ctx.fillStyle='#ffee87';
    FRONTIER_CAVE.forEach(function(point){ctx.fillRect((point[0]-ox)*scale-2,(point[1]-oz)*scale-2,5,5);});
    ctx.restore();
  }

  var buildTurn=0, buildUndo=null, blockGhost=null, blockGhostId=-1, blockGhostAt=0;
  function rotatableBuild(item) {
    var shape=SHAPE[item];
    return shape && ['stair','chair','gate','door','arch','sluice','sign','ladder'].indexOf(shape.type)>=0;
  }
  function orientedBuild(item,dir,id) {
    if(item===SLUICE) return SLUICE+dir*2;
    if(item===ARCH) return dir%2 ? ARCH_SIDE : ARCH;
    return id;
  }
  function rotateBuild() {
    if(ui!=='play'||!rotatableBuild(HOTBAR[sel]))return;
    buildTurn=(buildTurn+1)%4; blockGhostAt=0;
    $('buildRotate').textContent='돌리기 '+buildTurn*90+'°';
    if(!isTouch)toast('놓을 방향 '+buildTurn*90+'°');
  }
  function rememberBuild(item,cells) {
    buildUndo=null;
    if(!isGrav(item)&&item!==SAPLING&&myPlot>=0&&cells.every(function(c){return plotAt(c[0],c[2])===myPlot && (c[3]===AIR || kind(c[3])==='plant');})) {
      buildUndo={item:item,cells:cells};
    }
  }
  function undoBuild() {
    if(ui!=='play'||!buildUndo)return;
    var u=buildUndo; buildUndo=null;
    if(u.cells.some(function(c){return readBlock(c[0],c[1],c[2])!==c[4]||canPlace(c[0],c[1],c[2],u.item);}))return toast('그 자리가 바뀌었어요');
    if(!isAdm()&&give(u.item,1)!==1)return toast('가방을 한 칸 비워 주세요');
    u.cells.forEach(function(c){setBlock(c[0],c[1],c[2],c[3]);});
    bagChanged(); toast('방금 놓은 블록을 되돌렸어요');
  }
  function updateFrontierTools(now) {
    if(!blockGhost) {
      blockGhost=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x9be2b3,transparent:true,opacity:.32,depthWrite:false}));
      blockGhost.visible=false; scene.add(blockGhost);
    }
    if(now<blockGhostAt)return;
    blockGhostAt=now+80;
    var item=HOTBAR[sel], rotation=!!rotatableBuild(item), show=ui==='play'&&!furnitureRest&&!frontierLift;
    $('buildRotate').hidden=!rotation; $('buildUndo').hidden=!buildUndo;
    $('buildTools').hidden=!show||!rotation&&!buildUndo;
    blockGhost.visible=false;
    if(!show||!isTouch||!item||isItem(item)||!have(item)||SLAB_TOP[item])return;
    var hit=hold&&S.aim==='finger'?pickTouch(hold.x,hold.y):pickCenter();
    if(!hit||blockActionLabel(hit,item))return;
    var id=item, dir=(lookDir()+buildTurn)%4, sh=SHAPE[item];
    if(sh&&sh.type==='stair')id=sh.base+dir;
    if(item===CHAIR)id=CHAIR+(dir+2)%4;
    if(item===GATE)id=GATE_STATES[dir%2][0];
    if(item===DOOR)id=DOOR+((dir+2)%4)*2;
    if(item===LADDER||item===SIGN)id=item+dir;
    id=orientedBuild(item,dir,id);
    if(blockGhostId!==id) { blockGhost.geometry.dispose(); blockGhost.geometry=blockGeometry(id); blockGhostId=id; }
    var ok=!canPlace(hit.px,hit.py,hit.pz,item)&&!isSolid(readBlock(hit.px,hit.py,hit.pz));
    if(item===DOOR) for(var i=1;i<4;i++) if(isSolid(readBlock(hit.px,hit.py+i,hit.pz))||canPlace(hit.px,hit.py+i,hit.pz,item))ok=false;
    blockGhost.material.color.setHex(ok?0x9be2b3:0xff806d);
    blockGhost.position.set(hit.px+.5,hit.py+.5,hit.pz+.5); blockGhost.visible=true;
  }

  var frontierLift=null, frontierWater=new Set(), frontierWheels=new Map(), frontierRotors=new Map(), frontierStepAt=0, lastPlate='';
  function frontierCell(x,y,z) { return ((y*WS+z)*WS+x); }
  function isFrontierMachine(id) { return id===WATERWHEEL || id>=SLUICE && id<SLUICE+8; }
  function updateFrontierMachine(col,x,y,z,id) {
    if(!col || !col.machines)return;
    var k=(y*CS+(z&31))*CS+(x&31);
    if(isFrontierMachine(id))col.machines.add(k); else col.machines.delete(k);
  }
  function frontierActionLabel(id) {
    if(id>=SLUICE&&id<SLUICE+8)return SHAPE[id].open?'수문 닫기':'수문 열기';
    if(id===LIFT)return '승강대 타기';
    if(id===WATERWHEEL)return '물레방아 보기';
    return '';
  }
  function tryFrontierDevice(id,h) {
    if(id===LIFT) {beginFrontierLift(h.x,h.y,h.z);return true;}
    if(id===WATERWHEEL) {toast(frontierWheels.get(frontierCell(h.x,h.y,h.z))?.wet?'물레방아가 돌고 있어요':'물길을 물레방아 옆까지 이어 주세요');return true;}
    if(id>=SLUICE&&id<SLUICE+8) {setFrontierDevice(h.x,h.y,h.z,id,!SHAPE[id].open);return true;}
    if(id===CHEST&&frontierEnabled&&frontierSlotAt(h.x,h.z)>=0) {openFrontierStock(h);return true;}
    return false;
  }
  function setFrontierDevice(x,y,z,id,on) {
    var s=SHAPE[id];
    if(!s||!['gate','door','sluice','trapdoor'].includes(s.type)||canPlace(x,y,z,id)||s.open===on)return false;
    if(!on && P.x+HW>x&&P.x-HW<x+1&&P.z+HW>z&&P.z-HW<z+1&&P.y+HT>y&&P.y<y+1)return false;
    if(s.type==='gate'||s.type==='sluice'||s.type==='trapdoor')setBlock(x,y,z,id^1);
    else {
      var c=doorColumn(x,y,z);
      for(var yy=c[0];yy<=c[1];yy++)if(canPlace(x,yy,z,id))return false;
      for(yy=c[0];yy<=c[1];yy++)setBlock(x,yy,z,get(x,yy,z)^1);
    }
    return true;
  }
  function mechanismNeighbor(id) {
    var s=SHAPE[id];
    return id===ROPE||id===PULLEY||id===COUNTERWEIGHT||id===PRESS_PLATE||
      !!s&&['lever','sluice','gate','door','trapdoor'].includes(s.type);
  }
  function pulseMechanical(x,y,z,on) {
    var queue=[[x,y,z]], visited=new Set(), connections=[], hasRope=false, hasPulley=false;
    for(var i=0;i<queue.length&&i<100;i++) {
      var a=queue[i];
      [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].forEach(function(d){
        var bx=a[0]+d[0],by=a[1]+d[1],bz=a[2]+d[2],k=frontierCell(bx,by,bz);
        if(visited.has(k)||by<1||by>=SY||!colAt(bx,bz)||queue.length>=100)return;
        visited.add(k);
        var id=get(bx,by,bz), s=SHAPE[id];
        if(id===ROPE||id===PULLEY||id===COUNTERWEIGHT){hasRope=hasRope||id===ROPE;hasPulley=hasPulley||id===PULLEY;queue.push([bx,by,bz]);}
        else if(s&&['gate','door','sluice','trapdoor'].includes(s.type))connections.push([bx,by,bz,id]);
      });
    }
    if(!hasRope||!hasPulley)return false;
    connections.forEach(function(a){setFrontierDevice(a[0],a[1],a[2],get(a[0],a[1],a[2]),on===null?!SHAPE[a[3]].open:on);});
    return true;
  }
  function liftStop(x,y,z) {
    for(var offset of FRONTIER_DIRS) for(var dir of [1,-1]) {
      var gx=x+offset[0],gz=z+offset[1],first=get(gx,y,gz);
      var pulley=first===PULLEY,weight=first===COUNTERWEIGHT,rope=first===ROPE;
      for(var dy=1;dy<=12;dy++) {
        var yy=y+dy*dir,gear=get(gx,yy,gz);
        pulley=pulley||gear===PULLEY; weight=weight||gear===COUNTERWEIGHT; rope=rope||gear===ROPE;
        if(get(x,yy,z)===LIFT) {
          if(pulley&&weight&&rope)return yy;
          break;
        }
        if(gear!==ROPE&&gear!==PULLEY&&gear!==COUNTERWEIGHT)break;
      }
    }
    return null;
  }
  function beginFrontierLift(x,y,z) {
    if(frontierLift||riding||ferryRide||P.fly||furnitureRest)return;
    var to=liftStop(x,y,z);
    if(to===null)return toast('승강대 두 개 옆으로 밧줄을 잇고, 도르래와 돌 추를 하나씩 달아요');
    for(var yy=Math.min(y,to);yy<=Math.max(y,to)+Math.ceil(HT);yy++) {
      if(yy!==y&&yy!==to&&isSolid(readBlock(x,yy,z)))return toast('승강대 사이를 비워 주세요');
    }
    resetInput();
    frontierLift={x:x+.5,z:z+.5,from:y+.18,to:to+.18,t:0,mesh:new THREE.Mesh(new THREE.BoxGeometry(.95,.10,.95),new THREE.MeshLambertMaterial({color:0x976145}))};
    scene.add(frontierLift.mesh);
  }
  function clearFrontierLift() {
    if(!frontierLift)return;
    var obj=frontierLift.mesh; scene.remove(obj);obj.geometry.dispose();obj.material.dispose();frontierLift=null;
  }
  function moveFrontierLift(dt) {
    var l=frontierLift;
    l.t=Math.min(1,l.t+dt/(.6+Math.abs(l.to-l.from)*.15));
    P.x=l.x;P.z=l.z;P.y=l.from+(l.to-l.from)*l.t;P.vx=P.vy=P.vz=0;fallTop=null;
    l.mesh.position.set(P.x,P.y-.07,P.z);
    if(l.t===1){clearFrontierLift();toast('승강대에 도착했어요');}
  }
  function collectWater(x,y,z,dir,out) {
    var f=FRONTIER_DIRS[dir];
    if(readBlock(x-f[0],y,z-f[1])!==WATER)return;
    var q=[[x+f[0],y,z+f[1],0]], seen=new Set();
    for(var i=0;i<q.length&&out.size<480;i++) {
      var a=q[i],xx=a[0],yy=a[1],zz=a[2],d=a[3],k=frontierCell(xx,yy,zz),raw=readBlock(xx,yy,zz);
      if(seen.has(k)||!colAt(xx,zz)||yy<1||d>10||raw!==AIR&&raw!==DITCH||Math.abs(xx-x)+Math.abs(zz-z)>9)continue;
      if(inTown(xx,zz)&&plotAt(xx,zz)<0||protectedExcursion(xx,zz)||villageProjectLocked(xx,zz)||
          plotAt(xx,zz)!==plotAt(x,z)||frontierSlotAt(xx,zz)!==frontierSlotAt(x,z))continue;
      seen.add(k);
      if(raw===AIR)out.add(k);
      if(readBlock(xx,yy-1,zz)===AIR)q.push([xx,yy-1,zz,d+1]);
      else FRONTIER_DIRS.forEach(function(t){q.push([xx+t[0],yy,zz+t[1],d+1]);});
    }
  }
  function rebuildWaterChunks(before,after) {
    var chunks=new Set();
    function save(k) {
      var x=k%WS,z=(k/WS|0)%WS;
      for(var dx of [-1,0,1])for(var dz of [-1,0,1])if(x+dx>=0&&z+dz>=0&&x+dx<WS&&z+dz<WS)chunks.add(((z+dz)>>5)*NC+((x+dx)>>5));
    }
    before.forEach(function(k){if(!after.has(k))save(k);});
    after.forEach(function(k){if(!before.has(k))save(k);});
    chunks.forEach(function(k){if(meshedCols[k]){var x=k%NC,z=k/NC|0;unmeshColumn(x,z);meshColumn(x,z);}});
  }
  function syncFrontierWater() {
    var old=frontierWater, next=new Set(), wheels=new Map(), cx=P.x>>5,cz=P.z>>5;
    for(var dz=-1;dz<=1;dz++)for(var dx=-1;dx<=1;dx++) {
      var xx=cx+dx,zz=cz+dz,c=colAt(xx*CS,zz*CS);
      if(!c||!c.machines)continue;
      c.machines.forEach(function(k){
        var x=xx*CS+k%CS,z=zz*CS+(k/CS|0)%CS,y=k/(CS*CS)|0,id=c.d[k];
        if(id===WATERWHEEL)wheels.set(frontierCell(x,y,z),{x:x,y:y,z:z,wet:false});
        else if(SHAPE[id]?.open)collectWater(x,y,z,SHAPE[id].f,next);
      });
    }
    frontierWater=next;
    rebuildWaterChunks(old,next);
    wheels.forEach(function(w){w.wet=FRONTIER_DIRS.some(function(d){return get(w.x+d[0],w.y,w.z+d[1])===WATER || get(w.x+d[0],w.y-1,w.z+d[1])===WATER;});});
    frontierWheels=wheels;
    frontierRotors.forEach(function(obj,k){if(!wheels.has(k)){scene.remove(obj);obj.children.forEach(function(mesh){mesh.geometry.dispose();});obj.userData.mat.dispose();frontierRotors.delete(k);}});
    wheels.forEach(function(w,k) {
      if(frontierRotors.has(k))return;
      var rotor=new THREE.Group(), mat=new THREE.MeshLambertMaterial({color:0xa87a4c});
      for(var i=0;i<4;i++) {
        var bar=new THREE.Mesh(new THREE.BoxGeometry(.77,.12,.14),mat);
        bar.rotation.z=i*Math.PI/4;rotor.add(bar);
      }
      rotor.userData.mat=mat;rotor.position.set(w.x+.5,w.y+.54,w.z+.5);scene.add(rotor);frontierRotors.set(k,rotor);
    });
  }
  function stepFrontier(now,dt) {
    if(now>=frontierStepAt) {
      frontierStepAt=now+300;
      syncFrontierWater();
    }
    var x=Math.floor(P.x),y=Math.floor(P.y+.11),z=Math.floor(P.z);
    if(ui==='play'&&P.ground&&!frontierLift&&!furnitureRest&&get(x,y,z)===PRESS_PLATE) {
      var key=frontierCell(x,y,z);
      if(lastPlate!==key&&!canPlace(x,y,z,PRESS_PLATE)){lastPlate=key;pulseMechanical(x,y,z,null);}
    } else lastPlate='';
    if(now>=frontierPollAt&&(frontierSlotAt(x,z)>=0||ui==='frontierChest'||ui==='villageWork'&&villageTab==='frontier')) {
      frontierPollAt=now+6000; fetchFrontier();
    }
    frontierRotors.forEach(function(obj,k){if(frontierWheels.get(k)?.wet)obj.rotation.z+=dt*2.5;});
  }

  var frontierEnabled=false, frontierPlots={}, frontierFetchBusy=false, frontierStock=null, frontierStockBusy=false, frontierPollAt=0, frontierPendingStock=null;
  function frontierBounds(slot) { var x=916+(slot%3)*72,z=1252+Math.floor(slot/3)*72;return [x,z,x+47,z+47]; }
  function frontierSlotAt(x,z) {
    var a=x-916,b=z-1252;
    return a>=0&&b>=0&&a<216&&b<216&&a%72<48&&b%72<48?Math.floor(b/72)*3+Math.floor(a/72):-1;
  }
  function frontierEditReason(x,z) {
    var slot=frontierSlotAt(x,z), area=frontierPlots[slot];
    if(slot<0 || !frontierEnabled)return '';
    if(!area?.claimed)return '마을 수첩에서 먼저 개척 땅을 맡아요';
    return area.canEdit?'':'이 개척 땅에서는 구경만 할 수 있어요';
  }
  function syncRejectedFrontier(arr) {
    var cells=arr.filter(function(e){return frontierSlotAt(e[0],e[2])>=0;});
    if(!cells.length)return;
    fetchFrontier(ui==='villageWork'&&villageTab==='frontier');
    client.rpc('get_ark_frontier_cells',{p_cells:cells}).then(function(r){
      if(r.error||!Array.isArray(r.data))return;
      r.data.forEach(function(e) {
        var x=e[0],y=e[1],z=e[2],k=x+','+y+','+z;
        if(k in NET.pm)return;
        if(e[3]===null)queueRevert(x,y,z);
        else applyRemote(null,[e]);
      });
    }).catch(function(){});
  }
  function fetchFrontier(redraw) {
    if(!client||frontierFetchBusy)return Promise.resolve();
    frontierFetchBusy=true;
    return client.rpc('get_ark_frontier',{}, {get:true}).then(function(r){
      if(r.error||!Array.isArray(r.data))return;
      frontierEnabled=true;
      frontierPlots={};
      r.data.forEach(function(row){frontierPlots[row.slot]=row;});
      if(redraw&&ui==='villageWork'&&villageTab==='frontier')renderVillageWork();
    }).catch(function(){}).finally(function(){frontierFetchBusy=false;});
  }
  function changeFrontier(slot,action,user,role) {
    if(!client||!me||frontierStockBusy)return;
    frontierStockBusy=true;
    client.rpc('change_ark_frontier',{p_slot:slot,p_action:action,p_friend:user||null,p_role:role||null}).then(function(r){
      if(r.error||r.data!==true){toast('바꾸지 못했어요. 친구 상태와 개척 땅을 다시 확인해 주세요');return;}
      return fetchFrontier(true);
    }).catch(function(){toast('연결이 끊겼어요. 다시 확인해 주세요');}).finally(function(){frontierStockBusy=false;});
  }
  function renderFrontier(body) {
    villageButton(body,'자유 개척지 길 안내',function(){startFrontierGuide(FRONTIER_ENTRY,'자유 개척지');});
    villageButton(body,'바위굴 입구 길 안내',function(){startFrontierGuide(FRONTIER_CAVE[0],'바위굴 입구');});
    villageText(body,'자유 개척지는 모두 함께 지어요. 남쪽 친구 개척 땅은 주인이 편집과 창고 권한을 정해요.');
    villageText(body,'레버나 밟는 발판에 밧줄과 도르래를 이어 문을 움직여요. 물을 등진 수문을 열면 앞쪽으로 흘러요.');
    villageText(body,'승강대는 위아래로 두 개 놓아요. 사이를 비우고 옆에 밧줄·도르래·돌 추를 이은 뒤 승강대를 눌러 타요.');
    if(!me||!frontierEnabled)return villageText(body,'친구 개척 땅과 공동 창고를 쓰려면 로그인하고 서버에 연결해요.');
    if(!FRIENDS.ready&&!FRIENDS.busy)friendsFetch().then(function(){if(ui==='villageWork'&&villageTab==='frontier'&&FRIENDS.ready)renderVillageWork();});
    for(var i=0;i<9;i++) (function(slot){
      var a=frontierPlots[slot]||{}, box=frontierBounds(slot), row=document.createElement('div'); row.className='vme';
      body.appendChild(row);
      villageText(row,(slot+1)+'번 · '+(a.own?'내 개척 땅':a.canEdit?'친구와 함께 짓는 땅':a.canStock?'창고를 함께 쓰는 땅':a.claimed?'구경 가능':'비어 있음'));
      villageButton(row,'길 안내',function(){startFrontierGuide([(box[0]+box[2])/2,box[1]-2],'개척 땅 '+(slot+1)+'번');});
      if(!a.claimed&&!Object.values(frontierPlots).some(function(it){return it.own;})) {
        if(NOAH.done||isAdm()) villageButton(row,'땅 맡기',function(){ if(NOAH.done&&!isAdm()) client.rpc('finish_ark_noah').then(function(){changeFrontier(slot,'claim');},function(){changeFrontier(slot,'claim');}); else changeFrontier(slot,'claim'); });
        else if(slot===0) { villageText(row,'🕊 방주 앞 노아의 부탁 다섯 가지를 마치면 맡을 수 있어요 (창 9:1)'); villageButton(row,'노아에게 가기',function(){travel('ark');}); }
      }
      if(!a.own)return;
      FRIENDS.rows.filter(function(f){return f.status==='accepted';}).forEach(function(f){
        var line=document.createElement('div');line.className='vme';body.appendChild(line);
        villageText(line,f.nick);
        villageButton(line,'편집·창고 허용',function(){changeFrontier(slot,'grant',f.id,'build');});
        villageButton(line,'창고만 허용',function(){changeFrontier(slot,'grant',f.id,'stock');});
        villageButton(line,'허용 취소',function(){changeFrontier(slot,'revoke',f.id);});
      });
      villageText(body,'이 땅에 놓은 궤는 허용된 친구들과 재료를 같이 넣고 꺼낼 수 있어요.');
    })(i);
  }
  function openFrontierStock(h) {
    var slot=frontierSlotAt(h.x,h.z);
    if(!client||!me||!frontierPlots[slot]?.canStock)return deny('허용된 친구만 함께 쓰는 궤예요');
    frontierStock={slot:slot,x:h.x,y:h.y,z:h.z};
    openPanel('frontierChest'); renderFrontierStock(); if(frontierPendingStock)sendFrontierStock();
  }
  function renderFrontierStock() {
    var box=frontierStock;
    client.rpc('ark_frontier_stock',{p_slot:box.slot,p_item:0,p_delta:0}).then(function(r){
      if(r.error||r.data?.error||ui!=='frontierChest'||box!==frontierStock)return;
      var contents=r.data.items||{}, stored=$('frontierStored'), bag=$('frontierBag');
      stored.replaceChildren();bag.replaceChildren();
      function add(select,id,n){var option=document.createElement('option');option.value=id;option.textContent=nameOf(+id)+' · '+n+'개';select.appendChild(option);}
      Object.keys(contents).forEach(function(id){if(B[id])add(stored,id,contents[id]);});
      INV.forEach(function(id){if(frontierStockItem(id)&&have(id)>0 && !isAdm())add(bag,id,have(id));});
    }).catch(function(){});
  }
  function frontierStockItem(id) { return !!B[id]&&!isItem(id)&&id!==WATER&&baseOf(id)===id; }
  function changeFrontierStock(deposit) {
    var box=frontierStock;
    if(!box||frontierStockBusy||!client||isAdm())return;
    if(readBlock(box.x,box.y,box.z)!==CHEST)return toast('궤 자리가 바뀌었어요');
    var id=+$(deposit?'frontierBag':'frontierStored').value;
    if(frontierPendingStock)return sendFrontierStock();
    if(!id||!frontierStockItem(id)||deposit&&have(id)<1)return;
    if(!deposit&&room(id)<1)return toast('가방에 빈 자리가 없어요');
    if(!window.crypto?.randomUUID)return toast('보안 연결에서 공동 창고를 열어 주세요');
    frontierPendingStock={p_slot:box.slot,p_item:id,p_delta:deposit?1:-1,p_op:crypto.randomUUID()};
    if(deposit){take(id,1);bagChanged();}
    sendFrontierStock();
  }
  function sendFrontierStock() {
    if(!frontierPendingStock||frontierStockBusy)return;
    var args=frontierPendingStock;
    frontierStockBusy=true;
    client.rpc('ark_frontier_stock',args).then(function(r){
      if(r.error)throw r.error;
      frontierPendingStock=null;
      if(r.data?.ok) {if(args.p_delta<0)settleFrontierItem(args.p_item);}
      else {
        if(args.p_delta>0)settleFrontierItem(args.p_item);
        toast('아직 옮기지 못했어요');
      }
      if(ui==='frontierChest')renderFrontierStock();
    }).catch(function(){
      toast('연결 확인 중이에요. 조금 뒤에 창고를 다시 열어 주세요');
    }).finally(function(){frontierStockBusy=false;});
  }
  function settleFrontierItem(id) {
    if(give(id,1)!==1)dropItem(P.x,P.y+.4,P.z,id,1);
    bagChanged();
  }

  // ── 이번 주 함께 짓기 목표: 진행도는 서버가 함께 쓰는 세계 기록으로 셈(sql-migrations/2026-11-19-ark-village-goal.sql) ──
  var GOALS = [
    ['🧱', '함께 짓는 터에 블록 300개 놓기', '또 그들에게 하나님의 선한 손이 나를 도우신 일과 왕이 내게 이른 말씀을 전하였더니 그들의 말이 일어나 건축하자 하고 모두 힘을 내어 이 선한 일을 하려 하매', '느헤미야 2:18', '느 2:18'],
    ['🕯', '함께 짓는 터에 등불·횃불 20개 밝히기', '너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요', '마태복음 5:14', '마 5:14'],
    ['🤝', '들판 어디서든 함께 블록 1000개 놓기', '두 사람이 한 사람보다 나음은 그들이 수고함으로 좋은 상을 얻을 것임이라', '전도서 4:9', '전 4:9']
  ];
  var GOAL = null, goalAt = 0, goalBusy = false, goalDeco = null;
  function goalSeen() { try { return JSON.parse(localStorage.getItem('arkVillage.goal') || '{}') || {}; } catch (e) { return {}; } }
  function fetchGoal(force) {
    if (!client || !me || !NET.ok || goalBusy || (!force && performance.now() < goalAt)) return;
    goalBusy = true; goalAt = performance.now() + 60000;
    client.rpc('get_ark_village_goal').then(function (r) {
      goalBusy = false; var g = r && r.data; if (!g || r.error || !GOALS[g.k]) return;
      GOAL = g; renderGoal();
      var seen = goalSeen(), key = g.week + ':' + g.k, pct = g.n / g.t, st = seen.key === key ? seen.st || 0 : 0, G2 = GOALS[g.k];
      if (pct >= 1 && st < 2 && started) {
        showVerseCard('🎉', '이번 주 마을 목표를 함께 채웠어요!', G2[2], G2[3], G2[1] + ' — ' + g.ppl + '명이 함께 지었어요' + (g.mine ? '' : ' (다음 목표엔 나도 함께해요)'));
        st = 2;
      } else if (pct >= 0.5 && pct < 1 && st < 1 && started) { toast('🤝 이번 주 마을 목표 절반! ' + G2[1] + ' ' + g.n + '/' + g.t); st = 1; }
      if (pct >= 1 && g.mine) unlock('together');
      try { localStorage.setItem('arkVillage.goal', JSON.stringify({ key: key, st: st })); } catch (e) {}
      goalDecorate(pct >= 1);
    }, function () { goalBusy = false; });
  }
  function renderGoal() {
    var el = $('goalCard'); if (!el) return;
    if (!GOAL) { el.textContent = me ? '🤝 이번 주 마을 목표를 불러오는 중…' : '🤝 로그인하면 이번 주 마을 목표에 함께할 수 있어요'; return; }
    var G2 = GOALS[GOAL.k], pct = Math.min(1, GOAL.n / GOAL.t);
    el.innerHTML = '';
    var h = document.createElement('b'); h.textContent = G2[0] + ' 이번 주 마을 목표 (' + G2[4] + ')'; el.appendChild(h);
    var d = document.createElement('div'); d.textContent = G2[1]; el.appendChild(d);
    var bar = document.createElement('div'); bar.className = 'goalBar'; var fill = document.createElement('i'); fill.style.width = Math.round(pct * 100) + '%'; bar.appendChild(fill); el.appendChild(bar);
    var t = document.createElement('div'); t.className = 'goalTxt'; t.textContent = Math.min(GOAL.n, GOAL.t) + ' / ' + GOAL.t + ' · ' + GOAL.ppl + '명이 함께' + (pct >= 1 ? ' · 🎉 다 채웠어요!' : (GOAL.mine ? ' · 나도 함께하는 중' : '')); el.appendChild(t);
  }
  // 다 채우면 함께 짓는 터 네 귀퉁이에 깃발, 가운데에 알림판(그 주 동안)
  function goalDecorate(on) {
    if (!scene) return;
    if (!on) { if (goalDeco) { scene.remove(goalDeco); goalDeco = null; } return; }
    if (goalDeco) return;
    goalDeco = new THREE.Group();
    var cols = [0xd84040, 0xe8c840, 0x3a8ad8, 0x40b060];
    [[COMMONS[0] - 1, COMMONS[1] - 1], [COMMONS[2] + 1, COMMONS[1] - 1], [COMMONS[0] - 1, COMMONS[3] + 1], [COMMONS[2] + 1, COMMONS[3] + 1]].forEach(function (c, i) {
      var pole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7, 0.2), new THREE.MeshBasicMaterial({ color: 0x6b4425 })); pole.position.set(c[0] + 0.5, G + 4.5, c[1] + 0.5); goalDeco.add(pole);
      var flag = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 0.08), new THREE.MeshBasicMaterial({ color: cols[i] })); flag.position.set(c[0] + 1.6, G + 7.2, c[1] + 0.5); goalDeco.add(flag);
    });
    var s = signSprite('🎉 이번 주 함께 지었어요!'); s.position.set((COMMONS[0] + COMMONS[2]) / 2 + 0.5, G + 9, (COMMONS[1] + COMMONS[3]) / 2 + 0.5); s.scale.multiplyScalar(2.4); goalDeco.add(s);
    scene.add(goalDeco);
  }
  // 점검 함수: 내 컴퓨터(시험 서버)와 선생님 계정에서만 연다 — 학생이 개발자 창에서 물건을 만들어 내지 못하게
  var ARK_DBG = { cine: { render: function () { renderer.render(scene, camera); }, kit: function () { return { THREE: THREE, scene: scene, B: B, makeAvatar: makeAvatar, dressAvatar: dressAvatar, peerLook: peerLook, handItem: handItem, makeCartMesh: makeCartMesh, textSprite: textSprite, sparkle: sparkle, floatText: floatText, combatFx: combatFx, shadowDeathFx: shadowDeathFx, hpBarDraw: hpBarDraw, LOOKS: LOOKS, HT: HT, G: G, get: readBlock, isSolid: isSolid, kind: kind, SH_KINDS: SH_KINDS, makeShadow: makeShadow, SHADOWS: SHADOWS, disposeSprite: disposeSprite,
      bulk: function (L) {   // 예고편 촬영용: 블록을 한꺼번에 놓고 덩어리마다 한 번만 다시 그림
        var cols = {}, ch = {}, lamps = [];
        L.forEach(function (b) {
          var x = b[0], y = b[1], z = b[2], id = b[3]; if (!colAt(x, z)) { if (x < 0 || z < 0 || x >= WS || z >= WS) return; newColumn(x >> 5, z >> 5); }
          var c0 = colAt(x, z), was = readBlock(x, y, z); setRaw(x, y, z, id); c0.mod = true;
          if (LIGHTS[was] && !LIGHTS[id]) c0.lamps = c0.lamps.filter(function (l) { return l[0] !== x || l[1] !== y || l[2] !== z; });
          if (LIGHTS[id] && !LIGHTS[was]) { c0.lamps.push([x, y, z]); lamps.push([x, y, z]); }
          cols[(x >> 5) + ',' + (z >> 5)] = [x, z];
          for (var d = -1; d <= 1; d++) { ch[((x + d) >> 5) + ',' + (y >> 5) + ',' + (z >> 5)] = 1; ch[(x >> 5) + ',' + ((y + d) >> 5) + ',' + (z >> 5)] = 1; ch[(x >> 5) + ',' + (y >> 5) + ',' + ((z + d) >> 5)] = 1; }
          if (LIGHTS[id] || LIGHTS[was]) for (var lz = (z - 8) >> 5; lz <= (z + 8) >> 5; lz++) for (var lx = (x - 8) >> 5; lx <= (x + 8) >> 5; lx++) for (var ly = (y - 8) >> 5; ly <= (y + 8) >> 5; ly++) ch[lx + ',' + ly + ',' + lz] = 1;
        });
        for (var k in cols) { var cc = cols[k], col = colAt(cc[0], cc[1]); for (var lz2 = 0; lz2 < CS; lz2++) for (var lx2 = 0; lx2 < CS; lx2++) skyScan(col, lx2, lz2); }
        var n = 0; for (var k2 in ch) { var q = k2.split(',').map(Number); if (q[1] < 0 || q[1] >= CY || !inWorldC(q[0], q[2]) || !meshedCols[q[2] * NC + q[0]]) continue; buildChunk(q[0], q[1], q[2]); n++; }
        return n;
      } }; }, frame: function (q) { return canvasEl.toDataURL('image/jpeg', q || 0.92); }, avatar: function (v) { if (avatar) avatar.visible = v; heldMesh.visible = false; }, key: function (c, v) { keys[c] = v; }, thunder: function () { thunderStrike(); }, rainbow: function (sec) { rainbowUntil = dayT + (sec || 40); }, rain: function (on, st) { rainOn = on; rain = on ? 1 : 0; storm = !!st; } }, openFeedback: function () { openFeedback(); }, openFeedbackAdmin: function () { openFeedbackAdmin(); }, railScanCost: function (n) { var t = performance.now(); for (var i = 0; i < (n || 20); i++) railScanStep(); return (performance.now() - t) / (n || 20); }, setPlotName: function (u, t) { if (t) PLOT_NAMES[u] = t; else delete PLOT_NAMES[u]; refreshPlotSigns(); }, plotSigns: function () { var o = {}; for (var k in plotSignObjs) o[k] = plotSignObjs[k].txt; return o; }, setPlotUser: function (p, u, nick) { plotUser[p] = u; plotOwners[p] = 1; if (nick) NET.names[u] = nick; }, fakeNet: function (c, id) { client = c; me = { id: id }; }, projectCells: function (k) { return projectCells(k).length; }, perf: function () { return perfAcc; }, home: function () { checkHome(); return homeSafe; }, safeZone: function (x, z) { return safeZone(x, z); }, vib: function () { return VIB; }, news: function () { return [newsLeft(), NEWS_DONE, S.newsSeen]; }, parked: function () { return PARKED.map(function (p) { return [p.x, p.y, p.z, !!(p.mesh && p.mesh.visible)]; }); }, railMap: function () { return RAIL_MAP.size; }, spawnAt: function (x, y, z) { SPAWN = { x: x, y: y, z: z }; }, fps: function (v) { if (v !== undefined) { fpsW.low = v; } return fpsW; }, cart: function () { return cartRide ? JSON.parse(JSON.stringify(cartRide)) : null; }, startCart: function (x, y, z) { startCart(x, y, z); }, leaveCart: function () { leaveCart(); }, railShapeFor: function (x, y, z) { return railShapeFor(x, y, z, 0); }, faith: function (v) { if (v !== undefined) { FAITH = v; renderVitals(); } return FAITH; }, shoot: function (pw) { bowAt = 0; shootArrow(screenDir(), pw); return ARROWS.length; }, lastArrow: function () { var a = ARROWS[ARROWS.length - 1]; return a ? [Math.hypot(a.vx, a.vy, a.vz).toFixed(1), a.dmg] : null; }, bowDraw: function () { return !!bowDraw; }, wear: function (id) { WORN[WEARINFO[id].slot] = id; }, matesNear: function () { return matesNear(); }, arrows: function () { return [ARROWS.length, FIRES.length]; }, fire: function (s) { shootFireArrow(s); return FIRES.length; }, matTest: function () { audioOn(); var o = {}; [[STONE,'돌'],[GOPHER,'고페르'],[LOG,'통나무'],[DIRT,'흙'],[GRASS,'풀'],[SAND,'모래'],[SNOW,'눈'],[LEAF,'잎'],[GLASS,'유리'],[PANE,'유리판'],[BLK_FE,'철 블록'],[WOOL_W,'흰 양털'],[CARPET,'카펫'],[BRICK,'벽돌'],[SLAB_L,'반블록'],[STAIR_P,'계단'],[CRAFT,'제작대'],[CHEST,'궤'],[FLOWER,'꽃']].forEach(function (q) { o[q[1]] = matSound(q[0]); }); var ok = 0; ['stone','wood','dirt','sand','plant','wool','glass','metal'].forEach(function (m) { ['dig','break','place'].forEach(function (a) { if (matSfx(a, m)) ok++; }); }); o.played = ok; o.nodes = JSON.stringify(window.__n); return o; }, thunder: function () { storm = true; rainOn = true; rain = 1; thunderStrike(); return flashK; }, flash: function () { return flashK; }, photo: function () { savePhoto(); }, chestTest: function () { curChest = 'test'; CHESTS.test = CHESTS.test || {}; openPanel('chest'); renderChest(); }, dexSet: function (k) { DEX[k] = 1; saveDex(); }, noah: function () { return NOAH; }, goal: function (force) { if (force) fetchGoal(true); return GOAL; }, goalDeco: function () { return !!goalDeco; }, amb: function () { return amb ? { reg: ambReg, cave: inCave, wind: +amb.wind.gain.value.toFixed(3), leaves: +amb.leaves.gain.value.toFixed(3), surf: +amb.surf.gain.value.toFixed(3), water: +amb.water.gain.value.toFixed(3) } : null; }, stepKind: stepKind, sdrops: function () { return Object.keys(SDROPS).map(function (k) { var d = SDROPS[k]; return { id: d.id, x: d.x, y: d.y, z: d.z, item: d.item, n: d.n }; }); }, netDrop: function () { NET.testMute = true; }, netBack: function () { NET.testMute = false; try { client.realtime.conn.close(); } catch (e) {} }, netOn: function () { return NET.on; }, rinfo: function () { var i = renderer.info; return { geo: i.memory.geometries, tex: i.memory.textures, calls: i.render.calls, kids: scene.children.length, chunks: Object.keys(chunks).length }; }, reach: function (x, y, z, ch) { var x0 = (ch[0]) * CS, y0 = ch[1] * CS, z0 = ch[2] * CS, ls = lampsNear(x0 - 8, y0 - 8, z0 - 8, x0 + CS + 8, y0 + CS + 8, z0 + CS + 8); lampReach(ls, x0, y0, z0); return { ls: ls, m: LMASK[((y - y0 + 8) * LR + (z - z0 + 8)) * LR + (x - x0 + 8)] }; }, vtx: function (x0, y0, z0, x1, y1, z1) { var out = []; for (var k in chunks) (chunks[k] || []).forEach(function (m) { var g = m.geometry, p = g.attributes.position.array, c = g.attributes.color && g.attributes.color.array; if (!c) return; for (var i = 0; i < p.length; i += 3) if (p[i] >= x0 && p[i] <= x1 && p[i + 1] >= y0 && p[i + 1] <= y1 && p[i + 2] >= z0 && p[i + 2] <= z1) out.push([p[i], p[i + 1], p[i + 2], +c[i].toFixed(2), +c[i + 1].toFixed(2)]); }); return out; }, vb: function () { return villageBook; }, bpCells: function () { return blueprintCells(villageBook.plan); }, pickC: function () { var d = screenDir(), h = pickDir(d), c = pickCreature(d, blockCover(h)); return { h: h && [h.x, h.y, h.z, get(h.x, h.y, h.z), +h.t.toFixed(2)], c: c && c.kind, cn: c && c.npc && c.npc.d.name, cam: [camera.position.x, camera.position.y, camera.position.z].map(function (v) { return +v.toFixed(1); }), ui: ui }; }, PARTY: function () { return PARTY; }, partyApply: partyApply, openParty: openParty, partyAdd: partyAdd, TITLES: TITLES, inDungeon: inDungeon, shadowDbg: function () { return { t: shadowT, on: shadowsOn(), ui: ui, safe: safeZone(Math.floor(P.x), Math.floor(P.z)), riding: !!riding }; }, STORY: function () { return STORY; }, startStory: startStory, storyTick: function () { storyT = 0; storyTick(0.01); }, DUN: DUN, CITY: CITY, DUN_LAMPS: DUN_LAMPS, socketPos: socketPos, useLampstand: useLampstand, useSocket: useSocket, openStory: openStory, partOf: partOf,
    araratMax: function () { var m = 0, mx = 0, mz = 0; for (var x = ARX - 220; x < ARX + 220; x += 3) for (var z = ARZ - 220; z < ARZ + 220; z += 3) { if (x < 0 || z < 0) continue; terrain(x, z); if (T.reg === 'ararat' && T.h > m) { m = T.h; mx = x; mz = z; } } return [m, mx, mz]; },
    gemCount: function () { var c = {}; for (var k = 0; k < COLS.length; k++) { var col = COLS[k]; if (!col) continue; for (var i = 0; i < col.d.length; i++) { var v = col.d[i]; if ((v >= 200 && v <= 210)) c[v] = (c[v] || 0) + 1; } } return c; }, regenPlot: function (p) { var o = plotOrigin(p); for (var cz = o.z >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = o.x >> 5; cx <= (o.x + PLOT) >> 5; cx++) { var k = cz * NC + cx; if (!COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); } } }, setMyPlot: function (p) { myPlot = p; }, queueRevert: queueRevert, queueRemote: queueRemote, openVisit: openVisit, q: function () { return qStep; }, setQ: function (n) { qStep = n; questCheck(); }, blockIds: function () { var a = [0]; for (var i = 1; i < B.length; i++) if (B[i] && B[i][6] !== 'item' && B[i][6] !== 'tool' && i !== WATER) a.push(i); return a; }, SHADOWS: function () { return SHADOWS; }, FX: function () { return FX; }, ADV: function () { return ADV; }, openQuests: openQuests, questEvent: questEvent, regionTick: regionTick, inLandmark: inLandmark, LMK: { TBX: TBX, TBZ: TBZ, CTX: CTX, CTZ: CTZ, TCX: TCX, TCZ: TCZ, LOTX: LOTX, LOTZ: LOTZ, TWY: TWY, SAX: SAX, SAZ: SAZ, CEX: CEX, CEZ: CEZ }, region: region, getB: function (x, y, z) { return get(x, y, z); }, oreBase: oreBase, P2: function () { return P; }, spawnShadow: function (k, x, z) { var s = makeShadow(k, x, z); SHADOWS.push(s); return s; }, hitShadow: hitShadow, armorGuard: armorGuard, V: function () { return { HP: HP, FOOD: FOOD, AIRV: AIRV, SPAWN: SPAWN }; }, setV: function (h, f) { HP = h; FOOD = f; renderVitals(); }, hurt: hurt, CROPS: function () { return CROPS; }, ACH: function () { return ACH; }, NPCS: function () { return NPCS; }, stateGather: stateGather, stateApply: stateApply, useLever: useLever, useBed: useBed, feedAnimal: feedAnimal, inCommons: inCommons, COMMONS: COMMONS, SIGNS: function () { return SIGNS; }, setSignText: setSignText, refreshSigns: refreshSigns, isNight: isNight, setDayT: function (v) { dayT = v; }, WORN: function () { return WORN; }, LOOK: function (i) { if (i !== undefined) { LOOK = i; saveWorn(); } return LOOK; }, wearItem: wearItem, unwear: unwear, harvestAnimal: harvestAnimal, openLooks: openLooks, tableOK: tableOK, NET: NET, applyRemote: applyRemote, onPos: onPos, addChat: addChat, removeChat: removeChat, netEdit: netEdit, netTick: netTick, peerBubble: peerBubble, openChat: openChat, setMe: function (u, nick) { me = { id: u }; NET.nick = nick; NET.ok = true; NET.ready = true; }, riding: function () { return riding; }, tapRideable: tapRideable, dismount: dismount, makeBeast: function (k, x, z) { var a = makeBeast(k, x, z); animals.push(a); return a; }, collectAll: collectAll, DROPS: function () { return DROPS; }, FALLS: function () { return FALLS; }, SAPS: function () { return SAPS; }, growTree: growTree, CHESTS: function () { return CHESTS; }, openChest: openChest, skyLight: skyLight, startFall: startFall, setBlock: setBlock, atlasURL: function () { return atlas.toDataURL(); }, JOBS: function () { return JOBS; }, smeltTick: smeltTick, SMELT: function (v) { SMELT_SEC = v; }, WEAR: function () { return WEAR; }, mineInfo: mineInfo, HEAT: function () { return HEAT; }, fuelLeft: fuelLeft, canPlace: canPlace, wearTool: function (t) { wearTool(t); bagChanged(); }, P: P, teleport: teleport, start: function () { startGame(); }, S: S, act: act, pickCenter: pickCenter, setUI: showUI, openPanel: openPanel,
    BAG: function () { return BAG; }, tapAt: function (x, y) { tapAt(x, y); }, enc: function () { return encodePlot(myPlot); }, dec: function (d) { plotData[0] = null; decodePlot(0, d, true); return !!plotData[0]; }, fakeLogin: function () { client = null; me = { id: 'test' }; myPlot = 0; }, setHot: function (i, id) { HOTBAR[i] = id; setSel(i, true); }, plotOrigin: plotOrigin, collides: collides, animals: function () { return animals; }, setDay: function (p) { dayT = DAY_LEN * p; }, rain: function (on) { rainOn = on; rain = on ? 1 : 0; rainTimer = 999; }, dex: function () { return DEX; }, q: function () { return qStep; }, camera: function () { return camera; }, counts: function () { return [animals.length, birds.length, fishes.length]; }, give: function (id, n) { give(id, n); bagChanged(); }, travel: travel, mineAt: function (dt) { mineTick(pickCenter(), dt); }, terrain: function (x, z) { terrain(x, z); return { h: T.h, top: T.top, wtop: T.wtop, reg: T.reg }; }, get: get, cols: function () { var n = 0; for (var i = 0; i < COLS.length; i++) if (COLS[i]) n++; return n; }, meshed: function () { var n = 0; for (var i = 0; i < meshedCols.length; i++) if (meshedCols[i]) n++; return n; }, mapRow: function () { return mapRow; }, setTab: function (t) { invTab = t; renderInv(); } };
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) window.__arkDebug = ARK_DBG;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
