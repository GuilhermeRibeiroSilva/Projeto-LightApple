<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // Desativa a exibição de erros no output
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
    $user_id = $_SESSION['user_id'];
    
    // Construir a query base
    $where_conditions = ['p.user_id = :user_id'];
    $params = [':user_id' => $user_id];

    // Aplicar filtro de busca
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $search = trim($_GET['search']);
        $where_conditions[] = "(
            p.id LIKE :search 
            OR p.empresa_coleta LIKE :search
            OR CONCAT('COL', LPAD(p.id, 6, '0')) LIKE :search
            OR CONCAT('TRC', LPAD(p.id, 6, '0')) LIKE :search
        )";
        $params[':search'] = "%$search%";
    }

    // Aplicar filtro de status
    if (isset($_GET['status']) && $_GET['status'] !== 'todos') {
        $where_conditions[] = "p.status = :status";
        $params[':status'] = $_GET['status'];
    }

    // Aplicar filtro de tipo
    if (isset($_GET['tipo']) && $_GET['tipo'] !== 'todos') {
        // Este filtro será aplicado na união das queries
        $tipo_filtro = $_GET['tipo'];
    }

    // Aplicar filtro de data
    if (isset($_GET['data']) && !empty($_GET['data'])) {
        $data = $_GET['data'];
        $where_conditions[] = "DATE(p.data_criacao) = :data";
        $params[':data'] = $data;
    }

    // Primeiro, vamos contar o total de registros
    $sql_count = "
        SELECT COUNT(*) as total FROM (
            SELECT id FROM pedidos WHERE user_id = :user_id
            UNION ALL
            SELECT id FROM compras WHERE user_id = :user_id
        ) as combined_results";
    
    $stmt_count = $conn->prepare($sql_count);
    $stmt_count->execute([':user_id' => $user_id]);
    $total = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Query para pedidos de coleta
    $sql_coleta = "
        SELECT 
            p.id,
            'coleta' as tipo,
            p.empresa_coleta,
            p.quantidade_lixo,
            p.local_partida,
            p.local_chegada,
            p.valor,
            p.frete,
            p.valor_total,
            p.status,
            p.data_criacao as data_pedido,
            p.forma_pagamento,
            u.nome as nome_cliente,
            e.tipo as entregador_tipo,
            ue.nome as entregador_nome,
            NULL as total_pontos
        FROM pedidos p
        JOIN usuarios u ON p.user_id = u.id
        LEFT JOIN entregadores e ON p.entregador_id = e.id
        LEFT JOIN usuarios ue ON e.user_id = ue.id
        WHERE " . implode(' AND ', $where_conditions);

    // Query para pedidos de troca
    $sql_troca = "
        SELECT 
            c.id,
            'troca' as tipo,
            NULL as empresa_coleta,
            NULL as quantidade_lixo,
            NULL as local_partida,
            NULL as local_chegada,
            NULL as valor,
            NULL as frete,
            NULL as valor_total,
            COALESCE(c.status, 'pendente') as status,
            c.data_compra as data_pedido,
            NULL as forma_pagamento,
            u.nome as nome_cliente,
            NULL as entregador_tipo,
            NULL as entregador_nome,
            c.total_pontos
        FROM compras c
        JOIN usuarios u ON c.user_id = u.id
        WHERE " . str_replace('p.', 'c.', implode(' AND ', $where_conditions));

    // Ajustar condição de data para compras
    $where_conditions_troca = str_replace('p.data_criacao', 'c.data_compra', $where_conditions);

    // Combinar as queries
    if (!isset($_GET['tipo']) || $_GET['tipo'] === 'todos') {
        $sql = "($sql_coleta) UNION ALL ($sql_troca)";
    } else if ($_GET['tipo'] === 'coleta') {
        $sql = $sql_coleta;
    } else {
        $sql = $sql_troca;
    }

    $sql .= " ORDER BY data_pedido DESC LIMIT :offset, :por_pagina";

    // Executar a query principal
    $stmt = $conn->prepare($sql);
    foreach ($params as $key => $value) {
        if (strpos($key, 'data') !== false) {
            $stmt->bindValue($key, $value);
        } else if (is_int($value)) {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
    }
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':por_pagina', $por_pagina, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception('Erro ao executar a query: ' . implode(' ', $stmt->errorInfo()));
    }
    
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatar pedidos para o frontend
    $pedidos_formatados = array_map(function($pedido) use ($conn) {
        if ($pedido['tipo'] === 'coleta') {
            return [
                'id' => $pedido['id'],
                'numero' => sprintf('COL%06d', $pedido['id']),
                'tipo' => 'coleta',
                'empresa_coleta' => $pedido['empresa_coleta'],
                'quantidade_lixo' => $pedido['quantidade_lixo'],
                'local_partida' => $pedido['local_partida'],
                'local_chegada' => $pedido['local_chegada'],
                'data_pedido' => $pedido['data_pedido'],
                'forma_pagamento' => $pedido['forma_pagamento'],
                'valor' => $pedido['valor'] ? number_format($pedido['valor'], 2, ',', '.') : '0,00',
                'frete' => $pedido['frete'] ? number_format($pedido['frete'], 2, ',', '.') : '0,00',
                'valor_total' => $pedido['valor_total'] ? number_format($pedido['valor_total'], 2, ',', '.') : '0,00',
                'status' => $pedido['status'] ?? 'pendente',
                'nome_cliente' => $pedido['nome_cliente'],
                'entregador' => $pedido['entregador_nome'] ? [
                    'nome' => $pedido['entregador_nome'],
                    'tipo' => $pedido['entregador_tipo']
                ] : null
            ];
        } else {
            try {
                $stmt_itens = $conn->prepare("
                    SELECT nome_produto, pontos 
                    FROM itens_compra 
                    WHERE compra_id = :compra_id
                ");
                $stmt_itens->execute(['compra_id' => $pedido['id']]);
                $itens = $stmt_itens->fetchAll(PDO::FETCH_ASSOC);

                return [
                    'id' => $pedido['id'],
                    'numero' => sprintf('TRC%06d', $pedido['id']),
                    'tipo' => 'troca',
                    'pontos_total' => $pedido['total_pontos'],
                    'data_compra' => $pedido['data_pedido'],
                    'status' => $pedido['status'] ?? 'pendente',
                    'nome_cliente' => $pedido['nome_cliente'],
                    'itens' => $itens
                ];
            } catch (PDOException $e) {
                error_log('Erro ao buscar itens da compra: ' . $e->getMessage());
                return null;
            }
        }
    }, $pedidos);

    // Filtrar pedidos nulos
    $pedidos_formatados = array_filter($pedidos_formatados);

    $response = [
        'success' => true,
        'pedidos' => array_values($pedidos_formatados), // Reindexar array
        'paginacao' => [
            'pagina_atual' => $pagina,
            'total_paginas' => ceil($total / $por_pagina),
            'total_registros' => $total
        ]
    ];

    echo json_encode($response, JSON_THROW_ON_ERROR);

} catch (Exception $e) {
    error_log('Erro no buscar_pedidos.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar pedidos: ' . $e->getMessage()
    ], JSON_THROW_ON_ERROR);
}
?> 