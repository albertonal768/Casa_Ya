<?php

// Activar reporte de errores detallado (SOLO PARA DEBUG, REMOVER LUEGO)

ini_set('display_errors', 1);

ini_set('display_startup_errors', 1);

error_reporting(E_ALL);



header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: GET, OPTIONS");

header("Access-Control-Allow-Headers: *");



if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") { http_response_code(200); exit(); }



// ⚠️ VERIFICAR RUTA: Asegúrate que esta ruta a la configuración de BD sea correcta

require_once 'db_config.php';



if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode(["success" => false, "mensaje" => "Método no permitido. Utiliza GET."]);

    exit();

}



// ==== 1. OBTENER ID DE LA PROPIEDAD ====

$id_propiedad = isset($_GET['id']) ? intval($_GET['id']) : 0;



if ($id_propiedad <= 0) {

    http_response_code(400);

    echo json_encode(["success" => false, "mensaje" => "ID de propiedad no proporcionado o inválido."]);

    exit();

}



try {

    // ==== 2. CONSULTA PRINCIPAL DE LA PROPIEDAD Y AGENTE (CORREGIDA) ====

$sql_propiedad = "SELECT
                    p.*,
                    u.nombre AS nombre_agente,
                    u.telefono AS telefono_agente,
                    u.correo AS correo_agente
                  FROM propiedades p
                  JOIN usuarios u ON p.id_usuario_publica = u.id_usuario
                  WHERE p.id_propiedad = :id";

   

    $stmt_propiedad = $pdo->prepare($sql_propiedad);

    $stmt_propiedad->execute([':id' => $id_propiedad]);

    $propiedad = $stmt_propiedad->fetch(PDO::FETCH_ASSOC);



    if (!$propiedad) {

        http_response_code(404);

        echo json_encode(["success" => false, "mensaje" => "Propiedad no encontrada."]);

        exit();

    }

   

    // ==== 3. CONSULTA DE FOTOS RELACIONADAS ====

    $sql_fotos = "SELECT url_foto, es_principal

                  FROM propiedad_fotos

                  WHERE id_propiedad = :id

                  ORDER BY es_principal DESC, id_foto ASC";

   

    $stmt_fotos = $pdo->prepare($sql_fotos);

    $stmt_fotos->execute([':id' => $id_propiedad]);

    $fotos = $stmt_fotos->fetchAll(PDO::FETCH_ASSOC);



    // Añadir las fotos al array de la propiedad

    $propiedad['fotos'] = $fotos;



    // ==== 4. DEVOLVER RESPUESTA EXITOSA ====

    http_response_code(200);

    echo json_encode([

        "success" => true,

        "mensaje" => "Detalle de propiedad cargado exitosamente.",

        "propiedad" => $propiedad

    ]);



} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "mensaje" => "Error interno del servidor al acceder a la base de datos.",

        "error_sql" => $e->getMessage()

    ]);

}

?>