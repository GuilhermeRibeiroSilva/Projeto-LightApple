<?php
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    header('Location: entar.php'); // Redireciona para login se não estiver autenticado
    exit;
}

$userId = $_SESSION['user_id']; // Recupera o ID do usuário da sessão

// Conexão com o banco de dados
$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Recupera os dados do usuário
    $stmt = $conn->prepare("SELECT *, DATE_FORMAT(dataCriacao, '%M de %Y') AS membro_desde FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verifica se o usuário existe
    if (!$usuario) {
        header("Location: error.php");
        exit();
    }

    // Obtém o caminho da imagem de perfil ou uma imagem padrão
    $profileImagePath = $usuario['profile_image_path'] ?? 'imagens/default_image.png'; // Caminho padrão se não houver imagem

    // Verifica se a coluna membro_desde foi realmente obtida
    $membro_desde = $usuario['membro_desde'] ?? 'Data de criação não disponível';
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightApple</title>
    <link rel="stylesheet" href="TelaMeuperfil(entrega).css">
    <link rel="stylesheet" href="navmenu(entrega).css">
    <link rel="stylesheet" href="footer.css">
</head>

<body>
<input type="hidden" id="user-id" value="<?php echo htmlspecialchars($userId); ?>">
    <header>
        <div class="hero">
            <nav>
                <a href="TelaInicialEntrega.php"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
                <a href="#">
                    <h2 class="lightapple-titulo">LightApple</h2>
                </a>
                <ul>
                    <li><a href="TelaInicialEntrega.php" class="inicio">Inicio</a></li>
                    <li><a href="TelaEstabelecimentos.php" class="empresa-coleta">Estabelecimentos</a></li>
                    <li><a href="#" class="trocar-pontos">Minhas Entregas</a></li>
                    <li><a href="#" class="pedidos">Histórico</a></li>
                </ul>
                <input type="search" name="pesquisar" id="pesquisar" placeholder="Pesquisar...">
                <!-- Drop-down de Pedidos Disponíveis -->
                <div class="pedidos-menu">
                    <img src="imagens/Clipboard.png" class="ped-pic" onclick="toggleMenuPed()">
                    <div class="sub-menu-ped-wrap" id="pedidosDisponiveis">
                        <div class="sub-menu-ped">
                            <div class="ped-info">
                                <img src="imagens/LightApple-Logo.png" alt="Ícone de pedidos">
                                <h3>Pedidos Disponíveis</h3>
                            </div>
                            <div class="pedidos-lista">
                                <!-- Pedidos serão carregados aqui via JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="user-menu">
                    <img src="<?php echo $profileImagePath; ?>" class="user-perf" id="userImageCircle" onclick="toggleMenu()">
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <img src="<?php echo $profileImagePath; ?>" class="user-image-circle" id="userImageDropdown">
                                <h3>Olá, <?php echo explode(' ', $usuario['nome'])[0]; ?></h3>
                            </div>
                            <a href="TelaMeuperfil(entrega).php" class="sub-menu-link">
                                <p>Meu Perfil</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="TelaFavoritos(entrega).php" class="sub-menu-link">
                                <p>Favoritos</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Receitas/Pagamentos</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Ajuda</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="logout.php" class="sub-menu-link">
                                <p>Sair</p>
                                <span></span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>
    <!-- Section for profile photo and user information -->
    <section class="section-profile">
            <div class="profile-container">
                <img src="<?php echo $profileImagePath; ?>" class="profile-pic" id="profilePic">
                <div class="profile-info">
                    <h2><?php echo htmlspecialchars($usuario['nome']); ?></h2>
                    <p>Membro desde: <?php echo htmlspecialchars($usuario['membro_desde']); ?></p>
                </div>
            </div>
            </div>
            <div class="profile-right">
                <button type="button" id="trocar-imagem-btn">Trocar Imagem</button>
                <button type="button" id="editar-perfil-btn">Editar Perfil</button>
                <button class="btn-cadastrar" style="display: none;">Cadastrar Local</button>
                <input type="file" id="inputFile" accept="image/*" style="display: none;">
            </div>
        </section>

        <section class="section-personal-info">
            <h3>Informações Pessoais</h3>
            <form id="profile-info-form">
                <input type="hidden" id="user-id" value="<?php echo htmlspecialchars($userId); ?>">

                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($usuario['nome']); ?>" readonly>

                <label for="tipoConta">Tipo de Conta:</label>
                <select id="tipoConta" name="tipoConta" disabled>
                    <option value="cliente" <?php if ($usuario['tipoConta'] == 'cliente') echo 'selected'; ?>>Cliente</option>
                    <option value="condominios" <?php if ($usuario['tipoConta'] == 'condominios') echo 'selected'; ?>>Condomínio</option>
                    <option value="estabelecimentos" <?php if ($usuario['tipoConta'] == 'estabelecimentos') echo 'selected'; ?>>Estabelecimento</option>
                    <option value="empresa de coleta" <?php if ($usuario['tipoConta'] == 'empresa de coleta') echo 'selected'; ?>>Empresa de Coleta</option>
                    <option value="Transportadora" <?php if ($usuario['tipoConta'] == 'Transportadora') echo 'selected'; ?>>Transportadora</option>
                    <option value="Entregadores" <?php if ($usuario['tipoConta'] == 'Entregadores') echo 'selected'; ?>>Entregador</option>
                </select>

                <?php if ($usuario['tipoConta'] == 'cliente'): ?>
                    <label for="cpf">CPF:</label>
                    <input type="text" id="cpf" name="cpf" value="<?php echo htmlspecialchars($usuario['cpf']); ?>" readonly>

                    <label for="dataNascimento">Data de Nascimento:</label>
                    <input type="date" id="dataNascimento" name="dataNascimento" value="<?php echo htmlspecialchars($usuario['dataNascimento']); ?>" readonly>
                <?php else: ?>
                    <label for="cnpj">CNPJ:</label>
                    <input type="text" id="cnpj" name="cnpj" value="<?php echo htmlspecialchars($usuario['cnpj']); ?>" readonly>
                <?php endif; ?>

                <label for="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" value="<?php echo htmlspecialchars($usuario['telefone']); ?>" readonly>

                <label for="endereco">Endereço:</label>
                <input type="text" id="endereco" name="endereco" value="<?php echo htmlspecialchars($usuario['endereco']); ?>" readonly>

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($usuario['email']); ?>" readonly>

                <label for="senha">Senha:</label>
                <div class="senha-section">
                    <input type="password" id="senha" name="senha" value="" placeholder="********" readonly>
                    <button type="button" class="trocar-senha-btn">Trocar Senha</button>
                </div>

            </form>
        </section>

        <!-- Overlay para o card de troca de senha -->
        <div class="overlay" id="senhaOverlay" style="display: none;">
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
        <div class="box-info">
            <div class="titulo-lightapple">
                <div class="titulo-txt">
                    <div class="tt3">LightApple</div>
                </div>
            </div>
            <div class="sobre">
                <a href="#">
                    <div class="txt-sobre">Sobre</div>
                </a>
            </div>
            <div class="fale-conosco">
                <a href="#">
                    <div class="txt-fale-conosco">Fale Conosco</div>
                </a>
            </div>
            <div class="termos-de-uso">
                <a href="#">
                    <div class="txt-termos">Termos de Uso</div>
                </a>
            </div>
        </div>
    </footer>
    <script>
        const userId = document.getElementById("user-id").value;
    </script>
    <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAppxfGYLdYhP8lVimrq43dP6Gso9Y-si4&libraries=places&callback=initMap">
    </script>
    <script src="TelaMeuperfil(entrega).js"></script>
    <script src="navmenu(entrega).js"></script>
</body>

</html>