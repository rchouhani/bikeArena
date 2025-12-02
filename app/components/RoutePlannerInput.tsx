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
  value: string;
};

export default function RoutePlannerInput() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [mode, setMode] = useState<"idle" | "start" | "end" | "summary">(
    "idle"
  );

  // --- Recherche ville ---
  const { results: startResults, loading: startLoading } = useCitySearch(start);
  const { results: endResults, loading: endLoading } = useCitySearch(end);

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
    const newStep: Step = { id: Date.now().toString(), value: "" };
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
    console.log("Trajet validé :", { start, steps, end });
  };

  const handleSaveRoute = () => {
    console.log("Enregistrer le trajet :", { start, steps, end });
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
            <TouchableOpacity onPress={validateStart}>
              <Ionicons name="checkmark-circle-outline" size={22} />
            </TouchableOpacity>
          </View>

          {/* Suggestions départ */}
          {startResults.length > 0 && (
            <FlatList
              data={startResults}
              keyExtractor={(item) => item.osm_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() => {
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
            <TouchableOpacity onPress={validateEnd}>
              <Ionicons name="checkmark-circle-outline" size={22} />
            </TouchableOpacity>
          </View>

          {/* Suggestions arrivée */}
          {mode !== "summary" && endResults.length > 0 && (
            <FlatList
              data={endResults}
              keyExtractor={(item) => item.osm_id}
              style={styles.suggestion}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() => {
                    setEnd(item.displayName);
                    validateEnd(); // 👈 très important !
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
          <View key={step.id} style={styles.inputRow}>
            <Ionicons name="trail-sign-outline" size={20} color="black" />
            <TextInput
              placeholder="Étape intermédiaire"
              value={step.value}
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
            <Ionicons name="checkmark-done-outline" size={26} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSaveRoute} style={styles.actionBtn}>
            <Ionicons name="save-outline" size={26} />
          </TouchableOpacity>

          <TouchableOpacity onPress={addStep} style={styles.actionBtn}>
            <Ionicons name="add-circle-outline" size={26} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 450,
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
