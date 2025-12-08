import { fetchBikeRoute, LatLng, RouteResult } from "@src/services/osrm";
import { useCallback, useState } from "react";

export function useRoutePolyline() {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoute = useCallback(async (points: LatLng[]) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchBikeRoute(points);
   if (!result) {
        setRoute(null);
        return;
    }

    setRoute(result);
} catch(e: any) {
    setError(e.message ?? "Erreur inconnue");
} finally {
    setLoading(false);
}
  }, []);
  
  return { route, loading, error, getRoute };
}
