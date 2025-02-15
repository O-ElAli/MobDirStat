import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  useWindowDimensions, 
  ActivityIndicator, 
  Alert, 
  StyleSheet 
} from 'react-native';
import { NativeModules } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import Visualization from '../components/Visualization';
import PieChartComponent from '../components/PieChartComponent';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { NativeModule } = NativeModules;

const formatStorageSize = (size) => {
  return size >= 1024 
    ? `${(size / 1024).toFixed(1)} GB` 
    : `${size.toFixed(2)} MB`; 
};

const AppAnalysis = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  const [apps, setApps] = useState([]);
  const [totalStorage, setTotalStorage] = useState({ apps: 0, filesystem: 0, system: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const appsData = await NativeModule.getInstalledApps();
        if (!Array.isArray(appsData)) {
          console.error("Error: Expected an array from NativeModule.getInstalledApps.");
          return;
        }
        let totalAppStorage = 0;
        const appsList = appsData
          .map(app => {
            if (!app.name || !app.packageName || isNaN(app.totalSize)) return null;
            totalAppStorage += app.totalSize;
            return { 
              name: app.name,
              packageName: app.packageName,
              totalSize: app.totalSize
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.totalSize - a.totalSize);
        const filesystemStorage = await NativeModule.getFilesystemStorage();
        const systemStorage = await NativeModule.getSystemStorageUsage();
        setApps(appsList);
        setTotalStorage({
          apps: totalAppStorage,
          filesystem: filesystemStorage,
          system: systemStorage,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to load storage data');
        console.error('Error fetching storage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStorageData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Analyzing installed apps...</Text>
      </View>
    );
  }

  if (!apps.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>No apps with valid size data found</Text>
      </View>
    );
  }

  const filesystemStorageValue = parseFloat(totalStorage.filesystem) || 0;
  const systemStorageValue = parseFloat(totalStorage.system) || 0;

  const routes = [
    { key: 'full', title: 'Map', icon: 'grid' },
    { key: 'apps', title: 'Apps', icon: 'apps' },
    { key: 'filesystem', title: 'Media', icon: 'folder' },
    { key: 'pie', title: 'Types', icon: 'chart-pie' }
  ];

  const renderScene = ({ route }) => {
    let content;
    switch (route.key) {
      case 'full':
        content = <Visualization 
          apps={apps} 
          filesystemStorage={filesystemStorageValue} 
          systemStorage={systemStorageValue} 
          width={windowWidth} 
          height={Math.round(windowHeight * 0.7)} 
          onSelectApp={setSelectedApp} 
        />;
        break;
      case 'apps':
        content = <Visualization 
          apps={apps} 
          filesystemStorage={0} 
          systemStorage={0} 
          width={windowWidth} 
          height={Math.round(windowHeight * 0.7)}
          onSelectApp={setSelectedApp} 
        />;
        break;
      case 'filesystem':
        content = <Visualization 
          apps={[]} 
          filesystemStorage={filesystemStorageValue} 
          systemStorage={0} 
          width={windowWidth} 
          height={300} 
          onSelectApp={setSelectedApp} 
        />;
        break;
      case 'pie':
        content = <PieChartComponent 
          apps={apps} 
          filesystemStorage={filesystemStorageValue} 
          systemStorage={systemStorageValue} 
        />;
        break;
      default:
        content = null;
    }

    return (
      <View style={styles.sceneContainer}>
        {/* Info Section */}
        <View style={styles.infoContainer}>
          {selectedApp ? (
            <>
              <Text style={styles.title}>{selectedApp.name}</Text>
              <Text style={styles.data}>
                Size: {formatStorageSize(selectedApp.size)}{"\n"}
                Percentage: {selectedApp.percentage}%
              </Text>
            </>
          ) : (
            <Text style={styles.defaultText}>Click on an icon for more details</Text>
          )}
        </View>

        {/* Treemap Content */}
        <View style={styles.treemapWrapper}>
          {content}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: windowWidth }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            renderIcon={({ route }) => <Icon name={route.icon} size={24} color="white" />}
            indicatorStyle={{ backgroundColor: 'white' }}
            style={styles.tabBar}
          />
        )}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020203',
  },
  navbar: {
    height: 100, // Fixed height for navbar
    width: '100%',
    zIndex: 10, // Ensures it stays on top
  },
  infoContainer: {
    height: 100, // Fixed height for info section
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    width: '100%', 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  data: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  defaultText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  treemapWrapper: {
    flex: 1, // Takes up remaining space
    width: '100%', 
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  warning: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
});

export default AppAnalysis;