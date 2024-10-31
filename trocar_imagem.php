<?php
session_start();
header("Content-Type: application/json"); // Define o cabeçalho JSON

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

// Verificar se um arquivo foi enviado
if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['imagem']['tmp_name'];
    $fileName = $_FILES['imagem']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png'];

    if (in_array($fileExtension, $allowedExtensions)) {
        $newFileName = uniqid() . '.' . $fileExtension;
        $uploadPath = 'uploads/profile_pics/' . $newFileName;

        if (move_uploaded_file($fileTmpPath, $uploadPath)) {
            $userId = $_SESSION['user_id'];
            
            $sql = "UPDATE usuarios SET profile_pic = :profile_pic WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':profile_pic', $uploadPath);
            $stmt->bindParam(':id', $userId);
            
            if ($stmt->execute()) {
                $_SESSION['profile_pic'] = $uploadPath;
                echo json_encode(["success" => true, "nova_imagem" => $uploadPath]);
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
