#!/usr/bin/env bash
#
# Asserts that oryjin.com actually serves pages. Run after GitHub Pages reports
# a successful build, from .github/workflows/notify-deploy.yml — a green Pages
# run only means the commit was published, not that the site is reachable, and
# publication and propagation are not the same instant.
#
#   ./scripts/smoke-site.sh                       # https://oryjin.com
#   ./scripts/smoke-site.sh https://oryjin.com
#
# Each path is checked for HTTP 200 *and* for the page marker below. The status
# code alone is not enough: an edge error page or a Pages 404 can answer 200 on
# a custom domain, and "something answered" is not "our site is up".
#
# What this does NOT prove: that the *new* commit is the one being served. The
# site is committed HTML with no build step, so there is no version stamp to
# assert against; proving that would mean hand-editing a marker into index.html
# on every change. This checks liveness, which is the failure that actually
# takes the site down.
#
# Exits non-zero on the first path that never comes good, with the last status
# code in the message, and writes a one-line `reason` to $GITHUB_OUTPUT so the
# workflow can put it in the Slack message.
set -euo pipefail

BASE_URL="${1:-https://oryjin.com}"
BASE_URL="${BASE_URL%/}"

# ~90 seconds of grace. Pages has already reported the deployment done by the
# time this runs, so this covers CDN propagation, not a build.
ATTEMPTS="${SMOKE_ATTEMPTS:-18}"
INTERVAL="${SMOKE_INTERVAL:-5}"

# Appended as a query string so a cached copy at the edge cannot answer for the
# origin. The workflow passes the run id; $$ keeps a local run honest too.
CACHE_BUSTER="${SMOKE_CACHE_BUSTER:-$$}"

# Deliberately the brand prefix of the <title> and not the whole thing: this has
# to survive copy edits to the tagline, or the smoke test becomes a false alarm
# every time someone rewords the homepage.
MARKER='<title>Oryjin'

PATHS=(/ /partners/)

body="$(mktemp)"
trap 'rm -f "$body"' EXIT

# Report the reason once, to the log and to the calling step's outputs. The step
# fails right after, and a failed step's outputs are still readable — that is how
# the Slack message gets the status code instead of "see the run log".
fail() {
	echo "::error::Smoke test failed — $1"
	printf 'reason=%s\n' "$1" >> "${GITHUB_OUTPUT:-/dev/null}"
	exit 1
}

# `curl -o <file> -w %{http_code}` reports every non-2xx as its code rather than
# as curl's exit 22, so the message below can name it. On a refused or timed out
# connection curl writes nothing and exits non-zero, hence `|| true` — without it
# `set -e` would kill the loop on the first blip instead of retrying.
probe() {
	local code
	code="$(curl -sS -o "$body" -w '%{http_code}' --max-time 30 \
		-H 'Cache-Control: no-cache' "$1" 2>/dev/null)" || true
	printf '%s' "${code:-000}"
}

echo "Smoke test: $BASE_URL"

for path in "${PATHS[@]}"; do
	url="$BASE_URL$path?cb=$CACHE_BUSTER"
	status="000"
	served=""

	for attempt in $(seq 1 "$ATTEMPTS"); do
		status="$(probe "$url")"
		if [ "$status" = "200" ] && grep -qF "$MARKER" "$body"; then
			served="yes"
			echo "  $path 200 (attempt $attempt)"
			break
		fi
		echo "  $path $status (attempt $attempt/$ATTEMPTS)"
		if [ "$attempt" -lt "$ATTEMPTS" ]; then
			sleep "$INTERVAL"
		fi
	done

	if [ -z "$served" ]; then
		if [ "$status" = "200" ]; then
			# 200 without the marker: something is answering for the domain, but it
			# is not the page we published. Worth its own wording — "200 but wrong
			# body" and "site is down" are different mornings.
			fail "$BASE_URL$path answered 200 but did not contain '$MARKER' — the domain is serving something that is not the site."
		fi
		fail "$BASE_URL$path never answered 200 (last: $status) after $ATTEMPTS attempts."
	fi
done

echo "Smoke test passed: ${PATHS[*]}"
