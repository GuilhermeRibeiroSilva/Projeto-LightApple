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


    // Buscar informações do usuário incluindo pontos
    $stmt = $conn->prepare("SELECT nome, pontos FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $_SESSION['user_id']);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

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
    <link rel="stylesheet" href="TelaInicialCliente.css">
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
                                <input type="text" id="empresa-coleta" name="empresa-coleta" required>
                                <!--<input type="hidden" id="empresa-id" name="empresa-id">-->
                                
                                <div class="form-group">
                                    <label for="forma-pagamento">Forma de Pagamento:</label>
                                    <select id="forma-pagamento" name="forma-pagamento" required>
                                        <option value="">Selecione um cartão</option>
                                    </select>
                                    <button type="button" class="add-cartao-btn" onclick="abrirModalCartao()">+ Adicionar novo cartão</button>
                                </div>

                                <label for="quantidade-lixo">Quantidade de Lixo (kg):</label>
                                <input type="number" id="quantidade-lixo" name="quantidade-lixo" required>

                                <label for="local-partida">Local de Partida:</label>
                                <input type="text" id="local-partida" name="local-partida" required>

                                <label for="local-chegada">Local de Chegada:</label>
                                <input type="text" id="local-chegada" name="local-chegada" required>

                                <div class="valores-container">
                                    <div class="valor-display">
                                        <span>Valor:</span>
                                        <span id="valor-display">R$ 0,00</span>
                                    </div>
                                    <div class="valor-display">
                                        <span>Frete:</span>
                                        <span id="frete-display">R$ 0,00</span>
                                    </div>
                                    <div class="valor-display">
                                        <span>Total:</span>
                                        <span id="valor-total-display">R$ 0,00</span>
                                    </div>
                                </div>

                                <button type="button" id="criar-pedido-btn">Criar Pedido</button>
                            </form>
                            <div id="modal-cartao" class="modal">
                                <div class="modal-content">
                                    <button type="button" class="close-modal" onclick="fecharModalCartao()">&times;</button>
                                    <h3>Adicionar Novo Cartão</h3>
                                    <form id="form-cartao">
                                        <div class="form-group">
                                            <label for="nome_titular">Nome do Titular:</label>
                                            <input type="text" id="nome_titular" required>
                                        </div>

                                        <div class="form-group">
                                            <label for="numero_cartao">Número do Cartão:</label>
                                            <input type="text" id="numero_cartao" maxlength="16" required>
                                        </div>

                                        <div class="form-group">
                                            <label for="data_validade">Data de Validade (MM/AA):</label>
                                            <input type="text" 
                                                   id="data_validade" 
                                                   maxlength="5" 
                                                   placeholder="MM/AA" 
                                                   pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                                                   required>
                                        </div>

                                        <div class="form-group">
                                            <label for="cvv">CVV:</label>
                                            <input type="text" id="cvv" maxlength="3" required>
                                        </div>

                                        <button type="submit">Salvar Cartão</button>
                                    </form>
                                </div>
                            </div>
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
    <main>
        <section class="section-minimenu">
            <a href="TelaEmpresadeColeta.php">
                <div class="box-empresa-de-coleta">
                    <img class="empresacoleta" src="imagens/empresacoleta.png" />
                    <div class="txtempresacoleta">EMPRESAS DE COLETA</div>
                </div>
            </a>
            <a href="TelaTrocarpontos.php">
                <div class="box-trocadepontos">
                    <img class="troca" src="imagens/troca.png" />
                    <div class="txttrocadepontos">TROCAR PONTOS</div>
                </div>
            </a>
            <a href="#">
                <div class="box-pedidos">
                    <img class="pedido" src="imagens/pedido.png" />
                    <div class="txtpedidos">PEDIDOS</div>
                </div>
            </a>
        </section>
        <section class="section-empresa-coleta">
            <div class="box-empresadecoleta">
                <div class="tt">Empresas de Coleta</div>
                <div class="desc">Algumas em empresas cadastradas no nosso site</div>
            </div>
            <div class="empresas">
                <div class="emp-coleta">
                    <div class="box-cards">
                        <div class="card">
                            <img src="imagens/empresa-biocoleta.png">
                            <div class="texto">
                                <h1>EcoPonto</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/empresa-ecoponto.png">
                            <div class="texto">
                                <h1>BioColeta</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/empresa-verdeponto.png">
                            <div class="texto">
                                <h1>VerdePonto</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/empresa-biocoleta.png">
                            <div class="texto">
                                <h1>Ecourbis Ambiental</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/empresa-ecoponto.png">
                            <div class="texto">
                                <h1>Essencis Soluções </h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="">
                            <div class="texto">
                                <h1></h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="map">
                    <button class="active first"></button>
                    <button class="second"></button>
                </div>
            </div>
            <button class="btn-vermais"><a href="#">Ver Mais Empresas</a></button>
        </section>
        <section class="section-anuncio">
            <div class="cont-img-anuncio">
                <div class="box-img-anuncio">
                    <img class="anuncio" src="imagens/anuncio.png" />
                </div>
            </div>
            <div class="box-anuncio">
                <div class="tt2">NÃO FEZ SEU PEDIDO AINDA?</div>
                <div class="desc2">Faça seu pedido para ganhar pontos de reciclagem.</div>
            </div>
        </section>
        <section class="section-troca-de-pontos">
            <div class="box-troca">
                <div class="box-troca-pontos">
                    <div class="tt">Troca de Pontos</div>
                    <div class="desc">Alguns produtos para troca de pontos</div>
                </div>
            </div>
            <div class="empresas">
                <div class="emp-coleta">
                    <div class="box-cards">
                        <div class="card">
                            <img src="imagens/copos.jpg">
                            <div class="texto">
                                <h1>Copos</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/cupon.png">
                            <div class="texto">
                                <h1>Cupons</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/chaveiro.jpg">
                            <div class="texto">
                                <h1>Chaveiros</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="">
                            <div class="texto">
                                <h1>Ecourbis Ambiental</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="">
                            <div class="texto">
                                <h1>Essencis Soluções </h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="">
                            <div class="texto">
                                <h1></h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn-vermais"><a href="#">Ver Produtos</a></button>
        </section>
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
    <script src="TelaInicialCliente.js"></script>
    <script src="navmenu(cliente).js"></script>
</body>

</html>