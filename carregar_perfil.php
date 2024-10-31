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
    $query = "SELECT nome, cpf, cnpj, dataNascimento, telefone, endereco, email, tipoConta, dataCriacao, profile_pic FROM usuarios WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();
        
        // Formata a data de criação para exibir o mês e ano em português
        if ($usuario && isset($usuario['dataCriacao'])) {
            setlocale(LC_TIME, 'pt_BR.utf8');
            $dataCriacao = new DateTime($usuario['dataCriacao']);
            $mesAnoCriacao = strftime('%B %Y', $dataCriacao->getTimestamp());
            $usuario['dataCriacao'] = $mesAnoCriacao;
        }

        // Define o caminho da imagem de perfil com valor padrão
        $usuario['profile_pic'] = !empty($usuario['profile_pic']) ? $usuario['profile_pic'] : 'imagens/default_image.jpeg';
        
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
