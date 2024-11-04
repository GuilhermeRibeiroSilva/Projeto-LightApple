<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

// Verifica se é admin
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit;
}

// Recebe o ID do produto a ser deletado
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
    exit;
}

try {
    // Primeiro, busca o caminho da imagem
    $stmt = $conn->prepare("SELECT imagem_path FROM produtos WHERE id = :id");
    $stmt->bindParam(':id', $data['id']);
    $stmt->execute();
    $produto = $stmt->fetch(PDO::FETCH_ASSOC);

    // Atualiza o status para 'inativo' em vez de deletar
    $sql = "UPDATE produtos SET status = 'inativo' WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data['id']);
    $stmt->execute();

    // Se houver uma imagem, tenta deletá-la
    if ($produto && !empty($produto['imagem_path']) && file_exists($produto['imagem_path'])) {
        unlink($produto['imagem_path']);
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao deletar produto: ' . $e->getMessage()
    ]);
}
?> 