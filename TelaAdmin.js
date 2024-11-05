document.addEventListener('DOMContentLoaded', function() {
    carregarLocais();
    carregarProdutos();
    carregarPedidosTroca();
    
    // Setup do formulário de cadastro de local
    document.getElementById('cadastro-local-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(this);
            const endereco = formData.get('endereco');
            
            // Inicializar o geocoder
            const geocoder = new google.maps.Geocoder();
            
            // Converter endereço em coordenadas
            geocoder.geocode({ address: endereco }, async function(results, status) {
                if (status === 'OK') {
                    const latitude = results[0].geometry.location.lat();
                    const longitude = results[0].geometry.location.lng();
                    
                    // Adicionar lat/long ao FormData
                    formData.append('latitude', latitude);
                    formData.append('longitude', longitude);
                    
                    try {
                        const response = await fetch('cadastrar_local_admin.php', {
                            method: 'POST',
                            body: formData
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            alert('Local cadastrado com sucesso!');
                            limparFormulario('cadastro-local-form');
                            fecharOverlay('localOverlay');
                            carregarLocais();
                        } else {
                            alert('Erro ao cadastrar local: ' + data.message);
                        }
                    } catch (error) {
                        console.error('Erro:', error);
                        alert('Erro ao cadastrar local');
                    }
                } else {
                    alert('Erro ao converter endereço em coordenadas: ' + status);
                }
            });
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao processar o cadastro');
        }
    });
    
    // Setup dos formulários
    document.getElementById('cadastro-produto-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(this);
            const response = await fetch('cadastrar_produto_admin.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Produto cadastrado com sucesso!');
                limparFormulario('cadastro-produto-form');
                fecharOverlay('produtoOverlay');
                carregarProdutos();
            } else {
                alert('Erro ao cadastrar produto: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar produto');
        }
    });
});

// Funções para mostrar/esconder overlays
function mostrarFormularioCadastroLocal() {
    document.getElementById('localOverlay').style.display = 'flex';
    
    // Adicionar evento para controlar o campo de limite de coleta
    const categorySelect = document.getElementById('categoria');
    const limiteColetaContainer = document.getElementById('limite-coleta-container');
    
    categorySelect.addEventListener('change', function() {
        limiteColetaContainer.style.display = 
            this.value === 'empresa de coleta' ? 'block' : 'none';
        document.getElementById("limite-coleta").required = 
            this.value === 'empresa de coleta';
    });
}

function mostrarFormularioCadastroProduto() {
    document.getElementById('produtoOverlay').style.display = 'flex';
}

function fecharOverlay(overlayId) {
    document.getElementById(overlayId).style.display = 'none';
}

// Carregar locais existentes
async function carregarLocais() {
    try {
        const response = await fetch('carregar_locais_admin.php');
        const data = await response.json();
        
        const grid = document.getElementById('locais-grid');
        grid.innerHTML = '';
        
        data.forEach(local => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-info">
                    <span class="item-id">#${local.id}</span>
                    <span class="item-nome">${local.nome}</span>
                </div>
                <button class="delete-btn" onclick="deletarLocal(${local.id})">Excluir</button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar locais:', error);
    }
}

// Carregar produtos existentes
async function carregarProdutos() {
    try {
        const response = await fetch('carregar_produtos_admin.php');
        const data = await response.json();
        
        const grid = document.getElementById('produtos-grid');
        grid.innerHTML = '';
        
        data.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-info">
                    <span class="item-id">#${produto.id}</span>
                    <span class="item-nome">${produto.nome}</span>
                </div>
                <button class="delete-btn" onclick="deletarProduto(${produto.id})">Excluir</button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Funções para deletar itens
async function deletarLocal(id) {
    if (confirm('Tem certeza que deseja excluir este local?')) {
        try {
            const response = await fetch('deletar_local.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            
            const data = await response.json();
            if (data.success) {
                carregarLocais();
            } else {
                alert('Erro ao deletar local: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar local');
        }
    }
}

async function deletarProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            const response = await fetch('deletar_produto.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            
            const data = await response.json();
            if (data.success) {
                carregarProdutos();
            } else {
                alert('Erro ao deletar produto: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar produto');
        }
    }
}

// Função para limpar formulário
function limparFormulario(formId) {
    const form = document.getElementById(formId);
    form.reset();
    
    // Limpar previews de imagem se existirem
    const imagePreview = form.querySelector('.image-preview');
    if (imagePreview) {
        imagePreview.style.backgroundImage = '';
    }
    
    // Se for o formulário de local, resetar o container de limite de coleta
    if (formId === 'cadastro-local-form') {
        document.getElementById('limite-coleta-container').style.display = 'none';
        document.getElementById('limite-coleta').required = false;
    }
}

// Função para carregar pedidos de troca
async function carregarPedidosTroca() {
    try {
        const response = await fetch('carregar_pedidos_troca_admin.php');
        const data = await response.json();
        
        const grid = document.getElementById('pedidos-troca-grid');
        grid.innerHTML = '';
        
        data.forEach(pedido => {
            const card = document.createElement('div');
            card.className = 'pedido-card';
            card.innerHTML = `
                <div class="pedido-info">
                    <span class="pedido-id">#${pedido.numero}</span>
                    <span class="pedido-cliente">Cliente: ${pedido.nome_cliente}</span>
                    <span class="pedido-pontos">Pontos: ${pedido.pontos_total}</span>
                    <span class="pedido-data">Data: ${formatarData(pedido.data_compra)}</span>
                    <span class="status-badge ${pedido.status}">${pedido.status.toUpperCase()}</span>
                </div>
                <div class="pedido-acoes">
                    <button class="info-btn" onclick="verDetalhesPedido(${pedido.id})">Ver Detalhes</button>
                    ${pedido.status === 'pendente' ? 
                        `<button class="finalizar-btn" onclick="finalizarPedido(${pedido.id})">Finalizar Pedido</button>` 
                        : ''}
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

// Função para ver detalhes do pedido
async function verDetalhesPedido(id) {
    try {
        const response = await fetch(`buscar_detalhes_pedido.php?id=${id}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        const pedido = data;
        const status = pedido.status ? pedido.status.toUpperCase() : 'PENDENTE';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Detalhes do Pedido #${pedido.numero}</h3>
                <div class="pedido-detalhes">
                    <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                    <p><strong>Data:</strong> ${formatarData(pedido.data_compra)}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <p><strong>Total de Pontos:</strong> ${pedido.pontos_total}</p>
                    <h4>Itens:</h4>
                    <ul>
                        ${pedido.itens.map(item => `
                            <li>${item.nome_produto} - ${item.pontos} pontos</li>
                        `).join('')}
                    </ul>
                </div>
                <button onclick="this.closest('.modal').remove()">Fechar</button>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
        alert('Erro ao buscar detalhes do pedido');
    }
}

// Função para finalizar pedido
async function finalizarPedido(id) {
    if (confirm('Tem certeza que deseja finalizar este pedido?')) {
        try {
            const response = await fetch('finalizar_pedido_troca.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            
            const data = await response.json();
            if (data.success) {
                alert('Pedido finalizado com sucesso!');
                carregarPedidosTroca();
            } else {
                alert('Erro ao finalizar pedido: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao finalizar pedido');
        }
    }
}

// Adicionar no início do arquivo, antes do DOMContentLoaded
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        window.location.href = 'logout.php';
    }
}