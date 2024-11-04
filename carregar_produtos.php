<?php
session_start();
require_once 'conexao.php';

try {
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $itens_por_pagina = 9;
    $offset = ($pagina - 1) * $itens_por_pagina;

    // Buscar total de produtos
    $stmt = $conn->query("SELECT COUNT(*) FROM produtos WHERE status = 'ativo'");
    $total_produtos = $stmt->fetchColumn();
    $total_paginas = ceil($total_produtos / $itens_por_pagina);

    // Buscar produtos da página atual
    $stmt = $conn->prepare("SELECT * FROM produtos 
                           WHERE status = 'ativo' 
                           ORDER BY created_at DESC 
                           LIMIT :offset, :limit");
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $itens_por_pagina, PDO::PARAM_INT);
    $stmt->execute();
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'produtos' => $produtos,
        'paginacao' => [
            'pagina_atual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_produtos' => $total_produtos
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar produtos: ' . $e->getMessage()
    ]);
}
?> 