#!/bin/bash
set -e

echo "📦 Création de la base 'care_db'..."
psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_database WHERE datname = 'care_db'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -c "CREATE DATABASE care_db;"

echo "🧭 Activation de l'extension PostGIS..."
psql -U "$POSTGRES_USER" -d care_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -U "$POSTGRES_USER" -d care_db -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;"

echo "🗂 Contenu de /backup :"
ls -lh /backup

echo "🔍 Vérification de la présence de la table 'regions' dans la base..."
TABLE_EXIST=$(psql -U "$POSTGRES_USER" -d care_db -tAc "SELECT to_regclass('public.regions');")

if [[ "$TABLE_EXIST" == "regions" ]]; then
  echo "📭 La table 'regions' existe déjà. Pas de restauration."
else
  echo "🚀 Table 'regions' non trouvée. Lancement de la restauration..."
  pg_restore -U "$POSTGRES_USER" -d care_db /backup/backup.dump
  echo "✅ Restauration terminée."
fi
