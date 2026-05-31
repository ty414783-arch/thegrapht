# TheGraphT Local White-Hat Audit Harness

This harness runs bounded, local-only security checks against TheGraphT. It creates disposable audit users and messages, avoids destructive actions, and does not target public domains.

## Run

From the repository root:

```bash
./security-audit/local/run.sh
```

If host Node.js is unavailable, the wrapper streams the runner into `thegrapht_frontend_app`, which already has Node.js, and writes the report back to:

```text
security-audit/local/report.md
```

Direct Node.js run is also supported:

```bash
node security-audit/local/run-local-audit.mjs
```

## Environment Overrides

```bash
AUDIT_BACKEND_BASE=http://127.0.0.1:3001 \
AUDIT_FRONTEND_BASE=http://127.0.0.1:5173 \
AUDIT_MTPROTO_BASE=http://127.0.0.1:3100 \
node security-audit/local/run-local-audit.mjs
```

## Safety Limits

- No public-domain testing.
- No destructive database cleanup outside disposable audit records.
- No concurrent flood tests.
- Bounded rate-limit probes only.
- One controlled oversized JSON request.
- Upload tests use tiny in-memory payloads.
