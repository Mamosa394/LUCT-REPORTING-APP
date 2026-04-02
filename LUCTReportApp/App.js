// App.js
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import store from './src/store';
import AppNavigator from './app/navigation/AppNavigator';
import { paperTheme, COLORS } from './config/theme';
import { loadStoredUser } from './src/store/authSlice';

// Component to load stored user data
function AppInitializer() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Load stored user data when app starts
    dispatch(loadStoredUser());
  }, [dispatch]);
  
  return <AppNavigator />;
}

export default function App() {
  const AppContent = () => (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="light" backgroundColor={COLORS.background} />
          <AppInitializer />
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );

  // For web, don't use GestureHandlerRootView
  if (Platform.OS === 'web') {
    return <AppContent />;
  }

  // For native, wrap with GestureHandlerRootView
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppContent />
    </GestureHandlerRootView>
  );
}