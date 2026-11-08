const CAMPOS = ["nome", "email", "area"]; 
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEXTO_BOTAO_COPIAR = "Copiar chave";
const CHAVE_ANIMAIS = "petcasa:animais"; 
const VALORES_APADRINHAMENTO = [30, 50, 100, 200]; 

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230">
       <rect width="100%" height="100%" fill="#e3f1e5"/>
       <text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">🐾</text>
     </svg>`
  );


const ANIMAIS_INICIAIS = [
  { id: "thor", nome: "Thor", especie: "Cão", idade: 2, status: "Disponível", foto: "assets/img/thor.jpg" },
  { id: "mia", nome: "Mia", especie: "Gato", idade: 1, status: "Disponível", foto: "assets/img/mia.jpg" },
];


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
  configurarValidacaoAoVivo();
  configurarPix();
  configurarApadrinhamento(); 
  configurarAtalhos();

  atualizarAnoRodape();
});


document.addEventListener(
  "error",
  (evento) => {
    const img = evento.target;
    if (img.tagName === "IMG" && img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
  },
  true
);


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


function normalizarChave(chave) {
  const ehCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(chave);
  const ehCnpj = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(chave);
  return ehCpf || ehCnpj ? chave.replace(/\D/g, "") : chave;
}


function copiarComPlanoB(texto) {
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();

  let copiou = false;
  try {
    copiou = document.execCommand("copy");
  } catch (erro) {
    copiou = false;
  }
  area.remove();
  return copiou;
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (erro) {
    return copiarComPlanoB(texto);
  }
}

async function copiarChave(botao, chave) {
  const copiou = await copiarTexto(normalizarChave(chave));

  botao.textContent = copiou ? "Copiado!" : "Não foi possível copiar";
  botao.disabled = true;
  setTimeout(() => {
    botao.textContent = TEXTO_BOTAO_COPIAR;
    botao.disabled = false;
  }, 2000);
}


function configurarPix() {
  const tabela = document.querySelector(".dados-doacao table");
  if (!tabela) return;

  const cabecalho = tabela.querySelector("thead tr");
  if (cabecalho) cabecalho.append(criarElemento("th", "Ação"));

  tabela.querySelectorAll("tbody tr").forEach((linha) => {
    const celulas = linha.querySelectorAll("td");
    const chave = celulas[1] ? celulas[1].textContent.trim() : "";
    const celulaAcao = document.createElement("td");

    if (chave) {
      const botao = criarElemento("button", TEXTO_BOTAO_COPIAR, "btn-copiar");
      botao.type = "button";
      botao.setAttribute("aria-label", `Copiar ${celulas[0].textContent.trim()}`);
      botao.addEventListener("click", () => copiarChave(botao, chave));
      celulaAcao.append(botao);
    }
    linha.append(celulaAcao);
  });
}


function lerAnimais() {
  try {
    const bruto = localStorage.getItem(CHAVE_ANIMAIS);
    if (bruto !== null) {
      const dados = JSON.parse(bruto);
      if (Array.isArray(dados)) return dados;
    }
  } catch (erro) {
    console.error("Não foi possível ler os animais salvos:", erro);
  }
  return ANIMAIS_INICIAIS;
}


function animaisParaApadrinhar() {
  return lerAnimais().filter((animal) => animal.status !== "Adotado");
}

function formatarIdade(anos) {
  const idade = Number(anos);
  if (idade === 0) return "menos de 1 ano";
  if (idade === 1) return "1 ano";
  return `${idade} anos`;
}


function caminhoFoto(foto) {
  if (!foto) return PLACEHOLDER;
  if (/^(https?:|data:)/.test(foto)) return foto;
  return `../${foto}`;
}

function formatarValor(reais) {
  return reais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const apadrinhar = { formEl: null, feedbackEl: null, cartaoEl: null, animais: [] };

const CAMPOS_APADRINHAR = ["animal", "nome", "email", "valor"];
const VALIDADORES_APADRINHAR = {
  animal(valor) {
    return valor !== "" ? "" : "Escolha o animal que você quer apadrinhar.";
  },
  nome: VALIDADORES.nome,
  email: VALIDADORES.email,
  valor(valor) {
    return valor !== "" ? "" : "Escolha o valor mensal.";
  },
};


function criarLinhaForm(rotulo, id, campoEl) {
  const linha = document.createElement("div");
  const label = criarElemento("label", rotulo);
  label.htmlFor = id;
  campoEl.id = id;
  linha.append(label, campoEl);
  return linha;
}

function criarCampoTexto(tipo, nome, dica) {
  const input = document.createElement("input");
  input.type = tipo;
  input.name = nome;
  input.placeholder = dica;
  return input;
}

function criarSelect(nome, textoInicial, opcoes) {
  const select = document.createElement("select");
  select.name = nome;
  select.append(new Option(textoInicial, ""));
  opcoes.forEach(([valor, texto]) => select.append(new Option(texto, valor)));
  return select;
}


function configurarApadrinhamento() {
  const referencia = document.querySelector(".formas-ajuda");
  if (!referencia) return;

  apadrinhar.animais = animaisParaApadrinhar();

  const secao = criarElemento("section", undefined, "form-apadrinhar");
  secao.id = "apadrinhar";
  secao.append(
    criarElemento("h2", "Quero Apadrinhar um Animal"),
    criarElemento(
      "p",
      "Escolha o animal que você quer ajudar e a contribuição mensal. O valor é usado na alimentação e nos cuidados veterinários dele até ser adotado."
    )
  );
  referencia.after(secao);

  if (apadrinhar.animais.length === 0) {
    secao.append(criarElemento("p", "No momento não há animais disponíveis para apadrinhar. Volte em breve!"));
    return;
  }

  const form = document.createElement("form");
  form.noValidate = true;
  apadrinhar.formEl = form;

  const selectAnimal = criarSelect(
    "animal",
    "Selecione um animal",
    apadrinhar.animais.map((a) => [a.id, `${a.nome} (${a.especie}, ${formatarIdade(a.idade)})`])
  );
  const selectValor = criarSelect(
    "valor",
    "Selecione um valor",
    VALORES_APADRINHAMENTO.map((v) => [String(v), `${formatarValor(v)} por mês`])
  );

  apadrinhar.cartaoEl = criarElemento("article", undefined, "animal-escolhido");
  apadrinhar.cartaoEl.hidden = true;

  const botao = criarElemento("button", "Quero Apadrinhar");
  botao.type = "submit";
  const linhaBotao = document.createElement("div");
  linhaBotao.append(botao);

  form.append(
    criarLinhaForm("Animal:", "animal-apadrinhar", selectAnimal),
    apadrinhar.cartaoEl,
    criarLinhaForm("Seu Nome Completo:", "nome-padrinho", criarCampoTexto("text", "nome", "Digite seu nome completo")),
    criarLinhaForm("Seu E-mail:", "email-padrinho", criarCampoTexto("email", "email", "seuemail@exemplo.com")),
    criarLinhaForm("Contribuição Mensal:", "valor-padrinho", selectValor),
    linhaBotao
  );

  apadrinhar.feedbackEl = criarElemento("div", "", "feedback");
  apadrinhar.feedbackEl.setAttribute("role", "status");
  apadrinhar.feedbackEl.hidden = true;
  secao.append(apadrinhar.feedbackEl, form);

  CAMPOS_APADRINHAR.forEach((campo) => {
    const campoEl = form.elements[campo];
    const erroEl = criarElemento("span", "", "erro");
    erroEl.id = `erro-padrinho-${campo}`;
    erroEl.setAttribute("role", "alert");
    campoEl.setAttribute("aria-describedby", erroEl.id);
    campoEl.insertAdjacentElement("afterend", erroEl);

    campoEl.addEventListener("blur", () => validarCampoApadrinhar(campo));
    const revalidar = () => {
      if (campoEl.hasAttribute("aria-invalid")) validarCampoApadrinhar(campo);
    };
    campoEl.addEventListener("input", revalidar);
    campoEl.addEventListener("change", revalidar);
  });

  selectAnimal.addEventListener("change", mostrarAnimalEscolhido);
  form.addEventListener("submit", enviarApadrinhamento);

  preselecionarAnimalDaUrl(selectAnimal);
}


function preselecionarAnimalDaUrl(selectAnimal) {
  const pedido = new URLSearchParams(window.location.search).get("animal");
  if (!pedido) return;

  const busca = pedido.trim().toLowerCase();
  const animal = apadrinhar.animais.find((a) => a.id === busca || a.nome.toLowerCase() === busca);
  if (animal) {
    selectAnimal.value = animal.id;
    mostrarAnimalEscolhido();
  }
}

function obterAnimalEscolhido() {
  const id = apadrinhar.formEl.elements.animal.value;
  return apadrinhar.animais.find((animal) => animal.id === id) || null;
}


function mostrarAnimalEscolhido() {
  const animal = obterAnimalEscolhido();
  const cartao = apadrinhar.cartaoEl;
  cartao.hidden = animal === null;
  if (!animal) {
    cartao.replaceChildren();
    return;
  }

  const foto = document.createElement("img");
  foto.src = caminhoFoto(animal.foto);
  foto.alt = `Foto de ${animal.nome}`;

  const texto = document.createElement("div");
  texto.append(
    criarElemento("strong", animal.nome),
    criarElemento("span", `${animal.especie} · ${formatarIdade(animal.idade)}`)
  );
  cartao.replaceChildren(foto, texto);
}

function mostrarErroApadrinhar(campo, mensagem) {
  const campoEl = apadrinhar.formEl.elements[campo];
  document.getElementById(`erro-padrinho-${campo}`).textContent = mensagem;
  if (mensagem) campoEl.setAttribute("aria-invalid", "true");
  else campoEl.removeAttribute("aria-invalid");
}

function validarCampoApadrinhar(campo) {
  const mensagem = VALIDADORES_APADRINHAR[campo](apadrinhar.formEl.elements[campo].value.trim());
  mostrarErroApadrinhar(campo, mensagem);
  return mensagem === "";
}

function enviarApadrinhamento(evento) {
  evento.preventDefault();
  const { formEl: form, feedbackEl: aviso } = apadrinhar;
  aviso.hidden = true;

  let primeiroInvalido = null;
  CAMPOS_APADRINHAR.forEach((campo) => {
    if (!validarCampoApadrinhar(campo) && primeiroInvalido === null) primeiroInvalido = campo;
  });

  if (primeiroInvalido !== null) {
    aviso.className = "feedback feedback-erro";
    aviso.textContent = "Corrija os campos destacados e tente novamente.";
    aviso.hidden = false;
    form.elements[primeiroInvalido].focus();
    return;
  }

  const animal = obterAnimalEscolhido();
  const primeiroNome = form.elements.nome.value.trim().split(/\s+/)[0];
  const valor = formatarValor(Number(form.elements.valor.value));

  
  aviso.className = "feedback feedback-sucesso";
  aviso.textContent = `Obrigado, ${primeiroNome}! Você apadrinhou ${animal.nome} com ${valor} por mês. Vamos entrar em contato pelo e-mail informado para combinar a forma de pagamento.`;
  aviso.hidden = false;
  aviso.scrollIntoView({ behavior: "smooth", block: "nearest" });

  form.reset();
  CAMPOS_APADRINHAR.forEach((campo) => mostrarErroApadrinhar(campo, ""));
  mostrarAnimalEscolhido();
}

function criarAtalho(textoDoTitulo, textoDoLink, secaoSeletor, idDaSecao) {
  const secao = document.querySelector(secaoSeletor);
  const card = Array.from(document.querySelectorAll(".card-ajuda")).find((c) =>
    c.querySelector("h3").textContent.includes(textoDoTitulo)
  );
  if (!secao || !card) return;

  secao.id = idDaSecao;
  const link = criarElemento("a", textoDoLink);
  link.href = `#${idDaSecao}`;
  card.append(link);
  return link;
}

function configurarAtalhos() {
  criarAtalho("Doação", "Ver dados para doação", ".dados-doacao", "doacao");
  criarAtalho("Apadrinhar", "Escolher animal para apadrinhar", ".form-apadrinhar", "apadrinhar");

  const linkVoluntario = criarAtalho("Voluntário", "Quero ser voluntário", ".form-voluntario", "voluntario");
  if (linkVoluntario) {
    linkVoluntario.addEventListener("click", (evento) => {
      evento.preventDefault(); 
      document.getElementById("voluntario").scrollIntoView({ behavior: "smooth" });
      formEl.elements.nome.focus({ preventScroll: true });
      history.pushState(null, "", "#voluntario");
    });
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
