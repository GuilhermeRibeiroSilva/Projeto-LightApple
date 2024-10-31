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
    <link rel="stylesheet" href="TelaMeuPerfil.css">
    <link rel="stylesheet" href="navmenu(cliente).css">
    <link rel="stylesheet" href="footer.css">
</head>

<body>
    <header>
        <div class="hero">
            <nav>
                <a href="TelaInicialCliente.php"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
                <a href="#">
                    <h2 class="lightapple-titulo">LightApple</h2>
                </a>
                <ul>
                    <li><a href="#" class="inicio">Inicio</a></li>
                    <li><a href="#" class="empresa-coleta">Empresa de Coleta</a></li>
                    <li><a href="#" class="trocar-pontos">Trocar Pontos</a></li>
                    <li><a href="#" class="pedidos">Pedidos</a></li>
                </ul>
                <input type="search" name="pesquisar" id="pesquisar" placeholder="Pesquisar...">
                <div class="pedido-menu">
                    <img src="imagens/Clipboard.png" class="ped-pic" onclick="toggleMenuPed()">
                    <div class="sub-menu-ped-wrap" id="criarPed">
                        <div class="sub-menu-ped">
                            <div class="ped-info">
                                <img src="imagens/LightApple-Logo.png">
                                <h3>Criar Pedido</h3>
                            </div>
                            <form id="criar-pedido-form">
                                <label for="empresa-coleta">Empresa de Coleta:</label>
                                <input type="text" id="empresa-coleta" name="empresa-coleta">
                                <label for="forma-pagamento">Forma de Pagamento:</label>
                                <select id="forma-pagamento" name="forma-pagamento">
                                    <option value="">Selecione uma forma de pagamento</option>
                                    <option value="Salva">Salva</option>
                                    <option value="Adicionar Nova"><a href="#">Adicionar Nova</a></option>
                                </select>
                                <div id="nova-forma-pagamento" style="display: none;">
                                    <label for="nova-forma-pagamento-input">Nova Forma de Pagamento:</label>
                                    <input type="text" id="nova-forma-pagamento-input"
                                        name="nova-forma-pagamento-input">
                                </div>
                                <label for="quantidade-lixo">Quantidade de Lixo:</label>
                                <input type="number" id="quantidade-lixo" name="quantidade-lixo">
                                <label for="local-partida">Local de Partida:</label>
                                <input type="text" id="local-partida" name="local-partida">
                                <label for="local-chegada">Local de Chegada:</label>
                                <input type="text" id="local-chegada" name="local-chegada">
                                <label for="valor">Valor:</label>
                                <input type="number" id="valor" name="valor" readonly>
                                <label for="frete">Frete:</label>
                                <input type="number" id="frete" name="frete" readonly>
                                <label for="valor-com-frete">Valor com Frete:</label>
                                <input type="number" id="valor-com-frete" name="valor-com-frete" readonly>
                                <button type="button" id="criar-pedido-btn">Criar Pedido</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="cart-menu">
                    <img src="imagens/Shopping cart.png" class="cart-pic" onclick="toggleCart()">
                    <div class="sub-menu-cart-wrap" id="cartDropdown">
                        <div class="sub-menu-cart">
                            <div class="cart-items">

                            </div>
                            <button class="checkout-btn">Finalizar Compra</button>
                        </div>
                    </div>
                </div>
                <div class="user-menu">
                    <div class="user-perf" id="userImageCircle" onclick="toggleMenu()" style="background-image: url('<?php echo $profileImagePath; ?>');"></div>
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <div class="user-image-circle" id="userImageDropdown" style="background-image: url('<?php echo $profileImagePath; ?>');"></div>
                                <h3><?php echo $usuario['nome']; ?></h3>
                            </div>
                            <p id="points">
                                Meus Pontos: 50000 P
                                <span></span>
                            </p>
                            <hr>
                            <a href="TelaMeuPerfil.php" class="sub-menu-link">
                                <p>Meu Perfil</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Favoritos</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Meus Cupons</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Pagamentos</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Ajuda</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
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
            <div class="profile-pic" id="profilePic" style="background-image: url('<?php echo $profileImagePath; ?>');"></div>
            <div class="profile-info">
                <h2><?php echo htmlspecialchars($usuario['nome']); ?></h2>
                <p>Membro desde: <?php echo htmlspecialchars($usuario['membro_desde']); ?></p>
                <p>Informações Pessoais</p>
            </div>
            </div>
            <div class="profile-right">
                <button type="button" id="trocar-imagem-btn">Trocar Imagem</button>
                <button type="button" id="editar-perfil-btn">Editar Perfil</button>
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
                    <input type="password" id="senha" name="senha" value="<?php echo htmlspecialchars($usuario['senha']); ?>" placeholder="********" readonly>
                    <button type="button" class="trocar-senha-btn">Trocar Senha</button>
                </div>

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