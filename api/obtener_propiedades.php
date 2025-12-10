<?php
// --- ENCABEZADOS DE CORS ---
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type"); 

// Responde a peticiones OPTIONS pre-vuelo
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["mensaje" => "Método no permitido. Utiliza GET.", "success" => false]);
    exit();
}

try {
    
    // -------------------------------------------------------------
    // 2. CONSULTA A LA BASE DE DATOS (USANDO url_foto)
    // -------------------------------------------------------------
    
    $sql = "
        SELECT 
            p.id_propiedad, p.id_usuario_publica, p.titulo, p.descripcion, p.tipo_operacion, 
            p.tipo_inmueble, p.precio, p.moneda, p.direccion_completa, p.ciudad, p.pais, 
            p.num_banos, p.num_dormitorios, p.metros_cuadrados, p.estado, p.fecha_publicacion,
            
            -- 💥 CORRECCIÓN AQUÍ: Usamos url_foto en lugar de ruta_foto
            GROUP_CONCAT(pf.url_foto SEPARATOR ',') AS imagenes 
        FROM 
            propiedades p
        LEFT JOIN 
            propiedad_fotos pf ON p.id_propiedad = pf.id_propiedad
        
        GROUP BY 
            p.id_propiedad
        ORDER BY 
            p.fecha_publicacion DESC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $propiedades = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // -------------------------------------------------------------
    // 3. PROCESAMIENTO DE LAS FOTOS
    // -------------------------------------------------------------
    $propiedades_final = array_map(function($propiedad) {
        $propiedad['imagenes'] = $propiedad['imagenes'] ? explode(',', $propiedad['imagenes']) : [];
        return $propiedad;
    }, $propiedades);
    
    // -------------------------------------------------------------
    // 4. RESPUESTA DE ÉXITO
    // -------------------------------------------------------------
    if (!empty($propiedades_final)) {
        http_response_code(200);
        echo json_encode([
            "mensaje" => "Propiedades obtenidas con éxito.", 
            "success" => true, 
            "data" => $propiedades_final
        ]);
    } else {
        http_response_code(200);
        echo json_encode([
            "mensaje" => "No se encontraron propiedades.", 
            "success" => true, 
            "data" => []
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "mensaje" => "Error interno del servidor al obtener propiedades.", 
        "detalle_tecnico" => $e->getMessage(),
        "success" => false
    ]);
}
?>