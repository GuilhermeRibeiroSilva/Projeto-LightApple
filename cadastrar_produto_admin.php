<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

// Verifica se é admin
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit;
}

try {
    // Processar upload da imagem
    $imagem_path = null;
    if (isset($_FILES['imagem_produto']) && $_FILES['imagem_produto']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/produtos/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_extension = strtolower(pathinfo($_FILES['imagem_produto']['name'], PATHINFO_EXTENSION));
        $new_file_name = uniqid() . '.' . $file_extension;
        $upload_path = $upload_dir . $new_file_name;

        if (move_uploaded_file($_FILES['imagem_produto']['tmp_name'], $upload_path)) {
            $imagem_path = $upload_path;
        }
    }

    $sql = "INSERT INTO produtos (
        nome,
        pontos,
        imagem_path,
        status
    ) VALUES (
        :nome,
        :pontos,
        :imagem_path,
        'ativo'
    )";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':nome' => $_POST['nome_produto'],
        ':pontos' => $_POST['pontos'],
        ':imagem_path' => $imagem_path
    ]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 