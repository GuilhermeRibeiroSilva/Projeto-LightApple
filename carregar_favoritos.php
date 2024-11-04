<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

try {
    $pagina = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;
    $por_pagina = 9;
    $offset = ($pagina - 1) * $por_pagina;
    $user_id = $_SESSION['user_id'] ?? 0;

    // Busca total de favoritos
    $sql_total = "SELECT COUNT(*) FROM favoritos WHERE user_id = :user_id";
    $stmt_total = $conn->prepare($sql_total);
    $stmt_total->bindValue(':user_id', $user_id, PDO::PARAM_INT);
    $stmt_total->execute();
    $total_registros = $stmt_total->fetchColumn();
    $total_paginas = ceil($total_registros / $por_pagina);

    // Busca os favoritos
    $sql = "SELECT l.*, 
            COALESCE((SELECT COUNT(*) > 0 FROM favoritos f 
                      WHERE f.local_id = l.id AND f.user_id = :user_id), 0) as favoritado
            FROM locais l
            INNER JOIN favoritos f ON l.id = f.local_id
            WHERE f.user_id = :user_id
            ORDER BY f.created_at DESC
            LIMIT :offset, :limit";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $por_pagina, PDO::PARAM_INT);
    $stmt->execute();
    
    $favoritos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'favoritos' => $favoritos,
        'paginacao' => [
            'pagina_atual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_registros' => $total_registros,
            'por_pagina' => $por_pagina
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao carregar favoritos: ' . $e->getMessage()
    ]);
}
?> 