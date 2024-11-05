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

let map;
let directionsService;
let directionsRenderer;
let geocoder;

function initMap() {
    // Inicializa o mapa
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -12.9714, lng: -38.5014 },
        zoom: 13,
    });

    // Inicializa DirectionsService, DirectionsRenderer e Geocoder
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    geocoder = new google.maps.Geocoder();
    directionsRenderer.setMap(map);

    // Adiciona listeners para os botões "Mostrar Percurso"
    const routeButtons = document.querySelectorAll(".show-route");
    routeButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const product = button.closest('.product');
            const routeData = JSON.parse(product.getAttribute('data-route')); // Obtém as coordenadas do data-route
            const start = routeData.start;
            const end = routeData.end;

            calculateAndDisplayRoute(start, end, product); // Calcula e exibe a rota, passando o produto
        });
    });
}

function calculateAndDisplayRoute(start, end, product) {
    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);

            const route = response.routes[0].legs[0];
            const distance = route.distance.text;
            const duration = route.duration.text;

            // Atualiza os detalhes da rota no route-details
            const routeDetails = document.getElementById("route-details");
            routeDetails.innerHTML = `
                <h4>Detalhes da Rota:</h4>
                <p><strong>Endereço de Partida:</strong> ${route.start_address}</p>
                <p><strong>Endereço de Chegada:</strong> ${route.end_address}</p>
                <p><strong>Distância:</strong> ${distance}</p>
                <p><strong>Duração estimada:</strong> ${duration}</p>
            `;
            routeDetails.style.display = "block";

            // Salva os endereços no atributo data do produto para serem usados no modal
            product.setAttribute('data-start-address', route.start_address);
            product.setAttribute('data-end-address', route.end_address);

        } else {
            console.error("Erro ao calcular a rota: " + status);
        }
    });
}

// Função para converter coordenadas em endereços usando Geocoder
function geocodeLatLng(location, callback) {
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                callback(results[0].formatted_address); // Retorna o endereço convertido
            } else {
                console.error('Nenhum resultado encontrado para o endereço.');
                callback('Endereço não disponível');
            }
        } else {
            console.error('Erro de Geocoder: ' + status);
            callback('Erro ao obter o endereço');
        }
    });
}

// Função para abrir o modal e obter endereços através do data-route
function updateModal(info, startCoordinates, endCoordinates) {
    // Converte as coordenadas de partida e chegada em endereços e só então atualiza o modal
    geocodeLatLng(startCoordinates, (startAddress) => {
        geocodeLatLng(endCoordinates, (endAddress) => {
            const modalInfo = document.getElementById('modal-info');
            modalInfo.innerHTML = `
                <p><strong>Pedido:</strong> ${info.id}</p>
                <p><strong>Cliente:</strong> ${info.nome_cliente}</p>
                <p><strong>Empresa:</strong> ${info.estabelecimento}</p>
                <p><strong>Local de Partida:</strong> ${startAddress}</p>
                <p><strong>Local de Chegada:</strong> ${endAddress}</p>
                <p><strong>Data/Hora:</strong> ${info.data_hora}</p>
                <p><strong>Entregador:</strong> ${info.entregador}</p>
                <p><strong>Quantidade:</strong> ${info.quantidade}</p>
                <p><strong>Valor a Receber:</strong> R$ ${info.valor_entregador}</p>
                <p><strong>Forma de Pagamento:</strong> ${info.forma_pagamento}</p>
                <p><strong>Status:</strong> ${info.status}</p>
            `;
        });
    });
}

