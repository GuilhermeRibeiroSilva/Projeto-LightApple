// Elementos do menu e submenus
let subMenu = null;
let criarPed = null;
let userImageCircle = null;
let userPerf = null;

// Função para inicializar os elementos após o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    subMenu = document.getElementById("subMenu");
    criarPed = document.getElementById("criarPed");
    userImageCircle = document.getElementById("userImageCircle"); 
    userPerf = document.querySelector(".user-perf");

    // Inicializar event listeners apenas se os elementos existirem
    if (document.querySelector('.user-pic')) {
        document.querySelector('.user-pic').onclick = toggleMenu;
    }
    if (document.querySelector('.ped-pic')) {
        document.querySelector('.ped-pic').onclick = toggleMenuPed;
    }

    // Carregamento do perfil do usuário
    const userIdElement = document.getElementById("user-id");
    if (userIdElement && userIdElement.value) {
        carregarPerfilUsuario(userIdElement.value);
    }

    // Event listener para cliques fora dos menus
    document.addEventListener('click', handleOutsideClick);

    // Adicionar carregamento inicial de pedidos
    carregarPedidosDisponiveis();

    // Atualizar pedidos a cada 30 segundos
    setInterval(carregarPedidosDisponiveis, 30000);
});

// Função para carregar o perfil do usuário
function carregarPerfilUsuario(userId) {
    fetch(`http://localhost/LightApple/carregar_perfil.php?id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                atualizarImagemPerfil(data.usuario.profile_image_path);
            } else {
                console.error(data.error);
                atualizarImagemPerfil(null);
            }
        })
        .catch(error => console.error("Erro ao carregar imagem de perfil:", error));
}

// Função para fechar todos os menus
function closeAllMenus() {
    if (subMenu) subMenu.classList.remove("open-menu");
    if (criarPed) criarPed.classList.remove("open-menu-ped");
}

// Função para alternar o menu de perfil
function toggleMenu() {
    closeAllMenus();
    if (subMenu) subMenu.classList.toggle("open-menu");
}

// Função para alternar o menu de pedidos
function toggleMenuPed() {
    const subMenuPed = document.querySelector('.sub-menu-ped-wrap');
    if (subMenuPed) {
        subMenuPed.classList.toggle('open-menu-ped');
    }
}

// Função para lidar com cliques fora dos menus
function handleOutsideClick(event) {
    const isClickInsideMenu = event.target.closest('.user-menu') || 
                            event.target.closest('.pedido-menu');
    
    if (!isClickInsideMenu) {
        closeAllMenus();
    }
}

// Função para atualizar a imagem de perfil
function atualizarImagemPerfil(urlImagem) {
    if (userImageCircle && userPerf) {
        if (urlImagem) {
            userImageCircle.style.backgroundImage = `url('${urlImagem}')`;
            userPerf.style.backgroundImage = `url('${urlImagem}')`;
        } else {
            userImageCircle.style.backgroundImage = "";
            userPerf.style.backgroundImage = "";
        }
    }
}

// Função para carregar pedidos disponíveis
function carregarPedidosDisponiveis() {
    fetch('buscar_pedidos_disponiveis.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                atualizarListaPedidos(data.pedidos);
            }
        })
        .catch(error => console.error('Erro:', error));
}

// Função para atualizar a lista de pedidos no dropdown
function atualizarListaPedidos(pedidos) {
    const listaPedidos = document.querySelector('.sub-menu-ped .pedidos-lista');
    if (!listaPedidos) return;

    listaPedidos.innerHTML = pedidos.length === 0 
        ? '<p class="no-pedidos">Nenhum pedido disponível no momento</p>'
        : pedidos.map(pedido => `
            <div class="pedido-card" id="pedido-${pedido.id}">
                <div class="pedido-header">
                    Pedido #${pedido.id}
                </div>
                
                <div class="pedido-content">
                    <div class="pedido-item">
                        <div class="pedido-label">Empresa</div>
                        <div class="pedido-valor">${pedido.empresa_coleta}</div>
                    </div>
                    
                    <div class="pedido-item">
                        <div class="pedido-label">Cliente</div>
                        <div class="pedido-valor">${pedido.nome_cliente}</div>
                    </div>
                    
                    <div class="pedido-item">
                        <div class="pedido-label">Quantidade</div>
                        <div class="pedido-valor">${pedido.quantidade_lixo}kg</div>
                    </div>
                    
                    <div class="pedido-valor-destaque">
                        <div class="pedido-label">Valor do Serviço</div>
                        <div class="pedido-valor">R$ ${pedido.valor_entregador}</div>
                    </div>
                </div>
                
                <div class="pedido-acoes">
                    <button class="pedido-btn btn-aceitar" onclick="aceitarPedido(${pedido.id})">
                        Aceitar
                    </button>
                    <button class="pedido-btn btn-rejeitar" onclick="rejeitarPedido(${pedido.id})">
                        Rejeitar
                    </button>
                    <a href="TelaPedidosDisponiveis.php?pedido_id=${pedido.id}" class="pedido-btn btn-detalhes">
                        Ver Mais
                    </a>
                </div>
            </div>
        `).join('');
}

// Função para aceitar pedido
function aceitarPedido(pedidoId) {
    fetch('aceitar_pedido.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pedido_id: pedidoId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove o pedido do dropdown
            const pedidoElement = document.getElementById(`pedido-${pedidoId}`);
            if (pedidoElement) {
                pedidoElement.remove();
            }
            
            // Atualiza a lista de pedidos imediatamente
            carregarPedidosDisponiveis();
            
            // Mostra mensagem de sucesso
            alert('Pedido aceito com sucesso!');
            
            // Verifica se a lista está vazia
            const listaPedidos = document.querySelector('.pedidos-lista');
            if (listaPedidos && !listaPedidos.children.length) {
                listaPedidos.innerHTML = '<p class="no-pedidos">Nenhum pedido disponível no momento</p>';
            }
        } else {
            alert(data.message || 'Erro ao aceitar pedido');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao processar a requisição');
    });
}

// Função para rejeitar pedido
function rejeitarPedido(pedidoId) {
    fetch('rejeitar_pedido.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pedido_id: pedidoId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove o pedido do dropdown
            const pedidoElement = document.getElementById(`pedido-${pedidoId}`);
            if (pedidoElement) {
                pedidoElement.remove();
            }
            
            // Atualiza a lista de pedidos imediatamente
            carregarPedidosDisponiveis();
            
            // Mostra mensagem de sucesso
            alert('Pedido rejeitado com sucesso!');
            
            // Verifica se a lista está vazia
            const listaPedidos = document.querySelector('.pedidos-lista');
            if (listaPedidos && !listaPedidos.children.length) {
                listaPedidos.innerHTML = '<p class="no-pedidos">Nenhum pedido disponível no momento</p>';
            }
        } else {
            alert(data.message || 'Erro ao rejeitar pedido');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao processar a requisição');
    });
}

// Função para lidar com remoção de pedidos
function removerPedido(pedidoId) {
    let pedido = document.getElementById(pedidoId);
    if (pedido) {
        pedido.remove();
    }
}

// Fechar o menu quando clicar fora
document.addEventListener('click', function(event) {
    const pedidosMenu = document.querySelector('.pedidos-menu');
    const subMenuPed = document.querySelector('.sub-menu-ped-wrap');
    
    if (!pedidosMenu.contains(event.target) && subMenuPed.classList.contains('open-menu-ped')) {
        subMenuPed.classList.remove('open-menu-ped');
    }
});
