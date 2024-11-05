<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    // Buscar pedidos que ainda não foram aceitos por nenhum entregador
    $sql = "SELECT 
                p.id,
                p.empresa_coleta,
                u.nome as nome_cliente,
                p.local_partida,
                p.local_chegada,
                p.quantidade_lixo,
                p.valor,
                p.status
            FROM pedidos p
            JOIN usuarios u ON p.user_id = u.id
            WHERE p.status = 'pendente' 
            AND p.entregador_id IS NULL
            ORDER BY p.data_criacao DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular valor do entregador (30% do valor total)
    foreach ($pedidos as &$pedido) {
        $pedido['valor_entregador'] = number_format($pedido['valor'] * 0.30, 2, '.', '');
    }

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar pedidos: ' . $e->getMessage()
    ]);
}
?> 