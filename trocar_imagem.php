<?php
session_start();
header("Content-Type: application/json");

// Conexão com o banco de dados
$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Erro na conexão com o banco de dados: " . $e->getMessage()]);
    exit();
}

// Verifica se um arquivo foi enviado
if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['imagem']['tmp_name'];
    $fileName = $_FILES['imagem']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png'];

    // Verifica se a extensão é válida
    if (in_array($fileExtension, $allowedExtensions)) {
        // Renomeia o arquivo com um nome único e define o caminho de upload
        $newFileName = uniqid() . '.' . $fileExtension;
        $uploadPath = 'uploads/profile_pics/' . $newFileName;

        // Move o arquivo para o diretório de uploads
        if (move_uploaded_file($fileTmpPath, $uploadPath)) {
            $userId = $_SESSION['user_id']; // Supondo que o ID do usuário está na sessão

            // Atualiza o caminho da imagem no banco de dados
            $sql = "UPDATE usuarios SET profile_image_path = :profile_image_path WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':profile_image_path', $uploadPath);
            $stmt->bindParam(':id', $userId);

            // Executa a atualização no banco de dados
            if ($stmt->execute()) {
                // Atualiza a sessão com o novo caminho da imagem
                $_SESSION['profile_image_path'] = $uploadPath;
                echo json_encode(["success" => true, "profile_image_path" => $uploadPath]); // Retorna o novo caminho da imagem
            } else {
                echo json_encode(["success" => false, "error" => "Erro ao atualizar imagem no banco de dados."]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "Erro ao mover o arquivo."]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Extensão de arquivo inválida."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Erro ao enviar arquivo."]);
}
