<?php
// 1. FORZAR MOSTRAR ERRORES (Solo para depuración, ELIMINAR después de que funcione)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 2. INCLUIR CONEXIÓN (Asegúrate que esta ruta sea correcta: '../' para subir una carpeta)
require_once 'db_config.php'; 

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Necesario para React Native

// 3. OBTENER EL ID DEL USUARIO
// Usamos el operador ternario para obtener el id y asegurarnos que sea entero.
$id_usuario = isset($_GET['id_usuario']) ? intval($_GET['id_usuario']) : 0;

if ($id_usuario <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "mensaje" => "ID de usuario no proporcionado o inválido."]);
    exit();
}

try {
    // 4. CONSULTA SQL PARA OBTENER EL PERFIL
    // NOTA: Ajusta los nombres de las columnas y la tabla según tu base de datos
   $sql_perfil = "SELECT 
    id_usuario,
    nombre,
    correo,    /* <-- USAR 'correo' EN LUGAR DE 'email' */
    telefono,
    rol
    FROM usuarios 
    WHERE id_usuario = :id";

    // 5. PREPARAR Y EJECUTAR LA CONSULTA (Usando la variable $pdo)
    $stmt_perfil = $pdo->prepare($sql_perfil); // <-- CORRECCIÓN: Usamos $pdo
    $stmt_perfil->execute([':id' => $id_usuario]);
    $perfil = $stmt_perfil->fetch(PDO::FETCH_ASSOC);

    if (!$perfil) {
        http_response_code(404); // Not Found
        echo json_encode(["success" => false, "mensaje" => "Perfil de usuario no encontrado."]);
        exit();
    }

    // 6. RESPUESTA EXITOSA
    http_response_code(200);
    echo json_encode(["success" => true, "perfil" => $perfil]);

} catch (PDOException $e) {
    // Manejo de errores de PDO (errores de SQL o de la consulta)
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "mensaje" => "Error al ejecutar la consulta SQL.", 
        "detalle_tecnico" => $e->getMessage()
    ]);
    exit();
}

// Nota: Hemos eliminado todo el código que intentaba usar $conn o métodos de MySQLi.
?>