const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock API Endpoints for chatbot.js integration
app.post('/api/chat/executive', (req, res) => {
    res.json({
        success: true,
        executive: {
            name: "Emily",
            personality: "friendly",
            plan: "growth"
        }
    });
});

// Serve Frontend Views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/landing/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/merchant/dashboard/overview.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/admin/overview.html'));
});

// Wildcard for SPA-like behavior if needed
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/landing/index.html'));
});

app.listen(PORT, () => {
    console.log(`Layboka AI running on port ${PORT}`);
});
