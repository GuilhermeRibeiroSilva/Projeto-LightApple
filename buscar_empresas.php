<?php
session_start();
require_once 'conexao.php';

$termo = $_GET['termo'] ?? '';

try {
    $stmt = $conn->prepare("
        SELECT id, nome, endereco, limite_coleta 
        FROM locais 
        WHERE categoria = 'empresa de coleta' 
        AND status = 'ativo' 
        AND nome LIKE :termo
    ");
    
    $stmt->execute(['termo' => "%$termo%"]);
    $empresas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    header('Content-Type: application/json');
    echo json_encode($empresas);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 