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
    <link rel="stylesheet" href="TelaInicialColeta.css">
    <link rel="stylesheet" href="navmenu(coleta).css">
    <link rel="stylesheet" href="footer.css">
</head>

<body>
    <input type="hidden" id="user-id" value="<?php echo htmlspecialchars($userId); ?>">
    <header>
        <div class="hero">
            <nav>
                <a href="TelaInicialColeta.php"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
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
                    <img src="<?php echo $profileImagePath; ?>" class="user-perf" id="userImageCircle" onclick="toggleMenu()">
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <img src="<?php echo $profileImagePath; ?>" class="user-image-circle" id="userImageDropdown">
                                <h3>Olá, <?php echo explode(' ', $usuario['nome'])[0]; ?></h3>
                            </div>
                            <a href="TelaMeuperfil(coleta).php" class="sub-menu-link">
                                <p>Meu Perfil</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Estatísticas</p>
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
            <a href="#">
                <div class="box-estabelecimentos">
                    <img class="estabelecimentos" src="imagens/Estabelecimentos.png" />
                    <div class="txtestabelecimentos">ESTABELECIMENTOS</div>
                </div>
            </a>
            <a href="#">
                <div class="box-pedidos">
                    <img class="pedido" src="imagens/Pacote.png" />
                    <div class="txtpedidos">PEDIDOS</div>
                </div>
            </a>
            <a href="#">
                <div class="box-historico">
                    <img class="historico" src="imagens/pedido.png" />
                    <div class="txthistorico">HISTÓRICO</div>
                </div>
            </a>
        </section>
        <section class="section-empresa-coleta">
            <div class="box-empresadecoleta">
                <div class="tt">Estabelecimenos</div>
                <div class="desc">Algumas em estabeelecimentos cadastradas no nosso site</div>
            </div>
            <div class="empresas">
                <div class="emp-coleta">
                    <div class="box-cards">
                        <div class="card">
                            <img src="imagens/ROOP.png">
                            <div class="texto">
                                <h1>ROOP</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/Cond.png">
                            <div class="texto">
                                <h1>Cond. Laranjeiras</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/Rest.png">
                            <div class="texto">
                                <h1>Chiniyaki</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/Cond.png">
                            <div class="texto">
                                <h1>Cond. Laranjeiras</h1>
                            </div>
                        </div>
                        <div class="card">
                            <img src="imagens/ROOP.png">
                            <div class="texto">
                                <h1>ROOP</h1>
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
            <button class="btn-vermais"><a href="#">Ver Mais Estabelecimenos</a></button>
        </section>
        <section class="PedDisp">
            <div class="container">
                <h2 class="ttped">Pedidos</h2>
                <p id="no-available-orders" style="display:none; color: #287326; text-align: center;">Aguardar, não há pedidos.</p>
                <div class="pedidos-lista" id="available-orders-list">
                    <!-- Pedidos da seção serão gerados aqui -->
                </div>
            </div>
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
    <script src="TelaInicialColeta.js"></script>
    <script src="navmenu(coleta).js"></script>
</body>

</html>