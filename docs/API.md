# API Spec (excerpt)

## Auth
- `GET /api/v1/auth/discord/login`
- `GET /api/v1/auth/discord/callback`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

## Security config
- `GET /api/v1/guilds/:guildId/security/config`
- `PUT /api/v1/guilds/:guildId/security/config`

## Logs
- `GET /api/v1/guilds/:guildId/events`
- `GET /api/v1/guilds/:guildId/audit`

## WebSocket
- `wss://api.example.com/ws?token=...`
- events: `threat.log`, `threat.metric`, `module.state.changed`
