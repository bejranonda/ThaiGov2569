# Deployment Guide - SimGov2569

## Environment Variables Setup

### Local Development

1. **Create `.env` file** (already exists, do not commit):
```bash
# .env
D1_DATABASE_ID=your-database-id-here
GOOGLE_AI_KEY=your-google-ai-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

2. **For local Cloudflare Workers testing** (`.dev.vars`):
```bash
# .dev.vars - for local `wrangler dev`
D1_DATABASE_ID=your-database-id-here
GOOGLE_AI_KEY=your-google-ai-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### Cloudflare Production Deployment

Set environment variables in Cloudflare Pages/Workers dashboard:

1. Go to: **Cloudflare Dashboard** → **Workers & Pages** → **Your Project** → **Settings** → **Environment variables**

2. Add the following variables:

| Variable | Value | Source |
|----------|-------|--------|
| `GOOGLE_AI_KEY` | Your API key | https://makersuite.google.com/app/apikeys |
| `OPENROUTER_API_KEY` | Your API key | https://openrouter.ai/keys |
| `D1_DATABASE_ID` | Database ID | Cloudflare D1 |

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

⚠️ **NEVER commit `.env` or `.dev.vars` files to GitHub**
- `.gitignore` already prevents this
- API keys are sensitive credentials
- Always use environment variables in production

## Local Development Workflow

```bash
# Install dependencies
npm install

# Run local Vite dev server (frontend only)
npm run dev

# For full local Cloudflare Workers testing:
npm run build
npx wrangler dev

# Build for production
npm run build
```

## Testing AI Backend

The AI backend (`functions/api/chat.js`) tries in this order:
1. **Google AI (Gemma 3-27B)** - Primary
2. **OpenRouter (Llama 3.3-70B)** - Fallback if Google fails

Both require their respective API keys set in environment variables.

## Troubleshooting

### "Google AI key not configured"
- Check environment variables are set in Cloudflare dashboard
- Verify `GOOGLE_AI_KEY` is spelled correctly
- Test locally with `.dev.vars` first

### "OpenRouter API error"
- Verify `OPENROUTER_API_KEY` is valid
- Check API key quota/limit at openrouter.ai

### D1 Database Connection Issues
- Verify `D1_DATABASE_ID` matches your database
- Check database is deployed to Cloudflare D1
- Run migrations via Wrangler CLI
