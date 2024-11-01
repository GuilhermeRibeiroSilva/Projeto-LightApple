// Elementos do menu e submenus
let subMenu = document.getElementById("subMenu");
let criarPed = document.getElementById("criarPed");
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
    closeAllMenus();
    if (criarPed) criarPed.classList.toggle("open-menu-ped");
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

// Seleciona os elementos que contêm as listas de pedidos
const availableOrdersList = document.getElementById('available-orders-list');
const dropdownPedidosList = document.getElementById('dropdown-pedidos-list');
const noAvailableOrders = document.getElementById('no-available-orders');

// Exemplo de dados de pedidos (normalmente isso viria de uma API ou outra fonte de dados)
const pedidos = [
    {
        id: '001',
        nome: 'Restaurante A',
        partida: 'Rua 1, Nº 50',
        chegada: 'Rua 10, Nº 200',
        peso: '2kg',
        valor: 'R$ 25,00'
    },
    {
        id: '002',
        nome: 'Restaurante B',
        partida: 'Rua 3, Nº 100',
        chegada: 'Rua 20, Nº 300',
        peso: '3kg',
        valor: 'R$ 40,00'
    }
];

// Função para criar o HTML de um pedido
function criarPedidoHTML(pedido) {
    return `
        <div class="pedidoNum" data-id="${pedido.id}">
            <h3>PEDIDO #${pedido.id}</h3>
            <p><strong>Nome do Local:</strong> ${pedido.nome}</p>
            <p><strong>Partida:</strong> ${pedido.partida}</p>
            <p><strong>Chegada:</strong> ${pedido.chegada}</p>
            <p><strong>Peso:</strong> ${pedido.peso}</p>
            <p><strong>Valor:</strong> ${pedido.valor}</p>
            <div class="botoes">
                <button class="recebido">Recebido</button>
            </div>
        </div>
    `;
}

// Função para adicionar um pedido às duas listas
function adicionarPedido(pedido) {
    const pedidoHTML = criarPedidoHTML(pedido);

    // Adiciona o pedido à lista da seção PedDisp
    availableOrdersList.insertAdjacentHTML('beforeend', pedidoHTML);

    // Adiciona o mesmo pedido ao dropdown
    dropdownPedidosList.insertAdjacentHTML('beforeend', pedidoHTML);

    // Atualiza a visibilidade do aviso de "Aguardar"
    noAvailableOrders.style.display = 'none';

    // Adiciona o evento de clique para o botão "Recebido"
    document.querySelectorAll('.recebido').forEach(button => {
        button.addEventListener('click', function() {
            // Remove o pedido das duas listas
            const pedidoElement = this.closest('.pedidoNum');
            const pedidoId = pedidoElement.getAttribute('data-id');

            // Remove da lista de PedDisp
            document.querySelector(`#available-orders-list .pedidoNum[data-id="${pedidoId}"]`).remove();

            // Remove do dropdown
            document.querySelector(`#dropdown-pedidos-list .pedidoNum[data-id="${pedidoId}"]`).remove();

            // Verifica se ainda existem pedidos disponíveis
            if (availableOrdersList.children.length === 0) {
                noAvailableOrders.style.display = 'block'; // Exibe mensagem de aguardar
            }
        });
    });
}

// Função para carregar os pedidos na inicialização
function carregarPedidos() {
    pedidos.forEach(pedido => adicionarPedido(pedido));
}

// Chama a função para carregar os pedidos iniciais
carregarPedidos();

// Função para salvar os pedidos no LocalStorage
function salvarPedidos() {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

// Chame essa função quando os pedidos forem carregados ou atualizados
salvarPedidos();