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

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalInfo = document.getElementById('modal-info');
    const closeModalBtn = document.querySelector('.close-btn');
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);

    // Função para abrir o modal e mostrar as informações do produto, incluindo endereços
    function openModal(info, startAddress, endAddress) {
        const modalInfo = document.getElementById('modal-info');
        modalInfo.innerHTML = `
        <p><strong>ID do Pedido:</strong> ${info.id}</p>
        <p><strong>Produto:</strong> ${info.produto}</p>
        <p><strong>Quantidade:</strong> ${info.quantidade}</p>
        <p><strong>Data:</strong> ${info.data}</p>
        <p><strong>Status:</strong> ${info.status}</p>
        <p><strong>Local de Partida:</strong> ${startAddress}</p> <!-- Endereço real de partida -->
        <p><strong>Local de Chegada:</strong> ${endAddress}</p> <!-- Endereço real de chegada -->
    `;
        document.body.classList.add('modal-active'); // Exibe o modal
    }

    // Função para fechar o modal
    function closeModal() {
        document.body.classList.remove('modal-active'); // Remove a classe para esconder o modal e remover o desfoque
    }

    // Adicionar evento de clique nos ícones de informação
    document.querySelectorAll('.info').forEach(infoIcon => {
        infoIcon.addEventListener('click', (e) => {
            const product = e.target.closest('.product'); // Encontra o produto pai do ícone clicado
            const info = JSON.parse(product.getAttribute('data-info')); // Converte o data-info JSON em objeto
            openModal(info); // Exibir o modal com as informações do produto correspondente
        });
    });

    // Fechar o modal ao clicar no botão de fechar
    closeModalBtn.addEventListener('click', closeModal);

    // Fechar o modal ao clicar fora dele (overlay)
    overlay.addEventListener('click', closeModal);
});



let map;
let directionsService;
let directionsRenderer;

function initMap() {
    // Inicializa o mapa centrado em Salvador, Bahia
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -12.9714, lng: -38.5014 },
        zoom: 13,
    });

    // Inicializa DirectionsService e DirectionsRenderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Adiciona listeners para todos os botões "Mostrar Percurso"
    const routeButtons = document.querySelectorAll(".show-route");
    routeButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const product = event.target.closest('.product'); // Obtém o produto pai
            const info = JSON.parse(product.getAttribute('data-info')); // Informações do produto
            calculateAndDisplayRoute(info); // Passa as informações do produto para a função de cálculo
        });
    });
}

function calculateAndDisplayRoute(info) {
    const start = { lat: -12.9714, lng: -38.5014 }; // Ponto de partida (exemplo)
    const end = { lat: -12.9833, lng: -38.5167 };   // Destino (exemplo)

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    // Solicitar a rota ao Google Directions API
    directionsService.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            // Exibir a rota no mapa
            directionsRenderer.setDirections(response);

            // Extraia os detalhes da rota (distância, duração, endereços de partida e chegada)
            const route = response.routes[0].legs[0];
            const startAddress = route.start_address; // Endereço real de partida
            const endAddress = route.end_address;     // Endereço real de chegada
            const distance = route.distance.text;     // Distância
            const duration = route.duration.text;     // Duração

            // Atualizar o painel de detalhes da rota
            const routeDetails = document.getElementById("route-details");
            routeDetails.innerHTML = `
                <h4>Detalhes da Rota:</h4>
                <p><strong>Endereço de Partida:</strong> ${startAddress}</p> <!-- Endereço real de partida -->
                <p><strong>Endereço de Chegada:</strong> ${endAddress}</p> <!-- Endereço real de chegada -->
                <p><strong>Distância:</strong> ${distance}</p>
                <p><strong>Duração estimada:</strong> ${duration}</p>
            `;
            routeDetails.style.display = "block"; // Exibe o painel

            // Exibir os endereços no modal, junto com as outras informações do produto
            openModal(info, startAddress, endAddress); // Passa os endereços reais para o modal

        } else {
            console.error("Falha ao carregar o percurso: " + status);
            alert("Não foi possível calcular o percurso. Verifique se a API Directions está habilitada e a chave está correta.");
        }
    });
}


// Carregar o mapa quando a página carregar
window.onload = initMap;





