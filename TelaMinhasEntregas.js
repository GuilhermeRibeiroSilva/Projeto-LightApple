function initPagination() {
    const paginationButtons = document.querySelectorAll(".page-number");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");

    if (!paginationButtons.length) return; // Se não houver botões, não faz nada

    let currentPage = 1;

    function updatePagination() {
        paginationButtons.forEach(button => {
            const page = parseInt(button.textContent);
            button.classList.toggle("active", page === currentPage);
        });

        if (prevButton && nextButton) {
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === paginationButtons.length;
        }
    }

    paginationButtons.forEach(button => {
        button.addEventListener("click", function() {
            currentPage = parseInt(this.textContent);
            carregarPedidos(currentPage);
        });
    });

    if (prevButton) {
        prevButton.addEventListener("click", function() {
            if (currentPage > 1) {
                currentPage--;
                carregarPedidos(currentPage);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function() {
            if (currentPage < paginationButtons.length) {
                currentPage++;
                carregarPedidos(currentPage);
            }
        });
    }

    updatePagination();
}

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos(1); // Carrega a primeira página de pedidos
});

function atualizarPaginacao(info) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    let html = '';
    
    if (info.total_pages > 0) {
        html += `<button class="prev" ${info.current_page === 1 ? 'disabled' : ''}>Anterior</button>`;
        
        for (let i = 1; i <= info.total_pages; i++) {
            html += `<button class="page-number ${i === info.current_page ? 'active' : ''}">${i}</button>`;
        }
        
        html += `<button class="next" ${info.current_page === info.total_pages ? 'disabled' : ''}>Próximo</button>`;
    }

    paginationContainer.innerHTML = html;
    initPagination(); // Inicializa os eventos da nova paginação
}

let currentDirectionsRenderer = null;
let map;

function initMap() {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: { lat: -23.5505, lng: -46.6333 } // Exemplo de coordenadas válidas
    });
    directionsRenderer.setMap(map);

    const start = { lat: -23.5505, lng: -46.6333 }; // Coordenadas de início
    const end = { lat: -22.9068, lng: -43.1729 }; // Coordenadas de destino

    calculateAndDisplayRoute(directionsService, directionsRenderer, start, end);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, start, end) {
    directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                console.error("Erro ao buscar direções: " + status);
            }
        }
    );
}

function mostrarRota(start, end) {
    if (!map) return;

    if (!isValidCoordinates(start) || !isValidCoordinates(end)) {
        console.error('Coordenadas inválidas:', start, end);
        alert('Não foi possível calcular a rota devido a coordenadas inválidas.');
        return;
    }

    if (currentDirectionsRenderer) {
        currentDirectionsRenderer.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: "#287326",
            strokeWeight: 5
        }
    });

    currentDirectionsRenderer = directionsRenderer;

    const request = {
        origin: new google.maps.LatLng(parseFloat(start.lat), parseFloat(start.lng)),
        destination: new google.maps.LatLng(parseFloat(end.lat), parseFloat(end.lng)),
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            const route = result.routes[0];
            
            document.getElementById('route-details').innerHTML = `
                <h3>Detalhes da Rota</h3>
                <p><strong>Distância:</strong> ${route.legs[0].distance.text}</p>
                <p><strong>Tempo estimado:</strong> ${route.legs[0].duration.text}</p>
                <p><strong>Local de Partida:</strong> ${start.endereco}</p>
                <p><strong>Local de Chegada:</strong> ${end.endereco}</p>
            `;
        } else {
            console.error('Erro ao calcular rota:', status);
        }
    });
}

function isValidCoordinates(location) {
    return location && !isNaN(location.lat) && !isNaN(location.lng);
}

