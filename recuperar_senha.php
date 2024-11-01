<?php
// Conexão com o banco de dados
$conn = new mysqli("localhost", "root", "", "light_apple");

header('Content-Type: application/json'); // Define o tipo de conteúdo como JSON

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];

    // Verifica se o e-mail existe no banco de dados
    $query = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Código para enviar o e-mail de recuperação de senha
        $token = bin2hex(random_bytes(50)); // Gera um token único
        $reset_link = "https://seudominio.com/redefinir_senha.php?token=" . $token;

        // Atualize o banco com o token (exemplo: insira o token no registro do usuário)
        $query = "UPDATE usuarios SET token_senha = ? WHERE email = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $token, $email);
        $stmt->execute();

        // Envio de e-mail
        mail($email, "Recuperação de senha", "Clique no link para redefinir sua senha: " . $reset_link);
        echo json_encode(["success" => true, "message" => "Um e-mail foi enviado com instruções para recuperar sua senha."]);
    } else {
        echo json_encode(["success" => false, "error" => "E-mail não encontrado."]);
    }
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Senha</title>
</head>
<body>
    <form action="recuperar_senha.php" method="post">
        <label for="email">Digite seu email para recuperar a senha</label>
        <input type="email" id="email" name="email" required>
        <button type="submit">Enviar</button>
    </form>
</body>
</html>
