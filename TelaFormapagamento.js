document.getElementById('adicionar-pagamento-btn').addEventListener('click', function() {
    const nomeCartao = document.getElementById('nome-cartao').value;
    const numeroCartao = document.getElementById('numero-cartao').value;
    const validadeCartao = document.getElementById('validade-cartao').value;
  
    if (nomeCartao && numeroCartao && validadeCartao) {
      // Criar novo item de cartão salvo
      const li = document.createElement('li');
      li.innerHTML = `
        ${nomeCartao} - **** **** **** ${numeroCartao.slice(-4)}
        <button class="excluir-btn">Excluir</button>
      `;
  
      // Adicionar o cartão na lista de salvos
      document.getElementById('formas-pagamento-lista').appendChild(li);
  
      // Adicionar evento ao botão de excluir
      li.querySelector('.excluir-btn').addEventListener('click', function() {
        li.remove();
      });
  
      // Limpar o formulário
      document.getElementById('adicionar-pagamento-form').reset();
    }
  });
  