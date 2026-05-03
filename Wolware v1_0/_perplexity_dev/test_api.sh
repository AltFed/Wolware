#!/usr/bin/env bash
# Test curl per le API Prima Nota — Blocco 1
# Eseguire con il server Flask attivo su localhost:5000
# Nota: adattare il cookie di sessione se necessario

BASE="http://localhost:5000"

echo "=== Login ==="
curl -s -c /tmp/cookies.txt -X POST "$BASE/login" \
  -d 'username=admin&password=admin123' -L | grep -c 'Dashboard'

echo "\n=== Saldi ==="
curl -s -b /tmp/cookies.txt "$BASE/api/prima-nota/saldi" | python3 -m json.tool

echo "\n=== Anni ==="
curl -s -b /tmp/cookies.txt "$BASE/api/prima-nota/anni" | python3 -m json.tool

echo "\n=== Movimenti (tutti) ==="
curl -s -b /tmp/cookies.txt "$BASE/api/prima-nota/movimenti" | python3 -m json.tool

echo "\n=== Clienti da sollecitare ==="
curl -s -b /tmp/cookies.txt "$BASE/api/prima-nota/clienti-da-sollecitare" | python3 -m json.tool

echo "\n=== Movimenti filtrati per anno/mese/tipo ==="
curl -s -b /tmp/cookies.txt "$BASE/api/prima-nota/movimenti?anno=2026&mese=3&tipo=entrate" | python3 -m json.tool

echo "\n=== Ricerca testuale ==="
curl -s -b /tmp/cookies.txt "$BASE/api/prima-nota/movimenti?cerca=Rossi" | python3 -m json.tool
