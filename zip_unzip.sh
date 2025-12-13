#!/bin/sh
set -eu

# Determine target branch (input or current ref)
TARGET_BRANCH=${1}

if [ -z "$TARGET_BRANCH" ]; then
  case "${GITHUB_REF:-}" in
    refs/heads/*)
      TARGET_BRANCH="${GITHUB_REF#refs/heads/}"
      ;;
    *)
      TARGET_BRANCH="HEAD"
      ;;
  esac
fi

echo "Target branch: $TARGET_BRANCH"

# Find zip files under content/
found=0

find content -type f -iname '*.zip' | while IFS= read -r zip; do
  found=1
  echo "Processing: $zip"

  fname=$(basename "$zip")
  base=${fname%.*}

  tmpdir=$(mktemp -d)

  echo "Extracting to temp dir..."
  unzip -q "$zip" -d "$tmpdir" || {
    echo "Failed to unzip $zip"
    rm -rf "$tmpdir"
    exit 1
  }

  # Count top-level entries
  set -- "$tmpdir"/*
  if [ "$#" -eq 1 ] && [ -d "$1" ]; then
    # Zip already contains a root folder
    final_dest="content/$(basename "$1")"
    echo "Zip has root folder, moving to $final_dest"

    rm -rf "$final_dest"
    mv "$1" "$final_dest"
  else
    # Zip contains loose files
    final_dest="content/$base"
    echo "Zip has loose files, creating $final_dest"

    mkdir -p "$final_dest"
    mv "$tmpdir"/* "$final_dest"/
  fi

  rm -rf "$tmpdir"
  rm -f "$zip"
done

if [ "$found" -eq 0 ]; then
  echo "No .zip files found under content/. Nothing to do."
fi