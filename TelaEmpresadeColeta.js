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

            // Aplicar filtros individualmente
            const passaLimite = limiteCard >= limiteColeta || limiteColeta === 0;
            const passaDistancia = distanciaCard <= distanciaMaxima || distanciaMaxima === 0;
            const passaBusca = nomeEmpresa.includes(termoBusca);

            card.style.display = (passaLimite && passaDistancia && passaBusca) ? 'block' : 'none';
        });
    }

    // Função para atualizar os botões de paginação
    function updatePaginationButtons() {
        if (!paginationDiv) return;
        
        const prevButton = paginationDiv.querySelector('.prev');
        const nextButton = paginationDiv.querySelector('.next');
        const pageButtons = paginationDiv.querySelectorAll('.page-number');
        
        if (prevButton) {
            prevButton.disabled = currentPage <= 1;
        }
        if (nextButton) {
            nextButton.disabled = currentPage >= totalPages;
        }
        
        pageButtons.forEach(button => {
            const pageNum = parseInt(button.textContent);
            button.classList.toggle('active', pageNum === currentPage);
        });
    }

    // Função para criar botões de paginação
    function createPaginationButtons(total) {
        if (!paginationDiv) return;
        
        paginationDiv.innerHTML = '';
        
        // Botão anterior
        const prevButton = document.createElement('button');
        prevButton.className = 'prev';
        prevButton.textContent = 'Anterior';
        prevButton.onclick = () => carregarAnuncios(currentPage - 1);
        paginationDiv.appendChild(prevButton);
        
        // Botões numerados
        for (let i = 1; i <= total; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => carregarAnuncios(i);
            paginationDiv.appendChild(pageButton);
        }
        
        // Botão próximo
        const nextButton = document.createElement('button');
        nextButton.className = 'next';
        nextButton.textContent = 'Próximo';
        nextButton.onclick = () => carregarAnuncios(currentPage + 1);
        paginationDiv.appendChild(nextButton);
        
        updatePaginationButtons();
    }

    // Função para carregar anúncios atualizada
    async function carregarAnuncios(pagina = 1) {
        try {
            const response = await fetch(`carregar_anuncios.php?pagina=${pagina}`);
            const data = await response.json();

            if (!data.success || !productsGrid) return;

            currentPage = pagina;
            totalPages = data.paginacao.total_paginas;
            productsGrid.innerHTML = '';

            if (data.anuncios && data.anuncios.length > 0) {
                data.anuncios.forEach(anuncio => {
                    const div = document.createElement('div');
                    div.className = 'product';
                    div.dataset.limiteColeta = anuncio.limite_coleta || 0;
                    div.dataset.distancia = anuncio.distancia || 0;
                    div.dataset.id = anuncio.id;

                    // Formatar a distância como número inteiro
                    const distanciaFormatada = anuncio.distancia ? Math.round(parseFloat(anuncio.distancia)) : 'N/A';

                    div.innerHTML = `
                        <img src="${anuncio.imagem_path}" alt="Imagem da Empresa" class="product-image">
                        <h3>${anuncio.nome}</h3>
                        <p>Limite de Coleta: ${anuncio.limite_coleta || 'N/A'} kg</p>
                        <p class="distancia">Distância: ${distanciaFormatada} km</p>
                        <span class="favoritar ${anuncio.favoritado ? 'favoritado' : ''}" data-id="${anuncio.id}">♥</span>
                    `;

                    productsGrid.appendChild(div);
                });

                atualizarPaginacao(data.paginacao);
                
                // Recalcular distâncias após carregar novos anúncios
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const distancias = await calcularDistancias(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        
                        // Atualiza as distâncias nos cards
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
            } else {
                productsGrid.innerHTML = '<p class="no-results">Nenhuma empresa de coleta encontrada.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar anúncios:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="error">Erro ao carregar anúncios. Por favor, tente novamente.</p>';
            }
        }
    }

    // Nova função para atualizar a paginação
    function atualizarPaginacao(paginacao) {
        if (!paginationDiv) return;
        
        paginationDiv.innerHTML = '';
        
        // Botão Anterior
        const prevButton = document.createElement('button');
        prevButton.className = 'prev';
        prevButton.textContent = 'Anterior';
        prevButton.disabled = paginacao.pagina_atual <= 1;
        prevButton.onclick = () => carregarAnuncios(paginacao.pagina_atual - 1);
        paginationDiv.appendChild(prevButton);

        // Lógica para mostrar números de página
        let startPage = Math.max(1, paginacao.pagina_atual - 2);
        let endPage = Math.min(paginacao.total_paginas, startPage + 4);
        
        // Ajusta startPage se necessário
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // Primeiro número e reticências se necessário
        if (startPage > 1) {
            const firstButton = document.createElement('button');
            firstButton.className = 'page-number';
            firstButton.textContent = '1';
            firstButton.onclick = () => carregarAnuncios(1);
            paginationDiv.appendChild(firstButton);

            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'ellipsis';
                ellipsis.textContent = '...';
                paginationDiv.appendChild(ellipsis);
            }
        }

        // Números da página
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-number ${i === paginacao.pagina_atual ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => carregarAnuncios(i);
            paginationDiv.appendChild(pageButton);
        }

        // Último número e reticências se necessário
        if (endPage < paginacao.total_paginas) {
            if (endPage < paginacao.total_paginas - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'ellipsis';
                ellipsis.textContent = '...';
                paginationDiv.appendChild(ellipsis);
            }

            const lastButton = document.createElement('button');
            lastButton.className = 'page-number';
            lastButton.textContent = paginacao.total_paginas;
            lastButton.onclick = () => carregarAnuncios(paginacao.total_paginas);
            paginationDiv.appendChild(lastButton);
        }

        // Botão Próximo
        const nextButton = document.createElement('button');
        nextButton.className = 'next';
        nextButton.textContent = 'Próximo';
        nextButton.disabled = paginacao.pagina_atual >= paginacao.total_paginas;
        nextButton.onclick = () => carregarAnuncios(paginacao.pagina_atual + 1);
        paginationDiv.appendChild(nextButton);
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

    // Inicializar carregamento
    carregarAnuncios(1);

    // Adicione esta chamada dentro da função carregarAnuncios
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const distancias = await calcularDistancias(
                position.coords.latitude,
                position.coords.longitude
            );
            
            // Atualiza as distâncias nos cards
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

// Adicionar evento de clique nos botões de favoritar
document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('favoritar')) {
        const localId = e.target.dataset.id;
        
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
                e.target.classList.toggle('favoritado');
                if (data.action === 'added') {
                    e.target.style.color = 'red';
                } else {
                    e.target.style.color = 'initial';
                }
            } else {
                alert('Erro ao favoritar: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }
});

async function calcularDistancias(latitude, longitude) {
    try {
        const response = await fetch('calcular_distancias.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        });
        const data = await response.json();
        return data.success ? data.distancias : [];
    } catch (error) {
        console.error('Erro ao calcular distâncias:', error);
        return [];
    }
}




