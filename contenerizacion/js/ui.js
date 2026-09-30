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

  /* Quiz MCQ con letras A–D, feedback inmediato y score chip. */
  function renderQuiz(box, questions) {
    box.innerHTML = "";
    if (!questions || !questions.length) {
      box.appendChild(el("p", "note", "Sin preguntas en este tema."));
      return;
    }
    var wrap = el("div", "quiz");
    var meta = el("div", "quiz-meta");
    var chip = el("span", "score-chip", "0 / " + questions.length);
    meta.appendChild(chip);
    wrap.appendChild(meta);

    var score = 0;
    var answered = 0;

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
          card.dataset.done = "1";
          answered++;
          var ok = j === q.a;
          if (ok) {
            score++;
            b.classList.add("right");
          } else {
            b.classList.add("wrong");
            var correct = card.querySelectorAll(".opt")[q.a];
            if (correct) correct.classList.add("right");
          }
          card.querySelectorAll(".opt").forEach(function (btn) { btn.disabled = true; });
          fb.classList.add("show");
          fb.innerHTML = "";
          var label = el("span", "why-label", ok ? "Bien. " : "No. ");
          var why = document.createElement("span");
          why.textContent = q.why;
          fb.appendChild(label);
          fb.appendChild(why);
          chip.textContent = score + " / " + questions.length + (answered === questions.length ? " · listo" : "");
        });
        card.appendChild(b);
      });
      card.appendChild(fb);
      wrap.appendChild(card);
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

  window.DOCKUI = {
    el: el,
    renderFindings: renderFindings,
    renderQuiz: renderQuiz,
    labShell: labShell,
    textButtons: textButtons
  };
})();
