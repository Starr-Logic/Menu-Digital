#!/bin/bash
set -e

MESSAGE="${1:-}"
if [ -z "$MESSAGE" ]; then
    echo "Please provide a commit message."
    echo "Usage: ./git-push-owner.sh \"commit message\""
    exit 1
fi

git add .
git commit -m "$MESSAGE"

echo "Pulling and rebasing from origin main..."
if ! git pull --rebase origin main; then
    echo "========================================="
    echo "ERROR: Conflict detected during pull!"
    echo "Please resolve conflicts manually, then run:"
    echo "  git rebase --continue"
    echo "  git push origin main"
    echo "========================================="
    exit 1
fi

echo "Pushing to origin main (Owner)..."
git push origin main
echo "Done!"
