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

  // Buscar total de anúncios para paginação (todos os tipos)
  $sql_total = "SELECT COUNT(*) as total 
                FROM locais 
                WHERE (categoria = 'estabelecimentos' 
                      OR categoria = 'empresa de coleta' 
                      OR categoria = 'condominios')
                AND status = 'ativo'";
  $stmt_total = $conn->prepare($sql_total);
  $stmt_total->execute();
  $total_anuncios = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
  $total_paginas = ceil($total_anuncios / $itens_por_pagina);

  // Buscar anúncios com paginação (todos os tipos)
  $sql = "SELECT l.*, 
          (SELECT COUNT(*) FROM favoritos f WHERE f.local_id = l.id AND f.user_id = :user_id) as favoritado
          FROM locais l
          WHERE (l.categoria = 'estabelecimentos' 
                OR l.categoria = 'empresa de coleta' 
                OR l.categoria = 'condominios')
          AND l.status = 'ativo'
          ORDER BY l.created_at DESC
          LIMIT :offset, :itens_por_pagina";

  $stmt = $conn->prepare($sql);
  $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->bindValue(':itens_por_pagina', $itens_por_pagina, PDO::PARAM_INT);
  $stmt->execute();
  $anuncios = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
  <link rel="stylesheet" href="TelaEstabelecimentos.css">
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
        <div class="pedido-menu">
          <img src="imagens/Clipboard.png" class="ped-pic" onclick="toggleMenuPed()">
          <div class="sub-menu-ped-wrap" id="criarPed">
            <div class="sub-menu-ped">
              <div class="ped-info">
                <img src="imagens/LightApple-Logo.png">
                <h3>Pedidos Disponíveis</h3>
              </div>
              <div class="lista-pedidos" id="lista-pedidos">
                <div class="pedido-box" id="pedido-1">
                  <div class="pedido-detalhes">
                    <h4>Empresa X</h4>
                    <p><strong>Partida:</strong> Rua A</p>
                    <p><strong>Chegada:</strong> Rua B</p>
                    <p><strong>Peso:</strong> 10kg</p>
                    <p><strong>Valor:</strong> R$ 50,00</p>
                  </div>
                  <div class="pedido-acoes">
                    <button class="btn-aceitar" onclick="aceitarPedido('pedido-1')">Aceitar</button>
                    <button class="btn-rejeitar"
                      onclick="rejeitarPedido('pedido-1')">Rejeitar</button>
                  </div>
                </div>
                <div class="pedido-box" id="pedido-2">
                  <div class="pedido-detalhes">
                    <h4>Empresa Y</h4>
                    <p><strong>Partida:</strong> Rua C</p>
                    <p><strong>Chegada:</strong> Rua D</p>
                    <p><strong>Peso:</strong> 15kg</p>
                    <p><strong>Valor:</strong> R$ 70,00</p>
                  </div>
                  <div class="pedido-acoes">
                    <button class="btn-aceitar" onclick="aceitarPedido('pedido-2')">Aceitar</button>
                    <button class="btn-rejeitar"
                      onclick="rejeitarPedido('pedido-2')">Rejeitar</button>
                  </div>
                </div>
                <div class="pedido-box" id="pedido-2">
                  <div class="pedido-detalhes">
                    <h4>Empresa Y</h4>
                    <p><strong>Partida:</strong> Rua C</p>
                    <p><strong>Chegada:</strong> Rua D</p>
                    <p><strong>Peso:</strong> 15kg</p>
                    <p><strong>Valor:</strong> R$ 70,00</p>
                  </div>
                  <div class="pedido-acoes">
                    <button class="btn-aceitar" onclick="aceitarPedido('pedido-2')">Aceitar</button>
                    <button class="btn-rejeitar"
                      onclick="rejeitarPedido('pedido-2')">Rejeitar</button>
                  </div>
                </div>
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
    <h1 class="estabelecimentos">Estabelecimentos</h1>
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
      <?php foreach ($anuncios as $anuncio): ?>
        <div class="product" data-distancia="<?php echo (int)$anuncio['distancia']; ?>" 
             data-id="<?php echo htmlspecialchars($anuncio['id']); ?>">
            <img src="<?php echo htmlspecialchars($anuncio['imagem_path']); ?>" alt="Imagem do Local" class="product-image">
            <h3><?php echo htmlspecialchars($anuncio['nome']); ?></h3>
            <p class="distancia">Distância: <?php echo (int)$anuncio['distancia']; ?> km</p>
            <span class="favoritar <?php echo $anuncio['favoritado'] ? 'favoritado' : ''; ?>" 
                  data-id="<?php echo htmlspecialchars($anuncio['id']); ?>">♥</span>
        </div>
      <?php endforeach; ?>
    </div>
  </main>

  <!-- Paginação fora do main para manter o estilo original -->
  <div class="pagination">
    <button class="prev" <?= ($pagina_atual <= 1) ? 'disabled' : '' ?> 
            onclick="carregarAnuncios(<?= $pagina_atual - 1 ?>)">Anterior</button>
    <?php for ($i = 1; $i <= $total_paginas; $i++): ?>
        <button class="page-number <?= ($i == $pagina_atual) ? 'active' : '' ?>" 
                onclick="carregarAnuncios(<?= $i ?>)"><?= $i ?></button>
    <?php endfor; ?>
    <button class="next" <?= ($pagina_atual >= $total_paginas) ? 'disabled' : '' ?> 
            onclick="carregarAnuncios(<?= $pagina_atual + 1 ?>)">Próximo</button>
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
  <script src="TelaEstabelecimentos.js"></script>
  <script src="navmenu(entrega).js"></script>
</body>

</html>
