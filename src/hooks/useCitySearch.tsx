import { useEffect, useState } from "react";
import { searchCity } from "../../src/services/nominatim";
import { CitySearchResult } from "../types/geo";

export default function useCitySearch(query: string) {
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 1. LOG À CHAQUE FRAPPE DANS L’INPUT
  // useEffect(() => {
  //   console.log("🟡 useCitySearch → QUERY REÇUE :", query);
  // }, [query]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      // ✅ 2. CAS QUERY VIDE
      if (!query.trim()) {
        // console.log("⚪ QUERY VIDE → reset results");
        setResults([]);
        return;
      }

      // console.log("🟠 LANCEMENT RECHERCHE NOMINATIM POUR :", query);
      setLoading(true);

      try {
        const res = await searchCity(query);

        // ✅ 3. RÉSULTAT BRUT DE L’API
        // console.log("🟢 RÉSULTAT BRUT NOMINATIM :", res);

        setResults(res);

        // ✅ 4. RÉSULTAT APRÈS SETSTATE
        // console.log("✅ RESULTS APRÈS setResults :", res);
      } catch (err) {
        console.error("🔴 Erreur recherche ville :", err);
      } finally {
        setLoading(false);
        // console.log("🔵 loading = false");
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // ✅ 5. LOG À CHAQUE MISE À JOUR DE RESULTS
  // useEffect(() => {
  //   console.log("🟣 RESULTS ACTUELS DANS LE HOOK :", results);
  // }, [results]);

  return { results, loading };
}
