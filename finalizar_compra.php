<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $_SESSION['user_id'];
    
    // Inicia a transação
    $conn->beginTransaction();
    
    // Busca pontos atuais do usuário
    $stmt = $conn->prepare("SELECT pontos FROM usuarios WHERE id = ?");
    $stmt->execute([$userId]);
    $pontosAtuais = $stmt->fetchColumn();
    
    // Calcula total de pontos necessários
    $totalPontos = 0;
    foreach ($data['items'] as $item) {
        $totalPontos += intval(str_replace(' P', '', $item['points']));
    }
    
    // Verifica se usuário tem pontos suficientes
    if ($pontosAtuais < $totalPontos) {
        throw new Exception('Pontos insuficientes para realizar a compra');
    }
    
    // Atualiza pontos do usuário
    $novosPontos = $pontosAtuais - $totalPontos;
    $stmt = $conn->prepare("UPDATE usuarios SET pontos = ? WHERE id = ?");
    $stmt->execute([$novosPontos, $userId]);
    
    // Registra a compra
    $stmt = $conn->prepare("INSERT INTO compras (user_id, total_pontos, data_compra) VALUES (?, ?, NOW())");
    $stmt->execute([$userId, $totalPontos]);
    $compraId = $conn->lastInsertId();
    
    // Registra os itens da compra
    $stmt = $conn->prepare("INSERT INTO itens_compra (compra_id, nome_produto, pontos) VALUES (?, ?, ?)");
    foreach ($data['items'] as $item) {
        $stmt->execute([
            $compraId,
            $item['name'],
            intval(str_replace(' P', '', $item['points']))
        ]);
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'newPoints' => $novosPontos,
        'message' => 'Compra realizada com sucesso!'
    ]);
    
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 