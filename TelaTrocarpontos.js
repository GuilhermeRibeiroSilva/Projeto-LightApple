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

  document.addEventListener("DOMContentLoaded", function () {
    const carrinho = []; // Array para armazenar os produtos do carrinho

    // Função para atualizar o carrinho no DOM
    function atualizarCarrinho() {
        const carrinhoMenu = document.querySelector(".cart-items");
        carrinhoMenu.innerHTML = ""; // Limpa o carrinho antes de atualizar

        carrinho.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-info">
                    <h4>${item.name}</h4>
                    <p>${item.points} P</p>
                </div>
                <button class="remove-item" data-name="${item.name}">Remover</button>
            `;
            carrinhoMenu.appendChild(cartItem);
        });

        // Adiciona o evento de remoção
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                removerDoCarrinho(this.dataset.name);
            });
        });
    }

    // Função para adicionar um item ao carrinho
    function adicionarAoCarrinho(produto) {
        const nomeProduto = produto.querySelector("h3").textContent;
        const pontosProduto = produto.querySelector("p").textContent;
        const imagemProduto = produto.querySelector("img").src;

        // Adiciona o produto ao array carrinho
        carrinho.push({
            name: nomeProduto,
            points: pontosProduto,
            image: imagemProduto
        });

        // Atualiza o carrinho no DOM
        atualizarCarrinho();
    }

    // Função para remover item do carrinho
    function removerDoCarrinho(nomeProduto) {
        const indice = carrinho.findIndex(item => item.name === nomeProduto);
        if (indice > -1) {
            carrinho.splice(indice, 1); // Remove o item
        }

        // Atualiza o carrinho no DOM
        atualizarCarrinho();
    }

    // Adiciona evento de clique para todos os botões de "adicionar ao carrinho"
    document.querySelectorAll(".adicionar-carrinho").forEach(botao => {
        botao.addEventListener("click", function () {
            const produto = this.closest(".product");
            adicionarAoCarrinho(produto);
        });
    });
});

  
  
  