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
    $limit = 6;
    $offset = ($page - 1) * $limit;

    // Consulta atualizada com base nas tabelas reais
    $sql = "SELECT 
        p.id,
        p.empresa_coleta,
        u.nome as nome_cliente,
        p.local_partida,
        p.local_chegada,
        p.quantidade_lixo,
        p.valor,
        p.status,
        p.forma_pagamento,
        DATE_FORMAT(p.data_criacao, '%d/%m/%Y %H:%i') as data_hora,
        ROUND(p.valor * 0.30, 2) as valor_entregador,
        ent.nome as nome_entregador,
        CONCAT(l_partida.latitude, ',', l_partida.longitude) as coordenadas_partida,
        CONCAT(l_chegada.latitude, ',', l_chegada.longitude) as coordenadas_chegada
    FROM pedidos p
    JOIN usuarios u ON p.user_id = u.id
    JOIN pedidos_aceitos pa ON p.id = pa.pedido_id
    LEFT JOIN usuarios ent ON p.entregador_id = ent.id
    LEFT JOIN locais l_partida ON p.local_partida = l_partida.endereco
    LEFT JOIN locais l_chegada ON p.local_chegada = l_chegada.endereco
    WHERE pa.entregador_id = :user_id 
    AND p.status = 'aceito'
    ORDER BY p.data_criacao DESC
    LIMIT :limit OFFSET :offset";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total de pedidos
    $sqlCount = "SELECT COUNT(*) as total 
                 FROM pedidos p 
                 JOIN pedidos_aceitos pa ON p.id = pa.pedido_id
                 WHERE pa.entregador_id = :user_id 
                 AND p.status = 'aceito'";
    
    $stmtCount = $conn->prepare($sqlCount);
    $stmtCount->bindParam(':user_id', $_SESSION['user_id']);
    $stmtCount->execute();
    $totalPedidos = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];
    $totalPages = ceil($totalPedidos / $limit);

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
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