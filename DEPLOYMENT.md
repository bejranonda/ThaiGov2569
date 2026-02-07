# Deployment Guide - SimGov2569

## Environment Variables Setup

### Configuration with Wrangler

This project uses `wrangler.toml` to manage Cloudflare environment variables. The configuration supports multiple environments:

**In `wrangler.toml`:**
```toml
[env.production]
vars = { }
secrets = ["GOOGLE_AI_KEY", "OPENROUTER_API_KEY"]

[env.preview]
vars = { }
secrets = ["GOOGLE_AI_KEY", "OPENROUTER_API_KEY"]
```

### Local Development

1. **Create `.dev.vars` file** (already exists as template, do not commit):
```bash
# .dev.vars - used by `wrangler dev`
D1_DATABASE_ID=your-database-id-here
GOOGLE_AI_KEY=your-google-ai-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

2. **Run local Cloudflare Workers**:
```bash
# Reads from .dev.vars automatically
npx wrangler dev
```

### Cloudflare Production Deployment

Set secrets in Cloudflare using Wrangler CLI:

```bash
# Add secrets to production environment
npx wrangler secret put GOOGLE_AI_KEY --env production
npx wrangler secret put OPENROUTER_API_KEY --env production

# Add secrets to preview environment (optional)
npx wrangler secret put GOOGLE_AI_KEY --env preview
npx wrangler secret put OPENROUTER_API_KEY --env preview
```

Or use Cloudflare Dashboard:
1. Go to: **Cloudflare Dashboard** → **Workers & Pages** → **Your Project** → **Settings** → **Secrets**
2. Add the following secrets:

| Secret | Value | Source |
|--------|-------|--------|
| `GOOGLE_AI_KEY` | Your API key | https://makersuite.google.com/app/apikeys |
| `OPENROUTER_API_KEY` | Your API key | https://openrouter.ai/keys |

**Environment Types:**
- **Production**: Applied to `main` branch deployments
- **Preview**: Applied to PR/staging deployments (optional)

### Getting API Keys

#### Google AI API Key (Gemma 3-27B)
1. Visit: https://makersuite.google.com/app/apikeys
2. Click "Create API Key"
3. Copy and save securely

#### OpenRouter API Key (Backup Model - Llama 3.3-70B)
1. Visit: https://openrouter.ai/keys
2. Create new key
3. Copy and save securely

#### Cloudflare D1 Database ID
```bash
# Already in wrangler.toml
database_id = "af62e7d7-5a46-4ec8-b34d-72cb17993428"
```

## Important Security Notes

⚠️ **NEVER commit `.dev.vars` or `.env` files to GitHub**
- `.gitignore` already prevents this
- API keys are sensitive credentials
- Wrangler secrets are stored securely in Cloudflare, not in code
- Use `npx wrangler secret put` for production secrets

## Local Development Workflow

```bash
# Install dependencies
npm install

# Update .dev.vars with your local API keys (not committed)
# GOOGLE_AI_KEY=...
# OPENROUTER_API_KEY=...

# Run local Vite dev server (frontend only, no backend)
npm run dev

# For full local Cloudflare Workers testing (includes API):
npm run build
npx wrangler dev

# Deploy to production (requires secrets set in Cloudflare)
npm run build
npx wrangler deploy --env production

# Deploy to preview environment
npx wrangler deploy --env preview
```

## Testing AI Backend

The AI backend (`functions/api/chat.js`) tries in this order:
1. **Google AI (Gemma 3-27B)** - Primary
2. **OpenRouter (Llama 3.3-70B)** - Fallback if Google fails

Both require their respective API keys set in environment variables.

## Troubleshooting

### "Google AI key not configured"
**Local development:**
- Check `.dev.vars` file has `GOOGLE_AI_KEY=...`
- Run `npx wrangler dev` (reads from `.dev.vars`)

**Production:**
- Verify secret is set: `npx wrangler secret list --env production`
- Set secret: `npx wrangler secret put GOOGLE_AI_KEY --env production`
- Check Cloudflare Dashboard → Workers → Secrets

### "OpenRouter API error"
- Verify `OPENROUTER_API_KEY` is valid and not expired
- Check API key quota/limit at openrouter.ai
- Ensure secret is set in Cloudflare: `npx wrangler secret list`

### D1 Database Connection Issues
- Verify `D1_DATABASE_ID` in `wrangler.toml` matches your database
- Check database is deployed to Cloudflare D1
- Run migrations via Wrangler CLI: `npx wrangler d1 execute thaigov2569-db --file=schema.sql`

### View All Secrets
```bash
# List production secrets
npx wrangler secret list --env production

# List preview secrets
npx wrangler secret list --env preview
```

### Delete a Secret (if compromised)
```bash
npx wrangler secret delete GOOGLE_AI_KEY --env production
```
