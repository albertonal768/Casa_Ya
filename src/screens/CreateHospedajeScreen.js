// src/screens/CreateHospedajeScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS, apiRequest } from '../api/config';

export default function CreateHospedajeScreen({ navigation }) {
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [imagen, setImagen] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!descripcion || !direccion) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        Alert.alert('Error', 'No se pudo obtener información del usuario');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userDataStr);

      const response = await apiRequest(API_ENDPOINTS.HOSPEDAJES, 'POST', {
        cve_usuario: userData.CVE_USUARIO,
        descripcion: descripcion.trim(),
        direccion: direccion.trim(),
        imagen: imagen.trim() || 'https://via.placeholder.com/400x250?text=Casa',
      });

      if (response.success) {
        Alert.alert(
          'Éxito',
          'Tu publicación ha sido creada exitosamente',
          [
            {
              text: 'Ver Inicio',
              onPress: () => {
                setDescripcion('');
                setDireccion('');
                setImagen('');
                navigation.navigate('Home');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nueva Publicación</Text>
          <Text style={styles.headerSubtitle}>
            Comparte tu propiedad con la comunidad
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Descripción <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.textAreaContainer}>
              <Icon
                name="document-text-outline"
                size={20}
                color="#6b7280"
                style={styles.textAreaIcon}
              />
              <TextInput
                style={styles.textArea}
                placeholder="Ej: Casa amplia de 3 recámaras, 2 baños, con jardín..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                maxLength={200}
                editable={!loading}
              />
            </View>
            <Text style={styles.charCount}>{descripcion.length}/200</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Dirección <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Icon
                name="location-outline"
                size={20}
                color="#6b7280"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Calle, Número, Colonia, Ciudad"
                value={direccion}
                onChangeText={setDireccion}
                maxLength={200}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de Imagen (opcional)</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="image-outline"
                size={20}
                color="#6b7280"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imagen}
                onChangeText={setImagen}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            <Text style={styles.helperText}>
              Si no proporcionas una imagen, se usará una por defecto
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              Asegúrate de proporcionar información detallada y veraz sobre tu
              propiedad
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Publicar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setDescripcion('');
              setDireccion('');
              setImagen('');
            }}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Limpiar Campos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 15,
  },
  textAreaIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
});