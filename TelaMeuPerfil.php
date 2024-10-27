<?php
session_start(); // Inicia a sessão

// Conexão com o banco de dados
$host = 'localhost'; // Altere para o seu host
$dbname = 'light_apple'; // Altere para o nome do seu banco de dados
$username = 'root'; // Altere para o seu usuário do banco
$password = ''; // Altere para a sua senha do banco

try {
    // Estabelecendo a conexão
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se o usuário está logado
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php"); // Redireciona para a página de login se não estiver logado
        exit();
    }

    // Recupera os dados do usuário
    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        // Se o usuário não for encontrado, redireciona ou mostra uma mensagem
        header("Location: error.php"); // Redireciona para uma página de erro
        exit();
    }
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightApple - Meu Perfil</title>
    <link rel="stylesheet" href="TelaMeuPerfil.css">
    <link rel="stylesheet" href="navmenu(cliente).css">
    <link rel="stylesheet" href="footer.css">
</head>

<body>
    <header>
        <div class="hero">
            <nav>
                <a href="#"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
                <a href="#">
                    <h2 class="lightapple-titulo">LightApple</h2>
                </a>
                <ul>
                    <li><a href="#" class="inicio">Inicio</a></li>
                    <li><a href="#" class="empresa-coleta">Empresa de Coleta</a></li>
                    <li><a href="#" class="trocar-pontos">Trocar Pontos</a></li>
                    <li><a href="#" class="pedidos">Pedidos</a></li>
                </ul>
                <div class="user-menu">
                    <img src="imagens/Avatar.png" class="user-pic" onclick="toggleMenu()">
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <img src="imagens/Avatar.png">
                                <h3><?php echo htmlspecialchars($usuario['nome']); ?></h3> <!-- Exibe o nome do usuário -->
                            </div>
                            <p id="points">Meus Pontos: 50000 P</p>
                            <hr>
                            <a href="meu_perfil.php" class="sub-menu-link">
                                <p>Meu Perfil</p>
                            </a>
                            <hr>
                            <a href="sair.php" class="sub-menu-link">
                                <p>Sair</p>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>

    <main>
        <section class="section-profile">
            <div class="profile-left">
                <img src="imagens/Avatar.png" alt="Foto de Perfil" class="profile-pic">
                <div class="profile-info">
                    <h2><?php echo htmlspecialchars($usuario['nome']); ?></h2>
                    <p>Membro desde: <?php echo date("F Y", strtotime($usuario['data_nascimento'])); ?></p>
                </div>
            </div>
            <div class="profile-right">
                <button type="button" id="editar-perfil-btn">Editar Perfil</button>
            </div>
        </section>

        <section class="section-personal-info">
            <h3>Informações Pessoais</h3>
            <form id="profile-info-form">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($usuario['nome']); ?>" readonly>

                <label for="cpf">CPF:</label>
                <input type="text" id="cpf" name="cpf" value="<?php echo htmlspecialchars($usuario['cpf']); ?>" readonly>

                <label for="data-nascimento">Data de Nascimento:</label>
                <input type="date" id="data-nascimento" name="data-nascimento"
                    value="<?php echo htmlspecialchars($usuario['data_nascimento']); ?>" readonly>

                <label for="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" value="<?php echo htmlspecialchars($usuario['telefone']); ?>" readonly>

                <label for="endereco">Endereço:</label>
                <input type="text" id="endereco" name="endereco" value="<?php echo htmlspecialchars($usuario['endereco']); ?>" readonly>

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($usuario['email']); ?>" readonly>

                <label for="senha">Senha:</label>
                <div class="senha-section">
                    <input type="password" id="senha" name="senha" value="<?php echo htmlspecialchars($usuario['senha']); ?>" readonly>
                    <button type="button" class="trocar-senha-btn">Trocar Senha</button>
                </div>

                <label for="tipo-conta">Tipo de Conta:</label>
                <select id="tipo-conta" name="tipo-conta" disabled>
                    <option value="cliente" <?php if ($usuario['tipo_conta'] == 'cliente') echo 'selected'; ?>>Cliente</option>
                    <option value="condominio" <?php if ($usuario['tipo_conta'] == 'condominio') echo 'selected'; ?>>Condomínio</option>
                    <option value="estabelecimento" <?php if ($usuario['tipo_conta'] == 'estabelecimento') echo 'selected'; ?>>Estabelecimento</option>
                    <option value="empresa-coleta" <?php if ($usuario['tipo_conta'] == 'empresa-coleta') echo 'selected'; ?>>Empresa de Coleta</option>
                    <option value="transportadora" <?php if ($usuario['tipo_conta'] == 'transportadora') echo 'selected'; ?>>Transportadora</option>
                    <option value="motoboy" <?php if ($usuario['tipo_conta'] == 'motoboy') echo 'selected'; ?>>Motoboy</option>
                </select>
            </form>
        </section>

        <!-- Overlay para o card de troca de senha -->
        <div class="overlay" style="display: none;">
            <div class="senha-card">
                <label for="nova-senha">Nova Senha</label>
                <input type="password" id="nova-senha" class="input-padrao">
                <label for="confirmar-senha">Confirmar Nova Senha</label>
                <input type="password" id="confirmar-senha" class="input-padrao">
                <div class="button-container">
                    <button class="salvar-senha-btn">Salvar Senha</button>
                    <button class="cancelar-senha-btn">Cancelar</button>
                </div>
            </div>
        </div>

    </main>

    <footer class="footer">
        <img class="light-apple-logo" src="imagens/LightApple-Logo.png" />
        <div class="copy-2024-light-apple">&copy; 2024 LightApple</div>
        <div class="box-social">
            <a href="#"><img class="twitter" src="imagens/Twitter.png" /></a>
            <a href="#"><img class="instagram" src="imagens/Instagram.png" /></a>
            <a href="#"><img class="facebook" src="imagens/Facebook.png" /></a>
            <a href="#"><img class="linkedin" src="imagens/Linkedin.png" /></a>
        </div>
    </footer>
    <script src="TelaMeuPerfil.js"></script>
    <script src="navmenu(cliente).js"></script>
</body>

</html>