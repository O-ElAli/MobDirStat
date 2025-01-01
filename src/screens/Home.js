import React from 'react';
import { View, Button, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const Home = ({ navigation }) => {
  const requestMediaPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 30) { // Android 11+
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ]);
          console.log('Permissions:', granted); // Logs the granted permissions

          if (
            granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert('Permissions granted!', 'Media permissions granted successfully.');
          } else {
            Alert.alert(
              'Permissions required',
              'Please grant media permissions in settings.'
            );
          }
        } else { // Android 10 and below
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
          console.log('Permission:', granted); // Logs the granted permission

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission granted!', 'Media permissions granted successfully.');
          } else {
            Alert.alert(
              'Permission required',
              'Please grant media permissions in settings.'
            );
          }
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
      <Button
  title="Test Bridge"
  onPress={() => navigation.navigate('TestBridge')}
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
