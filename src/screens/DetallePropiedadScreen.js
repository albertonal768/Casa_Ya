import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Image, 
    Alert, ActivityIndicator, Dimensions, TouchableOpacity // 👈 AGREGAR TouchableOpacity
} from 'react-native';

// Cambia esta URL si es diferente a tu IP/ruta de AppServ
const API_BASE_URL = 'http://192.168.1.147/CasaYa/api/';

const DetallePropiedadScreen = ({ route, navigation }) => {
    
    // ✅ CORRECCIÓN: Obtener el id_propiedad de forma segura (usa 0 si no existe)
    const id_propiedad = route.params?.id_propiedad || 0; 
    
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const windowWidth = Dimensions.get('window').width;

    // ... (useEffect, fetchDetalle, y manejo de loading/error sin cambios)
    useEffect(() => {
        if (id_propiedad === 0) {
             setLoading(false);
             setError("Error: No se encontró el ID de la propiedad en la navegación.");
             return;
        }

        const fetchDetalle = async () => {
            try {
                // La URL se construye correctamente con el ID recibido
                const response = await fetch(`${API_BASE_URL}obtener_propiedad.php?id=${id_propiedad}`);
                const json = await response.json();

                if (!response.ok || json.success === false) {
                    throw new Error(json.mensaje || `Error al cargar: ${response.status}`);
                }

                setPropiedad(json.propiedad);

            } catch (err) {
                console.error("Error al cargar detalle:", err.message);
                setError(err.message);
                Alert.alert("Error", `No se pudieron cargar los datos. ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDetalle();
    }, [id_propiedad]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>❌ Error al cargar. {error}</Text>
            </View>
        );
    }

    if (!propiedad) {
        return (
            <View style={styles.center}>
                <Text>No se encontró la propiedad.</Text>
            </View>
        );
    }
    
    // Función para construir la URL de la imagen
    const getImageUrl = (url_relativa) => {
        return `${API_BASE_URL.replace('/api/', '/')}${url_relativa}`;
    };

    // FUNCIÓN PARA NAVEGAR AL PERFIL
    const handleVerPerfil = () => {
        // ⚠️ Debes asegurar que esta ruta ('PerfilUsuario') esté definida en tu navegador
        // y que la clave del ID (usuarioId) sea la que espera esa pantalla.
        navigation.navigate('PerfilUsuario', { usuarioId: propiedad.id_agente });
    };

    return (
        <ScrollView style={styles.container}>
            
            {/* GALERÍA DE IMÁGENES */}
            {/* ... (código de galería sin cambios) ... */}
            <ScrollView horizontal pagingEnabled style={{ height: 250, marginBottom: 15 }}>
                {propiedad.fotos && propiedad.fotos.length > 0 ? (
                    propiedad.fotos.map((foto, index) => (
                        <Image
                            key={index}
                            source={{ uri: getImageUrl(foto.url_foto) }}
                            style={{ width: windowWidth, height: 250 }}
                            resizeMode="cover"
                        />
                    ))
                ) : (
                    <View style={[styles.center, { width: windowWidth, backgroundColor: '#eee' }]}>
                        <Text>Sin fotos disponibles</Text>
                    </View>
                )}
            </ScrollView>

            <Text style={styles.title}>{propiedad.titulo}</Text>
            <Text style={styles.price}>${Number(propiedad.precio).toLocaleString('es-MX')} {propiedad.moneda || 'MXN'}</Text>

            {/* ... (Características Principales y Descripción sin cambios) ... */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Características Principales</Text>
                <Text>• Dirección: {propiedad.direccion_completa}, {propiedad.ciudad}, {propiedad.pais}</Text>
                <Text>• Operación: {propiedad.tipo_operacion} | Inmueble: {propiedad.tipo_inmueble}</Text>
                <Text>• Superficie: {propiedad.metros_cuadrados} m²</Text>
                <Text>• Baños: {propiedad.num_banos} | Dormitorios: {propiedad.num_dormitorios}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text>{propiedad.descripcion || 'Sin descripción detallada.'}</Text>
            </View>


                <View style={styles.section}>
    <Text style={styles.sectionTitle}>Información del Contacto</Text>
    
    {/* NOMBRE DEL AGENTE */}
    <Text style={styles.agenteName}>Publicado por: **{propiedad.nombre_agente || 'N/A'}**</Text>
    
    {/* 📞 TELÉFONO CLICKABLE */}
    <TouchableOpacity 
        onPress={() => handleCall(propiedad.telefono_agente)} 
        style={styles.contactItem}
    >
        <Text style={styles.contactText}>📞 Teléfono: {propiedad.telefono_agente || 'No disponible'}</Text>
    </TouchableOpacity>

    {/* 📧 CORREO CLICKABLE */}
    <TouchableOpacity 
        onPress={() => handleEmail(propiedad.correo_agente)}
        style={styles.contactItem}
    >
        <Text style={styles.contactText}>📧 Correo: {propiedad.correo_agente || 'No disponible'}</Text>
    </TouchableOpacity>

                            
            </View>
            
            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f9f9f9' 
    },

    loading: { 
        flex: 1, 
        justifyContent: 'center' 
    },

    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    errorText: { 
        color: 'red', 
        fontSize: 16, 
        padding: 20 
    },

    /* TÍTULO PRINCIPAL */
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        marginHorizontal: 15, 
        marginBottom: 5,
        color: '#333'
    },

    /* PRECIO */
    price: { 
        fontSize: 26, 
        color: '#27ae60', 
        fontWeight: '700', 
        marginHorizontal: 15, 
        marginBottom: 20,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    },

    /* SECCIONES */
    section: { 
        marginHorizontal: 15, 
        marginBottom: 20, 
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4
    },

    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 10,
        color: '#444'
    },

    /* NOMBRE DEL AGENTE */
    agenteName: { 
        fontSize: 17, 
        marginBottom: 12, 
        color: '#333'
    },

    /* ITEM DE CONTACTO */
    contactItem: {
        backgroundColor: '#eef6ff',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#d0e4ff'
    },

    contactText: {
        fontSize: 16,
        color: '#0057b7',
        fontWeight: '500'
    },

    /* BOTÓN DE VER PERFIL (por si lo usas) */
    profileButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 10,
        marginTop: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3
    },

    profileButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});


export default DetallePropiedadScreen;