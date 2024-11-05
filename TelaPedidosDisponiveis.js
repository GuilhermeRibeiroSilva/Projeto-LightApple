document.addEventListener('DOMContentLoaded', function() {
    carregarPedidos(1);
    
    // Atualizar a cada 30 segundos
    setInterval(() => {
        const modal = document.querySelector('.pedido-modal');
        // Só atualiza se o modal não estiver aberto
        if (!modal || !modal.classList.contains('active')) {
            carregarPedidos(1);
        }
    }, 30000);
});

function carregarPedidos(pagina) {
    fetch(`buscar_pedidos_disponiveis.php?pagina=${pagina}&por_pagina=12`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarPedidos(data.pedidos);
                renderizarPaginacao(data.paginacao);
            }
        })
        .catch(error => console.error('Erro:', error));
}

function renderizarPedidos(pedidos) {
    const grid = document.querySelector('.pedidos-grid');
    
    if (!pedidos.length) {
        grid.innerHTML = '<p class="no-pedidos">Nenhum pedido disponível no momento.</p>';
        return;
    }
    
    grid.innerHTML = pedidos.map(pedido => `
        <div class="pedido-card" data-id="${pedido.id}" onclick="mostrarDetalhes(${JSON.stringify(pedido).replace(/"/g, '&quot;')})">
            <h3>Pedido #${pedido.id}</h3>
            <div class="pedido-info">
                <p>
                    <strong>Empresa</strong>
                    ${pedido.empresa_coleta}
                </p>
                <p>
                    <strong>Cliente</strong>
                    ${pedido.nome_cliente}
                </p>
                <p>
                    <strong>Quantidade</strong>
                    ${pedido.quantidade_lixo}kg
                </p>
                <p class="valor">
                    <strong>Valor do Serviço</strong>
                    R$ ${pedido.valor_entregador}
                </p>
            </div>
            <div class="pedido-acoes">
                <button class="btn-aceitar" onclick="aceitarPedido(${pedido.id}, event)">
                    Aceitar
                </button>
                <button class="btn-rejeitar" onclick="rejeitarPedido(${pedido.id}, event)">
                    Rejeitar
                </button>
            </div>
        </div>
    `).join('');
}

function renderizarPaginacao(paginacao) {
    const paginationDiv = document.querySelector('.pagination');
    const totalPaginas = Math.ceil(paginacao.total / paginacao.por_pagina);
    let html = '';

    // Botão anterior
    html += `<button onclick="carregarPedidos(${paginacao.pagina - 1})" 
        ${paginacao.pagina <= 1 ? 'disabled' : ''}>
        Anterior
    </button>`;

    // Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button onclick="carregarPedidos(${i})" 
            class="${paginacao.pagina === i ? 'active' : ''}">
            ${i}
        </button>`;
    }

    // Botão próximo
    html += `<button onclick="carregarPedidos(${paginacao.pagina + 1})" 
        ${paginacao.pagina >= totalPaginas ? 'disabled' : ''}>
        Próximo
    </button>`;

    paginationDiv.innerHTML = html;
}

function aceitarPedido(pedidoId, event) {
    event.stopPropagation();
    if (confirm('Deseja aceitar este pedido?')) {
        fetch('aceitar_pedido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pedido_id: pedidoId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Fecha o modal
                fecharModal();
                
                // Remove o card do pedido
                const pedidoCard = document.querySelector(`.pedido-card[data-id="${pedidoId}"]`);
                if (pedidoCard) {
                    pedidoCard.remove();
                }
                
                // Atualiza a lista de pedidos
                carregarPedidos(1);
                
                alert('Pedido aceito com sucesso!');
            } else {
                alert(data.message || 'Erro ao aceitar pedido');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a requisição');
        });
    }
}

function rejeitarPedido(pedidoId, event) {
    event.stopPropagation();
    if (confirm('Deseja rejeitar este pedido?')) {
        fetch('rejeitar_pedido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pedido_id: pedidoId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Fecha o modal
                fecharModal();
                
                // Remove o card do pedido
                const pedidoCard = document.querySelector(`.pedido-card[data-id="${pedidoId}"]`);
                if (pedidoCard) {
                    pedidoCard.remove();
                }
                
                // Atualiza a lista de pedidos
                carregarPedidos(1);
                
                alert('Pedido rejeitado com sucesso!');
            } else {
                alert(data.message || 'Erro ao rejeitar pedido');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a requisição');
        });
    }
}

function mostrarDetalhes(pedido) {
    const modal = document.querySelector('.pedido-modal');
    const overlay = document.querySelector('.pedido-modal-overlay');
    
    if (!modal || !overlay) return;
    
    const modalContent = modal.querySelector('.pedido-modal-content');

    const conteudo = `
        <div class="modal-header">
            <h2>Detalhes do Pedido #${pedido.id}</h2>
            <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
            <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
            <p><strong>Empresa de Coleta:</strong> ${pedido.empresa_coleta}</p>
            <p><strong>Local de Partida:</strong> ${pedido.local_partida}</p>
            <p><strong>Local de Chegada:</strong> ${pedido.local_chegada}</p>
            <p><strong>Data/Hora:</strong> ${formatarDataHora(pedido.data_pedido)}</p>
            <p><strong>Quantidade de Lixo:</strong> ${pedido.quantidade_lixo}kg</p>
            <p><strong>Valor do Serviço:</strong> R$ ${pedido.valor_entregador}</p>
            <div class="modal-actions">
                <button class="btn-aceitar" onclick="aceitarPedido(${pedido.id}, event)">
                    Aceitar Pedido
                </button>
                <button class="btn-rejeitar" onclick="rejeitarPedido(${pedido.id}, event)">
                    Rejeitar Pedido
                </button>
            </div>
        </div>
    `;

    modalContent.innerHTML = conteudo;
    modal.style.display = 'block';
    overlay.style.display = 'block';
    
    setTimeout(() => {
        modal.classList.add('active');
        overlay.classList.add('active');
    }, 10);

    // Fechar modal
    const closeBtn = modal.querySelector('.close-modal');
    const fecharModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    };

    closeBtn.onclick = fecharModal;
    overlay.onclick = fecharModal;
}

// Função auxiliar para formatar data e hora
function formatarDataHora(dataString) {
    if (!dataString) return 'N/A';
    
    // Verifica se a data está no formato MySQL (YYYY-MM-DD HH:mm:ss)
    const data = new Date(dataString.replace(/-/g, '/'));
    
    // Verifica se a data é válida
    if (isNaN(data.getTime())) return 'N/A';
    
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função global para fechar o modal
function fecharModal() {
    const modal = document.querySelector('.pedido-modal');
    const overlay = document.querySelector('.pedido-modal-overlay');
    
    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    }
} 