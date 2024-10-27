<?php
// Conectar ao banco de dados
$conn = new mysqli("servidor", "usuario", "senha", "banco_de_dados");

if (isset($_GET['id'])) {
    $userId = $_GET['id'];

    $sql = "SELECT nome, cpf, data_nascimento, telefone, endereco, email, tipo_conta FROM usuarios WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();
        echo json_encode(["success" => true, "usuario" => $usuario]);
    } else {
        echo json_encode(["success" => false, "error" => "Erro ao buscar dados."]);
    }
    
    $stmt->close();
}
$conn->close();
