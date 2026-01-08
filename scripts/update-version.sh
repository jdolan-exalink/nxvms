#!/bin/bash

# NXvms Version Management Script
# Usage: ./scripts/update-version.sh <version>
# Example: ./scripts/update-version.sh 0.2.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Error: Version not provided"
  echo "Usage: ./scripts/update-version.sh <version>"
  echo "Example: ./scripts/update-version.sh 0.2.0"
  exit 1
fi

# Validate version format (semver)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?(\+[a-zA-Z0-9]+)?$ ]]; then
  echo "Error: Invalid version format: $VERSION"
  echo "Please use semantic versioning: X.Y.Z"
  exit 1
fi

echo "📦 Updating NXvms to version $VERSION..."

# Update .version file (root)
echo "$VERSION" > .version
echo "✅ Updated .version"

# Update client package.json
cd client
npm version $VERSION --no-git-tag-v
echo "✅ Updated client/package.json"

# Update server package.json if exists
if [ -f ../server/package.json ]; then
  cd ../server
  npm version $VERSION --no-git-tag-v
  echo "✅ Updated server/package.json"
  cd ..
fi

echo ""
echo "✨ Version updated to $VERSION!"
echo ""
echo "📝 Next steps:"
echo "1. Review the changes: git status"
echo "2. Commit: git add . && git commit -m \"chore: release v$VERSION\""
echo "3. Tag: git tag -a v$VERSION -m \"Release version $VERSION\""
echo "4. Push: git push origin main --tags"
