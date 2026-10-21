#!/usr/bin/env bash
# Copies every image the site uses from the old host into assets/img/ so the site no longer
# depends on Names and Numbers. Run this from a machine with normal internet access.
# Then build with:  npm run build:local
set -u
BASE="https://cdn.webnamesandnumbers.com/wp-content/uploads/sites/1020/"
cd "$(dirname "$0")/.."
fail=0
while read -r p; do
  [ -z "$p" ] && continue
  dest="assets/img/$p"
  [ -s "$dest" ] && continue
  mkdir -p "$(dirname "$dest")"
  if ! curl -fsSL --retry 2 -o "$dest" "$BASE$p"; then
    # WordPress "-scaled" files: the original may exist without the suffix
    alt="${p/-scaled/}"
    if [ "$alt" != "$p" ] && curl -fsSL -o "$dest" "$BASE$alt"; then :; else
      echo "FAILED: $p"; rm -f "$dest"; fail=$((fail+1))
    fi
  fi
done < scripts/images.txt
echo "Done. Failures: $fail"
