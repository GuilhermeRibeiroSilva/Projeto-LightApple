<?php
session_start();
header('Content-Type: application/json'); // Define o tipo de conteúdo JSON

$conn = new mysqli("localhost", "root", "", "light_apple");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    // Consulta ao banco de dados para buscar o usuário pelo email
    $query = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Verifica a senha usando password_verify
        if (password_verify($senha, $user['senha'])) {
            // Armazena as informações do usuário na sessão
            $_SESSION['usuario_id'] = $user['id'];
            $_SESSION['tipo_conta'] = $user['tipoConta'];

            // Retorna o tipo de conta em JSON
            echo json_encode(['tipo_conta' => $user['tipoConta']]);
        } else {
            // Retorna mensagem de erro para senha incorreta
            echo json_encode(['error' => 'Email ou senha incorretos.']);
        }
    } else {
        // Retorna mensagem de erro para email não encontrado
        echo json_encode(['error' => 'Email ou senha incorretos.']);
    }
}
