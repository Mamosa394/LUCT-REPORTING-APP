// App.js
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import AppNavigator from './app/navigation/AppNavigator';
import { paperTheme, COLORS } from './config/theme';  
import notificationService from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Initialize notifications
    notificationService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PaperProvider theme={paperTheme}>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <AppNavigator />
          </PaperProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}