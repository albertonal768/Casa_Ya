<?php
// --- ENCABEZADOS CRUCIALES para CORS ---
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type"); 

// --- MANEJO DE LA PETICIÓN OPTIONS ---
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php'; 

// Solo aceptar peticiones POST después de OPTIONS
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["mensaje" => "Método no permitido.", "success" => false]);
    exit();
}

// Obtener y decodificar los datos JSON enviados por React Native
$data = json_decode(file_get_contents("php://input"), true);

$nombre = $data['nombre'] ?? '';
$correo = $data['correo'] ?? '';
$telefono = $data['telefono'] ?? null; // Null si no se envía
$contrasena = $data['contrasena'] ?? '';

if (empty($nombre) || empty($correo) || empty($contrasena)) {
    http_response_code(400);
    echo json_encode(["mensaje" => "Faltan campos obligatorios.", "success" => false]);
    exit();
}

// Hasheo de Contraseña
$contrasena_hashed = password_hash($contrasena, PASSWORD_DEFAULT);

// Asignamos un rol por defecto para evitar errores de campo NOT NULL
$rol_defecto = 'cliente'; 
$fecha_registro = date('Y-m-d H:i:s');

try {
    // 1. Verificar si el correo ya existe
    // ASUMO: tabla 'usuarios', columna 'correo'
    $sql_check = "SELECT id_usuario FROM usuarios WHERE correo = :correo";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->bindParam(':correo', $correo);
    $stmt_check->execute();

    if ($stmt_check->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["mensaje" => "El correo electrónico ya está registrado.", "success" => false]);
        exit();
    }
    
    // 2. INSERTAR EL NUEVO USUARIO
    // ASUMO: columnas 'nombre', 'correo', 'telefono', 'contrasena', 'rol', 'fecha_registro'
    $sql_insert = "INSERT INTO usuarios (nombre, correo, telefono, contrasena, rol, fecha_registro) 
                   VALUES (:nombre, :correo, :telefono, :contrasena, :rol, :fecha_registro)";
    
    $stmt_insert = $pdo->prepare($sql_insert);
    
    $stmt_insert->bindParam(':nombre', $nombre);
    $stmt_insert->bindParam(':correo', $correo);
    $stmt_insert->bindParam(':telefono', $telefono);
    $stmt_insert->bindParam(':contrasena', $contrasena_hashed); 
    $stmt_insert->bindParam(':rol', $rol_defecto);
    $stmt_insert->bindParam(':fecha_registro', $fecha_registro);


    if ($stmt_insert->execute()) {
        // Éxito: Código 201 Created
        http_response_code(201); 
        echo json_encode(["mensaje" => "Registro exitoso. Serás redirigido al Login.", "success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["mensaje" => "Error desconocido al ejecutar la consulta.", "success" => false]);
    }

} catch (PDOException $e) {
    // 3. CAPTURA DE ERROR DE MYSQL
    http_response_code(500);
    echo json_encode([
        "mensaje" => "Error crítico de Base de Datos. Verifica tu SQL.", 
        "detalle_tecnico" => $e->getMessage(), // Muestra el error exacto de MySQL
        "success" => false
    ]);
}