<?php
session_start();
// Conectar ao banco de dados
// Verificar credenciais do usuário
if ($credenciais_validas) {
    $_SESSION['user_id'] = $user_id; // Armazenar user_id na sessão
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightApple</title>
    <link rel="stylesheet" href="entrar.css">
</head>

<body>
    <header>
        <nav class="navbar">
            <a href="Home.html"><img class="light-apple-logo" src="imagens/LightApple-Logo.png" /></a>
            <div class="lightapple-titulo">LightApple</div>
            <div class="navigation">
                <div class="nao-possui-conta">Não possui conta?</div>
                <div class="criarconta"><a href="Criarconta.php">Criar Conta</a></div>
            </div>
        </nav>
    </header>
    <main>
        <section class="section-entrar">
            <div class="box-entar">
                <div class="tt">Entrar</div>
                <div class="desc">Insira suas credenciais para fazer login</div>
            </div>
            <img class="coleta-reciclavel-organico" src="imagens/coleta-reciclavel-organico.png" />
            <div class="form-container">
                <form action="login.php" method="post" id="loginForm">
                    <label for="email" class="txtemail">Email</label>
                    <input type="email" id="email" name="email" required>

                    <label for="senha" class="txtsenha">Senha</label>
                    <input type="password" id="senha" name="senha" required>

                    <div class="box-btn">
                        <button type="button" class="btn-esqueceu" onclick="window.location.href='recuperar_senha.php'">Esqueceu a senha?</button>
                        <button type="submit" class="btn-entrar">Entrar</button>
                    </div>
                </form>
                <div id="error" style="color: red; margin-top: 10px;"></div>
            </div>
        </section>
      
    </main>

    <script src="entar.js"></script>
</body>

</html>