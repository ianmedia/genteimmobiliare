/* La Gente Immobiliare — shared behaviors + Typeform-style lead form.
   Submits directly to an existing Contact Form 7 form on RE/MAX Abacus.
   If the direct send fails, hands the visitor off to the correct page on their site. */
(function () {
  "use strict";

  /* nav solid on scroll */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("solid", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* reveal on scroll */
  var rev = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Turnstile loader ---------- */
  var tsReady = false;
  function loadTurnstile(cb) {
    if (window.turnstile) { tsReady = true; cb(); return; }
    var ex = document.getElementById("cf-turnstile-js");
    if (ex) { ex.addEventListener("load", function () { tsReady = true; cb(); }); return; }
    var s = document.createElement("script");
    s.id = "cf-turnstile-js";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true; s.defer = true;
    s.addEventListener("load", function () { tsReady = true; cb(); });
    document.head.appendChild(s);
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var PRIVACY = "https://remax-abacus.com/privacy-policy/";

  function Lead(root, cfg) {
    var steps = cfg.steps;
    var total = steps.length + 1;
    var i = 0;
    var answers = {};
    var files = {};
    var accept = false;
    var token = "";
    var sending = false;

    var wrap = el("div", "lf");
    var prog = el("div", "lf-prog"); var progI = el("i"); prog.appendChild(progI);
    var stage = el("div", "lf-stage");
    wrap.appendChild(prog); wrap.appendChild(stage);
    root.innerHTML = ""; root.appendChild(wrap);

    function validStep(f) {
      if (!f) return false;
      if (f.kind === "file") return !!files[f.name];
      var v = answers[f.name];
      if (!v || !v.trim()) return false;
      if (f.kind === "text" && f.inputType === "email") return /.+@.+\..+/.test(v);
      if (f.kind === "text" && f.inputType === "tel") return v.replace(/\D/g, "").length >= 6;
      return true;
    }
    function setProg() {
      var isR = i === steps.length;
      var stepNo = Math.min(i + 1, total);
      var canN = isR ? accept : validStep(steps[i]);
      var pct = (isR ? total : (stepNo - 1 + (canN ? 1 : 0))) / total * 100;
      progI.style.width = Math.max(8, pct) + "%";
    }
    function go(n) { i = Math.max(0, Math.min(n, total - 1)); render(); }

    function render() {
      setProg();
      var isR = i === steps.length;
      var step = el("div", "lf-step");
      if (isR) { renderReview(step); }
      else { renderField(step, steps[i], Math.min(i + 1, total)); }
      stage.innerHTML = ""; stage.appendChild(step);
      requestAnimationFrame(function () { step.classList.add("on"); });
      var inp = step.querySelector("input[type=text],input[type=tel],input[type=email]");
      if (inp) inp.focus();
    }

    function navRow(step, primaryLabel, primaryFn, enabled, showHint) {
      var row = el("div", "lf-nav");
      if (i > 0) {
        var bk = el("button", "lf-btn lf-btn-ghost", "Indietro"); bk.type = "button";
        bk.onclick = function () { go(i - 1); };
        row.appendChild(bk);
      }
      if (primaryLabel) {
        var b = el("button", "lf-btn", primaryLabel); b.type = "button";
        b.disabled = !enabled; b.onclick = primaryFn;
        row.appendChild(b);
      }
      if (showHint) { row.appendChild(el("span", "lf-hint", 'premi <kbd>Invio</kbd>')); }
      step.appendChild(row);
    }

    function renderField(step, f, no) {
      step.appendChild(el("span", "lf-count", "Domanda " + no + " di " + total));
      step.appendChild(el("h3", "lf-q", esc(f.question)));
      if (f.help) step.appendChild(el("p", "lf-help", esc(f.help)));

      if (f.kind === "text") {
        var box = el("div", "lf-input");
        var input = document.createElement("input");
        input.type = f.inputType || "text";
        input.placeholder = f.placeholder || "Scrivi qui...";
        input.value = answers[f.name] || "";
        input.oninput = function () { answers[f.name] = input.value; var b = step.querySelector(".lf-nav .lf-btn:not(.lf-btn-ghost)"); if (b) b.disabled = !validStep(f); setProg(); };
        input.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); if (validStep(f)) go(i + 1); } };
        box.appendChild(input); step.appendChild(box);
        navRow(step, "Continua", function () { if (validStep(f)) go(i + 1); }, validStep(f), true);
      } else if (f.kind === "file") {
        var fb = el("div", "lf-file");
        var lab = el("label", "lf-filebox");
        var fin = document.createElement("input"); fin.type = "file"; if (f.accept) fin.accept = f.accept;
        var ico = el("span", "lf-file-ico"); ico.setAttribute("aria-hidden", "true");
        var txt = el("span", null, files[f.name] ? esc(files[f.name].name) : "Scegli un file dal tuo dispositivo");
        fin.onchange = function () { var file = fin.files && fin.files[0]; if (file) { files[f.name] = file; txt.textContent = file.name; var b = step.querySelector(".lf-nav .lf-btn:not(.lf-btn-ghost)"); if (b) b.disabled = false; setProg(); } };
        lab.appendChild(fin); lab.appendChild(ico); lab.appendChild(txt);
        fb.appendChild(lab); step.appendChild(fb);
        navRow(step, "Continua", function () { if (validStep(f)) go(i + 1); }, validStep(f), false);
      } else if (f.kind === "choice") {
        var ch = el("div", "lf-choices");
        f.options.forEach(function (o, k) {
          var btn = el("button", "lf-choice" + (answers[f.name] === o.value ? " sel" : "")); btn.type = "button";
          btn.innerHTML = '<span class="lf-choice-key">' + String.fromCharCode(65 + k) + '</span><span class="lf-choice-txt"><b>' + esc(o.value) + "</b>" + (o.desc ? "<small>" + esc(o.desc) + "</small>" : "") + "</span>";
          btn.onclick = function () { answers[f.name] = o.value; setTimeout(function () { go(i + 1); }, 160); };
          ch.appendChild(btn);
        });
        step.appendChild(ch);
        navRow(step, null, null, false, false);
      }
    }

    function renderReview(step) {
      step.appendChild(el("span", "lf-count", "Ultimo passo"));
      step.appendChild(el("h3", "lf-q", "Controlla e invia"));
      step.appendChild(el("p", "lf-help", "Ti ricontatta RE/MAX Abacus al più presto."));

      var rv = el("div", "lf-review");
      steps.forEach(function (f) {
        var v = f.kind === "file" ? (files[f.name] && files[f.name].name) : answers[f.name];
        if (v) rv.appendChild(el("div", "lf-review-row", '<span>' + esc(f.label) + "</span><b>" + esc(v) + "</b>"));
      });
      step.appendChild(rv);

      var acc = el("label", "lf-accept");
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = accept;
      var span = el("span", null, 'Acconsento al trattamento dei miei dati secondo quanto indicato nella <a href="' + PRIVACY + '" target="_blank" rel="noreferrer">privacy policy</a>.');
      cb.onchange = function () { accept = cb.checked; var b = step.querySelector(".lf-submit"); if (b) b.disabled = !accept || sending; setProg(); };
      acc.appendChild(cb); acc.appendChild(span); step.appendChild(acc);

      var ts = el("div", "lf-turnstile"); step.appendChild(ts);
      loadTurnstile(function () {
        if (window.turnstile && !ts.hasChildNodes()) {
          try {
            window.turnstile.render(ts, {
              sitekey: cfg.cf.sitekey, theme: "dark", action: "contact-form-7",
              callback: function (t) { token = t; },
              "error-callback": function () { token = ""; },
              "expired-callback": function () { token = ""; }
            });
          } catch (e) { /* domain not allowed: submit still attempted */ }
        }
      });

      var row = el("div", "lf-nav");
      var bk = el("button", "lf-btn lf-btn-ghost", "Indietro"); bk.type = "button"; bk.onclick = function () { go(i - 1); };
      var sb = el("button", "lf-btn lf-submit", cfg.submitLabel || "Invia"); sb.type = "button"; sb.disabled = !accept;
      sb.onclick = function () { submit(step, sb); };
      row.appendChild(bk); row.appendChild(sb); step.appendChild(row);
    }

    function submit(step, sb) {
      sending = true; sb.disabled = true; sb.textContent = "Invio...";
      var cf = cfg.cf;
      var fd = new FormData();
      fd.append("_wpcf7", cf.formId);
      fd.append("_wpcf7_version", "5.9.8");
      fd.append("_wpcf7_locale", cf.locale);
      fd.append("_wpcf7_unit_tag", cf.unitTag);
      fd.append("_wpcf7_container_post", "0");
      fd.append("_wpcf7_posted_data_hash", "");
      if (cf.messageField) {
        var lines = [cfg.messageTitle || "", ""];
        steps.forEach(function (f) { if (f.kind !== "file" && f.fold && answers[f.name]) lines.push(f.label + ": " + answers[f.name]); });
        fd.append(cf.messageField, lines.join("\n"));
      }
      steps.forEach(function (f) {
        if (f.kind !== "file" && f.fold) return;
        if (f.kind === "file") { if (files[f.name]) fd.append(f.name, files[f.name]); }
        else if (answers[f.name] != null) fd.append(f.name, answers[f.name]);
      });
      fd.append("acceptance-223", "1");
      fd.append(cf.honeypot, "");
      if (token) fd.append("cf-turnstile-response", token);

      fetch(cf.endpoint, { method: "POST", body: fd })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (j) { if (j && j.status === "mail_sent") { done(); } else { fail(step); } })
        .catch(function () { fail(step); })
        .then(function () { sending = false; });
    }

    function done() {
      wrap.innerHTML = '<div class="lf-done"><div class="lf-done-ico" aria-hidden="true"></div><h3>' + esc(cfg.success.title) + "</h3><p>" + esc(cfg.success.body) + "</p></div>";
    }
    function fail(step) {
      var sb = step.querySelector(".lf-submit"); if (sb) { sb.disabled = false; sb.textContent = cfg.submitLabel || "Invia"; }
      if (step.querySelector(".lf-err")) return;
      var err = el("div", "lf-err");
      err.appendChild(el("p", null, "Non siamo riusciti a inviare la richiesta da qui. Completala sul sito di RE/MAX Abacus, bastano pochi secondi."));
      var a = document.createElement("a"); a.className = "lf-btn"; a.href = cfg.fallbackUrl; a.target = "_blank"; a.rel = "noreferrer";
      a.textContent = (cfg.fallbackLabel || "Continua sul sito RE/MAX Abacus") + " →";
      err.appendChild(a);
      err.appendChild(el("span", "lf-err-alt", 'Oppure chiama il <a href="tel:+390637352343">06 37352343</a>.'));
      step.appendChild(err);
    }

    render();
  }

  window.LGIMLead = { mount: function (sel, cfg) { var r = document.querySelector(sel); if (r) new Lead(r, cfg); } };
})();
