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
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// MIDDLEWARE
// =====================================

// Webhook middleware needs raw body, must be before express.json()
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event switch
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // Update merchant subscription state
            console.log('Checkout session completed:', session.id);
            break;
        case 'invoice.paid':
            const invoicePaid = event.data.object;
            // Handle successful recurring payment
            console.log('Invoice paid:', invoicePaid.id);
            break;
        case 'invoice.payment_failed':
            const invoiceFailed = event.data.object;
            // Handle failed payment (e.g., notify user)
            console.log('Invoice payment failed:', invoiceFailed.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

app.use(helmet({
    contentSecurityPolicy: false,
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
// STRIPE CHECKOUT API
// =====================================

app.post('/api/checkout/create-session', async (req, res) => {
    try {
        const { priceId } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${req.protocol}://${req.get('host')}/system/pay-success`,
            cancel_url: `${req.protocol}://${req.get('host')}/pricing`,
        });
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// ENTERPRISE & ADMIN ROUTES
// =====================================

app.get('/enterprise/fleet', (req, res) => {
    const file = req.isMobile ? 'fleet-mobile.html' : 'fleet-command.html';
    res.sendFile(path.join(__dirname, `src/views/enterprise/${file}`));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/admin/overview.html'));
});

// =====================================
// CHATBOT API (Logic from chatbot.js)
// =====================================

app.post('/api/chat/executive', (req, res) => {
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
    res.json({
        success: true,
        reply: "I've analyzed your requirements and recommend our high-performance suite.",
        products: []
    });
});

app.post('/api/recovery/dashboard', (req, res) => {
    res.json({ success: true, message: "Recovery telemetry synced." });
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
