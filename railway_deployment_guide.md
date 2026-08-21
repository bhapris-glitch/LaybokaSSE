# Layboka AI | Production Railway Deployment

To deploy the Layboka AI ecosystem to **Railway.app**, follow these steps:

### 1. Root Configuration Files
Ensure these files are in your root directory:
- **`Procfile`**: Tells Railway how to run your application.
- **`package.json`**: Defines dependencies and start scripts.
- **`server.js`**: The Node.js entry point to serve the dashboards and API.

### 2. Deployment Steps
1.  **Connect GitHub**: Link your repository to a new Railway project.
2.  **Environment Variables**: Add your `STRIPE_SECRET`, `API_BASE`, and `DATABASE_URL` in the Railway "Variables" tab.
3.  **Deploy**: Railway will automatically detect the `Procfile` and start the server.

### 3. Server Logic
The root `server.js` is configured to:
- Serve static assets from `public/`.
- Route `/dashboard/*` to the merchant views.
- Route `/admin/*` to the platform admin views.
- Handle the AI API endpoints defined in `chatbot.js`.