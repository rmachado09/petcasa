function atualizarAnoRodape() {
  const texto = document.querySelector("footer p");
  if (texto) {
    texto.textContent = texto.textContent.replace(/\d{4}/, new Date().getFullYear());
  }
}

atualizarAnoRodape();