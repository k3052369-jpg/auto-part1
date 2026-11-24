# Auto Part

Kurdish right-to-left inventory management site for auto parts.

## Before deploying

1. Create a hosted MySQL database that accepts connections from Vercel.
2. Import database/schema.sql into that database.
3. In Vercel, open this project's Settings > Environment Variables and add the keys from .env.example to Production. Use your hosted database values, a long random JWT_SECRET, and a strong ADMIN_PASSWORD. Do not upload .env or paste secret values into GitHub.
4. Upload or push the contents of this folder to the repository root and let Vercel deploy it. Vercel detects the Express app from server.js; no custom vercel.json is needed.
5. Sign in with the ADMIN_USERNAME and ADMIN_PASSWORD values you configured.

For an existing database, setting ADMIN_USERNAME and ADMIN_PASSWORD updates that account's password during initialization. The old admin / 1234 fallback has been removed.

## Run locally

1. Copy .env.example to .env and enter local database settings.
2. Import database/schema.sql into MySQL.
3. Run npm install, then npm start.
4. Open http://localhost:3000.

The local demo data fallback is enabled only on localhost; it is disabled on deployed websites. Set DB_SSL=true if your hosted MySQL provider requires TLS.