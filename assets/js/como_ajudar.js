const CAMPOS = ["nome", "email", "area"]; 
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const VALIDADORES = {
  nome(valor) {
    const palavras = valor.split(/\s+/).filter((palavra) => palavra.length >= 2);
    return palavras.length >= 2 ? "" : "Informe o seu nome completo (nome e sobrenome).";
  },
  email(valor) {
    return REGEX_EMAIL.test(valor) ? "" : "Informe um e-mail válido, como nome@exemplo.com.";
  },
  area(valor) {
    return valor !== "" ? "" : "Selecione uma área de interesse.";
  },
};


const formEl = document.querySelector(".form-voluntario form");
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
  return {
    nome: formEl.elements.nome.value.trim(),
    email: formEl.elements.email.value.trim(),
    area: formEl.elements.area.value,
    disponibilidade: formEl.elements.mensagem.value.trim(),
  };
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
  const areaTexto = formEl.elements.area.selectedOptions[0].textContent;
  mostrarFeedback(
    "sucesso",
    `Obrigado, ${primeiroNome}! Recebemos o seu interesse em "${areaTexto}" e entraremos em contato em breve.`
  );

  formEl.reset();
  limparErros();
}


function atualizarAnoRodape() {
  const texto = document.querySelector("footer p");
  if (texto) {
    texto.textContent = texto.textContent.replace(/\d{4}/, new Date().getFullYear());
  }
}
