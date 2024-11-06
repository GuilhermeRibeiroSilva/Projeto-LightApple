document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do slider
    const buttonsWrapper = document.querySelector(".map");
    const slides = document.querySelector(".box-cards");

    if (buttonsWrapper && slides) {
        buttonsWrapper.addEventListener("click", e => {
            if (e.target.nodeName === "BUTTON") {
                Array.from(buttonsWrapper.children).forEach(item =>
                    item.classList.remove("active")
                );
                if (e.target.classList.contains("first")) {
                    slides.style.transform = "translateX(-0%)";
                    e.target.classList.add("active");
                } else if (e.target.classList.contains("second")) {
                    slides.style.transform = "translateX(-33.33333333333333%)";
                    e.target.classList.add("active");
                }
            }
        });
    }

    // Inicialização dos pedidos
    carregarPedidosTelaInicial();
    setInterval(carregarPedidosTelaInicial, 30000);
});

// Função para carregar pedidos na tela inicial
function carregarPedidosTelaInicial() {
    fetch('buscar_pedidos_disponiveis.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarPedidosDisponiveis(data.pedidos);
                renderizarPedidosAceitos(data.pedidos_aceitos);
            }
        })
        .catch(error => console.error('Erro:', error));
}

// Função para renderizar pedidos disponíveis
function renderizarPedidosDisponiveis(pedidos) {
    const lista = document.getElementById('available-orders-list');
    if (!lista) return;

    if (!pedidos || pedidos.length === 0) {
        lista.innerHTML = '<div class="no-pedidos">Nenhum pedido disponível no momento</div>';
        return;
    }

    lista.innerHTML = pedidos.map(pedido => `
        <div class="pedidoNum" data-id="${pedido.id}">
            <h3>PEDIDO #${pedido.id}</h3>
            <div class="pedido-content">
                <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
                <p><strong>Partida:</strong> ${pedido.local_partida}</p>
                <p><strong>Chegada:</strong> ${pedido.local_chegada}</p>
                <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                <p><strong>Valor:</strong> R$ ${pedido.valor_entregador}</p>
            </div>
            <div class="botoes">
                <button class="aceitar" onclick="aceitarPedido(${pedido.id})">Aceitar</button>
                <button class="rejeitar" onclick="rejeitarPedido(${pedido.id})">Rejeitar</button>
            </div>
        </div>
    `).join('');
}

// Função para renderizar pedidos aceitos
function renderizarPedidosAceitos(pedidos) {
    const lista = document.getElementById('accepted-orders-list');
    if (!lista) return;

    if (!pedidos || pedidos.length === 0) {
        lista.innerHTML = '<div class="no-pedidos">Nenhum pedido aceito no momento</div>';
        return;
    }

    lista.innerHTML = pedidos.map(pedido => `
        <div class="pedidoAct" data-id="${pedido.id}">
            <h3>PEDIDO #${pedido.id}</h3>
            <div class="pedido-content">
                <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
                <p><strong>Partida:</strong> ${pedido.local_partida}</p>
                <p><strong>Chegada:</strong> ${pedido.local_chegada}</p>
                <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                <p><strong>Valor:</strong> R$ ${pedido.valor_entregador}</p>
            </div>
            <div class="botoes-act">
                <button class="vermais" onclick="window.location.href='TelaMinhasEntregas.php'">
                    Ver Mais
                </button>
            </div>
        </div>
    `).join('');
}

// Função para aceitar pedido
function aceitarPedido(pedidoId) {
    if (!confirm('Deseja aceitar este pedido?')) return;

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
            // Atualiza a lista de pedidos
            carregarPedidosDisponiveis();
            carregarPedidosAceitos();
        } else {
            alert(data.message || 'Erro ao aceitar pedido');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao aceitar pedido');
    });
}

// Função para rejeitar pedido
function rejeitarPedido(pedidoId) {
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
            carregarPedidosTelaInicial();
            alert('Pedido rejeitado com sucesso!');
        } else {
            alert(data.message || 'Erro ao rejeitar pedido');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao rejeitar pedido');
    });
}

// Reutilizar as funções de aceitar e rejeitar do navmenu
window.aceitarPedido = aceitarPedido;
window.rejeitarPedido = rejeitarPedido;
