document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const searchOrderNumber = document.getElementById('searchOrderNumber');
    const statusLinks = document.querySelectorAll('.status-link');
    const orderDateInput = document.getElementById('orderDate');
    const modal = document.getElementById('modal');
    const modalInfo = document.getElementById('modal-info');
    const closeModalBtn = document.querySelector('.close-btn');
    const overlay = document.querySelector('.modal-overlay');
    const paginationDiv = document.querySelector('.pagination');

    let selectedStatus = 'todos';
    let selectedOrderDate = null;
    let searchQuery = '';
    let currentPage = 1;
    const itemsPerPage = 9;

    const fetchEntregasConcluidas = async () => {
        try {
            const response = await fetch('buscar_entregas_concluidas.php');
            const data = await response.json();
            return data.entregas || [];
        } catch (error) {
            console.error('Erro ao carregar entregas:', error);
            return [];
        }
    };

    const renderEntregas = (entregas) => {
        productsGrid.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedEntregas = entregas.slice(start, end);

        paginatedEntregas.forEach(entrega => {
            const card = document.createElement('div');
            card.className = 'product';
            card.setAttribute('data-status', entrega.status_confirmacao);
            card.setAttribute('data-data', entrega.data_entrega);
            card.setAttribute('data-id', entrega.pedido_id);

            card.innerHTML = `
                <h3>Pedido #${entrega.pedido_id}</h3>
                <p>Empresa: ${entrega.empresa_coleta}</p>
                <p>Local de Partida: ${entrega.local_partida}</p>
                <p>Local de Chegada: ${entrega.local_chegada}</p>
                <p>Quantidade: ${entrega.quantidade_lixo}kg</p>
                <p>Data: ${new Date(entrega.data_criacao).toLocaleString('pt-BR')}</p>
                <p>Status: ${entrega.status_confirmacao}</p>
                <span class="info" title="Ver detalhes">ℹ</span>
            `;

            card.querySelector('.info').addEventListener('click', () => openModal(entrega));
            productsGrid.appendChild(card);
        });

        updatePagination(entregas.length);
    };

    const updatePagination = (totalItems) => {
        paginationDiv.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = i === currentPage ? 'active' : '';
            pageButton.addEventListener('click', () => {
                currentPage = i;
                filterAndRenderEntregas();
            });
            paginationDiv.appendChild(pageButton);
        }
    };

    const filterAndRenderEntregas = async () => {
        const entregas = await fetchEntregasConcluidas();
        const filteredEntregas = entregas.filter(entrega => {
            const statusMatch = selectedStatus === 'todos' || entrega.status_confirmacao.toUpperCase() === selectedStatus.toUpperCase();
            const dateMatch = !selectedOrderDate || new Date(entrega.data_entrega).toDateString() === selectedOrderDate.toDateString();
            const searchMatch = !searchQuery || entrega.pedido_id.toString().includes(searchQuery);
            return statusMatch && dateMatch && searchMatch;
        });
        renderEntregas(filteredEntregas);
    };

    searchOrderNumber.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        filterAndRenderEntregas();
    });

    statusLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectedStatus = e.target.dataset.status;
            filterAndRenderEntregas();
        });
    });

    orderDateInput.addEventListener('change', (e) => {
        selectedOrderDate = new Date(e.target.value);
        filterAndRenderEntregas();
    });

    function openModal(entrega) {
        modalInfo.innerHTML = `
            <p><strong>ID do Pedido:</strong> ${entrega.pedido_id}</p>
            <p><strong>Data de Entrega:</strong> ${new Date(entrega.data_entrega).toLocaleString('pt-BR')}</p>
            <p><strong>Status de Confirmação:</strong> ${entrega.status_confirmacao}</p>
        `;
        document.body.classList.add('modal-active');
    }

    closeModalBtn.addEventListener('click', () => document.body.classList.remove('modal-active'));
    overlay.addEventListener('click', () => document.body.classList.remove('modal-active'));

    filterAndRenderEntregas();
});


  
  