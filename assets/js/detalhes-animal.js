const CHAVE_ANIMAIS = "petcasa:animais"; 

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230">
       <rect width="100%" height="100%" fill="#e3f1e5"/>
       <text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">🐾</text>
     </svg>`
  );


const ANIMAIS_INICIAIS = [
  {
    id: "thor",
    nome: "Thor",
    especie: "Cão",
    raca: "Sem raça definida",
    sexo: "Macho",
    idade: 2,
    porte: "Médio",
    status: "Disponível",
    descricao: "Thor é brincalhão, sociável com outros animais e adora longos passeios.",
    foto: "assets/img/thor.jpg",
  },
  {
    id: "mia",
    nome: "Mia",
    especie: "Gato",
    raca: "Sem raça definida",
    sexo: "Fêmea",
    idade: 1,
    porte: "Pequeno",
    status: "Disponível",
    descricao: "Mia é extremamente carinhosa, tranquila e vacinada.",
    foto: "assets/img/mia.jpg",
  },
];


const CAMPOS_EXTRAS = [
  ["vacinacao", "Vacinação"],
  ["castrado", "Castrado"],
  ["testes", "Testes"],
];

const conteudoEl = document.getElementById("conteudo-animal");
const TITULO_PADRAO = document.title; 

document.addEventListener("DOMContentLoaded", () => {
  mostrarAnimal();
  atualizarAnoRodape();
});

window.addEventListener("hashchange", mostrarAnimal);

function mostrarAnimal() {
  const id = obterIdDaUrl();
  const animal = obterAnimal(id);

  if (animal) {
    document.title = `PetCasa - ${animal.nome}`;
    conteudoEl.replaceChildren(criarLinkVoltar(), criarFicha(animal));
  } else {
    document.title = TITULO_PADRAO;
    conteudoEl.replaceChildren(criarNaoEncontrado(id));
  }
}

function obterIdDaUrl() {
  const hash = window.location.hash.slice(1);
  try {
    return decodeURIComponent(hash);
  } catch (erro) {
    return hash; 
  }
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

function obterAnimal(id) {
  if (!id) return null;
  return lerAnimais().find((animal) => animal.id === id) || null;
}


function formatarIdade(anos) {
  if (anos === 0) return "Menos de 1 ano";
  if (anos === 1) return "1 ano";
  return `${anos} anos`;
}


function caminhoFoto(foto) {
  if (!foto) return PLACEHOLDER;
  if (/^(https?:|data:)/.test(foto)) return foto;
  return `../${foto}`;
}

function criarElemento(tag, texto, classe) {
  const el = document.createElement(tag);
  if (texto !== undefined) el.textContent = texto;
  if (classe) el.className = classe;
  return el;
}


function criarLinhaInfo(rotulo, valor) {
  const p = document.createElement("p");
  p.append(criarElemento("strong", `${rotulo}:`), ` ${valor}`);
  return p;
}


function formatarValor(valor) {
  if (valor === true) return "Sim";
  if (valor === false) return "Não";
  return String(valor);
}


function criarFicha(animal) {
  const ficha = criarElemento("article", undefined, "perfil-detalhado");
  ficha.id = animal.id;

  const img = document.createElement("img");
  img.src = caminhoFoto(animal.foto);
  img.alt = `Foto de ${animal.nome}`;

  const info = criarElemento("section", undefined, "info-saude");
  info.append(
    criarElemento("h3", "Informações e Saúde"),
    criarLinhaInfo("Espécie", animal.especie),
    criarLinhaInfo("Raça", animal.raca),
    criarLinhaInfo("Sexo", animal.sexo),
    criarLinhaInfo("Idade", formatarIdade(Number(animal.idade))),
    criarLinhaInfo("Porte", animal.porte),
    criarLinhaInfo("Situação", animal.status)
  );
 
  for (const [chave, rotulo] of CAMPOS_EXTRAS) {
    const valor = animal[chave];
    if (valor !== undefined && valor !== null && valor !== "") {
      info.append(criarLinhaInfo(rotulo, formatarValor(valor)));
    }
  }

  const historia = criarElemento("section", undefined, "historia");
  historia.append(
    criarElemento("h3", animal.historia ? "História do Resgate" : `Sobre ${animal.nome}`),
    criarElemento("p", animal.historia || animal.descricao)
  );

  const artigo = animal.sexo === "Fêmea" ? "a" : "o";
  const botao = criarElemento("a", `Quero Adotar ${artigo} ${animal.nome}`, "btn");
  botao.href = "contato.html";

  ficha.append(criarElemento("h2", animal.nome), img, info, historia, botao);
  return ficha;
}

function criarLinkVoltar() {
  const link = criarElemento("a", "← Voltar para os animais", "voltar");
  link.href = "animais.html";
  return link;
}


function criarNaoEncontrado(id) {
  const mensagem = id
    ? "Não encontramos esse animal. Ele pode ter sido removido."
    : "Nenhum animal foi selecionado.";

  const link = criarElemento("a", "Ver animais disponíveis", "btn");
  link.href = "animais.html";

  const secao = criarElemento("section", undefined, "nao-encontrado");
  secao.append(criarElemento("h2", "Animal não encontrado"), criarElemento("p", mensagem), link);
  return secao;
}

document.addEventListener(
  "error",
  (evento) => {
    const img = evento.target;
    if (img instanceof HTMLImageElement && !img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = PLACEHOLDER;
    }
  },
  true
);


function atualizarAnoRodape() {
  const texto = document.querySelector("footer p");
  if (texto) {
    texto.textContent = texto.textContent.replace(/\d{4}/, new Date().getFullYear());
  }
}
