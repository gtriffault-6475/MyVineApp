#!/bin/bash
# setup.sh — Initialise le projet React Native iOS de MyVine
# Usage : ./setup.sh [dossier_destination]
# Exemple : ./setup.sh ~/Documents/Code/MyVineApp

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="MyVine"
RN_VERSION="0.74.5"
DEST="${1:-"$HOME/Documents/Code/MyVineApp"}"

# ─── Couleurs ────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅  $*${NC}"; }
info() { echo -e "${CYAN}➜  $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️   $*${NC}"; }
fail() { echo -e "${RED}❌  $*${NC}"; exit 1; }

echo ""
echo -e "${CYAN}🍷  MyVine — Installation React Native iOS${NC}"
echo    "    Destination : $DEST"
echo ""

# ─── 0. Prérequis ────────────────────────────────────────────────────────────
info "Vérification des prérequis..."

command -v node >/dev/null 2>&1 || fail "Node.js introuvable. Installez-le depuis https://nodejs.org"
command -v npx  >/dev/null 2>&1 || fail "npx introuvable. Installez Node.js depuis https://nodejs.org"
command -v pod  >/dev/null 2>&1 || fail "CocoaPods introuvable. Lancez : sudo gem install cocoapods"
xcode-select -p >/dev/null 2>&1 || fail "Xcode Command Line Tools requis. Lancez : xcode-select --install"
python3 --version >/dev/null 2>&1 || fail "python3 introuvable (nécessaire pour patcher Info.plist)"

ok "Prérequis OK (Node $(node -v), CocoaPods $(pod --version))"

# ─── 1. Dossier destination ───────────────────────────────────────────────────
if [ -d "$DEST" ]; then
  warn "Le dossier $DEST existe déjà."
  printf "   Supprimer et recommencer ? (y/N) "
  read -r confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || { echo "Annulé."; exit 0; }
  rm -rf "$DEST"
fi

mkdir -p "$(dirname "$DEST")"

# ─── 2. Init React Native ────────────────────────────────────────────────────
echo ""
info "Initialisation React Native $RN_VERSION → $DEST ..."

PARENT_DIR="$(dirname "$DEST")"
FOLDER_NAME="$(basename "$DEST")"

cd "$PARENT_DIR"
npx @react-native-community/cli@13 init "$APP_NAME" \
  --version "$RN_VERSION" \
  --package-name "com.myvineapp" \
  --skip-git-init \
  --skip-install \
  --directory "$FOLDER_NAME" \
  --title "MyVine"

ok "Projet React Native initialisé"

# ─── 3. Copie des sources ─────────────────────────────────────────────────────
echo ""
info "Copie des fichiers source depuis le repo..."

cd "$DEST"

cp "$REPO_DIR/App.tsx"        ./
cp "$REPO_DIR/index.js"       ./
cp "$REPO_DIR/tsconfig.json"  ./
cp "$REPO_DIR/babel.config.js" ./
cp -r "$REPO_DIR/src"         ./

ok "Sources copiées"

# ─── 4. Fusion des dépendances dans package.json ─────────────────────────────
echo ""
info "Mise à jour de package.json..."

node - <<'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

Object.assign(pkg.dependencies, {
  "@react-navigation/bottom-tabs":  "^6.6.1",
  "@react-navigation/native":       "^6.1.18",
  "@react-navigation/native-stack": "^6.11.0",
  "react-native-fs":                "^2.20.0",
  "react-native-image-picker":      "^7.1.2",
  "react-native-keychain":          "^8.2.0",
  "react-native-safe-area-context": "^4.10.5",
  "react-native-screens":           "^3.31.1",
  "react-native-sqlite-storage":    "^6.0.1",
});

pkg.devDependencies = pkg.devDependencies || {};
Object.assign(pkg.devDependencies, {
  "babel-plugin-module-resolver":       "^5.0.3",
  "@types/react-native-sqlite-storage": "^6.0.5",
});

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('   package.json mis à jour');
EOF

ok "Dépendances fusionnées"

# ─── 5. npm install ───────────────────────────────────────────────────────────
echo ""
info "Installation des packages npm (peut prendre 1-2 minutes)..."
npm install
ok "npm install terminé"

# ─── 6. Permissions iOS (Info.plist) ─────────────────────────────────────────
echo ""
info "Ajout des permissions iOS..."

PLIST="$DEST/ios/$APP_NAME/Info.plist"

if [ -f "$PLIST" ]; then
  python3 - "$PLIST" <<'PYEOF'
import sys, plistlib

path = sys.argv[1]
with open(path, 'rb') as f:
    plist = plistlib.load(f)

plist['NSCameraUsageDescription']      = "Pour photographier les étiquettes de vin"
plist['NSPhotoLibraryUsageDescription'] = "Pour choisir une photo d'étiquette de vin"

with open(path, 'wb') as f:
    plistlib.dump(plist, f)
PYEOF
  ok "Info.plist mis à jour ($PLIST)"
else
  warn "Info.plist introuvable à $PLIST"
  warn "Ajoutez manuellement NSCameraUsageDescription et NSPhotoLibraryUsageDescription"
fi

# ─── 7. pod install ───────────────────────────────────────────────────────────
echo ""
info "Installation des pods iOS (peut prendre 2-3 minutes)..."
cd "$DEST/ios"
pod install
cd "$DEST"
ok "pod install terminé"

# ─── 8. Résumé ────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🍷  MyVine est prêt !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Pour lancer sur le simulateur :"
echo -e "  ${CYAN}cd $DEST${NC}"
echo -e "  ${CYAN}npx react-native run-ios${NC}"
echo ""
echo "  Pour lancer sur un iPhone connecté :"
echo -e "  ${CYAN}npx react-native run-ios --device${NC}"
echo ""
