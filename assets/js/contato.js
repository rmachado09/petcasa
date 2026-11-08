const CAMPOS = ["nome", "email", "telefone", "assunto", "mensagem"];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


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
    return valor.length >= 10 ? "" : "Escreva uma mensagem com pelo menos 10 caracteres.";
  },
};


const formEl = document.querySelector(".form-contato");
let feedbackEl = null; 

document.addEventListener("DOMContentLoaded", () => {
  formEl.noValidate = true; 
  criarAreasDeErro();
  criarFeedback();

  formEl.addEventListener("submit", enviarFormulario);

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
}


function atualizarAnoRodape() {
  const texto = document.querySelector("footer p");
  if (texto) {
    texto.textContent = texto.textContent.replace(/\d{4}/, new Date().getFullYear());
  }
}
