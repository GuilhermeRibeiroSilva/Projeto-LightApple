<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

// Verifica se é admin
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit;
}

// Recebe o ID do local a ser deletado
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
    exit;
}

try {
    // Primeiro, busca o caminho da imagem
    $stmt = $conn->prepare("SELECT imagem_path FROM locais WHERE id = :id");
    $stmt->bindParam(':id', $data['id']);
    $stmt->execute();
    $local = $stmt->fetch(PDO::FETCH_ASSOC);

    // Atualiza o status para 'inativo' em vez de deletar
    $sql = "UPDATE locais SET status = 'inativo' WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data['id']);
    $stmt->execute();

    // Se houver uma imagem, tenta deletá-la
    if ($local && !empty($local['imagem_path']) && file_exists($local['imagem_path'])) {
        unlink($local['imagem_path']);
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao deletar local: ' . $e->getMessage()
    ]);
}
?> 