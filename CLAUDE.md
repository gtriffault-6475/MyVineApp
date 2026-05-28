# MyVine — Contexte projet

Application mobile iOS de suivi de vins, construite en React Native CLI (sans Expo).

## Stack technique

- React Native 0.74 CLI, iOS uniquement
- Navigation : `@react-navigation/native-stack` + `@react-navigation/bottom-tabs`
- Base de données : `react-native-sqlite-storage` v6 (mode promise)
- Photos : `react-native-image-picker` v7 + `react-native-fs`
- Sécurité : `react-native-keychain`
- Reconnaissance d'étiquettes : API Claude (claude-haiku-4-5, base64)
- TypeScript avec alias `@/*` → `./src/*`

## Règles de migration de base de données

**Règle absolue :** toujours faire évoluer le schéma via des migrations numérotées. Ne jamais recréer la table from scratch ni utiliser `DROP TABLE` — cela détruirait les données utilisateur.

### Pattern à suivre pour chaque nouvelle colonne ou modification :

1. Ajouter la colonne dans `CREATE_WINES_TABLE` (schema.ts) pour les nouvelles installations
2. Incrémenter `DB_VERSION` dans schema.ts
3. Ajouter un bloc conditionnel dans `runMigrations` (migrations.ts) :

```typescript
// currentVersion >= N garantit que le bloc ne tourne pas sur une nouvelle
// installation (qui a déjà la colonne via CREATE_WINES_TABLE)
if (currentVersion >= N && currentVersion < N+1) {
  await db.executeSql(`ALTER TABLE wines ADD COLUMN ma_colonne TEXT`);
}
```

### Pourquoi `currentVersion >= N` est obligatoire

`CREATE_WINES_TABLE` reflète toujours le schéma courant (incluant toutes les colonnes).
Sur une nouvelle installation, la table est créée complète d'emblée — les migrations
intermédiaires ne doivent donc pas s'exécuter, sinon `ALTER TABLE ADD COLUMN` plante
avec "duplicate column name".

### Historique des migrations

| Version | Changement |
|---------|-----------|
| 1 | Création initiale de la table `wines` + index |
| 2 | Ajout de la colonne `companion TEXT` |

## Stockage des photos

Les photos sont stockées en chemin relatif dans la DB (`wine-photos/uuid.jpg`).
URI complète = `file://${RNFS.DocumentDirectoryPath}/wine-photos/uuid.jpg`

## Installation sur iPhone

Avec un compte Apple Developer payant : ouvrir `ios/MyVine.xcworkspace` dans Xcode,
activer "Automatically manage signing", sélectionner le compte, puis ⌘R sur le device.
Le certificat est valide 1 an. Les données SQLite sont préservées entre les mises à jour
tant que le bundle ID (`com.myvineapp`) ne change pas.
