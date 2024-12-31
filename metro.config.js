/**
 * Metro configuration for React Native
 * https://github.com/facebook/metro
 *
 * @format
 */
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = {
  ...getDefaultConfig(__dirname),
  resolver: {
    sourceExts: ['json', 'js', 'jsx', 'ts', 'tsx'], // Ensure JSON is included
  },
};