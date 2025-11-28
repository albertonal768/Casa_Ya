<?php

class Database {
    private $host = "127.0.0.1"; 
    private $db_name = "casaya";
    private $username = "root";
    private $password = "12345678"; 
    public $conn;

    public function getConnection(){
        $this->conn = null;
        try{
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                                  $this->username, 
                                  $this->password,
                                  array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)); 
            $this->conn->exec("set names utf8");
        }catch(PDOException $exception){
            header('Content-Type: application/json'); 
            echo json_encode(['success' => false, 'message' => "ERROR FATAL DE CONEXIÓN A DB: " . $exception->getMessage()]);
            die(); // Detiene la ejecución aquí
        }
        return $this->conn;
    }
}


// ======================================================
/**
 * Función genérica para enviar la respuesta JSON al cliente.
 * @param bool $success Indica si la operación fue exitosa.
 * @param string $message Mensaje descriptivo.
 * @param array $data Datos adicionales a enviar (opcional).
 */
function sendResponse($success, $message, $data = null) {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=UTF-8');
    }
    
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit(); // Detiene la ejecución del script después de enviar la respuesta
}

/**
 * @param string $data El valor a sanear.
 * @return string El valor saneado.
 */
function sanitize($data) {
    if (!isset($data)) return null;
    // Usa htmlspecialchars para evitar ataques XSS
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Función para validar el formato de email.
 * @param string $email El email a validar.
 * @return bool True si el email es válido.
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}
?>