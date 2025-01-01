import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const TestBridge = () => {
  const [message, setMessage] = useState(null);

  const handleTestBridge = async () => {
    try {
      const response = await NativeModule.testBridge();
      console.log('Response from Native:', response);
      setMessage(response);
    } catch (error) {
      console.error('Error in bridge test:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Test Bridge" onPress={handleTestBridge} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TestBridge;
