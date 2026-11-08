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


const CAMPOS = ["nome", "especie", "raca", "porte", "idade", "sexo", "status", "descricao"];


const gridEl = document.querySelector(".grid-animais");
const contagemEl = document.getElementById("contagem");


const buscaEl = document.getElementById("busca");
const filtroEspecieEl = document.getElementById("filtro-especie");
const filtroPorteEl = document.getElementById("filtro-porte");
const ordenacaoEl = document.getElementById("ordenacao");
const btnLimparEl = document.getElementById("btn-limpar");
const btnNovoEl = document.getElementById("btn-novo");


const dialogEl = document.getElementById("dialogo-form");
const formEl = document.getElementById("form-animal");
const tituloFormEl = document.getElementById("titulo-form");
const idEl = document.getElementById("animal-id");
const fotoEl = document.getElementById("animal-foto");
const previaEl = document.getElementById("previa-foto");
const racaEl = document.getElementById("raca");
const datalistEl = document.getElementById("lista-racas");
const statusApiEl = document.getElementById("status-api");
const btnFotoEl = document.getElementById("btn-buscar-foto");
const btnCancelarEl = document.getElementById("btn-cancelar");

const racasPorEspecie = {}; 

document.addEventListener("DOMContentLoaded", () => {
  renderizarAnimais();

  
  buscaEl.addEventListener("input", renderizarAnimais);
  filtroEspecieEl.addEventListener("change", renderizarAnimais);
  filtroPorteEl.addEventListener("change", renderizarAnimais);
  ordenacaoEl.addEventListener("change", renderizarAnimais);
  btnLimparEl.addEventListener("click", limparFiltros);


  btnNovoEl.addEventListener("click", () => abrirFormulario());
  btnCancelarEl.addEventListener("click", () => dialogEl.close());
  dialogEl.addEventListener("click", (evento) => {
    if (evento.target === dialogEl) dialogEl.close(); 
  });
  formEl.addEventListener("submit", salvarFormulario);
  formEl.elements.especie.addEventListener("change", aoTrocarEspecie);
  btnFotoEl.addEventListener("click", buscarFotoDaRaca);

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

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function obterAnimal(id) {
  return lerAnimais().find((animal) => animal.id === id) || null;
}


function criarAnimal(dados) {
  const lista = lerAnimais();
  lista.push({ ...dados, id: gerarId(), dataCadastro: new Date().toISOString() });
  return salvarAnimais(lista);
}


function atualizarAnimal(id, dados) {
  const lista = lerAnimais();
  const indice = lista.findIndex((animal) => animal.id === id);
  if (indice === -1) return false;

  const antigo = lista[indice];
  lista[indice] = { ...antigo, ...dados, id: antigo.id, dataCadastro: antigo.dataCadastro };
  return salvarAnimais(lista);
}


function removerAnimal(id) {
  const lista = lerAnimais();
  const restante = lista.filter((animal) => animal.id !== id);
  if (restante.length === lista.length) return false;
  return salvarAnimais(restante);
}


function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
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



let temporizadorAviso;

function mostrarAviso(mensagem) {
  let aviso = document.querySelector(".aviso");
  if (!aviso) {
    aviso = criarElemento("div", undefined, "aviso");
    aviso.setAttribute("role", "status");
    document.body.append(aviso);
  }
  aviso.textContent = mensagem;
  aviso.hidden = false;

  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => {
    aviso.hidden = true;
  }, 3000);
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

  const btnEditar = criarElemento("button", "Editar", "btn btn-secundario");
  btnEditar.type = "button";
  btnEditar.setAttribute("aria-label", `Editar ${animal.nome}`);
  btnEditar.addEventListener("click", () => abrirFormulario(animal));

  const btnExcluir = criarElemento("button", "Excluir", "btn btn-perigo");
  btnExcluir.type = "button";
  btnExcluir.setAttribute("aria-label", `Excluir ${animal.nome}`);
  btnExcluir.addEventListener("click", () => excluirAnimal(animal.id));

  const acoes = criarElemento("div", undefined, "acoes");
  acoes.append(btnEditar, btnExcluir);

  const rodape = criarElemento("div", undefined, "card-rodape");
  rodape.append(link, acoes);

  card.append(img, criarElemento("h3", animal.nome), criarElemento("p", resumo), rodape);
  return card;
}

function filtrarAnimais(lista) {
  const especie = filtroEspecieEl.value; 
  const porte = filtroPorteEl.value; 

  return lista.filter((animal) => {
    const bateEspecie = especie === "todos" || normalizar(animal.especie) === especie;
    const batePorte = porte === "todos" || normalizar(animal.porte) === porte;
    return bateEspecie && batePorte;
  });
}


function pesquisarAnimais(lista) {
  const termo = normalizar(buscaEl.value.trim());
  if (termo === "") return lista;

  return lista.filter(
    (animal) => normalizar(animal.nome).includes(termo) || normalizar(animal.raca).includes(termo)
  );
}

function ordenarAnimais(lista) {
  const copia = [...lista]; 

  switch (ordenacaoEl.value) {
    case "nome-az":
      copia.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      break;
    case "nome-za":
      copia.sort((a, b) => b.nome.localeCompare(a.nome, "pt-BR"));
      break;
    case "idade-asc":
      copia.sort((a, b) => a.idade - b.idade);
      break;
    case "idade-desc":
      copia.sort((a, b) => b.idade - a.idade);
      break;
    case "antigos":
      copia.sort((a, b) => new Date(a.dataCadastro) - new Date(b.dataCadastro));
      break;
    default: // "recentes"
      copia.sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));
  }
  return copia;
}

