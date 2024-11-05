<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    // Buscar pedidos disponíveis
    $sqlDisponiveis = "SELECT 
        p.id,
        p.empresa_coleta,
        u.nome as nome_cliente,
        p.local_partida,
        p.local_chegada,
        p.quantidade_lixo,
        p.valor,
        p.status,
        p.data_criacao as data_pedido
    FROM pedidos p
    JOIN usuarios u ON p.user_id = u.id
    LEFT JOIN pedidos_rejeitados pr ON p.id = pr.pedido_id AND pr.entregador_id = :user_id
    WHERE p.status = 'pendente' 
    AND p.entregador_id IS NULL
    AND pr.id IS NULL
    ORDER BY p.data_criacao DESC";
    
    $stmtDisponiveis = $conn->prepare($sqlDisponiveis);
    $stmtDisponiveis->bindParam(':user_id', $_SESSION['user_id']);
    $stmtDisponiveis->execute();
    $pedidosDisponiveis = $stmtDisponiveis->fetchAll(PDO::FETCH_ASSOC);

    // Buscar pedidos aceitos pelo entregador atual
    $sqlAceitos = "SELECT 
        p.id,
        p.empresa_coleta,
        u.nome as nome_cliente,
        p.local_partida,
        p.local_chegada,
        p.quantidade_lixo,
        p.valor,
        p.status,
        p.data_criacao as data_pedido
    FROM pedidos p
    JOIN usuarios u ON p.user_id = u.id
    WHERE p.status = 'aceito' 
    AND p.entregador_id = :user_id
    ORDER BY p.data_criacao DESC";
    
    $stmtAceitos = $conn->prepare($sqlAceitos);
    $stmtAceitos->bindParam(':user_id', $_SESSION['user_id']);
    $stmtAceitos->execute();
    $pedidosAceitos = $stmtAceitos->fetchAll(PDO::FETCH_ASSOC);

    // Calcular valor do entregador para ambos os tipos de pedidos
    foreach ($pedidosDisponiveis as &$pedido) {
        $pedido['valor_entregador'] = number_format($pedido['valor'] * 0.30, 2, '.', '');
    }
    
    foreach ($pedidosAceitos as &$pedido) {
        $pedido['valor_entregador'] = number_format($pedido['valor'] * 0.30, 2, '.', '');
    }

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidosDisponiveis,
        'pedidos_aceitos' => $pedidosAceitos
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar pedidos: ' . $e->getMessage()
    ]);
}
?> 