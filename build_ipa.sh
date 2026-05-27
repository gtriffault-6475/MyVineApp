#!/bin/bash
# build_ipa.sh — Construit MyVine et exporte un IPA pour installation sur iPhone
# Usage : ./build_ipa.sh [development|adhoc]
#   development = gratuit (Apple ID personnel, valide 7 jours)
#   adhoc       = compte développeur payant ($99/an), valide 1 an
#
# Prérequis :
#   - Xcode installé avec Command Line Tools
#   - iPhone connecté ET déjà approuvé dans Xcode (pour development)
#   - Apple ID configuré dans Xcode > Settings > Accounts
#   - pod install déjà exécuté (sinon lancer : cd ios && pod install)

set -euo pipefail

SCHEME="MyVine"
WORKSPACE="ios/MyVine.xcworkspace"
METHOD="${1:-development}"
BUILD_DIR="build"
ARCHIVE_PATH="$BUILD_DIR/MyVine.xcarchive"
EXPORT_PATH="$BUILD_DIR/ipa"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅  $*${NC}"; }
info() { echo -e "${CYAN}➜  $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️   $*${NC}"; }
fail() { echo -e "${RED}❌  $*${NC}"; exit 1; }

echo ""
echo -e "${CYAN}🍷  MyVine — Build IPA ($METHOD)${NC}"
echo ""

# ── Vérifications ────────────────────────────────────────────────────────────
[[ "$METHOD" == "development" || "$METHOD" == "adhoc" ]] || \
  fail "Méthode invalide : '$METHOD'. Utilisez 'development' ou 'adhoc'."

command -v xcodebuild >/dev/null 2>&1 || fail "xcodebuild introuvable. Installez Xcode."
command -v node >/dev/null 2>&1       || fail "Node.js introuvable."
[ -f "$WORKSPACE" ]                   || fail "Workspace iOS introuvable. Lancez d'abord : cd ios && pod install"

# Récupérer le Team ID depuis Xcode
TEAM_ID=$(security find-identity -v -p codesigning 2>/dev/null | grep -oE '"[A-Z0-9]{10}' | head -1 | tr -d '"' || true)
if [ -z "$TEAM_ID" ]; then
  warn "Aucun certificat de signature trouvé."
  warn "Ouvrez Xcode → Settings → Accounts → ajoutez votre Apple ID"
  warn "Puis relancez ce script."
  exit 1
fi
ok "Team ID détecté : $TEAM_ID"

# ── Bundle React Native ───────────────────────────────────────────────────────
info "Construction du bundle JavaScript..."
mkdir -p ios/MyVine

npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/MyVine/main.jsbundle \
  --assets-dest ios/MyVine \
  --reset-cache

ok "Bundle JS généré"

# ── Archive Xcode ─────────────────────────────────────────────────────────────
info "Archivage avec Xcode (peut prendre 2-5 minutes)..."
mkdir -p "$BUILD_DIR"

xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  | grep -E "error:|warning:|Archive Succeeded|BUILD" || true

[ -d "$ARCHIVE_PATH" ] || fail "L'archive n'a pas été créée. Vérifiez les erreurs ci-dessus."
ok "Archive créée : $ARCHIVE_PATH"

# ── Export IPA ────────────────────────────────────────────────────────────────
info "Export IPA (méthode : $METHOD)..."
rm -rf "$EXPORT_PATH"

EXPORT_PLIST="ios/ExportOptions-${METHOD}.plist"
# Injecter le Team ID dans le plist d'export
PLIST_TMP=$(mktemp).plist
python3 - "$EXPORT_PLIST" "$TEAM_ID" "$PLIST_TMP" <<'PYEOF'
import sys, plistlib
src, team_id, dst = sys.argv[1], sys.argv[2], sys.argv[3]
with open(src, 'rb') as f:
    p = plistlib.load(f)
p['teamID'] = team_id
with open(dst, 'wb') as f:
    plistlib.dump(p, f)
PYEOF

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$PLIST_TMP" \
  -exportPath "$EXPORT_PATH" \
  | grep -E "error:|Export Succeeded" || true

IPA_FILE=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)
[ -f "$IPA_FILE" ] || fail "L'IPA n'a pas été généré."

ok "IPA généré : $IPA_FILE"

# ── Instructions d'installation ───────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🍷  MyVine.ipa est prêt !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Fichier : $IPA_FILE"
echo ""

if [ "$METHOD" == "development" ]; then
  echo "  Installation (compte gratuit, valide 7 jours) :"
  echo ""
  echo -e "  ${CYAN}Option A — via Finder (macOS 10.15+) :${NC}"
  echo "    1. Connectez l'iPhone en USB"
  echo "    2. Ouvrez Finder → sélectionnez l'iPhone"
  echo "    3. Onglet Fichiers → faites glisser l'IPA"
  echo ""
  echo -e "  ${CYAN}Option B — via Apple Configurator 2 (App Store, gratuit) :${NC}"
  echo "    1. Ouvrez Apple Configurator 2"
  echo "    2. Sélectionnez votre iPhone"
  echo "    3. Ajouter → Apps → choisissez l'IPA"
  echo ""
  echo "  ⚠️  Sur l'iPhone : Réglages → Général → VPN et gestion"
  echo "     des appareils → approuvez le certificat développeur"
  echo ""
  echo "  ♻️  À refaire dans 7 jours (relancez ce script)"
else
  echo "  Installation (Ad Hoc, valide 1 an) :"
  echo ""
  echo -e "  ${CYAN}Via TestFlight (recommandé) :${NC}"
  echo "    Uploadez l'IPA sur App Store Connect → TestFlight"
  echo "    Puis installez depuis l'app TestFlight sur l'iPhone"
  echo ""
  echo -e "  ${CYAN}Via Apple Configurator 2 :${NC}"
  echo "    Connectez iPhone → Ajouter → Apps → choisissez l'IPA"
fi

echo ""
echo -e "  ${CYAN}Emplacement IPA :${NC} $(pwd)/$IPA_FILE"
echo ""
