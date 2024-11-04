// Elementos do menu e submenus
let subMenu = null;
let criarPed = null;
let cartDropdown = null;
let userImageCircle = null;
let userPerf = null;

// No início do arquivo, após as declarações de variáveis globais
let sugestoesBox = null;

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

    // Adicionar evento de submit ao formulário de cartão
    const formCartao = document.getElementById('form-cartao');
    if (formCartao) {
        formCartao.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nome_titular: document.getElementById('nome_titular').value,
                numero_cartao: document.getElementById('numero_cartao').value,
                data_validade: document.getElementById('data_validade').value,
                cvv: document.getElementById('cvv').value
            };
            
            try {
                const response = await fetch('cadastrar_cartao.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Cartão cadastrado com sucesso!');
                    fecharModalCartao();
                    carregarFormasPagamento(); // Recarrega a lista de cartões
                } else {
                    alert(data.error || 'Erro ao cadastrar cartão');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao cadastrar cartão');
            }
        });
    }

    // Inicialização da caixa de sugestões
    const empresaInput = document.getElementById('empresa-coleta');
    if (empresaInput) {
        sugestoesBox = document.createElement('div');
        sugestoesBox.className = 'suggestions-box';
        empresaInput.parentNode.appendChild(sugestoesBox);

        empresaInput.addEventListener('input', async function() {
            const termo = this.value;
            if (termo.length >= 2) {
                try {
                    const response = await fetch(`buscar_empresas.php?termo=${encodeURIComponent(termo)}`);
                    const empresas = await response.json();
                    
                    sugestoesBox.innerHTML = '';
                    empresas.forEach(empresa => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.textContent = `${empresa.nome} (Limite: ${empresa.limite_coleta}kg)`;
                        div.onclick = function() {
                            empresaInput.value = empresa.nome;
                            document.getElementById('local-chegada').value = empresa.endereco;
                            document.getElementById('empresa-id').value = empresa.id;
                            // Não limpar sugestoesBox aqui
                        };
                        sugestoesBox.appendChild(div);
                    });
                } catch (error) {
                    console.error('Erro ao buscar empresas:', error);
                }
            } else {
                sugestoesBox.innerHTML = '';
            }
        });

        // Adicionar evento para fechar sugestões ao clicar fora
        document.addEventListener('click', function(e) {
            if (!empresaInput.contains(e.target) && !sugestoesBox.contains(e.target)) {
                sugestoesBox.innerHTML = '';
            }
        });
    }

    // Adicionar formatação automática para data de validade
    const dataValidadeInput = document.getElementById('data_validade');
    if (dataValidadeInput) {
        dataValidadeInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value.substring(0, 5);
            
            // Validação básica do mês
            const mes = parseInt(value.substring(0, 2));
            if (mes > 12) {
                e.target.value = '12' + value.substring(2);
            }
            if (mes < 1 && value.length >= 2) {
                e.target.value = '01' + value.substring(2);
            }
        });

        dataValidadeInput.addEventListener('blur', function(e) {
            const value = e.target.value;
            if (value.length === 5) {
                const [mes, ano] = value.split('/');
                const dataAtual = new Date();
                const anoAtual = dataAtual.getFullYear() % 100;
                const mesAtual = dataAtual.getMonth() + 1;

                if (parseInt(ano) < anoAtual || (parseInt(ano) === anoAtual && parseInt(mes) < mesAtual)) {
                    alert('Data de validade não pode ser menor que a data atual');
                    e.target.value = '';
                }
            }
        });
    }
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
    const criarPed = document.getElementById("criarPed");
    if (criarPed) {
        criarPed.classList.toggle("open-menu-ped");
    }
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
    const valorPorKg = 5; // R$ 5 por kg
    const valorBase = quantidadeLixo * valorPorKg;
    
    // Cálculo do frete
    const distanciaKm = 10; // Exemplo: distância fixa de 10km
    const frete = calcularFrete(distanciaKm);
    
    const valorTotal = valorBase + frete;

    // Atualizar spans de exibição
    document.getElementById('valor-display').textContent = `R$ ${valorBase.toFixed(2)}`;
    document.getElementById('frete-display').textContent = `R$ ${frete.toFixed(2)}`;
    document.getElementById('valor-total-display').textContent = `R$ ${valorTotal.toFixed(2)}`;
}

