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

    // Verificação do status do pedido antes de aceitar
    $stmt = $conn->prepare("
        SELECT status 
        FROM pedidos 
        WHERE id = :pedido_id 
        AND status = 'aberto'
        FOR UPDATE
    "); // FOR UPDATE para evitar condições de corrida
    $stmt->execute(['pedido_id' => $pedidoId]);

    if ($stmt->rowCount() > 0) {
        // Pedido está disponível, pode prosseguir com a aceitação
        $stmt = $conn->prepare("
            UPDATE pedidos 
            SET status = 'aceito', 
                id_entregador = :id_entregador,
                data_aceite = NOW() 
            WHERE id = :pedido_id
        ");
        
        $result = $stmt->execute([
            'id_entregador' => $userId,
            'pedido_id' => $pedidoId
        ]);
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Pedido não está mais disponível'
        ]);
    }

    // Insere na tabela de pedidos aceitos
    $stmt = $conn->prepare("
        INSERT INTO pedidos_aceitos 
        (id_pedido, id_entregador, status) 
        VALUES (?, ?, 'em_andamento')
    ");
    $stmt->execute([$pedidoId, $userId]);

    // Confirma a transação
    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Pedido aceito com sucesso!']);

} catch (Exception $e) {
    // Reverte a transação em caso de erro
    if ($conn) {
        $conn->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 