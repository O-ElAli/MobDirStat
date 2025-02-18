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
import Visualization from '../components/AppsVisualization';
import PieChartComponent from '../components/PieChartComponent';
import MediaVisualization from '../components/MediaVisualization';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { NativeModule } = NativeModules;

const formatStorageSize = (size) => {
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} GB`;
  } else {
    return `${size.toFixed(2)} MB`;
  }
};

const AppAnalysis = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  const [apps, setApps] = useState([]);
  const [media, setMedia] = useState([]);
  const [totalStorage, setTotalStorage] = useState({ apps: 0, filesystem: 0, system: 0 });
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        console.log("📢 Fetching Installed Apps...");
        const appsData = await NativeModule.getInstalledApps();
        console.log("📢 Fetching Media Storage...");
        const mediaData = await NativeModule.getStorageHierarchy();

        let totalAppStorage = 0;
        const appsList = appsData.map(app => {
          if (!app.name || !app.packageName || isNaN(app.totalSize)) return null;
          totalAppStorage += app.totalSize;
          return { 
            name: app.name,
            packageName: app.packageName,
            totalSize: app.totalSize
          };
        }).filter(Boolean).sort((a, b) => b.totalSize - a.totalSize);

        console.log("📢 Fetching Filesystem Storage...");
        const filesystemStorage = await NativeModule.getFilesystemStorage();

        console.log("📢 Fetching System Storage...");
        const systemStorage = await NativeModule.getSystemStorageUsage();

        setApps(appsList);
        setMedia(mediaData);
        setTotalStorage({
          apps: totalAppStorage,
          filesystem: filesystemStorage,
          system: systemStorage,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to load storage data');
        console.error('❌ Error fetching storage data:', error);
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
        <Text style={styles.loadingText}>Fetching storage data...</Text>
      </View>
    );
  }

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
        content = (
          <Visualization 
            apps={apps} 
            filesystemStorage={totalStorage.filesystem} 
            systemStorage={totalStorage.system} 
            width={windowWidth} 
            height={Math.round(windowHeight * 0.6)} 
            onSelectApp={setSelectedItem} 
          />
        );
        break;
      case 'apps':
        content = (
          <Visualization 
            apps={apps} 
            filesystemStorage={0} 
            systemStorage={0} 
            width={windowWidth} 
            height={Math.round(windowHeight * 0.6)} 
            onSelectApp={setSelectedItem} 
          />
        );
        break;
      case 'filesystem':
        content = (
          <MediaVisualization 
            storageData={media} 
          />
        );
        break;
      case 'pie':
        content = (
          <PieChartComponent 
            apps={apps} 
            filesystemStorage={totalStorage.filesystem} 
            systemStorage={totalStorage.system} 
          />
        );
        break;
      default:
        content = null;
    }

    return (
      <View style={styles.sceneContainer}>
        <View style={styles.storageOverview}>
          {selectedItem ? (
            <>
              <Text style={styles.title}>{selectedItem.name}</Text>
              <Text style={styles.data}>Size: {formatStorageSize(selectedItem.size)}</Text>
              <Text style={styles.data}>Percentage: {selectedItem.percentage}%</Text>
            </>
          ) : route.key === 'full' ? (
            <>
              <Text style={styles.title}>📊 Phone Storage Overview</Text>
              <Text style={styles.data}>🛠️ Total Used: {formatStorageSize(totalStorage.apps + totalStorage.filesystem + totalStorage.system)}</Text>
              <Text style={styles.data}>📱 Apps: {formatStorageSize(totalStorage.apps)}</Text>
              <Text style={styles.data}>📂 Filesystem: {formatStorageSize(totalStorage.filesystem)}</Text>
              <Text style={styles.data}>⚙️ System: {formatStorageSize(totalStorage.system)}</Text>
            </>
          ) : route.key === 'apps' ? (
            <>
              <Text style={styles.title}>📱 Apps Storage</Text>
              <Text style={styles.data}>Total: {formatStorageSize(totalStorage.apps)}</Text>
            </>
          ) : route.key === 'filesystem' ? (
            <>
              <Text style={styles.title}>📂 Media Storage</Text>
              <Text style={styles.data}>Total: {formatStorageSize(totalStorage.filesystem)}</Text>
            </>
          ) : null}
        </View>

        <View style={styles.treemapWrapper}>{content}</View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020203' },
  sceneContainer: { flex: 1 },
  storageOverview: { padding: 10, backgroundColor: '#1E1E1E', marginBottom: 5, borderRadius: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  data: { fontSize: 16, color: '#AAAAAA', textAlign: 'center', marginTop: 2 },
  treemapWrapper: { flex: 1, width: '100%' },
  loadingText: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginTop: 10 },
  tabBar: { backgroundColor: '#6200EE' }
});

export default AppAnalysis;
