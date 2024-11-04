<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

// Verifica se é admin
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit;
}

try {
    $sql = "SELECT id, nome, pontos, imagem_path 
            FROM produtos 
            WHERE status = 'ativo' 
            ORDER BY created_at DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Garante que a imagem_path tenha um valor válido
    foreach ($produtos as &$produto) {
        if (empty($produto['imagem_path']) || !file_exists($produto['imagem_path'])) {
            $produto['imagem_path'] = 'imagens/default_produto.png';
        }
    }
    
    echo json_encode($produtos);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar produtos: ' . $e->getMessage()
    ]);
}
?> 