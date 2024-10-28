<?php
session_start();
header("Content-Type: application/json"); // Define o cabeçalho JSON para garantir que a resposta seja no formato correto

// Conexão com o banco de dados
$conn = new mysqli("localhost", "root", "", "light_apple");

// Verifica se a conexão foi estabelecida
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Falha na conexão com o banco de dados: " . $conn->connect_error]);
    exit();
}

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verifica se o ID do usuário foi passado
    if (!isset($_GET['id'])) {
        echo json_encode(["success" => false, "error" => "ID do usuário não fornecido."]);
        exit();
    }

    $userId = $_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);

    // Verifica se os dados foram recebidos corretamente
    if (!$data) {
        echo json_encode(["success" => false, "error" => "Dados não recebidos ou formato inválido."]);
        exit();
    }

    // Prepara e escapa os dados recebidos
    $nome = $conn->real_escape_string($data['nome'] ?? '');
    $cpf = $conn->real_escape_string($data['cpf'] ?? '');
    $dataNascimento = $conn->real_escape_string($data['dataNascimento'] ?? '');
    $telefone = $conn->real_escape_string($data['telefone'] ?? '');
    $endereco = $conn->real_escape_string($data['endereco'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $tipoConta = $conn->real_escape_string($data['tipoConta'] ?? '');

    // Prepara a consulta para atualização
    $sql = "UPDATE usuarios SET nome = ?, cpf = ?, dataNascimento = ?, telefone = ?, endereco = ?, email = ?, tipoConta = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode(["success" => false, "error" => "Erro na preparação da consulta: " . $conn->error]);
        exit();
    }

    // Liga os parâmetros e executa a consulta
    $stmt->bind_param("sssssssi", $nome, $cpf, $dataNascimento, $telefone, $endereco, $email, $tipoConta, $userId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Erro ao atualizar o perfil: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Método de requisição inválido."]);
}

$conn->close();
