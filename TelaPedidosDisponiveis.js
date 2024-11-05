document.addEventListener('DOMContentLoaded', function() {
    carregarPedidos(1);
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
        <div class="pedido-card" onclick="mostrarDetalhes(${JSON.stringify(pedido)})">
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
                alert('Pedido aceito com sucesso!');
                carregarPedidos(1); // Recarrega a primeira página
            } else {
                alert(data.message || 'Erro ao aceitar pedido');
            }
        })
        .catch(error => console.error('Erro:', error));
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
                alert('Pedido rejeitado com sucesso!');
                carregarPedidos(1);
            } else {
                alert(data.message || 'Erro ao rejeitar pedido');
            }
        })
        .catch(error => console.error('Erro:', error));
    }
}

function mostrarDetalhes(pedido) {
    const modal = document.querySelector('.pedido-modal');
    const overlay = document.querySelector('.pedido-modal-overlay');
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
                <button class="pedido-btn btn-aceitar" onclick="aceitarPedido(${pedido.id})">
                    Aceitar Pedido
                </button>
                <button class="pedido-btn btn-rejeitar" onclick="rejeitarPedido(${pedido.id})">
                    Rejeitar Pedido
                </button>
            </div>
        </div>
    `;

    modalContent.innerHTML = conteudo;
    modal.classList.add('active');
    overlay.classList.add('active');

    // Fechar modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        // Remove o parâmetro da URL ao fechar o modal
        if (window.history.pushState) {
            const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path: newurl}, '', newurl);
        }
    };

    overlay.onclick = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        // Remove o parâmetro da URL ao fechar o modal
        if (window.history.pushState) {
            const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path: newurl}, '', newurl);
        }
    };
}

// Função auxiliar para formatar data e hora
function formatarDataHora(dataString) {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
} 