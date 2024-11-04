<?php
session_start();
require_once 'conexao.php';

// Verificar se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

// Receber dados do pedido
$data = json_decode(file_get_contents('php://input'), true);

try {
    // Iniciar transação
    $conn->beginTransaction();

    // Inserir pedido
    $stmt = $conn->prepare("
        INSERT INTO pedidos (
            user_id,
            empresa_coleta,
            forma_pagamento,
            quantidade_lixo,
            local_partida,
            local_chegada,
            valor,
            frete,
            valor_total,
            status,
            data_criacao
        ) VALUES (
            :user_id,
            :empresa_coleta,
            :forma_pagamento,
            :quantidade_lixo,
            :local_partida,
            :local_chegada,
            :valor,
            :frete,
            :valor_total,
            'pendente',
            NOW()
        )
    ");

    $stmt->execute([
        'user_id' => $_SESSION['user_id'],
        'empresa_coleta' => $data['empresa_coleta'],
        'forma_pagamento' => $data['forma_pagamento'],
        'quantidade_lixo' => $data['quantidade_lixo'],
        'local_partida' => $data['local_partida'],
        'local_chegada' => $data['local_chegada'],
        'valor' => $data['valor'],
        'frete' => $data['frete'],
        'valor_total' => $data['valor_total']
    ]);

    // Commit da transação
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Pedido criado com sucesso',
        'pedido_id' => $conn->lastInsertId()
    ]);

} catch (PDOException $e) {
    // Rollback em caso de erro
    $conn->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar pedido: ' . $e->getMessage()
    ]);
}
?> 