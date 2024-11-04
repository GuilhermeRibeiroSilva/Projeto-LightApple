<?php
session_start();
require_once 'conexao.php';

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

// Recebe e valida os dados
$data = json_decode(file_get_contents('php://input'), true);
$local_id = isset($data['local_id']) ? (int)$data['local_id'] : 0;

if (!$local_id) {
    echo json_encode(['success' => false, 'message' => 'ID do local inválido']);
    exit;
}

try {
    // Verifica se já existe o favorito
    $stmt = $conn->prepare("SELECT id FROM favoritos WHERE user_id = :user_id AND local_id = :local_id");
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->bindParam(':local_id', $local_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        // Remove o favorito
        $stmt = $conn->prepare("DELETE FROM favoritos WHERE user_id = :user_id AND local_id = :local_id");
        $action = 'removed';
    } else {
        // Adiciona o favorito
        $stmt = $conn->prepare("INSERT INTO favoritos (user_id, local_id, created_at) VALUES (:user_id, :local_id, NOW())");
        $action = 'added';
    }
    
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->bindParam(':local_id', $local_id);
    $stmt->execute();
    
    echo json_encode(['success' => true, 'action' => $action]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao processar: ' . $e->getMessage()]);
} 