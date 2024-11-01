<?php
session_start();

header('Content-Type: application/json'); // Definindo o tipo de resposta como JSON

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Conecta ao banco de dados
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

    // Obtém e decodifica os dados JSON recebidos
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['email']) || !isset($data['senha'])) {
        echo json_encode([
            "success" => false, 
            "error" => "Dados não recebidos ou formato inválido."
        ]);
        exit();
    }

    // Prepara e executa a consulta
    $sql = "SELECT id, senha, tipoConta FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Log para depuração (remova em produção)
        error_log("Tentativa de login - Email: " . $data['email']);
        error_log("Senha fornecida: " . $data['senha']);
        error_log("Hash da senha no banco: " . $user['senha']);
        
        $senhaCorreta = password_verify($data['senha'], $user['senha']);
        
        error_log("Resultado da verificação de senha: " . ($senhaCorreta ? "Verdadeiro" : "Falso"));

        if ($senhaCorreta) {
            $_SESSION['user_id'] = $user['id'];
            
            echo json_encode([
                "success" => true,
                "user_id" => $user['id'],
                "tipo_conta" => $user['tipoConta']
            ]);
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