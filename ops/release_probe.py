#!/usr/bin/env python3
"""Bounded, unauthenticated launch smoke checks; never saves response bodies.

Run from a network that can reach Supabase and the public website. This is
neither a load test nor an authenticated account acceptance test.
"""
import concurrent.futures
import datetime
import json
import sys
import time
import urllib.error
import urllib.request

API = "https://ndgoxnyemvgsjhergsym.supabase.co/functions/v1/"
SITE = "https://benjahlan.github.io/yumyum"  # moved from the ChatGPT-hosted site on 2026-10-26
MAX_BODY = 262144


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def valid_body(kind, raw, content_type):
    if kind == "html":
        return "text/html" in content_type and (b"YumYum" in raw or "يم يم".encode("utf-8") in raw)
    if "application/json" not in content_type:
        return False
    try:
        value = json.loads(raw)
    except (ValueError, UnicodeError):
        return False
    if not isinstance(value, dict):
        return False
    if kind == "feed":
        return (isinstance(value.get("posts"), list)
                and len(value["posts"]) <= 1
                and isinstance(value.get("hasMore"), bool))
    return isinstance(value.get("error", value.get("message", value.get("msg"))), str)


def check(spec):
    name, url, expected, kind = spec
    started = time.monotonic()
    result = {"name": name, "expected_status": expected, "passed": False}
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "YumYum-release-probe/1"})
        try:
            response = urllib.request.build_opener(NoRedirect).open(request, timeout=15)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            raw = response.read(MAX_BODY + 1)
            result["status"] = response.code
            result["passed"] = (response.code == expected and len(raw) <= MAX_BODY
                                and valid_body(kind, raw, response.headers.get("Content-Type", "")))
            if not result["passed"]:
                result["failure"] = "Unexpected HTTP status, content type, size or response shape"
    except Exception as error:
        # Do not log bodies, URLs with tokens, user content or exception messages.
        result["failure"] = type(error).__name__
    result["elapsed_ms"] = round((time.monotonic() - started) * 1000)
    return result


def main():
    specs = [
        ("guest_feed", API + "yumyum-public/feed?limit=1", 200, "feed"),
        ("invalid_guest_query", API + "yumyum-public/feed?limit=0", 400, "error"),
        ("member_route_requires_login", API + "yumyum-api/me", 401, "error"),
        ("public_terms", SITE + "/terms/", 200, "html"),
        ("public_privacy", SITE + "/privacy/", 200, "html"),
        ("account_deletion_help", SITE + "/delete-account/", 200, "html"),
        ("share_landing", SITE + "/share/", 200, "html"),
    ]
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        checks = list(executor.map(check, specs))
    report = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "passed": all(row["passed"] for row in checks), "checks": checks,
              "scope": "Unauthenticated HTTP smoke only; no account, media or capacity acceptance"}
    print(json.dumps(report, indent=2))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
