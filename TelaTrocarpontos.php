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
  // Buscar informações do usuário
  $stmt = $conn->prepare("SELECT nome, pontos, profile_image_path FROM usuarios WHERE id = :id");
  $stmt->bindParam(':id', $userId);
  $stmt->execute();
  $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$usuario) {
    throw new Exception('Usuário não encontrado');
  }

  // Obtém o caminho da imagem de perfil ou uma imagem padrão
  $profileImagePath = $usuario['profile_image_path'] ?? 'imagens/default_image.png'; // Caminho padrão se não houver imagem

  // Configuração da paginação
  $itens_por_pagina = 9;
  $pagina_atual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
  $offset = ($pagina_atual - 1) * $itens_por_pagina;

  // Contar total de produtos
  $stmt = $conn->query("SELECT COUNT(*) FROM produtos WHERE status = 'ativo'");
  $total_produtos = $stmt->fetchColumn();
  $total_paginas = ceil($total_produtos / $itens_por_pagina);

  // Buscar produtos com paginação
  $sql = "SELECT * FROM produtos WHERE status = 'ativo' ORDER BY created_at DESC LIMIT :offset, :itens_por_pagina";
  $stmt = $conn->prepare($sql);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->bindValue(':itens_por_pagina', $itens_por_pagina, PDO::PARAM_INT);
  $stmt->execute();
  $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  error_log($e->getMessage());
  $profileImagePath = 'imagens/default_image.png';
  $usuario = ['nome' => 'Usuário', 'pontos' => 0];
  $total_paginas = 1; // Valor padrão em caso de erro
  $produtos = []; // Array vazio em caso de erro
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LightApple - Trocar Pontos</title>
  <link rel="stylesheet" href="TelaTrocarpontos.css">
  <link rel="stylesheet" href="navmenu(cliente).css">
  <link rel="stylesheet" href="footer.css">
</head>

<body>
  <input type="hidden" id="user-id" value="<?php echo htmlspecialchars($userId); ?>">
  <!-- Header e navegação -->
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
                <!-- Items do carrinho serão inseridos aqui -->
              </div>
              <div class="total-pontos">Total: 0 P</div>
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
              <hr>
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

  <section class="section-txt">
    <h1 class="troca_de_pontos">Trocar Pontos</h1>
    <p class="troque_aqui">Troque seus pontos por brindes aqui</p>
  </section>

  <main>
    <!-- Accordion de filtros -->
    <div class="accordion" id="accordionPanelsStayOpenExample">
      <input type="search" name="" id="flitersearch" placeholder="Pesquisar...">

      <!-- Filtro de Pontos -->
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingPontos">Pontos Máximos</h2>
        <div id="panelsStayOpen-collapsePontos" class="accordion-collapse collapse show" aria-labelledby="headingPontos">
          <div class="accordion-body">
            <?php
            // Buscar o valor máximo de pontos dos produtos
            $maxPontos = 0;
            foreach ($produtos as $produto) {
                $maxPontos = max($maxPontos, (int)$produto['pontos']);
            }
            ?>
            <label for="pontosRange">Pontos máximos: <span id="currentPontos"><?php echo $maxPontos; ?> P</span></label>
            <input type="range" class="form-range" min="0" max="<?php echo $maxPontos; ?>" 
                   value="<?php echo $maxPontos; ?>" id="pontosRange" />
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de Produtos -->
    <div class="products-grid">
      <?php foreach ($produtos as $produto): ?>
        <div class="product" data-points="<?php echo (int)$produto['pontos']; ?>"
          data-id="<?php echo htmlspecialchars($produto['id']); ?>">
          <img src="<?php echo htmlspecialchars($produto['imagem_path']); ?>" alt="Imagem do Produto" class="product-image">
          <h3><?php echo htmlspecialchars($produto['nome']); ?></h3>
          <p class="pontos"><?php echo (int)$produto['pontos']; ?> P</p>
          <button class="adicionar-carrinho" data-id="<?php echo htmlspecialchars($produto['id']); ?>">
            Adicionar ao Carrinho
          </button>
        </div>
      <?php endforeach; ?>
    </div>
  </main>

  <!-- Paginação -->
  <div class="pagination">
    <?php if ($total_paginas > 1): ?>
        <button class="prev" <?php echo ($pagina_atual <= 1) ? 'disabled' : ''; ?>
            onclick="carregarProdutos(<?php echo max(1, $pagina_atual - 1); ?>)">
            Anterior
        </button>

        <?php for ($i = 1; $i <= $total_paginas; $i++): ?>
            <button class="page-number <?php echo ($i == $pagina_atual) ? 'active' : ''; ?>"
                onclick="carregarProdutos(<?php echo $i; ?>)">
                <?php echo $i; ?>
            </button>
        <?php endfor; ?>

        <button class="next" <?php echo ($pagina_atual >= $total_paginas) ? 'disabled' : ''; ?>
            onclick="carregarProdutos(<?php echo min($total_paginas, $pagina_atual + 1); ?>)">
            Próximo
        </button>
    <?php endif; ?>
  </div>

  <!-- Footer -->
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

  <script src="TelaTrocarpontos.js"></script>
  <script src="navmenu(cliente).js"></script>
</body>

</html>