function renderizarAnimais() {
  const todos = lerAnimais();
  const visiveis = ordenarAnimais(pesquisarAnimais(filtrarAnimais(todos)));

  contagemEl.textContent = `Mostrando ${visiveis.length} de ${todos.length} animais`;

  if (visiveis.length === 0) {
    const aviso = criarElemento(
      "p",
      todos.length === 0
        ? "Nenhum animal cadastrado no momento."
        : "Nenhum animal encontrado com esses filtros."
    );
    aviso.style.gridColumn = "1 / -1"; 
    gridEl.replaceChildren(aviso);
    return;
  }

  gridEl.replaceChildren(...visiveis.map(criarCard));
}

function limparFiltros() {
  buscaEl.value = "";
  filtroEspecieEl.value = "todos";
  filtroPorteEl.value = "todos";
  ordenacaoEl.value = "recentes";
  renderizarAnimais();
}


function excluirAnimal(id) {
  const animal = obterAnimal(id);
  if (!animal) return;

  if (!confirm(`Deseja realmente excluir ${animal.nome}? Essa ação não pode ser desfeita.`)) {
    return;
  }

  if (removerAnimal(id)) {
    renderizarAnimais();
    mostrarAviso(`${animal.nome} foi excluído.`);
  } else {
    mostrarAviso("Não foi possível excluir o animal.");
  }
}

function abrirFormulario(animal = null) {
  formEl.reset();
  limparErros();
  statusApiEl.textContent = "";
  datalistEl.replaceChildren();

  if (animal) {
    tituloFormEl.textContent = "Editar animal";
    idEl.value = animal.id;
    CAMPOS.forEach((campo) => {
      formEl.elements[campo].value = animal[campo] ?? "";
    });
    fotoEl.value = animal.foto || "";
    carregarRacas(animal.especie);
  } else {
    tituloFormEl.textContent = "Novo animal";
    idEl.value = "";
    fotoEl.value = "";
  }

  atualizarPrevia();
  dialogEl.showModal();
  formEl.elements.nome.focus();
}

function lerFormulario() {
  const dados = {};
  CAMPOS.forEach((campo) => {
    dados[campo] = formEl.elements[campo].value.trim();
  });
  return dados;
}


function validar(dados) {
  const erros = {};

  if (dados.nome.length < 2) {
    erros.nome = "Informe o nome (mínimo de 2 caracteres).";
  } else if (dados.nome.length > 40) {
    erros.nome = "O nome deve ter no máximo 40 caracteres.";
  }

  if (dados.especie === "") erros.especie = "Selecione a espécie.";
  if (dados.porte === "") erros.porte = "Selecione o porte.";

  const idade = Number(dados.idade);
  if (dados.idade === "" || !Number.isInteger(idade) || idade < 0 || idade > 30) {
    erros.idade = "Informe uma idade inteira entre 0 e 30 anos.";
  }

  if (dados.sexo === "") erros.sexo = "Selecione o sexo.";
  if (dados.status === "") erros.status = "Selecione a situação.";

  if (dados.descricao.length < 10) {
    erros.descricao = "Descreva o animal com pelo menos 10 caracteres.";
  }

  return erros;
}

function limparErros() {
  formEl.querySelectorAll("[data-erro]").forEach((span) => {
    span.textContent = "";
  });
  CAMPOS.forEach((campo) => {
    formEl.elements[campo].removeAttribute("aria-invalid");
  });
}

function mostrarErros(erros) {
  limparErros();
  Object.entries(erros).forEach(([campo, mensagem]) => {
    formEl.querySelector(`[data-erro="${campo}"]`).textContent = mensagem;
    formEl.elements[campo].setAttribute("aria-invalid", "true");
  });
}

