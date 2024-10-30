document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os dados do formulário e cria um objeto
    const formElements = event.target.elements;
    const dadosFormulario = {
        nome: formElements["nome"].value,
        cpf: formElements["cpf"].value,
        dataNascimento: formElements["dataNascimento"].value,
        telefone: formElements["telefone"].value,
        endereco: formElements["endereco"].value,
        email: formElements["email"].value,
        senha: formElements["senha"].value,
        confirmarSenha: formElements["confirmarSenha"].value,
        tipoConta: formElements["tipoConta"].value,
        cnpj: formElements["cnpj"] ? formElements["cnpj"].value : null // Adiciona o CNPJ se estiver presente
    };

    // Validações adicionais
    const tipoConta = dadosFormulario.tipoConta;
    const cpf = dadosFormulario.cpf;
    const cnpj = dadosFormulario.cnpj;
    const telefone = dadosFormulario.telefone;
    const senha = dadosFormulario.senha;

    // Validação condicional de CPF/CNPJ
    if (tipoConta === "cliente" || tipoConta === "Entregadores") {
        if (cpf.length !== 11) {
            alert("O CPF deve ter exatamente 11 dígitos.");
            return; // Interrompe o envio se a validação falhar
        }
    } else if (["empresa de coleta", "Transportadora", "estabelecimentos", "condominios"].includes(tipoConta)) {
        if (cnpj.length !== 14) {
            alert("O CNPJ deve ter exatamente 14 dígitos.");
            return; // Interrompe o envio se a validação falhar
        }
    }

    // Validação do telefone e da senha
    if (telefone.length !== 11) {
        alert("O telefone deve ter exatamente 11 dígitos (incluindo o DDD).");
        return;
    }

    if (senha.length < 8) {
        alert("A senha deve ter pelo menos 8 caracteres.");
        return;
    }

    // Adicionando log para verificar os dados que estão sendo enviados
    console.log("Dados do formulário:", dadosFormulario);

    fetch('http://localhost/LightApple/salvar_dados.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Define o cabeçalho como JSON
        },
        body: JSON.stringify(dadosFormulario) // Converte o objeto para JSON
    })
    .then(response => response.json())
    .then(jsonResponse => {
        console.log(jsonResponse); // Veja a resposta do servidor
        if (jsonResponse.success) {
            const tipoConta = jsonResponse.tipoConta;
            let paginaInicial = "";

            // Verifica o tipo de conta e define a página inicial correspondente
            if (tipoConta === "empresa de coleta") {
                paginaInicial = "TelaInicialColeta.php";
            } else if (["Transportadora", "Entregadores"].includes(tipoConta)) {
                paginaInicial = "TelaInicialEntrega.php";
            } else if (["cliente", "estabelecimentos", "condominios"].includes(tipoConta)) {
                paginaInicial = "TelaInicialCliente.php"; 
            }

            // Redireciona para a página inicial
            window.location.href = paginaInicial;
        } else {
            alert(jsonResponse.error || "Erro ao criar conta. Por favor, tente novamente.");
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao criar conta. Por favor, tente novamente.");
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const tipoContaSelect = document.getElementById('tipoConta');
    const cnpjInput = document.getElementById('cnpj');
    const labelCnpj = document.getElementById('label-cnpj');
    const cpfInput = document.getElementById('cpf'); 
    const labelCpf = document.querySelector('.txtcpf'); // Seleciona o label do CPF pela classe
    const dataNascimentoInput = document.getElementById('dataNascimento');
    const labelDataNascimento = document.querySelector('.txtdatanasc'); // Seleciona o label da data de nascimento pela classe

    tipoContaSelect.addEventListener('change', function () {
        if (["empresa de coleta", "Transportadora", "estabelecimentos", "condominios"].includes(tipoContaSelect.value)) {
            // Exibe o campo de CNPJ e esconde o de CPF e data de nascimento
            cnpjInput.style.display = 'block';
            labelCnpj.style.display = 'block';
            cpfInput.style.display = 'none';
            cpfInput.value = ''; 
            labelCpf.style.display = 'none';
            dataNascimentoInput.style.display = 'none';
            dataNascimentoInput.disabled = true;
            labelDataNascimento.style.display = 'none'; // Oculta o label de Data de Nascimento
        } else {
            // Exibe o campo de CPF e data de nascimento, e esconde o de CNPJ
            cnpjInput.style.display = 'none';
            labelCnpj.style.display = 'none';
            cpfInput.style.display = 'block';
            labelCpf.style.display = 'block';
            dataNascimentoInput.style.display = 'block';
            dataNascimentoInput.disabled = false;
            labelDataNascimento.style.display = 'block'; // Mostra o label de Data de Nascimento
        }
    });
});
