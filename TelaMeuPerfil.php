<?php
session_start();

// Conexão com o banco de dados
$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se o usuário está logado
    if (!isset($_SESSION['user_id'])) {
        header("Location: entar.php");
        exit();
    }

    // Recupera os dados do usuário
    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        header("Location: error.php");
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
                    <li><a href="#" class="empresa-coleta">Estabelecimentos</a></li>
                    <li><a href="#" class="trocar-pontos">Pedidos</a></li>
                    <li><a href="#" class="pedidos">Histórico</a></li>
                </ul>
                <input type="search" name="pesquisar" id="pesquisar" placeholder="Pesquisar...">
                <div class="pedido-menu">
                    <img src="imagens/Clipboard.png" class="ped-pic" onclick="toggleMenuPed()">
                    <div class="sub-menu-ped-wrap" id="criarPed">
                        <div class="sub-menu-ped">
                            <div class="ped-info">
                                <img src="imagens/LightApple-Logo.png">
                                <h3>Pedidos</h3>
                            </div>
                            <div class="lista-pedidos" id="dropdown-pedidos-list">
                                <!-- Pedidos do dropdown serão gerados aqui -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="user-menu">
                    <img src="imagens/Avatar.png" class="user-pic" onclick="toggleMenu()">
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <img src="imagens/Avatar.png">
                                <h3><?php echo htmlspecialchars($usuario['nome']); ?></h3> <!-- Exibindo o nome do usuário -->
                            </div>
                            <a href="#" class="sub-menu-link">
                                <p>Meu Perfil</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Estatísticas</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="logout.php" class="sub-menu-link"> <!-- Assumindo que você tem um script de logout -->
                                <p>Sair</p>
                                <span></span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>

    <main>
        <!-- Section for profile photo and user information -->
        <section class="section-profile">
            <div class="profile-left">
                <img src="imagens/Avatar.png" alt="Foto de Perfil" class="profile-pic">
                <div class="profile-info">
                    <h2><?php echo htmlspecialchars($usuario['nome']); ?></h2>
                    <p>Membro desde: Janeiro de 2023</p>
                    <p>Informações Pessoais</p>
                </div>
            </div>
            <div class="profile-right">
                <button type="button" id="editar-perfil-btn">Editar Perfil</button>
            </div>
        </section>

        <section class="section-personal-info">
            <h3>Informações Pessoais</h3>
            <form id="profile-info-form">
                <input type="hidden" id="user-id" value="<?php echo htmlspecialchars($userId); ?>">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($usuario['nome']); ?>" readonly>

                <label for="cpf">CPF:</label>
                <input type="text" id="cpf" name="cpf" value="<?php echo htmlspecialchars($usuario['cpf']); ?>" readonly>

                <label for="dataNascimento">Data de Nascimento:</label>
                <input type="date" id="dataNascimento" name="dataNascimento" value="<?php echo htmlspecialchars($usuario['dataNascimento']); ?>" readonly>

                <label for="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" value="<?php echo htmlspecialchars($usuario['telefone']); ?>" readonly>

                <label for="endereco">Endereço:</label>
                <input type="text" id="endereco" name="endereco" value="<?php echo htmlspecialchars($usuario['endereco']); ?>" readonly>

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($usuario['email']); ?>" readonly>

                <label for="senha">Senha:</label>
                <div class="senha-section">
                    <input type="password" id="senha" name="senha" placeholder="*****" readonly> <!-- Não exibir a senha -->
                    <button type="button" class="trocar-senha-btn">Trocar Senha</button>
                </div>

                <label for="tipoConta">Tipo de Conta:</label>
                <select id="tipoConta" name="tipoConta" disabled>
                    <option value="cliente" <?php if ($usuario['tipoConta'] == 'cliente') echo 'selected'; ?>>Cliente</option>
                    <option value="condominio" <?php if ($usuario['tipoConta'] == 'condominio') echo 'selected'; ?>>Condomínio</option>
                    <option value="estabelecimento" <?php if ($usuario['tipoConta'] == 'estabelecimento') echo 'selected'; ?>>Estabelecimento</option>
                    <option value="empresa-coleta" <?php if ($usuario['tipoConta'] == 'empresa-coleta') echo 'selected'; ?>>Empresa de Coleta</option>
                    <option value="transportadora" <?php if ($usuario['tipoConta'] == 'transportadora') echo 'selected'; ?>>Transportadora</option>
                    <option value="motoboy" <?php if ($usuario['tipoConta'] == 'motoboy') echo 'selected'; ?>>Motoboy</option>
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