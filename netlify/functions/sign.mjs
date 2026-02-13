// netlify/functions/sign.mjs
import { getStore } from "@netlify/blobs";

function clean(str, maxLen) {
  if (!str) return "";
  return String(str).trim().slice(0, maxLen);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "access-control-allow-origin": "*",
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const name = clean(body.name || body.display_name, 80);
    const msg  = clean(body.msg  || body.message, 120);

    if (!name) {
      return {
        statusCode: 400,
        headers: {
          "access-control-allow-origin": "*",
          "content-type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ error: "Name required" })
      };
    }

    const store = getStore("purim-signatures");
    const existing = await store.get("signatures", { type: "json" });
    const signatures = (existing && Array.isArray(existing.signatures)) ? existing.signatures : [];

    const dedupeKey = (name + "|" + msg).toLowerCase();
    const has = signatures.some(s => ((s.name||"") + "|" + (s.msg||"")).toLowerCase() === dedupeKey);

    if (!has) {
      signatures.unshift({ name, msg, ts: Date.now() });
      const capped = signatures.slice(0, 500);
      await store.set("signatures", { signatures: capped }, { type: "json" });
      return {
        statusCode: 200,
        headers: {
          "access-control-allow-origin": "*",
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store"
        },
        body: JSON.stringify({ ok: true, signatures: capped })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "access-control-allow-origin": "*",
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      },
      body: JSON.stringify({ ok: true, signatures })
    };
} catch (err) {
  return {
    statusCode: 500,
    headers: {
      "access-control-allow-origin": "*",
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify({
      error: "Server error",
      detail: String(err && (err.stack || err.message) || err)
    })
  };
}
