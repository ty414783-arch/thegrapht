# TheGraphT Security Audit

## Scope

Code-level audit of the current backend/web architecture with focus on:
- user enumeration
- auth/session handling
- message/media authorization
- websocket event exposure
- plaintext leakage through DTOs, previews and logs

## Threat Model

- Authenticated external user attempting enumeration or unauthorized access
- Passive network observer
- Compromised backend or database
- Malicious client crafting requests outside the shipped UI

## Findings Before Hardening

1. Messages were server-readable plaintext.
   `messages.body` and reply preview bodies were stored and returned in plaintext.

2. User search supported broad partial enumeration.
   `/api/v1/users/search` used `%query%` matching, making username harvesting easier.

3. Search produced no audit trail.
   There was no structured log for repeated user discovery attempts.

4. DTOs and dialog previews were plaintext-oriented only.
   There was no transport shape for ciphertext envelopes or secure dialog metadata.

5. Secret-chat transport was not actually implemented.
   `apps/mtproto` exposed only a bootstrap/foundation service and could not be used as a secure messaging backend.

## Remediation Added In This Change

- Hardened user search to prefix matching only.
- Added minimum query length gate via config with empty-result behavior for short queries.
- Added structured audit logging for search requests.
- Added feature-flagged secure direct chat foundation in backend:
  - user key bundles
  - secure direct dialog bootstrap
  - ciphertext message envelopes
  - secure dialog/message DTO fields
- Prevented plaintext preview generation for secure dialogs by returning generic preview text.

## Remaining Gaps

- Web client-side key management and local decrypt pipeline still need to be implemented.
- Android remains legacy/plaintext and should not silently open secure chats as plaintext.
- Media E2E is not part of v1; secure chats currently reject media upload.
- Notifications/search UX for secure chats still need full client-side support.
