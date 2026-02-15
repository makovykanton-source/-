# Self-Audit

## High-risk vectors and mitigations
1. Token leakage
   - Mitigation: redaction in logs, short TTL JWT, rotation policy.
2. Privilege escalation via panel
   - Mitigation: guild-level RBAC middleware + Discord membership verification.
3. SQLi
   - Mitigation: parameterized queries only.
4. WS abuse / flood
   - Mitigation: token-auth WS + connection/IP quotas + heartbeat timeout.
5. Queue poisoning
   - Mitigation: signed internal payloads and worker-side schema validation.
