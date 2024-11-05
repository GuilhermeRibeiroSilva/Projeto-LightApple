<?php
session_start();
require_once 'conexao.php';

// Verifica se é admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header('Location: entrar.php');
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Buscar informações do usuário
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE id = :id AND is_admin = TRUE");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        header("Location: error.php");
        exit();
    }

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
    <title>Painel Administrativo - LightApple</title>
    <link rel="stylesheet" href="TelaAdmin.css">
</head>
<body>
    <header>
        <nav>
            <a href="#"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
            <h2>Painel Administrativo</h2>
            <button onclick="fazerLogout()" class="logout-btn">Sair</button>
        </nav>
    </header>

    <main>
        <div class="admin-container">
            <div class="admin-section">
                <h3>Cadastrar Local</h3>
                <button onclick="mostrarFormularioCadastroLocal()">Novo Local</button>
            </div>

            <div class="admin-section">
                <h3>Cadastrar Produto</h3>
                <button onclick="mostrarFormularioCadastroProduto()">Novo Produto</button>
            </div>

            <div class="admin-section">
                <h3>Gerenciar Locais</h3>
                <div id="locais-grid" class="grid-container">
                    <!-- Locais serão carregados aqui dinamicamente -->
                </div>
            </div>

            <div class="admin-section">
                <h3>Gerenciar Produtos</h3>
                <div id="produtos-grid" class="grid-container">
                    <!-- Produtos serão carregados aqui dinamicamente -->
                </div>
            </div>

            <div class="admin-section">
                <h3>Pedidos de Troca</h3>
                <div class="grid-container" id="pedidos-troca-grid">
                    <!-- Os pedidos serão carregados aqui via JavaScript -->
                </div>
            </div>
        </div>
    </main>

    <!-- Overlay para cadastro de local -->
    <div class="overlay" id="localOverlay" style="display: none;">
        <div class="ad-card">
            <h2>Cadastrar Novo Local</h2>
            <form id="cadastro-local-form">
                <div class="form-group">
                    <label for="nome">Nome do Local:</label>
                    <input type="text" id="nome" name="nome" required>
                </div>
                
                <div class="form-group">
                    <label for="categoria">Categoria:</label>
                    <select id="categoria" name="categoria" required>
                        <option value="">Selecione uma categoria</option>
                        <option value="empresa de coleta">Empresa de Coleta</option>
                        <option value="estabelecimentos">Estabelecimento</option>
                        <option value="condominios">Condomínio</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="endereco">Endereço:</label>
                    <input type="text" id="endereco" name="endereco" required>
                </div>
                
                <!-- Novo container para limite de coleta -->
                <div class="form-group" id="limite-coleta-container" style="display: none;">
                    <label for="limite-coleta">Limite de Coleta Diário (kg):</label>
                    <input type="number" id="limite-coleta" name="limite_coleta" min="1">
                </div>
                
                <div class="form-group">
                    <label for="imagem">Imagem:</label>
                    <div class="image-upload-container">
                        <input type="file" id="imagem" name="imagem" accept="image/*">
                    </div>
                </div>
                
                <div class="button-container">
                    <button type="submit" class="salvar-btn">Cadastrar</button>
                    <button type="button" class="cancelar-btn" onclick="fecharOverlay('localOverlay')">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Overlay para cadastro de produto -->
    <div class="overlay" id="produtoOverlay" style="display: none;">
        <div class="ad-card">
            <h2>Cadastrar Novo Produto</h2>
            <form id="cadastro-produto-form">
                <div class="form-group">
                    <label for="nome_produto">Nome do Produto:</label>
                    <input type="text" id="nome_produto" name="nome_produto" required>
                </div>
                
                <div class="form-group">
                    <label for="pontos">Pontos Necessários:</label>
                    <input type="number" id="pontos" name="pontos" required>
                </div>
                
                <div class="form-group">
                    <label for="imagem_produto">Imagem:</label>
                    <div class="image-upload-container">
                        <input type="file" id="imagem_produto" name="imagem_produto" accept="image/*">
                    </div>
                </div>
                
                <div class="button-container">
                    <button type="submit" class="salvar-btn">Cadastrar</button>
                    <button type="button" class="cancelar-btn" onclick="fecharOverlay('produtoOverlay')">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAppxfGYLdYhP8lVimrq43dP6Gso9Y-si4&libraries=places">
    </script>
    <script src="TelaAdmin.js"></script>
</body>
</html> 