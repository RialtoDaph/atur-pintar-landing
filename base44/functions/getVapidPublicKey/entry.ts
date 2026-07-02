// Returns the VAPID public key so the browser can subscribe to push.
// Public info by design — the private key never leaves the server.

Deno.serve(async (req) => {
  try {
    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    if (!publicKey) {
      return Response.json({ error: "VAPID_PUBLIC_KEY not configured" }, { status: 500 });
    }
    return Response.json({ publicKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});