import { searchCity } from "@src/services/nominatim";
import { CitySearchResult } from "@src/types/CitySearchResult";
import { useState } from "react";

export type Step = {
  id: string;
  label: string;
  position: { latitude: number; longitude: number } | null;
};

type StepId = string;

export function useRoutePlanner() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);

  const [stepSearchResults, setStepSearchResults] = useState<
    Record<StepId, CitySearchResult[]>
  >({});
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const updateStep = async (id: string, value: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: value } : s))
    );

    if (value.length < 3) return;

    const results = await searchCity(value);
    setStepSearchResults((prev) => ({ ...prev, [id]: results }));
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: Date.now().toString(), label: "", position: null },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setStepSearchResults((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const selectStep = (id: string, lat: number, lon: number, name: string) => {
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

  return {
    start,
    end,
    steps,
    activeStepId,
    stepSearchResults,
    
    setStart,
    setEnd,
    setSteps,
    setActiveStepId,
    setStepSearchResults,

    addStep,
    removeStep,
    updateStep,
    selectStep,
  }
}
