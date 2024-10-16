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
    const cuponLinks = document.querySelectorAll('.cupon-link'); // Alterado para .cupon-link
    const vencimentoDateInput = document.querySelector('#vencimentoDate'); // Alterado para #vencimentoDate

    let selectedCupon = 'Todos'; // Status inicial como 'Todos'
    let selectedVencimentoDate = null;

    // Função para converter a data no formato YYYY-MM-DD
    const parseDate = (dateString) => {
        return new Date(dateString);
    };

    // Função para atualizar a exibição dos produtos com base nos filtros
    const filterProducts = () => {
        products.forEach(product => {
            const productCupon = product.getAttribute('data-cupon').trim().toUpperCase(); // Obtém cupon do data-attribute
            const productVencimentoDate = parseDate(product.getAttribute('data-vencimento').trim()); // Obtém data do data-attribute

            const cuponMatch = selectedCupon === 'Todos' || productCupon === selectedCupon.toUpperCase();

            // Verifica se a data de vencimento corresponde à data selecionada
            const dateMatch = !selectedVencimentoDate || productVencimentoDate.toDateString() === selectedVencimentoDate.toDateString();

            // Exibe o produto apenas se ambos os filtros corresponderem
            if (cuponMatch && dateMatch) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    };

    // Filtro por tipo de cupom
    cuponLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectedCupon = e.target.textContent.trim(); // Atualiza o tipo de cupom selecionado
            filterProducts(); // Aplica os filtros
        });
    });

    // Filtro por data de vencimento
    vencimentoDateInput.addEventListener('change', (e) => {
        selectedVencimentoDate = parseDate(e.target.value); // Atualiza a data de vencimento selecionada
        filterProducts(); // Aplica os filtros
    });

    // Inicializa com os filtros aplicados
    filterProducts();
});





  
  