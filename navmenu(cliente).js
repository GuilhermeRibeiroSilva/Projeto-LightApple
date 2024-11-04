// Elementos do menu e submenus
let subMenu = null;
let criarPed = null;
let cartDropdown = null;
let userImageCircle = null;
let userPerf = null;

// Função para inicializar os elementos após o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    subMenu = document.getElementById("subMenu");
    criarPed = document.getElementById("criarPed");
    cartDropdown = document.getElementById("cartDropdown");
    userImageCircle = document.getElementById("userImageCircle");
    userPerf = document.querySelector(".user-perf");

    // Inicializar event listeners apenas se os elementos existirem
    if (document.querySelector('.user-pic')) {
        document.querySelector('.user-pic').onclick = toggleMenu;
    }
    if (document.querySelector('.ped-pic')) {
        document.querySelector('.ped-pic').onclick = toggleMenuPed;
    }
    if (document.querySelector('.cart-pic')) {
        document.querySelector('.cart-pic').onclick = toggleCart;
    }

    // Carregamento do perfil do usuário
    const userIdElement = document.getElementById("user-id");
    if (userIdElement && userIdElement.value) {
        carregarPerfilUsuario(userIdElement.value);
    }

    // Event listener para cliques fora dos menus
    document.addEventListener('click', handleOutsideClick);

    // Inicializar event listeners para remover itens do carrinho
    initializeRemoveButtons();
});

// Função para carregar o perfil do usuário
function carregarPerfilUsuario(userId) {
    fetch(`carregar_perfil.php?id=${userId}`) 
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                atualizarImagemPerfil(data.usuario.profile_image_path);
            } else {
                console.error(data.error);
                atualizarImagemPerfil('imagens/Avatar.png');
            }
        })
        .catch(error => {
            console.error("Erro ao carregar imagem de perfil:", error);
            atualizarImagemPerfil('imagens/Avatar.png');
        });
}

