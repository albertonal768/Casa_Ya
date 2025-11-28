// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS, apiRequest } from '../api/config';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [hospedajes, setHospedajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const user = JSON.parse(data);
        setUserData(user);
        fetchUserHospedajes(user.CVE_USUARIO);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHospedajes = async (userId) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.HOSPEDAJES_BY_USER(userId));
      if (response.success) {
        setHospedajes(response.data);
      }
    } catch (error) {
      console.error('Error fetching user hospedajes:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error al cargar datos del usuario</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con imagen de perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: userData.FOTO || 'https://via.placeholder.com/120',
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>
          {userData.NOMBRE} {userData.APELLIDO_PATERNO} {userData.APELLIDO_MATERNO_}
        </Text>
        <Text style={styles.email}>{userData.EMAIL}</Text>
      </View>

      {/* Información del usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.infoRow}>
          <Icon name="call-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>{userData.TELEFONO || 'No especificado'}</Text>
        </View>

        {userData.estado_nombre && (
          <View style={styles.infoRow}>
            <Icon name="location-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>
              {userData.colonia_nombre && `${userData.colonia_nombre}, `}
              {userData.municipio_nombre && `${userData.municipio_nombre}, `}
              {userData.estado_nombre}
            </Text>
          </View>
        )}
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{hospedajes.length}</Text>
          <Text style={styles.statLabel}>Publicaciones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {userData.estadisticas?.total_solicitudes || 0}
          </Text>
          <Text style={styles.statLabel}>Solicitudes</Text>
        </View>
      </View>

      {/* Mis Publicaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Publicaciones</Text>
        
        {hospedajes.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="home-outline" size={50} color="#d1d5db" />
            <Text style={styles.emptyText}>No tienes publicaciones aún</Text>
          </View>
        ) : (
          hospedajes.map((item) => (
            <TouchableOpacity
              key={item.CVE_HOSPEDAJE}
              style={styles.hospedajeCard}
              onPress={() => navigation.navigate('HospedajeDetail', { hospedaje: item })}
            >
              <Image
                source={{
                  uri: item.IMAGEM || 'https://via.placeholder.com/100',
                }}
                style={styles.hospedajeImage}
              />
              <View style={styles.hospedajeInfo}>
                <Text style={styles.hospedajeTitle} numberOfLines={2}>
                  {item.DESCRIPCION}
                </Text>
                <Text style={styles.hospedajeLocation} numberOfLines={1}>
                  {item.DIRECCION}
                </Text>
                <Text style={styles.hospedajeDate}>
                  {new Date(item.fecha_publicacion).toLocaleDateString('es-MX')}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
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
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  email: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoText: {
    fontSize: 15,
    color: '#4b5563',
    marginLeft: 15,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 10,
  },
  hospedajeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  hospedajeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  hospedajeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hospedajeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  hospedajeLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  hospedajeDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 30,
  },
});
