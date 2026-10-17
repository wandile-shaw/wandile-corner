/* Eclipse reader tools: search, listen (phone voice or real audio), resume. Nothing is uploaded anywhere. */
(function () {
  var main = document.querySelector('main');
  if (!main) return;
  var sc = document.querySelector('script[data-page]');
  var pageId = (sc && sc.getAttribute('data-page')) || 'ep';
  var num = (pageId.match(/\d+/) || ['1'])[0];
  function $(i) { return document.getElementById(i); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.rd{background:rgba(127,176,255,.15);box-shadow:-10px 0 0 rgba(127,176,255,.15),10px 0 0 rgba(127,176,255,.15);border-radius:4px}' +
    'mark.sr{background:rgba(255,198,92,.35);color:inherit;border-radius:3px;padding:0 1px}mark.sr.cur{background:#ffc65c;color:#02040a}' +
    '#vf,#sf{position:fixed;z-index:40;width:44px;height:44px;border-radius:50%;border:1px solid rgba(88,178,255,.5);background:rgba(8,13,32,.78);color:#e6eeff;font:20px system-ui,sans-serif;display:grid;place-items:center;padding:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);-webkit-tap-highlight-color:transparent;box-shadow:0 4px 14px rgba(0,0,0,.5)}' +
    '#vf{right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);opacity:.82}' +
    '#vf.on{opacity:1;animation:vpulse 1.8s ease-in-out infinite}@keyframes vpulse{50%{box-shadow:0 0 0 6px rgba(88,178,255,.25),0 4px 14px rgba(0,0,0,.5)}}' +
    '#sf{right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);width:38px;height:38px;font-size:17px;opacity:.78}' +
    '#vr{position:fixed;z-index:41;right:64px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);display:none;align-items:center;gap:2px;height:44px;padding:0 6px;border-radius:999px;background:rgba(8,13,32,.94);border:1px solid rgba(88,178,255,.5);box-shadow:0 6px 18px rgba(0,0,0,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}' +
    '#vr.open{display:flex}' +
    '#vr button{font:600 14px system-ui,sans-serif;color:#e6eeff;background:transparent;border:0;border-radius:999px;height:36px;min-width:36px;padding:0 6px;-webkit-tap-highlight-color:transparent}' +
    '#vr button:active{background:rgba(88,178,255,.25)}#vr #vp{background:#1b3a7a;min-width:40px}' +
    '#vt{position:fixed;z-index:42;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 66px);max-width:70vw;padding:6px 12px;border-radius:12px;background:rgba(8,13,32,.95);border:1px solid rgba(88,178,255,.4);font:12px system-ui,sans-serif;color:#cfe0ff;opacity:0;pointer-events:none;transition:opacity .25s}' +
    '#vt.show{opacity:1}' +
    '#sr{position:fixed;z-index:46;left:0;right:0;top:0;display:none;align-items:center;gap:6px;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 8px;background:rgba(5,8,22,.97);border-bottom:1px solid #1f2c5c}' +
    '#sr.open{display:flex}#sq{flex:1;min-width:0;font:16px system-ui,sans-serif;color:#e6eeff;background:#0d1430;border:1px solid rgba(88,178,255,.4);border-radius:10px;padding:9px 12px}' +
    '#sc{font:12px system-ui,sans-serif;color:#8d9bc4;min-width:38px;text-align:center}' +
    '#sr button{font:600 15px system-ui,sans-serif;color:#e6eeff;background:#0d1430;border:1px solid rgba(88,178,255,.4);border-radius:10px;width:38px;height:38px;padding:0}' +
    '#vc{position:fixed;z-index:43;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 56px);padding:9px 16px;border-radius:999px;background:#1b3a7a;border:1px solid rgba(88,178,255,.6);color:#fff;font:600 13px system-ui,sans-serif;display:none;box-shadow:0 6px 18px rgba(0,0,0,.6)}' +
    '#vc.show{display:block}' +
    '#vj{position:fixed;z-index:43;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 74px);padding:9px 16px;border-radius:999px;background:#1b3a7a;border:1px solid rgba(88,178,255,.6);color:#fff;font:600 13px system-ui,sans-serif;display:none;box-shadow:0 6px 18px rgba(0,0,0,.6)}#vj.show{display:block}' +
    '.endbox{margin:48px 0 14px;padding:22px 16px;border:1px solid #1f2c5c;border-radius:16px;background:linear-gradient(145deg,#13224f,#0d1430);text-align:center;font-family:system-ui,sans-serif;color:#dbe3f5}' +
    '.endbox h4{margin:0 0 10px;font-size:16px;letter-spacing:.04em;color:#fff}' +
    '.eb-stars{display:flex;justify-content:center;gap:4px}.eb-stars button{background:none;border:0;font-size:36px;line-height:1;color:#2a3a6e;padding:4px;-webkit-tap-highlight-color:transparent;transition:transform .15s,color .15s}.eb-stars button.on{color:#ffc65c;text-shadow:0 0 12px rgba(255,190,70,.7)}.eb-stars button:active{transform:scale(1.2)}' +
    '.eb-m{margin:6px 0 14px;font-size:13px;color:#8d9bc4}' +
    '.eb-share{font:600 14px system-ui,sans-serif;color:#fff;background:#1b3a7a;border:1px solid rgba(88,178,255,.5);border-radius:12px;padding:11px 18px;margin-bottom:16px}' +
    '.eb-n{margin:6px 0;font-size:14px;color:#cfe0ff}.eb-go,.eb-cal{display:inline-block;margin-top:6px;font:600 14px system-ui,sans-serif;color:#7fb0ff;text-decoration:none}';
  document.head.appendChild(css);
  var css2 = document.createElement('style');
  css2.textContent = '.prev{margin:30px 0 0;padding:16px 18px;border-left:3px solid #7fb0ff;background:rgba(127,176,255,.07);border-radius:0 12px 12px 0;font:15px/1.65 Georgia,serif;color:#c3d0ee}.prev b{display:block;margin-bottom:6px;font:600 11px system-ui,sans-serif;letter-spacing:.25em;text-transform:uppercase;color:#7fb0ff}.prev p{margin:0}';
  document.head.appendChild(css2);

  /* ---------- DOM ---------- */
  var ui = document.createElement('div');
  ui.innerHTML =
    '<button id="sf" type="button" aria-label="Search this episode">&#128269;</button>' +
    '<div id="sr"><input id="sq" type="search" placeholder="Search this episode" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false"><span id="sc"></span><button id="sp" type="button" aria-label="Previous">&#9650;</button><button id="sn" type="button" aria-label="Next">&#9660;</button><button id="sx" type="button" aria-label="Close">&#10005;</button></div>' +
    '<button id="vc" type="button">&#8617; Continue where you left off</button>' +
    '<button id="vj" type="button">&#8615; Back to where it\'s reading</button>' +
    '<div id="vt"></div>' +
    '<div id="vr"><button id="vb" type="button" aria-label="Back">&#9198;</button><button id="vp" type="button" aria-label="Play or pause">&#9654;</button><button id="vn" type="button" aria-label="Forward">&#9197;</button><button id="vs" type="button" aria-label="Speed">1&times;</button><button id="vv" type="button" aria-label="Change voice">&#128483;</button><button id="vz" type="button" aria-label="Stop" style="display:none">&#9209;</button></div>' +
    '<button id="vf" type="button" aria-label="Listen">&#127911;</button>';
  while (ui.firstChild) document.body.appendChild(ui.firstChild);

  /* ---------- toast ---------- */
  var tt = null;
  function toast(t) { var e = $('vt'); e.textContent = t; e.className = 'show'; clearTimeout(tt); tt = setTimeout(function () { e.className = ''; }, 2200); }

  /* ================= SEARCH ================= */
  var hits = [], cur = -1;
  function clearMarks() {
    var ms = main.querySelectorAll('mark.sr');
    for (var i = 0; i < ms.length; i++) { var p = ms[i].parentNode; p.replaceChild(document.createTextNode(ms[i].textContent), ms[i]); p.normalize(); }
    hits = []; cur = -1;
  }
  function find(q) {
    clearMarks(); $('sc').textContent = '';
    if (!q || q.length < 2) return;
    var esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['\u2019]/g, "['\u2019]");
    var re = new RegExp(esc, 'gi');
    var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { var p = n.parentNode; return (!p || /^(SCRIPT|STYLE)$/.test(p.nodeName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var nodes = [], n; while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      var txt = t.nodeValue, m, last = 0, frag = null; re.lastIndex = 0;
      while ((m = re.exec(txt))) {
        if (!frag) frag = document.createDocumentFragment();
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var mk = document.createElement('mark'); mk.className = 'sr'; mk.textContent = m[0]; frag.appendChild(mk); hits.push(mk);
        last = m.index + m[0].length; if (!m[0].length) re.lastIndex++;
      }
      if (frag) { if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last))); t.parentNode.replaceChild(frag, t); }
    });
    if (hits.length) go(0); else $('sc').textContent = '0';
  }
  function go(i) {
    if (!hits.length) return;
    if (cur >= 0 && hits[cur]) hits[cur].classList.remove('cur');
    cur = (i + hits.length) % hits.length;
    hits[cur].classList.add('cur');
    $('sc').textContent = (cur + 1) + '/' + hits.length;
    try { hits[cur].scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
  }
  function openSearch() { $('sr').className = 'open'; setTimeout(function () { $('sq').focus(); }, 60); }
  function closeSearch() { $('sr').className = ''; $('sq').blur(); clearMarks(); $('sq').value = ''; $('sc').textContent = ''; }
  $('sf').addEventListener('click', function () { if ($('sr').className === 'open') closeSearch(); else openSearch(); });
  $('sx').addEventListener('click', closeSearch);
  $('sn').addEventListener('click', function () { go(cur + 1); });
  $('sp').addEventListener('click', function () { go(cur - 1); });
  $('sq').addEventListener('input', function () { find(this.value.trim()); });
  $('sq').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? cur - 1 : cur + 1); this.blur(); } });

  /* ================= RESUME ================= */
  var posKey = 'ecl-pos-' + pageId, saveT = null;
  window.addEventListener('scroll', function () { clearTimeout(saveT); saveT = setTimeout(function () { ls(posKey, String(Math.round(window.pageYOffset))); }, 500); }, { passive: true });
  var saved = parseInt(ls(posKey) || '0', 10);
  if (saved > 700) {
    setTimeout(function () {
      if (window.pageYOffset > 200) return;
      var c = $('vc'); c.className = 'show';
      c.addEventListener('click', function () { c.className = ''; window.scrollTo({ top: saved, behavior: 'smooth' }); });
      setTimeout(function () { c.className = ''; }, 9000);
    }, 700);
  }

  /* ================= LISTEN ================= */
  var pill = $('vr'), fab = $('vf'), bp = $('vp'), bs = $('vs'), bv = $('vv'), bz = $('vz');
  var SPEEDS = [1, 1.15, 1.3, 0.9], si = Math.max(0, SPEEDS.indexOf(parseFloat(ls('vrate'))));
  function rate() { return SPEEDS[si]; }
  function showRate() { bs.textContent = SPEEDS[si] + '\u00d7'; }
  showRate();
  var pt = null;
  function openPill() { pill.className = 'open'; keepPill(); }
  function closePill() { pill.className = ''; }
  function keepPill() { clearTimeout(pt); pt = setTimeout(closePill, 6500); }
  fab.addEventListener('click', function () { if (pill.className === 'open') closePill(); else openPill(); });
  pill.addEventListener('click', keepPill);

  var mode = 'voice';            // 'voice' (phone voice) or 'audio' (real recording, plays in the background)
  var playing = false;

  /* ---- real audio (optional): put eclipse/audio/episode-N.mp3 on the site ---- */
  var audio = null, AURL = 'audio/episode-' + num + '.mp3', audKey = 'ecl-aud-' + num;
  try {
    fetch(AURL, { method: 'HEAD' }).then(function (r) {
      var ct = r.headers.get('content-type') || '';
      if (r.ok && /audio|octet-stream|mpeg/i.test(ct)) { mode = 'audio'; bv.style.display = 'none'; bz.style.display = ''; }
    }).catch(function () {});
  } catch (e) {}
  function msSet() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: 'Eclipse \u00b7 Episode ' + num, artist: 'Wandile Shaw', album: 'Eclipse', artwork: [{ src: '/eclipse/p0.jpg', sizes: '1536x1024', type: 'image/jpeg' }] });
    var h = function (a, f) { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) {} };
    h('play', function () { audPlay(); });
    h('pause', function () { audPause(); });
    h('seekbackward', function () { audio.currentTime = Math.max(0, audio.currentTime - 15); });
    h('seekforward', function () { audio.currentTime = Math.min(audio.duration || 1e9, audio.currentTime + 30); });
    h('stop', function () { audStop(); });
  }
  function audPlay() {
    if (!audio) {
      audio = new Audio(); audio.preload = 'metadata'; audio.src = AURL;
      var t0 = parseFloat(ls(audKey) || '0'); if (t0 > 3) audio.addEventListener('loadedmetadata', function () { try { audio.currentTime = t0 - 2; } catch (e) {} }, { once: true });
      audio.addEventListener('timeupdate', function () { if (Math.round(audio.currentTime) % 5 === 0) ls(audKey, String(audio.currentTime)); });
      audio.addEventListener('ended', function () { ls(audKey, '0'); audStop(); });
      audio.addEventListener('pause', function () { if (playing) { playing = false; paint(); } });
      audio.addEventListener('play', function () { playing = true; paint(); });
    }
    audio.playbackRate = rate(); msSet();
    audio.play().catch(function () { toast('Tap play again'); });
    playing = true; paint();
  }
  function audPause() { if (audio) audio.pause(); playing = false; paint(); }
  function audStop() {
    if (audio) { ls(audKey, String(audio.currentTime || 0)); audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
    playing = false; paint();
    try { if ('mediaSession' in navigator) { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = 'none'; } } catch (e) {}
  }

  /* ---- phone voice ---- */
  var ss = ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') ? window.speechSynthesis : null;
  if (!ss) { bv.style.display = 'none'; }
  var follow = true, jumped = false, list = [], bi = 0, si2 = 0, tok = 0, flip = false, narr = null, chr = null, cands = [], vIdx = 0, lock = null, wt = null;
  var MALE = ['Daniel', 'Oliver', 'Arthur', 'Aaron', 'Evan', 'Nathan', 'Tom', 'Guy', 'Ryan', 'Alex', 'Rishi', 'Google UK English Male'];
  var FEM = ['Samantha', 'Ava', 'Zoe', 'Allison', 'Susan', 'Karen', 'Moira', 'Tessa', 'Serena', 'Fiona', 'Aria', 'Jenny', 'Zira', 'Nicky', 'Google UK English Female'];
  function quality(v) { var s = 0, n = v.name; if (/premium/i.test(n)) s += 60; if (/enhanced/i.test(n)) s += 40; if (/siri/i.test(n)) s += 50; if (/neural|natural|online/i.test(n)) s += 60; if (v.localService) s += 5; return s; }
  function has(v, names) { for (var i = 0; i < names.length; i++) if (v.name.indexOf(names[i]) > -1) return true; return false; }
  function pick() {
    if (!ss) return;
    var vs = ss.getVoices().filter(function (v) { return /^en/i.test(v.lang); });
    if (!vs.length) return;
    cands = vs.slice().sort(function (a, b) { return (quality(b) + (has(b, MALE) ? 15 : 0)) - (quality(a) + (has(a, MALE) ? 15 : 0)); });
    var saved = ls('vrvoice'), k = -1;
    for (var i = 0; i < cands.length; i++) if (cands[i].name === saved) k = i;
    vIdx = k >= 0 ? k : 0; narr = cands[vIdx];
    var rest = vs.filter(function (v) { return v !== narr; }).sort(function (a, b) { return (quality(b) + (has(b, FEM) ? 15 : 0)) - (quality(a) + (has(a, FEM) ? 15 : 0)); });
    chr = rest[0] || narr;
  }
  pick(); if (ss && ss.addEventListener) ss.addEventListener('voiceschanged', pick);
  bv.addEventListener('click', function () {
    if (!cands.length) { toast('No voices found on this phone'); return; }
    vIdx = (vIdx + 1) % Math.min(cands.length, 8); narr = cands[vIdx]; ls('vrvoice', narr.name);
    var rest = cands.filter(function (v) { return v !== narr; }); chr = rest[0] || narr;
    toast('Voice: ' + narr.name);
    if (playing) { tok++; ss.cancel(); setTimeout(speak, 60); }
  });

  function splitSentences(t) {
    var parts = t.match(/[^.!?\u2026]+(?:[.!?\u2026]+["\u201d\u2019')]*|$)/g) || [t];
    var out = [], buf = '';
    parts.forEach(function (p) { buf += p; if (buf.replace(/\s/g, '').length > 24) { out.push(buf.trim()); buf = ''; } });
    if (buf.trim()) { if (out.length) out[out.length - 1] += ' ' + buf.trim(); else out.push(buf.trim()); }
    return out;
  }
  function build() {
    list = [];
    var els = main.querySelectorAll('h2,h3,p,.msg,.doc,li');
    for (var k = 0; k < els.length; k++) {
      var el = els[k];
      if (el.closest('nav') || el.closest('.endbox') || el.classList.contains('back')) continue;
      var tx, type = 'narr';
      if (el.classList.contains('msg')) {
        var sm = el.querySelector('small'), who = sm ? sm.textContent.trim() : '';
        tx = (who ? who + ' says. ' : '') + el.textContent.replace(who, '').trim(); type = 'dlg';
      } else {
        tx = el.textContent.replace(/\s+/g, ' ').trim();
        if (el.tagName === 'H2' || el.tagName === 'H3') type = 'head';
        else if (/^[\u201c"]/.test(tx)) type = 'dlg';
      }
      tx = tx.replace(/\u00b7/g, ',').replace(/\s*\u2014\s*/g, ', ').replace(/[\u2605\u2606]/g, '');
      if (tx.length > 1) list.push({ el: el, text: tx, type: type, s: type === 'head' ? [tx] : splitSentences(tx) });
    }
  }
  function mark(on) { var b = list[bi]; if (!b) return; if (on) { b.el.classList.add('rd'); if (follow) { try { b.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} } } else b.el.classList.remove('rd'); }
  function speak() {
    if (!playing || mode !== 'voice') return;
    if (bi >= list.length) { stopVoice(true); return; }
    var my = ++tok, b = list[bi], text = b.s[si2];
    if (si2 === 0 || jumped) { mark(true); jumped = false; }
    var u = new SpeechSynthesisUtterance(text), r = rate();
    if (b.type === 'dlg') { u.voice = chr; u.pitch = flip ? 1.07 : 0.95; u.rate = r * 1.0; if (si2 === b.s.length - 1) flip = !flip; }
    else if (b.type === 'head') { u.voice = narr; u.pitch = 0.92; u.rate = r * 0.88; flip = false; }
    else { u.voice = narr; u.pitch = 1; u.rate = r * 0.97; flip = false; }
    var q = text.slice(-1); if (q === '?') u.pitch += 0.04; if (q === '!') u.rate *= 1.03;
    if (u.voice) u.lang = u.voice.lang;
    function next() {
      if (!(playing && my === tok)) return;
      var gap;
      if (si2 < b.s.length - 1) { si2++; gap = 140; }
      else { mark(false); bi++; si2 = 0; gap = b.type === 'head' ? 650 : (b.type === 'dlg' ? 260 : 420); }
      clearTimeout(wt); wt = setTimeout(speak, gap / r);
    }
    u.onend = next;
    u.onerror = function (e) { if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; next(); };
    ss.speak(u);
  }
  function wake(on) {
    try {
      if (on && navigator.wakeLock && !lock) navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {});
      if (!on && lock) { lock.release(); lock = null; }
    } catch (e) {}
  }
  function playVoice() {
    if (!ss) { toast('Voice is not available here'); return; }
    if (!list.length) build(); if (!list.length) return;
    if (bi === 0 && si2 === 0 || bi >= list.length) { bi = 0; for (var k = 0; k < list.length; k++) { if (list[k].el.getBoundingClientRect().bottom > 90) { bi = k; break; } } si2 = 0; }
    follow = true; playing = true; tok++; ss.cancel(); wake(true); paint(); setTimeout(speak, 80);
    if (ls('vrtip') !== '1') { ls('vrtip', '1'); setTimeout(function () { toast('Tip: tap any line to read from there'); }, 600); }
  }
  function pauseVoice() { playing = false; tok++; clearTimeout(wt); if (ss) ss.cancel(); wake(false); mark(false); paint(); }
  function stopVoice(done) { pauseVoice(); if (done) { bi = 0; si2 = 0; } }

  function syncChip() { var j = $('vj'); if (j) j.className = (playing && !follow && mode === 'voice') ? 'show' : ''; }
  function paint() { bp.innerHTML = playing ? '&#9208;' : '&#9654;'; fab.className = playing ? 'on' : ''; fab.setAttribute('aria-label', playing ? 'Listening' : 'Listen'); syncChip(); }
  bp.addEventListener('click', function () {
    if (mode === 'audio') { if (playing) audPause(); else audPlay(); }
    else { if (playing) pauseVoice(); else playVoice(); }
  });
  function step(d) {
    if (mode === 'audio') { if (!audio) audPlay(); if (audio) audio.currentTime = Math.max(0, audio.currentTime + (d > 0 ? 30 : -15)); return; }
    if (!list.length) build(); mark(false); follow = true; bi = Math.min(list.length - 1, Math.max(0, bi + d)); si2 = 0;
    if (playing) { tok++; ss.cancel(); clearTimeout(wt); setTimeout(speak, 60); } else playVoice();
  }
  $('vn').addEventListener('click', function () { step(1); });
  $('vb').addEventListener('click', function () { step(-1); });
  bz.addEventListener('click', function () { if (mode === 'audio') audStop(); else stopVoice(false); closePill(); });
  bs.addEventListener('click', function () {
    si = (si + 1) % SPEEDS.length; showRate(); ls('vrate', String(SPEEDS[si]));
    if (mode === 'audio' && audio) audio.playbackRate = rate();
    else if (playing && ss) { tok++; ss.cancel(); clearTimeout(wt); setTimeout(speak, 60); }
  });
  window.addEventListener('message', function (e) { if (e.origin === location.origin && e.data === 'stop') { if (mode === 'audio') audStop(); else stopVoice(false); } });
  window.addEventListener('pagehide', function () { if (ss) ss.cancel(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && playing && mode === 'voice') pauseVoice(); });
  /* while listening, tap any line to start reading from there */
  main.addEventListener('click', function (e) {
    if (!(playing && mode === 'voice' && ss)) return;
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('a,button,input,nav,.back,.endbox')) return;
    var sel = window.getSelection && window.getSelection(); if (sel && String(sel).length > 0) return;
    var el = t.closest('h2,h3,p,.msg,.doc,li'); if (!el) return;
    var k = -1, i;
    for (i = 0; i < list.length; i++) { if (list[i].el === el || list[i].el.contains(t)) { k = i; break; } }
    if (k < 0) return;
    var b = list[k], sIdx = 0;
    try {
      var pos = null;
      if (document.caretRangeFromPoint) pos = document.caretRangeFromPoint(e.clientX, e.clientY);
      else if (document.caretPositionFromPoint) { var cp = document.caretPositionFromPoint(e.clientX, e.clientY); if (cp) { pos = document.createRange(); pos.setStart(cp.offsetNode, cp.offset); } }
      if (pos) {
        var r = document.createRange(); r.selectNodeContents(el); r.setEnd(pos.startContainer, pos.startOffset);
        var frac = Math.min(1, r.toString().length / Math.max(1, el.textContent.length)), acc = 0, total = b.s.join(' ').length;
        for (i = 0; i < b.s.length; i++) { acc += b.s[i].length + 1; sIdx = i; if (acc / total > frac) break; }
      }
    } catch (x) {}
    mark(false); follow = true; bi = k; si2 = sIdx; jumped = true; tok++; clearTimeout(wt); ss.cancel(); toast('Reading from here'); setTimeout(speak, 60);
  });

  /* ---- you can scroll while it reads: auto-follow turns off when you scroll ---- */
  function onUserScroll() { if (playing && mode === 'voice' && follow) { follow = false; syncChip(); } }
  window.addEventListener('touchmove', onUserScroll, { passive: true });
  window.addEventListener('wheel', onUserScroll, { passive: true });
  $('vj').addEventListener('click', function () {
    follow = true; syncChip();
    var b = list[bi]; if (b) { try { b.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }
  });

  /* ---- end of episode: rating, share, next episode + anonymous completion tracking ---- */
  (function () {
    var T3 = Date.UTC(2026, 9, 16, 22, 0, 0), T4 = Date.UTC(2026, 9, 22, 22, 0, 0);
    var NEXT = { 1: { n: 2, t: 0 }, 2: { n: 3, t: T3, label: 'Saturday 12:00 AM', ics: 'episode-3.ics' }, 3: { n: 4, t: T4, label: 'Friday 12:00 AM', ics: 'episode-4.ics' } };
    var nx = NEXT[num], box = document.createElement('section'), nextHtml;
    box.className = 'endbox';
    if (!nx) nextHtml = '<p class="eb-n">The next episode is coming soon.</p>';
    else if (Date.now() >= nx.t) nextHtml = '<a class="eb-go" href="episode-' + nx.n + '.html">Read Episode ' + nx.n + ' &rarr;</a>';
    else nextHtml = '<p class="eb-n">Episode ' + nx.n + ' drops <b>' + nx.label + '</b> (Zambia time)</p><a class="eb-cal" href="' + nx.ics + '">&#128276; Add to calendar</a>';
    box.innerHTML = '<h4>How was Episode ' + num + '?</h4><div class="eb-stars">' +
      [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-s="' + i + '" aria-label="' + i + ' stars">&#9733;</button>'; }).join('') +
      '</div><p class="eb-m">Tap a star to rate</p><button type="button" class="eb-share">&#128228; Share Eclipse</button>' + nextHtml;
    var tail = main.querySelector('p.back[style]'); if (tail) main.insertBefore(box, tail); else main.appendChild(box);

    function send(o) { try { if (window.__eclSend) window.__eclSend(o); } catch (e) {} }
    var sts = box.querySelectorAll('.eb-stars button'), msg = box.querySelector('.eb-m'), key = 'ecl-rate-' + num, mine = parseInt(ls(key) || '0', 10);
    function paintStars(n) { for (var i = 0; i < sts.length; i++) sts[i].className = i < n ? 'on' : ''; }
    if (mine) { paintStars(mine); msg.textContent = 'Thanks! You rated this ' + mine + ' \u2605'; }
    for (var i = 0; i < sts.length; i++) sts[i].addEventListener('click', function () {
      if (mine) return;
      mine = parseInt(this.getAttribute('data-s'), 10); ls(key, String(mine)); paintStars(mine);
      msg.textContent = 'Thanks! You rated this ' + mine + ' \u2605'; send({ ev: 'r' + num + 's' + mine });
    });
    box.querySelector('.eb-share').addEventListener('click', function () {
      var url = location.origin + '/eclipse/', data = { title: 'Eclipse', text: 'I am reading Eclipse, an illustrated superhero novel by Wandile Shaw.', url: url };
      if (navigator.share) { navigator.share(data).catch(function () {}); }
      else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { toast('Link copied'); }).catch(function () { toast(url); }); }
      else toast(url);
      send({ ev: 'sh' + num });
    });

    var seen = {};
    function track(ev) { if (seen[ev]) return; seen[ev] = 1; send({ ev: ev }); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var t = en.target, id = t.id, m = id && id.match(/^c(\d+)$/);
          if (m) track(pageId + 'c' + m[1]); else if (id === 'cold') track(pageId + 'c0'); else if (id === 'post') track(pageId + 'cp'); else if (t === box) track(pageId + 'done');
        });
      }, { threshold: 0.35 });
      var hs = main.querySelectorAll('h2[id]'); for (var j = 0; j < hs.length; j++) io.observe(hs[j]);
      io.observe(box);
    }
  })();
  window.__eclSplit = splitSentences;
})();
