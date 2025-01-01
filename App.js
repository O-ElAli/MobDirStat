import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NativeModules } from 'react-native';

import Home from './src/screens/Home';
import AppAnalysis from './src/screens/AppAnalysis';
import MediaAnalysis from './src/screens/MediaAnalysis';
import TestBridge from './src/screens/TestBridge';

const { NativeModule } = NativeModules;
const Stack = createStackNavigator();

const PermissionsScreen = ({ navigation }) => {
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        // Check permissions on initial load
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const hasPermission = await NativeModule.checkUsagePermission();
        if (hasPermission) {
            setPermissionGranted(true);
            navigation.replace('Home'); // Redirect to the Home screen
        }
    };

    const requestPermission = async () => {
      await NativeModule.requestUsageStatsPermission();
      // After opening the settings, allow users to check permission again
      const hasPermission = await NativeModule.checkUsagePermission();
      if (hasPermission) {
          setPermissionGranted(true);
          navigation.replace('Home'); // Redirect to the Home screen
      } else {
          alert('Permission not granted. Please enable it in settings.');
      }
  };
  

    if (permissionGranted) {
        return null; // Hide this screen once permissions are granted
    }

    return (
        <View>
            <Text>Permission is required to analyze apps.</Text>
            <Button title="Grant Permission" onPress={requestPermission} />
        </View>
    );
};

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="App Analysis" component={AppAnalysis} />
            <Stack.Screen name="Media Analysis" component={MediaAnalysis} />
            <Stack.Screen name="TestBridge" component={TestBridge} />
          </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
