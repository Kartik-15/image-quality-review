#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf dist
npm run build

cd dist
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" \
    -c user.email="$(git -C .. config user.email)" \
    commit -q -m "Deploy build"

remote_url=$(git -C .. remote get-url origin)
git push -f "$remote_url" gh-pages

cd ..
rm -rf dist/.git

echo "Deployed to gh-pages."
