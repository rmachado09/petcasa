const CHAVE_ANIMAIS = "petcasa:animais"; 
const PAGINA_DETALHES = "detalhes-animal.html"; 

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
    dataCadastro: "2026-10-01T10:00:00.000Z",
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
    dataCadastro: "2026-10-02T10:00:00.000Z",
  },
];


const gridEl = document.querySelector(".grid-animais");


const filtroEspecieEl = document.getElementById("filtro-especie");
const filtroPorteEl = document.getElementById("filtro-porte");

document.addEventListener("DOMContentLoaded", () => {
  renderizarAnimais();

  
  filtroEspecieEl.addEventListener("change", renderizarAnimais);
  filtroPorteEl.addEventListener("change", renderizarAnimais);

  atualizarAnoRodape();
});


function salvarAnimais(lista) {
  try {
    localStorage.setItem(CHAVE_ANIMAIS, JSON.stringify(lista));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar os animais:", erro);
    return false;
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

  const copia = ANIMAIS_INICIAIS.map((animal) => ({ ...animal }));
  salvarAnimais(copia);
  return copia;
}


function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function formatarIdade(anos) {
  if (anos === 0) return "Menos de 1 ano";
  if (anos === 1) return "1 ano";
  return `${anos} anos`;
}


function rotuloEspecie(animal) {
  if (animal.especie === "Gato" && animal.sexo === "Fêmea") return "Gata";
  return animal.especie;
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


function criarCard(animal) {
  const card = criarElemento("article", undefined, "card-pet");

  const img = document.createElement("img");
  img.src = caminhoFoto(animal.foto);
  img.alt = `Foto de ${animal.nome}`;
  img.loading = "lazy";

  const resumo = [
    rotuloEspecie(animal),
    animal.sexo,
    formatarIdade(Number(animal.idade)),
    `Porte ${animal.porte}`,
  ]
    .filter(Boolean)
    .join(" • ");

  const link = criarElemento("a", "Ver Ficha Detalhada");
  link.href = `${PAGINA_DETALHES}#${encodeURIComponent(animal.id)}`;

  card.append(img, criarElemento("h3", animal.nome), criarElemento("p", resumo), link);
  return card;
}

function filtrarAnimais(lista) {
  const especie = filtroEspecieEl.value; // "todos", "cao" ou "gato"
  const porte = filtroPorteEl.value; // "todos", "pequeno", "medio" ou "grande"

  return lista.filter((animal) => {
    const bateEspecie = especie === "todos" || normalizar(animal.especie) === especie;
    const batePorte = porte === "todos" || normalizar(animal.porte) === porte;
    return bateEspecie && batePorte;
  });
}


function renderizarAnimais() {
  const todos = lerAnimais();
  const visiveis = filtrarAnimais(todos);

  if (visiveis.length === 0) {
    const aviso = criarElemento(
      "p",
      todos.length === 0
        ? "Nenhum animal cadastrado no momento."
        : "Nenhum animal encontrado com esses filtros."
    );
    aviso.style.gridColumn = "1 / -1"; // ocupa a linha inteira da grade
    gridEl.replaceChildren(aviso);
    return;
  }

  gridEl.replaceChildren(...visiveis.map(criarCard));
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
