<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

function calcularDistanciaHaversine($lat1, $lon1, $lat2, $lon2) {
    $R = 6371; // Raio da Terra em km
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * 
         sin($dLon/2) * sin($dLon/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    return $R * $c;
}

try {
    // Recebe as coordenadas do usuário
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['latitude']) || !isset($data['longitude'])) {
        throw new Exception('Coordenadas do usuário não fornecidas');
    }

    $userLat = floatval($data['latitude']);
    $userLon = floatval($data['longitude']);

    // Busca todos os locais ativos com suas coordenadas
    $sql = "SELECT id, latitude, longitude FROM locais WHERE status = 'ativo'";
    $stmt = $conn->query($sql);
    $locais = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $distancias = [];
    foreach ($locais as $local) {
        if (!empty($local['latitude']) && !empty($local['longitude'])) {
            $distancia = calcularDistanciaHaversine(
                $userLat,
                $userLon,
                floatval($local['latitude']),
                floatval($local['longitude'])
            );

            // Atualiza a distância no banco de dados
            $updateSql = "UPDATE locais SET distancia = :distancia WHERE id = :id";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->execute([
                ':distancia' => $distancia,
                ':id' => $local['id']
            ]);

            $distancias[] = [
                'id' => $local['id'],
                'distancia' => $distancia
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'distancias' => $distancias
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
