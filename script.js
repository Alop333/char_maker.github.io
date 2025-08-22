let dadosCategorias = {};   // conteúdo do categorias.json
let selecionados = {};      // índice selecionado por categoria (ou null)

// Gera IDs seguros para usar no DOM
function gerarIdSeguro(texto) {
  return texto
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "_")                             // espaços -> _
    .replace(/[^\w-]/g, "")                           // remove símbolos
    .toLowerCase();
}

async function carregarCategorias() {
  const resp = await fetch("categorias.json");
  dadosCategorias = await resp.json();

  const nav = document.querySelector("nav ul");
  const content = document.querySelector(".content");

  nav.innerHTML = "";
  content.innerHTML = "";
  selecionados = {};

  Object.keys(dadosCategorias).forEach((categoria, indexCat) => {
    const categoriaId = gerarIdSeguro(categoria);
    selecionados[categoria] = null; // começa sem seleção

    // Menu
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = categoria;
    a.onclick = () => showCategory(categoriaId);
    li.appendChild(a);
    nav.appendChild(li);

    // Seção
    const sec = document.createElement("div");
    sec.id = categoriaId;
    sec.classList.add("category");
    if (indexCat === 0) sec.classList.add("active");

    const h2 = document.createElement("h2");
    h2.textContent = categoria;
    sec.appendChild(h2);

    dadosCategorias[categoria].forEach((item, idx) => {
      const el = document.createElement("div");
      el.className = "item";
      el.textContent = item;

      // metadados para o handler
      el.dataset.categoria = categoria;      // nome original (com acentos)
      el.dataset.categoriaId = categoriaId;  // id seguro
      el.dataset.index = String(idx);

      // acessibilidade
      el.setAttribute("role", "button");
      el.setAttribute("aria-pressed", "false");

      sec.appendChild(el);
    });

    content.appendChild(sec);
  });

  // Handler único via delegação (pega qualquer .item futuro também)
  content.addEventListener("click", onItemClick);

  atualizarSelecionados();
}

function showCategory(categoryId) {
  document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
  document.getElementById(categoryId).classList.add("active");
}

function onItemClick(event) {
  const itemEl = event.target.closest(".item");
  if (!itemEl) return;

  const categoria   = itemEl.dataset.categoria;      // chave do objeto selecionados
  const categoriaId = itemEl.dataset.categoriaId;
  const idx         = parseInt(itemEl.dataset.index, 10);

  const jaSelecionado = selecionados[categoria] === idx;

  // 1) Limpa seleção visual de TODA a categoria
  document.querySelectorAll(`#${categoriaId} .item`).forEach(el => {
    el.classList.remove("selecionado");
    el.setAttribute("aria-pressed", "false");
  });

  if (jaSelecionado) {
    // 2a) Se clicou no mesmo -> deixa sem seleção
    selecionados[categoria] = null;
  } else {
    // 2b) Seleciona o novo item
    itemEl.classList.add("selecionado");
    itemEl.setAttribute("aria-pressed", "true");
    selecionados[categoria] = idx;
  }

  atualizarSelecionados();
}

function atualizarSelecionados() {
  const cont = document.getElementById("lista-selecionados");
  cont.innerHTML = "";

  Object.keys(selecionados).forEach(categoria => {
    const idx = selecionados[categoria];
    if (idx !== null) {
      const bloco = document.createElement("div");
      bloco.classList.add("categoria-bloco");

      const h4 = document.createElement("h4");
      h4.textContent = categoria + ":";
      bloco.appendChild(h4);

      const span = document.createElement("span");
      span.textContent = "✔️ " + dadosCategorias[categoria][idx];
      span.style.display = "block";
      bloco.appendChild(span);

      cont.appendChild(bloco);
    }
  });
}

window.onload = carregarCategorias;
