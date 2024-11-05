<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $pedido_id = $data['id'];

    $conn->beginTransaction();

    // Atualizar status do pedido
    $sql = "UPDATE compras SET status = 'fechado' WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':id' => $pedido_id]);

    $conn->commit();
    
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 