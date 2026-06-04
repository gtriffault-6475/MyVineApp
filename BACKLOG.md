# MyVine — Backlog

## Fonctionnalités à venir

---

### EPIC : Autocomplete restaurant via API ouverte

**Objectif**
Quand l'utilisateur saisit un restaurant dans le formulaire, proposer des suggestions en temps réel issues d'une API publique pour normaliser le nom et éviter les doublons.

**Faisabilité : OUI — complexité modérée**

Ce qui facilite l'implémentation :
- Le champ `restaurant_name` est déjà isolé dans le formulaire (1 seul point de changement)
- Un pattern de debounce identique est déjà utilisé dans `SearchScreen.tsx`
- L'architecture réseau est en place (`fetch` dans `wineRecognition.ts`)
- La gestion de clés API sécurisée (Keychain) est déjà là

Seul risque technique : afficher un dropdown dans un `ScrollView`. Solution connue : overlay en position absolue avec `zIndex` élevé.

**API retenue : Foursquare Places**
Gratuit jusqu'à 1 000 requêtes/jour, excellente couverture des restaurants français, endpoint d'autocomplete dédié. La clé API serait saisie dans l'écran Paramètres (même pattern que la clé Anthropic).

| API | Coût | Clé requise | Qualité FR |
|-----|------|-------------|------------|
| **Foursquare Places** | Gratuit (1 000 req/j) | Oui | Très bonne |
| Google Places | Gratuit jusqu'à 28 k/mois | Oui (CB) | Excellente |
| Nominatim (OSM) | Gratuit, illimité | Non | Correcte |

**User stories**

1. **Saisie avec suggestions** — En tant qu'utilisateur, quand je tape le nom d'un restaurant, je vois une liste de suggestions apparaître sous le champ après 2-3 caractères, sans quitter le formulaire.

2. **Sélection d'une suggestion** — En tant qu'utilisateur, quand je sélectionne une suggestion, le champ se remplit avec le nom normalisé. Si l'API renvoie une adresse, elle est affichée sous le nom à titre informatif (non stockée).

3. **Saisie manuelle conservée** — En tant qu'utilisateur, je peux continuer à taper librement sans sélectionner de suggestion. La saisie manuelle reste toujours possible.

4. **Clé API optionnelle** — En tant qu'utilisateur, si aucune clé Foursquare n'est configurée dans les Paramètres, le champ se comporte comme aujourd'hui (simple TextInput), sans erreur.

5. **Gestion hors ligne** — En tant qu'utilisateur, si le réseau est indisponible, les suggestions sont silencieusement désactivées et la saisie manuelle reste fonctionnelle.

**Périmètre technique**
- 1 nouveau composant `RestaurantAutocomplete.tsx` (TextInput + dropdown overlay)
- 1 nouveau service `restaurantSearch.ts` (appel Foursquare + cache léger)
- Ajout clé Foursquare dans `SettingsScreen`
- 1 ligne modifiée dans `WineForm.tsx`
- Zéro modification DB / types / migrations

**Hors périmètre**
- Stockage de l'adresse ou coordonnées GPS
- Carte ou vue restaurant
- Résolution des doublons existants en base

**Effort estimé :** 1 à 2 sessions de développement.