// Modal logic (independente do botão "Mostrar Percurso")
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);

    // Função para abrir o modal
    function openModal(info, startCoordinates, endCoordinates) {
        updateModal(info, startCoordinates, endCoordinates); // Atualiza o modal com as coordenadas
        document.body.classList.add('modal-active');
    }

    // Função para fechar o modal
    function closeModal() {
        document.body.classList.remove('modal-active');
    }

    // Adicionar evento de clique nos ícones de info
    document.querySelectorAll('.info').forEach(infoIcon => {
        infoIcon.addEventListener('click', (e) => {
            const product = e.target.closest('.product');
            const info = JSON.parse(product.getAttribute('data-info'));
            const routeData = JSON.parse(product.getAttribute('data-route')); // Obtém as coordenadas do data-route
            const startCoordinates = routeData.start;
            const endCoordinates = routeData.end;
            
            openModal(info, startCoordinates, endCoordinates); // Abre o modal com as coordenadas
        });
    });

    // Fechar o modal ao clicar no botão de fechar
    closeModalBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
});

// Carregar o mapa ao carregar a página
window.onload = initMap;

// Função para marcar pedido como entregue
function marcarComoEntregue(pedidoId) {
    if (!confirm('Confirma que este pedido foi entregue?')) return;

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
            // Remove o card do pedido
            document.querySelector(`.product[data-id="${pedidoId}"]`).remove();
            alert('Pedido marcado como entregue com sucesso!');
        } else {
            alert(data.message || 'Erro ao marcar pedido como entregue');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao marcar pedido como entregue');
    });
}

function renderizarPedidos(pedidos, paginationInfo) {
    const container = document.querySelector('.products-grid');
    container.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = '<div class="no-pedidos">Nenhum pedido aceito no momento</div>';
        return;
    }

    pedidos.forEach(pedido => {
        const card = `
            <div class="product" data-id="${pedido.id}" 
                 data-route='{"start": ${pedido.coordenadas_partida || '"-12.9714,-38.5014"'}, "end": ${pedido.coordenadas_chegada || '"-12.9833,-38.5167"'}}'
                 data-info='${JSON.stringify(pedido)}'>
                <h3>Pedido #${pedido.id}</h3>
                <div class="pedido-content">
                    <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
                    <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                    <p><strong>Local Partida:</strong> ${pedido.local_partida}</p>
                    <p><strong>Local Chegada:</strong> ${pedido.local_chegada}</p>
                    <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                    <p><strong>Data:</strong> ${pedido.data_hora}</p>
                    <p><strong>Valor a receber:</strong> R$ ${pedido.valor_entregador}</p>
                    <p><strong>Status:</strong> ${pedido.status}</p>
                </div>
                <div class="product-buttons">
                    <button class="btn-entregue" onclick="marcarComoEntregue(${pedido.id})">
                        Marcar como Entregue
                    </button>
                    <button class="btn-rota show-route">
                        Mostrar Rota
                    </button>
                </div>
                <span class="info" onclick="mostrarDetalhes(${pedido.id})">&#8505;</span>
            </div>
        `;
        container.innerHTML += card;
    });

    // Adiciona eventos aos botões de rota após renderizar
    adicionarEventosBotoesRota();
    
    // Atualiza a paginação
    atualizarPaginacao(paginationInfo);
}

