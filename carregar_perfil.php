<?php
session_start();

// Conectar ao banco de dados
$conn = new mysqli("localhost", "root", "", "light_apple");

// Verifica a conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Obtém o ID do usuário da sessão ou do parâmetro GET
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : (isset($_GET['id']) ? $_GET['id'] : null);

if ($userId) {
    // Consulta ao banco de dados para buscar os dados do usuário
    $query = "SELECT nome, cpf, dataNascimento, telefone, endereco, email, tipoConta FROM usuarios WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();
        
        // Retorna os dados do usuário em formato JSON
        echo json_encode(["success" => true, "usuario" => $usuario]);
    } else {
        echo json_encode(["success" => false, "error" => "Erro ao buscar dados."]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "ID do usuário não encontrado."]);
}

// Fecha a conexão
$conn->close();
