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


var secaoRequisitos = document.querySelector(".requisitos");
var TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB
var TIPOS_IMAGEM = ["image/jpeg", "image/png"];

var camposDocumentos = [
  {
    id: "doc-identidade",
    rotulo: "Foto do documento de identidade (RG ou CNH)",
    tipos: TIPOS_IMAGEM,
    aceita: "image/jpeg, image/png",
    dica: "JPG ou PNG, até 5 MB. A data de nascimento deve estar legível."
  },
  {
    id: "doc-selfie",
    rotulo: "Selfie segurando o documento",
    tipos: TIPOS_IMAGEM,
    aceita: "image/jpeg, image/png",
    dica: "JPG ou PNG, até 5 MB. Rosto e documento visíveis na mesma foto."
  },
  {
    id: "doc-residencia",
    rotulo: "Comprovante de residência",
    tipos: TIPOS_IMAGEM.concat(["application/pdf"]),
    aceita: "image/jpeg, image/png, application/pdf",
    dica: "JPG, PNG ou PDF, até 5 MB."
  }
];


var formDocumentos = document.createElement("form");
formDocumentos.className = "form-documentos";
formDocumentos.setAttribute("novalidate", "");

var htmlForm = "<h3>Envio de documentos (obrigatório)</h3>";
for (var k = 0; k < camposDocumentos.length; k++) {
  var c = camposDocumentos[k];
  htmlForm +=
    '<div class="campo-documento">' +
      '<label for="' + c.id + '">' + c.rotulo + " *</label>" +
      '<input type="file" id="' + c.id + '" accept="' + c.aceita + '"' +
        (c.id === "doc-selfie" ? ' capture="user"' : "") + ">" +
      '<small class="dica">' + c.dica + "</small>" +
      '<small class="erro-documento" id="erro-' + c.id + '"></small>' +
      '<div class="previa-documento" id="previa-' + c.id + '"></div>' +
    "</div>";
}
htmlForm +=
  '<button type="submit" id="enviar-documentos" disabled>Enviar documentos</button>' +
  '<p class="retorno-documentos" id="retorno-documentos"></p>';
formDocumentos.innerHTML = htmlForm;

secaoRequisitos.appendChild(formDocumentos);

var botaoEnviar = document.getElementById("enviar-documentos");
var retorno = document.getElementById("retorno-documentos");

function validarArquivo(campo, arquivo) {
  if (!arquivo) {
    return "Este arquivo é obrigatório.";
  }
  if (campo.tipos.indexOf(arquivo.type) === -1) {
    return "Formato não permitido.";
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return "O arquivo ultrapassa 5 MB.";
  }
  return "";
}

function mostrarPrevia(campo, arquivo) {
  var previa = document.getElementById("previa-" + campo.id);
  previa.innerHTML = "";

  if (arquivo && arquivo.type.indexOf("image/") === 0) {
    var img = document.createElement("img");
    img.src = URL.createObjectURL(arquivo);
    img.alt = "Prévia de " + campo.rotulo;
    previa.appendChild(img);
  } else if (arquivo) {
    previa.textContent = "📄 " + arquivo.name;
  }
}

function todosValidos() {
  for (var m = 0; m < camposDocumentos.length; m++) {
    var input = document.getElementById(camposDocumentos[m].id);
    if (validarArquivo(camposDocumentos[m], input.files[0]) !== "") {
      return false;
    }
  }
  return true;
}

function aoSelecionarArquivo(campo) {
  var input = document.getElementById(campo.id);
  var arquivo = input.files[0];
  var erro = validarArquivo(campo, arquivo);

  document.getElementById("erro-" + campo.id).textContent = erro;

  if (erro === "") {
    mostrarPrevia(campo, arquivo);
  } else {
    mostrarPrevia(campo, null);
    input.value = "";
  }

  retorno.textContent = "";
  botaoEnviar.disabled = !todosValidos();
}

camposDocumentos.forEach(function (campo) {
  document.getElementById(campo.id).addEventListener("change", function () {
    aoSelecionarArquivo(campo);
  });
});

formDocumentos.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (!todosValidos()) {
    retorno.textContent = "Envie os 3 documentos para continuar.";
    return;
  }

  
  retorno.textContent =
    "✅ Documentos recebidos! Nossa equipe vai conferir sua identidade e maioridade e entrará em contato.";
  botaoEnviar.disabled = true;
});

function atualizarAnoRodape() {
  const texto = document.querySelector("footer p");
  if (texto) {
    texto.textContent = texto.textContent.replace(/\d{4}/, new Date().getFullYear());
  }
}

atualizarAnoRodape();