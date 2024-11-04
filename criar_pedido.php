<?php
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $conn->beginTransaction();

    // Gerar número do pedido único
    $numeroPedido = date('Ymd') . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
    
    $stmt = $conn->prepare("INSERT INTO pedidos (numero_pedido, user_id, empresa_id, forma_pagamento_id, quantidade_lixo, 
        local_partida, local_chegada, valor, frete, valor_total, data_pedido) 
        VALUES (:numero_pedido, :user_id, :empresa_id, :forma_pagamento_id, :quantidade_lixo, 
        :local_partida, :local_chegada, :valor, :frete, :valor_total, NOW())");
    
    $stmt->execute([
        'numero_pedido' => $numeroPedido,
        'user_id' => $_SESSION['user_id'],
        'empresa_id' => $data['empresa'],
        'forma_pagamento_id' => $data['formaPagamento'],
        'quantidade_lixo' => $data['quantidadeLixo'],
        'local_partida' => $data['localPartida'],
        'local_chegada' => $data['localChegada'],
        'valor' => $data['valor'],
        'frete' => $data['frete'],
        'valor_total' => $data['valorTotal']
    ]);

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'numeroPedido' => $numeroPedido,
        'dataPedido' => date('d/m/Y H:i:s')
    ]);
} catch (PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 