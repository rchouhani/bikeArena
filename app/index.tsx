import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Tabbar from "./components/Tabbar";
import MapScreen from "./screens/MapScreen";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapScreen />

        <Tabbar active={activeTab} onChange={setActiveTab} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
