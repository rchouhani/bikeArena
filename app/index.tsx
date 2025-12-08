import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import RoutePlannerInput from './components/RoutePlannerInput';
import Tabbar from './components/Tabbar';
import MapScreen from './screens/MapScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <View style={styles.container}>
      <MapScreen />

      {activeTab === "home" && <RoutePlannerInput />}
      <Tabbar active={activeTab} onChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});