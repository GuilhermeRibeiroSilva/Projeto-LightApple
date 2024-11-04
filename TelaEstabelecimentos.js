document.addEventListener("DOMContentLoaded", function() {
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

        const distanciaMaxima = parseInt(rangeFiltroDistancia.value, 10);
        const termoBusca = searchInput.value.toLowerCase();

        const cards = productsGrid.querySelectorAll('.product');
        cards.forEach(card => {
            const distanciaCard = parseInt(card.dataset.distancia, 10);
            const nomeEmpresa = card.querySelector('h3').textContent.toLowerCase();

            // Aplicar filtros individualmente
            const passaDistancia = distanciaCard <= distanciaMaxima || distanciaMaxima === 0;
            const passaBusca = nomeEmpresa.includes(termoBusca);

            card.style.display = (passaDistancia && passaBusca) ? 'block' : 'none';
        });
    }

    // Função para carregar anúncios atualizada
    async function carregarAnuncios(pagina = 1) {
        try {
            const response = await fetch(`carregar_estabelecimentos.php?pagina=${pagina}`);
            const data = await response.json();

            if (!data.success || !productsGrid) return;

            currentPage = pagina;
            totalPages = data.paginacao.total_paginas;
            productsGrid.innerHTML = '';

            if (data.locais && data.locais.length > 0) {
                data.locais.forEach(local => {
                    const div = document.createElement('div');
                    div.className = 'product';
                    div.dataset.id = local.id;
                    div.dataset.distancia = local.distancia || 0;

                    div.innerHTML = `
                        <img src="${local.imagem_path}" alt="Imagem do Local" class="product-image">
                        <h3>${local.nome}</h3>
                        <p class="distancia">Calculando distância...</p>
                        <span class="favoritar ${local.favoritado ? 'favoritado' : ''}" data-id="${local.id}">♥</span>
                    `;

                    productsGrid.appendChild(div);
                });

                // Calcular distâncias após carregar os cards
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
                productsGrid.innerHTML = '<p class="no-results">Nenhum local encontrado.</p>';
            }

            atualizarPaginacao(data.paginacao);
        } catch (error) {
            console.error('Erro ao carregar locais:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="error">Erro ao carregar locais. Por favor, tente novamente.</p>';
            }
        }
    }

    // Event Listeners
    if (rangeFiltroDistancia) {
        rangeFiltroDistancia.addEventListener('input', function() {
            if (valorAtualDistancia) valorAtualDistancia.textContent = `${this.value} km`;
            aplicarFiltros();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros);
    }

    // Função para atualizar a paginação
    function atualizarPaginacao(paginacao) {
        if (!paginationDiv) return;

        const { pagina_atual, total_paginas } = paginacao;
        let html = '';

        // Botão Anterior
        html += `<button class="prev" ${pagina_atual <= 1 ? 'disabled' : ''} 
                 onclick="carregarAnuncios(${pagina_atual - 1})">Anterior</button>`;

        // Números das páginas
        for (let i = 1; i <= total_paginas; i++) {
            html += `<button class="page-number ${i === pagina_atual ? 'active' : ''}" 
                     onclick="carregarAnuncios(${i})">${i}</button>`;
        }

        // Botão Próximo
        html += `<button class="next" ${pagina_atual >= total_paginas ? 'disabled' : ''} 
                 onclick="carregarAnuncios(${pagina_atual + 1})">Próximo</button>`;

        paginationDiv.innerHTML = html;
    }

    // Tornar a função carregarAnuncios global
    window.carregarAnuncios = carregarAnuncios;

    // Inicializar carregamento
    carregarAnuncios(1);
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Erro ao calcular distâncias');
        }

        return data.distancias;
    } catch (error) {
        console.error('Erro ao calcular distâncias:', error);
        return [];
    }
}




