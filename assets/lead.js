/* La Gente Immobiliare — shared behaviors + lead form.
   Il form embeda il modulo HubSpot UFFICIALE di RE/MAX Abacus (stesso portale e stesso
   form guid usati su abacus.remax.it): così la richiesta è un vero invio HubSpot e arriva
   nel loro CRM come dal loro sito. Iniettiamo il nostro tema scuro dentro l'iframe (same-origin)
   e nascondiamo i campi interni di instradamento. Se lo script HubSpot non carica, rimandiamo
   al modulo sul loro sito. */
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

  /* click-to-play YouTube embed facade */
  Array.prototype.slice.call(document.querySelectorAll(".ytembed")).forEach(function (box) {
    function play() {
      var id = box.getAttribute("data-id"); if (!id || box.classList.contains("playing")) return;
      var f = document.createElement("iframe");
      f.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white";
      f.title = "Episodio La Gente Immobiliare";
      f.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      f.setAttribute("allowfullscreen", "");
      f.className = "yt-frame";
      box.innerHTML = ""; box.appendChild(f); box.classList.add("playing");
    }
    box.addEventListener("click", play);
    box.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
  });

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

  /* ---------- Official HubSpot form embed ---------- */
  function loadHsForms(region, cb) {
    if (window.hbspt && window.hbspt.forms) { cb(true); return; }
    var id = "hs-forms-js";
    var ex = document.getElementById(id);
    if (ex) {
      ex.addEventListener("load", function () { cb(true); });
      ex.addEventListener("error", function () { cb(false); });
      if (window.hbspt && window.hbspt.forms) cb(true);
      return;
    }
    var reg = region || "na1";
    var s = document.createElement("script");
    s.id = id;
    s.src = (reg === "na1" ? "https://js.hsforms.net" : "https://js-" + reg + ".hsforms.net") + "/forms/embed/v2.js";
    s.async = true; s.defer = true;
    s.addEventListener("load", function () { cb(true); });
    s.addEventListener("error", function () { cb(false); });
    document.head.appendChild(s);
  }

  // Tema CHIARO iniettato DENTRO l'iframe del form HubSpot (same-origin).
  var HS_THEME = [
    '@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap");',
    'html,body{background:transparent!important;margin:0!important}',
    'body,.hs-form,.hs-form *{font-family:"Hanken Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif!important}',
    '.hs-form{display:grid;gap:16px}',
    '.hs-form fieldset{max-width:none!important;margin:0!important}',
    '.hs-form .hs-form-field{margin:0 0 2px!important;width:100%!important;float:none!important}',
    '.hs-form .input{margin:0!important}',
    /* nascondi i campi interni di instradamento (li valorizza/omette il CRM) */
    '.hs-form .hs_sorgente,.hs-form .hs_codice_agenzia,.hs-form .hs_lead_sito,.hs-form .hs_tipologia_lead_sito,.hs-form .hs_agency_id,.hs-form .hs_fonte_lead{display:none!important}',
    '.hs-form label{display:block;font-size:13.5px;font-weight:600;color:rgba(11,14,20,.66);margin:0 0 7px;line-height:1.4}',
    '.hs-form label .hs-form-required{color:#DC1C2E;margin-left:3px}',
    '.hs-form .hs-input:not([type=checkbox]):not([type=radio]){width:100%!important;box-sizing:border-box;background:#fff!important;border:1.5px solid rgba(11,14,20,.2)!important;border-radius:12px!important;color:#0B0E14!important;-webkit-text-fill-color:#0B0E14!important;caret-color:#0B0E14!important;font-size:16px;font-weight:500;padding:13px 15px!important;outline:none;transition:border-color .2s ease,background .2s ease}',
    '.hs-form .hs-input::placeholder{color:rgba(11,14,20,.4)!important;-webkit-text-fill-color:rgba(11,14,20,.4)!important}',
    '.hs-form .hs-input:-webkit-autofill,.hs-form .hs-input:-webkit-autofill:focus{-webkit-text-fill-color:#0B0E14!important;caret-color:#0B0E14!important;transition:background-color 9999s ease-in-out 0s}',
    '.hs-form .hs-input:focus{border-color:#DC1C2E;background:rgba(11,14,20,.03)}',
    '.hs-form textarea.hs-input{min-height:112px;resize:vertical}',
    '.hs-form select.hs-input{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,rgba(11,14,20,.5) 50%),linear-gradient(135deg,rgba(11,14,20,.5) 50%,transparent 50%);background-position:calc(100% - 20px) 50%,calc(100% - 14px) 50%;background-size:6px 6px,6px 6px;background-repeat:no-repeat;padding-right:40px}',
    '.hs-form select.hs-input option{background:#fff;color:#0B0E14}',
    '.hs-form .inputs-list{list-style:none;margin:0;padding:0;display:grid;gap:9px}',
    '.hs-form .hs-form-booleancheckbox label,.hs-form .hs-form-checkbox label{display:flex;gap:11px;align-items:flex-start;font-size:14px;font-weight:500;color:rgba(11,14,20,.66);margin:0;line-height:1.5;cursor:pointer}',
    '.hs-form input[type=checkbox],.hs-form input[type=radio]{width:18px!important;height:18px!important;min-height:0!important;flex:0 0 auto!important;margin:2px 0 0!important;padding:0!important;border-radius:4px!important;accent-color:#DC1C2E}',
    '.hs-form a{color:#DC1C2E;text-decoration:underline;text-underline-offset:2px}',
    '.hs-form .legal-consent-container{font-size:13px;color:rgba(11,14,20,.5);line-height:1.55}',
    '.hs-form .hs-error-msgs{list-style:none;margin:6px 0 0;padding:0}',
    '.hs-form .hs-error-msg,.hs-form .hs-error-msgs label{color:#DC1C2E;font-size:13px;font-weight:600;margin:0}',
    '.hs-form .hs-submit{margin-top:4px}',
    '.hs-form .hs-button{display:inline-flex;align-items:center;cursor:pointer;font-size:16px;font-weight:800;border:0;border-radius:100px;padding:15px 30px;background:#DC1C2E;color:#fff;transition:transform .2s ease,background .2s ease}',
    '.hs-form .hs-button:hover{transform:translateY(-2px);background:#e8253a}',
    '.hs-form .submitted-message,.hs-form .hs-main-font-element{color:#0B0E14;font-size:17px;line-height:1.5}'
  ].join("");

  var HS_LABELS = { email: "Email", firstname: "Nome", lastname: "Cognome", phone: "Telefono", city: "Città", "provincia__c": "Provincia" };
  // la checkbox di consenso del form agenti ha label interna ("privacy_website"): mettiamo un testo corretto
  function setHsConsent(doc) {
    var wrap = doc.querySelector(".hs_privacy_website");
    if (!wrap) return;
    var span = wrap.querySelector("label span") || wrap.querySelector("label");
    if (span && span.getAttribute("data-lgim") !== "it") {
      span.innerHTML = 'Ho letto e accetto la <a href="' + PRIVACY + '" target="_blank" rel="noreferrer">privacy policy</a> per le candidature.';
      span.setAttribute("data-lgim", "it");
    }
  }
  // messaggi di validazione HubSpot (inglesi) -> italiano
  var HS_ERR = [
    [/please complete this required field\.?/i, "Compila questo campo."],
    [/please complete all required fields\.?/i, "Compila tutti i campi obbligatori."],
    [/please enter a valid email address\.?/i, "Inserisci un indirizzo email valido."],
    [/email must be formatted correctly\.?/i, "Inserisci un indirizzo email valido."],
    [/this email address is not valid\.?/i, "Inserisci un indirizzo email valido."],
    [/please enter a valid (phone|telephone) number\.?/i, "Inserisci un numero di telefono valido."],
    [/the phone number .*?(invalid|not valid).*/i, "Inserisci un numero di telefono valido."],
    [/please select (an option|a value)\.?/i, "Seleziona un'opzione."],
    [/there was a problem.*submitting.*/i, "Si è verificato un problema nell'invio. Riprova."]
  ];
  function translateHsErrors(doc) {
    var nodes = doc.querySelectorAll(".hs-error-msg, .hs-error-msgs label, .hs_error_rollup .hs-error-msgs label");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], t = (n.textContent || "").trim();
      if (!t || n.getAttribute("data-lgim") === "it") continue;
      for (var j = 0; j < HS_ERR.length; j++) {
        if (HS_ERR[j][0].test(t)) { n.textContent = HS_ERR[j][1]; n.setAttribute("data-lgim", "it"); break; }
      }
    }
  }
  function setHsLabel(doc, field, text) {
    var lab = doc.querySelector(".hs_" + field + " > label");
    if (!lab) return;
    var req = lab.querySelector(".hs-form-required");
    lab.textContent = text;
    if (req) { lab.appendChild(doc.createTextNode(" ")); lab.appendChild(req); }
  }

  function styleHsIframe(root, cfg) {
    try {
      var ifr = root.querySelector("iframe.hs-form-iframe");
      if (!ifr) return;
      var doc = ifr.contentDocument || (ifr.contentWindow && ifr.contentWindow.document);
      if (!doc || !doc.head) return; // cross-origin / non pronto: il form resta comunque funzionante
      if (!doc.getElementById("lgim-hs-theme")) {
        var st = doc.createElement("style");
        st.id = "lgim-hs-theme";
        st.textContent = HS_THEME;
        doc.head.appendChild(st);
      }
      // etichette e pulsante in italiano (il form ufficiale è in inglese)
      for (var k in HS_LABELS) if (Object.prototype.hasOwnProperty.call(HS_LABELS, k)) setHsLabel(doc, k, HS_LABELS[k]);
      setHsConsent(doc);
      // "Please Select" -> "Seleziona" sui menu a tendina
      var sels = doc.querySelectorAll("select.hs-input option");
      for (var s = 0; s < sels.length; s++) { if (/^please select$/i.test((sels[s].textContent || "").trim())) sels[s].textContent = "Seleziona"; }
      // sposta il consenso in fondo, subito prima del pulsante (come sul sito ufficiale)
      var pw = doc.querySelector(".hs_privacy_website");
      var form = doc.querySelector(".hs-form");
      var submit = form && (form.querySelector(".hs_submit") || form.querySelector(".hs-submit"));
      if (pw && submit && submit.parentNode && pw.getAttribute("data-lgim-moved") !== "1") {
        submit.parentNode.insertBefore(pw, submit);
        pw.setAttribute("data-lgim-moved", "1");
      }
      var btn = doc.querySelector("input.hs-button, .hs-button");
      if (btn && cfg && cfg.submitLabel) { if ("value" in btn) btn.value = cfg.submitLabel; else btn.textContent = cfg.submitLabel; }
      // traduci i messaggi di validazione, ora e ad ogni ri-render (HubSpot li rigenera)
      translateHsErrors(doc);
      var form = doc.querySelector(".hs-form");
      if (form && !form.getAttribute("data-lgim-obs")) {
        form.setAttribute("data-lgim-obs", "1");
        try {
          var mo = new MutationObserver(function () { translateHsErrors(doc); });
          mo.observe(form, { childList: true, subtree: true, characterData: true });
        } catch (e) { /* observer non supportato: errori restano in inglese */ }
      }
      // tagga la sorgente (campo testo libero): aiuta RE/MAX a riconoscere la provenienza
      var src = doc.querySelector('[name="sorgente"]');
      if (src && !src.value) {
        var path = (location.pathname || "").replace(/^\//, "").replace(/\.html$/, "") || "home";
        src.value = "La Gente Immobiliare · " + path;
        src.dispatchEvent(new Event("input", { bubbles: true }));
        src.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } catch (e) { /* non bloccare mai il form per un problema di stile */ }
  }

  var hsSeq = 0;
  function hsFallback(wrap, cfg) {
    wrap.innerHTML = "";
    var err = el("div", "lf-err");
    err.appendChild(el("p", null, "Il modulo non si è caricato. Aprilo sul sito di RE/MAX Abacus, bastano pochi secondi."));
    var a = document.createElement("a"); a.className = "lf-btn"; a.href = cfg.fallbackUrl; a.target = "_blank"; a.rel = "noreferrer";
    a.textContent = (cfg.fallbackLabel || "Continua sul sito RE/MAX Abacus") + " →";
    err.appendChild(a);
    err.appendChild(el("span", "lf-err-alt", 'Oppure chiama il <a href="tel:+390637352343">06 37352343</a>.'));
    wrap.appendChild(err);
  }

  function mountHubspot(root, cfg) {
    var cf = cfg.cf;
    var wrap = el("div", "lf lf-hs");
    var load = el("div", "lf-hs-load", "Carico il modulo RE/MAX Abacus…");
    var tid = "hs-target-" + (++hsSeq);
    var target = el("div", "lf-hs-target"); target.id = tid;
    wrap.appendChild(load); wrap.appendChild(target);
    root.innerHTML = ""; root.appendChild(wrap);

    var settled = false;
    var timer = setTimeout(function () { if (!settled) { settled = true; hsFallback(wrap, cfg); } }, 9000);

    loadHsForms(cf.region, function (ok) {
      if (settled) return;
      if (!ok || !window.hbspt || !window.hbspt.forms) { settled = true; clearTimeout(timer); hsFallback(wrap, cfg); return; }
      try {
        window.hbspt.forms.create({
          region: cf.region || "na1",
          portalId: cf.portalId,
          formId: cf.formGuid,
          target: "#" + tid,
          onFormReady: function () {
            settled = true; clearTimeout(timer);
            if (load.parentNode) load.parentNode.removeChild(load);
            wrap.classList.add("ready");
            // l'iframe può non essere montato nello stesso tick: ritenta brevemente
            styleHsIframe(target, cfg);
            setTimeout(function () { styleHsIframe(target, cfg); }, 120);
            setTimeout(function () { styleHsIframe(target, cfg); }, 500);
          }
        });
      } catch (e) { settled = true; clearTimeout(timer); hsFallback(wrap, cfg); }
    });
  }

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
      if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) { /* older browsers */ } }
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
      var handoff = cfg.cf && cfg.cf.handoff;
      step.appendChild(el("span", "lf-count", "Ultimo passo"));
      step.appendChild(el("h3", "lf-q", handoff ? "Ci siamo quasi" : "Controlla e invia"));
      step.appendChild(el("p", "lf-help", handoff
        ? "Completa l'invio sul modulo ufficiale di RE/MAX Abacus: con questi dati ti bastano pochi secondi."
        : "Ti ricontatta RE/MAX Abacus al più presto."));

      var rv = el("div", "lf-review");
      steps.forEach(function (f) {
        var v = f.kind === "file" ? (files[f.name] && files[f.name].name) : answers[f.name];
        if (v) rv.appendChild(el("div", "lf-review-row", '<span>' + esc(f.label) + "</span><b>" + esc(v) + "</b>"));
      });
      step.appendChild(rv);

      if (handoff) {
        var hrow = el("div", "lf-nav");
        var hbk = el("button", "lf-btn lf-btn-ghost", "Indietro"); hbk.type = "button"; hbk.onclick = function () { go(i - 1); };
        var ha = document.createElement("a"); ha.className = "lf-btn lf-submit"; ha.href = cfg.fallbackUrl; ha.target = "_blank"; ha.rel = "noreferrer";
        ha.textContent = (cfg.submitLabel || "Vai al modulo RE/MAX Abacus") + " →";
        hrow.appendChild(hbk); hrow.appendChild(ha); step.appendChild(hrow);
        return;
      }

      var acc = el("label", "lf-accept");
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = accept;
      var span = el("span", null, 'Acconsento al trattamento dei miei dati secondo quanto indicato nella <a href="' + PRIVACY + '" target="_blank" rel="noreferrer">privacy policy</a>.');
      cb.onchange = function () { accept = cb.checked; var b = step.querySelector(".lf-submit"); if (b) b.disabled = !accept || sending; setProg(); };
      acc.appendChild(cb); acc.appendChild(span); step.appendChild(acc);

      if (cfg.cf.sitekey) {
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
      }

      var row = el("div", "lf-nav");
      var bk = el("button", "lf-btn lf-btn-ghost", "Indietro"); bk.type = "button"; bk.onclick = function () { go(i - 1); };
      var sb = el("button", "lf-btn lf-submit", cfg.submitLabel || "Invia"); sb.type = "button"; sb.disabled = !accept;
      sb.onclick = function () { submit(step, sb); };
      row.appendChild(bk); row.appendChild(sb); step.appendChild(row);
    }

    function foldedMessage() {
      var lines = [];
      if (cfg.messageTitle) lines.push(cfg.messageTitle);
      steps.forEach(function (f) { if (f.kind !== "file" && f.fold && answers[f.name]) lines.push(f.label + ": " + answers[f.name]); });
      return lines.join("\n");
    }

    function submit(step, sb) {
      sending = true; sb.disabled = true; sb.textContent = "Invio...";
      var cf = cfg.cf;

      if (cf.provider === "hubspot") {
        // split single name into first/last when no explicit cognome
        var nm = (answers["your-name"] || "").trim();
        var fn = nm, ln = answers["your-cognome"] || "";
        if (!ln && nm.indexOf(" ") > 0) { fn = nm.slice(0, nm.indexOf(" ")); ln = nm.slice(nm.indexOf(" ") + 1); }
        var fields = [];
        function add(n, v) { if (v && String(v).trim()) fields.push({ name: n, value: String(v).trim() }); }
        add("firstname", fn); add("lastname", ln);
        add("email", answers["your-email"]);
        add("phone", answers["your-phone"] || answers["your-tel"]);
        add("city", answers["your-citta"]);
        add("privacy_website", "true"); // campo consenso del form HubSpot (si arriva qui solo dopo accettazione)
        var msg = foldedMessage();
        if (msg) add("message", msg);
        var payload = {
          fields: fields,
          context: { pageUri: location.href, pageName: document.title },
          legalConsentOptions: { consent: { consentToProcess: true, text: "Acconsento al trattamento dei miei dati secondo la privacy policy." } }
        };
        var ep = "https://api-" + (cf.region || "na1") + ".hsforms.com/submissions/v3/integration/submit/" + cf.portalId + "/" + cf.formGuid;
        fetch(ep, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
          .then(function (r) { if (r.ok) { done(); } else { fail(step); } })
          .catch(function () { fail(step); })
          .then(function () { sending = false; });
        return;
      }

      // (legacy) Contact Form 7 multipart submit
      var fd = new FormData();
      fd.append("_wpcf7", cf.formId);
      fd.append("_wpcf7_version", "5.9.8");
      fd.append("_wpcf7_locale", cf.locale);
      fd.append("_wpcf7_unit_tag", cf.unitTag);
      fd.append("_wpcf7_container_post", "0");
      fd.append("_wpcf7_posted_data_hash", "");
      if (cf.messageField) fd.append(cf.messageField, foldedMessage());
      steps.forEach(function (f) {
        if (f.kind !== "file" && f.fold) return;
        if (f.kind === "file") { if (files[f.name]) fd.append(f.name, files[f.name]); }
        else if (answers[f.name] != null) fd.append(f.name, answers[f.name]);
      });
      fd.append("acceptance-223", "1");
      if (cf.honeypot) fd.append(cf.honeypot, "");
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

  var SITEKEY = "0x4AAAAAAAcUkWtBw33uTza2";
  function assign(a, b) { for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k]; return a; }

  window.LGIMLead = {
    mount: function (sel, cfg) {
      var r = document.querySelector(sel); if (!r) return;
      if (cfg && cfg.cf && cfg.cf.provider === "hubspot") mountHubspot(r, cfg);
      else new Lead(r, cfg);
    },

    // clienti (vendita/acquisto) -> invio diretto al modulo HubSpot "Contatti" di abacus.remax.it
    client: function (opts) {
      return assign({
        cf: { provider: "hubspot", portalId: "27198741", formGuid: "b385e858-53b6-4d75-94d4-8789a4994256", region: "eu1" },
        submitLabel: "Richiedi di essere ricontattato",
        success: { title: "Richiesta inviata", body: "Grazie. Un consulente RE/MAX Abacus ti ricontatterà al più presto." },
        fallbackUrl: "https://abacus.remax.it/contatti",
        steps: [
          { kind: "choice", name: "obiettivo", label: "Obiettivo", fold: true, question: "Qual è il tuo obiettivo?", options: [
            { value: "Vendere per ricomprare", desc: "Cambiare casa coordinando le due operazioni" },
            { value: "Vendere", desc: "Mettere in vendita il mio immobile" },
            { value: "Comprare", desc: "Cerco la casa giusta" }
          ] },
          { kind: "text", name: "your-name", label: "Nome", question: "Come ti chiami?", placeholder: "Nome e cognome" },
          { kind: "text", name: "your-citta", label: "Città", question: "In che zona o città?", placeholder: "Es. Roma, Prati" },
          { kind: "text", name: "your-phone", label: "Telefono", inputType: "tel", question: "A che numero ti richiamiamo?", placeholder: "Il tuo telefono" },
          { kind: "text", name: "your-email", label: "Email", inputType: "email", question: "E la tua email?", placeholder: "La tua email" }
        ]
      }, opts || {});
    },

    // agenti (Lavora con noi) -> invio diretto al modulo HubSpot "Lavora con noi" di abacus.remax.it
    agent: function (opts) {
      return assign({
        cf: { provider: "hubspot", portalId: "27198741", formGuid: "3519b61b-d2c7-4b7a-b3c7-67c7d899fee8", region: "eu1" },
        submitLabel: "Invia la candidatura",
        success: { title: "Candidatura inviata", body: "Grazie. RE/MAX Abacus ti ricontatterà per conoscerti." },
        fallbackUrl: "https://abacus.remax.it/lavora-con-noi",
        fallbackLabel: "Candidati sul sito RE/MAX Abacus",
        steps: [
          { kind: "text", name: "your-name", label: "Nome", question: "Come ti chiami?", placeholder: "Il tuo nome" },
          { kind: "text", name: "your-cognome", label: "Cognome", question: "E il cognome?", placeholder: "Il tuo cognome" },
          { kind: "text", name: "your-citta", label: "Città", question: "In che città vuoi operare?", placeholder: "Es. Roma" },
          { kind: "text", name: "your-tel", label: "Telefono", inputType: "tel", question: "A che numero ti richiamiamo?", placeholder: "Il tuo telefono" },
          { kind: "text", name: "your-email", label: "Email", inputType: "email", question: "E la tua email?", placeholder: "La tua email" }
        ]
      }, opts || {});
    }
  };
})();
