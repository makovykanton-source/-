# Threat Model

- Attack surfaces: OAuth callback, REST API, WS stream, bot token, queue poisoning.
- Controls: strict token TTL, signature verification, Redis ACL, TLS, origin pinning.
- Blast radius reduction: role-scoped actions, per-guild feature toggles, emergency lockdown.
