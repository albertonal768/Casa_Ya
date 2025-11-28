
const API_BASE_URL = 'http://192.168.1.146/casaya';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth.php?action=login`,
  REGISTER: `${API_BASE_URL}/auth.php?action=register`,
  
  // Hospedajes
  HOSPEDAJES: `${API_BASE_URL}/hospedaje.php`,
  HOSPEDAJE_BY_ID: (id) => `${API_BASE_URL}/hospedaje.php?id=${id}`,
  HOSPEDAJES_BY_USER: (userId) => `${API_BASE_URL}/hospedaje.php?usuario=${userId}`,
  
  // Usuario
  USUARIO: (id) => `${API_BASE_URL}/usuario.php?id=${id}`,
  
  // Solicitudes
  SOLICITUDES_BY_USER: (userId) => `${API_BASE_URL}/solicitudes.php?usuario=${userId}`,
  SOLICITUDES_BY_HOSPEDAJE: (hospedajeId) => `${API_BASE_URL}/solicitudes.php?hospedaje=${hospedajeId}`,
  CREATE_SOLICITUD: `${API_BASE_URL}/solicitudes.php`,
};



/**
 * @param {string} endpoint 
 * @param {string} method 
 * @param {object} [data=null] 
 * @returns {Promise<object>} 
 */
export const apiRequest = async (endpoint, method = 'GET', data = null) => {
    
    const url = endpoint;
    
    // Configuración básica de la petición
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(data);
    }

    try {
        console.log(`[API] Llamando a: ${url} con método: ${method}`);
        
        const response = await fetch(url, options);

        let responseData;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseData = await response.json();
        } else {
            throw new Error(`Respuesta no JSON del servidor. Estado HTTP: ${response.status}`);
        }

        if (!response.ok) {
            const message = responseData.message || `Error HTTP ${response.status}: ${response.statusText}`;
            throw new Error(message);
        }

        return responseData; 
        
    } catch (error) {
        console.error("API Request Falló:", error.message);
        return { 
            success: false, 
            message: error.message || "Error de red o conexión al servidor" 
        };
    }
};

// =================================================================
// EXPORTACIÓN FINAL
// =================================================================

export default API_BASE_URL;