// Função para carregar os dados do pedido e mostrar a rota
function carregarRotaPedido(pedidoId) {
    fetch(`buscar_dados_rota.php?pedido_id=${pedidoId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarRota(data.start, data.end);
            } else {
                console.error('Erro ao carregar dados da rota:', data.message);
            }
        })
        .catch(error => console.error('Erro:', error));
}

function renderizarPedidos(pedidos, paginationInfo) {
    const container = document.querySelector('.products-grid');
    container.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = '<div class="no-pedidos">Nenhum pedido aceito no momento</div>';
        return;
    }

    // Usar Set para evitar duplicatas
    const pedidosProcessados = new Set();

    pedidos.forEach(pedido => {
        if (pedidosProcessados.has(pedido.id)) return;
        pedidosProcessados.add(pedido.id);

        const routeData = {
            start: {
                lat: pedido.lat_partida,
                lng: pedido.lng_partida,
                endereco: pedido.endereco_partida
            },
            end: {
                lat: pedido.lat_chegada,
                lng: pedido.lng_chegada,
                endereco: pedido.endereco_chegada
            }
        };

        const card = `
            <div class="product-card" data-id="${pedido.id}" data-route='${JSON.stringify(routeData)}'>
                <div class="card-header">
                    <div class="pedido-info">
                        <h3>Pedido #${pedido.id}</h3>
                        <span class="status-badge">${pedido.status}</span>
                    </div>
                    <div class="empresa-info">
                        <span>${pedido.empresa_coleta}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="endereco-info">
                        <p><strong>Coleta:</strong> ${pedido.local_partida}</p>
                        <p><strong>Entrega:</strong> ${pedido.local_chegada}</p>
                    </div>
                    <div class="info-adicional">
                        <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                        <p><strong>Valor:</strong> R$ ${pedido.valor_entregador}</p>
                    </div>
                    <div class="card-buttons">
                        <button class="btn-vermais" onclick="mostrarDetalhes(${pedido.id})">
                            Ver mais
                        </button>
                        <button class="btn-rota show-route">
                            Mostrar Rota
                        </button>
                        <button class="btn-entregue" onclick="marcarComoEntregue(${pedido.id})">
                            Marcar como Entregue
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });

    adicionarEventosBotoesRota();
    atualizarPaginacao(paginationInfo);
}

function adicionarEventosBotoesRota() {
    document.querySelectorAll('.show-route').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const routeData = JSON.parse(card.getAttribute('data-route'));
            if (routeData.start && routeData.end) {
                mostrarRota(routeData.start, routeData.end);
            } else {
                console.error('Dados da rota não encontrados');
            }
        });
    });
}

function mostrarDetalhes(pedidoId) {
    const modal = document.getElementById('modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const pedidoCard = document.querySelector(`[data-pedido-id="${pedidoId}"]`);
    
    if (!pedidoCard) return;
    
    const pedido = JSON.parse(pedidoCard.getAttribute('data-info'));
    const modalInfo = document.getElementById('modal-info');

    // Adiciona overlay se não existir
    if (!modalOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
    }

    modalInfo.innerHTML = `
        <div class="modal-body">
            <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
            <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
            <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
            <p><strong>Valor:</strong> R$ ${pedido.valor}</p>
            <p><strong>Local de Coleta:</strong> ${pedido.endereco_partida}</p>
            <p><strong>Local de Entrega:</strong> ${pedido.endereco_chegada}</p>
            <p><strong>Status:</strong> <span class="status ${pedido.status}">${pedido.status}</span></p>
        </div>
    `;

    modal.classList.remove('hidden');
    document.querySelector('.modal-overlay').style.display = 'block';

    // Fecha o modal
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = function() {
        modal.classList.add('hidden');
        document.querySelector('.modal-overlay').style.display = 'none';
    };
}

function fecharModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.querySelector('.modal-overlay').style.display = 'none';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos(1);
});

// Função para marcar pedido como entregue
function marcarComoEntregue(pedidoId) {
    if (confirm('Tem certeza que deseja marcar este pedido como entregue?')) {
        fetch('marcar_entregue.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pedido_id: pedidoId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Pedido marcado como entregue com sucesso!');
                carregarPedidos(1); // Recarrega a lista de pedidos
            } else {
                alert(data.message || 'Erro ao marcar pedido como entregue');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao marcar pedido como entregue');
        });
    }
}

