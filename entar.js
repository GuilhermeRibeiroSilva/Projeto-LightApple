// entar.js
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
                'Content-Type': 'application/json', // Alterado para JSON
            },
            body: JSON.stringify({ // Convertendo para JSON
                email: email,
                senha: senha
            })
        });

        // Lê a resposta JSON
        const data = await response.json();

        // Limpa mensagens anteriores
        document.getElementById('error').textContent = '';
        
        if (data.success) {
            // Armazena o ID do usuário e tipo de conta na sessionStorage
            sessionStorage.setItem('user_id', data.user_id);
            sessionStorage.setItem('tipo_conta', data.tipo_conta);
            
            // Redireciona com base no tipo de conta
            switch (data.tipo_conta) {
                case 'cliente':
                case 'condominios':
                case 'estabelecimentos':
                    window.location.href = 'TelaInicialCliente.php';
                    break;
                case 'Transportadora':
                case 'Entregadores':
                    window.location.href = 'TelaInicialEntrega.php';
                    break;
                case 'empresa de coleta':
                    window.location.href = 'TelaInicialColeta.php';
                    break;
                default:
                    document.getElementById('error').textContent = "Tipo de conta inválido.";
            }
        } else {
            document.getElementById('error').textContent = data.error || "Ocorreu um erro inesperado.";
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('error').textContent = "Ocorreu um erro. Tente novamente.";
    }
});