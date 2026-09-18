// 1. AUTHORIZED SIGNATURE ENGINES
const VALID_API_KEYS = new Set([
    "@bAhroozaa2007",
    "bAhroozaa20245671",
    "bAhroozaa"
]);

// Expected cookie signature value
const SECURE_TOKEN_VALUE = "hello martin ";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // --- 1. HANDLING THE API ROUTE (/api/verify) ---
        if (request.method === "POST" && url.pathname === "/api/verify") {
            try {
                const { authKey } = await request.json();
                if (VALID_API_KEYS.has(authKey)) {
                    return new Response(JSON.stringify({ valid: true, sessionToken: SECURE_TOKEN_VALUE }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                return new Response(JSON.stringify({ valid: false, error: "Invalid credentials." }), { status: 401 });
            } catch (err) {
                return new Response(JSON.stringify({ valid: false, error: "Bad Request" }), { status: 400 });
            }
        }

        // --- 2. AUTHENTICATION EVALUATION ENGINE ---
        // Grab standard browser cookie headers
        const cookieHeader = request.headers.get("Cookie") || "";
        const hasValidCookie = cookieHeader.includes(`gatekeeper_token=${encodeURIComponent(SECURE_TOKEN_VALUE)}`) || 
                              cookieHeader.includes(`gatekeeper_token=${SECURE_TOKEN_VALUE}`);

        // Alternative URL Token check (e.g. ?token=SecretGatekeeper78!)
        const urlParams = new URLSearchParams(url.search);
        const hasValidUrlToken = urlParams.get('token') === "SecretGatekeeper78!";

        const isUserAuthenticated = hasValidCookie || hasValidUrlToken;

        // --- 3. FIREWALL DIRECTORIES AND PRIVATE ASSETS ---
        // STRICT BLOCK: If an unauthenticated user tries to request private files directly, give them a dead 404!
        if (url.pathname === "/_index.html" || url.pathname.startsWith("/private-dir/")) {
            if (!isUserAuthenticated) {
                return new Response("404 Not Found", { status: 404 });
            }
        }

        // --- 4. SECURE PROXY RESOLUTION ---
        // If a valid cookie user visits your root domain (/), deliver your private portfolio internally
        if (url.pathname === "/" || url.pathname === "/index.html") {
            if (isUserAuthenticated) {
                url.pathname = "/_index.html"; // Swaps code internally; URL address bar does not change!
                return env.ASSETS.fetch(new Request(url, request));
            }
        }

        // Serve public public static assets (images, style.css, login index.html page)
        return env.ASSETS.fetch(request);
    }
};
