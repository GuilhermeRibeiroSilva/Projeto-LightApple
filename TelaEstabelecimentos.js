document.addEventListener('DOMContentLoaded', function () {
    // Selecionar todos os botões de coração
    const favoriteButtons = document.querySelectorAll('.favoritar');
  
    favoriteButtons.forEach(button => {
      button.addEventListener('click', function () {
        // Alternar entre favoritado e não favoritado
        if (this.classList.contains('nao-favoritado')) {
          this.classList.remove('nao-favoritado');
          this.classList.add('favoritado');
        } else {
          this.classList.remove('favoritado');
          this.classList.add('nao-favoritado');
        }
      });
    });
  }); 
  
  document.addEventListener("DOMContentLoaded", () => {
    const rangeFiltro = document.querySelector("#priceRange"); // Input do tipo range
    const valorAtual = document.querySelector("#currentPrice"); // Exibir valor atual do range
    const empresas = document.querySelectorAll(".product"); // Seleciona todas as empresas de coleta
  
    // Função para filtrar empresas pelo limite de coleta
    function filtrarPorLimite() {
      const limiteSelecionado = parseFloat(rangeFiltro.value); // Pega o valor do range
  
      // Atualiza o valor exibido ao lado do filtro
      valorAtual.textContent = `${limiteSelecionado} kg`;
  
      // Filtra as empresas de acordo com o limite de coleta
      empresas.forEach((empresa) => {
        const limiteColeta = parseFloat(empresa.getAttribute("data-limitedecoleta")); // Pega o valor de data-limitedecoleta
  
        // Verifica se o limite de coleta da empresa é maior ou igual ao limite selecionado
        if (limiteColeta >= limiteSelecionado) {
          empresa.style.display = "block"; // Mostra a empresa
        } else {
          empresa.style.display = "none"; // Esconde a empresa
        }
      });
    }
  
    // Evento ao alterar o valor do range
    rangeFiltro.addEventListener("input", filtrarPorLimite);
  
    // Executa a função uma vez no início para aplicar o filtro padrão
    filtrarPorLimite();
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const rangeFiltroDistancia = document.querySelector("#distanciaRange"); // Input do tipo range para distância
    const valorAtualDistancia = document.querySelector("#currentDistancia"); // Exibir valor atual do range de distância
    const empresas = document.querySelectorAll(".product"); // Seleciona todas as empresas de coleta
  
    // Função para filtrar empresas pela distância máxima
    function filtrarPorDistancia() {
      const distanciaSelecionada = parseFloat(rangeFiltroDistancia.value); // Pega o valor do range
  
      // Atualiza o valor exibido ao lado do filtro de distância
      valorAtualDistancia.textContent = `${distanciaSelecionada} km`;
  
      // Filtra as empresas de acordo com a distância máxima
      empresas.forEach((empresa) => {
        const distanciaEmpresa = parseFloat(empresa.getAttribute("data-distancia")); // Pega o valor de data-distancia
  
        // Verifica se a distância da empresa é menor ou igual à distância selecionada
        if (distanciaEmpresa <= distanciaSelecionada) {
          empresa.style.display = "block"; // Mostra a empresa
        } else {
          empresa.style.display = "none"; // Esconde a empresa
        }
      });
    }
  
    // Evento ao alterar o valor do range de distância
    rangeFiltroDistancia.addEventListener("input", filtrarPorDistancia);
  
    // Executa a função uma vez no início para aplicar o filtro padrão
    filtrarPorDistancia();
  });
  
  
  document.addEventListener("DOMContentLoaded", () => {
    const rangeAvaliacao = document.getElementById("avaliacaoRange"); // Seleciona o input range
    const avaliacaoValor = document.getElementById("avaliacaoValor"); // Exibe o valor atual do input range
    const empresas = document.querySelectorAll(".product"); // Seleciona todas as empresas de coleta
  
    // Função para filtrar empresas pela avaliação mínima
    function filtrarPorAvaliacao() {
      const avaliacaoMinima = parseInt(rangeAvaliacao.value); // Pega o valor do range como avaliação mínima
  
      // Atualiza o valor visual de exibição
      avaliacaoValor.textContent = avaliacaoMinima;
  
      // Filtra as empresas de acordo com a avaliação mínima
      empresas.forEach((empresa) => {
        const avaliacaoEmpresa = parseInt(empresa.getAttribute("data-avaliacao")); // Pega a avaliação da empresa
  
        // Mostra ou esconde a empresa de acordo com a avaliação mínima
        if (avaliacaoEmpresa >= avaliacaoMinima) {
          empresa.style.display = "block"; // Mostra a empresa
        } else {
          empresa.style.display = "none"; // Esconde a empresa
        }
      });
    }
  
    // Adiciona evento para filtrar sempre que o valor do range mudar
    rangeAvaliacao.addEventListener("input", filtrarPorAvaliacao);
  
    // Executa a função uma vez no início para aplicar o filtro padrão
    filtrarPorAvaliacao();
  });
  
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
  
  
  
  
  