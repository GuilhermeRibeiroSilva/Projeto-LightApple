<?php
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT 
            id,
            nome_titular,
            CONCAT(
                nome_titular, 
                ' (**** **** **** ', 
                RIGHT(numero_cartao, 4)
            ) as descricao
        FROM cartoes_credito 
        WHERE user_id = :user_id
    ");
    
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $cartoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    header('Content-Type: application/json');
    echo json_encode($cartoes);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 