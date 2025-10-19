import { NextResponse } from "next/server"

const URL = process.env.DB_API_URL || "https://xokog41ing.execute-api.us-east-2.amazonaws.com/db"
const KEY = process.env.DB_API_KEY || "" // optional

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const upstream = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(KEY ? { "x-api-key": KEY } : {}),
      },
      body,
    })
    const txt = await upstream.text()
    const ct = upstream.headers.get("content-type") || "application/json"

    if (!upstream.ok) {
      console.error("[/api/db] upstream error", upstream.status, txt)
      return new NextResponse(txt || JSON.stringify({ error: "upstream_error" }), {
        status: upstream.status,
        headers: { "Content-Type": ct },
      })
    }
    return new NextResponse(txt, { status: 200, headers: { "Content-Type": ct } })
  } catch (e: any) {
    console.error("[/api/db] proxy failed:", e)
    return NextResponse.json({ error: "db_proxy_failed", detail: String(e?.message ?? e) }, { status: 502 })
  }
}
