<?php
session_start();
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'light_apple';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $userId = $_GET['user_id'] ?? null;

    if (!$userId) {
        throw new Exception('ID do usuário não fornecido');
    }

    // Primeiro, verifica se o usuário é uma empresa de coleta
    $queryEmpresa = "SELECT nome FROM usuarios WHERE id = :user_id AND tipoConta = 'empresa de coleta'";
    $stmtEmpresa = $conn->prepare($queryEmpresa);
    $stmtEmpresa->execute(['user_id' => $userId]);
    $empresa = $stmtEmpresa->fetch(PDO::FETCH_ASSOC);

    if (!$empresa) {
        throw new Exception('Usuário não é uma empresa de coleta válida');
    }

    // Busca os pedidos
    $query = "SELECT p.*, u.nome as nome_cliente 
              FROM pedidos p 
              JOIN usuarios u ON p.user_id = u.id 
              WHERE p.empresa_coleta = :nome_empresa
              AND p.status = 'pendente' 
              ORDER BY p.data_criacao DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute(['nome_empresa' => $empresa['nome']]);
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log para debug
    error_log("Empresa: " . $empresa['nome']);
    error_log("Número de pedidos encontrados: " . count($pedidos));

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos,
        'debug' => [
            'empresa' => $empresa['nome'],
            'total_pedidos' => count($pedidos)
        ]
    ]);

} catch (Exception $e) {
    error_log("Erro na busca de pedidos: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'user_id' => $userId ?? 'não fornecido'
        ]
    ]);
} 