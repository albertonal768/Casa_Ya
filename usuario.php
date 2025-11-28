<?php
// usuario.php - API para gestionar usuarios
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getUserById($db, $_GET['id']);
        }
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateUser($db, $_GET['id'], $data);
        }
        break;
        
    default:
        sendResponse(false, "Método no permitido");
        break;
}

function getUserById($db, $id) {
    try {
        $query = "SELECT u.*, 
                         e.NOMBRE as estado_nombre,
                         m.NOMBRE as municipio_nombre,
                         c.NOMBRE as colonia_nombre,
                         c.CP as colonia_cp
                  FROM USUARIO u
                  LEFT JOIN ESTADOS e ON u.CVE_ESTADO_ = e.CVE_ESTADO_
                  LEFT JOIN MUNICIPIOS m ON u.CVE_MUNICIPIO_ = m.CVE_MUNICIPIO_
                  LEFT JOIN COLONIAS c ON u.CVE_COLONIA_ = c.CVE_COLONIA_
                  WHERE u.CVE_USUARIO = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Obtener estadísticas del usuario
            $query_stats = "SELECT 
                           (SELECT COUNT(*) FROM HOSPEDAJE WHERE CVE_USUARIO = :id) as total_publicaciones,
                           (SELECT COUNT(*) FROM SOLICITUDES WHERE CVE_SOLICITANTE = :id) as total_solicitudes
                           FROM DUAL";
            
            $stmt_stats = $db->prepare($query_stats);
            $stmt_stats->bindParam(":id", $id);
            $stmt_stats->execute();
            $stats = $stmt_stats->fetch(PDO::FETCH_ASSOC);
            
            $user['estadisticas'] = $stats;
            
            sendResponse(true, "Usuario encontrado", $user);
        } else {
            sendResponse(false, "Usuario no encontrado");
        }
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function updateUser($db, $id, $data) {
    try {
        $fields = [];
        $params = [':id' => $id];
        
        if (isset($data['nombre'])) {
            $fields[] = "NOMBRE = :nombre";
            $params[':nombre'] = sanitize($data['nombre']);
        }
        if (isset($data['apellido_paterno'])) {
            $fields[] = "APELLIDO_PATERNO = :apellido_paterno";
            $params[':apellido_paterno'] = sanitize($data['apellido_paterno']);
        }
        if (isset($data['apellido_materno'])) {
            $fields[] = "APELLIDO_MATERNO_ = :apellido_materno";
            $params[':apellido_materno'] = sanitize($data['apellido_materno']);
        }
        if (isset($data['telefono'])) {
            $fields[] = "TELEFONO = :telefono";
            $params[':telefono'] = sanitize($data['telefono']);
        }
        if (isset($data['foto'])) {
            $fields[] = "FOTO = :foto";
            $params[':foto'] = sanitize($data['foto']);
        }
        if (isset($data['cve_estado'])) {
            $fields[] = "CVE_ESTADO_ = :cve_estado";
            $params[':cve_estado'] = $data['cve_estado'];
        }
        if (isset($data['cve_municipio'])) {
            $fields[] = "CVE_MUNICIPIO_ = :cve_municipio";
            $params[':cve_municipio'] = $data['cve_municipio'];
        }
        if (isset($data['cve_colonia'])) {
            $fields[] = "CVE_COLONIA_ = :cve_colonia";
            $params[':cve_colonia'] = $data['cve_colonia'];
        }
        
        if (empty($fields)) {
            sendResponse(false, "No hay campos para actualizar");
            return;
        }
        
        $query = "UPDATE USUARIO SET " . implode(", ", $fields) . " WHERE CVE_USUARIO = :id";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if ($stmt->execute()) {
            // Obtener usuario actualizado
            getUserById($db, $id);
        } else {
            sendResponse(false, "Error al actualizar usuario");
        }
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}
?>