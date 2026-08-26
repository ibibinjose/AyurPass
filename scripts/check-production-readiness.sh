#!/usr/bin/env bash
set -euo pipefail

CHECKLIST="docs/AYURPASS_PRODUCTION_READINESS_CHECKLIST.md"
SOURCE_NOTES="docs/research/stripe_production_readiness_sources.md"
FAILURES=0

pass() {
  printf 'ok - %s\n' "$1"
}

fail() {
  printf 'not ok - %s\n' "$1" >&2
  FAILURES=$((FAILURES + 1))
}

require_file() {
  local path="$1"
  local label="$2"
  if [[ -s "$path" ]]; then
    pass "$label"
  else
    fail "$label (missing or empty: $path)"
  fi
}

require_text() {
  local text="$1"
  local path="$2"
  local label="$3"
  if grep -Fq "$text" "$path"; then
    pass "$label"
  else
    fail "$label (missing: $text)"
  fi
}

printf 'Production readiness documentation checks\n'
printf '%s\n' '======================================='

require_file "$CHECKLIST" "Production readiness checklist exists"
require_file "$SOURCE_NOTES" "Stripe readiness source notes exist"

if [[ -f "$CHECKLIST" ]]; then
  for section in \
    '## 1. Launch Decision Gate' \
    'Customer and Provider Screen Checklist' \
    'Billing, Payment, Refund, and Payout Checklist' \
    'Transactional Email Checklist' \
    'Receipt and Invoice Field Checklist' \
    'End-to-End Production Test Matrix' \
    'Monitoring, Reconciliation, and Incident Readiness' \
    'Suggested Launch Sequence' \
    'Sign-off Record' \
    '## References'; do
    require_text "$section" "$CHECKLIST" "Checklist includes $section"
  done

  if [[ "$(grep -c '^| E2E-' "$CHECKLIST" || true)" -ge 8 ]]; then
    pass "Checklist includes a substantive end-to-end test matrix"
  else
    fail "Checklist has fewer than eight end-to-end test scenarios"
  fi

  if [[ "$(grep -c '^\[[1-9][0-9]*\]:' "$CHECKLIST" || true)" -ge 3 ]]; then
    pass "Checklist includes traceable references"
  else
    fail "Checklist has fewer than three reference entries"
  fi

  if grep -nE '[[:blank:]]+$' "$CHECKLIST"; then
    fail "Checklist contains trailing whitespace"
  else
    pass "Checklist has no trailing whitespace"
  fi

  if grep -nE 'sk_(live|test)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|SMTP_PASS=[^[:space:]]+' "$CHECKLIST" "$SOURCE_NOTES" 2>/dev/null; then
    fail "Readiness documentation contains a credential-like value"
  else
    pass "Readiness documentation contains no credential-like value"
  fi
fi

if [[ -f "$SOURCE_NOTES" ]]; then
  require_text 'https://docs.stripe.com/' "$SOURCE_NOTES" "Source notes cite official Stripe documentation"
  require_text 'AyurPass code and documentation alignment' "$SOURCE_NOTES" "Source notes link external guidance to AyurPass"
fi

if [[ "$FAILURES" -gt 0 ]]; then
  printf '\n%d readiness check(s) failed.\n' "$FAILURES" >&2
  exit 1
fi

printf '\nAll production readiness documentation checks passed.\n'
