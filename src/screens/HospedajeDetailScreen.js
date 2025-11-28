// src/screens/HospedajeDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HospedajeDetailScreen({ route, navigation }) {
  const { hospedaje } = route.params;

  const handleCall = () => {
    if (hospedaje.propietario_telefono) {
      Linking.openURL(`tel:${hospedaje.propietario_telefono}`);
    } else {
      Alert.alert('Info', 'No hay teléfono disponible');
    }
  };

  const handleEmail = () => {
    if (hospedaje.propietario_email) {
      Linking.openURL(`mailto:${hospedaje.propietario_email}`);
    } else {
      Alert.alert('Info', 'No hay email disponible');
    }
  };

  const handleSolicitud = () => {
    Alert.alert(
      'Solicitar Información',
      '¿Deseas enviar una solicitud de información sobre esta propiedad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            // Aquí podrías implementar la lógica para crear una solicitud
            Alert.alert('Éxito', 'Tu solicitud ha sido enviada');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: hospedaje.IMAGEM || 'https://via.placeholder.com/400x300?text=Casa',
        }}
        style={styles.mainImage}
      />

      <View style={styles.content}>
        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.title}>{hospedaje.DESCRIPCION}</Text>
          
          <View style={styles.dateContainer}>
            <Icon name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.date}>
              Publicado el {new Date(hospedaje.fecha_publicacion).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location" size={24} color="#2563eb" />
            <Text style={styles.sectionTitle}>Ubicación</Text>
          </View>
          <Text style={styles.address}>{hospedaje.DIRECCION}</Text>
        </View>

        {/* Información del propietario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="person" size={24} color="#2563eb" />
            <Text style={styles.sectionTitle}>Propietario</Text>
          </View>
          
          <View style={styles.ownerCard}>
            <Image
              source={{
                uri: hospedaje.propietario_foto || 'https://via.placeholder.com/60',
              }}
              style={styles.ownerAvatar}
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>
                {hospedaje.propietario_nombre} {hospedaje.propietario_apellido}
              </Text>
              {hospedaje.propietario_apellido_materno && (
                <Text style={styles.ownerFullName}>
                  {hospedaje.propietario_apellido_materno}
                </Text>
              )}
              {hospedaje.propietario_telefono && (
                <View style={styles.contactRow}>
                  <Icon name="call" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>
                    {hospedaje.propietario_telefono}
                  </Text>
                </View>
              )}
              {hospedaje.propietario_email && (
                <View style={styles.contactRow}>
                  <Icon name="mail" size={14} color="#6b7280" />
                  <Text style={styles.contactText} numberOfLines={1}>
                    {hospedaje.propietario_email}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Icon name="call" size={24} color="#2563eb" />
            <Text style={styles.actionText}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Icon name="mail" size={24} color="#2563eb" />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSolicitud}>
            <Icon name="paper-plane" size={24} color="#2563eb" />
            <Text style={styles.actionText}>Solicitar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón principal */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleSolicitud}>
          <Text style={styles.primaryButtonText}>
            Solicitar Información Completa
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#e5e7eb',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  address: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  ownerCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  ownerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  ownerFullName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 5,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});