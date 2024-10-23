document.addEventListener("DOMContentLoaded", function () {
    const paginationButtons = document.querySelectorAll(".page-number");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");

    let currentPage = 1;

    function updatePagination() {
        paginationButtons.forEach(button => {
            const page = parseInt(button.textContent);
            button.classList.toggle("active", page === currentPage);
        });

        // Atualizar estado dos botões "Previous" e "Next"
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === paginationButtons.length;
    }

    paginationButtons.forEach(button => {
        button.addEventListener("click", function () {
            currentPage = parseInt(this.textContent);
            updatePagination();
        });
    });

    prevButton.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });

    nextButton.addEventListener("click", function () {
        if (currentPage < paginationButtons.length) {
            currentPage++;
            updatePagination();
        }
    });

    // Inicializa a página com a primeira ativa
    updatePagination();
});

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
                <p><strong>ID do Pedido:</strong> ${info.id}</p>
                <p><strong>Estabelecimento:</strong> ${info.estabelecimento}</p>
                <p><strong>Endereço de Partida:</strong> ${startAddress}</p>
                <p><strong>Endereço de Chegada:</strong> ${endAddress}</p>
                <p><strong>Quantidade:</strong> ${info.quantidade}</p>
                <p><strong>Data:</strong> ${info.data}</p>
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