// Função para fechar todos os menus
function closeAllMenus() {
    if (subMenu) subMenu.classList.remove("open-menu");
    if (criarPed) criarPed.classList.remove("open-menu-ped");
    if (cartDropdown) cartDropdown.classList.remove("open-cart");
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

// Função para alternar o carrinho
function toggleCart() {
    closeAllMenus();
    if (cartDropdown) cartDropdown.classList.toggle("open-cart");
}

// Função para lidar com cliques fora dos menus
function handleOutsideClick(event) {
    const isClickInsideMenu = event.target.closest('.user-menu') || 
                            event.target.closest('.pedido-menu') || 
                            event.target.closest('.cart-menu');
    
    if (!isClickInsideMenu) {
        closeAllMenus();
    }
}

// Função para inicializar os botões de remover item
function initializeRemoveButtons() {
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
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

// Função para limpar o carrinho
function limparCarrinho() {
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
        cartItems.innerHTML = '';
        atualizarTotalCarrinho();
    }
}

// Função para atualizar o total do carrinho
function atualizarTotalCarrinho() {
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;
    
    cartItems.forEach(item => {
        const pontos = parseInt(item.querySelector('.cart-info p').textContent.match(/\d+/)[0]);
        total += pontos;
    });

    const totalElement = document.querySelector('.total-pontos');
    if (totalElement) {
        totalElement.textContent = `Total: ${total} P`;
    }
}

// Função para finalizar a compra
async function finalizarCompra() {
    try {
        const cartItems = document.querySelectorAll('.cart-item');
        if (cartItems.length === 0) {
            alert('Carrinho vazio!');
            return;
        }

        const items = [];
        cartItems.forEach(item => {
            items.push({
                name: item.querySelector('.cart-info h4').textContent,
                points: item.querySelector('.cart-info p').textContent
            });
        });

        const response = await fetch('finalizar_compra.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Compra realizada com sucesso!');
            // Atualiza os pontos no menu do usuário
            const pontosElement = document.getElementById('points');
            if (pontosElement) {
                pontosElement.textContent = `Meus Pontos: ${data.newPoints} P`;
            }
            limparCarrinho();
        } else {
            alert(data.message || 'Erro ao finalizar compra');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar a compra');
    }
}

// Adicionar novas funções para o formulário de pedido
async function buscarEmpresas(termo) {
    try {
        const response = await fetch(`buscar_empresas.php?termo=${encodeURIComponent(termo)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        return [];
    }
}

async function buscarEnderecoEmpresa(empresaId) {
    try {
        const response = await fetch(`buscar_endereco_empresa.php?id=${empresaId}`);
        const data = await response.json();
        return data.endereco;
    } catch (error) {
        console.error('Erro ao buscar endereço da empresa:', error);
        return '';
    }
}

function calcularFrete(distanciaKm) {
    const taxaBaseKm = 2; // R$ 2 por km
    const freteBase = 10; // Frete base R$ 10
    return freteBase + (distanciaKm * taxaBaseKm);
}

async function calcularValorTotal() {
    const quantidadeLixo = parseFloat(document.getElementById('quantidade-lixo').value) || 0;
    const localPartida = document.getElementById('local-partida').value;
    const localChegada = document.getElementById('local-chegada').value;

    if (quantidadeLixo && localPartida && localChegada) {
        try {
            // Usa o calcular_distancias.php existente
            const response = await fetch('calcular_distancias.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude: localPartida.split(',')[0],  // Assumindo que o formato é "latitude,longitude"
                    longitude: localPartida.split(',')[1]
                })
            });
            
            const data = await response.json();
            if (data.success) {
                // Pega a primeira distância retornada (ou ajuste conforme sua necessidade)
                const distanciaKm = data.distancias[0].distancia;
                const valorBase = 20; // Valor base para coleta de lixo
                const frete = calcularFrete(distanciaKm);
                
                document.getElementById('valor').value = valorBase;
                document.getElementById('frete').value = frete.toFixed(2);
                document.getElementById('valor-com-frete').value = (valorBase + frete).toFixed(2);
            }
        } catch (error) {
            console.error('Erro ao calcular valor:', error);
        }
    }
}

// Inicializar formulário de pedido
document.addEventListener('DOMContentLoaded', function() {
    const empresaInput = document.getElementById('empresa-coleta');
    const sugestoesBox = document.createElement('div');
    sugestoesBox.className = 'suggestions-box';
    empresaInput.parentNode.appendChild(sugestoesBox);

    empresaInput.addEventListener('input', async function() {
        const termo = this.value;
        if (termo.length >= 2) {
            const empresas = await buscarEmpresas(termo);
            sugestoesBox.innerHTML = '';
            empresas.forEach(empresa => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = empresa.nome;
                div.onclick = async function() {
                    empresaInput.value = empresa.nome;
                    document.getElementById('local-chegada').value = empresa.endereco;
                    sugestoesBox.innerHTML = '';
                };
                sugestoesBox.appendChild(div);
            });
        }
    });

    // Carregar formas de pagamento salvas
    carregarFormasPagamento();

    // Atualizar valores quando quantidade mudar
    document.getElementById('quantidade-lixo').addEventListener('input', calcularValorTotal);
});

async function carregarFormasPagamento() {
    try {
        const response = await fetch('buscar_formas_pagamento.php');
        const data = await response.json();
        
        const select = document.getElementById('forma-pagamento');
        data.forEach(forma => {
            const option = document.createElement('option');
            option.value = forma.id;
            option.textContent = forma.descricao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar formas de pagamento:', error);
    }
}

async function criarPedido() {
    const formData = {
        empresa: document.getElementById('empresa-coleta').value,
        formaPagamento: document.getElementById('forma-pagamento').value,
        quantidadeLixo: document.getElementById('quantidade-lixo').value,
        localPartida: document.getElementById('local-partida').value,
        localChegada: document.getElementById('local-chegada').value,
        valor: document.getElementById('valor').value,
        frete: document.getElementById('frete').value,
        valorTotal: document.getElementById('valor-com-frete').value
    };

    try {
        const response = await fetch('criar_pedido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            alert(`Pedido criado com sucesso!\nNúmero do pedido: ${data.numeroPedido}\nData: ${data.dataPedido}`);
            toggleMenuPed(); // Fecha o dropdown
        } else {
            alert('Erro ao criar pedido: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        alert('Erro ao criar pedido. Tente novamente.');
    }
}