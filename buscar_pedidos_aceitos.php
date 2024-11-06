<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 2; // 2 pedidos por página
    $offset = ($page - 1) * $limit;

    $sql = "SELECT 
        p.id,
        p.empresa_coleta,
        u.nome as nome_cliente,
        p.quantidade_lixo,
        p.valor as valor_entregador,
        p.status,
        p.forma_pagamento,
        DATE_FORMAT(p.data_criacao, '%d/%m/%Y %H:%i') as data_hora,
        u.endereco as endereco_partida,
        l.endereco as endereco_chegada,
        l.latitude as lat_chegada,
        l.longitude as lng_chegada
    FROM pedidos p
    JOIN usuarios u ON p.user_id = u.id
    LEFT JOIN locais l ON p.local_chegada = l.id
    WHERE p.entregador_id = :user_id 
    AND p.status = 'aceito'
    ORDER BY p.data_criacao DESC
    LIMIT :limit OFFSET :offset";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Processa os pedidos para incluir as coordenadas
    foreach ($pedidos as &$pedido) {
        $pedido['end'] = [
            'lat' => floatval($pedido['lat_chegada']),
            'lng' => floatval($pedido['lng_chegada']),
            'endereco' => $pedido['endereco_chegada']
        ];
        
        $pedido['start'] = [
            'endereco' => $pedido['endereco_partida']
        ];
    }

    // Conta o total de pedidos
    $sqlCount = "SELECT COUNT(*) as total FROM pedidos 
                 WHERE entregador_id = :user_id AND status = 'aceito'";
    $stmtCount = $conn->prepare($sqlCount);
    $stmtCount->bindParam(':user_id', $_SESSION['user_id']);
    $stmtCount->execute();
    $totalPedidos = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => ceil($totalPedidos / $limit),
            'total_pedidos' => $totalPedidos
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar pedidos: ' . $e->getMessage()
    ]);
}
?> 