#!/usr/bin/env bash
# Checks every domain in monitoring/domains.txt and prints one line per failure:
#   <domain> <reason>
# A domain fails when it does not answer 2xx/3xx, when DNS does not resolve, or when it
# answers 200 with a registrar parking page (which a status-code check alone reports as up).
set -u
list="${1:-monitoring/domains.txt}"
ua="uptime-check (+https://github.com/Gr0wthHacker/portfolio)"
while read -r d; do
  case "$d" in ''|\#*) continue ;; esac
  body="$(mktemp)"
  code="$(curl -sS -L --max-time 20 --retry 1 -A "$ua" -o "$body" -w '%{http_code}' "https://$d" 2>/dev/null)"
  rc=$?
  if [ "$rc" -eq 6 ]; then
    echo "$d does not resolve (no DNS record)"
  elif [ "$rc" -ne 0 ] || [ -z "$code" ] || [ "$code" = "000" ]; then
    echo "$d no response (curl exit $rc)"
  elif [ "$code" -lt 200 ] || [ "$code" -ge 400 ]; then
    echo "$d returned $code"
  elif grep -qiE 'parking-lander|window\.location\.href="/lander"|sedoparking|parkingcrew|domain (is|may be) for sale|buy this domain' "$body"; then
    echo "$d serves a registrar parking page"
  fi
  rm -f "$body"
done < "$list"
