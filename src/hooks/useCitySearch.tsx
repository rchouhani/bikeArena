import { useEffect, useState } from "react";
import { searchCity } from "../../src/services/nominatim";
import { CitySearchResult } from "../types/geo";

export default function useCitySearch(query: string) {
    const [results, setResults] = useState<CitySearchResult[]>([]);
    const [loading, setloading] = useState(false);

    useEffect(() => {
        const delay = setTimeout(async () => {
            if(!query.trim()) {
                setResults([]);
                return;
            }

            setloading(true);
            try{
                const res = await searchCity(query);
                setResults(res);
            } catch (err) {
                console.error("Erreur recherche ville : ", err);
            } finally {
                setloading(false)
            }
        }, 400);
        return () => clearTimeout(delay);
    }, [query]);

    return { results, loading};
}