let saldoDisponivel = 1500.00; // Exemplo de saldo inicial

// Atualiza o saldo exibido na tela
function atualizarSaldo(valor) {
    saldoDisponivel -= valor;
    document.querySelector('#saldo-card p').textContent = `R$ ${saldoDisponivel.toFixed(2)}`;
}

// Atualiza a cor do saldo
function atualizarCorSaldo() {
    const saldoElement = document.querySelector('#saldo-card p');
    saldoElement.style.color = '#218838'; // Define a cor do saldo
}

// Lógica para adicionar a forma de pagamento à lista de formas salvas
document.getElementById('adicionar-pagamento-btn').addEventListener('click', function() {
    const nomeTitular = document.getElementById('nome-titular').value.trim();
    const banco = document.getElementById('banco').value.trim();
    const agencia = document.getElementById('agencia').value.trim();
    const conta = document.getElementById('conta').value.trim();

    // Validações: verificar se os campos estão vazios
    if (!nomeTitular || !banco || !agencia || !conta) {
        alert('Todos os campos devem ser preenchidos.');
        return;
    }

    // Validação do número da agência (exatamente 5 dígitos)
    if (!/^\d{5}$/.test(agencia)) {
        alert('Agência deve conter exatamente 5 dígitos.');
        return;
    }

    // Validação do número da conta (entre 6 e 10 dígitos)
    if (!/^\d{6,10}$/.test(conta)) {
        alert('Conta deve conter entre 6 e 10 dígitos.');
        return;
    }

    // Cria o novo item para a conta bancária
    const novoItem = `
        <li class="forma-pagamento-adicionada" data-tipo="conta" data-banco="${banco}" data-agencia="${agencia}" data-conta="${conta}">
            <p><strong>Nome do Titular:</strong> ${nomeTitular}</p>
            <p><strong>Banco:</strong> ${banco}</p>
            <p><strong>Agência:</strong> ${agencia}</p>
            <p><strong>Conta:</strong> ${conta}</p>
            <button class="excluir-btn">Excluir</button>
        </li>
    `;

    // Adiciona o novo item à lista de formas de pagamento
    document.getElementById('formas-pagamento-lista').insertAdjacentHTML('beforeend', novoItem);

    // Atualiza a lista de contas bancárias no formulário de saque
    atualizarListaContas();

    // Adiciona evento para excluir a forma de pagamento
    document.querySelectorAll('.excluir-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.remove();
            atualizarListaContas(); // Atualiza a lista de contas bancárias após remoção
        });
    });

    // Reseta o formulário
    document.getElementById('adicionar-conta-form').reset();
});

// Função para atualizar a lista de contas bancárias no formulário de saque
function atualizarListaContas() {
    const selectConta = document.getElementById('selecionar-conta');
    selectConta.innerHTML = ''; // Limpa as opções atuais

    // Encontra todas as formas de pagamento do tipo "conta" e adiciona ao select
    document.querySelectorAll('.forma-pagamento-adicionada[data-tipo="conta"]').forEach(conta => {
        const banco = conta.getAttribute('data-banco');
        const agencia = conta.getAttribute('data-agencia');
        const numeroConta = conta.getAttribute('data-conta');
        const optionText = `${banco} - Agência: ${agencia}, Conta: ${numeroConta}`;
        const optionElement = document.createElement('option');
        optionElement.value = numeroConta;
        optionElement.textContent = optionText;
        selectConta.appendChild(optionElement);
    });

    // Mostra ou esconde o campo de seleção de contas baseado no tipo de saque
    const tipoSaque = document.getElementById('tipo-saque').value;
    document.getElementById('conta-bancaria-opcao').style.display = (tipoSaque === 'conta-bancaria') ? 'block' : 'none';
}

// Alternar visibilidade do campo de seleção de conta no saque
document.getElementById('tipo-saque').addEventListener('change', function() {
    const tipoSaque = this.value;
    document.getElementById('conta-bancaria-opcao').style.display = (tipoSaque === 'conta-bancaria') ? 'block' : 'none';
});

// Lógica para realizar saque
document.getElementById('confirmar-saque-btn').addEventListener('click', function() {
    const tipoSaque = document.getElementById('tipo-saque').value;
    const valorSaque = parseFloat(document.getElementById('valor-saque').value);
    const cpf = document.getElementById('cpf').value;

    // Validações básicas
    if (isNaN(valorSaque) || valorSaque <= 0 || !cpf) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    if (valorSaque > saldoDisponivel) {
        alert('Saldo insuficiente.');
        return;
    }

    let saqueInfo = '';
    if (tipoSaque === 'pix') {
        saqueInfo = `
            <div class="saque-info">
                <p><strong>Tipo:</strong> PIX</p>
                <p><strong>Valor:</strong> R$ ${valorSaque.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="saque-status">Pendente</span></p>
            </div>
        `;
    } else if (tipoSaque === 'conta-bancária') {
        const contaSelecionada = document.getElementById('selecionar-conta').selectedOptions[0].textContent;
        saqueInfo = `
            <div class="saque-info">
                <p><strong>Tipo:</strong> Conta Bancária</p>
                <p><strong>Conta:</strong> ${contaSelecionada}</p>
                <p><strong>Valor:</strong> R$ ${valorSaque.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="saque-status">Pendente</span></p>
            </div>
        `;
    }

    // Adiciona a informação do saque ao card de informações de saques
    document.getElementById('info-saques-card').insertAdjacentHTML('beforeend', saqueInfo);

    // Atualiza o saldo após o saque
    atualizarSaldo(valorSaque);

    // Reseta o formulário de saque
    document.getElementById('valor-saque').value = '';
    document.getElementById('cpf').value = '';
});

// Atualiza a cor do saldo no início
atualizarCorSaldo();
