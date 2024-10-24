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


  
  