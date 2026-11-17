#!/usr/bin/env bash
# Puts a project's exported lessons on a branch of this repository and opens a
# pull request for it. Run by .github/workflows/sync-lessons.yml after
# scripts/export-lessons.mjs. Adapted from the CV repository's
# scripts/sync-homepage.sh, which does the same for content/cv.json.
#
#   scripts/sync-lessons.sh <lessons.json> <homepage checkout> <project id>
#
# The checkout must be of the homepage's default branch, with push access.
# `gh` needs GH_TOKEN and GH_REPO (the homepage repository). SOURCE names the
# commit the export came from, such as elithrade/url-shortener@abc1234.
#
# One pull request per project at a time, from sync/lessons-<project id>:
# - The export matches the homepage: nothing to do. An open sync pull request
#   is then out of date (the change was undone), so it is closed.
# - No sync pull request is open: the branch is recreated from the default
#   branch and a pull request is opened.
# - One is open: the new export is committed on top of its branch, which
#   keeps any commit added there by hand.

set -euo pipefail

lessons_json=$(realpath "$1")
cd "$2"
project=$3

# The id becomes a file name and a branch name.
if ! [[ $project =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "The project id must be lowercase letters and digits joined by dashes: $project" >&2
  exit 1
fi

branch=sync/lessons-$project
target=content/lessons/$project.json
source=${SOURCE:-unknown}
base=$(git rev-parse --abbrev-ref HEAD)
title="chore: sync lessons for $project"

new_project=false
[ -e "$target" ] || new_project=true

open_pr=$(gh pr list --head "$branch" --state open --json number --jq '.[0].number // empty')

mkdir -p content/lessons
cp "$lessons_json" "$target"
if ! $new_project && git diff --quiet "origin/$base" -- "$target"; then
  echo "The export matches the homepage's $base branch: nothing to sync."
  if [ -n "$open_pr" ]; then
    gh pr close "$open_pr" --delete-branch \
      --comment "The export of $project now matches \`$base\`, so there is nothing left to sync."
    echo "Closed pull request #$open_pr."
  fi
  exit 0
fi

if [ -n "$open_pr" ]; then
  git checkout --quiet -- "$target" 2>/dev/null || rm -f "$target"
  git fetch --quiet origin "$branch"
  git switch --quiet --create "$branch" FETCH_HEAD
  cp "$lessons_json" "$target"
  if git diff --quiet -- "$target"; then
    echo "Pull request #$open_pr already has this export."
    exit 0
  fi
else
  git switch --quiet --create "$branch"
fi

git add "$target"
git -c user.name='github-actions[bot]' \
  -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
  commit --quiet --message "$title ($source)"

if [ -n "$open_pr" ]; then
  git push --quiet origin "$branch"
  echo "Updated pull request #$open_pr."
  exit 0
fi

body="Written by the sync-lessons workflow from \`$source\`. \`$target\` is generated, so change the project's \`LESSONS.md\`, not this file.

If \`test\` fails, the failing test names the problem. Push a fix to this branch; a later sync adds to the branch and keeps it."

if $new_project; then
  body="$body

This is the first export of \`$project\`. Before merging, register it so the site shows it:

- import the file and add it to \`lessonProjects\` in \`libs/content/lessons.ts\`
- add its loader to \`loadLessons\` in \`libs/content/lessons-loaders.ts\`"
fi

# A branch left over from an earlier, closed pull request is replaced.
git push --quiet --force origin "$branch"
gh pr create --base "$base" --head "$branch" --title "$title" --body "$body"
