<?php
session_start();
$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

header("Content-Type: application/json");

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se o usuário está logado
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "error" => "Usuário não autenticado."]);
        exit();
    }

    // Obtém os dados da solicitação
    $data = json_decode(file_get_contents("php://input"));

    // Verifica se os dados foram recebidos corretamente
    if (empty($data->novaSenha)) {
        echo json_encode(["success" => false, "error" => "Dados não recebidos ou formato inválido."]);
        exit();
    }

    $userId = $_SESSION['user_id']; // Usando o ID do usuário da sessão
    $novaSenha = password_hash($data->novaSenha, PASSWORD_DEFAULT); // Criptografa a nova senha

    // Atualiza a senha no banco de dados
    $stmt = $conn->prepare("UPDATE usuarios SET senha = :senha WHERE id = :id");
    $stmt->bindParam(':senha', $novaSenha);
    $stmt->bindParam(':id', $userId);
    $stmt->execute();

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
