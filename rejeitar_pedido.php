<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $pedidoId = $data['pedido_id'];
    $userId = $_SESSION['user_id'];

    $conn = new PDO("mysql:host=localhost;dbname=light_apple", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Inicia a transação
    $conn->beginTransaction();

    // Verifica se o pedido existe e está disponível
    $stmt = $conn->prepare("SELECT status FROM pedidos WHERE id = ?");
    $stmt->execute([$pedidoId]);
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        throw new Exception('Pedido não encontrado');
    }

    if ($pedido['status'] !== 'disponivel') {
        throw new Exception('Este pedido já não está mais disponível');
    }

    // Verifica se o entregador já não rejeitou este pedido
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total 
        FROM pedidos_rejeitados 
        WHERE id_pedido = ? 
        AND id_entregador = ?
    ");
    $stmt->execute([$pedidoId, $userId]);
    $jaRejeitado = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($jaRejeitado['total'] > 0) {
        throw new Exception('Você já rejeitou este pedido anteriormente');
    }

    // Insere na tabela de pedidos rejeitados
    $stmt = $conn->prepare("
        INSERT INTO pedidos_rejeitados 
        (id_pedido, id_entregador) 
        VALUES (?, ?)
    ");
    $stmt->execute([$pedidoId, $userId]);

    // Confirma a transação
    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Pedido rejeitado com sucesso']);

} catch (Exception $e) {
    // Reverte a transação em caso de erro
    if ($conn) {
        $conn->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 