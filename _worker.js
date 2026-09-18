export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. HIDDEN PROXY HANDSHAKE: If code calls /api/verify, pipe it out to Render in total secrecy
    if (path === "/api/verify") {
      // ⚠️ TYPE YOUR PRIVATE RENDER LINK HERE ONCE (Hidden safely inside Cloudflare servers)
      const PRIVATE_SERVER_URL = "https://onrender.com";
      
      const modifiedRequest = new Request(PRIVATE_SERVER_URL, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      return fetch(modifiedRequest);
    }

    // 2. CHECK SESSION STATE
    const cookieHeader = request.headers.get("Cookie") || "";
    const hasValidCookie = cookieHeader.includes("gatekeeper_token=hello%20martin%20") || cookieHeader.includes("gatekeeper_token=hello martin ");

    if (hasValidCookie) {
      // Access Allowed
      return env.ASSETS.fetch(request);
    }

    // 3. SECURE COVER WALL FALLBACK
    const staticAsset = path.endsWith(".css") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".js");
    if (staticAsset) {
      return new Response("Not Found", { status: 404 });
    }

    // Default to main index gateway cover
    const gatewayRequest = new Request(new URL("/index.html", url.origin), request);
    return env.ASSETS.fetch(gatewayRequest);
  }
};
