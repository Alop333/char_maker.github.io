// Estado
let dados = {};                 // conteúdo do JSON
let printOrder = {};
let selecionados = {};          // { Categoria: numeroSelecionado }
let removeList = {};
let idParaCategoria = {};       // { categoriaIdSeguro: "Categoria Original" }
let corCat = {};
let categoriaAtiva = null;
let old_color = null;
const cores = ["#ffffff"];

const color_ref = 
["#ffffff","#e8e8e8","#d1d1d1","#bababa","#a3a3a3","#8c8c8c","#757575","#5e5e5e","#474747","#303030","#191919","#020202",
"#ffbfbf","#ffdfbf","#ffffbf","#dfffbf","#bfffbf","#bfffdf","#bfffff","#bfdfff","#bfbfff","#dfbfff","#ffbfff","#ffbfdf",
"#ff7f7f","#ffbf7f","#ffff7f","#bfff7f","#7fff7f","#7fffbf","#7fffff","#7fbfff","#7f7fff","#bf7fff","#ff7fff","#ff7fbf",
"#ff3f3f","#ff9f3f","#ffff3f","#9fff3f","#3fff3f","#3fff9f","#3fffff","#3f9fff","#3f3fff","#9f3fff","#ff3fff","#ff3f9f",
"#ff0000","#ff7f00","#ffff00","#7fff00","#00ff00","#00ff7f","#00ffff","#007fff","#0000ff","#7f00ff","#ff00ff","#ff007f",
"#d80000","#d86c00","#d8d800","#6cd800","#00d800","#00d86c","#00d8d8","#006cd8","#0000d8","#6c00d8","#d800d8","#d8006c",
"#b20000","#b25900","#b2b200","#59b200","#00b200","#00b259","#00b2b2","#0059b2","#0000b2","#5900b2","#b200b2","#b20059",
"#8c0000","#8c4600","#8c8c00","#468c00","#008c00","#008c46","#008c8c","#00468c","#00008c","#46008c","#8c008c","#8c0046",
"#650000","#653200","#656500","#326500","#006500","#006532","#006565","#003265","#000065","#320065","#650065","#650032",
"#ffe5d4","#ffdec7","#ffd5b8","#ffc9a9","#ffbb98","#f0ab87","#db9974","#c08461","#9f6d4c","#785537","#4b3920","#181c09"];

function idSeguro(txt) {
  return txt
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

function el(q)      { return document.querySelector(q); }
function els(q)     { return document.querySelectorAll(q); }
function enc(seg)   { return encodeURIComponent(seg); } 

async function init() {
  const res = await fetch("categorias.json");
  const json = await res.json();

  dados = Object.assign({}, ...json.Categoria);

  json.PrintOrder.forEach((item, index) => {
    printOrder[index] = item; 
  });

  //console.log(printOrder);

  const navUl   = el("nav ul");
  const content = el(".content");

  navUl.innerHTML = "";
  content.innerHTML = "";
  selecionados = {};
  idParaCategoria = {};

  const categorias = Object.keys(dados);

  categorias.forEach((categoria, idxCat) => {
    const [inicial, remove, group, quantidade] = dados[categoria];
    const catId = idSeguro(categoria);
    idParaCategoria[catId] = categoria;

    const li = document.createElement("li");
    const a  = document.createElement("a");
    a.href = "#";
    a.textContent = categoria;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showCategory(catId);
    });
    const img = document.createElement("img");
    img.src = `data/${enc(categoria)}/${enc(categoria)}.png`;
    img.alt = `${categoria}`;
    a.appendChild(img);

    li.appendChild(a);

    navUl.appendChild(li);

    const sec = document.createElement("div");
    sec.className = "category";
    sec.id = catId;
    if (idxCat === 0) sec.classList.add("active");

    sec.dataset.group = group;
    if (group > 0){
      sec.dataset.lock = "true"}
    else {
      sec.dataset.lock = "false"}

    const wrap = document.createElement("div");
    wrap.className = "grid-itens"; 
    for (let i = 1; i <= quantidade; i++) {
      const item = document.createElement("div");
      item.className = "item";
      item.textContent = String(i);
      item.dataset.index = String(i);
      item.dataset.catid = catId;

      if (remove === true){
      item.addEventListener("mouseover", () => {
        if (item.classList.contains("selecionado")){
          item.style.background = "#FF0000";
          item.style.color = "white";
          item.style.borderColor = "#550000";
        }
      });
      item.addEventListener("mouseout", () => {
        item.style.background = "";
        item.style.color = "";
        item.style.borderColor = "";
      });
      }

      item.setAttribute("role", "button");
      item.setAttribute("aria-pressed", "false");

      const img = document.createElement("img");
      img.src = `data/${enc(categoria)}/Icons/${i}.png`;
      img.alt = `${categoria} - ${i}`;
      item.appendChild(img);

      wrap.appendChild(item);
    }

    sec.appendChild(wrap);
    content.appendChild(sec);

    selecionados[categoria] = Number(inicial) || 0;
    removeList[categoria] = remove;
    corCat[categoria] = hexToRgb("#ffffff");
    marcarVisual(catId, selecionados[categoria]);
  });

  content.addEventListener("click", onItemClick);

  atualizarSelecionados();
  atualizarGaleria();
  criarPopupCores();

  if (categorias.length > 0) showCategory(idSeguro(categorias[0]));
  updateMenuCores()

}

