<?php
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $por_pagina = 9;
    $offset = ($pagina - 1) * $por_pagina;
    
    $where_conditions = ['1=1']; // Sempre verdadeiro para começar
    $params = [];

    // Filtro de pesquisa
    if (!empty($_GET['search'])) {
        $where_conditions[] = "(p.numero LIKE :search OR c.numero LIKE :search)";
        $params[':search'] = "%{$_GET['search']}%";
    }

    // Filtro de status
    if (!empty($_GET['status']) && $_GET['status'] !== 'todos') {
        $where_conditions[] = "(p.status = :status OR c.status = :status)";
        $params[':status'] = $_GET['status'];
    }

    // Filtro de tipo
    if (!empty($_GET['tipo'])) {
        if ($_GET['tipo'] === 'coleta') {
            $where_conditions[] = "p.id IS NOT NULL";
        } elseif ($_GET['tipo'] === 'troca') {
            $where_conditions[] = "c.id IS NOT NULL";
        }
    }

    // Filtro de data
    if (!empty($_GET['data'])) {
        $where_conditions[] = "(DATE(p.data_pedido) = :data OR DATE(c.data_compra) = :data)";
        $params[':data'] = $_GET['data'];
    }

    $where_clause = implode(' AND ', $where_conditions);

    // Query para pedidos de coleta e troca
    $sql = "SELECT 
                COALESCE(p.id, c.id) as id,
                COALESCE(p.numero, c.numero) as numero,
                CASE 
                    WHEN p.id IS NOT NULL THEN 'coleta'
                    ELSE 'troca'
                END as tipo,
                p.empresa_coleta,
                p.local_partida,
                p.local_chegada,
                p.quantidade_lixo,
                p.data_pedido,
                p.entregador,
                p.forma_pagamento,
                p.valor,
                c.pontos_total,
                COALESCE(p.status, c.status) as status,
                u.nome as nome_cliente
            FROM (
                SELECT * FROM pedidos WHERE user_id = :user_id
                UNION ALL
                SELECT * FROM compras WHERE user_id = :user_id
            ) combined
            LEFT JOIN pedidos p ON combined.id = p.id
            LEFT JOIN compras c ON combined.id = c.id
            LEFT JOIN usuarios u ON COALESCE(p.user_id, c.user_id) = u.id
            WHERE $where_clause
            ORDER BY COALESCE(p.data_pedido, c.data_compra) DESC
            LIMIT :offset, :limit";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $por_pagina, PDO::PARAM_INT);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->execute();
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total de registros para paginação
    $stmt = $conn->prepare(str_replace('SELECT *', 'SELECT COUNT(*) as total', $sql));
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos,
        'paginacao' => [
            'pagina_atual' => $pagina,
            'total_paginas' => ceil($total / $por_pagina),
            'total_registros' => $total
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar pedidos: ' . $e->getMessage()
    ]);
}
?> 