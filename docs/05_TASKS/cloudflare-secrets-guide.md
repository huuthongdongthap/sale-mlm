# Cloudflare Deploy Secrets Guide

How to configure GitHub Actions secrets for CI/CD deployment to Cloudflare.

## Required Secrets

| Secret | Purpose | Where Used |
|--------|---------|------------|
| `CF_API_TOKEN` | Cloudflare API token for Workers, Pages, D1, KV | `wrangler deploy`, `wrangler pages deploy` |
| `CF_ACCOUNT_ID` | Cloudflare account identifier | `wrangler deploy`, `wrangler pages deploy` |
| `JWT_SECRET` | JWT signing key (32-byte hex) | Backend authentication |
| `PASSWORD_SALT` | PBKDF2 salt for password hashing (16-byte hex) | User password storage |

## How to Generate a Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use the **"Edit Cloudflare Workers"** template (or create custom)
4. Required permissions:
   - **Workers Scripts** — Edit
   - **D1** — Edit
   - **KV Storage** — Edit
   - **Cloudflare Pages** — Edit
5. Under **"Account Resources"**, select your account
6. Under **"Zone Resources"**, select "All zones" or the specific zone
7. Click **"Continue to summary"** then **"Create Token"**
8. Copy the token immediately (it is shown only once)

### Token Scopes Summary

```
Account:   [Account ID from below]
Zones:     All zones (or specific domain)
Permissions:
  Workers Scripts  → Edit
  D1               → Edit
  KV Storage       → Edit
  Cloudflare Pages → Edit
```

## How to Find Your Account ID

1. Go to https://dash.cloudflare.com/
2. Select any domain in your account
3. Scroll down in the **Overview** page to the right sidebar
4. Find **"Account ID"** — it is a 32-character hex string
5. Alternatively: https://dash.cloudflare.com → the URL contains your account ID

## How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **"New repository secret"**
4. Add each secret:

```
Name: CF_API_TOKEN
Value: <your Cloudflare API token>

Name: CF_ACCOUNT_ID
Value: <your 32-char account ID>

Name: JWT_SECRET
Value: <output of: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

Name: PASSWORD_SALT
Value: <output of: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))">
```

5. Click **"Add secret"** for each one

## Generate Secure Values Locally

```bash
# JWT_SECRET (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PASSWORD_SALT (16 bytes)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# ENCRYPTION_KEY (32 bytes, for PII encryption)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Verification

After adding secrets, verify the CI pipeline detects them. Push to `main` and check the **"Validate Cloudflare secrets"** step in the deploy job:

```bash
# Check from GitHub CLI (optional)
gh secret list --repo <owner>/<repo>
```

Expected output in CI logs:
```
--- Cloudflare Secrets Check ---
✅ CF_API_TOKEN is configured
✅ CF_ACCOUNT_ID is configured
--------------------------------
```

If secrets are missing, the step prints warnings and skips deploy steps.

## Environment Configuration (wrangler.toml)

The `wrangler.toml` at project root defines staging and production environments:

```toml
[env.staging]
name = "hive-warfare-os-staging"
[env.staging.vars]
NODE_ENV = "staging"

[env.production]
name = "hive-warfare-os"
[env.production.vars]
NODE_ENV = "production"
```

Deploy commands:
```bash
# Staging
npx wrangler deploy --env staging

# Production
npx wrangler deploy --env production
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Deploy steps silently skip | Check secrets are set; look for validation step warnings |
| `wrangler: command not found` | CI runs `npx wrangler` — ensure `npm ci` completed |
| `401 Unauthorized` | Token expired or missing required scopes — regenerate |
| `403 Forbidden` | Token lacks permissions — add Edit scopes for Workers/D1/KV/Pages |
| `Account not found` | Wrong `CF_ACCOUNT_ID` — verify at dash.cloudflare.com |
