/* Temas 6 y 7 — Taller Kubernetes + Kustomize: traducir y variar sin duplicar. */
(function () {
  "use strict";
  window.DOCKLABS = window.DOCKLABS || {};

  var BASE =
    "apiVersion: apps/v1\n" +
    "kind: Deployment\n" +
    "metadata:\n" +
    "  name: servicio-http-deployment\n" +
    "spec:\n" +
    "  replicas: 1\n" +
    "  template:\n" +
    "    spec:\n" +
    "      containers:\n" +
    "        - name: servicio-http\n" +
    "          image: mi-servicio-http:v1\n";

  var OVERLAY_STARTER =
    "apiVersion: kustomize.config.k8s.io/v1beta1\n" +
    "kind: Kustomization\n" +
    "resources:\n" +
    "  - ../../base\n";

  window.DOCKLABS.k8s = {
    mount: function (host) {
      var U = window.DOCKUI, C = window.DOCKCHECK;

      /* Parte A: Compose -> K8s */
      var box = U.labShell(
        "Traducí Compose a Kubernetes",
        "Mismo sistema, otro modelo. Emparejá cada concepto con su objeto, y marcá el que no tiene equivalente directo."
      );
      var maps = [
        { c: "services: app (ciclo de vida)", answer: "Deployment", why: "El Deployment mantiene las réplicas vivas y hace rolling updates." },
        { c: "ports / red interna", answer: "Service", why: "ClusterIP adentro, NodePort o mapeo de kind hacia el host." },
        { c: "volumes: db-data", answer: "PersistentVolumeClaim", why: "El PVC pide almacenamiento; en kind lo ata al disco del nodo." },
        { c: "variables y contraseñas", answer: "ConfigMap + Secret", why: "Config lo no sensible, Secret lo sensible (Base64, no cifrado real)." },
        { c: "depends_on", answer: "sin equivalente", why: "K8s no ordena arranques: se resuelve con probes y apps que reintentan." },
        { c: "healthcheck /ready", answer: "livenessProbe + readinessProbe", why: "/health al liveness, /ready al readiness." }
      ];
      maps.forEach(function (k) {
        var row = U.el("div", "match-row");
        row.appendChild(U.el("span", null, k.c));
        var sel = document.createElement("select");
        sel.setAttribute("aria-label", "Objeto K8s para: " + k.c);
        ["elegí…", "Deployment", "Service", "PersistentVolumeClaim", "ConfigMap + Secret", "livenessProbe + readinessProbe", "sin equivalente"].forEach(function (o) {
          var op = document.createElement("option");
          op.value = o;
          op.textContent = o;
          sel.appendChild(op);
        });
        var fb = U.el("span", "note", "");
        sel.addEventListener("change", function () {
          if (sel.value === "elegí…") { fb.textContent = ""; return; }
          fb.textContent = sel.value === k.answer ? "Bien. " + k.why : "No. " + k.why;
        });
        row.appendChild(sel);
        row.appendChild(fb);
        box.appendChild(row);
      });

      /* Parte B: orden de kind */
      box.appendChild(U.el("h3", null, "El orden sí importa: kind"));
      var steps = [
        "kind create cluster --name tc1-cluster",
        "docker build -t mi-servicio-http:v1 .",
        "kind load docker-image mi-servicio-http:v1 --name tc1-cluster",
        "kubectl apply -k ./kubernetes/overlays/dev"
      ];
      var order = U.el("ol");
      var shuffled = [steps[2], steps[0], steps[3], steps[1]];
      shuffled.forEach(function (s) {
        var li = document.createElement("li");
        var num = document.createElement("input");
        num.type = "number";
        num.min = "1";
        num.max = "4";
        num.style.width = "3rem";
        num.setAttribute("aria-label", "Posición de: " + s);
        li.appendChild(document.createTextNode(s + "  "));
        li.appendChild(num);
        li.dataset.step = s;
        order.appendChild(li);
      });
      box.appendChild(order);
      var orderFb = U.el("p", "note", "");
      var bar = U.textButtons();
      bar.add("Verificar orden", true, function () {
        var ok = true;
        Array.prototype.forEach.call(order.children, function (li) {
          var want = steps.indexOf(li.dataset.step) + 1;
          var got = parseInt(li.querySelector("input").value, 10);
          if (got !== want) ok = false;
        });
        orderFb.textContent = ok
          ? "Bien: clúster, build, load, apply. Sin load antes del apply, el Deployment muere en ImagePullBackOff."
          : "Todavía no: pista, no podés cargar una imagen en un clúster que no existe, ni aplicar lo que usa una imagen que el nodo no tiene.";
      });
      box.appendChild(bar.row);
      box.appendChild(orderFb);
      host.appendChild(box);

      /* Parte C: overlay sin duplicar */
      var box2 = U.labShell(
        "Un overlay que cambia algo real",
        "La base define 1 réplica. Escribí el overlay que la lleva a 3 sin copiar el Deployment entero."
      );
      box2.appendChild(U.el("p", "kicker", "Base (solo lectura)"));
      box2.appendChild(U.el("pre", "ref-block", BASE));
      var ta = document.createElement("textarea");
      ta.className = "editor";
      ta.style.minHeight = "160px";
      ta.setAttribute("aria-label", "Tu kustomization.yaml del overlay");
      ta.spellcheck = false;
      var ed = U.bindEditor(ta, "bdii-cont-lab-k8s-overlay", OVERLAY_STARTER);
      box2.appendChild(ta);
      var out = U.el("div");
      box2.appendChild(out);
      var bar2 = U.textButtons();
      bar2.add("Comprobar overlay", true, function () {
        U.renderFindings(out, C.checkOverlay(BASE, ta.value));
      });
      bar2.add("Reiniciar", false, function () {
        ed.reset();
        out.innerHTML = "";
      });
      box2.appendChild(bar2.row);
      box2.appendChild(U.el("p", "note",
        "Pista: resources: - ../../base más replicas: [{name: servicio-http-deployment, count: 3}]. Si pegaste el Deployment entero, el comprobador te lo marca como duplicación."));
      host.appendChild(box2);
    }
  };
})();
