document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const searchInput = document.getElementById('searchPedido');
    const statusLinks = document.querySelectorAll('.status-link');
    const tipoLinks = document.querySelectorAll('.tipo-link');
    const dataInput = document.getElementById('dataPedido');
    const productsGrid = document.querySelector('.products-grid');
    const paginationDiv = document.querySelector('.pagination');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-info');
    const closeModalBtn = document.querySelector('.close-btn');
    const overlay = document.querySelector('.modal-overlay');
    
    // Variáveis de controle
    let currentPage = 1;
    let totalPages = 1;
    let filtros = {
        search: '',
        status: 'todos',
        tipo: 'todos',
        data: ''
    };

    // Função para formatar data
    function formatarData(dataString) {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }

    // Função para atualizar paginação
    function atualizarPaginacao(paginacao) {
        if (!paginationDiv) return;
        
        currentPage = paginacao.pagina_atual;
        totalPages = paginacao.total_paginas;

        let html = '';
        
        // Botão anterior
        html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="carregarPedidos(${currentPage - 1})">Anterior</button>`;

        // Números das páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="active">${i}</button>`;
            } else {
                html += `<button onclick="carregarPedidos(${i})">${i}</button>`;
            }
        }

        // Botão próximo
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="carregarPedidos(${currentPage + 1})">Próximo</button>`;

        paginationDiv.innerHTML = html;
    }

    // Função para carregar pedidos
    async function carregarPedidos(pagina = 1) {
        try {
            const queryParams = new URLSearchParams({
                pagina: pagina,
                ...filtros
            });

            const response = await fetch(`buscar_pedidos.php?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                renderizarPedidos(data.pedidos);
                atualizarPaginacao(data.paginacao);
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="error">Erro ao carregar pedidos. Por favor, tente novamente.</p>';
            }
        }
    }

    // Função para renderizar pedidos
    function renderizarPedidos(pedidos) {
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';

        if (!pedidos || pedidos.length === 0) {
            productsGrid.innerHTML = '<p class="no-results">Nenhum pedido encontrado.</p>';
            return;
        }

        pedidos.forEach(pedido => {
            const card = document.createElement('div');
            card.className = 'product';
            card.setAttribute('data-tipo', pedido.tipo);
            card.setAttribute('data-status', pedido.status);

            if (pedido.tipo === 'coleta') {
                card.innerHTML = `
                    <h3>Pedido #${pedido.numero}</h3>
                    <p>Empresa: ${pedido.empresa_coleta}</p>
                    <p>De: ${pedido.local_partida}</p>
                    <p>Para: ${pedido.local_chegada}</p>
                    <p>Quantidade: ${pedido.quantidade_lixo}kg</p>
                    <p>Data: ${formatarData(pedido.data_pedido)}</p>
                    <p class="status">Status: ${pedido.status.toUpperCase()}</p>
                    <span class="info" data-pedido='${JSON.stringify(pedido)}'>ℹ</span>
                `;
            } else {
                card.innerHTML = `
                    <h3>Pedido #${pedido.numero}</h3>
                    <p>Tipo: Troca de Pontos</p>
                    <p>Pontos Gastos: ${pedido.pontos_total}</p>
                    <p>Data: ${formatarData(pedido.data_compra)}</p>
                    <p class="status">Status: ${pedido.status.toUpperCase()}</p>
                    <span class="info" data-pedido='${JSON.stringify(pedido)}'>ℹ</span>
                `;
            }

            productsGrid.appendChild(card);

            // Adicionar event listener para o ícone de informação
            const infoIcon = card.querySelector('.info');
            if (infoIcon) {
                infoIcon.addEventListener('click', () => {
                    const pedidoData = JSON.parse(infoIcon.dataset.pedido);
                    mostrarDetalhes(pedidoData);
                });
            }
        });
    }

    // Função para mostrar detalhes do pedido
    function mostrarDetalhes(pedido) {
        if (!modal || !modalContent) return;
        
        if (pedido.tipo === 'coleta') {
            modalContent.innerHTML = `
                <h4>Pedido de Coleta #${pedido.numero}</h4>
                <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
                <p><strong>Local de Partida:</strong> ${pedido.local_partida}</p>
                <p><strong>Local de Chegada:</strong> ${pedido.local_chegada}</p>
                <p><strong>Data:</strong> ${formatarData(pedido.data_pedido)}</p>
                ${pedido.entregador ? `<p><strong>Entregador:</strong> ${pedido.nome_entregador}</p>` : ''}
                <p><strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}</p>
                <p><strong>Valor:</strong> R$ ${pedido.valor}</p>
                <p><strong>Status:</strong> ${pedido.status.toUpperCase()}</p>
            `;
        } else {
            modalContent.innerHTML = `
                <h4>Pedido de Troca #${pedido.numero}</h4>
                <h5>Produtos:</h5>
                <div class="produtos-lista">
                    ${pedido.produtos ? pedido.produtos.map(p => `
                        <p>${p.nome} - ${p.pontos} pontos</p>
                    `).join('') : '<p>Nenhum produto encontrado</p>'}
                </div>
                <p><strong>Total de Pontos:</strong> ${pedido.pontos_total}</p>
                <p><strong>Data:</strong> ${formatarData(pedido.data_compra)}</p>
                <p><strong>Status:</strong> ${pedido.status.toUpperCase()}</p>
            `;
        }

        modal.classList.remove('hidden');
        document.body.classList.add('modal-active');
    }

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filtros.search = searchInput.value;
            carregarPedidos(1);
        });
    }

    if (statusLinks.length > 0) {
        statusLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                filtros.status = e.target.dataset.status;
                carregarPedidos(1);
            });
        });
    }

    if (tipoLinks.length > 0) {
        tipoLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                filtros.tipo = e.target.dataset.tipo;
                carregarPedidos(1);
            });
        });
    }

    if (dataInput) {
        dataInput.addEventListener('change', () => {
            filtros.data = dataInput.value;
            carregarPedidos(1);
        });
    }

    // Modal events
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-active');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-active');
            }
        });
    }

    // Carregar pedidos iniciais
    carregarPedidos(1);
});




  
  