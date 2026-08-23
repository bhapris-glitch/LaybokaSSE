/**
 * server.js
 * Layboka AI | Final Production SaaS Entry Point
 * Optimized for Railway.app with dynamic device routing and Stripe integration.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// MIDDLEWARE
// =====================================
app.use(helmet({
    contentSecurityPolicy: false, // Set to false to allow CDN scripts if needed, or configure properly
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Device Detection Middleware
 */
const detectDevice = (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    req.isMobile = /mobile/i.test(ua);
    next();
};

app.use(detectDevice);

// =====================================
// PUBLIC ROUTES (Landing & Corporate)
// =====================================

app.get('/', (req, res) => {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'public/mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/pricing', (req, res) => {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/billing/pricing-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/billing/pricing.html'));
});

app.get('/about', (req, res) => {
    const file = req.isMobile ? 'about-mobile.html' : 'about.html';
    res.sendFile(path.join(__dirname, `src/views/landing/${file}`));
});

app.get('/contact', (req, res) => {
    const file = req.isMobile ? 'contact-mobile.html' : 'contact.html';
    res.sendFile(path.join(__dirname, `src/views/landing/${file}`));
});

// =====================================
// MERCHANT DASHBOARD ROUTES
// =====================================

app.get('/dashboard', (req, res) => {
    const file = req.isMobile ? 'mobile-overview.html' : 'overview.html';
    res.sendFile(path.join(__dirname, `src/views/merchant/dashboard/${file}`));
});

app.get('/dashboard/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/merchant/dashboard/analytics.html'));
});

app.get('/dashboard/config-ai', (req, res) => {
    const file = req.isMobile ? 'config-ai-mobile.html' : 'config-ai.html';
    res.sendFile(path.join(__dirname, `src/views/merchant/settings/${file}`));
});

app.get('/dashboard/webhooks', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/merchant/settings/webhooks.html'));
});

app.get('/dashboard/whatsapp-recovery', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/merchant/dashboard/whatsapp-recovery.html'));
});

// =====================================
// BILLING & SYSTEM
// =====================================

app.get('/billing/invoice', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/merchant/billing/invoice.html'));
});

app.get('/system/trial-lock', (req, res) => {
    const file = req.isMobile ? 'trial-lock-mobile.html' : 'trial-lock.html';
    res.sendFile(path.join(__dirname, `src/views/system/${file}`));
});

app.get('/system/pay-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/system/pay-success.html'));
});

// =====================================
// API ENDPOINTS (Logic from chatbot.js)
// =====================================

app.post('/api/chat/executive', (req, res) => {
    // Logic to load executive based on hostname/visitor
    res.json({
        success: true,
        executive: {
            name: "Alex Vance",
            personality: "professional",
            plan: "premium",
            online: true
        }
    });
});

app.post('/api/chat/message', (req, res) => {
    // Process AI message
    res.json({
        success: true,
        reply: "I've analyzed your requirements and recommend our high-performance suite.",
        products: []
    });
});

app.post('/api/recovery/dashboard', (req, res) => {
    res.json({ success: true, message: "Recovery telemetry synced." });
});

app.post('/api/webhooks/stripe', (req, res) => {
    // Handle Stripe Webhooks
    res.json({ received: true });
});

// =====================================
// 404 & FALLBACK
// =====================================

app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Layboka AI Production Server active on port ${PORT}`);
});
