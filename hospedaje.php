<?php
// hospedaje.php - API para gestionar hospedajes
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getHospedajeById($db, $_GET['id']);
        } elseif (isset($_GET['usuario'])) {
            getHospedajesByUser($db, $_GET['usuario']);
        } else {
            getAllHospedajes($db);
        }
        break;
        
    case 'POST':
        createHospedaje($db, $data);
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateHospedaje($db, $_GET['id'], $data);
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteHospedaje($db, $_GET['id']);
        }
        break;
        
    default:
        sendResponse(false, "Método no permitido");
        break;
}

function getAllHospedajes($db) {
    try {
        $query = "SELECT h.*, 
                         p.FECHA as fecha_publicacion,
                         u.NOMBRE as propietario_nombre,
                         u.APELLIDO_PATERNO as propietario_apellido,
                         u.TELEFONO as propietario_telefono,
                         u.EMAIL as propietario_email,
                         u.FOTO as propietario_foto
                  FROM HOSPEDAJE h
                  INNER JOIN PUBLICACION p ON h.CVE_PUBLICACION = p.CVE_PUBLICACION
                  INNER JOIN USUARIO u ON h.CVE_USUARIO = u.CVE_USUARIO
                  ORDER BY p.FECHA DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $hospedajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, "Hospedajes obtenidos", $hospedajes);
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function getHospedajeById($db, $id) {
    try {
        $query = "SELECT h.*, 
                         p.FECHA as fecha_publicacion,
                         u.NOMBRE as propietario_nombre,
                         u.APELLIDO_PATERNO as propietario_apellido,
                         u.APELLIDO_MATERNO_ as propietario_apellido_materno,
                         u.TELEFONO as propietario_telefono,
                         u.EMAIL as propietario_email,
                         u.FOTO as propietario_foto,
                         u.CVE_USUARIO as propietario_id
                  FROM HOSPEDAJE h
                  INNER JOIN PUBLICACION p ON h.CVE_PUBLICACION = p.CVE_PUBLICACION
                  INNER JOIN USUARIO u ON h.CVE_USUARIO = u.CVE_USUARIO
                  WHERE h.CVE_HOSPEDAJE = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $hospedaje = $stmt->fetch(PDO::FETCH_ASSOC);
            sendResponse(true, "Hospedaje encontrado", $hospedaje);
        } else {
            sendResponse(false, "Hospedaje no encontrado");
        }
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function getHospedajesByUser($db, $usuario_id) {
    try {
        $query = "SELECT h.*, 
                         p.FECHA as fecha_publicacion
                  FROM HOSPEDAJE h
                  INNER JOIN PUBLICACION p ON h.CVE_PUBLICACION = p.CVE_PUBLICACION
                  WHERE h.CVE_USUARIO = :usuario_id
                  ORDER BY p.FECHA DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":usuario_id", $usuario_id);
        $stmt->execute();
        
        $hospedajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, "Hospedajes del usuario obtenidos", $hospedajes);
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function createHospedaje($db, $data) {
    try {
        $cve_usuario = sanitize($data['cve_usuario']);
        $descripcion = sanitize($data['descripcion']);
        $direccion = sanitize($data['direccion']);
        $imagen = isset($data['imagen']) ? sanitize($data['imagen']) : 'default_house.jpg';
        
        if (empty($cve_usuario) || empty($descripcion) || empty($direccion)) {
            sendResponse(false, "Todos los campos son requeridos");
            return;
        }
        
        $db->beginTransaction();
        
        // Crear publicación
        $query_pub = "INSERT INTO PUBLICACION (CVE_RESPONSABLE_ACTUAL, FECHA) 
                      VALUES (:cve_usuario, CURDATE())";
        
        $stmt_pub = $db->prepare($query_pub);
        $stmt_pub->bindParam(":cve_usuario", $cve_usuario);
        
        if ($stmt_pub->execute()) {
            $cve_publicacion = $db->lastInsertId();
            
            // Crear hospedaje
            $query_hosp = "INSERT INTO HOSPEDAJE (CVE_PUBLICACION, CVE_USUARIO, IMAGEM, DESCRIPCION, DIRECCION) 
                          VALUES (:cve_publicacion, :cve_usuario, :imagen, :descripcion, :direccion)";
            
            $stmt_hosp = $db->prepare($query_hosp);
            $stmt_hosp->bindParam(":cve_publicacion", $cve_publicacion);
            $stmt_hosp->bindParam(":cve_usuario", $cve_usuario);
            $stmt_hosp->bindParam(":imagen", $imagen);
            $stmt_hosp->bindParam(":descripcion", $descripcion);
            $stmt_hosp->bindParam(":direccion", $direccion);
            
            if ($stmt_hosp->execute()) {
                $db->commit();
                $cve_hospedaje = $db->lastInsertId();
                
                sendResponse(true, "Hospedaje creado exitosamente", [
                    "cve_hospedaje" => $cve_hospedaje,
                    "cve_publicacion" => $cve_publicacion
                ]);
            } else {
                $db->rollBack();
                sendResponse(false, "Error al crear hospedaje");
            }
        } else {
            $db->rollBack();
            sendResponse(false, "Error al crear publicación");
        }
        
    } catch(PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function updateHospedaje($db, $id, $data) {
    try {
        $descripcion = sanitize($data['descripcion']);
        $direccion = sanitize($data['direccion']);
        $imagen = isset($data['imagen']) ? sanitize($data['imagen']) : null;
        
        if (empty($descripcion) || empty($direccion)) {
            sendResponse(false, "Descripción y dirección son requeridos");
            return;
        }
        
        $query = "UPDATE HOSPEDAJE SET 
                  DESCRIPCION = :descripcion,
                  DIRECCION = :direccion";
        
        if ($imagen !== null) {
            $query .= ", IMAGEM = :imagen";
        }
        
        $query .= " WHERE CVE_HOSPEDAJE = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":descripcion", $descripcion);
        $stmt->bindParam(":direccion", $direccion);
        $stmt->bindParam(":id", $id);
        
        if ($imagen !== null) {
            $stmt->bindParam(":imagen", $imagen);
        }
        
        if ($stmt->execute()) {
            sendResponse(true, "Hospedaje actualizado");
        } else {
            sendResponse(false, "Error al actualizar");
        }
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function deleteHospedaje($db, $id) {
    try {
        $db->beginTransaction();
        
        $query_get = "SELECT CVE_PUBLICACION FROM HOSPEDAJE WHERE CVE_HOSPEDAJE = :id";
        $stmt_get = $db->prepare($query_get);
        $stmt_get->bindParam(":id", $id);
        $stmt_get->execute();
        $result = $stmt_get->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $cve_publicacion = $result['CVE_PUBLICACION'];
            
            $query_sol = "DELETE FROM SOLICITUDES WHERE CVE_HOSPEDAJE = :id";
            $stmt_sol = $db->prepare($query_sol);
            $stmt_sol->bindParam(":id", $id);
            $stmt_sol->execute();
            
            $query_hosp = "DELETE FROM HOSPEDAJE WHERE CVE_HOSPEDAJE = :id";
            $stmt_hosp = $db->prepare($query_hosp);
            $stmt_hosp->bindParam(":id", $id);
            
            if ($stmt_hosp->execute()) {
                $query_pub = "DELETE FROM PUBLICACION WHERE CVE_PUBLICACION = :cve_publicacion";
                $stmt_pub = $db->prepare($query_pub);
                $stmt_pub->bindParam(":cve_publicacion", $cve_publicacion);
                $stmt_pub->execute();
                
                $db->commit();
                sendResponse(true, "Hospedaje eliminado");
            } else {
                $db->rollBack();
                sendResponse(false, "Error al eliminar");
            }
        } else {
            $db->rollBack();
            sendResponse(false, "Hospedaje no encontrado");
        }
        
    } catch(PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        sendResponse(false, "Error: " . $e->getMessage());
    }
}
?>
