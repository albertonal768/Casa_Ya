import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, ActivityIndicator, 
    Alert, TouchableOpacity, Linking 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://192.168.1.147/CasaYa/api/obtener_perfil.php';

const PerfilUsuarioScreen = () => {
    const navigation = useNavigation();
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userId = 1; 

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await fetch(`${API_URL}?id_usuario=${userId}`);
                const json = await response.json();

                if (!response.ok || json.success === false) {
                    throw new Error(json.mensaje || "Error al cargar el perfil.");
                }

                setPerfil(json.perfil);

            } catch (err) {
                console.error("Error al cargar perfil:", err.message);
                setError(err.message);
                Alert.alert("Error de Conexión", `No se pudieron cargar los datos del perfil. (${err.message})`);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, [userId]);

    const handleCall = (phoneNumber) => {
        if (phoneNumber) {
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, ''); 
            Linking.openURL(`tel:${cleanNumber}`);
        }
    };

    const handleEmail = (email) => {
        if (email) {
            Linking.openURL(`mailto:${email}`);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres cerrar tu sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sí, Cerrar", 
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ],
            { cancelable: false }
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>❌ Error al cargar el perfil. {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.name}>{perfil?.nombre || 'Usuario Desconocido'}</Text>
                <Text style={styles.role}>Rol: {perfil?.rol || 'Miembro'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contacto e Identificación</Text>

                <TouchableOpacity onPress={() => handleEmail(perfil?.correo)}>
                    <Text style={styles.detailText}>📧 Email: {perfil?.correo || 'N/A'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleCall(perfil?.telefono)}>
                    <Text style={styles.detailText}>📱 Teléfono: {perfil?.telefono || 'N/A'}</Text>
                </TouchableOpacity>

                <Text style={styles.detailText}># ID de Usuario: {perfil?.id_usuario}</Text>
            </View>

            <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#f4f5f7',
        padding: 20
    },

    /* ---- CARGANDO / ERROR ---- */
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#444'
    },
    errorText: {
        color: '#d9534f',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 20
    },

    /* ---- HEADER DEL PERFIL ---- */
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 25,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    name: {
        fontSize: 26,
        fontWeight: '800',
        color: '#222'
    },
    role: {
        marginTop: 5,
        fontSize: 15,
        color: '#007bff',
        fontWeight: '600'
    },

    /* ---- SECCIÓN DE INFORMACIÓN ---- */
    section: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#444',
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    detailText: {
        fontSize: 17,
        color: '#333',
        marginBottom: 10,
        paddingVertical: 4
    },

    /* ---- BOTÓN DE LOGOUT ---- */
    logoutButton: {
        backgroundColor: '#e63946',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
        elevation: 5,
        shadowColor: '#e63946',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5
    }
});

export default PerfilUsuarioScreen;
