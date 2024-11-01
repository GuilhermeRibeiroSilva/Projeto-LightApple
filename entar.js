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
                'Content-Type': 'application/json', // Altera para application/json
            },
            body: JSON.stringify({ email, senha }), // Envia os dados como JSON
        });

        // Lê a resposta JSON
        const data = await response.json();

        // Armazena o ID do usuário na sessionStorage
        if (data.user_id) {
            sessionStorage.setItem('user_id', data.user_id);
        }

        // Verifica se há erro na resposta
        if (data.error) {
            // Mostra mensagem de erro caso e-mail ou senha estejam incorretos
            document.getElementById('error').textContent = data.error;
        } else {
            // Se não houver erro, redireciona para a página inicial
            window.location.href = "TelaInicial.php"; // Redirecionar para uma página comum após o login
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('error').textContent = "Ocorreu um erro. Tente novamente.";
    }
});
