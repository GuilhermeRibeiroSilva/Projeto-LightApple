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
    // Registra a rejeição do pedido
    $stmt = $conn->prepare("
        INSERT INTO pedidos_rejeitados (pedido_id, entregador_id, data_rejeicao)
        VALUES (?, ?, NOW())
    ");
    
    if ($stmt->execute([$pedidoId, $_SESSION['user_id']])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao rejeitar pedido']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?> 