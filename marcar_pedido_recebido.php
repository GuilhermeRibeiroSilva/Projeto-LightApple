<?php
session_start();
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents('php://input'), true);
    $pedidoId = $data['pedido_id'] ?? null;
    $userId = $data['user_id'] ?? null;

    if (!$pedidoId || !$userId) {
        throw new Exception('Dados incompletos');
    }

    // Inicia a transação
    $conn->beginTransaction();

    // Verifica se o pedido pertence à empresa
    $queryVerifica = "SELECT p.*, u.nome as empresa_nome 
                     FROM pedidos p 
                     JOIN usuarios u ON u.id = :user_id 
                     WHERE p.id = :pedido_id 
                     AND p.empresa_coleta = u.nome 
                     AND u.tipoConta = 'empresa_coleta'";

    $stmtVerifica = $conn->prepare($queryVerifica);
    $stmtVerifica->execute([
        'pedido_id' => $pedidoId,
        'user_id' => $userId
    ]);

    $pedido = $stmtVerifica->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        throw new Exception('Pedido não encontrado ou não pertence a esta empresa');
    }

    // Atualiza o status do pedido
    $queryUpdate = "UPDATE pedidos 
                   SET status = 'recebido', 
                       entregador_id = :user_id 
                   WHERE id = :pedido_id";

    $stmtUpdate = $conn->prepare($queryUpdate);
    $stmtUpdate->execute([
        'pedido_id' => $pedidoId,
        'user_id' => $userId
    ]);

    // Adiciona pontos ao usuário que fez o pedido (se aplicável)
    $queryPontos = "UPDATE usuarios 
                    SET pontos = pontos + :quantidade_pontos 
                    WHERE id = :user_id";

    $pontos = floor($pedido['quantidade_lixo']); // 1 ponto por kg
    
    $stmtPontos = $conn->prepare($queryPontos);
    $stmtPontos->execute([
        'quantidade_pontos' => $pontos,
        'user_id' => $pedido['user_id']
    ]);

    $conn->commit();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($conn) {
        $conn->rollBack();
    }
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 