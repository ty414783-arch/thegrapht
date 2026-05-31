# TheGraphT Local White-Hat Security Audit Report

Started: 2026-05-21T14:38:25.636Z
Finished: 2026-05-21T14:38:27.351Z

## Scope

- Local-only audit.
- Backend: http://thegrapht_backend_1:3000
- Frontend: http://localhost:5173
- MTProto: http://thegrapht_mtproto_1:3100
- Public domains were not targeted.

## Summary

- PASS: 21
- WARN: 0
- FAIL: 2
- INFO: 0

## Findings

### [FAIL] frontend: CSP blocks inline scripts and framing

Severity: high

Evidence:

```text
unsafe-inline script allowed: default-src 'self'; img-src 'self' data: blob: https://cdn.thegrapht.su; media-src 'self' blob: https://cdn.thegrapht.su; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ws: wss: https://cdn.thegrapht.su http://localhost; frame-ancestors 'none'; base-uri 'none'; object-src 'none'
```

### [FAIL] frontend: client script contains escaping helpers around rendered user data

Severity: medium

Evidence:

```text
external client script tag not found
```

### [PASS] access-control: non-member cannot delete another user's saved message

Severity: high

Evidence:

```text
delete status=404 body={"error":"Сообщение не найдено."}
```

### [PASS] access-control: non-member cannot read another user's media by message id

Severity: high

Evidence:

```text
HTTP 404
```

Reproduce:

```bash
curl -4 -i -s -X GET -H "Cookie: thegrapht_session=..." "http://thegrapht_backend_1:3000/v/bXNnXzQ3NGM0YzZjLTUyY2UtNDViZC04ZDY5LTY3M2M2MzM5ZDE4MA"
```

### [PASS] auth: register disposable users with HttpOnly session cookies

Severity: info

Evidence:

```text
a=u_7f5be129-e715-4258-bc52-433670bead06 @auditaimgsrc9fef35
b=u_af2caa75-aedf-4ef9-956e-7aecacb8d697 @auditbimgsrc3b79a7
c=u_68b7b612-3590-4893-ab9f-118c58d20ca4 @auditcimgsrca4be52
cookies=thegrapht_session=..., thegrapht_session=..., thegrapht_session=...
set-cookie-a=thegrapht_session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1XzdmNWJlMTI5LWU3MTUtNDI1OC1iYzUyLTQzMzY3MGJlYWQwNiIsInNpZCI6InNlc3NfYmU3MTc4MTgtMzllOC00MzFmLThhMmUtMjBlZjAwYjdhYTNhIiwic3QiOiJzdGtfYmU2MzIwYmYxYjg5Y2ZmOWJiMWE0NDYwYjVhNGFmMmUzNGI3ZTA1M2Q3ZTUwYTA2IiwiaWF0IjoxNzc5Mzc0MzA1LCJleHAiOjE3ODE5NjYzMDUsImF1ZCI6InRoZWdyYXBodC13ZWIiLCJpc3MiOiJ0aGVncmFwaHQifQ.b6cAgjJaERjBrCYAIjkeAy2a3pLSDKToknXbQZKxy9M; Max-Age=2592000; Path=/; Domain=.thegrapht.su; HttpOnly; SameSite=Lax; Priority=High
```

Reproduce:

```bash
curl -4 -i -s -X POST -H "Content-Type: application/json" -H "Origin: http://localhost:5173" --data "{\"name\":\"Audit user\",\"email\":\"audit_unique@example.test\",\"password\":\"AuditPass_unique!\"}" "http://thegrapht_backend_1:3000/api/v1/auth/register"
```

### [PASS] auth: wrong password login is rejected

Severity: medium

Evidence:

```text
HTTP 401 {"error":"Invalid email or password."}
```

Reproduce:

```bash
curl -4 -i -s -X POST -H "Content-Type: application/json" -H "Origin: http://localhost:5173" --data "{\"email\":\"audit_1779374305800_01421d_a@example.test\",\"password\":\"wrong_password\"}" "http://thegrapht_backend_1:3000/api/v1/auth/login"
```

### [PASS] auth: malformed JSON is rejected

Severity: medium

Evidence:

```text
HTTP 400 {"error":"Invalid JSON body"}
```

Reproduce:

```bash
curl -4 -i -s -X POST -H "Content-Type: application/json" -H "Origin: http://localhost:5173" --data "{not-json" "http://thegrapht_backend_1:3000/api/v1/auth/register"
```

### [PASS] auth: small bounded login burst hits auth rate limit

Severity: medium

Evidence:

```text
rate limited at attempt 5/12
```

### [PASS] auth: cookie-auth mutating request without Origin is rejected

Severity: high

Evidence:

```text
HTTP 403 {"error":"Origin is not allowed."}
```

Reproduce:

```bash
curl -4 -i -s -X POST -H "Content-Type: application/json" -H "Cookie: thegrapht_session=..." --data "{}" "http://thegrapht_backend_1:3000/api/v1/auth/logout"
```

### [PASS] dialogs: user search blocks short enumeration and allows prefix search

Severity: medium

Evidence:

