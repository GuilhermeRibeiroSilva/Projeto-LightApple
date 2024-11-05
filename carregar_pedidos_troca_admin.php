<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit;
}

try {
    $sql = "SELECT 
                c.id,
                c.total_pontos,
                c.data_compra,
                c.status,
                u.nome as nome_cliente
            FROM compras c
            JOIN usuarios u ON c.user_id = u.id
            ORDER BY c.data_compra DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatar pedidos
    $pedidos_formatados = array_map(function($pedido) {
        return [
            'id' => $pedido['id'],
            'numero' => sprintf('TRC%06d', $pedido['id']),
            'nome_cliente' => $pedido['nome_cliente'],
            'pontos_total' => $pedido['total_pontos'],
            'data_compra' => $pedido['data_compra'],
            'status' => $pedido['status'] ?? 'pendente'
        ];
    }, $pedidos);
    
    echo json_encode($pedidos_formatados);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar pedidos: ' . $e->getMessage()
    ]);
}
?> 