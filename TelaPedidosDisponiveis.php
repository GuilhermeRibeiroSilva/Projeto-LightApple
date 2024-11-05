<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: entar.php');
    exit;
}

$userId = $_SESSION['user_id'];

try {
    $conn = new PDO("mysql:host=localhost;dbname=light_apple;charset=utf8", 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("SELECT *, DATE_FORMAT(dataCriacao, '%M de %Y') AS membro_desde FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    $profileImagePath = $usuario['profile_image_path'] ?? 'imagens/default_image.png';
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
}

$pedidoParaExibir = null;
if (isset($_GET['pedido_id'])) {
    try {
        $stmt = $conn->prepare("
            SELECT p.*, 
                   u.nome as nome_cliente,
                   e.nome as empresa_coleta
            FROM pedidos p
            JOIN usuarios u ON p.id_cliente = u.id
            JOIN empresas e ON p.id_empresa = e.id
            WHERE p.id = ?
        ");
        $stmt->execute([$_GET['pedido_id']]);
        $pedidoParaExibir = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Log do erro
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedidos Disponíveis - LightApple</title>
    <link rel="stylesheet" href="TelaPedidosDisponiveis.css">
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
                                <img src="imagens/package-icon.png" alt="Ícone de pedidos">
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
    <section class="section-txt">
        <h1 class="pedidos-disponiveis">Pedidos Disponíveis</h1>
    </section>

    <main>
        <div class="pedidos-grid">
            <!-- Pedidos serão inseridos aqui via JavaScript -->
        </div>
    </main>

    <!-- Modal de Detalhes do Pedido -->
    <div class="pedido-modal-overlay"></div>
    <div class="pedido-modal">
        <div class="pedido-modal-content">
            <!-- Conteúdo será inserido via JavaScript -->
        </div>
    </div>

    <!-- Paginação -->
    <div class="pagination">
        <!-- Será preenchido via JavaScript -->
    </div>

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

    <script src="TelaPedidosDisponiveis.js"></script>
    <script src="navmenu(entrega).js"></script>
    <?php if ($pedidoParaExibir): ?>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const pedido = <?php echo json_encode($pedidoParaExibir); ?>;
            mostrarDetalhes(pedido);
        });
    </script>
    <?php endif; ?>
</body>

</html>