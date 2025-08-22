async function carregarCategorias() {
  const response = await fetch("categorias.json");
  const data = await response.json();

  const nav = document.querySelector("nav ul");
  const content = document.querySelector(".content");

  // Limpa menus e conteúdo
  nav.innerHTML = "";
  content.innerHTML = "";

  // Cria dinamicamente
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
    if (index === 0) div.classList.add("active"); // primeira visível

    const h2 = document.createElement("h2");
    h2.textContent = categoria;
    div.appendChild(h2);

    data[categoria].forEach(item => {
      const divItem = document.createElement("div");
      divItem.classList.add("item");
      divItem.textContent = item;
      div.appendChild(divItem);
    });

    content.appendChild(div);
  });
}

function showCategory(categoryId) {
  document.querySelectorAll(".category").forEach(cat => {
    cat.classList.remove("active");
  });
  document.getElementById(categoryId).classList.add("active");
}

// Chama ao carregar a página
window.onload = carregarCategorias;
