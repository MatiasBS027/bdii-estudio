/* Pequeños constructores de UI compartidos por los laboratorios. */
(function () {
  "use strict";

  var LETTERS = ["A", "B", "C", "D", "E", "F"];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function lsGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }
  function lsGetJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function lsSetJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  function renderFindings(box, findings) {
    box.innerHTML = "";
    if (!findings.length) {
      box.appendChild(el("p", "note", "Sin observaciones: el archivo pasa las reglas básicas."));
      return;
    }
    var ul = el("ul", "findings");
    findings.forEach(function (f) {
      var li = el("li", f.level);
      li.appendChild(el("span", "tag", f.tag + " · " + f.title));
      li.appendChild(el("span", null, f.body));
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  /* Quiz MCQ con letras A–D, feedback, score y persistencia opcional. */
  function renderQuiz(box, questions, opts) {
    box.innerHTML = "";
    opts = opts || {};
    var storeKey = opts.storeKey || null;
    if (!questions || !questions.length) {
      box.appendChild(el("p", "note", "Sin preguntas en este tema."));
      return;
    }
    var saved = storeKey ? (lsGetJSON(storeKey, {}) || {}) : {};
    if (typeof saved !== "object" || Array.isArray(saved)) saved = {};

    var wrap = el("div", "quiz");
    var meta = el("div", "quiz-meta");
    var chip = el("span", "score-chip", "0 / " + questions.length);
    var resetBtn = el("button", "ghost", "↺ Reiniciar quiz");
    resetBtn.type = "button";
    meta.appendChild(chip);
    if (storeKey) meta.appendChild(resetBtn);
    wrap.appendChild(meta);

    var score = 0;
    var answered = 0;

    function persist() {
      if (!storeKey) return;
      lsSetJSON(storeKey, saved);
    }

    function updateChip() {
      chip.textContent = score + " / " + questions.length + (answered === questions.length ? " · listo" : "");
    }

    function paintCard(card, q, i, choice) {
      var optsBtns = card.querySelectorAll(".opt");
      var fb = card.querySelector(".explain");
      var ok = choice === q.a;
      optsBtns.forEach(function (btn, j) {
        btn.disabled = true;
        btn.classList.remove("right", "wrong");
        if (j === q.a) btn.classList.add("right");
        if (j === choice && !ok) btn.classList.add("wrong");
      });
      fb.classList.add("show");
      fb.innerHTML = "";
      fb.appendChild(el("span", "why-label", ok ? "Bien. " : "No. "));
      var why = document.createElement("span");
      why.textContent = q.why;
      fb.appendChild(why);
      card.dataset.done = "1";
    }

    questions.forEach(function (q, i) {
      var card = el("div", "sheet");
      card.appendChild(el("p", "kicker", "Pregunta " + (i + 1) + " / " + questions.length));
      var p = el("p", null, null);
      p.innerHTML = "<strong>" + q.q + "</strong>";
      card.appendChild(p);
      var fb = el("div", "explain");
      q.opts.forEach(function (opt, j) {
        var b = el("button", "opt", opt);
        b.type = "button";
        b.setAttribute("data-letter", LETTERS[j] || String(j + 1));
        b.addEventListener("click", function () {
          if (card.dataset.done) return;
          answered++;
          if (j === q.a) score++;
          saved[i] = j;
          persist();
          paintCard(card, q, i, j);
          updateChip();
        });
        card.appendChild(b);
      });
      card.appendChild(fb);
      wrap.appendChild(card);

      if (Object.prototype.hasOwnProperty.call(saved, String(i)) || Object.prototype.hasOwnProperty.call(saved, i)) {
        var choice = saved[i];
        if (typeof choice === "number") {
          answered++;
          if (choice === q.a) score++;
          paintCard(card, q, i, choice);
        }
      }
    });
    updateChip();

    resetBtn.addEventListener("click", function () {
      if (!confirm("¿Reiniciar las respuestas de este quiz?")) return;
      saved = {};
      persist();
      renderQuiz(box, questions, opts);
    });

    box.appendChild(wrap);
  }

  function labShell(title, hint) {
    var box = el("section", "sheet");
    box.appendChild(el("p", "kicker", "Taller"));
    box.appendChild(el("h3", null, title));
    if (hint) box.appendChild(el("p", null, hint));
    return box;
  }

  function textButtons() {
    var row = el("div", "row-actions");
    return {
      row: row,
      add: function (label, primary, fn) {
        var b = el("button", primary ? "btn" : "ghost", label);
        b.type = "button";
        b.addEventListener("click", fn);
        row.appendChild(b);
        return b;
      }
    };
  }

  function bindEditor(ta, key, starter) {
    var saved = lsGet(key, null);
    ta.value = saved != null ? saved : starter;
    var timer = null;
    ta.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { lsSet(key, ta.value); }, 200);
    });
    return {
      reset: function () {
        ta.value = starter;
        lsSet(key, starter);
      },
      saveNow: function () { lsSet(key, ta.value); }
    };
  }

  function buildToc(rootEl) {
    var heads = rootEl.querySelectorAll("h2");
    if (heads.length < 2) return null;
    var nav = el("nav", "topic-toc");
    nav.setAttribute("aria-label", "En esta capa");
    nav.appendChild(el("p", "topic-toc-label", "En esta capa"));
    var ol = el("ol", "topic-toc-list");
    heads.forEach(function (h, i) {
      if (!h.id) h.id = "sec-" + (i + 1);
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, "");
      li.appendChild(a);
      ol.appendChild(li);
    });
    nav.appendChild(ol);
    return nav;
  }

  window.DOCKUI = {
    el: el,
    lsGet: lsGet,
    lsSet: lsSet,
    lsGetJSON: lsGetJSON,
    lsSetJSON: lsSetJSON,
    renderFindings: renderFindings,
    renderQuiz: renderQuiz,
    labShell: labShell,
    textButtons: textButtons,
    bindEditor: bindEditor,
    buildToc: buildToc
  };
})();
