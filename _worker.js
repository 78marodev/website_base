export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. PUBLIC LINK EXCEPTION: Let anyone view the login page
    if (path === "/login" || path === "/login.html") {
      return env.ASSETS.fetch(request);
    }

    // 2. CHECK FOR VISITOR AUTHORIZATION
    // It checks both normal incoming api headers and browser local cookie tokens
    const userToken = request.headers.get("Authorization");
    const EXPECTED_TOKEN = `Bearer ${env.AUTH_TOKEN}`;

    // 3. STEALTH LAYER TRIGGER
    if (!userToken || userToken !== EXPECTED_TOKEN) {
      // If a regular user hits the site without a token header, show an invisible blank 404
      return new Response("Not Found", { 
        status: 404, 
        headers: { "Content-Type": "text/plain" } 
      });
    }

    // 4. PATH ROUTING PASSTHROUGH: Access granted!
    return env.ASSETS.fetch(request);
  }
};
