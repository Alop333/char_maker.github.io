let dados = {};                
let printOrder = {};
let selecionados = {};         
let removeList = {};
let idParaCategoria = {};       
let corCat = {};
let categoriaAtiva = null;
let old_color = null;
let cores = ["#ffffff"];
let blockRule = {};
let size_select = 0;

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
  blockRule = json.BlockRule;

  json.PrintOrder.forEach((item, index) => {
    printOrder[index] = item; 
  });

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
      document.querySelectorAll("nav a").forEach(b => b.classList.remove("selecionado"));
      a.classList.add("selecionado");
    });
    if (idxCat === 0) a.classList.add("selecionado");

    const img = document.createElement("img");
    img.classList.add("menu");
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
    let i = (remove === true) ? 0 : 1;

    for (i; i <= quantidade; i++) {
      const item = document.createElement("div");
      item.className = "item";
      item.dataset.index = String(i);
      item.dataset.catid = catId;

      item.setAttribute("role", "button");
      item.setAttribute("aria-pressed", "false");

      if (i > 0){
        const img = document.createElement("img");
        img.classList.add("icon");
        img.src = `data/${enc(categoria)}/Icons/${i}.png`;
        img.alt = `${categoria} - ${i}`;
        item.appendChild(img);
      }

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

  const salvo = localStorage.getItem("estadoSite");
  if (salvo) {
    const estado = JSON.parse(salvo);
    selecionados = estado.selecionados || {};
    corCat = estado.corCat || {};
    cores = estado.cores || ["#ffffff"];
    document.getElementById("Name").value = estado.nome;
    size_select = estado.size_select;

    categorias.forEach((categoria) => {
      const catId = idSeguro(categoria);
      marcarVisual(catId, selecionados[categoria]);
    });
  }

  atualizarGaleria();
  criarPopupCores();
  updateMenuCores();

  if (categorias.length > 0) showCategory(idSeguro(categorias[0]));
  var aux = document.getElementsByClassName('jsBtn');
  [].forEach.call(aux, b => b.classList.remove('selecionado')); 
  document.getElementById('Size_'+size_select).classList.add('selecionado');
}

async function reset() {
  const categorias = Object.keys(dados);
  categorias.forEach((categoria) => {
    const inicial = dados[categoria][0];
    const catId = idSeguro(categoria);
    const alvo = document.getElementById(catId);

    const lock = document.getElementById("Lock");
    alvo.dataset.lock = "true";
    const ativo = alvo.dataset.lock === "true";
    lock.classList.toggle("botao", ativo);
    lock.classList.toggle("botao-inativo", !ativo);
    
    marcarVisual(catId, Number(inicial));
    selecionados[categoria] = Number(inicial) || 0;
    corCat[categoria] = hexToRgb("#ffffff");
  });
  size_select = 0;
  cores = ["#ffffff"];
  document.getElementById("Name").value = "Nome Personagem";

  atualizarGaleria();
  updateMenuCores();
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

  popup.style.display = "none";

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

  const ativo = alvo.dataset.lock === "true";
  lock.classList.toggle("botao", ativo);
  lock.classList.toggle("botao-inativo", !ativo);

  marcarVisual(catId, selecionados[idParaCategoria[catId]]);
}

function onItemClick(e) {
  const item = e.target.closest(".item");
  if (!item) return;

  const catId = item.dataset.catid;
  const categoria = idParaCategoria[catId];
  const idxClicado = parseInt(item.dataset.index, 10);

  const atual = selecionados[categoria] || 0;
  const novoValor = (atual === idxClicado && idxClicado !== 0 && removeList[categoria]) ? 0 : idxClicado;

  let wrap = { valor: novoValor };
  checkLock(wrap);

  selecionados[categoria] = wrap.valor;
  marcarVisual(catId, wrap.valor);
  atualizarGaleria();
}

