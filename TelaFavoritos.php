<?php
session_start();
require_once 'conexao.php';

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    header('Location: entar.php');
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Configuração da paginação
    $itens_por_pagina = 9;
    $pagina_atual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $offset = ($pagina_atual - 1) * $itens_por_pagina;

    // Buscar total de favoritos para paginação
    $sql_total = "SELECT COUNT(*) as total FROM favoritos WHERE user_id = :user_id";
    $stmt_total = $conn->prepare($sql_total);
    $stmt_total->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt_total->execute();
    $total_favoritos = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
    $total_paginas = ceil($total_favoritos / $itens_por_pagina);

    // Buscar favoritos com paginação
    $sql = "SELECT l.*, 
          (SELECT COUNT(*) FROM favoritos f WHERE f.local_id = l.id AND f.user_id = :user_id) as favoritado
          FROM locais l
          INNER JOIN favoritos f ON l.id = f.local_id
          WHERE f.user_id = :user_id
          ORDER BY f.created_at DESC
          LIMIT :offset, :itens_por_pagina";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':itens_por_pagina', $itens_por_pagina, PDO::PARAM_INT);
    $stmt->execute();
    $favoritos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("SELECT *, DATE_FORMAT(dataCriacao, '%M de %Y') AS membro_desde FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Buscar informações do usuário incluindo pontos
    $stmt = $conn->prepare("SELECT nome, pontos FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $_SESSION['user_id']);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verifica se o usuário existe
    if (!$usuario) {
        header("Location: error.php");
        exit();
    }

    // Obtém o caminho da imagem de perfil ou uma imagem padrão
    $profileImagePath = $usuario['profile_image_path'] ?? 'imagens/default_image.png'; // Caminho padrão se não houver imagem

} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightApple - Favoritos</title>
    <link rel="stylesheet" href="TelaFavoritos.css">
    <link rel="stylesheet" href="navmenu(cliente).css">
    <link rel="stylesheet" href="footer.css">
</head>

<body>
    <input type="hidden" id="user-id" value="<?php echo htmlspecialchars($userId); ?>">
    <header>
        <div class="hero">
            <nav>
                <a href="TelaInicialCliente.php"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
                <a href="#">
                    <h2 class="lightapple-titulo">LightApple</h2>
                </a>
                <ul>
                    <li><a href="TelaInicialCliente.php" class="inicio">Inicio</a></li>
                    <li><a href="TelaEmpresadeColeta.php" class="empresa-coleta">Empresa de Coleta</a></li>
                    <li><a href="TelaTrocarpontos.php" class="trocar-pontos">Trocar Pontos</a></li>
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
                                    <input type="text" id="nova-forma-pagamento-input" name="nova-forma-pagamento-input">
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
                                <!-- Items serão inseridos aqui via JavaScript -->
                            </div>
                            <p class="total-pontos">Total: 0 P</p>
                            <button class="clear-cart-btn" onclick="limparCarrinho()">Limpar Carrinho</button>
                            <button class="checkout-btn" onclick="finalizarCompra()">Finalizar Compra</button>
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
                            <p id="points">
                                Meus Pontos: <?php echo number_format($usuario['pontos']); ?> P
                                <span></span>
                            </p>
                            <hr>
                            <a href="TelaMeuPerfil.php" class="sub-menu-link">
                                <p>Meu Perfil</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="TelaFavoritos.php" class="sub-menu-link">
                                <p>Favoritos</p>
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
    <div class="section-txt">
        <h1 class="meus_favoritos">Meus Favoritos</h1>
    </div>
    <main>

        <!-- Adicionar o accordion de filtros à esquerda -->
        <div class="accordion" id="accordionPanelsStayOpenExample">
            <input type="search" name="" id="flitersearch" placeholder="Pesquisar...">

            <!-- Filtro de Limite de Coleta -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingThree">Limite de Coleta</h2>
                <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse show" aria-labelledby="headingThree">
                    <div class="accordion-body">
                        <label for="priceRange">Limite de coleta (kg): <span id="currentPrice">0 kg</span></label>
                        <input type="range" class="form-range" min="0" max="100000" value="0" id="priceRange" />
                    </div>
                </div>
            </div>

            <!-- Filtro de Distância -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingDistancia">Distância Máxima</h2>
                <div id="panelsStayOpen-collapseDistancia" class="accordion-collapse collapse show" aria-labelledby="headingDistancia">
                    <div class="accordion-body">
                        <label for="distanciaRange">Distância máxima (km): <span id="currentDistancia">0 km</span></label>
                        <input type="range" class="form-range" min="0" max="5000" value="0" id="distanciaRange" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Grid de Produtos -->
        <div class="products-grid">
            <?php foreach ($favoritos as $favorito): ?>
                <div class="product"
                    data-limite-coleta="<?php echo htmlspecialchars($favorito['limite_coleta']); ?>"
                    data-distancia="<?php echo htmlspecialchars($favorito['distancia']); ?>">
                    <img src="<?php echo htmlspecialchars($favorito['imagem_path']); ?>"
                        alt="Imagem da Empresa"
                        class="product-image">
                    <h3><?php echo htmlspecialchars($favorito['nome']); ?></h3>
                    <p>Limite de Coleta: <?php echo htmlspecialchars($favorito['limite_coleta']); ?> kg</p>
                    <p class="distancia">Distância: <?php echo $favorito['distancia'] ? number_format($favorito['distancia'], 0) : 'N/A'; ?> km</p>
                    <span class="favoritar favoritado"
                        data-id="<?php echo htmlspecialchars($favorito['id']); ?>">♥</span>
                </div>
            <?php endforeach; ?>
        </div>
    </main>

    <!-- Paginação fora do main para manter o estilo original -->
    <div class="pagination">
        <button class="prev" <?= ($pagina_atual <= 1) ? 'disabled' : '' ?> onclick="carregarFavoritos(<?= $pagina_atual - 1 ?>)">Anterior</button>
        <?php for ($i = 1; $i <= $total_paginas; $i++): ?>
            <button class="page-number <?= ($i == $pagina_atual) ? 'active' : '' ?>" onclick="carregarFavoritos(<?= $i ?>)"><?= $i ?></button>
        <?php endfor; ?>
        <button class="next" <?= ($pagina_atual >= $total_paginas) ? 'disabled' : '' ?> onclick="carregarFavoritos(<?= $pagina_atual + 1 ?>)">Próximo</button>
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
    <script src="calcularDistancias.js"></script>
    <script src="TelaFavoritos.js"></script>
    <script src="navmenu(cliente).js"></script>
</body>

</html>