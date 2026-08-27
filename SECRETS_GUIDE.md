# Complete Guide: Finding & Adding Secrets for APU Streamlit Deployment

## 🔐 SECRETS CHECKLIST - Where to Find Them

### 1. **Database Secrets** 🗄️
If you're using a database, find your connection details:

**PostgreSQL/MySQL:**
- Host: `localhost` or your server address
- Port: `5432` (PostgreSQL) or `3306` (MySQL)
- Username: your database user
- Password: your database password
- Database Name: `apu_db`

**MongoDB:**
- Connection String: `mongodb+srv://user:password@cluster.mongodb.net/dbname`
- Find at: MongoDB Atlas → Connect → Connection String

**Supabase:**
- Go to: https://supabase.com → Your Project → Settings → Database
- Copy the connection string

### 2. **API Keys** 🔑
Depending on what APIs you use:

**OpenAI (ChatGPT):**
- Go to: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy it (you can only see it once!)

**Google Cloud APIs:**
- Go to: https://console.cloud.google.com/
- APIs & Services → Credentials → Create Credentials → API Key

**GitHub Personal Access Token:**
- Go to: https://github.com/settings/tokens
- Click "Generate new token"
- Select scopes needed
- Copy the token

**Stripe (Payments):**
- Go to: https://dashboard.stripe.com/apikeys
- Copy your Secret Key (starts with `sk_`)

### 3. **Authentication Secrets** 🔐
Generate these yourself (random strings):

**JWT Secret:**
```
Random string like: "apu_jwt_secret_2024_k8x9p2q4m1n7v3b5"
```

**Session Key:**
```
Random string like: "session_key_abc123xyz789def456ghi"
```

### 4. **Environment Variables** ⚙️
Basic settings:

```
NODE_ENV = "production"
PORT = 8501
DEBUG = false
LOG_LEVEL = "info"
```

## 📝 STEP-BY-STEP: Add Secrets to Streamlit Cloud

### Option A: If You Don't Know What You Need
1. Start simple with just these basic ones:
   ```
   database_url = "sqlite:///apu.db"
   api_key = "demo-key-123456"
   jwt_secret = "your-secret-key-here"
   ```

2. Deploy to Streamlit Cloud
3. Test your app
4. Add more secrets as needed

### Option B: Full Setup Guide

**Step 1:** Generate a random JWT Secret
- Use: https://www.random.org/strings/
- Or in terminal: `python -c "import secrets; print(secrets.token_hex(32))"`

**Step 2:** Get your actual secrets:
- Check your email for API keys
- Check your cloud provider dashboard
- Check your database provider

**Step 3:** Add to Streamlit Cloud:
- Go to: https://share.streamlit.io/
- Click on your app
- Settings ⚙️ → Secrets
- Paste all secrets in TOML format:

```toml
database_url = "postgresql://user:pass@host:5432/db"
api_key = "your-actual-api-key"
openai_api_key = "sk-your-openai-key"
jwt_secret = "randomly-generated-secret"
stripe_key = "sk_test_your-stripe-key"
environment = "production"
```

## 🚨 CRITICAL: DO NOT

- ❌ Commit secrets.toml to GitHub
- ❌ Share your secret keys with anyone
- ❌ Post secrets in public issues
- ❌ Use the same secrets for dev and production

## ✅ DO

- ✅ Use environment variables
- ✅ Keep secrets in Streamlit Cloud Secrets
- ✅ Rotate secrets regularly
- ✅ Use different keys for different environments

## 🆘 If You REALLY Don't Know What You Need

Run with MINIMAL secrets to test:

```toml
environment = "development"
debug = true
```

Then gradually add secrets as you deploy features that need them.

## 📚 Additional Resources

- Streamlit Secrets: https://docs.streamlit.io/streamlit-community-cloud/deploy-your-app/secrets-management
- .env Best Practices: https://12factor.net/config
- API Security: https://cheatsheetseries.owasp.org/

---

**QUESTIONS?** Check what your APU app actually does, and add only the secrets it needs!
