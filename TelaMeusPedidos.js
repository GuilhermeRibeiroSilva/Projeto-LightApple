document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const searchInput = document.getElementById('searchPedido');
    const statusLinks = document.querySelectorAll('.status-link');
    const tipoLinks = document.querySelectorAll('.tipo-link');
    const dataInput = document.getElementById('dataPedido');
    const productsGrid = document.querySelector('.products-grid');
    const paginationDiv = document.querySelector('.pagination');
    
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
        if (!dataString) return 'N/A';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }

    // Função para carregar pedidos
    async function carregarPedidos(pagina = 1) {
        try {
            // Formatar a data para o padrão do MySQL (YYYY-MM-DD)
            const dataFormatada = filtros.data ? new Date(filtros.data).toISOString().split('T')[0] : '';
            
            const queryParams = new URLSearchParams({
                pagina: pagina,
                search: filtros.search || '',
                status: filtros.status || 'todos',
                tipo: filtros.tipo || 'todos',
                data: dataFormatada
            });

            const response = await fetch(`buscar_pedidos.php?${queryParams}`);
            const data = await response.json();
            
            if (!data.success || !productsGrid) return;

            currentPage = pagina;
            totalPages = data.paginacao.total_paginas;
            productsGrid.innerHTML = '';

            if (data.pedidos && data.pedidos.length > 0) {
                data.pedidos.forEach(pedido => {
                    const card = document.createElement('div');
                    card.className = 'product';
                    
                    let cardContent = `
                        <h3>Pedido #${pedido.numero}</h3>
                        <p>Tipo: ${pedido.tipo === 'coleta' ? 'Coleta de Lixo' : 'Troca de Pontos'}</p>
                        <p>Status: <span class="status-badge ${pedido.status}">${pedido.status.toUpperCase()}</span></p>
                    `;

                    if (pedido.tipo === 'coleta') {
                        cardContent += `
                            <p>Empresa: ${pedido.empresa_coleta}</p>
                            <p>Quantidade: ${pedido.quantidade_lixo}kg</p>
                            <p>Data: ${formatarData(pedido.data_pedido)}</p>
                            ${pedido.entregador ? `
                                <p>${pedido.entregador.tipo === 'entregador' ? 'Entregador' : 'Transportadora'}: 
                                    ${pedido.entregador.nome}
                                </p>
                            ` : ''}
                            <p>Valor Total: R$ ${pedido.valor_total}</p>
                        `;
                    } else {
                        cardContent += `
                            <p>Pontos Gastos: ${pedido.pontos_total} pts</p>
                            <p>Data: ${formatarData(pedido.data_compra)}</p>
                        `;
                    }

                    cardContent += `<span class="info" title="Ver detalhes">ℹ</span>`;
                    card.innerHTML = cardContent;
                    productsGrid.appendChild(card);

                    // Adiciona evento de clique para detalhes
                    const infoButton = card.querySelector('.info');
                    if (infoButton) {
                        infoButton.addEventListener('click', () => mostrarDetalhes(pedido));
                    }
                });

                atualizarPaginacao(data.paginacao);
            } else {
                productsGrid.innerHTML = '<p class="no-results">Nenhum pedido encontrado.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            productsGrid.innerHTML = '<p class="error">Erro ao carregar pedidos. Por favor, tente novamente.</p>';
        }
    }

    // Função para atualizar paginação (similar à TelaEmpresadeColeta)
    function atualizarPaginacao(paginacao) {
        if (!paginationDiv) return;
        
        paginationDiv.innerHTML = '';
        
        // Botão Anterior
        const prevButton = document.createElement('button');
        prevButton.className = 'prev';
        prevButton.textContent = 'Anterior';
        prevButton.disabled = paginacao.pagina_atual <= 1;
        prevButton.onclick = () => carregarPedidos(paginacao.pagina_atual - 1);
        paginationDiv.appendChild(prevButton);

        // Lógica para mostrar números de página
        let startPage = Math.max(1, paginacao.pagina_atual - 2);
        let endPage = Math.min(paginacao.total_paginas, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // Primeiro número e reticências
        if (startPage > 1) {
            const firstButton = document.createElement('button');
            firstButton.className = 'page-number';
            firstButton.textContent = '1';
            firstButton.onclick = () => carregarPedidos(1);
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
            pageButton.onclick = () => carregarPedidos(i);
            paginationDiv.appendChild(pageButton);
        }

        // Último número e reticências
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
            lastButton.onclick = () => carregarPedidos(paginacao.total_paginas);
            paginationDiv.appendChild(lastButton);
        }

        // Botão Próximo
        const nextButton = document.createElement('button');
        nextButton.className = 'next';
        nextButton.textContent = 'Próximo';
        nextButton.disabled = paginacao.pagina_atual >= paginacao.total_paginas;
        nextButton.onclick = () => carregarPedidos(paginacao.pagina_atual + 1);
        paginationDiv.appendChild(nextButton);
    }

    // Função para formatar número do pedido
    function formatarNumeroPedido(id, tipo) {
        return `${tipo.toUpperCase()}${String(id).padStart(6, '0')}`;
    }

    // Event Listeners
    if (searchInput) {
        let timeoutId;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Formata a busca se for um número puro
                const valor = searchInput.value.trim();
                if (/^\d+$/.test(valor)) {
                    // Se for apenas números, adiciona o prefixo COL
                    filtros.search = `COL${valor.padStart(6, '0')}`;
                } else {
                    filtros.search = valor;
                }
                carregarPedidos(1);
            }, 500); // Delay de 500ms para evitar muitas requisições
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
            const data = dataInput.value;
            if (data) {
                // Formata a data para o padrão do MySQL (YYYY-MM-DD)
                filtros.data = new Date(data).toISOString().split('T')[0];
            } else {
                filtros.data = '';
            }
            carregarPedidos(1);
        });
    }

    // Carregar pedidos iniciais
    carregarPedidos(1);
});