function carregarPedidos(page = 1) {
    fetch(`buscar_pedidos_aceitos.php?page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const container = document.querySelector('.products-grid');
                if (!data.pedidos || data.pedidos.length === 0) {
                    container.innerHTML = '<div class="no-pedidos">Nenhum pedido encontrado</div>';
                    return;
                }

                container.innerHTML = data.pedidos.map(pedido => `
                    <div class="product-card" data-pedido-id="${pedido.id}" data-info='${JSON.stringify(pedido)}'>
                        <div class="card-header">
                            <h3>Pedido #${pedido.id}</h3>
                            <span class="status ${pedido.status}">${pedido.status}</span>
                        </div>
                        <div class="card-content">
                            <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                            <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
                            <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                            <p><strong>Valor:</strong> R$ ${pedido.valor}</p>
                            <p><strong>Local de Coleta:</strong> ${pedido.endereco_partida}</p>
                            <p><strong>Local de Entrega:</strong> ${pedido.endereco_chegada || 'Não especificado'}</p>
                        </div>
                        <div class="card-buttons">
                            <button class="btn-vermais" onclick="mostrarDetalhes(${pedido.id})">
                                Ver Mais
                            </button>
                            <button class="btn-rota" onclick="mostrarRota(
                                {lat: ${pedido.start.lat}, lng: ${pedido.start.lng}, endereco: '${pedido.start.endereco}'},
                                {lat: ${pedido.end.lat}, lng: ${pedido.end.lng}, endereco: '${pedido.end.endereco}'}
                            )">
                                Ver Rota
                            </button>
                            <button class="btn-entregue" onclick="marcarComoEntregue(${pedido.id})">
                                Marcar como Entregue
                            </button>
                        </div>
                    </div>
                `).join('');

                // Atualiza a paginação
                atualizarPaginacao(data.pagination);
            } else {
                console.error('Erro ao carregar pedidos:', data.message);
            }
        })
        .catch(error => console.error('Erro:', error));
}

// Função para atualizar a paginação
function atualizarPaginacao(paginationData) {
    const paginationContainer = document.querySelector('.pagination');
    const totalPages = paginationData.total_pages;
    const currentPage = paginationData.current_page;

    let paginationHTML = '';
    
    if (totalPages > 1) {
        // Botão Anterior
        paginationHTML += `
            <button class="prev" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="carregarPedidos(${currentPage - 1})">
                Anterior
            </button>
        `;

        // Números das páginas
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="page-number ${i === currentPage ? 'active' : ''}"
                        onclick="carregarPedidos(${i})">
                    ${i}
                </button>
            `;
        }

        // Botão Próximo
        paginationHTML += `
            <button class="next" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="carregarPedidos(${currentPage + 1})">
                Próximo
            </button>
        `;
    }

    paginationContainer.innerHTML = paginationHTML;
}

// Variável global para o mapa
// Função de inicialização do mapa
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -12.9714, lng: -38.5014 },
        zoom: 12
    });
}

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos(1);
});

// Funções do Modal
function abrirModal(pedido) {
    const modal = document.getElementById('modal');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);

    const modalContent = `
        <div class="modal-header">
            <h3>Detalhes do Pedido</h3>
            <button class="close-btn" onclick="fecharModal()">&times;</button>
        </div>
        <div class="modal-content">
            <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
            <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
            <p><strong>Local de Coleta:</strong> ${pedido.endereco_partida}</p>
            <p><strong>Local de Entrega:</strong> ${pedido.endereco_chegada}</p>
            <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
            <p><strong>Valor:</strong> R$ ${pedido.valor_entregador}</p>
            <p><strong>Data/Hora:</strong> ${pedido.data_hora}</p>
            <p><strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}</p>
        </div>
    `;

    document.getElementById('modal-info').innerHTML = modalContent;
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function fecharModal() {
    const modal = document.getElementById('modal');
    const overlay = document.querySelector('.modal-overlay');
    modal.style.display = 'none';
    if (overlay) {
        overlay.remove();
    }
}

// Função para mostrar rota com scroll automático
function mostrarRota(start, end) {
    if (!map) return;

    if (currentDirectionsRenderer) {
        currentDirectionsRenderer.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: "#287326",
            strokeWeight: 5
        }
    });

    currentDirectionsRenderer = directionsRenderer;

    const request = {
        origin: new google.maps.LatLng(parseFloat(start.lat), parseFloat(start.lng)),
        destination: new google.maps.LatLng(parseFloat(end.lat), parseFloat(end.lng)),
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            const route = result.routes[0];
            
            document.getElementById('route-details').innerHTML = `
                <h3>Detalhes da Rota</h3>
                <p><strong>Distância:</strong> ${route.legs[0].distance.text}</p>
                <p><strong>Tempo estimado:</strong> ${route.legs[0].duration.text}</p>
                <p><strong>Local de Partida:</strong> ${start.endereco}</p>
                <p><strong>Local de Chegada:</strong> ${end.endereco}</p>
            `;
        }
    });
}

// Adicione também o CSS necessário:
const style = document.createElement('style');
style.textContent = `
    #route-details {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-top: 20px;
    }

    .route-details-container {
        font-family: Arial, sans-serif;
    }

    .route-details-header {
        border-bottom: 2px solid #287326;
        margin-bottom: 15px;
        padding-bottom: 10px;
    }

    .route-details-header h3 {
        color: #287326;
        margin: 0;
    }

    .route-info {
        margin-bottom: 20px;
    }

    .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .info-item i {
        color: #287326;
        margin-right: 10px;
        width: 20px;
    }

    .route-points {
        border-top: 1px solid #eee;
        padding-top: 15px;
    }

    .route-point {
        margin-bottom: 15px;
    }

    .route-point strong {
        color: #287326;
        display: block;
        margin-bottom: 5px;
    }

    .route-point p {
        margin: 0;
        color: #666;
    }

    .route-error {
        color: #dc3545;
        text-align: center;
        padding: 20px;
    }
`;
document.head.appendChild(style);









