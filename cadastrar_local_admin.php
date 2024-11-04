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
    if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/locais/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_extension = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));
        $new_file_name = uniqid() . '.' . $file_extension;
        $upload_path = $upload_dir . $new_file_name;
        
        if (move_uploaded_file($_FILES['imagem']['tmp_name'], $upload_path)) {
            $imagem_path = $upload_path;
        }
    }

    $sql = "INSERT INTO locais (
        nome, 
        categoria, 
        endereco, 
        latitude, 
        longitude, 
        imagem_path,
        limite_coleta,
        status
    ) VALUES (
        :nome,
        :categoria,
        :endereco,
        :latitude,
        :longitude,
        :imagem_path,
        :limite_coleta,
        'ativo'
    )";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':nome' => $_POST['nome'],
        ':categoria' => $_POST['categoria'],
        ':endereco' => $_POST['endereco'],
        ':latitude' => $_POST['latitude'],
        ':longitude' => $_POST['longitude'],
        ':imagem_path' => $imagem_path,
        ':limite_coleta' => $_POST['categoria'] === 'empresa de coleta' ? $_POST['limite_coleta'] : null
    ]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 