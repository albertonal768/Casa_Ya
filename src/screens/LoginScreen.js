import React, { useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// ⚠️ AJUSTA ESTA URL a tu IP o localhost para acceder a login.php
const API_URL = 'http://192.168.1.147/casaya/api/login.php'; 

const LoginScreen = ({ navigation }) => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Guarda el ID, nombre y rol del usuario en el almacenamiento local 
     * para mantener la sesión abierta.
     */
    const saveUserData = async (userData) => {
        try {
            await AsyncStorage.setItem('@CasaYa_user', JSON.stringify(userData));
        } catch (e) {
            console.error("Error al guardar la sesión:", e);
        }
    };

    const handleLogin = async () => {
        setLoading(true);

        if (!correo || !contrasena) {
            Alert.alert("Error", "Por favor, ingresa tu correo y contraseña.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena }),
            });

            // Intenta siempre leer la respuesta JSON, incluso si el estado no es 200
            const result = await response.json();
            setLoading(false);

            if (response.ok && result.success) { 
                // Login Exitoso (código 200)
                await saveUserData(result.usuario); // Guarda el ID, nombre, y rol
                
                Alert.alert("Bienvenido", `¡Hola de nuevo, ${result.usuario.nombre}!`);
                
                // Redirigir a la pantalla principal Home
                navigation.navigate('Home'); 

            } else { 
                // Login Fallido (código 401, 500, etc.)
                // Muestra el mensaje de error que devuelve el PHP
                Alert.alert("Error de Acceso", result.mensaje || "Ocurrió un error desconocido.");
            }

        } catch (error) {
            setLoading(false);
            console.error("Error al conectar con la API:", error);
            Alert.alert("Error de Conexión", "No se pudo conectar al servidor. Verifica tu URL/IP.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión CasaYa</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
            />

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.button} />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
                <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        height: 50,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#007bff',
        textAlign: 'center',
        marginTop: 10,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;