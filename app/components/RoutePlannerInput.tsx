import { Ionicons } from "@expo/vector-icons";
import useCitySearch from "@src/hooks/useCitySearch";
import { searchCity } from "@src/services/nominatim";
import {
  buildRoutePoints,
  extractValidStepCoords,
} from "@src/utils/routePlanner.utils";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

type Step = {
  id: string;
  label: string;
  position: { latitude: number; longitude: number } | null;
};

type RoutePlannerInputProps = {
  onSetStart?: (pos: { latitude: number; longitude: number }) => void;
  onSetEnd?: (pos: { latitude: number; longitude: number }) => void;
  onSetSteps?: (steps: { latitude: number; longitude: number }[]) => void;
  start?: { latitude: number; longitude: number };
  end?: { latitude: number; longitude: number };
  getRoute?: (points: { lat: number; lon: number }[]) => void;
};

export default function RoutePlannerInput({
  onSetStart,
  onSetEnd,
  onSetSteps,
  start: startCoords,
  end: endCoords,
  getRoute,
}: RoutePlannerInputProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [mode, setMode] = useState<"idle" | "start" | "end" | "summary">(
    "idle"
  );

  const [stepSearchResults, setStepSearchResults] = useState<
    Record<string, any[]>
  >({});
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const { results: startResults } = useCitySearch(start);
  const { results: endResults } = useCitySearch(end);

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: Date.now().toString(), label: "", position: null },
    ]);
  };

  const updateStep = async (id: string, value: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: value } : s))
    );

    if (value.length < 3) return;

    const results = await searchCity(value);
    setStepSearchResults((prev) => ({ ...prev, [id]: results }));
  };

  const validateStart = () => {
    if (!start.trim()) return;
    setMode("end");
  };

  const validateEnd = () => {
      if (!end.trim()) return;
      setMode("summary")
  }

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
  };

  const handleSelectEnd = (lat: number, lon: number, name: string) => {
    setEnd(name);
    onSetEnd?.({ latitude: lat, longitude: lon });
  };

  const handleSelectStep = (
    id: string,
    lat: number,
    lon: number,
    name: string
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              label: name,
              position: { latitude: lat, longitude: lon },
            }
          : step
      )
    );

    setStepSearchResults((prev) => ({ ...prev, [id]: [] }));
    setActiveStepId(null);
  };

  const handleValidate = () => {
    if (!startCoords || !endCoords) return;

    const validStepsCoords = extractValidStepCoords(steps);

    const points = buildRoutePoints(startCoords, validStepsCoords, endCoords);
    if (!points) return;
    onSetSteps?.(validStepsCoords);
    getRoute?.(points);
  };

  const renderStep = ({ item, drag }: RenderItemParams<Step>) => (
    <View style={styles.inputRow}>
      <Ionicons name="trail-sign-outline" size={20} />

      <TextInput
        value={item.label}
        placeholder="Étape intermédiaire"
        onFocus={() => setActiveStepId(item.id)}
        onChangeText={(txt) => updateStep(item.id, txt)}
        style={styles.input}
      />

      <TouchableOpacity onPress={() => removeStep(item.id)}>
        <Ionicons name="close-circle-outline" size={22} color="#c0392b" />
      </TouchableOpacity>

      <TouchableOpacity onLongPress={drag}>
        <Ionicons name="reorder-three-outline" size={22} />
      </TouchableOpacity>

      {activeStepId === item.id && stepSearchResults[item.id]?.length > 0 && (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={stepSearchResults[item.id]}
          keyExtractor={(it, i) => it.osm_id?.toString() ?? `k-${i}`}
          renderItem={({ item: s }) => (
            <TouchableOpacity
              style={styles.suggestion}
              onPress={() =>
                handleSelectStep(item.id, s.lat, s.lon, s.displayName)
              }
            >
              <Text>{s.displayName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {/* 🔹 DÉPART */}
      <View style={styles.inputRow}>
        <Ionicons name="location-outline" size={20} />
        <TextInput
          value={start}
          placeholder="Ville de départ"
          editable
          onFocus={() => {
            setMode("start");
          }}
          onChangeText={(txt) => {
            setStart(txt);
          }}
          onSubmitEditing={validateStart}
          style={[styles.input, mode === "summary" && styles.readOnlyInput]}
        />
      </View>

      {mode === "start" && startResults.length > 0 && (
        <FlatList
          data={startResults}
          keyExtractor={(i, idx) => i.osm_id?.toString() ?? `${idx}`}
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

      {/* 🔹 ARRIVÉE */}
      <View style={styles.inputRow}>
        <Ionicons name="flag-outline" size={20} />
        <TextInput
          value={end}
          placeholder="Ville d'arrivée"
          editable
          onFocus={() => setMode("end")}
          onChangeText={setEnd}
          onSubmitEditing={validateEnd}
          style={[styles.input, mode === "summary" && styles.readOnlyInput]}
        />
      </View>

      {mode !== "end" && endResults.length > 0 && (
        <FlatList
          data={endResults}
          keyExtractor={(i, idx) => i.osm_id?.toString() ?? `${idx}`}
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

      {/* 🔹 ÉTAPES */}
      <DraggableFlatList
        data={steps}
        onDragEnd={({ data }) => setSteps(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderStep}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleValidate}>
          <Ionicons name="checkmark-done-outline" size={26} color="green" />
        </TouchableOpacity>

        <TouchableOpacity onPress={addStep}>
          <Ionicons name="add-circle-outline" size={26} color="green" />
        </TouchableOpacity>
      </View>
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
  input: { flex: 1, marginLeft: 8 },
  readOnlyInput: {
    opacity: 0.6,
  },
  actionsRow: {
  borderWidth: 1,
  borderColor: "red",
},
  suggestion: {
    padding: 6,
    backgroundColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
