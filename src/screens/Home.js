import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, PermissionsAndroid, Platform, Text, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const Home = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Fade animation for current screen
  const [nextScreenFadeAnim] = useState(new Animated.Value(0)); // Fade animation for next screen
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const storedPermissionStatus = await AsyncStorage.getItem('permissionsGranted');
        if (storedPermissionStatus === 'true') {
          setPermissionsGranted(true);
        }
      } catch (error) {
        console.error('Error checking stored permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, // Smooth fade-in effect
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fadeOutAndContinue = (nextStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500, // Fade-out animation matches fade-in
      useNativeDriver: true,
    }).start(() => {
      setShowWelcome(false);
      setPermissionsGranted(nextStep);
      Animated.timing(nextScreenFadeAnim, {
        toValue: 1,
        duration: 500, // Smooth fade-in for the next screen
        useNativeDriver: true,
      }).start();
    });
  };

  const requestPermissions = async () => {
    try {
      const usageStatsGranted = await NativeModule.requestUsageStatsPermission();
      const mediaPermissions = await requestMediaPermissions();

      if (usageStatsGranted && mediaPermissions) {
        await AsyncStorage.setItem('permissionsGranted', 'true');
        fadeOutAndContinue(true); // Move to the main page
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'An error occurred while requesting permissions.');
    }
  };

  const requestMediaPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 30) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);
        return Object.values(granted).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return false;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (showWelcome) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Welcome to My App Analysis Application</Text>
        <Button
          title="Continue"
          onPress={() => fadeOutAndContinue(permissionsGranted)}
          color="#6200EE"
        />
      </Animated.View>
    );
  }

  if (!permissionsGranted) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Requesting Permissions...</Text>
        <Button title="Grant Permissions" onPress={requestPermissions} color="#6200EE" />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: nextScreenFadeAnim }]}>
      <Text style={styles.title}>Main Page</Text>
      <Text style={styles.subtitle}>Manage permissions and navigate seamlessly</Text>
      <View style={styles.buttonContainer}>
        <Button title="App Analysis" onPress={() => navigation.navigate('App Analysis')} color="#BB86FC" />
        <View style={styles.spacing} />
        <Button title="Media Analysis" onPress={() => navigation.navigate('Media Analysis')} color="#FF0266" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020203',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ebd8d8',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  spacing: {
    height: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default Home;
