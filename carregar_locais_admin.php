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
    $sql = "SELECT id, nome, categoria, endereco, imagem_path 
            FROM locais 
            WHERE status = 'ativo' 
            ORDER BY created_at DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $locais = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Garante que a imagem_path tenha um valor válido
    foreach ($locais as &$local) {
        if (empty($local['imagem_path']) || !file_exists($local['imagem_path'])) {
            $local['imagem_path'] = 'imagens/default_local.png';
        }
    }
    
    echo json_encode($locais);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar locais: ' . $e->getMessage()
    ]);
}
?> 