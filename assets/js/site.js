/* Paradise Matrix — site behaviour */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- header */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.nav-primary a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Mark the current page in the nav */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-primary .nav-link').forEach(function (link) {
    var target = link.getAttribute('href');
    if (target === here) link.classList.add('is-current');
  });

  /* --------------------------------------------------------- scroll reveal */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = parseInt(entry.target.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(function () { entry.target.classList.add('is-in'); }, delay);
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------- number counters */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
      if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
      var start = performance.now();
      var dur = 1400;
      var step = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          run(e.target);
          co.unobserve(e.target);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    } else {
      counters.forEach(run);
    }
  }

  /* ------------------------------------------------------------- accordion */
  document.querySelectorAll('.vertical__head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = head.closest('.vertical');
      var open = item.classList.contains('is-open');
      var group = item.parentElement;
      group.querySelectorAll('.vertical').forEach(function (v) {
        v.classList.remove('is-open');
        var b = v.querySelector('.vertical__head');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ------------------------------------------------------- hero background */
  var canvas = document.querySelector('.hero__canvas');
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pointer = { x: -9999, y: -9999 };

    function resize() {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var density = Math.round((w * h) / 19000);
      var count = Math.max(34, Math.min(density, 128));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.5 + 0.5
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 20000) {
            var a = (1 - d2 / 20000) * 0.22;
            ctx.strokeStyle = 'rgba(77,18,166,' + a.toFixed(3) + ')';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        var pdx = n.x - pointer.x, pdy = n.y - pointer.y;
        var pd2 = pdx * pdx + pdy * pdy;
        var near = pd2 < 32000;
        ctx.fillStyle = near ? 'rgba(214,0,28,.9)' : 'rgba(77,18,166,.45)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, near ? n.r * 1.7 : n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    canvas.parentElement.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', function () {
      pointer.x = pointer.y = -9999;
    });

    resize();
    requestAnimationFrame(frame);
  }

  /* The reCAPTCHA widget is a fixed 304x78 iframe. Scale it to the column it
     sits in so it never leaves a ragged gap beside the fields. */
  var CAPTCHA_W = 304, CAPTCHA_H = 78;

  function fitCaptchas() {
    document.querySelectorAll('[data-captcha-fit]').forEach(function (wrap) {
      var box = wrap.querySelector('.g-recaptcha');
      if (!box) return;
      var max = parseFloat(wrap.getAttribute('data-captcha-fit')) || 1;
      var avail = wrap.clientWidth;
      if (!avail) return;
      var scale = Math.min(avail / CAPTCHA_W, max);
      box.style.transform = 'scale(' + scale + ')';
      wrap.style.height = Math.ceil(CAPTCHA_H * scale) + 'px';
    });
  }

  if (document.querySelector('[data-captcha-fit]')) {
    fitCaptchas();
    /* the widget renders asynchronously, so re-fit once it appears */
    document.querySelectorAll('[data-captcha-fit]').forEach(function (wrap) {
      new MutationObserver(fitCaptchas).observe(wrap, { childList: true, subtree: true });
    });
    var fitTimer;
    window.addEventListener('resize', function () {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitCaptchas, 120);
    });
    window.addEventListener('load', fitCaptchas);
  }

  /* ----------------------------------------------- Salesforce lead forms */

  /* Shared client-side check. Salesforce needs last name, company and email
     on a Lead, and the reCAPTCHA has to be solved before the post is accepted. */
  function validateLead(form, ids) {
    var status = form.querySelector('.form-status');
    function fail(msg, focusEl) {
      if (status) { status.hidden = false; status.textContent = msg; }
      if (focusEl) focusEl.focus();
      return false;
    }
    var missing = ['last_name', 'company', 'email'].filter(function (n) {
      var el = form.querySelector('#' + ids[n]);
      return !el || !el.value.trim();
    });
    var mail = form.querySelector('#' + ids.email);
    var mailBad = mail && mail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value);

    if (missing.length) {
      return fail('Please complete your last name, company and email so we can reply.',
                  form.querySelector('#' + ids[missing[0]]));
    }
    if (mailBad) return fail('Please enter a valid email address.', mail);

    /* Only gate on the reCAPTCHA once the widget has actually rendered. If the
       script is blocked on the visitor's network the lead still goes through,
       which is what the fallback setting on the org is there for. */
    var box = form.querySelector('.g-recaptcha');
    var rendered = !!(window.grecaptcha && box && box.children.length);
    var cap = form.querySelector('[name="g-recaptcha-response"]');
    if (rendered && (!cap || !cap.value.trim())) {
      return fail('Please complete the reCAPTCHA check before sending.', box);
    }
    if (status) { status.hidden = true; status.textContent = ''; }
    return true;
  }

  /* ----------------------------------------------------- enquiry form */
  var sf = document.querySelector('[data-sf-form]');
  if (sf) {
    /* Prefill from a deep link, e.g. contact.html?i=Updates&email=someone@co.com */
    var qs = new URLSearchParams(location.search);
    var wanted = qs.get('i');
    if (wanted) {
      var sel = sf.querySelector('#purpose');
      if (sel) {
        Array.prototype.forEach.call(sel.options, function (o) {
          if (o.value.toLowerCase() === wanted.toLowerCase()) sel.value = o.value;
        });
      }
    }
    var qmail = qs.get('email');
    if (qmail && sf.querySelector('#email')) sf.querySelector('#email').value = qmail;
    if (wanted || qmail) {
      history.replaceState(null, '', location.pathname + location.hash);
    }

    sf.addEventListener('submit', function (e) {
      if (!validateLead(sf, { last_name: 'last_name', company: 'company', email: 'email' })) {
        e.preventDefault();
        return;
      }

      /* Carry the selected purpose and the mailing-list preference into the
         record Salesforce stores, so both survive regardless of field mapping. */
      var purpose = sf.querySelector('#purpose');
      var desc = sf.querySelector('#description');
      var optOut = sf.querySelector('#opt_out');
      var carrier = sf.querySelector('#emailOptOut');
      if (carrier) carrier.value = optOut && optOut.checked ? '1' : '0';

      if (desc) {
        var lines = [];
        if (purpose && purpose.value) lines.push('Enquiry type: ' + purpose.value);
        lines.push('Mailing list: ' + (optOut && optOut.checked ? 'opted out' : 'opted in'));
        var body = desc.value.trim();
        desc.value = lines.join('\n') + (body ? '\n\n' + body : '');
      }

      var status = sf.querySelector('.form-status');
      if (status) {
        status.hidden = false;
        status.textContent = 'Sending your enquiry…';
      }
    });
  }

  /* ------------------------------------------------- mailing list card */
  var sub = document.querySelector('[data-sub-form]');
  if (sub) {
    var card = sub.closest('[data-sub-card]');
    var sink = document.querySelector('[data-sub-sink]');
    var panelForm = card && card.querySelector('[data-sub-panel="form"]');
    var panelDone = card && card.querySelector('[data-sub-panel="done"]');
    var sent = false;

    /* The post is aimed at a hidden frame so the visitor stays on the page and
       gets the confirmation in place. */
    function showDone() {
      if (!sent || !panelForm || !panelDone) return;
      panelForm.hidden = true;
      panelDone.hidden = false;
      panelDone.focus();
    }
    if (sink) sink.addEventListener('load', function () { if (sent) showDone(); });

    sub.addEventListener('submit', function (e) {
      if (!validateLead(sub, { last_name: 'sub_last_name', company: 'sub_company', email: 'sub_email' })) {
        e.preventDefault();
        return;
      }
      var status = sub.querySelector('.form-status');
      if (status) {
        status.hidden = false;
        status.textContent = 'Signing you up…';
      }
      sent = true;
      /* Fall back to the confirmation even if the frame never reports a load. */
      setTimeout(showDone, 2500);
    });
  }

  /* ---------------------------------------------------------------- footer */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
