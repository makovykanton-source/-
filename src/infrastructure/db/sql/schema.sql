CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guild_user_roles (
  guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_permissions TEXT[] NOT NULL DEFAULT '{}',
  is_whitelisted BOOLEAN NOT NULL DEFAULT false,
  trust_score INT NOT NULL DEFAULT 100,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS guild_security_configs (
  guild_id TEXT PRIMARY KEY REFERENCES guilds(id) ON DELETE CASCADE,
  anti_nuke_enabled BOOLEAN NOT NULL DEFAULT true,
  anti_raid_enabled BOOLEAN NOT NULL DEFAULT true,
  anti_spam_enabled BOOLEAN NOT NULL DEFAULT true,
  anti_link_enabled BOOLEAN NOT NULL DEFAULT true,
  anti_webhook_enabled BOOLEAN NOT NULL DEFAULT true,
  role_escalation_protection BOOLEAN NOT NULL DEFAULT true,
  permission_integrity_monitor BOOLEAN NOT NULL DEFAULT true,
  auto_lockdown_enabled BOOLEAN NOT NULL DEFAULT true,
  raid_join_threshold INT NOT NULL DEFAULT 10,
  message_rate_per_10s INT NOT NULL DEFAULT 7,
  webhook_create_threshold INT NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY,
  guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  actor_id TEXT,
  target_id TEXT,
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT false,
  summary TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY,
  guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  encrypted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_guild_created ON security_events (guild_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_threat_type ON security_events (threat_type);
CREATE INDEX IF NOT EXISTS idx_audit_guild_created ON audit_logs (guild_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roles_trust_score ON guild_user_roles (guild_id, trust_score);
CREATE INDEX IF NOT EXISTS idx_backups_expiry ON backups (expires_at);
