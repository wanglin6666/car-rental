Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const target = "https://lkqvsqgejstornmpeewv.supabase.co"
  // Strip /functions/v1/proxy prefix so we proxy to the right internal path
  let path = url.pathname.replace(/^\/functions\/v1\/proxy/, "") || "/"
  const proxyUrl = `${target}${path}${url.search}`

  const headers = new Headers()
  for (const [k, v] of req.headers.entries()) {
    if (k === "host") headers.set("host", new URL(target).host)
    else headers.set(k, v)
  }

  let body: BodyInit | null = null
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer()
  }

  const resp = await fetch(proxyUrl, { method: req.method, headers, body })

  return new Response(resp.body, {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
  })
})
