# ACC PK Content Engine (apu)

This repository is a local development server and AI-backed content generator for the Anti-Corruption Channel Pakistan (ACC PK). It uses an Express server with Vite middleware and the Google Gemini GenAI client to produce scripts, images, and speech for short investigative videos.

Quick summary

- Primary language: TypeScript
- Dev server: Express + Vite (middleware mode)
- AI integration: @google/genai (Gemini)
- Main server file: `server.ts`

Repository URL

https://github.com/anticorruptionchannel-lgtm/apu

How to run locally

1. Clone the repo:

   git clone https://github.com/anticorruptionchannel-lgtm/apu.git
   cd apu

2. Install dependencies:

   npm install
   # or `yarn` / `pnpm install` if you prefer

3. Create a `.env` file based on the `.env.example` in this repo. The project requires at minimum a Gemini API key to run AI endpoints.

4. Run in development:

   npm run dev

This runs `tsx server.ts` and starts the Vite middleware + Express dev server.

Dev server address

- App base: http://localhost:3000
- Health-check endpoint: http://localhost:3000/api/health

Build & production

1. Build:

   npm run build

2. Start production bundle:

   npm start

This runs `vite build` for front-end assets and bundles the server with `esbuild` to `dist/server.cjs`.

Important environment variables

Required:

- GEMINI_API_KEY=your_gemini_key_here  # used by @google/genai (Gemini)

Optional / feature keys (add if you want these integrations):

- PIXABAY_API_KEY=
- PEXELS_API_KEY=
- UNSPLASH_ACCESS_KEY=
- INVIDEO_API_KEY=
- IMAGE_GEN_API_KEY=
- ELEVENLABS_API_KEY=

Other:

- PORT=3000
- NODE_ENV=development

Note on secrets

Do NOT commit real API keys. The keys for this project are stored in AI Studio secrets per your note — keep them there or in your runtime environment. Use a `.env` only for local testing with safe / temporary keys.

Main API endpoints

- GET /api/health — check server status and which API keys look configured
- POST /api/generate-content — generate video script, scenes, metadata (requires GEMINI_API_KEY)
- POST /api/generate-image — generate background image from a visual prompt
- POST /api/generate-speech — generate TTS audio from text
- GET /api/stock-search?q=...&type=image|video — search free stock media (requires respective API keys)

Curl examples (local)

Replace HOST below with `http://localhost:3000` or your deployed URL.

1) Health

curl -s http://localhost:3000/api/health | jq

2) Generate image (POST)

curl -s -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"visualPrompt":"investigative news background, dramatic lighting, city hall, broken seals"}' | jq

3) Generate content (POST) — requires GEMINI_API_KEY

curl -s -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt":"Allegations of procurement fraud in municipal projects",
    "language":"english",
    "videoStyle":"dramatic"
  }' | jq

4) Generate speech (POST, TTS)

curl -s -X POST http://localhost:3000/api/generate-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test narration for ACC PK."}' | jq

5) Stock search (GET)

curl -s "http://localhost:3000/api/stock-search?q=investigation&type=image" | jq

Notes:
- Use jq to pretty-print JSON. If you don't have jq, omit the trailing | jq.
- If GEMINI_API_KEY is missing and you call endpoints that require it, the server will throw an error — add the key into .env or export it into your runtime.

Notes & troubleshooting

- If you see an error about GEMINI_API_KEY, add it to your environment (or AI Studio secrets) and restart the server.
- The server increases JSON payload limit to 25MB to accept base64 images; uploads may still fail in proxies — check your client.
- The server reads PORT from process.env.PORT with fallback to 3000.

Contributing

If you want, I can add a CONTRIBUTING.md, set up a GitHub Actions workflow for CI (lint/build), or add further docs.

License

No license file is present in the repository. Add an appropriate LICENSE if you want this project to be open source.
