<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") { http_response_code(200); exit(); }

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
    exit();
}

try {

    // ==== 1. CAMPOS OBLIGATORIOS ====
    $titulo = isset($_POST['titulo']) ? trim($_POST['titulo']) : "";
    $precio = isset($_POST['precio']) ? floatval($_POST['precio']) : 0;
    $direccion_completa = isset($_POST['direccion_completa']) ? trim($_POST['direccion_completa']) : "";

    if ($titulo == "" || $precio <= 0 || $direccion_completa == "") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "mensaje" => "Faltan datos obligatorios (título, precio, dirección)"
        ]);
        exit();
    }

    $pdo->beginTransaction();

    // ==== 2. INSERT PROPIEDAD ====
    $sql = "INSERT INTO propiedades (
        id_usuario_publica, titulo, descripcion, tipo_operacion, tipo_inmueble, 
        precio, moneda, direccion_completa, ciudad, pais, num_banos, num_dormitorios, 
        metros_cuadrados, estado, fecha_publicacion
    ) VALUES (
        :u, :t, :d, :op, :inm, :p, 'MXN', :dir, :c, :pa, :b, :dor, :m2, 'Activa', NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":u" => isset($_POST['id_usuario_publica']) ? $_POST['id_usuario_publica'] : 1,
        ":t" => $titulo,
        ":d" => isset($_POST['descripcion']) ? $_POST['descripcion'] : "",
        ":op" => isset($_POST['tipo_operacion']) ? $_POST['tipo_operacion'] : "Venta",
        ":inm" => isset($_POST['tipo_inmueble']) ? $_POST['tipo_inmueble'] : "Casa",
        ":p"  => $precio,
        ":dir" => $direccion_completa,
        ":c" => isset($_POST['ciudad']) ? $_POST['ciudad'] : "Ciudad",
        ":pa" => isset($_POST['pais']) ? $_POST['pais'] : "México",
        ":b"  => intval(isset($_POST['num_banos']) ? $_POST['num_banos'] : 1),
        ":dor"=> intval(isset($_POST['num_dormitorios']) ? $_POST['num_dormitorios'] : 1),
        ":m2" => floatval(isset($_POST['metros_cuadrados']) ? $_POST['metros_cuadrados'] : 50)
    ]);

    $id_propiedad = $pdo->lastInsertId();


    // ====================================================
    // 3. VALIDAR QUE LLEGARON ARCHIVOS
    // ====================================================

    // En web, a veces React-Native-Web envía strings si falla el FormData.
    if (!isset($_FILES['imagenes'])) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "mensaje" => "No llegaron imágenes. Asegura enviar FormData correctamente.",
            "FILES_RECIBIDO" => $_FILES
        ]);
        exit();
    }

    // Normalizar siempre a array
    $files = $_FILES['imagenes'];
    if (!is_array($files['name'])) {
        $files = [
            "name"     => [$files["name"]],
            "type"     => [$files["type"]],
            "tmp_name" => [$files["tmp_name"]],
            "error"    => [$files["error"]],
            "size"     => [$files["size"]]
        ];
    }

    // =============================
    // 4. GUARDAR IMÁGENES
    // =============================
    $upload_dir = "C:/AppServ/www/CasaYa/uploads/";
    $db_url = "uploads/";

    if (!is_dir($upload_dir)) {
        @mkdir($upload_dir, 0777, true);
    }

    $stmt_img = $pdo->prepare("
        INSERT INTO propiedad_fotos (id_propiedad, url_foto, es_principal)
        VALUES (:idp, :url, :pri)
    ");

    $uploaded_count = 0;

    foreach ($files['tmp_name'] as $i => $tmp) {

        if ($files['error'][$i] !== UPLOAD_ERR_OK) continue;

        $ext = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
        if ($ext == "") $ext = "jpg";

        $new_name = uniqid("img_", true) . "." . $ext;
        $destino = $upload_dir . $new_name;

        if (!move_uploaded_file($tmp, $destino)) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "mensaje" => "No se pudo guardar la imagen",
                "ruta_destino" => $destino
            ]);
            exit();
        }

        $stmt_img->execute([
            ":idp" => $id_propiedad,
            ":url" => $db_url . $new_name,
            ":pri" => ($i === 0 ? 1 : 0)
        ]);

        $uploaded_count++;
    }

    if ($uploaded_count == 0) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "mensaje" => "Propiedad creada pero sin imágenes"
        ]);
        exit();
    }

    $pdo->commit();
    http_response_code(201);

    echo json_encode([
        "success" => true,
        "mensaje" => "Propiedad publicada correctamente",
        "imagenes" => $uploaded_count,
        "id_propiedad" => $id_propiedad
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
