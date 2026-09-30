/* Pequeños constructores de UI compartidos por los laboratorios. */
(function () {
  "use strict";

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

  /* Quiz de opción múltiple con explicación que enseña. */
  function renderQuiz(box, questions, doneKey, onAnswer) {
    box.innerHTML = "";
    var wrap = el("div", "quiz");
    var score = 0, answered = 0;
    questions.forEach(function (q, i) {
      var card = el("div", "sheet");
      card.appendChild(el("p", "kicker", "Pregunta " + (i + 1)));
      var p = el("p", null, null);
      p.innerHTML = "<strong>" + q.q + "</strong>";
      card.appendChild(p);
      var fb = el("div", "explain");
      q.opts.forEach(function (opt, j) {
        var b = el("button", "opt", opt);
        b.type = "button";
        b.addEventListener("click", function () {
          if (card.dataset.done) return;
          card.dataset.done = "1";
          answered++;
          var ok = (j === q.a);
          if (ok) { score++; b.classList.add("right"); }
          else { b.classList.add("wrong"); card.querySelectorAll(".opt")[q.a].classList.add("right"); }
          var ex = el("p", "note", (ok ? "Bien. " : "No. ") + q.why);
          fb.appendChild(ex);
          if (onAnswer) onAnswer({ ok: ok, answered: answered, total: questions.length, score: score });
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
    var h = el("h3", null, title);
    box.appendChild(h);
    if (hint) box.appendChild(el("p", null, hint));
    return box;
  }

  function textButtons(actions) {
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
