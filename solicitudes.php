<?php
// solicitudes.php - API para gestionar solicitudes
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch($method) {
    case 'GET':
        if (isset($_GET['usuario'])) {
            getSolicitudesByUser($db, $_GET['usuario']);
        } elseif (isset($_GET['hospedaje'])) {
            getSolicitudesByHospedaje($db, $_GET['hospedaje']);
        }
        break;
        
    case 'POST':
        createSolicitud($db, $data);
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteSolicitud($db, $_GET['id']);
        }
        break;
        
    default:
        sendResponse(false, "Método no permitido");
        break;
}

function getSolicitudesByUser($db, $usuario_id) {
    try {
        $query = "SELECT s.*, 
                         h.DESCRIPCION as hospedaje_descripcion,
                         h.DIRECCION as hospedaje_direccion,
                         h.IMAGEM as hospedaje_imagen,
                         u.NOMBRE as propietario_nombre,
                         u.APELLIDO_PATERNO as propietario_apellido,
                         u.TELEFONO as propietario_telefono,
                         u.EMAIL as propietario_email
                  FROM SOLICITUDES s
                  INNER JOIN HOSPEDAJE h ON s.CVE_HOSPEDAJE = h.CVE_HOSPEDAJE
                  INNER JOIN USUARIO u ON h.CVE_USUARIO = u.CVE_USUARIO
                  WHERE s.CVE_SOLICITANTE = :usuario_id
                  ORDER BY s.FECHA_SOLICITUD DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":usuario_id", $usuario_id);
        $stmt->execute();
        
        $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, "Solicitudes obtenidas", $solicitudes);
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function getSolicitudesByHospedaje($db, $hospedaje_id) {
    try {
        $query = "SELECT s.*, 
                         u.NOMBRE as solicitante_nombre,
                         u.APELLIDO_PATERNO as solicitante_apellido,
                         u.TELEFONO as solicitante_telefono,
                         u.EMAIL as solicitante_email
                  FROM SOLICITUDES s
                  INNER JOIN USUARIO u ON s.CVE_SOLICITANTE = u.CVE_USUARIO
                  WHERE s.CVE_HOSPEDAJE = :hospedaje_id
                  ORDER BY s.FECHA_SOLICITUD DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":hospedaje_id", $hospedaje_id);
        $stmt->execute();
        
        $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, "Solicitudes obtenidas", $solicitudes);
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function createSolicitud($db, $data) {
    try {
        $cve_solicitante = sanitize($data['cve_solicitante']);
        $cve_hospedaje = sanitize($data['cve_hospedaje']);
        
        if (empty($cve_solicitante) || empty($cve_hospedaje)) {
            sendResponse(false, "Datos incompletos");
            return;
        }
        
        // Verificar si ya existe una solicitud
        $query_check = "SELECT CVE_SOLICITUD FROM SOLICITUDES 
                       WHERE CVE_SOLICITANTE = :cve_solicitante 
                       AND CVE_HOSPEDAJE = :cve_hospedaje";
        
        $stmt_check = $db->prepare($query_check);
        $stmt_check->bindParam(":cve_solicitante", $cve_solicitante);
        $stmt_check->bindParam(":cve_hospedaje", $cve_hospedaje);
        $stmt_check->execute();
        
        if ($stmt_check->rowCount() > 0) {
            sendResponse(false, "Ya has enviado una solicitud para este hospedaje");
            return;
        }
        
        // Crear nueva solicitud
        $query = "INSERT INTO SOLICITUDES (CVE_SOLICITANTE, CVE_HOSPEDAJE, FECHA_SOLICITUD) 
                  VALUES (:cve_solicitante, :cve_hospedaje, CURDATE())";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":cve_solicitante", $cve_solicitante);
        $stmt->bindParam(":cve_hospedaje", $cve_hospedaje);
        
        if ($stmt->execute()) {
            $cve_solicitud = $db->lastInsertId();
            sendResponse(true, "Solicitud enviada exitosamente", [
                "cve_solicitud" => $cve_solicitud
            ]);
        } else {
            sendResponse(false, "Error al crear solicitud");
        }
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}

function deleteSolicitud($db, $id) {
    try {
        $query = "DELETE FROM SOLICITUDES WHERE CVE_SOLICITUD = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        
        if ($stmt->execute()) {
            sendResponse(true, "Solicitud eliminada");
        } else {
            sendResponse(false, "Error al eliminar");
        }
        
    } catch(PDOException $e) {
        sendResponse(false, "Error: " . $e->getMessage());
    }
}
?>