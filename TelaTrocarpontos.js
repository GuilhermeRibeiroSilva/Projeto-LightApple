document.addEventListener('DOMContentLoaded', function () {
    // Selecionar todos os botões de coração
    const favoriteButtons = document.querySelectorAll('.favoritar');
  
    favoriteButtons.forEach(button => {
      button.addEventListener('click', function () {
        // Alternar entre favoritado e não favoritado
        if (this.classList.contains('nao-favoritado')) {
          this.classList.remove('nao-favoritado');
          this.classList.add('favoritado');
        } else {
          this.classList.remove('favoritado');
          this.classList.add('nao-favoritado');
        }
      });
    });
  }); 

  document.addEventListener("DOMContentLoaded", function () {
    const paginationButtons = document.querySelectorAll(".page-number");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");
  
    let currentPage = 1;
  
    function updatePagination() {
      paginationButtons.forEach(button => {
        const page = parseInt(button.textContent);
        button.classList.toggle("active", page === currentPage);
      });
  
      // Atualizar estado dos botões "Previous" e "Next"
      prevButton.disabled = currentPage === 1;
      nextButton.disabled = currentPage === paginationButtons.length;
    }
  
    paginationButtons.forEach(button => {
      button.addEventListener("click", function () {
        currentPage = parseInt(this.textContent);
        updatePagination();
      });
    });
  
    prevButton.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        updatePagination();
      }
    });
  
    nextButton.addEventListener("click", function () {
      if (currentPage < paginationButtons.length) {
        currentPage++;
        updatePagination();
      }
    });
  
    // Inicializa a página com a primeira ativa
    updatePagination();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const products = document.querySelectorAll('.product');
    const categoryLinks = document.querySelectorAll('.categoria-link');
    const pontosRange = document.getElementById('pontosRange');
    const currentPontos = document.getElementById('currentPontos');
    
    let selectedCategory = null;
    let selectedPontos = pontosRange.value;
  
    // Função para atualizar a exibição dos produtos com base nos filtros
    const filterProducts = () => {
      products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        const productPontos = parseInt(product.getAttribute('data-points'));
        
        const categoryMatch = selectedCategory === 'Todos' || selectedCategory === null || productCategory === selectedCategory;
        const pontosMatch = productPontos <= selectedPontos;
  
        if (categoryMatch && pontosMatch) {
          product.style.display = 'block';
        } else {
          product.style.display = 'none';
        }
      });
    };
  
    // Filtro por categoria
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        selectedCategory = e.target.textContent.trim();
        filterProducts();
      });
    });
  
    // Filtro por pontos
    pontosRange.addEventListener('input', () => {
      selectedPontos = pontosRange.value;
      currentPontos.textContent = `${selectedPontos} P`;
      filterProducts();
    });
  
    // Inicia com os filtros aplicados
    filterProducts();
  });
  
  
  