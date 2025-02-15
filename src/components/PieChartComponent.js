import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';

export default function PieChartComponent({ apps, filesystemStorage, systemStorage }) {
  const totalSize = apps.reduce((sum, app) => sum + app.totalSize, 0) + filesystemStorage + systemStorage;

  const data = [
    { key: 1, amount: totalSize, svg: { fill: '#1976D2' }, label: 'Total' },
    { key: 2, amount: filesystemStorage, svg: { fill: '#99CC00' }, label: 'Filesystem' },
    { key: 3, amount: systemStorage, svg: { fill: '#FF9800' }, label: 'System' },
    { key: 4, amount: apps.reduce((sum, app) => sum + app.totalSize, 0), svg: { fill: '#6200EE' }, label: 'Apps' },
  ];

  return (
    <View>
      <PieChart style={{ height: 250 }} data={data} />
      <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>Storage Breakdown</Text>
    </View>
  );
}
