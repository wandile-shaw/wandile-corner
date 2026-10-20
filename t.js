/* Anonymous visit counter for wandile-corner. No IP addresses, no cookies. */
(function () {
  try { if (localStorage.getItem('wignore') === '1') return; } catch (e) {}
  var API = 'https://eclipse-ratings.wandile-shaw.workers.dev/hit';
  var sc = document.currentScript || document.querySelector('script[data-page]');
  var page = (sc && sc.getAttribute('data-page')) || 'home';
  function rid() { return String(Date.now()) + Math.random().toString(36).slice(2, 10); }
  var vid;
  try {
    vid = localStorage.getItem('wid');
    if (!vid) { vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : rid(); localStorage.setItem('wid', vid); }
  } catch (e) { vid = rid(); }
  var ua = navigator.userAgent;
  var dev = /iPhone|iPod/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mobile/.test(ua) ? 'Mobile' : 'Desktop';
  var src = null;
  try { src = sessionStorage.getItem('wsrc'); } catch (e) {}
  if (!src) {
    src = 'Direct';
    if (/musical_ly|TikTok|Bytedance/i.test(ua)) src = 'TikTok';
    else if (/Instagram/i.test(ua)) src = 'Instagram';
    else if (/FBAN|FBAV|Facebook/i.test(ua)) src = 'Facebook';
    else if (/WhatsApp/i.test(ua)) src = 'WhatsApp';
    else {
      try {
        var h = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (h && h !== location.hostname) src = h.slice(0, 24);
      } catch (e) {}
    }
    try { sessionStorage.setItem('wsrc', src); } catch (e) {}
  }
  function send(o) {
    o.vid = vid; o.page = page; o.dev = dev; o.src = src;
    try {
      fetch(API, { method: 'POST', body: JSON.stringify(o), keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
    } catch (e) {}
  }
  window.__eclSend = send;
  send({ ev: 'view' });
  setInterval(function () { if (document.visibilityState === 'visible') send({ hb: 1, ev: 'hb' }); }, page.indexOf('ep') === 0 ? 20000 : 30000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') send({ hb: 1, ev: 'hb' }); });
  document.addEventListener('click', function (e) {
    var t = e.target, ev = null;
    if (!t || !t.closest) return;
    if (t.closest('#lw')) ev = 'logo';
    else {
      var a = t.closest('a');
      if (a) {
        var h2 = a.getAttribute('href') || '';
        if (h2.indexOf('instagram.com') > -1) ev = 'ig';
        else if (h2.indexOf('tiktok.com') > -1) ev = 'tiktok';
        else if (h2.indexOf('chat.whatsapp.com') > -1) ev = 'shein';
        else if (h2.indexOf('mailto:') === 0) ev = 'mail';
        else if (a.classList.contains('hero')) ev = 'eclipse';
      }
    }
    if (ev) send({ ev: ev });
  }, true);
})();
