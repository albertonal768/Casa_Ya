<?php
$host = 'localhost';
$dbname = 'casaya_db'; 
$user = 'root';        
$password = '12345678';        

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode(["mensaje" => "Error de conexión a la base de datos.", "detalle_tecnico" => $e->getMessage(), "success" => false]);
    exit();
}