const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your GitHub Pages domain to talk to this API
app.use(express.json());

// 1. CHOOSE YOUR INFINITE PASSWORDS HERE: Define your valid access API keys
const VALID_API_KEYS = new Set([
    "@bAhroozaa2007",
    "bAhroozaa20245671",
    "bAhroozaa"
]);

// 2. THE API ENDPOINT
app.post('/api/verify', (req, res) => {
    const { authKey } = req.body;

    if (!authKey) {
        return res.status(400).json({ valid: false, error: "Missing authentication string." });
    }

    // Secure checking mechanism against the set array
    if (VALID_API_KEYS.has(authKey)) {
        return res.status(200).json({ 
            valid: true, 
            sessionToken:"hello martin ": // Returned to unlock frontend
        });
    }

    // Stealth protection logic response
    return res.status(401).json({ valid: false, error: "Invalid credentials." });
});

// Start the server endpoint framework
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure API active on port ${PORT}`));
