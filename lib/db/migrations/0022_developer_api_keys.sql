CREATE TABLE IF NOT EXISTS "developer_api_keys" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "token_hash" text NOT NULL,
  "token_prefix" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  "revoked_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "developer_api_keys_token_hash_idx"
  ON "developer_api_keys" ("token_hash");

CREATE INDEX IF NOT EXISTS "developer_api_keys_user_id_idx"
  ON "developer_api_keys" ("user_id");
