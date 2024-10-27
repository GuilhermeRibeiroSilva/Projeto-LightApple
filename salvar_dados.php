<?php
session_start(); // Inicia a sessão

header('Content-Type: application/json'); // Define o tipo de conteúdo como JSON

// Captura os dados JSON enviados pelo JavaScript
$dadosRaw = file_get_contents('php://input');
$dados = json_decode($dadosRaw, true); // Decodifica o JSON em um array associativo

// Debug: verificar o que está chegando
error_log("Dados recebidos: " . $dadosRaw); // Adiciona log de erro no servidor

// Verifica se os dados foram enviados corretamente
if (empty($dados)) {
    echo json_encode(["success" => false, "error" => "Nenhum dado recebido pelo servidor."]);
    exit;
}

// Captura os dados do formulário
$nome = $dados["nome"] ?? null;
$cpf = $dados["cpf"] ?? null;
$dataNascimento = $dados["dataNascimento"] ?? null;
$telefone = $dados["telefone"] ?? null;
$endereco = $dados["endereco"] ?? null;
$email = $dados["email"] ?? null;
$senha = $dados["senha"] ?? null;
$confirmarSenha = $dados["confirmarSenha"] ?? null;
$tipoConta = $dados["tipoConta"] ?? null;

// Validação de campos vazios
$campos_vazios = [];
if (empty($nome)) $campos_vazios[] = "nome";
if (empty($cpf)) $campos_vazios[] = "cpf";
if (empty($dataNascimento)) $campos_vazios[] = "dataNascimento";
if (empty($telefone)) $campos_vazios[] = "telefone";
if (empty($endereco)) $campos_vazios[] = "endereco";
if (empty($email)) $campos_vazios[] = "email";
if (empty($senha)) $campos_vazios[] = "senha";
if (empty($confirmarSenha)) $campos_vazios[] = "confirmarSenha";
if (empty($tipoConta)) $campos_vazios[] = "tipoConta";

if (!empty($campos_vazios)) {
    echo json_encode(["success" => false, "error" => "Campos obrigatórios não podem estar vazios: " . implode(", ", $campos_vazios)]);
    exit;
}

// Conexão com o banco de dados
$host = 'localhost'; // Altere para o seu host
$dbname = 'light_apple'; // Altere para o nome do seu banco de dados
$username = 'root'; // Altere para o seu usuário do banco
$password = ''; // Altere para a sua senha do banco

try {
    // Estabelecendo a conexão
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se a senha e a confirmação da senha são iguais
    if ($senha !== $confirmarSenha) {
        echo json_encode(["success" => false, "error" => "As senhas não coincidem."]);
        exit;
    }

    // Criptografa a senha antes de armazenar
    $senhaHashed = password_hash($senha, PASSWORD_DEFAULT);

    // Prepara a consulta para inserir os dados no banco de dados
    $sql = "INSERT INTO usuarios (nome, cpf, dataNascimento, telefone, endereco, email, senha, tipoConta) 
            VALUES (:nome, :cpf, :dataNascimento, :telefone, :endereco, :email, :senha, :tipoConta)";
    $stmt = $conn->prepare($sql);

    // Bind das variáveis
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':cpf', $cpf);
    $stmt->bindParam(':dataNascimento', $dataNascimento); // Corrigido o nome da coluna
    $stmt->bindParam(':telefone', $telefone);
    $stmt->bindParam(':endereco', $endereco);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':senha', $senhaHashed);
    $stmt->bindParam(':tipoConta', $tipoConta);

    // Executa a consulta e verifica se foi bem-sucedida
    if ($stmt->execute()) {
        // Se a inserção foi bem-sucedida, faça o login automaticamente
        $_SESSION['user_id'] = $conn->lastInsertId(); // Salva o ID do novo usuário na sessão

        // Envia resposta para redirecionar com o tipo de conta
        echo json_encode([
            "success" => true,
            "tipoConta" => $tipoConta // Adiciona o tipo de conta à resposta
        ]);
        exit(); // Saia após enviar a resposta
    } else {
        echo json_encode(["success" => false, "error" => "Erro ao criar a conta."]);
    }
} catch (PDOException $e) {
    // Captura e exibe erro na conexão ou na execução da consulta
    echo json_encode(["success" => false, "error" => "Erro na conexão: " . $e->getMessage()]);
}
