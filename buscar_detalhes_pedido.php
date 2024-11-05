<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit;
}

try {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    // Buscar informações do pedido
    $sql = "SELECT 
                c.id,
                c.total_pontos,
                c.data_compra,
                COALESCE(c.status, 'pendente') as status,
                u.nome as nome_cliente
            FROM compras c
            JOIN usuarios u ON c.user_id = u.id
            WHERE c.id = :id";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute([':id' => $id]);
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$pedido) {
        throw new Exception('Pedido não encontrado');
    }
    
    // Buscar itens do pedido (corrigido para usar a estrutura correta da tabela)
    $sql_itens = "SELECT 
                    ic.nome_produto,
                    ic.pontos
                FROM itens_compra ic
                WHERE ic.compra_id = :compra_id";
                
    $stmt_itens = $conn->prepare($sql_itens);
    $stmt_itens->execute([':compra_id' => $id]);
    $itens = $stmt_itens->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatar resposta com verificação de status
    $resposta = [
        'success' => true,
        'id' => $pedido['id'],
        'numero' => sprintf('TRC%06d', $pedido['id']),
        'nome_cliente' => $pedido['nome_cliente'],
        'pontos_total' => $pedido['total_pontos'],
        'data_compra' => $pedido['data_compra'],
        'status' => $pedido['status'] ?? 'pendente', // Valor padrão caso status seja null
        'itens' => $itens
    ];
    
    echo json_encode($resposta);

} catch (Exception $e) {
    error_log('Erro em buscar_detalhes_pedido.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar detalhes do pedido: ' . $e->getMessage()
    ]);
}
?> 