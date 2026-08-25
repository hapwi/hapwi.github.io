#!/usr/bin/env bash
set -euo pipefail

REPO="hapwi/mmf-golden-gate-fixer"
ASSET="MMFGoldenGateFixer.zip"
DEST="${HOME}/Applications"
APP_NAME="MMFGoldenGateFixer.app"
CLI_NAME="mmf-fixer"
CLI_DEST="${HOME}/.local/bin/${CLI_NAME}"

mkdir -p "$DEST" "${HOME}/.local/bin"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

download() {
  local url="$1"
  curl -fsSL -o "$TMP/$ASSET" "$url"
}

if ! download "https://github.com/${REPO}/releases/latest/download/${ASSET}"; then
  echo "Latest release asset not found; trying v1.0.0..." >&2
  download "https://github.com/${REPO}/releases/download/v1.0.0/${ASSET}"
fi

ditto -xk "$TMP/$ASSET" "$TMP/unpacked"
APP_SRC="$(find "$TMP/unpacked" -name "$APP_NAME" -type d | head -n 1)"
if [[ -z "$APP_SRC" ]]; then
  echo "error: $APP_NAME not found in $ASSET" >&2
  exit 1
fi

rm -rf "$DEST/$APP_NAME"
ditto "$APP_SRC" "$DEST/$APP_NAME"
xattr -dr com.apple.quarantine "$DEST/$APP_NAME" 2>/dev/null || true

echo "Installed $DEST/$APP_NAME"

install_cli() {
  local src_dir=""
  if [[ -n "${BASH_SOURCE[0]:-}" && "${BASH_SOURCE[0]}" != "bash" && "${BASH_SOURCE[0]}" != "/dev/stdin" ]]; then
    src_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || true)"
  fi
  if [[ -n "$src_dir" && -f "$src_dir/$CLI_NAME" ]]; then
    install -m 755 "$src_dir/$CLI_NAME" "$CLI_DEST"
  else
    curl -fsSL -o "$CLI_DEST" "https://raw.githubusercontent.com/${REPO}/main/${CLI_NAME}"
    chmod 755 "$CLI_DEST"
  fi
  echo "Installed $CLI_DEST"
  case ":$PATH:" in
    *":${HOME}/.local/bin:"*) ;;
    *) echo "Add ~/.local/bin to PATH to run: $CLI_NAME" ;;
  esac
}

install_cli

open_app() {
  open "$DEST/$APP_NAME"
}

# Prompt the controlling TTY so this works under `curl | bash` (stdin is the pipe).
# Do not gate only on `[[ -r /dev/tty ]]` — that test is unreliable in some terminals.
# `read` returning EOF/error must not abort (`set -e`); empty reply defaults to Y.
reply=""
if printf "Open MMF Golden Gate Fixer now? [Y/n] " >/dev/tty 2>/dev/null; then
  set +e
  IFS= read -r reply </dev/tty
  set -e
  reply="$(printf '%s' "$reply" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
  case "$reply" in
    ""|y|yes)
      open_app
      ;;
    *)
      echo "Open with: open \"$DEST/$APP_NAME\""
      ;;
  esac
else
  echo "Open with: open \"$DEST/$APP_NAME\""
fi
