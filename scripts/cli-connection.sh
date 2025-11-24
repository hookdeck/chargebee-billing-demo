#!/usr/bin/env bash
set -euo pipefail

# --- Config you can tweak ---
PORT="${PORT:-4000}"                          # Your local app port
DEST_PATH="${DEST_PATH:-/webhooks/chargebee}" # Local path Hookdeck will forward to
SOURCE_NAME="${SOURCE_NAME:-chargebee}"       # Hookdeck Source name
DEST_NAME="${DEST_NAME:-local-dev}"           # Hookdeck Destination name
CONNECTION_NAME="${CONNECTION_NAME:-chargebee-to-local}"

# Optional: run non-interactively by exporting HOOKDECK_API_KEY beforehand
# export HOOKDECK_API_KEY=hkdk_key_xxx

# --- Pre-flight checks ---
command -v hookdeck >/dev/null 2>&1 || {
  echo "hookdeck CLI not found. Install with: brew install hookdeck/hookdeck/hookdeck or npm i -g hookdeck-cli"
  exit 1
}

command -v jq >/dev/null 2>&1 || {
  echo "jq not found. Install with: brew install jq or apt-get install jq"
  exit 1
}

# --- Ensure CLI is authenticated or create a guest session ---
if [[ -z "${HOOKDECK_API_KEY:-}" ]]; then
  echo "Tip: set HOOKDECK_API_KEY to run non-interactively. Falling back to interactive login if needed."
fi

# --- Create or update the Connection (idempotent) ---
echo "Upserting Hookdeck connection: ${CONNECTION_NAME}"
UPSERT_JSON="$(hookdeck connection upsert "${CONNECTION_NAME}" \
  --source-name "${SOURCE_NAME}" --source-type WEBHOOK \
  --destination-name "${DEST_NAME}" --destination-type CLI \
  --output json)"

# Extract the Source URL from the response
SOURCE_URL="$(echo "${UPSERT_JSON}" | jq -r '.source.url // empty')"
if [[ -z "${SOURCE_URL}" ]]; then
  # Fallback: fetch by name if output format changes
  DETAILS_JSON="$(hookdeck connection list --name "${CONNECTION_NAME}" --output json)"
  SOURCE_URL="$(echo "${DETAILS_JSON}" | jq -r '.[0].source.url')"
fi

if [[ -z "${SOURCE_URL}" ]]; then
  echo "Could not resolve the Source URL for ${CONNECTION_NAME}."
  exit 1
fi

echo
echo "✅ Hookdeck connection ready."
echo "Source URL (paste this into Chargebee Webhook settings):"
echo "  ${SOURCE_URL}"
echo

# --- Start forwarding to localhost ---
echo "Starting local forwarding..."
echo "Local target: http://localhost:${PORT}${DEST_PATH}"
echo "Listening only on source '${SOURCE_NAME}' and connection '${CONNECTION_NAME}'"
echo

# The third argument filters by connection name so only this connection forwards.
exec hookdeck listen "${PORT}" "${SOURCE_NAME}" "${CONNECTION_NAME}" --path "${DEST_PATH}"
