//<html><head></head><body>/**
 /* server.js
 * Layboka AI | Production SaaS Entry Point
 * Handles routing for Landing, Dashboard, Admin, and Enterprise views.
 * Optimized for Railway.app deployment with device-aware routing.
 */

const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// Webhook middleware needs raw body, must be before express.json()
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) =&gt; {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
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

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Device Detection Middleware
 * Simple check to serve mobile vs desktop views where applicable.
 */
const detectDevice = (req, res, next) =&gt; {
    const ua = req.headers['user-agent'] || '';
    req.isMobile = /mobile/i.test(ua);
    next();
};

app.use(detectDevice);

// =====================================
// PUBLIC ROUTES (Landing &amp; Pricing)
// =====================================

app.get('/', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'public/mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/landing/index.html'));
});

app.get('/pricing', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/billing/pricing-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/billing/pricing.html'));
});

// =====================================
// MERCHANT DASHBOARD ROUTES
// =====================================

app.get('/dashboard', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/merchant/dashboard/mobile-overview.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/merchant/dashboard/overview.html'));
});

app.get('/dashboard/analytics', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/merchant/dashboard/analytics-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/merchant/dashboard/analytics.html'));
});

app.get('/dashboard/config-ai', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/merchant/settings/config-ai-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/merchant/settings/config-ai.html'));
});

app.get('/dashboard/webhooks', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/merchant/settings/webhooks-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/merchant/settings/webhooks.html'));
});

app.get('/dashboard/api-docs', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/merchant/settings/api-docs-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/merchant/settings/api-docs.html'));
});

// =====================================
// BILLING &amp; RECHARGE ROUTES
// =====================================

app.get('/billing/recharge', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/merchant/billing/recharge-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/merchant/billing/recharge.html'));
});

app.get('/billing/invoice', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/merchant/billing/invoice-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/merchant/billing/invoice.html'));
});

// =====================================
// STRIPE CHECKOUT API
// =====================================

app.post('/api/checkout/create-session', async (req, res) =&gt; {
    try {
        const { priceId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.protocol}://${req.get('host')}/payment-success.html`,
            cancel_url: `${req.protocol}://${req.get('host')}/pricing`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// ENTERPRISE &amp; ADMIN ROUTES
// =====================================

app.get('/enterprise/fleet', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/enterprise/fleet-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/enterprise/fleet-command.html'));
});

app.get('/admin', (req, res) =&gt; {
    res.sendFile(path.join(__dirname, 'src/views/admin/overview.html'));
});

// =====================================
// SYSTEM &amp; LOCK SCREENS
// =====================================

app.get('/system/trial-lock', (req, res) =&gt; {
    if (req.isMobile) {
        return res.sendFile(path.join(__dirname, 'src/views/system/trial-lock-mobile.html'));
    }
    res.sendFile(path.join(__dirname, 'src/views/system/trial-lock.html'));
});

// =====================================
// CHATBOT API (Integration with chatbot.js)
// =====================================

app.post('/api/chat/executive', (req, res) =&gt; {
    res.json({
        success: true,
        executive: {
            name: "Emily",
            personality: "friendly",
            plan: "growth"
        }
    });
});

app.post('/api/chat/message', (req, res) =&gt; {
    // Core AI Response Logic placeholder
    res.json({
        success: true,
        reply: "Hello! I'm your Layboka AI assistant. How can I help you today?",
        products: []
    });
});

app.post('/api/recovery/dashboard', (req, res) =&gt; {
    res.json({ success: true, message: "Analytics synced." });
});

// =====================================
// 404 &amp; FALLBACK
// =====================================

app.get('*', (req, res) =&gt; {
    res.sendFile(path.join(__dirname, 'src/views/landing/index.html'));
});

app.listen(PORT, () =&gt; {
    console.log(`Layboka AI Production Server running on port ${PORT}`);
});</body></html>
