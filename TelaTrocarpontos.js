document.addEventListener("DOMContentLoaded", function() {
    const rangeFiltroPontos = document.querySelector("#pontosRange");
    const valorAtualPontos = document.querySelector("#currentPontos");
    const searchInput = document.querySelector("#flitersearch");
    const productsGrid = document.querySelector('.products-grid');
    
    // Carrinho global
    window.carrinho = window.carrinho || [];

    // Atualizar valor do filtro de pontos
    rangeFiltroPontos?.addEventListener('input', function() {
        valorAtualPontos.textContent = `${this.value} P`;
        aplicarFiltros();
    });

    // Filtro de busca
    searchInput?.addEventListener('input', aplicarFiltros);

    // Função para aplicar filtros
    function aplicarFiltros() {
        const pontosMaximos = parseInt(rangeFiltroPontos?.value || Number.MAX_SAFE_INTEGER);
        const termoBusca = searchInput?.value.toLowerCase().trim() || '';
        
        document.querySelectorAll('.product').forEach(produto => {
            const pontosProduto = parseInt(produto.dataset.points);
            const nomeProduto = produto.querySelector('h3').textContent.toLowerCase();
            
            const passaFiltrosPontos = pontosProduto <= pontosMaximos;
            const passaFiltroBusca = nomeProduto.includes(termoBusca);
            
            produto.style.display = passaFiltrosPontos && passaFiltroBusca ? 'block' : 'none';
        });
    }

    // Função para adicionar ao carrinho
    function adicionarAoCarrinho(produtoId, nome, pontos, imagem) {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;

        // Criar novo item do carrinho
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${imagem}" alt="${nome}">
            <div class="cart-info">
                <h4>${nome}</h4>
                <p>${pontos} P</p>
            </div>
            <button class="remove-item" onclick="removerDoCarrinho(this)">X</button>
        `;

        cartItems.appendChild(cartItem);
        atualizarTotalCarrinho();
        mostrarBotoesCarrinho(true);
    }

    // Função para mostrar/esconder botões do carrinho
    function mostrarBotoesCarrinho(mostrar) {
        const botoesCarrinho = document.querySelectorAll('.clear-cart-btn, .checkout-btn');
        botoesCarrinho.forEach(botao => {
            botao.style.display = mostrar ? 'block' : 'none';
        });
    }

    // Event listener para botões de adicionar ao carrinho
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('adicionar-carrinho')) {
            const produto = e.target.closest('.product');
            const produtoId = produto.dataset.id;
            const nome = produto.querySelector('h3').textContent;
            const pontos = produto.querySelector('.pontos').textContent;
            const imagem = produto.querySelector('img').src;
            
            adicionarAoCarrinho(produtoId, nome, pontos, imagem);
        }
    });

    // Função para remover item do carrinho
    window.removerDoCarrinho = function(botao) {
        const item = botao.closest('.cart-item');
        item.remove();
        
        const cartItems = document.querySelector('.cart-items');
        if (cartItems.children.length === 0) {
            mostrarBotoesCarrinho(false);
        }
        
        atualizarTotalCarrinho();
    };

    // Função para limpar carrinho
    window.limparCarrinho = function() {
        const cartItems = document.querySelector('.cart-items');
        if (cartItems) {
            cartItems.innerHTML = '';
            atualizarTotalCarrinho();
            mostrarBotoesCarrinho(false);
        }
    };

    // Função para carregar produtos (paginação)
    window.carregarProdutos = async function(pagina) {
        try {
            const response = await fetch(`carregar_produtos.php?pagina=${pagina}`);
            const data = await response.json();

            if (data.success) {
                // Atualizar grid de produtos
                if (productsGrid) {
                    productsGrid.innerHTML = data.produtos.map(produto => `
                        <div class="product" data-points="${produto.pontos}" data-id="${produto.id}">
                            <img src="${produto.imagem_path}" alt="Imagem do Produto" class="product-image">
                            <h3>${produto.nome}</h3>
                            <p class="pontos">${produto.pontos} P</p>
                            <button class="adicionar-carrinho" data-id="${produto.id}">
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    `).join('');
                }

                // Atualizar paginação
                const paginationDiv = document.querySelector('.pagination');
                if (paginationDiv) {
                    paginationDiv.innerHTML = `
                        <button class="prev" ${data.paginacao.pagina_atual <= 1 ? 'disabled' : ''} 
                                onclick="carregarProdutos(${data.paginacao.pagina_atual - 1})">
                            Anterior
                        </button>
                        ${Array.from({length: data.paginacao.total_paginas}, (_, i) => i + 1)
                            .map(num => `
                                <button class="page-number ${num === data.paginacao.pagina_atual ? 'active' : ''}" 
                                        onclick="carregarProdutos(${num})">
                                    ${num}
                                </button>
                            `).join('')}
                        <button class="next" ${data.paginacao.pagina_atual >= data.paginacao.total_paginas ? 'disabled' : ''} 
                                onclick="carregarProdutos(${data.paginacao.pagina_atual + 1})">
                            Próximo
                        </button>
                    `;
                }

                // Reaplicar filtros após carregar novos produtos
                aplicarFiltros();
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="error">Erro ao carregar produtos. Por favor, tente novamente.</p>';
            }
        }
    };

    // Inicialização
    aplicarFiltros();
    mostrarBotoesCarrinho(document.querySelector('.cart-items')?.children.length > 0);
});

  
  
  