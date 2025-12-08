import { fetchBikeRoute, LatLng } from "@src/services/osrm";
import { useEffect, useState } from "react";

type Point = {
  label: string;
  lat: number;
  lon: number;
};

export function useRoutePolyline(
  start: Point | null,
  steps: Point[],
  end: Point | null
) {
  const [polyline, setPolyline] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRoute() {
      if (!start || !end) return;

      const points: LatLng[] = [
        { lat: start.lat, lon: start.lon },
        ...steps.map((s) => ({ lat: s.lat, lon: s.lon })),
        { lat: end.lat, lon: end.lon },
      ];

      setLoading(true);
      try {
        const route = await fetchBikeRoute(points);
        setPolyline(route?.coords ?? null);
      } catch (err) {
        console.log("Erreur OSRM : ", err);
        setPolyline(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRoute();
  }, [start, steps, end]);

  return { polyline, loading };
}
