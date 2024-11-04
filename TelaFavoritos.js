document.addEventListener("DOMContentLoaded", function() {
    const rangeFiltro = document.querySelector("#priceRange");
    const valorAtual = document.querySelector("#currentPrice");
    const rangeFiltroDistancia = document.querySelector("#distanciaRange");
    const valorAtualDistancia = document.querySelector("#currentDistancia");
    const searchInput = document.querySelector("#flitersearch");
    const productsGrid = document.querySelector('.products-grid');
    const paginationDiv = document.querySelector('.pagination');
    let currentPage = 1;
    let totalPages = 1;

    // Função para aplicar filtros
    function aplicarFiltros() {
        if (!productsGrid) return;

        const limiteColeta = parseInt(rangeFiltro.value, 10);
        const distanciaMaxima = parseInt(rangeFiltroDistancia.value, 10);
        const termoBusca = searchInput.value.toLowerCase();

        const cards = productsGrid.querySelectorAll('.product');
        cards.forEach(card => {
            const limiteCard = parseInt(card.dataset.limiteColeta, 10);
            const distanciaCard = parseInt(card.dataset.distancia, 10);
            const nomeEmpresa = card.querySelector('h3').textContent.toLowerCase();

            const passaLimite = limiteCard >= limiteColeta || limiteColeta === 0;
            const passaDistancia = distanciaCard <= distanciaMaxima || distanciaMaxima === 0;
            const passaBusca = nomeEmpresa.includes(termoBusca);

            card.style.display = (passaLimite && passaDistancia && passaBusca) ? 'block' : 'none';
        });
    }

    // Função para carregar favoritos
    async function carregarFavoritos(pagina = 1) {
        try {
            const response = await fetch(`carregar_favoritos.php?pagina=${pagina}`);
            const data = await response.json();

            if (!data.success || !productsGrid) return;

            currentPage = pagina;
            totalPages = data.paginacao.total_paginas;
            productsGrid.innerHTML = '';

            if (data.favoritos && data.favoritos.length > 0) {
                data.favoritos.forEach(favorito => {
                    const div = document.createElement('div');
                    div.className = 'product';
                    div.dataset.limiteColeta = favorito.limite_coleta || 0;
                    div.dataset.distancia = favorito.distancia || 0;

                    const distanciaFormatada = favorito.distancia ? Math.round(parseFloat(favorito.distancia)) : 'N/A';

                    div.innerHTML = `
                        <img src="${favorito.imagem_path}" alt="Imagem da Empresa" class="product-image">
                        <h3>${favorito.nome}</h3>
                        <p>Limite de Coleta: ${favorito.limite_coleta || 'N/A'} kg</p>
                        <p class="distancia">Distância: ${distanciaFormatada} km</p>
                        <span class="favoritar favoritado" data-id="${favorito.id}">♥</span>
                    `;

                    productsGrid.appendChild(div);

                    if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(async (position) => {
                            const distancias = await calcularDistancias(
                                position.coords.latitude,
                                position.coords.longitude
                            );
                            
                            distancias.forEach(dist => {
                                const card = document.querySelector(`[data-id="${dist.id}"]`);
                                if (card) {
                                    const distanciaElement = card.querySelector('.distancia');
                                    if (distanciaElement) {
                                        const distancia = Math.round(dist.distancia);
                                        card.dataset.distancia = distancia;
                                        distanciaElement.textContent = `Distância: ${distancia} km`;
                                    }
                                }
                            });

                            aplicarFiltros();
                        });
                    }
                });

                // Adiciona event listeners para os botões de favoritar
                document.querySelectorAll('.favoritar').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const localId = this.dataset.id;
                        try {
                            const response = await fetch('favoritar.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ local_id: localId })
                            });
                            
                            const data = await response.json();
                            if (data.success) {
                                carregarFavoritos(currentPage);
                            }
                        } catch (error) {
                            console.error('Erro ao favoritar:', error);
                        }
                    });
                });

                // Atualiza os botões de paginação
                if (paginationDiv) {
                    const prevButton = paginationDiv.querySelector('.prev');
                    const nextButton = paginationDiv.querySelector('.next');
                    const pageButtons = paginationDiv.querySelectorAll('.page-number');

                    if (prevButton) prevButton.disabled = currentPage <= 1;
                    if (nextButton) nextButton.disabled = currentPage >= totalPages;

                    pageButtons.forEach(button => {
                        const pageNum = parseInt(button.textContent);
                        button.classList.toggle('active', pageNum === currentPage);
                    });
                }

                aplicarFiltros();
            } else {
                productsGrid.innerHTML = '<p class="no-results">Nenhum favorito encontrado.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            productsGrid.innerHTML = '<p class="error">Erro ao carregar favoritos. Por favor, tente novamente.</p>';
        }
    }

    // Event Listeners
    if (rangeFiltro) {
        rangeFiltro.addEventListener('input', function() {
            if (valorAtual) valorAtual.textContent = `${this.value} kg`;
            aplicarFiltros();
        });
    }

    if (rangeFiltroDistancia) {
        rangeFiltroDistancia.addEventListener('input', function() {
            if (valorAtualDistancia) valorAtualDistancia.textContent = `${this.value} km`;
            aplicarFiltros();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros);
    }

    // Tornar a função carregarFavoritos global
    window.carregarFavoritos = carregarFavoritos;

    // Inicializar carregamento
    carregarFavoritos(1);
});
