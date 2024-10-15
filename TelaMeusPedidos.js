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
    const products = document.querySelectorAll('.product');
    const statusLinks = document.querySelectorAll('.status-link');
    const orderDateInput = document.querySelector('#orderDate');

    let selectedStatus = 'Todos'; // Status inicial como 'Todos'
    let selectedOrderDate = null;

    // Função para converter a data no formato YYYY-MM-DD
    const parseDate = (dateString) => {
        return new Date(dateString);
    };

    // Função para atualizar a exibição dos produtos com base nos filtros
    const filterProducts = () => {
        products.forEach(product => {
            const productStatus = product.getAttribute('data-status').trim().toUpperCase(); // Obtém status do data-attribute
            const productDate = parseDate(product.getAttribute('data-data').trim()); // Obtém data do data-attribute

            const statusMatch = selectedStatus === 'Todos' || productStatus === selectedStatus.toUpperCase();

            // Verifica se a data do pedido corresponde à data selecionada
            const dateMatch = !selectedOrderDate || productDate.toDateString() === selectedOrderDate.toDateString();

            // Exibe o produto apenas se ambos os filtros corresponderem
            if (statusMatch && dateMatch) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    };

    // Filtro por status
    statusLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectedStatus = e.target.textContent.trim(); // Atualiza o status selecionado
            filterProducts(); // Aplica os filtros
        });
    });

    // Filtro por data
    orderDateInput.addEventListener('change', (e) => {
        selectedOrderDate = parseDate(e.target.value); // Atualiza a data selecionada
        filterProducts(); // Aplica os filtros
    });

    // Inicializa com os filtros aplicados
    filterProducts();
});


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalInfo = document.getElementById('modal-info');
    const closeModalBtn = document.querySelector('.close-btn');
    const main = document.querySelector('main');

    // Função para abrir o modal e mostrar as informações
    function openModal(info) {
        modal.classList.remove('hidden');
        modalInfo.textContent = info;
        main.classList.add('modal-open');
    }

    // Função para fechar o modal
    function closeModal() {
        modal.classList.add('hidden');
        main.classList.remove('modal-open');
    }

    // Adicionar evento de clique nos ícones de informação
    document.querySelectorAll('.info').forEach(infoIcon => {
        infoIcon.addEventListener('click', (e) => {
            const product = e.target.closest('.product');
            const info = product.getAttribute('data-info');
            openModal(info); // Exibir o modal com as informações
        });
    });

    // Fechar o modal ao clicar no botão de fechar
    closeModalBtn.addEventListener('click', closeModal);

    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

  
  