import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Pantallas
import RegistroScreen from './src/screens/RegistroScreen'; 
import LoginScreen from './src/screens/LoginScreen'; 
import HomeScreen from './src/screens/HomeScreen';
import PublicacionScreen from './src/screens/PublicacionScreen';
import PerfilUsuarioScreen from './src/screens/PerfilUsuarioScreen';
import DetallePropiedadScreen from './src/screens/DetallePropiedadScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registro">

        <Stack.Screen 
          name="Registro" 
          component={RegistroScreen} 
          options={{ title: 'Crear Cuenta' }} 
        />

        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Iniciar Sesión' }} 
        />

        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'CasaYa' }} 
        />

        <Stack.Screen 
          name="Publicacion" 
          component={PublicacionScreen} 
          options={{ title: 'Nueva Publicación' }} 
        />

        <Stack.Screen 
          name="Detalle" 
          component={DetallePropiedadScreen} 
          options={{ title: 'Detalle de Propiedad' }}
        />

        <Stack.Screen 
          name="Perfil" 
          component={PerfilUsuarioScreen} 
          options={{ title: 'Mi Perfil' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
