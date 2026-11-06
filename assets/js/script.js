const CHAVE_ANIMAIS = "petcasa:animais"; 
const PAGINA_DETALHES = "pages/detalhes-animal.html"; 
const MAX_DESTAQUES = 3;
 
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230">
       <rect width="100%" height="100%" fill="#e3f1e5"/>
       <text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">🐾</text>
     </svg>`
  );
 
document.addEventListener("DOMContentLoaded", () => {
  renderizarDestaques();
  configurarLembrete();
  atualizarAnoRodape();
});

function lerAnimais() {
  try {
    const bruto = localStorage.getItem(CHAVE_ANIMAIS);
    if (bruto === null) return null;
    const dados = JSON.parse(bruto);
    return Array.isArray(dados) ? dados : null;
  } catch (erro) {
    console.error("Não foi possível ler os animais salvos:", erro);
    return null;
  }
}

function formatarIdade(anos) {
  if (anos === 0) return "Menos de 1 ano";
  if (anos === 1) return "1 ano";
  return `${anos} anos`;
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
  img.src = animal.foto || PLACEHOLDER;
  img.alt = `Foto de ${animal.nome}`;
  img.loading = "lazy";
 
  const info = document.createElement("p");
  const dados = [
    ["Espécie", animal.especie],
    ["Porte", animal.porte],
    ["Idade", formatarIdade(Number(animal.idade))],
  ];
  dados.forEach(([rotulo, valor], i) => {
    if (i > 0) info.append(" | ");
    info.append(criarElemento("strong", `${rotulo}:`), ` ${valor}`);
  });
 
  const link = criarElemento("a", "Ver Ficha Completa");
  link.href = `${PAGINA_DETALHES}#${encodeURIComponent(animal.id)}`;
 
  card.append(
    img,
    criarElemento("h3", animal.nome),
    info,
    criarElemento("p", animal.descricao),
    link
  );
  return card;
}
 
function renderizarDestaques() {
  const secao = document.querySelector(".destaques");
  if (!secao) return;
 
  const animais = lerAnimais();
 
  
  if (animais === null) return;
 
  const destaques = animais
    .filter((animal) => animal.status === "Disponível")
    .sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro))
    .slice(0, MAX_DESTAQUES);
 
  secao.querySelectorAll(".card-pet").forEach((card) => card.remove());
 
  if (destaques.length === 0) {
    secao.append(criarElemento("p", "Nenhum animal disponível no momento."));
    return;
  }
 
  destaques.forEach((animal) => secao.append(criarCard(animal)));
}