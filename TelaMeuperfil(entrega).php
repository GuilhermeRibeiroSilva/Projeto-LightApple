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
                    <img src="imagens/Avatar.png" class="user-pic" onclick="toggleMenu()">
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <img src="imagens/Avatar.png">
                                <h3>Joana</h3>
                            </div>
                            <a href="#" class="sub-menu-link">
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

    <main>
        <!-- Section for profile photo and user information -->
        <section class="section-profile">
            <div class="profile-left">
                <img src="imagens/Avatar.png" alt="Foto de Perfil" class="profile-pic">
                <div class="profile-info">
                    <h2>Joana</h2>
                    <p>Membro desde: Janeiro de 2023</p>
                    <p>Informações Pessoais</p>
                </div>
            </div>
            <div class="profile-right">
                <button type="button" id="editar-perfil-btn">Editar Perfil</button>
            </div>
        </section>

        <!-- Section for personal information -->
        <section class="section-personal-info">
            <h3>Informações Pessoais</h3>
            <form id="profile-info-form">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" value="Joana Silva" readonly>

                <label for="cpf">CPF:</label>
                <input type="text" id="cpf" name="cpf" value="123.456.789-00" readonly>

                <label for="data-nascimento">Data de Nascimento:</label>
                <input type="date" id="data-nascimento" name="data-nascimento" value="1990-05-15" readonly>

                <label for="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" value="(11) 98765-4321" readonly>

                <label for="endereco">Endereço:</label>
                <input type="text" id="endereco" name="endereco" value="Rua Exemplo, 123" readonly>

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="joana@email.com" readonly>

                <label for="senha">Senha:</label>
                <div class="senha-section">
                    <input type="password" id="senha" name="senha" value="********" readonly>
                    <button type="button" class="trocar-senha-btn">Trocar Senha</button>
                </div>

                <label for="tipo-conta">Tipo de Conta:</label>
                <select id="tipo-conta" name="tipo-conta" disabled>
                    <option value="cliente" selected>Cliente</option>
                    <option value="condominio">Condomínio</option>
                    <option value="estabelecimento">Estabelecimento</option>
                    <option value="empresa-coleta">Empresa de Coleta</option>
                    <option value="transportadora">Transportadora</option>
                    <option value="motoboy">Motoboy</option>
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
    <script src="TelaMeuperfil(entrega).js"></script>
    <script src="navmenu(entrega).js"></script>
</body>

</html>