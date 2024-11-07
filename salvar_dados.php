<?php
header('Content-Type: application/json');
require_once 'conexao.php';

try {
    // Recebe os dados do formulário em JSON
    $dados = json_decode(file_get_contents('php://input'), true);

    // Validações básicas
    if (!$dados['nome'] || !$dados['email'] || !$dados['senha'] || !$dados['tipoConta']) {
        throw new Exception("Todos os campos obrigatórios devem ser preenchidos");
    }

    // Verifica se o email já existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$dados['email']]);
    if ($stmt->fetch()) {
        throw new Exception("Este email já está cadastrado");
    }

    // Trata CPF e CNPJ baseado no tipo de conta
    if (in_array($dados['tipoConta'], ['empresa de coleta', 'Transportadora', 'estabelecimentos', 'condominios'])) {
        $dados['cpf'] = null; // Define CPF como null para empresas
        if (empty($dados['cnpj'])) {
            throw new Exception("CNPJ é obrigatório para este tipo de conta");
        }
    } else {
        $dados['cnpj'] = null; // Define CNPJ como null para pessoas físicas
        if (empty($dados['cpf'])) {
            throw new Exception("CPF é obrigatório para este tipo de conta");
        }
    }

    // Hash da senha
    $senha_hash = password_hash($dados['senha'], PASSWORD_DEFAULT);

    // Inicia a transação
    $conn->beginTransaction();

    // Insere o usuário com 1000 pontos iniciais
    $sql = "INSERT INTO usuarios (
        nome, 
        email, 
        senha, 
        tipoConta,
        cpf,
        cnpj,
        dataNascimento,
        telefone,
        endereco,
        pontos,
        dataCriacao
    ) VALUES (
        :nome,
        :email,
        :senha,
        :tipoConta,
        :cpf,
        :cnpj,
        :dataNascimento,
        :telefone,
        :endereco,
        1000,
        NOW()
    )";

    $stmt = $conn->prepare($sql);
    
    // Bind dos parâmetros
    $stmt->bindParam(':nome', $dados['nome']);
    $stmt->bindParam(':email', $dados['email']);
    $stmt->bindParam(':senha', $senha_hash);
    $stmt->bindParam(':tipoConta', $dados['tipoConta']);
    $stmt->bindParam(':cpf', $dados['cpf']);
    $stmt->bindParam(':cnpj', $dados['cnpj']);
    $stmt->bindParam(':dataNascimento', $dados['dataNascimento']);
    $stmt->bindParam(':telefone', $dados['telefone']);
    $stmt->bindParam(':endereco', $dados['endereco']);
    
    $stmt->execute();
    
    // Commit da transação
    $conn->commit();

    // Retorna sucesso e o tipo de conta para redirecionamento
    echo json_encode([
        'success' => true,
        'tipoConta' => $dados['tipoConta'],
        'message' => 'Conta criada com sucesso!'
    ]);

} catch (Exception $e) {
    // Em caso de erro, faz rollback
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
