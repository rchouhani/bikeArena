type LatLng = { latitude: number; longitude: number };

export function buildRoutePoints(
    start: LatLng | null,
    steps: {position: LatLng | null}[],
    end: LatLng | null,
) {
    if (!start || !end) return null;
    
    const validSteps = steps.filter((s) => s.position).map((s) => s.position!);

    return [
        { lat: start.latitude, lon: start.longitude },
        ...validSteps.map((p) => ({ lat: p.latitude, lon: p.longitude })),
        { lat: end.latitude, lon: end.longitude },
    ];
}