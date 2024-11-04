<?php
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validar formato da data (MM/AA)
if (!preg_match('/^(0[1-9]|1[0-2])\/([0-9]{2})$/', $data['data_validade'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato de data inválido']);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO cartoes_credito (
            user_id, 
            nome_titular, 
            numero_cartao, 
            data_validade, 
            cvv
        ) VALUES (
            :user_id,
            :nome_titular,
            :numero_cartao,
            :data_validade,
            :cvv
        )
    ");
    
    $stmt->execute([
        'user_id' => $_SESSION['user_id'],
        'nome_titular' => $data['nome_titular'],
        'numero_cartao' => $data['numero_cartao'],
        'data_validade' => $data['data_validade'],
        'cvv' => $data['cvv']
    ]);
    
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 