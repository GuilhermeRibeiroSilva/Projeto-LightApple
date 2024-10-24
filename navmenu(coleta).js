let subMenu = document.getElementById("subMenu");
let criarPed = document.getElementById("criarPed");

function toggleMenu() {
    // Fecha os outros menus se estiverem abertos
    if (criarPed.classList.contains("open-menu-ped")) {
        criarPed.classList.remove("open-menu-ped");
    }

    // Alterna o menu atual
    subMenu.classList.toggle("open-menu");
}

function toggleMenuPed() {
    // Fecha os outros menus se estiverem abertos
    if (subMenu.classList.contains("open-menu")) {
        subMenu.classList.remove("open-menu");
    }
    // Alterna o menu atual
    criarPed.classList.toggle("open-menu-ped");
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