function carregarPedidos(page = 1) {
    fetch(`buscar_pedidos_aceitos.php?page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderizarPedidos(data.pedidos, data.pagination);
            } else {
                console.error('Erro ao carregar pedidos:', data.message);
            }
        })
        .catch(error => console.error('Erro:', error));
}

// Função para mostrar detalhes do pedido no modal
function mostrarDetalhes(pedidoId) {
    const pedidoElement = document.querySelector(`.product[data-id="${pedidoId}"]`);
    const pedido = JSON.parse(pedidoElement.getAttribute('data-info'));
    
    const modalInfo = document.getElementById('modal-info');
    modalInfo.innerHTML = `
        <p><strong>Número do Pedido:</strong> #${pedido.id}</p>
        <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
        <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
        <p><strong>Local de Partida:</strong> ${pedido.local_partida}</p>
        <p><strong>Local de Chegada:</strong> ${pedido.local_chegada}</p>
        <p><strong>Data/Hora:</strong> ${pedido.data_hora}</p>
        <p><strong>Entregador:</strong> ${pedido.nome_entregador || 'Não atribuído'}</p>
        <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
        <p><strong>Valor a Receber:</strong> R$ ${pedido.valor_entregador}</p>
        <p><strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}</p>
        <p><strong>Status:</strong> ${pedido.status}</p>
    `;
}

// Função para adicionar eventos aos botões de rota
function adicionarEventosBotoesRota() {
    document.querySelectorAll('.show-route').forEach(button => {
        button.addEventListener('click', function() {
            const productDiv = this.closest('.product');
            const routeData = JSON.parse(productDiv.getAttribute('data-route'));
            mostrarRota(routeData.start, routeData.end);
        });
    });
}

// Função para renderizar pedidos atualizada
function renderizarPedidos(pedidos, paginationInfo) {
    const container = document.querySelector('.products-grid');
    container.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = '<div class="no-pedidos">Nenhum pedido aceito no momento</div>';
        return;
    }

    pedidos.forEach(pedido => {
        // Formatando as coordenadas corretamente para JSON
        const coordenadasPartida = pedido.coordenadas_partida || '-12.9714,-38.5014';
        const coordenadasChegada = pedido.coordenadas_chegada || '-12.9833,-38.5167';
        
        const routeData = {
            start: coordenadasPartida,
            end: coordenadasChegada
        };

        const card = `
            <div class="product" data-id="${pedido.id}" 
                 data-route='${JSON.stringify(routeData)}'
                 data-info='${JSON.stringify(pedido)}'>
                <h3>Pedido #${pedido.id}</h3>
                <div class="pedido-content">
                    <p><strong>Empresa:</strong> ${pedido.empresa_coleta}</p>
                    <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
                    <p><strong>Local Partida:</strong> ${pedido.local_partida}</p>
                    <p><strong>Local Chegada:</strong> ${pedido.local_chegada}</p>
                    <p><strong>Quantidade:</strong> ${pedido.quantidade_lixo}kg</p>
                    <p><strong>Data:</strong> ${pedido.data_hora}</p>
                    <p><strong>Valor a receber:</strong> R$ ${pedido.valor_entregador}</p>
                    <p><strong>Status:</strong> ${pedido.status}</p>
                </div>
                <div class="product-buttons">
                    <button class="btn-entregue" onclick="marcarComoEntregue(${pedido.id})">
                        Marcar como Entregue
                    </button>
                    <button class="btn-rota show-route">
                        Mostrar Rota
                    </button>
                </div>
                <span class="info" onclick="mostrarDetalhes(${pedido.id})">&#8505;</span>
            </div>
        `;
        container.innerHTML += card;
    });

    // Adiciona eventos aos botões de rota após renderizar
    adicionarEventosBotoesRota();
    
    // Atualiza a paginação
    atualizarPaginacao(paginationInfo);
}

// Função para mostrar rota no mapa
function mostrarRota(start, end) {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    
    directionsRenderer.setMap(map);
    
    const [startLat, startLng] = start.split(',');
    const [endLat, endLng] = end.split(',');

    const request = {
        origin: new google.maps.LatLng(parseFloat(startLat), parseFloat(startLng)),
        destination: new google.maps.LatLng(parseFloat(endLat), parseFloat(endLng)),
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            
            // Mostrar detalhes da rota
            const route = result.routes[0];
            const routeDetails = document.getElementById('route-details');
            routeDetails.style.display = 'block';
            routeDetails.innerHTML = `
                <h3>Detalhes da Rota</h3>
                <p><strong>Origem:</strong> ${route.legs[0].start_address}</p>
                <p><strong>Destino:</strong> ${route.legs[0].end_address}</p>
                <p><strong>Distância:</strong> ${route.legs[0].distance.text}</p>
                <p><strong>Tempo estimado:</strong> ${route.legs[0].duration.text}</p>
            `;
        }
    });
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









