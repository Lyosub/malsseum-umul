// 「베들레헴의 밤」 장면 입체(2026-11-26): 그림 + AI 거리 지도(Depth Anything V2)로 가까운 것과 먼 것을 다르게 움직인다.
// 움직임의 원인: ① 화면을 끌어 둘러볼 때(끈 만큼) ② 폰 기울이기(되면) ③ 마우스 위치(컴퓨터) ④ 아무것도 안 할 때 아주 느린 숨결.
// 그 위에 ⑤ 등잔·횃불 빛 깜빡임 ⑥ 떠다니는 먼지 ⑦ 별 반짝임 ⑧ 모닥불·솥 연기. WebGL이 안 되면 그냥 그림만 보인다.
(function () {
  'use strict';
  var VS = 'precision highp float;attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  // 영화 색보정: 밝은 곳 빛 번짐(4방향), 대비·채도, 장면 색(어둠은 남색 쪽·밝음은 금빛 쪽), 가장자리 어둡게, 아주 옅은 필름 알갱이
  var FS = 'precision highp float;varying vec2 v;uniform sampler2D img,dep;uniform vec2 off,px;uniform float zoom,con,sat,vig,bloom,tm;uniform vec3 shadow,high;' +
    'vec3 hi(vec2 c){vec3 x=texture2D(img,c).rgb;return max(x-.8,0.);}' +
    'void main(){vec2 c=(v-.5)/zoom+.5;float d=texture2D(dep,c).r;vec2 o=off*(d-.35);' +
    'float d2=texture2D(dep,c-o).r;o=off*(mix(d,d2,.5)-.35);vec2 u=c-o;vec3 col=texture2D(img,u).rgb;' +
    'vec3 b=hi(u+px*vec2(6.,0.))+hi(u-px*vec2(6.,0.))+hi(u+px*vec2(0.,6.))+hi(u-px*vec2(0.,6.))+hi(u+px*vec2(14.,9.))+hi(u-px*vec2(14.,9.))+hi(u+px*vec2(-9.,14.))+hi(u-px*vec2(-9.,14.));' +
    'col+=b*bloom*.12;' +
    'float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,sat);col=(col-.5)*con+.5;' +
    'col=mix(col*shadow,col,smoothstep(.05,.55,l));col=mix(col,col*high,smoothstep(.45,1.,l));' +
    'vec2 q=v-.5;q.x*=1.4;col*=1.-vig*smoothstep(.25,.85,length(q));' +
    'float g=fract(sin(dot(v*vec2(913.,577.)+tm,vec2(12.9898,78.233)))*43758.5453);col+=(g-.5)*.025;' +
    'gl_FragColor=vec4(clamp(col,0.,1.),1.);}';
  function load(src) { return new Promise(function (ok, no) { var im = new Image(); im.crossOrigin = 'anonymous'; im.onload = function () { ok(im); }; im.onerror = no; im.src = src; }); }
  function tex(gl, im) { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); return t; }

  var cur = null, tilt = { x: 0, y: 0 }, mouse = { x: 0, y: 0, on: false };
  addEventListener('mousemove', function (e) { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; mouse.on = true; });
  function onOrient(e) { if (e.gamma == null) return; tilt.x = Math.max(-1, Math.min(1, e.gamma / 25)); tilt.y = Math.max(-1, Math.min(1, (e.beta - 40) / 25)); }
  var orientAsked = false;
  function askOrient() {   // 아이폰은 사용자가 누를 때 한 번 허락을 받아야 기울기를 준다
    if (orientAsked) return; orientAsked = true;
    try { if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(function (s) { if (s === 'granted') addEventListener('deviceorientation', onOrient); }).catch(function () {}); else addEventListener('deviceorientation', onOrient); } catch (e) {}
  }
  addEventListener('pointerdown', askOrient, { once: true });

  // stage: 1920×1080 무대(화면에 맞춰 줄이고 끌어 옮기는 부모), opts: { img, depth, hi, fx, panFrac() }
  function mount(stage, opts) {
    unmount();
    var W = 1920, H = 1080, cv = document.createElement('canvas'); cv.className = 'scene3d'; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    var layer = document.createElement('div'); layer.className = 'scene-fx'; layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
    stage.insertBefore(cv, stage.firstChild); stage.insertBefore(layer, cv.nextSibling);
    var gl = cv.getContext('webgl', { premultipliedAlpha: false, antialias: false }), state = { stage: stage, cv: cv, layer: layer, gl: gl, raf: 0, depthPx: null, off: { x: 0, y: 0 }, figs: [], alive: true };
    cur = state;
    var useHi = opts.hi && (window.devicePixelRatio || 1) * stage.getBoundingClientRect().width > 2200;
    Promise.all([load(useHi ? opts.hi : opts.img), load(opts.depth)]).then(function (r) {
      if (!state.alive) return;
      var im = r[0], dp = r[1];
      // 거리 지도를 읽어 둔다(인물·누를 곳을 같은 깊이로 움직이고, 별 자리를 고르려고)
      var c2 = document.createElement('canvas'); c2.width = dp.width; c2.height = dp.height; var x2 = c2.getContext('2d'); x2.drawImage(dp, 0, 0); state.depthPx = { w: dp.width, h: dp.height, d: x2.getImageData(0, 0, dp.width, dp.height).data };
      if (!gl) { cv.style.background = 'url(' + im.src + ') center/100% 100%'; startFx(state, opts.fx || {}, im); return; }
      var dpr = Math.min(2, window.devicePixelRatio || 1), sw = Math.min(im.width, Math.round(stage.getBoundingClientRect().width * dpr / (stage.getBoundingClientRect().width / W) * (stage.getBoundingClientRect().width / W)));
      cv.width = Math.min(im.width, Math.max(960, Math.round(W * Math.min(1.6, (stage.getBoundingClientRect().width / W) * dpr)))); cv.height = Math.round(cv.width * H / W);
      var pr = gl.createProgram(); [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); gl.attachShader(pr, sh); });
      gl.linkProgram(pr); gl.useProgram(pr);
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0); tex(gl, im); gl.uniform1i(gl.getUniformLocation(pr, 'img'), 0);
      gl.activeTexture(gl.TEXTURE1); tex(gl, dp); gl.uniform1i(gl.getUniformLocation(pr, 'dep'), 1);
      var uOff = gl.getUniformLocation(pr, 'off'), uZoom = gl.getUniformLocation(pr, 'zoom'), uTm = gl.getUniformLocation(pr, 'tm'); gl.uniform1f(uZoom, 1.035);
      var G = Object.assign({ con: 1.05, sat: 1.0, vig: .32, bloom: 1, shadow: [.93, .95, 1.06], high: [1.02, 1.0, .97] }, opts.grade || {});
      gl.uniform1f(gl.getUniformLocation(pr, 'con'), G.con); gl.uniform1f(gl.getUniformLocation(pr, 'sat'), G.sat); gl.uniform1f(gl.getUniformLocation(pr, 'vig'), G.vig); gl.uniform1f(gl.getUniformLocation(pr, 'bloom'), G.bloom);
      gl.uniform3fv(gl.getUniformLocation(pr, 'shadow'), G.shadow); gl.uniform3fv(gl.getUniformLocation(pr, 'high'), G.high); gl.uniform2f(gl.getUniformLocation(pr, 'px'), 1 / im.width * (im.width / 1920), 1 / im.height * (im.height / 1080));
      gl.viewport(0, 0, cv.width, cv.height);
      var t0 = performance.now(), sm = { x: 0, y: 0 };
      (function frame(now) {
        if (!state.alive) return;
        var t = (now - t0) / 1000, pf = opts.panFrac ? opts.panFrac() : { x: 0, y: 0 };
        var tx = pf.x * .9 + tilt.x * .7 + (mouse.on ? mouse.x * .8 : 0) + Math.sin(t * .23) * .18, ty = pf.y * .5 + tilt.y * .5 + (mouse.on ? mouse.y * .5 : 0) + Math.sin(t * .17 + 1) * .1;
        sm.x += (tx - sm.x) * .08; sm.y += (ty - sm.y) * .08;
        state.off.x = sm.x * .028; state.off.y = sm.y * .02;
        gl.uniform2f(uOff, state.off.x, state.off.y); gl.uniform1f(uTm, (t * 7) % 100); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        moveFigs(state);
        state.raf = requestAnimationFrame(frame);
      })(t0);
      startFx(state, opts.fx || {}, im);
    }).catch(function () { cv.style.background = 'url(' + opts.img + ') center/100% 100%'; });
    return state;
  }
  function depthAt(state, fx, fy) { var D = state.depthPx; if (!D) return .5; var x = Math.max(0, Math.min(D.w - 1, Math.round(fx * D.w))), y = Math.max(0, Math.min(D.h - 1, Math.round(fy * D.h))); return D.d[(y * D.w + x) * 4] / 255; }
  // 인물·누를 곳·빛도 그 자리 깊이만큼 같이 움직인다(그림과 어긋나지 않게)
  function track(el, fx, fy, near) { if (!cur) return; cur.figs.push({ el: el, fx: fx, fy: fy, near: near }); }
  function moveFigs(state) {
    var W = 1920, H = 1080;
    state.figs.forEach(function (f) {
      var d = f.near != null ? f.near : depthAt(state, f.fx, Math.min(.99, f.fy)); if (f.d == null) f.d = d;
      var dx = state.off.x * (f.d - .35) * W / 1.035, dy = state.off.y * (f.d - .35) * H / 1.035;
      f.el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
    });
  }
  function startFx(state, fx, im) {
    var L = state.layer;
    (fx.lights || []).forEach(function (l, i) {   // [x%, y%, 반지름(무대 px), 색]
      var g = document.createElement('div'); g.className = 'fx-light'; g.style.cssText = 'left:' + l[0] + '%;top:' + l[1] + '%;width:' + l[2] * 2 + 'px;height:' + l[2] * 2 + 'px;background:radial-gradient(circle,' + (l[3] || 'rgba(255,190,100,.55)') + ' 0%,rgba(255,150,60,.16) 38%,transparent 70%);animation-delay:-' + (i * .37).toFixed(2) + 's;animation-duration:' + (2.2 + (i % 3) * .7).toFixed(1) + 's';
      L.appendChild(g); track(g, l[0] / 100, l[1] / 100);
    });
    (fx.rays || []).forEach(function (r) {   // [x%, y%, 크기px, 기울기deg] 위에서 내리는 빛줄기
      var e = document.createElement('div'); e.className = 'fx-rays'; e.style.cssText = 'left:' + r[0] + '%;top:' + r[1] + '%;width:' + r[2] + 'px;height:' + (r[2] * 1.6) + 'px;transform:translateX(-50%) rotate(' + (r[3] || 0) + 'deg)'; L.appendChild(e); track(e, r[0] / 100, Math.min(.95, r[1] / 100 + .3));
    });
    (fx.smoke || []).forEach(function (s) { for (var k = 0; k < 5; k++) { var e = document.createElement('div'); e.className = 'fx-smoke'; e.style.cssText = 'left:' + s[0] + '%;top:' + s[1] + '%;animation-delay:-' + (k * 1.3).toFixed(1) + 's'; L.appendChild(e); track(e, s[0] / 100, s[1] / 100); } });
    if (fx.stars !== false && state.depthPx) {   // 거리 지도에서 가장 먼 곳(하늘)에만 반짝임
      var n = 0, tries = 0; while (n < (fx.stars || 26) && tries++ < 3000) {
        var x = Math.random(), y = Math.random() * .55; if (depthAt(state, x, y) > .06) continue;
        var s = document.createElement('i'); s.className = 'fx-star'; s.style.cssText = 'left:' + (x * 100).toFixed(2) + '%;top:' + (y * 100).toFixed(2) + '%;animation-delay:-' + (Math.random() * 4).toFixed(2) + 's;animation-duration:' + (2 + Math.random() * 3).toFixed(1) + 's'; L.appendChild(s); n++;
      }
    }
    if (fx.dust !== false) { for (var k = 0; k < (fx.dust || 22); k++) { var d = document.createElement('i'); d.className = 'fx-dust'; d.style.cssText = 'left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (30 + Math.random() * 65).toFixed(1) + '%;animation-delay:-' + (Math.random() * 14).toFixed(1) + 's;animation-duration:' + (10 + Math.random() * 10).toFixed(1) + 's'; L.appendChild(d); } }
  }
  function unmount() { if (!cur) return; cur.alive = false; cancelAnimationFrame(cur.raf); if (cur.gl) { var ext = cur.gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); } cur.cv.remove(); cur.layer.remove(); cur.figs.forEach(function (f) { f.el.style.translate = ''; }); cur = null; }
  window.BN3D = { mount: mount, unmount: unmount, track: track, depthAt: function (x, y) { return cur ? depthAt(cur, x, y) : .5; } };
})();
