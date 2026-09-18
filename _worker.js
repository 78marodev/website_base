export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. PUBLIC LINK LOGINS: Allow access to login forms
    if (path === "/login" || path === "/login.html") {
      return env.ASSETS.fetch(request);
    }

    // 2. CHECK TOKEN REGISTRATION SIGNATURES
    let userToken = request.headers.get("Authorization");
    
    // Look for browser session cookie strings
    if (!userToken) {
      const cookieHeader = request.headers.get("Cookie") || "";
      const matches = cookieHeader.match(/gatekeeper_token=([^;]+)/);
      if (matches) {
        userToken = `Bearer ${matches[1]}`;
      }
    }

    const EXPECTED_TOKEN = `Bearer ${env.AUTH_TOKEN}`;

    // 3. STEALTH DENIAL: If a user is not authorized, block them on ALL subdomains and paths
    if (!userToken || userToken !== EXPECTED_TOKEN) {
      return new Response("Not Found", { 
        status: 404, 
        headers: { "Content-Type": "text/plain" } 
      });
    }

    // =========================================================================
    // 4. AUTHORIZED USERS: Directory Masking Engine (Hides paths from URL)
    // =========================================================================
    
    // Even if they are authorized, if they try to type a path manually, mask it back to root
    if (path !== "/") {
      // Modify the request object in background memory to read your files internally
      // without updating the visitor's browser address tab bar.
      const rewrittenRequest = new Request(new URL("/", url.origin), request);
      return env.ASSETS.fetch(rewrittenRequest);
    }

    // Default: Serve the clean layout normally
    return env.ASSETS.fetch(request);
  }
};
