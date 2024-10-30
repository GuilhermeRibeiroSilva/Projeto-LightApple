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
$cnpj = $dados["cnpj"] ?? null; // Captura o CNPJ

// Validação de campos vazios
$campos_vazios = [];
if (empty($nome)) $campos_vazios[] = "nome";
if (empty($dataNascimento) && !in_array($tipoConta, ['empresa de coleta', 'Transportadora', 'estabelecimentos', 'condominios'])) $campos_vazios[] = "dataNascimento";
if (empty($telefone)) $campos_vazios[] = "telefone";
if (empty($endereco)) $campos_vazios[] = "endereco";
if (empty($email)) $campos_vazios[] = "email";
if (empty($senha)) $campos_vazios[] = "senha";
if (empty($confirmarSenha)) $campos_vazios[] = "confirmarSenha";
if (empty($tipoConta)) $campos_vazios[] = "tipoConta";

// Validação do CPF e CNPJ dependendo do tipo de conta
if (in_array($tipoConta, ['cliente', 'Entregadores'])) {
    if (empty($cpf)) $campos_vazios[] = "CPF"; // CPF é obrigatório para esses tipos
} elseif (in_array($tipoConta, ['empresa de coleta', 'Transportadora', 'condominios', 'estabelecimentos'])) {
    if (empty($cnpj)) $campos_vazios[] = "CNPJ"; // CNPJ é obrigatório para esses tipos
    $dataNascimento = null; // Ignora data de nascimento para esses tipos
    $cpf = null;
}

if (!empty($campos_vazios)) {
    echo json_encode(["success" => false, "error" => "Campos obrigatórios não podem estar vazios: " . implode(", ", $campos_vazios)]);
    exit;
}

// Conexão com o banco de dados
$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se a senha e a confirmação da senha são iguais
    if ($senha !== $confirmarSenha) {
        echo json_encode(["success" => false, "error" => "As senhas não coincidem."]);
        exit;
    }

    // Criptografa a senha antes de armazenar
    $senhaHashed = password_hash($senha, PASSWORD_DEFAULT);

    // Prepara a consulta para inserir os dados no banco de dados, incluindo o CNPJ
    $sql = "INSERT INTO usuarios (nome, cpf, dataNascimento, telefone, endereco, email, senha, tipoConta, cnpj) 
            VALUES (:nome, :cpf, :dataNascimento, :telefone, :endereco, :email, :senha, :tipoConta, :cnpj)";
    $stmt = $conn->prepare($sql);

    // Vincula os parâmetros
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':cpf', $cpf);
    $stmt->bindParam(':dataNascimento', $dataNascimento);
    $stmt->bindParam(':telefone', $telefone);
    $stmt->bindParam(':endereco', $endereco);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':senha', $senhaHashed);
    $stmt->bindParam(':tipoConta', $tipoConta);
    $stmt->bindParam(':cnpj', $cnpj);

    // Executa a inserção e retorna a resposta
    if ($stmt->execute()) {
        $_SESSION['user_id'] = $conn->lastInsertId();
        echo json_encode([
            "success" => true,
            "tipoConta" => $tipoConta
        ]);
        exit();
    } else {
        echo json_encode(["success" => false, "error" => "Erro ao criar a conta."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Erro na conexão: " . $e->getMessage()]);
}
