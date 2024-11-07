document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do slider de empresas
    const buttonsWrapper = document.querySelector(".map");
    const slides = document.querySelector(".box-cards");

    if (buttonsWrapper && slides) {
        buttonsWrapper.addEventListener("click", e => {
            if (e.target.nodeName === "BUTTON") {
                Array.from(buttonsWrapper.children).forEach(item =>
                    item.classList.remove("active")
                );
                if (e.target.classList.contains("first")) {
                    slides.style.transform = "translateX(0)";
                    e.target.classList.add("active");
                } else if (e.target.classList.contains("second")) {
                    slides.style.transform = "translateX(-100%)";
                    e.target.classList.add("active");
                }
            }
        });
    }

    // Carregar pedidos iniciais
    carregarPedidosTelaInicial();
    
    // Atualizar pedidos a cada 30 segundos
    setInterval(carregarPedidosTelaInicial, 30000);
});

function carregarPedidosTelaInicial() {
    fetch('buscar_pedidos_disponiveis.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                atualizarListaPedidosTelaInicial(data.pedidos);
            }
        })
        .catch(error => console.error('Erro:', error));
}

function atualizarListaPedidosTelaInicial(pedidos) {
    const listaPedidos = document.querySelector('.pedidos-lista-peddisp');
    if (!listaPedidos) return;

    listaPedidos.innerHTML = pedidos.length === 0 
        ? '<p id="no-available-orders">Nenhum pedido disponível no momento</p>'
        : pedidos.map(pedido => `
            <div class="pedidoNum" data-id="${pedido.id}">
                <h3>PEDIDO #${pedido.id}</h3>
                <div class="pedido-content">
                    <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                    <p><strong>Empresa:</strong> ${pedido.empresa_coleta || 'Não atribuído'}</p>
                    <p><strong>Partida:</strong> ${pedido.local_partida}</p>
                    <p><strong>Chegada:</strong> ${pedido.local_chegada}</p>
                    <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                    <p><strong>Valor:</strong> R$ ${pedido.valor_total || '0.00'}</p>
                </div>
                <div class="botoes">
                    <button class="aceitar" onclick="marcarPedidoComoRecebido(${pedido.id})">Receber</button>
                    <button class="vermais" onclick="window.location.href='DetalhePedido.php?id=${pedido.id}'">Ver Mais</button>
                </div>
            </div>
        `).join('');
}

