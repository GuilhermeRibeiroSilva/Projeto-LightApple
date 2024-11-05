<?php
session_start();
require_once 'conexao.php';

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    header('Location: entrar.php');
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Configuração da paginação
    $itens_por_pagina = 9;
    $pagina_atual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $offset = ($pagina_atual - 1) * $itens_por_pagina;

    // Buscar total de favoritos para paginação (todos os tipos)
    $sql_total = "SELECT COUNT(*) as total 
                  FROM favoritos f 
                  INNER JOIN locais l ON f.local_id = l.id 
                  WHERE f.user_id = :user_id 
                  AND (l.categoria = 'estabelecimentos' 
                      OR l.categoria = 'empresa de coleta' 
                      OR l.categoria = 'condominios')
                  AND l.status = 'ativo'";
    $stmt_total = $conn->prepare($sql_total);
    $stmt_total->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt_total->execute();
    $total_favoritos = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
    $total_paginas = ceil($total_favoritos / $itens_por_pagina);

    // Buscar favoritos com paginação (todos os tipos)
    $sql = "SELECT l.*, 
            (SELECT COUNT(*) FROM favoritos f2 WHERE f2.local_id = l.id AND f2.user_id = :user_id) as favoritado
            FROM locais l
            INNER JOIN favoritos f ON l.id = f.local_id
            WHERE f.user_id = :user_id
            AND (l.categoria = 'estabelecimentos' 
                OR l.categoria = 'empresa de coleta' 
                OR l.categoria = 'condominios')
            AND l.status = 'ativo'
            ORDER BY f.created_at DESC
            LIMIT :offset, :itens_por_pagina";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':itens_por_pagina', $itens_por_pagina, PDO::PARAM_INT);
    $stmt->execute();
    $favoritos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Buscar informações do usuário
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
    $profileImagePath = $usuario['profile_image_path'] ?? 'imagens/default_image.png';
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
    <title>LightApple</title>
    <link rel="stylesheet" href="TelaFavoritos(entrega).css">
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
    <section class="section-txt">
        <h1 class="meus_favoritos">Meus Favoritos</h1>
        <p class="empresas-favoritas">Vejas as suas empresas e estabelecimentos favoritas</p>
    </section>
    <main>

        <!-- Adicionar o accordion de filtros à esquerda -->
        <div class="accordion" id="accordionPanelsStayOpenExample">
            <input type="search" name="" id="flitersearch" placeholder="Pesquisar...">

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
    <script src="TelaFavoritos(entrega).js"></script>
    <script src="navmenu(entrega).js"></script>
</body>

</html>