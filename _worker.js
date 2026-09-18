export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. PUBLIC EXCEPTION: Allow the login form to load publicly
    if (path === "/login" || path === "/login.html") {
      return env.ASSETS.fetch(request);
    }

    // 2. TOKEN DETECTION: Look for standard headers OR browser cookies
    let userToken = request.headers.get("Authorization");
    
    // If no header is present, check if a cookie was sent from a previous login session
    if (!userToken) {
      const cookieHeader = request.headers.get("Cookie") || "";
      const matches = cookieHeader.match(/gatekeeper_token=([^;]+)/);
      if (matches) {
        userToken = `Bearer ${matches[1]}`;
      }
    }

    const EXPECTED_TOKEN = `Bearer ${env.AUTH_TOKEN}`;

    // 3. GLOBAL STEALTH TRIGGER: If token fails or is missing, return a dead 404
    if (!userToken || userToken !== EXPECTED_TOKEN) {
      return new Response("Not Found", { 
        status: 404, 
        headers: { "Content-Type": "text/plain" } 
      });
    }

    // 4. PASSTHROUGH GRANTED: Serve the file or image requested
    return env.ASSETS.fetch(request);
  }
};
