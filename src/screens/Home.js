import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, PermissionsAndroid, Platform, Text, Animated } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const Home = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [stage, setStage] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [stage]);

  const requestMediaPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 30) { // Android 11+
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ]);

          if (
            granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            return true;
          } else {
            Alert.alert('Permissions required', 'Please grant media permissions in settings.');
            return false;
          }
        } else { // Android 10 and below
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          } else {
            Alert.alert('Permission required', 'Please grant media permissions in settings.');
            return false;
          }
        }
      } else {
        Alert.alert('Unsupported platform', 'Media analysis is supported only on Android.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      Alert.alert('Error', 'An error occurred while requesting media permissions.');
      return false;
    }
  };

  const requestUsageStatsPermission = async () => {
    try {
      const granted = await NativeModule.requestUsageStatsPermission();
      if (granted) {
        return true;
      } else {
        Alert.alert('Permission not granted', 'Please enable it in settings.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting usage stats permission:', error);
      Alert.alert('Error', 'An error occurred while requesting usage stats permission.');
      return false;
    }
  };

  const handlePermissions = async () => {
    const usageStatsGranted = await requestUsageStatsPermission();
    if (usageStatsGranted) {
      const mediaGranted = await requestMediaPermissions();
      if (mediaGranted) {
        setStage(3);
      }
    }
  };

  if (stage === 0) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Welcome to My App Analysis App</Text>
        <Button title="Next" onPress={() => { setStage(1); fadeAnim.setValue(0); }} color="#6200EE" />
      </Animated.View>
    );
  }

  if (stage === 1) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Before we start...</Text>
        <Text style={styles.subtitle}>This app requires a few permissions to function. Ready to proceed?</Text>
        <Button title="Go" onPress={() => { setStage(2); fadeAnim.setValue(0); }} color="#6200EE" />
      </Animated.View>
    );
  }

  if (stage === 2) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Requesting Permissions...</Text>
        <Button title="Grant Permissions" onPress={handlePermissions} color="#6200EE" />
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Page</Text>
      <Text style={styles.subtitle}>Manage permissions and navigate seamlessly</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="App Analysis"
          onPress={() => navigation.navigate('App Analysis')}
          color="#BB86FC"
        />
        <View style={styles.spacing} />
        <Button
          title="Media Analysis"
          onPress={() => navigation.navigate('Media Analysis')}
          color="#FF0266"
        />
        <View style={styles.spacing} />
        <Button
          title="Test Bridge"
          onPress={() => navigation.navigate('TestBridge')}
          color="#6200EE"
        />
      </View>
    </View>
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
});

export default Home;