// Função para mostrar detalhes do pedido
function mostrarDetalhes(pedido) {
    const modal = document.querySelector('.pedido-modal');
    const overlay = document.querySelector('.pedido-modal-overlay');
    const modalContent = modal.querySelector('.pedido-modal-content');

    let conteudo = '';
    
    if (pedido.tipo === 'coleta') {
        conteudo = `
            <div class="modal-header">
                <h2>Detalhes do Pedido #${pedido.numero}</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                <p><strong>Empresa de Coleta:</strong> ${pedido.empresa_coleta}</p>
                <p><strong>Local de Partida:</strong> ${pedido.local_partida}</p>
                <p><strong>Local de Chegada:</strong> ${pedido.local_chegada}</p>
                <p><strong>Data/Hora:</strong> ${formatarDataHora(pedido.data_pedido)}</p>
                ${pedido.entregador ? `
                    <p><strong>${pedido.entregador.tipo === 'entregador' ? 'Entregador' : 'Transportadora'}:</strong> 
                        ${pedido.entregador.nome}
                    </p>
                ` : ''}
                <p><strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}</p>
                <p><strong>Quantidade de Lixo:</strong> ${pedido.quantidade_lixo}kg</p>
                <p><strong>Valor:</strong> R$ ${pedido.valor}</p>
                <p><strong>Frete:</strong> R$ ${pedido.frete}</p>
                <p><strong>Valor Total:</strong> R$ ${pedido.valor_total}</p>
                <p><strong>Status:</strong> <span class="status-badge ${pedido.status}">${pedido.status.toUpperCase()}</span></p>
            </div>
        `;
    } else {
        conteudo = `
            <div class="modal-header">
                <h2>Detalhes da Troca #${pedido.numero}</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                <h3>Produtos:</h3>
                <ul class="produtos-lista">
                    ${pedido.itens.map(item => `
                        <li>${item.nome_produto} - ${item.pontos} pontos</li>
                    `).join('')}
                </ul>
                <p><strong>Total de Pontos:</strong> ${pedido.pontos_total}</p>
                <p><strong>Data/Hora:</strong> ${formatarDataHora(pedido.data_compra)}</p>
                <p><strong>Status:</strong> <span class="status-badge ${pedido.status}">${pedido.status.toUpperCase()}</span></p>
            </div>
        `;
    }

    modalContent.innerHTML = conteudo;
    modal.classList.add('active');
    overlay.classList.add('active');

    // Fechar modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    };

    overlay.onclick = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    };
}

// Função para formatar data e hora
function formatarDataHora(dataString) {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
}




  
  