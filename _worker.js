export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Get the authorization token sent by the visitor
    const userToken = request.headers.get("Authorization");
    const EXPECTED_TOKEN = `Bearer ${env.AUTH_TOKEN}`;

    // 2. GLOBAL SECURITY WALL: If the token is wrong or missing, hide everything!
    if (!userToken || userToken !== EXPECTED_TOKEN) {
      return new Response("Not Found", { 
        status: 404, 
        headers: { "Content-Type": "text/plain" } 
      });
    }

    // 3. ACCESS GRANTED: If the token matches, fetch and serve the real static file or asset requested
    return env.ASSETS.fetch(request);
  }
};
