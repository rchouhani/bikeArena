import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
  console.log("🧩 PROPS REÇUES DANS RoutePlannerInput :", {
    onSetStart,
    onSetEnd,
  });

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [mode, setMode] = useState<"idle" | "start" | "end" | "summary">(
    "idle"
  );

  // --- Recherche ville ---
  const { results: startResults, loading: startLoading } = useCitySearch(start);
  const { results: endResults, loading: endLoading } = useCitySearch(end);
  const { results: stepResults } = useCitySearch(steps.label);
  // console.log("END RESUTS : ", endResults);

  // ---- Handlers ----
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

  const updateStep = (id: string, val: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value: val } : s))
    );
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleConfirmRoute = () => {
    console.log("Trajet validé :");
    onValidateRoute?.();
  };

  const handleSaveRoute = () => {
    console.log("Enregistrer le trajet :", { start, steps, end });
  };

  const handleSelectStart = (lat: number, lon: number) => {
    setStart(`${lat}, ${lon}`); // ou tu peux garder displayName si tu veux
    console.log("setStart de handleSelectStart : ", setStart);
    onSetStart?.({ latitude: lat, longitude: lon }); // envoie vers parent
    console.log("📍📍📍onsetStart dans handle select start : ", onSetStart);
    setMode("end");
  };

  const handleSelectEnd = (lat: number, lon: number) => {
    setEnd(`${lat}, ${lon}`);
    console.log("setEnd dans handleSelectEnd : ", setEnd);
    onSetEnd?.({ latitude: lat, longitude: lon });
    console.log("😴😴😴😴onSetEnd dans handle select end : ", onSetEnd);
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
  };
  

  // ---- UI ----
  return (
    <View style={styles.wrapper}>
      {/* INPUT DÉPART */}
      {(mode === "idle" || mode === "start") && (
        <View>
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

          {/* Suggestions départ */}
          {startResults.length > 0 && (
            <FlatList
              data={startResults}
              keyExtractor={(item, index) =>
                item.osm_id ? String(item.osm_id) : `fallback-${index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() => {
                    // console.log("💚 START ITEM COMPLET : ", item);

                    // console.log("✅ START SELECTED →", {
                    //   lat: item.lat,
                    //   lon: item.lon,
                    // });

                    handleSelectStart(item.lat, item.lon);
                    setStart(item.displayName);
                    validateStart();
                  }}
                >
                  <Text>{item.displayName}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* INPUT ARRIVÉE */}
      {(mode === "end" || mode === "summary") && (
        <View>
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

          {/* Suggestions arrivée */}
          {mode !== "summary" && endResults.length > 0 && (
            <FlatList
              data={endResults}
              keyExtractor={(item, index) =>
                item.osm_id ? String(item.osm_id) : `fallback-${index}`
              }
              style={styles.suggestion}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() => {
                    // console.log("💓 END ITEM COMPLET : ", item);

                    // console.log("✅ END SELECTED →", {
                    //   lat: item.lat,
                    //   lon: item.lon,
                    // });
                    handleSelectEnd(item.lat, item.lon);
                    setEnd(item.displayName);
                    validateEnd();
                  }}
                >
                  <Text>{item.displayName}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* ÉTAPES */}
      {mode === "summary" &&
        steps.map((step) => (
          const { results } = useCitySearch(step.label);

          <View key={step.id} style={styles.inputRow}>
            <Ionicons name="trail-sign-outline" size={20} color="black" />
            <TextInput
              placeholder="Étape intermédiaire"
              value={step.label}
              onChangeText={(txt) => updateStep(step.id, txt)}
              style={styles.input}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => removeStep(step.id)}>
              <Ionicons name="close-circle-outline" size={22} color="#c0392b" />
            </TouchableOpacity>
          </View>
        ))}

      {/* ACTIONS */}
      {mode === "summary" && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={handleConfirmRoute}
            style={styles.actionBtn}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={26}
              color="#34cf20ff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSaveRoute} style={styles.actionBtn}>
            <Ionicons name="save-outline" size={26} />
          </TouchableOpacity>

          <TouchableOpacity onPress={addStep} style={styles.actionBtn}>
            <Ionicons name="add-circle-outline" size={26} color="#34cf20ff" />
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
