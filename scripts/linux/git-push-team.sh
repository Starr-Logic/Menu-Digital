#!/bin/bash
set -e

MESSAGE="${1:-}"
if [ -z "$MESSAGE" ]; then
    echo "Please provide a commit message."
    echo "Usage: ./git-push-team.sh \"commit message\""
    exit 1
fi

git add .
git commit -m "$MESSAGE"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

echo "Pulling and rebasing from origin $CURRENT_BRANCH..."
if ! git pull --rebase origin "$CURRENT_BRANCH"; then
    echo "========================================="
    echo "ERROR: Conflict detected during pull!"
    echo "Please resolve conflicts manually, then run:"
    echo "  git rebase --continue"
    echo "  git push origin $CURRENT_BRANCH"
    echo "========================================="
    exit 1
fi

echo "Pushing to origin $CURRENT_BRANCH (Team)..."
git push origin "$CURRENT_BRANCH"
echo "Done!"
