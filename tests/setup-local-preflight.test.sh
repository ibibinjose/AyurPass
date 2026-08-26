#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETUP_SCRIPT="$ROOT_DIR/setup-local.sh"
TMP_DIR="$(mktemp -d)"
PASS_COUNT=0
FAIL_COUNT=0

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

pass() {
  printf 'ok - %s\n' "$1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  printf 'not ok - %s\n' "$1" >&2
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

new_case() {
  CASE_DIR="$(mktemp -d "$TMP_DIR/case.XXXXXX")"
  mkdir -p "$CASE_DIR/bin"
  OUTPUT_FILE="$CASE_DIR/output.log"
  NPM_LOG="$CASE_DIR/npm.log"
  : > "$NPM_LOG"

  cat > "$CASE_DIR/bin/npm" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$TEST_NPM_LOG"
exit 97
EOF
  chmod +x "$CASE_DIR/bin/npm"
}

write_docker_mock() {
  cat > "$CASE_DIR/bin/docker" <<EOF
#!/usr/bin/env bash
$1
EOF
  chmod +x "$CASE_DIR/bin/docker"
}

run_setup() {
  set +e
  TEST_NPM_LOG="$NPM_LOG" PATH="$CASE_DIR/bin:$PATH" bash "$SETUP_SCRIPT" "$@" > "$OUTPUT_FILE" 2>&1
  CASE_STATUS=$?
  set -e
}

assert_status() {
  local expected="$1"
  local label="$2"
  if [[ "$CASE_STATUS" == "$expected" ]]; then
    pass "$label"
  else
    fail "$label (expected exit $expected, got $CASE_STATUS)"
  fi
}

assert_output_contains() {
  local expected="$1"
  local label="$2"
  if grep -Fq -- "$expected" "$OUTPUT_FILE"; then
    pass "$label"
  else
    fail "$label (missing: $expected)"
  fi
}

assert_npm_not_called() {
  local label="$1"
  if [[ ! -s "$NPM_LOG" ]]; then
    pass "$label"
  else
    fail "$label (npm was called: $(tr '\n' ' ' < "$NPM_LOG"))"
  fi
}

assert_npm_called_with() {
  local expected="$1"
  local label="$2"
  if grep -Fxq "$expected" "$NPM_LOG"; then
    pass "$label"
  else
    fail "$label (expected npm call: $expected)"
  fi
}

printf '1..18\n'

new_case
write_docker_mock 'if [[ "$1" == "compose" && "${2:-}" == "version" ]]; then exit 1; fi
exit 1'
run_setup --start
assert_status 1 "Docker Compose preflight exits non-zero when Compose is unavailable"
assert_output_contains "Docker Compose is required" "Docker Compose preflight explains the missing requirement"
assert_output_contains "npm run prisma:migrate" "Docker Compose preflight gives the manual database recovery path"
assert_npm_not_called "Docker Compose preflight runs before dependency installation"

new_case
write_docker_mock 'if [[ "$1" == "compose" && "${2:-}" == "version" ]]; then
  printf "Docker Compose version v2.0.0\\n"
  exit 0
fi
if [[ "$1" == "info" ]]; then
  exit 1
fi
exit 1'
run_setup --start
assert_status 1 "Docker engine preflight exits non-zero when the engine is unavailable"
assert_output_contains "Docker is installed but its engine is not available" "Docker engine preflight gives a distinct recovery message"
assert_npm_not_called "Docker engine preflight runs before dependency installation"

new_case
write_docker_mock 'exit 1'
run_setup --help
assert_status 0 "Help exits successfully without Docker"
assert_output_contains "Usage: ./setup-local.sh" "Help documents script usage"
assert_output_contains "--skip-seed" "Help documents the seed option"
assert_output_contains "--start" "Help documents the start option"
assert_npm_not_called "Help does not install dependencies"

new_case
write_docker_mock 'exit 1'
run_setup --unknown-option
assert_status 1 "Unknown options exit non-zero"
assert_output_contains "Usage: ./setup-local.sh" "Unknown options show usage guidance"
assert_npm_not_called "Unknown options do not install dependencies"

new_case
write_docker_mock 'if [[ "$1" == "compose" && "${2:-}" == "version" ]]; then
  printf "Docker Compose version v2.0.0\\n"
  exit 0
fi
if [[ "$1" == "info" ]]; then
  printf "Server Version: test\\n"
  exit 0
fi
exit 1'
run_setup --start
assert_status 97 "A healthy Docker preflight proceeds to dependency installation"
assert_output_contains "1/5 Installing locked workspace dependencies" "Healthy Docker preflight reaches the setup workflow"
assert_npm_called_with "ci" "Healthy Docker preflight invokes locked dependency installation"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  printf '\n%d assertion(s) failed; %d passed.\n' "$FAIL_COUNT" "$PASS_COUNT" >&2
  exit 1
fi

printf '\nAll %d setup-local preflight assertions passed.\n' "$PASS_COUNT"
