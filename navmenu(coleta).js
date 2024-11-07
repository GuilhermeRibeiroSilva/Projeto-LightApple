// Elementos do menu e submenus
let subMenu = document.getElementById("subMenu");
let criarPed = document.getElementById("criarPed");
let userImageCircle = null;
let userPerf = null;

// Função para inicializar os elementos após o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, iniciando carregamento de pedidos');
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

    carregarPedidosUsuario();
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
    const subMenuPedWrap = document.querySelector('.sub-menu-ped-wrap');
    if (subMenuPedWrap) {
        subMenuPedWrap.classList.remove('open-menu-ped');
    }
    if (subMenu) {
        subMenu.classList.toggle('open-menu');
    }
}

// Função para alternar o menu de pedidos
function toggleMenuPed(event) {
    if (event) {
        event.stopPropagation();
    }
    
    const subMenuPedWrap = document.querySelector('.sub-menu-ped-wrap');
    if (subMenuPedWrap) {
        // Fecha o menu de perfil
        if (subMenu) {
            subMenu.classList.remove('open-menu');
        }
        
        // Toggle do menu de pedidos
        subMenuPedWrap.classList.toggle('open-menu-ped');
        
        // Se abriu o menu, carrega os pedidos
        if (subMenuPedWrap.classList.contains('open-menu-ped')) {
            carregarPedidosUsuario();
        }
    }
}

// Função para lidar com cliques fora dos menus
function handleOutsideClick(event) {
    const isClickInsideUserMenu = event.target.closest('.user-menu');
    const isClickInsidePedidoMenu = event.target.closest('.pedido-menu');
    
    if (!isClickInsideUserMenu && !isClickInsidePedidoMenu) {
        const subMenuPedWrap = document.querySelector('.sub-menu-ped-wrap');
        if (subMenuPedWrap) {
            subMenuPedWrap.classList.remove('open-menu-ped');
        }
        if (subMenu) {
            subMenu.classList.remove('open-menu');
        }
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

// Função para carregar os pedidos do usuário logado
function carregarPedidosUsuario() {
    const userId = document.getElementById('user-id').value;
    console.log('Carregando pedidos para usuário ID:', userId);
    
    fetch(`get_pedidos_empresa.php?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Resposta do servidor:', data);
            
            if (data.success) {
                console.log('Pedidos encontrados:', data.pedidos.length);
                atualizarListasPedidos(data.pedidos);
            } else {
                console.error('Erro ao carregar pedidos:', data.error);
                console.log('Dados de debug:', data.debug);
                mostrarMensagemSemPedidos();
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            mostrarMensagemSemPedidos();
        });
}

// Função para mostrar mensagem quando não há pedidos
function mostrarMensagemSemPedidos() {
    const noAvailableOrders = document.getElementById('no-available-orders');
    const availableOrdersList = document.getElementById('available-orders-list');
    const dropdownPedidosList = document.getElementById('dropdown-pedidos-list');

    if (noAvailableOrders) {
        noAvailableOrders.style.display = 'block';
    }
    
    if (availableOrdersList) {
        availableOrdersList.innerHTML = '';
    }
    
    if (dropdownPedidosList) {
        dropdownPedidosList.innerHTML = '';
    }
}

// Função para atualizar as listas de pedidos
function atualizarListasPedidos(pedidos) {
    console.log('Atualizando listas com pedidos:', pedidos);
    
    const mainPedidosList = document.querySelector('.pedidos-lista-peddisp');
    const navPedidosList = document.querySelector('.pedidos-lista');
    
    console.log('Elementos encontrados:', {mainPedidosList, navPedidosList});

    if (!mainPedidosList || !navPedidosList) {
        console.error('Elementos da lista não encontrados');
        return;
    }

    // Limpa as listas existentes
    mainPedidosList.innerHTML = '';
    navPedidosList.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        mainPedidosList.innerHTML = '<p>Nenhum pedido disponível</p>';
        navPedidosList.innerHTML = '<p>Nenhum pedido disponível</p>';
        return;
    }

    // Atualiza a lista principal
    const mainHTML = pedidos.map(pedido => criarPedidoHTML(pedido, false)).join('');
    mainPedidosList.innerHTML = mainHTML;
    
    // Atualiza a lista do nav
    const navHTML = pedidos.map(pedido => criarPedidoHTML(pedido, true)).join('');
    navPedidosList.innerHTML = navHTML;
    
    console.log('HTML gerado para main:', mainHTML);
    console.log('HTML gerado para nav:', navHTML);
}

function criarPedidoHTML(pedido) {
    return `
        <div class="pedido-box" data-id="${pedido.id}">
            <div class="pedido-detalhes">
                <h4>Pedido #${pedido.id}</h4>
                <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                <p><strong>Partida:</strong> ${pedido.local_partida}</p>
                <p><strong>Chegada:</strong> ${pedido.local_chegada}</p>
                <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                <p><strong>Valor:</strong> R$ ${pedido.valor_total || '0.00'}</p>
            </div>
            <div class="pedido-acoes">
                <button class="btn-recebido" onclick="marcarPedidoComoRecebido(${pedido.id})">
                    Receber
                </button>
            </div>
        </div>
    `;
}

function atualizarPedidosNav(pedidos) {
    const listaPedidos = document.querySelector('.sub-menu-ped .pedidos-lista');
    if (!listaPedidos) return;

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = '<p class="no-pedidos">Nenhum pedido disponível no momento</p>';
        return;
    }

    listaPedidos.innerHTML = pedidos.map(pedido => criarPedidoHTML(pedido)).join('');
}
// Função para adicionar eventos aos botões
function adicionarEventosBotoes() {
    document.querySelectorAll('.recebido').forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.getAttribute('data-pedido-id');
            marcarPedidoComoRecebido(pedidoId);
        });
    });
}

// Adicione esta função no arquivo
function marcarPedidoComoRecebido(pedidoId) {
    if (!confirm('Confirmar recebimento do pedido?')) return;

    const userId = document.getElementById('user-id').value;

    fetch('marcar_pedido_recebido.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pedido_id: pedidoId,
            user_id: userId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pedido marcado como recebido com sucesso!');
            carregarPedidosTelaInicial(); // Atualiza a lista de pedidos
        } else {
            alert(data.message || 'Erro ao marcar pedido como recebido');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao marcar pedido como recebido');
    });
}
