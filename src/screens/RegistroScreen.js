import React, { useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    ScrollView 
} from 'react-native';

// La URL de tu servidor/API. ¡AJUSTA ESTA URL A TU IP O 10.0.2.2!
const API_URL = 'http://192.168.1.147/casaya/api/registro.php'; 

// CLAVE: El componente debe recibir 'navigation' como prop
const RegistroScreen = ({ navigation }) => {
    
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState(''); // Incluimos el teléfono
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);

    // Función para manejar el envío del formulario
    const handleRegister = async () => {
        setLoading(true);

        // 1. Validación de datos en el cliente
        if (!nombre || !correo || !contrasena) {
            Alert.alert("Error", "Por favor, llena todos los campos requeridos (*).");
            setLoading(false);
            return;
        }

        try {
            // 2. Envío de datos al API PHP (registro.php)
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    correo: correo,
                    telefono: telefono, // Lo enviamos, aunque sea opcional
                    contrasena: contrasena,
                }),
            });

            // 3. Lectura de la respuesta del API
            const result = await response.json();
            setLoading(false); 

            if (response.ok && result.success) { // Código 200-299 & success: true
                Alert.alert("Éxito", result.mensaje || "¡Registro completado!");
                
                // 4. Redirigir al Login. Esto SOLUCIONA el error 'navigate'
                navigation.navigate('Login'); 
            } else { 
                // Códigos de error (400, 409 Conflict, 500 Server Error)
                Alert.alert("Error de Registro", result.mensaje || "Ocurrió un error desconocido.");
            }

        } catch (error) {
            setLoading(false);
            console.error("Error de Conexión o Red:", error);
            // Si llega aquí, es un error de red o timeout
            Alert.alert("Error de Conexión", 
                "No se pudo conectar al servidor. Verifica tu IP, AppServ y el Firewall.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Crear Cuenta CasaYa</Text>
                <Text style={styles.subtitle}>Encuentra tu próximo hogar hoy.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    value={nombre}
                    onChangeText={setNombre}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    value={correo}
                    onChangeText={setCorreo}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Teléfono"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña "
                    value={contrasena}
                    onChangeText={setContrasena}
                    secureTextEntry={true} 
                />
                
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" style={styles.button} />
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Registrarse en CasaYa</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

// --- ESTILOS DE REACT NATIVE ---
const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5', // Fondo ligero
    },
    container: {
        padding: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#007bff', // Azul primario
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        height: 55,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        shadowColor: '#000', // Sombra sutil para profundidad
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2, // Sombra en Android
    },
    button: {
        backgroundColor: '#007bff',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        marginTop: 15,
        textAlign: 'center',
        color: '#007bff',
        fontSize: 16,
        textDecorationLine: 'underline',
    }
});

export default RegistroScreen;