import { CitySearchResult } from "../types/geo";

export async function searchCity(query: string): Promise<CitySearchResult[]> {
    if(!query.trim()) return [];

    const url = `https://nominatim.openstreetmap.org/search?` + 
    new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        limit: "5",
    }).toString();

    const res = await fetch(url, {
        headers: {
            "User-Agent": "RomainApp/1.0 (https://github.com/romain)",
        },
    });

    if(!res.ok) {
        throw new Error("Erreur API Nominatim");
    }
    const data = await res.json();

    return data.map((item: any) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
    }))
}