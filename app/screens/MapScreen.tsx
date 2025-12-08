import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { useRoutePolyline } from "@src/hooks/useRoutePolyline";
import { LatLng } from "@src/services/osrm";
import RoutePlannerInput from "../components/RoutePlannerInput";
import Tabbar from "../components/Tabbar";

export default function MapScreen() {
  // Carte centrée sur Paris par défaut
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [start, setStart] = useState<{ latitude: number; longitude: number } | null>(null);
  const [end, setEnd] = useState<{ latitude: number; longitude: number } | null>(null);

  const { route, loading, error, getRoute } = useRoutePolyline();

  const [activeTab, setActiveTab] = useState("home");

  // 🔥 Récupération position + suivi en temps réel
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission refusée");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const userPos = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      setPosition(userPos);
      setRegion((r) => ({ ...r, ...userPos }));

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (loc) => {
          setPosition({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );

      return () => sub.remove();
    })();
  }, []);

  // 🔥 Calcul automatique de l’itinéraire dès que start et end sont définis
  useEffect(() => {
    if (start && end) {
      const points: LatLng[] = [
        { lat: start.latitude, lon: start.longitude },
        { lat: end.latitude, lon: end.longitude },
      ];
      getRoute(points);
    }
  }, [start, end]);

  // 🔥 Optionnel : recentrer la carte sur la route
  useEffect(() => {
    if(!route?.coords || route.coords.length === 0) return;
    if (route?.coords && route.coords.length > 0) {
      const lats = route.coords.map(c => c.latitude);
      const lons = route.coords.map(c => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: (maxLat - minLat) * 1.5,
        longitudeDelta: (maxLon - minLon) * 1.5,
      });
    }
  }, [route]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {position && <Marker coordinate={position} title="Moi" />}

        {start && <Marker coordinate={start} pinColor="green" title="Départ" />}
        {end && <Marker coordinate={end} pinColor="red" title="Arrivée" />}

        {route?.coords && route.coords.length > 0 && (
          <Polyline coordinates={route.coords} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      {loading && <Text style={styles.loading}>Calcul de l'itinéraire…</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      {activeTab === "home" && (
        <RoutePlannerInput onSetStart={setStart} onSetEnd={setEnd} />
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
    fontWeight: "600",
    backgroundColor: "white",
    padding: 4,
    borderRadius: 4,
  },
});
