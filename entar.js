document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Pega os valores dos campos de e-mail e senha
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Faz a requisição para o PHP
        const response = await fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`,
        });
        
        // Lê a resposta JSON
        const data = await response.json();

        // Armazena o ID do usuário na sessionStorage
        if (data.user_id) {
            sessionStorage.setItem('user_id', data.user_id);
        }

        // Verifica o tipo de conta e redireciona
        if (data.tipo_conta) {
            switch (data.tipo_conta) {
                case 'cliente':
                case 'condominio':
                case 'estabelecimento':
                    window.location.href = "TelaInicialCliente.php";
                    break;
                case 'coleta':
                    window.location.href = "TelaInicialColeta.php";
                    break;
                case 'transportadora':
                case 'entregador':
                    window.location.href = "TelaInicialEntregador.php";
                    break;
                default:
                    document.getElementById('error').textContent = "Tipo de conta inválido.";
            }
        } else if (data.error) {
            // Mostra mensagem de erro caso e-mail ou senha estejam incorretos
            document.getElementById('error').textContent = data.error;
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('error').textContent = "Ocorreu um erro. Tente novamente.";
    }
});
