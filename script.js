function showCategory(categoryId) {
    
  document.querySelectorAll('.category').forEach(cat => {
    cat.classList.remove('active');
  });

  document.getElementById(categoryId).classList.add('active');
}
