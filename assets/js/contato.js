const CAMPOS = ["nome", "email", "telefone", "assunto", "mensagem"];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITE_MENSAGEM = 500; // máximo de caracteres da mensagem


const VALIDADORES = {
  nome(valor) {
    const palavras = valor.split(/\s+/).filter((palavra) => palavra.length >= 2);
    return palavras.length >= 2 ? "" : "Informe o seu nome completo (nome e sobrenome).";
  },
  email(valor) {
    return REGEX_EMAIL.test(valor) ? "" : "Informe um e-mail válido, como nome@exemplo.com.";
  },
  telefone(valor) {
    const digitos = valor.replace(/\D/g, "");
    const valido = digitos.length === 10 || digitos.length === 11;
    return valido ? "" : "Informe o telefone com DDD, por exemplo (11) 99999-9999.";
  },
  assunto(valor) {
    return valor !== "" ? "" : "Selecione um assunto.";
  },
  mensagem(valor) {
    if (valor.length < 10) return "Escreva uma mensagem com pelo menos 10 caracteres.";
    if (valor.length > LIMITE_MENSAGEM) return `A mensagem pode ter no máximo ${LIMITE_MENSAGEM} caracteres.`;
    return "";
  },
};


const formEl = document.querySelector(".form-contato");
let feedbackEl = null; 
let contadorEl = null; 

document.addEventListener("DOMContentLoaded", () => {
  formEl.noValidate = true; 
  criarAreasDeErro();
  criarFeedback();
  criarContador();

  formEl.addEventListener("submit", enviarFormulario);
  configurarMascaraTelefone();
  configurarValidacaoAoVivo();
  preencherPelaUrl();

  atualizarAnoRodape();
});



function criarElemento(tag, texto, classe) {
  const el = document.createElement(tag);
  if (texto !== undefined) el.textContent = texto;
  if (classe) el.className = classe;
  return el;
}


function coletarDados() {
  const dados = {};
  CAMPOS.forEach((campo) => {
    dados[campo] = formEl.elements[campo].value.trim();
  });
  return dados;
}


function criarAreasDeErro() {
  CAMPOS.forEach((campo) => {
    const erroEl = criarElemento("span", "", "erro");
    erroEl.id = `erro-${campo}`;
    erroEl.setAttribute("role", "alert");

    const campoEl = formEl.elements[campo];
    campoEl.setAttribute("aria-describedby", erroEl.id);
    campoEl.insertAdjacentElement("afterend", erroEl);
  });
}

function mostrarErro(campo, mensagem) {
  const campoEl = formEl.elements[campo];
  document.getElementById(`erro-${campo}`).textContent = mensagem;

  if (mensagem) campoEl.setAttribute("aria-invalid", "true");
  else campoEl.removeAttribute("aria-invalid");
}

function limparErros() {
  CAMPOS.forEach((campo) => mostrarErro(campo, ""));
}


function validarCampo(campo) {
  const mensagem = VALIDADORES[campo](formEl.elements[campo].value.trim());
  mostrarErro(campo, mensagem);
  return mensagem === "";
}


function configurarValidacaoAoVivo() {
  CAMPOS.forEach((campo) => {
    const campoEl = formEl.elements[campo];

    campoEl.addEventListener("blur", () => validarCampo(campo));

    const revalidar = () => {
      if (campoEl.hasAttribute("aria-invalid")) validarCampo(campo);
    };
    campoEl.addEventListener("input", revalidar);
    campoEl.addEventListener("change", revalidar); 
  });
}


function criarFeedback() {
  feedbackEl = criarElemento("div", "", "feedback");
  feedbackEl.setAttribute("role", "status");
  feedbackEl.hidden = true;
  formEl.before(feedbackEl);
}


function mostrarFeedback(tipo, texto) {
  feedbackEl.className = `feedback feedback-${tipo}`;
  feedbackEl.textContent = texto;
  feedbackEl.hidden = false;
  feedbackEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}


function formatarTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);

  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function configurarMascaraTelefone() {
  const telefoneEl = formEl.elements.telefone;
  telefoneEl.setAttribute("inputmode", "tel");
  telefoneEl.addEventListener("input", () => {
    const formatado = formatarTelefone(telefoneEl.value);
    if (telefoneEl.value !== formatado) telefoneEl.value = formatado;
  });
}


function criarContador() {
  const mensagemEl = formEl.elements.mensagem;
  mensagemEl.maxLength = LIMITE_MENSAGEM;

  contadorEl = criarElemento("span", "", "contador");
  mensagemEl.insertAdjacentElement("afterend", contadorEl);

  mensagemEl.addEventListener("input", atualizarContador);
  atualizarContador();
}

function atualizarContador() {
  const total = formEl.elements.mensagem.value.length;
  contadorEl.textContent = `${total}/${LIMITE_MENSAGEM}`;
  contadorEl.classList.toggle("perto-do-limite", total >= LIMITE_MENSAGEM * 0.9);
}


function preencherPelaUrl() {
  const params = new URLSearchParams(window.location.search);

  const assunto = params.get("assunto");
  const assuntosValidos = Array.from(formEl.elements.assunto.options).map((opcao) => opcao.value);
  if (assunto && assuntosValidos.includes(assunto)) {
    formEl.elements.assunto.value = assunto;
  }

  const animal = (params.get("animal") || "").trim().slice(0, 60);
  const mensagemEl = formEl.elements.mensagem;
  if (animal && mensagemEl.value === "") {
    mensagemEl.value = `Olá! Tenho interesse em adotar ${animal}. Gostaria de saber mais sobre o processo de adoção.`;
    atualizarContador();
  }
}



function enviarFormulario(evento) {
  evento.preventDefault(); 
  feedbackEl.hidden = true;


  let primeiroInvalido = null;
  CAMPOS.forEach((campo) => {
    if (!validarCampo(campo) && primeiroInvalido === null) primeiroInvalido = campo;
  });

  if (primeiroInvalido !== null) {
    mostrarFeedback("erro", "Corrija os campos destacados e tente novamente.");
    formEl.elements[primeiroInvalido].focus();
    return;
  }

  const dados = coletarDados();


  const primeiroNome = dados.nome.split(/\s+/)[0];
  mostrarFeedback("sucesso", `Obrigado, ${primeiroNome}! Recebemos a sua mensagem e responderemos em breve.`);

  formEl.reset();
  limparErros();
  atualizarContador();
}


function atualizarAnoRodape() {
  const texto = document.querySelector("footer p");
  if (texto) {
    texto.textContent = texto.textContent.replace(/\d{4}/, new Date().getFullYear());
  }
}
