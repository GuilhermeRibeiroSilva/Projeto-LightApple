<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuário não autenticado']);
    exit;
}

try {
    // Verificar tipo de conta
    $stmt = $conn->prepare("SELECT tipoConta FROM usuarios WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $tiposPermitidos = ['estabelecimentos', 'condominios', 'empresa de coleta'];
    
    if (!in_array(strtolower($usuario['tipoConta']), $tiposPermitidos)) {
        echo json_encode(['success' => false, 'error' => 'Tipo de conta sem permissão']);
        exit;
    }

    // Processar upload da imagem
    $imagem = $_FILES['imagem'];
    $imagemPath = '';
    
    if ($imagem['error'] === 0) {
        $ext = pathinfo($imagem['name'], PATHINFO_EXTENSION);
        $novoNome = uniqid() . '.' . $ext;
        $diretorio = 'uploads/locais/';
        
        if (!is_dir($diretorio)) {
            mkdir($diretorio, 0777, true);
        }
        
        if (move_uploaded_file($imagem['tmp_name'], $diretorio . $novoNome)) {
            $imagemPath = $diretorio . $novoNome;
        }
    }

    // Recebe os dados do formulário
    $endereco = $_POST['endereco'];
    $latitude = $_POST['latitude'];
    $longitude = $_POST['longitude'];

    // Inserir no banco de dados
    $campos = [
        'nome' => $_POST['nome'],
        'categoria' => $_POST['categoria'],
        'endereco' => $endereco,
        'latitude' => $latitude,
        'longitude' => $longitude,
        'imagem_path' => $imagemPath,
        'status' => 'ativo',
        'created_at' => date('Y-m-d H:i:s')
    ];

    // Adiciona limite_coleta apenas se for empresa de coleta
    if ($_POST['categoria'] === 'empresa de coleta') {
        if (empty($_POST['limite_coleta'])) {
            throw new Exception('Limite de coleta é obrigatório para empresas de coleta');
        }
        $campos['limite_coleta'] = $_POST['limite_coleta'];
    }

    // Constrói a query dinamicamente
    $colunas = implode(', ', array_keys($campos));
    $valores = implode(', ', array_fill(0, count($campos), '?'));
    
    $sql = "INSERT INTO locais ($colunas) VALUES ($valores)";
    
    $stmt = $conn->prepare($sql);
    $i = 1;
    foreach ($campos as $valor) {
        $stmt->bindValue($i++, $valor);
    }
    
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Local cadastrado com sucesso!']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar local: ' . $e->getMessage()]);
}
