#!/bin/bash
# auto_commit.sh
# Stages changes, inspects WHAT actually changed, and builds a conventional
# commit message from that — instead of you hardcoding one every time.
#
# Heuristic, not psychic: it reads file paths + change type (added/modified/
# deleted) to guess type+scope. Review the generated message before confirming;
# it'll be right most of the time, not all of the time.

set -e

cd "$(git rev-parse --show-toplevel)" 2>/dev/null || {
  echo "Not inside a git repo. Run this from within Career-recomender."
  exit 1
}

git add -A

# Bail early if there's nothing staged
if git diff --cached --quiet; then
  echo "Nothing to commit. Go write some code first."
  exit 0
fi

# --- Collect staged changes: STATUS<TAB>path ---
mapfile -t CHANGES < <(git diff --cached --name-status)

declare -A CATEGORY_COUNT
ADDED=0
MODIFIED=0
DELETED=0
FILES_LIST=()

classify() {
  local f="$1"
  case "$f" in
    api/*)            echo "api" ;;
    *.html)            echo "ui" ;;
    *.css)              echo "ui" ;;
    *login*|*auth*)      echo "auth" ;;
    *.js)               echo "logic" ;;
    *.md)                echo "docs" ;;
    *.json|vercel.json|package.json|.gitignore) echo "config" ;;
    *)                    echo "misc" ;;
  esac
}

for line in "${CHANGES[@]}"; do
  status=$(echo "$line" | awk '{print $1}')
  path=$(echo "$line" | cut -f2-)
  FILES_LIST+=("$path")

  case "$status" in
    A*) ADDED=$((ADDED+1)) ;;
    M*) MODIFIED=$((MODIFIED+1)) ;;
    D*) DELETED=$((DELETED+1)) ;;
  esac

  cat=$(classify "$path")
  CATEGORY_COUNT[$cat]=$(( ${CATEGORY_COUNT[$cat]:-0} + 1 ))
done

# --- Determine dominant scope (category touched the most) ---
SCOPE="general"
MAX=0
for cat in "${!CATEGORY_COUNT[@]}"; do
  if (( CATEGORY_COUNT[$cat] > MAX )); then
    MAX=${CATEGORY_COUNT[$cat]}
    SCOPE=$cat
  fi
done

# --- Determine commit type from change pattern ---
# Priority: new files => feat. Only deletions => chore. Only docs => docs.
# Only config => chore. Otherwise existing-file changes => fix.
if [[ "$SCOPE" == "docs" && $MODIFIED -ge 0 && $ADDED -eq 0 && $DELETED -eq 0 ]]; then
  TYPE="docs"
elif [[ "$SCOPE" == "config" ]]; then
  TYPE="chore"
elif (( DELETED > 0 && ADDED == 0 && MODIFIED == 0 )); then
  TYPE="chore"
elif (( ADDED > 0 )); then
  TYPE="feat"
elif [[ "$SCOPE" == "ui" ]]; then
  TYPE="style"
else
  TYPE="fix"
fi

# --- Build short summary line ---
SUMMARY_PARTS=()
(( ADDED > 0 )) && SUMMARY_PARTS+=("add ${ADDED}")
(( MODIFIED > 0 )) && SUMMARY_PARTS+=("update ${MODIFIED}")
(( DELETED > 0 )) && SUMMARY_PARTS+=("remove ${DELETED}")
SUMMARY=$(IFS=', '; echo "${SUMMARY_PARTS[*]}")

COMMIT_TITLE="${TYPE}(${SCOPE}): ${SUMMARY} file(s)"

# --- Build body: list of changed files (capped at 10 shown) ---
BODY="Changed files:"
COUNT=0
for f in "${FILES_LIST[@]}"; do
  if (( COUNT < 10 )); then
    BODY+=$'\n'"- ${f}"
  fi
  COUNT=$((COUNT+1))
done
if (( COUNT > 10 )); then
  BODY+=$'\n'"...and $((COUNT-10)) more"
fi

FULL_MESSAGE="${COMMIT_TITLE}"$'\n\n'"${BODY}"

echo "----------------------------------------"
echo "Generated commit message:"
echo "----------------------------------------"
echo "$FULL_MESSAGE"
echo "----------------------------------------"
read -p "Use this message? [y]es / [e]dit / [n]o, cancel: " choice

case "$choice" in
  y|Y|"" )
    git commit -m "$FULL_MESSAGE"
    ;;
  e|E )
    read -p "Enter your own commit title: " custom_title
    git commit -m "$custom_title"$'\n\n'"$BODY"
    ;;
  * )
    echo "Cancelled. Changes remain staged (not committed)."
    exit 0
    ;;
esac

read -p "Push to remote now? [y/n]: " push_choice
if [[ "$push_choice" == "y" || "$push_choice" == "Y" ]]; then
  git push
  echo "Pushed."
else
  echo "Committed locally. Remember to push before you forget — that's the pattern we're trying to break."
fi