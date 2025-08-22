let selecionados = {}; // Armazena item escolhido por categoria

// Função para gerar IDs seguros (sem espaços, acentos, caracteres especiais)
function gerarIdSeguro(texto) {
  return texto
    .normalize("NFD")                // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "_")            // troca espaços por "_"
    .replace(/[^\w-]/g, "")          // remove símbolos
    .toLowerCase();
}

async function carregarCategorias() {
  const response = await fetch("categorias.json");
  const data = await response.json();

  const nav = document.querySelector("nav ul");
  const content = document.querySelector(".content");

  nav.innerHTML = "";
  content.innerHTML = "";
  selecionados = {};

  Object.keys(data).forEach((categoria, index) => {
    const categoriaId = gerarIdSeguro(categoria);

    // Criar menu
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = categoria;
    link.onclick = () => showCategory(categoriaId);
    li.appendChild(link);
    nav.appendChild(li);

    // Criar seção
    const div = document.createElement("div");
    div.id = categoriaId;
    div.classList.add("category");
    if (index === 0) div.classList.add("active");

    const h2 = document.createElement("h2");
    h2.textContent = categoria;
    div.appendChild(h2);

    selecionados[categoria] = null; // começa sem nenhum item

    data[categoria].forEach(item => {
      const divItem = document.createElement("div");
      divItem.classList.add("item");
      divItem.textContent = item;

      divItem.onclick = () => selecionarUnico(categoria, categoriaId, item, divItem);

      div.appendChild(divItem);
    });

    content.appendChild(div);
  });

  atualizarSelecionados(); // render inicial
}

function showCategory(categoryId) {
  document.querySelectorAll(".category").forEach(cat => {
    cat.classList.remove("active");
  });
  document.getElementById(categoryId).classList.add("active");
}

function selecionarUnico(categoria, categoriaId, item, elemento) {
  const jaSelecionado = selecionados[categoria] === item;

  // Desmarca todos os itens da categoria
  document.querySelectorAll(`#${categoriaId} .item`).forEach(el => {
    el.classList.remove("selecionado");
  });

  if (jaSelecionado) {
    // Se clicou de novo no mesmo -> remove seleção
    selecionados[categoria] = null;
  } else {
    // Caso contrário -> marca novo item
    elemento.classList.add("selecionado");
    selecionados[categoria] = item;
  }

  atualizarSelecionados();
}

function atualizarSelecionados() {
  const container = document.getElementById("lista-selecionados");
  container.innerHTML = "";

  Object.keys(selecionados).forEach(categoria => {
    if (selecionados[categoria] > 0) {
      const bloco = document.createElement("div");
      bloco.classList.add("categoria-bloco");

      const titulo = document.createElement("h4");
      titulo.textContent = categoria + ":";
      bloco.appendChild(titulo);

      const span = document.createElement("span");
      span.textContent = "✔️ " + selecionados[categoria];
      span.style.display = "block";
      bloco.appendChild(span);

      container.appendChild(bloco);
    }
  });
}

window.onload = carregarCategorias;
