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
    const main = document.querySelector('main');
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);

    // Função para abrir o modal e mostrar as informações
    function openModal(info) {
        modalInfo.innerHTML = `
            <p><strong>ID do Pedido:</strong> ${info.id}</p>
            <p><strong>Produto:</strong> ${info.produto}</p>
            <p><strong>Local de Partida:</strong> ${info.localPartida}</p>
            <p><strong>Quantidade:</strong> ${info.quantidade}</p>
            <p><strong>Data:</strong> ${info.data}</p>
            <p><strong>Status:</strong> ${info.status}</p>
        `;
        document.body.classList.add('modal-active'); // Adiciona a classe para exibir o modal e aplicar o desfoque
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
    // Inicializa o mapa com uma localização padrão
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
        zoom: 12,
    });

    // Inicializa o serviço de direções
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Tenta obter a localização atual do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Move o mapa para a localização do usuário
            map.setCenter(userLocation);

            // Adiciona um marcador para a localização do usuário
            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Você está aqui!",
            });
        }, () => {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // O navegador não suporta Geolocalização
        handleLocationError(false, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, pos) {
    const infoWindow = new google.maps.InfoWindow();
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Erro: O serviço de geolocalização falhou."
            : "Erro: Seu navegador não suporta geolocalização."
    );
    infoWindow.open(map);
}

function showRoute(product) {
    const route = JSON.parse(product.getAttribute('data-route'));
    
    if (route.length < 2) {
        console.error("Dados de rota insuficientes.");
        return;
    }

    const origin = { lat: route[0].lat, lng: route[0].lng };
    const destination = { lat: route[route.length - 1].lat, lng: route[route.length - 1].lng };

    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(result);
            map.setCenter(origin); // Centraliza o mapa na origem
            map.setZoom(14); // Ajusta o zoom
        } else {
            console.error("Erro ao calcular a rota: ", status);
        }
    });
}

// Adicionar eventos nos botões de "Mostrar Percurso"
document.querySelectorAll('.show-route').forEach(button => {
    button.addEventListener('click', (e) => {
        const product = e.target.closest('.product');
        showRoute(product);
    });
});



// Inicializa o mapa assim que o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initMap);

  