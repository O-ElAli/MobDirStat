import React from 'react';
import { View, Button, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

console.log('NativeModule:', NativeModules.NativeModule);

const Home = ({ navigation }) => {
  const requestMediaPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // For Android 13+
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
            Alert.alert('Permissions granted!', 'Media permissions granted successfully.');
          } else {
            Alert.alert(
              'Permissions required',
              'Media permissions are required to analyze media files. Please grant them in settings.'
            );
          }
        } else {
          // For Android 6.0 to 12
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission granted!', 'Media permissions granted successfully.');
          } else {
            Alert.alert(
              'Permission required',
              'Media permissions are required to analyze media files. Please gran t them in settings.'
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
              navigation.navigate('App Analysis'); // Navigate to the next screen
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
