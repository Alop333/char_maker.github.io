let selecionados = {}; // Armazena itens escolhidos por categoria

async function carregarCategorias() {
  const response = await fetch("categorias.json");
  const data = await response.json();

  const nav = document.querySelector("nav ul");
  const content = document.querySelector(".content");

  nav.innerHTML = "";
  content.innerHTML = "";
  selecionados = {};

  Object.keys(data).forEach((categoria, index) => {
    // Criar menu
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = categoria;
    link.onclick = () => showCategory(categoria);
    li.appendChild(link);
    nav.appendChild(li);

    // Criar seção
    const div = document.createElement("div");
    div.id = categoria;
    div.classList.add("category");
    if (index === 0) div.classList.add("active");

    const h2 = document.createElement("h2");
    h2.textContent = categoria;
    div.appendChild(h2);

    selecionados[categoria] = []; // inicializa categoria

    data[categoria].forEach((item, itemIndex) => {
      const divItem = document.createElement("div");
      divItem.classList.add("item");
      divItem.textContent = item;

      divItem.onclick = () => toggleItem(categoria, item, divItem);

      // ✅ Seleciona automaticamente o primeiro item de cada categoria
      if (itemIndex === 0) {
        selecionados[categoria].push(item);
        divItem.classList.add("selecionado");
      }

      div.appendChild(divItem);
    });

    content.appendChild(div);
  });

  atualizarSelecionados(); // renderiza seleção inicial
}

function showCategory(categoryId) {
  document.querySelectorAll(".category").forEach(cat => {
    cat.classList.remove("active");
  });
  document.getElementById(categoryId).classList.add("active");
}

function toggleItem(categoria, item, elemento) {
  let lista = selecionados[categoria];
  const index = lista.indexOf(item);

  if (index === -1) {
    // adicionar
    lista.push(item);
    elemento.classList.add("selecionado");
  } else {
    // remover
    lista.splice(index, 1);
    elemento.classList.remove("selecionado");
  }

  atualizarSelecionados();
}

function atualizarSelecionados() {
  const container = document.getElementById("lista-selecionados");
  container.innerHTML = "";

  Object.keys(selecionados).forEach(categoria => {
    if (selecionados[categoria].length > 0) {
      const bloco = document.createElement("div");
      bloco.classList.add("categoria-bloco");

      const titulo = document.createElement("h4");
      titulo.textContent = categoria + ":";
      bloco.appendChild(titulo);

      const lista = document.createElement("div");
      selecionados[categoria].forEach(item => {
        const span = document.createElement("span");
        span.textContent = "✔️ " + item;
        span.style.display = "block";
        lista.appendChild(span);
      });

      bloco.appendChild(lista);
      container.appendChild(bloco);
    }
  });
}

window.onload = carregarCategorias;
