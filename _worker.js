// 1. AUTHORIZED ACCESS PASSWORDS
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

        // --- ROUTE 1: THE REVENUE VERIFICATION ENDPOINT (/api/verify) ---
        if (request.method === "POST" && url.pathname === "/api/verify") {
            try {
                const { authKey } = await request.json();

                if (!authKey) {
                    return new Response(JSON.stringify({ valid: false, error: "Missing parameter." }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                if (VALID_API_KEYS.has(authKey)) {
                    return new Response(JSON.stringify({ valid: true, sessionToken: SECURE_TOKEN_VALUE }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                return new Response(JSON.stringify({ valid: false, error: "Invalid credentials." }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" }
                });
            } catch (err) {
                return new Response(JSON.stringify({ valid: false, error: "Bad Request" }), { status: 400 });
            }
        }

        // --- ROUTE 2: CHECK EXISTING SESSION STAMPS ---
        const cookieHeader = request.headers.get("Cookie") || "";
        const isSessionValid = cookieHeader.includes(`gatekeeper_token=${encodeURIComponent(SECURE_TOKEN_VALUE)}`) || 
                              cookieHeader.includes(`gatekeeper_token=${SECURE_TOKEN_VALUE}`);

        // If authenticated, internally proxy and return the protected asset
        if (isSessionValid) {
            // Serve the real secure portfolio page instead of the entry lock wall
            url.pathname = "/_index.html"; 
            return env.ASSETS.fetch(new Request(url, request));
        }

        // --- ROUTE 3: FALLBACK TO LANDING ENTRY PAGE ---
        // If a user goes to any inner files directly without unlocking, force them onto the vault interface
        if (url.pathname !== "/" && url.pathname !== "/index.html" && !url.pathname.includes(".")) {
            url.pathname = "/index.html";
            return env.ASSETS.fetch(new Request(url, request));
        }

        // Serve default root assets (index.html login wall UI)
        return env.ASSETS.fetch(request);
    }
};
