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

    // Verifica se o pedido ainda está disponível
    $stmt = $conn->prepare("
        SELECT id FROM pedidos 
        WHERE id = ? AND status = 'pendente' AND entregador_id IS NULL
    ");
    $stmt->execute([$pedidoId]);
    
    if (!$stmt->fetch()) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Pedido não está mais disponível']);
        exit;
    }

    // Insere na tabela pedidos_aceitos
    $stmt = $conn->prepare("
        INSERT INTO pedidos_aceitos (pedido_id, entregador_id, data_aceite)
        VALUES (?, ?, NOW())
    ");
    $stmt->execute([$pedidoId, $_SESSION['user_id']]);

    // Atualiza o status do pedido
    $stmt = $conn->prepare("
        UPDATE pedidos 
        SET entregador_id = ?, status = 'aceito' 
        WHERE id = ? AND status = 'pendente' AND entregador_id IS NULL
    ");
    
    if ($stmt->execute([$_SESSION['user_id'], $pedidoId])) {
        $conn->commit();
        echo json_encode([
            'success' => true,
            'message' => 'Pedido aceito com sucesso'
        ]);
    } else {
        $conn->rollBack();
        echo json_encode([
            'success' => false, 
            'message' => 'Erro ao aceitar pedido'
        ]);
    }

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        'success' => false, 
        'message' => 'Erro ao aceitar pedido: ' . $e->getMessage()
    ]);
}
?> 