function salvarFormulario(evento) {
  evento.preventDefault(); 

  const dados = lerFormulario();
  const erros = validar(dados);
  mostrarErros(erros);

  const camposComErro = Object.keys(erros);
  if (camposComErro.length > 0) {
    mostrarAviso("Corrija os campos destacados.");
    formEl.elements[camposComErro[0]].focus();
    return;
  }

  const animal = {
    ...dados,
    idade: Number(dados.idade),
    raca: dados.raca || "Sem raça definida",
    foto: fotoEl.value,
  };

  const id = idEl.value;
  const ok = id ? atualizarAnimal(id, animal) : criarAnimal(animal);

  if (!ok) {
    mostrarAviso("Não foi possível salvar. Verifique o armazenamento do navegador.");
    return;
  }

  dialogEl.close();
  renderizarAnimais();
  mostrarAviso(id ? `${animal.nome} foi atualizado!` : `${animal.nome} foi cadastrado!`);
}


const API = {
  async buscarRacas(especie) {
    if (especie === "Cão") {
      const resposta = await fetch("https://dog.ceo/api/breeds/list/all");
      if (!resposta.ok) throw new Error("Falha ao buscar raças de cães");
      const dados = await resposta.json();

      const racas = [];
      for (const [raca, subracas] of Object.entries(dados.message)) {
        if (subracas.length === 0) {
          racas.push({ nome: capitalizar(raca), caminho: raca });
        } else {
          subracas.forEach((sub) => {
            racas.push({
              nome: `${capitalizar(raca)} ${capitalizar(sub)}`,
              caminho: `${raca}/${sub}`,
            });
          });
        }
      }
      return racas;
    }

    const resposta = await fetch("https://api.thecatapi.com/v1/breeds");
    if (!resposta.ok) throw new Error("Falha ao buscar raças de gatos");
    const dados = await resposta.json();
    return dados.map((raca) => ({
      nome: raca.name,
      id: raca.id,
      imagem: raca.reference_image_id
        ? `https://cdn2.thecatapi.com/images/${raca.reference_image_id}.jpg`
        : "",
    }));
  },

  async buscarFoto(especie, raca) {
    if (especie === "Cão") {
      const resposta = await fetch(`https://dog.ceo/api/breed/${raca.caminho}/images/random`);
      if (!resposta.ok) throw new Error("Falha ao buscar foto do cão");
      const dados = await resposta.json();
      return dados.message;
    }

    try {
      const resposta = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${raca.id}`);
      if (!resposta.ok) throw new Error("Falha ao buscar foto do gato");
      const dados = await resposta.json();
      if (dados[0]?.url) return dados[0].url;
    } catch (erro) {
      
    }
    if (raca.imagem) return raca.imagem;
    throw new Error("Nenhuma foto encontrada para esta raça");
  },
};


async function carregarRacas(especie) {
  datalistEl.replaceChildren();
  if (!especie) {
    statusApiEl.textContent = "";
    return;
  }

  statusApiEl.textContent = "Carregando raças da API...";
  try {
    if (!racasPorEspecie[especie]) {
      racasPorEspecie[especie] = await API.buscarRacas(especie);
    }
    
    if (formEl.elements.especie.value !== especie) return;

    const opcoes = racasPorEspecie[especie].map((raca) => {
      const opcao = document.createElement("option");
      opcao.value = raca.nome;
      return opcao;
    });
    datalistEl.replaceChildren(...opcoes);
    statusApiEl.textContent =
      `${racasPorEspecie[especie].length} raças disponíveis. ` +
      "Escolha uma sugestão para buscar a foto.";
  } catch (erro) {
    console.error(erro);
    statusApiEl.textContent =
      "Não foi possível carregar as raças. Você pode digitar a raça manualmente.";
  }
}


async function buscarFotoDaRaca() {
  const especie = formEl.elements.especie.value;
  const nomeRaca = racaEl.value.trim();

  if (!especie) {
    statusApiEl.textContent = "Escolha a espécie primeiro.";
    return;
  }

  const raca = (racasPorEspecie[especie] || []).find(
    (item) => normalizar(item.nome) === normalizar(nomeRaca)
  );
  if (!raca) {
    statusApiEl.textContent = "Escolha uma raça da lista de sugestões para buscar a foto.";
    return;
  }

  btnFotoEl.disabled = true;
  btnFotoEl.textContent = "Buscando...";
  try {
    fotoEl.value = await API.buscarFoto(especie, raca);
    atualizarPrevia();
    statusApiEl.textContent = "Foto carregada! Clique de novo para ver outra.";
  } catch (erro) {
    console.error(erro);
    statusApiEl.textContent = "Não foi possível buscar a foto agora. Tente novamente.";
  } finally {
    btnFotoEl.disabled = false;
    btnFotoEl.textContent = "Buscar foto da raça";
  }
}


function aoTrocarEspecie(evento) {
  racaEl.value = "";
  fotoEl.value = "";
  atualizarPrevia();
  carregarRacas(evento.target.value);
}

function atualizarPrevia() {
  if (fotoEl.value) {
    previaEl.src = caminhoFoto(fotoEl.value);
    previaEl.hidden = false;
  } else {
    previaEl.removeAttribute("src");
    previaEl.hidden = true;
  }
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

atualizarAnoRodape();

