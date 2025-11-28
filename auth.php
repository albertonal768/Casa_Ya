<?php
// Habilitar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Manejar la solicitud "preflight" (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// =========================================================

// auth.php - API para Login y Registro
require_once 'config.php'; 

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch($method) {
    case 'POST':
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        if ($action === 'login') {
            login($db, $data);
        } elseif ($action === 'register') {
            register($db, $data);
        } else {
            sendResponse(false, "Acción no válida");
        }
        break;
        
    default:
        sendResponse(false, "Método no permitido");
        break;
}

function login($db, $data) {
    try {
        $email = sanitize($data['email']);
        $password = sanitize($data['password']);
        
        if (empty($email) || empty($password)) {
            sendResponse(false, "Email y contraseña son requeridos");
            return;
        }
        
        // Buscar usuario por email
        $query = "SELECT u.*, e.NOMBRE as estado_nombre, m.NOMBRE as municipio_nombre, c.NOMBRE as colonia_nombre 
                     FROM USUARIO u
                     LEFT JOIN ESTADOS e ON u.CVE_ESTADO_ = e.CVE_ESTADO_
                     LEFT JOIN MUNICIPIOS m ON u.CVE_MUNICIPIO_ = m.CVE_MUNICIPIO_
                     LEFT JOIN COLONIAS c ON u.CVE_COLONIA_ = c.CVE_COLONIA_
                     WHERE u.EMAIL = :email";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verificar contraseña en tabla LOGIN
            $query_login = "SELECT * FROM LOGIN WHERE EMAIL = :email AND CONTRASENA_ = :password";
            $stmt_login = $db->prepare($query_login);
            $stmt_login->bindParam(":email", $email);
            $stmt_login->bindParam(":password", $password);
            $stmt_login->execute();
            
            if ($stmt_login->rowCount() > 0) {
                sendResponse(true, "Login exitoso", $user);
            } else {
                sendResponse(false, "Contraseña incorrecta");
            }
        } else {
            sendResponse(false, "Usuario no encontrado");
        }
        
    } catch(PDOException $e) {
        sendResponse(false, "Error en el servidor: " . $e->getMessage());
    }
}

function register($db, $data) {
    try {
        $nombre = sanitize($data['nombre']);
        $apellido_paterno = sanitize($data['apellido_paterno']);
        $apellido_materno = sanitize($data['apellido_materno']);
        $telefono = sanitize($data['telefono']);
        $email = sanitize($data['email']);
        $password = sanitize($data['password']);
        
        // Validaciones
        if (empty($nombre) || empty($apellido_paterno) || empty($email) || empty($password)) {
            sendResponse(false, "Todos los campos obligatorios deben ser completados");
            return;
        }
        
        if (!validateEmail($email)) {
            sendResponse(false, "Email no válido");
            return;
        }
      
        if (strlen($password) > 7) {
            sendResponse(false, "La contraseña debe tener máximo 7 caracteres");
            return;
        }
        
        // Verificar si el email ya existe
        $query = "SELECT CVE_USUARIO FROM USUARIO WHERE EMAIL = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            sendResponse(false, "El email ya está registrado");
            return;
        }
        
        // Iniciar transacción
        $db->beginTransaction();
        
        // Insertar en tabla USUARIO
        $query_user = "INSERT INTO USUARIO (NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO_, TELEFONO, EMAIL, FOTO) 
                        VALUES (:nombre, :apellido_paterno, :apellido_materno, :telefono, :email, :foto)";
        
        $stmt_user = $db->prepare($query_user);
        $stmt_user->bindParam(":nombre", $nombre);
        $stmt_user->bindParam(":apellido_paterno", $apellido_paterno);
        $stmt_user->bindParam(":apellido_materno", $apellido_materno);
        $stmt_user->bindParam(":telefono", $telefono);
        $stmt_user->bindParam(":email", $email);
        $foto_default = "default_avatar.png";
        $stmt_user->bindParam(":foto", $foto_default);
        
        if ($stmt_user->execute()) {
            $cve_usuario = $db->lastInsertId();
            
            // Insertar en tabla LOGIN
            $query_login = "INSERT INTO LOGIN (NOMBRE, EMAIL, CONTRASENA_) 
                            VALUES (:nombre, :email, :password)";
            
            $stmt_login = $db->prepare($query_login);
            $stmt_login->bindParam(":nombre", $nombre);
            $stmt_login->bindParam(":email", $email);
            $stmt_login->bindParam(":password", $password);
            
            if ($stmt_login->execute()) {
                $db->commit();
                
                // Obtener usuario completo
                $query = "SELECT * FROM USUARIO WHERE CVE_USUARIO = :cve_usuario";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":cve_usuario", $cve_usuario);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                sendResponse(true, "Usuario registrado exitosamente", $user);
            } else {
                $db->rollBack();
                sendResponse(false, "Error al crear login");
            }
        } else {
            $db->rollBack();
            sendResponse(false, "Error al crear usuario");
        }
        
    } catch(PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        sendResponse(false, "Error en el servidor: " . $e->getMessage());
    }
}
?>