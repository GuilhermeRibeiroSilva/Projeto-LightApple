<?php
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

$userId = $_SESSION['user_id']; // ID do usuário logado

// Conexão com o banco de dados
$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ajuste a consulta para usar a coluna 'id' como identificador do pedido
    $stmt = $conn->prepare("
        SELECT ec.id, ec.pedido_id, ec.data_entrega, ec.status_confirmacao, 
               p.id AS pedido_id, p.empresa_coleta, p.local_partida, p.local_chegada, p.quantidade_lixo, p.data_criacao
        FROM entregas_concluidas ec
        JOIN pedidos p ON ec.pedido_id = p.id
        WHERE ec.entregador_id = :entregador_id
    ");
    $stmt->bindParam(':entregador_id', $userId);
    $stmt->execute();
    $entregas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'entregas' => $entregas]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?> 