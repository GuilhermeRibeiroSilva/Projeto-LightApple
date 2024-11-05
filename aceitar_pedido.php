<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$pedidoId = $data['pedido_id'] ?? null;

try {
    // Verifica se o pedido ainda está disponível
    $stmt = $conn->prepare("
        SELECT id FROM pedidos 
        WHERE id = ? AND status = 'pendente' AND entregador_id IS NULL
    ");
    $stmt->execute([$pedidoId]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Pedido não está mais disponível']);
        exit;
    }

    // Atualiza o pedido com o entregador atual
    $stmt = $conn->prepare("
        UPDATE pedidos 
        SET entregador_id = ?, status = 'aceito' 
        WHERE id = ? AND status = 'pendente' AND entregador_id IS NULL
    ");
    
    if ($stmt->execute([$_SESSION['user_id'], $pedidoId])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao aceitar pedido']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?> 