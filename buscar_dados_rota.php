<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

$pedidoId = $_GET['pedido_id'] ?? null;

function geocodeAddress($address) {
    $apiKey = 'AIzaSyAppxfGYLdYhP8lVimrq43dP6Gso9Y-si4'; // Substitua pela sua chave de API
    $address = urlencode($address);
    $url = "https://maps.googleapis.com/maps/api/geocode/json?address={$address}&key={$apiKey}";

    $response = file_get_contents($url);
    $json = json_decode($response, true);

    if ($json['status'] === 'OK') {
        $location = $json['results'][0]['geometry']['location'];
        return [
            'lat' => $location['lat'],
            'lng' => $location['lng']
        ];
    }

    return null;
}

try {
    $stmt = $conn->prepare("
        SELECT 
            u.endereco as endereco_partida,
            l.latitude as lat_chegada,
            l.longitude as lng_chegada,
            l.endereco as endereco_chegada
        FROM pedidos p
        JOIN usuarios u ON p.user_id = u.id
        JOIN locais l ON p.local_chegada = l.id
        WHERE p.id = ? AND p.entregador_id = ?
    ");
    
    $stmt->execute([$pedidoId, $_SESSION['user_id']]);
    $rota = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($rota) {
        $startCoords = geocodeAddress($rota['endereco_partida']);
        if (!$startCoords) {
            echo json_encode(['success' => false, 'message' => 'Erro ao geocodificar endereço de partida']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'start' => [
                'lat' => $startCoords['lat'],
                'lng' => $startCoords['lng'],
                'endereco' => $rota['endereco_partida']
            ],
            'end' => [
                'lat' => floatval($rota['lat_chegada']),
                'lng' => floatval($rota['lng_chegada']),
                'endereco' => $rota['endereco_chegada']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Rota não encontrada']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 