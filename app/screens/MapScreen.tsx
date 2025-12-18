import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { useRoutePolyline } from "@src/hooks/useRoutePolyline";
import RoutePlannerInput from "app/components/RoutePlannerInput";
import Tabbar from "../components/Tabbar";

export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [start, setStart] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [end, setEnd] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [steps, setSteps] = useState<{ latitude: number; longitude: number }[]>(
    []
  );

  const { route, loading, error, getRoute } = useRoutePolyline();

  const [activeTab, setActiveTab] = useState("home");

useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission refusée");
      return;
    }

    let loc = null;

    try {
      loc = await Location.getCurrentPositionAsync({});
    } catch (e) {
      console.log("Erreur récupération position", e);
    }

    if (!loc || !loc.coords) {
      console.log("Position actuelle indisponible");
      return;
    }

    setPosition({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  })();
}, []);

  useEffect(() => {
    if (!route?.coords?.length) return;

    const lats = route.coords.map((c) => c.latitude);
    const lons = route.coords.map((c) => c.longitude);

    setRegion({
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
      latitudeDelta: (Math.max(...lats) - Math.min(...lats)) * 1.5,
      longitudeDelta: (Math.max(...lons) - Math.min(...lons)) * 1.5,
    });
  }, [route]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {position && <Marker coordinate={position} title="Moi" />}
        {start && <Marker coordinate={start} title="Départ" pinColor="green" />}
        {end && <Marker coordinate={end} title="Arrivée" pinColor="red" />}
        {route?.coords?.length > 0 && (
          <Polyline
            coordinates={route.coords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>

      {loading && <Text style={styles.loading}>Calcul de l'itinéraire…</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      {activeTab === "home" && (
        <RoutePlannerInput
          start={start}
          end={end}
          onSetStart={setStart}
          onSetEnd={setEnd}
          onSetSteps={setSteps}
          getRoute={getRoute}
        />
      )}

      <Tabbar active={activeTab} onChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 6,
    borderRadius: 6,
  },
  error: {
    position: "absolute",
    bottom: 160,
    alignSelf: "center",
    color: "red",
    backgroundColor: "white",
    padding: 4,
    borderRadius: 4,
  },
});
