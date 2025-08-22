function showCategory(categoryId) {
  // Esconde todas as categorias
  document.querySelectorAll('.category').forEach(cat => {
    cat.classList.remove('active');
  });
  // Mostra apenas a selecionada
  document.getElementById(categoryId).classList.add('active');
}
