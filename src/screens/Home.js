import React from 'react';
import { View, Button, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

console.log('NativeModule:', NativeModules.NativeModule);

const Home = ({ navigation }) => {
  const requestMediaPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 30) { // Android 11+
          const isGranted = await NativeModule.checkAndRequestPermissions(); // Use NativeModule
          if (!isGranted) {
            Alert.alert(
              'Permissions required',
              'Please enable file access permissions in settings for complete media analysis.'
            );
          } else {
            Alert.alert('Permissions granted!', 'All permissions are granted.');
          }
        } else if (Platform.Version >= 23) { // Android 6.0 to 10
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission granted!', 'Media permissions granted successfully.');
          } else {
            Alert.alert(
              'Permission required',
              'Media permissions are required to analyze media files. Please grant them in settings.'
            );
          }
        } else {
          Alert.alert('Unsupported platform', 'Media analysis is supported only on modern Android versions.');
        }
      } else {
        Alert.alert('Unsupported platform', 'Media analysis is supported only on Android.');
      }
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      Alert.alert('Error', 'An error occurred while requesting media permissions.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Button
        title="Request Usage Stats Permission"
        onPress={async () => {
          try {
            const granted = await NativeModule.requestUsageStatsPermission();
            if (granted) {
              Alert.alert('Permission granted!');
              // Remove automatic navigation to App Analysis
            } else {
              Alert.alert('Permission not granted. Please enable it in settings.');
            }
          } catch (error) {
            console.error('Error requesting usage stats permission:', error);
          }
        }}
      />
      <Button
        title="Request Media Permissions"
        onPress={requestMediaPermissions}
      />
      <Button
        title="App Analysis"
        onPress={() => navigation.navigate('App Analysis')}
      />
      <Button
        title="Media Analysis"
        onPress={() => navigation.navigate('Media Analysis')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default Home;
