import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    ActivityIndicator, Alert, Image, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// ⚠️ AJUSTA ESTAS URLs A TU IP Y CARPETA /CasaYa/
const API_URL = 'http://192.168.1.147/CasaYa/api/obtener_propiedades.php';
const BASE_URL_IMAGENES = 'http://192.168.1.147/CasaYa/';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [propiedades, setPropiedades] = useState([]);
    const [loading, setLoading] = useState(true);

    // CONFIGURAR HEADER Y OBTENER DATOS
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.headerButtons}>
                    
                    {/* Botón Publicar */}
                    <TouchableOpacity
                        style={styles.publishButtonHeader}
                        onPress={() => navigation.navigate('Publicacion')}
                    >
                        <Text style={styles.publishButtonText}>🏡 Publicar</Text>
                    </TouchableOpacity>

                    {/* Botón Perfil */}
                    <TouchableOpacity
                        style={styles.profileButtonHeader}
                        onPress={() => navigation.navigate('Perfil')}
                    >
                        <Text style={styles.publishButtonText}>👤 Perfil</Text>
                    </TouchableOpacity>
                </View>
            )
        });

        fetchPropiedades();
    }, [navigation]);

    const fetchPropiedades = async () => {
        setLoading(true);

        try {
            const response = await fetch(API_URL);
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                setPropiedades(result.data);
            } else {
                setPropiedades([]);
                Alert.alert("Error", result.mensaje || "No se pudo obtener la lista de propiedades.");
            }

        } catch (error) {
            console.error("Error al obtener propiedades:", error);
            Alert.alert("Error de Conexión", "No se pudo conectar al servidor API.");
        }

        setLoading(false);
    };

    // MOSTRAR CARGA
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    // UI PRINCIPAL CON FLATLIST
    return (
        <FlatList
            data={propiedades}
            keyExtractor={(item) => item.id_propiedad.toString()}
            contentContainerStyle={{ padding: 10, backgroundColor: '#f0f0f0' }}
            
            renderItem={({ item: propiedad }) => (
                <View style={styles.card}>
                    
                    {/* Imagen */}
                    {propiedad.imagenes && propiedad.imagenes.length > 0 && (
                        <Image
                            source={{ uri: BASE_URL_IMAGENES + propiedad.imagenes[0] }}
                            style={styles.cardImage}
                            resizeMode="cover"
                        />
                    )}

                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>{propiedad.titulo || 'Sin Título'}</Text>

                        <View style={styles.detailsRow}>
                            <Text style={styles.priceText}>
                                💰 {propiedad.moneda || 'MXN'} {parseFloat(propiedad.precio || 0).toLocaleString('es-MX')}
                            </Text>
                            <Text style={styles.tag}>{propiedad.tipo_operacion || 'VENTA'}</Text>
                        </View>

                        <Text style={styles.locationText}>
                            📍 {propiedad.ciudad || 'Ciudad Pendiente'}, {propiedad.pais || 'País Pendiente'}
                        </Text>

                        <View style={styles.iconRow}>
                            <Text>📏 {propiedad.metros_cuadrados || 0} m²</Text>
                            <Text>🛌 {propiedad.num_dormitorios || 0}</Text>
                            <Text>🛁 {propiedad.num_banos || 0}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.detailsButton}
                            onPress={() =>
                                navigation.navigate('Detalle', { id_propiedad: propiedad.id_propiedad })
                            }
                        >
                            <Text style={styles.detailsButtonText}>Ver Descripción Completa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            // SI LA LISTA ESTÁ VACÍA
            ListEmptyComponent={() => (
                <View style={styles.centerContainer}>
                    <Text style={styles.noDataText}>🏠 No hay propiedades activas para mostrar.</Text>

                    <TouchableOpacity style={styles.reloadButton} onPress={fetchPropiedades}>
                        <Text style={styles.reloadButtonText}>Recargar Lista</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.publishButtonLarge} 
                        onPress={() => navigation.navigate('Publicacion')}
                    >
                        <Text style={styles.publishButtonLargeText}>¡Publica tu propiedad ahora!</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f4f5f7', 
        padding: 10 
    },

    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    noDataText: { 
        fontSize: 18, 
        color: '#777', 
        marginBottom: 20 
    },

    /* ---- HEADER ---- */
    headerButtons: {
        flexDirection: 'row',
    },
    publishButtonHeader: {
        marginRight: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#2ecc71',
        borderRadius: 8,
        elevation: 3,
    },
    profileButtonHeader: {
        marginRight: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#007bff',
        borderRadius: 8,
        elevation: 3,
    },
    publishButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },

    /* ---- BOTONES GRANDES ---- */
    publishButtonLarge: {
        backgroundColor: '#27ae60',
        padding: 15,
        borderRadius: 10,
        marginTop: 25,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5
    },
    publishButtonLargeText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    reloadButton: {
        backgroundColor: '#6c757d',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    reloadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    /* ---- CARDS ---- */
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
    },
    cardImage: {
        height: 200,
        width: '100%',
    },
    cardBody: {
        padding: 15,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
        color: '#222',
        letterSpacing: 0.3
    },

    /* ---- INFO PRINCIPAL ---- */
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#27ae60',
    },
    tag: {
        backgroundColor: '#ffd966',
        color: '#333',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase',
    },

    locationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },

    /* ---- ICONOS ---- */
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginBottom: 15,
    },

    /* ---- BOTÓN VER DETALLES ---- */
    detailsButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    detailsButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
});


export default HomeScreen;
