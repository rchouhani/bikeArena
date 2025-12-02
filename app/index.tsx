import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import RoutePlannerInput from './components/RoutePlannerInput';
import Tabbar from './components/Tabbar';

export default function App() {
  const [region, setRegion] = useState({
    latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.05, longitudeDelta: 0.05 // Paris
  });
  const [position, setPosition] = useState<{latitude:number, longitude:number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission refusée');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPosition({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));

      // Exemple d'abonnement aux positions (foreground)
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 2 },
        (loc) => {
          setPosition({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      );

      return () => sub.remove();
    })();
  }, []);

const [activeTab, setActiveTab] = useState("home");

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {position && <Marker coordinate={position} title="Moi" />}
        {/* Polyline example: you will fill with recorded points */}
        {/* <Polyline coordinates={[{latitude:..., longitude:...}, ...]} /> */}
      </MapView>
      {errorMsg && <Text>{errorMsg}</Text>}
      {activeTab === "home" && <RoutePlannerInput />}

      <Tabbar active={activeTab} onChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }
});
