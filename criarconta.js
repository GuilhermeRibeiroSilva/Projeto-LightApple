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
    };

    // Validações adicionais
    const cpf = dadosFormulario.cpf;
    const telefone = dadosFormulario.telefone;
    const senha = dadosFormulario.senha;

    if (cpf.length !== 11) {
        alert("O CPF deve ter exatamente 11 dígitos.");
        return; // Interrompe o envio se a validação falhar
    }

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
            // Redireciona com base no tipo de conta
            const tipoConta = jsonResponse.tipoConta;
            let paginaInicial = "";

            // Verifica o tipo de conta e define a página inicial correspondente
            if (tipoConta === "empresa de coleta") {
                paginaInicial = "TelaInicialColeta.php";
            } else if (tipoConta === "Transportadora" || tipoConta === "Motoboys") {
                paginaInicial = "TelaInicialEntrega.php";
            } else if (tipoConta === "pessoal" || tipoConta === "condominios" || tipoConta === "estabelecimentos") {
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
