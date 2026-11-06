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