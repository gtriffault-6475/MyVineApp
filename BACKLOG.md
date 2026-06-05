# MyVine — Backlog

## En cours

---

### EPIC : Gestion de cave

**Décisions de design**
- Navigation : 5 tabs (Cave | Dégustations | Recherche | Stats | Paramètres)
- Tab journal renommé : "Dégustations"
- Apogée : toujours affichée dans le formulaire
- Ouverture bouteille : décrémente même sans dégustation créée
- Prix : stockage prix d'achat uniquement

**Features MVP**

- F1 — Inventaire : ajouter / modifier / supprimer une bouteille en cave
- F2 — Consultation : liste avec quantité, badge apogée, recherche, tri
- F3 — Consommation : "Ouvrir une bouteille" → décrémente → propose une dégustation
- F4 — Lien cave ↔ dégustation : champ optionnel "Depuis ma cave" dans le formulaire de dégustation, pré-remplissage des champs vin

**Modèle de données**

Nouvelle table `cellar` :

| Champ | Type |
|-------|------|
| id | INTEGER PK |
| name | TEXT NOT NULL |
| producer | TEXT |
| appellation | TEXT |
| vintage | TEXT |
| quantity | INTEGER |
| quantity_initial | INTEGER |
| purchase_date | TEXT (YYYY-MM-DD) |
| purchase_price | REAL |
| optimal_from | INTEGER (année) |
| optimal_to | INTEGER (année) |
| storage_location | TEXT |
| notes | TEXT |
| photo_uri | TEXT |
| archived | INTEGER (0/1) |
| created_at | TEXT |
| updated_at | TEXT |

Modification table `wines` : ajout colonne `cellar_id INTEGER` (FK optionnelle vers cellar.id)

DB_VERSION : 2 → 3

**Nouveaux écrans**
- CellarListScreen — liste des bouteilles en cave (remplace l'actuel CellarScreen)
- CellarDetailScreen — détail d'une bouteille + historique dégustations liées
- AddCellarEntryScreen — formulaire ajout/modification (modal)
- DegustationsScreen — renommage de l'actuel CellarScreen

**Périmètre V2**
- Stats cave (valeur estimée du stock, répartition par appellation)
- Alertes apogée dépassée
- Tri avancé

---

## Backlog

---

### EPIC : Autocomplete restaurant via API ouverte (Foursquare)

**Implémenté** — voir `src/services/restaurantSearch.ts` et `src/components/RestaurantAutocomplete.tsx`.
La clé API Foursquare se configure dans l'écran Paramètres.
