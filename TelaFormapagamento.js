document.getElementById('adicionar-pagamento-btn').addEventListener('click', function() {
  // Captura os valores dos inputs
  const nomeCartao = document.getElementById('nome-cartao').value;
  const numeroCartao = document.getElementById('numero-cartao').value.slice(-4); // Últimos 4 dígitos do cartão
  const validadeCartao = document.getElementById('validade-cartao').value;

  // Cria um novo elemento <li> para o cartão adicionado
  const novoCartao = document.createElement('li');
  novoCartao.classList.add('forma-pagamento-adicionada');
  
  // Cria o conteúdo do cartão, incluindo o botão de excluir
  novoCartao.innerHTML = `
      <p><strong>Nome no Cartão:</strong> ${nomeCartao}</p>
      <p><strong>Número do Cartão:</strong> **** **** **** ${numeroCartao}</p>
      <p><strong>Validade:</strong> ${validadeCartao}</p>
      <button class="excluir-btn">Excluir</button>
  `;

  // Adiciona o novo cartão à lista de formas de pagamento
  document.getElementById('formas-pagamento-lista').appendChild(novoCartao);

  // Limpa os campos do formulário após a adição
  document.getElementById('adicionar-pagamento-form').reset();

  // Função para remover o cartão da lista ao clicar no botão "Excluir"
  novoCartao.querySelector('.excluir-btn').addEventListener('click', function() {
      novoCartao.remove(); // Remove o item <li> correspondente
  });
});


document.getElementById('validade-cartao').addEventListener('input', function (e) {
  let input = e.target.value;

  // Remover qualquer caractere que não seja número
  input = input.replace(/\D/g, '');

  // Inserir a barra após o segundo caractere (MM/AA)
  if (input.length >= 3) {
      input = input.slice(0, 2) + '/' + input.slice(2, 4);
  }

  e.target.value = input;
});
