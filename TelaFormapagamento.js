// Alternar visibilidade dos formulários com base na seleção do tipo de pagamento
document.querySelectorAll('input[name="tipo-pagamento"]').forEach(radio => {
  radio.addEventListener('change', function() {
      const tipoPagamento = this.value;
      if (tipoPagamento === 'cartao') {
          document.getElementById('adicionar-cartao-form').style.display = 'block';
          document.getElementById('adicionar-conta-form').style.display = 'none';
      } else {
          document.getElementById('adicionar-cartao-form').style.display = 'none';
          document.getElementById('adicionar-conta-form').style.display = 'block';
      }
  });
});

// Lógica para adicionar a forma de pagamento à lista de formas salvas
document.getElementById('adicionar-pagamento-btn').addEventListener('click', function() {
  const tipoPagamento = document.querySelector('input[name="tipo-pagamento"]:checked').value;
  let novoItem = '';

  if (tipoPagamento === 'cartao') {
      // Captura os valores do formulário de cartão
      const nomeCartao = document.getElementById('nome-cartao').value;
      const numeroCartao = document.getElementById('numero-cartao').value.slice(-4); // Últimos 4 dígitos do cartão
      const validadeCartao = document.getElementById('validade-cartao').value;

      // Cria o novo item para o cartão
      novoItem = `
          <li class="forma-pagamento-adicionada">
              <p><strong>Nome no Cartão:</strong> ${nomeCartao}</p>
              <p><strong>Número do Cartão:</strong> **** **** **** ${numeroCartao}</p>
              <p><strong>Validade:</strong> ${validadeCartao}</p>
              <button class="excluir-btn">Excluir</button>
          </li>
      `;
  } else if (tipoPagamento === 'conta') {
      // Captura os valores do formulário de conta bancária
      const nomeTitular = document.getElementById('nome-titular').value;
      const banco = document.getElementById('banco').value;
      const agencia = document.getElementById('agencia').value;
      const conta = document.getElementById('conta').value;

      // Cria o novo item para a conta bancária
      novoItem = `
          <li class="forma-pagamento-adicionada">
              <p><strong>Nome do Titular:</strong> ${nomeTitular}</p>
              <p><strong>Banco:</strong> ${banco}</p>
              <p><strong>Agência:</strong> ${agencia}</p>
              <p><strong>Conta:</strong> ${conta}</p>
              <button class="excluir-btn">Excluir</button>
          </li>
      `;
  }

  // Adiciona o novo item à lista de formas de pagamento
  document.getElementById('formas-pagamento-lista').insertAdjacentHTML('beforeend', novoItem);

  // Adiciona evento para excluir a forma de pagamento
  document.querySelectorAll('.excluir-btn').forEach(button => {
      button.addEventListener('click', function() {
          this.parentElement.remove();
      });
  });

  // Limpa os campos do formulário após a adição
  document.getElementById('adicionar-cartao-form').reset();
  document.getElementById('adicionar-conta-form').reset();
});

// Formatação da validade do cartão
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
