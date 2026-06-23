#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
# but don't exit on repo view check
set -e

echo "========================================================="
echo "  GitHub Repository Creator & Pusher for Rustica"
echo "========================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed. Please install git first."
    exit 1
fi

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed."
    echo "Please install it or authenticate manually, or run:"
    echo "sudo apt install gh"
    exit 1
fi

# Check if logged in to GitHub CLI
echo "🔑 Checking GitHub authentication status..."
if ! gh auth status &> /dev/null; then
    echo "⚠️ You are not logged in to GitHub CLI."
    echo "Please run 'gh auth login' first to authenticate, and then re-run this script."
    exit 1
fi

REPO_NAME="rustica"
USER_NAME="marinm80"

# Check if repo already exists on GitHub
echo "🔍 Checking if repository $USER_NAME/$REPO_NAME exists on GitHub..."
if gh repo view "$USER_NAME/$REPO_NAME" &> /dev/null; then
    echo "ℹ️ Repository '$USER_NAME/$REPO_NAME' already exists on GitHub."
else
    echo "🚀 Creating repository '$REPO_NAME' on GitHub..."
    # We create a private repository by default to keep your files secure, 
    # but you can change it to --public if you prefer.
    gh repo create "$REPO_NAME" --private --source=. --remote=origin || echo "⚠️ Warning: Repo creation returned status code, it might already exist or remote origin conflict."
fi

# Ensure remote URL is correct
REMOTE_URL="git@github.com:$USER_NAME/$REPO_NAME.git"
# If HTTP/HTTPS is preferred:
# REMOTE_URL="https://github.com/$USER_NAME/$REPO_NAME.git"

echo "Configure remote 'origin' to point to: $REMOTE_URL"
if git remote | grep -q "^origin$"; then
    git remote set-url origin "$REMOTE_URL" || git remote set-url origin "https://github.com/$USER_NAME/$REPO_NAME.git"
else
    git remote add origin "$REMOTE_URL" || git remote add origin "https://github.com/$USER_NAME/$REPO_NAME.git"
fi

# Stage and commit files
echo "📂 Staging files..."
git add .

if ! git diff-index --quiet HEAD --; then
    echo "💾 Committing changes..."
    git commit -m "Sync project files to GitHub"
else
    echo "ℹ️ No changes to commit (working tree clean)."
fi

# Check current branch name and push
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    CURRENT_BRANCH="main"
    git checkout -b main
fi

echo "📤 Pushing branch '$CURRENT_BRANCH' to origin..."
git push -u origin "$CURRENT_BRANCH"

echo "========================================================="
echo "✅ Success! Project successfully pushed to GitHub."
echo "========================================================="
