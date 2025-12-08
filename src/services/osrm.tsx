// src/services/osrm.ts
import polyline from "@mapbox/polyline";

export type LatLng = {
  lat: number;
  lon: number;
};

export type DecodedCoord = {
  latitude: number;
  longitude: number;
};

export type RouteResult = {
  distance: number;
  duration: number;
  coords: DecodedCoord[];
};

export async function fetchBikeRoute(
  points: LatLng[]
): Promise<RouteResult | null> {
  if (points.length < 2) {
    throw new Error("At least two points are required for routing.");
  }

  // Format OSRM : "lon,lat;lon,lat;lon,lat"
  const coordString = points.map((p) => `${p.lon},${p.lat}`).join(";");

  const url = `https://router.project-osrm.org/route/v1/bike/${coordString}?overview=full&geometries=polyline`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("OSRM request failed: " + response.status);
  }

  const data = await response.json();
  const route = data.routes?.[0];
  if (!route) return null;

  // Décode la polyline OSRM → tableau de points { latitude, longitude }
  const decoded = polyline.decode(route.geometry).map(([lat, lon]) => ({
    latitude: lat,
    longitude: lon,
  }));

  return {
    distance: route.distance,
    duration: route.duration,
    coords: decoded,
  };
}
