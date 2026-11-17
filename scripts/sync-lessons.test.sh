#!/usr/bin/env bash
# Tests scripts/sync-lessons.sh against a throwaway git repository and a
# stand-in `gh` that records its calls. Run with: scripts/sync-lessons.test.sh
# Ported from the CV repository's scripts/sync-homepage.test.sh.

set -euo pipefail

script=$(realpath "$(dirname "$0")/sync-lessons.sh")
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cd "$work"

# The stand-in gh: `pr list` prints the number in $work/open-pr, if any;
# every call is appended to $work/gh.log.
mkdir bin
cat >bin/gh <<STUB
#!/usr/bin/env bash
echo "\$*" >>"$work/gh.log"
if [ "\$1 \$2" = "pr list" ] && [ -f "$work/open-pr" ]; then cat "$work/open-pr"; fi
STUB
chmod +x bin/gh
export PATH="$work/bin:$PATH"
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
export GIT_AUTHOR_NAME=test GIT_AUTHOR_EMAIL=test@example.invalid
export GIT_COMMITTER_NAME=test GIT_COMMITTER_EMAIL=test@example.invalid
export SOURCE=owner/demo@abc1234

failures=0
pass() { echo "ok    $1"; }
fail() {
  echo "FAIL  $1"
  failures=$((failures + 1))
}
check() { # check <description> <command that must succeed...>
  if "${@:2}" >/dev/null 2>&1; then pass "$1"; else fail "$1"; fi
}
refute() { # refute <description> <command that must fail...>
  if "${@:2}" >/dev/null 2>&1; then fail "$1"; else pass "$1"; fi
}

# The "homepage": a bare repository whose main branch has an old export of
# the project "demo" and no export of "fresh".
git init --quiet --bare --initial-branch=main origin.git
git clone --quiet origin.git seed 2>/dev/null
mkdir -p seed/content/lessons
echo old >seed/content/lessons/demo.json
git -C seed add . && git -C seed commit --quiet --message 'old lessons' && git -C seed push --quiet origin main

branch=sync/lessons-demo
on_origin() { git -C origin.git "$@"; }
sync() { # sync <contents of the export> [project id]
  rm -rf checkout gh.log && touch gh.log
  git clone --quiet --depth 1 "file://$work/origin.git" checkout
  echo "$1" >export.json
  if ! "$script" export.json checkout "${2:-demo}" >sync.out 2>&1; then
    cat sync.out
    fail 'the sync script exits without an error'
  fi
}

echo '# the export matches the homepage'
sync old
refute 'no branch is pushed' on_origin rev-parse --verify --quiet "$branch"
refute 'no pull request is opened or closed' grep -Eq '^pr (create|close)' gh.log

echo '# the export differs and no pull request is open'
sync new-1
check 'the branch has the export' test "$(on_origin show "$branch:content/lessons/demo.json")" = new-1
check 'the commit names the source commit' eval "on_origin log -1 --format=%s $branch | grep -q '(owner/demo@abc1234)'"
check 'the branch starts from main' test "$(on_origin rev-parse "$branch~1")" = "$(on_origin rev-parse main)"
check 'a pull request is opened' grep -q "^pr create --base main --head $branch" gh.log
refute 'it does not ask to register a known project' grep -q 'lessonProjects' gh.log

echo '# a pull request is open, with a commit added by hand'
echo 12 >open-pr
git clone --quiet --branch "$branch" origin.git fixup 2>/dev/null
echo fix >fixup/by-hand.txt
git -C fixup add . && git -C fixup commit --quiet --message 'by hand' && git -C fixup push --quiet origin "$branch"
sync new-2
check 'the branch has the new export' test "$(on_origin show "$branch:content/lessons/demo.json")" = new-2
check 'the commit added by hand is kept' test "$(on_origin show "$branch:by-hand.txt")" = fix
refute 'no second pull request is opened' grep -q '^pr create' gh.log

echo '# the open pull request already has the export'
before=$(on_origin rev-parse "$branch")
sync new-2
check 'nothing is pushed' test "$(on_origin rev-parse "$branch")" = "$before"

echo '# the lessons change is undone while the pull request is open'
sync old
check 'the pull request is closed' grep -q '^pr close 12 --delete-branch' gh.log
check 'nothing is pushed' test "$(on_origin rev-parse "$branch")" = "$before"

echo '# no pull request is open but an old branch is left'
rm open-pr
sync new-3
check 'the branch has the export' test "$(on_origin show "$branch:content/lessons/demo.json")" = new-3
check 'the branch starts from main again' test "$(on_origin rev-parse "$branch~1")" = "$(on_origin rev-parse main)"
refute 'the old commits are gone' on_origin cat-file -e "$branch:by-hand.txt"
check 'a pull request is opened' grep -q '^pr create' gh.log

echo '# a project the homepage has no export of yet'
sync first fresh
check 'its branch has the export' test "$(on_origin show sync/lessons-fresh:content/lessons/fresh.json)" = first
check 'the pull request asks to register the project' grep -q 'lessonProjects' gh.log

echo '# an unsafe project id'
rm -rf checkout && git clone --quiet --depth 1 "file://$work/origin.git" checkout
refute 'is rejected' "$script" export.json checkout '../evil'

if [ "$failures" -gt 0 ]; then
  echo "$failures failed"
  exit 1
fi
echo 'all passed'
