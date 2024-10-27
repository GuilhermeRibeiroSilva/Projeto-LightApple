<?php
// Conectar ao banco de dados
$conn = new mysqli("servidor", "usuario", "senha", "banco_de_dados");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);

    // Escapa os dados para evitar SQL Injection
    $nome = $conn->real_escape_string($data['nome']);
    $cpf = $conn->real_escape_string($data['cpf']);
    $data_nascimento = $conn->real_escape_string($data['data_nascimento']);
    $telefone = $conn->real_escape_string($data['telefone']);
    $endereco = $conn->real_escape_string($data['endereco']);
    $email = $conn->real_escape_string($data['email']);
    $tipo_conta = $conn->real_escape_string($data['tipo_conta']);

    $sql = "UPDATE usuarios SET nome = ?, cpf = ?, data_nascimento = ?, telefone = ?, endereco = ?, email = ?, tipo_conta = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssi", $nome, $cpf, $data_nascimento, $telefone, $endereco, $email, $tipo_conta, $userId);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Erro ao atualizar dados."]);
    }
    
    $stmt->close();
}
$conn->close();

