# Architecture - Calcul d'itinéraires

## Objectif 
Permettre à un utilisateur de calculer un itinéraire vélo à partir :
- D'un point de départ
- D'un point d'arrivée
- D'étapes intermédiaires optionnelles

Les données sont transformées successivement via : 
- L'API Nominatim (géocodage avec latitude et longitude)
- OSRM (moteur de recherche afin d'avoir le trajet le plus court dans un réseau routier)
- Polyine (affichage du trajet sur la carte)

## Flux de données

1. L'utilisateur saisi les lieux dans les input respectifs
2. Les addresses sont converties en coordonnées (latitude et longitude)
3. Une liste ordonnée de points est construite
4. OSRM calcule un itinéraire
5. La géométrie est affichée sur la carte

## Construction de l'itinéraire

la construction de la liste de points pour OSRM est isolée dans une fonction pure (buildRoutePoints) afin de :
- Garantir l'ordre départ -> étapes -> arrivée
- Eviter les effets de bord
- Faciliter la maintenance et les tests
- Une séparation claire des reponsabilités