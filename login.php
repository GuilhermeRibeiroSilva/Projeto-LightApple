<?php
session_start(); // Inicia a sessão

// Verifica se o método de requisição é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Conecte-se ao banco de dados (ajuste as credenciais conforme necessário)
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "light_apple";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Verifica se a conexão foi bem-sucedida
    if ($conn->connect_error) {
        echo json_encode(["success" => false, "error" => "Conexão falhou: " . $conn->connect_error]);
        exit();
    }

    // Obtém os dados do JSON
    $data = json_decode(file_get_contents('php://input'), true); // Converte o JSON para array associativo

    // Verifica se os dados foram recebidos corretamente
    if (!$data || !isset($data['email']) || !isset($data['senha'])) {
        echo json_encode(["success" => false, "error" => "Dados não recebidos ou formato inválido."]);
        exit();
    }

    // Obtém os dados do formulário
    $email = $conn->real_escape_string($data['email']); // Supondo que o formulário tenha um campo de email
    $senha = $data['senha']; // Supondo que o formulário tenha um campo de senha

    // Consulta SQL para buscar o usuário e o tipo de conta
    $sql = "SELECT id, senha, tipoConta FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    
    // Verifica se o usuário foi encontrado
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $hashed_password, $tipoConta);
        $stmt->fetch();

        // Verifica a senha
        if (password_verify($senha, $hashed_password)) {
            // Senha correta, armazena o ID do usuário na sessão
            $_SESSION['user_id'] = $id;

            // Retorna resposta JSON com sucesso e o tipo de conta
            echo json_encode(["success" => true, "user_id" => $id, "tipo_conta" => $tipoConta]);
            exit();
        } else {
            // Senha incorreta
            echo json_encode(["success" => false, "error" => "Senha incorreta."]);
        }
    } else {
        // Usuário não encontrado
        echo json_encode(["success" => false, "error" => "Usuário não encontrado."]);
    }

    // Fecha a conexão
    $stmt->close();
    $conn->close();
} else {
    // Se o método não for POST
    echo json_encode(["success" => false, "error" => "Método de requisição inválido."]);
}