function criarPopupCores() {
  const popup = document.getElementById("color-popup");
  popup.innerHTML = ""; 

  const grade = document.createElement("div");
  grade.classList.add("color-grid");

  const inputColor = document.createElement("input");
  inputColor.type = "color";
  inputColor.id = "color";
  inputColor.name = "color";
  inputColor.value = "#ffffff"; 
  
  inputColor.addEventListener("input", () => {
    const hex = document.getElementById("color")?.value || "#ffffff";
    corCat[idParaCategoria[categoriaAtiva]] = hexToRgb(hex);

    atualizarGaleria();
  });

  color_ref.forEach(cor => {
    const btn = document.createElement("button");
    btn.classList.add("color-btn");
    btn.style.backgroundColor = cor;

    btn.addEventListener("click", () => {
      inputColor.value = cor;
      corCat[idParaCategoria[categoriaAtiva]] = hexToRgb(cor);
      atualizarGaleria()

      document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selecionado"));
      btn.classList.add("selecionado");
    });

    grade.appendChild(btn);
  });

  const confirmar = document.createElement("button");
  confirmar.textContent = "Confirmar";
  confirmar.classList.add("confirm-btn");

  confirmar.addEventListener("click", () => {
      hex = document.getElementById("color")?.value || "#ffffff";
      corCat[idParaCategoria[categoriaAtiva]] = hexToRgb(hex);
      cores.push(hex);
      updateMenuCores()
      aplicarCor(hex);
      popup.style.display = "none";
  });

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "8px"; 

  controls.appendChild(confirmar);
  controls.appendChild(inputColor);

  popup.appendChild(grade);
  popup.appendChild(controls);

  popup.style.display = "none";
}

function updateMenuCores(){
  const menu = document.getElementById("menu-cores");
  menu.innerHTML = "";

  cores.forEach(cor => {
    const div = document.createElement("div");
    div.classList.add("cor");
    div.style.backgroundColor = cor;
    div.dataset.cor = cor;

    div.addEventListener("click", () => {
      aplicarCor(cor);
    });

    menu.appendChild(div);
  });
}

function showCategory(catId) {
  els(".category").forEach(c => c.classList.remove("active"));
  const alvo = document.getElementById(catId);
  const lock = document.getElementById("Lock");
  categoriaAtiva = catId;
  if (alvo) alvo.classList.add("active");
  lock.style.display = (alvo.dataset.group === "0") ? "none" : "flex";
}

function onItemClick(e) {
  const item = e.target.closest(".item");
  if (!item) return;

  const catId = item.dataset.catid;
  const categoria = idParaCategoria[catId];
  const idxClicado = parseInt(item.dataset.index, 10);

  const atual = selecionados[categoria] || 0;
  const novoValor = (atual === idxClicado && idxClicado !== 0 && removeList[categoria]) ? 0 : idxClicado;

  selecionados[categoria] = novoValor;
  marcarVisual(catId, novoValor);

  atualizarSelecionados();
  atualizarGaleria();
}

function marcarVisual(catId, valor) {
  const sec = document.getElementById(catId);
  if (!sec) return;

  sec.querySelectorAll(".item").forEach(el => {
    el.classList.remove("selecionado");
    el.setAttribute("aria-pressed", "false");
  });

  const seletor = `.item[data-index="${valor}"]`;
  const elAtivo = sec.querySelector(seletor) || sec.querySelector(`.item[data-index="0"]`);
  if (elAtivo) {
    elAtivo.classList.add("selecionado");
    elAtivo.setAttribute("aria-pressed", "true");
  }
}

