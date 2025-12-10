<?php
// --- ENCABEZADOS DE CORS ---
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["mensaje" => "Método no permitido.", "success" => false]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$correo = $data['correo'] ?? '';
$contrasena = $data['contrasena'] ?? '';

if (empty($correo) || empty($contrasena)) {
    http_response_code(400); 
    echo json_encode(["mensaje" => "Faltan correo y/o contraseña.", "success" => false]);
    exit();
}

try {
    // ASUMO: tabla 'usuarios', columnas 'id_usuario', 'contrasena', 'nombre', 'rol'
    $sql = "SELECT id_usuario, nombre, contrasena, rol FROM usuarios WHERE correo = :correo";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':correo', $correo);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // 🔑 VERIFICACIÓN CRUCIAL DE LA CONTRASEÑA HASHED
    if ($usuario && password_verify($contrasena, $usuario['contrasena'])) {
        // Login Exitoso
        http_response_code(200);
        
        echo json_encode([
            "mensaje" => "Acceso exitoso. Bienvenido.",
            "success" => true,
            "usuario" => [
                "id" => $usuario['id_usuario'],
                "nombre" => $usuario['nombre'],
                "rol" => $usuario['rol']
            ]
        ]);
        
    } else {
        // Credenciales Inválidas
        http_response_code(401); // Unauthorized
        echo json_encode(["mensaje" => "Correo o contraseña incorrectos.", "success" => false]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "mensaje" => "Error crítico en el servidor.", 
        "detalle_tecnico" => $e->getMessage(),
        "success" => false
    ]);
}
?>