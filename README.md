# MyVine 🍷

Application mobile de suivi de vins — enregistrez vos dégustations, notez vos bouteilles, et retrouvez vos coups de cœur.

## Fonctionnalités

- **Ajouter un vin** — nom, producteur, appellation, millésime
- **Noter** — score de 1 à 10 avec aperçu en étoiles
- **Localisation** — à la maison, chez des amis, ou au restaurant (avec nom)
- **Accord mets-vins** — notez avec quel plat vous l'avez bu
- **Photo de l'étiquette** — depuis l'appareil photo ou la galerie
- **Commentaire** — vos impressions de dégustation
- **À racheter** — marquez les vins que vous voulez revoir
- **Recherche** — par nom, producteur, appellation ou restaurant
- **Statistiques** — note moyenne, top appellations, top producteurs

## Stack technique

| Élément | Choix |
|---|---|
| Framework | React Native + Expo SDK 51 |
| Navigation | Expo Router (file-based) |
| Base de données | SQLite local via `expo-sqlite` v14 |
| Photos | `expo-image-picker` + `expo-file-system` |
| State | React Context + useReducer |
| Langage | TypeScript strict |

Toutes les données sont stockées **localement sur l'appareil**, sans compte ni serveur.

## Structure du projet

```
app/
├── (tabs)/
│   ├── cellar.tsx      # Liste des vins (onglet principal)
│   ├── search.tsx      # Recherche et filtres
│   └── stats.tsx       # Statistiques
├── add.tsx             # Modal ajout d'un vin
└── wine/
    ├── [id].tsx        # Détail d'un vin
    └── [id]/edit.tsx   # Édition

src/
├── components/         # Composants UI réutilisables
├── context/            # WineContext + WineReducer
├── db/                 # Schema SQLite, migrations, requêtes
├── hooks/              # useWineForm, useImagePicker
└── types/              # Types TypeScript
```

## Installation et lancement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement (même réseau Wi-Fi)
npx expo start

# Lancer en mode tunnel (environnement distant)
npx expo start --tunnel
```

Scannez le QR code avec **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).
