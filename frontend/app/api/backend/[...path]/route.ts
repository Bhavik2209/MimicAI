import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

async function proxy(request: Request, params: Promise<{ path: string[] }>) {
  if (!INTERNAL_API_KEY) {
    return NextResponse.json({ detail: "INTERNAL_API_KEY is not configured" }, { status: 500 })
  }

  const { data: session } = await auth.getSession()
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
  }

  const { path } = await params
  const targetUrl = new URL(`${BACKEND_URL.replace(/\/$/, "")}/${path.join("/")}`)
  const incomingUrl = new URL(request.url)
  targetUrl.search = incomingUrl.search

  const headers = new Headers(request.headers)
  headers.set("x-internal-api-key", INTERNAL_API_KEY)
  headers.set("x-authenticated-user-id", session.user.id)
  headers.set("x-authenticated-user-email", session.user.email)
  headers.delete("host")
  headers.delete("content-length")

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer()

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete("content-length")

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context.params)
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context.params)
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context.params)
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context.params)
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context.params)
}