```text
short={"users":[]}
prefix={"users":[{"id":"u_e8a51d55-5359-45ea-989f-b21dfce5513b","name":"Audit a <img src=x onerror=alert(1)>","username":"auditaimgsrc6d83a3"},{"id":"u_ba0fd940-1121-42ff-b35b-e9bc5e5f02c8","name":"Audit a <img src=x onerror=alert(1)>","username":"auditaimgsrc8d80c1"},{"id":"u_9d7d3162-9901-46e9-80ee-b76161bc5e9c","name":"Audit a <img src=x onerror=alert(1)>","username":"auditaimgsrc913ebf"},{"id":"u_0fc9b27e-4219-4e21-8a05-f6e209730d6c","name":"Audit a <img src=x onerror=alert(1)>","username":"auditaimgsrccd6560"},{"id":"u_0aa903a3-7b18-4dfa-a957-01c2a5e2d995","name":"Audit a <img src=x onerror=alert(1)>","username":"auditaimgsrcecc519"},{"id":"u_7aea1304-3cea-479b-be91-13d6a08674ed","name":"Audit a <img src=x onerror=alert(1)>","username":"auditaimgsrcf3b52c"},{"id":"u_1a1baece-cd74-484c-a749-25f79d193e93","name":"Audit b <img src=x onerror=alert(1)>","username":"auditbimgsrc0a74eb"},{"id":"u_af2caa75-aedf-4ef9-956e-7aecacb8d697","name":"Audit b <img src=x onerror=alert(1)>","username":"auditbimgsrc3b79a7"},{"id":"u_0c843b68-a977-40a4-b902-df14fc91de7a","name":"Audit b <img src=x onerror=alert(1)>","username":"auditbimgsrc409771"},{"id":"u_ea56a706-ae00-4693-a555-33643ef6af71","name":"Audit b <img src=x onerror=alert(1)>","username":"auditbimgsrc68c2b4"},{"id":"u_a8afbd3c-42d1-472b-b906-640183daac14","name":"Audit b <img src=x onerror=alert(1)>","username":"auditbimgsrcb04f3b"},{"id":"u_1db41dea-ee4e-4fad-bacb-efa606268bce","name":"Audit c <img src=x onerror=alert(1)>","username":"auditcimgsrc6e5e47"}]}
suffix={"users":[]}
```

### [PASS] dialogs: create direct dialog and exchange XSS-looking message safely as data

Severity: medium

Evidence:

```text
dialog=dlg_direct_u_7f5be129-e715-4258-bc52-433670bead06_u_af2caa75-aedf-4ef9-956e-7aecacb8d697 publicId=-1004472717
message=msg_074ce4ee-3078-46a5-91e8-9b9cd9d633e3
```

### [PASS] e2e: secure chat endpoints are disabled or require proper bootstrap

Severity: medium

Evidence:

```text
HTTP 400 {"error":"Explicit secret chat action is required."}
```

### [PASS] input: oversized JSON body is rejected or connection is closed

Severity: medium

Evidence:

```text
request closed/rejected: fetch failed
```

### [PASS] media: member can upload a valid tiny PNG

Severity: medium

Evidence:

```text
message=msg_474c4c6c-52ce-45bd-8d69-673c6339d180
mediaUrl=https://cdn.thegrapht.su/v/bXNnXzQ3NGM0YzZjLTUyY2UtNDViZC04ZDY5LTY3M2M2MzM5ZDE4MA
```

### [PASS] media: text/plain upload is rejected

Severity: medium

Evidence:

```text
HTTP 400 {"error":"Only image or audio files are supported."}
```

### [PASS] media: fake image MIME with non-image bytes is not accepted

Severity: medium

Evidence:

```text
HTTP 400 {"error":"File content does not match declared image type."}
```

### [PASS] mtproto: MTProto health/capabilities advertise foundation-only status

Severity: medium

Evidence:

```text
health={"service":"mtproto","status":"transport-foundation","productionReady":false,"mtprotoCompatibleTransport":false,"activeSessions":0,"transports":["http-binary-frame","websocket-planned","abridged-planned"]}
capabilities={"service":"TheGraphT MTProto","capabilities":{"activeTransports":["http-binary-frame","websocket-planned","abridged-planned"],"frameContentType":"application/x-thegrapht-mtproto-frame","protocolVersion":1,"maxFrameBytes":1048576,"maxJsonBodyBytes":65536,"sessionTtlMs":1200000,"challengeTtlMs":90000,"requestBodyTimeoutMs":25000,"keepAliveTimeoutMs":65000,"productionReady":false,"mtprotoCompatibleTransport":false,"sessionChallengeFlow":true,"replayGuard":"strict-monotonic-sequence","encryptionTrack":"mtproto-2-foundation"}}
```

Reproduce:

```bash
curl -4 -i -s -X GET "http://thegrapht_mtproto_1:3100/health"
curl -4 -i -s -X GET "http://thegrapht_mtproto_1:3100/api/v1/capabilities"
```

### [PASS] mtproto: evil origin does not receive CORS allow-origin

Severity: medium

Evidence:

```text
HTTP 403
Access-Control-Allow-Origin=<absent>
```

### [PASS] recon: resolve local backend/frontend/mtproto endpoints

Severity: info

Evidence:

```text
backend=http://thegrapht_backend_1:3000
frontend=http://localhost:5173
mtproto=http://thegrapht_mtproto_1:3100
```

### [PASS] recon: backend health is ok or degraded with explicit checks

Severity: info

Evidence:

```text
{"service":"backend","status":"ok","checks":{"postgres":true,"redis":null,"infraChecksEnabled":false}}
```

Reproduce:

```bash
curl -4 -i -s -X GET "http://thegrapht_backend_1:3000/health"
```

### [PASS] websocket: unauthenticated websocket upgrade is rejected

Severity: high

Evidence:

```text
HTTP/1.1 401 Unauthorized


```

### [PASS] websocket: evil-origin websocket upgrade is rejected before auth

Severity: high

Evidence:

```text
HTTP/1.1 403 Forbidden


```

### [PASS] websocket: forged presence/typing payloads for unauthorized dialogs do not produce events

Severity: medium

Evidence:

```text
authenticated ws accepted, unauthorized forged payloads sent, bytes observed after send=86
```

