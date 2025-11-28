// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
//import { API_ENDPOINTS, apiRequest, testConnection } from '../api/config';

export default function HomeScreen({ navigation }) {
  const [hospedajes, setHospedajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeScreen montado, cargando datos...');
      fetchHospedajes();
    }, [])
  );

  const fetchHospedajes = async () => {
    try {
      setError(null);
      console.log('📡 Obteniendo hospedajes...');
      
      const response = await apiRequest(API_ENDPOINTS.HOSPEDAJES);
      console.log('📦 Respuesta del servidor:', response);

      if (response.success) {
        console.log(`✅ ${response.data.length} hospedajes encontrados`);
        setHospedajes(response.data);
      } else {
        console.error('❌ Error en respuesta:', response.message);
        setError(response.message);
      }
    } catch (error) {
      console.error('❌ Error al obtener hospedajes:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('🔄 Refrescando datos...');
    setRefreshing(true);
    fetchHospedajes();
  };

  const handleTestConnection = async () => {
    Alert.alert('Probando conexión', 'Verificando servidor...');
    const result = await testConnection();
    if (result) {
      Alert.alert('✅ Conexión exitosa', 'El servidor está respondiendo correctamente');
    } else {
      Alert.alert('❌ Error de conexión', 'No se pudo conectar con el servidor. Verifica la URL en config.js');
    }
  };

  const renderHospedaje = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        console.log('👆 Navegando a detalle:', item.CVE_HOSPEDAJE);
        navigation.navigate('HospedajeDetail', { hospedaje: item });
      }}
    >
      <Image
        source={{
          uri: item.IMAGEM || 'https://via.placeholder.com/400x250?text=Casa',
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.DESCRIPCION}
        </Text>
        <View style={styles.cardInfo}>
          <Icon name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.cardLocation} numberOfLines={1}>
            {item.DIRECCION}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.ownerInfo}>
            <Image
              source={{
                uri: item.propietario_foto || 'https://via.placeholder.com/40',
              }}
              style={styles.ownerAvatar}
            />
            <Text style={styles.ownerName}>
              {item.propietario_nombre} {item.propietario_apellido}
            </Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.fecha_publicacion).toLocaleDateString('es-MX')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando propiedades...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CasaYa</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#dc2626" />
          <Text style={styles.errorTitle}>Error de Conexión</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHospedajes}>
            <Icon name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
            <Text style={styles.testButtonText}>Probar Conexión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CasaYa</Text>
        <Text style={styles.headerSubtitle}>Encuentra tu hogar ideal</Text>
      </View>

      {hospedajes.length === 0 ? (
        <ScrollView 
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Icon name="home-outline" size={80} color="#d1d5db" />
          <Text style={styles.emptyText}>No hay publicaciones disponibles</Text>
          <Text style={styles.emptySubtext}>
            Sé el primero en publicar una propiedad
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateHospedaje')}
          >
            <Icon name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Crear Publicación</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={handleTestConnection}
          >
            <Text style={styles.debugButtonText}>🔧 Probar Conexión</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={hospedajes}
          renderItem={renderHospedaje}
          keyExtractor={(item) => item.CVE_HOSPEDAJE.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 5,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  ownerName: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugButton: {
    marginTop: 15,
    padding: 10,
  },
  debugButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testButton: {
    marginTop: 10,
    padding: 12,
  },
  testButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
});
