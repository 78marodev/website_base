export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. PUBLIC ASSET PASSTHROUGH: Let the browser fetch your CSS and image files automatically
    const isStaticAsset = path.endsWith(".css") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".js");
    
    // 2. CHECK COOKIE SIGNATURES FOR CLEARANCE
    const cookieHeader = request.headers.get("Cookie") || "";
    const hasValidCookie = cookieHeader.includes("gatekeeper_token=hello%20martin%20") || cookieHeader.includes("gatekeeper_token=hello martin ");

    // 3. SECURE FILE ACCESS ROUTING MATRIX
    if (hasValidCookie) {
      // ACCESS GRANTED: Serve any asset or sub-path internally while masking the browser URL bar!
      return env.ASSETS.fetch(request);
    } else {
      // ACCESS DENIED: Fallback mode for unauthenticated users
      
      // Let them view your public login page so they can type their passcode
      if (path === "/login" || path === "/login.html") {
        return env.ASSETS.fetch(request);
      }

      // If they are trying to request an explicit asset (like your logo) directly without auth, return 404
      if (isStaticAsset) {
        return new Response("Not Found", { status: 404 });
      }

      // Force any other path or subfolder back onto your clean root login gateway layout screen
      const loginFormRequest = new Request(new URL("/login.html", url.origin), request);
      return env.ASSETS.fetch(loginFormRequest);
    }
  }
};
