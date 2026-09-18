const express = require('express');
const cors = require('cors');
const app = express();

// 1. ALLOW CLOUDFLARE DOMAIN TO COMMUNICATE CLEARLY
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors()); 
app.use(express.json());

// 2. VALID ACCESS CODES
const VALID_API_KEYS = new Set([
    "@bAhroozaa2007",
    "bAhroozaa20245671",
    "bAhroozaa"
]);

// 3. AUTHENTICATION ROUTE
app.post('/api/verify', (req, res) => {
    const { authKey } = req.body;

    if (!authKey) {
        return res.status(400).json({ valid: false, error: "Missing authentication token string." });
    }

    if (VALID_API_KEYS.has(authKey)) {
        return res.status(200).json({ 
            valid: true, 
            sessionToken: "hello martin " 
        });
    }

    return res.status(401).json({ valid: false, error: "Invalid credentials." });
});

// Start listening for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure API active on port ${PORT}`));