function checkLock(wrap){
  const linha = blockRule[idParaCategoria[categoriaAtiva]];

  if (linha != undefined) {
    for (const coluna of Object.keys(linha)) {
      if (linha[coluna][0].includes(wrap.valor)){
          if (linha[coluna][1].includes(selecionados[coluna])){
            var userChoice = confirm(`Essa escolha afetará a escolha de ${coluna}\nDeseja prosseguir?`);
            if (userChoice) {
              let i = dados[coluna][0];
              let colunaLock = blockRule[coluna];
              if (colunaLock != undefined && colunaLock[idParaCategoria[categoriaAtiva]] != undefined){
                while (linha[coluna][1].includes(i) || colunaLock[idParaCategoria[categoriaAtiva]][0].includes(i)){
                  i++;
                }
              } else {
                while (linha[coluna][1].includes(i)){
                  i++;
                }
              }

              selecionados[coluna] = i;

            } else {
              wrap.valor = selecionados[idParaCategoria[categoriaAtiva]];
              return;
            }
          }
      }
    }
  }

  Object.entries(blockRule).forEach(([nomeLinha, line]) => {
    if (line[idParaCategoria[categoriaAtiva]]) {
      if (line[idParaCategoria[categoriaAtiva]][1].includes(wrap.valor)){
        if(line[idParaCategoria[categoriaAtiva]][0].includes(selecionados[nomeLinha])){
          var userChoice = confirm(`Essa escolha afetará a escolha de ${nomeLinha}\nDeseja prosseguir?`);
          if (userChoice) {
              let i = dados[idParaCategoria[categoriaAtiva]][0];
              let linhaLock = blockRule[idParaCategoria[categoriaAtiva]];
              if (linhaLock != undefined && linhaLock[nomeLinha]!= undefined){
                while (line[idParaCategoria[categoriaAtiva]][0].includes(i) || linhaLock[nomeLinha][1].includes(i)){
                  i++;
                }
              } else {
                while (line[idParaCategoria[categoriaAtiva]][0].includes(i)){
                  i++;
                }
              }
            selecionados[nomeLinha] = i;

          } else {
            wrap.valor = selecionados[idParaCategoria[categoriaAtiva]];
            return;
          }
        }
      }
    }
  });
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

function marcarSize(){

}

function updateEstado(){
  const nome = document.getElementById("Name").value;

  const estado = {
    selecionados,
    corCat,
    cores,
    nome,
    size_select
  };
  localStorage.setItem("estadoSite", JSON.stringify(estado));
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
      let cor = corCat[categoria];   
      const baseImg = await recolorirImagem(baseSrc, cor);
      baseImg.alt = `${categoria} - ${printOrder[catFolder][2]} - ${val}`;
      baseImg.dataset.cat = categoria;

      const image_size = document.getElementById("galeria-imagens");
      const size_print = dados[categoria][4];

      switch (size_select){
        case 0:
          break;
        case 1:
          baseImg.style.height = size_print[0][0] + "%";
          baseImg.style.top = size_print[0][1]*image_size.offsetHeight/600 + "px";
          break;
        case 2:
          baseImg.style.width = size_print[1][0] + "%";
          baseImg.style.left = size_print[1][1]*image_size.offsetHeight/600 + "px";
          break;
      }

      imagens.push(baseImg);
    }

    const linhasSrc = `data/${enc(categoria)}/${printOrder[catFolder][2]}/Linhas/${val}.png`;
    const linhasImg = await carregarImagem(linhasSrc);
    linhasImg.alt = `${categoria} - ${printOrder[catFolder][2]} - ${val}`;
    linhasImg.dataset.cat = categoria;

    const image_size = document.getElementById("galeria-imagens");
    const size_print = dados[categoria][4];

    console.log(size_print[0][1] * image_size.offsetHeight/600);

    switch (size_select){
      case 0:
        break;
      case 1:
        linhasImg.style.height = size_print[0][0] + "%";
        linhasImg.style.top = size_print[0][1]* image_size.offsetHeight/600 + "px";
        break;
      case 2:
        linhasImg.style.width = size_print[1][0] + "%";
        linhasImg.style.left = size_print[1][1]* image_size.offsetHeight/600 + "px";
        break;
    }

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
  updateEstado();
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
    corCat[idParaCategoria[categoriaAtiva]] = old_color;
    atualizarGaleria();
  } else{
    old_color = corCat[idParaCategoria[categoriaAtiva]];
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

document.getElementById("Download").addEventListener("click", () => {
  const container = document.getElementById("galeria-imagens");

  const width = 600;
  const height = 600;

  const finalCanvas = document.createElement("canvas");

  finalCanvas.width = width;
  finalCanvas.height = height;
  const ctx = finalCanvas.getContext("2d");

  const elementos = container.querySelectorAll("img");

  elementos.forEach(el => {
    const categoria = el.dataset.cat;
    if (el.tagName.toLowerCase() === "img") {
      switch (size_select){
        case 0:
          ctx.drawImage(el, 0, 0, width, height);
          break;
        case 1:
          ctx.drawImage(el, 0, dados[categoria][4][size_select-1][1], width, height*dados[categoria][4][size_select-1][0]/100);
          break;
        case 2:
          ctx.drawImage(el, dados[categoria][4][size_select-1][1], 0, width*dados[categoria][4][size_select-1][0]/100, height);
          break;
      }}
  });

  const link = document.createElement("a");
  link.download = document.getElementById("Name").value;
  link.href = finalCanvas.toDataURL("image/png");
  link.click();
});

document.getElementById("Save").addEventListener("click", () => {
  const estado = {
    selecionados,
    corCat,
    cores
  };

  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = document.getElementById("Name").value + ".json";
  link.click();
});

document.getElementById("Open").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const conteudo = JSON.parse(e.target.result);

    selecionados = conteudo.selecionados || {};
    corCat = conteudo.corCat || {};
    cores = conteudo.cores || {};

    const categorias = Object.keys(selecionados);
    categorias.forEach((categoria) => {
      const catId = idSeguro(categoria);
      marcarVisual(catId, selecionados[categoria]);
    });

    atualizarGaleria();
    updateMenuCores();

    const color_p = document.getElementById("color");
    color_p.value = "#ffffff";
    const name = file.name.split('.');
    document.getElementById("Name").value = name[0]; 
  };
  reader.readAsText(file);
});

document.getElementById("Reset").addEventListener("click", () => {
  
    var userChoice = confirm("Tem certeza que deseja reiniciar?");
    if (userChoice) {
        reset();
    }
})

document.getElementById("Start").addEventListener("click", () => {
  const frontPage = document.getElementById("front-page");
  frontPage.style.display = "none";
})


window.addEventListener("DOMContentLoaded", init);
