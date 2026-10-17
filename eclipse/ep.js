/* Eclipse reading-progress tracker.
   Sends r25, r50, r75 and r100 to your stats when a reader reaches that part of the episode. */
(function () {
  var main = document.querySelector('main');
  if (!main || !('IntersectionObserver' in window)) return;
  function track(ev) { try { if (window.__eclSend) window.__eclSend({ ev: ev }); } catch (e) {} }

  var lines = [].filter.call(main.querySelectorAll('p'), function (p) {
    return !p.classList.contains('back') && !p.classList.contains('end') && p.textContent.trim().length > 0;
  });
  if (lines.length < 8) return;

  var marks = [];
  [[0.25, 'r25'], [0.5, 'r50'], [0.75, 'r75']].forEach(function (m) {
    marks.push([lines[Math.min(lines.length - 1, Math.floor(lines.length * m[0]))], m[1]]);
  });
  marks.push([main.querySelector('.end') || lines[lines.length - 1], 'r100']);

  var sent = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var ev = e.target.getAttribute('data-ev');
      if (!ev || sent[ev]) return;
      sent[ev] = 1; track(ev); io.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  marks.forEach(function (m) { if (m[0]) { m[0].setAttribute('data-ev', m[1]); io.observe(m[0]); } });
})();
