import { Ionicons } from "@expo/vector-icons";
import { searchCity } from "@src/services/nominatim";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useCitySearch from "../../src/hooks/useCitySearch";

type Step = {
  id: string;
  label: string;
  position: { latitude: number; longitude: number } | null;
};

type RoutePlannerInputProps = {
  onSetStart?: (pos: { latitude: number; longitude: number }) => void;
  onSetEnd?: (pos: { latitude: number; longitude: number }) => void;
  onValidateRoute?: () => void;
  onSetSteps?: (steps: { latitude: number; longitude: number }[]) => void;
};

export default function RoutePlannerInput({
  onSetStart,
  onSetEnd,
  onValidateRoute,
  onSetSteps,
}: RoutePlannerInputProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [mode, setMode] = useState<"idle" | "start" | "end" | "summary">("idle");

  // ✅ SUGGESTIONS CENTRALISÉES PAR ÉTAPE
  const [stepSearchResults, setStepSearchResults] = useState<
    Record<string, any[]>
  >({});

  // --- Recherche ville départ & arrivée ---
  const { results: startResults } = useCitySearch(start);
  const { results: endResults } = useCitySearch(end);

  // ---- Handlers ----

useEffect(() => {
  const validSteps = steps
    .filter((s) => s.position !== null)
    .map((s) => s.position!);

    onSetSteps?.(validSteps)
}, [steps])

  const validateStart = () => {
    if (!start.trim()) return;
    setMode("end");
  };

  const validateEnd = () => {
    if (!end.trim()) return;
    setMode("summary");
  };

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      label: "",
      position: null,
    };
    setSteps((prev) => [...prev, newStep]);
    setMode("summary");
  };

  // ✅ RECHERCHE DÉPORTÉE HORS DU RENDER
  const updateStep = async (id: string, val: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: val } : s))
    );

    if (val.length < 3) return;

    const results = await searchCity(val);

    setStepSearchResults((prev) => ({
      ...prev,
      [id]: results,
    }));
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setStepSearchResults((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleSelectStart = (lat: number, lon: number, name: string) => {
    setStart(name);
    onSetStart?.({ latitude: lat, longitude: lon });
    setMode("end");
  };

  const handleSelectEnd = (lat: number, lon: number, name: string) => {
    setEnd(name);
    onSetEnd?.({ latitude: lat, longitude: lon });
    setMode("summary");
  };

  const handleSelectStep = (
    id: string,
    lat: number,
    lon: number,
    displayName: string
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              label: displayName,
              position: { latitude: lat, longitude: lon },
            }
          : step
      )
    );

    setStepSearchResults((prev) => ({
      ...prev,
      [id]: [],
    }));
  };

  // ---- UI ----

  return (
    <View style={styles.wrapper}>
      {(mode === "idle" || mode === "start") && (
        <>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="black" />
            <TextInput
              placeholder="Ville de départ"
              value={start}
              onChangeText={setStart}
              onFocus={() => setMode("start")}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={validateStart}
            />
          </View>

          {startResults.length > 0 && (
            <FlatList
              data={startResults}
              keyExtractor={(item, index) =>
                item.osm_id ? String(item.osm_id) : `fallback-${index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() =>
                    handleSelectStart(item.lat, item.lon, item.displayName)
                  }
                >
                  <Text>{item.displayName}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      {(mode === "end" || mode === "summary") && (
        <>
          <View style={styles.inputRow}>
            <Ionicons name="flag-outline" size={20} color="black" />
            <TextInput
              placeholder="Ville d'arrivée"
              value={end}
              onChangeText={setEnd}
              onFocus={() => setMode("end")}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={validateEnd}
            />
          </View>

          {mode !== "summary" && endResults.length > 0 && (
            <FlatList
              data={endResults}
              keyExtractor={(item, index) =>
                item.osm_id ? String(item.osm_id) : `fallback-${index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() =>
                    handleSelectEnd(item.lat, item.lon, item.displayName)
                  }
                >
                  <Text>{item.displayName}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      {mode === "summary" &&
        steps.map((step) => (
          <View key={step.id}>
            <View style={styles.inputRow}>
              <Ionicons name="trail-sign-outline" size={20} color="black" />
              <TextInput
                placeholder="Étape intermédiaire"
                value={step.label}
                onChangeText={(txt) => updateStep(step.id, txt)}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => removeStep(step.id)}>
                <Ionicons
                  name="close-circle-outline"
                  size={22}
                  color="#c0392b"
                />
              </TouchableOpacity>
            </View>

            {stepSearchResults[step.id]?.length > 0 && (
              <FlatList
                data={stepSearchResults[step.id]}
                keyExtractor={(item, index) =>
                  item.osm_id ? String(item.osm_id) : `fallback-${index}`
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestion}
                    onPress={() =>
                      handleSelectStep(
                        step.id,
                        item.lat,
                        item.lon,
                        item.displayName
                      )
                    }
                  >
                    <Text>{item.displayName}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        ))}

      {mode === "summary" && (
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onValidateRoute} style={styles.actionBtn}>
            <Ionicons
              name="checkmark-done-outline"
              size={26}
              color="#34cf20ff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={addStep} style={styles.actionBtn}>
            <Ionicons
              name="add-circle-outline"
              size={26}
              color="#34cf20ff"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 5,
    left: "50%",
    width: 250,
    transform: [{ translateX: -125 }],
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 12,
    borderRadius: 25,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    borderRadius: 18,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
  },
  actionBtn: {
    padding: 8,
  },
  suggestion: {
    padding: 6,
    backgroundColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});