<?php
// cadastrar_local.php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuário não autenticado']);
    exit;
}

// Conexão com o banco de dados
$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se recebeu os dados necessários
    if (!isset($_POST['nome']) || !isset($_POST['endereco']) || !isset($_POST['categoria']) || !isset($_FILES['imagem'])) {
        throw new Exception('Dados incompletos');
    }

    // Processa o upload da imagem
    $uploadDir = 'uploads/locais/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileExtension = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));
    $fileName = uniqid() . '.' . $fileExtension;
    $uploadFile = $uploadDir . $fileName;

    // Verifica o tipo de arquivo
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($_FILES['imagem']['type'], $allowedTypes)) {
        throw new Exception('Tipo de arquivo não permitido');
    }

    if (!move_uploaded_file($_FILES['imagem']['tmp_name'], $uploadFile)) {
        throw new Exception('Erro ao fazer upload da imagem');
    }

    // Insere os dados no banco
    $stmt = $conn->prepare("
        CREATE TABLE IF NOT EXISTS locais (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            nome VARCHAR(255) NOT NULL,
            endereco TEXT NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            imagem_path VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES usuarios(id)
        )
    ");
    $stmt->execute();

    $stmt = $conn->prepare("
        INSERT INTO locais (user_id, nome, endereco, categoria, imagem_path)
        VALUES (:user_id, :nome, :endereco, :categoria, :imagem_path)
    ");

    $stmt->execute([
        ':user_id' => $_SESSION['user_id'],
        ':nome' => $_POST['nome'],
        ':endereco' => $_POST['endereco'],
        ':categoria' => $_POST['categoria'],
        ':imagem_path' => $uploadFile
    ]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
