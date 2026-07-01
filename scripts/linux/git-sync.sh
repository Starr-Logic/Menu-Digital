#!/bin/bash
MESSAGE="${1:-}"
if [ -z "$MESSAGE" ]; then
    read -p "Commit message: " MESSAGE
fi
if [ -z "$MESSAGE" ]; then
    echo "Commit message cannot be empty."
    exit 1
fi
echo "Safe Team Git Sync"
echo "Commit local work, rebase on latest origin/main, then push."
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
"$SCRIPT_DIR/git-push.sh" "$MESSAGE"
