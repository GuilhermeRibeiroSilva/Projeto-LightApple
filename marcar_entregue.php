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
    $conn->beginTransaction();

    // Insere na tabela de entregas_concluidas
    $stmt = $conn->prepare("
        INSERT INTO entregas_concluidas (pedido_id, entregador_id, data_entrega)
        VALUES (?, ?, NOW())
    ");
    $stmt->execute([$pedidoId, $_SESSION['user_id']]);

    // Atualiza o status do pedido
    $stmt = $conn->prepare("
        UPDATE pedidos 
        SET status = 'aguardando_confirmacao'
        WHERE id = ? AND entregador_id = ?
    ");
    $stmt->execute([$pedidoId, $_SESSION['user_id']]);

    $conn->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 