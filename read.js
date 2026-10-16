/* Eclipse voice reader: uses the phone's own text-to-speech. Nothing is uploaded anywhere. */
(function () {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
  var ss = window.speechSynthesis;
  var main = document.querySelector('main');
  if (!main) return;

  var css = document.createElement('style');
  css.textContent =
    '.rd{background:rgba(127,176,255,.15);box-shadow:-10px 0 0 rgba(127,176,255,.15),10px 0 0 rgba(127,176,255,.15);border-radius:4px}' +
    '#vr{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:40;display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:999px;background:rgba(8,13,32,.92);border:1px solid rgba(88,178,255,.5);box-shadow:0 8px 24px rgba(0,0,0,.6),0 0 18px rgba(47,139,255,.3);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}' +
    '#vr button{font:600 14px system-ui,sans-serif;color:#e6eeff;background:transparent;border:0;border-radius:999px;padding:9px 12px;min-width:44px;-webkit-tap-highlight-color:transparent}' +
    '#vr button:active{background:rgba(88,178,255,.25)}' +
    '#vr #vp{background:#1b3a7a;padding:9px 16px}' +
    '#vj{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 72px);z-index:41;display:none;font:600 13px system-ui,sans-serif;color:#e6eeff;background:#1b3a7a;border:1px solid rgba(88,178,255,.6);border-radius:999px;padding:9px 16px;box-shadow:0 6px 18px rgba(0,0,0,.6);-webkit-tap-highlight-color:transparent}' +
    '#vj.on{display:block}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.id = 'vr';
  bar.innerHTML = '<button id="vb" type="button" aria-label="Previous paragraph">&#9198;</button>' +
    '<button id="vp" type="button" aria-label="Listen">&#127911; Listen</button>' +
    '<button id="vn" type="button" aria-label="Next paragraph">&#9197;</button>' +
    '<button id="vs" type="button" aria-label="Speed">1&times;</button>';
  document.body.appendChild(bar);
  var jump = document.createElement('button');
  jump.id = 'vj'; jump.type = 'button'; jump.innerHTML = '&#128205; Back to where it\u2019s reading';
  document.body.appendChild(jump);
  var bp = bar.querySelector('#vp'), bb = bar.querySelector('#vb'), bn = bar.querySelector('#vn'), bs = bar.querySelector('#vs');

  var list = [], i = 0, playing = false, tok = 0, flip = false, narr = null, chr = null, lock = null;
  var follow = true; // true = screen follows the voice; false = the reader has scrolled away on purpose
  var SPEEDS = [1, 1.15, 1.3, 0.9], si = 0;
  try { si = Math.max(0, SPEEDS.indexOf(parseFloat(localStorage.getItem('vrate')))); } catch (e) {}
  function rate() { return SPEEDS[si]; }
  function showRate() { bs.textContent = SPEEDS[si] + '\u00d7'; }
  showRate();

  function build() {
    list = [];
    var els = main.querySelectorAll('h2,h3,p,.msg,.doc,li');
    for (var k = 0; k < els.length; k++) {
      var el = els[k];
      if (el.closest('nav') || el.classList.contains('back')) continue;
      var tx, type = 'narr';
      if (el.classList.contains('msg')) {
        var sm = el.querySelector('small'), who = sm ? sm.textContent.trim() : '';
        tx = (who ? who + ' says. ' : '') + el.textContent.replace(who, '').trim();
        type = 'dlg';
      } else {
        tx = el.textContent.replace(/\s+/g, ' ').trim();
        if (el.tagName === 'H2' || el.tagName === 'H3') type = 'head';
        else if (/^[\u201c"]/.test(tx)) type = 'dlg';
      }
      tx = tx.replace(/\u00b7/g, ',').replace(/[\u2605\u2606]/g, '');
      if (tx.length > 1) list.push({ el: el, text: tx, type: type });
    }
  }

  function score(v, names) {
    for (var n = 0; n < names.length; n++) {
      if (v.name.indexOf(names[n]) > -1) return 100 - n + (/premium|enhanced/i.test(v.name) ? 50 : 0);
    }
    return -1;
  }
  function pick() {
    var vs = ss.getVoices().filter(function (v) { return /^en/i.test(v.lang); });
    function best(names, not) {
      var b = null, bsx = -1;
      vs.forEach(function (v) { if (v === not) return; var s = score(v, names); if (s > bsx) { bsx = s; b = v; } });
      return b;
    }
    narr = best(['Daniel', 'Oliver', 'Arthur', 'Aaron', 'Google UK English Male', 'Alex', 'Guy', 'Ryan']) || vs[0] || null;
    chr = best(['Samantha', 'Tessa', 'Karen', 'Moira', 'Serena', 'Google UK English Female', 'Aria', 'Zira'], narr) || vs.filter(function (v) { return v !== narr; })[0] || narr;
  }
  pick();
  if (ss.addEventListener) ss.addEventListener('voiceschanged', pick);

  function vh() { return window.innerHeight || document.documentElement.clientHeight; }
  function inView(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh() - 70; }
  function inBand(el) { var r = el.getBoundingClientRect(), h = vh(); return r.top > h * 0.15 && r.bottom < h * 0.72; }
  function updJump() {
    var b = list[i];
    jump.classList.toggle('on', !!(playing && !follow && b && !inView(b.el)));
  }
  function goHere() {
    var b = list[i]; if (!b) return;
    try { b.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
  }
  function mark(on) {
    var b = list[i]; if (!b) return;
    if (on) {
      b.el.classList.add('rd');
      // only chase the voice if the reader has not scrolled away, and only when the line is leaving the comfortable zone
      if (follow && !inBand(b.el)) goHere();
      updJump();
    } else b.el.classList.remove('rd');
  }
  function say() {
    if (!playing) return;
    if (i >= list.length) { stopAll(true); return; }
    var my = ++tok, b = list[i];
    mark(true);
    var u = new SpeechSynthesisUtterance(b.text);
    if (b.type === 'dlg') { u.voice = chr; u.pitch = flip ? 1.12 : 0.9; flip = !flip; u.rate = rate() * 1.03; }
    else if (b.type === 'head') { u.voice = narr; u.pitch = 0.85; u.rate = rate() * 0.9; flip = false; }
    else { u.voice = narr; u.pitch = 1; u.rate = rate(); flip = false; }
    if (u.voice) u.lang = u.voice.lang;
    u.onend = function () { if (playing && my === tok) { mark(false); i++; say(); } };
    u.onerror = function (e) { if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; if (playing && my === tok) { mark(false); i++; say(); } };
    ss.speak(u);
  }
  function wake(on) {
    try {
      if (on && navigator.wakeLock && !lock) navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {});
      if (!on && lock) { lock.release(); lock = null; }
    } catch (e) {}
  }
  function play() {
    if (!list.length) build();
    if (!list.length) return;
    follow = true;
    if (i === 0 || i >= list.length || !inView(list[i].el)) {
      i = 0;
      for (var k = 0; k < list.length; k++) { if (list[k].el.getBoundingClientRect().bottom > 90) { i = k; break; } }
    }
    playing = true; tok++; ss.cancel(); bp.innerHTML = '&#9208; Pause'; wake(true);
    setTimeout(say, 80);
  }
  function pause() { playing = false; follow = true; jump.classList.remove('on'); tok++; ss.cancel(); bp.innerHTML = '&#127911; Listen'; wake(false); mark(false); }
  function stopAll(done) { playing = false; follow = true; jump.classList.remove('on'); tok++; ss.cancel(); mark(false); if (done) i = 0; bp.innerHTML = '&#127911; Listen'; wake(false); }

  bp.addEventListener('click', function () { if (playing) pause(); else play(); });
  bn.addEventListener('click', function () { if (!list.length) build(); follow = true; mark(false); i = Math.min(list.length - 1, i + 1); if (playing) { tok++; ss.cancel(); setTimeout(say, 60); } else play(); });
  bb.addEventListener('click', function () { if (!list.length) build(); follow = true; mark(false); i = Math.max(0, i - 1); if (playing) { tok++; ss.cancel(); setTimeout(say, 60); } else play(); });
  bs.addEventListener('click', function () {
    si = (si + 1) % SPEEDS.length; showRate();
    try { localStorage.setItem('vrate', String(SPEEDS[si])); } catch (e) {}
    if (playing) { tok++; ss.cancel(); setTimeout(say, 60); }
  });
  // Free scrolling: any touch-drag, wheel or scroll key while it is reading stops the screen from chasing the voice.
  function manual() { if (playing && follow) follow = false; updJump(); }
  window.addEventListener('touchmove', manual, { passive: true });
  window.addEventListener('wheel', manual, { passive: true });
  window.addEventListener('keydown', function (e) { if ([32, 33, 34, 35, 36, 38, 40].indexOf(e.keyCode) > -1) manual(); });
  window.addEventListener('scroll', function () { if (!follow) updJump(); }, { passive: true });
  jump.addEventListener('click', function () { follow = true; goHere(); jump.classList.remove('on'); });
  window.addEventListener('message', function (e) { if (e.origin === location.origin && e.data === 'stop') stopAll(false); });
  window.addEventListener('pagehide', function () { ss.cancel(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && playing) pause(); });
})();