// Inicializar formulário de pedido
document.addEventListener('DOMContentLoaded', function() {
    const empresaInput = document.getElementById('empresa-coleta');
    const sugestoesBox = document.createElement('div');
    sugestoesBox.className = 'suggestions-box';
    empresaInput.parentNode.appendChild(sugestoesBox);

    // Carregar endereço do usuário automaticamente
    carregarEnderecoUsuario();

    empresaInput.addEventListener('input', async function() {
        const termo = this.value;
        if (termo.length >= 2) {
            const empresas = await buscarEmpresas(termo);
            sugestoesBox.innerHTML = '';
            empresas.forEach(empresa => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = empresa.nome;
                div.onclick = function() {
                    empresaInput.value = empresa.nome;
                    document.getElementById('local-chegada').value = empresa.endereco;
                    sugestoesBox.innerHTML = '';
                };
                sugestoesBox.appendChild(div);
            });
        }
    });

    // Atualizar exibição de valores quando quantidade ou distância mudar
    const quantidadeLixoInput = document.getElementById('quantidade-lixo');
    const valorSpan = document.getElementById('valor-display');
    const freteSpan = document.getElementById('frete-display');
    const valorTotalSpan = document.getElementById('valor-total-display');

    quantidadeLixoInput.addEventListener('input', calcularValorTotal);

    // Carregar formas de pagamento salvas
    carregarFormasPagamento();
});

async function carregarFormasPagamento() {
    try {
        const response = await fetch('buscar_formas_pagamento.php');
        const cartoes = await response.json();
        
        const select = document.getElementById('forma-pagamento');
        select.innerHTML = '<option value="">Selecione um cartão</option>';
        
        cartoes.forEach(cartao => {
            const option = document.createElement('option');
            option.value = cartao.id;
            option.textContent = cartao.descricao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cartões:', error);
    }
}

// Substituir a função criarPedido existente
async function criarPedido() {
    const formData = {
        local_id: document.getElementById('empresa-id').value,
        cartao_id: document.getElementById('forma-pagamento').value,
        quantidade_lixo: document.getElementById('quantidade-lixo').value,
        local_partida: document.getElementById('local-partida').value,
        local_chegada: document.getElementById('local-chegada').value,
        valor: parseFloat(document.getElementById('valor-display').textContent.replace('R$ ', '').replace(',', '.')),
        frete: parseFloat(document.getElementById('frete-display').textContent.replace('R$ ', '').replace(',', '.')),
        valor_total: parseFloat(document.getElementById('valor-total-display').textContent.replace('R$ ', '').replace(',', '.'))
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
            limparFormularioPedido();
            toggleMenuPed();
        } else {
            alert('Erro ao criar pedido: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        alert('Erro ao criar pedido. Tente novamente.');
    }
}

// Função para limpar formulário de pedido
function limparFormularioPedido() {
    document.getElementById('empresa-coleta').value = '';
    document.getElementById('forma-pagamento').value = '';
    document.getElementById('quantidade-lixo').value = '';
    document.getElementById('local-chegada').value = '';
    document.getElementById('valor-display').textContent = 'R$ 0,00';
    document.getElementById('frete-display').textContent = 'R$ 0,00';
    document.getElementById('valor-total-display').textContent = 'R$ 0,00';
}

// Funções para gerenciamento do modal de cartão
function abrirModalCartao() {
    document.getElementById('modal-cartao').style.display = 'block';
}

function fecharModalCartao() {
    document.getElementById('modal-cartao').style.display = 'none';
    document.getElementById('form-cartao').reset();
}

// Função para carregar endereço do usuário
async function carregarEnderecoUsuario() {
    try {
        const response = await fetch('buscar_endereco_usuario.php');
        const data = await response.json();
        if (data.success) {
            document.getElementById('local-partida').value = data.endereco;
        }
    } catch (error) {
        console.error('Erro ao carregar endereço do usuário:', error);
    }
}