type LatLng = { latitude: number; longitude: number };
type OsrmPoint = { lat: number; lon: number };

export function buildRoutePoints(
    start: LatLng,
    steps: LatLng[],
    end: LatLng,
 ) {
    if (!start || !end) return null;
    
    return [
        { lat: start.latitude, lon: start.longitude },
        ...steps.map((p) => ({ lat: p.latitude, lon: p.longitude })),
        { lat: end.latitude, lon: end.longitude },
    ];
}

export function extractValidStepCoords(
  steps: { position: LatLng | null }[]
): LatLng[] {
  return steps
    .map((s) => s.position)
    .filter((p): p is LatLng => p !== null);
}
