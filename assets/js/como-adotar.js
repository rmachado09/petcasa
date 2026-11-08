var secaoPassos = document.querySelector(".passos-adocao");
var passos = document.querySelectorAll(".passos-adocao p");

var areaProgresso = document.createElement("div");
areaProgresso.className = "progresso-passos";
areaProgresso.innerHTML =
  '<span class="progresso-texto"></span>' +
  '<div class="progresso-barra"><div class="progresso-preenchimento"></div></div>';
secaoPassos.insertBefore(areaProgresso, passos[0]);

var textoProgresso = areaProgresso.querySelector(".progresso-texto");
var preenchimento = areaProgresso.querySelector(".progresso-preenchimento");

function atualizarProgresso() {
  var concluidos = document.querySelectorAll(".passos-adocao p.concluido").length;
  var porcentagem = (concluidos / passos.length) * 100;

  textoProgresso.textContent =
    concluidos + " de " + passos.length + " passos concluídos";
  preenchimento.style.width = porcentagem + "%";
}

function alternarPasso(passo) {
  passo.classList.toggle("concluido");
  atualizarProgresso();
}

for (var i = 0; i < passos.length; i++) {
  var passo = passos[i];
  passo.setAttribute("tabindex", "0");
  passo.setAttribute("role", "button");
  passo.setAttribute("title", "Clique para marcar como concluído");

  passo.addEventListener("click", function () {
    alternarPasso(this);
  });

  passo.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      alternarPasso(this);
    }
  });
}

atualizarProgresso();

