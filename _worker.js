const VALID_API_KEYS = new Set([
    "@bAhroozaa2007",
    "bAhroozaa20245671",
    "bAhroozaa"
]);

const SECURE_TOKEN_VALUE = "hello martin ";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // --- 1. CORE BACKEND API PATH ---
        if (request.method === "POST" && url.pathname === "/api/verify") {
            try {
                const { authKey } = await request.json();
                if (VALID_API_KEYS.has(authKey)) {
                    // Return token inside JSON response
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

        // --- 2. MULTI-LAYER AUTHENTICATION EVALUATION ENGINE ---
        
        // Check A: Read cross-subdomain cookies
        const cookieHeader = request.headers.get("Cookie") || "";
        const hasValidCookie = cookieHeader.includes(`gatekeeper_token=${encodeURIComponent(SECURE_TOKEN_VALUE)}`) || 
                              cookieHeader.includes(`gatekeeper_token=${SECURE_TOKEN_VALUE}`);

        // Check B: Parse explicit URL signatures / security parameters
        const urlParams = new URLSearchParams(url.search);
        
        // Detects if standard token, or long CloudFront-style signatures exist in the URL string
        const hasValidUrlSignature = urlParams.has("Signature") && urlParams.has("Key-Pair-Id");
        const hasStandardToken = urlParams.get('token') === "SecretGatekeeper78!";

        // Unified authentication check
        const isUserAuthenticated = hasValidCookie || hasValidUrlSignature || hasStandardToken;

        // --- 3. SECURITY GATE RULES ---
        
        // Direct private file blocking rule
        if (url.pathname === "/_index.html" || url.pathname.startsWith("/private/")) {
            if (!isUserAuthenticated) {
                return new Response("404 Not Found", { status: 404 });
            }
        }

        // Internal routing for authenticated sessions visiting root
        if (url.pathname === "/" || url.pathname === "/index.html") {
            if (isUserAuthenticated) {
                url.pathname = "/_index.html"; // Swap route internally
                return env.ASSETS.fetch(new Request(url, request));
            }
        }

        // Return default asset execution handler (CSS, Images, public files)
        return env.ASSETS.fetch(request);
    }
};
