import React, { useState, useRef } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TextInput, 
    TouchableOpacity, Alert, ActivityIndicator, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://192.168.1.147/CasaYa/api/publicar_propiedad.php';

const PublicacionScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [tipoOperacion, setTipoOperacion] = useState('Venta');
    const [tipoInmueble, setTipoInmueble] = useState('Casa');
    const [direccionCompleta, setDireccionCompleta] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [pais, setPais] = useState('México');
    const [numBanos, setNumBanos] = useState('');
    const [numDormitorios, setNumDormitorios] = useState('');
    const [metrosCuadrados, setMetrosCuadrados] = useState('');
    const [imagenes, setImagenes] = useState([]);

    const inputRef = useRef(null);

    // ====================================================
    //   SELECCIONAR IMÁGENES (WEB + ANDROID + iOS)
    // ====================================================
    const handleSeleccionarImagenes = async () => {

        if (Platform.OS === "web") {
            inputRef.current.click();
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permiso requerido", "Debes permitir acceso a la galería.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 10,
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            setImagenes(result.assets);
        }
    };

    // Manejar selección de imágenes en WEB
    const onFileChangeWeb = (e) => {
        const files = Array.from(e.target.files);
        setImagenes(files); // aquí son Files reales
    };

    // ====================================================
    //       PUBLICAR
    // ====================================================
    const handlePublicar = async () => {

        if (!titulo.trim() || !precio || !direccionCompleta.trim()) {
            Alert.alert("Error", "Completa título, precio y dirección.");
            return;
        }

        if (imagenes.length === 0) {
            Alert.alert("Error", "Debes seleccionar al menos una imagen.");
            return;
        }

        setLoading(true);

        const id_usuario_publica = 1;

        const formData = new FormData();

        formData.append("id_usuario_publica", id_usuario_publica);
        formData.append("titulo", titulo);
        formData.append("descripcion", descripcion);
        formData.append("precio", Number(precio).toFixed(2));
        formData.append("tipo_operacion", tipoOperacion);
        formData.append("tipo_inmueble", tipoInmueble);
        formData.append("direccion_completa", direccionCompleta);
        formData.append("ciudad", ciudad);
        formData.append("pais", pais);
        formData.append("num_banos", Number(numBanos || 0));
        formData.append("num_dormitorios", Number(numDormitorios || 0));
        formData.append("metros_cuadrados", Number(metrosCuadrados || 0).toFixed(2));

        // ============================
        //   IMÁGENES
        // ============================
        imagenes.forEach((img, index) => {
            if (Platform.OS === "web") {
                // IMG es un File real
                formData.append("imagenes[]", img);
            } else {
                // MOBILE: iOS / ANDROID
                const mimeType = img.mimeType || "image/jpeg";
                const extension = mimeType.split('/')[1] || "jpg";

                const fileName = `propiedad_${id_usuario_publica}_${Date.now()}_${index}.${extension}`;

                formData.append("imagenes[]", {
                    uri: img.uri,
                    name: fileName,
                    type: mimeType
                });
            }
        });

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            const textResponse = await response.text();
            let json;

            try {
                json = JSON.parse(textResponse);
            } catch (e) {
                throw new Error(`Error en servidor: ${textResponse}`);
            }

            if (!response.ok || json.success === false) {
                throw new Error(json.mensaje || "Error al publicar.");
            }

            Alert.alert("Listo", json.mensaje);
            navigation.goBack();

        } catch (error) {
            console.log("❌ Error:", error.message);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* INPUT FILE (WEB) */}
            {Platform.OS === "web" && (
                <input 
                    type="file"
                    accept="image/*"
                    multiple
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={onFileChangeWeb}
                />
            )}

            <Text style={styles.header}>Nueva Publicación</Text>

            <TextInput placeholder="Título" value={titulo} onChangeText={setTitulo} style={styles.input} />

            <TextInput 
                placeholder="Descripción" 
                value={descripcion} 
                onChangeText={setDescripcion} 
                multiline 
                style={[styles.input, styles.textArea]} 
            />

            <TouchableOpacity style={styles.imageButton} onPress={handleSeleccionarImagenes}>
                <Text style={styles.imageButtonText}>Seleccionar Fotos ({imagenes.length})</Text>
            </TouchableOpacity>

            <ScrollView horizontal>
                {imagenes.map((img, i) => (
                    <Image 
                        key={i} 
                        source={{ uri: Platform.OS === "web" ? URL.createObjectURL(img) : img.uri }}
                        style={styles.imagePreview} 
                    />
                ))}
            </ScrollView>

            <TextInput placeholder="Precio" value={precio} keyboardType="numeric" onChangeText={setPrecio} style={styles.input} />

            <TextInput placeholder="Tipo de operación" value={tipoOperacion} onChangeText={setTipoOperacion} style={styles.input} />
            <TextInput placeholder="Tipo de inmueble" value={tipoInmueble} onChangeText={setTipoInmueble} style={styles.input} />

            <TextInput placeholder="Dirección completa" value={direccionCompleta} onChangeText={setDireccionCompleta} style={styles.input} />
            <TextInput placeholder="Ciudad" value={ciudad} onChangeText={setCiudad} style={styles.input} />
            <TextInput placeholder="País" value={pais} onChangeText={setPais} style={styles.input} />

            <View style={styles.row}>
                <TextInput placeholder="Baños" value={numBanos} onChangeText={setNumBanos} keyboardType="numeric" style={[styles.input, styles.halfInput]} />
                <TextInput placeholder="Dormitorios" value={numDormitorios} onChangeText={setNumDormitorios} keyboardType="numeric" style={[styles.input, styles.halfInput]} />
            </View>

            <TextInput placeholder="Metros cuadrados" value={metrosCuadrados} onChangeText={setMetrosCuadrados} keyboardType="numeric" style={styles.input} />

            <TouchableOpacity style={styles.publishButton} onPress={handlePublicar} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishButtonText}>Publicar</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
    textArea: { height: 100, textAlignVertical: "top" },
    imageButton: { backgroundColor: "#3498db", padding: 15, borderRadius: 8, marginBottom: 15 },
    imageButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
    imagePreview: { width: 80, height: 80, marginRight: 10, borderRadius: 8 },
    publishButton: { backgroundColor: "#2ecc71", padding: 18, borderRadius: 8, marginTop: 10 },
    publishButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" },
    row: { flexDirection: "row", justifyContent: "space-between" },
    halfInput: { width: "48%" }
});

export default PublicacionScreen;