function atualizarSelecionados() {
  const cont = document.getElementById("lista-selecionados");
  cont.innerHTML = "";

  Object.keys(selecionados).forEach(categoria => {
    const val = Number(selecionados[categoria] || 0);
    if (val > 0) {
      const bloco = document.createElement("div");
      bloco.className = "categoria-bloco";

      const h4 = document.createElement("h4");
      h4.textContent = categoria + ":";
      bloco.appendChild(h4);

      const span = document.createElement("span");
      span.textContent = "✔️ " + val;
      span.style.display = "block";
      bloco.appendChild(span);

      cont.appendChild(bloco);
    }
  });
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function carregarImagem(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function recolorirImagem(src, { r, g, b }) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { 
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      const out = new Image();
      out.src = canvas.toDataURL("image/png");
      resolve(out);
    };
    img.onerror = reject;
    img.src = src;
  });
}

async function carregarCamadasSelecionadas(selecionados) {
  const categorias = typeof printOrder !== "undefined"
    ? Object.keys(printOrder)
    : Object.keys(selecionados);


  const tarefas = categorias.map(async (catFolder) => {
    const categoria = printOrder[catFolder][0];
    const val = Number(selecionados[categoria] || 0);
    if (val <= 0) return null;

    const imagens = [];

    if (printOrder[catFolder][1] === 1) {
      const baseSrc = `data/${enc(categoria)}/${printOrder[catFolder][2]}/Base/${val}.png`;
      const cor = corCat[categoria];
      const baseImg = await recolorirImagem(baseSrc, cor);
      baseImg.alt = `${categoria} - ${printOrder[catFolder][2]} - ${val}`;
      baseImg.dataset.cat = categoria;
      imagens.push(baseImg);
    }

    const linhasSrc = `data/${enc(categoria)}/${printOrder[catFolder][2]}/Linhas/${val}.png`;
    const linhasImg = await carregarImagem(linhasSrc);
    linhasImg.alt = `${categoria} - ${printOrder[catFolder][2]} - ${val}`;
    linhasImg.dataset.cat = categoria;
    imagens.push(linhasImg);

    return { categoria, imagens };
  });

  const resultados = await Promise.all(tarefas);
  return resultados.filter(Boolean);
}

function renderizarCamadas(container, camadas) {
  container.innerHTML = "";
  for (const camada of camadas) {
    for (const img of camada.imagens) {
      container.appendChild(img); 
    }
  }
}

async function atualizarGaleria() {
  const gal = document.getElementById("galeria-imagens");
  const camadas = await carregarCamadasSelecionadas(selecionados);
  renderizarCamadas(gal, camadas);
}

/*document.getElementById("colorSubmit").addEventListener("click", () => {
  const hex = document.getElementById("color")?.value || "#ffffff";
  corCat[idParaCategoria[categoriaAtiva]] = hexToRgb(hex);

  cores.push(hex);
  updateMenuCores()

  aplicarCor(hex);
});*/


document.getElementById("colorPop").addEventListener("click", () => {

  const btn = document.getElementById("colorPop");
  const popup = document.getElementById("color-popup");
  const rect = btn.getBoundingClientRect();

  if (popup.style.display === "grid"){
    const color_p = document.getElementById("color");
    color_p.value = old_color;
    corCat[idParaCategoria[categoriaAtiva]] = hexToRgb(old_color);
    atualizarGaleria();
  } else{
    old_color = document.getElementById("color").value;
  }

  popup.style.display = popup.style.display === "grid" ? "none"  : "grid";
  popup.style.left = (rect.left - popup.offsetWidth - 5) + "px";
  popup.style.top = (rect.top - popup.offsetHeight - 5) + "px";

});

function aplicarCor(cor){
  corCat[idParaCategoria[categoriaAtiva]] = hexToRgb(cor);  
  const catAtiva = document.getElementById(categoriaAtiva);

  if (catAtiva.dataset.lock === "true" && catAtiva.dataset.group > 0) {
    els(".category").forEach(c => {
      if (c.dataset.group === catAtiva.dataset.group && c.dataset.lock === "true") 
        corCat[idParaCategoria[c.id]] = hexToRgb(cor);
    })} 
  
  atualizarGaleria()
};

document.getElementById("Lock").addEventListener("click", () => {
  const catAtiva = document.getElementById(categoriaAtiva);
  if (catAtiva.dataset.lock === "true") { catAtiva.dataset.lock = "false"} else { catAtiva.dataset.lock = "true" };

  const botao = document.getElementById("Lock");
  const ativo = catAtiva.dataset.lock === "true";

  botao.classList.toggle("botao", ativo);
  botao.classList.toggle("botao-inativo", !ativo);
});


window.addEventListener("DOMContentLoaded", init);
