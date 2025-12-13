#!/bin/sh
set -eu

# Determine target branch (input or current ref)
TARGET_BRANCH=${1:-}

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
  final_dest="content/$base"

  tmpdir=$(mktemp -d)

  echo "Extracting to temp dir..."
  unzip -q "$zip" -d "$tmpdir" || {
    echo "Failed to unzip $zip"
    rm -rf "$tmpdir"
    exit 1
  }

  echo "Flattening all files into '$final_dest'..."
  rm -rf "$final_dest"
  mkdir -p "$final_dest"

  # Move ALL files from any depth into final_dest
  find "$tmpdir" -type f | while IFS= read -r file; do
    name=$(basename "$file")
    target="$final_dest/$name"

    # Handle duplicate filenames
    if [ -e "$target" ]; then
      i=1
      while [ -e "$final_dest/${base}_$i_$name" ]; do
        i=$((i + 1))
      done
      target="$final_dest/${base}_$i_$name"
    fi

    mv "$file" "$target"
  done

  rm -rf "$tmpdir"
  rm -f "$zip"
done

if [ "$found" -eq 0 ]; then
  echo "No .zip files found under content/. Nothing to do."
fi