<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

try {
    $pagina = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;
    $por_pagina = 9;
    $offset = ($pagina - 1) * $por_pagina;
    $user_id = $_SESSION['user_id'] ?? 0;

    // Busca total de registros (todos os tipos)
    $sql_total = "SELECT COUNT(*) FROM locais 
                  WHERE (categoria = 'estabelecimentos' 
                        OR categoria = 'empresa de coleta' 
                        OR categoria = 'condominios') 
                  AND status = 'ativo'";
    $stmt_total = $conn->query($sql_total);
    $total_registros = $stmt_total->fetchColumn();
    $total_paginas = ceil($total_registros / $por_pagina);

    // Busca todos os tipos de locais
    $sql = "SELECT l.*, l.latitude, l.longitude,
            COALESCE((SELECT COUNT(*) > 0 FROM favoritos f 
                      WHERE f.local_id = l.id AND f.user_id = :user_id), 0) as favoritado
            FROM locais l
            WHERE (l.categoria = 'estabelecimentos' 
                  OR l.categoria = 'empresa de coleta' 
                  OR l.categoria = 'condominios')
            AND l.status = 'ativo'
            ORDER BY l.created_at DESC
            LIMIT :offset, :limit";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $por_pagina, PDO::PARAM_INT);
    $stmt->execute();
    
    $locais = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'locais' => $locais,
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
        'error' => 'Erro ao carregar locais: ' . $e->getMessage()
    ]);
}
?> 