const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcXZzcWdlanN0b3JubXBlZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTgxOTMsImV4cCI6MjA5NDE3NDE5M30.FLSfexmg9G7NDhmlPBtA7Pewty5BWrrD332myGd8AlI"
const BASE = "https://lkqvsqgejstornmpeewv.supabase.co"

Deno.serve(async (req: Request) => {
  const cors = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  }
  if (req.method === "OPTIONS") return new Response(null, { headers: cors })

  const u = new URL(req.url)
  // Supabase strips /functions/v1/ before passing to the function
  // so pathname is /proxy/rest/v1/... -> we need /rest/v1/...
  let path = u.pathname.replace(/^\/proxy/, "") || "/"
  const sep = u.search ? "&" : "?"
  const target = `${BASE}${path}${u.search}${sep}apikey=${KEY}`

  try {
    const resp = await fetch(target, {
      method: req.method,
      headers: {
        "apikey": KEY,
        "authorization": req.headers.get("authorization") || `Bearer ${KEY}`,
        "content-type": req.headers.get("content-type") || "application/json",
        "prefer": req.headers.get("prefer") || "return=representation",
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined,
    })
    const text = await resp.text()
    return new Response(text, { status: resp.status, headers: cors })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors })
  }
})
