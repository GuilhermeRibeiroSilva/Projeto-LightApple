<?php
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "light_apple";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        echo json_encode([
            "success" => false, 
            "error" => "Conexão falhou: " . $conn->connect_error
        ]);
        exit();
    }

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['email']) || !isset($data['senha'])) {
        echo json_encode([
            "success" => false, 
            "error" => "Dados não recebidos ou formato inválido."
        ]);
        exit();
    }

    $sql = "SELECT id, senha, tipoConta, is_admin FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        if (password_verify($data['senha'], $user['senha'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['is_admin'] = $user['is_admin'] ?? false;
            
            if ($user['is_admin']) {
                echo json_encode([
                    "success" => true,
                    "user_id" => $user['id'],
                    "tipo_conta" => "admin",
                    "redirect" => "TelaAdmin.php"
                ]);
            } else {
                echo json_encode([
                    "success" => true,
                    "user_id" => $user['id'],
                    "tipo_conta" => $user['tipoConta']
                ]);
            }
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Senha incorreta."
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Usuário não encontrado."
        ]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode([
        "success" => false,
        "error" => "Método de requisição inválido."
    ]);
}