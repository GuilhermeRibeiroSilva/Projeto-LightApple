<?php 
session_start();
header("Content-Type: application/json");

// Conectar ao banco de dados
$conn = new mysqli("localhost", "root", "", "light_apple");

// Verifica a conexão
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Falha na conexão: " . $conn->connect_error]));
}

// Obtém o ID do usuário da sessão
$userId = $_SESSION['user_id'] ?? null;

if ($userId) {
    // Consulta para buscar os dados do usuário
    $query = "SELECT nome, cpf, cnpj, dataNascimento, telefone, endereco, email, tipoConta, dataCriacao, profile_image_path FROM usuarios WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();

        // Formata a data de criação para exibir o mês e o ano em português
        if ($usuario && isset($usuario['dataCriacao'])) {
            setlocale(LC_TIME, 'pt_BR.utf8');
            $dataCriacao = new DateTime($usuario['dataCriacao']);
            $usuario['dataCriacao'] = $dataCriacao->format('F Y'); // Formato desejado
        }

        // Verifica se a imagem de perfil existe, caso contrário, usa uma imagem padrão
        $usuario['profile_image_path'] = !empty($usuario['profile_image_path']) && file_exists($usuario['profile_image_path']) 
            ? $usuario['profile_image_path'] 
            : 'imagens/default_image.jpeg';
        
        // Retorna os dados do usuário em JSON
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
